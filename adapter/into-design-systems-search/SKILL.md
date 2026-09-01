---
name: into-design-systems-search
description: Search the Into Design Systems MCP job board for open Design System and AI design roles, read a posting, compare hiring signals, or find learning resources.
allowed-tools: Bash(bun run .agents/skills/into-design-systems-search/cli/src/cli.ts *)
---

# Into Design Systems Search

Use this source for Design System and AI design roles curated by Into Design
Systems. The CLI is a small client for its public, read-only MCP server; it does
not scrape the board, require an account, or submit applications.

The shared portal contract treats a missing `enabled` flag as enabled. To opt
out in a local fork, add `enabled: false` to this skill's frontmatter; the code
and protocol contract stay identical.

## Commands

```bash
# Search — all fields are optional, but use a narrow query or country.
bun run .agents/skills/into-design-systems-search/cli/src/cli.ts search \
  --query "design systems" --country Germany --remote remote --jobage 14 --limit 20

# Read one posting by slug or its Into Design Systems detail URL.
bun run .agents/skills/into-design-systems-search/cli/src/cli.ts detail \
  pliant-senior-product-designer-design-systems-m-f-d-jysslr --format plain

# Market and company context.
bun run .agents/skills/into-design-systems-search/cli/src/cli.ts stats
bun run .agents/skills/into-design-systems-search/cli/src/cli.ts companies --min-roles 3

# Learning material for confirmed gaps only.
bun run .agents/skills/into-design-systems-search/cli/src/cli.ts learning \
  --skills "MCP,agentic design systems"
```

`--remote` accepts `remote`, `hybrid`, or `onsite`. A missing work type means
the posting does not state one; it is never treated as onsite. `--jobage` maps
to the server's posting-date filter. The server returns at most 100 results;
use date windows when a result says it was truncated.

## Output and evidence

`search --format json` follows the portable portal contract:

```json
{
  "meta": { "count": 1, "page": 1, "total": 1, "truncated": false },
  "results": [{ "id": "slug", "title": "…", "company": "…", "location": "…", "date": "YYYY-MM-DD", "url": "…" }]
}
```

Use `detail` before making a fit claim. Quote requirements in the posting's own
words, preserve stated salary/currency exactly, and treat absent text, work
arrangement, salary, or company detail as unknown. `find_learning` is for
confirmed AI/agentic gaps only; its empty result is a valid outcome.

## Optional native MCP connection

The CLI works without registering an MCP server. To call the board's tools
directly inside Codex as well, run once:

```bash
codex mcp add ids-jobs --url https://jobs.intodesignsystems.com/mcp
```

Start a new Codex task afterwards so its tools load. Claude Code users can use
the endpoint's own setup command; see [MCP.md](MCP.md). Both clients use the
same public URL and this same CLI remains the portable `/scrape` integration.
