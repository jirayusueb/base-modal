import type { ComponentType } from "react";
import type { IModalRegistry, ModalState, Observer } from "../types/patterns";
import { logger } from "./logger";

/**
 * Singleton Registry for managing modal states and observers
 * Implements the IModalRegistry interface
 */
export class ModalRegistry implements IModalRegistry {
  private static instance: ModalRegistry;
  private modals: Map<string, ModalState> = new Map();
  private observers: Map<string, Set<Observer<ModalState>>> = new Map();
  private globalObservers: Set<Observer<void>> = new Set();
  private _hasProvider = false;

  private constructor() {
    logger.debug("ModalRegistry initialized");
  }

  /**
   * Get the singleton instance of ModalRegistry
   */
  public static getInstance(): ModalRegistry {
    if (!ModalRegistry.instance) {
      ModalRegistry.instance = new ModalRegistry();
    }
    logger.debug("Registry accessed");
    return ModalRegistry.instance;
  }

  /**
   * Set whether a Provider is currently mounted
   */
  public setProviderMounted(mounted: boolean): void {
    this._hasProvider = mounted;
  }

  /**
   * Check if a Provider is currently mounted
   */
  public hasProvider(): boolean {
    return this._hasProvider;
  }

  /**
   * Register a modal with initial state
   */
  public register(id: string | ComponentType, state: ModalState): void {
    const modalId = this.getModalId(id);
    this.modals.set(modalId, state);
    logger.debug(`Registered modal: ${modalId}`, state);
    this.notifyGlobalObservers();
  }

  /**
   * Unregister a modal
   */
  public unregister(id: string | ComponentType): void {
    const modalId = this.getModalId(id);
    this.modals.delete(modalId);
    this.observers.delete(modalId);
    logger.debug(`Unregistered modal: ${modalId}`);
    this.notifyGlobalObservers();
  }

  /**
   * Get current state of a modal
   */
  public getState(id: string | ComponentType): ModalState | undefined {
    const modalId = this.getModalId(id);
    return this.modals.get(modalId);
  }

  /**
   * Get all modal states (for legacy compatibility)
   */
  public getAll(): Record<string, ModalState> {
    const result: Record<string, ModalState> = {};
    this.modals.forEach((state, key) => {
      result[key] = state;
    });
    return result;
  }

  /**
   * Update modal state and notify observers
   */
  public updateState(
    id: string | ComponentType,
    updates: Partial<ModalState>,
  ): void {
    const modalId = this.getModalId(id);
    const currentState = this.modals.get(modalId);

    if (!currentState) {
      logger.warn(`Attempted to update non-existent modal: ${modalId}`);
      return;
    }

    // Shallow compare to prevent unnecessary updates (and infinite loops)
    let hasChanges = false;
    for (const key in updates) {
      const k = key as keyof ModalState;
      if (updates[k] !== currentState[k]) {
        // Deep compare for props if needed, but shallow for now
        // For props, we might want to check content if it's an object
        if (
          k === "props" &&
          updates[k] &&
          currentState[k] &&
          typeof updates[k] === "object" &&
          typeof currentState[k] === "object"
        ) {
          const newProps = updates[k] as Record<string, unknown>;
          const oldProps = currentState[k] as Record<string, unknown>;
          const keys1 = Object.keys(newProps);
          const keys2 = Object.keys(oldProps);
          if (keys1.length !== keys2.length) {
            hasChanges = true;
          } else {
            for (const key of keys1) {
              if (newProps[key] !== oldProps[key]) {
                hasChanges = true;
                break;
              }
            }
          }
        } else {
          hasChanges = true;
        }
        if (hasChanges) break;
      }
    }

    if (!hasChanges) return;

    const newState = { ...currentState, ...updates };
    this.modals.set(modalId, newState);

    logger.info(`State updated for ${modalId}`, updates);
    this.notifyObservers(modalId, newState);
  }

  /**
   * Subscribe to modal state changes
   */
  public subscribe(
    id: string | ComponentType,
    observer: Observer<ModalState>,
  ): () => void {
    const modalId = this.getModalId(id);

    if (!this.observers.has(modalId)) {
      this.observers.set(modalId, new Set());
    }

    this.observers.get(modalId)?.add(observer);
    logger.debug(`Observer subscribed to ${modalId}`);

    return () => {
      this.observers.get(modalId)?.delete(observer);
      logger.debug(`Observer unsubscribed from ${modalId}`);
    };
  }

  /**
   * Subscribe to all registry changes (for Provider sync)
   */
  public subscribeToAll(observer: Observer<void>): () => void {
    this.globalObservers.add(observer);
    return () => this.globalObservers.delete(observer);
  }

  /**
   * Reset registry (for testing)
   */
  public reset(): void {
    this.modals.clear();
    this.observers.clear();
    this.globalObservers.clear();
    logger.debug("ModalRegistry reset");
  }

  /**
   * Notify all observers of a modal about state changes
   */
  private notifyObservers(modalId: string, state: ModalState): void {
    const modalObservers = this.observers.get(modalId);
    if (modalObservers) {
      for (const observer of modalObservers) {
        observer.update(state);
      }
      logger.debug(`Notified ${modalObservers.size} observers for ${modalId}`);
    }
    this.notifyGlobalObservers();
  }

  private notifyGlobalObservers(): void {
    for (const observer of this.globalObservers) {
      observer.update(undefined);
    }
  }

  /**
   * Helper to normalize modal ID
   */
  private getModalId(id: string | ComponentType): string {
    if (typeof id === "string") return id;
    // For components, we'd typically use a display name or generated ID
    const component = id as unknown as { displayName?: string; name?: string };
    return component.displayName || component.name || "UnknownComponent";
  }
}
