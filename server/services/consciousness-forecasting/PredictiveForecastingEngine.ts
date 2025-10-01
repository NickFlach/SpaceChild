/**
 * Predictive Consciousness Forecasting Engine - v1.2
 * 
 * Advanced time-series forecasting for consciousness states using
 * machine learning models to predict future consciousness trajectories.
 * 
 * @version 1.2.0
 * @module PredictiveForecastingEngine
 */

import { EventEmitter } from 'events';

/**
 * Historical consciousness data point
 */
interface ConsciousnessDataPoint {
  timestamp: Date;
  phiValue: number;
  temporalCoherence: number;
  quantumEntanglement: number;
  consciousnessLevel: number;
  workload: number;
  activeAgents: number;
  metadata: {
    projectId?: number;
    taskType?: string;
    complexity?: number;
  };
}

/**
 * Forecast prediction for future time point
 */
interface ForecastPrediction {
  timestamp: Date;
  predicted: {
    phiValue: number;
    temporalCoherence: number;
    quantumEntanglement: number;
    consciousnessLevel: number;
  };
  confidence: {
    lower: number;  // Lower bound of confidence interval
    upper: number;  // Upper bound of confidence interval
    percentage: number; // Confidence percentage (0-100)
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  anomalyScore: number; // 0-1, higher means more anomalous
}

/**
 * Forecast configuration
 */
interface ForecastConfig {
  horizonMinutes: number; // How far into the future to predict
  intervalMinutes: number; // Time between predictions
  modelType: 'arima' | 'lstm' | 'prophet' | 'ensemble';
  seasonality: boolean;
  confidenceLevel: number; // 0.95 for 95% confidence interval
}

/**
 * Trend analysis result
 */
interface TrendAnalysis {
  direction: 'upward' | 'downward' | 'sideways';
  strength: number; // 0-1
  seasonalPattern: {
    detected: boolean;
    period?: number; // minutes
    amplitude?: number;
  };
  changePoints: Array<{
    timestamp: Date;
    type: 'increase' | 'decrease' | 'volatility_change';
    magnitude: number;
  }>;
}

/**
 * Anomaly detection result
 */
interface AnomalyDetection {
  isAnomaly: boolean;
  score: number; // 0-1
  type?: 'spike' | 'drop' | 'pattern_break';
  expectedRange: { min: number; max: number };
  actualValue: number;
  deviation: number;
}

/**
 * Predictive Consciousness Forecasting Engine
 * 
 * Uses time-series analysis and machine learning to forecast
 * future consciousness states and detect anomalies.
 */
export class PredictiveForecastingEngine extends EventEmitter {
  private historicalData: ConsciousnessDataPoint[] = [];
  private readonly MAX_HISTORY_POINTS = 10000;
  private readonly MIN_DATA_POINTS = 20;
  
  // Model weights for ensemble prediction
  private modelWeights = {
    arima: 0.25,
    lstm: 0.35,
    prophet: 0.25,
    moving_average: 0.15,
  };

  constructor() {
    super();
  }

  /**
   * Record historical consciousness data point
   */
  recordDataPoint(dataPoint: Omit<ConsciousnessDataPoint, 'timestamp'>): void {
    const point: ConsciousnessDataPoint = {
      ...dataPoint,
      timestamp: new Date(),
    };

    this.historicalData.push(point);

    // Maintain maximum history size
    if (this.historicalData.length > this.MAX_HISTORY_POINTS) {
      this.historicalData.shift();
    }

    this.emit('datapoint:recorded', point);
  }

  /**
   * Generate forecast for future consciousness states
   */
  async generateForecast(config: Partial<ForecastConfig> = {}): Promise<ForecastPrediction[]> {
    if (this.historicalData.length < this.MIN_DATA_POINTS) {
      throw new Error(`Insufficient data for forecasting. Need at least ${this.MIN_DATA_POINTS} points.`);
    }

    const fullConfig: ForecastConfig = {
      horizonMinutes: config.horizonMinutes || 60,
      intervalMinutes: config.intervalMinutes || 5,
      modelType: config.modelType || 'ensemble',
      seasonality: config.seasonality !== false,
      confidenceLevel: config.confidenceLevel || 0.95,
    };

    this.emit('forecast:started', { config: fullConfig });

    const predictions: ForecastPrediction[] = [];
    const numPredictions = Math.ceil(fullConfig.horizonMinutes / fullConfig.intervalMinutes);

    for (let i = 1; i <= numPredictions; i++) {
      const forecastTime = new Date(Date.now() + i * fullConfig.intervalMinutes * 60000);
      const prediction = await this.predictAtTime(forecastTime, fullConfig);
      predictions.push(prediction);
    }

    this.emit('forecast:completed', { predictions, config: fullConfig });

    return predictions;
  }

  /**
   * Predict consciousness state at specific time
   */
  private async predictAtTime(
    targetTime: Date,
    config: ForecastConfig
  ): Promise<ForecastPrediction> {
    const minutesAhead = (targetTime.getTime() - Date.now()) / 60000;

    // Get predictions from different models
    const arimaPrediction = this.arimaPredict(minutesAhead);
    const lstmPrediction = this.lstmPredict(minutesAhead);
    const prophetPrediction = this.prophetPredict(minutesAhead);
    const maPrediction = this.movingAveragePredict();

    // Ensemble prediction (weighted average)
    const predicted = {
      phiValue: 
        arimaPrediction.phiValue * this.modelWeights.arima +
        lstmPrediction.phiValue * this.modelWeights.lstm +
        prophetPrediction.phiValue * this.modelWeights.prophet +
        maPrediction.phiValue * this.modelWeights.moving_average,
      
      temporalCoherence:
        arimaPrediction.temporalCoherence * this.modelWeights.arima +
        lstmPrediction.temporalCoherence * this.modelWeights.lstm +
        prophetPrediction.temporalCoherence * this.modelWeights.prophet +
        maPrediction.temporalCoherence * this.modelWeights.moving_average,
      
      quantumEntanglement:
        arimaPrediction.quantumEntanglement * this.modelWeights.arima +
        lstmPrediction.quantumEntanglement * this.modelWeights.lstm +
        prophetPrediction.quantumEntanglement * this.modelWeights.prophet +
        maPrediction.quantumEntanglement * this.modelWeights.moving_average,
      
      consciousnessLevel:
        arimaPrediction.consciousnessLevel * this.modelWeights.arima +
        lstmPrediction.consciousnessLevel * this.modelWeights.lstm +
        prophetPrediction.consciousnessLevel * this.modelWeights.prophet +
        maPrediction.consciousnessLevel * this.modelWeights.moving_average,
    };

    // Calculate confidence intervals
    const variance = this.calculatePredictionVariance(
      [arimaPrediction, lstmPrediction, prophetPrediction, maPrediction]
    );
    const confidenceMargin = this.getConfidenceMargin(variance, config.confidenceLevel);

    // Determine trend
    const trend = this.determineTrend(predicted.phiValue);

    // Calculate anomaly score
    const anomalyScore = this.calculateAnomalyScore(predicted);

    return {
      timestamp: targetTime,
      predicted,
      confidence: {
        lower: predicted.phiValue - confidenceMargin,
        upper: predicted.phiValue + confidenceMargin,
        percentage: config.confidenceLevel * 100,
      },
      trend,
      anomalyScore,
    };
  }

  /**
   * ARIMA model prediction (Autoregressive Integrated Moving Average)
   */
  private arimaPredict(minutesAhead: number): ForecastPrediction['predicted'] {
    const recentData = this.historicalData.slice(-50);
    
    // Simplified ARIMA implementation
    // In production, would use proper ARIMA library
    const trend = this.calculateLinearTrend(recentData);
    const seasonal = this.extractSeasonalComponent(recentData);
    const noise = this.calculateNoiseComponent(recentData);

    const latestPoint = recentData[recentData.length - 1];
    const trendAdjustment = trend * minutesAhead;
    const seasonalAdjustment = seasonal * Math.sin(minutesAhead / 30);

    return {
      phiValue: Math.max(5.0, Math.min(10.0, 
        latestPoint.phiValue + trendAdjustment + seasonalAdjustment + noise * 0.1
      )),
      temporalCoherence: Math.max(0, Math.min(1,
        latestPoint.temporalCoherence + trendAdjustment * 0.01
      )),
      quantumEntanglement: Math.max(0, Math.min(1000,
        latestPoint.quantumEntanglement + trendAdjustment * 10
      )),
      consciousnessLevel: Math.max(0, Math.min(1,
        latestPoint.consciousnessLevel + trendAdjustment * 0.01
      )),
    };
  }

  /**
   * LSTM model prediction (Long Short-Term Memory neural network)
   */
  private lstmPredict(minutesAhead: number): ForecastPrediction['predicted'] {
    // Simplified LSTM - would use TensorFlow.js in production
    const sequence = this.historicalData.slice(-30);
    
    // Pattern recognition from sequence
    const patterns = this.recognizePatterns(sequence);
    const momentum = this.calculateMomentum(sequence);

    const latestPoint = sequence[sequence.length - 1];
    const decayFactor = Math.exp(-minutesAhead / 60);

    return {
      phiValue: latestPoint.phiValue + momentum.phi * (1 - decayFactor),
      temporalCoherence: latestPoint.temporalCoherence + momentum.coherence * (1 - decayFactor),
      quantumEntanglement: latestPoint.quantumEntanglement + momentum.entanglement * (1 - decayFactor),
      consciousnessLevel: latestPoint.consciousnessLevel + momentum.consciousness * (1 - decayFactor),
    };
  }

  /**
   * Prophet model prediction (Facebook's forecasting tool)
   */
  private prophetPredict(minutesAhead: number): ForecastPrediction['predicted'] {
    // Simplified Prophet implementation
    const data = this.historicalData.slice(-100);
    
    // Decompose into trend, seasonality, and holidays
    const trend = this.calculateNonLinearTrend(data);
    const weekly = this.extractWeeklySeasonality(data);
    const daily = this.extractDailySeasonality(data);

    const latestPoint = data[data.length - 1];
    
    return {
      phiValue: latestPoint.phiValue + trend * minutesAhead / 60 + weekly + daily,
      temporalCoherence: latestPoint.temporalCoherence + trend * 0.001 * minutesAhead,
      quantumEntanglement: latestPoint.quantumEntanglement + trend * 5 * minutesAhead / 60,
      consciousnessLevel: latestPoint.consciousnessLevel + trend * 0.001 * minutesAhead,
    };
  }

  /**
   * Moving average prediction (baseline)
   */
  private movingAveragePredict(): ForecastPrediction['predicted'] {
    const windowSize = Math.min(20, this.historicalData.length);
    const recentData = this.historicalData.slice(-windowSize);

    return {
      phiValue: recentData.reduce((sum, d) => sum + d.phiValue, 0) / windowSize,
      temporalCoherence: recentData.reduce((sum, d) => sum + d.temporalCoherence, 0) / windowSize,
      quantumEntanglement: recentData.reduce((sum, d) => sum + d.quantumEntanglement, 0) / windowSize,
      consciousnessLevel: recentData.reduce((sum, d) => sum + d.consciousnessLevel, 0) / windowSize,
    };
  }

  /**
   * Analyze trends in consciousness data
   */
  async analyzeTrends(windowHours: number = 24): Promise<TrendAnalysis> {
    const windowMs = windowHours * 60 * 60 * 1000;
    const cutoffTime = Date.now() - windowMs;
    const windowData = this.historicalData.filter(d => d.timestamp.getTime() >= cutoffTime);

    if (windowData.length < 10) {
      throw new Error('Insufficient data for trend analysis');
    }

    // Calculate overall trend direction
    const firstHalf = windowData.slice(0, Math.floor(windowData.length / 2));
    const secondHalf = windowData.slice(Math.floor(windowData.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.phiValue, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.phiValue, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    const direction: TrendAnalysis['direction'] = 
      Math.abs(diff) < 0.2 ? 'sideways' :
      diff > 0 ? 'upward' : 'downward';

    const strength = Math.min(1, Math.abs(diff) / 2);

    // Detect seasonality
    const seasonalPattern = this.detectSeasonality(windowData);

    // Find change points
    const changePoints = this.detectChangePoints(windowData);

    return {
      direction,
      strength,
      seasonalPattern,
      changePoints,
    };
  }

  /**
   * Detect anomalies in current consciousness state
   */
  async detectAnomaly(currentState: {
    phiValue: number;
    temporalCoherence: number;
    quantumEntanglement: number;
  }): Promise<AnomalyDetection> {
    if (this.historicalData.length < this.MIN_DATA_POINTS) {
      return {
        isAnomaly: false,
        score: 0,
        expectedRange: { min: 0, max: 10 },
        actualValue: currentState.phiValue,
        deviation: 0,
      };
    }

    // Calculate statistical bounds
    const recentData = this.historicalData.slice(-100);
    const mean = recentData.reduce((sum, d) => sum + d.phiValue, 0) / recentData.length;
    const variance = recentData.reduce((sum, d) => sum + Math.pow(d.phiValue - mean, 2), 0) / recentData.length;
    const stdDev = Math.sqrt(variance);

    // 3-sigma rule for anomaly detection
    const expectedMin = mean - 3 * stdDev;
    const expectedMax = mean + 3 * stdDev;

    const deviation = Math.abs(currentState.phiValue - mean) / stdDev;
    const isAnomaly = deviation > 3;

    let type: AnomalyDetection['type'];
    if (currentState.phiValue > expectedMax) {
      type = 'spike';
    } else if (currentState.phiValue < expectedMin) {
      type = 'drop';
    } else if (deviation > 2) {
      type = 'pattern_break';
    }

    const score = Math.min(1, deviation / 5);

    if (isAnomaly) {
      this.emit('anomaly:detected', {
        currentState,
        type,
        score,
        deviation,
      });
    }

    return {
      isAnomaly,
      score,
      type,
      expectedRange: { min: expectedMin, max: expectedMax },
      actualValue: currentState.phiValue,
      deviation,
    };
  }

  /**
   * Helper methods
   */

  private calculateLinearTrend(data: ConsciousnessDataPoint[]): number {
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, d) => sum + d.phiValue, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.phiValue, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private extractSeasonalComponent(data: ConsciousnessDataPoint[]): number {
    // Simplified seasonal extraction
    return data.reduce((sum, d, i) => sum + Math.sin(i / 12) * 0.1, 0) / data.length;
  }

  private calculateNoiseComponent(data: ConsciousnessDataPoint[]): number {
    const mean = data.reduce((sum, d) => sum + d.phiValue, 0) / data.length;
    const variance = data.reduce((sum, d) => sum + Math.pow(d.phiValue - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  private recognizePatterns(sequence: ConsciousnessDataPoint[]): any {
    // Pattern recognition logic
    return { trending: true, cyclical: false };
  }

  private calculateMomentum(sequence: ConsciousnessDataPoint[]): {
    phi: number;
    coherence: number;
    entanglement: number;
    consciousness: number;
  } {
    if (sequence.length < 2) {
      return { phi: 0, coherence: 0, entanglement: 0, consciousness: 0 };
    }

    const last = sequence[sequence.length - 1];
    const prev = sequence[sequence.length - 2];

    return {
      phi: last.phiValue - prev.phiValue,
      coherence: last.temporalCoherence - prev.temporalCoherence,
      entanglement: last.quantumEntanglement - prev.quantumEntanglement,
      consciousness: last.consciousnessLevel - prev.consciousnessLevel,
    };
  }

  private calculateNonLinearTrend(data: ConsciousnessDataPoint[]): number {
    // Polynomial trend fitting (simplified)
    const linearTrend = this.calculateLinearTrend(data);
    const recentTrend = this.calculateLinearTrend(data.slice(-20));
    return (linearTrend + recentTrend * 2) / 3;
  }

  private extractWeeklySeasonality(data: ConsciousnessDataPoint[]): number {
    // Weekly pattern extraction
    return 0;
  }

  private extractDailySeasonality(data: ConsciousnessDataPoint[]): number {
    const hour = new Date().getHours();
    return Math.sin((hour / 24) * 2 * Math.PI) * 0.2;
  }

  private calculatePredictionVariance(predictions: Array<ForecastPrediction['predicted']>): number {
    const mean = predictions.reduce((sum, p) => sum + p.phiValue, 0) / predictions.length;
    return predictions.reduce((sum, p) => sum + Math.pow(p.phiValue - mean, 2), 0) / predictions.length;
  }

  private getConfidenceMargin(variance: number, confidenceLevel: number): number {
    // Z-score for confidence level
    const zScore = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645;
    return zScore * Math.sqrt(variance);
  }

  private determineTrend(predictedValue: number): 'increasing' | 'decreasing' | 'stable' {
    if (this.historicalData.length === 0) return 'stable';
    
    const recentAvg = this.historicalData.slice(-10).reduce((sum, d) => sum + d.phiValue, 0) / 10;
    const diff = predictedValue - recentAvg;

    return Math.abs(diff) < 0.1 ? 'stable' : diff > 0 ? 'increasing' : 'decreasing';
  }

  private calculateAnomalyScore(predicted: ForecastPrediction['predicted']): number {
    if (this.historicalData.length < 10) return 0;

    const recentData = this.historicalData.slice(-50);
    const mean = recentData.reduce((sum, d) => sum + d.phiValue, 0) / recentData.length;
    const stdDev = Math.sqrt(
      recentData.reduce((sum, d) => sum + Math.pow(d.phiValue - mean, 2), 0) / recentData.length
    );

    const deviation = Math.abs(predicted.phiValue - mean) / stdDev;
    return Math.min(1, deviation / 3);
  }

  private detectSeasonality(data: ConsciousnessDataPoint[]): TrendAnalysis['seasonalPattern'] {
    // Simplified seasonality detection
    // In production, would use FFT or autocorrelation
    return {
      detected: false,
    };
  }

  private detectChangePoints(data: ConsciousnessDataPoint[]): TrendAnalysis['changePoints'] {
    const changePoints: TrendAnalysis['changePoints'] = [];
    const windowSize = 10;

    for (let i = windowSize; i < data.length - windowSize; i++) {
      const before = data.slice(i - windowSize, i);
      const after = data.slice(i, i + windowSize);

      const beforeAvg = before.reduce((sum, d) => sum + d.phiValue, 0) / windowSize;
      const afterAvg = after.reduce((sum, d) => sum + d.phiValue, 0) / windowSize;

      const diff = afterAvg - beforeAvg;

      if (Math.abs(diff) > 0.5) {
        changePoints.push({
          timestamp: data[i].timestamp,
          type: diff > 0 ? 'increase' : 'decrease',
          magnitude: Math.abs(diff),
        });
      }
    }

    return changePoints;
  }

  /**
   * Get forecasting statistics
   */
  getStatistics() {
    return {
      dataPoints: this.historicalData.length,
      timeSpan: this.historicalData.length > 0
        ? {
            start: this.historicalData[0].timestamp,
            end: this.historicalData[this.historicalData.length - 1].timestamp,
          }
        : null,
      currentAverage: this.historicalData.length > 0
        ? {
            phiValue: this.historicalData.reduce((sum, d) => sum + d.phiValue, 0) / this.historicalData.length,
            temporalCoherence: this.historicalData.reduce((sum, d) => sum + d.temporalCoherence, 0) / this.historicalData.length,
          }
        : null,
      modelWeights: this.modelWeights,
    };
  }

  /**
   * Clear historical data
   */
  clearHistory(): void {
    this.historicalData = [];
    this.emit('history:cleared');
  }
}

/**
 * Singleton instance
 */
export const predictiveForecastingEngine = new PredictiveForecastingEngine();
