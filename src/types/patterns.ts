/**
 * TypeScript interfaces for design patterns used in Base Modal refactor
 * Defines Singleton, Observer, and related pattern structures
 */

import type { ComponentType } from "react";

/**
 * Observer interface for components subscribing to modal state changes
 */
export interface Observer<T = unknown> {
  /**
   * Called when the observed state changes
   * @param state - The new state value
   */
  update(state: T): void;
}

/**
 * Modal state representation
 */
export interface ModalState<TProps = Record<string, unknown>> {
  /** Unique identifier for the modal */
  id: string | ComponentType;
  /** The component to render */
  comp?: ComponentType<any>;
  /** Whether the modal is currently visible */
  visible: boolean;
  /** Whether to keep modal mounted in DOM when hidden */
  keepMounted: boolean;
  /** Delayed visibility flag for two-phase mounting (mount first, then show) */
  delayVisible?: boolean;
  /** Whether the modal has been activated and should remain mounted (until removed) */
  isMounted?: boolean;
  /** Props passed to the modal component */
  props: TProps;
  /** Promise handlers for async modal API */
  promise: {
    resolve: (value: unknown) => void;
    reject: (value: unknown) => void;
    promise: Promise<unknown>;
  } | null;
  /** Resolved value from the modal */
  resolvedValue?: unknown;
}

/**
 * Registry interface for Singleton pattern
 * Manages all modal states and observer subscriptions
 */
export interface IModalRegistry {
  /**
   * Register a modal with initial state
   */
  register(id: string | ComponentType, state: ModalState): void;

  /**
   * Unregister a modal
   */
  unregister(id: string | ComponentType): void;

  /**
   * Get current state of a modal
   */
  getState(id: string | ComponentType): ModalState | undefined;

  /**
   * Update modal state and notify observers
   */
  updateState(id: string | ComponentType, updates: Partial<ModalState>): void;

  /**
   * Subscribe to modal state changes
   * @returns Unsubscribe function
   */
  subscribe(
    id: string | ComponentType,
    observer: Observer<ModalState>,
  ): () => void;

  /**
   * Reset registry (for testing)
   */
  reset(): void;
}
