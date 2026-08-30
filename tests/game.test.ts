import { describe, expect, it } from "vitest";
import { advanceRomRandom, mixRomRandomDifference, mixRomRandomFirstSum, mixRomRandomSecondSum, mixRomRandomSecondThirdSum, mixRomRandomSpawn, mixRomRandomSum, mixRomRandomThirdFirstSum, ROM_RANDOM_SEED } from "../src/game-constants";
import { AMMO_GAIN, advanceSniperFiring, backstabberAmbushY, BACKSTABBER_AMBUSH_DEPTH, BACKSTABBER_AMBUSH_DEPTH_NES, BACKSTABBER_AMBUSH_LIFETIME, bomberCanThrow, bomberMovementDecision, bomberMovementDuration, BOMBER_MOVEMENT_DURATIONS, bomberMovementUsesRandom, bomberMovementVelocity, BOMBER_THROW_CHANCE, BOMBER_THROW_DURATION, bossReward, BOSS_DEFEAT_ANIMATION_DURATION, BOSS_REWARDS, BOOTS_SPEED_MULTIPLIER, clamp, createSniperFiringState, distance, DYNAMITE_AIRBORNE_DURATION, DYNAMITE_LANDED_DURATION, DYNAMITE_LIFETIME, DYNAMITE_WORLD_SPEED, EMPTY_BARREL_EXPLOSION_LIFETIME, fallingRockOnScreen, fallingRockPosition, FIREBREATHER_FIRST_DECISION_DELAY, formationEntryY, HORSE_HIT_INVULNERABILITY, MACHINE_GUN_BULLET_LIFETIME, MAGNUM_BULLET_LIFETIME, MAGNUM_BULLET_SPEED, MAX_STAGE, NES_BULLET_SPEED, NES_DIAGONAL_BULLET_X, NES_DIAGONAL_BULLET_Y, NES_FRAME_RATE, NES_PLAYER_SPEED, NES_SCROLL_SPEED, NINJA_FIRST_SHOT_DELAY, NINJA_PROJECTILE_SPEED, obstacleBlocks, PISTOL_BULLET_LIFETIME, PLAYER_DEATH_ANIMATION_DURATION, PLAYER_DEATH_RECOVERY_DURATION, PLAYER_RESPAWN_HIDDEN_DURATION, PLAYER_RESPAWN_READY_DURATION, playerDeathPhase, RIFLEMAN_ATTACK_STATE_FRAME, RIFLEMAN_FIRST_SHOT_DELAY, RIFLEMAN_SHOT_INTERVAL, RIFLEMAN_SHOTS_PER_VOLLEY, ROCK_FLIGHT_PATH_NES, ROCK_FLIGHT_PATH_PHASE0_NES, ROCK_IMPACT_DELAY, ROCK_IMPACT_LIFETIME, ROCK_LIFETIME, ROM_OBJECT_DROP_SPEED, romObjectScreenY, ROM_SCREEN_RELEASE_Y_NES, romActorScreenYReleased, ROAD_WIDTHS, ROUND_BOSS_GATE_SCROLL_NES, ROUND_BOSS_TRIGGERS, ROUND_LENGTHS, ROUND_LOOP_SCROLL_NES, ROUND_OBSTACLES, ROUND_SEGMENTS, scoreBossDefeat, SHOTGUN_BULLET_LIFETIME, SHOTGUNNER_FAN_NES, SHOTGUNNER_FIRST_VOLLEY_DELAY, SHOTGUNNER_LIFETIME, SHOTGUNNER_VOLLEY_INTERVAL, SHOP_COSTS, SHOP_TYPES, shouldClearProjectilesAfterBossDefeat, SMART_BOMB_CAPACITY, SNIPER_CODE2_SHOT_FRAMES, SNIPER_COOLDOWN, SNIPER_LIFETIME, SNIPER_SHOT_FRAMES, sniperProjectileVelocity, spendPoints, STAGES, unitMaxAge, WEAPONS, WANTED_COSTS, WORLD_BULLET_SPEED, WORLD_DIAGONAL_BULLET_X, WORLD_DIAGONAL_BULLET_Y, WORLD_PLAYER_SPEED, WORLD_SCROLL_SPEED, shouldLoopStage } from "../src/game-constants";
import { advanceBackstabberRaid, createBackstabberRaidState } from "../src/game-constants";
import { romPickupScreenY } from "../src/game-constants";
import { advanceGunmanFlankMovement, createGunmanFlankMovementState, GUNMAN_BOTTOM_BRANCH_FRAME, GUNMAN_BOTTOM_LIFETIMES, GUNMAN_BOTTOM_NEAR_DISTANCE_NES, gunmanBottomPosition, gunmanBottomRoute, GUNMAN_BOTTOM_SHOT_FRAMES, gunmanCanFire, GUNMAN_ENTRY_PATH_NES, GUNMAN_FLANK_INITIAL_STATE_FRAMES, gunmanFlankEventShotFrames, gunmanFlankFirstOpportunityFrame, gunmanFlankLifetime, gunmanFlankMovementFacingHeading, GUNMAN_FLANK_LIFETIMES, GUNMAN_FLANK_SHOT_FRAMES, gunmanFlankUsesDynamicState, GUNMAN_LIFETIME, GUNMAN_TOP_LIFETIMES_FRAMES, gunmanFirstOpportunityFrame, gunmanFlankPosition, gunmanOpeningY, gunmanTopBranch, gunmanTopHeading, gunmanTopPosition, gunmanProjectileVelocity, GUNMAN_SHOT_OPPORTUNITY_INTERVAL } from "../src/game-constants";
import { createGunmanBottomMovementState, GUNMAN_BOTTOM_DYNAMIC_HANDOFF_FRAME, gunmanBottomDynamicPosition, gunmanBottomFirstOpportunityFrame, gunmanBottomUsesDynamicState } from "../src/game-constants";
import { createGunmanTopMovementState, gunmanTopUsesDynamicState } from "../src/game-constants";
import { RIFLEMAN_ATTACK_TO_FIRST_SHOT_FRAMES, RIFLEMAN_LIFETIME, RIFLEMAN_PATH_NES, riflemanAttackHeadingAtStart, riflemanCanAttack, riflemanFirstShotFrame, riflemanPosition, riflemanShotHeading, RIFLEMAN_SIDE_ATTACK_STATE_FRAME, RIFLEMAN_SIDE_LIFETIME, RIFLEMAN_SIDE_PATH_NES, RIFLEMAN_SIDE_SHOT_FRAMES, riflemanSidePosition, mediumProjectileHeadingVelocity, mediumProjectileVelocity } from "../src/game-constants";
import { bossSpriteVisible, ninjaBossEntryLaneIndex, NINJA_BOSS_TELEPORT_DELAY } from "../src/game-constants";
import { hasWeaponStock } from "../src/game-constants";
import { ENEMY_DEFEAT_ANIMATION_DURATION } from "../src/game-constants";
import { WINGATE_ENDING_INPUT_DELAY, WINGATE_ENTRY_INVULNERABILITY, WINGATE_FINAL_DEFEAT_ANIMATION_DURATION, WINGATE_FINAL_ENDING_DELAY } from "../src/game-constants";
import { ENEMY_DEFEAT_Y_OFFSETS_NES } from "../src/game-constants";
import { addScore, MAX_SCORE } from "../src/game-constants";
import { PLAYER_ENTRY_X, PLAYER_ENTRY_X_NES, PLAYER_ENTRY_Y, PLAYER_ENTRY_Y_NES, PLAYER_MAX_X_NES, PLAYER_MAX_Y_NES, PLAYER_MIN_X_NES, PLAYER_MIN_Y_NES } from "../src/game-constants";
import { HORSE_SPEED_MULTIPLIER, playerCollisionFallbackY, playerMovementVelocity } from "../src/game-constants";
import { NINJA_ACTIVATION_DISTANCE_NES, NINJA_LIFETIME, ninjaCanThrow } from "../src/game-constants";
import { advanceNinja, createNinjaState, NINJA_ATTACK_MOVE_DURATION, NINJA_ENTRY_PATH_NES, ninjaAttackPosition, ninjaOpeningY, ninjaTraceLifetime, ninjaTracePosition, ninjaTraceThrowFrame, ninjaTraceThrowFrames } from "../src/game-constants";
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
import { bossDefeatAnimationDuration } from "../src/game-constants";
import { RIFLE_BULLET_SPEED_MULTIPLIER } from "../src/game-constants";
import { BOSS_PROJECTILE_CAPACITY, canSpawnBossProjectile, canSpawnEnemyProjectile, canSpawnPlayerBullet, ENEMY_PROJECTILE_CAPACITY, machineGunVelocities, pistolBulletSpeedFactor, pistolShots, pistolVelocities, PLAYER_BULLET_CAPACITY, shotgunVelocities, weaponBulletLifetime, weaponCanRepeat } from "../src/game-constants";
import { LIFE_OVERFLOW_SCORE, lifePickup, MAX_POWERUP_STOCK, POWERUP_OVERFLOW_SCORE, storedPowerupPickup } from "../src/game-constants";
import { FATMAN_JOE_ATTACK_DECISION_INTERVAL, fatmanJoeAimAllowsLaunch, fatmanJoeAimHeading, fatmanJoeArenaXBounds, fatmanJoeCanLaunch, FATMAN_JOE_FIRST_ATTACK_DELAY, fatmanJoeShellHasSplit, FATMAN_JOE_GRENADE_LIFETIME, FATMAN_JOE_LONG_ACTION_DURATION, FATMAN_JOE_MINE_INTERVAL, fatmanJoeMineCount, FATMAN_JOE_MINE_OFFSETS_NES, FATMAN_JOE_MOVEMENT_SPEED, FATMAN_JOE_SHORT_ACTION_DURATION, FATMAN_JOE_SHELL_FLIGHT_DURATION, FATMAN_JOE_SHELL_LIFETIME, FATMAN_JOE_SHELL_SPLIT_DELAY, fatmanJoeMovementActionDuration, fatmanJoeShellVelocity } from "../src/game-constants";
import { advanceWingateMovement, createWingateMovementState, wingateAimHeading, WINGATE_BULLET_LIFETIME, WINGATE_BULLET_VELOCITIES_NES, wingateCanFire, WINGATE_PROJECTILE_X_OFFSET_NES, WINGATE_PROJECTILE_Y_OFFSET_NES, wingateProjectileVelocity } from "../src/game-constants";
import { CUTTER_ATTACK_INTERVAL, CUTTER_BOOMERANG_FIRST_TURN_DELAY, CUTTER_BOOMERANG_HEADINGS, cutterBoomerangHeadingToward, CUTTER_BOOMERANG_OUTWARD_TARGETS_NES, CUTTER_BOOMERANG_REAIM_Y_NES, CUTTER_BOOMERANG_SCREEN_MAX_X_NES, CUTTER_BOOMERANG_SCREEN_MAX_Y_NES, CUTTER_BOOMERANG_SCREEN_MIN_X_NES, CUTTER_BOOMERANG_SPAWN_NES, CUTTER_BOOMERANG_TURN_INTERVAL, cutterBoomerangOnScreen, cutterBoomerangTurn, cutterBoomerangVelocity, CUTTER_FIRST_ATTACK_DELAY } from "../src/game-constants";
import { CUTTER_MOVEMENT_SPEED } from "../src/game-constants";
import { advanceDevilHawkMovement, createDevilHawkMovementState, devilHawkAttackDelay, devilHawkFanHeadings, DEVIL_HAWK_ATTACK_FRAMES, DEVIL_HAWK_FIRST_VOLLEY_DELAY, DEVIL_HAWK_FULL_FAN_HEADINGS, DEVIL_HAWK_FULL_FAN_LIFETIME, DEVIL_HAWK_FULL_FAN_MAX_Y_NES, devilHawkFullFanAt, DEVIL_HAWK_JUMP_PERIOD, devilHawkProjectileVelocity, DEVIL_HAWK_SIDE_FAN_LIFETIME, DEVIL_HAWK_VOLLEY_INTERVAL } from "../src/game-constants";
import { devilHawkCombatY } from "../src/game-constants";
import { NINJA_BOSS_ENTRY_INVULNERABILITY, NINJA_BOSS_FIRST_NATURAL_TELEPORT, NINJA_BOSS_REPEAT_NATURAL_TELEPORT, NINJA_BOSS_FIRST_ATTACK_DELAY, NINJA_BOSS_FIRST_PREPARE_DELAY, NINJA_BOSS_INITIAL_PREPARE_FRAMES, NINJA_BOSS_PREPARE_CONTROLLER_DURATION, NINJA_BOSS_PREPARE_DURATION, NINJA_BOSS_REENTRY_PREPARE_DELAY, NINJA_BOSS_REENTRY_PREPARE_FRAMES, NINJA_BOSS_SHURIKEN_COUNT, NINJA_BOSS_SHURIKEN_LIFETIME, NINJA_BOSS_SHURIKEN_SPAWN_OFFSET_NES, NINJA_BOSS_SHURIKEN_VELOCITIES_NES, ninjaBossCombatX, ninjaBossCombatY, ninjaBossNextTeleportAt, ninjaBossPreparePosition } from "../src/game-constants";
import { SHOTGUNNER_PATH_NES, shotgunnerPosition } from "../src/game-constants";
import { SHOTGUNNER_SIDE_LIFETIME, SHOTGUNNER_SIDE_PATH_NES, SHOTGUNNER_SIDE_SHOT_FRAME, shotgunnerSidePosition } from "../src/game-constants";
import { hasSpecialAmmoStock, romEnemyDrop, romEnemyScore } from "../src/game-constants";
import { ROM_PROJECTILE_SCREEN_SIZE_NES, romProjectileOnScreen } from "../src/game-constants";
import { roundActorCollisionAtNes, roundCollisionAtNes, roundCollisionBlocks, roundCollisionScrollNes, roundPlayerRecoveryX, ROUND_COLLISION_ROW_COUNTS } from "../src/round-collision";
import { canSpawnRomPool, compareRomEventOrder, ROM_BREAKABLE_CONTAINER_DISPATCH_TYPES, ROM_EMPTY_BARREL_ENTITY_CODES, ROM_ENEMY_SLOT_CAPACITY, ROM_ENTITY_HIT_POINTS, ROM_FALLING_ROCK_BEHAVIORS, ROM_OBJECT_PICKUPS, ROM_OBJECT_SLOT_CAPACITY, ROM_SCENE_PROP_DISPATCH_TYPES, ROUND_ROM_BOSS_REINFORCEMENTS, ROUND_ROM_ENEMY_EVENTS, ROUND_ROM_ENEMY_EVENT_COUNTS, ROUND_ROM_OBJECT_EVENTS, ROUND_ROM_OBJECT_EVENT_COUNTS, ROM_BEHAVIOR_ENEMY_TYPES, romEntityHitPoints, romEventWorldAt, romEventWorldX, romEventWorldY, romObjectWorldAt, romObjectWorldX } from "../src/rom-event-data";

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
    expect(mixRomRandomSpawn([162, 170, 20, 191])).toEqual([56, 170, 20, 191]);
    let spawnState: [number, number, number, number] = [...ROM_RANDOM_SEED];
    const advanceFrames = (frames: number) => {
      for (let frame = 0; frame < frames; frame += 1) spawnState = advanceRomRandom(spawnState);
      spawnState = mixRomRandomSpawn(spawnState);
      return spawnState[0];
    };
    expect([advanceFrames(143), advanceFrames(144), advanceFrames(48)]).toEqual([56, 72, 22]);
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
    expect([PLAYER_MIN_X_NES, PLAYER_MAX_X_NES, PLAYER_MIN_Y_NES, PLAYER_MAX_Y_NES]).toEqual([16, 240, 48, 216]);
    expect(ROUND_LENGTHS[5]).toBe(11_517.75);
    expect([ROUND2_LOOP_HORSE_X, ROUND2_LOOP_HORSE_Y]).toEqual([310, 300]);
    expect(NES_SCROLL_SPEED).toBeCloseTo(20.032667, 6);
    expect(WORLD_SCROLL_SPEED).toBeCloseTo(45.0735, 6);
    expect(ROM_OBJECT_DROP_SPEED).toBeCloseTo(WORLD_SCROLL_SPEED * 2, 9);
    expect([1, 3, 4, 753, 754].map((frame) => romObjectScreenY(frame / NES_FRAME_RATE) / NES_WORLD_Y_SCALE)).toEqual([1, 1, 2, 251, 252]);
    expect([0, 1, 2, 3].map((frame) => romPickupScreenY(frame / NES_FRAME_RATE) / NES_WORLD_Y_SCALE)).toEqual([0, 0, 1, 1]);
    expect(ROM_SCREEN_RELEASE_Y_NES).toBe(252);
    expect([romActorScreenYReleased(251.49), romActorScreenYReleased(251.5), romActorScreenYReleased(252)]).toEqual([false, true, true]);
    expect(NES_PLAYER_SPEED).toBeCloseTo(1.2421875 * NES_FRAME_RATE, 9);
    expect(WORLD_PLAYER_SPEED).toBeCloseTo(1.2421875 * NES_FRAME_RATE * NES_WORLD_Y_SCALE, 9);
    expect(BOOTS_SPEED_MULTIPLIER).toBeCloseTo(4 / 3, 9);
    expect(HORSE_SPEED_MULTIPLIER).toBeCloseTo(5 / 3, 9);
    expect(playerMovementVelocity(1, 0, false, 0, false, false)).toEqual([0.828125 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 0]);
    expect(playerMovementVelocity(1, 1, false, 0, false, true)).toEqual([1.15625 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 1.40625 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
    expect(playerMovementVelocity(-1, 0, false, 1, false, false)).toEqual([-1.65625 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 0]);
    expect(playerMovementVelocity(0, -1, true, 0, false, true)).toEqual([0, -3 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
    expect(playerMovementVelocity(0, 0, false, 0, false, false)).toEqual([0, 0]);
    expect(playerCollisionFallbackY(57.875, 56.46875, 1)).toBe(58.46875);
    expect(playerCollisionFallbackY(215.875, 216, 1)).toBe(216);
    const replayLeft = (hasHorse: boolean, boots: number, blue: boolean) => {
      let x = 136;
      return Array.from({ length: 10 }, (_, index) => {
        x += playerMovementVelocity(-1, 0, hasHorse, boots, blue, (index & 1) === 0)[0] / NES_FRAME_RATE / NES_WORLD_X_SCALE;
        return Math.floor(x);
      });
    };
    expect(replayLeft(false, 0, false)).toEqual([134, 133, 131, 131, 129, 128, 126, 126, 124, 123]);
    expect(replayLeft(false, 1, false)).toEqual([134, 132, 131, 129, 127, 126, 124, 122, 121, 119]);
    expect(replayLeft(true, 0, false)).toEqual([133, 131, 129, 127, 125, 123, 121, 119, 116, 115]);
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
    expect([canSpawnPlayerBullet(5), canSpawnPlayerBullet(6), canSpawnPlayerBullet(4, 2), canSpawnPlayerBullet(5, 2), canSpawnPlayerBullet(1, 5), canSpawnPlayerBullet(2, 5)]).toEqual([true, false, true, false, true, false]);
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
    expect(shopEvents.flat().every((event) => romObjectWorldAt(event) === (event.at + 2 / 3) * NES_WORLD_Y_SCALE && romObjectWorldX(event) === event.x * NES_WORLD_X_SCALE)).toBe(true);
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
    expect(ROUND_SEGMENTS).toHaveLength(MAX_STAGE);
    expect(ROUND_SEGMENTS.every((segments) => segments[0]?.at === 146)).toBe(true);
    expect(ROUND_SEGMENTS[0]?.map((segment) => segment.at)).toEqual([146, 416, 551, 731]);
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
    expect(roundCollisionAtNes(4, 0, 4, 48)).toBe(true);
    expect(roundCollisionAtNes(4, 0, 48, 48)).toBe(true);
    expect(roundCollisionAtNes(1, 0, 0, 0)).toBe(false);
    expect(roundCollisionScrollNes((3919 + 2 / 3 + 759 / 3) * NES_WORLD_Y_SCALE)).toBe(4173);
    const round5ActorMaskScroll = (1903 + 2 / 3 + 1026 / 3) * NES_WORLD_Y_SCALE;
    expect(roundCollisionAtNes(5, round5ActorMaskScroll, 159, 84)).toBe(false);
    expect(roundActorCollisionAtNes(5, round5ActorMaskScroll, 159, 84)).toBe(true);
    const leftWallScroll = 79 / 3 * NES_WORLD_Y_SCALE;
    const rightWallScroll = 64 / 3 * NES_WORLD_Y_SCALE;
    expect(roundCollisionBlocks(1, leftWallScroll, 37 * NES_WORLD_X_SCALE, leftWallScroll + 188 * NES_WORLD_Y_SCALE)).toBe(true);
    expect(roundCollisionBlocks(1, leftWallScroll, 39 * NES_WORLD_X_SCALE, leftWallScroll + 188 * NES_WORLD_Y_SCALE)).toBe(false);
    expect(roundCollisionBlocks(1, rightWallScroll, 217 * NES_WORLD_X_SCALE, rightWallScroll + 188 * NES_WORLD_Y_SCALE)).toBe(false);
    expect(roundCollisionBlocks(1, rightWallScroll, 218 * NES_WORLD_X_SCALE, rightWallScroll + 188 * NES_WORLD_Y_SCALE)).toBe(true);
    expect([roundCollisionScrollNes(0), roundCollisionScrollNes(2 / 3 * NES_WORLD_Y_SCALE), roundCollisionScrollNes(5 / 3 * NES_WORLD_Y_SCALE)]).toEqual([0, 1, 2]);
    const recoveryScroll = 122 / 3 * NES_WORLD_Y_SCALE;
    expect(roundPlayerRecoveryX(1, recoveryScroll, 240, 215)).toBe(216);
  });

  it("keeps the ROM enemy event streams ordered and bounded", () => {
    expect(ROUND_ROM_ENEMY_EVENT_COUNTS).toEqual([128, 137, 275, 299, 185, 313]);
    expect(ROUND_ROM_OBJECT_EVENT_COUNTS).toEqual([42, 20, 32, 22, 24, 23]);
    expect(romEventWorldAt(ROUND_ROM_ENEMY_EVENTS[0]![0]!)).toBeCloseTo((47 + 2 / 3) * NES_WORLD_Y_SCALE, 9);
    expect(romObjectWorldAt(ROUND_ROM_OBJECT_EVENTS[0]![0]!)).toBeCloseTo((63 + 2 / 3) * NES_WORLD_Y_SCALE, 9);
    expect(ROM_BEHAVIOR_ENEMY_TYPES).toHaveLength(12);
    expect(ROM_BEHAVIOR_ENEMY_TYPES[1]).toBe("shotgunner");
    expect(ROM_BEHAVIOR_ENEMY_TYPES[3]).toBe("backstabber");
    expect(ROM_BEHAVIOR_ENEMY_TYPES[5]).toBeUndefined();
    expect(ROM_BEHAVIOR_ENEMY_TYPES[7]).toBe("rifleman");
    expect(ROUND_ROM_BOSS_REINFORCEMENTS.map((round) => round.length)).toEqual([16, 16, 16, 16, 16, 16]);
    expect(ROUND_ROM_BOSS_REINFORCEMENTS[2]![0]).toEqual([96, 0, 10, 19]);
    expect(ROUND_ROM_BOSS_REINFORCEMENTS[2]![15]).toEqual([4, 64, 2, 8]);
    expect(ROUND_ROM_BOSS_REINFORCEMENTS[3]!.slice(-2)).toEqual([[4, 80, 5, 12], [4, 32, 5, 12]]);
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
    expect(ROUND_ROM_OBJECT_EVENTS.flat().filter((event) => event.semantic === "sceneObject").every((event) => event.pool === "object")).toBe(true);
    expect(ROUND_ROM_OBJECT_EVENTS.flat().filter((event) => event.semantic !== "sceneObject").every((event) => event.pool === "enemy")).toBe(true);
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
    expect(SHOTGUNNER_PATH_NES).toEqual([[0, 0, 0], [64, 0, 64], [80, -5, 77], [98, -18, 82], [118, -18, 82], [119, -19, 82], [146, -33, 64], [150, -33, 60], [167, -33, 60], [227, -33, 0]]);
    expect(shotgunnerPosition(65 / NES_FRAME_RATE)).toEqual([0, 64]);
    expect(shotgunnerPosition(80 / NES_FRAME_RATE)).toEqual([-5.4375, 77.015625]);
    expect(shotgunnerPosition(80 / NES_FRAME_RATE, true)).toEqual([5.4375, 77.015625]);
    expect(shotgunnerPosition(108 / NES_FRAME_RATE)).toEqual([-18.34375, 82.28125]);
    expect(shotgunnerPosition(224 / NES_FRAME_RATE)).toEqual([-33.375, 3]);
    expect(SHOTGUNNER_SIDE_SHOT_FRAME).toBe(113);
    expect(SHOTGUNNER_SIDE_LIFETIME).toBeCloseTo(230 / NES_FRAME_RATE, 9);
    expect(SHOTGUNNER_SIDE_PATH_NES).toEqual([[0, 0, 0], [69, 57, 0], [70, 57, 0], [98, 72, -18], [102, 72, -22], [122, 72, -22], [123, 72, -22], [151, 57, -41], [155, 54, -41], [229, -7, -41]]);
    expect(shotgunnerSidePosition(114 / NES_FRAME_RATE, false)).toEqual([-72.171875, -22.28125]);
    expect(shotgunnerSidePosition(114 / NES_FRAME_RATE, true)).toEqual([72.171875, -22.28125]);
  });

  it("matches the traced Sniper firing windows", () => {
    expect(SNIPER_SHOT_FRAMES).toEqual([134, 224, 405, 495, 585]);
    expect(SNIPER_CODE2_SHOT_FRAMES).toEqual([134, 224, 314, 404, 495, 585]);
    expect(SNIPER_COOLDOWN).toBeCloseTo(90 / NES_FRAME_RATE, 9);
    expect(SNIPER_LIFETIME).toBeCloseTo(732 / 60.098, 9);
    expect(sniperProjectileVelocity(179 * NES_WORLD_X_SCALE, 113 * NES_WORLD_Y_SCALE, 136 * NES_WORLD_X_SCALE, 188 * NES_WORLD_Y_SCALE)).toEqual([-0.3125 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 0.92578125 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
    const firing = createSniperFiringState(1, 172);
    firing.lane = 2;
    expect(advanceSniperFiring(firing, 2, 8, 8)).toBe(false);
    expect(firing.cooldown).toBe(171);
    firing.cooldown = 1;
    expect(advanceSniperFiring(firing, 3, 8, 12)).toBe(true);
    expect(firing.cooldown).toBe(90);
    firing.cooldown = 44;
    expect(advanceSniperFiring(firing, 62, 100, 7)).toBe(false);
    expect(firing.lane).toBe(1);
    expect(firing.cooldown).toBe(44);
  });

  it("matches the traced Rifleman volley timing", () => {
    expect(RIFLEMAN_ATTACK_STATE_FRAME).toBe(122);
    expect(RIFLEMAN_FIRST_SHOT_DELAY).toBeCloseTo(138 / NES_FRAME_RATE, 9);
    expect(RIFLEMAN_SHOT_INTERVAL).toBeCloseTo(16 / NES_FRAME_RATE, 9);
    expect(RIFLEMAN_SHOTS_PER_VOLLEY).toBe(5);
    expect(RIFLEMAN_LIFETIME).toBeCloseTo(308 / NES_FRAME_RATE, 9);
    expect(RIFLEMAN_PATH_NES).toEqual([[0, 0], [93, 93], [94, 93], [95, 93], [183, 123], [184, 123], [307, 0]]);
    expect(riflemanPosition(93 / NES_FRAME_RATE)).toEqual([0, 93]);
    expect(riflemanPosition(94 / NES_FRAME_RATE)).toEqual([0, 93]);
    expect(riflemanPosition(96 / NES_FRAME_RATE)).toEqual([0, 94]);
    expect(riflemanPosition(183 / NES_FRAME_RATE)).toEqual([0, 123]);
    expect(riflemanPosition(211 / NES_FRAME_RATE)).toEqual([0, 96]);
    expect(riflemanPosition(307 / NES_FRAME_RATE)).toEqual([0, 0]);
    expect([20, 16, 12].map((aim) => Array.from({ length: 5 }, (_, shot) => riflemanShotHeading(aim, shot)))).toEqual([[20, 22, 20, 18, 20], [16, 18, 16, 14, 16], [12, 14, 12, 10, 12]]);
    expect(mediumProjectileHeadingVelocity(16)).toEqual([0, 2 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
    expect([riflemanCanAttack(48 * NES_WORLD_Y_SCALE, 143 * NES_WORLD_Y_SCALE), riflemanCanAttack(48 * NES_WORLD_Y_SCALE, 144 * NES_WORLD_Y_SCALE), riflemanCanAttack(47 * NES_WORLD_Y_SCALE, 47 * NES_WORLD_Y_SCALE)]).toEqual([true, false, false]);
    expect(riflemanAttackHeadingAtStart(128 * NES_WORLD_X_SCALE, 47 * NES_WORLD_Y_SCALE, 128 * NES_WORLD_X_SCALE, 96 * NES_WORLD_Y_SCALE)).toBeUndefined();
    expect(riflemanAttackHeadingAtStart(128 * NES_WORLD_X_SCALE, 48 * NES_WORLD_Y_SCALE, 128 * NES_WORLD_X_SCALE, 96 * NES_WORLD_Y_SCALE)).toBe(16);
    expect(RIFLEMAN_ATTACK_TO_FIRST_SHOT_FRAMES).toBe(16);
    expect([riflemanFirstShotFrame(94), riflemanFirstShotFrame(122)]).toEqual([110, 138]);
    expect(RIFLEMAN_SIDE_ATTACK_STATE_FRAME).toBe(80);
    expect(RIFLEMAN_SIDE_SHOT_FRAMES).toEqual([96, 112, 128, 144, 160]);
    expect(RIFLEMAN_SIDE_LIFETIME).toBeCloseTo(258 / NES_FRAME_RATE, 9);
    expect(RIFLEMAN_SIDE_PATH_NES).toEqual([[0, 0, 0], [80, 65, 0], [169, 65, 30], [180, 58, 30], [240, 8, 30], [258, -7, 30]]);
    expect(riflemanSidePosition(80 / NES_FRAME_RATE, false)).toEqual([-65.421875, 0]);
    expect(riflemanSidePosition(169 / NES_FRAME_RATE, false)).toEqual([-65.421875, 30]);
    expect(riflemanSidePosition(180 / NES_FRAME_RATE, false)).toEqual([-57.140625, 30]);
    expect(riflemanSidePosition(80 / NES_FRAME_RATE, true)).toEqual([65.421875, 0]);
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
    expect(ninjaTraceLifetime(152, 0, 4, 0)).toBeUndefined();
    expect(ninjaTraceLifetime(152, 0, 4, 0, 47)).toBeCloseTo(244 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 1, 63)).toBeCloseTo(244 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 1, 383)).toBeCloseTo(205 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 0, 751)).toBeCloseTo(202 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 0, 815)).toBeCloseTo(258 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 0, 1071)).toBeCloseTo(279 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 0, 1199)).toBeCloseTo(257 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 0, 1583)).toBeCloseTo(202 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 1, 1727)).toBeCloseTo(257 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 0, 3535, 135 / 256, 35 / 256)).toBeCloseTo(241 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 0, 3535, 176 / 256, 0)).toBeCloseTo(277 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 0, 3727)).toBeCloseTo(228 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(208, 0, 4, 0, 3215)).toBeCloseTo(284 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(224, 0, 4, 0, 3407)).toBeCloseTo(252 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(208, 0, 4, 1, 351)).toBeCloseTo(255 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(224, 0, 4, 0, 399)).toBeCloseTo(221 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(168, 0, 4, 0, 943)).toBeCloseTo(201 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(160, 0, 4, 0, 1103)).toBeCloseTo(260 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(160, 0, 4, 0, 1711)).toBeCloseTo(284 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(152, 0, 4, 1, 735, 239 / 256, 81 / 256)).toBeCloseTo(202 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(152, 0, 4, 1, 735, 161 / 256, 5 / 256)).toBeCloseTo(266 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(216, 0, 4, 1, 767, 51 / 256, 66 / 256)).toBeCloseTo(258 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(216, 0, 4, 1, 767, 231 / 256, 15 / 256)).toBeUndefined();
    expect(ninjaTraceLifetime(200, 0, 4, 1, 1247, 203 / 256, 212 / 256)).toBeCloseTo(266 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(168, 0, 4, 1, 1279, 184 / 256, 212 / 256)).toBeCloseTo(311 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(168, 0, 4, 1, 1375, 61 / 256, 154 / 256)).toBeCloseTo(430 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(200, 0, 4, 0, 1391, 184 / 256, 28 / 256)).toBeCloseTo(256 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(144, 0, 4, 1, 1407, 100 / 256, 182 / 256)).toBeCloseTo(334 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(128, 0, 4, 0, 1551, 246 / 256, 23 / 256)).toBeCloseTo(383 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(152, 0, 4, 1, 1567, 81 / 256, 204 / 256)).toBeCloseTo(228 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(144, 0, 4, 0, 1743, 88 / 256, 46 / 256)).toBeCloseTo(228 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(112, 0, 4, 1, 1855, 204 / 256, 205 / 256)).toBeCloseTo(224 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(96, 0, 4, 1, 1887, 88 / 256, 246 / 256)).toBeCloseTo(436 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(64, 0, 4, 1, 1919, 251 / 256, 236 / 256)).toBeCloseTo(366 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(80, 0, 4, 0, 2223, 210 / 256, 133 / 256)).toBeCloseTo(257 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(56, 0, 4, 0, 2543, 36 / 256, 132 / 256)).toBeCloseTo(256 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(56, 0, 4, 1, 2207, 240 / 256, 0)).toBeCloseTo(212 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(128, 0, 4, 1, 2559, 240 / 256, 0)).toBeCloseTo(210 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(80, 0, 4, 0, 2607, 240 / 256, 0)).toBeCloseTo(258 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(112, 0, 4, 1, 2623, 240 / 256, 0)).toBeCloseTo(313 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(40, 0, 4, 0, 2639, 240 / 256, 0)).toBeCloseTo(258 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(24, 0, 4, 1, 2751, 240 / 256, 0)).toBeCloseTo(224 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(80, 0, 4, 0, 2767, 44 / 256, 0)).toBeCloseTo(332 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(72, 0, 4, 1, 2815, 240 / 256, 0)).toBeCloseTo(258 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(88, 0, 4, 1, 2879, 240 / 256, 0)).toBeCloseTo(201 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(72, 0, 4, 1, 2911, 240 / 256, 0)).toBeCloseTo(277 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(48, 0, 4, 1, 2943, 240 / 256, 0)).toBeCloseTo(209 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(80, 0, 4, 0, 2959, 240 / 256, 0)).toBeCloseTo(349 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(72, 0, 4, 1, 3103, 240 / 256, 0)).toBeCloseTo(280 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(56, 0, 4, 0, 3119, 240 / 256, 0)).toBeCloseTo(256 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(120, 0, 4, 0, 3119, 176 / 256, 0)).toBeCloseTo(271 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(160, 0, 4, 0, 3215, 240 / 256, 0)).toBeCloseTo(268 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(192, 0, 4, 0, 3215, 176 / 256, 0)).toBeCloseTo(332 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(56, 0, 4, 1, 3327, 240 / 256, 0)).toBeCloseTo(256 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(96, 0, 4, 1, 3327, 176 / 256, 0)).toBeCloseTo(335 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(152, 0, 4, 1, 3391, 240 / 256, 0)).toBeCloseTo(224 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(200, 0, 4, 1, 3391, 176 / 256, 0)).toBeCloseTo(237 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(120, 0, 4, 0, 3535, 240 / 256, 0)).toBeCloseTo(272 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(120, 0, 4, 0, 3407, 240 / 256, 0)).toBeCloseTo(271 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(152, 0, 4, 1, 3519, 176 / 256, 0)).toBeCloseTo(225 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(216, 0, 4, 1, 3519, 44 / 256, 0)).toBeCloseTo(255 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(136, 0, 4, 1, 3647, 171 / 256, 202 / 256)).toBeCloseTo(364 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(176, 0, 4, 1, 3647, 133 / 256, 191 / 256)).toBeCloseTo(335 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(216, 0, 4, 1, 3647, 127 / 256, 242 / 256)).toBeCloseTo(261 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(120, 0, 4, 1, 3743, 169 / 256, 185 / 256)).toBeCloseTo(228 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(152, 0, 4, 0, 3759, 37 / 256, 54 / 256)).toBeCloseTo(198 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(104, 0, 4, 0, 1519, 162 / 256, 48 / 256)).toBeCloseTo(224 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(56, 0, 4, 0, 2031, 95 / 256, 146 / 256)).toBeCloseTo(266 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(104, 0, 4, 1, 2239, 193 / 256, 236 / 256)).toBeCloseTo(228 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(144, 0, 4, 1, 1535, 19 / 256, 96 / 256)).toBeCloseTo(143 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(56, 0, 4, 0, 3055, 91 / 256, 240 / 256)).toBeCloseTo(335 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(240, 0, 4, 0, 1551, 176 / 256, 0)).toBeCloseTo(207 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(216, 0, 4, 1, 1567, 176 / 256, 0)).toBeCloseTo(198 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(160, 0, 4, 0, 1775, 240 / 256, 0)).toBeCloseTo(200 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(112, 0, 4, 1, 1919, 176 / 256, 0)).toBeCloseTo(224 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(80, 0, 4, 1, 2015, 176 / 256, 0)).toBeCloseTo(664 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(88, 0, 4, 0, 3055, 176 / 256, 0)).toBeCloseTo(270 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(128, 0, 4, 1, 3327, 44 / 256, 0)).toBeCloseTo(332 / NES_FRAME_RATE, 9);
    expect(ninjaTraceLifetime(184, 0, 4, 0)).toBeUndefined();
    expect(ninjaTracePosition(103 / NES_FRAME_RATE, 152, 0, 4, 0, 47)).toEqual([151 * NES_WORLD_X_SCALE, 123 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(139 / NES_FRAME_RATE, 152, 0, 4, 0, 47)).toEqual([123 * NES_WORLD_X_SCALE, 90 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(193 / NES_FRAME_RATE, 152, 0, 4, 0, 47)).toEqual([137 * NES_WORLD_X_SCALE, 162 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(118 / NES_FRAME_RATE, 184, 0, 4, 1, 63)).toEqual([156 * NES_WORLD_X_SCALE, 92 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(243 / NES_FRAME_RATE, 184, 0, 4, 1, 63)).toEqual([140 * NES_WORLD_X_SCALE, 180 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(140 / NES_FRAME_RATE, 184, 0, 4, 1, 383)).toEqual([149 * NES_WORLD_X_SCALE, 188 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(204 / NES_FRAME_RATE, 184, 0, 4, 1, 383)).toEqual([144 * NES_WORLD_X_SCALE, 200 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(140 / NES_FRAME_RATE, 184, 0, 4, 0, 751)).toEqual([176 * NES_WORLD_X_SCALE, 201 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(201 / NES_FRAME_RATE, 184, 0, 4, 0, 751)).toEqual([175 * NES_WORLD_X_SCALE, 208 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(140 / NES_FRAME_RATE, 184, 0, 4, 0, 815)).toEqual([157 * NES_WORLD_X_SCALE, 118 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(257 / NES_FRAME_RATE, 184, 0, 4, 0, 815)).toEqual([169 * NES_WORLD_X_SCALE, 207 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(160 / NES_FRAME_RATE, 184, 0, 4, 0, 1071)).toEqual([141 * NES_WORLD_X_SCALE, 90 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(278 / NES_FRAME_RATE, 184, 0, 4, 0, 1071)).toEqual([153 * NES_WORLD_X_SCALE, 254 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(160 / NES_FRAME_RATE, 184, 0, 4, 0, 1199)).toEqual([157 * NES_WORLD_X_SCALE, 132 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(256 / NES_FRAME_RATE, 184, 0, 4, 0, 1199)).toEqual([168 * NES_WORLD_X_SCALE, 207 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(116 / NES_FRAME_RATE, 184, 0, 4, 0, 1583)).toEqual([184 * NES_WORLD_X_SCALE, 154 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(201 / NES_FRAME_RATE, 184, 0, 4, 0, 1583)).toEqual([175 * NES_WORLD_X_SCALE, 208 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(160 / NES_FRAME_RATE, 184, 0, 4, 1, 1727)).toEqual([157 * NES_WORLD_X_SCALE, 132 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(256 / NES_FRAME_RATE, 184, 0, 4, 1, 1727)).toEqual([168 * NES_WORLD_X_SCALE, 207 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(160 / NES_FRAME_RATE, 184, 0, 4, 0, 3535, 135 / 256, 35 / 256)).toEqual([124 * NES_WORLD_X_SCALE, 203 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(240 / NES_FRAME_RATE, 184, 0, 4, 0, 3535, 135 / 256, 35 / 256)).toEqual([96 * NES_WORLD_X_SCALE, 230 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(276 / NES_FRAME_RATE, 184, 0, 4, 0, 3535, 176 / 256, 0)).toEqual([(96 + 180 / 256) * NES_WORLD_X_SCALE, (227 + 36 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(160 / NES_FRAME_RATE, 184, 0, 4, 0, 3727)).toEqual([150 * NES_WORLD_X_SCALE, 131 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(227 / NES_FRAME_RATE, 184, 0, 4, 0, 3727)).toEqual([108 * NES_WORLD_X_SCALE, 255 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 208, 0, 4, 0, 3215)).toEqual([(208 + 171 / 256) * NES_WORLD_X_SCALE, (2 + 197 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(283 / NES_FRAME_RATE, 208, 0, 4, 0, 3215)).toEqual([(95 + 239 / 256) * NES_WORLD_X_SCALE, (221 + 41 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 224, 0, 4, 0, 3407)).toEqual([(224 + 143 / 256) * NES_WORLD_X_SCALE, (2 + 149 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(251 / NES_FRAME_RATE, 224, 0, 4, 0, 3407)).toEqual([(80 + 155 / 256) * NES_WORLD_X_SCALE, (255 + 241 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 208, 0, 4, 1, 351)).toEqual([(208 + 240 / 256) * NES_WORLD_X_SCALE, 2 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(254 / NES_FRAME_RATE, 208, 0, 4, 1, 351)).toEqual([(144 + 116 / 256) * NES_WORLD_X_SCALE, (195 + 212 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 224, 0, 4, 0, 399)).toEqual([(224 + 176 / 256) * NES_WORLD_X_SCALE, 2 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(220 / NES_FRAME_RATE, 224, 0, 4, 0, 399)).toEqual([(144 + 124 / 256) * NES_WORLD_X_SCALE, (195 + 96 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 168, 0, 4, 0, 943)).toEqual([(168 + 198 / 256) * NES_WORLD_X_SCALE, (2 + 210 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(200 / NES_FRAME_RATE, 168, 0, 4, 0, 943)).toEqual([(168 + 198 / 256) * NES_WORLD_X_SCALE, (206 + 210 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 160, 0, 4, 0, 1103)).toEqual([(160 + 118 / 256) * NES_WORLD_X_SCALE, (2 + 27 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(259 / NES_FRAME_RATE, 160, 0, 4, 0, 1103)).toEqual([(160 + 250 / 256) * NES_WORLD_X_SCALE, (208 + 31 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 160, 0, 4, 0, 1711)).toEqual([(160 + 176 / 256) * NES_WORLD_X_SCALE, 2 * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(283 / NES_FRAME_RATE, 160, 0, 4, 0, 1711)).toEqual([(160 + 120 / 256) * NES_WORLD_X_SCALE, (254 + 84 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 152, 0, 4, 1, 735, 239 / 256, 81 / 256)).toEqual([(152 + 239 / 256) * NES_WORLD_X_SCALE, (2 + 81 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(201 / NES_FRAME_RATE, 152, 0, 4, 1, 735, 239 / 256, 81 / 256)).toEqual([(161 + 95 / 256) * NES_WORLD_X_SCALE, (207 + 215 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(265 / NES_FRAME_RATE, 152, 0, 4, 1, 735, 161 / 256, 5 / 256)).toEqual([(149 + 41 / 256) * NES_WORLD_X_SCALE, (1 + 93 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 216, 0, 4, 1, 767, 51 / 256, 66 / 256)).toEqual([(216 + 51 / 256) * NES_WORLD_X_SCALE, (2 + 66 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(257 / NES_FRAME_RATE, 216, 0, 4, 1, 767, 51 / 256, 66 / 256)).toEqual([(172 + 87 / 256) * NES_WORLD_X_SCALE, (207 + 226 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(265 / NES_FRAME_RATE, 200, 0, 4, 1, 1247, 203 / 256, 212 / 256)).toEqual([(138 + 91 / 256) * NES_WORLD_X_SCALE, (2 + 44 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(310 / NES_FRAME_RATE, 168, 0, 4, 1, 1279, 184 / 256, 212 / 256)).toEqual([(168 + 184 / 256) * NES_WORLD_X_SCALE, (208 + 28 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(429 / NES_FRAME_RATE, 168, 0, 4, 1, 1375, 61 / 256, 154 / 256)).toEqual([(160 + 81 / 256) * NES_WORLD_X_SCALE, (209 + 166 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(255 / NES_FRAME_RATE, 200, 0, 4, 0, 1391, 184 / 256, 28 / 256)).toEqual([(171 + 60 / 256) * NES_WORLD_X_SCALE, (207 + 64 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(333 / NES_FRAME_RATE, 144, 0, 4, 1, 1407, 100 / 256, 182 / 256)).toEqual([(162 + 184 / 256) * NES_WORLD_X_SCALE, (229 + 234 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(382 / NES_FRAME_RATE, 128, 0, 4, 0, 1551, 246 / 256, 23 / 256)).toEqual([(160 + 26 / 256) * NES_WORLD_X_SCALE, (227 + 29 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(227 / NES_FRAME_RATE, 152, 0, 4, 1, 1567, 81 / 256, 204 / 256)).toEqual([(169 + 181 / 256) * NES_WORLD_X_SCALE, (255 + 206 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(227 / NES_FRAME_RATE, 144, 0, 4, 0, 1743, 88 / 256, 46 / 256)).toEqual([(161 + 188 / 256) * NES_WORLD_X_SCALE, (255 + 48 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(223 / NES_FRAME_RATE, 112, 0, 4, 1, 1855, 204 / 256, 205 / 256)).toEqual([(164 + 120 / 256) * NES_WORLD_X_SCALE, (255 + 15 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(435 / NES_FRAME_RATE, 96, 0, 4, 1, 1887, 88 / 256, 246 / 256)).toEqual([(160 + 132 / 256) * NES_WORLD_X_SCALE, (218 + 78 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(365 / NES_FRAME_RATE, 64, 0, 4, 1, 1919, 251 / 256, 236 / 256)).toEqual([(168 + 215 / 256) * NES_WORLD_X_SCALE, (255 + 174 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(256 / NES_FRAME_RATE, 80, 0, 4, 0, 2223, 210 / 256, 133 / 256)).toEqual([(96 + 62 / 256) * NES_WORLD_X_SCALE, (207 + 51 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(255 / NES_FRAME_RATE, 56, 0, 4, 0, 2543, 36 / 256, 132 / 256)).toEqual([(85 + 160 / 256) * NES_WORLD_X_SCALE, (207 + 168 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(211 / NES_FRAME_RATE, 56, 0, 4, 1, 2207, 240 / 256, 0)).toEqual([(80 + 16 / 256) * NES_WORLD_X_SCALE, (223 + 130 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(209 / NES_FRAME_RATE, 128, 0, 4, 1, 2559, 240 / 256, 0)).toEqual([(96 + 242 / 256) * NES_WORLD_X_SCALE, (211 + 248 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(257 / NES_FRAME_RATE, 80, 0, 4, 0, 2607, 240 / 256, 0)).toEqual([(96 + 12 / 256) * NES_WORLD_X_SCALE, (207 + 160 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(312 / NES_FRAME_RATE, 112, 0, 4, 1, 2623, 240 / 256, 0)).toEqual([(92 + 240 / 256) * NES_WORLD_X_SCALE, (207 + 200 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(257 / NES_FRAME_RATE, 40, 0, 4, 0, 2639, 240 / 256, 0)).toEqual([(84 + 204 / 256) * NES_WORLD_X_SCALE, (207 + 160 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(223 / NES_FRAME_RATE, 24, 0, 4, 1, 2751, 240 / 256, 0)).toEqual([(76 + 156 / 256) * NES_WORLD_X_SCALE, (254 + 66 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(331 / NES_FRAME_RATE, 80, 0, 4, 0, 2767, 44 / 256, 0)).toEqual([(109 + 168 / 256) * NES_WORLD_X_SCALE, (254 + 108 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(257 / NES_FRAME_RATE, 72, 0, 4, 1, 2815, 240 / 256, 0)).toEqual([(88 + 12 / 256) * NES_WORLD_X_SCALE, (207 + 160 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(200 / NES_FRAME_RATE, 88, 0, 4, 1, 2879, 240 / 256, 0)).toEqual([(88 + 240 / 256) * NES_WORLD_X_SCALE, (206 + 0 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(276 / NES_FRAME_RATE, 72, 0, 4, 1, 2911, 240 / 256, 0)).toEqual([(72 + 240 / 256) * NES_WORLD_X_SCALE, (254 + 72 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(208 / NES_FRAME_RATE, 48, 0, 4, 1, 2943, 240 / 256, 0)).toEqual([(80 + 4 / 256) * NES_WORLD_X_SCALE, (211 + 80 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(348 / NES_FRAME_RATE, 80, 0, 4, 0, 2959, 240 / 256, 0)).toEqual([(96 + 132 / 256) * NES_WORLD_X_SCALE, (220 + 76 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(279 / NES_FRAME_RATE, 72, 0, 4, 1, 3103, 240 / 256, 0)).toEqual([(103 + 200 / 256) * NES_WORLD_X_SCALE, (255 + 92 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(255 / NES_FRAME_RATE, 56, 0, 4, 0, 3119, 240 / 256, 0)).toEqual([(86 + 108 / 256) * NES_WORLD_X_SCALE, (207 + 36 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(270 / NES_FRAME_RATE, 120, 0, 4, 0, 3119, 176 / 256, 0)).toEqual([(96 + 62 / 256) * NES_WORLD_X_SCALE, (216 + 220 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(267 / NES_FRAME_RATE, 160, 0, 4, 0, 3215, 240 / 256, 0)).toEqual([(96 + 116 / 256) * NES_WORLD_X_SCALE, (222 + 212 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(331 / NES_FRAME_RATE, 192, 0, 4, 0, 3215, 176 / 256, 0)).toEqual([(104 + 60 / 256) * NES_WORLD_X_SCALE, (254 + 108 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(255 / NES_FRAME_RATE, 56, 0, 4, 1, 3327, 240 / 256, 0)).toEqual([(86 + 108 / 256) * NES_WORLD_X_SCALE, (207 + 36 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(334 / NES_FRAME_RATE, 96, 0, 4, 1, 3327, 176 / 256, 0)).toEqual([(92 + 108 / 256) * NES_WORLD_X_SCALE, (254 + 132 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(223 / NES_FRAME_RATE, 152, 0, 4, 1, 3391, 240 / 256, 0)).toEqual([(101 + 68 / 256) * NES_WORLD_X_SCALE, (254 + 66 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(236 / NES_FRAME_RATE, 200, 0, 4, 1, 3391, 176 / 256, 0)).toEqual([(94 + 108 / 256) * NES_WORLD_X_SCALE, (255 + 68 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(271 / NES_FRAME_RATE, 120, 0, 4, 0, 3535, 240 / 256, 0)).toEqual([(96 + 126 / 256) * NES_WORLD_X_SCALE, (218 + 220 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(270 / NES_FRAME_RATE, 120, 0, 4, 0, 3407, 240 / 256, 0)).toEqual([(96 + 126 / 256) * NES_WORLD_X_SCALE, (216 + 220 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(224 / NES_FRAME_RATE, 152, 0, 4, 1, 3519, 176 / 256, 0)).toEqual([(96 + 8 / 256) * NES_WORLD_X_SCALE, (224 + 232 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(254 / NES_FRAME_RATE, 216, 0, 4, 1, 3519, 44 / 256, 0)).toEqual([(95 + 210 / 256) * NES_WORLD_X_SCALE, (217 + 184 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 136, 0, 4, 1, 3647, 171 / 256, 202 / 256)).toEqual([(136 + 171 / 256) * NES_WORLD_X_SCALE, (2 + 202 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(363 / NES_FRAME_RATE, 136, 0, 4, 1, 3647, 171 / 256, 202 / 256)).toEqual([(105 + 107 / 256) * NES_WORLD_X_SCALE, (203 + 226 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(334 / NES_FRAME_RATE, 176, 0, 4, 1, 3647, 133 / 256, 191 / 256)).toEqual([(113 + 73 / 256) * NES_WORLD_X_SCALE, (255 + 67 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(260 / NES_FRAME_RATE, 216, 0, 4, 1, 3647, 127 / 256, 242 / 256)).toEqual([(113 + 39 / 256) * NES_WORLD_X_SCALE, (212 + 176 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 120, 0, 4, 1, 3743, 169 / 256, 185 / 256)).toEqual([(120 + 169 / 256) * NES_WORLD_X_SCALE, (2 + 185 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(227 / NES_FRAME_RATE, 120, 0, 4, 1, 3743, 169 / 256, 185 / 256)).toEqual([(103 + 69 / 256) * NES_WORLD_X_SCALE, (255 + 187 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(197 / NES_FRAME_RATE, 152, 0, 4, 0, 3759, 37 / 256, 54 / 256)).toEqual([(108 + 153 / 256) * NES_WORLD_X_SCALE, (203 + 228 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 104, 0, 4, 0, 1519, 162 / 256, 48 / 256)).toEqual([(104 + 162 / 256) * NES_WORLD_X_SCALE, (2 + 48 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(223 / NES_FRAME_RATE, 104, 0, 4, 0, 1519, 162 / 256, 48 / 256)).toEqual([(156 + 78 / 256) * NES_WORLD_X_SCALE, (254 + 114 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(265 / NES_FRAME_RATE, 56, 0, 4, 0, 2031, 95 / 256, 146 / 256)).toEqual([(118 + 207 / 256) * NES_WORLD_X_SCALE, (1 + 234 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(227 / NES_FRAME_RATE, 104, 0, 4, 1, 2239, 193 / 256, 236 / 256)).toEqual([(87 + 93 / 256) * NES_WORLD_X_SCALE, (255 + 238 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(0, 144, 0, 4, 1, 1535, 19 / 256, 96 / 256)).toEqual([(144 + 19 / 256) * NES_WORLD_X_SCALE, (2 + 96 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(142 / NES_FRAME_RATE, 144, 0, 4, 1, 1535, 19 / 256, 96 / 256)).toEqual([(160 + 243 / 256) * NES_WORLD_X_SCALE, (202 + 94 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(334 / NES_FRAME_RATE, 56, 0, 4, 0, 3055, 91 / 256, 240 / 256)).toEqual([(111 + 15 / 256) * NES_WORLD_X_SCALE, (255 + 116 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(206 / NES_FRAME_RATE, 240, 0, 4, 0, 1551, 176 / 256, 0)).toEqual([(177 + 116 / 256) * NES_WORLD_X_SCALE, (216 + 32 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(197 / NES_FRAME_RATE, 216, 0, 4, 1, 1567, 176 / 256, 0)).toEqual([(173 + 36 / 256) * NES_WORLD_X_SCALE, (203 + 174 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(199 / NES_FRAME_RATE, 160, 0, 4, 0, 1775, 240 / 256, 0)).toEqual([(160 + 212 / 256) * NES_WORLD_X_SCALE, (203 + 42 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(223 / NES_FRAME_RATE, 112, 0, 4, 1, 1919, 176 / 256, 0)).toEqual([(164 + 92 / 256) * NES_WORLD_X_SCALE, (254 + 66 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(663 / NES_FRAME_RATE, 80, 0, 4, 1, 2015, 176 / 256, 0)).toEqual([(137 + 120 / 256) * NES_WORLD_X_SCALE, (254 + 204 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(269 / NES_FRAME_RATE, 88, 0, 4, 0, 3055, 176 / 256, 0)).toEqual([(99 + 188 / 256) * NES_WORLD_X_SCALE, (255 + 238 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(331 / NES_FRAME_RATE, 128, 0, 4, 1, 3327, 44 / 256, 0)).toEqual([(98 + 176 / 256) * NES_WORLD_X_SCALE, (254 + 108 / 256) * NES_WORLD_Y_SCALE]);
    expect(ninjaTracePosition(103 / NES_FRAME_RATE, 184, 0, 4, 0)).toBeUndefined();
    expect([ninjaTraceThrowFrame(4, 47), ninjaTraceThrowFrame(4, 63), ninjaTraceThrowFrame(4, 351), ninjaTraceThrowFrame(4, 399), ninjaTraceThrowFrame(4, 735, 239 / 256, 81 / 256), ninjaTraceThrowFrame(4, 767, 51 / 256, 66 / 256), ninjaTraceThrowFrame(4, 943), ninjaTraceThrowFrame(4, 1103), ninjaTraceThrowFrame(4, 1711), ninjaTraceThrowFrame(4, 3215), ninjaTraceThrowFrame(4, 3407), ninjaTraceThrowFrame(4, 383), ninjaTraceThrowFrame(4, 751), ninjaTraceThrowFrame(4, 815), ninjaTraceThrowFrame(4, 1071), ninjaTraceThrowFrame(4, 1199), ninjaTraceThrowFrame(4, 1583), ninjaTraceThrowFrame(4, 1727), ninjaTraceThrowFrame(4, 3535, 135 / 256, 35 / 256), ninjaTraceThrowFrame(4, 3727), ninjaTraceThrowFrame(3, 47)]).toEqual([103, 103, 103, false, false, 116, false, 116, 116, 116, 116, false, false, 116, 116, 116, false, 116, false, 116, undefined]);
    expect(ninjaTraceThrowFrames(4, 3535, 176 / 256, 0)).toEqual([117]);
    expect(ninjaTraceThrowFrames(4, 735, 161 / 256, 5 / 256)).toEqual([116, 153, 190, 227]);
    expect(ninjaTraceThrowFrames(4, 1071)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 1711)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 1247, 203 / 256, 212 / 256)).toEqual([116, 153, 190, 227, 264]);
    expect(ninjaTraceThrowFrames(4, 1279, 184 / 256, 212 / 256)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 1375, 61 / 256, 154 / 256)).toEqual([116, 204, 241, 278, 315]);
    expect(ninjaTraceThrowFrames(4, 1391, 184 / 256, 28 / 256)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 1407, 100 / 256, 182 / 256)).toEqual([116, 227]);
    expect(ninjaTraceThrowFrames(4, 1551, 246 / 256, 23 / 256)).toEqual([116, 153, 190]);
    expect(ninjaTraceThrowFrames(4, 1567, 81 / 256, 204 / 256)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 1743, 88 / 256, 46 / 256)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 1855, 204 / 256, 205 / 256)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 1887, 88 / 256, 246 / 256)).toEqual([116, 153, 190, 248, 285]);
    expect(ninjaTraceThrowFrames(4, 1919, 251 / 256, 236 / 256)).toEqual([116, 153, 190, 357]);
    expect(ninjaTraceThrowFrames(4, 2223, 210 / 256, 133 / 256)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 2543, 36 / 256, 132 / 256)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 2207, 240 / 256, 0)).toBe(false);
    expect(ninjaTraceThrowFrames(4, 2559, 240 / 256, 0)).toBe(false);
    expect(ninjaTraceThrowFrames(4, 2607, 240 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 2623, 240 / 256, 0)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 2639, 240 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 2751, 240 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 2767, 44 / 256, 0)).toEqual([116, 153, 190]);
    expect(ninjaTraceThrowFrames(4, 2815, 240 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 2879, 240 / 256, 0)).toBe(false);
    expect(ninjaTraceThrowFrames(4, 2911, 240 / 256, 0)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 2943, 240 / 256, 0)).toBe(false);
    expect(ninjaTraceThrowFrames(4, 2959, 240 / 256, 0)).toEqual([116, 174, 211, 248]);
    expect(ninjaTraceThrowFrames(4, 3103, 240 / 256, 0)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 3119, 240 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 3119, 176 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 3215, 240 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 3215, 176 / 256, 0)).toEqual([116, 153, 190]);
    expect(ninjaTraceThrowFrames(4, 3327, 240 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 3327, 176 / 256, 0)).toEqual([116, 153, 190]);
    expect(ninjaTraceThrowFrames(4, 3391, 240 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 3391, 176 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 3535, 240 / 256, 0)).toEqual([117]);
    expect(ninjaTraceThrowFrames(4, 3647, 171 / 256, 202 / 256)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 3647, 133 / 256, 191 / 256)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 3647, 127 / 256, 242 / 256)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 3743, 169 / 256, 185 / 256)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 3759, 37 / 256, 54 / 256)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 1519, 162 / 256, 48 / 256)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 2031, 95 / 256, 146 / 256)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 2239, 193 / 256, 236 / 256)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 1535, 19 / 256, 96 / 256)).toBe(false);
    expect(ninjaTraceThrowFrames(4, 3055, 91 / 256, 240 / 256)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 1551, 176 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 1567, 176 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 1775, 240 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 1919, 176 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 2015, 176 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 3055, 176 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 3327, 44 / 256, 0)).toEqual([116, 153]);
    expect(ninjaTraceThrowFrames(4, 3407, 240 / 256, 0)).toEqual([116]);
    expect(ninjaTraceThrowFrames(4, 3519, 176 / 256, 0)).toBe(false);
    expect(ninjaTraceThrowFrames(4, 3519, 44 / 256, 0)).toBe(false);
    expect(ninjaTraceLifetime(80, 0, 4, 1, 2015, 210 / 256, 133 / 256)).toBeUndefined();
    expect(ninjaTraceLifetime(56, 0, 4, 1, 2207, 36 / 256, 132 / 256)).toBeUndefined();
    expect(NINJA_LIFETIME).toBeCloseTo(303 / NES_FRAME_RATE, 9);
  });

  it("runs the decoded ordinary Ninja random action state", () => {
    const attacking = createNinjaState(160, 0, 176, 0);
    const random = [0xb3, 0];
    expect(advanceNinja(attacking, 96, 168, 215, () => false, () => random.shift() ?? 0).shots).toEqual([]);
    expect([attacking.mode, attacking.wait, attacking.heading, attacking.x, attacking.y]).toEqual(["hold", 20, 0x9c, 160 + 176 / 256, 152]);
    advanceNinja(attacking, 116, 168, 215, () => false, () => random.shift() ?? 0);
    expect(advanceNinja(attacking, 117, 168, 215, () => false, () => random.shift() ?? 0).shots).toEqual([15]);
    expect([attacking.x, attacking.y]).toEqual([158 + 244 / 256, 149 + 228 / 256]);
    advanceNinja(attacking, 132, 168, 215, () => false, () => random.shift() ?? 0);
    expect([attacking.x, attacking.y]).toEqual([132 + 240 / 256, 118 + 64 / 256]);
    advanceNinja(attacking, 153, 168, 215, () => false, () => random.shift() ?? 0);
    expect([attacking.x, attacking.y]).toEqual([131 + 52 / 256, 116 + 36 / 256]);
    expect(advanceNinja(attacking, 154, 168, 215, () => false, () => random.shift() ?? 0).shots).toEqual([14]);

    const roaming = createNinjaState(152, 0, 239, 81);
    advanceNinja(roaming, 116, 168, 215, () => false, () => 0xff);
    expect([roaming.mode, roaming.heading]).toEqual(["roam", 0x4f]);
    advanceNinja(roaming, 117, 168, 215, () => false, () => 0xff);
    expect([roaming.x, roaming.y]).toEqual([153 + 63 / 256, 154 + 67 / 256]);

    const missed = createNinjaState(40, 0);
    missed.mode = "seek";
    missed.y = 126;
    expect(advanceNinja(missed, 200, 168, 48, () => false, () => 0xff).dead).toBe(true);
    expect(missed.y).toBeGreaterThanOrEqual(ROM_SCREEN_RELEASE_Y_NES);
  });

  it("keeps the Ninja Boss smoke and teleport timing", () => {
    expect(NINJA_BOSS_ENTRY_INVULNERABILITY).toBeCloseTo(44 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_FIRST_PREPARE_DELAY).toBeCloseTo(124 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_REENTRY_PREPARE_DELAY).toBeCloseTo((625 - 429) / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_INITIAL_PREPARE_FRAMES).toEqual([124, 183]);
    expect(NINJA_BOSS_REENTRY_PREPARE_FRAMES).toEqual([196, 376]);
    expect(NINJA_BOSS_PREPARE_DURATION).toBeCloseTo(40 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_PREPARE_CONTROLLER_DURATION).toBeCloseTo(7 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_FIRST_ATTACK_DELAY).toBeCloseTo(163 / NES_FRAME_RATE, 9);
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
    expect(createHatchetState(120, 0, 133, 218)).toMatchObject({ x: 120 + 133 / 256, y: 218 / 256 });
    expect([hatchetTurnHeading(33, false, false), hatchetTurnHeading(0, false, false), hatchetTurnHeading(33, true, false), hatchetTurnHeading(33, true, true)]).toEqual([9, 24, 7, 25]);
    expect([nesActorCollisionProbeOffset(0), nesActorCollisionProbeOffset(8), nesActorCollisionProbeOffset(16), nesActorCollisionProbeOffset(24)]).toEqual([[0, -12], [12, 0], [0, 12], [-12, 0]]);
    expect(hatchetCanThrow(128 * NES_WORLD_X_SCALE, 0, 144 * NES_WORLD_X_SCALE, 100 * NES_WORLD_Y_SCALE)).toBe(true);
    expect(hatchetCanThrow(128 * NES_WORLD_X_SCALE, 0, 176 * NES_WORLD_X_SCALE, 100 * NES_WORLD_Y_SCALE)).toBe(false);
    const replay = (playerX: number) => {
      const state = createHatchetState(120);
      const shots: { frame: number; heading: number }[] = [];
      for (let frame = 1; frame <= 1042; frame += 1) {
        const scroll = (159 + Math.floor(frame / 3)) * NES_WORLD_Y_SCALE;
        const result = advanceHatchet(state, frame, playerX, 188, (probeX, probeY) => roundActorCollisionAtNes(3, scroll, probeX, probeY));
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
    expect(createFirebreatherState(88, 0, 16, 144, 242)).toMatchObject({ x: 88 + 144 / 256, y: 242 / 256 });
    const state = createFirebreatherState(88, 0, 16);
    const shots: { frame: number; heading: number }[] = [];
    for (let frame = 1; frame <= 312; frame += 1) {
      const scroll = (1087 + Math.floor(frame / 3)) * NES_WORLD_Y_SCALE;
      const result = advanceFirebreather(state, frame, 136, 188, (probeX, probeY) => roundActorCollisionAtNes(3, scroll, probeX, probeY), () => 0);
      for (const heading of result.shots) shots.push({ frame, heading });
    }
    expect(shots).toEqual([{ frame: 156, heading: 14 }, { frame: 208, heading: 13 }, { frame: 260, heading: 12 }, { frame: 312, heading: 10 }]);
    const moving = createFirebreatherState(88, 0, 16);
    for (let frame = 1; frame <= 208; frame += 1) {
      const scroll = (1087 + Math.floor(frame / 3)) * NES_WORLD_Y_SCALE;
      advanceFirebreather(moving, frame, 136, 188, (probeX, probeY) => roundActorCollisionAtNes(3, scroll, probeX, probeY), () => 5);
    }
    expect({ mode: moving.mode, heading: moving.heading }).toEqual({ mode: "move", heading: 28 });
    expect(createFirebreatherState(248, 64, 24).heading).toBe(24);
  });

  it("matches the traced Spear timing", () => {
    expect(SPEAR_LIFETIME).toBe(Number.POSITIVE_INFINITY);
    expect([SPEAR_TOP_ENTRY_FRAMES, SPEAR_SIDE_ENTRY_FRAMES, SPEAR_WAIT_FRAMES, SPEAR_MOVE_FRAMES, SPEAR_ATTACK_REMAINING_FRAME]).toEqual([24, 40, 40, 32, 24]);
    expect(SPEAR_PROJECTILE_OFFSET_NES).toEqual([0, 0]);
    expect(createSpearState(248, 32, true, 200, 191)).toMatchObject({ x: 248 + 200 / 256, y: 33 + 191 / 256 });
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
    expect(BACKSTABBER_AMBUSH_DEPTH_NES).toBe(178);
    expect(BACKSTABBER_AMBUSH_DEPTH).toBe(178 * NES_WORLD_Y_SCALE);
    expect(BACKSTABBER_AMBUSH_LIFETIME).toBeCloseTo(532 / NES_FRAME_RATE, 9);
    expect([0, 2, 3, 531].map((frame) => backstabberAmbushY(frame / NES_FRAME_RATE, 24 / 256) / NES_WORLD_Y_SCALE)).toEqual([1 + 24 / 256, 1 + 24 / 256, 2 + 24 / 256, 178 + 24 / 256]);
  });

  it("advances the side-raid Backstabber state", () => {
    const state = createBackstabberRaidState(4, 64, 120, 215);
    expect(state).toMatchObject({ mode: "move", segment: 1, remaining: 64, heading: 13, arcHeading: 0x40, increasingArc: true });
    const seeded = createBackstabberRaidState(4, 64, 120, 215, 60, 86);
    expect(seeded.x).toBeCloseTo(4 + 60 / 256, 9);
    expect(seeded.y).toBeCloseTo(64 + 86 / 256, 9);
    advanceBackstabberRaid(state, 4);
    expect(state).toMatchObject({ mode: "move", remaining: 60, arcHeading: 0x41 });
    advanceBackstabberRaid(state, 64);
    expect(state).toMatchObject({ mode: "wait", remaining: 0, wait: 1 });
    advanceBackstabberRaid(state, 93);
    expect(state).toMatchObject({ mode: "wait", wait: 30 });
    advanceBackstabberRaid(state, 94);
    expect(state).toMatchObject({ mode: "move", segment: 2, remaining: 64, arcHeading: 0 });
  });

  it("matches the traced Gunman shot timing", () => {
    expect([56, 72, 22].map((seed) => gunmanFirstOpportunityFrame(seed))).toEqual([58, 52, 69]);
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
    expect([
      gunmanTopHeading(58 / NES_FRAME_RATE, 136),
      gunmanTopHeading(314 / NES_FRAME_RATE, 40),
      gunmanTopHeading(570 / NES_FRAME_RATE, 220),
      gunmanTopHeading(1146 / NES_FRAME_RATE, 220),
    ]).toEqual([14, 17, 7, 30]);
    expect(gunmanTopHeading(58 / NES_FRAME_RATE, 136, 152)).toBeUndefined();
    const canFireAt = (frame: number, targetX: number): boolean => {
      const [x, y] = gunmanTopPosition(frame / NES_FRAME_RATE, targetX);
      const heading = gunmanTopHeading(frame / NES_FRAME_RATE, targetX);
      return heading !== undefined && gunmanCanFire(heading, nesAimHeading(x, y, targetX * NES_WORLD_X_SCALE, 188 * NES_WORLD_Y_SCALE));
    };
    expect([58, 122, 186, 250, 314].map((frame) => canFireAt(frame, 40))).toEqual([true, false, false, false, true]);
    expect([58, 570, 1146].map((frame) => canFireAt(frame, 220))).toEqual([true, true, true]);
    expect(gunmanProjectileVelocity(90 * NES_WORLD_X_SCALE, 75 * NES_WORLD_Y_SCALE, 136 * NES_WORLD_X_SCALE, 188 * NES_WORLD_Y_SCALE)).toEqual([0.625 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 1.8515625 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
  });

  it("matches the traced flank Gunman variants", () => {
    expect(GUNMAN_FLANK_SHOT_FRAMES).toEqual({ 7: [64, 410], 8: [309], 9: [399, 463] });
    expect(GUNMAN_FLANK_LIFETIMES).toEqual({ 7: 642 / NES_FRAME_RATE, 8: 508 / NES_FRAME_RATE, 9: 826 / NES_FRAME_RATE });
    expect(GUNMAN_FLANK_INITIAL_STATE_FRAMES).toBe(250);
    expect([135, 188, 0, 70].map((seed) => gunmanFlankFirstOpportunityFrame(seed))).toEqual([19, 2, 64, 41]);
    expect(gunmanFlankFirstOpportunityFrame(132, 0)).toBe(32);
    expect([gunmanFlankLifetime(8), gunmanFlankLifetime(9), gunmanFlankLifetime(8, 32), gunmanFlankLifetime(9, 32), gunmanFlankLifetime(8, 64), gunmanFlankLifetime(9, 64)]).toEqual([508, 826, 569, 963, 371, 826].map((frames) => frames / NES_FRAME_RATE));
    expect(gunmanFlankLifetime(8, 64, 3, 1)).toBeCloseTo(508 / NES_FRAME_RATE, 9);
    expect(gunmanFlankLifetime(8, 64, 3, 0)).toBeCloseTo(379 / NES_FRAME_RATE, 9);
    expect(gunmanFlankLifetime(7, 0, 2, 1)).toBeCloseTo(369 / NES_FRAME_RATE, 9);
    expect(gunmanFlankFirstOpportunityFrame(174, 0, 2, 7, 1)).toBe(51);
    expect(gunmanFlankPosition(7, 115 / NES_FRAME_RATE, 0, 2, 1)).toEqual([53, 102]);
    expect(gunmanFlankPosition(7, 368 / NES_FRAME_RATE, 0, 2, 1)).toEqual([146, 251]);
    expect(gunmanFlankLifetime(7, 0, 3, 1)).toBeCloseTo(324 / NES_FRAME_RATE, 9);
    expect(gunmanFlankFirstOpportunityFrame(187, 0, 3, 7, 1)).toBe(47);
    expect(gunmanFlankPosition(7, 0, 0, 3, 1)).toEqual([0, 1]);
    expect(gunmanFlankPosition(7, 115 / NES_FRAME_RATE, 0, 3, 1)).toEqual([43, 103]);
    expect(gunmanFlankPosition(7, 221 / NES_FRAME_RATE, 0, 3, 1)).toEqual([98, 170]);
    expect(gunmanFlankPosition(7, 323 / NES_FRAME_RATE, 0, 3, 1)).toEqual([113, 251]);
    expect(gunmanFlankLifetime(7, 32, 1, 0, true, 847)).toBeCloseTo(590 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 92 / NES_FRAME_RATE, 32, 1, 0, true, 847)).toEqual([-56, 69]);
    expect(gunmanFlankPosition(7, 589 / NES_FRAME_RATE, 32, 1, 0, true, 847)).toEqual([-57, 219]);
    expect(gunmanFlankLifetime(7, 48, 1, 0, false, 1423)).toBeCloseTo(307 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 64 / NES_FRAME_RATE, 48, 1, 0, false, 1423)).toEqual([46, 35]);
    expect(gunmanFlankPosition(7, 306 / NES_FRAME_RATE, 48, 1, 0, false, 1423)).toEqual([189, 203]);
    expect(gunmanFlankLifetime(7, 80, 1, 0, true, 1743)).toBeCloseTo(590 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 64 / NES_FRAME_RATE, 80, 1, 0, true, 1743)).toEqual([-47, 34]);
    expect(gunmanFlankPosition(7, 589 / NES_FRAME_RATE, 80, 1, 0, true, 1743)).toEqual([-175, -80]);
    expect(gunmanFlankLifetime(7, 128, 1, 1, false, 1791)).toBeCloseTo(252 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 64 / NES_FRAME_RATE, 128, 1, 1, false, 1791)).toEqual([49, 32]);
    expect(gunmanFlankPosition(7, 251 / NES_FRAME_RATE, 128, 1, 1, false, 1791)).toEqual([150, 123]);
    expect(gunmanFlankLifetime(7, 48, 1, 1, true, 1983)).toBeCloseTo(475 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 95 / NES_FRAME_RATE, 48, 1, 1, true, 1983)).toEqual([-65, 66]);
    expect(gunmanFlankPosition(7, 474 / NES_FRAME_RATE, 48, 1, 1, true, 1983)).toEqual([-248, -24]);
    expect(gunmanFlankLifetime(7, 48, 1, 1, true, 2079)).toBeCloseTo(675 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 59 / NES_FRAME_RATE, 48, 1, 1, true, 2079)).toEqual([-45, 28]);
    expect(gunmanFlankPosition(7, 674 / NES_FRAME_RATE, 48, 1, 1, true, 2079)).toEqual([-97, 203]);
    expect(gunmanFlankLifetime(7, 64, 1, 0, true, 2223)).toBeCloseTo(464 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 57 / NES_FRAME_RATE, 64, 1, 0, true, 2223)).toEqual([-45, 26]);
    expect(gunmanFlankPosition(7, 463 / NES_FRAME_RATE, 64, 1, 0, true, 2223)).toEqual([-202, -64]);
    expect(gunmanFlankLifetime(7, 96, 1, 0, true, 2511)).toBeCloseTo(426 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 64 / NES_FRAME_RATE, 96, 1, 0, true, 2511)).toEqual([-49, 30]);
    expect(gunmanFlankPosition(7, 425 / NES_FRAME_RATE, 96, 1, 0, true, 2511)).toEqual([-248, 102]);
    expect(gunmanFlankLifetime(7, 112, 1, 1, false, 2559)).toBeCloseTo(557 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 238 / NES_FRAME_RATE, 112, 1, 1, false, 2559)).toEqual([140, 89]);
    expect(gunmanFlankPosition(7, 556 / NES_FRAME_RATE, 112, 1, 1, false, 2559)).toEqual([90, -112]);
    expect(gunmanFlankLifetime(7, 48, 1, 0, true, 2671)).toBeCloseTo(582 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 73 / NES_FRAME_RATE, 48, 1, 0, true, 2671)).toEqual([-52, 44]);
    expect(gunmanFlankPosition(7, 581 / NES_FRAME_RATE, 48, 1, 0, true, 2671)).toEqual([-98, 203]);
    expect(gunmanFlankLifetime(8, 32, 1, 0, false, 1071)).toBeCloseTo(519 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(8, 246 / NES_FRAME_RATE, 32, 1, 0, false, 1071)).toEqual([0, 83]);
    expect(gunmanFlankPosition(8, 518 / NES_FRAME_RATE, 32, 1, 0, false, 1071)).toEqual([186, 218]);
    expect(gunmanFlankLifetime(8, 64, 1, 0, false, 1263)).toBeCloseTo(411 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(8, 160 / NES_FRAME_RATE, 64, 1, 0, false, 1263)).toEqual([12, 40]);
    expect(gunmanFlankPosition(8, 410 / NES_FRAME_RATE, 64, 1, 0, false, 1263)).toEqual([185, 186]);
    expect(gunmanFlankLifetime(9, 32, 1, 0, true, 1775)).toBeCloseTo(696 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(9, 367 / NES_FRAME_RATE, 32, 1, 0, true, 1775)).toEqual([-98, 166]);
    expect(gunmanFlankLifetime(9, 96, 1, 1, true, 511)).toBeCloseTo(823 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(9, 0, 96, 1, 1, true, 511)).toEqual([0, 0]);
    expect(gunmanFlankPosition(9, 53 / NES_FRAME_RATE, 96, 1, 1, true, 511)).toEqual([-47, 37]);
    expect(gunmanFlankPosition(9, 822 / NES_FRAME_RATE, 96, 1, 1, true, 511)).toEqual([7, 70]);
    expect(gunmanFlankPosition(9, 695 / NES_FRAME_RATE, 32, 1, 0, true, 1775)).toEqual([-155, -32]);
    expect(gunmanFlankLifetime(7, 32, 1, 1, true, 703)).toBeCloseTo(583 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 67 / NES_FRAME_RATE, 32, 1, 1, true, 703)).toEqual([47, 39]);
    expect(gunmanFlankPosition(7, 582 / NES_FRAME_RATE, 32, 1, 1, true, 703)).toEqual([60, 219]);
    expect(gunmanFlankPosition(7, 0)).toEqual([0, 1]);
    expect(gunmanFlankPosition(7, 64 / NES_FRAME_RATE)).toEqual([47, 33]);
    expect(gunmanFlankPosition(7, 338 / NES_FRAME_RATE)).toEqual([192, 214]);
    expect(gunmanFlankPosition(7, 641 / NES_FRAME_RATE)).toEqual([158, 219]);
    expect(gunmanFlankPosition(8, 247 / NES_FRAME_RATE)).toEqual([0, 82]);
    expect(gunmanFlankPosition(8, 309 / NES_FRAME_RATE)).toEqual([51, 128]);
    expect(gunmanFlankPosition(9, 50 / NES_FRAME_RATE)).toEqual([-48, 30]);
    expect(gunmanFlankPosition(9, 358 / NES_FRAME_RATE)).toEqual([-188, -89]);
    expect(gunmanFlankPosition(9, 825 / NES_FRAME_RATE)).toEqual([7, 69]);
    expect(gunmanFlankLifetime(8, 48, 6, 0, false, 2991)).toBeCloseTo(1055 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(8, 0, 48, 6, 0, false, 2991)).toEqual([246 / 256, 1 + 60 / 256]);
    expect(gunmanFlankPosition(8, 1054 / NES_FRAME_RATE, 48, 6, 0, false, 2991)).toEqual([135 + 191 / 256, 155 + 103 / 256]);
    expect(gunmanFlankPosition(8, 96 / NES_FRAME_RATE, 32)).toEqual([80, 32]);
    expect(gunmanFlankPosition(8, 250 / NES_FRAME_RATE, 32)).toEqual([80, 83]);
    expect(gunmanFlankLifetime(7, 32, 2, 1, false, 351)).toBeCloseTo(312 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 300 / NES_FRAME_RATE, 32, 2, 1, false, 351)).toEqual([202, 205]);
    expect(gunmanFlankPosition(7, 311 / NES_FRAME_RATE, 32, 2, 1, false, 351)).toEqual([204, 219]);
    expect(gunmanFlankLifetime(7, 32, 2, 0, false, 399)).toBeCloseTo(618 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 300 / NES_FRAME_RATE, 32, 2, 0, false, 399)).toEqual([187, 180]);
    expect(gunmanFlankPosition(7, 617 / NES_FRAME_RATE, 32, 2, 0, false, 399)).toEqual([187, -32]);
    expect(gunmanFlankLifetime(8, 32, 2, 0, false, 655)).toBeCloseTo(570 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(8, 0, 32, 2, 0, false, 655)).toEqual([1, 1]);
    expect(gunmanFlankPosition(8, 569 / NES_FRAME_RATE, 32, 2, 0, false, 655)).toEqual([120, -32]);
    expect(gunmanFlankLifetime(7, 48, 2, 0, false, 1135)).toBeCloseTo(307 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 300 / NES_FRAME_RATE, 48, 2, 0, false, 1135)).toEqual([191, 195]);
    expect(gunmanFlankPosition(7, 306 / NES_FRAME_RATE, 48, 2, 0, false, 1135)).toEqual([188, 203]);
    expect(gunmanFlankLifetime(7, 64, 2, 0, false, 1167)).toBeCloseTo(299 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 200 / NES_FRAME_RATE, 64, 2, 0, false, 1167)).toEqual([136, 116]);
    expect(gunmanFlankPosition(7, 298 / NES_FRAME_RATE, 64, 2, 0, false, 1167)).toEqual([191, 187]);
    expect(gunmanFlankLifetime(7, 48, 2, 0, true, 1231)).toBeCloseTo(522 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 64 / NES_FRAME_RATE, 48, 2, 0, true, 1231)).toEqual([46, 35]);
    expect(gunmanFlankPosition(7, 521 / NES_FRAME_RATE, 48, 2, 0, true, 1231)).toEqual([108, -48]);
    expect(gunmanFlankLifetime(7, 32, 2, 1, false, 1407)).toBeCloseTo(774 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 300 / NES_FRAME_RATE, 32, 2, 1, false, 1407)).toEqual([175, 134]);
    expect(gunmanFlankPosition(7, 773 / NES_FRAME_RATE, 32, 2, 1, false, 1407)).toEqual([188, 219]);
    expect(gunmanFlankLifetime(8, 32, 2, 1, false, 1599)).toBeCloseTo(917 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(8, 300 / NES_FRAME_RATE, 32, 2, 1, false, 1599)).toEqual([175, 121]);
    expect(gunmanFlankPosition(8, 916 / NES_FRAME_RATE, 32, 2, 1, false, 1599)).toEqual([-4, -13]);
    expect(gunmanFlankLifetime(9, 32, 2, 0, true, 1807)).toBeCloseTo(981 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(9, 300 / NES_FRAME_RATE, 32, 2, 0, true, 1807)).toEqual([-124, 121]);
    expect(gunmanFlankPosition(9, 980 / NES_FRAME_RATE, 32, 2, 0, true, 1807)).toEqual([-51, 219]);
    expect(gunmanFlankLifetime(7, 64, 2, 0, false, 1903)).toBeCloseTo(732 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 300 / NES_FRAME_RATE, 64, 2, 0, false, 1903)).toEqual([67, 123]);
    expect(gunmanFlankPosition(7, 731 / NES_FRAME_RATE, 64, 2, 0, false, 1903)).toEqual([193, 187]);
    expect(gunmanFlankLifetime(7, 48, 2, 0, false, 1967)).toBeCloseTo(678 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 300 / NES_FRAME_RATE, 48, 2, 0, false, 1967)).toEqual([175, 105]);
    expect(gunmanFlankPosition(7, 677 / NES_FRAME_RATE, 48, 2, 0, false, 1967)).toEqual([137, -48]);
    expect(gunmanFlankLifetime(9, 32, 2, 0, true, 911)).toBeCloseTo(963 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(9, 300 / NES_FRAME_RATE, 32, 2, 0, true, 911)).toEqual([-140, 114]);
    expect(gunmanFlankPosition(9, 962 / NES_FRAME_RATE, 32, 2, 0, true, 911)).toEqual([-68, 218]);
    expect(gunmanFlankLifetime(9, 48, 2, 0, true, 943)).toBeCloseTo(849 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(9, 0, 48, 2, 0, true, 943)).toEqual([-1, 1]);
    expect(gunmanFlankPosition(9, 848 / NES_FRAME_RATE, 48, 2, 0, true, 943)).toEqual([-70, 203]);
    expect(gunmanFlankLifetime(9, 64, 2, 0, true, 975)).toBeCloseTo(676 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(9, 300 / NES_FRAME_RATE, 64, 2, 0, true, 975)).toEqual([-87, 89]);
    expect(gunmanFlankPosition(9, 675 / NES_FRAME_RATE, 64, 2, 0, true, 975)).toEqual([-57, 187]);
    expect(gunmanFlankLifetime(8, 32, 2, 0, false, 623)).toBeCloseTo(569 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(8, 300 / NES_FRAME_RATE, 32, 2, 0, false, 623)).toEqual([127, 114]);
    expect(gunmanFlankPosition(8, 568 / NES_FRAME_RATE, 32, 2, 0, false, 623)).toEqual([120, -32]);
    expect(gunmanFlankPosition(9, 96 / NES_FRAME_RATE, 32)).toEqual([-80, 32]);
    expect(gunmanFlankPosition(9, 250 / NES_FRAME_RATE, 32)).toEqual([-93, 83]);
    expect(gunmanFlankPosition(9, 962 / NES_FRAME_RATE, 32)).toEqual([-68, 217]);
    expect(gunmanFlankPosition(8, 96 / NES_FRAME_RATE, 64)).toEqual([79, 32]);
    expect(gunmanFlankPosition(8, 250 / NES_FRAME_RATE, 64)).toEqual([119, 15]);
    expect(gunmanFlankLifetime(8, 64, 2, 0, false, 207)).toBeCloseTo(371 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(8, 0, 64, 2, 0, false, 207)).toEqual([1, 1]);
    expect(gunmanFlankPosition(8, 370 / NES_FRAME_RATE, 64, 2, 0, false, 207)).toEqual([120, -64]);
    expect(gunmanFlankPosition(8, 370 / NES_FRAME_RATE, 64)).toEqual([119, -65]);
    expect(gunmanFlankLifetime(7, 64, 2, 0, true, 2671)).toBeCloseTo(360 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 64 / NES_FRAME_RATE, 64, 2, 0, true, 2671)).toEqual([46, 35]);
    expect(gunmanFlankPosition(7, 359 / NES_FRAME_RATE, 64, 2, 0, true, 2671)).toEqual([248, 82]);
    expect(gunmanFlankPosition(8, 96 / NES_FRAME_RATE, 64, 3, 1)).toEqual([0, 31.870445344129553]);
    expect(gunmanFlankPosition(9, 96 / NES_FRAME_RATE, 64, 3)).toEqual([-69.1025641025641, 38.66666666666667]);
    expect(gunmanFlankPosition(8, 96 / NES_FRAME_RATE, 64, 3, 0)).toEqual([31, 32]);
    expect(gunmanFlankPosition(8, 378 / NES_FRAME_RATE, 64, 3, 0)).toEqual([203, 186]);
    expect([gunmanFlankLifetime(7, 64, 3, 1), gunmanFlankLifetime(7, 64, 3, 1, true)]).toEqual([581, 384].map((frames) => frames / NES_FRAME_RATE));
    expect(gunmanFlankPosition(7, 64 / NES_FRAME_RATE, 64, 3, 1)).toEqual([48, 31]);
    expect(gunmanFlankPosition(7, 64 / NES_FRAME_RATE, 64, 3, 1, true)).toEqual([-45, 34]);
    expect(gunmanFlankPosition(7, 580 / NES_FRAME_RATE, 64, 3, 1)).toEqual([187, -65]);
    expect(gunmanFlankPosition(7, 383 / NES_FRAME_RATE, 64, 3, 1, true)).toEqual([-248, 34]);
    expect([gunmanFlankLifetime(7, 32, 6), gunmanFlankLifetime(7, 32, 6, 0, true), gunmanFlankLifetime(7, 64, 6)]).toEqual([342, 453, 918].map((frames) => frames / NES_FRAME_RATE));
    expect(gunmanFlankPosition(7, 103 / NES_FRAME_RATE, 32, 6)).toEqual([58, 82]);
    expect(gunmanFlankPosition(7, 64 / NES_FRAME_RATE, 32, 6, 0, true)).toEqual([-46, 33]);
    expect(gunmanFlankPosition(7, 234 / NES_FRAME_RATE, 64, 6)).toEqual([163, 110]);
    expect(gunmanFlankLifetime(8, 32, 6, 1)).toEqual(447 / NES_FRAME_RATE);
    expect(gunmanFlankPosition(8, 116 / NES_FRAME_RATE, 32, 6, 1)).toEqual([95, 38]);
    expect(gunmanFlankPosition(8, 446 / NES_FRAME_RATE, 32, 6, 1)).toEqual([168, -33]);
    expect(gunmanFlankLifetime(8, 32, 6, 0)).toEqual(578 / NES_FRAME_RATE);
    expect(gunmanFlankPosition(8, 116 / NES_FRAME_RATE, 32, 6, 0)).toEqual([95, 38]);
    expect(gunmanFlankPosition(8, 577 / NES_FRAME_RATE, 32, 6, 0)).toEqual([175, -33]);
    expect(gunmanFlankLifetime(9, 48, 6, 1, true)).toEqual(776 / NES_FRAME_RATE);
    expect(gunmanFlankPosition(9, 96 / NES_FRAME_RATE, 48, 6, 1, true)).toEqual([-79, 32]);
    expect(gunmanFlankPosition(9, 775 / NES_FRAME_RATE, 48, 6, 1, true)).toEqual([-33, 202]);
  });

  it("advances untraced flank Gunmen through the ROM movement states", () => {
    expect(gunmanFlankUsesDynamicState(8, 32, 2, 1, 703)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 32, 2, 0, 655)).toBe(false);
    expect(gunmanFlankUsesDynamicState(7, 80, 4, 1, 1503, true)).toBe(true);
    expect(gunmanTopUsesDynamicState(4, 95)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 95, 120)).toEqual([22]);
    expect(gunmanBottomUsesDynamicState(4, 447)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 447, 192)).toEqual([]);
    expect(gunmanBottomUsesDynamicState(4, 479)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 479, 192)).toEqual([]);
    expect(gunmanFlankEventShotFrames(4, 479, 224)).toEqual([307, 627]);
    expect(gunmanTopUsesDynamicState(4, 639)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 639)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 639, 184)).toEqual([47]);
    expect(gunmanFlankEventShotFrames(4, 639, 208)).toEqual([53]);
    expect(gunmanTopUsesDynamicState(4, 671)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 671)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 671, 184)).toEqual([13, 269, 461]);
    expect(gunmanFlankEventShotFrames(4, 671, 216)).toEqual([]);
    expect(gunmanTopUsesDynamicState(4, 703)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 703)).toBe(false);
    expect(gunmanFlankEventShotFrames(4, 703, 184)).toEqual([63]);
    expect(gunmanFlankEventShotFrames(4, 703, 232)).toEqual([24]);
    expect(gunmanTopUsesDynamicState(4, 735)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 735, 232)).toEqual([21]);
    expect(gunmanBottomUsesDynamicState(4, 863)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 879)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 895)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 863, 216)).toEqual([53]);
    expect(gunmanFlankEventShotFrames(4, 879, 240)).toEqual([]);
    expect(gunmanFlankEventShotFrames(4, 895, 192)).toEqual([]);
    expect(gunmanBottomUsesDynamicState(4, 975)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 1007)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 1039)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 975, 216)).toEqual([56]);
    expect(gunmanFlankEventShotFrames(4, 1007, 232)).toEqual([]);
    expect(gunmanFlankEventShotFrames(4, 1039, 216)).toEqual([64]);
    expect(gunmanTopUsesDynamicState(4, 1055)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 1055, 136)).toEqual([31]);
    expect(gunmanBottomUsesDynamicState(4, 1151)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 1167)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 1151, 224)).toEqual([103]);
    expect(gunmanFlankEventShotFrames(4, 1167, 184)).toEqual([]);
    expect(gunmanBottomUsesDynamicState(4, 1327)).toBe(true);
    expect(gunmanTopUsesDynamicState(4, 1343)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 1343)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 1327, 184)).toEqual([]);
    expect(gunmanFlankEventShotFrames(4, 1327, 232)).toEqual([]);
    expect(gunmanFlankEventShotFrames(4, 1343, 152)).toEqual([67, 259]);
    expect(gunmanFlankEventShotFrames(4, 1343, 208)).toEqual([57]);
    expect(gunmanTopUsesDynamicState(4, 1487)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 1487, 56)).toEqual([13]);
    expect(gunmanTopUsesDynamicState(4, 1519)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 1519, 56)).toEqual([68]);
    expect(gunmanBottomUsesDynamicState(4, 1535, 160)).toBe(false);
    expect(gunmanBottomUsesDynamicState(4, 1535, 208)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 1535, 208)).toEqual([]);
    expect(gunmanBottomUsesDynamicState(4, 1615, 152)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 1615, 208)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 1647, 120)).toBe(true);
    expect(gunmanBottomUsesDynamicState(4, 1679, 112)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 1615, 152)).toEqual([214]);
    expect(gunmanFlankEventShotFrames(4, 1615, 208)).toEqual([]);
    expect(gunmanFlankEventShotFrames(4, 1647, 120)).toEqual([143]);
    expect(gunmanFlankEventShotFrames(4, 1679, 112)).toEqual([]);
    expect(gunmanBottomUsesDynamicState(4, 1727, 32)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 1727, 32)).toEqual([]);
    expect(gunmanTopUsesDynamicState(4, 127)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 127, 120)).toEqual([13, 585]);
    expect(gunmanTopUsesDynamicState(4, 159)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 159, 120)).toEqual([64]);
    expect(gunmanFlankEventShotFrames(4, 159, 216)).toEqual([28, 746, 1002]);
    expect(gunmanTopUsesDynamicState(4, 191)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 191, 216)).toEqual([23, 279, 970]);
    expect(gunmanTopUsesDynamicState(4, 207)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 207, 152)).toEqual([19]);
    expect(gunmanTopUsesDynamicState(4, 223)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 223, 216)).toEqual([13, 269]);
    expect(gunmanTopUsesDynamicState(4, 239)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 239, 152)).toEqual([13, 205]);
    expect(gunmanTopUsesDynamicState(4, 271)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 271, 168)).toEqual([43]);
    expect(gunmanTopUsesDynamicState(4, 287)).toBe(true);
    expect(gunmanFlankEventShotFrames(4, 287, 216)).toEqual([75]);
    expect(gunmanFlankUsesDynamicState(7, 96, 4, 1, 1727, true)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 48, 4, 0, 1743, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 64, 4, 1, 1695, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 80, 4, 1, 2527, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 80, 3, 0, 4239, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 64, 3, 1, 4255, true)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 64, 3, 0, 687, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 64, 3, 0, 1711, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 64, 3, 0, 1647, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 48, 3, 1, 319, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 64, 3, 1, 255, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 80, 3, 1, 959, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 48, 3, 1, 4831, true)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 80, 3, 1, 4863, true)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 96, 3, 1, 1119, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 64, 3, 0, 1071, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 48, 3, 1, 3775, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 96, 3, 0, 3823, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 96, 6, 1, 2207, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 32, 6, 1, 159, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 32, 6, 1, 607, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 32, 6, 0, 207, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 32, 6, 1, 2943, false)).toBe(true);
    expect(gunmanFlankFirstOpportunityFrame(116, 32, 6, 8, 1, 2943)).toBe(655);
    expect(gunmanFlankUsesDynamicState(8, 32, 6, 0, 3023, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 32, 6, 0, 3727, false)).toBe(true);
    expect(gunmanFlankEventShotFrames(6, 3727)).toEqual([68, 132, 196, 719, 847, 911]);
    expect(gunmanFlankEventShotFrames(6, 511)).toEqual([54, 118, 182]);
    expect(gunmanFlankEventShotFrames(6, 607)).toEqual([75, 139]);
    expect(gunmanFlankEventShotFrames(6, 1135, 4)).toEqual([64]);
    expect(gunmanFlankEventShotFrames(6, 1135, 248)).toEqual([80, 400]);
    expect(gunmanFlankEventShotFrames(6, 207)).toEqual([79, 143, 207]);
    expect(gunmanFlankUsesDynamicState(8, 48, 6, 1, 5119, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(8, 32, 6, 1, 1375, false)).toBe(true);
    expect(gunmanFlankEventShotFrames(6, 5119)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 1375, 4)).toEqual([45, 109, 173, 237]);
    expect(gunmanFlankEventShotFrames(6, 1375, 136)).toEqual([]);
    expect(gunmanFlankUsesDynamicState(9, 32, 6, 1, 2783, true)).toBe(true);
    expect(gunmanFlankUsesDynamicState(9, 48, 6, 1, 511, true)).toBe(true);
    expect(gunmanFlankUsesDynamicState(9, 32, 6, 0, 3919, true)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 48, 6, 1, 4543, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 32, 6, 0, 1135, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 32, 6, 0, 1135, true)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 64, 6, 1, 2463, false)).toBe(false);
    expect(gunmanFlankUsesDynamicState(7, 64, 6, 1, 2463, true)).toBe(true);
    expect(gunmanFlankLifetime(7, 48, 5, 0, false, 1135)).toBeCloseTo(1107 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 0, 48, 5, 0, false, 1135, 24, 221)).toEqual([0, 1]);
    expect(gunmanFlankPosition(7, 456 / NES_FRAME_RATE, 48, 5, 0, false, 1135, 24, 221)).toEqual([102.0078125, 176.28515625]);
    expect(gunmanFlankLifetime(7, 64, 5, 0, false, 1711)).toBeCloseTo(285 / NES_FRAME_RATE, 9);
    expect(gunmanFlankPosition(7, 0, 64, 5, 0, false, 1711, 116, 36)).toEqual([0, 1]);
    expect(gunmanFlankUsesDynamicState(7, 64, 5, 1, 1759, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 96, 5, 0, 1679, true)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 1679, 248)).toEqual([73, 393]);
    expect(gunmanBottomUsesDynamicState(5, 1871, 48)).toBe(true);
    expect(gunmanBottomUsesDynamicState(5, 1871, 96)).toBe(false);
    expect(gunmanFlankEventShotFrames(5, 1871, 48)).toEqual([437]);
    expect(gunmanBottomUsesDynamicState(5, 1967)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 1967, 56)).toEqual([167]);
    expect(gunmanTopUsesDynamicState(5, 1887)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 1887, 24)).toEqual([38, 358]);
    expect(gunmanTopUsesDynamicState(5, 1999)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 1999, 64)).toEqual([69]);
    expect(gunmanTopUsesDynamicState(5, 2095)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2095, 184)).toEqual([13, 792, 920]);
    expect(gunmanFlankEventShotFrames(5, 2095, 208)).toEqual([65, 321]);
    expect(gunmanFlankEventShotFrames(5, 2095, 240)).toEqual([105, 361]);
    expect(gunmanTopUsesDynamicState(5, 2175)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2175, 208)).toEqual([13]);
    expect(gunmanTopUsesDynamicState(5, 2207)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2207, 224)).toEqual([92]);
    expect(gunmanTopUsesDynamicState(5, 2287)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2287, 224)).toEqual([18, 338, 402]);
    expect(gunmanTopUsesDynamicState(5, 2463)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2463, 40)).toEqual([13, 269, 333, 461, 589]);
    expect(gunmanTopUsesDynamicState(5, 2655)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2655, 208)).toEqual([26]);
    expect(gunmanTopUsesDynamicState(5, 2671)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2671, 184)).toEqual([13]);
    expect(gunmanTopUsesDynamicState(5, 2735)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2735, 104)).toEqual([55]);
    expect(gunmanFlankEventShotFrames(5, 2735, 160)).toEqual([28]);
    expect(gunmanTopUsesDynamicState(5, 2015)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2015, 88)).toEqual([50, 370, 562]);
    expect(gunmanTopUsesDynamicState(5, 2879)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2879, 24)).toEqual([20]);
    expect(gunmanTopUsesDynamicState(5, 2895)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2895, 104)).toEqual([56]);
    expect(gunmanFlankEventShotFrames(5, 2895, 192)).toEqual([42, 362]);
    expect(gunmanTopUsesDynamicState(5, 2911)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 2911, 128)).toEqual([37]);
    expect(gunmanFlankEventShotFrames(5, 2911, 160)).toEqual([64]);
    expect(gunmanFlankEventShotFrames(5, 2911, 184)).toEqual([13, 397]);
    expect(gunmanTopUsesDynamicState(5, 3023)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 3023, 168)).toEqual([33, 225]);
    expect(gunmanFlankEventShotFrames(5, 3023, 248)).toEqual([93]);
    expect(gunmanFlankUsesDynamicState(7, 32, 5, 0, 1903, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 112, 5, 0, 1999, false)).toBe(true);
    expect(gunmanFlankUsesDynamicState(7, 64, 5, 0, 2735, false)).toBe(true);
    expect(gunmanTopUsesDynamicState(5, 1759)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 1759, 88)).toEqual([57]);
    expect(gunmanTopUsesDynamicState(5, 1775)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 1775, 112)).toEqual([35]);
    expect(gunmanBottomUsesDynamicState(5, 1727)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 1727, 56)).toEqual([168]);
    expect(gunmanFlankEventShotFrames(6, 159, 4)).toEqual([87, 151]);
    expect(gunmanFlankEventShotFrames(6, 2207, 4)).toEqual([194, 450]);
    expect(gunmanFlankEventShotFrames(6, 2783, 248)).toEqual([31, 532, 852]);
    expect(gunmanFlankEventShotFrames(6, 2943, 4)).toEqual([655]);
    expect(gunmanFlankEventShotFrames(6, 2991, 4)).toEqual([256]);
    expect(gunmanFlankEventShotFrames(6, 3055, 112)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 3295, 64)).toEqual([62, 574]);
    expect(gunmanFlankEventShotFrames(6, 3487, 168)).toEqual([13, 77, 240]);
    expect(gunmanFlankEventShotFrames(6, 3551, 88)).toEqual([60, 124, 188, 252, 316]);
    expect(gunmanFlankEventShotFrames(6, 3711, 136)).toEqual([66]);
    expect(gunmanFlankEventShotFrames(6, 3919, 248)).toEqual([26, 90, 154, 218, 399, 527, 655, 1039]);
    expect(gunmanFlankEventShotFrames(6, 4319, 200)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 4543, 4)).toEqual([102]);
    expect(gunmanFlankEventShotFrames(6, 175, 152)).toEqual([]);
    expect(gunmanFlankEventShotFrames(2, 703, 4)).toEqual([64, 128, 192, 309]);
    expect(gunmanFlankEventShotFrames(2, 1375, 4)).toEqual([79, 796, 1116, 1180, 1500]);
    expect(gunmanFlankEventShotFrames(2, 1839, 248)).toEqual([45, 109, 173, 237, 546]);
    expect(gunmanFlankEventShotFrames(3, 255, 4)).toEqual([94]);
    expect(gunmanFlankEventShotFrames(3, 319, 4)).toEqual([64, 320]);
    expect(gunmanFlankEventShotFrames(3, 687, 4)).toEqual([98]);
    expect(gunmanFlankEventShotFrames(3, 959, 4)).toEqual([69]);
    expect(gunmanFlankEventShotFrames(3, 1071, 4)).toEqual([]);
    expect(gunmanFlankEventShotFrames(3, 1119, 4)).toEqual([]);
    expect(gunmanFlankEventShotFrames(3, 1647, 4)).toEqual([64]);
    expect(gunmanFlankEventShotFrames(3, 1711, 4)).toEqual([64]);
    expect(gunmanFlankEventShotFrames(3, 3775, 4)).toEqual([]);
    expect(gunmanFlankEventShotFrames(3, 3823, 4)).toEqual([]);
    expect(gunmanFlankEventShotFrames(3, 4239, 4)).toEqual([78]);
    expect(gunmanFlankEventShotFrames(3, 4255, 248)).toEqual([99, 336]);
    expect(gunmanFlankEventShotFrames(3, 4831, 248)).toEqual([64, 320]);
    expect(gunmanFlankEventShotFrames(3, 4863, 248)).toEqual([76]);
    expect(gunmanFlankEventShotFrames(4, 1503, 248)).toEqual([70]);
    expect(gunmanFlankEventShotFrames(4, 1695, 4)).toEqual([64]);
    expect(gunmanFlankEventShotFrames(4, 1727, 248)).toEqual([79]);
    expect(gunmanFlankEventShotFrames(4, 1743, 4)).toEqual([73]);
    expect(gunmanFlankEventShotFrames(4, 2527, 4)).toEqual([64]);
    expect(gunmanFlankEventShotFrames(4, 1343, 216)).toEqual([13, 461]);
    expect(gunmanFlankEventShotFrames(5, 1759, 4)).toEqual([106]);
    expect(gunmanFlankEventShotFrames(5, 1903, 4)).toEqual([68, 452, 836]);
    expect(gunmanFlankEventShotFrames(5, 1999, 4)).toEqual([64]);
    expect(gunmanFlankEventShotFrames(5, 2735, 4)).toEqual([64]);
    expect(gunmanFlankEventShotFrames(5, 1135, 4)).toEqual([112, 304, 368, 432, 693]);

    const round5Actor = createGunmanFlankMovementState(7, 4, 32, false, 48, 68);
    for (let frame = 1; frame <= 1026; frame += 1) {
      const scroll = (1903 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Actor, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Actor).toMatchObject({ frame: 1026, mode: "chase", heading: 0, timer: 1, x: 159 + 86 / 256, y: 98 + 96 / 256, dead: false });
    for (let frame = 1027; frame <= 1488; frame += 1) {
      const scroll = (1903 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Actor, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Actor).toMatchObject({ frame: 1488, mode: "orbit", heading: 2, timer: 1, x: 148 + 204 / 256, y: 252 + 7 / 256, dead: true });

    const loopingRound5Actor = createGunmanFlankMovementState(7, 4, 112, false, 78, 17);
    for (let frame = 1; frame <= 392; frame += 1) {
      const scroll = (1999 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(loopingRound5Actor, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(loopingRound5Actor).toMatchObject({ frame: 392, mode: "orbit", heading: 26, timer: 4, x: 134 / 256, y: 151 + 87 / 256, dead: false });
    const loopingRound5ReleaseScroll = (1999 + 2 / 3 + 393 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(loopingRound5Actor, 393, 104, 216, (x, y) => roundActorCollisionAtNes(5, loopingRound5ReleaseScroll, x, y));
    expect(loopingRound5Actor.dead).toBe(true);

    const lateRound5Actor = createGunmanFlankMovementState(7, 4, 64, false, 204, 7);
    for (let frame = 1; frame <= 283; frame += 1) {
      const scroll = (2735 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(lateRound5Actor, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(lateRound5Actor).toMatchObject({ frame: 283, mode: "orbit", heading: 19, timer: 3, x: 175 + 174 / 256, y: 252 + 157 / 256, dead: true });

    const round5Bottom1727 = createGunmanBottomMovementState(56, 220, 235);
    const round5Bottom1727PlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 49; frame <= 199; frame += 1) {
      const scroll = (1727 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 76 ? 216 : round5Bottom1727PlayerY[Math.min(frame - 76, round5Bottom1727PlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5Bottom1727, frame, 104, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Bottom1727).toMatchObject({ frame: 199, mode: "orbit", heading: 8, timer: 0, x: 95 + 200 / 256, y: 218 + 55 / 256, dead: false });

    const rightRound5At1679 = createGunmanFlankMovementState(7, 248, 96, true, 112, 90);
    for (let frame = 1; frame <= 641; frame += 1) {
      const scroll = (1679 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(rightRound5At1679, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(rightRound5At1679).toMatchObject({ frame: 641, mode: "orbit", heading: 23, timer: 4, x: 164 + 249 / 256, y: 251 + 133 / 256, dead: false });
    const rightRound5At1679ReleaseScroll = (1679 + 2 / 3 + 642 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(rightRound5At1679, 642, 104, 216, (x, y) => roundActorCollisionAtNes(5, rightRound5At1679ReleaseScroll, x, y));
    expect(rightRound5At1679.dead).toBe(true);

    const round4Top95 = createGunmanTopMovementState(120, 44, 5);
    for (let frame = 1; frame <= 934; frame += 1) {
      const scroll = (95 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Top95, frame, 136, 188, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Top95).toMatchObject({ frame: 934, mode: "orbit", heading: 29, timer: 0, x: 133 + 17 / 256, y: 200 + 13 / 256, dead: false });

    const round4Bottom447 = createGunmanBottomMovementState(192, 0, 93);
    for (let frame = 49; frame <= 128; frame += 1) {
      const scroll = (447 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Bottom447, frame, 136, 188, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom447).toMatchObject({ frame: 128, mode: "orbit", heading: 7, timer: 3, x: 255 + 56 / 256, y: 228 + 196 / 256, dead: false });

    const round4Bottom479Routes = [
      { state: createGunmanBottomMovementState(192, 0, 93), last: 548, heading: 1, timer: 1, x: 247 + 84 / 256, y: 0 + 240 / 256 },
      { state: createGunmanBottomMovementState(224, 44, 5), last: 854, heading: 15, timer: 4, x: 242 + 57 / 256, y: 251 + 28 / 256 },
    ] as const;
    for (const route of round4Bottom479Routes) {
      for (let frame = 49; frame <= route.last; frame += 1) {
        const scroll = (479 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        const playerX = frame >= 267 ? 168 : frame >= 219 ? 152 : 136;
        const playerY = frame >= 264 && frame < 267 ? 216 : frame >= 135 && frame < 219 ? Math.min(216, 188 + Math.floor((frame - 135) / 3) + 1) : frame >= 219 ? 215 : 188;
        advanceGunmanFlankMovement(route.state, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round4Top639 = createGunmanTopMovementState(184, 182, 188);
    for (let frame = 1; frame <= 338; frame += 1) {
      const scroll = (639 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Top639, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Top639).toMatchObject({ frame: 338, mode: "orbit", heading: 25, timer: 1, x: 0 + 198 / 256, y: 191 + 194 / 256, dead: false });

    const round4Bottom639 = createGunmanBottomMovementState(208, 0, 93);
    for (let frame = 49; frame <= 149; frame += 1) {
      const scroll = (639 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Bottom639, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom639).toMatchObject({ frame: 149, mode: "orbit", heading: 24, timer: 0, x: 125 + 48 / 256, y: 251 + 93 / 256, dead: false });

    const round4At671Routes = [
      { state: createGunmanTopMovementState(184, 182, 188), first: 1, last: 500, heading: 12, timer: 2, x: 172 + 89 / 256, y: 203 + 44 / 256 },
      { state: createGunmanBottomMovementState(216, 0, 93), first: 49, last: 149, heading: 24, timer: 0, x: 133 + 48 / 256, y: 251 + 93 / 256 },
    ] as const;
    for (const route of round4At671Routes) {
      for (let frame = route.first; frame <= route.last; frame += 1) {
        const scroll = (671 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round4At703Routes = [
      { state: createGunmanTopMovementState(184, 0, 93), last: 542, heading: 11, timer: 0, x: 216 + 38 / 256, y: 250 + 190 / 256 },
      { state: createGunmanTopMovementState(232, 44, 5), last: 474, heading: 15, timer: 4, x: 240 + 222 / 256, y: 251 + 134 / 256 },
    ] as const;
    for (const route of round4At703Routes) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (703 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round4Top735 = createGunmanTopMovementState(232, 44, 5);
    for (let frame = 1; frame <= 706; frame += 1) {
      const scroll = (735 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Top735, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Top735).toMatchObject({ frame: 706, mode: "orbit", heading: 1, timer: 3, x: 255 + 241 / 256, y: 98 + 99 / 256, dead: false });

    const round4BottomTailRoutes = [
      { at: 863, state: createGunmanBottomMovementState(216, 182, 188), last: 149, heading: 24, timer: 0, x: 133 + 230 / 256, y: 251 + 188 / 256 },
      { at: 879, state: createGunmanBottomMovementState(240, 182, 188), last: 404, heading: 0, timer: 2, x: 223 + 180 / 256, y: 0 + 42 / 256 },
      { at: 895, state: createGunmanBottomMovementState(192, 182, 188), last: 67, heading: 24, timer: 3, x: 177 + 206 / 256, y: 224 + 188 / 256 },
    ] as const;
    for (const route of round4BottomTailRoutes) {
      for (let frame = 49; frame <= route.last; frame += 1) {
        const scroll = (route.at + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round4LaterBottomRoutes = [
      { at: 975, state: createGunmanBottomMovementState(216, 0, 93), last: 515, heading: 0, timer: 0, x: 140 + 164 / 256, y: 0 + 93 / 256 },
      { at: 1007, state: createGunmanBottomMovementState(232, 182, 188), last: 389, heading: 0, timer: 2, x: 223 + 252 / 256, y: 0 + 42 / 256 },
      { at: 1039, state: createGunmanBottomMovementState(216, 182, 188), last: 149, heading: 24, timer: 0, x: 133 + 230 / 256, y: 251 + 188 / 256 },
    ] as const;
    for (const route of round4LaterBottomRoutes) {
      for (let frame = 49; frame <= route.last; frame += 1) {
        const scroll = (route.at + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round4Top1055 = createGunmanTopMovementState(136, 182, 188);
    for (let frame = 1; frame <= 296; frame += 1) {
      const scroll = (1055 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Top1055, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Top1055).toMatchObject({ frame: 296, mode: "orbit", heading: 23, timer: 3, x: 229 + 154 / 256, y: 251 + 154 / 256, dead: false });

    const round4Bottom1151 = createGunmanBottomMovementState(224, 0, 93);
    for (let frame = 49; frame <= 317; frame += 1) {
      const scroll = (1151 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Bottom1151, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom1151).toMatchObject({ frame: 317, mode: "orbit", heading: 1, timer: 1, x: 255 + 235 / 256, y: 92 + 38 / 256, dead: false });

    const round4Bottom1167 = createGunmanBottomMovementState(184, 0, 93);
    for (let frame = 49; frame <= 57; frame += 1) {
      const scroll = (1167 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Bottom1167, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom1167).toMatchObject({ frame: 57, mode: "orbit", heading: 24, timer: 3, x: 177 + 96 / 256, y: 221 + 93 / 256, dead: false });

    const round4At1327Routes = [
      { state: createGunmanBottomMovementState(184, 182, 188), last: 58, mode: "orbit" as const, heading: 24, timer: 4, x: 177 + 66 / 256, y: 221 + 188 / 256 },
      { state: createGunmanBottomMovementState(232, 0, 93), last: 388, mode: "orbit" as const, heading: 0, timer: 1, x: 223 + 70 / 256, y: 0 + 203 / 256 },
    ] as const;
    for (const route of round4At1327Routes) {
      for (let frame = 49; frame <= route.last; frame += 1) {
        const scroll = (1327 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: route.mode, heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round4At1343Routes = [
      { state: createGunmanTopMovementState(152, 0, 93), last: 577, heading: 0, timer: 3, x: 223 + 248 / 256, y: 0 + 9 / 256 },
      { state: createGunmanBottomMovementState(208, 44, 5), last: 287, heading: 0, timer: 3, x: 124 + 136 / 256, y: 251 + 5 / 256 },
    ] as const;
    for (const route of round4At1343Routes) {
      for (let frame = route.state === round4At1343Routes[0].state ? 1 : 49; frame <= route.last; frame += 1) {
        const scroll = (1343 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: route.state === round4At1343Routes[1].state ? "chase" : "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round4Top1487 = createGunmanTopMovementState(56, 70, 182);
    for (let frame = 1; frame <= 335; frame += 1) {
      const scroll = (1487 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Top1487, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Top1487).toMatchObject({ frame: 335, mode: "orbit", heading: 14, timer: 2, x: 237 + 27 / 256, y: 250 + 255 / 256, dead: false });

    const round4Top1519 = createGunmanTopMovementState(56, 182, 188);
    for (let frame = 1; frame <= 342; frame += 1) {
      const scroll = (1519 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Top1519, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Top1519).toMatchObject({ frame: 342, mode: "orbit", heading: 17, timer: 0, x: 240 + 136 / 256, y: 251 + 29 / 256, dead: false });

    const round4Bottom1535 = createGunmanBottomMovementState(208, 44, 5);
    for (let frame = 49; frame <= 149; frame += 1) {
      const scroll = (1535 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Bottom1535, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom1535).toMatchObject({ frame: 149, mode: "orbit", heading: 24, timer: 0, x: 125 + 92 / 256, y: 251 + 5 / 256, dead: false });

    const round4TailBottomRoutes = [
      { at: 1615, state: createGunmanBottomMovementState(152, 182, 188), last: 299, mode: "orbit" as const, heading: 8, timer: 0, x: 216 + 122 / 256, y: 251 + 8 / 256 },
      { at: 1615, state: createGunmanBottomMovementState(208, 0, 93), last: 149, mode: "orbit" as const, heading: 24, timer: 0, x: 125 + 48 / 256, y: 251 + 93 / 256 },
      { at: 1647, state: createGunmanBottomMovementState(120, 0, 93), last: 190, mode: "orbit" as const, heading: 8, timer: 1, x: 159 + 192 / 256, y: 214 + 169 / 256 },
      { at: 1679, state: createGunmanBottomMovementState(112, 182, 188), last: 332, mode: "orbit" as const, heading: 21, timer: 1, x: 242 + 129 / 256, y: 250 + 242 / 256 },
    ] as const;
    for (const route of round4TailBottomRoutes) {
      for (let frame = 49; frame <= route.last; frame += 1) {
        const scroll = (route.at + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: route.mode, heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round4Bottom1727 = createGunmanBottomMovementState(32, 182, 188);
    for (let frame = 49; frame <= 422; frame += 1) {
      const scroll = (1727 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Bottom1727, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom1727).toMatchObject({ frame: 422, mode: "orbit", heading: 13, timer: 2, x: 229 + 158 / 256, y: 251 + 18 / 256, dead: false });

    const round4Bottom1791Routes = [
      { at: 1791, state: createGunmanBottomMovementState(80, 182, 188), last: 350, heading: 21, timer: 0, x: 225 + 125 / 256, y: 251 + 246 / 256 },
      { at: 1823, state: createGunmanBottomMovementState(80, 182, 188), last: 350, heading: 21, timer: 0, x: 225 + 125 / 256, y: 251 + 246 / 256 },
    ] as const;
    for (const route of round4Bottom1791Routes) {
      for (let frame = 49; frame <= route.last; frame += 1) {
        const scroll = (route.at + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 168, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "chase", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
      const releaseScroll = (route.at + 2 / 3 + (route.last + 1) / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(route.state, route.last + 1, 168, 215, (x, y) => roundActorCollisionAtNes(4, releaseScroll, x, y));
      expect(route.state.dead).toBe(true);
    }

    const round4Bottom1855 = createGunmanBottomMovementState(48, 182, 188);
    for (let frame = 49; frame <= 1300; frame += 1) {
      const scroll = (1855 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 1035 ? 88 : frame >= 987 ? 104 : frame >= 747 ? 120 : frame >= 555 ? 152 : 168;
      const playerY = frame >= 1032 && frame < 1035 || frame >= 984 && frame < 987 || frame >= 744 && frame < 747 || frame >= 552 && frame < 555 ? 216 : 215;
      advanceGunmanFlankMovement(round4Bottom1855, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom1855).toMatchObject({ frame: 1300, heading: 31, timer: 0, x: 138 + 51 / 256, y: 174 + 8 / 256, dead: false });

    const round4Bottom1951 = createGunmanBottomMovementState(40, 189, 206);
    for (let frame = 49; frame <= 1000; frame += 1) {
      const scroll = (1951 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 747 ? 88 : frame >= 699 ? 104 : frame >= 459 ? 120 : frame >= 267 ? 152 : 168;
      const playerY = frame >= 744 && frame < 747 || frame >= 696 && frame < 699 || frame >= 456 && frame < 459 || frame >= 264 && frame < 267 ? 216 : 215;
      advanceGunmanFlankMovement(round4Bottom1951, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom1951).toMatchObject({ frame: 1000, heading: 30, timer: 4, x: 132 + 28 / 256, y: 170 + 198 / 256, dead: false });

    const round4Bottom2111 = createGunmanBottomMovementState(48, 238, 27);
    for (let frame = 49; frame <= 686; frame += 1) {
      const scroll = (2111 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 267 ? 88 : frame >= 219 ? 104 : 120;
      const playerY = frame >= 264 && frame < 267 || frame >= 216 && frame < 219 ? 216 : 215;
      advanceGunmanFlankMovement(round4Bottom2111, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom2111).toMatchObject({ frame: 686, heading: 18, timer: 4, x: 154 + 217 / 256, y: 251 + 176 / 256, dead: false });
    const round4Bottom2111ReleaseScroll = (2111 + 2 / 3 + 687 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round4Bottom2111, 687, 88, 215, (x, y) => roundActorCollisionAtNes(4, round4Bottom2111ReleaseScroll, x, y));
    expect(round4Bottom2111.dead).toBe(true);

    const round4Bottom2143 = createGunmanBottomMovementState(48, 103, 13);
    for (let frame = 49; frame <= 682; frame += 1) {
      const scroll = (2143 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 171 ? 88 : frame >= 123 ? 104 : 120;
      const playerY = frame >= 168 && frame < 171 || frame >= 120 && frame < 123 ? 216 : 215;
      advanceGunmanFlankMovement(round4Bottom2143, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom2143).toMatchObject({ frame: 682, heading: 30, timer: 1, x: 44 + 140 / 256, y: 0 + 105 / 256, dead: false });
    const round4Bottom2143ReleaseScroll = (2143 + 2 / 3 + 683 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round4Bottom2143, 683, 88, 215, (x, y) => roundActorCollisionAtNes(4, round4Bottom2143ReleaseScroll, x, y));
    expect(round4Bottom2143.dead).toBe(true);

    const round4Bottom2319 = createGunmanBottomMovementState(32, 93, 200);
    for (let frame = 49; frame <= 374; frame += 1) {
      const scroll = (2319 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Bottom2319, frame, 88, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom2319).toMatchObject({ frame: 374, heading: 24, timer: 2, x: 118 + 177 / 256, y: 251 + 146 / 256, dead: false });
    const round4Bottom2319ReleaseScroll = (2319 + 2 / 3 + 375 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round4Bottom2319, 375, 88, 215, (x, y) => roundActorCollisionAtNes(4, round4Bottom2319ReleaseScroll, x, y));
    expect(round4Bottom2319.dead).toBe(true);

    const round4Bottom2431 = createGunmanBottomMovementState(152, 251, 109);
    for (let frame = 49; frame <= 1079; frame += 1) {
      const scroll = (2431 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Bottom2431, frame, 88, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom2431).toMatchObject({ frame: 1079, heading: 31, timer: 2, x: 92 + 215 / 256, y: 0 + 115 / 256, dead: false });
    const round4Bottom2431ReleaseScroll = (2431 + 2 / 3 + 1080 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round4Bottom2431, 1080, 88, 215, (x, y) => roundActorCollisionAtNes(4, round4Bottom2431ReleaseScroll, x, y));
    expect(round4Bottom2431.dead).toBe(true);

    const round4Bottom2591 = createGunmanBottomMovementState(32, 61, 146);
    for (let frame = 49; frame <= 374; frame += 1) {
      const scroll = (2591 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Bottom2591, frame, 88, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Bottom2591).toMatchObject({ frame: 374, heading: 24, timer: 2, x: 118 + 145 / 256, y: 251 + 92 / 256, dead: false });
    const round4Bottom2591ReleaseScroll = (2591 + 2 / 3 + 375 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round4Bottom2591, 375, 88, 215, (x, y) => roundActorCollisionAtNes(4, round4Bottom2591ReleaseScroll, x, y));
    expect(round4Bottom2591.dead).toBe(true);

    const round4Top2335 = createGunmanTopMovementState(104, 141, 221);
    for (let frame = 1; frame <= 485; frame += 1) {
      const scroll = (2335 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Top2335, frame, 88, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Top2335).toMatchObject({ frame: 485, heading: 11, timer: 3, x: 145 + 43 / 256, y: 250 + 187 / 256, dead: false });
    const round4Top2335ReleaseScroll = (2335 + 2 / 3 + 486 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round4Top2335, 486, 88, 215, (x, y) => roundActorCollisionAtNes(4, round4Top2335ReleaseScroll, x, y));
    expect(round4Top2335.dead).toBe(true);

    const round4Top2479 = createGunmanTopMovementState(128, 236, 124);
    for (let frame = 1; frame <= 973; frame += 1) {
      const scroll = (2479 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Top2479, frame, 88, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Top2479).toMatchObject({ frame: 973, heading: 30, timer: 1, x: 19 + 63 / 256, y: 0 + 147 / 256, dead: false });
    const round4Top2479ReleaseScroll = (2479 + 2 / 3 + 974 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round4Top2479, 974, 88, 215, (x, y) => roundActorCollisionAtNes(4, round4Top2479ReleaseScroll, x, y));
    expect(round4Top2479.dead).toBe(true);

    const round4Top2511 = createGunmanTopMovementState(144, 240, 45);
    for (let frame = 1; frame <= 1200; frame += 1) {
      const scroll = (2511 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round4Top2511, frame, 88, 215, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
    }
    expect(round4Top2511).toMatchObject({ frame: 1200, heading: 10, timer: 2, x: 90 + 247 / 256, y: 174 + 193 / 256, dead: false });

    const round4OpeningTopRoutes = [
      { at: 127, state: createGunmanTopMovementState(120, 182, 188), last: 911, mode: "chase" as const, heading: 3, timer: 2, x: 88 + 249 / 256, y: 251 + 132 / 256 },
      { at: 159, state: createGunmanTopMovementState(120, 182, 188), last: 815, mode: "chase" as const, heading: 4, timer: 2, x: 81 + 123 / 256, y: 251 + 29 / 256 },
      { at: 159, state: createGunmanTopMovementState(216, 0, 93), last: 1313, mode: "roam" as const, heading: 0, timer: 0, x: 191 + 51 / 256, y: 0 + 34 / 256 },
    ] as const;
    for (const route of round4OpeningTopRoutes) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (route.at + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        const finalRoute = route.state === round4OpeningTopRoutes[2].state;
        const playerX = finalRoute ? frame >= 1227 ? 168 : frame >= 1179 ? 152 : 136 : 136;
        const playerY = finalRoute
          ? frame >= 1224 && frame < 1227 ? 216 : frame >= 1095 && frame < 1179 ? Math.min(216, 188 + Math.floor((frame - 1095) / 3) + 1) : frame >= 1179 ? 215 : 188
          : 188;
        advanceGunmanFlankMovement(route.state, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: route.mode, heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round4NextTopRoutes = [
      { at: 191, state: createGunmanTopMovementState(216, 182, 188), last: 1286, heading: 1, timer: 0, x: 239 + 158 / 256, y: 0 + 76 / 256 },
      { at: 207, state: createGunmanTopMovementState(152, 182, 188), last: 435, heading: 19, timer: 3, x: 201 + 225 / 256, y: 251 + 171 / 256 },
    ] as const;
    for (const route of round4NextTopRoutes) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (route.at + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        let playerX = 136;
        let playerY = 188;
        if (route.at === 191) {
          playerX = frame >= 1131 ? 168 : frame >= 1083 ? 152 : 136;
          playerY = frame >= 1128 && frame < 1131 ? 216 : frame >= 999 && frame < 1083 ? Math.min(216, 188 + Math.floor((frame - 999) / 3) + 1) : frame >= 1083 ? 215 : 188;
        }
        advanceGunmanFlankMovement(route.state, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round4LaterTopRoutes = [
      { at: 223, state: createGunmanTopMovementState(216, 182, 188), last: 782, heading: 7, timer: 0, x: 142 + 224 / 256, y: 251 + 137 / 256 },
      { at: 239, state: createGunmanTopMovementState(152, 182, 188), last: 435, heading: 19, timer: 3, x: 201 + 225 / 256, y: 251 + 171 / 256 },
    ] as const;
    for (const route of round4LaterTopRoutes) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (route.at + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 136, 188, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round4FinalOpeningRoutes = [
      { at: 271, state: createGunmanTopMovementState(168, 182, 188), last: 674, heading: 2, timer: 1, x: 108 + 138 / 256, y: 251 + 84 / 256 },
      { at: 287, state: createGunmanTopMovementState(216, 182, 188), last: 623, heading: 2, timer: 2, x: 108 + 109 / 256, y: 251 + 128 / 256 },
    ] as const;
    for (const route of round4FinalOpeningRoutes) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (route.at + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 136, 188, (x, y) => roundActorCollisionAtNes(4, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "chase", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round5Top1759 = createGunmanTopMovementState(88, 190, 39);
    for (let frame = 1; frame <= 284; frame += 1) {
      const scroll = (1759 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Top1759, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top1759).toMatchObject({ frame: 284, mode: "orbit", heading: 24, timer: 0, x: 164 + 94 / 256, y: 251 + 159 / 256, dead: false });
    const round5Top1759ReleaseScroll = (1759 + 2 / 3 + 285 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5Top1759, 285, 104, 216, (x, y) => roundActorCollisionAtNes(5, round5Top1759ReleaseScroll, x, y));
    expect(round5Top1759.dead).toBe(true);

    const round5Top1775 = createGunmanTopMovementState(112, 104, 127);
    for (let frame = 1; frame <= 257; frame += 1) {
      const scroll = (1775 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Top1775, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top1775).toMatchObject({ frame: 257, mode: "orbit", heading: 24, timer: 0, x: 0 + 36 / 256, y: 206 + 106 / 256, dead: false });
    const round5Top1775ReleaseScroll = (1775 + 2 / 3 + 258 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5Top1775, 258, 104, 216, (x, y) => roundActorCollisionAtNes(5, round5Top1775ReleaseScroll, x, y));
    expect(round5Top1775.dead).toBe(true);

    const round5Bottom1871 = createGunmanBottomMovementState(48, 112, 90);
    for (let frame = 49; frame <= 530; frame += 1) {
      const scroll = (1871 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Bottom1871, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Bottom1871).toMatchObject({ frame: 530, mode: "orbit", heading: 24, timer: 4, x: 78 + 118 / 256, y: 251 + 79 / 256, dead: false });

    const round5Bottom1967 = createGunmanBottomMovementState(56, 104, 127);
    for (let frame = 49; frame <= 189; frame += 1) {
      const scroll = (1967 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Bottom1967, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Bottom1967).toMatchObject({ frame: 189, mode: "orbit", heading: 8, timer: 0, x: 95 + 84 / 256, y: 214 + 203 / 256, dead: false });

    const round5Top1887 = createGunmanTopMovementState(24, 92, 179);
    for (let frame = 1; frame <= 479; frame += 1) {
      const scroll = (1887 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Top1887, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top1887).toMatchObject({ frame: 479, mode: "orbit", heading: 24, timer: 3, x: 69 + 141 / 256, y: 251 + 16 / 256, dead: false });

    const round5Top1999 = createGunmanTopMovementState(64, 41, 193);
    for (let frame = 1; frame <= 404; frame += 1) {
      const scroll = (1999 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Top1999, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top1999).toMatchObject({ frame: 404, mode: "orbit", heading: 26, timer: 0, x: 0 + 160 / 256, y: 151 + 195 / 256, dead: false });
    const round5Top1999ReleaseScroll = (1999 + 2 / 3 + 405 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5Top1999, 405, 104, 216, (x, y) => roundActorCollisionAtNes(5, round5Top1999ReleaseScroll, x, y));
    expect(round5Top1999.dead).toBe(true);

    const round5Top2095Routes = [
      { state: createGunmanTopMovementState(184, 20, 11), last: 1130, heading: 25, timer: 4, x: 204 + 73 / 256, y: 251 + 250 / 256 },
      { state: createGunmanTopMovementState(208, 41, 193), last: 491, heading: 24, timer: 2, x: 165 + 35 / 256, y: 251 + 152 / 256 },
      { state: createGunmanTopMovementState(240, 220, 235), last: 644, heading: 0, timer: 2, x: 60 + 18 / 256, y: 251 + 113 / 256 },
    ] as const;
    for (const route of round5Top2095Routes) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (2095 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: route.heading === 25 ? "chase" : "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round5Top2175 = createGunmanTopMovementState(208, 41, 193);
    for (let frame = 1; frame <= 386; frame += 1) {
      const scroll = (2175 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Top2175, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top2175).toMatchObject({ frame: 386, mode: "orbit", heading: 1, timer: 0, x: 108 + 98 / 256, y: 204 + 100 / 256, dead: false });

    const round5Top2207 = createGunmanTopMovementState(224, 20, 11);
    const round5Top2207PlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 1; frame <= 611; frame += 1) {
      const scroll = (2207 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 364 ? 216 : round5Top2207PlayerY[Math.min(frame - 364, round5Top2207PlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5Top2207, frame, 104, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top2207).toMatchObject({ frame: 611, mode: "chase", heading: 26, timer: 0, x: 165 + 153 / 256, y: 251 + 44 / 256, dead: false });

    const round5Top2287 = createGunmanTopMovementState(224, 139, 54);
    const round5Top2287PlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 1; frame <= 518; frame += 1) {
      const scroll = (2287 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 124 ? 216 : round5Top2287PlayerY[Math.min(frame - 124, round5Top2287PlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5Top2287, frame, 104, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top2287).toMatchObject({ frame: 518, mode: "chase", heading: 25, timer: 0, x: 204 + 73 / 256, y: 251 + 20 / 256, dead: false });

    const round5Top639 = createGunmanTopMovementState(136, 132, 47);
    for (let frame = 1; frame <= 296; frame += 1) {
      const scroll = (639 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Top639, frame, 168, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top639).toMatchObject({ frame: 296, mode: "orbit", heading: 23, timer: 2, x: 230 + 96 / 256, y: 251 + 214 / 256, dead: false });

    const round5Bottom655 = createGunmanBottomMovementState(88, 132, 47);
    for (let frame = 49; frame <= 164; frame += 1) {
      const scroll = (655 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Bottom655, frame, 168, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Bottom655).toMatchObject({ frame: 164, mode: "chase", heading: 6, timer: 0, x: 99 + 186 / 256, y: 251 + 157 / 256, dead: false });

    const round5Top2463 = createGunmanTopMovementState(40, 145, 3);
    const round5Top2463PlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 1; frame <= 1082; frame += 1) {
      const scroll = (2463 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 748 ? 216 : round5Top2463PlayerY[Math.min(frame - 748, round5Top2463PlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5Top2463, frame, 104, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top2463).toMatchObject({ frame: 1082, mode: "orbit", heading: 29, timer: 4, x: 9 + 105 / 256, y: 0 + 46 / 256, dead: false });
    const round5Top2463ReleaseScroll = (2463 + 2 / 3 + 1083 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5Top2463, 1083, 104, 216, (x, y) => roundActorCollisionAtNes(5, round5Top2463ReleaseScroll, x, y));
    expect(round5Top2463.dead).toBe(true);

    const round5Top2655 = createGunmanTopMovementState(208, 41, 25);
    const round5Top2655PlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 1; frame <= 569; frame += 1) {
      const scroll = (2655 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 172 ? 216 : round5Top2655PlayerY[Math.min(frame - 172, round5Top2655PlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5Top2655, frame, 104, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top2655).toMatchObject({ frame: 569, mode: "orbit", heading: 30, timer: 2, x: 59, y: 0 + 93 / 256, dead: false });

    const round5Top2671 = createGunmanTopMovementState(184, 20, 11);
    const round5Top2671PlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 1; frame <= 351; frame += 1) {
      const scroll = (2671 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 124 ? 216 : round5Top2671PlayerY[Math.min(frame - 124, round5Top2671PlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5Top2671, frame, 104, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top2671).toMatchObject({ frame: 351, mode: "orbit", heading: 27, timer: 0, x: 0 + 121 / 256, y: 105 + 50 / 256, dead: false });

    const round5Top2735Routes = [
      { state: createGunmanTopMovementState(104, 41, 193), last: 247, heading: 24, timer: 0, x: 0 + 165 / 256, y: 203 + 193 / 256 },
      { state: createGunmanTopMovementState(160, 220, 235), last: 305, heading: 26, timer: 4, x: 0 + 155 / 256, y: 151 + 84 / 256 },
    ] as const;
    for (const route of round5Top2735Routes) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (2735 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round5Top2879 = createGunmanTopMovementState(24, 20, 11);
    for (let frame = 1; frame <= 311; frame += 1) {
      const scroll = (2879 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Top2879, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top2879).toMatchObject({ frame: 311, mode: "orbit", heading: 19, timer: 0, x: 178 + 133 / 256, y: 251 + 204 / 256, dead: false });

    const round5Top2895Routes = [
      { state: createGunmanTopMovementState(104, 20, 11), last: 247, heading: 24, timer: 0, x: 0 + 144 / 256, y: 203 + 11 / 256 },
      { state: createGunmanTopMovementState(192, 41, 193), last: 560, heading: 22, timer: 4, x: 170 + 191 / 256, y: 251 + 31 / 256 },
    ] as const;
    for (const route of round5Top2895Routes) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (2895 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round5Top2911Routes = [
      { state: createGunmanTopMovementState(128, 20, 11), last: 267, heading: 25, timer: 3, x: 0 + 44 / 256, y: 183 + 46 / 256 },
      { state: createGunmanTopMovementState(160, 41, 193), last: 305, heading: 26, timer: 4, x: 0 + 56 / 256, y: 151 + 66 / 256 },
      { state: createGunmanTopMovementState(184, 220, 235), last: 596, heading: 14, timer: 2, x: 172 + 63 / 256, y: 251 + 111 / 256 },
    ] as const;
    for (const route of round5Top2911Routes) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (2911 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(route.state, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round5Top3023Routes = [
      { state: createGunmanTopMovementState(168, 20, 11), last: 422, mode: "orbit" as const, heading: 24, timer: 4, x: 163 + 57 / 256, y: 251 + 79 / 256 },
      { state: createGunmanTopMovementState(248, 41, 193), last: 530, mode: "chase" as const, heading: 26, timer: 0, x: 124 + 3 / 256, y: 203 + 250 / 256 },
    ] as const;
    for (const route of round5Top3023Routes) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (3023 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        const playerX = route.state === round5Top3023Routes[1].state && frame >= 459 ? 120 : 104;
        const playerY = route.state === round5Top3023Routes[1].state && frame >= 459 ? 215 : 216;
        advanceGunmanFlankMovement(route.state, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: route.mode, heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const round5Top2015 = createGunmanTopMovementState(88, 20, 11);
    for (let frame = 1; frame <= 595; frame += 1) {
      const scroll = (2015 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5Top2015, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Top2015).toMatchObject({ frame: 595, mode: "orbit", heading: 12, timer: 2, x: 108 + 155 / 256, y: 204 + 104 / 256, dead: false });

    const round6Actor = createGunmanFlankMovementState(8, 4, 96, false, 119, 29);
    for (let frame = 1; frame <= 647; frame += 1) {
      const scroll = (2207 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const tracedPlayerY = 215 + Number(frame >= 216 && frame % 3 === 0);
      advanceGunmanFlankMovement(round6Actor, frame, 136, tracedPlayerY, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(round6Actor).toMatchObject({ frame: 647, mode: "orbit", heading: 25, timer: 4, x: 88 / 256, y: 186 + 142 / 256, dead: false });
    const round6ReleaseScroll = (2207 + 2 / 3 + 648 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round6Actor, 648, 136, 216, (x, y) => roundActorCollisionAtNes(6, round6ReleaseScroll, x, y));
    expect(round6Actor.dead).toBe(true);

    const lateRound6Code8 = createGunmanFlankMovementState(8, 4, 32, false, 123, 168);
    for (let frame = 1; frame <= 1349; frame += 1) {
      const scroll = (2943 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(lateRound6Code8, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(lateRound6Code8).toMatchObject({ frame: 1349, mode: "orbit", heading: 26, timer: 3, x: 190 / 256, y: 147 + 253 / 256, dead: false });
    const lateRound6Code8ReleaseScroll = (2943 + 2 / 3 + 1350 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(lateRound6Code8, 1350, 136, 215, (x, y) => roundActorCollisionAtNes(6, lateRound6Code8ReleaseScroll, x, y));
    expect(lateRound6Code8.dead).toBe(true);

    const nextRound6Code8 = createGunmanFlankMovementState(8, 4, 32, false, 33, 90);
    for (let frame = 1; frame <= 1214; frame += 1) {
      const scroll = (3023 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(nextRound6Code8, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(nextRound6Code8).toMatchObject({ frame: 1214, mode: "orbit", heading: 26, timer: 3, x: 125 / 256, y: 147 + 46 / 256, dead: false });
    const nextRound6Code8ReleaseScroll = (3023 + 2 / 3 + 1215 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(nextRound6Code8, 1215, 136, 215, (x, y) => roundActorCollisionAtNes(6, nextRound6Code8ReleaseScroll, x, y));
    expect(nextRound6Code8.dead).toBe(true);

    const latePhase0Round6Code8 = createGunmanFlankMovementState(8, 4, 32, false, 97, 34);
    for (let frame = 1; frame <= 1004; frame += 1) {
      const scroll = (3727 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(latePhase0Round6Code8, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(latePhase0Round6Code8).toMatchObject({ frame: 1004, mode: "orbit", heading: 24, timer: 0, x: 83 + 144 / 256, y: 251 + 184 / 256, dead: false });
    const latePhase0Round6Code8ReleaseScroll = (3727 + 2 / 3 + 1005 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(latePhase0Round6Code8, 1005, 136, 215, (x, y) => roundActorCollisionAtNes(6, latePhase0Round6Code8ReleaseScroll, x, y));
    expect(latePhase0Round6Code8.dead).toBe(true);

    const firstRound6Code8 = createGunmanFlankMovementState(8, 4, 32, false, 38, 250);
    for (let frame = 1; frame <= 449; frame += 1) {
      const scroll = (159 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const tracedPlayerY = 188 + Number(frame >= 234 && frame <= 360 && frame % 3 === 0);
      advanceGunmanFlankMovement(firstRound6Code8, frame, 136, tracedPlayerY, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(firstRound6Code8).toMatchObject({ frame: 449, mode: "orbit", heading: 1, timer: 1, x: 173 + 86 / 256, y: 71 / 256, dead: false });
    const firstRound6ReleaseScroll = (159 + 2 / 3 + 450 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(firstRound6Code8, 450, 136, 188, (x, y) => roundActorCollisionAtNes(6, firstRound6ReleaseScroll, x, y));
    expect(firstRound6Code8.dead).toBe(true);

    const round6Code9 = createGunmanFlankMovementState(9, 248, 32, true, 187, 135);
    for (let frame = 1; frame <= 959; frame += 1) {
      const scroll = (2783 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round6Code9, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(round6Code9).toMatchObject({ frame: 959, mode: "orbit", heading: 24, timer: 3, x: 98 + 155 / 256, y: 251 + 25 / 256, dead: false });
    const round6Code9ReleaseScroll = (2783 + 2 / 3 + 960 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round6Code9, 960, 136, 215, (x, y) => roundActorCollisionAtNes(6, round6Code9ReleaseScroll, x, y));
    expect(round6Code9.dead).toBe(true);

    const lateRound6Code9 = createGunmanFlankMovementState(9, 249, 32, true, 42, 146);
    for (let frame = 1; frame <= 1418; frame += 1) {
      const scroll = (3919 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const tracedPlayerY = 215 + Number(frame % 3 === 0 && (frame <= 69 || frame >= 360 && frame <= 1029));
      advanceGunmanFlankMovement(lateRound6Code9, frame, 168, tracedPlayerY, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(lateRound6Code9).toMatchObject({ frame: 1418, mode: "chase", heading: 5, timer: 0, x: 107 + 35 / 256, y: 251 + 222 / 256, dead: false });
    const lateRound6ReleaseScroll = (3919 + 2 / 3 + 1419 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(lateRound6Code9, 1419, 168, 215, (x, y) => roundActorCollisionAtNes(6, lateRound6ReleaseScroll, x, y));
    expect(lateRound6Code9.dead).toBe(true);

    const finalRound6Code7 = createGunmanFlankMovementState(7, 4, 48, false, 145, 155);
    for (let frame = 1; frame <= 302; frame += 1) {
      const scroll = (4543 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(finalRound6Code7, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(finalRound6Code7).toMatchObject({ frame: 302, mode: "orbit", heading: 15, timer: 4, x: 210 + 76 / 256, y: 250 + 251 / 256, dead: false });
    const finalRound6ReleaseScroll = (4543 + 2 / 3 + 303 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(finalRound6Code7, 303, 136, 215, (x, y) => roundActorCollisionAtNes(6, finalRound6ReleaseScroll, x, y));
    expect(finalRound6Code7.dead).toBe(true);

    const finalRound6Code8 = createGunmanFlankMovementState(8, 4, 48, false, 236, 203);
    finalRound6Code8.x -= 1;
    for (let frame = 1; frame <= 775; frame += 1) {
      const scroll = (5119 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(finalRound6Code8, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(finalRound6Code8).toMatchObject({ frame: 775, mode: "orbit", heading: 0, timer: 3, x: 191 + 173 / 256, y: 47 / 256, dead: false });
    const finalRound6Code8ReleaseScroll = (5119 + 2 / 3 + 776 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(finalRound6Code8, 776, 136, 215, (x, y) => roundActorCollisionAtNes(6, finalRound6Code8ReleaseScroll, x, y));
    expect(finalRound6Code8.dead).toBe(true);

    const earlyRound6Code8 = createGunmanFlankMovementState(8, 4, 32, false, 101, 223);
    for (let frame = 1; frame <= 249; frame += 1) {
      const scroll = (207 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 90 ? 188 : Math.min(216, 188 + Math.floor((frame - 90) / 3) + 1);
      advanceGunmanFlankMovement(earlyRound6Code8, frame, 136, playerY, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(earlyRound6Code8).toMatchObject({ frame: 249, mode: "side", heading: 8, timer: 0, x: 100 + 161 / 256, y: 116 + 223 / 256, dead: false });

    const earlyRound6Code9 = createGunmanFlankMovementState(9, 248, 48, true, 34, 78);
    earlyRound6Code9.x += 1;
    for (let frame = 1; frame <= 201; frame += 1) {
      const scroll = (511 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(earlyRound6Code9, frame, 136, 216, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(earlyRound6Code9).toMatchObject({ frame: 201, mode: "side", heading: 24, timer: 0, x: 155 + 98 / 256, y: 116 + 78 / 256, dead: false });

    const secondRound6Code8 = createGunmanFlankMovementState(8, 4, 32, false, 117, 118);
    for (let frame = 1; frame <= 246; frame += 1) {
      const scroll = (607 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 27 ? 120 : 136;
      advanceGunmanFlankMovement(secondRound6Code8, frame, playerX, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(secondRound6Code8).toMatchObject({ frame: 246, mode: "side", heading: 8, timer: 0, x: 36 + 25 / 256, y: 115 + 118 / 256, dead: false });

    const round6Code7Left = createGunmanFlankMovementState(7, 4, 32, false, 98, 249);
    for (let frame = 1; frame <= 315; frame += 1) {
      const scroll = (1135 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round6Code7Left, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(round6Code7Left).toMatchObject({ frame: 315, mode: "orbit", heading: 18, timer: 4, x: 196 + 137 / 256, y: 251 + 68 / 256, dead: false });
    const round6Code7LeftReleaseScroll = (1135 + 2 / 3 + 316 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round6Code7Left, 316, 120, 215, (x, y) => roundActorCollisionAtNes(6, round6Code7LeftReleaseScroll, x, y));
    expect(round6Code7Left.dead).toBe(true);

    const round6Code7Right = createGunmanFlankMovementState(7, 248, 32, true, 160, 38);
    for (let frame = 1; frame <= 596; frame += 1) {
      const scroll = (1135 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round6Code7Right, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(round6Code7Right).toMatchObject({ frame: 596, mode: "orbit", heading: 17, timer: 2, x: 192 + 47 / 256, y: 250 + 50 / 256, dead: false });
    const round6Code7RightReleaseScroll = (1135 + 2 / 3 + 597 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round6Code7Right, 597, 120, 215, (x, y) => roundActorCollisionAtNes(6, round6Code7RightReleaseScroll, x, y));
    expect(round6Code7Right.dead).toBe(true);

    const longRound6Code8 = createGunmanFlankMovementState(8, 4, 32, false, 56, 215);
    for (let frame = 1; frame <= 563; frame += 1) {
      const scroll = (1375 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(longRound6Code8, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(longRound6Code8).toMatchObject({ frame: 563, mode: "orbit", heading: 0, timer: 4, x: 108 + 164 / 256, y: 251 / 256, dead: false });
    const longRound6Code8ReleaseScroll = (1375 + 2 / 3 + 564 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(longRound6Code8, 564, 120, 215, (x, y) => roundActorCollisionAtNes(6, longRound6Code8ReleaseScroll, x, y));
    expect(longRound6Code8.dead).toBe(true);

    expect(gunmanBottomUsesDynamicState(6, 1375)).toBe(true);
    expect(gunmanBottomDynamicPosition(34 / NES_FRAME_RATE, 136, 110, 136)).toEqual([(136 + 110 / 256) * NES_WORLD_X_SCALE, (226 + 136 / 256) * NES_WORLD_Y_SCALE]);

    const round3Code8 = createGunmanFlankMovementState(8, 4, 96, false, 36, 248);
    for (let frame = 1; frame <= 281; frame += 1) {
      const scroll = (1119 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round3Code8, frame, 136, 215, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(round3Code8).toMatchObject({ frame: 281, mode: "orbit", heading: 16, timer: 0, x: 208 + 200 / 256, y: 250 + 68 / 256, dead: false });
    const round3Code8ReleaseScroll = (1119 + 2 / 3 + 282 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round3Code8, 282, 136, 215, (x, y) => roundActorCollisionAtNes(3, round3Code8ReleaseScroll, x, y));
    expect(round3Code8.dead).toBe(true);

    const lateRound3Code8 = createGunmanFlankMovementState(8, 4, 48, false, 183, 248);
    for (let frame = 1; frame <= 425; frame += 1) {
      const scroll = (3775 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(lateRound3Code8, frame, 136, 215, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(lateRound3Code8).toMatchObject({ frame: 425, mode: "orbit", heading: 16, timer: 0, x: 208 + 135 / 256, y: 250 + 68 / 256, dead: false });
    const lateRound3ReleaseScroll = (3775 + 2 / 3 + 426 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(lateRound3Code8, 426, 136, 215, (x, y) => roundActorCollisionAtNes(3, lateRound3ReleaseScroll, x, y));
    expect(lateRound3Code8.dead).toBe(true);

    const phase0Round3Code8 = createGunmanFlankMovementState(8, 4, 96, false, 157, 214);
    for (let frame = 1; frame <= 281; frame += 1) {
      const scroll = (3823 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(phase0Round3Code8, frame, 136, 215, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(phase0Round3Code8).toMatchObject({ frame: 281, mode: "orbit", heading: 16, timer: 0, x: 208 + 109 / 256, y: 250 + 34 / 256, dead: false });
    const phase0Round3ReleaseScroll = (3823 + 2 / 3 + 282 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(phase0Round3Code8, 282, 136, 215, (x, y) => roundActorCollisionAtNes(3, phase0Round3ReleaseScroll, x, y));
    expect(phase0Round3Code8.dead).toBe(true);

    const flaggedRound3Code7 = createGunmanFlankMovementState(7, 4, 80, false, 152, 226);
    for (let frame = 1; frame <= 300; frame += 1) {
      const scroll = (4239 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(flaggedRound3Code7, frame, 136, 215, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(flaggedRound3Code7).toMatchObject({ frame: 300, mode: "orbit", heading: 16, timer: 4, x: 208 + 20 / 256, y: 251 + 104 / 256, dead: false });
    const flaggedRound3ReleaseScroll = (4239 + 2 / 3 + 301 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(flaggedRound3Code7, 301, 136, 215, (x, y) => roundActorCollisionAtNes(3, flaggedRound3ReleaseScroll, x, y));
    expect(flaggedRound3Code7.dead).toBe(true);

    const wrappingRound3Code7 = createGunmanFlankMovementState(7, 248, 48, true, 203, 132);
    for (let frame = 1; frame <= 581; frame += 1) {
      const scroll = (4831 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(wrappingRound3Code7, frame, 152, 215, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(wrappingRound3Code7).toMatchObject({ frame: 581, mode: "orbit", heading: 11, timer: 3, x: 208 + 155 / 256, y: 251 + 253 / 256, dead: false });
    const wrappingRound3ReleaseScroll = (4831 + 2 / 3 + 582 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(wrappingRound3Code7, 582, 152, 215, (x, y) => roundActorCollisionAtNes(3, wrappingRound3ReleaseScroll, x, y));
    expect(wrappingRound3Code7.dead).toBe(true);

    const gateRound3Code7 = createGunmanFlankMovementState(7, 248, 80, true, 85, 178);
    for (let frame = 1; frame <= 380; frame += 1) {
      const scroll = (4863 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(gateRound3Code7, frame, 152, 215, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(gateRound3Code7).toMatchObject({ frame: 380, mode: "orbit", heading: 27, timer: 3, x: 74 / 256, y: 97 + 41 / 256, dead: false });
    const gateRound3ReleaseScroll = (4863 + 2 / 3 + 381 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(gateRound3Code7, 381, 152, 215, (x, y) => roundActorCollisionAtNes(3, gateRound3ReleaseScroll, x, y));
    expect(gateRound3Code7.dead).toBe(true);

    const earlyRound3Code7 = createGunmanFlankMovementState(7, 4, 64, false, 83, 54);
    for (let frame = 1; frame <= 329; frame += 1) {
      const scroll = (687 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(earlyRound3Code7, frame, 136, 188, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(earlyRound3Code7).toMatchObject({ frame: 329, mode: "orbit", heading: 22, timer: 1, x: 196 + 83 / 256, y: 250 + 174 / 256, dead: false });
    const earlyRound3ReleaseScroll = (687 + 2 / 3 + 330 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(earlyRound3Code7, 330, 136, 188, (x, y) => roundActorCollisionAtNes(3, earlyRound3ReleaseScroll, x, y));
    expect(earlyRound3Code7.dead).toBe(true);

    const middleRound3Code7 = createGunmanFlankMovementState(7, 4, 64, false, 80, 4);
    for (let frame = 1; frame <= 310; frame += 1) {
      const scroll = (1711 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(middleRound3Code7, frame, 136, 216, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(middleRound3Code7).toMatchObject({ frame: 310, mode: "orbit", heading: 18, timer: 2, x: 211 + 91 / 256, y: 251 + 110 / 256, dead: false });
    const middleRound3ReleaseScroll = (1711 + 2 / 3 + 311 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(middleRound3Code7, 311, 136, 216, (x, y) => roundActorCollisionAtNes(3, middleRound3ReleaseScroll, x, y));
    expect(middleRound3Code7.dead).toBe(true);

    const earlierMiddleRound3Code7 = createGunmanFlankMovementState(7, 4, 64, false, 9, 4);
    for (let frame = 1; frame <= 311; frame += 1) {
      const scroll = (1647 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(earlierMiddleRound3Code7, frame, 136, 216, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(earlierMiddleRound3Code7).toMatchObject({ frame: 311, mode: "chase", heading: 19, timer: 2, x: 211 + 131 / 256, y: 250 + 97 / 256, dead: false });
    const earlierMiddleRound3ReleaseScroll = (1647 + 2 / 3 + 312 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(earlierMiddleRound3Code7, 312, 136, 216, (x, y) => roundActorCollisionAtNes(3, earlierMiddleRound3ReleaseScroll, x, y));
    expect(earlierMiddleRound3Code7.dead).toBe(true);

    const loopingRound3Code7 = createGunmanFlankMovementState(7, 4, 48, false, 141, 197);
    for (let frame = 1; frame <= 500; frame += 1) {
      const scroll = (319 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const tracedPlayerY = 215 + Number(frame >= 360 && frame <= 453 && frame % 3 === 0);
      advanceGunmanFlankMovement(loopingRound3Code7, frame, 152, tracedPlayerY, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(loopingRound3Code7).toMatchObject({ frame: 500, mode: "orbit", heading: 24, timer: 3, x: 82 / 256, y: 219 + 199 / 256, dead: false });
    const loopingRound3ReleaseScroll = (319 + 2 / 3 + 501 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(loopingRound3Code7, 501, 152, 215, (x, y) => roundActorCollisionAtNes(3, loopingRound3ReleaseScroll, x, y));
    expect(loopingRound3Code7.dead).toBe(true);

    const lateRound3Code7 = createGunmanFlankMovementState(7, 4, 80, false, 120, 14);
    for (let frame = 1; frame <= 301; frame += 1) {
      const scroll = (959 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(lateRound3Code7, frame, 136, 215, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(lateRound3Code7).toMatchObject({ frame: 301, mode: "orbit", heading: 16, timer: 4, x: 208 + 131 / 256, y: 251 + 68 / 256, dead: false });
    const finalRound3ReleaseScroll = (959 + 2 / 3 + 302 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(lateRound3Code7, 302, 136, 215, (x, y) => roundActorCollisionAtNes(3, finalRound3ReleaseScroll, x, y));
    expect(lateRound3Code7.dead).toBe(true);

    const firstRound3Code7 = createGunmanFlankMovementState(7, 4, 64, false, 87, 99);
    for (let frame = 1; frame <= 580; frame += 1) {
      const scroll = (255 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(firstRound3Code7, frame, 136, 188, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(firstRound3Code7).toMatchObject({ frame: 580, mode: "orbit", heading: 0, timer: 2, x: 191 + 149 / 256, y: 83 / 256, dead: false });
    const firstRound3ReleaseScroll = (255 + 2 / 3 + 581 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(firstRound3Code7, 581, 136, 188, (x, y) => roundActorCollisionAtNes(3, firstRound3ReleaseScroll, x, y));
    expect(firstRound3Code7.dead).toBe(true);

    const flaggedRightRound3Code7 = createGunmanFlankMovementState(7, 248, 64, true, 224, 105);
    for (let frame = 1; frame <= 383; frame += 1) {
      const scroll = (4255 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const tracedPlayerY = 215 + Number(frame >= 315 && frame <= 381 && frame % 3 === 0);
      advanceGunmanFlankMovement(flaggedRightRound3Code7, frame, 136, tracedPlayerY, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(flaggedRightRound3Code7).toMatchObject({ frame: 383, mode: "orbit", heading: 27, timer: 1, x: 65 / 256, y: 99 + 199 / 256, dead: false });
    const flaggedRightRound3ReleaseScroll = (4255 + 2 / 3 + 384 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(flaggedRightRound3Code7, 384, 136, 215, (x, y) => roundActorCollisionAtNes(3, flaggedRightRound3ReleaseScroll, x, y));
    expect(flaggedRightRound3Code7.dead).toBe(true);

    const round3Code8Y64 = createGunmanFlankMovementState(8, 4, 64, false, 73, 151);
    for (let frame = 1; frame <= 378; frame += 1) {
      const scroll = (1071 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round3Code8Y64, frame, 136, 215, (x, y) => roundActorCollisionAtNes(3, scroll, x, y));
    }
    expect(round3Code8Y64).toMatchObject({ frame: 378, mode: "orbit", heading: 16, timer: 1, x: 208 + 237 / 256, y: 251 + 227 / 256, dead: false });
    const round3Code8Y64ReleaseScroll = (1071 + 2 / 3 + 379 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round3Code8Y64, 379, 136, 215, (x, y) => roundActorCollisionAtNes(3, round3Code8Y64ReleaseScroll, x, y));
    expect(round3Code8Y64.dead).toBe(true);

    const entry = createGunmanFlankMovementState(7, 4, 32, false);
    const seededEntry = createGunmanFlankMovementState(7, 4, 32, false, 60, 86);
    expect(seededEntry.x).toBeCloseTo(4 + 60 / 256, 9);
    expect(seededEntry.y).toBeCloseTo(33 + 86 / 256, 9);
    advanceGunmanFlankMovement(entry, 48, 120, 215, () => false);
    expect(entry).toMatchObject({ frame: 48, mode: "chase", heading: 8, dead: false });
    expect(entry.x).toBeCloseTo(42.921875, 9);
    expect(entry.y).toBeCloseTo(49, 9);
    advanceGunmanFlankMovement(entry, 49, entry.x, entry.y, () => false);
    expect(entry).toMatchObject({ mode: "orbit", heading: 0, orbitDirection: 1 });

    const wrappedTimer = { ...entry, x: 100, y: 100, heading: 7, timer: 255 };
    advanceGunmanFlankMovement(wrappedTimer, wrappedTimer.frame + 1, 200, 200, () => false);
    expect(wrappedTimer).toMatchObject({ mode: "orbit", heading: 7, timer: 0 });

    const orbit = { ...entry, x: 100, y: 100, heading: 15, timer: 4, orbitPassedDown: false };
    advanceGunmanFlankMovement(orbit, orbit.frame + 1, 200, 200, () => false);
    expect(orbit).toMatchObject({ mode: "orbit", heading: 16, orbitPassedDown: true });
    orbit.heading = 31;
    orbit.timer = 4;
    advanceGunmanFlankMovement(orbit, orbit.frame + 1, 200, 200, () => false);
    expect(orbit).toMatchObject({ mode: "roam", heading: 0 });

    const holdingOrbit = { ...orbit, mode: "orbit" as const, heading: 1, timer: 4, orbitDirection: 0 as const };
    advanceGunmanFlankMovement(holdingOrbit, holdingOrbit.frame + 1, 200, 200, () => false);
    expect(holdingOrbit).toMatchObject({ mode: "orbit", heading: 1 });

    const bounce = { ...entry, mode: "roam" as const, x: 100, y: 100, heading: 8, timer: 2, orbitPassedDown: true };
    advanceGunmanFlankMovement(bounce, bounce.frame + 1, 200, 200, () => true);
    expect(bounce).toMatchObject({ mode: "chase", heading: 8, timer: 2, orbitPassedDown: true });
    advanceGunmanFlankMovement(bounce, bounce.frame + 1, bounce.x, bounce.y, () => false);
    expect(bounce).toMatchObject({ mode: "orbit", heading: 0, timer: 2, orbitPassedDown: true });

    const oppositeAim = { ...entry, mode: "chase" as const, frame: 1, x: 211, y: 75, heading: 2 };
    advanceGunmanFlankMovement(oppositeAim, 2, 152, 215, () => false);
    expect(oppositeAim.heading).toBe(3);

    const boundaryProbe = { ...entry, mode: "roam" as const, frame: 1, x: 12.2, y: 146.9, heading: 26 };
    let probe: readonly [number, number] | undefined;
    advanceGunmanFlankMovement(boundaryProbe, 2, 152, 215, (x, y) => (probe = [x, y], false));
    expect(probe).toEqual([255, 140]);

    const side = createGunmanFlankMovementState(8, 4, 115, false);
    expect(gunmanFlankMovementFacingHeading(side)).toBe(16);
    advanceGunmanFlankMovement(side, 1, 120, 215, () => false);
    expect(side).toMatchObject({ mode: "lunge", timer: 51 });
    advanceGunmanFlankMovement(side, 52, 120, 215, () => false);
    expect(side).toMatchObject({ mode: "lunge", timer: 0 });
    advanceGunmanFlankMovement(side, 53, 120, 215, () => false);
    expect(side).toMatchObject({ mode: "lunge", timer: 255 });
    advanceGunmanFlankMovement(side, 54, 120, 215, () => false);
    expect(side).toMatchObject({ mode: "chase", heading: 16 });

    const release = createGunmanFlankMovementState(7, 255, 32, false);
    advanceGunmanFlankMovement(release, 2, 120, 215, () => false);
    expect(release.dead).toBe(true);
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

  it("routes the Round 6 bottom Gunman into the shared state machine", () => {
    expect(gunmanBottomUsesDynamicState(5, 255)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 255, 216)).toEqual([]);
    expect(gunmanBottomUsesDynamicState(5, 511)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 511, 88)).toEqual([]);
    expect(GUNMAN_BOTTOM_DYNAMIC_HANDOFF_FRAME).toBe(48);
    expect(gunmanBottomUsesDynamicState(6, 3055)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 3327)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 4319)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 4575)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 4623)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 4639)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 4751)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 815)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 831)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 1007)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 1023)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 1167)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 1231)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 1279)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 1311)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 1535)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 175)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 191)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 447)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 479, 168)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 479, 136)).toBe(false);
    expect(gunmanBottomUsesDynamicState(6, 559)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 847)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 2207)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 2479)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 2879)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 3951)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 4079)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 4335)).toBe(true);
    expect(gunmanBottomUsesDynamicState(6, 3023)).toBe(false);
    expect(gunmanBottomDynamicPosition(0, 112, 74, 68)).toEqual([(112 + 74 / 256) * NES_WORLD_X_SCALE, (249 + 68 / 256) * NES_WORLD_Y_SCALE]);
    expect(gunmanBottomDynamicPosition(48 / NES_FRAME_RATE, 112, 74, 68)).toEqual([(112 + 74 / 256) * NES_WORLD_X_SCALE, (218 + 68 / 256) * NES_WORLD_Y_SCALE]);
    const state = createGunmanBottomMovementState(112, 74, 68);
    for (let frame = 49; frame <= 1428; frame += 1) {
      const scroll = (3055 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(state, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(state).toMatchObject({ frame: 1428, mode: "orbit", heading: 2, timer: 0, x: 255 + 178 / 256, y: 117 + 133 / 256, dead: false });
    const releaseScroll = (3055 + 2 / 3 + 1429 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(state, 1429, 136, 215, (x, y) => roundActorCollisionAtNes(6, releaseScroll, x, y));
    expect(state.dead).toBe(true);

    expect(gunmanBottomFirstOpportunityFrame(238, 6, 3327)).toBe(232);
    const contactState = createGunmanBottomMovementState(88, 240, 4);
    for (let frame = 49; frame <= 272; frame += 1) {
      const scroll = (3327 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(contactState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(contactState).toMatchObject({ frame: 272, mode: "orbit", heading: 12, timer: 1, x: 139 + 128 / 256, y: 202 + 234 / 256, dead: false });

    const laterBottomState = createGunmanBottomMovementState(200, 215, 189);
    for (let frame = 49; frame <= 391; frame += 1) {
      const scroll = (4319 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(laterBottomState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(laterBottomState).toMatchObject({ frame: 391, mode: "orbit", heading: 0, timer: 3, x: 191 + 73 / 256, y: 0 + 43 / 256, dead: false });
    const laterBottomReleaseScroll = (4319 + 2 / 3 + 392 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(laterBottomState, 392, 136, 215, (x, y) => roundActorCollisionAtNes(6, laterBottomReleaseScroll, x, y));
    expect(laterBottomState.dead).toBe(true);

    expect(gunmanFlankEventShotFrames(6, 4575)).toEqual([158]);
    expect(gunmanFlankEventShotFrames(6, 815)).toEqual([187]);
    expect(gunmanFlankEventShotFrames(6, 831)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 1007)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 1023)).toEqual([65]);
    expect(gunmanFlankEventShotFrames(6, 1167)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 1231)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 1279, 112)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 1279, 136)).toEqual([19, 403, 659]);
    expect(gunmanFlankEventShotFrames(6, 1311)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 1535, 120)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 1535, 184)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 175, 152)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 191, 168)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 447, 104)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 479, 168)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 559, 104)).toEqual([191]);
    expect(gunmanFlankEventShotFrames(6, 847, 160)).toEqual([61]);
    expect(gunmanFlankEventShotFrames(6, 2207, 88)).toEqual([423, 615]);
    expect(gunmanFlankEventShotFrames(6, 2207, 120)).toEqual([423]);
    expect(gunmanFlankEventShotFrames(6, 2479, 152)).toEqual([64]);
    expect(gunmanFlankEventShotFrames(6, 2879, 120)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 3951, 104)).toEqual([133]);
    expect(gunmanFlankEventShotFrames(6, 4079, 104)).toEqual([926, 1246]);
    expect(gunmanFlankEventShotFrames(6, 4335, 168)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 4751, 40)).toEqual([]);
    const lateBottomState = createGunmanBottomMovementState(120, 155, 232);
    for (let frame = 49; frame <= 418; frame += 1) {
      const scroll = (4575 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(lateBottomState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(lateBottomState).toMatchObject({ frame: 418, mode: "orbit", heading: 12, timer: 2, x: 194 + 84 / 256, y: 251 + 125 / 256, dead: false });
    const lateBottomReleaseScroll = (4575 + 2 / 3 + 419 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(lateBottomState, 419, 136, 215, (x, y) => roundActorCollisionAtNes(6, lateBottomReleaseScroll, x, y));
    expect(lateBottomState.dead).toBe(true);

    expect(gunmanFlankEventShotFrames(6, 4623, 168)).toEqual([]);
    const noShotBottomState = createGunmanBottomMovementState(168, 42, 35);
    for (let frame = 49; frame <= 149; frame += 1) {
      const scroll = (4623 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(noShotBottomState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(noShotBottomState).toMatchObject({ frame: 149, mode: "orbit", heading: 24, timer: 0, x: 85 + 90 / 256, y: 251 + 35 / 256, dead: false });
    const noShotBottomReleaseScroll = (4623 + 2 / 3 + 150 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(noShotBottomState, 150, 136, 215, (x, y) => roundActorCollisionAtNes(6, noShotBottomReleaseScroll, x, y));
    expect(noShotBottomState.dead).toBe(true);

    expect(gunmanFlankEventShotFrames(6, 4639)).toEqual([193]);
    const contactBottomState = createGunmanBottomMovementState(112, 1, 11);
    for (let frame = 49; frame <= 221; frame += 1) {
      const scroll = (4639 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(contactBottomState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(contactBottomState).toMatchObject({ frame: 221, mode: "orbit", heading: 8, timer: 2, x: 127 + 189 / 256, y: 224 + 87 / 256, dead: false });

    const lateNoShotState = createGunmanBottomMovementState(40, 160, 135);
    for (let frame = 49; frame <= 413; frame += 1) {
      const scroll = (4751 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(lateNoShotState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(lateNoShotState).toMatchObject({ frame: 413, mode: "orbit", heading: 14, timer: 1, x: 228 + 165 / 256, y: 250 + 254 / 256, dead: false });
    const lateNoShotReleaseScroll = (4751 + 2 / 3 + 414 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(lateNoShotState, 414, 136, 215, (x, y) => roundActorCollisionAtNes(6, lateNoShotReleaseScroll, x, y));
    expect(lateNoShotState.dead).toBe(true);

    const earlyBottomState = createGunmanBottomMovementState(176, 164, 12);
    for (let frame = 49; frame <= 529; frame += 1) {
      const scroll = (815 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(earlyBottomState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(earlyBottomState).toMatchObject({ frame: 529, mode: "orbit", heading: 0, timer: 4, x: 175 + 186 / 256, y: 0 + 34 / 256, dead: false });
    const earlyBottomReleaseScroll = (815 + 2 / 3 + 530 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(earlyBottomState, 530, 120, 215, (x, y) => roundActorCollisionAtNes(6, earlyBottomReleaseScroll, x, y));
    expect(earlyBottomState.dead).toBe(true);

    const shortBottomState = createGunmanBottomMovementState(160, 135, 184);
    for (let frame = 49; frame <= 149; frame += 1) {
      const scroll = (831 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(shortBottomState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(shortBottomState).toMatchObject({ frame: 149, mode: "orbit", heading: 24, timer: 0, x: 77 + 183 / 256, y: 251 + 184 / 256, dead: false });
    const shortBottomReleaseScroll = (831 + 2 / 3 + 150 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(shortBottomState, 150, 120, 215, (x, y) => roundActorCollisionAtNes(6, shortBottomReleaseScroll, x, y));
    expect(shortBottomState.dead).toBe(true);

    const contactBottomEntryState = createGunmanBottomMovementState(136, 8, 40);
    for (let frame = 49; frame <= 57; frame += 1) {
      const scroll = (1007 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(contactBottomEntryState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(contactBottomEntryState).toMatchObject({ frame: 57, mode: "orbit", heading: 24, timer: 3, x: 129 + 104 / 256, y: 221 + 40 / 256, dead: false });
    expect(gunmanBottomDynamicPosition(34 / NES_FRAME_RATE, 128, 120, 239)).toEqual([(128 + 120 / 256) * NES_WORLD_X_SCALE, (226 + 239 / 256) * NES_WORLD_Y_SCALE]);
    const sameTimeBottomState = createGunmanBottomMovementState(144, 82, 46);
    for (let frame = 49; frame <= 67; frame += 1) {
      const scroll = (1231 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(sameTimeBottomState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(sameTimeBottomState).toMatchObject({ frame: 67, mode: "orbit", heading: 24, timer: 3, x: 129 + 106 / 256, y: 224 + 46 / 256, dead: false });

    expect(gunmanBottomDynamicPosition(34 / NES_FRAME_RATE, 112, 175, 75)).toEqual([(112 + 175 / 256) * NES_WORLD_X_SCALE, (226 + 75 / 256) * NES_WORLD_Y_SCALE]);
    const longTopState = createGunmanTopMovementState(136, 26, 136);
    for (let frame = 1; frame <= 1145; frame += 1) {
      const scroll = (1279 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(longTopState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(longTopState).toMatchObject({ frame: 1145, mode: "orbit", heading: 28, timer: 4, x: 140 / 256, y: 50 + 130 / 256, dead: false });
    const longTopReleaseScroll = (1279 + 2 / 3 + 1146 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(longTopState, 1146, 120, 215, (x, y) => roundActorCollisionAtNes(6, longTopReleaseScroll, x, y));
    expect(longTopState.dead).toBe(true);

    expect(gunmanBottomDynamicPosition(34 / NES_FRAME_RATE, 128, 45, 127)).toEqual([(128 + 45 / 256) * NES_WORLD_X_SCALE, (226 + 127 / 256) * NES_WORLD_Y_SCALE]);
    const sameTimeLateBottom = createGunmanBottomMovementState(184, 34, 164);
    for (let frame = 49; frame <= 389; frame += 1) {
      const scroll = (1535 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(sameTimeLateBottom, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(sameTimeLateBottom).toMatchObject({ frame: 389, mode: "orbit", heading: 0, timer: 2, x: 175 + 104 / 256, y: 0 + 18 / 256, dead: false });
    const sameTimeLateBottomReleaseScroll = (1535 + 2 / 3 + 390 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(sameTimeLateBottom, 390, 120, 215, (x, y) => roundActorCollisionAtNes(6, sameTimeLateBottomReleaseScroll, x, y));
    expect(sameTimeLateBottom.dead).toBe(true);

    const openingBottomState = createGunmanBottomMovementState(152, 94, 198);
    for (let frame = 49; frame <= 335; frame += 1) {
      const scroll = (175 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 186 ? 188 : Math.min(216, 188 + Math.floor((frame - 186) / 3) + 1);
      advanceGunmanFlankMovement(openingBottomState, frame, 136, playerY, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(openingBottomState).toMatchObject({ frame: 335, mode: "orbit", heading: 4, timer: 4, x: 87 + 56 / 256, y: 251 + 14 / 256, dead: false });
    const openingBottomReleaseScroll = (175 + 2 / 3 + 336 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(openingBottomState, 336, 136, 216, (x, y) => roundActorCollisionAtNes(6, openingBottomReleaseScroll, x, y));
    expect(openingBottomState.dead).toBe(true);

    const secondBottomState = createGunmanBottomMovementState(168, 82, 250);
    for (let frame = 49; frame <= 305; frame += 1) {
      const scroll = (191 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 138 ? 188 : Math.min(216, 188 + Math.floor((frame - 138) / 3) + 1);
      advanceGunmanFlankMovement(secondBottomState, frame, 136, playerY, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(secondBottomState).toMatchObject({ frame: 305, mode: "chase", heading: 7, timer: 3, x: 92 + 234 / 256, y: 251 + 16 / 256, dead: false });
    const secondBottomReleaseScroll = (191 + 2 / 3 + 306 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(secondBottomState, 306, 136, 216, (x, y) => roundActorCollisionAtNes(6, secondBottomReleaseScroll, x, y));
    expect(secondBottomState.dead).toBe(true);

    const nextBottomState = createGunmanBottomMovementState(104, 5, 117);
    for (let frame = 49; frame <= 383; frame += 1) {
      const scroll = (447 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(nextBottomState, frame, 136, 216, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(nextBottomState).toMatchObject({ frame: 383, mode: "orbit", heading: 12, timer: 1, x: 193 + 142 / 256, y: 251 + 240 / 256, dead: false });
    const nextBottomReleaseScroll = (447 + 2 / 3 + 384 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(nextBottomState, 384, 136, 216, (x, y) => roundActorCollisionAtNes(6, nextBottomReleaseScroll, x, y));
    expect(nextBottomState.dead).toBe(true);

    const shortLateBottomState = createGunmanBottomMovementState(168, 102, 222);
    for (let frame = 49; frame <= 149; frame += 1) {
      const scroll = (479 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(shortLateBottomState, frame, 136, 216, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(shortLateBottomState).toMatchObject({ frame: 149, mode: "orbit", heading: 24, timer: 0, x: 85 + 150 / 256, y: 251 + 222 / 256, dead: false });
    const shortLateBottomReleaseScroll = (479 + 2 / 3 + 150 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(shortLateBottomState, 150, 136, 216, (x, y) => roundActorCollisionAtNes(6, shortLateBottomReleaseScroll, x, y));
    expect(shortLateBottomState.dead).toBe(true);

    const secondLoopBottomState = createGunmanBottomMovementState(104, 79, 221);
    for (let frame = 49; frame <= 827; frame += 1) {
      const scroll = (559 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 171 ? 120 : 136;
      advanceGunmanFlankMovement(secondLoopBottomState, frame, playerX, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(secondLoopBottomState).toMatchObject({ frame: 827, mode: "roam", heading: 0, timer: 0, x: 175 + 102 / 256, y: 0 + 43 / 256, dead: false });
    const secondLoopBottomReleaseScroll = (559 + 2 / 3 + 828 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(secondLoopBottomState, 828, 120, 215, (x, y) => roundActorCollisionAtNes(6, secondLoopBottomReleaseScroll, x, y));
    expect(secondLoopBottomState.dead).toBe(true);

    const adjacentBottomState = createGunmanBottomMovementState(160, 83, 199);
    for (let frame = 49; frame <= 149; frame += 1) {
      const scroll = (847 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(adjacentBottomState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(adjacentBottomState).toMatchObject({ frame: 149, mode: "orbit", heading: 24, timer: 0, x: 77 + 131 / 256, y: 251 + 199 / 256, dead: false });
    const adjacentBottomReleaseScroll = (847 + 2 / 3 + 150 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(adjacentBottomState, 150, 120, 215, (x, y) => roundActorCollisionAtNes(6, adjacentBottomReleaseScroll, x, y));
    expect(adjacentBottomState.dead).toBe(true);

    const lateLoopBottomState = createGunmanBottomMovementState(120, 179, 229);
    for (let frame = 49; frame <= 379; frame += 1) {
      const scroll = (2879 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(lateLoopBottomState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(lateLoopBottomState).toMatchObject({ frame: 379, mode: "orbit", heading: 0, timer: 4, x: 120 + 179 / 256, y: 0 + 229 / 256, dead: false });
    const lateLoopBottomReleaseScroll = (2879 + 2 / 3 + 380 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(lateLoopBottomState, 380, 136, 215, (x, y) => roundActorCollisionAtNes(6, lateLoopBottomReleaseScroll, x, y));
    expect(lateLoopBottomState.dead).toBe(true);

    const contactBottom3951State = createGunmanBottomMovementState(104, 45, 34);
    for (let frame = 49; frame <= 190; frame += 1) {
      const scroll = (3951 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(contactBottom3951State, frame, 152, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(contactBottom3951State).toMatchObject({ frame: 190, mode: "orbit", heading: 8, timer: 1, x: 143 + 237 / 256, y: 214 + 110 / 256, dead: false });

    const longBottom4079State = createGunmanBottomMovementState(104, 100, 84);
    for (let frame = 49; frame <= 1496; frame += 1) {
      const scroll = (4079 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(longBottom4079State, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(longBottom4079State).toMatchObject({ frame: 1496, mode: "orbit", heading: 23, timer: 3, x: 198 + 188 / 256, y: 251 + 154 / 256, dead: false });
    const longBottom4079ReleaseScroll = (4079 + 2 / 3 + 1497 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(longBottom4079State, 1497, 136, 215, (x, y) => roundActorCollisionAtNes(6, longBottom4079ReleaseScroll, x, y));
    expect(longBottom4079State.dead).toBe(true);

    const shortBottom4335State = createGunmanBottomMovementState(168, 252, 74);
    for (let frame = 49; frame <= 149; frame += 1) {
      const scroll = (4335 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(shortBottom4335State, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(shortBottom4335State).toMatchObject({ frame: 149, mode: "orbit", heading: 24, timer: 0, x: 86 + 44 / 256, y: 251 + 74 / 256, dead: false });
    const shortBottom4335ReleaseScroll = (4335 + 2 / 3 + 150 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(shortBottom4335State, 150, 136, 215, (x, y) => roundActorCollisionAtNes(6, shortBottom4335ReleaseScroll, x, y));
    expect(shortBottom4335State.dead).toBe(true);

    const lateBottomRoutes = [
      { state: createGunmanBottomMovementState(88, 55, 134), last: 940, heading: 0, timer: 0, x: 175 + 253 / 256, y: 0 + 28 / 256, release: 941 },
      { state: createGunmanBottomMovementState(120, 29, 2), last: 919, heading: 0, timer: 2, x: 175 + 237 / 256, y: 0 + 235 / 256, release: 920 },
    ] as const;
    for (const route of lateBottomRoutes) {
      for (let frame = 49; frame <= route.last; frame += 1) {
        const scroll = (2207 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        const playerX = frame >= 219 ? 120 : 136;
        const playerY = frame >= 216 && frame < 219 ? 216 : 215;
        advanceGunmanFlankMovement(route.state, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
      const releaseScroll = (2207 + 2 / 3 + route.release / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(route.state, route.release, 120, 215, (x, y) => roundActorCollisionAtNes(6, releaseScroll, x, y));
      expect(route.state.dead).toBe(true);
    }

    const midBottomState = createGunmanBottomMovementState(152, 99, 144);
    for (let frame = 49; frame <= 353; frame += 1) {
      const scroll = (2479 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 267 ? 136 : 120;
      const playerY = frame >= 264 && frame < 267 ? 216 : 215;
      advanceGunmanFlankMovement(midBottomState, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(midBottomState).toMatchObject({ frame: 353, mode: "chase", heading: 6, timer: 4, x: 69 + 155 / 256, y: 251 + 24 / 256, dead: false });
    const midBottomReleaseScroll = (2479 + 2 / 3 + 354 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(midBottomState, 354, 136, 215, (x, y) => roundActorCollisionAtNes(6, midBottomReleaseScroll, x, y));
    expect(midBottomState.dead).toBe(true);

    const shotBottomState = createGunmanBottomMovementState(160, 8, 184);
    for (let frame = 49; frame <= 149; frame += 1) {
      const scroll = (1023 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(shotBottomState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(shotBottomState).toMatchObject({ frame: 149, mode: "orbit", heading: 24, timer: 0, x: 77 + 56 / 256, y: 251 + 184 / 256, dead: false });
    const shotBottomReleaseScroll = (1023 + 2 / 3 + 150 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(shotBottomState, 150, 120, 215, (x, y) => roundActorCollisionAtNes(6, shotBottomReleaseScroll, x, y));
    expect(shotBottomState.dead).toBe(true);

    const sameFrameTopState = createGunmanTopMovementState(88, 5, 97);
    for (let frame = 1; frame <= 323; frame += 1) {
      const scroll = (4623 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(sameFrameTopState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(sameFrameTopState).toMatchObject({ frame: 323, mode: "orbit", heading: 25, timer: 3, x: 192 + 29 / 256, y: 251 + 129 / 256, dead: false });
    const sameFrameTopReleaseScroll = (4623 + 2 / 3 + 324 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(sameFrameTopState, 324, 136, 215, (x, y) => roundActorCollisionAtNes(6, sameFrameTopReleaseScroll, x, y));
    expect(sameFrameTopState.dead).toBe(true);

    const round5BottomContactState = createGunmanBottomMovementState(216, 133, 5);
    for (let frame = 49; frame <= 118; frame += 1) {
      const scroll = (255 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5BottomContactState, frame, 168, 215, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5BottomContactState).toMatchObject({ frame: 118, mode: "orbit", heading: 0, timer: 3, x: 172 + 161 / 256, y: 227 + 5 / 256, dead: false });

    const round5Bottom511State = createGunmanBottomMovementState(88, 136, 22);
    const round5Bottom511PlayerY = [212, 209, 207, 205, 204, 203, 203, 204, 205, 207, 209, 212, 215, 216] as const;
    for (let frame = 49; frame <= 164; frame += 1) {
      const scroll = (511 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 73 ? 215 : round5Bottom511PlayerY[Math.min(frame - 73, round5Bottom511PlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5Bottom511State, frame, 168, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5Bottom511State).toMatchObject({ frame: 164, mode: "chase", heading: 6, timer: 0, x: 106 + 94 / 256, y: 251 + 132 / 256, dead: false });
    const round5Bottom511ReleaseScroll = (511 + 2 / 3 + 165 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5Bottom511State, 165, 168, 216, (x, y) => roundActorCollisionAtNes(5, round5Bottom511ReleaseScroll, x, y));
    expect(round5Bottom511State.dead).toBe(true);
  });

  it("routes the offset Round 6 top Gunman into the shared state machine", () => {
    expect(gunmanTopUsesDynamicState(5, 31)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 31, 168)).toEqual([70, 134]);
    expect(gunmanTopUsesDynamicState(5, 47)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 47, 192)).toEqual([40, 104, 296]);
    expect(gunmanTopUsesDynamicState(5, 207)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 207, 136)).toEqual([13, 269, 525, 845, 973, 1037]);
    expect(gunmanTopUsesDynamicState(5, 559)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 559, 64)).toEqual([13, 333]);
    expect(gunmanTopUsesDynamicState(5, 575)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 575, 88)).toEqual([77, 333, 397]);
    expect(gunmanTopUsesDynamicState(5, 623)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 623, 184)).toEqual([13, 333]);
    expect(gunmanTopUsesDynamicState(5, 639)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 639, 136)).toEqual([45]);
    expect(gunmanBottomUsesDynamicState(5, 655)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 655, 88)).toEqual([]);
    expect(gunmanBottomUsesDynamicState(5, 959)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 959, 216)).toEqual([296, 616, 848, 912, 976]);
    expect(gunmanBottomUsesDynamicState(5, 1311)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 1311, 32)).toEqual([225]);
    expect(gunmanFlankEventShotFrames(5, 1311, 88)).toEqual([212]);
    expect(gunmanTopUsesDynamicState(5, 1535)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 1535, 216)).toEqual([13, 333]);
    expect(gunmanTopUsesDynamicState(5, 1631)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 1631, 152)).toEqual([33, 161]);
    expect(gunmanTopUsesDynamicState(5, 1647)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 1647, 120)).toEqual([13, 397]);
    expect(gunmanTopUsesDynamicState(5, 879)).toBe(true);
    expect(gunmanFlankEventShotFrames(5, 879, 208)).toEqual([23]);
    expect(gunmanTopUsesDynamicState(6, 47)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 63)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 239)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 3295)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 3487)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 3551)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 3711)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 4415)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 4479)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 4511)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 4623)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 4639)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 4783)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 4911)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 4975)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 5087)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 5103)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 863)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 943)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 975)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 991)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 1407)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 1391)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 1455)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 1631)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 1871)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 1903)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 2015)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 2255)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 2447)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 2623)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 2687)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 2735)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 2751)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 3951)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 3215)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 2287)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 543)).toBe(true);
    expect(gunmanTopUsesDynamicState(6, 3263)).toBe(false);
    expect(gunmanFlankEventShotFrames(6, 4415)).toEqual([13, 397]);
    expect(gunmanFlankEventShotFrames(6, 4479)).toEqual([29]);
    expect(gunmanFlankEventShotFrames(6, 4511, 152)).toEqual([63]);
    expect(gunmanFlankEventShotFrames(6, 4511, 168)).toEqual([13]);
    expect(gunmanFlankEventShotFrames(6, 4623, 88)).toEqual([69]);
    expect(gunmanFlankEventShotFrames(6, 4623, 168)).toEqual([]);
    expect(gunmanFlankEventShotFrames(6, 4639, 144)).toEqual([13]);
    expect(gunmanFlankEventShotFrames(6, 4783, 200)).toEqual([22]);
    expect(gunmanFlankEventShotFrames(6, 4911, 128)).toEqual([47]);
    expect(gunmanFlankEventShotFrames(6, 4975, 96)).toEqual([21]);
    expect(gunmanFlankEventShotFrames(6, 5087, 80)).toEqual([13]);
    expect(gunmanFlankEventShotFrames(6, 5103, 96)).toEqual([32]);
    expect(gunmanFlankEventShotFrames(6, 863, 128)).toEqual([66]);
    expect(gunmanFlankEventShotFrames(6, 943, 144)).toEqual([76, 268]);
    expect(gunmanFlankEventShotFrames(6, 975, 224)).toEqual([33, 481]);
    expect(gunmanFlankEventShotFrames(6, 991, 184)).toEqual([13]);
    expect(gunmanFlankEventShotFrames(6, 1407, 104)).toEqual([55, 443]);
    expect(gunmanFlankEventShotFrames(6, 1391, 120)).toEqual([75]);
    expect(gunmanFlankEventShotFrames(6, 1455, 128)).toEqual([63]);
    expect(gunmanFlankEventShotFrames(6, 1631, 80)).toEqual([48]);
    expect(gunmanFlankEventShotFrames(6, 1871, 184)).toEqual([57, 313]);
    expect(gunmanFlankEventShotFrames(6, 1903, 152)).toEqual([57]);
    expect(gunmanFlankEventShotFrames(6, 2015, 104)).toEqual([13]);
    expect(gunmanFlankEventShotFrames(6, 2015, 128)).toEqual([37]);
    expect(gunmanFlankEventShotFrames(6, 2255, 112)).toEqual([76, 268]);
    expect(gunmanFlankEventShotFrames(6, 2447, 184)).toEqual([13, 397, 717]);
    expect(gunmanFlankEventShotFrames(6, 2623, 128)).toEqual([13]);
    expect(gunmanFlankEventShotFrames(6, 2687, 136)).toEqual([77]);
    expect(gunmanFlankEventShotFrames(6, 2735, 184)).toEqual([13]);
    expect(gunmanFlankEventShotFrames(6, 2751, 88)).toEqual([40, 104, 168, 232, 296]);
    expect(gunmanFlankEventShotFrames(6, 3951, 96)).toEqual([15, 271, 463]);
    expect(gunmanFlankEventShotFrames(6, 3215, 96)).toEqual([16]);
    expect(gunmanFlankEventShotFrames(6, 2287, 104)).toEqual([39, 487]);
    expect(gunmanFlankEventShotFrames(6, 543, 88)).toEqual([13, 397]);
    expect(gunmanFlankEventShotFrames(6, 47, 168)).toEqual([24]);
    expect(gunmanFlankEventShotFrames(6, 63, 184)).toEqual([29]);
    expect(gunmanFlankEventShotFrames(6, 239, 176)).toEqual([36]);
    expect(gunmanFirstOpportunityFrame(43, 0)).toBe(62);
    const state = createGunmanTopMovementState(64, 199, 25);
    for (let frame = 1; frame <= 744; frame += 1) {
      const scroll = (3295 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(state, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(state).toMatchObject({ frame: 744, mode: "orbit", heading: 24, timer: 1, x: 209 / 256, y: 215 + 238 / 256, dead: false });
    const releaseScroll = (3295 + 2 / 3 + 745 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(state, 745, 136, 215, (x, y) => roundActorCollisionAtNes(6, releaseScroll, x, y));
    expect(state.dead).toBe(true);

    const shortState = createGunmanTopMovementState(168, 186, 202);
    for (let frame = 1; frame <= 305; frame += 1) {
      const scroll = (3487 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(shortState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(shortState).toMatchObject({ frame: 305, mode: "orbit", heading: 23, timer: 0, x: 183 + 93 / 256, y: 251 + 242 / 256, dead: false });
    const shortReleaseScroll = (3487 + 2 / 3 + 306 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(shortState, 306, 136, 215, (x, y) => roundActorCollisionAtNes(6, shortReleaseScroll, x, y));
    expect(shortState.dead).toBe(true);

    expect(gunmanFirstOpportunityFrame(49, 0)).toBe(60);
    const repeatedState = createGunmanTopMovementState(88, 253, 238);
    for (let frame = 1; frame <= 523; frame += 1) {
      const scroll = (3551 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(repeatedState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(repeatedState).toMatchObject({ frame: 523, mode: "orbit", heading: 22, timer: 4, x: 202 + 40 / 256, y: 251 + 212 / 256, dead: false });
    const repeatedReleaseScroll = (3551 + 2 / 3 + 524 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(repeatedState, 524, 136, 215, (x, y) => roundActorCollisionAtNes(6, repeatedReleaseScroll, x, y));
    expect(repeatedState.dead).toBe(true);

    expect(gunmanFirstOpportunityFrame(30, 0)).toBe(66);
    const lateState = createGunmanTopMovementState(136, 203, 51);
    for (let frame = 1; frame <= 286; frame += 1) {
      const scroll = (3711 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(lateState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(lateState).toMatchObject({ frame: 286, mode: "orbit", heading: 24, timer: 0, x: 39 / 256, y: 215 + 51 / 256, dead: false });
    const lateReleaseScroll = (3711 + 2 / 3 + 287 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(lateState, 287, 136, 215, (x, y) => roundActorCollisionAtNes(6, lateReleaseScroll, x, y));
    expect(lateState.dead).toBe(true);

    const laterState = createGunmanTopMovementState(216, 31, 173);
    for (let frame = 1; frame <= 602; frame += 1) {
      const scroll = (4415 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(laterState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(laterState).toMatchObject({ frame: 602, mode: "orbit", heading: 14, timer: 4, x: 204 + 221 / 256, y: 251 + 104 / 256, dead: false });
    const laterReleaseScroll = (4415 + 2 / 3 + 603 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(laterState, 603, 136, 215, (x, y) => roundActorCollisionAtNes(6, laterReleaseScroll, x, y));
    expect(laterState.dead).toBe(true);

    const shortLaterState = createGunmanTopMovementState(96, 161, 100);
    for (let frame = 1; frame <= 314; frame += 1) {
      const scroll = (4479 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(shortLaterState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(shortLaterState).toMatchObject({ frame: 314, mode: "orbit", heading: 25, timer: 0, x: 194 + 250 / 256, y: 251 + 83 / 256, dead: false });
    const shortLaterReleaseScroll = (4479 + 2 / 3 + 315 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(shortLaterState, 315, 136, 215, (x, y) => roundActorCollisionAtNes(6, shortLaterReleaseScroll, x, y));
    expect(shortLaterState.dead).toBe(true);

    const sameFrameState = createGunmanTopMovementState(152, 250, 204);
    for (let frame = 1; frame <= 482; frame += 1) {
      const scroll = (4511 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(sameFrameState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(sameFrameState).toMatchObject({ frame: 482, mode: "orbit", heading: 12, timer: 1, x: 140 + 22 / 256, y: 203 + 89 / 256, dead: false });

    const offsetSameFrameState = createGunmanTopMovementState(168, 127, 18);
    for (let frame = 1; frame <= 505; frame += 1) {
      const scroll = (4511 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(offsetSameFrameState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(offsetSameFrameState).toMatchObject({ frame: 505, mode: "orbit", heading: 12, timer: 3, x: 140 + 240 / 256, y: 203 + 246 / 256, dead: false });

    const laterSameFrameTopState = createGunmanTopMovementState(144, 79, 227);
    for (let frame = 1; frame <= 294; frame += 1) {
      const scroll = (4639 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(laterSameFrameTopState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(laterSameFrameTopState).toMatchObject({ frame: 294, mode: "orbit", heading: 24, timer: 3, x: 187 / 256, y: 218 + 213 / 256, dead: false });
    const laterSameFrameTopReleaseScroll = (4639 + 2 / 3 + 295 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(laterSameFrameTopState, 295, 136, 215, (x, y) => roundActorCollisionAtNes(6, laterSameFrameTopReleaseScroll, x, y));
    expect(laterSameFrameTopState.dead).toBe(true);

    const laterTopState = createGunmanTopMovementState(200, 52, 135);
    for (let frame = 1; frame <= 382; frame += 1) {
      const scroll = (4783 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(laterTopState, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(laterTopState).toMatchObject({ frame: 382, mode: "orbit", heading: 27, timer: 0, x: 90 / 256, y: 102 + 201 / 256, dead: false });
    const laterTopReleaseScroll = (4783 + 2 / 3 + 383 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(laterTopState, 383, 136, 215, (x, y) => roundActorCollisionAtNes(6, laterTopReleaseScroll, x, y));
    expect(laterTopState.dead).toBe(true);

    const tailRoutes = [
      { at: 4911, x: 128, fineX: 76, fineY: 175, last: 276, heading: 24, timer: 0, lastX: 184 / 256, lastY: 212 + 140 / 256, release: 277, playerX: 136 },
      { at: 4975, x: 96, fineX: 124, fineY: 235, last: 332, heading: 25, timer: 3, lastX: 179 + 154 / 256, lastY: 251 + 98 / 256, release: 333, playerX: 136 },
      { at: 5087, x: 80, fineX: 224, fineY: 99, last: 329, heading: 25, timer: 3, lastX: 192 + 135 / 256, lastY: 251 + 116 / 256, release: 330, playerX: 136 },
      { at: 5103, x: 96, fineX: 116, fineY: 175, last: 314, heading: 25, timer: 0, lastX: 194 + 245 / 256, lastY: 251 + 146 / 256, release: 315, playerX: 136 },
      { at: 975, x: 224, fineX: 189, fineY: 108, last: 728, heading: 19, timer: 2, lastX: 192 + 64 / 256, lastY: 251 + 71 / 256, release: 729, playerX: 120 },
      { at: 991, x: 184, fineX: 145, fineY: 50, last: 488, heading: 18, timer: 2, lastX: 196 + 86 / 256, lastY: 250 + 106 / 256, release: 489, playerX: 120 },
      { at: 1407, x: 104, fineX: 124, fineY: 194, last: 762, heading: 28, timer: 1, lastX: 144 / 256, lastY: 52 + 97 / 256, release: 763, playerX: 120 },
      { at: 1391, x: 120, fineX: 180, fineY: 31, last: 386, heading: 0, timer: 4, lastX: 108 + 72 / 256, lastY: 0 + 31 / 256, release: 387, playerX: 120 },
      { at: 1455, x: 128, fineX: 4, fineY: 215, last: 398, heading: 0, timer: 1, lastX: 108 + 208 / 256, lastY: 0 + 208 / 256, release: 399, playerX: 120 },
    ] as const;
    for (const route of tailRoutes) {
      const routeState = createGunmanTopMovementState(route.x, route.fineX, route.fineY);
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (route.at + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        advanceGunmanFlankMovement(routeState, frame, route.playerX, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
      }
      expect(routeState).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: route.timer, x: route.lastX, y: route.lastY, dead: false });
      const releaseScroll = (route.at + 2 / 3 + route.release / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(routeState, route.release, route.playerX, 215, (x, y) => roundActorCollisionAtNes(6, releaseScroll, x, y));
      expect(routeState.dead).toBe(true);
    }

    const dispatchTransitionState = createGunmanTopMovementState(80, 4, 139);
    for (let frame = 1; frame <= 207; frame += 1) {
      const scroll = (1631 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(dispatchTransitionState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(dispatchTransitionState).toMatchObject({ frame: 207, mode: "orbit", heading: 7, timer: 3, x: 162 + 109 / 256, y: 169 + 206 / 256, dead: false });

    const openingTopState = createGunmanTopMovementState(168, 217, 143);
    for (let frame = 1; frame <= 233; frame += 1) {
      const scroll = (47 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(openingTopState, frame, 136, 188, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(openingTopState).toMatchObject({ frame: 233, mode: "chase", heading: 11, timer: 4, x: 81 + 155 / 256, y: 146 + 109 / 256, dead: false });

    const secondOpeningTopState = createGunmanTopMovementState(184, 129, 179);
    for (let frame = 1; frame <= 246; frame += 1) {
      const scroll = (63 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(secondOpeningTopState, frame, 136, 188, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(secondOpeningTopState).toMatchObject({ frame: 246, mode: "chase", heading: 11, timer: 1, x: 81 + 77 / 256, y: 146 + 6 / 256, dead: false });

    const thirdOpeningTopState = createGunmanTopMovementState(176, 254, 198);
    for (let frame = 1; frame <= 443; frame += 1) {
      const scroll = (239 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(thirdOpeningTopState, frame, 136, 216, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(thirdOpeningTopState).toMatchObject({ frame: 443, mode: "orbit", heading: 0, timer: 4, x: 133 + 237 / 256, y: 0 + 125 / 256, dead: false });
    const thirdOpeningReleaseScroll = (239 + 2 / 3 + 444 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(thirdOpeningTopState, 444, 136, 216, (x, y) => roundActorCollisionAtNes(6, thirdOpeningReleaseScroll, x, y));
    expect(thirdOpeningTopState.dead).toBe(true);

    const fourthOpeningTopState = createGunmanTopMovementState(184, 110, 188);
    for (let frame = 1; frame <= 350; frame += 1) {
      const scroll = (1871 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(fourthOpeningTopState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(fourthOpeningTopState).toMatchObject({ frame: 350, mode: "chase", heading: 11, timer: 3, x: 47 + 98 / 256, y: 153 + 218 / 256, dead: false });

    const fifthOpeningTopState = createGunmanTopMovementState(152, 126, 176);
    for (let frame = 1; frame <= 207; frame += 1) {
      const scroll = (1903 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(fifthOpeningTopState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(fifthOpeningTopState).toMatchObject({ frame: 207, mode: "orbit", heading: 25, timer: 4, x: 72 + 174 / 256, y: 173 + 234 / 256, dead: false });

    const simultaneousTopStates = [
      { state: createGunmanTopMovementState(104, 101, 255), last: 207, heading: 7, x: 181 + 21 / 256, y: 174 + 197 / 256 },
      { state: createGunmanTopMovementState(128, 5, 39), last: 181, heading: 24, x: 79 + 1 / 256, y: 181 + 32 / 256 },
    ] as const;
    for (const route of simultaneousTopStates) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const scroll = (2015 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
        const playerX = frame >= 123 ? 136 : 120;
        const playerY = frame >= 120 && frame < 123 ? 216 : 215;
        advanceGunmanFlankMovement(route.state, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: "orbit", heading: route.heading, timer: 4, x: route.x, y: route.y, dead: false });
    }

    const playerShiftTopState = createGunmanTopMovementState(112, 110, 146);
    for (let frame = 1; frame <= 376; frame += 1) {
      const scroll = (2255 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 75 ? 120 : 136;
      const playerY = frame >= 72 && frame < 75 ? 216 : 215;
      advanceGunmanFlankMovement(playerShiftTopState, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(playerShiftTopState).toMatchObject({ frame: 376, mode: "orbit", heading: 7, timer: 1, x: 164 + 29 / 256, y: 170 + 182 / 256, dead: false });

    const longMidTopState = createGunmanTopMovementState(184, 115, 48);
    for (let frame = 1; frame <= 926; frame += 1) {
      const scroll = (2447 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 363 ? 136 : 120;
      const playerY = frame >= 360 && frame < 363 ? 216 : 215;
      advanceGunmanFlankMovement(longMidTopState, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(longMidTopState).toMatchObject({ frame: 926, mode: "orbit", heading: 24, timer: 2, x: 197 + 158 / 256, y: 251 + 27 / 256, dead: false });
    const longMidTopReleaseScroll = (2447 + 2 / 3 + 927 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(longMidTopState, 927, 136, 215, (x, y) => roundActorCollisionAtNes(6, longMidTopReleaseScroll, x, y));
    expect(longMidTopState.dead).toBe(true);

    const extraTopRoutes = [
      { state: createGunmanTopMovementState(128, 155, 24), last: 181, heading: 24, timer: 0, x: 79 + 99 / 256, y: 180 + 3 / 256 },
      { state: createGunmanTopMovementState(136, 51, 135), last: 181, heading: 24, timer: 0, x: 86 + 131 / 256, y: 180 + 135 / 256 },
      { state: createGunmanTopMovementState(184, 154, 44), last: 259, heading: 19, timer: 2, x: 63 + 218 / 256, y: 158 + 248 / 256 },
      { state: createGunmanTopMovementState(88, 141, 235), last: 437, heading: 13, timer: 1, x: 140 + 62 / 256, y: 202 + 180 / 256 },
      { state: createGunmanTopMovementState(96, 64, 127), last: 447, heading: 26, timer: 0, x: 0 + 167 / 256, y: 148 + 61 / 256 },
      { state: createGunmanTopMovementState(88, 34, 71), last: 641, heading: 12, timer: 2, x: 124 + 16 / 256, y: 202 + 114 / 256 },
      { state: createGunmanTopMovementState(104, 165, 131), last: 979, heading: 1, timer: 2, x: 167 + 243 / 256, y: 0 + 169 / 256 },
      { state: createGunmanTopMovementState(96, 40, 236), last: 1090, heading: 17, timer: 1, x: 209 + 66 / 256, y: 251 + 32 / 256 },
    ] as const;
    for (const route of extraTopRoutes) {
      for (let frame = 1; frame <= route.last; frame += 1) {
        const routeAt = route.state === extraTopRoutes[0].state ? 2623 : route.state === extraTopRoutes[1].state ? 2687 : route.state === extraTopRoutes[2].state ? 2735 : route.state === extraTopRoutes[3].state ? 2751 : route.state === extraTopRoutes[4].state ? 3215 : route.state === extraTopRoutes[5].state ? 543 : route.state === extraTopRoutes[6].state ? 2287 : 3951;
        const scroll = routeAt + 2 / 3 + frame / 3;
        const playerX = routeAt === 543 ? frame >= 219 ? 120 : 136 : routeAt === 2287 ? frame >= 843 ? 136 : 120 : routeAt === 3951 ? frame >= 267 ? 136 : 152 : 136;
        const playerY = routeAt === 543 ? frame < 219 ? 216 : 215 : routeAt === 2287 ? frame >= 840 && frame < 843 ? 216 : 215 : routeAt === 3951 && frame >= 264 && frame < 267 ? 216 : 215;
        advanceGunmanFlankMovement(route.state, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(6, scroll * NES_WORLD_Y_SCALE, x, y));
      }
      expect(route.state).toMatchObject({ frame: route.last, mode: route.heading === 19 ? "chase" : "orbit", heading: route.heading, timer: route.timer, x: route.x, y: route.y, dead: false });
    }

    const earlyTopState = createGunmanTopMovementState(128, 7, 56);
    for (let frame = 1; frame <= 431; frame += 1) {
      const scroll = (863 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(earlyTopState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(earlyTopState).toMatchObject({ frame: 431, mode: "orbit", heading: 11, timer: 2, x: 175 + 33 / 256, y: 251 + 16 / 256, dead: false });
    const earlyTopReleaseScroll = (863 + 2 / 3 + 432 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(earlyTopState, 432, 120, 215, (x, y) => roundActorCollisionAtNes(6, earlyTopReleaseScroll, x, y));
    expect(earlyTopState.dead).toBe(true);

    const contactTopState = createGunmanTopMovementState(144, 242, 112);
    for (let frame = 1; frame <= 488; frame += 1) {
      const scroll = (943 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(contactTopState, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(contactTopState).toMatchObject({ frame: 488, mode: "orbit", heading: 12, timer: 1, x: 123 + 237 / 256, y: 202 + 112 / 256, dead: false });

    const round5OpeningTopState = createGunmanTopMovementState(168, 68, 181);
    for (let frame = 1; frame <= 364; frame += 1) {
      const scroll = (31 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 363 ? 168 : frame >= 315 ? 120 : 136;
      const playerY = frame >= 360 && frame < 363 ? 216 : frame < 231 ? 188 : Math.min(216, 188 + Math.floor((frame - 231) / 3) + 1);
      advanceGunmanFlankMovement(round5OpeningTopState, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5OpeningTopState).toMatchObject({ frame: 364, mode: "orbit", heading: 2, timer: 2, x: 232 + 124 / 256, y: 0 + 92 / 256, dead: false });
    const round5OpeningReleaseScroll = (31 + 2 / 3 + 365 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5OpeningTopState, 365, 168, 215, (x, y) => roundActorCollisionAtNes(5, round5OpeningReleaseScroll, x, y));
    expect(round5OpeningTopState.dead).toBe(true);

    const round5SecondTopState = createGunmanTopMovementState(192, 160, 233);
    for (let frame = 1; frame <= 701; frame += 1) {
      const scroll = (47 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 315 ? 168 : frame >= 267 ? 120 : 136;
      const playerY = frame >= 312 && frame < 315 ? 216 : frame < 183 ? 188 : frame < 267 ? Math.min(216, 188 + Math.floor((frame - 183) / 3) + 1) : 215;
      advanceGunmanFlankMovement(round5SecondTopState, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5SecondTopState).toMatchObject({ frame: 701, mode: "orbit", heading: 0, timer: 1, x: 171 + 158 / 256, y: 0 + 146 / 256, dead: false });
    const round5SecondReleaseScroll = (47 + 2 / 3 + 702 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5SecondTopState, 702, 168, 215, (x, y) => roundActorCollisionAtNes(5, round5SecondReleaseScroll, x, y));
    expect(round5SecondTopState.dead).toBe(true);

    const round5ThirdTopState = createGunmanTopMovementState(136, 16, 198);
    const round5ThirdPlayerY = [212, 209, 207, 205, 204, 203, 203, 204, 205, 207, 209, 212, 215, 216] as const;
    for (let frame = 1; frame <= 1181; frame += 1) {
      const scroll = (207 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 985 ? 215 : round5ThirdPlayerY[Math.min(frame - 985, round5ThirdPlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5ThirdTopState, frame, 168, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5ThirdTopState).toMatchObject({ frame: 1181, mode: "chase", heading: 6, timer: 0, x: 100 + 20 / 256, y: 251 + 253 / 256, dead: false });
    const round5ThirdReleaseScroll = (207 + 2 / 3 + 1182 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5ThirdTopState, 1182, 168, 216, (x, y) => roundActorCollisionAtNes(5, round5ThirdReleaseScroll, x, y));
    expect(round5ThirdTopState.dead).toBe(true);

    const round5FourthTopState = createGunmanTopMovementState(64, 132, 47);
    const round5FourthPlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 1; frame <= 440; frame += 1) {
      const scroll = (559 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 316 ? 216 : round5FourthPlayerY[Math.min(frame - 316, round5FourthPlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5FourthTopState, frame, 168, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5FourthTopState).toMatchObject({ frame: 440, mode: "chase", heading: 6, timer: 0, x: 99 + 226 / 256, y: 251 + 13 / 256, dead: false });
    const round5FourthReleaseScroll = (559 + 2 / 3 + 441 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5FourthTopState, 441, 168, 216, (x, y) => roundActorCollisionAtNes(5, round5FourthReleaseScroll, x, y));
    expect(round5FourthTopState.dead).toBe(true);

    const round5FifthTopState = createGunmanTopMovementState(88, 132, 47);
    const round5FifthPlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 1; frame <= 602; frame += 1) {
      const scroll = (575 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 268 ? 216 : round5FifthPlayerY[Math.min(frame - 268, round5FifthPlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5FifthTopState, frame, 168, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5FifthTopState).toMatchObject({ frame: 602, mode: "orbit", heading: 12, timer: 2, x: 172 + 147 / 256, y: 204 + 231 / 256, dead: false });

    const round5SixthTopState = createGunmanTopMovementState(184, 139, 123);
    const round5SixthPlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 1; frame <= 522; frame += 1) {
      const scroll = (623 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 124 ? 216 : round5SixthPlayerY[Math.min(frame - 124, round5SixthPlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5SixthTopState, frame, 168, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5SixthTopState).toMatchObject({ frame: 522, mode: "orbit", heading: 12, timer: 3, x: 172 + 168 / 256, y: 204 + 218 / 256, dead: false });

    const round5SeventhTopState = createGunmanTopMovementState(208, 210, 65);
    const round5SeventhPlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 1; frame <= 353; frame += 1) {
      const scroll = (879 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 172 ? 216 : round5SeventhPlayerY[Math.min(frame - 172, round5SeventhPlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5SeventhTopState, frame, 168, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5SeventhTopState).toMatchObject({ frame: 353, mode: "orbit", heading: 2, timer: 1, x: 255 + 218 / 256, y: 51 + 236 / 256, dead: false });
    const round5SeventhReleaseScroll = (879 + 2 / 3 + 354 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5SeventhTopState, 354, 168, 216, (x, y) => roundActorCollisionAtNes(5, round5SeventhReleaseScroll, x, y));
    expect(round5SeventhTopState.dead).toBe(true);

    const round5LateBottomState = createGunmanBottomMovementState(216, 144, 6);
    const round5LateBottomPlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 49; frame <= 1775; frame += 1) {
      const scroll = (959 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerX = frame >= 987 ? 104 : frame >= 891 ? 184 : 168;
      const playerY = frame >= 268 && frame < 281 ? round5LateBottomPlayerY[frame - 268]! : frame >= 891 && frame < 984 ? 215 : frame >= 987 ? 215 : 216;
      advanceGunmanFlankMovement(round5LateBottomState, frame, playerX, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5LateBottomState).toMatchObject({ frame: 1775, mode: "orbit", heading: 0, timer: 3, x: 156 + 9 / 256, y: 251 + 243 / 256, dead: false });
    const round5LateBottomReleaseScroll = (959 + 2 / 3 + 1776 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5LateBottomState, 1776, 104, 216, (x, y) => roundActorCollisionAtNes(5, round5LateBottomReleaseScroll, x, y));
    expect(round5LateBottomState.dead).toBe(true);

    const round5ContactBottomState = createGunmanBottomMovementState(32, 227, 4);
    for (let frame = 49; frame <= 263; frame += 1) {
      const scroll = (1311 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5ContactBottomState, frame, 104, 215, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5ContactBottomState).toMatchObject({ frame: 263, mode: "orbit", heading: 12, timer: 2, x: 108 + 32 / 256, y: 203 + 136 / 256, dead: false });

    const round5LongBottomState = createGunmanBottomMovementState(88, 164, 14);
    const round5LongBottomPlayerY = [212, 209, 207, 205, 204, 203, 203, 204, 205, 207, 209, 212, 215, 216] as const;
    for (let frame = 49; frame <= 719; frame += 1) {
      const scroll = (1311 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame >= 553 && frame < 567 ? round5LongBottomPlayerY[frame - 553]! : 215;
      advanceGunmanFlankMovement(round5LongBottomState, frame, 104, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5LongBottomState).toMatchObject({ frame: 719, mode: "orbit", heading: 24, timer: 2, x: 147 + 112 / 256, y: 251 + 90 / 256, dead: false });
    const round5LongBottomReleaseScroll = (1311 + 2 / 3 + 720 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5LongBottomState, 720, 104, 216, (x, y) => roundActorCollisionAtNes(5, round5LongBottomReleaseScroll, x, y));
    expect(round5LongBottomState.dead).toBe(true);

    const round5FinalTopState = createGunmanTopMovementState(216, 190, 39);
    for (let frame = 1; frame <= 479; frame += 1) {
      const scroll = (1535 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(round5FinalTopState, frame, 104, 216, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5FinalTopState).toMatchObject({ frame: 479, mode: "chase", heading: 26, timer: 0, x: 188 + 90 / 256, y: 251 + 185 / 256, dead: false });
    const round5FinalTopReleaseScroll = (1535 + 2 / 3 + 480 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5FinalTopState, 480, 104, 216, (x, y) => roundActorCollisionAtNes(5, round5FinalTopReleaseScroll, x, y));
    expect(round5FinalTopState.dead).toBe(true);

    const round5LateTopState = createGunmanTopMovementState(152, 190, 39);
    for (let frame = 1; frame <= 367; frame += 1) {
      const scroll = (1631 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 364 ? 216 : 216 - Math.min(10, frame - 363);
      advanceGunmanFlankMovement(round5LateTopState, frame, 104, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5LateTopState).toMatchObject({ frame: 367, mode: "orbit", heading: 26, timer: 3, x: 0 + 97 / 256, y: 150 + 218 / 256, dead: false });
    const round5LateTopReleaseScroll = (1631 + 2 / 3 + 368 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(round5LateTopState, 368, 104, 206, (x, y) => roundActorCollisionAtNes(5, round5LateTopReleaseScroll, x, y));
    expect(round5LateTopState.dead).toBe(true);

    const round5LateTop1647State = createGunmanTopMovementState(120, 180, 60);
    const round5LateTop1647PlayerY = [213, 210, 208, 206, 205, 204, 204, 205, 206, 208, 210, 213, 216] as const;
    for (let frame = 1; frame <= 626; frame += 1) {
      const scroll = (1647 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      const playerY = frame < 316 ? 216 : round5LateTop1647PlayerY[Math.min(frame - 316, round5LateTop1647PlayerY.length - 1)]!;
      advanceGunmanFlankMovement(round5LateTop1647State, frame, 104, playerY, (x, y) => roundActorCollisionAtNes(5, scroll, x, y));
    }
    expect(round5LateTop1647State).toMatchObject({ frame: 626, mode: "orbit", heading: 26, timer: 0, x: 0 + 17 / 256, y: 151 + 14 / 256, dead: false });
  });

  it("routes the isolated Round 6 top Gunman at 367", () => {
    const state = createGunmanTopMovementState(200, 152, 0);
    for (let frame = 1; frame <= 615; frame += 1) {
      const scroll = (367 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(state, frame, 136, 216, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(state).toMatchObject({ frame: 615, heading: 15, timer: 1, x: 203 + 92 / 256, y: 251 + 52 / 256, dead: false });
    const releaseScroll = (367 + 2 / 3 + 616 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(state, 616, 136, 216, (x, y) => roundActorCollisionAtNes(6, releaseScroll, x, y));
    expect(state.dead).toBe(true);
  });

  it("matches the Round 6 side Gunman at 2143 through its lunge handoff", () => {
    expect(gunmanFlankUsesDynamicState(8, 32, 6, 1, 2143)).toBe(true);
    expect(gunmanFlankEventShotFrames(6, 2143, 4)).toEqual([64]);
    const state = createGunmanFlankMovementState(8, 4, 32, false, 232, 0);
    state.x -= 1;
    for (let frame = 1; frame <= 246; frame += 1) {
      const scroll = (2143 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(state, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(state).toMatchObject({ frame: 246, heading: 8, x: 36 + 96 / 256, y: 115, dead: false });
  });

  it("matches the Round 6 side Gunman at 4223 through its lunge handoff", () => {
    expect(gunmanFlankUsesDynamicState(8, 32, 6, 1, 4223)).toBe(true);
    expect(gunmanFlankEventShotFrames(6, 4223, 4)).toEqual([66, 130, 194]);
    const state = createGunmanFlankMovementState(8, 4, 32, false, 180, 0);
    for (let frame = 1; frame <= 246; frame += 1) {
      const scroll = (4223 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(state, frame, 136, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(state).toMatchObject({ frame: 246, heading: 8, x: 100 + 28 / 256, y: 115, dead: false });
  });

  it("matches the isolated Round 6 left Gunman at 1679", () => {
    expect(gunmanFlankUsesDynamicState(7, 64, 6, 0, 1679, false)).toBe(true);
    expect(gunmanFlankEventShotFrames(6, 1679, 4)).toEqual([92]);
    const state = createGunmanFlankMovementState(7, 4, 64, false, 20, 0);
    for (let frame = 1; frame <= 917; frame += 1) {
      const scroll = (1679 + 2 / 3 + frame / 3) * NES_WORLD_Y_SCALE;
      advanceGunmanFlankMovement(state, frame, 120, 215, (x, y) => roundActorCollisionAtNes(6, scroll, x, y));
    }
    expect(state).toMatchObject({ frame: 917, heading: 21, timer: 4, x: 204 + 32 / 256, y: 250 + 206 / 256, dead: false });
    const releaseScroll = (1679 + 2 / 3 + 918 / 3) * NES_WORLD_Y_SCALE;
    advanceGunmanFlankMovement(state, 918, 120, 215, (x, y) => roundActorCollisionAtNes(6, releaseScroll, x, y));
    expect(state.dead).toBe(true);
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
    expect([8, 9, 12, 13, 20, 21].map((frame) => banditBillOpeningY(frame / NES_FRAME_RATE) / NES_WORLD_Y_SCALE)).toEqual([0, 2, 8, 8, 8, 10]);
    expect(banditBillOpeningY(BANDIT_BILL_ENTRY_DURATION / 2)).toBe(72);
    expect(banditBillOpeningY(BANDIT_BILL_ENTRY_DURATION)).toBe(144);
    expect(banditBillProjectileVelocity(192 * NES_WORLD_X_SCALE, 72 * NES_WORLD_Y_SCALE, 88 * NES_WORLD_X_SCALE, 215 * NES_WORLD_Y_SCALE)).toEqual([-1.37109375 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 2.484375 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION)).toBe(720);
    expect([1, 7, 8, 9, 10, 11].map((frame) => banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + frame / NES_FRAME_RATE) / NES_WORLD_Y_SCALE)).toEqual([64, 64, 66, 68, 70, 72]);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 11 / NES_FRAME_RATE)).toBe(162);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 119 / NES_FRAME_RATE)).toBeCloseTo(110.25, 9);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION + 227 / NES_FRAME_RATE)).toBeCloseTo(551.25, 9);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 768 / NES_FRAME_RATE)).toBe(256.5);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION + 1104 / NES_FRAME_RATE)).toBe(622.5);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION + 3472 / NES_FRAME_RATE)).toBeCloseTo(190 * NES_WORLD_X_SCALE, 9);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 3472 / NES_FRAME_RATE)).toBeCloseTo(67 * NES_WORLD_Y_SCALE, 9);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 3504 / NES_FRAME_RATE)).toBeCloseTo(67 * NES_WORLD_Y_SCALE, 9);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 3505 / NES_FRAME_RATE)).toBeLessThan(68 * NES_WORLD_Y_SCALE);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION + 4000 / NES_FRAME_RATE)).toBeCloseTo(125 * NES_WORLD_X_SCALE, 9);
    expect(banditBillCombatX(BANDIT_BILL_ENTRY_DURATION + 7584 / NES_FRAME_RATE)).toBeCloseTo(187 * NES_WORLD_X_SCALE, 9);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 7680 / NES_FRAME_RATE)).toBeCloseTo(107 * NES_WORLD_Y_SCALE, 9);
    expect(banditBillCombatY(BANDIT_BILL_ENTRY_DURATION + 4000 / NES_FRAME_RATE)).not.toBe(67 * NES_WORLD_Y_SCALE);
  });

  it("matches the traced Bandit Bill damage recovery", () => {
    expect(BANDIT_BILL_HIT_STUN_DURATION).toBeCloseTo(8 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_CRAWL_DURATION).toBeCloseTo(168 / NES_FRAME_RATE, 9);
    expect(BANDIT_BILL_DAMAGE_RECOVERY_DURATION).toBeCloseTo(176 / NES_FRAME_RATE, 9);
  });

  it("continues Bandit Bill from the sampled route", () => {
    expect(BANDIT_BILL_RANDOM_ROUTE_START_FRAME).toBe(7_584);
    expect([BANDIT_BILL_RANDOM_HANDOFF_FINE_X, BANDIT_BILL_RANDOM_HANDOFF_FINE_Y, BANDIT_BILL_ATTACK_PAUSE_FRAMES, BANDIT_BILL_ROUTE_HANDOFF_PAUSE_FRAMES]).toEqual([64, 200, 37, 24]);
    const movement = createBanditBillMovementState(187, 95);
    advanceBanditBillMovement(movement, BANDIT_BILL_RANDOM_ROUTE_START_FRAME + 25, () => 0xd5);
    expect({ frame: movement.frame, x: Math.floor(movement.x), y: Math.floor(movement.y), pause: movement.pauseFrames }).toEqual({ frame: 7_609, x: 187, y: 95, pause: 0 });
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
    expect([0, 7, 8, 11].map((frame) => cutterOpeningY(frame / NES_FRAME_RATE) / NES_WORLD_Y_SCALE)).toEqual([0, 0, 2, 8]);
    expect(cutterOpeningY(142 / NES_FRAME_RATE)).toBe(216);
    expect(cutterOpeningY(213 / NES_FRAME_RATE)).toBe(319.5);
    expect(cutterOpeningY(250 / NES_FRAME_RATE)).toBe(265.5);
    expect(cutterOpeningY(CUTTER_ENTRY_DURATION)).toBe(306);
    expect(cutterOpeningX(258 / NES_FRAME_RATE)).toBe(540);
    expect(cutterOpeningX(308 / NES_FRAME_RATE)).toBe(461.25);
    expect(cutterOpeningX(CUTTER_ENTRY_DURATION)).toBe(483.75);
    expect(cutterOpeningX(CUTTER_ENTRY_DURATION, 168 * NES_WORLD_X_SCALE)).toBe(153 * NES_WORLD_X_SCALE);
    expect([cutterOpeningX(323 / NES_FRAME_RATE) / NES_WORLD_X_SCALE, cutterOpeningY(323 / NES_FRAME_RATE) / NES_WORLD_Y_SCALE]).toEqual([129, 136]);
    expect(cutterOpeningX(CUTTER_FIRST_ATTACK_DELAY)).toBe(483.75);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION)).toBe(306);
    expect([26, 27, 28, 29, 30, 31, 32].map((frame) => [cutterCombatX(CUTTER_ENTRY_DURATION + frame / NES_FRAME_RATE) / NES_WORLD_X_SCALE, cutterCombatY(CUTTER_ENTRY_DURATION + frame / NES_FRAME_RATE) / NES_WORLD_Y_SCALE])).toEqual([[129, 136], [127, 134], [126, 132], [124, 130], [122, 127], [121, 125], [119, 123]]);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 71 / NES_FRAME_RATE)).toBe(92.25);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 311 / NES_FRAME_RATE)).toBe(90);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION)).toBe(483.75);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 71 / NES_FRAME_RATE)).toBe(191.25);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 320 / NES_FRAME_RATE)).toBe(446.25);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 560 / NES_FRAME_RATE)).toBe(600);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 320 / NES_FRAME_RATE, 88 * NES_WORLD_X_SCALE)).toBe(236.25);
    expect(cutterCombatX(CUTTER_ENTRY_DURATION + 3264 / NES_FRAME_RATE)).toBeCloseTo(159 * NES_WORLD_X_SCALE, 9);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 3264 / NES_FRAME_RATE)).toBeCloseTo(49 * NES_WORLD_Y_SCALE, 9);
    expect(cutterCombatY(CUTTER_ENTRY_DURATION + 3276 / NES_FRAME_RATE)).toBeCloseTo(57 * NES_WORLD_Y_SCALE, 9);
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
    expect([CUTTER_BOOMERANG_SCREEN_MIN_X_NES, CUTTER_BOOMERANG_SCREEN_MAX_X_NES, CUTTER_BOOMERANG_SCREEN_MAX_Y_NES]).toEqual([24, 248, 252]);
    expect([cutterBoomerangOnScreen(23, 57), cutterBoomerangOnScreen(24, 57), cutterBoomerangOnScreen(247, 251), cutterBoomerangOnScreen(248, 251), cutterBoomerangOnScreen(100, 252)]).toEqual([false, true, true, false, false]);
    expect(cutterBoomerangTurn(14, 10)).toBe(13);
    expect(cutterBoomerangTurn(18, 22)).toBe(19);
    expect(cutterBoomerangTurn(31, 1)).toBe(0);
    expect(cutterBoomerangHeadingToward(126 * NES_WORLD_X_SCALE, 139 * (540 / 240), 224 * NES_WORLD_X_SCALE, 176 * (540 / 240))).toBe(10);
    expect(cutterBoomerangHeadingToward(103 * NES_WORLD_X_SCALE, 99 * (540 / 240), 32 * NES_WORLD_X_SCALE, 176 * (540 / 240))).toBe(20);
    expect(cutterBoomerangHeadingToward(184 * NES_WORLD_X_SCALE, 176 * (540 / 240), 128 * NES_WORLD_X_SCALE, 216 * (540 / 240))).toBe(21);
    expect(cutterBoomerangHeadingToward(73 * NES_WORLD_X_SCALE, 236 * (540 / 240), 128 * NES_WORLD_X_SCALE, 216 * (540 / 240))).toBe(6);
    expect(cutterBoomerangVelocity(13)).toEqual([1.37109375 * NES_FRAME_RATE * NES_WORLD_X_SCALE, 2.484375 * NES_FRAME_RATE * NES_WORLD_Y_SCALE]);
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
    expect([x, y]).toEqual([19.4296875, 17.25]);
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
    expect(DEVIL_HAWK_ATTACK_FRAMES).toEqual([174, 381, 505, 610, 910, 1015, 1109, 1214, 1307, 1412, 1506, 1695, 1769, 1843, 1936, 2041, 2115, 2207, 2311, 2543, 2615, 2722, 2845, 2968, 3092, 3198, 3272, 3431, 3524, 3630]);
    expect(devilHawkAttackDelay(174 / NES_FRAME_RATE)).toBeCloseTo(207 / NES_FRAME_RATE, 9);
    expect(devilHawkAttackDelay(3630 / NES_FRAME_RATE)).toBeCloseTo(125 / NES_FRAME_RATE, 9);
    expect([devilHawkFullFanAt(910 / NES_FRAME_RATE), devilHawkFullFanAt(610 / NES_FRAME_RATE), devilHawkFullFanAt(611 / NES_FRAME_RATE)]).toEqual([true, false, undefined]);
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
    expect([0, 7, 8, 11, 12].map((frame) => devilHawkOpeningY(frame / NES_FRAME_RATE) / NES_WORLD_Y_SCALE)).toEqual([0, 0, 2, 8, 8]);
    expect(devilHawkCombatY(DEVIL_HAWK_FIRST_VOLLEY_DELAY)).toBe(162);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 52 / NES_FRAME_RATE)).toBe(108);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION)).toBe(780);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 146 / NES_FRAME_RATE)).toBeCloseTo(588.75, 9);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 283 / NES_FRAME_RATE)).toBe(77 * NES_WORLD_Y_SCALE);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 283 / NES_FRAME_RATE)).toBe(137 * NES_WORLD_X_SCALE);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 640 / NES_FRAME_RATE)).toBe(109 * NES_WORLD_Y_SCALE);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 640 / NES_FRAME_RATE)).toBe(103 * NES_WORLD_X_SCALE);
    expect(devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + 3425 / NES_FRAME_RATE)).toBe(85 * NES_WORLD_Y_SCALE);
    expect(devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + 3425 / NES_FRAME_RATE)).toBe(122 * NES_WORLD_X_SCALE);
    expect([0, 1, 2, 3, 4].map((frame) => [devilHawkCombatX(DEVIL_HAWK_ENTRY_DURATION + frame / NES_FRAME_RATE) / NES_WORLD_X_SCALE, devilHawkCombatY(DEVIL_HAWK_ENTRY_DURATION + frame / NES_FRAME_RATE) / NES_WORLD_Y_SCALE])).toEqual([[208, 96], [208, 96], [208, 96], [208, 96], [208, 96]]);
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
    expect(NINJA_BOSS_FIRST_ATTACK_DELAY).toBeCloseTo(163 / NES_FRAME_RATE, 9);
    expect(NINJA_BOSS_ENTRY_INVULNERABILITY).toBeCloseTo(44 / NES_FRAME_RATE, 9);
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
    expect([0, 7, 8, 11, 12].map((frame) => fatmanJoeOpeningY(frame / NES_FRAME_RATE) / NES_WORLD_Y_SCALE)).toEqual([0, 0, 2, 8, 8]);
    expect(fatmanJoeOpeningY(FATMAN_JOE_ENTRY_DURATION / 2)).toBe(126);
    expect(fatmanJoeOpeningY(FATMAN_JOE_ENTRY_DURATION)).toBe(252);
    expect(fatmanJoeOpeningY(FATMAN_JOE_ENTRY_DURATION * 2)).toBe(252);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION)).toBe(252);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 50 / NES_FRAME_RATE)).toBe(142 * NES_WORLD_Y_SCALE);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 450 / NES_FRAME_RATE)).toBe(75 * NES_WORLD_Y_SCALE);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 288 / NES_FRAME_RATE)).toBe(118 * NES_WORLD_X_SCALE);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 512 / NES_FRAME_RATE)).toBe(115 * NES_WORLD_X_SCALE);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 352 / NES_FRAME_RATE, 64 * NES_WORLD_X_SCALE)).toBe(155);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 3418 / NES_FRAME_RATE)).toBe(68 * NES_WORLD_X_SCALE);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 3418 / NES_FRAME_RATE)).toBe(46 * NES_WORLD_Y_SCALE);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 3488 / NES_FRAME_RATE)).toBeCloseTo(78 * NES_WORLD_X_SCALE, 9);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 3488 / NES_FRAME_RATE)).toBe(46 * NES_WORLD_Y_SCALE);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 3600 / NES_FRAME_RATE)).toBeCloseTo(127 * NES_WORLD_X_SCALE, 9);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 3600 / NES_FRAME_RATE)).toBe(85 * NES_WORLD_Y_SCALE);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 4096 / NES_FRAME_RATE)).toBeCloseTo(120 * NES_WORLD_X_SCALE, 9);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 4096 / NES_FRAME_RATE)).toBeCloseTo(56 * NES_WORLD_Y_SCALE, 9);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 12000 / NES_FRAME_RATE)).toBe(132 * NES_WORLD_X_SCALE);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 12000 / NES_FRAME_RATE)).toBe(67 * NES_WORLD_Y_SCALE);
    expect(fatmanJoeCombatX(FATMAN_JOE_ENTRY_DURATION + 13000 / NES_FRAME_RATE)).toBe(98 * NES_WORLD_X_SCALE);
    expect(fatmanJoeCombatY(FATMAN_JOE_ENTRY_DURATION + 13000 / NES_FRAME_RATE)).toBe(203 * NES_WORLD_Y_SCALE);
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
    expect([fatmanJoeShellHasSplit(30 / NES_FRAME_RATE), fatmanJoeShellHasSplit(31 / NES_FRAME_RATE)]).toEqual([false, true]);
    expect(FATMAN_JOE_MINE_OFFSETS_NES).toEqual([[-16, 4], [-10, 12], [0, 16], [10, 12], [16, 4]]);
    expect([34, 35, 38, 39, 51, 80].map((frame) => fatmanJoeMineCount(frame / NES_FRAME_RATE))).toEqual([0, 1, 1, 2, 5, 5]);
    expect(FATMAN_JOE_GRENADE_LIFETIME).toBeCloseTo(29 / NES_FRAME_RATE, 9);
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
    const exactMovement = createWingateMovementState(152, 0, true);
    advanceWingateMovement(exactMovement, 3600, () => 0);
    expect([Math.floor(exactMovement.x), Math.floor(exactMovement.y)]).toEqual([127, 50]);
    const exactRealMovement = createWingateMovementState(192, 1, true);
    advanceWingateMovement(exactRealMovement, 3600, () => 0);
    expect([Math.floor(exactRealMovement.x), Math.floor(exactRealMovement.y)]).toEqual([157, 71]);
    expect(WINGATE_ENTRY_X_NES).toEqual([64, 104, 152, 192]);
    expect(WINGATE_ENTRY_X_LANES).toEqual([240, 390, 570, 720]);
    expect(WINGATE_ENTRY_Y_NES).toBe(0);
    expect(WINGATE_ENTRY_Y).toBe(0);
    expect(WINGATE_SECOND_ENTRY_Y_NES).toBe(0);
    expect(WINGATE_SECOND_ENTRY_Y).toBe(0);
    expect(WINGATE_ENTRY_INVULNERABILITY).toBeCloseTo(185 / NES_FRAME_RATE, 9);
    expect(WINGATE_SECOND_SPAWN_DELAY).toBeCloseTo(264 / NES_FRAME_RATE, 9);
    expect(WINGATE_FINAL_DEFEAT_ANIMATION_DURATION).toBeCloseTo(9 / NES_FRAME_RATE, 9);
    expect(WINGATE_FINAL_ENDING_DELAY).toBeCloseTo(761 / NES_FRAME_RATE, 9);
    expect(WINGATE_ENDING_INPUT_DELAY).toBeCloseTo(4_125 / NES_FRAME_RATE, 9);
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
    expect(bossDefeatAnimationDuration(5)).toBe(BOSS_DEFEAT_ANIMATION_DURATION);
    expect(bossDefeatAnimationDuration(MAX_STAGE, 0)).toBe(BOSS_DEFEAT_ANIMATION_DURATION);
    expect(bossDefeatAnimationDuration(MAX_STAGE, 1)).toBe(WINGATE_FINAL_DEFEAT_ANIMATION_DURATION);
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
