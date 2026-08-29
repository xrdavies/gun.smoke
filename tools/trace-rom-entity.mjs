import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Controller, NES } from "jsnes";

const args = process.argv.slice(2);
const listCandidates = args.includes("--list-candidates");
const isolateCandidates = args.includes("--isolate-candidates");
const option = (name) => args.find((argument) => argument.startsWith(`--${name}=`))?.split("=")[1];
const numberOption = (name, fallback) => Number.parseInt(option(name) ?? String(fallback), 0);
const filename = args.find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke.ZH.NES";
const stateFile = option("state");
const dispatch = numberOption("dispatch", Number.NaN);
const followDispatches = (option("follow")?.split(",") ?? []).filter(Boolean).map((value) => Number.parseInt(value, 0));
const variant = option("variant") === undefined ? undefined : numberOption("variant", 0);
const skip = numberOption("skip", 0);
const round = option("round") === undefined ? undefined : numberOption("round", 1);
const frames = numberOption("frames", round === undefined ? 12_000 : round * 24_000);
const traceFrames = numberOption("trace-frames", 1_200);
const playerX = option("player-x") === undefined ? undefined : numberOption("player-x", 0);
const playerY = option("player-y") === undefined ? undefined : numberOption("player-y", 0);
const matchState = option("match-state") === undefined ? undefined : numberOption("match-state", 0);
const matchHeading = option("match-heading") === undefined ? undefined : numberOption("match-heading", 0);
const matchX = option("match-x") === undefined ? undefined : numberOption("match-x", 0);
const matchY = option("match-y") === undefined ? undefined : numberOption("match-y", 0);
const startFrame = option("start-frame") === undefined ? undefined : numberOption("start-frame", 0);
const output = option("out") ?? ".rom-traces/entity.json";

if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
if (stateFile && !fs.existsSync(stateFile)) throw new Error(`State file not found: ${stateFile}`);
if (!Number.isInteger(dispatch)) throw new Error("--dispatch is required and accepts decimal or 0x-prefixed values");
if (followDispatches.some((value) => !Number.isInteger(value))) throw new Error("--follow must contain comma-separated decimal or 0x-prefixed dispatches");
if (!Number.isInteger(skip) || skip < 0) throw new Error("--skip must be a non-negative integer");
if (round !== undefined && (!Number.isInteger(round) || round < 1 || round > 6)) throw new Error("--round must be an integer from 1 through 6");
if (!Number.isInteger(frames) || frames <= 0 || !Number.isInteger(traceFrames) || traceFrames <= 0) throw new Error("--frames and --trace-frames must be positive integers");
for (const [name, value] of [["--match-state", matchState], ["--match-heading", matchHeading], ["--match-x", matchX], ["--match-y", matchY]]) {
  if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > 0xff)) throw new Error(`${name} must be an integer from 0 through 255`);
}
if (startFrame !== undefined && (!Number.isInteger(startFrame) || startFrame < 0 || startFrame >= frames)) throw new Error("--start-frame must be within --frames");

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
    field580: memory[0x580 + slot],
    field5a0: memory[0x5a0 + slot],
    y: memory[0x5c0 + slot],
    x: memory[0x5e0 + slot],
  };
};
const active = (slot) => Boolean(nes.cpu.mem[0x400 + slot] & 0x80);

let targetSlot;
let targetStart;
const entityFrames = [];
const projectileFrames = [];
const allowedDispatches = new Set([dispatch - 2, dispatch - 1, dispatch, dispatch + 1, ...followDispatches]);
const matchingSlots = new Set();
const candidates = [];
let matchesSeen = 0;
let termination;
for (let frame = 0; frame < frames; frame += 1) {
  const memory = nes.cpu.mem;
  memory[0x7c] = 255;
  const currentRound = (memory[0x41] ?? 0) + 1;
  const advancing = round !== undefined && currentRound < round;
  if (advancing) {
    const mapPointer = (memory[0x5a] ?? 0) | ((memory[0x5b] ?? 0) << 8);
    const mapEnd = (memory[0x5e] ?? 0) | ((memory[0x5f] ?? 0) << 8);
    if (memory[0x4b] === 0 && mapPointer >= mapEnd - 24) memory[0x49] = 1;
    const bossActive = active(14) && memory[0x420 + 14] >= 0x80;
    if (bossActive) {
      memory[0x74] = memory[0x5e0 + 14];
      memory[0x540 + 14] = 1;
    }
    for (const button of [Controller.BUTTON_A, Controller.BUTTON_B]) {
      if (bossActive && frame % 5 === 0) nes.buttonDown(1, button);
      else nes.buttonUp(1, button);
    }
  } else if (round !== undefined) {
    nes.buttonUp(1, Controller.BUTTON_A);
    nes.buttonUp(1, Controller.BUTTON_B);
  }
  if (targetSlot !== undefined) {
    if (playerX !== undefined) memory[0x74] = playerX;
    if (playerY !== undefined) memory[0x71] = playerY;
    for (let slot = 16; slot < 23; slot += 1) if (slot !== targetSlot) memory[0x400 + slot] = 0;
  }
  if (targetSlot === undefined && startFrame !== undefined && frame === startFrame) {
    for (let slot = 16; slot < 23; slot += 1) memory[0x400 + slot] = 0;
    matchingSlots.clear();
  }
  if (isolateCandidates && targetSlot === undefined) for (let slot = 16; slot < 23; slot += 1) memory[0x400 + slot] = 0;
  const playerBefore = { x: memory[0x74], y: memory[0x71] };
  nes.frame();

  if (targetSlot === undefined && (startFrame === undefined || frame >= startFrame)) {
    for (let slot = 16; slot < 23; slot += 1) {
      if (!active(slot)) {
        matchingSlots.delete(slot);
        continue;
      }
      const candidate = entity(slot);
      const baseMatch = !advancing && candidate.dispatch === dispatch && (variant === undefined || candidate.variant === variant);
      if (!baseMatch || matchingSlots.has(slot)) continue;
      matchingSlots.add(slot);
      candidates.push({ frame, ...candidate, playerBefore, player: { x: memory[0x74], y: memory[0x71] } });
      if (listCandidates) continue;
      const matches = (matchState === undefined || candidate.state === matchState)
        && (matchHeading === undefined || candidate.heading === matchHeading)
        && (matchX === undefined || candidate.x === matchX)
        && (matchY === undefined || candidate.y === matchY);
      if (!matches) continue;
      matchesSeen += 1;
      if (matchesSeen <= skip) continue;
      targetSlot = slot;
      targetStart = frame;
      for (let other = 16; other < 23; other += 1) if (other !== slot) memory[0x400 + other] = 0;
      for (let projectile = 24; projectile < 32; projectile += 1) memory[0x400 + projectile] = 0;
      break;
    }
  }
  if (targetSlot === undefined || targetStart === undefined) continue;
  if (!active(targetSlot) || !allowedDispatches.has(memory[0x420 + targetSlot])) {
    termination = { frame: frame - targetStart, active: active(targetSlot), entity: entity(targetSlot) };
    break;
  }

  const relativeFrame = frame - targetStart;
  entityFrames.push({
    frame: relativeFrame,
    ...entity(targetSlot),
    playerBefore,
    player: { x: memory[0x74], y: memory[0x71] },
    random: { ac: memory[0xac], ad: memory[0xad], ae: memory[0xae], af: memory[0xaf] },
    zeroPage: { b0: memory[0xb0], b4: memory[0xb4], b5: memory[0xb5], ba: memory[0xba], bc: memory[0xbc] },
    roundState: {
      mapPointer: (memory[0x5a] ?? 0) | ((memory[0x5b] ?? 0) << 8),
      mapPage: memory[0x5c],
      scrollOffset: memory[0x5d],
      scrollStep: memory[0x62],
    },
  });
  for (let slot = 24; slot < 32; slot += 1) {
    if (active(slot)) projectileFrames.push({ frame: relativeFrame, ...entity(slot) });
  }
  if (relativeFrame >= traceFrames) break;
}

if (listCandidates) {
  const result = {
    source: filename,
    sourceSha256: crypto.createHash("sha256").update(romBytes).digest("hex"),
    frameRate: 60.098,
    dispatch,
    ...(round === undefined ? {} : { round }),
    candidates,
  };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(result, null, 2));
  console.log(`Wrote ${candidates.length} entity candidates to ${output}`);
  process.exit(0);
}

if (targetSlot === undefined || targetStart === undefined) throw new Error(`Dispatch 0x${dispatch.toString(16)} was not observed`);
const trace = {
  source: filename,
  ...(stateFile ? { sourceState: stateFile } : {}),
  sourceSha256: crypto.createHash("sha256").update(romBytes).digest("hex"),
  frameRate: 60.098,
  dispatch,
  followDispatches,
  skip,
  ...(round === undefined ? {} : { round }),
  ...(variant === undefined ? {} : { variant }),
  ...(matchState === undefined ? {} : { matchState }),
  ...(matchHeading === undefined ? {} : { matchHeading }),
  ...(matchX === undefined ? {} : { matchX }),
  ...(matchY === undefined ? {} : { matchY }),
  ...(startFrame === undefined ? {} : { startFrame }),
  targetSlot,
  targetStart,
  player: { x: playerX, y: playerY },
  termination,
  entityFrames,
  projectileFrames,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(trace, null, 2));
console.log(`Wrote entity trace to ${output}`);
