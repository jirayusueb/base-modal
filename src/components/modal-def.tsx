// biome-ignore lint/style/useImportType: React is used as value
import React, { useEffect } from "react";
import { register, unregister } from "../utils/modal";

interface ModalDefProps {
  id: string;
  component: React.FC<any>;
}

/**
 * Declarative way to register a modal.
 * @param id - The id of the modal.
 * @param component - The modal Component.
 * @returns
 */
export function ModalDef({ id, component }: ModalDefProps) {
  useEffect(() => {
    register(id, component);

    return () => {
      unregister(id);
    };
  }, [id, component]);

  return null;
}
