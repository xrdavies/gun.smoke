import { describe, expect, it } from "vitest";
import { AMMO_GAIN, backstabberRaidOffset, BACKSTABBER_AMBUSH_DEPTH, BACKSTABBER_AMBUSH_DROP_SPEED, BACKSTABBER_AMBUSH_LIFETIME, BACKSTABBER_RAID_LIFETIME, bomberCanThrow, bomberMovementDuration, BOMBER_MOVEMENT_DURATIONS, bomberMovementVelocity, BOMBER_THROW_CHANCE, BOMBER_THROW_DURATION, bossReward, BOSS_REWARDS, BOOTS_SPEED_MULTIPLIER, clamp, distance, DYNAMITE_AIRBORNE_DURATION, DYNAMITE_LANDED_DURATION, DYNAMITE_LIFETIME, DYNAMITE_WORLD_SPEED, EMPTY_BARREL_EXPLOSION_LIFETIME, FIREBREATHER_FIRST_SHOT_DELAY, FIREBREATHER_PROJECTILE_SPEED, formationEntryY, HATCHET_FIRST_SHOT_DELAY, HATCHET_PROJECTILE_SPEED, HORSE_HIT_INVULNERABILITY, MACHINE_GUN_BULLET_LIFETIME, MAGNUM_BULLET_LIFETIME, MAGNUM_BULLET_SPEED, MAX_STAGE, NES_BULLET_SPEED, NES_DIAGONAL_BULLET_X, NES_DIAGONAL_BULLET_Y, NES_FRAME_RATE, NES_PLAYER_SPEED, NES_SCROLL_SPEED, NINJA_FIRST_SHOT_DELAY, NINJA_PROJECTILE_SPEED, obstacleBlocks, PISTOL_BULLET_LIFETIME, PLAYER_DEATH_ANIMATION_DURATION, PLAYER_DEATH_RECOVERY_DURATION, PLAYER_RESPAWN_HIDDEN_DURATION, PLAYER_RESPAWN_READY_DURATION, playerDeathPhase, RIFLEMAN_ATTACK_STATE_FRAME, RIFLEMAN_FIRST_SHOT_DELAY, RIFLEMAN_SHOT_INTERVAL, RIFLEMAN_SHOTS_PER_VOLLEY, ROCK_IMPACT_DELAY, ROCK_LIFETIME, ROCK_WORLD_SPEED_X, ROCK_WORLD_SPEED_Y, ROM_ENEMY_SCREEN_MAX_Y, ROM_ENEMY_SCREEN_MAX_Y_NES, ROM_OBJECT_DROP_SPEED, ROAD_WIDTHS, ROUND_BOSS_GATE_SCROLL_NES, ROUND_BOSS_TRIGGERS, ROUND_ENEMY_TYPES, ROUND_LENGTHS, ROUND_LOOP_SCROLL_NES, ROUND_OBSTACLES, ROUND_SEGMENTS, SHOTGUN_BULLET_LIFETIME, SHOTGUNNER_FAN_NES, SHOTGUNNER_FIRST_VOLLEY_DELAY, SHOTGUNNER_LIFETIME, SHOTGUNNER_VOLLEY_INTERVAL, SHOP_COSTS, SHOP_TYPES, SMART_BOMB_CAPACITY, SNIPER_CODE2_SHOT_FRAMES, SNIPER_LIFETIME, SNIPER_SHOT_FRAMES, sniperProjectileVelocity, SPEAR_FIRST_SHOT_DELAY, SPEAR_PROJECTILE_SPEED, segmentDelay, spendPoints, STAGES, unitMaxAge, WEAPONS, WANTED_COSTS, WORLD_BULLET_SPEED, WORLD_DIAGONAL_BULLET_X, WORLD_DIAGONAL_BULLET_Y, WORLD_PLAYER_SPEED, WORLD_SCROLL_SPEED, shouldLoopStage } from "../src/game-constants";
import { GUNMAN_BOTTOM_BRANCH_FRAME, GUNMAN_BOTTOM_LIFETIMES, GUNMAN_BOTTOM_NEAR_DISTANCE_NES, gunmanBottomPosition, gunmanBottomRoute, GUNMAN_BOTTOM_SHOT_FRAMES, gunmanCanFire, GUNMAN_ENTRY_PATH_NES, GUNMAN_FIRST_OPPORTUNITY_FRAMES, GUNMAN_FLANK_LIFETIMES, GUNMAN_FLANK_SHOT_FRAMES, GUNMAN_LIFETIME, gunmanFirstOpportunityFrame, gunmanFlankPosition, gunmanOpeningY, gunmanProjectileVelocity, GUNMAN_SHOT_OPPORTUNITY_INTERVAL } from "../src/game-constants";
import { RIFLEMAN_LIFETIME, RIFLEMAN_PATH_NES, riflemanCanAttack, riflemanPosition, riflemanShotHeading, RIFLEMAN_SIDE_LIFETIME, RIFLEMAN_SIDE_PATH_NES, RIFLEMAN_SIDE_SHOT_FRAMES, riflemanSidePosition, mediumProjectileHeadingVelocity, mediumProjectileVelocity } from "../src/game-constants";
import { bossSpriteVisible, NINJA_BOSS_TELEPORT_DELAY } from "../src/game-constants";
import { addScore, MAX_SCORE } from "../src/game-constants";
import { PLAYER_ENTRY_X, PLAYER_ENTRY_X_NES, PLAYER_ENTRY_Y, PLAYER_ENTRY_Y_NES } from "../src/game-constants";
import { NINJA_ACTIVATION_DISTANCE_NES, NINJA_LIFETIME, ninjaCanThrow } from "../src/game-constants";
import { NINJA_ATTACK_MOVE_DURATION, NINJA_ENTRY_PATH_NES, ninjaAttackPosition, ninjaOpeningY } from "../src/game-constants";
import { ROUND2_LOOP_HORSE_X, ROUND2_LOOP_HORSE_Y } from "../src/game-constants";
import { BOMBER_ENTRY_DURATION, BOMBER_ENTRY_END_Y, BOMBER_ENTRY_END_Y_NES, bomberOpeningY } from "../src/game-constants";
import { DYNAMITE_AIM_FACTOR, dynamiteContactIsDefusable, DYNAMITE_HORIZONTAL_DURATION, DYNAMITE_VERTICAL_PATH_NES, dynamiteVerticalOffset } from "../src/game-constants";
import { firebreatherSideCanAttack, FIREBREATHER_SIDE_ATTACK_INTERVAL, FIREBREATHER_SIDE_LIFETIME, FIREBREATHER_SIDE_PATH_NES, firebreatherSidePosition, FIREBREATHER_LIFETIME, FIREBREATHER_PATH_NES, FIREBREATHER_PROJECTILE_OFFSET_NES, firebreatherPosition, FIREBREATHER_SHOT_FRAMES } from "../src/game-constants";
import { SPEAR_PATH_NES, SPEAR_PROJECTILE_OFFSET_NES, SPEAR_SIDE_LIFETIME, SPEAR_SIDE_PATH_NES, SPEAR_SIDE_SHOT_FRAMES, spearPosition, spearSidePosition, spearTopCanAttack, SPEAR_TOP_ATTACK_FRAMES, SPEAR_TOP_LIFETIME } from "../src/game-constants";
import { HATCHET_ATTACK_INTERVAL, HATCHET_LIFETIME, HATCHET_PATH_NES, hatchetCanThrow, hatchetPosition } from "../src/game-constants";
import { BANDIT_BILL_CRAWL_DURATION, BANDIT_BILL_DAMAGE_RECOVERY_DURATION, BANDIT_BILL_ENTRY_DURATION, BANDIT_BILL_ENTRY_END_Y, BANDIT_BILL_ENTRY_SPEED_Y, BANDIT_BILL_ENTRY_X_LANES, BANDIT_BILL_ENTRY_X_NES, BANDIT_BILL_ENTRY_Y, BANDIT_BILL_ENTRY_Y_NES, BANDIT_BILL_FIRST_VOLLEY_DELAY, BANDIT_BILL_HIT_STUN_DURATION, BANDIT_BILL_SHOT_INTERVAL, BANDIT_BILL_SHOTS_PER_VOLLEY, BANDIT_BILL_VOLLEY_GAP, banditBillCombatX, banditBillCombatY, banditBillOpeningY, banditBillProjectileVelocity, CUTTER_ENTRY_DURATION, CUTTER_ENTRY_END_Y, CUTTER_ENTRY_END_Y_NES, CUTTER_ENTRY_X_LANES, CUTTER_ENTRY_X_NES, CUTTER_ENTRY_Y, CUTTER_ENTRY_Y_NES, cutterCombatY, cutterOpeningX, cutterOpeningY, DEVIL_HAWK_ENTRY_DURATION, DEVIL_HAWK_ENTRY_END_Y, DEVIL_HAWK_ENTRY_END_Y_NES, DEVIL_HAWK_ENTRY_SPEED_Y, DEVIL_HAWK_ENTRY_X_LANES, DEVIL_HAWK_ENTRY_X_NES, DEVIL_HAWK_ENTRY_Y, DEVIL_HAWK_ENTRY_Y_NES, DEVIL_HAWK_POST_ENTRY_X_HOLD, devilHawkCombatX, devilHawkOpeningY, FATMAN_JOE_ENTRY_DURATION, FATMAN_JOE_ENTRY_END_Y, FATMAN_JOE_ENTRY_END_Y_NES, FATMAN_JOE_ENTRY_X_LANES, FATMAN_JOE_ENTRY_X_NES, FATMAN_JOE_ENTRY_Y, FATMAN_JOE_ENTRY_Y_NES, fatmanJoeCombatY, fatmanJoeOpeningY, nesAimHeading, NINJA_BOSS_ENTRY_LANES, NINJA_BOSS_ENTRY_LANES_NES, NES_WORLD_X_SCALE, NES_WORLD_Y_SCALE, WINGATE_ENTRY_DURATION, WINGATE_ENTRY_END_Y, WINGATE_ENTRY_END_Y_NES, WINGATE_ENTRY_X_LANES, WINGATE_ENTRY_X_NES, WINGATE_ENTRY_Y, WINGATE_ENTRY_Y_NES, WINGATE_SECOND_ENTRY_Y, WINGATE_SECOND_ENTRY_Y_NES, WINGATE_SECOND_SPAWN_DELAY, wingateOpeningY } from "../src/game-constants";
import { banditBillCooldown } from "../src/game-constants";
import { BLUE_YASHICHI_DURATION, MAX_LIVES } from "../src/game-constants";
import { RIFLE_BULLET_SPEED_MULTIPLIER } from "../src/game-constants";
import { BOSS_PROJECTILE_CAPACITY, canSpawnBossProjectile, canSpawnEnemyProjectile, canSpawnPlayerBullet, ENEMY_PROJECTILE_CAPACITY, machineGunVelocities, pistolBulletSpeedFactor, pistolShots, pistolVelocities, PLAYER_BULLET_CAPACITY, shotgunVelocities, weaponBulletLifetime, weaponCanRepeat } from "../src/game-constants";
import { MAX_POWERUP_STOCK, POWERUP_OVERFLOW_SCORE, storedPowerupPickup } from "../src/game-constants";
import { FATMAN_JOE_ATTACK_CHANCE, FATMAN_JOE_ATTACK_DECISION_INTERVAL, fatmanJoeAimHeading, fatmanJoeArenaXBounds, fatmanJoeCanLaunch, FATMAN_JOE_FIRST_ATTACK_DELAY, FATMAN_JOE_GRENADE_LIFETIME, FATMAN_JOE_LAUNCH_INVULNERABILITY, FATMAN_JOE_LONG_ACTION_DURATION, FATMAN_JOE_MINE_INTERVAL, fatmanJoeMineCount, FATMAN_JOE_MINE_OFFSETS_NES, FATMAN_JOE_MOVEMENT_SPEED, FATMAN_JOE_SHORT_ACTION_DURATION, FATMAN_JOE_SHELL_FLIGHT_DURATION, FATMAN_JOE_SHELL_LIFETIME, FATMAN_JOE_SHELL_SPLIT_DELAY, fatmanJoeMovementActionDuration, fatmanJoeShellVelocity } from "../src/game-constants";
import { WINGATE_ATTACK_INTERVAL, wingateAimHeading, WINGATE_BULLET_LIFETIME, WINGATE_BULLET_VELOCITIES_NES, wingateCanFire, WINGATE_ENTRY_RUSH_DURATION, WINGATE_ENTRY_RUSH_SPEED, WINGATE_FIRE_CHANCE, WINGATE_FIRST_SHOT_DELAY, WINGATE_MOVEMENT_SPEED, WINGATE_PROJECTILE_X_OFFSET_NES, WINGATE_PROJECTILE_Y_OFFSET_NES, wingateProjectileVelocity, wingateRushOffset, WINGATE_SECOND_FIRST_SHOT_DELAY, wingateCombatY } from "../src/game-constants";
import { CUTTER_ATTACK_INTERVAL, CUTTER_BOOMERANG_FIRST_TURN_DELAY, CUTTER_BOOMERANG_HEADINGS, cutterBoomerangHeadingToward, CUTTER_BOOMERANG_LIFETIME, CUTTER_BOOMERANG_OUTWARD_TARGETS_NES, CUTTER_BOOMERANG_REAIM_Y_NES, CUTTER_BOOMERANG_SPAWN_NES, CUTTER_BOOMERANG_TURN_INTERVAL, cutterBoomerangTurn, cutterBoomerangVelocity, CUTTER_FIRST_ATTACK_DELAY } from "../src/game-constants";
import { CUTTER_MOVEMENT_SPEED } from "../src/game-constants";
import { devilHawkFanHeadings, DEVIL_HAWK_FIRST_VOLLEY_DELAY, DEVIL_HAWK_FULL_FAN_HEADINGS, DEVIL_HAWK_FULL_FAN_LIFETIME, DEVIL_HAWK_FULL_FAN_MAX_Y_NES, DEVIL_HAWK_JUMP_PERIOD, devilHawkProjectileVelocity, DEVIL_HAWK_SIDE_FAN_LIFETIME, DEVIL_HAWK_VOLLEY_INTERVAL } from "../src/game-constants";
import { devilHawkCombatY } from "../src/game-constants";
import { NINJA_BOSS_ATTACK_INTERVAL, NINJA_BOSS_ENTRY_INVULNERABILITY, NINJA_BOSS_FIRST_ATTACK_DELAY, NINJA_BOSS_FIRST_PREPARE_DELAY, NINJA_BOSS_PREPARE_CONTROLLER_DURATION, NINJA_BOSS_PREPARE_DURATION, NINJA_BOSS_SHURIKEN_COUNT, NINJA_BOSS_SHURIKEN_LIFETIME, NINJA_BOSS_SHURIKEN_SPAWN_OFFSET_NES, NINJA_BOSS_SHURIKEN_VELOCITIES_NES, ninjaBossCombatY, ninjaBossPreparePosition } from "../src/game-constants";
import { SHOTGUNNER_PATH_NES, shotgunnerPosition } from "../src/game-constants";
import { SHOTGUNNER_SIDE_LIFETIME, SHOTGUNNER_SIDE_PATH_NES, SHOTGUNNER_SIDE_SHOT_FRAME, shotgunnerSidePosition } from "../src/game-constants";
import { romEnemyDrop, romEnemyScore } from "../src/game-constants";
import { roundCollisionBlocks, ROUND_COLLISION_ROW_COUNTS } from "../src/round-collision";
import { canSpawnRomPool, compareRomEventOrder, ROM_BREAKABLE_CONTAINER_DISPATCH_TYPES, ROM_EMPTY_BARREL_ENTITY_CODES, ROM_ENEMY_SLOT_CAPACITY, ROM_FALLING_ROCK_BEHAVIORS, ROM_OBJECT_PICKUPS, ROM_OBJECT_SLOT_CAPACITY, ROM_SCENE_PROP_DISPATCH_TYPES, ROUND_ROM_ENEMY_EVENTS, ROUND_ROM_ENEMY_EVENT_COUNTS, ROUND_ROM_OBJECT_EVENTS, ROUND_ROM_OBJECT_EVENT_COUNTS, ROM_BEHAVIOR_ENEMY_TYPES, romEventWorldAt, romEventWorldX, romEventWorldY, romObjectWorldAt, romObjectWorldX } from "../src/rom-event-data";

describe("Gun.Smoke vertical slice", () => {
  it("matches the traced player death and respawn phases", () => {
    expect(PLAYER_DEATH_ANIMATION_DURATION).toBeCloseTo(152 / NES_FRAME_RATE, 9);
    expect(PLAYER_RESPAWN_HIDDEN_DURATION).toBeCloseTo(100 / NES_FRAME_RATE, 9);
    expect(PLAYER_RESPAWN_READY_DURATION).toBeCloseTo(40 / NES_FRAME_RATE, 9);
    expect(PLAYER_DEATH_RECOVERY_DURATION).toBeCloseTo(292 / NES_FRAME_RATE, 9);
    expect([151, 152, 251, 252, 291, 292].map((frame) => playerDeathPhase(frame / NES_FRAME_RATE))).toEqual(["dying", "hidden", "hidden", "ready", "ready", "active"]);
  });

  it("matches the traced Horse hit protection", () => {
    expect(HORSE_HIT_INVULNERABILITY).toBeCloseTo(60 / NES_FRAME_RATE, 9);
  });

  it("keeps the NES-inspired stage constants stable", () => {
    expect({ frameRate: NES_FRAME_RATE, rounds: MAX_STAGE }).toEqual({ frameRate: 60.098, rounds: 6 });
    expect(MAX_LIVES).toBe(5);
    expect(BLUE_YASHICHI_DURATION).toBeCloseTo(180 / NES_FRAME_RATE, 9);
    expect(ROUND_BOSS_GATE_SCROLL_NES).toEqual([2_767, 2_799, 4_863, 3_487, 2_879, 4_879]);
    expect(ROUND_LOOP_SCROLL_NES).toEqual([3_087, 3_055, 5_119, 3_839, 3_055, 5_119]);
    expect(ROUND_BOSS_TRIGGERS[0]).toBe(6_225.75);
    expect([PLAYER_ENTRY_X_NES, PLAYER_ENTRY_Y_NES]).toEqual([136, 188]);
    expect([PLAYER_ENTRY_X, PLAYER_ENTRY_Y]).toEqual([510, 423]);
    expect(ROUND_LENGTHS[5]).toBe(11_517.75);
    expect([ROUND2_LOOP_HORSE_X, ROUND2_LOOP_HORSE_Y]).toEqual([310, 300]);
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

  it("matches the NES integer aim sectors", () => {
    const x = NES_WORLD_X_SCALE;
    const y = 540 / 240;
    expect([
      nesAimHeading(0, 0, 100 * x, 0),
      nesAimHeading(0, 0, 0, 100 * y),
      nesAimHeading(0, 0, -100 * x, 0),
      nesAimHeading(0, 0, 0, -100 * y),
      nesAimHeading(0, 0, -70 * x, 127 * y),
      nesAimHeading(0, 0, -70 * x, -100 * y),
    ]).toEqual([8, 16, 24, 0, 18, 29]);
  });

  it("matches the NES two-gun pistol directions", () => {
    expect(pistolShots(true, false)).toEqual([{ direction: -1, offset: -8 }, { direction: -1, offset: 8 }]);
    expect(pistolShots(false, true)).toEqual([{ direction: 1, offset: -8 }, { direction: 1, offset: 8 }]);
    expect(pistolShots(true, true)).toEqual([{ direction: 0, offset: -8 }, { direction: 0, offset: 8 }]);
    expect(pistolVelocities(true, false)).toEqual([[-3, -5, -8], [-2, -5, 8]]);
    expect(machineGunVelocities(false, true)).toEqual([[4, -9, -8], [7, -7, 8]]);
    expect(NES_WORLD_X_SCALE).toBe(3.75);
    expect(NES_WORLD_Y_SCALE).toBe(2.25);
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
    expect([6, 3, 13, 10, 19].map(romEnemyScore)).toEqual([100, 300, 200, 400, 400]);
    expect(romEnemyScore(0xff)).toBe(100);
  });

  it("loops a stage only when the wanted poster is missing", () => {
    expect(shouldLoopStage(ROUND_LENGTHS[0]!, 1, false)).toBe(true);
    expect(shouldLoopStage(ROUND_LENGTHS[0]!, 1, true)).toBe(false);
  });

  it("caps the six-digit NES score", () => {
    expect(MAX_SCORE).toBe(999_990);
    expect(addScore(999_900, 90)).toBe(MAX_SCORE);
    expect(addScore(MAX_SCORE, 400)).toBe(MAX_SCORE);
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
    expect(shopEvents.map((events) => events.map((event) => event.shopIndex))).toEqual(SHOP_TYPES.map((types) => types.map((_, index) => index + 1)));
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
    expect(ROM_BEHAVIOR_ENEMY_TYPES[5]).toBeUndefined();
    expect(ROM_BEHAVIOR_ENEMY_TYPES[7]).toBe("rifleman");
    expect(ROM_ENEMY_SLOT_CAPACITY).toBe(7);
    expect(ROM_OBJECT_SLOT_CAPACITY).toBe(6);
    expect(ROM_EMPTY_BARREL_ENTITY_CODES).toEqual([32, 41]);
    expect(EMPTY_BARREL_EXPLOSION_LIFETIME).toBeCloseTo(10 / NES_FRAME_RATE, 9);
    expect(ROM_FALLING_ROCK_BEHAVIORS).toEqual([5]);
    const fallingRockEvents = ROUND_ROM_ENEMY_EVENTS.flatMap((stream) => stream).filter((event) => event.behavior === 5);
    expect(fallingRockEvents.length).toBeGreaterThan(0);
    expect(fallingRockEvents.every((event) => event.pool === "enemy")).toBe(true);
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
    for (const stream of [...ROUND_ROM_ENEMY_EVENTS, ...ROUND_ROM_OBJECT_EVENTS]) {
      expect(stream.every((event, index) => index === 0 || event.at > stream[index - 1]!.at || (event.at === stream[index - 1]!.at && event.order > stream[index - 1]!.order))).toBe(true);
    }
    const round1At319 = [...ROUND_ROM_ENEMY_EVENTS[0]!.filter((event) => event.at === 319), ...ROUND_ROM_OBJECT_EVENTS[0]!.filter((event) => event.at === 319)].sort(compareRomEventOrder);
    const round2At143 = [...ROUND_ROM_ENEMY_EVENTS[1]!.filter((event) => event.at === 143), ...ROUND_ROM_OBJECT_EVENTS[1]!.filter((event) => event.at === 143)].sort(compareRomEventOrder);
    expect(round1At319.map((event) => event.entityCode)).toEqual([6, 36]);
    expect(round2At143.map((event) => event.entityCode)).toEqual([33, 34, 6]);
    expect(round1At319.map((event) => event.pool)).toEqual(["enemy", "object"]);
    expect(round2At143.map((event) => event.pool)).toEqual(["object", "object", "enemy"]);
  });

  it("keeps Boss units alive until their health reaches zero", () => {
    expect(unitMaxAge("boss")).toBe(Number.POSITIVE_INFINITY);
    expect(unitMaxAge("enemy")).toBe(18);
    expect(unitMaxAge("projectile")).toBe(Number.POSITIVE_INFINITY);
  });

  it("matches the traced Bomber and dynamite frame timing", () => {
    expect(BOMBER_ENTRY_DURATION).toBeCloseTo(125 / NES_FRAME_RATE, 9);
    expect(BOMBER_ENTRY_END_Y_NES).toBe(126);
    expect(BOMBER_ENTRY_END_Y).toBeCloseTo(126 * (540 / 240), 9);
    expect(bomberOpeningY(0)).toBe(0);
    expect(bomberOpeningY(BOMBER_ENTRY_DURATION / 2)).toBeCloseTo(BOMBER_ENTRY_END_Y / 2, 9);
    expect(bomberOpeningY(BOMBER_ENTRY_DURATION)).toBe(BOMBER_ENTRY_END_Y);
    expect(BOMBER_THROW_DURATION).toBeCloseTo(90 / NES_FRAME_RATE, 9);
    expect(BOMBER_THROW_CHANCE).toBe(0.5);
    expect(BOMBER_MOVEMENT_DURATIONS).toEqual([64, 38, 32, 14, 16, 14, 32, 38]);
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((direction) => bomberMovementDuration(direction))).toEqual(BOMBER_MOVEMENT_DURATIONS.map((frames) => frames / NES_FRAME_RATE));
    expect(bomberMovementVelocity(2)).toEqual([0.828125 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 0]);
    expect(bomberMovementVelocity(4)).toEqual([0, NES_FRAME_RATE * (540 / 240)]);
    expect([bomberCanThrow(126 * (540 / 240), 188 * (540 / 240), 0.49), bomberCanThrow(126 * (540 / 240), 190 * (540 / 240), 0)]).toEqual([true, false]);
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
    expect(SHOTGUNNER_PATH_NES).toEqual([[0, 0, 0], [64, 0, 64], [80, -6, 77], [100, -18, 83], [108, -18, 83], [120, -20, 82], [140, -32, 70], [152, -34, 60], [164, -34, 60], [168, -34, 59], [224, -34, 3]]);
    expect(shotgunnerPosition(80 / NES_FRAME_RATE)).toEqual([-6, 77]);
    expect(shotgunnerPosition(108 / NES_FRAME_RATE)).toEqual([-18, 83]);
    expect(shotgunnerPosition(224 / NES_FRAME_RATE)).toEqual([-34, 3]);
    expect(SHOTGUNNER_SIDE_SHOT_FRAME).toBe(114);
    expect(SHOTGUNNER_SIDE_LIFETIME).toBeCloseTo(232 / NES_FRAME_RATE, 9);
    expect(SHOTGUNNER_SIDE_PATH_NES).toEqual([[0, 0, 0], [60, 49, 0], [80, 64, -2], [100, 72, -19], [114, 72, -22], [140, 66, -36], [160, 52, -40], [220, 2, -40], [231, -7, -40]]);
    expect(shotgunnerSidePosition(114 / NES_FRAME_RATE, false)).toEqual([-72, -22]);
    expect(shotgunnerSidePosition(114 / NES_FRAME_RATE, true)).toEqual([72, -22]);
  });

  it("matches the traced Sniper firing windows", () => {
    expect(SNIPER_SHOT_FRAMES).toEqual([134, 224, 405, 495, 585]);
    expect(SNIPER_CODE2_SHOT_FRAMES).toEqual([134, 224, 314, 404, 495, 585]);
    expect(SNIPER_LIFETIME).toBeCloseTo(732 / 60.098, 9);
    expect(sniperProjectileVelocity(179 * NES_WORLD_X_SCALE, 113 * NES_WORLD_Y_SCALE, 136 * NES_WORLD_X_SCALE, 188 * NES_WORLD_Y_SCALE)).toEqual([-0.3125 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 0.92578125 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
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
    expect([20, 16, 12].map((aim) => Array.from({ length: 5 }, (_, shot) => riflemanShotHeading(aim, shot)))).toEqual([[20, 22, 20, 18, 20], [16, 18, 16, 14, 16], [12, 14, 12, 10, 12]]);
    expect(mediumProjectileHeadingVelocity(16)).toEqual([0, 2 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
    expect([riflemanCanAttack(48 * NES_WORLD_Y_SCALE, 143 * NES_WORLD_Y_SCALE), riflemanCanAttack(48 * NES_WORLD_Y_SCALE, 144 * NES_WORLD_Y_SCALE), riflemanCanAttack(47 * NES_WORLD_Y_SCALE, 47 * NES_WORLD_Y_SCALE)]).toEqual([true, false, false]);
    expect(RIFLEMAN_SIDE_SHOT_FRAMES).toEqual([97, 113, 129]);
    expect(RIFLEMAN_SIDE_LIFETIME).toBeCloseTo(259 / NES_FRAME_RATE, 9);
    expect(RIFLEMAN_SIDE_PATH_NES).toEqual([[0, 0, 0], [80, 65, 0], [169, 65, 0], [180, 58, 0], [240, 8, 0], [258, -7, 0]]);
    expect(riflemanSidePosition(80 / NES_FRAME_RATE, false)).toEqual([-65, 0]);
    expect(riflemanSidePosition(80 / NES_FRAME_RATE, true)).toEqual([65, 0]);
  });

  it("matches the traced Ninja shot timing", () => {
    expect(NINJA_FIRST_SHOT_DELAY).toBeCloseTo(103 / NES_FRAME_RATE, 9);
    expect(NINJA_PROJECTILE_SPEED).toBe(300);
    expect(mediumProjectileVelocity(179 * NES_WORLD_X_SCALE, 113 * NES_WORLD_Y_SCALE, 136 * NES_WORLD_X_SCALE, 188 * NES_WORLD_Y_SCALE)).toEqual([-0.625 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 1.8515625 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
    expect(mediumProjectileVelocity(0, 0, 0, 4 * NES_WORLD_Y_SCALE, true)).toEqual([0, 2 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
  });

  it("matches the traced ordinary Ninja entrance and retreat", () => {
    expect(NINJA_ENTRY_PATH_NES).toEqual([[0, 0], [16, 32], [36, 32], [83, 126], [103, 126]]);
    expect(ninjaOpeningY(16 / NES_FRAME_RATE)).toBeCloseTo(32 * (540 / 240), 9);
    expect(ninjaOpeningY(83 / NES_FRAME_RATE)).toBeCloseTo(126 * (540 / 240), 9);
    expect(NINJA_ATTACK_MOVE_DURATION).toBeCloseTo(15 / NES_FRAME_RATE, 9);
    expect(NINJA_ACTIVATION_DISTANCE_NES).toBe(64);
    expect([ninjaCanThrow(126 * NES_WORLD_Y_SCALE, 188 * NES_WORLD_Y_SCALE), ninjaCanThrow(124 * NES_WORLD_Y_SCALE, 188 * NES_WORLD_Y_SCALE)]).toEqual([true, false]);
    expect(ninjaAttackPosition(103 / NES_FRAME_RATE, 570, 283.5, 465, 207)).toEqual([570, 283.5]);
    expect(ninjaAttackPosition(118 / NES_FRAME_RATE, 570, 283.5, 465, 207)).toEqual([465, 207]);
    expect(NINJA_LIFETIME).toBeCloseTo(303 / NES_FRAME_RATE, 9);
  });

  it("keeps the Ninja Boss smoke and teleport timing", () => {
    expect(NINJA_BOSS_ENTRY_INVULNERABILITY).toBeCloseTo(44 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_FIRST_PREPARE_DELAY).toBeCloseTo(140 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_PREPARE_DURATION).toBeCloseTo(40 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_PREPARE_CONTROLLER_DURATION).toBeCloseTo(7 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_FIRST_ATTACK_DELAY).toBeCloseTo(179 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_TELEPORT_DELAY).toBeCloseTo(90 / NES_FRAME_RATE, 9);
    expect(ninjaBossPreparePosition(0, 147, 104, 134, 182)).toEqual([147, 104]);
    expect(ninjaBossPreparePosition(NINJA_BOSS_PREPARE_DURATION, 147, 104, 134, 182)).toEqual([134, 182]);
    expect([bossSpriteVisible(1, 1, 2, false), bossSpriteVisible(5, 1, 2, false), bossSpriteVisible(4, 1, 2, false), bossSpriteVisible(4, 3, 2, true), bossSpriteVisible(4, 3, 2, false)]).toEqual([true, true, false, false, true]);
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
    expect(HATCHET_LIFETIME).toBeCloseTo(1042 / NES_FRAME_RATE, 9);
    expect(HATCHET_ATTACK_INTERVAL).toBeCloseTo(130 / NES_FRAME_RATE, 9);
    expect(HATCHET_PATH_NES).toEqual([[0, 0, 0], [20, 0, 40], [40, 0, 40], [60, 18, 43], [78, 18, 48]]);
    expect(hatchetPosition(20 / NES_FRAME_RATE)).toEqual([0, 40]);
    expect(hatchetPosition(40 / NES_FRAME_RATE)).toEqual([0, 40]);
    expect(hatchetPosition(78 / NES_FRAME_RATE)).toEqual([18, 48]);
    expect(hatchetCanThrow(128 * NES_WORLD_X_SCALE, 0, 144 * NES_WORLD_X_SCALE, 100 * NES_WORLD_Y_SCALE)).toBe(true);
    expect(hatchetCanThrow(128 * NES_WORLD_X_SCALE, 0, 176 * NES_WORLD_X_SCALE, 100 * NES_WORLD_Y_SCALE)).toBe(false);
  });

  it("matches the traced Firebreather timing", () => {
    expect(FIREBREATHER_FIRST_SHOT_DELAY).toBeCloseTo(156 / NES_FRAME_RATE, 9);
    expect(FIREBREATHER_SHOT_FRAMES).toEqual([156, 364, 416]);
    expect(FIREBREATHER_LIFETIME).toBeCloseTo(644 / NES_FRAME_RATE, 9);
    expect(FIREBREATHER_SIDE_ATTACK_INTERVAL).toBeCloseTo(52 / NES_FRAME_RATE, 9);
    expect(FIREBREATHER_SIDE_LIFETIME).toBe(Number.POSITIVE_INFINITY);
    expect(FIREBREATHER_PROJECTILE_SPEED).toBe(250);
    expect(FIREBREATHER_PROJECTILE_OFFSET_NES).toEqual([0, -1]);
    expect(FIREBREATHER_PATH_NES).toEqual([[0, 0, 0], [30, 0, 30], [40, 0, 34], [70, 0, 44], [78, 2, 57]]);
    expect(firebreatherPosition(30 / NES_FRAME_RATE)).toEqual([0, 30]);
    expect(firebreatherPosition(40 / NES_FRAME_RATE)).toEqual([0, 34]);
    expect(firebreatherPosition(78 / NES_FRAME_RATE)).toEqual([2, 57]);
    expect(FIREBREATHER_SIDE_PATH_NES).toEqual([[0, 0, 0], [20, 15, 0], [40, 25, 0], [74, 25, 0], [80, 32, 12], [100, 50, 45], [120, 56, 57], [209, 56, 57]]);
    expect(firebreatherSidePosition(40 / NES_FRAME_RATE, true)).toEqual([25, 0]);
    expect(firebreatherSidePosition(120 / NES_FRAME_RATE, false)).toEqual([-56, 57]);
    expect([firebreatherSideCanAttack(100, 100, 100, 120, 0.49), firebreatherSideCanAttack(100, 100, 100, 120, 0.5), firebreatherSideCanAttack(100, 120, 100, 100, 0)]).toEqual([true, false, false]);
    expect(firebreatherSideCanAttack(8 * NES_WORLD_X_SCALE, 0, 0, 4 * NES_WORLD_Y_SCALE, 0.49)).toBe(true);
    expect(firebreatherSideCanAttack(8 * NES_WORLD_X_SCALE, 0, 0, 2 * NES_WORLD_Y_SCALE, 0.49)).toBe(false);
  });

  it("matches the traced Spear timing", () => {
    expect(SPEAR_FIRST_SHOT_DELAY).toBeCloseTo(72 / NES_FRAME_RATE, 9);
    expect(SPEAR_PROJECTILE_SPEED).toBe(250);
    expect(SPEAR_PROJECTILE_OFFSET_NES).toEqual([0, 0]);
    expect(SPEAR_PATH_NES).toEqual([[0, 0, 0], [24, 0, 68], [65, 0, 68], [66, 1, 63], [72, 8, 40], [80, 17, 23], [89, 27, 14], [96, 36, 21]]);
    expect(spearPosition(24 / NES_FRAME_RATE)).toEqual([0, 68]);
    expect(spearPosition(72 / NES_FRAME_RATE)).toEqual([8, 40]);
    expect(spearPosition(96 / NES_FRAME_RATE)).toEqual([36, 21]);
    expect(SPEAR_SIDE_SHOT_FRAMES).toEqual([89, 305, 449, 593, 737, 809]);
    expect(SPEAR_SIDE_LIFETIME).toBeCloseTo(813 / NES_FRAME_RATE, 9);
    expect(SPEAR_SIDE_PATH_NES).toEqual([[0, 0, 0], [20, -32, -5], [40, -65, 37], [82, -66, 33], [89, -74, 6], [113, -101, -9]]);
    expect(spearSidePosition(40 / NES_FRAME_RATE, false)).toEqual([-65, 37]);
    expect(spearSidePosition(40 / NES_FRAME_RATE, true)).toEqual([65, 37]);
    expect(SPEAR_TOP_ATTACK_FRAMES).toEqual([72, 144, 216, 288, 360, 432, 504, 576, 648]);
    expect(SPEAR_TOP_LIFETIME).toBeCloseTo(656 / NES_FRAME_RATE, 9);
    expect([spearTopCanAttack(0, 0, 0, 100 * (540 / 240), 0.49), spearTopCanAttack(0, 0, 0, 100 * (540 / 240), 0.5), spearTopCanAttack(0, 0, 100 * NES_WORLD_X_SCALE, 0, 0)]).toEqual([true, false, false]);
    expect(spearTopCanAttack(8 * NES_WORLD_X_SCALE, 0, 0, 2 * NES_WORLD_Y_SCALE, 0.49)).toBe(true);
    expect(spearTopCanAttack(1 * NES_WORLD_X_SCALE, 0, 0, 0, 0.49)).toBe(false);
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
    expect(GUNMAN_FIRST_OPPORTUNITY_FRAMES).toEqual([40, 52, 58, 62]);
    expect([0, Math.PI / 2, Math.PI, Math.PI * 1.5].map(gunmanFirstOpportunityFrame)).toEqual([40, 52, 58, 62]);
    expect(GUNMAN_SHOT_OPPORTUNITY_INTERVAL).toBeCloseTo(64 / NES_FRAME_RATE, 9);
    expect(GUNMAN_LIFETIME).toBeCloseTo(560 / NES_FRAME_RATE, 9);
    expect([gunmanCanFire(16, 14), gunmanCanFire(16, 18), gunmanCanFire(16, 13), gunmanCanFire(31, 1)]).toEqual([true, true, false, true]);
    expect(GUNMAN_ENTRY_PATH_NES).toEqual([[0, 0], [40, 53], [100, 128], [104, 132]]);
    expect(gunmanOpeningY(40 / NES_FRAME_RATE)).toBeCloseTo(53 * (540 / 240), 9);
    expect(gunmanOpeningY(100 / NES_FRAME_RATE)).toBeCloseTo(128 * (540 / 240), 9);
    expect(gunmanProjectileVelocity(90 * NES_WORLD_X_SCALE, 75 * NES_WORLD_Y_SCALE, 136 * NES_WORLD_X_SCALE, 188 * NES_WORLD_Y_SCALE)).toEqual([0.625 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 1.8515625 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
  });

  it("matches the traced flank Gunman variants", () => {
    expect(GUNMAN_FLANK_SHOT_FRAMES).toEqual({ 7: [64, 410], 8: [309], 9: [399, 463] });
    expect(GUNMAN_FLANK_LIFETIMES).toEqual({ 7: 642 / NES_FRAME_RATE, 8: 508 / NES_FRAME_RATE, 9: 826 / NES_FRAME_RATE });
    expect(gunmanFlankPosition(7, 64 / NES_FRAME_RATE)).toEqual([46, 31]);
    expect(gunmanFlankPosition(7, 338 / NES_FRAME_RATE)).toEqual([192, 212]);
    expect(gunmanFlankPosition(7, 641 / NES_FRAME_RATE)).toEqual([158, 218]);
    expect(gunmanFlankPosition(8, 247 / NES_FRAME_RATE)).toEqual([0, 82]);
    expect(gunmanFlankPosition(8, 309 / NES_FRAME_RATE)).toEqual([51, 128]);
    expect(gunmanFlankPosition(9, 50 / NES_FRAME_RATE)).toEqual([-48, 30]);
    expect(gunmanFlankPosition(9, 358 / NES_FRAME_RATE)).toEqual([-188, -89]);
    expect(gunmanFlankPosition(9, 825 / NES_FRAME_RATE)).toEqual([7, 69]);
  });

  it("matches the traced bottom-entry Gunman routes", () => {
    expect(GUNMAN_BOTTOM_BRANCH_FRAME).toBe(50);
    expect(GUNMAN_BOTTOM_NEAR_DISTANCE_NES).toBe(56);
    expect(GUNMAN_BOTTOM_SHOT_FRAMES).toEqual({ near: [219], far: [241] });
    expect(GUNMAN_BOTTOM_LIFETIMES).toEqual({ near: 318 / NES_FRAME_RATE, far: 479 / NES_FRAME_RATE });
    expect([
      gunmanBottomRoute(0, 0, 55 * NES_WORLD_X_SCALE, 55 * (540 / 240)),
      gunmanBottomRoute(0, 0, 56 * NES_WORLD_X_SCALE, 0),
      gunmanBottomRoute(0, 0, 0, 56 * (540 / 240)),
    ]).toEqual(["near", "far", "far"]);
    expect(gunmanBottomPosition("near", true, 1 / NES_FRAME_RATE)).toEqual([0, 248]);
    expect(gunmanBottomPosition("near", true, 219 / NES_FRAME_RATE)).toEqual([16, 159]);
    expect(gunmanBottomPosition("near", false, 219 / NES_FRAME_RATE)).toEqual([-16, 159]);
    expect(gunmanBottomPosition("far", false, 241 / NES_FRAME_RATE)).toEqual([-41, 139]);
    expect(gunmanBottomPosition("far", true, 478 / NES_FRAME_RATE)).toEqual([-36, 0]);
  });

  it("matches the traced Bandit Bill volley timing", () => {
    expect(BANDIT_BILL_FIRST_VOLLEY_DELAY).toBeCloseTo(107 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_SHOT_INTERVAL).toBeCloseTo(12 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_VOLLEY_GAP).toBeCloseTo(72 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_SHOTS_PER_VOLLEY).toBe(4);
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
    expect(banditBillProjectileVelocity(192 * NES_WORLD_X_SCALE, 72 * NES_WORLD_Y_SCALE, 88 * NES_WORLD_X_SCALE, 215 * NES_WORLD_Y_SCALE)).toEqual([-1.37109375 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 2.484375 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION)).toBe(720);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 119 / NES_FRAME_RATE)).toBeCloseTo(110.25, 9);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION + 227 / NES_FRAME_RATE)).toBeCloseTo(551.25, 9);
  });

  it("matches the traced Bandit Bill damage recovery", () => {
    expect(BANDIT_BILL_HIT_STUN_DURATION).toBeCloseTo(8 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_CRAWL_DURATION).toBeCloseTo(168 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_DAMAGE_RECOVERY_DURATION).toBeCloseTo(176 / NES_FRAME_RATE, 9);
  });

  it("matches the traced Cutter entrance", () => {
    expect(CUTTER_ENTRY_X_NES).toEqual([88, 112, 144, 168]);
    expect(CUTTER_ENTRY_X_LANES).toEqual([330, 420, 540, 630]);
    expect(CUTTER_ENTRY_Y_NES).toBe(0);
    expect(CUTTER_ENTRY_Y).toBe(0);
    expect(CUTTER_ENTRY_END_Y_NES).toBe(136);
    expect(CUTTER_ENTRY_END_Y).toBe(306);
    expect(CUTTER_ENTRY_DURATION).toBeCloseTo(324 / NES_FRAME_RATE, 9);
    expect(cutterOpeningY(0)).toBe(0);
    expect(cutterOpeningY(142 / NES_FRAME_RATE)).toBe(216);
    expect(cutterOpeningY(213 / NES_FRAME_RATE)).toBe(319.5);
    expect(cutterOpeningY(250 / NES_FRAME_RATE)).toBe(265.5);
    expect(cutterOpeningY(CUTTER_ENTRY_DURATION)).toBe(306);
    expect(cutterOpeningX(258 / NES_FRAME_RATE)).toBe(540);
    expect(cutterOpeningX(308 / NES_FRAME_RATE)).toBe(461.25);
    expect(cutterOpeningX(CUTTER_ENTRY_DURATION)).toBe(483.75);
    expect(cutterOpeningX(CUTTER_ENTRY_DURATION, 168 * NES_WORLD_X_SCALE)).toBe(153 * NES_WORLD_X_SCALE);
    expect(cutterOpeningX(CUTTER_FIRST_ATTACK_DELAY)).toBe(483.75);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION)).toBe(306);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 71 / NES_FRAME_RATE)).toBe(92.25);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 311 / NES_FRAME_RATE)).toBe(90);
    expect(CUTTER_FIRST_ATTACK_DELAY).toBeCloseTo(350 / NES_FRAME_RATE, 9);
    expect(CUTTER_ATTACK_INTERVAL).toBeCloseTo(256 / NES_FRAME_RATE, 9);
    expect(CUTTER_BOOMERANG_SPAWN_NES).toEqual([[-3, 3], [3, 2]]);
    expect(CUTTER_BOOMERANG_HEADINGS).toEqual([14, 18]);
    expect(CUTTER_BOOMERANG_OUTWARD_TARGETS_NES).toEqual([[224, 176], [32, 176]]);
    expect(CUTTER_BOOMERANG_REAIM_Y_NES).toBe(176);
    expect(CUTTER_BOOMERANG_FIRST_TURN_DELAY).toBeCloseTo(1 / NES_FRAME_RATE, 9);
    expect(CUTTER_BOOMERANG_TURN_INTERVAL).toBeCloseTo(2 / NES_FRAME_RATE, 9);
    expect(CUTTER_BOOMERANG_LIFETIME).toBeCloseTo(180 / NES_FRAME_RATE, 9);
    expect(cutterBoomerangTurn(14, 10)).toBe(13);
    expect(cutterBoomerangTurn(18, 22)).toBe(19);
    expect(cutterBoomerangTurn(31, 1)).toBe(0);
    expect(cutterBoomerangHeadingToward(126 * NES_WORLD_X_SCALE, 139 * (540 / 240), 224 * NES_WORLD_X_SCALE, 176 * (540 / 240))).toBe(10);
    expect(cutterBoomerangHeadingToward(103 * NES_WORLD_X_SCALE, 99 * (540 / 240), 32 * NES_WORLD_X_SCALE, 176 * (540 / 240))).toBe(20);
    expect(cutterBoomerangHeadingToward(184 * NES_WORLD_X_SCALE, 176 * (540 / 240), 128 * NES_WORLD_X_SCALE, 216 * (540 / 240))).toBe(21);
    expect(cutterBoomerangVelocity(16)[0]).toBeCloseTo(0, 9);
    expect(cutterBoomerangVelocity(16)[1]).toBeCloseTo(3 * NES_FRAME_RATE * (540 / 240), 9);
    let heading: number = CUTTER_BOOMERANG_HEADINGS[0];
    let x = 0;
    let y = 0;
    for (let frame = 1; frame <= 10; frame += 1) {
      if (frame % 2 === 1) heading = cutterBoomerangTurn(heading, 10);
      const [vx, vy] = cutterBoomerangVelocity(heading);
      x += vx / NES_FRAME_RATE / NES_WORLD_X_SCALE;
      y += vy / NES_FRAME_RATE / (540 / 240);
    }
    expect([x, y]).toEqual([expect.closeTo(19.7, 1), expect.closeTo(17.2, 1)]);
    expect(CUTTER_MOVEMENT_SPEED).toBeCloseTo((31 / 18) * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
  });

  it("matches the traced Devil Hawk entrance", () => {
    expect(DEVIL_HAWK_ENTRY_X_NES).toEqual([88, 128, 168, 208]);
    expect(DEVIL_HAWK_ENTRY_X_LANES).toEqual([330, 480, 630, 780]);
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
    expect(DEVIL_HAWK_FULL_FAN_HEADINGS).toEqual([12, 14, 16, 18, 20]);
    expect(DEVIL_HAWK_FULL_FAN_LIFETIME).toBeCloseTo(45 / NES_FRAME_RATE, 9);
    expect(DEVIL_HAWK_SIDE_FAN_LIFETIME).toBeCloseTo(36 / NES_FRAME_RATE, 9);
    expect(DEVIL_HAWK_FULL_FAN_MAX_Y_NES).toBe(62);
    expect(devilHawkFanHeadings(true, 16)).toEqual([12, 14, 16, 18, 20]);
    expect(devilHawkFanHeadings(true, 8)).toEqual([12, 14, 16, 18, 20]);
    expect(devilHawkFanHeadings(true, 24)).toEqual([12, 14, 16, 18, 20]);
    expect(devilHawkFanHeadings(true, 7)).toEqual([]);
    expect(devilHawkFanHeadings(true, 25)).toEqual([]);
    expect(devilHawkFanHeadings(false, 8)).toEqual([12, 14, 16]);
    expect(devilHawkFanHeadings(false, 16)).toEqual([14, 16, 18]);
    expect(devilHawkFanHeadings(false, 20)).toEqual([16, 18, 20]);
    expect(devilHawkFanHeadings(false, 25)).toEqual([]);
    const [hawkVx, hawkVy] = devilHawkProjectileVelocity(20);
    expect(hawkVx).toBeCloseTo(-1.734375 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
    expect(hawkVy).toBeCloseTo(2.109375 * NES_FRAME_RATE * (540 / 240), 9);
    expect(DEVIL_HAWK_JUMP_PERIOD).toBe(121);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION)).toBe(216);
    expect(devilHawkCombatY(DEVIL_HAWK_FIRST_VOLLEY_DELAY)).toBe(216);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 52 / NES_FRAME_RATE)).toBe(108);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION)).toBe(780);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 146 / NES_FRAME_RATE)).toBeCloseTo(588.75, 9);
  });

  it("matches the traced Ninja Boss entrance", () => {
    expect(NINJA_BOSS_ENTRY_LANES_NES).toEqual([[112, 64], [192, 64], [120, 144], [176, 128]]);
    expect(NINJA_BOSS_ENTRY_LANES).toEqual([[420, 144], [720, 144], [450, 324], [660, 288]]);
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
    expect(FATMAN_JOE_ENTRY_X_NES).toEqual([64, 104, 152, 192]);
    expect(FATMAN_JOE_ENTRY_X_LANES).toEqual([240, 390, 570, 720]);
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
    expect(fatmanJoeArenaXBounds()).toEqual([155, 805]);
    expect(FATMAN_JOE_FIRST_ATTACK_DELAY).toBeCloseTo(95 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_ATTACK_DECISION_INTERVAL).toBeCloseTo(76 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_ATTACK_CHANCE).toBe(0.5);
    expect(FATMAN_JOE_SHORT_ACTION_DURATION).toBeCloseTo(53 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_LONG_ACTION_DURATION).toBeCloseTo(122 / NES_FRAME_RATE, 9);
    expect(fatmanJoeMovementActionDuration(72 * (540 / 240), 0.25)).toBe(FATMAN_JOE_SHORT_ACTION_DURATION);
    expect(fatmanJoeMovementActionDuration(71 * (540 / 240), 0.25)).toBe(FATMAN_JOE_LONG_ACTION_DURATION);
    expect(fatmanJoeMovementActionDuration(72 * (540 / 240), 0.124)).toBe(FATMAN_JOE_LONG_ACTION_DURATION);
    expect(FATMAN_JOE_SHELL_FLIGHT_DURATION).toBeCloseTo(31 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_SHELL_SPLIT_DELAY).toBeCloseTo(35 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_SHELL_LIFETIME).toBeCloseTo(61 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_MINE_INTERVAL).toBeCloseTo(4 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_MINE_OFFSETS_NES).toEqual([[-16, 4], [-10, 12], [0, 16], [10, 12], [16, 4]]);
    expect([34, 35, 38, 39, 51, 80].map((frame) => fatmanJoeMineCount(frame / NES_FRAME_RATE))).toEqual([0, 1, 1, 2, 5, 5]);
    expect(FATMAN_JOE_GRENADE_LIFETIME).toBeCloseTo(29 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_LAUNCH_INVULNERABILITY).toBe(0.75);
    expect(FATMAN_JOE_MOVEMENT_SPEED).toBeCloseTo((40 / 75) * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
    const joe = { x: 90 * NES_WORLD_X_SCALE, y: 89 * (540 / 240) };
    const billy = { x: 20 * NES_WORLD_X_SCALE, y: 216 * (540 / 240) };
    expect(fatmanJoeAimHeading(joe.x, joe.y, billy.x, billy.y)).toBe(18);
    expect([fatmanJoeCanLaunch(joe.x, joe.y, billy.x, billy.y, 0.49), fatmanJoeCanLaunch(joe.x, joe.y, billy.x, billy.y, 0.5)]).toEqual([false, true]);
    expect(fatmanJoeCanLaunch(joe.x, joe.y, joe.x + 100, joe.y, 1)).toBe(false);
    const [shellVx, shellVy] = fatmanJoeShellVelocity(joe.x, joe.y, billy.x, billy.y);
    expect(shellVx).toBeCloseTo(-0.9375 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
    expect(shellVy).toBeCloseTo(2.77734375 * NES_FRAME_RATE * (540 / 240), 9);
  });

  it("matches the traced first Wingate entrance", () => {
    expect(WINGATE_ENTRY_X_NES).toEqual([64, 104, 152, 192]);
    expect(WINGATE_ENTRY_X_LANES).toEqual([240, 390, 570, 720]);
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
    expect(WINGATE_SECOND_ENTRY_Y_NES).toBe(0);
    expect(WINGATE_SECOND_ENTRY_Y).toBe(0);
    expect(WINGATE_ENTRY_RUSH_DURATION).toBeCloseTo(34 / NES_FRAME_RATE, 9);
    expect(WINGATE_ENTRY_RUSH_SPEED).toBeCloseTo((26.5 / 34) * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
    expect(WINGATE_MOVEMENT_SPEED).toBeCloseTo((131 / 240) * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
    expect([wingateRushOffset(0), wingateRushOffset(17), wingateRushOffset(18), wingateRushOffset(34)]).toEqual([0, 0, -1, -26]);
    expect(WINGATE_SECOND_SPAWN_DELAY).toBeCloseTo(264 / NES_FRAME_RATE, 9);
    expect(WINGATE_FIRST_SHOT_DELAY).toBeCloseTo(4 / NES_FRAME_RATE, 9);
    expect(WINGATE_SECOND_FIRST_SHOT_DELAY).toBeCloseTo(277 / NES_FRAME_RATE, 9);
    expect(WINGATE_ATTACK_INTERVAL).toBeCloseTo(12 / NES_FRAME_RATE, 9);
    expect(WINGATE_FIRE_CHANCE).toBe(0.75);
    expect(WINGATE_BULLET_LIFETIME).toBeCloseTo(64 / NES_FRAME_RATE, 9);
    expect(WINGATE_BULLET_VELOCITIES_NES).toEqual([[1.15625, 1.40625], [0.9140625, 1.65625], [0.625, 1.8515625], [0.3125, 1.9453125], [0, 2], [-0.3125, 1.9453125], [-0.625, 1.8515625], [-0.9140625, 1.65625], [-1.15625, 1.40625]]);
    expect(WINGATE_PROJECTILE_X_OFFSET_NES).toBe(-8);
    expect(WINGATE_PROJECTILE_Y_OFFSET_NES).toBe(6);
    const actor = { x: 114 * NES_WORLD_X_SCALE, y: 50 * (540 / 240) };
    const target = { x: 39 * NES_WORLD_X_SCALE, y: 118 * (540 / 240) };
    expect(wingateAimHeading(actor.x, actor.y, target.x, target.y)).toBe(20);
    expect([wingateCanFire(actor.x, actor.y, target.x, target.y, 0.24), wingateCanFire(actor.x, actor.y, target.x, target.y, 0.25)]).toEqual([false, true]);
    expect(wingateCanFire(actor.x, actor.y, actor.x + 100, actor.y, 1)).toBe(false);
    const [wingateVx, wingateVy] = wingateProjectileVelocity(actor.x, actor.y, target.x, target.y);
    expect(wingateVx).toBeCloseTo(-1.15625 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
    expect(wingateVy).toBeCloseTo(1.40625 * NES_FRAME_RATE * (540 / 240), 9);
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
