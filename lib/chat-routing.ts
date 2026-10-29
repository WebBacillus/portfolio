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
    if (!aliases.has(project.slug)) throw new Error(`Missing routing aliases for ${project.slug}`)
    for (const phrase of [project.title, ...(aliases.get(project.slug) ?? [])]) {
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
