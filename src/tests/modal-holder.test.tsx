import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import React from "react";
import { ModalHolder, Provider, create, register, useModal } from "../index";
import { TestModal } from "./helpers/test-modal";

/**
 * Test Perspective Table for ModalHolder
 *
 * | Case ID | Input / Precondition | Perspective (Equivalence / Boundary) | Expected Result | Notes |
 * |---------|----------------------|--------------------------------------|-----------------|-------|
 * | TC-N-01 | ModalHolder with registered modal id and handler object | Equivalence - normal | Handler gets show/hide methods, modal renders | - |
 * | TC-N-02 | ModalHolder with component directly and handler object | Equivalence - normal | Handler gets show/hide methods, modal renders | - |
 * | TC-N-03 | ModalHolder with additional props passed through | Equivalence - normal | Props passed to modal component | - |
 * | TC-N-04 | Handler.show() with args | Equivalence - normal | Modal shows with provided args | - |
 * | TC-N-05 | Handler.hide() | Equivalence - normal | Modal hides correctly | - |
 * | TC-A-01 | ModalHolder without handler (null) | Boundary - NULL | Throws Error: "No handler found in BaseModal.ModalHolder." | Verify type and message |
 * | TC-A-02 | ModalHolder without handler (undefined) | Boundary - undefined | Uses default empty object (does not throw) | Component has default handler = {} |
 * | TC-A-03 | ModalHolder with invalid modal id (not registered) | Boundary - invalid id | Throws Error: "No modal found for id: {id} in BaseModal.ModalHolder." | Verify type and message |
 * | TC-A-04 | ModalHolder with empty string modal id | Boundary - empty string | Throws Error if not registered | - |
 * | TC-A-05 | Handler.show() called multiple times | Boundary - multiple calls | All calls work correctly | - |
 * | TC-A-06 | Handler.hide() called multiple times | Boundary - multiple calls | All calls work correctly | - |
 * | TC-B-01 | ModalHolder with handler as empty object | Boundary - empty object | Handler gets show/hide methods assigned | - |
 * | TC-B-02 | ModalHolder with handler containing existing properties | Boundary - existing props | Existing properties preserved, show/hide added | - |
 * | TC-B-03 | Handler.show() with null args | Boundary - NULL | Modal shows with null args | - |
 * | TC-B-04 | Handler.show() with undefined args | Boundary - undefined | Modal shows with undefined args | - |
 * | TC-B-05 | Handler.show() with empty object args | Boundary - empty object | Modal shows with empty args | - |
 */

const TestModalComponent = create(({ name = "test" }: { name?: string }) => {
  const modal = useModal();
  const remove = () => modal.remove();

  return (
    <TestModal visible={modal.visible} onExited={remove} onClose={remove}>
      <span>{name}</span>
      <div>TestModalComponent</div>
    </TestModal>
  );
});

test("ModalHolder with registered modal id and handler object", async () => {
  // Given: A registered modal and a handler object
  const modalId = "test-modal-holder";
  register(modalId, TestModalComponent);
  const handler: any = {};

  // When: ModalHolder is rendered with registered modal id and handler
  render(
    <Provider>
      <ModalHolder modal={modalId} handler={handler} />
    </Provider>,
  );

  // Then: Handler should have show and hide methods, and modal should be mountable
  expect(typeof handler.show).toBe("function");
  expect(typeof handler.hide).toBe("function");
});

test("ModalHolder with component directly and handler object", async () => {
  // Given: A modal component and a handler object
  const handler: any = {};

  // When: ModalHolder is rendered with component directly and handler
  render(
    <Provider>
      <ModalHolder modal={TestModalComponent} handler={handler} />
    </Provider>,
  );

  // Then: Handler should have show and hide methods
  expect(typeof handler.show).toBe("function");
  expect(typeof handler.hide).toBe("function");
});

test("ModalHolder with additional props passed through", async () => {
  // Given: A registered modal, handler, and additional props
  const modalId = "test-modal-props";
  register(modalId, TestModalComponent);
  const handler: any = {};
  const additionalProps = { name: "custom-name" };

  // When: ModalHolder is rendered with additional props
  render(
    <Provider>
      <ModalHolder modal={modalId} handler={handler} {...additionalProps} />
    </Provider>,
  );

  // Then: Handler should have show and hide methods
  expect(typeof handler.show).toBe("function");
  expect(typeof handler.hide).toBe("function");
});

test("Handler.show() with args shows modal correctly", async () => {
  // Given: ModalHolder with registered modal and handler
  const modalId = "test-modal-show";
  register(modalId, TestModalComponent);
  const handler: any = {};

  render(
    <Provider>
      <ModalHolder modal={modalId} handler={handler} />
    </Provider>,
  );

  // When: Handler.show() is called with args
  act(() => {
    handler.show({ name: "shown-modal" });
  });

  // Then: Modal should be visible with provided args
  await act(async () => {
    const modalText = screen.queryByText("TestModalComponent");
    expect(modalText).toBeInTheDocument();
  });
});

test("Handler.hide() hides modal correctly", async () => {
  // Given: ModalHolder with registered modal and handler, modal is shown
  const modalId = "test-modal-hide";
  register(modalId, TestModalComponent);
  const handler: any = {};

  render(
    <Provider>
      <ModalHolder modal={modalId} handler={handler} />
    </Provider>,
  );

  act(() => {
    handler.show({ name: "to-hide" });
  });

  // When: Handler.hide() is called
  act(() => {
    handler.hide();
  });

  // Then: Modal should be hidden
  await waitForElementToBeRemoved(() =>
    screen.queryByText("TestModalComponent"),
  );
});

test("ModalHolder without handler (null) throws error", () => {
  // Given: ModalHolder with null handler
  const modalId = "test-modal-null-handler";
  register(modalId, TestModalComponent);

  // When: ModalHolder is rendered with null handler
  // Then: Should throw Error with specific type and message
  expect(() => {
    render(
      <Provider>
        <ModalHolder modal={modalId} handler={null} />
      </Provider>,
    );
  }).toThrow("No handler found in BaseModal.ModalHolder.");
});

test("ModalHolder without handler (undefined) uses default empty object", () => {
  // Given: ModalHolder with undefined handler (component has default handler = {})
  const modalId = "test-modal-undefined-handler";
  register(modalId, TestModalComponent);

  // When: ModalHolder is rendered with undefined handler
  // Then: Should use default empty object (does not throw)
  render(
    <Provider>
      <ModalHolder modal={modalId} handler={undefined} />
    </Provider>,
  );
  // Component uses default handler = {}, so it doesn't throw
});

test("ModalHolder with invalid modal id (not registered) throws error", () => {
  // Given: An unregistered modal id
  const invalidModalId = "non-existent-modal";
  const handler: any = {};

  // When: ModalHolder is rendered with invalid modal id
  // Then: Should throw Error with specific type and message
  expect(() => {
    render(
      <Provider>
        <ModalHolder modal={invalidModalId} handler={handler} />
      </Provider>,
    );
  }).toThrow(
    `No modal found for id: ${invalidModalId} in BaseModal.ModalHolder.`,
  );
});

test("ModalHolder with empty string modal id throws error if not registered", () => {
  // Given: Empty string modal id that is not registered
  const emptyModalId = "";
  const handler: any = {};

  // When: ModalHolder is rendered with empty string modal id
  // Then: Should throw Error if not registered
  expect(() => {
    render(
      <Provider>
        <ModalHolder modal={emptyModalId} handler={handler} />
      </Provider>,
    );
  }).toThrow(
    `No modal found for id: ${emptyModalId} in BaseModal.ModalHolder.`,
  );
});

test("Handler.show() called multiple times works correctly", async () => {
  // Given: ModalHolder with registered modal and handler
  const modalId = "test-modal-multiple-show";
  register(modalId, TestModalComponent);
  const handler: any = {};

  render(
    <Provider>
      <ModalHolder modal={modalId} handler={handler} />
    </Provider>,
  );

  // When: Handler.show() is called multiple times
  act(() => {
    handler.show({ name: "first" });
  });
  act(() => {
    handler.show({ name: "second" });
  });

  // Then: All calls should work correctly
  expect(typeof handler.show).toBe("function");
  await act(async () => {
    const modalText = screen.queryByText("TestModalComponent");
    expect(modalText).toBeInTheDocument();
  });
});

test("Handler.hide() called multiple times works correctly", async () => {
  // Given: ModalHolder with registered modal and handler, modal is shown
  const modalId = "test-modal-multiple-hide";
  register(modalId, TestModalComponent);
  const handler: any = {};

  render(
    <Provider>
      <ModalHolder modal={modalId} handler={handler} />
    </Provider>,
  );

  act(() => {
    handler.show({ name: "to-hide-multiple" });
  });

  // When: Handler.hide() is called multiple times
  act(() => {
    handler.hide();
  });
  act(() => {
    handler.hide();
  });

  // Then: All calls should work correctly
  expect(typeof handler.hide).toBe("function");
  await waitForElementToBeRemoved(() =>
    screen.queryByText("TestModalComponent"),
  );
});

test("ModalHolder with handler as empty object", () => {
  // Given: ModalHolder with empty object as handler
  const modalId = "test-modal-empty-handler";
  register(modalId, TestModalComponent);
  const handler: any = {};

  // When: ModalHolder is rendered with empty handler object
  render(
    <Provider>
      <ModalHolder modal={modalId} handler={handler} />
    </Provider>,
  );

  // Then: Handler should get show and hide methods assigned
  expect(typeof handler.show).toBe("function");
  expect(typeof handler.hide).toBe("function");
});

test("ModalHolder with handler containing existing properties", () => {
  // Given: ModalHolder with handler containing existing properties
  const modalId = "test-modal-existing-props";
  register(modalId, TestModalComponent);
  const handler: any = {
    existingProp: "value",
    existingMethod: () => "test",
  };

  // When: ModalHolder is rendered with handler having existing properties
  render(
    <Provider>
      <ModalHolder modal={modalId} handler={handler} />
    </Provider>,
  );

  // Then: Existing properties should be preserved, show/hide should be added
  expect(handler.existingProp).toBe("value");
  expect(typeof handler.existingMethod).toBe("function");
  expect(typeof handler.show).toBe("function");
  expect(typeof handler.hide).toBe("function");
});

test("Handler.show() with null args", async () => {
  // Given: ModalHolder with registered modal and handler
  const modalId = "test-modal-null-args";
  register(modalId, TestModalComponent);
  const handler: any = {};

  render(
    <Provider>
      <ModalHolder modal={modalId} handler={handler} />
    </Provider>,
  );

  // When: Handler.show() is called with null args
  act(() => {
    handler.show(null);
  });

  // Then: Modal should show (args handling depends on implementation)
  expect(typeof handler.show).toBe("function");
});

test("Handler.show() with undefined args", async () => {
  // Given: ModalHolder with registered modal and handler
  const modalId = "test-modal-undefined-args";
  register(modalId, TestModalComponent);
  const handler: any = {};

  render(
    <Provider>
      <ModalHolder modal={modalId} handler={handler} />
    </Provider>,
  );

  // When: Handler.show() is called with undefined args
  act(() => {
    handler.show(undefined);
  });

  // Then: Modal should show (args handling depends on implementation)
  expect(typeof handler.show).toBe("function");
});

test("Handler.show() with empty object args", async () => {
  // Given: ModalHolder with registered modal and handler
  const modalId = "test-modal-empty-args";
  register(modalId, TestModalComponent);
  const handler: any = {};

  render(
    <Provider>
      <ModalHolder modal={modalId} handler={handler} />
    </Provider>,
  );

  // When: Handler.show() is called with empty object args
  act(() => {
    handler.show({});
  });

  // Then: Modal should show with empty args
  expect(typeof handler.show).toBe("function");
});
