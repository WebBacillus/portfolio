// PROTOTYPE DATA. Generated from knowledge/projects.md so the mock cannot drift.
// Regenerate if the routing index changes.
//
// Two additions over the raw index, both prototype only:
//   skillPairings  the E1/E2 skills the contract allows this project to be paired with.
//                  Copied from the pairing section of knowledge/cv.md. A project with no
//                  pairing row may not have a skill attached to it at all.
//   The matcher    excludes skill names that are also listed CV skills, because a
//                  question about a bare technology is a CV question, not a project
//                  question. The production assistant reads the whole question and the
//                  whole routing table, so it can tell them apart. A string matcher
//                  cannot, so it needs the exclusion list.

export type PrototypeRoute = {
  title: string
  path: string
  slug: string
  aliases: string[]
  summary: string
  skillPairings: string[]
}

export const PROTOTYPE_ROUTES: PrototypeRoute[] = [
  {
    title: "Takluz TTS",
    path: "/work/takluz-tts",
    slug: "takluz-tts",
    aliases: [
      "TTS",
      "text to speech",
      "Twitch bot",
      "channel points",
      "voice bot",
    ],
    summary:
      "A Twitch channel-points text-to-speech bot that lets long-time viewers speak on stream without paying for Bits.",
    skillPairings: [
      "Go",
      "TypeScript",
      "JavaScript",
      "MongoDB",
      "OpenAI API",
      "Text-to-Speech (TTS)",
      "REST API",
    ],
  },
  {
    title: "SE for ML",
    path: "/work/se-for-ml",
    slug: "se-for-ml",
    aliases: [
      "Scalable ML Classification Pipeline",
      "image classification",
      "MLOps",
      "drift detection",
      "retraining",
      "C4",
      "model serving",
    ],
    summary:
      "An image classification system for storefront photos, with a human review queue and drift-triggered retraining.",
    skillPairings: [
      "Python",
      "PyTorch",
      "Torchvision",
      "Scikit-learn",
      "Pandas",
      "NumPy",
      "Apache Airflow",
      "MLflow",
      "PostgreSQL",
    ],
  },
  {
    title: "ProfanityGuard",
    path: "/work/profanity-guard",
    slug: "profanity-guard",
    aliases: [
      "profanity",
      "swear word",
      "Thai ASR",
      "speech recognition",
      "content moderation",
      "AI Builders project",
    ],
    summary:
      "A speech model that detects Thai profanity in audio, built so streamers can act on it before publishing.",
    // No pairing row in knowledge/cv.md, so no skill may be attached to this project.
    skillPairings: [],
  },
  {
    title: "Adozoil",
    path: "/work/adozoil",
    slug: "adozoil",
    aliases: [
      "drowsiness",
      "driver fatigue",
      "fuel theft",
      "fuel monitoring",
      "IoT",
      "ESP32",
      "fleet",
      "truck",
    ],
    summary:
      "An IoT system for transport fleets that watches for driver drowsiness and flags unusual fuel consumption.",
    // No pairing row in knowledge/cv.md.
    skillPairings: [],
  },
  {
    title: "Employee Management",
    path: "/work/employee-management",
    slug: "employee-management",
    aliases: [
      "attendance",
      "leave request",
      "HR system",
      "employee system",
      "microservices",
      "RabbitMQ",
    ],
    summary:
      "A microservices employee platform for attendance, leave requests, and workforce notifications.",
    skillPairings: [
      "Go",
      "TypeScript",
      "JavaScript",
      "PostgreSQL",
      "REST API",
      "Microservices",
      "Clean and Hexagonal Architecture",
      "RabbitMQ",
    ],
  },
  {
    title: "Takluz Leaderboards",
    path: "/work/takluz-leaderboards",
    slug: "takluz-leaderboards",
    aliases: [
      "leaderboard",
      "Twitch statistics",
      "chat analytics",
      "ranking",
    ],
    summary:
      "A Go service that collects Twitch chat activity and turns it into stream statistics.",
    skillPairings: ["TypeScript", "JavaScript", "REST API"],
  },
  {
    title: "Monkey Massage",
    path: "/work/monkey-massage",
    slug: "monkey-massage",
    aliases: [
      "massage",
      "reservation",
      "booking",
      "OTP",
      "spa",
    ],
    summary:
      "A reservation platform for massage shops, with OTP-based sign-up and reviews.",
    skillPairings: ["MongoDB"],
  },
  {
    title: "Scopus Gender Prediction",
    path: "/work/scopus-gender-prediction",
    slug: "scopus-gender-prediction",
    aliases: [
      "Scopus",
      "Crossref",
      "gender prediction",
      "author gender",
      "name features",
      "PySpark",
      "MongoDB",
      "DSDE",
      "2110403",
    ],
    summary:
      "A data pipeline that predicts the likely gender of an academic author from their name, then maps the result across the Scopus corpus by country and subject area.",
    skillPairings: [
      "Python",
      "Scikit-learn",
      "Pandas",
      "NumPy",
      "Streamlit",
      "Plotly",
      "PySpark",
      "MongoDB",
    ],
  },
  {
    title: "NECTEC Medical AI",
    path: "/work/nectec-medical-ai",
    slug: "nectec-medical-ai",
    aliases: [
      "NECTEC",
      "chest X-ray",
      "chest xray",
      "medical imaging",
      "multi-label",
      "EfficientNetV2",
      "EfficientNet",
      "radiology",
    ],
    summary:
      "A multi-label chest X-ray diagnostic system that predicts several findings at once from a single radiograph.",
    skillPairings: ["PyTorch", "torchvision", "EfficientNetV2"],
  },
  {
    title: "SCB Tech X Loan Origination",
    path: "/work/scb-tech-x-loan-origination",
    slug: "scb-tech-x-loan-origination",
    aliases: [
      "SCB",
      "loan origination",
      "Temporal",
      "Azure Blob Storage",
      "loan pipeline",
    ],
    summary:
      "A loan origination pipeline that replaces manual steps with Go services and durable Temporal workflows.",
    skillPairings: ["Go", "Temporal", "PostgreSQL", "Azure Blob Storage"],
  },
]

/**
 * Skills that the resume lists but that never carry evidence on their own.
 * A question about one of these gets a bare list item, never a project, an employer,
 * a role, or an outcome attached. See knowledge/cv.md and the contract section 4.3.
 */
export const E3_SKILLS = [
  "C++",
  "MySQL",
  "gRPC",
  "Kafka",
  "Load Testing",
  "n8n",
  "LangChain",
  "promptfoo",
]

/**
 * Aliases that also name a listed CV skill. Matching one of these alone is a CV
 * question about a technology, not a request for a project page, so they never
 * trigger a redirect on their own.
 */
const SKILL_ALIASES = new Set([
  "mongodb",
  "pyspark",
  "rabbitmq",
  "microservices",
  "tts",
  "text to speech",
  "temporal",
  "iot",
  "esp32",
  "c4",
  "efficientnet",
  "efficientnetv2",
  "azure blob storage",
])

const PHRASE_ESCAPE = /[.*+?^${}()|[\]\\]/g

/** Whole phrase match on word boundaries. "c4" does not match inside "sc4". */
function phraseMatches(question: string, phrase: string): boolean {
  const escaped = phrase.replace(PHRASE_ESCAPE, "\\$&").replace(/\s+/g, "\\s+")
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(question)
}

/**
 * Find the project a question is about, if any.
 * Longest matching phrase wins, so "Scalable ML Classification Pipeline" beats "MLOps".
 */
export function findRoute(question: string): PrototypeRoute | undefined {
  let best: { route: PrototypeRoute; score: number } | undefined

  for (const route of PROTOTYPE_ROUTES) {
    for (const phrase of [route.title, ...route.aliases]) {
      if (SKILL_ALIASES.has(phrase.toLowerCase())) continue
      if (!phraseMatches(question, phrase)) continue
      const score = phrase.length
      if (!best || score > best.score) best = { route, score }
    }
  }

  return best?.route
}

/** Skills from the approved pairing list that the question names. */
export function namedPairings(route: PrototypeRoute, question: string): string[] {
  return route.skillPairings.filter((skill) => phraseMatches(question, skill))
}
