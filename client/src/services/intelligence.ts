import { apiRequest } from './api';

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
    return apiRequest<UnifiedSession>('/api/intelligence/session/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get system-wide statistics
   */
  async getStatistics(): Promise<SystemStatistics> {
    return apiRequest<SystemStatistics>('/api/intelligence/statistics');
  },

  /**
   * Get unified recommendations
   */
  async getRecommendations(context?: any): Promise<UnifiedRecommendations> {
    return apiRequest<UnifiedRecommendations>('/api/intelligence/recommendations', {
      method: 'POST',
      body: JSON.stringify({ context: context || {} }),
    });
  },

  /**
   * Code Learning Engine - Analyze codebase
   */
  async analyzeCodebase(codebaseId: string, files: any[]): Promise<any> {
    return apiRequest('/api/intelligence/learning/analyze', {
      method: 'POST',
      body: JSON.stringify({ codebaseId, files }),
    });
  },

  /**
   * Get learning statistics
   */
  async getLearningStatistics(): Promise<any> {
    return apiRequest('/api/intelligence/learning/statistics');
  },

  /**
   * Get learning recommendations
   */
  async getLearningRecommendations(context?: any): Promise<any[]> {
    return apiRequest('/api/intelligence/learning/recommendations', {
      method: 'POST',
      body: JSON.stringify({ context: context || {} }),
    });
  },

  /**
   * Consciousness Code Review - Review code
   */
  async reviewCode(code: string, author: string, context?: any, framework?: string): Promise<any> {
    return apiRequest('/api/intelligence/review/code', {
      method: 'POST',
      body: JSON.stringify({ code, author, context, framework }),
    });
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
    return apiRequest('/api/intelligence/collaborate/message', {
      method: 'POST',
      body: JSON.stringify({ sessionId, userId, message, code, context }),
    });
  },

  /**
   * Provide feedback on collaboration
   */
  async provideFeedback(sessionId: string, feedback: any): Promise<any> {
    return apiRequest('/api/intelligence/collaborate/feedback', {
      method: 'POST',
      body: JSON.stringify({ sessionId, feedback }),
    });
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
    return apiRequest('/api/intelligence/debug/start', {
      method: 'POST',
      body: JSON.stringify({
        error,
        context,
        stackTrace,
        timestamp,
        logs,
        stateHistory,
      }),
    });
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
    return apiRequest('/api/intelligence/activist/build', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Verify activist tool
   */
  async verifyActivistTool(projectId: string): Promise<any> {
    return apiRequest(`/api/intelligence/activist/verify/${projectId}`, {
      method: 'POST',
    });
  },

  /**
   * Get activist tool recommendations
   */
  async getActivistRecommendations(projectId: string): Promise<any> {
    return apiRequest(`/api/intelligence/activist/recommendations/${projectId}`);
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    return apiRequest('/api/intelligence/health');
  },
};

export default intelligenceService;
