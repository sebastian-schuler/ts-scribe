# Changesets — ts-scribe Release Guide

## Quick Reference

| Command | What it does |
|---------|-------------|
| `bun run changeset` | Interactively create a new changeset (describe your changes) |
| `bun run version-packages` | Consume changesets, bump version, update CHANGELOG.md |
| `bun run release` | Build and publish to npm |
| `bun run lint` | Run the linter |
| `bun test` | Run all tests |

## Release Flow (CI — Recommended)

```
1.  Create a changeset
    bun run changeset
    → Choose the bump: patch / minor / major
    → Write a summary of your changes

2.  Commit and push to development
    git add . && git commit -m "feat: your feature"
    git push origin development

3.  Open a PR: development → main and merge it

4.  CI on main detects the .changeset/ file
    → Opens a "Version Packages" PR
    → This PR shows the version bump + auto-generated CHANGELOG entry

5.  Merge the "Version Packages" PR
    → CI builds and publishes to npm automatically
```

## Release Flow (Manual)

```
1.  Create a changeset
    bun run changeset

2.  Bump version + update CHANGELOG
    bun run version-packages

3.  Commit the version bump
    git add . && git commit -m "chore: version packages"

4.  Publish
    bun run release
```

## Version Bump Types

| Type | Example | Use for |
|------|---------|---------|
| `patch` | `0.6.4` → `0.6.5` | Bug fixes, small improvements |
| `minor` | `0.6.4` → `0.7.0` | New features, non-breaking |
| `major` | `0.6.4` → `1.0.0` | Breaking changes |

If multiple changeset files exist, the **highest** bump wins.

## Prerequisites for CI Publishing

- `NPM_TOKEN` must be set as a [GitHub Actions secret](https://github.com/sebastian-schuler/ts-scribe/settings/secrets/actions)
- The token must be an **Automation** type (bypasses 2FA)

## File Structure

```
.changeset/
├── config.json              # Changesets configuration
├── README.md                # This guide
└── *.md                     # Pending changesets (auto-deleted on release)
```

