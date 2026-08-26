import crypto from "node:crypto";
import fs from "node:fs";
import { Controller, NES } from "jsnes";

const timeline = process.argv.includes("--timeline");
const filename = process.argv.slice(2).find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke.ZH.NES";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}

const rom = fs.readFileSync(filename).toString("binary");
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

const checkpoints = [];
const activeSprites = () => {
  let count = 0;
  for (let index = 0; index < nes.ppu.spriteMem.length; index += 4) {
    const y = nes.ppu.spriteMem[index] ?? 0xff;
    if (y !== 0xf8 && y !== 0xff) count += 1;
  }
  return count;
};
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
const checkpoint = (label, gameFrame) => {
  const frameHash = lastFrame
    ? crypto.createHash("sha256").update(Buffer.from(lastFrame.buffer)).digest("hex").slice(0, 16)
    : undefined;
  checkpoints.push({
    label,
    gameFrame,
    pc: `$${nes.cpu.REG_PC.toString(16).padStart(4, "0")}`,
    ram: {
      "0x4c": nes.cpu.mem[0x4c],
      "0x4f": nes.cpu.mem[0x4f],
      "0x62": nes.cpu.mem[0x62],
      "0x68": nes.cpu.mem[0x68],
      "0x69": nes.cpu.mem[0x69],
      "0x7a": nes.cpu.mem[0x7a],
    },
    eventCursor: { slot: nes.cpu.mem[0x6a], delay: nes.cpu.mem[0x6b], ramA3: nes.cpu.mem[0xa3] },
    sceneRuntime: {
      pointer: (nes.cpu.mem[0x36a] ?? 0) | ((nes.cpu.mem[0x36b] ?? 0) << 8),
      count: nes.cpu.mem[0x36c],
      records: Array.from(nes.cpu.mem.slice(0x36d, 0x394)),
    },
    mapperBank,
    mapperBanksSeen: [...mapperBanksSeen].sort((left, right) => left - right),
    mapperWriteCount,
    eventPairs: Array.from(nes.cpu.mem.slice(0x780, 0x7c0)),
    hudScore: hudScore(),
    ppu: {
      vramAddress: nes.ppu.vramAddress,
      coarseX: nes.ppu.regHT,
      coarseY: nes.ppu.regVT,
      fineX: nes.ppu.regFH,
      fineY: nes.ppu.regFV,
      nametable: nes.ppu.curNt,
    },
    spriteOam: Array.from(nes.ppu.spriteMem.slice(0, 32)),
    activeSprites: activeSprites(),
    frameHash,
  });
  mapperBanksSeen.clear();
  mapperBanksSeen.add(mapperBank);
  mapperWriteCount = 0;
};

if (timeline) {
  for (let frame = 0; frame < 2_880; frame += 1) {
    if (frame === 180) nes.buttonDown(1, Controller.BUTTON_START);
    if (frame === 185) nes.buttonUp(1, Controller.BUTTON_START);
    nes.frame();
    if (frame % 60 === 59) checkpoint(`timeline-${frame + 1}`, Math.max(0, frame + 1 - 825));
  }
  console.log(JSON.stringify(checkpoints, null, 2));
  process.exit(0);
}

for (let frame = 0; frame < 180; frame += 1) nes.frame();
checkpoint("title", 0);
nes.buttonDown(1, Controller.BUTTON_START);
for (let frame = 0; frame < 5; frame += 1) nes.frame();
nes.buttonUp(1, Controller.BUTTON_START);
for (let frame = 0; frame < 415; frame += 1) nes.frame();
checkpoint("wanted-screen", 0);
for (let frame = 0; frame < 240; frame += 1) nes.frame();
checkpoint("round-1-entry", 15);
for (let frame = 0; frame < 360; frame += 1) nes.frame();
checkpoint("round-1-active", 375);
console.log(JSON.stringify(checkpoints, null, 2));
