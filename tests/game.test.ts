import { describe, expect, it } from "vitest";
import { AMMO_GAIN, BOOTS_SPEED_MULTIPLIER, BOSS_TRIGGER, clamp, distance, MAX_STAGE, NES_BULLET_SPEED, NES_DIAGONAL_BULLET_X, NES_DIAGONAL_BULLET_Y, NES_PLAYER_SPEED, NES_SCROLL_SPEED, obstacleBlocks, PISTOL_BULLET_LIFETIME, ROAD_WIDTHS, ROUND_ENEMY_TYPES, ROUND_ITEM_EVENTS, ROUND_ITEM_TYPES, ROUND_OBSTACLES, ROUND_SEGMENTS, SHOP_CHECKPOINTS, SHOP_COSTS, segmentDelay, STAGE_LENGTH, WEAPONS, WANTED_COSTS, WANTED_X_OFFSETS, WORLD_BULLET_SPEED, WORLD_DIAGONAL_BULLET_X, WORLD_DIAGONAL_BULLET_Y, WORLD_PLAYER_SPEED, WORLD_SCROLL_SPEED, nextExtraLifeScore, scoreExtraLives, shouldLoopStage } from "../src/game-constants";

describe("Gun.Smoke vertical slice", () => {
  it("keeps the NES-inspired stage constants stable", () => {
    expect({ nesScrollSpeed: NES_SCROLL_SPEED, scrollSpeed: WORLD_SCROLL_SPEED, fireInterval: 0.16, bossTrigger: BOSS_TRIGGER, stageLength: STAGE_LENGTH, rounds: MAX_STAGE }).toEqual({ nesScrollSpeed: 20, scrollSpeed: 45, fireInterval: 0.16, bossTrigger: 1820, stageLength: 2200, rounds: 6 });
    expect({ nesPlayerSpeed: NES_PLAYER_SPEED, playerSpeed: WORLD_PLAYER_SPEED, bootsMultiplier: BOOTS_SPEED_MULTIPLIER }).toEqual({ nesPlayerSpeed: 75, playerSpeed: 168.75, bootsMultiplier: 1.2 });
    expect({ nesBulletSpeed: NES_BULLET_SPEED, bulletSpeed: WORLD_BULLET_SPEED }).toEqual({ nesBulletSpeed: 360, bulletSpeed: 810 });
    expect({ x: NES_DIAGONAL_BULLET_X, y: NES_DIAGONAL_BULLET_Y, worldX: WORLD_DIAGONAL_BULLET_X, worldY: WORLD_DIAGONAL_BULLET_Y, lifetime: PISTOL_BULLET_LIFETIME }).toEqual({ x: 150, y: 300, worldX: 337.5, worldY: 675, lifetime: 0.25 });
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
    expect(AMMO_GAIN.pistol).toBe(0);
    expect(AMMO_GAIN.magnum).toBeLessThan(AMMO_GAIN.machinegun);
    expect(SHOP_COSTS).toEqual({ shotgun: 4_000, machinegun: 8_000, magnum: 12_000, horse: 6_000, ammo: 2_000, smartBomb: 10_000 });
    expect(WANTED_COSTS.slice(0, 3)).toEqual([20_000, 24_000, 50_000]);
    expect(WANTED_X_OFFSETS).toHaveLength(MAX_STAGE);
    expect(ROUND_ENEMY_TYPES).toHaveLength(MAX_STAGE);
    expect(ROUND_ENEMY_TYPES[0]).toContain("backstabber");
    expect(ROUND_ENEMY_TYPES[2]).toContain("spear");
    expect(ROUND_ENEMY_TYPES[2]).toContain("firebreather");
    expect(ROUND_SEGMENTS).toHaveLength(MAX_STAGE);
    expect(ROUND_SEGMENTS.every((segments) => segments[0]?.at === 146)).toBe(true);
    expect(ROUND_SEGMENTS[0]?.map((segment) => segment.at)).toEqual([146, 416, 551, 731]);
    expect(segmentDelay(27, 146, 45)).toBeCloseTo(2.644, 2);
    expect(ROUND_ITEM_TYPES).toHaveLength(MAX_STAGE);
    expect(ROUND_ITEM_TYPES[0]).toContain("horse");
    expect(ROUND_ITEM_TYPES[1]).toContain("skull");
    expect(ROUND_ITEM_EVENTS).toHaveLength(MAX_STAGE);
    expect(ROUND_ITEM_EVENTS.every((events) => events.every((event, index) => index === 0 || event.at > (events[index - 1]?.at ?? -1)))).toBe(true);
  });

  it("keeps terrain blockers inside their authored world ranges", () => {
    expect(ROUND_OBSTACLES).toHaveLength(MAX_STAGE);
    const obstacle = ROUND_OBSTACLES[4]?.[0];
    expect(obstacle).toBeDefined();
    expect(obstacleBlocks(obstacle!, obstacle!.x, obstacle!.at + obstacle!.length / 2)).toBe(true);
    expect(obstacleBlocks(obstacle!, 80, obstacle!.at + obstacle!.length / 2)).toBe(false);
    expect(obstacleBlocks(obstacle!, obstacle!.x, obstacle!.at - 40)).toBe(false);
  });
});
