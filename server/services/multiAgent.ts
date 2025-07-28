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

// Agent types representing different specializations
export enum AgentType {
  ORCHESTRATOR = 'orchestrator',
  FRONTEND_EXPERT = 'frontend_expert',
  BACKEND_ARCHITECT = 'backend_architect',
  SECURITY_ANALYST = 'security_analyst',
  PERFORMANCE_OPTIMIZER = 'performance_optimizer',
  TESTING_ENGINEER = 'testing_engineer'
}

// Agent status for tracking state
export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  WORKING = 'working',
  COLLABORATING = 'collaborating',
  REVIEWING = 'reviewing',
  COMPLETE = 'complete'
}

// Message types for agent communication
export enum MessageType {
  TASK_ASSIGNMENT = 'task_assignment',
  PROGRESS_UPDATE = 'progress_update',
  CODE_SUGGESTION = 'code_suggestion',
  REVIEW_REQUEST = 'review_request',
  CONFLICT_DETECTION = 'conflict_detection',
  INTEGRATION_PROPOSAL = 'integration_proposal',
  KNOWLEDGE_SHARE = 'knowledge_share'
}

interface AgentMessage {
  from: AgentType;
  to: AgentType | 'broadcast';
  type: MessageType;
  content: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  requiresResponse?: boolean;
}

interface AgentTask {
  id: string;
  type: string;
  description: string;
  assignedTo: AgentType;
  status: 'pending' | 'in_progress' | 'review' | 'complete';
  dependencies?: string[];
  result?: any;
  startedAt?: Date;
  completedAt?: Date;
}

// Base Agent class - all specialized agents inherit from this
abstract class BaseAgent {
  protected id: string;
  protected type: AgentType;
  protected status: AgentStatus = AgentStatus.IDLE;
  protected eventBus: EventEmitter;
  protected superintelligence: SuperintelligenceService;
  protected currentTask?: AgentTask;
  protected knowledge: Map<string, any> = new Map();

  constructor(
    type: AgentType,
    eventBus: EventEmitter
  ) {
    this.id = `${type}_${Date.now()}`;
    this.type = type;
    this.eventBus = eventBus;
    this.superintelligence = new SuperintelligenceService();
    
    // Subscribe to relevant messages
    this.subscribeToMessages();
  }

  protected subscribeToMessages() {
    this.eventBus.on('agent_message', (message: AgentMessage) => {
      if (message.to === this.type || message.to === 'broadcast') {
        this.handleMessage(message);
      }
    });
  }

  protected async handleMessage(message: AgentMessage) {
    console.log(`[${this.type}] Received message:`, message.type, 'from', message.from);

    switch (message.type) {
      case MessageType.TASK_ASSIGNMENT:
        await this.assignTask(message.content);
        break;
      case MessageType.REVIEW_REQUEST:
        await this.reviewWork(message.content);
        break;
      case MessageType.KNOWLEDGE_SHARE:
        this.updateKnowledge(message.content);
        break;
      default:
        await this.processCustomMessage(message);
    }
  }

  protected async assignTask(task: AgentTask) {
    this.currentTask = task;
    this.status = AgentStatus.WORKING;
    
    // Notify orchestrator of task acceptance
    this.sendMessage({
      from: this.type,
      to: AgentType.ORCHESTRATOR,
      type: MessageType.PROGRESS_UPDATE,
      content: {
        taskId: task.id,
        status: 'accepted',
        agent: this.type
      },
      priority: 'medium',
      timestamp: new Date()
    });

    // Execute the task
    await this.executeTask(task);
  }

  protected abstract executeTask(task: AgentTask): Promise<void>;
  protected abstract reviewWork(content: any): Promise<void>;
  protected abstract processCustomMessage(message: AgentMessage): Promise<void>;

  protected sendMessage(message: AgentMessage) {
    this.eventBus.emit('agent_message', message);
  }

  protected updateKnowledge(knowledge: { key: string; value: any }) {
    this.knowledge.set(knowledge.key, knowledge.value);
  }

  protected async collaborateWith(agent: AgentType, content: any) {
    this.status = AgentStatus.COLLABORATING;
    this.sendMessage({
      from: this.type,
      to: agent,
      type: MessageType.KNOWLEDGE_SHARE,
      content,
      priority: 'high',
      timestamp: new Date(),
      requiresResponse: true
    });
  }

  public getStatus(): AgentStatus {
    return this.status;
  }

  public getCurrentTask(): AgentTask | undefined {
    return this.currentTask;
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
      startedAt: new Date()
    };

    const [createdSession] = await db.insert(multiAgentSessions).values(session).returning();
    this.activeSession = createdSession;

    // Analyze the goal and create task breakdown
    await this.analyzeAndPlanTasks(goal, projectId);
  }

  private async analyzeAndPlanTasks(goal: string, projectId: number) {
    // Use consciousness and superintelligence to understand the goal
    const context = await consciousnessService.query(projectId.toString(), 'project_context', 'system');
    
    // Get AI to break down the goal into tasks
    const breakdown = await aiProviderService.chat(
      `You are an expert project orchestrator. Break down this goal into specific development tasks:
      Goal: ${goal}
      Project Context: ${JSON.stringify(context)}
      
      Provide a JSON array of tasks with: type, description, dependencies, and suggested agent.
      Agent types: frontend_expert, backend_architect, security_analyst, performance_optimizer, testing_engineer`,
      'anthropic',
      projectId
    );

    // Parse and create tasks
    try {
      const tasks = JSON.parse(breakdown.response);
      for (const task of tasks) {
        const agentTask: AgentTask = {
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: task.type,
          description: task.description,
          assignedTo: task.suggestedAgent || AgentType.FRONTEND_EXPERT,
          status: 'pending',
          dependencies: task.dependencies || []
        };
        
        this.taskQueue.push(agentTask);
        
        // Store in database
        const dbTask: InsertMultiAgentTask = {
          sessionId: this.activeSession!.id,
          agentType: agentTask.assignedTo,
          taskType: agentTask.type,
          description: agentTask.description,
          status: 'pending',
          dependencies: agentTask.dependencies,
          createdAt: new Date()
        };
        
        await db.insert(multiAgentTasks).values(dbTask);
      }
    } catch (error) {
      console.error('Failed to parse task breakdown:', error);
    }

    // Start distributing tasks
    await this.distributeTasks();
  }

  private async distributeTasks() {
    for (const task of this.taskQueue) {
      if (task.status === 'pending' && this.areDependenciesMet(task)) {
        // Check if assigned agent is available
        const agentStatus = this.agentStatuses.get(task.assignedTo);
        if (!agentStatus || agentStatus === AgentStatus.IDLE) {
          // Assign the task
          this.sendMessage({
            from: this.type,
            to: task.assignedTo,
            type: MessageType.TASK_ASSIGNMENT,
            content: task,
            priority: 'high',
            timestamp: new Date()
          });
          
          task.status = 'in_progress';
          task.startedAt = new Date();
        }
      }
    }
  }

  private areDependenciesMet(task: AgentTask): boolean {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    
    return task.dependencies.every(depId => {
      const depTask = this.taskQueue.find(t => t.id === depId);
      return depTask && depTask.status === 'complete';
    });
  }

  protected async executeTask(task: AgentTask): Promise<void> {
    // Orchestrator doesn't execute tasks directly
  }

  protected async reviewWork(content: any): Promise<void> {
    // Review completed work and decide on integration
    const review = await this.superintelligence.analyzeCode(
      content.projectId,
      content.fileId,
      content.code,
      content.language
    );

    if (review.complexity < 50 && review.issues.filter(i => i.severity === 'critical').length === 0) {
      // Approve the work
      this.sendMessage({
        from: this.type,
        to: content.agent,
        type: MessageType.PROGRESS_UPDATE,
        content: {
          taskId: content.taskId,
          status: 'approved',
          feedback: 'Work approved for integration'
        },
        priority: 'medium',
        timestamp: new Date()
      });
    } else {
      // Request improvements
      this.sendMessage({
        from: this.type,
        to: content.agent,
        type: MessageType.REVIEW_REQUEST,
        content: {
          taskId: content.taskId,
          status: 'needs_improvement',
          feedback: review.issues
        },
        priority: 'high',
        timestamp: new Date()
      });
    }
  }

  protected async processCustomMessage(message: AgentMessage): Promise<void> {
    if (message.type === MessageType.PROGRESS_UPDATE) {
      // Update agent status
      this.agentStatuses.set(message.from, message.content.status);
      
      // Check if task is complete
      if (message.content.status === 'complete') {
        const task = this.taskQueue.find(t => t.id === message.content.taskId);
        if (task) {
          task.status = 'complete';
          task.completedAt = new Date();
          task.result = message.content.result;
          
          // Update database
          await db.update(multiAgentTasks)
            .set({
              status: 'complete',
              result: task.result,
              completedAt: task.completedAt
            })
            .where(eq(multiAgentTasks.id, parseInt(task.id.split('_')[1])));
          
          // Check for new tasks to distribute
          await this.distributeTasks();
        }
      }
    }
  }

  async getSessionStatus(): Promise<any> {
    if (!this.activeSession) return null;
    
    const tasks = await db.select()
      .from(multiAgentTasks)
      .where(eq(multiAgentTasks.sessionId, this.activeSession.id));
    
    const messages = await db.select()
      .from(multiAgentMessages)
      .where(eq(multiAgentMessages.sessionId, this.activeSession.id))
      .orderBy(desc(multiAgentMessages.timestamp));
    
    return {
      session: this.activeSession,
      tasks,
      messages: messages.slice(0, 50), // Last 50 messages
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
    
    // Use consciousness to understand project context
    const context = await consciousnessService.query('0', 'project_context', 'system'); // Would use actual project ID
    
    // Generate frontend solution
    const solution = await aiProviderService.chat(
      `You are a frontend expert. Complete this task:
      Task: ${task.description}
      Context: ${JSON.stringify(context)}
      
      Provide React/TypeScript code with best practices for UI/UX, accessibility, and performance.`,
      'anthropic'
    );

    // Review the generated code
    this.status = AgentStatus.REVIEWING;
    const analysis = await this.superintelligence.analyzeCode(
      0, // project ID
      task.id,
      solution.response,
      'typescript'
    );

    // Send result back to orchestrator
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
          tokensUsed: solution.tokensUsed
        }
      },
      priority: 'medium',
      timestamp: new Date()
    });

    this.status = AgentStatus.IDLE;
  }

  protected async reviewWork(content: any): Promise<void> {
    // Review other agents' frontend-related work
    const review = await aiProviderService.chat(
      `Review this code from a frontend perspective:
      ${content.code}
      
      Check for: UI/UX issues, accessibility problems, React best practices, performance concerns.`,
      'anthropic'
    );

    this.sendMessage({
      from: this.type,
      to: content.requestingAgent,
      type: MessageType.REVIEW_REQUEST,
      content: {
        review: review.response,
        approved: !review.response.includes('critical') && !review.response.includes('severe')
      },
      priority: 'medium',
      timestamp: new Date()
    });
  }

  protected async processCustomMessage(message: AgentMessage): Promise<void> {
    // Handle frontend-specific messages
    if (message.type === MessageType.CODE_SUGGESTION) {
      // Collaborate on code suggestions
      await this.collaborateWith(message.from, {
        suggestion: 'Consider using React.memo for performance optimization',
        relatedKnowledge: this.knowledge.get('react_optimization')
      });
    }
  }
}

// Multi-Agent Service - manages the entire multi-agent system
export class MultiAgentService {
  private eventBus = new EventEmitter();
  private agents = new Map<AgentType, BaseAgent>();
  private orchestrator: OrchestratorAgent;

  constructor() {
    // Initialize orchestrator
    this.orchestrator = new OrchestratorAgent(this.eventBus);
    
    // Initialize specialized agents
    this.initializeAgents();
    
    // Set up message logging
    this.setupMessageLogging();
  }

  private initializeAgents() {
    // Create all specialized agents
    const frontendExpert = new FrontendExpertAgent(this.eventBus);
    
    this.agents.set(AgentType.FRONTEND_EXPERT, frontendExpert);
    
    // TODO: Initialize other agent types
    // - BackendArchitectAgent
    // - SecurityAnalystAgent
    // - PerformanceOptimizerAgent
    // - TestingEngineerAgent
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
          content: message.content,
          priority: message.priority,
          timestamp: message.timestamp
        };
        
        await db.insert(multiAgentMessages).values(dbMessage);
      }
    });
  }

  async startCollaboration(projectId: number, userId: string, goal: string) {
    await this.orchestrator.startSession(projectId, userId, goal);
  }

  async getStatus() {
    return this.orchestrator.getSessionStatus();
  }

  getAgentStatuses() {
    const statuses: Record<string, any> = {};
    
    for (const [type, agent] of this.agents) {
      statuses[type] = {
        status: agent.getStatus(),
        currentTask: agent.getCurrentTask()
      };
    }
    
    return statuses;
  }
}

export const multiAgentService = new MultiAgentService();