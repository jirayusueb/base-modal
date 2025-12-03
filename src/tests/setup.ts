import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom";

import { ModalRegistry } from "../utils/registry";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  ModalRegistry.getInstance().reset();
});
