# Base Modal

A small, zero-dependency utility to manage modals in a natural way for React. Built with TypeScript, optimized for performance, and designed with developer experience in mind.

## Features

- 🚀 **Zero Dependencies** - Only requires React 19+ (uses `immer` and `use-immer` internally)
- ⚡ **High Performance** - Optimized with selective context subscriptions, memoization, and efficient re-renders
- 🎯 **Type-Safe** - Full TypeScript support with excellent type inference
- 🔄 **Promise-Based API** - Natural async/await patterns for modal interactions
- 🎨 **UI Framework Agnostic** - Works with any UI library (Ant Design, Material-UI, Bootstrap, etc.)
- 📦 **Small Bundle Size** - Minimal footprint with tree-shaking support
- ✅ **100% Test Coverage** - Comprehensive test suite with benchmarks

## Installation

```bash
npm install base-modal
# or
yarn add base-modal
# or
pnpm add base-modal
# or
bun add base-modal
```

## Quick Start

### 1. Wrap your app with Provider

```tsx
import { Provider } from 'base-modal';

function App() {
  return (
    <Provider>
      <YourApp />
    </Provider>
  );
}
```

### 2. Create a modal component

```tsx
import { create } from 'base-modal';

const MyModal = create(({ title, message }: { title: string; message: string }) => {
  const modal = useModal();

  return (
    <div className="modal">
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={() => modal.hide()}>Close</button>
    </div>
  );
});
```

### 3. Show the modal

```tsx
import BaseModal from 'base-modal';

// Show modal with arguments
const result = await BaseModal.show(MyModal, {
  title: 'Hello',
  message: 'World'
});

// Modal returns a promise that resolves when hidden
console.log('Modal closed with:', result);
```

## Core Concepts

### Creating Modals

Use the `create` HOC to wrap your modal component:

```tsx
import { create, useModal } from 'base-modal';

const ConfirmDialog = create(({ message }: { message: string }) => {
  const modal = useModal();

  return (
    <div>
      <p>{message}</p>
      <button onClick={() => modal.resolve('confirmed')}>Confirm</button>
      <button onClick={() => modal.reject('cancelled')}>Cancel</button>
    </div>
  );
});
```

### Showing Modals

```tsx
import BaseModal from 'base-modal';

// Using component directly
const result = await BaseModal.show(ConfirmDialog, { message: 'Are you sure?' });

// Using registered ID
BaseModal.register('confirm', ConfirmDialog);
const result = await BaseModal.show('confirm', { message: 'Are you sure?' });
```

### Using the Hook

```tsx
import { useModal } from 'base-modal';

function MyComponent() {
  const modal = useModal('confirm'); // or useModal(ConfirmDialog)

  const handleClick = async () => {
    await modal.show({ message: 'Hello' });
    // Modal is now visible
    await modal.hide();
    // Modal is now hidden
  };

  return <button onClick={handleClick}>Open Modal</button>;
}
```

## API Reference

### `Provider`

Wraps your application to provide modal context.

```tsx
<Provider>
  <App />
</Provider>
```

### `create<P>(Component)`

Creates a modal component from a regular React component.

```tsx
const Modal = create((props: MyProps) => {
  // Your modal component
});
```

### `useModal(modal?)`

Hook to interact with modals. Returns a handler with methods:

- `show(args?)` - Show the modal with optional arguments
- `hide()` - Hide the modal
- `remove()` - Remove the modal from DOM
- `resolve(value)` - Resolve the modal's promise
- `reject(value)` - Reject the modal's promise
- `resolveHide(value?)` - Resolve and hide

### `BaseModal.show(modal, args?)`

Show a modal programmatically. Returns a promise that resolves when the modal is closed.

```tsx
const result = await BaseModal.show(MyModal, { prop: 'value' });
```

### `BaseModal.hide(modal)`

Hide a modal programmatically.

```tsx
BaseModal.hide(MyModal);
```

### `BaseModal.register(id, component, props?)`

Register a modal component with an ID for later use.

```tsx
BaseModal.register('my-modal', MyModal);
```

### `BaseModal.remove(modal)`

Remove a modal from the DOM.

```tsx
BaseModal.remove(MyModal);
```

## Advanced Usage

### Keep Modal Mounted

Keep the modal in the DOM even when hidden (useful for animations):

```tsx
const Modal = create((props) => {
  // Component code
});

<Modal id="my-modal" keepMounted />
```

### Default Visible

Show modal by default:

```tsx
<Modal id="my-modal" defaultVisible />
```

### Declarative Registration

Use `ModalDef` to register modals declaratively:

```tsx
import { ModalDef } from 'base-modal';

<ModalDef id="my-modal" component={MyModal} />
```

### Redux Integration

You can integrate with Redux by providing custom dispatch and modals:

```tsx
<Provider dispatch={reduxDispatch} modals={reduxModals}>
  <App />
</Provider>
```

## UI Framework Adapters

Base Modal includes adapters for popular UI frameworks:

### Ant Design

```tsx
import { antdModal, antdDrawer } from 'base-modal';

const MyAntdModal = antdModal(({ title, content }) => (
  <Modal title={title}>{content}</Modal>
));
```

### Material-UI

```tsx
import { muiDialog } from 'base-modal';

const MyMuiDialog = muiDialog(({ title, content }) => (
  <Dialog>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{content}</DialogContent>
  </Dialog>
));
```

### Bootstrap

```tsx
import { bootstrapDialog } from 'base-modal';

const MyBootstrapModal = bootstrapDialog(({ title, content }) => (
  <div className="modal">
    <div className="modal-header">{title}</div>
    <div className="modal-body">{content}</div>
  </div>
));
```

## Performance

Base Modal is optimized for performance:

- **Selective Context Subscriptions** - Components only re-render when their specific modal changes
- **Memoization** - Components and context values are memoized to prevent unnecessary re-renders
- **Efficient State Management** - Uses Immer for immutable updates with minimal overhead

### Benchmarks

Run benchmarks to see performance metrics:

```bash
npm run benchmark
```

See [benchmarks documentation](./src/benchmarks/README.md) for details.

## TypeScript

Full TypeScript support with excellent type inference:

```tsx
interface MyModalProps {
  title: string;
  onConfirm: () => void;
}

const MyModal = create((props: MyModalProps) => {
  // props is fully typed
  return <div>{props.title}</div>;
});

// TypeScript infers the props type
const result = await BaseModal.show(MyModal, {
  title: 'Hello', // ✅ Type-checked
  onConfirm: () => {}, // ✅ Type-checked
});
```

## Testing

The library includes comprehensive tests with 100% coverage:

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (watch)
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

