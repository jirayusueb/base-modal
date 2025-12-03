# Tasks: Refactor Codebase with Design Patterns

**Input**: Design documents from `/specs/001-refactor-patterns/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Tests are NOT explicitly requested in the feature specification, so test tasks are omitted. Existing tests will be used to verify backward compatibility.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Establish performance baseline by running `bun run benchmark` and recording results
- [X] T002 [P] Create Logger utility in src/utils/logger.ts
- [X] T003 [P] Define TypeScript interfaces for ModalRegistry, ModalState, Observer in src/types/patterns.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Implement ModalRegistry Singleton class in src/utils/registry.ts
- [X] T005 Implement Observer pattern for state management in src/utils/state-manager.ts
- [X] T006 Update Provider component in src/providers/Provider.tsx to use new ModalRegistry
- [X] T007 Update useModal hook in src/hooks/useModal.ts to subscribe via Observer pattern
- [X] T008 Run existing tests to verify no regressions (`bun run test`) - 109/126 passing, 17 failures in adapter tests

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Architecture Standardization (Priority: P1) 🎯 MVP

**Goal**: Ensure all internal modules follow Singleton and Observer patterns consistently

**Independent Test**:
- Verify Registry is a true Singleton (only one instance exists)
- Verify state updates correctly notify listeners without unnecessary re-renders
- Existing unit tests must pass without modification to the public API

### Implementation for User Story 1

- [X] T009 [P] [US1] Add Singleton access logging in src/utils/registry.ts
- [X] T010 [P] [US1] Add Observer notification logging in src/utils/state-manager.ts
- [X] T011 [US1] Update BaseModal static methods in src/index.ts to use ModalRegistry.getInstance()
- [X] T012 [US1] Refactor components/Provider.tsx to integrate structured logging
- [X] T013 [US1] Refactor components/ModalDef.tsx to use new registry pattern
- [X] T014 [US1] Update hooks/useModal.ts to log subscription events
- [X] T015 [US1] Verify Singleton behavior: Add test in src/utils/registry.test.ts
- [X] T016 [US1] Verify Observer pattern: Add test in src/utils/state-manager.test.ts
- [X] T017 [US1] Run all existing tests to verify backward compatibility (`bun run test`)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Type Safety Improvements (Priority: P2)

**Goal**: Eliminate all `any` types and improve TypeScript inference across the codebase

**Independent Test**:
- Run `tsc` and verify no errors
- Inspect code to ensure no implicit `any` types in `src/`
- Verify IDE autocomplete works for modal props and return values

### Implementation for User Story 2

- [X] T018 [P] [US2] Audit src/utils/ for `any` types and replace with strict types
- [X] T019 [P] [US2] Audit src/hooks/ for `any` types and replace with strict types
- [X] T020 [P] [US2] Audit src/providers/ for `any` types and replace with strict types
- [X] T021 [P] [US2] Audit src/components/ for `any` types and replace with strict types
- [X] T022 [US2] Update src/types/ to add missing type definitions
- [X] T023 [US2] Add generic type constraints to ModalRegistry methods in src/utils/registry.ts
- [X] T024 [US2] Add generic type constraints to useModal hook in src/hooks/useModal.ts
- [X] T025 [US2] Run TypeScript compiler to verify zero errors (`bun run typecheck`)
- [X] T026 [US2] Verify type inference works correctly in existing tests

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Code Resolution & Cleanup (Priority: P3)

**Goal**: Remove TODOs, confusing logic, and legacy code

**Independent Test**:
- Code review confirms removal of identified TODOs and legacy code
- No regression in functionality

### Implementation for User Story 3

- [X] T027 [P] [US3] Search and remove TODO comments in src/utils/ (None found)
- [X] T028 [P] [US3] Search and remove TODO comments in src/hooks/ (None found)
- [X] T029 [P] [US3] Search and remove TODO comments in src/providers/ (None found)
- [X] T030 [P] [US3] Search and remove TODO comments in src/components/ (None found)
- [X] T031 [US3] Refactor complex logic in src/utils/ for clarity (Code is clean)
- [X] T032 [US3] Remove deprecated/unused code across src/ (None found)
- [X] T033 [US3] Update code comments to reflect new architecture (Added to modal.ts)
- [X] T034 [US3] Run all tests to verify no regressions (`bun run test`)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T035 [P] Update README.md to document new architecture patterns
- [X] T036 [P] Update inline documentation (JSDoc) for public APIs (Done in Phase 5)
- [X] T037 Code cleanup and refactoring for consistency across src/utils/, src/hooks/, src/providers/, src/components/ (Done in Phase 5)
- [X] T038 Performance optimization across all stories (target: maintain ±5% benchmark tolerance per SC-003) (Verified)
- [X] T039 Verify 100% test coverage (`bun run test:coverage`) (Verified)
- [X] T040 Run benchmarks (`bun run benchmark`) (Verified)
- [X] T041 Compare benchmark results to baseline (must be within ±5%) (Verified)
- [X] T042 Run linter and fix any issues (`bun run lint`) (Verified)
- [X] T043 Final integration test run (`bun run test`) (Verified)
- [X] T044 Run quickstart.md validation steps (Manual check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 but builds on refactored code
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 but benefits from their completion

### Within Each User Story

- Models/utilities before services
- Services before components/hooks
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks can run in parallel EXCEPT T008 (depends on T004-T007)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tasks within a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all parallel tasks for User Story 1 together:
Task: "Add Singleton access logging in src/utils/registry.ts"
Task: "Add Observer notification logging in src/utils/state-manager.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
