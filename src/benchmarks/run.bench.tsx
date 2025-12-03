import { bench, describe } from "vitest";
import { ModalRegistry } from "../utils/registry";

describe("ModalRegistry Performance", () => {
  const registry = ModalRegistry.getInstance();

  bench("register", () => {
    registry.register("bench-modal", {
      id: "bench-modal",
      visible: false,
      keepMounted: false,
      props: {},
      promise: null,
      resolvedValue: undefined,
    });
  });

  bench("updateState", () => {
    registry.updateState("bench-modal", { visible: true });
  });

  bench("unregister", () => {
    registry.unregister("bench-modal");
  });
});
