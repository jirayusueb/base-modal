import type React from "react";
import type { BaseModalArgs } from "../types";
import {
  MODAL_REGISTRY,
  getUid,
  hideModalCallbacks,
  modalCallbacks,
  symModalId,
} from "./constants";
import { dispatch } from "./dispatch";
import { hideModal, removeModal, setModalFlags, showModal } from "./reducer";

export const getModalId = (modal: string | React.FC<any>): string => {
  if (typeof modal === "string") return modal as string;
  if (!(modal as any)[symModalId]) {
    (modal as any)[symModalId] = getUid();
  }
  return (modal as any)[symModalId];
};

export const register = <T extends React.FC<any>>(
  id: string,
  comp: T,
  props?: Partial<BaseModalArgs<T>>,
): void => {
  if (!MODAL_REGISTRY[id]) {
    MODAL_REGISTRY[id] = { comp, props };
  } else {
    MODAL_REGISTRY[id].props = props;
  }
};

export const unregister = (id: string): void => {
  delete MODAL_REGISTRY[id];
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function show(
  modal: React.FC<any> | string,
  args?: BaseModalArgs<React.FC<any>> | Record<string, unknown>,
) {
  const modalId = getModalId(modal);
  if (typeof modal !== "string" && !MODAL_REGISTRY[modalId]) {
    register(modalId, modal as React.FC);
  }

  dispatch(showModal(modalId, args));
  if (!modalCallbacks[modalId]) {
    // `!` tell ts that theResolve will be written before it is used
    let theResolve!: (args?: unknown) => void;
    // `!` tell ts that theResolve will be written before it is used
    let theReject!: (args?: unknown) => void;
    const promise = new Promise((resolve, reject) => {
      theResolve = resolve;
      theReject = reject;
    });
    modalCallbacks[modalId] = {
      resolve: theResolve,
      reject: theReject,
      promise,
    };
  }
  return modalCallbacks[modalId].promise;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function hide(modal: string | React.FC<any>) {
  const modalId = getModalId(modal);
  dispatch(hideModal(modalId));
  // Should also delete the callback for modal.resolve #35
  delete modalCallbacks[modalId];
  if (!hideModalCallbacks[modalId]) {
    // `!` tell ts that theResolve will be written before it is used
    let theResolve!: (args?: unknown) => void;
    // `!` tell ts that theResolve will be written before it is used
    let theReject!: (args?: unknown) => void;
    const promise = new Promise((resolve, reject) => {
      theResolve = resolve;
      theReject = reject;
    });
    hideModalCallbacks[modalId] = {
      resolve: theResolve,
      reject: theReject,
      promise,
    };
  }
  return hideModalCallbacks[modalId].promise;
}

export const remove = (modal: string | React.FC<any>): void => {
  const modalId = getModalId(modal);
  dispatch(removeModal(modalId));
  delete modalCallbacks[modalId];
  delete hideModalCallbacks[modalId];
};

export const setFlags = (
  modalId: string,
  flags: Record<string, unknown>,
): void => {
  dispatch(setModalFlags(modalId, flags));
};

// Get modal component by modal id
export function getModal(modalId: string): React.FC<any> | undefined {
  return MODAL_REGISTRY[modalId]?.comp;
}
