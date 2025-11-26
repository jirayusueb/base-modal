// biome-ignore lint/style/useImportType: React is used as value
import React, { useContext, useEffect } from "react";
import { useModal } from "../hooks/use-modal";
import type { BaseModalHocProps } from "../types";
import { ALREADY_MOUNTED } from "../utils/constants";
import { BaseModalContext, BaseModalIdContext } from "../utils/contexts";
import { setFlags } from "../utils/modal";

export const create = <P extends {}>(
  Comp: React.ComponentType<P>,
): React.FC<P & BaseModalHocProps> => {
  return ({ defaultVisible, keepMounted, id, ...props }) => {
    const { args, show } = useModal(id);

    // If there's modal state, then should mount it.
    const modals = useContext(BaseModalContext);
    const shouldMount = !!modals[id];

    useEffect(() => {
      // If defaultVisible, show it after mounted.
      if (defaultVisible) {
        show();
      }

      ALREADY_MOUNTED[id] = true;

      return () => {
        delete ALREADY_MOUNTED[id];
      };
    }, [id, show, defaultVisible]);

    useEffect(() => {
      if (keepMounted) setFlags(id, { keepMounted: true });
    }, [id, keepMounted]);

    const delayVisible = modals[id]?.delayVisible;
    // If modal.show is called
    //  1. If modal was mounted, should make it visible directly
    //  2. If modal has not been mounted, should mount it first, then make it visible
    useEffect(() => {
      if (delayVisible) {
        // delayVisible: false => true, it means the modal.show() is called, should show it.
        show(args);
      }
    }, [delayVisible, args, show]);

    if (!shouldMount) return null;
    return (
      <BaseModalIdContext.Provider value={id}>
        <Comp {...(props as unknown as P)} {...args} />
      </BaseModalIdContext.Provider>
    );
  };
};
