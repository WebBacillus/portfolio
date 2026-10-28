import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Github } from "lucide-react"
import AnimatedTitle from "@/components/animated-title"
import { getProjectCatalog, getProjectDetail } from "@/lib/project-details"
import InlineChatSlot from "@/components/prototype/chat/inline-chat-slot"

export const dynamicParams = false

export function generateStaticParams() {
  return getProjectCatalog().map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getProjectDetail(slug)

  if (!project) return {}

  return {
    title: `${project.slug} | Pasit Khumsena`,
    description: project.summary,
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getProjectCatalog().find((entry) => entry.slug === slug)

  if (!project) notFound()

  return (
    <main className="min-h-screen">
      <article className="container mx-auto max-w-3xl px-4 pt-16 pb-20">
        <Link href="/work" className="mb-8 inline-block text-purple hover:underline">
          ← All work
        </Link>

        <AnimatedTitle className="text-purple text-center leading-tight tracking-normal mb-6">
          {project.title}
        </AnimatedTitle>

        <p className="mb-4 text-center text-black/70 text-lg leading-relaxed">
          {project.detail.summary}
        </p>

        <p className="mb-8 text-center text-black/60 text-sm leading-relaxed">
          {project.detail.role}
        </p>

        <div className="relative mb-10 w-full aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-purple/10 bg-purple/5 px-3 py-1.5 text-xs font-medium text-purple md:text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          className="space-y-5 text-black/80 [&_a]:text-purple [&_a]:underline [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-6 [&_li]:list-disc [&_ol]:list-decimal [&_p]:leading-relaxed [&_table]:w-full [&_table]:my-6 [&_td]:border [&_td]:border-purple/15 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-purple/15 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_ul]:space-y-2"
          dangerouslySetInnerHTML={{ __html: project.detail.html }}
        />

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-purple hover:text-dark-purple transition-colors duration-300"
            >
              <ExternalLink className="w-4 h-4" aria-hidden />
              <span>Live demo</span>
            </a>
          )}

          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-purple hover:text-dark-purple transition-colors duration-300"
            >
              <Github className="w-4 h-4" aria-hidden />
              <span>Repository</span>
            </a>
          )}
        </div>

        <InlineChatSlot />
      </article>
    </main>
  )
}
