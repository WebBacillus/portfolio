## Agent skills

### Issue tracker

Issues and specs are tracked on the Hermes Kanban `default` board with tenant
`portfolio`. Use the `hermes kanban` CLI, not `gh issue`. See
`docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles are `needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, and `wontfix`, stored as body markers rather than Kanban labels.
See `docs/agents/triage-labels.md`.

### Domain docs

Use the single-context layout with root `GLOSSARY.md` and `docs/adr/`. See
`docs/agents/domain.md`.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for every commit. Format messages as `<type>[optional scope]: <description>` and add a body or footer when needed.
