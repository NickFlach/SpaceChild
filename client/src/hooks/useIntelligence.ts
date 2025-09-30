import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { intelligenceService, type UnifiedSessionRequest } from '../services/intelligence';

/**
 * React hooks for Unified Intelligence System
 */

/**
 * Hook to start a unified intelligence session
 */
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UnifiedSessionRequest) => 
      intelligenceService.startSession(request),
    onSuccess: () => {
      // Invalidate statistics to refresh
      queryClient.invalidateQueries({ queryKey: ['intelligence', 'statistics'] });
    },
  });
}

/**
 * Hook to get system statistics
 */
export function useIntelligenceStatistics() {
  return useQuery({
    queryKey: ['intelligence', 'statistics'],
    queryFn: () => intelligenceService.getStatistics(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook to get unified recommendations
 */
export function useRecommendations(context?: any) {
  return useQuery({
    queryKey: ['intelligence', 'recommendations', context],
    queryFn: () => intelligenceService.getRecommendations(context),
    enabled: !!context,
  });
}

/**
 * Hook to analyze codebase
 */
export function useAnalyzeCodebase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codebaseId, files }: { codebaseId: string; files: any[] }) =>
      intelligenceService.analyzeCodebase(codebaseId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence', 'learning'] });
    },
  });
}

/**
 * Hook to get learning statistics
 */
export function useLearningStatistics() {
  return useQuery({
    queryKey: ['intelligence', 'learning', 'statistics'],
    queryFn: () => intelligenceService.getLearningStatistics(),
  });
}

/**
 * Hook to review code
 */
export function useReviewCode() {
  return useMutation({
    mutationFn: ({
      code,
      author,
      context,
      framework,
    }: {
      code: string;
      author: string;
      context?: any;
      framework?: string;
    }) => intelligenceService.reviewCode(code, author, context, framework),
  });
}

/**
 * Hook for AI-human collaboration
 */
export function useCollaborate() {
  return useMutation({
    mutationFn: ({
      userId,
      message,
      sessionId,
      code,
      context,
    }: {
      userId: string;
      message: string;
      sessionId?: string;
      code?: string;
      context?: any;
    }) => intelligenceService.collaborate(userId, message, sessionId, code, context),
  });
}

/**
 * Hook to provide collaboration feedback
 */
export function useProvideFeedback() {
  return useMutation({
    mutationFn: ({ sessionId, feedback }: { sessionId: string; feedback: any }) =>
      intelligenceService.provideFeedback(sessionId, feedback),
  });
}

/**
 * Hook to start debug session
 */
export function useDebugSession() {
  return useMutation({
    mutationFn: ({
      error,
      context,
      stackTrace,
      timestamp,
      logs,
      stateHistory,
    }: {
      error: string;
      context?: string;
      stackTrace?: string;
      timestamp?: Date;
      logs?: string[];
      stateHistory?: any[];
    }) =>
      intelligenceService.startDebugSession(
        error,
        context,
        stackTrace,
        timestamp,
        logs,
        stateHistory
      ),
  });
}

/**
 * Hook to build activist tool
 */
export function useBuildActivistTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: {
      toolName: string;
      purpose: string;
      targetPlatform?: string;
      features?: string[];
      activistNeeds?: string[];
      constraints?: string[];
      ethicalConsiderations?: string[];
      architecture?: string;
    }) => intelligenceService.buildActivistTool(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence', 'activist'] });
    },
  });
}

/**
 * Hook to verify activist tool
 */
export function useVerifyActivistTool() {
  return useMutation({
    mutationFn: (projectId: string) => intelligenceService.verifyActivistTool(projectId),
  });
}

/**
 * Hook to get activist recommendations
 */
export function useActivistRecommendations(projectId: string | undefined) {
  return useQuery({
    queryKey: ['intelligence', 'activist', 'recommendations', projectId],
    queryFn: () => intelligenceService.getActivistRecommendations(projectId!),
    enabled: !!projectId,
  });
}

/**
 * Hook for health check
 */
export function useIntelligenceHealth() {
  return useQuery({
    queryKey: ['intelligence', 'health'],
    queryFn: () => intelligenceService.healthCheck(),
    refetchInterval: 60000, // Check every minute
  });
}
