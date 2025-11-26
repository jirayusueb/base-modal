import { useCallback, useContext, useEffect, useMemo } from "react";
import type { BaseModalArgs, BaseModalHandler } from "../types";
import {
  MODAL_REGISTRY,
  hideModalCallbacks,
  modalCallbacks,
} from "../utils/constants";
import { BaseModalContext, BaseModalIdContext } from "../utils/contexts";
import { getModalId, hide, register, remove, show } from "../utils/modal";

export function useModal(): BaseModalHandler;
export function useModal(
  modal: string,
  args?: Record<string, unknown>,
): BaseModalHandler;
export function useModal<C, P extends Partial<BaseModalArgs<React.FC<C>>>>(
  modal: React.FC<C>,
  args?: P,
): Omit<BaseModalHandler, "show"> & {
  show: (args?: P) => Promise<unknown>;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useModal(modal?: any, args?: any): any {
  const modals = useContext(BaseModalContext);
  const contextModalId = useContext(BaseModalIdContext);
  let modalId: string | null = null;
  const isUseComponent = modal && typeof modal !== "string";
  if (!modal) {
    modalId = contextModalId;
  } else {
    modalId = getModalId(modal);
  }

  // Only if contextModalId doesn't exist
  if (!modalId) throw new Error("No modal id found in BaseModal.useModal.");

  const mid = modalId as string;
  // If use a component directly, register it.
  useEffect(() => {
    if (isUseComponent && !MODAL_REGISTRY[mid]) {
      register(mid, modal as React.FC, args);
    }
  }, [isUseComponent, mid, modal, args]);

  const modalInfo = modals[mid];

  const showCallback = useCallback(
    (args?: Record<string, unknown>) => show(mid, args),
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
