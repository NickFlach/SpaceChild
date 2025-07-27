// AI Provider Types and Interfaces

export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  baseURL?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  projectId?: number;
  userId?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  response: string;
  usage?: TokenUsage;
  error?: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIProvider {
  chat(request: ChatRequest): Promise<ChatResponse>;
}

export interface ConsciousnessContext {
  memories: any[];
  patterns: string[];
  confidence: number;
}

export interface SuperintelligenceAnalysis {
  architectureInsights: string[];
  optimizationSuggestions: string[];
  securityRecommendations: string[];
  codeQuality: number;
}