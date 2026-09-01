import { callTool, writeError } from "../helpers.js"

export interface DetailOpts { slug: string; format: "json" | "plain" }

export function normalizeSlug(input: string): string | null {
  if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(input)) return input
  const match = input.match(/\/jobs\/([a-z0-9-]+)/i)
  return match?.[1] ?? null
}

function plain(value: unknown): string {
  if (!value || typeof value !== "object") return String(value)
  const job = value as Record<string, unknown>
  const title = typeof job.title === "string" ? job.title : "Untitled role"
  const company = typeof job.company === "string" ? job.company : "—"
  const location = typeof job.city === "string" ? job.city : typeof job.country === "string" ? job.country : "—"
  const summary = typeof job.summary === "string" ? job.summary : ""
  const requirements = Array.isArray(job.requirements) ? job.requirements.map(String).join("\n") : ""
  const salary = typeof job.salary === "string" ? job.salary : ""
  return [title, `${company} · ${location}`, salary ? `Salary: ${salary}` : "", "", summary, requirements ? `Requirements:\n${requirements}` : ""].filter(Boolean).join("\n")
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    const job = await callTool<unknown>("get_job", { slug: opts.slug })
    process.stdout.write(opts.format === "plain" ? plain(job) + "\n" : JSON.stringify(job, null, 2) + "\n")
    return 0
  } catch (error) {
    writeError(error, "DETAIL_FAILED")
    return 1
  }
}
