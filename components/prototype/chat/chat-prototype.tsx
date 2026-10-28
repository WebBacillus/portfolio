// PROTOTYPE ONLY. Mounted in the layout so the floating dock and the switcher are reachable
// from every page. Variant B has its own route at /ask, and variant C mounts inside the
// page flow through <InlineChatSlot />.

"use client"

import { Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import VariantA from "./variant-a-dock"
import { PrototypeSwitcher } from "./prototype-switcher"

export default function ChatPrototype() {
  return (
    <Suspense fallback={null}>
      <ChatPrototypeInner />
    </Suspense>
  )
}

function ChatPrototypeInner() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const variant = searchParams.get("variant") ?? "a"

  // The dedicated page variant renders itself on /ask.
  const isAskRoute = pathname.startsWith("/ask")

  return (
    <>
      {!isAskRoute && variant === "a" && <VariantA />}
      <PrototypeSwitcher />
    </>
  )
}
