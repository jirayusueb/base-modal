# Base Modal Benchmarks

This directory contains comprehensive performance benchmarks for the Base Modal library. The benchmarks measure core operations, React rendering performance, memory usage, context subscriptions, and integration scenarios.

## Overview

The benchmark suite uses [TinyBench](https://github.com/tinylibs/tinybench) to measure performance across multiple dimensions:

1. **Core Operations** (`modal-operations.bench.tsx`) - Timing and throughput for show, hide, register, remove
2. **Rendering Performance** (`rendering.bench.tsx`) - Component mount time, re-render counts, context subscriptions
3. **Memory Usage** (`memory.bench.tsx`) - Memory consumption and leak detection
4. **Context Subscriptions** (`context-subscription.bench.tsx`) - Context performance and selective subscription effectiveness
5. **Integration** (`integration.bench.tsx`) - End-to-end scenarios and workflows

## Running Benchmarks

### Run All Benchmarks

```bash
npm run benchmark
```

### Run Specific Benchmark File

```bash
npm run benchmark -- src/benchmarks/modal-operations.bench.tsx
```

### Watch Mode

```bash
npm run benchmark:watch
```

## Understanding Benchmark Results

Benchmark results show:
- **Mean**: Average execution time
- **Min/Max**: Fastest and slowest execution times
- **SD**: Standard deviation (consistency indicator)
- **P75/P99**: Percentile values (performance under load)

### Report Export

After running benchmarks, results are automatically exported to a JSON report file in the project root directory. The report file is named with a timestamp: `benchmark-results-YYYYMMDD-HHmmss.json`.

**Report Structure:**

The JSON report contains:
- `metadata`: Timestamp, configuration values, and performance thresholds
- `suites`: Array of benchmark suite results, each containing:
  - Suite name
  - Array of benchmark results with metrics (mean, min, max, sd, p75, p99, samples)

**Example Report:**

```json
{
  "metadata": {
    "timestamp": "2024-01-01T14:30:22.000Z",
    "config": {
      "iterations": 100,
      "warmup": 10,
      "time": 1000
    },
    "thresholds": {
      "show": 5,
      "hide": 3,
      "register": 1,
      "remove": 2,
      "mount": 10,
      "render": 5
    }
  },
  "suites": [
    {
      "name": "Core Operations",
      "results": [
        {
          "name": "BaseModal.show() - single modal",
          "mean": 2.5,
          "min": 1.2,
          "max": 5.0,
          "sd": 0.8,
          "p75": 3.0,
          "p99": 4.5,
          "samples": 100
        }
      ]
    }
  ]
}
```

Reports can be used for:
- Performance tracking over time
- Comparing results across different versions
- Automated performance regression detection
- Sharing benchmark results with the team

### Performance Targets

Based on `future-plan.md`, the following targets are established:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Modal Show Time | Baseline (target -10% improvement) | Benchmark suite |
| Re-render Count | Baseline (target -20% improvement) | React DevTools Profiler |
| Memory Leaks | 0 | Memory profiler |

### Thresholds

Default performance thresholds (in milliseconds) are defined in `config.ts`:

- `show`: < 5ms
- `hide`: < 3ms
- `register`: < 1ms
- `remove`: < 2ms
- `mount`: < 10ms
- `render`: < 5ms

## Benchmark Categories

### Core Operations

Measures the performance of fundamental modal operations:
- Single modal show/hide
- Sequential modals (10 modals)
- Concurrent modals (10 modals)
- Registration overhead
- Full lifecycle (register → show → hide → remove)

### Rendering Performance

Measures React rendering impact:
- Component mount time
- Re-render counts when showing/hiding modals
- Multiple modals rendering (10 modals)
- Context subscription overhead

### Memory Usage

Measures memory consumption:
- Memory usage with 1, 10, and 100 modals
- Memory cleanup after removal
- Memory leak detection (create/remove cycles)
- Promise callback cleanup

### Context Subscriptions

Measures context performance:
- Context subscription overhead
- Selective subscription performance
- Multiple subscribers (10 subscribers)
- Context value memoization effectiveness

### Integration

End-to-end scenarios:
- Complete modal workflow (show → interact → hide)
- Multiple modals workflow (sequential and concurrent)
- Provider with custom dispatch
- Modal with keepMounted flag
- Modal registration and usage

## Contributing New Benchmarks

When adding new benchmarks:

1. Create a new `.bench.tsx` file in this directory
2. Import `Bench` from `tinybench` and `BENCHMARK_CONFIG` from `./config`
3. Create a suite with `new Bench({ time: BENCHMARK_CONFIG.time })`
4. Add benchmark cases using `.add(name, async () => { ... })`
5. Export the suite as default
6. Add the export to `index.ts`
7. Document the benchmark in this README

Example:

```typescript
import { Bench } from "tinybench";
import { BENCHMARK_CONFIG } from "./config";

const suite = new Bench({ time: BENCHMARK_CONFIG.time });

suite
  .add("My benchmark", async () => {
    // Benchmark code here
  });

export default suite;
```

## Configuration

Benchmark configuration is defined in `config.ts`:

- `iterations`: Number of iterations (default: 100)
- `warmup`: Warmup iterations (default: 10)
- `time`: Time limit in milliseconds (default: 1000)
- `thresholds`: Performance thresholds for each operation

## Utilities

The `utils.ts` file provides helper functions:
- `createTestModal(name)` - Create a test modal component
- `createTestModals(count)` - Create multiple test modals
- `measureMemory()` - Measure current memory usage
- `getMemoryDelta(before, after)` - Calculate memory difference
- `measureRenderTime(component)` - Measure component render time
- `setupBenchmark()` - Setup function for benchmarks
- `waitForAsync()` - Wait for async operations

## Notes

- Benchmarks are excluded from test coverage (see `vitest.config.ts`)
- Benchmarks run in a separate environment and don't affect test coverage
- Memory measurements may vary between runs due to garbage collection
- For consistent results, run benchmarks multiple times and average the results

