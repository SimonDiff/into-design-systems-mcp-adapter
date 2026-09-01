# Into Design Systems MCP protocol reference

## Source

- `POST https://jobs.intodesignsystems.com/mcp`
- Request headers: `Content-Type: application/json`, `Accept: application/json, text/event-stream`
- JSON-RPC 2.0 over Streamable HTTP. The server may return `text/event-stream`;
  the CLI reads its `data:` JSON message.
- Live verified: 2026-09-01, server protocol `2025-03-26`, server name
  `into-design-systems-jobs`, version `1.0.0`.

## Methods and normalisation

| CLI command | MCP method/tool | Request | Normalised result |
| --- | --- | --- | --- |
| `search` | `tools/call` / `search_jobs` | `query`, `country`, `remote`, `workType`, `postedAfter`, `limit` | `id`/`slug`, `title`, `company`, `location`, `date`/`posted`, `url`/`applyUrl` |
| `detail` | `tools/call` / `get_job` | `slug` | full posting object, untouched except output formatting |
| `stats` | `tools/call` / `hiring_stats` | none | board statistics |
| `companies` | `tools/call` / `list_companies` | `minRoles` | company groups |
| `learning` | `tools/call` / `find_learning` | `skills`, `limit` | matching recorded sessions |

`search_jobs` returns a text-content block containing JSON with `total`,
`returned`, `truncated`, and `jobs`. Search fields observed live: `title`,
`company`, `city`, `country`, `remote`, `workType`, `aiSkills`,
`postingTextAvailable`, `posted`, `applyUrl`, `detailUrl`, `slug`, and `summary`.
Only map a missing value to `null`; never infer it from another field.

## Operational constraints

- The service is read-only and exposes public listings. It never applies to a
  job.
- `workType` is absent when the posting does not state an arrangement. Do not
  classify that as onsite.
- `aiSkills: false` only means the server has posting text and found no AI
  skill; listings without posting text are unknown, not false.
- `listingExpires` from `get_job` is board expiry metadata, not an employer
  deadline.
- A truncated search must be narrowed by date windows; there is no offset page.
