import { describe, expect, it } from "vitest";
import { AMMO_GAIN, bossReward, BOSS_REWARDS, BOOTS_SPEED_MULTIPLIER, BOSS_TRIGGER, clamp, distance, formationEntryY, MAGNUM_BULLET_LIFETIME, MAGNUM_BULLET_SPEED, MAX_STAGE, NES_BULLET_SPEED, NES_DIAGONAL_BULLET_X, NES_DIAGONAL_BULLET_Y, NES_FRAME_RATE, NES_PLAYER_SPEED, NES_SCROLL_SPEED, obstacleBlocks, PISTOL_BULLET_LIFETIME, ROAD_WIDTHS, ROUND_ENEMY_TYPES, ROUND_ITEM_EVENTS, ROUND_OBSTACLES, ROUND_SEGMENTS, SHOP_CHECKPOINTS, SHOP_COSTS, SHOP_TYPES, segmentDelay, spendPoints, STAGE_LENGTH, STAGES, unitMaxAge, WEAPONS, WANTED_COSTS, WANTED_X_OFFSETS, WORLD_BULLET_SPEED, WORLD_DIAGONAL_BULLET_X, WORLD_DIAGONAL_BULLET_Y, WORLD_PLAYER_SPEED, WORLD_SCROLL_SPEED, nextExtraLifeScore, scoreExtraLives, shouldLoopStage } from "../src/game-constants";

describe("Gun.Smoke vertical slice", () => {
  it("keeps the NES-inspired stage constants stable", () => {
    expect({ frameRate: NES_FRAME_RATE, bossTrigger: BOSS_TRIGGER, stageLength: STAGE_LENGTH, rounds: MAX_STAGE }).toEqual({ frameRate: 60.098, bossTrigger: 1820, stageLength: 2200, rounds: 6 });
    expect(NES_SCROLL_SPEED).toBeCloseTo(20.032667, 6);
    expect(WORLD_SCROLL_SPEED).toBeCloseTo(45.0735, 6);
    expect(NES_PLAYER_SPEED).toBeCloseTo(75.1225, 6);
    expect(WORLD_PLAYER_SPEED).toBeCloseTo(169.025625, 6);
    expect(BOOTS_SPEED_MULTIPLIER).toBe(1.2);
    expect(NES_BULLET_SPEED).toBeCloseTo(360.588, 6);
    expect(WORLD_BULLET_SPEED).toBeCloseTo(811.323, 6);
    expect(NES_DIAGONAL_BULLET_X).toBeCloseTo(150.245, 6);
    expect(NES_DIAGONAL_BULLET_Y).toBeCloseTo(300.49, 6);
    expect(WORLD_DIAGONAL_BULLET_X).toBeCloseTo(338.05125, 6);
    expect(WORLD_DIAGONAL_BULLET_Y).toBeCloseTo(676.1025, 6);
    expect(PISTOL_BULLET_LIFETIME).toBeCloseTo(15 / 60.098, 9);
    expect({ speed: MAGNUM_BULLET_SPEED, lifetime: MAGNUM_BULLET_LIFETIME }).toEqual({ speed: WORLD_BULLET_SPEED * 0.75, lifetime: 0.8 });
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
    expect(spendPoints(10_000, 6_000)).toBe(4_000);
    expect(spendPoints(5_999, 6_000)).toBeUndefined();
  });

  it("keeps the round shop cadence explicit", () => {
    expect(SHOP_CHECKPOINTS).toHaveLength(MAX_STAGE);
    expect(SHOP_TYPES).toEqual([
      ["weapons", "supplies"], ["weapons", "supplies"], ["weapons", "supplies", "weapons"],
      ["weapons", "supplies"], ["weapons", "supplies"], ["weapons", "supplies", "weapons"],
    ]);
    expect(SHOP_CHECKPOINTS[2]).toHaveLength(3);
    expect(SHOP_CHECKPOINTS[5]).toHaveLength(3);
    expect(ROAD_WIDTHS).toHaveLength(MAX_STAGE);
    expect(ROAD_WIDTHS[0]).toBe(730);
    expect(ROAD_WIDTHS[2]).toBeLessThan(ROAD_WIDTHS[4]);
    expect(WEAPONS.shotgun.maxAmmo).toBe(120);
    expect(WEAPONS.magnum.damage).toBeGreaterThan(WEAPONS.pistol.damage);
    expect(AMMO_GAIN.pistol).toBe(0);
    expect(AMMO_GAIN.magnum).toBeLessThan(AMMO_GAIN.machinegun);
    expect(SHOP_COSTS).toEqual({ shotgun: 6_000, machinegun: 10_000, magnum: 20_000, horse: 20_000, ammo: 1_500, smartBomb: 8_000 });
    expect(AMMO_GAIN).toEqual({ pistol: 0, shotgun: 20, machinegun: 40, magnum: 10 });
    expect(WANTED_COSTS).toEqual([20_000, 24_000, 50_000, 40_000, 40_000, 60_000]);
    expect(BOSS_REWARDS).toEqual(WANTED_COSTS.map((cost) => cost / 2));
    expect(WANTED_X_OFFSETS).toHaveLength(MAX_STAGE);
    expect(WANTED_X_OFFSETS[1]).toBeLessThan(0);
    expect(WANTED_X_OFFSETS[4]).toBeGreaterThan(0);
    expect(ROUND_ENEMY_TYPES).toHaveLength(MAX_STAGE);
    expect(ROUND_ENEMY_TYPES[0]).toContain("backstabber");
    expect(ROUND_ENEMY_TYPES[0]).toContain("shotgunner");
    expect(ROUND_ENEMY_TYPES[2]).toContain("spear");
    expect(ROUND_ENEMY_TYPES[2]).toContain("firebreather");
    expect(ROUND_ENEMY_TYPES[2]).toContain("hatchet");
    expect(ROUND_SEGMENTS[2]?.flatMap((segment) => segment.enemyTypes)).toContain("hatchet");
    expect(ROUND_SEGMENTS).toHaveLength(MAX_STAGE);
    expect(ROUND_SEGMENTS.every((segments, round) => segments.every((segment) => segment.enemyTypes.every((enemy) => ROUND_ENEMY_TYPES[round]?.includes(enemy))))).toBe(true);
    expect(ROUND_SEGMENTS.every((segments) => segments[0]?.at === 146)).toBe(true);
    expect(ROUND_SEGMENTS[0]?.map((segment) => segment.at)).toEqual([146, 416, 551, 731]);
    expect(segmentDelay(27, 146, 45)).toBeCloseTo(2.644, 2);
    expect(ROUND_ITEM_EVENTS).toHaveLength(MAX_STAGE);
    expect(ROUND_ITEM_EVENTS.every((events) => events.every((event, index) => index === 0 || event.at > (events[index - 1]?.at ?? -1)))).toBe(true);
    expect(ROUND_ITEM_EVENTS[0]?.map((event) => event.item)).toContain("blueYashichi");
    expect(ROUND_ITEM_EVENTS[2]?.map((event) => event.item)).toContain("skull");
  });

  it("keeps terrain blockers inside their authored world ranges", () => {
    expect(ROUND_OBSTACLES).toHaveLength(MAX_STAGE);
    const obstacle = ROUND_OBSTACLES[4]?.[0];
    expect(obstacle).toBeDefined();
    expect(obstacleBlocks(obstacle!, obstacle!.x, obstacle!.at + obstacle!.length / 2)).toBe(true);
    expect(obstacleBlocks(obstacle!, 80, obstacle!.at + obstacle!.length / 2)).toBe(false);
    expect(obstacleBlocks(obstacle!, obstacle!.x, obstacle!.at - 40)).toBe(false);
    expect(ROUND_OBSTACLES.flat().every((entry) => !obstacleBlocks(entry, 480, 410))).toBe(true);
  });

  it("keeps Boss units alive until their health reaches zero", () => {
    expect(unitMaxAge("boss")).toBe(Number.POSITIVE_INFINITY);
    expect(unitMaxAge("enemy")).toBe(18);
    expect(unitMaxAge("projectile")).toBe(2.5);
  });

  it("awards the Round 6 bounty only after the real Wingate", () => {
    expect(bossReward(1)).toBe(10_000);
    expect(bossReward(MAX_STAGE, 0)).toBe(0);
    expect(bossReward(MAX_STAGE, 1)).toBe(30_000);
  });

  it("spawns Boss reinforcements above the arena", () => {
    expect(formationEntryY(1_820)).toBe(1_875);
    expect(formationEntryY(1_820, true)).toBe(1_780);
  });
});
