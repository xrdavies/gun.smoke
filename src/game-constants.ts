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

export function mixRomRandomSpawn(state: RomRandomState): RomRandomState {
  const next: RomRandomState = [...state];
  const sum = next[0]! + next[1]!;
  next[0] = (sum - next[2]! - Number(sum <= 0xff)) & 0xff;
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
export const PLAYER_MIN_X_NES = 16;
export const PLAYER_MAX_X_NES = 240;
export const PLAYER_MIN_Y_NES = 48;
export const PLAYER_MAX_Y_NES = 216;
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
export const NES_PLAYER_SPEED = (0.828125 + 1.65625) / 2 * NES_FRAME_RATE;
export const WORLD_PLAYER_SPEED = NES_PLAYER_SPEED * NES_WORLD_Y_SCALE;
export const BOOTS_SPEED_MULTIPLIER = 4 / 3;
export const HORSE_SPEED_MULTIPLIER = 5 / 3;
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
const PLAYER_INPUT_HEADINGS = [[28, 0, 4], [24, undefined, 8], [20, 16, 12]] as const;

export function playerMovementVelocity(horizontal: number, vertical: number, hasHorse: boolean, bootsStock: number, blueInvulnerable: boolean, fastFrame: boolean): readonly [number, number] {
  const x = Math.sign(horizontal);
  const y = Math.sign(vertical);
  if (x === 0 && y === 0) return [0, 0];
  const heading = PLAYER_INPUT_HEADINGS[y + 1]?.[x + 1];
  const velocity = heading === undefined ? undefined : SNIPER_BULLET_VELOCITIES_NES[heading];
  if (!velocity) return [0, 0];
  const [velocityX, velocityY] = velocity;
  const speed = hasHorse || blueInvulnerable ? fastFrame ? 3 : 2 : bootsStock > 0 ? 2 : fastFrame ? 2 : 1;
  return [velocityX * speed * NES_FRAME_RATE * NES_WORLD_X_SCALE, velocityY * speed * NES_FRAME_RATE * NES_WORLD_Y_SCALE];
}

export function playerCollisionFallbackY(currentY: number, candidateY: number, scrollStep: number): number {
  return Math.min(PLAYER_MAX_Y_NES, Math.floor(currentY) + scrollStep + candidateY - Math.floor(candidateY));
}

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
export const GUNMAN_FLANK_INITIAL_STATE_FRAMES = 250;
const GUNMAN_FLANK_PATHS_NES = {
  7: [[0, 0, 0], [48, 38, 16], [64, 46, 31], [120, 75, 95], [126, 78, 101], [160, 104, 103], [200, 137, 116], [234, 165, 128], [270, 195, 141], [310, 209, 186], [338, 192, 212], [370, 170, 211], [410, 158, 186], [442, 148, 168], [460, 149, 162], [480, 158, 165], [540, 158, 185], [600, 158, 205], [641, 158, 218]],
  8: [[0, 0, 0], [247, 0, 82], [250, 3, 77], [260, 16, 68], [270, 25, 68], [280, 35, 76], [290, 44, 92], [300, 47, 120], [309, 51, 128], [324, 61, 142], [338, 67, 135], [370, 84, 122], [420, 123, 149], [460, 153, 178], [500, 182, 209], [507, 184, 217]],
  9: [[0, 0, 0], [50, -48, 30], [65, -54, 49], [104, -73, 36], [200, -117, -12], [300, -162, -61], [350, -185, -86], [358, -188, -89], [400, -184, -42], [460, -160, 30], [468, -157, 38], [550, -90, 58], [663, -44, 144], [684, -57, 140], [740, -32, 111], [800, -4, 82], [825, 7, 69]],
} as const;

// Complete-entry coordinates sampled from Round 2 traces. These are scoped
// to the observed y=32 side entries; all other y values use the generic paths.
const GUNMAN_FLANK_SCOPED_PATHS_NES = {
  8: [[0,0,0],[16,14,5],[32,27,10],[46,38,15],[48,40,16],[55,46,18],[64,53,21],[80,67,26],[96,80,32],[110,80,36],[112,80,37],[119,80,39],[128,80,42],[144,80,48],[160,80,53],[174,80,58],[176,80,58],[183,80,61],[192,80,64],[208,80,69],[224,80,74],[238,80,79],[240,80,80],[247,80,82],[248,80,82],[249,80,83],[250,80,83],[251,81,81],[252,82,80],[253,83,79],[254,84,77],[255,86,76],[256,87,75],[257,89,74],[258,90,73],[259,91,72],[260,93,71],[270,103,69],[272,104,69],[280,112,73],[288,121,84],[290,123,88],[300,127,113],[301,127,116],[302,127,119],[303,127,121],[304,127,122],[305,127,123],[306,127,125],[307,127,126],[308,127,127],[309,127,129],[310,127,129],[311,126,129],[312,125,130],[320,120,132],[328,120,127],[336,120,122],[344,120,116],[352,120,111],[360,120,106],[368,120,100],[376,120,95],[384,120,90],[392,120,84],[400,120,79],[408,120,74],[416,120,68],[424,120,63],[432,120,58],[440,120,52],[448,120,47],[456,120,42],[464,120,36],[472,120,31],[480,120,26],[488,120,20],[496,120,15],[504,120,10],[512,120,4],[520,120,-1],[528,120,-6],[536,120,-12],[544,120,-17],[552,120,-22],[560,120,-28],[568,120,-33]],
  9: [[0,0,0],[16,-14,5],[32,-27,10],[46,-39,15],[48,-40,16],[55,-46,18],[64,-53,21],[80,-67,26],[96,-80,32],[110,-92,36],[112,-93,37],[119,-93,39],[128,-93,42],[144,-93,48],[160,-93,53],[174,-93,58],[176,-93,58],[183,-93,61],[192,-93,64],[208,-93,69],[224,-93,74],[238,-93,79],[240,-93,80],[247,-93,82],[248,-93,82],[249,-93,83],[250,-93,83],[251,-94,81],[252,-96,80],[253,-97,78],[254,-98,77],[255,-99,76],[256,-101,75],[257,-102,74],[258,-103,72],[259,-105,72],[260,-106,71],[270,-116,69],[272,-118,69],[280,-125,73],[288,-134,84],[290,-136,88],[300,-140,113],[301,-140,116],[302,-140,119],[303,-140,121],[304,-140,122],[305,-140,123],[306,-140,125],[307,-139,125],[308,-139,126],[309,-139,128],[310,-139,128],[311,-138,128],[312,-137,129],[320,-131,127],[328,-132,124],[336,-131,120],[344,-128,115],[352,-127,116],[360,-127,121],[368,-127,123],[376,-127,126],[384,-127,129],[392,-127,123],[400,-125,118],[408,-122,115],[416,-117,111],[424,-111,112],[432,-108,114],[440,-108,117],[448,-108,120],[456,-108,123],[464,-108,125],[472,-108,128],[480,-115,131],[488,-121,133],[496,-128,136],[504,-135,139],[512,-141,141],[520,-148,144],[528,-155,147],[536,-161,149],[544,-168,152],[552,-174,155],[560,-181,157],[568,-188,160],[576,-194,163],[584,-201,165],[592,-208,168],[600,-214,171],[608,-221,173],[616,-227,176],[624,-234,179],[632,-236,181],[640,-235,177],[648,-228,179],[656,-222,181],[664,-215,184],[672,-208,187],[680,-202,189],[688,-195,191],[696,-189,193],[704,-183,194],[712,-184,189],[720,-183,184],[728,-181,178],[736,-180,173],[744,-179,169],[752,-178,163],[760,-176,158],[768,-175,153],[776,-174,147],[784,-173,143],[792,-171,138],[800,-170,132],[808,-169,127],[816,-167,123],[824,-164,118],[832,-159,116],[840,-152,116],[848,-146,117],[856,-139,123],[864,-134,130],[872,-128,136],[880,-123,144],[888,-118,151],[896,-112,158],[904,-107,165],[912,-101,173],[920,-96,179],[928,-90,187],[936,-85,194],[944,-80,201],[952,-74,208],[960,-69,216],[962,-68,217]],
} as const;
const GUNMAN_FLANK_SCOPED_LIFETIMES_FRAMES = { 8: 569, 9: 963 } as const;
const decodeGunmanCoordinateSamples = (encoded: string): readonly (readonly [number, number])[] => {
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  const samples: [number, number][] = [];
  for (let index = 0; index + 1 < bytes.length; index += 2) samples.push([bytes[index]! > 127 ? bytes[index]! - 256 : bytes[index]!, bytes[index + 1]! > 127 ? bytes[index + 1]! - 256 : bytes[index + 1]!]);
  return samples;
};
const GUNMAN_FLANK_Y64_TRACE_SAMPLES_NES = {
  8: decodeGunmanCoordinateSamples("AAAAAAEAAgEDAQQBBQIFAgYCBwMIAwkDCgQKBAsEDAUNBQ4FDwYPBhAGEQcSBxMHFAgUCBUIFgkXCRgJGQoZChoKGwscCx0LHQweDB8MIA0hDSINIg4jDiQOJQ8mDycPJxAoECkQKhErESwRLBItEi4SLxMwEzETMRQyFDMUNBU1FTUVNhY3FjgWORc6FzoXOxg8GD0YPhk/GT8ZQBpBGkIaQxtEG0QbRRxGHEccSB1JHUkdSh5LHkweTR9OH04fTyBPIFAfUR1THFQaVRlXGFgXWRZbFVwUXhRfE2ATYRJiEmMSYxJkEmUSZhJnEmgSaBNpE2oTaxRrFGwUbhZvF3AYchlzGnQcdR12H3cgeCJ5I3oleyd7KXwrfC19L30yfjV+OH47fj5+QX5EfkZ+Rn1GfUd8R3tHekh5SHhIeEl3SXdJd0p3SXdId0h3R3dGd0Z3RXdEd0R3Q3dCd0J3QXdAd0B3P3c+dz53PXc8dzx3O3c6dzp3OXc4dzh3N3c2dzZ3NXc0dzR3M3cydzJ3MXcwdzB3L3cudy53LXcsdyx3K3cqdyp3KXcodyh3J3cmdyZ3JXckdyR3I3cidyJ3IXcgdyB3H3cedx53HXccdxx3G3cadxp3GXcYdxh3F3cWdxZ3FXcUdxR3E3cSdxJ3EXcQdxB3D3cOdw53DXcMdwx3C3cKdwp3CXcIdwh3B3cGdwZ3BXcEdwR3A3cCdwJ3AXcAdwB3/3f+d/53/Xf8d/x3+3f6d/p3+Xf4d/h393f2d/Z39Xf0d/R383fyd/J38Xfwd/B373fud+537Xfsd+x363fqd+p36Xfod+h353fmd+Z35Xfkd+R343fid+J34Xfgd+B333fed9533Xfcd9x323fad9p32XfYd9h313fWd9Z31XfUd9R303fSd9J30XfQd9B3z3fOd853zXfMd8x3y3fKd8p3yXfId8h3x3fGd8Z3xXfEd8R3w3fCd8J3wXfAd8B3vw=="),
} as const;


const decodeGunmanAbsoluteCoordinateSamples = (encoded: string): readonly (readonly [number, number])[] => {
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  const samples: [number, number][] = [];
  for (let index = 0; index + 1 < bytes.length; index += 2) samples.push([bytes[index]!, bytes[index + 1]!]);
  return samples;
};
const GUNMAN_FLANK_Y64_CODE9_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("+EH3QfZB9UL0QvNC80PyQ/FD8ETvRO9E7kXtRexF60bqRupG6UfoR+dH5kjlSOVI5EnjSeJJ4UrgSuBK30veS91L3EzbTNtM2k3ZTdhN107WTtZO1U/UT9NP0lDSUNFQ0VHQUc9SzlPOVM1VzVfNWMxZzFrMW8xcy17LX8tgymLKY8pkyWbJZ8loyGrIashrx23Hbsdvx3HGcsZzxnXFdsV3xXnEesR7xHzDfcN+w4DCgcKCwoTChcGGwYjBicCKwIzAjL+Nv4+/kL6RvpO+lL2VvZe9mLyZvJq7m7ucu567n7qguqG5obmguKG3oLagtqG1oLSgs6CzoLKgsaCwoLCgr6CuoK2fraCsoKufqqCpn6mfqKCnn6afpp+ln6Sfo5+jn6KeoZ+gn6Cen5+en52enZ+cnpuemp+ZnpmemJ6Xnpaelp6VnpSdk56TnpKdkZ6QnZCdj56OnY2djZ6MnYudip2JnYmdiJ2HnYachp2FnYScg52DnIKcgZ2AnICcf51+nH2cfZx8nHucepx5nHmbeJx3nHabdpx1m3Sbc5xzm3KbcZtwm3Cbb5tum22bbZtsm2uaaptpm2maaJtnmmaaZptlmmSaY5pjmmKaYZpgmmCZX5peml2ZXZpcmluZWppZmVmZWJpXmVaZVplVmVSZU5lTmVKYUZlQmVCYT5lOmU2YTZlMmEuYSplJmEmYSJhHmEaYRphFmESXQ5hDmEKXQZhAl0CXP5g+lz2XPZg8lzuXOpc5lzmXOJc3lzaWNpc1lzSWM5czljKWMZcwljCWL5Yuli2WLZYsliuWKpYplimVKJYnliaVJpYllSSVI5YjlSKVIZUglSCVH5UelR2VHZUclRuUGpUalRmUGJUXlBaUFpUVlBSUE5QTlBKUEZQQlBCTD5QOlA2TDZQMlAuTCpQKkwmTCJQHkwaTBpMFkwSTA5MDkwKSAZMAkwCS");
const NINJA_STAGE4_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("mAKYBJgGmAiYCpgMmA6YEJgSmBSYFpgYmBqYHJgemCCYIJggmCCYIJggmCCYIJggmCCYIJggmCCYIJggmCCYIJggmCCYIJggmCKYJJgmmCiYKpgsmC6YMJgymDSYNpg4mDqYPJg+mECYQphEmEaYSJhKmEyYTphQmFKYVJhWmFiYWphcmF6YYJhimGSYZphomGqYbJhumHCYcph0mHaYeJh6mHyYfph+mH6Yfph+mH6Yfph+mH6Yfph+mH6Yfph+mH6Yfph+mH6Yfph+mH6Xe5V2k3KSbpBrjmiMZYtjiWGHXoVdhFyCXIBcflx9XH1cfVx9XH1cfVx9XH1cfVx9XH1cfVx9XH1cfVx9XH1cfVx9XH1cfVx7WntcfF58X3xhfWN9ZX1nfWl+a35tfm9/cX9zf3WAd4B5gHuBfYF/gYGCgoKEgoaCiIOKg4yDjoSQhJKElIWWhZiFmoachp6GoIeih6SHpoeniKmIq4itia+JsYmtiaqJp4mliaOJoomhiaGJoomjiaSJpImkiaWJpYmliaaJpommiaeJp4mniaiJqImoiamJqYmpiaqJqomqiauJq4mriayJrImsia2JrYmtia6Jromuia+Jr4mvibCJsImwibGJsYmxibKJsomyibOJs4mzibQ=");
const NINJA_STAGE4_X184_AT63_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("uAK4BLgGuAi4CrgMuA64ELgSuBS4FrgYuBq4HLgeuCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCK4JLgmuCi4KrgsuC64MLgyuDS4Nrg4uDq4PLg+uEC4QrhEuEa4SLhKuEy4TrhQuFK4VLhWuFi4WrhcuF64YLhiuGS4ZrhouGq4bLhuuHC4crh0uHa4eLh6uHy4frh+uH64frh+uH64frh+uH64frh+uH64frh+uH64frh+uH64frh+uH62fLR3s3Kxbq9rrWisZapjqGGmX6Veo1yhXJ9cnlycXJxcnFycXJxcnFycXJxcnFycXJxcnFycXJxcnFycXJxcnFycXJxcnFyaWppcml6ZYJlimWSYZphomGmXa5dtl2+XcZZzlnWWd5V5lXuVfZR/lIGUg5OFk4eTiZKLko2SjpKQkZKRlJGWkJiQmpCcj56PoI+ijqSOpo6ojaqNrI2ujbCMsYytjKqMp4yljKOMooyhjKGMooyjjKSMpIykjKWMpYyljKaMpoymjKeMp4ynjKiMqIyojKmMqYypjKqMqoyqjKuMq4yrjKyMrIysjK2MrYytjK6MroyujK+Mr4yvjLCMsIywjLGMsYyxjLKMsoyyjLOMs4yzjLQ=");
const NINJA_STAGE4_X184_AT383_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("uAK4BLgGuAi4CrgMuA64ELgSuBS4FrgYuBq4HLgeuCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCK4JLgmuCi4KrgsuC64MLgyuDS4Nrg4uDq4PLg+uEC4QrhEuEa4SLhKuEy4TrhQuFK4VLhWuFi4WrhcuF64YLhiuGS4ZrhouGq4bLhuuHC4crh0uHa4eLh6uHy4frh+uH64frh+uH64frh+uH64frh+uH64frh+uH64frh+uH64frh+uH63f7aBtYK0hLOGsoexibCLr4yvjq6QrZGsk6uVqpapmKiap5umnaWfpaCkoqOkoqWhp6Cpn6qerJ2unK+bsZqzmrSZtpi3l7mWu5W8lL6TwJLBkcOQxZDBkL6Qu5C5kLeQtpC1kLWQtpC3kLiQuJC4kLmQuZC5kLqQupC6kLuQu5C7kLyQvJC8kL2QvZC9kL6QvpC+kL+Qv5C/kMCQwJDAkMGQwZDBkMKQwpDCkMOQw5DDkMSQxJDEkMWQxZDFkMaQxpDGkMeQx5DHkMg=");
const NINJA_STAGE4_X184_AT751_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("uAK4BLgGuAi4CrgMuA64ELgSuBS4FrgYuBq4HLgeuCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCK4JLgmuCi4KrgsuC64MLgyuDS4Nrg4uDq4PLg+uEC4QrhEuEa4SLhKuEy4TrhQuFK4VLhWuFi4WrhcuF64YLhiuGS4ZrhouGq4bLhuuHC4crh0uHa4eLh6uHy4friAuIK4hLiGuIi4iriMuI64kLiSuJS4lriYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLeat5y3nragtqK2pLamtai1qrWrtK20r7Sxs7OztbO3srmyu7K9sb+xwbHDscWwx7DJsMuvza/Jr8avw6/Br7+vvq+9r72vvq+/r8CvwK/Ar8Gvwa/Br8Kvwq/Cr8Ovw6/Dr8SvxK/Er8Wvxa/Fr8avxq/Gr8evx6/Hr8ivyK/Ir8mvya/Jr8qvyq/Kr8uvy6/Lr8yvzK/Mr82vza/Nr86vzq/Or8+vz6/Pr9A=");

const NINJA_STAGE4_X184_AT815_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("uAK4BLgGuAi4CrgMuA64ELgSuBS4FrgYuBq4HLgeuCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCK4JLgmuCi4KrgsuC64MLgyuDS4Nrg4uDq4PLg+uEC4QrhEuEa4SLhKuEy4TrhQuFK4VLhWuFi4WrhcuF64YLhiuGS4ZrhouGq4bLhuuHC4crh0uHa4eLh6uHy4friAuIK4hLiGuIi4iriMuI64kLiSuJS4lriYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLeWtZGzjLKIsIWugqx/q32pe6d5pXikdqJ2oHaedp12nXaddp12nXaddp12nXaddp12nXaddp12nXaddp12nXaddp12nXaddpt0m3aceJx6nHydfp2AnYKdhJ6FnoeeiZ+Ln42fj6CRoJOglaGXoZmhm6Kdop+ioaKjo6Wjp6OopKqkrKSupbClsqW0pramuKa6p7ynvqfAp8KoxKjGqMipyqnLqc2pyanGqcOpwam/qb6pvam9qb6pv6m/qcCpwKnAqcGpwanBqcKpwqnCqcOpw6nDqcSpxKnEqcWpxanFqcapxqnGqcepx6nHqcipyKnIqcmpyanJqcqpyqnKqcupy6nLqcypzKnMqc2pzanNqc6pzqnOqc+pz6nP");

const NINJA_STAGE4_X184_AT1071_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("uAK4BLgGuAi4CrgMuA64ELgSuBS4FrgYuBq4HLgeuCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCK4JLgmuCi4KrgsuC64MLgyuDS4Nrg4uDq4PLg+uEC4QrhEuEa4SLhKuEy4TrhQuFK4VLhWuFi4WrhcuF64YLhiuGS4ZrhouGq4bLhuuHC4crh0uHa4eLh6uHy4friAuIK4hLiGuIi4iriMuI64kLiSuJS4lriYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLaWtZGzjbGJr4aug6yAqn6oe6d5pXijd6F3oHeed5x3nHecd5x3nHecd5x3nHecd5x3nHecd5x3nHecd5x3nHecd5x3nHecd5t1mXKXbZVplGWSYpBfjlyNWotYiVWHVIZThFOCU4FTf1N/U39Tf1N/U39Tf1N/U39Tf1N/U39Tf1N/U39Tf1N/U39Tf1N/U39TfVF9U35Vfld+WH9af1x/XoBggGKAZIBmgWiBaoFsgm6CcIJyg3SDdoN4hHqEfIR9hX+FgYWDhYWGh4aJhouHjYePh5GIk4iViJeJmYmbiZ2Kn4qgiqKKpIumi6iLqoysjK6MsI2yjbSNto64jrqOvI++j8CPwo/DkMWQx5DJkcuRzZHPktGS05LVk9eT2ZPblN2U35ThlOOV5ZXmleiW6pbslu6X8Jfyl/SY9pj4mPqZ/Jn+");

const NINJA_STAGE4_X184_AT1199_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("uAK4BLgGuAi4CrgMuA64ELgSuBS4FrgYuBq4HLgeuCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCK4JLgmuCi4KrgsuC64MLgyuDS4Nrg4uDq4PLg+uEC4QrhEuEa4SLhKuEy4TrhQuFK4VLhWuFi4WrhcuF64YLhiuGS4ZrhouGq4bLhuuHC4crh0uHa4eLh6uHy4friAuIK4hLiGuIi4iriMuI64kLiSuJS4lriYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLaWtJGyjbGJr4atgqt/qn2oe6Z5pXijd6F3n3eedpx2nHacdpx2nHacdpx2nHacdpx2nHacdpx2nHacdpx2nHacdpx2nHacdpp0mnabeJt6m3ycfpyAnIKdhJ2GnYieip6Mno6fj5+Rn5OflaCXoJmgm6GdoZ+hoaKjoqWip6Opo6ujraSvpLGks6S0pbaluKW6prymvqbAp8KnxKfGqMioyqjMqMioxajCqMCovqi9qLyovKi9qL+ov6i/qMCowKjAqMGowajBqMKowqjCqMOow6jDqMSoxKjEqMWoxajFqMaoxqjGqMeox6jHqMioyKjIqMmoyajJqMqoyqjKqMuoy6jLqMyozKjMqM2ozajNqM6ozqjOqM+ozw==");

const NINJA_STAGE4_X184_AT1583_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("uAK4BLgGuAi4CrgMuA64ELgSuBS4FrgYuBq4HLgeuCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCK4JLgmuCi4KrgsuC64MLgyuDS4Nrg4uDq4PLg+uEC4QrhEuEa4SLhKuEy4TrhQuFK4VLhWuFi4WrhcuF64YLhiuGS4ZrhouGq4bLhuuHC4crh0uHa4eLh6uHy4friAuIK4hLiGuIi4iriMuI64kLiSuJS4lriYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiat5y3nregtqK2pLamtai1qrWstK60sLSys7SztrO3s7myu7K9sr+xwbHDscWwx7DJsMuvza/Jr8avw6/Br7+vvq+9r72vvq+/r8CvwK/Ar8Gvwa/Br8Kvwq/Cr8Ovw6/Dr8SvxK/Er8Wvxa/Fr8avxq/Gr8evx6/Hr8ivyK/Ir8mvya/Jr8qvyq/Kr8uvy6/Lr8yvzK/Mr82vza/Nr86vzq/Or8+vz6/Pr9A=");

const NINJA_STAGE4_X184_AT3535_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("uAK4BLgGuAi4CrgMuA64ELgSuBS4FrgYuBq4HLgeuCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCK4JLgmuCi4KrgsuC64MLgyuDS4Nrg4uDq4PLg+uEC4QrhEuEa4SLhKuEy4TrhQuFK4VLhWuFi4WrhcuF64YLhiuGS4ZrhouGq4bLhuuHC4crh0uHa4eLh6uHy4friAuIK4hLiGuIi4iriMuI64kLiSuJS4lriYuJq4mriauJq4mriauJq4mriauJq4mriauJq4mriauJq4mriauJq4mriat5u1nLSds56xn7Cgr6Kto6ykqqWppqinpqilqaSroqyhraCunq+dsJuxmrKZtJe1lraVt5O4krmRuo+7jr2Nvou/isCIwYfChsOExIPGgseAyH/Jfsp8y3vMec14z3fQddF00nPTcdRw1W/Wbdhs2Wvaadto3GbdZd5k32LhYeJg42DfYNxg2WDXYNVg1GDTYNNg1GDVYNZg1mDWYNdg12DXYNhg2GDYYNlg2WDZYNpg2mDaYNtg22DbYNxg3GDcYN1g3WDdYN5g3mDeYN9g32DfYOBg4GDgYOFg4WDhYOJg4mDiYONg42DjYORg5GDkYOVg5WDlYOY=");

const NINJA_STAGE4_X184_AT3727_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("uAK4BLgGuAi4CrgMuA64ELgSuBS4FrgYuBq4HLgeuCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCK4JLgmuCi4KrgsuC64MLgyuDS4Nrg4uDq4PLg+uEC4QrhEuEa4SLhKuEy4TrhQuFK4VLhWuFi4WrhcuF64YLhiuGS4ZrhouGq4bLhuuHC4crh0uHa4eLh6uHy4friAuIK4hLiGuIi4iriMuI64kLiSuJS4lriYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLeWtZCzjLGIsIWugqx/qn2pe6d5pXejdqJ2oHaedp12nXaddp12nXaddp12nXaddp12nXaddp12nXaddp12nXaddp12nXaddpt0mnaad5l5mHuYfZd/loGWg5WElYaUiJOKk4ySjpGQkZGQk5CVj5eOmY6bjZyMnoygi6KLpIqmiaiJqYirh62Hr4axhrOFtYS2hLiDuoK8gr6BwIHCgMN/xX/Hfsl9y33NfM580HvSetR61nnYeNp423fdd9924XXjdeV053Poc+py7HLucfBw8nD0b/Vu9275bftt/Wz/");

const NINJA_STAGE4_X184_AT1727_TRACE_SAMPLES_NES = decodeGunmanAbsoluteCoordinateSamples("uAK4BLgGuAi4CrgMuA64ELgSuBS4FrgYuBq4HLgeuCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCC4ILgguCK4JLgmuCi4KrgsuC64MLgyuDS4Nrg4uDq4PLg+uEC4QrhEuEa4SLhKuEy4TrhQuFK4VLhWuFi4WrhcuF64YLhiuGS4ZrhouGq4bLhuuHC4crh0uHa4eLh6uHy4friAuIK4hLiGuIi4iriMuI64kLiSuJS4lriYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLiYuJi4mLaWtJGyjLGIr4Wtgqt/qn2oe6Z5pXijd6F2n3aedpx2nHacdpx2nHacdpx2nHacdpx2nHacdpx2nHacdpx2nHacdpx2nHacdpp0mnabeJt6m3ycfpyAnIKdhJ2FnYeeiZ6Lno2fj5+Rn5OflaCXoJmgm6GdoZ+hoaKjoqWip6Ooo6qjrKSupLCksqS0pbaluKW6prymvqbAp8KnxKfGqMioyqjMqMioxajCqMCovqi9qLyovKi9qL+ov6i/qMCowKjAqMGowajBqMKowqjCqMOow6jDqMSoxKjEqMWoxajFqMaoxqjGqMeox6jHqMioyKjIqMmoyajJqMqoyqjKqMuoy6jLqMyozKjMqM2ozajNqM6ozqjOqM+ozw==");

function ninjaTraceSamples(originX: number, originY: number, stage: number, phase: number, eventAt?: number): readonly (readonly [number, number])[] | undefined {
  if (stage !== 4 || Math.round(originY) !== 0) return undefined;
  if (phase === 0 && Math.round(originX) === 152 && eventAt === 47) return NINJA_STAGE4_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 184 && eventAt === 63) return NINJA_STAGE4_X184_AT63_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 184 && eventAt === 383) return NINJA_STAGE4_X184_AT383_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 751) return NINJA_STAGE4_X184_AT751_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 815) return NINJA_STAGE4_X184_AT815_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 1071) return NINJA_STAGE4_X184_AT1071_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 1199) return NINJA_STAGE4_X184_AT1199_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 1583) return NINJA_STAGE4_X184_AT1583_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 184 && eventAt === 1727) return NINJA_STAGE4_X184_AT1727_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 3535) return NINJA_STAGE4_X184_AT3535_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 3727) return NINJA_STAGE4_X184_AT3727_TRACE_SAMPLES_NES;
  return undefined;
}

export function ninjaTracePosition(age: number, originX: number, originY: number, stage: number, phase = 0, eventAt?: number): readonly [number, number] | undefined {
  const sample = ninjaTraceSamples(originX, originY, stage, phase, eventAt)?.[Math.max(0, Math.round(age * NES_FRAME_RATE))];
  return sample ? [sample[0] * NES_WORLD_X_SCALE, sample[1] * NES_WORLD_Y_SCALE] : undefined;
}
export function ninjaTraceLifetime(originX: number, originY: number, stage: number, phase = 0, eventAt?: number): number | undefined {
  const trace = ninjaTraceSamples(originX, originY, stage, phase, eventAt);
  return trace ? trace.length / NES_FRAME_RATE : undefined;
}

export function ninjaTraceThrowFrame(stage: number, eventAt?: number): number | false | undefined {
  if (stage !== 4) return undefined;
  if (eventAt === 47 || eventAt === 63) return 103;
  if (eventAt === 383 || eventAt === 751 || eventAt === 1583 || eventAt === 3535) return false;
  if (eventAt === 815 || eventAt === 1071 || eventAt === 1199 || eventAt === 1727 || eventAt === 3727) return 116;
  return undefined;
}
const GUNMAN_FLANK_Y64_CODE9_OFFSETS_NES = GUNMAN_FLANK_Y64_CODE9_TRACE_SAMPLES_NES.map(([x, y]) => [x - 248, y - 65] as const);
const GUNMAN_FLANK_STAGE3_CODE8_PHASE0_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BUEGQQZBB0IIQglCCkMLQwtDDEQNRA5ED0UQRRBFEUYSRhNGFEcVRxVHFkgXSBhIGUkZSRpJG0ocSh1KHkseSx9LIEwhTCJMI00jTSRNJE4kTiROJE8kTyRPJFAkUCRQJFEkUSRRJFIkUiRSJFMkUyRTJFQkVCRUJFUkVSRVJFYkViRWJFckVyRXJFgkWCRYJFkkWSRZJFokWiRaJFskWyRbJFwkXCRcJF0kXSRdJF4kXiReJF8kXyRfJGAkYCRgJGEkYSRhJGIkYiRiJGMkYyRjJGQkZCRkJGUkZSRlJGYkZiRmJGckZyRnJGgkaCRoJGkkaSRpJGokaiRqJGskayRrJGwkbCRsJG0kbSRtJG4kbiRuJG8kbyRvJHAkcCRwJHEkcSRxJHIkciRyJHMkcyVyJ3AobyltKmwsay1qLmkwaDFnM2c0ZjVmNmU3ZThlOGU5ZTplO2U8ZT1lPWY+Zj9mQGdBZ0FnQ2lEakVrR2xIbUlvSnBLckxzTXVOdk94UHpQfFF+UYBSglKFU4hTi1OOU5FTlFOXU5lUmlSbVJ1VnlWeVqBWoFefV6BYn1ieWZ9anlqdW55cnVydXZ1enV+dX51gnWGdYp1jnWOdZJ5lnmaeZ59nn2ifaaBqoGugbKJsom2ibqNvo3CkcKVxpXKlc6Z0pnWndah2qHeoeKl5qnmqeqt7q3yrfa19rX6tf66AroGugrCCsIOwhLGFsYayhrOHs4izibSKtYq1i7aMto22jrePuI+4kLmRuZK5k7uTu5S7lbyWvJe9l76Yvpm+mr+bv5zAnMGdwZ7Bn8Kgw6DDocSixKPEpMakxqXGpsenx6jHqcmpyarJq8qsyq3LrcyuzK/MsM2xzrHOss+zz7TPtdC20bbRt9K40rnSutS61LvUvNW91b7Wvte/18DXwdjC2MLZw9rE28XbxtzG3cfeyN/I4MngyeLK48vjy+XM5sznzejN6c7qzuzO7c/uz/DP8dDy0PPQ9ND10PfQ+ND50Ps=");
const GUNMAN_FLANK_STAGE3_CODE8_PHASE0_OFFSETS_NES = GUNMAN_FLANK_STAGE3_CODE8_PHASE0_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 5, y - 65] as const);
const GUNMAN_FLANK_STAGE3_CODE7_LEFT_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BEEFQQVBBkIHQghCCUMKQwpDC0QMRA1EDkUPRQ9FEEYRRhJGE0cURxRHFUgWSBdIGEkZSRlJGkobShxKHUseSx5LH0wgTCFMIk0iTSNNJE4lTiZOJ08nTyhPKVAqUCtQK1EsUSxRLVMuVC5VL1YvVzBYMFkxWjJbMlwzXTNeNGA0YDVhNmM2YzdkN2Y4ZzhnOWk6ajpqO2w7bTxtPW89cD5xPnI/cz90QHVBdkF3QnhCeUN6Q3xEfEV9RX9Gf0aAR4JHgkiDSYVJhkqGSohLiUyJTItNjE2MTo5PjlCPUJBRkVGRUZFSkFKQU5BTj1SOVI5VjVWNVY1WjFaLV4tXiliKWIpZiVmIWohah1qHW4dbhlyFXIVdhV2EXoReg1+CX4NggmCBYYJigWKAY4FkgGSAZYBmgGeAZ4BogGmAaoBrgGuAbIFtgW6Bb4JwgnCCcYNyg3ODdIV0hXWFdoZ3hniHeYh5iHqIe4l8iX2KfYt+i3+LgIyBjYGNgo6DjoSOhZCGkIaQh5GIkYmRipOKk4uTjJSNlI6VjpaPlpCWkZeSmJOYk5mUmZWZlpqXm5ebmJyZnJqcm56bnpyenZ+en5+goKGgoaGhoqKjoqSjpKSlpKakp6Wopqimqaeqp6unrKmtqa2prqqvqrCqsayxrLKss620rbWuta+2r7evuLC5sbqxurK7sryyvbO+tL60v7XAtcG1wrfCt8O3w7jDuMO4w7nEusS7xL3EvsO/w8HCwsHCwcTAxL/Ev8W/xL/Dv8O/wr/Bv8G/wL+/v7+/vr+9v72/vL+7v7u/ur+5v7m/uL+3v7e/tr+1v7W/tL+zv7O/sr+xv7G/sL+vv6+/rr+tv62/rL+rv6u/qr+pv6m/qL+nv6e/pr+lv6W/pL+jv6O/or+hv6G/oL+fv5+/nr+dv52/nL+bv5u/mr+Zv5m/mL+Xv5e/lr+Vv5W/lL+Tv5O/kr+Rv5G/kL+Pv4+/jr+Nv42/jL+Lv4u/ir+Jv4m/iL+Hv4e/hr+Fv4W/hL+Dv4O/gr+Bv4G/gL9/v3+/fr99v32/fL97v3u/er95v3m/eL93v3e/dr91v3W/dL9zv3O/cr9xv3G/cL9vv2+/br9tv22/bL9rv2u/ar9pv2m/aL9nv2e/Zr9lv2W/ZL9jv2O/Yr9hv2G/YL9fv1+/Xr9dv12/XL9bv1u/Wr9Zv1m/WL9Xv1e/Vr9Vv1W/VL9Tv1O/Ur9Rv1G/UL9Pv0+/Tr9Nv02/TL9Lv0u/Sr9Jv0m/SL9Hv0e/Rr9Fv0W/RL9Dv0O/Qr9Bv0G/QL8/vz+/Pr89vz2/PL87vzu/Or85vzm/OL83vze/Nr81vzW/NL8zvzO/Mr8xvzG/ML8vvy+/Lr8tvy2/LL8rvyu/Kr8pvym/KL8nvye/Jr8lvyW/JL8jvyO/Ir8hvyG/IL8fvx+/Hr8dvx2/HL8bvxu/Gr8Zvxm/GL8Xvxe/Fr8VvxW/FL8TvxO/Er8RvxG/EL8Pvw+/Dr8Nvw2/DL8Lvwu/Cr8Jvwm/CL8Hvwe/Br8FvwW/BL8DvwO/Ar8BvwG/AA==");
const GUNMAN_FLANK_STAGE3_CODE7_RIGHT_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+EH4QfdB9kL1QvRC80PzQ/JD8UTwRO9E7kXuRe1F7EbrRupG6UfpR+hH50jmSOVI5UnkSeNJ4krhSuBK4EvfS95L3UzcTNtM203aTdlN2E7XTtZO1k/VT9RP01DSUNFQ0VHRUdBRz1PPVM5VzlfOV81YzVrNW8xczF7MX8tgy2LLY8pkymbKZ8lnyWnJaslryG3Ibshvx3HHcsZzxnTFdcV2xXjEecR6w3vDfMJ9wn/BgMGBwILAg8CEv4a/h76Ivom9ir2LvI28jruOu5C6kbqSupS5lbmVuJe4mLeZt5u2nLactZ61n7WgtaG0oLOgs6CyoLGfsKCwn6+erp+unq2erJ6snqudqp2qnamcqJ2onKecppymnKWbpJukm6OaopuimqGaoJqfmZ+ZnpmdmZ2YnJmbmJuYmpiZl5mXmJeXl5eWlpeVlpWVlJaTlZOVkpWRlZGUkJWPlI6TjpSNk4yTjJOLk4qSipKJkoiRiJKHkYaRhpGFkYSQhJCDkIKPgpCBj4CPgI9/jn6OfY59jnyNe457jXqNeY15jHiMd4x3jHaLdYx1i3SKc4tzinKKcYpxinCJb4pviW6IbYltiGyIa4hqiGqHaYdoh2iGZ4dmhmaGZYZkhmSFY4VihWKEYYVghGCEX4Reg16DXYNcg1yCW4NaglmCWYJYgVeBV4FWgVWAVYFUgFN/U4BSf1F/UX9Qf09+T39Ofk19TX5MfUt9S31KfUl8SHxIfEd7RnxGe0V7RHtEe0N6QnpCekF5QHpAeT95Pnk+eD14PHg8eDt3Ong6dzl3OHc3djd2NnY1djV1NHYzdTN0MnUxdDF0MHQvdC9zLnQtcy1yLHMrcityKnIpcilxKHEncSZwJnElcCRwJHAjcCJvIm8hbyBuIG8fbh5uHm4dbRxtHG0bbRpsGm0ZbBhsGGwXaxZrFmsVaxRqE2sTahJpEWoRaRBpD2kPaQ5oDWkNaAxnC2gLZwpnCWcJZwhmB2YHZgZlBWYFZQRlA2UCZQJkAWQAZABj");
const GUNMAN_FLANK_STAGE3_CODE7_LEFT_OFFSETS_NES = GUNMAN_FLANK_STAGE3_CODE7_LEFT_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 65] as const);
const GUNMAN_FLANK_STAGE3_CODE7_RIGHT_OFFSETS_NES = GUNMAN_FLANK_STAGE3_CODE7_RIGHT_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 65] as const);
const GUNMAN_FLANK_STAGE6_CODE7_Y32_LEFT_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BCEFIQUhBiIHIggiCSMKIwojCyQMJA0kDiUPJQ8lECYRJhImEycTJxQnFSgWKBcoGCkYKRkpGiobKhwqHSsdKx4rHywgLCEsIi0iLSMtJC4lLiYuJy8nLygvKTAqMCswKzErMSwxLTMuMy40LjYvNy84LzowOzA8MD4wPzFAMUExQjJDMkUyRjNHM0kzSjRLNE00TjVPNVE1UTVSNlQ2VTZWN1g3WTdaOFw4XTheOWA5YTliOmM6ZDplOmc7aDtpO2s8bDxtPG89cD1xPXM+cz50PnY/dz94P3pAe0B8QX1BfkF/QoFCgkODQ4VDhkSGRIhFiUWKRoxGjUeNR49IkEiRSJNJlEmUSpZKl0uYS5pMmkybTZ1Nnk2fTqFOoU+gT6BQoFGfUaBSoFOfVKBUn1WfVqBXoFigWaBZoFqgW6FcoV2hXaFeoV+hYKJhomGhYqJjomSiZaNmomaiZ6Noo2mjaqRqo2ujbKRtpG6kbqRvpHCkcaVypXOkc6V0pXWldqZ3pneleKZ5pnqme6d7pnymfad+p3+ngKeAp4GngqiDqISohKiFqIaoh6mIqYioiamKqYupjKqNqY2pjqqPqpCqkauRqpKqk6uUq5WrlauWq5ermKyZrJqrmqybrJysna2erZ6sn62graGtoq6iraOtpK6lrqaup66nrqiuqa+qr6uvq6+sr62vrrCvsK+vsLCxsLKws7G0sbSxtbK2sreyuLO4s7m0urW7tby2vLe9t764v7m/usC6wbzBvcK9wr/DwMTAxMLFw8XExsbGxsbHx8nHysfLyM3IzsjPyNHJ0snTydXJ1snXydnJ2snbyd3J3sjfyOHI4sjix+TH5cfmxujG6cbqxezF7cTtxO/D8MLwwvLB88HzwPW/9r/2vvi9+Lz4vPq7+rr7");
const GUNMAN_FLANK_STAGE6_CODE7_Y32_LEFT_OFFSETS_NES = GUNMAN_FLANK_STAGE6_CODE7_Y32_LEFT_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 33] as const);
const GUNMAN_FLANK_STAGE6_CODE7_Y32_RIGHT_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+CH3IfYh9SL0IvMi8yPyI/Ej8CTvJO4k7iXtJewl6ybqJukm6SfoJ+cn5ijlKOQo5CnjKeIp4SrgKt8q3yveK90r3CzbLNss2i3ZLdgt1y7WLtYu1S/UL9Mv0jDRMNEw0THQMc8xzjPOM800zTbNN8w4zDrMO8s8yz7LP8pAykHKQspDyUXJRslHyEnISshLx03HTsdPxlHGUcZSxVTFVcVWxVjEWcRaxFzDXcNew2DCYcJiwmPBZMFlwWfAaMBpwGvAbL9tv2+/cL5xvnO+c710vXa9d7x4vHq8e7t8u367f7uAuoK6g7qDuYW5hrmHuIm4ireLt423jraOtpC1kbWStJS0lLOVs5eymLKZsZuxm7GcsJ6wn6+gr6Kvoq6hraGtoaygq6GroKqgqaCpoKifp5+nn6aepZ+lnqSeo56jnaKdoZ2gnaCcn52enJ6cnZycm5ybm5uam5qamZuYmpiZl5qWmZaZlZmUmZSYk5mSmJKXkZiQl4+Xj5eOl42WjZaMloyWjJeMl4yXjJiMmIyYjJqLmoubi52Lnoufi6GLoYuhi6KLoYugi6CLn4uei56LnYuci5yLm4uai5qLmYuYi5iLl4uWi5aLlYuUi5SLk4uSi5KLkYuQi5CLj4uOi46LjYuMi4yLi4uKi4qLiYuIi4iLh4uGi4aLhYuEi4SLg4uCi4KLgYuAi4CLf4t+i36LfYt8i3yLe4t6i3qLeYt4i3iLd4t2i3aLdYt0i3SLc4tyi3KLcYtwi3CLb4tui26LbYtsi2yLa4tqi2qLaYtoi2iLZ4tmi2aLZYtki2SLY4tii2KLYYtgi2CLX4tei16LXYtci1yLW4tai1qLWYtYi1iLV4tWi1aLVYtUi1SLU4tSi1KLUYtQi1CLT4tOi06LTYtMi0yLS4tKi0qLSYtIi0iLR4tGi0aLRYtEi0SLQ4tCi0KLQYtAi0CLP4s+iz6LPYs8izyLO4s6izqLOYs4iziLN4s2izaLNYs0izSLM4syizKLMYswizCLL4suiy6LLYssiyyLK4sqiyqLKYsoiyiLJ4smiyaLJYskiySLI4siiyKLIYsgiyCLH4seix6LHYscixyLG4saixqLGYsYixiLF4sWixaLFYsUixSLE4sSixKLEYsQixCLD4sOiw6LDYsMiwyLC4sKiwqLCYsIiwiLB4sGiwaLBYsEiwSLA4sCiwKLAYsA");
const GUNMAN_FLANK_STAGE6_CODE7_Y32_RIGHT_OFFSETS_NES = GUNMAN_FLANK_STAGE6_CODE7_Y32_RIGHT_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 33] as const);
const GUNMAN_FLANK_STAGE6_CODE7_Y64_LEFT_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BEEEQQVBBkIHQghCCUMJQwpDC0QMRA1EDkUORQ9FEEYRRhJGEkcTRxRHFUgWSBdIF0kYSRlJGkobShxKHEsdSx5LH0wgTCFMIU0iTSNNJE4lTiZOJk8nTyhPKVAqUCtQK1ErUSxRLVMtUy5ULlYuVy9YL1ovWzBcMF4wXzFgMWEyYjJjMmUyZjNnM2k0ajRqNGw1bTVuNnA2cTdxN3M4dDh1OXc5eDl4Ono6ezt8O348fzx/PYE9gj6DPoU/hT+GP4hAiUCKQYxBjEKNQo9DkEORRJNEk0SURZZFl0aYRplHmkebSJ1InkmeSaBJoEqgS6BLoEyfTaBOn06fT59Qn1GfUaBSoFOfVKBVoFWgVqFXoFigWaFaoVqhW6FcoV2hXqJeol+iYKJhomKiYqNjo2SiZaNmo2ejZ6Roo2mjaqRrpGukbKVtpG6kb6VvpXClcaVypXOldKZ0pnWldqZ3pnimeKd5p3qme6d8p3ynfah+p3+ngKiBqIGogqiDqISohamFqYaph6mIqYmpiaqKqoupjKqNqo6qjquPqpCqkauSq5Krk6yUq5WrlqyWrJesmKyZrJqsm62brZysna2erZ+tn66grqGtoq6jrqOupK+lrqaup6+or6ivqa+qr6uvrLCssK2wrrCvsLCwsLGxsbKxs7K0srWytbO2s7ezuLS5tLm0ubW5tbm1uba5t7m4ubq5u7m8uL64v7e/tsG1wbXBtMOzw7LDscSxxbDFr8avxq/Fr8WvxK7DrsOuwq7BrsGuwK2/rb+tvq29rb2tvK27rLusuqy5rLmsuKy4q7irt6u2q7artau0q7Sqs6qyqrKqsaqwqrCpr6muqa6pramsqayoq6iqqKqoqaioqKiop6emp6anpaekp6Sno6aipqKmoaahpqGmoKafpZ+lnqWdpZ2lnKWbpJukmqSZpJmkmKSXo5ejlqOVo5WjlKOTo5SjlKOUo5WilaGUoJWglZ+Vnpedl52YnJqcmpubm52bnpqfmqGaoZmhmaGYoZeglqGWoZWglKGToJOgkqGRoJCgj6CPoI6gjaCMoIygi6CKoImfiaCIoIefhqCGn4WfhKCDn4Ofgp+Bn4CfgJ9/n36ffZ98n3yee596n3meeZ94nneedp92nnWedJ5znnOecp5xnnCdcJ5vnm6dbZ5snmyda55qnWmdaZ5onWedZp1mnWWdZJ1jnWOcYp1hnWCcYJ1fnF6cXZ1cnFycW51anFmcWZxYnFecVpxWnFWbVJxTnFObUpxRm1CbUJxPm06bTZxMm0ybS5tKm0mbSZtIm0eaRptGm0WaRJtDmkOaQptBmkCaQJo/mj6aPZo8mjyaO5o6mjmZOZo4mjeZNpo2mTWZNJozmTOZMpkxmTCZMJkvmS6YLZksmSyYK5kqmSmYKZkomCeYJpkmmCWYJZkkmSOZIpoimiGbIJwgnSCeH6AfoSCiIKQgpSGmIqciqCOoJKklqiWqJqwnrCisKK4priquK7AssCyxLbIusi+zL7QwtTG1MrYytzO3NLk1uTW5Nrs3uzi8OL05vTq+O788vzzAPcE+wj/CP8NAw0HDQcRBw0HCQsJCwULBQsFCwEK/Qr9DvkO9Q71DvEO7Q7tEukS5RLlEuES3RLdFtkW1RbVFtEWzRbNFskaxRrFGsEavRq9GrketR61HrEerR6tHqkeqSKpIqUioSKhIp0imSaZJpUmkSaRJo0miSqJKoUqgSqBKn0qeSp5LnUucS5xMm0yaTJtNmk2ZTplOmE+YT5hQl1GWUZdSllOWU5ZUlVWVVZZWlVeVWJVYlVmVWpZblVyVXJZdll6WX5dgl2GXYZhimGOZZJplmmWaZpxnnGidaJ5pnmqfa6FroWyibaNtpG6kb6Zvp3CncalxqXKqc6tzrHSsda51r3avd7F3sXiyebN5tHq1e7Z8t3y3fbl+uX66f7uAvIC9gb6Cv4K/g8GEwYTChcSGxIbFh8aIx4jHicmKyYrKi8yMzIzNjc6Oz4/Pj9GQ0pHSkdSS1JPVk9aT1pPWlNeU1pXVldWW1JbTltSX05fSmNKY0ZnQmdGa0JrPm8+bzpzNnM6czZ3Mncyey57Kn8ufyqDJoMmhyKHIociix6LGo8ajxaTFpMWlxKXDpsOmwqbCp8KnwajAqMCpv6m/qr+qvqu9q72svKy8rLytu626rrquuq+5r7mwuLC3sbext7G2sraztbO1tLW0tLW0trS2tLezuLO5s7mzurO7s7yyvLO9s76zv7TAs8CzwbTCtMO0xLXFtsW2xrfHt8i3ybnJucq6y7vMu8y8zb7Ovs6/z8DQwdDC0cPRxNLF0sfTx9PI1MrUy9XM1c7Vz9XQ1tHW0tbT1tXW1tfX19nX2tfb193X3tbf1uHW4tbj1uXV5tXn1enV6tTr1O3T7dPu0vDS8dHy0fPQ9ND1z/bO9874zfnM+sz6");
const GUNMAN_FLANK_STAGE6_CODE7_Y64_LEFT_OFFSETS_NES = GUNMAN_FLANK_STAGE6_CODE7_Y64_LEFT_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 65] as const);
const GUNMAN_FLANK_STAGE6_CODE8_Y32_REAL_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BSEGIQchCCIJIgkiCiMLIwwjDSQOJA4kDyUQJRElEiYTJhMmFCcVJxYnFygXKBgoGSkaKRspHCocKh0qHisfKyArISwhLCIsIy0kLSUtJi4mLicuKC8pLyovKzArMCwwLTEuMS8xMDIwMjEyMjMzMzQzNDQ1NDY0NzU4NTk1OTY6Njs2PDc9Nz43Pjg/OEA4QTlCOUM5QzpEOkU6RjtHO0g7SDxJPEo8Sz1MPUw9TT5OPk8+UD9RP1E/UkBTQFRAVUFWQVZBV0JYQllCWkNbQ1tDXERdRF5EX0VgRWBFYUZiRmNGZEdkR2RHZEhkSGRIZElkSWRJZEpkSmRKZEtkS2RLZExkTGRMZE1kTWRNZE5kTmROZE9kT2RPZFBkUGRQZFFkUWRRZFJkUmRSZFNkU2RTZFRkVGRUZFVkVWRVZFZkVmRWZFdkV2RXZFhkWGVWZlVnU2hSalFrUGxPbk1vTXFMckt0SnVKdUp2SndKeEp5SnpKekp7SnxKfUp+Sn5Lf0uAS4FMgk2DToVPhlCHUohTilWLVoxYjVmNW45dj16QYJBikWSRZ5Jqkm2TcJNzk3aTeZN8k36Tf5KAkoKSg5KEkoWShZGFkIaPho+GjoeNhoyGjIeMh4yGjIaNhY2EjYSNg42CjYKOgY6AjoCOf45/jn+Pfo99j32PfI97j3uPepB5kHmQeJB3kHeQdpF1kXWRdJFzkXORcpFxknGScJJvkm+SbpJtk22TbJNrk2uTapNplGmUaJRolGiUZ5RmlGaVZZVklWSVY5VilWKWYZZglmCWX5Zell6WXZdcl1yXW5dal1qXWZhYmFiYV5hWmFaYVZlUmVSZU5lSmVKZUZlQmlGaUJpPmk+aTppNm02bTJtLm0ubSptJm0mcSJxHnEecRpxFnEWdRJ1DnUOdQp1BnUGeQJ4/nj+ePp49nj2ePJ87nzufOp85nzqfOaA4oDigN6A2oDagNaA0oTShM6EyoTKhMaEwojCiL6Iuoi6iLaIsoyyjK6MqoyqjKaMooyikJ6QmpCakJaQkpCSlI6UipSKlIqUhpSGlIKYfph+mHqYdph2mHKcbpxunGqcZpxmnGKgXqBeoFqgVqBWoFKgTqROpEqkRqRGpEKkPqg+qDqoNqg2qDKoLqgurCqsKqwqrCasIqwisB6wGrAasBawErAStA60CrQKtAa0A");
const GUNMAN_FLANK_STAGE6_CODE8_Y32_REAL_OFFSETS_NES = GUNMAN_FLANK_STAGE6_CODE8_Y32_REAL_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 5, y - 33] as const);
const GUNMAN_FLANK_STAGE6_CODE8_Y32_PHASE0_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BSEGIQchCCIIIgkiCiMLIwwjDSQNJA4kDyUQJRElESYSJhMmFCcVJxYnFigXKBgoGSkaKRspGyocKh0qHisfKyArICwhLCIsIy0kLSUtJS4mLicuKC8pLyovKjArMCwwLTEuMS4xLzIwMjEyMjMzMzMzNDQ1NDY0NzU4NTg1OTY6Njs2PDc9Nz03Pjg/OEA4QTlCOUI5QzpEOkU6RjtGO0c7SDxJPEo8Sz1LPUw9TT5OPk8+UD9QP1E/UkBTQFRAVUFVQVZBV0JYQllCWkNaQ1tDXERdRF5EX0VfRWBFYUZiRmNGY0dkR2RHZEhkSGRIZElkSWRJZEpkSmRKZEtkS2RLZExkTGRMZE1kTWRNZE5kTmROZE9kT2RPZFBkUGRQZFFkUWRRZFJkUmRSZFNkU2RTZFRkVGRUZFVkVWRVZFZkVmRWZFdkV2RXZFhkWGRYZFlkWWRZZFpkWmRaZFtkW2RbZFxkXGRcZF1kXWRdZF5kXmReZF9kX2RfZGBkYGRgZGFkYWRhZGJkYmRiZGNkY2RjZGRkZGRkZGVkZWRlZGZkZmRmZGdkZ2RnZGhkaGRoZGlkaWRpZGpkamRqZGtka2RrZGxkbGRsZG1kbWRtZG5kbmRuZG9kb2RvZHBkcGRwZHFkcWRxZHJkcmRyZHNkc2RzZHRkdGVzZ3JocGlvam5sbW1rbmpwanFpc2h0Z3Vndmd3Z3hmeWZ5Znpme2Z8Z31nfWd+Z39ogGiBaIFpg2qEa4Vsh22Ib4lwinGLc4x1jXaOeI95kHuQfZF/koGShJKHk4qTjZOQk5OTlpOZk5uTnJOdk56Tn5OgkqKSopKikaOQo4+jjqOOo42jjKSMpIykjKSMo4yijaKNoY2gjaCNn42ejp6OnY6cjpyOm46ajpqPmY+Yj5iPl4+Wj5eQlpCVkJWQlJCTkJORkpGRkZGRkJGPkY+RjpKNko2SjJKLkouSipOJk4mTiJOHk4eThpOFlIWUhJSDlIOUgpSBlYGVgJV/lX+Vf5V+ln6WfZZ8lnyWe5Z6lnqXeZd4l3iXd5d2l3aYdZh0mHSYc5hymHKYcZlwmXCZb5lumW6ZbZpsmmyaa5pqmmqaaZtom2ibaJtnm2ebZptlnGWcZJxjnGOcYpxhnWGdYJ1fnV+dXp1dnV2eXJ5bnlueWp5ZnlmfWJ9Xn1efVp9Vn1WgVKBToFOgUqBRoFGgUKFQoVChT6FOoU6hTaJMokyiS6JKokqiSaJIo0ijR6NGo0ajRaNEpESkQ6RCpEKkQaRApUClP6U+pT6lPaU8pTymO6Y6pjqmOaY4pjmnOKc3pzenNqc1pzWnNKgzqDOoMqgxqDGoMKkvqS+pLqktqS2pLKorqiuqKqopqimqKKonqyerJqslqyWrJKsjrCOsIqwhrCKsIawgrCCtH60erR6tHa0crRyuG64arhquGa4YrhivF68WrxavFa8UrxSvE7ASsBKwEbAQsBCwD7EOsQ6xDbEMsQyxC7EKsgqyCrIJsgmyCLIHswezBrMFswWzBLMDtAO0ArQBtAG0AA==");
const GUNMAN_FLANK_STAGE6_CODE8_Y32_PHASE0_OFFSETS_NES = GUNMAN_FLANK_STAGE6_CODE8_Y32_PHASE0_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 5, y - 33] as const);
const GUNMAN_FLANK_STAGE6_CODE9_Y48_PHASE1_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("9zH3MfYx9TL0MvMy8zPyM/Ez8DTvNO407jXtNew16zbqNuk26TfoN+c35jjlOOQ45DnjOeI54TrgOt863zveO9073DzbPNo82j3ZPdg91z7WPtY+1T/UP9M/0kDRQNFA0EHPQc5BzULMQsxCy0PKQ8lDyETHRMdExkXFRcRFw0bCRsJGwUfAR79Hvki+SL1IvEm7SbpJuUq5SrhKt0u2S7VLtEy0TLNMsk2xTbBNr06vTq5OrU+sT6tPqlCqUKlQqFGnUaZRpVKlUqRSo1OiU6FToVSgVJ9UnlWdVZxVnFabVptWm1ebV5tXm1ibWJtYm1mbWZtZm1qbWptam1ubW5tbm1ybXJtcm12bXZtdm16bXptem1+bX5tfm2CbYJtgm2GbYZthm2KbYptim2ObY5tjm2SbZJtkm2WbZZtlm2abZptmm2ebZ5tnm2ibaJtom2mbaZtpm2qbaptqm2uba5trm2ybbJtsm22bbZttm26bbptum2+bb5tvm3CbcJtwm3GbcZtxm3Kbcptym3Obc5tzm3SbdJpymHGXb5ZulW2TbJJrkWmPaY5ojGeLZopmiWaIZodmhmaGZoVmhGaDZoJmgmaBZoBnf2d+Z35ofGl7anpreGx3bnZvdXF0cnN0cnVxd3B5b3pvfG5+bYBtg22GbIlsjGyPbJJslWyYbJpsm2ycbJ1tnm2fbaFtoW6hb6FwoXChcaFyoXOhc6FzoXOhc6FzoHKfcp9yn3KecZ5xnXGccZxxm3GacZpxmXGYcZhxl3GWcZZxlXKUcpRyk3KSc5JzkXSQdJF0kHWPdY92jneOd454jXiNeY16jHqMe4x8jHyLfYx+jH+LgIyAjIGLgoyDjIOMg42DjYONg46DjoOOg4+Dj4OPg5CDkIOQg5GDkYORg5KDkoOSg5ODk4OTg5SDlIOUg5WDlYOVg5aDloOWg5eDl4OXg5iDmIOYg5mDmYOZg5qDmoOag5uDm4Obg5yDnIOcg52DnYOdg56DnoOeg5+Dn4Ofg6CDoIKggaGAoICgf6F+oX2hfKJ7oXuheqJ5oniid6J3onaidaN0o3Oic6Nyo3GjcKRvpG6jbqRtpGyka6VqpGqkaaVopWelZqVmpWWlZKZjpmKmYaZhpmCmX6dep12mXadcp1unWqhZp1mnWKhXqFaoValUqFSoU6lSqVGpUKlQqU+pTqpNqkypTKpLqkqqSatIq0eqR6tGq0WrRKxDq0OrQqxBrECsP6w/rD6sPa08rTutO646rjquOa84sDiwN7I3sze0N7Y3tze4OLo4uzm7Or06vTu9PL89vz2/PsE/wUDCQcNBw0HCQcJBwUHAQcBBv0K+Qr5CvUK8QrxCu0O6Q7pDuUO4Q7hDt0O2RLZEtUS0RLREs0SzRbNFskWxRbFFsEWvRq9GrkatRq1GrEarRqtHqkepR6lHqEenR6dIpkilSKVIpEijSKNIokmhSaFJoEmfSZ9KnkqdSp5LnUucS5xMm0yaTZpNmk6ZTplPmE+YUJhRmFGXUpdTl1OWVJdVllaWVpdXlliWWZdal1qXW5dcl12XXphfmF+YYJphmmKaY5tjm2ScZZ1mnWeeZ59ooGmgaaJqo2uja6VspW2mbaduqG+ob6pwq3Grca1yrXOudK90sHWxdrJ2s3ezeLV4tXm2erd6uHu5fLp8u327fr1+vX++gMCAwIHBgsKCw4PDhMWFxYXGhsiHyIfJiMqJy4nLis2LzovOjNCN0I3RjtKP04/TkNWR1pHWktiT2JPZlNqV25bclt2X3pjemOCZ4JrhmuKb45zknOWd5p7mnuif6KDpoOuh66Lsou2i7aLto+2j7aTspOyl66Xqpuqm6qfpp+mn6KjnqOep56nmquaq5avkq+Ss5KzjrOOt4q3hruGu4a/gr+Cw37Desd+x3rLdst2z3bPctNy13LXbttu327fauNu527rautu72rzavdu+277bv9vA28HbwtzD3MPcxN7F3sbex9/H38jgyeHK4sriy+PM5M3kzebO58/nz+nQ6tDq0ezS7dLu0u/T8NPx1PPU9NT11ffV+NX41vrW+w==");
const GUNMAN_FLANK_STAGE6_CODE9_Y48_PHASE1_OFFSETS_NES = GUNMAN_FLANK_STAGE6_CODE9_Y48_PHASE1_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 247, y - 49] as const);

export function gunmanFlankLifetime(entityCode: 7 | 8 | 9, originY = 0, stage = 2, phase = 0, fromRight = false): number {
  const scoped = stage === 6 && entityCode === 7 && Math.round(originY) === 64 ? GUNMAN_FLANK_STAGE6_CODE7_Y64_LEFT_OFFSETS_NES.length : stage === 6 && entityCode === 7 && Math.round(originY) === 32 ? (fromRight ? GUNMAN_FLANK_STAGE6_CODE7_Y32_RIGHT_OFFSETS_NES.length : GUNMAN_FLANK_STAGE6_CODE7_Y32_LEFT_OFFSETS_NES.length) : stage === 6 && entityCode === 8 && Math.round(originY) === 32 && phase === 0 ? GUNMAN_FLANK_STAGE6_CODE8_Y32_PHASE0_OFFSETS_NES.length : stage === 6 && entityCode === 8 && Math.round(originY) === 32 && phase === 1 ? GUNMAN_FLANK_STAGE6_CODE8_Y32_REAL_OFFSETS_NES.length : stage === 6 && entityCode === 9 && Math.round(originY) === 48 && phase === 1 && fromRight ? GUNMAN_FLANK_STAGE6_CODE9_Y48_PHASE1_OFFSETS_NES.length : stage === 3 && entityCode === 7 && Math.round(originY) === 64 && phase === 1 ? (fromRight ? GUNMAN_FLANK_STAGE3_CODE7_RIGHT_OFFSETS_NES.length : GUNMAN_FLANK_STAGE3_CODE7_LEFT_OFFSETS_NES.length) : stage === 3 && entityCode === 8 && Math.round(originY) === 64 && phase === 0 ? GUNMAN_FLANK_STAGE3_CODE8_PHASE0_OFFSETS_NES.length : stage === 2 && Math.round(originY) === 64 && entityCode === 8 ? GUNMAN_FLANK_Y64_TRACE_SAMPLES_NES[entityCode].length : stage === 2 && Math.round(originY) === 64 && entityCode === 9 ? GUNMAN_FLANK_Y64_CODE9_TRACE_SAMPLES_NES.length : stage === 2 && Math.round(originY) === 32 && entityCode !== 7 ? GUNMAN_FLANK_SCOPED_LIFETIMES_FRAMES[entityCode] : undefined;
  return (scoped ?? Math.round(GUNMAN_FLANK_LIFETIMES[entityCode] * NES_FRAME_RATE)) / NES_FRAME_RATE;
}

export function gunmanFlankFirstOpportunityFrame(seed: number): number {
  return gunmanFirstOpportunityFrame(seed, 16);
}

const GUNMAN_TOP_PATHS_NES = {
  center: [[0, 88, 1], [16, 88, 22], [32, 88, 43], [48, 88, 64], [64, 92, 83], [80, 97, 103], [96, 102, 124], [112, 110, 134], [128, 122, 132], [144, 135, 134], [160, 148, 136], [176, 161, 138], [192, 174, 141], [208, 187, 143], [224, 200, 148], [240, 211, 163], [256, 205, 177], [272, 191, 183], [288, 191, 174], [304, 191, 163], [320, 191, 152], [336, 191, 142], [352, 191, 131], [368, 191, 120], [384, 191, 110], [400, 191, 99], [416, 191, 88], [432, 191, 78], [448, 191, 67], [464, 191, 56], [480, 191, 46], [496, 191, 35], [512, 191, 24], [528, 191, 14], [544, 191, 3], [548, 191, 0]],
  left: [[0, 88, 1], [16, 88, 22], [32, 88, 43], [48, 88, 64], [64, 83, 83], [80, 78, 103], [96, 73, 124], [112, 65, 134], [128, 53, 132], [144, 45, 132], [160, 47, 122], [176, 50, 111], [192, 52, 101], [208, 55, 91], [224, 57, 80], [240, 60, 71], [256, 62, 60], [272, 65, 50], [288, 67, 41], [304, 74, 51], [320, 71, 72], [336, 69, 94], [352, 66, 114], [368, 62, 133], [384, 50, 133], [400, 38, 132], [416, 25, 130], [432, 13, 130], [448, 13, 133], [464, 18, 133], [480, 12, 136], [496, 12, 141], [512, 12, 146], [528, 12, 152], [544, 12, 157], [560, 12, 162], [576, 12, 168], [592, 12, 173], [608, 12, 178], [624, 12, 184], [640, 12, 189], [650, 12, 192], [828, 12, 252]],
  right: [[0, 88, 1], [16, 88, 22], [32, 88, 43], [48, 88, 64], [64, 96, 80], [80, 106, 95], [96, 117, 110], [112, 128, 124], [128, 139, 138], [144, 151, 151], [160, 163, 162], [176, 169, 156], [192, 174, 147], [208, 179, 137], [224, 185, 129], [240, 196, 127], [256, 209, 134], [272, 215, 130], [288, 217, 131], [304, 207, 137], [320, 194, 142], [336, 181, 148], [352, 168, 153], [368, 154, 158], [384, 141, 164], [400, 128, 169], [416, 115, 174], [432, 101, 180], [448, 88, 185], [464, 75, 190], [480, 62, 196], [496, 48, 201], [512, 44, 201], [528, 56, 204], [544, 69, 209], [560, 82, 211], [576, 95, 214], [592, 108, 216], [608, 121, 218], [624, 134, 221], [640, 146, 219], [656, 158, 218], [672, 163, 214], [688, 165, 204], [704, 170, 194], [720, 175, 185], [736, 180, 175], [752, 185, 166], [768, 190, 157], [784, 195, 147], [800, 200, 137], [816, 206, 129], [832, 217, 127], [848, 230, 134], [864, 242, 146], [880, 247, 140], [896, 244, 135], [912, 232, 135], [928, 220, 134], [944, 207, 133], [960, 195, 132], [976, 188, 124], [992, 188, 113], [1008, 196, 107], [1024, 209, 107], [1040, 221, 117], [1056, 228, 136], [1072, 233, 156], [1088, 238, 176], [1104, 243, 197], [1120, 248, 216], [1136, 247, 218], [1152, 242, 209], [1168, 237, 199], [1184, 232, 189], [1195, 229, 183]],
} as const;

const decodeGunmanTopSamples = (encoded: string): readonly (readonly [number, number])[] => {
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  const samples: [number, number][] = [];
  for (let index = 0; index + 1 < bytes.length; index += 2) samples.push([bytes[index]!, bytes[index + 1]!]);
  return samples;
};
// Complete 642-frame left-edge code-7 trace, normalized to its x=4/y=33
// entry sample. The runtime mirrors this trace for right-edge code-7 entries.
const GUNMAN_FLANK_TRACE_SAMPLES_NES = decodeGunmanTopSamples("AAAAAAEAAgEDAQQBBQIFAgYCBwMIAwkDCQQKBAsEDAUNBQ4FDgYPBhAGEQcSBxMHEwgUCBUIFgkXCRgJGAoZChoKGwscCx0LHQweDB8MIA0hDSENIg4jDiQOJQ8mDyYPJhAnECgQKRIpEyoTKhUrFisXLBksGSwaLRwtHS4eLiAvIC8hMCMwJDElMScyJzIoMiozKzMsNC40LjUvNTE2MjYzNzU3NTc2ODg4OTk6OTs6PDo9Oz87QDxBPEI8Qz1EPkY+Rz5HP0k/SkBLQE1BTUFOQlBDUUNRRFNEVEVURVZGV0dYR1lIWkhbSVxKXUpeS19LYExhTGNNY05kTmVOZE9kT2RQY1FjUWNSYlNiU2JUYlViVmJWYldhWGJZYlpiWmNbYlxiXWNeY15jX2RgZGFkYmVjZWNlZGZlZmZmZ2doZ2hnaWhqaGtobGltaW1pbmpvanBqcWtya3Jrc2x0bHVsdm12bXdteG55bnpue297b3xvfXB+cH9wgHGAcYFxgnKDcoRyhXOFc4Zzh3SIdIl0inWKdYt1jHaNdo52jnePd5B3kXiSeJN4k3mUeZV5lnqXeph6mHuZe5p7m3ycfJ18nX2efZ99oH6hfqJ+on+jf6R/pYCmgKeAp4GogamBqoKrgquCrIOtg66Dr4SwhLCEsYWyhbOFtIa1hrWGtoe3h7iHuYi6iLqIu4m8ib2Jvoq/ir+LwIzBjMKMw43DjsSOxZDGkMaQx5LIksiTyZXKlcqWy5jMmMyZzZvNm86czp7Pn8+gz6LQo9Ck0KbRptGn0anRqtGr0a3RrtGv0bHRstGz0bXRttG30bnRutC70L3Qvs+/z8HPws7CzsTNxc3GzMjMyMvJysvKy8nMyM7IzsfPxtDG0cXRxNLD08PTwtTB1cDVv9a/1r7Wvde817vXuti62LnYuNm32LbYttm12LTYs9mz2LLYsdiw2LDXr9ev167Wrdat1qzVrNWr1KvTqtSq06rSqdKp0anQqNCoz6jOp86nzafNp82mzKbLpsulyqXJpcmkyKTHpMejxqPFo8aixaLEosSiw6HCocKhwaDAoMCgv5++n76fvZ69nr2evJ27nbudup25nLmcuJy3m7ebtpu1mraatZq0mbSZs5mymLKYsZiwmLCXr5eul66WrZatlq2VrJWrlauUqpSplKmTqJOnk6eTppKlkqaSpZGkkaSRo5CikKOQo5GikqOTo5OilKOVo5ailqOXopiimaOZopqim6Kcop2inaOdo52jnaSdo56jnqSepJ6knqWepZ6lnqaepp6mnqeep56nnqieqJ6onqmeqZ6pnqqeqp6qnqueq56rnqyerJ6snq2erZ6tnq6erp6unq+er56vnrCesJ6wnrGesZ6xnrKesp6ynrOes56znrSetJ60nrWetZ61nraetp62nreet563nrieuJ64nrmeuZ65nrqeup66nrueu567nryevJ68nr2evZ69nr6evp6+nr+ev56/nsCewJ7AnsGewZ7BnsKewp7CnsOew57DnsSexJ7EnsWexZ7Fnsaexp7Gnseex57HnsieyJ7InsmeyZ7Jnsqeyp7Knsuey57LnsyezJ7Mns2ezZ7Nns6ezp7Ons+ez57PntCe0J7QntGe0Z7RntKe0p7SntOe057TntSe1J7UntWe1Z7Vntae1p7Wntee157Xntie2J7Yntme2Z7Zntqe2p7a");
const GUNMAN_TOP_TRACE_SAMPLES_NES = {
  center: decodeGunmanTopSamples("WAFYAlgDWAVYBlgHWAlYClgLWA1YDlgPWBFYElgTWBVYFlgXWBlYGlgbWB1YHlgfWCFYIlgjWCVYJlgnWClYKlgrWC1YLlgvWDFYMlgzWDVYNlg3WDlYOlg7WD1YPlg/WEBYQFhBWENZRFlFWUdaSFpJWktaTFtNW09bUFxRXFJcU11UXVZdV15YXlpeW19cX15fX19gYGJgYmBjYWVhZmFnYmliamJrY21jbmNvZHFkcmRzZHRldWV2ZXhmeWZ6ZnxnfWd+Z4BogWiCaIRphGmFaYZqhmqGa4Zshm2FbYZuhm+FcIZwhXGFcoZzhXSFdIZ1hXaFd4V3hXiFeYV6hXqEe4V8hX2EfYV+hH+EgIWBhYGFgoWDhYSFhYaFhoaFh4aIhomGiYeKhouGjIeNh46HjoiPh5CHkYiSiJKIk4iUiJWIlomWiZeImImZiZqJm4qbipyJnYqeip+Kn4ugiqGKoouji6OLpIuli6aLp4yojKiMqYyqjKuMrI2sja2Mro2vjbCNsI6xjbKNs460jrWOtY+2jreOuI+5j7mPuo+7j7yPvZC9kL6Pv5DAkMGQwpHCkcORxJLFksaSx5THlMiUyZXKlsqWy5jMmM2ZzZrOm8+bz53QndGe0aDSodKh06PTpNOk06bUp9So06rTq9Os0q3RrtGu0K/PsM6wzbHNscyxy7PKs8mzybTItMe0xrXFtcS1xLbDtsK2wbfAt7+3v7i/t7+2v7a/tb+0v7S/s7+yv7K/sb+wv7C/r7+uv66/rb+sv6y/q7+qv6q/qb+ov6i/p7+mv6a/pb+kv6S/o7+iv6K/ob+gv6C/n7+ev56/nb+cv5y/m7+av5q/mb+Yv5i/l7+Wv5a/lb+Uv5S/k7+Sv5K/kb+Qv5C/j7+Ov46/jb+Mv4y/i7+Kv4q/ib+Iv4i/h7+Gv4a/hb+Ev4S/g7+Cv4K/gb+Av4C/f79+v36/fb98v3y/e796v3q/eb94v3i/d792v3a/db90v3S/c79yv3K/cb9wv3C/b79uv26/bb9sv2y/a79qv2q/ab9ov2i/Z79mv2a/Zb9kv2S/Y79iv2K/Yb9gv2C/X79ev16/Xb9cv1y/W79av1q/Wb9Yv1i/V79Wv1a/Vb9Uv1S/U79Sv1K/Ub9Qv1C/T79Ov06/Tb9Mv0y/S79Kv0q/Sb9Iv0i/R79Gv0a/Rb9Ev0S/Q79Cv0K/Qb9Av0C/P78+vz6/Pb88vzy/O786vzq/Ob84vzi/N782vza/Nb80vzS/M78yvzK/Mb8wvzC/L78uvy6/Lb8svyy/K78qvyq/Kb8ovyi/J78mvya/Jb8kvyS/I78ivyK/Ib8gvyC/H78evx6/Hb8cvxy/G78avxq/Gb8Yvxi/F78Wvxa/Fb8UvxS/E78SvxK/Eb8QvxC/D78Ovw6/Db8Mvwy/C78Kvwq/Cb8Ivwi/B78Gvwa/Bb8EvwS/A78CvwK/Ab8A"),
  left: decodeGunmanTopSamples("WAFYAlgDWAVYBlgHWAlYClgLWA1YDlgPWBFYElgTWBVYFlgXWBlYGlgbWB1YHlgfWCFYIlgjWCVYJlgnWClYKlgrWC1YLlgvWDFYMlgzWDVYNlg3WDlYOlg7WD1YPlg/WEBXQFdBV0NWRFZFVkdVSFVJVUtVTFRNVE9UUFNRU1JTU1JUUlZSV1FYUVpRW1BcUF5QX1BgT2JPYk9jTmVOZk5nTWlNak1rTG1MbkxvS3FLcktzS3RKdUp2SnhJeUl6SXxIfUh+SIBHgUeCR4RGhEaFRoZFhkWGRIZDhkKFQoZBhkCFP4Y/hT6FPYY8hTuFO4Y6hTmFOIU4hTeFNoU1hTWENIUzhTKEMoUxhDCEL4UvhC6ELYUshCyELIUshSyELYQtgy2CLYItgS2ALoAufy5+Ln4ufS58LnwvfC97L3svei95L3kweDB3MHcwdjB1MHUwdDFzMXMxcjFxMXExcDJvMm8ybjJtMm0ybDNrM2szajNpM2kzaDNnNGc0ZjRlNGU0ZTRkNWQ1YzViNWI1YTVgNWA2XzZeNl42XTZcNlw3WzdaN1o3WTdYN1g4VzhWOFY4VThUOFQ4UzlSOVI5UTlQOVA5TzpOOk46TTpNOk06TDpLO0s7SjtJO0k7SDtHPEc8RjxFPEU8RDxDPUM9Qj1BPUE9QD0/PT8+Pj49Pj0+PD47Pjs/Oj85Pzk/OD83Pzc/NkA2QDZANUA0QDRAM0EyQTJBMUEwQTBBL0IuQi5CLUIsQixCK0IqQypDKUMoQylDKUMpQypEKkQpRSpGKkcqSCxILEktSS9KMEoxSjNKM0k0STZJN0k4STpJO0k8SD5IP0hASEJIQ0hER0ZHR0dIR0pHS0dMRk5GT0ZQRlJGU0ZURlZFV0VYRVpFW0VcRV5EX0RgRGJEYkRjRGVEZkNnQ2lDakNrQ21DbkJvQnFCckJzQnVBdkF3QXlBekB7QH1Afj9/P4A/gT+CPoQ+hT6FPYY8hTyFO4Y6hTmFOYU4hTeFNoU2hTWFNIUzhTKEMoUxhTCEL4UvhC6ELYUshCyEK4QqhCmEKYQohCeDJoQmhCWDJIQjhCKDIoQhgyCDH4Qfgx6DHYMcgxyDG4MagxmCGYMYgxeCFoMWghWCFIMTghKCEoMRghCCD4IPgg6CDYIMggyBDIIMggyCDIMMgwyDDIQLhQuFC4YLhgyFDIYNhQ2EDYQOgw6CDoMPgw+DEIMRgxGDEoQThROFE4YThhKFEYYRhhCFD4YOhQ6FDYYMhQyFDIYMhgyGDIcMhwyHDIgMiAyIDIkMiQyJDIoMigyKDIsMiwyLDIwMjAyMDI0MjQyNDI4MjgyODI8MjwyPDJAMkAyQDJEMkQyRDJIMkgySDJMMkwyTDJQMlAyUDJUMlQyVDJYMlgyWDJcMlwyXDJgMmAyYDJkMmQyZDJoMmgyaDJsMmwybDJwMnAycDJ0MnQydDJ4MngyeDJ8MnwyfDKAMoAygDKEMoQyhDKIMogyiDKMMowyjDKQMpAykDKUMpQylDKYMpgymDKcMpwynDKgMqAyoDKkMqQypDKoMqgyqDKsMqwyrDKwMrAysDK0MrQytDK4MrgyuDK8MrwyvDLAMsAywDLEMsQyxDLIMsgyyDLMMswyzDLQMtAy0DLUMtQy1DLYMtgy2DLcMtwy3DLgMuAy4DLkMuQy5DLoMugy6DLsMuwy7DLwMvAy8DL0MvQy9DL4Mvgy+DL8Mvwy/DMAMwAzADMEMwQzBDMIMwgzCDMMMwwzDDMQMxAzEDMUMxQzFDMYMxgzGDMcMxwzHDMgMyAzIDMkMyQzJDMoMygzKDMsMywzLDMwMzAzMDM0MzQzNDM4MzgzODM8MzwzPDNAM0AzQDNEM0QzRDNIM0gzSDNMM0wzTDNQM1AzUDNUM1QzVDNYM1gzWDNcM1wzXDNgM2AzYDNkM2QzZDNoM2gzaDNsM2wzbDNwM3AzcDN0M3QzdDN4M3gzeDN8M3wzfDOAM4AzgDOEM4QzhDOIM4gziDOMM4wzjDOQM5AzkDOUM5QzlDOYM5gzmDOcM5wznDOgM6AzoDOkM6QzpDOoM6gzqDOsM6wzrDOwM7AzsDO0M7QztDO4M7gzuDO8M7wzvDPAM8AzwDPEM8QzxDPIM8gzyDPMM8wzzDPQM9Az0DPUM9Qz1DPYM9gz2DPcM9wz3DPgM+Az4DPkM+Qz5DPoM+gz6DPsM+wz7"),
  right: decodeGunmanTopSamples("WAFYAlgDWAVYBlgHWAlYClgLWA1YDlgPWBFYElgTWBVYFlgXWBlYGlgbWB1YHlgfWCFYIlgjWCVYJlgnWClYKlgrWC1YLlgvWDFYMlgzWDVYNlg3WDlYOlg7WD1YPlg/WEBYQFhBWENZRFpFWkZbR1tIXElcSl1LXk1eTV9OX1BgUGFRYVNiU2JUY1VkVmRXZVhmWWZaZ1toXGhcaV5qX2pfa2FsYWxibWNuZG5kb2ZwZ3BncWlyaXJqc2t0bHVtdW52b3dvd3F4cXlyeXN6dHt1e3Z8d313fXl+eX96f3yAfIF9gX6Cf4N/g4GEgYWChYSGhIeFiIaIh4mHiomKiouKjIuMjI2Mjo6Pjo+PkJCRkZGRkpOTk5STlZWVlZaWl5eYl5iYmZmampuam5ucnJ2cnp6enp+eoKChoKGgoqKjoqSjpaSlpKWjpaOloqahpqGmoKegp6Cnn6ieqJ6onamcqZypm6qaqpqqmaqYq5mrmKuXrJeslqyVrZWtlK2TrpOukq6Rr5GvkK+Qr5Cwj7COsI6xjbGMsYyyi7KKsoqzibOIs4m0iLSHtIe0hrWFtYW1hLaDtoO3g7eCuIK4gbmBuYG6gLt/u4C8f71/vX++f79+v3/AfsF+wn/DfsN+xH/Ff8Z/x4DHgMiAyYHKgcuBzILMgs2CzoTPhNCE0IbRhtKH04jTiNOI04nUiNSI1IjVh9WG1YbWhdaE1oTWg9eC14LYgdiB2IHZgNl/2YDZgNmA2YHZgdmB2YLZgtmC2YPZg9mD2YXZhdmF2IbXhtaG1YfUh9SH04jSiNGI0InPic+JzorNisyKy4vKi8qLyYzIjMeMxo3GjcWNxI7DjsKOwY/Bj8CPv5C+kL2QvJG8kbuRupK5kriSt5O3k7aTtZS0lLOUspWylbGVsJavlq6Wrpetl6yXq5iqmKmYqZmomaeZppqlmqSapJujm6KboZygnJ+cn52enZ2dnJ6bnpqemp+Zn5ifl6CWoJWglaGUoZOhkqKRopGikKOPo46jjaSMpIyki6WKpYmliKaHpoemhqeFp4Sng6iCqIKogamAqX+pfqp9qn2qfKt7q3qreax5rHisd612rXWtdK50rnOucq9xr3Cvb7BvsG6wbbFssWuxarJqsmmyaLNns2azZbRltGS0Y7VitWG1YLZgtl+2Xrddt1y3XLhbuFq4WblYuVe5V7pWulW6VLtTu1K7UrxRvFC8T71OvU29Tb5Mvku+Sr9Jv0i/SMBHwEbARcFEwUTBQ8JCwkHCQMM/wz/DPsQ9xDzEO8U6xTrFOcY4xjfGNsc1xzXHNMgzyDLIMckwyTDJL8ouyi3KLMssyyzLLMwszCzMLM0rzCvLK8sryizJLMktyS3ILskvyDDIMMkxyTLJM8o0yjXKNcs2yzfLOMw5zDrMOs07zTzNPc4+zj/OP89Az0HPQtBD0EPQRNFF0UbRR9JI0UjRSdJK0kvSTNJM0k3STtNP01DSUNNR01LTU9RU1FXTVdRW1FfUWNVZ1FnUWtVb1VzVXdVd1V7VX9Zg1mHWYtZi1mPWZNdl12bWZtdn12jXadhq12rXa9hs2G3Ybtlv2G/YcNlx2XLZc9lz2XTZddp22nfZd9p42nnaett723zafNt9237bf9yA24DbgdyC3IPchNyE3IXcht2H3IjciN2J3Irci9yL3IzcjdyO3I7bj9yQ3JHbkdyS25PblNyV25XbltuX25jbmNuZ25rbm9ub25zandue257an9ug2qHaodui2qPapNql2qXapNqk2aTYo9ij16PWo9aj1aLUotSi06LSotKi0aPRo9Gj0KPPo8+kzqTNpM2lzKXLpculyqbJpsmmyKfHp8inx6jGqMaoxanEqcSpw6rCqsKqwarAq8Crv6u/rL+svqy9rb2tvK27rruuuq65r7mvuK+3r7iwt7C2sLaxtbG0sbSys7KysrKzsbOws7C0r7SvtK+0rrWtta21rLartqu2qrept6m3qLinuKi4p7mmuaa5pbmkuqS6o7qiu6K7obugvKC8n7yfvZ+9nr2dvp2+nL6bvpu/mr+Zv5nAmMCXwJjBl8GWwZbClcKUwpTDk8OSw5LDkcSQxJDEkMWPxY/FjsaNxo3GjMeLx4vHisiJyInIiMiHyYjJh8mGyobKhcqEy4TLg8yCzIPNgs2BzoHOgc+A0IDQgNF/0oDSf9N+1H/Uf9V+1n/Xfth+2H/Zf9p/24DcgNyA3YHegd+B4ILhguGC4oPjg+SE5YXlhuaG54foiOiI6YrqiuuK64zsjO2N7o7uju+P8JDxkfGR8pLzk/OT85Tzk/SS9JL0kfWQ9ZD1j/WO9o72jfaN9433jPeL+Iv4iviJ+Yn5iPmH+Yj5iPiI+Ij3iPaI9Yj1iPSH84jyiPKH8Yjwh++H74juh+2H7Ijsh+uH6ofph+iH6Ifnh+aG5Yflh+SG44fihuKG4Yfght+G34feht2G3IbchtuG2obZhtiF2IbXhtaF1YbVhdSF04bShdKF0YXQhc+Fz4XOhc2FzIXMhcuEyoXJhciEyIXHhMaExoTFhMSDw4TDg8KCwoPBgsCBwIK/gb+Av4C+f75/vX+9fr19vH28fLx7vHu8ert5u3m7eLt3u3e7drt1u3W8dLxzvHO8crxxvXG9cL1vvnC+b79uv26/bcBswG3BbMJrwmzDa8NqxGvFasZqxmrHashpyGrJasppy2rMasxqzWrOas9q0GvRa9Fr0mzTbNRt1W7VbtZu13DYcNlw2XLacttz23Tcdd113XfeeN9433rge+B74X3hfuJ/4oHjguOC44TkheSG5IjlieWK5YzljeaO5pDmkeeS55TnlOiV6JfomOmZ6ZvpnOqd6p/qoOqh66PrpOuk7Kbsp+yo7artq+2s7q7ur+6w77Lvs++077bwtvC38LnxuvG78b3yvvK/8sHzwvPD88X0xvTG9Mj0yfXK9cz1zfbO9tD20ffS99T31fjW+Nj42PnZ+dv53Pnd+d753vne+d/53vnd+d343Pjc+Nz32/fa99r22fbY9tj11/XW9db01fTU9NT01PPT89Pz0vLR8tHy0PHP8c/xzvDN8M3wzO/M78zvy+/K7sruye7I7cjtx+3G7MbsxezE68TrxOvD6sPqwurB6sHpwOm/6b/ovui96L3nvOe857zmu+a65rrlueW45bjltw=="),
} as const;

const decodeGunmanHeadings = (encoded: string): Uint8Array => Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
const GUNMAN_TOP_HEADING_SAMPLES_NES = {
  center: decodeGunmanHeadings("EBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEA8ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcICAgICAkJCQkJCgoKCgoLCwsLCwwMDAwMDQ0NDg8QERITFBUWFxcXFxcXFxcXFxgYFxgYGBgYGBgYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"),
  left: decodeGunmanHeadings("EBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBESEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQIDBAUGBwgJCgsMDQ4PEBERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERISEhISERISEhISEhIaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhkYFxYVFBMbGwMDAwMDAwMDAwQFBgcICQoCAhoaGhoaGhoaGhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhoCAhoaAgIaGgICGhobAwMCAgICAgICAgICAgICAgICAgIC"),
  right: decodeGunmanHeadings("EBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEA8ODQwMDAwMDAwMDAwMDAwMDAsLCwsLCwwMDAsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsKCwoKCwsLCwoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAwMDAwQEBAQEBQUFBQUGBgYGBgcHBwcHCAgICAgJCQkJCQoKCgoKCgoKAgICAgICAgICAgICAgMDAwMDBAUGBwgJCgsMDQ4PEBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgZGhscHR4fAAECAwQFBgcICAgICAgICAgICAgICAgICAgICAgICAcHCAcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYeHh4eHh8fHx8fAAAAAAABAQEBAQICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwMDAwMEBAQEBAUFBQUFBgYGBgYHBwcHBwgICAgICQkJCQkKCgoKCgoKCgoKCgoKCgoKCgoKCgoKAgICAgICAgICAgICAgICAgICAgICAhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGxsbGxscHBwcHB0dHR0dHh4eHh4fHx8fHwAAAAAAAQEBAQECAgICAgMDAwMDBAQEBAQFBQUFBQYGBgYGBwcHBwcICAgICAkJCQkJCgoKCgoLCwsLCwwMDAwMDQ0NDQ0ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODgYGHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4="),
} as const;

export type GunmanTopBranch = keyof typeof GUNMAN_TOP_PATHS_NES;

export function gunmanTopBranch(targetX: number, originX: number): GunmanTopBranch {
  const relative = targetX - originX;
  return relative < 0 ? "left" : relative > 96 ? "right" : "center";
}

export function gunmanTopPosition(age: number, targetX: number, originX = 88, originY = 0): readonly [number, number] {
  const branch = gunmanTopBranch(targetX, originX);
  const frame = Math.max(0, Math.round(age * NES_FRAME_RATE));
  const trace = GUNMAN_TOP_TRACE_SAMPLES_NES[branch];
  if (originX === 88 && originY === 0 && frame < trace.length) {
    const [sampleX, sampleY] = trace[frame]!;
    return [(originX + sampleX - 88) * NES_WORLD_X_SCALE, (originY + sampleY) * NES_WORLD_Y_SCALE];
  }
  const path = GUNMAN_TOP_PATHS_NES[branch];
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

export function gunmanTopHeading(age: number, targetX: number, originX = 88, originY = 0): number | undefined {
  if (originX !== 88 || originY !== 0) return undefined;
  const samples = GUNMAN_TOP_HEADING_SAMPLES_NES[gunmanTopBranch(targetX, originX)];
  return samples[Math.max(0, Math.round(age * NES_FRAME_RATE))];
}

export function gunmanFlankPosition(entityCode: 7 | 8 | 9, age: number, originY = 0, stage = 2, phase = 0, fromRight = false): readonly [number, number] {
  const path = stage === 2 && Math.round(originY) === 32 && entityCode !== 7 ? GUNMAN_FLANK_SCOPED_PATHS_NES[entityCode] : GUNMAN_FLANK_PATHS_NES[entityCode];
  const frame = Math.max(0, Math.round(age * NES_FRAME_RATE));
  const y64Trace = stage === 6 && entityCode === 7 && Math.round(originY) === 64 ? GUNMAN_FLANK_STAGE6_CODE7_Y64_LEFT_OFFSETS_NES : stage === 3 && entityCode === 7 && Math.round(originY) === 64 && phase === 1 ? (fromRight ? GUNMAN_FLANK_STAGE3_CODE7_RIGHT_OFFSETS_NES : GUNMAN_FLANK_STAGE3_CODE7_LEFT_OFFSETS_NES) : stage === 3 && entityCode === 8 && Math.round(originY) === 64 && phase === 0 ? GUNMAN_FLANK_STAGE3_CODE8_PHASE0_OFFSETS_NES : stage === 2 && Math.round(originY) === 64 ? entityCode === 8 ? GUNMAN_FLANK_Y64_TRACE_SAMPLES_NES[entityCode] : entityCode === 9 ? GUNMAN_FLANK_Y64_CODE9_OFFSETS_NES : undefined : undefined;
  const scopedTrace = stage === 6 && entityCode === 7 && Math.round(originY) === 32 ? (fromRight ? GUNMAN_FLANK_STAGE6_CODE7_Y32_RIGHT_OFFSETS_NES : GUNMAN_FLANK_STAGE6_CODE7_Y32_LEFT_OFFSETS_NES) : stage === 6 && entityCode === 8 && Math.round(originY) === 32 ? phase === 0 ? GUNMAN_FLANK_STAGE6_CODE8_Y32_PHASE0_OFFSETS_NES : phase === 1 ? GUNMAN_FLANK_STAGE6_CODE8_Y32_REAL_OFFSETS_NES : undefined : stage === 6 && entityCode === 9 && Math.round(originY) === 48 && phase === 1 && fromRight ? GUNMAN_FLANK_STAGE6_CODE9_Y48_PHASE1_OFFSETS_NES : undefined;
  if (scopedTrace && frame < scopedTrace.length) return scopedTrace[frame]!;
  if (y64Trace && frame < y64Trace.length) return y64Trace[frame]!;
  if (entityCode === 7 && frame < GUNMAN_FLANK_TRACE_SAMPLES_NES.length) return GUNMAN_FLANK_TRACE_SAMPLES_NES[frame]!;
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
export function gunmanFirstOpportunityFrame(seed: number, originY = 0): number {
  let value = seed & 0xff;
  let increments = 0;
  do {
    value = (value + 3) & 0xff;
    increments += 1;
  } while (value < 0xc0);
  const firstIncrementFrame = originY >= 0x10 && originY < 0xe0 ? 1 : 13;
  return firstIncrementFrame + increments - 1;
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
export const BANDIT_BILL_RANDOM_HANDOFF_FINE_X = 64;
export const BANDIT_BILL_RANDOM_HANDOFF_FINE_Y = 200;
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
  const [x, y] = SNIPER_BULLET_VELOCITIES_NES[heading & 31] ?? SNIPER_BULLET_VELOCITIES_NES[0];
  return [x * 3 * NES_FRAME_RATE * NES_WORLD_X_SCALE, y * 3 * NES_FRAME_RATE * NES_WORLD_Y_SCALE];
}

export function cutterBoomerangHeadingToward(originX: number, originY: number, targetX: number, targetY: number): number {
  return nesAimHeading(originX, originY, targetX, targetY);
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
// Sparse samples use combat-relative frames; the source trace includes the entry.
const CUTTER_COMBAT_PATH_EXTENDED_NES = [...CUTTER_COMBAT_PATH_NES, [3328, 168, 85], [3392, 132, 40], [3456, 118, 57], [3520, 95, 85], [3584, 130, 85], [3600, 130, 85], [4096, 146, 104], [4608, 77, 93], [5120, 169, 65], [5632, 70, 58], [6144, 114, 74], [6656, 152, 93], [7168, 121, 81], [7680, 218, 46], [8192, 210, 111], [8704, 129, 102], [9216, 126, 116], [9728, 59, 41], [10240, 122, 59], [10752, 79, 97], [11264, 104, 61], [11776, 57, 61], [12000, 41, 72]] as const;

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
export const CUTTER_RANDOM_HANDOFF_FINE_X = 244;
export const CUTTER_RANDOM_HANDOFF_FINE_Y = 188;
export const CUTTER_RANDOM_HANDOFF_SEGMENT_FRAMES = 38;
export const CUTTER_RANDOM_HANDOFF_GAIT = 0x87;
const CUTTER_MOVEMENT_HEADINGS = [0x40, 0x44, 0x48, 0x48, 0x48, 0x4c, 0x4c, 0x50, 0x50, 0x50, 0x54, 0x54, 0x58, 0x58, 0x58, 0x5c] as const;

export type CutterMovementState = {
  frame: number;
  x: number;
  y: number;
  heading: number;
  segmentFrames: number;
  gait: number;
  attackEnabled?: boolean;
  attackPhase?: "prep" | "dash" | "hold";
  attackResumeFrame?: number;
};

export function createCutterMovementState(x: number, y: number): CutterMovementState {
  return { frame: CUTTER_RANDOM_ROUTE_START_FRAME, x, y, heading: 0x58, segmentFrames: 35, gait: 0x84 };
}

export function advanceCutterMovement(state: CutterMovementState, targetFrame: number, randomByte: () => number): void {
  while (state.frame < targetFrame) {
    state.frame += 1;
    let attackStarted = false;
    if (state.attackEnabled) {
      const cycleFrame = state.frame & 0xff;
      if (cycleFrame === 0) {
        state.attackPhase = "prep";
        state.attackResumeFrame = undefined;
        attackStarted = true;
      }
      if (state.attackPhase === "prep" && !attackStarted) {
        if (cycleFrame === 26) {
          state.attackPhase = "dash";
          state.heading = state.x < 128 ? 0x84 : 0x9c;
        }
        continue;
      }
      if (state.attackPhase === "dash") {
        const previousX = state.x;
        const previousY = state.y;
        moveEncodedHeading(state, state.heading);
        if (Math.floor(state.y) < 40) {
          state.x = previousX;
          state.y = previousY;
          state.heading = 0xc0;
          state.attackPhase = "hold";
          state.attackResumeFrame = state.frame + 26;
        }
        continue;
      }
      if (state.attackPhase === "hold") {
        if (state.attackResumeFrame !== undefined && state.frame >= state.attackResumeFrame) state.attackPhase = undefined;
        else continue;
      }
    }
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
    if (attackStarted) state.heading = 0xc0;
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
// Sparse samples use combat-relative frames; the source trace includes the entry.
const DEVIL_HAWK_COMBAT_PATH_EXTENDED_NES = [[3488, 53], [3520, 47], [3552, 57], [3584, 107], [3600, 109], [4096, 89], [4608, 67], [5120, 45], [5632, 123], [6144, 53], [6656, 48], [7168, 88], [7680, 55], [8192, 57], [8704, 61], [9216, 42], [9728, 82], [10240, 68], [10752, 88], [11264, 84], [11776, 77], [11857, 69]] as const;
const DEVIL_HAWK_COMBAT_X_EXTENDED_NES = [[3488, 122], [3520, 122], [3552, 119], [3584, 119], [3600, 119], [4096, 118], [4608, 111], [5120, 115], [5632, 134], [6144, 124], [6656, 50], [7168, 119], [7680, 122], [8192, 154], [8704, 99], [9216, 135], [9728, 126], [10240, 122], [10752, 139], [11264, 223], [11776, 122], [11857, 142]] as const;
const DEVIL_HAWK_COMBAT_PATH_FULL_NES = [...DEVIL_HAWK_COMBAT_PATH_NES, ...DEVIL_HAWK_COMBAT_PATH_EXTENDED_NES] as const;
const DEVIL_HAWK_COMBAT_X_FULL_NES = [...DEVIL_HAWK_COMBAT_X_NES, ...DEVIL_HAWK_COMBAT_X_EXTENDED_NES] as const;
export const DEVIL_HAWK_JUMP_PERIOD = 121;

const DEVIL_HAWK_MOVEMENT_HEADINGS = [0x40, 0x40, 0x44, 0x44, 0x48, 0x48, 0x4c, 0x4c, 0x50, 0x50, 0x54, 0x54, 0x58, 0x58, 0x5c, 0x5c] as const;
const DEVIL_HAWK_ACTION_HEADINGS = [0x90, 0x90, 0x50, 0x50, 0x10, 0x10, 0x00, 0x00, 0x40, 0x40, 0x80, 0x80, 0xa2, 0x90, 0x9a, 0x20] as const;
export const DEVIL_HAWK_RANDOM_ROUTE_START_FRAME = 3_600;
export const DEVIL_HAWK_RANDOM_HANDOFF_FINE_X = 220;
export const DEVIL_HAWK_RANDOM_HANDOFF_FINE_Y = 206;
export const DEVIL_HAWK_RANDOM_HANDOFF_HEADING = 0x44;
export const DEVIL_HAWK_RANDOM_HANDOFF_SEGMENT_FRAMES = 71;
export const DEVIL_HAWK_RANDOM_HANDOFF_GAIT = 0x84;
export const DEVIL_HAWK_RANDOM_HANDOFF_ACTION_COUNTER = 14;

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
  romExactActions?: boolean;
  actionBounceCounter?: number;
  actionCooldownFrames?: number;
  actionBounceDirection?: -1 | 1;
  actionOriginX?: number;
  actionOriginY?: number;
  actionPathIndex?: number;
};

export function createDevilHawkMovementState(x: number, y: number): DevilHawkMovementState {
  return { frame: DEVIL_HAWK_RANDOM_ROUTE_START_FRAME, mode: "move", x, y, heading: 0x40, segmentFrames: 30, gait: 3, actionCounter: 30, actionFrames: 0, actionHeading: 0x40, actionKind: "hold", correctionHoldFrames: 0, correctionReleaseFrames: 0 };
}

function devilHawkVerticalBounceDelta(counter: number): number {
  if (counter >= 20) return -5;
  if (counter >= 16) return -4;
  if (counter >= 12) return -3;
  if (counter >= 8) return -1;
  if (counter >= 4) return 0;
  return 1;
}

const DEVIL_HAWK_DOWN_ACTION_OFFSETS_NES = [
  [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0],
  [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0],
  [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0],
  [0, 0], [0, 0], [0, 0], [0, 1], [0, 2], [-2, 3], [-4, 4], [-4, 9],
] as const;
const DEVIL_HAWK_DOWN_ACTION_TAIL_NES = [[-4, 14], [-3, 13], [-2, 13], [-2, 12], [-2, 11], [-2, 10], [-2, 9], [-2, 9], [-2, 9], [-2, 9], [-2, 9], [-2, 10], [-2, 11], [-2, 12], [-2, 13], [-2, 16], [-2, 19], [-2, 22], [-2, 25], [-2, 29], [-2, 33], [-2, 37], [-2, 41], [-2, 46], [-2, 51], [-2, 56], [-2, 61], [-2, 61]] as const;
const DEVIL_HAWK_DOWN_ACTION_OFFSETS_FULL_NES = [...DEVIL_HAWK_DOWN_ACTION_OFFSETS_NES, ...DEVIL_HAWK_DOWN_ACTION_TAIL_NES] as const;

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
      if (state.romExactActions && state.actionKind === "jump") {
        if (state.actionFrames > 0) {
          state.actionFrames -= 1;
          if (state.actionFrames !== 0) continue;
          state.actionBounceCounter = state.actionBounceDirection === -1 ? 31 : 24;
          if (state.actionBounceDirection !== -1) continue;
          const offset = DEVIL_HAWK_DOWN_ACTION_OFFSETS_FULL_NES[27];
          if (offset && state.actionOriginX !== undefined && state.actionOriginY !== undefined) {
            state.x = state.actionOriginX + offset[0];
            state.y = state.actionOriginY + offset[1];
          }
          state.actionPathIndex = 28;
          continue;
        }
        if (state.actionBounceCounter !== undefined) {
          state.actionBounceCounter -= 1;
          if (state.actionBounceDirection === -1) {
            const index = state.actionPathIndex ?? 0;
            const offset = DEVIL_HAWK_DOWN_ACTION_OFFSETS_FULL_NES[index];
            if (offset && state.actionOriginX !== undefined && state.actionOriginY !== undefined) {
              state.x = state.actionOriginX + offset[0];
              state.y = state.actionOriginY + offset[1];
            }
            state.actionPathIndex = index + 1;
            if (state.actionBounceCounter >= 0) continue;
          }
          if (state.actionBounceCounter < 0) {
            state.actionBounceCounter = undefined;
            state.mode = "move";
            state.actionCounter = 47;
            state.actionCooldownFrames = 28;
            continue;
          }
          state.y += devilHawkVerticalBounceDelta(state.actionBounceCounter) * (state.actionBounceDirection ?? -1);
          if (state.actionBounceDirection === 1 && state.actionBounceCounter === 18) fullFans.push(true);
          continue;
        }
      }
      state.actionFrames -= 1;
      if (state.actionKind === "jump") advanceDevilHawkGait(state, DEVIL_HAWK_ACTION_HEADINGS[Math.max(0, state.actionFrames) >> 1] ?? state.actionHeading);
      if (state.actionKind === "hold" && state.actionFrames === 13) fullFans.push(false);
      if (state.actionKind === "jump" && state.actionFrames === 0) fullFans.push(true);
      if (state.actionFrames <= 0) state.mode = "move";
      continue;
    }
    if (state.romExactActions && state.actionCooldownFrames !== undefined) {
      if (state.actionCooldownFrames > 0) {
        state.actionCooldownFrames -= 1;
        if (state.actionCooldownFrames > 0) continue;
      }
      state.actionCooldownFrames = undefined;
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
        if (state.romExactActions) {
          state.actionFrames = Math.floor(state.y) < 88 ? 28 : 26;
          state.actionBounceDirection = Math.floor(state.y) < 88 ? -1 : 1;
          if (state.actionBounceDirection === -1) {
            state.actionOriginX = state.x;
            state.actionOriginY = state.y;
            state.actionPathIndex = 0;
          }
        }
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
  const sampledFrame = Math.min(frame, last[0]);
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
  const sampledFrame = Math.min(frame, last[0]);
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

// Initial route sampled from round4-boss-long-record.json.

const NINJA_BOSS_INITIAL_X_RUNS_NES = [[0,176],[44,175],[46,174],[47,173],[48,172],[49,171],[50,170],[51,169],[52,168],[53,167],[54,166],[55,165],[57,164],[58,163],[59,162],[60,161],[61,160],[62,159],[63,158],[64,157],[65,156],[66,155],[67,154],[69,153],[70,152],[71,151],[72,150],[73,149],[74,148],[75,147],[77,148],[78,149],[79,151],[80,152],[81,153],[82,154],[83,155],[84,156],[85,158],[86,159],[87,160],[88,161],[89,162],[90,163],[91,164],[92,166],[94,164],[95,163],[96,162],[97,161],[98,160],[99,159],[100,158],[101,156],[102,155],[103,154],[104,153],[105,152],[106,151],[107,149],[108,148],[109,147],[137,146],[138,145],[139,144],[140,143],[141,141],[142,140],[143,139],[144,138],[145,137],[146,136],[147,134],[148,133],[149,132],[150,131],[151,130],[152,129],[154,127],[155,125],[156,124],[157,122],[158,120],[159,119],[160,117],[161,115],[162,114],[163,112],[164,110],[165,109],[166,107],[167,105],[168,104],[169,102],[197,104],[198,105],[199,107],[200,109],[201,110],[202,112],[203,114],[204,115],[205,117],[206,119],[207,120],[208,122],[209,124],[210,125],[211,127],[212,129],[214,127],[215,125],[216,124],[217,122],[218,120],[219,119],[220,117],[221,115],[222,114],[223,112],[224,110],[225,109],[226,107],[227,105],[228,104],[229,102],[232,103],[235,104],[238,105],[241,106],[244,107],[248,108],[251,109],[254,110],[257,111],[260,112],[264,113],[267,114],[270,115],[273,116],[276,117]] as const;
const NINJA_BOSS_INITIAL_Y_RUNS_NES = [[0,125],[1,123],[2,121],[3,118],[4,117],[5,116],[6,114],[7,113],[9,112],[13,113],[14,114],[16,117],[17,120],[18,122],[19,125],[20,129],[21,132],[22,136],[23,139],[24,144],[25,149],[26,153],[27,158],[28,160],[29,161],[30,163],[31,165],[33,159],[34,154],[35,150],[36,145],[37,142],[38,138],[39,136],[40,133],[44,134],[45,135],[46,137],[47,136],[48,134],[50,129],[51,123],[52,119],[53,115],[54,111],[55,108],[56,105],[57,103],[59,102],[60,103],[62,105],[63,107],[64,105],[65,104],[93,101],[94,99],[95,97],[96,95],[98,94],[99,95],[101,97],[102,100],[103,103],[104,107],[105,111],[106,115],[107,117],[108,118],[110,114],[111,110],[112,107],[113,104],[114,102],[115,100],[116,99],[117,98],[118,99],[119,100],[120,102],[121,104],[122,107],[123,110],[153,106],[154,102],[155,99],[156,96],[157,94],[158,92],[159,91],[160,90],[161,91],[162,92],[163,94],[164,96],[165,99],[166,102],[170,98],[171,94],[172,91],[173,88],[174,86],[175,84],[176,83],[177,82],[178,83],[179,84],[180,86],[181,88],[182,91],[183,94],[187,92],[188,90],[189,89],[190,88],[191,87],[192,86],[199,87],[201,88],[202,89],[203,90],[204,91],[205,92],[206,93],[207,95],[208,97],[209,99],[210,101],[211,103],[212,105],[213,107],[214,109],[215,112],[216,115],[217,118],[218,120],[219,123],[220,126],[221,129],[222,132],[223,136],[224,140],[225,144],[226,148],[227,152],[228,156],[229,161],[230,166],[231,171],[232,176],[233,178],[234,180],[236,174],[237,168],[238,163],[239,158],[240,154],[241,150],[242,147],[243,144],[244,143],[245,142],[248,143],[249,144],[250,142],[251,140],[279,138],[280,136],[281,135],[282,134],[285,135],[286,136],[287,139],[288,142],[289,146],[290,150],[291,155],[292,160],[293,162],[294,164]] as const;
// Dense samples from round4-boss-long-record.json preserve the ROM's stepped
// re-entry motion instead of smoothing long plateaus across a jump.
const NINJA_BOSS_REENTRY_X_RUNS_NES = [[0,112],[133,111],[134,110],[135,109],[136,108],[137,106],[138,105],[139,104],[140,103],[141,102],[142,101],[143,99],[144,98],[145,97],[146,96],[147,95],[148,94],[209,95],[210,97],[211,99],[212,100],[213,102],[214,104],[215,105],[216,107],[217,109],[218,110],[219,112],[220,114],[221,115],[222,117],[223,118],[224,120],[243,121],[244,122],[245,124],[246,125],[247,126],[248,127],[249,128],[250,129],[251,131],[252,132],[253,133],[254,134],[255,135],[256,136],[257,137],[258,139],[287,140],[288,142],[289,144],[290,145],[291,147],[292,149],[293,150],[294,152],[295,154],[296,155],[297,157],[298,159],[299,160],[300,162],[301,163],[302,165],[304,163],[305,162],[306,160],[307,159],[308,157],[309,155],[310,154],[311,152],[312,150],[313,149],[314,147],[315,145],[316,144],[317,142],[318,140],[319,139],[391,140],[392,141],[393,142],[394,143],[395,144],[396,146],[397,147],[398,148],[399,149],[400,150],[401,151],[402,153],[403,154],[404,155],[405,156],[406,157]] as const;
const NINJA_BOSS_REENTRY_Y_RUNS_NES = [[0,64],[73,62],[74,60],[75,59],[76,58],[79,59],[80,60],[81,63],[82,66],[83,70],[84,74],[85,79],[86,84],[87,86],[88,88],[116,86],[117,84],[118,83],[119,82],[122,83],[123,84],[124,87],[125,90],[126,94],[127,98],[128,103],[129,108],[130,110],[131,112],[133,109],[134,106],[135,105],[136,103],[138,102],[140,103],[141,105],[142,108],[143,111],[144,114],[145,119],[146,123],[147,125],[148,126],[150,124],[151,122],[152,121],[153,120],[156,121],[157,122],[158,125],[159,128],[160,132],[161,136],[162,141],[163,146],[164,148],[165,150],[167,144],[168,138],[169,133],[170,128],[171,124],[172,120],[173,117],[174,114],[175,113],[176,112],[179,113],[180,114],[181,112],[182,110],[209,106],[210,102],[211,99],[212,96],[213,94],[214,92],[215,91],[216,90],[217,91],[218,92],[219,94],[220,96],[221,99],[222,102],[226,100],[227,98],[228,97],[229,96],[232,97],[233,98],[234,101],[235,104],[236,108],[237,112],[238,117],[239,122],[240,124],[241,126],[243,121],[244,115],[245,111],[246,106],[247,103],[248,100],[249,97],[250,95],[251,94],[253,95],[255,97],[256,98],[257,97],[258,96],[287,92],[288,88],[289,85],[290,82],[291,80],[292,78],[293,77],[294,76],[295,77],[296,78],[297,80],[298,82],[299,85],[300,88],[304,84],[305,80],[306,77],[307,74],[308,72],[309,70],[310,69],[311,68],[312,69],[313,70],[314,72],[315,74],[316,77],[317,80],[347,78],[348,76],[349,75],[350,74],[353,75],[354,76],[355,79],[356,82],[357,86],[358,90],[359,95],[360,100],[361,102],[362,104],[391,98],[392,93],[393,88],[394,84],[395,81],[396,77],[397,75],[398,72],[402,73],[403,74],[404,76],[405,75],[406,73],[408,67],[409,61],[410,56],[411,51],[412,47],[413,43],[414,40],[415,37],[416,36],[417,35],[420,36],[421,37],[422,35],[423,33]] as const;

function sampleNinjaAxis(path: readonly (readonly [number, number])[], age: number, offset: number, scale: number): number {
  const frame = Math.max(0, Math.round(age * NES_FRAME_RATE));
  const nextIndex = path.findIndex(([at]) => at > frame);
  const sample = path[nextIndex < 0 ? path.length - 1 : Math.max(0, nextIndex - 1)]!;
  return (sample[1] + offset) * scale;
}


export function ninjaBossCombatX(age: number, entryX = 176 * NES_WORLD_X_SCALE, reentry = false): number {
  if (reentry) {
    return sampleNinjaAxis(NINJA_BOSS_REENTRY_X_RUNS_NES, age, entryX / NES_WORLD_X_SCALE - 112, NES_WORLD_X_SCALE);
  }
  return sampleNinjaAxis(NINJA_BOSS_INITIAL_X_RUNS_NES, age, entryX / NES_WORLD_X_SCALE - 176, NES_WORLD_X_SCALE);
}

export function ninjaBossCombatY(age: number, entryY = 128 * NES_WORLD_Y_SCALE, reentry = false): number {
  if (reentry) {
    return sampleNinjaAxis(NINJA_BOSS_REENTRY_Y_RUNS_NES, age, entryY / NES_WORLD_Y_SCALE - 64, NES_WORLD_Y_SCALE);
  }
  if (age < NINJA_BOSS_ENTRY_INVULNERABILITY) return entryY;
  return sampleNinjaAxis(NINJA_BOSS_INITIAL_Y_RUNS_NES, age - NINJA_BOSS_ENTRY_INVULNERABILITY, entryY / NES_WORLD_Y_SCALE - 128, NES_WORLD_Y_SCALE);
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
export const WINGATE_FINAL_DEFEAT_ANIMATION_DURATION = 9 / NES_FRAME_RATE;
export const WINGATE_FINAL_ENDING_DELAY = 761 / NES_FRAME_RATE;
export const WINGATE_ENDING_INPUT_DELAY = 4_125 / NES_FRAME_RATE;
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
  return { frame: 0, mode: "entry", x: x + fineX / 256, y: fineY / 256, heading: 0x50, segmentFrames: 0, gait: 0x88, correctionFrames: 0, correctionPass: 0 };
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
  if (state.gait === 0x80) state.gait = 4;
  else if (state.gait === 0) state.gait = 0x88;
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

export type LandmarkType = "town" | "rock" | "village" | "cliff" | "forest" | "cemetery" | "open";

export interface RoundSegment {
  at: number;
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
  [{ at: 146, landmark: "town" }, { at: 416, landmark: "town" }, { at: 551, landmark: "open" }, { at: 731, landmark: "town" }],
  [{ at: 146, landmark: "rock" }, { at: 500, landmark: "rock" }, { at: 1_050, landmark: "rock" }, { at: 1_500, landmark: "rock" }],
  [{ at: 146, landmark: "village" }, { at: 420, landmark: "village" }, { at: 980, landmark: "village" }, { at: 1_480, landmark: "village" }],
  [{ at: 146, landmark: "cliff" }, { at: 480, landmark: "open" }, { at: 1_020, landmark: "cliff" }, { at: 1_520, landmark: "open" }],
  [{ at: 146, landmark: "forest" }, { at: 420, landmark: "forest" }, { at: 980, landmark: "forest" }, { at: 1_480, landmark: "forest" }],
  [{ at: 146, landmark: "cemetery" }, { at: 420, landmark: "open" }, { at: 980, landmark: "cemetery" }, { at: 1_500, landmark: "open" }],
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
