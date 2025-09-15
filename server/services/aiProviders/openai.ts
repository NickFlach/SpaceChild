import OpenAI from 'openai';
import { BaseAIProvider, AIMessage, AIResponse } from '../ai/base';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_OPENAI_MODEL = "gpt-4o";

export class OpenAIProvider extends BaseAIProvider {
  name = 'openai';
  model = DEFAULT_OPENAI_MODEL;
  private client: OpenAI | null = null;

  constructor() {
    super();
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  setModel(model: string): void {
    this.model = model;
  }

  async complete(messages: AIMessage[], options?: Record<string, any>): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const startTime = Date.now();
      
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
        max_tokens: options?.max_tokens || 1024,
        temperature: options?.temperature || 0.7,
        top_p: options?.top_p || 1,
        stream: false,
      });

      const responseTime = Date.now() - startTime;
      const responseText = completion.choices[0]?.message?.content || '';
      
      // Calculate token usage
      const usage = completion.usage || {
        prompt_tokens: this.estimateTokens(messages.map(m => m.content).join(' ')),
        completion_tokens: this.estimateTokens(responseText),
        total_tokens: 0,
      };
      usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;

      return {
        content: responseText,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async streamMessage(
    messages: AIMessage[],
    onChunk: (chunk: string) => void
  ): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
        max_tokens: 1024,
        temperature: 0.7,
        stream: true,
      });

      let fullResponse = '';
      let totalTokens = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          fullResponse += delta.content;
          onChunk(delta.content);
        }
        
        if (chunk.usage) {
          totalTokens = chunk.usage.total_tokens || 0;
        }
      }

      return {
        content: fullResponse,
        usage: {
          promptTokens: 0, // Not available in streaming
          completionTokens: totalTokens,
          totalTokens: totalTokens,
        },
      };
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw new Error(`OpenAI streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for GPT models
    return Math.ceil(text.length / 4);
  }
}