# WebBacillus Portfolio

Personal portfolio site built on Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Resend for the contact form.

## Requirements

- Node.js 22 (LTS)
- pnpm 12.3.4 (matches `packageManager` in `package.json`)

## Local development

Install dependencies, then start the dev server:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values.

| Name             | Required? | Purpose                                              | Read at                |
| ---------------- | --------- | ---------------------------------------------------- | ---------------------- |
| `RESEND_API_KEY` | Yes       | API key for the Resend client used by the contact form | Request time, inside `app/actions/contact.ts` |

CI sets `RESEND_API_KEY` to a placeholder because the build step only needs to be able to import the contact action; the key is never sent to Resend during the build.

If your `.env.local` still contains `EMAIL_USER` or `EMAIL_PASSWORD`, delete those lines — no application code reads them.

## Project checks

These are the same commands GitHub Actions runs on every pull request and every push to `main`. Run them locally before pushing:

```sh
pnpm lint
pnpm typecheck
pnpm build
```

The typecheck command generates the Next.js route types before running TypeScript. The unused component catalog under `components/ui`, its unused theme provider, and the unused toast hook are excluded from lint and typecheck until the app adopts them; imported source remains part of the check through TypeScript's dependency graph.

## Deployment

Hosted on Vercel.

1. Import the repository in the Vercel dashboard.
2. Add `RESEND_API_KEY` as a project environment variable (Production, Preview, and Development as needed).
3. Push to `main` (or merge a pull request). Vercel builds from `main`; CI must be green before the merge.

The contact form's destination (`web.pasit.kh@gmail.com`) and from-address (`onboarding@resend.dev`) are constants inside `app/actions/contact.ts` and do not need to be set as environment variables.
