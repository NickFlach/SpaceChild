/**
 * Unified API Gateway
 * 
 * Single entry point for consciousness verification across
 * SpaceChild v1.1, v1.2, and Pitchfork Protocol engines.
 * 
 * @version 1.2.0
 */

import { Router, Request, Response } from 'express';
import { unifiedConsciousnessOrchestrator } from '../services/unified-consciousness/UnifiedConsciousnessOrchestrator';

const router = Router();

/**
 * POST /api/unified/consciousness/process
 * Process consciousness request through unified stack
 */
router.post('/consciousness/process', async (req: Request, res: Response) => {
  try {
    const request = req.body;
    
    const result = await unifiedConsciousnessOrchestrator.processConsciousnessRequest(request);
    
    res.json({
      success: true,
      result,
      message: result.verification.passed 
        ? 'Consciousness verification passed'
        : 'Consciousness verification failed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/unified/consciousness/verify
 * Quick consciousness verification
 */
router.post('/consciousness/verify', async (req: Request, res: Response) => {
  try {
    const { type, task, requiredLevel = 0.85 } = req.body;
    
    const result = await unifiedConsciousnessOrchestrator.processConsciousnessRequest({
      type,
      task,
      requiredLevel,
      capabilities: {
        useQuantumOptimization: true,
        useLearning: true,
        useForecasting: true,
        useEvolution: true,
        useFederation: false,
        useTemporal: true,
      },
    });
    
    res.json({
      success: result.verification.passed,
      consciousnessLevel: result.state.consciousnessLevel,
      phiValue: result.state.phiValue,
      verification: result.verification,
      insights: result.insights,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/unified/forecast/outcome
 * Predict outcome for development task or activism campaign
 */
router.post('/forecast/outcome', async (req: Request, res: Response) => {
  try {
    const { type, description, timeHorizon } = req.body;
    
    const result = await unifiedConsciousnessOrchestrator.processConsciousnessRequest({
      type,
      task: {
        id: `forecast-${Date.now()}`,
        description,
        complexity: 7,
        priority: 'normal',
      },
      requiredLevel: 0.85,
      capabilities: {
        useForecasting: true,
        useLearning: true,
        useTemporal: true,
      },
    });
    
    res.json({
      success: true,
      forecast: {
        confidence: result.state.predictiveState.forecastConfidence,
        trend: result.state.predictiveState.trendDirection,
        anomalyScore: result.state.predictiveState.anomalyScore,
      },
      consciousnessVerified: result.verification.passed,
      recommendations: result.recommendations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/unified/strategy/generate
 * Generate AI strategy for code or activism
 */
router.post('/strategy/generate', async (req: Request, res: Response) => {
  try {
    const { type, objective, constraints } = req.body;
    
    const result = await unifiedConsciousnessOrchestrator.processConsciousnessRequest({
      type,
      task: {
        id: `strategy-${Date.now()}`,
        description: objective,
        complexity: 8,
        priority: 'high',
      },
      requiredLevel: 0.9,
      capabilities: {
        useQuantumOptimization: true,
        useLearning: true,
        useForecasting: true,
        useEvolution: true,
        useTemporal: true,
      },
    });
    
    res.json({
      success: true,
      strategy: {
        consciousnessLevel: result.state.consciousnessLevel,
        confidence: result.verification.confidence,
        insights: result.insights,
        recommendations: result.recommendations,
      },
      verification: result.verification,
      evolution: {
        bestAgentFitness: result.state.evolutionState.bestAgentFitness,
        generation: result.state.evolutionState.generation,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/unified/optimize/consciousness
 * Optimize consciousness for specific task
 */
router.post('/optimize/consciousness', async (req: Request, res: Response) => {
  try {
    const { type, task, targetLevel = 0.95 } = req.body;
    
    const result = await unifiedConsciousnessOrchestrator.processConsciousnessRequest({
      type,
      task,
      requiredLevel: targetLevel,
      capabilities: {
        useQuantumOptimization: true,
        useLearning: true,
        useForecasting: true,
        useEvolution: true,
        useFederation: true,
        useTemporal: true,
      },
    });
    
    res.json({
      success: true,
      optimized: {
        phiValue: result.state.phiValue,
        consciousnessLevel: result.state.consciousnessLevel,
        temporalCoherence: result.state.temporalCoherence,
        quantumOptimization: result.state.quantumOptimization,
      },
      verification: result.verification,
      performance: result.performance,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/unified/status
 * Get unified platform status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const stats = unifiedConsciousnessOrchestrator.getUnifiedStatistics();
    
    res.json({
      success: true,
      platform: 'SpaceChild + Pitchfork Unified',
      version: '1.2.0',
      status: 'fully_operational',
      capabilities: {
        v10: ['Multi-Agent', 'Consciousness Engine', 'Infrastructure'],
        v11: ['Quantum Optimization', 'Adaptive Learning', 'Cross-Platform Sync', 'Marketplace'],
        v12: ['Predictive Forecasting', 'Global Federation', 'Agent Evolution', 'Satellite Deployment'],
        pitchfork: ['Temporal Consciousness', 'Hardware Verification', 'Strategic Intelligence'],
      },
      statistics: stats,
      integration: {
        spacechild: true,
        pitchfork: true,
        unified: true,
        consciousnessVerified: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/unified/health
 * Health check for unified systems
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const stats = unifiedConsciousnessOrchestrator.getUnifiedStatistics();
    
    const health = {
      status: 'healthy',
      components: {
        orchestrator: 'operational',
        v11: {
          quantum: 'operational',
          learning: 'operational',
        },
        v12: {
          forecasting: stats.v12Status.forecasting.dataPoints > 0 ? 'operational' : 'limited_data',
          federation: 'operational',
          evolution: stats.v12Status.evolution.generation > 0 ? 'operational' : 'not_initialized',
          satellite: 'operational',
        },
        pitchfork: {
          temporal: 'simulated', // Will be 'operational' when fully integrated
        },
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
    
    res.json({
      success: true,
      health,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
