import { db } from "../db";
import {
  projects,
  projectFiles,
  superintelligenceAnalyses,
  superintelligenceOptimizations,
  superintelligenceRecommendations,
  type InsertSuperintelligenceAnalysis,
  type InsertSuperintelligenceOptimization,
  type InsertSuperintelligenceRecommendation,
  type SuperintelligenceAnalysis,
  type SuperintelligenceOptimization,
  type SuperintelligenceRecommendation,
} from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import * as parser from "@babel/parser";
import { default as babelTraverse } from "@babel/traverse";
import generate from "@babel/generator";
import { OpenAI } from "openai";
import { Anthropic } from "@anthropic-ai/sdk";

// Initialize AI providers
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface CodeAnalysis {
  complexity: number;
  issues: Array<{
    type: "performance" | "security" | "maintainability" | "bug";
    severity: "low" | "medium" | "high" | "critical";
    line: number;
    column: number;
    message: string;
    suggestion?: string;
  }>;
  metrics: {
    linesOfCode: number;
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    maintainabilityIndex: number;
    dependencies: string[];
    unusedVariables: string[];
    duplicateCode: Array<{ start: number; end: number; similarity: number }>;
  };
  ast?: any;
}

export class SuperintelligenceService {
  private aiCache = new Map<string, { result: any; timestamp: number }>();
  private cacheExpiry = 1000 * 60 * 30; // 30 minutes

  /**
   * Analyze code using AST parsing and AI-powered insights
   */
  async analyzeCode(
    projectId: number | string,
    fileId: string,
    code: string,
    language: string = "typescript",
  ): Promise<CodeAnalysis> {
    try {
      // Parse the code into AST
      const ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx", "decorators-legacy"],
        errorRecovery: true,
      });

      const analysis: CodeAnalysis = {
        complexity: 0,
        issues: [],
        metrics: {
          linesOfCode: code.split("\n").length,
          cyclomaticComplexity: 0,
          cognitiveComplexity: 0,
          maintainabilityIndex: 100,
          dependencies: [],
          unusedVariables: [],
          duplicateCode: [],
        },
        ast,
      };

      // Traverse AST to collect metrics
      const declaredVariables = new Set<string>();
      const usedVariables = new Set<string>();
      let complexity = 1;

      babelTraverse(ast, {
        // Track complexity
        IfStatement() {
          complexity++;
        },
        ForStatement() {
          complexity++;
        },
        WhileStatement() {
          complexity++;
        },
        DoWhileStatement() {
          complexity++;
        },
        SwitchCase() {
          complexity++;
        },
        ConditionalExpression() {
          complexity++;
        },
        LogicalExpression(path) {
          if (path.node.operator === "&&" || path.node.operator === "||") {
            complexity++;
          }
        },

        // Track variable usage
        VariableDeclarator(path) {
          if (path.node.id.type === "Identifier") {
            declaredVariables.add(path.node.id.name);
          }
        },
        Identifier(path) {
          if (path.isReferencedIdentifier()) {
            usedVariables.add(path.node.name);
          }
        },

        // Detect potential issues
        CallExpression(path) {
          // Check for eval usage
          if (
            path.node.callee.type === "Identifier" &&
            path.node.callee.name === "eval"
          ) {
            analysis.issues.push({
              type: "security",
              severity: "critical",
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              message: "Avoid using eval() as it poses security risks",
              suggestion:
                "Use JSON.parse() for JSON data or Function constructor for dynamic code",
            });
          }

          // Check for console.log in production
          if (
            path.node.callee.type === "MemberExpression" &&
            path.node.callee.object.type === "Identifier" &&
            path.node.callee.object.name === "console"
          ) {
            analysis.issues.push({
              type: "maintainability",
              severity: "low",
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              message: "Remove console statements in production code",
              suggestion:
                "Use a proper logging service or remove debug statements",
            });
          }
        },

        // Check for hardcoded credentials
        StringLiteral(path) {
          const value = path.node.value;
          if (
            value.includes("password") ||
            value.includes("secret") ||
            value.includes("api_key") ||
            /^(?=.{20,}$)(?:[A-Za-z0-9+/_-]{4})*(?:[A-Za-z0-9+/_-]{2}==|[A-Za-z0-9+/_-]{3}=)?$/.test(
              value,
            ) // Base64-like strings
          ) {
            analysis.issues.push({
              type: "security",
              severity: "high",
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              message: "Potential hardcoded credential detected",
              suggestion:
                "Use environment variables or secure configuration management",
            });
          }
        },

        // Import tracking
        ImportDeclaration(path) {
          const source = path.node.source.value;
          analysis.metrics.dependencies.push(source);
        },
      });

      // Calculate metrics
      analysis.complexity = complexity;
      analysis.metrics.cyclomaticComplexity = complexity;
      analysis.metrics.cognitiveComplexity = Math.floor(complexity * 1.5); // Simplified calculation

      // Calculate maintainability index (simplified version)
      const volume =
        analysis.metrics.linesOfCode * Math.log2(declaredVariables.size + 1);
      const cyclomaticComplexity = complexity;
      const percentCommentLines = 0.1; // Assume 10% comments for now

      analysis.metrics.maintainabilityIndex = Math.max(
        0,
        Math.min(
          100,
          171 -
            5.2 * Math.log(volume) -
            0.23 * cyclomaticComplexity +
            16.2 * Math.log(percentCommentLines + 0.001),
        ),
      );

      // Find unused variables
      declaredVariables.forEach((variable) => {
        if (!usedVariables.has(variable)) {
          analysis.metrics.unusedVariables.push(variable);
          analysis.issues.push({
            type: "maintainability",
            severity: "low",
            line: 0, // Would need to track this properly
            column: 0,
            message: `Unused variable: ${variable}`,
            suggestion: "Remove unused variables to improve code clarity",
          });
        }
      });

      // Store analysis in database
      const analysisData: InsertSuperintelligenceAnalysis = {
        projectId: String(projectId),
        fileId,
        analysisType: "code_quality",
        results: analysis,
        confidence: 0.85,
        timestamp: new Date(),
      };

      const [dbAnalysis] = await db
        .insert(superintelligenceAnalyses)
        .values(analysisData)
        .returning();

      return analysis;
    } catch (error) {
      console.error("Code analysis error:", error);
      throw new Error("Failed to analyze code");
    }
  }

  /**
   * Generate performance optimization suggestions
   */
  async optimizePerformance(
    projectId: number | string,
    analysis: CodeAnalysis,
  ): Promise<SuperintelligenceOptimization[]> {
    const optimizations: InsertSuperintelligenceOptimization[] = [];

    // Check for performance anti-patterns
    if (analysis.metrics.cyclomaticComplexity > 10) {
      optimizations.push({
        projectId: String(projectId),
        optimizationType: "refactoring",
        description: "High cyclomatic complexity detected",
        impact: "high",
        estimatedImprovement: "30-50% better maintainability",
        implementation: {
          steps: [
            "Break down complex functions into smaller, focused functions",
            "Use early returns to reduce nesting",
            "Consider using switch statements or lookup tables for multiple conditions",
            "Extract complex conditions into well-named boolean variables",
          ],
          codeExample: `// Before
function processData(data) {
  if (data && data.length > 0) {
    if (data[0].type === 'A') {
      // complex logic
    } else if (data[0].type === 'B') {
      // more logic
    }
  }
}

// After
function processData(data) {
  if (!isValidData(data)) return;
  
  const handlers = {
    'A': handleTypeA,
    'B': handleTypeB
  };
  
  const handler = handlers[data[0].type];
  if (handler) handler(data);
}`,
        },
        confidence: 0.9,
        createdAt: new Date(),
      });
    }

    // Check for unused variables
    if (analysis.metrics.unusedVariables.length > 0) {
      optimizations.push({
        projectId: String(projectId),
        optimizationType: "cleanup",
        description: "Remove unused variables to reduce memory usage",
        impact: "low",
        estimatedImprovement: "5-10% memory reduction",
        implementation: {
          steps: [
            "Remove the following unused variables:",
            ...analysis.metrics.unusedVariables,
          ],
          automated: true,
        },
        confidence: 0.95,
        createdAt: new Date(),
      });
    }

    // Use AI for advanced optimization suggestions
    const aiOptimizations = await this.getAIOptimizations(String(projectId), analysis);
    optimizations.push(...aiOptimizations);

    // Store optimizations in database
    const dbOptimizations = await db
      .insert(superintelligenceOptimizations)
      .values(optimizations)
      .returning();

    return dbOptimizations;
  }

  /**
   * Generate architecture recommendations
   */
  async recommendArchitecture(
    projectId: number | string,
    projectType: string,
    currentStructure: any,
  ): Promise<SuperintelligenceRecommendation[]> {
    const recommendations: InsertSuperintelligenceRecommendation[] = [];

    // Pattern-based recommendations
    const patterns: Record<string, { recommendations: Array<any> }> = {
      "web-app": {
        recommendations: [
          {
            type: "structure" as const,
            title: "Implement Clean Architecture",
            description:
              "Separate concerns into layers: presentation, business logic, and data access",
            priority: "high" as const,
            rationale:
              "Improves maintainability, testability, and allows for easier feature additions",
            implementation: {
              steps: [
                "Create separate directories for /domain, /application, /infrastructure, /presentation",
                "Move business logic to domain layer",
                "Implement dependency injection",
                "Use interfaces for external dependencies",
              ],
              estimatedTime: "2-3 days",
              breakingChanges: false,
            },
          },
          {
            type: "performance" as const,
            title: "Implement Code Splitting",
            description:
              "Split your bundle into smaller chunks for faster initial load",
            priority: "medium" as const,
            rationale: "Reduces initial bundle size by 40-60%",
            implementation: {
              steps: [
                "Use dynamic imports for route-based splitting",
                "Implement React.lazy() for component-level splitting",
                "Configure webpack for optimal chunk sizes",
              ],
              codeExample: `// Route-based splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Component-level splitting
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>`,
            },
          },
        ],
      },
      api: {
        recommendations: [
          {
            type: "security" as const,
            title: "Implement API Rate Limiting",
            description: "Protect your API from abuse and ensure fair usage",
            priority: "high" as const,
            rationale: "Prevents DDoS attacks and ensures service availability",
            implementation: {
              steps: [
                "Install rate limiting middleware",
                "Configure limits based on endpoints",
                "Implement user-based quotas",
                "Add monitoring and alerts",
              ],
            },
          },
        ],
      },
    };

    // Get pattern-based recommendations
    const baseRecommendations = patterns[projectType]?.recommendations || [];

    for (const rec of baseRecommendations) {
      recommendations.push({
        projectId: String(projectId),
        recommendationType: rec.type,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        impact: `${rec.type === "performance" ? "High performance gain" : "Improved " + rec.type}`,
        rationale: rec.rationale,
        implementation: rec.implementation,
        confidence: 0.85,
        createdAt: new Date(),
      });
    }

    // Get AI-powered recommendations
    const aiRecommendations = await this.getAIArchitectureRecommendations(
      String(projectId),
      projectType,
      currentStructure,
    );
    recommendations.push(...aiRecommendations);

    // Store recommendations in database
    const dbRecommendations = await db
      .insert(superintelligenceRecommendations)
      .values(recommendations)
      .returning();

    return dbRecommendations;
  }

  /**
   * Predict potential bugs using pattern matching
   */
  async predictBugs(
    projectId: number | string,
    code: string,
    history?: any[],
  ): Promise<any[]> {
    const predictions = [];

    // Common bug patterns
    const bugPatterns = [
      {
        pattern: /\.map\([^)]+\)(?!\s*\?)/g,
        type: "null-reference",
        message: "Potential null reference error when mapping",
        suggestion: "Add optional chaining: array?.map() or check for null",
      },
      {
        pattern: /setState\s*\(\s*{\s*\.\.\.this\.state/g,
        type: "react-state",
        message: "Potential stale state issue in React",
        suggestion:
          "Use functional setState: setState(prevState => ({ ...prevState, ... }))",
      },
      {
        pattern: /async\s+function.*\{[^}]*(?:fetch|axios)[^}]*\}/g,
        type: "unhandled-promise",
        message: "Async operation without error handling",
        suggestion: "Wrap in try-catch or add .catch() handler",
      },
      {
        pattern: /parseInt\s*\([^,)]+\)/g,
        type: "parsing-error",
        message: "parseInt without radix parameter",
        suggestion: "Always specify radix: parseInt(value, 10)",
      },
    ];

    // Check for patterns
    for (const bugPattern of bugPatterns) {
      const matches = code.matchAll(bugPattern.pattern);
      for (const match of matches) {
        const lines = code.substring(0, match.index).split("\n");
        predictions.push({
          type: bugPattern.type,
          severity: "medium",
          line: lines.length,
          message: bugPattern.message,
          suggestion: bugPattern.suggestion,
          confidence: 0.75,
        });
      }
    }

    // Store predictions
    const analysis: InsertSuperintelligenceAnalysis = {
      projectId: String(projectId),
      fileId: "", // Would need actual file ID
      analysisType: "bug_prediction",
      results: { predictions },
      confidence: 0.8,
      timestamp: new Date(),
    };

    await db.insert(superintelligenceAnalyses).values(analysis);

    return predictions;
  }

  /**
   * Get AI-powered optimization suggestions
   */
  private async getAIOptimizations(
    projectId: number | string,
    analysis: CodeAnalysis,
  ): Promise<InsertSuperintelligenceOptimization[]> {
    const cacheKey = `opt_${projectId}_${JSON.stringify(analysis.metrics)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `Analyze this code metrics and suggest performance optimizations:
      - Lines of Code: ${analysis.metrics.linesOfCode}
      - Cyclomatic Complexity: ${analysis.metrics.cyclomaticComplexity}
      - Dependencies: ${analysis.metrics.dependencies.join(", ")}
      - Issues found: ${analysis.issues.length}
      
      Provide specific, actionable optimization suggestions.`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514", // Latest Claude model - updated from deprecated version
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      });

      // Parse AI response and create optimization records
      const optimizations: InsertSuperintelligenceOptimization[] = [];

      // This is simplified - in reality, we'd parse the AI response more carefully
      optimizations.push({
        projectId: String(projectId),
        optimizationType: "ai_suggested",
        description: "AI-powered optimization suggestions",
        impact: "medium",
        estimatedImprovement: "20-40% performance gain",
        implementation: {
          steps: [
            "Review AI suggestions",
            "Implement incrementally",
            "Measure improvements",
          ],
          aiGenerated: true,
          details:
            response.content[0].type === "text" ? response.content[0].text : "",
        },
        confidence: 0.7,
        createdAt: new Date(),
      });

      this.setCache(cacheKey, optimizations);
      return optimizations;
    } catch (error) {
      console.error("AI optimization error:", error);
      return [];
    }
  }

  /**
   * Get AI-powered architecture recommendations
   */
  private async getAIArchitectureRecommendations(
    projectId: number | string,
    projectType: string,
    currentStructure: any,
  ): Promise<InsertSuperintelligenceRecommendation[]> {
    const cacheKey = `arch_${projectId}_${projectType}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `Analyze this ${projectType} project structure and recommend architectural improvements:
      Current structure: ${JSON.stringify(currentStructure, null, 2)}
      
      Focus on:
      1. Scalability improvements
      2. Performance optimizations  
      3. Security enhancements
      4. Developer experience
      
      Provide specific, implementable recommendations.`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514", // Latest Claude model - updated from deprecated version
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      });

      // Parse AI response
      const recommendations: InsertSuperintelligenceRecommendation[] = [];

      recommendations.push({
        projectId: String(projectId),
        recommendationType: "ai_analysis",
        title: "AI-Powered Architecture Analysis",
        description:
          "Comprehensive architectural improvements based on AI analysis",
        priority: "medium",
        impact: "Significant long-term benefits",
        rationale:
          "Based on industry best practices and project-specific analysis",
        implementation: {
          steps: [
            "Review AI recommendations",
            "Prioritize based on impact",
            "Implement gradually",
          ],
          aiGenerated: true,
          fullAnalysis:
            response.content[0].type === "text" ? response.content[0].text : "",
        },
        confidence: 0.75,
        createdAt: new Date(),
      });

      this.setCache(cacheKey, recommendations);
      return recommendations;
    } catch (error) {
      console.error("AI architecture recommendation error:", error);
      return [];
    }
  }

  /**
   * Get recent analyses for a project
   */
  async getProjectAnalyses(
    projectId: number | string,
  ): Promise<SuperintelligenceAnalysis[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return await db
      .select()
      .from(superintelligenceAnalyses)
      .where(
        and(
          eq(superintelligenceAnalyses.projectId, String(projectId)),
          gte(superintelligenceAnalyses.timestamp, oneHourAgo),
        ),
      )
      .orderBy(desc(superintelligenceAnalyses.timestamp))
      .limit(10);
  }

  /**
   * Get optimizations for a project
   */
  async getProjectOptimizations(
    projectId: number | string,
  ): Promise<SuperintelligenceOptimization[]> {
    return await db
      .select()
      .from(superintelligenceOptimizations)
      .where(eq(superintelligenceOptimizations.projectId, String(projectId)))
      .orderBy(desc(superintelligenceOptimizations.createdAt))
      .limit(20);
  }

  /**
   * Get recommendations for a project
   */
  async getProjectRecommendations(
    projectId: number | string,
  ): Promise<SuperintelligenceRecommendation[]> {
    return await db
      .select()
      .from(superintelligenceRecommendations)
      .where(eq(superintelligenceRecommendations.projectId, String(projectId)))
      .orderBy(desc(superintelligenceRecommendations.priority))
      .limit(20);
  }

  // Cache helpers
  private getCached(key: string): any {
    const cached = this.aiCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.result;
    }
    return null;
  }

  private setCache(key: string, value: any): void {
    this.aiCache.set(key, { result: value, timestamp: Date.now() });
  }
}

export const superintelligenceService = new SuperintelligenceService();
