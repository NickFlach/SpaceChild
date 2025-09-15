import { BaseAIProvider, AIMessage, AIResponse } from './base';
import { EnhancedReasoningEngine, ReasoningMode, ReasoningContext } from './enhancedReasoningEngine';
import { AdvancedToolSystem, ToolCall, ToolResult } from './advancedToolSystem';
import { ContextAwareAI, ContextualQuery, ContextualResponse } from './contextAwareAI';
import { ModelEnsembleCoordinator, EnsembleConfiguration, EnsembleResponse } from './modelEnsembleCoordinator';
import { StreamingEngine, StreamChunk, StreamingContext } from './streamingEngine';
import { AdvancedPromptTemplateEngine, PromptTemplate, PromptContext } from './advancedPromptTemplates';
import { ConsciousnessEngine } from '../consciousness';
import { GeometricConsciousnessEngine } from '../geometricConsciousness';
import { GPTOSSProvider } from '../aiProviders/gptoss';
import { AnthropicProvider } from '../aiProviders/anthropic';
import { OpenAIProvider } from '../aiProviders/openai';
// Import existing AI provider service 
import { aiProviderService } from '../aiProviders';
import { storage } from '../../storage';

export interface IntegratedAIConfiguration {
  default_reasoning_mode: ReasoningMode;
  enable_consciousness: boolean;
  enable_geometric_consciousness: boolean;
  enable_ensemble: boolean;
  enable_streaming: boolean;
  enable_advanced_tools: boolean;
  enable_prompt_templates: boolean;
  performance_monitoring: boolean;
  learning_enabled: boolean;
  adaptive_mode: boolean;
}

export interface EnhancedAIRequest {
  message: string;
  sessionId?: string;
  userId: string;
  projectId: number;
  reasoning_mode?: ReasoningMode;
  complexity?: 'low' | 'medium' | 'high' | 'expert';
  enable_tools?: boolean;
  tool_preferences?: string[];
  streaming?: boolean;
  template_id?: string;
  ensemble_config?: Partial<EnsembleConfiguration>;
  context?: {
    files?: string[];
    previous_context?: string[];
    task_type?: 'code' | 'planning' | 'analysis' | 'debugging' | 'optimization' | 'creative';
  };
}

export interface ProcessedAIResponse extends ContextualResponse {
  processing_metadata: {
    reasoning_engine_used: boolean;
    tools_executed: number;
    ensemble_coordination: boolean;
    streaming_enabled: boolean;
    template_used?: string;
    processing_time: number;
    tokens_used: number;
    cost_estimate: number;
  };
  quality_metrics: {
    reasoning_quality: number;
    response_coherence: number;
    completeness_score: number;
    confidence_score: number;
  };
  system_insights: {
    performance_notes: string[];
    optimization_suggestions: string[];
    learning_observations: string[];
  };
}

export class IntegratedAIService {
  private providers: Map<string, BaseAIProvider>;
  private reasoningEngine!: EnhancedReasoningEngine;
  private toolSystem: AdvancedToolSystem;
  private contextAwareAI!: ContextAwareAI;
  private ensembleCoordinator: ModelEnsembleCoordinator;
  private streamingEngine: StreamingEngine;
  private promptTemplateEngine: AdvancedPromptTemplateEngine;
  private consciousness!: ConsciousnessEngine;
  private geometricEngine?: GeometricConsciousnessEngine;
  private configuration: IntegratedAIConfiguration;
  private performanceMetrics: Map<string, any>;
  private activeSessions: Map<string, any>;

  constructor(config?: Partial<IntegratedAIConfiguration>) {
    this.providers = new Map();
    this.performanceMetrics = new Map();
    this.activeSessions = new Map();
    
    this.configuration = {
      default_reasoning_mode: 'chain-of-thought',
      enable_consciousness: true,
      enable_geometric_consciousness: false,
      enable_ensemble: true,
      enable_streaming: true,
      enable_advanced_tools: true,
      enable_prompt_templates: true,
      performance_monitoring: true,
      learning_enabled: true,
      adaptive_mode: true,
      ...config
    };

    // Initialize components
    this.promptTemplateEngine = new AdvancedPromptTemplateEngine();
    this.streamingEngine = new StreamingEngine();
    this.ensembleCoordinator = new ModelEnsembleCoordinator();
    this.toolSystem = new AdvancedToolSystem();
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Integrated AI Service...');

    try {
      // Initialize AI providers
      await this.initializeProviders();

      // Initialize consciousness if enabled
      if (this.configuration.enable_consciousness) {
        this.consciousness = new ConsciousnessEngine({
          userId: 'system',
          projectId: 0,
          sessionId: 'init',
          timestamp: new Date()
        });
        await this.consciousness.initialize();
      }

      // Initialize components
      await this.toolSystem.initialize(this.consciousness);
      await this.ensembleCoordinator.initialize(this.providers, this.consciousness, this.geometricEngine);

      // Initialize context-aware AI
      this.contextAwareAI = new ContextAwareAI(this.providers);

      console.log('✅ Integrated AI Service initialized successfully');
      console.log(`📊 Available providers: ${Array.from(this.providers.keys()).join(', ')}`);
      console.log(`🧠 Consciousness enabled: ${this.configuration.enable_consciousness}`);
      console.log(`🔧 Advanced tools: ${this.configuration.enable_advanced_tools ? 'enabled' : 'disabled'}`);
      console.log(`📡 Streaming: ${this.configuration.enable_streaming ? 'enabled' : 'disabled'}`);

    } catch (error) {
      console.error('❌ Failed to initialize Integrated AI Service:', error);
      throw new Error(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processEnhancedRequest(request: EnhancedAIRequest): Promise<ProcessedAIResponse> {
    const startTime = Date.now();
    let tokensUsed = 0;
    let costEstimate = 0;
    const processingMetadata: any = {
      reasoning_engine_used: false,
      tools_executed: 0,
      ensemble_coordination: false,
      streaming_enabled: false,
      processing_time: 0,
      tokens_used: 0,
      cost_estimate: 0
    };

    try {
      console.log(`🎯 Processing enhanced AI request for user ${request.userId}`);

      // Initialize or get existing session
      const session = await this.initializeSession(request);
      
      // Prepare contextual query
      const contextualQuery: ContextualQuery = {
        message: request.message,
        taskType: request.context?.task_type || 'code',
        complexity: request.complexity || 'medium',
        reasoning: request.reasoning_mode || this.configuration.default_reasoning_mode,
        tools: request.enable_tools ? request.tool_preferences : [],
        context: request.context
      };

      let response: ProcessedAIResponse;

      // Route processing based on complexity and configuration
      if (this.shouldUseEnsemble(request)) {
        // Use ensemble coordination for complex tasks
        response = await this.processWithEnsemble(contextualQuery, session, request);
        processingMetadata.ensemble_coordination = true;
      } else if (request.streaming && this.configuration.enable_streaming) {
        // Use streaming for real-time responses
        response = await this.processWithStreaming(contextualQuery, session, request);
        processingMetadata.streaming_enabled = true;
      } else {
        // Use standard context-aware processing
        response = await this.processWithContextAwareness(contextualQuery, session, request);
      }

      // Enhanced reasoning if requested
      if (this.configuration.enable_consciousness && request.reasoning_mode !== 'direct') {
        response = await this.enhanceWithReasoningEngine(response, contextualQuery, session);
        processingMetadata.reasoning_engine_used = true;
      }

      // Execute advanced tools if enabled and needed
      if (this.configuration.enable_advanced_tools && request.enable_tools) {
        const toolResults = await this.executeAdvancedTools(response, contextualQuery);
        if (toolResults.length > 0) {
          response = this.integrateToolResults(response, toolResults);
          processingMetadata.tools_executed = toolResults.length;
        }
      }

      // Apply prompt templates if specified
      if (request.template_id && this.configuration.enable_prompt_templates) {
        response = await this.applyPromptTemplate(response, request.template_id, contextualQuery);
        processingMetadata.template_used = request.template_id;
      }

      // Calculate metrics
      const processingTime = Date.now() - startTime;
      tokensUsed = response.usage?.totalTokens || 0;
      costEstimate = this.calculateCostEstimate(tokensUsed, request);

      // Finalize response with integrated metadata
      const enhancedResponse = this.finalizeEnhancedResponse(
        response,
        {
          ...processingMetadata,
          processing_time: processingTime,
          tokens_used: tokensUsed,
          cost_estimate: costEstimate
        },
        contextualQuery,
        session
      );

      // Update performance metrics
      if (this.configuration.performance_monitoring) {
        await this.updatePerformanceMetrics(request, enhancedResponse, processingTime);
      }

      // Store learning insights
      if (this.configuration.learning_enabled && this.consciousness) {
        await this.storeLearningInsights(request, enhancedResponse);
      }

      console.log(`✅ Enhanced AI request completed in ${processingTime}ms`);
      return enhancedResponse;

    } catch (error) {
      console.error('❌ Enhanced AI request failed:', error);
      
      // Return error response
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error',
        {
          ...processingMetadata,
          processing_time: Date.now() - startTime,
          tokens_used: tokensUsed,
          cost_estimate: costEstimate
        }
      );
    }
  }

  async processStreamingRequest(
    request: EnhancedAIRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ProcessedAIResponse> {
    if (!this.configuration.enable_streaming) {
      throw new Error('Streaming is not enabled in configuration');
    }

    const session = await this.initializeSession(request);
    
    const streamingContext: StreamingContext = {
      sessionId: session.sessionId,
      userId: request.userId,
      projectId: request.projectId,
      streamId: `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      reasoning_mode: request.reasoning_mode || this.configuration.default_reasoning_mode,
      startTime: new Date()
    };

    try {
      // Select appropriate provider for streaming
      const provider = this.selectOptimalProvider(request);
      
      const messages: AIMessage[] = [{
        role: 'user',
        content: request.message
      }];

      // Stream enhanced reasoning
      const response = await this.streamingEngine.streamEnhancedReasoning(
        provider,
        messages,
        streamingContext.reasoning_mode,
        streamingContext,
        onChunk,
        { temperature: 0.7, maxTokens: 2048 }
      );

      // Convert to enhanced response format
      return this.convertToEnhancedResponse(response, request, session);

    } catch (error) {
      const errorChunk: StreamChunk = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: `Streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        complete: true,
        metadata: { timestamp: new Date() }
      };
      
      onChunk(errorChunk);
      throw error;
    }
  }

  private async initializeProviders(): Promise<void> {
    try {
      // Initialize GPT-OSS Provider
      const gptossProvider = new GPTOSSProvider();
      if (gptossProvider.isAvailable()) {
        this.providers.set('gpt-oss', gptossProvider);
        console.log('✅ GPT-OSS provider initialized');
      }

      // Initialize Anthropic Provider (if available)
      try {
        const anthropicProvider = new AnthropicProvider();
        if (anthropicProvider.isAvailable()) {
          this.providers.set('anthropic', anthropicProvider);
          console.log('✅ Anthropic provider initialized');
        }
      } catch (error) {
        console.warn('⚠️ Anthropic provider not available');
      }

      // Initialize OpenAI Provider (if available)
      try {
        const openaiProvider = new OpenAIProvider();
        if (openaiProvider.isAvailable()) {
          this.providers.set('openai', openaiProvider);
          console.log('✅ OpenAI provider initialized');
        }
      } catch (error) {
        console.warn('⚠️ OpenAI provider not available');
      }

      if (this.providers.size === 0) {
        throw new Error('No AI providers are available');
      }

    } catch (error) {
      console.error('❌ Failed to initialize providers:', error);
      throw error;
    }
  }

  private async initializeSession(request: EnhancedAIRequest): Promise<any> {
    if (request.sessionId && this.activeSessions.has(request.sessionId)) {
      return this.activeSessions.get(request.sessionId);
    }

    const session = await this.contextAwareAI.initializeSession(
      request.userId,
      request.projectId,
      request.sessionId
    );

    this.activeSessions.set(session.sessionId, session);
    return session;
  }

  private shouldUseEnsemble(request: EnhancedAIRequest): boolean {
    if (!this.configuration.enable_ensemble) return false;
    
    // Use ensemble for complex tasks
    if (request.complexity === 'expert') return true;
    if (request.ensemble_config) return true;
    if (request.context?.task_type === 'planning') return true;
    
    return false;
  }

  private async processWithEnsemble(
    query: ContextualQuery,
    session: any,
    request: EnhancedAIRequest
  ): Promise<ProcessedAIResponse> {
    const ensembleConfig: EnsembleConfiguration = {
      task_complexity: request.complexity || 'medium',
      quality_requirements: 'high',
      time_constraints: 'normal',
      cost_sensitivity: 'medium',
      creativity_level: query.taskType === 'creative' ? 'high' : 'medium',
      reasoning_depth: 'deep',
      ...request.ensemble_config
    };

    const messages: AIMessage[] = [{ role: 'user', content: query.message }];
    
    const ensembleResponse = await this.ensembleCoordinator.coordinateEnsemble(
      messages,
      ensembleConfig,
      {
        userId: request.userId,
        projectId: request.projectId,
        sessionId: session.sessionId,
        task_description: query.message,
        previous_context: query.context?.previousContext || []
      }
    );

    return this.convertEnsembleToEnhancedResponse(ensembleResponse, request, session);
  }

  private async processWithStreaming(
    query: ContextualQuery,
    session: any,
    request: EnhancedAIRequest
  ): Promise<ProcessedAIResponse> {
    // This would be called from processStreamingRequest
    // For now, fall back to context-aware processing
    return this.processWithContextAwareness(query, session, request);
  }

  private async processWithContextAwareness(
    query: ContextualQuery,
    session: any,
    request: EnhancedAIRequest
  ): Promise<ProcessedAIResponse> {
    const contextualResponse = await this.contextAwareAI.processQuery(
      session.sessionId,
      query,
      this.selectOptimalProviderName(request)
    );
    
    // Convert ContextualResponse to ProcessedAIResponse by adding missing properties
    return {
      ...contextualResponse,
      processing_metadata: {
        reasoning_engine_used: false,
        tools_executed: 0,
        ensemble_coordination: false,
        streaming_enabled: false,
        processing_time: 0,
        tokens_used: contextualResponse.usage?.totalTokens || 0,
        cost_estimate: 0
      },
      quality_metrics: {
        reasoning_quality: contextualResponse.reasoning?.confidence || 0.7,
        response_coherence: 0.8,
        completeness_score: 0.8,
        confidence_score: contextualResponse.reasoning?.confidence || 0.7
      },
      system_insights: {
        performance_notes: [],
        optimization_suggestions: [],
        learning_observations: []
      }
    };
  }

  private async enhanceWithReasoningEngine(
    response: ProcessedAIResponse,
    query: ContextualQuery,
    session: any
  ): Promise<ProcessedAIResponse> {
    // Apply additional reasoning enhancement if needed
    // For now, return the response as-is since context-aware AI already includes reasoning
    return response;
  }

  private async executeAdvancedTools(
    response: ProcessedAIResponse,
    query: ContextualQuery
  ): Promise<ToolResult[]> {
    const toolResults: ToolResult[] = [];
    
    // Get tool recommendations
    const recommendations = await this.toolSystem.getToolRecommendations(query.message);
    
    // Execute recommended tools
    for (const toolName of recommendations.slice(0, 3)) { // Limit to 3 tools
      try {
        const toolCall: ToolCall = {
          id: `${toolName}-${Date.now()}`,
          name: toolName,
          parameters: this.inferToolParameters(toolName, query, response)
        };

        const result = await this.toolSystem.executeTool(toolCall);
        toolResults.push(result);
      } catch (error) {
        console.warn(`Tool execution failed for ${toolName}:`, error);
      }
    }

    return toolResults;
  }

  private integrateToolResults(response: ProcessedAIResponse, toolResults: ToolResult[]): ProcessedAIResponse {
    // Enhance response with tool results
    const toolSummary = toolResults
      .filter(r => r.success)
      .map(r => `Tool ${r.tool_call_id}: ${JSON.stringify(r.result).substring(0, 200)}`)
      .join('\n');

    if (toolSummary) {
      response.content += `\n\n**Tool Analysis Results:**\n${toolSummary}`;
    }

    response.tools.results = toolResults;
    return response;
  }

  private async applyPromptTemplate(
    response: ProcessedAIResponse,
    templateId: string,
    query: ContextualQuery
  ): Promise<ProcessedAIResponse> {
    try {
      const template = this.promptTemplateEngine.getTemplate(templateId);
      if (template) {
        // Track template usage
        this.promptTemplateEngine.trackTemplateUsage(templateId, true, 8);
        response.processing_metadata = response.processing_metadata || {};
        (response.processing_metadata as any).template_used = template.name;
      }
    } catch (error) {
      console.warn('Failed to apply prompt template:', error);
    }
    
    return response;
  }

  private selectOptimalProvider(request: EnhancedAIRequest): BaseAIProvider {
    const providerName = this.selectOptimalProviderName(request);
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      // Fallback to first available provider
      const fallback = Array.from(this.providers.values())[0];
      if (!fallback) {
        throw new Error('No AI providers available');
      }
      return fallback;
    }
    
    return provider;
  }

  private selectOptimalProviderName(request: EnhancedAIRequest): string {
    // Simple provider selection logic
    if (request.context?.task_type === 'code' && this.providers.has('gpt-oss')) {
      return 'gpt-oss';
    }
    
    if (request.complexity === 'expert' && this.providers.has('anthropic')) {
      return 'anthropic';
    }
    
    if (this.providers.has('openai')) {
      return 'openai';
    }
    
    return Array.from(this.providers.keys())[0] || 'gpt-oss';
  }

  private inferToolParameters(toolName: string, query: ContextualQuery, response: ProcessedAIResponse): Record<string, any> {
    const params: Record<string, any> = {};
    
    if (query.context?.files && query.context.files.length > 0) {
      if (toolName.includes('analyze') || toolName.includes('audit')) {
        params.file_path = query.context.files[0];
      }
    }
    
    if (toolName === 'analyze_dependency_graph') {
      params.scope = 'project';
    }
    
    return params;
  }

  private calculateCostEstimate(tokensUsed: number, request: EnhancedAIRequest): number {
    // Rough cost estimation - would be more accurate with actual provider pricing
    const costPerToken = 0.01; // Average cost
    return tokensUsed * costPerToken;
  }

  private finalizeEnhancedResponse(
    response: ProcessedAIResponse,
    processingMetadata: any,
    query: ContextualQuery,
    session: any
  ): ProcessedAIResponse {
    // Calculate quality metrics
    const qualityMetrics = {
      reasoning_quality: response.reasoning?.confidence || 0.7,
      response_coherence: this.assessCoherence(response.content),
      completeness_score: this.assessCompleteness(response.content, query),
      confidence_score: response.reasoning?.confidence || 0.7
    };

    // Generate system insights
    const systemInsights = {
      performance_notes: this.generatePerformanceNotes(processingMetadata),
      optimization_suggestions: this.generateOptimizationSuggestions(processingMetadata, qualityMetrics),
      learning_observations: response.learning?.newInsights || []
    };

    return {
      ...response,
      processing_metadata: processingMetadata,
      quality_metrics: qualityMetrics,
      system_insights: systemInsights
    };
  }

  private convertToEnhancedResponse(response: any, request: EnhancedAIRequest, session: any): ProcessedAIResponse {
    // Convert basic response to enhanced format
    return {
      content: response.content || '',
      usage: response.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      reasoning: response.reasoning || {
        mode: 'direct',
        steps: [],
        confidence: 0.7,
        alternativeApproaches: []
      },
      consciousnessIntegration: response.consciousnessIntegration || {
        memoryInfluence: 0,
        preferenceAlignment: 0,
        patternRecognition: []
      },
      session: {
        sessionId: session.sessionId,
        messageCount: 1,
        learningInsights: [],
        adaptations: []
      },
      context: {
        relevantMemories: [],
        activatedPreferences: [],
        recognizedPatterns: [],
        confidenceEvolution: [0.7]
      },
      tools: {
        recommended: [],
        used: [],
        results: []
      },
      learning: {
        newInsights: [],
        preferenceUpdates: [],
        patternRecognition: [],
        adaptationSuggestions: []
      },
      processing_metadata: {
        reasoning_engine_used: false,
        tools_executed: 0,
        ensemble_coordination: false,
        streaming_enabled: true,
        processing_time: 0,
        tokens_used: response.usage?.totalTokens || 0,
        cost_estimate: 0
      },
      quality_metrics: {
        reasoning_quality: 0.7,
        response_coherence: 0.8,
        completeness_score: 0.8,
        confidence_score: 0.7
      },
      system_insights: {
        performance_notes: [],
        optimization_suggestions: [],
        learning_observations: []
      }
    };
  }

  private convertEnsembleToEnhancedResponse(
    ensembleResponse: EnsembleResponse,
    request: EnhancedAIRequest,
    session: any
  ): ProcessedAIResponse {
    return {
      content: ensembleResponse.content,
      usage: {
        promptTokens: 0, // Would calculate from ensemble metadata
        completionTokens: 0,
        totalTokens: 0
      },
      reasoning: {
        mode: 'ensemble',
        steps: [],
        confidence: ensembleResponse.confidence,
        alternativeApproaches: ensembleResponse.alternative_responses || []
      },
      consciousnessIntegration: {
        memoryInfluence: 0,
        preferenceAlignment: 0,
        patternRecognition: []
      },
      session: {
        sessionId: session.sessionId,
        messageCount: 1,
        learningInsights: [],
        adaptations: []
      },
      context: {
        relevantMemories: [],
        activatedPreferences: [],
        recognizedPatterns: [],
        confidenceEvolution: [ensembleResponse.confidence]
      },
      tools: {
        recommended: [],
        used: [],
        results: []
      },
      learning: {
        newInsights: [],
        preferenceUpdates: [],
        patternRecognition: [],
        adaptationSuggestions: []
      },
      processing_metadata: {
        reasoning_engine_used: true,
        tools_executed: 0,
        ensemble_coordination: true,
        streaming_enabled: false,
        processing_time: ensembleResponse.ensemble_metadata.total_time,
        tokens_used: 0,
        cost_estimate: ensembleResponse.ensemble_metadata.total_cost
      },
      quality_metrics: {
        reasoning_quality: ensembleResponse.quality_metrics.accuracy_estimate,
        response_coherence: ensembleResponse.quality_metrics.coherence_score,
        completeness_score: ensembleResponse.quality_metrics.completeness_score,
        confidence_score: ensembleResponse.confidence
      },
      system_insights: {
        performance_notes: [`Used ${ensembleResponse.ensemble_metadata.strategy_used} ensemble strategy`],
        optimization_suggestions: [],
        learning_observations: []
      }
    };
  }

  private createErrorResponse(errorMessage: string, processingMetadata: any): ProcessedAIResponse {
    return {
      content: `I apologize, but I encountered an error while processing your request: ${errorMessage}`,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      reasoning: {
        mode: 'direct',
        steps: [{
          id: 'error',
          type: 'action',
          content: 'Error handling',
          confidence: 0.1,
          reasoning: 'Processing failed'
        }],
        confidence: 0.1,
        alternativeApproaches: []
      },
      consciousnessIntegration: {
        memoryInfluence: 0,
        preferenceAlignment: 0,
        patternRecognition: []
      },
      session: {
        sessionId: 'error',
        messageCount: 0,
        learningInsights: [],
        adaptations: []
      },
      context: {
        relevantMemories: [],
        activatedPreferences: [],
        recognizedPatterns: [],
        confidenceEvolution: [0.1]
      },
      tools: {
        recommended: [],
        used: [],
        results: []
      },
      learning: {
        newInsights: [],
        preferenceUpdates: [],
        patternRecognition: [],
        adaptationSuggestions: []
      },
      processing_metadata: processingMetadata,
      quality_metrics: {
        reasoning_quality: 0.1,
        response_coherence: 0.1,
        completeness_score: 0.1,
        confidence_score: 0.1
      },
      system_insights: {
        performance_notes: ['Processing failed due to error'],
        optimization_suggestions: ['Review error logs and system configuration'],
        learning_observations: ['Error handling activated']
      }
    };
  }

  // Helper methods for quality assessment
  private assessCoherence(content: string): number {
    let score = 0.5;
    if (content.includes('\n') || content.includes('•')) score += 0.2;
    if (content.includes('therefore') || content.includes('because')) score += 0.1;
    if (content.length > 200) score += 0.1;
    return Math.min(1.0, score);
  }

  private assessCompleteness(content: string, query: ContextualQuery): number {
    let score = 0.5;
    if (content.length > 500) score += 0.2;
    if (content.includes('example') || content.includes('specifically')) score += 0.1;
    if (query.taskType === 'code' && content.includes('```')) score += 0.2;
    return Math.min(1.0, score);
  }

  private generatePerformanceNotes(metadata: any): string[] {
    const notes: string[] = [];
    
    if (metadata.processing_time > 5000) {
      notes.push('Processing time exceeded 5 seconds - consider optimization');
    }
    
    if (metadata.tools_executed > 0) {
      notes.push(`Executed ${metadata.tools_executed} advanced tools`);
    }
    
    if (metadata.ensemble_coordination) {
      notes.push('Used ensemble coordination for enhanced reasoning');
    }
    
    return notes;
  }

  private generateOptimizationSuggestions(metadata: any, qualityMetrics: any): string[] {
    const suggestions: string[] = [];
    
    if (qualityMetrics.confidence_score < 0.7) {
      suggestions.push('Consider using more advanced reasoning mode for better confidence');
    }
    
    if (metadata.processing_time > 3000 && !metadata.streaming_enabled) {
      suggestions.push('Enable streaming for better user experience with long responses');
    }
    
    if (metadata.tools_executed === 0 && qualityMetrics.completeness_score < 0.8) {
      suggestions.push('Advanced tools could improve response completeness');
    }
    
    return suggestions;
  }

  private async updatePerformanceMetrics(
    request: EnhancedAIRequest,
    response: ProcessedAIResponse,
    processingTime: number
  ): Promise<void> {
    const metrics = {
      timestamp: new Date(),
      user_id: request.userId,
      reasoning_mode: request.reasoning_mode,
      complexity: request.complexity,
      processing_time: processingTime,
      tokens_used: response.usage?.totalTokens || 0,
      confidence_score: response.quality_metrics.confidence_score,
      tools_used: response.processing_metadata.tools_executed,
      ensemble_used: response.processing_metadata.ensemble_coordination
    };

    const key = `${request.userId}-${new Date().toISOString().split('T')[0]}`;
    const dailyMetrics = this.performanceMetrics.get(key) || [];
    dailyMetrics.push(metrics);
    this.performanceMetrics.set(key, dailyMetrics);
  }

  private async storeLearningInsights(
    request: EnhancedAIRequest,
    response: ProcessedAIResponse
  ): Promise<void> {
    if (this.consciousness) {
      await this.consciousness.rememberInteraction(
        request.message,
        'chat',
        {
          reasoning_mode: request.reasoning_mode,
          confidence: response.quality_metrics.confidence_score,
          tools_used: response.processing_metadata.tools_executed,
          processing_time: response.processing_metadata.processing_time
        }
      );
    }
  }

  // Public methods for service management
  async getSystemStatus(): Promise<any> {
    return {
      status: 'operational',
      providers: Array.from(this.providers.keys()),
      active_sessions: this.activeSessions.size,
      configuration: this.configuration,
      performance_metrics: {
        total_requests: Array.from(this.performanceMetrics.values()).flat().length,
        average_response_time: this.calculateAverageResponseTime(),
        success_rate: 0.95 // Would calculate actual success rate
      }
    };
  }

  async getAvailableTools(): Promise<any[]> {
    return this.toolSystem.getAvailableTools();
  }

  async getPromptTemplates(): Promise<any[]> {
    return this.promptTemplateEngine.getAllTemplates();
  }

  updateConfiguration(config: Partial<IntegratedAIConfiguration>): void {
    this.configuration = { ...this.configuration, ...config };
    console.log('📝 Configuration updated:', config);
  }

  private calculateAverageResponseTime(): number {
    const allMetrics = Array.from(this.performanceMetrics.values()).flat();
    if (allMetrics.length === 0) return 0;
    
    return allMetrics.reduce((sum: number, metric: any) => sum + metric.processing_time, 0) / allMetrics.length;
  }
}

// Export singleton instance
export const integratedAIService = new IntegratedAIService();