import { describe, expect, it } from "vitest";
import { BOSS_TRIGGER, MAX_STAGE, ROAD_WIDTHS, ROUND_ENEMY_TYPES, ROUND_SEGMENTS, SHOP_CHECKPOINTS, STAGE_LENGTH, WEAPONS, WANTED_COSTS, WANTED_X_OFFSETS, clamp, distance } from "../src/game-constants";

describe("Gun.Smoke vertical slice", () => {
  it("keeps the NES-inspired stage constants stable", () => {
    expect({ scrollSpeed: 76, fireInterval: 0.16, bossTrigger: BOSS_TRIGGER, stageLength: STAGE_LENGTH, rounds: MAX_STAGE }).toEqual({ scrollSpeed: 76, fireInterval: 0.16, bossTrigger: 1820, stageLength: 2200, rounds: 6 });
  });

  it("keeps collision helpers bounded and Euclidean", () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("keeps the round shop cadence explicit", () => {
    expect(SHOP_CHECKPOINTS).toHaveLength(MAX_STAGE);
    expect(SHOP_CHECKPOINTS[2]).toHaveLength(3);
    expect(SHOP_CHECKPOINTS[5]).toHaveLength(3);
    expect(ROAD_WIDTHS).toHaveLength(MAX_STAGE);
    expect(ROAD_WIDTHS[2]).toBeLessThan(ROAD_WIDTHS[4]);
    expect(WEAPONS.shotgun.maxAmmo).toBe(30);
    expect(WEAPONS.magnum.damage).toBeGreaterThan(WEAPONS.pistol.damage);
    expect(WANTED_COSTS[0]).toBeLessThan(WANTED_COSTS[5]);
    expect(WANTED_X_OFFSETS).toHaveLength(MAX_STAGE);
    expect(ROUND_ENEMY_TYPES).toHaveLength(MAX_STAGE);
    expect(ROUND_ENEMY_TYPES[0]).toContain("backstabber");
    expect(ROUND_ENEMY_TYPES[2]).toContain("firebreather");
    expect(ROUND_SEGMENTS).toHaveLength(MAX_STAGE);
    expect(ROUND_SEGMENTS.every((segments) => segments[0]?.at === 0)).toBe(true);
  });
});
