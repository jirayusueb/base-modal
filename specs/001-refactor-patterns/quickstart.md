# Quickstart: Refactor Codebase with Design Patterns

**Feature**: 001-refactor-patterns
**Date**: 2025-12-02

## Overview

This guide helps developers understand and work on the refactored architecture using Singleton and Observer patterns.

---

## Prerequisites

- Node.js >= 22.0.0
- Bun >= 1.3.0 (or npm >= 11.0.0)
- Familiarity with TypeScript and React

---

## Setup

```bash
# Clone and install dependencies
cd /Users/jirayu/Documents/nice-modal-react
bun install

# Checkout the refactor branch
git checkout 001-refactor-patterns
```

---

## Architecture Overview

### Singleton Pattern (Registry)

The `ModalRegistry` is implemented as a Singleton to ensure a single source of truth:

```typescript
// Accessing the registry
const registry = ModalRegistry.getInstance();

// Always returns the same instance
const sameRegistry = ModalRegistry.getInstance();
console.assert(registry === sameRegistry);
```

### Observer Pattern (State Management)

Components subscribe to specific modal state changes:

```typescript
// Subscribe to a modal's state
const unsubscribe = registry.subscribe(MyModal, (state) => {
  console.log('Modal state changed:', state);
});

// Unsubscribe when done
unsubscribe();
```

---

## Key Files

### Core Implementation

- `src/utils/registry.ts` - ModalRegistry (Singleton)
- `src/utils/state.ts` - State management (Observer)
- `src/utils/logger.ts` - Structured logging
- `src/providers/Provider.tsx` - React Context integration
- `src/hooks/useModal.ts` - Hook for accessing modals

### Tests

- `src/utils/registry.test.ts` - Registry tests
- `src/utils/state.test.ts` - State management tests
- `src/index.test.tsx` - Integration tests

---

## Development Workflow

### 1. Run Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run with coverage
bun run test:coverage
```

### 2. Type Checking

```bash
# Check TypeScript types
bun run typecheck
```

### 3. Linting

```bash
# Check code style
bun run lint

# Auto-fix issues
bun run format
```

### 4. Benchmarks

```bash
# Run performance benchmarks
bun run benchmark

# Watch mode
bun run benchmark:watch
```

---

## Testing the Refactor

### Unit Tests

Test Singleton behavior:

```typescript
test('Registry is a singleton', () => {
  const instance1 = ModalRegistry.getInstance();
  const instance2 = ModalRegistry.getInstance();
  expect(instance1).toBe(instance2);
});
```

Test Observer pattern:

```typescript
test('Observers are notified of state changes', () => {
  const registry = ModalRegistry.getInstance();
  const mockObserver = vi.fn();

  registry.subscribe('test-modal', mockObserver);
  registry.updateState('test-modal', { visible: true });

  expect(mockObserver).toHaveBeenCalledWith(
    expect.objectContaining({ visible: true })
  );
});
```

### Integration Tests

Verify public API compatibility:

```typescript
test('BaseModal.show() works after refactor', async () => {
  const result = await BaseModal.show(MyModal, { title: 'Test' });
  expect(result).toBeDefined();
});
```

### Performance Tests

Verify no regression:

```bash
# Run benchmarks and compare to baseline
bun run benchmark

# Expected: Within ±5% of baseline
```

---

## Debugging

### Enable Logging

Logging is enabled in development mode by default:

```typescript
// Logs will appear in console
[BaseModal:DEBUG] Registry accessed { modalId: 'my-modal' }
[BaseModal:INFO] State updated { modalId: 'my-modal', changes: { visible: true } }
[BaseModal:INFO] Observers notified { modalId: 'my-modal', count: 2 }
```

### Disable Logging

```bash
# Set environment variable
NODE_ENV=production bun run test
```

---

## Common Tasks

### Add a New Test

1. Create test file: `src/utils/my-feature.test.ts`
2. Write test using Vitest
3. Run: `bun run test`

### Verify Backward Compatibility

```bash
# All existing tests should pass
bun run test

# Check public API types
bun run typecheck
```

### Check Performance

```bash
# Run benchmarks
bun run benchmark

# Compare to baseline (should be within ±5%)
```

---

## Success Criteria Checklist

Before merging, verify:

- [ ] **SC-001**: 100% test coverage maintained (`bun run test:coverage`)
- [ ] **SC-002**: Zero `any` types in `src/` (`bun run typecheck`)
- [ ] **SC-003**: Benchmarks within ±5% baseline (`bun run benchmark`)
- [ ] **SC-004**: All integration tests pass (`bun run test`)

---

## Troubleshooting

### Tests Failing

```bash
# Clear cache and re-run
rm -rf node_modules coverage dist
bun install
bun run test
```

### Type Errors

```bash
# Check for any type issues
bun run typecheck
```

### Performance Regression

```bash
# Re-run benchmarks
bun run benchmark

# If regression > 5%, investigate:
# - Check for unnecessary re-renders
# - Verify observer subscriptions are cleaned up
# - Profile with React DevTools
```

---

## Next Steps

After completing the refactor:

1. Run full test suite
2. Run benchmarks
3. Create PR with test results
4. Request code review
5. Merge to main after approval
