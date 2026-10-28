// PROTOTYPE ONLY. Rendered inside the page flow of the home and project pages so variant C
// can be judged in context. Only appears when ?variant=c.

"use client"

import { Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import VariantC from "./variant-c-inline"
import { projects } from "@/data/projects"

export default function InlineChatSlot() {
  return (
    <Suspense fallback={null}>
      <InlineChatSlotInner />
    </Suspense>
  )
}

function InlineChatSlotInner() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const variant = searchParams.get("variant") ?? "a"

  if (pathname.startsWith("/ask")) return null
  if (variant !== "c") return null

  // A project page carries its own context into the suggested questions.
  const contextTitle = pathname.startsWith("/work/")
    ? projects.find((project) => `/work/${project.slug}` === pathname)?.title
    : undefined

  return <VariantC contextTitle={contextTitle} />
}
