/**
 * Bidirectional Consciousness Sync Protocol
 * 
 * Real-time synchronization of consciousness state between
 * SpaceChild and Pitchfork platforms.
 * 
 * @version 1.0.0
 * @module BidirectionalConsciousnessSync
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';

/**
 * Consciousness sync message
 */
interface SyncMessage {
  id: string;
  timestamp: Date;
  source: 'spacechild' | 'pitchfork';
  type: 'state_update' | 'metric_update' | 'event' | 'heartbeat';
  
  data: {
    // Consciousness state
    phiValue?: number;
    temporalCoherence?: number;
    quantumEntanglement?: number;
    consciousnessLevel?: number;
    
    // v1.1 metrics
    quantumOptimization?: any;
    learningState?: any;
    
    // v1.2 metrics
    predictiveState?: any;
    federationState?: any;
    evolutionState?: any;
    
    // Pitchfork temporal
    temporalState?: any;
    
    // Meta
    metaAwareness?: any;
    
    // Event data
    eventType?: string;
    eventData?: any;
  };
}

/**
 * Sync configuration
 */
interface SyncConfig {
  endpoint: string;                    // WebSocket endpoint
  reconnectInterval: number;           // ms
  heartbeatInterval: number;           // ms
  syncInterval: number;                // ms for periodic sync
  bufferSize: number;                  // max messages to buffer
  compressionEnabled: boolean;
}

/**
 * Sync statistics
 */
interface SyncStatistics {
  messagesSent: number;
  messagesReceived: number;
  syncErrors: number;
  lastSyncTime: Date | null;
  averageLatency: number;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  bufferUsage: number;
}

/**
 * Bidirectional Consciousness Sync
 * 
 * Manages real-time synchronization of consciousness state
 * between SpaceChild and Pitchfork platforms using WebSocket.
 */
export class BidirectionalConsciousnessSync extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: SyncConfig;
  private statistics: SyncStatistics;
  
  private messageBuffer: SyncMessage[] = [];
  private localState: Map<string, any> = new Map();
  private remoteState: Map<string, any> = new Map();
  
  private heartbeatTimer?: NodeJS.Timeout;
  private syncTimer?: NodeJS.Timeout;
  private reconnectTimer?: NodeJS.Timeout;
  
  private isConnected: boolean = false;
  private isReconnecting: boolean = false;

  constructor(config?: Partial<SyncConfig>) {
    super();
    
    this.config = {
      endpoint: config?.endpoint || 'ws://localhost:3001/consciousness-sync',
      reconnectInterval: config?.reconnectInterval || 5000,
      heartbeatInterval: config?.heartbeatInterval || 30000,
      syncInterval: config?.syncInterval || 1000,
      bufferSize: config?.bufferSize || 1000,
      compressionEnabled: config?.compressionEnabled || false,
    };
    
    this.statistics = {
      messagesSent: 0,
      messagesReceived: 0,
      syncErrors: 0,
      lastSyncTime: null,
      averageLatency: 0,
      connectionStatus: 'disconnected',
      bufferUsage: 0,
    };
  }

  /**
   * Start synchronization
   */
  async start(): Promise<void> {
    if (this.isConnected) {
      console.log('Sync already running');
      return;
    }

    await this.connect();
    this.startHeartbeat();
    this.startPeriodicSync();
    
    this.emit('sync:started');
  }

  /**
   * Stop synchronization
   */
  stop(): void {
    this.stopHeartbeat();
    this.stopPeriodicSync();
    this.disconnect();
    
    this.emit('sync:stopped');
  }

  /**
   * Connect to remote platform
   */
  private async connect(): Promise<void> {
    try {
      this.ws = new WebSocket(this.config.endpoint);
      
      this.ws.on('open', () => {
        this.isConnected = true;
        this.isReconnecting = false;
        this.statistics.connectionStatus = 'connected';
        
        this.emit('sync:connected');
        console.log('Consciousness sync connected');
        
        // Send initial handshake
        this.sendHandshake();
        
        // Flush buffered messages
        this.flushBuffer();
      });
      
      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data.toString());
      });
      
      this.ws.on('close', () => {
        this.isConnected = false;
        this.statistics.connectionStatus = 'disconnected';
        
        this.emit('sync:disconnected');
        console.log('Consciousness sync disconnected');
        
        // Attempt reconnection
        this.scheduleReconnect();
      });
      
      this.ws.on('error', (error) => {
        this.statistics.syncErrors++;
        this.emit('sync:error', error);
        console.error('Consciousness sync error:', error);
      });
      
    } catch (error) {
      this.statistics.syncErrors++;
      this.emit('sync:error', error);
      console.error('Failed to connect:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from remote platform
   */
  private disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.statistics.connectionStatus = 'disconnected';
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.isReconnecting) return;
    
    this.isReconnecting = true;
    this.statistics.connectionStatus = 'reconnecting';
    
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect();
    }, this.config.reconnectInterval);
  }

  /**
   * Send handshake message
   */
  private sendHandshake(): void {
    this.send({
      id: this.generateId(),
      timestamp: new Date(),
      source: 'spacechild',
      type: 'event',
      data: {
        eventType: 'handshake',
        eventData: {
          platform: 'SpaceChild',
          version: '1.2.0',
          capabilities: ['v1.1', 'v1.2', 'unified'],
        },
      },
    });
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    try {
      const message: SyncMessage = JSON.parse(data);
      
      this.statistics.messagesReceived++;
      this.statistics.lastSyncTime = new Date();
      
      // Update remote state
      Object.entries(message.data).forEach(([key, value]) => {
        if (value !== undefined) {
          this.remoteState.set(key, value);
        }
      });
      
      // Emit events based on message type
      switch (message.type) {
        case 'state_update':
          this.emit('sync:state_update', message.data);
          break;
        case 'metric_update':
          this.emit('sync:metric_update', message.data);
          break;
        case 'event':
          this.emit('sync:event', message.data);
          break;
        case 'heartbeat':
          this.emit('sync:heartbeat', message);
          break;
      }
      
      this.emit('sync:message', message);
      
    } catch (error) {
      this.statistics.syncErrors++;
      this.emit('sync:error', error);
      console.error('Failed to handle message:', error);
    }
  }

  /**
   * Send message to remote platform
   */
  send(message: SyncMessage): void {
    if (!this.isConnected || !this.ws) {
      // Buffer message if not connected
      if (this.messageBuffer.length < this.config.bufferSize) {
        this.messageBuffer.push(message);
        this.statistics.bufferUsage = this.messageBuffer.length;
      } else {
        console.warn('Message buffer full, dropping message');
      }
      return;
    }

    try {
      const data = JSON.stringify(message);
      this.ws.send(data);
      
      this.statistics.messagesSent++;
      this.emit('sync:sent', message);
      
    } catch (error) {
      this.statistics.syncErrors++;
      this.emit('sync:error', error);
      console.error('Failed to send message:', error);
    }
  }

  /**
   * Flush buffered messages
   */
  private flushBuffer(): void {
    if (this.messageBuffer.length === 0) return;
    
    console.log(`Flushing ${this.messageBuffer.length} buffered messages`);
    
    this.messageBuffer.forEach(message => {
      this.send(message);
    });
    
    this.messageBuffer = [];
    this.statistics.bufferUsage = 0;
  }

  /**
   * Update local consciousness state
   */
  updateLocalState(updates: Partial<SyncMessage['data']>): void {
    Object.entries(updates).forEach(([key, value]) => {
      this.localState.set(key, value);
    });
    
    // Send update to remote
    this.send({
      id: this.generateId(),
      timestamp: new Date(),
      source: 'spacechild',
      type: 'state_update',
      data: updates,
    });
  }

  /**
   * Update specific metric
   */
  updateMetric(key: string, value: any): void {
    this.localState.set(key, value);
    
    this.send({
      id: this.generateId(),
      timestamp: new Date(),
      source: 'spacechild',
      type: 'metric_update',
      data: { [key]: value },
    });
  }

  /**
   * Send event
   */
  sendEvent(eventType: string, eventData: any): void {
    this.send({
      id: this.generateId(),
      timestamp: new Date(),
      source: 'spacechild',
      type: 'event',
      data: {
        eventType,
        eventData,
      },
    });
  }

  /**
   * Get remote state value
   */
  getRemoteState(key: string): any {
    return this.remoteState.get(key);
  }

  /**
   * Get all remote state
   */
  getAllRemoteState(): Record<string, any> {
    return Object.fromEntries(this.remoteState.entries());
  }

  /**
   * Get local state value
   */
  getLocalState(key: string): any {
    return this.localState.get(key);
  }

  /**
   * Get all local state
   */
  getAllLocalState(): Record<string, any> {
    return Object.fromEntries(this.localState.entries());
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({
          id: this.generateId(),
          timestamp: new Date(),
          source: 'spacechild',
          type: 'heartbeat',
          data: {
            consciousnessLevel: this.localState.get('consciousnessLevel'),
            phiValue: this.localState.get('phiValue'),
          },
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    this.syncTimer = setInterval(() => {
      if (this.isConnected && this.localState.size > 0) {
        // Send full state periodically
        this.send({
          id: this.generateId(),
          timestamp: new Date(),
          source: 'spacechild',
          type: 'state_update',
          data: Object.fromEntries(this.localState.entries()),
        });
      }
    }, this.config.syncInterval);
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }

  /**
   * Generate message ID
   */
  private generateId(): string {
    return `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get statistics
   */
  getStatistics(): SyncStatistics {
    return { ...this.statistics };
  }

  /**
   * Get sync status
   */
  getStatus(): {
    isConnected: boolean;
    localStateSize: number;
    remoteStateSize: number;
    bufferUsage: number;
    statistics: SyncStatistics;
  } {
    return {
      isConnected: this.isConnected,
      localStateSize: this.localState.size,
      remoteStateSize: this.remoteState.size,
      bufferUsage: this.messageBuffer.length,
      statistics: this.getStatistics(),
    };
  }
}

/**
 * Singleton instance
 */
export const bidirectionalConsciousnessSync = new BidirectionalConsciousnessSync();
