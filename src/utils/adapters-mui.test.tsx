/// <reference types="vitest/globals" />
import type { ReactNode } from "react";
import { muiDialog, muiDialogV5 } from "../index";
import { TestModal, testHelper } from "../tests";

describe("mui dialog", () => {
  it("test mui dialog helper", async () => {
    const MuiDialog = ({
      open,
      onClose,
      onExited,
      children,
    }: {
      open?: boolean;
      onClose?: () => void;
      onExited?: () => void;
      children?: ReactNode;
    }) => {
      return (
        <TestModal visible={open} onClose={onClose} onExited={onExited}>
          {children}
        </TestModal>
      );
    };
    await testHelper(MuiDialog, muiDialog, "MuiDialogTest");
  });

  it("test mui v5 dialog helper", async () => {
    const MuiDialog = ({
      open,
      onClose,
      TransitionProps: { onExited },
      children,
    }: {
      open?: boolean;
      onClose?: () => void;
      TransitionProps: { onExited?: () => void };
      children?: ReactNode;
    }) => {
      return (
        <TestModal visible={open} onClose={onClose} onExited={onExited}>
          {children}
        </TestModal>
      );
    };
    await testHelper(MuiDialog, muiDialogV5, "MuiDialogTest");
  });
});

