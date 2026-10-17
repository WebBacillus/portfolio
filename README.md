# WebBacillus Portfolio

## Local development

Install the locked dependencies and start the development server:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Project checks

Run these before opening a pull request:

```sh
pnpm lint
pnpm typecheck
pnpm build
```

The typecheck command generates the Next.js route types before running TypeScript. The unused component catalog under `components/ui`, its unused theme provider, and the unused toast hook are excluded from lint and typecheck until the app adopts them; imported source remains part of the check through TypeScript's dependency graph.
