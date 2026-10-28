// PROTOTYPE ONLY. Lets the reviewer reach the error and temporarily unavailable states,
// which would otherwise need a real failure to appear. Buttons arm the next send.

"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { setPendingTrigger } from "./mock-engine"

export default function StateDemoControls({ compact = false }: { compact?: boolean }) {
  return (
    <Suspense fallback={null}>
      <Controls compact={compact} />
    </Suspense>
  )
}

function Controls({ compact }: { compact: boolean }) {
  const searchParams = useSearchParams()
  // ?clean=1 hides every prototype affordance, for screenshots that show only the design.
  if (process.env.NODE_ENV === "production") return null
  if (searchParams.get("clean") === "1") return null

  return (
    <div
      className={[
        "flex items-center gap-2 font-mono text-[11px] text-white/80",
        compact ? "" : "mt-4 flex-wrap",
      ].join(" ")}
    >
      {!compact && <span className="text-white/50">next send:</span>}
      <button
        type="button"
        onClick={() => setPendingTrigger("normal")}
        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
      >
        normal
      </button>
      <button
        type="button"
        onClick={() => setPendingTrigger("error")}
        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
      >
        error
      </button>
      <button
        type="button"
        onClick={() => setPendingTrigger("unavailable")}
        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
      >
        unavailable
      </button>
    </div>
  )
}
