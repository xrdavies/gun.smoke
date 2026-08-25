export interface StageDefinition {
  name: string;
  boss: string;
  bossHp: number;
}

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

export type WeaponName = "pistol" | "shotgun" | "machinegun" | "magnum";

export const WEAPONS: Record<WeaponName, { cost: number; interval: number; damage: number; spread: number }> = {
  pistol: { cost: 0, interval: 0.16, damage: 1, spread: 0 },
  shotgun: { cost: 40, interval: 0.2, damage: 1, spread: 0.28 },
  machinegun: { cost: 80, interval: 0.08, damage: 1, spread: 0 },
  magnum: { cost: 120, interval: 0.24, damage: 3, spread: 0 },
};

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
