import { describe, expect, it } from "vitest";
import { advanceRomRandom, mixRomRandomDifference, mixRomRandomFirstSum, mixRomRandomSecondSum, mixRomRandomSecondThirdSum, mixRomRandomSum, mixRomRandomThirdFirstSum, ROM_RANDOM_SEED } from "../src/game-constants";
import { AMMO_GAIN, backstabberRaidOffset, BACKSTABBER_AMBUSH_DEPTH, BACKSTABBER_AMBUSH_DROP_SPEED, BACKSTABBER_AMBUSH_LIFETIME, BACKSTABBER_RAID_LIFETIME, bomberCanThrow, bomberMovementDecision, bomberMovementDuration, BOMBER_MOVEMENT_DURATIONS, bomberMovementUsesRandom, bomberMovementVelocity, BOMBER_THROW_CHANCE, BOMBER_THROW_DURATION, bossReward, BOSS_DEFEAT_ANIMATION_DURATION, BOSS_REWARDS, BOOTS_SPEED_MULTIPLIER, clamp, distance, DYNAMITE_AIRBORNE_DURATION, DYNAMITE_LANDED_DURATION, DYNAMITE_LIFETIME, DYNAMITE_WORLD_SPEED, EMPTY_BARREL_EXPLOSION_LIFETIME, fallingRockOnScreen, fallingRockPosition, FIREBREATHER_FIRST_DECISION_DELAY, formationEntryY, HORSE_HIT_INVULNERABILITY, MACHINE_GUN_BULLET_LIFETIME, MAGNUM_BULLET_LIFETIME, MAGNUM_BULLET_SPEED, MAX_STAGE, NES_BULLET_SPEED, NES_DIAGONAL_BULLET_X, NES_DIAGONAL_BULLET_Y, NES_FRAME_RATE, NES_PLAYER_SPEED, NES_SCROLL_SPEED, NINJA_FIRST_SHOT_DELAY, NINJA_PROJECTILE_SPEED, obstacleBlocks, PISTOL_BULLET_LIFETIME, PLAYER_DEATH_ANIMATION_DURATION, PLAYER_DEATH_RECOVERY_DURATION, PLAYER_RESPAWN_HIDDEN_DURATION, PLAYER_RESPAWN_READY_DURATION, playerDeathPhase, RIFLEMAN_ATTACK_STATE_FRAME, RIFLEMAN_FIRST_SHOT_DELAY, RIFLEMAN_SHOT_INTERVAL, RIFLEMAN_SHOTS_PER_VOLLEY, ROCK_FLIGHT_PATH_NES, ROCK_FLIGHT_PATH_PHASE0_NES, ROCK_IMPACT_DELAY, ROCK_IMPACT_LIFETIME, ROCK_LIFETIME, ROM_OBJECT_DROP_SPEED, ROM_SCREEN_RELEASE_Y_NES, romActorScreenYReleased, ROAD_WIDTHS, ROUND_BOSS_GATE_SCROLL_NES, ROUND_BOSS_TRIGGERS, ROUND_ENEMY_TYPES, ROUND_LENGTHS, ROUND_LOOP_SCROLL_NES, ROUND_OBSTACLES, ROUND_SEGMENTS, scoreBossDefeat, SHOTGUN_BULLET_LIFETIME, SHOTGUNNER_FAN_NES, SHOTGUNNER_FIRST_VOLLEY_DELAY, SHOTGUNNER_LIFETIME, SHOTGUNNER_VOLLEY_INTERVAL, SHOP_COSTS, SHOP_TYPES, shouldClearProjectilesAfterBossDefeat, SMART_BOMB_CAPACITY, SNIPER_CODE2_SHOT_FRAMES, SNIPER_COVER_DURATION, SNIPER_LIFETIME, SNIPER_SHOT_FRAMES, sniperProjectileVelocity, segmentDelay, spendPoints, STAGES, unitMaxAge, WEAPONS, WANTED_COSTS, WORLD_BULLET_SPEED, WORLD_DIAGONAL_BULLET_X, WORLD_DIAGONAL_BULLET_Y, WORLD_PLAYER_SPEED, WORLD_SCROLL_SPEED, shouldLoopStage } from "../src/game-constants";
import { GUNMAN_BOTTOM_BRANCH_FRAME, GUNMAN_BOTTOM_LIFETIMES, GUNMAN_BOTTOM_NEAR_DISTANCE_NES, gunmanBottomPosition, gunmanBottomRoute, GUNMAN_BOTTOM_SHOT_FRAMES, gunmanCanFire, GUNMAN_ENTRY_PATH_NES, GUNMAN_FIRST_OPPORTUNITY_FRAMES, GUNMAN_FLANK_LIFETIMES, GUNMAN_FLANK_SHOT_FRAMES, GUNMAN_LIFETIME, GUNMAN_TOP_LIFETIMES_FRAMES, gunmanFirstOpportunityFrame, gunmanFlankPosition, gunmanOpeningY, gunmanTopBranch, gunmanTopPosition, gunmanProjectileVelocity, GUNMAN_SHOT_OPPORTUNITY_INTERVAL } from "../src/game-constants";
import { RIFLEMAN_LIFETIME, RIFLEMAN_PATH_NES, riflemanCanAttack, riflemanPosition, riflemanShotHeading, RIFLEMAN_SIDE_LIFETIME, RIFLEMAN_SIDE_PATH_NES, RIFLEMAN_SIDE_SHOT_FRAMES, riflemanSidePosition, mediumProjectileHeadingVelocity, mediumProjectileVelocity } from "../src/game-constants";
import { bossSpriteVisible, ninjaBossEntryLaneIndex, NINJA_BOSS_TELEPORT_DELAY } from "../src/game-constants";
import { hasWeaponStock } from "../src/game-constants";
import { ENEMY_DEFEAT_ANIMATION_DURATION } from "../src/game-constants";
import { ENEMY_DEFEAT_Y_OFFSETS_NES } from "../src/game-constants";
import { addScore, MAX_SCORE } from "../src/game-constants";
import { PLAYER_ENTRY_X, PLAYER_ENTRY_X_NES, PLAYER_ENTRY_Y, PLAYER_ENTRY_Y_NES } from "../src/game-constants";
import { NINJA_ACTIVATION_DISTANCE_NES, NINJA_LIFETIME, ninjaCanThrow } from "../src/game-constants";
import { NINJA_ATTACK_MOVE_DURATION, NINJA_ENTRY_PATH_NES, ninjaAttackPosition, ninjaOpeningY } from "../src/game-constants";
import { ROUND2_LOOP_HORSE_X, ROUND2_LOOP_HORSE_Y } from "../src/game-constants";
import { BOMBER_ENTRY_DURATION, BOMBER_ENTRY_END_Y, BOMBER_ENTRY_END_Y_NES, bomberOpeningY } from "../src/game-constants";
import { contactSourceShouldClear, DYNAMITE_AIM_FACTOR, dynamiteContactIsDefusable, DYNAMITE_HORIZONTAL_DURATION, DYNAMITE_VERTICAL_PATH_NES, dynamiteVerticalOffset } from "../src/game-constants";
import { advanceFirebreather, createFirebreatherState, FIREBREATHER_ACTIVATION_DISTANCE_NES, FIREBREATHER_AIM_WAIT_FRAMES, FIREBREATHER_ATTACK_FRAMES, FIREBREATHER_DECISION_INTERVAL_FRAMES, FIREBREATHER_ENTRY_FRAMES, FIREBREATHER_LIFETIME, FIREBREATHER_MOVE_FRAMES, FIREBREATHER_PROJECTILE_OFFSET_NES, FIREBREATHER_READY_WAIT_FRAMES } from "../src/game-constants";
import { advanceSpear, createSpearState, SPEAR_ATTACK_REMAINING_FRAME, SPEAR_LIFETIME, SPEAR_MOVE_FRAMES, SPEAR_PROJECTILE_OFFSET_NES, SPEAR_SIDE_ENTRY_FRAMES, SPEAR_TOP_ENTRY_FRAMES, SPEAR_WAIT_FRAMES } from "../src/game-constants";
import { advanceHatchet, createHatchetState, HATCHET_ENTRY_DEPTH_NES, HATCHET_ENTRY_PAUSE_FRAMES, HATCHET_LIFETIME, HATCHET_PATROL_BOUNDS_NES, HATCHET_THROW_FRAMES, HATCHET_TURN_FRAMES, hatchetCanThrow, hatchetTurnHeading, nesActorCollisionProbeOffset } from "../src/game-constants";
import { advanceBanditBillMovement, advanceCutterMovement, BANDIT_BILL_ATTACK_PAUSE_FRAMES, BANDIT_BILL_CRAWL_DURATION, BANDIT_BILL_DAMAGE_RECOVERY_DURATION, BANDIT_BILL_ENTRY_DURATION, BANDIT_BILL_ENTRY_END_Y, BANDIT_BILL_ENTRY_SPEED_Y, BANDIT_BILL_ENTRY_X_LANES, BANDIT_BILL_ENTRY_X_NES, BANDIT_BILL_ENTRY_Y, BANDIT_BILL_ENTRY_Y_NES, BANDIT_BILL_FIRST_VOLLEY_DELAY, BANDIT_BILL_HIT_STUN_DURATION, BANDIT_BILL_PROJECTILE_OFFSET_NES, BANDIT_BILL_RANDOM_HANDOFF_FINE_X, BANDIT_BILL_RANDOM_HANDOFF_FINE_Y, BANDIT_BILL_RANDOM_ROUTE_START_FRAME, BANDIT_BILL_ROUTE_HANDOFF_PAUSE_FRAMES, BANDIT_BILL_SHOT_INTERVAL, BANDIT_BILL_SHOTS_PER_VOLLEY, BANDIT_BILL_VOLLEY_GAP, banditBillCombatX, banditBillCombatY, banditBillOpeningY, banditBillProjectileVelocity, createBanditBillMovementState, createCutterMovementState, CUTTER_ENTRY_DURATION, CUTTER_ENTRY_END_Y, CUTTER_ENTRY_END_Y_NES, CUTTER_ENTRY_X_LANES, CUTTER_ENTRY_X_NES, CUTTER_ENTRY_Y, CUTTER_ENTRY_Y_NES, CUTTER_RANDOM_HANDOFF_FINE_X, CUTTER_RANDOM_HANDOFF_FINE_Y, CUTTER_RANDOM_HANDOFF_GAIT, CUTTER_RANDOM_HANDOFF_SEGMENT_FRAMES, CUTTER_RANDOM_ROUTE_START_FRAME, cutterCombatX, cutterCombatY, cutterOpeningX, cutterOpeningY, DEVIL_HAWK_ENTRY_DURATION, DEVIL_HAWK_ENTRY_END_Y, DEVIL_HAWK_ENTRY_END_Y_NES, DEVIL_HAWK_ENTRY_SPEED_Y, DEVIL_HAWK_ENTRY_X_LANES, DEVIL_HAWK_ENTRY_X_NES, DEVIL_HAWK_ENTRY_Y, DEVIL_HAWK_ENTRY_Y_NES, DEVIL_HAWK_POST_ENTRY_X_HOLD, DEVIL_HAWK_RANDOM_HANDOFF_ACTION_COUNTER, DEVIL_HAWK_RANDOM_HANDOFF_FINE_X, DEVIL_HAWK_RANDOM_HANDOFF_FINE_Y, DEVIL_HAWK_RANDOM_HANDOFF_GAIT, DEVIL_HAWK_RANDOM_HANDOFF_HEADING, DEVIL_HAWK_RANDOM_HANDOFF_SEGMENT_FRAMES, devilHawkCombatX, devilHawkOpeningY, FATMAN_JOE_ENTRY_DURATION, FATMAN_JOE_ENTRY_END_Y, FATMAN_JOE_ENTRY_END_Y_NES, FATMAN_JOE_ENTRY_X_LANES, FATMAN_JOE_ENTRY_X_NES, FATMAN_JOE_ENTRY_Y, FATMAN_JOE_ENTRY_Y_NES, fatmanJoeCombatX, fatmanJoeCombatY, fatmanJoeOpeningY, nesAimHeading, NINJA_BOSS_ENTRY_LANES, NINJA_BOSS_ENTRY_LANES_NES, NES_WORLD_X_SCALE, NES_WORLD_Y_SCALE, WINGATE_ENTRY_X_LANES, WINGATE_ENTRY_X_NES, WINGATE_ENTRY_Y, WINGATE_ENTRY_Y_NES, WINGATE_SECOND_ENTRY_Y, WINGATE_SECOND_ENTRY_Y_NES, WINGATE_SECOND_SPAWN_DELAY } from "../src/game-constants";
import { banditBillCooldown } from "../src/game-constants";
import { advanceInvulnerability, BLUE_YASHICHI_DURATION, MAX_LIVES } from "../src/game-constants";
import { BOSS_BAR_RECOVERY_DURATION, bossCurrentBarHitPoints, bossHealthProfile, bossTotalHitPoints } from "../src/game-constants";
import { RIFLE_BULLET_SPEED_MULTIPLIER } from "../src/game-constants";
import { BOSS_PROJECTILE_CAPACITY, canSpawnBossProjectile, canSpawnEnemyProjectile, canSpawnPlayerBullet, ENEMY_PROJECTILE_CAPACITY, machineGunVelocities, pistolBulletSpeedFactor, pistolShots, pistolVelocities, PLAYER_BULLET_CAPACITY, shotgunVelocities, weaponBulletLifetime, weaponCanRepeat } from "../src/game-constants";
import { LIFE_OVERFLOW_SCORE, lifePickup, MAX_POWERUP_STOCK, POWERUP_OVERFLOW_SCORE, storedPowerupPickup } from "../src/game-constants";
import { FATMAN_JOE_ATTACK_DECISION_INTERVAL, fatmanJoeAimAllowsLaunch, fatmanJoeAimHeading, fatmanJoeArenaXBounds, fatmanJoeCanLaunch, FATMAN_JOE_FIRST_ATTACK_DELAY, FATMAN_JOE_GRENADE_LIFETIME, FATMAN_JOE_LAUNCH_INVULNERABILITY, FATMAN_JOE_LONG_ACTION_DURATION, FATMAN_JOE_MINE_INTERVAL, fatmanJoeMineCount, FATMAN_JOE_MINE_OFFSETS_NES, FATMAN_JOE_MOVEMENT_SPEED, FATMAN_JOE_SHORT_ACTION_DURATION, FATMAN_JOE_SHELL_FLIGHT_DURATION, FATMAN_JOE_SHELL_LIFETIME, FATMAN_JOE_SHELL_SPLIT_DELAY, fatmanJoeMovementActionDuration, fatmanJoeShellVelocity } from "../src/game-constants";
import { advanceWingateMovement, createWingateMovementState, wingateAimHeading, WINGATE_BULLET_LIFETIME, WINGATE_BULLET_VELOCITIES_NES, wingateCanFire, WINGATE_PROJECTILE_X_OFFSET_NES, WINGATE_PROJECTILE_Y_OFFSET_NES, wingateProjectileVelocity } from "../src/game-constants";
import { CUTTER_ATTACK_INTERVAL, CUTTER_BOOMERANG_FIRST_TURN_DELAY, CUTTER_BOOMERANG_HEADINGS, cutterBoomerangHeadingToward, CUTTER_BOOMERANG_LIFETIME, CUTTER_BOOMERANG_OUTWARD_TARGETS_NES, CUTTER_BOOMERANG_REAIM_Y_NES, CUTTER_BOOMERANG_SCREEN_MAX_X_NES, CUTTER_BOOMERANG_SCREEN_MAX_Y_NES, CUTTER_BOOMERANG_SCREEN_MIN_X_NES, CUTTER_BOOMERANG_SPAWN_NES, CUTTER_BOOMERANG_TURN_INTERVAL, cutterBoomerangOnScreen, cutterBoomerangTurn, cutterBoomerangVelocity, CUTTER_FIRST_ATTACK_DELAY } from "../src/game-constants";
import { CUTTER_MOVEMENT_SPEED } from "../src/game-constants";
import { advanceDevilHawkMovement, createDevilHawkMovementState, devilHawkAttackDelay, devilHawkFanHeadings, DEVIL_HAWK_ATTACK_FRAMES, DEVIL_HAWK_FIRST_VOLLEY_DELAY, DEVIL_HAWK_FULL_FAN_HEADINGS, DEVIL_HAWK_FULL_FAN_LIFETIME, DEVIL_HAWK_FULL_FAN_MAX_Y_NES, DEVIL_HAWK_JUMP_PERIOD, devilHawkProjectileVelocity, DEVIL_HAWK_SIDE_FAN_LIFETIME, DEVIL_HAWK_VOLLEY_INTERVAL } from "../src/game-constants";
import { devilHawkCombatY } from "../src/game-constants";
import { NINJA_BOSS_ATTACK_INTERVAL, NINJA_BOSS_ENTRY_INVULNERABILITY, NINJA_BOSS_FIRST_NATURAL_TELEPORT, NINJA_BOSS_REPEAT_NATURAL_TELEPORT, NINJA_BOSS_FIRST_ATTACK_DELAY, NINJA_BOSS_FIRST_PREPARE_DELAY, NINJA_BOSS_PREPARE_CONTROLLER_DURATION, NINJA_BOSS_PREPARE_DURATION, NINJA_BOSS_SHURIKEN_COUNT, NINJA_BOSS_SHURIKEN_LIFETIME, NINJA_BOSS_SHURIKEN_SPAWN_OFFSET_NES, NINJA_BOSS_SHURIKEN_VELOCITIES_NES, ninjaBossCombatX, ninjaBossCombatY, ninjaBossNextTeleportAt, ninjaBossPreparePosition } from "../src/game-constants";
import { SHOTGUNNER_PATH_NES, shotgunnerPosition } from "../src/game-constants";
import { SHOTGUNNER_SIDE_LIFETIME, SHOTGUNNER_SIDE_PATH_NES, SHOTGUNNER_SIDE_SHOT_FRAME, shotgunnerSidePosition } from "../src/game-constants";
import { hasSpecialAmmoStock, romEnemyDrop, romEnemyScore } from "../src/game-constants";
import { ROM_PROJECTILE_SCREEN_SIZE_NES, romProjectileOnScreen } from "../src/game-constants";
import { roundCollisionAtNes, roundCollisionBlocks, ROUND_COLLISION_ROW_COUNTS } from "../src/round-collision";
import { canSpawnRomPool, compareRomEventOrder, ROM_BREAKABLE_CONTAINER_DISPATCH_TYPES, ROM_EMPTY_BARREL_ENTITY_CODES, ROM_ENEMY_SLOT_CAPACITY, ROM_ENTITY_HIT_POINTS, ROM_FALLING_ROCK_BEHAVIORS, ROM_OBJECT_PICKUPS, ROM_OBJECT_SLOT_CAPACITY, ROM_SCENE_PROP_DISPATCH_TYPES, ROUND_ROM_ENEMY_EVENTS, ROUND_ROM_ENEMY_EVENT_COUNTS, ROUND_ROM_OBJECT_EVENTS, ROUND_ROM_OBJECT_EVENT_COUNTS, ROM_BEHAVIOR_ENEMY_TYPES, romEntityHitPoints, romEventWorldAt, romEventWorldX, romEventWorldY, romObjectWorldAt, romObjectWorldX } from "../src/rom-event-data";

describe("Gun.Smoke vertical slice", () => {
  it("matches the traced player death and respawn phases", () => {
    expect(PLAYER_DEATH_ANIMATION_DURATION).toBeCloseTo(152 / NES_FRAME_RATE, 9);
    expect(PLAYER_RESPAWN_HIDDEN_DURATION).toBeCloseTo(100 / NES_FRAME_RATE, 9);
    expect(PLAYER_RESPAWN_READY_DURATION).toBeCloseTo(40 / NES_FRAME_RATE, 9);
    expect(PLAYER_DEATH_RECOVERY_DURATION).toBeCloseTo(292 / NES_FRAME_RATE, 9);
    expect([151, 152, 251, 252, 291, 292].map((frame) => playerDeathPhase(frame / NES_FRAME_RATE))).toEqual(["dying", "hidden", "hidden", "ready", "ready", "active"]);
  });

  it("advances the ROM random register with the NMI carry chain", () => {
    let state: [number, number, number, number] = [...ROM_RANDOM_SEED];
    for (let count = 0; count < 4; count += 1) state = advanceRomRandom(state);
    expect(state).toEqual([202, 96, 0, 0]);
    expect(advanceRomRandom([0, 2, 2, 0])).toEqual([129, 1, 1, 0]);
    expect(advanceRomRandom([8, 35, 208, 121])).toEqual([133, 17, 232, 60]);
    expect(mixRomRandomSum([93, 58, 115, 248])).toEqual([93, 151, 115, 248]);
    expect(mixRomRandomFirstSum([93, 58, 115, 248])).toEqual([151, 58, 115, 248]);
    expect(mixRomRandomSecondSum([93, 58, 115, 248])).toEqual([93, 58, 107, 248]);
    expect(mixRomRandomThirdFirstSum([93, 58, 115, 248])).toEqual([93, 58, 208, 248]);
    expect(mixRomRandomSecondThirdSum([93, 58, 115, 248])).toEqual([93, 173, 115, 248]);
    expect(mixRomRandomDifference([93, 58, 115, 248])).toEqual([34, 58, 115, 248]);
  });

  it("matches the traced Horse hit protection", () => {
    expect(HORSE_HIT_INVULNERABILITY).toBeCloseTo(60 / NES_FRAME_RATE, 9);
  });

  it("keeps the NES-inspired stage constants stable", () => {
    expect({ frameRate: NES_FRAME_RATE, rounds: MAX_STAGE }).toEqual({ frameRate: 60.098, rounds: 6 });
    expect(MAX_LIVES).toBe(5);
    expect(BLUE_YASHICHI_DURATION).toBeCloseTo(360 / NES_FRAME_RATE, 9);
    expect(advanceInvulnerability(1 / NES_FRAME_RATE, true, 1 / NES_FRAME_RATE)).toEqual({ duration: HORSE_HIT_INVULNERABILITY, destroysEnemies: false });
    expect(advanceInvulnerability(HORSE_HIT_INVULNERABILITY, false, 1 / NES_FRAME_RATE)).toEqual({ duration: 59 / NES_FRAME_RATE, destroysEnemies: false });
    expect([1, 2, 3, 4, 5, 6].map((stage) => bossHealthProfile(stage))).toEqual([
      { bars: 4, hitPoints: 3 }, { bars: 4, hitPoints: 2 }, { bars: 5, hitPoints: 6 },
      { bars: 4, hitPoints: 1 }, { bars: 6, hitPoints: 12 }, { bars: 1, hitPoints: 6 },
    ]);
    expect([1, 2, 3, 4, 5, 6].map((stage) => bossTotalHitPoints(stage, stage === 6 ? 1 : 0))).toEqual([12, 8, 30, 4, 72, 72]);
    expect([bossCurrentBarHitPoints(12, 3), bossCurrentBarHitPoints(10, 3), bossCurrentBarHitPoints(1, 3)]).toEqual([3, 1, 1]);
    expect(BOSS_BAR_RECOVERY_DURATION).toBeCloseTo(8 / NES_FRAME_RATE, 9);
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
    expect(ROM_SCREEN_RELEASE_Y_NES).toBe(252);
    expect([romActorScreenYReleased(251.49), romActorScreenYReleased(251.5), romActorScreenYReleased(252)]).toEqual([false, true, true]);
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

  it("releases unbounded enemy projectiles at the ROM coordinate overflow", () => {
    expect(ROM_PROJECTILE_SCREEN_SIZE_NES).toBe(256);
    expect([romProjectileOnScreen(0, 0), romProjectileOnScreen(255, 255), romProjectileOnScreen(-1, 100), romProjectileOnScreen(256, 100), romProjectileOnScreen(100, 256)]).toEqual([true, true, false, false, false]);
  });

  it("keeps the six-slot Boss projectile pool separate", () => {
    expect(BOSS_PROJECTILE_CAPACITY).toBe(6);
    expect([canSpawnBossProjectile(5), canSpawnBossProjectile(6)]).toEqual([true, false]);
  });

  it("uses the ROM enemy drop flag and current special stock", () => {
    expect(hasSpecialAmmoStock({ shotgun: 0, machinegun: 0, magnum: 0 })).toBe(false);
    expect(hasSpecialAmmoStock({ shotgun: 0, machinegun: 1, magnum: 0 })).toBe(true);
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
    expect(POWERUP_OVERFLOW_SCORE).toBe(1_000);
    expect(storedPowerupPickup(3)).toEqual({ stock: 4, score: 0 });
    expect(storedPowerupPickup(4)).toEqual({ stock: 4, score: 1_000 });
    expect(LIFE_OVERFLOW_SCORE).toBe(10_000);
    expect(lifePickup(4)).toEqual({ lives: 5, score: 0 });
    expect(lifePickup(5)).toEqual({ lives: 5, score: 10_000 });
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
    expect([hasWeaponStock(0), hasWeaponStock(1), hasWeaponStock(WEAPONS.shotgun.maxAmmo)]).toEqual([false, true, true]);
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
    expect(roundCollisionAtNes(4, 0, 4, 48)).toBe(true);
    expect(roundCollisionAtNes(4, 0, 48, 48)).toBe(true);
    expect(roundCollisionAtNes(1, 0, 0, 0)).toBe(false);
  });

  it("keeps the ROM enemy event streams ordered and bounded", () => {
    expect(ROUND_ROM_ENEMY_EVENT_COUNTS).toEqual([128, 137, 275, 299, 185, 313]);
    expect(ROUND_ROM_OBJECT_EVENT_COUNTS).toEqual([42, 20, 32, 22, 24, 23]);
    expect(ROM_BEHAVIOR_ENEMY_TYPES).toHaveLength(12);
    expect(ROM_BEHAVIOR_ENEMY_TYPES[1]).toBe("shotgunner");
    expect(ROM_BEHAVIOR_ENEMY_TYPES[3]).toBe("backstabber");
    expect(ROM_BEHAVIOR_ENEMY_TYPES[5]).toBeUndefined();
    expect(ROM_BEHAVIOR_ENEMY_TYPES[7]).toBe("rifleman");
    expect(ROUND_ROM_ENEMY_EVENTS[3]!.find((event) => event.behavior === 5)?.phase).toBe(1);
    expect(ROUND_ROM_ENEMY_EVENTS[3]!.find((event) => event.behavior === 5 && event.y === 112)?.phase).toBe(0);
    expect(ROM_ENEMY_SLOT_CAPACITY).toBe(7);
    expect(ROM_OBJECT_SLOT_CAPACITY).toBe(6);
    expect(ROM_EMPTY_BARREL_ENTITY_CODES).toEqual([32, 41]);
    expect(ROM_ENTITY_HIT_POINTS).toMatchObject({ 1: 1, 3: 3, 6: 1, 10: 4, 11: 1, 13: 2, 14: 3, 16: 2, 17: 3, 19: 3, 21: 3, 32: 6, 42: 6 });
    expect([1, 3, 6, 10, 11, 12, 13, 14, 16, 17, 19, 21, 32, 42, 255].map(romEntityHitPoints)).toEqual([1, 3, 1, 4, 1, 5, 2, 3, 2, 3, 3, 3, 6, 6, 1]);
    expect(EMPTY_BARREL_EXPLOSION_LIFETIME).toBeCloseTo(10 / NES_FRAME_RATE, 9);
    expect(ENEMY_DEFEAT_ANIMATION_DURATION).toBeCloseTo(5 / NES_FRAME_RATE, 9);
    expect(ENEMY_DEFEAT_Y_OFFSETS_NES).toEqual([0, -4, -7, -10, -12]);
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
    expect([47, 48, 191, 192].map((y) => bomberMovementUsesRandom(y * NES_WORLD_Y_SCALE))).toEqual([false, true, true, false]);
    expect(bomberMovementVelocity(2)).toEqual([0.828125 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 0]);
    expect(bomberMovementVelocity(4)).toEqual([0, NES_FRAME_RATE * (540 / 240)]);
    expect([bomberCanThrow(126 * (540 / 240), 188 * (540 / 240), 0.49), bomberCanThrow(126 * (540 / 240), 190 * (540 / 240), 0)]).toEqual([true, false]);
    expect([bomberMovementDecision(47 * NES_WORLD_Y_SCALE, 255), bomberMovementDecision(100 * NES_WORLD_Y_SCALE, 31), bomberMovementDecision(100 * NES_WORLD_Y_SCALE, 128), bomberMovementDecision(192 * NES_WORLD_Y_SCALE, 0)]).toEqual([
      { throwDynamite: false, direction: 0 }, { throwDynamite: false, direction: 7 }, { throwDynamite: true, direction: 0 }, { throwDynamite: false, direction: 4 },
    ]);
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
    expect([
      contactSourceShouldClear("enemy", undefined),
      contactSourceShouldClear("boss", undefined),
      contactSourceShouldClear("enemyBullet", "bullet"),
      contactSourceShouldClear("enemyBullet", "boomerang"),
      contactSourceShouldClear("enemyBullet", "grenade"),
      contactSourceShouldClear("enemyBullet", "grenadeShell"),
      contactSourceShouldClear("enemyBullet", "rock"),
      contactSourceShouldClear("enemyBullet", "dynamite", true),
      contactSourceShouldClear("enemyBullet", "dynamite", false),
      contactSourceShouldClear("enemyBullet", "bullet", false, true),
      contactSourceShouldClear("enemyBullet", "shuriken", false, true),
      contactSourceShouldClear("enemyBullet", "fireball", false, true),
    ]).toEqual([false, false, true, false, false, false, false, true, false, true, true, false]);
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
    expect(SNIPER_COVER_DURATION).toBeCloseTo(90 / NES_FRAME_RATE, 9);
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
    expect(NINJA_BOSS_FIRST_NATURAL_TELEPORT).toBeCloseTo(339 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_REPEAT_NATURAL_TELEPORT).toBeCloseTo(424 / NES_FRAME_RATE, 9);
    expect(ninjaBossNextTeleportAt()).toBeCloseTo(339 / NES_FRAME_RATE, 9);
    expect(ninjaBossNextTeleportAt((339 + 90) / NES_FRAME_RATE)).toBeCloseTo(853 / NES_FRAME_RATE, 9);
    expect(ninjaBossPreparePosition(0, 147, 104, 134, 182)).toEqual([147, 104]);
    expect(ninjaBossPreparePosition(NINJA_BOSS_PREPARE_DURATION, 147, 104, 134, 182)).toEqual([134, 182]);
    expect(ninjaBossCombatX(43 / NES_FRAME_RATE)).toBe(176 * NES_WORLD_X_SCALE);
    expect(ninjaBossCombatX(44 / NES_FRAME_RATE)).toBe(175 * NES_WORLD_X_SCALE);
    expect(ninjaBossCombatX(95 / NES_FRAME_RATE)).toBe(163 * NES_WORLD_X_SCALE);
    expect(ninjaBossCombatX(170 / NES_FRAME_RATE)).toBe(102 * NES_WORLD_X_SCALE);
    expect(ninjaBossCombatX(0, 112 * NES_WORLD_X_SCALE, true)).toBe(420);
    expect(ninjaBossCombatX(304 / NES_FRAME_RATE, 112 * NES_WORLD_X_SCALE, true)).toBe(611.25);
    expect([bossSpriteVisible(1, 1, 2, false), bossSpriteVisible(5, 1, 2, false), bossSpriteVisible(4, 1, 2, false), bossSpriteVisible(4, 3, 2, true), bossSpriteVisible(4, 3, 2, false)]).toEqual([true, true, false, false, true]);
  });

  it("matches the traced falling-rock hazard timing", () => {
    expect(ROCK_FLIGHT_PATH_NES).toEqual([[0, 0, 0], [8, 19, 4], [16, 34, 19], [24, 41, 41], [32, 61, 43], [40, 78, 55], [48, 90, 73], [56, 96, 96], [64, 116, 98], [72, 134, 106], [80, 149, 122], [88, 160, 142], [96, 165, 166]]);
    expect(ROCK_FLIGHT_PATH_PHASE0_NES).toEqual([[0, 0, 0], [8, 19, 6], [16, 36, 18], [24, 51, 34], [32, 61, 54], [40, 67, 77], [48, 82, 79], [56, 102, 79], [64, 121, 84], [72, 139, 94], [80, 155, 109], [88, 167, 127], [94, 174, 143]]);
    expect(fallingRockPosition(48 / NES_FRAME_RATE, true)).toEqual([90, 73]);
    expect(fallingRockPosition(56 / NES_FRAME_RATE, true, 0)).toEqual([102, 79]);
    expect(fallingRockPosition(96 / NES_FRAME_RATE, false)).toEqual([-165, 166]);
    expect(ROCK_IMPACT_DELAY).toBeCloseTo(96 / NES_FRAME_RATE, 9);
    expect(ROCK_IMPACT_LIFETIME).toBeCloseTo(25 / NES_FRAME_RATE, 9);
    expect(ROCK_LIFETIME).toBeCloseTo(121 / NES_FRAME_RATE, 9);
    expect([fallingRockOnScreen(-1), fallingRockOnScreen(0), fallingRockOnScreen(251), fallingRockOnScreen(252)]).toEqual([false, true, true, false]);
  });

  it("matches the traced Hatchet timing", () => {
    expect(HATCHET_LIFETIME).toBeCloseTo(1042 / NES_FRAME_RATE, 9);
    expect([HATCHET_ENTRY_DEPTH_NES, HATCHET_ENTRY_PAUSE_FRAMES, HATCHET_TURN_FRAMES, HATCHET_THROW_FRAMES]).toEqual([40, 20, 34, 26]);
    expect(HATCHET_PATROL_BOUNDS_NES).toEqual([40, 216]);
    expect([hatchetTurnHeading(33, false, false), hatchetTurnHeading(0, false, false), hatchetTurnHeading(33, true, false), hatchetTurnHeading(33, true, true)]).toEqual([9, 24, 7, 25]);
    expect([nesActorCollisionProbeOffset(0), nesActorCollisionProbeOffset(8), nesActorCollisionProbeOffset(16), nesActorCollisionProbeOffset(24)]).toEqual([[0, -12], [12, 0], [0, 12], [-12, 0]]);
    expect(hatchetCanThrow(128 * NES_WORLD_X_SCALE, 0, 144 * NES_WORLD_X_SCALE, 100 * NES_WORLD_Y_SCALE)).toBe(true);
    expect(hatchetCanThrow(128 * NES_WORLD_X_SCALE, 0, 176 * NES_WORLD_X_SCALE, 100 * NES_WORLD_Y_SCALE)).toBe(false);
    const replay = (playerX: number) => {
      const state = createHatchetState(120);
      const shots: { frame: number; heading: number }[] = [];
      for (let frame = 1; frame <= 1042; frame += 1) {
        const scroll = (159 + Math.floor(frame / 3)) * NES_WORLD_Y_SCALE;
        const result = advanceHatchet(state, frame, playerX, 188, (probeX, probeY) => roundCollisionAtNes(3, scroll, probeX, probeY));
        for (const heading of result.shots) shots.push({ frame, heading });
        if (result.dead) return { shots, release: frame };
      }
      return { shots, release: 1042 };
    };
    expect(replay(136)).toEqual({ shots: [{ frame: 78, heading: 16 }, { frame: 364, heading: 17 }, { frame: 598, heading: 15 }], release: 713 });
    expect(replay(40)).toEqual({ shots: [{ frame: 234, heading: 16 }], release: 651 });
    expect(replay(220)).toEqual({ shots: [], release: 621 });
  });

  it("matches the traced Firebreather timing", () => {
    expect(FIREBREATHER_FIRST_DECISION_DELAY).toBeCloseTo(156 / NES_FRAME_RATE, 9);
    expect(FIREBREATHER_LIFETIME).toBe(Number.POSITIVE_INFINITY);
    expect([FIREBREATHER_ENTRY_FRAMES, FIREBREATHER_AIM_WAIT_FRAMES, FIREBREATHER_READY_WAIT_FRAMES, FIREBREATHER_DECISION_INTERVAL_FRAMES, FIREBREATHER_MOVE_FRAMES, FIREBREATHER_ATTACK_FRAMES, FIREBREATHER_ACTIVATION_DISTANCE_NES]).toEqual([32, 40, 20, 52, 24, 39, 96]);
    expect(FIREBREATHER_PROJECTILE_OFFSET_NES).toEqual([0, -1]);
    const state = createFirebreatherState(88, 0, 16);
    const shots: { frame: number; heading: number }[] = [];
    for (let frame = 1; frame <= 312; frame += 1) {
      const scroll = (1087 + Math.floor(frame / 3)) * NES_WORLD_Y_SCALE;
      const result = advanceFirebreather(state, frame, 136, 188, (probeX, probeY) => roundCollisionAtNes(3, scroll, probeX, probeY), () => 0);
      for (const heading of result.shots) shots.push({ frame, heading });
    }
    expect(shots).toEqual([{ frame: 156, heading: 14 }, { frame: 208, heading: 13 }, { frame: 260, heading: 12 }, { frame: 312, heading: 10 }]);
    const moving = createFirebreatherState(88, 0, 16);
    for (let frame = 1; frame <= 208; frame += 1) {
      const scroll = (1087 + Math.floor(frame / 3)) * NES_WORLD_Y_SCALE;
      advanceFirebreather(moving, frame, 136, 188, (probeX, probeY) => roundCollisionAtNes(3, scroll, probeX, probeY), () => 5);
    }
    expect({ mode: moving.mode, heading: moving.heading }).toEqual({ mode: "move", heading: 28 });
    expect(createFirebreatherState(248, 64, 24).heading).toBe(24);
  });

  it("matches the traced Spear timing", () => {
    expect(SPEAR_LIFETIME).toBe(Number.POSITIVE_INFINITY);
    expect([SPEAR_TOP_ENTRY_FRAMES, SPEAR_SIDE_ENTRY_FRAMES, SPEAR_WAIT_FRAMES, SPEAR_MOVE_FRAMES, SPEAR_ATTACK_REMAINING_FRAME]).toEqual([24, 40, 40, 32, 24]);
    expect(SPEAR_PROJECTILE_OFFSET_NES).toEqual([0, 0]);
    const replay = (sideEntry: boolean) => {
      const state = createSpearState(sideEntry ? 248 : 144, sideEntry ? 32 : 0, sideEntry);
      const shots: { frame: number; heading: number }[] = [];
      const checkpoints: { frame: number; x: number; y: number }[] = [];
      for (let frame = 1; frame <= 304; frame += 1) {
        const result = advanceSpear(state, frame, 136, 188, () => 0x10);
        for (const heading of result.shots) shots.push({ frame, heading });
        if (frame === (sideEntry ? 40 : 24) || frame === (sideEntry ? 112 : 96)) checkpoints.push({ frame, x: Math.round(state.x), y: Math.round(state.y) });
      }
      return { checkpoints, shots };
    };
    const top = replay(false);
    const side = replay(true);
    expect(top.checkpoints).toEqual([{ frame: 24, x: 144, y: 77 }, { frame: 96, x: 108, y: 142 }]);
    expect(top.shots).toEqual([{ frame: 144, heading: 14 }, { frame: 288, heading: 12 }]);
    expect(side.checkpoints).toEqual([{ frame: 40, x: 183, y: 83 }, { frame: 112, x: 148, y: 148 }]);
    expect(side.shots).toEqual([{ frame: 160, heading: 18 }, { frame: 304, heading: 20 }]);
    const release = createSpearState(248, 32, true);
    expect(advanceSpear(release, 537, 136, 188, () => 0x10).dead).toBe(false);
    expect(advanceSpear(release, 538, 136, 188, () => 0x10).dead).toBe(true);
  });

  it("matches the traced Round 5 ambush backstabber", () => {
    expect(BACKSTABBER_AMBUSH_DROP_SPEED).toBe(45);
    expect(BACKSTABBER_AMBUSH_DEPTH).toBe(178);
    expect(BACKSTABBER_AMBUSH_LIFETIME).toBeCloseTo(532 / NES_FRAME_RATE, 9);
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
    expect(GUNMAN_TOP_LIFETIMES_FRAMES).toEqual({ center: 549, left: 828, right: 1196 });
    expect([gunmanTopBranch(40, 88), gunmanTopBranch(136, 88), gunmanTopBranch(220, 88)]).toEqual(["left", "center", "right"]);
    expect(gunmanTopPosition(240 / NES_FRAME_RATE, 136)).toEqual([211 * NES_WORLD_X_SCALE, 163 * NES_WORLD_Y_SCALE]);
    expect(gunmanTopPosition(105 / NES_FRAME_RATE, 136)).toEqual([105 * NES_WORLD_X_SCALE, 134 * NES_WORLD_Y_SCALE]);
    expect(gunmanTopPosition(400 / NES_FRAME_RATE, 40)).toEqual([38 * NES_WORLD_X_SCALE, 132 * NES_WORLD_Y_SCALE]);
    expect(gunmanTopPosition(139 / NES_FRAME_RATE, 40)).toEqual([44 * NES_WORLD_X_SCALE, 132 * NES_WORLD_Y_SCALE]);
    expect(gunmanTopPosition(640 / NES_FRAME_RATE, 220)).toEqual([146 * NES_WORLD_X_SCALE, 219 * NES_WORLD_Y_SCALE]);
    expect(gunmanTopPosition(664 / NES_FRAME_RATE, 220)).toEqual([165 * NES_WORLD_X_SCALE, 218 * NES_WORLD_Y_SCALE]);
    expect(gunmanTopPosition(105 / NES_FRAME_RATE, 136, 152)).toEqual([132.5 * NES_WORLD_X_SCALE, 129.625 * NES_WORLD_Y_SCALE]);
    expect(gunmanTopPosition(828 / NES_FRAME_RATE, 40)).toEqual([12 * NES_WORLD_X_SCALE, 252 * NES_WORLD_Y_SCALE]);
    expect(gunmanTopPosition(1195 / NES_FRAME_RATE, 220)).toEqual([229 * NES_WORLD_X_SCALE, 183 * NES_WORLD_Y_SCALE]);
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
    expect(BANDIT_BILL_PROJECTILE_OFFSET_NES).toEqual([-4, 8]);
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
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 11 / NES_FRAME_RATE)).toBe(162);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 119 / NES_FRAME_RATE)).toBeCloseTo(110.25, 9);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION + 227 / NES_FRAME_RATE)).toBeCloseTo(551.25, 9);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 768 / NES_FRAME_RATE)).toBe(256.5);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION + 1104 / NES_FRAME_RATE)).toBe(622.5);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION + 3472 / NES_FRAME_RATE)).toBeCloseTo(190 * NES_WORLD_X_SCALE, 9);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 3472 / NES_FRAME_RATE)).toBeCloseTo(67 * NES_WORLD_Y_SCALE, 9);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 3600 / NES_FRAME_RATE)).toBeCloseTo(67 * NES_WORLD_Y_SCALE, 9);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION + 4096 / NES_FRAME_RATE)).toBeCloseTo(125 * NES_WORLD_X_SCALE, 9);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 7680 / NES_FRAME_RATE)).toBeCloseTo(95 * NES_WORLD_Y_SCALE, 9);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 4000 / NES_FRAME_RATE)).not.toBe(67 * NES_WORLD_Y_SCALE);
  });

  it("matches the traced Bandit Bill damage recovery", () => {
    expect(BANDIT_BILL_HIT_STUN_DURATION).toBeCloseTo(8 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_CRAWL_DURATION).toBeCloseTo(168 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_DAMAGE_RECOVERY_DURATION).toBeCloseTo(176 / NES_FRAME_RATE, 9);
  });

  it("continues Bandit Bill from the sampled route", () => {
    expect(BANDIT_BILL_RANDOM_ROUTE_START_FRAME).toBe(7_680);
    expect([BANDIT_BILL_RANDOM_HANDOFF_FINE_X, BANDIT_BILL_RANDOM_HANDOFF_FINE_Y, BANDIT_BILL_ATTACK_PAUSE_FRAMES, BANDIT_BILL_ROUTE_HANDOFF_PAUSE_FRAMES]).toEqual([64, 200, 37, 24]);
    const movement = createBanditBillMovementState(187, 95);
    advanceBanditBillMovement(movement, BANDIT_BILL_RANDOM_ROUTE_START_FRAME + 25, () => 0xd5);
    expect({ frame: movement.frame, x: Math.floor(movement.x), y: Math.floor(movement.y), pause: movement.pauseFrames }).toEqual({ frame: 7_705, x: 187, y: 95, pause: 0 });
    advanceBanditBillMovement(movement, BANDIT_BILL_RANDOM_ROUTE_START_FRAME + 36, () => 0xd5);
    expect({ x: Math.round(movement.x), y: Math.round(movement.y), heading: movement.heading }).toEqual({ x: 182, y: 101, heading: 0x54 });
    const handoff = createBanditBillMovementState(187 + BANDIT_BILL_RANDOM_HANDOFF_FINE_X / 256, 95 + BANDIT_BILL_RANDOM_HANDOFF_FINE_Y / 256);
    advanceBanditBillMovement(handoff, BANDIT_BILL_RANDOM_ROUTE_START_FRAME + 24, () => 0xd5);
    expect({ x: handoff.x, y: handoff.y, pause: handoff.pauseFrames, heading: handoff.heading, segment: handoff.segmentFrames }).toEqual({ x: 187.25, y: 95.78125, pause: 0, heading: 0x58, segment: 0 });
    advanceBanditBillMovement(handoff, BANDIT_BILL_RANDOM_ROUTE_START_FRAME + 25, () => 0xd5);
    expect({ x: handoff.x, y: handoff.y, heading: handoff.heading, segment: handoff.segmentFrames }).toEqual({ x: 187.25, y: 95.78125, heading: 0x54, segment: 47 });
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
    expect(cutterCombatX(CUTTER_ENTRY_DURATION)).toBe(483.75);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 71 / NES_FRAME_RATE)).toBe(191.25);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 320 / NES_FRAME_RATE)).toBe(446.25);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 560 / NES_FRAME_RATE)).toBe(600);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 320 / NES_FRAME_RATE, 88 * NES_WORLD_X_SCALE)).toBe(236.25);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 3264 / NES_FRAME_RATE)).toBeCloseTo(159 * NES_WORLD_X_SCALE, 9);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 3264 / NES_FRAME_RATE)).toBeCloseTo(49 * NES_WORLD_Y_SCALE, 9);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 3600 / NES_FRAME_RATE)).toBeCloseTo(130 * NES_WORLD_X_SCALE, 9);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 3600 / NES_FRAME_RATE)).toBeCloseTo(85 * NES_WORLD_Y_SCALE, 9);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 4096 / NES_FRAME_RATE)).toBeCloseTo(146 * NES_WORLD_X_SCALE, 9);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 4096 / NES_FRAME_RATE)).toBeCloseTo(104 * NES_WORLD_Y_SCALE, 9);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 12000 / NES_FRAME_RATE)).toBeCloseTo(72 * NES_WORLD_Y_SCALE, 9);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 4000 / NES_FRAME_RATE)).not.toBe(57 * NES_WORLD_Y_SCALE);
    expect(CUTTER_FIRST_ATTACK_DELAY).toBeCloseTo(350 / NES_FRAME_RATE, 9);
    expect(CUTTER_ATTACK_INTERVAL).toBeCloseTo(256 / NES_FRAME_RATE, 9);
    expect(CUTTER_BOOMERANG_SPAWN_NES).toEqual([[-3, 3], [3, 2]]);
    expect(CUTTER_BOOMERANG_HEADINGS).toEqual([14, 18]);
    expect(CUTTER_BOOMERANG_OUTWARD_TARGETS_NES).toEqual([[224, 176], [32, 176]]);
    expect(CUTTER_BOOMERANG_REAIM_Y_NES).toBe(176);
    expect(CUTTER_BOOMERANG_FIRST_TURN_DELAY).toBeCloseTo(1 / NES_FRAME_RATE, 9);
    expect(CUTTER_BOOMERANG_TURN_INTERVAL).toBeCloseTo(2 / NES_FRAME_RATE, 9);
    expect(CUTTER_BOOMERANG_LIFETIME).toBeCloseTo(180 / NES_FRAME_RATE, 9);
    expect([CUTTER_BOOMERANG_SCREEN_MIN_X_NES, CUTTER_BOOMERANG_SCREEN_MAX_X_NES, CUTTER_BOOMERANG_SCREEN_MAX_Y_NES]).toEqual([24, 248, 252]);
    expect([cutterBoomerangOnScreen(23, 57), cutterBoomerangOnScreen(24, 57), cutterBoomerangOnScreen(247, 251), cutterBoomerangOnScreen(248, 251), cutterBoomerangOnScreen(100, 252)]).toEqual([false, true, true, false, false]);
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

  it("continues Cutter from the sampled route into random movement", () => {
    expect(CUTTER_RANDOM_ROUTE_START_FRAME).toBe(12_000);
    expect([CUTTER_RANDOM_HANDOFF_FINE_X, CUTTER_RANDOM_HANDOFF_FINE_Y, CUTTER_RANDOM_HANDOFF_SEGMENT_FRAMES, CUTTER_RANDOM_HANDOFF_GAIT]).toEqual([244, 188, 38, 0x87]);
    const movement = createCutterMovementState(112, 61);
    advanceCutterMovement(movement, CUTTER_RANDOM_ROUTE_START_FRAME + 36, () => 0x0e);
    expect({ frame: movement.frame, x: Math.floor(movement.x), y: Math.floor(movement.y), heading: movement.heading, segment: movement.segmentFrames }).toEqual({ frame: 12_036, x: 92, y: 61, heading: 0x58, segment: 71 });
    const boundary = createCutterMovementState(31.5, 61);
    advanceCutterMovement(boundary, CUTTER_RANDOM_ROUTE_START_FRAME + 1, () => 0);
    expect(boundary.heading).toBe(0x48);

    const attack = createCutterMovementState(41 + CUTTER_RANDOM_HANDOFF_FINE_X / 256, 72 + CUTTER_RANDOM_HANDOFF_FINE_Y / 256);
    attack.segmentFrames = CUTTER_RANDOM_HANDOFF_SEGMENT_FRAMES;
    attack.gait = CUTTER_RANDOM_HANDOFF_GAIT;
    attack.attackEnabled = true;
    advanceCutterMovement(attack, CUTTER_RANDOM_ROUTE_START_FRAME + 74, () => 0);
    expect({ frame: attack.frame, x: Math.floor(attack.x), y: Math.floor(attack.y), heading: attack.heading, segment: attack.segmentFrames, gait: attack.gait, phase: attack.attackPhase, resume: attack.attackResumeFrame }).toEqual({ frame: 12_074, x: 63, y: 41, heading: 0xc0, segment: 6, gait: 3, phase: "hold", resume: 12_100 });
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
    expect(DEVIL_HAWK_ATTACK_FRAMES).toEqual([174, 365, 459, 722, 815]);
    expect(devilHawkAttackDelay(174 / NES_FRAME_RATE)).toBeCloseTo(191 / NES_FRAME_RATE, 9);
    expect(devilHawkAttackDelay(815 / NES_FRAME_RATE)).toBeCloseTo(125 / NES_FRAME_RATE, 9);
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
    expect([DEVIL_HAWK_RANDOM_HANDOFF_FINE_X, DEVIL_HAWK_RANDOM_HANDOFF_FINE_Y, DEVIL_HAWK_RANDOM_HANDOFF_HEADING, DEVIL_HAWK_RANDOM_HANDOFF_SEGMENT_FRAMES, DEVIL_HAWK_RANDOM_HANDOFF_GAIT, DEVIL_HAWK_RANDOM_HANDOFF_ACTION_COUNTER]).toEqual([220, 206, 0x44, 71, 0x84, 14]);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION)).toBe(216);
    expect(devilHawkCombatY(DEVIL_HAWK_FIRST_VOLLEY_DELAY)).toBe(162);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 52 / NES_FRAME_RATE)).toBe(108);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION)).toBe(780);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 146 / NES_FRAME_RATE)).toBeCloseTo(588.75, 9);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 283 / NES_FRAME_RATE)).toBe(202.5);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 283 / NES_FRAME_RATE)).toBe(423.75);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 640 / NES_FRAME_RATE)).toBe(319.5);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 640 / NES_FRAME_RATE)).toBe(660);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 3425 / NES_FRAME_RATE)).toBe(85 * NES_WORLD_Y_SCALE);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 3425 / NES_FRAME_RATE)).toBe(122 * NES_WORLD_X_SCALE);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 3600 / NES_FRAME_RATE)).toBeCloseTo(109 * NES_WORLD_Y_SCALE, 9);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 3600 / NES_FRAME_RATE)).toBeCloseTo(119 * NES_WORLD_X_SCALE, 9);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 4096 / NES_FRAME_RATE)).toBeCloseTo(118 * NES_WORLD_X_SCALE, 9);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 4096 / NES_FRAME_RATE)).toBeCloseTo(89 * NES_WORLD_Y_SCALE, 9);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 12000 / NES_FRAME_RATE)).toBeCloseTo(142 * NES_WORLD_X_SCALE, 9);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 12000 / NES_FRAME_RATE)).toBeCloseTo(69 * NES_WORLD_Y_SCALE, 9);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 4000 / NES_FRAME_RATE)).not.toBe(65 * NES_WORLD_Y_SCALE);
    const movement = createDevilHawkMovementState(122 + 142 / 256, 65 + 180 / 256);
    let actionCalls = 0;
    advanceDevilHawkMovement(movement, 3601, () => 0, () => 0);
    expect([Math.floor(movement.x), Math.floor(movement.y), movement.segmentFrames, movement.gait]).toEqual([122, 63, 29, 2]);
    advanceDevilHawkMovement(movement, 3618, () => 0, () => { actionCalls += 1; return 4; });
    expect({ actionCalls, mode: movement.mode, actionFrames: movement.actionFrames }).toEqual({ actionCalls: 1, mode: "action", actionFrames: 26 });
    expect(advanceDevilHawkMovement(movement, 3631, () => 0, () => 0).fullFans).toEqual([false]);
    const held = [movement.x, movement.y];
    advanceDevilHawkMovement(movement, 3644, () => 0, () => 0);
    const jump = createDevilHawkMovementState(122, 65);
    advanceDevilHawkMovement(jump, 3618, () => 0, () => 9);
    expect(advanceDevilHawkMovement(jump, 3650, () => 0, () => 0).fullFans).toEqual([true]);
    expect([movement.mode, movement.x, movement.y]).toEqual(["move", held[0], held[1]]);
    const correction = createDevilHawkMovementState(122 + 142 / 256, 65 + 180 / 256);
    advanceDevilHawkMovement(correction, 3618, () => 0, () => 4);
    advanceDevilHawkMovement(correction, 3651, () => 0, () => 0);
    expect([correction.mode, Math.floor(correction.x), Math.floor(correction.y), correction.heading, correction.correctionHoldFrames, correction.actionFrames]).toEqual(["correction", 122, 47, 0x50, 26, 32]);
    advanceDevilHawkMovement(correction, 3677, () => 0, () => 0);
    expect([correction.correctionHoldFrames, correction.actionFrames]).toEqual([0, 32]);
    advanceDevilHawkMovement(correction, 3680, () => 0, () => 0);
    expect([Math.floor(correction.x), Math.floor(correction.y)]).toEqual([120, 50]);
    advanceDevilHawkMovement(correction, 3709, () => 0, () => 0);
    expect([Math.floor(correction.x), Math.floor(correction.y)]).toEqual([119, 107]);
    expect(correction.actionFrames).toBe(0);
    advanceDevilHawkMovement(correction, 3737, () => 0, () => 0);
    expect(correction.mode).toBe("move");

    const exact = createDevilHawkMovementState(119 + 220 / 256, 109 + 206 / 256);
    exact.heading = 0x44;
    exact.segmentFrames = 71;
    exact.gait = 0x84;
    exact.actionCounter = 14;
    exact.romExactActions = true;
    advanceDevilHawkMovement(exact, 3634, () => 0, () => 9);
    const exactFan = advanceDevilHawkMovement(exact, 3666, () => 0, () => 0).fullFans;
    expect({ x: Math.floor(exact.x), y: Math.floor(exact.y), mode: exact.mode, actionFrames: exact.actionFrames, fan: exactFan }).toEqual({ x: 133, y: 64, mode: "action", actionFrames: 0, fan: [true] });
    advanceDevilHawkMovement(exact, 3685, () => 0, () => 0);
    expect({ x: Math.floor(exact.x), y: Math.floor(exact.y), mode: exact.mode, cooldown: exact.actionCooldownFrames, counter: exact.actionCounter }).toEqual({ x: 133, y: 44, mode: "move", cooldown: 28, counter: 47 });
    advanceDevilHawkMovement(exact, 3713, () => 0, () => 9);
    expect({ x: Math.floor(exact.x), y: Math.floor(exact.y), mode: exact.mode, actionFrames: exact.actionFrames, direction: exact.actionBounceDirection }).toEqual({ x: 133, y: 44, mode: "action", actionFrames: 28, direction: -1 });
    expect(advanceDevilHawkMovement(exact, 3741, () => 0, () => 0).fullFans).toEqual([]);
    expect({ x: Math.floor(exact.x), y: Math.floor(exact.y) }).toEqual({ x: 133, y: 45 });
    advanceDevilHawkMovement(exact, 3742, () => 0, () => 0);
    expect({ x: Math.floor(exact.x), y: Math.floor(exact.y) }).toEqual({ x: 133, y: 46 });
    advanceDevilHawkMovement(exact, 3745, () => 0, () => 0);
    expect({ x: Math.floor(exact.x), y: Math.floor(exact.y) }).toEqual({ x: 129, y: 53 });
  });

  it("matches the traced Ninja Boss entrance", () => {
    expect([0, 1, 2, 3].map((value) => ninjaBossEntryLaneIndex(value, 216))).toEqual([0, 1, 2, 3]);
    expect([0, 1, 2, 3].map((value) => ninjaBossEntryLaneIndex(value, 120))).toEqual([0, 1, 0, 1]);
    expect([0, 1, 2, 3].map((value) => ninjaBossEntryLaneIndex(value, 80))).toEqual([2, 3, 2, 3]);
    expect(NINJA_BOSS_ENTRY_LANES_NES).toEqual([[112, 64], [192, 64], [120, 144], [176, 128]]);
    expect(NINJA_BOSS_ENTRY_LANES).toEqual([[420, 144], [720, 144], [450, 324], [660, 288]]);
    expect(NINJA_BOSS_FIRST_ATTACK_DELAY).toBeCloseTo(179 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_ENTRY_INVULNERABILITY).toBeCloseTo(44 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_ATTACK_INTERVAL).toBeCloseTo(60 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_SHURIKEN_COUNT).toBe(4);
    expect(NINJA_BOSS_SHURIKEN_SPAWN_OFFSET_NES).toEqual([6, -34]);
    expect(NINJA_BOSS_SHURIKEN_VELOCITIES_NES).toEqual([[1.25, -1.5], [1.25, 1.5], [-1.25, 1.5], [-1.25, -1.5]]);
    expect(NINJA_BOSS_SHURIKEN_LIFETIME).toBeCloseTo(40 / NES_FRAME_RATE, 9);
    expect(ninjaBossCombatY(NINJA_BOSS_ENTRY_INVULNERABILITY)).toBe(125 * NES_WORLD_Y_SCALE);
    expect(ninjaBossCombatY(NINJA_BOSS_ENTRY_INVULNERABILITY + 1 / NES_FRAME_RATE)).toBeCloseTo(123 * NES_WORLD_Y_SCALE, 9);
    expect(ninjaBossCombatY(NINJA_BOSS_ENTRY_INVULNERABILITY + 26 / NES_FRAME_RATE)).toBe(344.25);
    expect(ninjaBossCombatY(NINJA_BOSS_ENTRY_INVULNERABILITY + 51 / NES_FRAME_RATE)).toBeCloseTo(123 * NES_WORLD_Y_SCALE, 9);
    expect(ninjaBossCombatY(80 / NES_FRAME_RATE, 64 * NES_WORLD_Y_SCALE, true)).toBe(60 * NES_WORLD_Y_SCALE);
    expect(ninjaBossCombatY(216 / NES_FRAME_RATE, 64 * NES_WORLD_Y_SCALE, true)).toBe(90 * NES_WORLD_Y_SCALE);
    expect(ninjaBossCombatX(245 / NES_FRAME_RATE, 112 * NES_WORLD_X_SCALE, true)).toBe(124 * NES_WORLD_X_SCALE);
    expect(ninjaBossCombatY(245 / NES_FRAME_RATE, 64 * NES_WORLD_Y_SCALE, true)).toBe(111 * NES_WORLD_Y_SCALE);
    expect(ninjaBossCombatX(302 / NES_FRAME_RATE, 112 * NES_WORLD_X_SCALE, true)).toBe(165 * NES_WORLD_X_SCALE);
    expect(ninjaBossCombatY(390 / NES_FRAME_RATE, 64 * NES_WORLD_Y_SCALE, true)).toBe(104 * NES_WORLD_Y_SCALE);
    expect(ninjaBossCombatY(304 / NES_FRAME_RATE, 64 * NES_WORLD_Y_SCALE, true)).toBe(189);
    expect(ninjaBossCombatY(416 / NES_FRAME_RATE, 64 * NES_WORLD_Y_SCALE, true)).toBe(81);
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
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 50 / NES_FRAME_RATE)).toBe(317.25);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 450 / NES_FRAME_RATE)).toBe(189.5625);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 288 / NES_FRAME_RATE)).toBe(217.5);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 512 / NES_FRAME_RATE)).toBe(476.25);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 352 / NES_FRAME_RATE, 64 * NES_WORLD_X_SCALE)).toBe(155);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 3418 / NES_FRAME_RATE)).toBe(68 * NES_WORLD_X_SCALE);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 3418 / NES_FRAME_RATE)).toBe(46 * NES_WORLD_Y_SCALE);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 3600 / NES_FRAME_RATE)).toBe(61 * NES_WORLD_X_SCALE);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 3600 / NES_FRAME_RATE)).toBe(46 * NES_WORLD_Y_SCALE);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 4096 / NES_FRAME_RATE)).toBeCloseTo(166 * NES_WORLD_X_SCALE, 9);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 12000 / NES_FRAME_RATE)).toBe(43 * NES_WORLD_Y_SCALE);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 13000 / NES_FRAME_RATE)).toBe(191 * NES_WORLD_X_SCALE);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 13000 / NES_FRAME_RATE)).toBe(43 * NES_WORLD_Y_SCALE);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 4000 / NES_FRAME_RATE)).not.toBe(46 * NES_WORLD_Y_SCALE);
    expect(fatmanJoeArenaXBounds()).toEqual([155, 805]);
    expect(FATMAN_JOE_FIRST_ATTACK_DELAY).toBeCloseTo(170 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_ATTACK_DECISION_INTERVAL).toBeCloseTo(76 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_SHORT_ACTION_DURATION).toBeCloseTo(53 / NES_FRAME_RATE, 9);
    expect(FATMAN_JOE_LONG_ACTION_DURATION).toBeCloseTo(122 / NES_FRAME_RATE, 9);
    expect(fatmanJoeMovementActionDuration(72 * (540 / 240), 4)).toBe(FATMAN_JOE_SHORT_ACTION_DURATION);
    expect(fatmanJoeMovementActionDuration(71 * (540 / 240), 4)).toBe(FATMAN_JOE_LONG_ACTION_DURATION);
    expect(fatmanJoeMovementActionDuration(72 * (540 / 240), 1)).toBe(FATMAN_JOE_LONG_ACTION_DURATION);
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
    expect(fatmanJoeAimAllowsLaunch(joe.x, joe.y, billy.x, billy.y)).toBe(true);
    expect([fatmanJoeCanLaunch(joe.x, joe.y, billy.x, billy.y, 7), fatmanJoeCanLaunch(joe.x, joe.y, billy.x, billy.y, 8)]).toEqual([false, true]);
    expect(fatmanJoeCanLaunch(joe.x, joe.y, joe.x + 100, joe.y, 15)).toBe(false);
    const [shellVx, shellVy] = fatmanJoeShellVelocity(joe.x, joe.y, billy.x, billy.y);
    expect(shellVx).toBeCloseTo(-0.9375 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
    expect(shellVy).toBeCloseTo(2.77734375 * NES_FRAME_RATE * (540 / 240), 9);
  });

  it("matches the traced first Wingate entrance", () => {
    const movement = createWingateMovementState(152);
    const boundary = createWingateMovementState(152);
    boundary.mode = "move";
    boundary.x = 31.99;
    boundary.y = 97.99;
    boundary.heading = 0xc0;
    boundary.gait = 0x88;
    boundary.segmentFrames = 1;
    advanceWingateMovement(boundary, 1, () => 0);
    expect(boundary.mode).toBe("correction");
    const inside = createWingateMovementState(152);
    inside.mode = "move";
    inside.x = 32.01;
    inside.y = 40.01;
    inside.heading = 0xc0;
    inside.gait = 0x88;
    inside.segmentFrames = 1;
    advanceWingateMovement(inside, 1, () => 0);
    expect(inside.mode).toBe("move");
    expect(advanceWingateMovement(movement, 5, () => 0).fireChecks).toBe(1);
    advanceWingateMovement(movement, 152, () => 0);
    expect({ mode: movement.mode, x: Math.floor(movement.x), y: Math.floor(movement.y), heading: movement.heading, segment: movement.segmentFrames, gait: movement.gait }).toEqual({ mode: "correction", x: 152, y: 92, heading: 0x40, segment: 104, gait: 4 });
    expect(advanceWingateMovement(movement, 186, () => 0).fireChecks).toBe(0);
    expect(movement.mode).toBe("move");
    expect([Math.floor(movement.x), Math.floor(movement.y)]).toEqual([125, 56]);
    advanceWingateMovement(movement, 289, () => 0);
    expect(movement.segmentFrames).toBe(0);
    expect([Math.floor(movement.x), Math.floor(movement.y)]).toEqual([70, 69]);
    advanceWingateMovement(movement, 290, () => 36);
    expect({ heading: movement.heading, segment: movement.segmentFrames }).toEqual({ heading: 0x48, segment: 23 });
    advanceWingateMovement(movement, 313, () => 0);
    expect({ x: Math.floor(movement.x), y: Math.floor(movement.y), segment: movement.segmentFrames }).toEqual({ x: 83, y: 69, segment: 0 });
    advanceWingateMovement(movement, 314, () => 97);
    expect({ heading: movement.heading, segment: movement.segmentFrames }).toEqual({ heading: 0x48, segment: 47 });
    advanceWingateMovement(movement, 362, () => 248);
    expect({ heading: movement.heading, segment: movement.segmentFrames }).toEqual({ heading: 0x54, segment: 23 });
    advanceWingateMovement(movement, 386, () => 181);
    expect({ heading: movement.heading, segment: movement.segmentFrames }).toEqual({ heading: 0x4c, segment: 47 });
    advanceWingateMovement(movement, 426, () => 0);
    expect({ mode: movement.mode, heading: movement.heading, segment: movement.segmentFrames, gait: movement.gait }).toEqual({ mode: "correction", heading: 0x5c, segment: 8, gait: 4 });
    expect([Math.floor(movement.x), Math.floor(movement.y)]).toEqual([114, 93]);
    advanceWingateMovement(movement, 460, () => 0);
    expect(movement.mode).toBe("move");
    expect([Math.floor(movement.x), Math.floor(movement.y)]).toEqual([124, 54]);
    const realMovement = createWingateMovementState(192, 1);
    advanceWingateMovement(realMovement, 186, () => 0);
    expect([Math.floor(realMovement.x), Math.floor(realMovement.y)]).toEqual([164, 50]);
    expect(WINGATE_ENTRY_X_NES).toEqual([64, 104, 152, 192]);
    expect(WINGATE_ENTRY_X_LANES).toEqual([240, 390, 570, 720]);
    expect(WINGATE_ENTRY_Y_NES).toBe(0);
    expect(WINGATE_ENTRY_Y).toBe(0);
    expect(WINGATE_SECOND_ENTRY_Y_NES).toBe(0);
    expect(WINGATE_SECOND_ENTRY_Y).toBe(0);
    expect(WINGATE_SECOND_SPAWN_DELAY).toBeCloseTo(264 / NES_FRAME_RATE, 9);
    expect(WINGATE_BULLET_LIFETIME).toBeCloseTo(64 / NES_FRAME_RATE, 9);
    expect(WINGATE_BULLET_VELOCITIES_NES).toEqual([[1.15625, 1.40625], [0.9140625, 1.65625], [0.625, 1.8515625], [0.3125, 1.9453125], [0, 2], [-0.3125, 1.9453125], [-0.625, 1.8515625], [-0.9140625, 1.65625], [-1.15625, 1.40625]]);
    expect(WINGATE_PROJECTILE_X_OFFSET_NES).toBe(-8);
    expect(WINGATE_PROJECTILE_Y_OFFSET_NES).toBe(6);
    const actor = { x: 114 * NES_WORLD_X_SCALE, y: 50 * (540 / 240) };
    const target = { x: 39 * NES_WORLD_X_SCALE, y: 118 * (540 / 240) };
    expect(wingateAimHeading(actor.x, actor.y, target.x, target.y)).toBe(20);
    expect([wingateCanFire(actor.x, actor.y, target.x, target.y, 0), wingateCanFire(actor.x, actor.y, target.x, target.y, 1)]).toEqual([false, true]);
    expect(wingateCanFire(actor.x, actor.y, actor.x + 100, actor.y, 3)).toBe(false);
    const [wingateVx, wingateVy] = wingateProjectileVelocity(actor.x, actor.y, target.x, target.y);
    expect(wingateVx).toBeCloseTo(-1.15625 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 9);
    expect(wingateVy).toBeCloseTo(1.40625 * NES_FRAME_RATE * (540 / 240), 9);
  });

  it("awards the Round 6 bounty only after the real Wingate", () => {
    expect(BOSS_DEFEAT_ANIMATION_DURATION).toBeCloseTo(30 / NES_FRAME_RATE, 9);
    expect(bossReward(1)).toBe(10_000);
    expect(bossReward(MAX_STAGE, 0)).toBe(0);
    expect(bossReward(MAX_STAGE, 1)).toBe(30_000);
    expect([scoreBossDefeat(1_000, 1), scoreBossDefeat(1_000, MAX_STAGE, 0), scoreBossDefeat(1_000, MAX_STAGE, 1)]).toEqual([11_000, 1_000, 31_000]);
    expect([shouldClearProjectilesAfterBossDefeat(1), shouldClearProjectilesAfterBossDefeat(MAX_STAGE, 0), shouldClearProjectilesAfterBossDefeat(MAX_STAGE, 1)]).toEqual([true, false, true]);
  });

  it("spawns Boss reinforcements above the arena", () => {
    expect(formationEntryY(1_820)).toBe(1_875);
    expect(formationEntryY(1_820, true)).toBe(1_780);
  });
});
