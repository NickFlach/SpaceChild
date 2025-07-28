import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default('basic'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectType: varchar("project_type", { length: 100 }).default('web-app'),
  config: jsonb("config").default('{}'),
  consciousnessEnabled: boolean("consciousness_enabled").default(false),
  superintelligenceEnabled: boolean("superintelligence_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project files table
export const projectFiles = pgTable("project_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  content: text("content"),
  fileType: varchar("file_type", { length: 50 }),
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Consciousness context table
export const consciousnessContext = pgTable("consciousness_context", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  sessionId: varchar("session_id", { length: 255 }),
  contextData: jsonb("context_data"),
  learningData: jsonb("learning_data"),
  lastInteraction: timestamp("last_interaction").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Consciousness memories table
export const consciousnessMemories = pgTable("consciousness_memories", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  memoryType: varchar("memory_type", { length: 100 }),
  memoryContent: jsonb("memory_content"),
  relevanceScore: decimal("relevance_score", { precision: 3, scale: 2 }).default('1.0'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project memories table for storing learned patterns and preferences
export const projectMemories = pgTable("project_memories", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  memoryType: varchar("memory_type", { length: 100 }).notNull(), // 'pattern', 'preference', 'solution', 'knowledge'
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").default('{}'), // Additional context like file paths, technologies used
  usageCount: integer("usage_count").default(0),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default('0.5'),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Superintelligence jobs table
export const superintelligenceJobs = pgTable("superintelligence_jobs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  jobType: varchar("job_type", { length: 100 }),
  inputData: jsonb("input_data"),
  status: varchar("status", { length: 50 }).default('pending'),
  results: jsonb("results"),
  processingTimeMs: integer("processing_time_ms"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// AI provider usage table
export const aiProviderUsage = pgTable("ai_provider_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  provider: varchar("provider", { length: 100 }),
  serviceType: varchar("service_type", { length: 100 }),
  tokensUsed: integer("tokens_used"),
  costUsd: decimal("cost_usd", { precision: 10, scale: 4 }),
  requestTimestamp: timestamp("request_timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  aiProviderUsage: many(aiProviderUsage),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  files: many(projectFiles),
  consciousnessContext: many(consciousnessContext),
  consciousnessMemories: many(consciousnessMemories),
  projectMemories: many(projectMemories),
  superintelligenceJobs: many(superintelligenceJobs),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id],
  }),
}));

export const consciousnessContextRelations = relations(consciousnessContext, ({ one }) => ({
  project: one(projects, {
    fields: [consciousnessContext.projectId],
    references: [projects.id],
  }),
}));

export const consciousnessMemoriesRelations = relations(consciousnessMemories, ({ one }) => ({
  project: one(projects, {
    fields: [consciousnessMemories.projectId],
    references: [projects.id],
  }),
}));

export const projectMemoriesRelations = relations(projectMemories, ({ one }) => ({
  project: one(projects, {
    fields: [projectMemories.projectId],
    references: [projects.id],
  }),
}));

export const superintelligenceJobsRelations = relations(superintelligenceJobs, ({ one }) => ({
  project: one(projects, {
    fields: [superintelligenceJobs.projectId],
    references: [projects.id],
  }),
}));

export const aiProviderUsageRelations = relations(aiProviderUsage, ({ one }) => ({
  user: one(users, {
    fields: [aiProviderUsage.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectFileSchema = createInsertSchema(projectFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConsciousnessContextSchema = createInsertSchema(consciousnessContext).omit({
  id: true,
  createdAt: true,
});

export const insertConsciousnessMemorySchema = createInsertSchema(consciousnessMemories).omit({
  id: true,
  createdAt: true,
});

export const insertProjectMemorySchema = createInsertSchema(projectMemories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsed: true,
});

export const insertSuperintelligenceJobSchema = createInsertSchema(superintelligenceJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertAiProviderUsageSchema = createInsertSchema(aiProviderUsage).omit({
  id: true,
  requestTimestamp: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProjectFile = z.infer<typeof insertProjectFileSchema>;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type InsertConsciousnessContext = z.infer<typeof insertConsciousnessContextSchema>;
export type ConsciousnessContext = typeof consciousnessContext.$inferSelect;
export type InsertConsciousnessMemory = z.infer<typeof insertConsciousnessMemorySchema>;
export type ConsciousnessMemory = typeof consciousnessMemories.$inferSelect;
export type InsertProjectMemory = z.infer<typeof insertProjectMemorySchema>;
export type ProjectMemory = typeof projectMemories.$inferSelect;

// Project Templates
export const projectTemplates = pgTable("project_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // web-app, api, ml-model, etc.
  techStack: jsonb("tech_stack").notNull().$type<string[]>(), // ["react", "typescript", "tailwind", etc.]
  aiProviders: jsonb("ai_providers").$type<string[]>(), // Recommended AI providers
  features: jsonb("features").$type<string[]>(), // ["authentication", "database", etc.]
  starterFiles: jsonb("starter_files").notNull().$type<Array<{
    path: string;
    content: string;
    description?: string;
  }>>(),
  config: jsonb("config").$type<{
    projectType: 'web' | 'backend' | 'fullstack' | 'cli' | 'library';
    consciousnessEnabled?: boolean;
    superintelligenceEnabled?: boolean;
    defaultAiProvider?: string;
    envVariables?: Array<{ key: string; description: string; required: boolean }>;
  }>(),
  popularity: integer("popularity").default(0), // Usage count
  createdBy: varchar("created_by"), // System or user ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectTemplateSchema = createInsertSchema(projectTemplates);
export type InsertProjectTemplate = z.infer<typeof insertProjectTemplateSchema>;
export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type InsertSuperintelligenceJob = z.infer<typeof insertSuperintelligenceJobSchema>;
export type SuperintelligenceJob = typeof superintelligenceJobs.$inferSelect;
export type InsertAiProviderUsage = z.infer<typeof insertAiProviderUsageSchema>;
export type AiProviderUsage = typeof aiProviderUsage.$inferSelect;
