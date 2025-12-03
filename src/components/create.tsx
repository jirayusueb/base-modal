import { type ComponentType, type FC, useEffect } from "react";
import { ALREADY_MOUNTED } from "@/constants";
import { useModal } from "@/hooks/use-modal";
import type { BaseModalHocProps } from "@/types";
import { BaseModalIdContext, useModalContext } from "@/utils/contexts";
import { setFlags } from "@/utils/modal";
import { ModalRegistry } from "@/utils/registry";

export function create<P extends {}>(
  Comp: ComponentType<P>,
): FC<P & BaseModalHocProps> {
  return ({ defaultVisible, keepMounted, id, ...props }) => {
    const modal = useModal(id);
    const { args, show, delayVisible } = modal;

    // Use selective context subscription for backward compatibility
    const modalState = useModalContext(id);
    const shouldMount = !!modalState;

    // biome-ignore lint/correctness/useExhaustiveDependencies: id and defaultVisible are intentionally excluded to run only on mount/unmount
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
        // Ensure modal is registered when keepMounted is true
        const registry = ModalRegistry.getInstance();
        if (!registry.getState(id)) {
          registry.register(id, {
            id,
            visible: false,
            keepMounted: true,
            props: {},
            promise: null,
            resolvedValue: undefined,
          });
        }
      }
    }, [id, keepMounted]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: delayVisible is the only dependency needed to trigger show
    useEffect(() => {
      // If modal.show is called
      //  1. If modal was mounted, should make it visible directly
      //  2. If modal has not been mounted, should mount it first, then make it visible
      if (delayVisible) {
        // delayVisible: false => true, it means the modal.show() is called, should show it.
        show(args);
      }
    }, [delayVisible]);

    // Mount if: modal exists in context OR keepMounted is explicitly true
    if (!shouldMount && !keepMounted) {
      return null;
    }

    return (
      <BaseModalIdContext.Provider value={id}>
        <Comp {...(props as unknown as P)} {...args} />
      </BaseModalIdContext.Provider>
    );
  };
}
