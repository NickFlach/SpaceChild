import { aiProviderService } from "./aiProviders";
import { consciousnessService } from "./consciousness";
import { projectTemplateService } from "./projectTemplates";
import { projectMemoryService } from "./projectMemory";
import { storage } from "../storage";
import { db } from "../db";
import { projectTemplates } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { InsertProject, InsertProjectFile, ProjectTemplate } from "@shared/schema";

interface SmartTemplateConfig {
  projectDescription: string;
  targetAudience?: string;
  preferredTechStack?: string[];
  requiredFeatures?: string[];
  scalabilityNeeds?: 'small' | 'medium' | 'large' | 'enterprise';
  securityLevel?: 'basic' | 'standard' | 'high' | 'critical';
}

interface SmartTemplateAnalysis {
  recommendedTemplate: ProjectTemplate;
  customizations: {
    dependencies: string[];
    securityFeatures: string[];
    architecturePatterns: string[];
    fileStructure: Array<{ path: string; content: string; purpose: string }>;
  };
  optimizations: {
    performance: string[];
    scalability: string[];
    security: string[];
  };
  confidence: number;
}

export class SmartTemplateService {
  /**
   * Analyze project requirements and generate smart template recommendations
   */
  async analyzeProjectRequirements(config: SmartTemplateConfig, userId: string): Promise<SmartTemplateAnalysis> {
    // Use AI to understand the project requirements
    const analysisPrompt = `Analyze this project description and recommend the best approach:

Project Description: ${config.projectDescription}
Target Audience: ${config.targetAudience || 'General users'}
Preferred Tech Stack: ${config.preferredTechStack?.join(', ') || 'Any modern stack'}
Required Features: ${config.requiredFeatures?.join(', ') || 'Standard features'}
Scalability: ${config.scalabilityNeeds || 'medium'}
Security Level: ${config.securityLevel || 'standard'}

Respond with a JSON object containing:
{
  "templateCategory": "web-app" | "api" | "fullstack" | "ml-model" | "cli",
  "recommendedStack": ["technology1", "technology2", ...],
  "requiredDependencies": ["package1", "package2", ...],
  "securityFeatures": ["feature1", "feature2", ...],
  "architecturePatterns": ["pattern1", "pattern2", ...],
  "estimatedComplexity": 1-10,
  "keyComponents": ["component1", "component2", ...]
}`;

    const aiResponse = await aiProviderService.chat(analysisPrompt, 'claude-sonnet-4-20250514');
    const analysis = JSON.parse(aiResponse.response);

    // Find the best matching template
    const templates = await projectTemplateService.getTemplates(analysis.templateCategory);
    const scoredTemplates = templates.map(template => ({
      template,
      score: this.calculateTemplateScore(template, analysis)
    }));
    
    scoredTemplates.sort((a, b) => b.score - a.score);
    const bestTemplate = scoredTemplates[0]?.template || templates[0];

    // Generate customized file structure
    const fileStructure = await this.generateSmartFileStructure(
      config,
      analysis,
      bestTemplate
    );

    // Generate optimizations based on requirements
    const optimizations = await this.generateOptimizations(config, analysis);

    return {
      recommendedTemplate: bestTemplate,
      customizations: {
        dependencies: analysis.requiredDependencies,
        securityFeatures: analysis.securityFeatures,
        architecturePatterns: analysis.architecturePatterns,
        fileStructure
      },
      optimizations,
      confidence: scoredTemplates[0]?.score / 100 || 0.7
    };
  }

  /**
   * Create a self-configuring project from smart analysis
   */
  async createSmartProject(
    config: SmartTemplateConfig,
    projectName: string,
    userId: string
  ): Promise<{ project: any; files: any[]; insights: string[] }> {
    // Analyze requirements
    const analysis = await this.analyzeProjectRequirements(config, userId);
    
    // Create base project from template
    const { project, files } = await projectTemplateService.createProjectFromTemplate(
      analysis.recommendedTemplate.id,
      userId,
      projectName,
      {
        description: config.projectDescription,
        consciousnessEnabled: true,
        superintelligenceEnabled: config.scalabilityNeeds === 'large' || config.scalabilityNeeds === 'enterprise'
      }
    );

    // Add smart customizations
    const additionalFiles = await this.applySmartCustomizations(
      project.id,
      analysis,
      config
    );

    // Configure intelligent features
    await this.configureIntelligentFeatures(project.id, analysis, config);

    // Learn from this project creation
    await this.learnFromProjectCreation(project.id, config, analysis);

    // Generate insights
    const insights = this.generateProjectInsights(analysis, config);

    return {
      project,
      files: [...files, ...additionalFiles],
      insights
    };
  }

  /**
   * Generate smart file structure based on requirements
   */
  private async generateSmartFileStructure(
    config: SmartTemplateConfig,
    analysis: any,
    template: ProjectTemplate
  ): Promise<Array<{ path: string; content: string; purpose: string }>> {
    const filePrompt = `Generate a smart file structure for this project:

Project: ${config.projectDescription}
Base Template: ${template.name}
Key Components: ${analysis.keyComponents.join(', ')}
Architecture Patterns: ${analysis.architecturePatterns.join(', ')}

Create a file structure that:
1. Follows best practices for ${analysis.templateCategory} projects
2. Implements ${analysis.architecturePatterns.join(' and ')} patterns
3. Includes proper separation of concerns
4. Has placeholder code with intelligent comments

Respond with JSON array of files:
[
  {
    "path": "src/...",
    "purpose": "Brief description of file purpose",
    "content": "Actual code content with comments"
  }
]

Include at least:
- Main entry point
- Core business logic
- Configuration files
- Type definitions (if TypeScript)
- Tests structure
- Documentation`;

    const aiResponse = await aiProviderService.chat(filePrompt, 'claude-sonnet-4-20250514');
    return JSON.parse(aiResponse.response);
  }

  /**
   * Apply smart customizations to the project
   */
  private async applySmartCustomizations(
    projectId: number,
    analysis: SmartTemplateAnalysis,
    config: SmartTemplateConfig
  ): Promise<any[]> {
    const additionalFiles: any[] = [];

    // Add security configurations
    if (analysis.customizations.securityFeatures.length > 0) {
      const securityConfig = await this.generateSecurityConfig(
        analysis.customizations.securityFeatures,
        config.securityLevel || 'standard'
      );
      
      const securityFile = await storage.createProjectFile({
        projectId,
        filePath: 'src/config/security.ts',
        content: securityConfig,
        fileType: 'typescript'
      });
      additionalFiles.push(securityFile);
    }

    // Add smart configuration files from generated structure
    for (const file of analysis.customizations.fileStructure) {
      const createdFile = await storage.createProjectFile({
        projectId,
        filePath: file.path,
        content: file.content,
        fileType: this.getFileType(file.path)
      });
      additionalFiles.push(createdFile);
    }

    // Add dependency configuration
    if (analysis.customizations.dependencies.length > 0) {
      const packageJson = await this.generateSmartPackageJson(
        analysis.customizations.dependencies,
        analysis.recommendedTemplate
      );
      
      const packageFile = await storage.createProjectFile({
        projectId,
        filePath: 'package.json',
        content: packageJson,
        fileType: 'json'
      });
      additionalFiles.push(packageFile);
    }

    return additionalFiles;
  }

  /**
   * Configure intelligent features for the project
   */
  private async configureIntelligentFeatures(
    projectId: number,
    analysis: SmartTemplateAnalysis,
    config: SmartTemplateConfig
  ) {
    // Set up consciousness context
    const project = await storage.getProject(projectId);
    if (project) {
      const { sessionId } = await consciousnessService.activate(
        project.userId,
        projectId
      );
      
      // Store creation context as a memory
      await consciousnessService.query(
        sessionId,
        `Project created with: ${JSON.stringify({
          description: config.projectDescription,
          techStack: analysis.customizations.dependencies,
          patterns: analysis.customizations.architecturePatterns,
          security: analysis.customizations.securityFeatures
        })}`,
        projectId
      );
    }

    // Configure project memory
    await projectMemoryService.learnFromInteraction(
      projectId,
      'project_setup',
      'Smart template configuration',
      {
        templateAnalysis: analysis,
        userRequirements: config
      }
    );

    // Set up intelligent monitoring
    if (config.scalabilityNeeds === 'large' || config.scalabilityNeeds === 'enterprise') {
      await projectMemoryService.learnFromInteraction(
        projectId,
        'user_preference',
        'Advanced monitoring configuration',
        {
          preferenceType: 'monitoring',
          value: 'advanced',
          metrics: ['performance', 'security', 'scalability'],
          alertThresholds: this.getAlertThresholds(config.scalabilityNeeds)
        }
      );
    }
  }

  /**
   * Learn from project creation for future improvements
   */
  private async learnFromProjectCreation(
    projectId: number,
    config: SmartTemplateConfig,
    analysis: SmartTemplateAnalysis
  ) {
    // Store template effectiveness in project memory
    await projectMemoryService.learnFromInteraction(
      projectId,
      'template_usage',
      `Used ${analysis.recommendedTemplate.name} template`,
      {
        config,
        selectedTemplate: analysis.recommendedTemplate.id,
        confidence: analysis.confidence,
        timestamp: new Date()
      }
    );

    // Learn patterns for similar projects
    await projectMemoryService.learnFromInteraction(
      projectId,
      'project_creation',
      'Project creation pattern',
      {
        requirements: config,
        solution: analysis,
        effectiveness: analysis.confidence
      }
    );
  }

  /**
   * Generate security configuration based on requirements
   */
  private async generateSecurityConfig(
    features: string[],
    level: string
  ): Promise<string> {
    const prompt = `Generate a TypeScript security configuration file that implements:
Security Features: ${features.join(', ')}
Security Level: ${level}

Include:
- Environment variable validation
- Security headers configuration
- Rate limiting settings
- Authentication/authorization setup
- Data encryption settings
- CORS configuration

Make it production-ready with proper types.`;

    const response = await aiProviderService.chat(prompt, 'claude-sonnet-4-20250514');
    return response.response;
  }

  /**
   * Generate smart package.json with optimized dependencies
   */
  private async generateSmartPackageJson(
    dependencies: string[],
    template: ProjectTemplate
  ): Promise<string> {
    const prompt = `Generate an optimized package.json for a ${template.category} project:
Required packages: ${dependencies.join(', ')}
Base template: ${template.name}

Include:
- Latest stable versions of packages
- Necessary dev dependencies
- Optimized scripts for development and production
- Proper module configuration
- Engine requirements

Ensure all dependencies are compatible.`;

    const response = await aiProviderService.chat(prompt, 'claude-sonnet-4-20250514');
    return response.response;
  }

  /**
   * Calculate template matching score
   */
  private calculateTemplateScore(template: ProjectTemplate, analysis: any): number {
    let score = 0;
    
    // Category match
    if (template.category === analysis.templateCategory) score += 30;
    
    // Tech stack overlap
    const stackOverlap = template.techStack.filter(tech => 
      analysis.recommendedStack.includes(tech)
    ).length;
    score += (stackOverlap / Math.max(template.techStack.length, 1)) * 20;
    
    // Feature coverage
    if (template.features) {
      const featureMatch = template.features.filter(feature =>
        analysis.keyComponents.some((comp: string) => 
          feature.toLowerCase().includes(comp.toLowerCase())
        )
      ).length;
      score += (featureMatch / Math.max(template.features.length, 1)) * 20;
    }
    
    // Complexity match - use estimated complexity based on features
    const templateComplexity = template.features?.length || 5;
    const complexityDiff = Math.abs(templateComplexity - analysis.estimatedComplexity);
    score += Math.max(0, 30 - complexityDiff * 3);
    
    return Math.min(100, score);
  }

  /**
   * Generate project insights
   */
  private generateProjectInsights(
    analysis: SmartTemplateAnalysis,
    config: SmartTemplateConfig
  ): string[] {
    const insights: string[] = [];
    
    insights.push(`Selected ${analysis.recommendedTemplate.name} template with ${Math.round(analysis.confidence * 100)}% confidence`);
    
    if (analysis.customizations.securityFeatures.length > 0) {
      insights.push(`Added ${analysis.customizations.securityFeatures.length} security features for ${config.securityLevel} security level`);
    }
    
    if (analysis.optimizations.performance.length > 0) {
      insights.push(`Implemented ${analysis.optimizations.performance.length} performance optimizations`);
    }
    
    if (config.scalabilityNeeds === 'large' || config.scalabilityNeeds === 'enterprise') {
      insights.push('Configured for enterprise-scale deployment with auto-scaling');
    }
    
    insights.push(`Generated ${analysis.customizations.fileStructure.length} smart files with context-aware code`);
    
    return insights;
  }

  /**
   * Get alert thresholds based on scalability needs
   */
  private getAlertThresholds(scalability: string) {
    const thresholds: Record<string, any> = {
      small: { cpu: 80, memory: 85, responseTime: 1000 },
      medium: { cpu: 75, memory: 80, responseTime: 500 },
      large: { cpu: 70, memory: 75, responseTime: 300 },
      enterprise: { cpu: 65, memory: 70, responseTime: 200 }
    };
    return thresholds[scalability] || thresholds.medium;
  }

  /**
   * Generate optimizations based on requirements
   */
  private async generateOptimizations(
    config: SmartTemplateConfig,
    analysis: any
  ): Promise<{ performance: string[]; scalability: string[]; security: string[] }> {
    const prompt = `Generate optimization recommendations for this project:
Type: ${analysis.templateCategory}
Scale: ${config.scalabilityNeeds}
Security: ${config.securityLevel}
Stack: ${analysis.recommendedStack.join(', ')}

Provide specific, actionable optimizations in JSON format:
{
  "performance": ["optimization1", "optimization2", ...],
  "scalability": ["optimization1", "optimization2", ...],
  "security": ["optimization1", "optimization2", ...]
}`;

    const response = await aiProviderService.chat(prompt, 'claude-sonnet-4-20250514');
    return JSON.parse(response.response);
  }

  /**
   * Update template based on usage patterns
   */
  async evolveTemplate(templateId: number): Promise<void> {
    // Get usage data from project memories
    const memories = await storage.getProjectMemories(templateId, 'template_usage');
    
    if (!memories || memories.length < 5) return; // Need enough data
    
    // Analyze patterns
    const templateUsages = memories
      .filter((m: any) => m.metadata?.selectedTemplate === templateId)
      .map((m: any) => m.metadata);
    
    // Find common patterns
    const commonFeatures = this.findCommonPatterns(templateUsages);
    
    // Update template if patterns are strong
    if (commonFeatures.confidence > 0.8) {
      const [template] = await db.select()
        .from(projectTemplates)
        .where(eq(projectTemplates.id, templateId));
      
      if (template) {
        await db.update(projectTemplates)
          .set({
            features: commonFeatures.features,
            techStack: commonFeatures.techStack,
            config: {
              ...template.config,
              ...commonFeatures.config,
              evolved: true,
              evolutionDate: new Date()
            }
          })
          .where(eq(projectTemplates.id, templateId));
      }
    }
  }

  /**
   * Find common patterns in template usage
   */
  private findCommonPatterns(usages: any[]): any {
    // Implementation would analyze usage patterns
    // This is a simplified version
    const featureFrequency: Record<string, number> = {};
    const techFrequency: Record<string, number> = {};
    
    usages.forEach(usage => {
      usage.config.requiredFeatures?.forEach((feature: string) => {
        featureFrequency[feature] = (featureFrequency[feature] || 0) + 1;
      });
      
      usage.analysis.customizations.dependencies?.forEach((dep: string) => {
        techFrequency[dep] = (techFrequency[dep] || 0) + 1;
      });
    });
    
    const threshold = usages.length * 0.6;
    const commonFeatures = Object.entries(featureFrequency)
      .filter(([_, count]) => count >= threshold)
      .map(([feature]) => feature);
    
    const commonTech = Object.entries(techFrequency)
      .filter(([_, count]) => count >= threshold)
      .map(([tech]) => tech);
    
    return {
      features: commonFeatures,
      techStack: commonTech,
      confidence: commonFeatures.length > 0 ? 0.85 : 0.5,
      config: {
        lastEvolved: new Date()
      }
    };
  }

  private getFileType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'md': 'markdown',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return typeMap[ext] || 'text';
  }
}

export const smartTemplateService = new SmartTemplateService();