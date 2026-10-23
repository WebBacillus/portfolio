import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { marked } from "marked"

const articlesDirectory = path.join(process.cwd(), "content", "articles")

type ArticleFrontmatter = {
  title?: unknown
  date?: unknown
  summary?: unknown
}

export type Article = {
  slug: string
  title: string
  date: string
  summary: string
  html: string
}

export function getArticles(): Article[] {
  return readdirSync(articlesDirectory)
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const slug = filename.slice(0, -3)
      const source = readFileSync(path.join(articlesDirectory, filename), "utf8")
      const parsed = matter(source)
      const frontmatter = parsed.data as ArticleFrontmatter

      const date = frontmatter.date instanceof Date
        ? frontmatter.date.toISOString().slice(0, 10)
        : frontmatter.date

      if (
        typeof frontmatter.title !== "string" ||
        frontmatter.title.trim() === "" ||
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(Date.parse(date))
      ) {
        throw new Error(`Article "${filename}" must define a non-empty title and valid YYYY-MM-DD date.`)
      }

      return {
        slug,
        title: frontmatter.title,
        date,
        summary: typeof frontmatter.summary === "string" ? frontmatter.summary : "",
        html: marked.parse(parsed.content, { async: false }),
      }
    })
    .sort((first, second) => second.date.localeCompare(first.date))
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((article) => article.slug === slug)
}
