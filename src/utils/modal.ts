import type React from "react";
import type { BaseModalHocProps } from "../types";
import {
  MODAL_REGISTRY,
  getUid,
  hideModalCallbacks,
  modalCallbacks,
  symModalId,
  type ModalRegistryEntry,
} from "./constants";
import { dispatch } from "./dispatch";
import { hideModal, removeModal, setModalFlags, showModal } from "./reducer";

export function getModalId<P = Record<string, unknown>>(
  modal: string | React.ComponentType<P>,
): string {
  if (typeof modal === "string") {
    return modal;
  }
  const component = modal as React.ComponentType<P> & {
    [symModalId]?: string;
  };
  if (!component[symModalId]) {
    component[symModalId] = getUid();
  }

  const id = component[symModalId];
  if (!id) {
    throw new Error("Failed to get modal ID");
  }
  return id;
}

export function register<P = Record<string, unknown>>(
  id: string,
  comp: React.ComponentType<P>,
  props?: Partial<P>,
): void {
  if (!MODAL_REGISTRY[id]) {
    MODAL_REGISTRY[id] = { comp: comp as React.ComponentType, props } as ModalRegistryEntry;
  } else {
    MODAL_REGISTRY[id].props = props;
  }
}

export function unregister(id: string): void {
  delete MODAL_REGISTRY[id];
}

export function show<P = Record<string, unknown>>(
  modal: React.ComponentType<P | (P & BaseModalHocProps)> | string,
  args?: P,
): Promise<unknown> {
  const modalId = getModalId<P>(modal);
  if (typeof modal !== "string" && !MODAL_REGISTRY[modalId]) {
    register(modalId, modal, args);
  }

  dispatch(showModal(modalId, args as Record<string, unknown>));
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

export function hide<P = Record<string, unknown>>(
  modal: string | React.ComponentType<P>,
): Promise<unknown> {
  const modalId = getModalId<P>(modal);
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

export function remove<P = Record<string, unknown>>(
  modal: string | React.ComponentType<P>,
): void {
  const modalId = getModalId<P>(modal);
  dispatch(removeModal(modalId));
  delete modalCallbacks[modalId];
  delete hideModalCallbacks[modalId];
}

export function setFlags(
  modalId: string,
  flags: Record<string, unknown>,
): void {
  dispatch(setModalFlags(modalId, flags));
}

// Get modal component by modal id
export function getModal<P = Record<string, unknown>>(
  modalId: string,
): React.ComponentType<P> | undefined {
  return MODAL_REGISTRY[modalId]?.comp as React.ComponentType<P> | undefined;
}
