import React, { type ReactNode } from "react";
import { bootstrapDialog } from "../../index";
import { TestModal } from "../helpers/test-modal";
import { testHelper } from "../helpers/utils";

test("test bootstrap dialog helper", async () => {
  const BootstrapDialog = ({
    show,
    onHide,
    onExited,
    children,
  }: {
    show?: boolean;
    onHide?: () => void;
    onExited?: () => void;
    children?: ReactNode;
  }) => {
    return (
      <TestModal visible={show} onClose={onHide} onExited={onExited}>
        {children}
      </TestModal>
    );
  };
  await testHelper(BootstrapDialog, bootstrapDialog, "BootstrapDialogTest");
});
