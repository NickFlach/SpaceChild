/**
 * Health Check Middleware
 * Provides endpoints for monitoring application health and readiness
 */

import { Request, Response } from 'express';
import { db } from '../db';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceStatus;
    consciousness: ServiceStatus;
    multiAgent: ServiceStatus;
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
}

/**
 * Health Check Endpoint - Quick check for load balancers
 * Returns 200 if application is running
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Readiness Check - Comprehensive health check
 * Verifies all dependencies are operational
 */
export async function readinessCheck(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: await checkDatabase(),
      consciousness: checkConsciousness(),
      multiAgent: checkMultiAgent(),
    },
  };

  // Determine overall status
  const services = Object.values(health.services);
  if (services.some(s => s.status === 'down')) {
    health.status = 'unhealthy';
    res.status(503).json(health);
    return;
  }
  
  if (services.some(s => s.status === 'degraded')) {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}

/**
 * Liveness Check - Kubernetes liveness probe
 * Returns 200 if process is alive (doesn't check dependencies)
 */
export async function livenessCheck(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    memory: process.memoryUsage(),
  });
}

/**
 * Metrics Endpoint - Prometheus-compatible metrics
 */
export async function metricsEndpoint(req: Request, res: Response): Promise<void> {
  const memory = process.memoryUsage();
  
  const metrics = `
# HELP nodejs_memory_heap_used_bytes Memory heap used in bytes
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${memory.heapUsed}

# HELP nodejs_memory_heap_total_bytes Total heap memory in bytes
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${memory.heapTotal}

# HELP nodejs_memory_external_bytes External memory in bytes
# TYPE nodejs_memory_external_bytes gauge
nodejs_memory_external_bytes ${memory.external}

# HELP nodejs_process_uptime_seconds Process uptime in seconds
# TYPE nodejs_process_uptime_seconds gauge
nodejs_process_uptime_seconds ${process.uptime()}

# HELP nodejs_process_cpu_user_seconds Total user CPU time
# TYPE nodejs_process_cpu_user_seconds counter
nodejs_process_cpu_user_seconds ${process.cpuUsage().user / 1000000}

# HELP nodejs_process_cpu_system_seconds Total system CPU time
# TYPE nodejs_process_cpu_system_seconds counter
nodejs_process_cpu_system_seconds ${process.cpuUsage().system / 1000000}
`.trim();

  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics);
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    // Simple query to check database connection
    await db.execute('SELECT 1');
    
    return {
      status: 'up',
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      status: 'down',
      message: error?.message || 'Database connection failed',
    };
  }
}

/**
 * Check consciousness service
 */
function checkConsciousness(): ServiceStatus {
  try {
    const enabled = process.env.CONSCIOUSNESS_ENABLED === 'true';
    
    return {
      status: enabled ? 'up' : 'degraded',
      message: enabled ? 'Consciousness engine active' : 'Consciousness disabled',
    };
  } catch (error: any) {
    return {
      status: 'down',
      message: error?.message || 'Consciousness check failed',
    };
  }
}

/**
 * Check multi-agent system
 */
function checkMultiAgent(): ServiceStatus {
  try {
    const enabled = process.env.AGENT_COLLABORATION === 'true';
    
    return {
      status: enabled ? 'up' : 'degraded',
      message: enabled ? 'Multi-agent system active' : 'Multi-agent disabled',
    };
  } catch (error: any) {
    return {
      status: 'down',
      message: error?.message || 'Multi-agent check failed',
    };
  }
}
