// PROTOTYPE ONLY. Floating switcher so the human can flip between the three variants.
// Hidden in production builds so a stray merge cannot ship the bar to visitors.

"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

export const PROTOTYPE_VARIANTS = [
  { key: "a", name: "Floating dock" },
  { key: "b", name: "Dedicated page" },
  { key: "c", name: "Inline section" },
] as const

export function PrototypeSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const current = searchParams.get("variant") ?? "a"
  // ?clean=1 hides every prototype affordance, for screenshots that show only the design.
  const clean = searchParams.get("clean") === "1"
  const index = Math.max(
    0,
    PROTOTYPE_VARIANTS.findIndex((variant) => variant.key === current),
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return
      }
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
      e.preventDefault()
      const delta = e.key === "ArrowRight" ? 1 : -1
      const next =
        PROTOTYPE_VARIANTS[
          (index + delta + PROTOTYPE_VARIANTS.length) % PROTOTYPE_VARIANTS.length
        ]
      if (next.key === "b") {
        router.push(`/ask?variant=b`)
        return
      }
      const params = new URLSearchParams(searchParams.toString())
      params.set("variant", next.key)
      if (pathname.startsWith("/ask")) {
        router.push(`/?${params.toString()}`)
        return
      }
      router.replace(`${pathname}?${params.toString()}`)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, pathname, router, searchParams])

  if (process.env.NODE_ENV === "production") return null
  if (clean) return null

  const go = (delta: number) => {
    const next =
      PROTOTYPE_VARIANTS[
        (index + delta + PROTOTYPE_VARIANTS.length) % PROTOTYPE_VARIANTS.length
      ]
    // Variant B is a dedicated route, so the switcher has to leave the current page for it.
    if (next.key === "b") {
      router.push(`/ask?variant=b`)
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set("variant", next.key)
    if (pathname.startsWith("/ask")) {
      router.push(`/?${params.toString()}`)
      return
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 rounded-full bg-neutral-900 text-white shadow-2xl pl-1 pr-3 py-1 md:top-auto md:bottom-4">
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous variant"
        className="p-2 rounded-full hover:bg-white/15 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden />
      </button>
      <span className="text-xs font-medium whitespace-nowrap px-1">
        {PROTOTYPE_VARIANTS[index].key.toUpperCase()} · {PROTOTYPE_VARIANTS[index].name}
      </span>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next variant"
        className="p-2 rounded-full hover:bg-white/15 transition-colors"
      >
        <ChevronRight className="w-4 h-4" aria-hidden />
      </button>
    </div>
  )
}
