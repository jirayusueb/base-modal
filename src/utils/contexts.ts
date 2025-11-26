import { useMemo, useContext } from "react";
import React from "react";
import type { BaseModalStore, BaseModalState } from "../types";
import { initialState } from "./constants";

export const BaseModalContext =
  React.createContext<BaseModalStore>(initialState);
export const BaseModalIdContext = React.createContext<string | null>(null);

/**
 * Custom hook for selective context subscription.
 * Only re-renders when the specific modal ID changes.
 * Uses useMemo to memoize the selected modal, preventing re-renders
 * when other modals in the store change.
 * @param modalId - The modal ID to subscribe to, or null to get all modals
 * @returns The modal state for the specific ID, or all modals if modalId is null
 */
export function useModalContext(
  modalId: string | null,
): BaseModalState | undefined;
export function useModalContext(modalId: null): BaseModalStore;
export function useModalContext(
  modalId: string | null,
): BaseModalStore | BaseModalState | undefined {
  const modals = useContext(BaseModalContext);

  return useMemo(() => {
    if (modalId === null) {
      return modals;
    }
    return modals[modalId];
  }, [modals, modalId]);
}
