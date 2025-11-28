import { render } from "@testing-library/react";
import { Bench } from "tinybench";
import BaseModal from "@/index";
import { Provider } from "@/providers";
import { BENCHMARK_CONFIG } from "./config";
import { createTestModal, createTestModals } from "./utils";

const suite = new Bench({ time: BENCHMARK_CONFIG.time });

/**
 * Core Operations Benchmarks
 * Measures timing and throughput for show, hide, register, remove operations
 */

// Setup: Create test modals
const TestModal = createTestModal("operations");
const TestModals = createTestModals(10);

suite
  .add("BaseModal.show() - single modal", async () => {
    const { unmount } = render(
      <Provider>
        <TestModal id="single-modal" />
      </Provider>,
    );
    try {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
    } finally {
      unmount();
    }
  })
  .add("BaseModal.show() - sequential modals (10)", async () => {
    const { unmount } = render(
      <Provider>
        {TestModals.map((Modal, i) => (
          <Modal key={i} id={`seq-modal-${i}`} />
        ))}
      </Provider>,
    );
    try {
      for (const modal of TestModals) {
        await BaseModal.show(modal, { title: "Test" });
        await BaseModal.hide(modal);
      }
    } finally {
      unmount();
    }
  })
  .add("BaseModal.show() - concurrent modals (10)", async () => {
    const { unmount } = render(
      <Provider>
        {TestModals.map((Modal, i) => (
          <Modal key={i} id={`conc-modal-${i}`} />
        ))}
      </Provider>,
    );
    try {
      const promises = TestModals.map((modal) =>
        BaseModal.show(modal, { title: "Test" }),
      );
      await Promise.all(promises);
      const hidePromises = TestModals.map((modal) => BaseModal.hide(modal));
      await Promise.all(hidePromises);
    } finally {
      unmount();
    }
  })
  .add("BaseModal.hide() - single modal", async () => {
    const { unmount } = render(
      <Provider>
        <TestModal id="hide-modal" />
      </Provider>,
    );
    try {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
    } finally {
      unmount();
    }
  })
  .add("BaseModal.remove() - cleanup", async () => {
    const { unmount } = render(
      <Provider>
        <TestModal id="remove-modal" />
      </Provider>,
    );
    try {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
      BaseModal.remove(TestModal);
    } finally {
      unmount();
    }
  })
  .add("BaseModal.register() - registration overhead", () => {
    BaseModal.register("benchmark-modal", TestModal);
    BaseModal.unregister("benchmark-modal");
  })
  .add("Full lifecycle: register → show → hide → remove", async () => {
    const { unmount } = render(
      <Provider>
        <TestModal id="lifecycle-modal" />
      </Provider>,
    );
    try {
      BaseModal.register("lifecycle-modal", TestModal);
      await BaseModal.show("lifecycle-modal", { title: "Test" });
      await BaseModal.hide("lifecycle-modal");
      BaseModal.remove("lifecycle-modal");
      BaseModal.unregister("lifecycle-modal");
    } finally {
      unmount();
    }
  });

export default suite;
