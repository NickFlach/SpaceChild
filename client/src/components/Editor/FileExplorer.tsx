import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronDown, File, Folder, Plus, FileText, Upload, FolderOpen, Github, ArrowLeft, RefreshCw, Search, Eye, Minimize2 } from "lucide-react";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuLabel
} from "@/components/ui/context-menu";
import type { ProjectFile, Project } from "@shared/schema";
import JSZip from "jszip";
import { useToast } from "@/hooks/use-toast";
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration";
import type { GitHubRepo, GitHubFile } from "@/services/github";

interface FileExplorerProps {
  files: ProjectFile[];
  selectedFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  onCreateFile: (file: { filePath: string; content: string; fileType: string }) => Promise<void>;
  currentProject: Project | null;
  onDeleteFile?: (filePath: string) => Promise<void>;
  onRenameFile?: (fromPath: string, toPath: string) => Promise<void>;
  onCreateFolder?: (path: string) => Promise<void>;
  onDeleteFolder?: (path: string) => Promise<void>;
  onRenameFolder?: (fromPath: string, toPath: string) => Promise<void>;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  file?: ProjectFile;
}

export default function FileExplorer({
  files,
  selectedFile,
  onSelectFile,
  onCreateFile,
  currentProject,
  onDeleteFile,
  onRenameFile,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [fileForm, setFileForm] = useState({
    filePath: "",
    fileType: "tsx",
    content: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { isAuthenticated: isGitHubAuthed, repos, isLoading: isGitHubLoading, loadRepositories, loadRepositoryContents, getFileContent } = useGitHubIntegration();
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [githubPath, setGithubPath] = useState<string>("");
  const [githubItems, setGithubItems] = useState<GitHubFile[]>([]);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameFrom, setRenameFrom] = useState<string>("");
  const [renameTo, setRenameTo] = useState<string>("");
  const [renameTarget, setRenameTarget] = useState<"file" | "folder">("file");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [quickOpenQuery, setQuickOpenQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef<{ path: string; type: 'file' | 'folder' } | null>(null);

  const openGitHubModal = async () => {
    setIsGitHubModalOpen(true);
    if (!repos || repos.length === 0) {
      await loadRepositories();
    }
    setSelectedRepo(null);
    setGithubPath("");
    setGithubItems([]);
  };

  const collapseAll = () => setExpandedFolders(new Set());

  const revealInTree = (path: string | undefined) => {
    if (!path) return;
    const parts = path.split('/');
    const newExpanded = new Set(expandedFolders);
    let cur = "";
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur ? `${cur}/${parts[i]}` : parts[i];
      newExpanded.add(cur);
    }
    setExpandedFolders(newExpanded);
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const enterRepo = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setGithubPath("");
    const items = await loadRepositoryContents(repo.owner.login, repo.name, "");
    setGithubItems(items as any);
  };

  const navigateGitHub = async (path: string) => {
    if (!selectedRepo) return;
    const items = await loadRepositoryContents(selectedRepo.owner.login, selectedRepo.name, path);
    setGithubItems(items as any);
    setGithubPath(path);
  };

  const goUp = async () => {
    if (!githubPath) return;
    const parts = githubPath.split("/").filter(Boolean);
    parts.pop();
    const newPath = parts.join("/");
    await navigateGitHub(newPath);
  };

  const importGitHubFile = async (file: GitHubFile) => {
    if (!selectedRepo) return;
    try {
      const text = await getFileContent(selectedRepo.owner.login, selectedRepo.name, file.path);
      if (text == null) throw new Error("No content returned");
      const ext = file.name.split('.').pop() || 'txt';
      const localPath = `imported/${selectedRepo.name}/${file.path}`;
      await onCreateFile({ filePath: localPath, content: text, fileType: ext });
      toast({ title: "Imported", description: `${file.path} → ${localPath}` });
    } catch (e:any) {
      toast({ title: "Import failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const buildFileTree = (files: ProjectFile[]): FileTreeNode[] => {
    const root: { [key: string]: FileTreeNode } = {};
    
    files.forEach((file) => {
      const parts = file.filePath.split("/");
      // Skip folder marker files
      if (parts[parts.length - 1] === '.folder') return;
      let current: any = root;
      let currentPath = "";
      
      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!current[part]) {
          current[part] = {
            name: part,
            path: currentPath,
            type: index === parts.length - 1 ? "file" : "folder",
            file: index === parts.length - 1 ? file : undefined,
          } as FileTreeNode;
          if (index < parts.length - 1) {
            (current[part] as any).children = {};
          }
        }
        
        if (index < parts.length - 1) {
          current = (current[part] as any).children;
        }
      });
    });
    
    const convertToArray = (obj: { [key: string]: FileTreeNode }): FileTreeNode[] => {
      return Object.values(obj).map((node: any) => ({
        ...node,
        children: node.children ? convertToArray(node.children as any) : undefined,
      }));
    };
    
    return convertToArray(root);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "h-4 w-4";
    
    switch (ext) {
      case "tsx":
      case "jsx":
        return <FileText className={`${iconClass} text-blue-500`} />;
      case "ts":
      case "js":
        return <FileText className={`${iconClass} text-yellow-500`} />;
      case "css":
      case "scss":
        return <FileText className={`${iconClass} text-purple-500`} />;
      case "json":
        return <FileText className={`${iconClass} text-green-500`} />;
      case "md":
        return <FileText className={`${iconClass} text-gray-500`} />;
      default:
        return <File className={`${iconClass} text-gray-500`} />;
    }
  };

  const handleDelete = async (path: string) => {
    if (!onDeleteFile) return;
    const ok = window.confirm(`Delete ${path}? This cannot be undone.`);
    if (!ok) return;
    try {
      await onDeleteFile(path);
      toast({ title: "Deleted", description: `${path} removed` });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const openRename = (fromPath: string, target: "file" | "folder" = "file") => {
    setRenameFrom(fromPath);
    setRenameTo(fromPath);
    setRenameTarget(target);
    setIsRenameOpen(true);
  };

  const submitRename = async () => {
    if (!renameFrom || !renameTo || renameFrom === renameTo) {
      setIsRenameOpen(false);
      return;
    }
    try {
      if (renameTarget === 'file') {
        if (!onRenameFile) return;
        await onRenameFile(renameFrom, renameTo);
      } else {
        if (!onRenameFolder) return;
        await onRenameFolder(renameFrom, renameTo);
      }
      toast({ title: "Renamed", description: `${renameFrom} → ${renameTo}` });
    } catch (e: any) {
      toast({ title: "Rename failed", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setIsRenameOpen(false);
    }
  };

  const handleCreateSubfolder = async (parentPath: string) => {
    if (!onCreateFolder) return;
    const name = window.prompt("New folder name", "new-folder");
    if (!name) return;
    const path = `${parentPath.replace(/\/$/, '')}/${name}`;
    try {
      await onCreateFolder(path);
      toast({ title: "Folder created", description: path });
    } catch (e: any) {
      toast({ title: "Create folder failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const handleDeleteFolder = async (path: string) => {
    if (!onDeleteFolder) return;
    const ok = window.confirm(`Delete folder ${path} and all its contents? This cannot be undone.`);
    if (!ok) return;
    try {
      await onDeleteFolder(path);
      toast({ title: "Folder deleted", description: path });
    } catch (e: any) {
      toast({ title: "Delete folder failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const handleNewFileInFolder = (folderPath: string) => {
    const defaultPath = `${folderPath.replace(/\/$/, '')}/NewFile.tsx`;
    setFileForm({ filePath: defaultPath, fileType: "tsx", content: "" });
    setIsCreateModalOpen(true);
  };

  const filterTree = (nodes: FileTreeNode[], query: string): FileTreeNode[] => {
    const q = query.trim().toLowerCase();
    if (!q) return nodes;
    const filterNode = (node: FileTreeNode): FileTreeNode | null => {
      const selfMatch = node.path.toLowerCase().includes(q) || node.name.toLowerCase().includes(q);
      if (node.type === 'file') {
        return selfMatch ? node : null;
      }
      const children = (node.children || [])
        .map(child => filterNode(child))
        .filter((x): x is FileTreeNode => !!x);
      if (selfMatch || children.length > 0) {
        return { ...node, children };
      }
      return null;
    };
    return nodes.map(n => filterNode(n)).filter((x): x is FileTreeNode => !!x);
  };

  const renderFileTree = (nodes: FileTreeNode[], depth: number = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={`flex items-center space-x-2 p-1 rounded cursor-pointer transition-colors ${
                node.type === "file" && selectedFile?.filePath === node.path
                  ? "bg-primary/10 border-l-2 border-primary"
                  : "hover:bg-muted"
              }`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => {
                if (node.type === "folder") {
                  toggleFolder(node.path);
                } else if (node.file) {
                  onSelectFile(node.file);
                }
              }}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                draggedRef.current = { path: node.path, type: node.type };
                e.dataTransfer.setData('text/plain', node.path);
              }}
              onDragOver={(e) => {
                // Allow dropping into folders
                if (node.type === 'folder') {
                  e.preventDefault();
                }
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Internal move
                const dragged = draggedRef.current;
                if (node.type === 'folder' && dragged) {
                  if (dragged.type === 'file') {
                    if (!onRenameFile) return;
                    const name = dragged.path.split('/').pop()!;
                    const dest = `${node.path.replace(/\/$/, '')}/${name}`;
                    if (dest === dragged.path) return;
                    try {
                      await onRenameFile(dragged.path, dest);
                      toast({ title: 'Moved', description: `${dragged.path} → ${dest}` });
                    } catch (err: any) {
                      toast({ title: 'Move failed', description: err?.message || String(err), variant: 'destructive' });
                    }
                  } else if (dragged.type === 'folder') {
                    if (!onRenameFolder) return;
                    // prevent dropping into its own subtree
                    if (node.path === dragged.path || node.path.startsWith(dragged.path + '/')) {
                      toast({ title: 'Invalid move', description: 'Cannot move a folder into itself or its subfolder', variant: 'destructive' });
                      return;
                    }
                    const name = dragged.path.split('/').pop()!;
                    const dest = `${node.path.replace(/\/$/, '')}/${name}`;
                    if (dest === dragged.path) return;
                    try {
                      await onRenameFolder(dragged.path, dest);
                      toast({ title: 'Moved', description: `${dragged.path} → ${dest}` });
                    } catch (err: any) {
                      toast({ title: 'Move failed', description: err?.message || String(err), variant: 'destructive' });
                    }
                  }
                  draggedRef.current = null;
                  return;
                }
                draggedRef.current = null;
              }}
            >
              {node.type === "folder" ? (
                <>
                  {(expandedFolders.has(node.path) || !!searchQuery) ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Folder className="h-4 w-4 text-primary" />
                </>
              ) : (
                <>
                  <div className="w-3" />
                  {getFileIcon(node.name)}
                </>
              )}
              <span className="text-sm truncate">{node.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>{node.type === 'folder' ? 'Folder' : 'File'}</ContextMenuLabel>
            <ContextMenuSeparator />
            {node.type === 'file' && (
              <>
                <ContextMenuItem onClick={() => node.file && onSelectFile(node.file)}>Open</ContextMenuItem>
                <ContextMenuItem disabled={!onRenameFile} onClick={() => openRename(node.path)}>Rename / Move</ContextMenuItem>
                <ContextMenuItem disabled={!onDeleteFile} onClick={() => handleDelete(node.path)}>Delete</ContextMenuItem>
              </>
            )}
            {node.type === 'folder' && (
              <>
                <ContextMenuItem onClick={() => toggleFolder(node.path)}>{expandedFolders.has(node.path) ? 'Collapse' : 'Expand'}</ContextMenuItem>
                <ContextMenuItem disabled={!onCreateFolder} onClick={() => handleCreateSubfolder(node.path)}>Create Subfolder</ContextMenuItem>
                <ContextMenuItem onClick={() => handleNewFileInFolder(node.path)}>New File Here</ContextMenuItem>
                <ContextMenuItem disabled={!onRenameFolder} onClick={() => openRename(node.path, 'folder')}>Rename Folder</ContextMenuItem>
                <ContextMenuItem disabled={!onDeleteFolder} onClick={() => handleDeleteFolder(node.path)}>Delete Folder</ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
        
        {node.type === "folder" && 
         node.children && 
         (expandedFolders.has(node.path) || !!searchQuery) && 
         renderFileTree(node.children, depth + 1)}
      </div>
    ));
  };

  const handleCreateFile = async () => {
    if (!fileForm.filePath.trim()) return;
    
    const content = fileForm.content || getDefaultContent(fileForm.fileType, fileForm.filePath);
    
    await onCreateFile({
      filePath: fileForm.filePath,
      content,
      fileType: fileForm.fileType,
    });
    
    setIsCreateModalOpen(false);
    setFileForm({ filePath: "", fileType: "tsx", content: "" });
  };

  // Process zip file and extract its contents
  const processZipFile = async (file: File) => {
    try {
      const zip = await JSZip.loadAsync(file);
      const files: Array<{ path: string; content: string; type: string }> = [];
      
      // Extract all files from the zip
      const promises = Object.keys(zip.files).map(async (filename) => {
        const zipFile = zip.files[filename];
        if (!zipFile.dir) {
          const content = await zipFile.async('string');
          const fileType = filename.split('.').pop() || 'txt';
          files.push({
            path: filename,
            content,
            type: fileType
          });
        }
      });
      
      await Promise.all(promises);
      
      // Create all files
      for (const file of files) {
        await onCreateFile({
          filePath: file.path,
          content: file.content,
          fileType: file.type,
        });
      }
      
      toast({
        title: "Success",
        description: `Extracted ${files.length} files from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract zip file",
        variant: "destructive",
      });
    }
  };

  // Handle file upload (single or multiple files, including zip)
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    try {
      const uploadPromises = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check if it's a zip file
        if (file.name.toLowerCase().endsWith('.zip')) {
          uploadPromises.push(processZipFile(file));
        } else {
          // Regular file processing
          const promise = new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (evt) => {
              try {
                if (evt.target?.result) {
                  const content = evt.target.result as string;
                  const fileType = file.name.split('.').pop() || 'txt';
                  const filePath = file.webkitRelativePath || file.name;
                  
                  console.log('Creating file:', { filePath, fileType, contentLength: content.length });
                  
                  await onCreateFile({
                    filePath,
                    content,
                    fileType,
                  });
                  console.log('File created successfully:', filePath);
                  resolve();
                }
              } catch (error) {
                console.error('Error creating file:', error);
                reject(error);
              }
            };
            reader.onerror = () => {
              console.error('Error reading file:', file.name);
              reject(new Error(`Failed to read file: ${file.name}`));
            };
            reader.readAsText(file);
          });
          uploadPromises.push(promise);
        }
      }
      
      await Promise.all(uploadPromises);
      
      toast({
        title: "Success",
        description: `Uploaded ${files.length} file(s) successfully`,
      });
      // Parent component (Dashboard via useProject) will refresh files through React Query invalidation.
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload some files. Check the console for details.",
        variant: "destructive",
      });
    }
  };

  const getDefaultContent = (fileType: string, filePath: string) => {
    const fileName = filePath.split("/").pop()?.replace(/\.[^/.]+$/, "");
    
    switch (fileType) {
      case "tsx":
        return `import React from 'react';

interface ${fileName}Props {}

export default function ${fileName}({}: ${fileName}Props) {
  return (
    <div>
      <h1>${fileName} Component</h1>
    </div>
  );
}`;
      case "ts":
        return `// ${fileName} TypeScript file
export {};`;
      case "css":
        return `/* ${fileName} styles */`;
      case "json":
        return "{}";
      case "md":
        return `# ${fileName}\n\nDocument content here...`;
      default:
        return "";
    }
  };

  const fileTree = buildFileTree(files);
  const visibleTree = filterTree(fileTree, searchQuery);

  // Keyboard shortcuts and external drop upload
  // F2: rename selected file, Delete: delete selected file, Ctrl+P: Quick Open
  // Also support external file drops to upload
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setIsQuickOpen(true);
        setQuickOpenQuery('');
        return;
      }
      if (e.key === 'F2' && selectedFile) {
        e.preventDefault();
        openRename(selectedFile.filePath, 'file');
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFile) {
        e.preventDefault();
        handleDelete(selectedFile.filePath);
        return;
      }
    };
    const handleDragOver = (e: DragEvent) => {
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        e.preventDefault();
      }
    };
    const handleDrop = (e: DragEvent) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        e.preventDefault();
        const filesList = e.dataTransfer.files as unknown as FileList;
        // @ts-ignore - we can pass FileList-like
        handleFileUpload(filesList);
      }
    };
    el.addEventListener('keydown', handleKey);
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('drop', handleDrop);
    return () => {
      el.removeEventListener('keydown', handleKey);
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('drop', handleDrop);
    };
  }, [selectedFile]);

  return (
    <div className="flex-1 overflow-y-auto" ref={containerRef} tabIndex={0}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center space-x-2">
            <Folder className="h-4 w-4 text-primary" />
            <span>File Explorer</span>
          </h3>
          <div className="flex-1 mx-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files and folders..."
              className="h-8"
            />
          </div>
          {currentProject && (
            <div className="flex items-center space-x-1">
              {/* Reveal in Tree */}
              <Button
                size="sm"
                variant="ghost"
                className="p-1"
                onClick={() => revealInTree(selectedFile?.filePath)}
                title="Reveal in tree"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {/* Collapse All */}
              <Button
                size="sm"
                variant="ghost"
                className="p-1"
                onClick={collapseAll}
                title="Collapse all"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              {/* File upload input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="*"
                className="hidden"
                onChange={async (e) => {
                  console.log('File input changed:', e.target.files);
                  await handleFileUpload(e.target.files);
                  // Reset input
                  e.target.value = '';
                }}
              />
              
              {/* Folder upload input */}
              <input
                ref={folderInputRef}
                type="file"
                multiple
                /* @ts-ignore - webkitdirectory is not in React typings */
                webkitdirectory=""
                className="hidden"
                onChange={async (e) => {
                  await handleFileUpload(e.target.files);
                  // Reset input
                  e.target.value = '';
                }}
              />
              
              {/* File upload button */}
              <Button 
                size="sm" 
                variant="ghost" 
                className="p-1"
                onClick={() => fileInputRef.current?.click()}
                title="Upload files or zip archives"
              >
                <Upload className="h-4 w-4" />
              </Button>
              
              {/* Folder upload button */}
              <Button 
                size="sm" 
                variant="ghost" 
                className="p-1"
                onClick={() => folderInputRef.current?.click()}
                title="Upload folder"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>

              {/* GitHub Import */}
              <Button 
                size="sm" 
                variant="ghost" 
                className="p-1"
                onClick={openGitHubModal}
                title={isGitHubAuthed ? "Import from GitHub" : "Connect GitHub in Settings to import"}
              >
                <Github className="h-4 w-4" />
              </Button>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="p-1">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="filePath">File Path</Label>
                    <Input
                      id="filePath"
                      value={fileForm.filePath}
                      onChange={(e) => setFileForm(prev => ({ ...prev, filePath: e.target.value }))}
                      placeholder="src/components/MyComponent.tsx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fileType">File Type</Label>
                    <Select
                      value={fileForm.fileType}
                      onValueChange={(value) => setFileForm(prev => ({ ...prev, fileType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tsx">TypeScript React (.tsx)</SelectItem>
                        <SelectItem value="ts">TypeScript (.ts)</SelectItem>
                        <SelectItem value="jsx">JavaScript React (.jsx)</SelectItem>
                        <SelectItem value="js">JavaScript (.js)</SelectItem>
                        <SelectItem value="css">CSS (.css)</SelectItem>
                        <SelectItem value="scss">SCSS (.scss)</SelectItem>
                        <SelectItem value="json">JSON (.json)</SelectItem>
                        <SelectItem value="md">Markdown (.md)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleCreateFile}
                      disabled={!fileForm.filePath.trim()}
                    >
                      Create File
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* GitHub Import Dialog */}
            <Dialog open={isGitHubModalOpen} onOpenChange={setIsGitHubModalOpen}>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Import from GitHub</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {!isGitHubAuthed && (
                    <div className="text-sm text-muted-foreground">
                      Connect your GitHub account in Settings to browse and import files.
                    </div>
                  )}
                  {isGitHubAuthed && !selectedRepo && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Your Repositories</h4>
                        <Button variant="ghost" size="sm" className="p-1" onClick={loadRepositories} title="Refresh">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="max-h-80 overflow-auto space-y-1">
                        {isGitHubLoading && <div className="text-xs text-muted-foreground">Loading...</div>}
                        {(!isGitHubLoading && repos?.length === 0) && (
                          <div className="text-xs text-muted-foreground">No repositories found.</div>
                        )}
                        {repos?.map((r) => (
                          <button key={r.id} onClick={() => enterRepo(r)} className="w-full text-left p-2 rounded hover:bg-muted">
                            <div className="text-sm font-medium">{r.full_name}</div>
                            {r.description && <div className="text-xs text-muted-foreground truncate">{r.description}</div>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isGitHubAuthed && selectedRepo && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="p-1" onClick={() => setSelectedRepo(null)} title="Back to repos">
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <div className="text-sm font-medium">{selectedRepo.full_name}{githubPath ? ` / ${githubPath}` : ""}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="p-1" onClick={goUp} disabled={!githubPath} title="Up one level">
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-1" onClick={() => navigateGitHub(githubPath)} title="Refresh">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-auto">
                        {githubItems?.map((it) => (
                          <div key={it.sha} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                            <div className="flex items-center gap-2">
                              {it.type === 'dir' ? <Folder className="h-4 w-4 text-primary" /> : getFileIcon(it.name)}
                              <button className="text-sm" onClick={() => it.type === 'dir' ? navigateGitHub(it.path) : null}>
                                {it.name}
                              </button>
                            </div>
                            {it.type === 'file' && (
                              <Button size="sm" variant="outline" onClick={() => importGitHubFile(it)}>
                                Import
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            </div>
          )}
        </div>

        {fileTree.length > 0 ? (
          <div className="space-y-1">
            {renderFileTree(fileTree)}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files yet</p>
            {currentProject && (
              <p className="text-xs">Create your first file to get started</p>
            )}
          </div>
        )}

        {/* Rename / Move Dialog */}
        <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename / Move File</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div>
                <Label>From</Label>
                <Input value={renameFrom} disabled />
              </div>
              <div>
                <Label htmlFor="toPath">To</Label>
                <Input id="toPath" value={renameTo} onChange={(e) => setRenameTo(e.target.value)} placeholder="new/path/File.tsx" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
                <Button className="flex-1" onClick={submitRename} disabled={!renameTo.trim() || !onRenameFile}>Confirm</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
