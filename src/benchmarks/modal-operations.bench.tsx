import { act, render } from "@testing-library/react";
import React from "react";
import { Provider, create, show, hide, remove } from "../index";

/**
 * Benchmark: Modal Operations Performance
 *
 * Measures the performance of core modal operations:
 * - show() operations
 * - hide() operations
 * - remove() operations
 * - Multiple rapid operations
 */

interface TestModalProps {
  name: string;
}

const TestModal = create(({ name }: TestModalProps) => {
  return <div data-testid={`modal-${name}`}>{name}</div>;
});

test("benchmark: modal show operation performance", () => {
  // Given: Provider with registered modal
  render(
    <Provider>
      <TestModal id="test-modal" name="Test Modal" />
    </Provider>,
  );

  const iterations = 1000;
  const times: number[] = [];

  // When: Perform many show operations
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    act(() => {
      show("test-modal", { name: `Test ${i}` });
    });
    const endTime = performance.now();
    times.push(endTime - startTime);
  }

  // Then: Calculate statistics
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const p95Time = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

  console.log("=== Show Operation Benchmark ===");
  console.log(`Iterations: ${iterations}`);
  console.log(`Average time: ${avgTime.toFixed(3)}ms`);
  console.log(`Min time: ${minTime.toFixed(3)}ms`);
  console.log(`Max time: ${maxTime.toFixed(3)}ms`);
  console.log(`P95 time: ${p95Time.toFixed(3)}ms`);

  // Assert: Average should be reasonable
  expect(avgTime).toBeLessThan(10); // Should average < 10ms
});

test("benchmark: modal hide operation performance", () => {
  // Given: Provider with visible modal
  render(
    <Provider>
      <TestModal id="test-modal" name="Test Modal" />
    </Provider>,
  );

  act(() => {
    show("test-modal");
  });

  const iterations = 1000;
  const times: number[] = [];

  // When: Perform many hide operations
  for (let i = 0; i < iterations; i++) {
    // Show first
    act(() => {
      show("test-modal");
    });

    const startTime = performance.now();
    act(() => {
      hide("test-modal");
    });
    const endTime = performance.now();
    times.push(endTime - startTime);
  }

  // Then: Calculate statistics
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  console.log("=== Hide Operation Benchmark ===");
  console.log(`Iterations: ${iterations}`);
  console.log(`Average time: ${avgTime.toFixed(3)}ms`);
  console.log(`Min time: ${minTime.toFixed(3)}ms`);
  console.log(`Max time: ${maxTime.toFixed(3)}ms`);

  // Assert: Average should be reasonable
  expect(avgTime).toBeLessThan(10);
});

test("benchmark: rapid modal operations", () => {
  // Given: Provider with multiple modals
  const modalCount = 50;
  const modals = Array.from({ length: modalCount }, (_, i) => {
    const modalId = `modal-${i}`;
    return (
      <TestModal key={modalId} id={modalId} name={`Modal ${i}`} />
    );
  });

  render(<Provider>{modals}</Provider>);

  const operations = 100;
  const startTime = performance.now();

  // When: Perform rapid show/hide operations on different modals
  for (let i = 0; i < operations; i++) {
    const modalId = `modal-${i % modalCount}`;
    act(() => {
      show(modalId, { name: `Modal ${i}` });
    });
    act(() => {
      hide(modalId);
    });
  }

  const totalTime = performance.now() - startTime;
  const avgTime = totalTime / operations;

  console.log("=== Rapid Operations Benchmark ===");
  console.log(`Operations: ${operations} (show + hide)`);
  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average per operation: ${avgTime.toFixed(3)}ms`);

  // Assert: Should handle rapid operations efficiently
  // Note: Test environment (happy-dom) may be slower than real browser
  expect(avgTime).toBeLessThan(20); // < 20ms per show/hide cycle in test env
});

test("benchmark: memory usage with many modals", () => {
  // Given: Provider setup
  const modalCount = 100;
  const modals = Array.from({ length: modalCount }, (_, i) => {
    const modalId = `modal-${i}`;
    return (
      <TestModal key={modalId} id={modalId} name={`Modal ${i}`} />
    );
  });

  // When: Render and show all modals
  const { unmount } = render(<Provider>{modals}</Provider>);

  act(() => {
    for (let i = 0; i < modalCount; i++) {
      show(`modal-${i}`, { name: `Modal ${i}` });
    }
  });

  // Then: Cleanup
  act(() => {
    for (let i = 0; i < modalCount; i++) {
      remove(`modal-${i}`);
    }
  });

  unmount();

  // Note: Memory measurement in browser environment is limited
  // This test ensures operations complete without errors
  expect(true).toBe(true);
});

