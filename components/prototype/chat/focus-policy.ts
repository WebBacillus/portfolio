// PROTOTYPE ONLY. Decides whether the composer should take focus when the chat opens.
//
// On a phone, focusing the field pops the software keyboard straight away, which covers
// the suggested questions the visitor has not read yet. So on a touch device the field
// waits to be tapped.
//
// The check is deliberately based on the presence of a touch digitizer rather than on
// "(hover: hover) and (pointer: fine)", because some environments, including headless
// browsers and some assistive setups, do not report the fine pointer even on a desktop.
// Treating that as a touch device would cost a desktop visitor their keyboard focus.

export function shouldAutofocusComposer(): boolean {
  if (typeof window === "undefined") return false
  const hasTouchDigitizer = (navigator.maxTouchPoints ?? 0) > 0
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false
  return !hasTouchDigitizer && !coarsePointer
}
