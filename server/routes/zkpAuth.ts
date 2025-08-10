import { Router } from 'express';
import { ZKPAuthService, zkpAuthenticated } from '../services/zkpAuth';
import * as srpClient from 'secure-remote-password/client.js';

const router = Router();

/**
 * Register a new user
 * POST /api/zkp/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, username, salt, verifier, subscriptionTier } = req.body;

    if (!email || !username || !salt || !verifier) {
      return res.status(400).json({ 
        message: 'Email, username, salt, and verifier are required' 
      });
    }

    const result = await ZKPAuthService.register(email, username, salt, verifier, subscriptionTier);
    res.json(result);
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      message: error.message || 'Registration failed' 
    });
  }
});

/**
 * Start authentication handshake
 * POST /api/zkp/auth/start
 */
router.post('/auth/start', async (req, res) => {
  try {
    const { username, clientEphemeralPublic } = req.body;

    if (!username || !clientEphemeralPublic) {
      return res.status(400).json({ 
        message: 'Username and client ephemeral public key are required' 
      });
    }

    const result = await ZKPAuthService.startAuthentication(
      username,
      clientEphemeralPublic
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Start auth error:', error);
    res.status(401).json({ 
      message: error.message || 'Authentication failed' 
    });
  }
});

/**
 * Complete authentication handshake
 * POST /api/zkp/auth/complete
 */
router.post('/auth/complete', async (req, res) => {
  try {
    const { sessionId, clientEphemeralPublic, clientProof } = req.body;

    if (!sessionId || !clientEphemeralPublic || !clientProof) {
      return res.status(400).json({ 
        message: 'Session ID, client ephemeral public key, and client proof are required' 
      });
    }

    const result = await ZKPAuthService.completeAuthentication(
      sessionId,
      clientEphemeralPublic,
      clientProof
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Complete auth error:', error);
    res.status(401).json({ 
      message: error.message || 'Authentication failed' 
    });
  }
});

/**
 * Refresh authentication token
 * POST /api/zkp/auth/refresh
 */
router.post('/auth/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const result = await ZKPAuthService.refreshToken(token);
    
    res.json(result);
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      message: error.message || 'Failed to refresh token' 
    });
  }
});

/**
 * Logout user
 * POST /api/zkp/auth/logout
 */
router.post('/auth/logout', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const result = await ZKPAuthService.logout(userId);
    
    res.json(result);
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to logout' 
    });
  }
});

/**
 * Get current user
 * GET /api/zkp/auth/user
 */
router.get('/auth/user', zkpAuthenticated, async (req: any, res) => {
  try {
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to get user' 
    });
  }
});

/**
 * Demo endpoint for testing SRP client-side
 * This would normally be done on the client
 */
router.post('/demo/client-srp', async (req, res) => {
  try {
    const { username, password, action } = req.body;

    if (action === 'start') {
      // Generate client ephemeral
      const salt = srpClient.generateSalt();
      const privateKey = srpClient.derivePrivateKey(salt, username, password);
      const clientEphemeral = srpClient.generateEphemeral();
      
      res.json({
        clientEphemeralPublic: clientEphemeral.public,
        clientEphemeralSecret: clientEphemeral.secret,
        privateKey
      });
    } else if (action === 'complete') {
      const { salt, serverEphemeralPublic, clientEphemeralSecret, privateKey } = req.body;
      
      // Derive session and generate proof
      const clientSession = srpClient.deriveSession(
        clientEphemeralSecret,
        serverEphemeralPublic,
        salt,
        username,
        privateKey
      );
      
      res.json({
        clientProof: clientSession.proof,
        sessionKey: clientSession.key
      });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;