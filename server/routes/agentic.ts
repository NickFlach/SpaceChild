import express from 'express';
import { zkpAuthenticated } from '../services/zkpAuth';
import { agenticOrchestrationService } from '../services/agentic/orchestrationService';
import { promptChainingService } from '../services/agentic/promptChaining';
import { routingEngineService } from '../services/agentic/routingEngine';
import { reflectionSystemService } from '../services/agentic/reflectionSystem';
import { planningSystemService } from '../services/agentic/planningSystem';
import { storage } from '../storage';

const router = express.Router();

// Main agentic processing endpoint
router.post('/process', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const {
      request,
      projectId,
      context = {}
    } = req.body;

    if (!request || typeof request !== 'string') {
      return res.status(400).json({ 
        error: 'Request text is required' 
      });
    }

    // Validate project access if projectId provided
    if (projectId) {
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: 'Access denied to project' });
      }
    }

    const agenticRequest = {
      userId,
      projectId,
      request,
      context,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent']
      }
    };

    const response = await agenticOrchestrationService.processRequest(agenticRequest);
    
    // Track usage for billing
    if (response.total_tokens_used > 0) {
      await storage.createAiProviderUsage({
        userId,
        provider: response.providers_used[0] || 'agentic-system',
        serviceType: 'agentic_processing',
        tokensUsed: response.total_tokens_used,
        costUsd: response.total_cost
      });
    }

    res.json({
      success: true,
      response
    });

  } catch (error) {
    console.error('Agentic processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process agentic request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Prompt chaining endpoints
router.post('/chain/execute', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const {
      chainId,
      initialInput,
      projectId
    } = req.body;

    if (!chainId || !initialInput) {
      return res.status(400).json({ 
        error: 'Chain ID and initial input are required' 
      });
    }

    const execution = await promptChainingService.executeChain(
      chainId,
      initialInput,
      userId,
      projectId
    );

    res.json({
      success: true,
      execution
    });

  } catch (error) {
    console.error('Chain execution error:', error);
    res.status(500).json({ 
      error: 'Failed to execute chain',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/chain/status/:executionId', zkpAuthenticated, async (req: any, res) => {
  try {
    const executionId = req.params.executionId;
    const status = promptChainingService.getChainStatus(executionId);

    if (!status) {
      return res.status(404).json({ error: 'Chain execution not found' });
    }

    // Verify user owns this execution
    if (status.userId !== req.user.claims.sub) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(status);

  } catch (error) {
    console.error('Chain status error:', error);
    res.status(500).json({ error: 'Failed to get chain status' });
  }
});

router.get('/chain/available', zkpAuthenticated, async (req: any, res) => {
  try {
    const chains = promptChainingService.getAvailableChains();
    res.json(chains);
  } catch (error) {
    console.error('Get chains error:', error);
    res.status(500).json({ error: 'Failed to get available chains' });
  }
});

// Routing engine endpoints
router.post('/routing/suggest', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const {
      taskDescription,
      taskCharacteristics,
      constraints = {}
    } = req.body;

    if (!taskDescription || !taskCharacteristics) {
      return res.status(400).json({ 
        error: 'Task description and characteristics are required' 
      });
    }

    // Get user context
    const user = await storage.getUser(userId);
    const userContext = {
      userId,
      subscriptionTier: user?.subscriptionTier || 'free',
      remainingCredits: (user?.monthlyCredits || 100) - (user?.usedCredits || 0),
      usageHistory: [],
      preferences: {}
    };

    const decision = await routingEngineService.routeTask(
      taskDescription,
      taskCharacteristics,
      userContext,
      constraints
    );

    res.json({
      success: true,
      decision
    });

  } catch (error) {
    console.error('Routing suggestion error:', error);
    res.status(500).json({ 
      error: 'Failed to suggest routing',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/routing/providers', zkpAuthenticated, async (req: any, res) => {
  try {
    const providers = routingEngineService.getProviderCapabilities();
    res.json(providers);
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Failed to get provider capabilities' });
  }
});

router.get('/routing/rules', zkpAuthenticated, async (req: any, res) => {
  try {
    const rules = routingEngineService.getRoutingRules();
    res.json(rules);
  } catch (error) {
    console.error('Get routing rules error:', error);
    res.status(500).json({ error: 'Failed to get routing rules' });
  }
});

router.get('/routing/stats', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const stats = await routingEngineService.getRoutingStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Get routing stats error:', error);
    res.status(500).json({ error: 'Failed to get routing stats' });
  }
});

// Reflection system endpoints
router.post('/reflection/start', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const {
      context,
      projectId,
      options = {}
    } = req.body;

    if (!context || !context.original_task || !context.initial_output) {
      return res.status(400).json({ 
        error: 'Context with original_task and initial_output is required' 
      });
    }

    const session = await reflectionSystemService.startReflection(
      context,
      userId,
      projectId,
      options
    );

    res.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Reflection start error:', error);
    res.status(500).json({ 
      error: 'Failed to start reflection',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/reflection/quick', zkpAuthenticated, async (req: any, res) => {
  try {
    const {
      output,
      outputType,
      task,
      provider = 'anthropic'
    } = req.body;

    if (!output || !outputType || !task) {
      return res.status(400).json({ 
        error: 'Output, output type, and task are required' 
      });
    }

    const reflection = await reflectionSystemService.quickReflect(
      output,
      outputType,
      task,
      provider
    );

    res.json({
      success: true,
      reflection
    });

  } catch (error) {
    console.error('Quick reflection error:', error);
    res.status(500).json({ 
      error: 'Failed to perform quick reflection',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/reflection/revise', zkpAuthenticated, async (req: any, res) => {
  try {
    const {
      output,
      outputType,
      task,
      reflectorProvider = 'anthropic',
      revisorProvider = 'spaceagent'
    } = req.body;

    if (!output || !outputType || !task) {
      return res.status(400).json({ 
        error: 'Output, output type, and task are required' 
      });
    }

    const result = await reflectionSystemService.reflectAndRevise(
      output,
      outputType,
      task,
      reflectorProvider,
      revisorProvider
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Reflect and revise error:', error);
    res.status(500).json({ 
      error: 'Failed to reflect and revise',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/reflection/session/:sessionId', zkpAuthenticated, async (req: any, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = reflectionSystemService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Reflection session not found' });
    }

    // Verify user owns this session
    if (session.userId !== req.user.claims.sub) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(session);

  } catch (error) {
    console.error('Get reflection session error:', error);
    res.status(500).json({ error: 'Failed to get reflection session' });
  }
});

router.get('/reflection/criteria', zkpAuthenticated, async (req: any, res) => {
  try {
    const criteria = reflectionSystemService.getAvailableCriteria();
    res.json(criteria);
  } catch (error) {
    console.error('Get reflection criteria error:', error);
    res.status(500).json({ error: 'Failed to get reflection criteria' });
  }
});

router.get('/reflection/stats', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const stats = await reflectionSystemService.getReflectionStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Get reflection stats error:', error);
    res.status(500).json({ error: 'Failed to get reflection stats' });
  }
});

// Planning system endpoints
router.post('/planning/decompose', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const {
      original_request,
      context = {}
    } = req.body;

    if (!original_request) {
      return res.status(400).json({ 
        error: 'Original request is required' 
      });
    }

    const planningContext = {
      userId,
      domain: context.domain || 'general',
      constraints: context.constraints || {},
      user_preferences: context.user_preferences || {},
      projectId: context.projectId,
      project_context: context.project_context
    };

    const decompositionRequest = {
      original_request,
      context: planningContext,
      max_complexity: context.max_complexity,
      focus_areas: context.focus_areas,
      exclude_areas: context.exclude_areas
    };

    const plan = await planningSystemService.decomposeGoal(decompositionRequest);

    res.json({
      success: true,
      plan
    });

  } catch (error) {
    console.error('Planning decomposition error:', error);
    res.status(500).json({ 
      error: 'Failed to decompose goal',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/planning/execute/:planId', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const planId = req.params.planId;

    const plan = planningSystemService.getPlan(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Verify user owns this plan
    if (plan.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await planningSystemService.executePlan(planId);

    res.json({
      success: true,
      message: 'Plan execution started'
    });

  } catch (error) {
    console.error('Plan execution error:', error);
    res.status(500).json({ 
      error: 'Failed to execute plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/planning/plan/:planId', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const planId = req.params.planId;

    const plan = planningSystemService.getPlan(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Verify user owns this plan
    if (plan.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(plan);

  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ error: 'Failed to get plan' });
  }
});

router.get('/planning/plans', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const plans = await planningSystemService.getUserPlans(userId);
    res.json(plans);
  } catch (error) {
    console.error('Get user plans error:', error);
    res.status(500).json({ error: 'Failed to get user plans' });
  }
});

router.put('/planning/task/:planId/:taskId/status', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const planId = req.params.planId;
    const taskId = req.params.taskId;
    const { status } = req.body;

    const plan = planningSystemService.getPlan(planId);
    if (!plan || plan.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await planningSystemService.updateTaskStatus(planId, taskId, status);

    res.json({
      success: true,
      message: 'Task status updated'
    });

  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ 
      error: 'Failed to update task status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/planning/stats', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const stats = await planningSystemService.getPlanningStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Get planning stats error:', error);
    res.status(500).json({ error: 'Failed to get planning stats' });
  }
});

// Session management endpoints
router.get('/session/:sessionId', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const sessionId = req.params.sessionId;

    const session = agenticOrchestrationService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify user owns this session
    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(session);

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

router.get('/sessions', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const sessions = await agenticOrchestrationService.getUserSessions(userId);
    res.json(sessions);
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({ error: 'Failed to get user sessions' });
  }
});

// Statistics and analytics
router.get('/stats', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const stats = await agenticOrchestrationService.getAgenticStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Get agentic stats error:', error);
    res.status(500).json({ error: 'Failed to get agentic stats' });
  }
});

export default router;