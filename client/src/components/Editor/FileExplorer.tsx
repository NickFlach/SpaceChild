import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronDown, File, Folder, Plus, FileText, Upload, FolderOpen, FileArchive } from "lucide-react";
import type { ProjectFile, Project } from "@shared/schema";
import JSZip from "jszip";
import { useToast } from "@/hooks/use-toast";

interface FileExplorerProps {
  files: ProjectFile[];
  selectedFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  onCreateFile: (file: { filePath: string; content: string; fileType: string }) => Promise<void>;
  currentProject: Project | null;
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
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [fileForm, setFileForm] = useState({
    filePath: "",
    fileType: "tsx",
    content: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const buildFileTree = (files: ProjectFile[]): FileTreeNode[] => {
    const root: { [key: string]: FileTreeNode } = {};
    
    files.forEach((file) => {
      const parts = file.filePath.split("/");
      let current = root;
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
          current = current[part].children as any;
        }
      });
    });
    
    const convertToArray = (obj: { [key: string]: FileTreeNode }): FileTreeNode[] => {
      return Object.values(obj).map((node) => ({
        ...node,
        children: node.children ? convertToArray(node.children as any) : undefined,
      }));
    };
    
    return convertToArray(root);
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

  const renderFileTree = (nodes: FileTreeNode[], depth: number = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
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
        >
          {node.type === "folder" ? (
            <>
              {expandedFolders.has(node.path) ? (
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
        
        {node.type === "folder" && 
         node.children && 
         expandedFolders.has(node.path) && 
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
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload some files. Check the console for details.",
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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center space-x-2">
            <Folder className="h-4 w-4 text-primary" />
            <span>File Explorer</span>
          </h3>
          {currentProject && (
            <div className="flex items-center space-x-1">
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
      </div>
    </div>
  );
}
