// PROTOTYPE CHECK SUPPORT. Resolves the app's extensionless relative imports to their
// .ts files, so the check can run the real source without the app source having to
// carry file extensions that its bundler does not want.

import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    const base = new URL(specifier, context.parentURL)
    for (const candidate of [".ts", ".tsx", "/index.ts", "/index.tsx"]) {
      const url = new URL(base.href + candidate)
      if (existsSync(fileURLToPath(url))) {
        return nextResolve(url.href, context)
      }
    }
  }
  return nextResolve(specifier, context)
}
