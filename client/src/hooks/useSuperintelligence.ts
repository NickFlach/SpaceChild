import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { SuperintelligenceJob } from "@shared/schema";

export function useSuperintelligence(projectId?: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Superintelligence jobs query
  const { data: jobs, isLoading: isLoadingJobs } = useQuery<SuperintelligenceJob[]>({
    queryKey: ["/api/superintelligence/jobs", projectId],
    enabled: !!projectId,
  });

  // Analyze architecture mutation
  const analyzeArchitectureMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("POST", "/api/superintelligence/analyze", { projectId });
      return response.json();
    },
    onSuccess: (job: SuperintelligenceJob) => {
      queryClient.invalidateQueries({ queryKey: ["/api/superintelligence/jobs", projectId] });
      toast({
        title: "Analysis Started",
        description: "Architecture analysis job has been queued.",
      });
      
      // Poll for job completion
      const pollInterval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/superintelligence/jobs", projectId] });
      }, 3000);
      
      // Stop polling after 30 seconds
      setTimeout(() => clearInterval(pollInterval), 30000);
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
        description: "Failed to start architecture analysis",
        variant: "destructive",
      });
    },
  });

  // Optimize performance mutation
  const optimizePerformanceMutation = useMutation({
    mutationFn: async ({ projectId, code }: { projectId: number; code: string }) => {
      const response = await apiRequest("POST", "/api/superintelligence/optimize", { 
        projectId, 
        code 
      });
      return response.json();
    },
    onSuccess: (job: SuperintelligenceJob) => {
      queryClient.invalidateQueries({ queryKey: ["/api/superintelligence/jobs", projectId] });
      toast({
        title: "Optimization Started",
        description: "Performance optimization job has been queued.",
      });
      
      // Poll for job completion
      const pollInterval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/superintelligence/jobs", projectId] });
      }, 3000);
      
      // Stop polling after 30 seconds
      setTimeout(() => clearInterval(pollInterval), 30000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to start performance optimization",
        variant: "destructive",
      });
    },
  });

  // Refactor code mutation
  const refactorMutation = useMutation({
    mutationFn: async ({ 
      projectId, 
      code, 
      requirements 
    }: { 
      projectId: number; 
      code: string; 
      requirements: any; 
    }) => {
      const response = await apiRequest("POST", "/api/superintelligence/refactor", {
        projectId,
        code,
        requirements,
      });
      return response.json();
    },
    onSuccess: (job: SuperintelligenceJob) => {
      queryClient.invalidateQueries({ queryKey: ["/api/superintelligence/jobs", projectId] });
      toast({
        title: "Refactoring Started",
        description: "Code refactoring job has been queued.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to start code refactoring",
        variant: "destructive",
      });
    },
  });

  // Get specific job query
  const getJob = (jobId: number) => {
    return useQuery<SuperintelligenceJob>({
      queryKey: ["/api/superintelligence/jobs", jobId],
      enabled: !!jobId,
    });
  };

  return {
    // Data
    jobs,
    
    // Loading states
    isLoading: isLoadingJobs,
    
    // Actions
    analyzeArchitecture: analyzeArchitectureMutation.mutateAsync,
    optimizePerformance: (projectId: number, code: string) => 
      optimizePerformanceMutation.mutateAsync({ projectId, code }),
    refactor: (projectId: number, code: string, requirements: any) => 
      refactorMutation.mutateAsync({ projectId, code, requirements }),
    getJob,
    
    // Mutation states
    isAnalyzing: analyzeArchitectureMutation.isPending,
    isOptimizing: optimizePerformanceMutation.isPending,
    isRefactoring: refactorMutation.isPending,
  };
}
