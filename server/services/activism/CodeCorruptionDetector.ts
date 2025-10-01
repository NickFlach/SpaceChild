/**
 * Code Corruption Detector
 * 
 * Brings Pitchfork's CorruptionDetectionEngine to SpaceChild
 * for detecting code vulnerabilities, security issues, and anti-patterns.
 * 
 * @version 1.0.0
 * @module CodeCorruptionDetector
 */

/**
 * Code analysis result
 */
interface CodeCorruptionAnalysis {
  timestamp: Date;
  fileId: string;
  
  issues: Array<{
    type: 'security' | 'quality' | 'performance' | 'maintainability';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: {
      line: number;
      column?: number;
    };
    recommendation: string;
  }>;
  
  metrics: {
    securityScore: number;      // 0-10
    qualityScore: number;       // 0-10
    maintainabilityScore: number; // 0-10
    overallHealth: number;      // 0-10
  };
  
  corruptionIndicators: string[];
  recommendations: string[];
}

/**
 * Code Corruption Detector
 * 
 * Detects vulnerabilities, security issues, code smells,
 * and anti-patterns that could compromise code integrity.
 */
export class CodeCorruptionDetector {
  private analysisHistory: Map<string, CodeCorruptionAnalysis[]> = new Map();
  
  // Pattern databases
  private readonly SECURITY_PATTERNS = [
    { pattern: /eval\(/gi, severity: 'critical', description: 'Dangerous eval() usage detected' },
    { pattern: /\.innerHTML\s*=/gi, severity: 'high', description: 'Potential XSS via innerHTML' },
    { pattern: /password\s*=\s*["'][^"']+["']/gi, severity: 'critical', description: 'Hardcoded password detected' },
    { pattern: /api[_-]?key\s*=\s*["'][^"']+["']/gi, severity: 'critical', description: 'Hardcoded API key detected' },
    { pattern: /Math\.random\(\)/gi, severity: 'medium', description: 'Insecure random number generation' },
  ];
  
  private readonly QUALITY_PATTERNS = [
    { pattern: /console\.log\(/gi, severity: 'low', description: 'Debug statement left in code' },
    { pattern: /\/\/ TODO:/gi, severity: 'low', description: 'TODO comment found' },
    { pattern: /\/\/ FIXME:/gi, severity: 'medium', description: 'FIXME comment indicating known issue' },
    { pattern: /any/gi, severity: 'medium', description: 'TypeScript any type - potential type safety issue' },
  ];

  constructor() {}

  /**
   * Analyze code for corruption indicators
   */
  async analyzeCode(
    fileId: string,
    code: string,
    language: string = 'typescript'
  ): Promise<CodeCorruptionAnalysis> {
    const issues: CodeCorruptionAnalysis['issues'] = [];
    
    // Security analysis
    issues.push(...this.detectSecurityIssues(code));
    
    // Quality analysis
    issues.push(...this.detectQualityIssues(code));
    
    // Performance analysis
    issues.push(...this.detectPerformanceIssues(code));
    
    // Maintainability analysis
    issues.push(...this.detectMaintainabilityIssues(code));
    
    // Calculate metrics
    const metrics = this.calculateMetrics(issues, code);
    
    // Identify corruption indicators
    const corruptionIndicators = this.identifyCorruptionIndicators(issues, metrics);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, metrics);
    
    const analysis: CodeCorruptionAnalysis = {
      timestamp: new Date(),
      fileId,
      issues,
      metrics,
      corruptionIndicators,
      recommendations,
    };
    
    // Store in history
    if (!this.analysisHistory.has(fileId)) {
      this.analysisHistory.set(fileId, []);
    }
    this.analysisHistory.get(fileId)!.push(analysis);
    
    return analysis;
  }

  /**
   * Detect security issues
   */
  private detectSecurityIssues(code: string): CodeCorruptionAnalysis['issues'] {
    const issues: CodeCorruptionAnalysis['issues'] = [];
    const lines = code.split('\n');
    
    this.SECURITY_PATTERNS.forEach(pattern => {
      lines.forEach((line, index) => {
        if (pattern.pattern.test(line)) {
          issues.push({
            type: 'security',
            severity: pattern.severity as any,
            description: pattern.description,
            location: { line: index + 1 },
            recommendation: this.getSecurityRecommendation(pattern.description),
          });
        }
      });
    });
    
    return issues;
  }

  /**
   * Detect quality issues
   */
  private detectQualityIssues(code: string): CodeCorruptionAnalysis['issues'] {
    const issues: CodeCorruptionAnalysis['issues'] = [];
    const lines = code.split('\n');
    
    this.QUALITY_PATTERNS.forEach(pattern => {
      lines.forEach((line, index) => {
        if (pattern.pattern.test(line)) {
          issues.push({
            type: 'quality',
            severity: pattern.severity as any,
            description: pattern.description,
            location: { line: index + 1 },
            recommendation: 'Remove debug code or improve code quality',
          });
        }
      });
    });
    
    return issues;
  }

  /**
   * Detect performance issues
   */
  private detectPerformanceIssues(code: string): CodeCorruptionAnalysis['issues'] {
    const issues: CodeCorruptionAnalysis['issues'] = [];
    const lines = code.split('\n');
    
    // Detect nested loops
    let loopDepth = 0;
    lines.forEach((line, index) => {
      if (/for\s*\(|while\s*\(/.test(line)) {
        loopDepth++;
        if (loopDepth >= 3) {
          issues.push({
            type: 'performance',
            severity: 'medium',
            description: 'Deeply nested loops detected - O(n³) or worse complexity',
            location: { line: index + 1 },
            recommendation: 'Consider optimizing algorithm or using data structures',
          });
        }
      }
      if (line.includes('}')) {
        loopDepth = Math.max(0, loopDepth - 1);
      }
    });
    
    return issues;
  }

  /**
   * Detect maintainability issues
   */
  private detectMaintainabilityIssues(code: string): CodeCorruptionAnalysis['issues'] {
    const issues: CodeCorruptionAnalysis['issues'] = [];
    const lines = code.split('\n');
    
    // Check function length
    let functionStart = -1;
    lines.forEach((line, index) => {
      if (/function\s+\w+|const\s+\w+\s*=\s*\(.*\)\s*=>/.test(line)) {
        functionStart = index;
      }
      if (functionStart !== -1 && line.trim() === '}' && index - functionStart > 50) {
        issues.push({
          type: 'maintainability',
          severity: 'medium',
          description: `Long function detected (${index - functionStart} lines)`,
          location: { line: functionStart + 1 },
          recommendation: 'Consider breaking function into smaller, focused functions',
        });
        functionStart = -1;
      }
    });
    
    // Check line length
    lines.forEach((line, index) => {
      if (line.length > 120) {
        issues.push({
          type: 'maintainability',
          severity: 'low',
          description: `Long line detected (${line.length} characters)`,
          location: { line: index + 1 },
          recommendation: 'Break long lines for better readability',
        });
      }
    });
    
    return issues;
  }

  /**
   * Calculate code metrics
   */
  private calculateMetrics(
    issues: CodeCorruptionAnalysis['issues'],
    code: string
  ): CodeCorruptionAnalysis['metrics'] {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    
    const securityIssues = issues.filter(i => i.type === 'security').length;
    const qualityIssues = issues.filter(i => i.type === 'quality').length;
    const maintainabilityIssues = issues.filter(i => i.type === 'maintainability').length;
    
    // Calculate scores (10 is best)
    const securityScore = Math.max(0, 10 - (criticalIssues * 3 + highIssues * 2 + securityIssues * 0.5));
    const qualityScore = Math.max(0, 10 - (qualityIssues * 0.5));
    const maintainabilityScore = Math.max(0, 10 - (maintainabilityIssues * 0.3));
    
    const overallHealth = (securityScore * 0.5 + qualityScore * 0.25 + maintainabilityScore * 0.25);
    
    return {
      securityScore,
      qualityScore,
      maintainabilityScore,
      overallHealth,
    };
  }

  /**
   * Identify corruption indicators
   */
  private identifyCorruptionIndicators(
    issues: CodeCorruptionAnalysis['issues'],
    metrics: CodeCorruptionAnalysis['metrics']
  ): string[] {
    const indicators: string[] = [];
    
    if (metrics.securityScore < 5) {
      indicators.push('Critical security vulnerabilities detected');
    }
    
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    if (criticalCount > 0) {
      indicators.push(`${criticalCount} critical issues requiring immediate attention`);
    }
    
    if (metrics.overallHealth < 6) {
      indicators.push('Code health below acceptable threshold');
    }
    
    const hardcodedSecrets = issues.filter(i => 
      i.description.includes('password') || i.description.includes('API key')
    ).length;
    if (hardcodedSecrets > 0) {
      indicators.push('Hardcoded secrets detected - major security risk');
    }
    
    return indicators;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    issues: CodeCorruptionAnalysis['issues'],
    metrics: CodeCorruptionAnalysis['metrics']
  ): string[] {
    const recommendations: string[] = [];
    
    if (metrics.securityScore < 7) {
      recommendations.push('Address all security issues immediately');
      recommendations.push('Consider security audit and penetration testing');
    }
    
    if (metrics.qualityScore < 7) {
      recommendations.push('Implement code quality standards and linting');
      recommendations.push('Remove debug statements and TODOs');
    }
    
    if (metrics.maintainabilityScore < 7) {
      recommendations.push('Refactor large functions into smaller units');
      recommendations.push('Improve code documentation');
    }
    
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(`Fix ${criticalIssues.length} critical issues before deployment`);
    }
    
    return recommendations;
  }

  /**
   * Get security recommendation
   */
  private getSecurityRecommendation(description: string): string {
    if (description.includes('eval()')) {
      return 'Replace eval() with safer alternatives like JSON.parse() or Function constructor';
    }
    if (description.includes('innerHTML')) {
      return 'Use textContent or sanitize input with DOMPurify';
    }
    if (description.includes('password') || description.includes('API key')) {
      return 'Move secrets to environment variables or secure vault';
    }
    if (description.includes('random')) {
      return 'Use crypto.getRandomValues() for cryptographic operations';
    }
    return 'Review and fix security issue';
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const totalAnalyses = Array.from(this.analysisHistory.values())
      .reduce((sum, analyses) => sum + analyses.length, 0);
    
    let totalIssues = 0;
    let totalCritical = 0;
    let averageHealth = 0;
    
    this.analysisHistory.forEach(analyses => {
      analyses.forEach(analysis => {
        totalIssues += analysis.issues.length;
        totalCritical += analysis.issues.filter(i => i.severity === 'critical').length;
        averageHealth += analysis.metrics.overallHealth;
      });
    });
    
    return {
      filesAnalyzed: this.analysisHistory.size,
      totalAnalyses,
      totalIssues,
      totalCritical,
      averageHealth: totalAnalyses > 0 ? averageHealth / totalAnalyses : 0,
    };
  }
}

/**
 * Singleton instance
 */
export const codeCorruptionDetector = new CodeCorruptionDetector();
