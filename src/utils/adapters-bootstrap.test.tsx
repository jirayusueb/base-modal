/// <reference types="vitest/globals" />
import type { ReactNode } from "react";
import { bootstrapDialog } from "../index";
import { TestModal, testHelper } from "../tests";

describe("bootstrap dialog", () => {
  it("test bootstrap dialog helper", async () => {
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
});

