import type React from "react";
import type { BaseModalHandler, BaseModalHocProps } from "../types";

export function createModalHandler<T extends React.ComponentType<any>>(): {
  show: (
    args?: Omit<React.ComponentProps<T>, keyof BaseModalHocProps>,
  ) => Promise<unknown>;
  hide: () => void;
} {
  return Object.create(null);
}

export const antdModal = (
  modal: BaseModalHandler,
): {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  afterClose: () => void;
} => {
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
};

export const antdModalV5 = (
  modal: BaseModalHandler,
): {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  afterClose: () => void;
} => {
  const { onOk, onCancel, afterClose } = antdModal(modal);
  return {
    open: modal.visible,
    onOk,
    onCancel,
    afterClose,
  };
};

export const antdDrawer = (
  modal: BaseModalHandler,
): {
  visible: boolean;
  onClose: () => void;
  afterVisibleChange: (visible: boolean) => void;
} => {
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
};

export const antdDrawerV5 = (
  modal: BaseModalHandler,
): {
  open: boolean;
  onClose: () => void;
  afterOpenChange: (visible: boolean) => void;
} => {
  const { onClose, afterVisibleChange: afterOpenChange } = antdDrawer(modal);
  return {
    open: modal.visible,
    onClose,
    afterOpenChange,
  };
};

export const muiDialog = (
  modal: BaseModalHandler,
): { open: boolean; onClose: () => void; onExited: () => void } => {
  return {
    open: modal.visible,
    onClose: () => modal.hide(),
    onExited: () => {
      modal.resolveHide();
      !modal.keepMounted && modal.remove();
    },
  };
};

export const muiDialogV5 = (
  modal: BaseModalHandler,
): {
  open: boolean;
  onClose: () => void;
  TransitionProps: { onExited: () => void };
} => {
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
};

export const bootstrapDialog = (
  modal: BaseModalHandler,
): { show: boolean; onHide: () => void; onExited: () => void } => {
  return {
    show: modal.visible,
    onHide: () => modal.hide(),
    onExited: () => {
      modal.resolveHide();
      !modal.keepMounted && modal.remove();
    },
  };
};
