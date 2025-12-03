/**
 * Structured logging utility for Base Modal
 * Provides debug, info, and warn level logging with namespaced prefixes
 */

const LOG_PREFIX = "[BaseModal]";
const IS_DEV = process.env.NODE_ENV !== "production";

export const logger = {
  /**
   * Debug-level logging for detailed diagnostics
   * Only active in development mode
   */
  debug: (message: string, data?: unknown): void => {
    if (IS_DEV) {
      console.debug(`${LOG_PREFIX}:DEBUG`, message, data ?? "");
    }
  },

  /**
   * Info-level logging for important state transitions
   * Only active in development mode
   */
  info: (message: string, data?: unknown): void => {
    if (IS_DEV) {
      console.info(`${LOG_PREFIX}:INFO`, message, data ?? "");
    }
  },

  /**
   * Warning-level logging for potential issues
   * Active in all environments
   */
  warn: (message: string, data?: unknown): void => {
    console.warn(`${LOG_PREFIX}:WARN`, message, data ?? "");
  },
};
