import { useState, useEffect } from 'react';
import { GitHubFile } from '@/services/github';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Code, Copy, Check, Download, Save, GitBranch, GitCommit, GitPullRequest } from 'lucide-react';
import { SimpleCodeBlock } from '@/components/Common/SimpleCodeBlock';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface GitHubFileViewerProps {
  file: GitHubFile | null;
  content: string;
  className?: string;
  onSave?: (content: string) => Promise<void>;
  isSaving?: boolean;
}

export function GitHubFileViewer({ 
  file, 
  content, 
  className, 
  onSave, 
  isSaving = false 
}: GitHubFileViewerProps) {
  const { theme } = useTheme();
  const [localContent, setLocalContent] = useState(content);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  
  // Update local content when the prop changes
  useEffect(() => {
    setLocalContent(content);
    setIsDirty(false);
    setIsEditing(false);
  }, [content, file?.sha]);
  
  // Get file extension for syntax highlighting
  const fileExtension = file?.name.split('.').pop()?.toLowerCase() || '';
  const language = getLanguageFromExtension(fileExtension);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(localContent);
    setIsCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleDownload = () => {
    if (!file) return;
    
    const blob = new Blob([localContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleSave = async () => {
    if (!onSave || !isDirty) return;
    
    try {
      await onSave(localContent);
      setIsDirty(false);
      toast.success('File saved successfully');
    } catch (error) {
      console.error('Failed to save file:', error);
      toast.error('Failed to save file');
    }
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    if (!isDirty) {
      setIsDirty(true);
    }
  };
  
  const toggleEdit = () => {
    if (isEditing && isDirty) {
      // If we're exiting edit mode with unsaved changes, confirm
      if (confirm('You have unsaved changes. Discard changes?')) {
        setLocalContent(content);
        setIsDirty(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(!isEditing);
    }
  };
  
  const renderFileContent = () => {
    if (!file) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a file to view its content
        </div>
      );
    }
    
    if (!localContent) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Empty file
        </div>
      );
    }
    
    // Use SimpleCodeBlock for all text content
    return (
      <SimpleCodeBlock 
        code={localContent} 
        language={language}
        className="h-full"
      />
    );
  };
  
  return (
    <div className={cn("flex flex-col h-full border rounded-md overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b bg-muted/50 flex items-center justify-between p-2">
        <div className="flex items-center space-x-2 overflow-hidden">
          <Code className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="truncate text-sm font-medium">
            {file?.name || 'No file selected'}
          </div>
          
          {file && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0 ml-2">
              <span className="px-1.5 py-0.5 bg-muted rounded">{language || 'text'}</span>
              <span>•</span>
              <span>{formatFileSize(file.size)}</span>
              {file.sha && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[120px]" title={file.sha}>
                    {file.sha.substring(0, 7)}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {file && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleDownload}
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {onSave && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={toggleEdit}
                  disabled={isSaving}
                  title={isEditing ? 'Cancel edit' : 'Edit file'}
                >
                  {isEditing ? (
                    <GitCommit className="h-4 w-4" />
                  ) : (
                    <GitBranch className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              {isEditing && onSave && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-8 ml-1"
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save changes
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1 bg-background">
        {renderFileContent()}
      </ScrollArea>
      
      {/* Status bar */}
      {file && (
        <div className="border-t px-3 py-1.5 text-xs text-muted-foreground flex justify-between items-center">
          <div>
            {isDirty && (
              <span className="text-amber-500">
                • Modified
              </span>
            )}
          </div>
          <div>
            {file.html_url && (
              <a 
                href={file.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground hover:underline"
              >
                View on GitHub
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get language from file extension
function getLanguageFromExtension(extension: string): string {
  const languageMap: Record<string, string> = {
    // Common programming languages
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rb': 'ruby',
    'php': 'php',
    'swift': 'swift',
    'kt': 'kotlin',
    'rs': 'rust',
    'scala': 'scala',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'ps1': 'powershell',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'less': 'less',
    'md': 'markdown',
    'sql': 'sql',
    'graphql': 'graphql',
    'dockerfile': 'dockerfile',
    'toml': 'toml',
    'ini': 'ini',
    'env': 'ini',
    'gitignore': 'git',
    'dockerignore': 'dockerfile',
    'editorconfig': 'editorconfig',
    'babelrc': 'json',
    'eslintrc': 'json',
    'prettierrc': 'json',
    'npmignore': 'git',
    'npmrc': 'ini',
    'yarnrc': 'ini',
    'lock': 'json',
    'log': 'log',
  };
  
  return languageMap[extension.toLowerCase()] || '';
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
