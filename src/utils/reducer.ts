import { produce } from "immer";
import type { BaseModalAction, BaseModalStore } from "../types";
import { ALREADY_MOUNTED, initialState } from "../constants";

export function reducer(
  state: BaseModalStore = initialState,
  action: BaseModalAction,
): BaseModalStore {
  return produce(state, (draft) => {
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
}

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
