import { callTool, daysAgoIso, normalizeSearchJob, writeError, type PortalResult } from "../helpers.js"

export interface SearchOpts {
  query?: string
  country?: string
  workType?: "remote" | "hybrid" | "onsite"
  jobage?: number
  limit: number
  format: "json" | "table" | "plain"
}

interface SearchResponse {
  total?: number
  returned?: number
  truncated?: boolean
  truncatedNote?: string
  jobs?: unknown[]
}

function table(rows: PortalResult[]): string {
  if (!rows.length) return "No results."
  const header = ["ID".padEnd(32), "TITLE".padEnd(42), "COMPANY".padEnd(24), "LOCATION".padEnd(28), "DATE"].join(" ")
  return [header, "-".repeat(header.length), ...rows.map((row) => [
    row.id.slice(0, 32).padEnd(32),
    (row.title ?? "—").slice(0, 42).padEnd(42),
    (row.company ?? "—").slice(0, 24).padEnd(24),
    (row.location ?? "—").slice(0, 28).padEnd(28),
    row.date ?? "—",
  ].join(" "))].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const args: Record<string, unknown> = { limit: opts.limit }
    if (opts.query) args.query = opts.query
    if (opts.country) args.country = opts.country
    if (opts.workType) {
      args.workType = opts.workType
      if (opts.workType === "remote") args.remote = true
    }
    if (opts.jobage !== undefined) args.postedAfter = daysAgoIso(opts.jobage)
    const response = await callTool<SearchResponse>("search_jobs", args)
    const results = (response.jobs ?? []).map(normalizeSearchJob).filter((job) => job.id && job.title && job.url)
    if (opts.format === "table") process.stdout.write(table(results) + "\n")
    else if (opts.format === "plain") process.stdout.write(results.map((job) => `${job.title}\n  ${job.company ?? "—"} · ${job.location ?? "—"} · ${job.date ?? "—"}\n  slug: ${job.id}\n  ${job.url}`).join("\n\n") + "\n")
    else process.stdout.write(JSON.stringify({ meta: { count: results.length, page: 1, total: response.total ?? results.length, truncated: Boolean(response.truncated), truncatedNote: response.truncatedNote ?? null }, results }, null, 2) + "\n")
    return 0
  } catch (error) {
    writeError(error, "SEARCH_FAILED")
    return 1
  }
}
