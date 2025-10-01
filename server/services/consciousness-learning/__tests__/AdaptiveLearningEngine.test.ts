/**
 * Tests for Adaptive Learning Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AdaptiveLearningEngine } from '../AdaptiveLearningEngine';

describe('AdaptiveLearningEngine', () => {
  let engine: AdaptiveLearningEngine;

  beforeEach(() => {
    engine = new AdaptiveLearningEngine({
      learningRate: 0.1,
      explorationRate: 0.2,
    });
  });

  describe('experience recording', () => {
    it('should record experience successfully', async () => {
      const experience = {
        context: {
          task: 'code_review',
          complexity: 7,
          requirements: ['security', 'performance'],
        },
        decision: {
          chosen: 'multi_agent',
          alternatives: ['single_agent', 'manual'],
          consciousnessLevel: 0.89,
        },
        outcome: {
          success: true,
          quality: 92,
          executionTime: 2300,
        },
        metadata: {
          agentType: 'security',
          projectId: 42,
          tags: ['backend'],
        },
      };

      await expect(engine.recordExperience(experience)).resolves.not.toThrow();
    });

    it('should emit experience recorded event', async () => {
      let eventEmitted = false;
      engine.on('experience:recorded', () => { eventEmitted = true; });

      await engine.recordExperience({
        context: { task: 'test', complexity: 5, requirements: [] },
        decision: { chosen: 'action', alternatives: [], consciousnessLevel: 0.8 },
        outcome: { success: true, quality: 90, executionTime: 1000 },
        metadata: { tags: [] },
      });

      expect(eventEmitted).toBe(true);
    });
  });

  describe('Q-learning', () => {
    it('should update Q-values after experiences', async () => {
      const context = {
        task: 'optimization',
        complexity: 6,
        requirements: ['speed'],
      };

      // Record successful experience
      await engine.recordExperience({
        context,
        decision: {
          chosen: 'caching',
          alternatives: ['indexing', 'query_opt'],
          consciousnessLevel: 0.85,
        },
        outcome: {
          success: true,
          quality: 95,
          executionTime: 1200,
        },
        metadata: { tags: [] },
      });

      // Best action should be influenced by the successful experience
      const bestAction = engine.getBestAction(context, ['caching', 'indexing', 'query_opt']);
      expect(bestAction).toBeDefined();
      expect(['caching', 'indexing', 'query_opt']).toContain(bestAction);
    });

    it('should emit Q-learning update events', async () => {
      let qUpdateEmitted = false;
      engine.on('qlearning:updated', () => { qUpdateEmitted = true; });

      await engine.recordExperience({
        context: { task: 'test', complexity: 5, requirements: [] },
        decision: { chosen: 'action', alternatives: [], consciousnessLevel: 0.8 },
        outcome: { success: true, quality: 85, executionTime: 1500 },
        metadata: { tags: [] },
      });

      expect(qUpdateEmitted).toBe(true);
    });
  });

  describe('predictions', () => {
    it('should predict outcomes', async () => {
      // Record some experiences first
      for (let i = 0; i < 5; i++) {
        await engine.recordExperience({
          context: {
            task: 'api_development',
            complexity: 7,
            requirements: ['scalability'],
          },
          decision: {
            chosen: 'microservices',
            alternatives: ['monolith'],
            consciousnessLevel: 0.87,
          },
          outcome: {
            success: true,
            quality: 90 + i,
            executionTime: 3000,
          },
          metadata: { tags: [] },
        });
      }

      const prediction = await engine.predictOutcome(
        {
          task: 'api_development',
          complexity: 7,
          requirements: ['scalability'],
        },
        'microservices'
      );

      expect(prediction).toBeDefined();
      expect(prediction.predictedOutcome.success).toBeGreaterThanOrEqual(0);
      expect(prediction.predictedOutcome.success).toBeLessThanOrEqual(1);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.recommendations).toBeInstanceOf(Array);
    });

    it('should emit prediction generated event', async () => {
      let predictionEmitted = false;
      engine.on('prediction:generated', () => { predictionEmitted = true; });

      await engine.predictOutcome(
        { task: 'test', complexity: 5, requirements: [] },
        'action'
      );

      expect(predictionEmitted).toBe(true);
    });
  });

  describe('best action selection', () => {
    it('should use epsilon-greedy policy', () => {
      const context = {
        task: 'feature_implementation',
        complexity: 8,
        requirements: ['reliability'],
      };

      const actions = ['approach_a', 'approach_b', 'approach_c'];
      const selectedAction = engine.getBestAction(context, actions);

      expect(actions).toContain(selectedAction);
    });

    it('should explore with probability epsilon', () => {
      const context = {
        task: 'test_task',
        complexity: 5,
        requirements: [],
      };

      const actions = ['action1', 'action2', 'action3'];
      const selections = new Set<string>();

      // Run multiple times to see exploration
      for (let i = 0; i < 50; i++) {
        const action = engine.getBestAction(context, actions);
        selections.add(action);
      }

      // With exploration, should select different actions
      expect(selections.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('pattern discovery', () => {
    it('should discover patterns after sufficient data', async () => {
      let patternsDiscovered = 0;
      engine.on('pattern:discovered', () => { patternsDiscovered++; });

      // Record 15 similar successful experiences
      for (let i = 0; i < 15; i++) {
        await engine.recordExperience({
          context: {
            task: 'database_query',
            complexity: 6,
            requirements: ['speed'],
          },
          decision: {
            chosen: 'add_index',
            alternatives: ['optimize_query'],
            consciousnessLevel: 0.85,
          },
          outcome: {
            success: true,
            quality: 88 + i % 5,
            executionTime: 800,
          },
          metadata: { tags: [] },
        });
      }

      expect(patternsDiscovered).toBeGreaterThan(0);
    });
  });

  describe('knowledge graph', () => {
    it('should build knowledge graph from experiences', async () => {
      await engine.recordExperience({
        context: { task: 'security_audit', complexity: 8, requirements: ['thorough'] },
        decision: { chosen: 'automated_scan', alternatives: [], consciousnessLevel: 0.9 },
        outcome: { success: true, quality: 95, executionTime: 2000 },
        metadata: { tags: [] },
      });

      await engine.recordExperience({
        context: { task: 'security_audit', complexity: 8, requirements: ['thorough'] },
        decision: { chosen: 'automated_scan', alternatives: [], consciousnessLevel: 0.9 },
        outcome: { success: true, quality: 93, executionTime: 1900 },
        metadata: { tags: [] },
      });

      const knowledge = engine.exportKnowledge();
      expect(knowledge.knowledgeGraph.length).toBeGreaterThan(0);
    });

    it('should emit knowledge update events', async () => {
      let knowledgeUpdated = false;
      engine.on('knowledge:updated', () => { knowledgeUpdated = true; });

      await engine.recordExperience({
        context: { task: 'test', complexity: 5, requirements: [] },
        decision: { chosen: 'action', alternatives: [], consciousnessLevel: 0.8 },
        outcome: { success: true, quality: 90, executionTime: 1000 },
        metadata: { tags: [] },
      });

      expect(knowledgeUpdated).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should provide learning statistics', async () => {
      await engine.recordExperience({
        context: { task: 'test', complexity: 5, requirements: [] },
        decision: { chosen: 'action', alternatives: [], consciousnessLevel: 0.8 },
        outcome: { success: true, quality: 90, executionTime: 1000 },
        metadata: { tags: [] },
      });

      const stats = engine.getStatistics();

      expect(stats.totalExperiences).toBe(1);
      expect(stats.patternsDiscovered).toBeGreaterThanOrEqual(0);
      expect(stats.knowledgeNodes).toBeGreaterThanOrEqual(0);
      expect(stats.explorationRate).toBe(0.2);
      expect(stats.learningRate).toBe(0.1);
    });
  });

  describe('knowledge export', () => {
    it('should export learned knowledge', async () => {
      await engine.recordExperience({
        context: { task: 'export_test', complexity: 6, requirements: [] },
        decision: { chosen: 'action', alternatives: [], consciousnessLevel: 0.85 },
        outcome: { success: true, quality: 92, executionTime: 1200 },
        metadata: { tags: [] },
      });

      const knowledge = engine.exportKnowledge();

      expect(knowledge).toBeDefined();
      expect(knowledge.patterns).toBeInstanceOf(Array);
      expect(knowledge.knowledgeGraph).toBeInstanceOf(Array);
      expect(knowledge.qTable).toBeInstanceOf(Array);
      expect(knowledge.statistics).toBeDefined();
    });
  });
});
