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
export const MAX_SCORE = 999_990;
export const BLUE_YASHICHI_DURATION = 180 / NES_FRAME_RATE;
export const HORSE_HIT_INVULNERABILITY = 60 / NES_FRAME_RATE;
export const MAX_POWERUP_STOCK = 4;
export const POWERUP_OVERFLOW_SCORE = 100;
export const PLAYER_DEATH_ANIMATION_DURATION = 152 / NES_FRAME_RATE;
export const PLAYER_RESPAWN_HIDDEN_DURATION = 100 / NES_FRAME_RATE;
export const PLAYER_RESPAWN_READY_DURATION = 40 / NES_FRAME_RATE;
export const PLAYER_DEATH_RECOVERY_DURATION = PLAYER_DEATH_ANIMATION_DURATION + PLAYER_RESPAWN_HIDDEN_DURATION + PLAYER_RESPAWN_READY_DURATION;

export function playerDeathPhase(age: number): "dying" | "hidden" | "ready" | "active" {
  if (age < PLAYER_DEATH_ANIMATION_DURATION) return "dying";
  if (age < PLAYER_DEATH_ANIMATION_DURATION + PLAYER_RESPAWN_HIDDEN_DURATION) return "hidden";
  if (age < PLAYER_DEATH_RECOVERY_DURATION) return "ready";
  return "active";
}

export function storedPowerupPickup(stock: number): { stock: number; score: number } {
  return stock >= MAX_POWERUP_STOCK ? { stock: MAX_POWERUP_STOCK, score: POWERUP_OVERFLOW_SCORE } : { stock: stock + 1, score: 0 };
}

export function addScore(score: number, points: number): number {
  return Math.min(MAX_SCORE, Math.max(0, score + points));
}

export const WORLD_VIEWPORT_HEIGHT = 540;
export const NES_WORLD_Y_SCALE = WORLD_VIEWPORT_HEIGHT / 240;
export const NES_WORLD_X_SCALE = 960 / 256;
export const PLAYER_ENTRY_X_NES = 136;
export const PLAYER_ENTRY_Y_NES = 188;
export const PLAYER_ENTRY_X = PLAYER_ENTRY_X_NES * NES_WORLD_X_SCALE;
export const PLAYER_ENTRY_Y = PLAYER_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
const NES_AIM_HEADINGS = [
  [8, 9, 10, 11, 12], [16, 15, 14, 13, 12], [16, 17, 18, 19, 20], [24, 23, 22, 21, 20],
  [8, 7, 6, 5, 4], [0, 1, 2, 3, 4], [0, 31, 30, 29, 28], [24, 25, 26, 27, 28],
] as const;

export function nesAimHeading(originX: number, originY: number, targetX: number, targetY: number): number {
  const dx = Math.round(targetX / NES_WORLD_X_SCALE) - Math.round(originX / NES_WORLD_X_SCALE);
  const dy = Math.round(targetY / NES_WORLD_Y_SCALE) - Math.round(originY / NES_WORLD_Y_SCALE);
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  const verticalDominant = absX < absY;
  let quadrant = (dy < 0 ? 4 : 0) + (dx < 0 ? 2 : 0);
  if (verticalDominant ? quadrant === 0 || quadrant === 4 : quadrant === 2 || quadrant === 6) quadrant += 1;
  const minor = Math.min(absX, absY);
  const major = Math.max(absX, absY);
  const step = major >> 3;
  let band = 0;
  let threshold = step;
  while (band < 4 && threshold < minor) {
    band += 1;
    threshold += step * 2;
  }
  return NES_AIM_HEADINGS[quadrant]![band]!;
}
export const ROUND_BOSS_GATE_SCROLL_NES = [2_767, 2_799, 4_863, 3_487, 2_879, 4_879] as const;
export const ROUND_LOOP_SCROLL_NES = [3_087, 3_055, 5_119, 3_839, 3_055, 5_119] as const;
export const ROUND_BOSS_TRIGGERS = ROUND_BOSS_GATE_SCROLL_NES.map((value) => value * NES_WORLD_Y_SCALE);
export const ROUND_LENGTHS = ROUND_LOOP_SCROLL_NES.map((value) => value * NES_WORLD_Y_SCALE);
export const ROUND2_LOOP_HORSE_X = 310;
export const ROUND2_LOOP_HORSE_Y = 300;
export const NES_SCROLL_SPEED = 20 * (NES_FRAME_RATE / 60);
export const WORLD_SCROLL_SPEED = NES_SCROLL_SPEED * NES_WORLD_Y_SCALE;
// ROM object Y advances with the camera scroll plus one screen-speed descent.
export const ROM_OBJECT_DROP_SPEED = WORLD_SCROLL_SPEED * 2;
export const ROM_ENEMY_SCREEN_MAX_Y_NES = 160;
export const ROM_ENEMY_SCREEN_MAX_Y = ROM_ENEMY_SCREEN_MAX_Y_NES * NES_WORLD_Y_SCALE;
export const NES_PLAYER_SPEED = 75 * (NES_FRAME_RATE / 60);
export const WORLD_PLAYER_SPEED = NES_PLAYER_SPEED * NES_WORLD_Y_SCALE;
export const BOOTS_SPEED_MULTIPLIER = 4 / 3;
export const NES_BULLET_SPEED = 6 * NES_FRAME_RATE;
export const WORLD_BULLET_SPEED = NES_BULLET_SPEED * NES_WORLD_Y_SCALE;
export const PLAYER_BULLET_CAPACITY = 6;
export const ENEMY_PROJECTILE_CAPACITY = 8;
export const BOSS_PROJECTILE_CAPACITY = 6;
export const EMPTY_BARREL_EXPLOSION_LIFETIME = 10 / NES_FRAME_RATE;
export const MAGNUM_BULLET_SPEED = WORLD_BULLET_SPEED;
export const MAGNUM_BULLET_LIFETIME = 34 / NES_FRAME_RATE;
export const SHOTGUN_BULLET_LIFETIME = 11 / NES_FRAME_RATE;
export const MACHINE_GUN_BULLET_LIFETIME = 15 / NES_FRAME_RATE;
export const NES_DIAGONAL_BULLET_X = 2.5 * NES_FRAME_RATE;
export const NES_DIAGONAL_BULLET_Y = 5 * NES_FRAME_RATE;
export const WORLD_DIAGONAL_BULLET_X = NES_DIAGONAL_BULLET_X * NES_WORLD_Y_SCALE;
export const WORLD_DIAGONAL_BULLET_Y = NES_DIAGONAL_BULLET_Y * NES_WORLD_Y_SCALE;
export const PISTOL_BULLET_LIFETIME = 15 / NES_FRAME_RATE;
export const RIFLE_BULLET_SPEED_MULTIPLIER = 4 / 3;

export function canSpawnPlayerBullet(active: number): boolean {
  return active < PLAYER_BULLET_CAPACITY;
}

export function canSpawnEnemyProjectile(active: number, requested = 1): boolean {
  return active + requested <= ENEMY_PROJECTILE_CAPACITY;
}

export function canSpawnBossProjectile(active: number, requested = 1): boolean {
  return active + requested <= BOSS_PROJECTILE_CAPACITY;
}

export function pistolBulletSpeedFactor(rifleStock: number): number {
  return rifleStock > 0 ? RIFLE_BULLET_SPEED_MULTIPLIER : 1;
}

export function romEnemyDrop(flags: number, hasSpecialStock: boolean): "ammo" | "moneyBag" | undefined {
  return flags & 0x80 ? hasSpecialStock ? "ammo" : "moneyBag" : undefined;
}

const ROM_ENEMY_SCORES: Readonly<Record<number, number>> = {
  1: 100, 2: 100, 3: 300, 4: 300, 5: 100, 6: 100, 7: 100, 8: 100, 9: 100,
  10: 400, 11: 100, 12: 200, 13: 200, 14: 200, 15: 200, 16: 200, 17: 200,
  19: 400, 20: 400, 21: 100, 22: 100,
};

export function romEnemyScore(entityCode: number): number {
  return ROM_ENEMY_SCORES[entityCode] ?? 100;
}

export function pistolShots(left: boolean, right: boolean): readonly { direction: number; offset: number }[] {
  return left && right
    ? [{ direction: 0, offset: -8 }, { direction: 0, offset: 8 }]
    : [{ direction: left ? -1 : 1, offset: -8 }, { direction: left ? -1 : 1, offset: 8 }];
}

export function pistolVelocities(left: boolean, right: boolean): readonly (readonly [number, number, number])[] {
  if (left && right) return [[0, -6, -8], [0, -6, 8]];
  if (left) return [[-3, -5, -8], [-2, -5, 8]];
  return [[2, -5, -8], [3, -5, 8]];
}

export function machineGunVelocities(left: boolean, right: boolean): readonly (readonly [number, number, number])[] {
  if (left && right) return [[0, -10, -8], [0, -10, 8]];
  if (left) return [[-7, -7, -8], [-4, -9, 8]];
  return [[4, -9, -8], [7, -7, 8]];
}

export function shotgunVelocities(left: boolean, right: boolean): readonly (readonly [number, number])[] {
  if (left && right) return [[-8, -8], [-4, -11], [0, -12], [4, -11], [8, -8]];
  if (left) return [[-12, 0], [-11, -4], [-8, -8], [-4, -11], [0, -12]];
  return [[0, -12], [4, -11], [8, -8], [11, -4], [12, 0]];
}

export function weaponCanRepeat(weapon: WeaponName): boolean {
  return weapon === "machinegun";
}

export function weaponBulletLifetime(weapon: WeaponName): number {
  return weapon === "shotgun" ? SHOTGUN_BULLET_LIFETIME : weapon === "machinegun" ? MACHINE_GUN_BULLET_LIFETIME : weapon === "magnum" ? MAGNUM_BULLET_LIFETIME : PISTOL_BULLET_LIFETIME;
}
export const BOMBER_ENTRY_DURATION = 125 / NES_FRAME_RATE;
export const BOMBER_ENTRY_END_Y_NES = 126;
export const BOMBER_ENTRY_END_Y = BOMBER_ENTRY_END_Y_NES * NES_WORLD_Y_SCALE;
export const BOMBER_THROW_DURATION = 90 / NES_FRAME_RATE;
export const BOMBER_THROW_CHANCE = 0.5;
export const BOMBER_ACTIVATION_DISTANCE_NES = 64;
export const BOMBER_MOVEMENT_DURATIONS = [64, 38, 32, 14, 16, 14, 32, 38] as const;
const BOMBER_MOVEMENT_VELOCITIES_NES = [[0, -1], [0.578125, -0.703125], [0.828125, 0], [0.578125, 0.703125], [0, 1], [-0.578125, 0.703125], [-0.828125, 0], [-0.578125, -0.703125]] as const;
export const DYNAMITE_AIRBORNE_DURATION = 212 / NES_FRAME_RATE;
export const DYNAMITE_LANDED_DURATION = 53 / NES_FRAME_RATE;
export const DYNAMITE_LIFETIME = DYNAMITE_AIRBORNE_DURATION + DYNAMITE_LANDED_DURATION;
export const DYNAMITE_WORLD_SPEED = 89 * (540 / 240) / DYNAMITE_AIRBORNE_DURATION;
export const DYNAMITE_HORIZONTAL_DURATION = 40 / NES_FRAME_RATE;
export const DYNAMITE_AIM_FACTOR = 0.25;
export const DYNAMITE_VERTICAL_PATH_NES = [[0, 0], [20, 18], [40, 32], [212, 89]] as const;
export function bomberOpeningY(age: number): number {
  return Math.max(0, Math.min(1, age / BOMBER_ENTRY_DURATION)) * BOMBER_ENTRY_END_Y;
}

export function bomberMovementDuration(direction: number): number {
  return (BOMBER_MOVEMENT_DURATIONS[direction & 7] ?? BOMBER_MOVEMENT_DURATIONS[0]) / NES_FRAME_RATE;
}

export function bomberMovementVelocity(direction: number): readonly [number, number] {
  const velocity = BOMBER_MOVEMENT_VELOCITIES_NES[direction & 7] ?? BOMBER_MOVEMENT_VELOCITIES_NES[0];
  return [velocity[0] * NES_FRAME_RATE * NES_WORLD_X_SCALE, velocity[1] * NES_FRAME_RATE * NES_WORLD_Y_SCALE];
}

export function bomberCanThrow(actorY: number, playerY: number, random: number): boolean {
  return actorY >= 32 * NES_WORLD_Y_SCALE && Math.abs(playerY - actorY) < BOMBER_ACTIVATION_DISTANCE_NES * NES_WORLD_Y_SCALE && random < BOMBER_THROW_CHANCE;
}

export function dynamiteVerticalOffset(age: number): number {
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const nextIndex = DYNAMITE_VERTICAL_PATH_NES.findIndex(([at]) => at >= frame);
  if (nextIndex < 0) return DYNAMITE_VERTICAL_PATH_NES.at(-1)![1] * NES_WORLD_Y_SCALE;
  if (nextIndex === 0) return 0;
  const previous = DYNAMITE_VERTICAL_PATH_NES[nextIndex - 1]!;
  const next = DYNAMITE_VERTICAL_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return (previous[1] + (next[1] - previous[1]) * amount) * NES_WORLD_Y_SCALE;
}

export function dynamiteContactIsDefusable(age: number): boolean {
  return age < DYNAMITE_AIRBORNE_DURATION;
}
export const SHOTGUNNER_FIRST_VOLLEY_DELAY = 108 / NES_FRAME_RATE;
export const SHOTGUNNER_VOLLEY_INTERVAL = 51 / NES_FRAME_RATE;
export const SHOTGUNNER_LIFETIME = 228 / NES_FRAME_RATE;
export const SHOTGUNNER_FAN_NES = [[-1, 8], [0, 8], [1, 8]] as const;
export const SHOTGUNNER_PATH_NES = [[0, 0, 0], [64, 0, 64], [80, -6, 77], [100, -18, 83], [108, -18, 83], [120, -20, 82], [140, -32, 70], [152, -34, 60], [164, -34, 60], [168, -34, 59], [224, -34, 3]] as const;
export const SHOTGUNNER_SIDE_SHOT_FRAME = 114;
export const SHOTGUNNER_SIDE_LIFETIME = 232 / NES_FRAME_RATE;
export const SHOTGUNNER_SIDE_PATH_NES = [[0, 0, 0], [60, 49, 0], [80, 64, -2], [100, 72, -19], [114, 72, -22], [140, 66, -36], [160, 52, -40], [220, 2, -40], [231, -7, -40]] as const;

export function shotgunnerPosition(age: number): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const nextIndex = SHOTGUNNER_PATH_NES.findIndex(([at]) => at >= frame);
  if (nextIndex < 0) {
    const last = SHOTGUNNER_PATH_NES.at(-1)!;
    return [last[1], last[2]];
  }
  if (nextIndex === 0) return [0, 0];
  const previous = SHOTGUNNER_PATH_NES[nextIndex - 1]!;
  const next = SHOTGUNNER_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return [
    previous[1] + (next[1] - previous[1]) * amount,
    previous[2] + (next[2] - previous[2]) * amount,
  ];
}

export function shotgunnerSidePosition(age: number, fromLeft: boolean): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const nextIndex = SHOTGUNNER_SIDE_PATH_NES.findIndex(([at]) => at >= frame);
  const direction = fromLeft ? 1 : -1;
  if (nextIndex < 0) {
    const last = SHOTGUNNER_SIDE_PATH_NES.at(-1)!;
    return [last[1] * direction, last[2]];
  }
  if (nextIndex === 0) return [0, 0];
  const previous = SHOTGUNNER_SIDE_PATH_NES[nextIndex - 1]!;
  const next = SHOTGUNNER_SIDE_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return [(previous[1] + (next[1] - previous[1]) * amount) * direction, previous[2] + (next[2] - previous[2]) * amount];
}
export const SNIPER_SHOT_FRAMES = [134, 224, 405, 495, 585] as const;
export const SNIPER_CODE2_SHOT_FRAMES = [134, 224, 314, 404, 495, 585] as const;
export const SNIPER_LIFETIME = 732 / NES_FRAME_RATE;
const SNIPER_BULLET_VELOCITIES_NES = [[0, -1], [0.15625, -0.97265625], [0.3125, -0.92578125], [0.45703125, -0.828125], [0.578125, -0.703125], [0.6796875, -0.5625], [0.76171875, -0.390625], [0.8125, -0.1875], [0.828125, 0], [0.8125, 0.1875], [0.76171875, 0.390625], [0.6796875, 0.5625], [0.578125, 0.703125], [0.45703125, 0.828125], [0.3125, 0.92578125], [0.15625, 0.97265625], [0, 1], [-0.15625, 0.97265625], [-0.3125, 0.92578125], [-0.45703125, 0.828125], [-0.578125, 0.703125], [-0.6796875, 0.5625], [-0.76171875, 0.390625], [-0.8125, 0.1875], [-0.828125, 0], [-0.8125, -0.1875], [-0.76171875, -0.390625], [-0.6796875, -0.5625], [-0.578125, -0.703125], [-0.45703125, -0.828125], [-0.3125, -0.92578125], [-0.15625, -0.97265625]] as const;

export function sniperProjectileVelocity(originX: number, originY: number, targetX: number, targetY: number): readonly [number, number] {
  const [x, y] = SNIPER_BULLET_VELOCITIES_NES[nesAimHeading(originX, originY, targetX, targetY)] ?? SNIPER_BULLET_VELOCITIES_NES[0];
  return [x * NES_FRAME_RATE * NES_WORLD_X_SCALE, y * NES_FRAME_RATE * NES_WORLD_Y_SCALE];
}

export function gunmanProjectileVelocity(originX: number, originY: number, targetX: number, targetY: number): readonly [number, number] {
  return mediumProjectileVelocity(originX, originY, targetX, targetY);
}

export function mediumProjectileVelocity(originX: number, originY: number, targetX: number, targetY: number, evenHeading = false): readonly [number, number] {
  const aimHeading = nesAimHeading(originX, originY, targetX, targetY);
  return mediumProjectileHeadingVelocity(evenHeading ? aimHeading & 0x1e : aimHeading);
}

export function mediumProjectileHeadingVelocity(heading: number): readonly [number, number] {
  const [x, y] = SNIPER_BULLET_VELOCITIES_NES[heading & 31] ?? SNIPER_BULLET_VELOCITIES_NES[0];
  return [x * 2 * NES_FRAME_RATE * NES_WORLD_X_SCALE, y * 2 * NES_FRAME_RATE * NES_WORLD_Y_SCALE];
}

export function banditBillProjectileVelocity(originX: number, originY: number, targetX: number, targetY: number): readonly [number, number] {
  const [x, y] = SNIPER_BULLET_VELOCITIES_NES[nesAimHeading(originX, originY, targetX, targetY)] ?? SNIPER_BULLET_VELOCITIES_NES[0];
  return [x * 3 * NES_FRAME_RATE * NES_WORLD_X_SCALE, y * 3 * NES_FRAME_RATE * NES_WORLD_Y_SCALE];
}
export const RIFLEMAN_FIRST_SHOT_DELAY = 138 / NES_FRAME_RATE;
export const RIFLEMAN_ATTACK_STATE_FRAME = 122;
export const RIFLEMAN_SHOT_INTERVAL = 16 / NES_FRAME_RATE;
export const RIFLEMAN_SHOTS_PER_VOLLEY = 5;
export const RIFLEMAN_LIFETIME = 364 / NES_FRAME_RATE;
export const RIFLEMAN_PATH_NES = [[0, 0], [121, 121], [211, 151], [363, 0]] as const;
export const RIFLEMAN_SIDE_SHOT_FRAMES = [97, 113, 129] as const;
export const RIFLEMAN_SIDE_LIFETIME = 259 / NES_FRAME_RATE;
export const RIFLEMAN_SIDE_PATH_NES = [[0, 0, 0], [80, 65, 0], [169, 65, 0], [180, 58, 0], [240, 8, 0], [258, -7, 0]] as const;

export function riflemanCanAttack(actorY: number, playerY: number): boolean {
  const actorNesY = Math.round(actorY / NES_WORLD_Y_SCALE);
  const playerNesY = Math.round(playerY / NES_WORLD_Y_SCALE);
  return actorNesY >= 0x30 && Math.abs(playerNesY - actorNesY) < 0x60;
}

const RIFLEMAN_SHOT_HEADINGS = [[20, 22, 20, 18, 20], [16, 18, 16, 14, 16], [12, 14, 12, 10, 12]] as const;

export function riflemanShotHeading(aimHeading: number, shotIndex: number): number {
  const group = aimHeading >= 18 ? 0 : aimHeading >= 14 ? 1 : 2;
  return RIFLEMAN_SHOT_HEADINGS[group][shotIndex % RIFLEMAN_SHOTS_PER_VOLLEY] ?? 16;
}

export function riflemanPosition(age: number): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const nextIndex = RIFLEMAN_PATH_NES.findIndex(([at]) => at >= frame);
  if (nextIndex < 0) return [0, RIFLEMAN_PATH_NES.at(-1)![1]];
  if (nextIndex === 0) return [0, 0];
  const previous = RIFLEMAN_PATH_NES[nextIndex - 1]!;
  const next = RIFLEMAN_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return [0, previous[1] + (next[1] - previous[1]) * amount];
}

export function riflemanSidePosition(age: number, fromLeft: boolean): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const nextIndex = RIFLEMAN_SIDE_PATH_NES.findIndex(([at]) => at >= frame);
  const direction = fromLeft ? 1 : -1;
  if (nextIndex < 0) {
    const last = RIFLEMAN_SIDE_PATH_NES.at(-1)!;
    return [last[1] * direction, last[2]];
  }
  if (nextIndex === 0) return [0, 0];
  const previous = RIFLEMAN_SIDE_PATH_NES[nextIndex - 1]!;
  const next = RIFLEMAN_SIDE_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return [(previous[1] + (next[1] - previous[1]) * amount) * direction, previous[2] + (next[2] - previous[2]) * amount];
}
export const NINJA_FIRST_SHOT_DELAY = 103 / NES_FRAME_RATE;
export const NINJA_PROJECTILE_SPEED = 300;
export const NINJA_LIFETIME = 303 / NES_FRAME_RATE;
export const NINJA_ACTIVATION_DISTANCE_NES = 64;
export const NINJA_ATTACK_MOVE_DURATION = 15 / NES_FRAME_RATE;
export const NINJA_ENTRY_PATH_NES = [[0, 0], [16, 32], [36, 32], [83, 126], [103, 126]] as const;

export function ninjaOpeningY(age: number): number {
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const nextIndex = NINJA_ENTRY_PATH_NES.findIndex(([at]) => at >= frame);
  if (nextIndex < 0) return NINJA_ENTRY_PATH_NES.at(-1)![1] * NES_WORLD_Y_SCALE;
  if (nextIndex === 0) return 0;
  const previous = NINJA_ENTRY_PATH_NES[nextIndex - 1]!;
  const next = NINJA_ENTRY_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return (previous[1] + (next[1] - previous[1]) * amount) * NES_WORLD_Y_SCALE;
}

export function ninjaAttackPosition(age: number, originX: number, originY: number, targetX: number, targetY: number): readonly [number, number] {
  const amount = Math.min(1, Math.max(0, (age - NINJA_FIRST_SHOT_DELAY) / NINJA_ATTACK_MOVE_DURATION));
  return [originX + (targetX - originX) * amount, originY + (targetY - originY) * amount];
}

export function ninjaCanThrow(actorY: number, playerY: number): boolean {
  return Math.abs(Math.round(playerY / NES_WORLD_Y_SCALE) - Math.round(actorY / NES_WORLD_Y_SCALE)) < NINJA_ACTIVATION_DISTANCE_NES;
}

export function bossSpriteVisible(stage: number, age: number, invulnerableUntil: number, teleporting: boolean): boolean {
  return stage !== 4 || (!teleporting && age >= invulnerableUntil);
}

export const ROCK_WORLD_SPEED_X = 230;
export const ROCK_WORLD_SPEED_Y = 236;
export const ROCK_IMPACT_DELAY = 24 / NES_FRAME_RATE;
export const ROCK_LIFETIME = 49 / NES_FRAME_RATE;
export const HATCHET_LIFETIME = 1042 / NES_FRAME_RATE;
export const HATCHET_ENTRY_DEPTH_NES = 40;
export const HATCHET_ENTRY_PAUSE_FRAMES = 20;
export const HATCHET_TURN_FRAMES = 34;
export const HATCHET_THROW_FRAMES = 26;
export const HATCHET_PATROL_BOUNDS_NES = [40, 216] as const;
const HATCHET_TURN_HEADINGS = [
  [24, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
  [24, 24, 25, 26, 27, 28, 29, 30, 31, 0, 1, 2, 3, 4, 5, 6, 7],
] as const;
const HATCHET_COLLISION_PROBES_NES = [[0, -12], [6, -12], [12, -12], [12, -6], [12, 0], [12, 6], [12, 12], [6, 12], [0, 12], [-6, 12], [-12, 12], [-12, 6], [-12, 0], [-12, -6], [-12, -12], [-6, -12]] as const;

export function hatchetTurnHeading(remainingFrames: number, lowerArc: boolean, mirrored: boolean): number {
  const table = HATCHET_TURN_HEADINGS[Number(lowerArc)]!;
  const heading = table[Math.floor(Math.max(0, Math.min(HATCHET_TURN_FRAMES - 1, remainingFrames)) / 2)] ?? table[0];
  return mirrored ? (32 - heading) & 31 : heading;
}

export function nesActorCollisionProbeOffset(heading: number): readonly [number, number] {
  return HATCHET_COLLISION_PROBES_NES[(heading & 31) >> 1] ?? HATCHET_COLLISION_PROBES_NES[0];
}

export type HatchetState = {
  frame: number;
  mode: "entry" | "pause" | "patrol" | "throw" | "exit";
  wait: number;
  heading: number;
  turn: number;
  mirrored: boolean;
  lowerArc: boolean;
  attackLocked: boolean;
  aimHeading: number;
  animationPhase: number;
  x: number;
  y: number;
};

export function createHatchetState(x: number, y = 0): HatchetState {
  return { frame: 0, mode: "entry", wait: 0, heading: x < 128 ? 8 : 24, turn: 0, mirrored: x >= 128, lowerArc: false, attackLocked: false, aimHeading: 16, animationPhase: 1, x, y };
}

export function advanceHatchet(state: HatchetState, targetFrame: number, playerX: number, playerY: number, blocked: (probeX: number, probeY: number) => boolean): { readonly shots: readonly number[]; readonly dead: boolean } {
  const shots: number[] = [];
  while (state.frame < targetFrame && state.y >= 0) {
    state.frame += 1;
    const animationPhase = state.animationPhase;
    state.animationPhase = (state.animationPhase + 1) % 52;
    if (state.mode === "entry") {
      if (state.y < HATCHET_ENTRY_DEPTH_NES) state.y += 2;
      else {
        state.mode = "pause";
        state.wait = HATCHET_ENTRY_PAUSE_FRAMES;
      }
      continue;
    }
    if (state.mode === "pause") {
      if (state.wait > 0) {
        state.wait -= 1;
        continue;
      }
      state.mode = "patrol";
    }
    if (state.mode === "throw") {
      state.y += NES_SCROLL_SPEED / NES_FRAME_RATE;
      state.wait -= 1;
      if (state.wait > 0) continue;
      shots.push(state.aimHeading);
      state.animationPhase = 1;
      state.mode = "patrol";
      state.attackLocked = true;
      continue;
    }
    if (state.mode === "exit") {
      if (state.wait > 0) state.wait -= 1;
      else state.y -= 2;
      continue;
    }
    if (state.y < HATCHET_ENTRY_DEPTH_NES) {
      state.mode = "exit";
      state.wait = HATCHET_ENTRY_PAUSE_FRAMES;
      continue;
    }
    if (state.turn === 0 && (state.x < HATCHET_PATROL_BOUNDS_NES[0] || state.x >= HATCHET_PATROL_BOUNDS_NES[1])) {
      state.turn = HATCHET_TURN_FRAMES;
      state.attackLocked = false;
      continue;
    }
    const turning = state.turn > 0;
    if (turning) {
      state.turn -= 1;
      state.heading = hatchetTurnHeading(state.turn, state.lowerArc, state.mirrored);
    } else if (!state.attackLocked && animationPhase < 13 && hatchetCanThrow(state.x * NES_WORLD_X_SCALE, state.y * NES_WORLD_Y_SCALE, playerX * NES_WORLD_X_SCALE, playerY * NES_WORLD_Y_SCALE)) {
      state.mode = "throw";
      state.wait = HATCHET_THROW_FRAMES;
      state.aimHeading = nesAimHeading(state.x * NES_WORLD_X_SCALE, state.y * NES_WORLD_Y_SCALE, playerX * NES_WORLD_X_SCALE, playerY * NES_WORLD_Y_SCALE);
    }
    const [velocityX, velocityY] = SNIPER_BULLET_VELOCITIES_NES[state.heading & 31] ?? SNIPER_BULLET_VELOCITIES_NES[0];
    const nextX = state.x + velocityX * 2;
    const nextY = state.y + velocityY * 2;
    const [probeX, probeY] = nesActorCollisionProbeOffset(state.heading);
    if (blocked(nextX + probeX, nextY + probeY)) {
      state.y += NES_SCROLL_SPEED / NES_FRAME_RATE;
      if (!turning) state.turn = HATCHET_TURN_FRAMES;
    } else {
      state.x = nextX;
      state.y = nextY;
    }
    if (turning && state.turn === 0) {
      state.mirrored = !state.mirrored;
      if (state.y >= 121) state.lowerArc = true;
    }
  }
  return { shots, dead: state.y < 0 };
}

export function hatchetCanThrow(originX: number, originY: number, targetX: number, targetY: number): boolean {
  const heading = nesAimHeading(originX, originY, targetX, targetY);
  return heading >= 15 && heading <= 17;
}

export const FIREBREATHER_FIRST_DECISION_DELAY = 156 / NES_FRAME_RATE;
export const FIREBREATHER_LIFETIME = Number.POSITIVE_INFINITY;
export const FIREBREATHER_PROJECTILE_OFFSET_NES = [0, -1] as const;
export const FIREBREATHER_ENTRY_FRAMES = 32;
export const FIREBREATHER_AIM_WAIT_FRAMES = 40;
export const FIREBREATHER_READY_WAIT_FRAMES = 20;
export const FIREBREATHER_DECISION_INTERVAL_FRAMES = 52;
export const FIREBREATHER_MOVE_FRAMES = 24;
export const FIREBREATHER_ATTACK_FRAMES = 39;
export const FIREBREATHER_ACTIVATION_DISTANCE_NES = 96;

export type FirebreatherState = {
  frame: number;
  mode: "entry" | "aimWait" | "approach" | "readyWait" | "hold" | "move" | "attack";
  wait: number;
  heading: number;
  nextDecision: number;
  x: number;
  y: number;
};

export function createFirebreatherState(x: number, y: number, heading: number): FirebreatherState {
  return { frame: 0, mode: "entry", wait: FIREBREATHER_ENTRY_FRAMES, heading: heading & 31, nextDecision: Math.round(FIREBREATHER_FIRST_DECISION_DELAY * NES_FRAME_RATE), x, y };
}

export function advanceFirebreather(state: FirebreatherState, targetFrame: number, playerX: number, playerY: number, blocked: (probeX: number, probeY: number) => boolean, randomByte: () => number): { readonly shots: readonly number[] } {
  const shots: number[] = [];
  const drift = () => { state.y += NES_SCROLL_SPEED / NES_FRAME_RATE; };
  const move = (speed: number) => {
    const [velocityX, velocityY] = SNIPER_BULLET_VELOCITIES_NES[state.heading & 31] ?? SNIPER_BULLET_VELOCITIES_NES[0];
    const nextX = state.x + velocityX * speed;
    const nextY = state.y + velocityY * speed;
    const [probeX, probeY] = nesActorCollisionProbeOffset(state.heading);
    if (blocked(nextX + probeX, nextY + probeY)) drift();
    else {
      state.x = nextX;
      state.y = nextY;
    }
  };
  while (state.frame < targetFrame) {
    state.frame += 1;
    if (state.mode === "entry") {
      state.wait -= 1;
      if (state.wait === 0) {
        state.heading = nesAimHeading(state.x * NES_WORLD_X_SCALE, state.y * NES_WORLD_Y_SCALE, playerX * NES_WORLD_X_SCALE, playerY * NES_WORLD_Y_SCALE);
        state.mode = "aimWait";
        state.wait = FIREBREATHER_AIM_WAIT_FRAMES;
      } else move(1);
      continue;
    }
    if (state.mode === "aimWait") {
      drift();
      state.wait -= 1;
      if (state.wait === 0) state.mode = "approach";
      continue;
    }
    if (state.mode === "approach") {
      if (Math.abs(state.x - playerX) < FIREBREATHER_ACTIVATION_DISTANCE_NES && Math.abs(state.y - playerY) < FIREBREATHER_ACTIVATION_DISTANCE_NES) {
        state.mode = "readyWait";
        state.wait = FIREBREATHER_READY_WAIT_FRAMES;
        drift();
      } else move(2);
      continue;
    }
    if (state.mode === "readyWait") {
      drift();
      state.wait -= 1;
      if (state.wait === 0) state.mode = "hold";
      continue;
    }
    if (state.mode === "move") {
      move(2);
      state.wait -= 1;
      if (state.wait === 0) state.mode = "hold";
      continue;
    }
    if (state.mode === "attack") {
      drift();
      state.wait -= 1;
      if (state.wait === 0) state.mode = "hold";
      continue;
    }
    if (state.frame < state.nextDecision) {
      drift();
      continue;
    }
    state.nextDecision += FIREBREATHER_DECISION_INTERVAL_FRAMES;
    const random = randomByte() & 0xff;
    const aim = nesAimHeading(state.x * NES_WORLD_X_SCALE, state.y * NES_WORLD_Y_SCALE, playerX * NES_WORLD_X_SCALE, playerY * NES_WORLD_Y_SCALE);
    if (state.y < 208 && !(random & 4) && aim >= 10 && aim <= 22) {
      shots.push(aim);
      state.mode = "attack";
      state.wait = FIREBREATHER_ATTACK_FRAMES;
      drift();
      continue;
    }
    if (state.y >= 208) state.heading = 16;
    else if (!(random & 4)) state.heading = 0;
    else {
      const far = Math.abs(state.y - playerY) >= 64 || Math.abs(state.x - playerX) >= 64;
      const special = ((random & 3) === 0) === far;
      state.heading = special ? state.x < playerX ? 28 : 4 : aim;
    }
    state.mode = "move";
    state.wait = FIREBREATHER_MOVE_FRAMES;
    drift();
  }
  return { shots };
}

export const SPEAR_PROJECTILE_OFFSET_NES = [0, 0] as const;
export const SPEAR_LIFETIME = Number.POSITIVE_INFINITY;
export const SPEAR_TOP_ENTRY_FRAMES = 24;
export const SPEAR_SIDE_ENTRY_FRAMES = 40;
export const SPEAR_WAIT_FRAMES = 40;
export const SPEAR_MOVE_FRAMES = 32;
export const SPEAR_ATTACK_REMAINING_FRAME = 24;
const SPEAR_ENTRY_HEADINGS = [0x90, 0x50, 0x10, 0xc0, 0x00] as const;
const SPEAR_MOVE_HEADINGS = [0x90, 0x50, 0x10, 0xc0, 0xc0, 0x00, 0x40, 0x80] as const;

export type SpearState = {
  frame: number;
  mode: "entry" | "wait" | "move";
  remaining: number;
  heading: number;
  reverseAtEnd: boolean;
  x: number;
  y: number;
};

export function createSpearState(x: number, y: number, sideEntry: boolean): SpearState {
  return {
    frame: 0,
    mode: "entry",
    remaining: sideEntry ? SPEAR_SIDE_ENTRY_FRAMES : SPEAR_TOP_ENTRY_FRAMES,
    heading: sideEntry ? x >= 128 ? 0x58 : 0x48 : 0x10,
    reverseAtEnd: true,
    x,
    y: y + 1,
  };
}

function moveEncodedHeading(state: SpearState, encodedHeading: number): void {
  const [velocityX, velocityY] = SNIPER_BULLET_VELOCITIES_NES[encodedHeading & 31] ?? SNIPER_BULLET_VELOCITIES_NES[0];
  const tier = encodedHeading & 0xc0;
  const speed = tier === 0xc0 ? 0 : (tier >> 6) + 1;
  state.x += velocityX * speed;
  state.y += velocityY * speed;
}

export function advanceSpear(state: SpearState, targetFrame: number, playerX: number, playerY: number, randomByte: () => number): { readonly shots: readonly number[] } {
  const shots: number[] = [];
  while (state.frame < targetFrame) {
    state.frame += 1;
    state.y += NES_SCROLL_SPEED / NES_FRAME_RATE;
    if (state.mode === "wait") {
      state.remaining -= 1;
      if (state.remaining === 0) {
        state.mode = "move";
        state.remaining = SPEAR_MOVE_FRAMES;
      }
      continue;
    }
    state.remaining -= 1;
    if (state.remaining === 0) {
      if (state.mode === "move" && state.reverseAtEnd) state.heading = (state.heading + 0x10) & 0xdf;
      else state.heading = 0x44 | ((randomByte() & 3) << 3);
      if (state.mode === "move") state.reverseAtEnd = !state.reverseAtEnd;
      state.mode = "wait";
      state.remaining = SPEAR_WAIT_FRAMES;
      continue;
    }
    const profile = state.mode === "entry" ? SPEAR_ENTRY_HEADINGS[state.remaining >> 3] : SPEAR_MOVE_HEADINGS[state.remaining >> 2];
    moveEncodedHeading(state, profile ?? 0);
    moveEncodedHeading(state, state.heading & 0xdf);
    if (state.mode === "move" && state.remaining === SPEAR_ATTACK_REMAINING_FRAME && (state.heading < 0x48 || state.heading >= 0x59)) {
      const aim = nesAimHeading(state.x * NES_WORLD_X_SCALE, state.y * NES_WORLD_Y_SCALE, playerX * NES_WORLD_X_SCALE, playerY * NES_WORLD_Y_SCALE);
      if (aim >= 10 && aim <= 23) shots.push(aim & 0x1e);
    }
  }
  return { shots };
}

export const BACKSTABBER_AMBUSH_DROP_SPEED = 45;
export const BACKSTABBER_AMBUSH_DEPTH = 191;
export const BACKSTABBER_AMBUSH_LIFETIME = 407 / NES_FRAME_RATE;
export const BACKSTABBER_RAID_PATH = [[0, 0, 0], [40, 66, -15], [80, 103, 42], [120, 129, 44], [160, 174, 89], [200, 184, 83], [368, 213, 74]] as const;
export const BACKSTABBER_RAID_LIFETIME = 369 / NES_FRAME_RATE;
export const GUNMAN_FIRST_OPPORTUNITY_FRAMES = [40, 52, 58, 62] as const;
export const GUNMAN_SHOT_OPPORTUNITY_INTERVAL = 64 / NES_FRAME_RATE;
export const GUNMAN_LIFETIME = 560 / NES_FRAME_RATE;
export const GUNMAN_ENTRY_PATH_NES = [[0, 0], [40, 53], [100, 128], [104, 132]] as const;
export const GUNMAN_BOTTOM_BRANCH_FRAME = 50;
export const GUNMAN_BOTTOM_NEAR_DISTANCE_NES = 56;
export const GUNMAN_BOTTOM_SHOT_FRAMES = { near: [219], far: [241] } as const;
export const GUNMAN_BOTTOM_LIFETIMES = { near: 318 / NES_FRAME_RATE, far: 479 / NES_FRAME_RATE } as const;
const GUNMAN_BOTTOM_PATHS_NES = {
  near: [[0, 0, 0], [1, 0, 248], [49, 0, 201], [80, -25, 201], [105, -44, 196], [110, -45, 191], [120, -38, 188], [130, -31, 192], [157, -23, 167], [190, -3, 147], [219, 16, 159], [240, 23, 180], [274, 34, 211], [300, 42, 235], [317, 47, 251]],
  far: [[0, 0, 0], [1, 0, 248], [49, 0, 201], [63, -9, 198], [105, -15, 157], [177, -26, 88], [200, -35, 100], [241, -41, 139], [264, -45, 161], [274, -52, 160], [283, -53, 161], [300, -45, 147], [350, -22, 106], [400, 1, 64], [450, 23, 23], [478, 36, 0]],
} as const;
export const GUNMAN_FLANK_SHOT_FRAMES = { 7: [64, 410], 8: [309], 9: [399, 463] } as const;
export const GUNMAN_FLANK_LIFETIMES = { 7: 642 / NES_FRAME_RATE, 8: 508 / NES_FRAME_RATE, 9: 826 / NES_FRAME_RATE } as const;
const GUNMAN_FLANK_PATHS_NES = {
  7: [[0, 0, 0], [48, 38, 16], [64, 46, 31], [120, 75, 95], [126, 78, 101], [160, 104, 103], [200, 137, 116], [234, 165, 128], [270, 195, 141], [310, 209, 186], [338, 192, 212], [370, 170, 211], [410, 158, 186], [442, 148, 168], [460, 149, 162], [480, 158, 165], [540, 158, 185], [600, 158, 205], [641, 158, 218]],
  8: [[0, 0, 0], [247, 0, 82], [250, 3, 77], [260, 16, 68], [270, 25, 68], [280, 35, 76], [290, 44, 92], [300, 47, 120], [309, 51, 128], [324, 61, 142], [338, 67, 135], [370, 84, 122], [420, 123, 149], [460, 153, 178], [500, 182, 209], [507, 184, 217]],
  9: [[0, 0, 0], [50, -48, 30], [65, -54, 49], [104, -73, 36], [200, -117, -12], [300, -162, -61], [350, -185, -86], [358, -188, -89], [400, -184, -42], [460, -160, 30], [468, -157, 38], [550, -90, 58], [663, -44, 144], [684, -57, 140], [740, -32, 111], [800, -4, 82], [825, 7, 69]],
} as const;

export function gunmanFlankPosition(entityCode: 7 | 8 | 9, age: number): readonly [number, number] {
  const path = GUNMAN_FLANK_PATHS_NES[entityCode];
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const nextIndex = path.findIndex(([at]) => at >= frame);
  if (nextIndex < 0) {
    const last = path.at(-1)!;
    return [last[1], last[2]];
  }
  if (nextIndex === 0) return [0, 0];
  const previous = path[nextIndex - 1]!;
  const next = path[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return [previous[1] + (next[1] - previous[1]) * amount, previous[2] + (next[2] - previous[2]) * amount];
}

export function gunmanBottomRoute(originX: number, originY: number, targetX: number, targetY: number): "near" | "far" {
  return Math.abs(originX - targetX) < GUNMAN_BOTTOM_NEAR_DISTANCE_NES * NES_WORLD_X_SCALE
    && Math.abs(originY - targetY) < GUNMAN_BOTTOM_NEAR_DISTANCE_NES * NES_WORLD_Y_SCALE ? "near" : "far";
}

export function gunmanBottomPosition(route: "near" | "far", fromLeft: boolean, age: number): readonly [number, number] {
  const path = GUNMAN_BOTTOM_PATHS_NES[route];
  const sampledFromLeft = route === "near";
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const nextIndex = path.findIndex(([at]) => at >= frame);
  if (nextIndex < 0) {
    const last = path.at(-1)!;
    return [last[1] * (fromLeft === sampledFromLeft ? 1 : -1), last[2]];
  }
  if (nextIndex === 0) return [0, 0];
  const previous = path[nextIndex - 1]!;
  const next = path[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return [(previous[1] + (next[1] - previous[1]) * amount) * (fromLeft === sampledFromLeft ? 1 : -1), previous[2] + (next[2] - previous[2]) * amount];
}

export function gunmanOpeningY(age: number): number {
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const nextIndex = GUNMAN_ENTRY_PATH_NES.findIndex(([at]) => at >= frame);
  if (nextIndex < 0) return GUNMAN_ENTRY_PATH_NES.at(-1)![1] * NES_WORLD_Y_SCALE;
  if (nextIndex === 0) return 0;
  const previous = GUNMAN_ENTRY_PATH_NES[nextIndex - 1]!;
  const next = GUNMAN_ENTRY_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return (previous[1] + (next[1] - previous[1]) * amount) * NES_WORLD_Y_SCALE;
}
export function gunmanFirstOpportunityFrame(phase: number): number {
  return GUNMAN_FIRST_OPPORTUNITY_FRAMES[Math.floor((phase % (Math.PI * 2)) / (Math.PI * 2) * GUNMAN_FIRST_OPPORTUNITY_FRAMES.length)] ?? GUNMAN_FIRST_OPPORTUNITY_FRAMES[0];
}
export function gunmanCanFire(facingHeading: number, aimHeading: number): boolean {
  return Math.abs((aimHeading - facingHeading + 48) % 32 - 16) < 3;
}
export const BANDIT_BILL_FIRST_VOLLEY_DELAY = 107 / NES_FRAME_RATE;
export const BANDIT_BILL_SHOT_INTERVAL = 12 / NES_FRAME_RATE;
export const BANDIT_BILL_VOLLEY_GAP = 72 / NES_FRAME_RATE;
export const BANDIT_BILL_SHOTS_PER_VOLLEY = 4;
export const BANDIT_BILL_ENTRY_X_NES = [96, 128, 160, 192] as const;
export const BANDIT_BILL_ENTRY_X_LANES = BANDIT_BILL_ENTRY_X_NES.map((value) => value * NES_WORLD_X_SCALE);
export const BANDIT_BILL_ENTRY_Y_NES = 0;
export const BANDIT_BILL_ENTRY_Y = BANDIT_BILL_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const BANDIT_BILL_ENTRY_END_Y_NES = 64;
export const BANDIT_BILL_ENTRY_END_Y = BANDIT_BILL_ENTRY_END_Y_NES * NES_WORLD_Y_SCALE;
export const BANDIT_BILL_ENTRY_DURATION = 96 / NES_FRAME_RATE;
export const BANDIT_BILL_ENTRY_SPEED_Y = (64 / 96) * NES_FRAME_RATE * NES_WORLD_Y_SCALE;
export const BANDIT_BILL_HIT_STUN_DURATION = 8 / NES_FRAME_RATE;
export const BANDIT_BILL_CRAWL_DURATION = 168 / NES_FRAME_RATE;
export const BANDIT_BILL_DAMAGE_RECOVERY_DURATION = BANDIT_BILL_HIT_STUN_DURATION + BANDIT_BILL_CRAWL_DURATION;

export function banditBillOpeningY(age: number): number {
  return Math.max(0, Math.min(1, age / BANDIT_BILL_ENTRY_DURATION)) * BANDIT_BILL_ENTRY_END_Y;
}
const BANDIT_BILL_COMBAT_PATH_NES = [[0, 192, 64], [119, 186, 49], [227, 147, 49], [335, 186, 49], [443, 192, 64], [551, 196, 60], [587, 196, 60]] as const;

function banditBillCombatPosition(age: number, entryX = 192 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE - BANDIT_BILL_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 192;
  const first = BANDIT_BILL_COMBAT_PATH_NES[0]!;
  if (frame <= first[0]) return [(first[1] + laneOffset) * NES_WORLD_X_SCALE, first[2] * NES_WORLD_Y_SCALE];
  const last = BANDIT_BILL_COMBAT_PATH_NES.at(-1)!;
  if (frame >= last[0]) return [(last[1] + laneOffset) * NES_WORLD_X_SCALE, last[2] * NES_WORLD_Y_SCALE];
  const nextIndex = BANDIT_BILL_COMBAT_PATH_NES.findIndex(([at]) => at >= frame);
  const previous = BANDIT_BILL_COMBAT_PATH_NES[nextIndex - 1]!;
  const next = BANDIT_BILL_COMBAT_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return [
    (previous[1] + (next[1] - previous[1]) * amount + laneOffset) * NES_WORLD_X_SCALE,
    (previous[2] + (next[2] - previous[2]) * amount) * NES_WORLD_Y_SCALE,
  ];
}

export function banditBillCombatX(age: number, entryX = 192 * NES_WORLD_X_SCALE): number {
  return banditBillCombatPosition(age, entryX)[0];
}

export function banditBillCombatY(age: number, entryX = 192 * NES_WORLD_X_SCALE): number {
  return banditBillCombatPosition(age, entryX)[1];
}
export const CUTTER_ENTRY_X_NES = [88, 112, 144, 168] as const;
export const CUTTER_ENTRY_X_LANES = CUTTER_ENTRY_X_NES.map((value) => value * NES_WORLD_X_SCALE);
export const CUTTER_ENTRY_Y_NES = 0;
export const CUTTER_ENTRY_Y = CUTTER_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const CUTTER_ENTRY_END_Y_NES = 136;
export const CUTTER_ENTRY_END_Y = CUTTER_ENTRY_END_Y_NES * NES_WORLD_Y_SCALE;
export const CUTTER_ENTRY_DURATION = 324 / NES_FRAME_RATE;
export const CUTTER_FIRST_ATTACK_DELAY = 350 / NES_FRAME_RATE;
export const CUTTER_ATTACK_INTERVAL = 256 / NES_FRAME_RATE;
export const CUTTER_BOOMERANG_SPAWN_NES = [[-3, 3], [3, 2]] as const;
export const CUTTER_BOOMERANG_HEADINGS = [14, 18] as const;
export const CUTTER_BOOMERANG_OUTWARD_TARGETS_NES = [[224, 176], [32, 176]] as const;
export const CUTTER_BOOMERANG_REAIM_Y_NES = 176;
export const CUTTER_BOOMERANG_FIRST_TURN_DELAY = 1 / NES_FRAME_RATE;
export const CUTTER_BOOMERANG_TURN_INTERVAL = 2 / NES_FRAME_RATE;
export const CUTTER_BOOMERANG_LIFETIME = 180 / NES_FRAME_RATE;

export function cutterBoomerangVelocity(heading: number): readonly [number, number] {
  const angle = ((heading & 31) - 8) * Math.PI / 16;
  return [Math.cos(angle) * 2.5 * NES_FRAME_RATE * NES_WORLD_X_SCALE, Math.sin(angle) * 3 * NES_FRAME_RATE * NES_WORLD_Y_SCALE];
}

export function cutterBoomerangHeadingToward(originX: number, originY: number, targetX: number, targetY: number): number {
  const x = (targetX - originX) / NES_WORLD_X_SCALE / 2.5;
  const y = (targetY - originY) / NES_WORLD_Y_SCALE / 3;
  return (Math.round(Math.atan2(y, x) / (Math.PI / 16)) + 8 + 32) % 32;
}

export function cutterBoomerangTurn(heading: number, target: number): number {
  const difference = (target - heading + 48) % 32 - 16;
  return difference === 0 ? heading : (heading + Math.sign(difference) + 32) % 32;
}
export const CUTTER_MOVEMENT_SPEED = (31 / 18) * NES_FRAME_RATE * NES_WORLD_X_SCALE;

const CUTTER_OPENING_PATH_NES = [[0, 144, 0], [95, 144, 64], [142, 144, 96], [190, 144, 128], [213, 144, 142], [222, 144, 142], [250, 144, 118], [258, 144, 118], [274, 135, 129], [286, 130, 135], [298, 126, 140], [308, 123, 143], [318, 125, 142], [322, 129, 136], [324, 129, 136]] as const;

function cutterOpeningPosition(age: number, entryX = 144 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 144;
  const nextIndex = CUTTER_OPENING_PATH_NES.findIndex(([at]) => at >= frame);
  if (nextIndex < 0) {
    const last = CUTTER_OPENING_PATH_NES.at(-1)!;
    return [(last[1] + laneOffset) * NES_WORLD_X_SCALE, last[2] * NES_WORLD_Y_SCALE];
  }
  if (nextIndex === 0) return [entryX, 0];
  const previous = CUTTER_OPENING_PATH_NES[nextIndex - 1]!;
  const next = CUTTER_OPENING_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return [
    (previous[1] + (next[1] - previous[1]) * amount + laneOffset) * NES_WORLD_X_SCALE,
    (previous[2] + (next[2] - previous[2]) * amount) * NES_WORLD_Y_SCALE,
  ];
}

export function cutterOpeningX(age: number, entryX = 144 * NES_WORLD_X_SCALE): number {
  return cutterOpeningPosition(age, entryX)[0];
}

export function cutterOpeningY(age: number): number {
  return cutterOpeningPosition(age)[1];
}
const CUTTER_COMBAT_PATH_NES = [[0, 136], [26, 136], [71, 41], [131, 40], [256, 99], [311, 40]] as const;

export function cutterCombatY(age: number): number {
  const frame = Math.max(0, age * NES_FRAME_RATE - CUTTER_ENTRY_DURATION * NES_FRAME_RATE);
  const first = CUTTER_COMBAT_PATH_NES[0]!;
  if (frame <= first[0]) return first[1] * NES_WORLD_Y_SCALE;
  const last = CUTTER_COMBAT_PATH_NES.at(-1)!;
  if (frame >= last[0]) return last[1] * NES_WORLD_Y_SCALE;
  const nextIndex = CUTTER_COMBAT_PATH_NES.findIndex(([at]) => at >= frame);
  const previous = CUTTER_COMBAT_PATH_NES[nextIndex - 1]!;
  const next = CUTTER_COMBAT_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return (previous[1] + (next[1] - previous[1]) * amount) * NES_WORLD_Y_SCALE;
}
export const DEVIL_HAWK_ENTRY_X_NES = [88, 128, 168, 208] as const;
export const DEVIL_HAWK_ENTRY_X_LANES = DEVIL_HAWK_ENTRY_X_NES.map((value) => value * NES_WORLD_X_SCALE);
export const DEVIL_HAWK_ENTRY_Y_NES = 0;
export const DEVIL_HAWK_ENTRY_Y = DEVIL_HAWK_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const DEVIL_HAWK_ENTRY_END_Y_NES = 96;
export const DEVIL_HAWK_ENTRY_END_Y = DEVIL_HAWK_ENTRY_END_Y_NES * NES_WORLD_Y_SCALE;
export const DEVIL_HAWK_ENTRY_DURATION = 143 / NES_FRAME_RATE;
export const DEVIL_HAWK_POST_ENTRY_X_HOLD = 113 / NES_FRAME_RATE;
export const DEVIL_HAWK_FIRST_VOLLEY_DELAY = 174 / NES_FRAME_RATE;
export const DEVIL_HAWK_VOLLEY_INTERVAL = 125 / NES_FRAME_RATE;
export const DEVIL_HAWK_ENTRY_SPEED_Y = (96 / 143) * NES_FRAME_RATE * NES_WORLD_Y_SCALE;
export const DEVIL_HAWK_FULL_FAN_HEADINGS = [12, 14, 16, 18, 20] as const;
export const DEVIL_HAWK_FULL_FAN_LIFETIME = 45 / NES_FRAME_RATE;
export const DEVIL_HAWK_SIDE_FAN_LIFETIME = 36 / NES_FRAME_RATE;
export const DEVIL_HAWK_FULL_FAN_MAX_Y_NES = 62;
const DEVIL_HAWK_FIREBALL_VELOCITIES_NES = [[1.734375, 2.109375], [1.37109375, 2.484375], [0.9375, 2.77734375], [0.46875, 2.91796875], [0, 3], [-0.46875, 2.91796875], [-0.9375, 2.77734375], [-1.37109375, 2.484375], [-1.734375, 2.109375]] as const;

export function devilHawkFanHeadings(fullFan: boolean, aimHeading: number): readonly number[] {
  if (fullFan) return aimHeading >= 8 && aimHeading <= 24 ? DEVIL_HAWK_FULL_FAN_HEADINGS : [];
  if (aimHeading < 8 || aimHeading >= 25) return [];
  const start = aimHeading < 15 ? 12 : aimHeading < 18 ? 14 : 16;
  return [start, start + 2, start + 4];
}

export function devilHawkProjectileVelocity(heading: number): readonly [number, number] {
  const velocity = DEVIL_HAWK_FIREBALL_VELOCITIES_NES[heading - 12] ?? DEVIL_HAWK_FIREBALL_VELOCITIES_NES[4];
  return [velocity[0] * NES_FRAME_RATE * NES_WORLD_X_SCALE, velocity[1] * NES_FRAME_RATE * NES_WORLD_Y_SCALE];
}

export function devilHawkOpeningY(age: number): number {
  return Math.max(0, Math.min(1, age / DEVIL_HAWK_ENTRY_DURATION)) * DEVIL_HAWK_ENTRY_END_Y;
}
// Keyframes sampled from the unhurt Round 3 Boss trace. The ROM updates these
// coordinates in coarse steps; interpolation keeps the web runtime frame-rate
// independent while preserving the authored route through the recorded run.
const DEVIL_HAWK_COMBAT_PATH_NES = [
  [0, 96], [26, 96], [27, 91], [31, 72], [32, 68], [38, 48], [42, 44], [47, 45], [50, 48],
  [52, 48], [87, 46], [113, 46], [145, 67], [146, 67], [173, 68], [175, 70], [187, 73], [199, 76], [209, 77],
  [237, 79], [249, 82], [261, 85], [273, 88], [283, 90], [310, 90], [326, 38], [334, 42],
  [362, 40], [388, 41], [399, 47], [419, 98], [447, 100], [459, 108], [471, 114], [483, 119],
  [522, 125], [534, 131], [546, 136], [558, 142], [592, 142], [640, 142], [667, 137], [678, 94], [682, 90],
  [690, 94], [721, 86], [757, 62], [792, 60], [807, 46], [834, 46], [865, 87], [905, 79],
  [937, 63], [950, 53], [963, 46], [990, 47], [1001, 54], [1021, 105], [1048, 107], [1049, 109],
  [1057, 109],
] as const;
const DEVIL_HAWK_COMBAT_X_NES = [
  [0, 208], [113, 208], [114, 207], [118, 196], [122, 192], [130, 180], [145, 157], [146, 157], [173, 155],
  [175, 152], [187, 146], [199, 140], [209, 137], [236, 135], [249, 128], [261, 122], [273, 116],
  [283, 113], [334, 113], [390, 111], [391, 109], [392, 110], [399, 114], [402, 115], [409, 117],
  [419, 120], [480, 127], [483, 130], [491, 131], [522, 135], [534, 140], [546, 145], [558, 149],
  [596, 156], [608, 162], [620, 169], [632, 174], [640, 176], [691, 176], [764, 176], [807, 176],
  [834, 175], [837, 166], [847, 157], [865, 136], [950, 137], [953, 141], [963, 143], [990, 143],
  [991, 142], [1001, 136], [1008, 134], [1021, 130], [1057, 130],
] as const;
export const DEVIL_HAWK_JUMP_PERIOD = 121;

export function devilHawkCombatY(age: number): number {
  const frame = Math.max(0, age * NES_FRAME_RATE - DEVIL_HAWK_ENTRY_DURATION * NES_FRAME_RATE);
  if (frame <= DEVIL_HAWK_COMBAT_PATH_NES[0]![0]) return DEVIL_HAWK_COMBAT_PATH_NES[0]![1] * NES_WORLD_Y_SCALE;
  const last = DEVIL_HAWK_COMBAT_PATH_NES.at(-1)!;
  if (frame >= last[0]) return last[1] * NES_WORLD_Y_SCALE;
  const nextIndex = DEVIL_HAWK_COMBAT_PATH_NES.findIndex(([at]) => at >= frame);
  const previous = DEVIL_HAWK_COMBAT_PATH_NES[nextIndex - 1]!;
  const next = DEVIL_HAWK_COMBAT_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return (previous[1] + (next[1] - previous[1]) * amount) * NES_WORLD_Y_SCALE;
}

export function devilHawkCombatX(age: number, entryX = 208 * NES_WORLD_X_SCALE): number {
  const frame = Math.max(0, age * NES_FRAME_RATE - DEVIL_HAWK_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 208;
  const first = DEVIL_HAWK_COMBAT_X_NES[0]!;
  if (frame <= first[0]) return (first[1] + laneOffset) * NES_WORLD_X_SCALE;
  const last = DEVIL_HAWK_COMBAT_X_NES.at(-1)!;
  if (frame >= last[0]) return (last[1] + laneOffset) * NES_WORLD_X_SCALE;
  const nextIndex = DEVIL_HAWK_COMBAT_X_NES.findIndex(([at]) => at >= frame);
  const previous = DEVIL_HAWK_COMBAT_X_NES[nextIndex - 1]!;
  const next = DEVIL_HAWK_COMBAT_X_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return (previous[1] + (next[1] - previous[1]) * amount + laneOffset) * NES_WORLD_X_SCALE;
}
export const NINJA_BOSS_ENTRY_LANES_NES = [[112, 64], [192, 64], [120, 144], [176, 128]] as const;
export const NINJA_BOSS_ENTRY_LANES = NINJA_BOSS_ENTRY_LANES_NES.map(([x, y]) => [x * NES_WORLD_X_SCALE, y * NES_WORLD_Y_SCALE] as const);
export const NINJA_BOSS_FIRST_PREPARE_DELAY = 140 / NES_FRAME_RATE;
export const NINJA_BOSS_PREPARE_DURATION = 40 / NES_FRAME_RATE;
export const NINJA_BOSS_PREPARE_CONTROLLER_DURATION = 7 / NES_FRAME_RATE;
export const NINJA_BOSS_FIRST_ATTACK_DELAY = 179 / NES_FRAME_RATE;
export const NINJA_BOSS_ENTRY_INVULNERABILITY = 44 / NES_FRAME_RATE;
export const NINJA_BOSS_TELEPORT_DELAY = 90 / NES_FRAME_RATE;
export const NINJA_BOSS_ATTACK_INTERVAL = 60 / NES_FRAME_RATE;
export const NINJA_BOSS_SHURIKEN_COUNT = 4;
export const NINJA_BOSS_SHURIKEN_SPAWN_OFFSET_NES = [6, -34] as const;
export const NINJA_BOSS_SHURIKEN_VELOCITIES_NES = [[1.25, -1.5], [1.25, 1.5], [-1.25, 1.5], [-1.25, -1.5]] as const;
export const NINJA_BOSS_SHURIKEN_LIFETIME = 40 / NES_FRAME_RATE;

export function ninjaBossPreparePosition(age: number, originX: number, originY: number, targetX: number, targetY: number): readonly [number, number] {
  const progress = clamp(age / NINJA_BOSS_PREPARE_DURATION, 0, 1);
  return [originX + (targetX - originX) * progress, originY + (targetY - originY) * progress];
}

const NINJA_BOSS_COMBAT_PATH_NES = [[0, 128], [26, 165], [51, 103], [67, 104], [126, 110], [196, 94], [253, 140], [296, 164], [386, 64], [431, 64], [448, 88], [474, 88], [508, 72], [534, 72], [551, 41]] as const;

export function ninjaBossCombatY(age: number, entryY = 128 * NES_WORLD_Y_SCALE): number {
  const frame = Math.max(0, age * NES_FRAME_RATE - NINJA_BOSS_ENTRY_INVULNERABILITY * NES_FRAME_RATE);
  const laneOffset = entryY / NES_WORLD_Y_SCALE - 128;
  const first = NINJA_BOSS_COMBAT_PATH_NES[0]!;
  if (frame <= first[0]) return (first[1] + laneOffset) * NES_WORLD_Y_SCALE;
  const last = NINJA_BOSS_COMBAT_PATH_NES.at(-1)!;
  if (frame >= last[0]) return (last[1] + laneOffset) * NES_WORLD_Y_SCALE;
  const nextIndex = NINJA_BOSS_COMBAT_PATH_NES.findIndex(([at]) => at >= frame);
  const previous = NINJA_BOSS_COMBAT_PATH_NES[nextIndex - 1]!;
  const next = NINJA_BOSS_COMBAT_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return (previous[1] + (next[1] - previous[1]) * amount + laneOffset) * NES_WORLD_Y_SCALE;
}
export const FATMAN_JOE_ENTRY_X_NES = [64, 104, 152, 192] as const;
export const FATMAN_JOE_ENTRY_X_LANES = FATMAN_JOE_ENTRY_X_NES.map((value) => value * NES_WORLD_X_SCALE);
export const FATMAN_JOE_ENTRY_Y_NES = 0;
export const FATMAN_JOE_ENTRY_Y = FATMAN_JOE_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const FATMAN_JOE_ENTRY_END_Y_NES = 112;
export const FATMAN_JOE_ENTRY_END_Y = FATMAN_JOE_ENTRY_END_Y_NES * NES_WORLD_Y_SCALE;
export const FATMAN_JOE_ENTRY_DURATION = 170 / NES_FRAME_RATE;
export const FATMAN_JOE_MOVEMENT_SPEED = (40 / 75) * NES_FRAME_RATE * NES_WORLD_X_SCALE;
export const FATMAN_JOE_FIRST_ATTACK_DELAY = 95 / NES_FRAME_RATE;
export const FATMAN_JOE_ATTACK_DECISION_INTERVAL = 76 / NES_FRAME_RATE;
export const FATMAN_JOE_ATTACK_CHANCE = 0.5;
export const FATMAN_JOE_SHORT_ACTION_DURATION = 53 / NES_FRAME_RATE;
export const FATMAN_JOE_LONG_ACTION_DURATION = 122 / NES_FRAME_RATE;
export const FATMAN_JOE_SHELL_FLIGHT_DURATION = 31 / NES_FRAME_RATE;
export const FATMAN_JOE_SHELL_SPLIT_DELAY = 35 / NES_FRAME_RATE;
export const FATMAN_JOE_SHELL_LIFETIME = 61 / NES_FRAME_RATE;
export const FATMAN_JOE_MINE_INTERVAL = 4 / NES_FRAME_RATE;
export const FATMAN_JOE_MINE_OFFSETS_NES = [[-16, 4], [-10, 12], [0, 16], [10, 12], [16, 4]] as const;
export const FATMAN_JOE_GRENADE_LIFETIME = 29 / NES_FRAME_RATE;
export const FATMAN_JOE_LAUNCH_INVULNERABILITY = 0.75;
const FATMAN_JOE_SHELL_VELOCITIES_NES = [[0.9375, 2.77734375], [0.46875, 2.91796875], [0, 3], [-0.46875, 2.91796875], [-0.9375, 2.77734375]] as const;

export function fatmanJoeAimHeading(originX: number, originY: number, targetX: number, targetY: number): number {
  return nesAimHeading(originX, originY, targetX, targetY);
}

export function fatmanJoeCanLaunch(originX: number, originY: number, targetX: number, targetY: number, random: number): boolean {
  const heading = fatmanJoeAimHeading(originX, originY, targetX, targetY);
  return random >= 1 - FATMAN_JOE_ATTACK_CHANCE && heading >= 14 && heading <= 18;
}

export function fatmanJoeMovementActionDuration(originY: number, random: number): number {
  return random < 0.125 || originY / NES_WORLD_Y_SCALE < 72 ? FATMAN_JOE_LONG_ACTION_DURATION : FATMAN_JOE_SHORT_ACTION_DURATION;
}

export function fatmanJoeShellVelocity(originX: number, originY: number, targetX: number, targetY: number): readonly [number, number] {
  const velocity = FATMAN_JOE_SHELL_VELOCITIES_NES[fatmanJoeAimHeading(originX, originY, targetX, targetY) - 14] ?? FATMAN_JOE_SHELL_VELOCITIES_NES[2];
  return [velocity[0] * NES_FRAME_RATE * NES_WORLD_X_SCALE, velocity[1] * NES_FRAME_RATE * NES_WORLD_Y_SCALE];
}

export function fatmanJoeMineCount(age: number): number {
  const frame = Math.round(age * NES_FRAME_RATE);
  const splitFrame = Math.round(FATMAN_JOE_SHELL_SPLIT_DELAY * NES_FRAME_RATE);
  const intervalFrames = Math.round(FATMAN_JOE_MINE_INTERVAL * NES_FRAME_RATE);
  if (frame < splitFrame) return 0;
  return Math.min(FATMAN_JOE_MINE_OFFSETS_NES.length, Math.floor((frame - splitFrame) / intervalFrames) + 1);
}

export function fatmanJoeOpeningY(age: number): number {
  return Math.max(0, Math.min(1, age / FATMAN_JOE_ENTRY_DURATION)) * FATMAN_JOE_ENTRY_END_Y;
}
const FATMAN_JOE_COMBAT_PATH_NES = [[0, 112], [50, 142], [80, 124], [110, 93], [130, 94], [180, 89], [280, 56], [350, 158], [390, 158], [420, 54], [450, 40], [480, 75], [500, 98], [530, 121]] as const;

export function fatmanJoeCombatY(age: number): number {
  const frame = Math.max(0, age * NES_FRAME_RATE - FATMAN_JOE_ENTRY_DURATION * NES_FRAME_RATE);
  const first = FATMAN_JOE_COMBAT_PATH_NES[0]!;
  if (frame <= first[0]) return first[1] * NES_WORLD_Y_SCALE;
  const last = FATMAN_JOE_COMBAT_PATH_NES.at(-1)!;
  if (frame >= last[0]) return last[1] * NES_WORLD_Y_SCALE;
  const nextIndex = FATMAN_JOE_COMBAT_PATH_NES.findIndex(([at]) => at >= frame);
  const previous = FATMAN_JOE_COMBAT_PATH_NES[nextIndex - 1]!;
  const next = FATMAN_JOE_COMBAT_PATH_NES[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return (previous[1] + (next[1] - previous[1]) * amount) * NES_WORLD_Y_SCALE;
}
export const WINGATE_ENTRY_X_NES = [64, 104, 152, 192] as const;
export const WINGATE_ENTRY_X_LANES = WINGATE_ENTRY_X_NES.map((value) => value * NES_WORLD_X_SCALE);
export const WINGATE_ENTRY_Y_NES = 0;
export const WINGATE_ENTRY_Y = WINGATE_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const WINGATE_ENTRY_END_Y_NES = 98;
export const WINGATE_ENTRY_END_Y = WINGATE_ENTRY_END_Y_NES * NES_WORLD_Y_SCALE;
export const WINGATE_ENTRY_DURATION = 151 / NES_FRAME_RATE;
export const WINGATE_SECOND_ENTRY_Y_NES = 0;
export const WINGATE_SECOND_ENTRY_Y = WINGATE_SECOND_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const WINGATE_ENTRY_RUSH_DURATION = 34 / NES_FRAME_RATE;
export const WINGATE_MOVEMENT_SPEED = (131 / 240) * NES_FRAME_RATE * NES_WORLD_X_SCALE;
export const WINGATE_SECOND_SPAWN_DELAY = 264 / NES_FRAME_RATE;
export const WINGATE_FIRST_SHOT_DELAY = 4 / NES_FRAME_RATE;
export const WINGATE_SECOND_FIRST_SHOT_DELAY = 277 / NES_FRAME_RATE;
export const WINGATE_ATTACK_INTERVAL = 12 / NES_FRAME_RATE;
export const WINGATE_FIRE_CHANCE = 0.75;
export const WINGATE_BULLET_LIFETIME = 64 / NES_FRAME_RATE;
export const WINGATE_BULLET_VELOCITIES_NES = [[1.15625, 1.40625], [0.9140625, 1.65625], [0.625, 1.8515625], [0.3125, 1.9453125], [0, 2], [-0.3125, 1.9453125], [-0.625, 1.8515625], [-0.9140625, 1.65625], [-1.15625, 1.40625]] as const;
export const WINGATE_PROJECTILE_X_OFFSET_NES = -8;
export const WINGATE_PROJECTILE_Y_OFFSET_NES = 6;

export function wingateOpeningY(age: number): number {
  return Math.max(0, Math.min(1, age / WINGATE_ENTRY_DURATION)) * WINGATE_ENTRY_END_Y;
}
// [combat frame, NES x, NES y] keyframes from the unhurt decoy/real traces.
const WINGATE_RUSH_PATH_NES = [[0, 0], [17, 0], [18, -1], [19, -3], [20, -4], [21, -6], [22, -8], [23, -9], [24, -11], [25, -13], [26, -13], [27, -15], [28, -17], [29, -18], [30, -19], [31, -21], [32, -22], [33, -23], [34, -26]] as const;

const WINGATE_TRACE_PATHS_NES = [
  [[0, 152, 98], [16, 152, 58], [32, 128, 56], [34, 126, 56], [48, 117, 58], [64, 109, 60], [80, 102, 62], [96, 91, 64], [112, 83, 66], [128, 76, 68], [144, 65, 69], [160, 56, 69], [176, 50, 69], [192, 38, 69], [208, 35, 58], [224, 60, 53], [240, 83, 53], [256, 76, 53], [272, 68, 53], [288, 56, 53], [304, 63, 53], [320, 71, 53], [336, 83, 53], [368, 83, 53], [416, 83, 53], [448, 76, 53], [464, 71, 52], [480, 79, 42], [496, 79, 50], [512, 79, 60], [528, 79, 74], [544, 79, 82], [560, 80, 91], [576, 82, 83], [592, 71, 60], [608, 95, 60], [624, 104, 60], [640, 110, 60], [656, 110, 74], [672, 110, 84], [688, 110, 92], [704, 110, 60], [720, 128, 46], [736, 140, 57], [752, 151, 59], [768, 157, 61], [784, 149, 61], [800, 138, 61], [816, 131, 61], [832, 123, 61], [848, 118, 69], [864, 118, 77], [880, 118, 87], [896, 118, 87], [912, 119, 56], [928, 142, 63], [944, 150, 67], [960, 150, 75], [976, 150, 89], [992, 150, 82], [1008, 146, 52], [1024, 124, 57], [1040, 117, 59], [1049, 111, 60]] as const,
  [[0, 192, 98], [16, 192, 58], [32, 167, 50], [34, 165, 50], [48, 155, 50], [64, 147, 50], [80, 140, 50], [96, 129, 50], [112, 121, 50], [128, 114, 50], [144, 107, 50], [224, 107, 50], [240, 102, 50], [256, 94, 50], [272, 87, 50], [279, 82, 50], [288, 77, 54], [304, 72, 61], [320, 72, 69], [336, 72, 83], [352, 72, 93], [368, 72, 63], [384, 83, 40], [400, 100, 51], [416, 108, 51], [432, 120, 51], [448, 126, 51], [464, 133, 53], [480, 133, 67], [496, 133, 75], [512, 133, 85], [528, 133, 93], [544, 133, 59], [560, 114, 74], [576, 110, 80], [592, 105, 85], [672, 98, 85], [688, 92, 85], [704, 80, 85], [720, 72, 85], [736, 65, 85], [752, 65, 99], [768, 65, 59], [784, 90, 51], [800, 100, 51], [816, 107, 51], [832, 115, 51], [848, 127, 51], [864, 133, 51], [880, 125, 51], [896, 113, 51], [912, 107, 51], [928, 98, 51], [944, 87, 51], [960, 80, 51], [976, 72, 51], [992, 67, 51], [1024, 67, 51], [1049, 67, 51]] as const,
] as const;

export function wingateRushOffset(frame: number, entryX = 152): number {
  const clamped = Math.max(0, Math.min(WINGATE_ENTRY_RUSH_DURATION * NES_FRAME_RATE, frame));
  const nextIndex = WINGATE_RUSH_PATH_NES.findIndex(([at]) => at >= clamped);
  const direction = entryX < 128 ? -1 : 1;
  if (nextIndex < 0) return WINGATE_RUSH_PATH_NES.at(-1)![1] * direction;
  if (nextIndex === 0) return 0;
  const previous = WINGATE_RUSH_PATH_NES[nextIndex - 1]!;
  const next = WINGATE_RUSH_PATH_NES[nextIndex]!;
  return (previous[1] + (next[1] - previous[1]) * ((clamped - previous[0]) / (next[0] - previous[0]))) * direction;
}

export function wingateCombatY(age: number, phase = 0): number {
  const frame = Math.max(0, age * NES_FRAME_RATE - WINGATE_ENTRY_DURATION * NES_FRAME_RATE);
  const path = WINGATE_TRACE_PATHS_NES[phase > 0 ? 1 : 0];
  const first = path[0]!;
  if (frame <= first[0]) return first[2] * NES_WORLD_Y_SCALE;
  const last = path.at(-1)!;
  if (frame >= last[0]) return last[2] * NES_WORLD_Y_SCALE;
  const nextIndex = path.findIndex(([at]) => at >= frame);
  const previous = path[nextIndex - 1]!;
  const next = path[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return (previous[2] + (next[2] - previous[2]) * amount) * NES_WORLD_Y_SCALE;
}

export function wingateCombatX(age: number, phase = 0, entryX = 152): number {
  const frame = Math.max(0, age * NES_FRAME_RATE - WINGATE_ENTRY_DURATION * NES_FRAME_RATE);
  const path = WINGATE_TRACE_PATHS_NES[phase > 0 ? 1 : 0];
  const base = path[0]![1];
  const mirror = entryX < 128 ? -1 : 1;
  const position = (at: number): number => entryX + (at - base) * mirror;
  if (frame <= path[0]![0]) return position(path[0]![1]);
  const last = path.at(-1)!;
  if (frame >= last[0]) return position(last[1]);
  const nextIndex = path.findIndex(([at]) => at >= frame);
  const previous = path[nextIndex - 1]!;
  const next = path[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return position(previous[1] + (next[1] - previous[1]) * amount);
}

export function wingateAimHeading(originX: number, originY: number, targetX: number, targetY: number): number {
  return nesAimHeading(originX, originY, targetX, targetY);
}

export function wingateCanFire(originX: number, originY: number, targetX: number, targetY: number, random: number): boolean {
  const heading = wingateAimHeading(originX, originY, targetX, targetY);
  return random >= 1 - WINGATE_FIRE_CHANCE && heading >= 12 && heading <= 20;
}

export function wingateProjectileVelocity(originX: number, originY: number, targetX: number, targetY: number): readonly [number, number] {
  const velocity = WINGATE_BULLET_VELOCITIES_NES[wingateAimHeading(originX, originY, targetX, targetY) - 12] ?? WINGATE_BULLET_VELOCITIES_NES[4];
  return [velocity[0] * NES_FRAME_RATE * NES_WORLD_X_SCALE, velocity[1] * NES_FRAME_RATE * NES_WORLD_Y_SCALE];
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

export function fatmanJoeArenaXBounds(): readonly [number, number] {
  const halfWidth = (ROAD_WIDTHS[4] ?? 650) / 2;
  return [480 - halfWidth, 480 + halfWidth];
}

export const WANTED_COSTS = [20_000, 24_000, 50_000, 40_000, 40_000, 60_000] as const;
export const BOSS_REWARDS = [10_000, 12_000, 25_000, 20_000, 20_000, 30_000] as const;

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
  pistol: { cost: 0, interval: 4 / NES_FRAME_RATE, damage: 1, maxAmmo: Number.POSITIVE_INFINITY },
  shotgun: { cost: SHOP_COSTS.shotgun, interval: 12 / NES_FRAME_RATE, damage: 1, maxAmmo: 120 },
  machinegun: { cost: SHOP_COSTS.machinegun, interval: 5 / NES_FRAME_RATE, damage: 1, maxAmmo: 400 },
  magnum: { cost: SHOP_COSTS.magnum, interval: 4 / NES_FRAME_RATE, damage: 3, maxAmmo: 100 },
};

export const AMMO_GAIN: Record<WeaponName, number> = {
  pistol: 0,
  shotgun: 20,
  machinegun: 40,
  magnum: 10,
};

export function hasSpecialAmmoStock(ammo: Record<"shotgun" | "machinegun" | "magnum", number>): boolean {
  return ammo.shotgun > 0 || ammo.machinegun > 0 || ammo.magnum > 0;
}

export function hasWeaponStock(stock: number): boolean {
  return stock > 0;
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function shouldLoopStage(scroll: number, round: number, hasWanted: boolean): boolean {
  return scroll >= (ROUND_LENGTHS[round - 1] ?? ROUND_LENGTHS[0]!) && !hasWanted;
}

export function segmentDelay(scroll: number, at: number, speed: number): number {
  return Math.max(0, (at - scroll) / speed);
}

export function obstacleBlocks(obstacle: RoundObstacle, x: number, y: number, radius = 18): boolean {
  return y >= obstacle.at - radius && y <= obstacle.at + obstacle.length + radius &&
    x >= obstacle.x - obstacle.width / 2 - radius && x <= obstacle.x + obstacle.width / 2 + radius;
}

export function unitMaxAge(kind: "boss" | "enemy" | "pickup" | "projectile"): number {
  return kind === "boss" || kind === "projectile" ? Number.POSITIVE_INFINITY : 18;
}

export function bossReward(stage: number, phase = 0): number {
  if (stage === MAX_STAGE && phase === 0) return 0;
  return BOSS_REWARDS[stage - 1] ?? 0;
}

export function scoreBossDefeat(score: number, stage: number, phase = 0): number {
  return addScore(score, bossReward(stage, phase));
}

export function shouldClearProjectilesAfterBossDefeat(stage: number, phase = 0): boolean {
  return stage < MAX_STAGE || phase > 0;
}

export function formationEntryY(scroll: number, bossEncounter = false): number {
  return scroll + (bossEncounter ? -40 : 55);
}

export function spendPoints(points: number, cost: number): number | undefined {
  return points >= cost ? points - cost : undefined;
}
