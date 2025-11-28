import React, { type ReactNode, useCallback, useMemo } from "react";
import { useImmer } from "use-immer";
import { BaseModalPlaceholder } from "@/components";
import { initialState } from "@/constants";
import type { BaseModalAction, BaseModalStore } from "@/types";
import { BaseModalContext } from "@/utils/contexts";
import { setDispatch } from "@/utils/dispatch";
import { applyActionToDraft } from "@/utils/reducer";

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
        applyActionToDraft(draft, action);
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
  const contextValue = useMemo(
    () => givenModals ?? initialState,
    [givenModals],
  );

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
