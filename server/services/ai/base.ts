export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export abstract class BaseAIProvider {
  abstract name: string;
  abstract model: string;
  
  abstract complete(
    messages: AIMessage[],
    options?: Record<string, any>
  ): Promise<AIResponse>;
  
  abstract isAvailable(): boolean;
}