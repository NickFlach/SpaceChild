import { ApiService } from "./api";
import type { SuperintelligenceJob } from "@shared/schema";

export interface ArchitectureAnalysis {
  complexity: number;
  maintainability: number;
  performance: number;
  security: number;
  recommendations: string[];
}

export interface OptimizationSuggestions {
  performance: string[];
  security: string[];
  maintainability: string[];
  estimatedImprovement: number;
}

export interface RefactorRequirements {
  extractComponents?: boolean;
  improveTypes?: boolean;
  optimizePerformance?: boolean;
  enhanceSecurity?: boolean;
  improveReadability?: boolean;
}

export class SuperintelligenceService {
  private static pollingIntervals: Map<number, NodeJS.Timeout> = new Map();

  static async analyzeArchitecture(projectId: number): Promise<SuperintelligenceJob> {
    try {
      const job = await ApiService.analyzeArchitecture(projectId);
      this.startPolling(job.id, projectId);
      return job;
    } catch (error) {
      console.error("Failed to start architecture analysis:", error);
      throw error;
    }
  }

  static async optimizePerformance(projectId: number, code: string): Promise<SuperintelligenceJob> {
    try {
      const job = await ApiService.optimizePerformance(projectId, code);
      this.startPolling(job.id, projectId);
      return job;
    } catch (error) {
      console.error("Failed to start performance optimization:", error);
      throw error;
    }
  }

  static async refactorCode(
    projectId: number, 
    code: string, 
    requirements: RefactorRequirements
  ): Promise<SuperintelligenceJob> {
    try {
      const job = await ApiService.refactorCode(projectId, code, requirements);
      this.startPolling(job.id, projectId);
      return job;
    } catch (error) {
      console.error("Failed to start code refactoring:", error);
      throw error;
    }
  }

  static async getJob(jobId: number): Promise<SuperintelligenceJob> {
    try {
      return await ApiService.getSuperintelligenceJob(jobId);
    } catch (error) {
      console.error("Failed to get superintelligence job:", error);
      throw error;
    }
  }

  static async getJobs(projectId: number): Promise<SuperintelligenceJob[]> {
    try {
      return await ApiService.getSuperintelligenceJobs(projectId);
    } catch (error) {
      console.error("Failed to get superintelligence jobs:", error);
      return [];
    }
  }

  private static startPolling(jobId: number, projectId: number): void {
    // Clear existing polling for this job
    const existingInterval = this.pollingIntervals.get(jobId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Poll every 3 seconds for job updates
    const interval = setInterval(async () => {
      try {
        const job = await this.getJob(jobId);
        if (job.status === "completed" || job.status === "failed") {
          this.stopPolling(jobId);
        }
      } catch (error) {
        console.error("Error polling job status:", error);
        this.stopPolling(jobId);
      }
    }, 3000);

    this.pollingIntervals.set(jobId, interval);

    // Stop polling after 5 minutes to prevent infinite polling
    setTimeout(() => {
      this.stopPolling(jobId);
    }, 5 * 60 * 1000);
  }

  private static stopPolling(jobId: number): void {
    const interval = this.pollingIntervals.get(jobId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(jobId);
    }
  }

  static formatJobType(jobType: string): string {
    return jobType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  static getJobStatusColor(status: string): string {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400";
      case "processing":
        return "text-blue-600 dark:text-blue-400";
      case "failed":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  }

  static getJobStatusIcon(status: string): string {
    switch (status) {
      case "completed":
        return "✓";
      case "processing":
        return "⏳";
      case "failed":
        return "✗";
      default:
        return "⏸";
    }
  }

  static calculateOverallScore(analysis: ArchitectureAnalysis): number {
    return Math.round(
      (analysis.complexity * 0.25 +
       analysis.maintainability * 0.3 +
       analysis.performance * 0.25 +
       analysis.security * 0.2) * 100
    );
  }

  static prioritizeRecommendations(recommendations: string[]): string[] {
    // Sort recommendations by priority keywords
    const priorityKeywords = [
      'security',
      'performance',
      'error',
      'memory',
      'optimization',
      'refactor',
      'test',
      'documentation'
    ];

    return recommendations.sort((a, b) => {
      const aScore = priorityKeywords.reduce((score, keyword) => {
        return score + (a.toLowerCase().includes(keyword) ? 1 : 0);
      }, 0);
      
      const bScore = priorityKeywords.reduce((score, keyword) => {
        return score + (b.toLowerCase().includes(keyword) ? 1 : 0);
      }, 0);
      
      return bScore - aScore;
    });
  }

  static estimateProcessingTime(jobType: string, codeLength: number): number {
    // Estimate processing time in seconds based on job type and code length
    const baseTime = {
      'architecture_analysis': 30,
      'optimization': 20,
      'refactoring': 40,
    };

    const base = baseTime[jobType as keyof typeof baseTime] || 30;
    const complexity = Math.min(codeLength / 1000, 5); // Max 5x multiplier
    
    return Math.round(base * (1 + complexity));
  }

  static cleanup(): void {
    // Clean up all polling intervals
    this.pollingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();
  }
}
