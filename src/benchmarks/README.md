# Performance Benchmarks

This directory contains performance benchmarks to measure and validate the optimizations made to the modal library.

## Running Benchmarks

```bash
# Run all benchmarks
bun run benchmark

# Run benchmarks in watch mode
bun run benchmark:watch
```

## Benchmark Suites

### 1. Context Subscription Benchmarks (`context-subscription.bench.tsx`)

Measures the performance improvement from selective context subscriptions:

- **Re-render Count**: Tests how many components re-render when a single modal changes
- **Scalability**: Measures performance with varying numbers of modals (10, 50, 100, 200)
- **Expected Results**:
  - With selective subscriptions, only 1-2 components should re-render when showing a single modal
  - Operations should complete in < 100ms even with 200 modals

### 2. Modal Operations Benchmarks (`modal-operations.bench.tsx`)

Measures the performance of core modal operations:

- **Show Operations**: Average, min, max, and P95 times for 1000 show() calls
- **Hide Operations**: Average, min, max times for 1000 hide() calls
- **Rapid Operations**: Performance of rapid show/hide cycles on multiple modals
- **Memory Usage**: Tests memory efficiency with many modals
- **Expected Results**:
  - Show/hide operations should average < 10ms
  - Rapid operations should average < 5ms per cycle

### 3. Memoization Benchmarks (`memoization.bench.tsx`)

Measures the effectiveness of memoization optimizations:

- **memo() Effectiveness**: Tests how many components re-render with memo() wrapping
- **useMemo in BaseModalPlaceholder**: Measures performance of memoized calculations
- **Context Value Memoization**: Tests stability of memoized context values
- **Expected Results**:
  - With memo() and selective subscriptions, < 3 components should re-render
  - BaseModalPlaceholder operations should be < 200ms for 10 modals

## Performance Targets

Based on the optimizations implemented:

- **Re-render Efficiency**: > 95% of components should NOT re-render when unrelated modals change
- **Operation Speed**: Show/hide operations should complete in < 10ms on average
- **Scalability**: Should handle 200+ modals without performance degradation
- **Memory**: Should clean up properly and not leak memory

## Interpreting Results

The benchmarks output performance metrics to the console. Look for:

- **Re-render counts**: Lower is better (ideally 0-2 for selective subscriptions)
- **Operation times**: Lower is better (should be < 10ms for individual operations)
- **Scalability**: Times should scale linearly or sub-linearly with modal count

## Continuous Monitoring

These benchmarks can be integrated into CI/CD pipelines to:

- Detect performance regressions
- Validate optimization effectiveness
- Track performance over time
- Ensure optimizations remain effective after code changes

