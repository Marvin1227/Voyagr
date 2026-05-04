# GIT-WORKFLOW.md — How We Ship Code

---

## Strategy: GitHub Flow

We use GitHub Flow: `main` is always deployable, all work happens on short-lived feature branches, and everything merges via Pull Request.

```
main ──────────────────────────────────────────▶  (always stable)
         │               │              │
  feature/maya-chat  fix/map-arc   chore/deps
         │               │              │
         └──── PR ───────┴──── PR ──────┘
```

---

## Branch Naming

All branches follow this pattern: `<type>/<short-description>`

| Type | When to use | Example |
|---|---|---|
| `feature/` | New functionality | `feature/maya-chat-panel` |
| `fix/` | Bug fixes | `fix/map-arc-animation` |
| `chore/` | Maintenance, deps, config | `chore/update-mapbox` |
| `docs/` | Documentation only | `docs/update-readme` |
| `refactor/` | Code restructure, no new behaviour | `refactor/chat-store` |

**Rules:**
- Use lowercase and hyphens, no spaces or underscores
- Keep descriptions short (2–4 words)
- Branch from `main`, not from other feature branches
- Delete the branch after merge

---

## Commit Messages: Conventional Commits

Every commit message follows the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short description>

[optional body]
```

### Types
| Type | When |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Build, deps, config (no prod code change) |
| `docs` | Documentation only |
| `refactor` | Refactor without behaviour change |
| `test` | Adding or fixing tests |
| `style` | Formatting, whitespace (no logic change) |

### Scope (optional but encouraged)
The part of the codebase touched: `chat`, `map`, `auth`, `rag`, `ui`, `api`

### Examples
```
feat(chat): add draggable bottom sheet panel
fix(map): prevent arc animation crash on empty mapActions
chore(deps): update mapbox-gl to 3.4.0
test(rag): add unit tests for RagOrchestrator
refactor(auth): extract token validation to JwtUtil
docs: update ARCHITECTURE with mapActions contract
```

**Rules:**
- Description in lowercase, no period at the end
- Use imperative mood: "add" not "added", "fix" not "fixed"
- Keep subject line under 72 characters
- If the commit needs explanation, add a body after a blank line

---

## Pull Request Process

### Before opening a PR
- [ ] Branch is up to date with `main` (`git rebase main`)
- [ ] All tests pass locally
- [ ] No linter errors
- [ ] No TypeScript errors (frontend)
- [ ] `.env` files not included

### PR title
Follow the same Conventional Commits format: `feat(map): animate flight arcs from AI response`

### PR description template
```markdown
## What does this PR do?
<!-- One paragraph, what changed and why -->

## How to test
<!-- Steps to verify the change works -->

## Screenshots (if UI change)
<!-- Before / after if applicable -->

## Checklist
- [ ] Tests written and passing
- [ ] No TypeScript errors
- [ ] No linter errors
- [ ] Tested locally end-to-end
```

### Review requirements
- Minimum **1 approval** before merging
- The PR author does not merge their own PR
- Reviewer checks: correctness, naming, test coverage, no secrets committed

### Merge strategy
**Squash and merge** — all commits on the feature branch become one clean commit on `main`. The PR title becomes the final commit message.

---

## What Never Goes on `main` Directly

- Never commit directly to `main` — all changes go through PRs
- Never commit `.env` files or API keys
- Never commit broken/failing tests
- Never commit `console.log` debug statements left in production code

---

## Keeping Branches Up to Date

Prefer **rebase** over merge to keep history linear:

```bash
# Update your branch with latest main
git fetch origin
git rebase origin/main

# If conflicts, resolve, then:
git rebase --continue
```

---

## Common Workflows

### Start a new feature
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
# ... work ...
git push origin feature/your-feature-name
# Open PR on GitHub
```

### Fix a bug
```bash
git checkout main
git pull origin main
git checkout -b fix/describe-the-bug
# ... fix ...
git push origin fix/describe-the-bug
# Open PR on GitHub
```

### Update a PR after review feedback
```bash
# Make changes
git add .
git commit -m "fix(chat): address review feedback on input validation"
git push origin feature/your-feature-name
# PR updates automatically — no need to close and reopen
```
