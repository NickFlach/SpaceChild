import { storage } from "../storage";
import type { ProjectMemory, InsertProjectMemory } from "@shared/schema";

interface MemoryPattern {
  pattern: string;
  context: string;
  frequency: number;
}

export class ProjectMemoryService {
  private static instance: ProjectMemoryService;
  
  public static getInstance(): ProjectMemoryService {
    if (!ProjectMemoryService.instance) {
      ProjectMemoryService.instance = new ProjectMemoryService();
    }
    return ProjectMemoryService.instance;
  }

  /**
   * Learn from code changes and user interactions
   */
  async learnFromInteraction(
    projectId: number,
    interactionType: string,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    // Extract patterns from the interaction
    const patterns = this.extractPatterns(content, interactionType);
    
    for (const pattern of patterns) {
      // Check if similar memory exists
      const existingMemories = await storage.searchProjectMemories(projectId, pattern.pattern);
      
      if (existingMemories.length > 0) {
        // Update existing memory confidence and usage
        const memory = existingMemories[0];
        const newConfidence = Math.min(1, Number(memory.confidence) + 0.1);
        
        await storage.updateProjectMemory(memory.id, {
          confidence: newConfidence.toString(),
          metadata: {
            ...(memory.metadata as Record<string, any> || {}),
            ...metadata,
            lastContext: pattern.context
          }
        });
      } else {
        // Create new memory
        await storage.createProjectMemory({
          projectId,
          memoryType: this.categorizeMemory(interactionType),
          title: this.generateMemoryTitle(pattern),
          content: pattern.pattern,
          metadata: {
            ...metadata,
            context: pattern.context,
            learnedFrom: interactionType
          },
          usageCount: 1,
          confidence: '0.5'
        });
      }
    }
  }

  /**
   * Retrieve relevant memories for a given context
   */
  async getRelevantMemories(
    projectId: number,
    context: string,
    limit: number = 5
  ): Promise<ProjectMemory[]> {
    // Search for memories related to the context
    const memories = await storage.searchProjectMemories(projectId, context);
    
    // Sort by relevance (confidence * usage)
    const sortedMemories = memories.sort((a, b) => {
      const scoreA = Number(a.confidence) * (a.usageCount || 1);
      const scoreB = Number(b.confidence) * (b.usageCount || 1);
      return scoreB - scoreA;
    });
    
    return sortedMemories.slice(0, limit);
  }

  /**
   * Extract patterns from content based on interaction type
   */
  private extractPatterns(content: string, interactionType: string): MemoryPattern[] {
    const patterns: MemoryPattern[] = [];
    
    switch (interactionType) {
      case 'code_generation':
        // Extract import statements
        const imports = content.match(/import\s+.+\s+from\s+['"][^'"]+['"]/g);
        if (imports) {
          imports.forEach(imp => {
            patterns.push({
              pattern: imp,
              context: 'Common import pattern',
              frequency: 1
            });
          });
        }
        
        // Extract function patterns
        const functions = content.match(/(?:async\s+)?function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g);
        if (functions) {
          functions.forEach(func => {
            patterns.push({
              pattern: func,
              context: 'Function definition pattern',
              frequency: 1
            });
          });
        }
        break;
        
      case 'file_creation':
        // Extract file structure patterns
        if (content.includes('export default')) {
          patterns.push({
            pattern: 'export default component pattern',
            context: 'React component file structure',
            frequency: 1
          });
        }
        break;
        
      case 'error_fix':
        // Extract error resolution patterns
        const errorPatterns = content.match(/fix:\s*(.+)/gi);
        if (errorPatterns) {
          errorPatterns.forEach(fix => {
            patterns.push({
              pattern: fix,
              context: 'Error resolution pattern',
              frequency: 1
            });
          });
        }
        break;
        
      case 'user_preference':
        // Store direct user preferences
        patterns.push({
          pattern: content,
          context: 'User preference',
          frequency: 1
        });
        break;
    }
    
    return patterns;
  }

  /**
   * Categorize memory based on interaction type
   */
  private categorizeMemory(interactionType: string): string {
    const categoryMap: Record<string, string> = {
      'code_generation': 'pattern',
      'file_creation': 'pattern',
      'error_fix': 'solution',
      'user_preference': 'preference',
      'architecture_decision': 'knowledge',
      'api_usage': 'pattern'
    };
    
    return categoryMap[interactionType] || 'knowledge';
  }

  /**
   * Generate a descriptive title for the memory
   */
  private generateMemoryTitle(pattern: MemoryPattern): string {
    const { pattern: patternText, context } = pattern;
    
    // Truncate pattern if too long
    const truncatedPattern = patternText.length > 50 
      ? patternText.substring(0, 47) + '...'
      : patternText;
    
    return `${context}: ${truncatedPattern}`;
  }

  /**
   * Apply learned patterns to new code generation
   */
  async applyLearnedPatterns(
    projectId: number,
    requestContext: string
  ): Promise<string[]> {
    const relevantMemories = await this.getRelevantMemories(projectId, requestContext);
    
    return relevantMemories.map(memory => {
      const metadata = memory.metadata as any;
      return `Based on previous patterns: ${memory.content}${
        metadata?.context ? ` (Context: ${metadata.context})` : ''
      }`;
    });
  }

  /**
   * Get project coding style preferences
   */
  async getCodingPreferences(projectId: number): Promise<Record<string, any>> {
    const preferences = await storage.getProjectMemories(projectId, 'preference');
    
    const preferenceMap: Record<string, any> = {};
    preferences.forEach(pref => {
      const metadata = pref.metadata as any;
      if (metadata?.preferenceType) {
        preferenceMap[metadata.preferenceType] = pref.content;
      }
    });
    
    return preferenceMap;
  }
}

export const projectMemoryService = ProjectMemoryService.getInstance();