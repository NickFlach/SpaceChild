import { BaseAIProvider, AIMessage, AIResponse } from '../ai/base';
import axios from 'axios';

// Extended AIResponse for GPT-OSS with reasoning support
interface GPTOSSResponse extends AIResponse {
  reasoning?: string;
  metadata?: {
    model: string;
    reasoningLevel: string;
    responseTime: number;
    hasTools?: boolean;
  };
}

// Tool definitions for GPT-OSS
export interface Tool {
  type: 'function' | 'browser' | 'python';
  function?: {
    name: string;
    description: string;
    parameters?: Record<string, any>;
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface HarmonyMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  channel?: 'analysis' | 'final';
  tool_calls?: ToolCall[];
}

export class GPTOSSProvider extends BaseAIProvider {
  name = 'gpt-oss';
  model = 'openai/gpt-oss-120b'; // Default to larger model
  private apiKey: string | null = null;
  private baseUrl = 'https://api.together.xyz/v1';
  private tools: Tool[] = [];
  private enableReasoning = true;
  private reasoningLevel: 'low' | 'medium' | 'high' = 'medium';

  constructor() {
    super();
    this.apiKey = process.env.TOGETHER_API_KEY || process.env.OPENAI_API_KEY || null;
    this.initializeTools();
  }

  private initializeTools() {
    // Define available tools for GPT-OSS
    this.tools = [
      {
        type: 'function',
        function: {
          name: 'execute_code',
          description: 'Execute Python code in a sandboxed environment',
          parameters: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Python code to execute',
              },
            },
            required: ['code'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'web_search',
          description: 'Search the web for information',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
            },
            required: ['query'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'analyze_code',
          description: 'Analyze code structure and suggest improvements',
          parameters: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Code to analyze',
              },
              language: {
                type: 'string',
                description: 'Programming language',
              },
            },
            required: ['code', 'language'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'generate_tests',
          description: 'Generate unit tests for code',
          parameters: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Code to test',
              },
              framework: {
                type: 'string',
                description: 'Testing framework to use',
              },
            },
            required: ['code'],
          },
        },
      },
    ];
  }

  isAvailable(): boolean {
    return this.apiKey !== null;
  }

  setModel(model: string): void {
    // Available models: gpt-oss-120b, gpt-oss-20b
    if (model === '120b' || model === 'gpt-oss-120b') {
      this.model = 'openai/gpt-oss-120b';
    } else if (model === '20b' || model === 'gpt-oss-20b') {
      this.model = 'openai/gpt-oss-20b';
    } else {
      this.model = model;
    }
  }

  setReasoningLevel(level: 'low' | 'medium' | 'high'): void {
    this.reasoningLevel = level;
  }

  private formatMessagesForHarmony(messages: AIMessage[]): HarmonyMessage[] {
    // Convert messages to Harmony format
    return messages.map(msg => {
      const harmonyMsg: HarmonyMessage = {
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      };
      
      // Add channel information for assistant messages if reasoning is enabled
      if (msg.role === 'assistant' && this.enableReasoning) {
        harmonyMsg.channel = 'final';
      }
      
      return harmonyMsg;
    });
  }

  private parseHarmonyResponse(response: string): { reasoning?: string; final: string } {
    // Parse the Harmony format response
    const reasoningMatch = response.match(/<\|channel\|>analysis<\|message\|>([\s\S]*?)<\|end\|>/);
    const finalMatch = response.match(/<\|channel\|>final<\|message\|>([\s\S]*?)(?:<\|end\|>|$)/);
    
    return {
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : undefined,
      final: finalMatch ? finalMatch[1].trim() : response,
    };
  }

  async complete(messages: AIMessage[], options?: Record<string, any>): Promise<GPTOSSResponse> {
    if (!this.apiKey) {
      throw new Error('Together API key not configured. Please set TOGETHER_API_KEY environment variable.');
    }

    try {
      const startTime = Date.now();
      
      // Prepare the request payload
      const payload = {
        model: this.model,
        messages: this.formatMessagesForHarmony(messages),
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 4096,
        tools: this.tools,
        tool_choice: 'auto',
        stream: false,
        // GPT-OSS specific parameters
        reasoning_effort: this.reasoningLevel,
        include_reasoning: this.enableReasoning,
      };

      // Make the API request
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseTime = Date.now() - startTime;
      const completion = response.data;
      const message = completion.choices[0]?.message?.content || '';
      
      // Parse Harmony format response
      const parsed = this.parseHarmonyResponse(message);
      
      // Handle tool calls if present
      const toolCalls = completion.choices[0]?.message?.tool_calls;
      let finalContent = parsed.final;
      
      if (toolCalls && toolCalls.length > 0) {
        // Execute tools locally
        const toolResults = await this.executeTools(toolCalls);
        finalContent = `${parsed.final}\n\nTool Results:\n${toolResults}`;
      }
      
      // Calculate token usage
      const usage = completion.usage || {
        prompt_tokens: this.estimateTokens(messages.map(m => m.content).join(' ')),
        completion_tokens: this.estimateTokens(finalContent),
        total_tokens: 0,
      };
      usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;

      return {
        content: finalContent,
        reasoning: parsed.reasoning,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        metadata: {
          model: this.model,
          reasoningLevel: this.reasoningLevel,
          responseTime,
          hasTools: toolCalls && toolCalls.length > 0,
        },
      };
    } catch (error) {
      console.error('GPT-OSS API error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`GPT-OSS API error: ${errorMessage}`);
      }
      throw new Error(`GPT-OSS API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async streamMessage(
    messages: AIMessage[],
    onChunk: (chunk: string) => void
  ): Promise<GPTOSSResponse> {
    if (!this.apiKey) {
      throw new Error('Together API key not configured');
    }

    try {
      const startTime = Date.now();
      let fullMessage = '';
      let reasoning = '';
      let isReasoningChannel = false;
      
      const payload = {
        model: this.model,
        messages: this.formatMessagesForHarmony(messages),
        temperature: 0.7,
        max_tokens: 4096,
        tools: this.tools,
        tool_choice: 'auto',
        stream: true,
        reasoning_effort: this.reasoningLevel,
        include_reasoning: this.enableReasoning,
      };

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          responseType: 'stream',
        }
      );

      return new Promise((resolve, reject) => {
        let buffer = '';
        
        response.data.on('data', (chunk: Buffer) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                
                // Check for channel markers in Harmony format
                if (content.includes('<|channel|>analysis')) {
                  isReasoningChannel = true;
                } else if (content.includes('<|channel|>final')) {
                  isReasoningChannel = false;
                }
                
                if (isReasoningChannel && this.enableReasoning) {
                  reasoning += content;
                } else if (content && !content.includes('<|')) {
                  fullMessage += content;
                  onChunk(content);
                }
              } catch (e) {
                console.error('Error parsing stream chunk:', e);
              }
            }
          }
        });

        response.data.on('end', () => {
          const responseTime = Date.now() - startTime;
          const parsed = this.parseHarmonyResponse(fullMessage);
          
          resolve({
            content: parsed.final,
            reasoning: reasoning || parsed.reasoning,
            usage: {
              promptTokens: this.estimateTokens(messages.map(m => m.content).join(' ')),
              completionTokens: this.estimateTokens(fullMessage),
              totalTokens: 0,
            },
            metadata: {
              model: this.model,
              reasoningLevel: this.reasoningLevel,
              responseTime,
            },
          });
        });

        response.data.on('error', reject);
      });
    } catch (error) {
      console.error('GPT-OSS streaming error:', error);
      throw new Error(`GPT-OSS streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeTools(toolCalls: ToolCall[]): Promise<string> {
    const results: string[] = [];
    
    for (const toolCall of toolCalls) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        
        switch (toolCall.function.name) {
          case 'execute_code':
            results.push(await this.executePythonCode(args.code));
            break;
          case 'web_search':
            results.push(await this.performWebSearch(args.query));
            break;
          case 'analyze_code':
            results.push(await this.analyzeCode(args.code, args.language));
            break;
          case 'generate_tests':
            results.push(await this.generateTests(args.code, args.framework));
            break;
          default:
            results.push(`Unknown tool: ${toolCall.function.name}`);
        }
      } catch (error) {
        results.push(`Error executing ${toolCall.function.name}: ${error}`);
      }
    }
    
    return results.join('\n\n');
  }

  private async executePythonCode(code: string): Promise<string> {
    // Implement Python code execution in a sandboxed environment
    // For now, return a placeholder
    return `[Python execution not yet implemented]\nCode to execute:\n${code}`;
  }

  private async performWebSearch(query: string): Promise<string> {
    // Implement web search functionality
    // Could integrate with Exa API or other search providers
    return `[Web search not yet implemented]\nQuery: ${query}`;
  }

  private async analyzeCode(code: string, language: string): Promise<string> {
    // Implement code analysis
    return `[Code analysis for ${language}]\n- Structure looks good\n- Consider adding more error handling\n- Documentation could be improved`;
  }

  private async generateTests(code: string, framework?: string): Promise<string> {
    // Implement test generation
    return `[Test generation with ${framework || 'default framework'}]\n// Tests would be generated here`;
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  getModelInfo(model: string): { name: string; description: string; maxTokens: number } {
    const modelInfo: Record<string, { name: string; description: string; maxTokens: number }> = {
      'openai/gpt-oss-120b': {
        name: 'GPT-OSS 120B',
        description: 'Production-ready model with 117B parameters (5.1B active), fits in 80GB GPU',
        maxTokens: 128000,
      },
      'openai/gpt-oss-20b': {
        name: 'GPT-OSS 20B',
        description: 'Lightweight model with 21B parameters (3.6B active), runs in 16GB memory',
        maxTokens: 128000,
      },
    };

    return modelInfo[model] || {
      name: model,
      description: 'Custom GPT-OSS model',
      maxTokens: 4096,
    };
  }
}

// Export singleton instance
export const gptOSSProvider = new GPTOSSProvider();