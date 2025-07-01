#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";

const server = new Server(
  {
    name: "mcp-postgres-dump-schema",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "pg_dump_schema",
        description: "Execute pg_dump --schema-only to get database schema",
        inputSchema: {
          type: "object",
          properties: {
            database: {
              type: "string",
              description: "Database name (optional, can use environment variables)",
            },
            host: {
              type: "string", 
              description: "Database host (optional, can use environment variables)",
            },
            port: {
              type: "string",
              description: "Database port (optional, can use environment variables)",
            },
            username: {
              type: "string",
              description: "Database username (optional, can use environment variables)",
            },
            password: {
              type: "string",
              description: "Database password (optional, can use environment variables)",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = (request.params.arguments || {}) as {
    host?: string;
    port?: string;
    database?: string;
    username?: string;
    password?: string;
  };
  
  // Build pg_dump command arguments
  const pgDumpArgs = ["--schema-only", "--no-owner", "--no-privileges"];
  
  // Use environment variables or provided arguments
  const host = args.host || process.env.PGHOST || "localhost";
  const port = args.port || process.env.PGPORT || "5432";
  const database = args.database || process.env.PGDATABASE;
  const username = args.username || process.env.PGUSER;
  const password = args.password || process.env.PGPASSWORD;
  
  if (!database) {
    throw new Error("Database name is required. Set PGDATABASE environment variable or provide 'database' parameter.");
  }
  
  pgDumpArgs.push("--host", host);
  pgDumpArgs.push("--port", port);
  pgDumpArgs.push("--dbname", database);
  
  if (username) {
    pgDumpArgs.push("--username", username);
  }

  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    if (password) {
      env.PGPASSWORD = password;
    }

    const pgDump = spawn("pg_dump", pgDumpArgs, {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    pgDump.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pgDump.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pgDump.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`pg_dump failed with code ${code}: ${stderr}`));
      } else {
        resolve({
          content: [
            {
              type: "text",
              text: stdout,
            },
          ],
        });
      }
    });

    pgDump.on("error", (error) => {
      reject(new Error(`Failed to execute pg_dump: ${error.message}`));
    });
  });
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Postgres Dump Schema server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});