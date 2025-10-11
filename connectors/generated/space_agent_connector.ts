/**
 * SpaceAgent Connector
 *
 * This connector integrates SpaceAgent with other applications in the ecosystem.
 * It handles multi-agent orchestration, AI model endpoints, and Web3 integration.
 */

import { ApplicationConnector, ConnectionProtocol, HealthStatus } from '../core/connector_framework';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

interface AgentTask {
  id: string;
  type: 'analysis' | 'generation' | 'review' | 'testing' | 'deployment';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgent?: string;
  result?: any;
}

interface AgentInfo {
  id: string;
  name: string;
  type: 'orchestrator' | 'frontend_expert' | 'backend_architect' | 'security_analyst' | 'performance_optimizer' | 'testing_engineer';
  status: 'available' | 'busy' | 'offline';
  capabilities: string[];
  currentTasks: string[];
}

interface IntelligenceData {
  type: 'code_analysis' | 'performance_metrics' | 'security_scan' | 'collaboration_insights';
  data: any;
  timestamp: string;
  source: string;
}

export class SpaceAgentConnector extends ApplicationConnector {
  private baseUrl: string;
  private wsUrl: string;
  private apiKey?: string;
  private ws?: WebSocket;
  private isWsConnected: boolean = false;
  private agents: Map<string, AgentInfo> = new Map();

  constructor(baseUrl: string = 'http://localhost:3001', wsUrl: string = 'ws://localhost:3001', apiKey?: string) {
    super('SpaceAgent', 'ExternalApp');
    this.baseUrl = baseUrl;
    this.wsUrl = wsUrl;
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    try {
      // Test REST API connection
      await this.healthCheck();

      // Initialize WebSocket connection for real-time agent communication
      await this.connectWebSocket();

      // Load available agents
      await this.loadAgents();

      this.isConnected = true;
      this.updateHealth({ status: 'healthy' });

      console.log('✅ SpaceAgent connector connected');
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.isWsConnected = false;
    }

    this.isConnected = false;
    this.updateHealth({ status: 'unhealthy' });

    console.log('✅ SpaceAgent connector disconnected');
  }

  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
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
          message: `HTTP ${response.status}`
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

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this.isWsConnected = true;
          console.log('WebSocket connected to SpaceAgent');
          resolve();
        };

        this.ws.onclose = () => {
          this.isWsConnected = false;
          console.log('WebSocket disconnected from SpaceAgent');
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data.toString());
            this.handleWebSocketMessage(data);
          } catch (error) {
            this.handleError(error as Error);
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'agent_status_update':
        this.updateAgentStatus(data.agent);
        break;
      case 'task_update':
        this.emit('taskUpdate', data.task);
        break;
      case 'intelligence_update':
        this.emit('intelligenceUpdate', data.intelligence);
        break;
      case 'collaboration_event':
        this.emit('collaborationEvent', data.event);
        break;
    }
  }

  private async loadAgents(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
      });

      if (response.ok) {
        const agents: AgentInfo[] = await response.json();
        agents.forEach(agent => this.agents.set(agent.id, agent));
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }

  private updateAgentStatus(agentInfo: AgentInfo): void {
    this.agents.set(agentInfo.id, agentInfo);
    this.emit('agentStatusUpdate', agentInfo);
  }

  async sendData(data: any, targetApp?: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('SpaceAgent connector not connected');
    }

    try {
      // Route data based on type
      if (data.type === 'task_request') {
        await this.submitTask(data.task);
      } else if (data.type === 'intelligence_request') {
        await this.requestIntelligence(data.request);
      } else if (data.type === 'collaboration_request') {
        await this.requestCollaboration(data.request);
      } else {
        // Send general data to the main API endpoint
        await this.sendGeneralData(data);
      }

      this.emit('dataSent', data);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async receiveData(handler: (data: any) => void): Promise<void> {
    // Set up WebSocket message handler
    if (this.ws) {
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data.toString());
          handler(data);
        } catch (error) {
          this.handleError(error as Error);
        }
      };
    }
  }

  private async submitTask(task: AgentTask): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(task)
    });

    if (!response.ok) {
      throw new Error(`Failed to submit task: ${response.statusText}`);
    }
  }

  private async requestIntelligence(request: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/intelligence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to request intelligence: ${response.statusText}`);
    }
  }

  private async requestCollaboration(request: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/collaboration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to request collaboration: ${response.statusText}`);
    }
  }

  private async sendGeneralData(data: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to send general data: ${response.statusText}`);
    }
  }

  // Application-specific methods

  async getAvailableAgents(): Promise<AgentInfo[]> {
    return Array.from(this.agents.values()).filter(agent => agent.status === 'available');
  }

  async assignTask(task: AgentTask, agentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${task.id}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ agentId })
    });

    if (!response.ok) {
      throw new Error(`Failed to assign task: ${response.statusText}`);
    }
  }

  async getTaskStatus(taskId: string): Promise<AgentTask> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}`, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });

    if (!response.ok) {
      throw new Error(`Failed to get task status: ${response.statusText}`);
    }

    return response.json();
  }

  async requestCodeAnalysis(code: string, analysisType: string): Promise<IntelligenceData> {
    const response = await fetch(`${this.baseUrl}/api/intelligence/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ code, analysisType })
    });

    if (!response.ok) {
      throw new Error(`Failed to request code analysis: ${response.statusText}`);
    }

    return response.json();
  }

  async requestPerformanceOptimization(code: string, targetMetric: string): Promise<IntelligenceData> {
    const response = await fetch(`${this.baseUrl}/api/intelligence/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ code, targetMetric })
    });

    if (!response.ok) {
      throw new Error(`Failed to request performance optimization: ${response.statusText}`);
    }

    return response.json();
  }

  async requestSecurityReview(code: string, securityLevel: string): Promise<IntelligenceData> {
    const response = await fetch(`${this.baseUrl}/api/intelligence/security`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ code, securityLevel })
    });

    if (!response.ok) {
      throw new Error(`Failed to request security review: ${response.statusText}`);
    }

    return response.json();
  }

  async initiateCollaboration(projectId: string, participants: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/collaboration/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ projectId, participants })
    });

    if (!response.ok) {
      throw new Error(`Failed to initiate collaboration: ${response.statusText}`);
    }
  }

  // Web3 integration methods

  async deploySmartContract(contractCode: string, network: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/web3/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ contractCode, network })
    });

    if (!response.ok) {
      throw new Error(`Failed to deploy smart contract: ${response.statusText}`);
    }

    const result = await response.json();
    return result.contractAddress;
  }

  async queryBlockchain(query: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/web3/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`Failed to query blockchain: ${response.statusText}`);
    }

    return response.json();
  }
}
