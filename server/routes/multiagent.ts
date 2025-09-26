import express from 'express';
import { multiAgentService } from '../services/multiAgent';
import { AgentType } from '../services/multiAgent';

const router = express.Router();

// Start multi-agent collaboration
router.post('/start', async (req, res) => {
  try {
    const { projectId, goal } = req.body;
    
    if (!projectId || !goal) {
      return res.status(400).json({ 
        error: 'Project ID and goal are required' 
      });
    }

    // For now, use a mock user ID - in production, get from auth
    const userId = 'user_123';
    
    await multiAgentService.startCollaboration(projectId, userId, goal);
    
    res.json({
      success: true,
      message: 'Multi-agent collaboration started'
    });

  } catch (error) {
    console.error('Multi-agent start error:', error);
    res.status(500).json({ 
      error: 'Failed to start multi-agent collaboration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get collaboration status
router.get('/status', async (req, res) => {
  try {
    const status = await multiAgentService.getStatus();
    const agentStatuses = multiAgentService.getAgentStatuses();
    
    res.json({
      status,
      agentStatuses
    });

  } catch (error) {
    console.error('Multi-agent status error:', error);
    res.status(500).json({ 
      error: 'Failed to get multi-agent status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced Intelligence API Routes

// Initiate code review
router.post('/review', async (req, res) => {
  try {
    const { code, author, taskId } = req.body;
    
    if (!code || !author || !taskId) {
      return res.status(400).json({ 
        error: 'Code, author, and task ID are required' 
      });
    }

    const review = await multiAgentService.initiateCodeReview(code, author as AgentType, taskId);
    
    res.json({
      success: true,
      review
    });

  } catch (error) {
    console.error('Code review error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate code review',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get conflict resolutions
router.get('/conflicts', async (req, res) => {
  try {
    const conflicts = multiAgentService.getConflictResolutions();
    
    res.json({
      conflicts
    });

  } catch (error) {
    console.error('Get conflicts error:', error);
    res.status(500).json({ 
      error: 'Failed to get conflict resolutions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get knowledge insights
router.get('/insights', async (req, res) => {
  try {
    const insights = multiAgentService.getKnowledgeInsights();
    
    res.json({
      insights
    });

  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ 
      error: 'Failed to get knowledge insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Optimize task assignments
router.post('/optimize', async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ 
        error: 'Tasks array is required' 
      });
    }

    const optimizations = await multiAgentService.optimizeTaskAssignments(tasks);
    
    res.json({
      success: true,
      optimizations
    });

  } catch (error) {
    console.error('Task optimization error:', error);
    res.status(500).json({ 
      error: 'Failed to optimize task assignments',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Real-time Collaboration API Routes

// Start code stream
router.post('/stream/start', async (req, res) => {
  try {
    const { sessionId, agents } = req.body;
    
    if (!sessionId || !agents || !Array.isArray(agents)) {
      return res.status(400).json({ 
        error: 'Session ID and agents array are required' 
      });
    }

    const stream = await multiAgentService.startCodeStream(sessionId, agents);
    
    res.json({
      success: true,
      stream
    });

  } catch (error) {
    console.error('Start code stream error:', error);
    res.status(500).json({ 
      error: 'Failed to start code stream',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Apply code operation
router.post('/stream/operation', async (req, res) => {
  try {
    const { streamId, operation } = req.body;
    
    if (!streamId || !operation) {
      return res.status(400).json({ 
        error: 'Stream ID and operation are required' 
      });
    }

    await multiAgentService.applyCodeOperation(streamId, operation);
    
    res.json({
      success: true,
      message: 'Code operation applied'
    });

  } catch (error) {
    console.error('Apply code operation error:', error);
    res.status(500).json({ 
      error: 'Failed to apply code operation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get active streams
router.get('/streams', async (req, res) => {
  try {
    const streams = multiAgentService.getActiveStreams();
    
    res.json({
      streams
    });

  } catch (error) {
    console.error('Get active streams error:', error);
    res.status(500).json({ 
      error: 'Failed to get active streams',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// End code stream
router.post('/stream/end', async (req, res) => {
  try {
    const { streamId } = req.body;
    
    if (!streamId) {
      return res.status(400).json({ 
        error: 'Stream ID is required' 
      });
    }

    await multiAgentService.endCodeStream(streamId);
    
    res.json({
      success: true,
      message: 'Code stream ended'
    });

  } catch (error) {
    console.error('End code stream error:', error);
    res.status(500).json({ 
      error: 'Failed to end code stream',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Note: WebSocket connections for agents are handled in the main WebSocket server
// Agents can connect via /ws with agent_type in the connection message

export default router;
