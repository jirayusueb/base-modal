import {
  BaseModalError,
  DispatchNotInitializedError,
  ModalAlreadyExistsError,
  ModalHandlerNotFoundError,
  ModalIdNotFoundError,
  ModalNotFoundError,
} from "./errors";

/**
 * Test Perspective Table for Error Types
 *
 * | Case ID | Input / Precondition | Perspective (Equivalence / Boundary) | Expected Result | Notes |
 * |---------|----------------------|--------------------------------------|-----------------|-------|
 * | TC-N-01 | BaseModalError with message and code | Equivalence - normal | Error created with correct properties | - |
 * | TC-N-02 | ModalNotFoundError with modalId | Equivalence - normal | Error created with MODAL_NOT_FOUND code | - |
 * | TC-N-03 | ModalIdNotFoundError | Equivalence - normal | Error created with MODAL_ID_NOT_FOUND code | - |
 * | TC-N-04 | ModalHandlerNotFoundError | Equivalence - normal | Error created with MODAL_HANDLER_NOT_FOUND code | - |
 * | TC-N-05 | DispatchNotInitializedError | Equivalence - normal | Error created with DISPATCH_NOT_INITIALIZED code | - |
 * | TC-N-06 | ModalAlreadyExistsError with modalId | Equivalence - normal | Error created with MODAL_ALREADY_EXISTS code | - |
 * | TC-A-01 | BaseModalError with empty message | Boundary - empty string | Error created but message is empty | - |
 * | TC-A-02 | BaseModalError with empty code | Boundary - empty string | Error created but code is empty | - |
 * | TC-B-01 | BaseModalError with context | Boundary - context data | Error created with context data | - |
 * | TC-B-02 | ModalNotFoundError with empty modalId | Boundary - empty string | Error created with empty modalId in context | - |
 */

describe("BaseModalError", () => {
  it("BaseModalError with message and code", () => {
    // Given: A message and error code
    const message = "Test error message";
    const code = "TEST_ERROR";

    // When: BaseModalError is created
    const error = new BaseModalError(message, code);

    // Then: Error should have correct properties
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseModalError);
    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
    expect(error.name).toBe("BaseModalError");
    expect(error.context).toBeUndefined();
  });

  it("BaseModalError with context data", () => {
    // Given: A message, code, and context
    const message = "Test error with context";
    const code = "TEST_ERROR";
    const context = { modalId: "test-modal", action: "show" };

    // When: BaseModalError is created with context
    const error = new BaseModalError(message, code, context);

    // Then: Error should have context data
    expect(error.context).toEqual(context);
    expect(error.context?.modalId).toBe("test-modal");
  });

  it("BaseModalError with empty message", () => {
    // Given: Empty message and code
    const message = "";
    const code = "TEST_ERROR";

    // When: BaseModalError is created with empty message
    const error = new BaseModalError(message, code);

    // Then: Error should be created but message is empty
    expect(error.message).toBe("");
    expect(error.code).toBe(code);
  });

  it("BaseModalError with empty code", () => {
    // Given: Message and empty code
    const message = "Test error";
    const code = "";

    // When: BaseModalError is created with empty code
    const error = new BaseModalError(message, code);

    // Then: Error should be created but code is empty
    expect(error.message).toBe(message);
    expect(error.code).toBe("");
  });

  it("BaseModalError handles missing Error.captureStackTrace", () => {
    // Given: Error.captureStackTrace is not available (non-V8 environment)
    const originalCaptureStackTrace = Error.captureStackTrace;
    // @ts-expect-error - Intentionally removing captureStackTrace for test
    delete Error.captureStackTrace;

    // When: BaseModalError is created without captureStackTrace
    const error = new BaseModalError("Test error", "TEST_ERROR");

    // Then: Error should still be created correctly
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseModalError);
    expect(error.message).toBe("Test error");
    expect(error.code).toBe("TEST_ERROR");

    // Cleanup: Restore captureStackTrace if it existed
    if (originalCaptureStackTrace) {
      Error.captureStackTrace = originalCaptureStackTrace;
    }
  });
});

describe("ModalNotFoundError", () => {
  it("ModalNotFoundError with modalId", () => {
    // Given: A modal ID
    const modalId = "test-modal-not-found";

    // When: ModalNotFoundError is created
    const error = new ModalNotFoundError(modalId);

    // Then: Error should have correct properties
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseModalError);
    expect(error).toBeInstanceOf(ModalNotFoundError);
    expect(error.name).toBe("ModalNotFoundError");
    expect(error.code).toBe("MODAL_NOT_FOUND");
    expect(error.message).toContain(modalId);
    expect(error.context).toBeDefined();
    expect(error.context?.modalId).toBe(modalId);
  });

  it("ModalNotFoundError with empty modalId", () => {
    // Given: Empty modal ID
    const modalId = "";

    // When: ModalNotFoundError is created with empty modalId
    const error = new ModalNotFoundError(modalId);

    // Then: Error should be created with empty modalId in context
    expect(error.code).toBe("MODAL_NOT_FOUND");
    expect(error.context?.modalId).toBe("");
  });
});

describe("ModalIdNotFoundError", () => {
  it("ModalIdNotFoundError creates error with correct properties", () => {
    // Given: No parameters needed
    // When: ModalIdNotFoundError is created
    const error = new ModalIdNotFoundError();

    // Then: Error should have correct properties
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseModalError);
    expect(error).toBeInstanceOf(ModalIdNotFoundError);
    expect(error.name).toBe("ModalIdNotFoundError");
    expect(error.code).toBe("MODAL_ID_NOT_FOUND");
    expect(error.message).toBe("No modal id found in BaseModal.useModal.");
  });
});

describe("ModalHandlerNotFoundError", () => {
  it("ModalHandlerNotFoundError creates error with correct properties", () => {
    // Given: No parameters needed
    // When: ModalHandlerNotFoundError is created
    const error = new ModalHandlerNotFoundError();

    // Then: Error should have correct properties
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseModalError);
    expect(error).toBeInstanceOf(ModalHandlerNotFoundError);
    expect(error.name).toBe("ModalHandlerNotFoundError");
    expect(error.code).toBe("MODAL_HANDLER_NOT_FOUND");
    expect(error.message).toBe("No handler found in BaseModal.ModalHolder.");
  });
});

describe("DispatchNotInitializedError", () => {
  it("DispatchNotInitializedError creates error with correct properties", () => {
    // Given: No parameters needed
    // When: DispatchNotInitializedError is created
    const error = new DispatchNotInitializedError();

    // Then: Error should have correct properties
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseModalError);
    expect(error).toBeInstanceOf(DispatchNotInitializedError);
    expect(error.name).toBe("DispatchNotInitializedError");
    expect(error.code).toBe("DISPATCH_NOT_INITIALIZED");
    expect(error.message).toContain("No dispatch method detected");
    expect(error.message).toContain("BaseModal.Provider");
  });
});

describe("ModalAlreadyExistsError", () => {
  it("ModalAlreadyExistsError with modalId", () => {
    // Given: A modal ID that already exists
    const modalId = "existing-modal";

    // When: ModalAlreadyExistsError is created
    const error = new ModalAlreadyExistsError(modalId);

    // Then: Error should have correct properties
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseModalError);
    expect(error).toBeInstanceOf(ModalAlreadyExistsError);
    expect(error.name).toBe("ModalAlreadyExistsError");
    expect(error.code).toBe("MODAL_ALREADY_EXISTS");
    expect(error.message).toContain(modalId);
    expect(error.context).toBeDefined();
    expect(error.context?.modalId).toBe(modalId);
  });
});

describe("Error inheritance", () => {
  it("All error types extend BaseModalError", () => {
    // Given: All error types
    const errors = [
      new ModalNotFoundError("test"),
      new ModalIdNotFoundError(),
      new ModalHandlerNotFoundError(),
      new DispatchNotInitializedError(),
      new ModalAlreadyExistsError("test"),
    ];

    // When: Checking inheritance
    // Then: All should extend BaseModalError and Error
    errors.forEach((error) => {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BaseModalError);
    });
  });

  it("Error codes are unique", () => {
    // Given: All error types
    const errorCodes = [
      new ModalNotFoundError("test").code,
      new ModalIdNotFoundError().code,
      new ModalHandlerNotFoundError().code,
      new DispatchNotInitializedError().code,
      new ModalAlreadyExistsError("test").code,
    ];

    // When: Checking for duplicates
    const uniqueCodes = new Set(errorCodes);

    // Then: All codes should be unique
    expect(uniqueCodes.size).toBe(errorCodes.length);
  });
});

