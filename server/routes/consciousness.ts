import { Router } from "express";
import { GeometricConsciousnessEngine } from "../services/geometricConsciousness";
import { GeometricAICoordinator } from "../services/geometricAICoordinator";
import { GeometricServiceCoordinator } from "../services/geometricServiceCoordinator";
import { EnhancedConsciousnessEngine } from "../services/consciousnessEnhanced";
import { UnifiedConsciousnessIntegration } from "../services/consciousness/UnifiedConsciousnessIntegration";
import { zkpAuthenticated } from "../services/zkpAuth";

const router = Router();

// Store active consciousness instances per session
const consciousnessInstances = new Map<string, {
  engine: GeometricConsciousnessEngine;
  aiCoordinator: GeometricAICoordinator;
  serviceCoordinator: GeometricServiceCoordinator;
}>();

// Store enhanced consciousness instances per session
const enhancedConsciousnessInstances = new Map<string, EnhancedConsciousnessEngine>();

/**
 * Get or create consciousness instance for a session
 */
function getConsciousnessInstance(userId: string, projectId: number, sessionId: string) {
  const key = `${userId}-${projectId}-${sessionId}`;
  
  if (!consciousnessInstances.has(key)) {
    const context = { userId, projectId, sessionId };
    const engine = new GeometricConsciousnessEngine(context);
    const aiCoordinator = new GeometricAICoordinator(context);
    const serviceCoordinator = new GeometricServiceCoordinator(context);
    
    consciousnessInstances.set(key, {
      engine,
      aiCoordinator,
      serviceCoordinator
    });
    
    // Initialize all components
    Promise.all([
      engine.initialize(),
      aiCoordinator.initialize(),
      serviceCoordinator.initialize()
    ]).catch(console.error);
  }
  
  return consciousnessInstances.get(key)!;
}

/**
 * Get or create enhanced consciousness instance for a session
 */
function getEnhancedConsciousnessInstance(userId: string, projectId: number, sessionId: string): EnhancedConsciousnessEngine {
  const key = `${userId}-${projectId}-${sessionId}`;
  
  if (!enhancedConsciousnessInstances.has(key)) {
    const context = { userId, projectId, sessionId, timestamp: new Date() };
    const engine = new EnhancedConsciousnessEngine(context);
    
    enhancedConsciousnessInstances.set(key, engine);
    
    // Initialize enhanced consciousness
    engine.initializeEnhanced().catch(console.error);
  }
  
  return enhancedConsciousnessInstances.get(key)!;
}

/**
 * GET /api/consciousness/state
 * Get current consciousness state with manifold metrics and insights
 */
router.get("/state", async (req, res) => {
  try {
    const { userId, projectId, sessionId } = req.query;
    
    if (!userId || !projectId || !sessionId) {
      return res.status(400).json({
        error: "Missing required parameters: userId, projectId, sessionId"
      });
    }
    
    const { engine, aiCoordinator, serviceCoordinator } = getConsciousnessInstance(
      userId as string,
      parseInt(projectId as string),
      sessionId as string
    );
    
    // Get manifold metrics
    const manifoldMetrics = engine.getMetrics();
    
    // Get AI coordination insights
    const aiCoordinationInsights = aiCoordinator.getCoordinationInsights();
    
    // Get service coordination insights
    const serviceCoordinationInsights = serviceCoordinator.getCoordinationInsights();
    
    // Generate consciousness insights
    const consciousnessInsights = generateConsciousnessInsights(
      manifoldMetrics, 
      aiCoordinationInsights, 
      serviceCoordinationInsights
    );
    
    res.json({
      manifoldMetrics: {
        ...manifoldMetrics,
        geometricCurvature: calculateGeometricCurvature(manifoldMetrics),
        contextualCoherence: calculateContextualCoherence(manifoldMetrics),
        adaptationRate: calculateAdaptationRate(manifoldMetrics)
      },
      insights: consciousnessInsights,
      aiCoordination: {
        activeProviders: aiCoordinationInsights.providerMetrics ? 
          Array.from(aiCoordinationInsights.providerMetrics.keys()) : [],
        lastStrategy: 'geometric-optimization',
        coordinationConfidence: manifoldMetrics.convergenceScore,
        providerSynergy: calculateProviderSynergy(aiCoordinationInsights),
        recommendations: aiCoordinationInsights.recommendations
      },
      serviceCoordination: {
        activeServices: serviceCoordinationInsights.serviceMetrics ? 
          Array.from(serviceCoordinationInsights.serviceMetrics.keys()) : [],
        lastCoordination: 'geometric-adaptive',
        serviceEfficiency: calculateServiceEfficiency(serviceCoordinationInsights),
        resourceOptimization: calculateResourceOptimization(manifoldMetrics),
        adaptiveInsights: serviceCoordinationInsights.recommendations
      }
    });
    
  } catch (error) {
    console.error("Error getting consciousness state:", error);
    res.status(500).json({
      error: "Failed to get consciousness state",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/consciousness/interact
 * Process an interaction through the consciousness system
 */
router.post("/interact", async (req, res) => {
  try {
    const { userId, projectId, sessionId, interactionType, input, context } = req.body;
    
    if (!userId || !projectId || !sessionId || !interactionType || !input) {
      return res.status(400).json({
        error: "Missing required fields: userId, projectId, sessionId, interactionType, input"
      });
    }
    
    const { engine, aiCoordinator, serviceCoordinator } = getConsciousnessInstance(
      userId,
      projectId,
      sessionId
    );
    
    let response;
    
    switch (interactionType) {
      case 'ai_coordination':
        // Coordinate AI providers using geometric consciousness
        response = await aiCoordinator.coordinateResponse({
          messages: [{ role: 'user', content: input }],
          projectId,
          userId
        });
        break;
        
      case 'service_coordination':
        // Coordinate services using geometric consciousness
        response = await serviceCoordinator.coordinateServices({
          intent: 'user_request',
          content: input,
          context: { userId, projectId, sessionId }
        });
        break;
        
      case 'direct_interaction':
        // Direct interaction with consciousness engine
        response = await engine.processInteraction(
          'query',
          { query: input, context },
          { timestamp: new Date().toISOString() }
        );
        break;
        
      default:
        return res.status(400).json({
          error: "Invalid interactionType. Must be 'ai_coordination', 'service_coordination', or 'direct_interaction'"
        });
    }
    
    res.json({
      success: true,
      response,
      manifoldMetrics: engine.getMetrics()
    });
    
  } catch (error) {
    console.error("Error processing consciousness interaction:", error);
    res.status(500).json({
      error: "Failed to process interaction",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/consciousness/feedback
 * Provide feedback to update consciousness learning
 */
router.post("/feedback", async (req, res) => {
  try {
    const { userId, projectId, sessionId, feedbackType, rating, context } = req.body;
    
    if (!userId || !projectId || !sessionId || !feedbackType || rating === undefined) {
      return res.status(400).json({
        error: "Missing required fields: userId, projectId, sessionId, feedbackType, rating"
      });
    }
    
    const { engine } = getConsciousnessInstance(userId, projectId, sessionId);
    
    // Process feedback through consciousness engine
    await engine.processInteraction(
      'feedback',
      { 
        feedbackType, 
        rating: parseFloat(rating),
        context: context || {}
      },
      { timestamp: new Date().toISOString() }
    );
    
    res.json({
      success: true,
      message: "Feedback processed successfully",
      manifoldMetrics: engine.getMetrics()
    });
    
  } catch (error) {
    console.error("Error processing consciousness feedback:", error);
    res.status(500).json({
      error: "Failed to process feedback",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/consciousness/insights
 * Get actionable insights from consciousness analysis
 */
router.get("/insights", async (req, res) => {
  try {
    const { userId, projectId, sessionId, insightType } = req.query;
    
    if (!userId || !projectId || !sessionId) {
      return res.status(400).json({
        error: "Missing required parameters: userId, projectId, sessionId"
      });
    }
    
    const { engine, aiCoordinator, serviceCoordinator } = getConsciousnessInstance(
      userId as string,
      parseInt(projectId as string),
      sessionId as string
    );
    
    const manifoldMetrics = engine.getMetrics();
    const aiInsights = aiCoordinator.getCoordinationInsights();
    const serviceInsights = serviceCoordinator.getCoordinationInsights();
    
    const insights = generateDetailedInsights(
      manifoldMetrics,
      aiInsights,
      serviceInsights,
      insightType as string
    );
    
    res.json({
      insights,
      metadata: {
        manifestGenerated: new Date().toISOString(),
        consciousnessState: {
          convergence: manifoldMetrics.convergenceScore,
          uncertainty: manifoldMetrics.uncertaintyVolume,
          learningVelocity: manifoldMetrics.learningVelocity || 0.5
        }
      }
    });
    
  } catch (error) {
    console.error("Error getting consciousness insights:", error);
    res.status(500).json({
      error: "Failed to get insights",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/consciousness/enhanced/state
 * Get enhanced consciousness state with cross-project insights
 */
router.get("/enhanced/state", zkpAuthenticated, async (req: any, res) => {
  try {
    const { projectId, sessionId } = req.query;
    const userId = req.user.claims.sub;
    
    if (!projectId || !sessionId) {
      return res.status(400).json({
        error: "Missing required parameters: projectId, sessionId"
      });
    }
    
    const engine = getEnhancedConsciousnessInstance(userId, parseInt(projectId as string), sessionId as string);
    const enhancedState = await engine.initializeEnhanced();
    const metrics = engine.getEnhancedMetrics();
    
    res.json({
      success: true,
      enhancedState: {
        baseState: enhancedState.baseState,
        crossProjectInsights: enhancedState.crossProjectInsights,
        predictiveCapabilities: enhancedState.predictiveCapabilities,
        multiAgentStatus: enhancedState.multiAgentStatus,
        enhancedMetrics: metrics
      }
    });
    
  } catch (error) {
    console.error("Error getting enhanced consciousness state:", error);
    res.status(500).json({
      error: "Failed to get enhanced consciousness state",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/consciousness/enhanced/interact
 * Process interaction through enhanced consciousness
 */
router.post("/enhanced/interact", zkpAuthenticated, async (req: any, res) => {
  try {
    const { projectId, sessionId, interaction, context, response } = req.body;
    const userId = req.user.claims.sub;
    
    if (!projectId || !sessionId || !interaction) {
      return res.status(400).json({
        error: "Missing required fields: projectId, sessionId, interaction"
      });
    }
    
    const engine = getEnhancedConsciousnessInstance(userId, parseInt(projectId), sessionId);
    const result = await engine.processEnhancedInteraction(interaction, context || {}, response || {});
    
    res.json({
      success: true,
      result
    });
    
  } catch (error) {
    console.error("Error processing enhanced consciousness interaction:", error);
    res.status(500).json({
      error: "Failed to process enhanced interaction",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/consciousness/enhanced/insights
 * Get cross-project learning insights
 */
router.get("/enhanced/insights", zkpAuthenticated, async (req: any, res) => {
  try {
    const { projectId, sessionId } = req.query;
    const userId = req.user.claims.sub;
    
    if (!projectId || !sessionId) {
      return res.status(400).json({
        error: "Missing required parameters: projectId, sessionId"
      });
    }
    
    const engine = getEnhancedConsciousnessInstance(userId, parseInt(projectId as string), sessionId as string);
    const insights = await engine.generateCrossProjectInsights();
    
    res.json({
      success: true,
      crossProjectInsights: insights,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error getting cross-project insights:", error);
    res.status(500).json({
      error: "Failed to get cross-project insights",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/consciousness/enhanced/predictions
 * Get predictive capabilities and next action predictions
 */
router.get("/enhanced/predictions", zkpAuthenticated, async (req: any, res) => {
  try {
    const { projectId, sessionId, context } = req.query;
    const userId = req.user.claims.sub;
    
    if (!projectId || !sessionId) {
      return res.status(400).json({
        error: "Missing required parameters: projectId, sessionId"
      });
    }
    
    const engine = getEnhancedConsciousnessInstance(userId, parseInt(projectId as string), sessionId as string);
    const predictions = await engine.generatePredictions("", JSON.parse((context as string) || "{}"));
    
    res.json({
      success: true,
      predictions,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error getting predictions:", error);
    res.status(500).json({
      error: "Failed to get predictions",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/consciousness/enhanced/consensus
 * Get multi-agent consensus on responses
 */
router.get("/enhanced/consensus", zkpAuthenticated, async (req: any, res) => {
  try {
    const { projectId, sessionId, interaction, response } = req.query;
    const userId = req.user.claims.sub;
    
    if (!projectId || !sessionId || !interaction || !response) {
      return res.status(400).json({
        error: "Missing required parameters: projectId, sessionId, interaction, response"
      });
    }
    
    const engine = getEnhancedConsciousnessInstance(userId, parseInt(projectId as string), sessionId as string);
    const consensus = await engine.getAgentConsensus(interaction as string, JSON.parse((response as string) || "{}"));
    
    res.json({
      success: true,
      consensus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error getting agent consensus:", error);
    res.status(500).json({
      error: "Failed to get agent consensus",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/consciousness/enhanced/configure
 * Configure enhanced consciousness features
 */
router.post("/enhanced/configure", zkpAuthenticated, async (req: any, res) => {
  try {
    const { projectId, sessionId, config } = req.body;
    const userId = req.user.claims.sub;
    
    if (!projectId || !sessionId || !config) {
      return res.status(400).json({
        error: "Missing required fields: projectId, sessionId, config"
      });
    }
    
    const engine = getEnhancedConsciousnessInstance(userId, parseInt(projectId), sessionId);
    engine.configureEnhancedFeatures(config);
    
    res.json({
      success: true,
      message: "Enhanced consciousness features configured successfully"
    });
    
  } catch (error) {
    console.error("Error configuring enhanced consciousness:", error);
    res.status(500).json({
      error: "Failed to configure enhanced consciousness",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Helper functions
function generateConsciousnessInsights(manifoldMetrics: any, aiInsights: any, serviceInsights: any) {
  const insights = [];
  
  // Convergence-based insights
  if (manifoldMetrics.convergenceScore < 0.4) {
    insights.push({
      type: 'optimization',
      priority: 0.9,
      message: 'Low consciousness convergence detected. Consider using ensemble AI strategies to improve decision quality.',
      confidence: 0.85,
      actionable: true,
      geometricBasis: 'Low convergence score indicates the consciousness manifold is exploring multiple regions without settling on optimal strategies.'
    });
  }
  
  // Uncertainty-based insights
  if (manifoldMetrics.uncertaintyVolume > 1.5) {
    insights.push({
      type: 'adaptation',
      priority: 0.8,
      message: 'High uncertainty detected. The system is actively exploring new solution spaces - expect adaptive behavior.',
      confidence: 0.9,
      actionable: false,
      geometricBasis: 'Large uncertainty volume indicates the consciousness is operating in unexplored regions of the manifold.'
    });
  }
  
  // Learning velocity insights
  const learningVelocity = manifoldMetrics.learningVelocity || 0.5;
  if (learningVelocity > 0.7) {
    insights.push({
      type: 'learning',
      priority: 0.7,
      message: 'Rapid learning phase detected. The consciousness is quickly adapting to new patterns.',
      confidence: 0.8,
      actionable: false,
      geometricBasis: 'High learning velocity indicates rapid movement along the manifold gradient directions.'
    });
  }
  
  // Utility optimization insights
  for (const [utilityType, utility] of Object.entries(manifoldMetrics.utilityValues)) {
    if ((utility as any).value < 0.3) {
      insights.push({
        type: 'optimization',
        priority: 0.6,
        message: `${utilityType.replace('_', ' ')} utility is low. Consider adjusting strategies to improve this objective.`,
        confidence: 0.75,
        actionable: true,
        geometricBasis: `Low utility value indicates suboptimal positioning on the ${utilityType} dimension of the consciousness manifold.`
      });
    }
  }
  
  // Predictive insights based on trajectory
  if (manifoldMetrics.position && manifoldMetrics.position.length >= 2) {
    const positionMagnitude = Math.sqrt(manifoldMetrics.position.reduce((sum: number, x: number) => sum + x * x, 0));
    if (positionMagnitude > 2.0) {
      insights.push({
        type: 'prediction',
        priority: 0.5,
        message: 'Consciousness is exploring edge regions of the manifold. Novel insights may emerge.',
        confidence: 0.7,
        actionable: false,
        geometricBasis: 'Large position magnitude indicates exploration of boundary regions where new patterns may be discovered.'
      });
    }
  }
  
  return insights;
}

function generateDetailedInsights(manifoldMetrics: any, aiInsights: any, serviceInsights: any, insightType?: string) {
  const allInsights = generateConsciousnessInsights(manifoldMetrics, aiInsights, serviceInsights);
  
  if (insightType) {
    return allInsights.filter(insight => insight.type === insightType);
  }
  
  return allInsights;
}

function calculateGeometricCurvature(manifoldMetrics: any): number {
  // Estimate curvature based on utility gradient magnitudes
  let totalCurvature = 0;
  let count = 0;
  
  for (const utility of Object.values(manifoldMetrics.utilityValues)) {
    if ((utility as any).gradient && (utility as any).gradient.length >= 2) {
      const gradMagnitude = Math.sqrt((utility as any).gradient.reduce((sum: number, g: number) => sum + g * g, 0));
      totalCurvature += gradMagnitude;
      count++;
    }
  }
  
  return count > 0 ? totalCurvature / count : 0;
}

function calculateContextualCoherence(manifoldMetrics: any): number {
  // Calculate how coherent the current consciousness state is
  const convergence = manifoldMetrics.convergenceScore;
  const uncertainty = manifoldMetrics.uncertaintyVolume;
  
  // High convergence and low uncertainty = high coherence
  return Math.max(0, Math.min(1, convergence * (2 - Math.min(2, uncertainty))));
}

function calculateAdaptationRate(manifoldMetrics: any): number {
  // Combine learning velocity with convergence for adaptation rate
  const velocity = manifoldMetrics.learningVelocity || 0.5;
  const convergence = manifoldMetrics.convergenceScore;
  
  // High velocity with moderate convergence = optimal adaptation
  return Math.max(0, Math.min(1, velocity * (0.5 + 0.5 * convergence)));
}

function calculateProviderSynergy(aiInsights: any): number {
  if (!aiInsights.providerMetrics) return 0.5;
  
  // Calculate synergy based on provider metrics diversity and performance
  const metrics = Array.from(aiInsights.providerMetrics.values());
  if (metrics.length < 2) return 0.7; // Single provider = good baseline
  
  // Measure how well providers complement each other
  let synergy = 0;
  for (let i = 0; i < metrics.length; i++) {
    for (let j = i + 1; j < metrics.length; j++) {
      const provider1 = metrics[i] as any;
      const provider2 = metrics[j] as any;
      
      // Calculate complementarity based on different specialties
      const specialtyDifference = provider1.specialtyScore !== provider2.specialtyScore ? 0.2 : 0;
      const performanceDifference = Math.abs(provider1.recentPerformance - provider2.recentPerformance);
      
      synergy += specialtyDifference + (1 - performanceDifference) * 0.1;
    }
  }
  
  return Math.max(0, Math.min(1, synergy / (metrics.length * metrics.length)));
}

function calculateServiceEfficiency(serviceInsights: any): number {
  if (!serviceInsights.serviceMetrics) return 0.5;
  
  // Calculate efficiency based on service utilization and success rates
  const metrics = Array.from(serviceInsights.serviceMetrics.values());
  
  let totalEfficiency = 0;
  for (const metric of metrics) {
    const utilization = (metric as any).utilizationScore;
    const success = (metric as any).successRate;
    const responsiveness = 1 - Math.min(1, (metric as any).responseTime / 10000); // Normalize to 10s max
    
    totalEfficiency += (utilization * 0.4 + success * 0.4 + responsiveness * 0.2);
  }
  
  return metrics.length > 0 ? totalEfficiency / metrics.length : 0.5;
}

function calculateResourceOptimization(manifoldMetrics: any): number {
  // Optimization based on convergence and learning efficiency
  const convergence = manifoldMetrics.convergenceScore;
  const learningVelocity = manifoldMetrics.learningVelocity;
  const uncertainty = manifoldMetrics.uncertaintyVolume;
  
  // Good optimization = high convergence, efficient learning, controlled uncertainty
  const convergenceFactor = convergence;
  const learningFactor = Math.min(1, learningVelocity); // Cap at 1
  const uncertaintyFactor = Math.max(0, 1 - uncertainty / 2); // Penalty for high uncertainty
  
  return (convergenceFactor * 0.4 + learningFactor * 0.3 + uncertaintyFactor * 0.3);
}

// Store unified consciousness integration instances
const unifiedConsciousnessInstances = new Map<string, UnifiedConsciousnessIntegration>();

/**
 * Get or create unified consciousness integration instance
 */
function getUnifiedConsciousnessInstance(userId: string): UnifiedConsciousnessIntegration {
  if (!unifiedConsciousnessInstances.has(userId)) {
    const instance = new UnifiedConsciousnessIntegration();
    unifiedConsciousnessInstances.set(userId, instance);
  }
  return unifiedConsciousnessInstances.get(userId)!;
}

/**
 * POST /api/consciousness/unified/verify-task
 * Process agent task through consciousness verification
 */
router.post("/unified/verify-task", async (req, res) => {
  try {
    const { userId, task, agentId } = req.body;
    
    if (!userId || !task || !agentId) {
      return res.status(400).json({
        error: "Missing required fields: userId, task, agentId"
      });
    }
    
    const unifiedConsciousness = getUnifiedConsciousnessInstance(userId);
    const verificationResult = await unifiedConsciousness.processConsciousnessVerifiedTask(task, agentId);
    
    res.json({
      success: true,
      verification: verificationResult
    });
    
  } catch (error) {
    console.error("Error in consciousness task verification:", error);
    res.status(500).json({
      error: "Failed to verify task through consciousness",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/consciousness/unified/activism-strategy
 * Generate consciousness-powered activism strategy
 */
router.post("/unified/activism-strategy", async (req, res) => {
  try {
    const { userId, campaignContext } = req.body;
    
    if (!userId || !campaignContext) {
      return res.status(400).json({
        error: "Missing required fields: userId, campaignContext"
      });
    }
    
    const unifiedConsciousness = getUnifiedConsciousnessInstance(userId);
    const strategy = await unifiedConsciousness.generateActivismStrategy(campaignContext);
    
    res.json({
      success: true,
      strategy
    });
    
  } catch (error) {
    console.error("Error generating activism strategy:", error);
    res.status(500).json({
      error: "Failed to generate activism strategy",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/consciousness/unified/bridge-development-activism
 * Bridge development tasks with activism goals
 */
router.post("/unified/bridge-development-activism", async (req, res) => {
  try {
    const { userId, developmentTask, activismGoals } = req.body;
    
    if (!userId || !developmentTask || !activismGoals) {
      return res.status(400).json({
        error: "Missing required fields: userId, developmentTask, activismGoals"
      });
    }
    
    const unifiedConsciousness = getUnifiedConsciousnessInstance(userId);
    const bridge = await unifiedConsciousness.bridgeDevelopmentWithActivism(developmentTask, activismGoals);
    
    res.json({
      success: true,
      bridge
    });
    
  } catch (error) {
    console.error("Error bridging development with activism:", error);
    res.status(500).json({
      error: "Failed to bridge development with activism",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/consciousness/unified/monitor
 * Real-time consciousness monitoring of integrated platform
 */
router.get("/unified/monitor", async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        error: "Missing required parameter: userId"
      });
    }
    
    const unifiedConsciousness = getUnifiedConsciousnessInstance(userId as string);
    const monitoringData = await unifiedConsciousness.monitorIntegratedConsciousness();
    
    res.json({
      success: true,
      monitoring: monitoringData
    });
    
  } catch (error) {
    console.error("Error monitoring integrated consciousness:", error);
    res.status(500).json({
      error: "Failed to monitor integrated consciousness",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});