import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

interface TerminalJarvisResult {
  output: string;
  success: boolean;
  command: string;
  exitCode?: number;
}

interface TerminalJarvisCommand {
  action: string;
  tool?: string;
  args?: string[];
  options?: { [key: string]: string };
}

export class TerminalJarvisService {
  private parseCommand(prompt: string): TerminalJarvisCommand {
    // Parse natural language prompt into terminal-jarvis command
    const lowercasePrompt = prompt.toLowerCase();
    
    // Check for installation commands
    if (lowercasePrompt.includes('install') || lowercasePrompt.includes('setup')) {
      const tool = this.extractTool(prompt);
      return {
        action: 'install',
        tool,
        args: tool ? [tool] : []
      };
    }
    
    // Check for running tools
    if (lowercasePrompt.includes('run') || lowercasePrompt.includes('execute') || lowercasePrompt.includes('use')) {
      const tool = this.extractTool(prompt);
      const args = this.extractArgs(prompt);
      return {
        action: 'run',
        tool,
        args: args
      };
    }
    
    // Check for listing available tools
    if (lowercasePrompt.includes('list') || lowercasePrompt.includes('show') || lowercasePrompt.includes('available')) {
      return {
        action: 'list',
        args: []
      };
    }
    
    // Check for tool information
    if (lowercasePrompt.includes('info') || lowercasePrompt.includes('about') || lowercasePrompt.includes('details')) {
      const tool = this.extractTool(prompt);
      return {
        action: 'info',
        tool,
        args: tool ? [tool] : []
      };
    }
    
    // Check for updating tools
    if (lowercasePrompt.includes('update') || lowercasePrompt.includes('upgrade')) {
      const tool = this.extractTool(prompt);
      return {
        action: 'update',
        tool,
        args: tool ? [tool] : []
      };
    }
    
    // Default to interactive mode
    return {
      action: 'interactive',
      args: []
    };
  }
  
  private extractTool(prompt: string): string | undefined {
    const tools = ['claude', 'gemini', 'qwen', 'opencode'];
    for (const tool of tools) {
      if (prompt.toLowerCase().includes(tool)) {
        return tool;
      }
    }
    return undefined;
  }
  
  private extractArgs(prompt: string): string[] {
    // Extract arguments like --prompt, --file, etc.
    const args: string[] = [];
    
    // Look for quoted strings after keywords
    const promptMatch = prompt.match(/(?:prompt|question|ask)[\s:]+["']([^"']+)["']/i);
    if (promptMatch) {
      args.push('--prompt', promptMatch[1]);
    }
    
    const fileMatch = prompt.match(/(?:file|analyze)[\s:]+([^\s]+)/i);
    if (fileMatch) {
      args.push('--file', fileMatch[1]);
    }
    
    // Look for other common flags
    if (prompt.toLowerCase().includes('analyze')) {
      args.push('--analyze');
    }
    
    if (prompt.toLowerCase().includes('generate')) {
      args.push('--generate');
    }
    
    return args;
  }
  
  async executeCommand(prompt: string, projectId?: number): Promise<TerminalJarvisResult> {
    const command = this.parseCommand(prompt);
    
    // SECURITY FIX: Disable shell execution for safety
    // Until E2B sandbox integration is complete, we provide safe simulated responses
    console.warn(`🚫 SECURITY: Shell execution disabled for TerminalJarvis. Command: ${command.action}`);
    
    try {
      if (command.action === 'interactive') {
        return {
          output: this.getInteractiveHelp(),
          success: true,
          command: 'terminal-jarvis (interactive help)'
        };
      }
      
      // SECURITY: Return simulated safe responses instead of executing shell commands
      return this.getSimulatedResponse(command);
      
    } catch (error: any) {
      const errorMessage = error.message || error.toString();
      
      // Handle common errors with helpful suggestions
      if (errorMessage.includes('ENOENT') || errorMessage.includes('command not found')) {
        return {
          output: `❌ Terminal Jarvis is not available. This might be because:
1. Node.js/NPM is not installed or accessible
2. Network connectivity issues
3. Package installation failed

🔧 Suggested solutions:
- Try installing: npm install -g terminal-jarvis
- Or use npx: npx terminal-jarvis --help
- Check Node.js installation: node --version

Original error: ${errorMessage}`,
          success: false,
          command: command.action,
          exitCode: error.code || 1
        };
      }
      
      if (errorMessage.includes('timeout')) {
        return {
          output: `⏱️ Command timed out after 30 seconds. This might happen with:
- Interactive tools that require user input
- Long-running AI operations
- Network connectivity issues

Try using specific commands instead of interactive mode.`,
          success: false,
          command: command.action,
          exitCode: 124
        };
      }
      
      return {
        output: `❌ Terminal Jarvis Error: ${errorMessage}

🔧 Try these alternatives:
- Use "list" to see available tools
- Use "info <tool>" to get tool information
- Use "install <tool>" to install specific tools`,
        success: false,
        command: command.action,
        exitCode: error.code || 1
      };
    }
  }
  
  private formatOutput(output: string, command: TerminalJarvisCommand): string {
    const header = `🚀 Terminal Jarvis - ${command.action.toUpperCase()}${command.tool ? ` (${command.tool})` : ''}`;
    const separator = '─'.repeat(50);
    
    return `${header}
${separator}

${output}

${separator}
💡 Available commands: install, run, list, info, update
🛠️ Supported tools: claude, gemini, qwen, opencode
📋 Example: "Run claude with prompt 'optimize this function'"`;
  }

  /**
   * SECURITY: Provide simulated responses instead of executing shell commands
   */
  private getSimulatedResponse(command: TerminalJarvisCommand): TerminalJarvisResult {
    switch (command.action) {
      case 'install':
        return {
          output: `🔒 SECURITY MODE: Terminal Jarvis execution disabled
          
${command.tool ? `Tool '${command.tool}' would be installed in a production environment.` : 'Package installation would occur in a production environment.'}

🛡️ Security Notice: Shell execution has been disabled to prevent potential security vulnerabilities. In a production environment with proper sandboxing, this command would:

1. Validate the tool name against an allowlist
2. Execute installation in an isolated sandbox environment  
3. Monitor resource usage and network access
4. Provide detailed logging and audit trails

For development purposes, consider using the built-in AI providers instead.`,
          success: true,
          command: `simulated: install ${command.tool || ''}`,
          exitCode: 0
        };

      case 'run':
        return {
          output: `🔒 SECURITY MODE: Terminal Jarvis execution disabled

${command.tool ? `Tool '${command.tool}' would be executed in a production environment.` : 'Tool execution would occur in a production environment.'}

🛡️ Security Notice: Shell execution has been disabled to prevent potential security vulnerabilities. In a production environment with proper sandboxing, this command would:

1. Validate all parameters and arguments
2. Execute in a secure E2B sandbox environment
3. Limit resource usage and execution time
4. Filter and validate all outputs
5. Provide comprehensive audit logging

For development purposes, use the integrated AI services available through the main application interface.`,
          success: true,
          command: `simulated: run ${command.tool || ''} ${command.args?.join(' ') || ''}`,
          exitCode: 0
        };

      case 'list':
        return {
          output: `🔒 SECURITY MODE: Available Tools (Simulated)

📋 AI Coding Assistants:
• claude - Anthropic's Claude (would require API key)
• gemini - Google's Gemini (would require API key) 
• qwen - Alibaba's Qwen (would require API key)
• opencode - Open source coding assistant

🛡️ Security Notice: In a production environment, these tools would be:
• Validated against security policies
• Executed in isolated sandbox environments
• Monitored for resource usage and security compliance
• Logged for audit purposes

Current Status: Shell execution disabled for security
Alternative: Use the integrated AI providers in the main application`,
          success: true,
          command: 'simulated: list',
          exitCode: 0
        };

      case 'info':
        return {
          output: `🔒 SECURITY MODE: Tool Information (Simulated)

${command.tool ? `Tool: ${command.tool}` : 'General Tool Information'}

🛡️ Security Notice: In a production environment, tool information would include:
• Security compliance status
• Resource requirements and limits
• API access requirements
• Supported features and capabilities
• Security audit results

Current Status: Shell execution disabled for security
Alternative: Use the integrated AI providers in the main application`,
          success: true,
          command: `simulated: info ${command.tool || ''}`,
          exitCode: 0
        };

      case 'update':
        return {
          output: `🔒 SECURITY MODE: Tool Update (Simulated)

${command.tool ? `Tool '${command.tool}' would be updated in a production environment.` : 'Tool updates would be processed in a production environment.'}

🛡️ Security Notice: In a production environment, updates would:
• Verify digital signatures and checksums
• Execute in isolated sandbox environments
• Validate compatibility and security
• Maintain audit logs of all changes
• Provide rollback capabilities

Current Status: Shell execution disabled for security
Alternative: System updates are handled automatically by the platform`,
          success: true,
          command: `simulated: update ${command.tool || ''}`,
          exitCode: 0
        };

      default:
        return {
          output: `🔒 SECURITY MODE: Unknown Command

Command '${command.action}' not recognized.

🛡️ Security Notice: Shell execution has been disabled to prevent potential security vulnerabilities.

Available simulated commands: install, run, list, info, update
Alternative: Use the integrated AI services in the main application`,
          success: false,
          command: `simulated: ${command.action}`,
          exitCode: 1
        };
    }
  }
  
  private getInteractiveHelp(): string {
    return `🚀 Terminal Jarvis - AI Tool Manager

Terminal Jarvis is a unified CLI tool manager for AI coding assistants.

✨ Available Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 TOOL MANAGEMENT
• install <tool>     - Install an AI tool (claude, gemini, qwen, opencode)
• update <tool>      - Update a specific tool
• list               - Show all available tools and their status
• info <tool>        - Get detailed information about a tool

🤖 AI TOOL EXECUTION
• run <tool> <args>  - Execute an AI tool with arguments
• run claude --prompt "Your question here"
• run gemini --file src/main.js
• run qwen --analyze
• run opencode --generate

🛠️ Supported AI Tools:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• claude     - Anthropic's Claude for code assistance
• gemini     - Google's Gemini CLI tool  
• qwen       - Qwen coding assistant
• opencode   - OpenCode AI coding agent

💡 Example Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• "Install Claude for code assistance"
• "Run Gemini to analyze my React component"
• "List all available AI tools"
• "Get info about OpenCode capabilities"
• "Update all tools to latest versions"

🔗 Integration Features:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Multi-AI tool management in one interface
✓ Automatic dependency detection and validation
✓ Smart installation guidance
✓ Interactive T.JARVIS terminal interface
✓ Template management and project initialization

Simply describe what you want to do with any AI tool, and I'll help you execute the right Terminal Jarvis command!`;
  }
}