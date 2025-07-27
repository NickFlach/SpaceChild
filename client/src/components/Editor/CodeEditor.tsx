import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Play, Download, Upload } from "lucide-react";
import type { ProjectFile, Project } from "@shared/schema";

interface CodeEditorProps {
  file: ProjectFile | null;
  onFileChange: (fileId: number, content: string) => Promise<void>;
  project: Project | null;
}

export default function CodeEditor({ file, onFileChange, project }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (file) {
      setContent(file.content || "");
      setIsDirty(false);
    }
  }, [file]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(file?.content !== newContent);
  };

  const handleSave = async () => {
    if (!file || !isDirty) return;
    
    setIsLoading(true);
    try {
      await onFileChange(file.id, content);
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageFromFile = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx': return 'typescript';
      case 'ts': return 'typescript';
      case 'jsx': return 'javascript';
      case 'js': return 'javascript';
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'text';
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

  if (!file) {
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

  const language = getLanguageFromFile(file.filePath);

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2 bg-card border-b border-border">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {language.toUpperCase()}
          </Badge>
          {file.version > 1 && (
            <Badge variant="secondary" className="text-xs">
              v{file.version}
            </Badge>
          )}
          {isDirty && (
            <Badge variant="destructive" className="text-xs">
              Unsaved
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
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
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-96 bg-transparent border-none outline-none resize-none font-mono text-sm"
              placeholder="Start typing your code..."
              spellCheck={false}
            />
          </div>
          
          {/* AI Suggestions Panel */}
          {project?.consciousnessEnabled && (
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  AI Consciousness Suggestion
                </span>
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Consider using React.memo() for this component to optimize re-renders based on your project patterns.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Ln {content.split('\n').length}, Col 1</span>
          <span>{content.length} characters</span>
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
