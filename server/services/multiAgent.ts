import { db } from "../db";
import { 
  projects, 
  projectFiles,
  multiAgentSessions,
  multiAgentMessages,
  multiAgentTasks,
  type InsertMultiAgentSession,
  type InsertMultiAgentMessage,
  type InsertMultiAgentTask,
  type MultiAgentSession,
  type MultiAgentMessage,
  type MultiAgentTask
} from "@shared/schema";
import { eq, desc, and, gte, or } from "drizzle-orm";
import { EventEmitter } from "events";
import { SuperintelligenceService } from "./superintelligence";
import { consciousnessService } from "./consciousness";
import { aiProviderService } from "./aiProviders";
import { AgentIntelligenceService } from "./agents/agentIntelligence";
import { RealtimeCollaborationService } from "./agents/realtimeCollaboration";
import { 
  BackendArchitectAgent, 
  SecurityAnalystAgent, 
  PerformanceOptimizerAgent, 
  TestingEngineerAgent 
} from "./agents/specializedAgents";
import { 
  BaseAgent, 
  AgentTask, 
  AgentMessage, 
  MessageType, 
  AgentType, 
  AgentStatus, 
  TaskPriority 
} from "./agents/baseAgent";

// Export MultiAgentOrchestrator for consciousness integration
export class MultiAgentOrchestrator extends EventEmitter {
  private orchestrator: OrchestratorAgent;
  private agents: Map<AgentType, BaseAgent> = new Map();
  
  constructor() {
    super();
    this.orchestrator = new OrchestratorAgent(this);
    this.initializeAgents();
  }
  
  private initializeAgents(): void {
    this.agents.set(AgentType.BACKEND_ARCHITECT, new BackendArchitectAgent(this));
    this.agents.set(AgentType.SECURITY_ANALYST, new SecurityAnalystAgent(this));
    this.agents.set(AgentType.PERFORMANCE_OPTIMIZER, new PerformanceOptimizerAgent(this));
    this.agents.set(AgentType.TESTING_ENGINEER, new TestingEngineerAgent(this));
  }
  
  incorporateConsciousnessInsight(insight: any): void {
    this.emit('consciousness-insight', insight);
  }
  
  updateAgentWithConsciousnessFeedback(agentId: string, feedback: any): void {
    this.emit('consciousness-feedback', { agentId, feedback });
  }
}

// Orchestrator Agent - coordinates all other agents
class OrchestratorAgent extends BaseAgent {
  private activeSession?: MultiAgentSession;
  private taskQueue: AgentTask[] = [];
  private agentStatuses = new Map<AgentType, AgentStatus>();

  constructor(eventBus: EventEmitter) {
    super(AgentType.ORCHESTRATOR, eventBus);
  }

  async startSession(projectId: number, userId: string, goal: string) {
    const session: InsertMultiAgentSession = {
      projectId,
      userId,
      goal,
      status: 'active',
      createdAt: new Date()
    };

    const [newSession] = await db.insert(multiAgentSessions).values(session).returning();
    this.activeSession = newSession;

    // Create initial task breakdown
    await this.createTaskBreakdown(goal);
    
    return newSession;
  }

  private async createTaskBreakdown(goal: string) {
    const analysis = await this.superintelligence.analyzeCode(
      this.activeSession?.projectId || 0,
      'task_breakdown',
      `Break down this goal into specific tasks: ${goal}`,
      'text'
    );

    // Create tasks based on analysis
    const tasks = this.parseTasksFromAnalysis(analysis);
    
    for (const task of tasks) {
      this.taskQueue.push(task);
      
      // Save to database
      const dbTask: InsertMultiAgentTask = {
        sessionId: this.activeSession!.id,
        type: task.type,
        description: task.description,
        assignedTo: task.assignedTo!,
        status: task.status,
        priority: task.priority,
        createdAt: new Date()
      };
      
      await db.insert(multiAgentTasks).values(dbTask);
    }

    // Start processing tasks
    this.processTaskQueue();
  }

  private parseTasksFromAnalysis(analysis: any): AgentTask[] {
    // Simple task creation - in real implementation, this would parse AI analysis
    return [
      {
        id: `task_${Date.now()}_1`,
        type: 'frontend',
        description: 'Create user interface components',
        priority: TaskPriority.HIGH,
        assignedTo: AgentType.FRONTEND_EXPERT,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task_${Date.now()}_2`,
        type: 'backend',
        description: 'Implement API endpoints',
        priority: TaskPriority.HIGH,
        assignedTo: AgentType.BACKEND_ARCHITECT,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private async processTaskQueue() {
    for (const task of this.taskQueue) {
      if (task.status === 'pending') {
        // Send task to appropriate agent
        this.sendMessage({
          from: this.type,
          to: task.assignedTo!,
          type: MessageType.TASK_ASSIGNMENT,
          content: task
        });
        
        task.status = 'in_progress';
        task.updatedAt = new Date();
      }
    }
  }

  protected async executeTask(task: AgentTask): Promise<void> {
    // Orchestrator doesn't execute tasks directly
  }

  getSessionStatus() {
    return {
      session: this.activeSession,
      taskQueue: this.taskQueue,
      agentStatuses: Array.from(this.agentStatuses.entries())
    };
  }
}

// Frontend Expert Agent
class FrontendExpertAgent extends BaseAgent {
  constructor(eventBus: EventEmitter) {
    super(AgentType.FRONTEND_EXPERT, eventBus);
  }

  protected async executeTask(task: AgentTask): Promise<void> {
    this.status = AgentStatus.THINKING;
    
    const context = await consciousnessService.query('0', 'frontend_patterns', 'system');
    
    const solution = await aiProviderService.chat(
      `You are a frontend expert. Complete this task:
      Task: ${task.description}
      Context: ${JSON.stringify(context)}
      
      Provide React/TypeScript code with:
      - Modern component patterns
      - Accessibility best practices
      - Responsive design
      - Performance optimization`,
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
          framework: 'react'
        }
      }
    });

    this.status = AgentStatus.IDLE;
  }
}

// Multi-Agent Service - manages the entire multi-agent system
export class MultiAgentService {
  private eventBus = new EventEmitter();
  private agents = new Map<AgentType, BaseAgent>();
  private orchestrator: OrchestratorAgent;
  private intelligenceService: AgentIntelligenceService;
  private collaborationService: RealtimeCollaborationService;

  constructor() {
    // Initialize orchestrator
    this.orchestrator = new OrchestratorAgent(this.eventBus);
    
    // Initialize enhanced services
    this.intelligenceService = new AgentIntelligenceService(this.eventBus);
    this.collaborationService = new RealtimeCollaborationService(this.eventBus);
    
    // Initialize specialized agents
    this.initializeAgents();
    
    // Set up message logging
    this.setupMessageLogging();
  }

  private initializeAgents() {
    try {
      // Create all specialized agents using static imports
      const frontendExpert = new FrontendExpertAgent(this.eventBus);
      const backendArchitect = new BackendArchitectAgent(this.eventBus);
      const securityAnalyst = new SecurityAnalystAgent(this.eventBus);
      const performanceOptimizer = new PerformanceOptimizerAgent(this.eventBus);
      const testingEngineer = new TestingEngineerAgent(this.eventBus);
      
      // Register all agents
      this.agents.set(AgentType.FRONTEND_EXPERT, frontendExpert);
      this.agents.set(AgentType.BACKEND_ARCHITECT, backendArchitect);
      this.agents.set(AgentType.SECURITY_ANALYST, securityAnalyst);
      this.agents.set(AgentType.PERFORMANCE_OPTIMIZER, performanceOptimizer);
      this.agents.set(AgentType.TESTING_ENGINEER, testingEngineer);
      
      console.log('✅ All specialized agents initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize specialized agents:', error);
      throw error;
    }
  }

  private setupMessageLogging() {
    // Log all agent messages to database
    this.eventBus.on('agent_message', async (message: AgentMessage) => {
      if (this.orchestrator['activeSession']) {
        const dbMessage: InsertMultiAgentMessage = {
          sessionId: this.orchestrator['activeSession'].id,
          fromAgent: message.from,
          toAgent: message.to === 'broadcast' ? null : message.to,
          messageType: message.type,
          content: JSON.stringify(message.content),
          timestamp: new Date()
        };
        
        await db.insert(multiAgentMessages).values(dbMessage);
      }
    });
  }

  // Public API methods
  async startSession(projectId: number, userId: string, goal: string) {
    return await this.orchestrator.startSession(projectId, userId, goal);
  }

  getSessionStatus() {
    return this.orchestrator.getSessionStatus();
  }

  getAgentStatus(agentType: AgentType) {
    const agent = this.agents.get(agentType);
    return agent ? agent.getStatus() : AgentStatus.IDLE;
  }

  getAllAgentStatuses() {
    const statuses: Record<string, AgentStatus> = {};
    for (const [type, agent] of this.agents) {
      statuses[type] = agent.getStatus();
    }
    return statuses;
  }

  connectAgentWebSocket(agent: AgentType, ws: any) {
    return this.collaborationService.connectAgent(agent, ws);
  }
}

export const multiAgentService = new MultiAgentService();
