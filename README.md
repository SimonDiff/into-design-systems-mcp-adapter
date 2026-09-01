![AI Job Search × Into Design Systems MCP](assets/ids-mcp-integration.png)

# Into Design Systems MCP adapter for ai-job-search

A portable job-source adapter for [Into Design Systems Jobs](https://jobs.intodesignsystems.com/mcp), built to plug into [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search).

It searches design-systems, product-design, and AI-adjacent roles through the Into Design Systems read-only MCP server, then emits the normalized job records expected by ai-job-search. The shared Bun CLI is deliberately independent of a single AI client: the same adapter can be used from Claude Code or Codex.

## What it does

- Searches the Into Design Systems board with keywords, country, company, date, and result-limit filters.
- Fetches full details for a specific job URL or ID.
- Normalizes results to the ai-job-search job-record shape.
- Keeps job research separate from applying: it never fills forms or submits applications.

The public service is free, requires no account or API key, and is read-only. Its availability and result quality remain the responsibility of Into Design Systems.

## Credits

- **Sil Bormüller** ([silships](https://github.com/silships)) created the Into Design Systems Jobs MCP service that powers this adapter.
- Read Sil's [MCP Design Job Board announcement](https://intodesignsystems.substack.com/p/mcp-design-job-board) and explore the [Into Design Systems job board](https://jobs.intodesignsystems.com/).
- This adapter follows the skill and normalized-record conventions of [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search).

I have no affiliation with Into Design Systems or Sil Bormüller. I built this independently for my own private job-search workflow, then decided to share it in case it is useful to other designers.

## Install in ai-job-search

Clone this repository locally, then copy the adapter into an existing ai-job-search checkout:

```bash
cp -R adapter/into-design-systems-search \
  /path/to/ai-job-search/.agents/skills/
```

The source is intentionally visible under `adapter/` so the copy target is unambiguous. In the target repository, it must end up at:

```text
.agents/skills/into-design-systems-search/
```

Then search through the normal job-search workflow. In Codex, select or type the exact skill name `into-design-systems-search`; in Claude Code, invoke the same skill from the repository. Both clients use the same CLI and data contract.

## Direct MCP access (optional)

The adapter calls the public endpoint itself, so client-level MCP configuration is optional. If you also want the board's native tools directly in your AI client, configure this streamable-HTTP endpoint:

```text
https://jobs.intodesignsystems.com/mcp
```

For example, Codex supports:

```bash
codex mcp add ids-jobs --url https://jobs.intodesignsystems.com/mcp
```

Follow your Claude client's MCP settings for an HTTP/streamable-HTTP server using that same URL. Direct client access and this adapter can coexist.

## Adapter commands

From the copied skill's `cli/` folder:

```bash
bun run src/cli.ts search --query "design systems" --country Germany --limit 10 --format json
bun run src/cli.ts detail "https://jobs.intodesignsystems.com/jobs/example" --format json
```

Run `bun run src/cli.ts --help` for all flags. The skill instructions and field mapping are in [adapter/into-design-systems-search/SKILL.md](adapter/into-design-systems-search/SKILL.md) and [MCP.md](adapter/into-design-systems-search/MCP.md).

## Compatibility and scope

- Runtime: Bun 1.0+.
- Host workflow: ai-job-search's isolated portal-skill architecture.
- AI clients: Codex and Claude Code, through one portable skill and CLI.
- No browser scraping, authentication, automatic form filling, or automatic submission.

This repository is a community adapter. It is not affiliated with or endorsed by Into Design Systems, Sil Bormüller, Mads Lorentzen, Anthropic, or OpenAI.

## Attribution and license

Released under the [MIT License](LICENSE). The adapter follows the conventions and normalized record contract of [ai-job-search](https://github.com/MadsLorentzen/ai-job-search), whose copyright notice is retained. The job data comes from the [Into Design Systems MCP service](https://jobs.intodesignsystems.com/mcp); please follow its terms and use it responsibly.

## Contributing

Contributions are welcome: bug reports, field-mapping fixes, test cases, documentation improvements, and compatibility feedback are all useful. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request. Never include candidate data, saved searches, application records, credentials, or other personal information.
