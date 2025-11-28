import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import type { ComponentType } from "react";
import BaseModal, { create, Provider, register, useModal } from "./index";
import { TestModal } from "./tests";

const HocTestModal = create(({ name = "nate" }: { name?: string }) => {
  const modal = useModal();
  const remove = () => modal.remove();

  return (
    <TestModal visible={modal.visible} onExited={remove} onClose={remove}>
      <span>{name}</span>
      <div>HocTestModal</div>
    </TestModal>
  );
});

describe("global API", () => {
  it("show/hide modal by id with globally API", async () => {
    const hocTestModalId = "hoc-test-modal";
    register(hocTestModalId, HocTestModal);
    render(<Provider />);
    let modalTextElement = screen.queryByText("HocTestModal");
    expect(modalTextElement).not.toBeInTheDocument();

    act(() => {
      BaseModal.show(hocTestModalId);
    });
    modalTextElement = screen.queryByText("HocTestModal");
    expect(modalTextElement).toBeInTheDocument();

    act(() => {
      BaseModal.hide(hocTestModalId);
    });
    modalTextElement = screen.queryByText("HocTestModal");
    expect(modalTextElement).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByText("HocTestModal"));
  });

  it("show/hide modal by component with globally API", async () => {
    const HocTestModal = create(({ name = "nate" }: { name?: string }) => {
      const modal = useModal();
      const remove = () => modal.remove();

      return (
        <TestModal visible={modal.visible} onExited={remove} onClose={remove}>
          <span>{name}</span>
          <div>HocTestModal</div>
        </TestModal>
      );
    });
    render(<Provider />);
    let modalTextElement = screen.queryByText("HocTestModal");
    expect(modalTextElement).not.toBeInTheDocument();

    act(() => {
      BaseModal.show(HocTestModal as ComponentType<{ name?: string }>);
    });
    modalTextElement = screen.queryByText("HocTestModal");
    expect(modalTextElement).toBeInTheDocument();

    act(() => {
      BaseModal.hide(HocTestModal);
    });
    modalTextElement = screen.queryByText("HocTestModal");
    expect(modalTextElement).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByText("HocTestModal"));
  });

  it("hide an invalid id does nothing", () => {
    render(<Provider />);
    act(() => {
      BaseModal.hide("abc");
    });
  });

  it("use invalid modal id only show warning msg.", () => {
    render(<Provider />);
    let warnMsg: string | null = null;
    console.warn = (msg: string) => {
      warnMsg = msg;
    };
    act(() => {
      BaseModal.show("invalidid");
    });
    expect(warnMsg).toBe(
      "No modal found for id: invalidid. Please check the id or if it is registered or declared via JSX.",
    );
  });

  it("modal with defaultVisible prop", async () => {
    render(
      <Provider>
        <HocTestModal defaultVisible id="default-visible-modal" />
      </Provider>,
    );

    const modalTextElement = screen.queryByText("HocTestModal");
    expect(modalTextElement).toBeInTheDocument();

    act(() => {
      BaseModal.hide("default-visible-modal");
    });

    await waitForElementToBeRemoved(screen.queryByText("HocTestModal"));
  });
});
