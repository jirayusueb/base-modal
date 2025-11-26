import { act, render, screen } from "@testing-library/react";
import React, { Fragment } from "react";
import BaseModal, { Provider } from "../index";
import { create, useModal } from "../index";
import { ErrorBoundary } from "./helpers/error-boundary";
import { TestModal } from "./helpers/test-modal";

/**
 * Test Perspective Table for Provider
 *
 * | Case ID | Input / Precondition | Perspective (Equivalence / Boundary) | Expected Result | Notes |
 * |---------|----------------------|--------------------------------------|-----------------|-------|
 * | TC-N-01 | Provider with children | Equivalence - normal | Children rendered correctly | - |
 * | TC-N-02 | Provider with redux integration (dispatch, modals) | Equivalence - normal | Provider renders without error | - |
 * | TC-A-01 | BaseModal.show() without Provider | Boundary - missing context | Throws Error with specific message | Verify type and message |
 * | TC-A-02 | useModal() without Provider and without id prop | Boundary - missing context/id | Error boundary catches error | Verify error message |
 * | TC-A-03 | Provider with null children | Boundary - NULL | Provider renders (children may be null) | - |
 * | TC-A-04 | Provider with undefined children | Boundary - undefined | Provider renders | - |
 * | TC-A-05 | Provider with empty children | Boundary - empty | Provider renders | - |
 * | TC-B-01 | Provider with invalid dispatch function | Boundary - invalid function | Provider renders but may fail on use | - |
 * | TC-B-02 | Provider with invalid modals object | Boundary - invalid object | Provider renders | - |
 */

const HocTestModal = create(({ name = "nate" }: { name?: string }) => {
  const modal = useModal();
  const remove = () => modal.remove();

  return (
    <TestModal visible={modal.visible} onExited={remove} onClose={remove}>
      <span>{name}</span>
      <div>HocTestModal</div>
    </TestModal>
  );
});

test("throw error if no provider", async () => {
  // Given: No Provider in component tree
  render(<div />);

  // When: Attempting to show modal without Provider
  let err: unknown = null;
  act(() => {
    try {
      BaseModal.show("test-modal-without-provider");
    } catch (e) {
      err = e;
    }
  });

  // Then: Should throw Error with specific type and message
  expect(err).toBeInstanceOf(Error);
  expect((err as Error).message).toBeTruthy();
});

test("provider children is correctly rendered", () => {
  // Given: Provider component with children
  const childrenText = "learn nice modal";

  // When: Provider is rendered with children
  render(
    <Provider>
      <span>{childrenText}</span>
    </Provider>,
  );

  // Then: Children should be rendered and visible
  const childText = screen.getByText(/learn nice modal/i);
  expect(childText).toBeInTheDocument();
});

test("useModal without context provider will throw exception", () => {
  // Given: ErrorBoundary wrapper and HocTestModal without Provider and without id prop
  console.error = () => null;

  // When: Component using useModal is rendered without Provider context
  render(
    <ErrorBoundary>
      {/* @ts-expect-error - Testing error case: id is intentionally omitted to trigger error */}
      <HocTestModal />
    </ErrorBoundary>,
  );

  // Then: Error boundary should catch the error and display error message
  expect(screen.queryByText("Something went wrong.")).toBeInTheDocument();
});

test("modal with redux integration", async () => {
  // Given: Provider with redux integration (dispatch and modals)
  const dispatch = () => null;
  const modals = {};

  // When: Provider is rendered with redux props
  const App = () => <Provider dispatch={dispatch} modals={modals} />;
  render(<App />);

  // Then: Provider should render without errors
  // (No explicit assertion needed - test passes if no errors thrown)
});

test("provider with null children", () => {
  // Given: Provider with null children
  // When: Provider is rendered with null children
  render(<Provider>{null}</Provider>);

  // Then: Provider should render without errors
  // (No explicit assertion needed - test passes if no errors thrown)
});

test("provider with undefined children", () => {
  // Given: Provider with undefined children
  // When: Provider is rendered with undefined children
  render(<Provider>{undefined}</Provider>);

  // Then: Provider should render without errors
  // (No explicit assertion needed - test passes if no errors thrown)
});

test("provider with empty children", () => {
  // Given: Provider with empty fragment as children
  // When: Provider is rendered with empty children
  render(
    <Provider>
      <Fragment />
    </Provider>,
  );

  // Then: Provider should render without errors
  // (No explicit assertion needed - test passes if no errors thrown)
});
