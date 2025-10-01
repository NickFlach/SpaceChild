import { apiRequest } from '@/lib/queryClient';

/**
 * Frontend service for Unified Intelligence System
 * Provides access to all revolutionary AI intelligence features
 */

// Type definitions
export interface UnifiedSessionRequest {
  type: 'develop' | 'review' | 'debug' | 'activist-tool' | 'collaborate';
  goal: string;
  userId: string;
  code?: string;
  context?: any;
  error?: string;
  stackTrace?: string;
  logs?: string[];
  stateHistory?: any[];
  toolName?: string;
  purpose?: string;
  targetPlatform?: string;
  features?: string[];
  activistNeeds?: string[];
  ethicalConsiderations?: string[];
  message?: string;
  filePath?: string;
}

export interface UnifiedSession {
  id: string;
  type: string;
  goal: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'active' | 'complete' | 'failed';
  systemsInvolved: string[];
  insights: string[];
  learnings: string[];
  consciousnessLevel: number;
  temporalCoherence: number;
}

export interface SystemStatistics {
  metrics: {
    totalSessions: number;
    codebasesAnalyzed: number;
    patternsLearned: number;
    reviewsCompleted: number;
    bugsDebuggedWithCausality: number;
    activistToolsBuilt: number;
    humanAICollaborations: number;
    averageConsciousnessScore: number;
    totalLearningIterations: number;
    systemUptime: number;
  };
  learningEngine: any;
  activeSessions: number;
  knowledgeBaseSize: {
    patterns: number;
    wisdom: number;
    debugInsights: number;
    ethicalGuidelines: number;
    crossSystemLearnings: number;
  };
  systemHealth: Record<string, string>;
}

export interface UnifiedRecommendations {
  codePatterns: any[];
  securityWarnings: any[];
  collaborationSuggestions: string[];
  ethicalConsiderations: string[];
}

// API Methods
export const intelligenceService = {
  /**
   * Start a unified intelligence session
   */
  async startSession(request: UnifiedSessionRequest): Promise<UnifiedSession> {
    const res = await apiRequest('POST', '/api/intelligence/session/start', request);
    return res.json();
  },

  /**
   * Get system-wide statistics
   */
  async getStatistics(): Promise<SystemStatistics> {
    const res = await apiRequest('GET', '/api/intelligence/statistics');
    return res.json();
  },

  /**
   * Get unified recommendations
   */
  async getRecommendations(context?: any): Promise<UnifiedRecommendations> {
    const res = await apiRequest('POST', '/api/intelligence/recommendations', { context: context || {} });
    return res.json();
  },

  /**
   * Code Learning Engine - Analyze codebase
   */
  async analyzeCodebase(codebaseId: string, files: any[]): Promise<any> {
    const res = await apiRequest('POST', '/api/intelligence/learning/analyze', { codebaseId, files });
    return res.json();
  },

  /**
   * Get learning statistics
   */
  async getLearningStatistics(): Promise<any> {
    const res = await apiRequest('GET', '/api/intelligence/learning/statistics');
    return res.json();
  },

  /**
   * Get learning recommendations
   */
  async getLearningRecommendations(context?: any): Promise<any[]> {
    const res = await apiRequest('POST', '/api/intelligence/learning/recommendations', { context: context || {} });
    return res.json();
  },

  /**
   * Consciousness Code Review - Review code
   */
  async reviewCode(code: string, author: string, context?: any, framework?: string): Promise<any> {
    const res = await apiRequest('POST', '/api/intelligence/review/code', { code, author, context, framework });
    return res.json();
  },

  /**
   * Creativity Bridge - Process collaboration message
   */
  async collaborate(
    userId: string,
    message: string,
    sessionId?: string,
    code?: string,
    context?: any
  ): Promise<any> {
    const res = await apiRequest('POST', '/api/intelligence/collaborate/message', { sessionId, userId, message, code, context });
    return res.json();
  },

  /**
   * Provide feedback on collaboration
   */
  async provideFeedback(sessionId: string, feedback: any): Promise<any> {
    const res = await apiRequest('POST', '/api/intelligence/collaborate/feedback', { sessionId, feedback });
    return res.json();
  },

  /**
   * Temporal Debugger - Start debug session
   */
  async startDebugSession(
    error: string,
    context?: string,
    stackTrace?: string,
    timestamp?: Date,
    logs?: string[],
    stateHistory?: any[]
  ): Promise<any> {
    const res = await apiRequest('POST', '/api/intelligence/debug/start', {
      error,
      context,
      stackTrace,
      timestamp,
      logs,
      stateHistory,
    });
    return res.json();
  },

  /**
   * Activist Tech Lab - Build activist tool
   */
  async buildActivistTool(request: {
    toolName: string;
    purpose: string;
    targetPlatform?: string;
    features?: string[];
    activistNeeds?: string[];
    constraints?: string[];
    ethicalConsiderations?: string[];
    architecture?: string;
  }): Promise<any> {
    const res = await apiRequest('POST', '/api/intelligence/activist/build', request);
    return res.json();
  },

  /**
   * Verify activist tool
   */
  async verifyActivistTool(projectId: string): Promise<any> {
    const res = await apiRequest('POST', `/api/intelligence/activist/verify/${projectId}`);
    return res.json();
  },

  /**
   * Get activist tool recommendations
   */
  async getActivistRecommendations(projectId: string): Promise<any> {
    const res = await apiRequest('GET', `/api/intelligence/activist/recommendations/${projectId}`);
    return res.json();
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    const res = await apiRequest('GET', '/api/intelligence/health');
    return res.json();
  },
};

export default intelligenceService;
