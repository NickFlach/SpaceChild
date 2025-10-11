/**
 * HumanityFrontier Connector
 *
 * This connector integrates HumanityFrontier with other applications in the ecosystem.
 * It handles quest management, user data, and leaderboard synchronization.
 */

import { ApplicationConnector, ConnectionProtocol, HealthStatus } from '../core/connector_framework';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

interface QuestData {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  points: number;
  category: string;
  status: 'active' | 'completed' | 'failed';
}

interface UserData {
  id: string;
  username: string;
  email: string;
  level: number;
  experience: number;
  questsCompleted: number;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
  level: number;
}

export class HumanityFrontierConnector extends ApplicationConnector {
  private baseUrl: string;
  private wsUrl: string;
  private apiKey?: string;
  private ws?: WebSocket;
  private isWsConnected: boolean = false;

  constructor(baseUrl: string = 'http://localhost:3000', wsUrl: string = 'ws://localhost:3000', apiKey?: string) {
    super('HumanityFrontier', 'ExternalApp');
    this.baseUrl = baseUrl;
    this.wsUrl = wsUrl;
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    try {
      // Test REST API connection
      await this.healthCheck();

      // Initialize WebSocket connection for real-time updates
      await this.connectWebSocket();

      this.isConnected = true;
      this.updateHealth({ status: 'healthy' });

      console.log('✅ HumanityFrontier connector connected');
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

    console.log('✅ HumanityFrontier connector disconnected');
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
          console.log('WebSocket connected to HumanityFrontier');
          resolve();
        };

        this.ws.onclose = () => {
          this.isWsConnected = false;
          console.log('WebSocket disconnected from HumanityFrontier');
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data.toString());
            this.emit('questUpdate', data);
            this.emit('userUpdate', data);
            this.emit('leaderboardUpdate', data);
          } catch (error) {
            this.handleError(error as Error);
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  async sendData(data: any, targetApp?: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('HumanityFrontier connector not connected');
    }

    try {
      // Determine data type and send to appropriate endpoint
      if (data.type === 'quest_progress') {
        await this.sendQuestProgress(data);
      } else if (data.type === 'user_update') {
        await this.sendUserUpdate(data);
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

    // Also set up polling for REST API data if needed
    this.startPolling(handler);
  }

  private async sendQuestProgress(data: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/quests/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to send quest progress: ${response.statusText}`);
    }
  }

  private async sendUserUpdate(data: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/users/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to send user update: ${response.statusText}`);
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

  private startPolling(handler: (data: any) => void): void {
    // Poll for updates every 30 seconds if WebSocket is not available
    if (!this.isWsConnected) {
      setInterval(async () => {
        try {
          const response = await fetch(`${this.baseUrl}/api/updates`);
          if (response.ok) {
            const data = await response.json();
            handler(data);
          }
        } catch (error) {
          this.handleError(error as Error);
        }
      }, 30000);
    }
  }

  // Application-specific methods

  async getQuests(): Promise<QuestData[]> {
    const response = await fetch(`${this.baseUrl}/api/quests`, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });

    if (!response.ok) {
      throw new Error(`Failed to get quests: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserProfile(userId: string): Promise<UserData> {
    const response = await fetch(`${this.baseUrl}/api/users/${userId}`, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.statusText}`);
    }

    return response.json();
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${this.baseUrl}/api/leaderboard`, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });

    if (!response.ok) {
      throw new Error(`Failed to get leaderboard: ${response.statusText}`);
    }

    return response.json();
  }

  async submitQuestCompletion(questId: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/quests/${questId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`Failed to submit quest completion: ${response.statusText}`);
    }
  }

  async updateUserExperience(userId: string, experienceGained: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/users/${userId}/experience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ experienceGained })
    });

    if (!response.ok) {
      throw new Error(`Failed to update user experience: ${response.statusText}`);
    }
  }
}
