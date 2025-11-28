# Base Modal - Future Plan & Code Pattern Analysis

## Executive Summary

This document outlines the future refactoring plan for the Base Modal library, identifying complex code patterns and proposing solutions to improve maintainability, type safety, and extensibility.

## Current Complexity Areas

### 1. Promise/Callback Management Complexity

**Location:** `src/utils/modal.ts`, `src/constants/callbacks.constant.ts`

**Issues:**

- Dual callback systems: `modalCallbacks` and `hideModalCallbacks`
- Promise creation scattered across `show()` and `hide()` functions
- Manual promise lifecycle management
- Potential memory leaks if callbacks aren't properly cleaned up

**Current Code Pattern:**

```typescript
// Scattered promise creation
if (!modalCallbacks[modalId]) {
  let theResolve!: (args?: unknown) => void;
  let theReject!: (args?: unknown) => void;
  const promise = new Promise((resolve, reject) => {
    theResolve = resolve;
    theReject = reject;
  });
  modalCallbacks[modalId] = { resolve: theResolve, reject: theReject, promise };
}
```

**Proposed Pattern: Promise Manager**

```typescript
class ModalPromiseManager {
  private promises = new Map<
    string,
    {
      promise: Promise<unknown>;
      resolve: (value: unknown) => void;
      reject: (reason: unknown) => void;
      type: "show" | "hide";
      createdAt: number;
    }
  >();

  create(modalId: string, type: "show" | "hide"): Promise<unknown> {
    // Cleanup existing promise if any
    this.cleanup(modalId);

    let resolve!: (value: unknown) => void;
    let reject!: (reason: unknown) => void;

    const promise = new Promise<unknown>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.promises.set(modalId, {
      promise,
      resolve,
      reject,
      type,
      createdAt: Date.now(),
    });

    return promise;
  }

  resolve(modalId: string, value: unknown): void {
    const entry = this.promises.get(modalId);
    if (entry) {
      entry.resolve(value);
      if (entry.type === "show") {
        // Auto-cleanup show promises after resolution
        this.cleanup(modalId);
      }
    }
  }

  reject(modalId: string, reason: unknown): void {
    const entry = this.promises.get(modalId);
    if (entry) {
      entry.reject(reason);
      this.cleanup(modalId);
    }
  }

  cleanup(modalId: string): void {
    this.promises.delete(modalId);
  }

  get(modalId: string): Promise<unknown> | undefined {
    return this.promises.get(modalId)?.promise;
  }
}
```

**Benefits:**

- Centralized promise management
- Automatic cleanup
- Better memory management
- Easier debugging and testing

---

### 2. Reducer Duplication

**Location:** `src/utils/reducer.ts` vs `src/providers/provider.tsx`

**Issues:**

- Reducer logic duplicated in `reducer.ts` and `InnerContextProvider`
- Same switch statement exists in two places
- Maintenance risk when adding new actions
- Inconsistency potential between implementations

**Current Code Pattern:**

```typescript
// reducer.ts
export function reducer(
  state: BaseModalStore = initialState,
  action: BaseModalAction
): BaseModalStore {
  return produce(state, (draft) => {
    switch (action.type) {
      case "base-modal/show": {
        /* ... */
      }
      // ...
    }
  });
}

// provider.tsx - DUPLICATE LOGIC
const dispatch = useCallback(
  (action: BaseModalAction) => {
    updateModals((draft) => {
      switch (action.type) {
        case "base-modal/show": {
          /* ... */
        }
        // ... SAME LOGIC
      }
    });
  },
  [updateModals]
);
```

**Proposed Pattern: Single Source of Truth**

```typescript
// provider.tsx should use the reducer
import { reducer } from "../utils/reducer";

const dispatch = useCallback(
  (action: BaseModalAction) => {
    updateModals((draft) => {
      const newState = reducer(draft, action);
      Object.assign(draft, newState);
    });
  },
  [updateModals]
);
```

**Benefits:**

- Single source of truth
- Easier maintenance
- Consistent behavior
- Reduced code duplication

---

### 3. Modal ID Resolution Complexity

**Location:** `src/utils/modal.ts` - `getModalId()`

**Issues:**

- Symbol-based ID generation mixed with string IDs
- Type casting and assertions (`as React.ComponentType<P>`)
- Error handling inconsistency
- Weak type safety for modal identification

**Current Code Pattern:**

```typescript
export function getModalId<P = Record<string, unknown>>(
  modal: string | ComponentType<P>
): string {
  if (typeof modal === "string") {
    return modal;
  }
  const component = modal as React.ComponentType<P> & {
    [symModalId]?: string;
  };
  if (!component[symModalId]) {
    component[symModalId] = getUid();
  }
  // ...
}
```

**Proposed Pattern: Modal ID Factory**

```typescript
class ModalIdFactory {
  private componentIds = new WeakMap<ComponentType, string>();
  private static instance: ModalIdFactory;

  static getInstance(): ModalIdFactory {
    if (!ModalIdFactory.instance) {
      ModalIdFactory.instance = new ModalIdFactory();
    }
    return ModalIdFactory.instance;
  }

  getId(modal: string | ComponentType): string {
    if (typeof modal === "string") {
      return modal;
    }

    if (!this.componentIds.has(modal)) {
      const id = getUid();
      this.componentIds.set(modal, id);
      return id;
    }

    return this.componentIds.get(modal)!;
  }

  hasId(modal: ComponentType): boolean {
    return this.componentIds.has(modal);
  }

  clear(): void {
    this.componentIds = new WeakMap();
  }
}
```

**Benefits:**

- Better type safety
- Cleaner API
- Easier testing
- Memory efficient (WeakMap)

---

### 4. State Synchronization Complexity

**Location:** `src/components/create.tsx`, `src/hooks/use-modal.ts`

**Issues:**

- Multiple state sources: `ALREADY_MOUNTED`, `modalState`, `modalCallbacks`
- `delayVisible` mechanism is hard to follow
- Mount/unmount tracking via global object (`ALREADY_MOUNTED`)
- Complex state transitions not explicitly modeled

**Current Code Pattern:**

```typescript
// Global state tracking
export const ALREADY_MOUNTED: Record<string, boolean> = {};

// Complex visibility logic
visible: !!ALREADY_MOUNTED[modalId],
delayVisible: !ALREADY_MOUNTED[modalId],
```

**Proposed Pattern: State Machine**

```typescript
enum ModalState {
  UNMOUNTED = "unmounted",
  MOUNTING = "mounting",
  MOUNTED = "mounted",
  VISIBLE = "visible",
  HIDING = "hiding",
  HIDDEN = "hidden",
  REMOVING = "removing",
}

type ModalStateTransition =
  | { from: ModalState.UNMOUNTED; to: ModalState.MOUNTING; action: "MOUNT" }
  | { from: ModalState.MOUNTING; to: ModalState.MOUNTED; action: "MOUNTED" }
  | { from: ModalState.MOUNTED; to: ModalState.VISIBLE; action: "SHOW" }
  | { from: ModalState.VISIBLE; to: ModalState.HIDING; action: "HIDE" }
  | { from: ModalState.HIDING; to: ModalState.HIDDEN; action: "HIDDEN" }
  | { from: ModalState.HIDDEN; to: ModalState.VISIBLE; action: "SHOW" }
  | { from: ModalState.HIDDEN; to: ModalState.REMOVING; action: "REMOVE" }
  | { from: ModalState.REMOVING; to: ModalState.UNMOUNTED; action: "REMOVED" };

class ModalStateMachine {
  private states = new Map<string, ModalState>();

  getState(modalId: string): ModalState {
    return this.states.get(modalId) ?? ModalState.UNMOUNTED;
  }

  transition(modalId: string, action: string): boolean {
    const currentState = this.getState(modalId);
    const validTransition = this.getValidTransition(currentState, action);

    if (validTransition) {
      this.states.set(modalId, validTransition.to);
      return true;
    }

    return false;
  }

  private getValidTransition(
    from: ModalState,
    action: string
  ): ModalStateTransition | null {
    // Define valid transitions
    // ...
  }

  isVisible(modalId: string): boolean {
    return this.getState(modalId) === ModalState.VISIBLE;
  }

  isMounted(modalId: string): boolean {
    const state = this.getState(modalId);
    return state !== ModalState.UNMOUNTED && state !== ModalState.REMOVING;
  }
}
```

**Benefits:**

- Explicit state modeling
- Easier to reason about
- Better error handling
- Clear state transitions
- Easier testing

---

### 5. Adapter Pattern Duplication

**Location:** `src/utils/adapters.ts`

**Issues:**

- Repetitive adapter functions (antdModal, antdModalV5, antdDrawer, antdDrawerV5)
- Similar logic with minor variations
- Hard to extend for new UI libraries
- Code duplication

**Current Code Pattern:**

```typescript
export function antdModal(modal: BaseModalHandler): AntdModalReturn {
  return {
    visible: modal.visible,
    onOk: () => modal.hide(),
    onCancel: () => modal.hide(),
    afterClose: () => {
      modal.resolveHide();
      if (!modal.keepMounted) modal.remove();
    },
  };
}

export function antdModalV5(modal: BaseModalHandler): AntdModalV5Return {
  const { onOk, onCancel, afterClose } = antdModal(modal);
  return {
    open: modal.visible,
    onOk,
    onCancel,
    afterClose,
  };
}
```

**Proposed Pattern: Adapter Factory**

```typescript
interface AdapterConfig {
  visibleProp: "visible" | "open" | "show";
  closeHandlers: string[];
  afterCloseHandler: string;
  version?: number;
}

function createAdapter(config: AdapterConfig) {
  return (modal: BaseModalHandler): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    // Set visibility prop
    result[config.visibleProp] = modal.visible;

    // Create close handlers
    const closeHandler = () => modal.hide();
    config.closeHandlers.forEach((handler) => {
      result[handler] = closeHandler;
    });

    // Create after close handler
    result[config.afterCloseHandler] = () => {
      modal.resolveHide();
      if (!modal.keepMounted) {
        modal.remove();
      }
    };

    return result;
  };
}

// Usage
export const antdModal = createAdapter({
  visibleProp: "visible",
  closeHandlers: ["onOk", "onCancel"],
  afterCloseHandler: "afterClose",
});

export const antdModalV5 = createAdapter({
  visibleProp: "open",
  closeHandlers: ["onOk", "onCancel"],
  afterCloseHandler: "afterClose",
  version: 5,
});
```

**Benefits:**

- Reduced code duplication
- Easier to add new adapters
- Consistent behavior
- Better maintainability

---

### 6. Context Subscription Optimization

**Location:** `src/utils/contexts.ts`

**Current Approach:**

- Uses `useMemo` for selective subscriptions
- Good performance, but could be more flexible

**Proposed Enhancement: Context Selector Pattern**

```typescript
function useModalSelector<T>(
  selector: (store: BaseModalStore) => T,
  equalityFn?: (a: T, b: T) => boolean
): T {
  const store = useContext(BaseModalContext);

  return useMemo(() => {
    return selector(store);
  }, [store, selector]);
}

// Usage
const visibleModals = useModalSelector(
  (store) => Object.values(store).filter((m) => m.visible),
  (a, b) => a.length === b.length && a.every((m, i) => m.id === b[i].id)
);
```

**Benefits:**

- More flexible subscriptions
- Better performance for complex selections
- Reusable selector functions

---

## Refactoring Priority Matrix

| Priority      | Area                        | Complexity | Impact | Effort | Risk   |
| ------------- | --------------------------- | ---------- | ------ | ------ | ------ |
| 🔴 **High**   | Promise/Callback Management | High       | High   | Medium | Low    |
| 🔴 **High**   | Reducer Duplication         | Medium     | High   | Low    | Low    |
| 🟡 **Medium** | Modal ID Resolution         | Medium     | Medium | Low    | Low    |
| 🟡 **Medium** | State Synchronization       | High       | Medium | High   | Medium |
| 🟢 **Low**    | Adapter Pattern             | Low        | Low    | Medium | Low    |
| 🟢 **Low**    | Context Subscription        | Low        | Low    | Low    | Low    |

---

## Recommended Refactoring Patterns

### Pattern 1: Command Pattern for Actions

Replace direct dispatch calls with command objects for better testability and undo capability.

```typescript
interface ModalCommand {
  execute(): Promise<unknown>;
  undo?(): void;
  canExecute(): boolean;
}

class ShowModalCommand implements ModalCommand {
  constructor(
    private modalId: string,
    private args?: Record<string, unknown>,
    private promiseManager: ModalPromiseManager
  ) {}

  canExecute(): boolean {
    return !!this.modalId;
  }

  async execute(): Promise<unknown> {
    if (!this.canExecute()) {
      throw new Error("Cannot execute ShowModalCommand");
    }

    const promise = this.promiseManager.create(this.modalId, "show");
    dispatch(showModal(this.modalId, this.args));
    return promise;
  }

  undo(): void {
    dispatch(hideModal(this.modalId));
  }
}
```

**Benefits:**

- Better testability
- Undo/redo capability
- Command history for debugging
- Easier to add middleware/interceptors

---

### Pattern 2: Observer Pattern for Modal Lifecycle

Replace callback maps with event emitters for better decoupling.

```typescript
type ModalEvent = "show" | "hide" | "remove" | "mount" | "unmount";

class ModalEventEmitter {
  private listeners = new Map<string, Map<ModalEvent, Set<Function>>>();

  on(modalId: string, event: ModalEvent, handler: Function): () => void {
    if (!this.listeners.has(modalId)) {
      this.listeners.set(modalId, new Map());
    }

    const modalListeners = this.listeners.get(modalId)!;
    if (!modalListeners.has(event)) {
      modalListeners.set(event, new Set());
    }

    modalListeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      modalListeners.get(event)?.delete(handler);
    };
  }

  emit(modalId: string, event: ModalEvent, data?: unknown): void {
    const modalListeners = this.listeners.get(modalId);
    if (!modalListeners) return;

    const handlers = modalListeners.get(event);
    if (!handlers) return;

    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in modal event handler for ${modalId}:`, error);
      }
    });
  }

  off(modalId: string, event?: ModalEvent): void {
    if (event) {
      this.listeners.get(modalId)?.delete(event);
    } else {
      this.listeners.delete(modalId);
    }
  }
}
```

**Benefits:**

- Better decoupling
- Multiple listeners per event
- Easier to add logging/monitoring
- Cleaner API

---

### Pattern 3: Builder Pattern for Modal Configuration

Simplify modal creation and configuration.

```typescript
class ModalBuilder<P = Record<string, unknown>> {
  private config: {
    id?: string;
    props?: P;
    keepMounted?: boolean;
    defaultVisible?: boolean;
  } = {};

  withProps(props: P): this {
    this.config.props = props;
    return this;
  }

  withId(id: string): this {
    this.config.id = id;
    return this;
  }

  keepMounted(): this {
    this.config.keepMounted = true;
    return this;
  }

  defaultVisible(): this {
    this.config.defaultVisible = true;
    return this;
  }

  build(): BaseModalHandler<P> {
    // Build and return modal handler
    // ...
  }
}

// Usage
const modal = new ModalBuilder<MyProps>()
  .withId("my-modal")
  .withProps({ title: "Hello" })
  .keepMounted()
  .build();
```

**Benefits:**

- Fluent API
- Type-safe configuration
- Easier to extend
- Better readability

---

### Pattern 4: Strategy Pattern for UI Adapters

Make adapters pluggable and easier to extend.

```typescript
interface UIAdapterStrategy {
  getProps(modal: BaseModalHandler): Record<string, unknown>;
  getName(): string;
}

class AntdModalStrategy implements UIAdapterStrategy {
  getName(): string {
    return "antd-modal";
  }

  getProps(modal: BaseModalHandler): Record<string, unknown> {
    return {
      visible: modal.visible,
      onOk: () => modal.hide(),
      onCancel: () => modal.hide(),
      afterClose: () => {
        modal.resolveHide();
        if (!modal.keepMounted) modal.remove();
      },
    };
  }
}

class AdapterRegistry {
  private strategies = new Map<string, UIAdapterStrategy>();

  register(name: string, strategy: UIAdapterStrategy): void {
    this.strategies.set(name, strategy);
  }

  get(name: string): UIAdapterStrategy | undefined {
    return this.strategies.get(name);
  }

  adapt(name: string, modal: BaseModalHandler): Record<string, unknown> {
    const strategy = this.get(name);
    if (!strategy) {
      throw new Error(`Adapter ${name} not found`);
    }
    return strategy.getProps(modal);
  }
}
```

**Benefits:**

- Pluggable adapters
- Easy to add new UI libraries
- Better testability
- Consistent interface

---

## Implementation Roadmap

### Phase 1: Foundation (Low Risk) - Weeks 1-2

**Goal:** Establish solid foundation with minimal risk

1. **Extract Reducer Duplication**

   - Consolidate reducer logic to single source
   - Update provider to use shared reducer
   - Add tests for consistency
   - **Files:** `src/utils/reducer.ts`, `src/providers/provider.tsx`

2. **Create ModalIdFactory**

   - Implement factory pattern
   - Replace `getModalId()` calls
   - Add comprehensive tests
   - **Files:** `src/utils/modal-id-factory.ts`, `src/utils/modal.ts`

3. **Add Comprehensive Error Handling**
   - Create custom error types
   - Add error boundaries
   - Improve error messages
   - **Files:** `src/utils/errors.ts`, `src/components/error-boundary.tsx`

**Success Criteria:**

- ✅ No code duplication in reducer
- ✅ 100% test coverage maintained
- ✅ All existing tests pass
- ✅ No breaking changes

---

### Phase 2: State Management (Medium Risk) - Weeks 3-4

**Goal:** Improve state management and promise handling

1. **Implement ModalPromiseManager**

   - Create promise manager class
   - Replace callback maps
   - Add automatic cleanup
   - **Files:** `src/utils/promise-manager.ts`, `src/utils/modal.ts`

2. **Add ModalStateMachine**

   - Implement state machine
   - Replace `ALREADY_MOUNTED` tracking
   - Refactor `delayVisible` mechanism
   - **Files:** `src/utils/state-machine.ts`, `src/components/create.tsx`

3. **Refactor State Synchronization**
   - Remove global state objects
   - Use state machine for tracking
   - Update all references
   - **Files:** Multiple files

**Success Criteria:**

- ✅ No global state objects
- ✅ Clear state transitions
- ✅ Better memory management
- ✅ All tests pass

---

### Phase 3: Architecture (Higher Risk) - Weeks 5-6

**Goal:** Improve architecture with advanced patterns

1. **Implement Command Pattern**

   - Create command interface
   - Implement command classes
   - Add command history (optional)
   - **Files:** `src/utils/commands/`, `src/utils/modal.ts`

2. **Add Observer Pattern**

   - Create event emitter
   - Replace callback system
   - Add event logging
   - **Files:** `src/utils/event-emitter.ts`, `src/utils/modal.ts`

3. **Create Builder Pattern**
   - Implement modal builder
   - Add fluent API
   - Update documentation
   - **Files:** `src/utils/modal-builder.ts`

**Success Criteria:**

- ✅ Better testability
- ✅ Improved extensibility
- ✅ Backward compatibility maintained
- ✅ Performance not degraded

---

### Phase 4: Extensibility (Low Risk) - Weeks 7-8

**Goal:** Improve extensibility and developer experience

1. **Refactor Adapters to Strategy Pattern**

   - Create adapter interface
   - Implement strategy classes
   - Create adapter registry
   - **Files:** `src/utils/adapters/`, `src/utils/adapters.ts`

2. **Add Plugin System**

   - Define plugin interface
   - Create plugin registry
   - Add plugin examples
   - **Files:** `src/utils/plugins/`

3. **Improve TypeScript Inference**
   - Add branded types
   - Improve generic constraints
   - Better type inference
   - **Files:** `src/types/`, all files

**Success Criteria:**

- ✅ Easier to add new adapters
- ✅ Plugin system working
- ✅ Better type inference
- ✅ Documentation updated

---

## Code Quality Improvements

### 1. Type Safety

**Current Issues:**

- Use of `unknown` and `any` types
- Weak type inference
- Missing branded types

**Improvements:**

```typescript
// Branded types for modal IDs
type ModalId = string & { readonly __brand: unique symbol };
function createModalId(id: string): ModalId {
  return id as ModalId;
}

// Better generic constraints
interface BaseModalHandler<
  Props extends Record<string, unknown> = Record<string, unknown>
> {
  // ...
}
```

### 2. Error Handling

**Current Issues:**

- Generic error messages
- No error types
- Inconsistent error handling

**Improvements:**

```typescript
class BaseModalError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "BaseModalError";
  }
}

class ModalNotFoundError extends BaseModalError {
  constructor(modalId: string) {
    super(`Modal with id "${modalId}" not found`, "MODAL_NOT_FOUND");
  }
}

class ModalAlreadyExistsError extends BaseModalError {
  constructor(modalId: string) {
    super(`Modal with id "${modalId}" already exists`, "MODAL_ALREADY_EXISTS");
  }
}
```

### 3. Testing

**Current Status:**

- Good unit test coverage
- Missing integration tests for complex flows

**Improvements:**

- Add integration tests for state machine
- Test promise cleanup scenarios
- Test error recovery
- Add performance tests

### 4. Documentation

**Current Status:**

- Good README
- Missing architecture docs

**Improvements:**

- Architecture Decision Records (ADRs)
- Pattern usage examples
- Migration guides
- API reference with examples

---

## Metrics to Track

### Code Quality Metrics

| Metric                | Current | Target | Measurement             |
| --------------------- | ------- | ------ | ----------------------- |
| Code Duplication      | ~15%    | <5%    | SonarQube / CodeClimate |
| Cyclomatic Complexity | ~8 avg  | <5 avg | ESLint complexity rule  |
| Type Coverage         | ~95%    | 100%   | TypeScript compiler     |
| Test Coverage         | 100%    | 100%   | Vitest coverage         |
| Bundle Size           | Current | +0%    | Bundle analyzer         |

### Performance Metrics

| Metric          | Current  | Target | Measurement             |
| --------------- | -------- | ------ | ----------------------- |
| Modal Show Time | Baseline | -10%   | Benchmark suite         |
| Memory Leaks    | 0        | 0      | Memory profiler         |
| Re-render Count | Baseline | -20%   | React DevTools Profiler |

### Developer Experience Metrics

| Metric                 | Current | Target    | Measurement         |
| ---------------------- | ------- | --------- | ------------------- |
| API Complexity         | Medium  | Low       | User surveys        |
| Type Inference Quality | Good    | Excellent | TypeScript feedback |
| Documentation Coverage | 80%     | 95%       | Doc coverage tool   |

---

## Risk Assessment & Mitigation

### High Risk Areas

1. **State Machine Implementation**

   - **Risk:** Breaking existing behavior
   - **Mitigation:** Comprehensive test suite, gradual migration, feature flags

2. **Promise Manager Migration**
   - **Risk:** Memory leaks or promise issues
   - **Mitigation:** Extensive testing, gradual rollout, monitoring

### Medium Risk Areas

1. **Command Pattern**

   - **Risk:** API changes
   - **Mitigation:** Backward compatibility layer, deprecation warnings

2. **Adapter Refactoring**
   - **Risk:** Breaking existing adapters
   - **Mitigation:** Keep old adapters, add new ones, migration guide

### Low Risk Areas

1. **ModalIdFactory**

   - **Risk:** Minimal, internal change
   - **Mitigation:** Comprehensive tests

2. **Context Selector**
   - **Risk:** Minimal, additive change
   - **Mitigation:** Optional feature, backward compatible

---

## Migration Strategy

### Backward Compatibility

All changes will maintain backward compatibility:

1. **Deprecation Warnings**

   - Add warnings for old APIs
   - Provide migration paths
   - Remove in next major version

2. **Feature Flags**

   - Allow opt-in to new features
   - Gradual migration
   - Easy rollback

3. **Documentation**
   - Clear migration guides
   - Code examples
   - FAQ section

### Rollout Plan

1. **Alpha Release** (Internal testing)

   - New patterns implemented
   - Internal team testing
   - Fix critical issues

2. **Beta Release** (Community testing)

   - Release to community
   - Gather feedback
   - Address concerns

3. **Stable Release** (Production ready)
   - Full documentation
   - Migration guides
   - Performance verified

---

## Success Criteria

### Technical Success

- ✅ All tests pass
- ✅ No performance regression
- ✅ Bundle size maintained or reduced
- ✅ 100% type coverage
- ✅ Zero memory leaks

### Developer Experience Success

- ✅ Easier to use API
- ✅ Better type inference
- ✅ Clearer error messages
- ✅ Comprehensive documentation
- ✅ Migration path available

### Business Success

- ✅ No breaking changes (or clear migration path)
- ✅ Improved maintainability
- ✅ Easier to extend
- ✅ Better community adoption

---

## Timeline Summary

| Phase                     | Duration    | Focus                          | Risk Level |
| ------------------------- | ----------- | ------------------------------ | ---------- |
| Phase 1: Foundation       | 2 weeks     | Reducer, ID Factory, Errors    | Low        |
| Phase 2: State Management | 2 weeks     | Promise Manager, State Machine | Medium     |
| Phase 3: Architecture     | 2 weeks     | Command, Observer, Builder     | High       |
| Phase 4: Extensibility    | 2 weeks     | Adapters, Plugins, Types       | Low        |
| **Total**                 | **8 weeks** | **Complete Refactoring**       | **Medium** |

---

## Next Steps

1. **Review & Approval**

   - Review this plan with team
   - Get stakeholder approval
   - Prioritize phases

2. **Setup**

   - Create feature branches
   - Set up tracking tools
   - Prepare test environment

3. **Begin Phase 1**
   - Start with reducer consolidation
   - Create ModalIdFactory
   - Add error handling

---

## Appendix: Code Examples

### Example: Using New Promise Manager

```typescript
// Before
const promise = new Promise((resolve, reject) => {
  modalCallbacks[modalId] = { resolve, reject, promise };
});

// After
const promiseManager = ModalPromiseManager.getInstance();
const promise = promiseManager.create(modalId, "show");
```

### Example: Using State Machine

```typescript
// Before
const shouldMount = !!ALREADY_MOUNTED[modalId];
const delayVisible = !ALREADY_MOUNTED[modalId];

// After
const stateMachine = ModalStateMachine.getInstance();
const shouldMount = stateMachine.isMounted(modalId);
const isVisible = stateMachine.isVisible(modalId);
```

### Example: Using Command Pattern

```typescript
// Before
dispatch(showModal(modalId, args));
const promise = modalCallbacks[modalId].promise;

// After
const command = new ShowModalCommand(modalId, args);
const promise = await command.execute();
```

---

## References

- [State Machine Pattern](https://en.wikipedia.org/wiki/Finite-state_machine)
- [Command Pattern](https://en.wikipedia.org/wiki/Command_pattern)
- [Observer Pattern](https://en.wikipedia.org/wiki/Observer_pattern)
- [Strategy Pattern](https://en.wikipedia.org/wiki/Strategy_pattern)
- [Builder Pattern](https://en.wikipedia.org/wiki/Builder_pattern)

---

**Document Version:** 1.0
**Last Updated:** 2024
**Maintained By:** Development Team
