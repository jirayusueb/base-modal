import type React from "react";
import { useEffect } from "react";
import { ModalRegistry } from "@/utils/registry";

interface ModalDefProps<P = Record<string, unknown>> {
  id: string;
  component: React.ComponentType<P>;
}

/**
 * Declarative way to register a modal.
 * @param id - The id of the modal.
 * @param component - The modal Component.
 * @returns
 */
export function ModalDef<P = Record<string, unknown>>({
  id,
  component,
}: ModalDefProps<P>) {
  useEffect(() => {
    ModalRegistry.getInstance().register(id, {
      id,
      comp: component as React.ComponentType<unknown>, // Store component for rendering
      visible: false,
      keepMounted: false,
      props: {},
      promise: null,
      resolvedValue: undefined,
    });

    return () => {
      ModalRegistry.getInstance().unregister(id);
    };
  }, [id, component]);

  return null;
}
