import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ConsciousnessContext, ConsciousnessMemory } from "@shared/schema";

interface ConsciousnessSession {
  sessionId: string;
  projectId: number;
  status: string;
  contextRetention: number;
}

interface ConsciousResponse {
  response: string;
  confidence: number;
  contextUpdates?: any;
  tokensUsed?: number;
  cost?: string;
}

export function useConsciousness(projectId?: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consciousness context query
  const { data: context, isLoading: isLoadingContext } = useQuery<ConsciousnessContext>({
    queryKey: ["/api/consciousness/context", projectId],
    enabled: !!projectId,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
      }
    },
  });

  // Consciousness memories query
  const { data: memories, isLoading: isLoadingMemories } = useQuery<ConsciousnessMemory[]>({
    queryKey: ["/api/consciousness/memories", projectId],
    enabled: !!projectId,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
      }
    },
  });

  // Activate consciousness mutation
  const activateMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("POST", "/api/consciousness/activate", { projectId });
      return response.json();
    },
    onSuccess: (session: ConsciousnessSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/consciousness/context", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({
        title: "Success",
        description: "Consciousness layer activated successfully!",
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
        description: "Failed to activate consciousness layer",
        variant: "destructive",
      });
    },
  });

  // Query consciousness mutation
  const queryMutation = useMutation({
    mutationFn: async ({ sessionId, query, projectId }: { 
      sessionId: string; 
      query: string; 
      projectId: number; 
    }) => {
      const response = await apiRequest("POST", "/api/consciousness/query", {
        sessionId,
        query,
        projectId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consciousness/context", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/consciousness/memories", projectId] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to process consciousness query",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    context,
    memories,
    
    // Loading states
    isLoading: isLoadingContext || isLoadingMemories,
    isLoadingContext,
    isLoadingMemories,
    
    // Actions
    activate: activateMutation.mutateAsync,
    query: queryMutation.mutateAsync,
    
    // Mutation states
    isActivating: activateMutation.isPending,
    isQuerying: queryMutation.isPending,
  };
}
