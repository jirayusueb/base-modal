import { logger } from "./logger";
import type { ModalState, Observer } from "../types/patterns";

/**
 * Concrete Observer implementation for React components
 * Bridges the gap between the Registry's Observer pattern and React's state updates
 */
export class ModalStateObserver implements Observer<ModalState> {
  private id: string;
  private onUpdate: (state: ModalState) => void;

  /**
   * @param id - The modal ID being observed
   * @param onUpdate - Callback function to trigger React re-render (usually setState)
   */
  constructor(id: string, onUpdate: (state: ModalState) => void) {
    this.id = id;
    this.onUpdate = onUpdate;
    logger.debug(`ModalStateObserver created for ${id}`);
  }

  /**
   * Called by the Registry when state changes
   */
  update(state: ModalState): void {
    // Log the notification (satisfies FR-006/T010)
    logger.debug(`Observer for ${this.id} received update`, {
      visible: state.visible,
      keepMounted: state.keepMounted,
    });

    this.onUpdate(state);
  }
}
