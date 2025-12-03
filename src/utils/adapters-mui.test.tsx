import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import type { ReactNode } from "react";
import BaseModal, {
  create,
  muiDialog,
  muiDialogV5,
  Provider,
  useModal,
} from "@/index";
import { TestModal, testHelper } from "@/tests";

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

  it("test mui dialog with BaseModal.show() using component directly", async () => {
    // Given: MuiDialog component and modal created with create()
    render(<Provider />);
    const HocMuiDialog = create(({ name }: { name?: string }) => {
      const modal = useModal();

      return (
        <TestModal
          visible={modal.visible}
          onClose={() => modal.hide()}
          onExited={() => modal.remove()}
        >
          <span>{name}</span>
        </TestModal>
      );
    });

    // When: BaseModal.show() is called with component and args (no type assertion needed)
    act(() => {
      BaseModal.show(HocMuiDialog, { name: "MuiDialogTest" });
    });

    // Then: Modal should be visible
    // Then: Modal should be visible
    await waitFor(() => {
      expect(screen.queryByText("MuiDialogTest")).toBeInTheDocument();
    });

    // When: Close button is clicked
    act(() => {
      fireEvent.click(screen.getByText("Close"));
    });

    // Then: Modal should be removed
    const element = screen.queryByText("MuiDialogTest");
    if (element) {
      await waitForElementToBeRemoved(() => screen.queryByText("MuiDialogTest"));
    }
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

  it("test mui v5 dialog with BaseModal.show() using component directly", async () => {
    // Given: MuiDialogV5 component and modal created with create()
    render(<Provider />);
    const HocMuiDialogV5 = create(({ name }: { name?: string }) => {
      const modal = useModal();
      const dialogProps = muiDialogV5(modal);

      return (
        <TestModal
          visible={dialogProps.open}
          onClose={dialogProps.onClose}
          onExited={() => dialogProps.TransitionProps.onExited?.()}
        >
          <span>{name}</span>
        </TestModal>
      );
    });

    // When: BaseModal.show() is called with component and args (no type assertion needed)
    act(() => {
      BaseModal.show(HocMuiDialogV5, { name: "MuiDialogV5Test" });
    });

    // Then: Modal should be visible
    // Then: Modal should be visible
    await waitFor(() => {
      expect(screen.queryByText("MuiDialogV5Test")).toBeInTheDocument();
    });

    // When: Close button is clicked
    act(() => {
      fireEvent.click(screen.getByText("Close"));
    });

    // Then: Modal should be removed
    const element = screen.queryByText("MuiDialogV5Test");
    if (element) {
      await waitForElementToBeRemoved(() => screen.queryByText("MuiDialogV5Test"));
    }
  });
});
