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
  bootstrapDialog,
  create,
  Provider,
  useModal,
} from "@/index";
import { TestModal, testHelper } from "@/tests";

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

  it("test bootstrap dialog with BaseModal.show() using component directly", async () => {
    // Given: BootstrapDialog component and modal created with create()
    render(<Provider />);
    const HocBootstrapDialog = create(({ name }: { name?: string }) => {
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
      BaseModal.show(HocBootstrapDialog, { name: "BootstrapDialogTest" });
    });

    // Then: Modal should be visible
    // Then: Modal should be visible
    await waitFor(() => {
      expect(screen.queryByText("BootstrapDialogTest")).toBeInTheDocument();
    });

    // When: Close button is clicked
    act(() => {
      fireEvent.click(screen.getByText("Close"));
    });

    // Then: Modal should be removed
    const element = screen.queryByText("BootstrapDialogTest");
    if (element) {
      await waitForElementToBeRemoved(() => screen.queryByText("BootstrapDialogTest"));
    }
  });
});
