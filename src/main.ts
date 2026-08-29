import {
  ActionMap,
  AnimationPlayer,
  AudioManager,
  Camera2D,
  Engine,
  Renderer2D,
  Sprite,
  SpriteAnimationBinding,
  SpriteFrameClip,
  World,
} from "@xrdavies/2d-engine";
import type { NormalizedInputEvent, PcmStream } from "@xrdavies/2d-engine";
import { advanceRomRandom, mixRomRandomDifference, mixRomRandomFirstSum, mixRomRandomSecondSum, mixRomRandomSecondThirdSum, mixRomRandomSpawn, mixRomRandomSum, mixRomRandomThirdFirstSum, ROM_RANDOM_SEED } from "./game-constants";
import "./style.css";
import type { ButtonKey } from "jsnes";
import { AMMO_GAIN, banditBillOpeningY, BACKSTABBER_AMBUSH_DEPTH, BACKSTABBER_AMBUSH_DROP_SPEED, BACKSTABBER_AMBUSH_LIFETIME, BANDIT_BILL_ENTRY_X_LANES, BANDIT_BILL_ENTRY_Y, bomberCanThrow, bomberMovementDecision, bomberMovementDuration, bomberMovementUsesRandom, bomberMovementVelocity, BOMBER_THROW_DURATION, BOSS_DEFEAT_ANIMATION_DURATION, bossReward, bossSpriteVisible, canSpawnPlayerBullet, clamp, CUTTER_ENTRY_X_LANES, CUTTER_ENTRY_Y, DEVIL_HAWK_ENTRY_X_LANES, DEVIL_HAWK_ENTRY_Y, DEVIL_HAWK_RANDOM_ROUTE_START_FRAME, distance, DYNAMITE_AIM_FACTOR, DYNAMITE_AIRBORNE_DURATION, contactSourceShouldClear, dynamiteContactIsDefusable, DYNAMITE_HORIZONTAL_DURATION, DYNAMITE_LIFETIME, dynamiteVerticalOffset, EMPTY_BARREL_EXPLOSION_LIFETIME, FATMAN_JOE_ENTRY_DURATION, FATMAN_JOE_ENTRY_X_LANES, FATMAN_JOE_ENTRY_Y, fallingRockOnScreen, fallingRockPosition, fatmanJoeOpeningY, HATCHET_LIFETIME, HORSE_HIT_INVULNERABILITY, MAX_STAGE, NES_FRAME_RATE, NINJA_BOSS_ENTRY_LANES, NINJA_FIRST_SHOT_DELAY, NINJA_LIFETIME, ninjaAttackPosition, ninjaBossEntryLaneIndex, ninjaOpeningY, PLAYER_DEATH_ANIMATION_DURATION, PLAYER_DEATH_RECOVERY_DURATION, playerDeathPhase, RIFLEMAN_FIRST_SHOT_DELAY, RIFLEMAN_SHOT_INTERVAL, RIFLEMAN_SHOTS_PER_VOLLEY, ROCK_IMPACT_DELAY, ROCK_IMPACT_LIFETIME, ROCK_LIFETIME, ROAD_WIDTHS, ROM_OBJECT_DROP_SPEED, ROM_SCREEN_RELEASE_Y_NES, romActorScreenYReleased, ROUND2_LOOP_HORSE_X, ROUND2_LOOP_HORSE_Y, ROUND_BOSS_TRIGGERS, ROUND_LENGTHS, ROUND_OBSTACLES, ROUND_SEGMENTS, SHOTGUNNER_FAN_NES, SHOTGUNNER_FIRST_VOLLEY_DELAY, SHOTGUNNER_LIFETIME, SHOTGUNNER_SIDE_LIFETIME, SHOTGUNNER_SIDE_SHOT_FRAME, SHOTGUNNER_VOLLEY_INTERVAL, shotgunnerPosition, shotgunnerSidePosition, shouldLoopStage, SHOP_COSTS, SHOP_TYPES, SMART_BOMB_CAPACITY, SNIPER_CODE2_SHOT_FRAMES, SNIPER_LIFETIME, SNIPER_SHOT_FRAMES, spendPoints, STAGES, unitMaxAge, WEAPONS, WANTED_COSTS, WINGATE_ENTRY_X_LANES, WINGATE_ENTRY_Y, WINGATE_SECOND_ENTRY_Y, WINGATE_SECOND_SPAWN_DELAY, WORLD_PLAYER_SPEED, WORLD_SCROLL_SPEED, type EnemyType, type ItemType, type ShopType, type WeaponName } from "./game-constants";
import { advanceBackstabberRaid, createBackstabberRaidState, type BackstabberRaidState } from "./game-constants";
import { advanceGunmanFlankMovement, createGunmanFlankMovementState, GUNMAN_BOTTOM_BRANCH_FRAME, GUNMAN_BOTTOM_LIFETIMES, gunmanBottomPosition, gunmanBottomRoute, GUNMAN_BOTTOM_SHOT_FRAMES, gunmanCanFire, GUNMAN_FLANK_INITIAL_STATE_FRAMES, gunmanFlankFirstOpportunityFrame, gunmanFlankLifetime, gunmanFlankMovementFacingHeading, gunmanFlankUsesDynamicState, GUNMAN_LIFETIME, GUNMAN_TOP_LIFETIMES_FRAMES, gunmanFirstOpportunityFrame, gunmanFlankPosition, gunmanTopBranch, gunmanTopHeading, gunmanTopPosition, gunmanProjectileVelocity, GUNMAN_SHOT_OPPORTUNITY_INTERVAL, mediumProjectileHeadingVelocity, mediumProjectileVelocity, type GunmanFlankMovementState } from "./game-constants";
import { BOMBER_ENTRY_DURATION, bomberOpeningY } from "./game-constants";
import { advanceFirebreather, advanceHatchet, advanceSpear, createFirebreatherState, createHatchetState, createSpearState, FIREBREATHER_LIFETIME, FIREBREATHER_PROJECTILE_OFFSET_NES, nesActorCollisionProbeOffset, SPEAR_LIFETIME, SPEAR_PROJECTILE_OFFSET_NES, type FirebreatherState, type HatchetState, type SpearState } from "./game-constants";
import { RIFLEMAN_ATTACK_STATE_FRAME, RIFLEMAN_LIFETIME, riflemanCanAttack, riflemanPosition, riflemanShotHeading, RIFLEMAN_SIDE_LIFETIME, RIFLEMAN_SIDE_SHOT_FRAMES, riflemanSidePosition, SNIPER_COVER_DURATION, sniperProjectileVelocity } from "./game-constants";
import { advanceBanditBillMovement, BANDIT_BILL_ATTACK_PAUSE_FRAMES, BANDIT_BILL_DAMAGE_RECOVERY_DURATION, BANDIT_BILL_ENTRY_DURATION, BANDIT_BILL_FIRST_VOLLEY_DELAY, BANDIT_BILL_PROJECTILE_OFFSET_NES, BANDIT_BILL_RANDOM_HANDOFF_FINE_X, BANDIT_BILL_RANDOM_HANDOFF_FINE_Y, BANDIT_BILL_RANDOM_ROUTE_START_FRAME, banditBillCombatX, banditBillCombatY, banditBillProjectileVelocity, createBanditBillMovementState, type BanditBillMovementState } from "./game-constants";
import { banditBillCooldown } from "./game-constants";
import { advanceInvulnerability, BLUE_YASHICHI_DURATION, BOSS_BAR_RECOVERY_DURATION, bossCurrentBarHitPoints, bossHealthProfile, bossTotalHitPoints, lifePickup, scoreBossDefeat, shouldClearProjectilesAfterBossDefeat } from "./game-constants";
import { machineGunVelocities, NES_WORLD_X_SCALE, NES_WORLD_Y_SCALE, PLAYER_ENTRY_X, PLAYER_ENTRY_Y, PLAYER_MAX_X_NES, PLAYER_MAX_Y_NES, PLAYER_MIN_X_NES, PLAYER_MIN_Y_NES, pistolBulletSpeedFactor, pistolVelocities, playerCollisionFallbackY, playerMovementVelocity, shotgunVelocities, weaponBulletLifetime, weaponCanRepeat } from "./game-constants";
import { storedPowerupPickup } from "./game-constants";
import { addScore } from "./game-constants";
import { ninjaCanThrow, ninjaTraceLifetime, ninjaTracePosition, ninjaTraceThrowFrame } from "./game-constants";
import { FATMAN_JOE_ATTACK_DECISION_INTERVAL, fatmanJoeAimAllowsLaunch, fatmanJoeArenaXBounds, fatmanJoeCanLaunch, FATMAN_JOE_FIRST_ATTACK_DELAY, FATMAN_JOE_GRENADE_LIFETIME, FATMAN_JOE_LAUNCH_INVULNERABILITY, FATMAN_JOE_MOVEMENT_SPEED, fatmanJoeMineCount, FATMAN_JOE_MINE_OFFSETS_NES, FATMAN_JOE_SHELL_FLIGHT_DURATION, FATMAN_JOE_SHELL_LIFETIME, fatmanJoeCombatX, fatmanJoeCombatY, fatmanJoeMovementActionDuration, fatmanJoeShellVelocity } from "./game-constants";
import { advanceDevilHawkMovement, advanceWingateMovement, createDevilHawkMovementState, createWingateMovementState, DEVIL_HAWK_RANDOM_HANDOFF_ACTION_COUNTER, DEVIL_HAWK_RANDOM_HANDOFF_FINE_X, DEVIL_HAWK_RANDOM_HANDOFF_FINE_Y, DEVIL_HAWK_RANDOM_HANDOFF_GAIT, DEVIL_HAWK_RANDOM_HANDOFF_HEADING, DEVIL_HAWK_RANDOM_HANDOFF_SEGMENT_FRAMES, WINGATE_BULLET_LIFETIME, wingateCanFire, WINGATE_PROJECTILE_X_OFFSET_NES, WINGATE_PROJECTILE_Y_OFFSET_NES, wingateProjectileVelocity, type DevilHawkMovementState, type WingateMovementState } from "./game-constants";
import { WINGATE_ENDING_INPUT_DELAY, WINGATE_FINAL_DEFEAT_ANIMATION_DURATION, WINGATE_FINAL_ENDING_DELAY } from "./game-constants";
import { CUTTER_ATTACK_INTERVAL, CUTTER_BOOMERANG_FIRST_TURN_DELAY, CUTTER_BOOMERANG_HEADINGS, cutterBoomerangHeadingToward, CUTTER_BOOMERANG_LIFETIME, CUTTER_BOOMERANG_OUTWARD_TARGETS_NES, CUTTER_BOOMERANG_REAIM_Y_NES, CUTTER_BOOMERANG_SPAWN_NES, CUTTER_BOOMERANG_TURN_INTERVAL, cutterBoomerangTurn, cutterBoomerangVelocity, CUTTER_FIRST_ATTACK_DELAY } from "./game-constants";
import { advanceCutterMovement, createCutterMovementState, CUTTER_ENTRY_DURATION, CUTTER_RANDOM_HANDOFF_FINE_X, CUTTER_RANDOM_HANDOFF_FINE_Y, CUTTER_RANDOM_HANDOFF_GAIT, CUTTER_RANDOM_HANDOFF_SEGMENT_FRAMES, CUTTER_RANDOM_ROUTE_START_FRAME, cutterBoomerangOnScreen, cutterCombatX, cutterCombatY, cutterOpeningX, cutterOpeningY, type CutterMovementState } from "./game-constants";
import { DEVIL_HAWK_ENTRY_DURATION, devilHawkAttackDelay, devilHawkFanHeadings, DEVIL_HAWK_FIRST_VOLLEY_DELAY, DEVIL_HAWK_FULL_FAN_LIFETIME, DEVIL_HAWK_FULL_FAN_MAX_Y_NES, DEVIL_HAWK_POST_ENTRY_X_HOLD, devilHawkProjectileVelocity, DEVIL_HAWK_SIDE_FAN_LIFETIME, devilHawkCombatX, devilHawkCombatY, devilHawkOpeningY, nesAimHeading } from "./game-constants";
import { NINJA_BOSS_ATTACK_INTERVAL, NINJA_BOSS_ENTRY_INVULNERABILITY, NINJA_BOSS_FIRST_PREPARE_DELAY, NINJA_BOSS_PREPARE_CONTROLLER_DURATION, NINJA_BOSS_PREPARE_DURATION, NINJA_BOSS_SHURIKEN_LIFETIME, NINJA_BOSS_SHURIKEN_SPAWN_OFFSET_NES, NINJA_BOSS_SHURIKEN_VELOCITIES_NES, NINJA_BOSS_TELEPORT_DELAY, ninjaBossCombatX, ninjaBossCombatY, ninjaBossNextTeleportAt, ninjaBossPreparePosition } from "./game-constants";
import { canSpawnEnemyProjectile } from "./game-constants";
import { canSpawnBossProjectile } from "./game-constants";
import { ENEMY_DEFEAT_ANIMATION_DURATION } from "./game-constants";
import { ENEMY_DEFEAT_Y_OFFSETS_NES } from "./game-constants";
import { hasSpecialAmmoStock, hasWeaponStock, romEnemyDrop, romEnemyScore } from "./game-constants";
import { romProjectileOnScreen } from "./game-constants";
import { roundCollisionAtNes, roundCollisionBlocks, roundCollisionScrollNes, roundPlayerRecoveryX, ROUND_COLLISION_ROWS } from "./round-collision";
import { canSpawnRomPool, compareRomEventOrder, ROM_BREAKABLE_CONTAINER_DISPATCH_TYPES, ROM_EMPTY_BARREL_ENTITY_CODES, ROM_FALLING_ROCK_BEHAVIORS, ROM_OBJECT_PICKUPS, ROM_SCENE_PROP_DISPATCH_TYPES, ROUND_ROM_ENEMY_EVENTS, ROUND_ROM_OBJECT_EVENTS, ROM_BEHAVIOR_ENEMY_TYPES, romEntityHitPoints, romEventWorldAt, romEventWorldX, romEventWorldY, romObjectWorldAt, romObjectWorldX, romObjectWorldY } from "./rom-event-data";
import type { RomEnemyEvent, RomObjectEvent } from "./rom-event-data";

type GameAction =
  | "left"
  | "right"
  | "up"
  | "down"
  | "fireLeft"
  | "fireCenter"
  | "fireRight"
  | "smartBomb"
  | "inventory"
  | "start";
type GameMode = "title" | "intro" | "briefing" | "playing" | "paused" | "gameover" | "ending";
type UnitKind = "enemy" | "boss" | "bullet" | "enemyBullet" | "moneyBag" | "ammo" | "barrel" | "item" | "shopkeeper" | "sceneObject";
type ProjectileType = "bullet" | "dynamite" | "grenade" | "grenadeShell" | "boomerang" | "fireball" | "shuriken" | "ninjaSmoke" | "spear" | "hatchet" | "rock";
type TextureName = "player" | "horse" | "shopkeeper" | "bullet" | "moneyBag" | "ammo" | "barrel" | "terrain" | "road" | "landmark";
type Rgba = [number, number, number, number];

const PROJECTILE_STYLES: Partial<Record<ProjectileType, { size: { x: number; y: number }; color: Rgba }>> = {
  dynamite: { size: { x: 18, y: 18 }, color: [0.95, 0.55, 0.16, 1] },
  grenade: { size: { x: 18, y: 18 }, color: [0.9, 0.25, 0.15, 1] },
  grenadeShell: { size: { x: 20, y: 20 }, color: [1, 0.52, 0.12, 1] },
  fireball: { size: { x: 18, y: 18 }, color: [1, 0.45, 0.08, 1] },
  boomerang: { size: { x: 24, y: 12 }, color: [0.6, 0.85, 1, 1] },
  shuriken: { size: { x: 16, y: 16 }, color: [0.85, 0.85, 0.9, 1] },
  ninjaSmoke: { size: { x: 26, y: 26 }, color: [0.72, 0.7, 0.82, 0.78] },
  spear: { size: { x: 7, y: 34 }, color: [0.4, 1, 0.55, 1] },
  hatchet: { size: { x: 16, y: 16 }, color: [1, 0.7, 0.25, 1] },
  rock: { size: { x: 24, y: 24 }, color: [0.4, 0.45, 0.5, 1] },
};

interface Unit {
  kind: UnitKind;
  enemyType?: EnemyType;
  itemType?: ItemType;
  projectileType?: ProjectileType;
  sprite: Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  exploding?: boolean;
  radius: number;
  value: number;
  age: number;
  phase: number;
  damage: number;
  fired: boolean;
  turnRate: number;
  maxAge: number;
  invulnerableUntil: number;
  piercing: boolean;
  hitTargets?: Set<Unit>;
  shopIndex?: number;
  animation?: SpriteAnimationBinding;
  romBehavior?: number;
  romEntityCode?: number;
  romEventAt?: number;
  romRandomSeed?: number;
  romPhase?: number;
  romFlags?: number;
  romPool?: "enemy" | "object";
  romOriginX?: number;
  romOriginY?: number;
  targetX?: number;
  targetY?: number;
  gunmanBottomRoute?: "near" | "far";
  gunmanTopBranch?: "center" | "left" | "right";
  gunmanFlankState?: GunmanFlankMovementState;
  backstabberRaidState?: BackstabberRaidState;
  romSlot?: number;
  riflemanAimHeading?: number;
  hatchetState?: HatchetState;
  firebreatherState?: FirebreatherState;
  spearState?: SpearState;
  bomberState?: "entry" | "moving" | "throwing";
  bomberDirection?: number;
  bossEntryX?: number;
  bossEntryY?: number;
  fatmanFollowup?: boolean;
  banditState?: BanditBillMovementState;
  cutterState?: CutterMovementState;
  devilHawkState?: DevilHawkMovementState;
  wingateState?: WingateMovementState;
  bossProjectile?: boolean;
  boomerangHeading?: number;
  bossCycleStart?: number;
  bossNextTeleportAt?: number;
  rockNextBoundary?: number;
  rockPhase?: number;
  nextFireAt: number;
  volleysFired: number;
}

const actions = new ActionMap<GameAction>();
actions
  .bind("left", { type: "key", code: "ArrowLeft" }, { type: "key", code: "KeyA" }, { type: "gamepad-axis", axis: 0, direction: -1 })
  .bind("right", { type: "key", code: "ArrowRight" }, { type: "key", code: "KeyD" }, { type: "gamepad-axis", axis: 0, direction: 1 })
  .bind("up", { type: "key", code: "ArrowUp" }, { type: "key", code: "KeyW" }, { type: "gamepad-axis", axis: 1, direction: -1 })
  .bind("down", { type: "key", code: "ArrowDown" }, { type: "key", code: "KeyS" }, { type: "gamepad-axis", axis: 1, direction: 1 })
  .bind("fireLeft", { type: "key", code: "KeyZ" }, { type: "gamepad-button", button: 1 })
  .bind("fireRight", { type: "key", code: "KeyX" }, { type: "gamepad-button", button: 0 })
  .bind("smartBomb", { type: "key", code: "KeyV" }, { type: "gamepad-button", button: 3 })
  .bind("inventory", { type: "gamepad-button", button: 8 })
  .bind("start", { type: "gamepad-button", button: 9 });

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Gun.Smoke markup is incomplete: ${selector}`);
  return element;
}

const canvas = requireElement<HTMLCanvasElement>("#game-canvas");
const titleScreen = requireElement<HTMLElement>("#title-screen");
const introScreen = requireElement<HTMLElement>("#intro-screen");
const briefingScreen = requireElement<HTMLElement>("#briefing-screen");
const gameOver = requireElement<HTMLElement>("#game-over");
const endingScreen = requireElement<HTMLElement>("#ending-screen");
const pauseScreen = requireElement<HTMLElement>("#pause-screen");
const inventoryScreen = requireElement<HTMLElement>("#inventory-screen");
const hud = requireElement<HTMLElement>("#hud");
const startButton = requireElement<HTMLButtonElement>("#start-button");
const continueButton = requireElement<HTMLButtonElement>("#continue-button");
const briefingButton = requireElement<HTMLButtonElement>("#briefing-button");
const briefingRound = requireElement<HTMLElement>("#briefing-round");
const briefingBoss = requireElement<HTMLElement>("#briefing-boss");
const restartButton = requireElement<HTMLButtonElement>("#restart-button");
const gameOverContinueButton = requireElement<HTMLButtonElement>("#game-over-continue");
const endingButton = requireElement<HTMLButtonElement>("#ending-button");
const resumeButton = requireElement<HTMLButtonElement>("#resume-button");
const inventoryClose = requireElement<HTMLButtonElement>("#inventory-close");
const inventoryWeapons = requireElement<HTMLElement>("#inventory-weapons");
const inventoryItems = requireElement<HTMLElement>("#inventory-items");
const inventoryWeaponButtons = [...inventoryScreen.querySelectorAll<HTMLButtonElement>("[data-inventory-weapon]")];
const smartBombButton = requireElement<HTMLButtonElement>("#inventory-smart-bomb");
const referenceRomInput = requireElement<HTMLInputElement>("#reference-rom");
const romStatus = requireElement<HTMLElement>("#rom-status");
const finalScore = requireElement<HTMLElement>("#final-score");
const stageLabel = requireElement<HTMLElement>("#stage-label");
const scoreLabel = requireElement<HTMLElement>("#score-label");
const livesLabel = requireElement<HTMLElement>("#lives-label");
const weaponLabel = requireElement<HTMLElement>("#weapon-label");
const bossLabel = requireElement<HTMLElement>("#boss-label");
const messageLabel = requireElement<HTMLElement>("#message-label");
const shop = requireElement<HTMLElement>("#shop");
const shopTitle = requireElement<HTMLElement>("#shop-title");
const shopMessage = requireElement<HTMLElement>("#shop-message");
const shopClose = requireElement<HTMLButtonElement>("#shop-close");
const shopItems = [...shop.querySelectorAll<HTMLButtonElement>("[data-shop-item]")];
canvas.tabIndex = 0;
startButton.disabled = true;

const transparent: Rgba = [0, 0, 0, 0];

function pixelTexture(engine: Engine, rows: readonly string[], palette: Record<string, Rgba>): GPUTexture {
  const width = Math.max(1, ...rows.map((row) => row.length));
  const height = Math.max(1, rows.length);
  const pixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const row = rows[y] ?? "";
    for (let x = 0; x < width; x += 1) {
      const color = palette[row[x] ?? "."] ?? transparent;
      pixels.set(color, (y * width + x) * 4);
    }
  }
  const texture = engine.gpu.device.createTexture({
    label: "gun-smoke-pixel-art",
    size: { width, height, depthOrArrayLayers: 1 },
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  engine.gpu.device.queue.writeTexture(
    { texture },
    pixels,
    { bytesPerRow: width * 4 },
    { width, height, depthOrArrayLayers: 1 },
  );
  return texture;
}

function proceduralRows(width: number, height: number, seed: number, values: readonly string[]): string[] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => values[(x * 17 + y * 31 + seed + (x ^ y)) % values.length] ?? values[0] ?? ".").join(""),
  );
}

function collisionTextureRows(rows: readonly number[], seed: number): string[] {
  return rows.map((mask, row) => Array.from({ length: 16 }, (_, column) => {
    const blocked = Boolean(mask & (1 << (15 - column)));
    return blocked ? (row + column + seed) % 7 === 0 ? "p" : "d" : (row * 3 + column + seed) % 9 === 0 ? "h" : "q";
  }).join(""));
}

function atlasRows(rows: readonly string[]): string[] {
  const width = Math.max(...rows.map((row) => row.length));
  return rows.map((row) => {
    const left = Math.floor((width - row.length) / 2);
    const padded = ".".repeat(left) + row + ".".repeat(width - row.length - left);
    return padded + padded.split("").reverse().join("");
  });
}

function pairedRows(leftRows: readonly string[], rightRows: readonly string[]): string[] {
  const width = Math.max(...leftRows.map((row) => row.length), ...rightRows.map((row) => row.length));
  const height = Math.max(leftRows.length, rightRows.length);
  return Array.from({ length: height }, (_, index) => (leftRows[index] ?? "").padEnd(width, ".") + (rightRows[index] ?? "").padEnd(width, "."));
}

class GunSmokeGame {
  readonly world = new World();
  readonly actions = actions;
  readonly units: Unit[] = [];
  readonly backgrounds: Sprite[] = [];
  readonly engine: Engine;
  readonly renderer: Renderer2D;
  readonly sampler: GPUSampler;
  readonly camera = new Camera2D({ position: { x: 480, y: 270 }, viewportWidth: 960, viewportHeight: 540 });
  readonly textures: Record<TextureName, GPUTexture>;
  readonly itemTextures: Record<ItemType, GPUTexture>;
  readonly enemyTextures: Record<EnemyType, GPUTexture>;
  readonly bossTextures: GPUTexture[];
  readonly terrainTextures: GPUTexture[] = [];
  readonly roadTextures: GPUTexture[] = [];
  readonly mapTextures: GPUTexture[] = [];
  audio: AudioManager | undefined;
  mode: GameMode = "title";
  scroll = 0;
  stage = 1;
  score = 0;
  lives = 3;
  weaponAmmo: Record<WeaponName, number> = { pistol: Number.POSITIVE_INFINITY, shotgun: 0, machinegun: 0, magnum: 0 };
  ownedWeapons = new Set<WeaponName>(["pistol"]);
  smartBombs = 0;
  smartBombArmed = false;
  powerups = { boots: 0, rifle: 0 };
  time = 0;
  fireClock = 0;
  fireMask = 0;
  bombLatch = false;
  startLatch = false;
  pausePollHandle: number | undefined;
  inventoryLatch = false;
  inventoryOpen = false;
  inventoryWeaponIndex = 0;
  inventoryDirectionLatch = 0;
  bossFireClock = 1;
  invulnerable = 0;
  invulnerableDestroysEnemies = false;
  deathClock = 0;
  deathCommitted = false;
  bossSpawned = false;
  stageClearClock = 0;
  hasWanted = false;
  romEventCursor = 0;
  romObjectCursor = 0;
  wingatePhase = 0;
  wingateRespawnClock = 0;
  weapon: WeaponName = "pistol";
  hasHorse = false;
  horseHealth = 0;

  get ammo(): number {
    return this.weaponAmmo[this.weapon];
  }

  set ammo(value: number) {
    this.weaponAmmo[this.weapon] = value;
  }
  shopOpen = false;
  shopIndex = 0;
  shopSpawnCursor = 0;
  musicTimer: number | undefined;
  musicStep = 0;
  endingReady = false;
  endingReadyTimer: number | undefined;
  randomState: [number, number, number, number] = [...ROM_RANDOM_SEED];
  randomReadIndex = 0;
  randomFrameRemainder = 0;
  romEnemyFineX = new Uint8Array(7);
  romEnemyFineY = new Uint8Array(7);
  player = { entity: 0, x: PLAYER_ENTRY_X, y: PLAYER_ENTRY_Y, sprite: undefined as unknown as Sprite };
  horseSprite: Sprite;
  playerAnimation: SpriteAnimationBinding | undefined;

  private constructor(engine: Engine) {
    this.engine = engine;
    this.renderer = new Renderer2D(engine.gpu, { clearColor: { r: 0.03, g: 0.04, b: 0.06, a: 1 } });
    this.sampler = engine.gpu.device.createSampler({ magFilter: "nearest", minFilter: "nearest" });
    const palette = {
      k: [25, 30, 43, 255] as Rgba,
      w: [220, 226, 233, 255] as Rgba,
      r: [203, 67, 55, 255] as Rgba,
      o: [239, 189, 88, 255] as Rgba,
      g: [70, 189, 148, 255] as Rgba,
      b: [71, 101, 144, 255] as Rgba,
      t: [118, 78, 48, 255] as Rgba,
      s: [196, 158, 98, 255] as Rgba,
      d: [44, 57, 50, 255] as Rgba,
      p: [121, 76, 47, 255] as Rgba,
      n: [13, 47, 92, 255] as Rgba,
      q: [22, 73, 124, 255] as Rgba,
      h: [39, 96, 151, 255] as Rgba,
      ".": transparent,
    };
    this.textures = {
      player: pixelTexture(engine, atlasRows([
        ".....wwww.....", "...wwkkkkww...", "..wkkwwkkkwk..", ".wkkkkkkkkkkw.",
        ".wkkkwwwwkkkw.", "..wkkkkkkkkw..", "...wkkkkkkw...", "....wkkkkw....",
        "...wwkkkkww...", "..wkkrrrrkkw..", ".wkkrrrrrrkkw.", ".wkkkkkkkkkkw.",
        "..wkkwwwwkkw..", "..wkkwwwwkkw..", "...wkkkkkkw...", "....wwwwww....",
      ]), palette),
      horse: pixelTexture(engine, [
        ".......ttt....", ".....ttkktt...", "....tkkkkkkt..", ".t..tkkkkkkkt.",
        ".tttkkkkkkkktt", "..tkkkkkkkkkt.", "...ttkkkktt...", "....tkkkktt...",
        "....tkkkkt....", "...tt...tt....", "...tt...tt....", "...t.....t....",
      ], palette),
      shopkeeper: pixelTexture(engine, pairedRows([
        ".....oo.....", ".....oo.....", "............", ".....oo.....",
        "....oooo....", "...okkkko...", "..ookkkkoo..", ".ookkkkkkoo.",
        "..okwwwwko..", "...tttttt...", "..ttkkkktt..", ".tttt..tttt.",
      ], [
        "............", "............", "............", "............",
        "....oooo....", "...okkkko...", "..ookkkkoo..", ".ookkkkkkoo.",
        "..okwwwwko..", "...tttttt...", "..ttkkkktt..", ".tttt..tttt.",
      ]), palette),
      bullet: pixelTexture(engine, [".o.", ".o.", ".o.", ".o.", ".o.", ".o."], palette),
      moneyBag: pixelTexture(engine, ["..oo..", ".oooo.", "ookkoo", "okkkko", "okkkko", ".oooo."], palette),
      ammo: pixelTexture(engine, [".bbb.", "bkkkb", "bkkkb", ".bbb."], palette),
      barrel: pixelTexture(engine, [".oooo.", "okkkko", "okkkko", "okkkko", ".oooo."], palette),
      terrain: pixelTexture(engine, proceduralRows(64, 64, this.stage, ["d", "d", "d", "p", "d", "p"]), palette),
      road: pixelTexture(engine, proceduralRows(64, 64, this.stage + 3, ["t", "t", "s", "t", "s", "t"]), palette),
      landmark: pixelTexture(engine, [
        "pppppppppppppppp", "pbbbbbbbbbbbbbbp", "pbppppppppppppbp", "pbpwwwwwwwwwwpbp",
        "pbpwkkkkkkwwpbp", "pbpwwwwwwwwwwpbp", "pbppppppppppppbp", "pbbbbbbbbbbbbbbp",
        "pppppppppppppppp", "pddddddddddddddp", "pdppddddddppdddp", "pddddddddddddddp",
        "pddddddddddddddp", "pddddddddddddddp", "pddddddddddddddp", "pppppppppppppppp",
      ], palette),
    };
    this.itemTextures = {
      boots: pixelTexture(engine, ["ww..ww", "ww..ww", "ww..ww", "wwwwww", ".wwww.", ".wwww."], palette),
      rifle: pixelTexture(engine, [".....w", "wwwwww", ".wwwww", "...ww.", "..ww..", "..w..."], palette),
      ammo: pixelTexture(engine, [".wwww.", "wkkkkw", "wkkkkw", "wkkkkw", ".wwww."], palette),
      money: pixelTexture(engine, ["..ww..", ".wwww.", "wwkkww", "wkkkkw", "wkkkkw", ".wwww."], palette),
      pow: pixelTexture(engine, ["wwwwww", "wkwkwk", "wwwwww", "wkwkwk", "wwwwww"], palette),
      skull: pixelTexture(engine, [".wwww.", "wkkkkw", "wkwkwk", "wkkkkw", ".wwww.", "..ww.."], palette),
      horse: pixelTexture(engine, [".w..w.", "wwwww.", "wkkkkw", "wkkkkw", ".wwww.", "..ww.."], palette),
      blueYashichi: pixelTexture(engine, ["w..w..", ".ww...", "wwwwww", "...ww.", "..w..w"], palette),
      redYashichi: pixelTexture(engine, ["..w..w", "...ww.", "wwwwww", ".ww...", "w..w.."], palette),
    };
    this.enemyTextures = {
      gunman: pixelTexture(engine, atlasRows(["..rrrr..", ".rkkkkr.", "rrkrrkrr", ".rkkkkr.", "..rrrr..", ".rrkkrr.", "rr.kk.rr", ".r....r."]), palette),
      rifleman: pixelTexture(engine, atlasRows(["..bbbb..", ".bkkkkb.", "bbkbbkbb", ".bkkkkbbbb", "..bbbb..", ".bbkkbb.", "bb.kk.bb", ".b....b."]), palette),
      bomber: pixelTexture(engine, atlasRows(["..oooo..", ".okkkko.", "ookookoo", ".okkkko.", "..oooo..", ".ookkoo.", "oo.kk.oo", ".o.oo.o."]), palette),
      sniper: pixelTexture(engine, atlasRows(["...gg...", "..gkkg..", ".gggggg.", "ggkkkkgg", "...gg...", "..gkkg..", ".g.kk.g.", "...gg..."]), palette),
      backstabber: pixelTexture(engine, atlasRows(["..rrrr..", ".rkkkkr.", "rrrrrrrr", ".rkkkkr.", "rrr..rrr", "..rkkk..", ".rrkkrr.", "rr....rr"]), palette),
      ninja: pixelTexture(engine, atlasRows(["..kkkk..", ".kwwwwk.", "kkwkkwkk", ".kkkkkk.", "..kkkk..", ".kkrrkk.", "kk.rr.kk", ".k....k."]), palette),
      hatchet: pixelTexture(engine, atlasRows(["..oooo..", ".okkkko.", "ookookoo", ".okkkkoo", "..oooooo", ".ookkoo.", "oo.kk.oo", ".o....o."]), palette),
      spear: pixelTexture(engine, atlasRows(["..gggg.w", ".gkkkkgw", "ggkggkgw", ".gkkkkgw", "..gggg.w", ".ggkkgg.", "gg.kk.gg", ".g....g."]), palette),
      firebreather: pixelTexture(engine, atlasRows(["..oooo..", ".okkkko.", "ookookoo", "wokkkkow", ".woooow.", ".ookkoo.", "oo.kk.oo", ".o....o."]), palette),
      shotgunner: pixelTexture(engine, atlasRows(["..rrrr..", ".rkkkkr.", "rrkrrkrr", ".rkkkkrrr", "..rrrrrr", ".rrkkrr.", "rr.kk.rr", ".r....r."]), palette),
    };
    this.bossTextures = [
      ["...rrrrrr...", ".rrkkkkkkrr.", "rrkkrrrrkkrr", "rkkkkkkkkkkr", ".rrkkkkkkrr.", "..rrkkkkrr..", ".rrrkkkkrrr.", "rr..rrrr..rr"],
      ["w...bbbb...w", ".bbkkkkkkbb.", "bbkbbbbbbkbb", ".bkkkkkkkkb.", "..bbbbbbbb..", ".bbkkkkkkbb.", "bb..bbbb..bb", ".b........b."],
      ["..o......o..", ".oooooooooo.", "ookkkkkkkkoo", "okkooooookko", ".okkkkkkkko.", "..ookkkkoo..", ".ooookkkkooo", "oo...oo...oo"],
      ["...kkkkkk...", "..kwwwwwwk..", ".kkwkkkkwkk.", "kkkkkkkkkkkk", "..kkrrrrkk..", ".kkkkrrrrkkk", "kk..kkkk..kk", ".k........k."],
      ["..oooooooo..", ".ookkkkkkkoo.", "ookkoooookkoo", "okkkkkkkkkkko", "okkooooooooko", ".ookkkkkkkkoo", "ooookkkkkkooo", "oo..oooooo..oo"],
      ["...wwwwww...", "..wkkkkkkw..", ".wwkwwwwkww.", "wwkkkkkkkkww", "..wwrrrrww..", ".wwwrrrrwwww", "ww..wwww..ww", ".w........w."],
    ].map((rows) => pixelTexture(engine, atlasRows(rows), palette));
    const terrainPatterns: readonly (readonly string[])[] = [
      ["d", "d", "d", "p", "d", "p"],
      ["b", "d", "b", "d", "d", "b"],
      ["g", "d", "g", "d", "g", "d"],
      ["s", "d", "s", "d", "p", "d"],
      ["g", "g", "d", "g", "d", "g"],
      ["d", "p", "d", "s", "d", "p"],
    ];
    const roadPatterns: readonly (readonly string[])[] = [
      ["n", "q", "q", "h", "q", "n"],
      ["b", "s", "b", "s", "b", "s"],
      ["t", "g", "t", "g", "t", "g"],
      ["s", "t", "s", "t", "s", "t"],
      ["t", "g", "s", "t", "g", "s"],
      ["p", "t", "p", "s", "t", "p"],
    ];
    for (let index = 0; index < STAGES.length; index += 1) {
      this.terrainTextures.push(pixelTexture(engine, proceduralRows(64, 64, index + 1, terrainPatterns[index] ?? terrainPatterns[0]!), palette));
      this.roadTextures.push(pixelTexture(engine, proceduralRows(64, 64, index + 4, roadPatterns[index] ?? roadPatterns[0]!), palette));
      this.mapTextures.push(pixelTexture(engine, collisionTextureRows(ROUND_COLLISION_ROWS[index] ?? [], index + 1), palette));
    }
    this.player.entity = this.world.createEntity();
    this.horseSprite = new Sprite({ texture: this.textures.horse, sampler: this.sampler, position: { x: PLAYER_ENTRY_X, y: PLAYER_ENTRY_Y + 16 }, size: { x: 64, y: 54 }, anchor: { x: 0.5, y: 0.5 }, layer: 19, visible: false });
    this.player.sprite = new Sprite({ texture: this.textures.player, sampler: this.sampler, frame: { x: 0, y: 0, width: 0.5, height: 1 }, position: { x: PLAYER_ENTRY_X, y: PLAYER_ENTRY_Y }, size: { x: 45, y: 54 }, anchor: { x: 0.5, y: 0.5 }, layer: 20 });
    this.playerAnimation = new SpriteAnimationBinding(this.player.sprite, new AnimationPlayer().play(new SpriteFrameClip([
      { x: 0, y: 0, width: 0.5, height: 1, duration: 0.12 },
      { x: 0.5, y: 0, width: 0.5, height: 1, duration: 0.12 },
    ]), true));
    this.world.addTransform(this.player.entity);
    this.buildBackground();
    this.engine.input?.onInput((event) => {
      this.actions.handle(event);
      if (event.kind === "keyboard" && (event.code === "Tab" || event.code === "ShiftLeft" || event.code === "ShiftRight")) {
        event.preventDefault();
        if (event.type === "keydown" && !event.repeat) {
          if (this.mode === "gameover") this.toggleGameOverChoice();
          else this.toggleInventory();
        }
      }
    });
    this.audio = this.createAudio();
    this.engine.addSystem({ update: (delta) => this.update(delta), render: () => this.render(), dispose: () => this.dispose() });
    this.engine.on("resize", ({ width, height }) => this.camera.setViewport(width, height));
  }

  static async create(): Promise<GunSmokeGame> {
    const engine = await Engine.create({ canvas, autoStart: false, fixedDelta: 1 / NES_FRAME_RATE });
    const game = new GunSmokeGame(engine);
    engine.start();
    return game;
  }

  start(): void {
    if (this.mode === "playing") return;
    this.mode = "intro";
    this.resetRandom();
    titleScreen.hidden = true;
    introScreen.hidden = false;
    briefingScreen.hidden = true;
    gameOver.hidden = true;
    endingScreen.hidden = true;
    pauseScreen.hidden = true;
    inventoryScreen.hidden = true;
    hud.hidden = true;
    canvas.focus();
    void this.audio?.unlock();
    this.beep(440, 0.08);
  }

  continueFromIntro(): void {
    if (this.mode !== "intro") return;
    introScreen.hidden = true;
    this.showBriefing();
  }

  continueFromBriefing(): void {
    if (this.mode !== "briefing") return;
    this.mode = "playing";
    briefingScreen.hidden = true;
    hud.hidden = false;
    this.startMusic();
    void this.audio?.resume();
    this.showMessage("RIDE OUT");
    if (this.pausePollHandle !== undefined) {
      window.cancelAnimationFrame(this.pausePollHandle);
      this.pausePollHandle = undefined;
    }
    if (this.engine.status === "paused") this.engine.resume();
    else this.engine.start();
    canvas.focus();
  }

  continueGame(): void {
    if (this.mode !== "gameover") return;
    this.lives = 3;
    this.scroll = 0;
    this.camera.position.y = 270;
    this.bossFireClock = 1;
    this.fireClock = 0;
    this.fireMask = 0;
    this.bombLatch = false;
    this.invulnerable = 0;
    this.invulnerableDestroysEnemies = false;
    this.deathClock = 0;
    this.deathCommitted = false;
    this.bossSpawned = false;
    this.stageClearClock = 0;
    this.hasWanted = false;
    this.wingatePhase = 0;
    this.wingateRespawnClock = 0;
    this.romObjectCursor = 0;
    this.romEventCursor = 0;
    this.shopIndex = 0;
    this.shopSpawnCursor = 0;
    this.shopOpen = false;
    this.inventoryOpen = false;
    this.hasHorse = false;
    this.horseHealth = 0;
    this.horseSprite.visible = false;
    this.smartBombArmed = false;
    this.units.length = 0;
    this.buildBackground();
    this.player.x = PLAYER_ENTRY_X;
    this.player.y = PLAYER_ENTRY_Y;
    this.player.sprite.position = { x: this.player.x, y: this.player.y };
    this.player.sprite.visible = true;
    this.player.sprite.rotation = 0;
    gameOver.hidden = true;
    shop.hidden = true;
    inventoryScreen.hidden = true;
    this.updateHud();
    this.showBriefing();
  }

  confirmGameOver(): void {
    if (this.mode !== "gameover") return;
    if (document.activeElement === restartButton) restartButton.click();
    else this.continueGame();
  }

  toggleGameOverChoice(): void {
    if (this.mode !== "gameover") return;
    (document.activeElement === gameOverContinueButton ? restartButton : gameOverContinueButton).focus();
  }

  private showBriefing(): void {
    this.mode = "briefing";
    const definition = STAGES[this.stage - 1] ?? STAGES[0]!;
    briefingRound.textContent = `ROUND ${this.stage} / ${definition.name}`;
    briefingBoss.textContent = definition.boss;
    briefingScreen.hidden = false;
    hud.hidden = true;
    void this.audio?.pause();
    if (this.engine.status === "running") this.engine.pause();
    this.pollPausedGamepad();
  }

  togglePause(): void {
    if (this.mode === "playing") {
      this.mode = "paused";
      this.engine.pause();
      void this.audio?.pause();
      pauseScreen.hidden = false;
      this.pollPausedGamepad();
    } else if (this.mode === "paused") {
      this.mode = "playing";
      pauseScreen.hidden = true;
      canvas.focus();
      if (this.pausePollHandle !== undefined) {
        window.cancelAnimationFrame(this.pausePollHandle);
        this.pausePollHandle = undefined;
      }
      this.engine.resume();
      void this.audio?.resume();
    }
  }

  toggleInventory(): void {
    if (this.mode !== "playing" || this.deathClock > 0) return;
    this.inventoryOpen = !this.inventoryOpen;
    inventoryScreen.hidden = !this.inventoryOpen;
    if (this.inventoryOpen) this.updateInventory();
    else canvas.focus();
  }

  private update(delta: number): void {
    this.engine.input?.pollGamepads();
    const startActive = this.actions.active("start");
    if (!startActive) this.startLatch = false;
    else if (!this.startLatch) {
      this.startLatch = true;
      this.activateStart();
    }
    if (this.mode !== "playing") return;
    this.advanceRandom(delta);
    if (this.deathClock > 0) {
      this.time += delta;
      this.updateDeath(delta);
      return;
    }
    this.updateInventoryInput();
    if (this.inventoryOpen) {
      this.updateInventorySelection();
      return;
    }
    if (this.shopOpen) return;
    this.time += delta;
    if (this.wingateRespawnClock > 0) {
      this.wingateRespawnClock -= delta;
      if (this.wingateRespawnClock <= 0) {
        const entryX = WINGATE_ENTRY_X_LANES[this.randomState[0] & 0x03] ?? 720;
        const boss = this.spawnUnit("boss", entryX, this.scroll + WINGATE_SECOND_ENTRY_Y, bossTotalHitPoints(MAX_STAGE, 1));
        boss.bossEntryX = boss.x;
        boss.bossEntryY = WINGATE_SECOND_ENTRY_Y;
        boss.wingateState = createWingateMovementState(boss.x / NES_WORLD_X_SCALE, this.wingatePhase, true);
        this.bossSpawned = true;
        this.showMessage("THE REAL WINGATE");
      }
      if (this.wingateRespawnClock > 0) {
        for (const unit of this.units) if (unit.kind === "boss" && unit.exploding) this.updateUnit(unit, delta);
        this.updateHud();
        return;
      }
    }
    if (this.stageClearClock > 0) {
      this.stageClearClock -= delta;
      for (const unit of this.units) if (unit.kind === "boss" && unit.exploding) this.updateUnit(unit, delta);
      if (this.stageClearClock <= 0) this.beginNextStage();
      this.updateHud();
      return;
    }
    const previousScroll = this.scroll;
    const scrollDelta = this.bossSpawned ? 0 : WORLD_SCROLL_SPEED * delta;
    this.scroll += scrollDelta;
    this.player.y += scrollDelta;
    if (shouldLoopStage(this.scroll, this.stage, this.hasWanted)) this.loopStage();
    if (this.shopOpen) return;
    const collisionScrollStep = Number(roundCollisionScrollNes(this.scroll) > roundCollisionScrollNes(previousScroll));
    this.camera.position.y = this.scroll + 270;
    ({ duration: this.invulnerable, destroysEnemies: this.invulnerableDestroysEnemies } = advanceInvulnerability(this.invulnerable, this.invulnerableDestroysEnemies, delta));
    const [movementX, movementY] = playerMovementVelocity(
      this.actions.value("right") - this.actions.value("left"),
      this.actions.value("down") - this.actions.value("up"),
      this.hasHorse,
      this.powerups.boots,
      this.invulnerableDestroysEnemies,
      (Math.floor(this.time * NES_FRAME_RATE) & 1) !== 0,
    );
    const nextX = clamp(this.player.x + movementX * delta, PLAYER_MIN_X_NES * NES_WORLD_X_SCALE, PLAYER_MAX_X_NES * NES_WORLD_X_SCALE);
    const nextY = clamp(this.player.y + movementY * delta, this.scroll + PLAYER_MIN_Y_NES * NES_WORLD_Y_SCALE, this.scroll + PLAYER_MAX_Y_NES * NES_WORLD_Y_SCALE);
    if (!this.isPlayerBlocked(nextX, nextY)) {
      this.player.x = nextX;
      this.player.y = nextY;
    } else {
      const currentY = (this.player.y - this.scroll) / NES_WORLD_Y_SCALE;
      const fallbackY = this.scroll + playerCollisionFallbackY(currentY, currentY, collisionScrollStep) * NES_WORLD_Y_SCALE;
      if (!this.isPlayerBlocked(nextX, fallbackY)) this.player.x = nextX;
      else if (movementX !== 0) {
        const currentX = this.player.x / NES_WORLD_X_SCALE;
        const candidateX = nextX / NES_WORLD_X_SCALE;
        this.player.x = (Math.floor(currentX) + candidateX - Math.floor(candidateX)) * NES_WORLD_X_SCALE;
      }
      if (!this.isPlayerBlocked(this.player.x, nextY)) this.player.y = nextY;
      else if (movementY !== 0) {
        const candidateY = (nextY - this.scroll) / NES_WORLD_Y_SCALE;
        this.player.y = this.scroll + playerCollisionFallbackY(currentY, candidateY, collisionScrollStep) * NES_WORLD_Y_SCALE;
      }
    }
    const playerScreenY = (this.player.y - this.scroll) / NES_WORLD_Y_SCALE;
    const nextRowBlocked = roundCollisionBlocks(this.stage, this.scroll, this.player.x, this.scroll + PLAYER_MAX_Y_NES * NES_WORLD_Y_SCALE);
    if (playerScreenY >= PLAYER_MAX_Y_NES && collisionScrollStep > 0 && nextRowBlocked) {
      this.player.x = roundPlayerRecoveryX(this.stage, this.scroll, this.player.x / NES_WORLD_X_SCALE, PLAYER_MAX_Y_NES - 1) * NES_WORLD_X_SCALE;
      this.player.y = this.scroll + (PLAYER_MAX_Y_NES - 1) * NES_WORLD_Y_SCALE;
    }
    this.player.sprite.position = { x: this.player.x, y: this.player.y };
    this.horseSprite.position = { x: this.player.x, y: this.player.y + 16 };
    this.horseSprite.visible = this.hasHorse;
    this.playerAnimation?.update(delta);
    this.player.sprite.visible = this.invulnerable <= 0 || Math.floor(this.time * 14) % 2 === 0;
    this.updatePlayerFire(delta);
    this.updateSmartBomb();
    this.updateSpawns();
    this.updateNinjaBossTeleport(delta);
    this.updateEnemyFire(delta);
    for (const unit of this.units) this.updateUnit(unit, delta, scrollDelta);
    this.resolveCollisions();
    this.units.splice(0, this.units.length, ...this.units.filter((unit) => unit.age < unit.maxAge && unit.hp > 0 && unit.x > -96 && unit.x < 1056 && unit.y > this.scroll - 340 && unit.y < this.scroll + 760));
    this.updateHud();
  }

  private updateInventoryInput(): void {
    const active = this.actions.active("inventory");
    if (!active) {
      this.inventoryLatch = false;
      return;
    }
    if (this.inventoryLatch) return;
    this.inventoryLatch = true;
    this.toggleInventory();
  }

  private updateInventorySelection(): void {
    const direction = this.actions.active("right") || this.actions.active("down") ? 1 : this.actions.active("left") || this.actions.active("up") ? -1 : 0;
    if (direction === 0) {
      this.inventoryDirectionLatch = 0;
      return;
    }
    if (this.inventoryDirectionLatch !== 0) return;
    this.inventoryDirectionLatch = direction;
    const weapons: readonly WeaponName[] = ["pistol", "shotgun", "machinegun", "magnum"];
    for (let count = 0; count < weapons.length; count += 1) {
      this.inventoryWeaponIndex = (this.inventoryWeaponIndex + direction + weapons.length) % weapons.length;
      const weapon = weapons[this.inventoryWeaponIndex] ?? "pistol";
      if (this.ownedWeapons.has(weapon) && (weapon === "pistol" || this.weaponAmmo[weapon] > 0)) {
        this.equipWeapon(weapon);
        break;
      }
    }
  }

  private updateInventory(): void {
    inventoryWeapons.textContent = `PISTOL UNLIMITED / SHOTGUN ${this.weaponAmmo.shotgun} / MACHINE GUN ${this.weaponAmmo.machinegun} / MAGNUM ${this.weaponAmmo.magnum}`;
    inventoryItems.textContent = `BOOTS ${this.powerups.boots} / RIFLE ${this.powerups.rifle} / HORSE ${this.horseHealth} / WANTED ${this.hasWanted ? "YES" : "NO"} / SMART BOMB ${this.smartBombArmed ? "ARMED" : this.smartBombs}`;
    for (const button of inventoryWeaponButtons) {
      const weapon = button.dataset.inventoryWeapon as WeaponName | undefined;
      if (!weapon) continue;
      button.disabled = !this.ownedWeapons.has(weapon) || (weapon !== "pistol" && this.weaponAmmo[weapon] <= 0);
      button.setAttribute("aria-pressed", String(weapon === this.weapon));
    }
    smartBombButton.disabled = this.smartBombs <= 0;
    smartBombButton.setAttribute("aria-pressed", String(this.smartBombArmed));
  }

  equipWeapon(weapon: WeaponName): void {
    if (!this.ownedWeapons.has(weapon) || (weapon !== "pistol" && this.weaponAmmo[weapon] <= 0)) return;
    this.smartBombArmed = false;
    this.weapon = weapon;
    this.inventoryWeaponIndex = (["pistol", "shotgun", "machinegun", "magnum"] as const).indexOf(weapon);
    this.updateInventory();
    this.updateHud();
  }

  private canRefillAmmo(): boolean {
    return (["shotgun", "machinegun", "magnum"] as const).some((weapon) =>
      hasWeaponStock(this.weaponAmmo[weapon]) && this.weaponAmmo[weapon] < WEAPONS[weapon].maxAmmo,
    );
  }

  private refillAmmo(multiplier: number): void {
    for (const weapon of ["shotgun", "machinegun", "magnum"] as const) {
      if (!hasWeaponStock(this.weaponAmmo[weapon])) continue;
      this.weaponAmmo[weapon] = Math.min(
        WEAPONS[weapon].maxAmmo,
        this.weaponAmmo[weapon] + AMMO_GAIN[weapon] * multiplier,
      );
    }
    this.updateInventory();
    this.updateHud();
  }

  private updatePlayerFire(delta: number): void {
    let weapon = WEAPONS[this.weapon];
    this.fireClock -= delta;
    const left = this.actions.active("fireLeft");
    const right = this.actions.active("fireRight");
    const mask = Number(left) | (Number(right) << 1);
    const newlyPressed = mask & ~this.fireMask;
    this.fireMask = mask;
    if (mask === 0) return;
    if (!weaponCanRepeat(this.weapon) && newlyPressed === 0) return;
    if (this.fireClock > 0) return;
    if (this.weapon !== "pistol" && this.ammo <= 0) {
      this.ownedWeapons.delete(this.weapon);
      this.weapon = "pistol";
      weapon = WEAPONS.pistol;
      this.showMessage("OUT OF AMMO");
    }
    if (this.weapon !== "pistol") this.ammo = Math.max(0, this.ammo - 1);
    if (this.weapon === "pistol") {
      const speedFactor = pistolBulletSpeedFactor(this.powerups.rifle);
      for (const [x, y, offset] of pistolVelocities(left, right)) this.spawnBulletVelocity(x * NES_FRAME_RATE * NES_WORLD_X_SCALE * speedFactor, y * NES_FRAME_RATE * NES_WORLD_Y_SCALE * speedFactor, weapon.damage, weaponBulletLifetime("pistol"), offset * NES_WORLD_X_SCALE);
    } else if (this.weapon === "shotgun") {
      for (const [x, y] of shotgunVelocities(left, right)) {
        this.spawnBulletVelocity(x * NES_FRAME_RATE * NES_WORLD_X_SCALE, y * NES_FRAME_RATE * NES_WORLD_Y_SCALE, weapon.damage, weaponBulletLifetime("shotgun"));
      }
    } else if (this.weapon === "machinegun") {
      for (const [x, y, offset] of machineGunVelocities(left, right)) this.spawnBulletVelocity(x * NES_FRAME_RATE * NES_WORLD_X_SCALE, y * NES_FRAME_RATE * NES_WORLD_Y_SCALE, weapon.damage, weaponBulletLifetime("machinegun"), offset * NES_WORLD_X_SCALE);
    } else if (this.weapon === "magnum") {
      for (const [x, y, offset] of pistolVelocities(left, right)) this.spawnBulletVelocity(x * NES_FRAME_RATE * NES_WORLD_X_SCALE, y * NES_FRAME_RATE * NES_WORLD_Y_SCALE, weapon.damage, weaponBulletLifetime("magnum"), offset * NES_WORLD_X_SCALE, true);
    }
    this.fireClock = weapon.interval;
    this.beep(740, 0.025);
  }

  private updateSmartBomb(): void {
    const active = this.actions.active("smartBomb");
    if (!active) {
      this.bombLatch = false;
      return;
    }
    if (this.bombLatch || this.smartBombs <= 0) return;
    this.bombLatch = true;
    this.toggleSmartBombArmed();
  }

  toggleSmartBomb(): void {
    if (this.smartBombs <= 0) return;
    this.toggleSmartBombArmed();
  }

  private toggleSmartBombArmed(): void {
    this.smartBombArmed = !this.smartBombArmed;
    if (this.smartBombArmed) {
      this.weapon = "pistol";
      this.inventoryWeaponIndex = 0;
    }
    this.updateInventory();
    this.updateHud();
    this.showMessage(this.smartBombArmed ? "SMART BOMB ARMED" : "SMART BOMB OFF");
  }

  private updateSpawns(): void {
    this.spawnRomEvents();
    if (this.scroll >= (ROUND_BOSS_TRIGGERS[this.stage - 1] ?? ROUND_BOSS_TRIGGERS[0]!) && this.hasWanted && !this.bossSpawned && this.wingateRespawnClock <= 0) this.spawnBoss();
  }

  private spawnRomEvents(): void {
    if (this.bossSpawned) return;
    const enemyEvents = ROUND_ROM_ENEMY_EVENTS[this.stage - 1] ?? [];
    const objectEvents = ROUND_ROM_OBJECT_EVENTS[this.stage - 1] ?? [];
    while (this.romEventCursor < enemyEvents.length || this.romObjectCursor < objectEvents.length) {
      const enemyEvent = enemyEvents[this.romEventCursor];
      const objectEvent = objectEvents[this.romObjectCursor];
      const enemyFirst = enemyEvent !== undefined && (objectEvent === undefined || compareRomEventOrder(enemyEvent, objectEvent) < 0);
      const eventAt = enemyFirst ? romEventWorldAt(enemyEvent) : objectEvent ? romObjectWorldAt(objectEvent) : Number.POSITIVE_INFINITY;
      if (eventAt > this.scroll) break;
      if (enemyFirst) {
        this.romEventCursor += 1;
        this.spawnRomEnemyEvent(enemyEvent);
      } else if (objectEvent) {
        this.romObjectCursor += 1;
        this.spawnRomObjectEvent(objectEvent);
      }
    }
  }

  private spawnRomObjectEvent(event: RomObjectEvent): void {
    const activeObjects = this.units.filter((unit) => unit.romPool === event.pool && unit.romEntityCode !== undefined && unit.hp > 0).length;
    if (!canSpawnRomPool(event.pool, activeObjects)) return;
    const romRandomSeed = event.entityCode < 0x20 ? this.nextRomSpawnSeedByte() : undefined;
    if (event.semantic === "weaponShop" || event.semantic === "supplyShop") {
      const keeper = this.spawnUnit("shopkeeper", clamp(romObjectWorldX(event), 40, 920), this.scroll + romObjectWorldY(event), 1);
      keeper.vy = ROM_OBJECT_DROP_SPEED;
      keeper.shopIndex = event.shopIndex;
      this.shopSpawnCursor = Math.max(this.shopSpawnCursor, event.shopIndex ?? 0);
      keeper.romEntityCode = event.entityCode;
      keeper.romRandomSeed = romRandomSeed;
      keeper.romFlags = event.flags;
      keeper.romPool = event.pool;
      return;
    }
    if (event.semantic === "sceneObject" && ROM_SCENE_PROP_DISPATCH_TYPES.includes(event.dispatchType as 8)) {
      const prop = this.spawnUnit("sceneObject", clamp(romObjectWorldX(event), 40, 920), this.scroll + romObjectWorldY(event), 1);
      prop.romEntityCode = event.entityCode;
      prop.romRandomSeed = romRandomSeed;
      prop.romFlags = event.flags;
      prop.romPool = event.pool;
      prop.vy = ROM_OBJECT_DROP_SPEED;
      prop.sprite.color = [0.58 + ((event.entityCode - 44) % 3) * 0.08, 0.68, 0.78, 1];
      return;
    }
    if (event.semantic !== "sceneObject" || !ROM_BREAKABLE_CONTAINER_DISPATCH_TYPES.includes(event.dispatchType as 7)) return;
    const pickup = ROM_OBJECT_PICKUPS[event.entityCode as keyof typeof ROM_OBJECT_PICKUPS];
    const container = this.spawnUnit(pickup || ROM_EMPTY_BARREL_ENTITY_CODES.includes(event.entityCode as 32 | 41) ? "barrel" : "sceneObject", clamp(romObjectWorldX(event), 40, 920), this.scroll + romObjectWorldY(event), romEntityHitPoints(event.entityCode), undefined, pickup);
    container.vy = ROM_OBJECT_DROP_SPEED;
    container.romEntityCode = event.entityCode;
    container.romRandomSeed = romRandomSeed;
    container.romFlags = event.flags;
    container.romPool = event.pool;
  }

  private spawnRomEnemyEvent(event: RomEnemyEvent): void {
    const active = this.units.filter((unit) => unit.romPool === event.pool && unit.romEntityCode !== undefined && unit.hp > 0).length;
    if (!canSpawnRomPool(event.pool, active)) return;
    const usedSlots = new Set(this.units.filter((unit) => unit.romPool === "enemy" && unit.romSlot !== undefined && unit.hp > 0).map((unit) => unit.romSlot));
    const romSlot = event.pool === "enemy" ? Array.from({ length: 7 }, (_, slot) => slot).find((slot) => !usedSlots.has(slot)) : undefined;
    if (event.pool === "enemy" && romSlot === undefined) return;
    const romRandomSeed = event.entityCode < 0x20 ? this.nextRomSpawnSeedByte() : undefined;
    if (ROM_FALLING_ROCK_BEHAVIORS.includes(event.behavior as 5)) {
      const rock = this.spawnUnit("enemyBullet", romEventWorldX(event), this.scroll + romEventWorldY(event), 1);
      rock.projectileType = "rock";
      rock.romBehavior = event.behavior;
      rock.romEntityCode = event.entityCode;
      rock.romRandomSeed = romRandomSeed;
      rock.romFlags = event.flags;
      rock.romPool = event.pool;
      rock.romSlot = romSlot;
      rock.romOriginX = rock.x;
      rock.romOriginY = romEventWorldY(event);
      rock.rockNextBoundary = 24;
      rock.rockPhase = event.phase;
      rock.hp = romEntityHitPoints(event.entityCode);
      rock.value = romEnemyScore(event.entityCode);
      rock.vx = 0;
      rock.vy = 0;
      rock.maxAge = ROCK_LIFETIME;
      rock.radius = 15;
      rock.sprite.size = { x: 24, y: 24 };
      rock.sprite.color = [0.55, 0.58, 0.62, 1];
      return;
    }
    const enemyType = ROM_BEHAVIOR_ENEMY_TYPES[event.behavior] ?? "gunman";
    const eventX = romEventWorldX(event);
    const flankCode = event.behavior === 2 && (event.entityCode === 7 || event.entityCode === 8 || event.entityCode === 9) ? event.entityCode : undefined;
    const sideShotgunner = event.behavior === 1 && event.entityCode === 4;
    const sideRifleman = event.behavior === 7 && event.entityCode === 15;
    const enemy = this.spawnUnit(
      "enemy",
      event.behavior === 3 || flankCode !== undefined || sideShotgunner || sideRifleman ? eventX : clamp(eventX, 40, 920),
      this.scroll + romEventWorldY(event),
      romEntityHitPoints(event.entityCode),
      enemyType,
    );
    enemy.value = romEnemyScore(event.entityCode);
    enemy.romBehavior = event.behavior;
    enemy.romEntityCode = event.entityCode;
    enemy.romEventAt = event.at;
    enemy.romRandomSeed = romRandomSeed;
    enemy.romPhase = event.phase;
    enemy.romFlags = event.flags;
    enemy.romPool = event.pool;
    enemy.romSlot = romSlot;
    enemy.romOriginX = enemy.x;
    enemy.romOriginY = romEventWorldY(event);
    if (event.behavior === 3) {
      enemy.backstabberRaidState = createBackstabberRaidState(event.x, event.y, this.player.x / NES_WORLD_X_SCALE, (this.player.y - this.scroll) / NES_WORLD_Y_SCALE, this.romEnemyFineX[romSlot ?? 0], this.romEnemyFineY[romSlot ?? 0]);
    }
    if (flankCode !== undefined && gunmanFlankUsesDynamicState(flankCode, event.y, this.stage, event.phase, event.at)) {
      enemy.gunmanFlankState = createGunmanFlankMovementState(flankCode, event.x, event.y, event.x > 128, this.romEnemyFineX[romSlot ?? 0], this.romEnemyFineY[romSlot ?? 0]);
    }
    if (event.behavior === 0) enemy.maxAge = SNIPER_LIFETIME;
    if (event.behavior === 1) enemy.maxAge = SHOTGUNNER_LIFETIME;
    if (sideShotgunner) enemy.maxAge = SHOTGUNNER_SIDE_LIFETIME;
    if (event.behavior === 2) enemy.maxAge = GUNMAN_LIFETIME;
    if (event.behavior === 6) enemy.maxAge = ninjaTraceLifetime(event.x, event.y, this.stage, event.phase, event.at) ?? NINJA_LIFETIME;
    if (event.behavior === 2 && event.entityCode === 5) enemy.maxAge = GUNMAN_BOTTOM_LIFETIMES.far;
    if (flankCode !== undefined) enemy.maxAge = enemy.gunmanFlankState ? Number.POSITIVE_INFINITY : gunmanFlankLifetime(flankCode, event.y, this.stage, event.phase, event.x > 128, event.at);
    if (event.behavior === 3) enemy.maxAge = Number.POSITIVE_INFINITY;
    if (event.behavior === 8) enemy.maxAge = BACKSTABBER_AMBUSH_LIFETIME;
    if (event.behavior === 9) enemy.maxAge = HATCHET_LIFETIME;
    if (event.behavior === 7) enemy.maxAge = RIFLEMAN_LIFETIME;
    if (sideRifleman) enemy.maxAge = RIFLEMAN_SIDE_LIFETIME;
    if (event.behavior === 4) {
      enemy.bomberState = "entry";
      enemy.bomberDirection = 4;
    }
    if (event.behavior === 11) enemy.maxAge = FIREBREATHER_LIFETIME;
    if (event.behavior === 10) enemy.maxAge = SPEAR_LIFETIME;
    if (event.behavior === 4) enemy.maxAge = Number.POSITIVE_INFINITY;
    enemy.vx = enemyType === "sniper" ? 0 : (this.nextRandom() - 0.5) * (42 + this.stage * 6);
    enemy.vy = enemyType === "backstabber" ? -100 : enemyType === "sniper" ? 0 : 24 + this.stage * 6;
  }

  private updateEnemyFire(delta: number): void {
    const boss = this.units.find((unit) => unit.kind === "boss" && unit.hp > 0 && !unit.exploding);
    if (boss) {
      if (this.stage === MAX_STAGE) return;
      if (this.stage === 3 && boss.devilHawkState) return;
      if (this.stage === 1 && boss.age < boss.invulnerableUntil) return;
      this.bossFireClock -= delta;
      if (this.bossFireClock <= 0) this.fireBoss(boss, boss.age + delta);
    }
  }

  private fireBoss(boss: Unit, effectiveAge = boss.age, devilFullFan?: boolean): void {
    if (this.stage === 1) {
      const projectile = this.spawnEnemyProjectile(
        boss.x + BANDIT_BILL_PROJECTILE_OFFSET_NES[0] * NES_WORLD_X_SCALE,
        boss.y + BANDIT_BILL_PROJECTILE_OFFSET_NES[1] * NES_WORLD_Y_SCALE,
      );
      if (projectile) {
        [projectile.vx, projectile.vy] = banditBillProjectileVelocity(boss.x, boss.y, this.player.x, this.player.y);
      }
      boss.volleysFired += 1;
      if (boss.banditState && boss.banditState.pauseFrames === 0) boss.banditState.pauseFrames = BANDIT_BILL_ATTACK_PAUSE_FRAMES;
      this.bossFireClock = banditBillCooldown(boss.volleysFired);
      this.beep(168, 0.045);
      return;
    }
    if (this.stage === MAX_STAGE) {
      if (wingateCanFire(boss.x, boss.y, this.player.x, this.player.y, this.nextRomRandomFirstSumByte())) {
        const projectile = this.spawnEnemyProjectile(boss.x + WINGATE_PROJECTILE_X_OFFSET_NES * NES_WORLD_X_SCALE, boss.y + WINGATE_PROJECTILE_Y_OFFSET_NES * NES_WORLD_Y_SCALE, true);
        if (projectile) {
          [projectile.vx, projectile.vy] = wingateProjectileVelocity(boss.x, boss.y, this.player.x, this.player.y);
          projectile.maxAge = WINGATE_BULLET_LIFETIME;
          boss.volleysFired += 1;
          this.beep(258, 0.045);
        }
      }
      boss.fired = true;
      return;
    }
    if (this.stage === 2) {
      for (let index = 0; index < CUTTER_BOOMERANG_SPAWN_NES.length; index += 1) {
        const [spawnX, spawnY] = CUTTER_BOOMERANG_SPAWN_NES[index]!;
        const heading = CUTTER_BOOMERANG_HEADINGS[index]!;
        const [targetX, targetY] = CUTTER_BOOMERANG_OUTWARD_TARGETS_NES[index]!;
        const projectile = this.spawnEnemyProjectile(boss.x + spawnX * NES_WORLD_X_SCALE, boss.y + spawnY * NES_WORLD_Y_SCALE, true);
        if (!projectile) break;
        projectile.projectileType = "boomerang";
        [projectile.vx, projectile.vy] = cutterBoomerangVelocity(heading);
        projectile.turnRate = cutterBoomerangHeadingToward(projectile.x, projectile.y, targetX * NES_WORLD_X_SCALE, this.scroll + targetY * NES_WORLD_Y_SCALE);
        projectile.phase = -1;
        projectile.nextFireAt = CUTTER_BOOMERANG_FIRST_TURN_DELAY;
        projectile.maxAge = CUTTER_BOOMERANG_LIFETIME;
        projectile.boomerangHeading = heading;
        projectile.radius = 7;
      }
      boss.volleysFired += 1;
      boss.fired = true;
      this.bossFireClock = CUTTER_ATTACK_INTERVAL;
      this.beep(186, 0.045);
      return;
    }
    if (this.stage === 3) {
      const fullFan = devilFullFan ?? (boss.volleysFired === 0 || (boss.y - this.scroll) / NES_WORLD_Y_SCALE <= DEVIL_HAWK_FULL_FAN_MAX_Y_NES);
      const headings = devilHawkFanHeadings(fullFan, nesAimHeading(boss.x, boss.y, this.player.x, this.player.y));
      boss.fired = true;
      for (const heading of headings) {
        const projectile = this.spawnEnemyProjectile(boss.x, boss.y, true);
        if (!projectile) break;
        projectile.projectileType = "fireball";
        [projectile.vx, projectile.vy] = devilHawkProjectileVelocity(heading);
        projectile.maxAge = fullFan ? DEVIL_HAWK_FULL_FAN_LIFETIME : DEVIL_HAWK_SIDE_FAN_LIFETIME;
        projectile.radius = 7;
      }
      boss.volleysFired += 1;
      if (headings.length > 0) {
        this.beep(204, 0.045);
      }
      this.bossFireClock = devilHawkAttackDelay(effectiveAge);
      return;
    }
    if (this.stage === 5) {
      const launchShell = (): void => {
        const projectile = this.spawnEnemyProjectile(boss.x - 8 * NES_WORLD_X_SCALE, boss.y + 6 * NES_WORLD_Y_SCALE, true);
        if (!projectile) return;
        projectile.projectileType = "grenadeShell";
        [projectile.vx, projectile.vy] = fatmanJoeShellVelocity(boss.x, boss.y, this.player.x, this.player.y);
        projectile.phase = 0;
        projectile.volleysFired = 0;
        projectile.maxAge = FATMAN_JOE_SHELL_LIFETIME;
        boss.volleysFired += 1;
        boss.invulnerableUntil = boss.age + FATMAN_JOE_LAUNCH_INVULNERABILITY;
        boss.fired = true;
        this.beep(240, 0.045);
      };
      if (boss.fatmanFollowup) {
        boss.fatmanFollowup = false;
        if (fatmanJoeAimAllowsLaunch(boss.x, boss.y, this.player.x, this.player.y)) launchShell();
        this.bossFireClock = FATMAN_JOE_ATTACK_DECISION_INTERVAL;
        return;
      }
      const randomByte = this.nextRomRandomFirstSumByte();
      if (fatmanJoeCanLaunch(boss.x, boss.y, this.player.x, this.player.y, randomByte)) launchShell();
      const actionDuration = (randomByte & 0x0f) < 8
        ? fatmanJoeMovementActionDuration(boss.y - this.scroll, randomByte)
        : 0;
      boss.fatmanFollowup = actionDuration > 0;
      this.bossFireClock = actionDuration || FATMAN_JOE_ATTACK_DECISION_INTERVAL;
      return;
    }
    if (this.stage === 4) {
      const aimHeading = nesAimHeading(boss.x, boss.y, this.player.x, this.player.y);
      if (aimHeading >= 12 && aimHeading <= 20) {
        const smoke = this.spawnEnemyProjectile(boss.x, boss.y, true);
        if (smoke) {
          smoke.projectileType = "ninjaSmoke";
          smoke.romOriginX = boss.x;
          smoke.romOriginY = boss.y;
          smoke.targetX = this.player.x + NINJA_BOSS_SHURIKEN_SPAWN_OFFSET_NES[0] * NES_WORLD_X_SCALE;
          smoke.targetY = this.player.y + NINJA_BOSS_SHURIKEN_SPAWN_OFFSET_NES[1] * NES_WORLD_Y_SCALE;
          smoke.vx = 0;
          smoke.vy = 0;
          smoke.radius = 0;
          smoke.maxAge = NINJA_BOSS_PREPARE_DURATION + NINJA_BOSS_PREPARE_CONTROLLER_DURATION;
        }
      }
      boss.fired = true;
      this.bossFireClock = NINJA_BOSS_ATTACK_INTERVAL;
      return;
    }
  }

  private render(): void {
    const renderItems = [this.horseSprite, this.player.sprite, ...this.backgrounds, ...this.units.map((unit) => unit.sprite)];
    this.renderer.render(renderItems, this.camera, { staticItems: false });
  }

  private buildBackground(): void {
    this.backgrounds.length = 0;
    const themes: Rgba[] = [[1, 1, 1, 1], [0.92, 0.98, 1, 1], [1, 0.93, 0.84, 1], [0.9, 0.96, 0.9, 1], [1, 0.86, 0.75, 1], [0.88, 0.9, 1, 1]];
    const tint = themes[(this.stage - 1) % themes.length] ?? [1, 1, 1, 1];
    const road = this.roadTextures[this.stage - 1] ?? this.textures.road;
    const roundLength = ROUND_LENGTHS[this.stage - 1] ?? ROUND_LENGTHS[0]!;
    const mapTexture = this.mapTextures[this.stage - 1] ?? this.textures.terrain;
    const roadWidth = ROAD_WIDTHS[this.stage - 1] ?? 520;
    const edge = (960 - roadWidth) / 2;
    const segments = ROUND_SEGMENTS[this.stage - 1] ?? ROUND_SEGMENTS[0]!;
    this.backgrounds.push(new Sprite({ texture: mapTexture, sampler: this.sampler, position: { x: 480, y: roundLength / 2 }, size: { x: 960, y: roundLength }, anchor: { x: 0.5, y: 0.5 }, color: tint, layer: -20 }));
    const roadTint = this.stage === 2 ? [0.76, 0.72, 0.62, 1] as Rgba : this.stage === 3 ? [0.72, 0.62, 0.48, 1] as Rgba : this.stage === 6 ? [0.64, 0.68, 0.78, 1] as Rgba : [0.82, 0.68, 0.48, 1] as Rgba;
    for (let y = -360; y < roundLength + 650; y += 180) {
      let landmark = segments[0]?.landmark ?? "town";
      for (const candidate of segments) if (y >= candidate.at) landmark = candidate.landmark;
      if (this.stage !== 5) {
        this.backgrounds.push(new Sprite({
          texture: road,
          sampler: this.sampler,
          position: { x: 480, y: y + 90 },
          size: { x: roadWidth, y: 180 },
          anchor: { x: 0.5, y: 0.5 },
          color: roadTint,
          layer: -19,
        }));
      }
      if (this.stage === 5) {
        const forestSegment = Math.floor(y / 180);
        const bridge = forestSegment % 3 === 1;
        this.backgrounds.push(new Sprite({
          texture: road,
          sampler: this.sampler,
          position: { x: 480, y: y + 90 },
          size: { x: roadWidth, y: bridge ? 28 : 180 },
          anchor: { x: 0.5, y: 0.5 },
          color: bridge ? [0.55, 0.32, 0.18, 1] : [0.12, 0.42, 0.78, 1],
          layer: -18.5,
        }));
      }
      if (landmark === "open") {
        // Open clearings deliberately omit side landmarks.
      } else if (landmark === "town" || landmark === "cemetery") {
        for (const x of [edge - 48, 960 - edge + 48]) this.backgrounds.push(new Sprite({ texture: this.textures.landmark, sampler: this.sampler, position: { x, y: y + 90 }, size: { x: 86, y: 130 }, anchor: { x: 0.5, y: 0.5 }, color: tint, layer: -18 }));
        if (landmark === "cemetery") {
          for (const x of [360, 480, 600]) this.backgrounds.push(new Sprite({ texture: this.textures.landmark, sampler: this.sampler, position: { x, y: y + 90 }, size: { x: 28, y: 48 }, anchor: { x: 0.5, y: 0.5 }, color: [0.68, 0.68, 0.75, 1], layer: -17.5 }));
        }
      } else if (landmark === "rock" || landmark === "cliff") {
        for (const x of [edge - 30, 960 - edge + 30]) this.backgrounds.push(new Sprite({ texture: this.textures.landmark, sampler: this.sampler, position: { x, y: y + 90 }, size: { x: 52, y: 170 }, anchor: { x: 0.5, y: 0.5 }, color: tint, layer: -18 }));
      } else if (landmark === "village") {
        for (const x of [edge - 36, 960 - edge + 36]) this.backgrounds.push(new Sprite({ texture: this.textures.landmark, sampler: this.sampler, position: { x, y: y + 90 }, size: { x: 68, y: 92 }, anchor: { x: 0.5, y: 0.5 }, color: [1, 0.78, 0.6, 1], layer: -18 }));
      }
    }
    const obstacleColors = { boulder: [0.45, 0.5, 0.56, 1] as Rgba, tree: [0.2, 0.48, 0.28, 1] as Rgba, grave: [0.68, 0.68, 0.74, 1] as Rgba };
    for (const obstacle of ROUND_OBSTACLES[this.stage - 1] ?? []) {
      this.backgrounds.push(new Sprite({
        texture: this.textures.landmark,
        sampler: this.sampler,
        position: { x: obstacle.x, y: obstacle.at + obstacle.length / 2 },
        size: { x: obstacle.width, y: obstacle.length },
        anchor: { x: 0.5, y: 0.5 },
        color: obstacleColors[obstacle.kind],
        layer: -17,
      }));
    }
  }

  private isPlayerBlocked(x: number, y: number): boolean {
    return roundCollisionBlocks(this.stage, this.scroll, x, y);
  }

  private openShop(index: number): void {
    if (this.shopOpen) return;
    this.clearEnemyProjectiles();
    this.shopIndex = index;
    this.shopOpen = true;
    for (const unit of this.units) if (unit.kind === "shopkeeper") unit.hp = 0;
    shop.hidden = false;
    void this.audio?.pause();
    const shopType = SHOP_TYPES[this.stage - 1]?.[this.shopIndex - 1] ?? "supplies";
    shopTitle.textContent = `${shopType === "weapons" ? "WEAPON SHOP" : "SUPPLY SHOP"} / ROUND ${this.stage}`;
    shopMessage.textContent = `POINTS ${String(this.score).padStart(6, "0")}`;
    this.refreshShopButtons();
  }

  private refreshShopButtons(): void {
    const shopType: ShopType = SHOP_TYPES[this.stage - 1]?.[this.shopIndex - 1] ?? "supplies";
    for (const item of shopItems) {
      const key = item.dataset.shopItem as WeaponName | "horse" | "ammo" | "wanted" | "smartBomb" | undefined;
      const cost = key === "horse" ? SHOP_COSTS.horse : key === "ammo" ? SHOP_COSTS.ammo : key === "smartBomb" ? SHOP_COSTS.smartBomb : key === "wanted" ? WANTED_COSTS[this.stage - 1] ?? 50_000 : key ? WEAPONS[key].cost : 0;
      if (key === "wanted") item.textContent = `Wanted poster $${String(cost).padStart(5, "0")}`;
      const isWeapon = key === "shotgun" || key === "machinegun" || key === "magnum" || key === "smartBomb";
      const available = shopType === "weapons" ? isWeapon : !isWeapon;
      item.hidden = !available;
      item.disabled = !available || key === "horse" ? !available || this.hasHorse || this.score < cost : key === "ammo" ? !available || !this.canRefillAmmo() || this.score < cost : key === "wanted" ? !available || this.shopIndex < 2 || this.hasWanted || this.score < cost : key === "smartBomb" ? !available || this.smartBombs >= SMART_BOMB_CAPACITY || this.score < cost : key ? !available || hasWeaponStock(this.weaponAmmo[key]) || this.score < cost : true;
    }
  }

  buyShopItem(item: string): void {
    const key = item as WeaponName | "horse" | "ammo" | "wanted" | "smartBomb";
    const shopType: ShopType = SHOP_TYPES[this.stage - 1]?.[this.shopIndex - 1] ?? "supplies";
    const isWeapon = key === "shotgun" || key === "machinegun" || key === "magnum" || key === "smartBomb";
    if (key === "wanted" && this.shopIndex < 2) {
      shopMessage.textContent = "NOT SOLD HERE";
      return;
    }
    if ((shopType === "weapons") !== isWeapon) {
      shopMessage.textContent = "NOT SOLD HERE";
      return;
    }
    const cost = key === "horse" ? SHOP_COSTS.horse : key === "ammo" ? SHOP_COSTS.ammo : key === "smartBomb" ? SHOP_COSTS.smartBomb : key === "wanted" ? WANTED_COSTS[this.stage - 1] ?? 50_000 : WEAPONS[key]?.cost;
    const alreadyOwned = key === "horse" ? this.hasHorse : key === "wanted" ? this.hasWanted : key === "smartBomb" ? this.smartBombs >= SMART_BOMB_CAPACITY : isWeapon ? hasWeaponStock(this.weaponAmmo[key as WeaponName]) : false;
    if (alreadyOwned) {
      shopMessage.textContent = "ALREADY OWNED";
      return;
    }
    const remainingPoints = cost === undefined ? undefined : spendPoints(this.score, cost);
    if (remainingPoints === undefined) {
      shopMessage.textContent = "NOT ENOUGH POINTS";
      return;
    }
    this.score = remainingPoints;
    if (key === "horse") {
      this.hasHorse = true;
      this.horseHealth = 3;
    }
    else if (key === "ammo") this.refillAmmo(4);
    else if (key === "wanted") this.hasWanted = true;
    else if (key === "smartBomb") this.smartBombs = Math.min(SMART_BOMB_CAPACITY, this.smartBombs + 1);
    else {
      this.ownedWeapons.add(key);
      this.weapon = key;
      this.weaponAmmo[key] = WEAPONS[key].maxAmmo;
    }
    shopMessage.textContent = `${key.toUpperCase()} READY`;
    this.updateHud();
    this.refreshShopButtons();
  }

  closeShop(): void {
    this.shopOpen = false;
    shop.hidden = true;
    canvas.focus();
    void this.audio?.resume();
    this.showMessage("RIDE ON");
  }

  private spawnBoss(): void {
    this.bossSpawned = true;
    this.bossFireClock = this.stage === 1 ? BANDIT_BILL_FIRST_VOLLEY_DELAY : this.stage === 2 ? CUTTER_FIRST_ATTACK_DELAY : this.stage === 3 ? DEVIL_HAWK_FIRST_VOLLEY_DELAY : this.stage === 4 ? NINJA_BOSS_FIRST_PREPARE_DELAY : this.stage === 5 ? FATMAN_JOE_FIRST_ATTACK_DELAY : 0.6;
    const definition = STAGES[this.stage - 1] ?? STAGES[0]!;
    const isBanditBill = this.stage === 1;
    const isCutter = this.stage === 2;
    const isDevilHawk = this.stage === 3;
    const isNinjaBoss = this.stage === 4;
    const isFatmanJoe = this.stage === 5;
    const isFirstWingate = this.stage === 6;
    const ninjaBossLane = isNinjaBoss ? NINJA_BOSS_ENTRY_LANES[ninjaBossEntryLaneIndex(this.randomState[0], Math.floor((this.player.y - this.scroll) / NES_WORLD_Y_SCALE))] : undefined;
    const boss = this.spawnUnit(
      "boss",
      isBanditBill ? BANDIT_BILL_ENTRY_X_LANES[this.randomState[0] & 0x03] ?? 360 : isCutter ? CUTTER_ENTRY_X_LANES[this.randomState[0] & 0x03] ?? 540 : isDevilHawk ? DEVIL_HAWK_ENTRY_X_LANES[this.randomState[0] & 0x03] ?? 630 : isNinjaBoss ? ninjaBossLane?.[0] ?? 660 : isFatmanJoe ? FATMAN_JOE_ENTRY_X_LANES[this.randomState[0] & 0x03] ?? 570 : isFirstWingate ? WINGATE_ENTRY_X_LANES[this.randomState[0] & 0x03] ?? 570 : 480,
      this.scroll + (isBanditBill ? BANDIT_BILL_ENTRY_Y : isCutter ? CUTTER_ENTRY_Y : isDevilHawk ? DEVIL_HAWK_ENTRY_Y : isNinjaBoss ? ninjaBossLane?.[1] ?? 288 : isFatmanJoe ? FATMAN_JOE_ENTRY_Y : isFirstWingate ? WINGATE_ENTRY_Y : 90),
      bossTotalHitPoints(this.stage, this.wingatePhase),
    );
    if (isBanditBill || isCutter || isDevilHawk || isNinjaBoss || isFatmanJoe || isFirstWingate) {
      boss.bossEntryX = boss.x;
      boss.bossEntryY = boss.y - this.scroll;
      if (isBanditBill || isCutter) boss.vx = 0;
      if (isFirstWingate) boss.wingateState = createWingateMovementState(boss.x / NES_WORLD_X_SCALE, this.wingatePhase, true);
      if (isFatmanJoe) boss.vx = (boss.phase < Math.PI ? 1 : -1) * FATMAN_JOE_MOVEMENT_SPEED;
      if (isNinjaBoss) boss.invulnerableUntil = NINJA_BOSS_ENTRY_INVULNERABILITY;
      if (isNinjaBoss) boss.bossNextTeleportAt = ninjaBossNextTeleportAt();
    }
    this.showMessage(`WANTED: ${definition.boss}`);
    this.beep(180, 0.18);
  }

  private spawnUnit(kind: UnitKind, x: number, y: number, hp: number, enemyType?: EnemyType, itemType?: ItemType): Unit {
    const textureName: TextureName = kind === "enemyBullet" || kind === "enemy" || kind === "boss" ? "bullet" : kind === "item" ? "ammo" : kind === "sceneObject" ? "landmark" : kind === "bullet" || kind === "moneyBag" || kind === "ammo" || kind === "barrel" || kind === "shopkeeper" ? kind : "bullet";
    const isBoss = kind === "boss";
    const isPickup = kind === "moneyBag" || kind === "ammo" || kind === "item";
    const small = kind === "bullet" || kind === "enemyBullet";
    const sceneObject = kind === "sceneObject";
    const colors: Record<EnemyType, [number, number, number, number]> = {
      gunman: [1, 0.82, 0.82, 1], rifleman: [0.82, 0.9, 1, 1], bomber: [1, 0.9, 0.65, 1], sniper: [0.78, 1, 0.88, 1],
      backstabber: [1, 0.72, 0.88, 1], ninja: [0.82, 0.78, 1, 1], hatchet: [1, 0.82, 0.68, 1], spear: [0.7, 0.9, 0.72, 1], firebreather: [1, 0.62, 0.42, 1], shotgunner: [1, 0.48, 0.3, 1],
    };
    const bossColors: readonly [number, number, number, number][] = [[1, 0.55, 0.42, 1], [0.55, 0.75, 1, 1], [1, 0.72, 0.34, 1], [0.78, 0.58, 1, 1], [1, 0.82, 0.42, 1], [1, 0.96, 0.72, 1]];
    const itemColors: Record<ItemType, [number, number, number, number]> = { boots: [0.45, 0.8, 1, 1], rifle: [0.7, 0.9, 0.5, 1], ammo: [0.5, 0.7, 1, 1], money: [1, 0.85, 0.35, 1], pow: [1, 0.35, 0.35, 1], skull: [0.75, 0.75, 0.75, 1], horse: [0.8, 0.55, 0.3, 1], blueYashichi: [0.35, 0.65, 1, 1], redYashichi: [1, 0.3, 0.35, 1] };
    const color: [number, number, number, number] = isBoss ? bossColors[this.stage - 1] ?? bossColors[0]! : kind === "enemy" && enemyType ? colors[enemyType] : kind === "item" && itemType ? itemColors[itemType] : kind === "shopkeeper" ? [1, 0.9, 0.55, 1] : sceneObject ? [0.65, 0.72, 0.8, 1] : [1, 1, 1, 1];
    const texture = isBoss ? this.bossTextures[this.stage - 1] ?? this.bossTextures[0]! : kind === "enemy" && enemyType ? this.enemyTextures[enemyType] : kind === "item" && itemType ? this.itemTextures[itemType] : this.textures[textureName];
    const animated = kind === "enemy" || kind === "shopkeeper" || isBoss;
    const frameDuration = kind === "shopkeeper" ? 0.35 : 0.14;
    const sprite = new Sprite({ texture, sampler: this.sampler, frame: animated ? { x: 0, y: 0, width: 0.5, height: 1 } : undefined, position: { x, y }, size: { x: isBoss ? 110 : sceneObject ? 52 : isPickup ? 28 : small ? 9 : 34, y: isBoss ? 68 : sceneObject ? 52 : isPickup ? 28 : small ? 25 : kind === "shopkeeper" ? 54 : 34 }, anchor: { x: 0.5, y: 0.5 }, color, layer: isBoss ? 15 : small ? 12 : sceneObject ? 4 : isPickup ? 11 : 10 });
    const animation = animated ? new SpriteAnimationBinding(sprite, new AnimationPlayer().play(new SpriteFrameClip([
      { x: 0, y: 0, width: 0.5, height: 1, duration: frameDuration },
      { x: 0.5, y: 0, width: 0.5, height: 1, duration: frameDuration },
    ]), true)) : undefined;
    const unit: Unit = {
      kind, enemyType, itemType, projectileType: kind === "enemyBullet" ? "bullet" : undefined, sprite, x, y, animation, shopIndex: undefined, romBehavior: undefined, romEntityCode: undefined, romEventAt: undefined, romRandomSeed: undefined, romPhase: undefined, romFlags: undefined, romPool: undefined, romOriginX: undefined, romOriginY: undefined, targetX: undefined, targetY: undefined, gunmanBottomRoute: undefined, gunmanTopBranch: undefined, gunmanFlankState: undefined, backstabberRaidState: undefined, romSlot: undefined, riflemanAimHeading: undefined, hatchetState: undefined, firebreatherState: undefined, spearState: undefined, bomberState: undefined, bomberDirection: undefined, banditState: undefined, cutterState: undefined, boomerangHeading: undefined, bossCycleStart: undefined, bossNextTeleportAt: undefined, rockNextBoundary: undefined, rockPhase: undefined,
      vx: isBoss ? 42 : kind === "barrel" || kind === "shopkeeper" ? 0 : (this.nextRandom() - 0.5) * 70,
      vy: isBoss || isPickup || kind === "barrel" || kind === "shopkeeper" || sceneObject ? 0 : kind === "enemyBullet" ? 0 : 45,
      hp, radius: isBoss ? 48 : isPickup ? 17 : kind === "shopkeeper" ? 22 : small ? 7 : 19,
      value: isBoss ? bossReward(this.stage, this.wingatePhase) : kind === "moneyBag" ? 200 : kind === "ammo" || kind === "item" || kind === "barrel" ? 0 : 100,
      age: 0, phase: this.nextRandom() * Math.PI * 2, damage: kind === "enemy" && enemyType === "rifleman" ? 0 : 1, fired: false, nextFireAt: 0, volleysFired: 0, turnRate: 0, maxAge: isBoss ? unitMaxAge("boss") : sceneObject ? Number.POSITIVE_INFINITY : small ? unitMaxAge("projectile") : isPickup || kind === "barrel" ? unitMaxAge("pickup") : unitMaxAge("enemy"), invulnerableUntil: 0, piercing: false,
    };
    this.units.push(unit);
    return unit;
  }

  private spawnBulletVelocity(vx: number, vy: number, damage: number, lifetime = 0.55, offset = 0, piercing = false): void {
    const unit = this.spawnPlayerBullet(this.player.x + offset);
    if (!unit) return;
    unit.vx = vx;
    unit.vy = vy;
    unit.damage = damage;
    unit.maxAge = lifetime;
    unit.piercing = piercing;
    unit.hitTargets = piercing ? new Set<Unit>() : undefined;
    if (piercing) {
      unit.radius = 11;
      unit.sprite.size = { x: 14, y: 32 };
    }
  }

  private spawnPlayerBullet(x: number): Unit | undefined {
    const active = this.units.filter((unit) => unit.kind === "bullet" && unit.hp > 0).length;
    return canSpawnPlayerBullet(active) ? this.spawnUnit("bullet", x, this.player.y - 32, 1) : undefined;
  }

  private spawnEnemyProjectile(x: number, y: number, bossProjectile = false): Unit | undefined {
    const active = this.units.filter((unit) => unit.kind === "enemyBullet" && unit.projectileType !== "rock" && Boolean(unit.bossProjectile) === bossProjectile && unit.hp > 0).length;
    if (!(bossProjectile ? canSpawnBossProjectile(active) : canSpawnEnemyProjectile(active))) return undefined;
    const projectile = this.spawnUnit("enemyBullet", x, y, 1);
    projectile.bossProjectile = bossProjectile;
    return projectile;
  }

  private spawnRomDrop(kind: "ammo" | "item" | "moneyBag", x: number, y: number, entityCode: number, itemType?: ItemType): void {
    const active = this.units.filter((unit) => unit.romPool === "enemy" && unit.romEntityCode !== undefined && unit.hp > 0).length;
    if (!canSpawnRomPool("enemy", active)) return;
    const drop = this.spawnUnit(kind, x, y, 1, undefined, itemType);
    drop.romPool = "enemy";
    drop.romEntityCode = entityCode;
  }

  private updateUnit(unit: Unit, delta: number, scrollDelta = 0): void {
    unit.age += delta;
    unit.animation?.update(delta);
    if (unit.kind === "boss" && unit.exploding) {
      const progress = clamp((unit.age - (unit.maxAge - BOSS_DEFEAT_ANIMATION_DURATION)) / BOSS_DEFEAT_ANIMATION_DURATION, 0, 1);
      unit.sprite.visible = unit.age < unit.maxAge && Math.floor(progress * 12) % 2 === 0;
      unit.sprite.size = { x: 110 + progress * 48, y: 68 + progress * 48 };
      unit.sprite.color = [1, 0.78 + progress * 0.22, 0.3 + progress * 0.7, 1];
      unit.sprite.position = { x: unit.x, y: unit.y };
      if (unit.age >= unit.maxAge) unit.hp = 0;
      return;
    }
    if (unit.kind === "enemy" && unit.exploding) {
      const frame = Math.min(ENEMY_DEFEAT_Y_OFFSETS_NES.length - 1, Math.floor((unit.age - (unit.maxAge - ENEMY_DEFEAT_ANIMATION_DURATION)) * NES_FRAME_RATE));
      unit.targetY = (unit.targetY ?? unit.y) + scrollDelta;
      unit.y = unit.targetY + ENEMY_DEFEAT_Y_OFFSETS_NES[frame]! * NES_WORLD_Y_SCALE;
      unit.sprite.visible = frame % 2 === 0;
      unit.sprite.position = { x: unit.x, y: unit.y };
      if (unit.age >= unit.maxAge) unit.hp = 0;
      return;
    }
    if (unit.kind === "enemyBullet" && unit.projectileType === "rock") {
      if (unit.exploding) {
        unit.targetY = (unit.targetY ?? unit.y) + scrollDelta;
        unit.y = unit.targetY;
        unit.sprite.visible = Math.floor((unit.maxAge - unit.age) * NES_FRAME_RATE) % 2 === 0;
      } else {
        const [offsetX, offsetY] = fallingRockPosition(unit.age, (unit.romOriginX ?? unit.x) < 480, unit.rockPhase);
        unit.x = (unit.romOriginX ?? unit.x) + offsetX * NES_WORLD_X_SCALE;
        unit.y = this.scroll + (unit.romOriginY ?? 0) + offsetY * NES_WORLD_Y_SCALE;
        const boundary = unit.rockNextBoundary ?? 24;
        const screenY = (unit.y - this.scroll) / NES_WORLD_Y_SCALE;
        if (!fallingRockOnScreen(screenY)) {
          unit.hp = 0;
          return;
        }
        if (unit.age * NES_FRAME_RATE >= boundary) {
          const fromLeft = (unit.romOriginX ?? unit.x) < 480;
          const probeHeading = fromLeft ? 14 : 16;
          const [probeX, probeY] = nesActorCollisionProbeOffset(probeHeading);
          const [previousOffsetX, previousOffsetY] = fallingRockPosition((boundary - 1) / NES_FRAME_RATE, fromLeft, unit.rockPhase);
          const screenX = (unit.romOriginX ?? unit.x) / NES_WORLD_X_SCALE + previousOffsetX + probeX;
          const screenY = (unit.romOriginY ?? unit.y - this.scroll) / NES_WORLD_Y_SCALE + previousOffsetY + probeY;
          if (boundary >= ROCK_IMPACT_DELAY * NES_FRAME_RATE || !roundCollisionAtNes(this.stage, this.scroll, screenX, screenY)) {
            unit.exploding = true;
            unit.targetY = unit.y;
            unit.maxAge = unit.age + ROCK_IMPACT_LIFETIME;
          } else {
            unit.rockNextBoundary = boundary === 24 ? 56 : ROCK_IMPACT_DELAY * NES_FRAME_RATE;
          }
        }
      }
      unit.sprite.position = { x: unit.x, y: unit.y };
      if (unit.age >= unit.maxAge) unit.hp = 0;
      return;
    }
    if (unit.kind === "enemy") {
      if (unit.enemyType === "sniper") unit.y += scrollDelta * 2;
      if (unit.enemyType === "backstabber") {
        if (unit.romBehavior === 3 && unit.backstabberRaidState) {
          advanceBackstabberRaid(unit.backstabberRaidState, Math.round(unit.age * NES_FRAME_RATE));
          unit.x = unit.backstabberRaidState.x * NES_WORLD_X_SCALE;
          unit.y = this.scroll + unit.backstabberRaidState.y * NES_WORLD_Y_SCALE;
          if (unit.backstabberRaidState.dead) unit.hp = 0;
        } else if (unit.romBehavior === 8) {
          unit.y = this.scroll + Math.min(unit.age * BACKSTABBER_AMBUSH_DROP_SPEED, BACKSTABBER_AMBUSH_DEPTH);
        } else {
          unit.y += unit.vy * delta;
          unit.x += Math.sin(unit.age * 7 + unit.phase) * 35 * delta;
        }
      } else if (unit.enemyType === "ninja") {
        const tracedNinja = unit.romBehavior === 6;
        if (tracedNinja) {
          const originX = unit.romOriginX ?? unit.x;
          const originY = unit.romOriginY ?? unit.y - this.scroll;
          const tracedPosition = ninjaTracePosition(unit.age, originX / NES_WORLD_X_SCALE, originY / NES_WORLD_Y_SCALE, this.stage, unit.romPhase ?? 0, unit.romEventAt);
          if (tracedPosition) {
            unit.x = tracedPosition[0];
            unit.y = this.scroll + tracedPosition[1];
          } else if (unit.age < NINJA_FIRST_SHOT_DELAY) {
            unit.x = originX;
            unit.y = this.scroll + originY + ninjaOpeningY(unit.age);
          } else {
            unit.targetX ??= this.player.x + (this.player.x < originX ? -12 : 12) * NES_WORLD_X_SCALE;
            const attackY = ninjaOpeningY(NINJA_FIRST_SHOT_DELAY);
            unit.targetY ??= originY + attackY - 34 * NES_WORLD_Y_SCALE;
            [unit.x, unit.y] = ninjaAttackPosition(unit.age, originX, this.scroll + originY + attackY, unit.targetX, this.scroll + unit.targetY);
          }
        } else {
          unit.x += (unit.vx + Math.sin(unit.age * 6 + unit.phase) * 90) * delta;
          unit.y += unit.vy * 1.8 * delta;
        }
        const tracedThrowFrame = unit.romBehavior === 6 ? ninjaTraceThrowFrame(this.stage, unit.romEventAt) : undefined;
        const throwAt = typeof tracedThrowFrame === "number" ? tracedThrowFrame / NES_FRAME_RATE : NINJA_FIRST_SHOT_DELAY;
        const canThrow = tracedThrowFrame === false ? false : tracedThrowFrame !== undefined || ninjaCanThrow(unit.y, this.player.y);
        if (!unit.fired && unit.age >= throwAt && (tracedThrowFrame === false || canThrow)) {
          unit.fired = true;
          if (canThrow) {
            const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
            const projectile = this.spawnEnemyProjectile(unit.x, unit.y);
            if (projectile) {
              projectile.projectileType = "shuriken";
              [projectile.vx, projectile.vy] = unit.romBehavior === 6 ? mediumProjectileVelocity(unit.x, unit.y, this.player.x, this.player.y) : [Math.cos(angle) * 300, Math.sin(angle) * 300];
              projectile.radius = 8;
              projectile.sprite.size = { x: 16, y: 16 };
            }
          }
        }
      } else if (unit.enemyType === "rifleman") {
        const tracedRifleman = unit.romBehavior === 7;
        const sideRifleman = tracedRifleman && unit.romEntityCode === 15;
        if (sideRifleman) {
          const [offsetX, offsetY] = riflemanSidePosition(unit.age, (unit.romOriginX ?? unit.x) < 480);
          unit.x = (unit.romOriginX ?? unit.x) + offsetX * NES_WORLD_X_SCALE;
          unit.y = this.scroll + (unit.romOriginY ?? 0) + offsetY * NES_WORLD_Y_SCALE;
        } else if (tracedRifleman) {
          const [, y] = riflemanPosition(unit.age);
          unit.x = unit.romOriginX ?? unit.x;
          unit.y = this.scroll + (unit.romOriginY ?? 0) + y * NES_WORLD_Y_SCALE;
        } else {
          unit.x += unit.vx * delta;
          unit.y += (unit.age * NES_FRAME_RATE < RIFLEMAN_ATTACK_STATE_FRAME ? unit.vy : -unit.vy * 0.75) * delta;
        }
        if (!sideRifleman && unit.nextFireAt === 0) unit.nextFireAt = RIFLEMAN_FIRST_SHOT_DELAY;
        const sideShotFrame = sideRifleman ? RIFLEMAN_SIDE_SHOT_FRAMES[unit.volleysFired] : undefined;
        const nextRiflemanShot = sideRifleman ? sideShotFrame === undefined ? undefined : sideShotFrame / NES_FRAME_RATE : unit.nextFireAt;
        if (nextRiflemanShot !== undefined && unit.age >= nextRiflemanShot && unit.volleysFired < (sideRifleman ? RIFLEMAN_SIDE_SHOT_FRAMES.length : RIFLEMAN_SHOTS_PER_VOLLEY) && riflemanCanAttack(unit.y - this.scroll, this.player.y - this.scroll)) {
          unit.riflemanAimHeading ??= nesAimHeading(unit.x, unit.y, this.player.x, this.player.y);
          if (!sideRifleman) unit.nextFireAt += RIFLEMAN_SHOT_INTERVAL;
          const shotIndex = unit.volleysFired;
          unit.volleysFired += 1;
          const projectile = this.spawnEnemyProjectile(unit.x, tracedRifleman ? unit.y : unit.y + 12);
          if (projectile) {
            const heading = riflemanShotHeading(unit.riflemanAimHeading, shotIndex);
            [projectile.vx, projectile.vy] = mediumProjectileHeadingVelocity(heading);
          }
        }
      } else if (unit.enemyType === "sniper") {
        const sniperShotFrames = unit.romEntityCode === 2 ? SNIPER_CODE2_SHOT_FRAMES : SNIPER_SHOT_FRAMES;
        const nextShotFrame = unit.romBehavior === 0 ? sniperShotFrames[unit.volleysFired] : undefined;
        const shouldFire = unit.romBehavior === 0
          ? nextShotFrame !== undefined && unit.age >= nextShotFrame / NES_FRAME_RATE
          : !unit.fired && unit.age > 0.8;
        if (shouldFire) {
          unit.fired = true;
          unit.volleysFired += 1;
            // The ROM creates the Sniper bullet at the actor coordinate; the
            // generic enemy offset shifts this edge-mounted shot downward.
            const projectile = this.spawnEnemyProjectile(unit.x, unit.y);
            if (projectile) {
              [projectile.vx, projectile.vy] = sniperProjectileVelocity(unit.x, unit.y, this.player.x, this.player.y);
          }
          unit.invulnerableUntil = unit.age + SNIPER_COVER_DURATION;
        }
        unit.sprite.visible = unit.age >= unit.invulnerableUntil;
      } else if (unit.enemyType === "bomber") {
        const tracedBomber = unit.romBehavior === 4;
        if (tracedBomber) unit.y += scrollDelta;
        const throwDynamite = (): void => {
          unit.bomberState = "throwing";
          unit.nextFireAt = unit.age + BOMBER_THROW_DURATION;
          unit.vx = 0;
          unit.vy = 0;
          const projectile = this.spawnEnemyProjectile(unit.x, unit.y);
          if (projectile) {
            projectile.projectileType = "dynamite";
            projectile.romOriginY = projectile.y - this.scroll;
            projectile.vx = (this.player.x - unit.x) * DYNAMITE_AIM_FACTOR / DYNAMITE_HORIZONTAL_DURATION;
            projectile.vy = 0;
            projectile.maxAge = DYNAMITE_LIFETIME;
          }
        };
        const startMovement = (direction: number): void => {
          unit.bomberState = "moving";
          unit.bomberDirection = direction;
          [unit.vx, unit.vy] = bomberMovementVelocity(unit.bomberDirection);
          unit.nextFireAt = unit.age + bomberMovementDuration(unit.bomberDirection);
        };
        const nextMovementDecision = () => {
          const actorY = unit.y - this.scroll;
          const randomByte = bomberMovementUsesRandom(actorY) ? this.nextRomRandomSumByte() : 0;
          return bomberMovementDecision(actorY, randomByte);
        };
        if (tracedBomber && unit.bomberState === "entry") {
          if (unit.age <= BOMBER_ENTRY_DURATION) {
            unit.x = unit.romOriginX ?? unit.x;
            unit.y = this.scroll + (unit.romOriginY ?? 0) + bomberOpeningY(unit.age);
          } else {
            unit.y += NES_FRAME_RATE * NES_WORLD_Y_SCALE * delta;
          }
          if (Math.abs(this.player.y - unit.y) < 64 * NES_WORLD_Y_SCALE && unit.y - this.scroll >= 32 * NES_WORLD_Y_SCALE) {
            const decision = nextMovementDecision();
            if (decision.throwDynamite) throwDynamite();
            else startMovement(decision.direction);
          }
        } else if (tracedBomber && unit.bomberState === "throwing") {
          if (unit.age >= unit.nextFireAt) startMovement(nextMovementDecision().direction);
        } else if (tracedBomber) {
          const nextX = unit.x + unit.vx * delta;
          const nextY = unit.y + unit.vy * delta;
          if (this.isPlayerBlocked(nextX, nextY)) {
            unit.bomberDirection = ((unit.bomberDirection ?? 0) + 4) & 7;
            [unit.vx, unit.vy] = bomberMovementVelocity(unit.bomberDirection);
          }
          unit.x += unit.vx * delta;
          unit.y += unit.vy * delta;
          if (unit.age >= unit.nextFireAt) {
            const decision = nextMovementDecision();
            if (decision.throwDynamite) {
              throwDynamite();
            } else {
              startMovement(decision.direction);
            }
          }
        } else {
          unit.x += unit.vx * delta;
          unit.y += unit.vy * 0.7 * delta;
          if (!unit.fired && unit.age >= 0.8) {
            unit.fired = true;
            const projectile = this.spawnEnemyProjectile(unit.x, unit.y + 12);
            if (projectile) {
              projectile.projectileType = "dynamite";
              projectile.romOriginY = projectile.y - this.scroll;
              projectile.vx = (this.player.x - unit.x) * DYNAMITE_AIM_FACTOR / DYNAMITE_HORIZONTAL_DURATION;
              projectile.vy = 0;
              projectile.maxAge = DYNAMITE_LIFETIME;
            }
          }
        }
        if (tracedBomber && unit.age > BOMBER_ENTRY_DURATION && (unit.y - this.scroll <= 0 || romActorScreenYReleased((unit.y - this.scroll) / NES_WORLD_Y_SCALE))) unit.hp = 0;
      } else if (unit.enemyType === "shotgunner") {
        const tracedSpread = unit.romBehavior === 1;
        const sideShotgunner = tracedSpread && unit.romEntityCode === 4;
        if (sideShotgunner) {
          const [offsetX, offsetY] = shotgunnerSidePosition(unit.age, (unit.romOriginX ?? unit.x) < 480);
          unit.x = (unit.romOriginX ?? unit.x) + offsetX * NES_WORLD_X_SCALE;
          unit.y = this.scroll + (unit.romOriginY ?? 0) + offsetY * NES_WORLD_Y_SCALE;
        } else if (tracedSpread) {
          const [offsetX, offsetY] = shotgunnerPosition(unit.age);
          unit.x = (unit.romOriginX ?? unit.x) + offsetX * NES_WORLD_X_SCALE;
          unit.y = this.scroll + (unit.romOriginY ?? 0) + offsetY * NES_WORLD_Y_SCALE;
        } else {
          unit.x += unit.vx * delta;
          unit.y += unit.vy * 0.65 * delta;
        }
        if (unit.nextFireAt === 0) unit.nextFireAt = sideShotgunner ? SHOTGUNNER_SIDE_SHOT_FRAME / NES_FRAME_RATE : tracedSpread ? SHOTGUNNER_FIRST_VOLLEY_DELAY : 0.8;
        const activeProjectiles = this.units.filter((candidate) => candidate.kind === "enemyBullet" && candidate.projectileType !== "rock" && !candidate.bossProjectile && candidate.hp > 0).length;
        if (unit.age >= unit.nextFireAt && (tracedSpread ? unit.volleysFired < (sideShotgunner ? 1 : 2) : !unit.fired) && (!tracedSpread || canSpawnEnemyProjectile(activeProjectiles, 3))) {
          unit.fired = true;
          unit.volleysFired += 1;
          if (tracedSpread) unit.nextFireAt += SHOTGUNNER_VOLLEY_INTERVAL;
          const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
          for (let index = 0; index < 3; index += 1) {
            const projectile = this.spawnEnemyProjectile(unit.x, tracedSpread ? unit.y : unit.y + 12);
            if (!projectile) break;
            const fan = tracedSpread ? SHOTGUNNER_FAN_NES[index] : undefined;
            if (fan) {
              projectile.vx = (fan[0] / 8) * NES_FRAME_RATE * NES_WORLD_X_SCALE;
              projectile.vy = (fan[1] / 8) * NES_FRAME_RATE * NES_WORLD_Y_SCALE;
            } else {
              const spread = index - 1;
              projectile.vx = Math.cos(angle + spread * 0.2) * 145;
              projectile.vy = Math.sin(angle + spread * 0.2) * 145;
            }
          }
        }
      } else if (unit.enemyType === "spear") {
        const tracedSpear = unit.romBehavior === 10;
        if (!tracedSpear) {
          unit.x += Math.sin(unit.age * 3 + unit.phase) * 28 * delta;
          unit.y += unit.vy * delta;
          if (!unit.fired && unit.age >= 0.65) {
            unit.fired = true;
            const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
            const projectile = this.spawnEnemyProjectile(unit.x, unit.y + 12);
            if (projectile) {
              projectile.projectileType = "spear";
              [projectile.vx, projectile.vy] = [Math.cos(angle) * 150, Math.sin(angle) * 150];
              projectile.sprite.size = { x: 7, y: 34 };
            }
          }
        } else {
          const state = unit.spearState ??= createSpearState((unit.romOriginX ?? unit.x) / NES_WORLD_X_SCALE, (unit.y - this.scroll) / NES_WORLD_Y_SCALE, unit.romEntityCode === 20);
          const result = advanceSpear(
            state,
            Math.floor(unit.age * NES_FRAME_RATE),
            this.player.x / NES_WORLD_X_SCALE,
            (this.player.y - this.scroll) / NES_WORLD_Y_SCALE,
            () => this.nextRomRandomDifferenceByte(),
          );
          unit.x = state.x * NES_WORLD_X_SCALE;
          unit.y = this.scroll + state.y * NES_WORLD_Y_SCALE;
          if (result.dead) unit.hp = 0;
          if (result.shots.length > 0) {
            unit.fired = true;
            unit.volleysFired += result.shots.length;
          }
          for (const heading of result.shots) {
            const projectile = this.spawnEnemyProjectile(unit.x + SPEAR_PROJECTILE_OFFSET_NES[0] * NES_WORLD_X_SCALE, unit.y + SPEAR_PROJECTILE_OFFSET_NES[1] * NES_WORLD_Y_SCALE);
            if (!projectile) continue;
            projectile.projectileType = "spear";
            [projectile.vx, projectile.vy] = mediumProjectileHeadingVelocity(heading);
            projectile.sprite.size = { x: 7, y: 34 };
          }
        }
      } else if (unit.enemyType === "hatchet") {
        const tracedHatchet = unit.romBehavior === 9;
        if (!tracedHatchet) {
          unit.x += Math.sin(unit.age * 3.4 + unit.phase) * 42 * delta;
          unit.y += unit.vy * delta;
          if (!unit.fired && unit.age >= 0.7) {
            unit.fired = true;
            const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
            const projectile = this.spawnEnemyProjectile(unit.x, unit.y + 12);
            if (projectile) {
              projectile.projectileType = "hatchet";
              [projectile.vx, projectile.vy] = [Math.cos(angle) * 230, Math.sin(angle) * 230];
              projectile.radius = 9;
              projectile.sprite.size = { x: 16, y: 16 };
            }
          }
        } else {
          const state = unit.hatchetState ??= createHatchetState((unit.romOriginX ?? unit.x) / NES_WORLD_X_SCALE, (unit.y - this.scroll) / NES_WORLD_Y_SCALE);
          const result = advanceHatchet(
            state,
            Math.floor(unit.age * NES_FRAME_RATE),
            this.player.x / NES_WORLD_X_SCALE,
            (this.player.y - this.scroll) / NES_WORLD_Y_SCALE,
            (probeX, probeY) => roundCollisionAtNes(this.stage, this.scroll, probeX, probeY),
          );
          unit.x = state.x * NES_WORLD_X_SCALE;
          unit.y = this.scroll + state.y * NES_WORLD_Y_SCALE;
          if (result.dead) unit.hp = 0;
          if (result.shots.length > 0) {
            unit.fired = true;
            unit.volleysFired += result.shots.length;
          }
          for (const heading of result.shots) {
            const projectile = this.spawnEnemyProjectile(unit.x, unit.y);
            if (!projectile) continue;
            projectile.projectileType = "hatchet";
            [projectile.vx, projectile.vy] = mediumProjectileHeadingVelocity(heading);
            projectile.radius = 9;
            projectile.sprite.size = { x: 16, y: 16 };
          }
        }
      } else if (unit.enemyType === "firebreather") {
        const tracedFirebreather = unit.romBehavior === 11;
        if (!tracedFirebreather) {
          unit.x += Math.sin(unit.age * 4 + unit.phase) * 55 * delta;
          unit.y += unit.vy * delta;
          if (!unit.fired && unit.age >= 0.7) {
            unit.fired = true;
            const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
            for (const spread of [-0.22, 0, 0.22]) {
              const projectile = this.spawnEnemyProjectile(unit.x, unit.y + 12);
              if (!projectile) break;
              projectile.projectileType = "fireball";
              projectile.vx = Math.cos(angle + spread) * 115;
              projectile.vy = Math.sin(angle + spread) * 115;
            }
          }
        } else {
          const originX = (unit.romOriginX ?? unit.x) / NES_WORLD_X_SCALE;
          const state = unit.firebreatherState ??= createFirebreatherState(originX, (unit.y - this.scroll) / NES_WORLD_Y_SCALE, unit.romEntityCode === 22 ? originX < 128 ? 8 : 24 : 16);
          const result = advanceFirebreather(
            state,
            Math.floor(unit.age * NES_FRAME_RATE),
            this.player.x / NES_WORLD_X_SCALE,
            (this.player.y - this.scroll) / NES_WORLD_Y_SCALE,
            (probeX, probeY) => roundCollisionAtNes(this.stage, this.scroll, probeX, probeY),
            () => this.nextRomRandomSumByte(),
          );
          unit.x = state.x * NES_WORLD_X_SCALE;
          unit.y = this.scroll + state.y * NES_WORLD_Y_SCALE;
          if (romActorScreenYReleased(state.y)) unit.hp = 0;
          if (result.shots.length > 0) {
            unit.fired = true;
            unit.volleysFired += result.shots.length;
          }
          for (const heading of result.shots) {
            const projectile = this.spawnEnemyProjectile(unit.x + FIREBREATHER_PROJECTILE_OFFSET_NES[0] * NES_WORLD_X_SCALE, unit.y + FIREBREATHER_PROJECTILE_OFFSET_NES[1] * NES_WORLD_Y_SCALE);
            if (!projectile) continue;
            projectile.projectileType = "fireball";
            [projectile.vx, projectile.vy] = mediumProjectileHeadingVelocity(unit.romEntityCode === 22 ? heading & 0x1e : heading);
          }
        }
      } else if (unit.enemyType === "gunman") {
        const previousX = unit.x;
        const previousY = unit.y;
        const tracedGunman = unit.romBehavior === 2;
        const bottomGunman = tracedGunman && unit.romEntityCode === 5;
        if (bottomGunman && unit.gunmanBottomRoute === undefined && unit.age >= GUNMAN_BOTTOM_BRANCH_FRAME / NES_FRAME_RATE) {
          unit.targetX = this.player.x;
          unit.targetY = this.player.y;
          unit.gunmanBottomRoute = gunmanBottomRoute(unit.romOriginX ?? unit.x, unit.y, unit.targetX, unit.targetY);
          unit.maxAge = GUNMAN_BOTTOM_LIFETIMES[unit.gunmanBottomRoute];
        }
        const bottomGunmanFromLeft = bottomGunman ? (unit.romOriginX ?? unit.x) <= (unit.targetX ?? this.player.x) : undefined;
        const bottomGunmanRoute = bottomGunman ? unit.gunmanBottomRoute ?? "near" : undefined;
        const flankGunman = tracedGunman && (unit.romEntityCode === 7 || unit.romEntityCode === 8 || unit.romEntityCode === 9) ? unit.romEntityCode : undefined;
        const tracedTopGunman = tracedGunman && bottomGunmanFromLeft === undefined && flankGunman === undefined;
        if (tracedTopGunman && unit.gunmanTopBranch === undefined) {
          const originX = (unit.romOriginX ?? unit.x) / NES_WORLD_X_SCALE;
          unit.targetX = this.player.x;
          unit.gunmanTopBranch = gunmanTopBranch(unit.targetX / NES_WORLD_X_SCALE, originX);
          unit.maxAge = GUNMAN_TOP_LIFETIMES_FRAMES[unit.gunmanTopBranch] / NES_FRAME_RATE;
        }
        if (bottomGunmanFromLeft !== undefined && bottomGunmanRoute !== undefined) {
          const [offsetX, offsetY] = gunmanBottomPosition(bottomGunmanRoute, bottomGunmanFromLeft, unit.age);
          unit.x = (unit.romOriginX ?? unit.x) + offsetX * NES_WORLD_X_SCALE;
          unit.y = this.scroll + (unit.romOriginY ?? 0) + offsetY * NES_WORLD_Y_SCALE;
        } else if (flankGunman !== undefined) {
          if (unit.gunmanFlankState) {
            advanceGunmanFlankMovement(
              unit.gunmanFlankState,
              Math.round(unit.age * NES_FRAME_RATE),
              this.player.x / NES_WORLD_X_SCALE,
              (this.player.y - this.scroll) / NES_WORLD_Y_SCALE,
              (probeX, probeY) => roundCollisionAtNes(this.stage, this.scroll, probeX, probeY),
            );
            unit.x = unit.gunmanFlankState.x * NES_WORLD_X_SCALE;
            unit.y = this.scroll + unit.gunmanFlankState.y * NES_WORLD_Y_SCALE;
            if (unit.gunmanFlankState.dead) unit.hp = 0;
          } else {
            const originY = (unit.romOriginY ?? 0) / NES_WORLD_Y_SCALE;
            const fromRight = (unit.romOriginX ?? unit.x) > 480;
            const [offsetX, offsetY] = gunmanFlankPosition(flankGunman, unit.age, originY, this.stage, unit.romPhase ?? 0, fromRight, unit.romEventAt);
            const hasRightTrace = this.stage === 3 && Math.round(originY) === 64 && (unit.romPhase ?? 0) === 1 || this.stage === 6 && Math.round(originY) === 32;
            const mirror = flankGunman === 7 && fromRight && !hasRightTrace ? -1 : 1;
            unit.x = (unit.romOriginX ?? unit.x) + offsetX * NES_WORLD_X_SCALE * mirror;
            unit.y = this.scroll + (unit.romOriginY ?? 0) + offsetY * NES_WORLD_Y_SCALE;
          }
        } else if (tracedTopGunman) {
          const [x, y] = gunmanTopPosition(
            unit.age,
            (unit.targetX ?? this.player.x) / NES_WORLD_X_SCALE,
            (unit.romOriginX ?? unit.x) / NES_WORLD_X_SCALE,
            (unit.romOriginY ?? 0) / NES_WORLD_Y_SCALE,
          );
          unit.x = x;
          unit.y = this.scroll + y;
        } else {
          unit.x += unit.vx * delta;
          unit.y += unit.vy * delta;
        }
        if (!tracedGunman && bottomGunmanFromLeft === undefined && flankGunman === undefined) unit.x += Math.sin(unit.age * 3 + unit.phase) * 18 * delta;
        const topGunman = bottomGunmanRoute === undefined && flankGunman === undefined;
        const timedGunman = topGunman || flankGunman !== undefined;
        if (timedGunman && unit.nextFireAt === 0) unit.nextFireAt = (flankGunman === undefined
          ? gunmanFirstOpportunityFrame(unit.romRandomSeed ?? 0, (unit.romOriginY ?? 0) / NES_WORLD_Y_SCALE)
          : gunmanFlankFirstOpportunityFrame(unit.romRandomSeed ?? 0, (unit.romOriginY ?? 0) / NES_WORLD_Y_SCALE, this.stage, flankGunman, unit.romPhase ?? 0)) / NES_FRAME_RATE;
        const shotFrames = bottomGunmanRoute !== undefined ? GUNMAN_BOTTOM_SHOT_FRAMES[bottomGunmanRoute] : undefined;
        const nextShotFrame = shotFrames?.[unit.volleysFired];
        const timedOpportunity = timedGunman && unit.age >= unit.nextFireAt;
        if (unit.hp > 0 && unit.romBehavior === 2 && (timedOpportunity || nextShotFrame !== undefined && unit.age >= nextShotFrame / NES_FRAME_RATE)) {
          const facingHeading = tracedTopGunman
            ? gunmanTopHeading(unit.age, (unit.targetX ?? this.player.x) / NES_WORLD_X_SCALE, (unit.romOriginX ?? unit.x) / NES_WORLD_X_SCALE, (unit.romOriginY ?? 0) / NES_WORLD_Y_SCALE)
              ?? nesAimHeading(previousX, previousY, unit.x, unit.y)
            : unit.gunmanFlankState
              ? gunmanFlankMovementFacingHeading(unit.gunmanFlankState)
            : flankGunman !== undefined && (flankGunman === 8 || flankGunman === 9) && unit.age * NES_FRAME_RATE < GUNMAN_FLANK_INITIAL_STATE_FRAMES
              ? 16
            : nesAimHeading(previousX, previousY, unit.x, unit.y);
          const aimHeading = nesAimHeading(unit.x, unit.y, this.player.x, this.player.y);
          if (bottomGunmanRoute !== undefined || gunmanCanFire(facingHeading, aimHeading)) {
            const projectile = this.spawnEnemyProjectile(unit.x, unit.y);
            if (projectile) {
              unit.fired = true;
              unit.volleysFired += 1;
              [projectile.vx, projectile.vy] = gunmanProjectileVelocity(unit.x, unit.y, this.player.x, this.player.y);
            }
          }
          if (timedOpportunity) unit.nextFireAt += GUNMAN_SHOT_OPPORTUNITY_INTERVAL;
        }
      }
      if (unit.enemyType === "sniper") {
        if ((unit.y - this.scroll) / NES_WORLD_Y_SCALE >= ROM_SCREEN_RELEASE_Y_NES) unit.hp = 0;
      }
      if (unit.romSlot !== undefined) {
        const state = unit.gunmanFlankState ?? unit.backstabberRaidState;
        if (state) {
          const slot = unit.romSlot;
          this.romEnemyFineX[slot] = Math.floor((state.x - Math.floor(state.x)) * 256) & 0xff;
          this.romEnemyFineY[slot] = Math.floor((state.y - Math.floor(state.y)) * 256) & 0xff;
        }
      }
      if (unit.x < 32 || unit.x > 928) unit.vx *= -1;
    } else if (unit.kind === "boss") {
      const ninjaCycleStart = this.stage === 4 ? unit.bossCycleStart ?? 0 : 0;
      const ninjaCycleAge = unit.age - ninjaCycleStart;
      const ninjaTeleporting = this.stage === 4 && ninjaCycleStart > 0 && ninjaCycleAge < 0;
      const wingateFireChecks = this.stage === 6 && unit.wingateState
        ? advanceWingateMovement(unit.wingateState, Math.floor(unit.age * NES_FRAME_RATE), () => this.nextRomRandomSecondSumByte()).fireChecks
        : 0;
      const banditCombatFrame = Math.floor(unit.age * NES_FRAME_RATE - BANDIT_BILL_ENTRY_DURATION * NES_FRAME_RATE);
      const cutterCombatFrame = Math.floor(unit.age * NES_FRAME_RATE - CUTTER_ENTRY_DURATION * NES_FRAME_RATE);
      const devilHawkCombatFrame = Math.floor(unit.age * NES_FRAME_RATE - DEVIL_HAWK_ENTRY_DURATION * NES_FRAME_RATE);
      if (this.stage === 1 && banditCombatFrame >= BANDIT_BILL_RANDOM_ROUTE_START_FRAME) {
        unit.banditState ??= createBanditBillMovementState(
          banditBillCombatX(unit.age, unit.bossEntryX ?? BANDIT_BILL_ENTRY_X_LANES[3]!) / NES_WORLD_X_SCALE,
          banditBillCombatY(unit.age, unit.bossEntryX ?? BANDIT_BILL_ENTRY_X_LANES[3]!) / NES_WORLD_Y_SCALE,
        );
        if (unit.banditState.frame === BANDIT_BILL_RANDOM_ROUTE_START_FRAME) {
          unit.banditState.x += BANDIT_BILL_RANDOM_HANDOFF_FINE_X / 256;
          unit.banditState.y += BANDIT_BILL_RANDOM_HANDOFF_FINE_Y / 256;
        }
        advanceBanditBillMovement(unit.banditState, banditCombatFrame, () => this.nextRomRandomSecondSumByte());
        unit.x = unit.banditState.x * NES_WORLD_X_SCALE;
        unit.y = this.scroll + unit.banditState.y * NES_WORLD_Y_SCALE;
      }
      if (this.stage === 2 && cutterCombatFrame >= CUTTER_RANDOM_ROUTE_START_FRAME) {
        unit.cutterState ??= createCutterMovementState(
          cutterCombatX(unit.age, unit.bossEntryX ?? CUTTER_ENTRY_X_LANES[2]!) / NES_WORLD_X_SCALE,
          cutterCombatY(unit.age) / NES_WORLD_Y_SCALE,
        );
        if (unit.cutterState.frame === CUTTER_RANDOM_ROUTE_START_FRAME) {
          unit.cutterState.x += CUTTER_RANDOM_HANDOFF_FINE_X / 256;
          unit.cutterState.y += CUTTER_RANDOM_HANDOFF_FINE_Y / 256;
          unit.cutterState.segmentFrames = CUTTER_RANDOM_HANDOFF_SEGMENT_FRAMES;
          unit.cutterState.gait = CUTTER_RANDOM_HANDOFF_GAIT;
          unit.cutterState.attackEnabled = true;
        }
        advanceCutterMovement(unit.cutterState, cutterCombatFrame, () => this.nextRomRandomSecondSumByte());
        unit.x = unit.cutterState.x * NES_WORLD_X_SCALE;
        unit.y = this.scroll + unit.cutterState.y * NES_WORLD_Y_SCALE;
      }
      let devilFireFans: readonly boolean[] = [];
      if (this.stage === 3 && devilHawkCombatFrame >= DEVIL_HAWK_RANDOM_ROUTE_START_FRAME) {
        unit.devilHawkState ??= createDevilHawkMovementState(
          devilHawkCombatX(unit.age, unit.bossEntryX ?? DEVIL_HAWK_ENTRY_X_LANES[3]!) / NES_WORLD_X_SCALE,
          devilHawkCombatY(unit.age) / NES_WORLD_Y_SCALE,
        );
        if (unit.devilHawkState.frame === DEVIL_HAWK_RANDOM_ROUTE_START_FRAME) {
          unit.devilHawkState.x += DEVIL_HAWK_RANDOM_HANDOFF_FINE_X / 256;
          unit.devilHawkState.y += DEVIL_HAWK_RANDOM_HANDOFF_FINE_Y / 256;
          unit.devilHawkState.heading = DEVIL_HAWK_RANDOM_HANDOFF_HEADING;
          unit.devilHawkState.segmentFrames = DEVIL_HAWK_RANDOM_HANDOFF_SEGMENT_FRAMES;
          unit.devilHawkState.gait = DEVIL_HAWK_RANDOM_HANDOFF_GAIT;
          unit.devilHawkState.actionCounter = DEVIL_HAWK_RANDOM_HANDOFF_ACTION_COUNTER;
          unit.devilHawkState.romExactActions = true;
        }
        devilFireFans = advanceDevilHawkMovement(unit.devilHawkState, devilHawkCombatFrame, () => this.nextRomRandomThirdFirstSumByte(), () => this.nextRomRandomSecondThirdSumByte()).fullFans;
        unit.x = unit.devilHawkState.x * NES_WORLD_X_SCALE;
        unit.y = this.scroll + unit.devilHawkState.y * NES_WORLD_Y_SCALE;
      }
      if (this.stage === 6 && unit.wingateState) unit.x = unit.wingateState.x * NES_WORLD_X_SCALE;
      else if (this.stage === 1 && unit.banditState) unit.x = unit.banditState.x * NES_WORLD_X_SCALE;
      else if (this.stage === 2 && unit.cutterState) unit.x = unit.cutterState.x * NES_WORLD_X_SCALE;
      else if (this.stage === 3 && unit.devilHawkState) unit.x = unit.devilHawkState.x * NES_WORLD_X_SCALE;
      else if (this.stage === 1 && unit.age <= BANDIT_BILL_ENTRY_DURATION) unit.x = unit.bossEntryX ?? unit.x;
      else if (this.stage === 1) unit.x = banditBillCombatX(unit.age, unit.bossEntryX ?? unit.x);
      else if (this.stage === 2 && unit.age <= CUTTER_FIRST_ATTACK_DELAY) unit.x = cutterOpeningX(unit.age, unit.bossEntryX ?? unit.x);
      else if (this.stage === 3 && unit.age <= DEVIL_HAWK_ENTRY_DURATION + DEVIL_HAWK_POST_ENTRY_X_HOLD) unit.x = unit.bossEntryX ?? unit.x;
      else if (this.stage === 3) unit.x = devilHawkCombatX(unit.age, unit.bossEntryX ?? unit.x);
      else if (this.stage === 4 && (ninjaTeleporting || ninjaCycleAge < NINJA_BOSS_ENTRY_INVULNERABILITY)) unit.x = unit.bossEntryX ?? unit.x;
      else if (this.stage === 4) unit.x = ninjaBossCombatX(ninjaCycleAge, unit.bossEntryX ?? unit.x, unit.bossCycleStart !== undefined);
      else if (this.stage === 5 && unit.age <= FATMAN_JOE_ENTRY_DURATION) unit.x = unit.bossEntryX ?? unit.x;
      else {
        if (this.stage === 2) unit.x = cutterCombatX(unit.age, unit.bossEntryX ?? unit.x);
        if (this.stage === 5) unit.x = fatmanJoeCombatX(unit.age, unit.bossEntryX ?? unit.x);
        else if (this.stage !== 2) unit.x += unit.vx * delta;
      }
      const edgeEntryBoss = this.stage === 1 || this.stage === 2 || this.stage === 3 || this.stage === 4 || (this.stage === 6 && unit.bossEntryY !== undefined);
      const [minBossX, maxBossX] = this.stage === 5 ? fatmanJoeArenaXBounds() : edgeEntryBoss ? [0, 960] : [380, 580];
      if (unit.x < minBossX || unit.x > maxBossX) unit.vx *= -1;
      if (this.stage === 6 && unit.wingateState) unit.y = this.scroll + unit.wingateState.y * NES_WORLD_Y_SCALE;
      else if (this.stage === 1 && unit.banditState) unit.y = this.scroll + unit.banditState.y * NES_WORLD_Y_SCALE;
      else if (this.stage === 2 && unit.cutterState) unit.y = this.scroll + unit.cutterState.y * NES_WORLD_Y_SCALE;
      else if (this.stage === 3 && unit.devilHawkState) unit.y = this.scroll + unit.devilHawkState.y * NES_WORLD_Y_SCALE;
      else if (this.stage === 1) unit.y = this.scroll + (unit.age <= BANDIT_BILL_ENTRY_DURATION ? banditBillOpeningY(unit.age) : banditBillCombatY(unit.age, unit.bossEntryX ?? 192 * (960 / 256)));
      else if (this.stage === 2) unit.y = this.scroll + (unit.age <= CUTTER_ENTRY_DURATION ? cutterOpeningY(unit.age) : cutterCombatY(unit.age));
      else if (this.stage === 3) unit.y = this.scroll + (unit.age <= DEVIL_HAWK_ENTRY_DURATION ? devilHawkOpeningY(unit.age) : devilHawkCombatY(unit.age));
      else if (this.stage === 4) {
        const entryY = unit.bossEntryY ?? NINJA_BOSS_ENTRY_LANES[0]?.[1] ?? 144;
        unit.y = this.scroll + (ninjaCycleAge < NINJA_BOSS_ENTRY_INVULNERABILITY ? entryY : ninjaBossCombatY(ninjaCycleAge, entryY, unit.bossCycleStart !== undefined));
      }
      else if (this.stage === 5) unit.y = this.scroll + (unit.age <= FATMAN_JOE_ENTRY_DURATION ? fatmanJoeOpeningY(unit.age) : fatmanJoeCombatY(unit.age));
      else unit.y = this.scroll + 92 + Math.sin(unit.age * 2) * 18;
      for (let index = 0; index < wingateFireChecks; index += 1) this.fireBoss(unit);
      for (const fullFan of devilFireFans) this.fireBoss(unit, unit.age, fullFan);
      unit.sprite.visible = bossSpriteVisible(this.stage, unit.age, unit.invulnerableUntil, ninjaTeleporting);
    } else if (unit.kind === "shopkeeper" || unit.kind === "sceneObject") {
      if (unit.vy !== 0) unit.y += scrollDelta * 2;
      if ((unit.y - this.scroll) / NES_WORLD_Y_SCALE >= ROM_SCREEN_RELEASE_Y_NES) unit.hp = 0;
    } else if (unit.kind === "barrel") {
      if (!unit.exploding) unit.y += scrollDelta * 2;
      if (!unit.exploding && (unit.y - this.scroll) / NES_WORLD_Y_SCALE >= ROM_SCREEN_RELEASE_Y_NES) unit.hp = 0;
      if (unit.exploding) {
        const start = unit.maxAge - EMPTY_BARREL_EXPLOSION_LIFETIME;
        const progress = clamp((unit.age - start) / EMPTY_BARREL_EXPLOSION_LIFETIME, 0, 1);
        unit.sprite.visible = Math.floor(progress * 12) % 2 === 0;
        unit.sprite.size = { x: 54 + progress * 28, y: 54 + progress * 28 };
        unit.sprite.color = [1, 0.55 + progress * 0.45, 0.2 + progress * 0.8, 1];
      }
    } else if (unit.kind === "moneyBag" || unit.kind === "item" || unit.kind === "ammo") {
      unit.y += scrollDelta * 2;
      unit.x += Math.sin(unit.age * 4 + unit.phase) * 14 * delta;
      if ((unit.y - this.scroll) / NES_WORLD_Y_SCALE >= ROM_SCREEN_RELEASE_Y_NES) unit.hp = 0;
    } else {
      unit.y += scrollDelta;
      if (unit.kind === "enemyBullet") {
        const style = PROJECTILE_STYLES[unit.projectileType ?? "bullet"];
        if (style) {
          unit.sprite.size = style.size;
          unit.sprite.color = style.color;
        }
      }
      if (unit.kind === "enemyBullet" && unit.projectileType === "dynamite") {
        if (unit.age < DYNAMITE_AIRBORNE_DURATION) {
          unit.y = this.scroll + (unit.romOriginY ?? unit.y - this.scroll) + dynamiteVerticalOffset(unit.age);
          if (unit.age >= DYNAMITE_HORIZONTAL_DURATION) unit.vx = 0;
        } else if (!unit.fired) {
          unit.fired = true;
          unit.y = this.scroll + (unit.romOriginY ?? unit.y - this.scroll) + dynamiteVerticalOffset(DYNAMITE_AIRBORNE_DURATION);
          unit.vx = 0;
        } else {
          // The common projectile update already applied the scene scroll.
        }
        if (unit.age >= DYNAMITE_LIFETIME) {
          if (distance(unit, this.player) <= 85 && this.invulnerable <= 0) this.takeHit();
          unit.hp = 0;
          this.beep(95, 0.14);
        }
      }
      if (unit.kind === "enemyBullet" && unit.projectileType === "grenadeShell" && unit.age >= FATMAN_JOE_SHELL_FLIGHT_DURATION) {
        unit.targetX ??= unit.x;
        unit.targetY ??= unit.y;
        unit.x = unit.targetX;
        unit.y = unit.targetY;
        unit.vx = 0;
        unit.vy = 0;
        const mineCount = fatmanJoeMineCount(unit.age);
        while (unit.volleysFired < mineCount) {
          const [offsetX, offsetY] = FATMAN_JOE_MINE_OFFSETS_NES[unit.volleysFired]!;
          const mine = this.spawnEnemyProjectile(unit.targetX + offsetX * NES_WORLD_X_SCALE, unit.targetY + offsetY * NES_WORLD_Y_SCALE, true);
          if (!mine) break;
          mine.projectileType = "grenade";
          mine.vx = 0;
          mine.vy = 0;
          mine.maxAge = FATMAN_JOE_GRENADE_LIFETIME;
          unit.volleysFired += 1;
        }
      }
      const ninjaSmokePathDriven = unit.kind === "enemyBullet" && unit.projectileType === "ninjaSmoke";
      if (ninjaSmokePathDriven) {
        [unit.x, unit.y] = ninjaBossPreparePosition(unit.age, unit.romOriginX ?? unit.x, unit.romOriginY ?? unit.y, unit.targetX ?? unit.x, unit.targetY ?? unit.y);
        if (!unit.fired && unit.age >= NINJA_BOSS_PREPARE_DURATION) {
          unit.fired = true;
          unit.sprite.visible = false;
          for (const [x, y] of NINJA_BOSS_SHURIKEN_VELOCITIES_NES) {
            const projectile = this.spawnEnemyProjectile(unit.x, unit.y, true);
            if (!projectile) break;
            projectile.projectileType = "shuriken";
            projectile.vx = x * NES_FRAME_RATE * NES_WORLD_X_SCALE;
            projectile.vy = y * NES_FRAME_RATE * NES_WORLD_Y_SCALE;
            projectile.maxAge = NINJA_BOSS_SHURIKEN_LIFETIME;
            projectile.radius = 8;
          }
          this.beep(222, 0.045);
        }
      }
      const boomerangPathDriven = unit.kind === "enemyBullet" && unit.projectileType === "boomerang" && unit.boomerangHeading !== undefined;
      if (boomerangPathDriven) {
        if (unit.phase < 0) {
          unit.phase = 0;
        } else {
          if (unit.phase === 1 || unit.phase === 3) {
            unit.turnRate = cutterBoomerangHeadingToward(unit.x, unit.y, unit.targetX ?? this.player.x, unit.targetY ?? this.player.y);
            unit.phase += 1;
          }
          while (unit.age >= unit.nextFireAt) {
            unit.boomerangHeading = cutterBoomerangTurn(unit.boomerangHeading!, unit.turnRate);
            unit.nextFireAt += CUTTER_BOOMERANG_TURN_INTERVAL;
          }
          [unit.vx, unit.vy] = cutterBoomerangVelocity(unit.boomerangHeading!);
          unit.x += unit.vx * delta;
          unit.y += unit.vy * delta;
          if (unit.phase === 2 && unit.boomerangHeading === unit.turnRate) unit.phase = 3;
          if (unit.phase === 0 && unit.y >= this.scroll + CUTTER_BOOMERANG_REAIM_Y_NES * NES_WORLD_Y_SCALE) {
            unit.targetX = this.player.x;
            unit.targetY = this.player.y;
            unit.phase = 1;
          }
          if (!cutterBoomerangOnScreen(unit.x / NES_WORLD_X_SCALE, (unit.y - this.scroll) / NES_WORLD_Y_SCALE)) unit.hp = 0;
        }
      } else if (unit.kind === "enemyBullet" && unit.turnRate !== 0) {
        const speed = Math.hypot(unit.vx, unit.vy);
        const angle = Math.atan2(unit.vy, unit.vx) + unit.turnRate * delta;
        unit.vx = Math.cos(angle) * speed;
        unit.vy = Math.sin(angle) * speed;
      }
      if (unit.kind === "enemyBullet" && (unit.projectileType === "boomerang" || unit.projectileType === "shuriken" || unit.projectileType === "hatchet")) unit.sprite.rotation += delta * 10;
      if (!boomerangPathDriven && !ninjaSmokePathDriven) {
        unit.x += unit.vx * delta;
        if (unit.projectileType !== "dynamite") unit.y += unit.vy * delta;
      }
      const coordinateBoundProjectile = unit.kind === "enemyBullet" && unit.projectileType !== "rock" && unit.projectileType !== "dynamite" && unit.projectileType !== "ninjaSmoke" && unit.projectileType !== "grenade";
      if (coordinateBoundProjectile && !romProjectileOnScreen(unit.x / NES_WORLD_X_SCALE, (unit.y - this.scroll) / NES_WORLD_Y_SCALE)) unit.hp = 0;
    }
    unit.sprite.position = { x: unit.x, y: unit.y };
  }

  private resolveCollisions(): void {
    const bullets = this.units.filter((unit) => unit.kind === "bullet" && unit.hp > 0);
    const targets = this.units.filter((unit) => (unit.kind === "barrel" || (unit.kind === "enemy" || unit.kind === "boss") && unit.sprite.visible || unit.kind === "enemyBullet" && unit.projectileType === "rock") && !unit.exploding && unit.hp > 0);
    for (const bullet of bullets) {
      while (bullet.hp > 0) {
        if (bullet.piercing) {
          const projectile = this.units.find((candidate) => candidate.kind === "enemyBullet" && candidate.projectileType !== "ninjaSmoke" && candidate.projectileType !== "grenade" && candidate.projectileType !== "rock" && candidate.hp > 0 && distance(bullet, candidate) <= bullet.radius + candidate.radius);
          if (projectile) {
            projectile.hp = 0;
            continue;
          }
        }
        const target = targets.find((candidate) => (candidate.kind === "barrel" || candidate.kind === "enemy" || candidate.kind === "boss" || candidate.kind === "enemyBullet" && candidate.projectileType === "rock") && candidate.hp > 0 && !candidate.exploding && !bullet.hitTargets?.has(candidate) && distance(bullet, candidate) <= bullet.radius + candidate.radius);
        if (!target) break;
        if (!this.isBossVulnerable(target)) break;
        if (bullet.piercing) bullet.hitTargets?.add(target);
        else bullet.hp = 0;
        const previousHp = target.hp;
        const targetHitPoints = target.kind === "boss"
          ? bossCurrentBarHitPoints(previousHp, bossHealthProfile(this.stage, this.wingatePhase).hitPoints)
          : previousHp;
        target.hp -= Math.min(bullet.damage, targetHitPoints);
        if (target.hp > 0) {
          this.handleBossDamage(target, previousHp);
          continue;
        }
        this.defeatTarget(target);
      }
    }
    for (const unit of this.units.filter((candidate) => candidate.hp > 0)) {
      if (unit.hp <= 0) continue;
      if (unit.exploding) continue;
      if (unit.kind === "enemyBullet" && unit.projectileType === "ninjaSmoke") continue;
      if ((unit.kind === "enemy" || unit.kind === "boss") && !unit.sprite.visible) continue;
      if (unit.kind === "moneyBag" || unit.kind === "item" || unit.kind === "ammo") {
        if (distance(unit, this.player) <= unit.radius + 22) {
          unit.hp = 0;
          this.score = addScore(this.score, unit.value);
          if (unit.kind === "item" && unit.itemType) this.collectItem(unit.itemType);
          else if (unit.kind === "ammo") this.refillAmmo(1);
          this.beep(unit.kind === "moneyBag" ? 980 : 620, 0.08);
        }
      } else if (unit.kind === "shopkeeper" && distance(unit, this.player) <= unit.radius + 22) {
        this.openShop(unit.shopIndex ?? this.shopSpawnCursor);
        break;
      } else if (unit.kind === "enemyBullet" && unit.projectileType === "dynamite" && dynamiteContactIsDefusable(unit.age) && distance(unit, this.player) <= unit.radius + 20) {
        unit.hp = 0;
        this.showMessage("DYNAMITE DEFUSED");
      } else if ((unit.kind === "enemy" || unit.kind === "enemyBullet") && this.invulnerable > 0 && distance(unit, this.player) <= unit.radius + 20) {
        if (this.invulnerableDestroysEnemies && (unit.kind === "enemy" || unit.projectileType === "rock")) this.defeatTarget(unit);
        else if (unit.kind === "enemyBullet" && contactSourceShouldClear(unit.kind, unit.projectileType, unit.projectileType === "dynamite" && dynamiteContactIsDefusable(unit.age), unit.bossProjectile)) unit.hp = 0;
      } else if ((unit.kind === "enemy" || unit.kind === "boss" || unit.kind === "enemyBullet") && this.invulnerable <= 0 && distance(unit, this.player) <= unit.radius + 20) {
        const smartBombsBefore = this.smartBombs;
        this.takeHit();
        if (contactSourceShouldClear(unit.kind, unit.projectileType, unit.projectileType === "dynamite" && dynamiteContactIsDefusable(unit.age), unit.bossProjectile)) unit.hp = 0;
        if (this.smartBombs < smartBombsBefore) break;
        if (this.deathClock > 0) break;
      }
    }
  }

  private defeatTarget(target: Unit): void {
    target.hp = 0;
    if (target.kind !== "boss") this.score = addScore(this.score, target.value);
    if (target.kind === "enemyBullet" && target.projectileType === "rock") {
      target.hp = 1;
      target.exploding = true;
      target.targetY = target.y;
      target.maxAge = target.age + ROCK_IMPACT_LIFETIME;
      return;
    }
    if (target.kind === "barrel") {
      if (ROM_EMPTY_BARREL_ENTITY_CODES.includes(target.romEntityCode as 32 | 41)) {
        target.hp = 1;
        target.exploding = true;
        target.maxAge = target.age + EMPTY_BARREL_EXPLOSION_LIFETIME;
        target.sprite.color = [1, 0.55, 0.2, 1];
        target.sprite.size = { x: 54, y: 54 };
        return;
      }
      if (target.itemType) {
        this.spawnRomDrop("item", target.x, target.y, target.romEntityCode ?? 0, target.itemType);
      }
    } else if (target.kind === "enemy") {
      target.hp = 1;
      target.exploding = true;
      target.maxAge = target.age + ENEMY_DEFEAT_ANIMATION_DURATION;
      target.targetY = target.y;
      target.sprite.visible = true;
      if (target.romFlags !== undefined) {
        const hasSpecialStock = hasSpecialAmmoStock(this.weaponAmmo);
        const dropKind = romEnemyDrop(target.romFlags, hasSpecialStock);
        if (dropKind) {
          this.spawnRomDrop(dropKind, target.x, target.y, target.romEntityCode ?? 0);
        }
      } else {
        const drop = this.nextRandom();
        if (drop < 0.22) this.spawnUnit("moneyBag", target.x, target.y, 1);
        else if (this.ownedWeapons.size > 1 && drop < 0.38) this.spawnUnit("ammo", target.x, target.y, 1);
      }
    } else if (target.kind === "boss") {
      const finalWingate = this.stage === MAX_STAGE && this.wingatePhase > 0;
      target.hp = 1;
      target.exploding = true;
      target.sprite.color = [1, 0.78, 0.3, 1];
      target.sprite.size = { x: 138, y: 92 };
      target.maxAge = target.age + (finalWingate ? WINGATE_FINAL_DEFEAT_ANIMATION_DURATION : BOSS_DEFEAT_ANIMATION_DURATION);
      this.score = scoreBossDefeat(this.score, this.stage, this.wingatePhase);
      if (this.stage === MAX_STAGE && this.wingatePhase === 0) {
        this.wingatePhase = 1;
        this.wingateRespawnClock = WINGATE_SECOND_SPAWN_DELAY;
        this.clearEnemyProjectiles();
        this.clearBossProjectiles();
        this.showMessage("DECOY DOWN");
        return;
      }
      if (shouldClearProjectilesAfterBossDefeat(this.stage, this.wingatePhase)) {
        this.clearEnemyProjectiles();
        this.clearBossProjectiles();
      }
      this.bossSpawned = false;
      this.stageClearClock = finalWingate ? WINGATE_FINAL_ENDING_DELAY : 1.5;
      this.showMessage(this.stage === MAX_STAGE ? "TRAIL COMPLETE" : "BOSS DOWN");
      this.beep(110, 0.3);
    }
  }

  private isBossVulnerable(unit: Unit): boolean {
    if (unit.kind !== "boss") return true;
    if (unit.age < unit.invulnerableUntil) return false;
    if (this.stage === 1) return unit.age >= unit.invulnerableUntil;
    if (this.stage === 2 || this.stage === 3) return unit.fired;
    if (this.stage === 5) return unit.age >= unit.invulnerableUntil;
    return true;
  }

  private handleBossDamage(unit: Unit, previousHp: number): void {
    if (unit.kind !== "boss") return;
    const profile = bossHealthProfile(this.stage, this.wingatePhase);
    if (Math.ceil(previousHp / profile.hitPoints) === Math.ceil(unit.hp / profile.hitPoints)) return;
    unit.invulnerableUntil = Math.max(unit.invulnerableUntil, unit.age + BOSS_BAR_RECOVERY_DURATION);
    if (this.stage === 1) {
      unit.invulnerableUntil = unit.age + BANDIT_BILL_DAMAGE_RECOVERY_DURATION;
      this.showMessage("BANDIT BILL CRAWLS");
    } else if (this.stage === 4) {
      this.startNinjaBossTeleport(unit);
    }
  }

  private updateNinjaBossTeleport(delta: number): void {
    if (this.stage !== 4) return;
    const boss = this.units.find((unit) => unit.kind === "boss" && unit.hp > 0 && !unit.exploding);
    if (!boss || boss.bossNextTeleportAt === undefined || boss.age + delta < boss.bossNextTeleportAt) return;
    this.startNinjaBossTeleport(boss, boss.age + delta);
  }

  private startNinjaBossTeleport(unit: Unit, triggerAge = unit.age): void {
    const lane = NINJA_BOSS_ENTRY_LANES[ninjaBossEntryLaneIndex(this.randomState[0], Math.floor((this.player.y - this.scroll) / NES_WORLD_Y_SCALE))] ?? NINJA_BOSS_ENTRY_LANES[0]!;
    unit.bossCycleStart = triggerAge + NINJA_BOSS_TELEPORT_DELAY;
    unit.invulnerableUntil = unit.bossCycleStart + NINJA_BOSS_ENTRY_INVULNERABILITY;
    unit.bossNextTeleportAt = ninjaBossNextTeleportAt(unit.bossCycleStart);
    unit.x = lane[0];
    unit.bossEntryX = unit.x;
    unit.bossEntryY = lane[1];
    unit.sprite.visible = false;
    this.bossFireClock = NINJA_BOSS_TELEPORT_DELAY + NINJA_BOSS_FIRST_PREPARE_DELAY;
    this.showMessage("NINJA SMOKE");
  }

  private collectItem(item: ItemType): void {
    if (item === "boots" || item === "rifle") {
      const pickup = storedPowerupPickup(this.powerups[item]);
      this.powerups[item] = pickup.stock;
      this.score = addScore(this.score, pickup.score);
    } else if (item === "ammo") {
      this.refillAmmo(1);
    } else if (item === "money") {
      this.score = addScore(this.score, 200);
    } else if (item === "pow") {
      for (const target of [...this.units]) {
        if ((target.kind === "enemy" || target.kind === "enemyBullet" && target.projectileType === "rock") && target.hp > 0 && !target.exploding) this.defeatTarget(target);
      }
      this.clearEnemyProjectiles();
    } else if (item === "skull") {
      this.powerups.boots = Math.max(0, this.powerups.boots - 1);
      this.powerups.rifle = Math.max(0, this.powerups.rifle - 1);
    } else if (item === "horse") {
      this.hasHorse = true;
      this.horseHealth = 3;
    } else if (item === "blueYashichi") {
      this.invulnerable = Math.max(this.invulnerable, BLUE_YASHICHI_DURATION);
      this.invulnerableDestroysEnemies = true;
    } else if (item === "redYashichi") {
      const pickup = lifePickup(this.lives);
      this.lives = pickup.lives;
      this.score = addScore(this.score, pickup.score);
    }
    this.showMessage(item.replace(/([A-Z])/g, " $1").toUpperCase());
    this.updateHud();
  }

  private takeHit(): void {
    if (this.deathClock > 0) return;
    if (this.horseHealth > 0) {
      this.horseHealth -= 1;
      this.hasHorse = this.horseHealth > 0;
      this.invulnerable = HORSE_HIT_INVULNERABILITY;
      this.invulnerableDestroysEnemies = false;
      this.beep(170, 0.12);
      this.showMessage(this.hasHorse ? `HORSE ${this.horseHealth}` : "HORSE DOWN");
      this.updateHud();
      return;
    }
    if (this.smartBombArmed && this.smartBombs > 0) {
      this.smartBombs -= 1;
      this.smartBombArmed = false;
      for (const unit of [...this.units]) {
        if (unit.hp <= 0 || unit.exploding) continue;
        if (unit.kind === "enemy" || unit.kind === "enemyBullet" && unit.projectileType === "rock") this.defeatTarget(unit);
      }
      this.clearEnemyProjectiles();
      this.beep(75, 0.35);
      this.showMessage("SMART BOMB");
      this.updateInventory();
      this.updateHud();
      return;
    }
    this.deathClock = Number.EPSILON;
    this.deathCommitted = false;
    this.beep(120, 0.16);
    this.showMessage("HIT!");
  }

  private updateDeath(delta: number): boolean {
    if (this.deathClock <= 0) return false;
    this.deathClock += delta;
    const phase = playerDeathPhase(this.deathClock);
    this.player.sprite.visible = phase === "dying" ? Math.floor(this.deathClock * NES_FRAME_RATE / 8) % 2 === 0 : phase === "ready";
    this.player.sprite.rotation = phase === "dying" ? this.deathClock * 10 : 0;
    this.horseSprite.visible = false;
    if (!this.deathCommitted && this.deathClock >= PLAYER_DEATH_ANIMATION_DURATION) this.commitDeath();
    if (this.mode !== "playing") return true;
    if (this.deathClock < PLAYER_DEATH_RECOVERY_DURATION) {
      this.updateHud();
      return true;
    }
    this.deathClock = 0;
    this.deathCommitted = false;
    this.player.sprite.visible = true;
    this.player.sprite.rotation = 0;
    return true;
  }

  private commitDeath(): void {
    this.deathCommitted = true;
    this.lives -= 1;
    this.powerups.boots = Math.max(0, this.powerups.boots - 1);
    this.powerups.rifle = Math.max(0, this.powerups.rifle - 1);
    if (this.weapon !== "pistol") {
      this.weaponAmmo[this.weapon] = 0;
      this.ownedWeapons.delete(this.weapon);
      this.weapon = "pistol";
    }
    this.clearEnemyUnits();
    this.clearEnemyProjectiles();
    this.romEnemyFineX.fill(0);
    this.romEnemyFineY.fill(0);
    this.units.splice(0, this.units.length, ...this.units.filter((unit) => unit.hp > 0));
    if (this.lives <= 0) {
      this.showMessage("OUT OF LIVES");
      this.finish(false);
    }
  }

  private clearEnemyUnits(): void {
    for (const unit of this.units) if (unit.kind === "enemy" || (unit.kind === "enemyBullet" && unit.projectileType === "rock")) unit.hp = 0;
  }

  private clearEnemyProjectiles(): void {
    for (const unit of this.units) if (unit.kind === "enemyBullet" && unit.projectileType !== "rock" && !unit.bossProjectile) unit.hp = 0;
  }

  private clearBossProjectiles(): void {
    for (const unit of this.units) if (unit.kind === "enemyBullet" && unit.bossProjectile) unit.hp = 0;
  }

  private beginNextStage(): void {
    if (this.stage >= MAX_STAGE) {
      this.finish(true);
      return;
    }
    this.stage += 1;
    this.scroll = 0;
    this.bossFireClock = 1;
    this.bossSpawned = false;
    this.hasWanted = false;
    this.wingatePhase = 0;
    this.wingateRespawnClock = 0;
    this.deathClock = 0;
    this.deathCommitted = false;
    this.romObjectCursor = 0;
    this.romEventCursor = 0;
    this.shopIndex = 0;
    this.shopSpawnCursor = 0;
    this.hasHorse = false;
    this.horseHealth = 0;
    this.horseSprite.visible = false;
    this.units.length = 0;
    this.romEnemyFineX.fill(0);
    this.romEnemyFineY.fill(0);
    this.buildBackground();
    this.player.x = PLAYER_ENTRY_X;
    this.player.y = PLAYER_ENTRY_Y;
    this.showMessage(`STAGE ${this.stage}`);
    this.showBriefing();
  }

  private loopStage(): void {
    this.scroll = 0;
    this.camera.position.y = 270;
    this.player.x = PLAYER_ENTRY_X;
    this.player.y = PLAYER_ENTRY_Y;
    this.player.sprite.position = { x: this.player.x, y: this.player.y };
    this.wingateRespawnClock = 0;
    this.romObjectCursor = 0;
    this.romEventCursor = 0;
    this.shopIndex = 0;
    this.shopSpawnCursor = 0;
    this.units.length = 0;
    this.romEnemyFineX.fill(0);
    this.romEnemyFineY.fill(0);
    if (this.stage === 2) {
      const horseBarrel = this.spawnUnit("barrel", ROUND2_LOOP_HORSE_X, ROUND2_LOOP_HORSE_Y, romEntityHitPoints(37), undefined, "horse");
      horseBarrel.romEntityCode = 37;
      horseBarrel.romFlags = 0;
      horseBarrel.romPool = "object";
    }
    this.showMessage("SEARCH AGAIN");
  }

  private finish(won: boolean): void {
    this.stopMusic();
    this.engine.stop();
    hud.hidden = true;
    pauseScreen.hidden = true;
    inventoryScreen.hidden = true;
    briefingScreen.hidden = true;
    if (won) {
      this.mode = "ending";
      this.endingReady = false;
      endingButton.disabled = true;
      if (this.endingReadyTimer !== undefined) window.clearTimeout(this.endingReadyTimer);
      this.endingReadyTimer = window.setTimeout(() => {
        this.endingReady = true;
        this.stopMusic();
        endingButton.disabled = false;
        endingButton.focus();
        this.pollPausedGamepad();
      }, WINGATE_ENDING_INPUT_DELAY * 1_000);
      endingScreen.hidden = false;
      gameOver.hidden = true;
      this.musicStep = 0;
      this.startMusic();
    } else {
      this.mode = "gameover";
      gameOver.hidden = false;
      endingScreen.hidden = true;
      gameOver.querySelector("h2")!.textContent = "WANTED: ALIVE";
      finalScore.textContent = `SCORE ${String(this.score).padStart(6, "0")}`;
      this.inventoryLatch = false;
      gameOverContinueButton.focus();
      this.pollPausedGamepad();
    }
  }

  exitEnding(): void {
    if (this.mode === "ending" && this.endingReady) window.location.reload();
  }

  private updateHud(): void {
    const definition = STAGES[this.stage - 1] ?? STAGES[0]!;
    stageLabel.textContent = `ROUND ${this.stage} ${definition.name}`;
    scoreLabel.textContent = `SCORE ${String(this.score).padStart(6, "0")}`;
    livesLabel.textContent = `LIVES ${this.lives}`;
    const ammo = Number.isFinite(WEAPONS[this.weapon].maxAmmo) ? ` ${this.ammo}` : "";
    weaponLabel.textContent = `${this.weapon.toUpperCase()}${ammo} / BOMB ${this.smartBombs}${this.smartBombArmed ? " ARMED" : ""} / BOOTS ${this.powerups.boots} / RIFLE ${this.powerups.rifle}${this.hasHorse ? ` / HORSE ${this.horseHealth}` : ""} / WANTED ${this.hasWanted ? "YES" : "NO"}`;
    const boss = this.units.find((unit) => unit.kind === "boss" && unit.hp > 0 && !unit.exploding);
    bossLabel.hidden = !boss;
    if (boss) {
      const name = this.stage === MAX_STAGE && this.wingatePhase > 0 ? "WINGATE II" : definition.boss;
      const bars = Math.max(1, Math.ceil(boss.hp / bossHealthProfile(this.stage, this.wingatePhase).hitPoints));
      bossLabel.textContent = `${name} ${"|".repeat(bars)}`;
    }
  }

  private showMessage(text: string): void {
    messageLabel.textContent = text;
    window.setTimeout(() => {
      if (messageLabel.textContent === text) messageLabel.textContent = "";
    }, 1_200);
  }

  private beep(frequency: number, duration: number): void {
    if (!this.audio) return;
    const oscillator = this.audio.context.createOscillator();
    const gain = this.audio.context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, this.audio.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audio.context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(this.audio.getBus("sfx")?.gain ?? this.audio.context.destination);
    oscillator.start();
    oscillator.stop(this.audio.context.currentTime + duration);
  }

  private startMusic(): void {
    if (this.musicTimer !== undefined || !this.audio) return;
    this.musicTimer = window.setInterval(() => this.playMusicStep(), 180);
  }

  private playMusicStep(): void {
    if (!this.audio || this.audio.context.state !== "running") return;
    const endingPattern = [262, 330, 392, 523, 392, 440, 523, 659, 523, 392, 349, 440, 523, 698, 659, 523] as const;
    const roundPatterns: readonly number[][] = [
      [262, 330, 392, 330, 294, 349, 440, 349],
      [196, 247, 294, 247, 220, 277, 330, 277],
      [220, 277, 330, 277, 247, 311, 370, 311],
      [175, 220, 262, 220, 196, 247, 294, 247],
      [233, 294, 349, 294, 262, 330, 392, 330],
      [147, 185, 220, 185, 165, 208, 247, 208],
    ];
    const pattern = this.mode === "ending" ? endingPattern : roundPatterns[(this.stage - 1) % roundPatterns.length] ?? roundPatterns[0]!;
    const oscillator = this.audio.context.createOscillator();
    const gain = this.audio.context.createGain();
    oscillator.type = this.bossSpawned ? "sawtooth" : "square";
    oscillator.frequency.value = pattern[this.musicStep % pattern.length] ?? 220;
    const now = this.audio.context.currentTime;
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    oscillator.connect(gain);
    gain.connect(this.audio.getBus("music")?.gain ?? this.audio.context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
    this.musicStep += 1;
  }

  private stopMusic(): void {
    if (this.musicTimer !== undefined) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = undefined;
    }
  }

  private nextRandom(): number {
    const value = this.randomState[this.randomReadIndex] ?? this.randomState[0];
    this.randomReadIndex = (this.randomReadIndex + 1) % this.randomState.length;
    return value / 256;
  }

  private nextRomRandomSumByte(): number {
    this.randomState = mixRomRandomSum(this.randomState);
    return this.randomState[1]!;
  }

  private nextRomRandomFirstSumByte(): number {
    this.randomState = mixRomRandomFirstSum(this.randomState);
    return this.randomState[0]!;
  }

  private nextRomRandomSecondSumByte(): number {
    this.randomState = mixRomRandomSecondSum(this.randomState);
    return this.randomState[2]!;
  }

  private nextRomRandomThirdFirstSumByte(): number {
    this.randomState = mixRomRandomThirdFirstSum(this.randomState);
    return this.randomState[2]!;
  }

  private nextRomRandomSecondThirdSumByte(): number {
    this.randomState = mixRomRandomSecondThirdSum(this.randomState);
    return this.randomState[1]!;
  }

  private nextRomRandomDifferenceByte(): number {
    this.randomState = mixRomRandomDifference(this.randomState);
    return this.randomState[0]!;
  }

  private nextRomSpawnSeedByte(): number {
    this.randomState = mixRomRandomSpawn(this.randomState);
    return this.randomState[0]!;
  }

  private resetRandom(): void {
    this.randomState = [...ROM_RANDOM_SEED];
    this.randomReadIndex = 0;
    this.randomFrameRemainder = 0;
  }

  private advanceRandom(delta: number): void {
    this.randomFrameRemainder += delta * NES_FRAME_RATE;
    while (this.randomFrameRemainder >= 1) {
      this.randomState = advanceRomRandom(this.randomState);
      this.randomFrameRemainder -= 1;
    }
    this.randomReadIndex = 0;
  }

  private dispose(): void {
    this.stopMusic();
    if (this.endingReadyTimer !== undefined) window.clearTimeout(this.endingReadyTimer);
    if (this.pausePollHandle !== undefined) window.cancelAnimationFrame(this.pausePollHandle);
    this.audio?.dispose();
    const textures = new Set<GPUTexture>([
      ...Object.values(this.textures),
      ...Object.values(this.itemTextures),
      ...Object.values(this.enemyTextures),
      ...this.bossTextures,
      ...this.terrainTextures,
      ...this.roadTextures,
      ...this.mapTextures,
    ]);
    for (const texture of textures) texture.destroy();
  }

  private pollPausedGamepad(): void {
    if (this.pausePollHandle !== undefined) return;
    const poll = (): void => {
      this.pausePollHandle = undefined;
      if (this.mode !== "paused" && this.mode !== "briefing" && this.mode !== "gameover" && this.mode !== "ending") return;
      this.engine.input?.pollGamepads();
      if (this.mode === "gameover") {
        const selectActive = this.actions.active("inventory");
        if (!selectActive) this.inventoryLatch = false;
        else if (!this.inventoryLatch) {
          this.inventoryLatch = true;
          this.toggleGameOverChoice();
        }
      }
      const active = this.actions.active("start");
      if (!active) this.startLatch = false;
      else if (!this.startLatch) {
        this.startLatch = true;
        this.activateStart();
        return;
      }
      this.pausePollHandle = window.requestAnimationFrame(poll);
    };
    this.pausePollHandle = window.requestAnimationFrame(poll);
  }

  private activateStart(): void {
    if (this.mode === "title") this.start();
    else if (this.mode === "intro") this.continueFromIntro();
    else if (this.mode === "briefing") this.continueFromBriefing();
    else if (this.mode === "gameover") this.confirmGameOver();
    else if (this.mode === "ending") this.exitEnding();
    else if (this.mode === "playing" || this.mode === "paused") this.togglePause();
  }

  private createAudio(): AudioManager | undefined {
    try {
      return new AudioManager();
    } catch {
      return undefined;
    }
  }

  destroy(): void {
    this.engine.destroy();
  }
}

class ReferenceRomGame {
  readonly engine: Engine;
  readonly renderer: Renderer2D;
  readonly camera = new Camera2D({ position: { x: 128, y: 120 }, viewportWidth: 256, viewportHeight: 240 });
  readonly texture: GPUTexture;
  readonly sampler: GPUSampler;
  readonly sprite: Sprite;
  readonly nes: import("jsnes").NES;
  readonly buttons: typeof import("jsnes").Controller;
  readonly audio: AudioManager | undefined;
  readonly pcm: PcmStream | undefined;
  readonly metadata: { mapper: number; prgBytes: number; chrBytes: number; sampleRate: number };
  private readonly frameRef: { value: Uint32Array | undefined };
  private readonly rgba = new Uint8Array(256 * 240 * 4);
  private accumulator = 0;
  private frameCount = 0;
  private readonly held = new Set<number>();

  private constructor(engine: Engine, nes: import("jsnes").NES, buttons: typeof import("jsnes").Controller, frameRef: { value: Uint32Array | undefined }, audio: AudioManager | undefined, pcm: PcmStream | undefined, metadata: { mapper: number; prgBytes: number; chrBytes: number; sampleRate: number }) {
    this.engine = engine;
    this.nes = nes;
    this.buttons = buttons;
    this.frameRef = frameRef;
    this.audio = audio;
    this.pcm = pcm;
    this.metadata = metadata;
    this.renderer = new Renderer2D(engine.gpu, { clearColor: { r: 0, g: 0, b: 0, a: 1 } });
    this.sampler = engine.gpu.device.createSampler({ magFilter: "nearest", minFilter: "nearest" });
    this.texture = engine.gpu.device.createTexture({
      label: "gun-smoke-reference-frame",
      size: { width: 256, height: 240, depthOrArrayLayers: 1 },
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    this.sprite = new Sprite({ texture: this.texture, sampler: this.sampler, position: { x: 128, y: 120 }, size: { x: 256, y: 240 }, anchor: { x: 0.5, y: 0.5 }, layer: 0 });
    this.engine.input?.onInput((event) => this.onInput(event));
    this.engine.on("resize", ({ width, height }) => this.fitViewport(width, height));
    this.fitViewport(engine.viewport.width, engine.viewport.height);
    this.engine.addSystem({ update: (delta) => this.update(delta), render: () => this.render(), dispose: () => this.dispose() });
  }

  static async create(data: ArrayBuffer): Promise<ReferenceRomGame> {
    const { Controller, NES } = await import("jsnes");
    const bytes = new Uint8Array(data);
    if (bytes.length < 16 || bytes[0] !== 0x4e || bytes[1] !== 0x45 || bytes[2] !== 0x53 || bytes[3] !== 0x1a) {
      throw new Error("Expected an iNES .NES file");
    }
    const flags6 = bytes[6] ?? 0;
    const flags7 = bytes[7] ?? 0;
    const trainerBytes = flags6 & 0x04 ? 512 : 0;
    const metadata = {
      mapper: (flags6 >> 4) | (flags7 & 0xf0),
      prgBytes: (bytes[4] ?? 0) * 16 * 1024,
      chrBytes: (bytes[5] ?? 0) * 8 * 1024,
      sampleRate: 48_000,
    };
    if (bytes.length < 16 + trainerBytes + metadata.prgBytes + metadata.chrBytes) {
      throw new Error("Truncated iNES ROM data");
    }
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    const frame: { value: Uint32Array | undefined } = { value: undefined };
    let audio: AudioManager | undefined;
    try {
      audio = new AudioManager();
    } catch {
      audio = undefined;
    }
    let pcm: PcmStream | undefined;
    try {
      pcm = audio?.createPcmStream({ bus: "music" });
    } catch {
      audio?.dispose();
      audio = undefined;
    }
    metadata.sampleRate = audio?.context.sampleRate ?? 48_000;
    const nes = new NES({ sampleRate: metadata.sampleRate, onFrame: (nextFrame) => { frame.value = nextFrame; }, onAudioSample: (left, right) => pcm?.push(left, right) });
    try {
      nes.loadROM(binary);
    } catch (error) {
      pcm?.stop();
      audio?.dispose();
      throw error;
    }
    let engine: Engine | undefined;
    try {
      engine = await Engine.create({ canvas, autoStart: false, input: true, fixedDelta: 1 / NES_FRAME_RATE });
      return new ReferenceRomGame(engine, nes, Controller, frame, audio, pcm, metadata);
    } catch (error) {
      engine?.destroy();
      pcm?.stop();
      audio?.dispose();
      throw error;
    }
  }

  start(): void {
    void this.audio?.unlock();
    canvas.focus();
    this.engine.start();
  }

  destroy(): void {
    if (this.engine.status !== "destroyed") this.engine.destroy();
  }

  private update(delta: number): void {
    this.accumulator += Math.min(delta, 0.25);
    while (this.accumulator >= 1 / NES_FRAME_RATE) {
      this.pollGamepad();
      this.nes.frame();
      this.frameCount += 1;
      this.accumulator -= 1 / NES_FRAME_RATE;
    }
    const frame = this.frameRef.value;
    if (!frame) return;
    for (let index = 0; index < frame.length; index += 1) {
      const value = frame[index] ?? 0;
      const offset = index * 4;
      this.rgba[offset] = (value >> 16) & 0xff;
      this.rgba[offset + 1] = (value >> 8) & 0xff;
      this.rgba[offset + 2] = value & 0xff;
      this.rgba[offset + 3] = 255;
    }
    this.engine.gpu.device.queue.writeTexture({ texture: this.texture }, this.rgba, { bytesPerRow: 256 * 4 }, { width: 256, height: 240, depthOrArrayLayers: 1 });
  }

  private render(): void {
    this.renderer.render([this.sprite], this.camera);
  }

  private fitViewport(width: number, height: number): void {
    const scale = Math.min(width / 256, height / 240);
    const worldWidth = width / scale;
    const worldHeight = height / scale;
    this.camera.setViewport(worldWidth, worldHeight);
    this.camera.position = { x: worldWidth / 2, y: worldHeight / 2 };
    this.sprite.position = { x: worldWidth / 2, y: worldHeight / 2 };
    canvas.dataset.referenceViewport = `${worldWidth.toFixed(3)}x${worldHeight.toFixed(3)}`;
    canvas.dataset.referenceScale = scale.toFixed(3);
  }

  private onInput(event: NormalizedInputEvent): void {
    if (event.kind !== "keyboard") return;
    const button = this.keyButton(event.code);
    if (button === undefined) return;
    event.preventDefault();
    const pressed = event.type === "keydown";
    if (pressed) {
      if (this.held.has(button)) return;
      this.held.add(button);
      this.nes.buttonDown(1, button);
    } else {
      this.held.delete(button);
      this.nes.buttonUp(1, button);
    }
  }

  private pollGamepad(): void {
    const pad = navigator.getGamepads?.()[0];
    if (!pad) return;
    const pressed = (button: ButtonKey, active: boolean): void => {
      if (active && !this.held.has(button)) {
        this.held.add(button);
        this.nes.buttonDown(1, button);
      } else if (!active && this.held.has(button)) {
        this.held.delete(button);
        this.nes.buttonUp(1, button);
      }
    };
    pressed(this.buttons.BUTTON_UP, (pad.axes[1] ?? 0) < -0.45 || Boolean(pad.buttons[this.buttons.BUTTON_UP]?.pressed));
    pressed(this.buttons.BUTTON_DOWN, (pad.axes[1] ?? 0) > 0.45 || Boolean(pad.buttons[this.buttons.BUTTON_DOWN]?.pressed));
    pressed(this.buttons.BUTTON_LEFT, (pad.axes[0] ?? 0) < -0.45 || Boolean(pad.buttons[this.buttons.BUTTON_LEFT]?.pressed));
    pressed(this.buttons.BUTTON_RIGHT, (pad.axes[0] ?? 0) > 0.45 || Boolean(pad.buttons[this.buttons.BUTTON_RIGHT]?.pressed));
    pressed(this.buttons.BUTTON_A, Boolean(pad.buttons[0]?.pressed));
    pressed(this.buttons.BUTTON_B, Boolean(pad.buttons[1]?.pressed));
    pressed(this.buttons.BUTTON_START, Boolean(pad.buttons[9]?.pressed));
    pressed(this.buttons.BUTTON_SELECT, Boolean(pad.buttons[8]?.pressed));
  }

  private keyButton(code: string): ButtonKey | undefined {
    const map: Record<string, ButtonKey> = {
      ArrowUp: this.buttons.BUTTON_UP,
      ArrowDown: this.buttons.BUTTON_DOWN,
      ArrowLeft: this.buttons.BUTTON_LEFT,
      ArrowRight: this.buttons.BUTTON_RIGHT,
      KeyZ: this.buttons.BUTTON_B,
      KeyX: this.buttons.BUTTON_A,
      Enter: this.buttons.BUTTON_START,
      NumpadEnter: this.buttons.BUTTON_START,
      Tab: this.buttons.BUTTON_SELECT,
      ShiftLeft: this.buttons.BUTTON_SELECT,
      ShiftRight: this.buttons.BUTTON_SELECT,
    };
    return map[code];
  }

  private dispose(): void {
    this.held.clear();
    this.texture.destroy();
    this.pcm?.stop();
    this.audio?.dispose();
  }
}

let game: GunSmokeGame | undefined;
let referenceGame: ReferenceRomGame | undefined;
if (import.meta.env.DEV) Object.defineProperty(window, "__setGunSmokeInvulnerable", { value: (duration: number) => { if (game) game.invulnerable = duration; } });
if (import.meta.env.DEV) Object.defineProperty(window, "__showGunSmokeGameOver", { value: () => { if (game) (game as unknown as { finish(won: boolean): void }).finish(false); } });
if (import.meta.env.DEV) Object.defineProperty(window, "__forceGunSmokeBoss", { value: () => {
  if (!game) return;
  game.hasWanted = true;
  game.scroll = ROUND_BOSS_TRIGGERS[game.stage - 1] ?? ROUND_BOSS_TRIGGERS[0]!;
  (game as unknown as { updateSpawns(): void }).updateSpawns();
} });
if (import.meta.env.DEV) Object.defineProperty(window, "__defeatGunSmokeBoss", { value: () => {
  const boss = game?.units.find((unit) => unit.kind === "boss" && unit.hp > 0 && !unit.exploding);
  if (game && boss) (game as unknown as { defeatTarget(target: unknown): void }).defeatTarget(boss);
} });
if (import.meta.env.DEV) Object.defineProperty(window, "__setGunSmokeRound", { value: (stage: number) => {
  if (!game || !Number.isInteger(stage) || stage < 1 || stage > MAX_STAGE) return;
  game.stage = stage;
  game.scroll = 0;
  game.camera.position.y = 270;
  game.units.length = 0;
  game.bossSpawned = false;
  game.romEventCursor = 0;
  game.romObjectCursor = 0;
  game.shopIndex = 0;
  game.shopSpawnCursor = 0;
  game.hasWanted = false;
  game.wingatePhase = 0;
  game.wingateRespawnClock = 0;
  game.player.x = PLAYER_ENTRY_X;
  game.player.y = PLAYER_ENTRY_Y;
  game.player.sprite.position = { x: game.player.x, y: game.player.y };
  const internal = game as unknown as { buildBackground(): void; updateHud(): void };
  internal.buildBackground();
  internal.updateHud();
} });
startButton.addEventListener("click", () => void game?.start());
continueButton.addEventListener("click", () => game?.continueFromIntro());
briefingButton.addEventListener("click", () => game?.continueFromBriefing());
gameOverContinueButton.addEventListener("click", () => game?.continueGame());
restartButton.addEventListener("click", () => window.location.reload());
endingButton.addEventListener("click", () => game?.exitEnding());
resumeButton.addEventListener("click", () => game?.togglePause());
inventoryClose.addEventListener("click", () => game?.toggleInventory());
for (const button of inventoryWeaponButtons) {
  button.addEventListener("click", () => game?.equipWeapon(button.dataset.inventoryWeapon as WeaponName));
}
shopClose.addEventListener("click", () => game?.closeShop());
smartBombButton.addEventListener("click", () => game?.toggleSmartBomb());
for (const item of shopItems) item.addEventListener("click", () => game?.buyShopItem(item.dataset.shopItem ?? ""));
referenceRomInput.addEventListener("change", () => void loadReferenceRom());
window.addEventListener("keydown", (event) => {
  if (game?.mode === "gameover" && (event.code === "Tab" || event.code === "ShiftLeft" || event.code === "ShiftRight")) {
    event.preventDefault();
    if (!event.repeat) game.toggleGameOverChoice();
    return;
  }
  if (event.code === "KeyP" || event.code === "Escape") {
    game?.togglePause();
    return;
  }
  if (event.code !== "Enter" && event.code !== "NumpadEnter") return;
  if (game?.mode === "title") game.start();
  else if (game?.mode === "intro") game.continueFromIntro();
  else if (game?.mode === "briefing") game.continueFromBriefing();
  else if (game?.mode === "playing" || game?.mode === "paused") game.togglePause();
  else if (game?.mode === "gameover") game.confirmGameOver();
  else if (game?.mode === "ending") game.exitEnding();
});
try {
  game = await GunSmokeGame.create();
  startButton.disabled = false;
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error);
  messageLabel.textContent = `WEBGPU UNAVAILABLE: ${reason}`;
}

async function loadReferenceRom(): Promise<void> {
  const file = referenceRomInput.files?.[0];
  if (!file) return;
  referenceRomInput.disabled = true;
  romStatus.textContent = `Loading ${file.name}...`;
  try {
    const nextReferenceGame = await ReferenceRomGame.create(await file.arrayBuffer());
    referenceGame?.destroy();
    game?.destroy();
    game = undefined;
    referenceGame = nextReferenceGame;
    titleScreen.hidden = true;
    introScreen.hidden = true;
    briefingScreen.hidden = true;
    gameOver.hidden = true;
    endingScreen.hidden = true;
    pauseScreen.hidden = true;
    inventoryScreen.hidden = true;
    hud.hidden = true;
    shop.hidden = true;
    referenceGame.start();
    romStatus.textContent = `Reference ROM active: ${file.name} / Mapper ${referenceGame.metadata.mapper} / ${referenceGame.metadata.prgBytes / 1024} KiB PRG / ${referenceGame.metadata.sampleRate} Hz`;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    romStatus.textContent = `Could not load ROM: ${reason}`;
    referenceRomInput.disabled = false;
  }
}
