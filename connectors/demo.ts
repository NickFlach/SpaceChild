#!/usr/bin/env node

/**
 * Connector Framework Demo
 *
 * This script demonstrates the key features of the Unified Application Connector Framework.
 * It shows how to discover applications, generate connectors, and manage data flows.
 */

import {
  initializeConnectorFramework,
  HumanityFrontierConnector,
  SpaceAgentConnector,
  MusicPortalConnector,
  ParadoxResolverConnector,
  ApplicationOrchestrator,
  ConnectorTestingFramework,
  ConnectorTestSuites,
  TestUtils
} from './index';

async function runDemo() {
  console.log('🎭 Connector Framework Demo');
  console.log('=' * 50);

  try {
    // 1. Initialize the framework
    console.log('\n1️⃣ Initializing framework...');
    await initializeConnectorFramework();
    console.log('✅ Framework initialized');

    // 2. Create application connectors
    console.log('\n2️⃣ Creating application connectors...');

    const humanityConnector = new HumanityFrontierConnector();
    const spaceAgentConnector = new SpaceAgentConnector();
    const musicConnector = new MusicPortalConnector();
    const paradoxConnector = new ParadoxResolverConnector();

    console.log('✅ All connectors created');

    // 3. Demonstrate connection management
    console.log('\n3️⃣ Testing connection management...');

    // Test HumanityFrontier connection
    await humanityConnector.connect();
    const humanityHealth = await humanityConnector.healthCheck();
    console.log(`   HumanityFrontier: ${humanityHealth.status}`);

    // Test SpaceAgent connection
    await spaceAgentConnector.connect();
    const spaceAgentHealth = await spaceAgentConnector.healthCheck();
    console.log(`   SpaceAgent: ${spaceAgentHealth.status}`);

    // 4. Demonstrate data exchange
    console.log('\n4️⃣ Demonstrating data exchange...');

    // Send quest data from HumanityFrontier to SpaceAgent
    const questData = {
      type: 'quest_progress',
      userId: 'demo_user_123',
      questId: 'demo_quest_456',
      progress: 0.75,
      timestamp: new Date().toISOString()
    };

    await humanityConnector.sendData(questData);
    console.log('✅ Sent quest progress data');

    // 5. Demonstrate application-specific features
    console.log('\n5️⃣ Testing application-specific features...');

    // Get HumanityFrontier quests (mock data)
    try {
      const quests = await humanityConnector.getQuests();
      console.log(`   Found ${quests.length} quests in HumanityFrontier`);
    } catch (error) {
      console.log('   (Using mock data for demo)');
    }

    // Get SpaceAgent capabilities
    try {
      const agents = await spaceAgentConnector.getAvailableAgents();
      console.log(`   Found ${agents.length} available agents in SpaceAgent`);
    } catch (error) {
      console.log('   (Using mock data for demo)');
    }

    // 6. Demonstrate orchestration
    console.log('\n6️⃣ Testing orchestration layer...');

    const orchestrator = new ApplicationOrchestrator();
    await orchestrator.initialize();

    const systemHealth = orchestrator.getSystemHealth();
    console.log(`   System Health: ${systemHealth.systemStatus}`);
    console.log(`   Connected Apps: ${systemHealth.connectedApplications}/${systemHealth.totalApplications}`);

    // 7. Demonstrate testing framework
    console.log('\n7️⃣ Running connector tests...');

    const testingFramework = new ConnectorTestingFramework();

    // Create test suite for HumanityFrontier connector
    const testSuite = ConnectorTestSuites.createBasicConnectorTestSuite(humanityConnector);
    testingFramework.registerTestSuite(testSuite);

    // Run tests
    const results = await testingFramework.runAllTests();
    const stats = testingFramework.getTestStatistics();

    console.log(`   Test Results: ${stats.passed}/${stats.total} passed (${stats.successRate.toFixed(1)}%)`);

    // 8. Cleanup
    console.log('\n8️⃣ Cleaning up...');

    await humanityConnector.disconnect();
    await spaceAgentConnector.disconnect();

    console.log('✅ Demo completed successfully!');

    // 9. Show next steps
    console.log('\n🚀 Next Steps:');
    console.log('   • Run "npm run generate" to generate connectors between all apps');
    console.log('   • Run "npm run test-connectors" to test all connectors');
    console.log('   • Run "npm run deploy" to deploy connectors to production');
    console.log('   • Check "npm run status" for framework health');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Connector Framework Demo

Usage:
  npm run demo          # Run the full demo
  npm run demo --help   # Show this help

Examples:
  npm run demo          # Run complete demo with all features
`);
  process.exit(0);
}

// Run the demo
runDemo().catch(error => {
  console.error('Demo execution failed:', error);
  process.exit(1);
});
