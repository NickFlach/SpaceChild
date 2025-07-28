import { storage } from "../storage";
import type { ProjectTemplate, InsertProject, InsertProjectFile } from "@shared/schema";

export class ProjectTemplateService {
  // Get all available templates
  async getTemplates(category?: string): Promise<ProjectTemplate[]> {
    return await storage.getProjectTemplates(category);
  }
  
  // Get a specific template
  async getTemplate(id: number): Promise<ProjectTemplate | undefined> {
    return await storage.getProjectTemplate(id);
  }
  
  // Create a new project from a template
  async createProjectFromTemplate(
    templateId: number,
    userId: string,
    projectName: string,
    customSettings?: Partial<InsertProject>
  ): Promise<{ project: any; files: any[] }> {
    const template = await this.getTemplate(templateId);
    
    if (!template) {
      throw new Error("Template not found");
    }
    
    // Merge template config with custom settings
    const projectData: InsertProject = {
      userId,
      name: projectName,
      description: customSettings?.description || `Created from ${template.name} template`,
      projectType: template.config?.projectType || 'fullstack',
      consciousnessEnabled: customSettings?.consciousnessEnabled ?? template.config?.consciousnessEnabled ?? false,
      superintelligenceEnabled: customSettings?.superintelligenceEnabled ?? template.config?.superintelligenceEnabled ?? false,
      ...customSettings,
    };
    
    // Create the project
    const project = await storage.createProject(projectData);
    
    // Create starter files from template
    const files: any[] = [];
    if (template.starterFiles && Array.isArray(template.starterFiles)) {
      for (const file of template.starterFiles) {
        const fileData: InsertProjectFile = {
          projectId: project.id,
          filePath: file.path,
          content: file.content,
          fileType: this.getFileType(file.path),
        };
        
        const createdFile = await storage.createProjectFile(fileData);
        files.push(createdFile);
      }
    }
    
    // Track template usage
    await storage.incrementTemplateUsage(templateId);
    
    // If the template has memory patterns, apply them to the new project
    if (template.config?.defaultAiProvider) {
      // Store as a project preference
      const { projectMemoryService } = await import("./projectMemory");
      await projectMemoryService.learnFromInteraction(
        project.id,
        'user_preference',
        `Default AI Provider: ${template.config.defaultAiProvider}`,
        { preferenceType: 'ai_provider', fromTemplate: true }
      );
    }
    
    return { project, files };
  }
  
  // Helper to determine file type from path
  private getFileType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    const typeMap: Record<string, string> = {
      // Code files
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin',
      
      // Web files
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      
      // Data files
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      
      // Documentation
      'md': 'markdown',
      'txt': 'text',
      'rst': 'text',
      
      // Config files
      'env': 'env',
      'ini': 'ini',
      'conf': 'config',
      'config': 'config',
    };
    
    return typeMap[ext || ''] || 'text';
  }
  
  // Search templates by features or tech stack
  async searchTemplates(query: string): Promise<ProjectTemplate[]> {
    return await storage.searchProjectTemplates(query);
  }
  
  // Get popular templates
  async getPopularTemplates(limit: number = 10): Promise<ProjectTemplate[]> {
    return await storage.getPopularProjectTemplates(limit);
  }
  
  // Get templates by tech stack
  async getTemplatesByTechStack(tech: string): Promise<ProjectTemplate[]> {
    return await storage.getProjectTemplatesByTechStack(tech);
  }
}

export const projectTemplateService = new ProjectTemplateService();