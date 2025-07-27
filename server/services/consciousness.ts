import { storage } from "../storage";
import { aiProviderService } from "./aiProviders";

export interface ConsciousnessSession {
  id: string;
  projectId: number;
  isActive: boolean;
  contextData: any;
  createdAt: Date;
}

export interface ConsciousResponse {
  response: string;
  confidence: number;
  contextUpdates: any;
  tokensUsed?: number;
  cost?: string;
}

class ConsciousnessService {
  private sessions = new Map<string, ConsciousnessSession>();
  private spaceAgentApiUrl: string;
  private spaceAgentApiKey: string;

  constructor() {
    this.spaceAgentApiUrl = process.env.SPACEAGENT_API_URL || '';
    this.spaceAgentApiKey = process.env.SPACEAGENT_API_KEY || '';
  }

  async activate(projectId: number): Promise<ConsciousnessSession> {
    const sessionId = `consciousness_${projectId}_${Date.now()}`;
    
    // TODO: When SpaceAgent is ready, initialize session with SpaceAgent API
    const session: ConsciousnessSession = {
      id: sessionId,
      projectId,
      isActive: true,
      contextData: {},
      createdAt: new Date()
    };
    
    this.sessions.set(sessionId, session);
    
    // Store consciousness context in database
    await storage.createConsciousnessContext({
      projectId,
      sessionId,
      contextData: {},
      learningData: {}
    });
    
    return session;
  }

  async query(sessionId: string, query: string, projectId: number): Promise<ConsciousResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Consciousness session not found');
    }

    // Get project context
    const project = await storage.getProject(projectId);
    const files = await storage.getProjectFiles(projectId);
    const context = await storage.getConsciousnessContext(projectId);
    const memories = await storage.getConsciousnessMemories(projectId);

    const projectContext = {
      project,
      files: files.map(f => ({ path: f.filePath, content: f.content, type: f.fileType })),
      previousContext: context?.contextData,
      relevantMemories: memories.slice(0, 10) // Top 10 most relevant memories
    };

    // TODO: Replace with actual SpaceAgent API call when ready
    // For now, use enhanced basic AI with context awareness
    const response = await this.processWithContextAwareness(query, projectContext);
    
    // Update consciousness context and memories
    await this.updateLearning(projectId, query, response, projectContext);
    
    return response;
  }

  private async processWithContextAwareness(query: string, context: any): Promise<ConsciousResponse> {
    // Mock consciousness response - replace with SpaceAgent integration
    const contextAwarePrompt = `
Project Context: ${JSON.stringify(context.project)}
Files: ${context.files.map((f: any) => `${f.path}: ${f.content?.slice(0, 200)}...`).join('\n')}
Previous Context: ${JSON.stringify(context.previousContext)}
Relevant Memories: ${context.relevantMemories.map((m: any) => m.memoryContent).join('\n')}

User Query: ${query}

Respond as a consciousness-enabled AI assistant with full awareness of the project context and history.
`;

    // Use aiProviderService for enhanced context-aware generation
    const result = await aiProviderService.generateCode(contextAwarePrompt, 'anthropic');
    
    return {
      response: result.response,
      confidence: 0.85,
      contextUpdates: { lastQuery: query, timestamp: new Date() },
      tokensUsed: result.tokensUsed,
      cost: result.cost
    };
  }

  private async updateLearning(projectId: number, query: string, response: ConsciousResponse, context: any): Promise<void> {
    // Create memory of this interaction
    await storage.createConsciousnessMemory({
      projectId,
      memoryType: 'interaction',
      memoryContent: {
        query,
        response: response.response,
        confidence: response.confidence,
        timestamp: new Date()
      },
      relevanceScore: response.confidence
    });

    // Update consciousness context
    const existingContext = await storage.getConsciousnessContext(projectId);
    if (existingContext) {
      await storage.updateConsciousnessContext(existingContext.id, {
        contextData: {
          ...existingContext.contextData,
          ...response.contextUpdates,
          interactionCount: (existingContext.contextData?.interactionCount || 0) + 1
        }
      });
    }
  }

  async getContext(projectId: number): Promise<any> {
    return await storage.getConsciousnessContext(projectId);
  }

  async getMemories(projectId: number): Promise<any[]> {
    return await storage.getConsciousnessMemories(projectId);
  }
}

export const consciousnessService = new ConsciousnessService();