/**
 * Unified Intelligence System
 * 
 * Entry point for all revolutionary intelligence systems:
 * - Self-Improving Code Intelligence
 * - Consciousness-Verified Code Reviews
 * - AI-Human Creativity Bridge
 * - Real-Time Temporal Debugging
 * - Activist Technology Laboratory
 */

import { UnifiedIntelligenceSystem } from './UnifiedIntelligenceSystem';

// Create singleton instance
let unifiedSystem: UnifiedIntelligenceSystem | null = null;

export function getUnifiedIntelligenceSystem(): UnifiedIntelligenceSystem {
  if (!unifiedSystem) {
    console.log('🌟 Initializing Unified Intelligence System...');
    unifiedSystem = new UnifiedIntelligenceSystem();
    console.log('✅ Unified Intelligence System ready');
  }
  return unifiedSystem;
}

// Export singleton for direct use
export const unifiedIntelligenceSystem = getUnifiedIntelligenceSystem();

// Export individual system types for type safety
export { UnifiedIntelligenceSystem } from './UnifiedIntelligenceSystem';
export { CodeLearningEngine } from './CodeLearningEngine';
export { ConsciousnessCodeReviewer } from './ConsciousnessCodeReviewer';
export { CreativityBridge } from './CreativityBridge';
export { TemporalDebugger } from './TemporalDebugger';
export { ActivistTechLab } from './ActivistTechLab';

// Export types
export type {
  UnifiedSessionRequest,
  UnifiedSession,
  SystemStatistics,
  UnifiedRecommendations
} from './UnifiedIntelligenceSystem';

export type {
  CodePattern,
  AntiPattern,
  ArchitecturalInsight,
  ContextualKnowledge,
  CodebaseAnalysis,
  LearningReport,
  Recommendation,
  LearningStatistics
} from './CodeLearningEngine';

export type {
  ReviewRequest,
  ConsciousnessReview,
  TemporalComplexityAnalysis,
  ArchitecturalDebt,
  SecurityAnalysis,
  PerformanceAnalysis
} from './ConsciousnessCodeReviewer';

export type {
  CreativityRequest,
  CreativityResponse,
  CollaborationFeedback
} from './CreativityBridge';

export type {
  FailureReport,
  DebugSession,
  RootCause,
  TemporalIssue,
  WhyAnalysis
} from './TemporalDebugger';

export type {
  ActivistToolRequest,
  ActivistProject,
  EthicalGuideline,
  PrivacyArchitecture,
  ImplementationPlan,
  ActivistToolVerification
} from './ActivistTechLab';

export default unifiedIntelligenceSystem;
