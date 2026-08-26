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
export const NES_SCROLL_SPEED = 20;
export const WORLD_SCROLL_SPEED = NES_SCROLL_SPEED * (540 / 240);
export const NES_PLAYER_SPEED = 75;
export const WORLD_PLAYER_SPEED = NES_PLAYER_SPEED * (540 / 240);
export const BOOTS_SPEED_MULTIPLIER = 1.2;
export const NES_BULLET_SPEED = 360;
export const WORLD_BULLET_SPEED = NES_BULLET_SPEED * (540 / 240);
export const NES_DIAGONAL_BULLET_X = 150;
export const NES_DIAGONAL_BULLET_Y = 300;
export const WORLD_DIAGONAL_BULLET_X = NES_DIAGONAL_BULLET_X * (540 / 240);
export const WORLD_DIAGONAL_BULLET_Y = NES_DIAGONAL_BULLET_Y * (540 / 240);
export const PISTOL_BULLET_LIFETIME = 0.25;
export const RIFLE_RANGE_MULTIPLIER = 1.6;

export const SHOP_CHECKPOINTS: readonly (readonly number[])[] = [
  [560, 1_180],
  [500, 1_120],
  [420, 860, 1_300],
  [560, 1_180],
  [420, 1_160],
  [420, 860, 1_300],
];

export const ROAD_WIDTHS = [520, 450, 430, 500, 650, 540] as const;
export const WANTED_COSTS = [20_000, 24_000, 50_000, 50_000, 50_000, 50_000] as const;
export const WANTED_X_OFFSETS = [-220, 160, -150, 180, -200, 0] as const;

export const ROUND_ENEMY_TYPES: readonly (readonly EnemyType[])[] = [
  ["gunman", "bomber", "sniper", "backstabber"],
  ["gunman", "backstabber", "rifleman"],
  ["gunman", "spear", "sniper", "firebreather"],
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
}

export const ROUND_SEGMENTS: readonly (readonly RoundSegment[])[] = [
  [{ at: 146, formation: "line", enemyTypes: ["gunman", "bomber"], interval: 1.1, landmark: "town" }, { at: 416, formation: "wedge", enemyTypes: ["sniper", "backstabber"], interval: 1, landmark: "town" }, { at: 551, formation: "line", enemyTypes: ["gunman", "bomber"], interval: 0.9, landmark: "open" }, { at: 731, formation: "cross", enemyTypes: ["gunman", "sniper"], interval: 0.8, landmark: "town" }],
  [{ at: 146, formation: "wedge", enemyTypes: ["gunman", "rifleman"], interval: 1, landmark: "rock" }, { at: 500, formation: "line", enemyTypes: ["backstabber", "rifleman"], interval: 0.9, landmark: "rock" }, { at: 1_050, formation: "cross", enemyTypes: ["gunman", "shotgunner"], interval: 0.8, landmark: "rock" }, { at: 1_500, formation: "wedge", enemyTypes: ["rifleman", "backstabber"], interval: 0.75, landmark: "rock" }],
  [{ at: 146, formation: "line", enemyTypes: ["gunman", "sniper"], interval: 1, landmark: "village" }, { at: 420, formation: "cross", enemyTypes: ["spear", "firebreather"], interval: 0.9, landmark: "village" }, { at: 980, formation: "wedge", enemyTypes: ["sniper", "firebreather"], interval: 0.8, landmark: "village" }, { at: 1_480, formation: "line", enemyTypes: ["gunman", "spear"], interval: 0.72, landmark: "village" }],
  [{ at: 146, formation: "rear", enemyTypes: ["gunman", "ninja"], interval: 1, landmark: "cliff" }, { at: 480, formation: "wedge", enemyTypes: ["ninja", "shotgunner"], interval: 0.86, landmark: "open" }, { at: 1_020, formation: "cross", enemyTypes: ["sniper", "gunman"], interval: 0.78, landmark: "cliff" }, { at: 1_520, formation: "rear", enemyTypes: ["gunman", "shotgunner"], interval: 0.7, landmark: "open" }],
  [{ at: 146, formation: "line", enemyTypes: ["gunman", "rifleman"], interval: 1, landmark: "forest" }, { at: 420, formation: "wedge", enemyTypes: ["bomber", "backstabber"], interval: 0.9, landmark: "forest" }, { at: 980, formation: "line", enemyTypes: ["rifleman", "bomber"], interval: 0.78, landmark: "forest" }, { at: 1_480, formation: "cross", enemyTypes: ["gunman", "backstabber"], interval: 0.68, landmark: "forest" }],
  [{ at: 146, formation: "cross", enemyTypes: ["gunman", "sniper"], interval: 1, landmark: "cemetery" }, { at: 420, formation: "rear", enemyTypes: ["bomber", "backstabber"], interval: 0.86, landmark: "open" }, { at: 980, formation: "wedge", enemyTypes: ["sniper", "gunman"], interval: 0.74, landmark: "cemetery" }, { at: 1_500, formation: "cross", enemyTypes: ["bomber", "backstabber"], interval: 0.64, landmark: "open" }],
];

export const ROUND_ITEM_TYPES: readonly (readonly ItemType[])[] = [
  ["rifle", "money", "boots", "pow", "horse", "blueYashichi", "redYashichi"],
  ["money", "skull", "blueYashichi", "redYashichi", "horse", "pow"],
  ["pow", "redYashichi", "skull", "blueYashichi", "horse", "ammo"],
  ["blueYashichi", "redYashichi", "pow", "ammo", "horse"],
  ["blueYashichi", "redYashichi", "pow", "skull", "horse", "ammo"],
  ["pow", "blueYashichi", "redYashichi", "horse", "ammo", "money"],
];

export const ROUND_ITEM_EVENTS: readonly (readonly RoundItemEvent[])[] = [
  [{ at: 220, xOffset: 170, item: "rifle" }, { at: 360, xOffset: -150, item: "money" }, { at: 720, xOffset: 0, item: "boots" }, { at: 1_180, xOffset: 170, item: "horse" }, { at: 1_480, xOffset: -170, item: "pow" }],
  [{ at: 260, xOffset: 140, item: "skull" }, { at: 520, xOffset: -140, item: "blueYashichi" }, { at: 780, xOffset: 160, item: "redYashichi" }, { at: 1_160, xOffset: -120, item: "horse" }, { at: 1_520, xOffset: 0, item: "pow" }],
  [{ at: 240, xOffset: -150, item: "pow" }, { at: 480, xOffset: 150, item: "redYashichi" }, { at: 820, xOffset: -120, item: "blueYashichi" }, { at: 1_220, xOffset: 130, item: "skull" }, { at: 1_520, xOffset: 0, item: "horse" }],
  [{ at: 300, xOffset: -160, item: "blueYashichi" }, { at: 680, xOffset: 150, item: "redYashichi" }, { at: 1_040, xOffset: -120, item: "pow" }, { at: 1_440, xOffset: 120, item: "redYashichi" }],
  [{ at: 240, xOffset: -150, item: "blueYashichi" }, { at: 700, xOffset: 140, item: "redYashichi" }, { at: 1_020, xOffset: -100, item: "pow" }, { at: 1_440, xOffset: 120, item: "skull" }],
  [{ at: 260, xOffset: 0, item: "pow" }, { at: 620, xOffset: -150, item: "blueYashichi" }, { at: 1_000, xOffset: 140, item: "redYashichi" }, { at: 1_420, xOffset: 0, item: "pow" }],
];

export type WeaponName = "pistol" | "shotgun" | "machinegun" | "magnum";

export const SHOP_COSTS = {
  shotgun: 4_000,
  machinegun: 8_000,
  magnum: 12_000,
  horse: 6_000,
  ammo: 2_000,
  smartBomb: 10_000,
} as const;

export const WEAPONS: Record<WeaponName, { cost: number; interval: number; damage: number; spread: number; maxAmmo: number }> = {
  pistol: { cost: 0, interval: 0.16, damage: 1, spread: 0, maxAmmo: Number.POSITIVE_INFINITY },
  shotgun: { cost: SHOP_COSTS.shotgun, interval: 0.2, damage: 1, spread: 0.28, maxAmmo: 30 },
  machinegun: { cost: SHOP_COSTS.machinegun, interval: 0.08, damage: 1, spread: 0, maxAmmo: 80 },
  magnum: { cost: SHOP_COSTS.magnum, interval: 0.24, damage: 3, spread: 0, maxAmmo: 24 },
};

export const AMMO_GAIN: Record<WeaponName, number> = {
  pistol: 0,
  shotgun: 5,
  machinegun: 10,
  magnum: 3,
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
