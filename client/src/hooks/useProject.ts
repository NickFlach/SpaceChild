import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Project, ProjectFile, InsertProject, InsertProjectFile } from "@shared/schema";

export function useProject() {
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Projects query
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
      }
    },
  });

  // Current project query
  const { data: currentProject } = useQuery<Project>({
    queryKey: ["/api/projects", currentProjectId],
    enabled: !!currentProjectId,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
      }
    },
  });

  // Project files query
  const { data: files } = useQuery<ProjectFile[]>({
    queryKey: ["/api/projects", currentProjectId, "files"],
    enabled: !!currentProjectId,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
      }
    },
  });

  // Auto-select first project if none selected
  useEffect(() => {
    if (projects && projects.length > 0 && !currentProjectId) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projects, currentProjectId]);

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (project: InsertProject) => {
      const response = await apiRequest("POST", "/api/projects", project);
      return response.json();
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setCurrentProjectId(newProject.id);
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
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
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProject> }) => {
      const response = await apiRequest("PUT", `/api/projects/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    },
  });

  // Create file mutation
  const createFileMutation = useMutation({
    mutationFn: async (file: InsertProjectFile) => {
      const response = await apiRequest(`POST`, `/api/projects/${currentProjectId}/files`, file);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId, "files"] });
      toast({
        title: "Success",
        description: "File created successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create file",
        variant: "destructive",
      });
    },
  });

  // Update file mutation
  const updateFileMutation = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: number; content: string }) => {
      // Find the file to get its path
      const file = files?.find(f => f.id === fileId);
      if (!file) throw new Error("File not found");
      
      const response = await apiRequest("PUT", `/api/projects/${currentProjectId}/files/${file.filePath}`, {
        content,
        version: (file.version || 1) + 1,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId, "files"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update file",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    projects: projects || [],
    currentProject,
    files: files || [],
    
    // Loading states
    isLoadingProjects,
    
    // Actions
    selectProject: (projectId: number) => setCurrentProjectId(projectId),
    createProject: createProjectMutation.mutateAsync,
    updateProject: (id: number, data: Partial<InsertProject>) => 
      updateProjectMutation.mutateAsync({ id, data }),
    createFile: createFileMutation.mutateAsync,
    updateFile: (fileId: number, content: string) => 
      updateFileMutation.mutateAsync({ fileId, content }),
    
    // Mutation states
    isCreatingProject: createProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isCreatingFile: createFileMutation.isPending,
    isUpdatingFile: updateFileMutation.isPending,
  };
}
