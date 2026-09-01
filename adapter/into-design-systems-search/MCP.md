# Into Design Systems MCP endpoint

- **Endpoint:** `https://jobs.intodesignsystems.com/mcp`
- **Transport:** Streamable HTTP
- **Authentication:** none
- **Access:** public, read-only
- **Server:** `into-design-systems-jobs` 1.0.0 (live capability check, 2026-09-01)

## Native client configuration

The portable CLI in this skill requires no client registration. Native MCP
configuration is optional and gives conversational agents direct access to the
same five remote tools.

```bash
# Codex CLI — user-level configuration
codex mcp add ids-jobs --url https://jobs.intodesignsystems.com/mcp

# Claude Code — user-level configuration
claude mcp add -s user --transport http ids-jobs https://jobs.intodesignsystems.com/mcp
```

Restart the client / start a new task after registration. Do not send candidate
documents to the MCP server unless you deliberately want it to compare a posting
against them; the source itself is read-only but third-party MCP data handling
still applies.

## Tools

| Tool | Purpose |
| --- | --- |
| `search_jobs` | Search by text, country, remote/work type, AI skills, and posting date. |
| `get_job` | Read one full posting by slug. |
| `hiring_stats` | Current board-wide counts and stated salary ranges. |
| `list_companies` | Companies with open Design System roles. |
| `find_learning` | Recorded sessions covering confirmed AI/agentic skill gaps. |

See [url-reference.md](url-reference.md) for the normalisation and protocol
contract used by the CLI.
