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

export const STAGE_LENGTH = 2_200;
export const BOSS_TRIGGER = 1_820;
export const MAX_STAGE = STAGES.length;
export const NES_FRAME_RATE = 60.098;
export const NES_SCROLL_SPEED = 20 * (NES_FRAME_RATE / 60);
export const WORLD_SCROLL_SPEED = NES_SCROLL_SPEED * (540 / 240);
export const NES_PLAYER_SPEED = 75 * (NES_FRAME_RATE / 60);
export const WORLD_PLAYER_SPEED = NES_PLAYER_SPEED * (540 / 240);
export const BOOTS_SPEED_MULTIPLIER = 1.2;
export const NES_BULLET_SPEED = 6 * NES_FRAME_RATE;
export const WORLD_BULLET_SPEED = NES_BULLET_SPEED * (540 / 240);
export const MAGNUM_BULLET_SPEED = WORLD_BULLET_SPEED * 0.75;
export const MAGNUM_BULLET_LIFETIME = 0.8;
export const NES_DIAGONAL_BULLET_X = 2.5 * NES_FRAME_RATE;
export const NES_DIAGONAL_BULLET_Y = 5 * NES_FRAME_RATE;
export const WORLD_DIAGONAL_BULLET_X = NES_DIAGONAL_BULLET_X * (540 / 240);
export const WORLD_DIAGONAL_BULLET_Y = NES_DIAGONAL_BULLET_Y * (540 / 240);
export const PISTOL_BULLET_LIFETIME = 15 / NES_FRAME_RATE;
export const RIFLE_RANGE_MULTIPLIER = 1.6;

export const SHOP_CHECKPOINTS: readonly (readonly number[])[] = [
  [560, 1_180],
  [500, 1_120],
  [420, 860, 1_300],
  [560, 1_180],
  [420, 1_160],
  [420, 860, 1_300],
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

export const ROAD_WIDTHS = [730, 450, 430, 500, 650, 540] as const;
export const WANTED_COSTS = [20_000, 24_000, 50_000, 40_000, 40_000, 60_000] as const;
export const BOSS_REWARDS = [10_000, 12_000, 25_000, 20_000, 20_000, 30_000] as const;
export const WANTED_X_OFFSETS = [-220, -170, -150, -150, 180, 0] as const;

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

export interface RoundItemEvent {
  at: number;
  xOffset: number;
  item: ItemType;
  loopOnly?: boolean;
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

export const ROUND_ITEM_EVENTS: readonly (readonly RoundItemEvent[])[] = [
  [{ at: 220, xOffset: 170, item: "rifle" }, { at: 360, xOffset: -150, item: "money" }, { at: 720, xOffset: 0, item: "boots" }, { at: 900, xOffset: 140, item: "money" }, { at: 1_180, xOffset: 170, item: "horse" }, { at: 1_480, xOffset: -170, item: "pow" }, { at: 1_600, xOffset: 120, item: "blueYashichi" }, { at: 1_700, xOffset: -130, item: "redYashichi" }, { at: 1_780, xOffset: -40, item: "pow" }],
  [{ at: 260, xOffset: 140, item: "skull" }, { at: 300, xOffset: -170, item: "horse", loopOnly: true }, { at: 520, xOffset: -140, item: "blueYashichi" }, { at: 780, xOffset: 160, item: "redYashichi" }, { at: 920, xOffset: -150, item: "skull" }, { at: 1_520, xOffset: 0, item: "pow" }],
  [{ at: 240, xOffset: -150, item: "pow" }, { at: 480, xOffset: 150, item: "redYashichi" }, { at: 560, xOffset: 150, item: "skull" }, { at: 820, xOffset: -120, item: "blueYashichi" }, { at: 1_360, xOffset: -150, item: "skull" }, { at: 1_520, xOffset: 0, item: "redYashichi" }],
  [{ at: 300, xOffset: -160, item: "blueYashichi" }, { at: 680, xOffset: 150, item: "redYashichi" }, { at: 900, xOffset: -150, item: "redYashichi" }, { at: 1_040, xOffset: -120, item: "pow" }, { at: 1_300, xOffset: 140, item: "blueYashichi" }, { at: 1_440, xOffset: 120, item: "redYashichi" }],
  [{ at: 240, xOffset: -150, item: "blueYashichi" }, { at: 700, xOffset: 140, item: "redYashichi" }, { at: 1_020, xOffset: -100, item: "pow" }, { at: 1_240, xOffset: 160, item: "skull" }, { at: 1_440, xOffset: 120, item: "skull" }],
  [{ at: 260, xOffset: 0, item: "pow" }, { at: 620, xOffset: -150, item: "blueYashichi" }, { at: 1_000, xOffset: 140, item: "redYashichi" }, { at: 1_420, xOffset: 0, item: "redYashichi" }, { at: 1_560, xOffset: -80, item: "pow" }],
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

export function shouldLoopStage(scroll: number, hasWanted: boolean): boolean {
  return scroll >= STAGE_LENGTH && !hasWanted;
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
