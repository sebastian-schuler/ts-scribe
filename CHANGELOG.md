# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.4] - 2026-05-08

### Fixed
- `randomInt` now throws `RangeError` instead of returning `NaN` when `min > max`.
- Fixed `package.json` `files` field to use `"dist"` instead of `"/dist"`.
- Fixed `objectFlatten` return type to `Record<string, unknown>` for type safety.
- Fixed `tsconfig.cjs.json` to extend `tsconfig.json` directly.

### Added
- Node.js `>=18` to `engines` field.
- CI/CD pipeline via GitHub Actions (lint, test, build).
- Additional entries to `.gitignore` (`.DS_Store`, `*.log`, `*.tgz`, `.env`).
