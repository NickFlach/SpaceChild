import { promptChainingService } from "./promptChaining";
import { routingEngineService } from "./routingEngine";
import { reflectionSystemService } from "./reflectionSystem";
import { planningSystemService } from "./planningSystem";
import { aiProviderService } from "../aiProviders";
import { tavilyService } from "../tavily";
import { storage } from "../../storage";

export interface AgenticRequest {
  userId: string;
  projectId?: number;
  request: string;
  context?: {
    domain?: string;
    complexity?: 'simple' | 'moderate' | 'complex' | 'advanced';
    quality_preference?: 'speed' | 'balanced' | 'quality';
    max_cost?: number;
    preferred_providers?: string[];
    enable_reflection?: boolean;
    enable_planning?: boolean;
    enable_chaining?: boolean;
  };
  metadata?: Record<string, any>;
}

export interface AgenticResponse {
  id: string;
  userId: string;
  projectId?: number;
  original_request: string;
  final_output: string;
  execution_path: string[];
  patterns_used: string[];
  total_tokens_used: number;
  total_cost: string;
  quality_score?: number;
  confidence: number;
  iterations: number;
  providers_used: string[];
  execution_time_ms: number;
  strategy?: 'simple' | 'agentic';
  webSearchResults?: any;
  metadata: {
    routing_decision?: any;
    planning_used?: boolean;
    reflection_used?: boolean;
    chaining_used?: boolean;
    multi_agent?: boolean;
    error?: boolean;
    error_message?: string;
  };
  created_at: Date;
  completed_at: Date;
}

export interface AgenticSession {
  id: string;
  userId: string;
  projectId?: number;
  status: 'initializing' | 'analyzing' | 'planning' | 'executing' | 'reflecting' | 'completed' | 'failed';
  current_step: string;
  steps_completed: string[];
  final_response?: AgenticResponse;
  created_at: Date;
}

class AgenticOrchestrationService {
  private activeSessions = new Map<string, AgenticSession>();

  async processRequest(request: AgenticRequest): Promise<AgenticResponse> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    const session: AgenticSession = {
      id: sessionId,
      userId: request.userId,
      projectId: request.projectId,
      status: 'initializing',
      current_step: 'initialization',
      steps_completed: [],
      created_at: new Date()
    };

    this.activeSessions.set(sessionId, session);

    try {
      // Step 1: Analyze the request and determine strategy
      session.status = 'analyzing';
      session.current_step = 'request_analysis';
      
      const strategy = await this.analyzeRequestAndDetermineStrategy(request, session);
      session.steps_completed.push('request_analysis');

      // Step 2: Plan execution if complex request
      let executionPlan = null;
      if (strategy.use_planning) {
        session.status = 'planning';
        session.current_step = 'planning';
        
        executionPlan = await this.createExecutionPlan(request, strategy);
        session.steps_completed.push('planning');
      }

      // Step 3: Execute with appropriate patterns
      session.status = 'executing';
      session.current_step = 'execution';
      
      const executionResult = await this.executeWithStrategy(
        request,
        strategy,
        executionPlan,
        session
      );
      session.steps_completed.push('execution');

      // Step 4: Reflect and improve if needed
      let finalOutput = executionResult.output;
      let reflectionResult = null;
      
      if (strategy.use_reflection) {
        session.status = 'reflecting';
        session.current_step = 'reflection';
        
        reflectionResult = await this.performReflection(
          finalOutput,
          request,
          executionResult.provider_used
        );
        
        if (reflectionResult.revisedOutput) {
          finalOutput = reflectionResult.revisedOutput;
        }
        session.steps_completed.push('reflection');
      }

      // Step 5: Build final response
      const endTime = Date.now();
      
      const response: AgenticResponse = {
        id: `response_${sessionId}`,
        userId: request.userId,
        projectId: request.projectId,
        original_request: request.request,
        final_output: finalOutput,
        execution_path: session.steps_completed,
        patterns_used: strategy.patterns,
        total_tokens_used: executionResult.total_tokens,
        total_cost: executionResult.total_cost,
        quality_score: reflectionResult?.reflection.overall_score,
        confidence: strategy.confidence,
        iterations: strategy.use_reflection ? 2 : 1,
        providers_used: [executionResult.provider_used],
        execution_time_ms: endTime - startTime,
        strategy: strategy.approach === 'simple' ? 'simple' : 'agentic',
        webSearchResults: executionResult.webSearchResults,
        metadata: {
          routing_decision: strategy.routing_decision,
          planning_used: strategy.use_planning,
          reflection_used: strategy.use_reflection,
          chaining_used: strategy.use_chaining,
          multi_agent: strategy.use_multi_agent
        },
        created_at: new Date(startTime),
        completed_at: new Date(endTime)
      };

      session.status = 'completed';
      session.final_response = response;

      // Store learning data
      if (request.projectId) {
        await this.storeLearningData(request, response);
      }

      return response;

    } catch (error) {
      session.status = 'failed';
      console.error('Agentic request processing failed:', error);
      
      // Return error response
      return {
        id: `error_${sessionId}`,
        userId: request.userId,
        projectId: request.projectId,
        original_request: request.request,
        final_output: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        execution_path: session.steps_completed,
        patterns_used: ['error_handling'],
        total_tokens_used: 0,
        total_cost: '0',
        confidence: 0.1,
        iterations: 0,
        providers_used: [],
        execution_time_ms: Date.now() - startTime,
        metadata: {
          error: true,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        },
        created_at: new Date(startTime),
        completed_at: new Date()
      };
    }
  }

  private async analyzeRequestAndDetermineStrategy(
    request: AgenticRequest,
    session: AgenticSession
  ): Promise<any> {
    // Analyze request complexity and characteristics
    const requestLength = request.request.length;
    const complexity = this.determineComplexity(request.request, request.context);
    const domain = this.inferDomain(request.request);

    // Get user context for routing decisions
    const userContext = await this.getUserContext(request.userId);

    // Determine task characteristics for routing
    const taskCharacteristics = {
      complexity: complexity as any,
      domain: domain as any,
      outputLength: requestLength > 1000 ? 'long' : 'medium' as any,
      latencyRequirement: request.context?.quality_preference === 'speed' ? 'high' : 'medium' as any,
      accuracyRequirement: request.context?.quality_preference === 'quality' ? 'critical' : 'high' as any,
      context: 'moderate' as any
    };

    // Get routing decision
    const routingDecision = await routingEngineService.routeTask(
      request.request,
      taskCharacteristics,
      userContext,
      {
        excludeProviders: request.context?.preferred_providers ? undefined : [],
        requireProviders: request.context?.preferred_providers,
        maxCost: request.context?.max_cost
      }
    );

    // Determine which patterns to use
    const strategy = {
      confidence: routingDecision.confidence,
      selected_provider: routingDecision.selectedProvider,
      routing_decision: routingDecision,
      use_planning: this.shouldUsePlanning(complexity, requestLength, request.context),
      use_chaining: this.shouldUseChaining(complexity, domain, request.context),
      use_reflection: this.shouldUseReflection(request.context?.quality_preference, complexity),
      use_multi_agent: this.shouldUseMultiAgent(complexity, domain),
      patterns: [] as string[]
    };

    // Build patterns list
    if (strategy.use_planning) strategy.patterns.push('planning');
    if (strategy.use_chaining) strategy.patterns.push('chaining');
    if (strategy.use_reflection) strategy.patterns.push('reflection');
    if (strategy.use_multi_agent) strategy.patterns.push('multi_agent');
    strategy.patterns.push('routing');

    return strategy;
  }

  private determineComplexity(
    request: string,
    context?: AgenticRequest['context']
  ): 'simple' | 'moderate' | 'complex' | 'advanced' {
    if (context?.complexity) return context.complexity;

    const complexityIndicators = {
      advanced: ['architecture', 'system design', 'enterprise', 'scalability', 'optimization'],
      complex: ['integration', 'database', 'api', 'security', 'performance', 'algorithm', 'research'],
      moderate: ['component', 'feature', 'functionality', 'interface', 'search', 'information'],
      simple: ['fix', 'update', 'change', 'simple', 'quick', 'find', 'what is']
    };

    const lowerRequest = request.toLowerCase();
    
    // Check for web search indicators
    const webSearchIndicators = ['current', 'latest', 'recent', 'news', 'today', 'happening', 'trends', 'real-time'];
    if (webSearchIndicators.some(indicator => lowerRequest.includes(indicator))) {
      return 'moderate'; // Web search tasks are typically moderate complexity
    }
    
    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => lowerRequest.includes(indicator))) {
        return level as any;
      }
    }

    return request.length > 500 ? 'moderate' : 'simple';
  }

  private inferDomain(request: string): string {
    const domainKeywords = {
      'web_research': ['search', 'find', 'research', 'information', 'current', 'latest', 'news', 'trends', 'real-time', 'what is happening', 'recent developments'],
      'code': ['code', 'function', 'class', 'api', 'database', 'algorithm', 'programming'],
      'analysis': ['analyze', 'review', 'evaluate', 'assess', 'examine'],
      'creative': ['design', 'ui', 'ux', 'creative', 'visual', 'artistic'],
      'reasoning': ['logic', 'reasoning', 'mathematical', 'proof', 'theory'],
      'debugging': ['bug', 'error', 'fix', 'debug', 'issue', 'problem']
    };

    const lowerRequest = request.toLowerCase();
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => lowerRequest.includes(keyword))) {
        return domain;
      }
    }

    return 'general';
  }

  private extractSearchQuery(request: string): string {
    // Extract the most relevant search terms from the request
    const searchIndicators = ['search for', 'find', 'what is', 'latest', 'current', 'recent', 'news about', 'information about'];
    const lowerRequest = request.toLowerCase();
    
    // Try to find specific search phrases
    for (const indicator of searchIndicators) {
      const index = lowerRequest.indexOf(indicator);
      if (index !== -1) {
        const afterIndicator = request.substring(index + indicator.length).trim();
        if (afterIndicator.length > 0) {
          return afterIndicator.split('.')[0].split('?')[0].trim(); // Take first sentence
        }
      }
    }
    
    // If no specific indicators found, use the request but limit length
    return request.length > 100 ? request.substring(0, 100) + '...' : request;
  }

  private async getUserContext(userId: string): Promise<any> {
    try {
      const user = await storage.getUser(userId);
      return {
        userId,
        subscriptionTier: user?.subscriptionTier || 'free',
        remainingCredits: (user?.monthlyCredits || 100) - (user?.usedCredits || 0),
        usageHistory: [],
        preferences: {}
      };
    } catch (error) {
      return {
        userId,
        subscriptionTier: 'free',
        remainingCredits: 100,
        usageHistory: [],
        preferences: {}
      };
    }
  }

  private shouldUsePlanning(
    complexity: string,
    requestLength: number,
    context?: AgenticRequest['context']
  ): boolean {
    if (context?.enable_planning === false) return false;
    if (context?.enable_planning === true) return true;
    
    return complexity === 'complex' || complexity === 'advanced' || requestLength > 1000;
  }

  private shouldUseChaining(
    complexity: string,
    domain: string,
    context?: AgenticRequest['context']
  ): boolean {
    if (context?.enable_chaining === false) return false;
    if (context?.enable_chaining === true) return true;
    
    return complexity === 'complex' || complexity === 'advanced' || 
           ['code', 'analysis'].includes(domain);
  }

  private shouldUseReflection(
    qualityPreference?: string,
    complexity?: string
  ): boolean {
    return qualityPreference === 'quality' || complexity === 'advanced';
  }

  private shouldUseMultiAgent(complexity: string, domain: string): boolean {
    return complexity === 'advanced' && ['code', 'analysis'].includes(domain);
  }

  private async createExecutionPlan(
    request: AgenticRequest,
    strategy: any
  ): Promise<any> {
    const planningContext = {
      userId: request.userId,
      projectId: request.projectId,
      domain: this.inferDomain(request.request),
      constraints: {
        timeline: 'flexible',
        budget: request.context?.max_cost,
        technical_requirements: [],
        quality_requirements: []
      },
      user_preferences: {
        preferred_providers: request.context?.preferred_providers,
        quality_vs_speed: request.context?.quality_preference || 'balanced',
        cost_sensitivity: 'medium' as 'low' | 'medium' | 'high'
      },
      project_context: request.metadata
    };

    const decompositionRequest = {
      original_request: request.request,
      context: planningContext,
      max_complexity: strategy.complexity
    };

    return await planningSystemService.decomposeGoal(decompositionRequest);
  }

  private async executeWithStrategy(
    request: AgenticRequest,
    strategy: any,
    executionPlan: any,
    session: AgenticSession
  ): Promise<any> {
    if (strategy.use_planning && executionPlan) {
      return await this.executeWithPlan(executionPlan, request, strategy);
    } else if (strategy.use_chaining) {
      return await this.executeWithChaining(request, strategy);
    } else {
      return await this.executeDirect(request, strategy);
    }
  }

  private async executeWithPlan(
    plan: any,
    request: AgenticRequest,
    strategy: any
  ): Promise<any> {
    // Execute the first few critical tasks from the plan
    let totalTokens = 0;
    let totalCost = 0;
    let finalOutput = '';

    const criticalTasks = plan.tasks.slice(0, 3); // Execute first 3 tasks
    
    for (const task of criticalTasks) {
      const taskPrompt = `Execute this task as part of a larger plan:
      
TASK: ${task.title}
DESCRIPTION: ${task.description}
ORIGINAL REQUEST: ${request.request}

Please complete this task thoroughly.`;

      const result = await aiProviderService.generateCode(
        taskPrompt,
        task.suggestedProvider,
        request.projectId
      );

      totalTokens += result.tokensUsed;
      totalCost += parseFloat(result.cost);
      finalOutput += `\n\n## ${task.title}\n${result.response}`;
    }

    return {
      output: finalOutput.trim(),
      total_tokens: totalTokens,
      total_cost: totalCost.toFixed(4),
      provider_used: strategy.selected_provider,
      execution_type: 'planned'
    };
  }

  private async executeWithChaining(
    request: AgenticRequest,
    strategy: any
  ): Promise<any> {
    // Determine appropriate chain based on request
    const chainId = this.selectChainForRequest(request.request, strategy);
    
    const chainExecution = await promptChainingService.executeChain(
      chainId,
      {
        userRequest: request.request,
        projectContext: request.metadata || {},
        domain: this.inferDomain(request.request)
      },
      request.userId,
      request.projectId
    );

    // Get the final output from the last step result
    const finalResult = chainExecution.stepResults[chainExecution.stepResults.length - 1];
    const finalOutput = finalResult?.output || 'Chain execution completed';
    
    return {
      output: finalOutput,
      total_tokens: chainExecution.totalTokensUsed,
      total_cost: chainExecution.totalCostUsd,
      provider_used: strategy.selected_provider,
      execution_type: 'chained',
      chain_id: chainId
    };
  }

  private async executeDirect(
    request: AgenticRequest,
    strategy: any
  ): Promise<any> {
    let webSearchResults = null;
    let enhancedRequest = request.request;
    
    // Check if request needs web search
    if (request.context?.domain === 'web_research' || strategy.requiresWebSearch) {
      try {
        // Perform web search
        const searchQuery = this.extractSearchQuery(request.request);
        webSearchResults = await tavilyService.quickSearch(searchQuery);
        
        // Enhance request with web search results
        enhancedRequest = `${request.request}\n\nCurrent web information:\n${JSON.stringify(webSearchResults, null, 2)}`;
      } catch (webSearchError) {
        console.warn('Web search failed during direct execution:', webSearchError);
      }
    }

    const result = await aiProviderService.generateCode(
      enhancedRequest,
      strategy.selected_provider,
      request.projectId
    );

    return {
      output: result.response,
      total_tokens: result.tokensUsed,
      total_cost: result.cost,
      provider_used: strategy.selected_provider,
      execution_type: 'direct',
      webSearchResults
    };
  }

  private selectChainForRequest(request: string, strategy: any): string {
    const lowerRequest = request.toLowerCase();
    
    if (lowerRequest.includes('bug') || lowerRequest.includes('error') || lowerRequest.includes('fix')) {
      return 'bug-analysis-chain';
    } else if (lowerRequest.includes('optimize') || lowerRequest.includes('performance')) {
      return 'optimization-chain';
    } else {
      return 'code-generation-chain';
    }
  }

  private async performReflection(
    output: string,
    request: AgenticRequest,
    providerUsed: string
  ): Promise<any> {
    const outputType = this.inferOutputType(request.request);
    
    return await reflectionSystemService.reflectAndRevise(
      output,
      outputType,
      request.request,
      'anthropic', // Use Claude for reflection
      'spaceagent'  // Use SpaceAgent for revision
    );
  }

  private inferOutputType(request: string): 'code' | 'text' | 'analysis' | 'plan' {
    const lowerRequest = request.toLowerCase();
    
    if (lowerRequest.includes('code') || lowerRequest.includes('function') || 
        lowerRequest.includes('implement') || lowerRequest.includes('program')) {
      return 'code';
    } else if (lowerRequest.includes('analyze') || lowerRequest.includes('review') || 
               lowerRequest.includes('evaluate')) {
      return 'analysis';
    } else if (lowerRequest.includes('plan') || lowerRequest.includes('strategy') || 
               lowerRequest.includes('roadmap')) {
      return 'plan';
    } else {
      return 'text';
    }
  }

  private async storeLearningData(
    request: AgenticRequest,
    response: AgenticResponse
  ): Promise<void> {
    if (!request.projectId) return;

    try {
      const { projectMemoryService } = await import("../projectMemory");
      await projectMemoryService.learnFromInteraction(
        request.projectId,
        'agentic_execution',
        JSON.stringify({
          patterns_used: response.patterns_used,
          quality_score: response.quality_score,
          execution_time: response.execution_time_ms,
          total_cost: response.total_cost,
          confidence: response.confidence,
          providers_used: response.providers_used
        }),
        {
          originalRequest: request.request,
          complexity: request.context?.complexity,
          domain: this.inferDomain(request.request),
          timestamp: response.created_at.toISOString()
        }
      );
    } catch (error) {
      console.warn('Failed to store learning data:', error);
    }
  }

  getSession(sessionId: string): AgenticSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  async getUserSessions(userId: string): Promise<AgenticSession[]> {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async getAgenticStats(userId: string): Promise<any> {
    const sessions = await this.getUserSessions(userId);
    const responses = sessions.map(s => s.final_response).filter(Boolean);
    
    if (responses.length === 0) {
      return {
        totalSessions: 0,
        averageQuality: 0,
        averageExecutionTime: 0,
        mostUsedPatterns: [],
        costEfficiency: 0
      };
    }

    const totalQuality = responses.reduce((sum, r) => sum + (r!.quality_score || 0.5), 0);
    const totalTime = responses.reduce((sum, r) => sum + r!.execution_time_ms, 0);
    const totalCost = responses.reduce((sum, r) => sum + parseFloat(r!.total_cost), 0);

    const patternCounts = responses.reduce((counts, r) => {
      for (const pattern of r!.patterns_used) {
        counts[pattern] = (counts[pattern] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);

    const mostUsedPatterns = Object.entries(patternCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pattern, count]) => ({ pattern, count }));

    return {
      totalSessions: sessions.length,
      averageQuality: totalQuality / responses.length,
      averageExecutionTime: totalTime / responses.length,
      mostUsedPatterns,
      costEfficiency: responses.length / Math.max(totalCost, 0.01) // Responses per dollar
    };
  }
}

export const agenticOrchestrationService = new AgenticOrchestrationService();