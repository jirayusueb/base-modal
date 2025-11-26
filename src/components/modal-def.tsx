// biome-ignore lint/style/useImportType: React is used as value
import React, { useEffect } from "react";
import { register, unregister } from "../utils/modal";

/**
 * Declarative way to register a modal.
 * @param id - The id of the modal.
 * @param component - The modal Component.
 * @returns
 */
export const ModalDef: React.FC<Record<string, unknown>> = ({
  id,
  component,
}: {
  id: string;
  component: React.FC<any>;
}) => {
  useEffect(() => {
    register(id, component);
    return () => {
      unregister(id);
    };
  }, [id, component]);
  return null;
};
