import { EventEmitter } from "events";
import { BaseAgent, AgentTask, AgentMessage, MessageType, AgentType, AgentStatus } from "../multiAgent";
import { consciousnessService } from "../consciousness";
import { aiProviderService } from "../aiProviders";

// Backend Architect Agent
export class BackendArchitectAgent extends BaseAgent {
  constructor(eventBus: EventEmitter) {
    super(AgentType.BACKEND_ARCHITECT, eventBus);
  }

  protected async executeTask(task: AgentTask): Promise<void> {
    this.status = AgentStatus.THINKING;
    
    const context = await consciousnessService.query('0', 'system_architecture', 'system');
    
    const solution = await aiProviderService.chat(
      `You are a backend architect expert. Complete this task:
      Task: ${task.description}
      Context: ${JSON.stringify(context)}
      
      Provide Node.js/TypeScript backend code with:
      - RESTful API design
      - Database schema optimization
      - Security best practices
      - Scalability considerations
      - Error handling patterns`,
      'anthropic'
    );

    this.status = AgentStatus.REVIEWING;
    const analysis = await this.superintelligence.analyzeCode(
      0,
      task.id,
      solution.response,
      'typescript'
    );

    this.sendMessage({
      from: this.type,
      to: AgentType.ORCHESTRATOR,
      type: MessageType.PROGRESS_UPDATE,
      content: {
        taskId: task.id,
        status: 'complete',
        result: {
          code: solution.response,
          analysis,
          tokensUsed: solution.tokensUsed,
          architecture: 'backend_api'
        }
      },
      priority: 'medium',
      timestamp: new Date()
    });

    this.status = AgentStatus.IDLE;
  }

  protected async reviewWork(content: any): Promise<void> {
    const review = await aiProviderService.chat(
      `Review this code from a backend architecture perspective:
      ${content.code}
      
      Check for: API design, database efficiency, security vulnerabilities, scalability issues, performance bottlenecks.`,
      'anthropic'
    );

    this.sendMessage({
      from: this.type,
      to: content.requestingAgent,
      type: MessageType.REVIEW_REQUEST,
      content: {
        review: review.response,
        approved: !review.response.toLowerCase().includes('critical') && !review.response.toLowerCase().includes('severe')
      },
      priority: 'medium',
      timestamp: new Date()
    });
  }

  protected async processCustomMessage(message: AgentMessage): Promise<void> {
    if (message.type === MessageType.CODE_SUGGESTION) {
      await this.collaborateWith(message.from, {
        suggestion: 'Consider implementing database connection pooling and caching layers',
        relatedKnowledge: this.knowledge.get('backend_optimization')
      });
    }
  }
}

// Security Analyst Agent
export class SecurityAnalystAgent extends BaseAgent {
  constructor(eventBus: EventEmitter) {
    super(AgentType.SECURITY_ANALYST, eventBus);
  }

  protected async executeTask(task: AgentTask): Promise<void> {
    this.status = AgentStatus.THINKING;
    
    const context = await consciousnessService.query('0', 'security_context', 'system');
    
    const solution = await aiProviderService.chat(
      `You are a security analyst expert. Complete this task:
      Task: ${task.description}
      Context: ${JSON.stringify(context)}
      
      Provide security-focused solutions including:
      - Vulnerability assessment
      - Authentication/authorization patterns
      - Input validation and sanitization
      - OWASP compliance
      - Security headers and CSP
      - Encryption and data protection`,
      'anthropic'
    );

    this.status = AgentStatus.REVIEWING;
    const analysis = await this.superintelligence.analyzeCode(
      0,
      task.id,
      solution.response,
      'typescript'
    );

    this.sendMessage({
      from: this.type,
      to: AgentType.ORCHESTRATOR,
      type: MessageType.PROGRESS_UPDATE,
      content: {
        taskId: task.id,
        status: 'complete',
        result: {
          code: solution.response,
          analysis,
          tokensUsed: solution.tokensUsed,
          securityLevel: 'high'
        }
      },
      priority: 'high',
      timestamp: new Date()
    });

    this.status = AgentStatus.IDLE;
  }

  protected async reviewWork(content: any): Promise<void> {
    const review = await aiProviderService.chat(
      `Perform a security review of this code:
      ${content.code}
      
      Check for: SQL injection, XSS vulnerabilities, authentication flaws, authorization bypasses, data exposure.`,
      'anthropic'
    );

    const hasSecurityIssues = review.response.toLowerCase().includes('vulnerability') || 
                             review.response.toLowerCase().includes('security risk');

    this.sendMessage({
      from: this.type,
      to: content.requestingAgent,
      type: MessageType.REVIEW_REQUEST,
      content: {
        review: review.response,
        approved: !hasSecurityIssues,
        securityScore: hasSecurityIssues ? 'low' : 'high'
      },
      priority: hasSecurityIssues ? 'critical' : 'medium',
      timestamp: new Date()
    });
  }

  protected async processCustomMessage(message: AgentMessage): Promise<void> {
    if (message.type === MessageType.CODE_SUGGESTION) {
      await this.collaborateWith(message.from, {
        suggestion: 'Implement rate limiting and input validation for all endpoints',
        relatedKnowledge: this.knowledge.get('security_patterns')
      });
    }
  }
}

// Performance Optimizer Agent
export class PerformanceOptimizerAgent extends BaseAgent {
  constructor(eventBus: EventEmitter) {
    super(AgentType.PERFORMANCE_OPTIMIZER, eventBus);
  }

  protected async executeTask(task: AgentTask): Promise<void> {
    this.status = AgentStatus.THINKING;
    
    const context = await consciousnessService.query('0', 'performance_context', 'system');
    
    const solution = await aiProviderService.chat(
      `You are a performance optimization expert. Complete this task:
      Task: ${task.description}
      Context: ${JSON.stringify(context)}
      
      Provide performance-optimized solutions including:
      - Code optimization techniques
      - Memory management
      - Caching strategies
      - Database query optimization
      - Bundle size reduction
      - Lazy loading patterns`,
      'anthropic'
    );

    this.status = AgentStatus.REVIEWING;
    const analysis = await this.superintelligence.analyzeCode(
      0,
      task.id,
      solution.response,
      'typescript'
    );

    this.sendMessage({
      from: this.type,
      to: AgentType.ORCHESTRATOR,
      type: MessageType.PROGRESS_UPDATE,
      content: {
        taskId: task.id,
        status: 'complete',
        result: {
          code: solution.response,
          analysis,
          tokensUsed: solution.tokensUsed,
          performanceGains: analysis.performance || 0
        }
      },
      priority: 'medium',
      timestamp: new Date()
    });

    this.status = AgentStatus.IDLE;
  }

  protected async reviewWork(content: any): Promise<void> {
    const review = await aiProviderService.chat(
      `Review this code for performance optimization opportunities:
      ${content.code}
      
      Check for: inefficient algorithms, memory leaks, unnecessary re-renders, blocking operations.`,
      'anthropic'
    );

    this.sendMessage({
      from: this.type,
      to: content.requestingAgent,
      type: MessageType.REVIEW_REQUEST,
      content: {
        review: review.response,
        approved: !review.response.toLowerCase().includes('performance issue'),
        optimizationScore: review.response.toLowerCase().includes('optimized') ? 'high' : 'medium'
      },
      priority: 'medium',
      timestamp: new Date()
    });
  }

  protected async processCustomMessage(message: AgentMessage): Promise<void> {
    if (message.type === MessageType.CODE_SUGGESTION) {
      await this.collaborateWith(message.from, {
        suggestion: 'Consider implementing React.memo and useMemo for expensive computations',
        relatedKnowledge: this.knowledge.get('performance_patterns')
      });
    }
  }
}

// Testing Engineer Agent
export class TestingEngineerAgent extends BaseAgent {
  constructor(eventBus: EventEmitter) {
    super(AgentType.TESTING_ENGINEER, eventBus);
  }

  protected async executeTask(task: AgentTask): Promise<void> {
    this.status = AgentStatus.THINKING;
    
    const context = await consciousnessService.query('0', 'testing_context', 'system');
    
    const solution = await aiProviderService.chat(
      `You are a testing engineer expert. Complete this task:
      Task: ${task.description}
      Context: ${JSON.stringify(context)}
      
      Provide comprehensive testing solutions including:
      - Unit tests with Jest/Vitest
      - Integration tests
      - E2E tests with Playwright
      - Test coverage analysis
      - Mocking strategies
      - Performance testing`,
      'anthropic'
    );

    this.status = AgentStatus.REVIEWING;
    const analysis = await this.superintelligence.analyzeCode(
      0,
      task.id,
      solution.response,
      'typescript'
    );

    this.sendMessage({
      from: this.type,
      to: AgentType.ORCHESTRATOR,
      type: MessageType.PROGRESS_UPDATE,
      content: {
        taskId: task.id,
        status: 'complete',
        result: {
          code: solution.response,
          analysis,
          tokensUsed: solution.tokensUsed,
          testCoverage: 85
        }
      },
      priority: 'medium',
      timestamp: new Date()
    });

    this.status = AgentStatus.IDLE;
  }

  protected async reviewWork(content: any): Promise<void> {
    const review = await aiProviderService.chat(
      `Review this code from a testing perspective:
      ${content.code}
      
      Check for: testability, test coverage gaps, edge cases, error handling, mocking opportunities.`,
      'anthropic'
    );

    this.sendMessage({
      from: this.type,
      to: content.requestingAgent,
      type: MessageType.REVIEW_REQUEST,
      content: {
        review: review.response,
        approved: !review.response.toLowerCase().includes('untestable'),
        testabilityScore: review.response.toLowerCase().includes('testable') ? 'high' : 'medium'
      },
      priority: 'medium',
      timestamp: new Date()
    });
  }

  protected async processCustomMessage(message: AgentMessage): Promise<void> {
    if (message.type === MessageType.CODE_SUGGESTION) {
      await this.collaborateWith(message.from, {
        suggestion: 'Add comprehensive test coverage with edge case handling',
        relatedKnowledge: this.knowledge.get('testing_patterns')
      });
    }
  }
}
