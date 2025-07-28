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
import { Search, Code, Globe, Database, Brain, Terminal, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ProjectTemplate } from "@shared/schema";

interface TemplateGalleryProps {
  onProjectCreated?: (project: any) => void;
}

export default function TemplateGallery({ onProjectCreated }: TemplateGalleryProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
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
  
  if (isLoading) {
    return <div>Loading templates...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Project Templates</h2>
        <p className="text-muted-foreground">
          Start your project with pre-configured templates optimized for Space Child AI
        </p>
      </div>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search templates by name, tech stack, or features..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={searchMutation.isPending}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="web-app">Web Apps</TabsTrigger>
          <TabsTrigger value="api">APIs</TabsTrigger>
          <TabsTrigger value="fullstack">Full Stack</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    {template.popularity > 0 && (
                      <Badge variant="secondary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {template.popularity}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Tech Stack */}
                    <div>
                      <p className="text-sm font-medium mb-1">Tech Stack</p>
                      <div className="flex flex-wrap gap-1">
                        {(template.techStack as string[])?.slice(0, 4).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {(template.techStack as string[])?.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{(template.techStack as string[]).length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Features */}
                    {template.features && (template.features as string[]).length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Features</p>
                        <div className="flex flex-wrap gap-1">
                          {(template.features as string[]).slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* AI Providers */}
                    {template.aiProviders && (template.aiProviders as string[]).length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">AI Providers</p>
                        <div className="flex flex-wrap gap-1">
                          {(template.aiProviders as string[]).map((provider) => (
                            <Badge key={provider} className="text-xs">
                              {provider}
                            </Badge>
                          ))}
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
    </div>
  );
}