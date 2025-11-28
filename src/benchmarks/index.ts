/**
 * Benchmark Suite Runner
 *
 * This file exports all benchmark suites for easy execution
 */

export { BENCHMARK_CONFIG } from "./config";
export { default as contextSubscriptionBench } from "./context-subscription.bench";
export { default as integrationBench } from "./integration.bench";
export { default as memoryBench } from "./memory.bench";
export { default as modalOperationsBench } from "./modal-operations.bench";
export { default as renderingBench } from "./rendering.bench";
export * from "./utils";
