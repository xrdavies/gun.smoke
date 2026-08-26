import { describe, expect, it } from "vitest";
import { AMMO_GAIN, BOMBER_FIRST_THROW_DELAY, BOMBER_THROW_INTERVAL, bossReward, BOSS_REWARDS, BOOTS_SPEED_MULTIPLIER, clamp, distance, DYNAMITE_AIRBORNE_DURATION, DYNAMITE_LANDED_DURATION, DYNAMITE_LIFETIME, DYNAMITE_WORLD_SPEED, formationEntryY, MAGNUM_BULLET_LIFETIME, MAGNUM_BULLET_SPEED, MAX_STAGE, NES_BULLET_SPEED, NES_DIAGONAL_BULLET_X, NES_DIAGONAL_BULLET_Y, NES_FRAME_RATE, NES_PLAYER_SPEED, NES_SCROLL_SPEED, NINJA_FIRST_SHOT_DELAY, NINJA_PROJECTILE_SPEED, obstacleBlocks, PISTOL_BULLET_LIFETIME, RIFLEMAN_BULLET_SPEED, RIFLEMAN_FIRST_SHOT_DELAY, RIFLEMAN_SHOT_INTERVAL, RIFLEMAN_SHOTS_PER_VOLLEY, ROCK_IMPACT_DELAY, ROCK_LIFETIME, ROCK_WORLD_SPEED_X, ROCK_WORLD_SPEED_Y, ROAD_WIDTHS, ROUND_BOSS_GATE_SCROLL_NES, ROUND_BOSS_TRIGGERS, ROUND_ENEMY_TYPES, ROUND_ITEM_EVENTS, ROUND_LENGTHS, ROUND_LOOP_SCROLL_NES, ROUND_OBSTACLES, ROUND_SEGMENTS, ROUND_WANTED_SCROLL_NES, ROUND_WANTED_X_NES, SHOTGUNNER_FIRST_VOLLEY_DELAY, SHOTGUNNER_LIFETIME, SHOTGUNNER_VOLLEY_INTERVAL, SHOP_CHECKPOINTS, SHOP_COSTS, SHOP_TYPES, SHOP_X_OFFSETS, SMART_BOMB_CAPACITY, SNIPER_LIFETIME, SNIPER_SHOT_FRAMES, segmentDelay, spendPoints, STAGES, unitMaxAge, WEAPONS, WANTED_COSTS, WANTED_REVEAL_AT, WANTED_X_OFFSETS, WORLD_BULLET_SPEED, WORLD_DIAGONAL_BULLET_X, WORLD_DIAGONAL_BULLET_Y, worldEventEnteredView, WORLD_PLAYER_SPEED, WORLD_SCROLL_SPEED, nextExtraLifeScore, scoreExtraLives, shouldLoopStage, shouldRevealWanted } from "../src/game-constants";
import { roundCollisionBlocks, ROUND_COLLISION_ROW_COUNTS } from "../src/round-collision";
import { canSpawnRomPool, ROM_ENEMY_SLOT_CAPACITY, ROM_NON_ENEMY_OBJECT_BEHAVIORS, ROM_OBJECT_PICKUPS, ROM_OBJECT_SLOT_CAPACITY, ROM_SCENE_ENEMY_DISPATCH_TYPES, ROUND_ROM_ENEMY_EVENTS, ROUND_ROM_ENEMY_EVENT_COUNTS, ROUND_ROM_OBJECT_EVENTS, ROUND_ROM_OBJECT_EVENT_COUNTS, ROM_BEHAVIOR_ENEMY_TYPES, romEventWorldAt, romEventWorldX, romEventWorldY } from "../src/rom-event-data";

describe("Gun.Smoke vertical slice", () => {
  it("keeps the NES-inspired stage constants stable", () => {
    expect({ frameRate: NES_FRAME_RATE, rounds: MAX_STAGE }).toEqual({ frameRate: 60.098, rounds: 6 });
    expect(ROUND_BOSS_GATE_SCROLL_NES).toEqual([2_767, 2_799, 4_863, 3_487, 2_879, 4_879]);
    expect(ROUND_LOOP_SCROLL_NES).toEqual([3_087, 3_055, 5_119, 3_839, 3_055, 5_119]);
    expect(ROUND_WANTED_SCROLL_NES).toEqual([1_695, 1_455, 2_031, 1_471, 1_631, 1_951]);
    expect(ROUND_WANTED_X_NES).toEqual([200, 64, 216, 216, 72, 216]);
    expect(ROUND_BOSS_TRIGGERS[0]).toBe(6_225.75);
    expect(ROUND_LENGTHS[5]).toBe(11_517.75);
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
    expect(shouldLoopStage(ROUND_LENGTHS[0]!, 1, false)).toBe(true);
    expect(shouldLoopStage(ROUND_LENGTHS[0]!, 1, true)).toBe(false);
    expect(shouldRevealWanted(WANTED_REVEAL_AT[0]! - 1, 1, false, false)).toBe(false);
    expect(shouldRevealWanted(WANTED_REVEAL_AT[0]!, 1, false, false)).toBe(true);
    expect(shouldRevealWanted(WANTED_REVEAL_AT[0]!, 1, true, false)).toBe(false);
    expect(shouldRevealWanted(WANTED_REVEAL_AT[0]!, 1, false, true)).toBe(false);
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
    expect(SHOP_X_OFFSETS).toHaveLength(MAX_STAGE);
    expect(SHOP_X_OFFSETS.every((offsets, round) => offsets.length === SHOP_CHECKPOINTS[round]?.length)).toBe(true);
    expect(SHOP_CHECKPOINTS[2]).toHaveLength(3);
    expect(SHOP_CHECKPOINTS[5]).toHaveLength(3);
    expect(SHOP_CHECKPOINTS[2]).toEqual([420, 860, 1_300]);
    expect(SHOP_CHECKPOINTS[5]).toEqual([420, 1_050, 1_250]);
    expect(ROAD_WIDTHS).toHaveLength(MAX_STAGE);
    expect(ROAD_WIDTHS[0]).toBe(730);
    expect(ROAD_WIDTHS[2]).toBeLessThan(ROAD_WIDTHS[4]);
    expect(WEAPONS.shotgun.maxAmmo).toBe(120);
    expect(WEAPONS.magnum.damage).toBeGreaterThan(WEAPONS.pistol.damage);
    expect(AMMO_GAIN.pistol).toBe(0);
    expect(AMMO_GAIN.magnum).toBeLessThan(AMMO_GAIN.machinegun);
    expect(SHOP_COSTS).toEqual({ shotgun: 6_000, machinegun: 10_000, magnum: 20_000, horse: 20_000, ammo: 1_500, smartBomb: 8_000 });
    expect(SMART_BOMB_CAPACITY).toBe(1);
    expect(AMMO_GAIN).toEqual({ pistol: 0, shotgun: 20, machinegun: 40, magnum: 10 });
    expect(WANTED_COSTS).toEqual([20_000, 24_000, 50_000, 40_000, 40_000, 60_000]);
    expect(BOSS_REWARDS).toEqual(WANTED_COSTS.map((cost) => cost / 2));
    expect(WANTED_X_OFFSETS).toHaveLength(MAX_STAGE);
    expect(WANTED_REVEAL_AT).toHaveLength(MAX_STAGE);
    expect(WANTED_REVEAL_AT.every((position, round) => position < (ROUND_BOSS_TRIGGERS[round] ?? 0))).toBe(true);
    expect(WANTED_X_OFFSETS).toEqual([270, -240, 330, 330, -210, 330]);
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
    expect(ROUND_ITEM_EVENTS[0]?.[0]?.at).toBeGreaterThan(0);
    expect(worldEventEnteredView(0, 220)).toBe(true);
    expect(worldEventEnteredView(0, 600)).toBe(false);
    expect(worldEventEnteredView(60, 600)).toBe(true);
    expect(ROUND_ITEM_EVENTS[0]?.map((event) => event.item)).toContain("blueYashichi");
    expect(ROUND_ITEM_EVENTS[2]?.map((event) => event.item)).toContain("skull");
    expect(ROUND_ITEM_EVENTS[2]?.map((event) => event.item)).toEqual(["pow", "redYashichi", "skull", "blueYashichi", "skull", "skull", "redYashichi", "skull"]);
    expect(ROUND_ITEM_EVENTS[3]?.map((event) => event.item)).toEqual(["blueYashichi", "blueYashichi", "redYashichi", "redYashichi", "skull", "pow", "skull"]);
    expect(ROUND_ITEM_EVENTS[4]?.map((event) => event.item)).toEqual(["blueYashichi", "redYashichi", "pow", "skull", "skull", "skull"]);
    expect(ROUND_ITEM_EVENTS[5]?.map((event) => event.item)).toEqual(["pow", "blueYashichi", "redYashichi"]);
    expect(ROUND_ITEM_EVENTS[1]?.filter((event) => event.loopOnly)).toEqual([{ at: 300, xOffset: -170, item: "horse", loopOnly: true }]);
    expect(ROUND_ITEM_EVENTS[1]?.map((event) => event.item)).toEqual(["horse", "skull", "blueYashichi", "redYashichi", "skull", "pow"]);
    expect(ROUND_ITEM_EVENTS.flatMap((events, round) => events.filter((event) => event.item === "horse").map(() => round + 1))).toEqual([1, 2]);
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

  it("decodes the six ROM collision rings in world coordinates", () => {
    expect(ROUND_COLLISION_ROW_COUNTS).toEqual([192, 192, 320, 240, 192, 320]);
    expect(roundCollisionBlocks(1, 45, 480, 455)).toBe(false);
    expect(roundCollisionBlocks(1, 45, 0, 455)).toBe(true);
    expect(roundCollisionBlocks(1, 2.25, 810, 60.75)).toBe(false);
    expect(roundCollisionBlocks(1, 2.25, 810, 114.75)).toBe(true);
  });

  it("keeps the ROM enemy event streams ordered and bounded", () => {
    expect(ROUND_ROM_ENEMY_EVENT_COUNTS).toEqual([128, 137, 275, 299, 185, 313]);
    expect(ROUND_ROM_OBJECT_EVENT_COUNTS).toEqual([42, 20, 32, 22, 24, 23]);
    expect(ROM_BEHAVIOR_ENEMY_TYPES).toHaveLength(12);
    expect(ROM_BEHAVIOR_ENEMY_TYPES[1]).toBe("shotgunner");
    expect(ROM_BEHAVIOR_ENEMY_TYPES[3]).toBe("backstabber");
    expect(ROM_ENEMY_SLOT_CAPACITY).toBe(7);
    expect(ROM_OBJECT_SLOT_CAPACITY).toBe(6);
    expect(ROM_NON_ENEMY_OBJECT_BEHAVIORS).toEqual([5]);
    expect(ROM_OBJECT_PICKUPS).toEqual({ 33: "boots", 34: "rifle", 35: "pow", 37: "horse", 38: "redYashichi", 39: "skull", 42: "blueYashichi" });
    expect(ROM_SCENE_ENEMY_DISPATCH_TYPES).toEqual([7]);
    expect(ROUND_ROM_ENEMY_EVENTS.flatMap((stream) => stream).every((event) => event.pool === "enemy" || event.pool === "object")).toBe(true);
    expect(canSpawnRomPool("enemy", 6)).toBe(true);
    expect(canSpawnRomPool("enemy", 7)).toBe(false);
    expect(canSpawnRomPool("object", 5)).toBe(true);
    expect(canSpawnRomPool("object", 6)).toBe(false);
    for (const stream of ROUND_ROM_ENEMY_EVENTS) {
      expect(stream.every((event, index) => index === 0 || romEventWorldAt(event) >= romEventWorldAt(stream[index - 1]!))).toBe(true);
      expect(stream.every((event) => romEventWorldX(event) >= 0 && romEventWorldX(event) <= 960 && romEventWorldY(event) >= 0 && romEventWorldY(event) <= 540)).toBe(true);
    }
    expect(romEventWorldY(ROUND_ROM_ENEMY_EVENTS[0]![0]!)).toBe(0);
    expect(ROUND_ROM_OBJECT_EVENTS.every((stream) => stream.filter((event) => event.semantic === "wantedTrigger").length === 1)).toBe(true);
  });

  it("keeps Boss units alive until their health reaches zero", () => {
    expect(unitMaxAge("boss")).toBe(Number.POSITIVE_INFINITY);
    expect(unitMaxAge("enemy")).toBe(18);
    expect(unitMaxAge("projectile")).toBe(2.5);
  });

  it("matches the traced Bomber and dynamite frame timing", () => {
    expect(BOMBER_FIRST_THROW_DELAY).toBeCloseTo(198 / 60.098, 9);
    expect(BOMBER_THROW_INTERVAL).toBeCloseTo(106 / 60.098, 9);
    expect(DYNAMITE_AIRBORNE_DURATION).toBeCloseTo(212 / 60.098, 9);
    expect(DYNAMITE_LANDED_DURATION).toBeCloseTo(53 / 60.098, 9);
    expect(DYNAMITE_LIFETIME).toBeCloseTo(265 / 60.098, 9);
    expect(DYNAMITE_WORLD_SPEED).toBeCloseTo(56.73, 1);
  });

  it("matches the traced Shotgunner volley timing", () => {
    expect(SHOTGUNNER_FIRST_VOLLEY_DELAY).toBeCloseTo(108 / 60.098, 9);
    expect(SHOTGUNNER_VOLLEY_INTERVAL).toBeCloseTo(51 / 60.098, 9);
    expect(SHOTGUNNER_LIFETIME).toBeCloseTo(228 / 60.098, 9);
  });

  it("matches the traced Sniper firing windows", () => {
    expect(SNIPER_SHOT_FRAMES).toEqual([134, 224, 405, 495, 585]);
    expect(SNIPER_LIFETIME).toBeCloseTo(732 / 60.098, 9);
  });

  it("matches the traced Rifleman volley timing", () => {
    expect(RIFLEMAN_FIRST_SHOT_DELAY).toBeCloseTo(96 / NES_FRAME_RATE, 9);
    expect(RIFLEMAN_SHOT_INTERVAL).toBeCloseTo(16 / NES_FRAME_RATE, 9);
    expect(RIFLEMAN_SHOTS_PER_VOLLEY).toBe(5);
    expect(RIFLEMAN_BULLET_SPEED).toBeCloseTo(50.7077, 3);
  });

  it("matches the traced Ninja shot timing", () => {
    expect(NINJA_FIRST_SHOT_DELAY).toBeCloseTo(103 / NES_FRAME_RATE, 9);
    expect(NINJA_PROJECTILE_SPEED).toBe(300);
  });

  it("matches the traced falling-rock hazard timing", () => {
    expect(ROCK_WORLD_SPEED_X).toBe(230);
    expect(ROCK_WORLD_SPEED_Y).toBe(236);
    expect(ROCK_IMPACT_DELAY).toBeCloseTo(24 / NES_FRAME_RATE, 9);
    expect(ROCK_LIFETIME).toBeCloseTo(49 / NES_FRAME_RATE, 9);
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
