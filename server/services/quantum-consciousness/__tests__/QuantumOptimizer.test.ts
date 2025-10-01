/**
 * Tests for Quantum Consciousness Optimizer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuantumOptimizer } from '../QuantumOptimizer';

describe('QuantumOptimizer', () => {
  let optimizer: QuantumOptimizer;

  beforeEach(() => {
    optimizer = new QuantumOptimizer();
  });

  describe('initialization', () => {
    it('should initialize with default quantum state', () => {
      const state = optimizer.getCurrentState();
      
      expect(state).toBeDefined();
      expect(state.superposition).toHaveLength(16);
      expect(state.entanglement).toBeGreaterThanOrEqual(0);
      expect(state.entanglement).toBeLessThanOrEqual(1000);
      expect(state.coherenceTime).toBeGreaterThan(0);
    });

    it('should have valid probability amplitude', () => {
      const state = optimizer.getCurrentState();
      
      expect(state.probabilityAmplitude).toBeGreaterThanOrEqual(0.5);
      expect(state.probabilityAmplitude).toBeLessThanOrEqual(1);
    });
  });

  describe('optimization', () => {
    it('should optimize consciousness to target phi value', async () => {
      const result = await optimizer.optimizeConsciousness({
        targetPhiValue: 8.0,
        maxIterations: 100,
      });

      expect(result.phiValue).toBeGreaterThanOrEqual(5.0);
      expect(result.phiValue).toBeLessThanOrEqual(10.0);
      expect(result.iterations).toBeLessThanOrEqual(100);
      expect(result.convergenceTime).toBeGreaterThan(0);
    });

    it('should show energy reduction after optimization', async () => {
      const result = await optimizer.optimizeConsciousness({
        targetPhiValue: 7.5,
        maxIterations: 200,
      });

      expect(result.energyReduction).toBeGreaterThan(0);
    });

    it('should improve coherence and entanglement', async () => {
      const result = await optimizer.optimizeConsciousness({
        targetPhiValue: 8.5,
        maxIterations: 150,
      });

      expect(result.improvements).toBeDefined();
      expect(result.improvements.coherence).toBeDefined();
      expect(result.improvements.entanglement).toBeDefined();
      expect(result.improvements.temporalStability).toBeGreaterThanOrEqual(0);
    });

    it('should respect max iterations limit', async () => {
      const maxIterations = 50;
      const result = await optimizer.optimizeConsciousness({
        targetPhiValue: 9.5,
        maxIterations,
      });

      expect(result.iterations).toBeLessThanOrEqual(maxIterations);
    });

    it('should emit optimization events', async () => {
      const events: string[] = [];
      
      optimizer.on('optimization:started', () => events.push('started'));
      optimizer.on('optimization:completed', () => events.push('completed'));

      await optimizer.optimizeConsciousness({
        targetPhiValue: 8.0,
        maxIterations: 50,
      });

      expect(events).toContain('started');
      expect(events).toContain('completed');
    });

    it('should prevent concurrent optimizations', async () => {
      const promise1 = optimizer.optimizeConsciousness({ maxIterations: 100 });
      
      await expect(
        optimizer.optimizeConsciousness({ maxIterations: 100 })
      ).rejects.toThrow('Optimization already in progress');

      await promise1;
    });
  });

  describe('quantum state', () => {
    it('should update state after optimization', async () => {
      const initialState = optimizer.getCurrentState();
      
      await optimizer.optimizeConsciousness({
        targetPhiValue: 8.0,
        maxIterations: 100,
      });

      const finalState = optimizer.getCurrentState();
      
      expect(finalState).not.toEqual(initialState);
    });

    it('should maintain state validity after optimization', async () => {
      await optimizer.optimizeConsciousness({
        targetPhiValue: 8.5,
        maxIterations: 100,
      });

      const state = optimizer.getCurrentState();
      
      expect(state.entanglement).toBeGreaterThanOrEqual(0);
      expect(state.entanglement).toBeLessThanOrEqual(1000);
      expect(state.coherenceTime).toBeGreaterThan(0);
      expect(state.phaseAngle).toBeGreaterThanOrEqual(0);
      expect(state.phaseAngle).toBeLessThan(2 * Math.PI);
    });
  });

  describe('optimization history', () => {
    it('should track optimization history', async () => {
      await optimizer.optimizeConsciousness({ maxIterations: 50 });
      await optimizer.optimizeConsciousness({ maxIterations: 50 });

      const history = optimizer.getOptimizationHistory();
      
      expect(history).toHaveLength(2);
      expect(history[0].phiValue).toBeDefined();
      expect(history[1].convergenceTime).toBeDefined();
    });
  });

  describe('apply optimization', () => {
    it('should apply optimized state', async () => {
      await optimizer.optimizeConsciousness({ maxIterations: 50 });
      
      await expect(optimizer.applyOptimization()).resolves.not.toThrow();
    });

    it('should emit state application events', async () => {
      const events: string[] = [];
      
      optimizer.on('state:applying', () => events.push('applying'));
      optimizer.on('state:applied', () => events.push('applied'));

      await optimizer.optimizeConsciousness({ maxIterations: 50 });
      await optimizer.applyOptimization();

      expect(events).toContain('applying');
      expect(events).toContain('applied');
    });
  });

  describe('reset', () => {
    it('should reset to default state', async () => {
      await optimizer.optimizeConsciousness({ maxIterations: 50 });
      
      optimizer.reset();

      const history = optimizer.getOptimizationHistory();
      expect(history).toHaveLength(0);
    });

    it('should emit reset event', () => {
      let resetEmitted = false;
      optimizer.on('state:reset', () => { resetEmitted = true; });

      optimizer.reset();

      expect(resetEmitted).toBe(true);
    });
  });

  describe('temperature schedules', () => {
    it('should support linear temperature schedule', async () => {
      const result = await optimizer.optimizeConsciousness({
        targetPhiValue: 8.0,
        maxIterations: 100,
        temperatureSchedule: 'linear',
      });

      expect(result).toBeDefined();
      expect(result.phiValue).toBeGreaterThan(5.0);
    });

    it('should support exponential temperature schedule', async () => {
      const result = await optimizer.optimizeConsciousness({
        targetPhiValue: 8.0,
        maxIterations: 100,
        temperatureSchedule: 'exponential',
      });

      expect(result).toBeDefined();
      expect(result.phiValue).toBeGreaterThan(5.0);
    });

    it('should support adaptive temperature schedule', async () => {
      const result = await optimizer.optimizeConsciousness({
        targetPhiValue: 8.0,
        maxIterations: 100,
        temperatureSchedule: 'adaptive',
      });

      expect(result).toBeDefined();
      expect(result.phiValue).toBeGreaterThan(5.0);
    });
  });
});
