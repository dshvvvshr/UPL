#!/usr/bin/env node
/**
 * Brave Search MCP Server
 *
 * Model Context Protocol server providing Brave Search API tools.
 * This is a separate entry point from the Prime Security framework.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { webSearch, webSearchSchema } from './tools/web-search';
import { localSearch, localSearchSchema } from './tools/local-search';
import { imageSearch, imageSearchSchema } from './tools/image-search';
import { videoSearch, videoSearchSchema } from './tools/video-search';
import { newsSearch, newsSearchSchema } from './tools/news-search';
import { summarizer, summarizerSchema } from './tools/summarizer';
import { loadConfig } from './config';
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
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Brave Search MCP Server running on stdio');
}

main().catch((error: unknown) => {
  console.error('Server error:', error);
  process.exit(1);
});
