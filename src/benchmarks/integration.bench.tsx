import { act, render } from "@testing-library/react";
import { Bench } from "tinybench";
import BaseModal from "@/index";
import { Provider } from "@/providers";
import { BENCHMARK_CONFIG } from "./config";
import { createTestModal, createTestModals } from "./utils";

const suite = new Bench({ time: BENCHMARK_CONFIG.time });

/**
 * Integration Benchmarks
 * End-to-end scenarios testing complete workflows
 */

const TestModal = createTestModal("integration");

suite
  .add("Complete modal workflow - show → interact → hide", async () => {
    const { unmount } = render(
      <Provider>
        <TestModal id="workflow-test" />
      </Provider>,
    );
    await act(async () => {
      const promise = BaseModal.show(TestModal, { title: "Test" });
      // Simulate interaction
      await new Promise((resolve) => setTimeout(resolve, 10));
      await BaseModal.hide(TestModal);
      await promise;
    });
    unmount();
  })
  .add("Multiple modals workflow - sequential", async () => {
    const modals = createTestModals(5);
    const { unmount } = render(
      <Provider>
        {modals.map((Modal, i) => (
          <Modal key={i} id={`workflow-seq-${i}`} />
        ))}
      </Provider>,
    );
    await act(async () => {
      for (const modal of modals) {
        await BaseModal.show(modal, { title: "Test" });
        await BaseModal.hide(modal);
      }
    });
    unmount();
  })
  .add("Multiple modals workflow - concurrent", async () => {
    const modals = createTestModals(5);
    const { unmount } = render(
      <Provider>
        {modals.map((Modal, i) => (
          <Modal key={i} id={`workflow-conc-${i}`} />
        ))}
      </Provider>,
    );
    await act(async () => {
      const showPromises = modals.map((modal) =>
        BaseModal.show(modal, { title: "Test" }),
      );
      await Promise.all(showPromises);
      const hidePromises = modals.map((modal) => BaseModal.hide(modal));
      await Promise.all(hidePromises);
    });
    unmount();
  })
  .add("Provider with custom dispatch", async () => {
    const customDispatch = (action: unknown) => {
      // Simulate custom dispatch
      return action;
    };
    const customModals = {};
    const { unmount } = render(
      <Provider dispatch={customDispatch} modals={customModals}>
        <TestModal id="custom-dispatch-test" />
      </Provider>,
    );
    await act(async () => {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
    });
    unmount();
  })
  .add("Modal with keepMounted flag", async () => {
    const { unmount } = render(
      <Provider>
        <TestModal id="keep-mounted-test" keepMounted />
      </Provider>,
    );
    await act(async () => {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
      // Modal should still be mounted
      await BaseModal.show(TestModal, { title: "Test Again" });
      await BaseModal.hide(TestModal);
    });
    unmount();
  })
  .add("Modal registration and usage", async () => {
    const { unmount } = render(
      <Provider>
        <TestModal id="registration-test" />
      </Provider>,
    );
    await act(async () => {
      BaseModal.register("registered-modal", TestModal);
      await BaseModal.show("registered-modal", { title: "Test" });
      await BaseModal.hide("registered-modal");
      BaseModal.unregister("registered-modal");
    });
    unmount();
  });

export default suite;
