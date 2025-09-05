import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Play, Download, Upload, Brain, Sparkles, AlertTriangle, CheckCircle, XCircle, X } from "lucide-react";
import { useEditorContext } from "@/contexts/EditorContext";
import { useContextualAI } from "@/hooks/useContextualAI";
import type { ProjectFile, Project } from "@shared/schema";

interface CodeEditorProps {
  file: ProjectFile | null;
  onFileChange: (fileId: number, content: string) => Promise<void>;
  project: Project | null;
}

export default function CodeEditor({ file, onFileChange, project }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use editor context for state management
  const {
    currentFile,
    currentProject,
    fileContent,
    isDirty,
    cursorPosition,
    setCurrentFile,
    setCurrentProject,
    updateFileContent,
    setCursorPosition,
    setDirty,
    getFileLanguage,
    getCurrentLine,
    getFileContext
  } = useEditorContext();
  
  // Use contextual AI for real-time suggestions
  const {
    suggestions,
    isAnalyzing,
    dismissSuggestion,
    applySuggestionFix,
    hasHighSeverity,
    suggestionCount
  } = useContextualAI();

  // Sync props with context when they change
  useEffect(() => {
    setCurrentFile(file);
  }, [file, setCurrentFile]);
  
  useEffect(() => {
    setCurrentProject(project);
  }, [project, setCurrentProject]);

  const handleContentChange = (newContent: string) => {
    updateFileContent(newContent);
    
    // Update cursor position based on textarea
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const text = textarea.value;
      const selectionStart = textarea.selectionStart;
      
      // Calculate line and column from cursor position
      const lines = text.substring(0, selectionStart).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      
      setCursorPosition({ line, column });
    }
  };
  
  const handleCursorChange = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const text = textarea.value;
      const selectionStart = textarea.selectionStart;
      
      // Calculate line and column from cursor position
      const lines = text.substring(0, selectionStart).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      
      setCursorPosition({ line, column });
    }
  };

  const handleSave = async () => {
    if (!currentFile || !isDirty) return;
    
    setIsLoading(true);
    try {
      await onFileChange(currentFile.id, fileContent);
      setDirty(false);
    } catch (error) {
      console.error("Failed to save file:", error);
    } finally {
      setIsLoading(false);
    }
  };
  


  const renderCodeWithSyntaxHighlighting = (code: string, language: string) => {
    // Simple syntax highlighting for demo purposes
    // In production, this would be replaced with Monaco Editor
    const lines = code.split('\n');
    
    return lines.map((line, index) => {
      let highlightedLine = line;
      
      // Simple keyword highlighting
      if (language === 'typescript' || language === 'javascript') {
        highlightedLine = line
          .replace(/\b(import|export|from|const|let|var|function|class|interface|type)\b/g, 
                  '<span class="text-blue-600 dark:text-blue-400">$1</span>')
          .replace(/\b(React|useState|useEffect|return)\b/g, 
                  '<span class="text-purple-600 dark:text-purple-400">$1</span>')
          .replace(/'([^']*)'/g, '<span class="text-green-600 dark:text-green-400">\'$1\'</span>')
          .replace(/"([^"]*)"/g, '<span class="text-green-600 dark:text-green-400">"$1"</span>')
          .replace(/\/\/.*$/g, '<span class="text-gray-500 dark:text-gray-400">$&</span>');
      }
      
      return (
        <div key={index} className="flex">
          <div className="text-muted-foreground text-right pr-4 select-none w-12 font-mono text-sm">
            {index + 1}
          </div>
          <div 
            className="flex-1 font-mono text-sm"
            dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }}
          />
        </div>
      );
    });
  };

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 opacity-50">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No file selected</h3>
          <p className="text-sm">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  const language = getFileLanguage();

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2 bg-card border-b border-border">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {language.toUpperCase()}
          </Badge>
          {currentFile.version && currentFile.version > 1 && (
            <Badge variant="secondary" className="text-xs">
              v{currentFile.version}
            </Badge>
          )}
          {isDirty && (
            <Badge variant="destructive" className="text-xs">
              Unsaved
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* AI Analysis Indicator */}
          {isAnalyzing && (
            <Badge variant="outline" className="text-xs animate-pulse">
              <Brain className="h-3 w-3 mr-1" />
              Analyzing...
            </Badge>
          )}
          {suggestionCount > 0 && (
            <Badge variant={hasHighSeverity ? "destructive" : "secondary"} className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {suggestionCount} suggestions
            </Badge>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={!isDirty || isLoading}
            className="text-xs"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="ghost" className="text-xs">
            <Play className="h-3 w-3 mr-1" />
            Run
          </Button>
          <Button size="sm" variant="ghost" className="text-xs">
            <Download className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="text-xs">
            <Upload className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="min-h-full">
          {/* Mock Monaco Editor */}
          <div ref={editorRef} className="font-mono text-sm">
            <textarea
              ref={textareaRef}
              value={fileContent}
              onChange={(e) => handleContentChange(e.target.value)}
              onSelect={handleCursorChange}
              onKeyUp={handleCursorChange}
              onClick={handleCursorChange}
              className="w-full h-96 bg-transparent border-none outline-none resize-none font-mono text-sm"
              placeholder="Start typing your code..."
              spellCheck={false}
            />
          </div>
          
          {/* Advanced AI Suggestions Panel */}
          {suggestions.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>AI Code Analysis</span>
                </h4>
                <Badge variant="outline" className="text-xs">
                  {suggestionCount} suggestions
                </Badge>
              </div>
              
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className={`p-3 rounded-lg border ${
                  suggestion.severity === 'high' 
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                    : suggestion.severity === 'medium'
                    ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {suggestion.severity === 'high' && <XCircle className="w-4 h-4 text-red-500" />}
                        {suggestion.severity === 'medium' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                        {suggestion.severity === 'low' && <CheckCircle className="w-4 h-4 text-blue-500" />}
                        <Badge variant="outline" className="text-xs capitalize">
                          {suggestion.type}
                        </Badge>
                        {suggestion.line && (
                          <Badge variant="outline" className="text-xs">
                            Line {suggestion.line}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${
                        suggestion.severity === 'high' 
                          ? 'text-red-700 dark:text-red-300'
                          : suggestion.severity === 'medium'
                          ? 'text-yellow-700 dark:text-yellow-300'
                          : 'text-blue-700 dark:text-blue-300'
                      }`}>
                        {suggestion.message}
                      </p>
                      {suggestion.fix && (
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applySuggestionFix(suggestion)}
                            className="text-xs"
                          >
                            Apply Fix
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="p-1 h-auto text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Context Indicator */}
          {currentProject?.consciousnessEnabled && (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Context Awareness Active
                </span>
                {isAnalyzing && (
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
                <div>Language: {language}</div>
                <div>Line: {cursorPosition.line}, Column: {cursorPosition.column}</div>
                <div>Current Line: {getCurrentLine().trim() || '(empty)'}</div>
                {suggestionCount > 0 && (
                  <div>AI Suggestions: {suggestionCount} active</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
          <span>{fileContent.length} characters</span>
          {isAnalyzing && <span className="text-blue-500">• Analyzing...</span>}
          <span>{language}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>UTF-8</span>
          <span>LF</span>
          {isLoading && <span>Saving...</span>}
        </div>
      </div>
    </div>
  );
}
