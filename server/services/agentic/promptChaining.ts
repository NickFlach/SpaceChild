import { aiProviderService } from "../aiProviders";
import { storage } from "../../storage";

export interface ChainStep {
  id: string;
  name: string;
  description: string;
  provider: string;
  prompt: string;
  promptTemplate: string;
  inputFields: string[];
  outputType: 'code' | 'analysis' | 'plan' | 'text' | 'json';
  retry?: {
    maxAttempts: number;
    backoffMs: number;
  };
  validation?: {
    minLength?: number;
    maxLength?: number;
    requiredTerms?: string[];
    schema?: any;
  };
}

export interface ChainDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: ChainStep[];
  contextStrategy: 'accumulate' | 'windowed' | 'selective';
  maxContextTokens: number;
}

export interface ChainExecution {
  id: string;
  chainId: string;
  projectId?: number;
  userId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentStepIndex: number;
  stepResults: ChainStepResult[];
  context: ChainContext;
  totalTokensUsed: number;
  totalCostUsd: string;
}

export interface ChainStepResult {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  startTime?: Date;
  endTime?: Date;
  input: Record<string, any>;
  output?: any;
  tokensUsed?: number;
  costUsd?: string;
  provider?: string;
  error?: string;
  attempts: number;
}

export interface ChainContext {
  variables: Record<string, any>;
  history: Array<{
    step: string;
    result: any;
    timestamp: Date;
  }>;
  metadata: Record<string, any>;
}

class PromptChainingService {
  private activeExecutions = new Map<string, ChainExecution>();
  private chainDefinitions = new Map<string, ChainDefinition>();

  constructor() {
    this.initializeDefaultChains();
  }

  private initializeDefaultChains() {
    // Code Generation Chain
    this.registerChain({
      id: 'code-generation-chain',
      name: 'Advanced Code Generation',
      description: 'Multi-step code generation with analysis and optimization',
      version: '1.0',
      contextStrategy: 'accumulate',
      maxContextTokens: 8000,
      steps: [
        {
          id: 'analyze-requirements',
          name: 'Analyze Requirements',
          description: 'Analyze user requirements and break down the task',
          provider: 'anthropic',
          prompt: '',
          promptTemplate: `Analyze the following coding request and break it down into clear requirements:

Request: {{userRequest}}
Project Context: {{projectContext}}

Please provide:
1. Core functionality needed
2. Technical requirements
3. Dependencies and libraries
4. Potential challenges
5. Implementation approach

Format your response as structured analysis.`,
          inputFields: ['userRequest', 'projectContext'],
          outputType: 'analysis'
        },
        {
          id: 'generate-architecture',
          name: 'Generate Architecture',
          description: 'Create system architecture based on requirements',
          provider: 'mindsphere',
          prompt: '',
          promptTemplate: `Based on the requirements analysis, design the system architecture:

Requirements: {{analysis}}
Project Type: {{projectType}}

Please provide:
1. High-level architecture
2. Component structure
3. Data flow
4. Integration points
5. Scalability considerations

Focus on clean, maintainable design patterns.`,
          inputFields: ['analysis', 'projectType'],
          outputType: 'plan'
        },
        {
          id: 'implement-code',
          name: 'Implement Code',
          description: 'Generate the actual code implementation',
          provider: 'gpt-oss-20b',
          prompt: '',
          promptTemplate: `Implement the code based on the architecture design:

Architecture: {{architecture}}
Requirements: {{analysis}}
Language: {{language}}
Framework: {{framework}}

Generate production-ready code with:
1. Clean, well-documented code
2. Error handling
3. Type safety (if applicable)
4. Best practices
5. Comments explaining complex logic

Provide complete, runnable implementation.`,
          inputFields: ['architecture', 'analysis', 'language', 'framework'],
          outputType: 'code'
        },
        {
          id: 'review-and-optimize',
          name: 'Review and Optimize',
          description: 'Review generated code and suggest optimizations',
          provider: 'spaceagent',
          prompt: '',
          promptTemplate: `Review and optimize the generated code:

Generated Code: {{code}}
Architecture: {{architecture}}
Requirements: {{analysis}}

Please provide:
1. Code quality assessment
2. Performance optimizations
3. Security considerations
4. Refactoring suggestions
5. Final optimized code

Focus on maintainability, performance, and best practices.`,
          inputFields: ['code', 'architecture', 'analysis'],
          outputType: 'code'
        }
      ]
    });

    // Bug Analysis Chain
    this.registerChain({
      id: 'bug-analysis-chain',
      name: 'Advanced Bug Analysis',
      description: 'Multi-step bug detection and resolution',
      version: '1.0',
      contextStrategy: 'accumulate',
      maxContextTokens: 6000,
      steps: [
        {
          id: 'analyze-error',
          name: 'Analyze Error',
          description: 'Analyze the error or bug report',
          provider: 'anthropic',
          prompt: '',
          promptTemplate: `Analyze the following error or bug:

Error/Bug Description: {{errorDescription}}
Code Context: {{codeContext}}
Stack Trace: {{stackTrace}}

Please provide:
1. Root cause analysis
2. Affected components
3. Severity assessment
4. Investigation areas
5. Potential solutions

Be thorough and systematic in your analysis.`,
          inputFields: ['errorDescription', 'codeContext', 'stackTrace'],
          outputType: 'analysis'
        },
        {
          id: 'trace-execution',
          name: 'Trace Execution Flow',
          description: 'Trace the code execution flow to find the bug',
          provider: 'gpt-oss-20b',
          prompt: '',
          promptTemplate: `Trace the execution flow to locate the bug:

Analysis: {{analysis}}
Source Code: {{sourceCode}}
Input Data: {{inputData}}

Please provide:
1. Step-by-step execution trace
2. State changes at each step
3. Where the bug occurs
4. Why the bug happens
5. Data flow analysis

Focus on the exact point of failure.`,
          inputFields: ['analysis', 'sourceCode', 'inputData'],
          outputType: 'analysis'
        },
        {
          id: 'generate-fix',
          name: 'Generate Fix',
          description: 'Generate code fix for the identified bug',
          provider: 'spaceagent',
          prompt: '',
          promptTemplate: `Generate a fix for the identified bug:

Bug Analysis: {{analysis}}
Execution Trace: {{trace}}
Original Code: {{originalCode}}

Please provide:
1. Specific code changes needed
2. Fixed code implementation
3. Explanation of the fix
4. Testing recommendations
5. Prevention strategies

Ensure the fix is minimal and doesn't introduce new issues.`,
          inputFields: ['analysis', 'trace', 'originalCode'],
          outputType: 'code'
        }
      ]
    });

    // Optimization Chain
    this.registerChain({
      id: 'optimization-chain',
      name: 'Performance Optimization',
      description: 'Multi-step performance analysis and optimization',
      version: '1.0',
      contextStrategy: 'selective',
      maxContextTokens: 7000,
      steps: [
        {
          id: 'profile-performance',
          name: 'Profile Performance',
          description: 'Analyze performance characteristics',
          provider: 'mindsphere',
          prompt: '',
          promptTemplate: `Analyze the performance characteristics of the code:

Code: {{code}}
Usage Patterns: {{usagePatterns}}
Performance Requirements: {{requirements}}

Please provide:
1. Performance bottleneck identification
2. Resource usage analysis
3. Scalability assessment
4. Optimization opportunities
5. Priority recommendations

Focus on measurable improvements.`,
          inputFields: ['code', 'usagePatterns', 'requirements'],
          outputType: 'analysis'
        },
        {
          id: 'optimize-algorithms',
          name: 'Optimize Algorithms',
          description: 'Optimize algorithms and data structures',
          provider: 'gpt-oss-20b',
          prompt: '',
          promptTemplate: `Optimize the algorithms and data structures:

Performance Analysis: {{analysis}}
Original Code: {{originalCode}}
Target Metrics: {{targetMetrics}}

Please provide:
1. Algorithmic improvements
2. Better data structures
3. Optimized implementation
4. Complexity analysis
5. Performance benchmarks

Focus on algorithmic efficiency.`,
          inputFields: ['analysis', 'originalCode', 'targetMetrics'],
          outputType: 'code'
        }
      ]
    });
  }

  registerChain(definition: ChainDefinition): void {
    this.chainDefinitions.set(definition.id, definition);
  }

  async executeChain(
    chainId: string,
    initialInput: Record<string, any>,
    userId: string,
    projectId?: number
  ): Promise<ChainExecution> {
    const definition = this.chainDefinitions.get(chainId);
    if (!definition) {
      throw new Error(`Chain definition not found: ${chainId}`);
    }

    const executionId = `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const execution: ChainExecution = {
      id: executionId,
      chainId,
      projectId,
      userId,
      status: 'running',
      startTime: new Date(),
      currentStepIndex: 0,
      stepResults: definition.steps.map(step => ({
        stepId: step.id,
        status: 'pending',
        input: {},
        attempts: 0
      })),
      context: {
        variables: { ...initialInput },
        history: [],
        metadata: {}
      },
      totalTokensUsed: 0,
      totalCostUsd: '0'
    };

    this.activeExecutions.set(executionId, execution);

    try {
      await this.executeSteps(execution, definition);
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      console.error('Chain execution failed:', error);
    }

    return execution;
  }

  private async executeSteps(
    execution: ChainExecution,
    definition: ChainDefinition
  ): Promise<void> {
    for (let i = 0; i < definition.steps.length; i++) {
      const step = definition.steps[i];
      const stepResult = execution.stepResults[i];

      try {
        execution.currentStepIndex = i;
        stepResult.status = 'running';
        stepResult.startTime = new Date();

        // Prepare input for this step
        const stepInput = this.prepareStepInput(step, execution.context);
        stepResult.input = stepInput;

        // Execute step with retry logic
        const result = await this.executeStepWithRetry(step, stepInput, stepResult);
        
        stepResult.output = result.output;
        stepResult.tokensUsed = result.tokensUsed;
        stepResult.costUsd = result.costUsd;
        stepResult.provider = result.provider;
        stepResult.status = 'completed';
        stepResult.endTime = new Date();

        // Update execution totals
        execution.totalTokensUsed += result.tokensUsed || 0;
        execution.totalCostUsd = (parseFloat(execution.totalCostUsd) + parseFloat(result.costUsd || '0')).toString();

        // Update context
        this.updateContext(execution.context, step, result.output, definition.contextStrategy);

        // Store intermediate results in memory for learning
        if (execution.projectId) {
          await this.storeChainMemory(execution, step, result);
        }

      } catch (error) {
        stepResult.status = 'failed';
        stepResult.error = error instanceof Error ? error.message : String(error);
        stepResult.endTime = new Date();
        throw error;
      }
    }

    execution.status = 'completed';
    execution.endTime = new Date();
  }

  private async executeStepWithRetry(
    step: ChainStep,
    input: Record<string, any>,
    stepResult: ChainStepResult
  ): Promise<{ output: any; tokensUsed?: number; costUsd?: string; provider: string }> {
    const maxAttempts = step.retry?.maxAttempts || 3;
    const backoffMs = step.retry?.backoffMs || 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      stepResult.attempts = attempt;

      try {
        // Build prompt from template
        const prompt = this.buildPromptFromTemplate(step.promptTemplate, input);
        
        // Execute with AI provider
        const result = await aiProviderService.generateCode(prompt, step.provider);
        
        // Validate result if validation rules exist
        if (step.validation) {
          this.validateStepOutput(result.response, step.validation);
        }

        return {
          output: result.response,
          tokensUsed: result.tokensUsed,
          costUsd: result.cost,
          provider: step.provider
        };

      } catch (error) {
        console.warn(`Step ${step.id} attempt ${attempt} failed:`, error);
        
        if (attempt === maxAttempts) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, backoffMs * attempt));
      }
    }

    throw new Error(`Step ${step.id} failed after ${maxAttempts} attempts`);
  }

  private buildPromptFromTemplate(template: string, variables: Record<string, any>): string {
    let prompt = template;
    
    // Replace template variables
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value || ''));
    }
    
    return prompt;
  }

  private prepareStepInput(step: ChainStep, context: ChainContext): Record<string, any> {
    const input: Record<string, any> = {};
    
    // Get required input fields from context
    for (const field of step.inputFields) {
      if (context.variables[field] !== undefined) {
        input[field] = context.variables[field];
      }
    }
    
    return input;
  }

  private updateContext(
    context: ChainContext,
    step: ChainStep,
    result: any,
    strategy: 'accumulate' | 'windowed' | 'selective'
  ): void {
    // Add result to history
    context.history.push({
      step: step.id,
      result,
      timestamp: new Date()
    });

    // Update variables based on step output
    context.variables[step.id + '_result'] = result;
    context.variables[step.name.toLowerCase().replace(/\s+/g, '_')] = result;

    // Manage context size based on strategy
    if (strategy === 'windowed' && context.history.length > 5) {
      context.history = context.history.slice(-5);
    }
  }

  private validateStepOutput(output: any, validation: NonNullable<ChainStep['validation']>): void {
    const outputStr = typeof output === 'string' ? output : JSON.stringify(output);
    
    if (validation.minLength && outputStr.length < validation.minLength) {
      throw new Error(`Output too short: ${outputStr.length} < ${validation.minLength}`);
    }
    
    if (validation.maxLength && outputStr.length > validation.maxLength) {
      throw new Error(`Output too long: ${outputStr.length} > ${validation.maxLength}`);
    }
    
    if (validation.requiredTerms) {
      for (const term of validation.requiredTerms) {
        if (!outputStr.toLowerCase().includes(term.toLowerCase())) {
          throw new Error(`Required term missing: ${term}`);
        }
      }
    }
  }

  private async storeChainMemory(
    execution: ChainExecution,
    step: ChainStep,
    result: any
  ): Promise<void> {
    if (!execution.projectId) return;

    try {
      const { projectMemoryService } = await import("../projectMemory");
      await projectMemoryService.learnFromInteraction(
        execution.projectId,
        'chain_execution',
        JSON.stringify({
          stepId: step.id,
          stepName: step.name,
          result,
          executionId: execution.id,
          chainId: execution.chainId
        }),
        {
          chainId: execution.chainId,
          stepId: step.id,
          provider: step.provider,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.warn('Failed to store chain memory:', error);
    }
  }

  getChainStatus(executionId: string): ChainExecution | null {
    return this.activeExecutions.get(executionId) || null;
  }

  getAvailableChains(): ChainDefinition[] {
    return Array.from(this.chainDefinitions.values());
  }

  async pauseChain(executionId: string): Promise<boolean> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution || execution.status !== 'running') {
      return false;
    }
    
    execution.status = 'paused';
    return true;
  }

  async resumeChain(executionId: string): Promise<boolean> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution || execution.status !== 'paused') {
      return false;
    }
    
    execution.status = 'running';
    
    // Continue execution from current step
    const definition = this.chainDefinitions.get(execution.chainId);
    if (definition) {
      try {
        await this.executeSteps(execution, definition);
      } catch (error) {
        execution.status = 'failed';
        console.error('Chain resume failed:', error);
      }
    }
    
    return true;
  }
}

export const promptChainingService = new PromptChainingService();