import { describe, expect, it } from "vitest";
import { AMMO_GAIN, backstabberRaidOffset, BACKSTABBER_AMBUSH_DEPTH, BACKSTABBER_AMBUSH_DROP_SPEED, BACKSTABBER_AMBUSH_LIFETIME, BACKSTABBER_RAID_LIFETIME, BOMBER_FIRST_THROW_DELAY, BOMBER_THROW_INTERVAL, bossReward, BOSS_REWARDS, BOOTS_SPEED_MULTIPLIER, clamp, distance, DYNAMITE_AIRBORNE_DURATION, DYNAMITE_LANDED_DURATION, DYNAMITE_LIFETIME, DYNAMITE_WORLD_SPEED, EMPTY_BARREL_EXPLOSION_LIFETIME, FIREBREATHER_FIRST_SHOT_DELAY, FIREBREATHER_PROJECTILE_SPEED, formationEntryY, HATCHET_FIRST_SHOT_DELAY, HATCHET_PROJECTILE_SPEED, MACHINE_GUN_BULLET_LIFETIME, MAGNUM_BULLET_LIFETIME, MAGNUM_BULLET_SPEED, MAX_STAGE, NES_BULLET_SPEED, NES_DIAGONAL_BULLET_X, NES_DIAGONAL_BULLET_Y, NES_FRAME_RATE, NES_PLAYER_SPEED, NES_SCROLL_SPEED, NINJA_FIRST_SHOT_DELAY, NINJA_PROJECTILE_SPEED, obstacleBlocks, PISTOL_BULLET_LIFETIME, RIFLEMAN_ATTACK_STATE_FRAME, RIFLEMAN_BULLET_SPEED, RIFLEMAN_FIRST_SHOT_DELAY, RIFLEMAN_SHOT_INTERVAL, RIFLEMAN_SHOTS_PER_VOLLEY, ROCK_IMPACT_DELAY, ROCK_LIFETIME, ROCK_WORLD_SPEED_X, ROCK_WORLD_SPEED_Y, ROM_ENEMY_SCREEN_MAX_Y, ROM_ENEMY_SCREEN_MAX_Y_NES, ROM_OBJECT_DROP_SPEED, ROAD_WIDTHS, ROUND_BOSS_GATE_SCROLL_NES, ROUND_BOSS_TRIGGERS, ROUND_ENEMY_TYPES, ROUND_LENGTHS, ROUND_LOOP_SCROLL_NES, ROUND_OBSTACLES, ROUND_SEGMENTS, SHOTGUN_BULLET_LIFETIME, SHOTGUNNER_FAN_NES, SHOTGUNNER_FIRST_VOLLEY_DELAY, SHOTGUNNER_LIFETIME, SHOTGUNNER_VOLLEY_INTERVAL, SHOP_COSTS, SHOP_TYPES, SMART_BOMB_CAPACITY, SNIPER_LIFETIME, SNIPER_SHOT_FRAMES, SPEAR_FIRST_SHOT_DELAY, SPEAR_PROJECTILE_SPEED, segmentDelay, spendPoints, STAGES, unitMaxAge, WEAPONS, WANTED_COSTS, WORLD_BULLET_SPEED, WORLD_DIAGONAL_BULLET_X, WORLD_DIAGONAL_BULLET_Y, WORLD_PLAYER_SPEED, WORLD_SCROLL_SPEED, nextExtraLifeScore, scoreExtraLives, shouldLoopStage } from "../src/game-constants";
import { GUNMAN_BULLET_SPEED, GUNMAN_FIRST_SHOT_DELAY, GUNMAN_LIFETIME } from "../src/game-constants";
import { RIFLEMAN_LIFETIME, RIFLEMAN_PATH_NES, riflemanPosition } from "../src/game-constants";
import { BOMBER_ENTRY_DURATION, BOMBER_ENTRY_END_Y, BOMBER_ENTRY_END_Y_NES, bomberOpeningY } from "../src/game-constants";
import { BOMBER_FIRST_MANEUVER_NES, bomberFirstManeuverPosition } from "../src/game-constants";
import { DYNAMITE_AIM_FACTOR, dynamiteContactIsDefusable, DYNAMITE_HORIZONTAL_DURATION, DYNAMITE_VERTICAL_PATH_NES, dynamiteVerticalOffset } from "../src/game-constants";
import { BANDIT_BILL_BULLET_SPEED, BANDIT_BILL_ENTRY_DURATION, BANDIT_BILL_ENTRY_END_Y, BANDIT_BILL_ENTRY_SPEED_Y, BANDIT_BILL_ENTRY_X_LANES, BANDIT_BILL_ENTRY_X_NES, BANDIT_BILL_ENTRY_Y, BANDIT_BILL_ENTRY_Y_NES, BANDIT_BILL_FIRST_VOLLEY_DELAY, BANDIT_BILL_SHOT_INTERVAL, BANDIT_BILL_SHOTS_PER_VOLLEY, BANDIT_BILL_VOLLEY_GAP, banditBillCombatX, banditBillCombatY, banditBillOpeningY, CUTTER_ENTRY_DURATION, CUTTER_ENTRY_END_Y, CUTTER_ENTRY_END_Y_NES, CUTTER_ENTRY_SPEED_Y, CUTTER_ENTRY_X_LANES, CUTTER_ENTRY_X_NES, CUTTER_ENTRY_Y, CUTTER_ENTRY_Y_NES, cutterCombatY, cutterOpeningY, DEVIL_HAWK_ENTRY_DURATION, DEVIL_HAWK_ENTRY_END_Y, DEVIL_HAWK_ENTRY_END_Y_NES, DEVIL_HAWK_ENTRY_SPEED_Y, DEVIL_HAWK_ENTRY_X_LANES, DEVIL_HAWK_ENTRY_X_NES, DEVIL_HAWK_ENTRY_Y, DEVIL_HAWK_ENTRY_Y_NES, DEVIL_HAWK_POST_ENTRY_X_HOLD, devilHawkCombatX, devilHawkOpeningY, FATMAN_JOE_ENTRY_DURATION, FATMAN_JOE_ENTRY_END_Y, FATMAN_JOE_ENTRY_END_Y_NES, FATMAN_JOE_ENTRY_X, FATMAN_JOE_ENTRY_X_NES, FATMAN_JOE_ENTRY_Y, FATMAN_JOE_ENTRY_Y_NES, fatmanJoeCombatY, fatmanJoeOpeningY, NINJA_BOSS_ENTRY_X_LANES, NINJA_BOSS_ENTRY_X_NES, NINJA_BOSS_ENTRY_Y_LANES, NINJA_BOSS_ENTRY_Y_NES, NES_WORLD_X_SCALE, WINGATE_ENTRY_DURATION, WINGATE_ENTRY_END_Y, WINGATE_ENTRY_END_Y_NES, WINGATE_ENTRY_X, WINGATE_ENTRY_X_NES, WINGATE_ENTRY_Y, WINGATE_ENTRY_Y_NES, WINGATE_SECOND_ENTRY_X, WINGATE_SECOND_ENTRY_X_NES, WINGATE_SECOND_ENTRY_Y, WINGATE_SECOND_ENTRY_Y_NES, WINGATE_SECOND_SPAWN_DELAY, wingateOpeningY } from "../src/game-constants";
import { banditBillCooldown } from "../src/game-constants";
import { BLUE_YASHICHI_DURATION, MAX_LIVES } from "../src/game-constants";
import { RIFLE_BULLET_SPEED_MULTIPLIER } from "../src/game-constants";
import { BOSS_PROJECTILE_CAPACITY, canSpawnBossProjectile, canSpawnEnemyProjectile, canSpawnPlayerBullet, ENEMY_PROJECTILE_CAPACITY, machineGunVelocities, pistolBulletSpeedFactor, pistolShots, pistolVelocities, PLAYER_BULLET_CAPACITY, shotgunVelocities, weaponBulletLifetime, weaponCanRepeat } from "../src/game-constants";
import { MAX_POWERUP_STOCK, POWERUP_OVERFLOW_SCORE, storedPowerupPickup } from "../src/game-constants";
import { FATMAN_JOE_FIRST_VOLLEY_DELAY, FATMAN_JOE_GRENADE_LIFETIME, FATMAN_JOE_MOVEMENT_SPEED, FATMAN_JOE_SHOT_INTERVAL, FATMAN_JOE_VOLLEY_GAP, FATMAN_JOE_VOLLEY_INTERVAL, FATMAN_JOE_VOLLEY_SIZE } from "../src/game-constants";
import { WINGATE_BULLET_SPEED, WINGATE_ENTRY_RUSH_DURATION, WINGATE_ENTRY_RUSH_SPEED, WINGATE_FIRST_SHOT_DELAY, WINGATE_FIRST_VOLLEY_GAP, WINGATE_FIRST_VOLLEY_SIZE, WINGATE_MOVEMENT_SPEED, WINGATE_PROJECTILE_X_OFFSET_NES, WINGATE_SECOND_FIRST_SHOT_DELAY, WINGATE_SECOND_VOLLEY_GAP, WINGATE_SECOND_VOLLEY_SIZE, WINGATE_SHOT_INTERVAL, wingateCombatY, wingateShotCooldown } from "../src/game-constants";
import { CUTTER_ATTACK_INTERVAL, CUTTER_BOOMERANG_SPAWN_NES, CUTTER_BOOMERANG_SPEED, CUTTER_BOOMERANG_VELOCITIES_NES, CUTTER_FIRST_ATTACK_DELAY } from "../src/game-constants";
import { CUTTER_MOVEMENT_SPEED } from "../src/game-constants";
import { DEVIL_HAWK_FIREBALL_FAN_NES, DEVIL_HAWK_FIREBALL_SIDE_FANS_NES, DEVIL_HAWK_FIREBALL_SPEED, DEVIL_HAWK_FIRST_VOLLEY_DELAY, DEVIL_HAWK_JUMP_PERIOD, DEVIL_HAWK_VOLLEY_INTERVAL } from "../src/game-constants";
import { devilHawkCombatY } from "../src/game-constants";
import { NINJA_BOSS_ATTACK_INTERVAL, NINJA_BOSS_ENTRY_INVULNERABILITY, NINJA_BOSS_FIRST_ATTACK_DELAY, NINJA_BOSS_SHURIKEN_COUNT, NINJA_BOSS_SHURIKEN_LIFETIME, NINJA_BOSS_SHURIKEN_SPAWN_OFFSET_NES, NINJA_BOSS_SHURIKEN_VELOCITIES_NES, ninjaBossCombatY } from "../src/game-constants";
import { romEnemyDrop } from "../src/game-constants";
import { roundCollisionBlocks, ROUND_COLLISION_ROW_COUNTS } from "../src/round-collision";
import { canSpawnRomPool, ROM_BREAKABLE_CONTAINER_DISPATCH_TYPES, ROM_EMPTY_BARREL_ENTITY_CODES, ROM_ENEMY_SLOT_CAPACITY, ROM_NON_ENEMY_OBJECT_BEHAVIORS, ROM_OBJECT_PICKUPS, ROM_OBJECT_SLOT_CAPACITY, ROM_SCENE_PROP_DISPATCH_TYPES, ROUND_ROM_ENEMY_EVENTS, ROUND_ROM_ENEMY_EVENT_COUNTS, ROUND_ROM_OBJECT_EVENTS, ROUND_ROM_OBJECT_EVENT_COUNTS, ROM_BEHAVIOR_ENEMY_TYPES, romEventWorldAt, romEventWorldX, romEventWorldY, romObjectWorldAt, romObjectWorldX } from "../src/rom-event-data";

describe("Gun.Smoke vertical slice", () => {
  it("keeps the NES-inspired stage constants stable", () => {
    expect({ frameRate: NES_FRAME_RATE, rounds: MAX_STAGE }).toEqual({ frameRate: 60.098, rounds: 6 });
    expect(MAX_LIVES).toBe(5);
    expect(BLUE_YASHICHI_DURATION).toBeCloseTo(180 / NES_FRAME_RATE, 9);
    expect(ROUND_BOSS_GATE_SCROLL_NES).toEqual([2_767, 2_799, 4_863, 3_487, 2_879, 4_879]);
    expect(ROUND_LOOP_SCROLL_NES).toEqual([3_087, 3_055, 5_119, 3_839, 3_055, 5_119]);
    expect(ROUND_BOSS_TRIGGERS[0]).toBe(6_225.75);
    expect(ROUND_LENGTHS[5]).toBe(11_517.75);
    expect(NES_SCROLL_SPEED).toBeCloseTo(20.032667, 6);
    expect(WORLD_SCROLL_SPEED).toBeCloseTo(45.0735, 6);
    expect(ROM_OBJECT_DROP_SPEED).toBeCloseTo(WORLD_SCROLL_SPEED * 2, 9);
    expect(ROM_ENEMY_SCREEN_MAX_Y_NES).toBe(160);
    expect(ROM_ENEMY_SCREEN_MAX_Y).toBeCloseTo(ROM_ENEMY_SCREEN_MAX_Y_NES * (540 / 240), 9);
    expect(NES_PLAYER_SPEED).toBeCloseTo(75.1225, 6);
    expect(WORLD_PLAYER_SPEED).toBeCloseTo(169.025625, 6);
    expect(BOOTS_SPEED_MULTIPLIER).toBeCloseTo(4 / 3, 9);
    expect(NES_BULLET_SPEED).toBeCloseTo(360.588, 6);
    expect(WORLD_BULLET_SPEED).toBeCloseTo(811.323, 6);
    expect(NES_DIAGONAL_BULLET_X).toBeCloseTo(150.245, 6);
    expect(NES_DIAGONAL_BULLET_Y).toBeCloseTo(300.49, 6);
    expect(WORLD_DIAGONAL_BULLET_X).toBeCloseTo(338.05125, 6);
    expect(WORLD_DIAGONAL_BULLET_Y).toBeCloseTo(676.1025, 6);
    expect(PISTOL_BULLET_LIFETIME).toBeCloseTo(15 / 60.098, 9);
    expect(RIFLE_BULLET_SPEED_MULTIPLIER).toBeCloseTo(4 / 3, 9);
    expect({ speed: MAGNUM_BULLET_SPEED, lifetime: MAGNUM_BULLET_LIFETIME }).toEqual({ speed: WORLD_BULLET_SPEED, lifetime: 34 / NES_FRAME_RATE });
  });

  it("keeps collision helpers bounded and Euclidean", () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("matches the NES two-gun pistol directions", () => {
    expect(pistolShots(true, false)).toEqual([{ direction: -1, offset: -8 }, { direction: -1, offset: 8 }]);
    expect(pistolShots(false, true)).toEqual([{ direction: 1, offset: -8 }, { direction: 1, offset: 8 }]);
    expect(pistolShots(true, true)).toEqual([{ direction: 0, offset: -8 }, { direction: 0, offset: 8 }]);
    expect(pistolVelocities(true, false)).toEqual([[-3, -5, -8], [-2, -5, 8]]);
    expect(machineGunVelocities(false, true)).toEqual([[4, -9, -8], [7, -7, 8]]);
    expect([pistolBulletSpeedFactor(0), pistolBulletSpeedFactor(4)]).toEqual([1, RIFLE_BULLET_SPEED_MULTIPLIER]);
  });

  it("matches the traced five-way Shotgun fans", () => {
    expect(shotgunVelocities(false, true)).toEqual([[0, -12], [4, -11], [8, -8], [11, -4], [12, 0]]);
    expect(shotgunVelocities(true, false)).toEqual([[-12, 0], [-11, -4], [-8, -8], [-4, -11], [0, -12]]);
    expect(shotgunVelocities(true, true)).toEqual([[-8, -8], [-4, -11], [0, -12], [4, -11], [8, -8]]);
  });

  it("only repeats fire for the traced automatic weapon", () => {
    expect(["pistol", "shotgun", "machinegun", "magnum"].map((weapon) => weaponCanRepeat(weapon as keyof typeof WEAPONS))).toEqual([false, false, true, false]);
  });

  it("matches traced player projectile lifetimes", () => {
    expect([PISTOL_BULLET_LIFETIME, SHOTGUN_BULLET_LIFETIME, MACHINE_GUN_BULLET_LIFETIME, MAGNUM_BULLET_LIFETIME]).toEqual([15, 11, 15, 34].map((frames) => frames / NES_FRAME_RATE));
    expect(["pistol", "shotgun", "machinegun", "magnum"].map((weapon) => weaponBulletLifetime(weapon as keyof typeof WEAPONS))).toEqual([PISTOL_BULLET_LIFETIME, SHOTGUN_BULLET_LIFETIME, MACHINE_GUN_BULLET_LIFETIME, MAGNUM_BULLET_LIFETIME]);
  });

  it("caps the traced player projectile pool at six slots", () => {
    expect(PLAYER_BULLET_CAPACITY).toBe(6);
    expect([5, 6].map(canSpawnPlayerBullet)).toEqual([true, false]);
  });

  it("reserves the traced eight-slot enemy projectile pool atomically", () => {
    expect(ENEMY_PROJECTILE_CAPACITY).toBe(8);
    expect([canSpawnEnemyProjectile(7), canSpawnEnemyProjectile(8), canSpawnEnemyProjectile(5, 3), canSpawnEnemyProjectile(6, 3)]).toEqual([true, false, true, false]);
  });

  it("keeps the six-slot Boss projectile pool separate", () => {
    expect(BOSS_PROJECTILE_CAPACITY).toBe(6);
    expect([canSpawnBossProjectile(5), canSpawnBossProjectile(6)]).toEqual([true, false]);
  });

  it("uses the ROM enemy drop flag and current special stock", () => {
    expect([romEnemyDrop(0, false), romEnemyDrop(0x80, false), romEnemyDrop(0x80, true)]).toEqual([undefined, "moneyBag", "ammo"]);
  });

  it("loops a stage only when the wanted poster is missing", () => {
    expect(shouldLoopStage(ROUND_LENGTHS[0]!, 1, false)).toBe(true);
    expect(shouldLoopStage(ROUND_LENGTHS[0]!, 1, true)).toBe(false);
  });

  it("matches the NES score-life thresholds", () => {
    expect(nextExtraLifeScore(30_000)).toBe(100_000);
    expect(nextExtraLifeScore(100_000)).toBe(200_000);
    expect(scoreExtraLives(230_000, 30_000)).toEqual({ lives: 3, nextThreshold: 300_000 });
    expect(spendPoints(10_000, 6_000)).toBe(4_000);
    expect(spendPoints(5_999, 6_000)).toBeUndefined();
  });

  it("caps stored Boots and Rifle with the traced overflow reward", () => {
    expect(MAX_POWERUP_STOCK).toBe(4);
    expect(POWERUP_OVERFLOW_SCORE).toBe(100);
    expect(storedPowerupPickup(3)).toEqual({ stock: 4, score: 0 });
    expect(storedPowerupPickup(4)).toEqual({ stock: 4, score: 100 });
  });

  it("keeps the round shop cadence explicit", () => {
    const shopEvents = ROUND_ROM_OBJECT_EVENTS.map((events) => events.filter((event) => event.semantic === "weaponShop" || event.semantic === "supplyShop"));
    expect(SHOP_TYPES).toEqual([
      ["weapons", "supplies"], ["weapons", "supplies"], ["weapons", "supplies", "weapons"],
      ["weapons", "supplies"], ["weapons", "supplies"], ["weapons", "supplies", "weapons"],
    ]);
    expect(shopEvents.map((events) => events.map((event) => event.semantic === "weaponShop" ? "weapons" : "supplies"))).toEqual(SHOP_TYPES);
    expect(shopEvents.map((events) => events.map((event) => event.at))).toEqual([
      [959, 1_695], [815, 1_455], [623, 2_031, 3_311], [543, 1_471], [79, 1_631], [383, 1_951, 2_335],
    ]);
    expect(shopEvents.map((events) => events.map((event) => event.x))).toEqual([
      [56, 200], [168, 64], [40, 216, 40], [40, 216], [152, 72], [216, 216, 56],
    ]);
    expect(shopEvents.flat().every((event) => romObjectWorldAt(event) === event.at * (540 / 240) && romObjectWorldX(event) === event.x * (960 / 256))).toBe(true);
    expect(ROAD_WIDTHS).toHaveLength(MAX_STAGE);
    expect(ROAD_WIDTHS[0]).toBe(730);
    expect(ROAD_WIDTHS[2]).toBeLessThan(ROAD_WIDTHS[4]);
    expect(WEAPONS.shotgun.maxAmmo).toBe(120);
    expect([WEAPONS.pistol.interval, WEAPONS.shotgun.interval, WEAPONS.machinegun.interval, WEAPONS.magnum.interval]).toEqual([4, 12, 5, 4].map((frames) => frames / NES_FRAME_RATE));
    expect(WEAPONS.magnum.damage).toBeGreaterThan(WEAPONS.pistol.damage);
    expect(AMMO_GAIN.pistol).toBe(0);
    expect(AMMO_GAIN.magnum).toBeLessThan(AMMO_GAIN.machinegun);
    expect(SHOP_COSTS).toEqual({ shotgun: 6_000, machinegun: 10_000, magnum: 20_000, horse: 20_000, ammo: 1_500, smartBomb: 8_000 });
    expect(SMART_BOMB_CAPACITY).toBe(1);
    expect(AMMO_GAIN).toEqual({ pistol: 0, shotgun: 20, machinegun: 40, magnum: 10 });
    expect(WANTED_COSTS).toEqual([20_000, 24_000, 50_000, 40_000, 40_000, 60_000]);
    expect(BOSS_REWARDS).toEqual(WANTED_COSTS.map((cost) => cost / 2));
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
    expect(ROM_EMPTY_BARREL_ENTITY_CODES).toEqual([32, 41]);
    expect(EMPTY_BARREL_EXPLOSION_LIFETIME).toBeCloseTo(10 / NES_FRAME_RATE, 9);
    expect(ROM_NON_ENEMY_OBJECT_BEHAVIORS).toEqual([5]);
    expect(ROM_OBJECT_PICKUPS).toEqual({ 33: "boots", 34: "rifle", 35: "pow", 36: "money", 37: "horse", 38: "redYashichi", 39: "skull", 42: "blueYashichi" });
    expect(ROM_BREAKABLE_CONTAINER_DISPATCH_TYPES).toEqual([7]);
    expect(ROM_SCENE_PROP_DISPATCH_TYPES).toEqual([8]);
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
    expect(ROUND_ROM_OBJECT_EVENTS.every((stream) => stream.filter((event) => event.semantic === "supplyShop").length === 1)).toBe(true);
    expect(ROUND_ROM_OBJECT_EVENTS.flatMap((stream) => stream.filter((event) => event.semantic === "supplyShop")).every((event) => (event.flags & 0x40) !== 0)).toBe(true);
    expect(ROUND_ROM_OBJECT_EVENTS.map((stream) => stream.filter((event) => event.semantic === "weaponShop").length)).toEqual([1, 1, 2, 1, 1, 2]);
    expect(ROUND_ROM_OBJECT_EVENTS.flat().every((event) => event.pool === "enemy" || event.pool === "object")).toBe(true);
  });

  it("keeps Boss units alive until their health reaches zero", () => {
    expect(unitMaxAge("boss")).toBe(Number.POSITIVE_INFINITY);
    expect(unitMaxAge("enemy")).toBe(18);
    expect(unitMaxAge("projectile")).toBe(2.5);
  });

  it("matches the traced Bomber and dynamite frame timing", () => {
    expect(BOMBER_FIRST_THROW_DELAY).toBeCloseTo(198 / 60.098, 9);
    expect(BOMBER_THROW_INTERVAL).toBeCloseTo(106 / 60.098, 9);
    expect(BOMBER_ENTRY_DURATION).toBeCloseTo(125 / NES_FRAME_RATE, 9);
    expect(BOMBER_ENTRY_END_Y_NES).toBe(126);
    expect(BOMBER_ENTRY_END_Y).toBeCloseTo(126 * (540 / 240), 9);
    expect(bomberOpeningY(0)).toBe(0);
    expect(bomberOpeningY(BOMBER_ENTRY_DURATION / 2)).toBeCloseTo(BOMBER_ENTRY_END_Y / 2, 9);
    expect(bomberOpeningY(BOMBER_ENTRY_DURATION)).toBe(BOMBER_ENTRY_END_Y);
    expect(BOMBER_FIRST_MANEUVER_NES).toEqual([[0, 0, 0], [125, 0, 126], [150, 21, 126], [175, 37, 114], [190, 41, 111], [198, 35, 113]]);
    expect(bomberFirstManeuverPosition(150 / NES_FRAME_RATE)).toEqual([21, 126]);
    expect(bomberFirstManeuverPosition(162.5 / NES_FRAME_RATE)).toEqual([29, 120]);
    expect(bomberFirstManeuverPosition(BOMBER_FIRST_THROW_DELAY, -1)).toEqual([-35, 113]);
    expect(DYNAMITE_AIRBORNE_DURATION).toBeCloseTo(212 / 60.098, 9);
    expect(DYNAMITE_LANDED_DURATION).toBeCloseTo(53 / 60.098, 9);
    expect(DYNAMITE_LIFETIME).toBeCloseTo(265 / 60.098, 9);
    expect(DYNAMITE_WORLD_SPEED).toBeCloseTo(56.73, 1);
    expect(DYNAMITE_HORIZONTAL_DURATION).toBeCloseTo(40 / NES_FRAME_RATE, 9);
    expect(DYNAMITE_AIM_FACTOR).toBe(0.25);
    expect(DYNAMITE_VERTICAL_PATH_NES).toEqual([[0, 0], [20, 18], [40, 32], [212, 89]]);
    expect(dynamiteVerticalOffset(20 / NES_FRAME_RATE)).toBeCloseTo(18 * (540 / 240), 9);
    expect(dynamiteVerticalOffset(30 / NES_FRAME_RATE)).toBeCloseTo(25 * (540 / 240), 9);
    expect(dynamiteVerticalOffset(DYNAMITE_AIRBORNE_DURATION)).toBeCloseTo(89 * (540 / 240), 9);
    expect(dynamiteContactIsDefusable(DYNAMITE_AIRBORNE_DURATION - 1 / NES_FRAME_RATE)).toBe(true);
    expect(dynamiteContactIsDefusable(DYNAMITE_AIRBORNE_DURATION)).toBe(false);
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
    expect(RIFLEMAN_ATTACK_STATE_FRAME).toBe(122);
    expect(RIFLEMAN_FIRST_SHOT_DELAY).toBeCloseTo(138 / NES_FRAME_RATE, 9);
    expect(RIFLEMAN_SHOT_INTERVAL).toBeCloseTo(16 / NES_FRAME_RATE, 9);
    expect(RIFLEMAN_SHOTS_PER_VOLLEY).toBe(5);
    expect(RIFLEMAN_LIFETIME).toBeCloseTo(364 / NES_FRAME_RATE, 9);
    expect(RIFLEMAN_PATH_NES).toEqual([[0, 0], [121, 121], [211, 151], [363, 0]]);
    expect(riflemanPosition(121 / NES_FRAME_RATE)).toEqual([0, 121]);
    expect(riflemanPosition(211 / NES_FRAME_RATE)).toEqual([0, 151]);
    expect(riflemanPosition(363 / NES_FRAME_RATE)).toEqual([0, 0]);
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

  it("matches the traced Hatchet timing", () => {
    expect(HATCHET_FIRST_SHOT_DELAY).toBeCloseTo(78 / NES_FRAME_RATE, 9);
    expect(HATCHET_PROJECTILE_SPEED).toBe(230);
  });

  it("matches the traced Firebreather timing", () => {
    expect(FIREBREATHER_FIRST_SHOT_DELAY).toBeCloseTo(156 / NES_FRAME_RATE, 9);
    expect(FIREBREATHER_PROJECTILE_SPEED).toBe(250);
  });

  it("matches the traced Spear timing", () => {
    expect(SPEAR_FIRST_SHOT_DELAY).toBeCloseTo(72 / NES_FRAME_RATE, 9);
    expect(SPEAR_PROJECTILE_SPEED).toBe(250);
  });

  it("matches the traced Round 5 ambush backstabber", () => {
    expect(BACKSTABBER_AMBUSH_DROP_SPEED).toBe(45);
    expect(BACKSTABBER_AMBUSH_DEPTH).toBe(191);
    expect(BACKSTABBER_AMBUSH_LIFETIME).toBeCloseTo(407 / NES_FRAME_RATE, 9);
  });

  it("interpolates the traced side-raid backstabber path", () => {
    expect(backstabberRaidOffset(0)).toEqual([0, 0]);
    expect(backstabberRaidOffset(60)).toEqual([84.5, 13.5]);
    expect(backstabberRaidOffset(160)).toEqual([174, 89]);
    expect(backstabberRaidOffset(999)).toEqual([213, 74]);
    expect(BACKSTABBER_RAID_LIFETIME).toBeCloseTo(369 / NES_FRAME_RATE, 9);
  });

  it("matches the traced Gunman shot timing", () => {
    expect(GUNMAN_FIRST_SHOT_DELAY).toBeCloseTo(39 / NES_FRAME_RATE, 9);
    expect(GUNMAN_BULLET_SPEED).toBe(266);
    expect(GUNMAN_LIFETIME).toBeCloseTo(289 / NES_FRAME_RATE, 9);
  });

  it("matches the traced Bandit Bill volley timing", () => {
    expect(BANDIT_BILL_FIRST_VOLLEY_DELAY).toBeCloseTo(107 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_SHOT_INTERVAL).toBeCloseTo(12 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_VOLLEY_GAP).toBeCloseTo(72 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_SHOTS_PER_VOLLEY).toBe(4);
    expect(BANDIT_BILL_BULLET_SPEED).toBe(444);
    expect([1, 2, 3, 4, 5].map(banditBillCooldown)).toEqual([
      BANDIT_BILL_SHOT_INTERVAL, BANDIT_BILL_SHOT_INTERVAL, BANDIT_BILL_SHOT_INTERVAL, BANDIT_BILL_VOLLEY_GAP, BANDIT_BILL_SHOT_INTERVAL,
    ]);
  });

  it("matches the traced Bandit Bill entrance", () => {
    expect(NES_WORLD_X_SCALE).toBe(960 / 256);
    expect(BANDIT_BILL_ENTRY_X_NES).toEqual([96, 128, 160, 192]);
    expect(BANDIT_BILL_ENTRY_X_LANES).toEqual([360, 480, 600, 720]);
    expect(BANDIT_BILL_ENTRY_Y_NES).toBe(0);
    expect(BANDIT_BILL_ENTRY_Y).toBe(0);
    expect(BANDIT_BILL_ENTRY_END_Y).toBe(144);
    expect(BANDIT_BILL_ENTRY_DURATION).toBeCloseTo(96 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_ENTRY_SPEED_Y).toBeCloseTo((64 / 96) * NES_FRAME_RATE * (540 / 240), 9);
    expect(banditBillOpeningY(0)).toBe(0);
    expect(banditBillOpeningY(BANDIT_BILL_ENTRY_DURATION / 2)).toBe(72);
    expect(banditBillOpeningY(BANDIT_BILL_ENTRY_DURATION)).toBe(144);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION)).toBe(720);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 119 / NES_FRAME_RATE)).toBeCloseTo(110.25, 9);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION + 227 / NES_FRAME_RATE)).toBeCloseTo(551.25, 9);
  });

  it("matches the traced Cutter entrance", () => {
    expect(CUTTER_ENTRY_X_NES).toEqual([88, 144, 168]);
    expect(CUTTER_ENTRY_X_LANES).toEqual([330, 540, 630]);
    expect(CUTTER_ENTRY_Y_NES).toBe(0);
    expect(CUTTER_ENTRY_Y).toBe(0);
    expect(CUTTER_ENTRY_END_Y_NES).toBe(136);
    expect(CUTTER_ENTRY_END_Y).toBe(306);
    expect(CUTTER_ENTRY_DURATION).toBeCloseTo(324 / NES_FRAME_RATE, 9);
    expect(CUTTER_ENTRY_SPEED_Y).toBeCloseTo((136 / 324) * NES_FRAME_RATE * (540 / 240), 9);
    expect(cutterOpeningY(0)).toBe(0);
    expect(cutterOpeningY(CUTTER_ENTRY_DURATION / 2)).toBe(153);
    expect(cutterOpeningY(CUTTER_ENTRY_DURATION)).toBe(306);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION)).toBe(306);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 71 / NES_FRAME_RATE)).toBe(92.25);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 311 / NES_FRAME_RATE)).toBe(90);
    expect(CUTTER_FIRST_ATTACK_DELAY).toBeCloseTo(350 / NES_FRAME_RATE, 9);
    expect(CUTTER_ATTACK_INTERVAL).toBeCloseTo(256 / NES_FRAME_RATE, 9);
    expect(CUTTER_BOOMERANG_SPEED).toBeCloseTo(Math.hypot(63 * NES_WORLD_X_SCALE, 40 * (540 / 240)) * NES_FRAME_RATE / 29, 9);
    expect(CUTTER_BOOMERANG_SPAWN_NES).toEqual([[-3, 3], [3, 2]]);
    expect(CUTTER_BOOMERANG_VELOCITIES_NES).toEqual([[2.16, 1.35], [-2, 1.77]]);
    expect(CUTTER_MOVEMENT_SPEED).toBeCloseTo((31 / 18) * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
  });

  it("matches the traced Devil Hawk entrance", () => {
    expect(DEVIL_HAWK_ENTRY_X_NES).toEqual([128, 168, 208]);
    expect(DEVIL_HAWK_ENTRY_X_LANES).toEqual([480, 630, 780]);
    expect(DEVIL_HAWK_ENTRY_Y_NES).toBe(0);
    expect(DEVIL_HAWK_ENTRY_Y).toBe(0);
    expect(DEVIL_HAWK_ENTRY_END_Y_NES).toBe(96);
    expect(DEVIL_HAWK_ENTRY_END_Y).toBe(216);
    expect(DEVIL_HAWK_ENTRY_SPEED_Y).toBeCloseTo((96 / 143) * NES_FRAME_RATE * (540 / 240), 9);
    expect(DEVIL_HAWK_POST_ENTRY_X_HOLD).toBeCloseTo(113 / NES_FRAME_RATE, 9);
    expect(devilHawkOpeningY(0)).toBe(0);
    expect(devilHawkOpeningY(DEVIL_HAWK_ENTRY_DURATION / 2)).toBe(108);
    expect(devilHawkOpeningY(DEVIL_HAWK_ENTRY_DURATION)).toBe(216);
    expect(DEVIL_HAWK_FIRST_VOLLEY_DELAY).toBeCloseTo(174 / NES_FRAME_RATE, 9);
    expect(DEVIL_HAWK_VOLLEY_INTERVAL).toBeCloseTo(125 / NES_FRAME_RATE, 9);
    expect(DEVIL_HAWK_FIREBALL_SPEED).toBeCloseTo(3 * NES_FRAME_RATE * (540 / 240), 9);
    expect(DEVIL_HAWK_FIREBALL_FAN_NES).toEqual([[-2, 2], [-1, 3], [0, 3], [1, 3], [2, 2]]);
    expect(DEVIL_HAWK_FIREBALL_SIDE_FANS_NES).toEqual([[[-2, 2], [-1, 3], [0, 3]], [[0, 3], [1, 3], [2, 2]]]);
    expect(DEVIL_HAWK_JUMP_PERIOD).toBe(121);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION)).toBe(216);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 52 / NES_FRAME_RATE)).toBe(108);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION)).toBe(780);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 146 / NES_FRAME_RATE)).toBeCloseTo(588.75, 9);
  });

  it("matches the traced Ninja Boss entrance", () => {
    expect(NINJA_BOSS_ENTRY_X_NES).toEqual([176, 192]);
    expect(NINJA_BOSS_ENTRY_X_LANES).toEqual([660, 720]);
    expect(NINJA_BOSS_ENTRY_Y_NES).toEqual([64, 128]);
    expect(NINJA_BOSS_ENTRY_Y_LANES).toEqual([144, 288]);
    expect(NINJA_BOSS_FIRST_ATTACK_DELAY).toBeCloseTo(179 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_ENTRY_INVULNERABILITY).toBeCloseTo(44 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_ATTACK_INTERVAL).toBeCloseTo(60 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_SHURIKEN_COUNT).toBe(4);
    expect(NINJA_BOSS_SHURIKEN_SPAWN_OFFSET_NES).toEqual([6, -34]);
    expect(NINJA_BOSS_SHURIKEN_VELOCITIES_NES).toEqual([[1.25, -1.5], [1.25, 1.5], [-1.25, 1.5], [-1.25, -1.5]]);
    expect(NINJA_BOSS_SHURIKEN_LIFETIME).toBeCloseTo(40 / NES_FRAME_RATE, 9);
    expect(ninjaBossCombatY(NINJA_BOSS_ENTRY_INVULNERABILITY)).toBe(288);
    expect(ninjaBossCombatY(NINJA_BOSS_ENTRY_INVULNERABILITY + 26 / NES_FRAME_RATE)).toBe(371.25);
    expect(ninjaBossCombatY(NINJA_BOSS_ENTRY_INVULNERABILITY + 551 / NES_FRAME_RATE)).toBe(92.25);
  });

  it("matches the traced Fatman Joe entrance", () => {
    expect(FATMAN_JOE_ENTRY_X_NES).toBe(152);
    expect(FATMAN_JOE_ENTRY_X).toBe(570);
    expect(FATMAN_JOE_ENTRY_Y_NES).toBe(0);
    expect(FATMAN_JOE_ENTRY_Y).toBe(0);
    expect(FATMAN_JOE_ENTRY_END_Y_NES).toBe(112);
    expect(FATMAN_JOE_ENTRY_END_Y).toBe(252);
    expect(fatmanJoeOpeningY(0)).toBe(0);
    expect(fatmanJoeOpeningY(FATMAN_JOE_ENTRY_DURATION / 2)).toBe(126);
    expect(fatmanJoeOpeningY(FATMAN_JOE_ENTRY_DURATION)).toBe(252);
    expect(fatmanJoeOpeningY(FATMAN_JOE_ENTRY_DURATION * 2)).toBe(252);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION)).toBe(252);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 50 / NES_FRAME_RATE)).toBe(319.5);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 450 / NES_FRAME_RATE)).toBe(90);
    expect(FATMAN_JOE_FIRST_VOLLEY_DELAY).toBeCloseTo(205 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_VOLLEY_INTERVAL).toBeCloseTo(131 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_VOLLEY_SIZE).toBe(5);
    expect(FATMAN_JOE_SHOT_INTERVAL).toBeCloseTo(4 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_VOLLEY_GAP).toBeCloseTo(115 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_GRENADE_LIFETIME).toBeCloseTo(30 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_MOVEMENT_SPEED).toBeCloseTo((40 / 75) * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
  });

  it("matches the traced first Wingate entrance", () => {
    expect(WINGATE_ENTRY_X_NES).toBe(152);
    expect(WINGATE_ENTRY_X).toBe(570);
    expect(WINGATE_ENTRY_Y_NES).toBe(0);
    expect(WINGATE_ENTRY_Y).toBe(0);
    expect(WINGATE_ENTRY_END_Y_NES).toBe(98);
    expect(WINGATE_ENTRY_END_Y).toBe(220.5);
    expect(wingateOpeningY(0)).toBe(0);
    expect(wingateOpeningY(WINGATE_ENTRY_DURATION / 2)).toBe(110.25);
    expect(wingateOpeningY(WINGATE_ENTRY_DURATION)).toBe(220.5);
    expect(wingateOpeningY(WINGATE_ENTRY_DURATION * 2)).toBe(220.5);
    expect(wingateCombatY(WINGATE_ENTRY_DURATION)).toBe(220.5);
    expect(wingateCombatY(WINGATE_ENTRY_DURATION + 269 / NES_FRAME_RATE)).toBeCloseTo(218.25, 9);
    expect(wingateCombatY(WINGATE_ENTRY_DURATION + 279 / NES_FRAME_RATE, 1)).toBeCloseTo(87.75, 9);
    expect(WINGATE_SECOND_ENTRY_X_NES).toBe(192);
    expect(WINGATE_SECOND_ENTRY_X).toBe(720);
    expect(WINGATE_SECOND_ENTRY_Y_NES).toBe(0);
    expect(WINGATE_SECOND_ENTRY_Y).toBe(0);
    expect(WINGATE_ENTRY_RUSH_DURATION).toBeCloseTo(34 / NES_FRAME_RATE, 9);
    expect(WINGATE_ENTRY_RUSH_SPEED).toBeCloseTo((26.5 / 34) * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
    expect(WINGATE_MOVEMENT_SPEED).toBeCloseTo((131 / 240) * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
    expect(WINGATE_SECOND_SPAWN_DELAY).toBeCloseTo(264 / NES_FRAME_RATE, 9);
    expect(WINGATE_FIRST_SHOT_DELAY).toBeCloseTo(4 / NES_FRAME_RATE, 9);
    expect(WINGATE_SECOND_FIRST_SHOT_DELAY).toBeCloseTo(277 / NES_FRAME_RATE, 9);
    expect(WINGATE_BULLET_SPEED).toBeCloseTo(2 * NES_FRAME_RATE * (540 / 240), 9);
    expect(WINGATE_PROJECTILE_X_OFFSET_NES).toBe(-8);
    expect(WINGATE_FIRST_VOLLEY_SIZE).toBe(6);
    expect(WINGATE_SECOND_VOLLEY_SIZE).toBe(3);
    expect([1, 2, 3, 4, 5, 6].map((shot) => wingateShotCooldown(0, shot))).toEqual([
      WINGATE_SHOT_INTERVAL, WINGATE_SHOT_INTERVAL, WINGATE_SHOT_INTERVAL,
      WINGATE_SHOT_INTERVAL, WINGATE_SHOT_INTERVAL, WINGATE_FIRST_VOLLEY_GAP,
    ]);
    expect([1, 2, 3].map((shot) => wingateShotCooldown(1, shot))).toEqual([
      WINGATE_SHOT_INTERVAL, WINGATE_SHOT_INTERVAL, WINGATE_SECOND_VOLLEY_GAP,
    ]);
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
