import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Square, RefreshCw, FileText, Zap, FileCode, Code } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { ScrollArea } from './scroll-area';
import { AIProviderService } from '@/services/aiProviders';
import { useEditorContextSubscription } from '@/contexts/EditorContext';

interface TerminalProps {
  projectId?: number;
  className?: string;
}

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

export function TerminalComponent({ projectId, className }: TerminalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [command, setCommand] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'info',
      content: '🚀 Terminal Jarvis Interface Ready',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'info', 
      content: 'Type commands or use quick actions below',
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'info',
      content: '─'.repeat(50),
      timestamp: new Date()
    }
  ]);
  
  // Subscribe to editor context changes
  const editorContext = useEditorContextSubscription((ctx) => {
    if (ctx.file) {
      addLine('info', `📁 Context updated: Working on ${ctx.file.filePath} (${ctx.language})`);
    }
  });
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new lines are added
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [lines]);

  const addLine = (type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
  };

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    
    setIsRunning(true);
    addLine('command', `$ ${cmd}`);
    
    // Add context information to the command if file is open
    let contextualCommand = cmd;
    if (editorContext.file) {
      contextualCommand = `Context: Working on ${editorContext.file.filePath} (${editorContext.language}, ${editorContext.lineCount} lines). Command: ${cmd}`;
    }
    
    try {
      const response = await AIProviderService.chat(contextualCommand, 'terminal-jarvis', projectId);
      addLine('output', response.response);
    } catch (error: any) {
      addLine('error', `Error: ${error.message}`);
    } finally {
      setIsRunning(false);
      addLine('info', '─'.repeat(50));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && !isRunning) {
      executeCommand(command);
      setCommand('');
    }
  };

  const clearTerminal = () => {
    setLines([
      {
        id: Date.now().toString(),
        type: 'info',
        content: '🚀 Terminal Jarvis Interface Cleared',
        timestamp: new Date()
      }
    ]);
  };

  const quickCommands = [
    { label: 'List Tools', command: 'list all available AI tools', icon: FileText },
    { label: 'Install Claude', command: 'install claude for code assistance', icon: Play },
    { label: 'Analyze Current File', command: editorContext.file ? `analyze file ${editorContext.file.filePath}` : 'no file selected', icon: FileCode },
    { label: 'Code Review', command: editorContext.file ? `review code in ${editorContext.file.filePath}` : 'no file selected', icon: Code },
    { label: 'Install Gemini', command: 'install gemini CLI tool', icon: Play },
    { label: 'Tool Status', command: 'show status of all installed tools', icon: RefreshCw },
    { label: 'Claude Help', command: 'get information about claude capabilities', icon: Zap },
    { label: 'Interactive Mode', command: 'launch interactive terminal-jarvis interface', icon: Terminal }
  ];

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-green-400 dark:text-green-300';
      case 'error':
        return 'text-red-400 dark:text-red-300';
      case 'info':
        return 'text-blue-400 dark:text-blue-300';
      case 'output':
      default:
        return 'text-gray-300 dark:text-gray-400';
    }
  };

  return (
    <Card className={`bg-gray-900 border-green-500/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-green-400" />
            <CardTitle className="text-green-400">Terminal Jarvis</CardTitle>
            <Badge variant="outline" className="border-orange-500/50 text-orange-400">
              CLI Master
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={clearTerminal}
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              Clear
            </Button>
            {isRunning && (
              <div className="flex items-center gap-2 text-yellow-400">
                <Square className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Running...</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Commands - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickCommands.map((cmd) => {
            const IconComponent = cmd.icon;
            return (
              <Button
                key={cmd.label}
                size="sm"
                variant="outline"
                onClick={() => executeCommand(cmd.command)}
                disabled={isRunning}
                className="justify-start gap-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-green-400 hover:border-green-500/50 text-xs sm:text-sm"
              >
                <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{cmd.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Terminal Output - Mobile Optimized */}
        <ScrollArea ref={scrollAreaRef} className="h-60 sm:h-80 w-full border border-gray-700 rounded-md p-2 sm:p-3 bg-black font-mono text-xs sm:text-sm">
          <div className="space-y-1">
            {lines.map((line) => (
              <div key={line.id} className={`${getLineColor(line.type)} whitespace-pre-wrap break-words`}>
                {line.content}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Command Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400">$</span>
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter command..."
              disabled={isRunning}
              className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-500 font-mono text-xs sm:text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={isRunning || !command.trim()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Help Text - Mobile Optimized */}
        <div className="text-xs text-gray-500 space-y-1 hidden sm:block">
          <p>💡 Example commands:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>"list all available AI tools"</li>
            <li>"install claude for code assistance"</li>
            <li>"run gemini to analyze this project"</li>
            <li>"get information about qwen capabilities"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default TerminalComponent;