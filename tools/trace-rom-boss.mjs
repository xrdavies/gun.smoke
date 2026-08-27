import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Controller, NES } from "jsnes";

const args = process.argv.slice(2);
const filename = args.find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke.ZH.NES";
const frames = Number(args.find((argument) => argument.startsWith("--frames="))?.split("=")[1] ?? 18_000);
const bossFramesLimit = Number(args.find((argument) => argument.startsWith("--boss-frames="))?.split("=")[1] ?? (args.includes("--attack") ? 2_400 : 720));
const output = args.find((argument) => argument.startsWith("--out="))?.split("=")[1] ?? ".rom-traces/boss.json";
const stateFile = args.find((argument) => argument.startsWith("--state="))?.split("=")[1];
const attack = args.includes("--attack");
const record = args.includes("--record");
const clearField = args.includes("--clear-field");
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
if (!Number.isInteger(frames) || frames <= 0) throw new Error("--frames must be a positive integer");
if (!Number.isInteger(bossFramesLimit) || bossFramesLimit <= 0) throw new Error("--boss-frames must be a positive integer");
if (stateFile && !fs.existsSync(stateFile)) throw new Error(`State file not found: ${stateFile}`);

const romBytes = fs.readFileSync(filename);
const nes = new NES({ onFrame: () => {}, onAudioSample: () => {} });
nes.loadROM(romBytes.toString("binary"));
if (stateFile) nes.fromJSON(JSON.parse(fs.readFileSync(stateFile, "utf8")));
let mapperBank = 0;
const mapperWrite = nes.mmap.write.bind(nes.mmap);
nes.mmap.write = (address, value) => {
  if (address >= 0x8000) mapperBank = value % nes.rom.romCount;
  return mapperWrite(address, value);
};

if (!stateFile) {
  for (let frame = 0; frame < 180; frame += 1) nes.frame();
  nes.buttonDown(1, Controller.BUTTON_START);
  for (let frame = 0; frame < 5; frame += 1) nes.frame();
  nes.buttonUp(1, Controller.BUTTON_START);
  for (let frame = 0; frame < 650; frame += 1) nes.frame();
  nes.buttonDown(1, Controller.BUTTON_A);
  nes.buttonDown(1, Controller.BUTTON_B);
}

const bossChanges = [];
const bossFrames = [];
const projectileEvents = [];
const projectileFrames = [];
let bossStart = stateFile ? 0 : undefined;
let previousBoss;
const previousProjectiles = new Map();
const roundState = () => ({
  roundIndex: nes.cpu.mem[0x41],
  mapPointer: (nes.cpu.mem[0x5a] ?? 0) | ((nes.cpu.mem[0x5b] ?? 0) << 8),
  mapEnd: (nes.cpu.mem[0x5e] ?? 0) | ((nes.cpu.mem[0x5f] ?? 0) << 8),
  mapPage: nes.cpu.mem[0x5c],
  scrollOffset: nes.cpu.mem[0x5d],
  player: { x: nes.cpu.mem[0x74], y: nes.cpu.mem[0x71] },
});
const activeEntity = (slot) => {
  const memory = nes.cpu.mem;
  return (memory[0x400 + slot] ?? 0) & 0x80
    ? { state: memory[0x400 + slot], dispatch: memory[0x420 + slot], variant: memory[0x480 + slot], x: memory[0x5e0 + slot], y: memory[0x5c0 + slot] }
    : undefined;
};

for (let frame = 0; frame < frames; frame += 1) {
  const memory = nes.cpu.mem;
  const mapPointer = (memory[0x5a] ?? 0) | ((memory[0x5b] ?? 0) << 8);
  const mapEnd = (memory[0x5e] ?? 0) | ((memory[0x5f] ?? 0) << 8);
  if (memory[0x4b] === 0 && mapPointer >= mapEnd - 24) memory[0x49] = 1;
  memory[0x7c] = 255;
  if (attack && bossStart !== undefined) {
    memory[0x74] = memory[0x5ee] ?? memory[0x74];
    const pressed = (frame - bossStart) % 5 === 0;
    for (const button of [Controller.BUTTON_A, Controller.BUTTON_B]) {
      if (pressed) nes.buttonDown(1, button);
      else nes.buttonUp(1, button);
    }
  }
  if (clearField && bossStart !== undefined) {
    for (let slot = 2; slot < 32; slot += 1) {
      const lowBossSlot = stateFile && slot < 8;
      const banditBillShot = !stateFile && Boolean(nes.cpu.mem[0x400 + slot] & 0x80) && nes.cpu.mem[0x420 + slot] === 0x30;
      if (slot !== 14 && !lowBossSlot && !banditBillShot) nes.cpu.mem[0x400 + slot] = 0;
    }
  }
  nes.frame();

  const boss = activeEntity(14);
  if (bossStart === undefined && boss?.dispatch === 0x88) {
    bossStart = frame;
    if (clearField) {
      for (let slot = 2; slot < 14; slot += 1) nes.cpu.mem[0x400 + slot] = 0;
      for (let slot = 24; slot < 32; slot += 1) nes.cpu.mem[0x400 + slot] = 0;
    }
    if (!attack) {
      nes.buttonUp(1, Controller.BUTTON_A);
      nes.buttonUp(1, Controller.BUTTON_B);
    }
  }
  if (bossStart === undefined || !boss) continue;
  const relativeFrame = frame - bossStart;
  if (attack || record) {
    bossFrames.push({
      frame: relativeFrame,
      pc: `$${nes.cpu.REG_PC.toString(16).padStart(4, "0")}`,
      ...boss,
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
      zeroPage: { b0: memory[0xb0], b4: memory[0xb4], b5: memory[0xb5], ba: memory[0xba], bc: memory[0xbc] },
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
    if (clearField) projectileFrames.push({ frame: relativeFrame, slot, ...projectile });
  }
  if (relativeFrame >= bossFramesLimit) break;
}
nes.buttonUp(1, Controller.BUTTON_A);
nes.buttonUp(1, Controller.BUTTON_B);
if (bossStart === undefined) throw new Error(`Boss slot was not observed in ${frames} frames`);

const trace = {
  source: filename,
  ...(stateFile ? { sourceState: stateFile } : {}),
  sourceSha256: crypto.createHash("sha256").update(romBytes).digest("hex"),
  frameRate: 60.098,
  bossStart,
  roundState: roundState(),
  mapperBank,
  bossChanges,
  ...(attack || record ? { bossFrames } : {}),
  ...(clearField ? { projectileFrames } : {}),
  projectileEvents,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(trace, null, 2));
console.log(`Wrote Boss trace to ${output}`);
