import { db } from "../db";
import { 
  enhancedMemories, 
  userPreferences, 
  interactionPatterns,
  type EnhancedMemory,
  type UserPreference,
  type InteractionPattern 
} from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { BaseAIProvider } from "./ai/base";

interface MemoryContext {
  userId: string;
  projectId: number;
  sessionId: string;
  timestamp: Date;
}

interface LearningInsight {
  pattern: string;
  confidence: number;
  frequency: number;
  lastSeen: Date;
}

interface ConsciousnessState {
  memories: EnhancedMemory[];
  preferences: UserPreference[];
  patterns: InteractionPattern[];
  insights: LearningInsight[];
}

export class ConsciousnessEngine {
  private memoryRetentionDays = 90;
  private patternThreshold = 3; // Minimum occurrences to recognize a pattern
  private confidenceDecayRate = 0.95; // Confidence decay per day

  constructor(private context: MemoryContext) {}

  /**
   * Initialize consciousness state for the current session
   */
  async initialize(): Promise<ConsciousnessState> {
    const [memories, preferences, patterns] = await Promise.all([
      this.loadRecentMemories(),
      this.loadUserPreferences(),
      this.loadInteractionPatterns()
    ]);

    const insights = this.generateInsights(memories, patterns);

    return {
      memories,
      preferences,
      patterns,
      insights
    };
  }

  /**
   * Store a new memory with context and embedding
   */
  async rememberInteraction(
    content: string,
    type: 'code' | 'chat' | 'error' | 'success',
    metadata?: Record<string, any>
  ): Promise<EnhancedMemory> {
    const memory = await db.insert(enhancedMemories).values({
      userId: this.context.userId,
      projectId: this.context.projectId,
      sessionId: this.context.sessionId,
      content,
      type,
      embedding: await this.generateEmbedding(content),
      metadata: metadata || {},
      confidence: 1.0,
      timestamp: new Date()
    }).returning();

    // Update patterns based on this interaction
    await this.updatePatterns(content, type);

    return memory[0];
  }

  /**
   * Learn user preferences from interactions
   */
  async learnPreference(
    category: string,
    preference: string,
    strength: number = 1.0
  ): Promise<void> {
    const existing = await db.select()
      .from(userPreferences)
      .where(
        and(
          eq(userPreferences.userId, this.context.userId),
          eq(userPreferences.category, category)
        )
      );

    if (existing.length > 0) {
      // Update existing preference with exponential moving average
      const currentStrength = existing[0].strength ?? 1.0;
      const newStrength = currentStrength * 0.7 + strength * 0.3;
      await db.update(userPreferences)
        .set({ 
          value: preference, 
          strength: newStrength,
          lastUpdated: new Date()
        })
        .where(eq(userPreferences.id, existing[0].id));
    } else {
      // Create new preference
      await db.insert(userPreferences).values({
        userId: this.context.userId,
        projectId: this.context.projectId,
        category,
        value: preference,
        strength,
        lastUpdated: new Date()
      });
    }
  }

  /**
   * Retrieve relevant memories for current context
   */
  async recall(query: string, limit: number = 10): Promise<EnhancedMemory[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Get recent memories
    const recentMemories = await this.loadRecentMemories(limit * 2);
    
    // Calculate relevance scores
    const scoredMemories = recentMemories.map(memory => ({
      memory,
      score: this.calculateRelevance(memory, queryEmbedding)
    }));

    // Sort by relevance and return top results
    return scoredMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.memory);
  }

  /**
   * Generate confidence score for AI suggestion
   */
  calculateSuggestionConfidence(
    suggestion: string,
    context: string
  ): number {
    const state = this.getConsciousnessState();
    
    // Base confidence from pattern matching
    let confidence = 0.5;
    
    // Boost confidence if suggestion aligns with user preferences
    const relevantPreferences = state.preferences.filter(pref => 
      suggestion.toLowerCase().includes(pref.value.toLowerCase())
    );
    confidence += relevantPreferences.reduce((sum, pref) => sum + (pref.strength ?? 1.0) * 0.1, 0);
    
    // Boost confidence if similar patterns succeeded before
    const successfulPatterns = state.memories.filter(mem => 
      mem.type === 'success' && 
      this.calculateSimilarity(mem.content, context) > 0.7
    );
    confidence += successfulPatterns.length * 0.05;
    
    // Apply confidence bounds
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Private helper methods
   */
  private async loadRecentMemories(limit: number = 100): Promise<EnhancedMemory[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.memoryRetentionDays);

    return await db.select()
      .from(enhancedMemories)
      .where(
        and(
          eq(enhancedMemories.userId, this.context.userId),
          eq(enhancedMemories.projectId, this.context.projectId),
          gte(enhancedMemories.timestamp, cutoffDate)
        )
      )
      .orderBy(desc(enhancedMemories.timestamp))
      .limit(limit);
  }

  private async loadUserPreferences(): Promise<UserPreference[]> {
    return await db.select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, this.context.userId));
  }

  private async loadInteractionPatterns(): Promise<InteractionPattern[]> {
    return await db.select()
      .from(interactionPatterns)
      .where(
        and(
          eq(interactionPatterns.userId, this.context.userId),
          eq(interactionPatterns.projectId, this.context.projectId),
          gte(interactionPatterns.occurrences, this.patternThreshold)
        )
      )
      .orderBy(desc(interactionPatterns.occurrences));
  }

  private async updatePatterns(content: string, type: string): Promise<void> {
    // Extract patterns from content (simplified - real implementation would use NLP)
    const patterns = this.extractPatterns(content);
    
    for (const pattern of patterns) {
      const existing = await db.select()
        .from(interactionPatterns)
        .where(
          and(
            eq(interactionPatterns.userId, this.context.userId),
            eq(interactionPatterns.projectId, this.context.projectId),
            eq(interactionPatterns.pattern, pattern)
          )
        );

      if (existing.length > 0) {
        await db.update(interactionPatterns)
          .set({ 
            occurrences: (existing[0].occurrences ?? 0) + 1,
            lastSeen: new Date()
          })
          .where(eq(interactionPatterns.id, existing[0].id));
      } else {
        await db.insert(interactionPatterns).values({
          userId: this.context.userId,
          projectId: this.context.projectId,
          pattern,
          type,
          occurrences: 1,
          context: { content },
          lastSeen: new Date()
        });
      }
    }
  }

  private generateInsights(
    memories: EnhancedMemory[], 
    patterns: InteractionPattern[]
  ): LearningInsight[] {
    return patterns
      .filter(pattern => pattern.occurrences !== null && pattern.lastSeen !== null)
      .map(pattern => ({
        pattern: pattern.pattern,
        confidence: this.calculatePatternConfidence(pattern),
        frequency: pattern.occurrences!,
        lastSeen: pattern.lastSeen!
      }));
  }

  private calculatePatternConfidence(pattern: InteractionPattern): number {
    if (!pattern.lastSeen || !pattern.occurrences) return 0.5;
    const daysSinceLastSeen = (Date.now() - pattern.lastSeen.getTime()) / (1000 * 60 * 60 * 24);
    const baseConfidence = Math.min(1, pattern.occurrences / 10);
    return baseConfidence * Math.pow(this.confidenceDecayRate, daysSinceLastSeen);
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Placeholder - would integrate with embedding model
    // For now, return a simple hash-based vector
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array(384).fill(0).map((_, i) => Math.sin(hash * (i + 1)) * 0.5 + 0.5);
  }

  private calculateRelevance(memory: EnhancedMemory, queryEmbedding: number[]): number {
    // Cosine similarity between embeddings
    const dotProduct = memory.embedding.reduce((sum, val, i) => sum + val * queryEmbedding[i], 0);
    const normA = Math.sqrt(memory.embedding.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(queryEmbedding.reduce((sum, val) => sum + val * val, 0));
    
    const similarity = dotProduct / (normA * normB);
    
    // Apply time decay
    const timestamp = memory.timestamp ?? new Date();
    const daysSince = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const timeDecay = Math.pow(0.99, daysSince);
    
    return similarity * timeDecay * (memory.confidence ?? 1.0);
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity for now
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private extractPatterns(content: string): string[] {
    // Simple pattern extraction - would use NLP in real implementation
    const patterns: string[] = [];
    
    // Extract code patterns
    const codePatterns = content.match(/\b(async|await|import|export|function|class|const|let)\s+\w+/g);
    if (codePatterns) patterns.push(...codePatterns);
    
    // Extract framework patterns
    const frameworkPatterns = content.match(/\b(React|Vue|Angular|Express|Next\.js|Tailwind)\b/gi);
    if (frameworkPatterns) patterns.push(...frameworkPatterns);
    
    return [...new Set(patterns)]; // Remove duplicates
  }

  private consciousnessState: ConsciousnessState | null = null;

  private getConsciousnessState(): ConsciousnessState {
    if (!this.consciousnessState) {
      throw new Error('Consciousness not initialized');
    }
    return this.consciousnessState;
  }

  async setConsciousnessState(state: ConsciousnessState): Promise<void> {
    this.consciousnessState = state;
  }
}

/**
 * Consciousness-aware AI provider wrapper
 */
export class ConsciousAIProvider {
  constructor(
    private baseProvider: BaseAIProvider,
    private consciousness: ConsciousnessEngine
  ) {}

  async complete(
    messages: any[],
    options?: any
  ): Promise<{ content: string; confidence: number }> {
    // Enrich context with relevant memories
    const lastMessage = messages[messages.length - 1];
    const relevantMemories = await this.consciousness.recall(lastMessage.content);
    
    // Add memory context to system message
    const enrichedMessages = [
      {
        role: 'system',
        content: this.buildConsciousnessContext(relevantMemories)
      },
      ...messages
    ];

    // Get completion from base provider
    const response = await this.baseProvider.complete(enrichedMessages, options);
    
    // Calculate confidence
    const confidence = this.consciousness.calculateSuggestionConfidence(
      response.content,
      lastMessage.content
    );

    // Remember this interaction
    await this.consciousness.rememberInteraction(
      `Q: ${lastMessage.content}\nA: ${response.content}`,
      'chat',
      { confidence }
    );

    return { content: response.content, confidence };
  }

  private buildConsciousnessContext(memories: EnhancedMemory[]): string {
    if (memories.length === 0) return '';

    const contextParts = [
      'Based on our previous interactions:',
      ...memories.map(m => `- ${m.content} (confidence: ${(m.confidence ?? 1.0).toFixed(2)})`)
    ];

    return contextParts.join('\n');
  }
}

/**
 * Consciousness service wrapper for managing consciousness sessions
 */
class ConsciousnessService {
  private sessions: Map<string, ConsciousnessEngine> = new Map();

  /**
   * Activate a new consciousness session
   */
  async activate(userId: string, projectId: number): Promise<{ sessionId: string; state: ConsciousnessState }> {
    const sessionId = `${userId}-${projectId}-${Date.now()}`;
    const context: MemoryContext = {
      userId,
      projectId,
      sessionId,
      timestamp: new Date()
    };

    const engine = new ConsciousnessEngine(context);
    const state = await engine.initialize();
    
    this.sessions.set(sessionId, engine);
    
    return { sessionId, state };
  }

  /**
   * Query the consciousness with context
   */
  async query(sessionId: string, query: string, projectId: number): Promise<{ response: string; confidence: number; tokensUsed?: number; cost?: string }> {
    const engine = this.sessions.get(sessionId);
    if (!engine) {
      throw new Error('Session not found. Please activate consciousness first.');
    }

    // Store the query as a memory
    await engine.rememberInteraction(query, 'chat');

    // Retrieve relevant memories
    const memories = await engine.retrieveRelevantMemories(query);

    // Build context from memories
    const contextInfo = memories.map(m => m.content).join('\n');
    
    // For now, return a simulated response
    // In a real implementation, this would call an AI provider with the enriched context
    const response = `Based on your query "${query}" and considering the project context:\n\n${contextInfo ? `Previous context:\n${contextInfo}\n\n` : ''}I understand you're working on ${query}. Let me help you with that.`;
    
    const confidence = engine.calculateSuggestionConfidence(response, query);

    return {
      response,
      confidence,
      tokensUsed: 100, // Placeholder
      cost: '0.001' // Placeholder
    };
  }

  /**
   * Get consciousness engine for a session
   */
  getEngine(sessionId: string): ConsciousnessEngine | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Clean up old sessions
   */
  cleanupSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [sessionId, engine] of this.sessions.entries()) {
      const timestamp = parseInt(sessionId.split('-').pop() || '0');
      if (now - timestamp > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Export singleton instance
export const consciousnessService = new ConsciousnessService();