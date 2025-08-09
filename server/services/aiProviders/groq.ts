import Groq from 'groq-sdk';
import { BaseAIProvider, AIResponse, AIMessage } from '../ai/base';

export class GroqProvider extends BaseAIProvider {
  name = 'groq';
  model = 'mixtral-8x7b-32768'; // Default to Mixtral for fast inference
  private client: Groq | null = null;

  constructor() {
    super();
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.client = new Groq({ apiKey });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  setModel(model: string): void {
    // Available models: llama2-70b-4096, mixtral-8x7b-32768, gemma-7b-it
    this.model = model;
  }

  async complete(messages: AIMessage[], options?: Record<string, any>): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('Groq API key not configured');
    }

    try {
      const startTime = Date.now();
      
      const completion = await this.client.chat.completions.create({
        messages: messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
        model: this.model,
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        stream: false,
      });

      const responseTime = Date.now() - startTime;
      const message = completion.choices[0]?.message?.content || '';
      
      // Calculate token usage (approximate if not provided)
      const usage = completion.usage || {
        prompt_tokens: this.estimateTokens(messages.map(m => m.content).join(' ')),
        completion_tokens: this.estimateTokens(message),
        total_tokens: 0,
      };
      usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;

      return {
        message,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        model: this.model,
        provider: 'groq',
        responseTime,
      };
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error(`Groq API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async streamMessage(
    messages: AIMessage[],
    onChunk: (chunk: string) => void
  ): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('Groq API key not configured');
    }

    try {
      const startTime = Date.now();
      let fullMessage = '';
      
      const stream = await this.client.chat.completions.create({
        messages: messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
        model: this.model,
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullMessage += content;
          onChunk(content);
        }
      }

      const responseTime = Date.now() - startTime;
      
      // Estimate token usage for streaming
      const usage = {
        promptTokens: this.estimateTokens(messages.map(m => m.content).join(' ')),
        completionTokens: this.estimateTokens(fullMessage),
        totalTokens: 0,
      };
      usage.totalTokens = usage.promptTokens + usage.completionTokens;

      return {
        message: fullMessage,
        usage,
        model: this.model,
        provider: 'groq',
        responseTime,
      };
    } catch (error) {
      console.error('Groq streaming error:', error);
      throw new Error(`Groq streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateCode(
    prompt: string,
    language: string = 'typescript'
  ): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert ${language} developer. Generate clean, well-commented code based on the user's requirements. Only return the code without any explanations or markdown formatting.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await this.sendMessage(messages);
    return this.extractCodeFromResponse(response.message);
  }

  private extractCodeFromResponse(response: string): string {
    // Remove markdown code blocks if present
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/g;
    const matches = response.match(codeBlockRegex);
    
    if (matches) {
      // Extract code from the first code block
      return matches[0].replace(/```[\w]*\n/, '').replace(/\n```$/, '');
    }
    
    // If no code blocks, return the response as is
    return response.trim();
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  getSupportedModels(): string[] {
    return [
      'mixtral-8x7b-32768',  // Fast, high-quality
      'llama2-70b-4096',     // Good for general tasks
      'gemma-7b-it',         // Lightweight, fast
      'llama3-8b-8192',      // Latest Llama 3
      'llama3-70b-8192',     // Larger Llama 3
    ];
  }

  getModelInfo(model: string): { name: string; description: string; maxTokens: number } {
    const modelInfo: Record<string, { name: string; description: string; maxTokens: number }> = {
      'mixtral-8x7b-32768': {
        name: 'Mixtral 8x7B',
        description: 'Fast mixture of experts model with 32K context',
        maxTokens: 32768,
      },
      'llama2-70b-4096': {
        name: 'Llama 2 70B',
        description: 'Large language model with strong reasoning',
        maxTokens: 4096,
      },
      'gemma-7b-it': {
        name: 'Gemma 7B',
        description: 'Lightweight instruction-tuned model',
        maxTokens: 8192,
      },
      'llama3-8b-8192': {
        name: 'Llama 3 8B',
        description: 'Latest Llama model with 8K context',
        maxTokens: 8192,
      },
      'llama3-70b-8192': {
        name: 'Llama 3 70B',
        description: 'Large Llama 3 model for complex tasks',
        maxTokens: 8192,
      },
    };

    return modelInfo[model] || {
      name: model,
      description: 'Custom model',
      maxTokens: 4096,
    };
  }
}

export const groqProvider = new GroqProvider();