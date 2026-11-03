---
target: About page My Journey timeline logo treatment
total_score: 21
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 0
target_identity: "file:/home/webbacillus/10_projects/02_portfolio/portfolio/app/about/page.tsx"
target_fingerprint: "sha256:2aed717784785ad714aeb29d3624bee56df2eb26c09d5ae4915e253e6aa22e80"
target_path: /home/webbacillus/10_projects/02_portfolio/portfolio/app/about/page.tsx
timestamp: 2026-11-03T03-11-44Z
slug: app-about-page-tsx
---
# Method: dual-agent (A: design_assessment · B: detector_assessment)

## Design Health Score

This is an **Experience** surface: a portfolio timeline. Heuristics 7 and 10 are marked n/a for this mode.

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 2/4 | Scroll reveals can leave cards and logos faint while entering the viewport. |
| 2 | Match with the real world | 3/4 | Real employer and university marks support the chronology. |
| 3 | User control and freedom | 3/4 | This is read-only content with normal scrolling. |
| 4 | Consistency and standards | 2/4 | One fixed image height creates uneven perceived logo sizes; NITMX repeats across roles without a grouping cue. |
| 5 | Error prevention | 3/4 | No consequential actions are exposed. |
| 6 | Recognition rather than recall | 3/4 | Logos help recognition, but the repeated NITMX mark does not distinguish the two roles at a glance. |
| 7 | Flexibility and efficiency | n/a | Not applicable to this portfolio reading experience. |
| 8 | Aesthetic and minimalist design | 2/4 | The logo plate leads the card hierarchy, while dense descriptions and skill tags compete with role and date. |
| 9 | Error recovery | 3/4 | No consequential action needs recovery. |
| 10 | Help and documentation | n/a | Not applicable to this portfolio reading experience. |
| **Total** |  | **21/32** | **Acceptable (66%)** |

## Design Specificity Verdict

The timeline uses real marks and role details, so it has some specificity to this portfolio. The cards, purple timeline line, and alternating layout still feel like a common portfolio template; the logos are the strongest distinctive detail.

The logo plates provide a clean white background and adequate contrast. The images have meaningful alt text. But constraining every mark to the same `h-8` image height makes them look uneven: the square AI Builders logo reads much smaller than wide marks. The logo also appears before the date and role, then the organization name is repeated in the card heading. NITMX appears twice with no visual cue that these are distinct roles.

The deterministic detector reported **0 findings** for `app/about/page.tsx`. That does not catch the optical sizing and hierarchy issues above. In the fresh browser view, the timeline was very pale and the logos were difficult to discern; the design reviewer also saw faint cards during a scroll capture, though animation may have affected that snapshot. No overlay is available: the browser tool did not allow script injection.

## Overall Impression

The logo treatment is not broken, but it is not doing as much UX work as it could. It gives the timeline credibility, yet inconsistent perceived scale and its position ahead of the role/date make it compete with the information people are here to scan. Improve optical sizing and give organization identity a deliberate place in the card hierarchy.

### Priority Issues

- **[P2] Normalize perceived logo size.** The same `h-8` rule makes square AI Builders look much smaller than wide True, NITMX, and CEDT marks. Use per-logo optical sizing or a shared visible-area target so each mark carries similar visual weight.
- **[P2] Reduce hierarchy redundancy.** The logo plate comes before date and title, while the organization is repeated in the heading. Let the role and date lead, then make the mark a smaller supporting cue or pair it with a concise organization label.
- **[P2] Differentiate the two NITMX entries.** Repeated marks alone do not show whether the roles are separate tenures or a single progression. Add an employer grouping/label or otherwise make the distinction legible.
- **[P2] Reduce competition inside cards.** Long descriptions and 7–10 skill tags compete with role, date, and logo. Prioritize a few role highlights so the identity and chronology scan quickly.
- **[P3] Calm the motion.** Scroll reveals and the continuously pulsing timeline dot add movement to reading content. Respect reduced-motion preferences and avoid indefinite pulsing.

### Cognitive Load and Emotional Journey

The timeline is easy to understand as a sequence, and the card groups and tags are visually grouped. The main load comes from dense entries and seeing all detail at once; the logo, date, role, paragraph, and many tags each compete for attention. The repeated NITMX mark asks readers to infer the relationship between two roles. On mobile, the small logos sit above the same dense content, so those differences become more pronounced.

Real logos lend credibility, but equal card treatment flattens the progression. The section begins with the current True role and ends with an earlier AI Builders program, without a closing takeaway that connects the experience to the current AI engineering direction.

### Strengths

- Real transparent logos add credible employer and education context.
- White plates give multicolor marks a consistent background.
- Alt text names each logo accurately.

### Persona Red Flags

- **First-time visitor:** Must infer the organization from the mark until reading the card text; the duplicate NITMX logo does not signal the relationship between the two entries.
- **Mobile visitor:** Small marks and dense descriptions/tags compete in a narrow stacked layout.
- **Screen-reader user:** Logo alt text is present; preserve it and keep organization identity available in text, not only in the graphic.

### Minor Observations

- Date formats vary (“August 2026 - Present” vs “Oct 2024 - May 2025”).
- The timeline mixes work roles and education in one employment-style sequence.
- Scroll animation may make content appear faint during entry.

### Questions to Consider

- Should the logos be the lead identity cue, or should role and date lead with the logo as support?
- Would you rather normalize every logo’s optical size, or size each mark individually to preserve its natural proportions?
- Should the two NITMX entries be grouped under one employer label or remain separate cards with clearer role cues?
