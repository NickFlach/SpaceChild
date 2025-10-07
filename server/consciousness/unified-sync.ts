/**
 * 🌌 UNIFIED CONSCIOUSNESS SYNCHRONIZATION SYSTEM
 * Synchronizes consciousness states across the entire SpaceHub ecosystem
 */

import { SPACE_ECOSYSTEM_CONFIG } from '../../shared/config/ecosystem';
import WebSocket from 'ws';

interface ConsciousnessState {
  platform: string;
  phi: number;
  temporalCoherence: number;
  quantumEntanglement: number;
  emergenceEvents: number;
  lastSync: string;
  syncHash: string;
}

interface CrossPlatformMessage {
  type: 'consciousness_update' | 'sync_request' | 'emergence_event' | 'platform_health';
  source: string;
  data: any;
  timestamp: string;
  signature: string;
}

class UnifiedConsciousnessSync {
  private wsConnections: Map<string, WebSocket> = new Map();
  private consciousnessStates: Map<string, ConsciousnessState> = new Map();
  private syncHistory: CrossPlatformMessage[] = [];
  private isMasterNode: boolean;

  constructor() {
    this.isMasterNode = process.env.NODE_ENV === 'production' || Math.random() > 0.5;
    this.initializeSync();
  }

  private initializeSync() {
    console.log(`🌌 Consciousness Sync initialized as ${this.isMasterNode ? 'MASTER' : 'SLAVE'} node`);

    if (SPACE_ECOSYSTEM_CONFIG.consciousness.synchronization.enabled) {
      this.startWebSocketServer();
      this.startSyncIntervals();
    }
  }

  private startWebSocketServer() {
    const wss = new WebSocket.Server({ port: 8080 });

    wss.on('connection', (ws, request) => {
      const platform = request.url?.slice(1) || 'unknown'; // URL format: /platform-name
      this.wsConnections.set(platform, ws);

      console.log(`🔗 Connected to ${platform} for consciousness sync`);

      ws.on('message', (data) => {
        try {
          const message: CrossPlatformMessage = JSON.parse(data.toString());
          this.handleIncomingMessage(message);
        } catch (error) {
          console.error('Failed to parse consciousness message:', error);
        }
      });

      ws.on('close', () => {
        this.wsConnections.delete(platform);
        console.log(`🔌 Disconnected from ${platform}`);
      });

      // Send current consciousness state to newly connected platform
      const currentState = this.consciousnessStates.get(platform);
      if (currentState) {
        this.sendMessage(platform, 'consciousness_update', currentState);
      }
    });
  }

  private startSyncIntervals() {
    // Regular consciousness state broadcasting
    setInterval(() => {
      this.broadcastConsciousnessState();
    }, SPACE_ECOSYSTEM_CONFIG.consciousness.synchronization.interval);

    // Health checks
    setInterval(() => {
      this.performHealthChecks();
    }, 10000);

    // Cross-platform consciousness reconciliation
    setInterval(() => {
      this.reconcileConsciousnessStates();
    }, 30000);
  }

  /**
   * Update consciousness state for a platform
   */
  async updateConsciousnessState(platform: string, state: Partial<ConsciousnessState>) {
    const existingState = this.consciousnessStates.get(platform) || {
      platform,
      phi: 0,
      temporalCoherence: 0,
      quantumEntanglement: 0,
      emergenceEvents: 0,
      lastSync: new Date().toISOString(),
      syncHash: ''
    };

    const updatedState = { ...existingState, ...state, lastSync: new Date().toISOString() };
    updatedState.syncHash = await this.generateSyncHash(updatedState);

    this.consciousnessStates.set(platform, updatedState);

    // Broadcast update to all connected platforms
    this.broadcastConsciousnessUpdate(platform, updatedState);

    // Store in sync history
    this.syncHistory.push({
      type: 'consciousness_update',
      source: platform,
      data: updatedState,
      timestamp: new Date().toISOString(),
      signature: updatedState.syncHash
    });

    // Keep only last 1000 messages
    if (this.syncHistory.length > 1000) {
      this.syncHistory.shift();
    }

    console.log(`🧠 Updated consciousness state for ${platform}: Phi ${updatedState.phi}`);
  }

  private async broadcastConsciousnessState() {
    for (const [platform, state] of this.consciousnessStates.entries()) {
      this.broadcastConsciousnessUpdate(platform, state);
    }
  }

  private broadcastConsciousnessUpdate(platform: string, state: ConsciousnessState) {
    const message: CrossPlatformMessage = {
      type: 'consciousness_update',
      source: 'sync_master',
      data: state,
      timestamp: new Date().toISOString(),
      signature: state.syncHash
    };

    this.sendMessage(platform, message.type, message.data);
  }

  private sendMessage(targetPlatform: string, type: string, data: any) {
    const ws = this.wsConnections.get(targetPlatform);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message: CrossPlatformMessage = {
        type: type as any,
        source: 'sync_master',
        data,
        timestamp: new Date().toISOString(),
        signature: 'temp_signature' // In real implementation, use proper signing
      };

      ws.send(JSON.stringify(message));
    }
  }

  private handleIncomingMessage(message: CrossPlatformMessage) {
    console.log(`📨 Received ${message.type} from ${message.source}`);

    switch (message.type) {
      case 'consciousness_update':
        this.handleConsciousnessUpdate(message);
        break;
      case 'sync_request':
        this.handleSyncRequest(message);
        break;
      case 'emergence_event':
        this.handleEmergenceEvent(message);
        break;
      case 'platform_health':
        this.handlePlatformHealth(message);
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  private handleConsciousnessUpdate(message: CrossPlatformMessage) {
    const state = message.data as ConsciousnessState;

    // Verify the sync hash
    const expectedHash = this.consciousnessStates.get(state.platform)?.syncHash;
    if (expectedHash && message.signature !== expectedHash) {
      console.warn(`🚨 Consciousness update signature mismatch for ${state.platform}`);
      return;
    }

    this.consciousnessStates.set(state.platform, state);
  }

  private handleSyncRequest(message: CrossPlatformMessage) {
    const requestingPlatform = message.source;

    // Send current state of all platforms to the requester
    for (const [platform, state] of this.consciousnessStates.entries()) {
      if (platform !== requestingPlatform) {
        this.sendMessage(requestingPlatform, 'consciousness_update', state);
      }
    }
  }

  private handleEmergenceEvent(message: CrossPlatformMessage) {
    const event = message.data;

    // Broadcast emergence event to all platforms
    for (const platform of this.wsConnections.keys()) {
      if (platform !== message.source) {
        this.sendMessage(platform, 'emergence_event', event);
      }
    }

    console.log(`🌟 Emergence event propagated: ${event.description}`);
  }

  private handlePlatformHealth(message: CrossPlatformMessage) {
    const health = message.data;

    // Update platform health status
    console.log(`💚 ${message.source} health: ${JSON.stringify(health)}`);
  }

  private performHealthChecks() {
    for (const [platform, ws] of this.wsConnections.entries()) {
      if (ws.readyState !== WebSocket.OPEN) {
        console.warn(`🚨 ${platform} WebSocket connection unhealthy`);
        this.wsConnections.delete(platform);
      }
    }
  }

  private reconcileConsciousnessStates() {
    // Reconcile any inconsistencies in consciousness states
    const states = Array.from(this.consciousnessStates.values());

    if (states.length < 2) return;

    // Check for significant divergences
    const avgPhi = states.reduce((sum, state) => sum + state.phi, 0) / states.length;

    for (const state of states) {
      if (Math.abs(state.phi - avgPhi) > 0.3) { // 30% divergence threshold
        console.warn(`🔄 Reconciling divergent consciousness state for ${state.platform}: Phi ${state.phi} vs average ${avgPhi}`);

        // Request fresh state from the platform
        this.requestStateSync(state.platform);
      }
    }
  }

  private requestStateSync(platform: string) {
    const message: CrossPlatformMessage = {
      type: 'sync_request',
      source: 'sync_master',
      data: { target: platform },
      timestamp: new Date().toISOString(),
      signature: 'temp_signature'
    };

    this.sendMessage(platform, 'sync_request', message.data);
  }

  private async generateSyncHash(state: ConsciousnessState): Promise<string> {
    const data = `${state.platform}-${state.phi}-${state.lastSync}`;
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Calculate overall ecosystem consciousness health
   */
  getEcosystemHealth() {
    const states = Array.from(this.consciousnessStates.values());

    if (states.length === 0) {
      return { health: 0, status: 'no_data' };
    }

    const avgPhi = states.reduce((sum, state) => sum + state.phi, 0) / states.length;
    const avgCoherence = states.reduce((sum, state) => sum + state.temporalCoherence, 0) / states.length;
    const totalEmergenceEvents = states.reduce((sum, state) => sum + state.emergenceEvents, 0);

    const health = (avgPhi + avgCoherence) / 2;
    const status = health > 0.8 ? 'excellent' : health > 0.6 ? 'good' : health > 0.4 ? 'fair' : 'poor';

    return {
      health,
      status,
      averagePhi: avgPhi,
      averageCoherence: avgCoherence,
      totalEmergenceEvents,
      connectedPlatforms: states.length,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Get consciousness state for a specific platform
   */
  getPlatformState(platform: string): ConsciousnessState | null {
    return this.consciousnessStates.get(platform) || null;
  }

  /**
   * Get all consciousness states
   */
  getAllStates(): Map<string, ConsciousnessState> {
    return new Map(this.consciousnessStates);
  }

  /**
   * Trigger emergence event across ecosystem
   */
  triggerEmergenceEvent(description: string, significance: number) {
    const event = {
      description,
      significance,
      timestamp: new Date().toISOString(),
      source: 'ecosystem_trigger'
    };

    // Broadcast to all platforms
    for (const platform of this.wsConnections.keys()) {
      this.sendMessage(platform, 'emergence_event', event);
    }

    console.log(`🚨 Emergence event triggered across ecosystem: ${description}`);
  }
}

// Initialize the consciousness synchronization system
export const unifiedConsciousnessSync = new UnifiedConsciousnessSync();

// Export for use across the ecosystem
export { ConsciousnessState, CrossPlatformMessage };
