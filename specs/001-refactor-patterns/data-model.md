# Data Model: Refactor Codebase with Design Patterns

**Feature**: 001-refactor-patterns
**Date**: 2025-12-02
**Phase**: 1 - Design

## Overview

This document defines the internal data structures and relationships for the refactored architecture using Singleton and Observer patterns.

---

## Core Entities

### 1. ModalRegistry (Singleton)

**Purpose**: Central registry holding all modal states

**Attributes**:
- `instance: ModalRegistry` (static, private) - The singleton instance
- `modals: Map<string | ComponentType, ModalState>` - Map of modal ID/component to state
- `observers: Map<string | ComponentType, Set<Observer>>` - Map of modal ID to observers

**Methods**:
- `getInstance(): ModalRegistry` (static) - Get singleton instance
- `register(id: string | ComponentType, state: ModalState): void` - Register a modal
- `unregister(id: string | ComponentType): void` - Unregister a modal
- `getState(id: string | ComponentType): ModalState | undefined` - Get modal state
- `updateState(id: string | ComponentType, updates: Partial<ModalState>): void` - Update state and notify observers
- `subscribe(id: string | ComponentType, observer: Observer): () => void` - Subscribe to state changes
- `reset(): void` (test utility) - Reset registry for testing

**Relationships**:
- Contains many `ModalState` instances
- Contains many `Observer` subscriptions

---

### 2. ModalState

**Purpose**: Represents the state of a single modal instance

**Attributes**:
- `id: string | ComponentType` - Unique identifier
- `visible: boolean` - Whether modal is currently shown
- `keepMounted: boolean` - Whether to keep in DOM when hidden
- `props: Record<string, unknown>` - Props passed to modal
- `promise: { resolve: Function, reject: Function } | null` - Promise handlers for async API
- `resolvedValue: unknown` - Value when promise resolved

**Lifecycle States**:
1. `REGISTERED` - Modal registered but not shown
2. `VISIBLE` - Modal is shown
3. `HIDDEN` - Modal was shown but now hidden
4. `REMOVED` - Modal unregistered

**Validation Rules**:
- `id` must be unique within registry
- `visible` and `keepMounted` cannot both be false (if not keepMounted, should be removed)
- `promise` must be set when modal is shown via `BaseModal.show()`

---

### 3. Observer

**Purpose**: Interface for components that subscribe to modal state changes

**Attributes**:
- `update(state: ModalState): void` - Callback when state changes

**Implementation**:
- React components implement this via hooks
- Each component subscribes only to modals it cares about

---

### 4. Logger

**Purpose**: Structured logging for debugging

**Attributes**:
- `enabled: boolean` - Whether logging is enabled
- `prefix: string` - Log prefix (e.g., "[BaseModal]")

**Methods**:
- `debug(message: string, data?: unknown): void` - Debug-level log
- `info(message: string, data?: unknown): void` - Info-level log
- `warn(message: string, data?: unknown): void` - Warning-level log

**Log Events**:
- Singleton access: `"Registry accessed"`
- State update: `"State updated"` with `{ modalId, changes }`
- Observer notification: `"Observers notified"` with `{ modalId, count }`
- Modal lifecycle: `"Modal shown/hidden/removed"` with `{ modalId }`

---

## Relationships

```
ModalRegistry (Singleton)
  ├── modals: Map<id, ModalState>
  │     └── ModalState { id, visible, props, promise, ... }
  └── observers: Map<id, Set<Observer>>
        └── Observer { update(state) }

Logger (Utility)
  └── logs events from ModalRegistry
```

---

## State Transitions

### Modal Lifecycle

```
[REGISTERED] --show()--> [VISIBLE] --hide()--> [HIDDEN]
                            |                      |
                            |                      |
                        remove()              remove()
                            |                      |
                            v                      v
                        [REMOVED]              [REMOVED]
```

### Observer Subscription

```
Component mounts --> subscribe(modalId, observer)
Component updates --> (no action, observer already subscribed)
Component unmounts --> unsubscribe(modalId, observer)
```

---

## Constraints

1. **Singleton Constraint**: Only one `ModalRegistry` instance exists per application
2. **Unique IDs**: Each modal must have a unique ID (string or component reference)
3. **Memory Safety**: Observers must unsubscribe when components unmount to prevent leaks
4. **Atomicity**: State updates must be atomic (no partial updates visible to observers)
5. **Type Safety**: All state transitions must be type-checked at compile time

---

## Performance Considerations

- **Selective Notifications**: Only observers subscribed to a specific modal are notified
- **Lazy Initialization**: Singleton instance created only when first accessed
- **Map Efficiency**: Use `Map` for O(1) lookups instead of arrays
- **Immutable Updates**: Use Immer for efficient immutable state updates
