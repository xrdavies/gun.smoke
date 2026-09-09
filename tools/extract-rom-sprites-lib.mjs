import fs from "node:fs";
import path from "node:path";
import { Button, NES_PALETTE, Nes } from "lib-jsnes";
import { PNG } from "pngjs";

const romPath = process.argv.slice(2).find((value) => !value.startsWith("--")) ?? "Gun.Smoke (USA).nes";
if (!fs.existsSync(romPath)) throw new Error(`Reference ROM not found: ${romPath}`);
const nes = new Nes(fs.readFileSync(romPath));
nes.reset();

function frames(count) { for (let index = 0; index < count; index += 1) nes.runFrame(); }
function playerPixels() {
  const ppu = nes.ppu;
  const control = ppu.ctrl ?? 0;
  const mask = ppu.mask ?? 0;
  const pixels = new Uint32Array(16 * 24);
  const entries = [];
  for (let index = 0; index < 64; index += 1) {
    const offset = index * 4;
    const y = ppu.oam[offset] ?? 0xff;
    const tile = ppu.oam[offset + 1] ?? 0xff;
    const attr = ppu.oam[offset + 2] ?? 0;
    const x = ppu.oam[offset + 3] ?? 0xff;
    if (x >= 128 && x < 144 && y >= 165 && y < 189 && tile < 4) entries.push({ x, y, tile, attr });
  }
  if (entries.length !== 6) throw new Error(`Expected six player OAM entries, found ${entries.length}`);
  for (const { x, y, tile, attr } of entries) {
    for (let row = 0; row < 8; row += 1) {
      const sy = attr & 0x80 ? 7 - row : row;
      const address = (control & 8 ? 0x1000 : 0) + tile * 16 + sy;
      const low = nes.cartridge.readChr(address);
      const high = nes.cartridge.readChr(address + 8);
      for (let column = 0; column < 8; column += 1) {
        const sx = attr & 0x40 ? column : 7 - column;
        const value = ((low >> sx) & 1) | (((high >> sx) & 1) << 1);
        if (!value) continue;
        const paletteIndex = ppu.palette[16 + (attr & 3) * 4 + value] ?? 0;
        const colorIndex = paletteIndex & (mask & 1 ? 0x30 : 0x3f);
        pixels[(y - 165 + row) * 16 + x - 128 + column] = 0xff000000 | (NES_PALETTE[colorIndex] ?? 0);
      }
    }
  }
  return pixels;
}

frames(180);
nes.setController(1, Button.Start);
frames(5);
nes.setController(1, 0);
frames(415 + 600);
const first = playerPixels();
nes.runFrame();
const second = playerPixels();
const png = new PNG({ width: 64, height: 48 });
for (const [frame, pixels] of [first, second].entries()) {
  for (let y = 0; y < 24; y += 1) for (let x = 0; x < 16; x += 1) {
    const color = pixels[y * 16 + x] ?? 0;
    const offsetX = frame * 32 + x * 2;
    const offsetY = y * 2;
    for (let sy = 0; sy < 2; sy += 1) for (let sx = 0; sx < 2; sx += 1) {
      const offset = ((offsetY + sy) * png.width + offsetX + sx) * 4;
      png.data[offset] = color >>> 16 & 0xff;
      png.data[offset + 1] = color >>> 8 & 0xff;
      png.data[offset + 2] = color & 0xff;
      png.data[offset + 3] = color >>> 24 & 0xff;
    }
  }
}
fs.writeFileSync(path.resolve("public/assets/sprites/player.png"), PNG.sync.write(png));
