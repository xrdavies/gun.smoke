import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Controller, NES } from "jsnes";

const args = process.argv.slice(2);
const option = (name) => args.find((argument) => argument.startsWith(`--${name}=`))?.split("=")[1];
const numberOption = (name, fallback) => Number.parseInt(option(name) ?? String(fallback), 0);
const filename = args.find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke.ZH.NES";
const stateFile = option("state");
const dispatch = numberOption("dispatch", Number.NaN);
const variant = option("variant") === undefined ? undefined : numberOption("variant", 0);
const frames = numberOption("frames", 12_000);
const traceFrames = numberOption("trace-frames", 1_200);
const playerX = option("player-x") === undefined ? undefined : numberOption("player-x", 0);
const playerY = option("player-y") === undefined ? undefined : numberOption("player-y", 0);
const output = option("out") ?? ".rom-traces/entity.json";

if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
if (stateFile && !fs.existsSync(stateFile)) throw new Error(`State file not found: ${stateFile}`);
if (!Number.isInteger(dispatch)) throw new Error("--dispatch is required and accepts decimal or 0x-prefixed values");
if (!Number.isInteger(frames) || frames <= 0 || !Number.isInteger(traceFrames) || traceFrames <= 0) throw new Error("--frames and --trace-frames must be positive integers");

const romBytes = fs.readFileSync(filename);
const nes = new NES({ onFrame: () => {}, onAudioSample: () => {} });
nes.loadROM(romBytes.toString("binary"));
if (stateFile) nes.fromJSON(JSON.parse(fs.readFileSync(stateFile, "utf8")));
else {
  for (let frame = 0; frame < 180; frame += 1) nes.frame();
  nes.buttonDown(1, Controller.BUTTON_START);
  for (let frame = 0; frame < 5; frame += 1) nes.frame();
  nes.buttonUp(1, Controller.BUTTON_START);
  for (let frame = 0; frame < 640; frame += 1) nes.frame();
}

const entity = (slot) => {
  const memory = nes.cpu.mem;
  return {
    slot,
    state: memory[0x400 + slot],
    dispatch: memory[0x420 + slot],
    animation: memory[0x440 + slot],
    collision: memory[0x460 + slot],
    variant: memory[0x480 + slot],
    heading: memory[0x4a0 + slot],
    substate: memory[0x4c0 + slot],
    timer: memory[0x4e0 + slot],
    fineY: memory[0x500 + slot],
    fineX: memory[0x520 + slot],
    health: memory[0x540 + slot],
    flags: memory[0x560 + slot],
    y: memory[0x5c0 + slot],
    x: memory[0x5e0 + slot],
  };
};
const active = (slot) => Boolean(nes.cpu.mem[0x400 + slot] & 0x80);

let targetSlot;
let targetStart;
const entityFrames = [];
const projectileFrames = [];
for (let frame = 0; frame < frames; frame += 1) {
  const memory = nes.cpu.mem;
  memory[0x7c] = 255;
  if (targetSlot !== undefined) {
    if (playerX !== undefined) memory[0x74] = playerX;
    if (playerY !== undefined) memory[0x71] = playerY;
    for (let slot = 16; slot < 23; slot += 1) if (slot !== targetSlot) memory[0x400 + slot] = 0;
  }
  nes.frame();

  if (targetSlot === undefined) {
    for (let slot = 16; slot < 23; slot += 1) {
      if (!active(slot) || memory[0x420 + slot] !== dispatch || variant !== undefined && memory[0x480 + slot] !== variant) continue;
      targetSlot = slot;
      targetStart = frame;
      for (let other = 16; other < 23; other += 1) if (other !== slot) memory[0x400 + other] = 0;
      for (let projectile = 24; projectile < 32; projectile += 1) memory[0x400 + projectile] = 0;
      break;
    }
  }
  if (targetSlot === undefined || targetStart === undefined) continue;
  if (!active(targetSlot)) break;

  const relativeFrame = frame - targetStart;
  entityFrames.push({ frame: relativeFrame, ...entity(targetSlot) });
  for (let slot = 24; slot < 32; slot += 1) {
    if (active(slot)) projectileFrames.push({ frame: relativeFrame, ...entity(slot) });
  }
  if (relativeFrame >= traceFrames) break;
}

if (targetSlot === undefined || targetStart === undefined) throw new Error(`Dispatch 0x${dispatch.toString(16)} was not observed`);
const trace = {
  source: filename,
  ...(stateFile ? { sourceState: stateFile } : {}),
  sourceSha256: crypto.createHash("sha256").update(romBytes).digest("hex"),
  frameRate: 60.098,
  dispatch,
  ...(variant === undefined ? {} : { variant }),
  targetSlot,
  targetStart,
  player: { x: playerX, y: playerY },
  entityFrames,
  projectileFrames,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(trace, null, 2));
console.log(`Wrote entity trace to ${output}`);
