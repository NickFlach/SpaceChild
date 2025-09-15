import {
  users,
  projects,
  projectFiles,
  consciousnessContext,
  consciousnessMemories,
  projectMemories,
  superintelligenceJobs,
  aiProviderUsage,
  projectTemplates,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type ProjectFile,
  type InsertProjectFile,
  type ConsciousnessContext,
  type InsertConsciousnessContext,
  type ConsciousnessMemory,
  type InsertConsciousnessMemory,
  type ProjectMemory,
  type InsertProjectMemory,
  type SuperintelligenceJob,
  type InsertSuperintelligenceJob,
  type AiProviderUsage,
  type InsertAiProviderUsage,
  type ProjectTemplate,
  type InsertProjectTemplate,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // ZKP Auth operations
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  updateUserSession(userId: string, token: string): Promise<void>;
  clearUserSession(userId: string): Promise<void>;
  
  // Project operations
  getProjectsByUserId(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Project file operations
  getProjectFiles(projectId: number): Promise<ProjectFile[]>;
  getProjectFile(projectId: number, filePath: string): Promise<ProjectFile | undefined>;
  createProjectFile(file: InsertProjectFile): Promise<ProjectFile>;
  updateProjectFile(id: number, file: Partial<InsertProjectFile>): Promise<ProjectFile>;
  deleteProjectFile(id: number): Promise<void>;
  
  // Consciousness operations
  getConsciousnessContext(projectId: number): Promise<ConsciousnessContext | undefined>;
  createConsciousnessContext(context: InsertConsciousnessContext): Promise<ConsciousnessContext>;
  updateConsciousnessContext(id: number, context: Partial<InsertConsciousnessContext>): Promise<ConsciousnessContext>;
  getConsciousnessMemories(projectId: number): Promise<ConsciousnessMemory[]>;
  createConsciousnessMemory(memory: InsertConsciousnessMemory): Promise<ConsciousnessMemory>;
  
  // Project memory operations
  getProjectMemories(projectId: number, memoryType?: string): Promise<ProjectMemory[]>;
  getProjectMemory(id: number): Promise<ProjectMemory | undefined>;
  createProjectMemory(memory: InsertProjectMemory): Promise<ProjectMemory>;
  updateProjectMemory(id: number, memory: Partial<InsertProjectMemory>): Promise<ProjectMemory>;
  searchProjectMemories(projectId: number, query: string): Promise<ProjectMemory[]>;
  
  // Superintelligence operations
  getSuperintelligenceJobs(projectId: number): Promise<SuperintelligenceJob[]>;
  getSuperintelligenceJobsByProject(projectId: number): Promise<SuperintelligenceJob[]>;
  getSuperintelligenceJob(id: number): Promise<SuperintelligenceJob | undefined>;
  createSuperintelligenceJob(job: InsertSuperintelligenceJob): Promise<SuperintelligenceJob>;
  updateSuperintelligenceJob(id: number, job: Partial<InsertSuperintelligenceJob & { completedAt?: Date }>): Promise<SuperintelligenceJob>;
  
  // AI provider usage tracking
  createAiProviderUsage(usage: InsertAiProviderUsage): Promise<AiProviderUsage>;
  getAiProviderUsage(userId: string): Promise<AiProviderUsage[]>;
  
  // Project Template operations
  getProjectTemplates(category?: string): Promise<ProjectTemplate[]>;
  getProjectTemplate(id: number): Promise<ProjectTemplate | undefined>;
  createProjectTemplate(template: InsertProjectTemplate): Promise<ProjectTemplate>;
  searchProjectTemplates(query: string): Promise<ProjectTemplate[]>;
  getPopularProjectTemplates(limit: number): Promise<ProjectTemplate[]>;
  getProjectTemplatesByTechStack(tech: string): Promise<ProjectTemplate[]>;
  incrementTemplateUsage(templateId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // ZKP Auth operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const [user] = await db.insert(users).values(userData as any).returning();
    return user;
  }

  async updateUserSession(userId: string, token: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        sessionToken: token,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async clearUserSession(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        sessionToken: null,
        sessionExpiry: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Project operations
  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Project file operations
  async getProjectFiles(projectId: number): Promise<ProjectFile[]> {
    return await db.select().from(projectFiles).where(eq(projectFiles.projectId, projectId));
  }

  async getProjectFile(projectId: number, filePath: string): Promise<ProjectFile | undefined> {
    const [file] = await db
      .select()
      .from(projectFiles)
      .where(and(eq(projectFiles.projectId, projectId), eq(projectFiles.filePath, filePath)));
    return file;
  }

  async createProjectFile(file: InsertProjectFile): Promise<ProjectFile> {
    const [newFile] = await db.insert(projectFiles).values(file).returning();
    return newFile;
  }

  async updateProjectFile(id: number, file: Partial<InsertProjectFile>): Promise<ProjectFile> {
    const [updatedFile] = await db
      .update(projectFiles)
      .set({ ...file, updatedAt: new Date() })
      .where(eq(projectFiles.id, id))
      .returning();
    return updatedFile;
  }

  async deleteProjectFile(id: number): Promise<void> {
    await db.delete(projectFiles).where(eq(projectFiles.id, id));
  }

  // Consciousness operations
  async getConsciousnessContext(projectId: number): Promise<ConsciousnessContext | undefined> {
    const [context] = await db
      .select()
      .from(consciousnessContext)
      .where(eq(consciousnessContext.projectId, projectId))
      .orderBy(desc(consciousnessContext.lastInteraction))
      .limit(1);
    return context;
  }

  async createConsciousnessContext(context: InsertConsciousnessContext): Promise<ConsciousnessContext> {
    const [newContext] = await db.insert(consciousnessContext).values(context).returning();
    return newContext;
  }

  async updateConsciousnessContext(id: number, context: Partial<InsertConsciousnessContext>): Promise<ConsciousnessContext> {
    const [updatedContext] = await db
      .update(consciousnessContext)
      .set({ ...context, lastInteraction: new Date() })
      .where(eq(consciousnessContext.id, id))
      .returning();
    return updatedContext;
  }

  async getConsciousnessMemories(projectId: number): Promise<ConsciousnessMemory[]> {
    return await db
      .select()
      .from(consciousnessMemories)
      .where(eq(consciousnessMemories.projectId, projectId))
      .orderBy(desc(consciousnessMemories.relevanceScore));
  }

  async createConsciousnessMemory(memory: InsertConsciousnessMemory): Promise<ConsciousnessMemory> {
    const [newMemory] = await db.insert(consciousnessMemories).values(memory).returning();
    return newMemory;
  }

  // Superintelligence operations
  async getSuperintelligenceJobs(projectId: number): Promise<SuperintelligenceJob[]> {
    return await db
      .select()
      .from(superintelligenceJobs)
      .where(eq(superintelligenceJobs.projectId, projectId))
      .orderBy(desc(superintelligenceJobs.createdAt));
  }

  async getSuperintelligenceJobsByProject(projectId: number): Promise<SuperintelligenceJob[]> {
    return await db
      .select()
      .from(superintelligenceJobs)
      .where(eq(superintelligenceJobs.projectId, projectId))
      .orderBy(desc(superintelligenceJobs.createdAt));
  }

  async getSuperintelligenceJob(id: number): Promise<SuperintelligenceJob | undefined> {
    const [job] = await db.select().from(superintelligenceJobs).where(eq(superintelligenceJobs.id, id));
    return job;
  }

  async createSuperintelligenceJob(job: InsertSuperintelligenceJob): Promise<SuperintelligenceJob> {
    const [newJob] = await db.insert(superintelligenceJobs).values(job).returning();
    return newJob;
  }

  async updateSuperintelligenceJob(id: number, job: Partial<InsertSuperintelligenceJob & { completedAt?: Date }>): Promise<SuperintelligenceJob> {
    const [updatedJob] = await db
      .update(superintelligenceJobs)
      .set(job)
      .where(eq(superintelligenceJobs.id, id))
      .returning();
    return updatedJob;
  }

  // AI provider usage tracking
  async createAiProviderUsage(usage: InsertAiProviderUsage): Promise<AiProviderUsage> {
    const [newUsage] = await db.insert(aiProviderUsage).values(usage).returning();
    return newUsage;
  }

  async getAiProviderUsage(userId: string): Promise<AiProviderUsage[]> {
    return await db
      .select()
      .from(aiProviderUsage)
      .where(eq(aiProviderUsage.userId, userId))
      .orderBy(desc(aiProviderUsage.requestTimestamp));
  }

  // Project memory operations
  async getProjectMemories(projectId: number, memoryType?: string): Promise<ProjectMemory[]> {
    if (memoryType) {
      return await db
        .select()
        .from(projectMemories)
        .where(and(
          eq(projectMemories.projectId, projectId),
          eq(projectMemories.memoryType, memoryType)
        ))
        .orderBy(desc(projectMemories.confidence), desc(projectMemories.usageCount));
    }
    
    return await db
      .select()
      .from(projectMemories)
      .where(eq(projectMemories.projectId, projectId))
      .orderBy(desc(projectMemories.confidence), desc(projectMemories.usageCount));
  }

  async getProjectMemory(id: number): Promise<ProjectMemory | undefined> {
    const [memory] = await db.select().from(projectMemories).where(eq(projectMemories.id, id));
    return memory;
  }

  async createProjectMemory(memory: InsertProjectMemory): Promise<ProjectMemory> {
    const [newMemory] = await db.insert(projectMemories).values(memory).returning();
    return newMemory;
  }

  async updateProjectMemory(id: number, memory: Partial<InsertProjectMemory>): Promise<ProjectMemory> {
    const [updatedMemory] = await db
      .update(projectMemories)
      .set({ 
        ...memory, 
        updatedAt: new Date(),
        usageCount: sql`${projectMemories.usageCount} + 1`,
        lastUsed: new Date()
      })
      .where(eq(projectMemories.id, id))
      .returning();
    return updatedMemory;
  }

  async searchProjectMemories(projectId: number, query: string): Promise<ProjectMemory[]> {
    // Simple search implementation - in production this could use full-text search
    const memories = await this.getProjectMemories(projectId);
    const searchTerms = query.toLowerCase().split(' ');
    
    return memories.filter(memory => {
      const searchText = `${memory.title} ${memory.content}`.toLowerCase();
      return searchTerms.some(term => searchText.includes(term));
    });
  }
  
  // Project Template operations
  async getProjectTemplates(category?: string): Promise<ProjectTemplate[]> {
    if (category) {
      return await db
        .select()
        .from(projectTemplates)
        .where(eq(projectTemplates.category, category))
        .orderBy(desc(projectTemplates.popularity));
    }
    return await db
      .select()
      .from(projectTemplates)
      .orderBy(desc(projectTemplates.popularity));
  }
  
  async getProjectTemplate(id: number): Promise<ProjectTemplate | undefined> {
    const [template] = await db.select().from(projectTemplates).where(eq(projectTemplates.id, id));
    return template;
  }
  
  async createProjectTemplate(template: InsertProjectTemplate): Promise<ProjectTemplate> {
    // Ensure arrays are properly formatted for database insertion
    const formattedTemplate: InsertProjectTemplate = {
      ...template,
      techStack: Array.isArray(template.techStack) ? template.techStack as string[] : (template.techStack ? [template.techStack as string] : [] as string[]),
      features: template.features ? (Array.isArray(template.features) ? template.features as string[] : [template.features as string]) : undefined,
      aiProviders: template.aiProviders ? (Array.isArray(template.aiProviders) ? template.aiProviders as string[] : [template.aiProviders as string]) : undefined,
    };
    
    const [newTemplate] = await db.insert(projectTemplates).values([formattedTemplate]).returning();
    return newTemplate;
  }
  
  async searchProjectTemplates(query: string): Promise<ProjectTemplate[]> {
    // Search in name, description, tech stack, and features
    const templates = await db.select().from(projectTemplates);
    const searchTerms = query.toLowerCase().split(' ');
    
    return templates.filter(template => {
      const searchText = [
        template.name,
        template.description || '',
        ...(template.techStack as string[] || []),
        ...(template.features as string[] || [])
      ].join(' ').toLowerCase();
      
      return searchTerms.some(term => searchText.includes(term));
    }).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }
  
  async getPopularProjectTemplates(limit: number): Promise<ProjectTemplate[]> {
    return await db
      .select()
      .from(projectTemplates)
      .orderBy(desc(projectTemplates.popularity))
      .limit(limit);
  }
  
  async getProjectTemplatesByTechStack(tech: string): Promise<ProjectTemplate[]> {
    const templates = await db.select().from(projectTemplates);
    return templates.filter(template => {
      const techStack = template.techStack as string[] || [];
      return techStack.some(t => t.toLowerCase().includes(tech.toLowerCase()));
    });
  }
  
  async incrementTemplateUsage(templateId: number): Promise<void> {
    await db
      .update(projectTemplates)
      .set({
        popularity: sql`${projectTemplates.popularity} + 1`,
      })
      .where(eq(projectTemplates.id, templateId));
  }
  
  async updateProjectTemplate(id: number, data: Partial<InsertProjectTemplate>): Promise<ProjectTemplate | undefined> {
    const [template] = await db.update(projectTemplates)
      .set({
        ...data,
        techStack: data.techStack ? Array.from(data.techStack as string[]) : undefined,
        features: data.features ? Array.from(data.features as string[]) : undefined,
      } as any)
      .where(eq(projectTemplates.id, id))
      .returning();
    return template;
  }
}

export const storage = new DatabaseStorage();
