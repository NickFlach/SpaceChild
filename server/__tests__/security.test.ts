/**
 * Security Middleware Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createRateLimiter, securityHeaders } from '../middleware/security';
import type { Request, Response, NextFunction } from 'express';

describe('Security Middleware', () => {
  describe('Rate Limiter', () => {
    beforeEach(() => {
      // Clear rate limit records before each test
    });

    it('should allow requests within limit', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      });

      const req = { ip: '127.0.0.1' } as Request;
      let nextCalled = false;
      const next = (() => { nextCalled = true; }) as NextFunction;
      const res = {} as Response;

      limiter(req, res, next);
      expect(nextCalled).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      });

      const req = { ip: '127.0.0.2' } as Request;
      const next = (() => {}) as NextFunction;
      let statusCode = 0;

      const res = {
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: () => {},
      } as unknown as Response;

      // Make requests up to limit
      limiter(req, res, next);
      limiter(req, res, next);
      limiter(req, res, next); // This should be blocked

      expect(statusCode).toBe(429);
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', () => {
      const req = {} as Request;
      const headers: Record<string, string> = {};
      const res = {
        setHeader: (name: string, value: string) => {
          headers[name] = value;
        },
      } as unknown as Response;
      let nextCalled = false;
      const next = (() => { nextCalled = true; }) as NextFunction;

      securityHeaders(req, res, next);

      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(nextCalled).toBe(true);
    });
  });
});
