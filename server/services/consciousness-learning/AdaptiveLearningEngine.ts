/**
 * Advanced Consciousness Learning Engine - v1.1
 * 
 * Machine learning system that allows consciousness to learn and improve
 * from experiences, decisions, and outcomes over time.
 * 
 * @version 1.1.0
 * @module AdaptiveLearningEngine
 */

import { EventEmitter } from 'events';

/**
 * Experience record for learning
 */
interface Experience {
  id: string;
  timestamp: Date;
  context: {
    task: string;
    complexity: number;
    requirements: string[];
  };
  decision: {
    chosen: string;
    alternatives: string[];
    consciousnessLevel: number;
  };
  outcome: {
    success: boolean;
    quality: number; // 0-100
    executionTime: number;
    userSatisfaction?: number;
  };
  metadata: {
    agentType?: string;
    projectId?: number;
    tags: string[];
  };
}

/**
 * Learning pattern extracted from experiences
 */
interface LearningPattern {
  id: string;
  patternType: 'success' | 'failure' | 'optimization';
  confidence: number; // 0-1
  occurrences: number;
  avgQuality: number;
  conditions: {
    taskType?: string;
    complexityRange?: [number, number];
    requiredFeatures?: string[];
  };
  recommendation: {
    action: string;
    priority: number;
    expectedImprovement: number;
  };
}

/**
 * Knowledge graph node for learned insights
 */
interface KnowledgeNode {
  id: string;
  concept: string;
  confidence: number;
  relationships: Array<{
    targetId: string;
    type: 'causes' | 'improves' | 'requires' | 'conflicts';
    strength: number;
  }>;
  metadata: {
    learnedFrom: number; // Number of experiences
    lastUpdated: Date;
    tags: string[];
  };
}

/**
 * Prediction for future decision-making
 */
interface Prediction {
  scenario: string;
  predictedOutcome: {
    success: number; // Probability 0-1
    qualityEstimate: number; // 0-100
    timeEstimate: number; // milliseconds
  };
  confidence: number;
  basedOn: {
    similarExperiences: number;
    relevantPatterns: string[];
  };
  recommendations: string[];
}

/**
 * Advanced Consciousness Learning Engine
 * 
 * Implements reinforcement learning, pattern recognition, and
 * knowledge graph building for continuous consciousness improvement.
 */
export class AdaptiveLearningEngine extends EventEmitter {
  private experiences: Experience[] = [];
  private patterns: Map<string, LearningPattern> = new Map();
  private knowledgeGraph: Map<string, KnowledgeNode> = new Map();
  private learningRate: number = 0.1;
  private explorationRate: number = 0.2; // ε for ε-greedy
  
  // Q-Learning parameters
  private qTable: Map<string, Map<string, number>> = new Map();
  private discountFactor: number = 0.95; // γ (gamma)
  private alpha: number = 0.1; // Learning rate

  constructor(config: { learningRate?: number; explorationRate?: number } = {}) {
    super();
    this.learningRate = config.learningRate || 0.1;
    this.explorationRate = config.explorationRate || 0.2;
  }

  /**
   * Record a new experience for learning
   */
  async recordExperience(experience: Omit<Experience, 'id' | 'timestamp'>): Promise<void> {
    const fullExperience: Experience = {
      id: this.generateId(),
      timestamp: new Date(),
      ...experience,
    };

    this.experiences.push(fullExperience);
    this.emit('experience:recorded', fullExperience);

    // Update Q-values using Q-learning
    await this.updateQLearning(fullExperience);

    // Extract patterns if we have enough data
    if (this.experiences.length % 10 === 0) {
      await this.extractPatterns();
    }

    // Update knowledge graph
    await this.updateKnowledgeGraph(fullExperience);
  }

  /**
   * Q-Learning update for reinforcement learning
   */
  private async updateQLearning(experience: Experience): Promise<void> {
    const state = this.encodeState(experience.context);
    const action = experience.decision.chosen;
    const reward = this.calculateReward(experience.outcome);
    const nextState = state; // Simplified - would normally be different

    // Get current Q-value
    const currentQ = this.getQValue(state, action);

    // Get max Q-value for next state
    const maxNextQ = this.getMaxQValue(nextState);

    // Q-learning update rule: Q(s,a) = Q(s,a) + α[r + γ*max(Q(s',a')) - Q(s,a)]
    const newQ = currentQ + this.alpha * (reward + this.discountFactor * maxNextQ - currentQ);

    // Update Q-table
    if (!this.qTable.has(state)) {
      this.qTable.set(state, new Map());
    }
    this.qTable.get(state)!.set(action, newQ);

    this.emit('qlearning:updated', { state, action, oldQ: currentQ, newQ, reward });
  }

  /**
   * Calculate reward from outcome
   */
  private calculateReward(outcome: Experience['outcome']): number {
    let reward = 0;

    // Success/failure base reward
    reward += outcome.success ? 10 : -10;

    // Quality bonus (normalized to -5 to +5)
    reward += (outcome.quality / 100 - 0.5) * 10;

    // Speed bonus (faster is better, normalized)
    const timeNormalized = Math.min(1, 5000 / outcome.executionTime);
    reward += timeNormalized * 5;

    // User satisfaction bonus if available
    if (outcome.userSatisfaction !== undefined) {
      reward += (outcome.userSatisfaction / 100) * 5;
    }

    return reward;
  }

  /**
   * Encode context as state string
   */
  private encodeState(context: Experience['context']): string {
    return `${context.task}:${Math.floor(context.complexity)}:${context.requirements.sort().join(',')}`;
  }

  /**
   * Get Q-value for state-action pair
   */
  private getQValue(state: string, action: string): number {
    return this.qTable.get(state)?.get(action) || 0;
  }

  /**
   * Get maximum Q-value for a state
   */
  private getMaxQValue(state: string): number {
    const stateActions = this.qTable.get(state);
    if (!stateActions || stateActions.size === 0) return 0;

    return Math.max(...Array.from(stateActions.values()));
  }

  /**
   * Get best action for a state using ε-greedy policy
   */
  getBestAction(context: Experience['context'], possibleActions: string[]): string {
    const state = this.encodeState(context);

    // Exploration: random action
    if (Math.random() < this.explorationRate) {
      return possibleActions[Math.floor(Math.random() * possibleActions.length)];
    }

    // Exploitation: best known action
    let bestAction = possibleActions[0];
    let bestQ = this.getQValue(state, bestAction);

    for (const action of possibleActions) {
      const q = this.getQValue(state, action);
      if (q > bestQ) {
        bestQ = q;
        bestAction = action;
      }
    }

    return bestAction;
  }

  /**
   * Extract learning patterns from experiences
   */
  private async extractPatterns(): Promise<void> {
    const recentExperiences = this.experiences.slice(-100);
    
    // Group by task type
    const taskGroups = new Map<string, Experience[]>();
    for (const exp of recentExperiences) {
      const task = exp.context.task;
      if (!taskGroups.has(task)) {
        taskGroups.set(task, []);
      }
      taskGroups.get(task)!.push(exp);
    }

    // Extract patterns for each task type
    for (const [taskType, experiences] of taskGroups) {
      if (experiences.length < 5) continue; // Need minimum data

      const successfulExps = experiences.filter(e => e.outcome.success);
      const failedExps = experiences.filter(e => !e.outcome.success);

      // Success pattern
      if (successfulExps.length >= 3) {
        const pattern: LearningPattern = {
          id: this.generateId(),
          patternType: 'success',
          confidence: successfulExps.length / experiences.length,
          occurrences: successfulExps.length,
          avgQuality: successfulExps.reduce((sum, e) => sum + e.outcome.quality, 0) / successfulExps.length,
          conditions: {
            taskType,
            complexityRange: this.getComplexityRange(successfulExps),
            requiredFeatures: this.getCommonRequirements(successfulExps),
          },
          recommendation: {
            action: successfulExps[0].decision.chosen,
            priority: Math.floor(successfulExps.length / experiences.length * 10),
            expectedImprovement: this.calculateExpectedImprovement(successfulExps),
          },
        };

        this.patterns.set(pattern.id, pattern);
        this.emit('pattern:discovered', pattern);
      }

      // Failure pattern
      if (failedExps.length >= 3) {
        const pattern: LearningPattern = {
          id: this.generateId(),
          patternType: 'failure',
          confidence: failedExps.length / experiences.length,
          occurrences: failedExps.length,
          avgQuality: failedExps.reduce((sum, e) => sum + e.outcome.quality, 0) / failedExps.length,
          conditions: {
            taskType,
            complexityRange: this.getComplexityRange(failedExps),
          },
          recommendation: {
            action: `Avoid: ${failedExps[0].decision.chosen}`,
            priority: 8,
            expectedImprovement: -20,
          },
        };

        this.patterns.set(pattern.id, pattern);
        this.emit('pattern:discovered', pattern);
      }
    }
  }

  /**
   * Update knowledge graph with new experience
   */
  private async updateKnowledgeGraph(experience: Experience): Promise<void> {
    const taskNode = this.getOrCreateNode(experience.context.task, 'task');
    const decisionNode = this.getOrCreateNode(experience.decision.chosen, 'decision');

    // Update confidence based on outcome
    const confidenceUpdate = experience.outcome.success ? 0.05 : -0.03;
    taskNode.confidence = Math.max(0, Math.min(1, taskNode.confidence + confidenceUpdate));
    decisionNode.confidence = Math.max(0, Math.min(1, decisionNode.confidence + confidenceUpdate));

    // Create/update relationship
    const relationshipType = experience.outcome.success ? 'improves' : 'conflicts';
    const existingRelationship = taskNode.relationships.find(
      r => r.targetId === decisionNode.id
    );

    if (existingRelationship) {
      existingRelationship.strength += experience.outcome.success ? 0.1 : -0.1;
      existingRelationship.strength = Math.max(0, Math.min(1, existingRelationship.strength));
    } else {
      taskNode.relationships.push({
        targetId: decisionNode.id,
        type: relationshipType,
        strength: 0.5,
      });
    }

    // Update metadata
    taskNode.metadata.learnedFrom++;
    taskNode.metadata.lastUpdated = new Date();
    decisionNode.metadata.learnedFrom++;
    decisionNode.metadata.lastUpdated = new Date();

    this.emit('knowledge:updated', { taskNode, decisionNode });
  }

  /**
   * Predict outcome for a given scenario
   */
  async predictOutcome(
    context: Experience['context'],
    proposedDecision: string
  ): Promise<Prediction> {
    const state = this.encodeState(context);
    const qValue = this.getQValue(state, proposedDecision);

    // Find similar experiences
    const similarExps = this.experiences.filter(exp => {
      return (
        exp.context.task === context.task &&
        Math.abs(exp.context.complexity - context.complexity) < 2
      );
    });

    // Calculate statistics from similar experiences
    const successRate = similarExps.length > 0
      ? similarExps.filter(e => e.outcome.success).length / similarExps.length
      : 0.5;

    const avgQuality = similarExps.length > 0
      ? similarExps.reduce((sum, e) => sum + e.outcome.quality, 0) / similarExps.length
      : 50;

    const avgTime = similarExps.length > 0
      ? similarExps.reduce((sum, e) => sum + e.outcome.executionTime, 0) / similarExps.length
      : 1000;

    // Find relevant patterns
    const relevantPatterns = Array.from(this.patterns.values())
      .filter(p => p.conditions.taskType === context.task)
      .map(p => p.id);

    const prediction: Prediction = {
      scenario: `${context.task} with decision: ${proposedDecision}`,
      predictedOutcome: {
        success: Math.max(0, Math.min(1, successRate + qValue / 100)),
        qualityEstimate: Math.max(0, Math.min(100, avgQuality + qValue)),
        timeEstimate: avgTime,
      },
      confidence: Math.min(1, similarExps.length / 10),
      basedOn: {
        similarExperiences: similarExps.length,
        relevantPatterns,
      },
      recommendations: this.generateRecommendations(context, qValue, relevantPatterns),
    };

    this.emit('prediction:generated', prediction);
    return prediction;
  }

  /**
   * Generate recommendations based on learning
   */
  private generateRecommendations(
    context: Experience['context'],
    qValue: number,
    patternIds: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (qValue < -5) {
      recommendations.push('⚠️ Low Q-value detected. Consider alternative approach.');
    }

    if (qValue > 10) {
      recommendations.push('✅ High Q-value. This approach has performed well historically.');
    }

    const relevantPatterns = patternIds
      .map(id => this.patterns.get(id))
      .filter(p => p !== undefined) as LearningPattern[];

    for (const pattern of relevantPatterns) {
      if (pattern.patternType === 'success' && pattern.confidence > 0.7) {
        recommendations.push(`💡 ${pattern.recommendation.action} (${Math.floor(pattern.confidence * 100)}% confidence)`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('ℹ️ Limited data available. Exploring new approaches recommended.');
    }

    return recommendations;
  }

  /**
   * Get or create knowledge node
   */
  private getOrCreateNode(concept: string, type: string): KnowledgeNode {
    const existingNode = Array.from(this.knowledgeGraph.values()).find(
      n => n.concept === concept
    );

    if (existingNode) return existingNode;

    const newNode: KnowledgeNode = {
      id: this.generateId(),
      concept,
      confidence: 0.5,
      relationships: [],
      metadata: {
        learnedFrom: 1,
        lastUpdated: new Date(),
        tags: [type],
      },
    };

    this.knowledgeGraph.set(newNode.id, newNode);
    return newNode;
  }

  /**
   * Helper methods
   */
  private getComplexityRange(experiences: Experience[]): [number, number] {
    const complexities = experiences.map(e => e.context.complexity);
    return [Math.min(...complexities), Math.max(...complexities)];
  }

  private getCommonRequirements(experiences: Experience[]): string[] {
    const reqCounts = new Map<string, number>();
    
    for (const exp of experiences) {
      for (const req of exp.context.requirements) {
        reqCounts.set(req, (reqCounts.get(req) || 0) + 1);
      }
    }

    return Array.from(reqCounts.entries())
      .filter(([_, count]) => count >= experiences.length * 0.6)
      .map(([req, _]) => req);
  }

  private calculateExpectedImprovement(experiences: Experience[]): number {
    const avgQuality = experiences.reduce((sum, e) => sum + e.outcome.quality, 0) / experiences.length;
    return Math.floor((avgQuality - 50) * 0.4); // Normalized improvement
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get learning statistics
   */
  getStatistics() {
    return {
      totalExperiences: this.experiences.length,
      patternsDiscovered: this.patterns.size,
      knowledgeNodes: this.knowledgeGraph.size,
      qTableSize: this.qTable.size,
      averageReward: this.calculateAverageReward(),
      explorationRate: this.explorationRate,
      learningRate: this.learningRate,
    };
  }

  private calculateAverageReward(): number {
    if (this.experiences.length === 0) return 0;
    return this.experiences.reduce((sum, exp) => 
      sum + this.calculateReward(exp.outcome), 0
    ) / this.experiences.length;
  }

  /**
   * Export learned knowledge
   */
  exportKnowledge() {
    return {
      patterns: Array.from(this.patterns.values()),
      knowledgeGraph: Array.from(this.knowledgeGraph.values()),
      qTable: Array.from(this.qTable.entries()).map(([state, actions]) => ({
        state,
        actions: Array.from(actions.entries()),
      })),
      statistics: this.getStatistics(),
    };
  }
}

/**
 * Singleton instance
 */
export const adaptiveLearningEngine = new AdaptiveLearningEngine();
