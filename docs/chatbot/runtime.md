# Milestone 1 chat runtime

## Project layout

- The portfolio Next.js project owns same-origin `POST /api/chat` in `app/api/chat/route.ts` and the deterministic project matcher in `lib/chat-routing.ts`.
- Configure `chat-service/` as the root of a **separate** Vercel Python project. Its `api/index.py` is the FastAPI service. Do not place it in the Next.js project's root `api/` directory.
- `chat-service/knowledge/cv.md` is a deployment copy of the approved `knowledge/cv.md`. Copy it again whenever the canonical file changes. `tests/chat-boundary.py` fails if they differ.

## Environment

| Environment | Variable | Purpose |
| --- | --- | --- |
| Next.js server | `CHAT_API_URL` | Python service origin; no `/chat` suffix |
| Both servers | `CHAT_INTERNAL_TOKEN` | Same random shared secret; never exposed to browser |
| Next.js server | `CHAT_SESSION_SECRET` | Independent random HMAC key for the 24-hour signed session cookie |
| Next.js server | `CHAT_SESSION_CAP` | Optional positive integer; defaults to 30 accepted sends per session |
| Next.js build | `CHAT_PUBLIC_ENABLED` | Set to `true` and redeploy only after launch checks pass; production launcher is hidden otherwise |
| Python server | `OPENAI_API_KEY` | Dedicated API Platform project key |
| Python server | `OPENAI_MODEL` | Optional; defaults to `gpt-6-luna` |

All three secrets must remain in server-only environment settings. Neither project should define them with a `NEXT_PUBLIC_` prefix. The Python origin rejects a missing or wrong internal token before parsing a body or calling the model. The proxy fails closed if its URL, token or session secret is missing.

## Abuse controls

The Python service keeps a 20 requests/minute/IP in-process brake. The durable primary per-IP control must be a Vercel WAF custom rule on the **Next.js project** matching `/api/chat`, rate limited to 20 requests per minute per IP with a 429 action. Confirm it is published before public traffic. [Vercel WAF custom rules](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules) document the rule and its action; [Vercel request headers](https://vercel.com/docs/headers/request-headers) document that Vercel overwrites `x-forwarded-for` and supplies `x-vercel-forwarded-for` to prevent client IP spoofing.

The signed cookie cap is a secondary friction control. It can be reset by deleting or replaying an older cookie, so it must not be treated as the primary abuse boundary. The WAF rule, shared token and owner-confirmed OpenAI hard cap protect the spend. The $5 cap still needs a launch-time check against the correct API project.

## Local checks

From the repo root, after installing Node dependencies and `uv`:

```sh
pnpm build
node tests/chat-routing.mjs
node tests/chat-proxy.mjs
uv run --with httpx python tests/chat-boundary.py
uvx pyright -p chat-service/pyrightconfig.json
pnpm lint
```

The HTTP tests use local mock services and dummy secrets. They make no OpenAI request. The production service was also exercised locally with one education question, one E3 skill question and one in-progress question against `gpt-6-luna`; all three returned 200 with the expected source labels. No key or token was printed.

## Launch sequence

Use [launch-checklist.md](launch-checklist.md) for the two-project setup, deployed checks, and the final launcher switch. Production builds hide the launcher until `CHAT_PUBLIC_ENABLED=true` is set on the Next.js project and that project is redeployed.
