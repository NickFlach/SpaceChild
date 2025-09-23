import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Folder, Clock, Code } from "lucide-react";
import type { Project } from "@shared/schema";

interface ProjectHeaderProps {
  projects: Project[];
  currentProject: Project | null;
  onCreateProject: (project: any) => void;
  onSelectProject: (projectId: number) => void;
  isLoading: boolean;
}

export default function ProjectHeader({
  projects,
  currentProject,
  onCreateProject,
  onSelectProject,
  isLoading,
}: ProjectHeaderProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    projectType: "web-app",
    consciousnessEnabled: true,
    superintelligenceEnabled: false,
  });

  const handleCreateProject = () => {
    onCreateProject(projectForm);
    setIsCreateModalOpen(false);
    setProjectForm({
      name: "",
      description: "",
      projectType: "web-app",
      consciousnessEnabled: true,
      superintelligenceEnabled: false,
    });
  };

  const formatDate = (date: string | Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 border-b border-border">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-muted rounded mb-3"></div>
          <div className="h-16 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg">Projects</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/docs">Docs</a>
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="p-2">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My AI App"
                  />
                </div>
              <div>
                <Label htmlFor="type">Project Type</Label>
                <Select
                  value={projectForm.projectType}
                  onValueChange={(value) => setProjectForm(prev => ({ ...prev, projectType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-app">React Web App</SelectItem>
                    <SelectItem value="nextjs-app">Next.js App</SelectItem>
                    <SelectItem value="mobile-app">Mobile App (React Native)</SelectItem>
                    <SelectItem value="api">API Server</SelectItem>
                    <SelectItem value="fullstack">Full Stack App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project..."
                  rows={3}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consciousness"
                    checked={projectForm.consciousnessEnabled}
                    onCheckedChange={(checked) => 
                      setProjectForm(prev => ({ ...prev, consciousnessEnabled: !!checked }))
                    }
                  />
                  <Label htmlFor="consciousness" className="flex items-center space-x-2">
                    <span>Enable Consciousness Layer</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                      Recommended
                    </Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="superintelligence"
                    checked={projectForm.superintelligenceEnabled}
                    onCheckedChange={(checked) => 
                      setProjectForm(prev => ({ ...prev, superintelligenceEnabled: !!checked }))
                    }
                  />
                  <Label htmlFor="superintelligence" className="flex items-center space-x-2">
                    <span>Enable Superintelligence Layer</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                      Pro Plan
                    </Badge>
                  </Label>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleCreateProject}
                  disabled={!projectForm.name.trim()}
                >
                  Create Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {currentProject ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Folder className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{currentProject?.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {currentProject?.description || "No description"}
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Code className="h-3 w-3" />
                <span>{currentProject?.projectType}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(currentProject?.updatedAt || currentProject?.createdAt || new Date())}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm mb-2">No project selected</p>
          <p className="text-xs">Create a new project to get started</p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mt-4">
          <Label className="text-xs font-medium text-muted-foreground">Recent Projects</Label>
          <div className="mt-2 space-y-1">
            {projects.slice(0, 3).map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm"
              >
                <div className="flex items-center space-x-2">
                  <Folder className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{project.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
