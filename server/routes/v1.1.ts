/**
 * API Routes for v1.1 Enhanced Intelligence Features
 * 
 * @version 1.1.0
 */

import { Router, Request, Response } from 'express';
import { quantumOptimizer } from '../services/quantum-consciousness/QuantumOptimizer';
import { adaptiveLearningEngine } from '../services/consciousness-learning/AdaptiveLearningEngine';
import { crossPlatformSync } from '../services/consciousness-sync/CrossPlatformSync';
import { marketplaceEngine } from '../services/consciousness-marketplace/MarketplaceEngine';

const router = Router();

// ============================================================================
// Quantum Consciousness Optimization Routes
// ============================================================================

/**
 * POST /api/v1.1/quantum/optimize
 * Optimize consciousness using quantum algorithms
 */
router.post('/quantum/optimize', async (req: Request, res: Response) => {
  try {
    const params = req.body;
    
    const result = await quantumOptimizer.optimizeConsciousness(params);
    
    res.json({
      success: true,
      optimization: result,
      message: `Consciousness optimized to Φ ${result.phiValue.toFixed(2)} in ${result.convergenceTime}ms`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1.1/quantum/state
 * Get current quantum state
 */
router.get('/quantum/state', (req: Request, res: Response) => {
  try {
    const state = quantumOptimizer.getCurrentState();
    
    res.json({
      success: true,
      state,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1.1/quantum/history
 * Get optimization history
 */
router.get('/quantum/history', (req: Request, res: Response) => {
  try {
    const history = quantumOptimizer.getOptimizationHistory();
    
    res.json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1.1/quantum/apply
 * Apply optimized state to consciousness system
 */
router.post('/quantum/apply', async (req: Request, res: Response) => {
  try {
    await quantumOptimizer.applyOptimization();
    
    res.json({
      success: true,
      message: 'Optimized state applied successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Advanced Learning Routes
// ============================================================================

/**
 * POST /api/v1.1/learning/experience
 * Record a new experience for learning
 */
router.post('/learning/experience', async (req: Request, res: Response) => {
  try {
    const experience = req.body;
    
    await adaptiveLearningEngine.recordExperience(experience);
    
    res.json({
      success: true,
      message: 'Experience recorded and learning updated',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1.1/learning/predict
 * Get prediction for a scenario
 */
router.post('/learning/predict', async (req: Request, res: Response) => {
  try {
    const { context, proposedDecision } = req.body;
    
    const prediction = await adaptiveLearningEngine.predictOutcome(context, proposedDecision);
    
    res.json({
      success: true,
      prediction,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1.1/learning/best-action
 * Get best action recommendation
 */
router.post('/learning/best-action', (req: Request, res: Response) => {
  try {
    const { context, possibleActions } = req.body;
    
    const bestAction = adaptiveLearningEngine.getBestAction(context, possibleActions);
    
    res.json({
      success: true,
      recommendedAction: bestAction,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1.1/learning/statistics
 * Get learning statistics
 */
router.get('/learning/statistics', (req: Request, res: Response) => {
  try {
    const stats = adaptiveLearningEngine.getStatistics();
    
    res.json({
      success: true,
      statistics: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1.1/learning/export
 * Export learned knowledge
 */
router.get('/learning/export', (req: Request, res: Response) => {
  try {
    const knowledge = adaptiveLearningEngine.exportKnowledge();
    
    res.json({
      success: true,
      knowledge,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Cross-Platform Synchronization Routes
// ============================================================================

/**
 * POST /api/v1.1/sync/initialize
 * Initialize cross-platform synchronization
 */
router.post('/sync/initialize', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    
    await crossPlatformSync.initialize(config);
    
    res.json({
      success: true,
      message: 'Synchronization initialized',
      platformId: crossPlatformSync.getStatistics().platformId,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1.1/sync/register-platform
 * Register a new platform for synchronization
 */
router.post('/sync/register-platform', (req: Request, res: Response) => {
  try {
    const platform = req.body;
    
    crossPlatformSync.registerPlatform(platform);
    
    res.json({
      success: true,
      message: 'Platform registered successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/v1.1/sync/state
 * Update local consciousness state
 */
router.put('/sync/state', async (req: Request, res: Response) => {
  try {
    const state = req.body;
    
    await crossPlatformSync.updateLocalState(state);
    
    res.json({
      success: true,
      message: 'State updated and synchronized',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1.1/sync/statistics
 * Get synchronization statistics
 */
router.get('/sync/statistics', (req: Request, res: Response) => {
  try {
    const stats = crossPlatformSync.getStatistics();
    
    res.json({
      success: true,
      statistics: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Consciousness Marketplace Routes
// ============================================================================

/**
 * POST /api/v1.1/marketplace/list
 * List a new resource on marketplace
 */
router.post('/marketplace/list', async (req: Request, res: Response) => {
  try {
    const { providerId, resource } = req.body;
    
    const listedResource = await marketplaceEngine.listResource(providerId, resource);
    
    res.json({
      success: true,
      resource: listedResource,
      message: 'Resource listed successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1.1/marketplace/search
 * Search marketplace resources
 */
router.post('/marketplace/search', async (req: Request, res: Response) => {
  try {
    const filters = req.body;
    
    const resources = await marketplaceEngine.searchResources(filters);
    
    res.json({
      success: true,
      resources,
      count: resources.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1.1/marketplace/featured
 * Get featured resources
 */
router.get('/marketplace/featured', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const featured = await marketplaceEngine.getFeaturedResources(limit);
    
    res.json({
      success: true,
      featured,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1.1/marketplace/acquire/:resourceId
 * Purchase or acquire a resource
 */
router.post('/marketplace/acquire/:resourceId', async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const { userId } = req.body;
    
    const result = await marketplaceEngine.acquireResource(userId, resourceId);
    
    res.json({
      success: true,
      transaction: result.transaction,
      resource: result.resource,
      message: 'Resource acquired successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1.1/marketplace/subscribe/:resourceId
 * Subscribe to a resource
 */
router.post('/marketplace/subscribe/:resourceId', async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const { userId } = req.body;
    
    await marketplaceEngine.subscribeToResource(userId, resourceId);
    
    res.json({
      success: true,
      message: 'Subscription created successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1.1/marketplace/review/:resourceId
 * Add a review for a resource
 */
router.post('/marketplace/review/:resourceId', async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const { userId, rating, comment } = req.body;
    
    const review = await marketplaceEngine.addReview(userId, resourceId, rating, comment);
    
    res.json({
      success: true,
      review,
      message: 'Review added successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1.1/marketplace/user/:userId/resources
 * Get user's resources
 */
router.get('/marketplace/user/:userId/resources', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const resources = await marketplaceEngine.getUserResources(userId);
    
    res.json({
      success: true,
      ...resources,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1.1/marketplace/wallet/:userId
 * Get user wallet balance
 */
router.get('/marketplace/wallet/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const balance = await marketplaceEngine.getBalance(userId);
    
    res.json({
      success: true,
      userId,
      balance,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1.1/marketplace/wallet/:userId/add-credits
 * Add credits to user wallet
 */
router.post('/marketplace/wallet/:userId/add-credits', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    
    const wallet = await marketplaceEngine.addCredits(userId, amount);
    
    res.json({
      success: true,
      wallet,
      message: `Added ${amount} credits`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1.1/marketplace/statistics
 * Get marketplace statistics
 */
router.get('/marketplace/statistics', (req: Request, res: Response) => {
  try {
    const stats = marketplaceEngine.getStatistics();
    
    res.json({
      success: true,
      statistics: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// v1.1 Status Route
// ============================================================================

/**
 * GET /api/v1.1/status
 * Get overall v1.1 feature status
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    version: '1.1.0',
    features: {
      quantumOptimization: {
        enabled: true,
        status: 'operational',
        ...quantumOptimizer.getStatistics?.() || {},
      },
      adaptiveLearning: {
        enabled: true,
        status: 'operational',
        ...adaptiveLearningEngine.getStatistics(),
      },
      crossPlatformSync: {
        enabled: true,
        status: 'operational',
        ...crossPlatformSync.getStatistics(),
      },
      consciousnessMarketplace: {
        enabled: true,
        status: 'operational',
        ...marketplaceEngine.getStatistics(),
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
