import { describe, expect, it } from "vitest";
import { signSessionToken, verifySessionToken } from "@/features/auth/server/token";

const SECRET = "x".repeat(32);

describe("session token", () => {
  it("round-trips the user id", async () => {
    expect(await verifySessionToken(await signSessionToken({ userId: "u1" }, SECRET), SECRET)).toEqual({ userId: "u1" });
  });

  it("rejects a token signed with another secret, garbage and missing values", async () => {
    const token = await signSessionToken({ userId: "u1" }, SECRET);
    expect(await verifySessionToken(token, "y".repeat(32))).toBeNull();
    expect(await verifySessionToken("not-a-jwt", SECRET)).toBeNull();
    expect(await verifySessionToken(undefined, SECRET)).toBeNull();
    expect(await verifySessionToken(token, "")).toBeNull();
  });
});
