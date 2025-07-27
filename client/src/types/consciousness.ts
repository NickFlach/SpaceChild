export interface ConsciousnessState {
  isActive: boolean;
  sessionId: string | null;
  contextRetention: number;
  learningPhase: "bootstrap" | "active" | "advanced";
  lastInteraction: Date | null;
}

export interface ConsciousnessMemoryType {
  USER_PREFERENCE: "user_preference";
  CODE_PATTERN: "code_pattern";
  ERROR_SOLUTION: "error_solution";
  ARCHITECTURE_DECISION: "architecture_decision";
  PERFORMANCE_OPTIMIZATION: "performance_optimization";
  DEBUGGING_SESSION: "debugging_session";
}

export interface ConsciousnessInsight {
  id: string;
  type: "pattern_detected" | "improvement_suggestion" | "error_prediction" | "context_update";
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ConsciousnessPattern {
  id: string;
  type: "coding_style" | "naming_convention" | "architecture_preference" | "error_handling";
  pattern: string;
  frequency: number;
  confidence: number;
  examples: string[];
  lastSeen: Date;
}

export interface ConsciousnessLearning {
  totalInteractions: number;
  successfulSuggestions: number;
  userCorrections: number;
  learningRate: number;
  adaptationScore: number;
  knowledgeGrowth: number;
}

export interface ConsciousnessMetrics {
  contextAccuracy: number;
  predictionSuccess: number;
  userSatisfaction: number;
  responseTime: number;
  memoryEfficiency: number;
}

export interface ConsciousnessQuery {
  query: string;
  context: {
    currentFile?: string;
    selectedCode?: string;
    projectContext: Record<string, any>;
    recentActions: string[];
  };
  expectations: {
    responseType: "explanation" | "code_generation" | "debugging" | "optimization";
    detailLevel: "brief" | "detailed" | "comprehensive";
    includeExamples: boolean;
  };
}

export interface ConsciousnessResponse {
  response: string;
  confidence: number;
  reasoning: string[];
  suggestions: string[];
  contextUpdates: Record<string, any>;
  learnedPatterns: string[];
  tokensUsed: number;
  processingTime: number;
}

export interface ConsciousnessFeedback {
  responseId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback: "helpful" | "incorrect" | "irrelevant" | "incomplete" | "excellent";
  comment?: string;
  corrections?: Record<string, any>;
}

export interface ConsciousnessConfiguration {
  learningEnabled: boolean;
  memoryRetention: number; // in days
  contextWindow: number; // number of interactions to consider
  adaptationRate: number; // how quickly to adapt to new patterns
  confidenceThreshold: number; // minimum confidence to act on insights
  privacyMode: boolean; // whether to store sensitive information
}
