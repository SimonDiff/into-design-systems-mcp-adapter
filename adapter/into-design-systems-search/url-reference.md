# Into Design Systems MCP adapter reference

This adapter exists to connect the Into Design Systems jobs MCP server to the
`ai-job-search` portal contract. It intentionally exposes only `search` and
`detail`; the server's other tools are outside the job-portal workflow.

## Source

- `POST https://jobs.intodesignsystems.com/mcp`
- Request headers: `Content-Type: application/json`, `Accept: application/json, text/event-stream`
- JSON-RPC 2.0 over Streamable HTTP. The server may return `text/event-stream`;
  the CLI reads its `data:` JSON message.
- Live verified: 2026-09-02, server protocol `2025-03-26`, server name
  `into-design-systems-jobs`, version `1.0.0`.

## Methods and normalisation

| CLI command | MCP tool | Request | Result |
| --- | --- | --- | --- |
| `search` | `search_jobs` | `query`, `country`, `remote`, `workType`, `postedAfter`, `limit` | Normalised portal results: `id`, `title`, `company`, `location`, `date`, `url`, plus source metadata |
| `detail` | `get_job` | `slug` | Full posting object; JSON is preserved and plain text is formatted for review |

`search_jobs` returns a text-content block containing JSON with `total`,
`returned`, `truncated`, and `jobs`. Search fields observed live: `title`,
`company`, `city`, `country`, `remote`, `workType`, `aiSkills`,
`postingTextAvailable`, `posted`, `applyUrl`, `detailUrl`, `slug`, and `summary`.
Only map a missing value to `null`; never infer it from another field.

## Operational constraints

- The service is read-only and exposes public listings. It never applies to a
  job.
- The adapter calls MCP directly and does not scrape board pages.
- `workType` is absent when the posting does not state an arrangement. Do not
  classify that as onsite.
- `aiSkills: false` only means the server has posting text and found no AI
  skill; listings without posting text are unknown, not false.
- `listingExpires` from `get_job` is board expiry metadata, not an employer
  deadline.
- A truncated search must be narrowed by date windows; there is no offset page.
- Transient `429` and `5xx` responses are retried three times with exponential
  backoff. Network failures and other HTTP errors fail immediately so one source
  cannot stall the wider multi-portal search.
