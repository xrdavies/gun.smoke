import { describe, expect, it } from "vitest";
import { BOSS_TRIGGER, MAX_STAGE, STAGE_LENGTH, clamp, distance } from "../src/game-constants";

describe("Gun.Smoke vertical slice", () => {
  it("keeps the NES-inspired stage constants stable", () => {
    expect({ scrollSpeed: 76, fireInterval: 0.16, bossTrigger: BOSS_TRIGGER, stageLength: STAGE_LENGTH, rounds: MAX_STAGE }).toEqual({ scrollSpeed: 76, fireInterval: 0.16, bossTrigger: 1820, stageLength: 2200, rounds: 6 });
  });

  it("keeps collision helpers bounded and Euclidean", () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});
