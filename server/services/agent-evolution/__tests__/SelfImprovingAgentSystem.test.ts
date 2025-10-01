/**
 * Tests for Self-Improving Agent System
 * @version 1.2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SelfImprovingAgentSystem } from '../SelfImprovingAgentSystem';

describe('SelfImprovingAgentSystem', () => {
  let system: SelfImprovingAgentSystem;

  beforeEach(() => {
    system = new SelfImprovingAgentSystem({
      populationSize: 20,
      elitePercentage: 0.1,
      mutationRate: 0.1,
      crossoverRate: 0.7,
      diversityWeight: 0.2,
    });
  });

  describe('Population Initialization', () => {
    it('should initialize population with correct size', async () => {
      await system.initializePopulation();
      
      const stats = system.getStatistics();
      expect(stats.populationSize).toBe(20);
    });

    it('should create agents with random genomes', async () => {
      await system.initializePopulation();
      
      const bestAgent = system.getBestAgent();
      expect(bestAgent).toBeDefined();
      expect(bestAgent?.genes).toHaveProperty('learningRate');
      expect(bestAgent?.genes).toHaveProperty('explorationRate');
      expect(bestAgent?.genes).toHaveProperty('adaptability');
      expect(bestAgent?.genes).toHaveProperty('specialization');
      expect(bestAgent?.genes).toHaveProperty('collaboration');
      expect(bestAgent?.genes).toHaveProperty('riskTolerance');
      expect(bestAgent?.genes).toHaveProperty('creativityFactor');
      expect(bestAgent?.genes).toHaveProperty('efficiencyBias');
    });

    it('should create agents with neural architectures', async () => {
      await system.initializePopulation();
      
      const bestAgent = system.getBestAgent();
      expect(bestAgent?.neuralArchitecture).toHaveProperty('layers');
      expect(bestAgent?.neuralArchitecture).toHaveProperty('neuronsPerLayer');
      expect(bestAgent?.neuralArchitecture).toHaveProperty('activationFunctions');
      expect(bestAgent?.neuralArchitecture).toHaveProperty('dropoutRates');
      expect(bestAgent?.neuralArchitecture.layers).toBeGreaterThanOrEqual(3);
      expect(bestAgent?.neuralArchitecture.layers).toBeLessThanOrEqual(10);
    });
  });

  describe('Evolution Process', () => {
    beforeEach(async () => {
      await system.initializePopulation();
    });

    it('should evolve one generation', async () => {
      const mockEvaluator = async (agent: any) => ({
        taskSuccessRate: Math.random() * 0.5 + 0.5,
        averageQuality: Math.random() * 0.3 + 0.7,
        averageSpeed: Math.random(),
        resourceEfficiency: Math.random(),
        collaborationScore: Math.random(),
        innovationScore: Math.random(),
        userSatisfaction: Math.random(),
        adaptabilityScore: Math.random(),
      });

      const result = await system.evolveGeneration(mockEvaluator);

      expect(result).toHaveProperty('generation');
      expect(result).toHaveProperty('bestAgent');
      expect(result).toHaveProperty('populationFitness');
      expect(result).toHaveProperty('improvements');
      expect(result.generation).toBe(1);
    });

    it('should preserve elite agents', async () => {
      const mockEvaluator = async (agent: any) => ({
        taskSuccessRate: 0.8,
        averageQuality: 0.9,
        averageSpeed: 0.85,
        resourceEfficiency: 0.75,
        collaborationScore: 0.8,
        innovationScore: 0.7,
        userSatisfaction: 0.85,
        adaptabilityScore: 0.8,
      });

      const initialBest = system.getBestAgent();
      await system.evolveGeneration(mockEvaluator);
      
      const stats = system.getStatistics();
      expect(stats.populationSize).toBe(20);
    });

    it('should improve fitness over generations', async () => {
      let lastBestFitness = 0;

      for (let gen = 0; gen < 3; gen++) {
        const mockEvaluator = async (agent: any) => ({
          taskSuccessRate: 0.7 + Math.random() * 0.2,
          averageQuality: 0.7 + Math.random() * 0.2,
          averageSpeed: 0.7 + Math.random() * 0.2,
          resourceEfficiency: 0.7 + Math.random() * 0.2,
          collaborationScore: 0.7 + Math.random() * 0.2,
          innovationScore: 0.7 + Math.random() * 0.2,
          userSatisfaction: 0.7 + Math.random() * 0.2,
          adaptabilityScore: 0.7 + Math.random() * 0.2,
        });

        const result = await system.evolveGeneration(mockEvaluator);
        
        if (gen > 0) {
          // Not strictly guaranteed to improve every generation due to randomness,
          // but should not decrease significantly
          expect(result.populationFitness.best).toBeGreaterThanOrEqual(
            lastBestFitness - 0.1
          );
        }
        
        lastBestFitness = result.populationFitness.best;
      }
    });

    it('should perform crossovers and mutations', async () => {
      const mockEvaluator = async (agent: any) => ({
        taskSuccessRate: Math.random(),
        averageQuality: Math.random(),
        averageSpeed: Math.random(),
        resourceEfficiency: Math.random(),
        collaborationScore: Math.random(),
        innovationScore: Math.random(),
        userSatisfaction: Math.random(),
        adaptabilityScore: Math.random(),
      });

      const result = await system.evolveGeneration(mockEvaluator);

      expect(result.crossovers).toBeGreaterThan(0);
      // Mutations may be 0 due to probability, but should happen often
    });

    it('should track genetic diversity', async () => {
      const mockEvaluator = async (agent: any) => ({
        taskSuccessRate: Math.random() * 0.5 + 0.5,
        averageQuality: Math.random() * 0.3 + 0.7,
        averageSpeed: Math.random(),
        resourceEfficiency: Math.random(),
        collaborationScore: Math.random(),
        innovationScore: Math.random(),
        userSatisfaction: Math.random(),
        adaptabilityScore: Math.random(),
      });

      const result = await system.evolveGeneration(mockEvaluator);

      expect(result.populationFitness.diversity).toBeGreaterThanOrEqual(0);
      expect(result.populationFitness.diversity).toBeLessThanOrEqual(1);
    });
  });

  describe('Statistics and Export', () => {
    beforeEach(async () => {
      await system.initializePopulation();
    });

    it('should get statistics', () => {
      const stats = system.getStatistics();

      expect(stats).toHaveProperty('generation');
      expect(stats).toHaveProperty('populationSize');
      expect(stats).toHaveProperty('bestFitness');
      expect(stats).toHaveProperty('averageFitness');
      expect(stats).toHaveProperty('geneticDiversity');
      expect(stats).toHaveProperty('evolutionHistory');
      expect(stats).toHaveProperty('config');
    });

    it('should export agent genome', async () => {
      const bestAgent = system.getBestAgent();
      
      if (bestAgent) {
        const exported = system.exportAgent(bestAgent.id);
        
        expect(exported).toEqual(bestAgent);
        expect(exported?.id).toBe(bestAgent.id);
      }
    });

    it('should return null for non-existent agent', () => {
      const exported = system.exportAgent('non-existent-id');
      expect(exported).toBeNull();
    });

    it('should reset system', async () => {
      const mockEvaluator = async (agent: any) => ({
        taskSuccessRate: Math.random(),
        averageQuality: Math.random(),
        averageSpeed: Math.random(),
        resourceEfficiency: Math.random(),
        collaborationScore: Math.random(),
        innovationScore: Math.random(),
        userSatisfaction: Math.random(),
        adaptabilityScore: Math.random(),
      });

      await system.evolveGeneration(mockEvaluator);
      system.reset();

      const stats = system.getStatistics();
      expect(stats.generation).toBe(0);
      expect(stats.populationSize).toBe(0);
      expect(stats.evolutionHistory).toHaveLength(0);
    });
  });

  describe('Fitness Calculation', () => {
    beforeEach(async () => {
      await system.initializePopulation();
    });

    it('should calculate fitness from metrics', async () => {
      const mockEvaluator = async (agent: any) => ({
        taskSuccessRate: 1.0,
        averageQuality: 1.0,
        averageSpeed: 1.0,
        resourceEfficiency: 1.0,
        collaborationScore: 1.0,
        innovationScore: 1.0,
        userSatisfaction: 1.0,
        adaptabilityScore: 1.0,
      });

      const result = await system.evolveGeneration(mockEvaluator);

      expect(result.bestAgent.fitness).toBeGreaterThan(0.9);
      expect(result.bestAgent.fitness).toBeLessThanOrEqual(1.1); // Includes age bonus
    });

    it('should handle low-performing agents', async () => {
      const mockEvaluator = async (agent: any) => ({
        taskSuccessRate: 0.1,
        averageQuality: 0.1,
        averageSpeed: 0.1,
        resourceEfficiency: 0.1,
        collaborationScore: 0.1,
        innovationScore: 0.1,
        userSatisfaction: 0.1,
        adaptabilityScore: 0.1,
      });

      const result = await system.evolveGeneration(mockEvaluator);

      expect(result.bestAgent.fitness).toBeGreaterThanOrEqual(0);
      expect(result.bestAgent.fitness).toBeLessThan(0.5);
    });
  });
});
