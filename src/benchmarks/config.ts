/**
 * Benchmark configuration
 */
export const BENCHMARK_CONFIG = {
  /**
   * Number of iterations to run for each benchmark
   */
  iterations: 100,

  /**
   * Number of warmup iterations before actual benchmarking
   */
  warmup: 10,

  /**
   * Time limit for each benchmark in milliseconds
   */
  time: 1000,

  /**
   * Performance thresholds (in milliseconds)
   */
  thresholds: {
    show: 5, // Modal show should complete in < 5ms
    hide: 3, // Modal hide should complete in < 3ms
    register: 1, // Registration should complete in < 1ms
    remove: 2, // Removal should complete in < 2ms
    mount: 10, // Component mount should complete in < 10ms
    render: 5, // Re-render should complete in < 5ms
  },
} as const;
