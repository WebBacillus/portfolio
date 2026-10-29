# Ask me anything — milestone 1 implementation specification

**Status:** implementation ready · **Tracker:** `t_76cb77e2` · **Date:** 2026-10-29

## Outcome and boundary

A visitor can ask about Pasit Khumsena's CV in the existing Next.js portfolio. The public launcher reads **Ask me anything**, but the opened panel states its actual scope before a question is entered: background, education, experience and skills from the approved CV. A project question produces a link card to the matching project page, carrying that page's summary verbatim. The model does not answer project questions in prose.

This milestone uses a single model request for an answer; it has no agent loop, model-invoked tools, retrieval database, PDF upload, job matching, or persistent chat transcript. The resume PDF is a visitor download, never an input parsed by the chatbot.

## Sources of truth

1. `/home/webbacillus/Documents/resume-general.md` is the owner-approved resume source. `knowledge/cv.md` is its scoped, labelled derivative. `docs/chatbot/knowledge-contract.md` defines claim boundaries and skill evidence classes.
2. `content/projects/*.md` frontmatter supplies the ten project summaries; `knowledge/projects.md` supplies the title, aliases and route index. The redirect must repeat the page summary word for word.
3. The interaction prototype and its 86 source assertions are on `prototype/chat-panel-variants` at `908779d`; its contract is `docs/chatbot/interaction-contract.md` on that branch. The owner chose variant A and the wording recorded in `docs/chatbot/owner-decisions.md` and `t_c940549b`. Those decisions supersede the contract's earlier recommendations in sections 3 and 11.
4. The hosting proof and independent checks are on `prototype/vercel-python-hosting` at `26e5ed6`. The closed `t_ca72ff71` decision selects **Shape A**, a separate Python Vercel project, and supersedes the earlier Shape C recommendation in the proof document's section 8.

The model is `gpt-6-luna` via a dedicated server-side OpenAI API Platform key. The proof's live call established access at the time it ran; deployment must verify access again. The hard $5 monthly project spend limit is a required owner dashboard setting **not yet verified live**.

## Visitor interaction

- A floating launcher at the lower right opens a dock on desktop. On a phone, it opens a `100dvh` full-screen sheet and locks scrolling behind it. The launcher label is **Ask me anything**. The open panel header explains the CV-only scope and that project questions lead to project pages.
- The empty state presents CV questions first, then a visually distinct project-question group with a brief explanation of the redirect. Use the question sets in interaction contract section 4. No prototype variant switcher or demo controls ship.
- Enter sends; Shift+Enter inserts a newline. Escape closes the dock and restores focus to the launcher. Do not focus the composer automatically on touch devices. Keep the composer reachable when the software keyboard opens. The transcript is `role="log"` with polite live announcements; errors and unavailable notices use `role="alert"`.
- Reset clears the tab-scoped transcript and returns to the suggestions. Reload also clears it. The panel does not store conversation text in local storage or a database.
- Loading shows **Thinking** and prevents a second send. Failure leaves the visitor's question visible, adds no assistant turn, and offers **Try that again**. An exhausted limit or budget shows **Temporarily unavailable**, explains that no answer was produced, and links to `/contact`; it has no retry action.
- Every successful CV answer displays exactly one source label from **Resume**, **About page**, **Project page**, **In progress**. The label follows the fact, not the topic. Resume and About page labels link to `/about`; Project page links to the matching page; In progress is plain text.

## Answer routing and claim policy

- Route recognized project questions deterministically using the title and aliases in `knowledge/projects.md`. Match whole phrases with longest match winning; a skill term alone must not trigger a project redirect. Return a typed redirect payload with `title`, `href`, and `summary` read from the catalog. A project question yields one short handoff sentence and the card; the model is not asked to produce its summary.
- CV questions use only `knowledge/cv.md` as answerable context. Keep responses at source fidelity: do not expand a bullet into an inferred outcome or pair a skill with a project unless the approved E1/E2 pairing exists. List-only E3 skills may be described only as listed skills. In-progress work is explicitly marked and never described as shipped. No phone digits are recited; link to `/contact`. Email and resume download may be offered per the knowledge contract.
- A question outside the approved scope receives the contract's brief decline and links to the work index and resume. Unknown projects never get fabricated routes. A model failure never triggers a substitute answer or a silent model change.
- Validate the model output before displaying it. The response envelope distinguishes `answer`, `redirect`, `decline`, `error`, and `unavailable`; only `answer` carries an assistant message. Do not trust a model-produced URL or source label without checking it against the approved set.

## Request boundary and limits

The browser calls same-origin `POST /api/chat`. The Next.js route validates the request and proxies server-side to a separately deployed Python FastAPI service using `CHAT_API_URL` and `CHAT_INTERNAL_TOKEN`. The Python service checks the token with constant-time comparison before parsing or invoking the model. Missing URL, token or API key fails closed. The backend URL, token, upstream response body and model internals never appear in a visitor response.

Use the proven request ceilings as defaults: 32 KiB body, 1,000 characters per trimmed question, at most 12 retained history messages, and at most 8,000 characters per history message. Reject blank questions before any model call. Cap output at 400 tokens. A request times out after 30 seconds. Enforce 20 requests per visitor IP per minute with a durable/platform rule rather than relying on an in-memory map. Introduce a signed, HttpOnly, SameSite=Lax session cookie and a server-side per-session cap of **30 sends per 24 hours**; this is an implementation default and must be configurable without code changes. Count only accepted sends; reset of the visible transcript does not reset the usage counter. Do not use a client-supplied IP header as an authoritative identity unless it comes from the trusted platform/proxy boundary. Forward the verified visitor IP to the backend so visitors do not share one rate-limit bucket.

Map validation failures to clear, non-spending responses; map rate/session/provider budget exhaustion to `unavailable`; map timeouts and upstream failures to `error`. Preserve one safe public error schema. The service writes no question, answer, history or key material to logs. The browser never calls the Python origin directly.

## UI implementation choice

Build the dock with plain Tailwind and the live `app/globals.css` tokens, plus accessible native elements or the installed `@base-ui/react` primitives where needed. The existing `components/ui/` set imports uninstalled Radix packages and depends on CSS tokens that the live stylesheet does not define; it is not a safe dependency for this milestone without a separate repair.

## Privacy and launch gates

Publish a visible notice before public launch: the visitor's question and short tab-scoped conversation history are sent through the site's server to OpenAI; the site does not persist transcript content or log request bodies; hosting runtime logs may retain request metadata. State the contact route for people who prefer not to use the chat.

Deploy the Next.js app and the Python service as separate Vercel projects. Configure `CHAT_API_URL` and the same `CHAT_INTERNAL_TOKEN` on their respective server environments; configure the API key only on the Python service. Confirm the $5 project hard spend limit in the OpenAI dashboard **before public traffic**. Verify the deployed proxy, secret rejection, per-IP isolation, privacy notice, all project pages, and a real model answer with controlled spend before opening the launcher publicly.

## Acceptance evidence

| Check | Evidence required |
| --- | --- |
| Every catalog project redirects to its own page | Exhaustive routing check over all ten projects and aliases; card summary equals `content/projects/<slug>.md` frontmatter |
| CV provenance and claim limits | Tests for each of four source labels, E1/E2 pairing, E3 list-only wording, in-progress wording, unknown facts and phone routing |
| No fabricated failure answer | Force model error and timeout; verify no assistant message is appended and retry is offered only for `error` |
| Backend and abuse boundary | Independent HTTP checks for missing/wrong secret before spend, missing configuration, blank/oversized input, history bounds, per-IP isolation and per-session cap |
| No leakage | Send a hostile upstream response containing secrets and a stack trace; verify safe public response; search service logs for unique question and answer markers |
| Usable dock | Browser checks at desktop and 390×844: launcher wording, both suggestion groups, keyboard flow, focus return, mobile keyboard, loading, retry, unavailable and reset |
| Build and deployment | `pnpm lint`, TypeScript, `pnpm build`, Python type checks, all dynamic project pages, deployed same-origin proxy, and confirmed hard spend limit |

The prototype's checks establish the shape of these tests; implementation tests must exercise production code and the deployed boundary rather than reusing mock-only assertions as proof.
