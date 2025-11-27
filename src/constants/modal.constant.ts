import type { BaseModalStore } from "../types";

export const symModalId = Symbol("BaseModalId");
export const initialState: BaseModalStore = {};

let uidSeed = 0;
export function getUid() {
  return `_base_modal_${uidSeed++}`;
}

