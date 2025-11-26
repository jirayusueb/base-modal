import type React from "react";
import type { BaseModalAction } from "../types";

export let dispatch: React.Dispatch<BaseModalAction> = () => {
  throw new Error(
    "No dispatch method detected, did you embed your app with BaseModal.Provider?",
  );
};

export function setDispatch(d: React.Dispatch<BaseModalAction>) {
  dispatch = d;
}
