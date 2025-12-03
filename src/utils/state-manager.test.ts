import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModalRegistry } from "./registry";
import { ModalStateObserver } from "./state-manager";

describe("ModalStateObserver", () => {
  beforeEach(() => {
    ModalRegistry.getInstance().reset();
  });

  it("should notify observer on state update", () => {
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

    const updateFn = vi.fn();
    const observer = new ModalStateObserver(modalId, updateFn);

    registry.subscribe(modalId, observer);

    registry.updateState(modalId, { visible: true });

    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ visible: true }),
    );
  });

  it("should not notify after unsubscribe", () => {
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

    const updateFn = vi.fn();
    const observer = new ModalStateObserver(modalId, updateFn);

    const unsubscribe = registry.subscribe(modalId, observer);
    unsubscribe();

    registry.updateState(modalId, { visible: true });

    expect(updateFn).not.toHaveBeenCalled();
  });
});
