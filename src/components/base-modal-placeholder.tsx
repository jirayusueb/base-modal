import React, { useMemo } from "react";
import { ALREADY_MOUNTED } from "@/constants";
import { useModalContext } from "@/utils/contexts";
import { ModalRegistry } from "@/utils/registry";

function BaseModalPlaceholderComponent() {
  // Get all modals - this component needs to see all modals to render them
  // Using null to get the full modals object
  const modals = useModalContext(null);
  console.error('[DEBUG] BaseModalPlaceholder render, modals:', Object.keys(modals));

  const visibleModalIds = useMemo(
    () =>
      Object.keys(modals).filter((id) => {
        const m = modals[id];
        // Render if: visible, keepMounted, delayVisible, or isMounted (active)
        return !!m && (m.visible || m.keepMounted || m.delayVisible || m.isMounted);
      }),
    [modals],
  );

  const toRender = useMemo(() => {
    const registry = ModalRegistry.getInstance();
    // Check for missing modals first
    for (const id of visibleModalIds) {
      const state = registry.getState(id);
      // Only warn if state is missing and modal is not already mounted (via JSX)
      if (!state && !ALREADY_MOUNTED[id]) {
        console.warn(
          `No modal found for id: ${id}. Please check the id or if it is registered or declared via JSX.`,
        );
        return [];
      }
      // If modal is ALREADY_MOUNTED but has no comp, that's OK - it's in the JSX tree
      // If modal is NOT already mounted but has no comp, that's also a problem
      if (!ALREADY_MOUNTED[id] && state && !state.comp) {
        console.warn(
          `No modal component found for id: ${id}. Please register it with a component or declare it via JSX.`,
        );
        return [];
      }
    }

    return visibleModalIds
      .filter((id) => registry.getState(id))
      .map((id) => {
        const state = registry.getState(id);
        return {
          id,
          ...state,
          // Ensure comp is present (it should be if registered)
          comp: state?.comp || (() => null),
        };
      });
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

// Don't use memo() here - we need to re-render when context changes
export const BaseModalPlaceholder = BaseModalPlaceholderComponent;
