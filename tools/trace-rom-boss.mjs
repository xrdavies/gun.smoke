import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Button, Nes } from "lib-jsnes";

const args = process.argv.slice(2);
const filename = args.find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke (USA).nes";
const frames = Number(args.find((argument) => argument.startsWith("--frames="))?.split("=")[1] ?? 18_000);
const bossFramesLimit = Number(args.find((argument) => argument.startsWith("--boss-frames="))?.split("=")[1] ?? (args.includes("--attack") ? 2_400 : 720));
const postBossFramesLimit = Number(args.find((argument) => argument.startsWith("--post-boss-frames="))?.split("=")[1] ?? 0);
const output = args.find((argument) => argument.startsWith("--out="))?.split("=")[1] ?? ".rom-traces/boss.json";
const stateFile = args.find((argument) => argument.startsWith("--state="))?.split("=")[1];
const attack = args.includes("--attack");
const followY = args.includes("--follow-y");
const weapon = args.find((argument) => argument.startsWith("--weapon="))?.split("=")[1] ?? "pistol";
const record = args.includes("--record");
const clearField = args.includes("--clear-field");
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
if (!Number.isInteger(frames) || frames <= 0) throw new Error("--frames must be a positive integer");
if (!Number.isInteger(bossFramesLimit) || bossFramesLimit <= 0) throw new Error("--boss-frames must be a positive integer");
if (!Number.isInteger(postBossFramesLimit) || postBossFramesLimit < 0) throw new Error("--post-boss-frames must be a non-negative integer");
if (stateFile && !fs.existsSync(stateFile)) throw new Error(`State file not found: ${stateFile}`);
if (!new Set(["pistol", "magnum"]).has(weapon)) throw new Error("--weapon must be pistol or magnum");

const romBytes = fs.readFileSync(filename);
const nes = new Nes(romBytes);
nes.reset();
let controllerMask = 0;
const buttonDown = (button) => { controllerMask |= button; nes.setController(1, controllerMask); };
const buttonUp = (button) => { controllerMask &= ~button; nes.setController(1, controllerMask); };
const frame = () => nes.runFrame();
const memory = new Proxy({}, {
  get: (_, property) => property === "slice" ? (start, end) => Uint8Array.from({ length: (end ?? 0x800) - start }, (_, index) => nes.read(start + index)) : nes.read(Number(property)),
  set: (_, property, value) => { nes.write(Number(property), Number(value)); return true; },
});
if (stateFile) throw new Error("--state requires a lib-jsnes state export; start a fresh trace without --state");
let mapperBank = 0;
const mapperWrite = nes.cartridge.writeCpu.bind(nes.cartridge);
nes.cartridge.writeCpu = (address, value, consecutive) => {
  if (address >= 0x8000) mapperBank = value % Math.max(1, nes.rom.prgRom.length / 0x4000);
  return mapperWrite(address, value, consecutive);
};

if (!stateFile) {
  for (let tick = 0; tick < 180; tick += 1) frame();
  buttonDown(Button.Start);
  for (let tick = 0; tick < 5; tick += 1) frame();
  buttonUp(Button.Start);
  for (let tick = 0; tick < 650; tick += 1) frame();
  buttonDown(Button.A);
  buttonDown(Button.B);
}

const bossChanges = [];
const bossFrames = [];
const projectileEvents = [];
const projectileFrames = [];
const postBossFrames = [];
let bossStart = stateFile ? 0 : undefined;
let bossReleaseFrame;
let bossRoundIndex;
let previousBoss;
const previousProjectiles = new Map();
const roundState = () => ({
  roundIndex: memory[0x41],
  mapPointer: (memory[0x5a] ?? 0) | ((memory[0x5b] ?? 0) << 8),
  mapEnd: (memory[0x5e] ?? 0) | ((memory[0x5f] ?? 0) << 8),
  mapPage: memory[0x5c],
  scrollOffset: memory[0x5d],
  player: { x: memory[0x74], y: memory[0x71] },
});
const activeEntity = (slot) => {
  return (memory[0x400 + slot] ?? 0) & 0x80
    ? { state: memory[0x400 + slot], dispatch: memory[0x420 + slot], variant: memory[0x480 + slot], x: memory[0x5e0 + slot], y: memory[0x5c0 + slot] }
    : undefined;
};

for (let current = 0; current < frames; current += 1) {
  const mapPointer = (memory[0x5a] ?? 0) | ((memory[0x5b] ?? 0) << 8);
  const mapEnd = (memory[0x5e] ?? 0) | ((memory[0x5f] ?? 0) << 8);
  if (memory[0x4b] === 0 && mapPointer >= mapEnd - 24) memory[0x49] = 1;
  memory[0x7c] = 255;
  if (attack && bossStart !== undefined && bossReleaseFrame === undefined) {
    if (weapon === "magnum") {
      memory[0x88] = 4;
      memory[0x9c] = 255;
    }
    memory[0x74] = memory[0x5ee] ?? memory[0x74];
    if (followY) memory[0x71] = Math.min(216, (memory[0x5ce] ?? memory[0x71]) + 64);
    const pressed = (current - bossStart) % 5 === 0;
    for (const button of [Button.A, Button.B]) {
      if (pressed) buttonDown(button);
      else buttonUp(button);
    }
  }
  if (clearField && bossStart !== undefined && bossReleaseFrame === undefined) {
    for (let slot = 2; slot < 32; slot += 1) {
      const lowBossSlot = stateFile && slot < 8;
      const playerProjectile = slot >= 8 && slot < 14;
      const banditBillShot = !stateFile && Boolean(memory[0x400 + slot] & 0x80) && memory[0x420 + slot] === 0x30;
      if (slot !== 14 && !lowBossSlot && !playerProjectile && !banditBillShot) memory[0x400 + slot] = 0;
    }
  }
  const playerBefore = { x: memory[0x74], y: memory[0x71] };
  frame();

  const boss = activeEntity(14);
  if (bossStart === undefined && boss?.dispatch === 0x88) {
    bossStart = current;
    bossRoundIndex = memory[0x41];
    if (clearField) {
      for (let slot = 2; slot < 14; slot += 1) memory[0x400 + slot] = 0;
      for (let slot = 24; slot < 32; slot += 1) memory[0x400 + slot] = 0;
    }
    if (!attack) {
      buttonUp(Button.A);
      buttonUp(Button.B);
    }
  }
  if (bossStart === undefined) continue;
  if (bossRoundIndex === undefined) bossRoundIndex = memory[0x41];
  if (!boss && bossReleaseFrame === undefined) {
    bossReleaseFrame = current;
    for (const button of [Button.A, Button.B]) buttonUp(button);
  }
  if (bossReleaseFrame !== undefined) {
    const postFrame = current - bossReleaseFrame;
    postBossFrames.push({
      frame: postFrame,
      bossFrame: current - bossStart,
      roundState: roundState(),
      gameState: {
        mode: memory[0x4b],
        state: memory[0x4c],
        substate: memory[0x4f],
        bossGate: memory[0x49],
        playerState: memory[0x76],
      },
      boss: activeEntity(14),
    });
    if (memory[0x41] !== bossRoundIndex || postFrame >= postBossFramesLimit) break;
    continue;
  }
  if (!boss) continue;
  const relativeFrame = current - bossStart;
  if (attack || record) {
    bossFrames.push({
      frame: relativeFrame,
      roundIndex: memory[0x41],
      pc: `$${nes.cpu.pc.toString(16).padStart(4, "0")}`,
      ...boss,
      playerBefore,
      player: { x: memory[0x74], y: memory[0x71] },
      fields: {
        animation: memory[0x440 + 14],
        collision: memory[0x460 + 14],
        heading: memory[0x4a0 + 14],
        substate: memory[0x4c0 + 14],
        timer: memory[0x4e0 + 14],
        fineY: memory[0x500 + 14],
        fineX: memory[0x520 + 14],
        health: memory[0x540 + 14],
        flags: memory[0x560 + 14],
        field580: memory[0x580 + 14],
        field5a0: memory[0x5a0 + 14],
      },
      zeroPage: {
        b0: memory[0xb0], b1: memory[0xb1], b4: memory[0xb4], b5: memory[0xb5],
        b6: memory[0xb6], b7: memory[0xb7], b8: memory[0xb8], b9: memory[0xb9],
        ba: memory[0xba], bc: memory[0xbc], bd: memory[0xbd], be: memory[0xbe], bf: memory[0xbf],
      },
      random: { ac: memory[0xac], ad: memory[0xad], ae: memory[0xae], af: memory[0xaf] },
    });
  }
  const bossSignature = `${boss.state}:${boss.dispatch}:${boss.variant}`;
  if (bossSignature !== previousBoss) {
    bossChanges.push({ frame: relativeFrame, ...boss });
    previousBoss = bossSignature;
  }
  for (let slot = clearField || stateFile ? 2 : 24; slot < 32; slot += 1) {
    if (slot === 14) continue;
    const projectile = activeEntity(slot);
    const lowBossProjectile = Boolean(stateFile && slot < 8);
    if (!projectile || !lowBossProjectile && (projectile.dispatch < 0x20 || projectile.dispatch >= 0x40)) {
      previousProjectiles.delete(slot);
      continue;
    }
    const signature = `${projectile.state}:${projectile.dispatch}:${projectile.variant}`;
    if (signature !== previousProjectiles.get(slot)) {
      projectileEvents.push({ frame: relativeFrame, slot, ...projectile });
      previousProjectiles.set(slot, signature);
    }
    if (clearField) projectileFrames.push({
      frame: relativeFrame,
      slot,
      ...projectile,
      fields: {
        heading: memory[0x4a0 + slot], substate: memory[0x4c0 + slot], timer: memory[0x4e0 + slot],
        fineY: memory[0x500 + slot], fineX: memory[0x520 + slot], health: memory[0x540 + slot], flags: memory[0x560 + slot],
      },
    });
  }
  if (relativeFrame >= bossFramesLimit) break;
}
buttonUp(Button.A);
buttonUp(Button.B);
if (bossStart === undefined) throw new Error(`Boss slot was not observed in ${frames} frames`);

const trace = {
  source: filename,
  ...(stateFile ? { sourceState: stateFile } : {}),
  sourceSha256: crypto.createHash("sha256").update(romBytes).digest("hex"),
  frameRate: 60.098,
  followY,
  weapon,
  bossStart,
  roundState: roundState(),
  mapperBank,
  bossChanges,
  ...(attack || record ? { bossFrames } : {}),
  ...(clearField ? { projectileFrames } : {}),
  ...(postBossFramesLimit > 0 ? { bossReleaseFrame: bossReleaseFrame === undefined ? undefined : bossReleaseFrame - bossStart, postBossFrames } : {}),
  projectileEvents,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(trace, null, 2));
console.log(`Wrote Boss trace to ${output}`);
