<!--
Sync Impact Report:
- Version change: 0.0.0 -> 1.0.0 (Initial Ratification)
- List of modified principles:
  - I. Zero Dependencies (New)
  - II. Type-Safety First (New)
  - III. Performance Optimized (New)
  - IV. Test-Driven Quality (New)
  - V. Framework Agnostic (New)
- Added sections: Technology Standards, Development Workflow
- Templates requiring updates:
  - tasks-template.md (Pending check for benchmark/coverage tasks)
- Follow-up TODOs: None
-->
# Base Modal Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### I. Zero Dependencies
<!-- Example: I. Library-First -->
The library MUST NOT have runtime dependencies other than React and internal state management utilities (Immer). No heavy UI component libraries or external state managers are allowed in the core package.

### II. Type-Safety First
<!-- Example: II. CLI Interface -->
Full TypeScript support is NON-NEGOTIABLE. All public APIs must be fully typed with strict inference. `any` types are prohibited unless strictly justified and isolated. Props must be explicitly defined.

### III. Performance Optimized
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
Performance is a core feature. Components must use selective context subscriptions and memoization to prevent unnecessary re-renders. Core changes MUST be verified with benchmarks (`npm run benchmark`).

### IV. Test-Driven Quality
<!-- Example: IV. Integration Testing -->
100% Test Coverage is REQUIRED. Every feature and bug fix must be accompanied by comprehensive tests (unit and/or integration). Regressions are unacceptable.

### V. Framework Agnostic
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
The library provides logic and state management, NOT UI components. It must work seamlessly with any UI library (Ant Design, MUI, Tailwind, etc.) without imposing styles or DOM structures.

## Technology Standards
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

- **Runtime**: Node.js >= 22.0.0
- **Package Manager**: Bun >= 1.3.0 (preferred) or npm >= 11.0.0
- **Language**: TypeScript >= 5.7.2
- **Linting/Formatting**: Biome
- **Testing**: Vitest

## Development Workflow
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

- **CI Gates**: All PRs must pass `bun run test` (100% coverage) and `bun run lint`.
- **Versioning**: Semantic Versioning (Major.Minor.Patch).
- **Commits**: Follow Conventional Commits specification.
- **Benchmarks**: Run `bun run benchmark` for any performance-sensitive changes.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This Constitution supersedes all other project documentation. Amendments require a Pull Request with a Sync Impact Report and majority approval from maintainers.

**Version**: 1.0.0 | **Ratified**: 2025-12-02 | **Last Amended**: 2025-12-02
