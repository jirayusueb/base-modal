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
  antdDrawer,
  antdDrawerV5,
  antdModal,
  antdModalV5,
  create,
  Provider,
  useModal,
} from "@/index";
import { TestModal, testHelper } from "@/tests";

const AntdModal = ({
  visible,
  onOk,
  onCancel,
  afterClose,
  children,
}: {
  visible?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  afterClose?: () => void;
  children?: ReactNode;
}) => {
  return (
    <TestModal
      visible={visible}
      onClose={onOk}
      onCancel={onCancel}
      onExited={afterClose}
    >
      {children}
    </TestModal>
  );
};

const AntdModalV5 = ({
  open,
  onOk,
  onCancel,
  afterClose,
  children,
}: {
  open?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  afterClose?: () => void;
  children?: ReactNode;
}) => {
  return (
    <TestModal
      visible={open}
      onClose={onOk}
      onCancel={onCancel}
      onExited={afterClose}
    >
      {children}
    </TestModal>
  );
};

describe("antd modal", () => {
  it("test antd modal helper", async () => {
    await testHelper(AntdModalV5, antdModalV5, "AntdModalV5");
    await testHelper(AntdModalV5, antdModalV5, "AntdModalV5", true);
  });

  it("test antd modal onCancel", async () => {
    // Given: AntdModal component and modal created with create()
    render(<Provider />);
    const HocAntModal2 = create(({ name }: { name?: string }) => {
      const modal = useModal();

      return (
        <AntdModal {...antdModal(modal)}>
          <span>{name}</span>
        </AntdModal>
      );
    });

    // When: BaseModal.show() is called with component and args (no type assertion needed)
    act(() => {
      BaseModal.show(HocAntModal2, { name: "HocAntModal2" });
    });

    // Then: Modal should be visible
    // Then: Modal should be visible
    await waitFor(() => {
      expect(screen.queryByText("HocAntModal2")).toBeInTheDocument();
    });

    // When: Cancel button is clicked
    fireEvent.click(screen.getByText("Cancel"));

    // Then: Modal should be removed
    const element = screen.queryByText("HocAntModal2");
    if (element) {
      await waitForElementToBeRemoved(() => screen.queryByText("HocAntModal2"));
    }
  });

  it("test antd modal v5 with BaseModal.show() using component directly", async () => {
    // Given: AntdModalV5 component and modal created with create()
    render(<Provider />);
    const HocAntModalV5 = create(({ name }: { name?: string }) => {
      const modal = useModal();

      return (
        <AntdModalV5 {...antdModalV5(modal)}>
          <span>{name}</span>
        </AntdModalV5>
      );
    });

    // When: BaseModal.show() is called with component and args (no type assertion needed)
    act(() => {
      BaseModal.show(HocAntModalV5, { name: "AntdModalV5Test" });
    });

    // Then: Modal should be visible
    // Then: Modal should be visible
    await waitFor(() => {
      expect(screen.queryByText("AntdModalV5Test")).toBeInTheDocument();
    });

    // When: Close button is clicked
    act(() => {
      fireEvent.click(screen.getByText("Close"));
    });

    // Then: Modal should be removed
    const element = screen.queryByText("AntdModalV5Test");
    if (element) {
      await waitForElementToBeRemoved(() => screen.queryByText("AntdModalV5Test"));
    }
  });
});

describe("antd drawer", () => {
  it("test antd drawer helper", async () => {
    const AntdDrawer = ({
      visible,
      onClose,
      afterVisibleChange,
      children,
    }: {
      visible?: boolean;
      onClose?: () => void;
      afterVisibleChange?: (visible: boolean) => void;
      children?: ReactNode;
    }) => {
      return (
        <TestModal
          visible={visible}
          onClose={onClose}
          onExited={() => afterVisibleChange?.(false)}
        >
          {children}
        </TestModal>
      );
    };
    await testHelper(AntdDrawer, antdDrawer, "AntdDrawerTest");
  });

  it("test antd drawer helper with keepMounted", async () => {
    // Given: AntdDrawer component and helper function
    const AntdDrawer = ({
      visible,
      onClose,
      afterVisibleChange,
      children,
    }: {
      visible?: boolean;
      onClose?: () => void;
      afterVisibleChange?: (visible: boolean) => void;
      children?: ReactNode;
    }) => {
      return (
        <TestModal
          visible={visible}
          onClose={onClose}
          onExited={() => afterVisibleChange?.(false)}
        >
          {children}
        </TestModal>
      );
    };
    // When: testHelper is called with keepMounted=true
    // Then: Modal should remain mounted after close (testing branch coverage for line 64)
    await testHelper(AntdDrawer, antdDrawer, "AntdDrawerKeepMounted", true);
  });

  it("test antd drawer afterVisibleChange with true value", async () => {
    // Given: AntdDrawer component and modal created with create()
    render(<Provider />);
    const HocAntDrawer = create(({ name }: { name?: string }) => {
      const modal = useModal();
      const drawerProps = antdDrawer(modal);

      return (
        <TestModal
          visible={drawerProps.visible}
          onClose={drawerProps.onClose}
          onExited={() => drawerProps.afterVisibleChange(false)}
        >
          <span>{name}</span>
        </TestModal>
      );
    });

    // When: BaseModal.show() is called with component and args (no type assertion needed)
    // and afterVisibleChange is called with true (testing branch line 61)
    act(() => {
      BaseModal.show(HocAntDrawer, { name: "DrawerTest" });
    });

    // Then: afterVisibleChange(true) should not call resolveHide (testing if (!v) branch)
    const drawerProps = antdDrawer({
      visible: true,
      keepMounted: false,
      resolveHide: () => {
        throw new Error("resolveHide should not be called when v is true");
      },
      remove: () => {},
      hide: () => {},
    } as any);

    // Call with true to test the else branch of if (!v)
    drawerProps.afterVisibleChange(true);

    // Cleanup
    act(() => {
      BaseModal.hide(HocAntDrawer);
    });
  });

  it("test antd drawer v5 helper", async () => {
    const AntdDrawerV5 = ({
      open,
      onClose,
      afterOpenChange,
      children,
    }: {
      open?: boolean;
      onClose?: () => void;
      afterOpenChange?: (open: boolean) => void;
      children?: ReactNode;
    }) => {
      return (
        <TestModal
          visible={open}
          onClose={onClose}
          onExited={() => afterOpenChange?.(false)}
        >
          {children}
        </TestModal>
      );
    };
    await testHelper(AntdDrawerV5, antdDrawerV5, "AntdDrawerV5Test");
  });

  it("test antd drawer v5 with BaseModal.show() using component directly", async () => {
    // Given: AntdDrawerV5 component and modal created with create()
    render(<Provider />);
    const HocAntDrawerV5 = create(({ name }: { name?: string }) => {
      const modal = useModal();
      const drawerProps = antdDrawerV5(modal);

      return (
        <TestModal
          visible={drawerProps.open}
          onClose={drawerProps.onClose}
          onExited={() => drawerProps.afterOpenChange(false)}
        >
          <span>{name}</span>
        </TestModal>
      );
    });

    // When: BaseModal.show() is called with component and args (no type assertion needed)
    act(() => {
      BaseModal.show(HocAntDrawerV5, { name: "AntdDrawerV5Test" });
    });

    // Then: Modal should be visible
    // Then: Modal should be visible
    await waitFor(() => {
      expect(screen.queryByText("AntdDrawerV5Test")).toBeInTheDocument();
    });

    // When: Close button is clicked
    act(() => {
      fireEvent.click(screen.getByText("Close"));
    });

    // Then: Modal should be removed
    const element = screen.queryByText("AntdDrawerV5Test");
    if (element) {
      await waitForElementToBeRemoved(() => screen.queryByText("AntdDrawerV5Test"));
    }
  });
});
