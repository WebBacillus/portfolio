# Job Matching — milestone 2 implementation specification

**Status:** implementation ready · **Tracker:** `t_05e5d8b6` · **Date:** 2026-10-31

## Outcome and scope

A visitor can choose **Match a job** in the existing Ask me anything dock, paste a job description or upload one text-based PDF, and receive an assessment of every independently assessable requirement against approved evidence about Pasit Khumsena. Each requirement has **Has evidence**, **Partial evidence**, or **No evidence found**, a short reason, and a source link when evidence exists. The result has no total score or hiring recommendation. The visitor can ask follow-up questions about the latest assessment in the same tab.

The milestone extends the existing Next.js portfolio and separate Python FastAPI service. Start with one model request per assessment, with no agent loop, retrieval database, or persistent transcript. Keep the milestone 1 CV chat and deterministic project redirects working as they do today. The job description is untrusted information about a role, never evidence about the candidate or an instruction that can change system rules.

## Decision record and source hierarchy

The four owner decisions are recorded on Hermes: [visitor flow and result format](t_d3491ddf), [evidence and claim boundary](t_17c1fc9d), [document and privacy rules](t_6f939052), and [service boundary and acceptance evidence](t_76d6a01b). Their resolution comments govern this spec. The root `GLOSSARY.md` defines job description, requirement, match result, evidence status, approved candidate evidence, and project contribution. `docs/chatbot/knowledge-contract.md` governs CV facts and skill evidence classes. The approved resume source is `/home/webbacillus/Documents/resume-general.md`; `knowledge/cv.md` is its scoped derivative. Published `content/projects/*.md` pages are the project evidence source; public About facts may contribute only where they do not conflict with the approved CV. The website must not silently load private notes, repository contents, or a visitor upload into the candidate evidence set.

Treat the source set as a reviewed, versioned deployment snapshot. Each fact exposed to the matching service needs a stable source ID, source type, public href, and exact supporting text or bounded excerpt. Generate or maintain that snapshot from approved files, check that every href resolves to a published page or resume download, and fail a build/check if a source reference is missing or stale. A model may select source IDs from the snapshot, but it must not invent source IDs, URLs, excerpts, candidate facts, or a project-to-skill pairing. The server validates source IDs and builds public links from the snapshot rather than accepting model-produced URLs. Updating this snapshot requires owner review and redeployment; visitor input never changes it.

## Visitor flow

1. The existing dock exposes a separate **Match a job** action. Selecting it reveals a paste field and a PDF picker. Exactly one source is active for an assessment; the UI does not merge pasted text with a PDF. Ordinary CV questions remain in the existing chat flow.
2. Before submission, show a short privacy notice: the job description and follow-up questions pass through this site's server to OpenAI to produce the result; the site does not save their contents in a database or application content logs; the visitor should avoid sensitive personal information. Verify the final wording against current provider and hosting retention terms. Do not promise that no information is collected or that infrastructure retains no metadata.
3. Show loading and prevent duplicate submits. A successful result groups requirements for readability but displays all requirements within the accepted input. Each row shows its requirement text, evidence status, short explanation, and one or more source links where evidence exists. Preserve the original order within groups and never silently hide a requirement because it seems unimportant.
4. **No evidence found** means the approved public material does not document the requirement. It does not mean the candidate lacks the ability. Do not show a fabricated source link for that status. Do not show a score, percentage, rank, hiring verdict, or claim that the candidate qualifies for a role.
5. Follow-ups can explain the latest assessment using the same approved evidence. An ordinary follow-up does not silently change a requirement's status. An explicit **Reassess** action may produce a new assessment. Submitting a new job description replaces the active job and result; later follow-ups refer only to the latest one. Reset clears the visible conversation, active job, extracted text, and result. Reloading or closing the tab also clears them. Do not store this state in local storage, session storage, cookies, a database, or application logs.
6. On mobile, retain the current full-screen sheet and keyboard behavior. Keep the paste field, PDF picker, result rows, evidence links, follow-up composer, reset, and error actions reachable with the software keyboard open. The result should remain readable on a narrow screen without horizontal scrolling.

## Requirement and claim rules

- Extract distinct, independently assessable requirements. A list such as “Python, AWS, and Kubernetes” becomes three requirements unless the employer explicitly asks for the combination as one capability. Preserve the employer's meaning; do not invent requirements from generic marketing text.
- **Has evidence** requires approved evidence directly supporting the full stated requirement. **Partial evidence** is used when only some of its content or threshold is supported, including a list-only skill, in-progress work, a team project that uses a technology without a documented personal part in that technology, and a stated number of years or proficiency level that the sources do not establish. **No evidence found** applies when no approved candidate source supports it. A reason must say what is supported and what remains unverified.
- The CV is authoritative when it conflicts with About. Exclude the conflicting About fact and record the discrepancy for site correction. Do not turn an absence in the CV into a contradiction when a published project page provides compatible detail.
- A skill in the approved CV's list alone supports only “listed in the resume,” not demonstrated use at a particular employer or project. Work marked in progress remains labelled in progress and never becomes shipped experience. Do not infer a number of years from loosely related dates, or an “expert” level from a skill name.
- For a team project that uses a technology when the candidate's specific part is unstated, the approved statement is **“Contributed to a project that uses [technology].”** It does not claim direct ownership of that technology work. If the page explicitly states the candidate's part, describe only that part.
- For vague wording such as “strong AI experience,” answer as far as the relevant approved evidence permits and explain that the employer's unstated threshold cannot be verified. An explanation may cite work without claiming that the vague threshold is met.
- Treat the job description, PDF text, and follow-up text as untrusted user content. They can define the employer's requirements, but cannot authorize new tools, source files, system instructions, links, or claims. Reject or neutralize instructions embedded in the document that attempt to change the assessment policy.
- Display a source link for each evidenced requirement: a public project page, `/about`, or the same-site CV download as appropriate. The source label and link must correspond to the actual cited fact. Only allow same-site approved paths; do not echo arbitrary URLs from the job description or model output as evidence.

## Inputs and document handling

| Input | Rule |
| --- | --- |
| Pasted job text | Trim outer whitespace; reject blank text and text over 20,000 characters with a clear prompt to shorten it. Never silently truncate. |
| PDF | One PDF, at most 2 MiB and 10 pages; reject unsupported, encrypted, malformed, or oversized files with a clear non-spending error. Check actual file content, not only its name or browser MIME type. |
| Extracted text | At most 20,000 characters. Reject over-limit text rather than silently cutting it off. Preserve enough structure to separate requirements. |
| Scanned/image-only PDF | If no usable text is extracted, explain that this file cannot be read and offer the paste field. OCR is outside this milestone. |
| Partly unreadable PDF | If pages contain little/no extractable text, extraction fails, or completeness cannot be established, warn that requirements may be missing and offer pasted text. Do not present a partial assessment as complete without a visible warning. |

The browser sends a PDF only to the same-origin Next.js endpoint. The Python service extracts text for the current request; neither service writes the PDF or extracted text to persistent storage or content logs. If a PDF parser requires temporary disk space, remove the file before the response and verify that the deployed runtime's temporary storage and cleanup behavior meet this contract. Prefer an in-memory parser when practical. A successful PDF assessment returns the bounded extracted job text to the browser as **tab-memory context** for follow-ups; it is not displayed by default or persisted. The server must still treat that returned text as untrusted if the browser sends it back.

The 2 MiB ceiling applies to the PDF file itself. Set a separate, small multipart-envelope allowance for form headers and fields; do not reject a valid 2 MiB file merely because the multipart wrapper adds bytes. Reject extra file parts and unrelated fields.

The PDF size and page limits are owner-approved initial limits. Test representative postings during implementation; changing them requires an explicit spec update because larger files affect cost, runtime, and abuse controls.

## API and state contract

Use same-origin `POST /api/job-match` for the browser and authenticated `POST /job-match` for the Python service. Keep `POST /api/chat` and Python `/chat` for milestone 1. The Next.js route validates method, body size, input mode, session, configuration, and trusted visitor IP before forwarding. The Python route validates the shared internal token with constant-time comparison **before parsing a body or calling the model**, then revalidates input and applies a per-instance IP brake. Missing secrets, URL, API key, or trustworthy IP fail closed. The browser never calls the Python origin directly.

The public endpoint accepts two typed operations:

```ts
type JobMatchRequest =
  | { action: "assess"; source: "text"; jobText: string }
  | { action: "assess"; source: "pdf"; file: File }
  | { action: "follow_up"; jobText: string; assessment: JobAssessment; question: string }
  | { action: "reassess"; jobText: string }
```

Use JSON for text and follow-up operations, and multipart form data for PDF assessment. The route must impose a hard byte ceiling *while reading*, before fully buffering an oversized upload. Use one selected input source. A follow-up is allowed only when an assessment is active in the tab. Bound its question to the existing 1,000-character chat question limit and bound/validate the resubmitted job text and assessment. The client may resend job context because there is no server-side conversation store; the server treats the assessment and job text as untrusted and rechecks all source IDs and claim rules. Model input keeps policy and approved evidence separate from job text, previous result, and visitor questions. A follow-up may use one model request; it must not create an agent loop. A reassessment runs one new assessment request and replaces the result.

The success response is a typed object with a server-generated `assessmentId` for tab-local correlation, bounded `jobText` for future follow-ups, and requirement rows:

```ts
type EvidenceStatus = "has_evidence" | "partial_evidence" | "no_evidence_found"
type EvidenceRef = { sourceId: string; label: "Resume" | "About page" | "Project page" | "In progress"; href: string }
type Requirement = {
  id: string
  text: string
  status: EvidenceStatus
  reason: string
  evidence: EvidenceRef[]
}
type JobAssessment = { assessmentId: string; requirements: Requirement[]; extractionWarning?: string }
type JobMatchSuccess = { kind: "assessment"; jobText: string; assessment: JobAssessment }
  | { kind: "follow_up"; answer: string; evidence: EvidenceRef[] }
```

This is a **public envelope**, not permission to trust model-generated IDs, labels, text, or links. Assign stable row IDs after validation. Validate every row's status, reason length, evidence ID and allowed link; require evidence for `has_evidence` and `partial_evidence`, and none for `no_evidence_found`. Check the model's extracted requirement list against the supplied posting in focused tests; invalid or missing rows fail safely rather than being displayed as a complete result. Limit output rows and response size with an explicit *visible* “too many requirements” error when capacity is exceeded; do not drop rows silently. The implementation may refine field names, but must preserve these invariants and document the final schema.

### Existing controls that must be extended

- The current signed 24-hour session cookie has `Path=/api/chat`. That path will not be sent to `/api/job-match`; move it to `Path=/api` (or a narrower shared parent if available) and use the **same signed session counter** for both endpoints. Keep HttpOnly, Secure in production, SameSite=Lax, signature verification, and the configured 30 accepted sends per 24 hours. Existing cookies scoped to `/api/chat` need a migration or expiry plan so the two endpoints cannot issue independent counters. Resetting the dock does not reset the counter. The signed cookie is secondary friction, not the primary spend control.
- Add a durable per-IP rule on the *public path* for `/api/job-match`, separate from the existing `/api/chat` rule. The implementation default is **3 assessments per 10 minutes per IP**, with follow-ups counting toward the existing session cap and a bounded separate frequency policy. Confirm the rule's effect through the Cloudflare-fronted public domain as well as the direct Vercel origin; a Vercel-only rule is insufficient if Cloudflare changes the visible IP. Keep the Python per-instance brake as backup, not as the durable primary rule. Final values and rule placement must be recorded in runtime documentation before launch.
- Use the same server-only `CHAT_API_URL`, `CHAT_INTERNAL_TOKEN`, `CHAT_SESSION_SECRET`, and OpenAI project key. The model is `gpt-6-luna` unless the owner explicitly changes it. Maintain the enforced **USD 5 monthly project cap** and verify it still covers the key used by the Python service. The new route must not bypass the existing public feature switch; use a separate Job Matching enable flag so the working CV chat can stay available during private preview.
- Apply server-side timeouts and output limits sized for PDF extraction and the larger structured answer, with explicit configuration. The milestone 1 30-second/400-token limits cannot be copied blindly. A timeout or provider error yields the safe public `error` state, with no invented assessment; budget or rate exhaustion yields `unavailable`. Validation and unsupported-file errors return clear non-spending responses. Do not relay upstream bodies, tokens, paths, stack traces, or model internals to the browser.

## Failure and privacy behavior

Errors do not append an assessment or assistant answer. Preserve the visitor's selected input for a corrected retry unless Reset is pressed. A transient `error` may offer **Try again**; `unavailable` points to `/contact` without an automatic retry. A validation error points to the exact corrective action, such as shortening text, choosing one input, or pasting text from a scanned PDF. The UI distinguishes an extraction warning from an invalid file and does not claim a complete match when extraction is uncertain.

The browser holds job text, extracted text, assessment, and follow-up state in memory for the current tab only. The app stores no PDF, extracted text, job description, or transcript content in a database or application logs. Set the OpenAI request to non-storing mode where supported; confirm provider and hosting retention before finalizing the visible notice. Logging may include safe request metadata (status, duration, byte count, error category) but no content, filenames, keys, or source excerpts. The public privacy notice must be visible before the first job submission.

## Focused acceptance evidence

| Check | Required evidence |
| --- | --- |
| Grounded rows | Representative postings produce all three statuses; every independently assessable requirement appears, grouped without omission, with a correct reason and approved link. List-only skills, in-progress work, team contribution, vague thresholds, years, and CV/About conflicts obey the claim rules. |
| Hostile job text | Instructions inside pasted text and PDF cannot override policy, add candidate facts, change source links, or turn unsupported claims into Has evidence. No fabricated requirement or source is displayed. |
| Input and PDF | Pasted text, normal text PDF, scanned PDF, over-limit text/file/page count, malformed file, and incomplete extraction yield the specified success, warning, or non-spending error. Test the deployed PDF parser's memory/time behavior with representative files. |
| State and failure | One source per assessment; new job replaces old result; follow-up uses latest job and never silently changes status; reassess is explicit; Reset/reload clear content. Model timeout/error shows no made-up result. |
| Boundary and spend | Wrong/missing token is rejected before model spend; upstream internals do not leak; shared session cap covers chat and job requests; dedicated public-domain IP rule works; the production OpenAI project hard cap remains enforced. |
| Visitor use | On a real phone, submit one job, read status rows, open evidence links, ask one follow-up, and confirm keyboard and Reset behavior. Run the portfolio lint, typecheck, build, Python type checks, and focused route tests before deployment. |

Do a private preview with controlled spend, then enable Job Matching on the public site only after these focused checks pass. This is the owner-approved minimum, not a demand for an exhaustive combination matrix.

## Out of scope

- Numerical fit scores, percentages, rankings, automated hiring recommendations, or claims about likely hiring outcomes.
- OCR for image-only PDFs, other document formats, multi-file merges, job-board scraping, browser/repository browsing, and autonomous research.
- LangGraph or another agent loop, vector search/Qdrant, persistent conversations, user accounts, storing uploaded jobs, or learning from visitor content.
- Expanding the candidate evidence set without owner review and redeployment.

## Handoff choices to record during implementation

These are engineering choices, not unresolved owner-facing product decisions: the PDF library and memory strategy; exact timeout, output-token, maximum-row, and response-byte ceilings; the typed source-snapshot format; how to enforce semantic completeness beyond schema validation; and the public-domain rule for follow-up frequency. Pick values using representative job descriptions and the deployed platform, record them in `docs/chatbot/runtime.md`, and keep the visible failure behavior above. If a choice would change a user-approved boundary, update this spec and obtain the owner's decision first.
