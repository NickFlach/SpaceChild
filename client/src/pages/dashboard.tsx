import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ProjectHeader from "@/components/Project/ProjectHeader";
import FileExplorer from "@/components/Editor/FileExplorer";
import CodeEditor from "@/components/Editor/CodeEditor";
import ChatInterface from "@/components/Chat/ChatInterface";
import ConsciousnessPanel from "@/components/Consciousness/ConsciousnessPanel";
import SuperintelligencePanel from "@/components/Superintelligence/SuperintelligencePanel";
import AIProviderSelector from "@/components/Common/AIProviderSelector";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Settings, Moon, Sun, User, Columns, FileCode } from "lucide-react";
import { useTheme } from "@/components/Common/ThemeProvider";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("chat");
  
  const {
    projects,
    currentProject,
    files,
    isLoadingProjects,
    selectProject,
    createProject,
    createFile,
    updateFile,
  } = useProject();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Space Child...</p>
        </div>
      </div>
    );
  }

  const handleCreateProject = async (projectData: any) => {
    try {
      await createProject(projectData);
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
    } catch (error) {
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
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 z-50">
        <div className="flex items-center space-x-4">
          {/* Space Child Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileCode className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Space Child
            </span>
          </div>
          <div className="h-6 w-px bg-border"></div>
          <span className="text-sm text-muted-foreground">
            {currentProject?.name || "No project selected"}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <AIProviderSelector />
          
          {/* Consciousness Indicator */}
          {currentProject?.consciousnessEnabled && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-purple-500 font-medium">Conscious</span>
            </div>
          )}
          
          {/* Superintelligence Indicator */}
          {currentProject?.superintelligenceEnabled && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-500 font-medium">SI Active</span>
            </div>
          )}
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.[0] || user?.email?.[0] || "U"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border flex flex-col">
          <ProjectHeader 
            projects={projects}
            currentProject={currentProject}
            onCreateProject={handleCreateProject}
            onSelectProject={selectProject}
            isLoading={isLoadingProjects}
          />
          
          <FileExplorer
            files={files}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            onCreateFile={createFile}
            currentProject={currentProject}
          />
          
          <ConsciousnessPanel 
            project={currentProject}
            isEnabled={currentProject?.consciousnessEnabled}
          />
        </div>

        {/* Main Content */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full flex flex-col">
              {/* Editor Tabs */}
              <div className="flex items-center bg-card border-b border-border">
                <div className="flex">
                  {selectedFile && (
                    <div className="flex items-center space-x-2 px-4 py-3 bg-background border-r border-border">
                      <FileCode className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{selectedFile.filePath}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 p-1 h-auto"
                        onClick={() => setSelectedFile(null)}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
                <div className="ml-auto flex items-center space-x-2 px-4">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Columns className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CodeEditor
                file={selectedFile}
                onFileChange={updateFile}
                project={currentProject}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="h-full flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="deploy">Deploy</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="flex-1 mt-0">
                  <ChatInterface project={currentProject} />
                </TabsContent>
                
                <TabsContent value="analysis" className="flex-1 mt-0">
                  <SuperintelligencePanel 
                    project={currentProject}
                    isEnabled={currentProject?.superintelligenceEnabled}
                  />
                </TabsContent>
                
                <TabsContent value="deploy" className="flex-1 mt-0 p-4">
                  <div className="text-center text-muted-foreground">
                    <p>Deployment features coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-card border-t border-border flex items-center justify-between px-4 text-xs">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Ready</span>
          </span>
          <span>
            {currentProject?.projectType} • {files?.length || 0} files
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {currentProject?.consciousnessEnabled && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Context: Active</span>
            </span>
          )}
          {currentProject?.superintelligenceEnabled && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>SI: Running</span>
            </span>
          )}
          <span>{user?.subscriptionTier || "Basic"} Plan</span>
        </div>
      </div>
    </div>
  );
}
