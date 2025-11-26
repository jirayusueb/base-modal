import { act, render } from "@testing-library/react";
import React, { useRef } from "react";
import { Provider, create, show, hide } from "../index";

/**
 * Benchmark: Context Subscription Performance
 *
 * Measures the performance improvement from selective context subscriptions.
 * Tests how many components re-render when a single modal changes.
 */

interface TestModalProps {
  id: string;
  name: string;
}

const TestModal = create(({ name }: TestModalProps) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return <div data-testid={`modal-${name}`}>{name}</div>;
});

function AppWithManyModals({ modalCount = 100 }: { modalCount?: number }) {
  const modals = Array.from({ length: modalCount }, (_, i) => {
    const modalId = `modal-${i}`;
    return (
      <TestModal key={modalId} id={modalId} name={`Modal ${i}`} />
    );
  });

  return <Provider>{modals}</Provider>;
}

test("benchmark: context subscription - re-render count with selective subscriptions", () => {
  // Given: App with 100 modals
  const modalCount = 100;
  const renderCounts = new Map<string, number>();

  const TestModalWithTracking = create(({ name, id }: TestModalProps) => {
    const renderCount = useRef(0);
    renderCount.current += 1;
    renderCounts.set(id, renderCount.current);

    return <div data-testid={`modal-${name}`}>{name}</div>;
  });

  function App() {
    const modals = Array.from({ length: modalCount }, (_, i) => {
      const modalId = `modal-${i}`;
      return (
        <TestModalWithTracking
          key={modalId}
          id={modalId}
          name={`Modal ${i}`}
        />
      );
    });

    return <Provider>{modals}</Provider>;
  }

  // When: Render the app
  const startTime = performance.now();
  const { unmount } = render(<App />);
  const initialRenderTime = performance.now() - startTime;

  // When: Show only the first modal
  const showStartTime = performance.now();
  act(() => {
    show("modal-0", { name: "Modal 0" });
  });
  const showTime = performance.now() - showStartTime;

  // Then: Measure re-renders
  // With selective subscriptions, only modal-0 should re-render
  const reRenders = Array.from(renderCounts.values()).filter((count) => count > 1)
    .length;

  console.log("=== Context Subscription Benchmark ===");
  console.log(`Total modals: ${modalCount}`);
  console.log(`Initial render time: ${initialRenderTime.toFixed(2)}ms`);
  console.log(`Show operation time: ${showTime.toFixed(2)}ms`);
  console.log(`Components that re-rendered: ${reRenders}`);
  console.log(
    `Re-render efficiency: ${((modalCount - reRenders) / modalCount * 100).toFixed(1)}% components did NOT re-render`,
  );

  unmount();

  // Assert: With selective subscriptions, only 1-2 components should re-render
  // (the target modal + BaseModalPlaceholder)
  expect(reRenders).toBeLessThanOrEqual(5);
});

test("benchmark: context subscription - performance with many modals", () => {
  // Given: App with varying numbers of modals
  const modalCounts = [10, 50, 100, 200];

  for (const count of modalCounts) {
    const startTime = performance.now();

    // When: Render app with N modals
    const { unmount } = render(<AppWithManyModals modalCount={count} />);

    const renderTime = performance.now() - startTime;

    // When: Show a single modal
    const showStartTime = performance.now();
    act(() => {
      show("modal-0", { name: "Modal 0" });
    });
    const showTime = performance.now() - showStartTime;

    // When: Hide the modal
    const hideStartTime = performance.now();
    act(() => {
      hide("modal-0");
    });
    const hideTime = performance.now() - hideStartTime;

    console.log(`\n=== ${count} Modals ===`);
    console.log(`Render time: ${renderTime.toFixed(2)}ms`);
    console.log(`Show time: ${showTime.toFixed(2)}ms`);
    console.log(`Hide time: ${hideTime.toFixed(2)}ms`);
    console.log(`Total time: ${(renderTime + showTime + hideTime).toFixed(2)}ms`);

    unmount();

    // Assert: Operations should complete in reasonable time
    expect(renderTime).toBeLessThan(1000); // Should render in < 1s
    expect(showTime).toBeLessThan(100); // Should show in < 100ms
    expect(hideTime).toBeLessThan(100); // Should hide in < 100ms
  }
});

