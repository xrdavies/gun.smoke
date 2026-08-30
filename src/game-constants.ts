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

export function romObjectScreenY(age: number, originY = 0): number {
  const frame = Math.max(0, Math.round(age * NES_FRAME_RATE) - 1);
  return originY + (1 + Math.floor(frame / 3)) * NES_WORLD_Y_SCALE;
}

export function romPickupScreenY(age: number, originY = 0): number {
  return originY + Math.floor((Math.max(0, Math.round(age * NES_FRAME_RATE)) + 1) / 3) * NES_WORLD_Y_SCALE;
}

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

export function canSpawnPlayerBullet(active: number, requested = 1): boolean {
  return active + requested <= PLAYER_BULLET_CAPACITY;
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
export const SHOTGUNNER_PATH_NES = [[0, 0, 0], [64, 0, 64], [80, -5, 77], [98, -18, 82], [118, -18, 82], [119, -19, 82], [146, -33, 64], [150, -33, 60], [167, -33, 60], [227, -33, 0]] as const;
export const SHOTGUNNER_SIDE_SHOT_FRAME = 113;
export const SHOTGUNNER_SIDE_LIFETIME = 230 / NES_FRAME_RATE;
export const SHOTGUNNER_SIDE_PATH_NES = [[0, 0, 0], [69, 57, 0], [70, 57, 0], [98, 72, -18], [102, 72, -22], [122, 72, -22], [123, 72, -22], [151, 57, -41], [155, 54, -41], [229, -7, -41]] as const;

export function shotgunnerPosition(age: number, fromLeft = false): readonly [number, number] {
  const frame = Math.max(0, Math.floor(age * NES_FRAME_RATE + 1e-6));
  let x = 0;
  let y = Math.min(frame, 64);
  // The ROM holds at each state boundary before changing heading or gait.
  for (let step = 66; step <= Math.min(frame, 97); step += 1) {
    const heading = step <= 93
      ? (fromLeft ? 15 : 17) + (fromLeft ? -1 : 1) * Math.floor((step - 66) / 4)
      : fromLeft ? 8 : 24;
    const velocity = SNIPER_BULLET_VELOCITIES_NES[heading]!;
    x += velocity[0];
    y += velocity[1];
  }
  for (let step = 119; step <= Math.min(frame, 146); step += 1) {
    const heading = (fromLeft ? 7 : 25) + (fromLeft ? -1 : 1) * Math.floor((step - 119) / 4);
    const velocity = SNIPER_BULLET_VELOCITIES_NES[heading]!;
    x += velocity[0];
    y += velocity[1];
  }
  for (let step = 147; step <= Math.min(frame, 150); step += 1) y -= 1;
  for (let step = 168; step <= frame; step += 1) y -= 1;
  return [x, y];
}

export function shotgunnerSidePosition(age: number, fromLeft: boolean): readonly [number, number] {
  const frame = Math.max(0, Math.floor(age * NES_FRAME_RATE + 1e-6));
  const direction = fromLeft ? 1 : -1;
  let x = direction * Math.min(frame, 69) * (53 / 64);
  let y = 0;
  for (let step = 71; step <= Math.min(frame, 98); step += 1) {
    const heading = (fromLeft ? 7 : 25) + (fromLeft ? -1 : 1) * Math.floor((step - 71) / 4);
    const velocity = SNIPER_BULLET_VELOCITIES_NES[heading]!;
    x += velocity[0];
    y += velocity[1];
  }
  for (let step = 99; step <= Math.min(frame, 102); step += 1) y -= 1;
  for (let step = 124; step <= Math.min(frame, 151); step += 1) {
    const heading = (fromLeft ? 31 : 1) + (fromLeft ? -1 : 1) * Math.floor((step - 124) / 4);
    const velocity = SNIPER_BULLET_VELOCITIES_NES[heading]!;
    x += velocity[0];
    y += velocity[1];
  }
  for (let step = 152; step <= Math.min(frame, 155); step += 1) x += SNIPER_BULLET_VELOCITIES_NES[fromLeft ? 24 : 8]![0];
  for (let step = 157; step <= frame; step += 1) x += SNIPER_BULLET_VELOCITIES_NES[fromLeft ? 24 : 8]![0];
  return [x, y];
}
export const SNIPER_SHOT_FRAMES = [134, 224, 405, 495, 585] as const;
export const SNIPER_CODE2_SHOT_FRAMES = [134, 224, 314, 404, 495, 585] as const;
export const SNIPER_COOLDOWN = 90 / NES_FRAME_RATE;
const SNIPER_COOLDOWN_FRAMES = 90;
const SNIPER_LANE_HEADINGS = [4, 8, 12, 20, 24, 28] as const;
const SNIPER_COOLDOWN_STOP_Y_NES = 224;
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

export type SniperFiringState = { lane: number; cooldown: number };

export function createSniperFiringState(entityCode: 1 | 2, cooldown: number): SniperFiringState {
  return { lane: entityCode === 2 ? 4 : 1, cooldown: cooldown & 0xff };
}

export function advanceSniperFiring(state: SniperFiringState, frame: number, screenY: number, aimHeading: number): boolean {
  if (screenY >= SNIPER_COOLDOWN_STOP_Y_NES) return false;
  if ((frame - 1) % 61 === 0) {
    const laneHeading = SNIPER_LANE_HEADINGS[state.lane] ?? SNIPER_LANE_HEADINGS[0];
    if (state.lane > 0 && aimHeading <= laneHeading - 1) {
      state.lane -= 1;
      return false;
    }
    if (state.lane < SNIPER_LANE_HEADINGS.length - 1 && laneHeading !== 28 && aimHeading > laneHeading + 2) {
      state.lane += 1;
      return false;
    }
  }
  state.cooldown = (state.cooldown - 1) & 0xff;
  if (state.cooldown !== 0) return false;
  state.cooldown = SNIPER_COOLDOWN_FRAMES;
  return gunmanCanFire(SNIPER_LANE_HEADINGS[state.lane] ?? SNIPER_LANE_HEADINGS[0], aimHeading);
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
export const RIFLEMAN_ATTACK_TO_FIRST_SHOT_FRAMES = Math.round(RIFLEMAN_FIRST_SHOT_DELAY * NES_FRAME_RATE) - RIFLEMAN_ATTACK_STATE_FRAME;
export const RIFLEMAN_SHOT_INTERVAL = 16 / NES_FRAME_RATE;
export const RIFLEMAN_SHOTS_PER_VOLLEY = 5;
export const RIFLEMAN_LIFETIME = 308 / NES_FRAME_RATE;
export const RIFLEMAN_PATH_NES = [[0, 0], [93, 93], [94, 93], [95, 93], [183, 123], [184, 123], [307, 0]] as const;
export const RIFLEMAN_SIDE_ATTACK_STATE_FRAME = 80;
export const RIFLEMAN_SIDE_SHOT_FRAMES = [96, 112, 128, 144, 160] as const;
export const RIFLEMAN_SIDE_LIFETIME = 258 / NES_FRAME_RATE;
export const RIFLEMAN_SIDE_PATH_NES = [[0, 0, 0], [80, 65, 0], [169, 65, 30], [180, 58, 30], [240, 8, 30], [258, -7, 30]] as const;

export function riflemanCanAttack(actorY: number, playerY: number): boolean {
  const actorNesY = Math.round(actorY / NES_WORLD_Y_SCALE);
  const playerNesY = Math.round(playerY / NES_WORLD_Y_SCALE);
  return actorNesY >= 0x30 && Math.abs(playerNesY - actorNesY) < 0x60;
}

export function riflemanAttackHeadingAtStart(actorX: number, actorY: number, playerX: number, playerY: number): number | undefined {
  return riflemanCanAttack(actorY, playerY)
    ? nesAimHeading(actorX, actorY, playerX, playerY)
    : undefined;
}

export function riflemanFirstShotFrame(attackStartFrame: number): number {
  return attackStartFrame + RIFLEMAN_ATTACK_TO_FIRST_SHOT_FRAMES;
}

const RIFLEMAN_SHOT_HEADINGS = [[20, 22, 20, 18, 20], [16, 18, 16, 14, 16], [12, 14, 12, 10, 12]] as const;

export function riflemanShotHeading(aimHeading: number, shotIndex: number): number {
  const group = aimHeading >= 18 ? 0 : aimHeading >= 14 ? 1 : 2;
  return RIFLEMAN_SHOT_HEADINGS[group][shotIndex % RIFLEMAN_SHOTS_PER_VOLLEY] ?? 16;
}

export function riflemanPosition(age: number): readonly [number, number] {
  const frame = Math.max(0, Math.floor(age * NES_FRAME_RATE + 1e-6));
  if (frame <= 93) return [0, frame];
  if (frame <= 95) return [0, 93];
  if (frame <= 183) return [0, 93 + Math.floor((frame - 93) / 3)];
  return [0, Math.max(0, 123 - (frame - 184))];
}

export function riflemanSidePosition(age: number, fromLeft: boolean): readonly [number, number] {
  const frame = Math.max(0, Math.floor(age * NES_FRAME_RATE + 1e-6));
  const direction = fromLeft ? 1 : -1;
  const inwardFrames = Math.min(frame, 79);
  const retreatFrames = Math.max(0, frame - 170);
  const x = (inwardFrames - retreatFrames) * (53 / 64);
  const y = frame < 80 ? 0 : Math.min(30, Math.floor((frame - 78) / 3));
  return [x * direction, y];
}
export const NINJA_FIRST_SHOT_DELAY = 103 / NES_FRAME_RATE;
export const NINJA_PROJECTILE_SPEED = 300;
export const NINJA_LIFETIME = 303 / NES_FRAME_RATE;
export const NINJA_ACTIVATION_DISTANCE_NES = 64;
export const NINJA_ATTACK_MOVE_DURATION = 15 / NES_FRAME_RATE;
export const NINJA_ENTRY_PATH_NES = [[0, 0], [16, 32], [36, 32], [83, 126], [103, 126]] as const;
export const NINJA_ACTION_DELAY_FRAMES = 20;
const NINJA_ATTACK_HEADINGS = [0xc0, 0x50, 0x50, 0x50, 0x50, 0x10, 0x10, 0xc0, 0xc0, 0xc0, 0x00, 0x00, 0x00, 0x40, 0x40, 0x80, 0xc0] as const;

export type NinjaState = {
  frame: number;
  mode: "entry" | "hold" | "seek" | "decide" | "attack" | "roam";
  nextMode: "seek" | "decide" | "attack" | "roam";
  wait: number;
  remaining: number;
  heading: number;
  randomThreshold: number;
  x: number;
  y: number;
  dead: boolean;
};

export function createNinjaState(x: number, y: number, fineX = 0, fineY = 0): NinjaState {
  return { frame: 0, mode: "entry", nextMode: "seek", wait: 0, remaining: 0, heading: 0x50, randomThreshold: 0xc0, x: x + fineX / 256, y: y + fineY / 256, dead: false };
}

export function advanceNinja(state: NinjaState, targetFrame: number, playerX: number, playerY: number, blocked: (probeX: number, probeY: number) => boolean, randomByte: () => number): { readonly shots: readonly number[]; readonly dead: boolean } {
  const shots: number[] = [];
  const chooseAction = (delayed: boolean): void => {
    if (randomByte() <= state.randomThreshold) {
      state.heading = state.x < 128 ? 0x84 : 0x9c;
      state.remaining = 16;
      state.nextMode = "attack";
    } else {
      state.heading = 0x40 | nesAimHeading(state.x * NES_WORLD_X_SCALE, state.y * NES_WORLD_Y_SCALE, playerX * NES_WORLD_X_SCALE, playerY * NES_WORLD_Y_SCALE);
      state.remaining = 16;
      state.nextMode = "roam";
    }
    state.randomThreshold = 0x40;
    state.mode = delayed ? "hold" : state.nextMode;
    state.wait = delayed ? NINJA_ACTION_DELAY_FRAMES : 0;
  };
  const outsideScreen = (): boolean => state.x < 0 || state.x >= 256 || state.y < 0 || state.y >= ROM_SCREEN_RELEASE_Y_NES;

  while (state.frame < targetFrame && !state.dead) {
    state.frame += 1;
    if (state.mode === "entry") {
      state.y += 2;
      if (state.y >= 32) {
        state.y = 32 + (state.y - Math.floor(state.y));
        state.mode = "hold";
        state.nextMode = "seek";
        state.wait = NINJA_ACTION_DELAY_FRAMES;
      }
      continue;
    }
    if (state.mode === "hold") {
      state.wait -= 1;
      if (state.wait === 0) state.mode = state.nextMode;
      continue;
    }
    if (state.mode === "seek") {
      state.y += 2;
      if (outsideScreen()) state.dead = true;
      else if (Math.abs(Math.round(playerY) - Math.round(state.y)) < NINJA_ACTIVATION_DISTANCE_NES) chooseAction(true);
      continue;
    }
    if (state.mode === "decide") {
      moveEncodedHeading(state, state.heading);
      if (outsideScreen()) state.dead = true;
      else chooseAction(false);
      continue;
    }
    if (state.mode === "attack") {
      moveEncodedHeading(state, state.heading);
      moveEncodedHeading(state, NINJA_ATTACK_HEADINGS[state.remaining] ?? 0xc0);
      if (state.remaining === 16) shots.push(nesAimHeading(state.x * NES_WORLD_X_SCALE, state.y * NES_WORLD_Y_SCALE, playerX * NES_WORLD_X_SCALE, playerY * NES_WORLD_Y_SCALE));
      state.remaining -= 1;
      if (outsideScreen()) state.dead = true;
      else if (state.remaining === 0) {
        state.mode = "hold";
        state.nextMode = "decide";
        state.wait = NINJA_ACTION_DELAY_FRAMES;
      }
      continue;
    }
    moveEncodedHeading(state, state.heading);
    state.remaining -= 1;
    const [probeX, probeY] = nesActorCollisionProbeOffset(state.heading);
    if (outsideScreen()) state.dead = true;
    else if (blocked(Math.floor(state.x) + probeX, Math.floor(state.y) + probeY)) {
      state.mode = "hold";
      state.nextMode = "decide";
      state.wait = NINJA_ACTION_DELAY_FRAMES;
    } else if (state.remaining === 0) {
      state.mode = "hold";
      state.nextMode = "decide";
      state.wait = NINJA_ACTION_DELAY_FRAMES;
    }
  }
  return { shots, dead: state.dead };
}

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

export function createHatchetState(x: number, y = 0, fineX = 0, fineY = 0): HatchetState {
  return { frame: 0, mode: "entry", wait: 0, heading: x < 128 ? 8 : 24, turn: 0, mirrored: x >= 128, lowerArc: false, attackLocked: false, aimHeading: 16, animationPhase: 1, x: x + fineX / 256, y: y + fineY / 256 };
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

export function createFirebreatherState(x: number, y: number, heading: number, fineX = 0, fineY = 0): FirebreatherState {
  return { frame: 0, mode: "entry", wait: FIREBREATHER_ENTRY_FRAMES, heading: heading & 31, nextDecision: Math.round(FIREBREATHER_FIRST_DECISION_DELAY * NES_FRAME_RATE), x: x + fineX / 256, y: y + fineY / 256 };
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

export function createSpearState(x: number, y: number, sideEntry: boolean, fineX = 0, fineY = 0): SpearState {
  return {
    frame: 0,
    mode: "entry",
    remaining: sideEntry ? SPEAR_SIDE_ENTRY_FRAMES : SPEAR_TOP_ENTRY_FRAMES,
    heading: sideEntry ? x >= 128 ? 0x58 : 0x48 : 0x10,
    reverseAtEnd: true,
    x: x + fineX / 256,
    y: y + 1 + fineY / 256,
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

export const BACKSTABBER_AMBUSH_DEPTH_NES = 178;
export const BACKSTABBER_AMBUSH_DEPTH = BACKSTABBER_AMBUSH_DEPTH_NES * NES_WORLD_Y_SCALE;
export const BACKSTABBER_AMBUSH_LIFETIME = 532 / NES_FRAME_RATE;

export function backstabberAmbushY(age: number, fineY = 0): number {
  const frame = Math.max(0, Math.round(age * NES_FRAME_RATE));
  return (Math.min(BACKSTABBER_AMBUSH_DEPTH_NES, 1 + Math.floor(frame / 3)) + fineY) * NES_WORLD_Y_SCALE;
}
export type BackstabberRaidState = {
  frame: number;
  mode: "move" | "wait";
  segment: number;
  remaining: number;
  wait: number;
  heading: number;
  arcHeading: number;
  increasingArc: boolean;
  x: number;
  y: number;
  dead: boolean;
};

export function createBackstabberRaidState(x: number, y: number, playerX: number, playerY: number, fineX = 0, fineY = 0): BackstabberRaidState {
  return {
    frame: 0,
    mode: "move",
    segment: 1,
    remaining: 64,
    wait: 0,
    heading: nesAimHeading(x * NES_WORLD_X_SCALE, y * NES_WORLD_Y_SCALE, playerX * NES_WORLD_X_SCALE, playerY * NES_WORLD_Y_SCALE),
    arcHeading: 0x40,
    increasingArc: x < 128,
    x: x + fineX / 256,
    y: y + fineY / 256,
    dead: false,
  };
}

export function advanceBackstabberRaid(state: BackstabberRaidState, targetFrame: number): void {
  while (state.frame < targetFrame && !state.dead) {
    state.frame += 1;
    const waited = state.mode === "wait";
    if (state.mode === "move") {
      moveEncodedHeading(state, state.heading & 0xdf);
      moveEncodedHeading(state, state.arcHeading);
      state.remaining -= 1;
      if (state.remaining % 4 === 0) {
        state.arcHeading = (state.arcHeading + (state.increasingArc ? 1 : 31)) & 0xdf;
      }
      if (state.remaining === 0) {
        state.mode = "wait";
        state.wait = 1;
      }
    } else if (state.wait >= 30) {
      state.mode = "move";
      state.segment += 1;
      state.remaining = 64;
      state.arcHeading = state.segment === 2 ? 0 : 0x40;
      state.wait += 1;
    } else {
      state.wait += 1;
    }
    if (waited && state.frame % 3 === 0) state.y += 1;
    state.dead = state.x < 0 || state.x >= 256 || state.y < 0 || state.y >= ROM_SCREEN_RELEASE_Y_NES;
  }
}

export const GUNMAN_SHOT_OPPORTUNITY_INTERVAL = 64 / NES_FRAME_RATE;
export const GUNMAN_LIFETIME = 560 / NES_FRAME_RATE;
// The measured center route releases at 549; side routes are kept at the
// existing 560-frame pool cap until their player-relative retreat is traced.
export const GUNMAN_TOP_LIFETIMES_FRAMES = { center: 549, left: 828, right: 1196 } as const;
export const GUNMAN_ENTRY_PATH_NES = [[0, 0], [40, 53], [100, 128], [104, 132]] as const;
export const GUNMAN_BOTTOM_BRANCH_FRAME = 50;
export const GUNMAN_BOTTOM_DYNAMIC_HANDOFF_FRAME = 48;
export const GUNMAN_BOTTOM_NEAR_DISTANCE_NES = 56;
export const GUNMAN_BOTTOM_SHOT_FRAMES = { near: [219], far: [241] } as const;
export const GUNMAN_BOTTOM_LIFETIMES = { near: 318 / NES_FRAME_RATE, far: 479 / NES_FRAME_RATE } as const;
const GUNMAN_BOTTOM_PATHS_NES = {
  near: [[0, 0, 0], [1, 0, 248], [49, 0, 201], [80, -25, 201], [105, -44, 196], [110, -45, 191], [120, -38, 188], [130, -31, 192], [157, -23, 167], [190, -3, 147], [219, 16, 159], [240, 23, 180], [274, 34, 211], [300, 42, 235], [317, 47, 251]],
  far: [[0, 0, 0], [1, 0, 248], [49, 0, 201], [63, -9, 198], [105, -15, 157], [177, -26, 88], [200, -35, 100], [241, -41, 139], [264, -45, 161], [274, -52, 160], [283, -53, 161], [300, -45, 147], [350, -22, 106], [400, 1, 64], [450, 23, 23], [478, 36, 0]],
} as const;

export const GUNMAN_FLANK_SHOT_FRAMES = { 7: [64, 410], 8: [309], 9: [399, 463] } as const;
const GUNMAN_FLANK_EVENT_SHOT_FRAMES: Readonly<Record<string, readonly number[]>> = {
  "4:95:120": [22],
  "4:127:120": [13, 585],
  "4:159:120": [64],
  "4:159:216": [28, 746, 1002],
  "4:191:216": [23, 279, 970],
  "4:207:152": [19],
  "4:223:216": [13, 269],
  "4:239:152": [13, 205],
  "5:1679:248": [73, 393],
  "5:31:168": [70, 134],
  "5:47:192": [40, 104, 296],
  "5:207:136": [13, 269, 525, 845, 973, 1037],
  "5:255:216": [],
  "5:511:88": [],
  "5:559:64": [13, 333],
  "5:575:88": [77, 333, 397],
  "5:623:184": [13, 333],
  "5:959:216": [296, 616, 848, 912, 976],
  "5:1311:32": [225],
  "5:1311:88": [212],
  "5:1535:216": [13, 333],
  "5:1631:152": [33, 161],
  "5:1647:120": [13, 397],
  "5:1727:56": [168],
  "5:1759:88": [57],
  "5:1871:48": [437],
  "5:1967:56": [167],
  "5:1887:24": [38, 358],
  "5:1999:64": [69],
  "5:2015:88": [50, 370, 562],
  "5:2095:184": [13, 792, 920],
  "5:2095:208": [65, 321],
  "5:2095:240": [105, 361],
  "5:2175:208": [13],
  "5:2207:224": [92],
  "5:2287:224": [18, 338, 402],
  "5:2463:40": [13, 269, 333, 461, 589],
  "5:2655:208": [26],
  "5:2671:184": [13],
  "5:2735:104": [55],
  "5:2735:160": [28],
  "5:2879:24": [20],
  "5:2895:104": [56],
  "5:2895:192": [42, 362],
  "5:2911:128": [37],
  "5:2911:160": [64],
  "5:2911:184": [13, 397],
  "5:3023:168": [33, 225],
  "5:3023:248": [93],
  "5:639:136": [45],
  "5:655:88": [],
  "5:1775:112": [35],
  "5:879:208": [23],
  "6:47:168": [24],
  "6:63:184": [29],
  "6:239:176": [36],
  "6:2447:184": [13, 397, 717],
  "6:3727": [68, 132, 196, 719, 847, 911],
  "6:4415": [13, 397],
  "6:4479": [29],
  "6:4511:152": [63],
  "6:4511:168": [13],
  "6:4575": [158],
  "6:815": [187],
  "6:831": [],
  "6:1007": [],
  "6:1023": [65],
  "6:1167": [],
  "6:1231": [],
  "6:1279:112": [],
  "6:1279:136": [19, 403, 659],
  "6:1375:4": [45, 109, 173, 237],
  "6:1375:136": [],
  "6:1311": [],
  "6:1535:120": [],
  "6:1535:184": [],
  "6:4751:40": [],
  "6:4783:200": [22],
  "6:4911:128": [47],
  "6:4975:96": [21],
  "6:5087:80": [13],
  "6:5103:96": [32],
  "6:863:128": [66],
  "6:943:144": [76, 268],
  "6:975:224": [33, 481],
  "6:991:184": [13],
  "6:1407:104": [55, 443],
  "6:1391:120": [75],
  "6:1455:128": [63],
  "6:1631:80": [48],
  "6:175:152": [],
  "6:191:168": [],
  "6:447:104": [],
  "6:479:168": [],
  "6:559:104": [191],
  "6:847:160": [61],
  "6:1871:184": [57, 313],
  "6:1903:152": [57],
  "6:2015:104": [13],
  "6:2015:128": [37],
  "6:207": [79, 143, 207],
  "6:511": [54, 118, 182],
  "6:607": [75, 139],
  "6:1135:4": [64],
  "6:1135:248": [80, 400],
  "6:2207:88": [423, 615],
  "6:2207:120": [423],
  "6:2255:112": [76, 268],
  "6:2479:152": [64],
  "6:2623:128": [13],
  "6:2687:136": [77],
  "6:2735:184": [13],
  "6:2287:104": [39, 487],
  "6:2751:88": [40, 104, 168, 232, 296],
  "6:2879:120": [],
  "6:3951:104": [133],
  "6:4079:104": [926, 1246],
  "6:4335:168": [],
  "6:3215:96": [16],
  "6:3951:96": [15, 271, 463],
  "6:543:88": [13, 397],
  "6:5119": [],
  "6:4623:88": [69],
  "6:4623:168": [],
  "6:4639": [193],
  "6:4639:144": [13],
};
export const GUNMAN_FLANK_LIFETIMES = { 7: 642 / NES_FRAME_RATE, 8: 508 / NES_FRAME_RATE, 9: 826 / NES_FRAME_RATE } as const;
export const GUNMAN_FLANK_INITIAL_STATE_FRAMES = 250;
const GUNMAN_FLANK_ENTRY_FRAMES = 48;
const GUNMAN_FLANK_LUNGE_FRAMES = 51;
const GUNMAN_FLANK_NEAR_DISTANCE_NES = 56;
const GUNMAN_FLANK_SIDE_TRIGGER_DISTANCE_NES = 101;
const GUNMAN_FLANK_LUNGE_HEADINGS = [0x90, 0x8f, 0x4e, 0x4d, 0x4c, 0x4b, 0x0a, 0x09, 0x08, 0x07, 0x46, 0x45, 0x44] as const;

// ponytail: web actors start with neutral subpixels; persist per-slot fine bytes when remaining parity requires it.
export type GunmanFlankMovementState = {
  frame: number;
  mode: "entry" | "side" | "lunge" | "chase" | "orbit" | "roam";
  timer: number;
  heading: number;
  orbitDirection: 0 | 1;
  orbitPassedDown: boolean;
  fromRight: boolean;
  x: number;
  y: number;
  dead: boolean;
};

export function gunmanFlankUsesDynamicState(entityCode: 7 | 8 | 9, originY: number, stage: number, phase: number, eventAt?: number, fromRight = false): boolean {
  if (stage === 5 && entityCode === 7 && [1679, 1759, 1903, 1999, 2735].includes(eventAt ?? -1)) return true;
  if (stage === 4 && entityCode === 7 && [1503, 1695, 1727, 1743, 2527].includes(eventAt ?? -1)) return true;
  if (stage === 3 && entityCode === 7 && [255, 319, 687, 959, 1647, 1711, 4239, 4255, 4831, 4863].includes(eventAt ?? -1)) return true;
  if (stage === 3 && entityCode === 8 && [1071, 1119, 3775, 3823].includes(eventAt ?? -1)) return true;
  if (stage === 6 && entityCode === 8 && (eventAt === 159 || eventAt === 207 || eventAt === 607 || eventAt === 2207 || eventAt === 2943 || eventAt === 3023 || eventAt === 3727 || eventAt === 5119 || eventAt === 1375)) return true;
  if (stage === 6 && entityCode === 9 && (eventAt === 511 || eventAt === 2783 || eventAt === 3919)) return true;
  if (stage === 6 && entityCode === 7 && eventAt === 1135 && Math.round(originY) === 32) return true;
  if (stage === 6 && entityCode === 7 && eventAt === 4543) return true;
  if (stage === 6 && entityCode === 7 && Math.round(originY) === 64 && fromRight) return true;
  if (stage !== 2 || entityCode === 7 && Math.round(originY) === 0 && phase === 1) return false;
  if (entityCode === 7) return ![351, 399, 1135, 1167, 1231, 1407, 1903, 1967, 2671].includes(eventAt ?? -1);
  if (entityCode === 8) return ![207, 623, 655, 1599].includes(eventAt ?? -1);
  return ![911, 943, 975, 1807].includes(eventAt ?? -1);
}

export function createGunmanFlankMovementState(entityCode: 7 | 8 | 9, x: number, y: number, fromRight: boolean, fineX = 0, fineY = 0): GunmanFlankMovementState {
  return {
    frame: 0,
    mode: entityCode === 7 ? "entry" : "side",
    timer: entityCode === 7 ? GUNMAN_FLANK_ENTRY_FRAMES : 0,
    heading: fromRight ? 24 : 8,
    orbitDirection: 1,
    orbitPassedDown: false,
    fromRight,
    x: x + (entityCode === 7 ? 0 : fromRight ? -1 : 1) + fineX / 256,
    y: y + 1 + fineY / 256,
    dead: false,
  };
}

export function gunmanBottomUsesDynamicState(stage: number, eventAt?: number, originX?: number): boolean {
  if (stage === 5 && eventAt === 655) return true;
  if (stage === 5 && eventAt === 1871) return Math.round(originX ?? -1) === 48;
  if (stage === 5 && (eventAt === 255 || eventAt === 511 || eventAt === 959 || eventAt === 1311 || eventAt === 1727 || eventAt === 1967)) return true;
  return stage === 6 && (eventAt === 175 || eventAt === 191 || eventAt === 447 || eventAt === 479 || eventAt === 559 || eventAt === 847 || eventAt === 3055 || eventAt === 3327 || eventAt === 3951 || eventAt === 4079 || eventAt === 4319 || eventAt === 4335 || eventAt === 4575 || eventAt === 4623 || eventAt === 4639 || eventAt === 4751 || eventAt === 815 || eventAt === 831 || eventAt === 1007 || eventAt === 1023 || eventAt === 1167 || eventAt === 1231 || eventAt === 1279 || eventAt === 1311 || eventAt === 1375 || eventAt === 1535 || eventAt === 2207 || eventAt === 2479 || eventAt === 2879);
}

export function gunmanBottomFirstOpportunityFrame(seed: number, stage: number, eventAt?: number): number {
  return stage === 6 && eventAt === 3327 ? 232 : gunmanFirstOpportunityFrame(seed, 0);
}

export function gunmanBottomDynamicPosition(age: number, originX: number, fineX = 0, fineY = 0): readonly [number, number] {
  const frame = Math.max(0, Math.round(age * NES_FRAME_RATE));
  const y = frame >= GUNMAN_BOTTOM_DYNAMIC_HANDOFF_FRAME ? 218 : 249 - Math.ceil(frame * 2 / 3);
  return [(originX + fineX / 256) * NES_WORLD_X_SCALE, (y + fineY / 256) * NES_WORLD_Y_SCALE];
}

export function createGunmanBottomMovementState(x: number, fineX = 0, fineY = 0): GunmanFlankMovementState {
  return {
    frame: GUNMAN_BOTTOM_DYNAMIC_HANDOFF_FRAME,
    mode: "chase",
    timer: 0,
    heading: 0,
    orbitDirection: 1,
    orbitPassedDown: false,
    fromRight: false,
    x: x + fineX / 256,
    y: 218 + fineY / 256,
    dead: false,
  };
}

export function gunmanTopUsesDynamicState(stage: number, eventAt?: number): boolean {
  if (stage === 4 && (eventAt === 95 || eventAt === 127 || eventAt === 159 || eventAt === 191 || eventAt === 207 || eventAt === 223 || eventAt === 239)) return true;
  if (stage === 5 && (eventAt === 31 || eventAt === 47 || eventAt === 207 || eventAt === 559 || eventAt === 575 || eventAt === 623 || eventAt === 639 || eventAt === 879 || eventAt === 1535 || eventAt === 1631 || eventAt === 1647 || eventAt === 1759 || eventAt === 1775 || eventAt === 1887 || eventAt === 1999 || eventAt === 2015 || eventAt === 2095 || eventAt === 2175 || eventAt === 2207 || eventAt === 2287 || eventAt === 2463 || eventAt === 2655 || eventAt === 2671 || eventAt === 2735 || eventAt === 2879 || eventAt === 2895 || eventAt === 2911 || eventAt === 3023)) return true;
  return stage === 6 && (eventAt === 47 || eventAt === 63 || eventAt === 239 || eventAt === 2255 || eventAt === 2287 || eventAt === 2447 || eventAt === 2623 || eventAt === 2687 || eventAt === 2735 || eventAt === 2751 || eventAt === 3215 || eventAt === 3295 || eventAt === 3487 || eventAt === 3551 || eventAt === 3711 || eventAt === 3951 || eventAt === 4415 || eventAt === 4479 || eventAt === 4511 || eventAt === 4623 || eventAt === 4639 || eventAt === 4783 || eventAt === 4911 || eventAt === 4975 || eventAt === 5087 || eventAt === 5103 || eventAt === 543 || eventAt === 863 || eventAt === 943 || eventAt === 975 || eventAt === 991 || eventAt === 1279 || eventAt === 1391 || eventAt === 1407 || eventAt === 1455 || eventAt === 1631 || eventAt === 1871 || eventAt === 1903 || eventAt === 2015);
}

export function createGunmanTopMovementState(x: number, fineX = 0, fineY = 0): GunmanFlankMovementState {
  return {
    frame: 0,
    mode: "entry",
    timer: GUNMAN_FLANK_ENTRY_FRAMES,
    heading: 16,
    orbitDirection: 1,
    orbitPassedDown: false,
    fromRight: false,
    x: x + fineX / 256,
    y: 1 + fineY / 256,
    dead: false,
  };
}

export function gunmanFlankMovementFacingHeading(state: GunmanFlankMovementState): number {
  return state.mode === "side" ? 16 : state.heading & 31;
}

export function advanceGunmanFlankMovement(
  state: GunmanFlankMovementState,
  targetFrame: number,
  playerX: number,
  playerY: number,
  blocked: (probeX: number, probeY: number) => boolean,
): void {
  const move = (heading = state.heading): void => moveEncodedHeading(state, heading & 0xdf);
  const outsideScreen = (): boolean => state.x < 0 || state.x >= 256 || state.y < 0 || state.y >= ROM_SCREEN_RELEASE_Y_NES;
  const probeBlocked = (heading: number, xOffset = 0): boolean => {
    const [probeX, probeY] = nesActorCollisionProbeOffset(heading);
    return blocked((Math.floor(state.x) + xOffset + probeX + 256) & 0xff, (Math.floor(state.y) + probeY + 256) & 0xff);
  };
  const moveAndBounce = (): void => {
    move();
    if (!probeBlocked(state.heading)) return;
    state.mode = "chase";
    move((state.heading + 16) & 31);
  };

  while (state.frame < targetFrame && !state.dead) {
    state.frame += 1;

    if (state.mode === "entry") {
      state.timer -= 1;
      if (state.timer === 0) state.mode = "chase";
      else move();
    } else if (state.mode === "side") {
      if (probeBlocked(state.heading, state.fromRight ? -16 : 16)) move();
      else if (Math.abs(playerY - Math.floor(state.y)) < GUNMAN_FLANK_SIDE_TRIGGER_DISTANCE_NES) {
        state.mode = "lunge";
        state.timer = GUNMAN_FLANK_LUNGE_FRAMES;
      }
    } else if (state.mode === "lunge") {
      if (state.timer >= 0x80) {
        state.mode = "chase";
        state.heading = 16;
        move();
      } else {
        let heading: number = GUNMAN_FLANK_LUNGE_HEADINGS[state.timer >> 2] ?? 0x44;
        state.timer = (state.timer - 1) & 0xff;
        if (state.fromRight) heading = (heading & 0xe0) | ((32 - (heading & 31)) & 31);
        move(heading);
      }
    } else {
      const actorX = Math.floor(state.x);
      const actorY = Math.floor(state.y);
      const far = Math.abs(playerY - actorY) >= GUNMAN_FLANK_NEAR_DISTANCE_NES || Math.abs(playerX - actorX) >= GUNMAN_FLANK_NEAR_DISTANCE_NES;
      if (state.mode === "chase") {
        if (far) {
          const target = nesAimHeading(actorX * NES_WORLD_X_SCALE, actorY * NES_WORLD_Y_SCALE, playerX * NES_WORLD_X_SCALE, playerY * NES_WORLD_Y_SCALE);
          const difference = (target - state.heading + 47) % 32 - 15;
          if (difference !== 0) state.heading = (state.heading + Math.sign(difference) + 32) & 31;
          moveAndBounce();
        } else {
          state.orbitDirection = state.heading < 16 ? 1 : 0;
          state.heading = (state.heading + (state.orbitDirection ? -8 : 8) + 32) & 31;
          state.mode = "orbit";
        }
      } else if (state.mode === "orbit") {
        state.timer = (state.timer + 1) & 0xff;
        const rotate = state.timer === 5;
        if (rotate) state.timer = 0;
        if (far && rotate) {
          state.heading = (state.heading + state.orbitDirection + 32) & 31;
          if (state.heading === 16) state.orbitPassedDown = true;
          if (state.heading === 0 && state.orbitPassedDown) {
            state.mode = "roam";
          }
        }
        if (state.mode === "orbit") moveAndBounce();
      } else {
        moveAndBounce();
      }
    }

    if (state.y >= 0 && state.mode !== "lunge" && state.frame % 3 === 0) state.y += 1;
    if (outsideScreen()) state.dead = true;
  }
}

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
const decodeFixedCoordinateSamples = (encoded: string): readonly (readonly [number, number, number, number])[] => {
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  const samples: [number, number, number, number][] = [];
  for (let index = 0; index + 3 < bytes.length; index += 4) samples.push([bytes[index]!, bytes[index + 1]!, bytes[index + 2]!, bytes[index + 3]!]);
  return samples;
};
// Controlled fixed-point trace for the Round 5 at=1135 flank; parts are
// concatenated below in numeric order to keep each source line manageable.
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_11 = "s7M3orSzN6K0szeitLM3orWzN6K1szeitbM3orazN6K2szeitrM3orezN6K3szeit7M3orizN6K4szeiuLM3ormzN6K5szeiubM3orqzN6K6szeiurM3oruzN6K7szeiu7M3oryzN6K8szeivLM3or2zN6K9szeivbM3or6zN6K+szeivrM3or+zN6K/szeiv7M3osCzN6LAszeiwLM3osGzN6LBszeiwbM3osKzN6LCszeiwrM3osOzN6LDszeiw7M3osSzN6LEszeixLM3osWzN6LFszeixbM3osazN6LGszeixrM3osezN6LHszeix7M3osizN6LIszeiyLM3osmzN6LJszeiybM3osqzN6LKszeiyrM3osuzN6LLszeiy7M3osyzN6LMszeizLM3";
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_10 = "luuYtSEXl7WsQ5e0N2+Ws8KblrNNx5Wy2POVsmMflLLuS5SxeXeUsASjk7CPz5OvGvuSr6Unkq8wU5Guu3+RrUarkK3R15CtXAOPrOcvj6xyW46r/YeOq/2Hjqz9h4+rq/eQq1lnkasH15GrtUeSqmO3k6sRJ5Oqv5eUqm0Hlaobd5WpyeeWqXdXl6klx5ep0zeYqIGnmakvF5mo3Yeap4v3m6g5Z5un59ecp5VHnadDt52n8Seepp+Xn6dNB5+m+3egpannoaZXV6KlBceipbM3oqazN6KmszeiprM3oqezN6Knszeip7M3oqizN6KoszeiqLM3oqmzN6KpszeiqbM3oqqzN6KqszeiqrM3oquzN6Krszeiq7M3oqyzN6KsszeirLM3oq2zN6KtszeirbM3oq6zN6KuszeirrM3oq+zN6Kvszeir7M3orCzN6KwszeisLM3orGzN6KxszeisbM3orKzN6KyszeisrM3orOzN6Kzszei";
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_9 = "G6Wu1++mr0zDprHBl6eyNmuns6s/qLUgE6i1leeptgq7qbh/j6m59GOqumk3qrzeC6u8U9+rvcizrL89h6zAslutwScvrcOcA67DEdeuxIarrsb7f6/HcFOvyOUnsMla+7DKz8+xy0Sjsc25d7LOLkuyz6Mfs9AY87PRjcez0Y3Hs9KNx7PSjcez0o3Hs9IY87LSox+y0S5LsdG5d7HQRKOwz8/PsM9a+6/P5SevznBTrs77f67NhquuzBHXrc2cA63MJy+sy7JbrMs9h6vKyLOryVPfqsreC6rJaTepyPRjqch/j6nHCruoxpXnqMcgE6fGqz+nxTZrpsXBl6bETMOlw9fvpcRiG6TD7UekwnhzpMIDn6PBjsujwBn3osGkI6LAL0+hv7p7ob9Fp6C+0NOgvVv/n77mK5+9cVeevPyDnryHr567Etudu50HnbsoM5y6s1+cuT6Lm7nJt5u4VOOauN8PmrhqO5m39WeZtoCTmbYLv5i1";
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_8 = "faEnS3ygsnd8nz2je5/Iz3ueeOJ7nSj1ep7YCHqdiBt6nDguepwQNXmb6Dx5msBDeZqYSnmZcFF5mHBReZhwUXmXcFF5lnBReZZwUXmVmFh5lMBfeZToZnqTEG16kjh0epKIh3qR2Jp7kCite5B4wHuPyNN8jj3/fI+yK32OJ1d9jZyDfo0Rr36Mpft/jDlHf4zNk4CLYd+Ai/UrgYujm4KLUQuCiv97g4qt64SKW1uFiR73hYrhk4aKpC+HiWfLiIoqZ4iK+jeJisoHioqa14uKaqeMijp3jYsOd42L4neOi7Z3j4yKd5CMXneRjC6nkY3+15KOzgeTjp43lI9uZ5WPMcuVkPQvlpG3k5eReveYkj1bmJPr65mUmXualUcLmpb1m5uXoyuclzffnJnLk52aX0edmvP7npyHr56d/IOfnnFXn6DmK6CgW/+godDToaNFp6GkunuipS9PoqekI6OnGfejqI7LpKoDn6SreHOkrO1Hpa5i";
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_7 = "j8pDfJCac32QaqN+kDrTf5IKA3+S2jOAkp2XgZNg+4KUI1+ClObDg5apJ4SWV7eFlwVHhZiz14aZYWeHmQ/3h5ujq4icN1+IncsTiZ5fx4mf83uKoGhPiqLdI4uiUveLo8fLjKU8n4ymsXONpyZHjambG46pEO+OqoXDjqz6l4+tb2uPruQ/kLBZE5CwzueRsUO7kbO4j5K0LWOStaI3k7cXC5O3jN+Tt4zfk7iM35O4jN+TuIzfk7kXC5K4ojeSty1jkbe4j5G2Q7uQtc7nkLZZE4+15D+PtG9rjrT6l46zhcOOshDvjbObG42yJkeMsbFzjLE8n4uwx8uLr1L3irDdI4qvaE+JrvN7ia5+p4mtCdOIrJT/iK0fK4esqleHqzWDhqvAr4aqS9uFqtYHhaphM4Sp7F+EqHeLhKgCt4OnjeODpxgPgqejO4KmLmeBpbmTgaVEv4Ckz+uApFoXf6TlQ3+jcG9+ovubfqKGx36hEfN9oZwf";
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_6 = "+ud+rkxXfa6ex3yu8Dd8rUKne66UF3qt5od6rDj3ea2KZ3is3Nd4rC5Hd6yAt3as0id2qySXdax2B3SryHd0qhrnc6tsV3KqvsdyqhA3capip3CqtBdwqQaHb6lY926pqmduqBazbaiC/2yo7ktsp1qXa6fG42unUQ9qptw7aqZnZ2ml8pNppH2/aaQI62ikkxdoox5DZ6Opb2eiNJtmoeSuZqGUwWagRNRln/TnZZ+k+mWffAFlnlQIZZ4sD2WdBBZknNwdZJzcHWSb3B1kmtwdZJrcHWSZ3B1lmAQkZZgsK2WXVDJllnw5ZZakQGWV9FNmlERmZpSUeWaT5IxnkjSfZ5Kpy2iRHvdokZMjaZEIT2mQfXtqjxHHapClE2uPOV9rjs2rbI5h922OD2dtjb3Xbo5rR2+NGbdvjccncI2Kw3GNTV9yjBD7co3Tl3ONljN0jWYDdY0203aNBqN2jdZzd46mQ3iOekN5jk5Deo8iQ3qP9kN7";
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_5 = "V2rYGl5q10JlatdqbGrWknNq1bp6atXigWvUCohr01qba9OqrmvS+sFs0UrUbNGa523RDxNt0IQ/bdD5a27PbpduzuPDb85Y72/OzRtwzUJHcM23c3HMLJ9xy6HLcssW93LLiyNzygBPc8p1e3PJ6qd0yF/TdMjU/3XISSt1x75Xdsczg3bGqK93xR3bd8aSB3jFBzN4xHxfeMTxi3nDZrd5wtvjesNQD3rCxTt7wTpne8Gvk3zAJL98v5nrfcAOF32/g0N9vvhvfr5tm3694sd/vFfzf73MH4C8QUuAu7Z3gbsro4G6oM+CuRX7grqKJ4K5/1ODuHR/g7jpq4S3XteEt9MDhbdIL4W2vVuGtTKHhrWns4e0HN+HtJELiLQGN4ize2OIsvCPibJlu4mx2ueJsdrnibLa54myLFeIsX7Hh7LQN4exIqeGsXQXhbHGh4WwGPeEsGpng7C814OwDkeCr2C3gbCyJ4GvBJeAr1YHf6+od36u";
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_4 = "asYaJmrGGiZqxhomascaJmrHGiZqxxomasgaJmrIGiZqyBomaskaJmrJGiZqyRomasoaJmrKGiZqyhomassaJmrLGiZqyxomaswaJmrMGiZqzBomas0aJmrNGiZqzRomas4aJmrOGiZqzhomas8aJmrPGiZqzxomatAaJmrQGiZq0BomatEaJmrRGiZq0RomatIaJmrSGiZq0homatMaJmrTGiZq0xomatQaJmrUGiZq1BomatUaJmrVGiZq1RomatYaJmrWGiZq1homatcaJmrXGiZq1xomatgaJmrYGiZq2BomatkaJmrZGiZq2RomatoaJmraGiZq2homatsaJmrbGiZq2xomatwaJmrcGiZq3Bomat0aJmrdGiZq3Romat4aJmreGiZq3homat8aJmrfGiZq3xomauAaJmrgGiZq4BomauEaJmng8i1p38o0ad+iO2neekJp3XpCad16QmncekJp23pCadt6Qmnaoklp2cpQadny";
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_3 = "phomaqcaJmqnGiZqpxomaqgaJmqoGiZqqBomaqkaJmqpGiZqqRomaqoaJmqqGiZqqhomaqsaJmqrGiZqqxomaqwaJmqsGiZqrBomaq0aJmqtGiZqrRomaq4aJmquGiZqrhomaq8aJmqvGiZqrxomarAaJmqwGiZqsBomarEaJmqxGiZqsRomarIaJmqyGiZqshomarMaJmqzGiZqsxomarQaJmq0GiZqtBomarUaJmq1GiZqtRomarYaJmq2GiZqthomarcaJmq3GiZqtxomargaJmq4GiZquBomarkaJmq5GiZquRomaroaJmq6GiZquhomarsaJmq7GiZquxomarwaJmq8GiZqvBomar0aJmq9GiZqvRomar4aJmq+GiZqvhomar8aJmq/GiZqvxomasAaJmrAGiZqwBomasEaJmrBGiZqwRomasIaJmrCGiZqwhomasMaJmrDGiZqwxomasQaJmrEGiZqxBomasUaJmrFGiZqxRom";
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_2 = "Qv17q7cpe6y3KXustyl7qwmZeqxbCXmrrXl4qv/peKtRWXeqo8l2qvU5dqpHqXWqmRl0qeuJdKk9+XOpj2lyqOHZcqkzSXGohblwqNcpcKhDdW+nr8FvpxsNbqeHWW2m86VtpX7RbaUJ/WyllClspB9Va6SqgWujWpRrogqnaqK6umqhas1qoBrgaaDy52mfyu5pnqL1aZ56/GmeUgNpnVIDaZ1SA2mcUgNpm1IDaZtSA2maegppmaIRaZnKGGmY8h9qlxomapgaJmqYGiZqmBomapkaJmqZGiZqmRomapoaJmqaGiZqmhomapsaJmqbGiZqmxomapwaJmqcGiZqnBomap0aJmqdGiZqnRomap4aJmqeGiZqnhomap8aJmqfGiZqnxomaqAaJmqgGiZqoBomaqEaJmqhGiZqoRomaqIaJmqiGiZqohomaqMaJmqjGiZqoxomaqQaJmqkGiZqpBomaqUaJmqlGiZqpRomaqYaJmqmGiZq";
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_1 = "iUVxKT1Fcb3xRnNRpUZ05VlHdXkNSHYNwUh3oXVJeDUpSXnJ3Up6XZFKe/FFS3yF+Ux9Ga1Mfq1hTYBBFU2A1clOgWl9ToP9MU+DkeVQhCWZUIa5TVGHTQFRh+G1Uol1aVOKCR1Tip3RVIwxhVSNxTlVjVntVY/toVaQgVVXkRUJV5KpvViTV01ZkwXdWZWZkVqWLUValsH5W5hVrVuZ6WFcmZfxXZtFgV2c8xFenKGhX55PMV+e/cFgn6tRYaBZ4WKhB3FiorUBY6NjkWSkESFkpL+xZaZtQWamG9Fmp8lhZ6h38WipJYFoqtMRaauBoWqsLzFqrN3Ba66LUWyuOeFsr+dxbbGVAW6xQ5FusvEhb7OfsXC0TUFwtPvRcbapYXG2qWFytR6NcrWTuXO0COVztH0Rc7TyPXSzZ2l0styVdbJRwXWxxu12sTsZdrGwRXewJXF3r5qdeK8PyXiuhPV4rvkhea5uTXmt43l6rFileqzN0Xur";
const GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_0 = "BDEY3QQx7N0FMcDdBjKU3QcyaN0IMjzdCTMQ3Qkz5N0KM7jdCzSM3Qw0YN0NNDTdDjUI3Q413N0PNbDdEDaE3RE2WN0SNizdEzcA3RM31N0UN6jdFTh83RY4UN0XOCTdFzn43Rg5zN0ZOaDdGjp03Rs6SN0cOhzdHDvw3R07xN0eO5jdHzxs3SA8QN0hPBTdIT3o3SI9vN0jPZDdJD5k3SU+ON0mPgzdJj/g3Sc/tN0oP4jdKUBc3SpAMN0rQATdK0EE3StC1A0sQpdxLURFAS1E2bUuRU6JLkfDXS9IODEvSa0FMEpBuTBL1W0xTGkhMU3e9TJOU8kyT8idM1E9cTNS0SU0UmXZNFT5jTVVjUE2VSH1Nle1qTdYSV03Wd0ROFpxxTlbBXk5XJktOl0t4TpewZU7X1VJO2Dp/TxhfbE9YhFlPWSlGT5kOc0+Zc2BP2dhNT9n9elAaImdQWodUUFrsQVCa0W5Qm3ZbUNubSFEbgHVRHCV";
const decodeCoordinateRuns = (encoded: string): readonly (readonly [number, number])[] => {
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  const samples: [number, number][] = [];
  for (let index = 0; index + 2 < bytes.length; index += 3) {
    for (let count = bytes[index]!; count > 0; count -= 1) samples.push([bytes[index + 1]!, bytes[index + 2]!]);
  }
  return samples;
};
const GUNMAN_FLANK_STAGE5_AT1135_FIXED_TRACE_NES = decodeFixedCoordinateSamples(GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_0 + GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_1 + GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_2 + GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_3 + GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_4 + GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_5 + GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_6 + GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_7 + GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_8 + GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_9 + GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_10 + GUNMAN_FLANK_STAGE5_AT1135_TRACE_PART_11);
const GUNMAN_FLANK_STAGE5_AT1711_TRACE_NES = decodeFixedCoordinateSamples("BEF0JAVBSCQGQRwkBkLwJAdCxCQIQpgkCUNsJApDQCQLQxQkC0ToJAxEvCQNRJAkDkVkJA9FOCQQRQwkEEbgJBFGtCQSRogkE0dcJBRHMCQVRwQkFUjYJBZIrCQXSIAkGElUJBlJKCQZSfwkGkrQJBtKpCQcSngkHUtMJB5LICQeS/QkH0zIJCBMnCQhTHAkIk1EJCNNGCQjTewkJE7AJCVOlCQmTmgkJ088JChPECQoT+QkKVC4JCpQjCQrUGAkK1FgJCxRMFQsUfO4LVOhSC5TNfwuVKrQLlb6vS9XSqovWJqXL1rqhDBbOnEwXIpeMF7aSzFfKjgxYHolMWLKEjJiGv8yY2rsMmW62TNmCsYzZ1qzM2mqoDNq+o00a0p6NG2aZzRu6lQ1bzpBNXGKLjVy2hs2cyoINnR69TZ1yuI3dhrPN3hqvDd5uqk4egqWOHxagzh9qnA4fvpdOYBKSjmBmjc5guokOoQ6ETqEiv46hdrrO4cq2DuIesU7icqyPIsanzyMaow8jbp5PY8KZj2QWlM9kapAPpMfFD6TlOg/lAm8P5Z+kD+X82RAmGg4QJq4JUGaLflBm6LNQp0XoUKejHVDnwFJQ6F2HUOhdh1EoCSNRKDS/UWggG1Gny7dRqDxeUegtBVIn3exSaA6TUmf/elKn8CFS6CDIUyfRr1NnwlZTZ/M9U6fnMVPn2yVUKA8ZVGgDDVRoNwFUqGwBVOhhAVUoVgFVaIsBVaiAAVWotQFV6OoBVijfAVZo1AFWqQkBVqk+AVbpMwFXKWgBV2ldAVepUgFX6YcBV+m8AVgpsQFYaeYBWKnbAVjp0AFZKgUBWSo6AVlqLwFZqmQBWepZAVoqTgFaaoMBWmq4AVqqrQFa6uIBWyrXAVtqzAFbqwEBW6s2AVvrKwFcK2ABXGtVAVyrSgFcq78BXOu0AV0rqQFda94BXavTAV3ryAFd7D0BXiwyAV5sJwFerFwBXuxRAV8sRgFfLLsBX2ywAV+spQFf7NoBYCzPAWBsxAFgbTkBYK0uAWDtIwFhLVgBYW1NAWGtQgFhrbcBYe2sAWItoQFibdYBYq3LAWLtwAFi7jUBYy4qAWNuHwFjrlQBY+5JAWPufgFkLrMBZG6oAWSunQFk7tIBZS7HAWUu/AFlbzEBZa8mAWXvGwFmL1ABZm9FAWZvegFmr68BZu+kAWcvmQFnb84BZ6/DAWev+AFn8C0BaDAiAWhwFg1osEoZaLB+JWjwcjFpMKY9aXDW1mmwx69psXhIafFpIWoxWfpqccVeanIwwmqyHGZq8ofKavKzbmsy2FtrM31Ia3NidWuzh2JrtCxPa/RJhGv0ZvlsNMQubDUhY2w1fphsddKTrHYmjux2eoosts6FbLcigKy3LL7st7a9LPfAu2z4Crms+JS37PjUt+z5FLfs+ZS37PnUt+z6FLfs+oq2LPrAtGy7NrKsu6yw7Lviryy8DqpsfLqlrHzmoOx9EpwsPb6XbD3hTGw+BAFr/mb2a/6Jq2u+7GB");
const GUNMAN_FLANK_STAGE2_CODE9_AT943_TRACE_ABSOLUTE_NES = decodeCoordinateRuns("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");
const GUNMAN_FLANK_STAGE2_CODE9_AT943_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE9_AT943_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 48] as const);
const GUNMAN_FLANK_STAGE1_AT511_TRACE_ABSOLUTE_NES = decodeCoordinateRuns("AfhgAfdfAfZdAfVcAfRbAfJaAfFYAfBXAe5WAe1VAetVAepUAehTAudTAeZSAeVSAeRSAuNSAeJSAeFSAeBTAd9TAt5TAd1UAdxUAdtVAdpWAdlXAddYAdZZAdVbAdRcAdNdAdFfAdBgAdBiAc9kAc5lAc1nAcxpAcxrActtActwAcpzAcp2Acl4Acl7Acl+AcmBAcmEAcmFAcmHAcmIAciJAciLAceLAcaMAcaOAcWOAcSPAcSQAcORAcKRAcKTAcGTAcCUAcCWA7+WAb6WAb6VAb2VAb2UAryTAbuTAbuSAbqSAbqRAbqQArmQAriPAbeOAbeNAraNArWMAbSLArSKAbOKAbOJAbKJAbKIArGHAbCHAbCGAa+GAa+FAa+EAa6FAa6EAq2DAayCAayBAauCAauBAqqAAap/Aal+Aal/Aah+Aah9Aad9Aad8AaZ7AaZ8AaV7AaV6AaR6AaR5AaR4AaN5AaN4AqJ3AqF2AaB2AaB1Ap90AZ9zAp5zAZ1yAZ1xAZxxAZxwAptwAZpvAppuApltAZhtAZhsApdrApZqAZVqAZVpAZVoAZRoAZRnApNnAZJmAZJlApFlApBkAY9jAo9iAY5iAY5hAY1hAY1gAoxfAYtfAYteAYpeAYpdAYpcAolcAohbAYdaAYdZAoZZAoVYAYVXAYRWAYRXAYNWAYNVAYJVAYJUAYFTAYFUAYBTAYBSAX9SAX9RAX9QAX5RAX5QAn1PAXxOAXxNAXtOAXtNAnpMAXpLAXlKAXlLAXhKAXhJAXdJAXdIAXZHAXZIAXVHAnVGAnRFAXNFAXNEAnJDAnFCAXBCAXBBAm9AAW8/Am4/AW0+AW09AWw9AWw8Ams8AWo7Amo6Amk5AWg5AWg4Amc3AWY3AWY2AWU2AWU1AWU0AmQ0AmMzAWIyAWIxAmExAmAwAV8vAl8uAV4uAV4tAV0tAV0sAlwrAVsrAVsqAVoqAVopAVooAlkoAlgnAVcmAVclAVYmAVYlAlUkAVUjAVQiAVQjAVMiAVMhAVIhAVIgAVEfAVEgAVAfAVAeAU8eAU8dAU8cAU4dAU4cAk0bAUwaAUwZAUsaAUsZAkoYAUoXAkkXAUgWAUgVAUcVAUcUAkYUAUUTAkUSAkQRAUMRAUMQAkIPAkEOAUAOAUANAj8MAT8LAj4LAT0KAT0JATwJAjwIAzwJATsKAToKATkKATkMATgMATcNATcPATcQATYRATYTATcUATcVATcXATgYATgZATgaATgbATkcATkeATkfATogAToiATojATskATsmATsnATwoATwqATwrAT0rAT0tAT0uAT0vAT4xAT4yAT4zAT81AT82AT83AUA5AUA6AUA7AUE8AUE9AUE+AUJAAUJBAUJCAUJEAUNFAUNGAUNIAURJAURKAURMAkVNAUZPAUZQAUZRAUdTAUdUAUhVAUhWAUhXAUlYAUlaAkpbAUtdAUteAUxfAUxhAk1iAU5kAU5lAU5mAU9oAU9pAVBpAVBrAVFsAVFtAVJvAVJwAVNwAVNyAVNzAVR0AVR2AlV3AVZ5AVZ6AVd7AVd9AVh9AVh+AViAAVmBAVmCAlqEAVuFAluGAVyFAV2GAV2FAV6EAV+FAmCEAWGFAWKEAmOEAWSEAWWEAWaFAWeFAWeEAWiFAWmFAWqFAWuGAmyGAW2HAW6HAW+HAXCIAnGIAXKJAXOJAXSJAnWKAXaKAXeLAXiLAXmLAnqMAXuMAXyNAX2NAX6NAn+OAYCOAYGPAYKPAYOPAoSQAYWQAYaRAYeRAYiRAomSAYqSAYuTAYyTAY2TAY2UAY6UAY+UAZCVAZGVAZKVAZKWAZOWAZSWAZWXAZaXAZeXAZeYAZiYAZmYAZqZAZuZAZyZAZyaAZ2aAZ6aAZ+bAaCbAaGbAaGcAaKcAaOcAaSdAaWdAaadAaaeAaeeAaieAamfAqqfAaugAaygAa2gAa6hAq+hAbCiAbGiAbKiAbOjArSjAbWkAbakAbekAbilArmlAbqmAbumAbymAb2nAr6nAb+oAcCoAcGoAsKpAcOqAcSrAcWrAcarAcesAcetAcitAcmvAsqvAcuxAcyxAcyyAc20Ac60Ac61As+3AdC4AdG6AdG7AdK7AdK9AdK+AdO/AdPBAdTCAdTDAtTFAdXGAdXIAdXJAdXKAdXMAdXNAdXOAdXQAdXRAdXSAdXUAdXVAdXWAdXYAdTZAdTaAdTcAdTdAdPeAdPgAtLhAdLjAdHkAdHlAdDnAc/nAc/oAs7qAc3rA8ztA8zuAczvAcvvAcruAcrvAcnuAsjuAcftAsbtAcXtAcTsAcPtAcPsAcLrAcHsAcHrAcDrAr/rAcDqAcDrAcHqAcHpAcLpAcLoAcPnAcPoAcTnAsTmAcXlAcXkAcblAcbkAsfjAcjiAcjhAcniAcnhAcngAcrgAcrfAcveAcvfAczeAczdAc3dAc3cAs7cAc7bAs/aAtDZAdHZAdHYAtLXAtPWAdTWAdTVAdTUAdXUAdXTAtbTAdfSAdfRAdjRAdjQAtnQAdnPAtrOAdvOAdvNAdzNAdzMAt3LAd7LAt7KAd/JAd/IAuDIAuHHAeLGAeLFAuPFAuTEAeTDAuXCAebCAebBAefBAefAAui/Aem/Aum+Aeq9Aeq8Aeu9Aeu8Auy7Ae26Ae25Ae66Ae65Ae64Ae+4Ae+3AfC2AfC3AfG2AfG1AfK1AfK0AfOzAfO0AfSzAvSyAfWxAfWwAfaxAfawAvevAviuAfmuAfmtAfmsAfqsAfqrAvurAfyqAfypAf2pAf2oAv6oAf6nAv+m");
const GUNMAN_FLANK_STAGE1_AT511_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT511_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 96] as const);
const GUNMAN_FLANK_STAGE6_AT2991_FIXED_TRACE_NES = decodeFixedCoordinateSamples(
  "BDH2PAUxyjwGMZ48BzJyPAgyRjwJMho8CTPuPAozwjwLM5Y8DDRqPA00PjwONBI8DjXmPA81ujwQNY48ETZiPBI2NjwTNgo8EzfePBQ3sjwVN4Y8FjhaPBc4LjwYOAI8GDnWPBk5qjwaOX48GzpSPBw6JjwcOvo8HTvOPB47ojwfO3Y8IDxKPCE8HjwhPPI8Ij3GPCM9mjwkPW48JD5uPCQ+bjwkPm48JD9uPCQ/bjwkP248JEBuPCRAbjwkQG48JEFuPCRBbjwkQW48JEJuPCRCbjwkQm48JENuPCRDbjwkQ248JERuPCREbjwkRG48JEVuPCRFbjwkRW48JEZuPCRGbjwkRm48JEduPCRHbjwkR248JEhuPCRIbjwkSG48JEluPCRJbjwkSW48JEpuPCRKbjwkSm48JEtuPCRLbjwkS248JExuPCRMbjwkTG48JE1uPCRNbjwkTW48JE5uPCRObjwkTm48JE9uPCRPbjwkT248JFBuPCRQbjwkUG48JFFuPCRRbjwkUW48JFJuPCRSbjwkUm48JFNuPCRTbjwkU248JFRuPCRUbjwkVG48JFVuPCRVbjwkVW48JFZuPCRWbjwkVm48JFduPCRXbjwkV248JFhuPCRYbjwkWG48JFluPCRZbjwkWW48JFpuPCRabjwkWm48JFtuPCRbbjwkW248JFxuPCRcbjwkXG48JF1uPCRdbjwkXW48JF5uPCRebjwkXm48JF9uPCRfbjwkX248JGBuPCRgbjwkYG48JGFuPCRhbjwkYW48JGJuPCRibjwkYm48JGNuPCRjbjwkY248JGRuPCRkbjwkZG48JGVuPCRlbjwkZW48JGZuPCRmbjwkZm48JGduPCRnbjwkZ248JGhuPCRobjwkaG48JGluPCRpbjwkaW48JGpuPCRqbjwkam48JGtuPCRrbjwka248JGxuPCRsbjwkbG48JG1uPCRtbjwkbW48JG5uPCRubjwkbm48JG9uPCRv" +
  "bjwkb248JHBuPCRwbjwkcG48JHFuPCRxbjwkcW48JHJuPCRybjwkcm48JHNuPCRzbjwlcZbUJnC+bCdv5gQpbQ6cKmxqfCtrxlwtaiI8Lml+HDBoBFQxZ4qMM2YQxDRllvw1ZWbMNmU2nDdlBmw3ZdY8OGWqPDllfjw6ZVI8O2UmPDtl9mw8ZcacPWWWzD5lZvw/ZilgP2bsxEBnryhBZ3KMQmjOrERpKsxFaobsRmziDEhtCnRJbjLcSnBaREtxgqxMc2xUTXRW/E52QKRPeCpMT3rKJlB8agBRfQraUX+qtFKCIp9ShZqKU4gSdVOLimBTjopgU5GKYFOUimBTl4pgU5mKYFOasllUmwJGVJ13GlWdC85Vnp+CVqAzNlagMzZWn8eCV59bzlef7xpYnoNmWZ4XslmexSJanXOSW54hAludz3JcnH3iXZ1Afl6dAxpenMa2X52JUmCcTO5hnBy+YZ3sjmKdvF5jnYwuZJ1c/mWdMP5mnQT+Zp7Y/meerP5onoD+aaBQLmqgIF5qoPCOa6HAvmyhkO5tomAebqMwTm+jAH5vo9CucKSg3nGlcA5ypUA+c6YQbnOm4J50prDOdaeA/naoUC53qCBed6nwjnipwL55qZDueqtgHnurME58qwB+fKzQrn2soN5+rXAOf65APoCuEG6AruCega+wzoKvgP6DsFAuhLEgXoSx8I6FscC+hrKQ7oezYB6IszBOibQAfom00K6KtKDei7ZwDoy2QD6NthBujbfgno63sM6Pt4D+kLlQLpG5IF6RufCOkrrAvpO6kO6Uu2AelbwwTpa8AH6WvNCul72g3pi+cA6ZvkA+mr8Qbpq/4J6bv7DOnMCA/p3BUC6ewSBensLwjp/CwL6gwpDuocRgHqLEME6jxAB+o8XQrqPF0K6jxdCuo8X4taTEILykw0jDpMNwyqTCmNGkwcDYpMHo36XAEOalvzjtpb9g9KW+iPulvrACpb7YCaa9ABCmvCgX" +
  "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",
);
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
const GUNMAN_FLANK_STAGE1_AT703_OFFSETS_NES = decodeCoordinateRuns("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").map(([x, y]) => [248 - x, y - 32] as const);
const GUNMAN_FLANK_STAGE1_AT847_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+CH3IfYh9SL1IvQi8yPyI/Ej8CTwJO8k7iXtJewl6ybrJuom6SfoJ+cn5ijmKOUo5CnjKeIp4SrhKuAq3yveK90r3SzcLNss2i3ZLdgt2C7XLtYu1S/UL9Mv0zDSMNEw0THQMs8yzzTONM41zTfNOM05zDvMPMw9yz/LQMtAy0LKQ8pEykbJR8lIyUrIS8hMyE7HT8dQx1HGUsZTxlXGVsVXxVnEWsRbxF3DXcNewmDCYcJiwWTBZMBlwGe/aL9pvmu+a71svW68b7xwvHK7crtzunW6drl3uXm4ebh6t3y3fbd+toC2gLWBtYO0hLSFs4ezh7KIsoqyi7GMsY2wjrCPr5Gvkq6TrpStla2WrJismauZq5uqnKqcqZ6pn6igqKGnoKegpqCloKWfpJ+jn6Oeop+hnqGeoJ6fnZ+dnp2dnZ2cnJ2bnJucmpyZm5ibmJuXm5aalpuVmpSZlJqTmZKZkpmRmZCYkJmPmI6XjpiNl4yXjJeLl4qWipaJloiVh5aHlYaVhZWFlYSUg5SDlIKTgZSBk4CTf5N/kn6SfZJ9knyRe5J7kXqReZF5kHiQd5B2kHaPdZB0j3SOc49yjnKOcY5wjnCNb45ujW6MbY1sjGyMa4xqjGqLaYtoi2iKZ4tmimWKZYpkimOJY4liiWGIYYlgiF+IX4heh12HXYdch1uGW4dahlmGWYZYhVeFV4VWhVWEVYVUhFODUoRSg1GDUINQg0+CToNOgk2BTIJMgUuBSoFKgUmASIBIgEd/RoBGf0V/RH9Ef0N+Qn5BfkF9QH4/fT99Pn09fD18PHw7fDt7Onw5ezl7OHs3ejd6Nno1ejV5NHozeTN4MnkxeDB4MHgveC53Lngtdyx2LHcrdip2KnYpdih1KHYodid1JnYldyR3JHkjeSN6InwifSJ+IoAjgSOCJIMkhCWFJYcmhyeIJ4ooiiiLKY0pjiqOK5ArkSyRLJMtlC2ULpYvly+YMJkxmjGaMpwynTOdM580oDWgNqI2ojejOKU4pTmmOqc6qDuoPKo8qj2rPq0+rT+uQK9AsEGwQbFCsUKwQrBDr0OuRK5ErkWtRa1GrEarR6tHq0eqSKpIqUmoSalKqEqnS6dLpkylTKZNpU2kTaROo06iT6NPolChUKFRoFGfUqBSn1OeU59UnlWdVZ5WnVedV51YnVmcWp1anVucXJ1dnV6dXp1fnWCdYZ5inmOeY59kn2WgZqFnoWehaKJpo2qja6RrpGykbaVupm+mcKdwp3GncqlzqXSpdKp1qnard6x4rHisea16rXuufK99r32vfrB/sYCxgbKBsoKyg7SEtIW0hbWGtYe1iLeJt4q3iriLuIy5jbqOuo66j7uQvJG8kr2SvZO9lL6Vv5a/l8CXwJjAmcKawpvCm8Ocw53EnsWfxZ/FoMahxqLHo8ikyKTIpcmmyqfKqMuoy6nLqs2rzazNrM6tzq7Or9Cw0LHQsdGy0rPStNS01LXVtta217fXuNm42rnauty63bvdu9+84LzhvOO9473kvua+577ov+q/67/sv+6/77/wv/K/87/0v/a/97/4v/q/+w==");
const GUNMAN_FLANK_STAGE1_AT847_OFFSETS_NES = GUNMAN_FLANK_STAGE1_AT847_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 32] as const);
const GUNMAN_FLANK_STAGE1_AT1071_OFFSETS_NES = decodeCoordinateRuns("AwQhAwQiAwQjAwQkAwQlAwQmAwQnAwQoAwQpAwQqAwQrAwQsAwQtAwQuAwQvAwQwAwQxAwQyAwQzAwQ0AwQ1AwQ2AwQ3AwQ4AwQ5AwQ6AwQ7AwQ8AwQ9AwQ+AwQ/AwRAAwRBAwRCAwRDAwREAwRFAwRGAwRHAwRIAwRJAwRKAwRLAwRMAwRNAwROAwRPAwRQAwRRAwRSAwRTAwRUAwRVAwRWAwRXAwRYAwRZAwRaAwRbAwRcAwRdAwReAwRfAwRgAwRhAwRiAwRjAwRkAwRlAwRmAwRnAwRoAwRpAwRqAwRrAwRsAwRtAwRuAwRvAwRwAwRxAwRyAgRzAQVyAQZwAQdvAQhuAQptAQtrAQxqAQ5pAQ9oARFoARJnARRmAhVmARZlARdlARhlAhllARplARtlARxmAR1mAh5mAR9nASBnASFoASJpASNqASVrASZsASdtAShvASlwAStyASxzASx1AS13AS54AS96ATB8ATB+ATGAATGDATKGATKIATOLATOOATORATOUATOXATOZATOaATObATSdATSeATWfATWgATahATehATejATijATmkATmmATqmATunATuoATypAT2pAT2rAT6sAT+sAkCuAUGvAUGwAUGvAkKuAkOtAUStAUSsA0WrAkaqAUepAUeoAkioAkmnAUqmAkqlAUulAUukAUykAUyjAk2iAU6iAU6hAU+hAU+gAU+fAlCfAlGeAVKdAlOdAlScAVWcAVacAVabAVebAVibAlmbAVqbAVubAVybAl2bAV6cAV+cAWCcAWGdAmKdAWOeAWSeAWWeAmafAWegAWihAWmhAWqhAWqiAWuiAWyjAW2kAW6kAW+kAW+lAXCmAXGmAXKnAnOnAXSpAXWpAXapAneqAXiqAXmsAXqsAXusAnytAX2uAX6vAX+vAYCvAYCwAYGxAYKxAYOyAoSyAYWzAYa0AYe0AYi1Aom1AYq3AYu3AYy3Ao24AY65AY+6AZC6AZG6AZG7AZK7AZO8AZS9AZW9AZa9AZa+AZe/AZi/AZnAAprAAZvCAZzCAZ3CAp7DAZ/DAaDFAaHFAaLFAqPGAaTHAaXIAabIAafIAafJAajKAanKAarLAqvLAazMAa3NAa7NAa/OArDOAbHQAbLQAbPRAbPSAbTSAbXTAbbUAbbVAbfWAbjXAbjYAbnZAbnaAbrbAbrcArveAbzfAbzhAb3iAb3jAb3lAb7mAb7nAb7oAb7pAb/qAb/sAb/tAb/uAb/wAb/xAb/yAb/0Ab/1Ab/2Ab/4Ab/5Ab76").map(([x, y]) => [x - 4, y - 32] as const);
const GUNMAN_FLANK_STAGE2_CODE7_Y0_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("OAE5AToBOwI8AjwCPQM+Az8DQARBBEEEQgVDBUQFRQZGBkYGRwdIB0kHSghLCEsITAlNCU4JTwpQClAKUQtSC1MLVAxVDFUMVg1XDVgNWQ5ZDloOWw9cD10PXhBeEF8QXxFgEWESYhNiFGMVYxdjGGMZYxtkHGQdZB9kIGQhZCNkI2UkZSZlJ2UoZSplK2YsZi5mL2YwZjJmM2Y0ZzZnN2c4ZzpnO2c8aD5oP2hAaEJoQ2hEaUZpR2lIaUppS2lMaU5qT2pQalJqUmpTalVrVmtXa1lrWmtba11rXmxfbGFsYmxjbWVtZm1nbmluam5rb21vbW9ucHBwcXBycHRxdXF2cXhyeXJ6cnxzfXN9c390gHSBdIN1hHWFdYd1iHaJdot2jHeNd493j3iQeJJ4k3mUeZZ5l3qYepp6m3qce557n3uffKF8oXyhfaJ+oX+hgKGAoYGhgqGDoYOhhKGFoYaghqGHoYigiaGJoIqgi6GMoIygjaCOoI+gkKCQoJGfkqCToJOflKCVoJaflqCXoJigmaCaoJqgm6GcoZ2gnqGfoZ+hoKKhoqKho6KjoqSipaOmoqeip6Ooo6mjqqOro6yjrKStpK6kr6SwpLCksaWypbOktKW0pbWltqa3pbiluaa5prqmu6e8pr2mvae+p7+nwKfBp8GnwqjDqMSnxajGqMaox6nIqcmoyqnKqcupzKrNqc6pzqrPqtCq0arSqtOq06vUq9Wr1qzXrNis2K3Zrtqu26/cr9yw3bHest+y37TgtOG14bbit+O347nkuuS75bzlvea+5sDnwefB58PoxOjF6MfpyOnJ6cvpzOnN6c/p0OnR6dPp1OnV6dfp2OnZ6dvp3Ojd6N/o4Ofg5+Ln4+bk5ubl5+Xo5Onk6uPr4+zi7eHu4e/g8N/w3/Le8t3z3PTc9Nv12vbZ9tj22PjX+Nb41fnU+dP50/rS+tH50PrP+s76zvvN+sz6y/vK+8r7");
const GUNMAN_FLANK_STAGE3_CODE7_Y0_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("UAFRAVIBUgJTAlQCVQNWA1cDVwRYBFkEWgVbBVwFXAZdBl4GXwdgB2EHYQhiCGMIZAllCWUJZgpnCmgKaQtqC2oLawxsDG0Mbg1vDW8NcA5xDnIOcw90D3QPdRB2EHcQdxF4EXgReRN6E3oUehZ7F3sYexp7G3scex57H3sgeyJ7I3skeyZ7J3soeyp7K3ssey57L3swezJ7M3s0ezZ7N3s4ezp7O3s8ez57P3tAe0J7Q3tEe0Z7R3tIe0p7S3tMe057T3tQe1J7U3tUe1Z7V3tYe1p7W3tce157X3tge2J7Y3tke2Z7Z3toe2p7a3tse257b3twe3J7c3t0e3Z7d3t4fHp8e3x8fH58f3yAfIJ9g32EfYZ9h32IfYp+i36Mfo5+j36QfpJ/k3+Uf5V/ln+Xf5l/moCbgJ2AnoCfgKGAoYGhgqGDoYOhhKKFooaih6OIo4iiiaOKo4ujjKSMo42jjqSPpJCkkKSRpJKkk6WUpZWllaWWpZelmKaZppmlmqabppymnaedpp6mn6egp6Gnoqiip6OnpKilqKaopqinqKioqamqqaqoq6msqa2prqqvqq+psKqxqrKqs6uzqrSqtau2q7ert6u4q7mruqy7rLysvKy9rL6sv63ArcCswa3CrcOtxK7FrsWvxrDHsMiwybHJssqyy7TMtMy0zbbOts63z7nQudC60bzSvNK907/Tv9TA1MLVw9XE1cbWx9bI1snXytfL183XztfP19HX0tfT19XX1tfX19nX2tfb193X3tbf1uHW4tXj1eXV5tTm1OjT6dPq0uzS7NHt0O/Q78/wzvLO8s3zzPTM9cv1yvbZ9tj22PjX+Nb41fnU+dP50/rS+tH50PrP+s76zvvN+sz6y/vK+8r7");
const GUNMAN_FLANK_STAGE3_CODE7_Y0_TAIL_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("gqKDooOhhKKFooaih6OIo4iiiaOKo4ujjKSMo42jjqSPpJCkkKSRpJKkk6WUpZWllaWWpZelmKaZppmlmqabppymnaedpp6mn6egp6Gnoqiip6OnpKilqKaopqinqKioqamqqaqoq6msqa2prqqvqq+psKqxqrKqs6uzqrSqtau2q7ert6u4q7mruqy7rLysvKy9rL6sv63ArcCswa3CrcOtxK7FrsWvxrDHsMiwybHJssqyy7TMtMy0zbbOts63z7nQudC60bzSvNK907/Tv9TA1MLVw9XE1cbWx9bI1snXytfL183XztfP19HX0tfT19XX1tfX19nX2tfb193X3tbf1uHW4tXj1eXV5tTm1OjT6dPq0uzS7NHt0O/Q78/wzvLO8s3zzPTM9cv1yvbJ98n3yPjH+cb5xfrF+sT6w/vC+8H7");
const GUNMAN_FLANK_STAGE3_CODE7_Y0_OFFSETS_NES = [...GUNMAN_FLANK_STAGE3_CODE7_Y0_TRACE_ABSOLUTE_NES.slice(0, 162), ...GUNMAN_FLANK_STAGE3_CODE7_Y0_TAIL_ABSOLUTE_NES].map(([x, y]) => [x - 80, y] as const);
const GUNMAN_FLANK_STAGE2_CODE7_AT2671_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+EH3QfZB9UL0QvNC80PyQ/FD8ETvRO9E7kXtRexF60bqRupG6UfoR+dH5kjlSOVI5EnjSeJJ4UrgSuBK30veS91L3EzbTNtM2k3ZTdhN107WTtZO1U/UT9NP0lDSUNFQ0VHQUc9SzlPOVM1VzVfNWMxZzFrMW8xcy17LX8tgymLKY8pkyWbJZ8loyGrIashrx23Hbsdvx3HGcsZzxnXFdsV3xXnEesR7xHzDfcN+w4DCgcKCwoTChcGGwYjBicCKwIzAjL+Nv4+/kL6RvpO+lL2VvZe9mLyZvJq7m7ucu567n7qguqG5obmguKG3oLagtqG1oLSgs6CzoLKgsaCwoLCgr6CuoK2fraCsoKufqqCpn6mfqKCnn6afpp+ln6Sfo5+jn6KeoZ+gn6Cen5+en52enZ+cnpuemp+ZnpmemJ6Xnpaelp6VnpSdk56TnpKdkZ6QnZCdj56OnY2djZ6MnYudip2JnYmdiJ2HnYachp2FnYScg52DnIKcgZ2AnICcf51+nH2cfZx8nHucepx5nHmbeJx3nHabdpx1m3Sbc5xzm3KbcZtwm3Cbb5tum22bbZtsm2uaaptpm2maaJtnmmaaZptlmmSaY5pjmmKaYZpgmmCZX5peml2ZXZpcmluZWppZmVmZWJpXmVaZVplVmVSZU5lTmVKYUZlQmVCYT5lOmU2YTZlMmEuYSplJmEmYSJhHmEaYRphFmESXQ5hDmEKXQZhAl0CXP5g+lz2XPZg8lzuXOpc5lzmXOJc3lzaWNpc1lzSWM5czljKWMZcwljCWL5Yuli2WLZYsliuWKpYplimVKJYnliaVJpYllSSVI5YjlSKVIZUglSCVH5UelR2VHZUclRuUGpUalRmUGJUXlBaUFpUVlBSUE5QTlBKUEZQQlBCTD5QOlA2TDZQMlAuTCpQKkwmTCJQHkwaTBpMFkwSTA5MDkwKSAZMAkwCS");
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

const NINJA_STAGE4_AT3215_FIXED_TRACE_NES = decodeFixedCoordinateSamples("0ALFq9AExavQBsWr0AjFq9AKxavQDMWr0A7Fq9AQxavQEsWr0BTFq9AWxavQGMWr0BrFq9AcxavQHsWr0CDFq9AgxavQIMWr0CDFq9AgxavQIMWr0CDFq9AgxavQIMWr0CDFq9AgxavQIMWr0CDFq9AgxavQIMWr0CDFq9AgxavQIMWr0CDFq9AgxavQIMWr0CLFq9AkxavQJsWr0CjFq9AqxavQLMWr0C7Fq9AwxavQMsWr0DTFq9A2xavQOMWr0DrFq9A8xavQPsWr0EDFq9BCxavQRMWr0EbFq9BIxavQSsWr0EzFq9BOxavQUMWr0FLFq9BUxavQVsWr0FjFq9BaxavQXMWr0F7Fq9BgxavQYsWr0GTFq9BmxavQaMWr0GrFq9BsxavQbsWr0HDFq9ByxavQdMWr0HbFq9B4xavQesWr0HzFq9B+xavQgMWr0ILFq9CExavQhsWr0IjFq9CKxavQjMWr0I7Fq9CQxavQksWr0JTFq9CWxavQmMWr0JjFq9CYxavQmMWr0JjFq9CYxavQmMWr0JjFq9CYxavQmMWr0JjFq9CYxavQmMWr0JjFq9CYxavQmMWr0JjFq9CYxavQmMWr0JjFq9CYxavOlqnvzZGNM8uNcXfJiVW7x4Y5/8aDHUPEgAGHwn3ly8F7yQ+/ea1TvXiRl7t3ddu6d1kfuHc9Y7Z3Iae0dwXrtHcF67R3Beu0dwXrtHcF67R3Beu0dwXrtHcF67R3Beu0dwXrtHcF67R3Beu0dwXrtHcF67R3Beu0dwXrtHcF67R3Beu0dwXrtHcF67R3BeuzdOkvsnZRB7B3ud+veSG3rnqJj6178WesfVk/q37BF6mAKe+ogZHHp4L5n6aEYXelhclPpIcxJ6KImf+higHXoItpr5+M0YeejjlfnY+hN5yRCQ+aknHnmZPZv5iVQZeXlqlvlpgRR5WZeR+TmuH3kpxJz5GdsaeQnxl/j6CBV46h6S+No1EHi6S534qmIbeJp4mPiKjxZ4eqWT+Gq8EXhK0p74OukceCr/mfgbFhd4CyyU9/tDEnfbWZ/3y3Add7uGmvernRh3m7OV94vKE3d74JD3W/ced0wNm/c8JBl3LDqW9xxRFHcMZ5H27H4fdtyUnPbMqxp2vMGX9qzYFXac7pL2jQUQdm0bnfZdMht2TUiY9j1fFnYtdZP2HYwRdf2invX9Yp71/TKe9f0CnvX84p71/MKe9fyynvX8op71/KKe9fyynvX80p71/NKe9fzSnvX84p71/OKe9fzinvX88p71/PKe9fzynvX9Ap71/QKe9f0CnvX9Ep71/RKe9f0SnvX9Ip71/SKe9f0invX9Mp71/TKe9f0ynvX9Qp71/UKe9f1CnvX9Up71/VKe9f1SnvX9Yp71/WKe9f1invX9cp71/XKe9f1ynvX9gp71/YKe9f2CnvX9kp71/ZKe9f2SnvX9op71/aKe9f2invX9sp71/bKe9f2ynvX9wp71/cKe9f3CnvX90p71/dKe8=");
const NINJA_STAGE4_AT3215_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3215_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3407_FIXED_TRACE_NES = decodeFixedCoordinateSamples("4AKVj+AElY/gBpWP4AiVj+AKlY/gDJWP4A6Vj+AQlY/gEpWP4BSVj+AWlY/gGJWP4BqVj+AclY/gHpWP4CCVj+AglY/gIJWP4CCVj+AglY/gIJWP4CCVj+AglY/gIJWP4CCVj+AglY/gIJWP4CCVj+AglY/gIJWP4CCVj+AglY/gIJWP4CCVj+AglY/gIJWP4CKVj+AklY/gJpWP4CiVj+AqlY/gLJWP4C6Vj+AwlY/gMpWP4DSVj+A2lY/gOJWP4DqVj+A8lY/gPpWP4ECVj+BClY/gRJWP4EaVj+BIlY/gSpWP4EyVj+BOlY/gUJWP4FKVj+BUlY/gVpWP4FiVj+BalY/gXJWP4F6Vj+BglY/gYpWP4GSVj+BmlY/gaJWP4GqVj+BslY/gbpWP4HCVj+BylY/gdJWP4HaVj+B4lY/gepWP4HyVj+B+lY/ggJWP4IKVj+CElY/ghpWP4IiVj+CKlY/gjJWP4I6Vj+CQlY/gkpWP4JSVj+CWlY/gmJWP4JiVj+CYlY/gmJWP4JiVj+CYlY/gmJWP4JiVj+CYlY/gmJWP4JiVj+CYlY/gmJWP4JiVj+CYlY/gmJWP4JiVj+CYlY/gmJWP4JiVj+CYlY/elnnT3ZFdF9uNQVvZiSWf14YJ49aC7SfUf9Fr0n21r9B7mfPPeX03zXhhe8t3Rb/KdykDyHcNR8Z28YvEdtXPxHbVz8R21c/EdtXPxHbVz8R21c/EdtXPxHbVz8R21c/EdtXPxHbVz8R21c/EdtXPxHbVz8R21c/EdtXPxHbVz8R21c/EdtXPxHbVz8R21c/DdLkTwXYh68B3icO/ePGbvnpZc717wUu8fSkjun6R+7l/+dO4gWGrt4LJg7aEMVu1hZkztIcBC7KIaeOxidG7sIs5k6+MoWuujglDrY9xG6uQ2fOqkkHLqZOpo6iVEXunlnlTppfhK6WZSQOjmrHbopwZs6GdgYugnuljn6BRO56huROcoyHrm6SJw5ql8ZuZp1lzmKjBS5eqKSOVq5H7lKz505OuYauSr8mDkbExW5CymTOPtAELjbVp44y20buLuDmTirmha4m7CUOIvHEbhr3Z84W/QcuEwKmjg8IRe4LDeVOBxOErgMZJA37Hsdt9yRmzfMqBi3vL6WN6zVE7ec65E3fQIet20YnDddLxm3TUWXNz1cFLctcpI3DYkftv2fnTbtthq23cyYNs3jFba9+ZM2rhAQto4mnjZ+PRu2blOZNl5qFrZOgJQ2PpcRth6tnzYOxBy1/tqaNe7xF7XfB5U1zx4Stb80kDWfSx21j2GbNX94GLVvjpY1X6UTtU+7kTUv0h61H+icNQ//Gb");
const NINJA_STAGE4_AT3407_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3407_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT351_FIXED_TRACE_NES = decodeFixedCoordinateSamples("0AIA8NAEAPDQBgDw0AgA8NAKAPDQDADw0A4A8NAQAPDQEgDw0BQA8NAWAPDQGADw0BoA8NAcAPDQHgDw0CAA8NAgAPDQIADw0CAA8NAgAPDQIADw0CAA8NAgAPDQIADw0CAA8NAgAPDQIADw0CAA8NAgAPDQIADw0CAA8NAgAPDQIADw0CAA8NAgAPDQIADw0CIA8NAkAPDQJgDw0CgA8NAqAPDQLADw0C4A8NAwAPDQMgDw0DQA8NA2APDQOADw0DoA8NA8APDQPgDw0EAA8NBCAPDQRADw0EYA8NBIAPDQSgDw0EwA8NBOAPDQUADw0FIA8NBUAPDQVgDw0FgA8NBaAPDQXADw0F4A8NBgAPDQYgDw0GQA8NBmAPDQaADw0GoA8NBsAPDQbgDw0HAA8NByAPDQdADw0HYA8NB4APDQegDw0HwA8NB+APDQfgDw0H4A8NB+APDQfgDw0H4A8NB+APDQfgDw0H4A8NB+APDQfgDw0H4A8NB+APDQfgDw0H4A8NB+APDQfgDw0H4A8NB+APDQfgDw0H4A8M975DTNdsh4y3KsvMpukADIa3RExmhYiMRlPMzDYyAQwWEEVL9e6Ji9XczcvFywILpclGS4XHiotlxc7LVcQDC1XEAwtVxAMLVcQDC1XEAwtVxAMLVcQDC1XEAwtVxAMLVcQDC1XEAwtVxAMLVcQDC1XEAwtVxAMLVcQDC1XEAwtVxAMLVcQDC1XEAwtVxAMLNaJHSyW/7Usl3YNLFfspSwYYz0sGNmVK9lQLSvZxoUrmj0dK1qztStbKg0rG6ClKtwXPSrcjZUqnQQtKp16hSpd8R0qHme1Kh7eDSnfVKUpn8s9KaBBlSlguC0pYS6FKSGlHSjiG7Uo4pINKKMIpShjfz0oY/WVKCRsLSgk4oUn5VkdJ6XPtSemRg0nZrylJyczPScnqZUm6CAtJuiWhSapDR0maYO1Jmn6DSYqcKUl6uc9JetdlSWr1C0lrEqFJWzBHSUtN7UlLa4NJO4kpSSumz0krxGVJG+ILSRv/oUkMHUdJC91HSQutR0kLfUdJC11HSQs9R0kLLUdJCx1HSQsdR0kLLUdJCz1HSQs9R0kLTUdJC01HSQtNR0kLXUdJC11HSQtdR0kLbUdJC21HSQttR0kLfUdJC31HSQt9R0kLjUdJC41HSQuNR0kLnUdJC51HSQudR0kLrUdJC61HSQutR0kLvUdJC71HSQu9R0kLzUdJC81HSQvNR0kL3UdJC91HSQvdR0kL7UdJC+1HSQvtR0kL/UdJC/1HSQv9R0kMDUdJDA1HSQwNR0kMHUdJDB1HSQwdR0kMLUdJDC1HSQwtR0kMPUdJDD1HSQw9R0");
const NINJA_STAGE4_AT351_TRACE_SAMPLES_NES = NINJA_STAGE4_AT351_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT399_FIXED_TRACE_NES = decodeFixedCoordinateSamples("4AIAsOAEALDgBgCw4AgAsOAKALDgDACw4A4AsOAQALDgEgCw4BQAsOAWALDgGACw4BoAsOAcALDgHgCw4CAAsOAgALDgIACw4CAAsOAgALDgIACw4CAAsOAgALDgIACw4CAAsOAgALDgIACw4CAAsOAgALDgIACw4CAAsOAgALDgIACw4CAAsOAgALDgIACw4CIAsOAkALDgJgCw4CgAsOAqALDgLACw4C4AsOAwALDgMgCw4DQAsOA2ALDgOACw4DoAsOA8ALDgPgCw4EAAsOBCALDgRACw4EYAsOBIALDgSgCw4EwAsOBOALDgUACw4FIAsOBUALDgVgCw4FgAsOBaALDgXACw4F4AsOBgALDgYgCw4GQAsOBmALDgaACw4GoAsOBsALDgbgCw4HAAsOByALDgdACw4HYAsOB4ALDgegCw4HwAsOB+ALDgfgCw4H4AsOB+ALDgfgCw4H4AsOB+ALDgfgCw4H4AsOB+ALDgfgCw4H4AsOB+ALDgfgCw4H4AsOB+ALDgfgCw4H4AsOB+ALDgfgCw4H4AsN9/IFTdgED43IFgnNuCgEDZg6Dk2ITAiNeF4CzVhwDQ1IggdNOJQBjRimC80IuAYM+MoATNjcCozI7gTMqQAPDJkSCUyJJAOMaTYNzFlICAxJWgJMKWwMjBl+BswJkAEL6aILS9m0BYu5xg/LqdgKC5nqBEt5/A6Lag4Iy1ogAws6Mg1LKkQHixpWAcr6aAwK6noGStqMAIq6ngrKqrAFCorCD0p61AmKauYDykr4Dgo7CghKKxwCigsuDMn7QAcJ61IBSctkC4m7dgXJq4gACYuaCkl7rASJW74OyUvQCQk74gNJG/QNiQwGB8kLxgfJC5YHyQtmB8kLRgfJCyYHyQsWB8kLBgfJCwYHyQsWB8kLNgfJCzYHyQs2B8kLRgfJC0YHyQtGB8kLVgfJC1YHyQtWB8kLZgfJC2YHyQtmB8kLdgfJC3YHyQt2B8kLhgfJC4YHyQuGB8kLlgfJC5YHyQuWB8kLpgfJC6YHyQumB8kLtgfJC7YHyQu2B8kLxgfJC8YHyQvGB8kL1gfJC9YHyQvWB8kL5gfJC+YHyQvmB8kL9gfJC/YHyQv2B8kMBgfJDAYHyQwGB8kMFgfJDBYHyQwWB8kMJgfJDCYHyQwmB8kMNgfJDDYHw=");
const NINJA_STAGE4_AT399_TRACE_SAMPLES_NES = NINJA_STAGE4_AT399_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT943_FIXED_TRACE_NES = decodeFixedCoordinateSamples("qALSxqgE0saoBtLGqAjSxqgK0saoDNLGqA7SxqgQ0saoEtLGqBTSxqgW0saoGNLGqBrSxqgc0saoHtLGqCDSxqgg0saoINLGqCDSxqgg0saoINLGqCDSxqgg0saoINLGqCDSxqgg0saoINLGqCDSxqgg0saoINLGqCDSxqgg0saoINLGqCDSxqgg0saoINLGqCLSxqgk0saoJtLGqCjSxqgq0saoLNLGqC7Sxqgw0saoMtLGqDTSxqg20saoONLGqDrSxqg80saoPtLGqEDSxqhC0saoRNLGqEbSxqhI0saoStLGqEzSxqhO0saoUNLGqFLSxqhU0saoVtLGqFjSxqha0saoXNLGqF7Sxqhg0saoYtLGqGTSxqhm0saoaNLGqGrSxqhs0saobtLGqHDSxqhy0saodNLGqHbSxqh40saoetLGqHzSxqh+0saogNLGqILSxqiE0saohtLGqIjSxqiK0saojNLGqI7SxqiQ0saoktLGqJTSxqiW0saomNLGqJjSxqiY0saomNLGqJjSxqiY0saomNLGqJjSxqiY0saomNLGqJjSxqiY0saomNLGqJjSxqiY0saomNLGqJjSxqiY0saomNLGqJjSxqiY0saomtLGqJzSxqie0saooNLGqKLSxqik0saoptLGqKjSxqiq0saorNLGqK7Sxqiw0saostLGqLTSxqi20saouNLGqLrSxqi80saovtLGqMDSxqjC0saoxNLGqMbSxqjI0saoytLGqMzSxqjI0saoxdLGqMLSxqjA0saovtLGqL3Sxqi80saovNLGqL3Sxqi+0saovtLGqL/Sxqi/0saov9LGqMDSxqjA0saowNLGqMHSxqjB0saowdLGqMLSxqjC0saowtLGqMPSxqjD0saow9LGqMTSxqjE0saoxNLGqMXSxqjF0saoxdLGqMbSxqjG0saoxtLGqMfSxqjH0saox9LGqMjSxqjI0saoyNLGqMnSxqjJ0saoydLGqMrSxqjK0saoytLGqMvSxqjL0saoy9LGqMzSxqjM0saozNLGqM3SxqjN0saozdLGqM7SxqjO0saoztLG");
const NINJA_STAGE4_AT943_TRACE_SAMPLES_NES = NINJA_STAGE4_AT943_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT735_FIXED_TRACE_NES = decodeFixedCoordinateSamples("mAJR75gEUe+YBlHvmAhR75gKUe+YDFHvmA5R75gQUe+YElHvmBRR75gWUe+YGFHvmBpR75gcUe+YHlHvmCBR75ggUe+YIFHvmCBR75ggUe+YIFHvmCBR75ggUe+YIFHvmCBR75ggUe+YIFHvmCBR75ggUe+YIFHvmCBR75ggUe+YIFHvmCBR75ggUe+YIFHvmCJR75gkUe+YJlHvmChR75gqUe+YLFHvmC5R75gwUe+YMlHvmDRR75g2Ue+YOFHvmDpR75g8Ue+YPlHvmEBR75hCUe+YRFHvmEZR75hIUe+YSlHvmExR75hOUe+YUFHvmFJR75hUUe+YVlHvmFhR75haUe+YXFHvmF5R75hgUe+YYlHvmGRR75hmUe+YaFHvmGpR75hsUe+YblHvmHBR75hyUe+YdFHvmHZR75h4Ue+YelHvmHxR75h+Ue+YgFHvmIJR75iEUe+YhlHvmIhR75iKUe+YjFHvmI5R75iQUe+YklHvmJRR75iWUe+YmFHvmJhR75iYUe+YmFHvmJhR75iYUe+YmFHvmJhR75iYUe+YmFHvmJhR75iYUe+YmFHvmJhR75iYUe+YmFHvmJhR75iYUe+YmFHvmJhR75iYUe+ZmkM/mZw1j5meJ9+aoBkvmqILf5qj/c+bpe8fm6fhb5up07+cq8UPnK23X5yvqa+csZv/nbONT521f5+dt3HvnrljP567VY+evUffn785L5/BK3+fwx3PoMUPH6DHAW+gyPO/ocrlD6HM11+hyNdfocXXX6HC11+hwNdfob7XX6G911+hvNdfobzXX6G911+hvtdfob/XX6G/11+hv9dfocDXX6HA11+hwNdfocHXX6HB11+hwddfocLXX6HC11+hwtdfocPXX6HD11+hw9dfocTXX6HE11+hxNdfocXXX6HF11+hxddfocbXX6HG11+hxtdfocfXX6HH11+hx9dfocjXX6HI11+hyNdfocnXX6HJ11+hyddfocrXX6HK11+hytdfocvXX6HL11+hy9dfoczXX6HM11+hzNdfoc3XX6HN11+hzddfoc7XX6HO11+hztdfoc/XXw==");
const NINJA_STAGE4_AT735_TRACE_SAMPLES_NES = NINJA_STAGE4_AT735_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT735_FINE161_FIXED_TRACE_NES = decodeFixedCoordinateSamples("mAIFoZgEBaGYBgWhmAgFoZgKBaGYDAWhmA4FoZgQBaGYEgWhmBQFoZgWBaGYGAWhmBoFoZgcBaGYHgWhmCAFoZggBaGYIAWhmCAFoZggBaGYIAWhmCAFoZggBaGYIAWhmCAFoZggBaGYIAWhmCAFoZggBaGYIAWhmCAFoZggBaGYIAWhmCAFoZggBaGYIAWhmCIFoZgkBaGYJgWhmCgFoZgqBaGYLAWhmC4FoZgwBaGYMgWhmDQFoZg2BaGYOAWhmDoFoZg8BaGYPgWhmEAFoZhCBaGYRAWhmEYFoZhIBaGYSgWhmEwFoZhOBaGYUAWhmFIFoZhUBaGYVgWhmFgFoZhaBaGYXAWhmF4FoZhgBaGYYgWhmGQFoZhmBaGYaAWhmGoFoZhsBaGYbgWhmHAFoZhyBaGYdAWhmHYFoZh4BaGYegWhmHwFoZh+BaGYgAWhmIIFoZiEBaGYhgWhmIgFoZiKBaGYjAWhmI4FoZiQBaGYkgWhmJQFoZiWBaGYmAWhmJgFoZiYBaGYmAWhmJgFoZiYBaGYmAWhmJgFoZiYBaGYmAWhmJgFoZiYBaGYmAWhmJgFoZiYBaGYmAWhmJgFoZiYBaGYmAWhmJgFoZiYBaGWlenllZDNKZOMsW2RiJWxj4V59Y6CXTmMf0F9in0lwYl7CQWHeO1JhXfRjYN2tdGCdpkVgHZ9WX52YZ18dkXhfHZF4Xx2ReF8dkXhfHZF4Xx2ReF8dkXhfHZF4Xx2ReF8dkXhfHZF4Xx2ReF8dkXhfHZF4Xx2ReF8dkXhfHZF4Xx2ReF8dkXhfHZF4Xx2ReF7dCklfHIN4X5s8Z2AaNVZgmS5FYNhndGFXoGNh1tlSYlZSQWKVy3BjFURfY5T9TmPUtn1kVK9sZNSoW2VUoUpllJp5ZZSaeWWUmnlllJp5ZZSaeWWUmnlllJp5ZZSaeWWUmnlllJp5ZZSaeWWUmnlllJp5ZZSaeWWUmnlllJp5ZZSaeWWUmnlllJp5ZZSaeWWUmnlmFBNoZZOMeWVSRUpk0T5bZFA3bGPPcH1jjqlOYw3iX2KNW3BiTNRBYcxNUmFMBmNgy790YIu4RWALsVZfi6pnXwujeF8Lo3hfC6N4XwujeF8Lo3hfC6N4XwujeF8Lo3hfC6N4XwujeF8Lo3hfC6N4XwujeF8Lo3hfC6N4XwujeF8Lo3hfC6N4XwujeF8Lo3hfC6N4XsscSV8KlXhfiU5nYAhHVmCHQEVgxnl0YUWyY2HE61JiRGRBYoPdcGMDVl9jgw9OY8LIfWRCwWxkwrpbZUKzSmWCrHllgqx5ZYKseWWCrHllgqx5ZYKseWWCrHllgqx5ZYKseWWCrHllgqx5ZYKseWWCrHllgqx5ZYKseWWCrHllgqx5ZYKseWWCrHllgqx5ZYKseWYCJWhlgZ55ZUBXSk=");
const NINJA_STAGE4_AT735_FINE161_TRACE_SAMPLES_NES = NINJA_STAGE4_AT735_FINE161_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT767_FIXED_TRACE_NES = decodeFixedCoordinateSamples("2AJCM9gEQjPYBkIz2AhCM9gKQjPYDEIz2A5CM9gQQjPYEkIz2BRCM9gWQjPYGEIz2BpCM9gcQjPYHkIz2CBCM9ggQjPYIEIz2CBCM9ggQjPYIEIz2CBCM9ggQjPYIEIz2CBCM9ggQjPYIEIz2CBCM9ggQjPYIEIz2CBCM9ggQjPYIEIz2CBCM9ggQjPYIEIz2CJCM9gkQjPYJkIz2ChCM9gqQjPYLEIz2C5CM9gwQjPYMkIz2DRCM9g2QjPYOEIz2DpCM9g8QjPYPkIz2EBCM9hCQjPYREIz2EZCM9hIQjPYSkIz2ExCM9hOQjPYUEIz2FJCM9hUQjPYVkIz2FhCM9haQjPYXEIz2F5CM9hgQjPYYkIz2GRCM9hmQjPYaEIz2GpCM9hsQjPYbkIz2HBCM9hyQjPYdEIz2HZCM9h4QjPYekIz2HxCM9h+QjPYgEIz2IJCM9iEQjPYhkIz2IhCM9iKQjPYjEIz2I5CM9iQQjPYkkIz2JRCM9iWQjPYmEIz2JhCM9iYQjPYmEIz2JhCM9iYQjPYmEIz2JhCM9iYQjPYmEIz2JhCM9iYQjPYmEIz2JhCM9iYQjPYmEIz2JhCM9iYQjPYmEIz2JhCM9iYQjPWliZ31JEKu9KM7v/RiNJDz4W2h82CmsvMf34Pyn1iU8h7RpfGeSrbxXgOH8N28mPBdtanv3a66752ni+8doJzvHaCc7x2gnO8doJzvHaCc7x2gnO8doJzvHaCc7x2gnO8doJzvHaCc7x2gnO8doJzvHaCc7x2gnO8doJzvHaCc7x2gnO8doJzvHaCc7x2gnO6dGa3unZYZ7p4She5ejzHuXwud7l+ICe4gBLXuIIEh7iD9je3hejnt4fal7eJzEe2i773to2wp7aPole2kZQHtZOGt7WVeGe1l2oXtJlcx7SbTne0nUAns58y17OhJIezoxY3sqUI57Km+peyqOxHsare97Gs0KexrsJXsbC0B7CyprewtJhnsLaKF6+4fMevum53r7xgJ66+UteuwESHrsI2N63EKOetxhqXrcgMR6zJ/vesy/CnrM3iV6zJ4lesxuJXrMPiV6zB4lesv+JXrL7iV6y94lesveJXrL7iV6y/4lesv+JXrMDiV6zA4leswOJXrMHiV6zB4lesweJXrMLiV6zC4leswuJXrMPiV6zD4lesw+JXrMTiV6zE4lesxOJXrMXiV6zF4lesxeJXrMbiV6zG4lesxuJXrMfiV6zH4lesx+JXrMjiV6zI4lesyOJXrMniV6zJ4lesyeJXrMriV6zK4lesyuJXrMviV6zL4lesy+JXrMziV6zM4leszOJXrM3iV6zN4leszeJXrM7iV6zO4leszuJXrM/iV6zP4lesz+JX");
const NINJA_STAGE4_AT767_TRACE_SAMPLES_NES = NINJA_STAGE4_AT767_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1247_FIXED_TRACE_NES = decodeFixedCoordinateSamples("yALUy8gE1MvIBtTLyAjUy8gK1MvIDNTLyA7Uy8gQ1MvIEtTLyBTUy8gW1MvIGNTLyBrUy8gc1MvIHtTLyCDUy8gg1MvIINTLyCDUy8gg1MvIINTLyCDUy8gg1MvIINTLyCDUy8gg1MvIINTLyCDUy8gg1MvIINTLyCDUy8gg1MvIINTLyCDUy8gg1MvIINTLyCLUy8gk1MvIJtTLyCjUy8gq1MvILNTLyC7Uy8gw1MvIMtTLyDTUy8g21MvIONTLyDrUy8g81MvIPtTLyEDUy8hC1MvIRNTLyEbUy8hI1MvIStTLyEzUy8hO1MvIUNTLyFLUy8hU1MvIVtTLyFjUy8ha1MvIXNTLyF7Uy8hg1MvIYtTLyGTUy8hm1MvIaNTLyGrUy8hs1MvIbtTLyHDUy8hy1MvIdNTLyHbUy8h41MvIetTLyHzUy8h+1MvIgNTLyILUy8iE1MvIhtTLyIjUy8iK1MvIjNTLyI7Uy8iQ1MvIktTLyJTUy8iW1MvImNTLyJjUy8iY1MvImNTLyJjUy8iY1MvImNTLyJjUy8iY1MvImNTLyJjUy8iY1MvImNTLyJjUy8iY1MvImNTLyJjUy8iY1MvImNTLyJjUy8iY1MvHlrgPxZGcU8ONgJfBiWTbwIZIH76DLGO8gBCnun3067l72C+3ebxztXigt7N3hPuyd2g/sHdMg653MMetdxQLrXcUC613FAutdxQLrXcUC613FAutdxQLrXcUC613FAutdxQLrXcUC613FAutdxQLrXcUC613FAutdxQLrXcUC613FAutdxQLrXcUC613FAurdPhPqXLck6dtwNemaaQbpGWIX6JibKOgX1Dnn1w0K51aGG+bV/yzmVXg95hUxDuWU6h/lFOMw5NTcAeRU1RLj1M4j49TOI+PUziPj1M4j49TOI+PUziPj1M4j49TOI+PUziPj1M4j49TOI+PUziPj1M4j49TOI+PUziPj1M4j49TOI+PUziPj1M4j49TOI+PUziPjVEc049PAI+RSeRLk0XIB5RBrMOWPpB/mDt0O5k4WPebNjyznTQgb58yBCugMOjnoi/Mo6QvsF+mL5Qbpy9416kvXJOpL1yTqS9ck6kvXJOpL1yTqS9ck6kvXJOpL1yTqS9ck6kvXJOpL1yTqS9ck6kvXJOpL1yTqS9ck6kvXJOpL1yTqS9ck6kvXJOpL1yTqS9ck6stQE+pKySTpyYI16Yh7BukHdBfohq0o6AXmOefFHwrnRJgb5sQRLOZDij3mA0MO5YL8H+UC9TDkwu4B5ELnEuPC4CPjwuAj48LgI+PC4CPjwuAj48LgI+PC4CPjwuAj48LgI+PC4CPjwuAj48LgI+PC4CPjwuAj48LgI+PC4CPjwuAj48LgI+PC4CPjwuAj48LgI+NCWTTjAdIF4oCLFs=");
const NINJA_STAGE4_AT1247_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1247_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1279_FIXED_TRACE_NES = decodeFixedCoordinateSamples("qALUuKgE1LioBtS4qAjUuKgK1LioDNS4qA7UuKgQ1LioEtS4qBTUuKgW1LioGNS4qBrUuKgc1LioHtS4qCDUuKgg1LioINS4qCDUuKgg1LioINS4qCDUuKgg1LioINS4qCDUuKgg1LioINS4qCDUuKgg1LioINS4qCDUuKgg1LioINS4qCDUuKgg1LioINS4qCLUuKgk1LioJtS4qCjUuKgq1LioLNS4qC7UuKgw1LioMtS4qDTUuKg21LioONS4qDrUuKg81LioPtS4qEDUuKhC1LioRNS4qEbUuKhI1LioStS4qEzUuKhO1LioUNS4qFLUuKhU1LioVtS4qFjUuKha1LioXNS4qF7UuKhg1LioYtS4qGTUuKhm1LioaNS4qGrUuKhs1LiobtS4qHDUuKhy1LiodNS4qHbUuKh41LioetS4qHzUuKh+1LiogNS4qILUuKiE1LiohtS4qIjUuKiK1LiojNS4qI7UuKiQ1LioktS4qJTUuKiW1LiomNS4qJjUuKiY1LiomNS4qJjUuKiY1LiomNS4qJjUuKiY1LiomNS4qJjUuKiY1LiomNS4qJjUuKiY1LiomNS4qJjUuKiY1LiomNS4qJjUuKiY1Limlrj8pZGcQKONgIShiWTIoIZIDJ6DLFCcgBCUmn302Jl72ByXebxglXigpJN3hOiSd2gskHdMcI53MLSMdxT4jHcU+Ix3FPiMdxT4jHcU+Ix3FPiMdxT4jHcU+Ix3FPiMdxT4jHcU+Ix3FPiMdxT4jHcU+Ix3FPiMdxT4jHcU+Ix3FPiMdxT4jHcU+Ix3FPiLdPg8jHLc+I5twLSQaaRwkmWILJNibOiVX1Ckl1w0YJlaGByaV/zYnFXglJ5UxFCgU6gMoVOMyKNTcISlU1RAplM4/KZTOPymUzj8plM4/KZTOPymUzj8plM4/KZTOPymUzj8plM4/KZTOPymUzj8plM4/KZTOPymUzj8plM4/KZTOPymUzj8plM4/KZTOPymUzj8qFEcuKhTHLioVRy4qFccuKhZHLioWxy4qF0cuKhfHLioYRy4qGMcuKhlHLioZxy4qGkcuKhrHLiobRy4qG8cuKhxHLiocxy4qHUcuKh3HLioeRy4qHscuKh9HLiofxy4qIEcuKiDHLiohRy4qIccuKiJHLioixy4qI0cuKiPHLiokRy4qJMcuKiVHLiolxy4qJkcuKibHLionRy4qJ8cuKihHLiooxy4qKUcuKinHLioqRy4qKscuKitHLiorxy4qLEcuKizHLiotRy4qLccuKi5HLiouxy4qL0cuKi/HLiowRy4qMMcuKjFHLioxxy4qMkcuKjLHLiozRy4qMkcuKjGHLiowxy4qMEcuKi/HLiovhy4qL0cuKi9HLiovhy4qMAcuKjAHLiowBy4qMEcuKjBHLiowRy4qMIcuKjCHLiowhy4qMMcuKjDHLiowxy4qMQcuKjEHLioxBy4qMUcuKjFHLioxRy4qMYcuKjGHLioxhy4qMccuKjHHLioxxy4qMgcuKjIHLioyBy4qMkcuKjJHLioyRy4qMocuKjKHLioyhy4qMscuKjLHLioyxy4qMwcuKjMHLiozBy4qM0cuKjNHLiozRy4qM4cuKjOHLiozhy4qM8cuKjPHLiozxy4qNAcuKjQHLg=");
const NINJA_STAGE4_AT1279_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1279_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1375_FIXED_TRACE_NES = decodeFixedCoordinateSamples("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");
const NINJA_STAGE4_AT1375_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1375_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1391_FIXED_TRACE_NES = decodeFixedCoordinateSamples("yAIcuMgEHLjIBhy4yAgcuMgKHLjIDBy4yA4cuMgQHLjIEhy4yBQcuMgWHLjIGBy4yBocuMgcHLjIHhy4yCAcuMggHLjIIBy4yCAcuMggHLjIIBy4yCAcuMggHLjIIBy4yCAcuMggHLjIIBy4yCAcuMggHLjIIBy4yCAcuMggHLjIIBy4yCAcuMggHLjIIBy4yCIcuMgkHLjIJhy4yCgcuMgqHLjILBy4yC4cuMgwHLjIMhy4yDQcuMg2HLjIOBy4yDocuMg8HLjIPhy4yEAcuMhCHLjIRBy4yEYcuMhIHLjIShy4yEwcuMhOHLjIUBy4yFIcuMhUHLjIVhy4yFgcuMhaHLjIXBy4yF4cuMhgHLjIYhy4yGQcuMhmHLjIaBy4yGocuMhsHLjIbhy4yHAcuMhyHLjIdBy4yHYcuMh4HLjIehy4yHwcuMh+HLjIgBy4yIIcuMiEHLjIhhy4yIgcuMiKHLjIjBy4yI4cuMiQHLjIkhy4yJQcuMiWHLjImBy4yJgcuMiYHLjImBy4yJgcuMiYHLjImBy4yJgcuMiYHLjImBy4yJgcuMiYHLjImBy4yJgcuMiYHLjImBy4yJgcuMiYHLjImBy4yJgcuMiYHLjGlgD8xZDkQMOMyITBiKzIwIWQDL6CdFC8f1iUun082Ll7IBy3eQRgtXfopLN2zOiydrAssHaUcK52eLSsdlz4rHZc+Kx2XPisdlz4rHZc+Kx2XPisdlz4rHZc+Kx2XPisdlz4rHZc+Kx2XPisdlz4rHZc+Kx2XPisdlz4rHZc+Kx2XPisdlz4rHZc+Kx2XPirdEA8q3ZAPKt4QDyrekA8q3xAPKt+QDyrgEA8q4JAPKuEQDyrhkA8q4hAPKuKQDyrjEA8q45APKuQQDyrkkA8q5RAPKuWQDyrmEA8q5pAPKucQDyrnkA8q6BAPKuiQDyrpEA8q6ZAPKuoQDyrqkA8q6xAPKuuQDyrsEA8q7JAPKu0QDyrtkA8q7hAPKu6QDyrvEA8q75APKvAQDyrwkA8q8RAPKvGQDyryEA8q8pAPKvMQDyryEA8q8VAPKvCQDyrwEA8q75APKu9QDyrvEA8q7xAPKu9QDyrvkA8q79APKu/QDyrv0A8q8BAPKvAQDyrwEA8q8FAPKvBQDyrwUA8q8JAPKvCQDyrwkA8q8NAPKvDQDyrw0A8q8RAPKvEQDyrxEA8q8VAPKvFQDyrxUA8q8ZAPKvGQDyrxkA8q8dAPKvHQDyrx0A8q8hAPKvIQDyryEA8q8lAPKvJQDyryUA8q8pAPKvKQDyrykA8q8tAPKvLQDyry0A8q8xAPKvMQDyrzEA8q81APKvNQDyrzUA8q85APKvOQDyrzkA8q89APA==");
const NINJA_STAGE4_AT1391_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1391_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1407_FIXED_TRACE_NES = decodeFixedCoordinateSamples("kAK2ZJAEtmSQBrZkkAi2ZJAKtmSQDLZkkA62ZJAQtmSQErZkkBS2ZJAWtmSQGLZkkBq2ZJActmSQHrZkkCC2ZJAgtmSQILZkkCC2ZJAgtmSQILZkkCC2ZJAgtmSQILZkkCC2ZJAgtmSQILZkkCC2ZJAgtmSQILZkkCC2ZJAgtmSQILZkkCC2ZJAgtmSQILZkkCK2ZJAktmSQJrZkkCi2ZJAqtmSQLLZkkC62ZJAwtmSQMrZkkDS2ZJA2tmSQOLZkkDq2ZJA8tmSQPrZkkEC2ZJBCtmSQRLZkkEa2ZJBItmSQSrZkkEy2ZJBOtmSQULZkkFK2ZJBUtmSQVrZkkFi2ZJBatmSQXLZkkF62ZJBgtmSQYrZkkGS2ZJBmtmSQaLZkkGq2ZJBstmSQbrZkkHC2ZJBytmSQdLZkkHa2ZJB4tmSQerZkkHy2ZJB+tmSQgLZkkIK2ZJCEtmSQhrZkkIi2ZJCKtmSQjLZkkI62ZJCQtmSQkrZkkJS2ZJCWtmSQmLZkkJi2ZJCYtmSQmLZkkJi2ZJCYtmSQmLZkkJi2ZJCYtmSQmLZkkJi2ZJCYtmSQmLZkkJi2ZJCYtmSQmLZkkJi2ZJCYtmSQmLZkkJi2ZJCYtmSOlpqojJF+7IuNYjCJiUZ0h4YquIWDDvyEf/JAgn3WhIB7ush/eZ4MfXiCUHt3ZpR5d0rYeHcuHHZ3EmB0dvakdHb2pHR29qR0dvakdHb2pHR29qR0dvakdHb2pHR29qR0dvakdHb2pHR29qR0dvakdHb2pHR29qR0dvakdHb2pHR29qR0dvakdHb2pHR29qRydNroc3a0iHR4jih0emjIdXxCaHZ+HAh2f/aod4HQSHeDquh4hYSIeYdeKHmJOMh6ixJoe4zsCHuOxqh8kKBIfJJ66H2UVIh+li4ofpgIyH+Z4miAm7wIgJ2WqIGfcEiBoUrogqMkiIOk/iiDptjIhKiyaIWqjAiFrGaohq5ASIawGuiHsfSIiLPOKIi1qMiJt4JoirlcCIq7NqiLvRBIi77q6IzAxIiNwp4ojcR4yI7GUmiPyCwIj8oGqJDL4EiQzbrokc+UiJLRbiiS00jIk9UiaJTW/AiU2NaolNjWqJTY1qiU2NaolNjWqJTY1qiU2NaolNjWqJTY1qiU2NaolNjWqJTY1qiU2NaolNjWqJTY1qiU2NaolNjWqJTY1qiU2NaolNjWqJTY1qiV2rBIldmK6JbZZIiX2T4ol9oYyJja8miZ28wImd2mqJrfgEia4Vrom+Q0iJznDiic6ujIne7CaJ7ynAie9naonvZ2qJ72dqie9naonvZ2qJ72dqie9naonvZ2qJ72dqie9naonvZ2qJ72dqie9naonvZ2qJ72dqie9naonvZ2qJ72dqie9naonvZ2qJ72dqif+FBIn/ZemJ/0bOig8no4oPCIiKDultih7KQooeqyeKHowMii5s4YouTcaKLi6rii3uq4otvquKLY6rii1uq4otTquKLT6rii0uq4otLquKLT6rii1Oq4otXquKLV6rii1eq4otbquKLW6rii1uq4otfquKLX6rii1+q4otjquKLY6rii2Oq4otnquKLZ6rii2eq4otrquKLa6rii2uq4otvquKLb6rii2+q4otzquKLc6rii3Oq4ot3quKLd6rii3eq4ot7quKLe6rii3uq4ot/quKLf6rii3+q4ouDquKLg6rii4Oq4ouHquKLh6rii4eq4ouLquKLi6rii4uq4ouPquKLj6rii4+q4ouTquKLk6rii5Oq4ouXquA==");
const NINJA_STAGE4_AT1407_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1407_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1551_FIXED_TRACE_NES = decodeFixedCoordinateSamples("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");
const NINJA_STAGE4_AT1551_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1551_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1567_FIXED_TRACE_NES = decodeFixedCoordinateSamples("mALMUZgEzFGYBsxRmAjMUZgKzFGYDMxRmA7MUZgQzFGYEsxRmBTMUZgWzFGYGMxRmBrMUZgczFGYHsxRmCDMUZggzFGYIMxRmCDMUZggzFGYIMxRmCDMUZggzFGYIMxRmCDMUZggzFGYIMxRmCDMUZggzFGYIMxRmCDMUZggzFGYIMxRmCDMUZggzFGYIMxRmCLMUZgkzFGYJsxRmCjMUZgqzFGYLMxRmC7MUZgwzFGYMsxRmDTMUZg2zFGYOMxRmDrMUZg8zFGYPsxRmEDMUZhCzFGYRMxRmEbMUZhIzFGYSsxRmEzMUZhOzFGYUMxRmFLMUZhUzFGYVsxRmFjMUZhazFGYXMxRmF7MUZhgzFGYYsxRmGTMUZhmzFGYaMxRmGrMUZhszFGYbsxRmHDMUZhyzFGYdMxRmHbMUZh4zFGYesxRmHzMUZh+zFGYgMxRmILMUZiEzFGYhsxRmIjMUZiKzFGYjMxRmI7MUZiQzFGYksxRmJTMUZiWzFGYmMxRmJjMUZiYzFGYmMxRmJjMUZiYzFGYmMxRmJjMUZiYzFGYmMxRmJjMUZiYzFGYmMxRmJjMUZiYzFGYmMxRmJjMUZiYzFGYmMxRmJjMUZiYzFGWlrCVlJGU2ZONeB2RiVxhj4ZApY2DJOmMgAgtin3scYh70LWGebT5hXiYPYN3fIGBd2DFgHdECX53KE18dwyRfHcMkXx3DJF8dwyRfHcMkXx3DJF8dwyRfHcMkXx3DJF8dwyRfHcMkXx3DJF8dwyRfHcMkXx3DJF8dwyRfHcMkXx3DJF8dwyRfHcMkXx3DJF6dPDVe3bKdXx4pBV8en61fXxYVX1+MvV+gAyVf4HmNX+DwNWAhZp1gYd0FYGJTrWCiyhVgo0C9YOO3JWEkLY1hJKQ1YWUanWGlkQVhpgetYeZ+FWHm9L1iJ2slYmfhjWJoWDViqM6dYulFBWLpu61jKjIVYyqovWNrHyVjq5WNY6wMNWPsgp1kLPkFZC1vrWRt5hVkbly9ZK7TJWTvSY1k78A1ZTA2nWVwrQVlcSOtZbGaFWWyEL1l8oclZjL9jWYzdDVmc+qdZrRhBWa0161m9U4VZvXEvWc2OyVndrGNZ3coNWe3np1n+BUFZ/iLrWg5AhVoOXi9aHnvJWi6ZY1outw1aPtSnWk7yQVpPD+taXy2FWl9LL1pvaMlaf4ZjWn+kDVqPwadan99BWp/861");
const NINJA_STAGE4_AT1567_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1567_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1743_FIXED_TRACE_NES = decodeFixedCoordinateSamples("kAIuWJAELliQBi5YkAguWJAKLliQDC5YkA4uWJAQLliQEi5YkBQuWJAWLliQGC5YkBouWJAcLliQHi5YkCAuWJAgLliQIC5YkCAuWJAgLliQIC5YkCAuWJAgLliQIC5YkCAuWJAgLliQIC5YkCAuWJAgLliQIC5YkCAuWJAgLliQIC5YkCAuWJAgLliQIC5YkCIuWJAkLliQJi5YkCguWJAqLliQLC5YkC4uWJAwLliQMi5YkDQuWJA2LliQOC5YkDouWJA8LliQPi5YkEAuWJBCLliQRC5YkEYuWJBILliQSi5YkEwuWJBOLliQUC5YkFIuWJBULliQVi5YkFguWJBaLliQXC5YkF4uWJBgLliQYi5YkGQuWJBmLliQaC5YkGouWJBsLliQbi5YkHAuWJByLliQdC5YkHYuWJB4LliQei5YkHwuWJB+LliQgC5YkIIuWJCELliQhi5YkIguWJCKLliQjC5YkI4uWJCQLliQki5YkJQuWJCWLliQmC5YkJguWJCYLliQmC5YkJguWJCYLliQmC5YkJguWJCYLliQmC5YkJguWJCYLliQmC5YkJguWJCYLliQmC5YkJguWJCYLliQmC5YkJguWJCYLliOlhKcjJD24IuM2iSJiL5oh4WirIWChvCEf2o0gn1OeIB7Mrx/eRYAfXf6RHt23oh5dsLMeHamEHZ2ilR0dm6YdHZumHR2bph0dm6YdHZumHR2bph0dm6YdHZumHR2bph0dm6YdHZumHR2bph0dm6YdHZumHR2bph0dm6YdHZumHR2bph0dm6YdHZumHR2bphydFLcc3YsfHR4Bhx0eeC8dXu6XHV9lPx2f26cd4FIPHeDItx4hPx8eYbWHHmIsLx6iopceoxk/HuOPpx8kBg8fJHy3H2TzHx+laYcfpeAvH+ZWlx/mzT8gJ0OnIGe6DyBoMLcgqKcfIOkdhyDplC8hKgqXISqBPyFq96chq24PIavktyHsWx8iLNGHIi1ILyJtvpcibjU/Iq6rpyLvIg8i75i3IzAPHyNwhYcjcPwvI7FylyOx6T8j8l+nJDLWDyQzTLckc8MfJLQ5hyS0sC8k9SaXJPWdPyU2E6cldooPJXcAtyW3dx8l9+2HJfhkLyY42pcmOVE/JnnHpya6Pg8murS3JvsrHyc7oYcnPBgvJ3yOlyd9BT8nvXunJ/3yDyf+aLcoPt8fKH9Vhyh/zC8");
const NINJA_STAGE4_AT1743_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1743_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1855_FIXED_TRACE_NES = decodeFixedCoordinateSamples("cALNzHAEzcxwBs3McAjNzHAKzcxwDM3McA7NzHAQzcxwEs3McBTNzHAWzcxwGM3McBrNzHAczcxwHs3McCDNzHAgzcxwIM3McCDNzHAgzcxwIM3McCDNzHAgzcxwIM3McCDNzHAgzcxwIM3McCDNzHAgzcxwIM3McCDNzHAgzcxwIM3McCDNzHAgzcxwIM3McCLNzHAkzcxwJs3McCjNzHAqzcxwLM3McC7NzHAwzcxwMs3McDTNzHA2zcxwOM3McDrNzHA8zcxwPs3McEDNzHBCzcxwRM3McEbNzHBIzcxwSs3McEzNzHBOzcxwUM3McFLNzHBUzcxwVs3McFjNzHBazcxwXM3McF7NzHBgzcxwYs3McGTNzHBmzcxwaM3McGrNzHBszcxwbs3McHDNzHByzcxwdM3McHbNzHB4zcxwes3McHzNzHB+zcxwgM3McILNzHCEzcxwhs3McIjNzHCKzcxwjM3McI7NzHCQzcxwks3McJTNzHCWzcxwmM3McJjNzHCYzcxwmM3McJjNzHCYzcxwmM3McJjNzHCYzcxwmM3McJjNzHCYzcxwmM3McJjNzHCYzcxwmM3McJjNzHCYzcxwmM3McJjNzHCYzcxylrGIdJGVRHaNeQB3iV28eYZBeHuDJTR8gAnwfn3trIB70WiCebUkg3iZ4IV3fZyHd2FYiXdFFIp3KdCMdw2MjHcNjIx3DYyMdw2MjHcNjIx3DYyMdw2MjHcNjIx3DYyMdw2MjHcNjIx3DYyMdw2MjHcNjIx3DYyMdw2MjHcNjIx3DYyMdw2MjHcNjIx3DYyOdPFIjnbjmI541eiPesc4j3y5iI9+q9iQgJ0okIKPeJCEgciRhnMYkYhlaJGKV7iSjEkIko47WJKQLaiSkh/4k5QRSJOWA5iTl/XolJnnOJSb2YiUncvYlZ+9KJWhr3iVo6HIlqWTGJanhWiWqXe4l6tpCJetW1iXr02ol7E/+JizMUiYtSOYmLcV6Jm5BziZuvmImbzr2Jq+3SiawM94msLByJvEsxibxqVom8iXuJzKiQiczHtYnM5tqJzQX/id0lFIndRDmJ3WNeie2Cc4ntoZiJ7cC9if3f0on9/veJ/h4cig49MYoOXFaKDnt7ih6akIoeubWKHtjaih73/4ovFxSKLzY5ii9VXoo/dHOKP5OYij+yvYpP0dKKT/D3g=");
const NINJA_STAGE4_AT1855_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1855_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1887_FIXED_TRACE_NES = decodeFixedCoordinateSamples("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");
const NINJA_STAGE4_AT1887_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1887_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1919_FIXED_TRACE_NES = decodeFixedCoordinateSamples("QALs+0AE7PtABuz7QAjs+0AK7PtADOz7QA7s+0AQ7PtAEuz7QBTs+0AW7PtAGOz7QBrs+0Ac7PtAHuz7QCDs+0Ag7PtAIOz7QCDs+0Ag7PtAIOz7QCDs+0Ag7PtAIOz7QCDs+0Ag7PtAIOz7QCDs+0Ag7PtAIOz7QCDs+0Ag7PtAIOz7QCDs+0Ag7PtAIOz7QCLs+0Ak7PtAJuz7QCjs+0Aq7PtALOz7QC7s+0Aw7PtAMuz7QDTs+0A27PtAOOz7QDrs+0A87PtAPuz7QEDs+0BC7PtAROz7QEbs+0BI7PtASuz7QEzs+0BO7PtAUOz7QFLs+0BU7PtAVuz7QFjs+0Ba7PtAXOz7QF7s+0Bg7PtAYuz7QGTs+0Bm7PtAaOz7QGrs+0Bs7PtAbuz7QHDs+0By7PtAdOz7QHbs+0B47PtAeuz7QHzs+0B+7PtAgOz7QILs+0CE7PtAhuz7QIjs+0CK7PtAjOz7QI7s+0CQ7PtAkuz7QJTs+0CW7PtAmOz7QJjs+0CY7PtAmOz7QJjs+0CY7PtAmOz7QJjs+0CY7PtAmOz7QJjs+0CY7PtAmOz7QJjs+0CY7PtAmOz7QJjs+0CY7PtAmOz7QJjs+0CY7PtCltC3RJG0c0aNmC9HiXzrSYZgp0uDRGNNgCgfTn4M21B78JdSedRTVHi4D1V3nMtXd4CHWXdkQ1p3SP9cdyy7XHcsu1x3LLtcdyy7XHcsu1x3LLtcdyy7XHcsu1x3LLtcdyy7XHcsu1x3LLtcdyy7XHcsu1x3LLtcdyy7XHcsu1x3LLtcdyy7XHcsu1x3LLtedRB3YHL0M2Ft2O9jabyrZWWgZ2dihCNoX2jfalxMm2xaMFduWBQTb1X4z3FU3ItzU8BHdVOkA3ZTiL94U2x7elNQN3pTUDd6U1A3elNQN3pTUDd6U1A3elNQN3pTUDd6U1A3elNQN3pTUDd6U1A3elNQN3pTUDd6U1A3elNQN3pTUDd6U1A3elNQN3pTUDd6U1A3e1E083pPGDd4Sfx7dkXgv3VBxANzPqhHcTuMi284cM9uNlQTbDQ4V2oyHJtoMQDfZy/kI2UvyGdjL6yrYS+Q72AvdDNgL3QzYC90M2AvdDNgL3QzYC90M2AvdDNgL3QzYC90M2AvdDNgL3QzYC90M2AvdDNgL3QzYC90M2AvdDNgL3QzYC90M2AvdDNgL3QzYC90M14tWHdfLzIXXzEMt2Ay5ldgNMD3YTaal2I4dDdiOk7XYzwod2Q+AhdkP9y3ZUG2V2VDkPdmRWqXZ0dEN2dJHtdoSvh3aUzSF2lOrLdqUIZXalJg92tUOpdsVhQ3bFfu121ZyHduW6IXbl18t29fVldvYTD3cGMKl3Fk5DdxZr7XcmiYd3NqchdzbEy3dG4mV3RwAPd1cdqXdnO0N3Z1jtd3d2h3eHlCF3h7HLd5fPZXeX7Q93qAqpd7goQ3e4Re13yGOHd9iBIXfYnst36Lxld+jaD3f496l4CRVDeAky7XgZUId4KW4heCmLy3g5qWV4OccPeEnkqXhaAkN4Wh/teGo9h3h6WyF4enjLeIqWZXiKtA94mtGpeKrvQ3irDO14uyqHeMtIIXjLZct424NleNuhD3jrvql4+9xDePv57XkMF4d5HDUheRxSy3kscGV5LI4PeTyrqXlMyUN5TObteV0Eh3ltIiF5bT/LeX1dZXl9ew95jZipeZ22Q3md0+15rfGHeb4PIXm+LMt5zkplec5oD3nehal57qNDee7A7Xn+3od6Dvwheg8Zy3ofN2V6H1UPei9yqXo/kEN6P5BDej+QQ3o/kEN6P5BDej+QQ3o/kEN6P5BDej+QQ3o/kEN6P5BDej+QQ3o/kEN6P5BDej+QQ3o/kEN6P5BDej+QQ3o/kEN6P5BDej+QQ3o/re16T5uHel+ZIXpflst6b6Rlem+yD3p/v6l6j91Deo/67X");
const NINJA_STAGE4_AT1919_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1919_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2015_FIXED_TRACE_NES = decodeFixedCoordinateSamples("UAKF0lAEhdJQBoXSUAiF0lAKhdJQDIXSUA6F0lAQhdJQEoXSUBSF0lAWhdJQGIXSUBqF0lAchdJQHoXSUCCF0lAghdJQIIXSUCCF0lAghdJQIIXSUCCF0lAghdJQIIXSUCCF0lAghdJQIIXSUCCF0lAghdJQIIXSUCCF0lAghdJQIIXSUCCF0lAghdJQIIXSUCKF0lAkhdJQJoXSUCiF0lAqhdJQLIXSUC6F0lAwhdJQMoXSUDSF0lA2hdJQOIXSUDqF0lA8hdJQPoXSUECF0lBChdJQRIXSUEaF0lBIhdJQSoXSUEyF0lBOhdJQUIXSUFKF0lBUhdJQVoXSUFiF0lBahdJQXIXSUF6F0lBghdJQYoXSUGSF0lBmhdJQaIXSUGqF0lBshdJQboXSUHCF0lByhdJQdIXSUHaF0lB4hdJQeoXSUHyF0lB+hdJQgIXSUIKF0lCEhdJQhoXSUIiF0lCKhdJQjIXSUI6F0lCQhdJQkoXSUJSF0lCWhdJQmIXSUJiF0lCYhdJQmIXSUJiF0lCYhdJQmIXSUJiF0lCYhdJQmIXSUJiF0lCYhdJQmIXSUJiF0lCYhdJQmIXSUJiF0lCYhdJQmIXSUJiF0lCYhdJSlmmOVJFNSlaNMQZXiRXCWYX5fluC3Tpcf8H2Xn2lsmB7iW5ieW0qY3hR5mV3NaJndxleaXb9Gmp24dZsdsWSbHbFkmx2xZJsdsWSbHbFkmx2xZJsdsWSbHbFkmx2xZJsdsWSbHbFkmx2xZJsdsWSbHbFkmx2xZJsdsWSbHbFkmx2xZJsdsWSbHbFkmx2xZJudKlObXab/m14ja5ten9ebXxxDmx+Y75sgFVubIJHHmuEOc5rhit+a4gdLmqKD95qjAGOao3zPmmP5e5pkdeeaZPJTmiVu/5ol62uaJmfXmibkQ5nnYO+Z591bmehZx5mo1nOZqVLfmanPS5lqS/eZashjmWtEz5krwXuZLD3nmSy6U5jtNv+Y7bNrmO4v15jurEOYryjvmK+lW5iwIceYcJ5zmHEa35hxl0uYMhP3mDKQY5gzDM+YMgzPmDFMz5gwjM+YMAzPmC+Mz5gvTM+YLwzPmC8Mz5gvTM+YL8zPmC/Mz5gvzM+YMAzPmDAMz5gwDM+YMEzPmDBMz5gwTM+YMIzPmDCMz5gwjM+YMMzPmDDMz5gwzM+YMQzPmDEMz5gxDM+YMUzPmDFMz5gxTM+YMYzPmDGMz5gxjM+YMczPmDHMz5gxzM+YMgzPmDIMz5gyDM+YMkzPmDJMz5gyTM+YMozPmDKMz5gyjM+YMszPmDLMz5gyzM+YMwzPmDMMz5gzDM+YM0zPmDNMz5gzTM+YM4zPmDOMz5gzjM+YM8zPmDPMz4=");
const NINJA_STAGE4_AT2015_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2015_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2207_FIXED_TRACE_NES = decodeFixedCoordinateSamples("OAKEJDgEhCQ4BoQkOAiEJDgKhCQ4DIQkOA6EJDgQhCQ4EoQkOBSEJDgWhCQ4GIQkOBqEJDgchCQ4HoQkOCCEJDgghCQ4IIQkOCCEJDgghCQ4IIQkOCCEJDgghCQ4IIQkOCCEJDgghCQ4IIQkOCCEJDgghCQ4IIQkOCCEJDgghCQ4IIQkOCCEJDgghCQ4IIQkOCKEJDgkhCQ4JoQkOCiEJDgqhCQ4LIQkOC6EJDgwhCQ4MoQkODSEJDg2hCQ4OIQkODqEJDg8hCQ4PoQkOECEJDhChCQ4RIQkOEaEJDhIhCQ4SoQkOEyEJDhOhCQ4UIQkOFKEJDhUhCQ4VoQkOFiEJDhahCQ4XIQkOF6EJDhghCQ4YoQkOGSEJDhmhCQ4aIQkOGqEJDhshCQ4boQkOHCEJDhyhCQ4dIQkOHaEJDh4hCQ4eoQkOHyEJDh+hCQ4gIQkOIKEJDiEhCQ4hoQkOIiEJDiKhCQ4jIQkOI6EJDiQhCQ4koQkOJSEJDiWhCQ4mIQkOJiEJDiYhCQ4mIQkOJiEJDiYhCQ4mIQkOJiEJDiYhCQ4mIQkOJiEJDiYhCQ4mIQkOJiEJDiYhCQ4mIQkOJiEJDiYhCQ4mIQkOJiEJDiYhCQ5lmjgO5FMnD2NMFg/iRQUQIX40EKC3IxEf8BIRn2kBEd7iMBJeWx8S3hQOEx3NPROdxiwUHb8bFJ24ChTdsTkU3bE5FN2xORTdsTkU3bE5FN2xORTdsTkU3bE5FN2xORTdsTkU3bE5FN2xORTdsTkU3bE5FN2xORTdsTkU3bE5FN2xORTdsTkU3bE5FN2xORVdKigVXaooFV4qKBVeqigVXyooFV+qKBVgKigVYKooFWEqKBVhqigVYiooFWKqKBVjKigVY6ooFWQqKBVkqigVZSooFWWqKBVmKigVZqooFWcqKBVnqigVaCooFWiqKBVpKigVaaooFWoqKBVqqigVayooFWuqKBVsKigVbKooFW0qKBVtqigVbiooFW6qKBVvKigVb6ooFXAqKBVwqigVcSooFXGqKBVyKigVcqooFXMqKBVyKigVcWooFXCqKBVwKigVb6ooFW9qKBVvKigVbyooFW9qKBVvqigVb+ooFW/qKBVv6igVcCooFXAqKBVwKigVcGooFXBqKBVwaigVcKooFXCqKBVwqigVcOooFXDqKBVw6igVcSooFXEqKBVxKigVcWooFXFqKBVxaigVcaooFXGqKBVxqigVceooFXHqKBVx6igVciooFXIqKBVyKigVcmooFXJqKBVyaigVcqooFXKqKBVyqigVcuooFXLqKBVy6igVcyooFXMqKBVzKigVc2ooFXNqKBVzaigVc6ooFXOqKBVzqigVc+ooA==");
const NINJA_STAGE4_AT2207_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2207_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2207_INDEX170_FIXED_TRACE_NES = decodeFixedCoordinateSamples("OAIA8DgEAPA4BgDwOAgA8DgKAPA4DADwOA4A8DgQAPA4EgDwOBQA8DgWAPA4GADwOBoA8DgcAPA4HgDwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCIA8DgkAPA4JgDwOCgA8DgqAPA4LADwOC4A8DgwAPA4MgDwODQA8Dg2APA4OADwODoA8Dg8APA4PgDwOEAA8DhCAPA4RADwOEYA8DhIAPA4SgDwOEwA8DhOAPA4UADwOFIA8DhUAPA4VgDwOFgA8DhaAPA4XADwOF4A8DhgAPA4YgDwOGQA8DhmAPA4aADwOGoA8DhsAPA4bgDwOHAA8DhyAPA4dADwOHYA8Dh4APA4egDwOHwA8Dh+APA4gADwOIIA8DiEAPA4hgDwOIgA8DiKAPA4jADwOI4A8DiQAPA4kgDwOJQA8DiWAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA5mdqQOpu0MDqdjtA7n2hwPKFCEDyjHLA9pPZQPabQ8D6oqpA/qoQwP6xe0ECuOHBBsBIQQbHssEKzxlBCtaDwQ7d6kES5VDBEuy7QRb0IcEa+4hBGwLywR8KWUEfEcPBIxkqQScgkMEnJ/tBKy9hwS82yEEvPjLBM0WZQTNNA8E3VGpBO1vQwTtjO0E/aqHBQ3IIQUNiCEFDVghBQ0oIQUNCCEFDOghBQzYIQUMyCEFDMghBQzYIQUM+CEFDPghBQz4IQUNCCEFDQghBQ0IIQUNGCEFDRghBQ0YIQUNKCEFDSghBQ0oIQUNOCEFDTghBQ04IQUNSCEFDUghBQ1IIQUNWCEFDVghBQ1YIQUNaCEFDWghBQ1oIQUNeCEFDXghBQ14IQUNiCEFDYghBQ2IIQUNmCEFDZghBQ2YIQUNqCEFDaghBQ2oIQUNuCEFDbghBQ24IQUNyCEFDcghBQ3IIQUN2CEFDdghBQ3YIQUN6CEFDeghBQ3oIQUN+CEFDfghA=");
const NINJA_STAGE4_AT2207_INDEX170_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2207_INDEX170_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2559_FIXED_TRACE_NES = decodeFixedCoordinateSamples("gAIA8IAEAPCABgDwgAgA8IAKAPCADADwgA4A8IAQAPCAEgDwgBQA8IAWAPCAGADwgBoA8IAcAPCAHgDwgCAA8IAgAPCAIADwgCAA8IAgAPCAIADwgCAA8IAgAPCAIADwgCAA8IAgAPCAIADwgCAA8IAgAPCAIADwgCAA8IAgAPCAIADwgCAA8IAgAPCAIADwgCIA8IAkAPCAJgDwgCgA8IAqAPCALADwgC4A8IAwAPCAMgDwgDQA8IA2APCAOADwgDoA8IA8APCAPgDwgEAA8IBCAPCARADwgEYA8IBIAPCASgDwgEwA8IBOAPCAUADwgFIA8IBUAPCAVgDwgFgA8IBaAPCAXADwgF4A8IBgAPCAYgDwgGQA8IBmAPCAaADwgGoA8IBsAPCAbgDwgHAA8IByAPCAdADwgHYA8IB4APCAegDwgHwA8IB+APCAgADwgIIA8ICEAPCAhgDwgIgA8ICKAPCAjADwgI4A8ICQAPCAkgDwgJQA8ICWAPCAmADwgJgA8ICYAPCAmADwgJgA8ICYAPCAmADwgJgA8ICYAPCAmADwgJgA8ICYAPCAmADwgJgA8ICYAPCAmADwgJgA8ICYAPCAmADwgJgA8ICYAPCAmagGf5tQHH6c+DJ9nqBIfKBIXnuh8HR6o5iKeaVAoHim6LZ3qJDMdqo44nWr4Ph1rYgOdK8wJHOw2DpysoBQcbQoZnC10Hxvt3iSbrkgqG26yL5svHDUa74Y6mu/wABqwWgWacMQLGjEuEJnxmBYZsgIbmXJsIRky1iaY80AsGLOqMZh0FDcYNH48mDN+PJgyvjyYMf48mDF+PJgw/jyYML48mDB+PJgwfjyYML48mDD+PJgw/jyYMT48mDE+PJgxPjyYMX48mDF+PJgxfjyYMb48mDG+PJgxvjyYMf48mDH+PJgx/jyYMj48mDI+PJgyPjyYMn48mDJ+PJgyfjyYMr48mDK+PJgyvjyYMv48mDL+PJgy/jyYMz48mDM+PJgzPjyYM348mDN+PJgzfjyYM748mDO+PJgzvjyYM/48mDP+PJgz/jyYND48mDQ+PJg0PjyYNH48mDR+PJg0fjyYNL48mDS+PJg0vjyYNP48mDT+PJg0/jy");
const NINJA_STAGE4_AT2559_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2559_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2607_FIXED_TRACE_NES = decodeFixedCoordinateSamples("UAIA8FAEAPBQBgDwUAgA8FAKAPBQDADwUA4A8FAQAPBQEgDwUBQA8FAWAPBQGADwUBoA8FAcAPBQHgDwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCIA8FAkAPBQJgDwUCgA8FAqAPBQLADwUC4A8FAwAPBQMgDwUDQA8FA2APBQOADwUDoA8FA8APBQPgDwUEAA8FBCAPBQRADwUEYA8FBIAPBQSgDwUEwA8FBOAPBQUADwUFIA8FBUAPBQVgDwUFgA8FBaAPBQXADwUF4A8FBgAPBQYgDwUGQA8FBmAPBQaADwUGoA8FBsAPBQbgDwUHAA8FByAPBQdADwUHYA8FB4APBQegDwUHwA8FB+APBQgADwUIIA8FCEAPBQhgDwUIgA8FCKAPBQjADwUI4A8FCQAPBQkgDwUJQA8FCWAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBSleSsVJDIaFaMrCRXiJDgWYV0nFuCWFhdfzwUXn0g0GB7BIxieOhIZHfMBGV2sMBndpR8aXZ4OGp2XPRsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBudCRsbnYWHG14CMxtefp8bXvsLGx93txsf9CMbIHCPGuDtOxrhaaca4eYTGqJivxqi3ysao1uXGqPYAxpkVK8aZNEbGmVNhxolyjMaJkafGibDCxnnP7cZ57wjGeg4jxmotTsZqTGnGamuExlqKr8ZaqcrGWsjlxlroAMZLByvGSyZGxktFYcY7ZIzGO4OnxjuiwsYrwe3GK+EIxiwAI8YcH07GHD5pxhxdhMYMfK/GDJvKxgy65cYM2gDGDJoAxgxqAMYMOgDGDBoAxgv6AMYL6gDGC9oAxgvaAMYL6gDGC/oAxgv6AMYMCgDGDAoAxgwKAMYMGgDGDBoAxgwaAMYMKgDGDCoAxgwqAMYMOgDGDDoAxgw6AMYMSgDGDEoAxgxKAMYMWgDGDFoAxgxaAMYMagDGDGoAxgxqAMYMegDGDHoAxgx6AMYMigDGDIoAxgyKAMYMmgDGDJoAxgyaAMYMqgDGDKoAxgyqAMYMugDGDLoAxgy6AMYMygDGDMoAxgzKAMYM2gDGDNoAxgzaAMYM6gDGDOoAxgzqAMYM+gDGDPoAxgz6AM");
const NINJA_STAGE4_AT2607_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2607_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2623_FIXED_TRACE_NES = decodeFixedCoordinateSamples("cAIA8HAEAPBwBgDwcAgA8HAKAPBwDADwcA4A8HAQAPBwEgDwcBQA8HAWAPBwGADwcBoA8HAcAPBwHgDwcCAA8HAgAPBwIADwcCAA8HAgAPBwIADwcCAA8HAgAPBwIADwcCAA8HAgAPBwIADwcCAA8HAgAPBwIADwcCAA8HAgAPBwIADwcCAA8HAgAPBwIADwcCIA8HAkAPBwJgDwcCgA8HAqAPBwLADwcC4A8HAwAPBwMgDwcDQA8HA2APBwOADwcDoA8HA8APBwPgDwcEAA8HBCAPBwRADwcEYA8HBIAPBwSgDwcEwA8HBOAPBwUADwcFIA8HBUAPBwVgDwcFgA8HBaAPBwXADwcF4A8HBgAPBwYgDwcGQA8HBmAPBwaADwcGoA8HBsAPBwbgDwcHAA8HByAPBwdADwcHYA8HB4APBwegDwcHwA8HB+APBwgADwcIIA8HCEAPBwhgDwcIgA8HCKAPBwjADwcI4A8HCQAPBwkgDwcJQA8HCWAPBwmADwcJgA8HCYAPBwmADwcJgA8HCYAPBwmADwcJgA8HCYAPBwmADwcJgA8HCYAPBwmADwcJgA8HCYAPBwmADwcJgA8HCYAPBwmADwcJgA8HCYAPByleSsdJDIaHaMrCR3iJDgeYV0nHuCWFh9fzwUfn0g0IB7BIyCeOhIhHfMBIV2sMCHdpR8iXZ4OIp2XPSMdkCwjHZAsIx2QLCMdkCwjHZAsIx2QLCMdkCwjHZAsIx2QLCMdkCwjHZAsIx2QLCMdkCwjHZAsIx2QLCMdkCwjHZAsIx2QLCMdkCwjHZAsIx2QLCOdCRsjHIIsIps7PSJaNA4h2S0fIVhmMCEXnwEgltgSIBZRIx+VyjQfVUMFHtT8Fh5UtScd1K44HZSnCR0UoBoclJkrHJSZKxyUmSsclJkrHJSZKxyUmSsclJkrHJSZKxyUmSsclJkrHJSZKxyUmSsclJkrHJSZKxyUmSsclJkrHJSZKxyUmSsclJkrHJSZKxyUmSscFBI8HBSOqBwVCxQcFYeAG9YELBvWgJgb1v0EG5d5sBuX9hwbmHKIG1jvNBtZa6AbWegMGxpkuBsa4SQbG12QGtvaPBrcVqga3NMUGt1PgBqdzCwankiYGp7FBBpfQbAaX74cGmA6iBogtzQaITOgGiGwDBniLLgZ4qkkGeMlkBmjojwZpB6oGaSbFBmlF4AZZZQsGWYQmBlmjQQZJwmwGSeGHBkoAogY6H80GOj7oBjpeAwYqfS4GKpxJBiq7ZAYa2o8GGvmqBhsYxQYbN+AGC1cLBgt2JgYLlUEF+7RsBfvThwX78qIF7BHNBeww6AXsUAMF3G8uBdyOSQXcrWQFzMyPBcyMjwXMXI8FzCyPBcwMjwXL7I8Fy9yPBcvMjwXLzI8Fy9yPBcvsjwXL/I8Fy/yPBcv8jwXMDI8FzAyPBcwMjwXMHI8FzByPBcwcjwXMLI8FzCyPBcwsjwXMPI8FzDyPBcw8jwXMTI8FzEyPBcxMjwXMXI8FzFyPBcxcjwXMbI8FzGyPBcxsjwXMfI8FzHyPBcx8jwXMjI8FzIyPBcyMjwXMnI8FzJyPBcycjwXMrI8FzKyPBcysjwXMvI8FzLyPBcy8jwXMzI8FzMyPBczMjwXM3I8FzNyPBczcjwXM7I8FzOyPBczsjwXM/I8A==");
const NINJA_STAGE4_AT2623_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2623_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2639_FIXED_TRACE_NES = decodeFixedCoordinateSamples("KAIA8CgEAPAoBgDwKAgA8CgKAPAoDADwKA4A8CgQAPAoEgDwKBQA8CgWAPAoGADwKBoA8CgcAPAoHgDwKCAA8CggAPAoIADwKCAA8CggAPAoIADwKCAA8CggAPAoIADwKCAA8CggAPAoIADwKCAA8CggAPAoIADwKCAA8CggAPAoIADwKCAA8CggAPAoIADwKCIA8CgkAPAoJgDwKCgA8CgqAPAoLADwKC4A8CgwAPAoMgDwKDQA8Cg2APAoOADwKDoA8Cg8APAoPgDwKEAA8ChCAPAoRADwKEYA8ChIAPAoSgDwKEwA8ChOAPAoUADwKFIA8ChUAPAoVgDwKFgA8ChaAPAoXADwKF4A8ChgAPAoYgDwKGQA8ChmAPAoaADwKGoA8ChsAPAobgDwKHAA8ChyAPAodADwKHYA8Ch4APAoegDwKHwA8Ch+APAogADwKIIA8CiEAPAohgDwKIgA8CiKAPAojADwKI4A8CiQAPAokgDwKJQA8CiWAPAomADwKJgA8CiYAPAomADwKJgA8CiYAPAomADwKJgA8CiYAPAomADwKJgA8CiYAPAomADwKJgA8CiYAPAomADwKJgA8CiYAPAomADwKJgA8CiYAPAqleSsLJDIaC6MrCQviJDgMYV0nDOCWFg1fzwUNn0g0Dh7BIw6eOhIPHfMBD12sMA/dpR8QXZ4OEJ2XPREdkCwRHZAsER2QLBEdkCwRHZAsER2QLBEdkCwRHZAsER2QLBEdkCwRHZAsER2QLBEdkCwRHZAsER2QLBEdkCwRHZAsER2QLBEdkCwRHZAsER2QLBGdCRsRnYWvEd4CAxHefpcR3vsrEd93vxIf9BMSIHCnEiDtOxJhaY8SYeYjEmJitxKi3wsSo1ufEqPYMxLkVIcS5NEbEuVNrxMlygMTJkaXEybDKxMnP78TZ7wTE2g4pxNotTsTqTGPE6muIxOqKrcT6qcLE+sjnxProDMULByHFCyZGxQtFa8UbZIDFG4OlxRuiysUbwe/FK+EExSwAKcUsH07FPD5jxTxdiMU8fK3FTJvCxUy658VM2gzFTJoMxUxqDMVMOgzFTBoMxUv6DMVL6gzFS9oMxUvaDMVL6gzFS/oMxUv6DMVMCgzFTAoMxUwKDMVMGgzFTBoMxUwaDMVMKgzFTCoMxUwqDMVMOgzFTDoMxUw6DMVMSgzFTEoMxUxKDMVMWgzFTFoMxUxaDMVMagzFTGoMxUxqDMVMegzFTHoMxUx6DMVMigzFTIoMxUyKDMVMmgzFTJoMxUyaDMVMqgzFTKoMxUyqDMVMugzFTLoMxUy6DMVMygzFTMoMxUzKDMVM2gzFTNoMxUzaDMVM6gzFTOoMxUzqDMVM+gzFTPoMxUz6DM");
const NINJA_STAGE4_AT2639_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2639_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2751_FIXED_TRACE_NES = decodeFixedCoordinateSamples("GAIA8BgEAPAYBgDwGAgA8BgKAPAYDADwGA4A8BgQAPAYEgDwGBQA8BgWAPAYGADwGBoA8BgcAPAYHgDwGCAA8BggAPAYIADwGCAA8BggAPAYIADwGCAA8BggAPAYIADwGCAA8BggAPAYIADwGCAA8BggAPAYIADwGCAA8BggAPAYIADwGCAA8BggAPAYIADwGCIA8BgkAPAYJgDwGCgA8BgqAPAYLADwGC4A8BgwAPAYMgDwGDQA8Bg2APAYOADwGDoA8Bg8APAYPgDwGEAA8BhCAPAYRADwGEYA8BhIAPAYSgDwGEwA8BhOAPAYUADwGFIA8BhUAPAYVgDwGFgA8BhaAPAYXADwGF4A8BhgAPAYYgDwGGQA8BhmAPAYaADwGGoA8BhsAPAYbgDwGHAA8BhyAPAYdADwGHYA8Bh4APAYegDwGHwA8Bh+APAYgADwGIIA8BiEAPAYhgDwGIgA8BiKAPAYjADwGI4A8BiQAPAYkgDwGJQA8BiWAPAYmADwGJgA8BiYAPAYmADwGJgA8BiYAPAYmADwGJgA8BiYAPAYmADwGJgA8BiYAPAYmADwGJgA8BiYAPAYmADwGJgA8BiYAPAYmADwGJgA8BiYAPAaleSsHJDIaB6MrCQfiJDgIYV0nCOCWFglfzwUJn0g0Ch7BIwqeOhILHfMBC12sMAvdpR8MXZ4ODJ2XPQ0dkCwNHZAsDR2QLA0dkCwNHZAsDR2QLA0dkCwNHZAsDR2QLA0dkCwNHZAsDR2QLA0dkCwNHZAsDR2QLA0dkCwNHZAsDR2QLA0dkCwNHZAsDR2QLA2dCRsNnYWvDd4CAw3efpcN3vsrDd93vw4f9BMOIHCnDiDtOw5haY8OYeYjDmJitw6i3wsOo1ufDqPYMw7kVIcO5NEbDuVNrw8lygMPJkaXDybDKw8nP78PZ7wTD2g4pw9otTsPqTGPD6muIw+qKrcP6qcLD+sjnw/roDMQLByHECyZGxAtFa8QbZIDEG4OlxBuiysQbwe/EK+EExCwAKcQsH07EPD5jxDxdiMQ8fK3ETJvCxEy658RM2gzEXPkhxF0YRsRdN2vEbVaAxG11pcRtlMrEbbPvxH3TBMR98inEfhFOxI4wY8SOT4jEjm6txJ6NwsSerOfEnswMxK7rIcSvCkbErylrxL9IgMS/Z6XEv4bKxL+l78TPxQTEz+Qpw=");
const NINJA_STAGE4_AT2751_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2751_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2767_FIXED_TRACE_NES = decodeFixedCoordinateSamples("UAIALFAEACxQBgAsUAgALFAKACxQDAAsUA4ALFAQACxQEgAsUBQALFAWACxQGAAsUBoALFAcACxQHgAsUCAALFAgACxQIAAsUCAALFAgACxQIAAsUCAALFAgACxQIAAsUCAALFAgACxQIAAsUCAALFAgACxQIAAsUCAALFAgACxQIAAsUCAALFAgACxQIAAsUCIALFAkACxQJgAsUCgALFAqACxQLAAsUC4ALFAwACxQMgAsUDQALFA2ACxQOAAsUDoALFA8ACxQPgAsUEAALFBCACxQRAAsUEYALFBIACxQSgAsUEwALFBOACxQUAAsUFIALFBUACxQVgAsUFgALFBaACxQXAAsUF4ALFBgACxQYgAsUGQALFBmACxQaAAsUGoALFBsACxQbgAsUHAALFByACxQdAAsUHYALFB4ACxQegAsUHwALFB+ACxQgAAsUIIALFCEACxQhgAsUIgALFCKACxQjAAsUI4ALFCQACxQkgAsUJQALFCWACxQmAAsUJgALFCYACxQmAAsUJgALFCYACxQmAAsUJgALFCYACxQmAAsUJgALFCYACxQmAAsUJgALFCYACxQmAAsUJgALFCYACxQmAAsUJgALFCYACxRleToU5DIpFWMrGBXiJAcWIV02FqCWJRcfzxQXn0gDF97BMhheOiEY3fMQGR2sPxmdpS4aHZ4dGp2XDBrdkDsa3ZA7Gt2QOxrdkDsa3ZA7Gt2QOxrdkDsa3ZA7Gt2QOxrdkDsa3ZA7Gt2QOxrdkDsa3ZA7Gt2QOxrdkDsa3ZA7Gt2QOxrdkDsa3ZA7Gt2QOxtdCSob3IIZHFs7CByaNDcdGS0mHZhmFR4XnwQeVtgzHtZRIh9VyhEf1UMAIBT8LyCUtR4hFK4NIVSnPCHUoCsiVJkaIlSZGiJUmRoiVJkaIlSZGiJUmRoiVJkaIlSZGiJUmRoiVJkaIlSZGiJUmRoiVJkaIlSZGiJUmRoiVJkaIlSZGiJUmRoiVJkaIlSZGiJUmRoi1BIJIlOLGiHSRCshUT08IRA2DSCPbx4gDqgvH83hAB9NWhEezNMiHkxMMx4MBQQdi74VHQu3JhyLsDccS6kIG8uiGRvLohkby6IZG8uiGRvLohkby6IZG8uiGRvLohkby6IZG8uiGRvLohkby6IZG8uiGRvLohkby6IZG8uiGRvLohkby6IZG8uiGRvLohkby6IZG0sbKhtLmyobTBsqG0ybKhtNGyobTZsqG04bKhtOmyobTxsqG0+bKhtQGyobUJsqG1EbKhtRmyobUhsqG1KbKhtTGyobU5sqG1QbKhtUmyobVRsqG1WbKhtWGyobVpsqG1cbKhtXmyobWBsqG1ibKhtZGyobWZsqG1obKhtamyobWxsqG1ubKhtcGyobXJsqG10bKhtdmyobXhsqG16bKhtfGyobX5sqG2AbKhtgmyobYRsqG2GbKhtiGyobYpsqG2MbKhtjmyobZBsqG2SbKhtlGyobZZsqG2YbKhtmmyobZxsqG2ebKhtoGyobaJsqG2kbKhtpmyobahsqG2qbKhtrGyoba5sqG2wbKhtsmyobbRsqG22bKhtuGyobbpsqG28bKhtvmyobcBsqG3CbKhtxGyobcZsqG3IbKhtymyobcxsqG3ObKht0GyobdJsqG3UbKht1myobdhsqG3abKht3Gyobd5sqG3gbKht4myobeRsqG3mbKht6GyobepsqG3sbKht7myobfBsqG3ybKht9GyobfZsqG34bKht+myobfxsqG3+bKg=");
const NINJA_STAGE4_AT2767_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2767_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2815_FIXED_TRACE_NES = decodeFixedCoordinateSamples("SAIA8EgEAPBIBgDwSAgA8EgKAPBIDADwSA4A8EgQAPBIEgDwSBQA8EgWAPBIGADwSBoA8EgcAPBIHgDwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCIA8EgkAPBIJgDwSCgA8EgqAPBILADwSC4A8EgwAPBIMgDwSDQA8Eg2APBIOADwSDoA8Eg8APBIPgDwSEAA8EhCAPBIRADwSEYA8EhIAPBISgDwSEwA8EhOAPBIUADwSFIA8EhUAPBIVgDwSFgA8EhaAPBIXADwSF4A8EhgAPBIYgDwSGQA8EhmAPBIaADwSGoA8EhsAPBIbgDwSHAA8EhyAPBIdADwSHYA8Eh4APBIegDwSHwA8Eh+APBIgADwSIIA8EiEAPBIhgDwSIgA8EiKAPBIjADwSI4A8EiQAPBIkgDwSJQA8EiWAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBKleSsTJDIaE6MrCRPiJDgUYV0nFOCWFhVfzwUVn0g0Fh7BIxaeOhIXHfMBF12sMBfdpR8YXZ4OGJ2XPRkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBmdCRsZnYWHGV4CMxlefp8ZXvsLGR93txkf9CMZIHCPGODtOxjhaacY4eYTGKJivxii3ysYo1uXGKPYAxhkVK8YZNEbGGVNhxglyjMYJkafGCbDCxfnP7cX57wjF+g4jxeotTsXqTGnF6muExdqKr8XaqcrF2sjlxdroAMXLByvFyyZGxctFYcW7ZIzFu4OnxbuiwsWrwe3Fq+EIxawAI8WcH07FnD5pxZxdhMWMfK/FjJvKxYy65cWM2gDFjJoAxYxqAMWMOgDFjBoAxYv6AMWL6gDFi9oAxYvaAMWL6gDFi/oAxYv6AMWMCgDFjAoAxYwKAMWMGgDFjBoAxYwaAMWMKgDFjCoAxYwqAMWMOgDFjDoAxYw6AMWMSgDFjEoAxYxKAMWMWgDFjFoAxYxaAMWMagDFjGoAxYxqAMWMegDFjHoAxYx6AMWMigDFjIoAxYyKAMWMmgDFjJoAxYyaAMWMqgDFjKoAxYyqAMWMugDFjLoAxYy6AMWMygDFjMoAxYzKAMWM2gDFjNoAxYzaAMWM6gDFjOoAxYzqAMWM+gDFjPoAxYz6AM");
const NINJA_STAGE4_AT2815_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2815_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2879_FIXED_TRACE_NES = decodeFixedCoordinateSamples("WAIA8FgEAPBYBgDwWAgA8FgKAPBYDADwWA4A8FgQAPBYEgDwWBQA8FgWAPBYGADwWBoA8FgcAPBYHgDwWCAA8FggAPBYIADwWCAA8FggAPBYIADwWCAA8FggAPBYIADwWCAA8FggAPBYIADwWCAA8FggAPBYIADwWCAA8FggAPBYIADwWCAA8FggAPBYIADwWCIA8FgkAPBYJgDwWCgA8FgqAPBYLADwWC4A8FgwAPBYMgDwWDQA8Fg2APBYOADwWDoA8Fg8APBYPgDwWEAA8FhCAPBYRADwWEYA8FhIAPBYSgDwWEwA8FhOAPBYUADwWFIA8FhUAPBYVgDwWFgA8FhaAPBYXADwWF4A8FhgAPBYYgDwWGQA8FhmAPBYaADwWGoA8FhsAPBYbgDwWHAA8FhyAPBYdADwWHYA8Fh4APBYegDwWHwA8Fh+APBYgADwWIIA8FiEAPBYhgDwWIgA8FiKAPBYjADwWI4A8FiQAPBYkgDwWJQA8FiWAPBYmADwWJgA8FiYAPBYmADwWJgA8FiYAPBYmADwWJgA8FiYAPBYmADwWJgA8FiYAPBYmADwWJgA8FiYAPBYmADwWJgA8FiYAPBYmADwWJgA8FiYAPBYmgDwWJwA8FieAPBYoADwWKIA8FikAPBYpgDwWKgA8FiqAPBYrADwWK4A8FiwAPBYsgDwWLQA8Fi2APBYuADwWLoA8Fi8APBYvgDwWMAA8FjCAPBYxADwWMYA8FjIAPBYygDwWMwA8FjIAPBYxQDwWMIA8FjAAPBYvgDwWL0A8Fi8APBYvADwWL0A8Fi+APBYvgDwWL8A8Fi/APBYvwDwWMAA8FjAAPBYwADwWMEA8FjBAPBYwQDwWMIA8FjCAPBYwgDwWMMA8FjDAPBYwwDwWMQA8FjEAPBYxADwWMUA8FjFAPBYxQDwWMYA8FjGAPBYxgDwWMcA8FjHAPBYxwDwWMgA8FjIAPBYyADwWMkA8FjJAPBYyQDwWMoA8FjKAPBYygDwWMsA8FjLAPBYywDwWMwA8FjMAPBYzADwWM0A8FjNAPBYzQDwWM4A8FjOAPBYzgDw");
const NINJA_STAGE4_AT2879_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2879_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2911_FIXED_TRACE_NES = decodeFixedCoordinateSamples("SAIA8EgEAPBIBgDwSAgA8EgKAPBIDADwSA4A8EgQAPBIEgDwSBQA8EgWAPBIGADwSBoA8EgcAPBIHgDwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCIA8EgkAPBIJgDwSCgA8EgqAPBILADwSC4A8EgwAPBIMgDwSDQA8Eg2APBIOADwSDoA8Eg8APBIPgDwSEAA8EhCAPBIRADwSEYA8EhIAPBISgDwSEwA8EhOAPBIUADwSFIA8EhUAPBIVgDwSFgA8EhaAPBIXADwSF4A8EhgAPBIYgDwSGQA8EhmAPBIaADwSGoA8EhsAPBIbgDwSHAA8EhyAPBIdADwSHYA8Eh4APBIegDwSHwA8Eh+APBIgADwSIIA8EiEAPBIhgDwSIgA8EiKAPBIjADwSI4A8EiQAPBIkgDwSJQA8EiWAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBKleSsTJDIaE6MrCRPiJDgUYV0nFOCWFhVfzwUVn0g0Fh7BIxaeOhIXHfMBF12sMBfdpR8YXZ4OGJ2XPRkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBmdCRsZHIIsGJs7PRhaNA4X2S0fF1hmMBcXnwEWltgSFhZRIxWVyjQVVUMFFNT8FhRUtScT1K44E5SnCRMUoBoSlJkrEpSZKxKUmSsSlJkrEpSZKxKUmSsSlJkrEpSZKxKUmSsSlJkrEpSZKxKUmSsSlJkrEpSZKxKUmSsSlJkrEpSZKxKUmSsSlJkrEpSZKxKUmSsSFBI8EhSSPBIVEjwSFZI8EhYSPBIWkjwSFxI8EheSPBIYEjwSGJI8EhkSPBIZkjwSGhI8EhqSPBIbEjwSG5I8EhwSPBIckjwSHRI8Eh2SPBIeEjwSHpI8Eh8SPBIfkjwSIBI8EiCSPBIhEjwSIZI8EiISPBIikjwSIxI8EiOSPBIkEjwSJJI8EiUSPBIlkjwSJhI8EiaSPBInEjwSJ5I8EigSPBIokjwSKRI8EimSPBIqEjwSKpI8EisSPBIrkjwSLBI8EiySPBItEjwSLZI8Ei4SPBIukjwSLxI8Ei+SPBIwEjwSMJI8EjESPBIxkjwSMhI8EjKSPBIzEjwSM5I8EjQSPBI0kjwSNRI8EjWSPBI2EjwSNpI8EjcSPBI3kjwSOBI8EjiSPBI5EjwSOZI8EjoSPBI6kjwSOxI8EjuSPBI8EjwSPJI8Ej0SPBI9kjwSPhI8Ej6SPBI/EjwSP5I8A==");
const NINJA_STAGE4_AT2911_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2911_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2943_FIXED_TRACE_NES = decodeFixedCoordinateSamples("MAIA8DAEAPAwBgDwMAgA8DAKAPAwDADwMA4A8DAQAPAwEgDwMBQA8DAWAPAwGADwMBoA8DAcAPAwHgDwMCAA8DAgAPAwIADwMCAA8DAgAPAwIADwMCAA8DAgAPAwIADwMCAA8DAgAPAwIADwMCAA8DAgAPAwIADwMCAA8DAgAPAwIADwMCAA8DAgAPAwIADwMCIA8DAkAPAwJgDwMCgA8DAqAPAwLADwMC4A8DAwAPAwMgDwMDQA8DA2APAwOADwMDoA8DA8APAwPgDwMEAA8DBCAPAwRADwMEYA8DBIAPAwSgDwMEwA8DBOAPAwUADwMFIA8DBUAPAwVgDwMFgA8DBaAPAwXADwMF4A8DBgAPAwYgDwMGQA8DBmAPAwaADwMGoA8DBsAPAwbgDwMHAA8DByAPAwdADwMHYA8DB4APAwegDwMHwA8DB+APAwgADwMIIA8DCEAPAwhgDwMIgA8DCKAPAwjADwMI4A8DCQAPAwkgDwMJQA8DCWAPAwmADwMJgA8DCYAPAwmADwMJgA8DCYAPAwmADwMJgA8DCYAPAwmADwMJgA8DCYAPAwmADwMJgA8DCYAPAwmADwMJgA8DCYAPAwmADwMJgA8DCYAPAxmajaMptQxDOc+K40nqCYNaBIgjah8Gw3o5hWOKVAQDmm6Co6qJAUOqo4/jur4Og8rYjSPa8wvD6w2KY/soCQQLQoekG10GRCt3hOQ7kgOES6yCJFvHAMRb4Y9ka/wOBHwWjKSMMQtEnEuJ5KxmCIS8gIckzJsFxNy1hGTs0AME/OqBpQ0FAEUMxQBFDJUARQxlAEUMRQBFDCUARQwVAEUMBQBFDAUARQwVAEUMNQBFDDUARQw1AEUMRQBFDEUARQxFAEUMVQBFDFUARQxVAEUMZQBFDGUARQxlAEUMdQBFDHUARQx1AEUMhQBFDIUARQyFAEUMlQBFDJUARQyVAEUMpQBFDKUARQylAEUMtQBFDLUARQy1AEUMxQBFDMUARQzFAEUM1QBFDNUARQzVAEUM5QBFDOUARQzlAEUM9QBFDPUARQz1AEUNBQBFDQUARQ0FAEUNFQBFDRUARQ0VAEUNJQBFDSUARQ0lAEUNNQBFDTUAQ=");
const NINJA_STAGE4_AT2943_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2943_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2959_FIXED_TRACE_NES = decodeFixedCoordinateSamples("UAIA8FAEAPBQBgDwUAgA8FAKAPBQDADwUA4A8FAQAPBQEgDwUBQA8FAWAPBQGADwUBoA8FAcAPBQHgDwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCAA8FAgAPBQIADwUCIA8FAkAPBQJgDwUCgA8FAqAPBQLADwUC4A8FAwAPBQMgDwUDQA8FA2APBQOADwUDoA8FA8APBQPgDwUEAA8FBCAPBQRADwUEYA8FBIAPBQSgDwUEwA8FBOAPBQUADwUFIA8FBUAPBQVgDwUFgA8FBaAPBQXADwUF4A8FBgAPBQYgDwUGQA8FBmAPBQaADwUGoA8FBsAPBQbgDwUHAA8FByAPBQdADwUHYA8FB4APBQegDwUHwA8FB+APBQgADwUIIA8FCEAPBQhgDwUIgA8FCKAPBQjADwUI4A8FCQAPBQkgDwUJQA8FCWAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBQmADwUJgA8FCYAPBSleSsVJDIaFaMrCRXiJDgWYV0nFuCWFhdfzwUXn0g0GB7BIxieOhIZHfMBGV2sMBndpR8aXZ4OGp2XPRsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBsdkCwbHZAsGx2QLBudCRsbnYWHG52FhxudhYcbnYWHG52FhxudhYcbnYWHG52FhxudhYcbnYWHG52FhxudhYcbnYWHG52FhxudhYcbnYWHG52FhxudhYcbnYWHG52FhxudhYcbXgIzG12+nxtduwsbHbe3Gx30IxseMI8a3m07Gt7ppxrfZhMan+K/GqCfKxqhW5caolgDGmNUrxpkURsaZU2HGmVNhxplTYcaZU2HGmVNhxplTYcaZU2HGmVNhxplTYcaZU2HGmVNhxplTYcaZU2HGmVNhxplTYcaZU2HGmVNhxplTYcaZU2HGmVNhxplTYcaJcozGmZGhxpmAxsaZf+vGqX8AxqmOJcapnUrGqaxvxrnLhMa56qnGugnOxso448bKaAjGyqctxtrmQsbbJWfG22SMxttkjMbbZIzG22SMxttkjMbbZIzG22SMxttkjMbbZIzG22SMxttkjMbbZIzG22SMxttkjMbbZIzG22SMxttkjMbbZIzG22SMxttkjMbbZIzG64OhxtuizMbbkefG25ECxsuQLcbLn0jGy65jxru9jsa73KnGu/vExqwa78asSgrGrHklxqy4QMac92vGnTaGxp11ocaddaHGnXWhxp11ocaddaHGnXWhxp11ocaddaHGnXWhxp11ocaddaHGnXWhxp11ocaddaHGnXWhxp11ocaddaHGnXWhxp11ocaddaHGnXWhxo2UzMZ9lMJGXZTHxj2UzUYtlMLGDZTIRg1UyEYNJMhGDPTIRgzUyEYMtMhGDKTIRgyUyEYMlMhGDKTIRgy0yEYMxMhGDMTIRgzEyEYM1MhGDNTIRgzUyEYM5MhGDOTIRgzkyEYM9MhGDPTIRgz0yEYNBMhGDQTIRg0EyEYNFMhGDRTIRg0UyEYNJMhGDSTIRg0kyEYNNMhGDTTIRg00yEYNRMhGDUTIRg1EyEYNVMhGDVTIRg1UyEYNZMhGDWTIRg1kyEYNdMhGDXTIRg10yEYNhMhGDYTIRg2EyEYNlMhGDZTIRg2UyEYNpMhGDaTIRg2kyEYNtMhGDbTIRg20yEYNxMhA==");
const NINJA_STAGE4_AT2959_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2959_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3103_FIXED_TRACE_NES = decodeFixedCoordinateSamples("SAIA8EgEAPBIBgDwSAgA8EgKAPBIDADwSA4A8EgQAPBIEgDwSBQA8EgWAPBIGADwSBoA8EgcAPBIHgDwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCAA8EggAPBIIADwSCIA8EgkAPBIJgDwSCgA8EgqAPBILADwSC4A8EgwAPBIMgDwSDQA8Eg2APBIOADwSDoA8Eg8APBIPgDwSEAA8EhCAPBIRADwSEYA8EhIAPBISgDwSEwA8EhOAPBIUADwSFIA8EhUAPBIVgDwSFgA8EhaAPBIXADwSF4A8EhgAPBIYgDwSGQA8EhmAPBIaADwSGoA8EhsAPBIbgDwSHAA8EhyAPBIdADwSHYA8Eh4APBIegDwSHwA8Eh+APBIgADwSIIA8EiEAPBIhgDwSIgA8EiKAPBIjADwSI4A8EiQAPBIkgDwSJQA8EiWAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBImADwSJgA8EiYAPBKleSsTJDIaE6MrCRPiJDgUYV0nFOCWFhVfzwUVn0g0Fh7BIxaeOhIXHfMBF12sMBfdpR8YXZ4OGJ2XPRkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBkdkCwZHZAsGR2QLBmdCRsaHIIKGls7ORraNCgbWS0XG9hmBhwXnzUcltgkHRZREx2VygId1UMxHlT8IB7UtQ8fFK4+H5SnLSAUoBwglJkLIJSZCyCUmQsglJkLIJSZCyCUmQsglJkLIJSZCyCUmQsglJkLIJSZCyCUmQsglJkLIJSZCyCUmQsglJkLIJSZCyCUmQsglJkLIJSZCyCUmQsg1BI6INSOpiDVCxIglYe+IJYEKiCWgJYglv0CIFd5riBX9hogWHKGIBjvMiAZa54gGegKH9pkth/a4SIf212OH5vaOh+cVqYfnNMSH11Pvh9dzCofXkiWH17FAh8fQa4fH74aHyA6hh7gtzIe4TOeHuGwCh6iLLYeoqkiHqMljh5jojoeZB6mHmSbEh4lF74eJZQqHiYQlh4mjQId5wmuHeeGGh3oAoYdqH8yHaj7nh2peAodafS2HWpxIh1q7Y4dK2o6HSvmph0sYxIc7N++HO1cKhzt2JYc7lUCHK7RrhyvThocr8qGHHBHMhxww54ccUAKHDG8thwyOSIcMrWOG/MyOhvzrqYb9CsSG7Snvhu1JCobtaCWG7YdAht2ma4bdxYaG3eShhs4DzIbOIueGzkIChr5hLYa+gEiGvp9jhq6+joau3amGrvzEhp8b74afOwqGn1olhp95QIaPmGuGj7eGho/WoYZ/9cyA==");
const NINJA_STAGE4_AT3103_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3103_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3119_X56_FIXED_TRACE_NES = decodeFixedCoordinateSamples("OAIA8DgEAPA4BgDwOAgA8DgKAPA4DADwOA4A8DgQAPA4EgDwOBQA8DgWAPA4GADwOBoA8DgcAPA4HgDwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCIA8DgkAPA4JgDwOCgA8DgqAPA4LADwOC4A8DgwAPA4MgDwODQA8Dg2APA4OADwODoA8Dg8APA4PgDwOEAA8DhCAPA4RADwOEYA8DhIAPA4SgDwOEwA8DhOAPA4UADwOFIA8DhUAPA4VgDwOFgA8DhaAPA4XADwOF4A8DhgAPA4YgDwOGQA8DhmAPA4aADwOGoA8DhsAPA4bgDwOHAA8DhyAPA4dADwOHYA8Dh4APA4egDwOHwA8Dh+APA4gADwOIIA8DiEAPA4hgDwOIgA8DiKAPA4jADwOI4A8DiQAPA4kgDwOJQA8DiWAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA6leSsPJDIaD6MrCQ/iJDgQYV0nEOCWFhFfzwURn0g0Eh7BIxKeOhITHfMBE12sMBPdpR8UXZ4OFJ2XPRUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBWdCRsVnYkbFZ4JGxWeiRsVnwkbFZ+JGxWgCRsVoIkbFaEJGxWhiRsVogkbFaKJGxWjCRsVo4kbFaQJGxWkiRsVpQkbFaWJGxWmCRsVpokbFacJGxWniRsVqAkbFaiJGxWpCRsVqYkbFaoJGxWqiRsVqwkbFauJGxWsCRsVrIkbFa0JGxWtiRsVrgkbFa6JGxWvCRsVr4kbFbAJGxWwiRsVsQkbFbGJGxWyCRsVsokbFbMJGxWyCRsVsUkbFbCJGxWwCRsVr4kbFa9JGxWvCRsVrwkbFa9JGxWviRsVr8kbFa/JGxWvyRsVsAkbFbAJGxWwCRsVsEkbFbBJGxWwSRsVsIkbFbCJGxWwiRsVsMkbFbDJGxWwyRsVsQkbFbEJGxWxCRsVsUkbFbFJGxWxSRsVsYkbFbGJGxWxiRsVsckbFbHJGxWxyRsVsgkbFbIJGxWyCRsVskkbFbJJGxWySRsVsokbFbKJGxWyiRsVsskbFbLJGxWyyRsVswkbFbMJGxWzCRsVs0kbFbNJGxWzSRsVs4kbFbOJGxWziRsVs8kbA==");
const NINJA_STAGE4_AT3119_X56_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3119_X56_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3119_X120_FIXED_TRACE_NES = decodeFixedCoordinateSamples("eAIAsHgEALB4BgCweAgAsHgKALB4DACweA4AsHgQALB4EgCweBQAsHgWALB4GACweBoAsHgcALB4HgCweCAAsHggALB4IACweCAAsHggALB4IACweCAAsHggALB4IACweCAAsHggALB4IACweCAAsHggALB4IACweCAAsHggALB4IACweCAAsHggALB4IACweCIAsHgkALB4JgCweCgAsHgqALB4LACweC4AsHgwALB4MgCweDQAsHg2ALB4OACweDoAsHg8ALB4PgCweEAAsHhCALB4RACweEYAsHhIALB4SgCweEwAsHhOALB4UACweFIAsHhUALB4VgCweFgAsHhaALB4XACweF4AsHhgALB4YgCweGQAsHhmALB4aACweGoAsHhsALB4bgCweHAAsHhyALB4dACweHYAsHh4ALB4egCweHwAsHh+ALB4gACweIIAsHiEALB4hgCweIgAsHiKALB4jACweI4AsHiQALB4kgCweJQAsHiWALB4mACweJgAsHiYALB4mACweJgAsHiYALB4mACweJgAsHiYALB4mACweJgAsHiYALB4mACweJgAsHiYALB4mACweJgAsHiYALB4mACweJgAsHiYALB6leRsfJDIKH2MrOR/iJCggYV0XIOCWBiEfzzUhn0gkIh7BEyKeOgIi3fMxI12sICPdpQ8kHZ4+JJ2XLSUdkBwlHZAcJR2QHCUdkBwlHZAcJR2QHCUdkBwlHZAcJR2QHCUdkBwlHZAcJR2QHCUdkBwlHZAcJR2QHCUdkBwlHZAcJR2QHCUdkBwlHZAcJR2QHCWdCQslXXMQpR3dFiTeRxuknrEhJF8bJqQfhSwj3+8xo6BZNyNgwzyjYS0CIyGXB6LiAQ0iomsSomLVGCIjPx2h46kjIaQTKKFkfS4hJOczoOVROSCluz6gpiUEIGaPCaAm+Q8f52MUn6fNGh9oNx+fKKElHukLKp6pdTAead81nipJOx4qswCd6x0GHauHC51r8REdLFsWnOzFHBytLyGcbZknHC4DLJvubTIbrtc3m29BPRtvqwKbMBUIGvB/DZqw6RMacVMYmjG9HhnyJyOZspEpGXL7LpkzZTQY8885mLQ5Pxi0owSYdQ0KGDV3D5g0dw+YM7cPmDL3D5gydw+YMfcPmDG3D5gxdw+YMXcPmDG3D5gx9w+YMjcPmDI3D5gyNw+YMncPmDJ3D5gydw+YMrcPmDK3D5gytw+YMvcPmDL3D5gy9w+YMzcPmDM3D5gzNw+YM3cPmDN3D5gzdw+YM7cPmDO3D5gztw+YM/cPmDP3D5gz9w+YNDcPmDQ3D5g0Nw+YNHcPmDR3D5g0dw+YNLcPmDS3D5g0tw+YNPcPmDT3D5g09w+YNTcPmDU3D5g1Nw+YNXcPmDV3D5g1dw+YNbcPmDW3D5g1tw+YNfcPmDX3D5g19w+YNjcPg==");
const NINJA_STAGE4_AT3119_X120_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3119_X120_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3215_X160_FIXED_TRACE_NES = decodeFixedCoordinateSamples("oAIA8KAEAPCgBgDwoAgA8KAKAPCgDADwoA4A8KAQAPCgEgDwoBQA8KAWAPCgGADwoBoA8KAcAPCgHgDwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCIA8KAkAPCgJgDwoCgA8KAqAPCgLADwoC4A8KAwAPCgMgDwoDQA8KA2APCgOADwoDoA8KA8APCgPgDwoEAA8KBCAPCgRADwoEYA8KBIAPCgSgDwoEwA8KBOAPCgUADwoFIA8KBUAPCgVgDwoFgA8KBaAPCgXADwoF4A8KBgAPCgYgDwoGQA8KBmAPCgaADwoGoA8KBsAPCgbgDwoHAA8KByAPCgdADwoHYA8KB4APCgegDwoHwA8KB+APCggADwoIIA8KCEAPCghgDwoIgA8KCKAPCgjADwoI4A8KCQAPCgkgDwoJQA8KCWAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCfleQ0nZDIeJuMrLyaiJAAmIV0RJaCWIiUfzzMk30gEJF7BFSPeOiYjXfM3Ix2sCCKdpRkiHZ4qIZ2XOyFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCDdCR0gnX+1IJ32DSBebKUgHuM9IB9ZlR/f0C0f4EaFH6C9HR9hM7UfYaoNHyIgpR7ilz0e4w2VHqOELR6j+oUeZHEdHiTntR4lXg0d5dSlHaZLPR2mwZUdZzgtHWeuhR0oJR0c6Ju1HOkSDRypiKUcaf89HGp1lRwq7C0cK2KFG+vZHRusT7UbrMYNG208pRstsz0bLimVGu6gLRrvFoUar40dGnADtRpweg0aMPClGfFnPRnx3ZUZslQtGbLKhRlzQR0ZM7e1GTQuDRj0pKUYtRs9GLWRlRh2CC0Ydn6FGDb1HRg19R0YNTUdGDR1HRgz9R0YM3UdGDM1HRgy9R0YMvUdGDM1HRgzdR0YM7UdGDO1HRgztR0YM/UdGDP1HRgz9R0YNDUdGDQ1HRg0NR0YNHUdGDR1HRg0dR0YNLUdGDS1HRg0tR0YNPUdGDT1HRg09R0YNTUdGDU1HRg1NR0YNXUdGDV1HRg1dR0YNbUdGDW1HRg1tR0YNfUdGDX1HRg19R0YNjUdGDY1HRg2NR0YNnUdGDZ1HRg2dR0YNrUdGDa1HRg2tR0YNvUdGDb1HRg29R0YNzUdGDc1HRg3NR0YN3UdGDd1HRg3dR0YN7UdA==");
const NINJA_STAGE4_AT3215_X160_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3215_X160_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3215_X192_FIXED_TRACE_NES = decodeFixedCoordinateSamples("wAIAsMAEALDABgCwwAgAsMAKALDADACwwA4AsMAQALDAEgCwwBQAsMAWALDAGACwwBoAsMAcALDAHgCwwCAAsMAgALDAIACwwCAAsMAgALDAIACwwCAAsMAgALDAIACwwCAAsMAgALDAIACwwCAAsMAgALDAIACwwCAAsMAgALDAIACwwCAAsMAgALDAIACwwCIAsMAkALDAJgCwwCgAsMAqALDALACwwC4AsMAwALDAMgCwwDQAsMA2ALDAOACwwDoAsMA8ALDAPgCwwEAAsMBCALDARACwwEYAsMBIALDASgCwwEwAsMBOALDAUACwwFIAsMBUALDAVgCwwFgAsMBaALDAXACwwF4AsMBgALDAYgCwwGQAsMBmALDAaACwwGoAsMBsALDAbgCwwHAAsMByALDAdACwwHYAsMB4ALDAegCwwHwAsMB+ALDAgACwwIIAsMCEALDAhgCwwIgAsMCKALDAjACwwI4AsMCQALDAkgCwwJQAsMCWALDAmACwwJgAsMCYALDAmACwwJgAsMCYALDAmACwwJgAsMCYALDAmACwwJgAsMCYALDAmACwwJgAsMCYALDAmACwwJgAsMCYALDAmACwwJgAsMCYALC+leT0vZDIOLuMrHy5iJDAuIV0BLaCWEi0fzyMsn0g0LF7BBSveOhYrXfMnKt2sOCqdpQkqHZ4aKZ2XKykdkDwpHZA8KR2QPCkdkDwpHZA8KR2QPCkdkDwpHZA8KR2QPCkdkDwpHZA8KR2QPCkdkDwpHZA8KR2QPCkdkDwpHZA8KR2QPCkdkDwpHZA8KR2QPCjdCQ0oXIIeJ9s7LyeaNAAnGS0RJphmIiYXnzMl1tgEJVZRFSTVyiYkVUM3JBT8CCOUtRkjFK4qIpSnOyJUoAwh1JkdIdSZHSHUmR0h1JkdIdSZHSHUmR0h1JkdIdSZHSHUmR0h1JkdIdSZHSHUmR0h1JkdIdSZHSHUmR0h1JkdIdSZHSHUmR0h1JkdIdSZHSHUmR0hVBIuINOLPyCSRBAgET0hH5A2Mh9PbwMezqgUHk3hJR3NWjYdjNMHHQxMGByMBSkcC746G8u3CxtLsBway6ktGkuiPhpLoj4aS6I+GkuiPhpLoj4aS6I+GkuiPhpLoj4aS6I+GkuiPhpLoj4aS6I+GkuiPhpLoj4aS6I+GkuiPhpLoj4aS6I+GkuiPhpLoj4aS6I+GgsbDxoLmw8aDBsPGgybDxoNGw8aDZsPGg4bDxoOmw8aDxsPGg+bDxoQGw8aEJsPGhEbDxoRmw8aEhsPGhKbDxoTGw8aE5sPGhQbDxoUmw8aFRsPGhWbDxoWGw8aFpsPGhcbDxoXmw8aGBsPGhibDxoZGw8aGZsPGhobDxoamw8aGxsPGhubDxocGw8aHJsPGh0bDxodmw8aHhsPGh6bDxofGw8aH5sPGiAbDxogmw8aIRsPGiGbDxoiGw8aIpsPGiMbDxojmw8aJBsPGiSbDxolGw8aJZsPGiYbDxommw8aJxsPGiebDxooGw8aKJsPGikbDxopmw8aKhsPGiqbDxorGw8aK5sPGiwbDxosmw8aLRsPGi2bDxouGw8aLpsPGi8bDxovmw8aMBsPGjCbDxoxGw8aMZsPGjIbDxoymw8aMxsPGjObDxo0Gw8aNJsPGjUbDxo1mw8aNhsPGjabDxo3Gw8aN5sPGjgbDxo4mw8aORsPGjmbDxo6Gw8aOpsPGjsbDxo7mw8aPBsPGjybDxo9Gw8aPZsPGj4bDxo+mw8aPxsPGj+bDw=");
const NINJA_STAGE4_AT3215_X192_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3215_X192_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3327_X56_FIXED_TRACE_NES = decodeFixedCoordinateSamples("OAIA8DgEAPA4BgDwOAgA8DgKAPA4DADwOA4A8DgQAPA4EgDwOBQA8DgWAPA4GADwOBoA8DgcAPA4HgDwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCAA8DggAPA4IADwOCIA8DgkAPA4JgDwOCgA8DgqAPA4LADwOC4A8DgwAPA4MgDwODQA8Dg2APA4OADwODoA8Dg8APA4PgDwOEAA8DhCAPA4RADwOEYA8DhIAPA4SgDwOEwA8DhOAPA4UADwOFIA8DhUAPA4VgDwOFgA8DhaAPA4XADwOF4A8DhgAPA4YgDwOGQA8DhmAPA4aADwOGoA8DhsAPA4bgDwOHAA8DhyAPA4dADwOHYA8Dh4APA4egDwOHwA8Dh+APA4gADwOIIA8DiEAPA4hgDwOIgA8DiKAPA4jADwOI4A8DiQAPA4kgDwOJQA8DiWAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA4mADwOJgA8DiYAPA6leSsPJDIaD6MrCQ/iJDgQYV0nEOCWFhFfzwURn0g0Eh7BIxKeOhITHfMBE12sMBPdpR8UXZ4OFJ2XPRUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBUdkCwVHZAsFR2QLBWdCRsVnYkbFZ4JGxWeiRsVnwkbFZ+JGxWgCRsVoIkbFaEJGxWhiRsVogkbFaKJGxWjCRsVo4kbFaQJGxWkiRsVpQkbFaWJGxWmCRsVpokbFacJGxWniRsVqAkbFaiJGxWpCRsVqYkbFaoJGxWqiRsVqwkbFauJGxWsCRsVrIkbFa0JGxWtiRsVrgkbFa6JGxWvCRsVr4kbFbAJGxWwiRsVsQkbFbGJGxWyCRsVsokbFbMJGxWyCRsVsUkbFbCJGxWwCRsVr4kbFa9JGxWvCRsVrwkbFa9JGxWviRsVr8kbFa/JGxWvyRsVsAkbFbAJGxWwCRsVsEkbFbBJGxWwSRsVsIkbFbCJGxWwiRsVsMkbFbDJGxWwyRsVsQkbFbEJGxWxCRsVsUkbFbFJGxWxSRsVsYkbFbGJGxWxiRsVsckbFbHJGxWxyRsVsgkbFbIJGxWyCRsVskkbFbJJGxWySRsVsokbFbKJGxWyiRsVsskbFbLJGxWyyRsVswkbFbMJGxWzCRsVs0kbFbNJGxWzSRsVs4kbFbOJGxWziRsVs8kbA==");
const NINJA_STAGE4_AT3327_X56_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3327_X56_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3327_X96_FIXED_TRACE_NES = decodeFixedCoordinateSamples("YAIAsGAEALBgBgCwYAgAsGAKALBgDACwYA4AsGAQALBgEgCwYBQAsGAWALBgGACwYBoAsGAcALBgHgCwYCAAsGAgALBgIACwYCAAsGAgALBgIACwYCAAsGAgALBgIACwYCAAsGAgALBgIACwYCAAsGAgALBgIACwYCAAsGAgALBgIACwYCAAsGAgALBgIACwYCIAsGAkALBgJgCwYCgAsGAqALBgLACwYC4AsGAwALBgMgCwYDQAsGA2ALBgOACwYDoAsGA8ALBgPgCwYEAAsGBCALBgRACwYEYAsGBIALBgSgCwYEwAsGBOALBgUACwYFIAsGBUALBgVgCwYFgAsGBaALBgXACwYF4AsGBgALBgYgCwYGQAsGBmALBgaACwYGoAsGBsALBgbgCwYHAAsGByALBgdACwYHYAsGB4ALBgegCwYHwAsGB+ALBggACwYIIAsGCEALBghgCwYIgAsGCKALBgjACwYI4AsGCQALBgkgCwYJQAsGCWALBgmACwYJgAsGCYALBgmACwYJgAsGCYALBgmACwYJgAsGCYALBgmACwYJgAsGCYALBgmACwYJgAsGCYALBgmACwYJgAsGCYALBgmACwYJgAsGCYALBileRsZJDIKGWMrORniJCgaYV0XGuCWBhsfzzUbn0gkHB7BExyeOgIc3fMxHV2sIB3dpQ8eHZ4+Hp2XLR8dkBwfHZAcHx2QHB8dkBwfHZAcHx2QHB8dkBwfHZAcHx2QHB8dkBwfHZAcHx2QHB8dkBwfHZAcHx2QHB8dkBwfHZAcHx2QHB8dkBwfHZAcHx2QHB+dCQsf3II6IFs7KSDaNBghWS0HIZhmNiIXnyUiltgUIxZRAyNVyjIj1UMhJFT8ECSUtT8lFK4uJZSnHSYUoAwmVJk7JlSZOyZUmTsmVJk7JlSZOyZUmTsmVJk7JlSZOyZUmTsmVJk7JlSZOyZUmTsmVJk7JlSZOyZUmTsmVJk7JlSZOyZUmTsmVJk7JlSZOyZUmTsm1BIqJlOLOyYSRAwlkT0dJRA2LiSPbz8kTqgQI83hISNNWjIjDNMDIoxMFCIMBSUhi742IUu3ByDLsBggS6kpH8uiOh/Lojofy6I6H8uiOh/Lojofy6I6H8uiOh/Lojofy6I6H8uiOh/Lojofy6I6H8uiOh/Lojofy6I6H8uiOh/Lojofy6I6H8uiOh/Lojofy6I6H4sbCx9Ll7cfTBQjH0yQjx8NDTsfDYmnHw4GEx7Ogr8ezv8rHs97lx7P+AMekHSvHpDxGx6RbYceUeozHlJmnx5S4wseE1+3HhPcIx4UWI8d1NU7HdVRpx3VzhMdlkq/HZbHKx2XQ5cdl8ADHVg8rx1YuRsdWTWHHRmyMx0aLp8dGqsLHNsntxzbpCMc3CCPHJydOxydGaccnZYTHF4SvxxejyscXwuXHF+IAxwgBK8cIIEbHCD9hxvhejMb4fafG+JzCxui77cbo2wjG6PojxtkZTsbZOGnG2VeExsl2r8bJlcrGybTlxsnUAMa58yvGuhJGxroxYcaqUIzGqm+nxqqOwsaare3Gms0IxprsI8aLC07GiyppxotJhMZ7aK/Ge4fKxnum5cZ7xgDGa+UrxmwERsZsI2HGXEKMxlxhp8ZcgMLGTJ/txky/CMZM3iPGPP1Oxj0cacY9O4TGLVqvxi15ysYtmOXGLbgAxh3XK8Yd9kbGHhVhxg40jMYOU6fGDnLCxf6R7cX+sQjF/tAjxe7vTsXvDmnF7y2Exd9Mr8Xfa8rF34rlxd+qAMXPySvFz+hGw=");
const NINJA_STAGE4_AT3327_X96_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3327_X96_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3391_X152_FIXED_TRACE_NES = decodeFixedCoordinateSamples("mAIA8JgEAPCYBgDwmAgA8JgKAPCYDADwmA4A8JgQAPCYEgDwmBQA8JgWAPCYGADwmBoA8JgcAPCYHgDwmCAA8JggAPCYIADwmCAA8JggAPCYIADwmCAA8JggAPCYIADwmCAA8JggAPCYIADwmCAA8JggAPCYIADwmCAA8JggAPCYIADwmCAA8JggAPCYIADwmCIA8JgkAPCYJgDwmCgA8JgqAPCYLADwmC4A8JgwAPCYMgDwmDQA8Jg2APCYOADwmDoA8Jg8APCYPgDwmEAA8JhCAPCYRADwmEYA8JhIAPCYSgDwmEwA8JhOAPCYUADwmFIA8JhUAPCYVgDwmFgA8JhaAPCYXADwmF4A8JhgAPCYYgDwmGQA8JhmAPCYaADwmGoA8JhsAPCYbgDwmHAA8JhyAPCYdADwmHYA8Jh4APCYegDwmHwA8Jh+APCYgADwmIIA8JiEAPCYhgDwmIgA8JiKAPCYjADwmI4A8JiQAPCYkgDwmJQA8JiWAPCYmADwmJgA8JiYAPCYmADwmJgA8JiYAPCYmADwmJgA8JiYAPCYmADwmJgA8JiYAPCYmADwmJgA8JiYAPCYmADwmJgA8JiYAPCYmADwmJgA8JiYAPCXleQ0lZDIeJOMrLySiJAAkIV0RI6CWIiMfzzMi30gEIl7BFSHeOiYhXfM3IR2sCCCdpRkgHZ4qH52XOx9dkAwfXZAMH12QDB9dkAwfXZAMH12QDB9dkAwfXZAMH12QDB9dkAwfXZAMH12QDB9dkAwfXZAMH12QDB9dkAwfXZAMH12QDB9dkAwfXZAMH12QDB7dCR0e3YWJHp4CNR6efqEenvsNHl93uR5f9CUeYHCRHiDtPR4haakeIeYVHiJigR3i3y0d41uZHePYBR2kVLEdpNEdHaVNiR1lyjUdZkahHWbDDR0nP7kdJ7wlHSg4kRzotT0c6TGpHOmuFRzqKoEcqqctHKsjmRyroAUcbByxHGyZHRxtFYkcLZI1HC4OoRwuiw0b7we5G++EJRvwAJEbsH09G7D5qRuxdhUbsfKBG3JvLRty65kbc2gFGzPksRs0YR0bNN2JGvVaNRr11qEa9lMNGrbPuRq3TCUat8iRGnhFPRp4wakaeT4VGnm6gRo6Ny0aOrOZGjswBRn7rLEZ/CkdGfyliRm9IjUZvZ6hGb4bDRl+l7kZfxQlGX+QkQ=");
const NINJA_STAGE4_AT3391_X152_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3391_X152_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3391_X200_FIXED_TRACE_NES = decodeFixedCoordinateSamples("yAIAsMgEALDIBgCwyAgAsMgKALDIDACwyA4AsMgQALDIEgCwyBQAsMgWALDIGACwyBoAsMgcALDIHgCwyCAAsMggALDIIACwyCAAsMggALDIIACwyCAAsMggALDIIACwyCAAsMggALDIIACwyCAAsMggALDIIACwyCAAsMggALDIIACwyCAAsMggALDIIACwyCIAsMgkALDIJgCwyCgAsMgqALDILACwyC4AsMgwALDIMgCwyDQAsMg2ALDIOACwyDoAsMg8ALDIPgCwyEAAsMhCALDIRACwyEYAsMhIALDISgCwyEwAsMhOALDIUACwyFIAsMhUALDIVgCwyFgAsMhaALDIXACwyF4AsMhgALDIYgCwyGQAsMhmALDIaACwyGoAsMhsALDIbgCwyHAAsMhyALDIdACwyHYAsMh4ALDIegCwyHwAsMh+ALDIgACwyIIAsMiEALDIhgCwyIgAsMiKALDIjACwyI4AsMiQALDIkgCwyJQAsMiWALDImACwyJgAsMiYALDImACwyJgAsMiYALDImACwyJgAsMiYALDImACwyJgAsMiYALDImACwyJgAsMiYALDImACwyJgAsMiYALDImACwyJgAsMiYALDGleT0xZDIOMOMrHzBiJDAwIV0BL6CWEi8fzyMun0g0Ll7BBS3eOhYtXfMnLN2sOCydpQksHZ4aK52XKysdkDwrHZA8Kx2QPCsdkDwrHZA8Kx2QPCsdkDwrHZA8Kx2QPCsdkDwrHZA8Kx2QPCsdkDwrHZA8Kx2QPCsdkDwrHZA8Kx2QPCsdkDwrHZA8Kx2QPCrdCQ0qnXMSql3dGCoeRx2p3rEjKZ8bKKlfhS4pH+8zqOBZOSigwz6ooS0EKGGXCagiAQ8n4msUp6LVGidjPx+nI6klJuQTKqakfTAmZOc1piVROyYluwCl5iUGJaaPC6Vm+RElJ2MWpOfNHCSoNyGkaKEnJCkLLKPpdTIjqd83o2pJPSNqswKjKx0IIuuHDaKr8RMibFsYoizFHiHtLyOhrZkpIW4DLqEubTQg7tc5oK9BPyCvqwSgcBUKIDB/D5/w6RUfsVMan3G9IB8yJyWe8pErHrL7MJ5zZTYeM887njQ5AR30owadtQ0MHXV3EZ014Rcc9kscnLa1Ihx3HyecN4ktG/fzMpu4XTgbeMc9m3kxAxs5mwia+gUOGrpvE5p62RkaO0MemfutJBm8FymZfIEvGTzrNJj9VToYvb8/mL4pBRh+kwqYPv0QF/9nFZe/0Rs");
const NINJA_STAGE4_AT3391_X200_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3391_X200_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3535_X120_FIXED_TRACE_NES = decodeFixedCoordinateSamples("eAIA8HgEAPB4BgDweAgA8HgKAPB4DADweA4A8HgQAPB4EgDweBQA8HgWAPB4GADweBoA8HgcAPB4HgDweCAA8HggAPB4IADweCAA8HggAPB4IADweCAA8HggAPB4IADweCAA8HggAPB4IADweCAA8HggAPB4IADweCAA8HggAPB4IADweCAA8HggAPB4IADweCIA8HgkAPB4JgDweCgA8HgqAPB4LADweC4A8HgwAPB4MgDweDQA8Hg2APB4OADweDoA8Hg8APB4PgDweEAA8HhCAPB4RADweEYA8HhIAPB4SgDweEwA8HhOAPB4UADweFIA8HhUAPB4VgDweFgA8HhaAPB4XADweF4A8HhgAPB4YgDweGQA8HhmAPB4aADweGoA8HhsAPB4bgDweHAA8HhyAPB4dADweHYA8Hh4APB4egDweHwA8Hh+APB4gADweIIA8HiEAPB4hgDweIgA8HiKAPB4jADweI4A8HiQAPB4kgDweJQA8HiWAPB4mADweJoA8HiaAPB4mgDweJoA8HiaAPB4mgDweJoA8HiaAPB4mgDweJoA8HiaAPB4mgDweJoA8HiaAPB4mgDweJoA8HiaAPB4mgDweJoA8HiaAPB4mgDwepfkrHySyGh+jqwkf4qQ4IGHdJyDhFhYhYE8FIZ/INCIfQSMinroSIx5zASNeLDAj3iUfJF4eDiSeFz0lHhAsJR4QLCUeECwlHhAsJR4QLCUeECwlHhAsJR4QLCUeECwlHhAsJR4QLCUeECwlHhAsJR4QLCUeECwlHhAsJR4QLCUeECwlHhAsJR4QLCUeECwlnYkbJV3zIKUeXSYk3scrpJ8xMSRfmzakIAU8JCBvAaPg2QcjoUMMo2GtEiMiFxei4oEdIqLrIqJjVSgiI78toeQpMyGkkzihZP0+IWVnA6El0Qkg5jsOoKalFCBnDxmgJ3kfH+fjJJ+oTSofaLcvnykhNR7pizqe6fUAHqpfBZ5qyQseKzMQneudFh2sBxudbHEhHSzbJpztRSwcra8xnG4ZNxwugzycLu0CG+9XB5uvwQ0bcCsSmzCVGBrw/x2asWkjGnHTKJoyPS4Z8qczmbMRORlzez6Zc+UEGTRPCZj0uQ8YtSMUmHWNGhg19x+YNPcfmDQ3H5gzdx+YMvcfmDJ3H5gyNx+YMfcfmDH3H5gyNx+YMrcfmDK3H5gytx+YMvcfmDL3H5gy9x+YMzcfmDM3H5gzNx+YM3cfmDN3H5gzdx+YM7cfmDO3H5gztx+YM/cfmDP3H5gz9x+YNDcfmDQ3H5g0Nx+YNHcfmDR3H5g0dx+YNLcfmDS3H5g0tx+YNPcfmDT3H5g09x+YNTcfmDU3H5g1Nx+YNXcfmDV3H5g1dx+YNbcfmDW3H5g1tx+YNfcfmDX3H5g19x+YNjcfmDY3H5g2Nx+YNncfmDZ3H5g2dx+YNrcfmDa3H4=");
const NINJA_STAGE4_AT3535_X120_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3535_X120_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3407_X120_FIXED_TRACE_NES = decodeFixedCoordinateSamples("eAIA8HgEAPB4BgDweAgA8HgKAPB4DADweA4A8HgQAPB4EgDweBQA8HgWAPB4GADweBoA8HgcAPB4HgDweCAA8HggAPB4IADweCAA8HggAPB4IADweCAA8HggAPB4IADweCAA8HggAPB4IADweCAA8HggAPB4IADweCAA8HggAPB4IADweCAA8HggAPB4IADweCIA8HgkAPB4JgDweCgA8HgqAPB4LADweC4A8HgwAPB4MgDweDQA8Hg2APB4OADweDoA8Hg8APB4PgDweEAA8HhCAPB4RADweEYA8HhIAPB4SgDweEwA8HhOAPB4UADweFIA8HhUAPB4VgDweFgA8HhaAPB4XADweF4A8HhgAPB4YgDweGQA8HhmAPB4aADweGoA8HhsAPB4bgDweHAA8HhyAPB4dADweHYA8Hh4APB4egDweHwA8Hh+APB4gADweIIA8HiEAPB4hgDweIgA8HiKAPB4jADweI4A8HiQAPB4kgDweJQA8HiWAPB4mADweJgA8HiYAPB4mADweJgA8HiYAPB4mADweJgA8HiYAPB4mADweJgA8HiYAPB4mADweJgA8HiYAPB4mADweJgA8HiYAPB4mADweJgA8HiYAPB6leSsfJDIaH6MrCR/iJDggYV0nIOCWFiFfzwUhn0g0Ih7BIyKeOhIjHfMBI12sMCPdpR8kXZ4OJJ2XPSUdkCwlHZAsJR2QLCUdkCwlHZAsJR2QLCUdkCwlHZAsJR2QLCUdkCwlHZAsJR2QLCUdkCwlHZAsJR2QLCUdkCwlHZAsJR2QLCUdkCwlHZAsJR2QLCWdCRslXXMgpR3dJiTeRyuknrExJF8bNqQfhTwkH+8Bo+BZByOgwwyjYS0SIyGXF6LiAR0iomsiomLVKCIjPy2h46kzIaQTOKFkfT4hZOcDoSVRCSDluw6gpiUUIGaPGaAm+R8f52Mkn6fNKh9oNy+fKKE1HukLOp7pdQAeqd8FnmpJCx4qsxCd6x0WHauHG51r8SEdLFsmnOzFLBytLzGcbZk3HC4DPJwubQIb7tcHm69BDRtvqxKbMBUYGvB/HZqw6SMacVMomjG9LhnyJzOZspE5GXL7PplzZQQZM88JmPQ5Dxi0oxSYdQ0aGDV3H5g0dx+YM7cfmDL3H5gydx+YMfcfmDG3H5gxdx+YMXcfmDG3H5gx9x+YMjcfmDI3H5gyNx+YMncfmDJ3H5gydx+YMrcfmDK3H5gytx+YMvcfmDL3H5gy9x+YMzcfmDM3H5gzNx+YM3cfmDN3H5gzdx+YM7cfmDO3H5gztx+YM/cfmDP3H5gz9x+YNDcfmDQ3H5g0Nx+YNHcfmDR3H5g0dx+YNLcfmDS3H5g0tx+YNPcfmDT3H5g09x+YNTcfmDU3H5g1Nx+YNXcfmDV3H5g1dx+YNbcfmDW3H5g1tx+YNfcfmDX3H5g19x+YNjcfg==");
const NINJA_STAGE4_AT3407_X120_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3407_X120_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3519_X152_FIXED_TRACE_NES = decodeFixedCoordinateSamples("mAIAsJgEALCYBgCwmAgAsJgKALCYDACwmA4AsJgQALCYEgCwmBQAsJgWALCYGACwmBoAsJgcALCYHgCwmCAAsJggALCYIACwmCAAsJggALCYIACwmCAAsJggALCYIACwmCAAsJggALCYIACwmCAAsJggALCYIACwmCAAsJggALCYIACwmCAAsJggALCYIACwmCIAsJgkALCYJgCwmCgAsJgqALCYLACwmC4AsJgwALCYMgCwmDQAsJg2ALCYOACwmDoAsJg8ALCYPgCwmEAAsJhCALCYRACwmEYAsJhIALCYSgCwmEwAsJhOALCYUACwmFIAsJhUALCYVgCwmFgAsJhaALCYXACwmF4AsJhgALCYYgCwmGQAsJhmALCYaACwmGoAsJhsALCYbgCwmHAAsJhyALCYdACwmHYAsJh4ALCYegCwmHwAsJh+ALCYgACwmIIAsJiEALCYhgCwmIgAsJiKALCYjACwmI4AsJiQALCYkgCwmJQAsJiWALCYmACwmJoAsJiaALCYmgCwmJoAsJiaALCYmgCwmJoAsJiaALCYmgCwmJoAsJiaALCYmgCwmJoAsJiaALCYmgCwmJoAsJiaALCYmgCwmJoAsJiaALCYmgCwl5toiJac0GCVnjg4lJ+gEJKhCOiRonDAkKPYmI+lQHCOpqhIjagQIIupePiKquDQiaxIqIitsICHrxhYhrCAMIWx6AiDs1DggrS4uIG2IJCAt4hof7jwQH66WBh8u8Dwe70oyHq+kKB5v/h4eMFgUHfCyCh2xDAAdMWY2HPHALByyGiIccnQYHDLODhvzKAQbc4I6GzPcMBr0NiYatJAcGnTqEho1RAgZtZ4+GXX4NBk2UioY9qwgGLcGFhh3YAwYN7oCGDa6Ahg1+gIYNToCGDS6Ahg0OgIYM/oCGDO6AhgzugIYM/oCGDQ6Ahg0OgIYNHoCGDR6Ahg0egIYNLoCGDS6Ahg0ugIYNPoCGDT6Ahg0+gIYNToCGDU6Ahg1OgIYNXoCGDV6Ahg1egIYNboCGDW6Ahg1ugIYNfoCGDX6Ahg1+gIYNjoCGDY6Ahg2OgIYNnoCGDZ6Ahg2egIYNroCGDa6Ahg2ugIYNvoCGDb6Ahg2+gIYNzoCGDc6Ahg3OgIYN3oCGDd6Ahg3egIYN7oCGDe6Ahg3ugIYN/oCGDf6Ahg3+gIYODoCGDg6Ahg4OgI");
const NINJA_STAGE4_AT3519_X152_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3519_X152_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3519_X216_FIXED_TRACE_NES = decodeFixedCoordinateSamples("2AIALNgEACzYBgAs2AgALNgKACzYDAAs2A4ALNgQACzYEgAs2BQALNgWACzYGAAs2BoALNgcACzYHgAs2CAALNggACzYIAAs2CAALNggACzYIAAs2CAALNggACzYIAAs2CAALNggACzYIAAs2CAALNggACzYIAAs2CAALNggACzYIAAs2CAALNggACzYIAAs2CIALNgkACzYJgAs2CgALNgqACzYLAAs2C4ALNgwACzYMgAs2DQALNg2ACzYOAAs2DoALNg8ACzYPgAs2EAALNhCACzYRAAs2EYALNhIACzYSgAs2EwALNhOACzYUAAs2FIALNhUACzYVgAs2FgALNhaACzYXAAs2F4ALNhgACzYYgAs2GQALNhmACzYaAAs2GoALNhsACzYbgAs2HAALNhyACzYdAAs2HYALNh4ACzYegAs2HwALNh+ACzYgAAs2IIALNiEACzYhgAs2IgALNiKACzYjAAs2I4ALNiQACzYkgAs2JQALNiWACzYmAAs2JoALNiaACzYmgAs2JoALNiaACzYmgAs2JoALNiaACzYmgAs2JoALNiaACzYmgAs2JoALNiaACzYmgAs2JoALNiaACzYmgAs2JoALNiaACzYmgAs1prIptWbkCDTnFia0p0gFNCd6I7PnrAIzZ94gsugQPzKoQh2yKHQ8MeimGrFo2DkxKQoXsKk8NjBpbhSv6aAzL6nSEa8qBDAu6jYOrmpoLS4qmgutqswqLWr+CKzrMCcsq2IFrCuUJCvrxgKra/ghKuwqP6qsXB4qLI48qezAGyls8jmpLSQYKK1WNqhtiBUn7bozp63sEicuHjCm7lAPJm6CLaYutAwlruYqpW8YCSTvSiekr3wGJC+uJKPv4AMjcBIhozBEACKwdh6iMKg9IfDaG6FxDDohMT4YoLFwNyBxohWf8dQ0H7IGEp8yODEe8moPnnKcLh4yzgydswArHXMyCZzzZCgcs5YGnDPIJRvz+gObdCwiGzReAJq0kB8aNMI9mfT0HBl1JjqZNVgZGLWKN5h1vBYX9e40l/TuNJf0LjSX8240l/LuNJfybjSX8i40l/HuNJfx7jSX8i40l/JuNJfybjSX8q40l/KuNJfyrjSX8u40l/LuNJfy7jSX8y40l/MuNJfzLjSX8240l/NuNJfzbjSX8640l/OuNJfzrjSX8+40l/PuNJfz7jSX9C40l/QuNJf0LjSX9G40l/RuNJf0bjSX9K40l/SuNJf0rjSX9O40l/TuNJf07jSX9S40l/UuNJf1LjSX9W40l/VuNJf1bjSX9a40l/WuNJf1rjSX9e40l/XuNJf17jSX9i40l/YuNJf2LjSX9m40l/ZuNJf2bjS");
const NINJA_STAGE4_AT3519_X216_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3519_X216_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3535_X184_FIXED_TRACE_NES = decodeFixedCoordinateSamples("uAIAsLgEALC4BgCwuAgAsLgKALC4DACwuA4AsLgQALC4EgCwuBQAsLgWALC4GACwuBoAsLgcALC4HgCwuCAAsLggALC4IACwuCAAsLggALC4IACwuCAAsLggALC4IACwuCAAsLggALC4IACwuCAAsLggALC4IACwuCAAsLggALC4IACwuCAAsLggALC4IACwuCIAsLgkALC4JgCwuCgAsLgqALC4LACwuC4AsLgwALC4MgCwuDQAsLg2ALC4OACwuDoAsLg8ALC4PgCwuEAAsLhCALC4RACwuEYAsLhIALC4SgCwuEwAsLhOALC4UACwuFIAsLhUALC4VgCwuFgAsLhaALC4XACwuF4AsLhgALC4YgCwuGQAsLhmALC4aACwuGoAsLhsALC4bgCwuHAAsLhyALC4dACwuHYAsLh4ALC4egCwuHwAsLh+ALC4gACwuIIAsLiEALC4hgCwuIgAsLiKALC4jACwuI4AsLiQALC4kgCwuJQAsLiWALC4mACwuJoAsLiaALC4mgCwuJoAsLiaALC4mgCwuJoAsLiaALC4mgCwuJoAsLiaALC4mgCwuJoAsLiaALC4mgCwuJoAsLiaALC4mgCwuJoAsLiaALC4mgCwtpfk9LWSyDizjqx8sYqQwLCHdASuhFhIrIE8jKp/INCpfQQUp3roWKV5zJyjeLDgoniUJKB4eGieeFysnHhA8Jx4QPCceEDwnHhA8Jx4QPCceEDwnHhA8Jx4QPCceEDwnHhA8Jx4QPCceEDwnHhA8Jx4QPCceEDwnHhA8Jx4QPCceEDwnHhA8Jx4QPCceEDwm3YkNJp3zEqZeXRgmHscdpd8xIyWfmyilYAUuJSBvM6Tg2TkkoUM+pKGtBCRiFwmkIoEPI+LrFKOjVRojY78foyQpJSLkkyqipP0wImVnNaIl0TsiJjsAoealBiGnDwuhZ3kRISfjFqDoTRwgqLchoGkhJyApiyyf6fUyH6pfN59qyT0fazMCnyudCB7sBw2erHETHmzbGJ4tRR4d7a8jna4ZKR1ugy6dLu00HO9XOZyvwT8csCsEnHCVChww/w+b8WkVG7HTGptyPSAbMqclmvMRKxqzezCac+U2GjRPO5o0uQEZ9SMGmbWNDBl19xGZNmEXGPbLHJi3NSIYd58nmDgJLRg3CS0YNkktGDWJLRg1CS0YNIktGDRJLRg0CS0YNAktGDRJLRg0iS0YNMktGDTJLRg0yS0YNQktGDUJLRg1CS0YNUktGDVJLRg1SS0YNYktGDWJLRg1iS0YNcktGDXJLRg1yS0YNgktGDYJLRg2CS0YNkktGDZJLRg2SS0YNoktGDaJLRg2iS0YNsktGDbJLRg2yS0YNwktGDcJLRg3CS0YN0ktGDdJLRg3SS0YN4ktGDeJLRg3iS0YN8ktGDfJLRg3yS0YOAktGDgJLRg4CS0YOEktGDhJLRg4SS0YOIktGDiJLRg4iS0YOMktA==");
const NINJA_STAGE4_AT3647_X136_FIXED_TRACE_NES = decodeFixedCoordinateSamples("iALKq4gEyquIBsqriAjKq4gKyquIDMqriA7Kq4gQyquIEsqriBTKq4gWyquIGMqriBrKq4gcyquIHsqriCDKq4ggyquIIMqriCDKq4ggyquIIMqriCDKq4ggyquIIMqriCDKq4ggyquIIMqriCDKq4ggyquIIMqriCDKq4ggyquIIMqriCDKq4ggyquIIMqriCLKq4gkyquIJsqriCjKq4gqyquILMqriC7Kq4gwyquIMsqriDTKq4g2yquIOMqriDrKq4g8yquIPsqriEDKq4hCyquIRMqriEbKq4hIyquISsqriEzKq4hOyquIUMqriFLKq4hUyquIVsqriFjKq4hayquIXMqriF7Kq4hgyquIYsqriGTKq4hmyquIaMqriGrKq4hsyquIbsqriHDKq4hyyquIdMqriHbKq4h4yquIesqriHzKq4h+yquIgMqriILKq4iEyquIhsqriIjKq4iKyquIjMqriI7Kq4iQyquIksqriJTKq4iWyquImMqriJjKq4iYyquImMqriJjKq4iYyquImMqriJjKq4iYyquImMqriJjKq4iYyquImMqriJjKq4iYyquImMqriJjKq4iYyquImMqriJjKq4iYyquGlq7vhZGSM4ONdneBiVq7f4Y+/36DIkN8gAaHen3qy3l7zg93ebJTdXiWl3N3ettyd14fcHdCY253JqdsdwrrbHcK62x3CutsdwrrbHcK62x3CutsdwrrbHcK62x3CutsdwrrbHcK62x3CutsdwrrbHcK62x3CutsdwrrbHcK62x3CutsdwrrbHcK62x3CutrdO4vbHLS625ttqdwaZpjcmV+H3NiYtt1X0aXd1wqU3laDg96V/LLfFXWh35UukN/U57/gVOCu4NTZneFU0ozhlMu74ZTLu+GUy7vhlMu74ZTLu+GUy7vhlMu74ZTLu+GUy7vhlMu74ZTLu+GUy7vhlMu74ZTLu+GUy7vhlMu74ZTLu+GUy7vhlMu74ZTLu+GUy7viFESq4ZO9u+FSdozg0W+d4FBort/Pob/fjtqQ3w4Tod6NjLLeTQWD3cx+lN1MN6Xcy/C23Ivph9wL4pjbi9up2wvUutsL1LrbC9S62wvUutsL1LrbC9S62wvUutsL1LrbC9S62wvUutsL1LrbC9S62wvUutsL1LrbC9S62wvUutsL1LrbC9S62wvUutsL1LrbC9S62stNi9sKxrrbiX+p3Ah4mNyHcYfcxqq23UXjpd3FHJTeRJWD3oQOst8Dh6Hfg0CQ38L5v+BC8q7gwuud4ULkjOGC3bvhgt274YLdu+GC3bvhgt274YLdu+GC3bvhgt274YLdu+GC3bvhgt274YLdu+GC3bvhgt274YLdu+GC3bvhgt274YLdu+GC3bvhgt274YLdu+ICVqriAtMW4gNPguHDzC7hxEia4cTFBuGFQbLhhb4e4YY6iuFGtzbhRzOi4UewDuEILLrhCKkm4QklkuDJoj7gyh6q4MqbFuDLF4Lgi5Qu4IwQmuCMjQbgTQmy4E2GHuBOAorgDn824A77ouAPeA7fz/S639BxJt/Q7ZLfkWo+35Hmqt+SYxbfkt+C31NcLt9T2JrfVFUG3xTRst8VTh7fFcqK3tZHNt7Ww6Le10AO3pe8ut6YOSbemLWS3lkyPt5ZrqreWisW3lqngt4bJC7eG6Ca3hwdBt3cmbLd3RYe3d2Sit2eDzbdnoui3Z8IDt1fhLrdYAEm3WB9kt0g+j7dIXaq3SHzFt0ib4Lc4uwu3ONomtzj5QbcpGGy3KTeHtylWorcZdc23GZTotxm0A7cJ0y63CfJJtwoRZLb6MI+2+k+qtvpuxbb6jeC26q0LturMJrbq60G22wpsttsph7bbSKK2y2fNtsuG6LbLpgO2u8UutrvkSba8A2S2rCKPtqxBqrasYMW2rH/gtpyfC7acviaw==");
const NINJA_STAGE4_AT3647_X136_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3647_X136_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3647_X176_FIXED_TRACE_NES = decodeFixedCoordinateSamples("sAK/hbAEv4WwBr+FsAi/hbAKv4WwDL+FsA6/hbAQv4WwEr+FsBS/hbAWv4WwGL+FsBq/hbAcv4WwHr+FsCC/hbAgv4WwIL+FsCC/hbAgv4WwIL+FsCC/hbAgv4WwIL+FsCC/hbAgv4WwIL+FsCC/hbAgv4WwIL+FsCC/hbAgv4WwIL+FsCC/hbAgv4WwIL+FsCK/hbAkv4WwJr+FsCi/hbAqv4WwLL+FsC6/hbAwv4WwMr+FsDS/hbA2v4WwOL+FsDq/hbA8v4WwPr+FsEC/hbBCv4WwRL+FsEa/hbBIv4WwSr+FsEy/hbBOv4WwUL+FsFK/hbBUv4WwVr+FsFi/hbBav4WwXL+FsF6/hbBgv4WwYr+FsGS/hbBmv4WwaL+FsGq/hbBsv4Wwbr+FsHC/hbByv4WwdL+FsHa/hbB4v4Wwer+FsHy/hbB+v4WwgL+FsIK/hbCEv4Wwhr+FsIi/hbCKv4WwjL+FsI6/hbCQv4Wwkr+FsJS/hbCWv4WwmL+FsJi/hbCYv4WwmL+FsJi/hbCYv4WwmL+FsJi/hbCYv4WwmL+FsJi/hbCYv4WwmL+FsJi/hbCYv4WwmL+FsJi/hbCYv4WwmL+FsJi/hbCYv4WulqPJrZGHDauNa1GpiU+Vp4Yz2aaDFx2kf/thon3fpaB7w+mfeactnXiLcZt3b7WZd1P5mHc3PZZ3G4GUdv/FlHb/xZR2/8WUdv/FlHb/xZR2/8WUdv/FlHb/xZR2/8WUdv/FlHb/xZR2/8WUdv/FlHb/xZR2/8WUdv/FlHb/xZR2/8WUdv/FlHb/xZR2/8WTdOMJkXLHTY9tq5GNaY/VjGVzGYpiV12IXzuhhlwf5YVaAymDV+dtgVXLsX9Ur/V+U5M5fFN3fXpTW8F5Uz8Fd1MjSXdTI0l3UyNJd1MjSXdTI0l3UyNJd1MjSXdTI0l3UyNJd1MjSXdTI0l3UyNJd1MjSXdTI0l3UyNJd1MjSXdTI0l3UyNJd1MjSXdTI0l3UyNJdVEHjXdO60l5Sc8FekWzwXxBl31+Pns5fztf9YE4Q7GDNidthTQLKYYx7+WIMNOhii+3XYwvmxmNL3/Vjy9jkZEvR02RL0dNkS9HTZEvR02RL0dNkS9HTZEvR02RL0dNkS9HTZEvR02RL0dNkS9HTZEvR02RL0dNkS9HTZEvR02RL0dNkS9HTZEvR02RL0dNkS9HTZMtKwmSLx25kjEPaZIzARmRNPPJkTbleZE41ymQOsnZkDy7iZA+rTmPQJ/pj0KRmY9Eg0mORnX5jkhnqY5KWVmOTEsJjU49uY1QL2mNUiEZjFQTyYxWBXmMV/cpi1np2Ytb24mLXc05il+/6YphsZmKY6NJiWWV+Ylnh6mJaXlZiWtrCYhtXbmIb09piHFBGYdzM8mHdSV5h3cXKYZ5CdmGevuJhnztOYV+3+mFgNGZhYLDSYSEtfmEhqephIiZWYSKiwmDjH25g45vaYOQYRmCklPJgpRFeYKWNymBmCnZgZobiYGcDTmAnf/pgJ/xmYCh40l/o9X5f6XHqX+nuVl/qasJfquduX6tj2l+r4EZfbFzyX2zZXl9tVcpfLdJ2Xy5O4l8uy05e70f6Xu/EZl7wQNJesL1+XrE56l6xtlZesjLCXnKvbl5zK9pec6hGXjQk8l40oV5eNR3KXfWadl32FuJd9pNOXbcP+l23jGZduAjSXXiFfl15AepdeX5WXXn6wl06d25dOvPaXTtwRlz77PJc/GleXPzlyly9YnZcvd7iXL5bTlx+1/pcf1RmXH/Q0k=");
const NINJA_STAGE4_AT3647_X176_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3647_X176_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3647_X216_FIXED_TRACE_NES = decodeFixedCoordinateSamples("2ALyf9gE8n/YBvJ/2Ajyf9gK8n/YDPJ/2A7yf9gQ8n/YEvJ/2BTyf9gW8n/YGPJ/2Bryf9gc8n/YHvJ/2CDyf9gg8n/YIPJ/2CDyf9gg8n/YIPJ/2CDyf9gg8n/YIPJ/2CDyf9gg8n/YIPJ/2CDyf9gg8n/YIPJ/2CDyf9gg8n/YIPJ/2CDyf9gg8n/YIPJ/2CLyf9gk8n/YJvJ/2Cjyf9gq8n/YLPJ/2C7yf9gw8n/YMvJ/2DTyf9g28n/YOPJ/2Dryf9g88n/YPvJ/2EDyf9hC8n/YRPJ/2Ebyf9hI8n/YSvJ/2Ezyf9hO8n/YUPJ/2FLyf9hU8n/YVvJ/2Fjyf9ha8n/YXPJ/2F7yf9hg8n/YYvJ/2GTyf9hm8n/YaPJ/2Gryf9hs8n/YbvJ/2HDyf9hy8n/YdPJ/2Hbyf9h48n/YevJ/2Hzyf9h+8n/YgPJ/2ILyf9iE8n/YhvJ/2Ijyf9iK8n/YjPJ/2I7yf9iQ8n/YkvJ/2JTyf9iW8n/YmPJ/2Jjyf9iY8n/YmPJ/2Jjyf9iY8n/YmPJ/2Jjyf9iY8n/YmPJ/2Jjyf9iY8n/YmPJ/2Jjyf9iY8n/YmPJ/2Jjyf9iY8n/YmPJ/2Jjyf9iY8n/WltbD1ZG6B9ONnkvRiYKPz4Zm086DShfMgC5byn4Sn8h79uPHedonxXi+a8N3oq/Bd4bzwHdqN753Tnu8dzK/vHcyv7x3Mr+8dzK/vHcyv7x3Mr+8dzK/vHcyv7x3Mr+8dzK/vHcyv7x3Mr+8dzK/vHcyv7x3Mr+8dzK/vHcyv7x3Mr+8dzK/vHcyv7x3Mr+7dRYDuXL6R7dt3ou1acLPtGWmE7JiilewX26brlxS361aNiOrWBpnqVX+q6dU4u+mU8YzpFOqd6JTjrugU3L/n1NWQ59TVkOfU1ZDn1NWQ59TVkOfU1ZDn1NWQ59TVkOfU1ZDn1NWQ59TVkOfU1ZDn1NWQ59TVkOfU1ZDn1NWQ59TVkOfU1ZDn1NWQ59TVkOfU1ZDnVE6h5xTFOecVO5Hm1bIp5tYogeaWnxnmVxWx5leMCeYYAqHl2Hk55djvkeWZZinlmdyB5VpTGeUaybHlG0AJ5Nu2oeScLTnknKOR5F0aKeRdkIHkHgcZ4959sePe9Anjn2qh41/hOeNgV5HjIM4p4yFEgeLhuxniojGx4qKoCeJjHqHiI5U54iQLkeHkginh5PiB4aVvGeFl5bHhZlwJ4SbSoeDnSTng57+R4Kg2KeCorIHgaSMZ4CmZseAqEAnf6oah36r9Od+rc5Hfa+op32xggd8s1xne7U2x3u3ECd6uOqHebrE53m8nkd4vnineMBSB3fCLGd2xAbHdsXgJ3XHuod0yZTndMtuR3PNSKdzzyIHctD8Z3HS1sdx1LAn");
const NINJA_STAGE4_AT3647_X216_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3647_X216_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3743_X120_FIXED_TRACE_NES = decodeFixedCoordinateSamples("eAK5qXgEual4BrmpeAi5qXgKual4DLmpeA65qXgQual4ErmpeBS5qXgWual4GLmpeBq5qXgcual4HrmpeCC5qXggual4ILmpeCC5qXggual4ILmpeCC5qXggual4ILmpeCC5qXggual4ILmpeCC5qXggual4ILmpeCC5qXggual4ILmpeCC5qXggual4ILmpeCK5qXgkual4JrmpeCi5qXgqual4LLmpeC65qXgwual4MrmpeDS5qXg2ual4OLmpeDq5qXg8ual4PrmpeEC5qXhCual4RLmpeEa5qXhIual4SrmpeEy5qXhOual4ULmpeFK5qXhUual4VrmpeFi5qXhaual4XLmpeF65qXhgual4YrmpeGS5qXhmual4aLmpeGq5qXhsual4brmpeHC5qXhyual4dLmpeHa5qXh4ual4ermpeHy5qXh+ual4gLmpeIK5qXiEual4hrmpeIi5qXiKual4jLmpeI65qXiQual4krmpeJS5qXiWual4mLmpeJi5qXiYual4mLmpeJi5qXiYual4mLmpeJi5qXiYual4mLmpeJi5qXiYual4mLmpeJi5qXiYual4mLmpeJi5qXiYual4mLmpeJi5qXiYual6lp1lfJGBIX2NZd1/iUmZgYYtVYODERGEf/XNhn3ZiYh7vUWKeaEBi3iFvY13aXmPd001kHcx8ZJ3Fa2UdvlplHb5aZR2+WmUdvlplHb5aZR2+WmUdvlplHb5aZR2+WmUdvlplHb5aZR2+WmUdvlplHb5aZR2+WmUdvlplHb5aZR2+WmUdvlplHb5aZR2+WmWdN0llXa3hZR4keWUemtFk3xFpZN+HwWSf/llkYHTxZGDrSWQhYeFj4dh5Y+JO0WOixWljozvBY2OyWWMkKPFjJJ9JYuUV4WKljHlipgLRYmZ5aWJm78FiJ2ZZYefc8WHoU0lhqMnhYWlAeWFpttFhKi1pYSqjwWDrGllgq5DxYKwHSWBsfeFgLPR5YC1q0V/t4Wlf7lfBX67OWV9vRPFfb7tJXzAx4V7wqHle8R7RXrGVaV6yC8FecoJZXjL48V4zb0ld8+XhXbRceV200tFddUlpXXW/wV02Nllc9qzxXPcjSVy3meFceBB5XHiG0Vw4/WlcOXPBW/nqWVu6YPFbutdJW3tN4Vs7xHlbPDrRWvyxaVr9J8FavZ5ZWn4U8Vp+i0laPwHhWf94eVn/7tF");
const NINJA_STAGE4_AT3743_X120_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3743_X120_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3759_X152_FIXED_TRACE_NES = decodeFixedCoordinateSamples("mAI2JZgENiWYBjYlmAg2JZgKNiWYDDYlmA42JZgQNiWYEjYlmBQ2JZgWNiWYGDYlmBo2JZgcNiWYHjYlmCA2JZggNiWYIDYlmCA2JZggNiWYIDYlmCA2JZggNiWYIDYlmCA2JZggNiWYIDYlmCA2JZggNiWYIDYlmCA2JZggNiWYIDYlmCA2JZggNiWYIDYlmCI2JZgkNiWYJjYlmCg2JZgqNiWYLDYlmC42JZgwNiWYMjYlmDQ2JZg2NiWYODYlmDo2JZg8NiWYPjYlmEA2JZhCNiWYRDYlmEY2JZhINiWYSjYlmEw2JZhONiWYUDYlmFI2JZhUNiWYVjYlmFg2JZhaNiWYXDYlmF42JZhgNiWYYjYlmGQ2JZhmNiWYaDYlmGo2JZhsNiWYbjYlmHA2JZhyNiWYdDYlmHY2JZh4NiWYejYlmHw2JZh+NiWYgDYlmII2JZiENiWYhjYlmIg2JZiKNiWYjDYlmI42JZiQNiWYkjYlmJQ2JZiWNiWYmDYlmJg2JZiYNiWYmDYlmJg2JZiYNiWYmDYlmJg2JZiYNiWYmDYlmJg2JZiYNiWYmDYlmJg2JZiYNiWYmDYlmJg2JZiYNiWYmDYlmJg2JZiYNiWWlhpplJD+rZKM4vGRiMY1j4WqeY2Cjr2Mf3IBin1WRYh7OomGeR7NhXgCEYN25lWBdsqZf3au3X52kiF8dnZlfHZ2ZXx2dmV8dnZlfHZ2ZXx2dmV8dnZlfHZ2ZXx2dmV8dnZlfHZ2ZXx2dmV8dnZlfHZ2ZXx2dmV8dnZlfHZ2ZXx2dmV8dnZlfHZ2ZXx2dmV6dFqpenZMWXp4Pgl5ejC5eXwiaXl+FBl4gAbJeIH4eXiD6il3hdzZd4fOiXeJwDl2i7Lpdo2kmXaPlkl1kYj5dZN6qXWVbFl1l14JdJlQuXSbQml0nTQZc58myXOhGHlzowopcqT82XKm7olyqOA5carS6XGsxJlxrrZJcLCo+XCymqlwtIxZcLZ+CW+4cLlvumJpb7xUGW6+RsluwDh5bsIqKW3EHNltxg6JbcgAOWzJ8ulsy+SZ");
const NINJA_STAGE4_AT3759_X152_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3759_X152_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1519_X104_FIXED_TRACE_NES = decodeFixedCoordinateSamples("aAIwomgEMKJoBjCiaAgwomgKMKJoDDCiaA4womgQMKJoEjCiaBQwomgWMKJoGDCiaBowomgcMKJoHjCiaCAwomggMKJoIDCiaCAwomggMKJoIDCiaCAwomggMKJoIDCiaCAwomggMKJoIDCiaCAwomggMKJoIDCiaCAwomggMKJoIDCiaCAwomggMKJoIDCiaCIwomgkMKJoJjCiaCgwomgqMKJoLDCiaC4womgwMKJoMjCiaDQwomg2MKJoODCiaDowomg8MKJoPjCiaEAwomhCMKJoRDCiaEYwomhIMKJoSjCiaEwwomhOMKJoUDCiaFIwomhUMKJoVjCiaFgwomhaMKJoXDCiaF4womhgMKJoYjCiaGQwomhmMKJoaDCiaGowomhsMKJobjCiaHAwomhyMKJodDCiaHYwomh4MKJoejCiaHwwomh+MKJogDCiaIIwomiEMKJohjCiaIgwomiKMKJojDCiaI4womiQMKJokjCiaJQwomiWMKJomDCiaJgwomiYMKJomDCiaJgwomiYMKJomDCiaJgwomiYMKJomDCiaJgwomiYMKJomDCiaJgwomiYMKJomDCiaJgwomiYMKJomDCiaJgwomiYMKJqlhRebJD4Gm2M3NZviMCScYWkTnOCiAp0f2zGdn1Qgnh7ND55eRj6e3f8tn124HJ/dsQugHao6oJ2jKaEdnBihHZwYoR2cGKEdnBihHZwYoR2cGKEdnBihHZwYoR2cGKEdnBihHZwYoR2cGKEdnBihHZwYoR2cGKEdnBihHZwYoR2cGKEdnBihHZwYoR2cGKGdFQehnZGboZ4OL6HeioOh3wcXod+Dq6HgAD+iIHyToiD5J6IhdbuiYfIPomJuo6Ji6zeio2eLoqPkH6KkYLOi5N0HouVZm6Ll1i+jJlKDoybPF6MnS6ujJ8g/o2hEk6NowSejaT27o6m6D6OqNqOjqrM3o+svi6PrrB+j7CizpCylB6QtIZukLZ4vpG4ag6RulxekbxOrpG+QP6SwDJOksIknpLEFu6Txgg+k8f6jpPJ7N6Uy94ulM3QfpTPws6V0bQeldOmbpXVmL6W14oOltl8Xpbbbq6W3WD+l99STpfhRJ6X4zbumOUoPpjnGo6Y6Qzemer+Lpns8H6Z7uLOmvDUHpryxm6a9Li+m/aqDpv4nF6b+o6um/yA/pz+ck4=");
const NINJA_STAGE4_AT1519_X104_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1519_X104_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2031_X56_FIXED_TRACE_NES = decodeFixedCoordinateSamples("OAKSXzgEkl84BpJfOAiSXzgKkl84DJJfOA6SXzgQkl84EpJfOBSSXzgWkl84GJJfOBqSXzgckl84HpJfOCCSXzggkl84IJJfOCCSXzggkl84IJJfOCCSXzggkl84IJJfOCCSXzggkl84IJJfOCCSXzggkl84IJJfOCCSXzggkl84IJJfOCCSXzggkl84IJJfOCKSXzgkkl84JpJfOCiSXzgqkl84LJJfOC6SXzgwkl84MpJfODSSXzg2kl84OJJfODqSXzg8kl84PpJfOECSXzhCkl84RJJfOEaSXzhIkl84SpJfOEySXzhOkl84UJJfOFKSXzhUkl84VpJfOFiSXzhakl84XJJfOF6SXzhgkl84YpJfOGSSXzhmkl84aJJfOGqSXzhskl84bpJfOHCSXzhykl84dJJfOHaSXzh4kl84epJfOHySXzh+kl84gJJfOIKSXziEkl84hpJfOIiSXziKkl84jJJfOI6SXziQkl84kpJfOJSSXziWkl84mJJfOJiSXziYkl84mJJfOJiSXziYkl84mJJfOJiSXziYkl84mJJfOJiSXziYkl84mJJfOJiSXziYkl84mJJfOJiSXziYkl84mJJfOJiSXziYkl86lnYbO5Fa1z2NPpM/iSJPQYYGC0KC6sdEf86DRn2yP0d7lvtJeXq3S3hec013Qi9OdybrUHcKp1J27mNUdtIfVHbSH1R20h9UdtIfVHbSH1R20h9UdtIfVHbSH1R20h9UdtIfVHbSH1R20h9UdtIfVHbSH1R20h9UdtIfVHbSH1R20h9UdtIfVHbSH1R20h9VdLbbV3Kal1ltflNbaWIPXGVGy15iKodgXw5DYVvy/2NZ1rtlV7p3Z1WeM2hUgu9qU2arbFNKZ25TLiNvUxLfcVL2m3FS9ptxUvabcVL2m3FS9ptxUvabcVL2m3FS9ptxUvabcVL2m3FS9ptxUvabcVL2m3FS9ptxUvabcVL2m3FS9ptxUvabcVL2m3FS9ptxUvabc1DaV3FOvptvSaLfbkWGI2xBamdqPk6raDsy72c4FjNlNfp3YzPeu2Exwv9gMKZDXi+Kh1wvbstbL1IPWS82U1cvGpdXLxqXVy8al1cvGpdXLxqXVy8al1cvGpdXLxqXVy8al1cvGpdXLxqXVy8al1cvGpdXLxqXVy8al1cvGpdXLxqXVy8al1cvGpdXLxqXVy8al1Us/ttXKuKXWSXGU1shqg9cHY7LXhpyh2AXVkNhFDr/YxIeu2UQAndnDeYzaAzK72oLrqtsC5Jnbgt2I28LWt9xCz6bcQs+m3ELPptxCz6bcQs+m3ELPptxCz6bcQs+m3ELPptxCz6bcQs+m3ELPptxCz6bcQs+m3ELPptxCz6bcQs+m3ELPptxCz6bcQs+m3ELPptzCSJXdQcGE3YB6s8=");
const NINJA_STAGE4_AT2031_X56_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2031_X56_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2239_X104_FIXED_TRACE_NES = decodeFixedCoordinateSamples("aALswWgE7MFoBuzBaAjswWgK7MFoDOzBaA7swWgQ7MFoEuzBaBTswWgW7MFoGOzBaBrswWgc7MFoHuzBaCDswWgg7MFoIOzBaCDswWgg7MFoIOzBaCDswWgg7MFoIOzBaCDswWgg7MFoIOzBaCDswWgg7MFoIOzBaCDswWgg7MFoIOzBaCDswWgg7MFoIOzBaCLswWgk7MFoJuzBaCjswWgq7MFoLOzBaC7swWgw7MFoMuzBaDTswWg27MFoOOzBaDrswWg87MFoPuzBaEDswWhC7MFoROzBaEbswWhI7MFoSuzBaEzswWhO7MFoUOzBaFLswWhU7MFoVuzBaFjswWha7MFoXOzBaF7swWhg7MFoYuzBaGTswWhm7MFoaOzBaGrswWhs7MFobuzBaHDswWhy7MFodOzBaHbswWh47MFoeuzBaHzswWh+7MFogOzBaILswWiE7MFohuzBaIjswWiK7MFojOzBaI7swWiQ7MFokuzBaJTswWiW7MFomOzBaJjswWiY7MFomOzBaJjswWiY7MFomOzBaJjswWiY7MFomOzBaJjswWiY7MFomOzBaJjswWiY7MFomOzBaJjswWiY7MFomOzBaJjswWiY7MFqltB9bJG0OW2NmPVviXyxcYZgbXODRCl0gCjldn4MoXh78F16edQZe3i41X13nJF/d4BNgXdkCYJ3SMWEdyyBhHcsgYR3LIGEdyyBhHcsgYR3LIGEdyyBhHcsgYR3LIGEdyyBhHcsgYR3LIGEdyyBhHcsgYR3LIGEdyyBhHcsgYR3LIGEdyyBhHcsgYR3LIGGdRA9hXbqnYR4xP2Eep5dg3x4vYN+Uh2CgCx9gYIG3YGD4D2Ahbqdf4eU/X+Jbl1+i0i9fo0iHX2O/H18kNbdfJKwPXuUip16lmT9epg+XXmaGL15m/IdeJ3MfXefpt13oYA9dqNanXWlNP11pw5ddKjovXSqwh1zrJx9cq523XKwUD1xsiqdcLQE/XC13l1vt7i9b7mSHW67bH1tvUbdbb8gPWzA+p1rwtT9a8SuXWrGiL1qyGIdaco8fWjMFt1ozfA9Z8/KnWbRpP1m035dZdVYvWXXMh1k2Qx9Y9rm3WPcwD1i3pqdYeB0/WHiTl1g5Ci9YOYCHV/n3H1e6bbdXuuQPV3tap1c70T9XPEeXVvy+L1b9NIdWvasfVn4ht1Z+mA9WPw6nVf+FP1X/+5d");
const NINJA_STAGE4_AT2239_X104_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2239_X104_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1535_X144_FIXED_TRACE_NES = decodeFixedCoordinateSamples("kAJgE5AEYBOQBmATkAhgE5AKYBOQDGATkA5gE5AQYBOQEmATkBRgE5AWYBOQGGATkBpgE5AcYBOQHmATkCBgE5AgYBOQIGATkCBgE5AgYBOQIGATkCBgE5AgYBOQIGATkCBgE5AgYBOQIGATkCBgE5AgYBOQIGATkCBgE5AgYBOQIGATkCBgE5AgYBOQIGATkCJgE5AkYBOQJmATkChgE5AqYBOQLGATkC5gE5AwYBOQMmATkDRgE5A2YBOQOGATkDpgE5A8YBOQPmATkEBgE5BCYBOQRGATkEZgE5BIYBOQSmATkExgE5BOYBOQUGATkFJgE5BUYBOQVmATkFhgE5BaYBOQXGATkF5gE5BgYBOQYmATkGRgE5BmYBOQaGATkGpgE5BsYBOQbmATkHBgE5ByYBOQdGATkHZgE5B4YBOQemATkHxgE5B+YBOQgGATkIJgE5CEYBOQhmATkIhgE5CKYBOQjGATkI5gE5CQYBOQkmATkJRgE5CWYBOQmGATkJhgE5CYYBOQmGATkJhgE5CYYBOQmGATkJhgE5CYYBOQmGATkJhgE5CYYBOQmGATkJhgE5CYYBOQmGATkJhgE5CYYBOQmGATkJhgE5CYYBOQmjqzkZwUU5Gd7vOSn8iTk6GiM5OjfNOUpVZzlacwE5WpCrOWquRTlqy+85eumJOYsHIzmLJM05m0JnOatgATmrfas5u5tFObu47znL1ok52/QjOdwRzTnsL2c5/E0BOfxqqzoMiEU6DKXvM=");
const NINJA_STAGE4_AT1535_X144_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1535_X144_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3055_X56_FIXED_TRACE_NES = decodeFixedCoordinateSamples("OALwWzgE8Fs4BvBbOAjwWzgK8Fs4DPBbOA7wWzgQ8Fs4EvBbOBTwWzgW8Fs4GPBbOBrwWzgc8Fs4HvBbOCDwWzgg8Fs4IPBbOCDwWzgg8Fs4IPBbOCDwWzgg8Fs4IPBbOCDwWzgg8Fs4IPBbOCDwWzgg8Fs4IPBbOCDwWzgg8Fs4IPBbOCDwWzgg8Fs4IPBbOCLwWzgk8Fs4JvBbOCjwWzgq8Fs4LPBbOC7wWzgw8Fs4MvBbODTwWzg28Fs4OPBbODrwWzg88Fs4PvBbOEDwWzhC8Fs4RPBbOEbwWzhI8Fs4SvBbOEzwWzhO8Fs4UPBbOFLwWzhU8Fs4VvBbOFjwWzha8Fs4XPBbOF7wWzhg8Fs4YvBbOGTwWzhm8Fs4aPBbOGrwWzhs8Fs4bvBbOHDwWzhy8Fs4dPBbOHbwWzh48Fs4evBbOHzwWzh+8Fs4gPBbOILwWziE8Fs4hvBbOIjwWziK8Fs4jPBbOI7wWziQ8Fs4kvBbOJTwWziW8Fs4mPBbOJjwWziY8Fs4mPBbOJjwWziY8Fs4mPBbOJjwWziY8Fs4mPBbOJjwWziY8Fs4mPBbOJjwWziY8Fs4mPBbOJjwWziY8Fs4mPBbOJjwWziY8Fs6ltQXO5G40z2NnI8/iYBLQYZkB0KDSMNEgCx/Rn4QO0d79PdJedizS3i8b013oCtOd4TnUHdoo1J3TF9UdzAbVHcwG1R3MBtUdzAbVHcwG1R3MBtUdzAbVHcwG1R3MBtUdzAbVHcwG1R3MBtUdzAbVHcwG1R3MBtUdzAbVHcwG1R3MBtUdzAbVHcwG1R3MBtVdRTXV3L4k1lt3E9bacALXGWkx15iiINgX2w/YVxQ+2NaNLdlWBhzZ1X8L2hU4OtqU8SnbFOoY25TjB9vU3DbcVNUl3FTVJdxU1SXcVNUl3FTVJdxU1SXcVNUl3FTVJdxU1SXcVNUl3FTVJdxU1SXcVNUl3FTVJdxU1SXcVNUl3FTVJdxU1SXcVNUl3FTVJdxU1SXc1E4U3VPHA92SgDLeEXkh3pByEN7Pqz/fTuQu384dHeBNlgzgjQ874QyIKuGMQRniC/oI4kvzN+LL7CbjS+UV48veBOPL3gTjy94E48veBOPL3gTjy94E48veBOPL3gTjy94E48veBOPL3gTjy94E48veBOPL3gTjy94E48veBOPL3gTjy94E48veBOPL3gTjy94E5AtXM+QL05/kDFAL48zMt+PNSSPjzcWP445CO+OOvqfjjzsT40+3v+NQNCvjULCX41EtA+MRqa/jEiYb4xKih+LTHzPi05uf4tQYC+KUlLfilREj4pWNj+JWCjviVoan4lcDE+IXf7/iF/wr4hh4l+IY9QPh2XGv4dnuG+Haaofhmucz4Ztjn+Gb4AvhXFy34VzZI+FdVY/hHdI74R5Op+EeyxPg30e/4N/EK+DgQJfg4L0D4KE5r+ChthvgojKH4GKvM+BjK5/gY6gL4CQkt+AkoSPgJR2P3+WaO9/mFqff5pMT36cPv9+njCvfqAiX36iFA99pAa/faX4b32n6h98qdzPfKvOf3ytwC97r7Lfe7Gkj3uzlj96tYjverd6n3q5bE95u17/eb1Qr3m/Ql95wTQPeMMmv3jFGG94xwofd8j8z3fK7n93zOAvds7S33bQxI920rY/ddSo73XWmp912IxPdNp+/3TccK903mJfdOBUD3PiRr9z5Dhvc+YqH3LoHM9y6g5/cuwAL3Ht8t9x7+SPcfHWP3DzyO9w9bqfcPesT2/5nv9v+5Cvb/2CX2//dA8=");
const NINJA_STAGE4_AT3055_X56_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3055_X56_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1551_X240_FIXED_TRACE_NES = decodeFixedCoordinateSamples("8AIAsPAEALDwBgCw8AgAsPAKALDwDACw8A4AsPAQALDwEgCw8BQAsPAWALDwGACw8BoAsPAcALDwHgCw8CAAsPAgALDwIACw8CAAsPAgALDwIACw8CAAsPAgALDwIACw8CAAsPAgALDwIACw8CAAsPAgALDwIACw8CAAsPAgALDwIACw8CAAsPAgALDwIACw8CIAsPAkALDwJgCw8CgAsPAqALDwLACw8C4AsPAwALDwMgCw8DQAsPA2ALDwOACw8DoAsPA8ALDwPgCw8EAAsPBCALDwRACw8EYAsPBIALDwSgCw8EwAsPBOALDwUACw8FIAsPBUALDwVgCw8FgAsPBaALDwXACw8F4AsPBgALDwYgCw8GQAsPBmALDwaACw8GoAsPBsALDwbgCw8HAAsPByALDwdACw8HYAsPB4ALDwegCw8HwAsPB+ALDwgACw8IIAsPCEALDwhgCw8IgAsPCKALDwjACw8I4AsPCQALDwkgCw8JQAsPCWALDwmACw8JgAsPCYALDwmACw8JgAsPCYALDwmACw8JgAsPCYALDwmACw8JgAsPCYALDwmACw8JgAsPCYALDwmACw8JgAsPCYALDwmACw8JgAsPCYALDuleT07ZDIOOuMrHzpiJDA6IV0BOaCWEjkfzyM4n0g0OF7BBTfeOhY3XfMnNt2sODadpQk2HZ4aNZ2XKzUdkDw1HZA8NR2QPDUdkDw1HZA8NR2QPDUdkDw1HZA8NR2QPDUdkDw1HZA8NR2QPDUdkDw1HZA8NR2QPDUdkDw1HZA8NR2QPDUdkDw1HZA8NR2QPDTdCQ00nX+lNF32PTRebJU0HuMtNB9ZhTPf0B0zoEa1M6C9DTNhM6UzIao9MyIglTLily0y4w2FMqOEHTJj+rUyZHENMiTnpTHlXj0x5dSVMaZLLTGmwYUxZzgdMSeutTEoJQ0w6JulMKkSPTCpiJUwaf8tMGp1hTAq7B0v62K1L+vZDS+sT6UvbMY9L208lS8tsy0vLimFLu6gHS6vFrUur40NLnADpS4wej0uMPCVLfFnLS3x3YUtslQdLXLKtS1zQQ0tM7elLPQuPSz0pJUstRstLLWRhSx2CB0");
const NINJA_STAGE4_AT1551_X240_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1551_X240_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1567_X216_FIXED_TRACE_NES = decodeFixedCoordinateSamples("2AIAsNgEALDYBgCw2AgAsNgKALDYDACw2A4AsNgQALDYEgCw2BQAsNgWALDYGACw2BoAsNgcALDYHgCw2CAAsNggALDYIACw2CAAsNggALDYIACw2CAAsNggALDYIACw2CAAsNggALDYIACw2CAAsNggALDYIACw2CAAsNggALDYIACw2CAAsNggALDYIACw2CIAsNgkALDYJgCw2CgAsNgqALDYLACw2C4AsNgwALDYMgCw2DQAsNg2ALDYOACw2DoAsNg8ALDYPgCw2EAAsNhCALDYRACw2EYAsNhIALDYSgCw2EwAsNhOALDYUACw2FIAsNhUALDYVgCw2FgAsNhaALDYXACw2F4AsNhgALDYYgCw2GQAsNhmALDYaACw2GoAsNhsALDYbgCw2HAAsNhyALDYdACw2HYAsNh4ALDYegCw2HwAsNh+ALDYgACw2IIAsNiEALDYhgCw2IgAsNiKALDYjACw2I4AsNiQALDYkgCw2JQAsNiWALDYmACw2JgAsNiYALDYmACw2JgAsNiYALDYmACw2JgAsNiYALDYmACw2JgAsNiYALDYmACw2JgAsNiYALDYmACw2JgAsNiYALDYmACw2JgAsNiYALDWleT01ZDIONOMrHzRiJDA0IV0BM6CWEjMfzyMyn0g0Ml7BBTHeOhYxXfMnMN2sODCdpQkwHZ4aL52XKy8dkDwvHZA8Lx2QPC8dkDwvHZA8Lx2QPC8dkDwvHZA8Lx2QPC8dkDwvHZA8Lx2QPC8dkDwvHZA8Lx2QPC8dkDwvHZA8Lx2QPC8dkDwvHZA8Lx2QPC7dCQ0unYW5Lp4CJS6efpEuXvs9Ll93qS5f9BUuYHCBLiDtLS4haZkuIeYFLeJisS3i3x0t41uJLaPYNS2kVKEtpNENLWVNuS1lyiUtZkaRLSbDPS0nP6ktJ7wVLSg4gSzotS0s6TGZLOmuBSyqKrEsqqcdLKsjiSxroDUsbByhLGyZDSwtFbksLZIlLC4OkSvuiz0r7wepK++EFSvwAIErsH0tK7D5mSuxdgUrcfKxK3JvHSty64k");
const NINJA_STAGE4_AT1567_X216_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1567_X216_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1775_X160_FIXED_TRACE_NES = decodeFixedCoordinateSamples("oAIA8KAEAPCgBgDwoAgA8KAKAPCgDADwoA4A8KAQAPCgEgDwoBQA8KAWAPCgGADwoBoA8KAcAPCgHgDwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCAA8KAgAPCgIADwoCIA8KAkAPCgJgDwoCgA8KAqAPCgLADwoC4A8KAwAPCgMgDwoDQA8KA2APCgOADwoDoA8KA8APCgPgDwoEAA8KBCAPCgRADwoEYA8KBIAPCgSgDwoEwA8KBOAPCgUADwoFIA8KBUAPCgVgDwoFgA8KBaAPCgXADwoF4A8KBgAPCgYgDwoGQA8KBmAPCgaADwoGoA8KBsAPCgbgDwoHAA8KByAPCgdADwoHYA8KB4APCgegDwoHwA8KB+APCggADwoIIA8KCEAPCghgDwoIgA8KCKAPCgjADwoI4A8KCQAPCgkgDwoJQA8KCWAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCgmADwoJgA8KCYAPCfleQ0nZDIeJuMrLyaiJAAmIV0RJaCWIiUfzzMk30gEJF7BFSPeOiYjXfM3Ix2sCCKdpRkiHZ4qIZ2XOyFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCFdkAwhXZAMIV2QDCDdCR0hHX+FIR32LSFebJUhXuM9IZ9ZpSHf0A0h4Ea1IiC9HSJhM4UiYaotIqIglSKilz0i4w2lIyOEDSMj+rUjZHEdI6TnhSOlXi0j5dSVI+ZLPSQmwaUkZzgNJGeutSSoJR0k6JuFJOkSLSUpiJUlKf89JWp1pSWq7A0lq2K1JevZHSYsT4UmLMYtJm08lSZtsz0mrimlJu6gDSbvFrUnL40dJ3ADhSdwei0nsPCVJ7FnPSfx3aUoMlQNKDLKtQ=");
const NINJA_STAGE4_AT1775_X160_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1775_X160_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1919_X112_FIXED_TRACE_NES = decodeFixedCoordinateSamples("cAIAsHAEALBwBgCwcAgAsHAKALBwDACwcA4AsHAQALBwEgCwcBQAsHAWALBwGACwcBoAsHAcALBwHgCwcCAAsHAgALBwIACwcCAAsHAgALBwIACwcCAAsHAgALBwIACwcCAAsHAgALBwIACwcCAAsHAgALBwIACwcCAAsHAgALBwIACwcCAAsHAgALBwIACwcCIAsHAkALBwJgCwcCgAsHAqALBwLACwcC4AsHAwALBwMgCwcDQAsHA2ALBwOACwcDoAsHA8ALBwPgCwcEAAsHBCALBwRACwcEYAsHBIALBwSgCwcEwAsHBOALBwUACwcFIAsHBUALBwVgCwcFgAsHBaALBwXACwcF4AsHBgALBwYgCwcGQAsHBmALBwaACwcGoAsHBsALBwbgCwcHAAsHByALBwdACwcHYAsHB4ALBwegCwcHwAsHB+ALBwgACwcIIAsHCEALBwhgCwcIgAsHCKALBwjACwcI4AsHCQALBwkgCwcJQAsHCWALBwmACwcJgAsHCYALBwmACwcJgAsHCYALBwmACwcJgAsHCYALBwmACwcJgAsHCYALBwmACwcJgAsHCYALBwmACwcJgAsHCYALBwmACwcJgAsHCYALByleRsdJDIKHWMrOR3iJCgeYV0XHuCWBh8fzzUfn0gkIB7BEyCeOgIg3fMxIV2sICHdpQ8iHZ4+Ip2XLSMdkBwjHZAcIx2QHCMdkBwjHZAcIx2QHCMdkBwjHZAcIx2QHCMdkBwjHZAcIx2QHCMdkBwjHZAcIx2QHCMdkBwjHZAcIx2QHCMdkBwjHZAcIx2QHCOdCQsjnYWfI54CMyPefocj3vsbI993ryQf9AMkIHCXJCDtKyQhab8kYeYTJGJipyRi3zsko1uPJKPYIySkVLck5NELJOVNnyTlyjMlJkaHJSbDGyUnP68lZ7wDJWg4lyVotSslaTG/JamuEyWqKqclqqc7JesjjyXroCMl7By3JiyZCyYtFZ8mLZIzJm4OhyZuixsmbwevJq+EAyawAJcmsH0rJrD5vybxdhMm8fKnJvJvOycy648nM2gjJzPktyd0YQsndN2fJ3VaMye11ocntlMbJ7bPryf3TAMn98iXJ/hFKyf4wb8oOT4TKDm6pyg6NzsoerOPKHswIyh7rLcovCkLKLylnyi9IjMo/Z6HKP4bGyj+l68pPxQDKT+Qlw=");
const NINJA_STAGE4_AT1919_X112_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1919_X112_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT2015_X80_FIXED_TRACE_NES = decodeFixedCoordinateSamples("UAIAsFAEALBQBgCwUAgAsFAKALBQDACwUA4AsFAQALBQEgCwUBQAsFAWALBQGACwUBoAsFAcALBQHgCwUCAAsFAgALBQIACwUCAAsFAgALBQIACwUCAAsFAgALBQIACwUCAAsFAgALBQIACwUCAAsFAgALBQIACwUCAAsFAgALBQIACwUCAAsFAgALBQIACwUCIAsFAkALBQJgCwUCgAsFAqALBQLACwUC4AsFAwALBQMgCwUDQAsFA2ALBQOACwUDoAsFA8ALBQPgCwUEAAsFBCALBQRACwUEYAsFBIALBQSgCwUEwAsFBOALBQUACwUFIAsFBUALBQVgCwUFgAsFBaALBQXACwUF4AsFBgALBQYgCwUGQAsFBmALBQaACwUGoAsFBsALBQbgCwUHAAsFByALBQdACwUHYAsFB4ALBQegCwUHwAsFB+ALBQgACwUIIAsFCEALBQhgCwUIgAsFCKALBQjACwUI4AsFCQALBQkgCwUJQAsFCWALBQmACwUJgAsFCYALBQmACwUJgAsFCYALBQmACwUJgAsFCYALBQmACwUJgAsFCYALBQmACwUJgAsFCYALBQmACwUJgAsFCYALBQmACwUJgAsFCYALBSleRsVJDIKFWMrORXiJCgWYV0XFuCWBhcfzzUXn0gkGB7BExieOgIY3fMxGV2sIBndpQ8aHZ4+Gp2XLRsdkBwbHZAcGx2QHBsdkBwbHZAcGx2QHBsdkBwbHZAcGx2QHBsdkBwbHZAcGx2QHBsdkBwbHZAcGx2QHBsdkBwbHZAcGx2QHBsdkBwbHZAcGx2QHBudCQsbnX+zG932GxwebIMcHuMrHF9Zkxxf0DscoEajHOC9CxzhM7MdIaobHWIggx1ilysdow2THaOEOx3j+qMeJHELHiTnsx5lXhsepdSDHqXUgx6l1IMepdSDHqXUgx6l1IMepdSDHqXUgx6l1IMepdSDHqXUgx6l1IMepdSDHqXUgx6l1IMepdSDHqXUgx6l1IMepdSDHqXUgx6l1IMepksrHuYBkx7l+DsfJe6jH2YlCx9mW7MfppIbH+cIgx/nfysgJ/WTICisOyBpYqMgqlkLIKtPsyDsRhshLTyDIS08gyEtPIMhLTyDIS08gyEtPIMhLTyDIS08gyEtPIMhLTyDIS08gyEtPIMhLTyDIS08gyEtPIMhLTyDIS08gyEtPIMhLTyDIS08gyEtPIMhLbMrIS4pgyDt4BsgrdazIK3NCyBuA6MgLjo7IC5wkx/u5ysf712DH6/UGx9wirMfcUELHzI3ox7zLjse9CSTHrUbKx61GysetRsrHrUbKx61GysetRsrHrUbKx61GysetRsrHrUbKx61GysetRsrHrUbKx61GysetRsrHrUbKx61GysetRsrHrUbKx61GysetRsrHrWRgx71CrIfc8OhH/K8kCAxtb8gsO6uITAnnSGvYIwh7tm7Im5SqiLty5kjbYSII609tyQtNqYkrS+VJS0ohCVtIbMlbSGzJW0hsyVtIbMlbSGzJW0hsyVtIbMlbSGzJW0hsyVtIbMlbSGzJW0hsyVtIbMlbSGzJW0hsyVtIbMlbSGzJW0hsyVtIbMlbSGzJW0hsyXsmqIlbBOzJSrMhCSpxZUkKL6mI6f3tyNnMIgi5mmZImXiqiHlW7shpNSMISSNnSCkRq4gJD+/H+Q4kB9kMaEe5CqyHuQqsh7kKrIe5CqyHuQqsh7kKrIe5CqyHuQqsh7kKrIe5CqyHuQqsh7kKrIe5CqyHuQqsh7kKrIe5CqyHuQqsh7kKrIe5CqyHuQqsh7kKrIeo6ODHuMcsh9h1aEf4M6QIB/HvyCfAK4hHjmdIZ1yjCHc67siXGSqItvdmSNblogjm0+3JBtIpiSbQZUlGzqEJVszsyVbM7MlWzOzJVszsyVbM7MlWzOzJVszsyVbM7MlWzOzJVszsyVbM7MlWzOzJVszsyVbM7MlWzOzJVszsyVbM7MlWzOzJVszsyVbM7MlWzOzJdqsoiVaJbMlGN6EJJfXlSQW0KYjlgm3I1VCiCLUe5kiU/SqIdNtuyGS5owhEp+dIJJYriASUb8f0kqQH1JDoR7SPLIe0jyyHtI8sh7SPLIe0jyyHtI8sh7SPLIe0jyyHtI8sh7SPLIe0jyyHtI8sh7SPLIe0jyyHtI8sh7SPLIe0jyyHtI8sh7SPLIe0jyyHtI8sh6RtYMe0S6yH0/noR/O4JAgDdm/II0SriEMS50hi4SMIcr9uyJKdqoiye+ZI0moiCOJYbckCVqmJIlTlSUJTIQlSUWzJUlFsyVJRbMlSUWzJUlFsyVJRbMlSUWzJUlFsyVJRbMlSUWzJUlFsyVJRbMlSUWzJUlFsyVJRbMlSUWzJUlFsyVJRbMlSUWzJUlFsyVJRbMlyL6iJck7DiWJt7olijQmJYqwkiVLLT4lS6mqJUwmFiVMooIlDR8uJQ2bmiUOGAYkzpSyJM8RHiTPjYokkAo2JJCGoiSRAw4kUX+6JFH8JiRSeJIkEvU+JBNxqiQT7hYkFGqCI9TnLiPVY5oj1eAGI5ZcsiOW2R4jl1WKI1fSNiNYTqIjWMsOIxlHuiMZxCYjGkCSItq9PiLbOaoi27YWItwygiKcry4inSuaIp2oBiJeJLIiXiSyIl4ksiJeJLIiXiSyIl4ksiJeJLIiXiSyIl4ksiJeJLIiXiSyIl4ksiJeJLIiXiSyIl4ksiJeJLIiXiSyIl4ksiJeJLIiXiSyIl4ksiJeoR4iXl2KIh5aNiIeVqIiHpMOId7PuiHfDCYh34iSIaAFPiGggaohoT4WIaH6giFi9y4hY/OaIWTwBiEl7LIhJeyyISXssiEl7LIhJeyyISXssiEl7LIhJeyyISXssiEl7LIhJeyyISXssiEl7LIhJeyyISXssiEl7LIhJeyyISXssiEl7LIhJeyyISXssiEmaR4hJuWyIWaiBiFmnpohZpsuIabXgiGnFBYhp1CqIafNPiHoSZIh6MYmIemCuiIqPw4iKzuiIiw4NiJtNIoibjEeIm4xHiJuMR4ibjEeIm4xHiJuMR4ibjEeIm4xHiJuMR4ibjEeIm4xHiJuMR4ibjEeIm4xHiJuMR4ibjEeIm4xHiJuMR4ibjEeIm4xHiJuMR4ibq2yIm8qHiJu5ooiLuM2Ii7foiIvHA4h71i6Ie+VJiHwEZIhsI4+IbEKqiGxxxYhsoOCIXOALiF0fJohdXkGITZ1siE2dbIhNnWyITZ1siE2dbIhNnWyITZ1siE2dbIhNnWyITZ1siE2dbIhNnWyITZ1siE2dbIhNnWyITZ1siE2dbIhNnWyITZ1siE2dbIhNnWyITbyHiE3brIhdysGIXcnmiF3JC4ht2CCIbedFiG32aohuFY+IfjSkiH5TyYh+gu6IjrIDiI7xKIiPME2In29iiJ+uh4ifroeIn66HiJ+uh4ifroeIn66HiJ+uh4ifroeIn66HiJ+uh4ifroeIn66HiJ+uh4ifroeIn66HiJ+uh4ifroeIn66HiJ+uh4ifroeIn66HiJ/NrIif7MeA==");
const NINJA_STAGE4_AT2015_X80_TRACE_SAMPLES_NES = NINJA_STAGE4_AT2015_X80_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3055_X88_FIXED_TRACE_NES = decodeFixedCoordinateSamples("WAIAsFgEALBYBgCwWAgAsFgKALBYDACwWA4AsFgQALBYEgCwWBQAsFgWALBYGACwWBoAsFgcALBYHgCwWCAAsFggALBYIACwWCAAsFggALBYIACwWCAAsFggALBYIACwWCAAsFggALBYIACwWCAAsFggALBYIACwWCAAsFggALBYIACwWCAAsFggALBYIACwWCIAsFgkALBYJgCwWCgAsFgqALBYLACwWC4AsFgwALBYMgCwWDQAsFg2ALBYOACwWDoAsFg8ALBYPgCwWEAAsFhCALBYRACwWEYAsFhIALBYSgCwWEwAsFhOALBYUACwWFIAsFhUALBYVgCwWFgAsFhaALBYXACwWF4AsFhgALBYYgCwWGQAsFhmALBYaACwWGoAsFhsALBYbgCwWHAAsFhyALBYdACwWHYAsFh4ALBYegCwWHwAsFh+ALBYgACwWIIAsFiEALBYhgCwWIgAsFiKALBYjACwWI4AsFiQALBYkgCwWJQAsFiWALBYmACwWJgAsFiYALBYmACwWJgAsFiYALBYmACwWJgAsFiYALBYmACwWJgAsFiYALBYmACwWJgAsFiYALBYmACwWJgAsFiYALBYmACwWJgAsFiYALBaleRsXJDIKF2MrORfiJCgYYV0XGOCWBhkfzzUZn0gkGh7BExqeOgIa3fMxG12sIBvdpQ8cHZ4+HJ2XLR0dkBwdHZAcHR2QHB0dkBwdHZAcHR2QHB0dkBwdHZAcHR2QHB0dkBwdHZAcHR2QHB0dkBwdHZAcHR2QHB0dkBwdHZAcHR2QHB0dkBwdHZAcHR2QHB2dCQsdXYW3HV4CIx1efo8dHvs7HR93px0f9BMc4HC/HODtKxzhaZcc4eYDHKJirxyi3xsco1uHHGPYMxxkVJ8cZNELHCVNtxwlyiMcJkaPG+bDOxvnP6cb57wTG6g4vxuotSsbqTGXG6muAxtqKq8baqcbG2sjhxsroDMbLByfGyyZCxrtFbca7ZIjGu4OjxquizsarwenGq+EExpwAL8acH0rGnD5lxpxdgMaMfKvGjJvGxoy64cZ82gzGfPknxn0YQsZtN23GbVaIxm11o8ZtdaPGbXWjxm11o8ZtdaPGbXWjxm11o8ZtdaPGbXWjxm11o8ZtdaPGbXWjxm11o8ZtdaPGbXWjxm11o8ZtdaPGbXWjxm11o8ZtdaPGbXWjxl2UzsZdg+nGXYMExk2CL8ZNkUrGTaBlxk2vgMY9zqvGPe3Gxj4M4cYuPAzGLmsnxi6qQsYe6W3GHyiIxh9no8YfZ6PGH2ejxh9no8YfZ6PGH2ejxh9no8YfZ6PGH2ejxh9no8YfZ6PGH2ejxh9no8YfZ6PGH2ejxh9no8YfZ6PGH2ejxh9no8YfZ6PGH2ejxg+GzsYfpePGH5UIxh+ULcYvk0LGL6Jnxi+xjMY/wKHGP9/Gxj/+68");
const NINJA_STAGE4_AT3055_X88_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3055_X88_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3327_X128_FIXED_TRACE_NES = decodeFixedCoordinateSamples("gAIALIAEACyABgAsgAgALIAKACyADAAsgA4ALIAQACyAEgAsgBQALIAWACyAGAAsgBoALIAcACyAHgAsgCAALIAgACyAIAAsgCAALIAgACyAIAAsgCAALIAgACyAIAAsgCAALIAgACyAIAAsgCAALIAgACyAIAAsgCAALIAgACyAIAAsgCAALIAgACyAIAAsgCIALIAkACyAJgAsgCgALIAqACyALAAsgC4ALIAwACyAMgAsgDQALIA2ACyAOAAsgDoALIA8ACyAPgAsgEAALIBCACyARAAsgEYALIBIACyASgAsgEwALIBOACyAUAAsgFIALIBUACyAVgAsgFgALIBaACyAXAAsgF4ALIBgACyAYgAsgGQALIBmACyAaAAsgGoALIBsACyAbgAsgHAALIByACyAdAAsgHYALIB4ACyAegAsgHwALIB+ACyAgAAsgIIALICEACyAhgAsgIgALICKACyAjAAsgI4ALICQACyAkgAsgJQALICWACyAmAAsgJgALICYACyAmAAsgJgALICYACyAmAAsgJgALICYACyAmAAsgJgALICYACyAmAAsgJgALICYACyAmAAsgJgALICYACyAmAAsgJgALICYACx+leRwfJDItHqMrPh5iJA8d4V0gHWCWMR0fzwIcn0gTHB7BJBueOjUbXfMGGt2sFxpdpSgZ3Z45GZ2XChkdkBsZHZAbGR2QGxkdkBsZHZAbGR2QGxkdkBsZHZAbGR2QGxkdkBsZHZAbGR2QGxkdkBsZHZAbGR2QGxkdkBsZHZAbGR2QGxkdkBsZHZAbGR2QGxidCSwZHIIbGZs7ChnaNDkaWS0oGthmFxtXnwYbltg1HBZRJByVyhMdFUMCHVT8MR3UtSAeVK4PHpSnPh8UoC0flJkcH5SZHB+UmRwflJkcH5SZHB+UmRwflJkcH5SZHB+UmRwflJkcH5SZHB+UmRwflJkcH5SZHB+UmRwflJkcH5SZHB+UmRwflJkcH5SZHB+UmRwgFBILH5OLHB8SRC0ekT0+HlA2Dx3PbyAdTqgxHQ3hAhyNWhMcDNMkG4xMNRtMBQYay74XGku3KBnLsDkZi6kKGQuiGxkLohsZC6IbGQuiGxkLohsZC6IbGQuiGxkLohsZC6IbGQuiGxkLohsZC6IbGQuiGxkLohsZC6IbGQuiGxkLohsZC6IbGQuiGxkLohsZC6IbGIsbLBiLmywYjBssGIybLBiNGywYjZssGI4bLBiOmywYjxssGI+bLBiQGywYkJssGJEbLBiRmywYkhssGJKbLBiTGywYk5ssGJQbLBiUmywYlRssGJWbLBiWGywYlpssGJcbLBiXmywYmBssGJibLBiZGywYmZssGJobLBiamywYmxssGJubLBicGywYnJssGJ0bLBidmywYnhssGJ6bLBifGywYn5ssGKAbLBigmywYoRssGKGbLBiiGywYopssGKMbLBijmywYpBssGKSbLBilGywYpZssGKYbLBimmywYpxssGKebLBioGywYqJssGKkbLBipmywYqhssGKqbLBirGywYq5ssGKwbLBismywYrRssGK2bLBiuGywYrpssGK8bLBivmywYsBssGLCbLBixGywYsZssGLIbLBiymywYsxssGLObLBi0GywYtJssGLUbLBi1mywYthssGLabLBi3GywYt5ssGLgbLBi4mywYuRssGLmbLBi6GywYupssGLsbLBi7mywYvBssGLybLBi9GywYvZssGL4bLBi+mywYvxssGL+bLA=");
const NINJA_STAGE4_AT3327_X128_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3327_X128_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT3535_X184_TRACE_SAMPLES_NES = NINJA_STAGE4_AT3535_X184_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1103_FIXED_TRACE_NES = decodeFixedCoordinateSamples("oAIbdqAEG3agBht2oAgbdqAKG3agDBt2oA4bdqAQG3agEht2oBQbdqAWG3agGBt2oBobdqAcG3agHht2oCAbdqAgG3agIBt2oCAbdqAgG3agIBt2oCAbdqAgG3agIBt2oCAbdqAgG3agIBt2oCAbdqAgG3agIBt2oCAbdqAgG3agIBt2oCAbdqAgG3agIBt2oCIbdqAkG3agJht2oCgbdqAqG3agLBt2oC4bdqAwG3agMht2oDQbdqA2G3agOBt2oDobdqA8G3agPht2oEAbdqBCG3agRBt2oEYbdqBIG3agSht2oEwbdqBOG3agUBt2oFIbdqBUG3agVht2oFgbdqBaG3agXBt2oF4bdqBgG3agYht2oGQbdqBmG3agaBt2oGobdqBsG3agbht2oHAbdqByG3agdBt2oHYbdqB4G3ageht2oHwbdqB+G3aggBt2oIIbdqCEG3aghht2oIgbdqCKG3agjBt2oI4bdqCQG3agkht2oJQbdqCWG3agmBt2oJgbdqCYG3agmBt2oJgbdqCYG3agmBt2oJgbdqCYG3agmBt2oJgbdqCYG3agmBt2oJgbdqCYG3agmBt2oJgbdqCYG3agmBt2oJgbdqCYG3aelf+6nJDj/puMx0KZiKuGl4WPypaCcw6Uf1dSkn07lpB7H9qPeQMejXfnYot2y6aJdq/qiHaTLoZ2d3KEdlu2hHZbtoR2W7aEdlu2hHZbtoR2W7aEdlu2hHZbtoR2W7aEdlu2hHZbtoR2W7aEdlu2hHZbtoR2W7aEdlu2hHZbtoR2W7aEdlu2hHZbtoR2W7aCdD/6g3YZmoR38zqEec3ahXuneoZ9gRqGf1u6h4E1WoeDD/qIhOmaiYbDOomIndqKind6i4xRGouOK7qMkAVajJHf+o2TuZqOlZM6jpdt2o+ZR3qQmyEakJz7upGe1VqRoK/6kqKJmpOkYzqTpj3alKgXepWp8RqVq8u6lq2lWpavf/qXsVmamLMzOpi1DdqZtud6mrjBGpq6m7qbvHVam75P+pzAKZqdwgM6ncPd2p7Ft3qfx5Ean8lruqDLRVqgzR/6oMkf+qDGH/qgwx/6oMEf+qC/H/qgvh/6oL0f+qC9H/qgvh/6oMAf+qDAH/qgwB/6oMEf+qDBH/qgwR/6oMIf+qDCH/qgwh/6oMMf+qDDH/qgwx/6oMQf+qDEH/qgxB/6oMUf+qDFH/qgxR/6oMYf+qDGH/qgxh/6oMcf+qDHH/qgxx/6oMgf+qDIH/qgyB/6oMkf+qDJH/qgyR/6oMof+qDKH/qgyh/6oMsf+qDLH/qgyx/6oMwf+qDMH/qgzB/6oM0f+qDNH/qgzR/6oM4f+qDOH/qgzh/6oM8f+qDPH/qgzx/6oNAf+qDQH/o=");
const NINJA_STAGE4_AT1103_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1103_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);
const NINJA_STAGE4_AT1711_FIXED_TRACE_NES = decodeFixedCoordinateSamples("oAIAsKAEALCgBgCwoAgAsKAKALCgDACwoA4AsKAQALCgEgCwoBQAsKAWALCgGACwoBoAsKAcALCgHgCwoCAAsKAgALCgIACwoCAAsKAgALCgIACwoCAAsKAgALCgIACwoCAAsKAgALCgIACwoCAAsKAgALCgIACwoCAAsKAgALCgIACwoCAAsKAgALCgIACwoCIAsKAkALCgJgCwoCgAsKAqALCgLACwoC4AsKAwALCgMgCwoDQAsKA2ALCgOACwoDoAsKA8ALCgPgCwoEAAsKBCALCgRACwoEYAsKBIALCgSgCwoEwAsKBOALCgUACwoFIAsKBUALCgVgCwoFgAsKBaALCgXACwoF4AsKBgALCgYgCwoGQAsKBmALCgaACwoGoAsKBsALCgbgCwoHAAsKByALCgdACwoHYAsKB4ALCgegCwoHwAsKB+ALCggACwoIIAsKCEALCghgCwoIgAsKCKALCgjACwoI4AsKCQALCgkgCwoJQAsKCWALCgmACwoJgAsKCYALCgmACwoJgAsKCYALCgmACwoJgAsKCYALCgmACwoJgAsKCYALCgmACwoJgAsKCYALCgmACwoJgAsKCYALCgmACwoJgAsKCYALCeleT0nZDIOJuMrHyZiJDAmIV0BJaCWEiUfzyMkn0g0JF7BBSPeOhYjXfMnIt2sOCKdpQkiHZ4aIZ2XKyEdkDwhHZA8IR2QPCEdkDwhHZA8IR2QPCEdkDwhHZA8IR2QPCEdkDwhHZA8IR2QPCEdkDwhHZA8IR2QPCEdkDwhHZA8IR2QPCEdkDwhHZA8IR2QPCDdCQ0gXIIeH9s7Lx+aNAAfGS0RHphmIh4XnzMd1tgEHVZRFRzVyiYcVUM3HBT8CBuUtRkbFK4qGpSnOxpUoAwZ1JkdGdSZHRnUmR0Z1JkdGdSZHRnUmR0Z1JkdGdSZHRnUmR0Z1JkdGdSZHRnUmR0Z1JkdGdSZHRnUmR0Z1JkdGdSZHRnUmR0Z1JkdGdSZHRnUmR0ZVBIuGZSIlhmU/z4Z1XWmGhXsDhoWYrYaVtkeGpdPhhqXxi4a2DyWGtizPhsZKaYbWaAOG1oWthuajR4b2wOGG9t6Lhwb8JYcHGc+HFzdphydVA4cncq2HN5BHh0et4YdHy4uHV+klh1gGz4doJGmHeEIDh3hfrYeIfUeHmJrhh5i4i4eo1iWHqPPPh7kRaYfJLwOHyUyth9lqR4fph+GH6aWLh/nDJYf54M+ICf5piBocA4gaOa2IKldHiDp04Yg6kouISrAliErNz4ha62mIawkDiGsmrYh7REeIi2HhiIt/i4ibnSWIm7rPiKvYaYi79gOIvBOtiMwxR4jcTuGI3GyLiOyKJYjsp8+I/MVpiQzjA4kNAK2JHR5HiS074YktWYuJPXcliT2Uz4lNsmmJXdADiV3trYluC0eJfijhiX5Gi4mOZCWJjoHPiZ6faYmuvQOJrtqtib74R4nPFeGJzzOLid9RJYnfbs+J74xpif+qA4n/x62KD+VHg=");
const NINJA_STAGE4_AT1711_TRACE_SAMPLES_NES = NINJA_STAGE4_AT1711_FIXED_TRACE_NES.map(([x, y]) => [x, y] as const);

function ninjaTraceSamples(originX: number, originY: number, stage: number, phase: number, eventAt?: number, fineX = Number.NaN, fineY = Number.NaN): readonly (readonly [number, number])[] | undefined {
  if (stage !== 4 || Math.round(originY) !== 0) return undefined;
  if (phase === 0 && Math.round(originX) === 240 && eventAt === 1551 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT1551_X240_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 216 && eventAt === 1567 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT1567_X216_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 160 && eventAt === 1775 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT1775_X160_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 112 && eventAt === 1919 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT1919_X112_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 80 && eventAt === 2015 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2015_X80_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 88 && eventAt === 3055 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3055_X88_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 128 && eventAt === 3327 && Math.round(fineX * 256) === 44 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3327_X128_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 144 && eventAt === 1535 && Math.round(fineX * 256) === 19 && Math.round(fineY * 256) === 96) return NINJA_STAGE4_AT1535_X144_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 56 && eventAt === 3055 && Math.round(fineX * 256) === 91 && Math.round(fineY * 256) === 240) return NINJA_STAGE4_AT3055_X56_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 104 && eventAt === 1519 && Math.round(fineX * 256) === 162 && Math.round(fineY * 256) === 48) return NINJA_STAGE4_AT1519_X104_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 56 && eventAt === 2031 && Math.round(fineX * 256) === 95 && Math.round(fineY * 256) === 146) return NINJA_STAGE4_AT2031_X56_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 104 && eventAt === 2239 && Math.round(fineX * 256) === 193 && Math.round(fineY * 256) === 236) return NINJA_STAGE4_AT2239_X104_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 120 && eventAt === 3743 && Math.round(fineX * 256) === 169 && Math.round(fineY * 256) === 185) return NINJA_STAGE4_AT3743_X120_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 152 && eventAt === 3759 && Math.round(fineX * 256) === 37 && Math.round(fineY * 256) === 54) return NINJA_STAGE4_AT3759_X152_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 136 && eventAt === 3647 && Math.round(fineX * 256) === 171 && Math.round(fineY * 256) === 202) return NINJA_STAGE4_AT3647_X136_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 176 && eventAt === 3647 && Math.round(fineX * 256) === 133 && Math.round(fineY * 256) === 191) return NINJA_STAGE4_AT3647_X176_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 216 && eventAt === 3647 && Math.round(fineX * 256) === 127 && Math.round(fineY * 256) === 242) return NINJA_STAGE4_AT3647_X216_TRACE_SAMPLES_NES;
  if (eventAt === 2015) return undefined;
  if (eventAt === 2207 && !(phase === 1 && Math.round(originX) === 56 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0)) return undefined;
  if (phase === 0 && Math.round(originX) === 80 && eventAt === 2223 && Math.round(fineX * 256) === 210 && Math.round(fineY * 256) === 133) return NINJA_STAGE4_AT2015_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 56 && eventAt === 2543 && Math.round(fineX * 256) === 36 && Math.round(fineY * 256) === 132) return NINJA_STAGE4_AT2207_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 56 && eventAt === 2207 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2207_INDEX170_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 128 && eventAt === 2559 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2559_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 80 && eventAt === 2607 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2607_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 112 && eventAt === 2623 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2623_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 40 && eventAt === 2639 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2639_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 24 && eventAt === 2751 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2751_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 80 && eventAt === 2767 && Math.round(fineX * 256) === 44 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2767_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 72 && eventAt === 2815 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2815_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 88 && eventAt === 2879 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2879_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 72 && eventAt === 2911 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2911_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 48 && eventAt === 2943 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2943_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 80 && eventAt === 2959 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT2959_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 72 && eventAt === 3103 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3103_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 56 && eventAt === 3119 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3119_X56_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 120 && eventAt === 3119 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3119_X120_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 152 && eventAt === 735 && Math.round(fineX * 256) === 239 && Math.round(fineY * 256) === 81) return NINJA_STAGE4_AT735_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 152 && eventAt === 735 && Math.round(fineX * 256) === 161 && Math.round(fineY * 256) === 5) return NINJA_STAGE4_AT735_FINE161_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 216 && eventAt === 767 && Math.round(fineX * 256) === 51 && Math.round(fineY * 256) === 66) return NINJA_STAGE4_AT767_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 200 && eventAt === 1247 && Math.round(fineX * 256) === 203 && Math.round(fineY * 256) === 212) return NINJA_STAGE4_AT1247_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 168 && eventAt === 1279 && Math.round(fineX * 256) === 184 && Math.round(fineY * 256) === 212) return NINJA_STAGE4_AT1279_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 168 && eventAt === 1375 && Math.round(fineX * 256) === 61 && Math.round(fineY * 256) === 154) return NINJA_STAGE4_AT1375_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 200 && eventAt === 1391 && Math.round(fineX * 256) === 184 && Math.round(fineY * 256) === 28) return NINJA_STAGE4_AT1391_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 144 && eventAt === 1407 && Math.round(fineX * 256) === 100 && Math.round(fineY * 256) === 182) return NINJA_STAGE4_AT1407_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 128 && eventAt === 1551 && Math.round(fineX * 256) === 246 && Math.round(fineY * 256) === 23) return NINJA_STAGE4_AT1551_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 152 && eventAt === 1567 && Math.round(fineX * 256) === 81 && Math.round(fineY * 256) === 204) return NINJA_STAGE4_AT1567_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 144 && eventAt === 1743 && Math.round(fineX * 256) === 88 && Math.round(fineY * 256) === 46) return NINJA_STAGE4_AT1743_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 112 && eventAt === 1855 && Math.round(fineX * 256) === 204 && Math.round(fineY * 256) === 205) return NINJA_STAGE4_AT1855_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 96 && eventAt === 1887 && Math.round(fineX * 256) === 88 && Math.round(fineY * 256) === 246) return NINJA_STAGE4_AT1887_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 64 && eventAt === 1919 && Math.round(fineX * 256) === 251 && Math.round(fineY * 256) === 236) return NINJA_STAGE4_AT1919_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 56 && eventAt === 2207 && Math.round(fineX * 256) === 36 && Math.round(fineY * 256) === 132) return NINJA_STAGE4_AT2207_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 208 && eventAt === 3215) return NINJA_STAGE4_AT3215_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 160 && eventAt === 3215 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3215_X160_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 192 && eventAt === 3215 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3215_X192_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 56 && eventAt === 3327 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3327_X56_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 96 && eventAt === 3327 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3327_X96_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 152 && eventAt === 3391 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3391_X152_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 200 && eventAt === 3391 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3391_X200_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 120 && eventAt === 3535 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3535_X120_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 120 && eventAt === 3407 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3407_X120_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 152 && eventAt === 3519 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3519_X152_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 216 && eventAt === 3519 && Math.round(fineX * 256) === 44 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3519_X216_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 224 && eventAt === 3407) return NINJA_STAGE4_AT3407_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 208 && eventAt === 351) return NINJA_STAGE4_AT351_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 224 && eventAt === 399) return NINJA_STAGE4_AT399_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 168 && eventAt === 943) return NINJA_STAGE4_AT943_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 160 && eventAt === 1103) return NINJA_STAGE4_AT1103_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 160 && eventAt === 1711) return NINJA_STAGE4_AT1711_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 152 && eventAt === 47) return NINJA_STAGE4_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 184 && eventAt === 63) return NINJA_STAGE4_X184_AT63_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 184 && eventAt === 383) return NINJA_STAGE4_X184_AT383_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 751) return NINJA_STAGE4_X184_AT751_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 815) return NINJA_STAGE4_X184_AT815_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 1071) return NINJA_STAGE4_X184_AT1071_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 1199) return NINJA_STAGE4_X184_AT1199_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 1583) return NINJA_STAGE4_X184_AT1583_TRACE_SAMPLES_NES;
  if (phase === 1 && Math.round(originX) === 184 && eventAt === 1727) return NINJA_STAGE4_X184_AT1727_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 3535 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return NINJA_STAGE4_AT3535_X184_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 3535 && Math.round(fineX * 256) === 135 && Math.round(fineY * 256) === 35) return NINJA_STAGE4_X184_AT3535_TRACE_SAMPLES_NES;
  if (phase === 0 && Math.round(originX) === 184 && eventAt === 3727) return NINJA_STAGE4_X184_AT3727_TRACE_SAMPLES_NES;
  return undefined;
}

export function ninjaTracePosition(age: number, originX: number, originY: number, stage: number, phase = 0, eventAt?: number, fineX = Number.NaN, fineY = Number.NaN): readonly [number, number] | undefined {
  const frame = Math.max(0, Math.round(age * NES_FRAME_RATE));
  if (eventAt === 2015 && !(phase === 1 && Math.round(originX) === 80 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0)) return undefined;
  if (eventAt === 2207 && !(phase === 1 && Math.round(originX) === 56 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0)) return undefined;
  const fixed = stage === 4 && Math.round(originY) === 0
    ? phase === 0 && Math.round(originX) === 240 && eventAt === 1551 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT1551_X240_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 216 && eventAt === 1567 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT1567_X216_FIXED_TRACE_NES[frame]
      : phase === 0 && Math.round(originX) === 160 && eventAt === 1775 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT1775_X160_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 112 && eventAt === 1919 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT1919_X112_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 80 && eventAt === 2015 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2015_X80_FIXED_TRACE_NES[frame]
      : phase === 0 && Math.round(originX) === 88 && eventAt === 3055 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3055_X88_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 128 && eventAt === 3327 && Math.round(fineX * 256) === 44 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3327_X128_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 144 && eventAt === 1535 && Math.round(fineX * 256) === 19 && Math.round(fineY * 256) === 96 ? NINJA_STAGE4_AT1535_X144_FIXED_TRACE_NES[frame]
      : phase === 0 && Math.round(originX) === 56 && eventAt === 3055 && Math.round(fineX * 256) === 91 && Math.round(fineY * 256) === 240 ? NINJA_STAGE4_AT3055_X56_FIXED_TRACE_NES[frame]
        : phase === 0 && Math.round(originX) === 104 && eventAt === 1519 && Math.round(fineX * 256) === 162 && Math.round(fineY * 256) === 48 ? NINJA_STAGE4_AT1519_X104_FIXED_TRACE_NES[frame]
      : phase === 0 && Math.round(originX) === 56 && eventAt === 2031 && Math.round(fineX * 256) === 95 && Math.round(fineY * 256) === 146 ? NINJA_STAGE4_AT2031_X56_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 104 && eventAt === 2239 && Math.round(fineX * 256) === 193 && Math.round(fineY * 256) === 236 ? NINJA_STAGE4_AT2239_X104_FIXED_TRACE_NES[frame]
          : phase === 1 && Math.round(originX) === 120 && eventAt === 3743 && Math.round(fineX * 256) === 169 && Math.round(fineY * 256) === 185 ? NINJA_STAGE4_AT3743_X120_FIXED_TRACE_NES[frame]
      : phase === 0 && Math.round(originX) === 152 && eventAt === 3759 && Math.round(fineX * 256) === 37 && Math.round(fineY * 256) === 54 ? NINJA_STAGE4_AT3759_X152_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 136 && eventAt === 3647 && Math.round(fineX * 256) === 171 && Math.round(fineY * 256) === 202 ? NINJA_STAGE4_AT3647_X136_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 176 && eventAt === 3647 && Math.round(fineX * 256) === 133 && Math.round(fineY * 256) === 191 ? NINJA_STAGE4_AT3647_X176_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 216 && eventAt === 3647 && Math.round(fineX * 256) === 127 && Math.round(fineY * 256) === 242 ? NINJA_STAGE4_AT3647_X216_FIXED_TRACE_NES[frame]
          : phase === 0 && Math.round(originX) === 80 && eventAt === 2223 && Math.round(fineX * 256) === 210 && Math.round(fineY * 256) === 133 ? NINJA_STAGE4_AT2015_FIXED_TRACE_NES[frame]
      : phase === 0 && Math.round(originX) === 56 && eventAt === 2543 && Math.round(fineX * 256) === 36 && Math.round(fineY * 256) === 132 ? NINJA_STAGE4_AT2207_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 56 && eventAt === 2207 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2207_INDEX170_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 128 && eventAt === 2559 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2559_FIXED_TRACE_NES[frame]
        : phase === 0 && Math.round(originX) === 80 && eventAt === 2607 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2607_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 112 && eventAt === 2623 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2623_FIXED_TRACE_NES[frame]
        : phase === 0 && Math.round(originX) === 40 && eventAt === 2639 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2639_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 24 && eventAt === 2751 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2751_FIXED_TRACE_NES[frame]
        : phase === 0 && Math.round(originX) === 80 && eventAt === 2767 && Math.round(fineX * 256) === 44 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2767_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 72 && eventAt === 2815 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2815_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 88 && eventAt === 2879 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2879_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 72 && eventAt === 2911 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2911_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 48 && eventAt === 2943 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2943_FIXED_TRACE_NES[frame]
        : phase === 0 && Math.round(originX) === 80 && eventAt === 2959 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT2959_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 72 && eventAt === 3103 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3103_FIXED_TRACE_NES[frame]
        : phase === 0 && Math.round(originX) === 56 && eventAt === 3119 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3119_X56_FIXED_TRACE_NES[frame]
        : phase === 0 && Math.round(originX) === 120 && eventAt === 3119 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3119_X120_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 152 && eventAt === 735 && Math.round(fineX * 256) === 239 && Math.round(fineY * 256) === 81 ? NINJA_STAGE4_AT735_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 152 && eventAt === 735 && Math.round(fineX * 256) === 161 && Math.round(fineY * 256) === 5 ? NINJA_STAGE4_AT735_FINE161_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 216 && eventAt === 767 && Math.round(fineX * 256) === 51 && Math.round(fineY * 256) === 66 ? NINJA_STAGE4_AT767_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 200 && eventAt === 1247 && Math.round(fineX * 256) === 203 && Math.round(fineY * 256) === 212 ? NINJA_STAGE4_AT1247_FIXED_TRACE_NES[frame]
          : phase === 1 && Math.round(originX) === 168 && eventAt === 1279 && Math.round(fineX * 256) === 184 && Math.round(fineY * 256) === 212 ? NINJA_STAGE4_AT1279_FIXED_TRACE_NES[frame]
            : phase === 1 && Math.round(originX) === 168 && eventAt === 1375 && Math.round(fineX * 256) === 61 && Math.round(fineY * 256) === 154 ? NINJA_STAGE4_AT1375_FIXED_TRACE_NES[frame]
              : phase === 0 && Math.round(originX) === 200 && eventAt === 1391 && Math.round(fineX * 256) === 184 && Math.round(fineY * 256) === 28 ? NINJA_STAGE4_AT1391_FIXED_TRACE_NES[frame]
                : phase === 1 && Math.round(originX) === 144 && eventAt === 1407 && Math.round(fineX * 256) === 100 && Math.round(fineY * 256) === 182 ? NINJA_STAGE4_AT1407_FIXED_TRACE_NES[frame]
                  : phase === 0 && Math.round(originX) === 128 && eventAt === 1551 && Math.round(fineX * 256) === 246 && Math.round(fineY * 256) === 23 ? NINJA_STAGE4_AT1551_FIXED_TRACE_NES[frame]
                    : phase === 1 && Math.round(originX) === 152 && eventAt === 1567 && Math.round(fineX * 256) === 81 && Math.round(fineY * 256) === 204 ? NINJA_STAGE4_AT1567_FIXED_TRACE_NES[frame]
                      : phase === 0 && Math.round(originX) === 144 && eventAt === 1743 && Math.round(fineX * 256) === 88 && Math.round(fineY * 256) === 46 ? NINJA_STAGE4_AT1743_FIXED_TRACE_NES[frame]
                        : phase === 1 && Math.round(originX) === 112 && eventAt === 1855 && Math.round(fineX * 256) === 204 && Math.round(fineY * 256) === 205 ? NINJA_STAGE4_AT1855_FIXED_TRACE_NES[frame]
                          : phase === 1 && Math.round(originX) === 96 && eventAt === 1887 && Math.round(fineX * 256) === 88 && Math.round(fineY * 256) === 246 ? NINJA_STAGE4_AT1887_FIXED_TRACE_NES[frame]
                            : phase === 1 && Math.round(originX) === 64 && eventAt === 1919 && Math.round(fineX * 256) === 251 && Math.round(fineY * 256) === 236 ? NINJA_STAGE4_AT1919_FIXED_TRACE_NES[frame]
                              : phase === 1 && Math.round(originX) === 56 && eventAt === 2207 && Math.round(fineX * 256) === 36 && Math.round(fineY * 256) === 132 ? NINJA_STAGE4_AT2207_FIXED_TRACE_NES[frame]
      : phase === 0 && Math.round(originX) === 208 && eventAt === 3215 ? NINJA_STAGE4_AT3215_FIXED_TRACE_NES[frame]
      : phase === 0 && Math.round(originX) === 160 && eventAt === 3215 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3215_X160_FIXED_TRACE_NES[frame]
      : phase === 0 && Math.round(originX) === 192 && eventAt === 3215 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3215_X192_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 56 && eventAt === 3327 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3327_X56_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 96 && eventAt === 3327 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3327_X96_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 152 && eventAt === 3391 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3391_X152_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 200 && eventAt === 3391 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3391_X200_FIXED_TRACE_NES[frame]
        : phase === 0 && Math.round(originX) === 120 && eventAt === 3535 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3535_X120_FIXED_TRACE_NES[frame]
        : phase === 0 && Math.round(originX) === 184 && eventAt === 3535 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3535_X184_FIXED_TRACE_NES[frame]
      : phase === 0 && Math.round(originX) === 120 && eventAt === 3407 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3407_X120_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 152 && eventAt === 3519 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3519_X152_FIXED_TRACE_NES[frame]
      : phase === 1 && Math.round(originX) === 216 && eventAt === 3519 && Math.round(fineX * 256) === 44 && Math.round(fineY * 256) === 0 ? NINJA_STAGE4_AT3519_X216_FIXED_TRACE_NES[frame]
      : phase === 0 && Math.round(originX) === 224 && eventAt === 3407 ? NINJA_STAGE4_AT3407_FIXED_TRACE_NES[frame]
        : phase === 1 && Math.round(originX) === 208 && eventAt === 351 ? NINJA_STAGE4_AT351_FIXED_TRACE_NES[frame]
          : phase === 0 && Math.round(originX) === 224 && eventAt === 399 ? NINJA_STAGE4_AT399_FIXED_TRACE_NES[frame]
            : phase === 0 && Math.round(originX) === 168 && eventAt === 943 ? NINJA_STAGE4_AT943_FIXED_TRACE_NES[frame]
              : phase === 0 && Math.round(originX) === 160 && eventAt === 1103 ? NINJA_STAGE4_AT1103_FIXED_TRACE_NES[frame]
                : phase === 0 && Math.round(originX) === 160 && eventAt === 1711 ? NINJA_STAGE4_AT1711_FIXED_TRACE_NES[frame]
        : undefined
    : undefined;
  if (fixed) return [(fixed[0] + fixed[3] / 256) * NES_WORLD_X_SCALE, (fixed[1] + fixed[2] / 256) * NES_WORLD_Y_SCALE];
  const sample = ninjaTraceSamples(originX, originY, stage, phase, eventAt, fineX, fineY)?.[frame];
  return sample ? [sample[0] * NES_WORLD_X_SCALE, sample[1] * NES_WORLD_Y_SCALE] : undefined;
}
export function ninjaTraceLifetime(originX: number, originY: number, stage: number, phase = 0, eventAt?: number, fineX = Number.NaN, fineY = Number.NaN): number | undefined {
  const trace = ninjaTraceSamples(originX, originY, stage, phase, eventAt, fineX, fineY);
  return trace ? trace.length / NES_FRAME_RATE : undefined;
}

export function ninjaTraceThrowFrames(stage: number, eventAt?: number, fineX = Number.NaN, fineY = Number.NaN): readonly number[] | false | undefined {
  if (stage !== 4) return undefined;
  if (eventAt === 2015 && !(Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0)) return undefined;
  if (eventAt === 2207 && !(Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0)) return undefined;
  if (eventAt === 2223 && Math.round(fineX * 256) === 210 && Math.round(fineY * 256) === 133) return [116];
  if (eventAt === 2543 && Math.round(fineX * 256) === 36 && Math.round(fineY * 256) === 132) return [116];
  if (eventAt === 2207 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return false;
  if (eventAt === 2559 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return false;
  if (eventAt === 3215 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 3215 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return [116, 153, 190];
  if (eventAt === 3327 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 3327 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return [116, 153, 190];
  if (eventAt === 3391 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 3391 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 3535 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [117];
  if (eventAt === 3535 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return [117];
  if (eventAt === 3647 && Math.round(fineX * 256) === 171 && Math.round(fineY * 256) === 202) return [116, 153];
  if (eventAt === 3647 && Math.round(fineX * 256) === 133 && Math.round(fineY * 256) === 191) return [116, 153];
  if (eventAt === 3647 && Math.round(fineX * 256) === 127 && Math.round(fineY * 256) === 242) return [116, 153];
  if (eventAt === 3743 && Math.round(fineX * 256) === 169 && Math.round(fineY * 256) === 185) return [116];
  if (eventAt === 3759 && Math.round(fineX * 256) === 37 && Math.round(fineY * 256) === 54) return [116];
  if (eventAt === 1519 && Math.round(fineX * 256) === 162 && Math.round(fineY * 256) === 48) return [116];
  if (eventAt === 2031 && Math.round(fineX * 256) === 95 && Math.round(fineY * 256) === 146) return [116, 153];
  if (eventAt === 2239 && Math.round(fineX * 256) === 193 && Math.round(fineY * 256) === 236) return [116];
  if (eventAt === 1535 && Math.round(fineX * 256) === 19 && Math.round(fineY * 256) === 96) return false;
  if (eventAt === 3055 && Math.round(fineX * 256) === 91 && Math.round(fineY * 256) === 240) return [116, 153];
  if (eventAt === 1551 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 1567 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 1775 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 1919 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 2015 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 3055 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 3327 && Math.round(fineX * 256) === 44 && Math.round(fineY * 256) === 0) return [116, 153];
  if (eventAt === 3407 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 3519 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return false;
  if (eventAt === 3519 && Math.round(fineX * 256) === 44 && Math.round(fineY * 256) === 0) return false;
  if (eventAt === 2607 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 2623 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116, 153];
  if (eventAt === 2639 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 2751 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 2767 && Math.round(fineX * 256) === 44 && Math.round(fineY * 256) === 0) return [116, 153, 190];
  if (eventAt === 2815 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 2879 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return false;
  if (eventAt === 2911 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116, 153];
  if (eventAt === 2943 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return false;
  if (eventAt === 2959 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116, 174, 211, 248];
  if (eventAt === 3103 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116, 153];
  if (eventAt === 3119 && Math.round(fineX * 256) === 240 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 3119 && Math.round(fineX * 256) === 176 && Math.round(fineY * 256) === 0) return [116];
  if (eventAt === 735 && Math.round(fineX * 256) === 239 && Math.round(fineY * 256) === 81) return false;
  if (eventAt === 735 && Math.round(fineX * 256) === 161 && Math.round(fineY * 256) === 5) return [116, 153, 190, 227];
  if (eventAt === 767 && Math.round(fineX * 256) === 51 && Math.round(fineY * 256) === 66) return [116];
  if (eventAt === 1247 && Math.round(fineX * 256) === 203 && Math.round(fineY * 256) === 212) return [116, 153, 190, 227, 264];
  if (eventAt === 1279 && Math.round(fineX * 256) === 184 && Math.round(fineY * 256) === 212) return [116, 153];
  if (eventAt === 1375 && Math.round(fineX * 256) === 61 && Math.round(fineY * 256) === 154) return [116, 204, 241, 278, 315];
  if (eventAt === 1391 && Math.round(fineX * 256) === 184 && Math.round(fineY * 256) === 28) return [116];
  if (eventAt === 1407 && Math.round(fineX * 256) === 100 && Math.round(fineY * 256) === 182) return [116, 227];
  if (eventAt === 1551 && Math.round(fineX * 256) === 246 && Math.round(fineY * 256) === 23) return [116, 153, 190];
  if (eventAt === 1567 && Math.round(fineX * 256) === 81 && Math.round(fineY * 256) === 204) return [116];
  if (eventAt === 1743 && Math.round(fineX * 256) === 88 && Math.round(fineY * 256) === 46) return [116];
  if (eventAt === 1855 && Math.round(fineX * 256) === 204 && Math.round(fineY * 256) === 205) return [116];
  if (eventAt === 1887 && Math.round(fineX * 256) === 88 && Math.round(fineY * 256) === 246) return [116, 153, 190, 248, 285];
  if (eventAt === 1919 && Math.round(fineX * 256) === 251 && Math.round(fineY * 256) === 236) return [116, 153, 190, 357];
  if (eventAt === 2207 && Math.round(fineX * 256) === 36 && Math.round(fineY * 256) === 132) return [116];
  if (eventAt === 351) return [103];
  if (eventAt === 399) return false;
  if (eventAt === 943) return false;
  if (eventAt === 1103) return [116];
  if (eventAt === 1711) return [116, 153];
  if (eventAt === 3215 || eventAt === 3407) return [116];
  if (eventAt === 47 || eventAt === 63) return [103];
  if (eventAt === 383 || eventAt === 751 || eventAt === 1583 || eventAt === 3535 && Math.round(fineX * 256) === 135 && Math.round(fineY * 256) === 35) return false;
  if (eventAt === 1071) return [116, 153];
  if (eventAt === 815 || eventAt === 1199 || eventAt === 1727 || eventAt === 3727) return [116];
  return undefined;
}

export function ninjaTraceThrowFrame(stage: number, eventAt?: number, fineX = Number.NaN, fineY = Number.NaN): number | false | undefined {
  const frames = ninjaTraceThrowFrames(stage, eventAt, fineX, fineY);
  return frames === false ? false : frames?.[0];
}
const GUNMAN_FLANK_STAGE2_CODE7_AT2671_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE7_AT2671_TRACE_ABSOLUTE_NES.map(([x, y]) => [248 - x, y - 64] as const);
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
const GUNMAN_FLANK_STAGE2_CODE9_AT975_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("90H2QfVB9EL0QvNC8kPxQ/BD70TvRO5E7UXsRetF60bqRulG6EfnR+ZH5kjlSORI40niSeFJ4UrgSt9K3kvdS9xL3EzbTNpM2U3YTddN107WTtVO1E/TT9NP0lDRUNBQz1HOUc5RzVLMUstSylPJU8lTyFTHVMZUxVXEVcRVw1bCVsFWwFe/V79Xvli9WLxYu1m6WbpZuVq4Wrdatlu2W7VbtFyzXLJcsV2xXbBdr16uXq1erF+sX6tfq2CrYKtgq2GrYathq2KrYqtiq2OrY6tjq2SrZKtkq2WrZatlq2arZqtmq2erZ6tnq2iraKtoq2mraatpq2qraqtqq2ura6trq2yrbKtsq22rbattq26rbqtuq2+rb6tvq3CrcKtwq3Grcatxq3Krcqtyq3Orc6tzq3SrdKpyqHGnb6ZupW2jbKJroWmfaZ5onGebZppmmWaYZpdml2aWZpVmlGaTZpJmkmaRZpBnj2ePZ45ojGmLaopriGyHboZvhXGEcoN0gnWBd4B5f3p/fH5+foB9g32GfIl8jHyPfJJ8lXyYfJp8mnyafJt8m3ybfJx8nHycfJ18nXydfJ58nnyefJ98n3yffKB8oHygfKF8oXyhfaF+oX+hgKKBooGhgqKDooOig6ODooOhgqGCoIKfgp+CnoKdgp2CnIKbgpuDmoOZg5mDmISXhJiEl4WWhZaFlYaUhpSHlIeTiJOJkomSipKKkYuRjJGMkY2QjpGPkI+QkJGRkJKQk5GTkZSQlZGWkZeRl5KYkpmSmpOblJyUnJWdlZ6Wn5efl6CYoZmimqKao5yjnKOco52jnaOdo56jnqOeo5+jn6Ofo6CjoKKfoqChn6CfoJ+fn56enp6dnpydnJ6bnZqdmp2ZnJicl5yXnJablZyVm5Sbk5uTmpKakZqRmpCZj5qPmY6YjZmNmIyYi5iLmIqXiZiJl4iWh5eGloaWhZaEloSVg5WClYKUgZWAlICUf5R+lH6TfZN8k3ySe5N6knqSeZJ4kXiRd5F2kXWQdZF0kHOQc5Byj3GPcY9wj2+Ob49ujm2NbY5sjWuNa41qjWmMaY1ojGeLZ4xmi2WLZItki2OKYopiimGJYIpgiV+JXoleiV2IXIhciFuHWohah1mHWIdYhleGVoZWhlWFVIZThVOFUoVRhFGEUIRPhE+DToRNg02CTINLgkuCSoJJgkmBSIJHgUeARoFFgEWARIBDgEN/Qn9Bf0B+QH8/fj5+Pn49fjx9PH08fTx9O346fjl+OIA4gDeBN4M2hDaFNoc2iDeJN4o4iziMOY45jjqPOpE7kjuSPJQ9lT2WPpc+mD+ZQJpAm0GcQZ5CnkKfQ6FDoUSgRKBFoEWfRp9GnkeeSJ5InUmdSp1KnUucTJ1NnE2cTp1PnFCcUJ1RnVKcU51UnVWdVZ5WnleeWJ9ZoFmgWqFboVyhXaNeo16jX6RgpGGlYqZipmOmZKdlp2aoZqlnqWipaapqq2ura6xsrG2sbq5vrm+ucK9xr3Kvc7FzsXSxdbJ2snezeLR4tHm0erV7tny2fLd9t363f7iAuYC5gbqCuoO6hLyFvIW8hr2HvYi+ib+Jv4q/i8CMwI3BjcKOwo/CkMORxJLEksWTxZTFlceWx5bHl8iYyJnImsqaypvKnMudy57Mn82fzaDNoc6iz6PPo9Ck0KXQptGn0qfSqNOp06rTq9Ws1azVrdau1q/XsNiw2LHYstqz2rPatNy13Lbdtt+337jguOG54rnjuuW75bvmu+i86bzqveu97L3tvu++8L7xv/O/9L/1v/e/+L/5v/s=");
const GUNMAN_FLANK_STAGE2_CODE9_AT975_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE9_AT975_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 64] as const);
const GUNMAN_FLANK_STAGE2_CODE9_AT911_TRACE_ABSOLUTE_NES = decodeGunmanAbsoluteCoordinateSamples("+CH3IfYh9SL0IvMi8yPyI/Ej8CTvJO4k7iXtJewl6ybqJukm6SfoJ+cn5ijlKOQo5CnjKeIp4SrgKuAq3yveK90r3CzbLNss2i3ZLdgt1y7WLtYu1S/UL9Mv0jDRMNEw0DHPMc4xzTLMMswyyzPKM8kzyDTHNMc0xjXFNcQ1wzbDNsI2wTfAN783vji+OL04vDm7Obo5uTq5Org6tzu2O7U7tDy0PLM8sj2xPbA9rz6vPq4+rT+sP6s/q0CqQKlAqEGnQaZBpkKlQqRCo0OiQ6FDoUSgRJ9EnkWdRZxFnEabRptGm0ebR5tHm0ibSJtIm0mbSZtJm0qbSptKm0ubS5tLm0ybTJtMm02bTZtNm06bTptOm0+bT5tPm1CbUJtQm1GbUZtRm1KbUptSm1ObU5tTm1SbVJtUm1WbVZtVm1abVptWm1ebV5tXm1ibWJtYm1mbWZtZm1qbWptam1ubW5tbm1ybXJtcm12bXZtdm16bXptem1+bX5tfm2CbYJtgm2GbYZthm2KbYptim2ObY5tjm2SbZJtkm2WbZZtlm2abZptmm2ebZ5tnm2ibaJtom2mbaZtpm2qbaptqm2uba5trm2ybbJtsm22bbZttm26bbptum2+bb5tvm3CbcJtwm3GbcZtxm3Kbcptym3Obc5tzm3SbdJpymHGXb5ZulW2TbJJrkWmPaY5ojGeLZopmiWaIZodmh2aGZoVmhGaDZoJmgmaBZoBnf2d/Z35ofGl7anpreGx3bnZvdXF0cnN0cnVxd3B5b3pvfG5+boBtg22GbIlsjGyPbJJslWyYbJpsm2ycbJ5tnm2fbaFtoW6hb6JwoXChcaFyoXOhc6F0oXWgdaF1oXWgdaB1n3SedJ50nXScdJx0m3WbdZt1mnWZdZl1mHaXdpd2lneVd5V4lHiUeZR5k3mTeZR5lHmUeZV5lXmVeZZ5lnmWeZh5mXmZeZp5mnmaeZt5m3mbeZx5nHmceZ15nXmdeZ55nnmeeZ95n3mfeaB5oHmgeaF5oXmheaJ5oXmgeaB5n3meeZ55nXmceZx5m3maepp6mXqYeph7l3uWe5Z8lnyVfZV9lH6TfpR/k3+SgJKBkoGRgpKDkYOQhJGFkIWQhpGHkIiQiZGJkYqQi5GMkYyRjJKMkoySjJOMk4yTjJSMlIyUjJaMloyWjJeMl4yXjJiMmIyYjJmMmYyZjJqMmoyajJuMm4ybjJyMnIycjJ2MnYydjJ6MnoyejJ+Mn4yfjKCMoIygjKGMoYuhiqKJooiiiKOHo4ajhaSEpISkg6WCpYGlgKZ/pn+mfqd9p3yne6h6qHqoeal4qXepdqp1qnWqdKtzq3KrcaxwrHCsb61urW2tbK5rrmuuaq9pr2ivZ7BnsGawZbFksWOxYrJismGyYLNfs16zXbRdtFy0W7VatVm1WLZYtle2VrdVt1S3U7hTuFK4UblQuU+5T7pOuk26TLtLu0q7SrxJvEi8R71GvUW9Rb5EvkO+Qr9Bv0C/QMA/wD7APcE8wTvBO8I6wjnCOMM3wzbDNsQ1xDTEM8UyxTLFMcYwxi/GLsctxy3HLMgryCrIKckoySjJJ8omyiXKJMsjyyPLIswhzCDMH80ezR7NHc4czhvOGs8azxnPGNAX0BbQFdEV0RTRE9IS0hHSENMQ0w/TDtQN1AzUDNUM1QzVDNYM1gzWC9YL1QvUC9QM0wzSDdIN0g7RD9IQ0hDSEdMS0xPTFNQV1BXUFtUX1RjVGdYa1hrWG9cc1x3XHtgf2B/YINkh2SLZI9oj2iTaJdsm2yfbKNwo3CncKt0r3SzdLd4t3i7eL98w3zHfMuAy4DPgNOE14DbgNuE34TjhOeE64TvhO+I84j3iPuI/4j/iQONB40HjQeNB4kHhQOFA4EDfQN9A3kDdQd1B3EHbQdtB2kHZQdlC2ELXQtdC1kLVQtVD1EPTQ9ND0kPRQ9FE0ETPRM9EzkTNRM1EzEXLRctFykXKRcpFyUbIRshGx0bGRsZGxUbER8RHw0fCR8JHwUfASMBIv0i+SL5IvUi8SbxJu0m6SbpJuUm4SbhKt0q2SrZKtUq0SrRLs0uyS7NLskuxS7FLsEyvTK9MrkytTK1MrE2rTatNqk2pTalNqE6nTqdOpk6lTqVOpE6jT6NPok+hT6FPoE+fUJ9QnlCdUJ1QnFGcUZxRm1KaUppSmVOYU5hUmFSXVZdWl1aWV5ZXlliVWZVZlVqUW5VclVyUXZVelF+UYJVglWGVYpVjlWSVZZZllmaWZ5homGmYaZlqmWuabJttnG2cbp1vnm+ecKBxoXGhcqNzo3OkdKV1pnandqh3qXipeKt5q3qseq17rnyvfLB9sX6xfrN/s4C0gLaBtoK3griDuYS5hLuFu4a8hr6Hvoi/icCJwYrBi8OLxIzEjcaNxo7Hj8iPyZDJkcuRzJLMk86TzpTPldCV0ZbSl9OX1JjUmdaa1prXm9ic2Zzandue3J7cn96g3qDfoeGi4aLio+Ok5KTkpeam5qbnp+mo6ajqqeuq7Kvsq+6s763vrfGu8a/yr/Ow9LH0sfay97P3s/m0+rT6");
const GUNMAN_FLANK_STAGE2_CODE9_AT911_OFFSETS_NES = GUNMAN_FLANK_STAGE2_CODE9_AT911_TRACE_ABSOLUTE_NES.map(([x, y]) => [x - 248, y - 32] as const);

const GUNMAN_FLANK_STAGE2_CODE8_AT207_Y64_TRACE_NES = decodeCoordinateRuns("AgVBAQZBAQdCAQhCAQlCAgpDAQtDAQxEAQ1EAQ5EAg9FARBFARFGARJGARNGAhRHARVHARZIARdIARhIAhlJARpJARtKARxKAR1KAh5LAR9LASBMASFMASJMASJNASNNASRNASVOASZOASdOASdPAShPASlPASpQAStQASxQASxRAS1RAS5RAS9SATBSATFSATFTATJTATNTATRUATVUATZUATZVATdVAThVATlWAjpWATtXATxXAT1XAT5YAj9YAUBZAUFZAUJZAUNaAkRaAUVbAUZbAUdbAUhcAklcAUpdAUtdAUxdAU1eAk5eAU9fAVBfAVFfAVJgAlNgAlRhAVVgAVZeAVhdAVlbAVpaAVxZAV1YAV5XAWBWAWFVAWNVAWRUAWVUAWZTAWdTAmhTAWlTAWpTAWtTAWxTAW1TAW1UAW5UAW9UAnBVAXFVAXNXAXRYAXVZAXdaAXhbAXldAXpeAXtgAXxhAX1jAX5kAX9mAYBoAYBqAYFsAYFuAYJwAYJzAYN2AYN5AYN8AYN/AYOCAYOFAoOHAYKHAYKIAYGIAYCIAX+JAX6JAX2JAX2KAnyKAXyLAXyKAnyJAXyIAnyHAXyGAnyFAXyEAnyDAXyCAnyBAXyAAnx/AXx+Anx9AXx8Anx7AXx6Anx5AXx4Anx3AXx2Anx1AXx0AnxzAXxyAnxxAXxwAnxvAXxuAnxtAXxsAnxrAXxqAnxpAXxoAnxnAXxmAnxlAXxkAnxjAXxiAnxhAXxgAnxfAXxeAnxdAXxcAnxbAXxaAnxZAXxYAnxXAXxWAnxVAXxUAnxTAXxSAnxRAXxQAnxPAXxOAnxNAXxMAnxLAXxKAnxJAXxIAnxHAXxGAnxFAXxEAnxDAXxCAnxBAXxAAnw/AXw+Anw9AXw8Anw7AXw6Anw5AXw4Anw3AXw2Anw1AXw0AnwzAXwyAnwxAXwwAnwvAXwuAnwtAXwsAnwrAXwqAnwpAXwoAnwnAXwmAnwlAXwkAnwjAXwiAnwhAXwgAnwfAXweAnwdAXwcAnwbAXwaAnwZAXwYAnwXAXwWAnwVAXwUAnwTAXwSAnwRAXwQAnwPAXwOAnwNAXwMAnwLAXwKAnwJAXwIAnwHAXwGAnwFAXwEAnwDAXwCAnwBAXwA").map(([x, y]) => [x - 4, y - 64] as const);

export function gunmanFlankLifetime(entityCode: 7 | 8 | 9, originY = 0, stage = 2, phase = 0, fromRight = false, eventAt?: number): number {
  if (stage === 6 && entityCode === 8 && Math.round(originY) === 48 && phase === 0 && eventAt === 2991) return GUNMAN_FLANK_STAGE6_AT2991_FIXED_TRACE_NES.length / NES_FRAME_RATE;
  if (stage === 5 && entityCode === 7 && Math.round(originY) === 48 && eventAt === 1135) return GUNMAN_FLANK_STAGE5_AT1135_FIXED_TRACE_NES.length / NES_FRAME_RATE;
  if (stage === 5 && entityCode === 7 && Math.round(originY) === 64 && eventAt === 1711) return GUNMAN_FLANK_STAGE5_AT1711_TRACE_NES.length / NES_FRAME_RATE;
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
  if (stage === 2 && entityCode === 9 && eventAt === 911) return GUNMAN_FLANK_STAGE2_CODE9_AT911_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 9 && eventAt === 943) return GUNMAN_FLANK_STAGE2_CODE9_AT943_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 9 && eventAt === 975) return GUNMAN_FLANK_STAGE2_CODE9_AT975_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 7 && eventAt === 2671) return GUNMAN_FLANK_STAGE2_CODE7_AT2671_OFFSETS_NES.length / NES_FRAME_RATE;
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
  if (stage === 1 && entityCode === 9 && eventAt === 511) return GUNMAN_FLANK_STAGE1_AT511_OFFSETS_NES.length / NES_FRAME_RATE;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 0 && phase === 1) return GUNMAN_FLANK_STAGE2_CODE7_Y0_TRACE_ABSOLUTE_NES.length / NES_FRAME_RATE;
  const scoped = stage === 3 && entityCode === 7 && Math.round(originY) === 0 && phase === 1 ? GUNMAN_FLANK_STAGE3_CODE7_Y0_OFFSETS_NES.length : stage === 6 && entityCode === 7 && Math.round(originY) === 64 ? GUNMAN_FLANK_STAGE6_CODE7_Y64_LEFT_OFFSETS_NES.length : stage === 6 && entityCode === 7 && Math.round(originY) === 32 ? (fromRight ? GUNMAN_FLANK_STAGE6_CODE7_Y32_RIGHT_OFFSETS_NES.length : GUNMAN_FLANK_STAGE6_CODE7_Y32_LEFT_OFFSETS_NES.length) : stage === 6 && entityCode === 8 && Math.round(originY) === 32 && phase === 0 ? GUNMAN_FLANK_STAGE6_CODE8_Y32_PHASE0_OFFSETS_NES.length : stage === 6 && entityCode === 8 && Math.round(originY) === 32 && phase === 1 ? GUNMAN_FLANK_STAGE6_CODE8_Y32_REAL_OFFSETS_NES.length : stage === 6 && entityCode === 9 && Math.round(originY) === 48 && phase === 1 && fromRight ? GUNMAN_FLANK_STAGE6_CODE9_Y48_PHASE1_OFFSETS_NES.length : stage === 3 && entityCode === 7 && Math.round(originY) === 64 && phase === 1 ? (fromRight ? GUNMAN_FLANK_STAGE3_CODE7_RIGHT_OFFSETS_NES.length : GUNMAN_FLANK_STAGE3_CODE7_LEFT_OFFSETS_NES.length) : stage === 3 && entityCode === 8 && Math.round(originY) === 64 && phase === 0 ? GUNMAN_FLANK_STAGE3_CODE8_PHASE0_OFFSETS_NES.length : stage === 2 && Math.round(originY) === 64 && entityCode === 8 ? GUNMAN_FLANK_Y64_TRACE_SAMPLES_NES[entityCode].length : stage === 2 && Math.round(originY) === 32 && entityCode !== 7 ? GUNMAN_FLANK_SCOPED_LIFETIMES_FRAMES[entityCode] : undefined;
  return (scoped ?? Math.round(GUNMAN_FLANK_LIFETIMES[entityCode] * NES_FRAME_RATE)) / NES_FRAME_RATE;
}

export function gunmanFlankFirstOpportunityFrame(seed: number, originY = 16, stage = 2, entityCode: 7 | 8 | 9 = 7, phase = 0, eventAt?: number): number {
  if (stage === 6 && entityCode === 8 && phase === 1 && eventAt === 2943) return 655;
  return gunmanFirstOpportunityFrame(seed, originY, (stage === 2 || stage === 3) && entityCode === 7 && Math.round(originY) === 0 && phase === 1 ? 46 : undefined);
}

export function gunmanFlankEventShotFrames(stage: number, eventAt?: number, eventX?: number): readonly number[] | undefined {
  return GUNMAN_FLANK_EVENT_SHOT_FRAMES[`${stage}:${eventAt}:${eventX === undefined ? "" : Math.round(eventX)}`]
    ?? GUNMAN_FLANK_EVENT_SHOT_FRAMES[`${stage}:${eventAt}`];
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

export function gunmanFlankPosition(entityCode: 7 | 8 | 9, age: number, originY = 0, stage = 2, phase = 0, fromRight = false, eventAt?: number, fineX = 0, fineY = 0): readonly [number, number] {
  const path = stage === 2 && Math.round(originY) === 32 && entityCode !== 7 ? GUNMAN_FLANK_SCOPED_PATHS_NES[entityCode] : GUNMAN_FLANK_PATHS_NES[entityCode];
  const frame = Math.max(0, Math.round(age * NES_FRAME_RATE));
  if (stage === 6 && entityCode === 8 && Math.round(originY) === 48 && phase === 0 && eventAt === 2991 && frame < GUNMAN_FLANK_STAGE6_AT2991_FIXED_TRACE_NES.length) {
    const [x, y, sampleFineX, sampleFineY] = GUNMAN_FLANK_STAGE6_AT2991_FIXED_TRACE_NES[frame]!;
    return [x - 4 + (sampleFineX - fineX) / 256, y - 48 + (sampleFineY - fineY) / 256];
  }
  if (stage === 5 && entityCode === 7 && Math.round(originY) === 48 && eventAt === 1135 && frame < GUNMAN_FLANK_STAGE5_AT1135_FIXED_TRACE_NES.length) {
    const [x, y, sampleFineX, sampleFineY] = GUNMAN_FLANK_STAGE5_AT1135_FIXED_TRACE_NES[frame]!;
    return [x - 4 + (sampleFineX - fineX) / 256, y - 48 + (sampleFineY - fineY) / 256];
  }
  if (stage === 5 && entityCode === 7 && Math.round(originY) === 64 && eventAt === 1711 && frame < GUNMAN_FLANK_STAGE5_AT1711_TRACE_NES.length) {
    const [x, y, sampleFineX, sampleFineY] = GUNMAN_FLANK_STAGE5_AT1711_TRACE_NES[frame]!;
    return [x - 4 + (sampleFineX - fineX) / 256, y - 64 + (sampleFineY - fineY) / 256];
  }
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
  if (stage === 2 && entityCode === 9 && Math.round(originY) === 32 && phase === 0 && eventAt === 911 && frame < GUNMAN_FLANK_STAGE2_CODE9_AT911_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE9_AT911_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 9 && Math.round(originY) === 48 && phase === 0 && eventAt === 943 && frame < GUNMAN_FLANK_STAGE2_CODE9_AT943_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE9_AT943_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 9 && Math.round(originY) === 64 && phase === 0 && eventAt === 975 && frame < GUNMAN_FLANK_STAGE2_CODE9_AT975_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE9_AT975_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 64 && phase === 0 && fromRight && eventAt === 2671 && frame < GUNMAN_FLANK_STAGE2_CODE7_AT2671_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE2_CODE7_AT2671_OFFSETS_NES[frame]!;
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
  if (stage === 1 && entityCode === 9 && eventAt === 511 && frame < GUNMAN_FLANK_STAGE1_AT511_OFFSETS_NES.length) return GUNMAN_FLANK_STAGE1_AT511_OFFSETS_NES[frame]!;
  if (stage === 2 && entityCode === 7 && Math.round(originY) === 0 && phase === 1 && frame < GUNMAN_FLANK_STAGE2_CODE7_Y0_TRACE_ABSOLUTE_NES.length) {
    const [x, y] = GUNMAN_FLANK_STAGE2_CODE7_Y0_TRACE_ABSOLUTE_NES[frame]!;
    return [x - 56, y];
  }
  const y64Trace = stage === 6 && entityCode === 7 && Math.round(originY) === 64 ? GUNMAN_FLANK_STAGE6_CODE7_Y64_LEFT_OFFSETS_NES : stage === 3 && entityCode === 7 && Math.round(originY) === 64 && phase === 1 ? (fromRight ? GUNMAN_FLANK_STAGE3_CODE7_RIGHT_OFFSETS_NES : GUNMAN_FLANK_STAGE3_CODE7_LEFT_OFFSETS_NES) : stage === 3 && entityCode === 8 && Math.round(originY) === 64 && phase === 0 ? GUNMAN_FLANK_STAGE3_CODE8_PHASE0_OFFSETS_NES : stage === 2 && Math.round(originY) === 64 && entityCode === 8 ? GUNMAN_FLANK_Y64_TRACE_SAMPLES_NES[entityCode] : undefined;
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


const BANDIT_BILL_COMBAT_TRACE_PART_0 = "B75DAbxBAbtAAbo/Cbk9Abg8Abc6AbY5CbQ4AbM5AbI6AbE8CbA9Aa8/Aa1AAaxBCatDAapEAalGAahHCaZIAaVKAaRLAaNNLaJOAaBOAZ9OAZ1OCZtOAZpOAZhOAZZOCZVOAZNOAZFOAZBOCY5OAYxOAYtOAYlOCYdOAYZOAYROAYJOCYFOAX9OAX1OAXxOLXpOAXpQAXpSAXpUCXpWAXpYAXpaAXpcCXpeAXxeAX1eAX9eCYFeAYJeAYReAYZeCYdeAYleAYteAYxeCY5eAZBeAZFeAZNeLZVeAZVcAZVaAZVYCZVWAZVUAZVSAZVQCZVOAZVMAZVKAZVICZVGAZVEAZVCAZVACZU+AZU8AZU6AZU4CZU2AZU0AZUyAZUwLZUuAZMvAZIxAZEyCZA0AY81AY42AY04CYs5AYo7AYk8AYg+CYc/AYZAAYRCAYNDCYJFAYFGAYBHAX9JCX1KAXxMAXtNAXpOLXlQAXdQAXZQAXRQCXJQ";

const BANDIT_BILL_COMBAT_TRACE_PART_1 = "AXFQAW9QAW1QCWxQAWpQAWhQAWdQCWVQAWNQAWJQAWBQCV5QAV5OAV5MAV5KCV5IAV5GAV5EAV5CLV5AAV1AAVtAAVlACVhAAVZAAVRAAVNACVFAAU9AAU5AAUxACUpAAUlAAUdAAUZACURAAUJAAkFACUJAAURAAUZAAUdALUlAAUk+AUk8AUk6CUk4AUk2AUk0AUkyCUkwAUkuAUksAUkqCkkoAUkqAUksCUkuAUkwAUkyAUk0CUk2AUk4AUk6AUk8LUk+AUo8AUs7AUw6CU04AU83AVA1AVE0CVIzAVMxAVQwAVYuCVctAVgsAVkqClopAVkqAVgsAVctCVYuAVQwAVMxAVIzLVE0AVEyAVEwAVEuCVEsAVEqAlEoCVEqAVEsAVEuAVEwCVEyAVE0AVE2AVE4CVE6AVE8AVE+AVFACVFCAVFEAVFGAVFILVFKAVJLAVNNAVROCVZQAVdRAVhSAVlUCVpVAVtXAVxYAV5ZCV9bAWBc";

const BANDIT_BILL_COMBAT_TRACE_PART_2 = "AWFeAWJfCWNgAWViAWZjAWdlCWhmAWlnAWppAWxqLW1sAW1uAW1wAW1yCW10AW12AW14AW16CW18Am1+AW18CW16AW14AW12AW10CW1yAW1wAW1uAW1sCW1qAW1oAW1mAW1kLW1iAW5jAW9lAXBmCXFnAXJpAXRqAXVsCXZtAXduAXhwAXlxCXtzAXx0AX11AX53CX94AYB6AYF7AYN8CYR+AoV/AYR+LYN8AYR7AYV6AYZ4CYd3AYh1AYp0AYtzCYxxAY1wAY5uAY9tCZFsAZJqAZNpAZRnCZVmAZZnAZdpAZlqCZpsAZttAZxuAZ1wLZ5xAZ5zAZ51AZ53CZ55AZ57AZ59Cp5/AZ59AZ57AZ55CZ53AZ51AZ5zAZ5xCZ5vAaBvAaJvAaNvCaVvAadvAahvAapvLaxvAaxxAaxzAax1Cax3Aax5Aax7Aax9Cqx/Aax9Aax7Cax5Aax3Aax1AaxzCaxxAapwAaluAahtCadsAaZqAaVp";

const BANDIT_BILL_COMBAT_TRACE_PART_3 = "AaRnLaJmAaJoAaJqAaJsCaJuAaJwAaJyAaJ0CaJ2AaJ4AaJ6AaJ8CqJ+AaJ8AaJ6CaJ4AaJ2AaJ0AaJyCaJwAaJuAaJsAaJqLaJoAaRpAaVrAaZsCaduAahvAalwAapyCaxzAa11Aa52Aa93CbB5AbF6AbN8AbR9CrV+AbR9AbN8CbF6AbB5Aa93Aa52La11Aa52Aa93AbB5CbF6AbN8AbR9CrV+AbZ9Abd8Abh6Cbp5Abt3Abx2Ab11Cb5zAb5xAb5vAb5tCb5rAb5pAb5nAb5lLb5jAb1iAbxgAbtfCbpeAbhcAbdbAbZZCbVYAbNYAbJYAbBYCa5YAa1YAatYAalYCahYAaZZAaVbAaRcCaNeAaJfAaFgAaBiLZ5jAZ1lAZxmAZtnCZppAZlqAZdsAZZtCZVuAZRwAZNxAZJzCZF0AY91AY53AY14CYx6AYt7AYp8AYh+Cod/AYh+AYp8LYt7AYl7AYd7AYZ7CYR7AYJ7AYF7AX97";

const BANDIT_BILL_COMBAT_TRACE_PART_4 = "CX17AXx7AXp7AXl7CXd7AXV7AXR7AXJ7CXB7AW97AW17AWt7CWp7AWh7AWZ7AWV7LWN7AWR8AWV+CmZ/AWV+AWR8AWN7CWJ6AWF4AWB3AV51CV10AVxzAVtxAVpwCVluAVdtAVZsAVVqCVRpAVNnAVJmAVBlLU9jAU9lAU9nAU9pCU9rAU9tAU9vAU9xCU9zAU91AU93AU95CU97AU99Ak9/CU99AU97AU95AU93CU91AU9zAU9xAU9vLU9tAU9rAU9pAU9nCU9lAU9jAU9hAU9fCU9dAU9bAU9ZAU9XCU9VAU9TAU9RAU9PCU9NAU9LAU9JAU9HCU9FAU9DAU9BAU8/LU89AU48AU06AUw5CUs4AUo2AUg1AUczCUYyAUUxAUQvAUMuCUEsAkArAUEsCUMuAUEsAkArCUEsAUMuAUQvAUUxLUYyAUcxAUgvAUouCUssAUwrAU0pCk4oAU0pAUwrAUssCUouAUgvAUcxAUYyCUUzAUQ1";

const BANDIT_BILL_COMBAT_TRACE_PART_5 = "AUM2AUE4CkA5AUE4AUM2LUQ1AUQzAUQxAUQvCUQtAUQrAkQpCUQrAUQtAUQvAUQxCUQzAUQ1AUQ3AUQ5CUQ7AUQ9AUQ/AURBCURDAURFAURHAURJLURLAUVMAUZOAUdPCUhQAUpSAUtTAUxVCU1WAU5XAU9ZAVBaCVJcAVNdAVReAVVgCVZhAVdjAVlkAVplCVtnAVxoAV1qAV5rLWBsAWBuAWBwAWByCWB0AWB2AWB4AWB6CWB8AWF8AWN8AWR8CWZ8AWh8AWl8AWt8CW18AW58AXB8AXJ8CXN8AXV8AXd8AXh8Lnp8AXl+Anh/CXl+AXp8AXt7AXx6CX14AX93AYB1AYF0CYJzAYNxAYRwAYZuCYdtAYhsAYlqAYppCYtnAY1mAY5lAY9jLZBiAY9gAY5fAY1eCYtcAYpbAYlZAYhYCYdXAYdVAYdTAYdRCYdPAYdNAYdLAYdJCYdHAYdFAYdDAYdBCYc/AYc9AYc7AYc5LYc3AYg4";

const BANDIT_BILL_COMBAT_TRACE_PART_6 = "AYk5AYo7CYs8AY0+AY4/AY9ACZBCAZFDAZJFAZNGCZVHAZZJAZdKAZhMCZlNAZpOAZxQAZ1RCZ5TAZ9UAaBVAaFXLaJYAaRXAaVVAaZUCadTAahRAalQAatOCaxNAa1MAa5KAa9JCbBHAbJGAbNFAbRDCbVCAbRDAbNFAbJGCbBHAa9JAa5KAa1MLaxNAa1OAa5QAa9RCbBTAbJUAbNVAbRXCbVYAbZaAbdbAbhcCbpeAbtfAbxhAb1iCb5kAb9lAcFmAcJoCcNpAcRrAcVsAcZtLcdvAcZvAcRvAcNvCcFvAb9vAb5vAbxvCbpvAblvAbdvAbVvCbRvAbJvAbBvAa9vCa1vAatvAapvAahvCaZvAaVvAaNvAaFvLaBvAaFvAaNvAaVvCaZvAahvAapvAatvCa1vAa9vAbBvAbJvCbRvAbVvAbdvAblvCbpvAbxvAb5vAb9vCcFvAcNvAcRvAcZvLcdvAclwAcpyActzCcx0Ac12As53";

const BANDIT_BILL_COMBAT_TRACE_PART_7 = "Cc12Acx0ActzAcpyCclwAcdvAcZtAcVsCcRrAcNpAcJoAcFmCb9lAb5kAb1iAbxhLbtfAbphAbhiAbdkCbZlAbVmAbRoAbNpCbJrAbBsAa9tAa5vCa1wAaxyAatzAal0Cah2Aad0AaZzAaVyCaRwAaJvAaFtAaBsLZ9rAZ9tAZ9vAZ9xCZ9zAZ91AZ93AZ95CZ97AZ99Ap9/CZ99AZ97AZ95AZ93CZ91AZ9zAZ9xAZ9vCZ9tAZ9rAZ9pAZ9nLZ9lAZ5jAZ1iAZxgCZpfAZleAZhcAZdbCZZZAZVYAZNWAZJVCZFUAZBSAY9RAY5PCY1OAYtNAYpLAYlKCYhIAYdHAYZGAYRELYNDAYJBAYFAAYA/CX89AX08AXw6AXs5CXo4AXk2AXg1AXczCXUyAXQxAXMvAXIuCXEsAXArAW4pAW0o";

const BANDIT_BILL_COMBAT_TRACE_LONG_NES = decodeCoordinateRuns(BANDIT_BILL_COMBAT_TRACE_PART_0 + BANDIT_BILL_COMBAT_TRACE_PART_1 + BANDIT_BILL_COMBAT_TRACE_PART_2 + BANDIT_BILL_COMBAT_TRACE_PART_3 + BANDIT_BILL_COMBAT_TRACE_PART_4 + BANDIT_BILL_COMBAT_TRACE_PART_5 + BANDIT_BILL_COMBAT_TRACE_PART_6 + BANDIT_BILL_COMBAT_TRACE_PART_7);

function banditBillCombatPosition(age: number, entryX = 192 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE - BANDIT_BILL_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 192;
  const combatFrame = Math.round(frame);
  const traced = combatFrame < BANDIT_BILL_COMBAT_TRACE_NES.length
    ? BANDIT_BILL_COMBAT_TRACE_NES[combatFrame]
    : BANDIT_BILL_COMBAT_TRACE_LONG_NES[Math.min(combatFrame - BANDIT_BILL_COMBAT_TRACE_NES.length, BANDIT_BILL_COMBAT_TRACE_LONG_NES.length - 1)];
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

export const BANDIT_BILL_RANDOM_ROUTE_START_FRAME = 7_584;
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

const CUTTER_COMBAT_TRACE_PART_0 = "BZ85AZ87AZ89AZ8/CZ9BAZ9DAZ9FAZ9HCZ9JAaBLAaJMAaNNCaRPAaVQAaZSAadTIqhVAadSAaVQAaNOAaJMAaBKAZ5IAZxGAZtEAZlCAZc/AZU9AZQ7AZI5AZA3AY41AY0zAYsxAYkvAYgsAYYqNYQoAYMqAYIrAYEsCX8uAX4vAX0xAXwyCXszAXo1AXg2AXc4CXY5AXU7AXQ8AXM9CXI/AXBAAW9CAW5DCW1EAWxGAWtHAWlJCWhKAWdLAWZNAWVOCWRQAWNRAWFSAWBUCV9VAWFVAWJVAWRVCWZVAWdVAWlVAWtVCWxVAW5VAXBVAXFVCXNVAXVVAXZVAXhVCXpVAXtVAX1VAX9VCYBVG4JVAYBTAX5RAX1PAXtNAXlLAXdJAXZGAXREAXJCAXBAAW8+AW08AWs6AWo4AWg2AWYzAWQxAWMvAWEtAV8rJl0pAV8pAWEpAWIpCWQpAWYpAWcpAWkpCWspAWwpAW4pAXApCXEpAXMp";

const CUTTER_COMBAT_TRACE_PART_1 = "AXUpAXYpCXgpAXopAXspAX0pCX8pAYApAYIpAYMpCYUpAYcpAYgpAYopCYwpAY0pAY8pAZEpCZIpAZIrAZItAZIvCZIxAZIzAZI1AZI3CZI5AZQ5AZY5AZc5CZk5AZs5AZw5AZ45CaA5AaE5AaM5AaU5CaY5Aag5Aao5Aas5Ca05Aa85AbA5AbI5G7Q5AbI3AbA1Aa4zAa0wAasuAaksAacqSKYoAaQoAaIoAaEoCZ8oAZ0oAZwoAZooCZgoAZcoAZUoAZMoCZIoAZAoAY4oAY0oCYsoAYsqAYssAYsuCYswAYsyAYs0AYs2CYs4AYs6AYs8AYs+CYtAAYtCAYtEAYtGCYtIAYtKAYtMAYtOCYtQAYtSAYtUAYtWCYtYAYtaAYtcAYteCYtgAYtiAYtkAYtmCYtoAY1oAY5oAZBoHpJoAZBmAY5kAY1iAYtgAYleAYdbAYZZAYRXAYJVAYBTAX9RAX1PAXtNAXlLAXhIAXZGAXREAXNC";

const CUTTER_COMBAT_TRACE_PART_2 = "AXFAAW8+AW08AWw6AWo4AWg1AWYzAWUxAWMvAWEtAV8rXl4pAV4rAV4tAV4vCV4xAV4zAV41AV43CV45AVw5AVo5AVk5CVc5AVU5AVQ5AVI5CVA5AU85AU05AUw5CUo5AUg5AUc5AUU5CUM5AUI5AUA5AT45CT05ATs5ATk5ATg5CTY5ATc3ATg2ATk1IjszATwxAT4vAUAtAUIrQUMpAUMrAUMtCUMvAUMxAUMzAUM1CUM3AUM1AUMzAUMxCUMvAUMtAUMrCkMpAUMrAUMtAUMvCUMxAUMzAUM1AUM3CUM5AUM7AUM9AUM/CUNBAUNDAUNFAUNHCUNJAUNLAUNNAUNPCUNRAUNTAUNVAUNXCUNZAUNbAUNdAUNfCUNhAUNjAUNlAUNnCUNpAURnAUZmAUdkCUhjAUliAUpgAUtfHU1dAU5bAVBZAVJXAVNVAVVTAVdRAVlPAVpMAVxKAV5IAWBGAWFEAWNCAWVAAWc+AWg8AWo5AWw3";

const CUTTER_COMBAT_TRACE_PART_3 = "AW01AW8zAXExAXMvAXQtAXYrOngpAXYpAXUpAXMpCXEpAXApAW4pAWwpCWspAWkpAWcpAWYpCWQpAWIpAWEpAV8pCV0pAVwpAVopAVgpCVcpAVUpAVMpAVIpCVApAU4pAU0pAUspCUopAUgpAUYpAUUpCkMpAUQqAUUrCUYtAUguAUkwAUoxCUsyAUw0AU01AU43CVA4AVE5AVI7AVM8CVQ+AVU/AVdBAVhCG1lDAVtBAVw/AV49AWA7AWI5AWM3AWU1AWcyAWgwAWouAWwsAW4qSG8oAXEpAXIrAXMsCXQuAXUvAXYwAXgyCXkzAXo1AXs2AXw3CX05AX46AYA8AYE9CYI+AYNAAYRBAYVDCYdEAYhFAYlHAYpICYtKAYxIAY1HAY9FCZBEAZFDAZJBAZNACZQ+AZY9AZc8AZg6CZk5AZo3AZs2AZ01CZ4zAZ81AaA2AaE3CaI5AaM6AaU8AaY9Cac+AahAG6lBAac/AaY9AaQ7AaI5";

const CUTTER_COMBAT_TRACE_PART_4 = "AaE3AZ81AZ0yAZswAZouAZgsAZYqMpQoAZQqAZQsAZQuCZQwAZQyAZQ0AZQ2CZQ4AZQ6AZQ8AZQ+CZRAAZRCAZREAZRGCZRIAZRKAZRMAZROCZRQAZRSAZRUAZRWCZRYAZRaAZRcAZReCZRgAZRiAZRkAZRmCZRoAZZpAZdrAZhsCZluAZpvAZtwAZ1yCZ5zAZ91AaB2AaF3CaJ5AaN6AaV8AaZ9Cad+AaiAAamBAaqDCayEAa2FAa6HAa+ICbCKG6+IAa2GAayEAaqCAaiAAaZ+AaV8AaN5AaF3AZ91AZ5zAZxxAZpvAZhtAZdrAZVpAZNnAZJkAZBiAY5gAYxeAYtcAYlaAYdYAYVWAYRUAYJRAYBPAX5NAX1LAXtJAXlHAXhFAXZDAXRBAXI+AXE8AW86AW04AWs2AWo0AWgyAWYwAWQuAWMre2EpAV8pAV4pAVwpCVopAVkpAVcpAVUpCVQpAlUoAVQpCVMrAVEsAVAuAU8vCU4w";

const CUTTER_COMBAT_TRACE_PART_5 = "AU0yAUwzAUo1CUk2AUg3AUc5G0Y6AUg4AUk2AUs0AU0yAU8wAVAuAVIrJVQpAVUpAVcpAVkpCVopAVwpAV4pAV8pCWEpAV8pAV4pAVwpCVopAVkpAVcpAVUpCVQpAVIpAVApAU8pCU0pAUspAUopAUgpCUYpAUYrAUYtAUYvCUYxAUYzAUY1AUY3CUY5AUY7AUY9AUY/CUZBAUZDAUZFAUZHCUZJAUZLAUZNAUZPCUZRAUZTAUZVAUZXCUZZAUZbAUZdAUZfCUZhAUZjAUZlAUZnCUZpAUhrAUlsAUpuCUtvAUxwAU1yAU9zHVB1AVFyAVNwAVVuAVdsAVhqAVpoAVxmAV5kAV9iAWFfAWNdAWVbAWZZAWhXAWpVAWtTAW1RAW9PAXFNAXJKAXRIAXZGAXhEAXlCAXtAAX0+AX88AYA6AYI3AYQ1AYUzAYcxAYkvAYstAYwrUo4pAZApAZEpAZMpCZUpAZYpAZgpAZopCZspAZoqAZkr";

const CUTTER_COMBAT_TRACE_PART_6 = "AZgtCZcuAZYwAZQxAZMyCZI0AZE1AZA3AY84CY46AYw7AYs8AYo+CYk/AYhBAYdCAYVDCYRFAYNGAYJIAYFJCYBKAX5KAXxKAXtKCXlKAXdKAXZKAXRKHHJKAXRIAXZGAXhEAXlCAXtAAX0+AX88AYA6AYI3AYQ1AYUzAYcxAYkvAYstAYwrO44pAY8qAZArAZItCZMuAZQwAZUxAZYyCZc0AZk1AZo3AZs4CZw6AZ07AZ48AZ8+CaE/AaJBAaNCAaRDCaVFAaZGAahIAalJCapKAatMAaxNAa1PCa9QAbBRAbFTAbJUCbNWAbRXAbVYAbdaCbhbAbldAbpeAbtfCbxhAb5hAcBhAcFhCcNhAcVhAcZhAchhCcphActhAc1hAc9hI9BhAc9fAc1dActbAclYAchWAcZUAcRSAcJQAcFOAb9MAb1KAbtIAbpFAbhDAbZBAbU/AbM9AbE7Aa85Aa43Aaw1AaoyAagwAacuAaUsAaMqV6Eo";

const CUTTER_COMBAT_TRACE_PART_7 = "AaEqAaEsAaEuCaEwAaEyAaE0AaE2CaE4AaE6AaE8AaE+CaFAAaFCAaFEAaFGCaFIAaFKAaFMAaFOCaFQAaFSAaFUAaFWCaFYAaFaAaFcAaFeCaFgAaFiAaFkAaFmCaFoAaBnAZ9lAZ5kCZ1iAZxhAZtgAZleIJhdAZZbAZVYAZNWAZFUAZBSAY5QAYxOAYpMAYlKAYdIAYVFAYNDAYJBAYA/AX49AXw7AXs5AXk3AXc1AXYzAXQwAXIuAXAsAW8qZ20oAW0qAW0sAW0uCW0wAW0yAW00AW02CW04AW06AW08AW0+CW1AAW1CAW1EAW1GCW1IAWxHAWtFAWlECWhCAWdBAWZAAWU+CWQ9AWI7AWE6AWA4CV83AV42AV00AVszCVoxAVkwAVgvAVctHlYsAVcqRVkoAVsoAVwoAV4oCWAoAWEoAWMoAWUoCWYoAWYqAWYsAWYuCWYwAWYyAWY0AWY2CWY4AWY6AWY8AWY+CWZAAWZCAWZE";

const CUTTER_COMBAT_TRACE_PART_8 = "AWZGCWZIAWZKAWZMAWZOCWZQAWZSAWZUAWZWCWZYAWZaAWZcAWZeCWZgAWZiAWZkAWZmCWZoAWhmAWllAWpjCWtiAWxhAW1fAW9eCXBcAXFbAXJaAXNYCXRXAXVVAXdUAXhTG3lRAXtPAXxNAX5LAYBJAYJHAYNEAYVCAYdAAYk+AYo8AYw6AY44AY82AZE0AZMxAZUvAZYtAZgrJJopAZsqAZwsAZ0tCZ8vAaAwAaExAaIzCaM0AaQ2AaU3Aac5Cag6Aak7Aao9Aas+CaxAAa5BAa9CAbBECbFFAbJHAbNIAbRJCbZLAbZJAbZHAbZFCbZDAbZBAbY/AbY9CbY7AbY9AbY/AbZBCbZDAbZFAbZHAbZJCbZLAbdLAblLAbtLCbxLAb5LAcBLAcFLCcNLAcVLAcZLAchLCcpLActLAc1LAc5LCdBLAdJLAdNLAdVLH9dLAdVJAdNHAdJEAdBCAc5AAcw+Acs8Ack6Acc4AcU2AcQ0AcIx";

const CUTTER_COMBAT_TRACE_PART_9 = "AcAvAb4tAb0rRLspAbwqAb0sAb4tCcAvAcEwAcIxAcMzCcQ0AcU2Acc3Acg5Cck6Aco7Acs9Acw+Cc5AAc9AAdFAAdJACdRAAdZAAddAAdlACdtAAds+Ads8Ads6Cds4Ads2Ads0AdsyCdswAdwxAd0yAd40Ct81Ad40Ad0yCdwxAdswAdouAdgtCdcrAdYqAtUpCdYqAdcrAdgtG9ouAdgsAdYqMdQoAdYpAdcrAdgsCdktAdovAdswAdwyCd4zAt80Ad4zCdwyAdswAdovAdktCdgsAdcrAdYpCtQoAdYpAdcrAdgsCdktAdosAdsrAdwpCt4oAdwpAdsrCdosAdktAdgvAdcwCdYyAdQzAdM0AdI2CdE3Ac83Ac43Acw3Cco3Ack3Acc3AcU3CcQ3AcI3AcA3Ab83Cb03Abs3Abo3Abg3CbY3AbU3AbM3AbE3IrA3Aa41AawzAasxAakvAactAaUrWaQpAaUqAaYrAactCaguAakw";

const CUTTER_COMBAT_TRACE_PART_10 = "AasxAawyCa00Aa41Aa83AbA4CbI5AbM7AbQ8AbU+CbY/AbdAAbhCAbpDCbtFAbxGAb1HAb5JCb9KAcFMAcJNAcNOCcRQAcVRAcZTAchUCclWAcpXActYAcxaCc1bAc5dAdBeAdFfCdJhAdJjAdJlAdJnCdJpAdJrAdJtG9JvAdBtAc5rAc1oActmAclkAchiAcZgAcReAcJcAcFaAb9YAb1VAbtTAbpRAbhPAbZNAbRLAbNJAbFHAa9FAa1CAaxAAao+Aag8Aac6AaU4AaM2AaE0AaAyAZ4vAZwtAZorJJkpAZkrAZktAZkvCZkxAZkzAZk1AZk3CZk5AZk7AZk9AZk/CZlBAZlDAZlFAZlHCZlJAZhLAZZMAZVNCZRPAZNQAZJSAZFTCY9UAY5WAY1XAYxZCYtaAYpbAYhdAYdeCYZgAYVhAYRiAYNkCYJlAYBnAX9oAX5pCX1rAX5pAX9oAYBnCYJlAYNkAYRiAYVhCYZgAYdeAYhd";

const CUTTER_COMBAT_TRACE_PART_11 = "AYpbCYtaAYxZAY1XAY5WHY9UAY5SAYxQAYpOAYhMAYdKAYVIAYNGAYJEAYBBAX4/AXw9AXs7AXk5AXc3AXU1AXQzAXIxAXAuAW4sAW0qIWsoAW0oAW4oAXAoCXIoAXMoAXUoAXcoCXgoAXkqAXsrAXwsCX0uAX4vAX8xAYAyCYIzAYM1AYQ2AYU4CYY5AYc6AYg8AYo9CYs/AYw/AY4/AZA/CZE/AZM/AZU/AZY/CZg/AZdAAZZBAZVDCZNEAZJGAZFHAZBICY9KAY5LAYxNAYtOCYpPAYlRAYhSAYdUCYZVAYRXAYNYAYJZCYFbAYBcAX9eAX1fCXxgAX1iAX9jAYBlIIFmAX9kAX1iAXxgAXpeAXhbAXZZAXVXAXNVAXFTAXBRAW5PAWxNAWpLAWlIAWdGAWVEAWNCAWJAAWA+AV48AVw6AVs4AVk1AVczAVYxAVQvAVItAVArXE8pAU8rAU8tAU8vCU8xAU8zAU81AU83CU85AU87";

const CUTTER_COMBAT_TRACE_PART_12 = "AU89AU8/CU9BAU9DAU9FAU9HCU9JAU9LAU9NAU9PCU9RAU9TAU9VAU9XCU9ZAU9bAU9dAU9fCU9hAU9jAU9lAU9nCU9pAU1pAUtpAUppCUhpAUZpG0VpAUZnAUhlAUpiAUxgAU1eAU9cAVFaAVNYAVRWAVZUAVhSAVlPAVtNAV1LAV9JAWBHAWJFAWRDAWZBAWc/AWk9AWs6AW04AW42AXA0AXIyAXMwAXUuAXcsJXkqAngoAXkqCXorAXssAXwuAX0vCX4xAYAyAYEzAYI1CYM2AYQ4AYU5AYc6CYg8AYk9AYo/AYtACYxBAY1DAY9EAZBGCZFHAZJIAZNKAZRLCZZNAZdOAZhPAZlRCZpSAZlUAZhVAZdXCZZYAZRZAZNbAZJcCZFeAZBfAY9gAY1iCYxjAYtlAYpmAYlnCYhpAYdqAYVsAYRtCYNuAYJwAYFxAYBzH350AYByAYJwAYRuAYVsAYdqAYlnAYtlAYxjAY5hAZBfAZJd";

const CUTTER_COMBAT_TRACE_PART_13 = "AZNbAZVZAZdXAZhUAZpSAZxQAZ5OAZ9MAaFKAaNIAaVGAaZEAahBAao/Aaw9Aa07Aa85AbE3AbI1AbQzAbYxAbguAbksAbsqIL0oAb0qAb0sAb0uCb0wAb0yAb00Ab02Cb04Ab06Ab08Ab0+Cb1AAb1CAb1EAb1GCb1IAbtIAbpIAbhICbZIAbVIAbNIAbFICbBIAa5IAaxIAatICalIAadIAaZIAaRICaJIAaFIAZ9IAZ1ICZxIAZpIAZhIAZdICZVIAZdIAZhIAZpICZxIAZ1IAZ9IAaFICaJIAaFKAaBLAZ9MCZ5OAZ1PAZtRAZpSHplTAZdRAZZPAZRNAZJLAZBJAY9HAY1FAYtCAYpAAYg+AYY8AYQ6AYM4AYE2AX80AX0yAXwwAXotAXgraXYpAXUpAXMpAXEpCXApAW4pAW0pAWspCWkpAWgpAWYpAWQpCWMpAWEpAV8pAV4pCVwpAVopAVkpAVcpCVUpAVQpAVIpAVApCU8p";

const CUTTER_COMBAT_TRACE_PART_14 = "AU0pAUspAUopCUgpAUYpAUUpAUMpCUEpAUApAT4pATwpSjspAjooATspCTwrAT0sAT4tAT8vCUEwAUIyAUMzAUQ0CUU2AUY3AUg5AUk6CUo7AUs9AUw+AU1ACU5BAVBCAVFEAVJFCVNHAVRIAVVKAVdLCVhMAVlOAVpPAVtRCVxSAVxUAVxWAVxYCVxaAVxcAVxeAVxgCVxiAVthAVpfAVleCVhcAVdbAVVaAVRYCVNXAVJVAVFUAVBSCU5RAU1QAUxOAUtNCUpLAUlKAUhJAUZHCUVGAUREAUNDAUJCIEFAAUI+AUQ8AUY6AUg4AUk2AUs0AU0xAU4vAVAtAVIrN1QpAlMoAVQpCVUqAVYsAVctAVgvCVkwAVsxAVwzAV00CV42AV83AWA4AWI6CWM7AWQ9AWU+AWZACWdBAWlCAWpEAWtFCWxHAW1IAW5JAW9LCXFMAXJOAXNPAXRQCXVSAXRSAXJSAXBSCW9SAW1SAWtSAWpSCWhS";

const CUTTER_COMBAT_TRACE_PART_15 = "AWlQAWpPAWtOCW1MAW5LAW9JAXBICXFHAXJFAXREAXVCCXZBAXdAAXg+AXk9IHo7AXw5AX43AYA1AYEzAYMxAYUvAYctAYgqf4ooAYkqAYgrAYctCYUuAYQvAYMxAYIyCYE0AYA1AX82AX04CXw5AXs7AXo8AXk9CXg/AXZAAXVCAXRDCXNEAXJGAXFHAW9JCW5KAW1KAWtKAWlKCWhKAWZKAWRKAWNKImFKAWNIAWVGAWZEAWhCAWpAAWs9AW07AW85AXE3AXI1AXQzAXYxAXgvAXktAXsqNX0oAX4oAYAoAYIoCYMoAYUoAYcoAYgoCYooAYkqAYgrAYctCYUuAYQvAYMxAYIyCYE0AYA1AX82AX04CXw5AXs7AXo8AXk9CXg/AXZAAXVCAXRDCXNEAXJGAXFHAW9JCW5KAW1LAWxNAWtOCWpQAWlRAWdSAWZUCWVVAWNVAWJVAWBVCV5VAV1VAVtVAVlVCVhVAVdXAVZYAVRaCVNb";

const CUTTER_COMBAT_TRACE_PART_16 = "AVJcAVFeAVBfHU9hAVBeAVJcAVRaAVZYAVdWAVlUAVtSAVxQAV5OAWBLAWJJAWNHAWVFAWdDAWlBAWo/AWw9AW47AXA4AXE2AXM0AXUyAXYwAXguAXosAXwqbH0oAX8pAYAqCYEsAYItAYMvAYQwCYYxAYczAYg0AYk2CYo3AYs4AYw6AY47CY89AZA+AZFAAZJBCZNCAZVEAZZFAZdHCZhIAZlJAZpLAZtMCZ1OAZ5PAZ9QAaBSCaFTG6JVAaFSAZ9QAZ1OAZtMAZpKAZhIAZZGAZVEAZNCAZFAAY89AY47AYw5AYo3AYg1AYczAYUxAYMvAYEtAYAqY34oAXwoAXsoAXkoCXcoAXYoAXQoAXIoCXEoAW8oAW0oAWwoCWooAWgoAWcoAWUoCWMoAWIoAWAoAV8oCV0oAVsoAVooAVgoCVYoAVcqAVkrAVotCVsuAVwvAV0xAV4yCV80AWE1AWI2AWM4CWQ5AWU7AWY8G2g9AWk7AWs5";

const CUTTER_COMBAT_TRACE_PART_17 = "AW03AW81AXAzAXIxAXQvAXUtAXcqJnkoAXkqAXksCXkuAXkwAXkyAXk0CXk2AXg1AXczAXUyCXQxAXMvAXIuAXEsCXArAW8qAm0oCW8qAXArAXEsAXIuCXMvAXQxAXUyAXczCXg1AXk2AXo4AXs5CXw7AX48AX89AYA/CYFAAYJCAYNDAYRECYZGAYdGAYlGAYtGCYxGAY5GAZBGAZFGCZNGAZVGAZZGAZhGCZpGAZtGAZ1GAZ5GCaBGAaJGAaNGAaVGCadGAahGAapGAaxGG61GAaxEAapCAag/AaY9AaU7AaM5AaE3AaA1AZ4zAZwxAZovAZksAZcqJZUoAZQqAZMrCZIsAZAuAY8vAY4xCY0yAYwzAYs1AYo2CYg4AYc5AYY7AYU8CYQ9AYI9AYA9AX89CX09AXs9AXo9AXg9CXc9AXU9AXM9AXI9CXA9AW49AW09AWs9CWk9AWg9AWY9AWQ9CWM9AWE9AV89AV49CVw9AVo9AVk9";

const CUTTER_COMBAT_TRACE_PART_18 = "AVc9CVU9AVQ9AVI9AVA9CU89AU09AUs9AUo9CUg9AUY9AUU9AUM9CUI9AUA9AT49AT09CTs9Gzk9ATs7AT05AT43AUA1AUIzAUQxAUUvAUcsAUkqJ0soAUkoAUcoAUYoCUQoAUIoAUEoAT8oCT0oATwoATooATgoCTcoATUoATMoATIoCTAoATAqATAsATAuCTAwATAyATA0ATA2CTA4ATA6ATA8ATA+CTBAATBCATBEATBGCTBIATBGATBEATBCCTBAATA+ATA8ATA6CTA4ATA6ATA8ATA+CTBAATBCATBEATBGCTBIAS5IAS1IAStICSlIAShIASZIASRICSNIASFIAiBICSFIASNIGyRIASZGAShEASpCAStAAS0+AS88ATE5ATI3ATQ1ATYzATgxATkvATstAT0rJT8pAUApAUIpAUMpCUUpAUcpAUgpAUopCUwpAU0pAU8pAVEpCVIpAVQpAVYpAVcpCVkpAVspAVwpAV4pCWAp";

const CUTTER_COMBAT_TRACE_PART_19 = "AWEpAWMpAWUpCWYpAWgpAWopAWspCW0pAW8pAXApAXIpCXQpAXQrAXQtAXQvCXQxAXQzAXQ1AXQ3CXQ5AXQ7AXQ9AXQ/CXRBAXRDAXRFAXRHCXRJAXRLAXRNAXRPCXRRAXRTAXRVAXRXCXRZAXRbAXRdAXRfInRhAXVeAXdcAXlaAXpYAXxWAX5UAYBSAYFQAYNOAYVMAYdJAYhHAYpFAYxDAY5BAY8/AZE9AZM7AZQ5AZY2AZg0AZoyAZswAZ0uAZ8sAaEqKKIoAaEoAZ8oAZ0oCZwoAZooAZgoAZcoCZUoAZMoAZIoAZAoCY4oAY0oAYsoAYkoCYgoAYYoAYUoAYMoCYEoAYAoAX4oAXwoCXsoAXwoAX4oAYAoCYEoAYMoAYUoAYYoCYgoAYgqAYgsAYguCYgwAYgyAYg0AYg2CYg4AYk4AYs4AY04CY44AZA4AZI4AZM4CZU4AZc4AZg4AZo4CZw4AZ04AZ84AaE4H6I4AaE2AZ8z";

const CUTTER_COMBAT_TRACE_PART_20 = "AZ0xAZsvAZotAZgrUZYpAZUqAZQsCZMtAZIvAZAwAY8xCY4zAY00AYw2AYs3CYk4AYg6AYc7AYY9CYU+AYc+AYg+AYo+CYs+AY0+AY8+AZA+CZI+AZQ+AZU+AZc+CZk+AZo+AZw+AZ4+CZ8+AaE+AaM+AaQ+CaY+Aag+Aak+Aas+Ca0+Aa4+AbA+AbI+CbM+AbU+Abc+Abg+I7o+Abg8AbY6AbU4AbM2AbEzAa8xAa4vAawtAaorZKkpAaopAawpAa0pCa8pAbEpAbIpAbQpCbYpAbcpAbkpAbspCbwpAb4pAcApAcEpCcMpAcUpAcYpAcgpCcopAcspAc0pAc8pCdApAdIpAdQpAdUpCdcpAdkpAdopAdwpCd4pAd4rAd4tAd4vCd4xAd4zAd41Ad43Cd45G985Ad03Adw1AdozAdgwAdYuAdUsAdMqe9EoAdMoAdUoAdYoCdgoAdooAdsoAd0oCt8oAd0oAdsoCdooAdgoAdYoAdUo";

const CUTTER_COMBAT_TRACE_PART_21 = "CdMoAdEoAdAoAc4oCcwoAcsoAckoAccoCcYoAcQoAcIoAcEoCb8oAb0oAbwoAbooCbgoAbcoAbUoAbMoSbIoAbAoAa8oAa0oCasoAaooAagoAaYoCqUoAaMpAaIrCaEsAaAuAZ8vAZ4wCZwyAZszAZo1AZk2CZg3AZc5AZY6AZQ8CZM9AZI9AZA9AY49CY09AYs9AYk9AYg9CYY9AYQ9AYM9AYE9CX89AX49AXw9AXo9CXk9AXo/AXtAAXxBCX1DAX9EAYBGAYFHCYJIAYNKAYRLAYVNCYdOAYhPAYlRAYpSCYtUAYxVAY5WAY9YCZBZAZFbAZJcAZNdG5RfAZNdAZFbAY9ZAY5WAYxUAYpSAYhQAYdOAYVMAYNKAYFIAYBGAX5DAXxBAXo/AXk9AXc7AXU5AXQ3AXI1AXAzAW4wAW0uAWssAWkqJWcoAWYoAWQoAWIoCWEoAV8oAV0oAVwoCVooAVgoAVcoAVUoCVQoAVIoAVAoAU8o";

const CUTTER_COMBAT_TRACE_PART_22 = "CU0oAUsoAUooAUgoCUYoAUUoAUMoAUEoCUAoAT4pAT0rATwsCTsuATovATkwATgyCTYzATU1ATQ2ATM3CTI5ATE6AS88AS49CS0/ASxAAStBASpDCSlEASdGASZHASVICSRKASRMASROASRQCSRSASRUASRWASRYIyRaASZYASdWASlTAStRAS1PAS5NATBLATJJATNHATVFATdDATlAATo+ATw8AT46AUA4AUE2AUM0AUUyAUcwAUgtAUorNEwpAUwrAUwtAUwvCUwxAUwzAUw1AUw3CUw5AUw7AUw9AUw/CUxBAUxDAUxFAUxHCUxJAUxLAUxNAUxPCUxRAUxTAUxVAUxXCUxZAUxbAUxdAUxfCUxhAUxjAUxlAUxnCUxpAUxrAUxtAUxvCUxxAUxzAUx1AUx3CUx5AUp5AUh5AUd5CUV5AUN5AUJ5AUB5CT95AT15ATt5ATp5Izh5ATp3ATt1AT1zAT9xAUFvAUJtAURqAUZoAUhm";

const CUTTER_COMBAT_TRACE_PART_23 = "AUlkAUtiAU1gAU5eAVBcAVJaAVRXAVVVAVdTAVlRAVtPAVxNAV5LAWBJAWJHAWNFAWVCAWdAAWg+AWo8AWw6AW44AW82AXE0AXMyAXUvAXYtAXgrQXopAnsoAXopCXkqAXcsAXYtAXUvCXQwAXMyAXIzAXE0CW82AW43AW05AWw6CWs7AWw7AW47AXA7CXE7AXM7AXU7AXY7CXg7AXo7AXs7AX07CX87AYA7AYI7AYQ7CYU7AYc7AYk7AYo7CYw7AY47AY87AZE7CZM7AZQ7AZY7AZc7H5k7AZc5AZY3AZQ1AZIzAZAxAY8vAY0tAYsqLIooAYsoAY0oAY8oCZAoAZIoAZMoAZUoCZcoAZgoAZooAZwoCZ0oAZ8oAaEoAaIoCaQoAaYoAacoAakoCasoAawoAa4oAbAoCbEoAbAoAa4oAawoCasoAakoAacoAaYoCaQoAaIoAaEoAZ8oCZ0oAZwoAZooAZgoCpcoAZcqAZcsCZcuAZcw";

const CUTTER_COMBAT_TRACE_PART_24 = "AZcyAZc0CZc2AZU2AZM2AZI2CZA2AY82AY02AYs2CYo2AYo4AYo6AYo8IYo+AYg8AYY6AYQ4AYM2AYE0AX8yAX0wAXwuAXorMXgp";

const CUTTER_COMBAT_TRACE_LONG_NES = decodeCoordinateRuns(CUTTER_COMBAT_TRACE_PART_0 + CUTTER_COMBAT_TRACE_PART_1 + CUTTER_COMBAT_TRACE_PART_2 + CUTTER_COMBAT_TRACE_PART_3 + CUTTER_COMBAT_TRACE_PART_4 + CUTTER_COMBAT_TRACE_PART_5 + CUTTER_COMBAT_TRACE_PART_6 + CUTTER_COMBAT_TRACE_PART_7 + CUTTER_COMBAT_TRACE_PART_8 + CUTTER_COMBAT_TRACE_PART_9 + CUTTER_COMBAT_TRACE_PART_10 + CUTTER_COMBAT_TRACE_PART_11 + CUTTER_COMBAT_TRACE_PART_12 + CUTTER_COMBAT_TRACE_PART_13 + CUTTER_COMBAT_TRACE_PART_14 + CUTTER_COMBAT_TRACE_PART_15 + CUTTER_COMBAT_TRACE_PART_16 + CUTTER_COMBAT_TRACE_PART_17 + CUTTER_COMBAT_TRACE_PART_18 + CUTTER_COMBAT_TRACE_PART_19 + CUTTER_COMBAT_TRACE_PART_20 + CUTTER_COMBAT_TRACE_PART_21 + CUTTER_COMBAT_TRACE_PART_22 + CUTTER_COMBAT_TRACE_PART_23 + CUTTER_COMBAT_TRACE_PART_24);

function cutterCombatPosition(age: number, entryX = 144 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE - CUTTER_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 144;
  const combatFrame = Math.round(frame);
  const traced = combatFrame < CUTTER_COMBAT_TRACE_NES.length
    ? CUTTER_COMBAT_TRACE_NES[combatFrame]
    : CUTTER_COMBAT_TRACE_LONG_NES[Math.min(combatFrame - CUTTER_COMBAT_TRACE_NES.length, CUTTER_COMBAT_TRACE_LONG_NES.length - 1)];
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
export const DEVIL_HAWK_ATTACK_EVENTS = [
  [174, true], [381, true], [505, true], [610, false], [910, true],
  [1015, false], [1109, true], [1214, false], [1307, true], [1412, false],
  [1506, true], [1695, false], [1769, false], [1843, false], [1936, true],
  [2041, false], [2115, false], [2207, true], [2311, false], [2543, false],
  [2615, true], [2722, true], [2845, true], [2968, true], [3092, true],
  [3198, false], [3272, false], [3431, false], [3524, true], [3630, false],
] as const;
export const DEVIL_HAWK_ATTACK_FRAMES = DEVIL_HAWK_ATTACK_EVENTS.map(([frame]) => frame);
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

export function devilHawkFullFanAt(age: number): boolean | undefined {
  const frame = Math.round(age * NES_FRAME_RATE);
  return DEVIL_HAWK_ATTACK_EVENTS.find(([at]) => at === frame)?.[1];
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

const DEVIL_HAWK_COMBAT_TRACE_PART_0 = "AXo/CXo9AXo7AXo5AXo3I3o1AXozAXoxG3ovAXowAXoxAXgyAXUzAXU4AXU9AXY8AXc7AXc6AXc5AXc4BXc3AXc4AXc5AXc6AXc7AXc+AXdBAXdEAXdHAXdLAXdPAXdTAXdXAXdcAXdhAXdmHXdrCXdtAXlsAXpqAXtpCXxoAX1mAX5lAX9jCYFiAYJhAYNfAYReHoVcAYVXAYVSAYVNAYVIAYVEAYVAAYU8AYU4AYU1AYUyAYUvAYUsAYUrAYUqAYUpBYUoAYUpAYUqAYUrOYUsAYUtAYUuAYMvAYEwAYE1AYE6AYI5AYM5AYM4AYM3AYM2BYM1AYM2AYM3AYM4AYM5AYM8AYM/AYNCAYNFAYNJAYNNAYNRAYNVAYNaAYNfAYNkIINpAYNrAYNtAYNvCYNxAYNzAYN1AYN3CYN5AYN7AYN9AYN/CYOBAYODAYOFAYOHIoOJAYOLAYONAYOPGoORAYOOAYOLAYCHAX6EAX6FAX6GAX+B";

const DEVIL_HAWK_COMBAT_TRACE_PART_1 = "AYB9AYB4AYBzAYBuAYBpAYBlAYBhAYBdAYBZAYBWAYBTAYBQAYBNAYBMAYBLAYBKBYBJAYBKAYBLAYBMI4BNAYBLAYBJAYBHCYBFAYBDAYBBAYA/CYA9AYI9AYM9AYU9IoY9AYg9AYo9AYs9CY09AYw+AYs/AYpBCYhCAYdEAYZFAYVGCYRIAYNJAYJLAYBMCX9OAX5PAX1QAXxSCXtTAXlVAXhWAXdXCXZZAXVaAXRcAXNdCXFeAXFcAXFaAXFYI3FWAXFUAXFSAXFQCXFOAXFMAXFKAXFICXFGAXFEAXFCAXFACXE+AXFAAXFCAXFEJHFGAXFIAXFKAXFMCXFOAXNNAXRMAXVKCXZJAXdHAXhGAXlFCXtDAXxCAX1AAX4/I38+AYA8AYI7AYM5CYQ4AYU2AYY1AYc0CYgyAYoxHIsvAYowAYoxAYgyAYUzAYU4AYQ9AYU8AYY7AYU6AYU5AYU4A4Q3AoM3AYM4AYI5AoI6AYI9AYFA";

const DEVIL_HAWK_COMBAT_TRACE_PART_2 = "AYFDAYFGAYBKAYBOAYBSAX9WAX9bAX9gAX5lHH5qAX5sCX1uAX1wAX1yG310CXx1AXx3AXx5AXt7CXt9AXl9AXh9AXZ9CXR9AXN9AXF9AW99CW59AWx9AWp9G2l9AWl4AWlzAWluAWlpAWllAWlhAWldAWlZAWlWAWlTAWlQAWlNAWlMAWlLAWlKBWlJAWlKAWlLAWlMHGlNCWlLAWlJAWlHAWlFCWlDAWpDAWxDAW5DCW9DAXFDAXNDAXRDCXZDAXVFG3RGAXRDAXRAAXQ9AXQ6AXQ4AXQ2AXQ0AXQyAXQxAXQwAXQvAXQuAXQvAXQwAXQxAXQyAXQ0AXQ2AXQ4AXQ6AXQ9AXRAAXRDe3RGAXJGAXBGAW9GCW1GAWtGAWpGAWhGCWZGG2VGAWNGAWFGCWBGAV5GAVxGAVtGCVlGAVhGAVZGAVRGCVNGAVFGAU9GAU5GCUxGG0xEAUxCAUxACUw+AUw8AUw6AUw4CUw2AUw0AUwyAUww";

const DEVIL_HAWK_COMBAT_TRACE_PART_3 = "HEwuAU0uAU4vAU0vAUwvAU00AU44AVA3AVI1AVQ0AVUyAVYxAVcvAVguAVkuAVstAVwtAV0tAV4tAV8uAWAuAWIxAWMzAWQ2AWU4AWY7AWc/AWhCAWpGAWtKAWxOAW1TI25XAW9ZAXFaAXJbI3NdAXNYAXNTAXNOAXNJAXNFAXNBAXM9AXM5AXM2AXMzAXMwAXMtAXMsAXMrAXMqBXMpAXMqAXMrAXMsHHMtHHMrAXMsAXMtAXItAXAuAXAzAXA4AXE3AXM2AXM1AXM0AXQzAnQyA3UyAXUzAXY0AXY1AXY2AXc5AXc8AXc/AXhCAXhGAXhJAXlNAXlRAXlWAXpbAXpgHHplAXpnAXtpCXtrAXttAXxvAXxxCXxzAX11AX13AX15CX57AX58AX5+AX+AIn+CAX+EAX+GAYCICYCKAYCMAYGOG4GQAYGNAYGKAX+HAXyEAXyFAXyGAX2BAX58AX53AX5yAX5tAX5oAX5kAX5gAX5cAX5Y";

const DEVIL_HAWK_COMBAT_TRACE_PART_4 = "AX5VAX5SAX5PAX5MAX5LAX5KAX5JBX5IAX5JAX5KAX5LHH5MCX5KAX1JAXxHAXtGCXpEAXlDAXdCAXZAInU/AXQ9AXM8AXI7CXA5AW84AW42AW01CWw0AWsyAWoxG2gvAWkwAWoxAWgyAWYyAWc3AWg8AWk7AWs6AWs5AWw4AW03AW02Am41AW81AXA1AXA2AXE3AnI4AXM7AXM+AXRBAXVEAXVIAXZMAXdPAXdTAXhYAXhdAXliHHpnCXppAXtqAXxsAXxuJH1wAX5xAX9zAYB0CYF2AYN3AYR4AYV6CYZ7AYd9AYh+AYp/CYuBAYyCAY2EAY6FJI+GAZCIAZKJAZOLCZSMAZWNAZaPG5eQAZeNAZaLAZOIAZCFAZCGAY+HAY+CAZB+AY95AY50AY5vAY1qAY1mAYxiAYtfAYtbAYpYAYlVAYlSAYhPAYhOAYdOAYZNAYZMAYVMAoRMAYNNAYNOAYJPAYFQHIFRCYBPAYBRAYBTAYBV";

const DEVIL_HAWK_COMBAT_TRACE_PART_5 = "CYBXAYBZAYBbAYBdI4BfAX9hAX5iAX1jCXtlAXpmAXloAXhpCXdrAXZsAXVtAXNvCXJwAXFyAXBzAW90Im52AWx3AWt5AWp6CWl7AWh9AWd+AWWACWSBAWWCAWeEAWiFCWmHAWqIAWuJAWyLIm6MAW+OAXCPG3GQAXGOAXKLAXCHAW6EAW6FAW6GAXCCAXF9AXF4AXFzAXJuAXJpAXJlAXNhAXNdAXNZAXRXAXRUAXRRAXVOAXVNAXVMAXZLA3ZKAndKAXdLAXhMAXhNG3hOCXlMAXlKAXlJAXpHCXpFAXpDAXtBAXs/CXs9AXs7AXw5AXw3JHw1AXs2AXo4AXk5CXg7AXc8AXU9AXQ/CXNAAXJCAXFDAXBFCW9GAW1HAWxJAWtKI2pMAWlNAWhOAWZQCWVRAWRTAWNUAWJVCWFXAWBYAV5aAV1bCVxcAVteAVpfAVlhI1diAVZhAVVfAVReCVNcAVJbAVBaAU9YCU5XAU1VAUxUAUtT";

const DEVIL_HAWK_COMBAT_TRACE_PART_6 = "CUpRAUhQAUdOAUZNI0VMAURKAUNJAUFHCUBGAT9FAT5DAT1CCTxAAT1CAT5DAT9FCUBGAUFHAUNJAURKHEVMAUVJAUVGAUVDAUVAAUU+AUU8AUU6AUU4AUU3AUU2AUU1AUU0AUU1AUU2AUU3AUU4AUU6AUU8AUU+AUVAAUVDAUVGAUVJa0VMAURNAUNOAUFQCUBRAT9TAT5UAT1VCTxXATtYATlaAThbCTdcATZeATVfATRhHDJiATJdATJYATJTATJOATJKATJGATJCATI+ATI7ATI4ATI1ATIyATIxATIwATIvBTIuATIvATIwATIxIjIyATIwHDIuATQuATUuATQuATMuATUyATY2ATg1ATszATwxAT0vAT8uAUAsAUErAUMqAUQpAUUoAUcoAUgoAUopAUspAUwrAU4tAU8vAVAxAVI0AVM3AVQ7AVY+AVdCAVlGAVpKHVtOAV1PCV5QAV9SAWFTAWJUCWNVAWVVAWdVAWhVCWpV";

const DEVIL_HAWK_COMBAT_TRACE_PART_7 = "AWxVAW1VG29VAW9SAW9PAW9MAW9JAW9HAW9FAW9DAW9BAW9AAW8/AW8+AW89AW8+AW8/AW9AAW9BAW9DAW9FAW9HAW9JAW9MAW9PAW9SPW9VAW5WAW1YAWxZCWpbAWlcAWhdAWdfCWZgAWViAWNjAWJkCWFmAWBnAV9pAV5qCVxrAVttAVpuAVlwCVhxAVdyHFZ0AVZvAVZqAVZlAVZgAVZcAVZYAVZUAVZQAVZNAVZKAVZHAVZEAVZDAVZCAVZBBVZAAVZBAVZCAVZDHVZEAVZCCVZAAVY+AVY8AVY6CVY4AVY2AVY0AVYyCVYwHFQuAVYvAVcvAVYvAVQwAVY0AVc5AVk3AVs2AVw0AV0zAV4xAWAvAWEvAWIuAWMuAWQtAWUtAWYuAWguAWkvAWoxAWszAWw2AW04AW88AXA/AXFDAXJGAXNKAXRPAXZTHHdYAXhZAXlaCXpcAXtdAXxfAX5gCX9hAYBjAYFkAYJmCYNnAYVoAYZq";

const DEVIL_HAWK_COMBAT_TRACE_PART_8 = "AYdrCYhtAYluAYpvAYtxJI1yAY50AY91AZB2CZF4AZJ2AZR1AZV0CZZyAZdxAZhvAZluCZttAZxrAZ1qAZ5oI59nAZ9iAZ9dAZ9YAZ9TAZ9PAZ9LAZ9HAZ9DAZ9AAZ89AZ86AZ83AZ82AZ81AZ80BZ8zAZ80AZ81AZ82HZ83AZ81AZ8zAZ8xHJ8vAZ4wAZ0wAZoxAZcxAZY2AZU7AZU5AZU4AZQ3AZM2AZI0ApEzAZAyAY8yAY4yAY0yAYwzAYs0AYo0AYk3AYg6AYc8AYc/AYZDAYVGAYRKAYNNAYJSAYFXAYBbJH9gAX5iAX1jAXxlCXxnAXtoAXpqAXlsCXhtAXlvAXpwAXtyIX1zAX1uAX1pAX1kAX1fAX1bAX1XAX1TAX1PAX1MAX1JAX1GAX1DAX1CAX1BAX1ABX0/AX1AAX1BAX1CHn1DAX1BAX0/AX09CX07AX05AX03AX01CX0zAX0xG30vAX0wAX0xAXoyAXgzAXg4AXg9";

const DEVIL_HAWK_COMBAT_TRACE_PART_9 = "AXk8AXo7AXo6AXo5AXo4BXo3AXo4AXo5AXo6AXo7AXo+AXpBAXpEAXpHAXpLAXpPAXpTAXpXAXpcAXphAXpmHHprAXptCXpvAXpxAXpzAXp1H3p3AXpyAXptAXpoAXpjAXpfAXpbAXpXAXpTAXpQAXpNAXpKAXpHAXpGAXpFAXpEBXpDAXpEAXpFAXpGIHpHAXpFAXpDAXpBCXo/AXo9AXo7AXo5CXo3AXo1AXozAXoxG3ovAXowAXoxAXgyAXUzAXU4AXU9AXY8AXc7AXc6AXc5AXc4BXc3AXc4AXc5AXc6AXc7AXc+AXdBAXdEAXdHAXdLAXdPAXdTAXdXAXdcAXdhAXdmJXdrAXdpAXdnAXdlJHdjAXdhAXdfAXddCXdbAXVbAXRbAXJbCXFbAW9bAW1bAWxbCWpbAWtaAWxYAW1XI29WAXBUAXFTAXJRCXNQAXRPAXVNAXdMCXhKAXlJAXpIAXtGCXxFAX5DAX9CAYBAI4E/AYI+";

const DEVIL_HAWK_COMBAT_TRACE_PART_10 = "AYM8AYQ7CYY5AYc5AYk5AYs5CYw5AY45AZA5AZE5CZM5AZU5AZY5AZg5HZo5AZo2AZozAZowAZotAZorAZopAZonAZolAZokAZojAZoiAZohAZoiAZojAZokAZolAZonAZopAZorAZotAZowAZozAZo2Lpo5AZo3AZo1AZozCZoxG5ovAZkwAZgxAZUyAZIzAZI3AZE8AZE7AZI6AZE5AZE4AZA3Ao82AY41Ao01AYw2AYw3AYs4AYo5AYo7AYk+AYhBAYhEAYdIAYdMAYZQAYVTAYVYAYRdAYNiHYNnAYJpAYJqCYFsAYBuAYBwAX9yG350AX5vAX5qAX5lAX5gAX5cAX5YAX5UAX5QAX5NAX5KAX5HAX5EAX5DAX5CAX5BBX5AAX5BAX5CAX5DJH5EAX5CAX5AAX4+CX48AX09AXw/AXtACXpBAXlDAXdEAXZGCXVHAXRIAXNKGnJLCXFNAW9OAW5PAW1RCWxSAWtUAWpVAWhWCWdY";

const DEVIL_HAWK_COMBAT_TRACE_PART_11 = "AWZZAWVbAWRcCWNeAWNcAWNaG2NYCWNWAWNUAWNSAWNQCWNOAWFOAV9OAV5OCVxOAVpOAVlOAVdOCVVOAVdMAVhLG1lJCVpIAVtGAVxFAV5ECV9CAWBBAWE/AWI+CWM9AWQ7AWY6AWc4CWg3AWk2AWo0HGszAWswAWstAWsqAWsnAWslAWsjAWshAWsfAWseAWsdAWscAWsbAWscAWsdAWseAWsfAWshAWsjAWslAWsnAWsqAWstAWswMWszAW0xAW4wG28vAm8wAW4xAWwyAWw3AWw8AW07AW86AW85AW84AXA3AnA2A3E2AXE3AXI4AXI5AXI6AXM9AXM/AXNCAXRFAXRJAXRNAXVRAXVVAXVaAXZfAXZkHXZpCXZrAXdtAXdvAXdxCXhzG3h1AXh3AXl4CXl6AXl8AXp+AXqACXqCAXuEAXuGAXuICXuKAXyMAXyOHHyQAXyNAXyKAXqHAXiDAXiEAXiFAXmBAXp8AXp3AXpyAXpt";

const DEVIL_HAWK_COMBAT_TRACE_PART_12 = "AXpoAXpkAXpgAXpcAXpYAXpVAXpSAXpPAXpMAXpLAXpKAXpJBXpIAXpJAXpKAXpLHXpMI3pKAXpIAXpGAXpECXpCAXpAAXo+AXo8CXo6AXs6AX06AX86CYA6AYI6AYQ6AYU6JIc6AYc3AYc0AYcxAYcuAYcsAYcqAYcoAYcmAYclAYckAYcjAYciAYcjAYckAYclAYcmAYcoAYcqAYcsAYcuAYcxAYc0AYc3NYc6AYc4AYc2AYc0CYcyAYcwG4cuAYcvAYYwAYQxAYExAYE2AYE7AYE6AYI6AYE5AYE3AYE2AYE1A4A1AX81AX82AX83AX44AX45AX48AX0/AX1CAX1FAXxJAXxNAXxRAXxUAXtZAXteAXtjHHpoAXpqIXpsAXpnAXpiAXpdAXpYAXpUAXpQAXpMAXpIAXpFAXpCAXo/AXo8AXo7AXo6AXo5BXo4AXo5AXo6AXo7Hno8AXo6AXo4AXo2CXo0AXoyAXowG3ouAXovAXow";

const DEVIL_HAWK_COMBAT_TRACE_PART_13 = "AXcxAXUyAXU3AXU8AXY7AXc6AXc5AXc4AXc3BXc2AXc3AXc4AXc5AXc6AXc9AXdAAXdDAXdGAXdKAXdOAXdSAXdWAXdbAXdgAXdlHHdqCXdsAXhuAXlvAXpwCXxyAX1zAX51AX92I4B4AYF5AYN6AYR8CYV9AYZ/AYeAAYiBCYmDAYuEAYyGAY2HCY6IAY+KAZCLAZKNCZOOAZSPHJWRAZSOAZSLAZGIAY6FAY2GAY2HAY2DAY1+AY15AYx0AYtwAYtrAYpnAYpjAYlfAYhbAYhYAYdWAYZTAYZQAYVPAYVOAYRNAYNMAYNNAYJNAoFNAYBOAYBPAX9RHH5SAX5QCX1OAXxMAXxKAXtICXtHAXlHAXdHAXZHCXRHAXJHAXFHAW9HHm1HAW1EAW1BAW0+AW07AW05AW03AW01AW0zAW0yAW0xAW0wAW0vAW0wAW0xAW0yAW0zAW01AW03AW05AW07AW0+AW1BAW1EIW1HAW1FAW1DAW1B";

const DEVIL_HAWK_COMBAT_TRACE_PART_14 = "CW0/AW09AW07AW05CW03AW01AW0zAW0xG20vAW4vAW8wAW0xAWsyAWw2AW07AW46AXA5AXA4AXE3AXI2AXI1AnM1AXQ0AXU0AXU1AXY2AXc3AXc4AXg7AXg9AXlAAXpDAXpHAXtLAXxPAXxTAX1XAX1cAX5hJH9mAX9oAYBqAYFrIoFtAYBvAX9wAX5yCX1zAXt0AXp2AXl3CXh5AXd6AXZ7AXR9CXN+AXKAAXGBAXCCJG+EAW2FAWyHAWuICWqJAWmLAWiMAWeOCWWPGmSQAWWOAWWLAWSIAWKFAWOGAWOHAWWCAWd+AWd5AWh0AWhvAWlqAWpnAWpjAWtfAWxbAWxYAW1VAW1SAW5QAW9PAW9OAXBNAnFMAXJMAXJNAXNNAXROAXRPAXVQHHZRAXZPAXdOCXdMAXhKAXlIAXlGJHpEAXxEAX1EAX9ECYFEAYJEAYREAYZECYdEAYlEAYpEAYxECY5EAY9EAZFEAZNEI5REAZZDAZdC";

const DEVIL_HAWK_COMBAT_TRACE_PART_15 = "AZhACZk/AZo9AZs8AZ07CZ45AZ84AaA2AaE1CaI0AaMyAaUxG6YvAaUwAaQxAaExAZ4yAZ02AZw7AZw6AZw5AZs3AZo2AZk1AZgzAZczAZYzAZUyAZQyAZQzAZMzAZI0AZE1AZA3AY86AY48AY0/AYxDAYtGAYpKAYlOAYlSAYhXAYdcHIZgAYZbAYZWAYZRAYZMAYZIAYZEAYZAAYY8AYY5AYY2AYYzAYYwAYYvAYYuAYYtBYYsAYYtAYYuAYYvHIYwG4YuAYYvAYYwAYQxAYEyAYE3AYE8AYI7AYM6AYM5AYM4AYM3BYM2AYM3AYM4AYM5AYM6AYM9AYNAAYNDAYNGAYNKAYNOAYNSAYNWAYNbAYNgAYNlJINqAYNsAYNuAYNwCYNyAYN0AYN2AYN4CYN6AYN8AYN+AYOACYOCG4OEAYN/AYN6AYN1AYNwAYNsAYNoAYNkAYNgAYNdAYNaAYNXAYNUAYNTAYNSAYNRBYNQAYNRAYNS";

const DEVIL_HAWK_COMBAT_TRACE_PART_16 = "AYNTG4NUAYNSAYNQCYNOAYRQAYVRAYdTCYhUAYlWAYpXAYtYCYxaAY5bAY9dAZBeI5FfAZJhAZNiAZRkCZZlAZdmAZhoAZlpCZprAZtsAZ1tAZ5vCZ9wAaByAaFzAaJ0CaN2AaV3AaZ5Aad6Cah7Aal6Aap5Aax3Ca12Aa50Aa9zAbByCbFwAbNvAbRtAbVsI7ZrAbdpAbhoAblmCbtlAbxkAb1iAb5hCb9fAcBeAcJdAcNbCcRaAcVYAcZXAcdWI8hUAcpTActRAcxQCc1OActOAcpOAchOCcZOAcVOAcNOAcJOCcBOAcJOAcNOAcVOI8ZOAchOAcpOActOCc1OAc9OAdBOAdJOCdROAdVOAddOAdlOCdpOAdxQAd1RAd5TI99UAd9RAd9OAd9LAd9IAd9GAd9EAd9CAd9AAd8/Ad8+Ad89Ad88Ad89Ad8+Ad8/Ad9AAd9CAd9EAd9GAd9IAd9LAd9OAd9Rct9UG+BTAd9SAd1RAdlR";

const DEVIL_HAWK_COMBAT_TRACE_PART_17 = "AdVQAdNTAdJXAdFUAdBSAc9PAc1NAcxKAcpHAchGAcdEAcVCAcNBAcJAAcBAAb8/Ab0+AbtAAbpBAbhCAbZEAbVGAbNJAbJLAbBNAa5RAa1UAatXG6lbAahbAaZcCaVcAaNcAaFdAaBdCZ5dAZxeAZteAZlfCZhfAZZfAZRgAZNgCZFgAY9hAY5hAYxiCYtiAYliAYdjAYZjCYRjAYNlAYJmAYFoIX9pAX9kAX9fAX9aAX9VAX9RAX9NAX9JAX9FAX9CAX8/AX88AX85AX84AX83AX82BX81AX82AX83AX84H385AX83AX81AX8zCX8xGn8vAX8wAX8xAX0yAXszAXs4AXs9AXw8AX07AX06AX05AX04BX03AX04AX05AX06AX07AX0+AX1BAX1EAX1HAX1LAX1PAX1TAX1XAX1cAX1hAX1mHH1rAX1tAX1vCX1xAX1zAX11AX13CX15AX17AX19AX1/In2BAX2DAX2FAX2HCX2JAX2L";

const DEVIL_HAWK_COMBAT_TRACE_PART_18 = "AX2NAX2PG32RAX2OAX2LAXqIAXiFAXiGAXiHAXmCAXp9AXp4AXpzAXpuAXppAXplAXphAXpdAXpZAXpWAXpTAXpQAXpNAXpMAXpLAXpKBXpJAXpKAXpLAXpMI3pNAXpLAXpJAXpHCXpFAXxFAX1FAX9FI4FFAYJFAYRFAYZFCYdFAYlFAYtFAYxFAY5F";

const DEVIL_HAWK_COMBAT_TRACE_LONG_NES = decodeCoordinateRuns(DEVIL_HAWK_COMBAT_TRACE_PART_0 + DEVIL_HAWK_COMBAT_TRACE_PART_1 + DEVIL_HAWK_COMBAT_TRACE_PART_2 + DEVIL_HAWK_COMBAT_TRACE_PART_3 + DEVIL_HAWK_COMBAT_TRACE_PART_4 + DEVIL_HAWK_COMBAT_TRACE_PART_5 + DEVIL_HAWK_COMBAT_TRACE_PART_6 + DEVIL_HAWK_COMBAT_TRACE_PART_7 + DEVIL_HAWK_COMBAT_TRACE_PART_8 + DEVIL_HAWK_COMBAT_TRACE_PART_9 + DEVIL_HAWK_COMBAT_TRACE_PART_10 + DEVIL_HAWK_COMBAT_TRACE_PART_11 + DEVIL_HAWK_COMBAT_TRACE_PART_12 + DEVIL_HAWK_COMBAT_TRACE_PART_13 + DEVIL_HAWK_COMBAT_TRACE_PART_14 + DEVIL_HAWK_COMBAT_TRACE_PART_15 + DEVIL_HAWK_COMBAT_TRACE_PART_16 + DEVIL_HAWK_COMBAT_TRACE_PART_17 + DEVIL_HAWK_COMBAT_TRACE_PART_18);

export function devilHawkCombatY(age: number): number {
  const frame = Math.max(0, age * NES_FRAME_RATE - DEVIL_HAWK_ENTRY_DURATION * NES_FRAME_RATE);
  const combatFrame = Math.round(frame);
  const traced = combatFrame < DEVIL_HAWK_COMBAT_TRACE_NES.length
    ? DEVIL_HAWK_COMBAT_TRACE_NES[combatFrame]
    : DEVIL_HAWK_COMBAT_TRACE_LONG_NES[Math.min(combatFrame - DEVIL_HAWK_COMBAT_TRACE_NES.length, DEVIL_HAWK_COMBAT_TRACE_LONG_NES.length - 1)];
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
  const combatFrame = Math.round(frame);
  const traced = combatFrame < DEVIL_HAWK_COMBAT_TRACE_NES.length
    ? DEVIL_HAWK_COMBAT_TRACE_NES[combatFrame]
    : DEVIL_HAWK_COMBAT_TRACE_LONG_NES[Math.min(combatFrame - DEVIL_HAWK_COMBAT_TRACE_NES.length, DEVIL_HAWK_COMBAT_TRACE_LONG_NES.length - 1)];
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

export const NINJA_BOSS_FIRST_PREPARE_DELAY = 124 / NES_FRAME_RATE;
export const NINJA_BOSS_REENTRY_PREPARE_DELAY = 196 / NES_FRAME_RATE;
export const NINJA_BOSS_INITIAL_PREPARE_FRAMES = [124, 183] as const;
export const NINJA_BOSS_REENTRY_PREPARE_FRAMES = [196, 376] as const;
export const NINJA_BOSS_PREPARE_DURATION = 40 / NES_FRAME_RATE;
export const NINJA_BOSS_PREPARE_CONTROLLER_DURATION = 7 / NES_FRAME_RATE;
export const NINJA_BOSS_FIRST_ATTACK_DELAY = 163 / NES_FRAME_RATE;
export const NINJA_BOSS_ENTRY_INVULNERABILITY = 44 / NES_FRAME_RATE;
export const NINJA_BOSS_TELEPORT_DELAY = 90 / NES_FRAME_RATE;
export const NINJA_BOSS_FIRST_NATURAL_TELEPORT = 339 / NES_FRAME_RATE;
export const NINJA_BOSS_REPEAT_NATURAL_TELEPORT = 424 / NES_FRAME_RATE;
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

export function fatmanJoeShellHasSplit(age: number): boolean {
  return Math.round(age * NES_FRAME_RATE) >= Math.round(FATMAN_JOE_SHELL_FLIGHT_DURATION * NES_FRAME_RATE);
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
const FATMAN_JOE_COMBAT_PATH_EXTENDED_COMBAT_NES = [
  ...FATMAN_JOE_COMBAT_PATH_NES,
  ...FATMAN_JOE_COMBAT_PATH_EXTENDED_NES.slice(FATMAN_JOE_COMBAT_PATH_NES.length)
    .map(([at, x, y]) => [at - Math.round(FATMAN_JOE_ENTRY_DURATION * NES_FRAME_RATE), x, y] as const)
    .filter(([at]) => at > FATMAN_JOE_COMBAT_PATH_NES.at(-1)![0]),
] as const;
const FATMAN_JOE_COMBAT_TRACE_LONG_NES = decodeCoordinateRuns("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");

function fatmanJoeCombatPosition(age: number, entryX = 152 * NES_WORLD_X_SCALE): readonly [number, number] {
  const frame = Math.max(0, age * NES_FRAME_RATE - FATMAN_JOE_ENTRY_DURATION * NES_FRAME_RATE);
  const laneOffset = entryX / NES_WORLD_X_SCALE - 152;
  const toWorldX = (x: number): number => clamp((x + laneOffset) * NES_WORLD_X_SCALE, ...fatmanJoeArenaXBounds());
  const combatFrame = Math.round(frame);
  const traced = combatFrame < FATMAN_JOE_COMBAT_TRACE_NES.length
    ? FATMAN_JOE_COMBAT_TRACE_NES[combatFrame]
    : FATMAN_JOE_COMBAT_TRACE_LONG_NES[Math.min(combatFrame - FATMAN_JOE_COMBAT_TRACE_NES.length, FATMAN_JOE_COMBAT_TRACE_LONG_NES.length - 1)];
  if (traced) return [toWorldX(traced[0]), traced[1] * NES_WORLD_Y_SCALE];
  const first = FATMAN_JOE_COMBAT_PATH_EXTENDED_COMBAT_NES[0]!;
  const last = FATMAN_JOE_COMBAT_PATH_EXTENDED_COMBAT_NES.at(-1)!;
  // The captured ROM actor enters its wait state at the final sample; it does
  // not replay the route in reverse like the explicitly looping Boss paths.
  const sampledFrame = Math.min(frame, last[0]);
  if (sampledFrame <= first[0]) return [toWorldX(first[1]), first[2] * NES_WORLD_Y_SCALE];
  const nextIndex = FATMAN_JOE_COMBAT_PATH_EXTENDED_COMBAT_NES.findIndex(([at]) => at >= sampledFrame);
  const previous = FATMAN_JOE_COMBAT_PATH_EXTENDED_COMBAT_NES[nextIndex - 1]!;
  const next = FATMAN_JOE_COMBAT_PATH_EXTENDED_COMBAT_NES[nextIndex]!;
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
export const WINGATE_ENTRY_INVULNERABILITY = 185 / NES_FRAME_RATE;
export const WINGATE_SECOND_SPAWN_DELAY = 264 / NES_FRAME_RATE;
export const WINGATE_FINAL_DEFEAT_ANIMATION_DURATION = 9 / NES_FRAME_RATE;
export const WINGATE_FINAL_ENDING_DELAY = 761 / NES_FRAME_RATE;
export const WINGATE_ENDING_INPUT_DELAY = 4_125 / NES_FRAME_RATE;

export function bossDefeatAnimationDuration(stage: number, phase = 0): number {
  return stage === MAX_STAGE && phase > 0 ? WINGATE_FINAL_DEFEAT_ANIMATION_DURATION : BOSS_DEFEAT_ANIMATION_DURATION;
}

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
