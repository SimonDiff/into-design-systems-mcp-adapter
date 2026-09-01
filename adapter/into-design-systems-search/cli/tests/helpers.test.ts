import { describe, expect, test } from "bun:test"
import { daysAgoIso, normalizeSearchJob, parseMcpResponse } from "../src/helpers.js"

describe("MCP response parsing", () => {
  test("reads an SSE text-content JSON result", () => {
    const body = 'event: message\ndata: {"jsonrpc":"2.0","result":{"content":[{"type":"text","text":"{\\n  \\"total\\": 1, \\"jobs\\": []\\n}"}]}}\n\n'
    expect(parseMcpResponse(body, "text/event-stream")).toEqual({ total: 1, jobs: [] })
  })

  test("does not convert unknown work type or AI coverage into a fact", () => {
    expect(normalizeSearchJob({ slug: "a-role", title: "Role", company: "Co", posted: "2026-09-01", detailUrl: "https://example.test/jobs/a-role" })).toMatchObject({
      id: "a-role", location: null, workType: null, remote: null, aiSkills: null,
    })
  })

  test("calculates the posting-age boundary in UTC", () => {
    expect(daysAgoIso(14, new Date("2026-09-01T12:00:00Z"))).toBe("2026-08-18")
  })
})
