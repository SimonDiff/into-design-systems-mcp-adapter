import { expect, test } from "bun:test"
import { join } from "path"

const cli = join(import.meta.dir, "../src/cli.ts")

async function run(args: string[]) {
  const process = Bun.spawn(["bun", "run", cli, ...args], { stdout: "pipe", stderr: "pipe" })
  return { code: await process.exited, stdout: await new Response(process.stdout).text(), stderr: await new Response(process.stderr).text() }
}

test("rejects unknown search flags before making a network call", async () => {
  const result = await run(["search", "--unknown-filter", "x"])
  expect(result.code).toBe(1)
  expect(JSON.parse(result.stderr).code).toBe("BAD_ARGUMENT")
})

test("rejects a detail input that is not a board slug or detail URL", async () => {
  const result = await run(["detail", "https://example.test/not-a-job"])
  expect(result.code).toBe(1)
  expect(JSON.parse(result.stderr).error).toContain("detail requires")
})
