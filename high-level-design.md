# High-Level Design

## System Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        App[Application]
        UserComponent[User Components]
    end

    subgraph "Base Modal Library"
        subgraph "Provider & Context"
            Provider[Provider Component]
            InnerProvider[InnerContextProvider]
            BaseModalContext[BaseModalContext]
            BaseModalIdContext[BaseModalIdContext]
        end

        subgraph "Core Components"
            Create[create HOC]
            ModalDef[ModalDef Component]
            ModalHolder[ModalHolder Component]
            Placeholder[BaseModalPlaceholder]
        end

        subgraph "Hooks"
            UseModal[useModal Hook]
            UseModalContext[useModalContext Hook]
        end

        subgraph "State Management"
            Store[BaseModalStore]
            Reducer[Reducer]
            Dispatch[dispatch Function]
            Actions[Actions]
        end

        subgraph "Registry & Callbacks"
            Registry[MODAL_REGISTRY]
            Callbacks[modalCallbacks]
            HideCallbacks[hideModalCallbacks]
        end

        subgraph "Utilities"
            ModalUtils[Modal Utils<br/>show/hide/remove/register]
            Adapters[UI Framework Adapters<br/>antdModal/muiDialog/bootstrapDialog]
        end
    end

    subgraph "UI Frameworks"
        AntD[Ant Design]
        MUI[Material-UI]
        Bootstrap[Bootstrap]
        Custom[Custom UI]
    end

    %% Application to Provider
    App --> Provider
    UserComponent --> Provider

    %% Provider flow
    Provider --> InnerProvider
    InnerProvider --> BaseModalContext
    Provider --> BaseModalContext
    BaseModalContext --> Placeholder

    %% Component creation flow
    UserComponent --> Create
    Create --> UseModal
    Create --> UseModalContext
    UseModalContext --> BaseModalContext

    %% Modal registration
    UserComponent --> ModalDef
    ModalDef --> Registry
    ModalHolder --> Registry

    %% State management flow
    UseModal --> ModalUtils
    ModalUtils --> Dispatch
    Dispatch --> Actions
    Actions --> Reducer
    Reducer --> Store
    Store --> BaseModalContext

    %% Callback management
    ModalUtils --> Callbacks
    ModalUtils --> HideCallbacks

    %% Rendering flow
    Placeholder --> Registry
    Registry --> Create
    Create --> UserComponent

    %% Adapters
    Adapters --> Create
    Adapters --> AntD
    Adapters --> MUI
    Adapters --> Bootstrap
    Adapters --> Custom

    %% Context usage
    Create --> BaseModalIdContext
    UseModalContext --> BaseModalIdContext

    style Provider fill:#e1f5ff
    style Store fill:#fff4e1
    style Registry fill:#ffe1f5
    style Reducer fill:#e1ffe1
    style Create fill:#f0e1ff
```

## Data Flow

```mermaid
sequenceDiagram
    participant User as User Component
    participant Hook as useModal Hook
    participant Utils as Modal Utils
    participant Dispatch as Dispatch
    participant Reducer as Reducer
    participant Store as BaseModalStore
    participant Context as BaseModalContext
    participant Component as Modal Component

    User->>Hook: useModal(id)
    Hook->>Context: Subscribe to modal state
    Hook-->>User: Return modal handler

    User->>Hook: modal.show(args)
    Hook->>Utils: show(modal, args)
    Utils->>Dispatch: dispatch(showModal action)
    Dispatch->>Reducer: applyActionToDraft(draft, action)
    Reducer->>Store: Update modal state
    Store->>Context: Notify subscribers
    Context->>Component: Re-render with new state
    Component->>User: Modal visible

    User->>Hook: modal.hide()
    Hook->>Utils: hide(modal)
    Utils->>Dispatch: dispatch(hideModal action)
    Dispatch->>Reducer: applyActionToDraft(draft, action)
    Reducer->>Store: Update visible: false
    Store->>Context: Notify subscribers
    Context->>Component: Re-render hidden state
```

## Component Hierarchy

```mermaid
graph TD
    App[Application Root]
    Provider[Provider]
    InnerProvider[InnerContextProvider]
    Context[BaseModalContext.Provider]
    Placeholder[BaseModalPlaceholder]
    AppContent[Application Content]

    subgraph "Modal Instance"
        ModalDef[ModalDef Component]
        CreatedModal[Created Modal via create HOC]
        ModalComp[User Modal Component]
    end

    App --> Provider
    Provider --> InnerProvider
    InnerProvider --> Context
    Context --> AppContent
    Context --> Placeholder

    AppContent --> ModalDef
    ModalDef --> CreatedModal
    Placeholder --> CreatedModal
    CreatedModal --> ModalComp

    style Provider fill:#e1f5ff
    style Context fill:#fff4e1
    style Placeholder fill:#ffe1f5
    style CreatedModal fill:#f0e1ff
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Unmounted: Modal not created

    Unmounted --> Mounting: show() called
    Mounting --> Visible: delayVisible = true
    Visible --> Hidden: hide() called
    Hidden --> Visible: show() called again
    Hidden --> Unmounted: remove() called

    Unmounted --> MountedKeepAlive: keepMounted = true
    MountedKeepAlive --> Visible: show() called
    Visible --> Hidden: hide() called
    Hidden --> MountedKeepAlive: keepMounted = true
    MountedKeepAlive --> Unmounted: remove() called

    note right of Mounting
        Modal mounts first,
        then becomes visible
        (enables transitions)
    end note

    note right of MountedKeepAlive
        Modal stays in DOM
        even when hidden
        (for animations)
    end note
```

## Modal Lifecycle

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Create as create()
    participant Registry as MODAL_REGISTRY
    participant Show as show()
    participant Store as Store
    participant Component as Modal Component
    participant Resolve as Promise Resolve

    Dev->>Create: create(MyModal)
    Create-->>Dev: Enhanced Component

    Dev->>Show: show(MyModal, args)
    Show->>Registry: Check/Register modal
    Show->>Store: Dispatch show action
    Store->>Component: Mount & Show modal
    Component->>Show: Create promise

    Component->>Resolve: modal.resolve(value)
    Resolve->>Show: Promise resolves
    Show-->>Dev: Return value

    Component->>Show: modal.hide()
    Show->>Store: Dispatch hide action
    Store->>Component: Hide modal
    Component->>Show: Cleanup callbacks
```

## Registry & Callback System

```mermaid
graph LR
    subgraph "Registration"
        Register[register]
        Unregister[unregister]
        GetModal[getModal]
    end

    subgraph "Registry Storage"
        Registry[MODAL_REGISTRY<br/>id → Component + Props]
    end

    subgraph "Callback Storage"
        ShowCallbacks[modalCallbacks<br/>id → Promise handlers]
        HideCallbacks[hideModalCallbacks<br/>id → Promise handlers]
    end

    subgraph "Operations"
        Show[show]
        Hide[hide]
        Remove[remove]
    end

    Register --> Registry
    Unregister --> Registry
    GetModal --> Registry

    Show --> Registry
    Show --> ShowCallbacks
    Hide --> HideCallbacks
    Remove --> Registry
    Remove --> ShowCallbacks
    Remove --> HideCallbacks

    style Registry fill:#ffe1f5
    style ShowCallbacks fill:#fff4e1
    style HideCallbacks fill:#e1ffe1
```

## Context Subscription Pattern

```mermaid
graph TB
    subgraph "Context Layer"
        BaseModalContext[BaseModalContext<br/>Contains all modal states]
    end

    subgraph "Selective Subscription"
        UseModalContext[useModalContext hook<br/>Subscribes to specific modal]
        UseModal[useModal hook<br/>Uses selective subscription]
    end

    subgraph "Components"
        Modal1[Modal Component 1]
        Modal2[Modal Component 2]
        Modal3[Modal Component 3]
    end

    BaseModalContext --> UseModalContext
    UseModalContext --> UseModal
    UseModal --> Modal1
    UseModal --> Modal2
    UseModal --> Modal3

    note1[Modal1 only re-renders<br/>when its state changes]
    note2[Modal2 only re-renders<br/>when its state changes]
    note3[Modal3 only re-renders<br/>when its state changes]

    UseModalContext -.->|Selective| note1
    UseModalContext -.->|Selective| note2
    UseModalContext -.->|Selective| note3

    style BaseModalContext fill:#e1f5ff
    style UseModalContext fill:#fff4e1
```

## Action Types & Reducer Logic

```mermaid
graph TB
    subgraph "Action Types"
        ShowAction[base-modal/show<br/>Show modal with args]
        HideAction[base-modal/hide<br/>Hide modal]
        RemoveAction[base-modal/remove<br/>Remove from DOM]
        SetFlagsAction[base-modal/set-flags<br/>Set modal flags]
    end

    subgraph "Reducer Logic"
        ApplyAction[applyActionToDraft]
        ShowLogic[Show Logic:<br/>- Set args<br/>- visible based on mount<br/>- delayVisible if not mounted]
        HideLogic[Hide Logic:<br/>- Set visible = false]
        RemoveLogic[Remove Logic:<br/>- Delete from store]
        FlagsLogic[Flags Logic:<br/>- Merge flags<br/>- Handle keepMounted]
    end

    subgraph "State Updates"
        ImmerDraft[Immer Draft]
        NewState[New State]
    end

    ShowAction --> ApplyAction
    HideAction --> ApplyAction
    RemoveAction --> ApplyAction
    SetFlagsAction --> ApplyAction

    ApplyAction --> ShowLogic
    ApplyAction --> HideLogic
    ApplyAction --> RemoveLogic
    ApplyAction --> FlagsLogic

    ShowLogic --> ImmerDraft
    HideLogic --> ImmerDraft
    RemoveLogic --> ImmerDraft
    FlagsLogic --> ImmerDraft

    ImmerDraft --> NewState

    style ApplyAction fill:#e1f5ff
    style ImmerDraft fill:#fff4e1
    style NewState fill:#e1ffe1
```

## UI Framework Adapter Pattern

```mermaid
graph TB
    subgraph "Base Modal Core"
        Create[create HOC]
        UseModal[useModal Hook]
    end

    subgraph "Adapter Layer"
        AntdAdapter[antdModal<br/>antdDrawer]
        MuiAdapter[muiDialog]
        BootstrapAdapter[bootstrapDialog]
        CustomAdapter[Custom Adapter]
    end

    subgraph "UI Framework Components"
        AntdModal[Ant Design Modal]
        AntdDrawer[Ant Design Drawer]
        MuiDialog[MUI Dialog]
        BootstrapModal[Bootstrap Modal]
        UserComponent[User Component]
    end

    Create --> AntdAdapter
    Create --> MuiAdapter
    Create --> BootstrapAdapter
    Create --> CustomAdapter

    AntdAdapter --> AntdModal
    AntdAdapter --> AntdDrawer
    MuiAdapter --> MuiDialog
    BootstrapAdapter --> BootstrapModal
    CustomAdapter --> UserComponent

    UseModal --> AntdAdapter
    UseModal --> MuiAdapter
    UseModal --> BootstrapAdapter
    UseModal --> CustomAdapter

    style Create fill:#e1f5ff
    style AntdAdapter fill:#fff4e1
    style MuiAdapter fill:#ffe1f5
    style BootstrapAdapter fill:#e1ffe1
```

## Key Design Patterns

### 1. Higher-Order Component (HOC) Pattern
- `create()` wraps user components with modal functionality
- Provides modal state and handlers via props
- Manages mounting/unmounting lifecycle

### 2. Context Pattern
- `BaseModalContext` provides global modal state
- `BaseModalIdContext` provides current modal ID
- Selective subscriptions prevent unnecessary re-renders

### 3. Registry Pattern
- `MODAL_REGISTRY` stores registered modal components
- Enables ID-based modal lookup
- Supports declarative and imperative usage

### 4. Promise-Based API
- `show()` returns a promise that resolves when modal closes
- `modalCallbacks` and `hideModalCallbacks` manage promise resolution
- Enables async/await patterns

### 5. Reducer Pattern
- Centralized state management via reducer
- Immutable updates using Immer
- Action-based state transitions

### 6. Adapter Pattern
- UI framework adapters wrap framework-specific components
- Provides consistent API across different frameworks
- Enables framework-agnostic modal management

