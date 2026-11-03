import "server-only"

export function isJobMatchEnabled() {
  const vercelEnv = process.env.VERCEL_ENV
  const environmentAllowed =
    process.env.NODE_ENV !== "production" || vercelEnv === "preview" || vercelEnv === "production"

  return process.env.JOB_MATCH_ENABLED === "true" && environmentAllowed
}
