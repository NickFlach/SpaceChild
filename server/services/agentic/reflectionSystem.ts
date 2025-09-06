import { aiProviderService } from "../aiProviders";
import { storage } from "../../storage";

export interface ReflectionCriteria {
  category: 'quality' | 'accuracy' | 'completeness' | 'efficiency' | 'style' | 'security' | 'maintainability';
  description: string;
  weight: number; // 0-1 scale
  threshold: number; // minimum acceptable score
}

export interface ReflectionResult {
  overall_score: number; // 0-1 scale
  criteria_scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
  confidence: number;
  needs_revision: boolean;
}

export interface ReflectionContext {
  original_task: string;
  initial_output: string;
  output_type: 'code' | 'text' | 'analysis' | 'plan' | 'json';
  domain: string;
  user_requirements?: string[];
  project_context?: any;
}

export interface ReflectionIteration {
  iteration: number;
  input: string;
  reflection: ReflectionResult;
  revised_output?: string;
  improvement_score: number;
  timestamp: Date;
}

export interface ReflectionSession {
  id: string;
  userId: string;
  projectId?: number;
  context: ReflectionContext;
  iterations: ReflectionIteration[];
  final_output: string;
  total_improvement: number;
  status: 'running' | 'completed' | 'failed';
  reflector_provider: string;
  revisor_provider: string;
  created_at: Date;
  completed_at?: Date;
}

class ReflectionSystemService {
  private activeSessions = new Map<string, ReflectionSession>();
  private defaultCriteria = new Map<string, ReflectionCriteria[]>();

  constructor() {
    this.initializeDefaultCriteria();
  }

  private initializeDefaultCriteria() {
    // Code reflection criteria
    this.defaultCriteria.set('code', [
      {
        category: 'quality',
        description: 'Code follows best practices, is clean and readable',
        weight: 0.25,
        threshold: 0.7
      },
      {
        category: 'accuracy',
        description: 'Code correctly implements the required functionality',
        weight: 0.30,
        threshold: 0.8
      },
      {
        category: 'completeness',
        description: 'All requirements are addressed and implemented',
        weight: 0.20,
        threshold: 0.7
      },
      {
        category: 'efficiency',
        description: 'Code is optimized for performance and resource usage',
        weight: 0.15,
        threshold: 0.6
      },
      {
        category: 'maintainability',
        description: 'Code is well-structured, documented, and easy to maintain',
        weight: 0.10,
        threshold: 0.7
      }
    ]);

    // Analysis reflection criteria
    this.defaultCriteria.set('analysis', [
      {
        category: 'accuracy',
        description: 'Analysis is factually correct and well-reasoned',
        weight: 0.35,
        threshold: 0.8
      },
      {
        category: 'completeness',
        description: 'All relevant aspects are covered thoroughly',
        weight: 0.25,
        threshold: 0.7
      },
      {
        category: 'quality',
        description: 'Analysis is clear, well-structured, and insightful',
        weight: 0.25,
        threshold: 0.7
      },
      {
        category: 'style',
        description: 'Writing is professional and appropriate for the audience',
        weight: 0.15,
        threshold: 0.6
      }
    ]);

    // Plan reflection criteria
    this.defaultCriteria.set('plan', [
      {
        category: 'completeness',
        description: 'Plan addresses all requirements and constraints',
        weight: 0.30,
        threshold: 0.8
      },
      {
        category: 'quality',
        description: 'Plan is logical, detailed, and well-organized',
        weight: 0.25,
        threshold: 0.7
      },
      {
        category: 'efficiency',
        description: 'Plan is practical and resource-efficient',
        weight: 0.25,
        threshold: 0.6
      },
      {
        category: 'accuracy',
        description: 'Plan is realistic and technically sound',
        weight: 0.20,
        threshold: 0.7
      }
    ]);
  }

  async startReflection(
    context: ReflectionContext,
    userId: string,
    projectId?: number,
    options?: {
      maxIterations?: number;
      improvementThreshold?: number;
      reflectorProvider?: string;
      revisorProvider?: string;
      customCriteria?: ReflectionCriteria[];
    }
  ): Promise<ReflectionSession> {
    const sessionId = `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: ReflectionSession = {
      id: sessionId,
      userId,
      projectId,
      context,
      iterations: [],
      final_output: context.initial_output,
      total_improvement: 0,
      status: 'running',
      reflector_provider: options?.reflectorProvider || 'anthropic', // Use Claude for reflection
      revisor_provider: options?.revisorProvider || 'spaceagent', // Use SpaceAgent for revision
      created_at: new Date()
    };

    this.activeSessions.set(sessionId, session);

    try {
      await this.performReflectionCycle(
        session,
        options?.maxIterations || 3,
        options?.improvementThreshold || 0.1,
        options?.customCriteria
      );
    } catch (error) {
      session.status = 'failed';
      console.error('Reflection session failed:', error);
    }

    return session;
  }

  private async performReflectionCycle(
    session: ReflectionSession,
    maxIterations: number,
    improvementThreshold: number,
    customCriteria?: ReflectionCriteria[]
  ): Promise<void> {
    const criteria = customCriteria || this.defaultCriteria.get(session.context.output_type) || this.defaultCriteria.get('text')!;
    let currentOutput = session.context.initial_output;
    let previousScore = 0;

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      try {
        // Step 1: Reflect on current output
        const reflection = await this.performReflection(
          currentOutput,
          session.context,
          criteria,
          session.reflector_provider
        );

        const iterationData: ReflectionIteration = {
          iteration,
          input: currentOutput,
          reflection,
          improvement_score: reflection.overall_score - previousScore,
          timestamp: new Date()
        };

        // Step 2: Revise if needed
        if (reflection.needs_revision && iteration < maxIterations) {
          const revisedOutput = await this.performRevision(
            currentOutput,
            reflection,
            session.context,
            session.revisor_provider
          );
          
          iterationData.revised_output = revisedOutput;
          currentOutput = revisedOutput;
          session.final_output = revisedOutput;
        }

        session.iterations.push(iterationData);

        // Check if we've improved enough to stop
        if (reflection.overall_score > 0.9 || 
           (iteration > 1 && iterationData.improvement_score < improvementThreshold)) {
          break;
        }

        previousScore = reflection.overall_score;

        // Store intermediate progress for learning
        if (session.projectId) {
          await this.storeReflectionMemory(session, iterationData);
        }

      } catch (error) {
        console.error(`Reflection iteration ${iteration} failed:`, error);
        break;
      }
    }

    // Calculate total improvement
    if (session.iterations.length > 0) {
      const firstScore = 0.5; // Assume baseline
      const lastScore = session.iterations[session.iterations.length - 1].reflection.overall_score;
      session.total_improvement = lastScore - firstScore;
    }

    session.status = 'completed';
    session.completed_at = new Date();
  }

  private async performReflection(
    output: string,
    context: ReflectionContext,
    criteria: ReflectionCriteria[],
    provider: string
  ): Promise<ReflectionResult> {
    const prompt = this.buildReflectionPrompt(output, context, criteria);
    
    try {
      const result = await aiProviderService.generateCode(prompt, provider);
      return this.parseReflectionResult(result.response);
    } catch (error) {
      console.error('Reflection failed:', error);
      // Return a default reflection if AI fails
      return {
        overall_score: 0.5,
        criteria_scores: {},
        strengths: ['Unable to analyze'],
        weaknesses: ['Reflection system error'],
        improvement_suggestions: ['Manual review required'],
        confidence: 0.1,
        needs_revision: false
      };
    }
  }

  private buildReflectionPrompt(
    output: string,
    context: ReflectionContext,
    criteria: ReflectionCriteria[]
  ): string {
    const criteriaDescriptions = criteria.map(c => 
      `- ${c.category} (weight: ${c.weight}): ${c.description}`
    ).join('\n');

    return `You are an expert reviewer tasked with critically evaluating the following ${context.output_type}:

ORIGINAL TASK:
${context.original_task}

OUTPUT TO REVIEW:
${output}

EVALUATION CRITERIA:
${criteriaDescriptions}

Please provide a detailed reflection using the following JSON format:
{
  "overall_score": 0.0-1.0,
  "criteria_scores": {
    "quality": 0.0-1.0,
    "accuracy": 0.0-1.0,
    "completeness": 0.0-1.0,
    "efficiency": 0.0-1.0,
    "maintainability": 0.0-1.0
  },
  "strengths": ["list of specific strengths"],
  "weaknesses": ["list of specific weaknesses"],
  "improvement_suggestions": ["actionable suggestions for improvement"],
  "confidence": 0.0-1.0,
  "needs_revision": true/false
}

Be thorough, specific, and constructive in your analysis. Consider both what works well and what could be improved.`;
  }

  private parseReflectionResult(response: string): ReflectionResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and sanitize the result
        return {
          overall_score: Math.min(1, Math.max(0, parsed.overall_score || 0.5)),
          criteria_scores: parsed.criteria_scores || {},
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
          improvement_suggestions: Array.isArray(parsed.improvement_suggestions) ? parsed.improvement_suggestions : [],
          confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
          needs_revision: Boolean(parsed.needs_revision)
        };
      }
    } catch (error) {
      console.warn('Failed to parse reflection result:', error);
    }

    // Fallback parsing if JSON extraction fails
    return this.fallbackParseReflection(response);
  }

  private fallbackParseReflection(response: string): ReflectionResult {
    const lines = response.toLowerCase().split('\n');
    
    // Try to extract basic information from text
    const strengthsSection = this.extractSection(response, ['strengths', 'good', 'positive']);
    const weaknessesSection = this.extractSection(response, ['weaknesses', 'issues', 'problems']);
    const suggestionsSection = this.extractSection(response, ['suggestions', 'improvements', 'recommend']);
    
    const hasProblems = weaknessesSection.length > 0 || 
                       lines.some(line => line.includes('error') || line.includes('issue') || line.includes('problem'));
    
    return {
      overall_score: hasProblems ? 0.6 : 0.8,
      criteria_scores: {},
      strengths: strengthsSection,
      weaknesses: weaknessesSection,
      improvement_suggestions: suggestionsSection,
      confidence: 0.6,
      needs_revision: hasProblems
    };
  }

  private extractSection(text: string, keywords: string[]): string[] {
    const lines = text.split('\n');
    const items: string[] = [];
    
    let inSection = false;
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check if we're entering a relevant section
      if (keywords.some(keyword => lowerLine.includes(keyword))) {
        inSection = true;
        continue;
      }
      
      // Extract items from the section
      if (inSection) {
        if (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./)) {
          items.push(line.trim().replace(/^[-*\d.]\s*/, ''));
        } else if (line.trim() === '') {
          inSection = false;
        }
      }
    }
    
    return items;
  }

  private async performRevision(
    originalOutput: string,
    reflection: ReflectionResult,
    context: ReflectionContext,
    provider: string
  ): Promise<string> {
    const prompt = this.buildRevisionPrompt(originalOutput, reflection, context);
    
    try {
      const result = await aiProviderService.generateCode(prompt, provider);
      return result.response;
    } catch (error) {
      console.error('Revision failed:', error);
      return originalOutput; // Return original if revision fails
    }
  }

  private buildRevisionPrompt(
    originalOutput: string,
    reflection: ReflectionResult,
    context: ReflectionContext
  ): string {
    const weaknessList = reflection.weaknesses.join('\n- ');
    const suggestionsList = reflection.improvement_suggestions.join('\n- ');

    return `Please revise the following ${context.output_type} based on the reflection analysis:

ORIGINAL TASK:
${context.original_task}

CURRENT OUTPUT:
${originalOutput}

IDENTIFIED WEAKNESSES:
- ${weaknessList}

IMPROVEMENT SUGGESTIONS:
- ${suggestionsList}

Please provide a revised version that addresses these issues while maintaining the strengths. Focus on:
1. Fixing the identified weaknesses
2. Implementing the improvement suggestions
3. Preserving what works well
4. Ensuring the output still meets the original requirements

Return only the revised ${context.output_type}, without additional commentary.`;
  }

  private async storeReflectionMemory(
    session: ReflectionSession,
    iteration: ReflectionIteration
  ): Promise<void> {
    if (!session.projectId) return;

    try {
      const { projectMemoryService } = await import("../projectMemory");
      await projectMemoryService.learnFromInteraction(
        session.projectId,
        'reflection',
        JSON.stringify({
          iterationNumber: iteration.iteration,
          overallScore: iteration.reflection.overall_score,
          improvementScore: iteration.improvement_score,
          weaknesses: iteration.reflection.weaknesses,
          suggestions: iteration.reflection.improvement_suggestions
        }),
        {
          sessionId: session.id,
          outputType: session.context.output_type,
          reflectorProvider: session.reflector_provider,
          revisorProvider: session.revisor_provider,
          timestamp: iteration.timestamp.toISOString()
        }
      );
    } catch (error) {
      console.warn('Failed to store reflection memory:', error);
    }
  }

  getSession(sessionId: string): ReflectionSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  async getSessionHistory(userId: string): Promise<ReflectionSession[]> {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async quickReflect(
    output: string,
    outputType: 'code' | 'text' | 'analysis' | 'plan',
    task: string,
    provider: string = 'anthropic'
  ): Promise<ReflectionResult> {
    const context: ReflectionContext = {
      original_task: task,
      initial_output: output,
      output_type: outputType,
      domain: 'general'
    };

    const criteria = this.defaultCriteria.get(outputType) || this.defaultCriteria.get('text')!;
    return this.performReflection(output, context, criteria, provider);
  }

  async reflectAndRevise(
    output: string,
    outputType: 'code' | 'text' | 'analysis' | 'plan',
    task: string,
    reflectorProvider: string = 'anthropic',
    revisorProvider: string = 'spaceagent'
  ): Promise<{ reflection: ReflectionResult; revisedOutput?: string }> {
    const reflection = await this.quickReflect(output, outputType, task, reflectorProvider);
    
    let revisedOutput: string | undefined;
    if (reflection.needs_revision) {
      const context: ReflectionContext = {
        original_task: task,
        initial_output: output,
        output_type: outputType,
        domain: 'general'
      };
      
      revisedOutput = await this.performRevision(output, reflection, context, revisorProvider);
    }

    return { reflection, revisedOutput };
  }

  getAvailableCriteria(): Record<string, ReflectionCriteria[]> {
    const result: Record<string, ReflectionCriteria[]> = {};
    for (const [key, value] of this.defaultCriteria.entries()) {
      result[key] = [...value];
    }
    return result;
  }

  async getReflectionStats(userId: string): Promise<any> {
    const sessions = await this.getSessionHistory(userId);
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageImprovement: 0,
        successRate: 0,
        commonWeaknesses: []
      };
    }

    const totalImprovement = sessions.reduce((sum, s) => sum + s.total_improvement, 0);
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const allWeaknesses = sessions.flatMap(s => 
      s.iterations.flatMap(i => i.reflection.weaknesses)
    );

    const weaknessCounts = allWeaknesses.reduce((counts, weakness) => {
      counts[weakness] = (counts[weakness] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const commonWeaknesses = Object.entries(weaknessCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([weakness, count]) => ({ weakness, count }));

    return {
      totalSessions: sessions.length,
      averageImprovement: totalImprovement / sessions.length,
      successRate: completedSessions.length / sessions.length,
      commonWeaknesses
    };
  }
}

export const reflectionSystemService = new ReflectionSystemService();