/**
 * Base error class for all Base Modal errors.
 * Provides error codes and context data for better error handling.
 */
export class BaseModalError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "BaseModalError";
    this.code = code;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when a modal with the given ID is not found in the registry.
 */
export class ModalNotFoundError extends BaseModalError {
  constructor(modalId: string) {
    super(
      `Modal with id "${modalId}" not found. Please check the id or if it is registered or declared via JSX.`,
      "MODAL_NOT_FOUND",
      { modalId },
    );
    this.name = "ModalNotFoundError";
  }
}

/**
 * Error thrown when trying to register a modal with an ID that already exists.
 */
export class ModalAlreadyExistsError extends BaseModalError {
  constructor(modalId: string) {
    super(
      `Modal with id "${modalId}" already exists.`,
      "MODAL_ALREADY_EXISTS",
      { modalId },
    );
    this.name = "ModalAlreadyExistsError";
  }
}

/**
 * Error thrown when a modal ID cannot be resolved.
 */
export class ModalIdNotFoundError extends BaseModalError {
  constructor() {
    super(
      "No modal id found in BaseModal.useModal.",
      "MODAL_ID_NOT_FOUND",
    );
    this.name = "ModalIdNotFoundError";
  }
}

/**
 * Error thrown when a handler is null in ModalHolder.
 */
export class ModalHandlerNotFoundError extends BaseModalError {
  constructor() {
    super(
      "No handler found in BaseModal.ModalHolder.",
      "MODAL_HANDLER_NOT_FOUND",
    );
    this.name = "ModalHandlerNotFoundError";
  }
}

/**
 * Error thrown when dispatch is called without Provider being initialized.
 */
export class DispatchNotInitializedError extends BaseModalError {
  constructor() {
    super(
      "No dispatch method detected, did you embed your app with BaseModal.Provider?",
      "DISPATCH_NOT_INITIALIZED",
    );
    this.name = "DispatchNotInitializedError";
  }
}

