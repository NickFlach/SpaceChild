import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitHubRepo, GitHubFile } from '@/services/github';
import { GitHubRepoBrowser } from './GitHubRepoBrowser';
import { GitHubFileViewer } from './GitHubFileViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GitBranch, GitPullRequest, GitCommit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GitHubIntegrationPanelProps {
  className?: string;
}

export function GitHubIntegrationPanel({ className }: GitHubIntegrationPanelProps) {
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [activeTab, setActiveTab] = useState('browser');
  const [isSaving, setIsSaving] = useState(false);

  const handleFileSelect = useCallback((file: GitHubFile, content: string) => {
    setSelectedFile(file);
    setFileContent(content);
    setActiveTab('editor');
  }, []);  

  const handleRepoSelect = useCallback((repo: GitHubRepo) => {
    setSelectedRepo(repo);
  }, []);

  const handleSaveFile = async (content: string) => {
    if (!selectedFile || !selectedRepo) return;
    
    setIsSaving(true);
    try {
      // In a real implementation, you would call the GitHub API to save the file
      // await saveFileToGitHub(selectedRepo, selectedFile, content, 'Update file');
      
      // For now, just update the local state
      setFileContent(content);
      toast.success('File saved successfully');
    } catch (error) {
      console.error('Failed to save file:', error);
      toast.error('Failed to save file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePullRequest = async () => {
    if (!selectedRepo || !selectedFile) return;
    
    try {
      // In a real implementation, you would create a new branch, commit changes, and open a PR
      // await createPullRequest(selectedRepo, 'feature/update-file', 'main', 'Update file', 'Update file content');
      
      toast.success('Pull request created successfully');
    } catch (error) {
      console.error('Failed to create pull request:', error);
      toast.error('Failed to create pull request');
    }
  };

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <div className="border-b px-4 py-2 flex items-center justify-between">
          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger 
              value="browser" 
              className="relative px-3 py-1.5 text-sm font-medium"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Repositories
            </TabsTrigger>
            {selectedFile && (
              <TabsTrigger 
                value="editor" 
                className="relative px-3 py-1.5 text-sm font-medium"
              >
                <GitCommit className="h-4 w-4 mr-2" />
                {selectedFile?.name || 'Editor'}
              </TabsTrigger>
            )}
          </TabsList>
          
          {activeTab === 'editor' && selectedFile && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('browser')}
                className="h-8"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to files
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleCreatePullRequest}
                className="h-8"
                disabled={isSaving}
              >
                <GitPullRequest className="h-4 w-4 mr-2" />
                Create Pull Request
              </Button>
            </div>
          )}
        </div>
        
        <TabsContent 
          value="browser" 
          className="flex-1 m-0 overflow-hidden"
        >
          <GitHubRepoBrowser 
            onFileSelect={handleFileSelect}
            onRepoSelect={handleRepoSelect}
            className="h-full"
          />
        </TabsContent>
        
        <TabsContent 
          value="editor" 
          className="flex-1 m-0 overflow-hidden"
        >
          <GitHubFileViewer 
            file={selectedFile}
            content={fileContent}
            onSave={handleSaveFile}
            isSaving={isSaving}
            className="h-full"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
