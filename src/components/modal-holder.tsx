// biome-ignore lint/style/useImportType: React is used as value
import React, { useCallback, useMemo } from "react";
import { MODAL_REGISTRY, getUid } from "../utils/constants";
import { hide, show } from "../utils/modal";

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
export const ModalHolder: React.FC<Record<string, unknown>> = ({
  modal,
  handler = {},
  ...restProps
}: {
  modal: string | React.FC<any>;
  handler: any;
  [key: string]: any;
}) => {
  const mid = useMemo(() => getUid(), []);
  const ModalComp =
    typeof modal === "string" ? MODAL_REGISTRY[modal]?.comp : modal;

  if (!handler) {
    throw new Error("No handler found in BaseModal.ModalHolder.");
  }
  if (!ModalComp) {
    throw new Error(
      `No modal found for id: ${modal} in BaseModal.ModalHolder.`,
    );
  }
  handler.show = useCallback((args: any) => show(mid, args), [mid]);
  handler.hide = useCallback(() => hide(mid), [mid]);

  return <ModalComp id={mid} {...restProps} />;
};
