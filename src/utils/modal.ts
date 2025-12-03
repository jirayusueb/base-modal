import type { ComponentType, FC } from "react";
import { ALREADY_MOUNTED, hideModalCallbacks } from "@/constants";
import type { BaseModalHocProps } from "@/types";
import type { ModalState } from "@/types/patterns";
import { ModalIdFactory } from "./modal-id-factory";
import { ModalRegistry } from "./registry";

/**
 * Modal Utility Functions
 * Acts as an adapter layer between the public API and the ModalRegistry Singleton.
 * Provides functions for registering, showing, hiding, and removing modals.
 */

export function getModalId<P = Record<string, unknown>>(
  modal: string | ComponentType<P> | FC<P & BaseModalHocProps>,
): string {
  return ModalIdFactory.getInstance().getId<P>(modal);
}

export function register<P = Record<string, unknown>>(
  id: string,
  comp: ComponentType<P> | FC<P & BaseModalHocProps>,
  props?: Partial<P>,
): void {
  const registry = ModalRegistry.getInstance();
  const existing = registry.getState(id);

  if (!existing) {
    registry.register(id, {
      id,
      visible: false,
      keepMounted: (props as any)?.keepMounted || false,
      props: props || {},
      promise: null,
      resolvedValue: undefined,
      comp: comp as ComponentType<unknown>,
    });
  } else {
    // Update props if re-registering
    registry.updateState(id, { props: { ...existing.props, ...props } });
  }
}

export function unregister(id: string): void {
  ModalRegistry.getInstance().unregister(id);
}

// Overloads
export function show(
  modal: string,
  args?: Record<string, unknown>,
): Promise<unknown>;
export function show<P extends Record<string, unknown>>(
  modal: FC<P & BaseModalHocProps>,
  args?: P,
): Promise<unknown>;
export function show<P extends Record<string, unknown>>(
  modal: ComponentType<P>,
  args?: P,
): Promise<unknown>;
export function show<P = Record<string, unknown>>(
  modal: FC<P & BaseModalHocProps> | ComponentType<P> | string,
  args?: P,
): Promise<unknown> {
  const modalId = getModalId<P>(modal);
  const registry = ModalRegistry.getInstance();

  if (!registry.hasProvider()) {
    throw new Error("No Provider found. Please wrap your application with <Provider />.");
  }

  // Auto-register if not exists (legacy behavior allows showing unregistered IDs)
  if (!registry.getState(modalId)) {
    // Two-phase mounting: if not already mounted, mount first then show
    const isAlreadyMounted = !!ALREADY_MOUNTED[modalId];

    registry.register(modalId, {
      id: modalId,
      visible: isAlreadyMounted, // Only visible if already mounted
      delayVisible: !isAlreadyMounted, // Delay if not mounted yet
      isMounted: true, // Always mount when show is called
      keepMounted: (args as any)?.keepMounted || false,
      props: args || {},
      promise: null,
      resolvedValue: undefined,
      comp:
        typeof modal !== "string"
          ? (modal as ComponentType<unknown>)
          : undefined,
    });
  }

  // Create promise only if one doesn't exist
  const existingState = registry.getState(modalId);
  let theResolve!: (args?: unknown) => void;
  let theReject!: (args?: unknown) => void;
  let promise: Promise<unknown>;

  if (existingState?.promise) {
    // Reuse existing promise
    promise =
      existingState.promise.promise ||
      new Promise((resolve, reject) => {
        theResolve = resolve;
        theReject = reject;
      });
    theResolve = existingState.promise.resolve;
    theReject = existingState.promise.reject;
  } else {
    // Create new promise
    promise = new Promise((resolve, reject) => {
      theResolve = resolve;
      theReject = reject;
    });
  }

  // Update state with visible=true and promise
  registry.updateState(modalId, {
    visible: true,
    delayVisible: false, // Clear delayVisible when showing
    isMounted: true, // Ensure it stays mounted
    props: { ...existingState?.props, ...(args as Record<string, unknown>) },
    promise: existingState?.promise || {
      resolve: theResolve,
      reject: theReject,
      promise,
    },
    ...((args as any)?.keepMounted !== undefined ? { keepMounted: (args as any)?.keepMounted } : {}),
  });

  return promise;
}

export function hide<P = Record<string, unknown>>(
  modal: string | React.ComponentType<P>,
): Promise<unknown> {
  const modalId = getModalId<P>(modal);
  const registry = ModalRegistry.getInstance();

  registry.updateState(modalId, { visible: false });

  // Create promise that resolves when resolveHide is called (usually after animation)
  let theResolve!: (args?: unknown) => void;
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

  return promise;
}

export function remove<P = Record<string, unknown>>(
  modal: string | React.ComponentType<P>,
): void {
  const modalId = getModalId<P>(modal);
  ModalRegistry.getInstance().unregister(modalId);
}

export function setFlags(
  modalId: string,
  flags: Record<string, unknown>,
): void {
  ModalRegistry.getInstance().updateState(
    modalId,
    flags as Partial<ModalState>,
  );
}

export function getModal<P = Record<string, unknown>>(
  modalId: string,
): React.ComponentType<P> | undefined {
  return ModalRegistry.getInstance().getState(modalId)?.comp as
    | React.ComponentType<P>
    | undefined;
}
