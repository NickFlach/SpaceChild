/**
 * Application Orchestration Layer
 *
 * This module manages the connections and data flow between all applications
 * in the ecosystem using the connector framework.
 */

import { EventEmitter } from 'events';
import { ApplicationConnector, ConnectorConfig, ConnectionProtocol } from './core/connector_framework';
import { HumanityFrontierConnector } from './generated/humanity_frontier_connector';
import { SpaceAgentConnector } from './generated/space_agent_connector';
import { MusicPortalConnector } from './generated/music_portal_connector';
import { ParadoxResolverConnector } from './generated/paradox_resolver_connector';

interface DataFlow {
  id: string;
  sourceApp: string;
  targetApp: string;
  dataType: string;
  transformation?: (data: any) => any;
  frequency: 'real_time' | 'batch' | 'scheduled';
  enabled: boolean;
}

interface ApplicationNode {
  name: string;
  connector: ApplicationConnector;
  status: 'connected' | 'disconnected' | 'error';
  dataFlows: DataFlow[];
  lastActivity: Date;
}

export class ApplicationOrchestrator extends EventEmitter {
  private applications: Map<string, ApplicationNode> = new Map();
  private dataFlows: Map<string, DataFlow> = new Map();
  private isRunning: boolean = false;

  constructor() {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle connector events and propagate them
    this.applications.forEach((node, appName) => {
      node.connector.on('dataReceived', (data) => {
        this.handleIncomingData(appName, data);
      });

      node.connector.on('healthChanged', (health) => {
        this.updateApplicationStatus(appName, health.status);
      });

      node.connector.on('error', (error) => {
        this.handleConnectorError(appName, error);
      });
    });
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Application Orchestrator...');

    // Initialize all application connectors
    await this.initializeConnectors();

    // Set up data flows between applications
    await this.setupDataFlows();

    this.isRunning = true;
    console.log('✅ Application Orchestrator initialized');
  }

  private async initializeConnectors(): Promise<void> {
    // Initialize HumanityFrontier connector
    const humanityConnector = new HumanityFrontierConnector();
    await this.registerApplication('HumanityFrontier', humanityConnector);

    // Initialize SpaceAgent connector
    const spaceAgentConnector = new SpaceAgentConnector();
    await this.registerApplication('SpaceAgent', spaceAgentConnector);

    // Initialize MusicPortal connector
    const musicPortalConnector = new MusicPortalConnector();
    await this.registerApplication('MusicPortal', musicPortalConnector);

    // Initialize ParadoxResolver connector
    const paradoxConnector = new ParadoxResolverConnector();
    await this.registerApplication('ParadoxResolver', paradoxConnector);

    // Connect all applications
    await this.connectAllApplications();
  }

  private async registerApplication(name: string, connector: ApplicationConnector): Promise<void> {
    const node: ApplicationNode = {
      name,
      connector,
      status: 'disconnected',
      dataFlows: [],
      lastActivity: new Date()
    };

    this.applications.set(name, node);
    console.log(`📋 Registered application: ${name}`);
  }

  private async connectAllApplications(): Promise<void> {
    console.log('🔗 Connecting all applications...');

    for (const [name, node] of this.applications) {
      try {
        await node.connector.connect();
        node.status = 'connected';
        node.lastActivity = new Date();
        console.log(`✅ Connected: ${name}`);
      } catch (error) {
        console.error(`❌ Failed to connect ${name}:`, error);
        node.status = 'error';
      }
    }
  }

  private async setupDataFlows(): Promise<void> {
    console.log('🌊 Setting up data flows...');

    // Define data flows between applications
    const flows: DataFlow[] = [
      // HumanityFrontier flows
      {
        id: 'hf_to_sa',
        sourceApp: 'HumanityFrontier',
        targetApp: 'SpaceAgent',
        dataType: 'quest_progress',
        frequency: 'real_time',
        enabled: true
      },
      {
        id: 'hf_to_mp',
        sourceApp: 'HumanityFrontier',
        targetApp: 'MusicPortal',
        dataType: 'user_engagement',
        frequency: 'batch',
        enabled: true
      },

      // SpaceAgent flows
      {
        id: 'sa_to_hf',
        sourceApp: 'SpaceAgent',
        targetApp: 'HumanityFrontier',
        dataType: 'ai_insights',
        frequency: 'real_time',
        enabled: true
      },
      {
        id: 'sa_to_pr',
        sourceApp: 'SpaceAgent',
        targetApp: 'ParadoxResolver',
        dataType: 'pattern_data',
        frequency: 'scheduled',
        enabled: true
      },

      // MusicPortal flows
      {
        id: 'mp_to_sa',
        sourceApp: 'MusicPortal',
        targetApp: 'SpaceAgent',
        dataType: 'music_analysis',
        frequency: 'real_time',
        enabled: true
      },
      {
        id: 'mp_to_pr',
        sourceApp: 'MusicPortal',
        targetApp: 'ParadoxResolver',
        dataType: 'audio_patterns',
        frequency: 'batch',
        enabled: true
      },

      // ParadoxResolver flows
      {
        id: 'pr_to_sa',
        sourceApp: 'ParadoxResolver',
        targetApp: 'SpaceAgent',
        dataType: 'optimization_results',
        frequency: 'scheduled',
        enabled: true
      }
    ];

    flows.forEach(flow => {
      this.dataFlows.set(flow.id, flow);
      const sourceNode = this.applications.get(flow.sourceApp);
      if (sourceNode) {
        sourceNode.dataFlows.push(flow);
      }
    });

    console.log(`✅ Set up ${flows.length} data flows`);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Orchestrator is already running');
      return;
    }

    console.log('▶️ Starting Application Orchestrator...');

    // Start all data flows
    for (const flow of this.dataFlows.values()) {
      if (flow.enabled) {
        await this.startDataFlow(flow);
      }
    }

    this.isRunning = true;
    console.log('✅ Application Orchestrator started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('⚠️ Orchestrator is not running');
      return;
    }

    console.log('⏹️ Stopping Application Orchestrator...');

    // Stop all data flows
    for (const flow of this.dataFlows.values()) {
      await this.stopDataFlow(flow);
    }

    // Disconnect all applications
    for (const [name, node] of this.applications) {
      try {
        await node.connector.disconnect();
        node.status = 'disconnected';
      } catch (error) {
        console.error(`Error disconnecting ${name}:`, error);
      }
    }

    this.isRunning = false;
    console.log('✅ Application Orchestrator stopped');
  }

  private async startDataFlow(flow: DataFlow): Promise<void> {
    console.log(`🌊 Starting data flow: ${flow.sourceApp} → ${flow.targetApp}`);

    const sourceNode = this.applications.get(flow.sourceApp);
    const targetNode = this.applications.get(flow.targetApp);

    if (!sourceNode || !targetNode) {
      console.error(`❌ Cannot start flow ${flow.id}: missing applications`);
      return;
    }

    // Set up data handler for the flow
    const dataHandler = async (data: any) => {
      if (data.type === flow.dataType || !flow.dataType || data.type?.includes(flow.dataType)) {
        await this.routeData(flow, data);
      }
    };

    // Subscribe to data from source application
    await sourceNode.connector.receiveData(dataHandler);

    console.log(`✅ Started data flow: ${flow.id}`);
  }

  private async stopDataFlow(flow: DataFlow): Promise<void> {
    console.log(`⏹️ Stopping data flow: ${flow.id}`);
    // In a real implementation, this would unsubscribe from data handlers
  }

  private async routeData(flow: DataFlow, data: any): Promise<void> {
    const sourceNode = this.applications.get(flow.sourceApp);
    const targetNode = this.applications.get(flow.targetApp);

    if (!sourceNode || !targetNode) {
      console.error(`❌ Cannot route data for flow ${flow.id}: missing applications`);
      return;
    }

    try {
      // Apply data transformation if specified
      let transformedData = data;
      if (flow.transformation) {
        transformedData = flow.transformation(data);
      }

      // Add metadata for routing
      const routedData = {
        ...transformedData,
        _sourceApp: flow.sourceApp,
        _targetApp: flow.targetApp,
        _flowId: flow.id,
        _timestamp: new Date().toISOString()
      };

      // Send data to target application
      await targetNode.connector.sendData(routedData);

      // Update activity timestamp
      sourceNode.lastActivity = new Date();

      this.emit('dataRouted', { flow, data: routedData });

    } catch (error) {
      console.error(`❌ Failed to route data for flow ${flow.id}:`, error);
      this.emit('routingError', { flow, error, data });
    }
  }

  private handleIncomingData(sourceApp: string, data: any): void {
    // Update activity timestamp
    const node = this.applications.get(sourceApp);
    if (node) {
      node.lastActivity = new Date();
    }

    this.emit('dataReceived', { sourceApp, data });
  }

  private updateApplicationStatus(appName: string, status: string): void {
    const node = this.applications.get(appName);
    if (node) {
      node.status = status as any;
      this.emit('applicationStatusChanged', { appName, status });
    }
  }

  private handleConnectorError(appName: string, error: Error): void {
    console.error(`❌ Connector error in ${appName}:`, error);
    this.emit('connectorError', { appName, error });
  }

  // Public API methods

  getApplicationStatus(appName: string): any {
    const node = this.applications.get(appName);
    if (!node) {
      return null;
    }

    return {
      name: node.name,
      status: node.status,
      lastActivity: node.lastActivity,
      dataFlows: node.dataFlows.length,
      health: node.connector.healthCheck()
    };
  }

  getAllApplicationStatuses(): Record<string, any> {
    const statuses: Record<string, any> = {};

    for (const [name, node] of this.applications) {
      statuses[name] = this.getApplicationStatus(name);
    }

    return statuses;
  }

  getDataFlowStatus(flowId: string): any {
    const flow = this.dataFlows.get(flowId);
    if (!flow) {
      return null;
    }

    const sourceNode = this.applications.get(flow.sourceApp);
    const targetNode = this.applications.get(flow.targetApp);

    return {
      id: flow.id,
      sourceApp: flow.sourceApp,
      targetApp: flow.targetApp,
      dataType: flow.dataType,
      frequency: flow.frequency,
      enabled: flow.enabled,
      sourceStatus: sourceNode?.status,
      targetStatus: targetNode?.status
    };
  }

  async sendDataToApplication(targetApp: string, data: any): Promise<void> {
    const node = this.applications.get(targetApp);
    if (!node) {
      throw new Error(`Application ${targetApp} not found`);
    }

    await node.connector.sendData(data);
  }

  async broadcastData(data: any): Promise<void> {
    const promises = Array.from(this.applications.values())
      .filter(node => node.status === 'connected')
      .map(node => node.connector.sendData(data));

    await Promise.allSettled(promises);
  }

  getSystemHealth(): any {
    const connectedApps = Array.from(this.applications.values())
      .filter(node => node.status === 'connected').length;

    const totalApps = this.applications.size;
    const activeFlows = Array.from(this.dataFlows.values())
      .filter(flow => flow.enabled).length;

    return {
      totalApplications: totalApps,
      connectedApplications: connectedApps,
      activeDataFlows: activeFlows,
      systemStatus: connectedApps === totalApps ? 'healthy' : 'degraded',
      uptime: process.uptime()
    };
  }
}
