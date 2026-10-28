# Python API hosting boundary — findings

**Status:** ready for human review
**Type:** prototype (HITL), decision record
**Ticket:** t_ca72ff71 · **Part of:** t_24eac6d6
**Proof branch:** `prototype/vercel-python-hosting`
**Proof code:** `proofs/vercel-python-hosting/`

---

## 1. The question

Can a minimal, non-agentic Python FastAPI endpoint, deployed separately on Vercel, serve
the existing Next.js chat securely and within latency and cost limits? Or should the
backend boundary change before the implementation spec is written?

**The answer: yes, a separate Python deployment works, and the boundary should change
shape in two specific ways.** The proof settles the hosting question; it does not settle
which of two deployment shapes to use, because that one turns on Vercel account facts
this environment cannot reach. Section 8 states the choice and the one thing needed to
finish it.

---

## 2. What was actually run

Everything below was executed on this machine against the real key at
`.env.chatbot` (mode 0600, gitignored). The key was never printed and never written to
a log.

| Check | How | Result |
| --- | --- | --- |
| Model access from a Python process | `model_probe.py`, live `GET /v1/models` + `POST /v1/responses` | 200, `gpt-6-luna` present, answer "reachable" in 2344 ms |
| The service serves the chat contract | `api/index.py` under uvicorn, real model call | 200, answer "I'm an AI Engineer intern at True Corporation…", model `gpt-6-luna` |
| The browser can reach it same-origin | `app/api/chat/route.ts` proxying to the service | 200, real answer, 1.9 to 2.4 s end to end |
| Boundary properties | `boundary_checks.py`, 22 assertions | **22 passed, 0 failed** |
| Cold start | `measure.py` | 320 to 375 ms with a warm bytecode cache, 895 ms on the first import |
| Warm overhead | `measure.py` | 3.29 ms median, excluding the model call |
| Dependency bundle | `measure.py` | 31.6 MB, against Vercel's 500 MB Python limit |
| Proxy hop cost | `hop_cost.py`, 40 pairs | +9.07 ms median, p95 +13.41 ms |
| Cost model | `cost_model.py` | see section 6 |

The 22 assertions cover: key presence without key leakage, unauthenticated refusal,
wrong-token refusal, a real model call, oversized body, over-long question, over-long
history, malformed JSON, whitespace-only question, upstream failure, rate-limit trip,
and rate-limit isolation between IPs.

---

## 3. Three defects the proof found

These were invisible in the code and only appeared when it ran. All three are fixed in
the proof.

### 3.1 A whitespace-only question spent a model call

`question: str = Field(min_length=1)` accepts `"   "`, because the string is three
characters long. The service trimmed nothing, so a visitor sending a blank composer
produced a real model call and a billed token spend.

**Fixed** by stripping in a `field_validator(mode="before")`, which runs before the length
check. The assertion is now in the suite: a blank question returns 422.

### 3.2 The proxy dropped the visitor's IP, so the backend counted everyone as one

The proxy sent only `Content-Type` upstream. The backend's per-IP limiter therefore saw
every request as coming from the proxy's address. One visitor's burst of 20 questions
tripped the limit for the entire site.

Reproduced directly: three requests with distinct `X-Forwarded-For` values all returned
429, because the backend had one bucket.

**Fixed** by forwarding `x-forwarded-for` from the proxy. Distinct IPs are now distinct
buckets, and the suite asserts that a fresh IP is unaffected by another IP's usage.

This one matters more than it looks. A rate limit that is shared across all visitors is
not a rate limit, it is an outage trigger.

### 3.3 A separate deployment is a second public origin, and the proof assumed it was not

The original proof had the backend accept any request. That is fine for a service on the
same origin, and wrong for a service on its own domain: the backend URL appears in the
Vercel dashboard, in proxy logs, and in any `Referer` header, so obscurity is not a
control. Anyone who learns the URL could spend the owner's entire $5 monthly budget.

**Fixed** with a shared secret. The service refuses any request without
`x-chat-internal-token`, checked with `hmac.compare_digest` before the body is parsed,
before the rate limiter runs, and before the model is called. The proxy injects it from
a server-side environment variable. `/health` reports whether the secret is configured,
so a missing secret is a visible misconfiguration rather than a silent one.

Verified: a direct call without the token returns 401 and spends nothing; the same
request through the proxy returns 200 with a real answer.

---

## 4. Security and privacy findings

**What the visitor's browser sees.** One origin. The browser only ever calls
`/api/chat` on the portfolio's own domain. The backend URL is a server-side environment
variable and never reaches the client.

**CORS.** The backend emits no `Access-Control-Allow-Origin` header and answers the
browser preflight `OPTIONS` with 405. A cross-origin browser call therefore fails
before it reaches the model. The proxy likewise emits no CORS headers, because a
same-origin request does not need them. Verified with `Origin: https://evil.example.com`
against both.

**Logging.** The uvicorn access log records method, path and status. It does not record
the request body, the question, the answer, or any header value. Grepping the full log
for the question text, the answer text, and key patterns returns zero hits. The one
`console`-style write in the service is a `request_id` in the JSON response, which is a
random hex string, not content.

**Vercel's own logs.** Runtime logs capture stdout and stderr per invocation, plus
request metadata: path, status, host, request ID. Request and response bodies are not
part of a runtime log entry by default. Log retention is 1 hour on Hobby, 1 day on Pro,
3 days on Enterprise. Two consequences for the privacy notice: a visitor's question is
not persisted in Vercel's runtime logs, but the retention window is short, which suits a
site that promises no persistent chat content.

**What is sent to a third party.** The visitor's question text, plus the previous turns
of the conversation, plus the bundled CV knowledge, are sent to the OpenAI API. That is
the one transfer of visitor-provided content to a third party, and the privacy notice has
to say so. The history is the part worth being careful about: the interaction contract
already caps the transcript at short tab-scoped history and persists nothing, and the
service enforces a 12-message cap and 32 KB body cap server-side.

**What is never sent.** The service sends the CV knowledge it holds, never the
repository, the notes, or the private files. The knowledge is inlined into the system
prompt at build time and the visitor can never supply it.

---

## 5. Latency findings

The model call dominates everything. Measured through the full stack: **1.9 to 2.4
seconds** for a real answer, end to end, browser to browser.

| Component | Cost | Share of a real request |
| --- | --- | --- |
| Model call | 2300 to 3500 ms | ~97% |
| Proxy hop | 9 ms median, 13 ms p95 | ~0.4% |
| Service warm overhead | 3.3 ms | ~0.1% |
| Python cold start | 895 ms, one time per idle instance | first request only |

**The proxy hop is not a factor.** 9 ms against a 2.3 s model call is noise. This
matters because the proxy hop is the thing that costs the most in complexity: it is a
second place where limits live, a second thing to deploy, and a second failure mode.
The decision to keep it should not be made on latency grounds, and the numbers say it
does not have to be.

**Cold start is the real latency risk.** 320 to 375 ms of import time on a cold instance
with a warm bytecode cache, and 895 ms on the very first import when the bytecode is
still being written, all before the model is even called. A portfolio site with low
traffic means cold instances are the common case, not the exception. A cold request is
therefore roughly 2.6 to 3.9 seconds against a warm 1.6 to 3.5. Vercel's Fluid compute,
which is on by default for new projects, exists to reduce this, but a low-traffic
portfolio will still see cold starts.

Two mitigations, and the first is the better one:

1. **Keep the service warm** by giving it a minimum concurrency setting, so an instance
   stays alive between visitors. This trades a small amount of always-on memory against
   the cold start.
2. **Accept it.** The interaction contract already has a loading state, so a 3 second
   answer reads as thinking rather than as broken. The contract's "temporarily
   unavailable" state is for budget exhaustion, which is different from slow.

**Region.** Vercel functions run in `iad1` (Washington DC) by default, which is the
right default here: the OpenAI API is in the United States, so the model hop stays
domestic and short. Setting a region is available but not needed.

---

## 6. Cost findings

**The model bill is the only cost that matters.**

| Item | Cost |
| --- | --- |
| One model request (4k in, 500 out) | $0.000650 |
| One Vercel function invocation | $0.00000094 |
| Hosting as a share of the model bill | **0.14%** |
| 1,000 requests/month of hosting | $0.001 |
| 5,000 requests/month of model usage | $3.25 |

Hosting is four orders of magnitude below the model bill. The $5 monthly hard limit
allows about **7,700 requests**, which is far more traffic than a portfolio site sees.

**The binding constraint is abuse, not legitimate traffic.** This is the conclusion that
should change how the spec is written. A shared secret and a per-IP limit are what
actually protect the budget, and neither of them is the model bill's problem to solve.
The OpenAI hard limit is the backstop, not the control.

---

## 7. The three hosting shapes, and why one is ruled out

### Shape A — a separate Vercel project for the Python service

The Python service is its own project, on its own domain. The Next.js app proxies to it
server-side over the shared secret.

**This works and is what the proof exercises.** The cost is one extra project, one extra
domain, one extra deployment pipeline, and the shared secret that the proof shows is
mandatory.

### Shape B — Python in the same Vercel project, in the root `api/` directory

Vercel supports Python functions in a root `/api` directory alongside a Next.js app, and
the docs confirm the mechanism: `api/index.py` serves `/api`, and each file needs an
`app`, `application`, or `handler` top-level name.

**This shape is ruled out for this repository**, by Vercel's own open issue #12676, whose
reproduction table reads:

| Function type | `next dev` | `vercel dev` | deployed |
| --- | --- | --- | --- |
| `api/time.js` (root function) | 404 | 200 | 200 |
| `app/api/random/route.ts` (app route) | 200 | 404 | 200 |
| `app/api/hello/[slug]/route.ts` (**dynamic app route**) | 200 | 404 | **404** |

The last row is the problem. This repository has two dynamic routes,
`app/work/[slug]` and `app/articles/[slug]`, which are the ten project pages. Mixing a
root `/api` function into this project makes those deployed dynamic routes return 404.
A user of that issue reports the same thing: following the Python docs broke nested
routes such as `/parent/child/[id]/route.ts`.

Two further costs in this shape: `next dev` and `vercel dev` disagree about which
routes exist, so local development and deployment stop matching; and the `functions`
property in `vercel.json` is restricted under Next.js to `memory` and `maxDuration`
only, so `excludeFiles` is unavailable to keep the 451 MB `.next` directory out of the
Python bundle. That bundle risk is the same one the azfuller write-up hit.

**Shape B breaks the project catalogue. It is out.**

### Shape C — Vercel Services, one project, two services

Vercel Services is in Beta on all plans and is built for exactly this: a Next.js
frontend and a Python FastAPI backend in one repository, deployed together with shared
routing and environment variables, and each service built independently.

Its advantages over Shape A are real. A service is internal by default and is not
routable from the internet unless a top-level rewrite exposes it, so the Python backend
would have **no public URL at all**, which removes the shared-secret requirement that
Shape A needs. One service calls another over an internal binding, without going
through the public internet. One project means one deployment pipeline and one set of
environment variables.

Its costs: it is Beta, it restructures the repository into a monorepo layout with a
`root` per service, and it changes how local development runs.

---

## 8. The recommended boundary

**Use Shape C, Vercel Services, with the Python backend internal.** If Services turns
out to be unsuitable, fall back to Shape A, a separate project with the shared secret
that the proof already implements.

The reasoning, in one line each:

- **The backend should not have a public URL.** Shape C gives that for free. Shape A
  needs a shared secret to approximate it, and the proof shows that secret is
  mandatory, not optional.
- **One deployment is better than two.** Shape C keeps the Next.js app and the Python
  service in one repo, one project, one pipeline, and one environment variable set.
- **The proxy route stays either way.** It is where the abuse limits live, and those
  limits have to survive a cold start. The proxy hop costs 9 ms and is not the problem.
- **Shape B is out** because it 404s this repository's dynamic project pages.

**The one thing that must change in the spec.** The interaction contract says the panel
is a dock, a page, or an inline slot, and all three are client-side. The fetch target
is `/api/chat` on the portfolio's own origin in every case. **The UI contract does not
change with the hosting decision**, so the interaction contract and the knowledge
contract stay as they are.

### What the implementation spec must include

1. The proxy route, with its limits: 32 KB body, 1000 character question, 12 message
   history, 8 KB per message.
2. The shared secret check on the backend, before any parsing or model call. Under
   Shape C this is defence in depth rather than the primary control; under Shape A it
   is the primary control.
3. `x-forwarded-for` forwarding from the proxy to the backend, without which the
   backend's per-IP limit becomes a shared outage.
4. A shared rate-limit store. The in-memory counter in the proof is per-instance and
   per-cold-start, so it is a floor, not a limit. Vercel WAF rate limiting is available
   on Hobby, with one rate-limit rule per project, and is the real per-IP control. The
   in-process counter stays as a cheap second layer.
5. The knowledge bundled at build time, never fetched at request time, never
   visitor-supplied.
6. Fail closed on every model error, with no substituted answer and no silent model
   switch, per the parent ticket's decision.
7. A privacy notice that says the question and the short conversation history are sent
   to the OpenAI API, that the transcript is tab-scoped and not persisted, and that
   Vercel runtime logs hold request metadata for up to a day.

### Still open for the owner

1. **Services versus a separate project.** Shape C is the recommendation. It is Beta,
   so the owner may prefer the stable Shape A. The API contract is the same either way,
   so this can be decided at deployment time without changing the spec.
2. **Minimum concurrency** on the Python service, to trade a little memory against the
   895 ms cold start.
3. **The three interaction decisions** from the interaction contract, section 11:
   placement, launcher wording, and whether the project question group appears in the
   empty state. Those are content decisions and are not affected by anything here.

---

## 9. What this proof does not establish

Stated plainly, because the implementation spec should not assume any of it.

- **No deployment to Vercel happened.** There is no Vercel account or token on this
  machine, `vercel build` needs a linked project, and the browser has no saved Vercel
  login. The Python runtime behavior is established from Vercel's documentation and
  from the Vercel CLI's own presence on the machine, not from a live deployment.
- **Cold start is a local measurement.** 320 to 375 ms is the import cost on this
  machine with a warm bytecode cache, and 895 ms on the first import. A Vercel cold
  start adds instance creation, bundle unpacking and platform overhead, so the real
  number is higher. The direction of the finding holds; the exact number does not.
- **The Vercel function cost is a computed estimate** from published Fluid compute
  rates, not a measured bill.
- **Region latency was not measured against a real Vercel instance.** The claim that
  `iad1` is the right default rests on the OpenAI API being in the United States.
- **The runtime logs claim about request bodies** rests on Vercel's documentation of
  what a runtime log entry contains. The service's own logging was checked directly and
  is clean.
- **The proxy was driven with curl and the FastAPI test client**, not from a browser
  session. The CORS behaviour was verified with an explicit `Origin` header, which is
  what a browser sends, but a real browser was not used.

---

## 10. How to reproduce

```bash
cd proofs/vercel-python-hosting

# 1. The model is reachable from a Python process. The key is read from the
#    environment and is never printed.
set -a && . ../../.env.chatbot && set +a
python model_probe.py

# 2. The service, with the key and the shared secret.
export CHAT_INTERNAL_TOKEN="$(openssl rand -hex 24)"
python -m uvicorn api.index:app --host 127.0.0.1 --port 8077

# 3. The boundary assertions. 22 of them.
python boundary_checks.py

# 4. The measurements.
python measure.py
python cost_model.py
```

`STUB=1` makes the service answer without calling the model, which is how the proxy hop
cost is measured on its own.

The proof is throwaway. It lives on `prototype/vercel-python-hosting`, out of `main`,
and the decision it produced is what belongs in the main branch.

---

## 11. Sources

Vercel documentation, read 2026-10-29:

- [Using the Python Runtime with Vercel Functions](https://vercel.com/docs/functions/runtimes/python)
- [Python Functions in the /api Directory](https://vercel.com/docs/functions/runtimes/python/api-directory)
- [Deploy a FastAPI app on Vercel](https://vercel.com/docs/frameworks/backend/fastapi)
- [Vercel Services](https://vercel.com/docs/services)
- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations)
- [Configuring Function Regions](https://vercel.com/docs/functions/configuring-functions/region)
- [Runtime Logs](https://vercel.com/docs/observability/runtime-logs)
- [Vercel Error List](https://vercel.com/docs/errors/error-list)

Vercel issues and discussions:

- [vercel/vercel#12676](https://github.com/vercel/vercel/issues/12676) — mixing root
  functions with Next.js app routes, with the compatibility table that rules out the
  same-project root `api/` shape for this repository.
- [vercel/vercel#9840](https://github.com/vercel/vercel/discussions/9840) — `next dev`
  and `vercel dev` disagreeing about which routes exist.
- [vercel/next.js#58647](https://github.com/vercel/next.js/discussions/58647) — the
  Next.js and Flask template, and the `/api` conflict that comes with it.
- [Python functions on a Next.js app](https://www.azfuller.com/blog/python-functions-on-a-next-app)
  — the bundle size failure and the `excludeFiles` workaround that Next.js restricts.

Internal:

- `docs/research/model-access.md` — model identification, rates, and the spend limit.
- `docs/chatbot/knowledge-contract.md` — the rules the service enforces.
- `docs/chatbot/interaction-contract.md` — the client contract that does not change.
