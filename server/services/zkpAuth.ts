import * as srp from 'secure-remote-password/server.js';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../storage';
import { Request, Response, NextFunction } from 'express';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'space-child-zkp-secret-2025';
const TOKEN_EXPIRY = '24h';

interface ZKPSession {
  serverEphemeral: {
    secret: string;
    public: string;
  };
  userId?: string;
}

// In-memory session storage for active SRP handshakes
const activeSessions = new Map<string, ZKPSession>();

/**
 * Zero-Knowledge Proof Authentication Service
 * Uses SRP (Secure Remote Password) protocol for authentication
 */
export class ZKPAuthService {
  /**
   * Register a new user with zero-knowledge proof credentials
   */
  static async register(email: string, username: string, salt: string, verifier: string, subscriptionTier?: string) {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        throw new Error('Username already taken');
      }

      // Set credits based on subscription tier
      const tier = subscriptionTier || 'explorer';
      let monthlyCredits = 100;
      
      switch(tier) {
        case 'builder':
          monthlyCredits = 1000;
          break;
        case 'architect':
          monthlyCredits = 5000;
          break;
        default:
          monthlyCredits = 100;
      }

      // Create user with SRP credentials (salt and verifier from client)
      const userId = uuidv4();
      const user = await storage.createUser({
        id: userId,
        email,
        username,
        srpSalt: salt,
        srpVerifier: verifier,
        firstName: '',
        lastName: '',
        profileImageUrl: '',
        subscriptionTier: tier,
        monthlyCredits: monthlyCredits,
        usedCredits: 0,
        creditResetDate: new Date()
      });

      return {
        success: true,
        userId: user.id,
        message: 'User registered successfully',
        subscriptionTier: tier
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register user');
    }
  }

  /**
   * Start the SRP authentication handshake
   * Client sends username and ephemeral public key A
   */
  static async startAuthentication(username: string, clientEphemeralPublic: string) {
    try {
      // Get user by username
      const user = await storage.getUserByUsername(username);
      if (!user || !user.srpSalt || !user.srpVerifier) {
        throw new Error('Invalid credentials');
      }

      // Generate server ephemeral
      const serverEphemeral = srp.generateEphemeral(user.srpVerifier);
      
      // Create session ID for this handshake
      const sessionId = uuidv4();
      
      // Store session temporarily
      activeSessions.set(sessionId, {
        serverEphemeral,
        userId: user.id
      });

      // Clean up session after 5 minutes
      setTimeout(() => {
        activeSessions.delete(sessionId);
      }, 5 * 60 * 1000);

      return {
        sessionId,
        salt: user.srpSalt,
        serverEphemeralPublic: serverEphemeral.public
      };
    } catch (error: any) {
      console.error('Start authentication error:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Complete the SRP authentication
   * Client sends proof of password knowledge
   */
  static async completeAuthentication(
    sessionId: string,
    clientEphemeralPublic: string,
    clientProof: string
  ) {
    try {
      // Get session
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Invalid or expired session');
      }

      // Get user
      const user = await storage.getUser(session.userId!);
      if (!user || !user.srpVerifier || !user.srpSalt || !user.username) {
        throw new Error('Invalid credentials');
      }

      // Derive session key and verify client proof
      const sessionKey = srp.deriveSession(
        session.serverEphemeral.secret,
        clientEphemeralPublic,
        user.srpSalt,
        user.username,
        user.srpVerifier,
        clientProof
      );

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      // Update user session token
      await storage.updateUserSession(user.id, token);

      // Clean up session
      activeSessions.delete(sessionId);

      return {
        success: true,
        token,
        serverProof: sessionKey.proof,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          subscriptionTier: user.subscriptionTier,
          monthlyCredits: user.monthlyCredits,
          usedCredits: user.usedCredits
        }
      };
    } catch (error: any) {
      console.error('Complete authentication error:', error);
      // Clean up failed session
      activeSessions.delete(sessionId);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(oldToken: string) {
    try {
      const decoded = jwt.verify(oldToken, JWT_SECRET, { ignoreExpiration: true }) as any;
      
      // Check if user still exists
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token
      const newToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      // Update session token
      await storage.updateUserSession(user.id, newToken);

      return {
        success: true,
        token: newToken
      };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Logout user
   */
  static async logout(userId: string) {
    try {
      await storage.clearUserSession(userId);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  }
}

/**
 * Middleware to protect routes with ZKP authentication
 */
export const zkpAuthenticated = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = ZKPAuthService.verifyToken(token);
    
    // Get user
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if token matches stored session (only if sessionToken exists)
    if (user.sessionToken && user.sessionToken !== token) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    // Add user to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      claims: {
        sub: user.id // For compatibility with existing code
      }
    };

    next();
  } catch (error: any) {
    return res.status(401).json({ message: error.message || 'Unauthorized' });
  }
};