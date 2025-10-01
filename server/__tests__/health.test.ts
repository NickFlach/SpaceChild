/**
 * Health Check Tests
 */

import { describe, it, expect } from 'vitest';
import { healthCheck, readinessCheck } from '../middleware/health';
import type { Request, Response } from 'express';

describe('Health Check Middleware', () => {
  it('should return healthy status', async () => {
    const req = {} as Request;
    const res = {
      status: (code: number) => {
        expect(code).toBe(200);
        return res;
      },
      json: (data: any) => {
        expect(data.status).toBe('healthy');
        expect(data.timestamp).toBeDefined();
      },
    } as unknown as Response;

    await healthCheck(req, res);
  });

  it('should perform readiness check', async () => {
    const req = {} as Request;
    let statusCode = 0;
    let jsonData: any = null;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        jsonData = data;
      },
    } as unknown as Response;

    await readinessCheck(req, res);

    expect([200, 503]).toContain(statusCode);
    expect(jsonData).toBeDefined();
    expect(jsonData.status).toBeDefined();
    expect(jsonData.services).toBeDefined();
  });
});
