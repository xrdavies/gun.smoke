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

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
