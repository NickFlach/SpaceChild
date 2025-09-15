/**
 * Integration tests for the enhanced AI system
 * Tests all components working together: reasoning, tools, consciousness, ensemble, streaming
 */

import { integratedAIService, EnhancedAIRequest } from '../services/ai/integratedAIService';
import { storage } from '../storage';

export class AIIntegrationTester {
  private testResults: Array<{
    testName: string;
    passed: boolean;
    duration: number;
    details: string;
    error?: string;
  }> = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting AI Integration Tests...');
    
    try {
      // Initialize the AI service
      await this.initializeService();

      // Run individual test suites
      await this.testBasicFunctionality();
      await this.testReasoningModes();
      await this.testToolIntegration();
      await this.testConsciousnessIntegration();
      await this.testEnsembleCoordination();
      await this.testStreamingCapabilities();
      await this.testPromptTemplates();
      await this.testPerformanceMetrics();

      // Generate test report
      this.generateTestReport();

    } catch (error) {
      console.error('❌ Test suite initialization failed:', error);
      throw error;
    }
  }

  private async initializeService(): Promise<void> {
    const startTime = Date.now();
    
    try {
      await integratedAIService.initialize();
      
      this.testResults.push({
        testName: 'Service Initialization',
        passed: true,
        duration: Date.now() - startTime,
        details: 'AI service initialized successfully'
      });
      
      console.log('✅ Service initialization test passed');
    } catch (error) {
      this.testResults.push({
        testName: 'Service Initialization',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Failed to initialize AI service',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  private async testBasicFunctionality(): Promise<void> {
    console.log('🔍 Testing basic AI functionality...');
    
    const request: EnhancedAIRequest = {
      message: 'Explain what a REST API is and provide a simple example',
      userId: 'test-user',
      projectId: 1,
      complexity: 'medium',
      enable_tools: false
    };

    const startTime = Date.now();
    
    try {
      const response = await integratedAIService.processEnhancedRequest(request);
      
      const passed = response.content.length > 100 && 
                    response.quality_metrics.confidence_score > 0.5 &&
                    response.processing_metadata.processing_time > 0;
      
      this.testResults.push({
        testName: 'Basic Functionality',
        passed,
        duration: Date.now() - startTime,
        details: `Response length: ${response.content.length}, Confidence: ${response.quality_metrics.confidence_score}`,
        error: passed ? undefined : 'Response quality below threshold'
      });
      
      console.log(passed ? '✅ Basic functionality test passed' : '❌ Basic functionality test failed');
    } catch (error) {
      this.testResults.push({
        testName: 'Basic Functionality',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Exception during basic functionality test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Basic functionality test failed with error');
    }
  }

  private async testReasoningModes(): Promise<void> {
    console.log('🧠 Testing reasoning modes...');
    
    const reasoningModes = ['direct', 'chain-of-thought', 'reflection', 'metacognitive'];
    
    for (const mode of reasoningModes) {
      const startTime = Date.now();
      
      try {
        const request: EnhancedAIRequest = {
          message: 'Analyze the pros and cons of microservices architecture',
          userId: 'test-user',
          projectId: 1,
          reasoning_mode: mode as any,
          complexity: 'high'
        };

        const response = await integratedAIService.processEnhancedRequest(request);
        
        const passed = response.reasoning.mode === mode &&
                      response.reasoning.confidence > 0.3 &&
                      response.content.length > 200;
        
        this.testResults.push({
          testName: `Reasoning Mode: ${mode}`,
          passed,
          duration: Date.now() - startTime,
          details: `Mode: ${response.reasoning.mode}, Confidence: ${response.reasoning.confidence}, Steps: ${response.reasoning.steps.length}`,
          error: passed ? undefined : `Reasoning mode ${mode} did not perform as expected`
        });
        
        console.log(passed ? `✅ ${mode} reasoning test passed` : `❌ ${mode} reasoning test failed`);
      } catch (error) {
        this.testResults.push({
          testName: `Reasoning Mode: ${mode}`,
          passed: false,
          duration: Date.now() - startTime,
          details: `Exception during ${mode} reasoning test`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        console.log(`❌ ${mode} reasoning test failed with error`);
      }
    }
  }

  private async testToolIntegration(): Promise<void> {
    console.log('🔧 Testing tool integration...');
    
    const startTime = Date.now();
    
    try {
      const request: EnhancedAIRequest = {
        message: 'Analyze the security of this code: function login(user, pass) { return user === "admin" && pass === "123"; }',
        userId: 'test-user',
        projectId: 1,
        enable_tools: true,
        tool_preferences: ['security_audit', 'analyze_code_complexity'],
        complexity: 'high'
      };

      const response = await integratedAIService.processEnhancedRequest(request);
      
      const passed = response.processing_metadata.tools_executed > 0 &&
                    response.tools.results.length > 0 &&
                    response.content.includes('security') || response.content.includes('analysis');
      
      this.testResults.push({
        testName: 'Tool Integration',
        passed,
        duration: Date.now() - startTime,
        details: `Tools executed: ${response.processing_metadata.tools_executed}, Results: ${response.tools.results.length}`,
        error: passed ? undefined : 'Tools were not properly executed or integrated'
      });
      
      console.log(passed ? '✅ Tool integration test passed' : '❌ Tool integration test failed');
    } catch (error) {
      this.testResults.push({
        testName: 'Tool Integration',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Exception during tool integration test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Tool integration test failed with error');
    }
  }

  private async testConsciousnessIntegration(): Promise<void> {
    console.log('🧠 Testing consciousness integration...');
    
    const startTime = Date.now();
    
    try {
      // First request to establish memory
      const request1: EnhancedAIRequest = {
        message: 'I prefer detailed technical explanations with code examples',
        userId: 'consciousness-test-user',
        projectId: 1,
        complexity: 'medium'
      };
      
      await integratedAIService.processEnhancedRequest(request1);
      
      // Second request to test memory recall
      const request2: EnhancedAIRequest = {
        message: 'Explain database indexing',
        userId: 'consciousness-test-user',
        projectId: 1,
        complexity: 'medium'
      };
      
      const response = await integratedAIService.processEnhancedRequest(request2);
      
      const passed = response.context.relevantMemories !== undefined &&
                    response.consciousnessIntegration.memoryInfluence >= 0 &&
                    response.session.sessionId.length > 0;
      
      this.testResults.push({
        testName: 'Consciousness Integration',
        passed,
        duration: Date.now() - startTime,
        details: `Memory influence: ${response.consciousnessIntegration.memoryInfluence}, Session ID: ${response.session.sessionId}`,
        error: passed ? undefined : 'Consciousness integration not working properly'
      });
      
      console.log(passed ? '✅ Consciousness integration test passed' : '❌ Consciousness integration test failed');
    } catch (error) {
      this.testResults.push({
        testName: 'Consciousness Integration',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Exception during consciousness integration test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Consciousness integration test failed with error');
    }
  }

  private async testEnsembleCoordination(): Promise<void> {
    console.log('🎭 Testing ensemble coordination...');
    
    const startTime = Date.now();
    
    try {
      const request: EnhancedAIRequest = {
        message: 'Design a scalable architecture for a social media platform handling 10 million users',
        userId: 'test-user',
        projectId: 1,
        complexity: 'expert', // This should trigger ensemble coordination
        ensemble_config: {
          task_complexity: 'expert',
          quality_requirements: 'critical',
          time_constraints: 'normal'
        }
      };

      const response = await integratedAIService.processEnhancedRequest(request);
      
      const passed = response.processing_metadata.ensemble_coordination === true &&
                    response.quality_metrics.confidence_score > 0.6 &&
                    response.content.length > 500;
      
      this.testResults.push({
        testName: 'Ensemble Coordination',
        passed,
        duration: Date.now() - startTime,
        details: `Ensemble used: ${response.processing_metadata.ensemble_coordination}, Confidence: ${response.quality_metrics.confidence_score}`,
        error: passed ? undefined : 'Ensemble coordination not triggered or performed poorly'
      });
      
      console.log(passed ? '✅ Ensemble coordination test passed' : '❌ Ensemble coordination test failed');
    } catch (error) {
      this.testResults.push({
        testName: 'Ensemble Coordination',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Exception during ensemble coordination test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Ensemble coordination test failed with error');
    }
  }

  private async testStreamingCapabilities(): Promise<void> {
    console.log('📡 Testing streaming capabilities...');
    
    const startTime = Date.now();
    let chunksReceived = 0;
    let streamingWorked = false;
    
    try {
      const request: EnhancedAIRequest = {
        message: 'Explain the concept of machine learning and provide examples',
        userId: 'test-user',
        projectId: 1,
        streaming: true,
        complexity: 'medium'
      };

      const chunks: any[] = [];
      
      const response = await integratedAIService.processStreamingRequest(
        request,
        (chunk) => {
          chunks.push(chunk);
          chunksReceived++;
          if (chunk.type === 'partial_response' || chunk.type === 'reasoning_step') {
            streamingWorked = true;
          }
        }
      );
      
      const passed = streamingWorked && 
                    chunksReceived > 1 && 
                    response.processing_metadata.streaming_enabled === true;
      
      this.testResults.push({
        testName: 'Streaming Capabilities',
        passed,
        duration: Date.now() - startTime,
        details: `Chunks received: ${chunksReceived}, Streaming enabled: ${response.processing_metadata.streaming_enabled}`,
        error: passed ? undefined : 'Streaming did not work as expected'
      });
      
      console.log(passed ? '✅ Streaming capabilities test passed' : '❌ Streaming capabilities test failed');
    } catch (error) {
      this.testResults.push({
        testName: 'Streaming Capabilities',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Exception during streaming test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Streaming capabilities test failed with error');
    }
  }

  private async testPromptTemplates(): Promise<void> {
    console.log('📝 Testing prompt templates...');
    
    const startTime = Date.now();
    
    try {
      const templates = await integratedAIService.getPromptTemplates();
      
      const request: EnhancedAIRequest = {
        message: 'Analyze this code for potential issues',
        userId: 'test-user',
        projectId: 1,
        template_id: templates.find(t => t.category === 'analysis')?.id,
        complexity: 'medium'
      };

      if (!request.template_id) {
        throw new Error('No analysis template found');
      }

      const response = await integratedAIService.processEnhancedRequest(request);
      
      const passed = templates.length > 0 &&
                    response.processing_metadata.template_used !== undefined;
      
      this.testResults.push({
        testName: 'Prompt Templates',
        passed,
        duration: Date.now() - startTime,
        details: `Templates available: ${templates.length}, Template used: ${response.processing_metadata.template_used || 'none'}`,
        error: passed ? undefined : 'Prompt templates not working properly'
      });
      
      console.log(passed ? '✅ Prompt templates test passed' : '❌ Prompt templates test failed');
    } catch (error) {
      this.testResults.push({
        testName: 'Prompt Templates',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Exception during prompt templates test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Prompt templates test failed with error');
    }
  }

  private async testPerformanceMetrics(): Promise<void> {
    console.log('📊 Testing performance metrics...');
    
    const startTime = Date.now();
    
    try {
      const status = await integratedAIService.getSystemStatus();
      
      const request: EnhancedAIRequest = {
        message: 'Simple test request for performance measurement',
        userId: 'test-user',
        projectId: 1,
        complexity: 'low'
      };

      const response = await integratedAIService.processEnhancedRequest(request);
      
      const passed = status.status === 'operational' &&
                    status.providers.length > 0 &&
                    response.processing_metadata.processing_time > 0 &&
                    response.quality_metrics !== undefined &&
                    response.system_insights !== undefined;
      
      this.testResults.push({
        testName: 'Performance Metrics',
        passed,
        duration: Date.now() - startTime,
        details: `System status: ${status.status}, Providers: ${status.providers.length}, Processing time: ${response.processing_metadata.processing_time}ms`,
        error: passed ? undefined : 'Performance metrics not properly tracked'
      });
      
      console.log(passed ? '✅ Performance metrics test passed' : '❌ Performance metrics test failed');
    } catch (error) {
      this.testResults.push({
        testName: 'Performance Metrics',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Exception during performance metrics test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Performance metrics test failed with error');
    }
  }

  private generateTestReport(): void {
    console.log('\n📋 AI Integration Test Report');
    console.log('================================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const successRate = (passed / total) * 100;
    
    console.log(`\n📊 Overall Results: ${passed}/${total} tests passed (${successRate.toFixed(1)}%)`);
    console.log(`⏱️  Total test duration: ${this.testResults.reduce((sum, r) => sum + r.duration, 0)}ms`);
    
    console.log('\n📝 Test Details:');
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.testName} (${result.duration}ms)`);
      console.log(`   ${result.details}`);
      if (result.error) {
        console.log(`   ⚠️  Error: ${result.error}`);
      }
      console.log();
    });
    
    if (successRate >= 80) {
      console.log('🎉 AI Integration System is working well!');
    } else if (successRate >= 60) {
      console.log('⚠️  AI Integration System has some issues that need attention');
    } else {
      console.log('❌ AI Integration System has significant problems');
    }
    
    console.log('\n🔍 System Capabilities Verified:');
    console.log(`   ${this.testResults.find(r => r.testName === 'Basic Functionality')?.passed ? '✅' : '❌'} Basic AI responses`);
    console.log(`   ${this.testResults.some(r => r.testName.includes('Reasoning Mode') && r.passed) ? '✅' : '❌'} Advanced reasoning modes`);
    console.log(`   ${this.testResults.find(r => r.testName === 'Tool Integration')?.passed ? '✅' : '❌'} Sophisticated tool calling`);
    console.log(`   ${this.testResults.find(r => r.testName === 'Consciousness Integration')?.passed ? '✅' : '❌'} Consciousness and memory integration`);
    console.log(`   ${this.testResults.find(r => r.testName === 'Ensemble Coordination')?.passed ? '✅' : '❌'} Multi-model ensemble coordination`);
    console.log(`   ${this.testResults.find(r => r.testName === 'Streaming Capabilities')?.passed ? '✅' : '❌'} Real-time streaming responses`);
    console.log(`   ${this.testResults.find(r => r.testName === 'Prompt Templates')?.passed ? '✅' : '❌'} Advanced prompt templates`);
    console.log(`   ${this.testResults.find(r => r.testName === 'Performance Metrics')?.passed ? '✅' : '❌'} Performance monitoring`);
  }

  getTestResults() {
    return {
      results: this.testResults,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.passed).length,
        failed: this.testResults.filter(r => !r.passed).length,
        success_rate: (this.testResults.filter(r => r.passed).length / this.testResults.length) * 100,
        total_duration: this.testResults.reduce((sum, r) => sum + r.duration, 0)
      }
    };
  }
}

// Export test runner
export async function runAIIntegrationTests(): Promise<any> {
  const tester = new AIIntegrationTester();
  await tester.runAllTests();
  return tester.getTestResults();
}