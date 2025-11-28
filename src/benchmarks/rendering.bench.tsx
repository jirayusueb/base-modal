import { act, render } from "@testing-library/react";
import { Bench } from "tinybench";
import BaseModal from "@/index";
import { Provider } from "@/providers";
import { BENCHMARK_CONFIG } from "./config";
import { createTestModal } from "./utils";

const suite = new Bench({ time: BENCHMARK_CONFIG.time });

/**
 * Rendering Performance Benchmarks
 * Measures React rendering performance: mount time, re-render counts, etc.
 */

const TestModal = createTestModal("rendering");
let renderCount = 0;

// Component to track renders
const RenderTracker = ({ children }: { children: React.ReactNode }) => {
  renderCount++;
  return <>{children}</>;
};

suite
  .add("Component mount time", async () => {
    renderCount = 0;
    const { unmount } = render(
      <Provider>
        <RenderTracker>
          <TestModal id="mount-test" />
        </RenderTracker>
      </Provider>,
    );
    unmount();
  })
  .add("Modal show - render impact", async () => {
    renderCount = 0;
    const { unmount } = render(
      <Provider>
        <RenderTracker>
          <TestModal id="show-test" />
        </RenderTracker>
      </Provider>,
    );
    await act(async () => {
      await BaseModal.show(TestModal, { title: "Test" });
    });
    unmount();
  })
  .add("Modal hide - render impact", async () => {
    renderCount = 0;
    const { unmount } = render(
      <Provider>
        <RenderTracker>
          <TestModal id="hide-test" />
        </RenderTracker>
      </Provider>,
    );
    await act(async () => {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
    });
    unmount();
  })
  .add("Multiple modals rendering (10)", async () => {
    renderCount = 0;
    const modals = Array.from({ length: 10 }, (_, i) =>
      createTestModal(`multi-${i}`),
    );
    const { unmount } = render(
      <Provider>
        <RenderTracker>
          {modals.map((Modal, i) => (
            <Modal key={i} id={`multi-modal-${i}`} />
          ))}
        </RenderTracker>
      </Provider>,
    );
    await act(async () => {
      for (const modal of modals) {
        await BaseModal.show(modal, { title: "Test" });
      }
    });
    unmount();
  })
  .add("Context subscription overhead", async () => {
    renderCount = 0;
    const { unmount } = render(
      <Provider>
        <RenderTracker>
          <TestModal id="context-test" />
        </RenderTracker>
      </Provider>,
    );
    await act(async () => {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
    });
    unmount();
  });

export default suite;
