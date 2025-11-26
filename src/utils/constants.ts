import type React from "react";
import type { BaseModalCallbacks, BaseModalStore } from "../types";

export const symModalId = Symbol("BaseModalId");
export const initialState: BaseModalStore = {};
export const MODAL_REGISTRY: {
  [id: string]: {
    comp: React.FC<any>;
    props?: Record<string, unknown>;
  };
} = {};
export const ALREADY_MOUNTED: Record<string, boolean> = {};
export const modalCallbacks: BaseModalCallbacks = {};
export const hideModalCallbacks: BaseModalCallbacks = {};

let uidSeed = 0;
export function getUid() {
  return `_nice_modal_${uidSeed++}`;
}
