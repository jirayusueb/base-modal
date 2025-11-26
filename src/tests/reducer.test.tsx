import { reducer } from "../index";

/**
 * Test Perspective Table for Reducer
 *
 * | Case ID | Input / Precondition | Perspective (Equivalence / Boundary) | Expected Result | Notes |
 * |---------|----------------------|--------------------------------------|-----------------|-------|
 * | TC-N-01 | Valid show action with modalId and args | Equivalence - normal | State updated with modal info | - |
 * | TC-N-02 | Valid hide action with existing modalId | Equivalence - normal | Modal visible set to false | - |
 * | TC-N-03 | Valid remove action with existing modalId | Equivalence - normal | Modal removed from state | - |
 * | TC-N-04 | Valid set-flags action with modalId and flags | Equivalence - normal | Flags merged into modal state | - |
 * | TC-A-01 | Invalid action type | Boundary - invalid input | State unchanged (returns same reference) | - |
 * | TC-A-02 | undefined state (initial) | Boundary - NULL/undefined | Returns empty object {} | - |
 * | TC-A-03 | Hide action with non-existent modalId | Boundary - invalid key | State unchanged | - |
 * | TC-A-04 | Remove action with non-existent modalId | Boundary - invalid key | State unchanged | - |
 * | TC-A-05 | Empty string modalId | Boundary - empty string | Handled (may create empty key) | - |
 * | TC-B-01 | Show action with null args | Boundary - NULL | State updated with null args | - |
 * | TC-B-02 | Show action with empty args object | Boundary - empty object | State updated with empty args | - |
 */

test("dispatch invalid action does nothing", () => {
  // Given: A state object with some data and an invalid action type
  const s1 = { p1: "something" } as any;
  const invalidAction = { type: "some-action" } as any;

  // When: Reducer is called with invalid action
  const s2 = reducer(s1, invalidAction);

  // Then: State should remain unchanged (same reference)
  expect(s1).toBe(s2);
});

test("there is empty initial state", () => {
  // Given: No initial state (undefined)
  const initialState = undefined;
  const invalidAction = { type: "some-action" } as any;

  // When: Reducer is called with undefined state
  const s = reducer(initialState, invalidAction);

  // Then: Should return empty object as initial state
  expect(s).toEqual({});
});

test("show action updates state correctly", () => {
  // Given: Empty initial state and valid show action
  const initialState = {};
  const showAction = {
    type: "base-modal/show",
    payload: {
      modalId: "test-modal",
      args: { name: "test" },
    },
  };

  // When: Reducer processes show action
  const result = reducer(initialState, showAction);

  // Then: State should contain modal with correct structure
  expect(result).toHaveProperty("test-modal");
  expect(result["test-modal"]).toMatchObject({
    id: "test-modal",
    args: { name: "test" },
  });
});

test("hide action sets visible to false", () => {
  // Given: State with visible modal
  const initialState = {
    "test-modal": {
      id: "test-modal",
      visible: true,
      args: {},
    },
  };
  const hideAction = {
    type: "base-modal/hide",
    payload: { modalId: "test-modal" },
  };

  // When: Reducer processes hide action
  const result = reducer(initialState, hideAction);

  // Then: Modal visible should be false
  expect(result["test-modal"].visible).toBe(false);
});

test("hide action with non-existent modalId does nothing", () => {
  // Given: State without the target modal
  const initialState = {
    "other-modal": { id: "other-modal", visible: true },
  };
  const hideAction = {
    type: "base-modal/hide",
    payload: { modalId: "non-existent" },
  };

  // When: Reducer processes hide action for non-existent modal
  const result = reducer(initialState, hideAction);

  // Then: State should remain unchanged (same reference)
  expect(result).toBe(initialState);
});

test("remove action removes modal from state", () => {
  // Given: State with a modal
  const initialState = {
    "test-modal": { id: "test-modal", visible: true },
    "other-modal": { id: "other-modal", visible: true },
  };
  const removeAction = {
    type: "base-modal/remove",
    payload: { modalId: "test-modal" },
  };

  // When: Reducer processes remove action
  const result = reducer(initialState, removeAction);

  // Then: Target modal should be removed, other modals remain
  expect(result).not.toHaveProperty("test-modal");
  expect(result).toHaveProperty("other-modal");
});

test("set-flags action merges flags into modal state", () => {
  // Given: State with a modal
  const initialState = {
    "test-modal": { id: "test-modal", visible: true },
  };
  const setFlagsAction = {
    type: "base-modal/set-flags",
    payload: {
      modalId: "test-modal",
      flags: { keepMounted: true },
    },
  };

  // When: Reducer processes set-flags action
  const result = reducer(initialState, setFlagsAction);

  // Then: Flags should be merged into modal state
  expect(result["test-modal"]).toMatchObject({
    id: "test-modal",
    visible: true,
    keepMounted: true,
  });
});

test("show action with null args handles correctly", () => {
  // Given: Empty state and show action with null args
  const initialState = {};
  const showAction = {
    type: "base-modal/show",
    payload: {
      modalId: "test-modal",
      args: null as any,
    },
  };

  // When: Reducer processes show action with null args
  const result = reducer(initialState, showAction);

  // Then: State should be updated with null args
  expect(result["test-modal"].args).toBeNull();
});

test("show action with empty string modalId", () => {
  // Given: Empty state and show action with empty string modalId
  const initialState = {};
  const showAction = {
    type: "base-modal/show",
    payload: {
      modalId: "",
      args: {},
    },
  };

  // When: Reducer processes show action with empty string modalId
  const result = reducer(initialState, showAction);

  // Then: State should contain entry with empty string key
  expect(result).toHaveProperty("");
  expect(result[""].id).toBe("");
});
