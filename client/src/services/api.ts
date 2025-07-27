import { apiRequest } from "@/lib/queryClient";
import type { 
  Project, 
  ProjectFile, 
  InsertProject, 
  InsertProjectFile,
  ConsciousnessContext,
  ConsciousnessMemory,
  SuperintelligenceJob,
} from "@shared/schema";

export class ApiService {
  // Project endpoints
  static async getProjects(): Promise<Project[]> {
    const response = await apiRequest("GET", "/api/projects");
    return response.json();
  }

  static async getProject(id: number): Promise<Project> {
    const response = await apiRequest("GET", `/api/projects/${id}`);
    return response.json();
  }

  static async createProject(project: InsertProject): Promise<Project> {
    const response = await apiRequest("POST", "/api/projects", project);
    return response.json();
  }

  static async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const response = await apiRequest("PUT", `/api/projects/${id}`, project);
    return response.json();
  }

  static async deleteProject(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/projects/${id}`);
  }

  // File endpoints
  static async getProjectFiles(projectId: number): Promise<ProjectFile[]> {
    const response = await apiRequest("GET", `/api/projects/${projectId}/files`);
    return response.json();
  }

  static async getProjectFile(projectId: number, filePath: string): Promise<ProjectFile> {
    const response = await apiRequest("GET", `/api/projects/${projectId}/files/${filePath}`);
    return response.json();
  }

  static async createProjectFile(projectId: number, file: InsertProjectFile): Promise<ProjectFile> {
    const response = await apiRequest("POST", `/api/projects/${projectId}/files`, file);
    return response.json();
  }

  static async updateProjectFile(projectId: number, filePath: string, content: string): Promise<ProjectFile> {
    const response = await apiRequest("PUT", `/api/projects/${projectId}/files/${filePath}`, {
      content,
    });
    return response.json();
  }

  // AI Provider endpoints
  static async generateCode(prompt: string, provider: string = "anthropic", projectId?: number) {
    const response = await apiRequest("POST", "/api/ai/generate", {
      prompt,
      provider,
      projectId,
    });
    return response.json();
  }

  static async chatWithAI(message: string, provider: string = "anthropic", projectId?: number) {
    const response = await apiRequest("POST", "/api/ai/chat", {
      message,
      provider,
      projectId,
    });
    return response.json();
  }

  // Consciousness endpoints
  static async activateConsciousness(projectId: number) {
    const response = await apiRequest("POST", "/api/consciousness/activate", { projectId });
    return response.json();
  }

  static async queryConsciousness(sessionId: string, query: string, projectId: number) {
    const response = await apiRequest("POST", "/api/consciousness/query", {
      sessionId,
      query,
      projectId,
    });
    return response.json();
  }

  static async getConsciousnessContext(projectId: number): Promise<ConsciousnessContext> {
    const response = await apiRequest("GET", `/api/consciousness/context/${projectId}`);
    return response.json();
  }

  static async getConsciousnessMemories(projectId: number): Promise<ConsciousnessMemory[]> {
    const response = await apiRequest("GET", `/api/consciousness/memories/${projectId}`);
    return response.json();
  }

  // Superintelligence endpoints
  static async analyzeArchitecture(projectId: number): Promise<SuperintelligenceJob> {
    const response = await apiRequest("POST", "/api/superintelligence/analyze", { projectId });
    return response.json();
  }

  static async optimizePerformance(projectId: number, code: string): Promise<SuperintelligenceJob> {
    const response = await apiRequest("POST", "/api/superintelligence/optimize", {
      projectId,
      code,
    });
    return response.json();
  }

  static async refactorCode(projectId: number, code: string, requirements: any): Promise<SuperintelligenceJob> {
    const response = await apiRequest("POST", "/api/superintelligence/refactor", {
      projectId,
      code,
      requirements,
    });
    return response.json();
  }

  static async getSuperintelligenceJob(jobId: number): Promise<SuperintelligenceJob> {
    const response = await apiRequest("GET", `/api/superintelligence/jobs/${jobId}`);
    return response.json();
  }

  static async getSuperintelligenceJobs(projectId: number): Promise<SuperintelligenceJob[]> {
    const response = await apiRequest("GET", `/api/superintelligence/jobs?projectId=${projectId}`);
    return response.json();
  }
}
