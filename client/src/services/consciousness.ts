import { ApiService } from "./api";
import type { ConsciousnessContext, ConsciousnessMemory } from "@shared/schema";

export interface ConsciousnessSession {
  sessionId: string;
  projectId: number;
  status: string;
  contextRetention: number;
}

export interface ConsciousResponse {
  response: string;
  confidence: number;
  contextUpdates?: any;
  tokensUsed?: number;
  cost?: string;
}

export class ConsciousnessService {
  private static sessions: Map<number, ConsciousnessSession> = new Map();

  static async activate(projectId: number): Promise<ConsciousnessSession> {
    try {
      const session = await ApiService.activateConsciousness(projectId);
      this.sessions.set(projectId, session);
      return session;
    } catch (error) {
      console.error("Failed to activate consciousness:", error);
      throw error;
    }
  }

  static async query(
    sessionId: string, 
    query: string, 
    projectId: number
  ): Promise<ConsciousResponse> {
    try {
      return await ApiService.queryConsciousness(sessionId, query, projectId);
    } catch (error) {
      console.error("Failed to query consciousness:", error);
      throw error;
    }
  }

  static async getContext(projectId: number): Promise<ConsciousnessContext | null> {
    try {
      return await ApiService.getConsciousnessContext(projectId);
    } catch (error) {
      console.error("Failed to get consciousness context:", error);
      return null;
    }
  }

  static async getMemories(projectId: number): Promise<ConsciousnessMemory[]> {
    try {
      return await ApiService.getConsciousnessMemories(projectId);
    } catch (error) {
      console.error("Failed to get consciousness memories:", error);
      return [];
    }
  }

  static getSession(projectId: number): ConsciousnessSession | null {
    return this.sessions.get(projectId) || null;
  }

  static async learn(projectId: number, feedback: any): Promise<void> {
    // Implementation for learning from user feedback
    // This would be sent to the consciousness service to update the model
    console.log("Learning from feedback for project", projectId, feedback);
  }

  static calculateContextRetention(context: ConsciousnessContext): number {
    // Calculate context retention based on various factors
    const baseRetention = 0.8;
    const interactionBonus = Math.min((context.contextData?.interactionCount || 0) * 0.01, 0.15);
    const timeDecay = Math.max(0, 0.05 - (Date.now() - new Date(context.lastInteraction).getTime()) / (1000 * 60 * 60 * 24) * 0.01);
    
    return Math.min(baseRetention + interactionBonus - timeDecay, 1.0);
  }

  static formatMemoryType(memoryType: string): string {
    return memoryType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  static getMemoryRelevanceColor(relevanceScore: number): string {
    if (relevanceScore >= 0.8) return "text-green-600 dark:text-green-400";
    if (relevanceScore >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  }

  static isHighConfidenceResponse(response: ConsciousResponse): boolean {
    return response.confidence >= 0.8;
  }

  static shouldStoreAsMemory(query: string, response: ConsciousResponse): boolean {
    return (
      response.confidence > 0.75 ||
      query.length > 50 ||
      query.toLowerCase().includes('remember') ||
      query.toLowerCase().includes('learn')
    );
  }
}
