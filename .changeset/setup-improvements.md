---
"ts-scribe": patch
---

- `randomInt` now throws `RangeError` instead of returning `NaN` when `min > max`.
- Fixed `package.json` `files` field to use `"dist"` instead of `"/dist"`.
- Fixed `objectFlatten` return type to `Record<string, unknown>` for type safety.
- Fixed `tsconfig.cjs.json` to extend `tsconfig.json` directly.
- Renamed test files to match source filenames (`debounce`, `deep-equals`, `truncate`).
- Added Node.js `>=18` to `engines` field.
- Added CI/CD pipeline via GitHub Actions (lint, test, build).
- Added release automation workflow with changesets.
- Added `prepublishOnly` script to ensure build runs before publish.
- Added `CHANGELOG.md` (managed by changesets).
- Added common entries to `.gitignore`.
