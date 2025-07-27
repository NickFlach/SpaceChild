export interface ProjectStats {
  fileCount: number;
  linesOfCode: number;
  lastModified: Date;
  size: number;
}

export interface ProjectSettings {
  consciousnessEnabled: boolean;
  superintelligenceEnabled: boolean;
  aiProvider: string;
  autoSave: boolean;
  theme: "light" | "dark" | "system";
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  expanded?: boolean;
  modified?: boolean;
}

export interface EditorState {
  openFiles: string[];
  activeFile: string | null;
  unsavedChanges: Record<string, boolean>;
  cursorPosition: { line: number; column: number };
}

export interface ProjectContext {
  projectId: number;
  files: string[];
  dependencies: string[];
  framework: string;
  language: string;
  buildTool: string;
}

export interface DeploymentConfig {
  provider: "vercel" | "netlify" | "heroku" | "aws";
  environment: "development" | "staging" | "production";
  branch: string;
  buildCommand: string;
  outputDirectory: string;
  environmentVariables: Record<string, string>;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  dependencies: string[];
  scripts: Record<string, string>;
}

export interface ProjectInvite {
  id: string;
  projectId: number;
  email: string;
  role: "viewer" | "editor" | "admin";
  status: "pending" | "accepted" | "rejected";
  invitedBy: string;
  createdAt: Date;
}

export interface ProjectActivity {
  id: string;
  projectId: number;
  userId: string;
  type: "file_created" | "file_updated" | "file_deleted" | "consciousness_activated" | "analysis_completed";
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ProjectPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canManageSettings: boolean;
}
