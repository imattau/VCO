import { describe, it, expect } from "vitest";
import { 
  VcoError, 
  VcoErrorCode, 
  EnvelopeValidationError, 
  MultiformatError, 
  PoWError 
} from "../src/errors.js";

describe("VCO Error Hierarchy", () => {
  it("VcoError should capture code and details", () => {
    const details = { foo: "bar" };
    const error = new VcoError("Test message", VcoErrorCode.GENERIC_ERROR, details);
    
    expect(error.message).toBe("Test message");
    expect(error.code).toBe(VcoErrorCode.GENERIC_ERROR);
    expect(error.details).toEqual(details);
    expect(error.name).toBe("VcoError");
    expect(error instanceof Error).toBe(true);
  });

  it("EnvelopeValidationError should have correct code and name", () => {
    const error = new EnvelopeValidationError("Invalid envelope");
    expect(error.code).toBe(VcoErrorCode.INVALID_ENVELOPE);
    expect(error.name).toBe("EnvelopeValidationError");
    expect(error instanceof VcoError).toBe(true);
  });

  it("MultiformatError should have correct code and name", () => {
    const error = new MultiformatError("Invalid codec");
    expect(error.code).toBe(VcoErrorCode.INVALID_MULTIFORMAT);
    expect(error.name).toBe("MultiformatError");
    expect(error instanceof VcoError).toBe(true);
  });

  it("PoWError should have correct code and name", () => {
    const error = new PoWError("Difficulty mismatch");
    expect(error.code).toBe(VcoErrorCode.INVALID_POW);
    expect(error.name).toBe("PoWError");
    expect(error instanceof VcoError).toBe(true);
  });
});
