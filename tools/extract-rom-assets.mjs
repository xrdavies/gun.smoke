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

for (let frame = 0; frame < 180; frame += 1) nes.frame();
writeScene("title.png");
nes.buttonDown(1, Controller.BUTTON_A);
for (let frame = 0; frame < 600; frame += 1) nes.frame();
nes.buttonUp(1, Controller.BUTTON_A);
writeScene("intro.png");
for (let frame = 0; frame < 900; frame += 1) nes.frame();
writeScene("scene.png");

writePatternTable();
fs.writeFileSync(path.join(output, "vram.bin"), Buffer.from(nes.ppu.vramMem));
fs.writeFileSync(path.join(output, "sprite-oam.bin"), Buffer.from(nes.ppu.spriteMem));
fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify({
  source: filename,
  sourceSha256: crypto.createHash("sha256").update(romData).digest("hex"),
  outputFiles: ["title.png", "intro.png", "scene.png", "pattern-table.png", "pattern-table-full.png", "vram.bin", "sprite-oam.bin"],
  note: "Local analysis output. Do not redistribute or commit extracted assets.",
}, null, 2));
console.log(`Extracted local reference assets to ${output}`);
