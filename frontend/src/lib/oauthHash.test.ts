import { describe, expect, it } from "vitest";
import { parseOAuthReturn } from "@/lib/oauthHash";

describe("parseOAuthReturn", () => {
  it("reads the session from the fragment", () => {
    expect(parseOAuthReturn("#access_token=abc.def&refresh_token=r1&expires_in=3600&token_type=bearer")).toEqual({
      accessToken: "abc.def",
      refreshToken: "r1",
    });
  });

  it("works without a refresh token", () => {
    expect(parseOAuthReturn("#access_token=abc")).toEqual({ accessToken: "abc", refreshToken: null });
  });

  it("reports a cancelled sign-in in plain words", () => {
    const result = parseOAuthReturn("#error=access_denied&error_description=User+denied");
    expect(result).toEqual({ error: "Cancelaste el inicio de sesión con Google." });
  });

  it("reports other errors from the fragment or the query string", () => {
    expect(parseOAuthReturn("#error=server_error&error_description=boom")).toMatchObject({ error: expect.stringMatching(/No se pudo/) });
    expect(parseOAuthReturn("", "?error=server_error&error_description=boom")).toMatchObject({ error: expect.stringMatching(/No se pudo/) });
  });

  it("fails when there is nothing to read", () => {
    expect(parseOAuthReturn("")).toEqual({ error: "No se recibió la sesión de Google. Inténtalo de nuevo." });
  });
});
