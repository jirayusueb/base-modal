import type React from "react";
import {
  type FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { hideModalCallbacks } from "@/constants";
import type { BaseModalHandler, BaseModalHocProps } from "@/types";
import type { ModalState } from "@/types/patterns";
import { BaseModalIdContext } from "@/utils/contexts";
import { ModalIdNotFoundError } from "@/utils/errors";
import { logger } from "@/utils/logger";
import { getModalId, hide, register, remove, show } from "@/utils/modal";
import { ModalRegistry } from "@/utils/registry";
import { ModalStateObserver } from "@/utils/state-manager";

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
    throw new ModalIdNotFoundError();
  }

  const mid = modalId;
  const registry = ModalRegistry.getInstance();

  // Subscribe to registry state via Observer pattern
  const [modalInfo, setModalInfo] = useState<ModalState | undefined>(
    registry.getState(mid),
  );

  useEffect(() => {
    // Initial sync
    setModalInfo(registry.getState(mid));

    const observer = new ModalStateObserver(mid, (newState) => {
      setModalInfo(newState);
    });

    logger.debug(`useModal subscribing to ${mid}`);
    return registry.subscribe(mid, observer);
  }, [mid, registry]);

  // Register component if needed
  useEffect(() => {
    if (
      isUseComponent &&
      !registry.getState(mid) &&
      typeof modal !== "string"
    ) {
      register(
        mid,
        modal as React.ComponentType<P> | FC<P & BaseModalHocProps>,
        args as Partial<P>,
      );
    }
  }, [isUseComponent, mid, modal, args, registry]);

  const showCallback = useCallback(
    (args?: P | Record<string, unknown>) => show(mid, args as P),
    [mid, registry],
  );
  const hideCallback = useCallback(() => hide(mid), [mid]);
  const removeCallback = useCallback(() => remove(mid), [mid]);

  const resolveCallback = useCallback(
    (args?: unknown) => {
      const state = registry.getState(mid);
      state?.promise?.resolve(args);
    },
    [mid, registry],
  );

  const rejectCallback = useCallback(
    (args?: unknown) => {
      const state = registry.getState(mid);
      state?.promise?.reject(args);
    },
    [mid, registry],
  );

  const resolveHide = useCallback(
    (args?: unknown) => {
      hideModalCallbacks[mid]?.resolve(args);
      delete hideModalCallbacks[mid];
      hide(mid);
    },
    [mid],
  );

  return useMemo(
    () => ({
      id: mid,
      args: modalInfo?.props,
      visible: !!modalInfo?.visible,
      keepMounted: !!modalInfo?.keepMounted,
      delayVisible: modalInfo?.delayVisible,
      show: showCallback,
      hide: hideCallback,
      remove: removeCallback,
      resolve: resolveCallback,
      reject: rejectCallback,
      resolveHide,
    }),
    [
      mid,
      modalInfo?.props,
      modalInfo?.visible,
      modalInfo?.keepMounted,
      modalInfo?.delayVisible,
      showCallback,
      hideCallback,
      removeCallback,
      resolveCallback,
      rejectCallback,
      resolveHide,
    ],
  );
}
