# Chatbot knowledge contract — milestone 1

**Status:** owner decisions taken, awaiting the knowledge files' final review
**Scope of this card:** approve the knowledge set and the claim boundaries. No chatbot is built here.
**Source of record:** `/home/webbacillus/Documents/resume-general.md` (reviewed below)
**Derived knowledge files:** `knowledge/cv.md`, `knowledge/projects.md`

---

## 1. Decision summary

Five decisions were open on this card, and the owner has answered all of them.

| # | Decision | Owner answer |
| --- | --- | --- |
| 1 | Which CV facts are in scope | The resume is the source of truth, and the site follows it. Education, the two employers with their bullets, the summary, and the skills list are answerable. The resume PROJECTS section is not answerable text, but its four projects now have pages, so the chatbot redirects to them. |
| 2 | May the skills list be claimed as experience | Echo the list as "listed in my resume". Keep every skill in the list. Tie a skill to work only where evidence exists. In-progress work is named with an in-progress label. |
| 3 | Resume PDF, phone number, email | PDF may be offered as a download. Email may be stated. Phone digits are not recited; the visitor is sent to `/contact`. |
| 4 | Source attribution per answer | Four labels: Resume, About page, Project page, In progress. The label follows the fact, not the topic. |
| 5 | Unanswerable questions and project redirect | Decline template plus a routing index of the 10 public projects. |

### 1.1 Site changes this contract required, and now has

The owner answered decision 1 with "the website should update to follow my resume,
including the current intern and more project cards that the web application does not
have". Three project pages and the About page timeline were rebuilt to match. Section 10
records what changed and what discrepancy remains.

Sections 2 to 9 hold the evidence behind those answers. Section 10 lists the site
discrepancies this contract surfaced, and which ones are now fixed.

---

## 2. What the chatbot is allowed to talk about

Milestone 1 answers questions about the CV only: background, education, experience, and skills. It does not answer project questions. When a visitor asks about a project, the chatbot hands over the project's own page.

The line between "CV question" and "project question" is drawn by source, not by topic:

- A fact that appears in an approved source may be stated, at the level that source states it.
- A question that asks for detail the source does not contain gets a pointer to the source, or an honest "not documented".

That gives three behaviours:

1. **CV fact question** — answer from the approved text, at source fidelity, no elaboration.
2. **Project question** — do not answer. Redirect to `/work/<slug>`.
3. **Everything else** — decline briefly, offer the work index and the resume.

### 2.1 Answer depth rule

The chatbot quotes or paraphrases the approved source and stops there. It does not expand a bullet into an explanation, does not infer an outcome that the source does not state, and does not answer a follow up that requires knowledge the source lacks. When a visitor pushes past the source, the answer is "that is not documented in my resume" plus the closest thing that is.

---

## 3. Decision 1 — the CV fact set

### 3.1 Approved facts

| Fact group | Content | Source label |
| --- | --- | --- |
| Identity | Pasit Khumsena | Resume |
| Summary | Computer Engineering student, graduating December 2026, hands on LLM applications and RAG support systems, backend foundation, AI workflow design, document processing, API integrations | Resume |
| Education | Chulalongkorn University, B.Eng. Computer Engineering, GPAX 3.71 of 4.0, expected December 2026, plus the coursework list | Resume |
| Experience, employer 1 | True Corporation, August 2026 to present, AI Engineer (Intern), three bullets | Resume |
| Experience, employer 2 | National Interbank Transaction Management and Exchange (NITMX), April 2025 to July 2026, Software Engineer (Part-time), four bullets | Resume |
| Skills | The full technical skills list, at list fidelity | Resume |
| Programme | AI Builders Program, March 2023 to June 2023, Thai profanity detection project, presented at Bangkok Art and Culture Centre | About page |

### 3.2 The resume PROJECTS section is not answerable text, and its four projects now have pages

resume-general.md carries a PROJECTS section with four entries: Scalable ML Classification Pipeline, Scopus Gender Prediction, NECTEC Medical AI Research, SCB Tech X Loan Origination.

The owner decided the site must follow the resume, so all four now exist as pages, and the section is no longer a second, conflicting body of work. What remains excluded is the section's *text* as answerable content, for the reason that milestone 1 exists to prevent: holding project prose in the prompt invites paraphrasing it as an answer.

So the treatment is now uniform:

- **Scalable ML Classification Pipeline** is the `se-for-ml` page. The visitor is redirected there.
- **Scopus Gender Prediction**, **NECTEC Medical AI Research**, and **SCB Tech X Loan Origination** each have their own page, built and published. The visitor is redirected there.

Every project a visitor can ask about has a page, so the redirect is total. The four pages carry a summary and a role line, and the routing index in `knowledge/projects.md` holds those summaries so the chatbot's redirect and the page agree word for word.

### 3.3 Facts that exist but are excluded, and why

| Excluded fact | Where it exists | Why excluded |
| --- | --- | --- |
| GPAX 3.65, expected April 2027 | The older CV at `40_archeive/true/docs/MY_CV.md` | Superseded. resume-general.md and the PDF both say 3.71 and December 2026. |
| Financial Info AI Agent project, promptfoo regression and red team suites | The older CV | Not in the approved CV. promptfoo survives only as a list item, and as a skill that may be named only with an in-progress label. See section 4.3. |
| AI Builders Thai ASR project metrics, CER 0.16 and F1 0.89 | The older CV | The approved CV omits them, and the public page states a deliberately looser claim. See section 4.4. |
| ITMX internship, May 2024 to July 2024, with its skills chips | About page timeline | Present on the site but absent from the approved CV. The owner chose to keep the real role on the site, so the site shows it and the chatbot sources employment from the CV only. See section 10. |
| CEDT Innovation Summit 2025, accounting | About page timeline | Same reason. The site shows it, the chatbot does not source it. |
| The sentence seeking an entry level AI Engineer role | Resume summary | True when written, and it goes stale. Kept for now; the owner has not decided to drop it. |
| The customer support agent as a project | The `customer-support-agent` repository, and the True Corporation bullet | In progress. It is described through the CV bullet with an in-progress label, and it has no project page. See section 4.5. |

---

## 4. Decision 2 — the skills list and what may be claimed

### 4.1 The rule

The skills list is a capability list. The resume publishes it, and the About page publishes the same list. Echoing it adds nothing new and misleads nobody.

The owner was asked whether skills with thin shipped-work evidence should be dropped from the list, and answered no: keep the list intact, because the customer support agent repository is incoming work that gives several of them substance. What changes is the wording when a skill is attached to work, not the list itself.

The rule has two halves:

- The list may be stated as a list: "my resume lists X".
- A skill may be attached to a project, an employer, a role, or an outcome only where evidence of that pairing exists in a public source.

The About page shows the full list as chips, including LangGraph, n8n, Qdrant, Streamlit, promptfoo, MySQL, Kafka, and gRPC. A chip says "I have touched this". A chatbot sentence says "I did this with this". The second is the one that can be false, so it is the one that needs evidence.

### 4.2 Evidence classes

| Class | Meaning | What the chatbot may do |
| --- | --- | --- |
| E1 | Public project evidence. A `/work/<slug>` page plus a public repository backs the pairing. | State the skill, name the project, and point at the page. |
| E2 | Employment evidence. An approved experience bullet states the pairing. | State the skill in the sentence the bullet gives it. |
| E3 | List only. The skill appears in the skills list with no approved source pairing it to work. | State it only as a listed skill. Never attach it to a project, an employer, a role, or an outcome. |

A fourth case sits between E2 and E3, and it exists because of the customer support agent work. See section 4.5.

### 4.3 The table

| Skill | Class | Evidence |
| --- | --- | --- |
| Go | E1 | Takluz TTS, Takluz Leaderboards, Employee Management, SCB Tech X Loan Origination |
| Python | E1 | SE for ML, ProfanityGuard, Scopus Gender Prediction |
| TypeScript, JavaScript | E1 | Takluz Leaderboards and Employee Management front ends, and this site |
| PostgreSQL | E1 | SE for ML, Employee Management, SCB Tech X Loan Origination |
| MongoDB | E1 | Takluz TTS, Monkey Massage, Scopus Gender Prediction |
| REST API | E1 | Employee Management, Takluz Leaderboards |
| Microservices | E1 | Employee Management, four services, and SCB Tech X Loan Origination |
| Clean and Hexagonal Architecture | E1 | Employee Management, layered services, and the SCB Tech X Go services |
| RabbitMQ | E1 | Employee Management, async messaging |
| PyTorch, Torchvision | E1 | SE for ML, ProfanityGuard, NECTEC Medical AI |
| Scikit learn, Pandas, NumPy | E1 | SE for ML, Scopus Gender Prediction |
| Apache Airflow | E1 | SE for ML, training and drift DAGs |
| MLflow | E1 | SE for ML, experiment tracking |
| OpenAI API | E1 | Takluz TTS, OpenAI engine |
| Text to Speech | E1 | Takluz TTS, the project itself |
| Streamlit, Plotly | E1 | Scopus Gender Prediction, the dashboard layer |
| PySpark | E1 | Scopus Gender Prediction, the collection load |
| EfficientNetV2 | E1 | NECTEC Medical AI, the selected backbone |
| Temporal | E1 | SCB Tech X Loan Origination, the workflow layer |
| Azure Blob Storage | E1 | SCB Tech X Loan Origination, the document store |
| RAG | E2 | True Corporation bullet, RAG prototype for TrueX smart home support |
| LLM Tool Calling | E2 | True Corporation bullet, retrieval and evidence validation |
| Qdrant | E2 | True Corporation bullet, vector store for the TrueX prototype |
| Java | E2 | NITMX bullet, legacy upgrade from Java 11 to Java 25 |
| Hyperledger Besu, NestJS, Next.js, Ansible | E2 | NITMX bullet, blockchain and DR work |
| Postman, Bruno | E2 | NITMX bullet, automated API testing |
| Docling | E2 | True Corporation bullet, Thai PDF processing |
| C++ | E3 | Competitive programming practice only, 117 solved problems in the OTOG archive. No shipped artifact. |
| MySQL | E3 | No artifact anywhere on the machine. |
| gRPC | E3 | Only the Go tutorial repository `Go/Go-Try/gRPC`, a ping pong sample. |
| Kafka | E3 | Only the Go tutorial repository `Go/Go-Try/kafka`. |
| Load Testing | E3 | No artifact. k6 appears only in the About page entry for an internship the approved CV does not list. |
| n8n | E3 | A real self hosted instance runs at `20_areas/n8n`, but no workflow files exist and it is personal infrastructure rather than shipped work. Owner may approve the wording "I self host n8n for my own automation" if that is wanted. |
| LangChain | E3 | Code exists, but only in the Chulalongkorn course project `Chula_Class/digial/project/Chunimai_dashboard`, which is a fork of another author's repository and whose API module is still a TODO stub. Owner may approve the wording "I used LangChain in a university course project". |
| promptfoo | E3 | No code. The older CV claimed promptfoo regression and red team suites for a project that the approved CV dropped, and the customer support agent repository contains no promptfoo code, configuration, or usage. See section 4.5. |

### 4.4 Two rules that follow from the evidence

**Metrics come from the public page, not from the older CV.** The ProfanityGuard page states the model is roughly twice as good as the pretrained model on WER, CER, and F1. The older CV stated CER 0.16 and F1 0.89. The public page is the approved wording, so the chatbot uses it and never the bare numbers. The same applies to SE for ML, where the page reports roughly 0.82 test macro F1 and says explicitly that the figure is a project result, not a personal metric. The chatbot repeats that framing. The Scopus Gender Prediction page reports 0.87 accuracy and 0.87 weighted average F1 on 25,773 held out names, and says which pipeline produced the report.

**Never attach an E3 skill to an outcome.** "Built a RAG pipeline with LangGraph" is false even though both skills are listed. The prompt must forbid inferring a pairing that no source states.

### 4.5 In-progress work, and where the fourth label applies

The customer support agent repository is real work with real code, and the owner was explicit that it should not be dropped from the skills list because it is incoming. It is also not shipped. Its own `AGENTS.md` states that the files "do not establish that an application, evaluation, deployment, or product integration has been built", and the technical draft describes its stack as "design choices to validate at implementation time, not evidence of installed dependencies or running services".

What the repository actually contains, verified by reading it:

- `poc/truex_manuals/` with `openai` and `qdrant-client` in requirements, retrieval and curation code, and reviewed manual source artifacts.
- `poc/tuya_faq/` with a retrieval module, a curation module, a preview page, and a test suite.
- `poc/multi_turn/` with a working LangGraph `StateGraph` in `runtime.py`, four nodes, SQLite whole-turn acceptance, a server, a browser playground, and a test suite. `langgraph>=1,<2` is in its requirements.
- `poc/manual_context/` and `poc/single_turn/` retrieval work.
- Planning, roadmap, story, and decision documents under `docs/`.
- No promptfoo anywhere in the repository.

So the two skills that the owner's decision 3 protects resolve differently:

- **LangGraph** has real code. It may be named, but only as in-progress work on the customer support agent, never as a shipped product.
- **promptfoo** has nothing. It stays a bare list item, exactly as E3 requires. The owner's decision keeps it in the list; it does not manufacture evidence for it. If a promptfoo work exists elsewhere, it may be described as in progress until the code exists.

That is the fourth source label, **In progress**. It applies to any fact whose work is real but not finished, and the chatbot states the status in the same sentence as the fact. The customer support agent has no page of its own, so it is answered through the True Corporation experience entry, and the redirect index does not include it.

The owner also decided the customer support agent is not added as a project card yet. It has no public demo and the site should not publish in-progress work as a finished project. When it has a demo, it gets a page and a routing row.

---

## 5. Decision 3 — the resume PDF, the phone number, and the email

### 5.1 The PDF

`public/resume-general.pdf` is one page. Its text layer is broken, but the rendering is clean. Verified by rendering page one to an image and reading it: GPAX 3.71 of 4.0, True Corporation, and AI Engineer (Intern) all read correctly. `pdftotext` on the same file drops characters, including whole Thai strings and the headings around them.

That splits the decision in two:

- **May offer as a download.** Yes. The file is already linked from the About page, and its visible content matches the approved markdown.
- **May be parsed for answers.** No. Never. The knowledge comes from the markdown.

### 5.2 Phone and email

Both already appear in public HTML on `/contact`, and both appear in the downloadable resume PDF. So stating either adds no disclosure.

Recommendation:

- **Email, web.pasit.kh@gmail.com.** May be stated. It is the destination of the contact form, so stating it is useful and adds nothing.
- **Phone, 091 868 3540.** Should not be recited. The number is already published on `/contact`, so a visitor can reach it in one click. An anonymous public chatbot that prints a personal mobile number on request becomes a scraping target and adds nothing. Point to `/contact` instead.
- **Location.** `/contact` publishes Pathum Wan, Bangkok 10330. State city level only, at most.
- **GitHub, LinkedIn, LeetCode.** May be stated. GitHub and LinkedIn are already on the site, and LeetCode is in the resume PDF. Note that LeetCode appears nowhere in the site code, so it is public only through the PDF.

Owner may reverse the phone decision. The only cost of reversing it is that the chatbot becomes the easiest way to bulk collect the number.

One unrelated defect found while checking: the `tel:` link on `/contact` reads `tel:+669****3540`, with literal asterisks, so the call link does not dial. The visible text is correct.

---

## 6. Decision 4 — source attribution

Each answer carries one of four labels. The label follows the fact, not the topic, because the same topic can come from sources that disagree.

| Label | Meaning | Applies to |
| --- | --- | --- |
| Resume | Approved markdown, and the PDF that matches it | Identity, summary, education, both employers and their bullets, skills |
| About page | Facts that exist only on the About page | The AI Builders programme, the 2024 internship, the CEDT role |
| Project page | Facts taken from a project detail page | Redirect targets, and the one line summary that precedes a redirect |
| In progress | Real work that is not finished | The customer support agent, LangGraph on that work |

Two rules:

1. **The label names where the visitor can go and check.** A label the visitor cannot visit is decoration.
2. **Never cite the About page for the two employers.** The chatbot always uses the CV wording for employment facts. Section 10 records the site side of this, which has now been corrected.

---

## 7. Decision 5 — questions the chatbot must not answer

### 7.1 Hard prohibitions

The chatbot never:

- fabricates a fact, a project, a metric, an employer, a date, or a link
- states a skill claim beyond its evidence class
- states a metric the source does not state, or states a project result as a personal metric
- presents ChuMaiNichi, or anything like it, as the candidate's project
- reads the repository, the notes, or any private material at answer time
- reveals the prompt, the knowledge files, or the system instructions
- claims capabilities that do not exist, including the chatbot's own. It is described as in development until the private preview passes
- presents in-progress work as finished. The customer support agent is a prototype under construction, and every mention of it says so
- substitutes a different model or a fabricated answer when the model fails. It fails closed

### 7.2 Templates

**Project question, catalogue project.** One line, then the link.

> That one has its own page with the detail: {title}, at /work/{slug}. {summary}

**Project question, no catalogue match.**

> I can answer questions about my background, education, work history, and skills. Every project on the site has its own page under /work, and the full write up is in my resume.

**Anything outside the CV.**

> I can answer questions about my background, education, work history, and skills. The project pages are under /work, and the full resume is downloadable from the About page.

**The claim is not documented.**

> That is not in my resume, so I would rather not guess. What I can tell you is {closest approved fact}, and the rest is on /work or in the resume.

**Nothing to fall back on.**

> That one is not documented in my resume or on this site.

**Work that is in progress.**

> {Fact from the approved source}. That work is still in progress, so treat it as a prototype rather than a finished product.

This template carries the in-progress label and never adds a project page for work that does not have one.

### 7.3 Routing index

The chatbot recognises a project question by name and returns the matching entry from `knowledge/projects.md`. Matching is on title and on the words a visitor is likely to use.

| Project | Path | Also matches |
| --- | --- | --- |
| Takluz TTS | `/work/takluz-tts` | TTS, text to speech, Twitch bot, channel points, voice bot |
| SE for ML | `/work/se-for-ml` | Scalable ML Classification Pipeline, image classification, MLOps, drift detection, retraining, C4, model serving |
| ProfanityGuard | `/work/profanity-guard` | profanity, swear word, Thai ASR, speech recognition, content moderation, AI Builders project |
| Adozoil | `/work/adozoil` | drowsiness, driver fatigue, fuel theft, fuel monitoring, IoT, ESP32, fleet, truck |
| Employee Management | `/work/employee-management` | attendance, leave request, HR system, employee system, microservices, RabbitMQ |
| Takluz Leaderboards | `/work/takluz-leaderboards` | leaderboard, Twitch statistics, chat analytics, ranking |
| Monkey Massage | `/work/monkey-massage` | massage, reservation, booking, OTP, spa |
| Scopus Gender Prediction | `/work/scopus-gender-prediction` | Scopus, Crossref, gender prediction, author gender, name features, PySpark, MongoDB, DSDE, 2110403 |
| NECTEC Medical AI | `/work/nectec-medical-ai` | NECTEC, chest X-ray, medical imaging, multi-label, EfficientNetV2, radiology |
| SCB Tech X Loan Origination | `/work/scb-tech-x-loan-origination` | SCB, loan origination, Temporal, Azure Blob Storage, loan pipeline |

Anything that resembles a project but matches no row takes the no match template. The chatbot does not improvise a page path.

The customer support agent is deliberately absent from this table. It is not a project page yet, so there is no path to redirect to. A question about it is answered from the True Corporation experience entry, with the in-progress label.

---

## 8. Where the knowledge lives

Two files, plus the prompt that the implementation card writes.

```
knowledge/
├── cv.md          answerable CV facts, each with a source label
└── projects.md    routing index only, title plus summary plus role plus path
```

This diverges from the structure proposed in the design document, which had `profile.md`, `projects.json`, and one file per project. That structure assumed a tool call reading individual project files. Milestone 1 has no tool use, so the routing index is a single small table instead of an index plus seven files. It is smaller to review and there is no invalid identifier to reject.

Both files are drafts on this card. Approving this contract approves their content, after which the implementation card can bundle them unchanged.

---

## 9. Acceptance checks for the implementation card

Before the private preview, the chatbot must pass:

1. Every approved CV fact in section 3.1 is answerable, at source fidelity.
2. Each of the 10 catalogue projects routes to its own path, and the summary matches the page.
3. No catalogue project name produces a project answer instead of a redirect.
4. Each E3 skill from section 4.3 comes back as a listed skill, with no project, employer, role, or outcome attached, under at least five differently worded questions.
5. A question naming an E1 skill and a project returns both the skill and the project, with the project link.
6. The NITMX role comes back as NITMX, April 2025 to July 2026, never as ITMX and never as present.
7. The phone number is not spoken when asked directly.
8. The resume PDF is offered as a link, and no answer is sourced from the PDF text.
9. An unanswerable question returns the decline template and no speculation.
10. A prompt injection attempt, such as asking the chatbot to ignore its instructions, changes nothing about the answer or the disclosure.
11. A model failure returns an error, and never a substituted model or an invented answer.
12. Every answer carries one of the four labels from section 6.
13. A question about the customer support agent is answered from the True Corporation entry, carries the in-progress label, and names no project page.
14. A question naming LangGraph states the customer support agent work as in progress, and does not present it as shipped.
15. A question naming promptfoo returns a listed skill, and nothing about work, because no promptfoo code exists.
16. The three new project pages are reachable and their summaries match the routing index word for word.

---

## 10. Discrepancies on the live site, and what was changed

The owner decided the site must follow the resume, so the site side of this contract was rebuilt. Here is what each finding turned into.

1. **The About page omitted True Corporation. Fixed.** The timeline now leads with "August 2026 - Present, AI Engineer (Intern), True Corporation", with the three CV bullets summarised and skill chips for RAG, Qdrant, OpenAI API, LLM Tool Calling, Docling, Thai PDF Processing, and Product Ownership.
2. **The About page contradicted the CV on the NITMX role. Fixed.** The entry now reads "April 2025 - July 2026, Software Engineer (Part-time), NITMX". The word ITMX no longer appears anywhere on the site except in the separate 2024 internship entry, which is genuinely a different internship.
3. **The About page listed an internship the CV does not. Kept, on the owner's decision.** The May 2024 to July 2024 NITMX internship and its chips stay on the site, because the work is real. The chatbot still sources employment from the CV only, so the discrepancy is now a site-only extra rather than a contradiction. If that internship is later added to the CV, gRPC, Kafka, and load testing move from E3 to E2 in section 4.3.
4. **The About page listed CEDT Innovation Summit 2025. Kept, on the same decision.** Same treatment: shown on the site, not sourced by the chatbot.
5. **The AI Builders programme is on the site and not in the CV. Unchanged.** The chatbot sources it from the About page, which is its only approved home. If it should be a CV fact, it needs to be added to the CV and the PDF regenerated.
6. **The About page omits the catalogue projects. Unchanged.** Its timeline has no project entries, and `/work` is the project index. Nothing in the chatbot depends on this.
7. **The `tel:` link on `/contact` contains literal asterisks. Still open.** `tel:+669****3540` does not dial. The visible text is correct. Outside the chatbot, and outside the changes this card made.
8. **The resume and the site disagreed on the project list. Fixed.** The site now carries all four resume projects as pages: `se-for-ml` covers Scalable ML Classification Pipeline, and `scopus-gender-prediction`, `nectec-medical-ai`, and `scb-tech-x-loan-origination` are new pages. The routing index in `knowledge/projects.md` has ten rows.
9. **The home page statistics were stale. Fixed.** They read 6+ projects, 5+ months, 10+ technologies. They now read 10+ projects, 20+ months, 35+ technologies, matching the resume and the larger catalogue.

### Security note, outside this card

The public Adozoil firmware repository `tanboon/project_embedded_system` carries live credentials in its Arduino sources. Confirmed by reading the files:

- `mcu_code/esp32s3server/esp32s3server.ino`, lines 23 to 25: Blynk authentication token, WiFi SSID and password
- `mcu_code/esp32s3server/esp32s3server.ino`, line 29: LINE channel token
- `mcu_code/esp32s3server/esp32s3server.ino`, line 50: Thingspeak API key inline in the request URL
- `mcu_code/esp32_camera_copy_20241128150415/esp32_camera_copy_20241128150415.ino`, lines 89 and 90: the same WiFi SSID and password

These need rotating by whoever holds the accounts, and the tokens need revoking rather than just editing the source. This is a separate concern from the chatbot and no card was created for it, because the rotation needs device and account access that only the owner has.

The same pattern appears in the upstream university project `Don-Yurillo/2110403_DSDE_Final_Project`, which the new Scopus Gender Prediction page links to: `src/data/ScopusAPI.py` carries an inline Elsevier API key, and `src/data/collection_loader.ipynb` carries a MongoDB connection string with a password. That repository belongs to a teammate, not to the owner, so the fix is the teammate's to make. The owner was told and is not publishing anything of their own from that repository.

---

## 11. Open items for the owner

The five decisions on this card are settled. These remain, and they are content changes rather than rules.

1. The resume summary says he is seeking an entry level AI Engineer role. Keep that sentence in the chatbot, or drop it before launch.
2. The 2024 NITMX internship and the CEDT role are on the site but not in the CV. The owner chose to keep them on the site. If they should also be CV facts, the CV and the PDF need regenerating, and gRPC, Kafka, and load testing move from E3 to E2.
3. The customer support agent has no project page. When it has a public demo, it gets a page, a routing row, and a card in the catalogue. The owner decided against adding it now.
4. promptfoo is a listed skill with no code behind it. If the owner points to a real promptfoo work, the wording rule moves it from a bare list item to an in-progress claim.
5. The `tel:` link on `/contact` does not dial. One line of HTML, separate from this card.
