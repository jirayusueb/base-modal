import { type FC, type ReactNode } from "react";
import { render } from "@testing-library/react";
import { create } from "@/components";
import { Provider } from "@/providers";
import type { BaseModalHocProps } from "@/types";
import { BENCHMARK_CONFIG } from "./config";

export { BENCHMARK_CONFIG };

/**
 * Create a simple test modal component for benchmarking
 */
export function createTestModal(name: string) {
  return create(({ title }: { title?: string }) => {
    return (
      <div data-testid={`modal-${name}`}>
        <h1>{title || `Modal ${name}`}</h1>
      </div>
    );
  });
}

/**
 * Create multiple test modals for concurrent testing
 */
export function createTestModals(count: number) {
  return Array.from({ length: count }, (_, i) =>
    createTestModal(`test-${i}`),
  );
}

/**
 * Measure memory usage
 */
export function measureMemory(): number {
  if (typeof performance !== "undefined" && "memory" in performance) {
    const mem = (performance as { memory?: { usedJSHeapSize: number } })
      .memory;
    return mem?.usedJSHeapSize ?? 0;
  }
  return 0;
}

/**
 * Get memory delta (difference between two measurements)
 */
export function getMemoryDelta(before: number, after: number): number {
  return after - before;
}

/**
 * Measure component render time
 */
export function measureRenderTime(
  component: ReactNode,
  options?: { wrapper?: FC<{ children: ReactNode }> },
): number {
  const start = performance.now();
  const Wrapper = options?.wrapper ?? Provider;
  render(<Wrapper>{component}</Wrapper>);
  const end = performance.now();
  return end - start;
}

/**
 * Setup function for benchmarks - returns cleanup function
 */
export function setupBenchmark() {
  // Clear any existing modals
  const cleanup = () => {
    // Cleanup handled by individual benchmarks
  };
  return cleanup;
}

/**
 * Wait for async operations to complete
 */
export async function waitForAsync(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create a modal with specific props type for type-safe benchmarks
 */
export function createTypedModal<P extends Record<string, unknown>>(
  name: string,
) {
  return create((props: P & BaseModalHocProps) => {
    return (
      <div data-testid={`modal-${name}`}>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </div>
    );
  });
}

