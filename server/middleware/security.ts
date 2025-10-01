/**
 * Security Middleware
 * Rate limiting, request validation, and security headers
 */

import { Request, Response, NextFunction } from 'express';

// Store for simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate Limiter Middleware
 * Prevents abuse by limiting requests per IP
 */
export function createRateLimiter(options: {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const maxRequests = options.maxRequests || 100;
  const message = options.message || 'Too many requests, please try again later';

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    const record = requestCounts.get(key);
    
    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }
    
    if (record.count >= maxRequests) {
      res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }
    
    record.count++;
    next();
  };
}

/**
 * API Rate Limiter - Stricter limits for API endpoints
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many API requests, please try again later',
});

/**
 * Auth Rate Limiter - Very strict limits for authentication
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later',
});

/**
 * AI Rate Limiter - Limits for expensive AI operations
 */
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Too many AI requests, please slow down',
});

/**
 * Security Headers Middleware
 * Adds security headers to all responses
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
}

/**
 * Request Size Limiter
 * Prevents large payload attacks
 */
export function requestSizeLimiter(maxSize: string = '10mb') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxBytes = parseSize(maxSize);
    
    if (contentLength > maxBytes) {
      res.status(413).json({
        error: 'Payload Too Large',
        message: `Request body size exceeds limit of ${maxSize}`,
      });
      return;
    }
    
    next();
  };
}

/**
 * API Key Authentication Middleware
 * Validates API key for external access
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.API_KEY;
  
  // If no API key is configured, skip validation
  if (!validApiKey) {
    next();
    return;
  }
  
  if (!apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required',
    });
    return;
  }
  
  if (apiKey !== validApiKey) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key',
    });
    return;
  }
  
  next();
}

/**
 * CORS Configuration
 * More restrictive CORS for production
 */
export function configureCORS(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
  
  // In development, allow all origins
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  next();
}

/**
 * Input Sanitization Middleware
 * Prevents injection attacks
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    }
  }
  
  // Sanitize body (for non-code content)
  if (req.body && typeof req.body === 'object') {
    const skipPaths = ['/api/projects', '/api/files', '/api/code'];
    const shouldSkip = skipPaths.some(path => req.path.startsWith(path));
    
    if (!shouldSkip) {
      sanitizeObject(req.body);
    }
  }
  
  next();
}

/**
 * Helper: Parse size string to bytes
 */
function parseSize(size: string): number {
  const units: { [key: string]: number } = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };
  
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB
  
  const value = parseInt(match[1], 10);
  const unit = match[2] || 'b';
  
  return value * units[unit];
}

/**
 * Helper: Sanitize string input
 */
function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Helper: Recursively sanitize object
 */
function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}
