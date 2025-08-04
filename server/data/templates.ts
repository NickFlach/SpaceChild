import type { InsertProjectTemplate } from "@shared/schema";

// Default project templates
export const defaultTemplates: InsertProjectTemplate[] = [
  {
    name: "React + TypeScript Web App",
    description: "Modern React application with TypeScript, Tailwind CSS, and AI-powered assistance",
    category: "web-app",
    techStack: ["react", "typescript", "tailwind", "vite"],
    aiProviders: ["anthropic", "openai", "spaceagent"],
    features: ["responsive-design", "dark-mode", "ai-chat", "component-library"],
    starterFiles: [
      {
        path: "src/App.tsx",
        content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="p-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
          Welcome to Your React App
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          Built with React, TypeScript, and Space Child AI
        </p>
      </header>
      
      <main className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <FeatureCard
            title="AI-Powered"
            description="Integrated with Space Child's AI providers for intelligent assistance"
            icon="🤖"
          />
          <FeatureCard
            title="Type-Safe"
            description="Built with TypeScript for better development experience"
            icon="✨"
          />
          <FeatureCard
            title="Modern UI"
            description="Styled with Tailwind CSS for beautiful, responsive design"
            icon="🎨"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

export default App;`,
        description: "Main React component with Tailwind styling"
      },
      {
        path: "src/App.css",
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
        description: "Tailwind CSS imports"
      },
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + TypeScript App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        description: "HTML entry point"
      },
      {
        path: "src/main.tsx",
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
        description: "React entry point"
      },
      {
        path: "package.json",
        content: `{
  "name": "react-typescript-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}`,
        description: "Package configuration"
      }
    ],
    config: {
      projectType: "web",
      consciousnessEnabled: true,
      superintelligenceEnabled: false,
      defaultAiProvider: "anthropic",
      envVariables: []
    },
    createdBy: "system"
  },
  
  {
    name: "Node.js Express API",
    description: "RESTful API with Express, TypeScript, and database integration",
    category: "api",
    techStack: ["nodejs", "express", "typescript", "postgresql"],
    aiProviders: ["anthropic", "openai"],
    features: ["authentication", "database", "rest-api", "middleware"],
    starterFiles: [
      {
        path: "src/index.ts",
        content: `import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to your Express API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      auth: '/api/auth'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
        description: "Express server entry point"
      },
      {
        path: "package.json",
        content: `{
  "name": "express-api",
  "version": "1.0.0",
  "description": "Express API with TypeScript",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}`,
        description: "Package configuration"
      },
      {
        path: "tsconfig.json",
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`,
        description: "TypeScript configuration"
      },
      {
        path: ".env.example",
        content: `# Server Configuration
PORT=3000

# Database Configuration (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# API Keys (add as needed)
# OPENAI_API_KEY=your-key-here
# ANTHROPIC_API_KEY=your-key-here`,
        description: "Environment variables template"
      }
    ],
    config: {
      projectType: "backend",
      consciousnessEnabled: false,
      superintelligenceEnabled: false,
      defaultAiProvider: "anthropic",
      envVariables: [
        { key: "PORT", description: "Server port", required: false },
        { key: "DATABASE_URL", description: "PostgreSQL connection string", required: false }
      ]
    },
    createdBy: "system"
  },
  
  {
    name: "Full-Stack Web Application",
    description: "Complete web app with React frontend and Express backend, including authentication",
    category: "fullstack",
    techStack: ["react", "nodejs", "express", "typescript", "postgresql", "tailwind"],
    aiProviders: ["anthropic", "openai", "spaceagent", "mindsphere"],
    features: ["authentication", "database", "real-time", "responsive-design", "api"],
    starterFiles: [
      {
        path: "README.md",
        content: `# Full-Stack Web Application

A modern full-stack application built with React, Express, and TypeScript.

## Features

- 🚀 React frontend with TypeScript
- 🔐 Authentication system
- 📊 PostgreSQL database
- 🎨 Tailwind CSS styling
- 🤖 AI integration with Space Child

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   - Copy \`.env.example\` to \`.env\`
   - Add your database URL and API keys

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Project Structure

- \`/client\` - React frontend
- \`/server\` - Express backend
- \`/shared\` - Shared types and utilities`,
        description: "Project documentation"
      }
    ],
    config: {
      projectType: "fullstack",
      consciousnessEnabled: true,
      superintelligenceEnabled: true,
      defaultAiProvider: "spaceagent",
      envVariables: [
        { key: "DATABASE_URL", description: "PostgreSQL connection string", required: true },
        { key: "SESSION_SECRET", description: "Session encryption key", required: true }
      ]
    },
    createdBy: "system"
  },
  
  {
    name: "Machine Learning Python Project",
    description: "Python project setup for machine learning with Jupyter notebooks and common ML libraries",
    category: "ml-model",
    techStack: ["python", "jupyter", "pandas", "scikit-learn", "tensorflow"],
    aiProviders: ["anthropic", "openai"],
    features: ["data-analysis", "visualization", "model-training", "notebooks"],
    starterFiles: [
      {
        path: "main.py",
        content: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns

# Set up visualization style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)

def load_data(file_path):
    """Load data from CSV file."""
    try:
        data = pd.read_csv(file_path)
        print(f"Data loaded successfully: {data.shape}")
        return data
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def explore_data(df):
    """Basic data exploration."""
    print("\\nData Info:")
    print(df.info())
    
    print("\\nFirst 5 rows:")
    print(df.head())
    
    print("\\nStatistical Summary:")
    print(df.describe())
    
    print("\\nMissing Values:")
    print(df.isnull().sum())

def preprocess_data(df, target_column):
    """Basic preprocessing pipeline."""
    # Separate features and target
    X = df.drop(columns=[target_column])
    y = df[target_column]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler

if __name__ == "__main__":
    print("Welcome to your ML project!")
    print("Built with Space Child AI assistance")
    
    # Example usage
    # data = load_data("data.csv")
    # if data is not None:
    #     explore_data(data)`,
        description: "Main Python script for ML workflow"
      },
      {
        path: "requirements.txt",
        content: `pandas==2.0.3
numpy==1.24.3
scikit-learn==1.3.0
matplotlib==3.7.2
seaborn==0.12.2
jupyter==1.0.0
tensorflow==2.13.0
torch==2.0.1
plotly==5.15.0`,
        description: "Python dependencies"
      },
      {
        path: "notebooks/exploration.ipynb",
        content: `{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Data Exploration Notebook\\n",
    "\\n",
    "This notebook is for exploring and understanding your dataset."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "import pandas as pd\\n",
    "import numpy as np\\n",
    "import matplotlib.pyplot as plt\\n",
    "import seaborn as sns\\n",
    "\\n",
    "# Configure visualization\\n",
    "sns.set_style('whitegrid')\\n",
    "%matplotlib inline"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}`,
        description: "Jupyter notebook for data exploration"
      }
    ],
    config: {
      projectType: "library",
      consciousnessEnabled: false,
      superintelligenceEnabled: true,
      defaultAiProvider: "openai",
      envVariables: []
    },
    createdBy: "system"
  },
  
  {
    name: "CLI Tool with Node.js",
    description: "Command-line tool built with Node.js and Commander.js",
    category: "cli",
    techStack: ["nodejs", "typescript", "commander"],
    aiProviders: ["anthropic"],
    features: ["cli-commands", "configuration", "logging"],
    starterFiles: [
      {
        path: "src/index.ts",
        content: `#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../package.json';

const program = new Command();

program
  .name('mycli')
  .description('CLI tool built with Space Child')
  .version(version);

program
  .command('greet <name>')
  .description('Greet someone')
  .option('-e, --enthusiastic', 'Show enthusiasm')
  .action((name, options) => {
    const greeting = options.enthusiastic 
      ? \`Hello \${name}!!!\` 
      : \`Hello \${name}\`;
    console.log(chalk.green(greeting));
  });

program
  .command('info')
  .description('Show system information')
  .action(() => {
    console.log(chalk.blue('System Information:'));
    console.log(\`  Node.js: \${process.version}\`);
    console.log(\`  Platform: \${process.platform}\`);
    console.log(\`  Architecture: \${process.arch}\`);
  });

program.parse();`,
        description: "CLI entry point with Commander.js"
      },
      {
        path: "package.json",
        content: `{
  "name": "mycli",
  "version": "1.0.0",
  "description": "CLI tool built with Space Child",
  "main": "dist/index.js",
  "bin": {
    "mycli": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2"
  }
}`,
        description: "Package configuration for CLI"
      }
    ],
    config: {
      projectType: "cli",
      consciousnessEnabled: false,
      superintelligenceEnabled: false,
      defaultAiProvider: "anthropic",
      envVariables: []
    },
    createdBy: "system"
  },
  {
    name: "Terminal Jarvis AI Hub",
    description: "Multi-AI tool management platform powered by Terminal Jarvis for unified CLI-based AI assistance",
    category: "ai-tools",
    techStack: ["nodejs", "typescript", "terminal-jarvis", "react"],
    aiProviders: ["terminal-jarvis", "anthropic"],
    features: ["multi-ai-management", "cli-interface", "tool-installation", "ai-orchestration"],
    starterFiles: [
      {
        path: "src/index.ts",
        content: `#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { createTerminalInterface } from './terminal-interface.js';

const program = new Command();

console.log(chalk.cyan.bold(\`
╔══════════════════════════════════════════════════════════╗
║                  🚀 AI Tools Hub                         ║
║              Powered by Terminal Jarvis                  ║
╚══════════════════════════════════════════════════════════╝
\`));

program
  .name('ai-hub')
  .description('Multi-AI tool management hub with Terminal Jarvis')
  .version('1.0.0');

program
  .command('interactive')
  .alias('i')
  .description('Launch interactive Terminal Jarvis interface')
  .action(async () => {
    console.log(chalk.blue('🌟 Launching Terminal Jarvis interactive mode...'));
    const child = spawn('npx', ['terminal-jarvis'], { 
      stdio: 'inherit',
      shell: true 
    });
    
    child.on('error', (error) => {
      console.error(chalk.red('❌ Error launching Terminal Jarvis:'), error.message);
      console.log(chalk.yellow('💡 Try: npm install -g terminal-jarvis'));
    });
  });

program
  .command('install <tool>')
  .description('Install an AI coding tool')
  .action(async (tool) => {
    console.log(chalk.blue(\`📦 Installing AI tool: \${tool}\`));
    const child = spawn('npx', ['terminal-jarvis', 'install', tool], { 
      stdio: 'inherit',
      shell: true 
    });
  });

program
  .command('run <tool>')
  .option('-p, --prompt <prompt>', 'Prompt for the AI tool')
  .option('-f, --file <file>', 'File to analyze')
  .description('Run an AI tool with Terminal Jarvis')
  .action(async (tool, options) => {
    const args = ['terminal-jarvis', 'run', tool];
    
    if (options.prompt) {
      args.push('--prompt', options.prompt);
    }
    
    if (options.file) {
      args.push('--file', options.file);
    }
    
    console.log(chalk.blue(\`🤖 Running \${tool} with Terminal Jarvis...\`));
    const child = spawn('npx', args, { 
      stdio: 'inherit',
      shell: true 
    });
  });

program
  .command('list')
  .alias('ls')
  .description('List available AI tools')
  .action(async () => {
    console.log(chalk.blue('📋 Listing available AI tools...'));
    const child = spawn('npx', ['terminal-jarvis', 'list'], { 
      stdio: 'inherit',
      shell: true 
    });
  });

program
  .command('info <tool>')
  .description('Get information about an AI tool')
  .action(async (tool) => {
    console.log(chalk.blue(\`ℹ️  Getting info for: \${tool}\`));
    const child = spawn('npx', ['terminal-jarvis', 'info', tool], { 
      stdio: 'inherit',
      shell: true 
    });
  });

program
  .command('web')
  .description('Launch web interface for Terminal Jarvis')
  .action(async () => {
    console.log(chalk.green('🌐 Starting web interface...'));
    await createTerminalInterface();
  });

program.parse();`,
        description: "Main CLI entry point with Terminal Jarvis integration"
      },
      {
        path: "src/terminal-interface.ts",
        content: `import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { spawn } from 'child_process';
import chalk from 'chalk';

export async function createTerminalInterface() {
  const app = express();
  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.static('public'));

  app.get('/', (req, res) => {
    res.send(\`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminal Jarvis Web Interface</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: #1a1a1a;
            color: #00ff41;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .terminal {
            background: #000;
            border: 2px solid #00ff41;
            border-radius: 10px;
            padding: 20px;
            min-height: 500px;
            overflow-y: auto;
        }
        .input-area {
            display: flex;
            margin-top: 20px;
        }
        .command-input {
            flex: 1;
            background: #1a1a1a;
            color: #00ff41;
            border: 1px solid #00ff41;
            padding: 10px;
            font-family: 'Courier New', monospace;
        }
        .send-btn {
            background: #00ff41;
            color: #000;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            font-weight: bold;
        }
        .output-line {
            margin: 5px 0;
            white-space: pre-wrap;
        }
        .quick-commands {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
        }
        .quick-command {
            background: #333;
            border: 1px solid #00ff41;
            color: #00ff41;
            padding: 10px;
            cursor: pointer;
            text-align: center;
            border-radius: 5px;
        }
        .quick-command:hover {
            background: #00ff41;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Terminal Jarvis Web Interface</h1>
            <p>Multi-AI Tool Management Hub</p>
        </div>
        
        <div class="quick-commands">
            <div class="quick-command" onclick="executeCommand('list')">📋 List Tools</div>
            <div class="quick-command" onclick="executeCommand('install claude')">📦 Install Claude</div>
            <div class="quick-command" onclick="executeCommand('install gemini')">📦 Install Gemini</div>
            <div class="quick-command" onclick="executeCommand('info claude')">ℹ️ Claude Info</div>
            <div class="quick-command" onclick="executeCommand('run claude --prompt \\"Help me optimize code\\"')">🤖 Run Claude</div>
            <div class="quick-command" onclick="executeCommand('update')">🔄 Update All</div>
        </div>
        
        <div class="terminal" id="terminal">
            <div class="output-line">Welcome to Terminal Jarvis Web Interface! 🚀</div>
            <div class="output-line">Type commands below or use quick actions above.</div>
            <div class="output-line">───────────────────────────────────────────────────</div>
        </div>
        
        <div class="input-area">
            <input type="text" class="command-input" id="commandInput" 
                   placeholder="Enter Terminal Jarvis command (e.g., 'list', 'install claude', 'run gemini --help')" 
                   onkeydown="if(event.key==='Enter') sendCommand()">
            <button class="send-btn" onclick="sendCommand()">Send</button>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const terminal = document.getElementById('terminal');
        const commandInput = document.getElementById('commandInput');
        
        function addOutput(text, type = 'info') {
            const line = document.createElement('div');
            line.className = 'output-line';
            line.textContent = text;
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
        }
        
        function executeCommand(command) {
            commandInput.value = command;
            sendCommand();
        }
        
        function sendCommand() {
            const command = commandInput.value.trim();
            if (!command) return;
            
            addOutput('$ ' + command, 'command');
            socket.emit('execute-command', command);
            commandInput.value = '';
        }
        
        socket.on('command-output', (data) => {
            addOutput(data.output);
        });
        
        socket.on('command-error', (data) => {
            addOutput('ERROR: ' + data.error, 'error');
        });
        
        socket.on('command-complete', (data) => {
            addOutput('Command completed (exit code: ' + data.exitCode + ')');
            addOutput('───────────────────────────────────────────────────');
        });
        
        // Focus input on page load
        commandInput.focus();
    </script>
</body>
</html>
    \`);
  });

  io.on('connection', (socket) => {
    console.log(chalk.green('🔗 Client connected to Terminal Jarvis interface'));
    
    socket.on('execute-command', (command) => {
      console.log(chalk.blue(\`📨 Executing: \${command}\`));
      
      const args = command.split(' ');
      const child = spawn('npx', ['terminal-jarvis', ...args], {
        shell: true
      });
      
      child.stdout.on('data', (data) => {
        socket.emit('command-output', { output: data.toString() });
      });
      
      child.stderr.on('data', (data) => {
        socket.emit('command-output', { output: data.toString() });
      });
      
      child.on('close', (code) => {
        socket.emit('command-complete', { exitCode: code });
      });
      
      child.on('error', (error) => {
        socket.emit('command-error', { error: error.message });
      });
    });
    
    socket.on('disconnect', () => {
      console.log(chalk.yellow('🔌 Client disconnected'));
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(chalk.green(\`
🌐 Terminal Jarvis Web Interface running on:
   http://localhost:\${PORT}
   
🚀 Available commands:
   • list - Show available AI tools
   • install <tool> - Install AI tools
   • run <tool> <args> - Execute AI tools
   • info <tool> - Get tool information
   
💡 Quick start: Visit the web interface and use the quick command buttons!
    \`));
  });
}`,
        description: "Web interface for Terminal Jarvis with real-time terminal"
      },
      {
        path: "package.json",
        content: `{
  "name": "terminal-jarvis-hub",
  "version": "1.0.0",
  "description": "Multi-AI tool management hub powered by Terminal Jarvis",
  "main": "dist/index.js",
  "type": "module",
  "bin": {
    "ai-hub": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "ts-node-esm src/index.ts",
    "start": "node dist/index.js",
    "web": "npm run build && node dist/index.js web",
    "jarvis": "npx terminal-jarvis"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "chalk": "^5.3.0",
    "express": "^4.18.2",
    "socket.io": "^4.7.4",
    "terminal-jarvis": "latest"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/express": "^4.17.21",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2"
  },
  "keywords": [
    "ai",
    "terminal-jarvis",
    "cli",
    "claude",
    "gemini",
    "qwen",
    "opencode",
    "ai-tools"
  ]
}`,
        description: "Package configuration with Terminal Jarvis integration"
      },
      {
        path: "README.md",
        content: `# Terminal Jarvis AI Hub 🚀

A comprehensive multi-AI tool management platform powered by Terminal Jarvis, providing unified access to multiple CLI-based AI coding assistants.

## Features

### 🤖 Multi-AI Tool Support
- **Claude** - Anthropic's advanced code assistance
- **Gemini** - Google's powerful CLI tool
- **Qwen** - Intelligent coding assistant  
- **OpenCode** - Terminal-native AI coding agent

### 🛠️ Management Capabilities
- One-click tool installation and updates
- Real-time tool status monitoring
- Interactive web interface
- Command-line interface
- Smart dependency detection

### 🌐 Interface Options
- **CLI Mode**: Traditional command-line interface
- **Interactive Mode**: Terminal Jarvis's native T.JARVIS interface
- **Web Interface**: Browser-based terminal with real-time updates

## Quick Start

### Installation
\`\`\`bash
npm install
npm run build
\`\`\`

### Usage Options

#### 1. Command Line Interface
\`\`\`bash
# List available AI tools
npm run start list

# Install specific tools
npm run start install claude
npm run start install gemini

# Run AI tools
npm run start run claude --prompt "Optimize this function"
npm run start run gemini --file src/main.js

# Get tool information
npm run start info claude
\`\`\`

#### 2. Interactive Terminal Jarvis
\`\`\`bash
npm run start interactive
\`\`\`

#### 3. Web Interface
\`\`\`bash
npm run web
# Opens at http://localhost:3000
\`\`\`

#### 4. Direct Terminal Jarvis
\`\`\`bash
npm run jarvis
\`\`\`

## Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| \`list\` | Show all available tools | \`ai-hub list\` |
| \`install <tool>\` | Install an AI tool | \`ai-hub install claude\` |
| \`run <tool>\` | Execute an AI tool | \`ai-hub run claude -p "Help me code"\` |
| \`info <tool>\` | Get tool information | \`ai-hub info gemini\` |
| \`interactive\` | Launch Terminal Jarvis | \`ai-hub interactive\` |
| \`web\` | Start web interface | \`ai-hub web\` |

## Web Interface Features

The web interface provides:
- 🖥️ Real-time terminal emulation
- ⚡ Quick command buttons
- 📊 Live command output
- 🔄 Automatic tool status updates
- 💻 Cross-platform compatibility

## AI Tools Integration

### Claude (Anthropic)
\`\`\`bash
ai-hub run claude --prompt "Review this code for security issues"
\`\`\`

### Gemini (Google)
\`\`\`bash
ai-hub run gemini --file src/component.jsx
\`\`\`

### Qwen
\`\`\`bash
ai-hub run qwen --analyze
\`\`\`

### OpenCode
\`\`\`bash
ai-hub run opencode --generate
\`\`\`

## Architecture

This hub acts as a unified interface to Terminal Jarvis, which manages:
- Tool installation and updates
- Cross-platform compatibility
- Dependency management
- Error handling and recovery

## Development

### Project Structure
\`\`\`
src/
├── index.ts              # Main CLI entry point
├── terminal-interface.ts # Web interface server
└── ...

dist/                     # Compiled JavaScript
public/                   # Static web assets
\`\`\`

### Scripts
- \`npm run dev\` - Development mode with hot reload
- \`npm run build\` - Compile TypeScript
- \`npm run start\` - Run the compiled application
- \`npm run web\` - Start web interface
- \`npm run jarvis\` - Direct Terminal Jarvis access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with multiple AI tools
5. Submit a pull request

## License

MIT License - See LICENSE file for details.

---

**Powered by Terminal Jarvis** - The ultimate AI tool manager for developers! 🚀`,
        description: "Comprehensive documentation for Terminal Jarvis hub"
      }
    ],
    config: {
      projectType: "ai-tools",
      consciousnessEnabled: true,
      superintelligenceEnabled: false,
      defaultAiProvider: "terminal-jarvis",
      envVariables: ["PORT"]
    },
    createdBy: "system"
  }
];