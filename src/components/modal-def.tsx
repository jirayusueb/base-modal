import type React from "react";
import { useEffect } from "react";
import { register, unregister } from "../utils/modal";

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
    register(id, component);

    return () => {
      unregister(id);
    };
  }, [id, component]);

  return null;
}
