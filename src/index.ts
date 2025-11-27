import { create, ModalDef, ModalHolder } from "./components";
import { useModal } from "./hooks";
import { Provider } from "./providers";
import {
  antdDrawer,
  antdDrawerV5,
  antdModal,
  antdModalV5,
  BaseModalContext,
  bootstrapDialog,
  createModalHandler,
  getModal,
  hide,
  muiDialog,
  muiDialogV5,
  register,
  remove,
  reducer,
  show,
  unregister,
} from "./utils";

export * from "./types";
export * from "./constants";
export * from "./utils";
export * from "./hooks";
export * from "./components";
export * from "./providers";
export type { ModalHandler } from "./components";

const BaseModal = {
  Provider,
  ModalDef,
  ModalHolder,
  BaseModalContext,
  create,
  register,
  unregister,
  getModal,
  show,
  hide,
  remove,
  useModal,
  reducer,
  antdModal,
  antdDrawer,
  muiDialog,
  bootstrapDialog,
  antdModalV5,
  antdDrawerV5,
  muiDialogV5,
  createModalHandler,
};

export default BaseModal;
