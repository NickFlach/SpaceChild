import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Code, Globe, Database, Brain, Terminal, Sparkles, Wand2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ProjectTemplate } from "@shared/schema";
import SmartTemplateCreator from "./SmartTemplateCreator";

interface TemplateGalleryProps {
  onProjectCreated?: (project: any) => void;
}

export default function TemplateGallery({ onProjectCreated }: TemplateGalleryProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showSmartCreator, setShowSmartCreator] = useState(false);
  
  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });
  
  // Fetch popular templates
  const { data: popularTemplates } = useQuery({
    queryKey: ["/api/templates/popular"],
  });
  
  // Search templates
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("GET", `/api/templates/search?query=${encodeURIComponent(query)}`);
      return response.json();
    },
    onError: (error) => {
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
    }
  });
  
  // Create project from template
  const createProjectMutation = useMutation({
    mutationFn: async ({ templateId, name }: { templateId: number; name: string }) => {
      const response = await apiRequest("POST", `/api/templates/${templateId}/create-project`, {
        name,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Project created successfully from template!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
      setProjectName("");
      if (onProjectCreated) {
        onProjectCreated(data.project);
      }
    },
    onError: (error) => {
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
        description: "Failed to create project from template",
        variant: "destructive",
      });
    }
  });
  
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      "web-app": <Globe className="h-4 w-4" />,
      "api": <Code className="h-4 w-4" />,
      "fullstack": <Database className="h-4 w-4" />,
      "ml-model": <Brain className="h-4 w-4" />,
      "cli": <Terminal className="h-4 w-4" />,
    };
    return icons[category] || <Code className="h-4 w-4" />;
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };
  
  const handleCreateProject = () => {
    if (selectedTemplate && projectName.trim()) {
      createProjectMutation.mutate({
        templateId: selectedTemplate.id,
        name: projectName,
      });
    }
  };
  
  const displayTemplates = searchMutation.data || templates || [];
  
  // Debug logging (remove after fixing)
  // console.log("Template Debug:", { isLoading, templates, templatesLength: templates?.length, displayTemplates, displayTemplatesLength: displayTemplates.length });
  
  if (isLoading) {
    return <div>Loading templates...</div>;
  }
  
  if (!displayTemplates || displayTemplates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Project Templates</h2>
            <p className="text-muted-foreground">
              Start your project with pre-configured templates optimized for Space Child AI
            </p>
          </div>
          <Button 
            onClick={() => setShowSmartCreator(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            AI Smart Template
          </Button>
        </div>
        
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">No templates available</p>
          <p className="text-sm text-muted-foreground">
            Try using the AI Smart Template to create your project
          </p>
        </div>
        
        {/* Smart Template Creator Dialog */}
        {showSmartCreator && (
          <SmartTemplateCreator
            onProjectCreated={(project) => {
              setShowSmartCreator(false);
              if (onProjectCreated) {
                onProjectCreated(project);
              }
              toast({
                title: "Success",
                description: "AI-powered project created successfully!",
              });
              queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
            }}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-2 h-full flex flex-col">
      {/* Header - Compact */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Templates</h2>
          <p className="text-xs text-muted-foreground">
            AI-powered project starters
          </p>
        </div>
        <Button 
          onClick={() => setShowSmartCreator(true)}
          size="sm"
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          <Wand2 className="h-4 w-4 mr-1" />
          AI Smart
        </Button>
      </div>
      
      {/* Search Bar - Compact */}
      <form onSubmit={handleSearch} className="flex gap-1">
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 h-7 text-xs"
        />
        <Button type="submit" disabled={searchMutation.isPending} size="sm" className="h-7 px-2">
          <Search className="h-3 w-3" />
        </Button>
      </form>
      
      {/* Template Grid - Main content area */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5 h-7 mb-1">
            <TabsTrigger value="all" className="text-xs py-1">All</TabsTrigger>
            <TabsTrigger value="web-app" className="text-xs py-1">Web</TabsTrigger>
            <TabsTrigger value="api" className="text-xs py-1">API</TabsTrigger>
            <TabsTrigger value="fullstack" className="text-xs py-1">Full Stack</TabsTrigger>
            <TabsTrigger value="other" className="text-xs py-1">Other</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="flex-1 mt-0 overflow-auto">
            <div className="grid grid-cols-1 gap-2">
            {displayTemplates.map((template: ProjectTemplate) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedTemplate(template);
                  setProjectName(template.name.replace("Template", "Project"));
                  setIsCreateDialogOpen(true);
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                    </div>
                    {template.popularity && template.popularity > 0 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {template.popularity}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {/* Tech Stack */}
                    <div>
                      <p className="text-xs font-medium mb-1">Tech Stack</p>
                      <div className="flex flex-wrap gap-1">
                        {(template.techStack as string[])?.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs px-1 py-0">
                            {tech}
                          </Badge>
                        ))}
                        {(template.techStack as string[])?.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{(template.techStack as string[]).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* AI Providers - Compact display */}
                    {template.aiProviders && (template.aiProviders as string[]).length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-1">AI Providers</p>
                        <div className="flex flex-wrap gap-1">
                          {(template.aiProviders as string[]).slice(0, 2).map((provider) => (
                            <Badge key={provider} className="text-xs px-1 py-0 bg-cyan-500 hover:bg-cyan-600">
                              {provider}
                            </Badge>
                          ))}
                          {(template.aiProviders as string[]).length > 2 && (
                            <Badge className="text-xs px-1 py-0 bg-cyan-500">
                              +{(template.aiProviders as string[]).length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Category-specific tabs */}
        {["web-app", "api", "fullstack", "other"].map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTemplates
                .filter((template: ProjectTemplate) => 
                  category === "other" 
                    ? !["web-app", "api", "fullstack"].includes(template.category)
                    : template.category === category
                )
                .map((template: ProjectTemplate) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setProjectName(template.name.replace("Template", "Project"));
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(template.category)}
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                        </div>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {(template.techStack as string[])?.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
        </Tabs>
      </div>
      
      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Project from Template</DialogTitle>
            <DialogDescription>
              Create a new project based on "{selectedTemplate?.name}"
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="mt-1"
                />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Template Details</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{selectedTemplate.description}</p>
                  <p>
                    <strong>Tech Stack:</strong> {(selectedTemplate.techStack as string[])?.join(", ")}
                  </p>
                  {selectedTemplate.config?.defaultAiProvider && (
                    <p>
                      <strong>Default AI Provider:</strong> {selectedTemplate.config.defaultAiProvider}
                    </p>
                  )}
                  {(selectedTemplate.starterFiles as any[])?.length > 0 && (
                    <p>
                      <strong>Starter Files:</strong> {(selectedTemplate.starterFiles as any[]).length} files
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!projectName.trim() || createProjectMutation.isPending}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Smart Template Creator Dialog */}
      {showSmartCreator && (
        <SmartTemplateCreator
          onProjectCreated={(project) => {
            setShowSmartCreator(false);
            if (onProjectCreated) {
              onProjectCreated(project);
            }
            toast({
              title: "Success",
              description: "AI-powered project created successfully!",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
          }}
        />
      )}
    </div>
  );
}