/**
 * Activism Integration Routes
 * 
 * API routes exposing Pitchfork features in SpaceChild
 * 
 * @version 1.0.0
 */

import { Router, Request, Response } from 'express';
import { codeCorruptionDetector } from '../services/activism/CodeCorruptionDetector';
import { strategicDevPlanner } from '../services/activism/StrategicDevPlanner';

const router = Router();

// ============================================================================
// Code Corruption Detection Routes
// ============================================================================

/**
 * POST /api/activism/code/analyze
 * Analyze code for corruption/vulnerabilities
 */
router.post('/code/analyze', async (req: Request, res: Response) => {
  try {
    const { fileId, code, language = 'typescript' } = req.body;
    
    const analysis = await codeCorruptionDetector.analyzeCode(fileId, code, language);
    
    res.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/activism/code/statistics
 * Get code analysis statistics
 */
router.get('/code/statistics', (req: Request, res: Response) => {
  try {
    const stats = codeCorruptionDetector.getStatistics();
    
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
// Strategic Development Planning Routes
// ============================================================================

/**
 * POST /api/activism/strategy/generate
 * Generate development strategy
 */
router.post('/strategy/generate', async (req: Request, res: Response) => {
  try {
    const { projectId, objective, constraints = {} } = req.body;
    
    const strategy = await strategicDevPlanner.generateStrategy(
      projectId,
      objective,
      constraints
    );
    
    res.json({
      success: true,
      strategy,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/activism/strategy/statistics
 * Get strategy planning statistics
 */
router.get('/strategy/statistics', (req: Request, res: Response) => {
  try {
    const stats = strategicDevPlanner.getStatistics();
    
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
 * GET /api/activism/status
 * Get overall Pitchfork integration status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const stats = {
      codeCorruption: codeCorruptionDetector.getStatistics(),
      strategicPlanning: strategicDevPlanner.getStatistics(),
    };
    
    res.json({
      success: true,
      integration: 'Pitchfork Protocol Features',
      status: 'operational',
      statistics: stats,
      capabilities: [
        'Code corruption detection',
        'Strategic development planning',
        'Security vulnerability scanning',
        'AI-powered architecture recommendations',
      ],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
