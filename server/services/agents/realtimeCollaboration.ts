import { EventEmitter } from "events";
import { WebSocket } from "ws";
import { AgentType, AgentMessage, MessageType } from "../multiAgent";

// Real-time collaborative editing and code streaming
export class RealtimeCollaborationService {
  private eventBus: EventEmitter;
  private collaborationSessions = new Map<string, CollaborationSession>();
  private agentConnections = new Map<AgentType, WebSocket>();
  private codeStreams = new Map<string, CodeStream>();

  constructor(eventBus: EventEmitter) {
    this.eventBus = eventBus;
    this.setupCollaborationListeners();
  }

  private setupCollaborationListeners() {
    this.eventBus.on('agent_message', (message: AgentMessage) => {
      if (message.type === MessageType.CODE_SUGGESTION) {
        this.handleCodeSuggestion(message);
      }
    });
  }

  // Live Code Streaming Between Agents
  async startCodeStream(sessionId: string, agents: AgentType[]): Promise<CodeStream> {
    const stream: CodeStream = {
      id: `stream_${sessionId}_${Date.now()}`,
      sessionId,
      participants: agents,
      codeBuffer: '',
      operations: [],
      lastSync: new Date(),
      isActive: true
    };

    this.codeStreams.set(stream.id, stream);

    // Notify all agents about the new stream
    for (const agent of agents) {
      this.broadcastToAgent(agent, {
        type: 'stream_started',
        streamId: stream.id,
        participants: agents,
        timestamp: new Date()
      });
    }

    return stream;
  }

  // Operational Transform for Concurrent Editing
  async applyCodeOperation(streamId: string, operation: CodeOperation): Promise<void> {
    const stream = this.codeStreams.get(streamId);
    if (!stream || !stream.isActive) return;

    // Transform operation against concurrent operations
    const transformedOp = this.transformOperation(operation, stream.operations);
    
    // Apply operation to code buffer
    stream.codeBuffer = this.applyOperation(stream.codeBuffer, transformedOp);
    stream.operations.push(transformedOp);
    stream.lastSync = new Date();

    // Broadcast to all participants except the author
    for (const agent of stream.participants) {
      if (agent !== operation.author) {
        this.broadcastToAgent(agent, {
          type: 'code_operation',
          streamId,
          operation: transformedOp,
          codeBuffer: stream.codeBuffer,
          timestamp: new Date()
        });
      }
    }

    // Trigger real-time analysis
    await this.analyzeCodeInRealtime(stream);
  }

  private transformOperation(newOp: CodeOperation, existingOps: CodeOperation[]): CodeOperation {
    let transformedOp = { ...newOp };

    // Transform against all operations that happened after this one's base
    for (const existingOp of existingOps) {
      if (existingOp.timestamp > newOp.baseTimestamp) {
        transformedOp = this.operationalTransform(transformedOp, existingOp);
      }
    }

    return transformedOp;
  }

  private operationalTransform(op1: CodeOperation, op2: CodeOperation): CodeOperation {
    // Simplified operational transform - in production, use a proper OT library
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op2.position <= op1.position) {
        return {
          ...op1,
          position: op1.position + op2.content.length
        };
      }
    }
    
    if (op1.type === 'delete' && op2.type === 'insert') {
      if (op2.position <= op1.position) {
        return {
          ...op1,
          position: op1.position + op2.content.length
        };
      }
    }

    return op1;
  }

  private applyOperation(code: string, operation: CodeOperation): string {
    switch (operation.type) {
      case 'insert':
        return code.slice(0, operation.position) + 
               operation.content + 
               code.slice(operation.position);
      
      case 'delete':
        return code.slice(0, operation.position) + 
               code.slice(operation.position + operation.length);
      
      case 'replace':
        return code.slice(0, operation.position) + 
               operation.content + 
               code.slice(operation.position + operation.length);
      
      default:
        return code;
    }
  }

  // Real-time Code Analysis & Suggestions
  private async analyzeCodeInRealtime(stream: CodeStream): Promise<void> {
    // Debounce analysis to avoid too frequent calls
    clearTimeout(stream.analysisTimeout);
    
    stream.analysisTimeout = setTimeout(async () => {
      const analysis = await this.performCodeAnalysis(stream.codeBuffer);
      
      // Broadcast analysis results to all participants
      for (const agent of stream.participants) {
        this.broadcastToAgent(agent, {
          type: 'realtime_analysis',
          streamId: stream.id,
          analysis,
          suggestions: this.generateContextualSuggestions(analysis, agent),
          timestamp: new Date()
        });
      }
    }, 1000); // 1 second debounce
  }

  private async performCodeAnalysis(code: string): Promise<RealtimeAnalysis> {
    // Simplified analysis - in production, integrate with superintelligence service
    const lines = code.split('\n');
    const functions = (code.match(/function\s+\w+|const\s+\w+\s*=/g) || []).length;
    const complexity = this.calculateCyclomaticComplexity(code);
    
    return {
      lineCount: lines.length,
      functionCount: functions,
      complexity,
      issues: this.detectIssues(code),
      suggestions: this.generateSuggestions(code),
      timestamp: new Date()
    };
  }

  private calculateCyclomaticComplexity(code: string): number {
    // Simplified complexity calculation
    const conditionals = (code.match(/if|else|while|for|switch|case|\?/g) || []).length;
    return conditionals + 1;
  }

  private detectIssues(code: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    // Security issues
    if (code.includes('eval(') || code.includes('innerHTML')) {
      issues.push({
        type: 'security',
        severity: 'high',
        message: 'Potential XSS vulnerability detected',
        line: this.findLineNumber(code, 'eval(|innerHTML')
      });
    }
    
    // Performance issues
    if (code.includes('document.getElementById') && code.split('document.getElementById').length > 3) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: 'Multiple DOM queries detected - consider caching',
        line: this.findLineNumber(code, 'document.getElementById')
      });
    }
    
    return issues;
  }

  private generateSuggestions(code: string): string[] {
    const suggestions: string[] = [];
    
    if (code.includes('var ')) {
      suggestions.push('Consider using const/let instead of var for better scoping');
    }
    
    if (code.includes('== ') || code.includes('!= ')) {
      suggestions.push('Use strict equality (=== / !==) for type safety');
    }
    
    if (!code.includes('try') && code.includes('await')) {
      suggestions.push('Consider adding error handling for async operations');
    }
    
    return suggestions;
  }

  private generateContextualSuggestions(analysis: RealtimeAnalysis, agent: AgentType): string[] {
    const suggestions: string[] = [];
    
    switch (agent) {
      case AgentType.SECURITY_ANALYST:
        if (analysis.issues.some(i => i.type === 'security')) {
          suggestions.push('Security vulnerabilities detected - immediate attention required');
        }
        suggestions.push('Add input validation and sanitization');
        break;
        
      case AgentType.PERFORMANCE_OPTIMIZER:
        if (analysis.complexity > 10) {
          suggestions.push('High complexity detected - consider refactoring');
        }
        suggestions.push('Optimize for better performance and memory usage');
        break;
        
      case AgentType.TESTING_ENGINEER:
        suggestions.push('Add unit tests for new functions');
        if (analysis.functionCount > 0) {
          suggestions.push(`${analysis.functionCount} functions need test coverage`);
        }
        break;
        
      case AgentType.FRONTEND_EXPERT:
        suggestions.push('Ensure accessibility and responsive design');
        if (analysis.issues.some(i => i.message.includes('DOM'))) {
          suggestions.push('Optimize DOM interactions for better UX');
        }
        break;
        
      case AgentType.BACKEND_ARCHITECT:
        suggestions.push('Consider scalability and database optimization');
        break;
    }
    
    return suggestions;
  }

  private findLineNumber(code: string, pattern: string): number {
    const lines = code.split('\n');
    const regex = new RegExp(pattern);
    
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        return i + 1;
      }
    }
    
    return 1;
  }

  // Agent-to-Agent Code Suggestions
  private async handleCodeSuggestion(message: AgentMessage): Promise<void> {
    const suggestion: AgentCodeSuggestion = {
      id: `suggestion_${Date.now()}`,
      fromAgent: message.from,
      toAgent: message.to as AgentType,
      suggestion: message.content.suggestion,
      codeContext: message.content.codeContext,
      confidence: message.content.confidence || 0.8,
      timestamp: new Date()
    };

    // Store suggestion for tracking
    await this.storeSuggestion(suggestion);

    // If target agent is in an active stream, inject suggestion
    const activeStreams = Array.from(this.codeStreams.values())
      .filter(s => s.isActive && s.participants.includes(suggestion.toAgent));

    for (const stream of activeStreams) {
      this.broadcastToAgent(suggestion.toAgent, {
        type: 'agent_suggestion',
        streamId: stream.id,
        suggestion,
        timestamp: new Date()
      });
    }
  }

  // Collaborative Conflict Resolution
  async resolveCodeConflict(streamId: string, conflict: CodeConflict): Promise<ConflictResolution> {
    const stream = this.codeStreams.get(streamId);
    if (!stream) throw new Error('Stream not found');

    // Pause the stream during conflict resolution
    stream.isActive = false;

    // Get proposals from involved agents
    const proposals = await this.gatherConflictProposals(conflict);
    
    // Use AI to analyze and suggest resolution
    const resolution = await this.analyzeConflictProposals(proposals);
    
    // Apply resolution to stream
    stream.codeBuffer = resolution.resolvedCode;
    stream.operations.push({
      type: 'replace',
      position: 0,
      length: stream.codeBuffer.length,
      content: resolution.resolvedCode,
      author: AgentType.ORCHESTRATOR,
      timestamp: new Date(),
      baseTimestamp: new Date()
    });

    // Resume stream
    stream.isActive = true;

    // Notify all participants
    for (const agent of stream.participants) {
      this.broadcastToAgent(agent, {
        type: 'conflict_resolved',
        streamId,
        resolution,
        newCode: resolution.resolvedCode,
        timestamp: new Date()
      });
    }

    return resolution;
  }

  private async gatherConflictProposals(conflict: CodeConflict): Promise<ConflictProposal[]> {
    // In real implementation, request proposals from agents
    return [
      {
        agent: conflict.agents[0],
        proposal: conflict.version1,
        reasoning: 'Maintains original functionality'
      },
      {
        agent: conflict.agents[1],
        proposal: conflict.version2,
        reasoning: 'Improves performance and security'
      }
    ];
  }

  private async analyzeConflictProposals(proposals: ConflictProposal[]): Promise<ConflictResolution> {
    // Simplified resolution - in production, use AI analysis
    const bestProposal = proposals.reduce((best, current) => 
      current.proposal.length > best.proposal.length ? current : best
    );

    return {
      resolvedCode: bestProposal.proposal,
      reasoning: `Selected proposal from ${bestProposal.agent}: ${bestProposal.reasoning}`,
      confidence: 0.85,
      timestamp: new Date()
    };
  }

  // WebSocket Management for Real-time Communication
  connectAgent(agent: AgentType, ws: WebSocket): void {
    this.agentConnections.set(agent, ws);
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleAgentMessage(agent, message);
      } catch (error) {
        console.error('Failed to parse agent message:', error);
      }
    });

    ws.on('close', () => {
      this.agentConnections.delete(agent);
    });
  }

  private handleAgentMessage(agent: AgentType, message: any): void {
    switch (message.type) {
      case 'code_operation':
        this.applyCodeOperation(message.streamId, {
          ...message.operation,
          author: agent
        });
        break;
        
      case 'suggestion':
        this.eventBus.emit('agent_message', {
          from: agent,
          to: message.targetAgent,
          type: MessageType.CODE_SUGGESTION,
          content: message.content,
          priority: 'medium',
          timestamp: new Date()
        });
        break;
    }
  }

  private broadcastToAgent(agent: AgentType, message: any): void {
    const connection = this.agentConnections.get(agent);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
    }
  }

  private async storeSuggestion(suggestion: AgentCodeSuggestion): Promise<void> {
    // In real implementation, store in database
    console.log('Storing suggestion:', suggestion);
  }

  // Public API
  getActiveStreams(): CodeStream[] {
    return Array.from(this.codeStreams.values()).filter(s => s.isActive);
  }

  getStreamById(streamId: string): CodeStream | undefined {
    return this.codeStreams.get(streamId);
  }

  async endStream(streamId: string): Promise<void> {
    const stream = this.codeStreams.get(streamId);
    if (stream) {
      stream.isActive = false;
      
      // Notify all participants
      for (const agent of stream.participants) {
        this.broadcastToAgent(agent, {
          type: 'stream_ended',
          streamId,
          finalCode: stream.codeBuffer,
          timestamp: new Date()
        });
      }
    }
  }
}

// Supporting interfaces
interface CollaborationSession {
  id: string;
  participants: AgentType[];
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'paused' | 'completed';
}

interface CodeStream {
  id: string;
  sessionId: string;
  participants: AgentType[];
  codeBuffer: string;
  operations: CodeOperation[];
  lastSync: Date;
  isActive: boolean;
  analysisTimeout?: NodeJS.Timeout;
}

interface CodeOperation {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  length?: number;
  content: string;
  author: AgentType;
  timestamp: Date;
  baseTimestamp: Date;
}

interface RealtimeAnalysis {
  lineCount: number;
  functionCount: number;
  complexity: number;
  issues: CodeIssue[];
  suggestions: string[];
  timestamp: Date;
}

interface CodeIssue {
  type: 'security' | 'performance' | 'style' | 'logic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  line: number;
}

interface AgentCodeSuggestion {
  id: string;
  fromAgent: AgentType;
  toAgent: AgentType;
  suggestion: string;
  codeContext?: string;
  confidence: number;
  timestamp: Date;
}

interface CodeConflict {
  id: string;
  streamId: string;
  agents: AgentType[];
  version1: string;
  version2: string;
  conflictType: 'merge' | 'overwrite' | 'logic';
}

interface ConflictProposal {
  agent: AgentType;
  proposal: string;
  reasoning: string;
}

interface ConflictResolution {
  resolvedCode: string;
  reasoning: string;
  confidence: number;
  timestamp: Date;
}
