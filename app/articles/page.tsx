import Link from "next/link"
import AnimatedTitle from "@/components/animated-title"
import { getArticles } from "@/lib/articles"

export default function ArticlesPage() {
  const articles = getArticles()

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 pt-16 pb-20">
        <AnimatedTitle className="text-purple text-center leading-none tracking-normal mb-8">
          ARTICLES
        </AnimatedTitle>
        <p className="mx-auto mb-12 max-w-2xl text-center text-black/70">
          Short notes on events I attend, the ideas that stand out, and what I learn.
        </p>

        {articles.length > 0 ? (
          <ol className="mx-auto max-w-3xl space-y-6">
            {articles.map((article) => (
              <li key={article.slug} className="rounded-lg border border-purple/10 bg-white/80 p-6 shadow-sm">
                <time dateTime={article.date} className="mb-2 block text-sm text-black/60">
                  {article.date}
                </time>
                <h2 className="mb-2 text-xl font-semibold text-purple">
                  <Link href={`/articles/${article.slug}`} className="hover:underline">
                    {article.title}
                  </Link>
                </h2>
                {article.summary && <p className="text-black/70">{article.summary}</p>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mx-auto max-w-2xl rounded-lg border border-purple/10 bg-white/80 p-6 text-center text-black/70">
            No event notes published yet.
          </p>
        )}
      </div>
    </main>
  )
}
