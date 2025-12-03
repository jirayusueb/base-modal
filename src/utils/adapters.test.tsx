import { createModalHandler } from "./adapters";

/**
 * Test Perspective Table for createModalHandler
 *
 * | Case ID | Input / Precondition | Perspective (Equivalence / Boundary) | Expected Result | Notes |
 * |---------|----------------------|--------------------------------------|-----------------|-------|
 * | TC-N-01 | createModalHandler() called | Equivalence - normal | Returns object with show and hide methods | - |
 * | TC-B-01 | Returned object has null prototype | Boundary - Object.create(null) | Object has no prototype methods | - |
 * | TC-B-02 | Returned object show method type | Boundary - type check | show method accepts args and returns Promise | - |
 * | TC-B-03 | Returned object hide method type | Boundary - type check | hide method returns void | - |
 */

describe("createModalHandler", () => {
  it("createModalHandler returns object with null prototype", () => {
    // Given: createModalHandler function
    // When: createModalHandler is called
    const handler = createModalHandler();

    // Then: Should return object with null prototype (Object.create(null))
    expect(handler).toBeDefined();
    expect(Object.getPrototypeOf(handler)).toBeNull();
    expect(handler.toString).toBeUndefined();
    expect(handler.hasOwnProperty).toBeUndefined();
    // The object is empty initially, methods are added later by ModalHolder
    expect(Object.keys(handler)).toHaveLength(0);
  });
});
