Task 2: MCP Server Development

Objective
To build a Model Context Protocol (MCP) server and implement a tool that searches a keyword inside a file.
Tech & Libraries Used
Node.js - Runtime environment
@modelcontextprotocol/sdk - MCP protocol implementation
MCP Inspector - Visual testing and debugging interface
fs/promises - File system operations for reading files
path - Path resolution
Implementation Summary
Created MCP server named "file-search-server"
Implemented tool: search_file
This tool accepts three parameters:
Parameter
Type
Required
Description
filePath
string
Yes
Relative or absolute path of file to search inside
keyword
string
Yes
Word/phrase that will be searched
caseSensitive
boolean
No
Whether search should be case-sensitive (default: false)

Server reads file contents using fs.readFile(), splits into lines, checks each line with .includes(keyword), and returns all matching lines with line numbers.
Sample Input Used inside MCP Inspector (Tools → Run Tool)
json
{
  "filePath": "sample.txt",
  "keyword": "testing"
}
Expected Output (Screenshots to attach)
If found:
json
{
  "filePath": "/absolute/path/to/sample.txt",
  "keyword": "testing",
  "totalMatches": 2,
  "matches": [
    {
      "lineNumber": 1,
      "content": "This is a testing file."
    },
    {
      "lineNumber": 5,
      "content": "Another line with testing keyword."
    }
  ]
}
If not found:
json
{
  "filePath": "/absolute/path/to/sample.txt",
  "keyword": "testing",
  "totalMatches": 0,
  "matches": []
}
Installation & Running
bash
# Install dependencies
npm install

# Run automated tests
npm test

# Start server
npm start

# Test with MCP Inspector
npx @modelcontextprotocol/inspector node index.js
Project Structure
mcp-file-search-server/
├── package.json          # Dependencies
├── index.js             # MCP server implementation
├── test.js              # Test script
└── README.md            # Documentation
