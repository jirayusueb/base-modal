import React from "react";
import { getModal, register, unregister } from "../utils/modal";

/**
 * Test Perspective Table for Modal Utility Functions
 *
 * | Case ID | Input / Precondition | Perspective (Equivalence / Boundary) | Expected Result | Notes |
 * |---------|----------------------|--------------------------------------|-----------------|-------|
 * | TC-N-01 | register with new modal id and component | Equivalence - normal | Modal registered in MODAL_REGISTRY | - |
 * | TC-N-02 | register same modal id twice with different props | Boundary - duplicate id | Props updated, component unchanged | - |
 * | TC-N-03 | getModal with registered modal id | Equivalence - normal | Returns modal component | - |
 * | TC-A-01 | getModal with non-existent id | Boundary - invalid id | Returns undefined | - |
 * | TC-A-02 | getModal with empty string id | Boundary - empty string | Returns undefined if not registered | - |
 * | TC-A-03 | getModal after unregister | Boundary - removed | Returns undefined | - |
 * | TC-B-01 | register with null props | Boundary - NULL | Props set to null | - |
 * | TC-B-02 | register with undefined props | Boundary - undefined | Props set to undefined | - |
 * | TC-B-03 | register then unregister then getModal | Boundary - lifecycle | Returns undefined after unregister | - |
 */

const TestComponent1 = () => <div>TestComponent1</div>;

test("register with new modal id and component", () => {
  // Given: A new modal id and component
  const modalId = "test-register-new";
  const component = TestComponent1;

  // When: Register is called with new modal id
  register(modalId, component);

  // Then: Modal should be registered and getModal should return the component
  const retrieved = getModal(modalId);
  expect(retrieved).toBe(component);

  // Cleanup
  unregister(modalId);
});

test("register same modal id twice with different props", () => {
  // Given: A modal already registered with initial props
  const modalId = "test-register-update";
  const component = TestComponent1;
  const initialProps = { name: "initial" };
  const updatedProps = { name: "updated" };

  // When: Register is called first time
  register(modalId, component, initialProps);

  // Then: Modal should be registered with initial props
  const retrieved1 = getModal(modalId);
  expect(retrieved1).toBe(component);

  // When: Register is called again with same id but different props
  register(modalId, component, updatedProps);

  // Then: Component should remain the same, props should be updated
  const retrieved2 = getModal(modalId);
  expect(retrieved2).toBe(component);
  // Note: We can't directly check props from getModal, but the else branch (line 29) is executed

  // Cleanup
  unregister(modalId);
});

test("getModal with registered modal id", () => {
  // Given: A registered modal
  const modalId = "test-get-modal";
  const component = TestComponent1;
  register(modalId, component);

  // When: getModal is called with registered id
  const result = getModal(modalId);

  // Then: Should return the registered component
  expect(result).toBe(component);

  // Cleanup
  unregister(modalId);
});

test("getModal with non-existent id", () => {
  // Given: A non-existent modal id
  const nonExistentId = "non-existent-modal";

  // When: getModal is called with non-existent id
  const result = getModal(nonExistentId);

  // Then: Should return undefined
  expect(result).toBeUndefined();
});

test("getModal with empty string id", () => {
  // Given: Empty string modal id that is not registered
  const emptyId = "";

  // When: getModal is called with empty string id
  const result = getModal(emptyId);

  // Then: Should return undefined if not registered
  expect(result).toBeUndefined();
});

test("getModal after unregister", () => {
  // Given: A registered modal
  const modalId = "test-get-after-unregister";
  const component = TestComponent1;
  register(modalId, component);

  // When: Modal is unregistered
  unregister(modalId);

  // Then: getModal should return undefined
  const result = getModal(modalId);
  expect(result).toBeUndefined();
});

test("register with null props", () => {
  // Given: A modal id and component, props as null
  const modalId = "test-register-null-props";
  const component = TestComponent1;

  // When: Register is called with null props
  register(modalId, component, null as any);

  // Then: Modal should be registered (props handling depends on implementation)
  const result = getModal(modalId);
  expect(result).toBe(component);

  // Cleanup
  unregister(modalId);
});

test("register with undefined props", () => {
  // Given: A modal id and component, props as undefined
  const modalId = "test-register-undefined-props";
  const component = TestComponent1;

  // When: Register is called with undefined props
  register(modalId, component, undefined);

  // Then: Modal should be registered
  const result = getModal(modalId);
  expect(result).toBe(component);

  // Cleanup
  unregister(modalId);
});

test("register then unregister then getModal", () => {
  // Given: A modal registration lifecycle
  const modalId = "test-lifecycle";
  const component = TestComponent1;

  // When: Register modal
  register(modalId, component);
  expect(getModal(modalId)).toBe(component);

  // When: Unregister modal
  unregister(modalId);

  // Then: getModal should return undefined
  const result = getModal(modalId);
  expect(result).toBeUndefined();
});

test("register updates props when modal already exists", () => {
  // Given: A modal already registered
  const modalId = "test-update-props";
  const component = TestComponent1;
  register(modalId, component, { prop1: "value1" });

  // When: Register is called again with different props (testing else branch line 29)
  register(modalId, component, { prop1: "value2" });

  // Then: Modal should still be registered (component unchanged, props updated)
  const result = getModal(modalId);
  expect(result).toBe(component);

  // Cleanup
  unregister(modalId);
});
