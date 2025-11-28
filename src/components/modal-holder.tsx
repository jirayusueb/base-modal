import type React from "react";
import { useCallback, useMemo } from "react";
import { getUid, MODAL_REGISTRY } from "@/constants";
import {
  ModalHandlerNotFoundError,
  ModalNotFoundError,
} from "@/utils/errors";
import { hide, show } from "@/utils/modal";

export interface ModalHandler {
  show: (args?: Record<string, unknown>) => Promise<unknown>;
  hide: () => Promise<unknown>;
}

interface ModalHolderProps<P = Record<string, unknown>> {
  modal: string | React.ComponentType<P>;
  handler?: ModalHandler;
  [key: string]: unknown;
}

/**
 * A place holder allows to bind props to a modal.
 * It assigns show/hide methods to handler object to show/hide the modal.
 *
 * Comparing to use the <MyBaseModal id=../> directly, this approach allows use registered modal id to find the modal component.
 * Also it avoids to create unique id for MyBaseModal.
 *
 * @param modal - The modal id registered or a modal component.
 * @param handler - The handler object to control the modal.
 * @returns
 */
export function ModalHolder<P = Record<string, unknown>>({
  modal,
  handler,
  ...restProps
}: ModalHolderProps<P>) {
  const mid = useMemo(() => getUid(), []);
  const ModalComp =
    typeof modal === "string" ? MODAL_REGISTRY[modal]?.comp : modal;

  if (handler === null) {
    throw new ModalHandlerNotFoundError();
  }
  if (!ModalComp) {
    const modalId = typeof modal === "string" ? modal : "unknown";
    throw new ModalNotFoundError(modalId);
  }

  const actualHandler = handler ?? ({} as ModalHandler);
  actualHandler.show = useCallback(
    (args?: Record<string, unknown>) => show<P>(mid, args as P),
    [mid],
  );
  actualHandler.hide = useCallback(() => hide<P>(mid), [mid]);

  return <ModalComp id={mid} {...(restProps as P)} />;
}
