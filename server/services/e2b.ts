import { Sandbox } from '@e2b/code-interpreter';
import { db } from '../db';
import { sandboxSessions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface SandboxExecutionResult {
  output: string;
  error?: string;
  executionTime?: number;
  files?: Array<{ path: string; content: string }>;
}

export interface CreateSandboxOptions {
  projectId: number;
  userId: string;
  environment?: 'nodejs' | 'python' | 'custom';
  timeout?: number;
}

class E2BService {
  private sandboxes: Map<string, Sandbox> = new Map();
  private sandboxIdCounter: number = 0;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.E2B_API_KEY;
  }

  private validateApiKey(): void {
    if (!this.apiKey) {
      throw new Error('E2B_API_KEY is not configured. Please add it to your environment variables.');
    }
  }

  async createSandbox(options: CreateSandboxOptions): Promise<{ sandboxId: string; sessionId: number }> {
    this.validateApiKey();

    try {
      // Create E2B sandbox with proper API
      const sandbox = await Sandbox.create(
        options.environment === 'python' ? 'python' : 'nodejs',
        { apiKey: this.apiKey }
      );

      // Generate a unique sandbox ID
      const sandboxId = `sandbox_${Date.now()}_${++this.sandboxIdCounter}`;
      
      // Store sandbox reference
      this.sandboxes.set(sandboxId, sandbox);

      // Save session to database
      const session = await db.insert(sandboxSessions).values({
        projectId: options.projectId,
        userId: options.userId,
        sandboxId: sandboxId,
        environment: options.environment || 'nodejs',
        status: 'active',
        metadata: {
          createdAt: new Date().toISOString(),
          timeout: options.timeout || 300000, // 5 minutes default
        },
        expiresAt: new Date(Date.now() + (options.timeout || 300000)),
      }).returning();

      // Set timeout to automatically terminate sandbox
      setTimeout(() => {
        this.terminateSandbox(sandboxId).catch(console.error);
      }, options.timeout || 300000);

      return {
        sandboxId: sandboxId,
        sessionId: session[0].id,
      };
    } catch (error) {
      console.error('Error creating sandbox:', error);
      throw new Error(`Failed to create sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async executeCode(
    sandboxId: string,
    code: string,
    language: 'javascript' | 'python' = 'javascript'
  ): Promise<SandboxExecutionResult> {
    this.validateApiKey();

    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error('Sandbox not found or has been terminated');
    }

    try {
      const startTime = Date.now();
      
      // Execute code in sandbox
      const execution = await sandbox.runCode(code, {
        language: language === 'python' ? 'python' : 'javascript',
      });

      const executionTime = Date.now() - startTime;

      // Update session in database
      await db.update(sandboxSessions)
        .set({
          updatedAt: new Date(),
          metadata: {
            lastExecution: new Date().toISOString(),
            totalExecutions: 1, // You could increment this
          },
        })
        .where(eq(sandboxSessions.sandboxId, sandboxId));

      return {
        output: execution.text || '',
        error: execution.error ? String(execution.error) : undefined,
        executionTime,
        files: [], // E2B code-interpreter doesn't have artifacts in the same way
      };
    } catch (error) {
      console.error('Error executing code:', error);
      throw new Error(`Code execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFile(sandboxId: string, path: string, content: string): Promise<void> {
    this.validateApiKey();

    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error('Sandbox not found or has been terminated');
    }

    try {
      await sandbox.files.write(path, content);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async readFile(sandboxId: string, path: string): Promise<string> {
    this.validateApiKey();

    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error('Sandbox not found or has been terminated');
    }

    try {
      const content = await sandbox.files.read(path);
      return content;
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listFiles(sandboxId: string, directory: string = '/'): Promise<string[]> {
    this.validateApiKey();

    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error('Sandbox not found or has been terminated');
    }

    try {
      const files = await sandbox.files.list(directory);
      // Convert EntryInfo objects to string paths
      return files.map(file => typeof file === 'string' ? file : file.path || file.name || String(file));
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async terminateSandbox(sandboxId: string): Promise<void> {
    try {
      const sandbox = this.sandboxes.get(sandboxId);
      if (sandbox) {
        await sandbox.kill();
        this.sandboxes.delete(sandboxId);
      }

      // Update session status in database
      await db.update(sandboxSessions)
        .set({
          status: 'terminated',
          updatedAt: new Date(),
        })
        .where(eq(sandboxSessions.sandboxId, sandboxId));
    } catch (error) {
      console.error('Error terminating sandbox:', error);
    }
  }

  async getActiveSandboxes(userId: string, projectId?: number): Promise<any[]> {
    const conditions = projectId 
      ? and(eq(sandboxSessions.userId, userId), eq(sandboxSessions.projectId, projectId), eq(sandboxSessions.status, 'active'))
      : and(eq(sandboxSessions.userId, userId), eq(sandboxSessions.status, 'active'));

    const sessions = await db.select()
      .from(sandboxSessions)
      .where(conditions);

    return sessions;
  }

  async cleanupExpiredSandboxes(): Promise<void> {
    try {
      const now = new Date();
      const expiredSessions = await db.select()
        .from(sandboxSessions)
        .where(and(
          eq(sandboxSessions.status, 'active'),
          // Note: We'd need to add a condition for expired sessions
        ));

      for (const session of expiredSessions) {
        await this.terminateSandbox(session.sandboxId);
      }
    } catch (error) {
      console.error('Error cleaning up expired sandboxes:', error);
    }
  }
}

export const e2bService = new E2BService();