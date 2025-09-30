import { EventEmitter } from 'events';
import { ConsciousnessEngine } from '../consciousness/ConsciousnessEngine';
import { TemporalConsciousnessEngine } from '../consciousness/TemporalConsciousnessEngine';

/**
 * CreativityBridge - AI-Human collaboration focused on intent understanding
 * 
 * Instead of AI blindly generating code, this bridge:
 * - Understands the INTENT behind human requests
 * - Asks clarifying questions when intent is ambiguous
 * - Suggests creative solutions humans might not consider
 * - Handles tedious work while humans focus on architecture
 * - Learns from human feedback to improve collaboration
 */
export class CreativityBridge extends EventEmitter {
  private consciousnessEngine: ConsciousnessEngine;
  private temporalEngine: TemporalConsciousnessEngine;
  private conversationHistory: Map<string, Conversation> = new Map();
  private intentModels: Map<string, IntentModel> = new Map();
  private collaborationPatterns: Map<string, CollaborationPattern> = new Map();

  constructor(consciousnessEngine: ConsciousnessEngine, temporalEngine: TemporalConsciousnessEngine) {
    super();
    this.consciousnessEngine = consciousnessEngine;
    this.temporalEngine = temporalEngine;
    this.initializeIntentModels();
    console.log('🤝 CreativityBridge initialized - AI-Human collaboration ready');
  }

  private initializeIntentModels(): void {
    // Pre-trained intent models
    this.intentModels.set('refactor', {
      id: 'refactor',
      keywords: ['refactor', 'clean up', 'improve', 'reorganize', 'simplify'],
      clarifyingQuestions: [
        'Are you focused on readability, performance, or maintainability?',
        'Do you want to preserve the existing API/interface?',
        'Any specific patterns or architecture you prefer?'
      ],
      humanRole: 'Define desired outcome and constraints',
      aiRole: 'Handle tedious restructuring and boilerplate',
      confidence: 0.9
    });

    this.intentModels.set('feature', {
      id: 'feature',
      keywords: ['add', 'create', 'build', 'implement', 'new feature'],
      clarifyingQuestions: [
        'What user problem does this solve?',
        'Are there existing patterns in the codebase to follow?',
        'What are the key edge cases or constraints?'
      ],
      humanRole: 'Define requirements, user experience, and business logic',
      aiRole: 'Generate implementation, tests, and documentation',
      confidence: 0.85
    });

    this.intentModels.set('debug', {
      id: 'debug',
      keywords: ['fix', 'bug', 'error', 'not working', 'issue'],
      clarifyingQuestions: [
        'Can you describe the expected vs actual behavior?',
        'When did this start happening?',
        'Have you made recent changes that might be related?'
      ],
      humanRole: 'Provide context and reproduction steps',
      aiRole: 'Trace causality, suggest fixes, prevent recurrence',
      confidence: 0.8
    });

    this.intentModels.set('explore', {
      id: 'explore',
      keywords: ['how', 'what if', 'explore', 'investigate', 'understand'],
      clarifyingQuestions: [
        'Are you trying to understand existing code or explore new possibilities?',
        'What specific aspects are you curious about?',
        'Are you looking for alternatives or improvements?'
      ],
      humanRole: 'Guide exploration direction and evaluate options',
      aiRole: 'Present options, explain tradeoffs, show examples',
      confidence: 0.75
    });
  }

  /**
   * Process a human request with intent understanding
   */
  async processRequest(request: CreativityRequest): Promise<CreativityResponse> {
    const sessionId = request.sessionId || `session_${Date.now()}`;
    let conversation = this.conversationHistory.get(sessionId);
    
    if (!conversation) {
      conversation = {
        id: sessionId,
        userId: request.userId,
        messages: [],
        detectedIntent: null,
        intentConfidence: 0,
        clarificationNeeded: false,
        startedAt: new Date()
      };
      this.conversationHistory.set(sessionId, conversation);
    }

    // Add user message to history
    conversation.messages.push({
      role: 'human',
      content: request.message,
      timestamp: new Date()
    });

    // Step 1: Understand intent
    const intentAnalysis = await this.analyzeIntent(request.message, conversation);

    // Step 2: Use consciousness to verify understanding
    const consciousnessReflection = await this.consciousnessEngine.processReflection({
      trigger: 'intent-understanding',
      depth: 4,
      userMessage: request.message,
      detectedIntent: intentAnalysis.primary,
      conversationContext: conversation.messages.slice(-5)
    });

    // Step 3: Determine if clarification is needed
    if (intentAnalysis.confidence < 0.7 || intentAnalysis.ambiguous) {
      const clarification = await this.generateClarificationQuestions(intentAnalysis, conversation);
      
      conversation.messages.push({
        role: 'ai',
        content: clarification.question,
        timestamp: new Date(),
        metadata: { type: 'clarification', options: clarification.options }
      });

      return {
        type: 'clarification',
        message: clarification.question,
        options: clarification.options,
        detectedIntent: intentAnalysis.primary,
        confidence: intentAnalysis.confidence,
        sessionId
      };
    }

    // Step 4: Generate creative response based on understood intent
    const response = await this.generateCreativeResponse(intentAnalysis, conversation, request);

    conversation.messages.push({
      role: 'ai',
      content: response.message,
      timestamp: new Date(),
      metadata: { type: 'response', suggestions: response.suggestions }
    });

    return response;
  }

  /**
   * Analyze intent behind human message
   */
  private async analyzeIntent(message: string, conversation: Conversation): Promise<IntentAnalysis> {
    const messageLower = message.toLowerCase();
    const intentScores = new Map<string, number>();

    // Score each intent model
    for (const [intentId, model] of this.intentModels) {
      let score = 0;
      
      // Keyword matching
      for (const keyword of model.keywords) {
        if (messageLower.includes(keyword)) {
          score += 0.3;
        }
      }

      // Context from conversation
      if (conversation.detectedIntent === intentId) {
        score += 0.2; // Continuity bonus
      }

      // Temporal patterns
      const recentIntents = conversation.messages
        .filter(m => m.metadata?.detectedIntent)
        .slice(-3)
        .map(m => m.metadata!.detectedIntent);
      
      if (recentIntents.includes(intentId)) {
        score += 0.1;
      }

      intentScores.set(intentId, score);
    }

    // Find primary and secondary intents
    const sorted = Array.from(intentScores.entries()).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0]?.[0] || 'explore';
    const primaryScore = sorted[0]?.[1] || 0;
    const secondary = sorted[1]?.[0];
    const secondaryScore = sorted[1]?.[1] || 0;

    // Check for ambiguity
    const ambiguous = primaryScore > 0 && secondaryScore > 0 && (primaryScore - secondaryScore) < 0.2;

    // Extract key concepts
    const concepts = this.extractConcepts(message);

    // Detect constraints
    const constraints = this.detectConstraints(message);

    return {
      primary,
      secondary: ambiguous ? secondary : undefined,
      confidence: Math.min(primaryScore, 1.0),
      ambiguous,
      concepts,
      constraints,
      rawScores: Object.fromEntries(intentScores)
    };
  }

  /**
   * Generate clarifying questions when intent is unclear
   */
  private async generateClarificationQuestions(
    intentAnalysis: IntentAnalysis,
    conversation: Conversation
  ): Promise<ClarificationResponse> {
    const primaryModel = this.intentModels.get(intentAnalysis.primary);
    
    if (intentAnalysis.ambiguous && intentAnalysis.secondary) {
      // Ambiguous between two intents
      return {
        question: `I want to make sure I understand correctly. Are you looking to:\n` +
                  `A) ${this.getIntentDescription(intentAnalysis.primary)}\n` +
                  `B) ${this.getIntentDescription(intentAnalysis.secondary)}\n` +
                  `Or something else?`,
        options: [
          { value: intentAnalysis.primary, label: this.getIntentDescription(intentAnalysis.primary) },
          { value: intentAnalysis.secondary, label: this.getIntentDescription(intentAnalysis.secondary) },
          { value: 'other', label: 'Something else' }
        ]
      };
    }

    // Ask model-specific clarifying questions
    const questions = primaryModel?.clarifyingQuestions || [
      'Could you provide more details about what you\'re trying to achieve?'
    ];

    return {
      question: questions[0],
      options: []
    };
  }

  /**
   * Generate creative response based on understood intent
   */
  private async generateCreativeResponse(
    intentAnalysis: IntentAnalysis,
    conversation: Conversation,
    request: CreativityRequest
  ): Promise<CreativityResponse> {
    const model = this.intentModels.get(intentAnalysis.primary);

    if (!model) {
      return this.generateExploratoryResponse(request);
    }

    // Use temporal consciousness for creative insights
    const temporalInsights = await this.temporalEngine.processTemporalDecision({
      intent: intentAnalysis.primary,
      concepts: intentAnalysis.concepts,
      constraints: intentAnalysis.constraints,
      conversationContext: conversation.messages
    });

    switch (intentAnalysis.primary) {
      case 'refactor':
        return await this.generateRefactoringResponse(request, intentAnalysis, temporalInsights);
      
      case 'feature':
        return await this.generateFeatureResponse(request, intentAnalysis, temporalInsights);
      
      case 'debug':
        return await this.generateDebuggingResponse(request, intentAnalysis, temporalInsights);
      
      case 'explore':
        return await this.generateExploratoryResponse(request, intentAnalysis, temporalInsights);
      
      default:
        return await this.generateGeneralResponse(request, intentAnalysis);
    }
  }

  private async generateRefactoringResponse(
    request: any,
    intent: IntentAnalysis,
    temporal: any
  ): Promise<CreativityResponse> {
    return {
      type: 'collaboration',
      message: `I understand you want to refactor. Here's my suggestion:\n\n` +
               `**Human Focus (You):** Define the target architecture and quality goals\n` +
               `**AI Focus (Me):** Handle the mechanical refactoring and ensure no behavior changes\n\n` +
               `I've detected these concepts: ${intent.concepts.join(', ')}\n` +
               `Let's start by identifying which parts need the most attention.`,
      suggestions: [
        {
          type: 'refactor',
          title: 'Extract common patterns into reusable utilities',
          description: 'I can handle the extraction and update all call sites',
          humanRole: 'Review and name the extracted utilities',
          aiRole: 'Perform extraction and generate tests'
        },
        {
          type: 'refactor',
          title: 'Simplify complex functions',
          description: 'Break down functions over 50 lines into focused units',
          humanRole: 'Approve the decomposition strategy',
          aiRole: 'Split functions and maintain behavior'
        },
        {
          type: 'refactor',
          title: 'Improve naming and documentation',
          description: 'Make intent clear through better names and comments',
          humanRole: 'Provide domain context for naming',
          aiRole: 'Update names consistently across codebase'
        }
      ],
      detectedIntent: 'refactor',
      confidence: 0.9,
      sessionId: request.sessionId || `session_${Date.now()}`
    };
  }

  private async generateFeatureResponse(
    request: any,
    intent: IntentAnalysis,
    temporal: any
  ): Promise<CreativityResponse> {
    return {
      type: 'collaboration',
      message: `Let's build this feature together!\n\n` +
               `**Your Role:** Define what success looks like and the user experience\n` +
               `**My Role:** Generate the implementation and handle edge cases\n\n` +
               `Key concepts I detected: ${intent.concepts.join(', ')}\n` +
               `Let me suggest some approaches...`,
      suggestions: [
        {
          type: 'architecture',
          title: 'Incremental approach',
          description: 'Build minimal version first, then enhance',
          humanRole: 'Define the minimal viable feature',
          aiRole: 'Implement with hooks for future enhancements'
        },
        {
          type: 'architecture',
          title: 'Test-driven approach',
          description: 'Define behavior through tests first',
          humanRole: 'Describe expected behaviors',
          aiRole: 'Write tests then make them pass'
        },
        {
          type: 'pattern',
          title: 'Follow existing patterns',
          description: 'Use established patterns from your codebase',
          humanRole: 'Point to similar existing features',
          aiRole: 'Adapt the pattern to new requirements'
        }
      ],
      detectedIntent: 'feature',
      confidence: 0.85,
      sessionId: request.sessionId || `session_${Date.now()}`
    };
  }

  private async generateDebuggingResponse(
    request: any,
    intent: IntentAnalysis,
    temporal: any
  ): Promise<CreativityResponse> {
    return {
      type: 'collaboration',
      message: `Let's track down this issue systematically.\n\n` +
               `**Your Expertise:** Context about when/where it happens\n` +
               `**My Analysis:** Trace causality chains and suggest fixes\n\n` +
               `I'll help you understand the root cause, not just patch symptoms.`,
      suggestions: [
        {
          type: 'debug',
          title: 'Add strategic logging',
          description: 'Insert logs to trace the execution path',
          humanRole: 'Identify critical decision points',
          aiRole: 'Add descriptive logging at key locations'
        },
        {
          type: 'debug',
          title: 'Isolate the problem',
          description: 'Create minimal reproduction',
          humanRole: 'Verify the reproduction matches the issue',
          aiRole: 'Strip away unrelated code'
        },
        {
          type: 'debug',
          title: 'Check temporal dependencies',
          description: 'Verify timing/ordering assumptions',
          humanRole: 'Describe expected sequence',
          aiRole: 'Trace actual execution order'
        }
      ],
      detectedIntent: 'debug',
      confidence: 0.8,
      sessionId: request.sessionId || `session_${Date.now()}`
    };
  }

  private async generateExploratoryResponse(
    request: any,
    intent?: IntentAnalysis,
    temporal?: any
  ): Promise<CreativityResponse> {
    return {
      type: 'exploration',
      message: `Let's explore the possibilities together!\n\n` +
               `I'll present options with tradeoffs, and you choose the direction that fits your vision.`,
      suggestions: [
        {
          type: 'exploration',
          title: 'Show me how it works',
          description: 'I can explain the current implementation',
          humanRole: 'Ask follow-up questions',
          aiRole: 'Explain code with examples'
        },
        {
          type: 'exploration',
          title: 'What are the alternatives?',
          description: 'Compare different approaches',
          humanRole: 'Evaluate which fits your goals',
          aiRole: 'Present options with pros/cons'
        },
        {
          type: 'exploration',
          title: 'Experiment with changes',
          description: 'Try modifications safely',
          humanRole: 'Define success criteria',
          aiRole: 'Implement and measure results'
        }
      ],
      detectedIntent: intent?.primary || 'explore',
      confidence: intent?.confidence || 0.75,
      sessionId: request.sessionId || `session_${Date.now()}`
    };
  }

  private async generateGeneralResponse(request: any, intent: IntentAnalysis): Promise<CreativityResponse> {
    return {
      type: 'response',
      message: 'I\'m here to collaborate! How can I help you create something great?',
      suggestions: [],
      detectedIntent: intent.primary,
      confidence: intent.confidence,
      sessionId: request.sessionId || `session_${Date.now()}`
    };
  }

  private extractConcepts(message: string): string[] {
    const concepts: string[] = [];
    
    // Technical concepts
    const techPatterns = [
      'component', 'api', 'database', 'authentication', 'performance',
      'security', 'testing', 'deployment', 'refactor', 'architecture'
    ];
    
    const messageLower = message.toLowerCase();
    techPatterns.forEach(pattern => {
      if (messageLower.includes(pattern)) {
        concepts.push(pattern);
      }
    });

    return concepts;
  }

  private detectConstraints(message: string): string[] {
    const constraints: string[] = [];
    
    if (message.includes('must') || message.includes('requirement')) {
      constraints.push('hard-requirement');
    }
    if (message.includes('don\'t change') || message.includes('preserve')) {
      constraints.push('preserve-existing');
    }
    if (message.includes('performance') || message.includes('fast')) {
      constraints.push('performance-critical');
    }
    if (message.includes('secure') || message.includes('security')) {
      constraints.push('security-critical');
    }

    return constraints;
  }

  private getIntentDescription(intent: string): string {
    const descriptions: Record<string, string> = {
      refactor: 'Improve existing code structure/quality',
      feature: 'Add new functionality',
      debug: 'Fix a problem or error',
      explore: 'Understand or investigate something'
    };
    return descriptions[intent] || 'Work on something';
  }

  /**
   * Learn from human feedback
   */
  async provideFeedback(sessionId: string, feedback: CollaborationFeedback): Promise<void> {
    const conversation = this.conversationHistory.get(sessionId);
    if (!conversation) return;

    // Learn from what worked/didn't work
    const pattern: CollaborationPattern = {
      intent: conversation.detectedIntent || 'unknown',
      feedback: feedback.rating,
      whatWorked: feedback.whatWorked,
      whatDidnt: feedback.whatDidnt,
      timestamp: new Date()
    };

    this.collaborationPatterns.set(`${sessionId}_${Date.now()}`, pattern);
    
    // Update intent model confidence
    if (conversation.detectedIntent && feedback.intentCorrect !== undefined) {
      const model = this.intentModels.get(conversation.detectedIntent);
      if (model) {
        model.confidence = feedback.intentCorrect 
          ? Math.min(model.confidence + 0.05, 1.0)
          : Math.max(model.confidence - 0.1, 0.5);
      }
    }

    this.emit('feedback-received', { sessionId, feedback, pattern });
  }
}

// Interfaces
export interface CreativityRequest {
  sessionId?: string;
  userId: string;
  message: string;
  code?: string;
  context?: any;
}

export interface CreativityResponse {
  type: 'clarification' | 'collaboration' | 'response' | 'exploration';
  message: string;
  options?: Array<{ value: string; label: string }>;
  suggestions?: Suggestion[];
  detectedIntent: string;
  confidence: number;
  sessionId: string;
}

export interface Suggestion {
  type: string;
  title: string;
  description: string;
  humanRole: string;
  aiRole: string;
}

export interface IntentAnalysis {
  primary: string;
  secondary?: string;
  confidence: number;
  ambiguous: boolean;
  concepts: string[];
  constraints: string[];
  rawScores: Record<string, number>;
}

interface IntentModel {
  id: string;
  keywords: string[];
  clarifyingQuestions: string[];
  humanRole: string;
  aiRole: string;
  confidence: number;
}

interface Conversation {
  id: string;
  userId: string;
  messages: Array<{
    role: 'human' | 'ai';
    content: string;
    timestamp: Date;
    metadata?: any;
  }>;
  detectedIntent: string | null;
  intentConfidence: number;
  clarificationNeeded: boolean;
  startedAt: Date;
}

interface ClarificationResponse {
  question: string;
  options: Array<{ value: string; label: string }>;
}

interface CollaborationPattern {
  intent: string;
  feedback: number;
  whatWorked: string[];
  whatDidnt: string[];
  timestamp: Date;
}

export interface CollaborationFeedback {
  rating: number;
  intentCorrect?: boolean;
  whatWorked: string[];
  whatDidnt: string[];
  suggestions?: string[];
}

export default CreativityBridge;
