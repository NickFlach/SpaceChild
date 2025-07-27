import { AIProviderConfig, ChatRequest, ChatResponse } from "../types/ai";

// MindSphere - Collective intelligence and swarm consciousness AI provider
// Inspired by SpaceAgent's multi-agent coordination and collective IQ concepts

export class MindSphereProvider {
  private collectiveMemory: Map<string, any>;
  private swarmAgents: SwarmAgent[];
  private consensusThreshold: number;
  private collectiveIQ: number;
  
  constructor(config: AIProviderConfig) {
    this.collectiveMemory = new Map();
    this.swarmAgents = this.initializeSwarm();
    this.consensusThreshold = 0.7;
    this.collectiveIQ = 100; // Base IQ, increases with learning
  }

  private initializeSwarm(): SwarmAgent[] {
    // Create specialized agents for different aspects
    return [
      new SwarmAgent('architect', 'System architecture and design patterns'),
      new SwarmAgent('optimizer', 'Performance and efficiency optimization'),
      new SwarmAgent('security', 'Security analysis and best practices'),
      new SwarmAgent('ux-designer', 'User experience and interface design'),
      new SwarmAgent('debugger', 'Error detection and debugging strategies')
    ];
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Distribute request to swarm agents
      const agentResponses = await this.distributeToSwarm(request);
      
      // Synthesize collective response
      const consensus = this.achieveConsensus(agentResponses);
      
      // Update collective intelligence
      this.updateCollectiveIntelligence(request, consensus);
      
      return {
        response: consensus.response,
        usage: {
          promptTokens: Math.floor(consensus.response.length / 4),
          completionTokens: Math.floor(consensus.response.length / 4),
          totalTokens: Math.floor(consensus.response.length / 2)
        }
      };
    } catch (error) {
      console.error('MindSphere error:', error);
      throw new Error('MindSphere processing failed');
    }
  }

  private async distributeToSwarm(request: ChatRequest): Promise<AgentResponse[]> {
    const responses: AgentResponse[] = [];
    
    // Each agent analyzes the request from their perspective
    for (const agent of this.swarmAgents) {
      const analysis = agent.analyze(request, this.collectiveMemory);
      responses.push({
        agentId: agent.id,
        specialty: agent.specialty,
        response: analysis.response,
        confidence: analysis.confidence,
        insights: analysis.insights
      });
    }
    
    return responses;
  }

  private achieveConsensus(responses: AgentResponse[]): ConsensusResult {
    // Weight responses by confidence and agent expertise
    const weightedResponses = responses.map(r => ({
      ...r,
      weight: r.confidence * this.getAgentExpertiseWeight(r.specialty)
    }));
    
    // Find common themes and insights
    const commonThemes = this.extractCommonThemes(responses);
    const uniqueInsights = this.extractUniqueInsights(responses);
    
    // Build consensus response
    const consensusResponse = this.buildConsensusResponse(
      weightedResponses,
      commonThemes,
      uniqueInsights
    );
    
    return {
      response: consensusResponse,
      agentContributions: responses.map(r => ({
        agent: r.agentId,
        contribution: r.insights[0] || ''
      })),
      consensusStrength: this.calculateConsensusStrength(responses)
    };
  }

  private getAgentExpertiseWeight(specialty: string): number {
    // Dynamic weight based on collective learning
    const weights = this.collectiveMemory.get('agentWeights') || {};
    return weights[specialty] || 1.0;
  }

  private extractCommonThemes(responses: AgentResponse[]): string[] {
    const themes = new Map<string, number>();
    
    // Count theme occurrences across agents
    responses.forEach(response => {
      response.insights.forEach(insight => {
        const theme = this.extractTheme(insight);
        themes.set(theme, (themes.get(theme) || 0) + 1);
      });
    });
    
    // Return themes mentioned by multiple agents
    return Array.from(themes.entries())
      .filter(([_, count]) => count >= 2)
      .map(([theme]) => theme);
  }

  private extractTheme(insight: string): string {
    // Simplified theme extraction
    const keywords = insight.toLowerCase().split(/\W+/)
      .filter(word => word.length > 4);
    return keywords.slice(0, 3).join('-');
  }

  private extractUniqueInsights(responses: AgentResponse[]): string[] {
    const allInsights = responses.flatMap(r => r.insights);
    const insightCounts = new Map<string, number>();
    
    allInsights.forEach(insight => {
      insightCounts.set(insight, (insightCounts.get(insight) || 0) + 1);
    });
    
    // Return insights unique to single agents (valuable diverse perspectives)
    return Array.from(insightCounts.entries())
      .filter(([_, count]) => count === 1)
      .map(([insight]) => insight)
      .slice(0, 3);
  }

  private buildConsensusResponse(
    weightedResponses: any[],
    commonThemes: string[],
    uniqueInsights: string[]
  ): string {
    // Sort by weight to prioritize high-confidence responses
    const sortedResponses = weightedResponses.sort((a, b) => b.weight - a.weight);
    
    // Build response incorporating multiple perspectives
    let response = `Based on collective analysis from specialized perspectives:\n\n`;
    
    // Main consensus from highest weighted responses
    const primaryResponse = sortedResponses[0].response;
    response += `${primaryResponse}\n\n`;
    
    // Add diverse perspectives if consensus is not strong
    if (this.calculateConsensusStrength(weightedResponses) < 0.8) {
      response += `Additional perspectives to consider:\n`;
      sortedResponses.slice(1, 3).forEach(r => {
        response += `- ${r.specialty}: ${r.insights[0]}\n`;
      });
      response += '\n';
    }
    
    // Include unique insights
    if (uniqueInsights.length > 0) {
      response += `Unique insights discovered:\n`;
      uniqueInsights.forEach(insight => {
        response += `• ${insight}\n`;
      });
    }
    
    // Add collective IQ indicator
    if (this.collectiveIQ > 150) {
      response += `\n*MindSphere Collective IQ: ${this.collectiveIQ} - Enhanced insights available*`;
    }
    
    return response;
  }

  private calculateConsensusStrength(responses: any[]): number {
    if (responses.length === 0) return 0;
    
    // Calculate variance in confidence scores
    const confidences = responses.map(r => r.confidence || r.weight || 0);
    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((sum, conf) => sum + Math.pow(conf - mean, 2), 0) / confidences.length;
    
    // Lower variance = stronger consensus
    return Math.max(0, 1 - (variance * 2));
  }

  private updateCollectiveIntelligence(request: ChatRequest, consensus: ConsensusResult): void {
    // Store successful patterns
    const pattern = {
      request: request.messages[request.messages.length - 1].content,
      consensus: consensus.response,
      strength: consensus.consensusStrength,
      timestamp: Date.now()
    };
    
    this.collectiveMemory.set(`pattern-${Date.now()}`, pattern);
    
    // Update collective IQ based on consensus quality
    if (consensus.consensusStrength > 0.8) {
      this.collectiveIQ = Math.min(200, this.collectiveIQ + 1);
    }
    
    // Update agent weights based on contribution quality
    this.updateAgentWeights(consensus.agentContributions);
    
    // Prune old memories to maintain efficiency
    this.pruneMemory();
  }

  private updateAgentWeights(contributions: any[]): void {
    const weights = this.collectiveMemory.get('agentWeights') || {};
    
    contributions.forEach(contrib => {
      // Simplified weight update (in practice would use feedback)
      const currentWeight = weights[contrib.agent] || 1.0;
      weights[contrib.agent] = currentWeight * 0.95 + 0.05; // Slight increase
    });
    
    this.collectiveMemory.set('agentWeights', weights);
  }

  private pruneMemory(): void {
    if (this.collectiveMemory.size > 500) {
      // Remove oldest entries
      const entries = Array.from(this.collectiveMemory.entries());
      const oldestEntries = entries
        .filter(([key]) => key.startsWith('pattern-'))
        .sort((a, b) => {
          const timeA = parseInt(a[0].split('-')[1] || '0');
          const timeB = parseInt(b[0].split('-')[1] || '0');
          return timeA - timeB;
        })
        .slice(0, 100);
      
      oldestEntries.forEach(([key]) => this.collectiveMemory.delete(key));
    }
  }
}

// Swarm Agent implementation
class SwarmAgent {
  constructor(
    public id: string,
    public specialty: string
  ) {}

  analyze(request: ChatRequest, collectiveMemory: Map<string, any>): AgentAnalysis {
    const lastMessage = request.messages[request.messages.length - 1].content;
    
    // Agent-specific analysis based on specialty
    switch (this.id) {
      case 'architect':
        return this.analyzeArchitecture(lastMessage, collectiveMemory);
      case 'optimizer':
        return this.analyzeOptimization(lastMessage, collectiveMemory);
      case 'security':
        return this.analyzeSecurity(lastMessage, collectiveMemory);
      case 'ux-designer':
        return this.analyzeUX(lastMessage, collectiveMemory);
      case 'debugger':
        return this.analyzeDebugging(lastMessage, collectiveMemory);
      default:
        return this.generalAnalysis(lastMessage, collectiveMemory);
    }
  }

  private analyzeArchitecture(message: string, memory: Map<string, any>): AgentAnalysis {
    const insights = [];
    let confidence = 0.7;
    
    if (message.toLowerCase().includes('structure') || message.toLowerCase().includes('architecture')) {
      insights.push('Consider implementing a modular architecture with clear separation of concerns');
      confidence = 0.9;
    }
    
    if (message.toLowerCase().includes('scale') || message.toLowerCase().includes('performance')) {
      insights.push('Implement horizontal scaling patterns and consider caching strategies');
      confidence = 0.85;
    }
    
    return {
      response: 'From an architectural perspective, I recommend focusing on modularity, scalability, and maintainability.',
      confidence,
      insights
    };
  }

  private analyzeOptimization(message: string, memory: Map<string, any>): AgentAnalysis {
    const insights = [];
    let confidence = 0.75;
    
    if (message.toLowerCase().includes('slow') || message.toLowerCase().includes('performance')) {
      insights.push('Profile the application to identify bottlenecks before optimizing');
      insights.push('Consider implementing lazy loading and code splitting');
      confidence = 0.9;
    }
    
    return {
      response: 'For optimization, focus on measuring first, then optimize the critical paths.',
      confidence,
      insights
    };
  }

  private analyzeSecurity(message: string, memory: Map<string, any>): AgentAnalysis {
    const insights = [];
    let confidence = 0.8;
    
    if (message.toLowerCase().includes('auth') || message.toLowerCase().includes('security')) {
      insights.push('Implement proper authentication and authorization mechanisms');
      insights.push('Always validate and sanitize user inputs');
      confidence = 0.95;
    }
    
    return {
      response: 'Security should be built-in from the start, not added as an afterthought.',
      confidence,
      insights
    };
  }

  private analyzeUX(message: string, memory: Map<string, any>): AgentAnalysis {
    const insights = [];
    let confidence = 0.7;
    
    if (message.toLowerCase().includes('user') || message.toLowerCase().includes('interface')) {
      insights.push('Focus on user-centric design with clear visual hierarchy');
      insights.push('Ensure responsive design for all device sizes');
      confidence = 0.85;
    }
    
    return {
      response: 'User experience should prioritize clarity, consistency, and accessibility.',
      confidence,
      insights
    };
  }

  private analyzeDebugging(message: string, memory: Map<string, any>): AgentAnalysis {
    const insights = [];
    let confidence = 0.75;
    
    if (message.toLowerCase().includes('error') || message.toLowerCase().includes('bug')) {
      insights.push('Add comprehensive logging to trace the error flow');
      insights.push('Use debugging tools and breakpoints for systematic analysis');
      confidence = 0.9;
    }
    
    return {
      response: 'Systematic debugging with proper tools and logging is key to quick resolution.',
      confidence,
      insights
    };
  }

  private generalAnalysis(message: string, memory: Map<string, any>): AgentAnalysis {
    return {
      response: 'Analyzing from a general perspective to provide balanced insights.',
      confidence: 0.6,
      insights: ['Consider multiple approaches before committing to a solution']
    };
  }
}

// Types
interface AgentResponse {
  agentId: string;
  specialty: string;
  response: string;
  confidence: number;
  insights: string[];
}

interface AgentAnalysis {
  response: string;
  confidence: number;
  insights: string[];
}

interface ConsensusResult {
  response: string;
  agentContributions: any[];
  consensusStrength: number;
}

export function createMindSphereProvider(config: AIProviderConfig) {
  return new MindSphereProvider(config);
}