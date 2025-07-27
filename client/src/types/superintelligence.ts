export interface SuperintelligenceCapabilities {
  architectureAnalysis: boolean;
  performanceOptimization: boolean;
  codeRefactoring: boolean;
  securityAudit: boolean;
  testGeneration: boolean;
  documentationGeneration: boolean;
  dependencyAnalysis: boolean;
  codeComplexityAnalysis: boolean;
}

export interface ArchitectureInsight {
  category: "structure" | "patterns" | "dependencies" | "performance" | "security" | "maintainability";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  codeExamples?: string[];
  estimatedEffort: "low" | "medium" | "high";
}

export interface PerformanceMetrics {
  overallScore: number;
  bundleSize: number;
  loadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  cacheEfficiency: number;
  renderPerformance: number;
}

export interface OptimizationOpportunity {
  type: "bundle_splitting" | "lazy_loading" | "memoization" | "caching" | "compression" | "tree_shaking";
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  estimatedImprovement: number; // percentage
  codeChanges: Array<{
    file: string;
    before: string;
    after: string;
    explanation: string;
  }>;
}

export interface RefactoringPlan {
  id: string;
  type: "extract_component" | "improve_types" | "optimize_performance" | "enhance_readability" | "reduce_complexity";
  scope: "file" | "component" | "module" | "project";
  description: string;
  benefits: string[];
  risks: string[];
  estimatedTime: number; // in hours
  steps: Array<{
    order: number;
    description: string;
    files: string[];
    automated: boolean;
  }>;
}

export interface SecurityAuditResult {
  overallRisk: "low" | "medium" | "high" | "critical";
  vulnerabilities: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    location: string;
    cwe?: string; // Common Weakness Enumeration ID
    fix: string;
    automated: boolean;
  }>;
  bestPractices: Array<{
    category: string;
    description: string;
    implemented: boolean;
    priority: "low" | "medium" | "high";
  }>;
}

export interface CodeQualityMetrics {
  maintainabilityIndex: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  duplicationRatio: number;
  testCoverage: number;
  codeSmells: Array<{
    type: string;
    severity: "minor" | "major" | "critical";
    count: number;
    examples: string[];
  }>;
}

export interface SuperintelligenceJobConfig {
  maxProcessingTime: number; // in seconds
  analysisDepth: "shallow" | "medium" | "deep";
  includeExamples: boolean;
  generateFixes: boolean;
  prioritizeByImpact: boolean;
  considerProjectContext: boolean;
}

export interface SuperintelligenceInsight {
  id: string;
  category: "architecture" | "performance" | "security" | "quality" | "maintainability";
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: string;
  solution: string;
  automatable: boolean;
  estimatedTime: number;
  confidence: number;
  tags: string[];
  createdAt: Date;
}

export interface SuperintelligenceRecommendation {
  id: string;
  type: "immediate" | "short_term" | "long_term";
  category: string;
  title: string;
  description: string;
  rationale: string;
  implementation: {
    steps: string[];
    codeChanges?: Array<{
      file: string;
      changes: string;
    }>;
    estimatedTime: number;
    complexity: "low" | "medium" | "high";
  };
  benefits: string[];
  risks: string[];
  dependencies: string[];
}

export interface SuperintelligenceProgress {
  jobId: number;
  status: "queued" | "initializing" | "analyzing" | "processing" | "finalizing" | "completed" | "failed";
  progress: number; // 0-100
  currentPhase: string;
  estimatedCompletion: Date;
  processedFiles: number;
  totalFiles: number;
  insights: number;
  recommendations: number;
}
