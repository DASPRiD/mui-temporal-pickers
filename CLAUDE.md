# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `mui-temporal-pickers`, a library that bridges MUI X Date Pickers with the TC39 Temporal API. It provides adapters and React providers for six Temporal types: PlainDate, PlainTime, PlainDateTime, ZonedDateTime, PlainYearMonth, and PlainMonthDay.

## Commands

- **Install**: `pnpm install`
- **Build**: `pnpm build` (TypeScript compilation via `tsc -p tsconfig.build.json`)
- **Lint & format**: `pnpm check` (Biome — lints and auto-fixes)
- **Format only**: `pnpm format`
- **Type check**: `tsc --noEmit`
- **Run demo app**: `pnpm demo` (Vite dev server)

There is no test suite. CI runs `biome ci .` and `tsc --noEmit`.

## Code Style

Biome enforces all style rules. Key settings: 4-space indent, 100-char line width, shorthand array types (`T[]` not `Array<T>`), block statements required, `for...of` preferred, no unused imports, no console except error/warn/info/assert. Commits use conventional commit format (enforced by commitlint via lefthook).

## Architecture

The library follows an **Adapter + Provider** pattern:

**Adapters** (`src/adapters/`) implement MUI's `MuiPickersAdapter` interface for each Temporal type:
- `base.ts` — Abstract `AdapterTemporalBase` class that all adapters extend. Manages locale, format strings, and delegates to operation interfaces.
- `operations.ts` — Defines operation interfaces (conversion, comparison, date, time, timezone) with default implementations. Each adapter composes these operations for its Temporal type.
- Individual adapter files (`plain-date.ts`, `zoned-date-time.ts`, etc.) provide type-specific operation overrides.

**Providers** (`src/providers/`) are thin React wrappers:
- `root.tsx` — `TemporalRootProvider` sets global config (locale, formats, localeText) via React context.
- Type-specific providers (e.g., `TemporalPlainDateProvider`) wrap MUI's `LocalizationProvider` with the matching adapter, pulling config from root context.

**Locale & Formatting** (`src/locale/`):
- `specs.ts` — `LocaleSpecs` class, singleton-cached per locale. Detects 12/24h cycle via `Intl.DateTimeFormat`.
- `format/formatter.ts` — Parses format strings into tokens and formats Temporal values. Supports meta tokens (e.g., `lfd`, `lkd`) that expand to locale-appropriate patterns.
- `format/tokens.ts` — Defines the supported format token maps for dates and times.

**Key dependency**: `temporal-extra` provides week calculation utilities used throughout the adapters.

## Build Target

ESM-only (`"type": "module"`), ES2022 target, tree-shakable (`sideEffects: false`). Output goes to `dist/`.
