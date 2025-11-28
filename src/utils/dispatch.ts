import type { BaseModalAction } from "@/types";

export let dispatch: (action: BaseModalAction) => void = () => {
  throw new Error(
    "No dispatch method detected, did you embed your app with BaseModal.Provider?",
  );
};

export function setDispatch(d: (action: BaseModalAction) => void) {
  dispatch = d;
}
