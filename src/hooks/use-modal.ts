import type React from "react";
import { useCallback, useContext, useEffect, useMemo } from "react";
import {
  hideModalCallbacks,
  MODAL_REGISTRY,
  modalCallbacks,
} from "../constants";
import type { BaseModalHandler, BaseModalHocProps } from "../types";
import { BaseModalIdContext, useModalContext } from "../utils/contexts";
import { getModalId, hide, register, remove, show } from "../utils/modal";

export function useModal(): BaseModalHandler;
export function useModal(
  modal: string,
  args?: Record<string, unknown>,
): BaseModalHandler;
export function useModal<
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  modal:
    | React.ComponentType<P | (P & BaseModalHocProps)>
    | React.ComponentType<P & BaseModalHocProps>,
  args?: Partial<P>,
): Omit<BaseModalHandler<P>, "show"> & {
  show: (args?: P) => Promise<unknown>;
};

export function useModal<
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  modal?: string | React.ComponentType<P>,
  args?: Partial<P> | Record<string, unknown>,
): BaseModalHandler<P> {
  const contextModalId = useContext(BaseModalIdContext);

  let modalId: string | null = null;
  const isUseComponent = modal && typeof modal !== "string";

  if (!modal) {
    modalId = contextModalId;
  } else {
    modalId = getModalId<P>(modal as string | React.ComponentType<P>);
  }

  if (!modalId) {
    throw new Error("No modal id found in BaseModal.useModal.");
  }

  const mid = modalId;

  // Use selective context subscription - only re-renders when this specific modal changes
  const modalInfo = useModalContext(mid);

  // biome-ignore lint/correctness/useExhaustiveDependencies: isUseComponent and mid are intentionally excluded to register only once
  useEffect(() => {
    // If use a component directly, register it.
    if (isUseComponent && !MODAL_REGISTRY[mid] && typeof modal !== "string") {
      register(mid, modal as React.ComponentType<P>, args as Partial<P>);
    }
  }, [isUseComponent, mid]);

  const showCallback = useCallback(
    (args?: P | Record<string, unknown>) => show<P>(mid, args as P),
    [mid],
  );
  const hideCallback = useCallback(() => hide(mid), [mid]);
  const removeCallback = useCallback(() => remove(mid), [mid]);
  const resolveCallback = useCallback(
    (args?: unknown) => {
      modalCallbacks[mid]?.resolve(args);
      delete modalCallbacks[mid];
    },
    [mid],
  );
  const rejectCallback = useCallback(
    (args?: unknown) => {
      modalCallbacks[mid]?.reject(args);
      delete modalCallbacks[mid];
    },
    [mid],
  );
  const resolveHide = useCallback(
    (args?: unknown) => {
      hideModalCallbacks[mid]?.resolve(args);
      delete hideModalCallbacks[mid];
    },
    [mid],
  );

  return useMemo(
    () => ({
      id: mid,
      args: modalInfo?.args,
      visible: !!modalInfo?.visible,
      keepMounted: !!modalInfo?.keepMounted,
      show: showCallback,
      hide: hideCallback,
      remove: removeCallback,
      resolve: resolveCallback,
      reject: rejectCallback,
      resolveHide,
    }),
    [
      mid,
      modalInfo?.args,
      modalInfo?.visible,
      modalInfo?.keepMounted,
      showCallback,
      hideCallback,
      removeCallback,
      resolveCallback,
      rejectCallback,
      resolveHide,
    ],
  );
}
