// PROTOTYPE ONLY. A mock chat engine so the UI variants can be judged without a backend.
// It encodes the behaviors the knowledge contract requires, so the human can react to the
// real interaction shape: CV answers with a source label, project redirects, the in
// progress label, and the three failure states.
//
// It is a mock. It does not call a model. The strings here are placeholders that show the
// shape of an answer, not approved copy.

import { E3_SKILLS, findRoute, namedPairings, type PrototypeRoute } from "./routing-data"

export type SourceLabel = "Resume" | "About page" | "Project page" | "In progress"

export type ChatRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  source?: SourceLabel
  /** Set when the assistant is handing the visitor to a project page. */
  redirect?: { title: string; path: string; summary: string }
  /** Set when the assistant must state that a claim is not documented. */
  declined?: boolean
}

export type ChatStatus = "idle" | "loading" | "error" | "unavailable"

export type MockTrigger = "normal" | "error" | "unavailable"

/** The next send produces this state instead of an answer. Used by the state demo buttons. */
let pendingTrigger: MockTrigger = "normal"

export function setPendingTrigger(trigger: MockTrigger) {
  pendingTrigger = trigger
}

export function consumePendingTrigger(): MockTrigger {
  const trigger = pendingTrigger
  pendingTrigger = "normal"
  return trigger
}

/**
 * The suggested questions a visitor is offered. These are the CV topics the contract
 * allows, so the narrow scope is visible before anything is typed. The project questions
 * are separate and labelled, because a project question must land on a page, not in
 * the transcript.
 */
export const CV_SUGGESTED_QUESTIONS = [
  "What is your current role?",
  "What did you do at NITMX?",
  "Which skills do you list?",
  "Where did you study?",
]

export const PROJECT_SUGGESTED_QUESTIONS = [
  "Tell me about SE for ML",
  "What did you build for NECTEC?",
  "What is SCB Tech X Loan Origination?",
]

let counter = 0
function nextId(prefix: string) {
  counter += 1
  return `${prefix}-${counter}`
}

function assistant(text: string, source?: SourceLabel, extra: Partial<ChatMessage> = {}): ChatMessage {
  return { id: nextId("a"), role: "assistant", text, source, ...extra }
}

/** The mock decides what an answer looks like by looking at the question. */
export function mockAnswer(question: string): ChatMessage {
  const q = question.trim().toLowerCase()

  if (q.length === 0) {
    return assistant(
      "Ask me about my background, education, work history, and skills. For a project I will point you to its page.",
      undefined,
      { declined: true },
    )
  }

  // A project question is a redirect, never an answer in the transcript.
  const route = findRoute(question)
  if (route) {
    return redirectAnswer(route, question)
  }

  if (/promptfoo|grpc|kafka|mysql|load test|n8n|langchain|c\+\+/.test(q)) {
    return assistant(
      "My resume lists that in the skills section. That is all the resume says about it, so I would rather not attach it to specific work.",
      "Resume",
    )
  }

  if (/customer support agent|langgraph/.test(q)) {
    return assistant(
      "I am building a customer support agent at True Corporation. That work is still in progress, so treat it as a prototype rather than a finished product.",
      "In progress",
    )
  }

  if (/contact|email|phone|reach|linkedin|github|resume pdf|download/.test(q)) {
    return assistant(
      "The contact form on this site is the best way to reach me. The resume is also available as a one page PDF from the About page.",
      "Resume",
    )
  }

  if (/skills?|tools?|stack|technolog/.test(q)) {
    return assistant(
      "My resume lists Go, Python, TypeScript, Java, PostgreSQL, MongoDB, PyTorch, Scikit learn, Airflow, MLflow, the OpenAI API, RAG, and Qdrant, among others.",
      "Resume",
    )
  }

  if (/stud|university|education|degree|gpa|chulalongkorn/.test(q)) {
    return assistant(
      "I study Computer Engineering at Chulalongkorn University, expecting to graduate in December 2026.",
      "Resume",
    )
  }

  if (/nitmx/.test(q)) {
    return assistant(
      "At NITMX I was a part time software engineer from April 2025 to July 2026. I upgraded legacy Java applications, tested APIs for a national mule account project, built an interbank financial adjustment service in Go, and worked on a Hyperledger Besu blockchain network.",
      "Resume",
    )
  }

  if (/role|job|work|current|true|experience|company|intern/.test(q)) {
    return assistant(
      "I am an AI Engineer intern at True Corporation since August 2026. Before that I was a part time software engineer at NITMX from April 2025 to July 2026.",
      "Resume",
    )
  }

  return assistant(
    "That is not in my resume, so I would rather not guess. What I can tell you is my background, education, work history, and the skills I list. Every project has its own page under /work.",
    undefined,
    { declined: true },
  )
}

/**
 * The words in the question that are not the project's name or one of its aliases.
 *
 * The skills phrasing is then tested against what is left. Testing the whole question
 * would misfire, because a project title can contain a skills word. "SCB Tech X Loan
 * Origination" contains "Tech", so asking about it would look like a skills question.
 */
function questionWithoutProjectName(route: PrototypeRoute, question: string): string {
  const names = [route.title, ...route.aliases]
  let rest = question
  for (const name of names) {
    rest = rest.replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), " ")
  }
  return rest
}

const SKILLS_PHRASING =
  /\b(skills?|tools?|technolog(?:y|ies)|stack|languages?|frameworks?|built with|made with|used with)\b|\buse[ds]?\b/i

/**
 * The project redirect. One line, then the link, then the source label. The summary is
 * the project's own summary, word for word, so the redirect and the page agree.
 *
 * A question that asks which skills or tools a project used is a different shape. The
 * contract allows that pairing, so the answer names the approved pairing and still
 * points at the page, rather than redirecting to a page that says nothing about it.
 */
function redirectAnswer(route: PrototypeRoute, question: string): ChatMessage {
  const asksForSkills = SKILLS_PHRASING.test(questionWithoutProjectName(route, question))

  // When the visitor asks which skills a project used, the answer is that project's
  // approved pairing list, because the contract allows exactly that pairing. When they
  // name one skill themselves, that skill is confirmed instead.
  const named = namedPairings(route, question)
  const pairing = asksForSkills ? (route.skillPairings.length ? route.skillPairings : named) : named

  if (asksForSkills && pairing.length > 0) {
    return assistant(
      `That one has its own page with the detail: ${route.title}. On that page it uses ${pairing.join(", ")}.`,
      "Project page",
      { redirect: { title: route.title, path: route.path, summary: route.summary } },
    )
  }

  return assistant(`That one has its own page with the detail: ${route.title}.`, "Project page", {
    redirect: { title: route.title, path: route.path, summary: route.summary },
  })
}

export function errorMessage(): ChatMessage {
  return assistant(
    "Something went wrong reaching the model. I have not substituted an answer, so please try again in a moment.",
  )
}

export function unavailableMessage(): ChatMessage {
  return assistant(
    "The assistant is temporarily unavailable because the usage limit was reached. Please try again later, or email me directly.",
  )
}

export function routeOf(question: string): PrototypeRoute | undefined {
  return findRoute(question)
}

export { E3_SKILLS }
