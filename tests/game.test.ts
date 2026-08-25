import { describe, expect, it } from "vitest";

describe("Gun.Smoke vertical slice", () => {
  it("keeps the NES-inspired stage constants stable", () => {
    expect({ scrollSpeed: 76, fireInterval: 0.16, bossTrigger: 1900 }).toEqual({
      scrollSpeed: 76,
      fireInterval: 0.16,
      bossTrigger: 1900,
    });
  });
});
