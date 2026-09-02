export const MCP_URL = "https://jobs.intodesignsystems.com/mcp"

export interface PortalResult {
  id: string
  title: string | null
  company: string | null
  location: string | null
  date: string | null
  url: string | null
  detailUrl: string | null
  workType: string | null
  remote: boolean | null
  aiSkills: boolean | null
  postingTextAvailable: boolean | null
  summary: string | null
}

export class McpProtocolError extends Error {
  constructor(message: string, public readonly code = "MCP_PROTOCOL_ERROR") {
    super(message)
  }
}

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 500

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null
}

function parseEventStream(body: string): unknown {
  const data = body
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean)
    .at(-1)
  if (!data) throw new McpProtocolError("MCP response contained no data event")
  return JSON.parse(data)
}

export function parseMcpResponse(body: string, contentType = ""): unknown {
  const payload = contentType.includes("text/event-stream") ? parseEventStream(body) : JSON.parse(body)
  const message = asRecord(payload)
  if (message.error) {
    const error = asRecord(message.error)
    throw new McpProtocolError(asString(error.message) ?? "MCP returned an error", String(error.code ?? "MCP_ERROR"))
  }
  const result = asRecord(message.result)
  const content = Array.isArray(result.content) ? result.content : []
  const text = content.map(asRecord).find((item) => item.type === "text")
  const raw = asString(text?.text)
  if (!raw) throw new McpProtocolError("MCP result contained no text JSON payload")
  return JSON.parse(raw)
}

export async function callTool<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const requestBody = JSON.stringify({
    jsonrpc: "2.0",
    id: crypto.randomUUID(),
    method: "tools/call",
    params: { name, arguments: args },
  })
  let delay = INITIAL_RETRY_DELAY_MS

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    let response: Response
    try {
      response = await fetch(MCP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: requestBody,
        signal: AbortSignal.timeout(20_000),
      })
    } catch (error) {
      throw new McpProtocolError(
        `Could not reach Into Design Systems MCP (${error instanceof Error ? error.message : String(error)})`,
        "MCP_NETWORK_ERROR",
      )
    }

    if (response.status === 429 || response.status >= 500) {
      if (attempt === MAX_RETRIES) {
        throw new McpProtocolError(
          `MCP HTTP ${response.status}: ${response.statusText}`,
          "MCP_HTTP_ERROR",
        )
      }
      await sleep(delay)
      delay *= 2
      continue
    }

    const body = await response.text()
    if (!response.ok) {
      throw new McpProtocolError(
        `MCP HTTP ${response.status}: ${body.slice(0, 240)}`,
        "MCP_HTTP_ERROR",
      )
    }
    return parseMcpResponse(body, response.headers.get("content-type") ?? "") as T
  }

  throw new McpProtocolError("MCP request failed after retries", "MCP_HTTP_ERROR")
}

export function normalizeSearchJob(value: unknown): PortalResult {
  const job = asRecord(value)
  const city = asString(job.city)
  const country = asString(job.country)
  return {
    id: asString(job.slug) ?? "",
    title: asString(job.title),
    company: asString(job.company),
    location: [city, country].filter(Boolean).join(" · ") || null,
    date: asString(job.posted),
    url: asString(job.applyUrl) ?? asString(job.detailUrl),
    detailUrl: asString(job.detailUrl),
    workType: asString(job.workType),
    remote: asBoolean(job.remote),
    aiSkills: asBoolean(job.aiSkills),
    postingTextAvailable: asBoolean(job.postingTextAvailable),
    summary: asString(job.summary),
  }
}

export function writeError(error: unknown, fallbackCode = "INTERNAL_ERROR"): void {
  const message = error instanceof Error ? error.message : String(error)
  const code = error instanceof McpProtocolError ? error.code : fallbackCode
  process.stderr.write(JSON.stringify({ error: message, code }) + "\n")
}

export function daysAgoIso(days: number, now = new Date()): string {
  const date = new Date(now)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}
