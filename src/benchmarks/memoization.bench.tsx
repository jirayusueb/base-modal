import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { create, Provider, show } from "../index";

/**
 * Benchmark: Memoization Performance
 *
 * Measures the effectiveness of memo() and useMemo optimizations:
 * - Component re-render prevention with memo()
 * - useMemo effectiveness in BaseModalPlaceholder
 * - Context value memoization
 */

interface TestModalProps {
  name: string;
}

const TestModal = create(({ name }: TestModalProps) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return <div data-testid={`modal-${name}`}>{name}</div>;
});

test("benchmark: memo() prevents unnecessary re-renders", () => {
  // Given: App with multiple modals
  const modalCount = 50;
  const renderCounts = new Map<string, number>();

  const TestModalWithTracking = create(
    ({ name, id }: { name: string; id: string }) => {
      const renderCount = useRef(0);
      renderCount.current += 1;
      renderCounts.set(id, renderCount.current);

      return <div data-testid={`modal-${name}`}>{name}</div>;
    },
  );

  function App() {
    const modals = Array.from({ length: modalCount }, (_, i) => {
      const modalId = `modal-${i}`;
      return (
        <TestModalWithTracking key={modalId} id={modalId} name={`Modal ${i}`} />
      );
    });

    return <Provider>{modals}</Provider>;
  }

  // When: Initial render
  const { unmount } = render(<App />);

  // When: Show a single modal (should not cause other modals to re-render)
  act(() => {
    show("modal-0", { name: "Modal 0" });
  });

  // Then: Count re-renders
  const reRenders = Array.from(renderCounts.values()).filter(
    (count) => count > 1,
  ).length;

  console.log("=== Memoization Benchmark ===");
  console.log(`Total modals: ${modalCount}`);
  console.log(`Components that re-rendered: ${reRenders}`);
  console.log(
    `Memoization efficiency: ${(((modalCount - reRenders) / modalCount) * 100).toFixed(1)}%`,
  );

  unmount();

  // Assert: With memo() and selective subscriptions, very few re-renders
  expect(reRenders).toBeLessThanOrEqual(3);
});

test("benchmark: useMemo in BaseModalPlaceholder", () => {
  // Given: App with many modals
  const modalCount = 100;
  const modals = Array.from({ length: modalCount }, (_, i) => {
    const modalId = `modal-${i}`;
    return <TestModal key={modalId} id={modalId} name={`Modal ${i}`} />;
  });

  // When: Render and show modals
  const renderStart = performance.now();
  const { unmount } = render(<Provider>{modals}</Provider>);
  const renderTime = performance.now() - renderStart;

  // When: Show multiple modals (tests useMemo in BaseModalPlaceholder)
  const showStart = performance.now();
  act(() => {
    for (let i = 0; i < 10; i++) {
      show(`modal-${i}`, { name: `Modal ${i}` });
    }
  });
  const showTime = performance.now() - showStart;

  console.log("=== BaseModalPlaceholder useMemo Benchmark ===");
  console.log(`Modals: ${modalCount}`);
  console.log(`Initial render: ${renderTime.toFixed(2)}ms`);
  console.log(`Show 10 modals: ${showTime.toFixed(2)}ms`);
  console.log(`Average per modal: ${(showTime / 10).toFixed(2)}ms`);

  unmount();

  // Assert: Should be efficient
  expect(showTime).toBeLessThan(200); // < 200ms for 10 modals
});

test("benchmark: context value memoization", () => {
  // Given: App with modals
  const modalCount = 50;

  const TestComponent = () => {
    // This would track context value changes if we had access
    return null;
  };

  const modals = Array.from({ length: modalCount }, (_, i) => {
    const modalId = `modal-${i}`;
    return <TestModal key={modalId} id={modalId} name={`Modal ${i}`} />;
  });

  // When: Render and perform operations
  const { unmount } = render(
    <Provider>
      {modals}
      <TestComponent />
    </Provider>,
  );

  const operations = 20;
  const startTime = performance.now();

  for (let i = 0; i < operations; i++) {
    act(() => {
      show(`modal-${i % modalCount}`, { name: `Modal ${i}` });
    });
  }

  const totalTime = performance.now() - startTime;

  console.log("=== Context Value Memoization Benchmark ===");
  console.log(`Operations: ${operations}`);
  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average: ${(totalTime / operations).toFixed(2)}ms`);

  unmount();

  // Assert: Should be efficient with memoized context values
  expect(totalTime).toBeLessThan(500); // < 500ms for 20 operations
});
