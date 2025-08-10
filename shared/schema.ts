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
  real,
  unique,
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

// User storage table with Zero Knowledge Proof Authentication (SRP)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  username: varchar("username").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // SRP (Secure Remote Password) fields for ZKP authentication
  srpSalt: varchar("srp_salt"), // Salt used in SRP protocol
  srpVerifier: varchar("srp_verifier"), // Verifier for SRP authentication
  srpEphemeral: jsonb("srp_ephemeral"), // Temporary values for active session
  // Session management
  sessionToken: varchar("session_token"),
  sessionExpiry: timestamp("session_expiry"),
  // Subscription and credits
  subscriptionTier: varchar("subscription_tier").default('free'),
  monthlyCredits: integer("monthly_credits").default(100),
  usedCredits: integer("used_credits").default(0),
  creditResetDate: timestamp("credit_reset_date").defaultNow(),
  stripeCustomerId: varchar("stripe_customer_id"),
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

// Enhanced Consciousness Engine Tables
export const enhancedMemories = pgTable("enhanced_memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").notNull().references(() => projects.id),
  sessionId: varchar("session_id").notNull(),
  content: text("content").notNull(),
  type: varchar("type").notNull(), // 'code', 'chat', 'error', 'success'
  embedding: real("embedding").array().notNull(), // Vector embedding for semantic search
  metadata: jsonb("metadata").default('{}'),
  confidence: real("confidence").default(1.0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: integer("project_id"),
  category: varchar("category").notNull(), // 'coding_style', 'framework', 'ui_preference', etc.
  value: text("value").notNull(),
  strength: real("strength").default(1.0), // How strongly this preference is held
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const interactionPatterns = pgTable("interaction_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").notNull().references(() => projects.id),
  pattern: text("pattern").notNull(),
  type: varchar("type").notNull(),
  occurrences: integer("occurrences").default(1),
  context: jsonb("context").default('{}'),
  lastSeen: timestamp("last_seen").defaultNow(),
});

// Indexes for performance
// TODO: Add indexes after tables are created

// E2B Sandbox Sessions table
export const sandboxSessions = pgTable("sandbox_sessions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sandboxId: varchar("sandbox_id", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default('active'), // active, paused, terminated
  environment: varchar("environment", { length: 100 }).default('nodejs'), // nodejs, python, custom
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Scraped Data table for Firecrawl results
export const scrapedData = pgTable("scraped_data", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  scrapeType: varchar("scrape_type", { length: 50 }).default('single'), // single, crawl, extract
  data: jsonb("data").notNull(),
  metadata: jsonb("metadata").default('{}'),
  markdown: text("markdown"),
  extractedData: jsonb("extracted_data"),
  createdAt: timestamp("created_at").defaultNow(),
  cacheExpiry: timestamp("cache_expiry"),
});

// Code Generation History table
export const codeGenerations = pgTable("code_generations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  prompt: text("prompt").notNull(),
  generatedCode: text("generated_code").notNull(),
  language: varchar("language", { length: 50 }).default('typescript'),
  provider: varchar("provider", { length: 50 }).default('anthropic'),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for new tables
export const sandboxSessionsRelations = relations(sandboxSessions, ({ one }) => ({
  project: one(projects, {
    fields: [sandboxSessions.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [sandboxSessions.userId],
    references: [users.id],
  }),
}));

export const scrapedDataRelations = relations(scrapedData, ({ one }) => ({
  project: one(projects, {
    fields: [scrapedData.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [scrapedData.userId],
    references: [users.id],
  }),
}));

export const codeGenerationsRelations = relations(codeGenerations, ({ one }) => ({
  project: one(projects, {
    fields: [codeGenerations.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [codeGenerations.userId],
    references: [users.id],
  }),
}));

// Insert schemas for new tables
export const insertSandboxSessionSchema = createInsertSchema(sandboxSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScrapedDataSchema = createInsertSchema(scrapedData).omit({
  id: true,
  createdAt: true,
});

export const insertCodeGenerationSchema = createInsertSchema(codeGenerations).omit({
  id: true,
  createdAt: true,
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('USD'),
  billingPeriod: varchar("billing_period", { length: 20 }).default('monthly'), // monthly, yearly
  monthlyCredits: integer("monthly_credits").notNull(),
  features: jsonb("features").$type<string[]>().notNull(),
  aiProviders: jsonb("ai_providers").$type<string[]>().notNull(),
  maxProjects: integer("max_projects"),
  maxSandboxes: integer("max_sandboxes"),
  priority: integer("priority").default(1), // For ordering plans
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  planId: varchar("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: varchar("status", { length: 20 }).default('active'), // active, canceled, expired
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit usage tracking table
export const creditUsage = pgTable("credit_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // ai_query, sandbox_execution, code_generation, etc.
  creditsUsed: integer("credits_used").notNull(),
  provider: varchar("provider", { length: 50 }),
  projectId: integer("project_id").references(() => projects.id),
  metadata: jsonb("metadata").default('{}'),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Types for new tables
export type SandboxSession = typeof sandboxSessions.$inferSelect;
export type InsertSandboxSession = z.infer<typeof insertSandboxSessionSchema>;
export type ScrapedData = typeof scrapedData.$inferSelect;
export type InsertScrapedData = z.infer<typeof insertScrapedDataSchema>;
export type CodeGeneration = typeof codeGenerations.$inferSelect;
export type InsertCodeGeneration = z.infer<typeof insertCodeGenerationSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;
export type CreditUsage = typeof creditUsage.$inferSelect;
export type InsertCreditUsage = typeof creditUsage.$inferInsert;

// Insert schemas for subscription tables
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreditUsageSchema = createInsertSchema(creditUsage).omit({
  id: true,
  timestamp: true,
});
// export const enhancedMemoryUserProjectIdx = index("enhanced_memory_user_project_idx")
//   .on(enhancedMemories.userId, enhancedMemories.projectId);

// export const preferenceUserCategoryIdx = index("preference_user_category_idx")
//   .on(userPreferences.userId, userPreferences.category);

// export const patternUserProjectIdx = index("pattern_user_project_idx")
//   .on(interactionPatterns.userId, interactionPatterns.projectId);

// Types
export type EnhancedMemory = typeof enhancedMemories.$inferSelect;
export type InsertEnhancedMemory = typeof enhancedMemories.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
export type InteractionPattern = typeof interactionPatterns.$inferSelect;
export type InsertInteractionPattern = typeof interactionPatterns.$inferInsert;
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

// Superintelligence analysis results
export const superintelligenceAnalyses = pgTable("superintelligence_analyses", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  fileId: varchar("file_id"),
  analysisType: varchar("analysis_type").notNull(), // 'code_quality', 'performance', 'security', 'bug_prediction'
  results: jsonb("results").notNull(),
  confidence: real("confidence").default(0.8),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SuperintelligenceAnalysis = typeof superintelligenceAnalyses.$inferSelect;
export type InsertSuperintelligenceAnalysis = typeof superintelligenceAnalyses.$inferInsert;

// Superintelligence optimization suggestions
export const superintelligenceOptimizations = pgTable("superintelligence_optimizations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  optimizationType: varchar("optimization_type").notNull(), // 'performance', 'memory', 'bundle_size', 'refactoring'
  description: text("description").notNull(),
  impact: varchar("impact").notNull(), // 'low', 'medium', 'high', 'critical'
  estimatedImprovement: varchar("estimated_improvement"),
  implementation: jsonb("implementation").notNull(), // Detailed steps and code examples
  applied: boolean("applied").default(false),
  confidence: real("confidence").default(0.75),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SuperintelligenceOptimization = typeof superintelligenceOptimizations.$inferSelect;
export type InsertSuperintelligenceOptimization = typeof superintelligenceOptimizations.$inferInsert;

// Superintelligence architecture recommendations
export const superintelligenceRecommendations = pgTable("superintelligence_recommendations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  recommendationType: varchar("recommendation_type").notNull(), // 'structure', 'pattern', 'security', 'performance'
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").notNull(), // 'low', 'medium', 'high', 'critical'
  impact: text("impact"),
  rationale: text("rationale"),
  implementation: jsonb("implementation").notNull(), // Steps, examples, migration guide
  implemented: boolean("implemented").default(false),
  confidence: real("confidence").default(0.8),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SuperintelligenceRecommendation = typeof superintelligenceRecommendations.$inferSelect;
export type InsertSuperintelligenceRecommendation = typeof superintelligenceRecommendations.$inferInsert;

// Complexity Agent Analysis Tables
export const complexityAnalyses = pgTable("complexity_analyses", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  sessionId: varchar("session_id").notNull(),
  request: text("request").notNull(),
  response: text("response").notNull(),
  complexityMetrics: jsonb("complexity_metrics").notNull().$type<{
    nonlinearEffects: number;
    emergentProperties: number;
    multiscaleAwareness: number;
    recursiveDepth: number;
    fractalPatterns: number;
    chaosOrderBalance: number;
  }>(),
  fractalPatterns: jsonb("fractal_patterns").default([]).$type<Array<{
    pattern: string;
    recursionLevel: number;
    manifestations: string[];
    complexity: number;
    universality: number;
  }>>(),
  reflectiveThoughts: jsonb("reflective_thoughts").default([]).$type<Array<{
    observation: string;
    reflection: string;
    adaptation: string;
    emergentInsight: string;
    timestamp: string;
  }>>(),
  emergentInsights: jsonb("emergent_insights").default([]).$type<string[]>(),
  confidence: real("confidence").default(0.8),
  createdAt: timestamp("created_at").defaultNow(),
});

export const complexityPatterns = pgTable("complexity_patterns", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  pattern: text("pattern").notNull(),
  recursionLevel: integer("recursion_level").default(0),
  manifestations: jsonb("manifestations").default([]).$type<string[]>(),
  complexity: real("complexity").default(0.5),
  universality: real("universality").default(0.5),
  frequency: integer("frequency").default(1),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ComplexityAnalysis = typeof complexityAnalyses.$inferSelect;
export type InsertComplexityAnalysis = typeof complexityAnalyses.$inferInsert;

// Replit User Search table - for caching searched user data
export const replitUserSearches = pgTable("replit_user_searches", {
  id: serial("id").primaryKey(),
  searchedUserId: varchar("searched_user_id").references(() => users.id).notNull(),
  replitUsername: varchar("replit_username", { length: 255 }).notNull(),
  userData: jsonb("user_data"), // Profile info, avatar, etc.
  publicRepls: jsonb("public_repls").default('[]'), // Array of public repls
  deployments: jsonb("deployments").default('[]'), // Array of deployments
  searchedAt: timestamp("searched_at").defaultNow(),
  cacheExpiry: timestamp("cache_expiry").notNull(),
}, (table) => ({
  // Unique constraint for user + replit username combination
  userReplitUsernameUnique: unique("user_replit_username_unique").on(table.searchedUserId, table.replitUsername),
}));

export type ReplitUserSearch = typeof replitUserSearches.$inferSelect;
export type InsertReplitUserSearch = typeof replitUserSearches.$inferInsert;
export type ComplexityPattern = typeof complexityPatterns.$inferSelect;
export type InsertComplexityPattern = typeof complexityPatterns.$inferInsert;

// Multi-Agent System Tables
export const multiAgentSessions = pgTable("multi_agent_sessions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  goal: text("goal").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  result: jsonb("result"),
});

export const multiAgentMessages = pgTable("multi_agent_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => multiAgentSessions.id).notNull(),
  fromAgent: varchar("from_agent", { length: 50 }).notNull(),
  toAgent: varchar("to_agent", { length: 50 }),
  messageType: varchar("message_type", { length: 50 }).notNull(),
  content: jsonb("content").notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),
  timestamp: timestamp("timestamp").notNull(),
});

export const multiAgentTasks = pgTable("multi_agent_tasks", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => multiAgentSessions.id).notNull(),
  agentType: varchar("agent_type", { length: 50 }).notNull(),
  taskType: varchar("task_type", { length: 100 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  dependencies: jsonb("dependencies").default([]).$type<string[]>(),
  result: jsonb("result"),
  createdAt: timestamp("created_at").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export type InsertMultiAgentSession = typeof multiAgentSessions.$inferInsert;
export type MultiAgentSession = typeof multiAgentSessions.$inferSelect;
export type InsertMultiAgentMessage = typeof multiAgentMessages.$inferInsert;
export type MultiAgentMessage = typeof multiAgentMessages.$inferSelect;
export type InsertMultiAgentTask = typeof multiAgentTasks.$inferInsert;
export type MultiAgentTask = typeof multiAgentTasks.$inferSelect;

// Deployment Intelligence Tables
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  environment: varchar("environment", { length: 50 }).notNull(),
  version: varchar("version", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  features: jsonb("features").default([]).$type<string[]>(),
  deployedBy: varchar("deployed_by").notNull(),
  deployedAt: timestamp("deployed_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  healthStatus: varchar("health_status", { length: 50 }),
  rollbackVersion: varchar("rollback_version", { length: 100 }),
  scalingConfig: jsonb("scaling_config").$type<{
    minInstances: number;
    maxInstances: number;
    targetCPU: number;
    targetMemory: number;
  }>(),
});

export const deploymentMetrics = pgTable("deployment_metrics", {
  id: serial("id").primaryKey(),
  deploymentId: integer("deployment_id").references(() => deployments.id).notNull(),
  metricType: varchar("metric_type", { length: 50 }).notNull(),
  value: real("value").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const deploymentIssues = pgTable("deployment_issues", {
  id: serial("id").primaryKey(),
  deploymentId: integer("deployment_id").references(() => deployments.id).notNull(),
  issueType: varchar("issue_type", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  description: text("description").notNull(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  status: varchar("status", { length: 50 }).notNull(),
  resolution: text("resolution"),
});

export const deploymentOptimizations = pgTable("deployment_optimizations", {
  id: serial("id").primaryKey(),
  deploymentId: integer("deployment_id").references(() => deployments.id).notNull(),
  optimizationType: varchar("optimization_type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  impact: varchar("impact", { length: 20 }).notNull(),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  results: jsonb("results"),
});

// Deployment types
export type InsertDeployment = typeof deployments.$inferInsert;
export type Deployment = typeof deployments.$inferSelect;
export type InsertDeploymentMetric = typeof deploymentMetrics.$inferInsert;
export type DeploymentMetric = typeof deploymentMetrics.$inferSelect;
export type InsertDeploymentIssue = typeof deploymentIssues.$inferInsert;
export type DeploymentIssue = typeof deploymentIssues.$inferSelect;
export type InsertDeploymentOptimization = typeof deploymentOptimizations.$inferInsert;
export type DeploymentOptimization = typeof deploymentOptimizations.$inferSelect;
