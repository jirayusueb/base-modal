import React, { type ReactNode, useCallback, useMemo } from "react";
import { useImmer } from "use-immer";
import { BaseModalPlaceholder } from "../components";
import { ALREADY_MOUNTED, initialState } from "../constants";
import type { BaseModalAction, BaseModalStore } from "../types";
import { BaseModalContext } from "../utils/contexts";
import { setDispatch } from "../utils/dispatch";

interface InnerContextProviderProps {
  children: ReactNode;
}

const InnerContextProvider: React.FC<InnerContextProviderProps> = ({
  children,
}) => {
  const [modals, updateModals] = useImmer<BaseModalStore>(initialState);

  const dispatch = useCallback(
    (action: BaseModalAction) => {
      updateModals((draft) => {
        switch (action.type) {
          case "base-modal/show": {
            const { modalId, args } = action.payload;

            draft[modalId] = {
              ...draft[modalId],
              id: modalId,
              args,
              // If modal is not mounted, mount it first then make it visible.
              // There is logic inside HOC wrapper to make it visible after its first mount.
              // This mechanism ensures the entering transition.
              visible: !!ALREADY_MOUNTED[modalId],
              delayVisible: !ALREADY_MOUNTED[modalId],
            };
            break;
          }
          case "base-modal/hide": {
            const { modalId } = action.payload;
            if (draft[modalId]) {
              draft[modalId].visible = false;
            }
            break;
          }
          case "base-modal/remove": {
            const { modalId } = action.payload;
            delete draft[modalId];
            break;
          }
          case "base-modal/set-flags": {
            const { modalId, flags } = action.payload;
            if (draft[modalId]) {
              if (flags) {
                Object.assign(draft[modalId], flags);
              }
            } else if (flags?.keepMounted) {
              // If modal doesn't exist but keepMounted is true, create it with visible: false
              draft[modalId] = {
                id: modalId,
                visible: false,
                keepMounted: true,
                ...flags,
              };
            }
            break;
          }
          default:
            break;
        }
      });
    },
    [updateModals],
  );

  setDispatch(dispatch);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => modals as BaseModalStore, [modals]);

  return (
    <BaseModalContext.Provider value={contextValue}>
      {children}
      <BaseModalPlaceholder />
    </BaseModalContext.Provider>
  );
};

interface ProviderProps {
  children?: ReactNode;
  dispatch?: (action: BaseModalAction) => void;
  modals?: BaseModalStore;
}

export function Provider({
  children,
  dispatch: givenDispatch,
  modals: givenModals,
}: ProviderProps) {
  // Memoize context value to prevent unnecessary re-renders
  // Must be called before early return to follow hooks rules
  const contextValue = useMemo(() => givenModals, [givenModals]);

  if (!givenDispatch || !givenModals) {
    return <InnerContextProvider>{children}</InnerContextProvider>;
  }

  setDispatch(givenDispatch);

  return (
    <BaseModalContext.Provider value={contextValue}>
      {children}
      <BaseModalPlaceholder />
    </BaseModalContext.Provider>
  );
}
