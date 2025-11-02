#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

// Create MCP server instance
const server = new Server(
  {
    name: "file-search-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Search for keyword in file
async function searchInFile(filePath, keyword, caseSensitive = false) {
  try {
    // Read file content
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");
    const results = [];

    // Search through each line
    const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();
    
    lines.forEach((line, index) => {
      const searchLine = caseSensitive ? line : line.toLowerCase();
      
      if (searchLine.includes(searchKeyword)) {
        results.push({
          lineNumber: index + 1,
          content: line.trim(),
        });
      }
    });

    return {
      filePath,
      keyword,
      totalMatches: results.length,
      matches: results,
    };
  } catch (error) {
    throw new Error(`Error reading file: ${error.message}`);
  }
}

// Handle tool listing request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_file",
        description: "Search for a keyword in a specified file and return all matching lines with line numbers",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Absolute or relative path to the file to search",
            },
            keyword: {
              type: "string",
              description: "The keyword to search for in the file",
            },
            caseSensitive: {
              type: "boolean",
              description: "Whether the search should be case-sensitive (default: false)",
              default: false,
            },
          },
          required: ["filePath", "keyword"],
        },
      },
    ],
  };
});

// Handle tool execution request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "search_file") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const { filePath, keyword, caseSensitive = false } = request.params.arguments;

  if (!filePath || !keyword) {
    throw new Error("Both filePath and keyword are required");
  }

  try {
    // Resolve absolute path
    const absolutePath = path.resolve(filePath);
    
    // Check if file exists
    await fs.access(absolutePath);
    
    // Perform search
    const results = await searchInFile(absolutePath, keyword, caseSensitive);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error.message,
            filePath,
            keyword,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP File Search Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});