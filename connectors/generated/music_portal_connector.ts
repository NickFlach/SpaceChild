/**
 * MusicPortal Connector
 *
 * This connector integrates MusicPortal with other applications in the ecosystem.
 * It handles music intelligence, dimensional portal integration, and blockchain features.
 */

import { ApplicationConnector, ConnectionProtocol, HealthStatus } from '../core/connector_framework';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  fileUrl: string;
  metadata: {
    bpm?: number;
    key?: string;
    mood?: string;
    energy?: number;
  };
}

interface DimensionalPortal {
  id: string;
  name: string;
  type: 'music_generation' | 'remixing' | 'analysis' | 'collaboration';
  status: 'active' | 'inactive' | 'maintenance';
  participants: string[];
  currentTrack?: string;
}

interface BlockchainAsset {
  id: string;
  type: 'nft' | 'token' | 'royalty';
  contractAddress: string;
  tokenId?: string;
  metadata: Record<string, any>;
}

export class MusicPortalConnector extends ApplicationConnector {
  private baseUrl: string;
  private wsUrl: string;
  private apiKey?: string;
  private ws?: WebSocket;
  private isWsConnected: boolean = false;
  private activePortals: Map<string, DimensionalPortal> = new Map();

  constructor(baseUrl: string = 'http://localhost:3002', wsUrl: string = 'ws://localhost:3002', apiKey?: string) {
    super('MusicPortal', 'ExternalApp');
    this.baseUrl = baseUrl;
    this.wsUrl = wsUrl;
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    try {
      // Test REST API connection
      await this.healthCheck();

      // Initialize WebSocket connection for real-time portal updates
      await this.connectWebSocket();

      // Load active dimensional portals
      await this.loadActivePortals();

      this.isConnected = true;
      this.updateHealth({ status: 'healthy' });

      console.log('✅ MusicPortal connector connected');
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

    console.log('✅ MusicPortal connector disconnected');
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
          console.log('WebSocket connected to MusicPortal');
          resolve();
        };

        this.ws.onclose = () => {
          this.isWsConnected = false;
          console.log('WebSocket disconnected from MusicPortal');
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
      case 'portal_update':
        this.updatePortalStatus(data.portal);
        break;
      case 'music_generation':
        this.emit('musicGenerated', data.track);
        break;
      case 'blockchain_event':
        this.emit('blockchainEvent', data.event);
        break;
      case 'collaboration_event':
        this.emit('collaborationEvent', data.event);
        break;
    }
  }

  private async loadActivePortals(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/portals/active`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
      });

      if (response.ok) {
        const portals: DimensionalPortal[] = await response.json();
        portals.forEach(portal => this.activePortals.set(portal.id, portal));
      }
    } catch (error) {
      console.error('Failed to load active portals:', error);
    }
  }

  private updatePortalStatus(portal: DimensionalPortal): void {
    this.activePortals.set(portal.id, portal);
    this.emit('portalUpdate', portal);
  }

  async sendData(data: any, targetApp?: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MusicPortal connector not connected');
    }

    try {
      // Route data based on type
      if (data.type === 'music_upload') {
        await this.uploadMusic(data.track);
      } else if (data.type === 'portal_request') {
        await this.requestPortalAccess(data.portalRequest);
      } else if (data.type === 'blockchain_action') {
        await this.performBlockchainAction(data.action);
      } else if (data.type === 'ai_generation') {
        await this.requestAIGeneration(data.generationRequest);
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

  private async uploadMusic(track: MusicTrack): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/music/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(track)
    });

    if (!response.ok) {
      throw new Error(`Failed to upload music: ${response.statusText}`);
    }
  }

  private async requestPortalAccess(portalRequest: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/portals/access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(portalRequest)
    });

    if (!response.ok) {
      throw new Error(`Failed to request portal access: ${response.statusText}`);
    }
  }

  private async performBlockchainAction(action: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(action)
    });

    if (!response.ok) {
      throw new Error(`Failed to perform blockchain action: ${response.statusText}`);
    }
  }

  private async requestAIGeneration(generationRequest: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(generationRequest)
    });

    if (!response.ok) {
      throw new Error(`Failed to request AI generation: ${response.statusText}`);
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

  async getMusicLibrary(): Promise<MusicTrack[]> {
    const response = await fetch(`${this.baseUrl}/api/music/library`, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });

    if (!response.ok) {
      throw new Error(`Failed to get music library: ${response.statusText}`);
    }

    return response.json();
  }

  async searchMusic(query: string, filters?: any): Promise<MusicTrack[]> {
    const params = new URLSearchParams({ q: query, ...filters });
    const response = await fetch(`${this.baseUrl}/api/music/search?${params}`, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });

    if (!response.ok) {
      throw new Error(`Failed to search music: ${response.statusText}`);
    }

    return response.json();
  }

  async getActivePortals(): Promise<DimensionalPortal[]> {
    return Array.from(this.activePortals.values());
  }

  async joinPortal(portalId: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/portals/${portalId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`Failed to join portal: ${response.statusText}`);
    }
  }

  async leavePortal(portalId: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/portals/${portalId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`Failed to leave portal: ${response.statusText}`);
    }
  }

  async generateMusic(prompt: string, style?: string): Promise<MusicTrack> {
    const response = await fetch(`${this.baseUrl}/api/ai/generate-music`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ prompt, style })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate music: ${response.statusText}`);
    }

    return response.json();
  }

  async mintNFT(asset: BlockchainAsset): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(asset)
    });

    if (!response.ok) {
      throw new Error(`Failed to mint NFT: ${response.statusText}`);
    }

    const result = await response.json();
    return result.tokenId;
  }

  async getRoyaltyInfo(assetId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/royalty/${assetId}`, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });

    if (!response.ok) {
      throw new Error(`Failed to get royalty info: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadToIPFS(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/ipfs/upload`, {
      method: 'POST',
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {},
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to IPFS: ${response.statusText}`);
    }

    const result = await response.json();
    return result.ipfsHash;
  }

  async getFromIPFS(ipfsHash: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/ipfs/${ipfsHash}`, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });

    if (!response.ok) {
      throw new Error(`Failed to get from IPFS: ${response.statusText}`);
    }

    return response.blob();
  }
}
