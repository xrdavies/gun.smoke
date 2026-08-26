import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Controller, NES } from "jsnes";

const args = process.argv.slice(2);
const filename = args.find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke.ZH.NES";
const frames = Number(args.find((argument) => argument.startsWith("--frames="))?.split("=")[1] ?? 12_000);
const every = Number(args.find((argument) => argument.startsWith("--every="))?.split("=")[1] ?? 60);
const holdFire = args.includes("--hold-ab");
const pulseFire = args.includes("--pulse-fire");
const output = args.find((argument) => argument.startsWith("--out="))?.split("=")[1] ?? ".rom-traces/scenes.json";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
if (!Number.isInteger(frames) || frames <= 0 || !Number.isInteger(every) || every <= 0) {
  throw new Error("--frames and --every must be positive integers");
}
if (holdFire && pulseFire) throw new Error("Choose either --hold-ab or --pulse-fire");

const rom = fs.readFileSync(filename).toString("binary");
const romBytes = fs.readFileSync(filename);
let lastFrame;
const nes = new NES({ onFrame: (frame) => { lastFrame = frame; }, onAudioSample: () => {} });
nes.loadROM(rom);
let mapperBank = 0;
let mapperWriteCount = 0;
const mapperBanksSeen = new Set([mapperBank]);
const mapperWrite = nes.mmap.write.bind(nes.mmap);
nes.mmap.write = (address, value) => {
  if (address >= 0x8000) {
    mapperBank = value % nes.rom.romCount;
    mapperBanksSeen.add(mapperBank);
    mapperWriteCount += 1;
  }
  return mapperWrite(address, value);
};
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
const hudScore = () => {
  const digits = [];
  for (let index = 0; index < nes.ppu.spriteMem.length; index += 4) {
    const y = nes.ppu.spriteMem[index] ?? 0xff;
    const tile = nes.ppu.spriteMem[index + 1] ?? 0xff;
    const x = nes.ppu.spriteMem[index + 3] ?? 0xff;
    if (y === 16 && x >= 104 && x <= 144 && (x - 104) % 8 === 0 && tile >= 88 && tile <= 97) digits[(x - 104) / 8] = tile - 88;
  }
  return digits.length === 6 && digits.filter(Number.isInteger).length === 6 ? Number(digits.join("")) : undefined;
};
const ppuUpdate = () => {
  const control = nes.cpu.mem[0x36c] ?? 0;
  const length = (control & 0x3f) || 64;
  const repeat = Boolean(control & 0x40);
  return {
    address: ((nes.cpu.mem[0x36a] ?? 0) << 8) | (nes.cpu.mem[0x36b] ?? 0),
    control,
    length,
    repeat,
    vertical: Boolean(control & 0x80),
    payload: Array.from(nes.cpu.mem.slice(0x36d, 0x36d + (repeat ? 1 : length))),
  };
};
const roundState = () => ({
  roundIndex: nes.cpu.mem[0x41],
  roundNumber: (nes.cpu.mem[0x41] ?? 0) + 1,
  mapPointer: (nes.cpu.mem[0x5a] ?? 0) | ((nes.cpu.mem[0x5b] ?? 0) << 8),
  mapEnd: (nes.cpu.mem[0x5e] ?? 0) | ((nes.cpu.mem[0x5f] ?? 0) << 8),
  mapPage: nes.cpu.mem[0x5c],
  scrollOffset: nes.cpu.mem[0x5d],
  player: { x: nes.cpu.mem[0x74], y: nes.cpu.mem[0x71] },
});
const sample = (frame) => {
  const oam = activeOam();
  const value = {
    frame,
    gameFrame: Math.max(0, frame - 825),
    ram: {
      "0x4c": nes.cpu.mem[0x4c],
      "0x4f": nes.cpu.mem[0x4f],
      "0x62": nes.cpu.mem[0x62],
      "0x68": nes.cpu.mem[0x68],
      "0x69": nes.cpu.mem[0x69],
      "0x7a": nes.cpu.mem[0x7a],
    },
    inputReplayCursor: { slot: nes.cpu.mem[0x6a], duration: nes.cpu.mem[0x6b], ramA3: nes.cpu.mem[0xa3] },
    roundState: roundState(),
    ppuUpdate: ppuUpdate(),
    mapperBank,
    mapperBanksSeen: [...mapperBanksSeen].sort((left, right) => left - right),
    mapperWriteCount,
    inputReplayPairs: Array.from(nes.cpu.mem.slice(0x780, 0x7c0)),
    hudScore: hudScore(),
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
  mapperBanksSeen.clear();
  mapperBanksSeen.add(mapperBank);
  mapperWriteCount = 0;
  return value;
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
mapperBanksSeen.clear();
mapperBanksSeen.add(mapperBank);
mapperWriteCount = 0;

const samples = [];
for (let frame = 0; frame < frames; frame += 1) {
  if (pulseFire && frame % 4 === 0) nes.buttonDown(1, Math.floor(frame / 4) % 2 === 0 ? Controller.BUTTON_B : Controller.BUTTON_A);
  if (pulseFire && frame % 4 === 1) {
    nes.buttonUp(1, Controller.BUTTON_A);
    nes.buttonUp(1, Controller.BUTTON_B);
  }
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
  pulseFire,
  samples,
}, null, 2));
console.log(`Wrote ${samples.length} ROM scene samples to ${output}`);
