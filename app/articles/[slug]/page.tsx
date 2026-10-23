import { notFound } from "next/navigation"
import Link from "next/link"
import AnimatedTitle from "@/components/animated-title"
import { getArticle, getArticles } from "@/lib/articles"

export const dynamicParams = false

export function generateStaticParams() {
  return getArticles().map(({ slug }) => ({ slug }))
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  return (
    <main className="min-h-screen">
      <article className="container mx-auto max-w-3xl px-4 pt-16 pb-20">
        <Link href="/articles" className="mb-8 inline-block text-purple hover:underline">
          ← All articles
        </Link>
        <AnimatedTitle className="text-purple text-center leading-tight tracking-normal mb-6">
          {article.title}
        </AnimatedTitle>
        <time dateTime={article.date} className="mb-10 block text-center text-black/60">
          {article.date}
        </time>
        <div
          className="space-y-5 text-black/80 [&_a]:text-purple [&_a]:underline [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-6 [&_li]:list-disc [&_ol]:list-decimal [&_p]:leading-relaxed [&_ul]:space-y-2"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      </article>
    </main>
  )
}
