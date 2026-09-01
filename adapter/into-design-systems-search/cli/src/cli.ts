#!/usr/bin/env bun
import { runDetail, normalizeSlug } from "./commands/detail.js"
import { runSearch } from "./commands/search.js"
import { callTool, writeError } from "./helpers.js"

type FlagValue = string | boolean
interface Flags { _: string[]; [key: string]: FlagValue | string[] }

const HELP = `into-design-systems-cli — search public Design System and AI design roles through MCP

USAGE
  bun run src/cli.ts search [flags]
  bun run src/cli.ts detail <slug|detail-url> [--format json|plain]
  bun run src/cli.ts stats [--format json|plain]
  bun run src/cli.ts companies [--min-roles <n>] [--format json|plain]
  bun run src/cli.ts learning --skills "MCP,agentic design systems" [--limit <n>] [--format json|plain]

SEARCH FLAGS
  --query, -q <text>      Free-text title, company, or summary query.
  --country <text>        Country or region from the posting, e.g. Germany.
  --remote <mode>         remote | hybrid | onsite; only explicitly stated work types.
  --jobage <days>         Posted within N whole days.
  --limit, -n <n>         1–100; default 20.
  --format <fmt>          json (default) | table | plain.

This is a read-only client for https://jobs.intodesignsystems.com/mcp. It never applies for a role.
`

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { _: [] }
  const aliases: Record<string, string> = { q: "query", n: "limit" }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg.startsWith("-")) { flags._.push(arg); continue }
    const key = aliases[arg.replace(/^-+/, "")] ?? arg.replace(/^-+/, "")
    const value = argv[index + 1]
    if (!value || value.startsWith("-")) flags[key] = true
    else { flags[key] = value; index += 1 }
  }
  return flags
}

function stringFlag(flags: Flags, key: string): string | undefined {
  return typeof flags[key] === "string" ? flags[key] as string : undefined
}

function numberFlag(flags: Flags, key: string, fallback?: number): number | undefined {
  const value = stringFlag(flags, key)
  if (value === undefined) return fallback
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`--${key} must be a positive whole number`)
  return parsed
}

function formatFlag(flags: Flags, tableAllowed = false): "json" | "table" | "plain" {
  const value = stringFlag(flags, "format") ?? "json"
  const allowed = tableAllowed ? ["json", "table", "plain"] : ["json", "plain"]
  if (!allowed.includes(value)) throw new Error(`--format must be one of ${allowed.join(", ")}`)
  return value as "json" | "table" | "plain"
}

const COMMAND_FLAGS: Record<string, Set<string>> = {
  search: new Set(["query", "country", "remote", "jobage", "limit", "format", "help", "h"]),
  detail: new Set(["format", "help", "h"]),
  stats: new Set(["format", "help", "h"]),
  companies: new Set(["min-roles", "format", "help", "h"]),
  learning: new Set(["skills", "limit", "format", "help", "h"]),
}

function validateFlags(command: string, flags: Flags): void {
  const allowed = COMMAND_FLAGS[command]
  if (!allowed) return
  for (const key of Object.keys(flags)) {
    if (key !== "_" && !allowed.has(key)) throw new Error(`unknown flag --${key} for '${command}'`)
  }
}

async function runAuxiliary(tool: string, args: Record<string, unknown>, format: "json" | "plain"): Promise<number> {
  try {
    const result = await callTool<unknown>(tool, args)
    process.stdout.write(format === "plain" ? JSON.stringify(result, null, 2) + "\n" : JSON.stringify(result, null, 2) + "\n")
    return 0
  } catch (error) {
    writeError(error, "MCP_TOOL_FAILED")
    return 1
  }
}

async function main(): Promise<number> {
  const flags = parseFlags(process.argv.slice(2))
  const command = flags._[0]
  if (!command || flags.help || flags.h) { process.stdout.write(HELP); return command ? 0 : 1 }
  try {
    validateFlags(command, flags)
    if (command === "search") {
      const remote = stringFlag(flags, "remote")
      if (remote && !["remote", "hybrid", "onsite"].includes(remote)) throw new Error("--remote must be remote, hybrid, or onsite")
      const limit = numberFlag(flags, "limit", 20)!
      if (limit > 100) throw new Error("--limit cannot exceed 100")
      return runSearch({ query: stringFlag(flags, "query"), country: stringFlag(flags, "country"), workType: remote as "remote" | "hybrid" | "onsite" | undefined, jobage: numberFlag(flags, "jobage"), limit, format: formatFlag(flags, true) })
    }
    if (command === "detail") {
      const slug = normalizeSlug(flags._[1] ?? "")
      if (!slug) throw new Error("detail requires an Into Design Systems job slug or detail URL")
      return runDetail({ slug, format: formatFlag(flags) as "json" | "plain" })
    }
    if (command === "stats") return runAuxiliary("hiring_stats", {}, formatFlag(flags) as "json" | "plain")
    if (command === "companies") return runAuxiliary("list_companies", { minRoles: numberFlag(flags, "min-roles") }, formatFlag(flags) as "json" | "plain")
    if (command === "learning") {
      const skills = stringFlag(flags, "skills")?.split(",").map((skill) => skill.trim()).filter(Boolean) ?? []
      if (!skills.length) throw new Error("learning requires --skills with one or more comma-separated confirmed gaps")
      const limit = numberFlag(flags, "limit")
      if (limit && limit > 15) throw new Error("--limit cannot exceed 15")
      return runAuxiliary("find_learning", { skills, ...(limit ? { limit } : {}) }, formatFlag(flags) as "json" | "plain")
    }
    throw new Error(`unknown command '${command}'`)
  } catch (error) {
    writeError(error, "BAD_ARGUMENT")
    return 1
  }
}

main().then((code) => process.exit(code)).catch((error) => { writeError(error); process.exit(1) })
