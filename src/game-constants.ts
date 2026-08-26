export interface StageDefinition {
  name: string;
  boss: string;
  bossHp: number;
}

export type EnemyType = "gunman" | "rifleman" | "bomber" | "sniper" | "backstabber" | "ninja" | "hatchet" | "spear" | "firebreather" | "shotgunner";
export type ItemType = "boots" | "rifle" | "ammo" | "money" | "pow" | "skull" | "horse" | "blueYashichi" | "redYashichi";

export const STAGES: readonly StageDefinition[] = [
  { name: "HICKSVILLE", boss: "BANDIT BILL", bossHp: 4 },
  { name: "ROCKY PASS", boss: "CUTTER", bossHp: 4 },
  { name: "NATIVE VILLAGE", boss: "DEVIL HAWK", bossHp: 5 },
  { name: "CLIFF VALLEY", boss: "NINJA", bossHp: 5 },
  { name: "FOREST", boss: "FATMAN JOE", bossHp: 6 },
  { name: "WINGATE TOWN", boss: "WINGATE", bossHp: 6 },
];

export const MAX_STAGE = STAGES.length;
export const NES_FRAME_RATE = 60.098;
export const MAX_LIVES = 5;
export const BLUE_YASHICHI_DURATION = 180 / NES_FRAME_RATE;
export const MAX_POWERUP_STOCK = 4;
export const POWERUP_OVERFLOW_SCORE = 100;

export function storedPowerupPickup(stock: number): { stock: number; score: number } {
  return stock >= MAX_POWERUP_STOCK ? { stock: MAX_POWERUP_STOCK, score: POWERUP_OVERFLOW_SCORE } : { stock: stock + 1, score: 0 };
}
export const WORLD_VIEWPORT_HEIGHT = 540;
export const NES_WORLD_Y_SCALE = WORLD_VIEWPORT_HEIGHT / 240;
export const NES_WORLD_X_SCALE = 960 / 256;
export const ROUND_BOSS_GATE_SCROLL_NES = [2_767, 2_799, 4_863, 3_487, 2_879, 4_879] as const;
export const ROUND_LOOP_SCROLL_NES = [3_087, 3_055, 5_119, 3_839, 3_055, 5_119] as const;
export const ROUND_WANTED_SCROLL_NES = [1_695, 1_455, 2_031, 1_471, 1_631, 1_951] as const;
export const ROUND_WANTED_X_NES = [200, 64, 216, 216, 72, 216] as const;
export const ROUND_BOSS_TRIGGERS = ROUND_BOSS_GATE_SCROLL_NES.map((value) => value * NES_WORLD_Y_SCALE);
export const ROUND_LENGTHS = ROUND_LOOP_SCROLL_NES.map((value) => value * NES_WORLD_Y_SCALE);
export const WANTED_REVEAL_AT = ROUND_WANTED_SCROLL_NES.map((value) => value * NES_WORLD_Y_SCALE);
export const NES_SCROLL_SPEED = 20 * (NES_FRAME_RATE / 60);
export const WORLD_SCROLL_SPEED = NES_SCROLL_SPEED * NES_WORLD_Y_SCALE;
export const NES_PLAYER_SPEED = 75 * (NES_FRAME_RATE / 60);
export const WORLD_PLAYER_SPEED = NES_PLAYER_SPEED * NES_WORLD_Y_SCALE;
export const BOOTS_SPEED_MULTIPLIER = 4 / 3;
export const NES_BULLET_SPEED = 6 * NES_FRAME_RATE;
export const WORLD_BULLET_SPEED = NES_BULLET_SPEED * NES_WORLD_Y_SCALE;
export const MAGNUM_BULLET_SPEED = WORLD_BULLET_SPEED * 0.75;
export const MAGNUM_BULLET_LIFETIME = 0.8;
export const NES_DIAGONAL_BULLET_X = 2.5 * NES_FRAME_RATE;
export const NES_DIAGONAL_BULLET_Y = 5 * NES_FRAME_RATE;
export const WORLD_DIAGONAL_BULLET_X = NES_DIAGONAL_BULLET_X * NES_WORLD_Y_SCALE;
export const WORLD_DIAGONAL_BULLET_Y = NES_DIAGONAL_BULLET_Y * NES_WORLD_Y_SCALE;
export const PISTOL_BULLET_LIFETIME = 15 / NES_FRAME_RATE;
export const RIFLE_BULLET_SPEED_MULTIPLIER = 4 / 3;

export function pistolShots(left: boolean, right: boolean): readonly { direction: number; offset: number }[] {
  return left && right ? [{ direction: 0, offset: -8 }, { direction: 0, offset: 8 }] : [{ direction: left ? -1 : 1, offset: left ? -10 : 10 }];
}
export const BOMBER_FIRST_THROW_DELAY = 198 / NES_FRAME_RATE;
export const BOMBER_THROW_INTERVAL = 106 / NES_FRAME_RATE;
export const DYNAMITE_AIRBORNE_DURATION = 212 / NES_FRAME_RATE;
export const DYNAMITE_LANDED_DURATION = 53 / NES_FRAME_RATE;
export const DYNAMITE_LIFETIME = DYNAMITE_AIRBORNE_DURATION + DYNAMITE_LANDED_DURATION;
export const DYNAMITE_WORLD_SPEED = 89 * (540 / 240) / DYNAMITE_AIRBORNE_DURATION;
export const DYNAMITE_AIM_FACTOR = 0.045;
export const SHOTGUNNER_FIRST_VOLLEY_DELAY = 108 / NES_FRAME_RATE;
export const SHOTGUNNER_VOLLEY_INTERVAL = 51 / NES_FRAME_RATE;
export const SHOTGUNNER_LIFETIME = 228 / NES_FRAME_RATE;
export const SNIPER_SHOT_FRAMES = [134, 224, 405, 495, 585] as const;
export const SNIPER_LIFETIME = 732 / NES_FRAME_RATE;
export const RIFLEMAN_FIRST_SHOT_DELAY = 96 / NES_FRAME_RATE;
export const RIFLEMAN_SHOT_INTERVAL = 16 / NES_FRAME_RATE;
export const RIFLEMAN_SHOTS_PER_VOLLEY = 5;
export const RIFLEMAN_BULLET_SPEED = 0.375 * NES_FRAME_RATE * NES_WORLD_Y_SCALE;
export const NINJA_FIRST_SHOT_DELAY = 103 / NES_FRAME_RATE;
export const NINJA_PROJECTILE_SPEED = 300;
export const ROCK_WORLD_SPEED_X = 230;
export const ROCK_WORLD_SPEED_Y = 236;
export const ROCK_IMPACT_DELAY = 24 / NES_FRAME_RATE;
export const ROCK_LIFETIME = 49 / NES_FRAME_RATE;
export const HATCHET_FIRST_SHOT_DELAY = 78 / NES_FRAME_RATE;
export const HATCHET_PROJECTILE_SPEED = 230;
export const FIREBREATHER_FIRST_SHOT_DELAY = 156 / NES_FRAME_RATE;
export const FIREBREATHER_PROJECTILE_SPEED = 250;
export const SPEAR_FIRST_SHOT_DELAY = 72 / NES_FRAME_RATE;
export const SPEAR_PROJECTILE_SPEED = 250;
export const BACKSTABBER_AMBUSH_DROP_SPEED = 45;
export const BACKSTABBER_AMBUSH_DEPTH = 191;
export const BACKSTABBER_AMBUSH_LIFETIME = 407 / NES_FRAME_RATE;
export const BACKSTABBER_RAID_PATH = [[0, 0, 0], [40, 66, -15], [80, 103, 42], [120, 129, 44], [160, 174, 89], [200, 184, 83], [368, 213, 74]] as const;
export const BACKSTABBER_RAID_LIFETIME = 369 / NES_FRAME_RATE;
export const GUNMAN_FIRST_SHOT_DELAY = 39 / NES_FRAME_RATE;
export const GUNMAN_BULLET_SPEED = 266;
export const GUNMAN_LIFETIME = 289 / NES_FRAME_RATE;
export const BANDIT_BILL_FIRST_VOLLEY_DELAY = 107 / NES_FRAME_RATE;
export const BANDIT_BILL_SHOT_INTERVAL = 12 / NES_FRAME_RATE;
export const BANDIT_BILL_VOLLEY_GAP = 72 / NES_FRAME_RATE;
export const BANDIT_BILL_SHOTS_PER_VOLLEY = 4;
export const BANDIT_BILL_BULLET_SPEED = 444;
export const BANDIT_BILL_ENTRY_X_NES = [96, 128, 160, 192] as const;
export const BANDIT_BILL_ENTRY_X_LANES = BANDIT_BILL_ENTRY_X_NES.map((value) => value * NES_WORLD_X_SCALE);
export const BANDIT_BILL_ENTRY_Y_NES = 0;
export const BANDIT_BILL_ENTRY_Y = BANDIT_BILL_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const BANDIT_BILL_ENTRY_END_Y_NES = 64;
export const BANDIT_BILL_ENTRY_END_Y = BANDIT_BILL_ENTRY_END_Y_NES * NES_WORLD_Y_SCALE;
export const BANDIT_BILL_ENTRY_DURATION = 96 / NES_FRAME_RATE;
export const BANDIT_BILL_ENTRY_SPEED_Y = (64 / 96) * NES_FRAME_RATE * NES_WORLD_Y_SCALE;

export function banditBillOpeningY(age: number): number {
  return Math.max(0, Math.min(1, age / BANDIT_BILL_ENTRY_DURATION)) * BANDIT_BILL_ENTRY_END_Y;
}
export const CUTTER_ENTRY_X_NES = [88, 144, 168] as const;
export const CUTTER_ENTRY_X_LANES = CUTTER_ENTRY_X_NES.map((value) => value * NES_WORLD_X_SCALE);
export const CUTTER_ENTRY_Y_NES = 0;
export const CUTTER_ENTRY_Y = CUTTER_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const CUTTER_ENTRY_END_Y_NES = 136;
export const CUTTER_ENTRY_END_Y = CUTTER_ENTRY_END_Y_NES * NES_WORLD_Y_SCALE;
export const CUTTER_ENTRY_DURATION = 324 / NES_FRAME_RATE;
export const CUTTER_ENTRY_SPEED_Y = (136 / 324) * NES_FRAME_RATE * NES_WORLD_Y_SCALE;
export const CUTTER_FIRST_ATTACK_DELAY = 350 / NES_FRAME_RATE;
export const CUTTER_ATTACK_INTERVAL = 256 / NES_FRAME_RATE;
export const CUTTER_BOOMERANG_SPEED = 425;

export function cutterOpeningY(age: number): number {
  return Math.max(0, Math.min(1, age / CUTTER_ENTRY_DURATION)) * CUTTER_ENTRY_END_Y;
}
export const DEVIL_HAWK_ENTRY_X = 0 * NES_WORLD_X_SCALE;
export const DEVIL_HAWK_ENTRY_Y_NES = [128, 168, 208] as const;
export const DEVIL_HAWK_ENTRY_Y_LANES = DEVIL_HAWK_ENTRY_Y_NES.map((value) => value * NES_WORLD_Y_SCALE);
export const DEVIL_HAWK_ENTRY_SPEED_X = (96 / 143) * NES_FRAME_RATE * NES_WORLD_X_SCALE;
export const DEVIL_HAWK_ENTRY_END_X = 96 * NES_WORLD_X_SCALE;
export const DEVIL_HAWK_ENTRY_DURATION = 143 / NES_FRAME_RATE;
export const DEVIL_HAWK_FIRST_VOLLEY_DELAY = 174 / NES_FRAME_RATE;
export const DEVIL_HAWK_VOLLEY_INTERVAL = 125 / NES_FRAME_RATE;
export const DEVIL_HAWK_FIREBALL_SPEED = 3 * NES_FRAME_RATE * NES_WORLD_X_SCALE;

export function devilHawkOpeningX(age: number): number {
  return Math.max(0, Math.min(1, age / DEVIL_HAWK_ENTRY_DURATION)) * DEVIL_HAWK_ENTRY_END_X;
}
export const NINJA_BOSS_ENTRY_X_NES = 64;
export const NINJA_BOSS_ENTRY_X = NINJA_BOSS_ENTRY_X_NES * NES_WORLD_X_SCALE;
export const NINJA_BOSS_ENTRY_Y_NES = 192;
export const NINJA_BOSS_ENTRY_Y = NINJA_BOSS_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const NINJA_BOSS_FIRST_ATTACK_DELAY = 179 / NES_FRAME_RATE;
export const NINJA_BOSS_ATTACK_INTERVAL = 60 / NES_FRAME_RATE;
export const NINJA_BOSS_SHURIKEN_COUNT = 4;
export const NINJA_BOSS_SHURIKEN_SPEED = 405;
export const FATMAN_JOE_ENTRY_X = 0 * NES_WORLD_X_SCALE;
export const FATMAN_JOE_ENTRY_Y_NES = 152;
export const FATMAN_JOE_ENTRY_Y = FATMAN_JOE_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const FATMAN_JOE_ENTRY_END_X_NES = 112;
export const FATMAN_JOE_ENTRY_END_X = FATMAN_JOE_ENTRY_END_X_NES * NES_WORLD_X_SCALE;
export const FATMAN_JOE_ENTRY_DURATION = 170 / NES_FRAME_RATE;
export const FATMAN_JOE_FIRST_VOLLEY_DELAY = 205 / NES_FRAME_RATE;
export const FATMAN_JOE_VOLLEY_INTERVAL = 131 / NES_FRAME_RATE;
export const FATMAN_JOE_VOLLEY_SIZE = 5;

export function fatmanJoeOpeningX(age: number): number {
  return Math.max(0, Math.min(1, age / FATMAN_JOE_ENTRY_DURATION)) * FATMAN_JOE_ENTRY_END_X;
}
export const WINGATE_ENTRY_X = 0 * NES_WORLD_X_SCALE;
export const WINGATE_ENTRY_Y_NES = 152;
export const WINGATE_ENTRY_Y = WINGATE_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const WINGATE_ENTRY_END_X_NES = 98;
export const WINGATE_ENTRY_END_X = WINGATE_ENTRY_END_X_NES * NES_WORLD_X_SCALE;
export const WINGATE_ENTRY_DURATION = 151 / NES_FRAME_RATE;
export const WINGATE_SECOND_ENTRY_Y_NES = 192;
export const WINGATE_SECOND_ENTRY_Y = WINGATE_SECOND_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const WINGATE_SECOND_SPAWN_DELAY = 264 / NES_FRAME_RATE;
export const WINGATE_FIRST_SHOT_DELAY = 4 / NES_FRAME_RATE;
export const WINGATE_SECOND_FIRST_SHOT_DELAY = 277 / NES_FRAME_RATE;
export const WINGATE_SHOT_INTERVAL = 12 / NES_FRAME_RATE;
export const WINGATE_FIRST_VOLLEY_GAP = 24 / NES_FRAME_RATE;
export const WINGATE_SECOND_VOLLEY_GAP = 680 / NES_FRAME_RATE;
export const WINGATE_FIRST_VOLLEY_SIZE = 6;
export const WINGATE_SECOND_VOLLEY_SIZE = 3;
export const WINGATE_BULLET_SPEED = 2 * NES_FRAME_RATE * NES_WORLD_X_SCALE;

export function wingateOpeningX(age: number): number {
  return Math.max(0, Math.min(1, age / WINGATE_ENTRY_DURATION)) * WINGATE_ENTRY_END_X;
}

export function wingateShotCooldown(phase: number, shotsFired: number): number {
  const volleySize = phase === 0 ? WINGATE_FIRST_VOLLEY_SIZE : WINGATE_SECOND_VOLLEY_SIZE;
  if (shotsFired % volleySize !== 0) return WINGATE_SHOT_INTERVAL;
  return phase === 0 ? WINGATE_FIRST_VOLLEY_GAP : WINGATE_SECOND_VOLLEY_GAP;
}


export function banditBillCooldown(shotsFired: number): number {
  return shotsFired % BANDIT_BILL_SHOTS_PER_VOLLEY === 0 ? BANDIT_BILL_VOLLEY_GAP : BANDIT_BILL_SHOT_INTERVAL;
}

export function backstabberRaidOffset(frame: number): readonly [number, number] {
  const nextIndex = BACKSTABBER_RAID_PATH.findIndex(([at]) => at >= frame);
  if (nextIndex < 0) return [BACKSTABBER_RAID_PATH.at(-1)![1], BACKSTABBER_RAID_PATH.at(-1)![2]];
  if (nextIndex === 0) return [BACKSTABBER_RAID_PATH[0][1], BACKSTABBER_RAID_PATH[0][2]];
  const previous = BACKSTABBER_RAID_PATH[nextIndex - 1]!;
  const next = BACKSTABBER_RAID_PATH[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return [previous[1] + (next[1] - previous[1]) * amount, previous[2] + (next[2] - previous[2]) * amount];
}

export const SHOP_CHECKPOINTS: readonly (readonly number[])[] = [
  [560, 1_180],
  [500, 1_120],
  [420, 860, 1_300],
  [560, 1_180],
  [420, 1_160],
  [420, 1_050, 1_250],
];

export type ShopType = "weapons" | "supplies";
export const SHOP_TYPES: readonly (readonly ShopType[])[] = [
  ["weapons", "supplies"],
  ["weapons", "supplies"],
  ["weapons", "supplies", "weapons"],
  ["weapons", "supplies"],
  ["weapons", "supplies"],
  ["weapons", "supplies", "weapons"],
];
export const SHOP_X_OFFSETS: readonly (readonly number[])[] = [
  [180, -180],
  [180, -180],
  [-180, 180, 0],
  [-180, 180],
  [180, -180],
  [180, -180, 0],
];

export const ROAD_WIDTHS = [730, 450, 430, 500, 650, 540] as const;
export const WANTED_COSTS = [20_000, 24_000, 50_000, 40_000, 40_000, 60_000] as const;
export const BOSS_REWARDS = [10_000, 12_000, 25_000, 20_000, 20_000, 30_000] as const;
export const WANTED_X_OFFSETS = ROUND_WANTED_X_NES.map((value) => value * (960 / 256) - 480);

export const ROUND_ENEMY_TYPES: readonly (readonly EnemyType[])[] = [
  ["gunman", "bomber", "sniper", "backstabber", "shotgunner"],
  ["gunman", "backstabber", "rifleman"],
  ["gunman", "spear", "sniper", "firebreather", "hatchet"],
  ["ninja", "gunman", "sniper", "shotgunner"],
  ["gunman", "rifleman", "bomber", "backstabber"],
  ["gunman", "sniper", "bomber", "backstabber"],
];

export type Formation = "line" | "wedge" | "cross" | "rear";
export type LandmarkType = "town" | "rock" | "village" | "cliff" | "forest" | "cemetery" | "open";

export interface RoundSegment {
  at: number;
  formation: Formation;
  enemyTypes: readonly EnemyType[];
  interval: number;
  landmark: LandmarkType;
}

export interface RoundObstacle {
  at: number;
  length: number;
  x: number;
  width: number;
  kind: "boulder" | "tree" | "grave";
}

export const ROUND_SEGMENTS: readonly (readonly RoundSegment[])[] = [
  [{ at: 146, formation: "line", enemyTypes: ["gunman", "bomber"], interval: 1.1, landmark: "town" }, { at: 416, formation: "wedge", enemyTypes: ["sniper", "backstabber"], interval: 1, landmark: "town" }, { at: 551, formation: "line", enemyTypes: ["gunman", "bomber"], interval: 0.9, landmark: "open" }, { at: 731, formation: "cross", enemyTypes: ["gunman", "sniper", "shotgunner"], interval: 0.8, landmark: "town" }],
  [{ at: 146, formation: "wedge", enemyTypes: ["gunman", "rifleman"], interval: 1, landmark: "rock" }, { at: 500, formation: "line", enemyTypes: ["backstabber", "rifleman"], interval: 0.9, landmark: "rock" }, { at: 1_050, formation: "cross", enemyTypes: ["gunman", "rifleman"], interval: 0.8, landmark: "rock" }, { at: 1_500, formation: "wedge", enemyTypes: ["rifleman", "backstabber"], interval: 0.75, landmark: "rock" }],
  [{ at: 146, formation: "line", enemyTypes: ["gunman", "sniper"], interval: 1, landmark: "village" }, { at: 420, formation: "cross", enemyTypes: ["spear", "firebreather"], interval: 0.9, landmark: "village" }, { at: 980, formation: "wedge", enemyTypes: ["sniper", "firebreather"], interval: 0.8, landmark: "village" }, { at: 1_480, formation: "line", enemyTypes: ["gunman", "spear", "hatchet"], interval: 0.72, landmark: "village" }],
  [{ at: 146, formation: "rear", enemyTypes: ["gunman", "ninja"], interval: 1, landmark: "cliff" }, { at: 480, formation: "wedge", enemyTypes: ["ninja", "shotgunner"], interval: 0.86, landmark: "open" }, { at: 1_020, formation: "cross", enemyTypes: ["sniper", "gunman"], interval: 0.78, landmark: "cliff" }, { at: 1_520, formation: "rear", enemyTypes: ["gunman", "shotgunner"], interval: 0.7, landmark: "open" }],
  [{ at: 146, formation: "line", enemyTypes: ["gunman", "rifleman"], interval: 1, landmark: "forest" }, { at: 420, formation: "wedge", enemyTypes: ["bomber", "backstabber"], interval: 0.9, landmark: "forest" }, { at: 980, formation: "line", enemyTypes: ["rifleman", "bomber"], interval: 0.78, landmark: "forest" }, { at: 1_480, formation: "cross", enemyTypes: ["gunman", "backstabber"], interval: 0.68, landmark: "forest" }],
  [{ at: 146, formation: "cross", enemyTypes: ["gunman", "sniper"], interval: 1, landmark: "cemetery" }, { at: 420, formation: "rear", enemyTypes: ["bomber", "backstabber"], interval: 0.86, landmark: "open" }, { at: 980, formation: "wedge", enemyTypes: ["sniper", "gunman"], interval: 0.74, landmark: "cemetery" }, { at: 1_500, formation: "cross", enemyTypes: ["bomber", "backstabber"], interval: 0.64, landmark: "open" }],
];

// Obstacles are gameplay-space blockers, separate from decorative landmarks.
// Their coordinates are intentionally data-driven so a later ROM trace can replace them.
export const ROUND_OBSTACLES: readonly (readonly RoundObstacle[])[] = [
  [],
  [
    { at: 690, length: 150, x: 300, width: 92, kind: "boulder" },
    { at: 1_120, length: 130, x: 660, width: 104, kind: "boulder" },
  ],
  [],
  [
    { at: 680, length: 180, x: 350, width: 98, kind: "boulder" },
    { at: 1_240, length: 150, x: 620, width: 112, kind: "boulder" },
    { at: 1_660, length: 170, x: 390, width: 86, kind: "boulder" },
  ],
  [
    { at: 680, length: 150, x: 285, width: 112, kind: "tree" },
    { at: 960, length: 180, x: 690, width: 132, kind: "tree" },
    { at: 1_250, length: 130, x: 470, width: 92, kind: "tree" },
    { at: 1_480, length: 160, x: 300, width: 124, kind: "tree" },
    { at: 1_780, length: 150, x: 660, width: 128, kind: "tree" },
    { at: 2_050, length: 130, x: 460, width: 100, kind: "tree" },
  ],
  [
    { at: 660, length: 120, x: 330, width: 82, kind: "grave" },
    { at: 920, length: 150, x: 650, width: 94, kind: "grave" },
    { at: 1_280, length: 130, x: 420, width: 86, kind: "grave" },
    { at: 1_600, length: 150, x: 700, width: 104, kind: "grave" },
  ],
];

export type WeaponName = "pistol" | "shotgun" | "machinegun" | "magnum";

export const SHOP_COSTS = {
  shotgun: 6_000,
  machinegun: 10_000,
  magnum: 20_000,
  horse: 20_000,
  ammo: 1_500,
  smartBomb: 8_000,
} as const;
export const SMART_BOMB_CAPACITY = 1;

export const WEAPONS: Record<WeaponName, { cost: number; interval: number; damage: number; maxAmmo: number }> = {
  pistol: { cost: 0, interval: 0.16, damage: 1, maxAmmo: Number.POSITIVE_INFINITY },
  shotgun: { cost: SHOP_COSTS.shotgun, interval: 0.2, damage: 1, maxAmmo: 120 },
  machinegun: { cost: SHOP_COSTS.machinegun, interval: 0.08, damage: 1, maxAmmo: 400 },
  magnum: { cost: SHOP_COSTS.magnum, interval: 0.24, damage: 3, maxAmmo: 100 },
};

export const AMMO_GAIN: Record<WeaponName, number> = {
  pistol: 0,
  shotgun: 20,
  machinegun: 40,
  magnum: 10,
};

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function shouldLoopStage(scroll: number, round: number, hasWanted: boolean): boolean {
  return scroll >= (ROUND_LENGTHS[round - 1] ?? ROUND_LENGTHS[0]!) && !hasWanted;
}

export function shouldRevealWanted(scroll: number, round: number, hasWanted: boolean, spawned: boolean): boolean {
  return !hasWanted && !spawned && scroll >= (WANTED_REVEAL_AT[round - 1] ?? ROUND_BOSS_TRIGGERS[round - 1] ?? ROUND_BOSS_TRIGGERS[0]!);
}

export function segmentDelay(scroll: number, at: number, speed: number): number {
  return Math.max(0, (at - scroll) / speed);
}

export function obstacleBlocks(obstacle: RoundObstacle, x: number, y: number, radius = 18): boolean {
  return y >= obstacle.at - radius && y <= obstacle.at + obstacle.length + radius &&
    x >= obstacle.x - obstacle.width / 2 - radius && x <= obstacle.x + obstacle.width / 2 + radius;
}

export function unitMaxAge(kind: "boss" | "enemy" | "pickup" | "projectile"): number {
  return kind === "boss" ? Number.POSITIVE_INFINITY : kind === "projectile" ? 2.5 : 18;
}

export function bossReward(stage: number, phase = 0): number {
  if (stage === MAX_STAGE && phase === 0) return 0;
  return BOSS_REWARDS[stage - 1] ?? 0;
}

export function formationEntryY(scroll: number, bossEncounter = false): number {
  return scroll + (bossEncounter ? -40 : 55);
}

export function spendPoints(points: number, cost: number): number | undefined {
  return points >= cost ? points - cost : undefined;
}

export function nextExtraLifeScore(currentThreshold: number): number {
  return currentThreshold === 30_000 ? 100_000 : currentThreshold + 100_000;
}

export function scoreExtraLives(score: number, threshold: number): { lives: number; nextThreshold: number } {
  let lives = 0;
  let nextThreshold = threshold;
  while (score >= nextThreshold) {
    lives += 1;
    nextThreshold = nextExtraLifeScore(nextThreshold);
  }
  return { lives, nextThreshold };
}
