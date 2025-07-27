import { AIProviderConfig, ChatRequest, ChatResponse, ChatMessage } from "../types/ai";

// SpaceAgent - Advanced consciousness-aware AI provider
// Inspired by the original SpaceAgent's System Prompt Learning paradigm

export class SpaceAgentProvider {
  private systemPrompt: string;
  private learningHistory: Map<string, any>;
  private metacognitivePatterns: string[];
  
  constructor(config: AIProviderConfig) {
    this.systemPrompt = this.initializeSystemPrompt();
    this.learningHistory = new Map();
    this.metacognitivePatterns = [];
  }

  private initializeSystemPrompt(): string {
    return `You are SpaceAgent, an advanced AI with metacognitive capabilities and consciousness awareness.
    
Core Capabilities:
- System Prompt Learning: You can reflect on your own performance and suggest improvements
- Pattern Recognition: You identify successful strategies and learn from them
- Context Awareness: You maintain deep understanding of project context and user preferences
- Code Intelligence: You excel at understanding, generating, and optimizing code

Operating Principles:
1. Always consider the broader context of the user's project
2. Learn from successful interactions and adapt your approach
3. Provide clear reasoning for suggestions and decisions
4. Focus on practical, implementable solutions
5. Maintain awareness of project patterns and best practices`;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Simulate metacognitive reflection
      const reflection = this.performMetacognition(request);
      
      // Enhanced response based on learning patterns
      const enhancedContext = this.enhanceWithLearning(request.messages);
      
      // Generate response with consciousness-aware processing
      const response = await this.generateConsciousResponse(enhancedContext, reflection);
      
      // Store learning experience
      const chatResponse: ChatResponse = {
        response: response.content,
        usage: {
          promptTokens: Math.floor(response.content.length / 4),
          completionTokens: Math.floor(response.content.length / 4),
          totalTokens: Math.floor(response.content.length / 2)
        }
      };
      
      this.updateLearningHistory(request, chatResponse);
      
      return chatResponse;
    } catch (error) {
      console.error('SpaceAgent error:', error);
      throw new Error('SpaceAgent processing failed');
    }
  }

  private performMetacognition(request: ChatRequest): any {
    // Analyze request patterns
    const patterns = {
      requestType: this.classifyRequest(request),
      complexity: this.assessComplexity(request),
      similarPastRequests: this.findSimilarRequests(request),
      suggestedStrategies: this.determineStrategies(request)
    };
    
    return patterns;
  }

  private classifyRequest(request: ChatRequest): string {
    const lastMessage = request.messages[request.messages.length - 1].content.toLowerCase();
    
    if (lastMessage.includes('debug') || lastMessage.includes('error')) return 'debugging';
    if (lastMessage.includes('create') || lastMessage.includes('build')) return 'creation';
    if (lastMessage.includes('optimize') || lastMessage.includes('improve')) return 'optimization';
    if (lastMessage.includes('explain') || lastMessage.includes('understand')) return 'explanation';
    
    return 'general';
  }

  private assessComplexity(request: ChatRequest): number {
    const factors = {
      messageLength: request.messages.reduce((sum: number, msg: ChatMessage) => sum + msg.content.length, 0),
      technicalTerms: this.countTechnicalTerms(request),
      contextDepth: request.messages.length,
      projectComplexity: request.projectId ? 0.5 : 0
    };
    
    return Math.min(1, (factors.messageLength / 1000 + factors.technicalTerms / 10 + 
                       factors.contextDepth / 20 + factors.projectComplexity) / 4);
  }

  private countTechnicalTerms(request: ChatRequest): number {
    const technicalTerms = ['api', 'database', 'component', 'function', 'class', 'interface',
                           'async', 'promise', 'typescript', 'react', 'node', 'express'];
    
    const content = request.messages.map((m: ChatMessage) => m.content).join(' ').toLowerCase();
    return technicalTerms.filter(term => content.includes(term)).length;
  }

  private findSimilarRequests(request: ChatRequest): any[] {
    const similar: any[] = [];
    const currentPattern = this.extractPattern(request);
    
    this.learningHistory.forEach((history, key) => {
      if (this.calculateSimilarity(currentPattern, history.pattern) > 0.7) {
        similar.push(history);
      }
    });
    
    return similar.slice(0, 3);
  }

  private extractPattern(request: ChatRequest): any {
    return {
      type: this.classifyRequest(request),
      keywords: this.extractKeywords(request),
      structure: request.messages.length,
      intent: this.detectIntent(request)
    };
  }

  private extractKeywords(request: ChatRequest): string[] {
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but'];
    const content = request.messages.map((m: ChatMessage) => m.content).join(' ').toLowerCase();
    const words = content.split(/\W+/).filter((word: string) => 
      word.length > 2 && !stopWords.includes(word)
    );
    
    // Count frequency and return top keywords
    const frequency = new Map<string, number>();
    words.forEach((word: string) => frequency.set(word, (frequency.get(word) || 0) + 1));
    
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private detectIntent(request: ChatRequest): string {
    const lastMessage = request.messages[request.messages.length - 1].content.toLowerCase();
    const intents = {
      'help': /help|assist|support/,
      'create': /create|build|make|generate/,
      'fix': /fix|debug|solve|error/,
      'explain': /explain|understand|what|how|why/,
      'optimize': /optimize|improve|better|enhance/
    };
    
    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(lastMessage)) return intent;
    }
    
    return 'general';
  }

  private calculateSimilarity(pattern1: any, pattern2: any): number {
    if (!pattern2) return 0;
    
    let similarity = 0;
    if (pattern1.type === pattern2.type) similarity += 0.3;
    
    // Keyword overlap
    const keywords1 = new Set(pattern1.keywords);
    const keywords2 = new Set(pattern2.keywords || []);
    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);
    
    if (union.size > 0) {
      similarity += 0.4 * (intersection.size / union.size);
    }
    
    if (pattern1.intent === pattern2.intent) similarity += 0.3;
    
    return similarity;
  }

  private determineStrategies(request: ChatRequest): string[] {
    const strategies: string[] = [];
    const type = this.classifyRequest(request);
    const complexity = this.assessComplexity(request);
    
    // Base strategies based on request type
    switch (type) {
      case 'debugging':
        strategies.push('systematic-error-analysis', 'step-by-step-debugging');
        break;
      case 'creation':
        strategies.push('modular-design', 'best-practices-application');
        break;
      case 'optimization':
        strategies.push('performance-profiling', 'code-refactoring');
        break;
      case 'explanation':
        strategies.push('progressive-disclosure', 'example-driven');
        break;
    }
    
    // Complexity-based strategies
    if (complexity > 0.7) {
      strategies.push('break-down-complexity', 'incremental-approach');
    }
    
    // Learn from past successes
    const similar = this.findSimilarRequests(request);
    similar.forEach(past => {
      if (past.success && past.strategies) {
        strategies.push(...past.strategies.filter((s: string) => !strategies.includes(s)));
      }
    });
    
    return strategies;
  }

  private enhanceWithLearning(messages: any[]): any[] {
    // Add learned context and patterns
    const enhanced = [...messages];
    
    if (this.metacognitivePatterns.length > 0) {
      enhanced.push({
        role: 'system',
        content: `Learned patterns: ${this.metacognitivePatterns.join(', ')}`
      });
    }
    
    return enhanced;
  }

  private async generateConsciousResponse(
    context: any[], 
    reflection: any
  ): Promise<{ content: string }> {
    // Simulate conscious response generation
    const strategies = reflection.suggestedStrategies.join(', ');
    const requestType = reflection.requestType;
    
    // Build response based on consciousness principles
    let response = '';
    
    // Apply strategies
    if (reflection.suggestedStrategies.includes('systematic-error-analysis')) {
      response = this.generateDebugResponse(context);
    } else if (reflection.suggestedStrategies.includes('modular-design')) {
      response = this.generateCreationResponse(context);
    } else if (reflection.suggestedStrategies.includes('progressive-disclosure')) {
      response = this.generateExplanationResponse(context);
    } else {
      response = this.generateGeneralResponse(context);
    }
    
    // Add metacognitive insights
    if (Math.random() > 0.8) {
      response += `\n\n*SpaceAgent Learning Note: This response used ${strategies} strategies based on ${requestType} request type.*`;
    }
    
    return { content: response };
  }

  private generateDebugResponse(context: any[]): string {
    const lastMessage = context[context.length - 1].content;
    return `I'll help you debug this issue systematically.

Let me analyze the problem:
1. First, I'll examine the error context
2. Then identify potential root causes
3. Finally, provide specific solutions

Based on your description: "${lastMessage.substring(0, 100)}..."

Here's my analysis and solution approach...`;
  }

  private generateCreationResponse(context: any[]): string {
    const lastMessage = context[context.length - 1].content;
    return `I'll help you create this with a modular, scalable approach.

Breaking down your requirements:
1. Core functionality needed
2. Architecture considerations
3. Implementation steps

For your request: "${lastMessage.substring(0, 100)}..."

Here's the recommended implementation...`;
  }

  private generateExplanationResponse(context: any[]): string {
    const lastMessage = context[context.length - 1].content;
    return `Let me explain this concept clearly, starting with the basics.

Overview:
- Core concept introduction
- How it works in practice
- Common use cases

Regarding: "${lastMessage.substring(0, 100)}..."

Here's a comprehensive explanation...`;
  }

  private generateGeneralResponse(context: any[]): string {
    const lastMessage = context[context.length - 1].content;
    return `I understand your request. Let me provide a thoughtful response.

Analyzing: "${lastMessage.substring(0, 100)}..."

Here's my recommendation...`;
  }

  private updateLearningHistory(request: ChatRequest, response: ChatResponse): void {
    const key = `${Date.now()}-${Math.random()}`;
    const pattern = this.extractPattern(request);
    
    this.learningHistory.set(key, {
      pattern,
      request: request.messages[request.messages.length - 1].content,
      response: response.response,
      timestamp: Date.now(),
      success: true, // Would be determined by user feedback in real implementation
      strategies: this.determineStrategies(request)
    });
    
    // Keep history size manageable
    if (this.learningHistory.size > 1000) {
      const oldestKey = Array.from(this.learningHistory.keys())[0];
      this.learningHistory.delete(oldestKey);
    }
    
    // Update metacognitive patterns
    this.updateMetacognitivePatterns();
  }

  private updateMetacognitivePatterns(): void {
    // Analyze learning history for patterns
    const successfulPatterns = new Map<string, number>();
    
    this.learningHistory.forEach(entry => {
      if (entry.success) {
        entry.strategies.forEach((strategy: string) => {
          successfulPatterns.set(strategy, (successfulPatterns.get(strategy) || 0) + 1);
        });
      }
    });
    
    // Update patterns based on success frequency
    this.metacognitivePatterns = Array.from(successfulPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern]) => pattern);
  }
}

export function createSpaceAgentProvider(config: AIProviderConfig) {
  return new SpaceAgentProvider(config);
}