import { EventEmitter } from 'events';
import { ConsciousnessEngine } from '../consciousness/ConsciousnessEngine';
import { TemporalConsciousnessEngine } from '../consciousness/TemporalConsciousnessEngine';

/**
 * CodeLearningEngine - Self-improving intelligence that learns from every codebase
 * 
 * This engine extracts patterns, anti-patterns, and architectural wisdom from code analysis,
 * building an ever-growing knowledge base that makes each subsequent analysis better than the last.
 */
export class CodeLearningEngine extends EventEmitter {
  private patterns: Map<string, CodePattern> = new Map();
  private antiPatterns: Map<string, AntiPattern> = new Map();
  private architecturalWisdom: Map<string, ArchitecturalInsight> = new Map();
  private contextualLearnings: Map<string, ContextualKnowledge> = new Map();
  private consciousnessEngine: ConsciousnessEngine;
  private temporalEngine: TemporalConsciousnessEngine;
  private learningIterations: number = 0;

  constructor(consciousnessEngine: ConsciousnessEngine, temporalEngine: TemporalConsciousnessEngine) {
    super();
    this.consciousnessEngine = consciousnessEngine;
    this.temporalEngine = temporalEngine;
    this.initializeCoreKnowledge();
  }

  private initializeCoreKnowledge(): void {
    // Seed with fundamental patterns
    this.patterns.set('observer-pattern', {
      id: 'observer-pattern',
      name: 'Observer Pattern',
      category: 'behavioral',
      signatures: ['EventEmitter', 'addEventListener', 'subscribe', 'on('],
      benefits: ['Loose coupling', 'Event-driven architecture', 'Reactive updates'],
      risks: ['Memory leaks from unsubscribed listeners', 'Complex event chains'],
      confidenceScore: 1.0,
      seenCount: 0,
      successRate: 0.85,
      lastSeen: new Date(),
      learningSource: 'seed'
    });

    console.log('🧠 CodeLearningEngine initialized with seed knowledge');
  }

  /**
   * Learn from a codebase analysis - this is called after every code review
   */
  async learnFromCodebase(analysis: CodebaseAnalysis): Promise<LearningReport> {
    this.learningIterations++;
    const startTime = Date.now();

    // Extract patterns
    const extractedPatterns = await this.extractPatterns(analysis);
    
    // Identify anti-patterns
    const identifiedAntiPatterns = await this.identifyAntiPatterns(analysis);
    
    // Extract architectural insights
    const architecturalInsights = await this.extractArchitecturalInsights(analysis);
    
    // Build contextual knowledge
    const contextualKnowledge = await this.buildContextualKnowledge(analysis);

    // Use consciousness engine to verify learnings
    const consciousnessVerification = await this.consciousnessEngine.processReflection({
      trigger: 'code-learning',
      depth: 3,
      patterns: extractedPatterns,
      antiPatterns: identifiedAntiPatterns,
      insights: architecturalInsights
    });

    // Temporal consciousness for emergent insights
    const temporalInsights = await this.temporalEngine.processTemporalDecision({
      learningContext: {
        patterns: extractedPatterns.length,
        antiPatterns: identifiedAntiPatterns.length,
        iterations: this.learningIterations
      }
    });

    const learningTime = Date.now() - startTime;

    const report: LearningReport = {
      timestamp: new Date(),
      codebaseId: analysis.codebaseId,
      iterationNumber: this.learningIterations,
      newPatternsLearned: extractedPatterns.length,
      antiPatternsIdentified: identifiedAntiPatterns.length,
      architecturalInsights: architecturalInsights.length,
      contextualKnowledge: contextualKnowledge.length,
      consciousnessLevel: consciousnessVerification.consciousnessLevel,
      temporalCoherence: temporalInsights.temporalCoherence,
      learningTime,
      totalKnowledgeBase: {
        patterns: this.patterns.size,
        antiPatterns: this.antiPatterns.size,
        wisdom: this.architecturalWisdom.size,
        contextual: this.contextualLearnings.size
      }
    };

    this.emit('learning-complete', report);
    return report;
  }

  /**
   * Extract patterns from code - learns what works well
   */
  private async extractPatterns(analysis: CodebaseAnalysis): Promise<CodePattern[]> {
    const newPatterns: CodePattern[] = [];

    // Analyze code structure
    for (const file of analysis.files) {
      // Look for successful patterns
      if (file.quality && file.quality.score > 0.7) {
        // Extract architectural patterns
        if (file.content.includes('class') && file.content.includes('extends')) {
          this.recordOrUpdatePattern('inheritance-pattern', {
            signatures: ['class', 'extends', 'super'],
            context: file.framework || 'general',
            successIndicators: ['high-quality-score', 'maintainable'],
            file: file.path
          });
        }

        // Composition over inheritance
        if (file.content.match(/const \w+ = .*\(.*\) => /g)) {
          this.recordOrUpdatePattern('composition-pattern', {
            signatures: ['functional-composition', 'higher-order-functions'],
            context: file.framework || 'general',
            successIndicators: ['functional', 'testable'],
            file: file.path
          });
        }

        // Dependency injection
        if (file.content.includes('constructor(') && file.content.match(/private|public \w+:/g)) {
          this.recordOrUpdatePattern('dependency-injection', {
            signatures: ['constructor-injection', 'IoC'],
            context: file.framework || 'general',
            successIndicators: ['testable', 'loosely-coupled'],
            file: file.path
          });
        }
      }
    }

    // Learn from successful patterns
    for (const [id, pattern] of this.patterns) {
      if (pattern.seenCount > 5 && pattern.successRate > 0.8) {
        newPatterns.push(pattern);
      }
    }

    return newPatterns;
  }

  /**
   * Identify anti-patterns - learns what causes problems
   */
  private async identifyAntiPatterns(analysis: CodebaseAnalysis): Promise<AntiPattern[]> {
    const antiPatterns: AntiPattern[] = [];

    for (const file of analysis.files) {
      // Look for problematic patterns
      if (file.issues && file.issues.length > 0) {
        // God Object / God Class
        if (file.content.length > 1000 && (file.content.match(/function|method/gi) || []).length > 15) {
          antiPatterns.push(this.recordAntiPattern('god-object', {
            severity: 'high',
            indicators: ['too-many-responsibilities', 'low-cohesion'],
            file: file.path,
            suggestion: 'Break into smaller, focused classes/modules with single responsibilities'
          }));
        }

        // Callback Hell
        const callbackDepth = (file.content.match(/function.*function.*function/g) || []).length;
        if (callbackDepth > 3) {
          antiPatterns.push(this.recordAntiPattern('callback-hell', {
            severity: 'medium',
            indicators: ['deep-nesting', 'hard-to-read'],
            file: file.path,
            suggestion: 'Refactor to async/await or Promises for better readability'
          }));
        }

        // Magic Numbers
        const magicNumbers = file.content.match(/[^a-zA-Z_]\d{2,}[^a-zA-Z_]/g) || [];
        if (magicNumbers.length > 5) {
          antiPatterns.push(this.recordAntiPattern('magic-numbers', {
            severity: 'low',
            indicators: ['unclear-intent', 'unmaintainable'],
            file: file.path,
            suggestion: 'Replace magic numbers with named constants'
          }));
        }

        // Shotgun Surgery (changes in one place require changes everywhere)
        if (file.dependencies && file.dependencies.length > 10) {
          antiPatterns.push(this.recordAntiPattern('shotgun-surgery', {
            severity: 'high',
            indicators: ['high-coupling', 'fragile'],
            file: file.path,
            suggestion: 'Encapsulate related changes, use interfaces/abstractions'
          }));
        }
      }
    }

    return antiPatterns;
  }

  /**
   * Extract architectural wisdom - learns system-level insights
   */
  private async extractArchitecturalInsights(analysis: CodebaseAnalysis): Promise<ArchitecturalInsight[]> {
    const insights: ArchitecturalInsight[] = [];

    // Analyze overall architecture
    const frameworks = new Set(analysis.files.map(f => f.framework).filter(Boolean));
    const patterns = new Set<string>();
    const scalabilityIssues: string[] = [];

    // Look for scaling bottlenecks
    for (const file of analysis.files) {
      // Synchronous blocking operations
      if (file.content.includes('readFileSync') || file.content.includes('execSync')) {
        scalabilityIssues.push('Synchronous operations detected - will block event loop under load');
      }

      // N+1 query problems
      if (file.content.match(/for.*await.*query/gi)) {
        scalabilityIssues.push('Potential N+1 query pattern - consider batch loading');
      }

      // Missing pagination
      if (file.content.includes('findAll') || file.content.includes('SELECT *')) {
        if (!file.content.includes('limit') && !file.content.includes('LIMIT')) {
          scalabilityIssues.push('Unbounded queries - add pagination for scalability');
        }
      }
    }

    if (scalabilityIssues.length > 0) {
      const insight: ArchitecturalInsight = {
        id: `scalability-${Date.now()}`,
        category: 'scalability',
        level: 'system',
        description: 'Scalability concerns detected that will impact system under load',
        impact: 'high',
        issues: scalabilityIssues,
        recommendation: 'Implement async patterns, batch loading, and pagination',
        confidence: 0.9,
        detectedAt: new Date()
      };
      
      this.architecturalWisdom.set(insight.id, insight);
      insights.push(insight);
    }

    // Security architecture insights
    const securityIssues: string[] = [];
    for (const file of analysis.files) {
      if (file.content.includes('eval(') || file.content.includes('Function(')) {
        securityIssues.push('Dynamic code execution creates injection vulnerabilities');
      }
      if (file.content.match(/password.*console\.log|console\.log.*password/gi)) {
        securityIssues.push('Sensitive data logging detected');
      }
    }

    if (securityIssues.length > 0) {
      const securityInsight: ArchitecturalInsight = {
        id: `security-${Date.now()}`,
        category: 'security',
        level: 'system',
        description: 'Security vulnerabilities in architectural decisions',
        impact: 'critical',
        issues: securityIssues,
        recommendation: 'Remove dynamic code execution, implement secure logging practices',
        confidence: 0.95,
        detectedAt: new Date()
      };
      
      this.architecturalWisdom.set(securityInsight.id, securityInsight);
      insights.push(securityInsight);
    }

    return insights;
  }

  /**
   * Build contextual knowledge - learns what works in specific contexts
   */
  private async buildContextualKnowledge(analysis: CodebaseAnalysis): Promise<ContextualKnowledge[]> {
    const knowledge: ContextualKnowledge[] = [];

    // Group by framework/context
    const contextGroups = new Map<string, typeof analysis.files>();
    for (const file of analysis.files) {
      const context = file.framework || 'general';
      if (!contextGroups.has(context)) {
        contextGroups.set(context, []);
      }
      contextGroups.get(context)!.push(file);
    }

    // Learn what works best in each context
    for (const [context, files] of contextGroups) {
      const highQualityFiles = files.filter(f => f.quality && f.quality.score > 0.8);
      const commonPatterns = this.findCommonPatterns(highQualityFiles);

      if (commonPatterns.length > 0) {
        const contextKnowledge: ContextualKnowledge = {
          id: `${context}-${Date.now()}`,
          context,
          bestPractices: commonPatterns,
          commonPitfalls: this.findCommonPitfalls(files.filter(f => f.issues && f.issues.length > 0)),
          recommendedPatterns: commonPatterns.slice(0, 5),
          confidence: this.calculateConfidence(files.length),
          learnedFrom: files.length,
          lastUpdated: new Date()
        };

        this.contextualLearnings.set(contextKnowledge.id, contextKnowledge);
        knowledge.push(contextKnowledge);
      }
    }

    return knowledge;
  }

  private findCommonPatterns(files: any[]): string[] {
    const patternCounts = new Map<string, number>();
    
    for (const file of files) {
      if (file.content.includes('async') && file.content.includes('await')) {
        patternCounts.set('async-await', (patternCounts.get('async-await') || 0) + 1);
      }
      if (file.content.includes('try') && file.content.includes('catch')) {
        patternCounts.set('error-handling', (patternCounts.get('error-handling') || 0) + 1);
      }
      if (file.content.match(/const \w+ = \(.*\) => /)) {
        patternCounts.set('arrow-functions', (patternCounts.get('arrow-functions') || 0) + 1);
      }
    }

    return Array.from(patternCounts.entries())
      .filter(([_, count]) => count > files.length * 0.5)
      .map(([pattern, _]) => pattern);
  }

  private findCommonPitfalls(files: any[]): string[] {
    const pitfalls = new Set<string>();
    for (const file of files) {
      if (file.issues) {
        file.issues.forEach((issue: any) => {
          if (issue.category) pitfalls.add(issue.category);
        });
      }
    }
    return Array.from(pitfalls);
  }

  private calculateConfidence(sampleSize: number): number {
    // More samples = higher confidence
    if (sampleSize >= 50) return 0.95;
    if (sampleSize >= 20) return 0.85;
    if (sampleSize >= 10) return 0.75;
    if (sampleSize >= 5) return 0.65;
    return 0.5;
  }

  private recordOrUpdatePattern(patternId: string, details: any): void {
    const existing = this.patterns.get(patternId);
    if (existing) {
      existing.seenCount++;
      existing.lastSeen = new Date();
    } else {
      this.patterns.set(patternId, {
        id: patternId,
        name: patternId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: 'learned',
        signatures: details.signatures || [],
        benefits: details.successIndicators || [],
        risks: [],
        confidenceScore: 0.6,
        seenCount: 1,
        successRate: 0.7,
        lastSeen: new Date(),
        learningSource: details.file || 'analysis'
      });
    }
  }

  private recordAntiPattern(antiPatternId: string, details: any): AntiPattern {
    const existing = this.antiPatterns.get(antiPatternId);
    if (existing) {
      existing.occurrences++;
      existing.lastSeen = new Date();
      return existing;
    } else {
      const antiPattern: AntiPattern = {
        id: antiPatternId,
        name: antiPatternId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        severity: details.severity,
        description: `${antiPatternId} detected in ${details.file}`,
        indicators: details.indicators,
        consequences: [`Leads to ${details.indicators.join(', ')}`],
        refactoringStrategy: details.suggestion,
        occurrences: 1,
        lastSeen: new Date()
      };
      this.antiPatterns.set(antiPatternId, antiPattern);
      return antiPattern;
    }
  }

  /**
   * Get recommendations based on learned knowledge
   */
  async getRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Find relevant patterns for this context
    const relevantPatterns = Array.from(this.patterns.values())
      .filter(p => p.successRate > 0.8 && p.seenCount > 3)
      .sort((a, b) => b.successRate - a.successRate);

    for (const pattern of relevantPatterns.slice(0, 5)) {
      recommendations.push({
        type: 'pattern',
        title: `Consider using ${pattern.name}`,
        description: `This pattern has a ${(pattern.successRate * 100).toFixed(0)}% success rate`,
        priority: pattern.successRate > 0.9 ? 'high' : 'medium',
        benefits: pattern.benefits,
        implementation: `Seen ${pattern.seenCount} times across codebases`
      });
    }

    // Warn about anti-patterns
    const relevantAntiPatterns = Array.from(this.antiPatterns.values())
      .filter(ap => ap.severity === 'high' || ap.severity === 'critical')
      .sort((a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity));

    for (const antiPattern of relevantAntiPatterns.slice(0, 3)) {
      recommendations.push({
        type: 'warning',
        title: `Avoid ${antiPattern.name}`,
        description: antiPattern.description,
        priority: antiPattern.severity === 'critical' ? 'high' : 'medium',
        benefits: [`Prevents: ${antiPattern.consequences.join(', ')}`],
        implementation: antiPattern.refactoringStrategy
      });
    }

    return recommendations;
  }

  private getSeverityScore(severity: string): number {
    const scores = { critical: 4, high: 3, medium: 2, low: 1 };
    return scores[severity as keyof typeof scores] || 0;
  }

  /**
   * Get learning statistics
   */
  getStatistics(): LearningStatistics {
    return {
      totalIterations: this.learningIterations,
      patternsLearned: this.patterns.size,
      antiPatternsIdentified: this.antiPatterns.size,
      architecturalInsights: this.architecturalWisdom.size,
      contextualKnowledge: this.contextualLearnings.size,
      averageConfidence: this.calculateAverageConfidence(),
      topPatterns: this.getTopPatterns(5),
      criticalAntiPatterns: this.getCriticalAntiPatterns()
    };
  }

  private calculateAverageConfidence(): number {
    const patterns = Array.from(this.patterns.values());
    if (patterns.length === 0) return 0;
    return patterns.reduce((sum, p) => sum + p.confidenceScore, 0) / patterns.length;
  }

  private getTopPatterns(count: number): Array<{name: string, successRate: number, uses: number}> {
    return Array.from(this.patterns.values())
      .sort((a, b) => (b.successRate * b.seenCount) - (a.successRate * a.seenCount))
      .slice(0, count)
      .map(p => ({
        name: p.name,
        successRate: p.successRate,
        uses: p.seenCount
      }));
  }

  private getCriticalAntiPatterns(): Array<{name: string, severity: string, occurrences: number}> {
    return Array.from(this.antiPatterns.values())
      .filter(ap => ap.severity === 'critical' || ap.severity === 'high')
      .map(ap => ({
        name: ap.name,
        severity: ap.severity,
        occurrences: ap.occurrences
      }));
  }
}

// Supporting interfaces
export interface CodePattern {
  id: string;
  name: string;
  category: string;
  signatures: string[];
  benefits: string[];
  risks: string[];
  confidenceScore: number;
  seenCount: number;
  successRate: number;
  lastSeen: Date;
  learningSource: string;
}

export interface AntiPattern {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  indicators: string[];
  consequences: string[];
  refactoringStrategy: string;
  occurrences: number;
  lastSeen: Date;
}

export interface ArchitecturalInsight {
  id: string;
  category: 'scalability' | 'security' | 'maintainability' | 'performance';
  level: 'component' | 'module' | 'system';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  issues: string[];
  recommendation: string;
  confidence: number;
  detectedAt: Date;
}

export interface ContextualKnowledge {
  id: string;
  context: string;
  bestPractices: string[];
  commonPitfalls: string[];
  recommendedPatterns: string[];
  confidence: number;
  learnedFrom: number;
  lastUpdated: Date;
}

export interface CodebaseAnalysis {
  codebaseId: string;
  files: Array<{
    path: string;
    content: string;
    framework?: string;
    quality?: { score: number };
    issues?: Array<{ category: string; severity: string }>;
    dependencies?: string[];
  }>;
}

export interface LearningReport {
  timestamp: Date;
  codebaseId: string;
  iterationNumber: number;
  newPatternsLearned: number;
  antiPatternsIdentified: number;
  architecturalInsights: number;
  contextualKnowledge: number;
  consciousnessLevel: number;
  temporalCoherence: number;
  learningTime: number;
  totalKnowledgeBase: {
    patterns: number;
    antiPatterns: number;
    wisdom: number;
    contextual: number;
  };
}

export interface Recommendation {
  type: 'pattern' | 'warning' | 'optimization';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  benefits: string[];
  implementation: string;
}

export interface RecommendationContext {
  framework?: string;
  projectType?: string;
  teamSize?: number;
  performanceRequirements?: string;
}

export interface LearningStatistics {
  totalIterations: number;
  patternsLearned: number;
  antiPatternsIdentified: number;
  architecturalInsights: number;
  contextualKnowledge: number;
  averageConfidence: number;
  topPatterns: Array<{name: string, successRate: number, uses: number}>;
  criticalAntiPatterns: Array<{name: string, severity: string, occurrences: number}>;
}

export default CodeLearningEngine;
