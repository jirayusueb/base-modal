// biome-ignore lint/style/useImportType: React is used as value
import React, { useContext } from "react";
import { ALREADY_MOUNTED, MODAL_REGISTRY } from "../utils/constants";
import { BaseModalContext } from "../utils/contexts";

export const BaseModalPlaceholder: React.FC = () => {
  const modals = useContext(BaseModalContext);
  const visibleModalIds = Object.keys(modals).filter((id) => !!modals[id]);
  for (const id of visibleModalIds) {
    if (!MODAL_REGISTRY[id] && !ALREADY_MOUNTED[id]) {
      console.warn(
        `No modal found for id: ${id}. Please check the id or if it is registered or declared via JSX.`,
      );
      return;
    }
  }

  const toRender = visibleModalIds
    .filter((id) => MODAL_REGISTRY[id])
    .map((id) => ({
      id,
      ...MODAL_REGISTRY[id],
    }));

  return (
    <>
      {toRender.map((t) => (
        <t.comp key={t.id} id={t.id} {...t.props} />
      ))}
    </>
  );
};
