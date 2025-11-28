
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

describe("reducer edge cases", () => {
  it("dispatch invalid action does nothing", () => {
    // Given: A state object with some data and an invalid action type
    const s1 = { p1: "something" } as any;
    const invalidAction = { type: "some-action" } as any;

    // When: Reducer is called with invalid action
    const s2 = reducer(s1, invalidAction);

    // Then: State should remain unchanged (same reference)
    expect(s1).toBe(s2);
  });

  it("there is empty initial state", () => {
    // Given: No initial state (undefined)
    const initialState = undefined;
    const invalidAction = { type: "some-action" } as any;

    // When: Reducer is called with undefined state
    const s = reducer(initialState, invalidAction);

    // Then: Should return empty object as initial state
    expect(s).toEqual({});
  });
});

describe("show action", () => {
  it("show action updates state correctly", () => {
    // Given: Empty initial state and valid show action
    const initialState = {};
    const showAction = {
      type: "base-modal/show" as const,
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

  it("show action with null args handles correctly", () => {
    // Given: Empty state and show action with null args
    const initialState = {};
    const showAction = {
      type: "base-modal/show" as const,
      payload: {
        modalId: "test-modal",
        args: null as any,
      },
    };

    // When: Reducer processes show action with null args
    const result = reducer(initialState, showAction);

    // Then: State should be updated with null args
    expect(result["test-modal"]?.args).toBeNull();
  });

  it("show action with empty string modalId", () => {
    // Given: Empty state and show action with empty string modalId
    const initialState = {};
    const showAction = {
      type: "base-modal/show" as const,
      payload: {
        modalId: "",
        args: {},
      },
    };

    // When: Reducer processes show action with empty string modalId
    const result = reducer(initialState, showAction);

    // Then: State should contain entry with empty string key
    expect(result).toHaveProperty("");
    expect(result[""]?.id).toBe("");
  });
});

describe("hide action", () => {
  it("hide action sets visible to false", () => {
    // Given: State with visible modal
    const initialState = {
      "test-modal": {
        id: "test-modal",
        visible: true,
        args: {},
      },
    };
    const hideAction = {
      type: "base-modal/hide" as const,
      payload: { modalId: "test-modal" },
    };

    // When: Reducer processes hide action
    const result = reducer(initialState, hideAction);

    // Then: Modal visible should be false
    expect(result["test-modal"]?.visible).toBe(false);
  });

  it("hide action with non-existent modalId does nothing", () => {
    // Given: State without the target modal
    const initialState = {
      "other-modal": { id: "other-modal", visible: true },
    };
    const hideAction = {
      type: "base-modal/hide" as const,
      payload: { modalId: "non-existent" },
    };

    // When: Reducer processes hide action for non-existent modal
    const result = reducer(initialState, hideAction);

    // Then: State should remain unchanged (same reference)
    expect(result).toBe(initialState);
  });
});

describe("remove action", () => {
  it("remove action removes modal from state", () => {
    // Given: State with a modal
    const initialState = {
      "test-modal": { id: "test-modal", visible: true },
      "other-modal": { id: "other-modal", visible: true },
    };
    const removeAction = {
      type: "base-modal/remove" as const,
      payload: { modalId: "test-modal" },
    };

    // When: Reducer processes remove action
    const result = reducer(initialState, removeAction);

    // Then: Target modal should be removed, other modals remain
    expect(result).not.toHaveProperty("test-modal");
    expect(result).toHaveProperty("other-modal");
  });
});

describe("set-flags action", () => {
  it("set-flags action merges flags into modal state", () => {
    // Given: State with a modal
    const initialState = {
      "test-modal": { id: "test-modal", visible: true },
    };
    const setFlagsAction = {
      type: "base-modal/set-flags" as const,
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

  it("set-flags action with non-existent modal and keepMounted true", () => {
    // Given: Empty state and set-flags action for non-existent modal with keepMounted
    const initialState = {};
    const setFlagsAction = {
      type: "base-modal/set-flags" as const,
      payload: {
        modalId: "new-modal",
        flags: { keepMounted: true, customFlag: "value" },
      },
    };

    // When: Reducer processes set-flags action for non-existent modal with keepMounted
    const result = reducer(initialState, setFlagsAction);

    // Then: Modal should be created with visible: false and keepMounted: true
    expect(result).toHaveProperty("new-modal");
    expect(result["new-modal"]).toMatchObject({
      id: "new-modal",
      visible: false,
      keepMounted: true,
      customFlag: "value",
    });
  });

  it("set-flags action with undefined flags when modal exists", () => {
    // Given: State with a modal
    const initialState = {
      "test-modal": {
        id: "test-modal",
        visible: true,
      },
    };
    const setFlagsAction = {
      type: "base-modal/set-flags" as const,
      payload: {
        modalId: "test-modal",
        flags: undefined as unknown as Record<string, unknown>,
      },
    };

    // When: Reducer processes set-flags action with undefined flags
    const result = reducer(initialState, setFlagsAction);

    // Then: Modal should remain unchanged (flags is undefined, so Object.assign is skipped)
    expect(result["test-modal"]).toEqual(initialState["test-modal"]);
  });

  it("set-flags action with null flags when modal exists", () => {
    // Given: State with a modal
    const initialState = {
      "test-modal": {
        id: "test-modal",
        visible: true,
      },
    };
    const setFlagsAction = {
      type: "base-modal/set-flags" as const,
      payload: {
        modalId: "test-modal",
        flags: null as unknown as Record<string, unknown>,
      },
    };

    // When: Reducer processes set-flags action with null flags
    const result = reducer(initialState, setFlagsAction);

    // Then: Modal should remain unchanged (flags is null/falsy, so Object.assign is skipped)
    expect(result["test-modal"]).toEqual(initialState["test-modal"]);
  });

  it("set-flags action without keepMounted when modal does not exist", () => {
    // Given: Empty state and set-flags action for non-existent modal without keepMounted
    const initialState = {};
    const setFlagsAction = {
      type: "base-modal/set-flags" as const,
      payload: {
        modalId: "new-modal",
        flags: { customFlag: "value" }, // keepMounted not set
      },
    };

    // When: Reducer processes set-flags action for non-existent modal without keepMounted
    const result = reducer(initialState, setFlagsAction);

    // Then: Modal should not be created (keepMounted is false/undefined, so else if branch skipped)
    expect(result).not.toHaveProperty("new-modal");
    expect(result).toEqual({});
  });
});

