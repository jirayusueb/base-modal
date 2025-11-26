import type React from "react";

export interface BaseModalState {
  id: string;
  args?: Record<string, unknown>;
  visible?: boolean;
  delayVisible?: boolean;
  keepMounted?: boolean;
}

export interface BaseModalStore {
  [key: string]: BaseModalState;
}

export interface BaseModalAction {
  type: string;
  payload: {
    modalId: string;
    args?: Record<string, unknown>;
    flags?: Record<string, unknown>;
  };
}

export interface BaseModalCallbacks {
  [modalId: string]: {
    resolve: (args: unknown) => void;
    reject: (args: unknown) => void;
    promise: Promise<unknown>;
  };
}

export interface BaseModalHandler<Props = Record<string, unknown>>
  extends BaseModalState {
  visible: boolean;
  keepMounted: boolean;
  show: (args?: Props) => Promise<unknown>;
  hide: () => Promise<unknown>;
  resolve: (args?: unknown) => void;
  reject: (args?: unknown) => void;
  remove: () => void;
  resolveHide: (args?: unknown) => void;
}

export interface BaseModalHocProps {
  id: string;
  defaultVisible?: boolean;
  keepMounted?: boolean;
}

export type BaseModalArgs<T> = T extends
  | keyof React.JSX.IntrinsicElements
  | React.JSXElementConstructor<any>
  ? React.ComponentProps<T>
  : Record<string, unknown>;
