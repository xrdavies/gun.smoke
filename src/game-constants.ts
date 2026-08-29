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
const decodeCoordinateRuns = (encoded: string): readonly (readonly [number, number])[] => {
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  const samples: [number, number][] = [];
  for (let index = 0; index + 2 < bytes.length; index += 3) {
    for (let count = bytes[index]!; count > 0; count -= 1) samples.push([bytes[index + 1]!, bytes[index + 2]!]);
  }
  return samples;
};
const GUNMAN_FLANK_STAGE1_AT1423_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BDEFMQYxBzIHMggyCTMKMwszDDQMNA00DjUPNRA1ETYRNhI2EzcUNxU3FjgWOBc4GDkZORo5GzobOhw6HTseOx87IDwgPCE8Ij0jPSQ9JD4lPiY+Jz8oPyk/KUAqQCtAK0EsQS1CLUMuRC5FL0cvSC9IMEowSzBMMU4xTzFQMlIyUzJUMlYzVzNYM1o0WjRbNF01XjVfNWE2YjZjNmU3ZjdnN2k3ajhqOGw4bTluOXA5cTpyOnQ7dTt1PHc8eD15PXs9fD58Pn4/fz+AQIJAg0GDQYVChkKHQolDikOKRIxEjUWORZBGkEaRR5NHlEiVSJdIl0mYSZpKm0qcS55LnkyfTKFMoU2hTaFOoE+gT6BQoFGfUqBSn1OfVJ9Un1WeVp9Xn1ifWJ9Zn1qfW6BcoF2gXaFeoV+hYKJhomKiYqNjo2SjZaRmpGakZ6VopWmlaqZrpmumbKdtp26nb6hwqHCocalyqXOpdKp1qnWqdqt3q3ireax6rHqse618rX2tfq5+rn+ugK+Br4Kvg7CDsISwhbGGsYexiLKIsomyirOLs4yzjbSNtI60j7WQtZG1kraStpO2lLeVt5a3l7iXuJi4mbmauZu5m7qcup26nrufu6C7oLyhvKK8o72kvaW9pb6mvqe+qL+pv6q/qsCrwKzArcGuwa/Br8KwwrHCssOzw7PEtMW1xbbFt8e3x7jIucm6yrrKu8y8zLzNvc+9z77Qv9K/0sDTwNXB1sHXwdjC2cLawtzD3cPew+DD4cPixOTE5cTmxOjE6cTqxOzE7cPuw/DD8cPyw/TC9cL2wvjB+MH5wfs=");
const GUNMAN_FLANK_STAGE1_AT1423_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT1423_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 48] as const);
const GUNMAN_FLANK_STAGE1_AT1743_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+FH3UfdR9lL1UvRS81PyU/JT8VTwVO9U7lXuVe1V7FbrVupW6VfpV+hX51jmWOVY5FnkWeNZ4lrhWuBa31vfW95b3VzcXNtc2l3aXdld2F7XXtZe1V/VX9Rf02DSYNFg0WHRYdBhz2PPZM5lzmbNZ81ozGrMa8tsy23KbspvyXHJcslyyHTIdcd2x3jGecZ5xXvFfMR9xH7Df8OAwoLCgsGDwIXAhr+Gv4i+ib6JvYu8jLyMu467j7qQuZG5kriTuJS3lbeWtpi1mLWZtJu0m7Ocs56ynrGfsaGworCir6SvpK6jrqSto62irKKsoqyirKOsoq2hraKuoa6gr6GwoLCfsZ+xn7Kes56znrSdtJ21nLWctpy3m7ebuJu4mrmauZq6mbuYu5m8mLyXvZi+l76Wv5e/lsCVwJXBlcKUwpTDlMOTxJPEk8WSxpLGkceRx5HIkMmQyZDKj8qOy4/LjsyNzY7Njc6Mzo3PjM+L0IvRi9GK0orSitOJ04nTidOJ1IrVitaK14vXi9iM2Y3ZjtmP2pHaktmT2ZXZltiX15jXmdaZ1ZvVm9Sc057TntKf0aDRodChz6LOo86kzaXMpsymy6fKqMmoyKnIqseqxqzFrMWsxK7DrsKvwrDBsMCxv7K/s76zvbS8tby1u7e6t7m3uLm4ube5tru1u7W8tL2zvbK+sr+xwLDAr8Gvwa/Ar8GuwK6/rr+tvq29rb2tvKy7rLusuqu5q7mruKq4qriqt6m2qbaptai0qLSos6iyp7KnsaewprGmsKavpa+lrqWtpK2krKSro6ujqqOpo6miqKKooqihp6GmoaagpaCkoKSfo5+in6KeoZ6gnqGeoJ2fnZ+dnpydnJ2cnJubm5ubmpqZmpmamJmYmZiZl5mWmJaYlZiUl5SXk5eSlpKWkZaQlZGVkJWPlI+UjpSNlI2TjJOLk4uSipKJkomRiJGIkYiQh5CGkIaPhY+Ej4SPg46CjoKOgY2AjYGNgIx/jH+Mfot9i32LfIp7inuKeop5iXmJeYl4iHiId4h2h3aHdYd0hnSGc4ZyhXKFcYVwhXGEcIRvhG+DboNtg22CbIJrgmuBaoFpgWmAaYBogGiAZ39mf2Z/ZX5kfmR+Y31ifWJ9YXxgfGF8YHtfe197Xntdel16XHpbeVt5WnlZeFl4WXhYd1h3V3dWdlZ2VXZUdlR1U3VSdVJ0UXRQdFFzUHNPc09yTnJNck1xTHFLcUtxSnBJcElwSW9Ib0hvR25GbkZuRW1EbURtQ2xCbEJsQWxAa0FrQGs/aj9qPmo9aT1pPGk7aDtoOmg5ZzlnOWc4ZzhmN2Y2ZjZlNWU0ZTRkM2QyZDJjMWMwYzFiMGIvYi9iLmEtYS1hLGArYCtgKl8pXylfKV4oXiheJ10mXSZdJV0kXCRcI1wiWyJbIVsgWiFaIFofWR9ZHlkdWB1YHFgbWBtXGlcZVxlWGVYYVhhVF1UWVRZUFVQUVBRTE1MSUxJTEVIQUhFSEFEPUQ9RDlANUA1QDE8LTwtPCk4JTglOCU4ITQhNB00GTAZMBUwESwRLA0sCSgJKAUoASQFJAA==");
const GUNMAN_FLANK_STAGE1_AT1743_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT1743_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 80] as const);
const GUNMAN_FLANK_STAGE1_AT1791_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BIEFgQaBB4IHggiCCYMKgwuDC4QMhA2EDoUPhRCFEIYRhhKGE4cUhxWHFYgWiBeIGIkZiRqJGoobihyKHYseix+LH4wgjCGMIo0jjSONJI4ljiaOJ48ojyiPKZAqkCuQK5EskS2RLZMuky6UL5YwlzCXMZkxmjKaMpwznTSdNJ81oDagNqI3ojijOKU5pTmmOqc7qDyoPKo9qz6rPq0/rUCuQK9BsEGwQbBCr0KuQ69DrkStRK1FrEWsRqxGq0aqR6pHqUipSKlJqEmnSqdKpkumS6ZLpUykTKRNo02jTqNOok+hT6FQoFCgUKBRn1GeUp5SnlOdU51UnFWcVZxWm1abV5tYmliaWZpamluaW5pcml2ZXppfml+aYJthmmKaY5tjm2SbZZxmnWedaJ5onmmeaqBroGuhbKJtom6jbqRvpXClcaZyp3Knc6h0qXWpdat2q3ereK14rXmueq97r3uwfLF9sn6yfrN/tIC0gbaCtoK2g7iEuIW4hbqGuoe7iLyIvIm9ir6Lv4u/jMCNwY7BjsOPw5DDkcWSxZLFk8eUx5TIlcqWypbLl8yYzZjOmdCZ0JrRmtOb1JvVnNac15zYndqd253cnd6d357gnuKe457knuae557onuqe657sne6d753wnfKd85zznPWc9pv3m/ma+pr7");
const GUNMAN_FLANK_STAGE1_AT1791_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT1791_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 128] as const);
const GUNMAN_FLANK_STAGE1_AT1983_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+DH3MfYx9TL0MvQy8zPyM/Ez8DTvNO807jXtNew16zbqNuo26TfoN+c35jjmOOU45DnjOeI54TrhOuA63zveO9073DzcPNs82j3ZPdg91z7XPtY+1T/UP9M/0kDSQNFA0UHQQc9Bz0POQ85EzUbNR8xIzErLSstLyk3KTslPyVHIUchSx1THVcdWxlfGWMVZxFvEW8Ncw17CXsJfwWHAYsBiv2S/Zb5lvme9aLxpvGq7a7tsum26brlvuHC4cbdyt3S2dLV1tXe0d7R4s3qzerJ7sX2xfrB+sICvga+BroOthK2ErIash6uIqomqiqmLqYyojaiOp5CmkKaRpZOlk6SUpJajlqKXopmhmaCaoJyfnJ+dnp+dn52gnKGbopuimqSZpJilmKeXp5aolqmVqpSqlKyTrZKtkq+Rr5CwkLGPso+yj7KOsY6wjbGNsIyvjK+Lroutiq6KrYmsiayJq4iqiKuHqoephqmGqIWnhaiEp4SmhKaDpYOlgqWCpIGjgaOAooCif6J/oX+gfqB+n32ffZ98nnyde517nHqcepx5m3maeZp4mXiZd5l3mHaXdpd1l3WWdJZ0lXSUc5RzlHKTcpNxknGRcJFwkW+Qb5Bvj26Obo5tjm2NbI1sjGuLa4tqi2qKaYppiWmIaIhoiGeHZ4dmhmaFZYZlhWSEZIRkg2OCY4NigmKBYYFhgGB/YIBff19+X35efV58XX1dfFx7XHtbelt5WnpaeVp4WXhZd1h3WHdXdld1VnVWdFV0VXRUc1RyVHJTcVNxUnFScFFvUW9QblBuT25PbU9sTmxOa01rTWtMakxpS2lLaEpoSmhKZ0lmSWZIZkhlR2VHZEZjRmNFY0ViRGJEYURgQ2BDYEJfQl9BXkFdQF1AXT9cP1w/Wz5aPlo9Wj1ZPFk8WDtXO1g6VzpWOlY5VTlUOFU4VDdTN1M2UjZRNVI1UTRQNFA0TzNOM08yTjJNMU0xTDBLMEwvSy9KL0ouSS5ILUktSCxHLEcrRitGKkYqRSpEKUQpQyhDKEMnQidBJkEmQCVAJUAkPyQ+JD4jPSM9Ij0iPCE7ITsgOiA6HzofOR84HjgeOB03HTccNhw1GzUbNRo0GjQaMxkyGTIYMhgxFzEXMBYvFi8VLxUuFC4ULRQsEywTLBIrEisRKhEpECkQKQ8oDygPJw4mDicNJg0lDCUMJAsjCyQKIwoiCiIJIQkgCCEIIAcfBx8GHgYdBR4FHQQcBBwEGwMaAxsCGgIZARkBGAAYABg=");
const GUNMAN_FLANK_STAGE1_AT1983_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT1983_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 48] as const);
const GUNMAN_FLANK_STAGE1_AT2079_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+DH3MfYx9TL0MvQy8zPyM/Ez8DTvNO807jXtNew16zbqNuo26TfoN+c35jjlOOU45DnjOeI54TrhOuA63zveO9073DzcPNs82j3ZPdg91z7XPtY+1T/UP9M/0kDSQNFA0UHQQc9Cz0PORM1FzUfNSMxIzErLS8tMyk7KTslPyVHIUshTx1THVcdWxljFWcVZxFvEXMNcw17CX8FgwWHAYsBjv2S/Zb5mvWi9aLxpvGu7a7psum65brlvuHG4crdytnS2dbV1tXe0eLR4s3qye7J8sX2xfrB/r4Cvga6CroSthK2FrIerh6uIqoqqiqmLqY2ojqeOp5CmkaaRpZOllKSUo5ajl6KYopmhmqCan5yfnZ6dnp+dn5ygnKKbopqjmqSZpZilmKeXqJaolqqVqpSrlKyTrZKtkq+RsJCwj7KPso+xj7GOsI6vjbCNr4yujK6LrYusiq2KrIqriauJqoipiKqHqYeohqiGp4WnhaeFpoSlhKWDpIOkgqSCo4GigaKAoYChf6F/oH+ffp9+nn2efZ58nXyce5x7m3qbept6mnmZeZl4mXiYd5h3l3aWdpZ1lnWVdZV0lHSTc5Nzk3KScpJxkXGQcJBwkG+Pb49vjm6Nbo1tjW2MbIxsi2uKa4pqimqJaolpiGmHaIhoh2eGZ4ZmhWaEZYVlhGWDZINkgmOBY4JigWKAYYBhf2B+YH9ffl99X31efF57XXxde1x6XHpbeVt5WnlaeFp3WXdZdlh2WHZXdVd0VnRWc1VzVXNVclRxVHFTcFNwUnBSb1FuUW5QbVBtT21PbE9rTmtOak1qTWpMaUxoS2hLaEpnSmdKZkllSWVIZUhkR2RHY0ZiRmJFYkVhRWFEYERfQ19DX0JeQl5BXUFcQFxAXD9bP1s/Wj5ZPlo9WT1YPFg8VztWO1c6VjpVOlU5VDlTOFQ4UzdSN1I2UTZQNVE1UDVPNE80TjNNM04yTTJMMUwxSzBKMEsvSi9JL0kuSC5ILUgtRyxGLEYrRStFKkUqRCpDKUMpQihCKEInQSdAJkAmPyU/JUAlPyQ+Iz8jPyI/IUAgQCBBH0MeQx5EHkYeRx5IHkofSx9MH04gTyBQIFIhUyFUIVYiVyJXIlkjWiNbI10jXiRfJGEkYiVjJWUlZiZnJmgmaSdqJ2wnbShuKHAocShyKXQpdSl2KngqeSp5K3srfCt9LH8sgCyBLYMthC2FLYcuiC6JLooviy+ML44wjzCQMJIxkzGUMZYylzKYMpkzmjObNJ00njWfNaE1oTagNqE3oDigOaE5oDqgO6A8oD2gPaA+oD+fQKBAoEGfQqBDoESgRKFFoEagR6FIoUihSaFKoUuhTKJMok2hTqJPolCiUaNRo1KiU6NUo1WjVaRWo1ejWKRZpFmkWqRbpFykXaVepV6lX6VgpWGlYqZipmOlZKZlpmamZqdnpmimaadqp2una6hsp22nbqhvqG+ocKhxqHKoc6lzqXSodal2qXepeKp4qnmpeqp7qnyqfKt9qn6qf6uAq4CrgauCq4OrhKyFrIWshqyHrIisia2JrYqsi62MrY2tja6OrY+tkK6RrpKukq+Tr5SvlbCWsJewl7GYsZmxmrKbspuznLSdtZ61nraft6C4oLmhuqK6oryjvaS9pL+lwKXBpsKmw6bEp8anx6jIqMqoy6nMqc6pzqnPqdGp0qnTqdWp1qnXqdmp2qnbqd2p3qnfqOGo4qjjp+Wn5qbnpumm6aXqpeyk7aTto++i8KLxofKg86Dzn/We9Z72nfec+Jv4m/ma+Zn6mPuX+5f7");
const GUNMAN_FLANK_STAGE1_AT2079_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT2079_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 48] as const);
const GUNMAN_FLANK_STAGE1_AT2223_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+EH3QfZB9UL0QvNC80PyQ/FD8ETvRO5E7kXtRexF60bqRulG6UfoR+dH5kjlSORI5EnjSeJJ4UrgSuBK30veS91L3EzbTNtM2k3ZTdhN107WTtZO1U/UT9NP0lDRUNFQ0VHQUc9SzlPOVM1VzVbMV8tYy1rKWspbyV3JXchex2DHYMZhxmPFZMVkxGbDZ8NnwmnCasFrwGzAbb9uv2++cL5xvXK8c7x0u3a7drp3unm5ebh6uHy3fLd9tn+1gLWAtIK0g7ODs4WyhrGHsYiwibCKr4uujK6NrY6tj6yQrJGrkqqTqpSplaiVp5enl6aYppqlmqSbpJyjnaKeop+hoKCgoKKfop6jnaSdpZymm6ebqJqomaqZqpirl62XrZaula+VsJSwk7KTspKzkbWQtZC1j7ePt4+2jraOtY60jbSNs42yjLKMsYyxjLGLsIuvi6+Kroqtiq2JrImriauIqoipiKmHqYeoh6iHp4amhqaGpYWkhaSFo4SihKKEoYOhg6GDoIKfgp+CnoKdgZ2BnIGbgJuAmoCZf5l/mX+Yfph+l36WfZZ9lX2UfZR8k3ySfJJ7kXuRe5F6kHqPeo95jnmNeY14jHiLeIt4ineJd4p3iXaIdoh2h3WGdYZ1hXSEdIR0g3OCc4JzgXOBcoFygHJ/cX9xfnF9cH1wfHB7b3tvem95bnpueW54bnhtd212bXZsdWx0bHRrc2tya3JqcWpxanFpcGlvaW9pbmhtaG1obGdrZ2tnamZpZmpmaWVoZWhlZ2RmZGZkZWRkY2RjY2NiYmJiYWJhYWFhYGFfYF9gXmBdX11fXF9bX1teWl5ZXlpdWV1YXVhcV1xWXFZbVVtUW1RaU1pSWlJaUVlRWVFZUFhPWE9YTldNV01XTFZLVktWSlVJVUpVSVVIVEhUR1RGU0ZTRVNEUkRSQ1JCUUJRQVFBUEFQQFA/UD9PPk89Tz1OPE47TjtNOk05TTpMOUw4TDhLN0s2SzZLNUo0SjRKM0kySTJJMUgxSDFIMEcvRy9HLkYtRi1GLEYrRStFKkUpRCpEKUQoQyhDJ0MmQiZCJUIkQSRBI0EiQSJAIUAhQCE/ID8fPx8+Hj4dPh09HD0bPRs8GjwZPBo8GTsYOxg7FzoWOhY6FTkUORQ5EzgSOBI4ETcRNxE3EDcPNg82DjYNNQ01DDULNAs0CjQJMwozCTMIMggyBzIGMgYxBTEEMQQwAzACMAIvAS8BLwEuAA==");
const GUNMAN_FLANK_STAGE1_AT2223_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT2223_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 64] as const);
const GUNMAN_FLANK_STAGE1_AT2511_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+GH3Yfdh9mL1YvRi82PyY/Jj8WTwZO9k7mXtZe1l7GbrZupm6WfoZ+hn52jmaOVo5GnkaeNp4mrhauBq32vfa95r3WzcbNts2m3abdlt2G7XbtZu1W/Vb9Rv03DScNFw0XHQcdBxz3POc850zXbNdsx3y3jLecp6yXvJfMh8x37HfsZ/xYHEgcSCw4PChMKEwYbAhsCHv4m+ib6KvYu8jLyMu466j7qPuZG4kbiSt5O2lLaUtZa0l7OXs5mymbGasZuwnK+dr56un62fraGsoauiq6OqpKmlqaaopqenpqimqaWppKukq6Osoq2hrqCuoK+fsJ6wnbKdspyym7SatJq0mbaYtpe3l7iWuJW5lLqUu5O7kryRvZC9kL+Pv4+/j7+Ovo69jr2NvI27jbuMu4y6jLqMuYu4i7iLt4q2iraKtYm0ibSJs4iyiLOIsoexh7GHsIevhq+Groatha2FrIWrhKuEq4Sqg6qDqYOogqiCp4KmgqaBpYGkgaSAo4CjgKN/on+hf6F+oH6ffp99nn2dfZ19nHybfJt8m3uae5p7mXqYeph6l3mWeZZ5lXiUeJR4k3iTd5N3kneRdpF2kHaPdY91jnWNdI10jHSLc4tzi3OKc4pyiXKIcohxh3GGcYZwhXCEcIRvg2+Db4Nugm6BboFugG1/bX9tfmx9bH1sfGt7a3tre2p6anpqeWl4aXhpd2l2aHZodWh1Z3VndWZ0ZXVldWR1Y3ZidmJ3YXhgeWB6YHxgfWB+YIBggWCCYIRghWCGYIhgiWCKYIxgjWCOYJBgkWCSYJRglWCWYJhgmWCaYJxfnV+eX6BfoF+gXqFdoVyhW6JaolqiWaNYo1ejVqRVpFWkVKVTpVKlUaZQplCmT6dOp02nTKhMqEuoSqlJqUipR6pHqkaqRatEq0OrQqxCrEGsQK0/rT6tPa49rjyuO686rzmvOLA4sDewNrE1sTSxNLIzsjKyMbMwsy+zL7QutC20LLUrtSq1KrYptii2J7cmtyW3JbgkuCO4IrkhuSC5ILofuh66Hbscuxu7G7wavBm8GL0XvRe9Fr4VvhS+E78SvxK/EcAQwA/ADsENwQ3BDMILwgrCCcMIwwjDB8QGxAXEBMUDxQPFAsYBxgDG");
const GUNMAN_FLANK_STAGE1_AT2511_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT2511_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 96] as const);
const GUNMAN_FLANK_STAGE1_AT2559_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BHEEcQVxBnIHcghyCXMJcwpzC3QMdA10DnUOdQ91EHYRdhJ2E3cTdxR3FXgWeBd4GHkYeRl5Gnobehx6HHsdex57H3wgfCF8IX0ifSN9JH4lfiZ+Jn8nfyh/KYAqgCuAK4ErgSyBLYMtgy6ELoYuhy+IL4ovizCMMI4wjzGQMZIxkjKTMpUyljOXM5kzmjSbNJ01nTWeNaA1oDagN6A4oDigOaA6oDugO6A8oD2fPqA+oD+fQKBBn0GfQqBDn0SfRaBFn0afR6BIoEmgSaFKoEugTKFNoU6hTqFPoVChUaJSolKhU6JUolWiVqNWo1eiWKNZo1qjW6Rbo1yjXaRepF+kX6RgpGGkYqVjpWOlZKVlpWalZ6ZopmilaaZqpmumbKdspm2mbqdvp3CncKhxp3Knc6h0qHWodah2qHeoeKl5qXmoeql7qXypfap9qn6pf6qAqoGqgquCqoOqhKuFq4arhquHq4iriayKrIqsi6yMrI2sjq2PrY+skK2RrZKtk66TrpSula+Wr5evmLGYsZmxmrKbs5uznLWdtZ61nrefuKC4oLqguqC6oLugu6C7oLygvaC9n7+ewJ7AncGcwpvCmsOaw5nDmMSXxZbFlcaVxpTGk8iSyJHIkcmQyY/Kj8uPyo/JjsmOyI7HjseOxo7FjsWNxI3DjcONwo3BjcGMwIy/jL+Mvoy9jL2MvIu7i7uLuou5i7mLuIq3ireKtoq1irWKtImzibOJs4myibKJsYmwiLCIr4iuiK6IrYish6yHq4eqh6qHqYeoh6iGp4amhqaGpYakhqSFo4WihaKFoYWghaCEn4SehJ6EnYSchJyEnIObg5uDmoOZg5mDmIKXgpeCloKVgpWClIKTgZOBkoGRgZGBkIGPgI+AjoCNgI2AjICLf4t/in+Jf4l/iH+Hf4d+hn6FfoV+hH6EfoR9g32CfYJ9gX2AfYB9f3x+fH58fXx8fHx8e3t6e3p7eXt4e3h7d3p2enZ6dXp0enR6c3pyeXJ5cXlweXB5b3lueG54bXhteG14bHhreGt3andpd2l3aHdnd2d2ZnZldmV2ZHZjdmN1YnVhdWF1YHVfdV91XnRddF10XHRbdFt0WnNZc1lzWHNXc1dzVnNVclZyVXJUclRyU3JScVJxUXFQcVBxT3FOcE5wTXBMcExwS3BKcEpvSW9Ib0hvR29Gb0ZuRW5EbkRuQ25CbkJuQW1AbUBtP20+bT9tPmw9bD1sPGw7bDtsOms5azlrOGs3azdrNms1ajVqNGozajNqMmoxaTFpMGkvaS9pLmktaS1oLGgraCtoKmgpaClnKGcnZydnJ2cmZyZmJWYkZiRmI2YiZiJmIWUgZSBlH2UeZR5lHWQcZBxkG2QaZBpkGWQYYxhjF2MWYxZjFWMUYhRiE2ISYhJiEWIQYRBhD2EPYQ9hDmENYQ1gDGALYAtgCmAJYAlfCF8HXwdfBl8FXwVfBF4DXgNeAl4BXgFeAA==");
const GUNMAN_FLANK_STAGE1_AT2559_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT2559_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 112] as const);
const GUNMAN_FLANK_STAGE1_AT2671_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+DH3MfYx9jL1MvQy8zPyM/Ez8TTwNO807jXtNew17DbrNuo26TfoN+c35zjmOOU45DnjOeM54jrhOuA63zveO9473TzcPNs82j3ZPdk92D7XPtY+1T/UP9Q/00DSQNFA0UHQQtBCz0TORM5FzUfNSMxJzErMS8tMy07KT8pQyVHJUshTyFTHVcdWxljGWcVZxFvEXMNcw17CX8JgwWHAYsBjv2S/Zb5mvWe9aLxpvGu7a7tsum65brlvuHG4crdyt3S2dbV1tXe0eLR4s3qye7J8sX2xfrB/sICvga6CroOthK2FrIesh6uIqoqqiqmLqY2ojqiOp5CmkaaRpZOllKSUo5ajl6KYopmhmqCaoJyfnJ6dnp+dn5ygnKGbopqjmqSZpZilmKeXp5aolqqVqpSrlKyTrZKtkq+Rr5Cwj7KPso+xj7GOsI6vja+Nr4yujK6LrYusiqyKrIqriauJqoipiKmHqYeohqiGp4WmhaeFpoSlhKWDpIOjgqSCo4GigaKAoYCgf6F/oH+ffp9+nn2dfZ58nXyce5x7m3qaept6mnmZeZl4mHiYd5h3l3aWdpZ1lXWVdZV0lHSTc5NzknKScpJxkXGQcJBwj2+Pb49vjm6Nbo1tjG2MbIxsi2uKa4pqiWqJaolpiGmHaIdoh2eGZ4ZmhWaEZYRlhGWDZINkgmOBY4FigWKAYYBhf2B+YH5ffl99X31efF57XXtde1x6XHpbeVt4WnlaeFp3WXdZdlh1WHZXdVd0VnRWc1VyVXNVclRxVHFTcFNvUnBSb1FuUW5QbVBsT21PbE9rTmtOak1pTWpMaUxoS2hLZ0pnSmdKZkllSWVIZEhkR2RHY0ZiRmJFYUVhRWFEYERfQ19DXkJeQl5BXUFcQFxAW0BbP1s/Wj5ZPlk9WT1YPFg8VzxXPFg8WDxYPFk8WTxZPFo8WjxaO1w7XTteO2A7YTtiO2Q8ZTxmPGg8aTxqPGw8bD1tPW89cD1xPXM9dD51Pnc+eD55Pns+fD99P38/gD+BP4M/hD+FQIdAiECJQItAjECNQY9BkEGRQZNBlEGVQZdCmEKZQppDm0OcQ55Dn0OgQ6FEoUWhRqJGoUehSKJJokqiS6NLokyiTaNOo0+jT6NQo1GjUqRTpFOjVKRVpFakV6VYpVikWaVapVulXKZcpV2lXqZfpmCmYKZhpmKmY6dkp2WnZadmp2enaKhpqGmnaqhrqGyobaltqG6ob6lwqXGpcqpyqXOpdKp1qnaqdqp3qniqeat6q3qqe6t8q32rfqx/rH+rgKyBrIKsg62DrISsha2GrYeth62IrYmtiq6LroyujK6Nro6uj6+Qr5Cuka+Sr5OvlLCVsJWxlrKXspiymbOZtJq0m7actpy2nbieuJ65n7ugu6C8ob6ivqK/o8GjwaTCpMSlxaXGpcimyabKpsunzKfNp8+n0KfRp9On1KfVp9en2KfZp9un3Kfdp9+n4KbhpuOm5KXlpeel6KTopOqj66Psou6i7qHvoPGg8Z/ynvSe9J31nPac95v3mviZ+Zn5mPqX+5b7");
const GUNMAN_FLANK_STAGE1_AT2671_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT2671_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 48] as const);
const GUNMAN_FLANK_STAGE1_AT703_OFFSETS_NES = decodeCoordinateRuns("AfghAfchAfYhAvUiAfQiAfMjAfIjAfEjAfEkAfAkAe8kAe4lAe0lAewlAewmAesmAeomAeknAegnAecnAecoAeYoAeUoAeQpAeMpAeIpAeIqAeEqAeAqAd8rAd4rAd0rAd0sAdwsAdssAdotAdktAdgtAdguAdcuAdYuAdUvAtQvAdMwAdIwAdEwAdExAdAyAc8yAc8zAc40Ac41Ac03Ac04Ac05Acw7Acw8Acw9Acw/Acs/ActAActCAcpDAcpEAcpGAclHAclIAclKAchLAchMAchOAsdPAcdRAcdSAcZTAcZVAcZWAcVXAcVZAcVaAcRbAcRcAcNdAcNeAcNgAcJhAcJiAsFkAcBlAcBnAb9oAb9pAr5rAb5sAb1uAb1vAbxwAbxyAbtyAbtzAbp1Abp2Abl3Abl5Abh5Abh6Abh8Abd9Abd+AbZ/AbaAAbWBAbWDAbSEAbSFAbOGAbOHAbOIAbKKAbKLAbGMAbGNAbCOAbCPAa+RAa+SAa6TAa6UAa6VAa2WAa2YAayZAauZAaubAqqcAameAamfAaigAaihAaigAaegAaagAaafAaWfAaSfAaOfAaOeAaKfAqGeAaCeAp+dAZ6dAZ2dAZ2cAZydAZucAZubAZqcApmbAZibAZebAZeaAZabAZWaAZWZAZSaAZOZApKZAZGZApCYAY+YAY6XAY6YAY2XAoyXAYuXAoqWAYmWAYiVAYiWAYeVAoaVAYWUAoSUAYOUAYKTAYGUAYGTAYCTAX+TAX+SAX6SAn2SAXyRAXuSAXuRAXqQAXmRAXmQAXiQAneQAXaPAXWQAXWPAXSOAXOPAXOOAXKOAXGOAXCOAXCNAW+NAW6NAW6MAW2NAmyMAWuMAWqMAWqLAWmLAWiLAWiKAWeLAmaKAWWKAmSJAWOJAWKJAWKIAWGJAWCIAl+IAV6HAl2HAVyHAVuGAVuHAVqGAVmFAVmGAViFAleFAVaFAVWEAVWFAVSEAVODAVOEAVKDAlGDAVCDAk+CAU6CAU2BAUyCAUyBAUuBAkqBAUmAAkiAAUd/AUaAAUZ/AUV/AUR/AUR+AUN+AkJ+AUF9AUB+AUB9AT99AT59AT58AT18ATx8ATt8ATt7ATp8ATl7ATl6ATh7Ajd6ATZ6ATV6ATV5ATR6ATN5ATN4ATJ5AjF4ATB4AS94AS93AS53AS13AS12ASx3ASt2Aip2ASl2ASh1Aih2ASd1ASZ2ASV3ASR3ASR5ASN5ASN6ASJ8ASJ9ASJ+ASKAASOBASOCASSDASSEASWFAiaHASeIASeKASiKASiLASmNASqNASqOASuQASuRASyRASyTAS2UAS6UAS6WAi+XATCZAjGaATKcATKdATOeATOfATSgATWgATaiATajATejAjilATmmATqnATqoATuoATyqATyrAT2rAj6tAT+uAUCvAUCwAUGxAUGyAUKxAkKwAUOvAUOuAUSvAUSuAkWtAUasAUarAUesAUerAUeqAUiqAUipAUmoAUmpAUqoAUqnAUunAUumAUylAUymAU2lAk2kAU6jAU6iAU+jAU+iAlChAlGgAVKgAVKfAVKeAVOeAVOdAVSdAVWdAVWcAlacAVebAlibAVmbAVqaAVqbAVuaAVyaAl2aAV6aAV+bAWCbAWGaAmKbAWObAWScAWWcAWacAWadAWeeAWieAWmfAmqfAWuhAWyhAW2iAm6jAW+kAXClAnGmAXKnAXOoAXSoAXSqAXWqAXaqAnesAXitAXmuAXquAXqvAXuwAXywAX2xAX6yAX6zAX+zAYC0AoG1AYK3AYO3AYS3AYS5AYW5AYa6Aoe7AYi8AYm9Aoq+AYu/AYzAAY3AAY7BAY7CAY/CAZDEApHEAZLGAZPGAZTHAZTIAZXIAZbJAZfKAZfLAZjLAZnMAprNAZvOAZzPAZ3PAp7RAZ/RAaDTAaHTAaHUAaLVAaPVAaTWAaTXAaXYAabYAafZAafaAajaAancAqrcAaveAazeAa3eAq7gAa/hAbDiAbHiAbHjAbLkArPlAbTnAbXnAbXoAbbqAbfqAbfrAbjtAbjuAbnuAbnwAbrxAbryAbv0Abv1Abv2Abz3Abz4Abz5Abz7").map(([x, y]) => [248 - x, y - 32] as const);
const GUNMAN_FLANK_STAGE1_AT847_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+CH3IfYh9SL1IvQi8yPyI/Ej8CTwJO8k7iXtJewl6ybrJuom6SfoJ+cn5ijmKOUo5CnjKeIp4SrhKuAq3yveK90r3SzcLNss2i3ZLdgt2C7XLtYu1S/UL9Mv0zDSMNEw0THQMs8yzzTONM41zTfNOM05zDvMPMw9yz/LQMtAy0LKQ8pEykbJR8lIyUrIS8hMyE7HT8dQx1HGUsZTxlXGVsVXxVnEWsRbxF3DXcNewmDCYcJiwWTBZMBlwGe/aL9pvmu+a71svW68b7xwvHK7crtzunW6drl3uXm4ebh6t3y3fbd+toC2gLWBtYO0hLSFs4ezh7KIsoqyi7GMsY2wjrCPr5Gvkq6TrpStla2WrJismauZq5uqnKqcqZ6pn6igqKGnoKegpqCloKWfpJ+jn6Oeop+hnqGeoJ6fnZ+dnp2dnZ2cnJ2bnJucmpyZm5ibmJuXm5aalpuVmpSZlJqTmZKZkpmRmZCYkJmPmI6XjpiNl4yXjJeLl4qWipaJloiVh5aHlYaVhZWFlYSUg5SDlIKTgZSBk4CTf5N/kn6SfZJ9knyRe5J7kXqReZF5kHiQd5B2kHaPdZB0j3SOc49yjnKOcY5wjnCNb45ujW6MbY1sjGyMa4xqjGqLaYtoi2iKZ4tmimWKZYpkimOJY4liiWGIYYlgiF+IX4heh12HXYdch1uGW4dahlmGWYZYhVeFV4VWhVWEVYVUhFODUoRSg1GDUINQg0+CToNOgk2BTIJMgUuBSoFKgUmASIBIgEd/RoBGf0V/RH9Ef0N+Qn5BfkF9QH4/fT99Pn09fD18PHw7fDt7Onw5ezl7OHs3ejd6Nno1ejV5NHozeTN4MnkxeDB4MHgveC53Lngtdyx2LHcrdip2KnYpdih1KHYodid1JnYldyR3JHkjeSN6InwifSJ+IoAjgSOCJIMkhCWFJYcmhyeIJ4ooiiiLKY0pjiqOK5ArkSyRLJMtlC2ULpYvly+YMJkxmjGaMpwynTOdM580oDWgNqI2ojejOKU4pTmmOqc6qDuoPKo8qj2rPq0+rT+uQK9AsEGwQbFCsUKwQrBDr0OuRK5ErkWtRa1GrEarR6tHq0eqSKpIqUmoSalKqEqnS6dLpkylTKZNpU2kTaROo06iT6NPolChUKFRoFGfUqBSn1OeU59UnlWdVZ5WnVedV51YnVmcWp1anVucXJ1dnV6dXp1fnWCdYZ5inmOeY59kn2WgZqFnoWehaKJpo2qja6RrpGykbaVupm+mcKdwp3GncqlzqXSpdKp1qnard6x4rHisea16rXuufK99r32vfrB/sYCxgbKBsoKyg7SEtIW0hbWGtYe1iLeJt4q3iriLuIy5jbqOuo66j7uQvJG8kr2SvZO9lL6Vv5a/l8CXwJjAmcKawpvCm8Ocw53EnsWfxZ/FoMahxqLHo8ikyKTIpcmmyqfKqMuoy6nLqs2rzazNrM6tzq7Or9Cw0LHQsdGy0rPStNS01LXVtta217fXuNm42rnauty63bvdu9+84LzhvOO9473kvua+577ov+q/67/sv+6/77/wv/K/87/0v/a/97/4v/q/+w==");
const GUNMAN_FLANK_STAGE1_AT847_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT847_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 32] as const);
const GUNMAN_FLANK_STAGE1_AT1071_OFFSETS_NES = decodeCoordinateRuns("AwQhAwQiAwQjAwQkAwQlAwQmAwQnAwQoAwQpAwQqAwQrAwQsAwQtAwQuAwQvAwQwAwQxAwQyAwQzAwQ0AwQ1AwQ2AwQ3AwQ4AwQ5AwQ6AwQ7AwQ8AwQ9AwQ+AwQ/AwRAAwRBAwRCAwRDAwREAwRFAwRGAwRHAwRIAwRJAwRKAwRLAwRMAwRNAwROAwRPAwRQAwRRAwRSAwRTAwRUAwRVAwRWAwRXAwRYAwRZAwRaAwRbAwRcAwRdAwReAwRfAwRgAwRhAwRiAwRjAwRkAwRlAwRmAwRnAwRoAwRpAwRqAwRrAwRsAwRtAwRuAwRvAwRwAwRxAwRyAgRzAQVyAQZwAQdvAQhuAQptAQtrAQxqAQ5pAQ9oARFoARJnARRmAhVmARZlARdlARhlAhllARplARtlARxmAR1mAh5mAR9nASBnASFoASJpASNqASVrASZsASdtAShvASlwAStyASxzASx1AS13AS54AS96ATB8ATB+ATGAATGDATKGATKIATOLATOOATORATOUATOXATOZATOaATObATSdATSeATWfATWgATahATehATejATijATmkATmmATqmATunATuoATypAT2pAT2rAT6sAT+sAkCuAUGvAUGwAUGvAkKuAkOtAUStAUSsA0WrAkaqAUepAUeoAkioAkmnAUqmAkqlAUulAUukAUykAUyjAk2iAU6iAU6hAU+hAU+gAU+fAlCfAlGeAVKdAlOdAlScAVWcAVacAVabAVebAVibAlmbAVqbAVubAVybAl2bAV6cAV+cAWCcAWGdAmKdAWOeAWSeAWWeAmafAWegAWihAWmhAWqhAWqiAWuiAWyjAW2kAW6kAW+kAW+lAXCmAXGmAXKnAnOnAXSpAXWpAXapAneqAXiqAXmsAXqsAXusAnytAX2uAX6vAX+vAYCvAYCwAYGxAYKxAYOyAoSyAYWzAYa0AYe0AYi1Aom1AYq3AYu3AYy3Ao24AY65AY+6AZC6AZG6AZG7AZK7AZO8AZS9AZW9AZa9AZa+AZe/AZi/AZnAAprAAZvCAZzCAZ3CAp7DAZ/DAaDFAaHFAaLFAqPGAaTHAaXIAabIAafIAafJAajKAanKAarLAqvLAazMAa3NAa7NAa/OArDOAbHQAbLQAbPRAbPSAbTSAbXTAbbUAbbVAbfWAbjXAbjYAbnZAbnaAbrbAbrcArveAbzfAbzhAb3iAb3jAb3lAb7mAb7nAb7oAb7pAb/qAb/sAb/tAb/uAb/wAb/xAb/yAb/0Ab/1Ab/2Ab/4Ab/5Ab76").map(([x, y]) => [x - 4, y - 32] as const);
const GUNMAN_FLANK_STAGE2_CODE7_Y0_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("OAE5AToBOwI8AjwCPQM+Az8DQARBBEEEQgVDBUQFRQZGBkYGRwdIB0kHSghLCEsITAlNCU4JTwpQClAKUQtSC1MLVAxVDFUMVg1XDVgNWQ5ZDloOWw9cD10PXhBeEF8QXxFgEWESYhNiFGMVYxdjGGMZYxtkHGQdZB9kIGQhZCNkI2UkZSZlJ2UoZSplK2YsZi5mL2YwZjJmM2Y0ZzZnN2c4ZzpnO2c8aD5oP2hAaEJoQ2hEaUZpR2lIaUppS2lMaU5qT2pQalJqUmpTalVrVmtXa1lrWmtba11rXmxfbGFsYmxjbWVtZm1nbmluam5rb21vbW9ucHBwcXBycHRxdXF2cXhyeXJ6cnxzfXN9c390gHSBdIN1hHWFdYd1iHaJdot2jHeNd493j3iQeJJ4k3mUeZZ5l3qYepp6m3qce557n3uffKF8oXyhfaJ+oX+hgKGAoYGhgqGDoYOhhKGFoYaghqGHoYigiaGJoIqgi6GMoIygjaCOoI+gkKCQoJGfkqCToJOflKCVoJaflqCXoJigmaCaoJqgm6GcoZ2gnqGfoZ+hoKKhoqKho6KjoqSipaOmoqeip6Ooo6mjqqOro6yjrKStpK6kr6SwpLCksaWypbOktKW0pbWltqa3pbiluaa5prqmu6e8pr2mvae+p7+nwKfBp8GnwqjDqMSnxajGqMaox6nIqcmoyqnKqcupzKrNqc6pzqrPqtCq0arSqtOq06vUq9Wr1qzXrNis2K3Zrtqu26/cr9yw3bHest+y37TgtOG14bbit+O347nkuuS75bzlvea+5sDnwefB58PoxOjF6MfpyOnJ6cvpzOnN6c/p0OnR6dPp1OnV6dfp2OnZ6dvp3Ojd6N/o4Ofg5+Ln4+bk5ubl5+Xo5Onk6uPr4+zi7eHu4e/g8N/w3/Le8t3z3PTc9Nv12vbZ9tj22PjX+Nb41fnU+dP50/rS+tH50PrP+s76zvvN+sz6y/vK+8r7");
const GUNMAN_FLANK_STAGE3_CODE7_Y0_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("UAFRAVIBUgJTAlQCVQNWA1cDVwRYBFkEWgVbBVwFXAZdBl4GXwdgB2EHYQhiCGMIZAllCWUJZgpnCmgKaQtqC2oLawxsDG0Mbg1vDW8NcA5xDnIOcw90D3QPdRB2EHcQdxF4EXgReRN6E3oUehZ7F3sYexp7G3scex57H3sgeyJ7I3skeyZ7J3soeyp7K3ssey57L3swezJ7M3s0ezZ7N3s4ezp7O3s8ez57P3tAe0J7Q3tEe0Z7R3tIe0p7S3tMe057T3tQe1J7U3tUe1Z7V3tYe1p7W3tce157X3tge2J7Y3tke2Z7Z3toe2p7a3tse257b3twe3J7c3t0e3Z7d3t4fHp8e3x8fH58f3yAfIJ9g32EfYZ9h32IfYp+i36Mfo5+j36QfpJ/k3+Uf5V/ln+Xf5l/moCbgJ2AnoCfgKGAoYGhgqGDoYOhhKKFooaih6OIo4iiiaOKo4ujjKSMo42jjqSPpJCkkKSRpJKkk6WUpZWllaWWpZelmKaZppmlmqabppymnaedpp6mn6egp6Gnoqiip6OnpKilqKaopqinqKioqamqqaqoq6msqa2prqqvqq+psKqxqrKqs6uzqrSqtau2q7ert6u4q7mruqy7rLysvKy9rL6sv63ArcCswa3CrcOtxK7FrsWvxrDHsMiwybHJssqyy7TMtMy0zbbOts63z7nQudC60bzSvNK907/Tv9TA1MLVw9XE1cbWx9bI1snXytfL183XztfP19HX0tfT19XX1tfX19nX2tfb193X3tbf1uHW4tXj1eXV5tTm1OjT6dPq0uzS7NHt0O/Q78/wzvLO8s3zzPTM9cv1yvbZ9tj22PjX+Nb41fnU+dP50/rS+tH50PrP+s76zvvN+sz6y/vK+8r7");
const GUNMAN_FLANK_STAGE3_CODE7_Y0_TAIL_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("gqKDooOhhKKFooaih6OIo4iiiaOKo4ujjKSMo42jjqSPpJCkkKSRpJKkk6WUpZWllaWWpZelmKaZppmlmqabppymnaedpp6mn6egp6Gnoqiip6OnpKilqKaopqinqKioqamqqaqoq6msqa2prqqvqq+psKqxqrKqs6uzqrSqtau2q7ert6u4q7mruqy7rLysvKy9rL6sv63ArcCswa3CrcOtxK7FrsWvxrDHsMiwybHJssqyy7TMtMy0zbbOts63z7nQudC60bzSvNK907/Tv9TA1MLVw9XE1cbWx9bI1snXytfL183XztfP19HX0tfT19XX1tfX19nX2tfb193X3tbf1uHW4tXj1eXV5tTm1OjT6dPq0uzS7NHt0O/Q78/wzvLO8s3zzPTM9cv1yvbJ98n3yPjH+cb5xfrF+sT6w/vC+8H7");
const GUNMAN_FLANK_STAGE3_CODE7_Y0_OFFSETS_NES = [...GUNMAN_FLANK_STAGE3_CODE7_Y0_TRACE_ABSOLUTE_NES.slice(0, 162), ...GUNMAN_FLANK_STAGE3_CODE7_Y0_TAIL_ABSOLUTE_NES].map(([x, y]) => [x - 80, y] as const);
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

const GUNMAN_FLANK_STAGE1_AT1263_OFFSETS_NES = decodeCoordinateRuns("AwRBAwRCAwRDAwREAwRFAwRGAwRHAwRIAwRJAwRKAwRLAwRMAwRNAwROAwRPAwRQAwRRAwRSAwRTAwRUAwRVAwRWAwRXAwRYAwRZAwRaAwRbAwRcAwRdAwReAwRfAwRgAwRhAwRiAwRjAwRkAwRlAwRmAwRnAwRoAwRpAwRqAwRrAwRsAwRtAwRuAwRvAwRwAwRxAwRyAgRzAQVyAQdwAQhvAQluAQpsAQxrAQ1qAQ5pARBoARFnARNnARRmARVmARZmARdlARhlAhllARplARtlARxlAh1mAR5mAR9mASBnAiFnASNpASRqASVrASdsAShtASlvASpwAStyASxzAS11AS53AS94ATB6ATB8ATF+ATKAATKDATKFATOIATOLATOOATORATOUATOXATOZATSaATSbATSdAjWeATagAjehATijATmjATmkATqmATumATunATyoAT2pAT2qAT6rAj+sAUCuAkGuAUGvAUKuAUKtAUOtAUOsAUOrAUSsAUSrAkWqAUapAUaoAUepAUeoAkinA0mmAUqlAUqkAUukAUujAkyjAU2iAU2hAU6hAk6gAU+gAU+fAlCeAlGdAVKdAVKcAVOcAVScAVSbAVWbAlabAVeaAVibAlmaAVqbAVuaAVyaAVybAV2bAV6aAV+bAWCbAWGbAWGcAWKcAWOcAWSdAmWeAWafAWefAWigAmmhAWqiAWujAmykAW2lAW6mAW+mAW+nAXCoAXGoAXKqAnOqAXSsAXWsAXatAXauAXeuAXivAXmwAXmxAXqxAXuyAnyzAX20AX61AX+1AX+3AYC3AYG3AYK5AYO5AYO6AYS7AYW7AYa8AYa9AYe+AYi+AYm/AYnAAYrAAYvCAozCAY3EAY7EAY/EAY/GAZDGAZHHAZLIAZPIAZPJAZTKAZXLAZbLAZbMAZfNAZjNApnPAZrPAZvRAZzRAZzSAZ3TAZ7TAZ/UAZ/VAaDVAaHWAaLXAqPYAaTZAaXaAabaAabcAafcAajcAqneAarfAavgAazgAazhAa3iAa7iAa/jAa/kAbDlAbHlAbLmArPnAbTpAbXpAbXqAbbrAbfsAbftAbjuAbjvAbnwArryAbrzAbv1Abv2Abz3Abz5Abz6Ab36").map(([x, y]) => [x - 4, y - 64] as const);

const GUNMAN_FLANK_STAGE1_AT1775_OFFSETS_NES = decodeCoordinateRuns("A/ghA/giA/gjA/gkA/glA/gmA/gnA/goA/gpA/gqA/grA/gsA/gtA/guA/gvA/gwA/gxA/gyA/gzA/g0A/g1A/g2A/g3A/g4A/g5A/g6A/g7A/g8A/g9A/g+A/g/A/hAA/hBA/hCA/hDA/hEA/hFA/hGA/hHA/hIA/hJA/hKA/hLA/hMA/hNA/hOA/hPA/hQA/hRA/hSA/hTA/hUA/hVA/hWA/hXA/hYA/hZA/haA/hbA/hcA/hdA/heA/hfA/hgA/hhA/hiA/hjA/hkA/hlA/hmA/hnA/hoA/hpA/hqA/hrA/hsA/htA/huA/hvA/hwA/hxA/hyAvhzAfdxAfZwAfVuAfNtAfJsAfFrAe9qAe5oAexoAetnAelmAehlAedlAeZlAuVlAeRlAeNlAeJlAeFlAuBlAd9lAd5lAt1mAdxmAdtnAdpoAdhpAddqAdZrAdRtAdNuAdJwAdFxAdBzAc90Ac52Ac14Ac15Acx7Act9Act/AcqCAcqFAcmIAcmLAcmOAcmRAcmUAcmXAcmZAcmaAcibAcicAcedAceeAcafAcWfAcSgAcShAcOiAcKiAcGjAcGkAcCkAb+mAr6mAb2oAbyoAbupAbuqAbqqAbmrAbisAbitAbetAbauAbWvAbSvAbSwAbOxAbKxArGzAbCzAa+1Aa61Aa62Aa23Aay3Aau4Aau5Aaq5Aam6Aai7Aqe7Aaa9AaW9AaS9AqO+AaK/AaHAAaDAAZ/AAZ7BAZ7CAZ3CAZzDAZvDAZrDAZrEAZnFAZjFAZfGApbGAZXIAZTIAZPIAZLJAZHJAZHKAZDLA4/LAY/KAY/JAY7JAY7IAo7HAY7GAY7FAY3FAY3EAo3DAY3CAo3BAYzAAoy/A4y+AYu9Aou8AYu7Aou6AYq5Aoq4AYq3Aoq2AYq1Aom0AYmzAomyAYmxAoiwAYivAoiuAYitAYisAYesAYerAoeqAYepAYeoAYaoAYanAYamAYanAYamAYalAYWlAYWkAoWjAYWiAoWhAYSgAoSfAYSeAoSdAYOcAoObAYOaAoOZAYOYAoKXAYKWAoKVAYKUAoGTAYGSAoGRAYGQAYCPAYCQAYCPAoCOAYCNAYCMAX+MAX+LAn+KAX+JAX+IAX6IAX6HAn6GAX6FAn6EAX2DAn2CAX2BAn2AAXx/Anx+AXx9Anx8AXt7Ant6AXt5A3t4Anp3AXp2Anp1AXp0AnlzAXlyAnlxAXlwAXlvAXhvAXhuAnhtAXhsAXhrAXdrAXdqAndpAXdoAXdnAXZnAXZmAnZlAXZkAnZjAXViAnVhA3VgAXRfAnReAXRdAnRcAXRbAnNaAXNZAnNYAXNXAnJWAXJVAnJUAXJTAnFSAXFRAnFQAXFPAXFOAXBOAXBNAnBMAXBLAXBKAW9KA29JAW9IAm9HAW5GAm5FAW5EAm5DAW1CAm1BAW1AAm0/AWw+Amw9AWw8Amw7AWw6Ams5AWs4Ams3AWs2Amo1AWo0AmozAWoyAWoxAWkyAWkxAmkwAWkvAWkuAWguAWgtAmgsAWgrAWgqAWcqAWcpAmcoAWcnAmcmAWYlAmYkAWYjAmYiAWUhAmUgAWUfAmUeAWUdAmQcAWQbAWQaAWQbAWQaAmMZAWMYAmMXAWMWAmIVAWIUAmITAWISAWIRAWERAWEQAmEPAWEOAWENAWANAWAMAmALAWAKAmAJAV8IAl8HAV8GAl8FAV4EA14DAl4CAV0BAV0A").map(([x, y]) => [x - 248, y - 32] as const);

const GUNMAN_FLANK_STAGE2_CODE8_AT623_TRACE_NES = decodeCoordinateRuns("AQQhAQUhAQYhAQciAggiAQkjAQojAQsjAQwkAg0kAQ4lAQ8lARAlAREmAhImARMnARQnARUnARYoAhcoARgpARkpARopARsqAhwqAR0rAR4rAR8rAiAsASEsASItASMtASQtAiUuASYuAScvASgvASkvAiowASswASwxAS0xAS4xAi8yATAyATEzATIzATMzAjQ0ATU0ATY1ATc1ATg1Ajk2ATo2ATs3ATw3AT03AT04AT44AT84AUA5AUE5AUI5AUI6AUM6AUQ6AUU7AUY7AUc7AUc8AUg8AUk8AUo9AUs9AUw9AUw+AU0+AU4+AU8/AVA/AVE/AVFAAVJAAVNAA1RBA1RCA1RDA1REA1RFA1RGA1RHA1RIA1RJA1RKA1RLA1RMA1RNA1ROA1RPA1RQA1RRA1RSA1RTA1RUA1RVA1RWA1RXA1RYA1RZA1RaA1RbA1RcA1RdA1ReA1RfA1RgA1RhA1RiA1RjA1RkA1RlA1RmA1RnA1RoA1RpA1RqA1RrA1RsA1RtA1RuA1RvA1RwA1RxA1RyA1RzAlR0AVVyAVZxAVdwAVhuAVptAVtsAV1rAV5qAV9pAWFoAWJnAWRmAWVmAmZmAWdmAWhmAWlmAWpmAmtmAWxmAW1mAW5mAm9nAXBoAXFoAXJpAXRqAXVrAXZtAXduAXlvAXpxAXtyAXx0AX11AX53AX95AX97AYB8AYB+AYGAAYKDAYKGAYKJAYOMAYOPAYOSAYOVAYOYAYOaAYObAYOcAYOeAYOfAYOgAoOiAYKiAYGjAoCjAX+kAX6kAX2kBHylAXykAnyjAXyiAnyhAXygAnyfAXyeAnydAXycAnybAXyaAnyZAXyYAnyXAXyWAnyVAXyUAnyTAXySAnyRAXyQAnyPAXyOAnyNAXyMAnyLAXyKAnyJAXyIAnyHAXyGAnyFAXyEAnyDAXyCAnyBAXyAAnx/AXx+Anx9AXx8Anx7AXx6Anx5AXx4Anx3AXx2Anx1AXx0AnxzAXxyAnxxAXxwAnxvAXxuAnxtAXxsAnxrAXxqAnxpAXxoAnxnAXxmAnxlAXxkAnxjAXxiAnxhAXxgAnxfAXxeAnxdAXxcAnxbAXxaAnxZAXxYAnxXAXxWAnxVAXxUAnxTAXxSAnxRAXxQAnxPAXxOAnxNAXxMAnxLAXxKAnxJAXxIAnxHAXxGAnxFAXxEAnxDAXxCAnxBAXxAAnw/AXw+Anw9AXw8Anw7AXw6Anw5AXw4Anw3AXw2Anw1AXw0AnwzAXwyAnwxAXwwAnwvAXwuAnwtAXwsAnwrAXwqAnwpAXwoAnwnAXwmAnwlAXwkAnwjAXwiAnwhAXwgAnwfAXweAnwdAXwcAnwbAXwaAnwZAXwYAnwXAXwWAnwVAXwUAnwTAXwSAnwRAXwQAnwPAXwOAnwNAXwMAnwLAXwKAnwJAXwIAnwHAXwGAnwFAXwEAnwDAXwCAnwBAXwA").map(([x, y]) => [x - 4, y - 32] as const);
const GUNMAN_FLANK_STAGE2_CODE7_AT351_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BCEFIQYhByIHIggiCSMKIwsjDCQMJA0kDiUPJRAlESYRJhImEycUJxUnFigWKBcoGCkZKRopGyobKhwqHSseKx8rHywgLCEsIi0jLSQtJC4lLiYuJy8oLykvKTAqMCswKzEsMS0xLTMuNC40LzYvNy84MDowOzA8MT4xPzFAMkIyQzJEMkYzRjNHM0k0SjRLNE01TjVPNVE2UjZTN1Q3VThWOFg4WTlaOVw6XDpdOl87YDthPGI8Yz1kPWY+Zz5oP2k/aj9rQG1AbkFvQXBCcUJyQ3RDdUR2RHdFeEV5RXtGfEZ9R35Hf0iASIJJg0mDSoVKhkqHS4lLikyKTIxNjU2OTpBOkU+RT5NQlFCVUZZRl1KYUppTm1ObVJ1UnlWeVqBWoVahV6FXoFigWKBZn1qfW59bn1yeXZ9dnl6eX59gnmCeYZ9in2OeZJ9ln2WfZqBnoGigaaFqomqia6Nso22jbqVupW+lcKZxpnKncqhzqHSodal2qXeqd6t4q3mreqx7rXutfK59rn6uf7B/sICwgbGCsYOxhLOEs4WzhrSHtIi1iLaJtoq2i7eMuIy4jbmOuY+5kLqRu5G7kryTvJS8lb6Vvpa+l7+Yv5nAmcGawZvBnMKdwp7DnsSfxKDEocWixqLGo8ekx6XHpsmmyafJqMqpyqrKq8yrzKzMrc2uza/Or8+wz7HPstCz0bPRtNK10rbSt9O41LjUudW61bvVvNe8173Xvti/2MDZwNrB2sLaw9zE3MTcxd7G3sbfx+HI4cjiyePK5Mrly+bL58zozOrN683rzu3O7s7vz/HP8s/zz/XQ9tD30PnQ+tD7");
const GUNMAN_FLANK_STAGE2_CODE7_AT351_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE7_AT351_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 32] as const);
const GUNMAN_FLANK_STAGE2_CODE7_AT399_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BCEFIQYhByIHIggiCSMKIwsjCyQMJA0kDiUPJRAlECYRJhImEycUJxUnFSgWKBcoGCkZKRopGiobKhwqHSseKx8rHywgLCEsIi0jLSMtJC4lLiYuJy8oLygvKTAqMCswKzEsMi0yLTQuNC41LzcvOC85LzswPDA9MD8xQDFAMUIyQzJEMkYzRzNIM0o0SzRMNE40TzVQNVE2UjZTNlU3VjdXOFg4WTlaOVw6XTpeOmA7YDthPGM8ZD1lPWY+Zz5oP2o/az9sQG1AbkFvQXFCckJzQ3RDdUR2RHhFeUV6RXtGfEZ9R39HgEiBSIJJg0mESoZKh0qIS4lLikyLTI1Njk2OTpBOkU+ST5RQlFCVUZdRmFKZUppTm1OcVJ1VnlWfVqBWoVahV6FXoVigWaBZoFqfW6Bbn1yfXZ9en16eX59gn2GeYZ9in2OfZKBloGagZqFnoWihaaJqomqia6Nso22jbqRvpG+kcKVxpXKlc6Z0pnSmdad2p3eneKh5qHmoeql7qXypfap+qn6qf6uAq4GrgqyDrIOshK2FrYath66Hroiuia+Kr4uvjLCMsI2wjrGPsZCxkbKRspKyk7OUs5WzlrSWtJe0mLWZtZq1m7abtpy2nbeet5+3n7iguKG4ormjuaS5pLqluqa6p7uou6m7qbyqvKu8rL2tva69rr6vvrC+sb+yv7O/s8C0wLXAtsG3wbjBuMK5wrrCu8O8w7zDvcS+xL/EwMXBxcHFwsbDxsPGw8fDx8THxMnEysXLxc3EzsTPxNHD0sLSwtPB1MDUv9W/1b/Uv9S/07/Sv9K/0b/Qv9C/z7/Ov86/zb/Mv8y/y7/Kv8q/yb/Iv8i/x7/Gv8a/xb/Ev8S/w7/Cv8K/wb/Av8C/v7++v76/vb+8v7y/u7+6v7q/ub+4v7i/t7+2v7a/tb+0v7S/s7+yv7K/sb+wv7C/r7+uv66/rb+sv6y/q7+qv6q/qb+ov6i/p7+mv6a/pb+kv6S/o7+iv6K/ob+gv6C/n7+ev56/nb+cv5y/m7+av5q/mb+Yv5i/l7+Wv5a/lb+Uv5S/k7+Sv5K/kb+Qv5C/j7+Ov46/jb+Mv4y/i7+Kv4q/ib+Iv4i/h7+Gv4a/hb+Ev4S/g7+Cv4K/gb+Av4C/f79+v36/fb98v3y/e796v3q/eb94v3i/d792v3a/db90v3S/c79yv3K/cb9wv3C/b79uv26/bb9sv2y/a79qv2q/ab9ov2i/Z79mv2a/Zb9kv2S/Y79iv2K/Yb9gv2C/X79ev16/Xb9cv1y/W79av1q/Wb9Yv1i/V79Wv1a/Vb9Uv1S/U79Sv1K/Ub9Qv1C/T79Ov06/Tb9Mv0y/S79Kv0q/Sb9Iv0i/R79Gv0a/Rb9Ev0S/Q79Cv0K/Qb9Av0C/P78+vz6/Pb88vzy/O786vzq/Ob84vzi/N782vza/Nb80vzS/M78yvzK/Mb8wvzC/L78uvy6/Lb8svyy/K78qvyq/Kb8ovyi/J78mvya/Jb8kvyS/I78ivyK/Ib8gvyC/H78evx6/Hb8cvxy/G78avxq/Gb8Yvxi/F78Wvxa/Fb8UvxS/E78SvxK/Eb8QvxC/D78Ovw6/Db8Mvwy/C78Kvwq/Cb8Ivwi/B78Gvwa/Bb8EvwS/A78CvwK/Ab8A");
const GUNMAN_FLANK_STAGE2_CODE7_AT399_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE7_AT399_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 32] as const);
const GUNMAN_FLANK_STAGE2_CODE8_AT655_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BSEFIQYhByIIIgkiCiMKIwsjDCQNJA4kDyUPJRAlESYSJhMmEycUJxUnFigXKBgoGCkZKRopGyocKh0qHSseKx8rICwhLCIsIi0jLSQtJS4mLicuJy8oLykvKjArMCwwLDEtMS4xLzIwMjAyMTMyMzMzNDQ1NDU0NjU3NTg1OTY6Njo2Ozc8Nz03Pjg/OD84QDlBOUI5QzpEOkQ6RTtGO0c7SDxIPEk8Sj1LPUw9TT5NPk4+Tz9QP1E/UkBSQFNAVEFUQVRBVEJUQlRCVENUQ1RDVERURFREVEVURVRFVEZURlRGVEdUR1RHVEhUSFRIVElUSVRJVEpUSlRKVEtUS1RLVExUTFRMVE1UTVRNVE5UTlROVE9UT1RPVFBUUFRQVFFUUVRRVFJUUlRSVFNUU1RTVFRUVFRUVFVUVVRVVFZUVlRWVFdUV1RXVFhUWFRYVFlUWVRZVFpUWlRaVFtUW1RbVFxUXFRcVF1UXVRdVF5UXlReVF9UX1RfVGBUYFRgVGFUYVRhVGJUYlRiVGNUY1RjVGRUZFRkVGVUZVRlVGZUZlRmVGdUZ1RnVGhUaFRoVGlUaVRpVGpUalRqVGtUa1RrVGxUbFRsVG1UbVRtVG5UblRuVG9Ub1RvVHBUcFRwVHFUcVRxVHJUclRyVHNUc1RzVHRUdFVzVnFYcFluWm1bbF1rXmpgaWFoY2hkZ2VnZmZnZmdmaGZpZmpma2ZsZmxmbWduZ29ncGhwaHFocml0a3Vsd214bnlwenF7cnx0fXZ+d395f3uAfYF/gYCCg4KGg4mDjIOPg5KDlYOYg5qDm4Ocg56Dn4Ogg6KDooKigqOBo4Cjf6R+pH2kfaV8pXylfKZ8pXykfKR8o3yifKJ8oXygfKB8n3yefJ58nXycfJx8m3yafJp8mXyYfJh8l3yWfJZ8lXyUfJR8k3ySfJJ8kXyQfJB8j3yOfI58jXyMfIx8i3yKfIp8iXyIfIh8h3yGfIZ8hXyEfIR8g3yCfIJ8gXyAfIB8f3x+fH58fXx8fHx8e3x6fHp8eXx4fHh8d3x2fHZ8dXx0fHR8c3xyfHJ8cXxwfHB8b3xufG58bXxsfGx8a3xqfGp8aXxofGh8Z3xmfGZ8ZXxkfGR8Y3xifGJ8YXxgfGB8X3xefF58XXxcfFx8W3xafFp8WXxYfFh8V3xWfFZ8VXxUfFR8U3xSfFJ8UXxQfFB8T3xOfE58TXxMfEx8S3xKfEp8SXxIfEh8R3xGfEZ8RXxEfER8Q3xCfEJ8QXxAfEB8P3w+fD58PXw8fDx8O3w6fDp8OXw4fDh8N3w2fDZ8NXw0fDR8M3wyfDJ8MXwwfDB8L3wufC58LXwsfCx8K3wqfCp8KXwofCh8J3wmfCZ8JXwkfCR8I3wifCJ8IXwgfCB8H3wefB58HXwcfBx8G3wafBp8GXwYfBh8F3wWfBZ8FXwUfBR8E3wSfBJ8EXwQfBB8D3wOfA58DXwMfAx8C3wKfAp8CXwIfAh8B3wGfAZ8BXwEfAR8A3wCfAJ8AXwA");
const GUNMAN_FLANK_STAGE2_CODE8_AT655_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE8_AT655_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 32] as const);
const GUNMAN_FLANK_STAGE2_CODE7_AT1135_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BDEFMQYxBjIHMggyCTMKMwszCzQMNA00DjUPNRA1EDYRNhI2EzcUNxU3FTgWOBc4GDkZORo5GjobOhw6HTseOx47HzwgPCE8Ij0jPSM9JD4lPiY+Jz8oPyg/KUAqQCtAK0EsQSxBLUMuRC5EL0YvRy9IL0owSzBMME4xTzFQMVIyUzJUMlUzVjNXM1k0WjRbNF00XjVfNWE1YjZjNmU2ZjdmN2g3aThqOGw4bTluOXA5cTpyOnM7dDt1PHc8eDx5PXo9ez58Pn4/fz+AQIFAgkCDQYVBhkKHQohDiUOKRIxEjUWORY9FkEaRRpNHlEeVSJZIl0mYSZpKm0qbS51LnkufTKFMoU2gTaFOoE+gT6BQn1GfUZ9Sn1OeVJ9Un1WeVp9Xn1eeWJ9Zn1qfW6BcoFygXaFeoV+hYKJgomGiYqNjo2SjZaRlpGakZ6VopWmlaqZqpmumbKdtp26nb6hvqHCocalyqXOpdKp0qnWqdqt3q3ireax5rHqse618rX2tfa5+rn+ugK+Br4KvgrCDsISwhbGGsYexh7KIsomyirOLs4yzjLSNtI60j7WQtZG1kbaStpO2lLeVt5W3lriXuJi4mbmauZq5m7qcup26nrufu5+7oLyhvKK8o72kvaS9pb6mvqe+qL+pv6m/qsCrwKzArcGuwa7Br8KwwrHCssOyw7PDtMW1xbbFtse3x7jHucm5ybrKu8u7zLzNvc69z77QvtG/0r/TwNXA1sHWwdjC2cLawtzD3cPew+DD4cPiw+TE5cTmxOjE6cTqxOzD7cPuw/DD8cPyw/PC9ML1wvfB+MH5wPs=");
const GUNMAN_FLANK_STAGE2_CODE7_AT1135_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE7_AT1135_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 48] as const);
const GUNMAN_FLANK_STAGE2_CODE7_AT1167_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BEEFQQZBBkIHQghCCUMKQwtDC0QMRA1EDkUPRRBFEEYRRhJGE0cURxVHFUgWSBdIGEkZSRpJGkobShxKHUseSx5LH0wgTCFMIk0jTSNNJE4lTiZOJ08oTyhPKVAqUCtQK1EsUSxSLVMuVC5VL1cvVy9YL1owWzBcMF4xXzFgMWIyYzJkM2UzZjNnM2k0ajRrNW01bjZuNnA3cTdyOHQ4dTl1OXc5eDp5Ons7ezt8PH48fz2APYI+gj6DPoU/hj+HQIlAiUGKQYxCjUKOQ5BDkEORRJNElEWVRZdGl0aYR5pHm0icSJ1JnkmfSqFKoUqgS6FMoEygTaBOn06fT59Qn1CeUZ9Sn1OeU59Un1WeVp9Xn1ifWKBZoFqgW6FcoV2hXaJeol+iYKNho2GjYqRjpGSkZaVmpWalZ6Zopmmmaqdrp2unbKhtqG6ob6lwqXCpcapyqnOqdKt1q3Wrdqx3rHisea15rXqte658rn2ufq9+r3+vgLCBsIKwg7GDsYSxhbKGsoeyiLOIs4mzirSLtIy0jbWNtY61j7aQtpG2kreSt5O3lLiVuJa4lrmXuZi5mbqaupu6m7ucu527nryfvKC8oL2hvaK9o76kvqW+pb+mv6e/qMCpwKrAqsGrwazBrcKuwq7Cr8Oww7HDssSzxLPEtMW1xbbGt8e3x7jIucm6ybrKu8u8zL3Mvc6+z77Pv9HA0sDSwdTB1cLWwtjD2MPZw9vE3MTdxN/F4MXhxePF5MXlxefF6MXpxevF7MXtxe/F8MXxxfPF9MT1xPbE98P4w/rD+w==");
const GUNMAN_FLANK_STAGE2_CODE7_AT1167_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE7_AT1167_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 64] as const);
const GUNMAN_FLANK_STAGE2_CODE7_AT1231_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+DH3MfYx9TL0MvMy8zPyM/Ez8DTvNO407jXtNew16zbqNuk26TfoN+c35jjlOOU45DnjOeI54TrgOuA63zveO9073DzbPNs82j3ZPdg91z7WPtY+1T/UP9M/0kDRQNFA0UHQQc9BzkPORM1FzUbNR8xIzErMS8tMy07LT8tQylLKU8lTyVXIVshXyFnHWsdbxlzGXcVexWDEYcRhxGPDZMNlwmfCaMFowWrAa8Bsv26/b75vvnG+cr1zvXW8drx2u3i7ebp6uny5fbl9uX+4gLiBt4O3hLaEtoa1h7WItIq0irSLs42zjrKPspGxkbGSsJSvla+Vr5eumK6ZrZqsm6ycq56rnqqfqaGpoamgqKCooKefp5+mnqWepZ6knaSdo52jnKKcoZyhm6CaoJufmp+ZnpqdmZ2YnJicmJuXmpeal5mWmZaYlpiVl5WWlJaUlZSVk5STlJOTkpKSkpKRkZGQkJGPkI+PjpCOj42OjY+MjoyOjI+Mj4yPjJCMkIyQjJGMkYySi5SLlYuWi5eLmIqZipuKnIqdip+KoIqgiqGKoYqgiqCKn4qeip6LnYuci52LnIubi5uMmoyZjJmMmIyXjJeMlo2VjZWNlI2TjZONko6RjpGOkI6Pjo+Ojo+Nj42PjI+Lj4uPio+Jj4qPio+Kj4uPi4+Lj4yPjI+Mj42PjY+Nj46Pjo+Oj5CPkY+Sj5SPlY+Wj5iPmY+aj5yPnY+ej6CPoI6gjaGMoYyhjKKMoYygjKCMn4yejJ6MnYycjJyMm4yajJqMmYyYjJiMl4yWjJaMlYyUjJSMk4ySjJKMkYyQjJCMj4yOjI6MjYyMjIyMi4yKjIqMiYyIjIiMh4yGjIaMhYyEjISMg4yCjIKMgYyAjICMf4x+jH6MfYx8jHyMe4x6jHqMeYx4jHiMd4x2jHaMdYx0jHSMc4xyjHKMcYxwjHCMb4xujG6MbYxsjGyMa4xqjGqMaYxojGiMZ4xmjGaMZYxkjGSMY4xijGKMYYxgjGCMX4xejF6MXYxcjFyMW4xajFqMWYxYjFiMV4xWjFaMVYxUjFSMU4xSjFKMUYxQjFCMT4xOjE6MTYxMjEyMS4xKjEqMSYxIjEiMR4xGjEaMRYxEjESMQ4xCjEKMQYxAjECMP4w+jD6MPYw8jDyMO4w6jDqMOYw4jDiMN4w2jDaMNYw0jDSMM4wyjDKMMYwwjDCML4wujC6MLYwsjCyMK4wqjCqMKYwojCiMJ4wmjCaMJYwkjCSMI4wijCKMIYwgjCCMH4wejB6MHYwcjByMG4wajBqMGYwYjBiMF4wWjBaMFYwUjBSME4wSjBKMEYwQjBCMD4wOjA6MDYwMjAyMC4wKjAqMCYwIjAiMB4wGjAaMBYwEjASMA4wCjAKMAYwA");
const GUNMAN_FLANK_STAGE2_CODE7_AT1231_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE7_AT1231_TRACE_ABSOLUTE_NES.map(([x, y]) => [248 - x, y - 48] as const);
const GUNMAN_FLANK_STAGE2_CODE7_AT1407_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BCEFIQYhByIIIggiCSMKIwsjDCQMJA0kDiUPJRAlESYRJhImEycUJxUnFigWKBcoGCkZKRopGyobKhwqHSseKx8rICwgLCEsIi0jLSQtJC4lLiYuJy8oLykvKTAqMCswKzEsMS0yLTMuNC41LzcvOC85MDswOzA8MT4xPzFAMkIyQzJEMkYzRzNIM0o0SzRLNE01TjVPNVE2UjZTN1U3VjhWOFg4WTlaOVw6XTpdO187YDxhPGM8ZD1kPWY+Zz5oP2o/a0BrQG1BbkFvQXFCcUJyQ3RDdUR2RHhFeEV5RntGfEZ9R39Hf0iASIJJg0mESoZKhkuHS4lMikyLTI1NjU2OTpBOkU+RUJNQlFCVUZdRl1KYUppTm1SbVJ1VnlWeVqBWoFafV6BYn1ieWZ9anlqeW55cnlydXZ5enV+dX55gnWGdYp5jnmOeZJ9ln2afZ6BooGigaaFqoWuhbKJtom2ibqNvo3CjcaRypHKkc6V0pXWldqZ3pnemeKd5p3qne6h7qHyofal+qX+pgKqAqoGqgquDq4SrhayFrIash62IrYmtiq6KrouujK+Nr46vj7CPsJCwkbGSsZOxk7KUspWylrOXs5izmLSZtJq0m7WctZ21nbaetp+2oLeht6K3orijuKS4pbmmuae5p7qouqm6qruru6y7rLytvK68r72wvbC9sb6yvrO+s7+zv7O+s76zvbO8s7yzu7O6s7qzubO4s7izt7O2s7aztbO0s7Szs7Oys7KzsbOws7Czr7Ous66zrbOss6yzq7Oqs6qzqbOos6izp7Oms6azpbOks6Szo7Ois6KzobOgs6Czn7Oes56znbSctJy0m7SatZq1mbWYtpi2mLeXt5e4lriVuZa5lbqUupW7lLyTvZS9k76Tv5O/k8CTwZPCk8KTw5PDk8OTw5TDlMOUw5XDlcSWxJjEmcSaw5zDncKewp/BoMGhwKO/o7+jv6S+o76ivaK8oryhu6G7obqguqC5n7ifuJ+3nreetp62nbWdtJ20nLObs5yym7KasZuwmrCZr5qvma6YrZitmKyXrJerl6uWqpaplqmVqJWolKeUp5Smk6WTpZOkkqSRo5KikaKQoZGhkKCPoJCfj56Ono6djp2NnI2cjZuMmoyajJmLmYuYipeKl4qWiZaJlYmViJSHk4iTh5KGkoeRhpGFkIaPhY+EjoSOhI2DjYOMg4uCi4KKgoqBiYGIgIiAh4CHf4Z/hn+FfoR+hH6DfYN8gn2CfIF7gHyAe396f3p+en15fXl8eXx4e3h7eHp3eXd5dnh2eHZ3dXd1dnV1dHV0dHR0c3NycnNycnFxcXJwcXBwb3BucG5vbW9tb2xubG5rbmptam1pbGlsaGxoa2drZmtmamVqZWpkaWRpY2pjaWJpYWpgal9rX2xebV5uXXBdcV1yXXRedF51XndfeF95X3tgfGB9YH9ggGGBYYNhhGKEYoZih2OIY4pji2SMZI5kj2WQZZJlk2WUZpZmlmaXZ5lnmmebaJ1onmifaaFpoWmgaqFroWygbKFtoW6gb6FvoHCgcaFyoHOgc6B0oHWgdqB2oHefeKB5oHmfeqB7n3yffKB9n36ff6CAoICfgaCCoIOghKGEoIWghqGHoYihiKGJoYqhi6KMoo2ijaKOoo+ikKORo5GikqOTo5SjlaSVo5ajl6SYpJmkmqWapJuknKWdpZ6lnqWfpaCloaaipqKlo6akpqWmpqenp6emqKepp6qnq6irp6ynraiuqK+or6iwqLGosqmzqbSptKm1qbapt6q4qripuaq6qruqvKu8qr2qvqu/q8CrwazBq8Krw6zErMWsxa3GrcetyK7JrsqvyrDLsMywzbLNss6yz7TQtNC10bfSt9K407nUutS71b3Vvda+1sDXwdfC2MPYxNjF2cfZyNnJ2cvZzNrN2s/a0NrR2tPa1NrV2tfa2NrZ2dvZ3Nnd2d/Z4Njg2OLY49fk1+bW59bo1enV6tTr1O3T7dLu0vDR8NDx0PLP887zzfXN9cz1y/fK98r3yfjI+cf5xvrF+sX6xPvD+8L7wfvB+8D7");
const GUNMAN_FLANK_STAGE2_CODE7_AT1407_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE7_AT1407_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 32] as const);
const GUNMAN_FLANK_STAGE2_CODE8_AT1599_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("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");
const GUNMAN_FLANK_STAGE2_CODE8_AT1599_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE8_AT1599_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 32] as const);
const GUNMAN_FLANK_STAGE2_CODE9_AT1807_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("9yH2IfUh9SL0IvMi8iPxI/Aj8CTvJO4k7SXsJewl6ybqJukm6CfnJ+cn5ijlKOQo4yniKeIp4SrgKt8q3ivdK90r3CzbLNos2S3YLdgt1y7WLtUu1C/TL9Mv0jDRMNAwzzHPMc4xzTLMMssyyjPKM8kzyDTHNMY0xTXFNcQ1wzbCNsE2wDfAN783vji9OLw4uzm7Obo5uTq4Orc6tzu2O7U7tDyzPLI8sj2xPbA9rz6uPq0+rT+sP6s/q0CrQKtAq0GrQatBq0KrQqtCq0OrQ6tDq0SrRKtEq0WrRatFq0arRqtGq0erR6tHq0irSKtIq0mrSatJq0qrSqtKq0urS6tLq0yrTKtMq02rTatNq06rTqtOq0+rT6tPq1CrUKtQq1GrUatRq1KrUqtSq1OrU6tTq1SrVKtUq1WrVatVq1arVqtWq1erV6tXq1irWKtYq1mrWatZq1qrWqtaq1urW6tbq1yrXKtcq12rXatdq16rXqteq1+rX6tfq2CrYKtgq2GrYathq2KrYqtiq2OrY6tjq2SrZKtkq2WrZatlq2arZqtmq2erZ6tnq2iraKtoq2mraatpq2qraqtqq2ura6trq2yrbKtsq22rbattq26rbqtuq2+rb6tvq3CrcKtwq3Grcatxq3Krcqtyq3Orc6pxqXCnb6ZtpWyka6JqoWmfaJ5nnGabZpplmWWYZZhll2WWZZVllGWTZZNlkmWRZpBmj2aPZ45njWiLaYpqiGyHbYZuhXCEcYNzgnWBdoB4gHp/fH59fn99gn2FfIh8i3yOfJF8lHyXfJl8mnybfZ19nX6efqB+oH+gf6CAn4Gfgp+Cn4Ofg6CDoIOgg6GDoYOgg6CEn4SehJ6FnYWchZyGm4aah5uHmoeah5uHm4ebh5yHnIech52HnYediJ+IoIihiKKIooiiiKKIoYegh6CHn4eeh56GnYachpyGm4aahpqHmYeYh5iHl4eWiJaIlYiUiJSJk4mTiZSJlImUiZWJlYmViZaJlomWiZeJl4mXiZiJmImYiZmJmYmZiZqJmomaiZuJm4mbiZyJnImciZ2JnYmdiZ6JnomeiZ+Jn4mfiaCJoImgiaGJoYmhiaGJoIifiJ+Inoedh52HnIebh5uGmoaZhpmGmIaXhpeGloaVh5WHlIeTh5OHkoiSiJKIkYmQiZCJj4mPiZCJkImQiZGJkYmRiZKJkomSiZOJk4mTiZSJlImUiZaJl4mYiZqJm4mciZ6Jn4mgiaGJoYihh6KGooWihaOEo4OjgqSBpICkgKV/pX6lfaZ8pnume6d6p3mneKh3qHaodql1qXSpc6pyqnGqcatwq2+rbqxtrG2sbK1rrWqtaa5ormiuZ69mr2WvZLBjsGOwYrFhsWCxX7Jesl6yXbNcs1uzWrRZtFm0WLVXtVa1VbZUtlS2U7dSt1G3ULhQuE+4TrlNuUy5S7pLukq6SbtIu0e7RrxGvEW8RL1DvUK9Qb5BvkC+P78+vz2/PMA8wDvAOsE5wTjBOMI3wjbCNcM0wzPDM8QyxDHEMMUvxS7FLsYtxizGK8cqxynHKcgoyCfIJsklySTJJMojyiLKIcsgyx/LH8wezB3MHM0bzRvNGs4ZzhjOF88WzxbPFdAU0BPQEtER0RHRENIP0g7SDdMM0wzTDNQM1AzUDNUM1QzVC9UL1AvTC9MM0gzRDdIN0Q7RD9IQ0hHSEdMS0xPTFNQV1BbUFtUX1RjVGdYa1hvWG9cc1x3XHtgf2B/YINkh2SLZI9ok2iTaJdsm2yfbKNwp3CncKt0r3SzdLd4u3i7eL98w3zHfMuAz4DPgNOE14TbhN+I34TjhOeI64jviPOM84z3jPuM/40DjQORB5ELjQ+RE5EXkReVG5EfkSOVJ5UnlSuZL5UzlTeZN5k7mT+ZQ5lHmUedR5lDlUOVQ5FDjUONQ4lDhUOFQ4FDfUd9R3lHdUd1R3FHbUdtS2lLZUtlS2FLYUthT11PWU9ZT1VPUU9RU01TSVNJU0VTQVNBUz1XOVc5VzVXMVcxVy1bKVspWyVbIVshWx1bGV8ZXxVfEV8RXw1fCWMJYwVjBWMFYwFi/Wb9Zvlm9Wb1ZvFm7Wbtaulq5WrlauFq3Wrdbtlu1W7VbtFuzW7NbslyxXLFcsFyvXK9crl2tXa1drF2rXatdql6pXqpeqV6oXqhep16mX6ZfpV+kX6Rfo1+iYKJgoWCgYKBgn2CeYJ5hnWGcYZxim2KaYptjmmOZZJlkmGWYZZhml2eWZ5dolmmWaZZqlWuVa5ZslW2VbpVulW+VcJZxlXKVcpZzlnSWdZd2l3eXd5h4mHmZepp7mnuafJx9nH6dfp5/noCfgaGBoYKig6ODpISkhaaFp4anh6mHqYiqiauJrIqsi66Lr4yvjbGNsY6yj7OPtJC1kbaSt5K3k7mUuZS6lbuWvJa9l76Yv5i/mcGawZrCm8ScxJzFncaex57Hn8mgyaDKocyizKPNo86kz6XPpdGm0qfSp9So1KnVqdaq16vXq9ms2q3ardyu3K/dr96w37HgseGy4rPitOS05LXltua257fouOm46rnquuy67LvtvO+8773wvvG+8r/ywPTA9MH1wvfC98P4xPrE+sX7");
const GUNMAN_FLANK_STAGE2_CODE9_AT1807_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE9_AT1807_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 32] as const);
const GUNMAN_FLANK_STAGE2_CODE7_AT1903_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BEEFQQZBB0IIQghCCUMKQwtDDEQNRA1EDkUPRRBFEUYSRhJGE0cURxVHFkgWSBdIGEkZSRpJG0obShxKHUseSx9LIEwgTCFMIk0jTSRNJU4lTiZOJ08oTylPKlAqUCtQK1EsUS1RLVMuVC9UL1YwVzBYMVkyWjJbM1wzXTReNF81YDZhNmM3YzdkOGY4ZjlnOmk6aTtqO2w8bTxtPW8+cD5wP3I/c0B0QXVBdkJ3QnhDeUN6RHtFfEV9Rn9Gf0eAR4JIgkmDSYVKhUqGS4hMiUyJTYtNjE6MT45PjlCPUZBRkVKSU5NTlFSUVZZVl1aXV5lXmViaWZxZnFqdWp9bn1ugXKJdol2jXqVepl+mYKhgqGGpYapiqWKoYqhjqGOnZKdkpmWlZaVmpWakZ6Rno2iiaKJoommhaaFqoGqfa59rn2yebJ5tnW2dbp1unG+bcJxwm3Gbcptym3OadJt1mnWadpt3mniaeZt5m3qbe5x8nH2cfp1+nX+dgJ6BnoKegqCDoIOgg6GDoISfhJ+EnoSdhZ2FnIWbhpuGm4eah5qImYiZiJqImoiaiJuIm4ibiJyInIiciJ6In4igiKGHoYahhqKFooSig6OCo4GjgaSApH+kfqV9pXylfKZ7pnqmead4p3end6h2qHWodKlzqXOpcqpxqnCqb6tuq26rbaxsrGusaq1prWmtaK5nrmauZa9kr2SvY7BisGGwYLFfsV+xXrJdslyyW7Nas1qzWbRYtFe0VrVWtVW1VLZTtlK2UbdRt1C3T7hOuE24TLlMuUu5SrpJuki6R7tHu0a7RbxEvEO8Qr1CvUG9QL4/vj6+Pr89vzy/O8A6wDnAOcE4wTfBNsI1wjTCNMMzwzLDMcQwxC/EL8UuxS3FLMYrxirGKscpxyjHJ8gmyCXIJckkySPJIsohyiHKIMsfyx7LHcwczBzMG80azRnNGM4XzhfOFs8VzxTPE9AS0BLQEdEQ0Q/RDtIN0g3SDNMM0wzTDNQM1AzUDNUM1AvTC9MM0gzRDNEN0Q7QDtEP0RDREdIS0hLSE9MU0xXTFtQX1BfUGNUZ1RrVG9Yc1hzWHdce1x/XINgg2CHYItkj2STZJdol2ibaJ9so2ynbKtwq3CvcLN0t3S7dL94v3jDeMd8y3zPfNOA04DXgNuE34TjhOeI54TrhO+I84j3iPeI+4j/iQONB40HjQuND40TjReRG5EbjR+RI5EnkSuVK5EvkTOVN5U7lTuZP5VDlUeZR5lHlUeVQ5FDjUONQ4lDhUOFR4FHfUd9R3lHdUd1S3FLbUttS2lLZUtlS2FPXU9dT1lPWU9ZT1VTUVNRU01TSVNJU0VTQVdBVz1XOVc5VzVXMVsxWy1bKVspWyVbIV8hXx1fGV8ZXxVfEV8RYw1jCWMJYwVjAWMBZv1m/Wb9Zvlm9Wb1ZvFq7Wrtaulq5WrlauFu3W7dbtlu1W7VbtFyzXLNcslyxXLFcsFyvXa9drl2tXa1drF2rXqteql6pXqleqF6nXqhfp1+mX6ZfpV+kX6Rgo2CiYKJgoWCgYKBhn2GeYZ5hnWGcYpxim2KaY5pjmmSZZJllmGWXZphml2eWaJdolmmWapZqlWuVbJVslW2VbpVvlXCVcJVxlXKVc5Z0lnSWdZd2l3eXeJh5mHmYepp7mnyafZx9nH6cf56AnoCfgaGCoYKig6OEpISkhaaGpoanh6mIqYiqiauKrIqsi66Mr4yvjbGOsY6yj7OQtJG0kbaSt5O3k7mUuZW6lbuWvJe9l76Yv5m/mcGawZvCm8OcxJ3Fncaex5/Hn8mgyaHKosyizKPNpM6kz6XPptGm0afSqNSo1KnVqtaq16vXrNms2q3artyu3K/dsN6w37HfsuGy4rPitOS15LXltua357fouOm56rnquuy77LvtvO69773wvvG/8r/ywPTB9MH1wvfD98P4xPnF+sX7");
const GUNMAN_FLANK_STAGE2_CODE7_AT1903_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE7_AT1903_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 64] as const);
const GUNMAN_FLANK_STAGE2_CODE7_AT1967_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("BDEFMQYxBzIIMgkyCTMKMwszDDQNNA40DjUPNRA1ETYSNhM2EzcUNxU3FjgXOBg4GDkZORo5GzocOh06HTseOx87IDwhPCE8Ij0jPSQ9JT4mPiY+Jz8oPyk/KkArQCtAK0EsQS1CLkMuRC9FL0cvSDBJMEoxSzFMMk4yTzNPM1EzUjRTNFU1VjVXNlg2WTZaN1w3XTheOF85YDlhOmM6ZDtlO2Y8ZzxoPGo9az1rPm0+bj9vP3FAckByQXRBdUF2QnhCeUN5Q3tEfER9RX9FgEaARoJGg0eER4ZIh0iHSYlJikqLSo1LjUuOTJBMkU2STZNOlE6VT5ZQl1CYUZpRmlKbUp1TnVOeVKBUoFWfVZ9Wn1aeV55YnlidWZ5anVudW51cnV2dXp1enV+dYJ5hnWKdYp5jnmSeZZ9mn2efZ6FooWmhaqJromujbKRtpG6kb6VwpnCmcadyp3OndKh0qXWpdqp3qniqeKx5rHqse618rX2ufa9+r3+vgLCBsIGxgrKDsoSyhbOFtIa0h7WItYm1ireKt4u3jLiNuI64jrqPupC6kbuSu5K8k72TvZO9k72UvJS7lLuUupS5lLmVuJW3lbeVtpW1lbWVtJazlrOWspaxlrGWsJevl6+Xrpetl62XrZismKyYq5iqmKqYqZiomaiZp5mmmaaZpZmkmqSao5qimqKaoZqgmqCbn5uem56bnZycnJycm52bnZuemp6Zn5mfmaCYoJihmKKXopejl6SWpJellqaWppanlqiVqZaqlqqWq5aslq2Wrpeul6+XsJixmLKYs5mzmrSatZu2m7ect524nrmeuaC6oLuhvKK8o72jvqW+pr+mwKjAqMGpwavCq8Ksw67Dr8SwxLHFssWzxbXGtsa3xrnHuse7x73Hvse/x8HHwsfDx8XHxcfFx8fHx8bHxsnFycTKw8vCy8LLwczAzL/Nv86/zb/Mv8y+y77Kvsq+yb7Ivsi+x73Gvca9xb3EvcS9w7zCvMK8wbzAvMC8v7y+u767vbu8u7y7u7u6uru6urq5urm6uLq3ube5trm1ubW5tLmzubO4srixuLG4sLivuK+3rrett623rLert6u3qraptqm2qLantqe2prWltaW1pLWjtaO1o7SitKK0obSgtKC0n7Ses56znbOcs5yzm7OaspqymbKYspiyl7KWspaxlbGUsZSxk7GSsZKwkbCQsJCwj7COsI6vja+Mr4yvi6+Lr4uviq6JromuiK6Hroeuhq2FrYWthK2DrYOtgq2BrIGsgKx/rH+sfqx9q32rfKt7q3ureqt5qnmqeKp3qneqdqp1qnWpdKl0qXSpc6lyqXKocahwqHCob6huqG6obadsp2yna6dqp2qnaaZopmimZ6ZmpmamZaVkpWSlY6VipWKlYaVgpGCkX6RepF6kXaRco12jXKNbo1ujWqNZo1miWKJXoleiVqJVolWhVKFToVOhUqFRoVGgUKBPoE+gTqBNoE2gTJ9Ln0ufSp9Jn0mfSJ5HnkeeRp5FnkaeRZ5EnUSdQ51CnUKdQZ1AnECcP5w+nD6cPZw8mzybO5s6mzqbOZs4mziaN5o2mjaaNZo0mjSZM5kymTKZMZkwmTCZL5gumC6YLpgtmC2YLJcrlyuXKpcplymXKJYnlieWJpYlliWWJJYjlSOVIpUhlSGVIJUflB+UHpQdlB2UHJQblBuTGpMZkxmTGJMXkxeSF5IWkhaSFZIUkhSRE5ESkRKREZEQkRCRD5AOkA6QDZAMkAyQC48KjwqPCY8IjwiPB48GjgaOBY4EjgSOA44CjQKNAY0A");
const GUNMAN_FLANK_STAGE2_CODE7_AT1967_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE7_AT1967_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 4, y - 48] as const);

const GUNMAN_FLANK_STAGE2_CODE8_AT207_Y64_TRACE_NES = decodeCoordinateRuns("AgVBAQZBAQdCAQhCAQlCAgpDAQtDAQxEAQ1EAQ5EAg9FARBFARFGARJGARNGAhRHARVHARZIARdIARhIAhlJARpJARtKARxKAR1KAh5LAR9LASBMASFMASJMASJNASNNASRNASVOASZOASdOASdPAShPASlPASpQAStQASxQASxRAS1RAS5RAS9SATBSATFSATFTATJTATNTATRUATVUATZUATZVATdVAThVATlWAjpWATtXATxXAT1XAT5YAj9YAUBZAUFZAUJZAUNaAkRaAUVbAUZbAUdbAUhcAklcAUpdAUtdAUxdAU1eAk5eAU9fAVBfAVFfAVJgAlNgAlRhAVVgAVZeAVhdAVlbAVpaAVxZAV1YAV5XAWBWAWFVAWNVAWRUAWVUAWZTAWdTAmhTAWlTAWpTAWtTAWxTAW1TAW1UAW5UAW9UAnBVAXFVAXNXAXRYAXVZAXdaAXhbAXldAXpeAXtgAXxhAX1jAX5kAX9mAYBoAYBqAYFsAYFuAYJwAYJzAYN2AYN5AYN8AYN/AYOCAYOFAoOHAYKHAYKIAYGIAYCIAX+JAX6JAX2JAX2KAnyKAXyLAXyKAnyJAXyIAnyHAXyGAnyFAXyEAnyDAXyCAnyBAXyAAnx/AXx+Anx9AXx8Anx7AXx6Anx5AXx4Anx3AXx2Anx1AXx0AnxzAXxyAnxxAXxwAnxvAXxuAnxtAXxsAnxrAXxqAnxpAXxoAnxnAXxmAnxlAXxkAnxjAXxiAnxhAXxgAnxfAXxeAnxdAXxcAnxbAXxaAnxZAXxYAnxXAXxWAnxVAXxUAnxTAXxSAnxRAXxQAnxPAXxOAnxNAXxMAnxLAXxKAnxJAXxIAnxHAXxGAnxFAXxEAnxDAXxCAnxBAXxAAnw/AXw+Anw9AXw8Anw7AXw6Anw5AXw4Anw3AXw2Anw1AXw0AnwzAXwyAnwxAXwwAnwvAXwuAnwtAXwsAnwrAXwqAnwpAXwoAnwnAXwmAnwlAXwkAnwjAXwiAnwhAXwgAnwfAXweAnwdAXwcAnwbAXwaAnwZAXwYAnwXAXwWAnwVAXwUAnwTAXwSAnwRAXwQAnwPAXwOAnwNAXwMAnwLAXwKAnwJAXwIAnwHAXwGAnwFAXwEAnwDAXwCAnwBAXwA").map(([x, y]) => [x - 4, y - 64] as const);

export function gunmanFlankLifetime(entityCode: 7 | 8 | 9, originY = 0, stage = 2, phase = 0, fromRight = false, eventAt?: number): number {
  if (stage === 2 && entityCode === 8 && eventAt === 207) return GUNMAN_FLANK_STAGE2_CODE8_AT207_Y64_TRACE_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 7 && eventAt === 351) return GUNMAN_FLANK_STAGE2_CODE7_AT351_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 7 && eventAt === 399) return GUNMAN_FLANK_STAGE2_CODE7_AT399_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 8 && eventAt === 655) return GUNMAN_FLANK_STAGE2_CODE8_AT655_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 7 && eventAt === 1135) return GUNMAN_FLANK_STAGE2_CODE7_AT1135_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 7 && eventAt === 1167) return GUNMAN_FLANK_STAGE2_CODE7_AT1167_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 7 && eventAt === 1231) return GUNMAN_FLANK_STAGE2_CODE7_AT1231_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 7 && eventAt === 1407) return GUNMAN_FLANK_STAGE2_CODE7_AT1407_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 8 && eventAt === 1599) return GUNMAN_FLANK_STAGE2_CODE8_AT1599_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 9 && eventAt === 1807) return GUNMAN_FLANK_STAGE2_CODE9_AT1807_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 7 && eventAt === 1903) return GUNMAN_FLANK_STAGE2_CODE7_AT1903_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 7 && eventAt === 1967) return GUNMAN_FLANK_STAGE2_CODE7_AT1967_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 8 && eventAt === 623) return GUNMAN_FLANK_STAGE2_CODE8_AT623_TRACE_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 9 && eventAt === 1775) return GUNMAN_FLANK_STAGE1_AT1775_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 8 && eventAt === 1263) return GUNMAN_FLANK_STAGE1_AT1263_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 8 && eventAt === 1071) return GUNMAN_FLANK_STAGE1_AT1071_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 7 && eventAt === 703) return GUNMAN_FLANK_STAGE1_AT703_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 7 && eventAt === 2671) return GUNMAN_FLANK_STAGE1_AT2671_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 7 && eventAt === 2559) return GUNMAN_FLANK_STAGE1_AT2559_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 7 && eventAt === 2511) return GUNMAN_FLANK_STAGE1_AT2511_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 7 && eventAt === 2223) return GUNMAN_FLANK_STAGE1_AT2223_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 7 && eventAt === 2079) return GUNMAN_FLANK_STAGE1_AT2079_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 7 && eventAt === 1983) return GUNMAN_FLANK_STAGE1_AT1983_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 7 && eventAt === 1791) return GUNMAN_FLANK_STAGE1_AT1791_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 7 && eventAt === 1743) return GUNMAN_FLANK_STAGE1_AT1743_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 7 && eventAt === 1423) return GUNMAN_FLANK_STAGE1_AT1423_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 1 && entityCode === 7 && eventAt === 847) return GUNMAN_FLANK_STAGE1_AT847_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 0 && phase === 1) return GUNMAN_FLANK_STAGE2_CODE7_Y0_TRACE_ABSOLUTE_NES.length / NES_FRAME_RATE;
  const scoped = stage === 3 && entityCode === 7 && Math.round(originY) === 0 && phase === 1 ? GUNMAN_FLANK_STAGE3_CODE7_Y0_OFFSETS_NES.length : stage === 6 && entityCode === 7 && Math.round(originY) === 64 ? GUNMAN_FLANK_STAGE6_CODE7_Y64_LEFT_OFFSETS_NES.length : stage === 6 && entityCode === 7 && Math.round(originY) === 32 ? (fromRight ? GUNMAN_FLANK_STAGE6_CODE7_Y32_RIGHT_OFFSETS_NES.length : GUNMAN_FLANK_STAGE6_CODE7_Y32_LEFT_OFFSETS_NES.length) : stage === 6 && entityCode === 8 && Math.round(originY) === 32 && phase === 0 ? GUNMAN_FLANK_STAGE6_CODE8_Y32_PHASE0_OFFSETS_NES.length : stage === 6 && entityCode === 8 && Math.round(originY) === 32 && phase === 1 ? GUNMAN_FLANK_STAGE6_CODE8_Y32_REAL_OFFSETS_NES.length : stage === 6 && entityCode === 9 && Math.round(originY) === 48 && phase === 1 && fromRight ? GUNMAN_FLANK_STAGE6_CODE9_Y48_PHASE1_OFFSETS_NES.length : stage === 3 && entityCode === 7 && Math.round(originY) === 64 && phase === 1 ? (fromRight ? GUNMAN_FLANK_STAGE3_CODE7_RIGHT_OFFSETS_NES.length : GUNMAN_FLANK_STAGE3_CODE7_LEFT_OFFSETS_NES.length) : stage === 3 && entityCode === 8 && Math.round(originY) === 64 && phase === 0 ? GUNMAN_FLANK_STAGE3_CODE8_PHASE0_OFFSETS_NES.length : stage === 2 && Math.round(originY) === 64 && entityCode === 8 ? GUNMAN_FLANK_Y64_TRACE_SAMPLES_NES[entityCode].length : stage === 2 && Math.round(originY) === 64 && entityCode === 9 ? GUNMAN_FLANK_Y64_CODE9_TRACE_SAMPLES_NES.length : stage === 2 && Math.round(originY) === 32 && entityCode !== 7 ? GUNMAN_FLANK_SCOPED_LIFETIMES_FRAMES[entityCode] : undefined;
  return (scoped ?? Math.round(GUNMAN_FLANK_LIFETIMES[entityCode] * NES_FRAME_RATE)) / NES_FRAME_RATE;
}

export function gunmanFlankFirstOpportunityFrame(seed: number, originY = 16, stage = 2, entityCode: 7 | 8 | 9 = 7, phase = 0): number {
  return gunmanFirstOpportunityFrame(seed, originY, (stage === 2 || stage === 3) && entityCode === 7 && Math.round(originY) === 0 && phase === 1 ? 46 : undefined);
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
// Complete 642-frame left-edge code-7 trace, relative to its x=4/y=32
// event origin. The runtime mirrors this trace for right-edge code-7 entries.
const GUNMAN_FLANK_TRACE_SAMPLES_NES = decodeGunmanTopSamples("AAAAAAEAAgEDAQQBBQIFAgYCBwMIAwkDCQQKBAsEDAUNBQ4FDgYPBhAGEQcSBxMHEwgUCBUIFgkXCRgJGAoZChoKGwscCx0LHQweDB8MIA0hDSENIg4jDiQOJQ8mDyYPJhAnECgQKRIpEyoTKhUrFisXLBksGSwaLRwtHS4eLiAvIC8hMCMwJDElMScyJzIoMiozKzMsNC40LjUvNTE2MjYzNzU3NTc2ODg4OTk6OTs6PDo9Oz87QDxBPEI8Qz1EPkY+Rz5HP0k/SkBLQE1BTUFOQlBDUUNRRFNEVEVURVZGV0dYR1lIWkhbSVxKXUpeS19LYExhTGNNY05kTmVOZE9kT2RQY1FjUWNSYlNiU2JUYlViVmJWYldhWGJZYlpiWmNbYlxiXWNeY15jX2RgZGFkYmVjZWNlZGZlZmZmZ2doZ2hnaWhqaGtobGltaW1pbmpvanBqcWtya3Jrc2x0bHVsdm12bXdteG55bnpue297b3xvfXB+cH9wgHGAcYFxgnKDcoRyhXOFc4Zzh3SIdIl0inWKdYt1jHaNdo52jnePd5B3kXiSeJN4k3mUeZV5lnqXeph6mHuZe5p7m3ycfJ18nX2efZ99oH6hfqJ+on+jf6R/pYCmgKeAp4GogamBqoKrgquCrIOtg66Dr4SwhLCEsYWyhbOFtIa1hrWGtoe3h7iHuYi6iLqIu4m8ib2Jvoq/ir+LwIzBjMKMw43DjsSOxZDGkMaQx5LIksiTyZXKlcqWy5jMmMyZzZvNm86czp7Pn8+gz6LQo9Ck0KbRptGn0anRqtGr0a3RrtGv0bHRstGz0bXRttG30bnRutC70L3Qvs+/z8HPws7CzsTNxc3GzMjMyMvJysvKy8nMyM7IzsfPxtDG0cXRxNLD08PTwtTB1cDVv9a/1r7Wvde817vXuti62LnYuNm32LbYttm12LTYs9mz2LLYsdiw2LDXr9ev167Wrdat1qzVrNWr1KvTqtSq06rSqdKp0anQqNCoz6jOp86nzafNp82mzKbLpsulyqXJpcmkyKTHpMejxqPFo8aixaLEosSiw6HCocKhwaDAoMCgv5++n76fvZ69nr2evJ27nbudup25nLmcuJy3m7ebtpu1mraatZq0mbSZs5mymLKYsZiwmLCXr5eul66WrZatlq2VrJWrlauUqpSplKmTqJOnk6eTppKlkqaSpZGkkaSRo5CikKOQo5GikqOTo5OilKOVo5ailqOXopiimaOZopqim6Kcop2inaOdo52jnaSdo56jnqSepJ6knqWepZ6lnqaepp6mnqeep56nnqieqJ6onqmeqZ6pnqqeqp6qnqueq56rnqyerJ6snq2erZ6tnq6erp6unq+er56vnrCesJ6wnrGesZ6xnrKesp6ynrOes56znrSetJ60nrWetZ61nraetp62nreet563nrieuJ64nrmeuZ65nrqeup66nrueu567nryevJ68nr2evZ69nr6evp6+nr+ev56/nsCewJ7AnsGewZ7BnsKewp7CnsOew57DnsSexJ7EnsWexZ7Fnsaexp7Gnseex57HnsieyJ7InsmeyZ7Jnsqeyp7Knsuey57LnsyezJ7Mns2ezZ7Nns6ezp7Ons+ez57PntCe0J7QntGe0Z7RntKe0p7SntOe057TntSe1J7UntWe1Z7Vntae1p7Wntee157Xntie2J7Yntme2Z7Zntqe2p7a").map(([x, y]) => [x, y + 1] as const);
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

export function gunmanFlankPosition(entityCode: 7 | 8 | 9, age: number, originY = 0, stage = 2, phase = 0, fromRight = false, eventAt?: number): readonly [number, number] {
  const path = stage === 2 && Math.round(originY) === 32 && entityCode !== 7 ? GUNMAN_FLANK_SCOPED_PATHS_NES[entityCode] : GUNMAN_FLANK_PATHS_NES[entityCode];
  const frame = Math.max(0, Math.round(age * NES_FRAME_RATE));
  if (stage === 2 && entityCode === 8 && eventAt === 207 && frame < GUNMAN_FLANK_STAGE2_CODE8_AT207_Y64_TRACE_NES.length) return GUNMAN_FLANK_STAGE2_CODE8_AT207_Y64_TRACE_NES[frame]!;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 32 && phase === 1 && eventAt === 351 && frame < GUNMAN_FLANK_STAGE2_CODE7_AT351_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE7_AT351_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 32 && phase === 0 && eventAt === 399 && frame < GUNMAN_FLANK_STAGE2_CODE7_AT399_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE7_AT399_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 8 && Math.round(originY) === 32 && phase === 0 && eventAt === 655 && frame < GUNMAN_FLANK_STAGE2_CODE8_AT655_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE8_AT655_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 48 && phase === 0 && eventAt === 1135 && frame < GUNMAN_FLANK_STAGE2_CODE7_AT1135_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE7_AT1135_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 64 && phase === 0 && eventAt === 1167 && frame < GUNMAN_FLANK_STAGE2_CODE7_AT1167_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE7_AT1167_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 48 && phase === 0 && fromRight && eventAt === 1231 && frame < GUNMAN_FLANK_STAGE2_CODE7_AT1231_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE7_AT1231_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 32 && phase === 1 && eventAt === 1407 && frame < GUNMAN_FLANK_STAGE2_CODE7_AT1407_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE7_AT1407_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 8 && Math.round(originY) === 32 && phase === 1 && eventAt === 1599 && frame < GUNMAN_FLANK_STAGE2_CODE8_AT1599_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE8_AT1599_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 9 && Math.round(originY) === 32 && phase === 0 && eventAt === 1807 && frame < GUNMAN_FLANK_STAGE2_CODE9_AT1807_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE9_AT1807_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 64 && phase === 0 && eventAt === 1903 && frame < GUNMAN_FLANK_STAGE2_CODE7_AT1903_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE7_AT1903_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 48 && phase === 0 && eventAt === 1967 && frame < GUNMAN_FLANK_STAGE2_CODE7_AT1967_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE7_AT1967_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 8 && Math.round(originY) === 32 && phase === 0 && eventAt === 623 && frame < GUNMAN_FLANK_STAGE2_CODE8_AT623_TRACE_NES.length) return GUNMAN_FLANK_STAGE2_CODE8_AT623_TRACE_NES[frame]!;
  if (stage === 1 && entityCode === 9 && eventAt === 1775 && frame < GUNMAN_FLANK_STAGE1_AT1775_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT1775_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 8 && eventAt === 1263 && frame < GUNMAN_FLANK_STAGE1_AT1263_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT1263_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 8 && eventAt === 1071 && frame < GUNMAN_FLANK_STAGE1_AT1071_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT1071_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 7 && eventAt === 703 && frame < GUNMAN_FLANK_STAGE1_AT703_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT703_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 7 && eventAt === 2671 && frame < GUNMAN_FLANK_STAGE1_AT2671_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT2671_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 7 && eventAt === 2559 && frame < GUNMAN_FLANK_STAGE1_AT2559_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT2559_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 7 && eventAt === 2511 && frame < GUNMAN_FLANK_STAGE1_AT2511_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT2511_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 7 && eventAt === 2223 && frame < GUNMAN_FLANK_STAGE1_AT2223_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT2223_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 7 && eventAt === 2079 && frame < GUNMAN_FLANK_STAGE1_AT2079_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT2079_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 7 && eventAt === 1983 && frame < GUNMAN_FLANK_STAGE1_AT1983_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT1983_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 7 && eventAt === 1791 && frame < GUNMAN_FLANK_STAGE1_AT1791_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT1791_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 7 && eventAt === 1743 && frame < GUNMAN_FLANK_STAGE1_AT1743_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT1743_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 7 && eventAt === 1423 && frame < GUNMAN_FLANK_STAGE1_AT1423_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT1423_OFFSETS_NES[frame]!;
  if (stage === 1 && entityCode === 7 && eventAt === 847 && frame < GUNMAN_FLANK_STAGE1_AT847_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT847_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 0 && phase === 1 && frame < GUNMAN_FLANK_STAGE2_CODE7_Y0_TRACE_ABSOLUTE_NES.length) {
    const [x, y] = GUNMAN_FLANK_STAGE2_CODE7_Y0_TRACE_ABSOLUTE_NES[frame]!;
    return [x - 56, y];
  }
  const y64Trace = stage === 6 && entityCode === 7 && Math.round(originY) === 64 ? GUNMAN_FLANK_STAGE6_CODE7_Y64_LEFT_OFFSETS_NES : stage === 3 && entityCode === 7 && Math.round(originY) === 64 && phase === 1 ? (fromRight ? GUNMAN_FLANK_STAGE3_CODE7_RIGHT_OFFSETS_NES : GUNMAN_FLANK_STAGE3_CODE7_LEFT_OFFSETS_NES) : stage === 3 && entityCode === 8 && Math.round(originY) === 64 && phase === 0 ? GUNMAN_FLANK_STAGE3_CODE8_PHASE0_OFFSETS_NES : stage === 2 && Math.round(originY) === 64 ? entityCode === 8 ? GUNMAN_FLANK_Y64_TRACE_SAMPLES_NES[entityCode] : entityCode === 9 ? GUNMAN_FLANK_Y64_CODE9_OFFSETS_NES : undefined : undefined;
  const scopedTrace = stage === 3 && entityCode === 7 && Math.round(originY) === 0 && phase === 1 ? GUNMAN_FLANK_STAGE3_CODE7_Y0_OFFSETS_NES : stage === 6 && entityCode === 7 && Math.round(originY) === 32 ? (fromRight ? GUNMAN_FLANK_STAGE6_CODE7_Y32_RIGHT_OFFSETS_NES : GUNMAN_FLANK_STAGE6_CODE7_Y32_LEFT_OFFSETS_NES) : stage === 6 && entityCode === 8 && Math.round(originY) === 32 ? phase === 0 ? GUNMAN_FLANK_STAGE6_CODE8_Y32_PHASE0_OFFSETS_NES : phase === 1 ? GUNMAN_FLANK_STAGE6_CODE8_Y32_REAL_OFFSETS_NES : undefined : stage === 6 && entityCode === 9 && Math.round(originY) === 48 && phase === 1 && fromRight ? GUNMAN_FLANK_STAGE6_CODE9_Y48_PHASE1_OFFSETS_NES : undefined;
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
export function gunmanFirstOpportunityFrame(seed: number, originY = 0, firstIncrementFrame?: number): number {
  let value = seed & 0xff;
  let increments = 0;
  do {
    value = (value + 3) & 0xff;
    increments += 1;
  } while (value < 0xc0);
  const startsAt = firstIncrementFrame ?? (originY >= 0x10 && originY < 0xe0 ? 1 : 13);
  return startsAt + increments - 1;
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
  const frame = Math.max(0, Math.min(96, Math.round(age * NES_FRAME_RATE)));
  if (frame < 9) return 0;
  const elapsed = frame - 9;
  const movedFrames = Math.floor(elapsed / 12) * 4 + Math.min(4, elapsed % 12 + 1);
  return Math.min(64, movedFrames * 2) * NES_WORLD_Y_SCALE;
}
// X/Y keyframes sampled from the clean Round 1 Boss trace. The actor's lane
// offset is applied by banditBillCombatPosition for the other entry lanes.
const BANDIT_BILL_COMBAT_TRACE_NES = decodeCoordinateRuns("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");
const BANDIT_BILL_COMBAT_PATH_NES = [[0, 192, 64], [11, 192, 72], [47, 192, 72], [64, 187, 66], [80, 181, 59], [96, 173, 49], [112, 180, 49], [119, 186, 49], [128, 186, 49], [160, 186, 49], [176, 178, 49], [192, 166, 49], [208, 160, 49], [224, 151, 49], [227, 147, 49], [240, 147, 49], [272, 148, 49], [288, 160, 49], [304, 166, 49], [320, 175, 49], [335, 186, 49], [352, 186, 49], [368, 186, 49], [384, 191, 43], [400, 192, 42], [416, 186, 49], [432, 187, 59], [443, 192, 64], [464, 192, 64], [480, 192, 64], [496, 197, 59], [512, 202, 52], [528, 205, 49], [544, 200, 55], [551, 196, 60], [576, 196, 60], [592, 196, 60], [608, 196, 50], [624, 196, 42], [640, 196, 50], [656, 196, 60], [672, 196, 66], [688, 196, 66], [704, 196, 68], [720, 196, 82], [736, 196, 90], [752, 196, 100], [768, 196, 114], [784, 196, 114], [800, 196, 114], [816, 200, 109], [832, 205, 103], [848, 205, 103], [864, 197, 113], [880, 192, 118], [896, 192, 118], [912, 192, 118], [928, 185, 118], [944, 180, 118], [960, 192, 118], [976, 199, 118], [992, 205, 118], [1008, 205, 118], [1024, 205, 118], [1040, 197, 118], [1056, 185, 118], [1072, 179, 118], [1088, 171, 118], [1104, 166, 118], [1168, 166, 112], [1232, 166, 88], [1296, 166, 48], [1360, 170, 46], [1424, 193, 74], [1488, 193, 50], [1552, 193, 52], [1616, 191, 49], [1680, 199, 51], [1744, 207, 63], [1808, 194, 63], [1872, 169, 63], [1936, 165, 74], [2000, 150, 74], [2064, 125, 58], [2128, 135, 70], [2192, 135, 70], [2256, 125, 74], [2320, 125, 58], [2384, 138, 43], [2448, 142, 49], [2512, 142, 81], [2576, 142, 107], [2640, 142, 127], [2704, 118, 99], [2768, 114, 83], [2832, 114, 45], [2896, 134, 45], [2960, 154, 45], [3024, 167, 78], [3088, 179, 84], [3152, 203, 84], [3216, 198, 91], [3280, 184, 108], [3344, 198, 125], [3408, 190, 107], [3472, 190, 67]] as const;
const BANDIT_BILL_COMBAT_PATH_EXTENDED_NES = [...BANDIT_BILL_COMBAT_PATH_NES, [3504, 190, 67], [4000, 125, 74], [4512, 81, 50], [5024, 158, 115], [5536, 190, 99], [6048, 79, 117], [6560, 78, 87], [7072, 162, 88], [7584, 187, 95]] as const;

function banditBillCombatPosition(age: number, entryX = 192 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE - BANDIT_BILL_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 192;
  const traced = BANDIT_BILL_COMBAT_TRACE_NES[Math.round(frame)];
  if (traced) return [(traced[0] + laneOffset) * NES_WORLD_X_SCALE, traced[1] * NES_WORLD_Y_SCALE];
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
const CUTTER_OPENING_TRACE_NES = decodeCoordinateRuns("CJAAAZACAZAEAZAGCZAIAZAKAZAMAZAOCZAQAZASAZAUAZAWCZAYAZAaAZAcAZAeCZAgAZAiAZAkAZAmCZAoAZAqAZAsAZAuCZAwAZAyAZA0AZA2CZA4AZA6AZA8AZA+CJBAAZBCAZBEAZBGCZBIAZBKAZBMAZBOCZBQAZBSAZBUAZBWCZBYAZBaAZBcAZBeCZBgAZBiAZBkAZBmCZBoAZBqAZBsAZBuCZBwAZByAZB0AZB2CZB4AZB6AZB8AZB+CZCAAZCCAZCEAZCGCZCIAZCKAZCMCpCOAZCMAZCKAZCICZCGAZCEAZCCAZCACZB+AZB8AZB6AZB4CZB2AY93AY54AY16CYx7AYp9AYl+AYh/CYeBAYaCAYWEAYOFCYKHAYGIAYCJAX+LCX6MAX2OAnuPCX2OAX6MAX+LAYCJAoGI");

function cutterOpeningPosition(age: number, entryX = 144 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 144;
  const traced = CUTTER_OPENING_TRACE_NES[Math.round(frame)];
  if (traced) return [(traced[0] + laneOffset) * NES_WORLD_X_SCALE, traced[1] * NES_WORLD_Y_SCALE];
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
const CUTTER_COMBAT_TRACE_NES = decodeCoordinateRuns("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");
// Sparse samples use combat-relative frames; the source trace includes the entry.
const CUTTER_COMBAT_PATH_EXTENDED_NES = [...CUTTER_COMBAT_PATH_NES, [3328, 168, 85], [3392, 132, 40], [3456, 118, 57], [3520, 95, 85], [3584, 130, 85], [3600, 130, 85], [4096, 146, 104], [4608, 77, 93], [5120, 169, 65], [5632, 70, 58], [6144, 114, 74], [6656, 152, 93], [7168, 121, 81], [7680, 218, 46], [8192, 210, 111], [8704, 129, 102], [9216, 126, 116], [9728, 59, 41], [10240, 122, 59], [10752, 79, 97], [11264, 104, 61], [11776, 57, 61], [12000, 41, 72]] as const;

function cutterCombatPosition(age: number, entryX = 144 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE - CUTTER_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 144;
  const traced = CUTTER_COMBAT_TRACE_NES[Math.round(frame)];
  if (traced) return [(traced[0] + laneOffset) * NES_WORLD_X_SCALE, traced[1] * NES_WORLD_Y_SCALE];
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

const DEVIL_HAWK_OPENING_TRACE_NES = decodeCoordinateRuns("CNAAAdACAdAEAdAGCdAIAdAKAdAMAdAOCdAQAdASAdAUAdAWCdAYAdAaAdAcAdAeCdAgAdAiAdAkAdAmCdAoAdAqAdAsAdAuCdAwAdAyAdA0AdA2CdA4AdA6AdA8AdA+CNBAAdBCAdBEAdBGCdBIAdBKAdBMAdBOCdBQAdBSAdBUAdBWCdBYAdBaAdBcAdBeAdBg");

export function devilHawkOpeningY(age: number): number {
  const frame = Math.max(0, Math.min(DEVIL_HAWK_OPENING_TRACE_NES.length - 1, Math.round(age * NES_FRAME_RATE)));
  return DEVIL_HAWK_OPENING_TRACE_NES[frame]![1] * NES_WORLD_Y_SCALE;
}

export function devilHawkAttackDelay(age: number): number {
  const frame = Math.round(age * NES_FRAME_RATE);
  const next = DEVIL_HAWK_ATTACK_FRAMES.find((at) => at > frame) ?? frame + Math.round(DEVIL_HAWK_VOLLEY_INTERVAL * NES_FRAME_RATE);
  return Math.max(1, next - frame) / NES_FRAME_RATE;
}
// Complete integer X/Y samples from the unhurt Round 3 Boss trace. The ROM
// updates these coordinates in coarse steps, so the runtime preserves them.
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
const DEVIL_HAWK_COMBAT_TRACE_NES = decodeCoordinateRuns("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");
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
  const traced = DEVIL_HAWK_COMBAT_TRACE_NES[Math.round(frame)];
  if (traced) return traced[1] * NES_WORLD_Y_SCALE;
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
  const traced = DEVIL_HAWK_COMBAT_TRACE_NES[Math.round(frame)];
  if (traced) return (traced[0] + laneOffset) * NES_WORLD_X_SCALE;
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

const FATMAN_JOE_OPENING_TRACE_NES = decodeCoordinateRuns("CJgAAZgCAZgEAZgGCZgIAZgKAZgMAZgOCZgQAZgSAZgUAZgWCZgYAZgaAZgcAZgeCZggAZgiAZgkAZgmCZgoAZgqAZgsAZguCZgwAZgyAZg0AZg2CZg4AZg6AZg8AZg+CJhAAZhCAZhEAZhGCZhIAZhKAZhMAZhOCZhQAZhSAZhUAZhWCZhYAZhaAZhcAZheCZhgAZhiAZhkAZhmCZhoAZhqAZhsAZhuBJhw");

export function fatmanJoeOpeningY(age: number): number {
  const frame = Math.max(0, Math.round(age * NES_FRAME_RATE));
  const traced = FATMAN_JOE_OPENING_TRACE_NES[frame];
  return traced ? traced[1] * NES_WORLD_Y_SCALE : frame >= FATMAN_JOE_ENTRY_DURATION * NES_FRAME_RATE ? FATMAN_JOE_ENTRY_END_Y : 0;
}
const FATMAN_JOE_COMBAT_PATH_NES = [[0, 152, 112], [16, 152, 120], [32, 152, 136], [48, 152, 142], [64, 152, 134], [80, 152, 124], [96, 152, 124], [112, 139, 93], [128, 133, 94], [144, 125, 89], [160, 117, 89], [176, 110, 89], [192, 98, 89], [208, 90, 89], [224, 84, 89], [240, 73, 85], [256, 68, 78], [272, 63, 73], [288, 58, 67], [304, 58, 67], [320, 58, 73], [336, 58, 123], [352, 58, 169], [368, 74, 120], [384, 102, 91], [400, 114, 85], [416, 121, 77], [432, 128, 71], [448, 128, 85], [464, 123, 79], [480, 117, 72], [496, 117, 72], [512, 127, 41], [528, 136, 41], [544, 136, 41], [560, 127, 53], [576, 122, 58], [592, 115, 58], [608, 102, 58], [624, 102, 58], [640, 102, 64], [656, 102, 80], [672, 102, 154], [688, 103, 154], [704, 118, 74], [720, 132, 55], [730, 132, 55], [794, 130, 49], [858, 121, 67], [922, 120, 71], [986, 118, 68], [1050, 121, 42], [1114, 120, 56], [1178, 118, 55], [1242, 100, 69], [1306, 123, 61], [1370, 120, 127], [1434, 120, 51], [1498, 106, 52], [1562, 106, 98], [1626, 121, 61], [1690, 121, 61], [1754, 121, 49], [1818, 121, 56], [1882, 121, 83], [1946, 121, 53], [2010, 121, 75], [2074, 121, 81], [2138, 121, 56], [2202, 117, 98], [2266, 115, 81], [2330, 140, 42], [2394, 120, 66], [2458, 93, 83], [2522, 67, 73], [2586, 100, 67], [2650, 106, 67], [2714, 72, 67], [2778, 90, 95], [2842, 94, 101], [2906, 76, 68], [2970, 57, 46], [3034, 71, 70], [3098, 95, 99], [3162, 108, 115], [3226, 108, 115], [3290, 122, 79], [3354, 108, 46], [3418, 68, 46]] as const;
const FATMAN_JOE_COMBAT_TRACE_NES = decodeCoordinateRuns("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");
const FATMAN_JOE_COMBAT_PATH_EXTENDED_NES = [...FATMAN_JOE_COMBAT_PATH_NES, [3488, 112, 67], [3520, 108, 46], [3552, 88, 46], [3584, 75, 46], [3600, 61, 46], [4096, 166, 78], [4608, 138, 45], [5120, 122, 80], [5632, 172, 50], [6144, 124, 66], [6656, 113, 149], [7168, 98, 60], [7680, 117, 108], [8192, 121, 46], [8704, 68, 102], [9216, 110, 47], [9728, 151, 55], [10240, 123, 89], [10752, 113, 43], [11264, 156, 55], [11776, 134, 113], [12000, 191, 43]] as const;

function fatmanJoeCombatPosition(age: number, entryX = 152 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE - FATMAN_JOE_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 152;
  const toWorldX = (x: number): number => clamp((x + laneOffset) * NES_WORLD_X_SCALE, ...fatmanJoeArenaXBounds());
  const traced = FATMAN_JOE_COMBAT_TRACE_NES[Math.round(frame)];
  if (traced) return [toWorldX(traced[0]), traced[1] * NES_WORLD_Y_SCALE];
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

const WINGATE_PHASE0_TRACE_NES = decodeCoordinateRuns("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CWszAWkzAWgzAWYzCWQzAWMzAWEzAV8zCV4zAVwzAVozAVkzCVczAVUzAVQzAVIzCVAzAU8zAU0zAUszCUozAUgzAUczAUUzCUMzAUQyAUYwAUcvCUgtAUksAUorAUspCUwoAU4mAUwkAUshAUogAUkeAUgdAUcdAUYdAUQeAUMgAUIiAUEmAUApAT8uAT0yATw0Ajs1AT0xAT4uAUArAUIoAUMnAUUlAUYlAUgkAUolAUsnAU0pAU8rAVAvAVIyAVMzAlUzAVczAVg0CVo0AVw0AV01AV81UWA2AV82AV02AVw2CVo2AVg2AVc2AVU2CVM2AVI2AVA2AU42CU02AUs2AUk2AUg2CUY2AUg2AUk2AUs2CU02AU42AVA2AVI2CVM2AVU2AVc2AVg2CVo2AVw2AV02AV82CWA2AWI2AWQ2AWU2CWc2AWk2AWo2AWw2CW42AW00AWszAWoxCWkwAWgvAWctAWYsCWQqAWMpAWInAWMlAWQiAWYhAWcfAWgfAWkeAWoeAWsfAW0hAW4kAW8nAXAqAXEvAXIzAXQ1AnU2AXYzAXcxAXgvAXkuAXotAXwsAX0tAX4tAX8wAYAyAYE1AYM5AYQ9AYVCAYZDAodEAYhGCYlHAYtJAYxKAY1MCY5NAY5PAY5RAY5TCY5VAY5XAY5ZAY5bCY5dAY5fAY5hAY5jAY5dAY5XAY5SAY5NAY5JAY5FAY5CAY4/AY4+A449AY4+AY4/AY49Ao47AY04AYs0AYoyAYgwAYcvAYUuAYMtAYItAYAvAX8xAX00AXw2AXo6AXk+AXc/AnY/CXRAAXNBAXFCAXBDCW5DAW1EAWtFAWpGCWhGAWdHAWVIAWNJCWJKAWBKAV9LAV1MCVxNAVpNAVlOAVdPCVZQAVdQAVlQAVtQCVxQAV5QAWBQAWFQCWNQAWROAWVNAWZMCWhKAWlJAWpHAWtGCWxFAWtFAWlFAWdFCWZFAWRFAWJFAWFFCV9FAWBDAWFCAWJACWQ/AWU+AWY8AWc7CWg5AWk7AWs8AWw+CW0/AW5AAW9CAXBDCXJFAXNGAXRHAXVJCXZKAXdMAXhNAXpOCXtQAXlQAXdQAXZQCXRQAXJQAXFQAW9QCW5QAWxQAWpQAWlQCWdQAWVQAWRQAWJQCWBQAV9QAV1QAVtQCVpQAVhQAVZQAVVQCVNQAVFQAVBQAU5QCUxQAUtQAUlQAUdQCUZQAUZSAUZUAUZWCUZYAUZaAUZcAUZeCUZgAUZiAUZcAUZWAUZRAUZMAUZIAUZEAUZBAUY+AUY9A0Y8AUY9AUY+AUY8AkY6AUc2AUkyAUsvAUwsAU4qAVAoAVEnAVMmAVUnAVYoAVgqAVosAVsvAV0yAV8yAmAyAWIyAWQyCWUyAWcyAWkyAWoyCWwyAW4yAW8yAXEyCXIyAXQyAXYyAXcyCXkyAXsyAXwyAX4yCYAyAYEyAYMyAYUyCYYyAYgyAYoyAYsyCY0yAY8yAZAyAZIyCZQyAZUyAZcyAZkyCZoyAZwyAZ4yAZ8yCaEyAaMyAaQyAaYyCacyAakyAasyAawyaa4yAawyAasyAakyCacyAaYyAaQyAaMyCaEyAZ8yAZ4yAZwyCZoyAZkyAZcyAZUyCZQyAZIyAZAyAY8yCY0yAYsyAYoyAYgyCYYyAYgwAYkvAYouCYssAYwrAY0pAY4oAZAnAY4kAY0hAYwgAYseAYoeAYkdAYgdAYYeAYUgAYQjAYMmAYIpAYEuAX8y");
const WINGATE_PHASE1_TRACE_NES = decodeCoordinateRuns("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");
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
  romTrace?: readonly (readonly [number, number])[];
};

export function createWingateMovementState(x: number, phase = 0, exact = false): WingateMovementState {
  const [fineX, fineY] = WINGATE_INITIAL_FINE[phase > 0 ? 1 : 0];
  return { frame: 0, mode: "entry", x: x + fineX / 256, y: fineY / 256, heading: 0x50, segmentFrames: 0, gait: 0x88, correctionFrames: 0, correctionPass: 0, romTrace: exact ? phase === 0 ? WINGATE_PHASE0_TRACE_NES : WINGATE_PHASE1_TRACE_NES : undefined };
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
  const applyTrace = (): void => {
    const traced = state.romTrace?.[state.frame];
    if (traced) {
      state.x = traced[0];
      state.y = traced[1];
    }
  };
  while (state.frame < targetFrame) {
    state.frame += 1;
    applyTrace();
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
      applyTrace();
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
      applyTrace();
      continue;
    }
    if (!wingateInsideArena(state)) {
      state.heading = (state.heading + 0x10) & 0xdf;
      state.mode = "correction";
      state.correctionFrames = 16;
      state.correctionPass = 0;
    }
    applyTrace();
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
