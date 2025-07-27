import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Bot, User, Paperclip, Mic, Send, Loader2 } from "lucide-react";
import type { Project } from "@shared/schema";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
  tokensUsed?: number;
}

interface ChatInterfaceProps {
  project: Project | null;
}

export default function ChatInterface({ project }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        provider,
        projectId: project?.id,
      });
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
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Invalidate usage queries to update token counts
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

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "spaceagent":
        return <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />;
      case "mindsphere":
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

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

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Start a conversation</h3>
              <p className="text-sm">
                Ask me anything about your code, architecture, or need help with development.
              </p>
              {project?.consciousnessEnabled && (
                <Badge className="mt-2 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                  Consciousness Active
                </Badge>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex space-x-3 ${message.role === "user" ? "justify-end" : ""}`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {getProviderIcon(message.provider || "anthropic")}
                  </div>
                )}
                
                <div className={`flex-1 ${message.role === "user" ? "max-w-xs" : ""}`}>
                  <div className={`rounded-lg p-3 ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground ml-auto" 
                      : "bg-card border border-border"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className={`flex items-center mt-1 text-xs text-muted-foreground ${
                    message.role === "user" ? "justify-end" : ""
                  }`}>
                    <span>
                      {message.provider && message.role === "assistant" 
                        ? `${message.provider} • ` 
                        : ""
                      }
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.tokensUsed && (
                      <span className="ml-2">• {message.tokensUsed} tokens</span>
                    )}
                  </div>
                </div>
                
                {message.role === "user" && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {chatMutation.isPending && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-card border border-border rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Chat Input */}
      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                project?.consciousnessEnabled 
                  ? "Ask AI with full project context awareness..."
                  : "Ask AI to help with your code..."
              }
              className="resize-none pr-20"
              rows={3}
              disabled={chatMutation.isPending}
            />
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                disabled={chatMutation.isPending}
              >
                <Paperclip className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                disabled={chatMutation.isPending}
              >
                <Mic className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="self-end"
          >
            {chatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>
            Context: {project ? `${project.name} + current file` : "No project"}
          </span>
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
