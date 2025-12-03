# Implementation Plan: Refactor Codebase with Design Patterns

**Branch**: `001-refactor-patterns` | **Date**: 2025-12-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-refactor-patterns/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This refactor applies consistent design patterns (Singleton for Registry, Observer for State Management) across the entire internal codebase of the base-modal library. The goal is to improve maintainability, debuggability, and type safety while maintaining 100% backward compatibility with the public API. The refactor includes structured logging for observability and will be deployed as a single release after comprehensive testing.

## Technical Context

**Language/Version**: TypeScript >= 5.7.2
**Primary Dependencies**: React ^19.0.0, Immer ^11.0.0, use-immer ^0.11.0
**Storage**: N/A (in-memory state management only)
**Testing**: Vitest ^4.0.14 with @testing-library/react ^16.3.0
**Target Platform**: Browser (ES modules + CommonJS)
**Project Type**: Single library project
**Performance Goals**: No regression - benchmarks must stay within ±5% of baseline
**Constraints**: Zero runtime dependencies (except React + Immer), 100% test coverage required, backward compatible public API
**Scale/Scope**: Single-package React library (~43 files in src/)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Zero Dependencies ✅
- **Gate**: No new runtime dependencies allowed (except React + Immer)
- **Status**: PASS - Refactor is internal only, no new dependencies planned

### II. Type-Safety First ✅
- **Gate**: All APIs must be fully typed, no `any` types
- **Status**: PASS - FR-002 explicitly requires strict TypeScript types

### III. Performance Optimized ✅
- **Gate**: Benchmarks must verify no performance regression
- **Status**: PASS - SC-003 requires benchmarks within ±5% baseline

### IV. Test-Driven Quality ✅
- **Gate**: 100% test coverage required
- **Status**: PASS - SC-001 requires maintaining/improving 100% coverage

### V. Framework Agnostic ✅
- **Gate**: No UI components, works with any UI library
- **Status**: PASS - Refactor is internal patterns only, public API unchanged

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/      # Modal components (Provider, ModalDef)
├── constants/       # Internal constants
├── hooks/           # useModal and related hooks
├── providers/       # Context providers
├── types/           # TypeScript type definitions
├── utils/           # Utility functions (registry, state management)
└── index.ts         # Public API exports

tests/
└── (integrated in src/ as *.test.tsx files)
```

**Structure Decision**: Single project structure. All source code is in `src/` with co-located tests. The refactor will focus on `src/utils/` (registry and state management) and `src/providers/` (context implementation) to apply Singleton and Observer patterns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
