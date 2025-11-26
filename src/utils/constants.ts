import type React from "react";
import type { BaseModalCallbacks, BaseModalStore } from "../types";

export const symModalId = Symbol("BaseModalId");
export const initialState: BaseModalStore = {};

export interface ModalRegistryEntry<P = Record<string, unknown>> {
  comp: React.ComponentType<P>;
  props?: Partial<P>;
}

export const MODAL_REGISTRY: {
  [id: string]: ModalRegistryEntry;
} = {};
export const ALREADY_MOUNTED: Record<string, boolean> = {};
export const modalCallbacks: BaseModalCallbacks = {};
export const hideModalCallbacks: BaseModalCallbacks = {};

let uidSeed = 0;
export function getUid() {
  return `_base_modal_${uidSeed++}`;
}
