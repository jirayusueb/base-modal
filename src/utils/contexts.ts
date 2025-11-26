import React from "react";
import type { BaseModalStore } from "../types";
import { initialState } from "./constants";

export const BaseModalContext =
  React.createContext<BaseModalStore>(initialState);
export const BaseModalIdContext = React.createContext<string | null>(null);
