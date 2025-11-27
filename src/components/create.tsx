import { useEffect, type ComponentType, type FC } from "react";
import { useModal } from "../hooks/use-modal";
import type { BaseModalHocProps } from "../types";
import { ALREADY_MOUNTED } from "../constants";
import { BaseModalIdContext, useModalContext } from "../utils/contexts";
import { setFlags } from "../utils/modal";

export function create<P extends {}>(
  Comp: ComponentType<P>,
): FC<P & BaseModalHocProps> {
  return ({ defaultVisible, keepMounted, id, ...props }) => {
    const { args, show } = useModal(id);

    // Use selective context subscription - only re-renders when this specific modal changes
    const modalState = useModalContext(id);
    const shouldMount = !!modalState;
    const delayVisible = modalState?.delayVisible;

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      // If defaultVisible, show it after mounted.
      if (defaultVisible) {
        show();
      }

      ALREADY_MOUNTED[id] = true;

      return () => {
        delete ALREADY_MOUNTED[id];
      };
    }, [id, defaultVisible]);

    useEffect(() => {
      if (keepMounted) {
        setFlags(id, { keepMounted: true });
      }
    }, [id, keepMounted]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      // If modal.show is called
      //  1. If modal was mounted, should make it visible directly
      //  2. If modal has not been mounted, should mount it first, then make it visible
      if (delayVisible) {
        // delayVisible: false => true, it means the modal.show() is called, should show it.
        show(args);
      }
    }, [delayVisible]);

    if (!shouldMount) {
      return null;
    }

    return (
      <BaseModalIdContext.Provider value={id}>
        <Comp {...(props as unknown as P)} {...args} />
      </BaseModalIdContext.Provider>
    );
  };
}
