import { describe, expect, it } from "vitest";

import { translateValidationError, translateValidationErrors } from "./validation-messages";

describe("translateValidationError", () => {
  it("translates a known code with no ctx placeholders", () => {
    expect(
      translateValidationError({
        type: "password_missing_digit",
        msg: "Password must contain at least one digit",
      }),
    ).toBe("A senha deve conter pelo menos um número");
  });

  it("interpolates ctx params by name into the template", () => {
    expect(
      translateValidationError({
        type: "password_too_long",
        msg: "Password must be at most 128 characters",
        ctx: { max_length: 128 },
      }),
    ).toBe("A senha deve ter no máximo 128 caracteres");
  });

  it("falls back to msg for a code with no pt-BR translation (e.g. Pydantic's own built-in types)", () => {
    expect(
      translateValidationError({
        type: "value_error",
        msg: "value is not a valid email address: The part after the @-sign is not valid.",
      }),
    ).toBe("value is not a valid email address: The part after the @-sign is not valid.");
  });

  it("returns null when the entry has neither a known type nor a string msg", () => {
    expect(translateValidationError({ type: "value_error", msg: 42 })).toBeNull();
    expect(translateValidationError("not an object")).toBeNull();
    expect(translateValidationError(null)).toBeNull();
  });
});

describe("translateValidationErrors", () => {
  it("returns null for a non-array input", () => {
    expect(translateValidationErrors("Could not validate credentials")).toBeNull();
    expect(translateValidationErrors(undefined)).toBeNull();
  });

  it("returns null for an empty array", () => {
    expect(translateValidationErrors([])).toBeNull();
  });

  it("joins multiple translated messages with a semicolon", () => {
    const result = translateValidationErrors([
      { type: "password_missing_uppercase", msg: "..." },
      { type: "password_missing_digit", msg: "..." },
    ]);
    expect(result).toBe(
      "A senha deve conter pelo menos uma letra maiúscula; A senha deve conter pelo menos um número",
    );
  });
});
