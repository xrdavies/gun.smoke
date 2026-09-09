import fs from "node:fs";
import path from "node:path";
import { NES_PALETTE, Nes, Button } from "lib-jsnes";
import { PNG } from "pngjs";

const romPath = process.argv.slice(2).find((value) => !value.startsWith("--")) ?? "Gun.Smoke (USA).nes";
if (!fs.existsSync(romPath)) throw new Error(`Reference ROM not found: ${romPath}`);
const nes = new Nes(fs.readFileSync(romPath));
nes.reset();
const frames = (count) => { for (let index = 0; index < count; index += 1) nes.runFrame(); };
frames(180);
nes.setController(1, Button.Start);
frames(5);
nes.setController(1, 0);
frames(1_015);

const slot = Array.from({ length: 7 }, (_, index) => index + 16).find((index) => nes.read(0x400 + index) & 0x80 && nes.read(0x420 + index) === 0x57);
if (slot === undefined) throw new Error("Gunman dispatch $57 was not active at the capture frame");
const entityX = nes.read(0x5e0 + slot);
const entityY = nes.read(0x5c0 + slot);
const entries = [];
for (let index = 0; index < 64; index += 1) {
  const offset = index * 4;
  const y = nes.ppu.oam[offset] ?? 0xff;
  const x = nes.ppu.oam[offset + 3] ?? 0xff;
  if (x >= entityX - 8 && x < entityX + 8 && y >= entityY - 16 && y < entityY + 8) {
    entries.push({ x, y, tile: nes.ppu.oam[offset + 1] ?? 0xff, attr: nes.ppu.oam[offset + 2] ?? 0 });
  }
}
if (entries.length !== 6) throw new Error(`Expected six Gunman OAM entries, found ${entries.length}`);
const originX = Math.min(...entries.map(({ x }) => x));
const originY = Math.min(...entries.map(({ y }) => y));
const pixels = new Uint32Array(16 * 24);
const patternBase = nes.ppu.ctrl & 8 ? 0x1000 : 0;
for (const { x, y, tile, attr } of entries) {
  for (let row = 0; row < 8; row += 1) {
    const sy = attr & 0x80 ? 7 - row : row;
    const address = patternBase + tile * 16 + sy;
    const low = nes.cartridge.readChr(address);
    const high = nes.cartridge.readChr(address + 8);
    for (let column = 0; column < 8; column += 1) {
      const sx = attr & 0x40 ? column : 7 - column;
      const value = ((low >> sx) & 1) | (((high >> sx) & 1) << 1);
      if (!value) continue;
      const paletteIndex = nes.ppu.palette[16 + (attr & 3) * 4 + value] ?? 0;
      const color = NES_PALETTE[paletteIndex & 0x3f] ?? 0;
      pixels[(y - originY + row) * 16 + x - originX + column] = 0xff000000 | color;
    }
  }
}
const png = new PNG({ width: 32, height: 48 });
for (let y = 0; y < 24; y += 1) for (let x = 0; x < 16; x += 1) {
  const color = pixels[y * 16 + x] ?? 0;
  for (let sy = 0; sy < 2; sy += 1) for (let sx = 0; sx < 2; sx += 1) {
    const offset = ((y * 2 + sy) * png.width + x * 2 + sx) * 4;
    png.data[offset] = color >>> 16 & 0xff;
    png.data[offset + 1] = color >>> 8 & 0xff;
    png.data[offset + 2] = color & 0xff;
    png.data[offset + 3] = color >>> 24 & 0xff;
  }
}
fs.writeFileSync(path.resolve("public/assets/sprites/gunman.png"), PNG.sync.write(png));
