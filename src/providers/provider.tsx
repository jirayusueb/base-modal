// biome-ignore lint/style/useImportType: React is used as value
import React, { type ReactNode, useReducer } from "react";
import { BaseModalPlaceholder } from "../components/base-modal-placeholder";
import type { BaseModalAction, BaseModalStore } from "../types";
import { initialState } from "../utils/constants";
import { BaseModalContext } from "../utils/contexts";
import { setDispatch } from "../utils/dispatch";
import { reducer } from "../utils/reducer";

const InnerContextProvider: React.FC<{ children: ReactNode }> = ({
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

export const Provider: React.FC<Record<string, unknown>> = ({
  children,
  dispatch: givenDispatch,
  modals: givenModals,
}: {
  children: ReactNode;
  dispatch?: React.Dispatch<BaseModalAction>;
  modals?: BaseModalStore;
}) => {
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
};
