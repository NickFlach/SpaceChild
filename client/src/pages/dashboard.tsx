import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ProjectHeader from "@/components/Project/ProjectHeader";
import FileExplorer from "@/components/Editor/FileExplorer";
import CodeEditor from "@/components/Editor/CodeEditor";
import ChatInterface from "@/components/Chat/ChatInterface";
import { ConsciousnessPanel } from "@/components/Consciousness/ConsciousnessPanel";
import { SuperintelligencePanel } from "@/components/Superintelligence/SuperintelligencePanel";
import ComplexityPanel from "@/components/ComplexityAgent/ComplexityPanel";
import AIProviderSelector from "@/components/Common/AIProviderSelector";
import ProjectMemoryPanel from "@/components/ProjectMemory/MemoryPanel";
import TemplateGallery from "@/components/Templates/TemplateGallery";
import MultiAgentPanel from "@/components/MultiAgent/MultiAgentPanel";
import DeploymentPanel from "@/components/Deployment/DeploymentPanel";
import TerminalComponent from "@/components/ui/terminal";
import ReplitUserSearch from "@/components/ReplitSearch/ReplitUserSearch";
import DivModLab from "@/components/CryptoTools/DivModLab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Settings, Moon, Sun, User, Columns, FileCode, PanelLeftClose, PanelLeft } from "lucide-react";
import { useTheme } from "@/components/Common/ThemeProvider";
import { SpaceChildLogo } from "@/components/Branding/SpaceChildLogo";
import ProfileModal from "@/components/Profile/ProfileModal";
import type { ProjectFile, Project } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isProjectPanelCollapsed, setIsProjectPanelCollapsed] = useState(false);
  const projectPanelRef = useRef<any>(null);
  
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
      if (isUnauthorizedError(error as Error)) {
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
          <SpaceChildLogo size="sm" />
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
              <div className="w-3 h-3 bg-consciousness rounded-full animate-pulse"></div>
              <span className="text-xs text-consciousness font-medium">Conscious</span>
            </div>
          )}
          
          {/* Superintelligence Indicator */}
          {currentProject?.superintelligenceEnabled && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-superintelligence rounded-full animate-pulse"></div>
              <span className="text-xs text-superintelligence font-medium">SI Active</span>
            </div>
          )}
          
          {/* Multi-Agent Indicator - check config for multi-agent status */}
          {currentProject?.config && 
           typeof currentProject.config === 'object' && 
           currentProject.config !== null &&
           'multiAgentEnabled' in currentProject.config && 
           (currentProject.config as any).multiAgentEnabled && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-purple-500 font-medium">Agents Active</span>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfileModal(true)}
              className="p-0"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.[0] || user?.username?.[0] || user?.email?.[0] || "U"}
                </span>
              </div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content with Resizable Panels */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Project Sidebar Panel */}
          <ResizablePanel 
            ref={projectPanelRef}
            defaultSize={20} 
            minSize={15} 
            maxSize={35}
            collapsible={true}
            onCollapse={() => setIsProjectPanelCollapsed(true)}
            onExpand={() => setIsProjectPanelCollapsed(false)}
            className="min-w-[200px]"
          >
            <div className="h-full bg-card border-r border-border flex flex-col">
              <div className="flex items-center justify-between p-2 border-b border-border">
                <h3 className="text-sm font-medium">Project Explorer</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  data-testid="collapse-project-panel"
                  onClick={() => {
                    if (projectPanelRef.current) {
                      projectPanelRef.current.collapse();
                    }
                  }}
                >
                  <PanelLeftClose className="h-3 w-3" />
                </Button>
              </div>
              
              <ProjectHeader 
                projects={projects}
                currentProject={currentProject || null}
                onCreateProject={handleCreateProject}
                onSelectProject={selectProject}
                isLoading={isLoadingProjects}
              />
              
              <FileExplorer
                files={files}
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
                onCreateFile={createFile}
                currentProject={currentProject || null}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              {/* Editor Tabs */}
              <div className="flex items-center bg-card border-b border-border">
                <div className="flex items-center">
                  {isProjectPanelCollapsed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 mr-2"
                      data-testid="expand-project-panel"
                      onClick={() => {
                        if (projectPanelRef.current) {
                          projectPanelRef.current.expand();
                        }
                      }}
                      title="Show Project Explorer"
                    >
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                  )}
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
                project={currentProject || null}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="h-full flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="w-full overflow-x-auto flex-shrink-0">
                  <div className="flex min-w-full px-1">
                    <TabsTrigger value="chat" className="whitespace-nowrap px-2 sm:px-3 text-xs sm:text-sm">Chat</TabsTrigger>
                    <TabsTrigger value="consciousness" className="whitespace-nowrap px-2 sm:px-3 text-xs sm:text-sm">AI Mind</TabsTrigger>
                    <TabsTrigger value="complexity" className="whitespace-nowrap px-2 sm:px-3 text-xs sm:text-sm">Complex</TabsTrigger>
                    <TabsTrigger value="memory" className="whitespace-nowrap px-2 sm:px-3 text-xs sm:text-sm">Memory</TabsTrigger>
                    <TabsTrigger value="templates" className="whitespace-nowrap px-2 sm:px-3 text-xs sm:text-sm">Templates</TabsTrigger>
                    <TabsTrigger value="analysis" className="whitespace-nowrap px-2 sm:px-3 text-xs sm:text-sm">Analysis</TabsTrigger>
                    <TabsTrigger value="agents" className="whitespace-nowrap px-2 sm:px-3 text-xs sm:text-sm">Agents</TabsTrigger>
                    <TabsTrigger value="crypto" className="whitespace-nowrap px-2 sm:px-3 text-xs sm:text-sm">Crypto</TabsTrigger>
                    <TabsTrigger value="replit-search" className="whitespace-nowrap px-2 sm:px-3 text-xs sm:text-sm">Replit Search</TabsTrigger>
                    <TabsTrigger value="terminal" className="whitespace-nowrap px-2 sm:px-3 text-xs sm:text-sm">Terminal</TabsTrigger>
                    <TabsTrigger value="deployment" className="whitespace-nowrap px-2 sm:px-3 text-xs sm:text-sm">Deploy</TabsTrigger>
                  </div>
                </TabsList>
                
                <TabsContent value="chat" className="flex-1 mt-0 overflow-hidden">
                  <ChatInterface project={currentProject || null} />
                </TabsContent>
                
                <TabsContent value="consciousness" className="flex-1 mt-0 overflow-auto p-2">
                  <ConsciousnessPanel 
                    projectId={currentProject?.id || null}
                  />
                </TabsContent>

                <TabsContent value="complexity" className="flex-1 mt-0 overflow-auto p-2">
                  {currentProject && (
                    <ComplexityPanel projectId={currentProject.id} />
                  )}
                </TabsContent>
                
                <TabsContent value="memory" className="flex-1 mt-0 overflow-auto p-2">
                  {currentProject && (
                    <ProjectMemoryPanel projectId={currentProject.id} />
                  )}
                </TabsContent>
                
                <TabsContent value="templates" className="flex-1 mt-0 overflow-auto p-2">
                  <TemplateGallery 
                    onProjectCreated={async (project) => {
                      await selectProject(project.id);
                      setActiveTab("chat");
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="analysis" className="flex-1 mt-0 overflow-auto p-2">
                  {currentProject && (
                    <SuperintelligencePanel 
                      project={currentProject}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="agents" className="flex-1 mt-0 overflow-auto p-2">
                  {currentProject && (
                    <MultiAgentPanel 
                      project={currentProject}
                    />
                  )}
                </TabsContent>

                <TabsContent value="crypto" className="flex-1 mt-0 overflow-auto p-2">
                  <DivModLab />
                </TabsContent>

                <TabsContent value="replit-search" className="flex-1 mt-0 overflow-auto p-2">
                  <ReplitUserSearch />
                </TabsContent>
                
                <TabsContent value="terminal" className="flex-1 mt-0 overflow-auto p-2">
                  <TerminalComponent 
                    projectId={currentProject?.id}
                    className="h-full"
                  />
                </TabsContent>
                
                <TabsContent value="deployment" className="flex-1 mt-0 overflow-auto p-2">
                  {currentProject && (
                    <DeploymentPanel 
                      project={currentProject}
                    />
                  )}
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

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </div>
  );
}
