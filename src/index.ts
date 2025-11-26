import { ModalDef } from "./components/modal-def";
import { ModalHolder } from "./components/modal-holder";
import { create } from "./components/create";
import { useModal } from "./hooks/use-modal";
import { Provider } from "./providers/provider";
import {
  antdDrawer,
  antdDrawerV5,
  antdModal,
  antdModalV5,
  bootstrapDialog,
  createModalHandler,
  muiDialog,
  muiDialogV5,
} from "./utils/adapters";
import { BaseModalContext } from "./utils/contexts";
import {
  getModal,
  hide,
  register,
  remove,
  show,
  unregister,
} from "./utils/modal";
import { reducer } from "./utils/reducer";

export * from "./types";
export * from "./utils/constants";
export * from "./utils/contexts";
export * from "./utils/reducer";
export * from "./utils/modal";
export * from "./hooks/use-modal";
export * from "./components/create";
export * from "./components/modal-def";
export * from "./components/modal-holder";
export * from "./providers/provider";
export * from "./utils/adapters";

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
