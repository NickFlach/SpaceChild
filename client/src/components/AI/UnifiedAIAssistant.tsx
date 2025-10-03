import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Bot,
  User,
  Send,
  Loader2,
  FileCode,
  Globe,
  Zap,
  Brain,
  Shield,
  Rocket,
  Code,
  Sparkles,
  Terminal as TerminalIcon,
  Lock,
  AtomIcon,
  Search,
  Users,
  ChevronDown,
  Command,
  Settings,
} from "lucide-react";
import { useEditorContextSubscription } from "@/contexts/EditorContext";
import type { Project } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  provider?: string;
  tokensUsed?: number;
  mode?: string;
  contextType?: string;
}

interface UnifiedAIAssistantProps {
  project: Project | null;
}

type AIMode = "jarvis" | "developer" | "architect" | "security" | "ops" | "normal";

const AI_MODES = {
  jarvis: {
    name: "Jarvis",
    icon: Sparkles,
    description: "Proactive AI assistant that anticipates your needs",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  developer: {
    name: "Developer",
    icon: Code,
    description: "Code-focused assistance with debugging and best practices",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  architect: {
    name: "Architect",
    icon: Brain,
    description: "System design and architecture guidance",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  security: {
    name: "Security",
    icon: Shield,
    description: "Security analysis and vulnerability detection",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  ops: {
    name: "DevOps",
    icon: Rocket,
    description: "Deployment, infrastructure, and operations",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  normal: {
    name: "Assistant",
    icon: Bot,
    description: "General purpose AI assistant",
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
  },
};

const QUICK_COMMANDS = [
  { cmd: "/deploy", desc: "Deploy project", icon: Rocket },
  { cmd: "/analyze", desc: "Analyze code quality", icon: Brain },
  { cmd: "/security", desc: "Security audit", icon: Shield },
  { cmd: "/agents", desc: "Multi-agent collaboration", icon: Users },
  { cmd: "/crypto", desc: "Cryptography tools", icon: Lock },
  { cmd: "/quantum", desc: "Quantum algorithms", icon: AtomIcon },
  { cmd: "/terminal", desc: "Execute command", icon: TerminalIcon },
  { cmd: "/search", desc: "Search Replit", icon: Search },
  { cmd: "/template", desc: "Create from template", icon: FileCode },
  { cmd: "/mode", desc: "Switch AI mode", icon: Zap },
];

export default function UnifiedAIAssistant({ project }: UnifiedAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<AIMode>("normal");
  const [showCommands, setShowCommands] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [autoMemoryEnabled, setAutoMemoryEnabled] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Subscribe to editor context changes
  const editorContext = useEditorContextSubscription((ctx) => {
    // Context automatically tracked
  });

  // Background memory system - auto-saves important context
  useEffect(() => {
    if (!autoMemoryEnabled || !project) return;

    const saveMemoryContext = async () => {
      if (editorContext.file && messages.length > 0) {
        try {
          await apiRequest("POST", "/api/memory/auto-save", {
            projectId: project.id,
            context: {
              file: editorContext.file.filePath,
              language: editorContext.language,
              recentMessages: messages.slice(-5),
              mode,
            },
          });
        } catch (error) {
          // Silent failure - memory is background process
        }
      }
    };

    const interval = setInterval(saveMemoryContext, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [autoMemoryEnabled, project, editorContext.file, messages, mode]);

  // Background consciousness monitoring
  const { data: consciousnessState } = useQuery({
    queryKey: ["/api/consciousness/state", project?.id],
    queryFn: async () => {
      if (!project?.consciousnessEnabled) return null;
      const response = await apiRequest("GET", `/api/consciousness/state/${project.id}`);
      return response.json();
    },
    refetchInterval: project?.consciousnessEnabled ? 5000 : false,
    enabled: !!project?.consciousnessEnabled,
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      // Detect command mode
      if (message.startsWith("/")) {
        return handleCommand(message);
      }

      // Build enhanced context based on mode
      const enhancedContext = {
        message,
        mode,
        projectId: project?.id,
        enableWebSearch,
        fileContext: editorContext.file
          ? {
              filePath: editorContext.file.filePath,
              language: editorContext.language,
              currentLine: editorContext.currentLine.trim(),
              lineNumber: editorContext.cursorPosition.line,
            }
          : null,
        consciousnessState: consciousnessState,
        autoMemory: autoMemoryEnabled,
      };

      const response = await apiRequest("POST", "/api/ai/unified-chat", enhancedContext);
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString() + "-assistant",
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        provider: data.provider,
        tokensUsed: data.tokensUsed,
        mode,
        contextType: data.contextType,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      queryClient.invalidateQueries({ queryKey: ["/api/ai/usage"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCommand = async (command: string) => {
    const parts = command.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    // Add system message showing command execution
    const systemMessage: Message = {
      id: Date.now().toString() + "-system",
      role: "system",
      content: `Executing command: ${cmd}...`,
      timestamp: new Date(),
      contextType: "command",
    };
    setMessages((prev) => [...prev, systemMessage]);

    // Route to appropriate handler
    switch (cmd) {
      case "/mode":
        return handleModeSwitch(args);
      case "/deploy":
        return handleDeployCommand(args);
      case "/analyze":
        return handleAnalyzeCommand(args);
      case "/security":
        return handleSecurityCommand(args);
      case "/agents":
        return handleAgentsCommand(args);
      case "/crypto":
        return handleCryptoCommand(args);
      case "/quantum":
        return handleQuantumCommand(args);
      case "/terminal":
        return handleTerminalCommand(args);
      case "/search":
        return handleSearchCommand(args);
      case "/template":
        return handleTemplateCommand(args);
      default:
        return {
          response: `Unknown command: ${cmd}. Type /help for available commands.`,
          provider: "system",
        };
    }
  };

  const handleModeSwitch = (modeName: string) => {
    const newMode = modeName.toLowerCase() as AIMode;
    if (AI_MODES[newMode]) {
      setMode(newMode);
      return {
        response: `Switched to ${AI_MODES[newMode].name} mode. ${AI_MODES[newMode].description}`,
        provider: "system",
      };
    }
    return {
      response: `Unknown mode. Available modes: ${Object.keys(AI_MODES).join(", ")}`,
      provider: "system",
    };
  };

  const handleDeployCommand = async (args: string) => {
    const response = await apiRequest("POST", "/api/deployment/quick-deploy", {
      projectId: project?.id,
      args,
    });
    return response.json();
  };

  const handleAnalyzeCommand = async (args: string) => {
    const response = await apiRequest("POST", "/api/superintelligence/analyze", {
      projectId: project?.id,
      fileId: editorContext.file?.id,
      focus: args || "quality",
    });
    return response.json();
  };

  const handleSecurityCommand = async (args: string) => {
    const response = await apiRequest("POST", "/api/superintelligence/security-scan", {
      projectId: project?.id,
      fileId: editorContext.file?.id,
    });
    return response.json();
  };

  const handleAgentsCommand = async (args: string) => {
    const response = await apiRequest("POST", "/api/multiagent/quick-task", {
      projectId: project?.id,
      task: args,
    });
    return response.json();
  };

  const handleCryptoCommand = async (args: string) => {
    return {
      response: `Crypto tools: Available algorithms include DivMod operations, post-quantum cryptography. What would you like to explore?`,
      provider: "system",
      contextType: "crypto",
    };
  };

  const handleQuantumCommand = async (args: string) => {
    return {
      response: `Quantum computing tools: Quantum algorithms, simulation, and post-quantum security. What would you like to work on?`,
      provider: "system",
      contextType: "quantum",
    };
  };

  const handleTerminalCommand = async (args: string) => {
    const response = await apiRequest("POST", "/api/terminal/execute", {
      projectId: project?.id,
      command: args,
    });
    return response.json();
  };

  const handleSearchCommand = async (args: string) => {
    const response = await apiRequest("GET", `/api/replit/search?q=${encodeURIComponent(args)}`);
    return response.json();
  };

  const handleTemplateCommand = async (args: string) => {
    return {
      response: `Template creation: I can help you create a project from templates. What type of project would you like to create?`,
      provider: "system",
      contextType: "template",
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput("");
    setShowCommands(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setShowCommands(value.startsWith("/") && value.length > 1);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatMutation.isPending) {
      setTimeout(scrollToBottom, 100);
    }
  }, [chatMutation.isPending]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const currentModeConfig = AI_MODES[mode];
  const ModeIcon = currentModeConfig.icon;

  const filteredCommands = showCommands
    ? QUICK_COMMANDS.filter((cmd) => cmd.cmd.startsWith(input.toLowerCase()))
    : [];

  return (
    <div className="h-full flex flex-col overflow-hidden min-h-0 relative">
      {/* Mode Header */}
      <div className="border-b border-border bg-gradient-to-r from-background to-accent/5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`${currentModeConfig.bgColor} ${currentModeConfig.color} border-current/20 hover:border-current/40`}
                >
                  <ModeIcon className="w-4 h-4 mr-2" />
                  <span className="font-medium">{currentModeConfig.name}</span>
                  <ChevronDown className="w-3 h-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>AI Modes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(AI_MODES).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setMode(key as AIMode)}
                      className={mode === key ? "bg-accent" : ""}
                    >
                      <Icon className={`w-4 h-4 mr-2 ${config.color}`} />
                      <div>
                        <div className="font-medium">{config.name}</div>
                        <div className="text-xs text-muted-foreground">{config.description}</div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {editorContext.file && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <FileCode className="w-3 h-3" />
                <span>{editorContext.file.filePath}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEnableWebSearch(!enableWebSearch)}
                    className={enableWebSearch ? "text-cyan-500" : ""}
                  >
                    <Globe className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{enableWebSearch ? "Disable" : "Enable"} web search</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAutoMemoryEnabled(!autoMemoryEnabled)}
                    className={autoMemoryEnabled ? "text-purple-500" : ""}
                  >
                    <Brain className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Auto-memory is {autoMemoryEnabled ? "enabled" : "disabled"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {project?.consciousnessEnabled && consciousnessState && (
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Φ: {consciousnessState.phi?.toFixed(2) || "0.00"}
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Command className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Quick Commands</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {QUICK_COMMANDS.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <DropdownMenuItem
                      key={cmd.cmd}
                      onClick={() => {
                        setInput(cmd.cmd + " ");
                        document.querySelector<HTMLTextAreaElement>("textarea")?.focus();
                      }}
                    >
                      <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
                      <div className="flex-1">
                        <span className="font-mono text-xs">{cmd.cmd}</span>
                        <div className="text-xs text-muted-foreground">{cmd.desc}</div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full w-full">
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="min-h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground py-8 max-w-md">
                  <ModeIcon className={`h-12 w-12 mx-auto mb-4 ${currentModeConfig.color}`} />
                  <h3 className="font-medium mb-2">{currentModeConfig.name} Mode Active</h3>
                  <p className="text-sm mb-4">{currentModeConfig.description}</p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Quick tips:</p>
                    <p>• Type <code className="bg-accent px-1 rounded">/</code> for commands</p>
                    <p>• Memory saves automatically every 30s</p>
                    <p>• Context-aware based on your current file</p>
                  </div>
                  {project?.consciousnessEnabled && (
                    <Badge className="mt-4 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                      Consciousness Active
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex space-x-3 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <ModeIcon className="h-4 w-4 text-white" />
                      </div>
                    )}

                    {message.role === "system" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Command className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div className={`flex-1 ${message.role === "user" ? "max-w-xs" : "max-w-4xl"}`}>
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : message.role === "system"
                            ? "bg-accent border border-border"
                            : "bg-card border border-border"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <div
                        className={`flex items-center mt-1 text-xs text-muted-foreground ${
                          message.role === "user" ? "justify-end" : ""
                        }`}
                      >
                        <span>
                          {message.mode && message.role !== "user" ? `${AI_MODES[message.mode as AIMode]?.name} • ` : ""}
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.tokensUsed && <span className="ml-2">• {message.tokensUsed} tokens</span>}
                        {message.contextType && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {message.contextType}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {chatMutation.isPending && (
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <ModeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-card border border-border rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Command Suggestions */}
      {showCommands && filteredCommands.length > 0 && (
        <div className="absolute bottom-24 left-4 right-4 bg-card border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {filteredCommands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.cmd}
                className="w-full flex items-center space-x-3 p-3 hover:bg-accent text-left transition-colors"
                onClick={() => {
                  setInput(cmd.cmd + " ");
                  setShowCommands(false);
                  document.querySelector<HTMLTextAreaElement>("textarea")?.focus();
                }}
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-mono text-sm">{cmd.cmd}</div>
                  <div className="text-xs text-muted-foreground">{cmd.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Chat Input */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={
                  mode === "jarvis"
                    ? "How may I assist you, sir?"
                    : `Ask ${currentModeConfig.name} AI... (or type / for commands)`
                }
                className="resize-none min-h-[60px] max-h-[120px]"
                rows={2}
                disabled={chatMutation.isPending}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                className="self-end"
                size="sm"
              >
                {chatMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
              {messages.length > 0 && (
                <Button
                  onClick={scrollToBottom}
                  variant="outline"
                  size="sm"
                  className="self-end opacity-60 hover:opacity-100"
                  title="Scroll to bottom"
                >
                  ↓
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span className="flex items-center space-x-2">
              <span>Mode: {currentModeConfig.name}</span>
              {autoMemoryEnabled && (
                <>
                  <span>•</span>
                  <span className="flex items-center">
                    <Brain className="w-3 h-3 mr-1" />
                    Auto-memory active
                  </span>
                </>
              )}
            </span>
            <span>Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
