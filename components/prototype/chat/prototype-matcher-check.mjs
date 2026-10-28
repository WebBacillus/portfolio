// PROTOTYPE CHECK. Runs the real mock engine and routing matcher over the questions a
// visitor is likely to type, and asserts the shape the knowledge contract requires:
//   - a project question redirects to its own page, never an answer in the transcript
//   - a CV question answers from the CV, and carries a source label
//   - a question outside the scope declines
//   - a skill is only attached to a project that has an approved pairing
//   - an E3 skill never carries a pairing
//   - a redirect repeats the project page's own summary, word for word
//
// Run from the portfolio root:
//   node components/prototype/chat/prototype-matcher-check.mjs
//
// The app's own imports are extensionless, so a resolver hook adds the .ts extension
// rather than changing the source.

import { register } from "node:module"
import { pathToFileURL } from "node:url"

// The hook is registered from this script's own directory, not from the working
// directory, so the check runs the same way from anywhere.
register(pathToFileURL(new URL("./prototype-resolve-hook.mjs", import.meta.url).pathname))

const { PROTOTYPE_ROUTES, E3_SKILLS, findRoute, namedPairings } = await import("./routing-data.ts")
const { mockAnswer } = await import("./mock-engine.ts")

const REDIRECT_CASES = [
  ["Tell me about SE for ML", "/work/se-for-ml"],
  ["What did you build for NECTEC?", "/work/nectec-medical-ai"],
  ["What is SCB Tech X Loan Origination?", "/work/scb-tech-x-loan-origination"],
  ["Tell me about the Scopus project", "/work/scopus-gender-prediction"],
  ["Tell me about ProfanityGuard", "/work/profanity-guard"],
  ["What is Adozoil?", "/work/adozoil"],
  ["Tell me about employee management", "/work/employee-management"],
  ["Tell me about Takluz Leaderboards", "/work/takluz-leaderboards"],
  ["Tell me about Takluz TTS", "/work/takluz-tts"],
  ["What is the monkey massage app?", "/work/monkey-massage"],
  ["Tell me about the Scalable ML Classification Pipeline", "/work/se-for-ml"],
  ["Show me the leaderboard project", "/work/takluz-leaderboards"],
  ["Tell me about the Thai ASR project", "/work/profanity-guard"],
  ["What did you do with RabbitMQ?", null],
  ["What is your MongoDB experience?", null],
  ["Which skills do you list?", null],
  ["What is your current role?", null],
  ["Where did you study?", null],
  ["What did you do at NITMX?", null],
  ["What is the weather today?", null],
  ["Tell me about promptfoo", null],
  ["What is your C++ experience?", null],
  ["Do you know my phone number?", null],
]

let failures = 0

function check(label, ok, detail) {
  if (!ok) failures++
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  ${detail}` : ""}`)
}

console.log("--- project questions redirect to their own page ---")
for (const [question, expectedPath] of REDIRECT_CASES) {
  const route = findRoute(question)
  const actual = route ? route.path : null
  check(
    question.padEnd(52),
    actual === expectedPath,
    `-> ${actual ?? "no redirect"}` +
      (actual === expectedPath ? "" : `   (expected ${expectedPath ?? "no redirect"})`),
  )
}

console.log("\n--- every catalogue project is reachable by its own title ---")
for (const route of PROTOTYPE_ROUTES) {
  const found = findRoute(`Tell me about ${route.title}`)
  check(route.title.padEnd(52), found?.path === route.path, `-> ${found?.path ?? "no redirect"}`)
}

console.log("\n--- every catalogue project is reachable by at least one alias ---")
for (const route of PROTOTYPE_ROUTES) {
  const reachable = route.aliases.some(
    (alias) => findRoute(`Tell me about ${alias}`)?.path === route.path,
  )
  check(route.title.padEnd(52), reachable, reachable ? "-> alias match" : "-> NO alias matched")
}

console.log("\n--- a skill is only paired with a project that has the pairing ---")
for (const route of PROTOTYPE_ROUTES) {
  const pairing = namedPairings(route, `Tell me about ${route.title} using PostgreSQL`)
  const expected = route.skillPairings.includes("PostgreSQL") ? 1 : 0
  check(
    route.title.padEnd(52),
    pairing.length === expected,
    `-> ${pairing.join(", ") || "none"}` +
      (pairing.length === expected ? "" : `   (expected ${expected})`),
  )
}

console.log("\n--- E3 skills never carry a pairing ---")
for (const skill of E3_SKILLS) {
  const pairedSomewhere = PROTOTYPE_ROUTES.some((route) =>
    route.skillPairings.some((p) => p.toLowerCase() === skill.toLowerCase()),
  )
  check(
    skill.padEnd(52),
    !pairedSomewhere,
    pairedSomewhere ? "-> paired somewhere" : "-> list only",
  )
}

console.log("\n--- the answer shape follows the question kind ---")
const SHAPE_CASES = [
  ["Tell me about SE for ML", "redirect", "/work/se-for-ml"],
  ["Which skills did you use for SE for ML?", "redirect", "/work/se-for-ml"],
  ["Which skills do you list?", "answer", null],
  ["What is your current role?", "answer", null],
  ["Where did you study?", "answer", null],
  ["What did you do at NITMX?", "answer", null],
  ["Tell me about promptfoo", "answer", null],
  ["What is the weather today?", "decline", null],
]

for (const [question, shape, path] of SHAPE_CASES) {
  const answer = mockAnswer(question)
  const actualShape = answer.redirect ? "redirect" : answer.declined ? "decline" : "answer"
  const pathOk = path === null || answer.redirect?.path === path
  check(
    question.padEnd(52),
    actualShape === shape && pathOk,
    `-> ${actualShape}${answer.redirect ? ` ${answer.redirect.path}` : ""}` +
      (actualShape === shape && pathOk ? "" : `   (expected ${shape}${path ? ` ${path}` : ""})`),
  )
}

console.log("\n--- a project name that contains a skills word is not a skills question ---")
for (const question of [
  "What is SCB Tech X Loan Origination?",
  "Tell me about the Scalable ML Classification Pipeline",
]) {
  const answer = mockAnswer(question)
  const namesSkills = /it uses/.test(answer.text)
  check(question.padEnd(52), !namesSkills, `-> ${namesSkills ? "named a pairing" : "plain redirect"}`)
}

console.log("\n--- a skills question about a project names that project's pairing ---")
{
  const answer = mockAnswer("Which skills did you use for SE for ML?")
  const route = findRoute("Which skills did you use for SE for ML?")
  const expected = route.skillPairings.join(", ")
  check(
    "SE for ML skills question".padEnd(52),
    answer.text.includes(expected),
    `-> ${answer.text.includes(expected) ? "pairing named" : "pairing missing"}`,
  )
}

console.log("\n--- a project answer carries the source label and the page summary ---")
for (const route of PROTOTYPE_ROUTES) {
  const answer = mockAnswer(`Tell me about ${route.title}`)
  const ok =
    answer.redirect?.path === route.path &&
    answer.redirect?.summary === route.summary &&
    answer.source === "Project page"
  check(
    route.title.padEnd(52),
    ok,
    ok
      ? "-> link, summary, and source label"
      : `-> ${JSON.stringify(answer.redirect?.summary?.slice(0, 40))} / ${answer.source}`,
  )
}

console.log("\n--- a CV answer carries a source label ---")
for (const question of [
  "What is your current role?",
  "Where did you study?",
  "Which skills do you list?",
  "What did you do at NITMX?",
]) {
  const answer = mockAnswer(question)
  check(question.padEnd(52), answer.source === "Resume", `-> source: ${answer.source}`)
}

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`)
process.exit(failures === 0 ? 0 : 1)
