# Base Modal

This is a small, zero dependency utility to manage modals in a natural way for React. It uses context to persist state of modals globally so that you can show/hide a modal easily either by the modal component or id.

> Forked from [nice-modal-react](https://github.com/eBay/nice-modal-react).

## Installation

```bash
# with bun
bun add base-modal

# with npm
npm install base-modal

# with yarn
yarn add base-modal
```

## Usage

For example, you can use below code to show a modal anywhere:

```jsx
import BaseModal from 'base-modal';
import MyModal from './MyModal';

//...
BaseModal.show(MyModal, { someProp: 'hello' }).then(() => {
  // do something if the task in the modal finished.
});
//...
```

Or you can register the modal with an id so that you don't need to import the modal component to use it:
```jsx
import BaseModal from 'base-modal';
import MyModal from './MyModal';

BaseModal.register('my-modal', MyModal);

// you can use the string id to show/hide the modal anywhere
BaseModal.show('my-modal', { someProp: 'hello' }).then(() => {
  // do something if the task in the modal finished.
});
//...

```

**NOTE**: `base-modal` is not a React modal component but should be used with other modal/dialog implementations by UI libraries like [Material UI](https://material-ui.com/), [Ant.Design](https://ant.design), [Bootstrap React](https://react-bootstrap.github.io/), etc.

## Key Features
* Zero dependency and small.
* Uncontrolled. You can close modal itself in the modal component.
* Decoupled. You don't have to import a modal component to use it. Modals can be managed by id.
* The code of your modal component is not executed if it's invisible.
* It doesn't break the transitions of showing/hiding a modal.
* Promise based. Besides using props to interact with the modal from the parent component, you can do it easier by promise.
* Easy to integrate with any UI library.

## Create Your Modal Component
With BaseModal you can create a separate modal component easily. It's just the same as creating a normal component but wrapping it with high order component by `BaseModal.create`. For example, the below code shows how to create a dialog with [Ant.Design](https://ant.design):

```jsx
import { Modal } from 'antd';
import BaseModal, { useModal } from 'base-modal';

export default BaseModal.create(({ name }: { name: string }) => {
  // Use a hook to manage the modal state
  const modal = useModal();
  return (
    <Modal
      title="Hello Antd"
      onOk={() => modal.hide()}
      visible={modal.visible}
      onCancel={() => modal.hide()}
      afterClose={() => modal.remove()}
    >
      Hello {name}!
    </Modal>
  );
});
```

## Using Your Modal Component
There are very flexible APIs for you to manage modals. See below for the introduction.

### Embed your application with `BaseModal.Provider`:
Since we will manage the status of modals globally, the first thing is embedding your app with BaseModal provider, for example:

```jsx
import BaseModal from 'base-modal';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BaseModal.Provider>
      <App />
    </BaseModal.Provider>
  </React.StrictMode>
);
```

### Using the modal by component
You can control a nice modal by the component itself.
```jsx
import BaseModal from 'base-modal';
import MyAntdModal from './my-antd-modal'; // created by above code

function App() {
  const showAntdModal = () => {
    // Show a modal with arguments passed to the component as props
    BaseModal.show(MyAntdModal, { name: 'Nate' })
  };
  return (
    <div className="app">
      <h1>Nice Modal Examples</h1>
      <div className="demo-buttons">
        <button onClick={showAntdModal}>Antd Modal</button>
      </div>
    </div>
  );
}
```

### Use the modal by id
You can also control a nice modal by id:
```jsx
import BaseModal from 'base-modal';
import MyAntdModal from './my-antd-modal'; // created by above code

// If you use by id, you need to register the modal component.
// Normally you create a modals.js file in your project
// and register all modals there.
BaseModal.register('my-antd-modal', MyAntdModal);

function App() {
  const showAntdModal = () => {
    // Show a modal with arguments passed to the component as props
    BaseModal.show('my-antd-modal', { name: 'Nate' })
  };
  return (
    <div className="app">
      <h1>Nice Modal Examples</h1>
      <div className="demo-buttons">
        <button onClick={showAntdModal}>Antd Modal</button>
      </div>
    </div>
  );
}
```


### Use modal with the hook
The `useModal` hook can not only be used inside a modal component but also any component by passing it a modal id/component:

```jsx
import BaseModal, { useModal } from 'base-modal';
import MyAntdModal from './my-antd-modal'; // created by above code

BaseModal.register('my-antd-modal', MyAntdModal);
//...
// if you use with id, you need to register it first
const modal = useModal('my-antd-modal');
// or if with component, no need to register
const modal = useModal(MyAntdModal);

//...
modal.show({ name: 'Nate' }); // show the modal
modal.hide(); // hide the modal
//...
```

### Declare your modal instead of `register`
The nice modal component you created can be also used as a normal component by JSX, then you don't need to register it. For example:

```jsx
import BaseModal, { useModal } from 'base-modal';
import MyAntdModal from './my-antd-modal'; // created by above code

function App() {
  const showAntdModal = () => {
    // Show a modal with arguments passed to the component as props
    BaseModal.show('my-antd-modal')
  };
  return (
    <div className="app">
      <h1>Nice Modal Examples</h1>
      <div className="demo-buttons">
        <button onClick={showAntdModal}>Antd Modal</button>
      </div>
      <MyAntdModal id="my-antd-modal" name="Nate" />
    </div>
  );
}
```

### Using promise API

Besides using props to interact with the modal from the parent component, you can do more easily by promise. For example, we have a user list page with an add user button to show a dialog to add user. After user is added the list should refresh itself to reflect the change, then we can use below code:

```jsx
BaseModal.show(AddUserModal)
  .then(() => {
    // When call modal.resolve(payload) in the modal component
    // it will resolve the promise returned by `show` method.
    // fetchUsers will call the rest API and update the list
    fetchUsers()
  })
  .catch(err=> {
    // if modal.reject(new Error('something went wrong')), it will reject the promise
  });
```

### Integrating with Redux
Though not necessary, you can integrate Redux to manage the state of nice modals. Then you can use Redux dev tools to track/debug state change of modals. Here is how to do it:

```jsx
// First combine the reducer
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';
import BaseModal from 'base-modal';
import { Button } from 'antd';
import { MyAntdModal } from './MyAntdModal';
import logger from 'redux-logger';

const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
const enhancer = composeEnhancers(applyMiddleware(logger));

const store = createStore(
  combineReducers({
    modals: BaseModal.reducer,
    // other reducers...
  }),
  enhancer,
);

// Passing Redux state to the nice modal provider
const ModalsProvider = ({ children }) => {
  const modals = useSelector((s) => s.modals);
  const dispatch = useDispatch();
  return (
    <BaseModal.Provider modals={modals} dispatch={dispatch}>
      {children}
    </BaseModal.Provider>
  );
};

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <ModalsProvider>{children}</ModalsProvider>
    </Provider>
  );
}
```

### Using with any UI library
BaseModal provides lifecycle methods to manage the state of modals. You can use modal handler returned by `useModal` hook to bind any modal-like component to the state. Below are typical states and methods you will use:

* **modal.visible**: the visibility of a modal.
* **modal.hide**: will hide the modal, that is, change `modal.visible` to false.
* **modal.remove**: remove the modal component from the tree so that your modal's code is not executed when it's invisible. Usually, you call this method after the modal's transition.
* **modal.keepMounted** if you don't want to remove the modal from the tree for some instances, you can decide if call `modal.remove` based on the value of `keepMounted`.

Based on these properties/methods, you can easily use BaseModal with any modal-like component provided by any UI libraries.

### Using help methods
As you already saw, we use code similar with below to manage the modal state:

```jsx
//...
const modal = useModal();
return (
  <Modal
    visible={modal.visible}
    title="Hello Antd"
    onOk={() => modal.hide()}
    onCancel={() => modal.hide()}
    afterClose={() => modal.remove()}
  >
    Hello BaseModal!
  </Modal>
);
//...
```

For every modal implementation, we always need to do these bindings manually. So, to make it easier to use we provided helper methods for 3 popular UI libraries Material UI, Ant.Design and Bootstrap React.


```jsx
import BaseModal, {
  muiDialog,
  muiDialogV5,
  antdModal,
  antdModalV5,
  antdDrawer,
  antdDrawerV5,
  bootstrapDialog
} from 'base-modal';

//...
const modal = useModal();
// For MUI
<Dialog {...muiDialog(modal)}>

// For MUI V5
<Dialog {...muiDialogV5(modal)}>

// For ant.design
<Modal {...antdModal(modal)}>

// For ant.design v4.23.0 or later
<Modal {...antdModalV5(modal)}>

// For antd drawer
<Drawer {...antdDrawer(modal)}>

// For antd drawer v4.23.0 or later
<Drawer {...antdDrawerV5(modal)}>

// For bootstrap dialog
<Dialog {...bootstrapDialog(modal)}>

```

## Testing

You can test your nice modals with tools like `@testing-library/react` and `vitest`.

```jsx
import BaseModal from 'base-modal';
import { render, act, screen } from '@testing-library/react';
import { MyBaseModal } from '../MyBaseModal';

test('My nice modal works!', () => {
  render(<BaseModal.Provider />

  act(() => {
    BaseModal.show(MyBaseModal);
  });

  expect(screen.getByRole('dialog')).toBeVisible();
});
```

## Contribution Guide

```bash
# 1. Clone repo
git clone https://github.com/your-username/base-modal.git

# 2. Install deps
cd base-modal
bun install

# 3. Build
bun run build

# 4. Test
bun run test

# 5. Lint
bun run lint
```

# License
MIT
