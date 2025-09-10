import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

interface ConsciousnessSession {
  sessionId: string;
  projectId: number;
  startTime: string;
  isActive: boolean;
}

interface ConsciousnessMemory {
  id: string;
  content: string;
  type: 'code' | 'chat' | 'error' | 'success';
  confidence: number;
  timestamp: Date;
}

interface ConsciousnessContext {
  memories: ConsciousnessMemory[];
  preferences: Array<{
    category: string;
    value: string;
    strength: number;
  }>;
  patterns: Array<{
    pattern: string;
    occurrences: number;
    lastSeen: Date;
  }>;
  insights: string[];
}

export function useConsciousness(projectId: number | null) {
  const [activeSession, setActiveSession] = useState<ConsciousnessSession | null>(null);

  // Get consciousness context for a project
  const { data: context, isLoading: contextLoading } = useQuery<ConsciousnessContext>({
    queryKey: ['/api/consciousness/context', projectId],
    enabled: !!projectId,
    refetchInterval: activeSession ? 30000 : false, // Refresh every 30s when active
  });

  // Activate consciousness for a project
  const activateMutation = useMutation({
    mutationFn: async (projectId: number): Promise<ConsciousnessSession> => {
      const response = await apiRequest('POST', '/api/consciousness/activate', { projectId });
      return response.json();
    },
    onSuccess: (session) => {
      setActiveSession(session);
      queryClient.invalidateQueries({ queryKey: ['/api/consciousness/context'] });
    },
  });

  // Query consciousness with context
  const queryMutation = useMutation({
    mutationFn: async ({ query, projectId }: { query: string; projectId: number }) => {
      if (!activeSession) {
        throw new Error("Consciousness not activated");
      }
      const response = await apiRequest('POST', '/api/consciousness/query', {
        sessionId: activeSession.sessionId,
        query,
        projectId,
      });
      return response.json();
    },
    onSuccess: () => {
      // Refresh context after each query
      queryClient.invalidateQueries({ queryKey: ['/api/consciousness/context'] });
    },
  });

  // Calculate overall consciousness metrics
  const memories = context?.memories || [];
  const metrics = {
    isActive: !!activeSession?.isActive,
    confidence: memories.length > 0 
      ? memories.reduce((sum, m) => sum + m.confidence, 0) / memories.length 
      : 0,
    memoryCount: context?.memories?.length || 0,
    patternCount: context?.patterns?.length || 0,
    preferenceCount: context?.preferences?.length || 0,
  };

  return {
    // State
    context,
    activeSession,
    metrics,
    isLoading: contextLoading,

    // Actions
    activate: (projectId: number) => activateMutation.mutateAsync(projectId),
    query: queryMutation.mutateAsync,
    isActivating: activateMutation.isPending,
    isQuerying: queryMutation.isPending,
  };
}