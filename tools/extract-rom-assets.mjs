import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NES_PALETTE, Nes, Button } from "lib-jsnes";
import { PNG } from "pngjs";

const filename = process.argv[2] ?? "Gun.Smoke (USA).nes";
const output = process.argv[3] ?? ".rom-assets";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
fs.mkdirSync(output, { recursive: true });

const romData = fs.readFileSync(filename);
const nes = new Nes(romData);
nes.reset();
const frame = () => nes.runFrame();
const frames = (count) => { for (let index = 0; index < count; index += 1) frame(); };

function writeRgbaPng(name, width, height, readPixel) {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const [red, green, blue, alpha] = readPixel(x, y);
    const offset = (y * width + x) * 4;
    png.data[offset] = red; png.data[offset + 1] = green; png.data[offset + 2] = blue; png.data[offset + 3] = alpha;
  }
  fs.writeFileSync(path.join(output, name), PNG.sync.write(png));
}

const patternPixel = (x, y, columns) => {
  const tile = Math.floor(y / 8) * columns + Math.floor(x / 8);
  const row = y & 7;
  const column = 7 - (x & 7);
  const address = tile * 16 + row;
  const low = nes.cartridge.readChr(address);
  const high = nes.cartridge.readChr(address + 8);
  const value = ((high >> column) & 1) * 2 + ((low >> column) & 1);
  const color = [0, 76, 166, 255][value] ?? 0;
  return [color, color, color, 255];
};
const writePatternTable = () => {
  writeRgbaPng("pattern-table.png", 128, 128, (x, y) => patternPixel(x, y, 16));
  writeRgbaPng("pattern-table-full.png", 256, 128, (x, y) => patternPixel(x, y, 32));
};

const writeScene = (name) => writeRgbaPng(name, 256, 240, (x, y) => {
  const value = nes.frame[y * 256 + x] ?? 0;
  return [value >>> 16 & 0xff, value >>> 8 & 0xff, value & 0xff, 255];
});

const tableAddress = (tableIndex, offset) => {
  let physical = tableIndex;
  if (nes.rom.mirroring === "single-lower") physical = 0;
  else if (nes.rom.mirroring === "single-upper") physical = 1;
  else if (nes.rom.mirroring === "horizontal") physical >>>= 1;
  else if (nes.rom.mirroring === "vertical") physical &= 1;
  return 0x2000 + physical * 0x400 + offset;
};
const tableBytes = (tableIndex) => {
  const tile = new Uint8Array(32 * 30);
  const attribute = new Uint8Array(64);
  for (let index = 0; index < tile.length; index += 1) tile[index] = nes.ppu.vram[tableAddress(tableIndex, index)] ?? 0;
  for (let index = 0; index < attribute.length; index += 1) attribute[index] = nes.ppu.vram[tableAddress(tableIndex, 0x3c0 + index)] ?? 0;
  return { tile, attribute };
};
const tablePalette = (attribute, tileX, tileY, value) => {
  if (!value) return nes.ppu.palette[0] ?? 0;
  const attributeByte = attribute[Math.floor(tileY / 4) * 8 + Math.floor(tileX / 4)] ?? 0;
  const shift = ((tileY & 2) ? 4 : 0) | ((tileX & 2) ? 2 : 0);
  return nes.ppu.palette[((attributeByte >> shift) & 3) * 4 + value] ?? 0;
};
const writeNameTables = () => {
  const patternBase = nes.ppu.ctrl & 16 ? 0x1000 : 0;
  for (let tableIndex = 0; tableIndex < 4; tableIndex += 1) {
    const { tile, attribute } = tableBytes(tableIndex);
    fs.writeFileSync(path.join(output, `nametable-${tableIndex}.bin`), Buffer.from(tile));
    fs.writeFileSync(path.join(output, `attributes-${tableIndex}.bin`), Buffer.from(attribute));
    writeRgbaPng(`nametable-${tableIndex}.png`, 256, 240, (x, y) => {
      const tileX = Math.floor(x / 8); const tileY = Math.floor(y / 8);
      const tileIndexValue = tile[tileY * 32 + tileX] ?? 0;
      const row = y & 7; const column = 7 - (x & 7);
      const address = patternBase + tileIndexValue * 16 + row;
      const value = ((nes.cartridge.readChr(address + 8) >> column) & 1) * 2 + ((nes.cartridge.readChr(address) >> column) & 1);
      const color = NES_PALETTE[tablePalette(attribute, tileX, tileY, value) & 0x3f] ?? 0;
      return [color >>> 16 & 0xff, color >>> 8 & 0xff, color & 0xff, 255];
    });
  }
};
const nameTableSummary = () => Array.from({ length: 4 }, (_, index) => {
  const { tile } = tableBytes(index);
  const counts = new Map();
  for (const value of tile) counts.set(value, (counts.get(value) ?? 0) + 1);
  const dominantTile = [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 0;
  const occupied = [];
  for (let tileY = 0; tileY < 30; tileY += 1) for (let tileX = 0; tileX < 32; tileX += 1) if (tile[tileY * 32 + tileX] !== dominantTile) occupied.push([tileX, tileY]);
  return {
    index,
    sha256: crypto.createHash("sha256").update(Buffer.from(tile)).digest("hex"),
    dominantTile,
    uniqueTileCount: counts.size,
    nonDominantBounds: occupied.length === 0 ? null : { left: Math.min(...occupied.map(([x]) => x)), top: Math.min(...occupied.map(([, y]) => y)), right: Math.max(...occupied.map(([x]) => x)), bottom: Math.max(...occupied.map(([, y]) => y)) },
  };
});

frames(180);
writeScene("title.png");
nes.setController(1, Button.Start);
frames(5);
nes.setController(1, 0);
frames(415);
writeScene("wanted-screen.png");
frames(600);
writeScene("round-1.png");
writePatternTable();
writeNameTables();
fs.writeFileSync(path.join(output, "vram.bin"), Buffer.from(nes.ppu.vram));
fs.writeFileSync(path.join(output, "sprite-oam.bin"), Buffer.from(nes.ppu.oam));
fs.writeFileSync(path.join(output, "nametable-summary.json"), JSON.stringify(nameTableSummary(), null, 2));
fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify({
  source: filename,
  sourceSha256: crypto.createHash("sha256").update(romData).digest("hex"),
  outputFiles: ["title.png", "wanted-screen.png", "round-1.png", "pattern-table.png", "pattern-table-full.png", "nametable-{0..3}.png", "nametable-{0..3}.bin", "attributes-{0..3}.bin", "nametable-summary.json", "vram.bin", "sprite-oam.bin"],
  note: "Local analysis output. Do not redistribute or commit extracted assets.",
}, null, 2));
console.log(`Extracted local reference assets to ${output}`);
