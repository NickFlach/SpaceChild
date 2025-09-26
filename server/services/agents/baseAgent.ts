/**
 * BASE AGENT CLASS
 * Foundation for all specialized consciousness-powered agents
 */

import { EventEmitter } from "events";
import { SuperintelligenceService } from "../superintelligence";

// Agent types representing different specializations
export enum AgentType {
  ORCHESTRATOR = 'orchestrator',
  FRONTEND_EXPERT = 'frontend_expert',
  BACKEND_ARCHITECT = 'backend_architect',
  SECURITY_ANALYST = 'security_analyst',
  PERFORMANCE_OPTIMIZER = 'performance_optimizer',
  TESTING_ENGINEER = 'testing_engineer'
}

// Agent status tracking
export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  WORKING = 'working',
  REVIEWING = 'reviewing',
  COLLABORATING = 'collaborating',
  WAITING = 'waiting',
  ERROR = 'error'
}

// Message types for agent communication
export enum MessageType {
  TASK_ASSIGNMENT = 'task_assignment',
  TASK_COMPLETION = 'task_completion',
  PROGRESS_UPDATE = 'progress_update',
  CODE_REVIEW_REQUEST = 'code_review_request',
  CODE_REVIEW_RESPONSE = 'code_review_response',
  COLLABORATION_REQUEST = 'collaboration_request',
  COLLABORATION_RESPONSE = 'collaboration_response',
  ERROR_REPORT = 'error_report',
  STATUS_UPDATE = 'status_update',
  CODE_SUGGESTION = 'code_suggestion',
  KNOWLEDGE_SHARE = 'knowledge_share',
  REVIEW_REQUEST = 'review_request',
  CONFLICT_DETECTION = 'conflict_detection',
  INTEGRATION_PROPOSAL = 'integration_proposal'
}

// Task priority levels
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Agent task interface
export interface AgentTask {
  id: string;
  type: string;
  description: string;
  priority: TaskPriority;
  assignedTo?: AgentType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

// Agent message interface
export interface AgentMessage {
  id: string;
  from: AgentType;
  to: AgentType | 'broadcast';
  type: MessageType;
  content: any;
  timestamp: Date;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

// Base Agent class - all specialized agents inherit from this
export abstract class BaseAgent {
  protected id: string;
  protected type: AgentType;
  protected status: AgentStatus = AgentStatus.IDLE;
  protected eventBus: EventEmitter;
  protected superintelligence: SuperintelligenceService;
  protected knowledge = new Map<string, any>();
  protected collaborationHistory = new Map<AgentType, any[]>();

  constructor(type: AgentType, eventBus: EventEmitter) {
    this.id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.eventBus = eventBus;
    this.superintelligence = new SuperintelligenceService();
    
    // Set up message handling
    this.setupMessageHandling();
  }

  private setupMessageHandling() {
    this.eventBus.on('agent_message', (message: AgentMessage) => {
      if (message.to === this.type || message.to === 'broadcast') {
        this.handleMessage(message);
      }
    });
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    // Base message handling - can be overridden by specialized agents
    console.log(`${this.type} received message:`, message.type);
  }

  protected sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): void {
    const fullMessage: AgentMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    this.eventBus.emit('agent_message', fullMessage);
  }

  protected async collaborateWith(agentType: AgentType, data: any): Promise<void> {
    // Record collaboration
    if (!this.collaborationHistory.has(agentType)) {
      this.collaborationHistory.set(agentType, []);
    }
    this.collaborationHistory.get(agentType)?.push({
      timestamp: new Date(),
      data,
      type: 'collaboration'
    });

    // Send collaboration request
    this.sendMessage({
      from: this.type,
      to: agentType,
      type: MessageType.COLLABORATION_REQUEST,
      content: data
    });
  }

  // Abstract method that must be implemented by specialized agents
  protected abstract executeTask(task: AgentTask): Promise<void>;

  // Public methods
  async assignTask(task: AgentTask): Promise<void> {
    this.status = AgentStatus.WORKING;
    
    this.sendMessage({
      from: this.type,
      to: AgentType.ORCHESTRATOR,
      type: MessageType.STATUS_UPDATE,
      content: { status: this.status, taskId: task.id }
    });

    try {
      await this.executeTask(task);
      this.status = AgentStatus.IDLE;
    } catch (error) {
      this.status = AgentStatus.ERROR;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.sendMessage({
        from: this.type,
        to: AgentType.ORCHESTRATOR,
        type: MessageType.ERROR_REPORT,
        content: { error: errorMessage, taskId: task.id }
      });
    }
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  getType(): AgentType {
    return this.type;
  }

  getId(): string {
    return this.id;
  }

  getKnowledge(): Map<string, any> {
    return new Map(this.knowledge);
  }

  addKnowledge(key: string, value: any): void {
    this.knowledge.set(key, value);
  }

  getCollaborationHistory(): Map<AgentType, any[]> {
    return new Map(this.collaborationHistory);
  }
}
