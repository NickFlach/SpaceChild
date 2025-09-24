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
  const { data: projects = [], isLoading: isLoadingProjects, error: projectsError } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (path: string) => {
      if (!currentProjectId) throw new Error("No project selected");
      const response = await apiRequest("POST", `/api/projects/${currentProjectId}/folders`, { path });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId, "files"] });
      toast({ title: "Folder created", description: "Folder created successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({ title: "Error", description: "Failed to create folder", variant: "destructive" });
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (path: string) => {
      if (!currentProjectId) throw new Error("No project selected");
      const encoded = encodeURIComponent(path);
      const response = await apiRequest("DELETE", `/api/projects/${currentProjectId}/folders/${encoded}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId, "files"] });
      toast({ title: "Folder deleted", description: "Folder deleted successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({ title: "Error", description: "Failed to delete folder", variant: "destructive" });
    },
  });

  // Rename/move folder mutation
  const renameFolderMutation = useMutation({
    mutationFn: async ({ fromPath, toPath }: { fromPath: string; toPath: string }) => {
      if (!currentProjectId) throw new Error("No project selected");
      const response = await apiRequest("POST", `/api/projects/${currentProjectId}/folders/rename`, { fromPath, toPath });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId, "files"] });
      toast({ title: "Folder renamed", description: "Folder renamed/moved successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({ title: "Error", description: "Failed to rename/move folder", variant: "destructive" });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (filePath: string) => {
      if (!currentProjectId) throw new Error("No project selected");
      const encodedPath = encodeURIComponent(filePath);
      const response = await apiRequest("DELETE", `/api/projects/${currentProjectId}/files/${encodedPath}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId, "files"] });
      toast({ title: "Deleted", description: "File deleted successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({ title: "Error", description: "Failed to delete file", variant: "destructive" });
    },
  });

  // Rename/Move file mutation
  const renameFileMutation = useMutation({
    mutationFn: async ({ fromPath, toPath }: { fromPath: string; toPath: string }) => {
      if (!currentProjectId) throw new Error("No project selected");
      const response = await apiRequest("POST", `/api/projects/${currentProjectId}/files/rename`, { fromPath, toPath });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId, "files"] });
      toast({ title: "Renamed", description: "File renamed/moved successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({ title: "Error", description: "Failed to rename/move file", variant: "destructive" });
    },
  });

  // Handle projects error
  useEffect(() => {
    if (projectsError && isUnauthorizedError(projectsError as Error)) {
      window.location.href = "/";
    }
  }, [projectsError]);

  // Current project query
  const { data: currentProject, error: currentProjectError } = useQuery<Project>({
    queryKey: ["/api/projects", currentProjectId],
    enabled: !!currentProjectId
  });

  // Handle current project error
  useEffect(() => {
    if (currentProjectError && isUnauthorizedError(currentProjectError as Error)) {
      window.location.href = "/";
    }
  }, [currentProjectError]);

  // Project files query
  const { data: files = [] } = useQuery<ProjectFile[]>({
    queryKey: ["/api/projects", currentProjectId, "files"],
    enabled: !!currentProjectId,
    refetchInterval: false,
    retry: 2
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
          window.location.href = "/";
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
        window.location.href = "/";
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
    mutationFn: async (file: Omit<InsertProjectFile, 'projectId'>) => {
      if (!currentProjectId) throw new Error("No project selected");
      const response = await apiRequest(`POST`, `/api/projects/${currentProjectId}/files`, {
        ...file,
        projectId: currentProjectId
      });
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
        window.location.href = "/";
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
        window.location.href = "/";
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
    deleteFile: (filePath: string) => deleteFileMutation.mutateAsync(filePath),
    renameFile: (fromPath: string, toPath: string) => renameFileMutation.mutateAsync({ fromPath, toPath }),
    createFolder: (path: string) => createFolderMutation.mutateAsync(path),
    deleteFolder: (path: string) => deleteFolderMutation.mutateAsync(path),
    renameFolder: (fromPath: string, toPath: string) => renameFolderMutation.mutateAsync({ fromPath, toPath }),
    
    // Mutation states
    isCreatingProject: createProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isCreatingFile: createFileMutation.isPending,
    isUpdatingFile: updateFileMutation.isPending,
    isDeletingFile: deleteFileMutation.isPending,
    isRenamingFile: renameFileMutation.isPending,
    isCreatingFolder: createFolderMutation.isPending,
    isDeletingFolder: deleteFolderMutation.isPending,
    isRenamingFolder: renameFolderMutation.isPending,
  };
}
