import { memo, useMemo } from "react";
import React from "react";
import { ALREADY_MOUNTED, MODAL_REGISTRY } from "../constants";
import { useModalContext } from "../utils/contexts";

function BaseModalPlaceholderComponent() {
  // Get all modals - this component needs to see all modals to render them
  // Using null to get the full modals object
  const modals = useModalContext(null);

  const visibleModalIds = useMemo(
    () => Object.keys(modals).filter((id) => !!modals[id]),
    [modals],
  );

  const toRender = useMemo(() => {
    // Check for missing modals first
    for (const id of visibleModalIds) {
      if (!MODAL_REGISTRY[id] && !ALREADY_MOUNTED[id]) {
        console.warn(
          `No modal found for id: ${id}. Please check the id or if it is registered or declared via JSX.`,
        );
        return [];
      }
    }

    return visibleModalIds
      .filter((id) => MODAL_REGISTRY[id])
      .map((id) => ({
        id,
        ...MODAL_REGISTRY[id],
      }));
  }, [visibleModalIds]);

  if (toRender.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      {toRender.map((t) => (
        <t.comp key={t.id} id={t.id} {...t.props} />
      ))}
    </React.Fragment>
  );
}

export const BaseModalPlaceholder = memo(BaseModalPlaceholderComponent);
