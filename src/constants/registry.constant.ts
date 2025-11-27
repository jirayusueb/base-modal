import type React from "react";

export interface ModalRegistryEntry<P = Record<string, unknown>> {
  comp: React.ComponentType<P>;
  props?: Partial<P>;
}

export const MODAL_REGISTRY: {
  [id: string]: ModalRegistryEntry;
} = {};

