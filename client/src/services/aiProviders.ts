import { ApiService } from "./api";

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  capabilities: string[];
  pricing: {
    inputTokens: number; // per 1k tokens
    outputTokens: number; // per 1k tokens
  };
}

export interface AIResponse {
  response: string;
  tokensUsed: number;
  cost: string;
  provider: string;
}

export class AIProviderService {
  private static providers: AIProvider[] = [
    {
      id: "anthropic",
      name: "Anthropic Claude",
      description: "Advanced reasoning and code generation with Claude Sonnet 4",
      badge: "Recommended",
      badgeColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
      capabilities: ["code-generation", "debugging", "refactoring", "explanation"],
      pricing: {
        inputTokens: 0.008,
        outputTokens: 0.024,
      },
    },
    {
      id: "openai",
      name: "OpenAI GPT-4",
      description: "Powerful language model with broad coding knowledge",
      capabilities: ["code-generation", "debugging", "creative-coding", "documentation"],
      pricing: {
        inputTokens: 0.03,
        outputTokens: 0.06,
      },
    },
    {
      id: "spaceagent",
      name: "SpaceAgent",
      description: "Context-aware AI with consciousness and memory",
      badge: "Active",
      badgeColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
      capabilities: ["consciousness", "context-awareness", "learning", "memory"],
      pricing: {
        inputTokens: 0.012,
        outputTokens: 0.036,
      },
    },
    {
      id: "mindsphere",
      name: "MindSphere",
      description: "Superintelligent AI for architectural analysis and optimization",
      badge: "Active",
      badgeColor: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
      capabilities: ["superintelligence", "architecture-analysis", "optimization", "refactoring"],
      pricing: {
        inputTokens: 0.015,
        outputTokens: 0.045,
      },
    },
    {
      id: "terminal-jarvis",
      name: "Terminal Jarvis",
      description: "Multi-AI tool manager for CLI-based coding assistants (Claude, Gemini, Qwen, OpenCode)",
      badge: "CLI Master",
      badgeColor: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
      capabilities: ["cli-tools", "tool-management", "multi-ai-access", "terminal-interface"],
      pricing: {
        inputTokens: 0.000, // Free tool manager
        outputTokens: 0.000,
      },
    },
  ];

  static getProviders(): AIProvider[] {
    return this.providers;
  }

  static getProvider(id: string): AIProvider | null {
    return this.providers.find(provider => provider.id === id) || null;
  }

  static async generateCode(
    prompt: string, 
    providerId: string = "anthropic", 
    projectId?: number
  ): Promise<AIResponse> {
    try {
      return await ApiService.generateCode(prompt, providerId, projectId);
    } catch (error) {
      console.error("Failed to generate code:", error);
      throw error;
    }
  }

  static async chat(
    message: string, 
    providerId: string = "anthropic", 
    projectId?: number
  ): Promise<AIResponse> {
    try {
      return await ApiService.chatWithAI(message, providerId, projectId);
    } catch (error) {
      console.error("Failed to chat with AI:", error);
      throw error;
    }
  }

  static calculateCost(inputTokens: number, outputTokens: number, provider: AIProvider): number {
    const inputCost = (inputTokens / 1000) * provider.pricing.inputTokens;
    const outputCost = (outputTokens / 1000) * provider.pricing.outputTokens;
    return inputCost + outputCost;
  }

  static formatCost(cost: number): string {
    if (cost < 0.001) return "< $0.001";
    return `$${cost.toFixed(4)}`;
  }

  static getProviderIcon(providerId: string): string {
    switch (providerId) {
      case "anthropic":
        return "🤖";
      case "openai":
        return "🧠";
      case "spaceagent":
        return "🛸";
      case "mindsphere":
        return "🌌";
      case "terminal-jarvis":
        return "💻";
      default:
        return "🤖";
    }
  }

  static getProviderColor(providerId: string): string {
    switch (providerId) {
      case "anthropic":
        return "text-blue-600 dark:text-blue-400";
      case "openai":
        return "text-green-600 dark:text-green-400";
      case "spaceagent":
        return "text-purple-600 dark:text-purple-400";
      case "mindsphere":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  }

  static isProviderAvailable(providerId: string, userTier: string = "basic"): boolean {
    if (providerId === "mindsphere" && userTier === "basic") {
      return false;
    }
    return true;
  }

  static getProviderCapabilities(providerId: string): string[] {
    const provider = this.getProvider(providerId);
    return provider?.capabilities || [];
  }

  static hasCapability(providerId: string, capability: string): boolean {
    const capabilities = this.getProviderCapabilities(providerId);
    return capabilities.includes(capability);
  }

  static getRecommendedProvider(task: string): string {
    switch (task.toLowerCase()) {
      case "consciousness":
      case "context":
      case "learning":
        return "spaceagent";
      case "architecture":
      case "optimization":
      case "refactoring":
        return "mindsphere";
      case "complexity":
      case "fractal":
      case "recursive":
      case "pattern":
      case "emergence":
        return "complexity";
      case "creative":
      case "brainstorming":
        return "openai";
      default:
        return "anthropic";
    }
  }

  static async testConnection(providerId: string): Promise<boolean> {
    try {
      await this.chat("Hello", providerId);
      return true;
    } catch (error) {
      console.error(`Failed to connect to ${providerId}:`, error);
      return false;
    }
  }

  static getUsageStats(responses: AIResponse[]): {
    totalTokens: number;
    totalCost: number;
    providerBreakdown: Record<string, { tokens: number; cost: number }>;
  } {
    let totalTokens = 0;
    let totalCost = 0;
    const providerBreakdown: Record<string, { tokens: number; cost: number }> = {};

    responses.forEach(response => {
      totalTokens += response.tokensUsed;
      totalCost += parseFloat(response.cost);

      if (!providerBreakdown[response.provider]) {
        providerBreakdown[response.provider] = { tokens: 0, cost: 0 };
      }

      providerBreakdown[response.provider].tokens += response.tokensUsed;
      providerBreakdown[response.provider].cost += parseFloat(response.cost);
    });

    return {
      totalTokens,
      totalCost,
      providerBreakdown,
    };
  }
}
