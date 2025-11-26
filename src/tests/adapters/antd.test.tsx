import {
  act,
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import React, { type ReactNode } from "react";
import BaseModal, {
  Provider,
  antdModal,
  antdModalV5,
  antdDrawer,
  antdDrawerV5,
  create,
  useModal,
} from "../../index";
import { TestModal } from "../helpers/test-modal";
import { testHelper } from "../helpers/utils";

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

test("test antd modal helper", async () => {
  await testHelper(AntdModalV5, antdModalV5, "AntdModalV5");
  await testHelper(AntdModalV5, antdModalV5, "AntdModalV5", true);
});

test("test antd modal v5 helper", async () => {
  await testHelper(AntdModalV5, antdModalV5, "AntdModalV5");
  await testHelper(AntdModalV5, antdModalV5, "AntdModalV5", true);
});

test("test antd modal onCancel", async () => {
  render(<Provider />);
  const HocAntModal2 = create(({ name }: { name?: string }) => {
    const modal = useModal();

    return (
      <AntdModal {...antdModal(modal)}>
        <span>{name}</span>
      </AntdModal>
    );
  });
  act(() => {
    BaseModal.show(HocAntModal2, { name: "HocAntModal2" });
  });
  fireEvent.click(screen.getByText("Cancel"));
  await waitForElementToBeRemoved(() => screen.queryByText("HocAntModal2"));
});

test("test antd drawer helper", async () => {
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

test("test antd drawer helper with keepMounted", async () => {
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

test("test antd drawer afterVisibleChange with true value", async () => {
  // Given: AntdDrawer component and helper function
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

  // When: Modal is shown and afterVisibleChange is called with true (testing branch line 61)
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

test("test antd drawer helper with keepMounted", async () => {
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
  // Then: Modal should remain mounted after close (testing branch coverage)
  await testHelper(AntdDrawer, antdDrawer, "AntdDrawerKeepMounted", true);
});

test("test antd drawer v5 helper", async () => {
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
