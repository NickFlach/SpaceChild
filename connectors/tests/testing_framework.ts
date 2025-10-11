/**
 * Connector Testing Framework
 *
 * This framework provides comprehensive testing capabilities for all generated connectors,
 * ensuring they work correctly and handle edge cases properly.
 */

import { EventEmitter } from 'events';
import { ApplicationConnector } from './connector_framework';

interface TestCase {
  id: string;
  name: string;
  description: string;
  setup?: () => Promise<void>;
  execute: () => Promise<boolean>;
  cleanup?: () => Promise<void>;
  timeout: number;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  setup?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

interface TestResult {
  testCaseId: string;
  passed: boolean;
  duration: number;
  error?: string;
  output?: any;
}

export class ConnectorTestingFramework extends EventEmitter {
  private testSuites: Map<string, TestSuite> = new Map();
  private testResults: Map<string, TestResult[]> = new Map();

  constructor() {
    super();
  }

  /**
   * Register a test suite for a specific connector
   */
  registerTestSuite(suite: TestSuite): void {
    this.testSuites.set(suite.id, suite);
    console.log(`📋 Registered test suite: ${suite.name}`);
  }

  /**
   * Run all registered test suites
   */
  async runAllTests(): Promise<Map<string, TestResult[]>> {
    console.log('🧪 Running all connector tests...');

    for (const [suiteId, suite] of this.testSuites) {
      console.log(`\n🏃 Running test suite: ${suite.name}`);
      const results = await this.runTestSuite(suite);
      this.testResults.set(suiteId, results);

      const passed = results.filter(r => r.passed).length;
      console.log(`   ✅ ${passed}/${results.length} tests passed`);
    }

    this.emit('allTestsComplete', this.testResults);
    return this.testResults;
  }

  /**
   * Run a specific test suite
   */
  async runTestSuite(suite: TestSuite): Promise<TestResult[]> {
    const results: TestResult[] = [];

    try {
      // Run suite setup
      if (suite.setup) {
        await suite.setup();
      }

      // Run each test case
      for (const testCase of suite.testCases) {
        const result = await this.runTestCase(testCase);
        results.push(result);

        if (result.passed) {
          console.log(`   ✅ ${testCase.name}`);
        } else {
          console.log(`   ❌ ${testCase.name}: ${result.error}`);
        }
      }

      // Run suite cleanup
      if (suite.cleanup) {
        await suite.cleanup();
      }

    } catch (error) {
      console.error(`❌ Test suite ${suite.name} failed:`, error);
    }

    return results;
  }

  /**
   * Run a single test case
   */
  private async runTestCase(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // Run test setup
      if (testCase.setup) {
        await testCase.setup();
      }

      // Execute test with timeout
      const testPromise = testCase.execute();
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error(`Test timeout after ${testCase.timeout}ms`)), testCase.timeout);
      });

      const result = await Promise.race([testPromise, timeoutPromise]);
      const duration = Date.now() - startTime;

      // Run test cleanup
      if (testCase.cleanup) {
        await testCase.cleanup();
      }

      return {
        testCaseId: testCase.id,
        passed: result,
        duration,
        output: result
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        testCaseId: testCase.id,
        passed: false,
        duration,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get test results for a specific suite
   */
  getTestResults(suiteId: string): TestResult[] | undefined {
    return this.testResults.get(suiteId);
  }

  /**
   * Get overall test statistics
   */
  getTestStatistics(): any {
    const allResults = Array.from(this.testResults.values()).flat();
    const total = allResults.length;
    const passed = allResults.filter(r => r.passed).length;
    const failed = total - passed;
    const avgDuration = allResults.reduce((sum, r) => sum + r.duration, 0) / total;

    return {
      total,
      passed,
      failed,
      successRate: (passed / total) * 100,
      averageDuration: avgDuration,
      suitesTested: this.testResults.size
    };
  }
}

/**
 * Predefined test suites for common connector scenarios
 */
export class ConnectorTestSuites {
  /**
   * Create test suite for basic connector functionality
   */
  static createBasicConnectorTestSuite(connector: ApplicationConnector): TestSuite {
    return {
      id: `basic_${connector.constructor.name}`,
      name: `Basic ${connector.constructor.name} Tests`,
      description: 'Tests basic connector functionality',
      testCases: [
        {
          id: 'connection_test',
          name: 'Connection Test',
          description: 'Test basic connection establishment',
          timeout: 10000,
          execute: async () => {
            try {
              await connector.connect();
              const health = await connector.healthCheck();
              return health.status === 'healthy';
            } finally {
              await connector.disconnect();
            }
          }
        },
        {
          id: 'health_check_test',
          name: 'Health Check Test',
          description: 'Test health check functionality',
          timeout: 5000,
          execute: async () => {
            await connector.connect();
            try {
              const health = await connector.healthCheck();
              return health.status !== 'unhealthy';
            } finally {
              await connector.disconnect();
            }
          }
        },
        {
          id: 'data_send_test',
          name: 'Data Send Test',
          description: 'Test sending data through connector',
          timeout: 10000,
          execute: async () => {
            await connector.connect();
            try {
              const testData = {
                type: 'test',
                message: 'Hello from test',
                timestamp: new Date().toISOString()
              };

              await connector.sendData(testData);
              return true;
            } catch (error) {
              console.error('Data send test failed:', error);
              return false;
            } finally {
              await connector.disconnect();
            }
          }
        }
      ]
    };
  }

  /**
   * Create test suite for REST API connectors
   */
  static createRestApiTestSuite(connector: ApplicationConnector, baseUrl: string): TestSuite {
    return {
      id: `rest_${connector.constructor.name}`,
      name: `REST API ${connector.constructor.name} Tests`,
      description: 'Tests REST API functionality',
      testCases: [
        {
          id: 'api_health_test',
          name: 'API Health Test',
          description: 'Test API health endpoint',
          timeout: 5000,
          execute: async () => {
            try {
              const response = await fetch(`${baseUrl}/health`);
              return response.ok;
            } catch (error) {
              return false;
            }
          }
        },
        {
          id: 'api_data_test',
          name: 'API Data Test',
          description: 'Test API data endpoints',
          timeout: 10000,
          execute: async () => {
            try {
              // Test GET endpoint
              const getResponse = await fetch(`${baseUrl}/api/test`);
              if (!getResponse.ok) return false;

              // Test POST endpoint
              const postResponse = await fetch(`${baseUrl}/api/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test: true })
              });

              return postResponse.ok;
            } catch (error) {
              return false;
            }
          }
        }
      ]
    };
  }

  /**
   * Create test suite for WebSocket connectors
   */
  static createWebSocketTestSuite(connector: ApplicationConnector, wsUrl: string): TestSuite {
    return {
      id: `websocket_${connector.constructor.name}`,
      name: `WebSocket ${connector.constructor.name} Tests`,
      description: 'Tests WebSocket functionality',
      testCases: [
        {
          id: 'websocket_connection_test',
          name: 'WebSocket Connection Test',
          description: 'Test WebSocket connection',
          timeout: 10000,
          execute: async () => {
            return new Promise((resolve) => {
              try {
                const ws = new (require('ws'))(wsUrl);

                ws.onopen = () => {
                  ws.close();
                  resolve(true);
                };

                ws.onerror = () => {
                  resolve(false);
                };

                setTimeout(() => {
                  ws.close();
                  resolve(false);
                }, 5000);

              } catch (error) {
                resolve(false);
              }
            });
          }
        },
        {
          id: 'websocket_message_test',
          name: 'WebSocket Message Test',
          description: 'Test WebSocket message sending/receiving',
          timeout: 10000,
          execute: async () => {
            return new Promise((resolve) => {
              try {
                const ws = new (require('ws'))(wsUrl);
                let messageReceived = false;

                ws.onopen = () => {
                  ws.send(JSON.stringify({ type: 'test', message: 'hello' }));
                };

                ws.onmessage = (event: any) => {
                  try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'test_response') {
                      messageReceived = true;
                    }
                  } catch (error) {
                    // Ignore parse errors
                  }
                };

                setTimeout(() => {
                  ws.close();
                  resolve(messageReceived);
                }, 5000);

              } catch (error) {
                resolve(false);
              }
            });
          }
        }
      ]
    };
  }

  /**
   * Create comprehensive test suite combining all test types
   */
  static createComprehensiveTestSuite(
    connector: ApplicationConnector,
    baseUrl?: string,
    wsUrl?: string
  ): TestSuite {
    const suites: TestSuite[] = [];

    // Add basic tests
    suites.push(this.createBasicConnectorTestSuite(connector));

    // Add REST API tests if URL provided
    if (baseUrl) {
      suites.push(this.createRestApiTestSuite(connector, baseUrl));
    }

    // Add WebSocket tests if URL provided
    if (wsUrl) {
      suites.push(this.createWebSocketTestSuite(connector, wsUrl));
    }

    return {
      id: `comprehensive_${connector.constructor.name}`,
      name: `Comprehensive ${connector.constructor.name} Tests`,
      description: 'Complete test suite for connector',
      testCases: suites.flatMap(s => s.testCases)
    };
  }
}

/**
 * Test utilities and helpers
 */
export class TestUtils {
  /**
   * Generate mock data for testing
   */
  static generateMockData(type: string): any {
    const timestamp = new Date().toISOString();

    switch (type) {
      case 'user_data':
        return {
          id: `user_${Date.now()}`,
          username: `testuser_${Math.random().toString(36).substr(2, 9)}`,
          email: `test${Math.random().toString(36).substr(2, 9)}@example.com`,
          level: Math.floor(Math.random() * 100),
          experience: Math.floor(Math.random() * 10000),
          timestamp
        };

      case 'quest_data':
        return {
          id: `quest_${Date.now()}`,
          title: `Test Quest ${Math.random().toString(36).substr(2, 9)}`,
          description: 'This is a test quest for connector testing',
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
          points: Math.floor(Math.random() * 1000) + 100,
          category: 'testing',
          status: 'active',
          timestamp
        };

      case 'music_data':
        return {
          id: `track_${Date.now()}`,
          title: `Test Track ${Math.random().toString(36).substr(2, 9)}`,
          artist: `Test Artist ${Math.random().toString(36).substr(2, 9)}`,
          genre: ['rock', 'pop', 'jazz', 'classical'][Math.floor(Math.random() * 4)],
          duration: Math.floor(Math.random() * 300) + 60,
          metadata: {
            bpm: Math.floor(Math.random() * 200) + 60,
            key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
            mood: ['happy', 'sad', 'energetic', 'calm'][Math.floor(Math.random() * 4)],
            energy: Math.random()
          },
          timestamp
        };

      case 'agent_task':
        return {
          id: `task_${Date.now()}`,
          type: ['analysis', 'generation', 'review', 'testing'][Math.floor(Math.random() * 4)],
          description: `Test task: ${Math.random().toString(36).substr(2, 20)}`,
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          status: 'pending',
          timestamp
        };

      default:
        return {
          type: 'generic_test_data',
          id: `data_${Date.now()}`,
          message: 'This is generic test data',
          timestamp
        };
    }
  }

  /**
   * Wait for a condition with timeout
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) {
          return true;
        }
      } catch (error) {
        // Ignore errors and continue waiting
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    return false;
  }

  /**
   * Create a mock server for testing
   */
  static createMockServer(port: number): any {
    const express = require('express');
    const app = express();
    app.use(express.json());

    const server = app.listen(port);

    // Health endpoint
    app.get('/health', (req: any, res: any) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Data endpoint
    app.post('/api/data', (req: any, res: any) => {
      res.json({ received: true, data: req.body });
    });

    return { app, server };
  }

  /**
   * Clean up mock server
   */
  static async cleanupMockServer(server: any): Promise<void> {
    return new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }
}
