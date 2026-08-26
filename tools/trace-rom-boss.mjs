import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Controller, NES } from "jsnes";

const args = process.argv.slice(2);
const filename = args.find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke.ZH.NES";
const frames = Number(args.find((argument) => argument.startsWith("--frames="))?.split("=")[1] ?? 18_000);
const output = args.find((argument) => argument.startsWith("--out="))?.split("=")[1] ?? ".rom-traces/boss.json";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
if (!Number.isInteger(frames) || frames <= 0) throw new Error("--frames must be a positive integer");

const romBytes = fs.readFileSync(filename);
const nes = new NES({ onFrame: () => {}, onAudioSample: () => {} });
nes.loadROM(romBytes.toString("binary"));
let mapperBank = 0;
const mapperWrite = nes.mmap.write.bind(nes.mmap);
nes.mmap.write = (address, value) => {
  if (address >= 0x8000) mapperBank = value % nes.rom.romCount;
  return mapperWrite(address, value);
};

for (let frame = 0; frame < 180; frame += 1) nes.frame();
nes.buttonDown(1, Controller.BUTTON_START);
for (let frame = 0; frame < 5; frame += 1) nes.frame();
nes.buttonUp(1, Controller.BUTTON_START);
for (let frame = 0; frame < 650; frame += 1) nes.frame();
nes.buttonDown(1, Controller.BUTTON_A);
nes.buttonDown(1, Controller.BUTTON_B);

const bossChanges = [];
const projectileEvents = [];
let bossStart;
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
    ? { state: memory[0x400 + slot], dispatch: memory[0x420 + slot], variant: memory[0x480 + slot], x: memory[0x5c0 + slot], y: memory[0x5e0 + slot] }
    : undefined;
};

for (let frame = 0; frame < frames; frame += 1) {
  const memory = nes.cpu.mem;
  const mapPointer = (memory[0x5a] ?? 0) | ((memory[0x5b] ?? 0) << 8);
  const mapEnd = (memory[0x5e] ?? 0) | ((memory[0x5f] ?? 0) << 8);
  if (memory[0x4b] === 0 && mapPointer >= mapEnd - 24) memory[0x49] = 1;
  memory[0x7c] = 255;
  nes.frame();

  const boss = activeEntity(14);
  if (bossStart === undefined && boss?.dispatch === 0x88) {
    bossStart = frame;
    nes.buttonUp(1, Controller.BUTTON_A);
    nes.buttonUp(1, Controller.BUTTON_B);
  }
  if (bossStart === undefined || !boss) continue;
  const relativeFrame = frame - bossStart;
  const bossSignature = `${boss.state}:${boss.dispatch}:${boss.variant}`;
  if (bossSignature !== previousBoss) {
    bossChanges.push({ frame: relativeFrame, ...boss });
    previousBoss = bossSignature;
  }
  for (let slot = 24; slot < 32; slot += 1) {
    const projectile = activeEntity(slot);
    if (!projectile || projectile.dispatch < 0x20 || projectile.dispatch >= 0x40) {
      previousProjectiles.delete(slot);
      continue;
    }
    const signature = `${projectile.state}:${projectile.dispatch}:${projectile.variant}`;
    if (signature !== previousProjectiles.get(slot)) {
      projectileEvents.push({ frame: relativeFrame, slot, ...projectile });
      previousProjectiles.set(slot, signature);
    }
  }
  if (relativeFrame >= 720) break;
}
nes.buttonUp(1, Controller.BUTTON_A);
nes.buttonUp(1, Controller.BUTTON_B);
if (bossStart === undefined) throw new Error(`Bandit Bill was not observed in ${frames} frames`);

const trace = {
  source: filename,
  sourceSha256: crypto.createHash("sha256").update(romBytes).digest("hex"),
  frameRate: 60.098,
  bossStart,
  roundState: roundState(),
  mapperBank,
  bossChanges,
  projectileEvents,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(trace, null, 2));
console.log(`Wrote Bandit Bill trace to ${output}`);
