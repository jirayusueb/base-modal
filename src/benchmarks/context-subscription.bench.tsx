import { act, render } from "@testing-library/react";
import { useContext } from "react";
import { Bench } from "tinybench";
import BaseModal, { BaseModalContext, Provider } from "@/index";
import { BENCHMARK_CONFIG } from "./config";
import { createTestModal } from "./utils";

const suite = new Bench({ time: BENCHMARK_CONFIG.time });

/**
 * Context Subscription Benchmarks
 * Measures context performance and selective subscription effectiveness
 */

const TestModal = createTestModal("context");

// Component that subscribes to all modals
const AllModalsSubscriber = () => {
  const modals = useContext(BaseModalContext);
  return <div>{Object.keys(modals).length} modals</div>;
};

// Component that subscribes to specific modal
const SpecificModalSubscriber = ({ modalId }: { modalId: string }) => {
  const modals = useContext(BaseModalContext);
  const modal = modals[modalId];
  return <div>{modal ? "Found" : "Not found"}</div>;
};

suite
  .add("Context subscription overhead", async () => {
    const { unmount } = render(
      <Provider>
        <AllModalsSubscriber />
        <TestModal id="context-overhead" />
      </Provider>,
    );
    await act(async () => {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
    });
    unmount();
  })
  .add("Selective subscription performance", async () => {
    const { unmount } = render(
      <Provider>
        <SpecificModalSubscriber modalId="selective-test" />
        <TestModal id="selective-test" />
      </Provider>,
    );
    await act(async () => {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
    });
    unmount();
  })
  .add("Multiple subscribers performance (10)", async () => {
    const { unmount } = render(
      <Provider>
        {Array.from({ length: 10 }, (_, i) => (
          <SpecificModalSubscriber key={i} modalId={`multi-sub-${i}`} />
        ))}
        <TestModal id="multi-sub-0" />
      </Provider>,
    );
    await act(async () => {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
    });
    unmount();
  })
  .add("Context value memoization effectiveness", async () => {
    let renderCount = 0;
    const MemoizedSubscriber = () => {
      renderCount++;
      const modals = useContext(BaseModalContext);
      return <div>{Object.keys(modals).length}</div>;
    };
    const { unmount } = render(
      <Provider>
        <MemoizedSubscriber />
        <TestModal id="memo-test" />
      </Provider>,
    );
    await act(async () => {
      await BaseModal.show(TestModal, { title: "Test" });
      await BaseModal.hide(TestModal);
    });
    unmount();
    return renderCount;
  });

export default suite;
