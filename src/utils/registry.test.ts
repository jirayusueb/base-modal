import { beforeEach, describe, expect, it } from "vitest";
import { ModalRegistry } from "./registry";

describe("ModalRegistry", () => {
  beforeEach(() => {
    ModalRegistry.getInstance().reset();
  });

  it("should be a singleton", () => {
    const instance1 = ModalRegistry.getInstance();
    const instance2 = ModalRegistry.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should register and retrieve modal state", () => {
    const registry = ModalRegistry.getInstance();
    const modalId = "test-modal";
    const state = {
      id: modalId,
      visible: false,
      keepMounted: false,
      props: {},
      promise: null,
      resolvedValue: undefined,
    };

    registry.register(modalId, state);
    expect(registry.getState(modalId)).toEqual(state);
  });

  it("should unregister modal", () => {
    const registry = ModalRegistry.getInstance();
    const modalId = "test-modal";
    const state = {
      id: modalId,
      visible: false,
      keepMounted: false,
      props: {},
      promise: null,
      resolvedValue: undefined,
    };

    registry.register(modalId, state);
    registry.unregister(modalId);
    expect(registry.getState(modalId)).toBeUndefined();
  });
});
