import { EventEmitter } from "events";
import { AgentType, AgentMessage, MessageType, AgentTask } from "./baseAgent";

// Enhanced intelligence patterns for agent collaboration
export class AgentIntelligenceService {
  private eventBus: EventEmitter;
  private conflictResolutionQueue: ConflictResolution[] = [];
  private knowledgeGraph = new Map<string, KnowledgeNode>();
  private collaborationHistory = new Map<string, CollaborationPattern>();

  constructor(eventBus: EventEmitter) {
    this.eventBus = eventBus;
    this.setupIntelligenceListeners();
  }

  private setupIntelligenceListeners() {
    // Listen for conflicts and automatically resolve them
    this.eventBus.on('agent_message', (message: AgentMessage) => {
      if (message.type === MessageType.CONFLICT_DETECTION) {
        this.handleConflictDetection(message);
      }
      if (message.type === MessageType.KNOWLEDGE_SHARE) {
        this.updateKnowledgeGraph(message);
      }
    });
  }

  // Cross-Agent Code Review System
  async initiateCodeReview(code: string, author: AgentType, taskId: string) {
    const reviewers = this.selectOptimalReviewers(author, code);
    
    for (const reviewer of reviewers) {
      this.eventBus.emit('agent_message', {
        from: AgentType.ORCHESTRATOR,
        to: reviewer,
        type: MessageType.REVIEW_REQUEST,
        content: {
          code,
          author,
          taskId,
          reviewType: 'cross_agent_review',
          priority: this.calculateReviewPriority(code, author)
        },
        priority: 'high',
        timestamp: new Date()
      });
    }

    return {
      reviewId: `review_${taskId}_${Date.now()}`,
      reviewers,
      expectedCompletion: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    };
  }

  private selectOptimalReviewers(author: AgentType, code: string): AgentType[] {
    const reviewers: AgentType[] = [];
    
    // Always include security analyst for any code
    if (author !== AgentType.SECURITY_ANALYST) {
      reviewers.push(AgentType.SECURITY_ANALYST);
    }
    
    // Frontend code gets frontend + performance review
    if (code.includes('React') || code.includes('tsx') || code.includes('jsx')) {
      if (author !== AgentType.FRONTEND_EXPERT) reviewers.push(AgentType.FRONTEND_EXPERT);
      if (author !== AgentType.PERFORMANCE_OPTIMIZER) reviewers.push(AgentType.PERFORMANCE_OPTIMIZER);
    }
    
    // Backend code gets backend + testing review
    if (code.includes('express') || code.includes('api') || code.includes('database')) {
      if (author !== AgentType.BACKEND_ARCHITECT) reviewers.push(AgentType.BACKEND_ARCHITECT);
      if (author !== AgentType.TESTING_ENGINEER) reviewers.push(AgentType.TESTING_ENGINEER);
    }
    
    return reviewers;
  }

  private calculateReviewPriority(code: string, author: AgentType): 'low' | 'medium' | 'high' | 'critical' {
    let score = 0;
    
    // Security-sensitive patterns
    if (code.includes('password') || code.includes('auth') || code.includes('token')) score += 3;
    if (code.includes('database') || code.includes('query') || code.includes('sql')) score += 2;
    if (code.includes('api') || code.includes('endpoint') || code.includes('route')) score += 1;
    
    // Complexity indicators
    if (code.length > 1000) score += 1;
    if ((code.match(/function|class|interface/g) || []).length > 5) score += 1;
    
    if (score >= 5) return 'critical';
    if (score >= 3) return 'high';
    if (score >= 1) return 'medium';
    return 'low';
  }

  // Conflict Resolution System
  private async handleConflictDetection(message: AgentMessage) {
    const conflict: ConflictResolution = {
      id: `conflict_${Date.now()}`,
      agents: [message.from, message.content.conflictWith],
      issue: message.content.issue,
      proposals: [],
      status: 'pending',
      createdAt: new Date()
    };

    this.conflictResolutionQueue.push(conflict);
    
    // Request proposals from both agents
    for (const agent of conflict.agents) {
      this.eventBus.emit('agent_message', {
        from: AgentType.ORCHESTRATOR,
        to: agent,
        type: MessageType.INTEGRATION_PROPOSAL,
        content: {
          conflictId: conflict.id,
          issue: conflict.issue,
          requestType: 'resolution_proposal'
        },
        priority: 'high',
        timestamp: new Date()
      });
    }

    // Set timeout for automatic resolution
    setTimeout(() => this.resolveConflictAutomatically(conflict.id), 30000); // 30 seconds
  }

  private async resolveConflictAutomatically(conflictId: string) {
    const conflict = this.conflictResolutionQueue.find(c => c.id === conflictId);
    if (!conflict || conflict.status !== 'pending') return;

    // Use AI to analyze proposals and suggest resolution
    const resolution = await this.analyzeConflictProposals(conflict);
    
    conflict.status = 'resolved';
    conflict.resolution = resolution;

    // Notify all involved agents
    for (const agent of conflict.agents) {
      this.eventBus.emit('agent_message', {
        from: AgentType.ORCHESTRATOR,
        to: agent,
        type: MessageType.INTEGRATION_PROPOSAL,
        content: {
          conflictId,
          resolution,
          action: 'implement_resolution'
        },
        priority: 'high',
        timestamp: new Date()
      });
    }
  }

  private async analyzeConflictProposals(conflict: ConflictResolution): Promise<string> {
    // Simple resolution logic - in real implementation, use AI
    if (conflict.proposals.length === 0) {
      return 'No proposals received. Defaulting to first agent approach.';
    }
    
    // Prefer security analyst's proposal for security conflicts
    const securityProposal = conflict.proposals.find(p => p.agent === AgentType.SECURITY_ANALYST);
    if (securityProposal && conflict.issue.toLowerCase().includes('security')) {
      return securityProposal.proposal;
    }
    
    // Otherwise, use the most detailed proposal
    return conflict.proposals.reduce((best, current) => 
      current.proposal.length > best.proposal.length ? current : best
    ).proposal;
  }

  // Knowledge Sharing & Learning System
  private updateKnowledgeGraph(message: AgentMessage) {
    const nodeId = `${message.from}_${message.content.key || 'general'}`;
    
    const node: KnowledgeNode = {
      id: nodeId,
      agent: message.from,
      knowledge: message.content,
      connections: [],
      lastUpdated: new Date(),
      useCount: (this.knowledgeGraph.get(nodeId)?.useCount || 0) + 1
    };

    this.knowledgeGraph.set(nodeId, node);
    
    // Find related knowledge and create connections
    this.createKnowledgeConnections(node);
  }

  private createKnowledgeConnections(newNode: KnowledgeNode) {
    for (const [id, existingNode] of this.knowledgeGraph) {
      if (id === newNode.id) continue;
      
      // Simple similarity check - in real implementation, use semantic analysis
      const similarity = this.calculateKnowledgeSimilarity(newNode, existingNode);
      
      if (similarity > 0.7) {
        newNode.connections.push(id);
        existingNode.connections.push(newNode.id);
      }
    }
  }

  private calculateKnowledgeSimilarity(node1: KnowledgeNode, node2: KnowledgeNode): number {
    const content1 = JSON.stringify(node1.knowledge).toLowerCase();
    const content2 = JSON.stringify(node2.knowledge).toLowerCase();
    
    // Simple word overlap similarity
    const words1 = new Set(content1.split(/\W+/));
    const words2 = new Set(content2.split(/\W+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  // Dynamic Task Re-assignment
  async optimizeTaskAssignment(tasks: AgentTask[]): Promise<TaskReassignment[]> {
    const reassignments: TaskReassignment[] = [];
    
    for (const task of tasks) {
      if (task.status === 'pending') {
        const optimalAgent = await this.findOptimalAgent(task);
        
        if (optimalAgent !== task.assignedTo && task.assignedTo) {
          reassignments.push({
            taskId: task.id,
            fromAgent: task.assignedTo,
            toAgent: optimalAgent,
            reason: 'workload_optimization',
            confidence: 0.8
          });
        }
      }
    }
    
    return reassignments;
  }

  private async findOptimalAgent(task: AgentTask): Promise<AgentType> {
    // Analyze task content and current agent workloads
    const taskComplexity = this.analyzeTaskComplexity(task);
    const agentWorkloads = await this.getAgentWorkloads();
    
    // Score each agent for this task
    const scores = new Map<AgentType, number>();
    
    for (const agentType of Object.values(AgentType)) {
      if (agentType === AgentType.ORCHESTRATOR) continue;
      
      let score = 0;
      
      // Specialization match
      score += this.getSpecializationScore(task, agentType);
      
      // Workload penalty (prefer less busy agents)
      score -= (agentWorkloads.get(agentType) || 0) * 0.2;
      
      // Historical success rate
      score += this.getHistoricalSuccessRate(agentType, task.type);
      
      scores.set(agentType, score);
    }
    
    // Return agent with highest score
    return Array.from(scores.entries()).reduce((best, current) => 
      current[1] > best[1] ? current : best
    )[0];
  }

  private analyzeTaskComplexity(task: AgentTask): number {
    let complexity = 1;
    
    if (task.description.length > 200) complexity += 1;
    if (task.dependencies && task.dependencies.length > 0) complexity += task.dependencies.length * 0.5;
    if (task.description.toLowerCase().includes('complex') || task.description.toLowerCase().includes('advanced')) complexity += 2;
    
    return Math.min(complexity, 5); // Cap at 5
  }

  private getSpecializationScore(task: AgentTask, agentType: AgentType): number {
    const description = task.description.toLowerCase();
    
    switch (agentType) {
      case AgentType.FRONTEND_EXPERT:
        if (description.includes('ui') || description.includes('react') || description.includes('component')) return 3;
        if (description.includes('frontend') || description.includes('interface')) return 2;
        return 0.5;
        
      case AgentType.BACKEND_ARCHITECT:
        if (description.includes('api') || description.includes('database') || description.includes('server')) return 3;
        if (description.includes('backend') || description.includes('endpoint')) return 2;
        return 0.5;
        
      case AgentType.SECURITY_ANALYST:
        if (description.includes('security') || description.includes('auth') || description.includes('vulnerability')) return 3;
        if (description.includes('validation') || description.includes('encryption')) return 2;
        return 1; // Security is always relevant
        
      case AgentType.PERFORMANCE_OPTIMIZER:
        if (description.includes('performance') || description.includes('optimize') || description.includes('speed')) return 3;
        if (description.includes('cache') || description.includes('memory')) return 2;
        return 0.5;
        
      case AgentType.TESTING_ENGINEER:
        if (description.includes('test') || description.includes('coverage') || description.includes('quality')) return 3;
        if (description.includes('validation') || description.includes('verify')) return 2;
        return 1; // Testing is always valuable
        
      default:
        return 0;
    }
  }

  private async getAgentWorkloads(): Promise<Map<AgentType, number>> {
    // In real implementation, query current task assignments
    return new Map([
      [AgentType.FRONTEND_EXPERT, 2],
      [AgentType.BACKEND_ARCHITECT, 1],
      [AgentType.SECURITY_ANALYST, 3],
      [AgentType.PERFORMANCE_OPTIMIZER, 1],
      [AgentType.TESTING_ENGINEER, 2]
    ]);
  }

  private getHistoricalSuccessRate(agentType: AgentType, taskType: string): number {
    // In real implementation, analyze historical task completion rates
    const baseRates = new Map([
      [AgentType.FRONTEND_EXPERT, 0.85],
      [AgentType.BACKEND_ARCHITECT, 0.90],
      [AgentType.SECURITY_ANALYST, 0.95],
      [AgentType.PERFORMANCE_OPTIMIZER, 0.80],
      [AgentType.TESTING_ENGINEER, 0.88]
    ]);
    
    return baseRates.get(agentType) || 0.75;
  }

  // Public API for getting intelligence insights
  getConflictResolutionStatus(): ConflictResolution[] {
    return this.conflictResolutionQueue.filter(c => c.status === 'pending');
  }

  getKnowledgeInsights(): KnowledgeInsight[] {
    const insights: KnowledgeInsight[] = [];
    
    for (const [id, node] of this.knowledgeGraph) {
      if (node.connections.length > 2) {
        insights.push({
          type: 'highly_connected_knowledge',
          agent: node.agent,
          description: `Agent has valuable knowledge with ${node.connections.length} connections`,
          impact: 'high'
        });
      }
    }
    
    return insights;
  }
}

// Supporting interfaces
interface ConflictResolution {
  id: string;
  agents: AgentType[];
  issue: string;
  proposals: Array<{
    agent: AgentType;
    proposal: string;
    timestamp: Date;
  }>;
  status: 'pending' | 'resolved' | 'escalated';
  resolution?: string;
  createdAt: Date;
}

interface KnowledgeNode {
  id: string;
  agent: AgentType;
  knowledge: any;
  connections: string[];
  lastUpdated: Date;
  useCount: number;
}

interface CollaborationPattern {
  agents: AgentType[];
  taskType: string;
  successRate: number;
  averageTime: number;
  lastUsed: Date;
}

interface TaskReassignment {
  taskId: string;
  fromAgent: AgentType;
  toAgent: AgentType;
  reason: string;
  confidence: number;
}

interface KnowledgeInsight {
  type: string;
  agent: AgentType;
  description: string;
  impact: 'low' | 'medium' | 'high';
}
