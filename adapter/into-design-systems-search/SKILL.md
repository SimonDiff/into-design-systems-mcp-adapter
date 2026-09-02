---
name: into-design-systems-search
version: 0.1.0
description: Search and read Into Design Systems job postings through its public MCP endpoint using the ai-job-search portal contract.
enabled: true
allowed-tools: Bash(bun run .agents/skills/into-design-systems-search/cli/src/cli.ts *)
---

# Into Design Systems Search

Use this source for Design System and AI design roles curated by Into Design
Systems. This is an MCP adapter for `ai-job-search`: its Bun CLI calls the
board's public, read-only MCP server and normalises responses into the portal
`search`/`detail` contract.

The CLI is the canonical integration path so `$job-scrape` can deduplicate,
rank, and track results consistently. Do not replace it with page scraping.

## Commands

```bash
# Search — all fields are optional, but use a narrow query or country.
bun run .agents/skills/into-design-systems-search/cli/src/cli.ts search \
  --query "design systems" --country Germany --remote remote --jobage 14 --limit 20

# Read one posting by slug or its Into Design Systems detail URL.
bun run .agents/skills/into-design-systems-search/cli/src/cli.ts detail \
  pliant-senior-product-designer-design-systems-m-f-d-jysslr --format plain
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
arrangement, salary, or company detail as unknown.

For transport details and field normalisation, read
[url-reference.md](url-reference.md).
