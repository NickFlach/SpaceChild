/**
 * Unified Application Connector Framework
 *
 * Main entry point for the connector framework powered by klaus-kode-agentic-integrator.
 * This framework enables intelligent connections between all applications in the ecosystem.
 */

// Core framework exports
export * from './core/connector_framework';
export * from './core/orchestration_layer';

// Agent exports
export * from './agents/connector_agents';

// Template exports
export * from './templates/connector_templates';

// Testing exports
export * from './tests/testing_framework';

// Generated connectors
export * from './generated/humanity_frontier_connector';
export * from './generated/space_agent_connector';
export * from './generated/music_portal_connector';
export * from './generated/paradox_resolver_connector';

/**
 * Initialize the connector framework with a workspace path
 */
export async function initializeConnectorFramework(workspacePath: string = process.cwd()): Promise<void> {
  console.log('🚀 Initializing Unified Application Connector Framework');
  console.log('   Powered by klaus-kode-agentic-integrator');
  console.log('');

  try {
    // Import and initialize the orchestrator
    const { ConnectorWorkflowOrchestrator } = await import('./agents/connector_agents');
    const { ApplicationOrchestrator } = await import('./core/orchestration_layer');

    // Create orchestrator instance
    const workflowOrchestrator = new ConnectorWorkflowOrchestrator(workspacePath);

    // Store in global for CLI access
    (global as any).__connectorOrchestrator = workflowOrchestrator;

    console.log('✅ Framework initialized successfully');
    console.log('💡 Use the CLI: npm run cli generate');
    console.log('💡 Import connectors: import { HumanityFrontierConnector } from "@spacechild/connector-framework"');

  } catch (error) {
    console.error('❌ Framework initialization failed:', error);
    throw error;
  }
}

/**
 * Get the global orchestrator instance
 */
export function getConnectorOrchestrator(): any {
  return (global as any).__connectorOrchestrator;
}

/**
 * Create a new application connector instance
 */
export async function createConnector(
  sourceApp: string,
  targetApp: string,
  config?: any
): Promise<any> {
  const { ApplicationOrchestrator } = await import('./core/orchestration_layer');
  const orchestrator = new ApplicationOrchestrator();

  // This would create and return a specific connector based on the apps
  // For now, return a generic connector
  return {
    sourceApp,
    targetApp,
    config,
    connect: async () => console.log(`Connecting ${sourceApp} → ${targetApp}`),
    disconnect: async () => console.log(`Disconnecting ${sourceApp} → ${targetApp}`),
    sendData: async (data: any) => console.log(`Sending data from ${sourceApp}:`, data)
  };
}

/**
 * Quick setup function for development
 */
export async function quickSetup(): Promise<void> {
  console.log('⚡ Quick setup for connector framework...');

  // Create necessary directories
  const fs = require('fs');
  const path = require('path');

  const dirs = ['generated', 'tests/output', 'logs'];
  dirs.forEach((dir: string) => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`   📁 Created directory: ${dir}`);
    }
  });

  // Copy environment template if it doesn't exist
  const envTemplate = path.join(__dirname, '.env.example');
  const envFile = path.join(__dirname, '.env');

  if (fs.existsSync(envTemplate) && !fs.existsSync(envFile)) {
    fs.copyFileSync(envTemplate, envFile);
    console.log('   📋 Created .env file from template');
  }

  console.log('✅ Quick setup complete');
  console.log('💡 Configure your .env file with API keys and endpoints');
}
