import type { BaseModalHandler, BaseModalHocProps } from "../types";

export interface CreateModalHandlerReturn<P = Record<string, unknown>> {
  show: (args?: Omit<P, keyof BaseModalHocProps>) => Promise<unknown>;
  hide: () => void;
}

export function createModalHandler<
  P = Record<string, unknown>,
>(): CreateModalHandlerReturn<P> {
  return Object.create(null);
}

export interface AntdModalReturn {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  afterClose: () => void;
}

export function antdModal(modal: BaseModalHandler): AntdModalReturn {
  return {
    visible: modal.visible,
    onOk: () => modal.hide(),
    onCancel: () => modal.hide(),
    afterClose: () => {
      // Need to resolve before remove
      modal.resolveHide();
      if (!modal.keepMounted) modal.remove();
    },
  };
}

export interface AntdModalV5Return {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  afterClose: () => void;
}

export function antdModalV5(modal: BaseModalHandler): AntdModalV5Return {
  const { onOk, onCancel, afterClose } = antdModal(modal);

  return {
    open: modal.visible,
    onOk,
    onCancel,
    afterClose,
  };
}

export interface AntdDrawerReturn {
  visible: boolean;
  onClose: () => void;
  afterVisibleChange: (visible: boolean) => void;
}

export function antdDrawer(modal: BaseModalHandler): AntdDrawerReturn {
  return {
    visible: modal.visible,
    onClose: () => modal.hide(),
    afterVisibleChange: (v: boolean) => {
      if (!v) {
        modal.resolveHide();
      }
      !v && !modal.keepMounted && modal.remove();
    },
  };
}

export interface AntdDrawerV5Return {
  open: boolean;
  onClose: () => void;
  afterOpenChange: (visible: boolean) => void;
}

export function antdDrawerV5(modal: BaseModalHandler): AntdDrawerV5Return {
  const { onClose, afterVisibleChange: afterOpenChange } = antdDrawer(modal);

  return {
    open: modal.visible,
    onClose,
    afterOpenChange,
  };
}

export interface MuiDialogReturn {
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}

export function muiDialog(modal: BaseModalHandler): MuiDialogReturn {
  return {
    open: modal.visible,
    onClose: () => modal.hide(),
    onExited: () => {
      modal.resolveHide();
      !modal.keepMounted && modal.remove();
    },
  };
}

export interface MuiDialogV5Return {
  open: boolean;
  onClose: () => void;
  TransitionProps: { onExited: () => void };
}

export function muiDialogV5(modal: BaseModalHandler): MuiDialogV5Return {
  return {
    open: modal.visible,
    onClose: () => modal.hide(),
    TransitionProps: {
      onExited: () => {
        modal.resolveHide();
        !modal.keepMounted && modal.remove();
      },
    },
  };
}

export interface BootstrapDialogReturn {
  show: boolean;
  onHide: () => void;
  onExited: () => void;
}

export function bootstrapDialog(
  modal: BaseModalHandler,
): BootstrapDialogReturn {
  return {
    show: modal.visible,
    onHide: () => modal.hide(),
    onExited: () => {
      modal.resolveHide();
      !modal.keepMounted && modal.remove();
    },
  };
}
