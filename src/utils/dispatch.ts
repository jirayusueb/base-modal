import type { BaseModalAction } from "@/types";
import { DispatchNotInitializedError } from "./errors";

export let dispatch: (action: BaseModalAction) => void = () => {
  throw new DispatchNotInitializedError();
};

export function setDispatch(d: (action: BaseModalAction) => void) {
  dispatch = d;
}
