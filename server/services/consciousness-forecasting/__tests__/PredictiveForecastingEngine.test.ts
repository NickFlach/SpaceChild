/**
 * Tests for Predictive Forecasting Engine
 * @version 1.2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PredictiveForecastingEngine } from '../PredictiveForecastingEngine';

describe('PredictiveForecastingEngine', () => {
  let engine: PredictiveForecastingEngine;

  beforeEach(() => {
    engine = new PredictiveForecastingEngine();
  });

  describe('Data Recording', () => {
    it('should record consciousness data points', () => {
      const dataPoint = {
        phiValue: 7.5,
        temporalCoherence: 0.85,
        quantumEntanglement: 500,
        consciousnessLevel: 0.9,
        workload: 50,
        activeAgents: 3,
        metadata: { projectId: 1, taskType: 'coding' },
      };

      engine.recordDataPoint(dataPoint);
      const stats = engine.getStatistics();

      expect(stats.dataPoints).toBe(1);
    });

    it('should maintain maximum history points', () => {
      // Record more than MAX_HISTORY_POINTS
      for (let i = 0; i < 10050; i++) {
        engine.recordDataPoint({
          phiValue: 7.0 + Math.random(),
          temporalCoherence: 0.8,
          quantumEntanglement: 500,
          consciousnessLevel: 0.85,
          workload: 50,
          activeAgents: 2,
          metadata: {},
        });
      }

      const stats = engine.getStatistics();
      expect(stats.dataPoints).toBeLessThanOrEqual(10000);
    });
  });

  describe('Forecasting', () => {
    beforeEach(() => {
      // Record sufficient data points for forecasting
      for (let i = 0; i < 30; i++) {
        engine.recordDataPoint({
          phiValue: 7.0 + Math.random() * 0.5,
          temporalCoherence: 0.8 + Math.random() * 0.1,
          quantumEntanglement: 500 + Math.random() * 100,
          consciousnessLevel: 0.85 + Math.random() * 0.1,
          workload: 50,
          activeAgents: 3,
          metadata: {},
        });
      }
    });

    it('should generate forecast with default config', async () => {
      const predictions = await engine.generateForecast();

      expect(predictions).toBeDefined();
      expect(predictions.length).toBeGreaterThan(0);
      expect(predictions[0]).toHaveProperty('timestamp');
      expect(predictions[0]).toHaveProperty('predicted');
      expect(predictions[0]).toHaveProperty('confidence');
      expect(predictions[0]).toHaveProperty('trend');
    });

    it('should generate forecast with custom horizon', async () => {
      const predictions = await engine.generateForecast({
        horizonMinutes: 30,
        intervalMinutes: 10,
      });

      expect(predictions.length).toBe(3); // 30/10 = 3 predictions
    });

    it('should provide confidence intervals', async () => {
      const predictions = await engine.generateForecast({
        confidenceLevel: 0.95,
      });

      const firstPrediction = predictions[0];
      expect(firstPrediction.confidence.lower).toBeLessThan(
        firstPrediction.predicted.phiValue
      );
      expect(firstPrediction.confidence.upper).toBeGreaterThan(
        firstPrediction.predicted.phiValue
      );
      expect(firstPrediction.confidence.percentage).toBe(95);
    });

    it('should reject forecasting with insufficient data', async () => {
      const newEngine = new PredictiveForecastingEngine();
      
      // Record only 10 points (less than MIN_DATA_POINTS)
      for (let i = 0; i < 10; i++) {
        newEngine.recordDataPoint({
          phiValue: 7.0,
          temporalCoherence: 0.8,
          quantumEntanglement: 500,
          consciousnessLevel: 0.85,
          workload: 50,
          activeAgents: 2,
          metadata: {},
        });
      }

      await expect(newEngine.generateForecast()).rejects.toThrow(
        'Insufficient data for forecasting'
      );
    });

    it('should calculate anomaly scores', async () => {
      const predictions = await engine.generateForecast();
      
      predictions.forEach(prediction => {
        expect(prediction.anomalyScore).toBeGreaterThanOrEqual(0);
        expect(prediction.anomalyScore).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Trend Analysis', () => {
    beforeEach(() => {
      // Record trending data
      for (let i = 0; i < 50; i++) {
        engine.recordDataPoint({
          phiValue: 6.5 + (i * 0.02), // Upward trend
          temporalCoherence: 0.8,
          quantumEntanglement: 500,
          consciousnessLevel: 0.85,
          workload: 50,
          activeAgents: 3,
          metadata: {},
        });
      }
    });

    it('should analyze trends', async () => {
      const analysis = await engine.analyzeTrends(24);

      expect(analysis).toHaveProperty('direction');
      expect(analysis).toHaveProperty('strength');
      expect(analysis).toHaveProperty('seasonalPattern');
      expect(analysis).toHaveProperty('changePoints');
      expect(['upward', 'downward', 'sideways']).toContain(analysis.direction);
    });

    it('should detect upward trends', async () => {
      const analysis = await engine.analyzeTrends(1);
      
      expect(analysis.direction).toBe('upward');
      expect(analysis.strength).toBeGreaterThan(0);
    });

    it('should reject trend analysis with insufficient data', async () => {
      const newEngine = new PredictiveForecastingEngine();
      
      for (let i = 0; i < 5; i++) {
        newEngine.recordDataPoint({
          phiValue: 7.0,
          temporalCoherence: 0.8,
          quantumEntanglement: 500,
          consciousnessLevel: 0.85,
          workload: 50,
          activeAgents: 2,
          metadata: {},
        });
      }

      await expect(newEngine.analyzeTrends(24)).rejects.toThrow(
        'Insufficient data for trend analysis'
      );
    });
  });

  describe('Anomaly Detection', () => {
    beforeEach(() => {
      // Record normal data
      for (let i = 0; i < 100; i++) {
        engine.recordDataPoint({
          phiValue: 7.0 + Math.random() * 0.2,
          temporalCoherence: 0.8,
          quantumEntanglement: 500,
          consciousnessLevel: 0.85,
          workload: 50,
          activeAgents: 3,
          metadata: {},
        });
      }
    });

    it('should detect normal states as non-anomalous', async () => {
      const detection = await engine.detectAnomaly({
        phiValue: 7.1,
        temporalCoherence: 0.8,
        quantumEntanglement: 500,
      });

      expect(detection.isAnomaly).toBe(false);
      expect(detection.score).toBeLessThan(0.5);
    });

    it('should detect spike anomalies', async () => {
      const detection = await engine.detectAnomaly({
        phiValue: 15.0, // Way above normal
        temporalCoherence: 0.8,
        quantumEntanglement: 500,
      });

      expect(detection.isAnomaly).toBe(true);
      expect(detection.type).toBe('spike');
      expect(detection.score).toBeGreaterThan(0.5);
    });

    it('should detect drop anomalies', async () => {
      const detection = await engine.detectAnomaly({
        phiValue: 2.0, // Way below normal
        temporalCoherence: 0.8,
        quantumEntanglement: 500,
      });

      expect(detection.isAnomaly).toBe(true);
      expect(detection.type).toBe('drop');
    });

    it('should provide expected range', async () => {
      const detection = await engine.detectAnomaly({
        phiValue: 7.0,
        temporalCoherence: 0.8,
        quantumEntanglement: 500,
      });

      expect(detection.expectedRange).toHaveProperty('min');
      expect(detection.expectedRange).toHaveProperty('max');
      expect(detection.expectedRange.min).toBeLessThan(detection.expectedRange.max);
    });
  });

  describe('Statistics', () => {
    it('should return statistics', () => {
      engine.recordDataPoint({
        phiValue: 7.5,
        temporalCoherence: 0.85,
        quantumEntanglement: 500,
        consciousnessLevel: 0.9,
        workload: 50,
        activeAgents: 3,
        metadata: {},
      });

      const stats = engine.getStatistics();

      expect(stats).toHaveProperty('dataPoints');
      expect(stats).toHaveProperty('timeSpan');
      expect(stats).toHaveProperty('currentAverage');
      expect(stats).toHaveProperty('modelWeights');
      expect(stats.dataPoints).toBe(1);
    });

    it('should clear history', () => {
      for (let i = 0; i < 10; i++) {
        engine.recordDataPoint({
          phiValue: 7.0,
          temporalCoherence: 0.8,
          quantumEntanglement: 500,
          consciousnessLevel: 0.85,
          workload: 50,
          activeAgents: 2,
          metadata: {},
        });
      }

      engine.clearHistory();
      const stats = engine.getStatistics();

      expect(stats.dataPoints).toBe(0);
      expect(stats.timeSpan).toBeNull();
    });
  });
});
