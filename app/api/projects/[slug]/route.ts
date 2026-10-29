import { NextResponse } from "next/server"
import { getProjectCatalog } from "@/lib/project-details"

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProjectCatalog().find((entry) => entry.slug === slug)
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
  return NextResponse.json({
    title: project.title,
    summary: project.detail.summary,
    role: project.detail.role,
    html: project.detail.html,
    image: project.image,
    tags: project.tags,
    liveUrl: project.liveUrl,
    repoUrl: project.repoUrl,
  })
}
