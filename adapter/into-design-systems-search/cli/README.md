# Into Design Systems CLI

Portable, zero-runtime-dependency Bun client for the public Into Design Systems
Jobs MCP server. It normalises the MCP search result into the job-search portal
contract so Claude's `/scrape`, Codex, and other clients use the same code.

Run `bun run src/cli.ts --help` for commands. The test suite is offline and
only validates parsing/normalisation; live smoke checks are manual and
low-volume because the data source is a changing public service.
