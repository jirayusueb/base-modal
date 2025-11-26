// biome-ignore lint/style/useImportType: React is used as value
import React, { type ReactNode, useReducer } from "react";
import { BaseModalPlaceholder } from "../components/base-modal-placeholder";
import type { BaseModalAction, BaseModalStore } from "../types";
import { initialState } from "../utils/constants";
import { BaseModalContext } from "../utils/contexts";
import { setDispatch } from "../utils/dispatch";
import { reducer } from "../utils/reducer";

interface InnerContextProviderProps {
  children: ReactNode;
}

const InnerContextProvider: React.FC<InnerContextProviderProps> = ({
  children,
}) => {
  const arr = useReducer(reducer, initialState);
  const modals = arr[0];
  setDispatch(arr[1]);

  return (
    <BaseModalContext.Provider value={modals as BaseModalStore}>
      {children}
      <BaseModalPlaceholder />
    </BaseModalContext.Provider>
  );
};

interface ProviderProps {
  children?: ReactNode;
  dispatch?: React.Dispatch<BaseModalAction>;
  modals?: BaseModalStore;
}

export function Provider({
  children,
  dispatch: givenDispatch,
  modals: givenModals,
}: ProviderProps) {
  if (!givenDispatch || !givenModals) {
    return <InnerContextProvider>{children}</InnerContextProvider>;
  }

  setDispatch(givenDispatch);

  return (
    <BaseModalContext.Provider value={givenModals}>
      {children}
      <BaseModalPlaceholder />
    </BaseModalContext.Provider>
  );
}
