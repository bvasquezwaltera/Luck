import { describe, expect, it } from "vitest";
import {
  validateLoginForm,
  validateRegisterForm,
  validateForgotPasswordForm,
} from "@/validators/authValidation";

describe("validateLoginForm", () => {
  it("returns no errors for valid input", () => {
    expect(validateLoginForm({ email: "a@b.com", password: "secret123" })).toEqual({});
  });

  it("requires email", () => {
    const errors = validateLoginForm({ email: "", password: "secret123" });
    expect(errors.email).toBeDefined();
  });

  it("requires a valid email format", () => {
    const errors = validateLoginForm({ email: "not-an-email", password: "secret123" });
    expect(errors.email).toBeDefined();
  });

  it("requires password", () => {
    const errors = validateLoginForm({ email: "a@b.com", password: "" });
    expect(errors.password).toBeDefined();
  });

  it("accepts a valid email with subdomains and a plus tag", () => {
    const errors = validateLoginForm({ email: "user+tag@mail.example.com", password: "secret123" });
    expect(errors.email).toBeUndefined();
  });
});

describe("validateRegisterForm", () => {
  const validValues = {
    fullName: "Ana Torres",
    email: "ana@example.com",
    password: "Secret1!",
    confirmPassword: "Secret1!",
  };

  it("returns no errors for valid input", () => {
    expect(validateRegisterForm(validValues)).toEqual({});
  });

  it("requires full name", () => {
    const errors = validateRegisterForm({ ...validValues, fullName: "" });
    expect(errors.fullName).toBeDefined();
  });

  it("requires a valid email format", () => {
    const errors = validateRegisterForm({ ...validValues, email: "not-an-email" });
    expect(errors.email).toBeDefined();
  });

  it("requires at least 8 characters in password", () => {
    const errors = validateRegisterForm({ ...validValues, password: "Sh0rt!", confirmPassword: "Sh0rt!" });
    expect(errors.password).toMatch(/8 caracteres/);
  });

  it("requires an uppercase letter in password", () => {
    const errors = validateRegisterForm({ ...validValues, password: "secret1!", confirmPassword: "secret1!" });
    expect(errors.password).toMatch(/mayúscula/);
  });

  it("requires a number in password", () => {
    const errors = validateRegisterForm({ ...validValues, password: "Secretx!", confirmPassword: "Secretx!" });
    expect(errors.password).toMatch(/número/);
  });

  it("requires a special character in password", () => {
    const errors = validateRegisterForm({ ...validValues, password: "Secret12", confirmPassword: "Secret12" });
    expect(errors.password).toMatch(/especial/);
  });

  it("requires confirmPassword to match password", () => {
    const errors = validateRegisterForm({ ...validValues, confirmPassword: "Different1!" });
    expect(errors.confirmPassword).toMatch(/no coinciden/);
  });

  it("requires confirmPassword to be non-empty", () => {
    const errors = validateRegisterForm({ ...validValues, confirmPassword: "" });
    expect(errors.confirmPassword).toBeDefined();
  });
});

describe("validateForgotPasswordForm", () => {
  it("returns no errors for a valid email", () => {
    expect(validateForgotPasswordForm({ email: "a@b.com" })).toEqual({});
  });

  it("requires email", () => {
    const errors = validateForgotPasswordForm({ email: "" });
    expect(errors.email).toBeDefined();
  });

  it("requires a valid email format", () => {
    const errors = validateForgotPasswordForm({ email: "not-an-email" });
    expect(errors.email).toBeDefined();
  });
});
