import { aiProviderService } from "../aiProviders";
import { storage } from "../../storage";

export interface TaskCharacteristics {
  complexity: 'low' | 'medium' | 'high' | 'extreme';
  domain: 'general' | 'code' | 'analysis' | 'creative' | 'math' | 'reasoning' | 'debugging' | 'web_research';
  outputLength: 'short' | 'medium' | 'long' | 'very_long';
  latencyRequirement: 'low' | 'medium' | 'high';
  accuracyRequirement: 'low' | 'medium' | 'high' | 'critical';
  context: 'minimal' | 'moderate' | 'extensive';
  requiresRealTimeInfo?: boolean;
  webSearchEnabled?: boolean;
}

export interface ProviderCapabilities {
  id: string;
  name: string;
  strengths: string[];
  weaknesses: string[];
  maxTokens: number;
  avgLatencyMs: number;
  costPerToken: number;
  reliabilityScore: number;
  complexityRating: number; // 1-10 scale
  qualityScore: number; // 1-10 scale
  supportedDomains: string[];
}

export interface RoutingRule {
  id: string;
  name: string;
  priority: number;
  conditions: {
    taskType?: string[];
    complexity?: string[];
    domain?: string[];
    userTier?: string[];
    creditThreshold?: number;
  };
  preferredProviders: string[];
  fallbackProviders: string[];
  rationale: string;
}

export interface RoutingDecision {
  selectedProvider: string;
  confidence: number;
  rationale: string;
  alternatives: Array<{
    provider: string;
    score: number;
    reason: string;
  }>;
  estimatedCost: string;
  estimatedTokens: number;
  riskFactors: string[];
}

export interface UserContext {
  userId: string;
  subscriptionTier: string;
  remainingCredits: number;
  usageHistory: any[];
  preferences: Record<string, any>;
}

class RoutingEngineService {
  private providerCapabilities = new Map<string, ProviderCapabilities>();
  private routingRules: RoutingRule[] = [];
  private performanceHistory = new Map<string, any[]>();

  constructor() {
    this.initializeProviderCapabilities();
    this.initializeRoutingRules();
  }

  private initializeProviderCapabilities() {
    // Define capabilities for each AI provider
    this.providerCapabilities.set('anthropic', {
      id: 'anthropic',
      name: 'Anthropic Claude',
      strengths: ['reasoning', 'code analysis', 'safety', 'complex tasks'],
      weaknesses: ['creative writing', 'speed'],
      maxTokens: 8192,
      avgLatencyMs: 3000,
      costPerToken: 0.008,
      reliabilityScore: 9.5,
      complexityRating: 9,
      qualityScore: 9.5,
      supportedDomains: ['code', 'analysis', 'reasoning', 'general']
    });

    this.providerCapabilities.set('openai', {
      id: 'openai',
      name: 'OpenAI GPT-4',
      strengths: ['general knowledge', 'creative tasks', 'broad capabilities'],
      weaknesses: ['cost', 'reasoning depth'],
      maxTokens: 8192,
      avgLatencyMs: 2500,
      costPerToken: 0.03,
      reliabilityScore: 9.0,
      complexityRating: 8,
      qualityScore: 9.0,
      supportedDomains: ['general', 'creative', 'code', 'analysis']
    });

    this.providerCapabilities.set('gpt-oss-120b', {
      id: 'gpt-oss-120b',
      name: 'GPT-OSS 120B',
      strengths: ['reasoning transparency', 'large context', 'tool use'],
      weaknesses: ['availability', 'cost'],
      maxTokens: 32768,
      avgLatencyMs: 4000,
      costPerToken: 0.02,
      reliabilityScore: 8.5,
      complexityRating: 9.5,
      qualityScore: 9.0,
      supportedDomains: ['reasoning', 'code', 'analysis', 'math']
    });

    this.providerCapabilities.set('gpt-oss-20b', {
      id: 'gpt-oss-20b',
      name: 'GPT-OSS 20B',
      strengths: ['cost effective', 'reasoning transparency', 'tool use'],
      weaknesses: ['complexity handling'],
      maxTokens: 8192,
      avgLatencyMs: 2000,
      costPerToken: 0.005,
      reliabilityScore: 8.0,
      complexityRating: 7,
      qualityScore: 8.0,
      supportedDomains: ['code', 'general', 'reasoning']
    });

    this.providerCapabilities.set('spaceagent', {
      id: 'spaceagent',
      name: 'SpaceAgent',
      strengths: ['consciousness', 'context awareness', 'learning'],
      weaknesses: ['general knowledge', 'speed'],
      maxTokens: 4096,
      avgLatencyMs: 3500,
      costPerToken: 0.012,
      reliabilityScore: 7.5,
      complexityRating: 8,
      qualityScore: 8.5,
      supportedDomains: ['code', 'analysis', 'reasoning']
    });

    // Add Tavily web search capabilities
    this.providerCapabilities.set('tavily', {
      id: 'tavily',
      name: 'Tavily Web Search',
      strengths: ['real-time information', 'web research', 'current events', 'fact checking'],
      weaknesses: ['complex reasoning', 'code generation'],
      maxTokens: 4096,
      avgLatencyMs: 2000,
      costPerToken: 0.001,
      reliabilityScore: 9.0,
      complexityRating: 6,
      qualityScore: 8.5,
      supportedDomains: ['web_research', 'general', 'analysis']
    });

    this.providerCapabilities.set('mindsphere', {
      id: 'mindsphere',
      name: 'MindSphere',
      strengths: ['architecture', 'optimization', 'multi-perspective'],
      weaknesses: ['simple tasks', 'speed'],
      maxTokens: 6144,
      avgLatencyMs: 4000,
      costPerToken: 0.015,
      reliabilityScore: 8.0,
      complexityRating: 9,
      qualityScore: 9.0,
      supportedDomains: ['code', 'analysis', 'reasoning']
    });

    this.providerCapabilities.set('groq', {
      id: 'groq',
      name: 'Groq',
      strengths: ['speed', 'cost effective', 'simple tasks'],
      weaknesses: ['complex reasoning', 'context length'],
      maxTokens: 4096,
      avgLatencyMs: 800,
      costPerToken: 0.001,
      reliabilityScore: 7.0,
      complexityRating: 5,
      qualityScore: 6.5,
      supportedDomains: ['general', 'code']
    });

    this.providerCapabilities.set('complexity', {
      id: 'complexity',
      name: 'Complexity Agent',
      strengths: ['fractal patterns', 'complex systems', 'recursive thinking'],
      weaknesses: ['simple tasks', 'speed'],
      maxTokens: 8192,
      avgLatencyMs: 5000,
      costPerToken: 0.020,
      reliabilityScore: 7.0,
      complexityRating: 10,
      qualityScore: 8.5,
      supportedDomains: ['reasoning', 'analysis', 'math']
    });
  }

  private initializeRoutingRules() {
    this.routingRules = [
      {
        id: 'speed-critical',
        name: 'Speed Critical Tasks',
        priority: 1,
        conditions: {
          taskType: ['quick_fix', 'simple_query'],
          complexity: ['low'],
        },
        preferredProviders: ['groq', 'gpt-oss-20b'],
        fallbackProviders: ['anthropic'],
        rationale: 'Low latency requirements prioritize fast providers'
      },
      {
        id: 'complex-reasoning',
        name: 'Complex Reasoning Tasks',
        priority: 2,
        conditions: {
          complexity: ['high', 'extreme'],
          domain: ['reasoning', 'math', 'analysis']
        },
        preferredProviders: ['gpt-oss-120b', 'complexity', 'anthropic'],
        fallbackProviders: ['mindsphere', 'spaceagent'],
        rationale: 'Complex reasoning requires advanced capabilities'
      },
      {
        id: 'architecture-analysis',
        name: 'Architecture and System Design',
        priority: 3,
        conditions: {
          domain: ['code'],
          taskType: ['architecture', 'design', 'optimization']
        },
        preferredProviders: ['mindsphere', 'anthropic'],
        fallbackProviders: ['gpt-oss-120b', 'spaceagent'],
        rationale: 'Architecture tasks benefit from multi-perspective analysis'
      },
      {
        id: 'consciousness-aware',
        name: 'Consciousness-Aware Tasks',
        priority: 4,
        conditions: {
          taskType: ['learning', 'adaptation', 'memory']
        },
        preferredProviders: ['spaceagent', 'complexity'],
        fallbackProviders: ['anthropic', 'mindsphere'],
        rationale: 'Tasks requiring consciousness benefit from specialized agents'
      },
      {
        id: 'cost-optimization',
        name: 'Cost-Conscious Users',
        priority: 5,
        conditions: {
          userTier: ['free', 'explorer'],
          creditThreshold: 50
        },
        preferredProviders: ['gpt-oss-20b', 'groq'],
        fallbackProviders: ['anthropic'],
        rationale: 'Limited credits require cost-effective providers'
      },
      {
        id: 'premium-quality',
        name: 'Premium Quality Tasks',
        priority: 6,
        conditions: {
          userTier: ['architect'],
          complexity: ['high', 'extreme']
        },
        preferredProviders: ['gpt-oss-120b', 'anthropic', 'complexity'],
        fallbackProviders: ['mindsphere'],
        rationale: 'Premium users get access to highest quality providers'
      },
      {
        id: 'debugging-specialist',
        name: 'Debugging Tasks',
        priority: 7,
        conditions: {
          domain: ['debugging'],
          taskType: ['bug_fix', 'error_analysis']
        },
        preferredProviders: ['anthropic', 'spaceagent'],
        fallbackProviders: ['gpt-oss-20b', 'openai'],
        rationale: 'Debugging requires careful analysis and reasoning'
      },
      {
        id: 'web-research',
        name: 'Web Research and Real-Time Information',
        priority: 1,
        conditions: {
          domain: ['web_research'],
          taskType: ['research', 'current_events', 'fact_check', 'web_search']
        },
        preferredProviders: ['tavily'],
        fallbackProviders: ['anthropic', 'openai'],
        rationale: 'Web research tasks require access to real-time information'
      },
      {
        id: 'real-time-info',
        name: 'Tasks Requiring Real-Time Information',
        priority: 2,
        conditions: {
          complexity: ['low', 'medium', 'high']
        },
        preferredProviders: ['tavily'],
        fallbackProviders: ['anthropic'],
        rationale: 'Tasks needing current information should use web search'
      }
    ];
  }

  async routeTask(
    taskDescription: string,
    taskCharacteristics: TaskCharacteristics,
    userContext: UserContext,
    constraints?: {
      excludeProviders?: string[];
      requireProviders?: string[];
      maxCost?: number;
    }
  ): Promise<RoutingDecision> {
    // Analyze task to extract characteristics
    const enhancedCharacteristics = await this.enhanceTaskCharacteristics(
      taskDescription,
      taskCharacteristics
    );

    // Score all available providers
    const providerScores = this.scoreProviders(
      enhancedCharacteristics,
      userContext,
      constraints
    );

    // Apply routing rules
    const ruleBasedScores = this.applyRoutingRules(
      providerScores,
      enhancedCharacteristics,
      userContext
    );

    // Factor in performance history
    const historyAdjustedScores = this.adjustForPerformanceHistory(
      ruleBasedScores,
      userContext
    );

    // Select best provider
    const sortedProviders = Object.entries(historyAdjustedScores)
      .sort(([,a], [,b]) => b.totalScore - a.totalScore)
      .filter(([providerId]) => {
        if (constraints?.excludeProviders?.includes(providerId)) return false;
        if (constraints?.requireProviders && !constraints.requireProviders.includes(providerId)) return false;
        return true;
      });

    if (sortedProviders.length === 0) {
      throw new Error('No suitable providers available');
    }

    const [selectedProviderId, selectedScore] = sortedProviders[0];
    const selectedProvider = this.providerCapabilities.get(selectedProviderId);

    if (!selectedProvider) {
      throw new Error(`Provider ${selectedProviderId} not found`);
    }

    // Estimate cost and tokens
    const estimatedTokens = this.estimateTokens(taskDescription, enhancedCharacteristics);
    const estimatedCost = (estimatedTokens * selectedProvider.costPerToken).toFixed(4);

    // Build decision object
    const decision: RoutingDecision = {
      selectedProvider: selectedProviderId,
      confidence: selectedScore.confidence,
      rationale: selectedScore.rationale,
      alternatives: sortedProviders.slice(1, 4).map(([providerId, score]) => ({
        provider: providerId,
        score: score.totalScore,
        reason: score.rationale
      })),
      estimatedCost,
      estimatedTokens,
      riskFactors: this.identifyRiskFactors(selectedProviderId, enhancedCharacteristics, userContext)
    };

    // Log decision for learning
    await this.logRoutingDecision(decision, taskCharacteristics, userContext);

    return decision;
  }

  private async enhanceTaskCharacteristics(
    taskDescription: string,
    characteristics: TaskCharacteristics
  ): Promise<TaskCharacteristics> {
    // Use simple heuristics to enhance task characteristics
    const enhanced = { ...characteristics };

    // Analyze task description for complexity indicators
    const complexityIndicators = [
      'architecture', 'system design', 'optimization', 'performance',
      'scalability', 'complex', 'advanced', 'enterprise', 'production'
    ];
    
    const creativityIndicators = [
      'creative', 'design', 'ui', 'ux', 'visual', 'artistic', 'innovative'
    ];
    
    const reasoningIndicators = [
      'algorithm', 'logic', 'mathematical', 'analytical', 'proof', 'theory'
    ];

    const description = taskDescription.toLowerCase();
    
    if (complexityIndicators.some(indicator => description.includes(indicator))) {
      enhanced.complexity = enhanced.complexity === 'low' ? 'medium' : 'high';
    }
    
    if (creativityIndicators.some(indicator => description.includes(indicator))) {
      enhanced.domain = 'creative';
    }
    
    if (reasoningIndicators.some(indicator => description.includes(indicator))) {
      enhanced.domain = 'reasoning';
    }

    return enhanced;
  }

  private scoreProviders(
    characteristics: TaskCharacteristics,
    userContext: UserContext,
    constraints?: any
  ): Record<string, any> {
    const scores: Record<string, any> = {};

    for (const [providerId, capabilities] of this.providerCapabilities) {
      let score = 0;
      let rationale: string[] = [];

      // Complexity matching
      const complexityMatch = this.getComplexityMatch(characteristics.complexity, capabilities.complexityRating);
      score += complexityMatch * 20;
      if (complexityMatch > 0.7) rationale.push(`Good complexity match (${complexityMatch.toFixed(2)})`);

      // Domain expertise
      if (capabilities.supportedDomains.includes(characteristics.domain)) {
        score += 15;
        rationale.push(`Domain expertise in ${characteristics.domain}`);
      }

      // Quality score
      score += capabilities.qualityScore * 5;

      // Reliability
      score += capabilities.reliabilityScore * 3;

      // Cost efficiency (favor lower cost for cost-conscious users)
      if (userContext.subscriptionTier === 'free' || userContext.remainingCredits < 100) {
        const costEfficiency = 1 / (capabilities.costPerToken + 0.001);
        score += costEfficiency * 10;
        if (capabilities.costPerToken < 0.01) rationale.push('Cost effective');
      }

      // Latency consideration
      if (characteristics.latencyRequirement === 'high') {
        const latencyScore = Math.max(0, 100 - (capabilities.avgLatencyMs / 1000));
        score += latencyScore * 0.5;
        if (capabilities.avgLatencyMs < 2000) rationale.push('Low latency');
      }

      scores[providerId] = {
        totalScore: score,
        rationale: rationale.join(', '),
        confidence: Math.min(0.95, score / 100)
      };
    }

    return scores;
  }

  private getComplexityMatch(taskComplexity: string, providerRating: number): number {
    const complexityMap = { low: 3, medium: 6, high: 8, extreme: 10 };
    const taskRating = complexityMap[taskComplexity as keyof typeof complexityMap] || 5;
    
    // Calculate match based on how close the provider rating is to task needs
    const difference = Math.abs(providerRating - taskRating);
    return Math.max(0, 1 - (difference / 10));
  }

  private applyRoutingRules(
    providerScores: Record<string, any>,
    characteristics: TaskCharacteristics,
    userContext: UserContext
  ): Record<string, any> {
    const adjustedScores = { ...providerScores };

    // Apply routing rules in priority order
    const applicableRules = this.routingRules
      .filter(rule => this.ruleMatches(rule, characteristics, userContext))
      .sort((a, b) => a.priority - b.priority);

    for (const rule of applicableRules) {
      // Boost preferred providers
      for (const providerId of rule.preferredProviders) {
        if (adjustedScores[providerId]) {
          adjustedScores[providerId].totalScore += 25;
          adjustedScores[providerId].rationale += `, ${rule.rationale}`;
        }
      }

      // Slight boost for fallback providers
      for (const providerId of rule.fallbackProviders) {
        if (adjustedScores[providerId]) {
          adjustedScores[providerId].totalScore += 10;
        }
      }
    }

    return adjustedScores;
  }

  private ruleMatches(
    rule: RoutingRule,
    characteristics: TaskCharacteristics,
    userContext: UserContext
  ): boolean {
    const conditions = rule.conditions;

    if (conditions.complexity && !conditions.complexity.includes(characteristics.complexity)) {
      return false;
    }

    if (conditions.domain && !conditions.domain.includes(characteristics.domain)) {
      return false;
    }

    if (conditions.userTier && !conditions.userTier.includes(userContext.subscriptionTier)) {
      return false;
    }

    if (conditions.creditThreshold && userContext.remainingCredits > conditions.creditThreshold) {
      return false;
    }

    return true;
  }

  private adjustForPerformanceHistory(
    providerScores: Record<string, any>,
    userContext: UserContext
  ): Record<string, any> {
    const adjustedScores = { ...providerScores };
    const userHistory = this.performanceHistory.get(userContext.userId) || [];

    for (const [providerId, score] of Object.entries(adjustedScores)) {
      const providerHistory = userHistory.filter((h: any) => h.provider === providerId);
      
      if (providerHistory.length > 0) {
        const avgSuccess = providerHistory.reduce((sum: number, h: any) => sum + h.success, 0) / providerHistory.length;
        const avgSatisfaction = providerHistory.reduce((sum: number, h: any) => sum + (h.satisfaction || 0.5), 0) / providerHistory.length;
        
        const historyBonus = (avgSuccess * avgSatisfaction - 0.5) * 20;
        adjustedScores[providerId].totalScore += historyBonus;
        
        if (historyBonus > 5) {
          adjustedScores[providerId].rationale += ', Good past performance';
        }
      }
    }

    return adjustedScores;
  }

  private estimateTokens(taskDescription: string, characteristics: TaskCharacteristics): number {
    let baseTokens = Math.max(100, taskDescription.length / 4); // Rough token estimate

    const multipliers = {
      low: 1.5,
      medium: 2.5,
      high: 4.0,
      extreme: 6.0
    };

    const outputMultipliers = {
      short: 1,
      medium: 2,
      long: 4,
      very_long: 8
    };

    return Math.round(baseTokens * multipliers[characteristics.complexity] * outputMultipliers[characteristics.outputLength]);
  }

  private identifyRiskFactors(
    providerId: string,
    characteristics: TaskCharacteristics,
    userContext: UserContext
  ): string[] {
    const risks: string[] = [];
    const provider = this.providerCapabilities.get(providerId);

    if (!provider) return risks;

    // Cost risk
    const estimatedCost = this.estimateTokens('', characteristics) * provider.costPerToken;
    if (estimatedCost > userContext.remainingCredits * 0.1) {
      risks.push('High cost relative to remaining credits');
    }

    // Complexity mismatch
    if (characteristics.complexity === 'extreme' && provider.complexityRating < 8) {
      risks.push('Provider may struggle with extreme complexity');
    }

    // Reliability concerns
    if (provider.reliabilityScore < 8.0) {
      risks.push('Lower reliability score');
    }

    // Domain mismatch
    if (!provider.supportedDomains.includes(characteristics.domain)) {
      risks.push(`Limited expertise in ${characteristics.domain}`);
    }

    return risks;
  }

  private async logRoutingDecision(
    decision: RoutingDecision,
    characteristics: TaskCharacteristics,
    userContext: UserContext
  ): Promise<void> {
    try {
      // Store routing decision for learning and optimization
      const logEntry = {
        timestamp: new Date(),
        userId: userContext.userId,
        selectedProvider: decision.selectedProvider,
        confidence: decision.confidence,
        characteristics,
        estimatedCost: decision.estimatedCost,
        alternatives: decision.alternatives
      };

      // Store in memory for now (could be database later)
      if (!this.performanceHistory.has(userContext.userId)) {
        this.performanceHistory.set(userContext.userId, []);
      }
      
      const userHistory = this.performanceHistory.get(userContext.userId)!;
      userHistory.push(logEntry);

      // Keep only last 100 entries per user
      if (userHistory.length > 100) {
        userHistory.splice(0, userHistory.length - 100);
      }

    } catch (error) {
      console.warn('Failed to log routing decision:', error);
    }
  }

  async recordTaskOutcome(
    userId: string,
    providerId: string,
    success: boolean,
    satisfaction: number,
    actualCost: string,
    actualTokens: number
  ): Promise<void> {
    const userHistory = this.performanceHistory.get(userId) || [];
    const lastDecision = userHistory[userHistory.length - 1];

    if (lastDecision && lastDecision.selectedProvider === providerId) {
      lastDecision.actualSuccess = success;
      lastDecision.actualSatisfaction = satisfaction;
      lastDecision.actualCost = actualCost;
      lastDecision.actualTokens = actualTokens;
    }
  }

  getProviderCapabilities(): ProviderCapabilities[] {
    return Array.from(this.providerCapabilities.values());
  }

  getRoutingRules(): RoutingRule[] {
    return [...this.routingRules];
  }

  async getRoutingStats(userId: string): Promise<any> {
    const history = this.performanceHistory.get(userId) || [];
    
    const stats = {
      totalDecisions: history.length,
      providerUsage: {} as Record<string, number>,
      avgConfidence: 0,
      successRate: 0
    };

    if (history.length === 0) return stats;

    for (const entry of history) {
      stats.providerUsage[entry.selectedProvider] = (stats.providerUsage[entry.selectedProvider] || 0) + 1;
      stats.avgConfidence += entry.confidence;
      
      if (entry.actualSuccess !== undefined) {
        stats.successRate += entry.actualSuccess ? 1 : 0;
      }
    }

    stats.avgConfidence /= history.length;
    stats.successRate /= history.filter((h: any) => h.actualSuccess !== undefined).length || 1;

    return stats;
  }
}

export const routingEngineService = new RoutingEngineService();