import { Bench } from "tinybench";
import { render } from "@testing-library/react";
import { Provider } from "@/providers";
import BaseModal from "@/index";
import {
  createTestModal,
  createTestModals,
  measureMemory,
  getMemoryDelta,
} from "./utils";
import { BENCHMARK_CONFIG } from "./config";

const suite = new Bench({ time: BENCHMARK_CONFIG.time });

/**
 * Memory Benchmarks
 * Measures memory usage and leak detection
 */

const TestModal = createTestModal("memory");

suite
  .add("Memory usage - 1 modal", async () => {
    const before = measureMemory();
    const { unmount } = render(
      <Provider>
        <TestModal id="memory-1" />
      </Provider>,
    );
    await BaseModal.show(TestModal, { title: "Test" });
    await BaseModal.hide(TestModal);
    const after = measureMemory();
    const delta = getMemoryDelta(before, after);
    unmount();
    return delta;
  })
  .add("Memory usage - 10 modals", async () => {
    const before = measureMemory();
    const modals = createTestModals(10);
    const { unmount } = render(
      <Provider>
        {modals.map((Modal, i) => (
          <Modal key={i} id={`memory-10-${i}`} />
        ))}
      </Provider>,
    );
    for (const modal of modals) {
      await BaseModal.show(modal, { title: "Test" });
      await BaseModal.hide(modal);
    }
    const after = measureMemory();
    const delta = getMemoryDelta(before, after);
    unmount();
    return delta;
  })
  .add("Memory usage - 100 modals", async () => {
    const before = measureMemory();
    const modals = createTestModals(100);
    const { unmount } = render(
      <Provider>
        {modals.map((Modal, i) => (
          <Modal key={i} id={`memory-100-${i}`} />
        ))}
      </Provider>,
    );
    // Only show/hide first 10 to avoid timeout
    for (let i = 0; i < 10; i++) {
      await BaseModal.show(modals[i]!, { title: "Test" });
      await BaseModal.hide(modals[i]!);
    }
    const after = measureMemory();
    const delta = getMemoryDelta(before, after);
    unmount();
    return delta;
  })
  .add("Memory cleanup after remove", async () => {
    const before = measureMemory();
    const { unmount } = render(
      <Provider>
        <TestModal id="cleanup-test" />
      </Provider>,
    );
    await BaseModal.show(TestModal, { title: "Test" });
    await BaseModal.hide(TestModal);
    BaseModal.remove(TestModal);
    const after = measureMemory();
    const delta = getMemoryDelta(before, after);
    unmount();
    return delta;
  })
  .add("Memory leak detection - create/remove cycles (10)", async () => {
    const before = measureMemory();
    const { unmount } = render(
      <Provider>
        <TestModal id="leak-test" />
      </Provider>,
    );
    // Create and remove modal 10 times
    for (let i = 0; i < 10; i++) {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
      BaseModal.remove(TestModal);
    }
    const after = measureMemory();
    const delta = getMemoryDelta(before, after);
    unmount();
    return delta;
  })
  .add("Promise callback cleanup", async () => {
    const before = measureMemory();
    const { unmount } = render(
      <Provider>
        <TestModal id="promise-test" />
      </Provider>,
    );
    // Create multiple promises
    const promises = Array.from({ length: 10 }, () =>
      BaseModal.show(TestModal, { title: "Test" }),
    );
    await Promise.all(promises);
    await BaseModal.hide(TestModal);
    BaseModal.remove(TestModal);
    const after = measureMemory();
    const delta = getMemoryDelta(before, after);
    unmount();
    return delta;
  });

export default suite;

