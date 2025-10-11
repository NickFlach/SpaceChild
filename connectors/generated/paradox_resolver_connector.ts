/**
 * ParadoxResolver Connector
 *
 * This connector integrates ParadoxResolver (Python/Streamlit) with other applications.
 * It handles evolutionary optimization, pattern recognition, and data analysis.
 */

import { ApplicationConnector, ConnectionProtocol, HealthStatus } from '../core/connector_framework';
import { spawn } from 'child_process';
import path from 'path';
import { EventEmitter } from 'events';

interface OptimizationRequest {
  id: string;
  problem: string;
  constraints: Record<string, any>;
  objectives: string[];
  data?: any[];
}

interface OptimizationResult {
  id: string;
  solution: any;
  fitness: number;
  iterations: number;
  convergence: boolean;
  executionTime: number;
}

interface PatternRecognitionRequest {
  id: string;
  data: any[];
  patternType: 'temporal' | 'spatial' | 'frequency' | 'correlation';
  parameters: Record<string, any>;
}

interface PatternRecognitionResult {
  id: string;
  patterns: any[];
  confidence: number;
  insights: string[];
  recommendations: string[];
}

export class ParadoxResolverConnector extends ApplicationConnector {
  private pythonProcess?: any;
  private pythonScript: string;
  private baseUrl: string;
  private isProcessRunning: boolean = false;

  constructor(
    pythonScript: string = '../ParadoxResolver/main.py',
    baseUrl: string = 'http://localhost:8501',
    apiKey?: string
  ) {
    super('ParadoxResolver', 'ExternalApp');
    this.pythonScript = path.resolve(pythonScript);
    this.baseUrl = baseUrl;
  }

  async connect(): Promise<void> {
    try {
      // Start Python Streamlit process if not running
      await this.startPythonProcess();

      // Test REST API connection
      await this.healthCheck();

      this.isConnected = true;
      this.updateHealth({ status: 'healthy' });

      console.log('✅ ParadoxResolver connector connected');
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // Stop Python process
    if (this.pythonProcess) {
      this.pythonProcess.kill();
      this.isProcessRunning = false;
    }

    this.isConnected = false;
    this.updateHealth({ status: 'unhealthy' });

    console.log('✅ ParadoxResolver connector disconnected');
  }

  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      // Check if Python process is running
      if (!this.isProcessRunning) {
        this.updateHealth({
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          message: 'Python process not running'
        });
        return this.healthStatus;
      }

      // Test Streamlit API endpoint
      const response = await fetch(`${this.baseUrl}/_stcore/health`, {
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        this.updateHealth({
          status: 'healthy',
          responseTime,
          errorCount: 0
        });
      } else {
        this.updateHealth({
          status: 'degraded',
          responseTime,
          message: `Streamlit health check failed: ${response.status}`
        });
      }

      return this.healthStatus;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.handleError(error as Error);

      this.updateHealth({
        status: 'unhealthy',
        responseTime,
        message: (error as Error).message
      });

      return this.healthStatus;
    }
  }

  private async startPythonProcess(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`Starting Python process: ${this.pythonScript}`);

        this.pythonProcess = spawn('python', ['-m', 'streamlit', 'run', this.pythonScript], {
          cwd: path.dirname(this.pythonScript),
          stdio: ['pipe', 'pipe', 'pipe'],
          detached: false
        });

        this.pythonProcess.stdout.on('data', (data: Buffer) => {
          const output = data.toString();
          console.log(`ParadoxResolver stdout:`, output);

          // Check if Streamlit is ready
          if (output.includes('You can now view your Streamlit app')) {
            this.isProcessRunning = true;
            resolve();
          }
        });

        this.pythonProcess.stderr.on('data', (data: Buffer) => {
          console.error(`ParadoxResolver stderr:`, data.toString());
        });

        this.pythonProcess.on('close', (code: number) => {
          console.log(`ParadoxResolver process exited with code ${code}`);
          this.isProcessRunning = false;
        });

        this.pythonProcess.on('error', (error) => {
          console.error('Failed to start ParadoxResolver process:', error);
          reject(error);
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          if (!this.isProcessRunning) {
            reject(new Error('Timeout waiting for ParadoxResolver to start'));
          }
        }, 30000);

      } catch (error) {
        console.error('Error starting ParadoxResolver:', error);
        reject(error);
      }
    });
  }

  async sendData(data: any, targetApp?: string): Promise<void> {
    if (!this.isConnected || !this.isProcessRunning) {
      throw new Error('ParadoxResolver connector not connected');
    }

    try {
      // Route data based on type
      if (data.type === 'optimization_request') {
        await this.submitOptimizationRequest(data.request);
      } else if (data.type === 'pattern_recognition') {
        await this.submitPatternRecognition(data.request);
      } else if (data.type === 'data_analysis') {
        await this.submitDataAnalysis(data.analysis);
      } else {
        // Send general data via HTTP API
        await this.sendGeneralData(data);
      }

      this.emit('dataSent', data);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async receiveData(handler: (data: any) => void): Promise<void> {
    // For Python/Streamlit integration, we'll use polling for results
    // In a production system, this might use WebSocket or Server-Sent Events

    this.startResultPolling(handler);
  }

  private async submitOptimizationRequest(request: OptimizationRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to submit optimization request: ${response.statusText}`);
    }
  }

  private async submitPatternRecognition(request: PatternRecognitionRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/patterns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to submit pattern recognition: ${response.statusText}`);
    }
  }

  private async submitDataAnalysis(analysis: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analysis)
    });

    if (!response.ok) {
      throw new Error(`Failed to submit data analysis: ${response.statusText}`);
    }
  }

  private async sendGeneralData(data: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to send general data: ${response.statusText}`);
    }
  }

  private startResultPolling(handler: (data: any) => void): void {
    // Poll for results every 5 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/results`);
        if (response.ok) {
          const results = await response.json();
          results.forEach((result: any) => handler(result));
        }
      } catch (error) {
        this.handleError(error as Error);
      }
    }, 5000);

    // Store interval for cleanup
    (this as any).pollInterval = pollInterval;
  }

  // Application-specific methods

  async solveOptimizationProblem(request: OptimizationRequest): Promise<OptimizationResult> {
    const response = await fetch(`${this.baseUrl}/api/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to solve optimization problem: ${response.statusText}`);
    }

    return response.json();
  }

  async analyzePatterns(request: PatternRecognitionRequest): Promise<PatternRecognitionResult> {
    const response = await fetch(`${this.baseUrl}/api/patterns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze patterns: ${response.statusText}`);
    }

    return response.json();
  }

  async performDataAnalysis(data: any[], analysisType: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data, analysisType })
    });

    if (!response.ok) {
      throw new Error(`Failed to perform data analysis: ${response.statusText}`);
    }

    return response.json();
  }

  async getSystemStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/status`, {
      headers: {}
    });

    if (!response.ok) {
      throw new Error(`Failed to get system status: ${response.statusText}`);
    }

    return response.json();
  }

  async getOptimizationHistory(): Promise<OptimizationResult[]> {
    const response = await fetch(`${this.baseUrl}/api/history/optimization`, {
      headers: {}
    });

    if (!response.ok) {
      throw new Error(`Failed to get optimization history: ${response.statusText}`);
    }

    return response.json();
  }

  async getPatternHistory(): Promise<PatternRecognitionResult[]> {
    const response = await fetch(`${this.baseUrl}/api/history/patterns`, {
      headers: {}
    });

    if (!response.ok) {
      throw new Error(`Failed to get pattern history: ${response.statusText}`);
    }

    return response.json();
  }

  async exportResults(format: 'json' | 'csv' | 'excel' = 'json'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/export?format=${format}`, {
      headers: {}
    });

    if (!response.ok) {
      throw new Error(`Failed to export results: ${response.statusText}`);
    }

    return response.blob();
  }

  async configureSystem(config: Record<string, any>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`Failed to configure system: ${response.statusText}`);
    }
  }
}
