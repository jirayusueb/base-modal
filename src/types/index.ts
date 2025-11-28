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

export type BaseModalActionType =
  | "base-modal/show"
  | "base-modal/hide"
  | "base-modal/remove"
  | "base-modal/set-flags";

export interface BaseModalAction {
  type: BaseModalActionType;
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

export interface BaseModalHandler<
  Props = Record<string, unknown>,
  ResolveValue = unknown,
> extends BaseModalState {
  visible: boolean;
  keepMounted: boolean;
  show: (args?: Props) => Promise<ResolveValue>;
  hide: () => Promise<ResolveValue>;
  resolve: (args?: ResolveValue) => void;
  reject: (args?: unknown) => void;
  remove: () => void;
  resolveHide: (args?: ResolveValue) => void;
}

export interface BaseModalHocProps {
  id: string;
  defaultVisible?: boolean;
  keepMounted?: boolean;
}

export type BaseModalArgs<T> = T extends
  | keyof React.JSX.IntrinsicElements
  | React.JSXElementConstructor<infer P>
  ? P
  : T extends React.ComponentType<infer P>
    ? P
    : Record<string, unknown>;
