import { ReasoningMode } from './enhancedReasoningEngine';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'reasoning' | 'coding' | 'analysis' | 'creative' | 'debugging' | 'optimization' | 'system';
  complexity: 'low' | 'medium' | 'high' | 'expert';
  reasoning_mode: ReasoningMode;
  template: string;
  variables: PromptVariable[];
  examples?: PromptExample[];
  metadata: {
    created_by: string;
    version: string;
    performance_score?: number;
    usage_count?: number;
    tags: string[];
  };
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: any;
  validation?: {
    min_length?: number;
    max_length?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface PromptExample {
  title: string;
  variables: Record<string, any>;
  expected_output: string;
  notes?: string;
}

export interface PromptContext {
  user_preferences?: Record<string, any>;
  project_context?: {
    name: string;
    type: string;
    technologies: string[];
    complexity: string;
  };
  conversation_history?: Array<{ role: string; content: string }>;
  consciousness_state?: {
    memories: any[];
    patterns: any[];
    preferences: any[];
  };
  task_context?: {
    deadline?: string;
    quality_requirements?: string;
    constraints?: string[];
  };
}

export class AdvancedPromptTemplateEngine {
  private templates: Map<string, PromptTemplate>;
  private templateCategories: Map<string, PromptTemplate[]>;
  private performanceMetrics: Map<string, any>;

  constructor() {
    this.templates = new Map();
    this.templateCategories = new Map();
    this.performanceMetrics = new Map();
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    const defaultTemplates: PromptTemplate[] = [
      // Chain-of-Thought Templates
      {
        id: 'cot-code-analysis',
        name: 'Chain-of-Thought Code Analysis',
        description: 'Systematic code analysis using step-by-step reasoning',
        category: 'analysis',
        complexity: 'medium',
        reasoning_mode: 'chain-of-thought',
        template: `Analyze the following code systematically:

{{code}}

Please follow this reasoning chain:

1. **Understanding**: First, let me understand what this code does
   - What is the main purpose?
   - What are the key components?
   - What technologies/patterns are used?

2. **Structure Analysis**: Let me examine the structure
   - How is the code organized?
   - What are the main functions/classes?
   - How do components interact?

3. **Quality Assessment**: Let me evaluate the quality
   - What are the strengths?
   - What are the weaknesses?
   - Are there any code smells or anti-patterns?

4. **Security & Performance**: Let me check for issues
   - Are there security vulnerabilities?
   - What are potential performance bottlenecks?
   - Are there error handling concerns?

5. **Recommendations**: Based on my analysis
   - What specific improvements would I suggest?
   - What would be the priority order?
   - What would be the expected impact?

Let me work through each step carefully:`,
        variables: [
          {
            name: 'code',
            type: 'string',
            description: 'The code to analyze',
            required: true
          }
        ],
        examples: [
          {
            title: 'React Component Analysis',
            variables: { code: 'function UserProfile({ user }) { return <div>{user.name}</div>; }' },
            expected_output: 'Step-by-step analysis of the React component',
            notes: 'Focuses on React-specific patterns and best practices'
          }
        ],
        metadata: {
          created_by: 'system',
          version: '1.0',
          tags: ['analysis', 'code', 'systematic']
        }
      },
      
      // Tree-of-Thought Templates
      {
        id: 'tot-problem-solving',
        name: 'Tree-of-Thought Problem Solving',
        description: 'Explore multiple solution paths before choosing the best approach',
        category: 'reasoning',
        complexity: 'high',
        reasoning_mode: 'tree-of-thought',
        template: `Problem to solve: {{problem}}

I'll explore multiple reasoning paths to find the optimal solution:

**Path 1: Analytical Approach**
- Break down the problem into components
- Analyze each component systematically
- Build solution from verified parts
- Feasibility: ?/10
- Innovation: ?/10
- Practicality: ?/10

**Path 2: Creative Approach** 
- Think outside conventional boundaries
- Explore unconventional solutions
- Combine ideas in novel ways
- Feasibility: ?/10
- Innovation: ?/10
- Practicality: ?/10

**Path 3: Experience-Based Approach**
- Draw from similar solved problems
- Apply proven patterns and solutions
- Adapt existing solutions to current context
- Feasibility: ?/10
- Innovation: ?/10
- Practicality: ?/10

**Path Evaluation & Selection:**
Now I'll evaluate each path and select the most promising approach, considering:
- Problem complexity: {{complexity}}
- Available resources: {{resources}}
- Time constraints: {{time_constraints}}
- Quality requirements: {{quality_requirements}}

**Selected Path & Implementation:**
Based on my evaluation, I'll proceed with [selected path] because [reasoning].

Here's my detailed solution:`,
        variables: [
          {
            name: 'problem',
            type: 'string',
            description: 'The problem statement to solve',
            required: true
          },
          {
            name: 'complexity',
            type: 'string',
            description: 'Problem complexity level',
            required: false,
            default: 'medium'
          },
          {
            name: 'resources',
            type: 'string',
            description: 'Available resources and constraints',
            required: false,
            default: 'standard'
          },
          {
            name: 'time_constraints',
            type: 'string',
            description: 'Time limitations',
            required: false,
            default: 'flexible'
          },
          {
            name: 'quality_requirements',
            type: 'string',
            description: 'Quality expectations',
            required: false,
            default: 'high'
          }
        ],
        metadata: {
          created_by: 'system',
          version: '1.0',
          tags: ['problem-solving', 'exploration', 'systematic']
        }
      },

      // Metacognitive Templates
      {
        id: 'meta-debugging',
        name: 'Metacognitive Debugging',
        description: 'Self-aware debugging with strategy monitoring and adaptation',
        category: 'debugging',
        complexity: 'expert',
        reasoning_mode: 'metacognitive',
        template: `Debugging Challenge: {{error_description}}

Code Context:
{{code_context}}

**Metacognitive Debugging Process:**

**Step 1: Strategy Selection & Monitoring**
I need to select an appropriate debugging strategy. Let me consider:
- Error type: {{error_type}}
- Code complexity: {{code_complexity}}
- Available information: {{available_info}}

Selected Strategy: [Initial strategy selection with reasoning]
Confidence in Strategy: ?/10
Expected Time: ? minutes

**Step 2: Strategy Execution & Monitoring**
Now I'll execute my chosen strategy while monitoring its effectiveness:

[Execute debugging steps while monitoring progress]

Strategy Effectiveness Check:
- Am I making progress toward the solution? Yes/No
- Is this approach revealing useful information? Yes/No  
- Should I continue or switch strategies? Continue/Switch

**Step 3: Strategy Adaptation (if needed)**
Based on my monitoring, I need to [continue/adapt/switch] because [reasoning].

If switching: New strategy is [strategy] because [reasoning]

**Step 4: Solution Synthesis & Learning**
Final solution approach:
[Detailed solution]

**Metacognitive Reflection:**
- What worked well in my debugging approach?
- What could I improve for similar problems?
- What patterns should I remember for future debugging?
- How confident am I in this solution? ?/10

**Solution Validation:**
Let me verify my solution addresses:
- The original error: ✓/✗
- Potential side effects: ✓/✗
- Code quality: ✓/✗
- Best practices: ✓/✗`,
        variables: [
          {
            name: 'error_description',
            type: 'string',
            description: 'Description of the error or bug',
            required: true
          },
          {
            name: 'code_context',
            type: 'string',
            description: 'Relevant code that has the issue',
            required: true
          },
          {
            name: 'error_type',
            type: 'string',
            description: 'Type of error (syntax, logic, runtime, etc.)',
            required: false,
            default: 'unknown'
          },
          {
            name: 'code_complexity',
            type: 'string',
            description: 'Complexity level of the code',
            required: false,
            default: 'medium'
          },
          {
            name: 'available_info',
            type: 'string',
            description: 'Available debugging information (logs, error messages, etc.)',
            required: false,
            default: 'limited'
          }
        ],
        metadata: {
          created_by: 'system',
          version: '1.0',
          tags: ['debugging', 'metacognition', 'self-monitoring']
        }
      },

      // Reflection Templates
      {
        id: 'reflection-code-review',
        name: 'Reflective Code Review',
        description: 'Iterative code review with self-correction and improvement',
        category: 'analysis',
        complexity: 'high',
        reasoning_mode: 'reflection',
        template: `Code Review Request: {{review_scope}}

Code to Review:
{{code}}

**Initial Review Pass:**

Let me provide my first assessment of this code:

*Functionality:* 
- Does it work as intended?
- Are the requirements met?

*Code Quality:*
- Is it readable and maintainable?
- Does it follow best practices?

*Performance:*
- Are there performance concerns?
- Could it be more efficient?

*Security:*
- Are there security vulnerabilities?
- Is user input properly validated?

**Critical Reflection Phase:**

Now let me critically examine my initial review:

*Review Quality Check:*
- Did I miss any important aspects?
- Are my assessments accurate and fair?
- Did I consider the full context?
- Are my suggestions practical and beneficial?

*Bias & Assumption Check:*
- What assumptions did I make?
- Could there be valid reasons for the current approach?
- Am I being too harsh or too lenient?

*Completeness Check:*
- Architecture considerations?
- Testing implications?
- Documentation needs?
- Maintenance requirements?

**Improved Review:**

Based on my reflection, here's my refined code review:

*Updated Assessment:*
[More thoughtful and complete analysis]

*Priority Recommendations:*
1. High Priority: [Critical issues that should be addressed immediately]
2. Medium Priority: [Important improvements that should be considered]
3. Low Priority: [Nice-to-have enhancements]

*Positive Aspects:*
[What the code does well - important to acknowledge]

**Implementation Guidance:**
For each recommendation, I'll provide:
- Specific examples of the issue
- Suggested solutions
- Why this change matters
- Estimated impact and effort

**Learning Insights:**
What did I learn from this reflective review process?
- About the code patterns
- About my own review tendencies  
- About the domain/context
- About effective code review practices`,
        variables: [
          {
            name: 'review_scope',
            type: 'string',
            description: 'Scope of the code review (full application, component, function, etc.)',
            required: true
          },
          {
            name: 'code',
            type: 'string',
            description: 'The code to be reviewed',
            required: true
          }
        ],
        metadata: {
          created_by: 'system',
          version: '1.0',
          tags: ['code-review', 'reflection', 'improvement']
        }
      },

      // Creative Problem Solving
      {
        id: 'creative-solution-design',
        name: 'Creative Solution Design',
        description: 'Innovative problem solving with creative thinking techniques',
        category: 'creative',
        complexity: 'high',
        reasoning_mode: 'ensemble',
        template: `Creative Challenge: {{challenge}}

Context & Constraints:
{{context}}

**Creative Exploration Phase:**

**Technique 1: Divergent Thinking**
Let me brainstorm multiple creative approaches:
- Approach A: [Unconventional idea 1]
- Approach B: [Unconventional idea 2]
- Approach C: [Combination/hybrid idea]
- Approach D: [Completely different perspective]

**Technique 2: Analogical Reasoning**
What solutions exist in other domains?
- Nature-inspired: How does nature solve similar problems?
- Other industries: How do other fields handle this?
- Historical: How was this solved in the past?
- Cross-cultural: Different cultural approaches?

**Technique 3: Constraint Removal**
What if we removed each constraint temporarily?
- Without budget limits: [solution]
- Without time constraints: [solution]
- Without technical limitations: [solution]
- Without stakeholder concerns: [solution]

**Technique 4: Reverse Engineering**
Let me work backwards from the ideal outcome:
- Perfect end state: {{ideal_outcome}}
- Working backwards: What would need to be true?
- Critical dependencies: What must exist?
- Minimal viable approach: Simplest path forward?

**Creative Synthesis:**
Now I'll combine the most promising elements:

*Selected Creative Elements:*
- From divergent thinking: [element]
- From analogical reasoning: [element]
- From constraint removal: [element]
- From reverse engineering: [element]

*Innovative Solution Design:*
[Detailed creative solution combining the best elements]

**Practical Implementation:**
Making the creative solution practical:

*Phase 1 (Immediate):* 
- What can be implemented now?
- What are the quick wins?

*Phase 2 (Short-term):*
- What needs development?
- What resources are required?

*Phase 3 (Long-term):*
- What's the full vision?
- How does it scale and evolve?

**Risk Assessment & Mitigation:**
For this creative approach:
- Innovation risks: [risks and mitigation]
- Technical risks: [risks and mitigation]  
- Adoption risks: [risks and mitigation]
- Backup plans: [alternatives if needed]`,
        variables: [
          {
            name: 'challenge',
            type: 'string',
            description: 'The creative challenge or problem to solve',
            required: true
          },
          {
            name: 'context',
            type: 'string',
            description: 'Context and constraints for the challenge',
            required: true
          },
          {
            name: 'ideal_outcome',
            type: 'string',
            description: 'Description of the ideal solution outcome',
            required: false,
            default: 'optimal solution that exceeds expectations'
          }
        ],
        metadata: {
          created_by: 'system',
          version: '1.0',
          tags: ['creativity', 'innovation', 'problem-solving']
        }
      },

      // System Integration Template
      {
        id: 'consciousness-integration',
        name: 'Consciousness-Integrated Response',
        description: 'AI response that leverages consciousness, memory, and learning',
        category: 'system',
        complexity: 'expert',
        reasoning_mode: 'metacognitive',
        template: `{{#if consciousness_context}}
**Consciousness Context Integration:**
Drawing from my memory of our previous interactions:
{{#each consciousness_context.relevant_memories}}
- {{this.type}}: {{this.content}}
{{/each}}

Based on your preferences, I know you prefer:
{{#each consciousness_context.user_preferences}}
- {{this.category}}: {{this.value}}
{{/each}}

I've noticed these patterns in our collaboration:
{{#each consciousness_context.interaction_patterns}}
- {{this.pattern}}: occurs {{this.frequency}} times
{{/each}}
{{/if}}

**Request Analysis:**
{{request}}

**Conscious Response Generation:**

*Memory-Informed Approach:*
Based on our history, I understand you typically value {{preferred_approach}} approaches. I'll tailor my response accordingly.

*Pattern Recognition:*
I notice this request is similar to {{similar_past_requests}}, where {{successful_pattern}} worked well.

*Adaptive Learning:*
Since {{previous_feedback}}, I've adjusted my approach to focus more on {{adaptation_area}}.

**Contextual Solution:**
[Main response content that incorporates consciousness insights]

**Learning Integration:**
From this interaction, I'm learning:
- {{learning_insight_1}}
- {{learning_insight_2}}
- {{learning_insight_3}}

**Confidence Assessment:**
Based on our interaction history and current context:
- My confidence in this response: {{confidence_score}}/10
- Why: {{confidence_reasoning}}
- If confidence is low: Alternative approaches I could try: {{alternatives}}

**Memory Storage:**
I'll remember from this interaction:
- {{memory_to_store_1}}
- {{memory_to_store_2}}
- Your response patterns for future reference

**Adaptation Notes:**
For future similar requests, I should:
- {{adaptation_note_1}}
- {{adaptation_note_2}}`,
        variables: [
          {
            name: 'request',
            type: 'string',
            description: 'The user request to respond to',
            required: true
          },
          {
            name: 'consciousness_context',
            type: 'object',
            description: 'Consciousness context including memories, preferences, and patterns',
            required: false
          },
          {
            name: 'preferred_approach',
            type: 'string',
            description: 'User\'s preferred approach style',
            required: false,
            default: 'detailed and systematic'
          },
          {
            name: 'confidence_score',
            type: 'number',
            description: 'Confidence score for the response',
            required: false,
            default: 8
          }
        ],
        metadata: {
          created_by: 'system',
          version: '1.0',
          tags: ['consciousness', 'memory', 'adaptation', 'learning']
        }
      }
    ];

    // Register templates
    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
      
      // Add to category index
      if (!this.templateCategories.has(template.category)) {
        this.templateCategories.set(template.category, []);
      }
      this.templateCategories.get(template.category)!.push(template);
    });
  }

  /**
   * Generate a prompt from template with variable substitution
   */
  generatePrompt(
    templateId: string,
    variables: Record<string, any>,
    context?: PromptContext
  ): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Validate required variables
    const missingVariables = template.variables
      .filter(v => v.required && !(v.name in variables))
      .map(v => v.name);

    if (missingVariables.length > 0) {
      throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
    }

    // Add defaults for missing optional variables
    const allVariables = { ...variables };
    template.variables.forEach(v => {
      if (!(v.name in allVariables) && v.default !== undefined) {
        allVariables[v.name] = v.default;
      }
    });

    // Add context variables if available
    if (context) {
      allVariables.consciousness_context = context.consciousness_state;
      allVariables.project_context = context.project_context;
      allVariables.conversation_history = context.conversation_history;
    }

    // Perform template substitution
    let result = template.template;
    
    // Simple variable substitution {{variable}}
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const cleanVarName = varName.trim();
      return allVariables[cleanVarName] !== undefined ? String(allVariables[cleanVarName]) : match;
    });

    // Handle conditional blocks {{#if condition}}...{{/if}}
    result = result.replace(/\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}/gs, (match, condition, content) => {
      const conditionValue = allVariables[condition.trim()];
      return conditionValue ? content : '';
    });

    // Handle loops {{#each array}}...{{/each}}
    result = result.replace(/\{\{#each\s+([^}]+)\}\}(.*?)\{\{\/each\}\}/gs, (match, arrayName, itemTemplate) => {
      const array = allVariables[arrayName.trim()];
      if (!Array.isArray(array)) return '';
      
      return array.map((item, index) => {
        let itemResult = itemTemplate;
        // Replace {{this}} with item
        itemResult = itemResult.replace(/\{\{this\}\}/g, String(item));
        // Replace {{this.property}} with item.property  
        itemResult = itemResult.replace(/\{\{this\.([^}]+)\}\}/g, (match, prop) => {
          return item && typeof item === 'object' && prop in item ? String(item[prop]) : '';
        });
        return itemResult;
      }).join('');
    });

    return result;
  }

  /**
   * Find templates matching criteria
   */
  findTemplates(criteria: {
    category?: string;
    complexity?: string;
    reasoning_mode?: ReasoningMode;
    tags?: string[];
  }): PromptTemplate[] {
    let results = Array.from(this.templates.values());

    if (criteria.category) {
      results = results.filter(t => t.category === criteria.category);
    }

    if (criteria.complexity) {
      results = results.filter(t => t.complexity === criteria.complexity);
    }

    if (criteria.reasoning_mode) {
      results = results.filter(t => t.reasoning_mode === criteria.reasoning_mode);
    }

    if (criteria.tags) {
      results = results.filter(t => 
        criteria.tags!.some(tag => t.metadata.tags.includes(tag))
      );
    }

    return results.sort((a, b) => (b.metadata.performance_score || 0) - (a.metadata.performance_score || 0));
  }

  /**
   * Recommend templates for a given task
   */
  recommendTemplates(
    taskDescription: string,
    context?: PromptContext
  ): PromptTemplate[] {
    const taskLower = taskDescription.toLowerCase();
    
    // Rule-based recommendations
    const recommendations: { template: PromptTemplate; score: number }[] = [];

    this.templates.forEach(template => {
      let score = 0;

      // Category matching
      if (taskLower.includes('debug') && template.category === 'debugging') score += 30;
      if (taskLower.includes('analyz') && template.category === 'analysis') score += 30;
      if (taskLower.includes('creative') && template.category === 'creative') score += 30;
      if (taskLower.includes('code') && template.category === 'coding') score += 20;
      if (taskLower.includes('optim') && template.category === 'optimization') score += 25;

      // Reasoning mode matching
      if (taskLower.includes('step by step') && template.reasoning_mode === 'chain-of-thought') score += 20;
      if (taskLower.includes('multiple approach') && template.reasoning_mode === 'tree-of-thought') score += 20;
      if (taskLower.includes('reflect') && template.reasoning_mode === 'reflection') score += 20;
      if (taskLower.includes('creative') && template.reasoning_mode === 'ensemble') score += 15;

      // Complexity matching
      if (context?.task_context?.quality_requirements === 'high' && template.complexity === 'expert') score += 15;
      if (taskLower.includes('simple') && template.complexity === 'low') score += 10;
      if (taskLower.includes('complex') && template.complexity === 'high') score += 10;

      // Performance score
      score += (template.metadata.performance_score || 50) / 5;

      if (score > 10) {
        recommendations.push({ template, score });
      }
    });

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(r => r.template);
  }

  /**
   * Create a custom template
   */
  createTemplate(template: Omit<PromptTemplate, 'metadata'>): string {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullTemplate: PromptTemplate = {
      ...template,
      id,
      metadata: {
        created_by: 'user',
        version: '1.0',
        tags: [],
        ...template.metadata
      }
    };

    this.templates.set(id, fullTemplate);
    
    // Add to category index
    if (!this.templateCategories.has(template.category)) {
      this.templateCategories.set(template.category, []);
    }
    this.templateCategories.get(template.category)!.push(fullTemplate);

    return id;
  }

  /**
   * Track template performance
   */
  trackTemplateUsage(
    templateId: string, 
    success: boolean, 
    userFeedback?: number,
    responseTime?: number
  ): void {
    const template = this.templates.get(templateId);
    if (!template) return;

    // Update usage metrics
    template.metadata.usage_count = (template.metadata.usage_count || 0) + 1;

    // Update performance score
    let currentScore = template.metadata.performance_score || 50;
    let newDataPoint = success ? 80 : 20;
    
    if (userFeedback) {
      newDataPoint = Math.max(newDataPoint, userFeedback * 10);
    }

    // Exponential moving average
    template.metadata.performance_score = currentScore * 0.9 + newDataPoint * 0.1;

    // Store detailed metrics
    const templateMetrics = this.performanceMetrics.get(templateId) || {
      usage_history: [],
      avg_response_time: 0,
      success_rate: 0
    };

    templateMetrics.usage_history.push({
      timestamp: new Date(),
      success,
      user_feedback: userFeedback,
      response_time: responseTime
    });

    // Keep only recent history
    if (templateMetrics.usage_history.length > 100) {
      templateMetrics.usage_history = templateMetrics.usage_history.slice(-50);
    }

    // Calculate updated metrics
    const recentHistory = templateMetrics.usage_history.slice(-20);
    templateMetrics.success_rate = recentHistory.filter(h => h.success).length / recentHistory.length;
    templateMetrics.avg_response_time = recentHistory
      .filter(h => h.response_time)
      .reduce((sum, h) => sum + (h.response_time || 0), 0) / recentHistory.length;

    this.performanceMetrics.set(templateId, templateMetrics);
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): PromptTemplate[] {
    return this.templateCategories.get(category) || [];
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): PromptTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get template performance metrics
   */
  getTemplateMetrics(): Map<string, any> {
    const metrics = new Map();
    
    for (const [templateId, template] of this.templates) {
      const detailed = this.performanceMetrics.get(templateId);
      metrics.set(templateId, {
        name: template.name,
        category: template.category,
        performance_score: template.metadata.performance_score || 50,
        usage_count: template.metadata.usage_count || 0,
        success_rate: detailed?.success_rate || 0.5,
        avg_response_time: detailed?.avg_response_time || 0
      });
    }
    
    return metrics;
  }

  /**
   * Export templates for backup/sharing
   */
  exportTemplates(): string {
    const exportData = {
      templates: Array.from(this.templates.values()),
      performance_metrics: Object.fromEntries(this.performanceMetrics),
      export_timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import templates from backup/sharing
   */
  importTemplates(exportData: string): { imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;
    
    try {
      const data = JSON.parse(exportData);
      
      if (data.templates && Array.isArray(data.templates)) {
        for (const template of data.templates) {
          try {
            if (template.id && template.name && template.template) {
              this.templates.set(template.id, template);
              
              // Update category index
              if (!this.templateCategories.has(template.category)) {
                this.templateCategories.set(template.category, []);
              }
              this.templateCategories.get(template.category)!.push(template);
              
              imported++;
            } else {
              errors.push(`Template missing required fields: ${template.name || 'unnamed'}`);
            }
          } catch (error) {
            errors.push(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      
      // Import performance metrics if available
      if (data.performance_metrics) {
        for (const [templateId, metrics] of Object.entries(data.performance_metrics)) {
          this.performanceMetrics.set(templateId, metrics);
        }
      }
      
    } catch (error) {
      errors.push(`Failed to parse import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return { imported, errors };
  }
}