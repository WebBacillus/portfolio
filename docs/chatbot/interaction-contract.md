# Chat panel interaction contract — milestone 1

**Status:** proposal, awaiting owner reaction
**Scope:** the first chat panel's look and feel. This is a UI contract, not the
implementation spec. The knowledge rules live in `docs/chatbot/knowledge-contract.md`.
**Prototype:** branch `prototype/chat-panel-variants`, `components/prototype/chat/`

---

## 1. The decision this contract settles

A visitor meets a chat panel that answers **CV questions only**. The panel has to make
that narrow scope obvious *before* the visitor types anything, and a project question has
to land on the project page rather than in the transcript.

The three questions the owner still has to answer are at the end of section 11.

---

## 2. The three variants

All three render the same behaviour. They differ only in placement, so the owner can
choose the placement without re-deciding the behaviour.

| Variant | Placement | How to open it | Best when |
| --- | --- | --- | --- |
| **A. Dock** | Floating card, bottom right on desktop, full screen sheet on a phone | A launcher button | The chat is an optional extra and the portfolio content stays the main event |
| **B. Page** | Its own route, `/ask` | A nav link | The chat deserves a full page and the visitor came to use it deliberately |
| **C. Inline** | A section in the page flow, under the hero on the home page, at the foot of each project page | Scrolling to it | The chat is part of the story of the page rather than a layer on top of it |

Screenshots of each variant are in `docs/chatbot/prototype-shots/`.

| File | What it shows |
| --- | --- |
| `a-desktop-empty.png` | The dock, closed, then open on the empty state with both question groups |
| `a-desktop-redirect.png` | The dock answering a project question with the link card |
| `a-desktop-error.png` | The dock in the error state with the retry button |
| `a-mobile-sheet.png` | The full screen sheet on a 390 by 844 phone |
| `b-page-redirect.png` | The dedicated page, with the two suggestion columns |
| `c-inline-empty.png` | The inline section in the page flow |
| `c-inline-redirect.png` | The inline section answering a project question |

**Recommendation: A (the dock).** The site already has a `/work` index and an `/about`
page, so the portfolio content covers both. A dock adds the chat without adding a route,
and it does not push the existing sections down the page. If the owner wants the chat to
be a first class destination, B is the fallback.

The prototype serves all three at once, switchable in the browser:

```
pnpm dev
http://localhost:3000/?variant=a    the dock
http://localhost:3000/?variant=b    the page, at /ask
http://localhost:3000/?variant=c    the inline section
```

A floating bar at the bottom of the screen switches between them, and the arrow keys
switch too.

---

## 3. Scope, stated before anything is typed

Three places state the scope, because a visitor meets only one of them at a time.

**The launcher button (variant A).** The label reads `Ask about my CV`. Not
`Ask me anything`. The name of the feature may be anything the owner likes, but the
button the visitor presses is the one piece of text that decides what they expect, and
`Ask me anything` promises a general assistant that milestone 1 is not.

**The panel header (variant A) and the page subtitle (variant B) and the section
paragraph (variant C).** All three carry the same sentence:

> I answer questions about my CV: background, experience, skills, and education. For a
> project I will point you to its page.

**The suggested questions themselves.** The first group is CV questions only, so the
shape of the allowed scope is visible in the very first screen of the panel.

---

## 4. Suggested questions

Two visually distinct groups, in this order.

**Group one, CV questions.** Solid purple outline, because these are answered in the
transcript.

- What is your current role?
- What did you do at NITMX?
- Which skills do you list?
- Where did you study?

These four cover the four topics milestone 1 allows: background, experience, skills, and
education. They are the questions a recruiter actually asks, and each one has an approved
answer in `knowledge/cv.md`.

**Group two, project questions.** Muted outline with a small arrow, under a one line
explanation, because these are **not** answered in the transcript.

> Ask about a project and I will link you to its page instead of answering here.

- Tell me about SE for ML
- What did you build for NECTEC?
- What is SCB Tech X Loan Origination?

The visual difference is the point. A visitor sees two kinds of question and two kinds of
outcome before typing anything.

**On a project page (variant C), the context changes.** The visitor is already reading
about SE for ML, so asking "tell me about SE for ML" would send them back where they
started. The third suggestion there is `Which skills did you use for SE for ML?`, which
is answerable, because the contract allows a skill to be named with the work that backs
it.

---

## 5. The project redirect

A project question produces **one line of prose, then a link**. The link is the answer.
Prose is never the answer to a project question, because prose becomes a second source of
truth that drifts from the page.

```
That one has its own page with the detail: SE for ML.

┌────────────────────────────────────────────────┐
│ SE for ML                                  ↗    │
│ An image classification system for storefront  │
│ photos, with a human review queue and         │
│ drift-triggered retraining.                   │
└────────────────────────────────────────────────┘
Source: Project page
```

**The card carries the project page's own summary, word for word.** The routing index in
`knowledge/projects.md` holds those summaries, and a check verifies that the index, the
page frontmatter, and the mock's copy all agree. A redirect that paraphrases is a
redirect that will be wrong within a month.

**The source label follows the fact.** A project redirect is labelled `Project page`,
because the visitor can go and check it there.

**A skills question about a project names the approved pairing.** `Which skills did you
use for SE for ML?` answers with that project's pairing from `knowledge/cv.md`, and still
points at the page. A project with no pairing row, such as ProfanityGuard and Adozoil,
never has a skill attached to it.

---

## 6. Source display

Every answer carries exactly one of the four labels from the knowledge contract:
`Resume`, `About page`, `Project page`, `In progress`.

The label sits under the answer, small and uppercase, so it reads as provenance rather
than as content.

**A label the visitor can open is a link.** `Resume` and `About page` link to `/about`.
`Project page` links to the project page the answer is about. `In progress` is plain
text, because the work has no page to point at, and a label that points nowhere is
decoration.

The label follows the **fact**, not the topic. An answer about the True Corporation role
is labelled `Resume` even though the topic is the employer, and an answer about the
customer support agent is labelled `In progress` even though it sits inside the True
Corporation entry.

---

## 7. Reset

A reset control empties the transcript and returns the panel to the suggested questions.

- Variant A: a `Reset` button in the composer, disabled while the transcript is empty.
- Variant B: a `Reset` control beside the `Conversation` heading.
- Variant C: a `Reset` button in the composer.

Reset clears the transcript only. It does not navigate, and it does not reload the page.
The transcript is tab scoped and nothing is persisted, so a reload is also a reset.

---

## 8. The three states

Three distinct states, because they mean different things and the visitor acts
differently on each.

**Loading.** A spinner and the word `Thinking`, in the transcript. The send button is
disabled while the request is in flight, so a visitor cannot fire a second one.

**Error.** A red block saying the answer could not be produced, and that no answer was
substituted. It carries a `Try that again` button that resends the failed question. The
visitor's question stays visible and unanswered, because the question was fine and the
request was not. **No assistant turn is added for a failure.** A failure is a state, not
something the assistant said.

**Temporarily unavailable.** An amber block saying the usage limit was reached, so the
assistant is paused and no answer was produced, and pointing at the contact form. There
is no retry button, because retrying a spend limit does not help. This is the state the
$5 monthly budget will actually produce, so it has to read as a pause rather than a
failure.

---

## 9. Mobile

The panel is a **full screen sheet** on a phone, not a small floating card. A 400 pixel
card on a 390 pixel screen is unusable.

- The sheet fills the viewport and uses `100dvh`, so the composer stays reachable when
  the on-screen keyboard opens.
- The page behind is scroll locked while the sheet is open, so the content does not slide
  under the visitor's thumb.
- **The composer is not focused on open on a touch device.** Focusing a field on a phone
  pops the software keyboard, which covers the suggested questions the visitor has not
  read yet. The field waits to be tapped. A phone user taps it; a keyboard user tabs to it.
- The launcher sits 24 pixels from the bottom and the right edge, clear of the home
  indicator.

The same rule applies on a desktop with a touchscreen, where the same keyboard would pop
and cover the same suggestions.

---

## 10. Keyboard

| Key | What it does |
| --- | --- |
| `Tab` | Moves through the launcher, the suggested questions, the transcript links, and the composer, in that order |
| `Enter` | Sends the question |
| `Shift` + `Enter` | Adds a line in the composer |
| `Escape` | Closes the dock, and focus returns to the launcher button |

A hint under the composer reads `Enter sends, Shift+Enter adds a line.` A keyboard user
should not have to guess.

The transcript is a live region (`role="log"`, `aria-live="polite"`), so a new answer is
announced without stealing focus from the composer.

The error and unavailable blocks are `role="alert"`, so they are announced when they
appear.

Focus order inside the panel was checked in the browser: the close button, then the
suggested questions in order, then the transcript links, then the composer.

---

## 11. What the owner still has to decide

1. **Which placement.** A is recommended. B if the chat should be a first class
   destination with a nav link. C if the chat should read as part of the page.
2. **The launcher and heading wording.** The contract recommends `Ask about my CV` over
   `Ask me anything`, because the narrow scope has to be obvious before the first
   question. The feature can still be called Ask Me Anywhere, or anything else, in the
   nav and in the section eyebrow.
3. **Whether the project question group belongs in the empty state.** Showing the
   project group up front teaches the redirect behaviour, but it also puts project
   questions in front of a visitor who came for the CV. The alternative is to leave the
   project group out and let the redirect appear when it is asked for.

---

## 12. How this was checked

The prototype runs against a mock engine, so no model is called and no key is needed.

- `pnpm prototype:check` runs 82 assertions over the real source: that every catalogue
  project redirects to its own path, that every project is reachable by its title and by
  at least one alias, that a skill is only paired with a project that has the pairing,
  that an E3 skill never carries a pairing, that the answer shape follows the question
  kind, that a redirect repeats the page's own summary, and that every CV answer carries
  a source label.
- The routing data was checked against `knowledge/projects.md` and against the
  frontmatter summary of all ten pages in `content/projects/`. All three agree.
- The three variants were driven in a browser at 1280 by 800 and at 390 by 844: the
  project redirect, the CV answer, loading, error, retry, unavailable, reset, focus
  return after `Escape`, the tab order, and the mobile sheet's scroll lock were each
  observed working.
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` all pass.

### The defect the prototype was built to catch

The first version of the matcher asked whether a project **title contained the whole
question**, which is backwards. `Tell me about SE for ML` did not match, and the panel
showed the decline template for the very question it was offering as a suggestion. The
matcher now matches whole phrases on word boundaries, longest phrase wins, and a skill
that is also a listed CV skill does not trigger a redirect on its own. The
`prototype:check` script exists so that this class of failure cannot come back
unnoticed.

---

## 13. Prototype boundaries

This is a throwaway prototype on a throwaway branch. It is not production UI.

- The engine is a mock. The strings are placeholders that show the shape of an answer,
  not approved copy. The real copy comes from the knowledge contract.
- The project switcher and the state demo controls are hidden in production builds.
- Nothing here is persisted. The real milestone 1 uses short tab scoped history and no
  persistent chat content.
- ChuMaiNichi was read as an interaction reference only. It is not the owner's project
  and must never appear in the panel, in a redirect, or in a suggested question.
