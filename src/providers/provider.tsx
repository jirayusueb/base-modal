import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BaseModalPlaceholder } from "@/components";
import { ALREADY_MOUNTED, initialState } from "@/constants";
import type { BaseModalAction, BaseModalStore } from "@/types";
import type { ModalState } from "@/types/patterns";
import { BaseModalContext } from "@/utils/contexts";
import { setDispatch } from "@/utils/dispatch";
import { logger } from "@/utils/logger";
import { ModalRegistry } from "@/utils/registry";

interface ProviderProps {
  children?: ReactNode;
  dispatch?: (action: BaseModalAction) => void;
  modals?: BaseModalStore;
}

export function Provider({
  children,
  dispatch: givenDispatch,
  modals: givenModals,
}: ProviderProps) {
  // Local state synced with Registry for Context compatibility
  const [modals, setModals] = useState<BaseModalStore>(
    givenModals ?? initialState,
  );

  // Sync with Registry
  const registry = ModalRegistry.getInstance();
  // Set immediately during render to ensure it's available for children effects
  registry.setProviderMounted(true);

  useEffect(() => {
    // Initial sync
    const initialState = registry.getAll() as unknown as BaseModalStore;
    setModals(initialState);

    // Subscribe to global changes
    const update = () => {
      const newState = registry.getAll() as unknown as BaseModalStore;
      setModals(newState);
    };

    const unsubscribe = registry.subscribeToAll({ update });

    return () => {
      unsubscribe();
      registry.setProviderMounted(false);
    };
  }, []);

  // Dispatch adapter for backward compatibility
  // Maps legacy actions to Registry method calls
  const dispatch = useCallback(
    (action: BaseModalAction) => {
      const registry = ModalRegistry.getInstance();
      const { type, payload } = action;

      logger.debug("Provider dispatching action to Registry", action);

      switch (type) {
        case "base-modal/show": {
          const { modalId, args } = payload;
          // Legacy behavior: create entry if missing
          if (!registry.getState(modalId)) {
            // Two-phase mounting: check if already mounted
            const isAlreadyMounted = !!ALREADY_MOUNTED[modalId];

            registry.register(modalId, {
              id: modalId,
              visible: isAlreadyMounted, // Only visible if already mounted
              delayVisible: !isAlreadyMounted, // Delay if not mounted yet
              props: args as Record<string, unknown>,
              keepMounted: false,
              promise: null,
              resolvedValue: undefined,
            });
          } else {
            registry.updateState(modalId, {
              visible: true,
              delayVisible: false, // Clear delayVisible when showing
              props: args as Record<string, unknown>,
            });
          }
          break;
        }
        case "base-modal/hide": {
          const { modalId } = payload;
          registry.updateState(modalId, { visible: false });
          break;
        }
        case "base-modal/remove": {
          const { modalId } = payload;
          registry.unregister(modalId);
          break;
        }
        case "base-modal/set-flags": {
          const { modalId, flags } = payload;
          registry.updateState(modalId, flags as Partial<ModalState>);
          break;
        }
      }

      if (givenDispatch) {
        givenDispatch(action);
      }
    },
    [givenDispatch],
  );

  // Register dispatch globally
  useEffect(() => {
    setDispatch(dispatch);
  }, [dispatch]);

  // Memoize context value
  const contextValue = useMemo(() => modals, [modals]);

  return (
    <BaseModalContext.Provider value={contextValue}>
      {children}
      <BaseModalPlaceholder />
    </BaseModalContext.Provider>
  );
}
