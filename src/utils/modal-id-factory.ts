import type { ComponentType, FC } from "react";
import { getUid } from "@/constants";
import type { BaseModalHocProps } from "@/types";

/**
 * ModalIdFactory manages modal ID generation and mapping for React components.
 * Uses WeakMap for memory-efficient component-to-ID mapping with automatic cleanup.
 */
class ModalIdFactory {
  private componentIds = new WeakMap<ComponentType<unknown>, string>();
  private static instance: ModalIdFactory;

  /**
   * Get the singleton instance of ModalIdFactory
   */
  static getInstance(): ModalIdFactory {
    if (!ModalIdFactory.instance) {
      ModalIdFactory.instance = new ModalIdFactory();
    }
    return ModalIdFactory.instance;
  }

  /**
   * Get or create a modal ID for the given modal.
   * If modal is a string, returns it directly.
   * If modal is a component, returns existing ID or creates a new one.
   *
   * @param modal - String ID or React component
   * @returns Modal ID string
   */
  getId<P = Record<string, unknown>>(
    modal: string | ComponentType<P> | FC<P & BaseModalHocProps>,
  ): string {
    if (typeof modal === "string") {
      return modal;
    }

    const component = modal as ComponentType<unknown>;
    if (!this.componentIds.has(component)) {
      const id = getUid();
      this.componentIds.set(component, id);
      return id;
    }

    const id = this.getComponentId(component);
    if (!id) {
      // This should never happen, but TypeScript needs it
      const newId = getUid();
      this.componentIds.set(component, newId);
      return newId;
    }
    return id;
  }

  /**
   * Internal method to get component ID from WeakMap.
   * Extracted for testability of defensive code path.
   *
   * @private
   */
  private getComponentId(
    component: ComponentType<unknown>,
  ): string | undefined {
    return this.componentIds.get(component);
  }

  /**
   * Check if a component already has an ID assigned.
   *
   * @param modal - React component to check
   * @returns True if component has an ID, false otherwise
   */
  hasId<P = Record<string, unknown>>(
    modal: ComponentType<P> | FC<P & BaseModalHocProps>,
  ): boolean {
    const component = modal as ComponentType<unknown>;
    return this.componentIds.has(component);
  }

  /**
   * Clear all component-to-ID mappings.
   * Useful for testing and cleanup scenarios.
   * Note: WeakMap cannot be cleared directly, so this creates a new WeakMap.
   */
  clear(): void {
    this.componentIds = new WeakMap<ComponentType<unknown>, string>();
  }
}

export { ModalIdFactory };
