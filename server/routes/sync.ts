/**
 * Bidirectional Sync Routes
 * 
 * API routes for managing consciousness synchronization
 * 
 * @version 1.0.0
 */

import { Router, Request, Response } from 'express';
import { bidirectionalConsciousnessSync } from '../services/sync/BidirectionalConsciousnessSync';

const router = Router();

/**
 * POST /api/sync/start
 * Start consciousness synchronization
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    
    if (endpoint) {
      // Update endpoint before starting
      (bidirectionalConsciousnessSync as any).config.endpoint = endpoint;
    }
    
    await bidirectionalConsciousnessSync.start();
    
    res.json({
      success: true,
      message: 'Consciousness sync started',
      status: bidirectionalConsciousnessSync.getStatus(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/sync/stop
 * Stop consciousness synchronization
 */
router.post('/stop', (req: Request, res: Response) => {
  try {
    bidirectionalConsciousnessSync.stop();
    
    res.json({
      success: true,
      message: 'Consciousness sync stopped',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/sync/update
 * Update local consciousness state
 */
router.post('/update', (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    bidirectionalConsciousnessSync.updateLocalState(updates);
    
    res.json({
      success: true,
      message: 'State updated and synced',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/sync/event
 * Send sync event
 */
router.post('/event', (req: Request, res: Response) => {
  try {
    const { eventType, eventData } = req.body;
    
    bidirectionalConsciousnessSync.sendEvent(eventType, eventData);
    
    res.json({
      success: true,
      message: 'Event sent',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sync/status
 * Get sync status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = bidirectionalConsciousnessSync.getStatus();
    
    res.json({
      success: true,
      status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sync/state/local
 * Get local state
 */
router.get('/state/local', (req: Request, res: Response) => {
  try {
    const state = bidirectionalConsciousnessSync.getAllLocalState();
    
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
 * GET /api/sync/state/remote
 * Get remote state
 */
router.get('/state/remote', (req: Request, res: Response) => {
  try {
    const state = bidirectionalConsciousnessSync.getAllRemoteState();
    
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
 * GET /api/sync/statistics
 * Get sync statistics
 */
router.get('/statistics', (req: Request, res: Response) => {
  try {
    const statistics = bidirectionalConsciousnessSync.getStatistics();
    
    res.json({
      success: true,
      statistics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
