import { useState, useEffect } from 'react';
import { useGitHub } from '@/contexts/GitHubContext';
import { getRepoContents, GitHubFile, GitHubRepo, getUserRepos } from '@/services/github';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { FileIcon, FolderIcon, ChevronRight, ChevronDown, Github, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GitHubRepoBrowserProps {
  onFileSelect?: (file: GitHubFile, content: string) => void;
  onRepoSelect?: (repo: GitHubRepo) => void;
  className?: string;
}

export function GitHubRepoBrowser({ onFileSelect, onRepoSelect, className }: GitHubRepoBrowserProps) {
  const { user } = useGitHub();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [contents, setContents] = useState<GitHubFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});

  // Fetch user's repositories
  useEffect(() => {
    const fetchRepos = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userRepos = await getUserRepos(user.login);
        setRepos(userRepos);
      } catch (error) {
        console.error('Failed to fetch repositories:', error);
        toast.error('Failed to load repositories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepos();
  }, [user]);

  // Load repository contents when a repo is selected
  useEffect(() => {
    const loadRepoContents = async () => {
      if (!selectedRepo) return;
      
      setIsLoading(true);
      try {
        const repoContents = await getRepoContents(selectedRepo.owner.login, selectedRepo.name, currentPath);
        setContents(repoContents);
        
        // If we're at the root, call onRepoSelect
        if (currentPath === '' && onRepoSelect) {
          onRepoSelect(selectedRepo);
        }
      } catch (error) {
        console.error('Failed to fetch repository contents:', error);
        toast.error('Failed to load repository contents');
      } finally {
        setIsLoading(false);
      }
    };

    loadRepoContents();
  }, [selectedRepo, currentPath, onRepoSelect]);

  const handleRepoSelect = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setCurrentPath('');
    setExpandedDirs({});
  };

  const handleFileClick = async (file: GitHubFile) => {
    if (file.type === 'dir') {
      // Toggle directory expansion
      setExpandedDirs(prev => ({
        ...prev,
        [file.path]: !prev[file.path]
      }));
      
      // If directory is being expanded, navigate into it
      if (!expandedDirs[file.path]) {
        setCurrentPath(file.path);
      }
    } else if (onFileSelect) {
      // For files, load the content and call the onFileSelect callback
      try {
        setIsLoading(true);
        const response = await fetch(file.download_url || '');
        const content = await response.text();
        onFileSelect(file, content);
      } catch (error) {
        console.error('Failed to load file content:', error);
        toast.error('Failed to load file content');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const navigateUp = () => {
    if (!currentPath) return; // Already at root
    
    const pathParts = currentPath.split('/');
    pathParts.pop(); // Remove the last part
    const newPath = pathParts.join('/');
    setCurrentPath(newPath);
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredContents = contents.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && !selectedRepo) {
    return (
      <div className={cn("p-4 space-y-2", className)}>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Search bar */}
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={selectedRepo ? `Search in ${selectedRepo.name}...` : 'Search repositories...'}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Repo list or file browser */}
      <ScrollArea className="flex-1">
        {!selectedRepo ? (
          // Repository list view
          <div className="divide-y">
            {filteredRepos.length > 0 ? (
              filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="p-3 hover:bg-accent/50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleRepoSelect(repo)}
                >
                  <div className="flex items-center space-x-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{repo.name}</span>
                    {repo.private && (
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-full">Private</span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? 'No repositories found' : 'No repositories available'}
              </div>
            )}
          </div>
        ) : (
          // File browser view
          <div className="divide-y">
            {/* Breadcrumb navigation */}
            <div className="p-2 text-sm text-muted-foreground flex items-center space-x-1">
              <button 
                onClick={() => setSelectedRepo(null)}
                className="hover:text-foreground flex items-center"
              >
                <Github className="h-4 w-4 mr-1" />
                {selectedRepo.owner.login}
              </button>
              <span>/</span>
              <button 
                onClick={() => setCurrentPath('')}
                className="hover:text-foreground font-medium"
              >
                {selectedRepo.name}
              </button>
              
              {currentPath && (
                <>
                  {currentPath.split('/').map((part, index, parts) => {
                    const pathSoFar = parts.slice(0, index + 1).join('/');
                    return (
                      <React.Fragment key={pathSoFar}>
                        <span>/</span>
                        <button
                          onClick={() => setCurrentPath(pathSoFar)}
                          className="hover:text-foreground"
                        >
                          {part}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </>
              )}
              
              {isLoading && (
                <Loader2 className="ml-2 h-3 w-3 animate-spin" />
              )}
            </div>

            {/* Directory contents */}
            {filteredContents.length > 0 ? (
              filteredContents.map((item) => (
                <div
                  key={item.sha}
                  className="p-2 hover:bg-accent/50 cursor-pointer flex items-center justify-between group"
                  onClick={() => handleFileClick(item)}
                >
                  <div className="flex items-center space-x-2">
                    {item.type === 'dir' ? (
                      <>
                        {expandedDirs[item.path] ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <FolderIcon className="h-4 w-4 text-blue-500" />
                      </>
                    ) : (
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={cn("text-sm", item.type === 'dir' && 'font-medium')}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.type === 'file' ? formatFileSize(item.size) : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? 'No items found' : 'Empty directory'}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Status bar */}
      <div className="border-t px-3 py-1.5 text-xs text-muted-foreground flex justify-between">
        <span>
          {selectedRepo 
            ? `${filteredContents.length} ${filteredContents.length === 1 ? 'item' : 'items'}`
            : `${filteredRepos.length} ${filteredRepos.length === 1 ? 'repository' : 'repositories'}`
          }
        </span>
        {selectedRepo && (
          <button 
            onClick={navigateUp}
            disabled={!currentPath}
            className={cn(
              "text-xs",
              !currentPath ? 'text-muted-foreground/50' : 'hover:text-foreground'
            )}
          >
            Go up
          </button>
        )}
      </div>
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
