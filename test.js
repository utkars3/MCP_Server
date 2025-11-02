import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import fs from "fs/promises";

// Create a test file
async function createTestFile() {
  const testContent = `This is a test file.
It contains multiple lines.
The word TEST appears here.
JavaScript is awesome!
This line has the word test in lowercase.
Another line with JavaScript keyword.
Final line without the search term.`;

  await fs.writeFile("sample.txt", testContent, "utf-8");
  console.log("✓ Created sample.txt for testing\n");
}

// Test the MCP server
async function testMCPServer() {
  console.log("Starting MCP Server Test...\n");

  // Create test file
  await createTestFile();

  // Spawn the MCP server process
  const serverProcess = spawn("node", ["index.js"], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  // Create client transport
  const transport = new StdioClientTransport({
    command: "node",
    args: ["index.js"],
  });

  // Create MCP client
  const client = new Client(
    {
      name: "test-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    // Connect to server
    await client.connect(transport);
    console.log("✓ Connected to MCP server\n");

    // List available tools
    console.log("=== Listing Tools ===");
    const tools = await client.listTools();
    console.log(JSON.stringify(tools, null, 2));
    console.log("\n");

    // Test 1: Case-insensitive search for "test"
    console.log("=== Test 1: Search for 'test' (case-insensitive) ===");
    const result1 = await client.callTool({
      name: "search_file",
      arguments: {
        filePath: "sample.txt",
        keyword: "test",
        caseSensitive: false,
      },
    });
    console.log(result1.content[0].text);
    console.log("\n");

    // Test 2: Case-sensitive search for "JavaScript"
    console.log("=== Test 2: Search for 'JavaScript' (case-sensitive) ===");
    const result2 = await client.callTool({
      name: "search_file",
      arguments: {
        filePath: "sample.txt",
        keyword: "JavaScript",
        caseSensitive: true,
      },
    });
    console.log(result2.content[0].text);
    console.log("\n");

    // Test 3: Search with no matches
    console.log("=== Test 3: Search for 'Python' (no matches) ===");
    const result3 = await client.callTool({
      name: "search_file",
      arguments: {
        filePath: "sample.txt",
        keyword: "Python",
      },
    });
    console.log(result3.content[0].text);
    console.log("\n");

    // Test 4: Search in non-existent file
    console.log("=== Test 4: Search in non-existent file ===");
    const result4 = await client.callTool({
      name: "search_file",
      arguments: {
        filePath: "nonexistent.txt",
        keyword: "test",
      },
    });
    console.log(result4.content[0].text);
    console.log("\n");

    console.log("✓ All tests completed!");

  } catch (error) {
    console.error("Test error:", error);
  } finally {
    // Close client
    await client.close();
    serverProcess.kill();
    console.log("\n✓ Closed MCP client and server");
  }
}

// Run tests
testMCPServer().catch(console.error);