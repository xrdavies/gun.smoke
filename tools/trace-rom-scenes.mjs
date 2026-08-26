import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Controller, NES } from "jsnes";

const args = process.argv.slice(2);
const filename = args.find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke.ZH.NES";
const frames = Number(args.find((argument) => argument.startsWith("--frames="))?.split("=")[1] ?? 12_000);
const every = Number(args.find((argument) => argument.startsWith("--every="))?.split("=")[1] ?? 60);
const holdFire = args.includes("--hold-ab");
const output = args.find((argument) => argument.startsWith("--out="))?.split("=")[1] ?? ".rom-traces/scenes.json";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
if (!Number.isInteger(frames) || frames <= 0 || !Number.isInteger(every) || every <= 0) {
  throw new Error("--frames and --every must be positive integers");
}

const rom = fs.readFileSync(filename).toString("binary");
const romBytes = fs.readFileSync(filename);
let lastFrame;
const nes = new NES({ onFrame: (frame) => { lastFrame = frame; }, onAudioSample: () => {} });
nes.loadROM(rom);
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
const activeOam = () => {
  const entries = [];
  for (let index = 0; index < nes.ppu.spriteMem.length; index += 4) {
    const y = nes.ppu.spriteMem[index] ?? 0xff;
    if (y !== 0xf8 && y !== 0xff) entries.push([
      y,
      nes.ppu.spriteMem[index + 1] ?? 0,
      nes.ppu.spriteMem[index + 2] ?? 0,
      nes.ppu.spriteMem[index + 3] ?? 0,
    ]);
  }
  return entries;
};
const nameTableHashes = () => nes.ppu.nameTable.map((table) => sha(Buffer.from(table.tile.slice(0, 32 * 30))));
const sample = (frame) => {
  const oam = activeOam();
  return {
    frame,
    gameFrame: Math.max(0, frame - 825),
    state: nes.cpu.mem[0x68],
    substate: nes.cpu.mem[0x69],
    stage: nes.cpu.mem[0x62],
    scorePage: nes.cpu.mem[0x4c],
    scoreLow: nes.cpu.mem[0x4f],
    lives: nes.cpu.mem[0x7a],
    ppu: {
      coarseX: nes.ppu.regHT,
      coarseY: nes.ppu.regVT,
      fineX: nes.ppu.regFH,
      fineY: nes.ppu.regFV,
      nametable: nes.ppu.curNt,
      rawVramAddress: nes.ppu.vramAddress,
    },
    activeSprites: oam.length,
    oamHash: sha(Buffer.from(oam.flat())),
    frameHash: lastFrame ? sha(Buffer.from(lastFrame.buffer)) : undefined,
    nameTableHashes: nameTableHashes(),
  };
};

for (let frame = 0; frame < 180; frame += 1) nes.frame();
nes.buttonDown(1, Controller.BUTTON_START);
for (let frame = 0; frame < 5; frame += 1) nes.frame();
nes.buttonUp(1, Controller.BUTTON_START);
for (let frame = 0; frame < 640; frame += 1) nes.frame();
if (holdFire) {
  nes.buttonDown(1, Controller.BUTTON_A);
  nes.buttonDown(1, Controller.BUTTON_B);
}

const samples = [];
for (let frame = 0; frame < frames; frame += 1) {
  nes.frame();
  if ((frame + 1) % every === 0) samples.push(sample(frame + 1 + 825));
}
if (holdFire) {
  nes.buttonUp(1, Controller.BUTTON_A);
  nes.buttonUp(1, Controller.BUTTON_B);
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({
  source: filename,
  sourceSha256: crypto.createHash("sha256").update(romBytes).digest("hex"),
  startFrame: 825,
  frames,
  every,
  holdFire,
  samples,
}, null, 2));
console.log(`Wrote ${samples.length} ROM scene samples to ${output}`);
