import type { BaseModalAction, BaseModalStore } from "../types";
import { ALREADY_MOUNTED, initialState } from "./constants";

export const reducer = (
  state: BaseModalStore = initialState,
  action: BaseModalAction,
): BaseModalStore => {
  switch (action.type) {
    case "base-modal/show": {
      const { modalId, args } = action.payload;
      return {
        ...state,
        [modalId]: {
          ...state[modalId],
          id: modalId,
          args,
          // If modal is not mounted, mount it first then make it visible.
          // There is logic inside HOC wrapper to make it visible after its first mount.
          // This mechanism ensures the entering transition.
          visible: !!ALREADY_MOUNTED[modalId],
          delayVisible: !ALREADY_MOUNTED[modalId],
        },
      };
    }
    case "base-modal/hide": {
      const { modalId } = action.payload;
      if (!state[modalId]) return state;
      return {
        ...state,
        [modalId]: {
          ...state[modalId],
          visible: false,
        },
      };
    }
    case "base-modal/remove": {
      const { modalId } = action.payload;
      const newState = { ...state };
      delete newState[modalId];
      return newState;
    }
    case "base-modal/set-flags": {
      const { modalId, flags } = action.payload;
      return {
        ...state,
        [modalId]: {
          ...state[modalId],
          ...flags,
        },
      };
    }
    default:
      return state;
  }
};

export function showModal(
  modalId: string,
  args?: Record<string, unknown>,
): BaseModalAction {
  return {
    type: "base-modal/show",
    payload: {
      modalId,
      args,
    },
  };
}

export function setModalFlags(
  modalId: string,
  flags: Record<string, unknown>,
): BaseModalAction {
  return {
    type: "base-modal/set-flags",
    payload: {
      modalId,
      flags,
    },
  };
}

export function hideModal(modalId: string): BaseModalAction {
  return {
    type: "base-modal/hide",
    payload: {
      modalId,
    },
  };
}

export function removeModal(modalId: string): BaseModalAction {
  return {
    type: "base-modal/remove",
    payload: {
      modalId,
    },
  };
}
