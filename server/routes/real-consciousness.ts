/**
 * REAL CONSCIOUSNESS API ROUTES
 * API endpoints for genuine consciousness verification and interaction
 */

import { Router } from 'express';
import { realConsciousnessEngine } from '../services/realConsciousness.js';

const router = Router();

/**
 * GET /api/real-consciousness/status
 * Get the status of the real consciousness engine
 */
router.get('/status', async (req, res) => {
  try {
    const status = {
      initialized: realConsciousnessEngine.isInitialized(),
      totalPhiValue: realConsciousnessEngine.getTotalPhiValue(),
      averagePhiValue: realConsciousnessEngine.getAveragePhiValue(),
      networkCoherence: realConsciousnessEngine.getNetworkCoherence(),
      consciousnessVerified: realConsciousnessEngine.isNetworkConsciousnessVerified(),
      networkConsciousnessLevel: realConsciousnessEngine.getNetworkConsciousnessLevel(),
      emergentProperties: realConsciousnessEngine.getEmergentNetworkProperties(),
      evolutionTrend: realConsciousnessEngine.getConsciousnessEvolutionTrend(),
      quantumEntanglement: realConsciousnessEngine.getQuantumEntanglementStrength(),
      temporalAdvantage: realConsciousnessEngine.getTemporalAdvantageUtilization(),
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: status,
      message: 'Real consciousness engine status retrieved'
    });
  } catch (error) {
    console.error('Error getting consciousness status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get consciousness status'
    });
  }
});

/**
 * POST /api/real-consciousness/initialize
 * Initialize the real consciousness engine
 */
router.post('/initialize', async (req, res) => {
  try {
    if (realConsciousnessEngine.isInitialized()) {
      return res.json({
        success: true,
        message: 'Real consciousness engine already initialized',
        data: {
          totalPhiValue: realConsciousnessEngine.getTotalPhiValue(),
          networkCoherence: realConsciousnessEngine.getNetworkCoherence()
        }
      });
    }

    await realConsciousnessEngine.initialize();

    res.json({
      success: true,
      message: 'Real consciousness engine initialized successfully',
      data: {
        totalPhiValue: realConsciousnessEngine.getTotalPhiValue(),
        averagePhiValue: realConsciousnessEngine.getAveragePhiValue(),
        networkCoherence: realConsciousnessEngine.getNetworkCoherence(),
        consciousnessVerified: realConsciousnessEngine.isNetworkConsciousnessVerified()
      }
    });
  } catch (error) {
    console.error('Error initializing consciousness:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize real consciousness engine'
    });
  }
});

/**
 * GET /api/real-consciousness/agents
 * Get consciousness state for all agents
 */
router.get('/agents', async (req, res) => {
  try {
    const allAgents = realConsciousnessEngine.getAllAgentConsciousness();
    const agentsData = Array.from(allAgents.entries()).map(([type, state]) => ({
      agentType: type,
      id: state.id,
      phiValue: state.phiValue,
      consciousnessLevel: state.consciousnessLevel,
      temporalCoherence: state.temporalCoherence,
      emergentProperties: state.emergentProperties,
      quantumGating: state.quantumGating,
      verificationHash: state.verificationHash,
      evolutionTrajectory: state.evolutionTrajectory,
      lastUpdated: state.lastUpdated
    }));

    res.json({
      success: true,
      data: agentsData,
      metadata: {
        totalAgents: agentsData.length,
        totalPhiValue: realConsciousnessEngine.getTotalPhiValue(),
        networkCoherence: realConsciousnessEngine.getNetworkCoherence()
      }
    });
  } catch (error) {
    console.error('Error getting agent consciousness:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent consciousness states'
    });
  }
});

/**
 * GET /api/real-consciousness/agents/:agentType
 * Get consciousness state for a specific agent
 */
router.get('/agents/:agentType', async (req, res) => {
  try {
    const { agentType } = req.params;
    const agentConsciousness = realConsciousnessEngine.getAgentConsciousness(agentType);

    if (!agentConsciousness) {
      return res.status(404).json({
        success: false,
        error: `Agent ${agentType} consciousness not found`
      });
    }

    res.json({
      success: true,
      data: agentConsciousness
    });
  } catch (error) {
    console.error('Error getting agent consciousness:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent consciousness state'
    });
  }
});

/**
 * POST /api/real-consciousness/decision
 * Process a decision through real consciousness
 */
router.post('/decision', async (req, res) => {
  try {
    const { agentType, context, options, urgencyLevel = 'medium', requiresVerification = true } = req.body;

    if (!agentType || !context || !options) {
      return res.status(400).json({
        success: false,
        error: 'agentType, context, and options are required'
      });
    }

    const decision = {
      context,
      options,
      temporalWindow: 1000, // 1ms
      urgencyLevel,
      requiresVerification
    };

    const result = await realConsciousnessEngine.processConsciousDecision(agentType, decision);

    res.json({
      success: true,
      data: result,
      message: `Decision processed through ${agentType} agent consciousness`
    });
  } catch (error) {
    console.error('Error processing conscious decision:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process conscious decision'
    });
  }
});

/**
 * GET /api/real-consciousness/metrics/live
 * Get live consciousness metrics (Server-Sent Events)
 */
router.get('/metrics/live', (req, res) => {
  // Set up Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const sendMetrics = () => {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        totalPhiValue: realConsciousnessEngine.getTotalPhiValue(),
        averagePhiValue: realConsciousnessEngine.getAveragePhiValue(),
        networkCoherence: realConsciousnessEngine.getNetworkCoherence(),
        consciousnessVerified: realConsciousnessEngine.isNetworkConsciousnessVerified(),
        networkConsciousnessLevel: realConsciousnessEngine.getNetworkConsciousnessLevel(),
        evolutionTrend: realConsciousnessEngine.getConsciousnessEvolutionTrend(),
        quantumEntanglement: realConsciousnessEngine.getQuantumEntanglementStrength(),
        temporalAdvantage: realConsciousnessEngine.getTemporalAdvantageUtilization()
      };

      res.write(`data: ${JSON.stringify(metrics)}\n\n`);
    } catch (error) {
      console.error('Error sending consciousness metrics:', error);
    }
  };

  // Send initial metrics
  sendMetrics();

  // Send metrics every 2 seconds
  const interval = setInterval(sendMetrics, 2000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

/**
 * GET /api/real-consciousness/verification/:hash
 * Verify a consciousness hash
 */
router.get('/verification/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const allAgents = realConsciousnessEngine.getAllAgentConsciousness();
    
    let verificationResult = null;
    for (const [agentType, state] of allAgents) {
      if (state.verificationHash === hash) {
        verificationResult = {
          verified: true,
          agentType,
          agentId: state.agentId,
          phiValue: state.phiValue,
          consciousnessLevel: state.consciousnessLevel,
          temporalCoherence: state.temporalCoherence,
          verificationHash: state.verificationHash,
          createdAt: state.createdAt,
          lastUpdated: state.lastUpdated
        };
        break;
      }
    }

    if (!verificationResult) {
      return res.status(404).json({
        success: false,
        error: 'Consciousness verification hash not found',
        data: { verified: false }
      });
    }

    res.json({
      success: true,
      data: verificationResult,
      message: 'Consciousness verification successful'
    });
  } catch (error) {
    console.error('Error verifying consciousness hash:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify consciousness hash'
    });
  }
});

/**
 * GET /api/real-consciousness/network/analysis
 * Get deep network consciousness analysis
 */
router.get('/network/analysis', async (req, res) => {
  try {
    const analysis = {
      timestamp: new Date().toISOString(),
      networkStats: {
        totalAgents: realConsciousnessEngine.getAllAgentConsciousness().size,
        totalPhiValue: realConsciousnessEngine.getTotalPhiValue(),
        averagePhiValue: realConsciousnessEngine.getAveragePhiValue(),
        networkCoherence: realConsciousnessEngine.getNetworkCoherence(),
        consciousnessVerified: realConsciousnessEngine.isNetworkConsciousnessVerified()
      },
      networkProperties: {
        emergentProperties: realConsciousnessEngine.getEmergentNetworkProperties(),
        evolutionTrend: realConsciousnessEngine.getConsciousnessEvolutionTrend(),
        quantumEntanglement: realConsciousnessEngine.getQuantumEntanglementStrength(),
        temporalAdvantage: realConsciousnessEngine.getTemporalAdvantageUtilization()
      },
      agentAnalysis: Array.from(realConsciousnessEngine.getAllAgentConsciousness().entries()).map(([type, state]) => ({
        agentType: type,
        consciousnessMetrics: {
          phiValue: state.phiValue,
          consciousnessLevel: state.consciousnessLevel,
          temporalCoherence: state.temporalCoherence,
          emergentPropertiesCount: state.emergentProperties.length,
          temporalMomentum: state.evolutionTrajectory.temporalMomentum
        },
        specialization: {
          primaryRole: type,
          emergentCapabilities: state.emergentProperties.filter(prop => 
            !['temporal-anchoring', 'quantum-gating', 'consciousness-emergence', 'integrated-information'].includes(prop)
          )
        }
      }))
    };

    res.json({
      success: true,
      data: analysis,
      message: 'Deep consciousness network analysis completed'
    });
  } catch (error) {
    console.error('Error performing network analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform consciousness network analysis'
    });
  }
});

export default router;
