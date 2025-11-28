import { act, render } from "@testing-library/react";
import type { Bench } from "tinybench";
import { describe, it } from "vitest";
import { Provider } from "@/providers";
import { BENCHMARK_CONFIG } from "./config";
import contextSubscriptionBench from "./context-subscription.bench";
import integrationBench from "./integration.bench";
import memoryBench from "./memory.bench";
import modalOperationsBench from "./modal-operations.bench";
import renderingBench from "./rendering.bench";

// Type declaration for Bun runtime
declare const Bun:
  | {
      write(file: string, data: string | Uint8Array): Promise<number>;
    }
  | undefined;

/**
 * Benchmark Runner
 *
 * This file contains both the benchmark runner implementation and the Vitest test wrapper.
 * It allows benchmarks to run in vitest's test environment which provides the necessary
 * DOM setup (happy-dom).
 *
 * Note: Each benchmark suite sets up its own Provider context since BaseModal operations
 * require a Provider to be mounted.
 */

async function runSuite(name: string, suite: Bench) {
  console.log(`\n📊 ${name}`);
  console.log("=".repeat(50));

  // Ensure Provider is set up for benchmarks that need it
  // This is a no-op render just to initialize the Provider context
  let unmount: (() => void) | undefined;
  act(() => {
    const result = render(<Provider />);
    unmount = result.unmount;
  });

  try {
    await suite.run();

    const table = suite.table();
    if (table.length > 0) {
      console.table(table);
    } else {
      console.log("No results available");
    }

    // Return suite results for report generation
    // Use suite.tasks to access both task names and their results
    return {
      name,
      results: suite.tasks
        .map((task) => {
          const result = task.result;
          if (!result) {
            return null;
          }
          return {
            name: task.name ?? "Unknown",
            mean: result.mean ?? 0,
            min: result.min ?? 0,
            max: result.max ?? 0,
            sd: result.sd ?? 0,
            p75: result.p75 ?? 0,
            p99: result.p99 ?? 0,
            samples: result.samples ?? 0,
          };
        })
        .filter(
          (result): result is NonNullable<typeof result> => result !== null,
        ),
    };
  } finally {
    if (unmount) {
      act(() => {
        unmount?.();
      });
    }
  }
}

// biome-ignore lint: This file serves dual purpose as both test and module export
export async function runAllBenchmarks() {
  console.log("🚀 Running Base Modal Benchmarks...\n");

  const suites = [
    { name: "Core Operations", suite: modalOperationsBench },
    { name: "Rendering Performance", suite: renderingBench },
    { name: "Memory Usage", suite: memoryBench },
    { name: "Context Subscriptions", suite: contextSubscriptionBench },
    { name: "Integration", suite: integrationBench },
  ];

  const suiteResults = [];

  for (const { name, suite } of suites) {
    const result = await runSuite(name, suite);
    if (result) {
      suiteResults.push(result);
    }
  }

  // Generate timestamped filename
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const filename = `benchmark-results-${timestamp}.json`;

  // Structure report data
  const reportData = {
    metadata: {
      timestamp: now.toISOString(),
      config: {
        iterations: BENCHMARK_CONFIG.iterations,
        warmup: BENCHMARK_CONFIG.warmup,
        time: BENCHMARK_CONFIG.time,
      },
      thresholds: BENCHMARK_CONFIG.thresholds,
    },
    suites: suiteResults,
  };

  // Write report file using Bun.write (Bun runtime) or fallback
  const reportContent = JSON.stringify(reportData, null, 2);
  const { writeFileSync } = await import("node:fs");
  writeFileSync(filename, reportContent, "utf-8");
  console.log(`\n📄 Benchmark report saved to: ${filename}`);

  console.log("\n✅ All benchmarks completed!");
}

describe("Benchmarks", () => {
  it(
    "Run all benchmark suites",
    { timeout: 300000 }, // 5 minutes timeout for all benchmarks
    async () => {
      await act(async () => {
        await runAllBenchmarks();
      });
    },
  );
});
