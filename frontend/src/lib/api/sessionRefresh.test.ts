import { describe, expect, it, vi } from "vitest";
import { createRefresher, loginUrlAfterExpiry } from "@/lib/api/sessionRefresh";

function setup(options: { refreshToken?: string | null; result?: { accessToken: string; refreshToken: string } | null | Error } = {}) {
  const { refreshToken = "viejo", result = { accessToken: "nuevo-a", refreshToken: "nuevo-r" } } = options;
  const callRefresh = vi.fn(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
  const store = vi.fn();
  const refresh = createRefresher({ readRefreshToken: () => refreshToken, callRefresh, store });
  return { refresh, callRefresh, store };
}

describe("createRefresher", () => {
  it("renews the session and stores the new tokens", async () => {
    const { refresh, callRefresh, store } = setup();
    expect(await refresh()).toBe(true);
    expect(callRefresh).toHaveBeenCalledWith("viejo");
    expect(store).toHaveBeenCalledWith({ accessToken: "nuevo-a", refreshToken: "nuevo-r" });
  });

  it("shares one renewal between simultaneous requests", async () => {
    const { refresh, callRefresh } = setup();
    const results = await Promise.all([refresh(), refresh(), refresh()]);
    expect(results).toEqual([true, true, true]);
    expect(callRefresh).toHaveBeenCalledTimes(1);
  });

  it("can renew again later (a renewal does not stay stuck)", async () => {
    const { refresh, callRefresh } = setup();
    await refresh();
    await refresh();
    expect(callRefresh).toHaveBeenCalledTimes(2);
  });

  it("gives up without calling the server when there is no refresh token", async () => {
    const { refresh, callRefresh } = setup({ refreshToken: null });
    expect(await refresh()).toBe(false);
    expect(callRefresh).not.toHaveBeenCalled();
  });

  it("returns false (and stores nothing) when the server refuses or fails", async () => {
    for (const result of [null, new Error("sin conexión")]) {
      const { refresh, store } = setup({ result });
      expect(await refresh()).toBe(false);
      expect(store).not.toHaveBeenCalled();
    }
  });
});

describe("loginUrlAfterExpiry", () => {
  it("goes back to the panel screen the person was on", () => {
    expect(loginUrlAfterExpiry("/panel/cliente", "?x=1")).toBe("/login?expired=1&next=%2Fpanel%2Fcliente%3Fx%3D1");
  });

  it("does not send people back to non-panel pages", () => {
    expect(loginUrlAfterExpiry("/perfil/abc")).toBe("/login?expired=1");
    expect(loginUrlAfterExpiry("/")).toBe("/login?expired=1");
  });
});
