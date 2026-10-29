import assert from "node:assert/strict"
import { createServer } from "node:http"
import { spawn } from "node:child_process"

const upstream = createServer(async (request, response) => {
  let body = ""
  for await (const chunk of request) body += chunk
  upstream.calls += 1
  upstream.lastIp = request.headers["x-forwarded-for"]
  upstream.lastToken = request.headers["x-chat-internal-token"]
  if (JSON.parse(body).question === "Force upstream error") {
    response.writeHead(500, { "content-type": "application/json" })
    response.end('{"error":"secret-key-from-upstream","stack":"private path"}')
    return
  }
  response.writeHead(200, { "content-type": "application/json" })
  response.end(JSON.stringify({ kind: "answer", answer: "I study Computer Engineering at Chulalongkorn University.", source: "Resume", model: "internal-only" }))
})
upstream.calls = 0
await new Promise(resolve => upstream.listen(0, "127.0.0.1", resolve))

const server = spawn("./node_modules/.bin/next", ["start", "-p", "3101"], {
  env: { ...process.env, CHAT_API_URL: `http://127.0.0.1:${upstream.address().port}`, CHAT_INTERNAL_TOKEN: "test-internal-token", CHAT_SESSION_SECRET: "test-session-signing-secret" },
  stdio: "ignore", detached: true,
})
const origin = "http://127.0.0.1:3101"
async function ask(question, cookie = "", ip = "192.0.2.11", history = []) {
  const response = await fetch(`${origin}/api/chat`, { method: "POST", headers: { "content-type": "application/json", "cookie": cookie, "x-forwarded-for": ip }, body: JSON.stringify({ question, history }) })
  return { status: response.status, body: await response.json(), cookie: response.headers.get("set-cookie")?.split(";")[0] ?? "" }
}
try {
  for (let i = 0; i < 100; i++) {
    try { await fetch(origin); break } catch { await new Promise(resolve => setTimeout(resolve, 100)) }
  }
  const redirect = await ask("Tell me about SE for ML")
  assert.equal(redirect.body.kind, "redirect")
  assert.equal(upstream.calls, 0, "redirect must not spend a model call")

  const invalid = await ask("   ")
  assert.equal(invalid.status, 422)
  assert.equal(upstream.calls, 0)

  let result = await ask("Where did you study?")
  assert.equal(result.status, 200)
  assert.equal(result.body.source, "Resume")
  assert.equal(result.body.model, undefined, "upstream internals must not reach visitor")
  assert.equal(upstream.lastIp, "192.0.2.11")
  assert.equal(upstream.lastToken, "test-internal-token")
  assert.match(result.cookie, /^portfolio_chat_session=/)

  const hostile = await ask("Force upstream error", result.cookie)
  assert.equal(hostile.status, 502)
  assert.equal(hostile.body.kind, "error")
  assert.doesNotMatch(JSON.stringify(hostile.body), /secret-key-from-upstream|private path/)

  let cookie = result.cookie
  for (let i = 1; i < 30; i++) {
    result = await ask("Where did you study?", cookie)
    assert.equal(result.status, 200, `send ${i + 1}`)
    cookie = result.cookie
  }
  result = await ask("Where did you study?", cookie)
  assert.equal(result.status, 429)
  assert.equal(result.body.kind, "unavailable")
  console.log("Proxy: redirects spend nothing, safe responses, visitor IP, signed session cap")
} finally {
  if (server.pid) process.kill(-server.pid)
  upstream.close()
}
