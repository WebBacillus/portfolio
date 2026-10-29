import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import matter from "gray-matter"
import { spawn } from "node:child_process"

const origin = "http://127.0.0.1:3102"
const server = spawn("./node_modules/.bin/next", ["start", "-p", "3102"], { stdio: "ignore", detached: true })

async function ask(question) {
  const response = await fetch(`${origin}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, history: [] }),
  })
  return { status: response.status, ...await response.json() }
}

try {
for (let i = 0; i < 100; i++) {
  try { await fetch(origin); break } catch { await new Promise(resolve => setTimeout(resolve, 100)) }
}

for (const [question, slug] of [
  ["Tell me about SE for ML", "se-for-ml"],
  ["Explain the Scalable ML Classification Pipeline", "se-for-ml"],
  ["What did you build for NECTEC?", "nectec-medical-ai"],
  ["What is SCB Tech X Loan Origination?", "scb-tech-x-loan-origination"],
  ["Explain Takluz TTS", "takluz-tts"],
  ["Tell me about ProfanityGuard", "profanity-guard"],
  ["Show Adozoil", "adozoil"],
  ["Describe Employee Management", "employee-management"],
  ["What is Takluz Leaderboards?", "takluz-leaderboards"],
  ["Tell me about Monkey Massage", "monkey-massage"],
  ["Explain Scopus Gender Prediction", "scopus-gender-prediction"],
]) {
  const result = await ask(question)
  assert.equal(result.status, 200, question)
  const summary = matter(readFileSync(new URL(`../content/projects/${slug}.md`, import.meta.url), "utf8")).data.summary
  assert.equal(result.kind, "redirect", question)
  assert.equal(result.redirect.href, `/work/${slug}`, question)
  assert.equal(result.redirect.summary, summary, question)
  assert.equal(result.source, "Project page", question)
  assert.equal(result.answer, undefined, question)
}

const listOnly = await ask("Which company did you use promptfoo at?")
assert.equal(listOnly.status, 200)
assert.equal(listOnly.kind, "answer")
assert.equal(listOnly.source, "Resume")
assert.match(listOnly.answer, /resume lists promptfoo/i)
assert.doesNotMatch(listOnly.answer, /at True|at NITMX|at SCB/i)
assert.notEqual((await ask("Which skills do you list?")).kind, "redirect")
assert.notEqual((await ask("Did you use MongoDB?")).kind, "redirect")
assert.notEqual((await ask("What is SCBooking?")).kind, "redirect")
console.log("Routing: ten project redirects use exact page summaries; skills do not redirect")
} finally {
  if (server.pid) process.kill(-server.pid)
}
