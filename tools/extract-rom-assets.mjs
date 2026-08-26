import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Controller, NES } from "jsnes";
import { PNG } from "pngjs";

const filename = process.argv[2] ?? "Gun.Smoke.ZH.NES";
const output = process.argv[3] ?? ".rom-assets";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
fs.mkdirSync(output, { recursive: true });

const romData = fs.readFileSync(filename);
const rom = romData.toString("binary");
let lastFrame;
const nes = new NES({ onFrame: (frame) => { lastFrame = frame; }, onAudioSample: () => {} });
nes.loadROM(rom);

function writeRgbaPng(name, width, height, readPixel) {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [red, green, blue, alpha] = readPixel(x, y);
      const offset = (y * width + x) * 4;
      png.data[offset] = red;
      png.data[offset + 1] = green;
      png.data[offset + 2] = blue;
      png.data[offset + 3] = alpha;
    }
  }
  fs.writeFileSync(path.join(output, name), PNG.sync.write(png));
}

function writePatternTable() {
  const bytes = nes.ppu.vramMem;
  const palette = [0, 76, 166, 255];
  const pixel = (x, y) => {
    const tileX = Math.floor(x / 8);
    const tileY = Math.floor(y / 8);
    const tile = tileY * 16 + tileX;
    const row = y % 8;
    const column = 7 - (x % 8);
    const low = bytes[tile * 16 + row] ?? 0;
    const high = bytes[tile * 16 + row + 8] ?? 0;
    const value = ((high >> column) & 1) * 2 + ((low >> column) & 1);
    const color = palette[value] ?? 0;
    return [color, color, color, 255];
  };
  writeRgbaPng("pattern-table.png", 128, 128, pixel);
  writeRgbaPng("pattern-table-full.png", 256, 128, (x, y) => pixel(x, y));
}

function writeScene(name) {
  if (!lastFrame) return;
  writeRgbaPng(name, 256, 240, (x, y) => {
    const value = lastFrame[y * 256 + x] ?? 0;
    return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff, 255];
  });
}

function writeNameTables() {
  const baseTile = nes.ppu.f_bgPatternTable === 0 ? 0 : 256;
  const palette = [0, 96, 176, 255];
  for (let tableIndex = 0; tableIndex < nes.ppu.nameTable.length; tableIndex += 1) {
    const table = nes.ppu.nameTable[tableIndex];
    fs.writeFileSync(path.join(output, `nametable-${tableIndex}.bin`), Buffer.from(table.tile));
    fs.writeFileSync(path.join(output, `attributes-${tableIndex}.bin`), Buffer.from(table.attrib));
    writeRgbaPng(`nametable-${tableIndex}.png`, 256, 240, (x, y) => {
      const tileX = Math.floor(x / 8);
      const tileY = Math.floor(y / 8);
      const tileIndex = table.tile[tileY * 32 + tileX] ?? 0;
      const row = y % 8;
      const column = 7 - (x % 8);
      const address = (baseTile + tileIndex) * 16;
      const low = nes.ppu.vramMem[address + row] ?? 0;
      const high = nes.ppu.vramMem[address + row + 8] ?? 0;
      const value = ((high >> column) & 1) * 2 + ((low >> column) & 1);
      const color = palette[value] ?? 0;
      return [color, color, color, 255];
    });
  }
}

function nameTableSummary() {
  return nes.ppu.nameTable.map((table, index) => {
    const tiles = Array.from(table.tile.slice(0, 32 * 30));
    const counts = new Map();
    for (const tile of tiles) counts.set(tile, (counts.get(tile) ?? 0) + 1);
    const dominantTile = [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 0;
    const occupied = [];
    for (let tileY = 0; tileY < 30; tileY += 1) {
      for (let tileX = 0; tileX < 32; tileX += 1) {
        if (tiles[tileY * 32 + tileX] !== dominantTile) occupied.push([tileX, tileY]);
      }
    }
    return {
      index,
      sha256: crypto.createHash("sha256").update(Buffer.from(tiles)).digest("hex"),
      dominantTile,
      uniqueTileCount: counts.size,
      nonDominantBounds: occupied.length === 0 ? null : {
        left: Math.min(...occupied.map(([x]) => x)),
        top: Math.min(...occupied.map(([, y]) => y)),
        right: Math.max(...occupied.map(([x]) => x)),
        bottom: Math.max(...occupied.map(([, y]) => y)),
      },
    };
  });
}

for (let frame = 0; frame < 180; frame += 1) nes.frame();
writeScene("title.png");
nes.buttonDown(1, Controller.BUTTON_START);
for (let frame = 0; frame < 5; frame += 1) nes.frame();
nes.buttonUp(1, Controller.BUTTON_START);
for (let frame = 0; frame < 415; frame += 1) nes.frame();
writeScene("wanted-screen.png");
for (let frame = 0; frame < 600; frame += 1) nes.frame();
writeScene("round-1.png");

writePatternTable();
writeNameTables();
fs.writeFileSync(path.join(output, "vram.bin"), Buffer.from(nes.ppu.vramMem));
fs.writeFileSync(path.join(output, "sprite-oam.bin"), Buffer.from(nes.ppu.spriteMem));
fs.writeFileSync(path.join(output, "nametable-summary.json"), JSON.stringify(nameTableSummary(), null, 2));
fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify({
  source: filename,
  sourceSha256: crypto.createHash("sha256").update(romData).digest("hex"),
  outputFiles: ["title.png", "wanted-screen.png", "round-1.png", "pattern-table.png", "pattern-table-full.png", "nametable-{0..3}.png", "nametable-{0..3}.bin", "attributes-{0..3}.bin", "nametable-summary.json", "vram.bin", "sprite-oam.bin"],
  note: "Local analysis output. Do not redistribute or commit extracted assets.",
}, null, 2));
console.log(`Extracted local reference assets to ${output}`);
