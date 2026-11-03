import "server-only"
import { readFileSync } from "node:fs"
import path from "node:path"
import { getProjectCatalog } from "@/lib/project-details"

const skillsThatAreAlsoAliases = new Set([
  "mongodb", "pyspark", "rabbitmq", "microservices", "tts", "text to speech",
  "temporal", "iot", "esp32", "c4", "efficientnet", "efficientnetv2", "azure blob storage",
])

function phraseMatches(question: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(question)
}

function aliasesBySlug(): Map<string, string[]> {
  const source = readFileSync(path.join(process.cwd(), "knowledge", "projects.md"), "utf8")
  const aliases = new Map<string, string[]>()
  for (const line of source.split("\n")) {
    const cells = line.split("|").map((cell) => cell.trim())
    const slug = cells[2]?.match(/^`\/work\/([a-z0-9-]+)`$/)?.[1]
    if (slug) aliases.set(slug, [cells[1], ...(cells[3] ?? "").split(",")].map((item) => item.trim()).filter(Boolean))
  }
  return aliases
}

export function listedOnlySkills(question: string): string[] {
  const contract = readFileSync(path.join(process.cwd(), "docs", "chatbot", "knowledge-contract.md"), "utf8")
  const skills = [...contract.matchAll(/^\| ([^|]+) \| E3 \|/gm)].map((match) => match[1].trim())
  return skills.filter((skill) => phraseMatches(question, skill))
}

export function findProjectRedirect(question: string) {
  const aliases = aliasesBySlug()
  let best: { score: number; project: ReturnType<typeof getProjectCatalog>[number] } | undefined

  for (const project of getProjectCatalog()) {
    const projectAliases = aliases.get(project.slug)
    if (!projectAliases) continue

    for (const phrase of [project.title, ...projectAliases]) {
      if (skillsThatAreAlsoAliases.has(phrase.toLowerCase())) continue
      if (!phraseMatches(question, phrase)) continue
      if (!best || phrase.length > best.score) best = { score: phrase.length, project }
    }
  }

  if (!best) return undefined
  return {
    title: best.project.title,
    href: `/work/${best.project.slug}`,
    summary: best.project.detail.summary,
  }
}

// A role-fit question needs a comparison across projects, not a single project redirect.
// Keep each reason tied to the published project's role line and page content.
export function findAiEngineerProjects(question: string) {
  const mentionsProjects = /\bprojects?\b/i.test(question) || /โปรเจกต์|โครงการ|ผลงาน/.test(question)
  const mentionsRole = /\b(?:ai|artificial intelligence|machine learning|ml)\s+engineer(?:ing)?\b/i.test(question)
    || /วิศวกร(?:เอไอ|ปัญญาประดิษฐ์|แมชชีนเลิร์นนิง)/.test(question)
  if (!mentionsProjects || !mentionsRole) return undefined

  const catalog = new Map(getProjectCatalog().map((project) => [project.slug, project]))
  const choices = [
    { slug: "se-for-ml", reason: "I implemented model serving for an image classifier and helped design drift detection and retraining workflows. It shows work across the ML lifecycle, beyond model training." },
    { slug: "nectec-medical-ai", reason: "I built the model and training pipeline for multi-label chest X-ray classification, including work on class imbalance." },
    { slug: "profanity-guard", reason: "I developed this Thai speech recognition and profanity detection project solo during AI Builders." },
    { slug: "customer-support-agent", reason: "This ongoing research explores a Thai and English support agent guided by reviewed product evidence. It is not a completed support application." },
  ]
  return {
    intro: "These projects are the clearest evidence for an AI Engineer role. My contribution differs by project:",
    projects: choices.map(({ slug, reason }) => {
      const project = catalog.get(slug)
      if (!project) throw new Error(`Missing project: ${slug}`)
      return { title: project.title, href: `/work/${slug}`, reason }
    }),
  }
}
