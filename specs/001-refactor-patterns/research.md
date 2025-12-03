# Research: Refactor Codebase with Design Patterns

**Feature**: 001-refactor-patterns
**Date**: 2025-12-02
**Phase**: 0 - Research & Decision Making

## Overview

This document captures research findings and decisions for applying Singleton and Observer design patterns to the base-modal library's internal architecture.

---

## 1. Singleton Pattern for Registry

### Decision

Implement the modal registry as a **Singleton** using a module-level instance with lazy initialization.

### Rationale

- **Single Source of Truth**: Ensures all components access the same registry instance, preventing state inconsistencies
- **TypeScript-Friendly**: Module-level singletons are idiomatic in TypeScript/ES modules
- **No Global Pollution**: Encapsulated within the module scope
- **Testability**: Can be reset/mocked for testing via exported test utilities

### Implementation Approach

```typescript
// Pseudocode - not actual implementation
class ModalRegistry {
  private static instance: ModalRegistry;
  private modals: Map<string, ModalState>;

  private constructor() {
    this.modals = new Map();
  }

  public static getInstance(): ModalRegistry {
    if (!ModalRegistry.instance) {
      ModalRegistry.instance = new ModalRegistry();
    }
    return ModalRegistry.instance;
  }
}
```

### Alternatives Considered

- **Dependency Injection**: Rejected - adds complexity and breaks backward compatibility
- **React Context Only**: Rejected - doesn't provide imperative API (`BaseModal.show()`)
- **Multiple Registries**: Rejected - violates single source of truth principle

---

## 2. Observer Pattern for State Management

### Decision

Implement state updates using the **Observer pattern** with selective subscriptions to minimize re-renders.

### Rationale

- **Performance**: Components only re-render when their specific modal state changes
- **Scalability**: Supports many modals without performance degradation
- **React-Friendly**: Integrates naturally with React's re-render model
- **Existing Pattern**: Library already uses context subscriptions, this formalizes it

### Implementation Approach

```typescript
// Pseudocode - not actual implementation
interface Observer {
  update(modalId: string, state: ModalState): void;
}

class ModalSubject {
  private observers: Map<string, Set<Observer>>;

  subscribe(modalId: string, observer: Observer): () => void {
    // Add observer for specific modal
    // Return unsubscribe function
  }

  notify(modalId: string, state: ModalState): void {
    // Notify only observers subscribed to this modalId
  }
}
```

### Alternatives Considered

- **Global State Manager (Redux/Zustand)**: Rejected - violates Zero Dependencies principle
- **Broadcast to All**: Rejected - causes unnecessary re-renders
- **Event Emitter**: Rejected - less type-safe, harder to track subscriptions

---

## 3. Structured Logging Strategy

### Decision

Add lightweight structured logging using `console` methods with namespaced prefixes and log levels.

### Rationale

- **Zero Dependencies**: Uses built-in `console` API
- **Debuggability**: Helps trace state transitions and pattern usage
- **Production-Safe**: Can be disabled via environment variable or build flag
- **TypeScript-Safe**: Strongly typed log functions

### Implementation Approach

```typescript
// Pseudocode - not actual implementation
const LOG_ENABLED = process.env.NODE_ENV !== 'production';

const logger = {
  debug: (message: string, data?: unknown) => {
    if (LOG_ENABLED) {
      console.debug(`[BaseModal:DEBUG]`, message, data);
    }
  },
  info: (message: string, data?: unknown) => {
    if (LOG_ENABLED) {
      console.info(`[BaseModal:INFO]`, message, data);
    }
  },
};

// Usage
logger.debug('Singleton registry accessed', { modalId });
logger.info('Observer notified', { modalId, subscriberCount });
```

### Alternatives Considered

- **Third-Party Logger**: Rejected - violates Zero Dependencies
- **No Logging**: Rejected - reduces debuggability for complex state issues
- **Always-On Logging**: Rejected - performance impact in production

---

## 4. Backward Compatibility Strategy

### Decision

Maintain 100% backward compatibility by keeping the public API unchanged and refactoring only internal implementation.

### Rationale

- **User Trust**: Breaking changes would require major version bump and migration effort
- **Low Risk**: Internal refactor doesn't affect external consumers
- **Testable**: Existing integration tests validate compatibility

### Validation Approach

- Run all existing tests without modification
- Verify public API types remain identical
- Check bundle size doesn't increase significantly

---

## 5. Testing Strategy

### Decision

Maintain 100% test coverage by:
1. Updating existing tests to verify pattern implementation
2. Adding new tests for Singleton and Observer behavior
3. Running benchmarks to verify performance

### Test Categories

**Unit Tests** (existing + new):
- Singleton: Verify single instance across multiple calls
- Observer: Verify selective notifications
- Logging: Verify correct log output (mocked console)

**Integration Tests** (existing):
- Public API compatibility
- Modal lifecycle (show/hide/resolve)
- Concurrent modal operations

**Performance Tests** (existing benchmarks):
- Baseline comparison (±5% tolerance)
- Re-render count verification

---

## 6. Migration/Deployment

### Decision

Big bang deployment - all changes in a single release after comprehensive testing.

### Rationale

- **Atomic Change**: Patterns are interdependent, partial migration is complex
- **Simplified Testing**: Single state to validate
- **Clear Rollback**: Can revert entire release if issues found

### Risk Mitigation

- Comprehensive test suite (100% coverage)
- Benchmark validation before release
- Thorough code review
- Beta testing period (if applicable)

---

## Summary

All design decisions support the core goals:
- ✅ Singleton for Registry (single source of truth)
- ✅ Observer for State (performance optimization)
- ✅ Structured Logging (debuggability)
- ✅ Zero new dependencies
- ✅ 100% backward compatibility
- ✅ 100% test coverage
- ✅ No performance regression
