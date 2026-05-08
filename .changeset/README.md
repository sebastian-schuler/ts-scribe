# semantic-release — ts-scribe Release Guide

Releases are **fully automated** via [semantic-release](https://semantic-release.gitbook.io/semantic-release).
Pushing to `main` triggers CI which analyzes commit messages, bumps the version, generates the changelog, and publishes to npm.

## Quick Reference

| Command | What it does |
|---------|-------------|
| `bun run build` | Build the project |
| `bun test` | Run all tests |
| `bun run lint` | Run the linter |
| `bun run docs` | Generate TypeDoc documentation |

## How Versioning Works

The version bump is determined **automatically from your commit messages** using the [Conventional Commits](https://www.conventionalcommits.org/) spec:

| Commit pattern | Bump | Example |
|---------------|------|---------|
| `fix:` | **patch** (0.6.4 → 0.6.5) | `fix: handle empty array in arrayChunk` |
| `feat:` | **minor** (0.6.4 → 0.7.0) | `feat: add arrayPartition function` |
| `BREAKING CHANGE:` or `!` | **major** (0.6.4 → 1.0.0) | `feat!: drop Node 16 support` |

Commits with `chore:`, `docs:`, `style:`, `refactor:`, `test:`, `ci:`, `build:` do **not** trigger a release.
If there are no `fix:` or `feat:` commits, no release happens.

## Release Flow

```
1.  Write code and commit using Conventional Commits
    git commit -m "feat: add new utility function"

2.  Push to a feature branch and open a PR
    git push origin feature/my-feature

3.  Merge the PR to main

4.  CI on main runs semantic-release automatically:
    → Analyzes commits since last release
    → Determines version bump (patch / minor / major)
    → Generates and updates CHANGELOG.md
    → Publishes to npm
    → Creates a GitHub Release
    → Commits the updated CHANGELOG.md back to main

5.  Done — no manual steps needed
```

## Prerequisites for CI Publishing

- `NPM_TOKEN` must be set as a [GitHub Actions secret](https://github.com/sebastian-schuler/ts-scribe/settings/secrets/actions)
- The token must be an **Automation** type (bypasses 2FA)
- `GITHUB_TOKEN` is provided automatically by GitHub Actions

## Configuration

Release behavior is configured in `.releaserc`:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

The CI workflow lives in `.github/workflows/release.yml`.

