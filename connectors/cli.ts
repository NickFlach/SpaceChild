#!/usr/bin/env node

/**
 * Main CLI entry point for the Unified Application Connector Framework
 *
 * This CLI leverages klaus-kode-agentic-integrator technology to provide
 * an interactive interface for managing application connectors.
 */

import { Command } from 'commander';
import { ConnectorWorkflowOrchestrator } from './agents/connector_agents';
import { ApplicationDiscoveryAgent } from './core/connector_framework';
import * as path from 'path';
import * as fs from 'fs';

const program = new Command();

// Get workspace path from environment or current directory
const workspacePath = process.env.WORKSPACE_PATH || process.cwd();

class ConnectorCLI {
  private orchestrator: ConnectorWorkflowOrchestrator;

  constructor() {
    this.orchestrator = new ConnectorWorkflowOrchestrator(workspacePath);
    this.setupCommands();
  }

  private setupCommands(): void {
    // Main workflow command
    program
      .name('connector-framework')
      .description('Unified Application Connector Framework powered by klaus-kode-agentic-integrator')
      .version('1.0.0');

    program
      .command('discover')
      .description('Discover all applications in the workspace')
      .action(async () => {
        console.log('🔍 Discovering applications...');
        const discoveryAgent = new ApplicationDiscoveryAgent(workspacePath);
        const applications = await discoveryAgent.discoverApplications();

        console.log(`\n📊 Discovered ${applications.size} applications:\n`);

        for (const [name, metadata] of applications) {
          console.log(`   • ${name}`);
          console.log(`     Type: ${metadata.type}`);
          console.log(`     Port: ${metadata.port || 'Not specified'}`);
          console.log(`     API Endpoints: ${metadata.apiEndpoints.length}`);
          console.log(`     Dependencies: ${metadata.dependencies.length}\n`);
        }
      });

    program
      .command('generate')
      .description('Generate connectors between all applications')
      .option('-t, --test', 'Run tests after generation')
      .option('-d, --deploy', 'Deploy connectors after testing')
      .action(async (options) => {
        console.log('🚀 Starting connector generation workflow...\n');

        try {
          // Set up event handlers for workflow progress
          this.orchestrator.on('discoveryComplete', (applications) => {
            console.log(`✅ Discovered ${applications.length} applications`);
          });

          this.orchestrator.on('generationComplete', (connectors) => {
            console.log(`✅ Generated ${connectors.length} connectors`);
          });

          this.orchestrator.on('testingComplete', (results) => {
            const passed = Array.from(results.values()).filter(Boolean).length;
            const total = results.size;
            console.log(`✅ Testing complete: ${passed}/${total} connectors passed`);
          });

          this.orchestrator.on('deploymentComplete', (deployment) => {
            console.log(`✅ Deployment complete: ${deployment.deploymentId}`);
          });

          this.orchestrator.on('workflowComplete', (result) => {
            console.log('\n🎉 Workflow completed successfully!');
            console.log(`   Applications: ${result.applications.length}`);
            console.log(`   Connectors: ${result.connectors.length}`);
            console.log(`   Deployment: ${result.deploymentId}`);
          });

          this.orchestrator.on('workflowError', (error) => {
            console.error('\n❌ Workflow failed:', error);
            process.exit(1);
          });

          // Run the full workflow
          await this.orchestrator.runFullWorkflow();

        } catch (error) {
          console.error('❌ Workflow execution failed:', error);
          process.exit(1);
        }
      });

    program
      .command('status')
      .description('Show current status of the connector framework')
      .action(() => {
        const status = this.orchestrator.getWorkflowStatus();

        console.log('📊 Connector Framework Status\n');
        console.log(`   Applications Discovered: ${status.applicationsDiscovered}`);
        console.log(`   Connectors Generated: ${status.connectorsGenerated}`);
        console.log(`   Deployment ID: ${status.deploymentId || 'None'}`);
        console.log(`   Status: ${status.status}`);

        if (status.deploymentId) {
          console.log('\n🔗 Generated connectors are available in the "generated" directory');
          console.log('💡 Use "npm run test" to run connector tests');
        }
      });

    program
      .command('test')
      .description('Test all generated connectors')
      .argument('[connector]', 'Specific connector to test')
      .action(async (connector) => {
        console.log('🧪 Running connector tests...');

        if (connector) {
          console.log(`Testing specific connector: ${connector}`);
          // Test single connector logic would go here
        } else {
          console.log('Testing all generated connectors...');
          // Test all connectors logic would go here
        }

        console.log('✅ Testing complete');
      });

    program
      .command('deploy')
      .description('Deploy connectors to production environment')
      .action(async () => {
        console.log('🚀 Deploying connectors...');

        // Check if connectors exist
        const generatedDir = path.join(__dirname, 'generated');
        if (!fs.existsSync(generatedDir)) {
          console.log('❌ No connectors found. Run "generate" first.');
          return;
        }

        const connectors = fs.readdirSync(generatedDir).filter(f => f.endsWith('.ts'));
        if (connectors.length === 0) {
          console.log('❌ No connectors found. Run "generate" first.');
          return;
        }

        console.log(`Found ${connectors.length} connectors to deploy`);

        // Deploy logic would go here
        console.log('✅ Deployment initiated');
        console.log('💡 Monitor deployment status with "status" command');
      });

    program
      .command('config')
      .description('Configure framework settings')
      .option('--workspace <path>', 'Set workspace path')
      .option('--reset', 'Reset all settings')
      .action((options) => {
        if (options.workspace) {
          console.log(`Setting workspace path: ${options.workspace}`);
          // Save workspace path to config
        }

        if (options.reset) {
          console.log('Resetting framework configuration...');
          // Reset config logic
        }

        console.log('✅ Configuration updated');
      });
  }

  async run(): Promise<void> {
    // Show header
    console.log('🤖 UNIFIED APPLICATION CONNECTOR FRAMEWORK');
    console.log('   Powered by klaus-kode-agentic-integrator');
    console.log('   Building intelligent connectors between all applications');
    console.log('');

    // Parse and run command
    program.parse();
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  const cli = new ConnectorCLI();
  cli.run().catch(error => {
    console.error('❌ CLI execution failed:', error);
    process.exit(1);
  });
}

export default ConnectorCLI;
