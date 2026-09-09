import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Button, Nes } from "lib-jsnes";

const args = process.argv.slice(2);
const filename = args.find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke (USA).nes";
const frames = Number(args.find((argument) => argument.startsWith("--frames="))?.split("=")[1] ?? 12_000);
const every = Number(args.find((argument) => argument.startsWith("--every="))?.split("=")[1] ?? 60);
const holdFire = args.includes("--hold-ab");
const pulseFire = args.includes("--pulse-fire");
const output = args.find((argument) => argument.startsWith("--out="))?.split("=")[1] ?? ".rom-traces/scenes.json";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
if (!Number.isInteger(frames) || frames <= 0 || !Number.isInteger(every) || every <= 0) throw new Error("--frames and --every must be positive integers");
if (holdFire && pulseFire) throw new Error("Choose either --hold-ab or --pulse-fire");

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
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);

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

const activeOam = () => {
  const entries = [];
  for (let index = 0; index < nes.ppu.oam.length; index += 4) {
    const y = nes.ppu.oam[index] ?? 0xff;
    if (y !== 0xf8 && y !== 0xff) entries.push([y, nes.ppu.oam[index + 1] ?? 0, nes.ppu.oam[index + 2] ?? 0, nes.ppu.oam[index + 3] ?? 0]);
  }
  return entries;
};
const tableAddress = (tableIndex, offset) => {
  let physical = tableIndex;
  if (nes.rom.mirroring === "single-lower") physical = 0;
  else if (nes.rom.mirroring === "single-upper") physical = 1;
  else if (nes.rom.mirroring === "horizontal") physical >>>= 1;
  else if (nes.rom.mirroring === "vertical") physical &= 1;
  return 0x2000 + physical * 0x400 + offset;
};
const nameTableHashes = () => Array.from({ length: 4 }, (_, table) => sha(Buffer.from(Uint8Array.from({ length: 32 * 30 }, (_, index) => nes.ppu.vram[tableAddress(table, index)] ?? 0))));
const activeEntities = () => Array.from({ length: 32 }, (_, slot) => slot).filter((slot) => read(0x400 + slot) & 0x80).map((slot) => ({
  slot, state: read(0x400 + slot), dispatchType: read(0x420 + slot), variant: read(0x480 + slot), x: read(0x5e0 + slot), y: read(0x5c0 + slot), scriptFlags: read(0x560 + slot),
}));
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
const roundState = () => ({ roundIndex: read(0x41), roundNumber: read(0x41) + 1, mapPointer: read(0x5a) | (read(0x5b) << 8), mapEnd: read(0x5e) | (read(0x5f) << 8), mapPage: read(0x5c), player: { x: read(0x74), y: read(0x71) } });
const sample = (sampleFrame) => {
  const oam = activeOam();
  const ppuAddress = nes.ppu.addr;
  const value = {
    frame: sampleFrame,
    gameFrame: Math.max(0, sampleFrame - 825),
    ram: { "0x4c": read(0x4c), "0x4f": read(0x4f), "0x62": read(0x62), "0x68": read(0x68), "0x69": read(0x69), "0x7a": read(0x7a) },
    inputReplayCursor: { slot: read(0x6a), duration: read(0x6b), ramA3: read(0xa3) },
    roundState: roundState(), ppuUpdate: ppuUpdate(), mapperBank, mapperBanksSeen: [...mapperBanksSeen].sort((left, right) => left - right), mapperWriteCount,
    inputReplayPairs: Array.from(readBytes(0x780, 0x40)), hudScore: hudScore(),
    ppu: { coarseX: ppuAddress & 31, coarseY: (ppuAddress >>> 5) & 31, fineX: nes.ppu.scrollX & 7, fineY: (ppuAddress >>> 12) & 7, nametable: (ppuAddress >>> 10) & 3, rawVramAddress: ppuAddress },
    activeSprites: oam.length, activeEntities: activeEntities(), oamHash: sha(Buffer.from(oam.flat())), frameHash: sha(Buffer.from(nes.frame.buffer)), nameTableHashes: nameTableHashes(),
  };
  mapperBanksSeen.clear(); mapperBanksSeen.add(mapperBank); mapperWriteCount = 0;
  return value;
};

runFrames(180);
buttonDown(Button.Start); runFrames(5); buttonUp(Button.Start); runFrames(640);
if (holdFire) { buttonDown(Button.A); buttonDown(Button.B); }
mapperBanksSeen.clear(); mapperBanksSeen.add(mapperBank); mapperWriteCount = 0;
const samples = [];
for (let current = 0; current < frames; current += 1) {
  if (pulseFire && current % 4 === 0) buttonDown(current / 4 % 2 === 0 ? Button.B : Button.A);
  if (pulseFire && current % 4 === 1) { buttonUp(Button.A); buttonUp(Button.B); }
  frame();
  if ((current + 1) % every === 0) samples.push(sample(current + 1 + 825));
}
if (holdFire) { buttonUp(Button.A); buttonUp(Button.B); }
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({ source: filename, sourceSha256: crypto.createHash("sha256").update(romBytes).digest("hex"), startFrame: 825, frames, every, holdFire, pulseFire, samples }, null, 2));
console.log(`Wrote ${samples.length} ROM scene samples to ${output}`);
