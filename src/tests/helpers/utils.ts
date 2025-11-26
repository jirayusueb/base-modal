import {
  act,
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import React from "react";
import BaseModal, { Provider, create, useModal } from "../../index";
import type { BaseModalHandler } from "../../types";

export const delay = (t: number) =>
  new Promise((resolve) => setTimeout(resolve, t));

export const testUseModal = async (
  modal: BaseModalHandler,
  props: Record<string, unknown> = {},
) => {
  let modalTextElement = screen.queryByText("HocTestModal");
  expect(modalTextElement).not.toBeInTheDocument();

  const resolved: unknown[] = [];
  let rejected: Error | null = null;

  act(() => {
    modal.show(props).then((res = true) => resolved.push(res));
  });

  act(() => {
    modal.show(props).then((res = true) => resolved.push(res));
  });
  modalTextElement = screen.queryByText("HocTestModal");
  expect(modalTextElement).toBeInTheDocument();

  modalTextElement = screen.queryByText("bood");
  expect(modalTextElement).toBeInTheDocument();

  act(() => {
    modal.resolve({ resolved: true });
    modal.hide();
  });

  modalTextElement = screen.queryByText("HocTestModal");
  expect(modalTextElement).toBeInTheDocument();

  await waitForElementToBeRemoved(screen.queryByText("HocTestModal"));

  expect(resolved).toEqual([{ resolved: true }, { resolved: true }]);
  expect(rejected).toBe(null);

  act(() => {
    modal.show().catch((err) => {
      rejected = err;
    });
  });

  act(() => {
    modal.reject(new Error("sample error"));
    modal.hide();
  });

  await waitForElementToBeRemoved(screen.queryByText("HocTestModal"));
  expect(rejected).not.toBe(null);
  expect(rejected).toBeInstanceOf(Error);
  const error = rejected as unknown as Error;
  expect(error.message).toBe("sample error");
};

export const testHelper = async (
  Modal: React.ComponentType<any>,
  helper: (modal: any) => Record<string, unknown> | any,
  text: string,
  keepMounted = false,
) => {
  const HocModal = create(({ name }: { name: string }) => {
    const modal = useModal();
    const modalProps = helper(modal);
    return React.createElement(
      Modal,
      modalProps,
      React.createElement("span", null, name),
    );
  });

  render(
    React.createElement(
      Provider,
      null,
      React.createElement(HocModal, {
        keepMounted,
        id: "helper-modal",
        name: text,
      }),
    ),
  );

  let modalTextElement = screen.queryByText(text);
  if (keepMounted) {
    expect(modalTextElement).toBeInTheDocument();
  } else {
    expect(modalTextElement).not.toBeInTheDocument();
  }

  act(() => {
    BaseModal.show("helper-modal", { name: text });
  });

  modalTextElement = screen.queryByText(text);
  expect(modalTextElement).toBeInTheDocument();

  act(() => {
    fireEvent.click(screen.getByText("Close"));
  });
  modalTextElement = screen.queryByText(text);
  expect(modalTextElement).toBeInTheDocument();

  if (keepMounted) {
    await delay(50);
    expect(screen.queryByText(text)).toBeInTheDocument();
  } else {
    await waitForElementToBeRemoved(() => screen.queryByText(text));
  }
};
