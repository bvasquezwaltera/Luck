import { describe, expect, it } from "vitest";
import { authReturnRedirect } from "@/lib/authReturn";

describe("authReturnRedirect", () => {
  it("sends a Google return that landed on the home page to the callback, keeping the session", () => {
    expect(authReturnRedirect("/", "#access_token=abc&refresh_token=r&token_type=bearer")).toBe(
      "/auth/callback#access_token=abc&refresh_token=r&token_type=bearer",
    );
  });

  it("works from any page, not only the home page", () => {
    expect(authReturnRedirect("/login", "#access_token=abc")).toBe("/auth/callback#access_token=abc");
  });

  it("sends a password-recovery link to the reset screen", () => {
    expect(authReturnRedirect("/", "#access_token=abc&type=recovery")).toBe("/restablecer-contrasena#access_token=abc&type=recovery");
  });

  it("also forwards errors (e.g. cancelled sign-in) so they get a clear message", () => {
    expect(authReturnRedirect("/", "#error=access_denied&error_description=denied")).toBe(
      "/auth/callback#error=access_denied&error_description=denied",
    );
  });

  it("does nothing on pages without a return, or on the screens that already handle it", () => {
    expect(authReturnRedirect("/", "")).toBeNull();
    expect(authReturnRedirect("/", "#seccion-planes")).toBeNull();
    expect(authReturnRedirect("/auth/callback", "#access_token=abc")).toBeNull();
    expect(authReturnRedirect("/restablecer-contrasena", "#access_token=abc&type=recovery")).toBeNull();
  });
});
