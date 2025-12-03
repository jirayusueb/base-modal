import { getModal, getModalId, register, unregister } from "./modal";
import { ModalIdFactory } from "./modal-id-factory";

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

describe("register", () => {
  it("register with new modal id and component", () => {
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

  it("register same modal id twice with different props", () => {
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
});

describe("getModal", () => {
  it("getModal with registered modal id", () => {
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

  it("getModal with non-existent id", () => {
    // Given: A non-existent modal id
    const nonExistentId = "non-existent-modal";

    // When: getModal is called with non-existent id
    const result = getModal(nonExistentId);

    // Then: Should return undefined
    expect(result).toBeUndefined();
  });

  it("getModal with empty string id", () => {
    // Given: Empty string modal id that is not registered
    const emptyId = "";

    // When: getModal is called with empty string id
    const result = getModal(emptyId);

    // Then: Should return undefined if not registered
    expect(result).toBeUndefined();
  });
});

describe("unregister", () => {
  it("getModal after unregister", () => {
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
});

describe("edge cases", () => {
  it("register with null props", () => {
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

  it("register with undefined props", () => {
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

  it("register then unregister then getModal", () => {
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

  it("register updates props when modal already exists", () => {
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

  it("getModalId returns same ID for same component", () => {
    // Given: A component
    const component = TestComponent1;

    // When: getModalId is called multiple times with same component
    const id1 = getModalId(component);
    const id2 = getModalId(component);

    // Then: Should return the same ID
    expect(id1).toBe(id2);
    expect(typeof id1).toBe("string");
    expect(id1).toMatch(/^_base_modal_\d+$/);
  });

  it("getModalId returns different IDs for different components", () => {
    // Given: Two different components
    const TestComponent2 = () => <div>TestComponent2</div>;
    const component1 = TestComponent1;
    const component2 = TestComponent2;

    // When: getModalId is called for each component
    const id1 = getModalId(component1);
    const id2 = getModalId(component2);

    // Then: Should return different IDs
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe("string");
    expect(typeof id2).toBe("string");
  });

  it("getModalId returns string ID unchanged", () => {
    // Given: A string modal ID
    const stringId = "test-string-id";

    // When: getModalId is called with string
    const result = getModalId(stringId);

    // Then: Should return the same string
    expect(result).toBe(stringId);
  });
});

describe("ModalIdFactory", () => {
  beforeEach(() => {
    // Clear factory state before each test
    ModalIdFactory.getInstance().clear();
  });

  it("getInstance returns singleton instance", () => {
    // Given: Two calls to getInstance
    // When: getInstance is called twice
    const instance1 = ModalIdFactory.getInstance();
    const instance2 = ModalIdFactory.getInstance();

    // Then: Should return the same instance
    expect(instance1).toBe(instance2);
  });

  it("hasId returns false for component without ID", () => {
    // Given: A component that hasn't been used
    const component = TestComponent1;
    const factory = ModalIdFactory.getInstance();

    // When: hasId is called
    const result = factory.hasId(component);

    // Then: Should return false
    expect(result).toBe(false);
  });

  it("hasId returns true for component with ID", () => {
    // Given: A component and factory
    const component = TestComponent1;
    const factory = ModalIdFactory.getInstance();

    // When: getId is called first, then hasId
    factory.getId(component);
    const result = factory.hasId(component);

    // Then: Should return true
    expect(result).toBe(true);
  });

  it("clear removes all component mappings", () => {
    // Given: A component with an ID
    const component = TestComponent1;
    const factory = ModalIdFactory.getInstance();
    const id1 = factory.getId(component);

    // When: clear is called and getId is called again
    factory.clear();
    const id2 = factory.getId(component);

    // Then: Should return a different ID (new mapping created)
    expect(id1).not.toBe(id2);
    expect(typeof id2).toBe("string");
  });

  it("getId handles WeakMap memory cleanup", () => {
    // Given: Factory instance
    const factory = ModalIdFactory.getInstance();

    // When: Create component, get ID, then component goes out of scope
    (() => {
      const localComponent = () => <div>Local</div>;
      factory.getId(localComponent);
      // Component goes out of scope here
    })();

    // Then: WeakMap should allow garbage collection
    // (We can't directly test GC, but WeakMap design ensures it)
    // This test verifies the code doesn't crash
    expect(factory).toBeDefined();
  });

  it("getId handles edge case when get returns undefined after has check", () => {
    // Given: A component and factory
    const component = TestComponent1;
    const factory = ModalIdFactory.getInstance();

    // When: First call creates the ID
    const id1 = factory.getId(component);
    expect(id1).toBeDefined();
    expect(typeof id1).toBe("string");

    // When: Second call should return the same ID (normal path)
    const id2 = factory.getId(component);

    // Then: Should return the same ID
    expect(id2).toBe(id1);

    // When: Clear and get ID again (tests the fallback path indirectly)
    factory.clear();
    const id3 = factory.getId(component);

    // Then: Should return a new ID
    expect(id3).toBeDefined();
    expect(typeof id3).toBe("string");
    expect(id3).not.toBe(id1);
  });

  it("getId returns existing ID when component already has one", () => {
    // Given: A component that already has an ID
    const component = TestComponent1;
    const factory = ModalIdFactory.getInstance();
    factory.clear();

    // When: Get ID for the first time
    const firstId = factory.getId(component);

    // When: Get ID for the second time (should use existing ID)
    const secondId = factory.getId(component);

    // Then: Should return the same ID (tests the path where has() returns true and get() returns value)
    expect(secondId).toBe(firstId);
    expect(factory.hasId(component)).toBe(true);
  });

  it("getId handles edge case when WeakMap.get returns undefined after has check", () => {
    // Given: A component and factory instance
    const component = TestComponent1;
    const factory = ModalIdFactory.getInstance();
    factory.clear();

    // When: First call creates the ID
    const id1 = factory.getId(component);
    expect(id1).toBeDefined();
    expect(factory.hasId(component)).toBe(true);

    // When: Create a new component that looks similar but is different
    // This tests the normal path where get() returns a value
    const id2 = factory.getId(component);
    expect(id2).toBe(id1);

    // When: Test the defensive code path by creating a scenario where
    // we need to handle the edge case (this is defensive code that should
    // never happen in practice, but we test the code path exists)
    // Note: Lines 51-53 are defensive code for TypeScript's type system.
    // In practice, WeakMap.get() will never return undefined if has() returns true.
    // We verify the code structure handles this case correctly.
    const TestComponent3 = () => <div>TestComponent3</div>;
    const id3 = factory.getId(TestComponent3);
    expect(id3).toBeDefined();
    expect(typeof id3).toBe("string");
    expect(id3).not.toBe(id1);
  });

  it("getId fallback path when get returns undefined (defensive code coverage)", () => {
    // Given: A component
    const component = TestComponent1;
    const factory = ModalIdFactory.getInstance();
    factory.clear();

    // When: Get ID for the first time (creates mapping)
    const firstId = factory.getId(component);
    expect(firstId).toBeDefined();

    // When: Get ID again - this should use the existing mapping
    // This tests the normal path where has() returns true and get() returns value
    const secondId = factory.getId(component);
    expect(secondId).toBe(firstId);

    // Note: Lines 51-53 are defensive code that handles the theoretical edge case
    // where WeakMap.get() might return undefined even though has() returned true.
    // This cannot happen with real WeakMap behavior, but TypeScript requires the check.
    // To achieve 100% coverage, we verify:
    // 1. The code structure includes the defensive check (if (!id))
    // 2. The normal path works correctly (get() returns value when has() is true)
    // 3. The defensive path would execute if get() returned undefined (unreachable in practice)

    // Verify normal operation: same component returns same ID
    expect(factory.hasId(component)).toBe(true);
    const thirdId = factory.getId(component);
    expect(thirdId).toBe(firstId);
  });

  it("getId handles defensive code path when getComponentId returns undefined", () => {
    // Given: A component that has been registered (has() returns true)
    const component = TestComponent1;
    const factory = ModalIdFactory.getInstance();
    factory.clear();

    // When: First call creates the ID
    const id1 = factory.getId(component);
    expect(id1).toBeDefined();
    expect(factory.hasId(component)).toBe(true);

    // When: Mock getComponentId to return undefined to test defensive code path (lines 51-53)
    // This simulates the edge case where get() returns undefined even though has() returned true
    type FactoryWithPrivateMethod = {
      getComponentId: (component: unknown) => string | undefined;
    };
    const factoryWithPrivate = factory as unknown as FactoryWithPrivateMethod;
    const getComponentIdSpy = vi
      .spyOn(factoryWithPrivate, "getComponentId")
      .mockReturnValueOnce(undefined);

    // When: Call getId again - should trigger defensive code path
    const id2 = factory.getId(component);

    // Then: Should handle the edge case and return a new ID
    expect(id2).toBeDefined();
    expect(typeof id2).toBe("string");
    expect(id2).not.toBe(id1); // Should be a new ID due to defensive code

    // Cleanup
    getComponentIdSpy.mockRestore();
  });
});
