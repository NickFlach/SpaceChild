import { aiProviderService } from "../aiProviders";
import { storage } from "../../storage";
import { routingEngineService } from "./routingEngine";
import { promptChainingService } from "./promptChaining";

export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'primary' | 'secondary' | 'milestone' | 'constraint';
  complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  estimatedEffort: number; // Hours
  dependencies: string[]; // IDs of other goals this depends on
  success_criteria: string[];
  risk_factors: string[];
  metadata: Record<string, any>;
}

export interface Task {
  id: string;
  goalId: string;
  title: string;
  description: string;
  type: 'analysis' | 'design' | 'implementation' | 'testing' | 'review' | 'research';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: number; // 1-10 scale
  estimatedTokens: number;
  estimatedCost: string;
  suggestedProvider: string;
  dependencies: string[]; // Task IDs this depends on
  required_inputs: string[];
  expected_outputs: string[];
  validation_criteria: string[];
  assigned_chain?: string; // Chain ID if using prompt chaining
  metadata?: Record<string, any>;
  created_at: Date;
  deadline?: Date;
}

export interface PlanningContext {
  userId: string;
  projectId?: number;
  domain: string;
  constraints: {
    timeline?: string;
    budget?: number;
    technical_requirements?: string[];
    quality_requirements?: string[];
    resource_limitations?: string[];
  };
  user_preferences: {
    preferred_providers?: string[];
    avoid_providers?: string[];
    quality_vs_speed?: 'quality' | 'balanced' | 'speed';
    cost_sensitivity?: 'low' | 'medium' | 'high';
  };
  project_context?: any;
}

export interface ExecutionPlan {
  id: string;
  userId: string;
  projectId?: number;
  title: string;
  description: string;
  goals: Goal[];
  tasks: Task[];
  execution_strategy: 'sequential' | 'parallel' | 'hybrid';
  estimated_duration: number; // Hours
  estimated_total_cost: string;
  risk_assessment: {
    overall_risk: 'low' | 'medium' | 'high';
    major_risks: string[];
    mitigation_strategies: string[];
  };
  status: 'draft' | 'approved' | 'executing' | 'paused' | 'completed' | 'failed';
  progress: {
    completed_goals: number;
    total_goals: number;
    completed_tasks: number;
    total_tasks: number;
  };
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

export interface DecompositionRequest {
  original_request: string;
  context: PlanningContext;
  max_complexity?: 'simple' | 'moderate' | 'complex' | 'any';
  focus_areas?: string[];
  exclude_areas?: string[];
}

class PlanningSystemService {
  private activePlans = new Map<string, ExecutionPlan>();
  private plannerProvider = 'mindsphere'; // Use MindSphere for planning
  private decomposerProvider = 'gpt-oss-120b'; // Use GPT-OSS for decomposition

  async decomposeGoal(request: DecompositionRequest): Promise<ExecutionPlan> {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Step 1: Analyze the request and understand the problem
    const analysis = await this.analyzeRequest(request);
    
    // Step 2: Decompose into high-level goals
    const goals = await this.identifyGoals(request, analysis);
    
    // Step 3: Break down goals into actionable tasks
    const tasks = await this.createTasks(goals, request.context);
    
    // Step 4: Optimize task sequence and dependencies
    const optimizedTasks = await this.optimizeTaskSequence(tasks);
    
    // Step 5: Estimate resources and create execution plan
    const plan = await this.createExecutionPlan(
      planId,
      request,
      goals,
      optimizedTasks,
      analysis
    );
    
    this.activePlans.set(planId, plan);
    
    // Store planning memory for learning
    if (request.context.projectId) {
      await this.storePlanningMemory(plan, request);
    }
    
    return plan;
  }

  private async analyzeRequest(request: DecompositionRequest): Promise<any> {
    const analysisPrompt = `Analyze the following request to understand its scope, complexity, and requirements:

REQUEST: ${request.original_request}

CONTEXT:
- Domain: ${request.context.domain}
- Constraints: ${JSON.stringify(request.context.constraints, null, 2)}
- User Preferences: ${JSON.stringify(request.context.user_preferences, null, 2)}

Please provide a thorough analysis including:
1. Problem understanding and scope
2. Key requirements and objectives
3. Technical complexity assessment
4. Resource requirements estimation
5. Potential challenges and risks
6. Success criteria definition
7. Recommended approach strategy

Format your response as structured analysis with clear sections.`;

    try {
      const result = await aiProviderService.generateCode(analysisPrompt, this.plannerProvider);
      return {
        content: result.response,
        tokens_used: result.tokensUsed,
        cost: result.cost
      };
    } catch (error) {
      console.error('Request analysis failed:', error);
      return {
        content: `Basic analysis: The request involves ${request.original_request}`,
        tokens_used: 0,
        cost: '0'
      };
    }
  }

  private async identifyGoals(request: DecompositionRequest, analysis: any): Promise<Goal[]> {
    const goalPrompt = `Based on the request analysis, identify and structure the main goals:

ORIGINAL REQUEST: ${request.original_request}
ANALYSIS: ${analysis.content}

Please identify 3-7 main goals that need to be accomplished. For each goal, provide:

{
  "goals": [
    {
      "title": "Concise goal title",
      "description": "Detailed goal description",
      "priority": "low|medium|high|critical",
      "type": "primary|secondary|milestone|constraint",
      "complexity": "simple|moderate|complex|advanced",
      "estimatedEffort": number_of_hours,
      "dependencies": ["array", "of", "goal_titles"],
      "success_criteria": ["specific", "measurable", "criteria"],
      "risk_factors": ["potential", "risks"]
    }
  ]
}

Focus on breaking down the request into logical, manageable goals that build toward the final objective.`;

    try {
      const result = await aiProviderService.generateCode(goalPrompt, this.decomposerProvider);
      const parsed = this.parseGoalsResponse(result.response);
      
      // Assign IDs and process dependencies
      return parsed.map((goal, index) => ({
        ...goal,
        id: `goal_${index + 1}`,
        dependencies: this.resolveDependencyIds((goal as any).dependencies || [], parsed),
        metadata: {
          analysis_tokens: result.tokensUsed,
          analysis_cost: result.cost
        }
      }));
    } catch (error) {
      console.error('Goal identification failed:', error);
      return this.createFallbackGoals(request);
    }
  }

  private parseGoalsResponse(response: string): Omit<Goal, 'id' | 'dependencies' | 'metadata'>[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.goals && Array.isArray(parsed.goals)) {
          return parsed.goals;
        }
      }
    } catch (error) {
      console.warn('Failed to parse goals JSON:', error);
    }

    // Fallback parsing
    return this.fallbackParseGoals(response);
  }

  private fallbackParseGoals(response: string): Omit<Goal, 'id' | 'dependencies' | 'metadata'>[] {
    const goals: Omit<Goal, 'id' | 'dependencies' | 'metadata'>[] = [];
    const lines = response.split('\n');
    
    let currentGoal: any = null;
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.match(/^\d+\.|^-\s*Goal|^Goal\s*\d+/i)) {
        if (currentGoal) goals.push(currentGoal);
        currentGoal = {
          title: trimmed.replace(/^\d+\.|^-\s*Goal\s*\d*:?\s*/i, ''),
          description: '',
          priority: 'medium',
          type: 'primary',
          complexity: 'moderate',
          estimatedEffort: 4,
          dependencies: [],
          success_criteria: [],
          risk_factors: []
        };
      } else if (currentGoal && trimmed) {
        currentGoal.description += (currentGoal.description ? ' ' : '') + trimmed;
      }
    }
    
    if (currentGoal) goals.push(currentGoal);
    return goals;
  }

  private resolveDependencyIds(dependencyTitles: string[], allGoals: any[]): string[] {
    return dependencyTitles.map(title => {
      const index = allGoals.findIndex(g => g.title.toLowerCase().includes(title.toLowerCase()));
      return index >= 0 ? `goal_${index + 1}` : title;
    });
  }

  private createFallbackGoals(request: DecompositionRequest): Goal[] {
    return [
      {
        id: 'goal_1',
        title: 'Analyze Requirements',
        description: `Analyze and understand the requirements for: ${request.original_request}`,
        priority: 'high',
        type: 'primary',
        complexity: 'simple',
        estimatedEffort: 2,
        dependencies: [],
        success_criteria: ['Requirements clearly understood', 'Scope defined'],
        risk_factors: ['Unclear requirements'],
        metadata: {}
      },
      {
        id: 'goal_2',
        title: 'Implement Solution',
        description: `Implement the main functionality for: ${request.original_request}`,
        priority: 'critical',
        type: 'primary',
        complexity: 'complex',
        estimatedEffort: 8,
        dependencies: ['goal_1'],
        success_criteria: ['Functionality implemented', 'Requirements met'],
        risk_factors: ['Technical complexity', 'Time constraints'],
        metadata: {}
      }
    ];
  }

  private async createTasks(goals: Goal[], context: PlanningContext): Promise<Task[]> {
    const allTasks: Task[] = [];
    
    for (const goal of goals) {
      const goalTasks = await this.decomposeGoalIntoTasks(goal, context);
      allTasks.push(...goalTasks);
    }
    
    return allTasks;
  }

  private async decomposeGoalIntoTasks(goal: Goal, context: PlanningContext): Promise<Task[]> {
    const taskPrompt = `Break down the following goal into specific, actionable tasks:

GOAL: ${goal.title}
DESCRIPTION: ${goal.description}
COMPLEXITY: ${goal.complexity}
SUCCESS CRITERIA: ${goal.success_criteria.join(', ')}

CONTEXT:
- Domain: ${context.domain}
- User Preferences: ${JSON.stringify(context.user_preferences)}

Please create 2-5 specific tasks that will accomplish this goal. For each task:

{
  "tasks": [
    {
      "title": "Specific task title",
      "description": "Detailed task description",
      "type": "analysis|design|implementation|testing|review|research",
      "priority": 1-10,
      "estimatedTokens": estimated_number,
      "required_inputs": ["what inputs are needed"],
      "expected_outputs": ["what outputs will be produced"],
      "validation_criteria": ["how to verify completion"]
    }
  ]
}

Focus on concrete, measurable tasks that clearly contribute to the goal.`;

    try {
      const result = await aiProviderService.generateCode(taskPrompt, this.decomposerProvider);
      const tasks = this.parseTasksResponse(result.response);
      
      return tasks.map((task, index) => {
        // Get suggested provider for this task
        const taskCharacteristics = {
          complexity: this.mapComplexityToTaskLevel(goal.complexity),
          domain: context.domain as any,
          outputLength: this.estimateOutputLength(task.estimatedTokens),
          latencyRequirement: 'medium' as const,
          accuracyRequirement: 'high' as const,
          context: 'moderate' as const
        };

        const suggestedProvider = this.suggestProviderForTask(
          task.type,
          taskCharacteristics,
          context.user_preferences
        );

        return {
          id: `task_${goal.id}_${index + 1}`,
          goalId: goal.id,
          ...task,
          status: 'pending' as const,
          suggestedProvider,
          estimatedCost: this.estimateCost(task.estimatedTokens, suggestedProvider),
          dependencies: this.inferTaskDependencies(task, index),
          created_at: new Date()
        };
      });
    } catch (error) {
      console.error('Task decomposition failed for goal:', goal.id, error);
      return this.createFallbackTasks(goal);
    }
  }

  private parseTasksResponse(response: string): Omit<Task, 'id' | 'goalId' | 'status' | 'suggestedProvider' | 'estimatedCost' | 'dependencies' | 'created_at'>[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          return parsed.tasks;
        }
      }
    } catch (error) {
      console.warn('Failed to parse tasks JSON:', error);
    }

    return this.fallbackParseTasks(response);
  }

  private fallbackParseTasks(response: string): any[] {
    // Simple fallback task parsing
    return [{
      title: 'Complete Goal',
      description: 'Work on completing the assigned goal',
      type: 'implementation',
      priority: 5,
      estimatedTokens: 1000,
      required_inputs: ['requirements'],
      expected_outputs: ['completed work'],
      validation_criteria: ['goal accomplished']
    }];
  }

  private mapComplexityToTaskLevel(goalComplexity: string): 'low' | 'medium' | 'high' | 'extreme' {
    const mapping = {
      'simple': 'low' as const,
      'moderate': 'medium' as const,
      'complex': 'high' as const,
      'advanced': 'extreme' as const
    };
    return mapping[goalComplexity as keyof typeof mapping] || 'medium';
  }

  private estimateOutputLength(tokens: number): 'short' | 'medium' | 'long' | 'very_long' {
    if (tokens < 500) return 'short';
    if (tokens < 1500) return 'medium';
    if (tokens < 4000) return 'long';
    return 'very_long';
  }

  private suggestProviderForTask(
    taskType: string,
    characteristics: any,
    preferences: any
  ): string {
    // Simple rule-based provider suggestion
    if (preferences.preferred_providers?.length > 0) {
      return preferences.preferred_providers[0];
    }

    switch (taskType) {
      case 'analysis':
      case 'research':
        return 'anthropic';
      case 'design':
        return 'mindsphere';
      case 'implementation':
        return 'gpt-oss-20b';
      case 'testing':
      case 'review':
        return 'spaceagent';
      default:
        return 'anthropic';
    }
  }

  private estimateCost(tokens: number, provider: string): string {
    const costPerToken = {
      'anthropic': 0.008,
      'openai': 0.03,
      'gpt-oss-120b': 0.02,
      'gpt-oss-20b': 0.005,
      'spaceagent': 0.012,
      'mindsphere': 0.015,
      'groq': 0.001,
      'complexity': 0.020
    };

    const rate = costPerToken[provider as keyof typeof costPerToken] || 0.01;
    return (tokens * rate).toFixed(4);
  }

  private inferTaskDependencies(task: any, index: number): string[] {
    // Simple heuristic: tasks generally depend on previous tasks
    return index > 0 ? [`task_${index}`] : [];
  }

  private createFallbackTasks(goal: Goal): Task[] {
    return [
      {
        id: `task_${goal.id}_1`,
        goalId: goal.id,
        title: `Complete ${goal.title}`,
        description: goal.description,
        type: 'implementation',
        status: 'pending',
        priority: 5,
        estimatedTokens: 1000,
        estimatedCost: '0.008',
        suggestedProvider: 'anthropic',
        dependencies: [],
        required_inputs: ['requirements'],
        expected_outputs: ['completed goal'],
        validation_criteria: ['goal accomplished'],
        created_at: new Date()
      }
    ];
  }

  private async optimizeTaskSequence(tasks: Task[]): Promise<Task[]> {
    // Topological sort based on dependencies
    const sorted = this.topologicalSort(tasks);
    
    // Adjust priorities based on critical path
    const optimized = this.adjustPriorities(sorted);
    
    return optimized;
  }

  private topologicalSort(tasks: Task[]): Task[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: Task[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    const visit = (taskId: string) => {
      if (temp.has(taskId)) {
        throw new Error(`Circular dependency detected involving task ${taskId}`);
      }
      if (!visited.has(taskId)) {
        temp.add(taskId);
        const task = taskMap.get(taskId);
        if (task) {
          for (const depId of task.dependencies) {
            if (taskMap.has(depId)) {
              visit(depId);
            }
          }
          visited.add(taskId);
          result.unshift(task);
        }
        temp.delete(taskId);
      }
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        visit(task.id);
      }
    }

    return result.reverse();
  }

  private adjustPriorities(tasks: Task[]): Task[] {
    // Calculate critical path and adjust priorities
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const priorities = new Map<string, number>();

    // Backward pass to calculate critical path
    const calculatePriority = (taskId: string): number => {
      if (priorities.has(taskId)) {
        return priorities.get(taskId)!;
      }

      const task = taskMap.get(taskId);
      if (!task) return 0;

      let maxDepPriority = 0;
      for (const depId of task.dependencies) {
        maxDepPriority = Math.max(maxDepPriority, calculatePriority(depId));
      }

      const priority = task.priority + maxDepPriority;
      priorities.set(taskId, priority);
      return priority;
    };

    // Calculate priorities for all tasks
    for (const task of tasks) {
      calculatePriority(task.id);
    }

    // Update task priorities
    return tasks.map(task => ({
      ...task,
      priority: priorities.get(task.id) || task.priority
    }));
  }

  private async createExecutionPlan(
    planId: string,
    request: DecompositionRequest,
    goals: Goal[],
    tasks: Task[],
    analysis: any
  ): Promise<ExecutionPlan> {
    const totalEstimatedHours = goals.reduce((sum, goal) => sum + goal.estimatedEffort, 0);
    const totalEstimatedCost = tasks.reduce((sum, task) => sum + parseFloat(task.estimatedCost), 0);

    const riskAssessment = this.assessRisks(goals, tasks, request.context);
    const executionStrategy = this.determineExecutionStrategy(tasks);

    return {
      id: planId,
      userId: request.context.userId,
      projectId: request.context.projectId,
      title: `Plan for: ${request.original_request}`,
      description: analysis.content.substring(0, 500) + '...',
      goals,
      tasks,
      execution_strategy: executionStrategy,
      estimated_duration: totalEstimatedHours,
      estimated_total_cost: totalEstimatedCost.toFixed(4),
      risk_assessment: riskAssessment,
      status: 'draft',
      progress: {
        completed_goals: 0,
        total_goals: goals.length,
        completed_tasks: 0,
        total_tasks: tasks.length
      },
      created_at: new Date()
    };
  }

  private assessRisks(goals: Goal[], tasks: Task[], context: PlanningContext): any {
    const allRisks = goals.flatMap(g => g.risk_factors);
    const riskCounts = allRisks.reduce((counts, risk) => {
      counts[risk] = (counts[risk] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const majorRisks = Object.entries(riskCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([risk]) => risk);

    const highComplexityTasks = tasks.filter(t => t.estimatedTokens > 3000).length;
    const totalCost = tasks.reduce((sum, t) => sum + parseFloat(t.estimatedCost), 0);

    let overallRisk: 'low' | 'medium' | 'high' = 'low';
    if (highComplexityTasks > 3 || totalCost > 50 || majorRisks.length > 3) {
      overallRisk = 'high';
    } else if (highComplexityTasks > 1 || totalCost > 20 || majorRisks.length > 1) {
      overallRisk = 'medium';
    }

    return {
      overall_risk: overallRisk,
      major_risks: majorRisks,
      mitigation_strategies: [
        'Regular progress reviews',
        'Flexible resource allocation',
        'Risk monitoring and early warning'
      ]
    };
  }

  private determineExecutionStrategy(tasks: Task[]): 'sequential' | 'parallel' | 'hybrid' {
    const dependencyCount = tasks.reduce((sum, task) => sum + task.dependencies.length, 0);
    const averageDependencies = dependencyCount / tasks.length;

    if (averageDependencies < 0.3) return 'parallel';
    if (averageDependencies > 0.8) return 'sequential';
    return 'hybrid';
  }

  private async storePlanningMemory(plan: ExecutionPlan, request: DecompositionRequest): Promise<void> {
    if (!plan.projectId) return;

    try {
      const { projectMemoryService } = await import("../projectMemory");
      await projectMemoryService.learnFromInteraction(
        plan.projectId,
        'planning',
        JSON.stringify({
          planId: plan.id,
          goalsCount: plan.goals.length,
          tasksCount: plan.tasks.length,
          estimatedDuration: plan.estimated_duration,
          executionStrategy: plan.execution_strategy,
          riskLevel: plan.risk_assessment.overall_risk
        }),
        {
          originalRequest: request.original_request,
          domain: request.context.domain,
          complexity: request.max_complexity || 'any',
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.warn('Failed to store planning memory:', error);
    }
  }

  async executePlan(planId: string): Promise<void> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    if (plan.status !== 'draft' && plan.status !== 'approved') {
      throw new Error('Plan is not ready for execution');
    }

    plan.status = 'executing';
    plan.started_at = new Date();

    try {
      for (const task of plan.tasks) {
        await this.executeTask(task, plan);
        plan.progress.completed_tasks++;
      }

      plan.status = 'completed';
      plan.completed_at = new Date();
    } catch (error) {
      plan.status = 'failed';
      console.error('Plan execution failed:', error);
      throw error;
    }
  }

  private async executeTask(task: Task, plan: ExecutionPlan): Promise<void> {
    task.status = 'in_progress';

    try {
      // Check if task should use prompt chaining
      if (task.assigned_chain) {
        await this.executeTaskWithChain(task, plan);
      } else {
        await this.executeTaskDirect(task, plan);
      }

      task.status = 'completed';
    } catch (error) {
      task.status = 'blocked';
      throw error;
    }
  }

  private async executeTaskWithChain(task: Task, plan: ExecutionPlan): Promise<void> {
    if (!task.assigned_chain) return;

    const chainExecution = await promptChainingService.executeChain(
      task.assigned_chain,
      {
        taskDescription: task.description,
        requiredInputs: task.required_inputs,
        expectedOutputs: task.expected_outputs
      },
      plan.userId,
      plan.projectId
    );

    // Store chain execution results
    task.metadata = {
      chainExecution: chainExecution.id,
      tokensUsed: chainExecution.totalTokensUsed,
      actualCost: chainExecution.totalCostUsd
    };
  }

  private async executeTaskDirect(task: Task, plan: ExecutionPlan): Promise<void> {
    const prompt = this.buildTaskPrompt(task, plan);
    const result = await aiProviderService.generateCode(prompt, task.suggestedProvider, plan.projectId);

    // Store task execution results
    task.metadata = {
      tokensUsed: result.tokensUsed,
      actualCost: result.cost,
      output: result.response
    };
  }

  private buildTaskPrompt(task: Task, plan: ExecutionPlan): string {
    return `Execute the following task as part of a larger plan:

TASK: ${task.title}
DESCRIPTION: ${task.description}
TYPE: ${task.type}

REQUIRED INPUTS: ${task.required_inputs.join(', ')}
EXPECTED OUTPUTS: ${task.expected_outputs.join(', ')}
VALIDATION CRITERIA: ${task.validation_criteria.join(', ')}

PLAN CONTEXT:
${plan.description}

Please complete this task thoroughly and provide output that meets the specified criteria.`;
  }

  getPlan(planId: string): ExecutionPlan | null {
    return this.activePlans.get(planId) || null;
  }

  async getUserPlans(userId: string): Promise<ExecutionPlan[]> {
    return Array.from(this.activePlans.values())
      .filter(plan => plan.userId === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async updateTaskStatus(planId: string, taskId: string, status: Task['status']): Promise<void> {
    const plan = this.activePlans.get(planId);
    if (!plan) throw new Error('Plan not found');

    const task = plan.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    task.status = status;

    // Update progress
    plan.progress.completed_tasks = plan.tasks.filter(t => t.status === 'completed').length;
    plan.progress.completed_goals = plan.goals.filter(goal => {
      const goalTasks = plan.tasks.filter(t => t.goalId === goal.id);
      return goalTasks.length > 0 && goalTasks.every(t => t.status === 'completed');
    }).length;
  }

  async getPlanningStats(userId: string): Promise<any> {
    const userPlans = await this.getUserPlans(userId);
    
    if (userPlans.length === 0) {
      return {
        totalPlans: 0,
        completionRate: 0,
        averageDuration: 0,
        commonRisks: []
      };
    }

    const completedPlans = userPlans.filter(p => p.status === 'completed');
    const allRisks = userPlans.flatMap(p => p.risk_assessment.major_risks);
    const riskCounts = allRisks.reduce((counts, risk) => {
      counts[risk] = (counts[risk] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const commonRisks = Object.entries(riskCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([risk, count]) => ({ risk, count }));

    return {
      totalPlans: userPlans.length,
      completionRate: completedPlans.length / userPlans.length,
      averageDuration: userPlans.reduce((sum, p) => sum + p.estimated_duration, 0) / userPlans.length,
      commonRisks
    };
  }
}

export const planningSystemService = new PlanningSystemService();