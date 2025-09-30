import express from 'express';
import { unifiedIntelligenceSystem } from '../services/intelligence/index';

const router = express.Router();

/**
 * Unified Intelligence System API Routes
 * Provides access to all revolutionary intelligence systems
 */

// Start a unified development session
router.post('/session/start', async (req, res) => {
  try {
    const { type, goal, userId, code, context, ...rest } = req.body;

    if (!type || !goal || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, goal, userId' 
      });
    }

    const session = await unifiedIntelligenceSystem.startUnifiedSession({
      type,
      goal,
      userId,
      code,
      context,
      ...rest
    });

    res.json(session);
  } catch (error: any) {
    console.error('Error starting unified session:', error);
    res.status(500).json({ 
      error: 'Failed to start session', 
      message: error.message 
    });
  }
});

// Get system statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = unifiedIntelligenceSystem.getSystemStatistics();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics', 
      message: error.message 
    });
  }
});

// Get unified recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { context } = req.body;
    const recommendations = await unifiedIntelligenceSystem.getUnifiedRecommendations(context || {});
    res.json(recommendations);
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendations', 
      message: error.message 
    });
  }
});

// Code Learning Engine endpoints
router.post('/learning/analyze', async (req, res) => {
  try {
    const { codebaseId, files } = req.body;

    if (!codebaseId || !files) {
      return res.status(400).json({ 
        error: 'Missing required fields: codebaseId, files' 
      });
    }

    const learningEngine = (unifiedIntelligenceSystem as any).codeLearningEngine;
    const report = await learningEngine.learnFromCodebase({ codebaseId, files });
    
    res.json(report);
  } catch (error: any) {
    console.error('Error in learning analysis:', error);
    res.status(500).json({ 
      error: 'Failed to analyze codebase', 
      message: error.message 
    });
  }
});

router.get('/learning/statistics', async (req, res) => {
  try {
    const learningEngine = (unifiedIntelligenceSystem as any).codeLearningEngine;
    const stats = learningEngine.getStatistics();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting learning statistics:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics', 
      message: error.message 
    });
  }
});

router.post('/learning/recommendations', async (req, res) => {
  try {
    const { context } = req.body;
    const learningEngine = (unifiedIntelligenceSystem as any).codeLearningEngine;
    const recommendations = await learningEngine.getRecommendations(context || {});
    res.json(recommendations);
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendations', 
      message: error.message 
    });
  }
});

// Consciousness Code Review endpoints
router.post('/review/code', async (req, res) => {
  try {
    const { code, context, author, framework } = req.body;

    if (!code || !author) {
      return res.status(400).json({ 
        error: 'Missing required fields: code, author' 
      });
    }

    const reviewer = (unifiedIntelligenceSystem as any).consciousnessReviewer;
    const review = await reviewer.reviewCode({
      code,
      context: context || {},
      author,
      framework
    });
    
    res.json(review);
  } catch (error: any) {
    console.error('Error in code review:', error);
    res.status(500).json({ 
      error: 'Failed to review code', 
      message: error.message 
    });
  }
});

// Creativity Bridge endpoints
router.post('/collaborate/message', async (req, res) => {
  try {
    const { sessionId, userId, message, code, context } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, message' 
      });
    }

    const bridge = (unifiedIntelligenceSystem as any).creativityBridge;
    const response = await bridge.processRequest({
      sessionId,
      userId,
      message,
      code,
      context
    });
    
    res.json(response);
  } catch (error: any) {
    console.error('Error in collaboration:', error);
    res.status(500).json({ 
      error: 'Failed to process message', 
      message: error.message 
    });
  }
});

router.post('/collaborate/feedback', async (req, res) => {
  try {
    const { sessionId, feedback } = req.body;

    if (!sessionId || !feedback) {
      return res.status(400).json({ 
        error: 'Missing required fields: sessionId, feedback' 
      });
    }

    const bridge = (unifiedIntelligenceSystem as any).creativityBridge;
    await bridge.provideFeedback(sessionId, feedback);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error providing feedback:', error);
    res.status(500).json({ 
      error: 'Failed to provide feedback', 
      message: error.message 
    });
  }
});

// Temporal Debugger endpoints
router.post('/debug/start', async (req, res) => {
  try {
    const { error, context, stackTrace, timestamp, logs, stateHistory } = req.body;

    if (!error) {
      return res.status(400).json({ 
        error: 'Missing required field: error' 
      });
    }

    const temporalDebugger = (unifiedIntelligenceSystem as any).temporalDebugger;
    const session = await temporalDebugger.startDebugSession({
      error,
      context: context || 'Unknown',
      stackTrace,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      logs,
      stateHistory
    });
    
    res.json(session);
  } catch (error: any) {
    console.error('Error in debugging:', error);
    res.status(500).json({ 
      error: 'Failed to start debug session', 
      message: error.message 
    });
  }
});

// Activist Tech Lab endpoints
router.post('/activist/build', async (req, res) => {
  try {
    const { 
      toolName, 
      purpose, 
      targetPlatform, 
      features, 
      activistNeeds, 
      constraints,
      ethicalConsiderations,
      architecture
    } = req.body;

    if (!toolName || !purpose) {
      return res.status(400).json({ 
        error: 'Missing required fields: toolName, purpose' 
      });
    }

    const lab = (unifiedIntelligenceSystem as any).activistTechLab;
    const project = await lab.buildActivistTool({
      toolName,
      purpose,
      targetPlatform: targetPlatform || 'web',
      features: features || [],
      activistNeeds: activistNeeds || [],
      constraints,
      ethicalConsiderations,
      architecture
    });
    
    res.json(project);
  } catch (error: any) {
    console.error('Error building activist tool:', error);
    res.status(500).json({ 
      error: 'Failed to build activist tool', 
      message: error.message 
    });
  }
});

router.post('/activist/verify/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ 
        error: 'Missing projectId' 
      });
    }

    const lab = (unifiedIntelligenceSystem as any).activistTechLab;
    const verification = await lab.verifyActivistTool(projectId);
    
    res.json(verification);
  } catch (error: any) {
    console.error('Error verifying activist tool:', error);
    res.status(500).json({ 
      error: 'Failed to verify activist tool', 
      message: error.message 
    });
  }
});

router.get('/activist/recommendations/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ 
        error: 'Missing projectId' 
      });
    }

    const lab = (unifiedIntelligenceSystem as any).activistTechLab;
    const recommendations = await lab.getActivistToolRecommendations(projectId);
    
    res.json({ recommendations });
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendations', 
      message: error.message 
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'operational',
    message: 'Unified Intelligence System is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
