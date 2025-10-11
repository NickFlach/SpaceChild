/**
 * Unified Application Connector Framework (TypeScript)
 *
 * This framework leverages klaus-kode-agentic-integrator technology to create
 * intelligent connectors between all applications in the codebase using AI agents.
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import express from 'express';
import path from 'path';

// Import klaus-kode workflow tools (would be available via npm package)
interface WorkflowContext {
  selected_workflow?: string;
  deployment?: {
    deployment_id?: string;
    deployment_name?: string;
    deployment_status?: string;
  };
}

interface ClaudeCodeService {
  generateConnector(specification: string): Promise<string>;
}

export enum ApplicationType {
  NODEJS_TYPESCRIPT = 'nodejs_typescript',
  PYTHON_STREAMLIT = 'python_streamlit',
  REACT_FRONTEND = 'react_frontend',
  EXPRESS_BACKEND = 'express_backend'
}

export enum ConnectionProtocol {
  REST_API = 'rest_api',
  WEBSOCKET = 'websocket',
  GRAPHQL = 'graphql',
  MESSAGE_QUEUE = 'message_queue',
  DIRECT_FUNCTION = 'direct_function'
}

export interface ApplicationMetadata {
  name: string;
  type: ApplicationType;
  basePath: string;
  port?: number;
  apiEndpoints: string[];
  databaseSchema: Record<string, any>;
  dependencies: string[];
  integrationPoints: Array<Record<string, any>>;
}

export interface ConnectorConfig {
  sourceApp: string;
  targetApp: string;
  protocols: ConnectionProtocol[];
  dataMappings: Record<string, string>;
  transformationRules: Array<Record<string, any>>;
  syncFrequency: 'real_time' | 'batch' | 'scheduled';
  errorHandling: Record<string, any>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  errorCount: number;
  message?: string;
}

/**
 * Base class for all application connectors
 */
export abstract class ApplicationConnector extends EventEmitter {
  protected sourceApp: string;
  protected targetApp: string;
  protected isConnected: boolean = false;
  protected healthStatus: HealthStatus;

  constructor(sourceApp: string, targetApp: string) {
    super();
    this.sourceApp = sourceApp;
    this.targetApp = targetApp;
    this.healthStatus = {
      status: 'unhealthy',
      lastCheck: new Date(),
      responseTime: 0,
      errorCount: 0
    };
  }

  /**
   * Establish connection to target application
   */
  abstract connect(): Promise<void>;

  /**
   * Close connection to target application
   */
  abstract disconnect(): Promise<void>;

  /**
   * Check health of the connection
   */
  abstract healthCheck(): Promise<HealthStatus>;

  /**
   * Send data to target application
   */
  abstract sendData(data: any, targetApp?: string): Promise<void>;

  /**
   * Receive data from target application
   */
  abstract receiveData(handler: (data: any) => void): Promise<void>;

  /**
   * Get connector configuration
   */
  getConfig(): ConnectorConfig {
    return {
      sourceApp: this.sourceApp,
      targetApp: this.targetApp,
      protocols: [ConnectionProtocol.REST_API],
      dataMappings: {},
      transformationRules: [],
      syncFrequency: 'real_time',
      errorHandling: {}
    };
  }

  /**
   * Update health status
   */
  protected updateHealth(status: Partial<HealthStatus>): void {
    this.healthStatus = { ...this.healthStatus, ...status, lastCheck: new Date() };
    this.emit('healthChanged', this.healthStatus);
  }

  /**
   * Handle connection errors
   */
  protected handleError(error: Error): void {
    this.healthStatus.errorCount++;
    this.updateHealth({ status: 'unhealthy', message: error.message });
    this.emit('error', error);
  }
}

/**
 * REST API-based connector for HTTP applications
 */
export class RestApiConnector extends ApplicationConnector {
  private baseUrl: string;
  private apiKey?: string;

  constructor(sourceApp: string, targetApp: string, baseUrl: string, apiKey?: string) {
    super(sourceApp, targetApp);
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    try {
      // Test connection with a simple health check
      await this.healthCheck();
      this.isConnected = true;
      this.updateHealth({ status: 'healthy' });
      this.emit('connected');
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.updateHealth({ status: 'unhealthy' });
    this.emit('disconnected');
  }

  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
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

  async sendData(data: any, targetApp?: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Connector not connected');
    }

    try {
      const endpoint = targetApp ? `/${targetApp}` : '/data';

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.emit('dataSent', data);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async receiveData(handler: (data: any) => void): Promise<void> {
    // For REST APIs, polling would be implemented here
    // This is a simplified version - real implementation would use proper polling or WebSocket
    this.emit('dataReceived', handler);
  }
}

/**
 * WebSocket-based connector for real-time applications
 */
export class WebSocketConnector extends ApplicationConnector {
  private wsUrl: string;
  private ws?: WebSocket;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(sourceApp: string, targetApp: string, wsUrl: string) {
    super(sourceApp, targetApp);
    this.wsUrl = wsUrl;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.updateHealth({ status: 'healthy' });
          this.emit('connected');
          resolve();
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.updateHealth({ status: 'unhealthy' });
          this.emit('disconnected');

          // Attempt to reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => this.connect(), this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
            this.reconnectAttempts++;
          }
        };

        this.ws.onerror = (error) => {
          this.handleError(new Error(`WebSocket error: ${error}`));
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data.toString());
            this.emit('dataReceived', data);
          } catch (error) {
            this.handleError(error as Error);
          }
        };

      } catch (error) {
        this.handleError(error as Error);
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
    }
    this.isConnected = false;
    this.updateHealth({ status: 'unhealthy' });
  }

  async healthCheck(): Promise<HealthStatus> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.updateHealth({ status: 'unhealthy' });
    } else {
      this.updateHealth({ status: 'healthy' });
    }

    return this.healthStatus;
  }

  async sendData(data: any): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    try {
      this.ws.send(JSON.stringify(data));
      this.emit('dataSent', data);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async receiveData(handler: (data: any) => void): Promise<void> {
    if (!this.ws) {
      throw new Error('WebSocket not initialized');
    }

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

/**
 * Application Discovery Agent for analyzing application structures
 */
export class ApplicationDiscoveryAgent {
  private workspacePath: string;
  private applications: Map<string, ApplicationMetadata> = new Map();

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  async discoverApplications(): Promise<Map<string, ApplicationMetadata>> {
    console.log('🔍 Discovering applications in workspace...');

    const appDirectories = [
      'HumanityFrontier',
      'SpaceAgent',
      'MusicPortal',
      'ParadoxResolver',
      'ConsciousnessProbe',
      'QuantumSingularity',
      'pitchfork-echo-studio',
      'SpaceChild'
    ];

    for (const appName of appDirectories) {
      const appPath = path.join(this.workspacePath, '..', appName);
      if (require('fs').existsSync(appPath)) {
        const metadata = await this.analyzeApplication(appName, appPath);
        this.applications.set(appName, metadata);
      }
    }

    console.log(`✅ Discovered ${this.applications.size} applications`);
    return this.applications;
  }

  private async analyzeApplication(name: string, appPath: string): Promise<ApplicationMetadata> {
    console.log(`   📋 Analyzing ${name}...`);

    const appType = this.determineApplicationType(name, appPath);
    const packageJson = this.readPackageJson(appPath);
    const apiEndpoints = this.extractApiEndpoints(name, appPath);
    const databaseSchema = this.extractDatabaseSchema(name, appPath);

    return {
      name,
      type: appType,
      basePath: appPath,
      port: this.extractPort(packageJson),
      apiEndpoints,
      databaseSchema,
      dependencies: this.extractDependencies(packageJson),
      integrationPoints: []
    };
  }

  private determineApplicationType(name: string, appPath: string): ApplicationType {
    if (name === 'ParadoxResolver') {
      return ApplicationType.PYTHON_STREAMLIT;
    }

    if (require('fs').existsSync(path.join(appPath, 'package.json'))) {
      const hasReact = require('fs').existsSync(path.join(appPath, 'src', 'components')) ||
                      require('fs').existsSync(path.join(appPath, 'client', 'src'));
      if (hasReact) {
        return ApplicationType.REACT_FRONTEND;
      }
      return ApplicationType.NODEJS_TYPESCRIPT;
    }

    return ApplicationType.NODEJS_TYPESCRIPT;
  }

  private readPackageJson(appPath: string): any {
    const packagePath = path.join(appPath, 'package.json');
    try {
      return require(packagePath);
    } catch {
      return null;
    }
  }

  private extractPort(packageJson: any): number | undefined {
    if (!packageJson?.scripts?.dev) return undefined;

    const devScript = packageJson.scripts.dev;
    const portMatch = devScript.match(/PORT=(\d+)/);
    return portMatch ? parseInt(portMatch[1]) : undefined;
  }

  private extractApiEndpoints(name: string, appPath: string): string[] {
    const endpoints: string[] = [];

    const serverPatterns = ['server/**/*.ts', 'server/**/*.js', 'src/**/*.ts', 'src/**/*.js'];
    for (const pattern of serverPatterns) {
      // In a real implementation, this would recursively search for files
      // For now, we'll return common API endpoints based on application type
    }

    // Add common endpoints based on application analysis
    if (name === 'HumanityFrontier') {
      endpoints.push('/api/quests', '/api/users', '/api/leaderboard');
    } else if (name === 'SpaceAgent') {
      endpoints.push('/api/agents', '/api/intelligence', '/api/collaboration');
    }
    // Add more application-specific endpoints...

    return endpoints;
  }

  private extractDatabaseSchema(name: string, appPath: string): Record<string, any> {
    // In a real implementation, this would parse schema files
    // For now, return a basic structure
    return {
      tables: [],
      raw_content: 'Schema analysis would be performed here'
    };
  }

  private extractDependencies(packageJson: any): string[] {
    if (!packageJson) return [];

    const deps: string[] = [];
    for (const section of ['dependencies', 'devDependencies']) {
      if (packageJson[section]) {
        deps.push(...Object.keys(packageJson[section]));
      }
    }

    return deps;
  }
}

/**
 * Connector Generation Agent using klaus-kode AI capabilities
 */
export class ConnectorGenerationAgent {
  private context: WorkflowContext;
  private claudeService: ClaudeCodeService;

  constructor(context: WorkflowContext) {
    this.context = context;
    // this.claudeService would be initialized with actual klaus-kode service
  }

  async generateConnector(config: ConnectorConfig): Promise<string> {
    console.log(`🤖 Generating connector: ${config.sourceApp} → ${config.targetApp}`);

    const specification = this.createConnectorSpecification(config);
    const connectorCode = await this.generateConnectorCode(specification);
    const outputPath = this.saveConnectorCode(config, connectorCode);

    console.log(`✅ Connector generated: ${outputPath}`);
    return outputPath;
  }

  private createConnectorSpecification(config: ConnectorConfig): string {
    return `
# Connector Specification

## Source Application: ${config.sourceApp}
## Target Application: ${config.targetApp}

### Connection Protocols
${config.protocols.join(', ')}

### Requirements
1. Implement real-time data synchronization
2. Handle error cases gracefully
3. Include comprehensive logging
4. Support health check endpoints
5. Follow existing application architecture patterns

### Generated Connector Should Include
- Connection management (connect/disconnect/health check)
- Data transformation functions
- Error handling and retry logic
- Real-time synchronization capabilities
- Monitoring and logging
`;
  }

  private async generateConnectorCode(specification: string): Promise<string> {
    // In a real implementation, this would use klaus-kode's Claude Code service
    // For now, return a template implementation

    return `
/**
 * Auto-generated connector: ${specification.split('\\n')[1]}
 * Generated by klaus-kode-agentic-integrator
 */

import { ApplicationConnector, ConnectionProtocol } from '../core/connector_framework';

export class ${specification.split('## Source Application: ')[1]?.split('\\n')[0}To${specification.split('## Target Application: ')[1]?.split('\\n')[0}Connector extends ApplicationConnector {
  constructor() {
    super('${specification.split('## Source Application: ')[1]?.split('\\n')[0}',
          '${specification.split('## Target Application: ')[1]?.split('\\n')[0}');
  }

  async connect(): Promise<void> {
    // AI-generated connection logic would be implemented here
    this.isConnected = true;
    console.log(\`Connected to \${this.targetApp}\`);
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log(\`Disconnected from \${this.targetApp}\`);
  }

  async healthCheck() {
    return {
      status: this.isConnected ? 'healthy' : 'unhealthy',
      lastCheck: new Date(),
      responseTime: 0,
      errorCount: 0
    };
  }

  async sendData(data: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Connector not connected');
    }
    // AI-generated data sending logic would be implemented here
    console.log(\`Sending data to \${this.targetApp}:\`, data);
  }

  async receiveData(handler: (data: any) => void): Promise<void> {
    // AI-generated data receiving logic would be implemented here
    console.log(\`Receiving data from \${this.targetApp}\`);
  }
}
`;
  }

  private saveConnectorCode(config: ConnectorConfig, code: string): string {
    const filename = \`\${config.sourceApp.toLowerCase()}_\${config.targetApp.toLowerCase()}_connector.ts\`;
    const outputPath = path.join(__dirname, '..', 'generated', filename);

    require('fs').mkdirSync(path.dirname(outputPath), { recursive: true });

    require('fs').writeFileSync(outputPath, code);
    return outputPath;
  }
}

/**
 * Main orchestrator for the connector framework
 */
export class ConnectorOrchestrator {
  private discoveryAgent: ApplicationDiscoveryAgent;
  private generationAgent: ConnectorGenerationAgent;
  private applications: Map<string, ApplicationMetadata> = new Map();
  private connectors: Map<string, ApplicationConnector> = new Map();

  constructor(workspacePath: string) {
    this.discoveryAgent = new ApplicationDiscoveryAgent(workspacePath);
    this.generationAgent = new ConnectorGenerationAgent({} as WorkflowContext);
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Unified Application Connector Framework');

    this.applications = await this.discoveryAgent.discoverApplications();

    console.log('✅ Framework initialized successfully');
  }

  async generateAllConnectors(): Promise<string[]> {
    console.log('🔗 Generating connectors between all applications...');

    const generatedConnectors: string[] = [];
    const appNames = Array.from(this.applications.keys());

    for (let i = 0; i < appNames.length; i++) {
      for (let j = i + 1; j < appNames.length; j++) {
        const sourceApp = appNames[i];
        const targetApp = appNames[j];

        if (sourceApp !== targetApp) {
          const config = this.createConnectorConfig(sourceApp, targetApp);
          const connectorPath = await this.generationAgent.generateConnector(config);
          generatedConnectors.push(connectorPath);
        }
      }
    }

    console.log(`✅ Generated ${generatedConnectors.length} connectors`);
    return generatedConnectors;
  }

  private createConnectorConfig(sourceApp: string, targetApp: string): ConnectorConfig {
    const sourceMeta = this.applications.get(sourceApp)!;
    const targetMeta = this.applications.get(targetApp)!;

    const protocols = this.determineProtocols(sourceMeta, targetMeta);

    return {
      sourceApp,
      targetApp,
      protocols,
      dataMappings: {},
      transformationRules: [],
      syncFrequency: 'real_time',
      errorHandling: {}
    };
  }

  private determineProtocols(source: ApplicationMetadata, target: ApplicationMetadata): ConnectionProtocol[] {
    const protocols: ConnectionProtocol[] = [];

    if (source.apiEndpoints.length > 0 || target.apiEndpoints.length > 0) {
      protocols.push(ConnectionProtocol.REST_API);
    }

    if (source.type === ApplicationType.REACT_FRONTEND || target.type === ApplicationType.REACT_FRONTEND) {
      protocols.push(ConnectionProtocol.WEBSOCKET);
    }

    if (protocols.length === 0) {
      protocols.push(ConnectionProtocol.REST_API);
    }

    return protocols;
  }
}
