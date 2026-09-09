import crypto from "node:crypto";
import fs from "node:fs";
import { Button, Nes } from "lib-jsnes";

const timeline = process.argv.includes("--timeline");
const filename = process.argv.slice(2).find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke (USA).nes";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}

const romBytes = fs.readFileSync(filename);
const nes = new Nes(romBytes);
nes.reset();
let controllerMask = 0;
const buttonDown = (button) => { controllerMask |= button; nes.setController(1, controllerMask); };
const buttonUp = (button) => { controllerMask &= ~button; nes.setController(1, controllerMask); };
const frame = () => nes.runFrame();
const runFrames = (count) => { for (let index = 0; index < count; index += 1) frame(); };
const read = (address) => nes.read(address);
const readBytes = (address, length) => Uint8Array.from({ length }, (_, index) => read(address + index));
let mapperBank = 0;
let mapperWriteCount = 0;
const mapperBanksSeen = new Set([mapperBank]);
const mapperWrite = nes.cartridge.writeCpu.bind(nes.cartridge);
nes.cartridge.writeCpu = (address, value, consecutive) => {
  if (address >= 0x8000) {
    mapperBank = value % Math.max(1, nes.rom.prgRom.length / 0x4000);
    mapperBanksSeen.add(mapperBank);
    mapperWriteCount += 1;
  }
  return mapperWrite(address, value, consecutive);
};
const checkpoints = [];
const activeSprites = () => {
  let count = 0;
  for (let index = 0; index < nes.ppu.oam.length; index += 4) {
    const y = nes.ppu.oam[index] ?? 0xff;
    if (y !== 0xf8 && y !== 0xff) count += 1;
  }
  return count;
};
const hudScore = () => {
  const digits = [];
  for (let index = 0; index < nes.ppu.oam.length; index += 4) {
    const y = nes.ppu.oam[index] ?? 0xff; const tile = nes.ppu.oam[index + 1] ?? 0xff; const x = nes.ppu.oam[index + 3] ?? 0xff;
    if (y === 16 && x >= 104 && x <= 144 && (x - 104) % 8 === 0 && tile >= 88 && tile <= 97) digits[(x - 104) / 8] = tile - 88;
  }
  return digits.length === 6 && digits.filter(Number.isInteger).length === 6 ? Number(digits.join("")) : undefined;
};
const ppuUpdate = () => {
  const control = read(0x36c); const length = (control & 0x3f) || 64; const repeat = Boolean(control & 0x40);
  return { address: (read(0x36a) << 8) | read(0x36b), control, length, repeat, vertical: Boolean(control & 0x80), payload: Array.from(readBytes(0x36d, repeat ? 1 : length)) };
};
const roundState = () => ({ roundIndex: read(0x41), roundNumber: read(0x41) + 1, mapPointer: read(0x5a) | (read(0x5b) << 8), mapEnd: read(0x5e) | (read(0x5f) << 8), mapPage: read(0x5c), scrollOffset: read(0x5d), player: { x: read(0x74), y: read(0x71) } });
const checkpoint = (label, gameFrame) => {
  const ppuAddress = nes.ppu.addr;
  checkpoints.push({
    label, gameFrame, pc: `$${nes.cpu.pc.toString(16).padStart(4, "0")}`,
    ram: { "0x4c": read(0x4c), "0x4f": read(0x4f), "0x62": read(0x62), "0x68": read(0x68), "0x69": read(0x69), "0x7a": read(0x7a) },
    inputReplayCursor: { slot: read(0x6a), duration: read(0x6b), ramA3: read(0xa3) }, roundState: roundState(), ppuUpdate: ppuUpdate(),
    mapperBank, mapperBanksSeen: [...mapperBanksSeen].sort((left, right) => left - right), mapperWriteCount, inputReplayPairs: Array.from(readBytes(0x780, 0x40)), hudScore: hudScore(),
    ppu: { vramAddress: ppuAddress, coarseX: ppuAddress & 31, coarseY: (ppuAddress >>> 5) & 31, fineX: nes.ppu.scrollX & 7, fineY: (ppuAddress >>> 12) & 7, nametable: (ppuAddress >>> 10) & 3 },
    spriteOam: Array.from(nes.ppu.oam.slice(0, 32)), activeSprites: activeSprites(), frameHash: crypto.createHash("sha256").update(Buffer.from(nes.frame.buffer)).digest("hex").slice(0, 16),
  });
  mapperBanksSeen.clear(); mapperBanksSeen.add(mapperBank); mapperWriteCount = 0;
};

if (timeline) {
  for (let current = 0; current < 2_880; current += 1) {
    if (current === 180) buttonDown(Button.Start);
    if (current === 185) buttonUp(Button.Start);
    frame();
    if (current % 60 === 59) checkpoint(`timeline-${current + 1}`, Math.max(0, current + 1 - 825));
  }
  console.log(JSON.stringify(checkpoints, null, 2));
  process.exit(0);
}

runFrames(180); checkpoint("title", 0);
buttonDown(Button.Start); runFrames(5); buttonUp(Button.Start); runFrames(415); checkpoint("wanted-screen", 0);
runFrames(240); checkpoint("round-1-entry", 15);
runFrames(360); checkpoint("round-1-active", 375);
console.log(JSON.stringify(checkpoints, null, 2));
