import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { marked } from "marked"
import { projects } from "@/data/projects"

const projectsDirectory = path.join(process.cwd(), "content", "projects")

type ProjectFrontmatter = {
  summary?: unknown
  role?: unknown
}

export type ProjectDetail = {
  slug: string
  summary: string
  role: string
  html: string
}

export function getProjectDetails(): ProjectDetail[] {
  return readdirSync(projectsDirectory)
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const slug = filename.slice(0, -3)
      const source = readFileSync(path.join(projectsDirectory, filename), "utf8")
      const parsed = matter(source)
      const frontmatter = parsed.data as ProjectFrontmatter

      const summary = frontmatter.summary
      const role = frontmatter.role

      if (typeof summary !== "string" || summary.trim() === "") {
        throw new Error(`Project "${filename}" must define a non-empty summary.`)
      }

      if (typeof role !== "string" || role.trim() === "") {
        throw new Error(`Project "${filename}" must define a non-empty role.`)
      }

      return {
        slug,
        summary,
        role,
        html: marked.parse(parsed.content, { async: false }),
      }
    })
}

export function getProjectDetail(slug: string): ProjectDetail | undefined {
  return getProjectDetails().find((project) => project.slug === slug)
}

/** Every catalog project must have a matching detail document. */
export function getProjectCatalog() {
  const details = getProjectDetails()

  return projects.map((project) => {
    const detail = details.find((entry) => entry.slug === project.slug)

    if (!detail) {
      throw new Error(
        `Project "${project.slug}" has no detail document in content/projects.`
      )
    }

    return { ...project, detail }
  })
}
