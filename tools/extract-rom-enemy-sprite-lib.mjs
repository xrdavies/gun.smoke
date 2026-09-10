import fs from "node:fs";
import path from "node:path";
import { NES_PALETTE, Nes } from "lib-jsnes";
import { PNG } from "pngjs";

const args = process.argv.slice(2);
const option = (name, fallback) => args.find((value) => value.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;
const romPath = args.find((value) => !value.startsWith("--")) ?? "Gun.Smoke (USA).nes";
const statePath = option("state");
const slots = option("slots", "22,23").split(",").map((value) => Number(value));
const output = option("out", "public/assets/sprites/sniper.png");
if (!statePath || !fs.existsSync(statePath)) throw new Error("--state must point to a lib-jsnes state export");
if (!fs.existsSync(romPath)) throw new Error(`Reference ROM not found: ${romPath}`);
if (slots.length === 0 || slots.some((slot) => !Number.isInteger(slot) || slot < 0 || slot >= 64)) throw new Error("--slots must contain OAM slot numbers");

const nes = new Nes(fs.readFileSync(romPath));
nes.reset();
const saved = JSON.parse(fs.readFileSync(statePath, "utf8"));
if (saved.format !== "lib-jsnes" || typeof saved.state !== "string") throw new Error("State file is not a lib-jsnes export");
nes.loadState(Buffer.from(saved.state, "base64"));
const entries = slots.map((slot) => {
  const offset = slot * 4;
  return { x: nes.ppu.oam[offset + 3] ?? 0xff, y: nes.ppu.oam[offset] ?? 0xff, tile: nes.ppu.oam[offset + 1] ?? 0xff, attr: nes.ppu.oam[offset + 2] ?? 0 };
}).filter((entry) => entry.tile !== 0xff && entry.x < 256 && entry.y < 240);
if (!entries.length) throw new Error("No visible OAM entries selected");
const left = Math.min(...entries.map((entry) => entry.x));
const top = Math.min(...entries.map((entry) => entry.y));
const width = Math.max(...entries.map((entry) => entry.x + 8)) - left;
const height = Math.max(...entries.map((entry) => entry.y + 8)) - top;
const scale = 2;
const png = new PNG({ width: width * scale * 2, height: height * scale });
for (const entry of entries) {
  for (let row = 0; row < 8; row += 1) {
    const sourceRow = entry.attr & 0x80 ? 7 - row : row;
    const address = (nes.ppu.ctrl & 8 ? 0x1000 : 0) + entry.tile * 16 + sourceRow;
    const low = nes.cartridge.readChr(address);
    const high = nes.cartridge.readChr(address + 8);
    for (let column = 0; column < 8; column += 1) {
      const sourceColumn = entry.attr & 0x40 ? column : 7 - column;
      const value = ((low >> sourceColumn) & 1) | (((high >> sourceColumn) & 1) << 1);
      if (!value) continue;
      const palette = nes.ppu.palette[16 + (entry.attr & 3) * 4 + value] ?? 0;
      const color = NES_PALETTE[palette & 0x3f] ?? 0;
      for (let animation = 0; animation < 2; animation += 1) for (let sy = 0; sy < scale; sy += 1) for (let sx = 0; sx < scale; sx += 1) {
        const offset = ((entry.y - top + row) * scale * png.width + animation * width * scale + (entry.x - left + column) * scale + sx + sy * png.width) * 4;
        png.data[offset] = color >>> 16 & 0xff;
        png.data[offset + 1] = color >>> 8 & 0xff;
        png.data[offset + 2] = color & 0xff;
        png.data[offset + 3] = 0xff;
      }
    }
  }
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, PNG.sync.write(png));
console.log(`Extracted ${entries.length} OAM tiles to ${output}`);
