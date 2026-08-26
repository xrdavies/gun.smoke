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
import "./style.css";
import type { ButtonKey } from "jsnes";
import { AMMO_GAIN, banditBillOpeningY, backstabberRaidOffset, BACKSTABBER_AMBUSH_DEPTH, BACKSTABBER_AMBUSH_DROP_SPEED, BACKSTABBER_AMBUSH_LIFETIME, BACKSTABBER_RAID_LIFETIME, BANDIT_BILL_ENTRY_X_LANES, BANDIT_BILL_ENTRY_Y, BOMBER_FIRST_THROW_DELAY, BOMBER_THROW_INTERVAL, bossReward, BOOTS_SPEED_MULTIPLIER, clamp, CUTTER_ENTRY_X_LANES, CUTTER_ENTRY_Y, DEVIL_HAWK_ENTRY_X_LANES, DEVIL_HAWK_ENTRY_Y, distance, DYNAMITE_AIM_FACTOR, DYNAMITE_AIRBORNE_DURATION, DYNAMITE_LIFETIME, DYNAMITE_WORLD_SPEED, FATMAN_JOE_ENTRY_DURATION, FATMAN_JOE_ENTRY_X, FATMAN_JOE_ENTRY_Y, fatmanJoeOpeningY, FIREBREATHER_FIRST_SHOT_DELAY, FIREBREATHER_PROJECTILE_SPEED, formationEntryY, HATCHET_FIRST_SHOT_DELAY, HATCHET_PROJECTILE_SPEED, MAGNUM_BULLET_LIFETIME, MAGNUM_BULLET_SPEED, MAX_STAGE, NES_FRAME_RATE, NINJA_BOSS_ENTRY_X_LANES, NINJA_BOSS_ENTRY_Y_LANES, NINJA_FIRST_SHOT_DELAY, NINJA_PROJECTILE_SPEED, PISTOL_BULLET_LIFETIME, RIFLE_BULLET_SPEED_MULTIPLIER, RIFLEMAN_BULLET_SPEED, RIFLEMAN_FIRST_SHOT_DELAY, RIFLEMAN_SHOT_INTERVAL, RIFLEMAN_SHOTS_PER_VOLLEY, ROCK_IMPACT_DELAY, ROCK_LIFETIME, ROCK_WORLD_SPEED_X, ROCK_WORLD_SPEED_Y, ROAD_WIDTHS, ROM_OBJECT_DROP_SPEED, ROUND_BOSS_TRIGGERS, ROUND_LENGTHS, ROUND_OBSTACLES, ROUND_SEGMENTS, segmentDelay, SHOTGUNNER_FIRST_VOLLEY_DELAY, SHOTGUNNER_LIFETIME, SHOTGUNNER_VOLLEY_INTERVAL, shouldLoopStage, SHOP_CHECKPOINTS, SHOP_COSTS, SHOP_TYPES, SHOP_X_OFFSETS, SMART_BOMB_CAPACITY, SNIPER_LIFETIME, SNIPER_SHOT_FRAMES, SPEAR_FIRST_SHOT_DELAY, SPEAR_PROJECTILE_SPEED, scoreExtraLives, spendPoints, STAGES, unitMaxAge, WEAPONS, WANTED_COSTS, WINGATE_ENTRY_DURATION, WINGATE_ENTRY_X, WINGATE_ENTRY_Y, WINGATE_SECOND_ENTRY_X, WINGATE_SECOND_ENTRY_Y, WINGATE_SECOND_SPAWN_DELAY, wingateOpeningY, WORLD_BULLET_SPEED, WORLD_DIAGONAL_BULLET_X, WORLD_DIAGONAL_BULLET_Y, WORLD_PLAYER_SPEED, WORLD_SCROLL_SPEED, type EnemyType, type Formation, type ItemType, type LandmarkType, type ShopType, type WeaponName } from "./game-constants";
import { GUNMAN_BULLET_SPEED, GUNMAN_FIRST_SHOT_DELAY, GUNMAN_LIFETIME } from "./game-constants";
import { RIFLEMAN_ATTACK_STATE_FRAME } from "./game-constants";
import { BANDIT_BILL_BULLET_SPEED, BANDIT_BILL_FIRST_VOLLEY_DELAY } from "./game-constants";
import { banditBillCooldown } from "./game-constants";
import { BLUE_YASHICHI_DURATION, MAX_LIVES } from "./game-constants";
import { pistolShots } from "./game-constants";
import { storedPowerupPickup } from "./game-constants";
import { FATMAN_JOE_FIRST_VOLLEY_DELAY, FATMAN_JOE_MOVEMENT_SPEED, FATMAN_JOE_VOLLEY_INTERVAL, FATMAN_JOE_VOLLEY_SIZE, fatmanJoeCombatY } from "./game-constants";
import { WINGATE_BULLET_SPEED, WINGATE_ENTRY_RUSH_DURATION, WINGATE_ENTRY_RUSH_SPEED, WINGATE_FIRST_SHOT_DELAY, WINGATE_MOVEMENT_SPEED, WINGATE_SECOND_FIRST_SHOT_DELAY, wingateShotCooldown } from "./game-constants";
import { CUTTER_ATTACK_INTERVAL, CUTTER_BOOMERANG_SPEED, CUTTER_FIRST_ATTACK_DELAY } from "./game-constants";
import { CUTTER_ENTRY_DURATION, CUTTER_MOVEMENT_SPEED, cutterOpeningY } from "./game-constants";
import { DEVIL_HAWK_ENTRY_DURATION, DEVIL_HAWK_FIREBALL_SPEED, DEVIL_HAWK_FIRST_VOLLEY_DELAY, DEVIL_HAWK_POST_ENTRY_X_HOLD, DEVIL_HAWK_VOLLEY_INTERVAL, devilHawkCombatY, devilHawkOpeningY } from "./game-constants";
import { NINJA_BOSS_ATTACK_INTERVAL, NINJA_BOSS_ENTRY_INVULNERABILITY, NINJA_BOSS_FIRST_ATTACK_DELAY, NINJA_BOSS_SHURIKEN_COUNT, NINJA_BOSS_SHURIKEN_SPEED } from "./game-constants";
import { roundCollisionBlocks } from "./round-collision";
import { canSpawnRomPool, ROM_BREAKABLE_CONTAINER_DISPATCH_TYPES, ROM_NON_ENEMY_OBJECT_BEHAVIORS, ROM_OBJECT_PICKUPS, ROM_SCENE_PROP_DISPATCH_TYPES, ROUND_ROM_ENEMY_EVENTS, ROUND_ROM_OBJECT_EVENTS, ROM_BEHAVIOR_ENEMY_TYPES, romEventWorldAt, romEventWorldX, romEventWorldY, romObjectWorldAt, romObjectWorldX, romObjectWorldY } from "./rom-event-data";

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
type UnitKind = "enemy" | "boss" | "bullet" | "enemyBullet" | "moneyBag" | "ammo" | "barrel" | "item" | "wanted" | "shopkeeper" | "sceneObject";
type ProjectileType = "bullet" | "dynamite" | "grenade" | "boomerang" | "fireball" | "shuriken" | "spear" | "hatchet" | "rock";
type TextureName = "player" | "horse" | "shopkeeper" | "bullet" | "moneyBag" | "ammo" | "barrel" | "wanted" | "terrain" | "road" | "landmark";
type Rgba = [number, number, number, number];

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
  romFlags?: number;
  romPool?: "enemy" | "object";
  romOriginX?: number;
  romOriginY?: number;
  bossEntryX?: number;
  bossEntryY?: number;
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

function formationOffsets(formation: Formation): readonly number[] {
  if (formation === "wedge") return [-2, -1, 1, 2];
  if (formation === "cross") return [-2, 0, 2];
  if (formation === "rear") return [-1, 0, 1];
  return [-1, 0, 1];
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
  audio: AudioManager | undefined;
  mode: GameMode = "title";
  scroll = 0;
  stage = 1;
  score = 0;
  nextLifeScore = 30_000;
  lives = 3;
  weaponAmmo: Record<WeaponName, number> = { pistol: Number.POSITIVE_INFINITY, shotgun: 0, machinegun: 0, magnum: 0 };
  ownedWeapons = new Set<WeaponName>(["pistol"]);
  smartBombs = 0;
  smartBombArmed = false;
  powerups = { boots: 0, rifle: 0 };
  time = 0;
  spawnClock = 0.6;
  fireClock = 0;
  fireMask = 0;
  bombLatch = false;
  startLatch = false;
  pausePollHandle: number | undefined;
  inventoryLatch = false;
  inventoryOpen = false;
  inventoryWeaponIndex = 0;
  inventoryDirectionLatch = 0;
  enemyFireClock = 1.2;
  bossFireClock = 1;
  invulnerable = 0;
  bossSpawned = false;
  stageClearClock = 0;
  hasWanted = false;
  posterPropSpawned = false;
  romEventCursor = 0;
  romObjectCursor = 0;
  readonly romEventMode = true;
  stageLoopCount = 0;
  currentLandmark: LandmarkType = "town";
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
  randomState = 0x6d2b79f5;
  player = { entity: 0, x: 480, y: 410, sprite: undefined as unknown as Sprite };
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
      wanted: pixelTexture(engine, ["wwwwww", "wkkkkw", "wkrrkw", "wkkkkw", "wkookw", "wwwwww"], palette),
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
    }
    this.player.entity = this.world.createEntity();
    this.horseSprite = new Sprite({ texture: this.textures.horse, sampler: this.sampler, position: { x: 480, y: 426 }, size: { x: 64, y: 54 }, anchor: { x: 0.5, y: 0.5 }, layer: 19, visible: false });
    this.player.sprite = new Sprite({ texture: this.textures.player, sampler: this.sampler, frame: { x: 0, y: 0, width: 0.5, height: 1 }, position: { x: 480, y: 410 }, size: { x: 45, y: 54 }, anchor: { x: 0.5, y: 0.5 }, layer: 20 });
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
        if (event.type === "keydown" && !event.repeat) this.toggleInventory();
      }
    });
    this.audio = this.createAudio();
    this.engine.addSystem({ update: (delta) => this.update(delta), render: () => this.render(), dispose: () => this.dispose() });
    this.engine.on("resize", ({ width, height }) => this.camera.setViewport(width, height));
  }

  static async create(): Promise<GunSmokeGame> {
    const engine = await Engine.create({ canvas, autoStart: false });
    const game = new GunSmokeGame(engine);
    engine.start();
    return game;
  }

  start(): void {
    if (this.mode === "playing") return;
    this.mode = "intro";
    this.randomState = 0x6d2b79f5;
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
    if (this.mode !== "playing") return;
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
        const boss = this.spawnUnit("boss", WINGATE_SECOND_ENTRY_X, this.scroll + WINGATE_SECOND_ENTRY_Y, (STAGES[MAX_STAGE - 1]?.bossHp ?? 6) * 4);
        boss.bossEntryX = boss.x;
        boss.bossEntryY = WINGATE_SECOND_ENTRY_Y;
        boss.vx = (boss.phase < Math.PI ? 1 : -1) * WINGATE_ENTRY_RUSH_SPEED;
        this.bossFireClock = WINGATE_SECOND_FIRST_SHOT_DELAY;
        this.showMessage("THE REAL WINGATE");
      }
    }
    if (this.stageClearClock > 0) {
      this.stageClearClock -= delta;
      if (this.stageClearClock <= 0) this.beginNextStage();
      this.updateHud();
      return;
    }
    const scrollDelta = this.bossSpawned ? 0 : WORLD_SCROLL_SPEED * delta;
    this.scroll += scrollDelta;
    this.player.y += scrollDelta;
    if (shouldLoopStage(this.scroll, this.stage, this.hasWanted)) this.loopStage();
    this.updateShopSpawns();
    if (this.shopOpen) return;
    this.camera.position.y = this.scroll + 270;
    this.invulnerable = Math.max(0, this.invulnerable - delta);
    const movement = WORLD_PLAYER_SPEED * (this.powerups.boots > 0 ? BOOTS_SPEED_MULTIPLIER : 1);
    const halfRoad = (ROAD_WIDTHS[this.stage - 1] ?? 520) / 2;
    const nextX = clamp(this.player.x + (this.actions.value("right") - this.actions.value("left")) * movement * delta, 480 - halfRoad + 22, 480 + halfRoad - 22);
    const nextY = clamp(this.player.y + (this.actions.value("down") - this.actions.value("up")) * movement * delta, this.scroll + 55, this.scroll + 500);
    if (!this.isPlayerBlocked(nextX, nextY)) {
      this.player.x = nextX;
      this.player.y = nextY;
    } else {
      if (!this.isPlayerBlocked(nextX, this.player.y)) this.player.x = nextX;
      if (!this.isPlayerBlocked(this.player.x, nextY)) this.player.y = nextY;
    }
    this.player.sprite.position = { x: this.player.x, y: this.player.y };
    this.horseSprite.position = { x: this.player.x, y: this.player.y + 16 };
    this.horseSprite.visible = this.hasHorse;
    this.playerAnimation?.update(delta);
    this.player.sprite.visible = this.invulnerable <= 0 || Math.floor(this.time * 14) % 2 === 0;
    this.updatePlayerFire(delta);
    this.updateSmartBomb();
    this.updateSpawns(delta);
    this.updateEnemyFire(delta);
    for (const unit of this.units) this.updateUnit(unit, delta);
    this.resolveCollisions();
    this.units.splice(0, this.units.length, ...this.units.filter((unit) => unit.age < unit.maxAge && unit.hp > 0 && unit.y > this.scroll - 340 && unit.y < this.scroll + 760));
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
      this.ownedWeapons.has(weapon) && this.weaponAmmo[weapon] < WEAPONS[weapon].maxAmmo,
    );
  }

  private refillAmmo(multiplier: number): void {
    for (const weapon of ["shotgun", "machinegun", "magnum"] as const) {
      if (!this.ownedWeapons.has(weapon)) continue;
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
    if (this.weapon === "pistol" && newlyPressed === 0) return;
    if (this.weapon !== "pistol" && this.fireClock > 0) return;
    if (this.weapon !== "pistol" && this.ammo <= 0) {
      this.weapon = "pistol";
      weapon = WEAPONS.pistol;
      this.showMessage("OUT OF AMMO");
    }
    const direction = left && right ? 0 : left ? -1 : 1;
    if (this.weapon !== "pistol") this.ammo = Math.max(0, this.ammo - 1);
    if (this.weapon === "pistol") {
      for (const shot of pistolShots(left, right)) this.spawnBullet(shot.direction, weapon.damage, shot.offset);
    } else if (this.weapon === "shotgun") {
      this.spawnBullet(direction, weapon.damage);
      if (direction !== 0) this.spawnBulletVelocity(direction * WORLD_BULLET_SPEED, 0, weapon.damage);
    } else {
      this.spawnBullet(direction, weapon.damage);
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

  private updateSpawns(delta: number): void {
    this.spawnClock -= delta;
    this.spawnRomEnemyEvents();
    this.spawnRomObjectEvents();
    if (this.scroll >= (ROUND_BOSS_TRIGGERS[this.stage - 1] ?? ROUND_BOSS_TRIGGERS[0]!) && this.hasWanted && !this.bossSpawned) this.spawnBoss();
    if (this.romEventMode) return;
    if (this.spawnClock <= 0) {
      const segments = ROUND_SEGMENTS[this.stage - 1] ?? ROUND_SEGMENTS[0]!;
      const nextSegment = this.bossSpawned ? undefined : segments.find((segment) => this.scroll < segment.at);
      if (nextSegment) {
        this.spawnClock = Math.max(0.01, segmentDelay(this.scroll, nextSegment.at, WORLD_SCROLL_SPEED));
        return;
      }
      this.spawnFormation(this.bossSpawned);
    }
  }

  private spawnRomObjectEvents(): void {
    const events = ROUND_ROM_OBJECT_EVENTS[this.stage - 1] ?? [];
    while (this.romObjectCursor < events.length) {
      const event = events[this.romObjectCursor];
      if (!event || romObjectWorldAt(event) > this.scroll) break;
      this.romObjectCursor += 1;
      if (event.semantic === "wantedTrigger") {
        if (this.hasWanted || this.posterPropSpawned) continue;
        this.posterPropSpawned = true;
        const wantedBarrel = this.spawnUnit("barrel", clamp(romObjectWorldX(event), 70, 890), this.scroll + romObjectWorldY(event), 1);
        wantedBarrel.vy = ROM_OBJECT_DROP_SPEED;
        wantedBarrel.romEntityCode = event.entityCode ?? 0x40;
        wantedBarrel.romFlags = event.flags;
        wantedBarrel.romPool = event.pool;
        this.showMessage("SHOOT THE BARREL");
        continue;
      }
      const activeObjects = this.units.filter((unit) => unit.romPool === event.pool && unit.romEntityCode !== undefined && unit.hp > 0).length;
      if (event.semantic === "sceneObject" && ROM_SCENE_PROP_DISPATCH_TYPES.includes(event.dispatchType as 8)) {
        if (!canSpawnRomPool(event.pool, activeObjects)) continue;
        const prop = this.spawnUnit("sceneObject", clamp(romObjectWorldX(event), 40, 920), this.scroll + romObjectWorldY(event), 1);
        prop.romEntityCode = event.entityCode;
        prop.romFlags = event.flags;
        prop.romPool = event.pool;
        prop.sprite.color = [0.58 + ((event.entityCode - 44) % 3) * 0.08, 0.68, 0.78, 1];
        continue;
      }
      if (event.semantic !== "sceneObject" || !ROM_BREAKABLE_CONTAINER_DISPATCH_TYPES.includes(event.dispatchType as 7)) continue;
      if (!canSpawnRomPool(event.pool, activeObjects)) continue;
      const pickup = ROM_OBJECT_PICKUPS[event.entityCode as keyof typeof ROM_OBJECT_PICKUPS];
      const container = this.spawnUnit(pickup ? "barrel" : "sceneObject", clamp(romObjectWorldX(event), 40, 920), this.scroll + romObjectWorldY(event), 1, undefined, pickup);
      container.vy = ROM_OBJECT_DROP_SPEED;
      container.romEntityCode = event.entityCode;
      container.romFlags = event.flags;
      container.romPool = event.pool;
    }
  }

  private spawnRomEnemyEvents(): void {
    if (this.bossSpawned) return;
    const events = ROUND_ROM_ENEMY_EVENTS[this.stage - 1] ?? [];
    const activePools = { enemy: 0, object: 0 };
    for (const unit of this.units) {
      if (unit.romEntityCode !== undefined && unit.hp > 0) activePools[unit.romPool ?? "enemy"] += 1;
    }
    while (this.romEventCursor < events.length) {
      const event = events[this.romEventCursor];
      if (!event || romEventWorldAt(event) > this.scroll) break;
      this.romEventCursor += 1;
      if (event.pool === "object" && ROM_NON_ENEMY_OBJECT_BEHAVIORS.includes(event.behavior as 5)) {
        if (!canSpawnRomPool("object", activePools.object)) continue;
        const rock = this.spawnUnit("enemyBullet", clamp(romEventWorldX(event), 40, 920), this.scroll + romEventWorldY(event), 1);
        rock.projectileType = "rock";
        rock.romBehavior = event.behavior;
        rock.romEntityCode = event.entityCode;
        rock.romFlags = event.flags;
        rock.romPool = "object";
        rock.vx = (event.x < 128 ? 1 : -1) * ROCK_WORLD_SPEED_X;
        rock.vy = ROCK_WORLD_SPEED_Y;
        rock.maxAge = ROCK_LIFETIME;
        rock.radius = 15;
        rock.sprite.size = { x: 24, y: 24 };
        rock.sprite.color = [0.55, 0.58, 0.62, 1];
        activePools.object += 1;
        continue;
      }
      if (!canSpawnRomPool(event.pool, activePools[event.pool])) continue;
      const enemyType = ROM_BEHAVIOR_ENEMY_TYPES[event.behavior] ?? "gunman";
      const eventX = romEventWorldX(event);
      const enemy = this.spawnUnit(
        "enemy",
        event.behavior === 3 ? eventX : clamp(eventX, 40, 920),
        this.scroll + romEventWorldY(event),
        1 + Number(this.stage >= 4),
        enemyType,
      );
      enemy.romBehavior = event.behavior;
      enemy.romEntityCode = event.entityCode;
      enemy.romFlags = event.flags;
      enemy.romPool = event.pool;
      enemy.romOriginX = enemy.x;
      enemy.romOriginY = romEventWorldY(event);
      if (event.behavior === 0) enemy.maxAge = SNIPER_LIFETIME;
      if (event.behavior === 1) enemy.maxAge = SHOTGUNNER_LIFETIME;
      if (event.behavior === 2) enemy.maxAge = GUNMAN_LIFETIME;
      if (event.behavior === 3) enemy.maxAge = BACKSTABBER_RAID_LIFETIME;
      if (event.behavior === 8) enemy.maxAge = BACKSTABBER_AMBUSH_LIFETIME;
      enemy.vx = enemyType === "sniper" ? 0 : (this.nextRandom() - 0.5) * (42 + this.stage * 6);
      enemy.vy = enemyType === "backstabber" ? -100 : enemyType === "sniper" ? 0 : 24 + this.stage * 6;
      activePools[event.pool] += 1;
    }
  }

  private updateEnemyFire(delta: number): void {
    const boss = this.units.find((unit) => unit.kind === "boss" && unit.hp > 0);
    if (boss) {
      if (this.stage === 1 && boss.age < boss.invulnerableUntil) return;
      this.bossFireClock -= delta;
      if (this.bossFireClock <= 0) this.fireBoss(boss);
      return;
    }
    this.enemyFireClock -= delta;
    if (this.enemyFireClock > 0) return;
    const shooters = this.units.filter((unit) => unit.kind === "enemy" && unit.enemyType === "gunman" && unit.romBehavior === undefined && unit.hp > 0 && unit.y < this.player.y);
    const shooter = shooters[Math.floor(this.nextRandom() * shooters.length)];
    if (shooter) {
      const angle = Math.atan2(this.player.y - shooter.y, this.player.x - shooter.x);
      const projectile = this.spawnUnit("enemyBullet", shooter.x, shooter.y + 12, 1);
      projectile.projectileType = "bullet";
      projectile.vx = Math.cos(angle) * (90 + this.stage * 7);
      projectile.vy = Math.sin(angle) * (90 + this.stage * 7);
      projectile.radius = 7;
    }
    this.enemyFireClock = Math.max(0.6, 1.75 - this.stage * 0.18);
  }

  private fireBoss(boss: Unit): void {
    const angle = Math.atan2(this.player.y - boss.y, this.player.x - boss.x);
    if (this.stage === 1) {
      const projectile = this.spawnUnit("enemyBullet", boss.x, boss.y + 24, 1);
      projectile.projectileType = "bullet";
      projectile.vx = Math.cos(angle) * BANDIT_BILL_BULLET_SPEED;
      projectile.vy = Math.sin(angle) * BANDIT_BILL_BULLET_SPEED;
      boss.volleysFired += 1;
      this.bossFireClock = banditBillCooldown(boss.volleysFired);
      this.beep(168, 0.045);
      return;
    }
    if (this.stage === MAX_STAGE) {
      const projectile = this.spawnUnit("enemyBullet", boss.x, boss.y + 24, 1);
      projectile.projectileType = "bullet";
      projectile.vx = 0;
      projectile.vy = WINGATE_BULLET_SPEED;
      boss.fired = true;
      boss.volleysFired += 1;
      this.bossFireClock = wingateShotCooldown(this.wingatePhase, boss.volleysFired);
      this.beep(258, 0.045);
      return;
    }
    const patterns: Record<number, { count: number; spread: number; speed: number; cooldown: number; turnRate: number }> = {
      1: { count: 1, spread: 0, speed: 125, cooldown: 1.1, turnRate: 0 },
      2: { count: 2, spread: 0.24, speed: CUTTER_BOOMERANG_SPEED, cooldown: CUTTER_ATTACK_INTERVAL, turnRate: 1.1 },
      3: { count: 5, spread: 0.18, speed: DEVIL_HAWK_FIREBALL_SPEED, cooldown: DEVIL_HAWK_VOLLEY_INTERVAL, turnRate: 0 },
      4: { count: NINJA_BOSS_SHURIKEN_COUNT, spread: 0.3, speed: NINJA_BOSS_SHURIKEN_SPEED, cooldown: NINJA_BOSS_ATTACK_INTERVAL, turnRate: 0 },
      5: { count: FATMAN_JOE_VOLLEY_SIZE, spread: 0.18, speed: 100, cooldown: FATMAN_JOE_VOLLEY_INTERVAL, turnRate: 0 },
    };
    let pattern = patterns[this.stage] ?? patterns[1]!;
    if (this.stage === 3 && Math.abs(this.player.x - boss.x) > 120) pattern = { ...pattern, count: 3 };
    const center = (pattern.count - 1) / 2;
    for (let index = 0; index < pattern.count; index += 1) {
      const projectile = this.spawnUnit("enemyBullet", boss.x, boss.y + 24, 1);
      projectile.projectileType = this.stage === 2 ? "boomerang" : this.stage === 3 ? "fireball" : this.stage === 4 ? "shuriken" : this.stage === 5 ? "grenade" : "bullet";
      const shotAngle = angle + (index - center) * pattern.spread;
      projectile.vx = Math.cos(shotAngle) * pattern.speed;
      projectile.vy = Math.sin(shotAngle) * pattern.speed;
      projectile.turnRate = pattern.turnRate * (index === 0 ? -1 : 1);
      projectile.radius = 7;
    }
    boss.fired = true;
    if (this.stage === 5) boss.invulnerableUntil = boss.age + 0.75;
    this.bossFireClock = pattern.cooldown;
    this.beep(150 + this.stage * 18, 0.045);
  }

  private render(): void {
    const renderItems = [this.horseSprite, this.player.sprite, ...this.backgrounds, ...this.units.map((unit) => unit.sprite)];
    this.renderer.render(renderItems, this.camera, { staticItems: false });
  }

  private buildBackground(): void {
    this.backgrounds.length = 0;
    const themes: Rgba[] = [[1, 1, 1, 1], [0.92, 0.98, 1, 1], [1, 0.93, 0.84, 1], [0.9, 0.96, 0.9, 1], [1, 0.86, 0.75, 1], [0.88, 0.9, 1, 1]];
    const tint = themes[(this.stage - 1) % themes.length] ?? [1, 1, 1, 1];
    const terrain = this.terrainTextures[this.stage - 1] ?? this.textures.terrain;
    const road = this.roadTextures[this.stage - 1] ?? this.textures.road;
    const roadWidth = ROAD_WIDTHS[this.stage - 1] ?? 520;
    const edge = (960 - roadWidth) / 2;
    const segments = ROUND_SEGMENTS[this.stage - 1] ?? ROUND_SEGMENTS[0]!;
    for (let y = -360; y < (ROUND_LENGTHS[this.stage - 1] ?? ROUND_LENGTHS[0]!) + 650; y += 180) {
      let landmark = segments[0]?.landmark ?? "town";
      for (const candidate of segments) if (y >= candidate.at) landmark = candidate.landmark;
      this.backgrounds.push(new Sprite({ texture: terrain, sampler: this.sampler, position: { x: 480, y: y + 90 }, size: { x: 960, y: 180 }, anchor: { x: 0.5, y: 0.5 }, color: tint, layer: -20 }));
      this.backgrounds.push(new Sprite({ texture: road, sampler: this.sampler, position: { x: 480, y: y + 90 }, size: { x: roadWidth, y: 180 }, anchor: { x: 0.5, y: 0.5 }, color: tint, layer: -19 }));
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

  private spawnFormation(bossEncounter = false): void {
    const roadHalf = (ROAD_WIDTHS[this.stage - 1] ?? 520) / 2;
    const center = clamp(480 + (this.nextRandom() - 0.5) * (roadHalf * 1.5), 80, 880);
    const y = formationEntryY(this.scroll, bossEncounter);
    const segments = ROUND_SEGMENTS[this.stage - 1] ?? ROUND_SEGMENTS[0]!;
    let segment = segments[0]!;
    for (const candidate of segments) if (this.scroll >= candidate.at) segment = candidate;
    this.currentLandmark = segment.landmark;
    const offsets = formationOffsets(segment.formation);
    const types = segment.enemyTypes;
    for (const offset of offsets) {
      const enemyType = types[Math.floor(this.nextRandom() * types.length)] ?? "gunman";
      const entersFromBehind = enemyType === "backstabber" || (segment.formation === "rear" && enemyType === "gunman");
      const entryY = entersFromBehind ? this.scroll + 520 : y - Math.abs(offset) * 22;
      const sniperX = offset <= 0 ? 480 - roadHalf + 22 : 480 + roadHalf - 22;
      const enemy = this.spawnUnit("enemy", enemyType === "sniper" ? sniperX : clamp(center + offset * 66, 54, 906), entryY, 1 + Number(this.stage >= 4), enemyType);
      enemy.vx = segment.formation === "cross" ? offset * 32 : (this.nextRandom() - 0.5) * (55 + this.stage * 8);
      enemy.vy = entersFromBehind ? -100 : enemyType === "sniper" ? 0 : 24 + this.stage * 6;
    }
    this.spawnClock = segment.interval;
  }

  private updateShopSpawns(): void {
    const checkpoints = SHOP_CHECKPOINTS[this.stage - 1] ?? [];
    while (this.shopSpawnCursor < checkpoints.length && this.scroll >= (checkpoints[this.shopSpawnCursor] ?? Number.POSITIVE_INFINITY)) {
      const offset = SHOP_X_OFFSETS[this.stage - 1]?.[this.shopSpawnCursor] ?? 0;
      const keeper = this.spawnUnit("shopkeeper", clamp(480 + offset, 70, 890), this.scroll + 500, 1);
      keeper.shopIndex = this.shopSpawnCursor + 1;
      this.shopSpawnCursor += 1;
    }
  }

  private openShop(index: number): void {
    if (this.shopOpen) return;
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
      item.disabled = !available || key === "horse" ? !available || this.hasHorse || this.score < cost : key === "ammo" ? !available || !this.canRefillAmmo() || this.score < cost : key === "wanted" ? !available || this.shopIndex < 2 || this.hasWanted || this.score < cost : key === "smartBomb" ? !available || this.smartBombs >= SMART_BOMB_CAPACITY || this.score < cost : key ? !available || this.ownedWeapons.has(key) || this.score < cost : true;
    }
  }

  buyShopItem(item: string): void {
    const key = item as WeaponName | "horse" | "ammo" | "wanted" | "smartBomb";
    const shopType: ShopType = SHOP_TYPES[this.stage - 1]?.[this.shopIndex - 1] ?? "supplies";
    const isWeapon = key === "shotgun" || key === "machinegun" || key === "magnum" || key === "smartBomb";
    if ((shopType === "weapons") !== isWeapon) {
      shopMessage.textContent = "NOT SOLD HERE";
      return;
    }
    const cost = key === "horse" ? SHOP_COSTS.horse : key === "ammo" ? SHOP_COSTS.ammo : key === "smartBomb" ? SHOP_COSTS.smartBomb : key === "wanted" ? WANTED_COSTS[this.stage - 1] ?? 50_000 : WEAPONS[key]?.cost;
    const alreadyOwned = key === "horse" ? this.hasHorse : key === "wanted" ? this.hasWanted : key === "smartBomb" ? this.smartBombs >= SMART_BOMB_CAPACITY : isWeapon ? this.ownedWeapons.has(key) : false;
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
    this.bossFireClock = this.stage === 1 ? BANDIT_BILL_FIRST_VOLLEY_DELAY : this.stage === 2 ? CUTTER_FIRST_ATTACK_DELAY : this.stage === 3 ? DEVIL_HAWK_FIRST_VOLLEY_DELAY : this.stage === 4 ? NINJA_BOSS_FIRST_ATTACK_DELAY : this.stage === 5 ? FATMAN_JOE_FIRST_VOLLEY_DELAY : this.stage === MAX_STAGE ? WINGATE_FIRST_SHOT_DELAY : 0.6;
    const definition = STAGES[this.stage - 1] ?? STAGES[0]!;
    const isBanditBill = this.stage === 1;
    const isCutter = this.stage === 2;
    const isDevilHawk = this.stage === 3;
    const isNinjaBoss = this.stage === 4;
    const isFatmanJoe = this.stage === 5;
    const isFirstWingate = this.stage === 6;
    const boss = this.spawnUnit(
      "boss",
      isBanditBill ? BANDIT_BILL_ENTRY_X_LANES[Math.floor(this.nextRandom() * BANDIT_BILL_ENTRY_X_LANES.length)] ?? 360 : isCutter ? CUTTER_ENTRY_X_LANES[Math.floor(this.nextRandom() * CUTTER_ENTRY_X_LANES.length)] ?? 540 : isDevilHawk ? DEVIL_HAWK_ENTRY_X_LANES[Math.floor(this.nextRandom() * DEVIL_HAWK_ENTRY_X_LANES.length)] ?? 630 : isNinjaBoss ? NINJA_BOSS_ENTRY_X_LANES[Math.floor(this.nextRandom() * NINJA_BOSS_ENTRY_X_LANES.length)] ?? 690 : isFatmanJoe ? FATMAN_JOE_ENTRY_X : isFirstWingate ? WINGATE_ENTRY_X : 480,
      this.scroll + (isBanditBill ? BANDIT_BILL_ENTRY_Y : isCutter ? CUTTER_ENTRY_Y : isDevilHawk ? DEVIL_HAWK_ENTRY_Y : isNinjaBoss ? NINJA_BOSS_ENTRY_Y_LANES[Math.floor(this.nextRandom() * NINJA_BOSS_ENTRY_Y_LANES.length)] ?? 288 : isFatmanJoe ? FATMAN_JOE_ENTRY_Y : isFirstWingate ? WINGATE_ENTRY_Y : 90),
      definition.bossHp * 4,
    );
    if (isBanditBill || isCutter || isDevilHawk || isNinjaBoss || isFatmanJoe || isFirstWingate) {
      boss.bossEntryX = boss.x;
      boss.bossEntryY = boss.y - this.scroll;
      if (isBanditBill || isCutter) boss.vx = 0;
      if (isFirstWingate) boss.vx = (boss.phase < Math.PI ? 1 : -1) * WINGATE_ENTRY_RUSH_SPEED;
      if (isFatmanJoe) boss.vx = (boss.phase < Math.PI ? 1 : -1) * FATMAN_JOE_MOVEMENT_SPEED;
      if (isNinjaBoss) boss.invulnerableUntil = NINJA_BOSS_ENTRY_INVULNERABILITY;
    }
    this.showMessage(`WANTED: ${definition.boss}`);
    this.beep(180, 0.18);
  }

  private spawnUnit(kind: UnitKind, x: number, y: number, hp: number, enemyType?: EnemyType, itemType?: ItemType): Unit {
    const textureName: TextureName = kind === "enemyBullet" || kind === "enemy" || kind === "boss" ? "bullet" : kind === "item" ? "ammo" : kind === "sceneObject" ? "landmark" : kind === "bullet" || kind === "moneyBag" || kind === "ammo" || kind === "barrel" || kind === "wanted" || kind === "shopkeeper" ? kind : "bullet";
    const isBoss = kind === "boss";
    const isPickup = kind === "moneyBag" || kind === "ammo" || kind === "item" || kind === "wanted";
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
      kind, enemyType, itemType, projectileType: kind === "enemyBullet" ? "bullet" : undefined, sprite, x, y, animation, shopIndex: undefined, romBehavior: undefined, romEntityCode: undefined, romFlags: undefined, romPool: undefined, romOriginX: undefined, romOriginY: undefined,
      vx: isBoss ? 42 : kind === "barrel" || kind === "shopkeeper" ? 0 : (this.nextRandom() - 0.5) * 70,
      vy: isBoss || isPickup || kind === "barrel" || kind === "shopkeeper" || sceneObject ? 0 : kind === "enemyBullet" ? 0 : 45,
      hp, radius: isBoss ? 48 : isPickup ? 17 : kind === "shopkeeper" ? 22 : small ? 7 : 19,
      value: isBoss ? bossReward(this.stage, this.wingatePhase) : kind === "moneyBag" ? 200 : kind === "ammo" || kind === "item" || kind === "wanted" ? 0 : kind === "barrel" ? 50 : 100,
      age: 0, phase: this.nextRandom() * Math.PI * 2, damage: kind === "enemy" && enemyType === "rifleman" ? 0 : 1, fired: false, nextFireAt: 0, volleysFired: 0, turnRate: 0, maxAge: isBoss ? unitMaxAge("boss") : sceneObject ? Number.POSITIVE_INFINITY : small ? unitMaxAge("projectile") : isPickup || kind === "barrel" ? unitMaxAge("pickup") : unitMaxAge("enemy"), invulnerableUntil: 0, piercing: false,
    };
    this.units.push(unit);
    return unit;
  }

  private spawnBullet(direction: number, damage: number, offset = direction * 10): void {
    const unit = this.spawnUnit("bullet", this.player.x + offset, this.player.y - 32, 1);
    const speedFactor = this.weapon === "magnum" ? MAGNUM_BULLET_SPEED / WORLD_BULLET_SPEED : this.weapon === "pistol" && this.powerups.rifle > 0 ? RIFLE_BULLET_SPEED_MULTIPLIER : 1;
    unit.vx = direction * WORLD_DIAGONAL_BULLET_X * speedFactor;
    unit.vy = Math.abs(direction) < 0.01 ? -WORLD_BULLET_SPEED * speedFactor : -WORLD_DIAGONAL_BULLET_Y * speedFactor;
    unit.damage = damage;
    unit.maxAge = this.weapon === "pistol" ? PISTOL_BULLET_LIFETIME : this.weapon === "magnum" ? MAGNUM_BULLET_LIFETIME : 0.55;
    unit.piercing = this.weapon === "magnum";
    unit.hitTargets = unit.piercing ? new Set<Unit>() : undefined;
    if (unit.piercing) {
      unit.radius = 11;
      unit.sprite.size = { x: 14, y: 32 };
    }
  }

  private spawnBulletVelocity(vx: number, vy: number, damage: number): void {
    const unit = this.spawnUnit("bullet", this.player.x, this.player.y - 32, 1);
    unit.vx = vx;
    unit.vy = vy;
    unit.damage = damage;
    unit.maxAge = 0.55;
  }

  private updateUnit(unit: Unit, delta: number): void {
    unit.age += delta;
    unit.animation?.update(delta);
    if (unit.kind === "enemy") {
      if (unit.enemyType === "backstabber") {
        if (unit.romBehavior === 3) {
          const [x, y] = backstabberRaidOffset(unit.age * NES_FRAME_RATE);
          unit.x = (unit.romOriginX ?? unit.x) + x * (960 / 256) * ((unit.romOriginX ?? unit.x) < 480 ? 1 : -1);
          unit.y = this.scroll + (unit.romOriginY ?? 0) + y * (540 / 240);
        } else if (unit.romBehavior === 8) {
          unit.y = this.scroll + Math.min(unit.age * BACKSTABBER_AMBUSH_DROP_SPEED, BACKSTABBER_AMBUSH_DEPTH);
        } else {
          unit.y += unit.vy * delta;
          unit.x += Math.sin(unit.age * 7 + unit.phase) * 35 * delta;
        }
      } else if (unit.enemyType === "ninja") {
        unit.x += (unit.vx + Math.sin(unit.age * 6 + unit.phase) * 90) * delta;
        unit.y += unit.vy * 1.8 * delta;
        if (!unit.fired && unit.age >= NINJA_FIRST_SHOT_DELAY) {
          unit.fired = true;
          const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
          const projectile = this.spawnUnit("enemyBullet", unit.x, unit.y, 1);
          projectile.projectileType = "shuriken";
          projectile.vx = Math.cos(angle) * NINJA_PROJECTILE_SPEED;
          projectile.vy = Math.sin(angle) * NINJA_PROJECTILE_SPEED;
          projectile.radius = 8;
          projectile.sprite.size = { x: 16, y: 16 };
        }
      } else if (unit.enemyType === "rifleman") {
        unit.x += unit.vx * delta;
        unit.y += (unit.age * NES_FRAME_RATE < RIFLEMAN_ATTACK_STATE_FRAME ? unit.vy : -unit.vy * 0.75) * delta;
        if (unit.nextFireAt === 0) unit.nextFireAt = RIFLEMAN_FIRST_SHOT_DELAY;
        if (unit.age >= unit.nextFireAt && unit.volleysFired < RIFLEMAN_SHOTS_PER_VOLLEY) {
          unit.nextFireAt += RIFLEMAN_SHOT_INTERVAL;
          unit.volleysFired += 1;
          const projectile = this.spawnUnit("enemyBullet", unit.x, unit.y + 12, 1);
          projectile.vx = 0;
          projectile.vy = RIFLEMAN_BULLET_SPEED;
        }
      } else if (unit.enemyType === "sniper") {
        const nextShotFrame = unit.romBehavior === 0 ? SNIPER_SHOT_FRAMES[unit.volleysFired] : undefined;
        const shouldFire = unit.romBehavior === 0
          ? nextShotFrame !== undefined && unit.age >= nextShotFrame / NES_FRAME_RATE
          : !unit.fired && unit.age > 0.8;
        if (shouldFire) {
          unit.fired = true;
          unit.volleysFired += 1;
          const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
          const projectile = this.spawnUnit("enemyBullet", unit.x, unit.y + 8, 1);
          projectile.projectileType = "bullet";
          projectile.vx = Math.cos(angle) * 150;
          projectile.vy = Math.sin(angle) * 150;
          unit.invulnerableUntil = unit.age + 0.45;
        }
        unit.sprite.visible = unit.age >= unit.invulnerableUntil;
      } else if (unit.enemyType === "bomber") {
        unit.x += unit.vx * delta;
        unit.y += unit.vy * 0.7 * delta;
        if (unit.nextFireAt === 0) unit.nextFireAt = BOMBER_FIRST_THROW_DELAY;
        if (unit.age >= unit.nextFireAt) {
          unit.nextFireAt += BOMBER_THROW_INTERVAL;
          const projectile = this.spawnUnit("enemyBullet", unit.x, unit.y + 12, 1);
          projectile.projectileType = "dynamite";
          projectile.vx = (this.player.x - unit.x) * DYNAMITE_AIM_FACTOR;
          projectile.vy = DYNAMITE_WORLD_SPEED;
          projectile.maxAge = DYNAMITE_LIFETIME;
        }
      } else if (unit.enemyType === "shotgunner") {
        unit.x += unit.vx * delta;
        unit.y += unit.vy * 0.65 * delta;
        const tracedSpread = unit.romBehavior === 1;
        if (unit.nextFireAt === 0) unit.nextFireAt = tracedSpread ? SHOTGUNNER_FIRST_VOLLEY_DELAY : 0.8;
        if (unit.age >= unit.nextFireAt && (tracedSpread ? unit.volleysFired < 2 : !unit.fired)) {
          unit.fired = true;
          unit.volleysFired += 1;
          if (tracedSpread) unit.nextFireAt += SHOTGUNNER_VOLLEY_INTERVAL;
          const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
          for (const spread of [-0.2, 0, 0.2]) {
            const projectile = this.spawnUnit("enemyBullet", unit.x, unit.y + 12, 1);
            projectile.projectileType = "bullet";
            projectile.vx = Math.cos(angle + spread) * 145;
            projectile.vy = Math.sin(angle + spread) * 145;
          }
        }
      } else if (unit.enemyType === "spear") {
        unit.x += Math.sin(unit.age * 3 + unit.phase) * 28 * delta;
        unit.y += unit.vy * delta;
        const tracedSpear = unit.romBehavior === 10;
        if (!unit.fired && unit.age >= (tracedSpear ? SPEAR_FIRST_SHOT_DELAY : 0.65)) {
          unit.fired = true;
          const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
          const projectile = this.spawnUnit("enemyBullet", unit.x, unit.y + 12, 1);
          projectile.projectileType = "spear";
          const speed = tracedSpear ? SPEAR_PROJECTILE_SPEED : 150;
          projectile.vx = Math.cos(angle) * speed;
          projectile.vy = Math.sin(angle) * speed;
          projectile.sprite.size = { x: 7, y: 34 };
        }
      } else if (unit.enemyType === "hatchet") {
        unit.x += Math.sin(unit.age * 3.4 + unit.phase) * 42 * delta;
        unit.y += unit.vy * delta;
        if (!unit.fired && unit.age >= HATCHET_FIRST_SHOT_DELAY) {
          unit.fired = true;
          const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
          const projectile = this.spawnUnit("enemyBullet", unit.x, unit.y + 12, 1);
          projectile.projectileType = "hatchet";
          projectile.vx = Math.cos(angle) * HATCHET_PROJECTILE_SPEED;
          projectile.vy = Math.sin(angle) * HATCHET_PROJECTILE_SPEED;
          projectile.radius = 9;
          projectile.sprite.size = { x: 16, y: 16 };
        }
      } else if (unit.enemyType === "firebreather") {
        unit.x += Math.sin(unit.age * 4 + unit.phase) * 55 * delta;
        unit.y += unit.vy * delta;
        const tracedFirebreather = unit.romBehavior === 11;
        if (!unit.fired && unit.age >= (tracedFirebreather ? FIREBREATHER_FIRST_SHOT_DELAY : 0.7)) {
          unit.fired = true;
          const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
          const spreads = tracedFirebreather ? [0] : [-0.22, 0, 0.22];
          for (const spread of spreads) {
            const projectile = this.spawnUnit("enemyBullet", unit.x, unit.y + 12, 1);
            projectile.projectileType = "fireball";
            const speed = tracedFirebreather ? FIREBREATHER_PROJECTILE_SPEED : 115;
            projectile.vx = Math.cos(angle + spread) * speed;
            projectile.vy = Math.sin(angle + spread) * speed;
          }
        }
      } else if (unit.enemyType === "gunman") {
        unit.x += unit.vx * delta;
        unit.y += unit.vy * delta;
        unit.x += Math.sin(unit.age * 3 + unit.phase) * 18 * delta;
        if (unit.romBehavior === 2 && !unit.fired && unit.age >= GUNMAN_FIRST_SHOT_DELAY) {
          unit.fired = true;
          const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
          const projectile = this.spawnUnit("enemyBullet", unit.x, unit.y, 1);
          projectile.projectileType = "bullet";
          projectile.vx = Math.cos(angle) * GUNMAN_BULLET_SPEED;
          projectile.vy = Math.sin(angle) * GUNMAN_BULLET_SPEED;
        }
      }
      if (unit.x < 32 || unit.x > 928) unit.vx *= -1;
    } else if (unit.kind === "boss") {
      if (this.stage === 1) unit.x = unit.bossEntryX ?? unit.x;
      else if (this.stage === 2 && unit.age <= CUTTER_ENTRY_DURATION) unit.x = unit.bossEntryX ?? unit.x;
      else if (this.stage === 3 && unit.age <= DEVIL_HAWK_ENTRY_DURATION + DEVIL_HAWK_POST_ENTRY_X_HOLD) unit.x = unit.bossEntryX ?? unit.x;
      else if (this.stage === 4 && unit.age <= NINJA_BOSS_ENTRY_INVULNERABILITY) unit.x = unit.bossEntryX ?? unit.x;
      else if (this.stage === 5 && unit.age <= FATMAN_JOE_ENTRY_DURATION) unit.x = unit.bossEntryX ?? unit.x;
      else if (this.stage === 6 && unit.bossEntryY !== undefined && unit.age <= WINGATE_ENTRY_DURATION) unit.x = unit.bossEntryX ?? unit.x;
      else {
        if (this.stage === 2 && unit.vx === 0) unit.vx = (unit.phase < Math.PI ? 1 : -1) * CUTTER_MOVEMENT_SPEED;
        if (this.stage === 6 && unit.bossEntryY !== undefined) {
          const direction = unit.vx < 0 ? -1 : 1;
          unit.vx = direction * (unit.age <= WINGATE_ENTRY_DURATION + WINGATE_ENTRY_RUSH_DURATION ? WINGATE_ENTRY_RUSH_SPEED : WINGATE_MOVEMENT_SPEED);
        }
        if (this.stage === 5) unit.vx = (unit.vx < 0 ? -1 : 1) * FATMAN_JOE_MOVEMENT_SPEED;
        unit.x += unit.vx * delta;
      }
      const edgeEntryBoss = this.stage === 1 || this.stage === 2 || this.stage === 3 || this.stage === 4 || (this.stage === 6 && unit.bossEntryY !== undefined);
      const minBossX = edgeEntryBoss ? 0 : 380;
      const maxBossX = edgeEntryBoss ? 960 : 580;
      if (unit.x < minBossX || unit.x > maxBossX) unit.vx *= -1;
      if (this.stage === 1) unit.y = this.scroll + (unit.age < unit.invulnerableUntil ? 430 : banditBillOpeningY(unit.age));
      else if (this.stage === 2) unit.y = this.scroll + cutterOpeningY(unit.age <= CUTTER_ENTRY_DURATION ? unit.age : CUTTER_ENTRY_DURATION);
      else if (this.stage === 3) unit.y = this.scroll + (unit.age <= DEVIL_HAWK_ENTRY_DURATION ? devilHawkOpeningY(unit.age) : devilHawkCombatY(unit.age));
      else if (this.stage === 4) {
        const entryY = unit.bossEntryY ?? NINJA_BOSS_ENTRY_Y_LANES[0] ?? 144;
        unit.y = this.scroll + entryY + (unit.age <= NINJA_BOSS_ENTRY_INVULNERABILITY ? 0 : Math.abs(Math.sin(unit.age * 3)) * 55);
      }
      else if (this.stage === 5) unit.y = this.scroll + (unit.age <= FATMAN_JOE_ENTRY_DURATION ? fatmanJoeOpeningY(unit.age) : fatmanJoeCombatY(unit.age));
      else if (this.stage === 6 && unit.bossEntryY !== undefined) unit.y = this.scroll + wingateOpeningY(unit.age <= WINGATE_ENTRY_DURATION ? unit.age : WINGATE_ENTRY_DURATION) + (unit.age <= WINGATE_ENTRY_DURATION ? 0 : Math.min((unit.age - WINGATE_ENTRY_DURATION) * 110, 170));
      else if (this.stage === 6) unit.y = this.scroll + 92 + Math.min(unit.age * 110, 170);
      else unit.y = this.scroll + 92 + Math.sin(unit.age * 2) * 18;
      unit.sprite.visible = unit.age >= unit.invulnerableUntil;
    } else if (unit.kind === "shopkeeper" || unit.kind === "sceneObject") {
      // Shopkeepers stay in world space; decoded object proxies descend like ROM barrels.
      if (unit.kind === "sceneObject" && unit.vy !== 0) unit.y += unit.vy * delta;
    } else if (unit.kind === "moneyBag" || unit.kind === "item" || unit.kind === "ammo" || unit.kind === "wanted") {
      unit.y += 40 * delta;
      unit.x += Math.sin(unit.age * 4 + unit.phase) * 14 * delta;
    } else {
      if (unit.kind === "enemyBullet" && unit.projectileType === "rock") {
        if (unit.age >= ROCK_IMPACT_DELAY) unit.vx = unit.vy = 0;
      }
      if (unit.kind === "enemyBullet" && (unit.projectileType === "dynamite" || unit.projectileType === "grenade")) {
        const airborneDuration = unit.projectileType === "dynamite" ? DYNAMITE_AIRBORNE_DURATION : 0.75;
        const explosionAt = unit.projectileType === "dynamite" ? DYNAMITE_LIFETIME : 2.2;
        if (unit.age >= airborneDuration) {
          unit.vx = 0;
          unit.vy = 0;
        }
        if (unit.age >= explosionAt) {
          if (distance(unit, this.player) <= 85 && this.invulnerable <= 0) this.takeHit();
          unit.hp = 0;
          this.beep(95, 0.14);
        }
      }
      if (unit.kind === "enemyBullet" && unit.turnRate !== 0) {
        const speed = Math.hypot(unit.vx, unit.vy);
        const angle = Math.atan2(unit.vy, unit.vx) + unit.turnRate * delta;
        unit.vx = Math.cos(angle) * speed;
        unit.vy = Math.sin(angle) * speed;
      }
      if (unit.kind === "enemyBullet" && (unit.projectileType === "shuriken" || unit.projectileType === "hatchet")) unit.sprite.rotation += delta * 10;
      unit.x += unit.vx * delta;
      unit.y += unit.vy * delta;
    }
    unit.sprite.position = { x: unit.x, y: unit.y };
  }

  private resolveCollisions(): void {
    const bullets = this.units.filter((unit) => unit.kind === "bullet" && unit.hp > 0);
    const targets = this.units.filter((unit) => (unit.kind === "enemy" || unit.kind === "boss" || unit.kind === "barrel") && unit.hp > 0);
    for (const bullet of bullets) {
      if (bullet.piercing) {
        const projectile = this.units.find((candidate) => candidate.kind === "enemyBullet" && candidate.hp > 0 && distance(bullet, candidate) <= bullet.radius + candidate.radius);
        if (projectile) {
          projectile.hp = 0;
          continue;
        }
      }
      const target = targets.find((candidate) => candidate.hp > 0 && !bullet.hitTargets?.has(candidate) && distance(bullet, candidate) <= bullet.radius + candidate.radius);
      if (!target) continue;
      if (!this.isBossVulnerable(target)) continue;
      if (bullet.piercing) bullet.hitTargets?.add(target);
      else bullet.hp = 0;
      const previousHp = target.hp;
      target.hp -= bullet.damage;
      if (target.hp > 0) {
        this.handleBossDamage(target, previousHp);
        continue;
      }
      this.defeatTarget(target);
    }
    for (const unit of this.units.filter((candidate) => candidate.hp > 0)) {
      if (unit.kind === "moneyBag" || unit.kind === "item" || unit.kind === "ammo" || unit.kind === "wanted") {
        if (distance(unit, this.player) <= unit.radius + 22) {
          unit.hp = 0;
          this.score += unit.value;
          this.awardScoreLife();
          if (unit.kind === "item" && unit.itemType) this.collectItem(unit.itemType);
          else if (unit.kind === "ammo") this.refillAmmo(1);
          else if (unit.kind === "wanted") {
            this.hasWanted = true;
            this.showMessage("WANTED POSTER FOUND");
          }
          this.beep(unit.kind === "moneyBag" ? 980 : unit.kind === "wanted" ? 520 : 620, 0.08);
        }
      } else if (unit.kind === "shopkeeper" && distance(unit, this.player) <= unit.radius + 22) {
        this.openShop(unit.shopIndex ?? this.shopSpawnCursor);
        break;
      } else if (unit.kind === "enemyBullet" && unit.projectileType === "dynamite" && unit.age >= DYNAMITE_AIRBORNE_DURATION && unit.age < DYNAMITE_LIFETIME && distance(unit, this.player) <= unit.radius + 20) {
        unit.hp = 0;
        this.showMessage("DYNAMITE DEFUSED");
      } else if ((unit.kind === "enemy" || unit.kind === "enemyBullet") && this.invulnerable > 0 && distance(unit, this.player) <= unit.radius + 20) {
        if (unit.kind === "enemy") this.defeatTarget(unit);
        else unit.hp = 0;
      } else if ((unit.kind === "enemy" || unit.kind === "boss" || unit.kind === "enemyBullet") && this.invulnerable <= 0 && distance(unit, this.player) <= unit.radius + 20) {
        this.takeHit();
        if (unit.kind !== "boss") unit.hp = 0;
      }
    }
  }

  private defeatTarget(target: Unit): void {
    target.hp = 0;
    this.score += target.value;
    this.awardScoreLife();
    if (target.kind === "barrel") {
      if (target.itemType) this.spawnUnit("item", target.x, target.y, 1, undefined, target.itemType);
      else if (target.romEntityCode === undefined || Boolean((target.romFlags ?? 0) & 0x40)) {
        this.spawnUnit("wanted", target.x, target.y, 1);
        this.showMessage("WANTED POSTER FOUND");
      }
    } else if (target.kind === "enemy") {
      const drop = this.nextRandom();
      if (drop < 0.22) this.spawnUnit("moneyBag", target.x, target.y, 1);
      else if (this.ownedWeapons.size > 1 && drop < 0.38) this.spawnUnit("ammo", target.x, target.y, 1);
    } else if (target.kind === "boss") {
      if (this.stage === MAX_STAGE && this.wingatePhase === 0) {
        this.wingatePhase = 1;
        this.wingateRespawnClock = WINGATE_SECOND_SPAWN_DELAY;
        for (const unit of this.units) if (unit.kind === "enemyBullet") unit.hp = 0;
        this.showMessage("DECOY DOWN");
        return;
      }
      this.bossSpawned = false;
      this.stageClearClock = 1.5;
      this.showMessage(this.stage === MAX_STAGE ? "TRAIL COMPLETE" : "BOSS DOWN");
      this.beep(110, 0.3);
    }
  }

  private isBossVulnerable(unit: Unit): boolean {
    if (unit.kind !== "boss") return true;
    if (unit.age < unit.invulnerableUntil) return false;
    if (this.stage === 1) return true;
    if (this.stage === 2 || this.stage === 3) return unit.fired;
    if (this.stage === 5) return unit.age >= unit.invulnerableUntil;
    return true;
  }

  private handleBossDamage(unit: Unit, previousHp: number): void {
    if (unit.kind !== "boss") return;
    if (Math.ceil(previousHp / 4) === Math.ceil(unit.hp / 4)) return;
    if (this.stage === 1) {
      unit.invulnerableUntil = unit.age + 1.1;
      this.showMessage("BANDIT BILL CRAWLS");
    } else if (this.stage === 4) {
      unit.invulnerableUntil = unit.age + 0.45;
      unit.x = clamp(unit.x + (this.nextRandom() - 0.5) * 220, 300, 660);
      this.showMessage("NINJA SMOKE");
    }
  }

  private collectItem(item: ItemType): void {
    if (item === "boots" || item === "rifle") {
      const pickup = storedPowerupPickup(this.powerups[item]);
      this.powerups[item] = pickup.stock;
      this.score += pickup.score;
      if (pickup.score > 0) this.awardScoreLife();
    } else if (item === "ammo") {
      this.refillAmmo(1);
    } else if (item === "money") {
      this.score += 200;
      this.awardScoreLife();
    } else if (item === "pow") {
      for (const target of [...this.units]) {
        if (target.kind === "enemy" && target.hp > 0) this.defeatTarget(target);
        else if (target.kind === "enemyBullet") target.hp = 0;
      }
    } else if (item === "skull") {
      this.powerups.boots = Math.max(0, this.powerups.boots - 1);
      this.powerups.rifle = Math.max(0, this.powerups.rifle - 1);
    } else if (item === "horse") {
      this.hasHorse = true;
      this.horseHealth = 3;
    } else if (item === "blueYashichi") {
      this.invulnerable = Math.max(this.invulnerable, BLUE_YASHICHI_DURATION);
    } else if (item === "redYashichi") {
      this.lives = Math.min(MAX_LIVES, this.lives + 1);
    }
    this.showMessage(item.replace(/([A-Z])/g, " $1").toUpperCase());
    this.updateHud();
  }

  private takeHit(): void {
    if (this.horseHealth > 0) {
      this.horseHealth -= 1;
      this.hasHorse = this.horseHealth > 0;
      this.invulnerable = 1;
      this.beep(170, 0.12);
      this.showMessage(this.hasHorse ? `HORSE ${this.horseHealth}` : "HORSE DOWN");
      for (const unit of this.units) if (unit.kind === "enemyBullet") unit.hp = 0;
      this.updateHud();
      return;
    }
    if (this.smartBombArmed && this.smartBombs > 0) {
      this.smartBombs -= 1;
      this.smartBombArmed = false;
      for (const unit of [...this.units]) {
        if (unit.kind === "enemy" && unit.hp > 0) this.defeatTarget(unit);
        else if (unit.kind === "enemyBullet") unit.hp = 0;
      }
      this.invulnerable = 1;
      this.beep(75, 0.35);
      this.showMessage("SMART BOMB");
      this.updateInventory();
      this.updateHud();
      return;
    }
    this.lives -= 1;
    this.powerups.boots = Math.max(0, this.powerups.boots - 1);
    this.powerups.rifle = Math.max(0, this.powerups.rifle - 1);
    if (this.weapon !== "pistol") {
      this.weaponAmmo[this.weapon] = 0;
      this.ownedWeapons.delete(this.weapon);
      this.weapon = "pistol";
    }
    this.invulnerable = 2;
    this.beep(120, 0.16);
    this.showMessage(this.lives > 0 ? "HIT!" : "OUT OF LIVES");
    for (const unit of this.units) if (unit.kind === "enemyBullet") unit.hp = 0;
    if (this.lives <= 0) this.finish(false);
  }

  private awardScoreLife(): void {
    const reward = scoreExtraLives(this.score, this.nextLifeScore);
    for (let index = 0; index < reward.lives; index += 1) {
      this.lives = Math.min(MAX_LIVES, this.lives + 1);
      this.showMessage("EXTRA LIFE");
    }
    this.nextLifeScore = reward.nextThreshold;
  }

  private beginNextStage(): void {
    if (this.stage >= MAX_STAGE) {
      this.finish(true);
      return;
    }
    this.stage += 1;
    this.scroll = 0;
    this.spawnClock = 0.8;
    this.enemyFireClock = 1.2;
    this.bossFireClock = 1;
    this.bossSpawned = false;
    this.hasWanted = false;
    this.wingatePhase = 0;
    this.wingateRespawnClock = 0;
    this.posterPropSpawned = false;
    this.romObjectCursor = 0;
    this.romEventCursor = 0;
    this.stageLoopCount = 0;
    this.shopIndex = 0;
    this.shopSpawnCursor = 0;
    this.units.length = 0;
    this.buildBackground();
    this.player.x = 480;
    this.player.y = 410;
    this.showMessage(`STAGE ${this.stage}`);
    this.showBriefing();
  }

  private loopStage(): void {
    this.stageLoopCount += 1;
    this.scroll = 0;
    this.camera.position.y = 270;
    this.player.y = 410;
    this.player.sprite.position = { x: this.player.x, y: this.player.y };
    this.posterPropSpawned = false;
    this.wingateRespawnClock = 0;
    this.romObjectCursor = 0;
    this.romEventCursor = 0;
    this.shopIndex = 0;
    this.shopSpawnCursor = 0;
    this.spawnClock = 0.8;
    this.enemyFireClock = 1.2;
    this.units.length = 0;
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
      endingScreen.hidden = false;
      gameOver.hidden = true;
    } else {
      this.mode = "gameover";
      gameOver.hidden = false;
      endingScreen.hidden = true;
      gameOver.querySelector("h2")!.textContent = "WANTED: ALIVE";
      finalScore.textContent = `SCORE ${String(this.score).padStart(6, "0")}`;
    }
  }

  private updateHud(): void {
    const definition = STAGES[this.stage - 1] ?? STAGES[0]!;
    stageLabel.textContent = `ROUND ${this.stage} ${definition.name}`;
    scoreLabel.textContent = `SCORE ${String(this.score).padStart(6, "0")}`;
    livesLabel.textContent = `LIVES ${this.lives}`;
    const ammo = Number.isFinite(WEAPONS[this.weapon].maxAmmo) ? ` ${this.ammo}` : "";
    weaponLabel.textContent = `${this.weapon.toUpperCase()}${ammo} / BOMB ${this.smartBombs}${this.smartBombArmed ? " ARMED" : ""} / BOOTS ${this.powerups.boots} / RIFLE ${this.powerups.rifle}${this.hasHorse ? ` / HORSE ${this.horseHealth}` : ""} / WANTED ${this.hasWanted ? "YES" : "NO"}`;
    const boss = this.units.find((unit) => unit.kind === "boss" && unit.hp > 0);
    bossLabel.hidden = !boss;
    if (boss) {
      const name = this.stage === MAX_STAGE && this.wingatePhase > 0 ? "WINGATE II" : definition.boss;
      const bars = Math.max(1, Math.ceil(boss.hp / 4));
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
    const roundPatterns: readonly number[][] = [
      [262, 330, 392, 330, 294, 349, 440, 349],
      [196, 247, 294, 247, 220, 277, 330, 277],
      [220, 277, 330, 277, 247, 311, 370, 311],
      [175, 220, 262, 220, 196, 247, 294, 247],
      [233, 294, 349, 294, 262, 330, 392, 330],
      [147, 185, 220, 185, 165, 208, 247, 208],
    ];
    const pattern = roundPatterns[(this.stage - 1) % roundPatterns.length] ?? roundPatterns[0]!;
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
    let state = this.randomState;
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    this.randomState = state >>> 0;
    return this.randomState / 0x1_0000_0000;
  }

  private dispose(): void {
    this.stopMusic();
    if (this.pausePollHandle !== undefined) window.cancelAnimationFrame(this.pausePollHandle);
    this.audio?.dispose();
    const textures = new Set<GPUTexture>([
      ...Object.values(this.textures),
      ...Object.values(this.itemTextures),
      ...Object.values(this.enemyTextures),
      ...this.bossTextures,
      ...this.terrainTextures,
      ...this.roadTextures,
    ]);
    for (const texture of textures) texture.destroy();
  }

  private pollPausedGamepad(): void {
    if (this.pausePollHandle !== undefined) return;
    const poll = (): void => {
      this.pausePollHandle = undefined;
      if (this.mode !== "paused" && this.mode !== "briefing") return;
      this.engine.input?.pollGamepads();
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
      engine = await Engine.create({ canvas, autoStart: false, input: true });
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
startButton.addEventListener("click", () => void game?.start());
continueButton.addEventListener("click", () => game?.continueFromIntro());
briefingButton.addEventListener("click", () => game?.continueFromBriefing());
restartButton.addEventListener("click", () => window.location.reload());
endingButton.addEventListener("click", () => window.location.reload());
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
  if (event.code === "KeyP" || event.code === "Escape") {
    game?.togglePause();
    return;
  }
  if (event.code !== "Enter" && event.code !== "NumpadEnter") return;
  if (game?.mode === "title") game.start();
  else if (game?.mode === "intro") game.continueFromIntro();
  else if (game?.mode === "briefing") game.continueFromBriefing();
  else if (game?.mode === "playing" || game?.mode === "paused") game.togglePause();
  else if (game?.mode === "gameover" || game?.mode === "ending") window.location.reload();
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
