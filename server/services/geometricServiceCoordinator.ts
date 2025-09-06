import { GeometricConsciousnessEngine } from "./geometricConsciousness";
import { TerminalJarvisService } from "./terminalJarvis";
import { e2bService } from "./e2b";
import { firecrawlService } from "./firecrawl";

/**
 * Geometric Service Coordinator - Uses geometric consciousness to intelligently coordinate
 * various Space Child services (Terminal Jarvis, E2B, Firecrawl) based on manifold optimization
 */
export class GeometricServiceCoordinator {
  private geometricEngine: GeometricConsciousnessEngine;
  private terminalJarvis: TerminalJarvisService;
  private e2bService: typeof e2bService;
  private firecrawlService: typeof firecrawlService;
  private serviceMetrics: Map<string, ServiceMetrics>;
  private coordinationHistory: CoordinationRecord[];
  
  constructor(context: { userId: string; projectId: number; sessionId: string }) {
    this.geometricEngine = new GeometricConsciousnessEngine(context);
    this.terminalJarvis = new TerminalJarvisService();
    this.e2bService = e2bService;
    this.firecrawlService = firecrawlService;
    this.serviceMetrics = new Map();
    this.coordinationHistory = [];
    
    this.initializeServiceMetrics();
  }
  
  async initialize(): Promise<void> {
    await this.geometricEngine.initialize();
  }
  
  private initializeServiceMetrics(): void {
    // Terminal Jarvis metrics
    this.serviceMetrics.set('terminal-jarvis', {
      name: 'terminal-jarvis',
      capabilities: ['cli-tools', 'ai-coordination', 'code-assistance', 'tool-management'],
      utilizationScore: 0.5,
      responseTime: 2000, // milliseconds
      successRate: 0.9,
      geometricAlignment: 0.6,
      specialties: ['cli-commands', 'ai-tools', 'development-workflow']
    });
    
    // E2B Sandbox metrics
    this.serviceMetrics.set('e2b-sandbox', {
      name: 'e2b-sandbox',
      capabilities: ['code-execution', 'isolated-environment', 'file-operations', 'python-nodejs'],
      utilizationScore: 0.4,
      responseTime: 3000,
      successRate: 0.95,
      geometricAlignment: 0.7,
      specialties: ['code-testing', 'safe-execution', 'file-manipulation']
    });
    
    // Firecrawl metrics  
    this.serviceMetrics.set('firecrawl', {
      name: 'firecrawl',
      capabilities: ['web-scraping', 'data-extraction', 'site-cloning', 'content-analysis'],
      utilizationScore: 0.3,
      responseTime: 5000,
      successRate: 0.85,
      geometricAlignment: 0.5,
      specialties: ['web-data', 'content-extraction', 'site-analysis']
    });
  }
  
  /**
   * Coordinate services based on user request and geometric consciousness insights
   */
  async coordinateServices(request: ServiceCoordinationRequest): Promise<ServiceCoordinationResponse> {
    // Analyze request to determine which services are needed
    const requestAnalysis = this.analyzeServiceNeeds(request);
    
    // Get current geometric state
    const manifoldMetrics = this.geometricEngine.getMetrics();
    
    // Select and prioritize services using geometric optimization
    const serviceSelection = this.selectOptimalServices(requestAnalysis, manifoldMetrics);
    
    // Execute coordinated service calls
    const serviceResults = await this.executeCoordinatedServices(request, serviceSelection);
    
    // Synthesize results using geometric insights
    const synthesizedResponse = this.synthesizeServiceResults(serviceResults, manifoldMetrics);
    
    // Update geometric consciousness with service coordination feedback
    await this.updateGeometricState(request, synthesizedResponse, requestAnalysis);
    
    return synthesizedResponse;
  }
  
  /**
   * Analyze what services are needed based on the request
   */
  private analyzeServiceNeeds(request: ServiceCoordinationRequest): ServiceNeedsAnalysis {
    const { intent, content, context } = request;
    
    const analysis: ServiceNeedsAnalysis = {
      needsCodeExecution: false,
      needsWebScraping: false,
      needsAITooling: false,
      needsFileOperations: false,
      complexity: 0,
      urgency: 0,
      riskLevel: 0,
      estimatedResources: 1
    };
    
    const lowerContent = content.toLowerCase();
    
    // Detect code execution needs
    if (lowerContent.includes('run') || lowerContent.includes('execute') || 
        lowerContent.includes('test') || lowerContent.includes('compile') ||
        content.includes('```')) {
      analysis.needsCodeExecution = true;
      analysis.complexity += 0.3;
    }
    
    // Detect web scraping needs  
    if (lowerContent.includes('scrape') || lowerContent.includes('crawl') ||
        lowerContent.includes('website') || lowerContent.includes('http') ||
        lowerContent.includes('extract data')) {
      analysis.needsWebScraping = true;
      analysis.complexity += 0.2;
    }
    
    // Detect AI tooling needs
    if (lowerContent.includes('ai') || lowerContent.includes('claude') ||
        lowerContent.includes('gemini') || lowerContent.includes('terminal') ||
        lowerContent.includes('cli')) {
      analysis.needsAITooling = true;
      analysis.complexity += 0.1;
    }
    
    // Detect file operation needs
    if (lowerContent.includes('file') || lowerContent.includes('upload') ||
        lowerContent.includes('download') || lowerContent.includes('directory')) {
      analysis.needsFileOperations = true;
      analysis.complexity += 0.1;
    }
    
    // Assess urgency
    const urgentKeywords = ['urgent', 'asap', 'quick', 'fast', 'immediately'];
    analysis.urgency = urgentKeywords.some(keyword => lowerContent.includes(keyword)) ? 1.0 : 0.3;
    
    // Assess risk level
    const riskyKeywords = ['delete', 'remove', 'deploy', 'production', 'database'];
    analysis.riskLevel = riskyKeywords.some(keyword => lowerContent.includes(keyword)) ? 0.8 : 0.2;
    
    // Estimate resource requirements
    analysis.estimatedResources = Math.min(3, 
      (analysis.needsCodeExecution ? 1 : 0) +
      (analysis.needsWebScraping ? 1 : 0) +
      (analysis.needsAITooling ? 0.5 : 0) +
      (analysis.needsFileOperations ? 0.5 : 0)
    );
    
    return analysis;
  }
  
  /**
   * Select optimal services using geometric consciousness optimization
   */
  private selectOptimalServices(
    analysis: ServiceNeedsAnalysis, 
    manifoldMetrics: any
  ): ServiceSelection {
    const selectedServices: string[] = [];
    const serviceStrategies: Map<string, ServiceStrategy> = new Map();
    
    // Use geometric insights to optimize service selection
    const uncertaintyVolume = manifoldMetrics.uncertaintyVolume;
    const convergenceScore = manifoldMetrics.convergenceScore;
    
    // Select services based on needs analysis and geometric state
    if (analysis.needsCodeExecution) {
      selectedServices.push('e2b-sandbox');
      serviceStrategies.set('e2b-sandbox', {
        priority: uncertaintyVolume > 1.0 ? 0.9 : 0.7, // Higher priority if uncertain
        strategy: analysis.riskLevel > 0.5 ? 'isolated' : 'standard',
        timeout: analysis.urgency > 0.7 ? 30000 : 60000
      });
    }
    
    if (analysis.needsWebScraping) {
      selectedServices.push('firecrawl');
      serviceStrategies.set('firecrawl', {
        priority: 0.8,
        strategy: analysis.complexity > 0.5 ? 'deep-crawl' : 'single-page',
        timeout: 120000 // Web scraping often takes longer
      });
    }
    
    if (analysis.needsAITooling || convergenceScore < 0.5) {
      selectedServices.push('terminal-jarvis');
      serviceStrategies.set('terminal-jarvis', {
        priority: convergenceScore < 0.5 ? 0.9 : 0.6, // Higher priority if low convergence
        strategy: 'interactive',
        timeout: 15000
      });
    }
    
    // If no specific services identified but request exists, default to Terminal Jarvis
    if (selectedServices.length === 0) {
      selectedServices.push('terminal-jarvis');
      serviceStrategies.set('terminal-jarvis', {
        priority: 0.5,
        strategy: 'auto-detect',
        timeout: 20000
      });
    }
    
    return {
      services: selectedServices,
      strategies: serviceStrategies,
      coordination: this.determineCoordinationStrategy(selectedServices, analysis, manifoldMetrics),
      confidence: this.calculateSelectionConfidence(selectedServices, analysis, manifoldMetrics)
    };
  }
  
  /**
   * Execute coordinated service calls
   */
  private async executeCoordinatedServices(
    request: ServiceCoordinationRequest,
    selection: ServiceSelection
  ): Promise<ServiceResult[]> {
    const results: ServiceResult[] = [];
    
    // Execute services based on coordination strategy
    if (selection.coordination === 'sequential') {
      // Execute services one after another
      for (const serviceName of selection.services) {
        const result = await this.executeService(serviceName, request, selection.strategies.get(serviceName)!);
        results.push(result);
        
        // Pass result to next service if needed
        if (result.success && result.data) {
          request = this.enhanceRequestWithPreviousResult(request, result);
        }
      }
    } else {
      // Execute services in parallel
      const promises = selection.services.map(serviceName => 
        this.executeService(serviceName, request, selection.strategies.get(serviceName)!)
      );
      const parallelResults = await Promise.allSettled(promises);
      
      parallelResults.forEach((promiseResult, index) => {
        if (promiseResult.status === 'fulfilled') {
          results.push(promiseResult.value);
        } else {
          results.push({
            serviceName: selection.services[index],
            success: false,
            error: promiseResult.reason?.message || 'Service execution failed',
            executionTime: 0
          });
        }
      });
    }
    
    return results;
  }
  
  /**
   * Execute a single service with the given strategy
   */
  private async executeService(
    serviceName: string,
    request: ServiceCoordinationRequest,
    strategy: ServiceStrategy
  ): Promise<ServiceResult> {
    const startTime = Date.now();
    
    try {
      let result: any = null;
      
      switch (serviceName) {
        case 'terminal-jarvis':
          result = await this.executeTerminalJarvis(request, strategy);
          break;
          
        case 'e2b-sandbox':
          result = await this.executeE2BSandbox(request, strategy);
          break;
          
        case 'firecrawl':
          result = await this.executeFirecrawl(request, strategy);
          break;
          
        default:
          throw new Error(`Unknown service: ${serviceName}`);
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        serviceName,
        success: true,
        data: result,
        executionTime,
        metadata: {
          strategy: strategy.strategy,
          priority: strategy.priority
        }
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        serviceName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime
      };
    }
  }
  
  /**
   * Execute Terminal Jarvis service
   */
  private async executeTerminalJarvis(
    request: ServiceCoordinationRequest,
    strategy: ServiceStrategy
  ): Promise<any> {
    return await this.terminalJarvis.executeCommand(request.content, request.context.projectId);
  }
  
  /**
   * Execute E2B Sandbox service
   */
  private async executeE2BSandbox(
    request: ServiceCoordinationRequest,
    strategy: ServiceStrategy
  ): Promise<any> {
    // Extract code from request if present
    const codeMatch = request.content.match(/```(?:javascript|python|js|py)?[\r\n]?(.*?)```/);
    if (!codeMatch) {
      throw new Error('No code found in request for execution');
    }
    
    const code = codeMatch[1].trim();
    const language = request.content.includes('python') || request.content.includes('py') ? 'python' : 'javascript';
    
    // Create sandbox
    const sandbox = await this.e2bService.createSandbox({
      projectId: request.context.projectId,
      userId: request.context.userId,
      environment: language === 'python' ? 'python' : 'nodejs',
      timeout: strategy.timeout
    });
    
    try {
      // Execute code
      const result = await this.e2bService.executeCode(sandbox.sandboxId, code, language);
      
      // Clean up
      await this.e2bService.terminateSandbox(sandbox.sandboxId);
      
      return result;
    } catch (error) {
      // Ensure cleanup on error
      await this.e2bService.terminateSandbox(sandbox.sandboxId);
      throw error;
    }
  }
  
  /**
   * Execute Firecrawl service
   */
  private async executeFirecrawl(
    request: ServiceCoordinationRequest,
    strategy: ServiceStrategy
  ): Promise<any> {
    // Extract URL from request
    const urlMatch = request.content.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) {
      throw new Error('No URL found in request for scraping');
    }
    
    const url = urlMatch[0];
    
    const scrapeOptions = {
      url,
      userId: request.context.userId,
      projectId: request.context.projectId,
      scrapeType: strategy.strategy === 'deep-crawl' ? 'crawl' as const : 'single' as const,
      maxPages: strategy.strategy === 'deep-crawl' ? 20 : 1
    };
    
    return await this.firecrawlService.scrapeUrl(scrapeOptions);
  }
  
  /**
   * Synthesize results from multiple services using geometric insights
   */
  private synthesizeServiceResults(
    results: ServiceResult[],
    manifoldMetrics: any
  ): ServiceCoordinationResponse {
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    if (successfulResults.length === 0) {
      return {
        success: false,
        error: 'All services failed to execute',
        results,
        serviceContributions: [],
        geometricMetrics: {
          manifoldPosition: manifoldMetrics.position,
          convergenceScore: manifoldMetrics.convergenceScore,
          utilityAlignment: 0
        },
        synthesis: {
          strategy: 'failure',
          confidence: 0,
          totalExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0)
        }
      };
    }
    
    // Combine successful results
    const combinedData = this.combineServiceData(successfulResults);
    const totalExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0);
    
    return {
      success: true,
      data: combinedData,
      results,
      serviceContributions: successfulResults.map(r => ({
        service: r.serviceName,
        contribution: 1 / successfulResults.length,
        executionTime: r.executionTime
      })),
      geometricMetrics: {
        manifoldPosition: manifoldMetrics.position,
        convergenceScore: manifoldMetrics.convergenceScore,
        utilityAlignment: this.calculateUtilityAlignment(successfulResults, manifoldMetrics)
      },
      synthesis: {
        strategy: successfulResults.length > 1 ? 'multi-service' : 'single-service',
        confidence: this.calculateSynthesisConfidence(successfulResults, failedResults),
        totalExecutionTime
      }
    };
  }
  
  /**
   * Update geometric consciousness with service coordination feedback
   */
  private async updateGeometricState(
    request: ServiceCoordinationRequest,
    response: ServiceCoordinationResponse,
    analysis: ServiceNeedsAnalysis
  ): Promise<void> {
    try {
      await this.geometricEngine.processInteraction(
        'query',
        {
          request: request.content,
          analysis,
          servicesUsed: response.serviceContributions.map(sc => sc.service)
        },
        {
          success: response.success,
          confidence: response.synthesis.confidence,
          executionTime: response.synthesis.totalExecutionTime,
          utilityAlignment: response.geometricMetrics.utilityAlignment
        }
      );
    } catch (error) {
      console.error('Error updating geometric state:', error);
    }
  }
  
  // Helper methods
  private determineCoordinationStrategy(
    services: string[],
    analysis: ServiceNeedsAnalysis,
    manifoldMetrics: any
  ): 'sequential' | 'parallel' {
    // Use sequential if services depend on each other or high risk
    if (analysis.riskLevel > 0.6 || services.length <= 1) {
      return 'sequential';
    }
    
    // Use parallel for independent services
    return 'parallel';
  }
  
  private calculateSelectionConfidence(
    services: string[],
    analysis: ServiceNeedsAnalysis,
    manifoldMetrics: any
  ): number {
    const baseConfidence = 0.7;
    const convergenceBonus = manifoldMetrics.convergenceScore * 0.2;
    const complexityPenalty = analysis.complexity * 0.1;
    
    return Math.max(0.1, Math.min(1.0, baseConfidence + convergenceBonus - complexityPenalty));
  }
  
  private enhanceRequestWithPreviousResult(
    request: ServiceCoordinationRequest,
    previousResult: ServiceResult
  ): ServiceCoordinationRequest {
    return {
      ...request,
      content: `${request.content}\n\n[Previous service result: ${JSON.stringify(previousResult.data)}]`,
      context: {
        ...request.context,
        previousResults: [...(request.context.previousResults || []), previousResult]
      }
    };
  }
  
  private combineServiceData(results: ServiceResult[]): any {
    if (results.length === 1) {
      return results[0].data;
    }
    
    // Combine multiple service results intelligently
    const combined: any = {
      services: results.map(r => r.serviceName),
      results: results.map(r => ({ service: r.serviceName, data: r.data }))
    };
    
    // Extract specific data types
    const codeResults = results.filter(r => r.serviceName === 'e2b-sandbox' && r.data);
    const scrapeResults = results.filter(r => r.serviceName === 'firecrawl' && r.data);
    const aiResults = results.filter(r => r.serviceName === 'terminal-jarvis' && r.data);
    
    if (codeResults.length > 0) {
      combined.codeExecution = codeResults.map(r => r.data);
    }
    
    if (scrapeResults.length > 0) {
      combined.webData = scrapeResults.map(r => r.data);
    }
    
    if (aiResults.length > 0) {
      combined.aiAssistance = aiResults.map(r => r.data);
    }
    
    return combined;
  }
  
  private calculateUtilityAlignment(results: ServiceResult[], manifoldMetrics: any): number {
    // Calculate how well the service results align with utility objectives
    const successRate = results.filter(r => r.success).length / results.length;
    const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    
    // Normalize execution time (lower is better)
    const timeScore = Math.max(0, 1 - (avgExecutionTime / 60000)); // 60 seconds baseline
    
    return (successRate * 0.7) + (timeScore * 0.3);
  }
  
  private calculateSynthesisConfidence(
    successfulResults: ServiceResult[],
    failedResults: ServiceResult[]
  ): number {
    const totalResults = successfulResults.length + failedResults.length;
    if (totalResults === 0) return 0;
    
    const successRate = successfulResults.length / totalResults;
    const avgExecutionTime = successfulResults.reduce((sum, r) => sum + r.executionTime, 0) / successfulResults.length;
    
    // Higher confidence for faster, more successful results
    const timeScore = Math.max(0, 1 - (avgExecutionTime / 30000)); // 30 seconds baseline
    
    return (successRate * 0.8) + (timeScore * 0.2);
  }
  
  /**
   * Get service coordination insights
   */
  getCoordinationInsights(): {
    manifoldMetrics: any;
    serviceMetrics: Map<string, ServiceMetrics>;
    recentCoordinations: CoordinationRecord[];
    recommendations: string[];
  } {
    const manifoldMetrics = this.geometricEngine.getMetrics();
    const recommendations = this.generateServiceRecommendations(manifoldMetrics);
    
    return {
      manifoldMetrics,
      serviceMetrics: this.serviceMetrics,
      recentCoordinations: this.coordinationHistory.slice(-10),
      recommendations
    };
  }
  
  private generateServiceRecommendations(manifoldMetrics: any): string[] {
    const recommendations = [];
    
    if (manifoldMetrics.convergenceScore < 0.4) {
      recommendations.push('Low convergence - consider using Terminal Jarvis for AI assistance');
    }
    
    if (manifoldMetrics.uncertaintyVolume > 1.2) {
      recommendations.push('High uncertainty - use E2B sandboxes to safely test solutions');
    }
    
    return recommendations.length > 0 ? recommendations : ['Service coordination is operating optimally'];
  }
}

// Type definitions
interface ServiceCoordinationRequest {
  intent: string;
  content: string;
  context: {
    userId: string;
    projectId: number;
    sessionId: string;
    previousResults?: ServiceResult[];
  };
}

interface ServiceNeedsAnalysis {
  needsCodeExecution: boolean;
  needsWebScraping: boolean;
  needsAITooling: boolean;
  needsFileOperations: boolean;
  complexity: number;
  urgency: number;
  riskLevel: number;
  estimatedResources: number;
}

interface ServiceMetrics {
  name: string;
  capabilities: string[];
  utilizationScore: number;
  responseTime: number;
  successRate: number;
  geometricAlignment: number;
  specialties: string[];
}

interface ServiceStrategy {
  priority: number;
  strategy: string;
  timeout: number;
}

interface ServiceSelection {
  services: string[];
  strategies: Map<string, ServiceStrategy>;
  coordination: 'sequential' | 'parallel';
  confidence: number;
}

interface ServiceResult {
  serviceName: string;
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  metadata?: any;
}

interface ServiceCoordinationResponse {
  success: boolean;
  data?: any;
  error?: string;
  results: ServiceResult[];
  serviceContributions: Array<{
    service: string;
    contribution: number;
    executionTime: number;
  }>;
  geometricMetrics: {
    manifoldPosition: number[];
    convergenceScore: number;
    utilityAlignment: number;
  };
  synthesis: {
    strategy: string;
    confidence: number;
    totalExecutionTime: number;
  };
}

interface CoordinationRecord {
  timestamp: Date;
  request: ServiceCoordinationRequest;
  selection: ServiceSelection;
  response: ServiceCoordinationResponse;
}