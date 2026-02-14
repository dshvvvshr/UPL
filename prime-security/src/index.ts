/**
 * Prime Security - Main Entry Point
 * 
 * Bootstraps the self-organizing multi-agent security framework
 * based on the Core Directive and system blueprint (digital DNA).
 */

import { registry, Module } from './registry';
import { DNAManager } from './autonomic/dna';
import { auditLogger, complianceChecker, AuditLevel } from './governance/compliance';
import * as crypto from './security/crypto';

export class PrimeSecurity {
  private dnaManager: DNAManager;
  private initialized: boolean = false;
  private started: boolean = false;

  constructor() {
    this.dnaManager = new DNAManager();
  }

  /**
   * Initialize the system from blueprint
   */
  async initialize(blueprintJson?: string): Promise<void> {
    auditLogger.log(AuditLevel.INFO, 'system', 'initialize', {
      message: 'Starting Prime Security initialization',
    });

    try {
      // Load blueprint
      if (blueprintJson) {
        this.dnaManager.import(blueprintJson);
      } else {
        this.dnaManager.load(DNAManager.createMinimal());
      }

      auditLogger.log(AuditLevel.INFO, 'system', 'blueprint-loaded', {
        version: this.dnaManager.getBlueprint()?.version,
      });

      // Register core modules
      this.registerCoreModules();

      // Initialize all modules
      await registry.initializeAll();

      // Run compliance checks
      const isCompliant = await complianceChecker.isCompliant();
      if (!isCompliant) {
        throw new Error('System failed Core Directive compliance checks');
      }

      this.initialized = true;

      auditLogger.log(AuditLevel.INFO, 'system', 'initialized', {
        message: 'Prime Security successfully initialized',
      });
    } catch (error) {
      auditLogger.log(AuditLevel.CRITICAL, 'system', 'initialization-failed', {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Start the system
   */
  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('System must be initialized before starting');
    }

    auditLogger.log(AuditLevel.INFO, 'system', 'start', {
      message: 'Starting all modules',
    });

    await registry.startAll();

    this.started = true;

    auditLogger.log(AuditLevel.INFO, 'system', 'started', {
      message: 'Prime Security is now running',
    });
  }

  /**
   * Stop the system gracefully
   */
  async stop(): Promise<void> {
    auditLogger.log(AuditLevel.INFO, 'system', 'stop', {
      message: 'Stopping all modules',
    });

    await registry.stopAll();

    this.started = false;

    await registry.stopAll();

    auditLogger.log(AuditLevel.INFO, 'system', 'stopped', {
      message: 'Prime Security has been stopped',
    });
  }

  /**
   * Get system status
   */
  getStatus(): {
    initialized: boolean;
    started: boolean;
    modules: Array<{ name: string; version: string; state: string }>;
    auditEventCount: number;
  } {
    return {
      initialized: this.initialized,
      started: this.started,
      modules: registry.list(),
      auditEventCount: auditLogger.count(),
    };
  }

  /**
   * Register core modules
   */
  private registerCoreModules(): void {
    const securityModule: Module = {
      name: 'core-security',
      version: '0.1.0',
      init: async () => {
        auditLogger.log(AuditLevel.INFO, 'core-security', 'init', {
          message: 'Security module initialized',
        });
      },
      start: async () => {
        auditLogger.log(AuditLevel.INFO, 'core-security', 'start', {
          message: 'Security services started',
        });
      },
    };

    const governanceModule: Module = {
      name: 'governance',
      version: '0.1.0',
      dependencies: ['core-security'],
      init: async () => {
        auditLogger.log(AuditLevel.INFO, 'governance', 'init', {
          message: 'Governance module initialized',
        });
      },
      start: async () => {
        auditLogger.log(AuditLevel.INFO, 'governance', 'start', {
          message: 'Governance services started',
        });
      },
    };

    registry.register(securityModule);
    registry.register(governanceModule);
  }
}

// Export main classes and utilities
export { registry, Module, ModuleState } from './registry';
export { DNAManager, SystemBlueprint } from './autonomic/dna';
export { auditLogger, complianceChecker, AuditLevel } from './governance/compliance';
export { crypto };

// Create and export default instance
export const primeSecurity = new PrimeSecurity();
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { webSearch, webSearchSchema } from './tools/web-search.js';
import { localSearch, localSearchSchema } from './tools/local-search.js';
import { imageSearch, imageSearchSchema } from './tools/image-search.js';
import { videoSearch, videoSearchSchema } from './tools/video-search.js';
import { newsSearch, newsSearchSchema } from './tools/news-search.js';
import { summarizer, summarizerSchema } from './tools/summarizer.js';
import { loadConfig } from './config.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Load configuration
const config = loadConfig();

// Create MCP server
const server = new Server(
  {
    name: 'brave-search-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools = [
  {
    name: 'brave_web_search',
    description: 'Search the web using Brave Search. Returns web results with titles, URLs, and descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'The search query' },
        country: { type: 'string', description: 'Country code (e.g., US, GB)' },
        search_lang: { type: 'string', description: 'Search language (e.g., en, es)' },
        count: { type: 'number', description: 'Number of results (1-20)', minimum: 1, maximum: 20 },
        offset: { type: 'number', description: 'Pagination offset', minimum: 0 },
        safesearch: { type: 'string', enum: ['off', 'moderate', 'strict'], description: 'Safe search level' },
        freshness: { type: 'string', description: 'Time filter (e.g., pd, pw, pm, py)' },
      },
      required: ['q'],
    },
  },
  {
    name: 'brave_local_search',
    description: 'Search for local businesses and places using Brave Search.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'The search query for local businesses' },
        count: { type: 'number', description: 'Number of results (1-20)', minimum: 1, maximum: 20 },
      },
      required: ['q'],
    },
  },
  {
    name: 'brave_image_search',
    description: 'Search for images using Brave Search. Returns image URLs and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'The search query for images' },
        count: { type: 'number', description: 'Number of results (1-150)', minimum: 1, maximum: 150 },
        safesearch: { type: 'string', enum: ['off', 'moderate', 'strict'], description: 'Safe search level' },
      },
      required: ['q'],
    },
  },
  {
    name: 'brave_video_search',
    description: 'Search for videos using Brave Search. Returns video URLs and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'The search query for videos' },
        count: { type: 'number', description: 'Number of results (1-20)', minimum: 1, maximum: 20 },
        safesearch: { type: 'string', enum: ['off', 'moderate', 'strict'], description: 'Safe search level' },
      },
      required: ['q'],
    },
  },
  {
    name: 'brave_news_search',
    description: 'Search for news articles using Brave Search. Returns recent news with sources.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'The search query for news' },
        count: { type: 'number', description: 'Number of results (1-20)', minimum: 1, maximum: 20 },
        freshness: { type: 'string', description: 'Time filter (e.g., pd, pw, pm)' },
      },
      required: ['q'],
    },
  },
  {
    name: 'brave_summarizer',
    description: 'Get an AI-generated summary for a search query using Brave Search Summarizer API.',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'The summarizer key or search query' },
        entity_info: { type: 'boolean', description: 'Include entity information' },
      },
      required: ['key'],
    },
  },
];

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'brave_web_search': {
        const validatedArgs = webSearchSchema.parse(args);
        return await webSearch(validatedArgs, config.braveApiKey);
      }
      case 'brave_local_search': {
        const validatedArgs = localSearchSchema.parse(args);
        return await localSearch(validatedArgs, config.braveApiKey);
      }
      case 'brave_image_search': {
        const validatedArgs = imageSearchSchema.parse(args);
        return await imageSearch(validatedArgs, config.braveApiKey);
      }
      case 'brave_video_search': {
        const validatedArgs = videoSearchSchema.parse(args);
        return await videoSearch(validatedArgs, config.braveApiKey);
      }
      case 'brave_news_search': {
        const validatedArgs = newsSearchSchema.parse(args);
        return await newsSearch(validatedArgs, config.braveApiKey);
      }
      case 'brave_summarizer': {
        const validatedArgs = summarizerSchema.parse(args);
        return await summarizer(validatedArgs, config.braveApiKey);
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
    throw error;
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Brave Search MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
