export interface StageDefinition {
  name: string;
  boss: string;
  bossHp: number;
}

export type EnemyType = "gunman" | "rifleman" | "bomber" | "sniper" | "backstabber" | "ninja" | "hatchet" | "firebreather" | "shotgunner";
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

export const SHOP_CHECKPOINTS: readonly (readonly number[])[] = [
  [560, 1_180],
  [500, 1_120],
  [420, 860, 1_300],
  [560, 1_180],
  [420, 1_160],
  [420, 860, 1_300],
];

export const ROAD_WIDTHS = [520, 450, 430, 500, 650, 540] as const;
export const WANTED_COSTS = [200, 240, 500, 500, 600, 800] as const;
export const WANTED_X_OFFSETS = [-220, 160, -150, 180, -200, 0] as const;

export const ROUND_ENEMY_TYPES: readonly (readonly EnemyType[])[] = [
  ["gunman", "bomber", "sniper", "backstabber"],
  ["gunman", "backstabber", "rifleman"],
  ["gunman", "hatchet", "sniper", "firebreather"],
  ["ninja", "gunman", "sniper", "shotgunner"],
  ["gunman", "rifleman", "bomber", "backstabber"],
  ["gunman", "sniper", "bomber", "backstabber"],
];

export type Formation = "line" | "wedge" | "cross" | "rear";

export interface RoundSegment {
  at: number;
  formation: Formation;
  enemyTypes: readonly EnemyType[];
  interval: number;
}

export const ROUND_SEGMENTS: readonly (readonly RoundSegment[])[] = [
  [{ at: 0, formation: "line", enemyTypes: ["gunman", "bomber"], interval: 1.1 }, { at: 420, formation: "wedge", enemyTypes: ["sniper", "backstabber"], interval: 1 }, { at: 980, formation: "line", enemyTypes: ["gunman", "bomber"], interval: 0.9 }, { at: 1_500, formation: "cross", enemyTypes: ["gunman", "sniper"], interval: 0.8 }],
  [{ at: 0, formation: "wedge", enemyTypes: ["gunman", "rifleman"], interval: 1 }, { at: 500, formation: "line", enemyTypes: ["backstabber", "rifleman"], interval: 0.9 }, { at: 1_050, formation: "cross", enemyTypes: ["gunman", "shotgunner"], interval: 0.8 }, { at: 1_500, formation: "wedge", enemyTypes: ["rifleman", "backstabber"], interval: 0.75 }],
  [{ at: 0, formation: "line", enemyTypes: ["gunman", "sniper"], interval: 1 }, { at: 420, formation: "cross", enemyTypes: ["hatchet", "firebreather"], interval: 0.9 }, { at: 980, formation: "wedge", enemyTypes: ["sniper", "firebreather"], interval: 0.8 }, { at: 1_480, formation: "line", enemyTypes: ["gunman", "hatchet"], interval: 0.72 }],
  [{ at: 0, formation: "rear", enemyTypes: ["gunman", "ninja"], interval: 1 }, { at: 480, formation: "wedge", enemyTypes: ["ninja", "shotgunner"], interval: 0.86 }, { at: 1_020, formation: "cross", enemyTypes: ["sniper", "gunman"], interval: 0.78 }, { at: 1_520, formation: "rear", enemyTypes: ["gunman", "shotgunner"], interval: 0.7 }],
  [{ at: 0, formation: "line", enemyTypes: ["gunman", "rifleman"], interval: 1 }, { at: 420, formation: "wedge", enemyTypes: ["bomber", "backstabber"], interval: 0.9 }, { at: 980, formation: "line", enemyTypes: ["rifleman", "bomber"], interval: 0.78 }, { at: 1_480, formation: "cross", enemyTypes: ["gunman", "backstabber"], interval: 0.68 }],
  [{ at: 0, formation: "cross", enemyTypes: ["gunman", "sniper"], interval: 1 }, { at: 420, formation: "rear", enemyTypes: ["bomber", "backstabber"], interval: 0.86 }, { at: 980, formation: "wedge", enemyTypes: ["sniper", "gunman"], interval: 0.74 }, { at: 1_500, formation: "cross", enemyTypes: ["bomber", "backstabber"], interval: 0.64 }],
];

export const ROUND_ITEM_TYPES: readonly (readonly ItemType[])[] = [
  ["rifle", "money", "boots", "pow", "horse", "blueYashichi", "redYashichi"],
  ["money", "skull", "blueYashichi", "redYashichi", "horse", "pow"],
  ["pow", "redYashichi", "skull", "blueYashichi", "horse", "ammo"],
  ["blueYashichi", "redYashichi", "pow", "ammo", "horse"],
  ["blueYashichi", "redYashichi", "pow", "skull", "horse", "ammo"],
  ["pow", "blueYashichi", "redYashichi", "horse", "ammo", "money"],
];

export type WeaponName = "pistol" | "shotgun" | "machinegun" | "magnum";

export const WEAPONS: Record<WeaponName, { cost: number; interval: number; damage: number; spread: number; maxAmmo: number }> = {
  pistol: { cost: 0, interval: 0.16, damage: 1, spread: 0, maxAmmo: Number.POSITIVE_INFINITY },
  shotgun: { cost: 40, interval: 0.2, damage: 1, spread: 0.28, maxAmmo: 30 },
  machinegun: { cost: 80, interval: 0.08, damage: 1, spread: 0, maxAmmo: 80 },
  magnum: { cost: 120, interval: 0.24, damage: 3, spread: 0, maxAmmo: 24 },
};

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
