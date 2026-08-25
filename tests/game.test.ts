import { describe, expect, it } from "vitest";
import { BOSS_TRIGGER, MAX_STAGE, ROAD_WIDTHS, ROUND_ENEMY_TYPES, ROUND_ITEM_EVENTS, ROUND_ITEM_TYPES, ROUND_SEGMENTS, SHOP_CHECKPOINTS, STAGE_LENGTH, WEAPONS, WANTED_COSTS, WANTED_X_OFFSETS, clamp, distance, nextExtraLifeScore, scoreExtraLives, shouldLoopStage } from "../src/game-constants";

describe("Gun.Smoke vertical slice", () => {
  it("keeps the NES-inspired stage constants stable", () => {
    expect({ scrollSpeed: 76, fireInterval: 0.16, bossTrigger: BOSS_TRIGGER, stageLength: STAGE_LENGTH, rounds: MAX_STAGE }).toEqual({ scrollSpeed: 76, fireInterval: 0.16, bossTrigger: 1820, stageLength: 2200, rounds: 6 });
  });

  it("keeps collision helpers bounded and Euclidean", () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("loops a stage only when the wanted poster is missing", () => {
    expect(shouldLoopStage(STAGE_LENGTH, false)).toBe(true);
    expect(shouldLoopStage(STAGE_LENGTH, true)).toBe(false);
  });

  it("matches the NES score-life thresholds", () => {
    expect(nextExtraLifeScore(30_000)).toBe(100_000);
    expect(nextExtraLifeScore(100_000)).toBe(200_000);
    expect(scoreExtraLives(230_000, 30_000)).toEqual({ lives: 3, nextThreshold: 300_000 });
  });

  it("keeps the round shop cadence explicit", () => {
    expect(SHOP_CHECKPOINTS).toHaveLength(MAX_STAGE);
    expect(SHOP_CHECKPOINTS[2]).toHaveLength(3);
    expect(SHOP_CHECKPOINTS[5]).toHaveLength(3);
    expect(ROAD_WIDTHS).toHaveLength(MAX_STAGE);
    expect(ROAD_WIDTHS[2]).toBeLessThan(ROAD_WIDTHS[4]);
    expect(WEAPONS.shotgun.maxAmmo).toBe(30);
    expect(WEAPONS.magnum.damage).toBeGreaterThan(WEAPONS.pistol.damage);
    expect(WANTED_COSTS.slice(0, 3)).toEqual([20_000, 24_000, 50_000]);
    expect(WANTED_X_OFFSETS).toHaveLength(MAX_STAGE);
    expect(ROUND_ENEMY_TYPES).toHaveLength(MAX_STAGE);
    expect(ROUND_ENEMY_TYPES[0]).toContain("backstabber");
    expect(ROUND_ENEMY_TYPES[2]).toContain("firebreather");
    expect(ROUND_SEGMENTS).toHaveLength(MAX_STAGE);
    expect(ROUND_SEGMENTS.every((segments) => segments[0]?.at === 0)).toBe(true);
    expect(ROUND_ITEM_TYPES).toHaveLength(MAX_STAGE);
    expect(ROUND_ITEM_TYPES[0]).toContain("horse");
    expect(ROUND_ITEM_TYPES[1]).toContain("skull");
    expect(ROUND_ITEM_EVENTS).toHaveLength(MAX_STAGE);
    expect(ROUND_ITEM_EVENTS.every((events) => events.every((event, index) => index === 0 || event.at > (events[index - 1]?.at ?? -1)))).toBe(true);
  });
});
