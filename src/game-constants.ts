export interface StageDefinition {
  name: string;
  boss: string;
  bossBars: number;
  bossBarHitPoints: number;
}

export type EnemyType = "gunman" | "rifleman" | "bomber" | "sniper" | "backstabber" | "ninja" | "hatchet" | "spear" | "firebreather" | "shotgunner";
export type ItemType = "boots" | "rifle" | "ammo" | "money" | "pow" | "skull" | "horse" | "blueYashichi" | "redYashichi";

export const STAGES: readonly StageDefinition[] = [
  { name: "HICKSVILLE", boss: "BANDIT BILL", bossBars: 4, bossBarHitPoints: 3 },
  { name: "ROCKY PASS", boss: "CUTTER", bossBars: 4, bossBarHitPoints: 2 },
  { name: "NATIVE VILLAGE", boss: "DEVIL HAWK", bossBars: 5, bossBarHitPoints: 6 },
  { name: "CLIFF VALLEY", boss: "NINJA", bossBars: 4, bossBarHitPoints: 1 },
  { name: "FOREST", boss: "FATMAN JOE", bossBars: 6, bossBarHitPoints: 12 },
  { name: "WINGATE TOWN", boss: "WINGATE", bossBars: 6, bossBarHitPoints: 12 },
];

export const MAX_STAGE = STAGES.length;

export function bossHealthProfile(stage: number, phase = 0): { bars: number; hitPoints: number } {
  if (stage === MAX_STAGE && phase === 0) return { bars: 1, hitPoints: 6 };
  const definition = STAGES[stage - 1] ?? STAGES[0]!;
  return { bars: definition.bossBars, hitPoints: definition.bossBarHitPoints };
}

export function bossTotalHitPoints(stage: number, phase = 0): number {
  const profile = bossHealthProfile(stage, phase);
  return profile.bars * profile.hitPoints;
}

export function bossCurrentBarHitPoints(totalHitPoints: number, hitPointsPerBar: number): number {
  return totalHitPoints <= 0 ? 0 : (totalHitPoints - 1) % hitPointsPerBar + 1;
}
export const NES_FRAME_RATE = 60.098;
export type RomRandomState = [number, number, number, number];
export const ROM_RANDOM_SEED: RomRandomState = [0x88, 0, 0, 0];

// The AC/AD bit-1 tap seeds one carry that ripples through all four bytes.
export function advanceRomRandom(state: RomRandomState): RomRandomState {
  const next: RomRandomState = [...state];
  let carry = ((next[0]! ^ next[1]!) & 0x02) !== 0 ? 0x80 : 0;
  for (let index = 0; index < next.length; index += 1) {
    const value = next[index]!;
    next[index] = carry | (value >> 1);
    carry = (value & 0x01) !== 0 ? 0x80 : 0;
  }
  next[0] = (next[0]! + 1) & 0xff;
  return next;
}

export function mixRomRandomSum(state: RomRandomState): RomRandomState {
  const next: RomRandomState = [...state];
  next[1] = (next[1]! + next[0]!) & 0xff;
  return next;
}

export function mixRomRandomFirstSum(state: RomRandomState): RomRandomState {
  const next: RomRandomState = [...state];
  next[0] = (next[0]! + next[1]!) & 0xff;
  return next;
}

export function mixRomRandomSecondSum(state: RomRandomState): RomRandomState {
  const next: RomRandomState = [...state];
  next[2] = (next[2]! + next[3]!) & 0xff;
  return next;
}

export function mixRomRandomThirdFirstSum(state: RomRandomState): RomRandomState {
  const next: RomRandomState = [...state];
  next[2] = (next[2]! + next[0]!) & 0xff;
  return next;
}

export function mixRomRandomSecondThirdSum(state: RomRandomState): RomRandomState {
  const next: RomRandomState = [...state];
  next[1] = (next[1]! + next[2]!) & 0xff;
  return next;
}

export function mixRomRandomDifference(state: RomRandomState): RomRandomState {
  const next: RomRandomState = [...state];
  next[0] = (next[0]! - next[1]! - 1) & 0xff;
  return next;
}
export const BOSS_BAR_RECOVERY_DURATION = 8 / NES_FRAME_RATE;
export const MAX_LIVES = 5;
export const MAX_SCORE = 999_990;
export const BLUE_YASHICHI_DURATION = 360 / NES_FRAME_RATE;
export const HORSE_HIT_INVULNERABILITY = 60 / NES_FRAME_RATE;
export const MAX_POWERUP_STOCK = 4;
export const POWERUP_OVERFLOW_SCORE = 1_000;
export const LIFE_OVERFLOW_SCORE = 10_000;
export const PLAYER_DEATH_ANIMATION_DURATION = 152 / NES_FRAME_RATE;
export const PLAYER_RESPAWN_HIDDEN_DURATION = 100 / NES_FRAME_RATE;
export const PLAYER_RESPAWN_READY_DURATION = 40 / NES_FRAME_RATE;
export const PLAYER_DEATH_RECOVERY_DURATION = PLAYER_DEATH_ANIMATION_DURATION + PLAYER_RESPAWN_HIDDEN_DURATION + PLAYER_RESPAWN_READY_DURATION;

export function advanceInvulnerability(duration: number, destroysEnemies: boolean, delta: number): { duration: number; destroysEnemies: boolean } {
  const remaining = Math.max(0, duration - delta);
  return remaining === 0 && destroysEnemies
    ? { duration: HORSE_HIT_INVULNERABILITY, destroysEnemies: false }
    : { duration: remaining, destroysEnemies: remaining > 0 && destroysEnemies };
}

export function playerDeathPhase(age: number): "dying" | "hidden" | "ready" | "active" {
  if (age < PLAYER_DEATH_ANIMATION_DURATION) return "dying";
  if (age < PLAYER_DEATH_ANIMATION_DURATION + PLAYER_RESPAWN_HIDDEN_DURATION) return "hidden";
  if (age < PLAYER_DEATH_RECOVERY_DURATION) return "ready";
  return "active";
}

export function storedPowerupPickup(stock: number): { stock: number; score: number } {
  return stock >= MAX_POWERUP_STOCK ? { stock: MAX_POWERUP_STOCK, score: POWERUP_OVERFLOW_SCORE } : { stock: stock + 1, score: 0 };
}

export function lifePickup(lives: number): { lives: number; score: number } {
  return lives >= MAX_LIVES ? { lives: MAX_LIVES, score: LIFE_OVERFLOW_SCORE } : { lives: lives + 1, score: 0 };
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
export const ROM_SCREEN_RELEASE_Y_NES = 252;
export const ROM_PROJECTILE_SCREEN_SIZE_NES = 256;

export function romActorScreenYReleased(screenY: number): boolean {
  return Math.round(screenY) >= ROM_SCREEN_RELEASE_Y_NES;
}

export function romProjectileOnScreen(screenX: number, screenY: number): boolean {
  return screenX >= 0 && screenX < ROM_PROJECTILE_SCREEN_SIZE_NES && screenY >= 0 && screenY < ROM_PROJECTILE_SCREEN_SIZE_NES;
}
export const NES_PLAYER_SPEED = 75 * (NES_FRAME_RATE / 60);
export const WORLD_PLAYER_SPEED = NES_PLAYER_SPEED * NES_WORLD_Y_SCALE;
export const BOOTS_SPEED_MULTIPLIER = 4 / 3;
export const NES_BULLET_SPEED = 6 * NES_FRAME_RATE;
export const WORLD_BULLET_SPEED = NES_BULLET_SPEED * NES_WORLD_Y_SCALE;
export const PLAYER_BULLET_CAPACITY = 6;
export const ENEMY_PROJECTILE_CAPACITY = 8;
export const BOSS_PROJECTILE_CAPACITY = 6;
export const EMPTY_BARREL_EXPLOSION_LIFETIME = 10 / NES_FRAME_RATE;
export const ENEMY_DEFEAT_ANIMATION_DURATION = 5 / NES_FRAME_RATE;
export const ENEMY_DEFEAT_Y_OFFSETS_NES = [0, -4, -7, -10, -12] as const;
export const BOSS_DEFEAT_ANIMATION_DURATION = 30 / NES_FRAME_RATE;
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

export function bomberMovementUsesRandom(actorY: number): boolean {
  const screenY = actorY / NES_WORLD_Y_SCALE;
  return screenY >= 48 && screenY < 192;
}

export function bomberMovementDecision(actorY: number, randomByte: number): { throwDynamite: boolean; direction: number } {
  const screenY = actorY / NES_WORLD_Y_SCALE;
  if (screenY < 48) return { throwDynamite: false, direction: 0 };
  if (screenY >= 192) return { throwDynamite: false, direction: 4 };
  const byte = Math.max(0, Math.min(255, Math.floor(randomByte))) & 0xff;
  return { throwDynamite: Boolean(byte & 0x80), direction: (byte & 0x1c) >> 2 };
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

export function contactSourceShouldClear(kind: "enemy" | "boss" | "enemyBullet", projectileType?: string, dynamiteInFlight = false, bossProjectile = false): boolean {
  if (kind !== "enemyBullet") return false;
  if (projectileType === "dynamite") return dynamiteInFlight;
  if (bossProjectile) return projectileType === "bullet" || projectileType === "shuriken";
  return projectileType !== "boomerang" && projectileType !== "grenade" && projectileType !== "grenadeShell" && projectileType !== "rock";
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
export const SNIPER_COVER_DURATION = 90 / NES_FRAME_RATE;
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

export const ROCK_IMPACT_DELAY = 96 / NES_FRAME_RATE;
export const ROCK_IMPACT_LIFETIME = 25 / NES_FRAME_RATE;
export const ROCK_LIFETIME = 121 / NES_FRAME_RATE;
export const ROCK_FLIGHT_PATH_PHASE0_NES = [[0, 0, 0], [8, 19, 6], [16, 36, 18], [24, 51, 34], [32, 61, 54], [40, 67, 77], [48, 82, 79], [56, 102, 79], [64, 121, 84], [72, 139, 94], [80, 155, 109], [88, 167, 127], [94, 174, 143]] as const;
export const ROCK_FLIGHT_PATH_NES = [[0, 0, 0], [8, 19, 4], [16, 34, 19], [24, 41, 41], [32, 61, 43], [40, 78, 55], [48, 90, 73], [56, 96, 96], [64, 116, 98], [72, 134, 106], [80, 149, 122], [88, 160, 142], [96, 165, 166]] as const;
export const ROCK_SCREEN_MAX_Y_NES = 252;

export function fallingRockPosition(age: number, fromLeft: boolean, phase = 1): readonly [number, number] {
  const path = phase === 0 ? ROCK_FLIGHT_PATH_PHASE0_NES : ROCK_FLIGHT_PATH_NES;
  const frame = Math.min(96, Math.max(0, age * NES_FRAME_RATE));
  const nextIndex = path.findIndex(([at]) => at >= frame);
  const direction = fromLeft ? 1 : -1;
  if (nextIndex <= 0) return [0, 0];
  const previous = path[nextIndex - 1]!;
  const next = path[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return [(previous[1] + (next[1] - previous[1]) * amount) * direction, previous[2] + (next[2] - previous[2]) * amount];
}

export function fallingRockOnScreen(screenY: number): boolean {
  return screenY >= 0 && screenY < ROCK_SCREEN_MAX_Y_NES;
}
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

function moveEncodedHeading(state: { x: number; y: number }, encodedHeading: number): void {
  const [velocityX, velocityY] = SNIPER_BULLET_VELOCITIES_NES[encodedHeading & 31] ?? SNIPER_BULLET_VELOCITIES_NES[0];
  const tier = encodedHeading & 0xc0;
  const speed = tier === 0xc0 ? 0 : (tier >> 6) + 1;
  state.x += velocityX * speed;
  state.y += velocityY * speed;
}

export function advanceSpear(state: SpearState, targetFrame: number, playerX: number, playerY: number, randomByte: () => number): { readonly shots: readonly number[]; readonly dead: boolean } {
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
      else state.heading = 0x44 | (randomByte() & 0x18);
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
  return { shots, dead: romActorScreenYReleased(state.y) };
}

export const BACKSTABBER_AMBUSH_DROP_SPEED = 45;
export const BACKSTABBER_AMBUSH_DEPTH = 178;
export const BACKSTABBER_AMBUSH_LIFETIME = 532 / NES_FRAME_RATE;
export const BACKSTABBER_RAID_PATH = [[0, 0, 0], [40, 66, -15], [80, 103, 42], [120, 129, 44], [160, 174, 89], [200, 184, 83], [368, 213, 74]] as const;
export const BACKSTABBER_RAID_LIFETIME = 369 / NES_FRAME_RATE;
export const GUNMAN_FIRST_OPPORTUNITY_FRAMES = [40, 52, 58, 62] as const;
export const GUNMAN_SHOT_OPPORTUNITY_INTERVAL = 64 / NES_FRAME_RATE;
export const GUNMAN_LIFETIME = 560 / NES_FRAME_RATE;
// The measured center route releases at 549; side routes are kept at the
// existing 560-frame pool cap until their player-relative retreat is traced.
export const GUNMAN_TOP_LIFETIMES_FRAMES = { center: 549, left: 828, right: 1196 } as const;
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

const GUNMAN_TOP_PATHS_NES = {
  center: [[0, 88, 1], [16, 88, 22], [32, 88, 43], [48, 88, 64], [64, 92, 83], [80, 97, 103], [96, 102, 124], [112, 110, 134], [128, 122, 132], [144, 135, 134], [160, 148, 136], [176, 161, 138], [192, 174, 141], [208, 187, 143], [224, 200, 148], [240, 211, 163], [256, 205, 177], [272, 191, 183], [288, 191, 174], [304, 191, 163], [320, 191, 152], [336, 191, 142], [352, 191, 131], [368, 191, 120], [384, 191, 110], [400, 191, 99], [416, 191, 88], [432, 191, 78], [448, 191, 67], [464, 191, 56], [480, 191, 46], [496, 191, 35], [512, 191, 24], [528, 191, 14], [544, 191, 3], [548, 191, 0]],
  left: [[0, 88, 1], [16, 88, 22], [32, 88, 43], [48, 88, 64], [64, 83, 83], [80, 78, 103], [96, 73, 124], [112, 65, 134], [128, 53, 132], [144, 45, 132], [160, 47, 122], [176, 50, 111], [192, 52, 101], [208, 55, 91], [224, 57, 80], [240, 60, 71], [256, 62, 60], [272, 65, 50], [288, 67, 41], [304, 74, 51], [320, 71, 72], [336, 69, 94], [352, 66, 114], [368, 62, 133], [384, 50, 133], [400, 38, 132], [416, 25, 130], [432, 13, 130], [448, 13, 133], [464, 18, 133], [480, 12, 136], [496, 12, 141], [512, 12, 146], [528, 12, 152], [544, 12, 157], [560, 12, 162], [576, 12, 168], [592, 12, 173], [608, 12, 178], [624, 12, 184], [640, 12, 189], [650, 12, 192], [828, 12, 252]],
  right: [[0, 88, 1], [16, 88, 22], [32, 88, 43], [48, 88, 64], [64, 96, 80], [80, 106, 95], [96, 117, 110], [112, 128, 124], [128, 139, 138], [144, 151, 151], [160, 163, 162], [176, 169, 156], [192, 174, 147], [208, 179, 137], [224, 185, 129], [240, 196, 127], [256, 209, 134], [272, 215, 130], [288, 217, 131], [304, 207, 137], [320, 194, 142], [336, 181, 148], [352, 168, 153], [368, 154, 158], [384, 141, 164], [400, 128, 169], [416, 115, 174], [432, 101, 180], [448, 88, 185], [464, 75, 190], [480, 62, 196], [496, 48, 201], [512, 44, 201], [528, 56, 204], [544, 69, 209], [560, 82, 211], [576, 95, 214], [592, 108, 216], [608, 121, 218], [624, 134, 221], [640, 146, 219], [656, 158, 218], [672, 163, 214], [688, 165, 204], [704, 170, 194], [720, 175, 185], [736, 180, 175], [752, 185, 166], [768, 190, 157], [784, 195, 147], [800, 200, 137], [816, 206, 129], [832, 217, 127], [848, 230, 134], [864, 242, 146], [880, 247, 140], [896, 244, 135], [912, 232, 135], [928, 220, 134], [944, 207, 133], [960, 195, 132], [976, 188, 124], [992, 188, 113], [1008, 196, 107], [1024, 209, 107], [1040, 221, 117], [1056, 228, 136], [1072, 233, 156], [1088, 238, 176], [1104, 243, 197], [1120, 248, 216], [1136, 247, 218], [1152, 242, 209], [1168, 237, 199], [1184, 232, 189], [1195, 229, 183]],
} as const;

export type GunmanTopBranch = keyof typeof GUNMAN_TOP_PATHS_NES;

export function gunmanTopBranch(targetX: number, originX: number): GunmanTopBranch {
  const relative = targetX - originX;
  return relative < 0 ? "left" : relative > 96 ? "right" : "center";
}

export function gunmanTopPosition(age: number, targetX: number, originX = 88, originY = 0): readonly [number, number] {
  const path = GUNMAN_TOP_PATHS_NES[gunmanTopBranch(targetX, originX)];
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const first = path[0]!;
  const last = path.at(-1)!;
  const point = (entry: readonly [number, number, number]): readonly [number, number] => [
    (originX + entry[1] - 88) * NES_WORLD_X_SCALE,
    (originY + entry[2]) * NES_WORLD_Y_SCALE,
  ];
  if (frame <= first[0]) return point(first);
  if (frame >= last[0]) return point(last);
  const nextIndex = path.findIndex(([at]) => at >= frame);
  const previous = path[nextIndex - 1]!;
  const next = path[nextIndex]!;
  const amount = (frame - previous[0]) / (next[0] - previous[0]);
  return point([
    frame,
    previous[1] + (next[1] - previous[1]) * amount,
    previous[2] + (next[2] - previous[2]) * amount,
  ]);
}

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
export const BANDIT_BILL_PROJECTILE_OFFSET_NES = [-4, 8] as const;
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
// X/Y keyframes sampled from the clean Round 1 Boss trace. The actor's lane
// offset is applied by banditBillCombatPosition for the other entry lanes.
const BANDIT_BILL_COMBAT_PATH_NES = [[0, 192, 64], [11, 192, 72], [47, 192, 72], [64, 187, 66], [80, 181, 59], [96, 173, 49], [112, 180, 49], [119, 186, 49], [128, 186, 49], [160, 186, 49], [176, 178, 49], [192, 166, 49], [208, 160, 49], [224, 151, 49], [227, 147, 49], [240, 147, 49], [272, 148, 49], [288, 160, 49], [304, 166, 49], [320, 175, 49], [335, 186, 49], [352, 186, 49], [368, 186, 49], [384, 191, 43], [400, 192, 42], [416, 186, 49], [432, 187, 59], [443, 192, 64], [464, 192, 64], [480, 192, 64], [496, 197, 59], [512, 202, 52], [528, 205, 49], [544, 200, 55], [551, 196, 60], [576, 196, 60], [592, 196, 60], [608, 196, 50], [624, 196, 42], [640, 196, 50], [656, 196, 60], [672, 196, 66], [688, 196, 66], [704, 196, 68], [720, 196, 82], [736, 196, 90], [752, 196, 100], [768, 196, 114], [784, 196, 114], [800, 196, 114], [816, 200, 109], [832, 205, 103], [848, 205, 103], [864, 197, 113], [880, 192, 118], [896, 192, 118], [912, 192, 118], [928, 185, 118], [944, 180, 118], [960, 192, 118], [976, 199, 118], [992, 205, 118], [1008, 205, 118], [1024, 205, 118], [1040, 197, 118], [1056, 185, 118], [1072, 179, 118], [1088, 171, 118], [1104, 166, 118], [1168, 166, 112], [1232, 166, 88], [1296, 166, 48], [1360, 170, 46], [1424, 193, 74], [1488, 193, 50], [1552, 193, 52], [1616, 191, 49], [1680, 199, 51], [1744, 207, 63], [1808, 194, 63], [1872, 169, 63], [1936, 165, 74], [2000, 150, 74], [2064, 125, 58], [2128, 135, 70], [2192, 135, 70], [2256, 125, 74], [2320, 125, 58], [2384, 138, 43], [2448, 142, 49], [2512, 142, 81], [2576, 142, 107], [2640, 142, 127], [2704, 118, 99], [2768, 114, 83], [2832, 114, 45], [2896, 134, 45], [2960, 154, 45], [3024, 167, 78], [3088, 179, 84], [3152, 203, 84], [3216, 198, 91], [3280, 184, 108], [3344, 198, 125], [3408, 190, 107], [3472, 190, 67]] as const;
const BANDIT_BILL_COMBAT_PATH_EXTENDED_NES = [...BANDIT_BILL_COMBAT_PATH_NES, [3488, 190, 115], [3520, 190, 99], [3552, 190, 75], [3584, 190, 67], [3600, 190, 67], [4096, 125, 74], [4608, 81, 50], [5120, 158, 115], [5632, 190, 99], [6144, 79, 117], [6656, 78, 87], [7168, 162, 88], [7680, 187, 95]] as const;

function banditBillCombatPosition(age: number, entryX = 192 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE - BANDIT_BILL_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 192;
  const first = BANDIT_BILL_COMBAT_PATH_EXTENDED_NES[0]!;
  const last = BANDIT_BILL_COMBAT_PATH_EXTENDED_NES.at(-1)!;
  const sampledFrame = Math.min(frame, last[0]);
  if (sampledFrame <= first[0]) return [(first[1] + laneOffset) * NES_WORLD_X_SCALE, first[2] * NES_WORLD_Y_SCALE];
  const nextIndex = BANDIT_BILL_COMBAT_PATH_EXTENDED_NES.findIndex(([at]) => at >= sampledFrame);
  const previous = BANDIT_BILL_COMBAT_PATH_EXTENDED_NES[nextIndex - 1]!;
  const next = BANDIT_BILL_COMBAT_PATH_EXTENDED_NES[nextIndex]!;
  const amount = (sampledFrame - previous[0]) / (next[0] - previous[0]);
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

export const BANDIT_BILL_RANDOM_ROUTE_START_FRAME = 7_680;
export const BANDIT_BILL_ATTACK_PAUSE_FRAMES = 37;
export const BANDIT_BILL_ROUTE_HANDOFF_PAUSE_FRAMES = 24;

export type BanditBillMovementState = {
  frame: number;
  x: number;
  y: number;
  heading: number;
  segmentFrames: number;
  gait: number;
  pauseFrames: number;
};

export function createBanditBillMovementState(x: number, y: number): BanditBillMovementState {
  return { frame: BANDIT_BILL_RANDOM_ROUTE_START_FRAME, x, y, heading: 0x58, segmentFrames: 0, gait: 1, pauseFrames: BANDIT_BILL_ROUTE_HANDOFF_PAUSE_FRAMES };
}

export function advanceBanditBillMovement(state: BanditBillMovementState, targetFrame: number, randomByte: () => number): void {
  while (state.frame < targetFrame) {
    state.frame += 1;
    if (state.pauseFrames > 0) {
      state.pauseFrames -= 1;
      continue;
    }
    if (state.segmentFrames === 0) {
      const random = randomByte() & 0xff;
      state.heading = (random & 0x1c) | 0x40;
      state.segmentFrames = ((random & 0x03) + 1) * 24;
    }
    state.segmentFrames -= 1;
    state.gait = (state.gait - 1) & 0xff;
    if ((state.gait & 0x7f) === 0) state.gait = (state.gait & 0x80) !== 0 ? 4 : 0x88;
    if ((state.gait & 0x80) === 0) moveEncodedHeading(state, state.heading);
    const x = Math.floor(state.x);
    const y = Math.floor(state.y);
    if (x < 64 || x >= 208 || y < 40 || y >= 128) {
      state.heading = (state.heading + 0x10) & 0xdf;
      moveEncodedHeading(state, state.heading);
    }
  }
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
export const CUTTER_BOOMERANG_SCREEN_MIN_X_NES = 24;
export const CUTTER_BOOMERANG_SCREEN_MAX_X_NES = 248;
export const CUTTER_BOOMERANG_SCREEN_MAX_Y_NES = 252;

export function cutterBoomerangOnScreen(screenX: number, screenY: number): boolean {
  return screenX >= CUTTER_BOOMERANG_SCREEN_MIN_X_NES && screenX < CUTTER_BOOMERANG_SCREEN_MAX_X_NES && screenY >= 0 && screenY < CUTTER_BOOMERANG_SCREEN_MAX_Y_NES;
}

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
const CUTTER_COMBAT_PATH_NES = [[0, 129, 136], [16, 129, 136], [26, 129, 136], [27, 127, 134], [32, 119, 123], [48, 91, 90], [64, 63, 56], [71, 51, 41], [80, 51, 41], [112, 51, 41], [128, 51, 41], [131, 50, 40], [144, 56, 47], [176, 66, 59], [208, 80, 76], [240, 77, 92], [256, 71, 99], [288, 81, 86], [304, 109, 52], [311, 119, 40], [320, 119, 40], [352, 119, 40], [384, 126, 40], [416, 141, 40], [448, 159, 40], [464, 164, 45], [496, 176, 61], [512, 182, 68], [528, 182, 68], [544, 172, 55], [560, 160, 40], [576, 160, 40], [640, 160, 64], [704, 164, 84], [768, 145, 98], [832, 98, 41], [896, 98, 65], [960, 92, 105], [1024, 59, 105], [1088, 112, 40], [1152, 111, 40], [1216, 145, 40], [1280, 152, 40], [1344, 152, 40], [1408, 152, 42], [1472, 161, 60], [1536, 172, 48], [1600, 167, 41], [1664, 190, 70], [1728, 176, 98], [1792, 167, 109], [1856, 111, 41], [1920, 111, 49], [1984, 111, 95], [2048, 85, 105], [2112, 138, 40], [2176, 113, 40], [2240, 111, 56], [2304, 134, 84], [2368, 100, 41], [2432, 120, 41], [2496, 153, 41], [2560, 163, 41], [2624, 163, 41], [2688, 163, 57], [2752, 177, 86], [2816, 155, 112], [2880, 96, 41], [2944, 96, 41], [3008, 96, 79], [3072, 93, 121], [3136, 159, 41], [3200, 159, 41], [3264, 159, 49]] as const;
const CUTTER_COMBAT_PATH_EXTENDED_NES = [...CUTTER_COMBAT_PATH_NES, [3328, 96, 79], [3392, 96, 119], [3456, 152, 50], [3520, 159, 41], [3584, 159, 47], [3600, 159, 57], [4096, 146, 49], [4608, 82, 57], [5120, 74, 41], [5632, 153, 110], [6144, 70, 73], [6656, 179, 86], [7168, 109, 64], [7680, 182, 67], [8192, 210, 54], [8704, 134, 96], [9216, 79, 73], [9728, 162, 72], [10240, 91, 97], [10752, 125, 56], [11264, 138, 55], [11776, 134, 70], [12000, 112, 61]] as const;

function cutterCombatPosition(age: number, entryX = 144 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE - CUTTER_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 144;
  const first = CUTTER_COMBAT_PATH_EXTENDED_NES[0]!;
  const point = (sample: readonly [number, number, number]): readonly [number, number] => [
    (sample[1] + laneOffset) * NES_WORLD_X_SCALE,
    sample[2] * NES_WORLD_Y_SCALE,
  ];
  const last = CUTTER_COMBAT_PATH_EXTENDED_NES.at(-1)!;
  // The sampled route ends in an active random movement state; hold this
  // anchor while the runtime hands control to the decoded post-route logic.
  const sampledFrame = Math.min(frame, last[0]);
  if (sampledFrame <= first[0]) return point(first);
  const nextIndex = CUTTER_COMBAT_PATH_EXTENDED_NES.findIndex(([at]) => at >= sampledFrame);
  const previous = CUTTER_COMBAT_PATH_EXTENDED_NES[nextIndex - 1]!;
  const next = CUTTER_COMBAT_PATH_EXTENDED_NES[nextIndex]!;
  const amount = (sampledFrame - previous[0]) / (next[0] - previous[0]);
  return point([
    frame,
    previous[1] + (next[1] - previous[1]) * amount,
    previous[2] + (next[2] - previous[2]) * amount,
  ]);
}

export function cutterCombatY(age: number): number {
  return cutterCombatPosition(age)[1];
}

export function cutterCombatX(age: number, entryX = 144 * NES_WORLD_X_SCALE): number {
  return cutterCombatPosition(age, entryX)[0];
}

export const CUTTER_RANDOM_ROUTE_START_FRAME = 12_000;
const CUTTER_MOVEMENT_HEADINGS = [0x40, 0x44, 0x48, 0x48, 0x48, 0x4c, 0x4c, 0x50, 0x50, 0x50, 0x54, 0x54, 0x58, 0x58, 0x58, 0x5c] as const;

export type CutterMovementState = {
  frame: number;
  x: number;
  y: number;
  heading: number;
  segmentFrames: number;
  gait: number;
};

export function createCutterMovementState(x: number, y: number): CutterMovementState {
  return { frame: CUTTER_RANDOM_ROUTE_START_FRAME, x, y, heading: 0x58, segmentFrames: 35, gait: 0x84 };
}

export function advanceCutterMovement(state: CutterMovementState, targetFrame: number, randomByte: () => number): void {
  while (state.frame < targetFrame) {
    state.frame += 1;
    if (state.segmentFrames === 0) {
      const random = randomByte() & 0xff;
      state.heading = CUTTER_MOVEMENT_HEADINGS[random & 0x0f] ?? CUTTER_MOVEMENT_HEADINGS[0];
      state.segmentFrames = ((random & 0x03) + 1) * 24;
    }
    state.segmentFrames -= 1;
    state.gait = (state.gait - 1) & 0xff;
    if ((state.gait & 0x7f) === 0) state.gait = (state.gait & 0x80) !== 0 ? 4 : 0x88;
    if ((state.gait & 0x80) === 0) moveEncodedHeading(state, state.heading);
    const x = Math.floor(state.x);
    const y = Math.floor(state.y);
    if (x < 32 || x >= 224 || y < 40 || y >= 144) {
      state.heading = (state.heading + 0x10) & 0xdf;
      moveEncodedHeading(state, state.heading);
    }
  }
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
export const DEVIL_HAWK_ATTACK_FRAMES = [174, 365, 459, 722, 815] as const;
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

export function devilHawkAttackDelay(age: number): number {
  const frame = Math.round(age * NES_FRAME_RATE);
  const next = DEVIL_HAWK_ATTACK_FRAMES.find((at) => at > frame) ?? frame + Math.round(DEVIL_HAWK_VOLLEY_INTERVAL * NES_FRAME_RATE);
  return Math.max(1, next - frame) / NES_FRAME_RATE;
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
  [1057, 109], [1121, 73], [1185, 79], [1249, 79], [1313, 91], [1377, 49], [1441, 47], [1505, 104], [1569, 96],
  [1633, 64], [1697, 86], [1761, 113], [1825, 65], [1889, 49], [1953, 49], [2017, 61], [2081, 66],
  [2145, 72], [2209, 56], [2273, 58], [2337, 110], [2401, 133], [2465, 144], [2529, 79], [2593, 54],
  [2657, 68], [2721, 68], [2785, 71], [2849, 74], [2913, 74], [2977, 74], [3041, 74], [3105, 74],
  [3169, 57], [3233, 68], [3297, 109], [3361, 133], [3425, 85],
] as const;
const DEVIL_HAWK_COMBAT_X_NES = [
  [0, 208], [113, 208], [114, 207], [118, 196], [122, 192], [130, 180], [145, 157], [146, 157], [173, 155],
  [175, 152], [187, 146], [199, 140], [209, 137], [236, 135], [249, 128], [261, 122], [273, 116],
  [283, 113], [334, 113], [390, 111], [391, 109], [392, 110], [399, 114], [402, 115], [409, 117],
  [419, 120], [480, 127], [483, 130], [491, 131], [522, 135], [534, 140], [546, 145], [558, 149],
  [596, 156], [608, 162], [620, 169], [632, 174], [640, 176], [691, 176], [764, 176], [807, 176],
  [834, 175], [837, 166], [847, 157], [865, 136], [950, 137], [953, 141], [963, 143], [990, 143],
  [991, 142], [1001, 136], [1008, 134], [1021, 130], [1057, 130], [1121, 129], [1185, 134], [1249, 134], [1313, 144],
  [1377, 152], [1441, 152], [1505, 129], [1569, 127], [1633, 127], [1697, 108], [1761, 99], [1825, 99],
  [1889, 86], [1953, 105], [2017, 121], [2081, 131], [2145, 131], [2209, 131], [2273, 128], [2337, 128],
  [2401, 111], [2465, 101], [2529, 119], [2593, 123], [2657, 136], [2721, 145], [2785, 134], [2849, 136],
  [2913, 136], [2977, 136], [3041, 129], [3105, 109], [3169, 123], [3233, 129], [3297, 129], [3361, 122], [3425, 122],
] as const;
const DEVIL_HAWK_COMBAT_PATH_EXTENDED_NES = [[3488, 133], [3520, 128], [3552, 85], [3584, 77], [3600, 65], [4096, 77], [4608, 121], [5120, 46], [5632, 47], [6144, 144], [6656, 76], [7168, 77], [7680, 115], [8192, 86], [8704, 88], [9216, 76], [9728, 120], [10240, 132], [10752, 106], [11264, 84], [11776, 113], [12000, 69]] as const;
const DEVIL_HAWK_COMBAT_X_EXTENDED_NES = [[3488, 122], [3520, 122], [3552, 122], [3584, 122], [3600, 122], [4096, 128], [4608, 124], [5120, 76], [5632, 104], [6144, 113], [6656, 69], [7168, 86], [7680, 125], [8192, 111], [8704, 103], [9216, 122], [9728, 128], [10240, 111], [10752, 131], [11264, 223], [11776, 125], [12000, 142]] as const;
const DEVIL_HAWK_COMBAT_PATH_FULL_NES = [...DEVIL_HAWK_COMBAT_PATH_NES, ...DEVIL_HAWK_COMBAT_PATH_EXTENDED_NES] as const;
const DEVIL_HAWK_COMBAT_X_FULL_NES = [...DEVIL_HAWK_COMBAT_X_NES, ...DEVIL_HAWK_COMBAT_X_EXTENDED_NES] as const;
export const DEVIL_HAWK_JUMP_PERIOD = 121;

const DEVIL_HAWK_MOVEMENT_HEADINGS = [0x40, 0x40, 0x44, 0x44, 0x48, 0x48, 0x4c, 0x4c, 0x50, 0x50, 0x54, 0x54, 0x58, 0x58, 0x5c, 0x5c] as const;
const DEVIL_HAWK_ACTION_HEADINGS = [0x90, 0x90, 0x50, 0x50, 0x10, 0x10, 0x00, 0x00, 0x40, 0x40, 0x80, 0x80, 0xa2, 0x90, 0x9a, 0x20] as const;
export const DEVIL_HAWK_RANDOM_ROUTE_START_FRAME = 3_600;

export type DevilHawkMovementState = {
  frame: number;
  mode: "move" | "action" | "correction";
  x: number;
  y: number;
  heading: number;
  segmentFrames: number;
  gait: number;
  actionCounter: number;
  actionFrames: number;
  actionHeading: number;
  actionKind: "hold" | "jump";
  correctionHoldFrames: number;
  correctionReleaseFrames: number;
};

export function createDevilHawkMovementState(x: number, y: number): DevilHawkMovementState {
  return { frame: DEVIL_HAWK_RANDOM_ROUTE_START_FRAME, mode: "move", x, y, heading: 0x40, segmentFrames: 30, gait: 3, actionCounter: 30, actionFrames: 0, actionHeading: 0x40, actionKind: "hold", correctionHoldFrames: 0, correctionReleaseFrames: 0 };
}

function advanceDevilHawkGait(state: DevilHawkMovementState, heading = state.heading): void {
  state.gait = (state.gait - 1) & 0xff;
  if ((state.gait & 0x7f) === 0) state.gait = (state.gait & 0x80) !== 0 ? 4 : 0x88;
  if ((state.gait & 0x80) === 0) moveEncodedHeading(state, heading);
}

export function advanceDevilHawkMovement(state: DevilHawkMovementState, targetFrame: number, movementRandom: () => number, actionRandom: () => number): { readonly fullFans: readonly boolean[] } {
  const fullFans: boolean[] = [];
  while (state.frame < targetFrame) {
    state.frame += 1;
    if (state.mode === "action") {
      state.actionFrames -= 1;
      if (state.actionKind === "jump") advanceDevilHawkGait(state, DEVIL_HAWK_ACTION_HEADINGS[Math.max(0, state.actionFrames) >> 1] ?? state.actionHeading);
      if (state.actionKind === "hold" && state.actionFrames === 13) fullFans.push(false);
      if (state.actionKind === "jump" && state.actionFrames === 0) fullFans.push(true);
      if (state.actionFrames <= 0) state.mode = "move";
      continue;
    }
    if (state.mode === "correction") {
      if (state.correctionHoldFrames > 0) {
        state.correctionHoldFrames -= 1;
        continue;
      }
      state.actionFrames -= 1;
      if (state.actionFrames >= 0) {
        moveEncodedHeading(state, DEVIL_HAWK_ACTION_HEADINGS[Math.max(0, state.actionFrames) >> 1] ?? state.heading);
        moveEncodedHeading(state, state.heading);
        continue;
      }
      if (state.correctionReleaseFrames > 0) {
        state.correctionReleaseFrames -= 1;
        continue;
      }
      state.mode = "move";
      continue;
    }
    state.actionCounter = (state.actionCounter + 1) % 48;
    if (state.segmentFrames === 0) {
      const random = movementRandom() & 0xff;
      state.heading = DEVIL_HAWK_MOVEMENT_HEADINGS[random & 0x0f] ?? DEVIL_HAWK_MOVEMENT_HEADINGS[0];
      state.segmentFrames = ((random & 0x03) + 1) * 24;
    }
    state.segmentFrames -= 1;
    advanceDevilHawkGait(state);
    if (state.actionCounter === 0) {
      const random = actionRandom() & 0x0f;
      if (random > 0 && random < 9) {
        state.mode = "action";
        state.actionFrames = 26;
        state.actionKind = "hold";
        continue;
      }
      if (random >= 9) {
        state.mode = "action";
        state.actionFrames = 32;
        state.actionKind = "jump";
        state.actionHeading = Math.floor(state.y) >= 88 ? 0x40 : 0xc0;
        continue;
      }
    }
    const x = Math.floor(state.x);
    const y = Math.floor(state.y);
    if (x < 32 || x >= 224 || y < 48 || y >= 144) {
      state.mode = "correction";
      state.actionFrames = 32;
      state.correctionHoldFrames = 26;
      state.correctionReleaseFrames = 27;
      state.heading = 0x40 | nesAimHeading(x * NES_WORLD_X_SCALE, y * NES_WORLD_Y_SCALE, 128 * NES_WORLD_X_SCALE, 96 * NES_WORLD_Y_SCALE);
    }
  }
  return { fullFans };
}

function pingPongFrame(frame: number, endpoint: number): number {
  if (frame <= endpoint || endpoint <= 0) return frame;
  const wrapped = frame % (endpoint * 2);
  return wrapped <= endpoint ? wrapped : endpoint * 2 - wrapped;
}

export function devilHawkCombatY(age: number): number {
  const frame = Math.max(0, age * NES_FRAME_RATE - DEVIL_HAWK_ENTRY_DURATION * NES_FRAME_RATE);
  const path = DEVIL_HAWK_COMBAT_PATH_FULL_NES;
  const last = path.at(-1)!;
  const sampledFrame = pingPongFrame(frame, last[0]);
  if (sampledFrame <= path[0]![0]) return path[0]![1] * NES_WORLD_Y_SCALE;
  const nextIndex = path.findIndex(([at]) => at >= sampledFrame);
  const previous = path[nextIndex - 1]!;
  const next = path[nextIndex]!;
  const amount = (sampledFrame - previous[0]) / (next[0] - previous[0]);
  return (previous[1] + (next[1] - previous[1]) * amount) * NES_WORLD_Y_SCALE;
}

export function devilHawkCombatX(age: number, entryX = 208 * NES_WORLD_X_SCALE): number {
  const frame = Math.max(0, age * NES_FRAME_RATE - DEVIL_HAWK_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 208;
  const path = DEVIL_HAWK_COMBAT_X_FULL_NES;
  const first = path[0]!;
  const last = path.at(-1)!;
  const sampledFrame = pingPongFrame(frame, last[0]);
  if (sampledFrame <= first[0]) return (first[1] + laneOffset) * NES_WORLD_X_SCALE;
  const nextIndex = path.findIndex(([at]) => at >= sampledFrame);
  const previous = path[nextIndex - 1]!;
  const next = path[nextIndex]!;
  const amount = (sampledFrame - previous[0]) / (next[0] - previous[0]);
  return (previous[1] + (next[1] - previous[1]) * amount + laneOffset) * NES_WORLD_X_SCALE;
}
export const NINJA_BOSS_ENTRY_LANES_NES = [[112, 64], [192, 64], [120, 144], [176, 128]] as const;
export const NINJA_BOSS_ENTRY_LANES = NINJA_BOSS_ENTRY_LANES_NES.map(([x, y]) => [x * NES_WORLD_X_SCALE, y * NES_WORLD_Y_SCALE] as const);

export function ninjaBossEntryLaneIndex(randomByte: number, playerScreenY: number): number {
  let index = randomByte & 0x03;
  if (playerScreenY < 176) {
    index &= 0x01;
    if (playerScreenY < 104) index |= 0x02;
  }
  return index;
}

export const NINJA_BOSS_FIRST_PREPARE_DELAY = 140 / NES_FRAME_RATE;
export const NINJA_BOSS_PREPARE_DURATION = 40 / NES_FRAME_RATE;
export const NINJA_BOSS_PREPARE_CONTROLLER_DURATION = 7 / NES_FRAME_RATE;
export const NINJA_BOSS_FIRST_ATTACK_DELAY = 179 / NES_FRAME_RATE;
export const NINJA_BOSS_ENTRY_INVULNERABILITY = 44 / NES_FRAME_RATE;
export const NINJA_BOSS_TELEPORT_DELAY = 90 / NES_FRAME_RATE;
export const NINJA_BOSS_FIRST_NATURAL_TELEPORT = 339 / NES_FRAME_RATE;
export const NINJA_BOSS_REPEAT_NATURAL_TELEPORT = 424 / NES_FRAME_RATE;
export const NINJA_BOSS_ATTACK_INTERVAL = 60 / NES_FRAME_RATE;
export const NINJA_BOSS_SHURIKEN_COUNT = 4;
export const NINJA_BOSS_SHURIKEN_SPAWN_OFFSET_NES = [6, -34] as const;
export const NINJA_BOSS_SHURIKEN_VELOCITIES_NES = [[1.25, -1.5], [1.25, 1.5], [-1.25, 1.5], [-1.25, -1.5]] as const;
export const NINJA_BOSS_SHURIKEN_LIFETIME = 40 / NES_FRAME_RATE;

export function ninjaBossPreparePosition(age: number, originX: number, originY: number, targetX: number, targetY: number): readonly [number, number] {
  const progress = clamp(age / NINJA_BOSS_PREPARE_DURATION, 0, 1);
  return [originX + (targetX - originX) * progress, originY + (targetY - originY) * progress];
}

export function ninjaBossNextTeleportAt(reentryStart?: number): number {
  return reentryStart === undefined ? NINJA_BOSS_FIRST_NATURAL_TELEPORT : reentryStart + NINJA_BOSS_REPEAT_NATURAL_TELEPORT;
}

const NINJA_BOSS_COMBAT_PATH_NES = [[0, 128], [26, 165], [51, 103], [67, 104], [126, 110], [196, 94], [253, 140], [296, 164], [386, 64], [431, 64], [448, 88], [474, 88], [508, 72], [534, 72], [551, 41]] as const;

const NINJA_BOSS_INITIAL_X_PATH_NES = [[0, 176], [43, 176], [51, 169], [59, 162], [67, 154], [75, 147], [83, 155], [91, 164], [99, 159], [107, 149], [115, 139], [123, 129], [131, 125], [139, 112], [147, 102], [155, 102], [163, 114], [171, 127], [179, 119], [187, 105], [195, 104], [203, 106], [211, 109], [219, 111], [227, 114], [235, 116], [243, 117], [251, 117], [259, 117], [267, 117], [275, 117], [283, 117], [295, 117], [338, 117]] as const;
const NINJA_BOSS_REENTRY_X_PATH_NES = [[0, 112], [80, 112], [128, 112], [136, 108], [144, 98], [152, 94], [176, 94], [216, 107], [224, 120], [248, 127], [256, 136], [264, 139], [288, 142], [304, 163], [312, 150], [320, 139], [352, 139], [368, 139], [400, 150], [408, 157], [423, 157]] as const;
const NINJA_BOSS_REENTRY_Y_PATH_NES = [[0, 64], [80, 64], [128, 103], [144, 114], [160, 132], [176, 112], [184, 110], [216, 102], [240, 124], [256, 98], [272, 96], [288, 88], [304, 84], [312, 69], [320, 80], [352, 74], [368, 104], [392, 93], [400, 72], [408, 67], [416, 36], [423, 33]] as const;

function interpolateNinjaX(path: readonly (readonly [number, number])[], age: number, entryX: number, baseX: number): number {
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - baseX;
  const first = path[0]!;
  const point = (sample: readonly [number, number]): number => (sample[1] + laneOffset) * NES_WORLD_X_SCALE;
  if (frame <= first[0]) return point(first);
  const last = path.at(-1)!;
  if (frame >= last[0]) return point(last);
  const nextIndex = path.findIndex(([at]) => at >= frame);
  const previous = path[nextIndex - 1]!;
  const next = path[nextIndex]!;
  return point([frame, previous[1] + (next[1] - previous[1]) * ((frame - previous[0]) / (next[0] - previous[0]))]);
}

export function ninjaBossCombatX(age: number, entryX = 176 * NES_WORLD_X_SCALE, reentry = false): number {
  return interpolateNinjaX(reentry ? NINJA_BOSS_REENTRY_X_PATH_NES : NINJA_BOSS_INITIAL_X_PATH_NES, age, entryX, reentry ? 112 : 176);
}

export function ninjaBossCombatY(age: number, entryY = 128 * NES_WORLD_Y_SCALE, reentry = false): number {
  if (reentry) {
    const frame = Math.max(0, age * NES_FRAME_RATE);
    const laneOffset = entryY / NES_WORLD_Y_SCALE - 64;
    const first = NINJA_BOSS_REENTRY_Y_PATH_NES[0]!;
    const point = (sample: readonly [number, number]): number => (sample[1] + laneOffset) * NES_WORLD_Y_SCALE;
    if (frame <= first[0]) return point(first);
    const last = NINJA_BOSS_REENTRY_Y_PATH_NES.at(-1)!;
    if (frame >= last[0]) return point(last);
    const nextIndex = NINJA_BOSS_REENTRY_Y_PATH_NES.findIndex(([at]) => at >= frame);
    const previous = NINJA_BOSS_REENTRY_Y_PATH_NES[nextIndex - 1]!;
    const next = NINJA_BOSS_REENTRY_Y_PATH_NES[nextIndex]!;
    const amount = (frame - previous[0]) / (next[0] - previous[0]);
    return point([frame, previous[1] + (next[1] - previous[1]) * amount]);
  }
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
export const FATMAN_JOE_FIRST_ATTACK_DELAY = 170 / NES_FRAME_RATE;
export const FATMAN_JOE_ATTACK_DECISION_INTERVAL = 76 / NES_FRAME_RATE;
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

export function fatmanJoeAimAllowsLaunch(originX: number, originY: number, targetX: number, targetY: number): boolean {
  const heading = fatmanJoeAimHeading(originX, originY, targetX, targetY);
  return heading >= 14 && heading <= 18;
}

export function fatmanJoeCanLaunch(originX: number, originY: number, targetX: number, targetY: number, randomByte: number): boolean {
  return (randomByte & 0x0f) >= 8 && fatmanJoeAimAllowsLaunch(originX, originY, targetX, targetY);
}

export function fatmanJoeMovementActionDuration(originY: number, randomByte: number): number {
  return (randomByte & 0x0f) < 2 || originY / NES_WORLD_Y_SCALE < 72 ? FATMAN_JOE_LONG_ACTION_DURATION : FATMAN_JOE_SHORT_ACTION_DURATION;
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
const FATMAN_JOE_COMBAT_PATH_NES = [[0, 152, 112], [16, 152, 120], [32, 152, 136], [48, 152, 142], [64, 152, 134], [80, 152, 124], [96, 152, 124], [112, 139, 93], [128, 133, 94], [144, 125, 89], [160, 117, 89], [176, 110, 89], [192, 98, 89], [208, 90, 89], [224, 84, 89], [240, 73, 85], [256, 68, 78], [272, 63, 73], [288, 58, 67], [304, 58, 67], [320, 58, 73], [336, 58, 123], [352, 58, 169], [368, 74, 120], [384, 102, 91], [400, 114, 85], [416, 121, 77], [432, 128, 71], [448, 128, 85], [464, 123, 79], [480, 117, 72], [496, 117, 72], [512, 127, 41], [528, 136, 41], [544, 136, 41], [560, 127, 53], [576, 122, 58], [592, 115, 58], [608, 102, 58], [624, 102, 58], [640, 102, 64], [656, 102, 80], [672, 102, 154], [688, 103, 154], [704, 118, 74], [720, 132, 55], [730, 132, 55], [794, 130, 49], [858, 121, 67], [922, 120, 71], [986, 118, 68], [1050, 121, 42], [1114, 120, 56], [1178, 118, 55], [1242, 100, 69], [1306, 123, 61], [1370, 120, 127], [1434, 120, 51], [1498, 106, 52], [1562, 106, 98], [1626, 121, 61], [1690, 121, 61], [1754, 121, 49], [1818, 121, 56], [1882, 121, 83], [1946, 121, 53], [2010, 121, 75], [2074, 121, 81], [2138, 121, 56], [2202, 117, 98], [2266, 115, 81], [2330, 140, 42], [2394, 120, 66], [2458, 93, 83], [2522, 67, 73], [2586, 100, 67], [2650, 106, 67], [2714, 72, 67], [2778, 90, 95], [2842, 94, 101], [2906, 76, 68], [2970, 57, 46], [3034, 71, 70], [3098, 95, 99], [3162, 108, 115], [3226, 108, 115], [3290, 122, 79], [3354, 108, 46], [3418, 68, 46]] as const;
const FATMAN_JOE_COMBAT_PATH_EXTENDED_NES = [...FATMAN_JOE_COMBAT_PATH_NES, [3488, 112, 67], [3520, 108, 46], [3552, 88, 46], [3584, 75, 46], [3600, 61, 46], [4096, 166, 78], [4608, 138, 45], [5120, 122, 80], [5632, 172, 50], [6144, 124, 66], [6656, 113, 149], [7168, 98, 60], [7680, 117, 108], [8192, 121, 46], [8704, 68, 102], [9216, 110, 47], [9728, 151, 55], [10240, 123, 89], [10752, 113, 43], [11264, 156, 55], [11776, 134, 113], [12000, 191, 43]] as const;

function fatmanJoeCombatPosition(age: number, entryX = 152 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE - FATMAN_JOE_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 152;
  const toWorldX = (x: number): number => clamp((x + laneOffset) * NES_WORLD_X_SCALE, ...fatmanJoeArenaXBounds());
  const first = FATMAN_JOE_COMBAT_PATH_EXTENDED_NES[0]!;
  const last = FATMAN_JOE_COMBAT_PATH_EXTENDED_NES.at(-1)!;
  // The captured ROM actor enters its wait state at the final sample; it does
  // not replay the route in reverse like the explicitly looping Boss paths.
  const sampledFrame = Math.min(frame, last[0]);
  if (sampledFrame <= first[0]) return [toWorldX(first[1]), first[2] * NES_WORLD_Y_SCALE];
  const nextIndex = FATMAN_JOE_COMBAT_PATH_EXTENDED_NES.findIndex(([at]) => at >= sampledFrame);
  const previous = FATMAN_JOE_COMBAT_PATH_EXTENDED_NES[nextIndex - 1]!;
  const next = FATMAN_JOE_COMBAT_PATH_EXTENDED_NES[nextIndex]!;
  const amount = (sampledFrame - previous[0]) / (next[0] - previous[0]);
  return [
    toWorldX(previous[1] + (next[1] - previous[1]) * amount),
    (previous[2] + (next[2] - previous[2]) * amount) * NES_WORLD_Y_SCALE,
  ];
}

export function fatmanJoeCombatY(age: number): number {
  return fatmanJoeCombatPosition(age)[1];
}

export function fatmanJoeCombatX(age: number, entryX = 152 * NES_WORLD_X_SCALE): number {
  return fatmanJoeCombatPosition(age, entryX)[0];
}
export const WINGATE_ENTRY_X_NES = [64, 104, 152, 192] as const;
export const WINGATE_ENTRY_X_LANES = WINGATE_ENTRY_X_NES.map((value) => value * NES_WORLD_X_SCALE);
export const WINGATE_ENTRY_Y_NES = 0;
export const WINGATE_ENTRY_Y = WINGATE_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const WINGATE_SECOND_ENTRY_Y_NES = 0;
export const WINGATE_SECOND_ENTRY_Y = WINGATE_SECOND_ENTRY_Y_NES * NES_WORLD_Y_SCALE;
export const WINGATE_SECOND_SPAWN_DELAY = 264 / NES_FRAME_RATE;
export const WINGATE_BULLET_LIFETIME = 64 / NES_FRAME_RATE;
export const WINGATE_BULLET_VELOCITIES_NES = [[1.15625, 1.40625], [0.9140625, 1.65625], [0.625, 1.8515625], [0.3125, 1.9453125], [0, 2], [-0.3125, 1.9453125], [-0.625, 1.8515625], [-0.9140625, 1.65625], [-1.15625, 1.40625]] as const;
export const WINGATE_PROJECTILE_X_OFFSET_NES = -8;
export const WINGATE_PROJECTILE_Y_OFFSET_NES = 6;

const WINGATE_MOVEMENT_HEADINGS = [0x44, 0x48, 0x48, 0x48, 0x48, 0x4c, 0x50, 0x50, 0x54, 0x58, 0x58, 0x58, 0x58, 0x5c, 0xc0, 0xc0] as const;
const WINGATE_CORRECTION_Y = [0, 0, 3, 3, 2, 2, 1, 1, -1, -1, -2, -2, -3, -3, -4, -4] as const;
const WINGATE_INITIAL_FINE = [[252, 157], [66, 189]] as const;

export type WingateMovementState = {
  frame: number;
  mode: "entry" | "move" | "correction";
  x: number;
  y: number;
  heading: number;
  segmentFrames: number;
  gait: number;
  correctionFrames: number;
  correctionPass: number;
};

export function createWingateMovementState(x: number, phase = 0): WingateMovementState {
  const [fineX, fineY] = WINGATE_INITIAL_FINE[phase > 0 ? 1 : 0];
  return { frame: 0, mode: "entry", x: x + fineX / 256, y: fineY / 256, heading: 0x50, segmentFrames: 0, gait: 1, correctionFrames: 0, correctionPass: 0 };
}

function wingateInsideArena(state: WingateMovementState): boolean {
  const x = Math.floor(state.x);
  const y = Math.floor(state.y);
  return y >= 40 && y < 98 && x >= 32 && x < 224;
}

function wingateCorrectionHeading(state: WingateMovementState): number {
  return 0x40 | nesAimHeading(Math.floor(state.x) * NES_WORLD_X_SCALE, Math.floor(state.y) * NES_WORLD_Y_SCALE, 128 * NES_WORLD_X_SCALE, 64 * NES_WORLD_Y_SCALE);
}

function advanceWingateGait(state: WingateMovementState): void {
  state.gait = (state.gait - 1) & 0xff;
  if ((state.gait & 0x7f) === 0) state.gait = (state.gait & 0x80) !== 0 ? 4 : 0x88;
  if ((state.gait & 0x80) === 0) moveEncodedHeading(state, state.heading);
}

export function advanceWingateMovement(state: WingateMovementState, targetFrame: number, randomByte: () => number): { readonly fireChecks: number } {
  let fireChecks = 0;
  while (state.frame < targetFrame) {
    state.frame += 1;
    if (state.mode === "correction") {
      state.correctionFrames -= 1;
      if (state.correctionFrames >= 0) {
        state.y += WINGATE_CORRECTION_Y[state.correctionFrames] ?? 0;
        moveEncodedHeading(state, state.heading);
      } else if (state.correctionPass === 0) {
        state.heading = wingateCorrectionHeading(state);
        state.correctionFrames = 16;
        state.correctionPass = 1;
      } else if (wingateInsideArena(state)) {
        state.mode = "move";
        state.correctionPass = 0;
      } else {
        state.heading = wingateCorrectionHeading(state);
        state.correctionFrames = 16;
      }
      continue;
    }
    if (state.mode === "move" && state.segmentFrames === 0) {
      const random = randomByte();
      state.heading = WINGATE_MOVEMENT_HEADINGS[random & 0x0f] ?? 0xc0;
      state.segmentFrames = ((random & 0x03) + 1) * 24;
    }
    state.segmentFrames = (state.segmentFrames - 1) & 0xff;
    advanceWingateGait(state);
    if (state.gait === 0x84) fireChecks += 1;
    if (state.mode === "entry") {
      if (state.y >= 64) {
        state.mode = "move";
        state.segmentFrames = (state.segmentFrames - 1) & 0xff;
        advanceWingateGait(state);
        if (state.gait === 0x84) fireChecks += 1;
      }
      continue;
    }
    if (!wingateInsideArena(state)) {
      state.heading = (state.heading + 0x10) & 0xdf;
      state.mode = "correction";
      state.correctionFrames = 16;
      state.correctionPass = 0;
    }
  }
  return { fireChecks };
}

export function wingateAimHeading(originX: number, originY: number, targetX: number, targetY: number): number {
  return nesAimHeading(originX, originY, targetX, targetY);
}

export function wingateCanFire(originX: number, originY: number, targetX: number, targetY: number, randomByte: number): boolean {
  const heading = wingateAimHeading(originX, originY, targetX, targetY);
  return (randomByte & 0x03) !== 0 && heading >= 12 && heading <= 20;
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
