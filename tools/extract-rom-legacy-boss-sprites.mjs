import fs from "node:fs";
import path from "node:path";
import { NES } from "jsnes";
import { NES_PALETTE } from "lib-jsnes";
import { PNG } from "pngjs";

const args = process.argv.slice(2);
const option = (name, fallback) => args.find((value) => value.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;
const round = Number(option("round", 3));
const frameCount = Number(option("frame", round === 3 ? 0 : round === 4 ? 40 : round === 5 ? 80 : 80));
const romPath = args.find((value) => !value.startsWith("--")) ?? "Gun.Smoke (USA).nes";
const statePath = option("state", `.rom-traces/round${round}-boss-state.json`);
const output = option("out", `public/assets/sprites/boss-${round}.png`);
if (!Number.isInteger(round) || round < 2 || round > 6) throw new Error("--round must be between 2 and 6");
if (!Number.isInteger(frameCount) || frameCount < 0) throw new Error("--frame must be a non-negative integer");
if (!fs.existsSync(romPath)) throw new Error(`Reference ROM not found: ${romPath}`);
if (!fs.existsSync(statePath)) throw new Error(`Legacy state not found: ${statePath}`);

const nes = new NES();
nes.loadROM(fs.readFileSync(romPath));
nes.fromJSON(JSON.parse(fs.readFileSync(statePath, "utf8")));
for (let index = 0; index <= frameCount; index += 1) nes.frame();

const bossX = nes.cpu.mem[0x5e0 + 14] ?? 128;
const bossY = nes.cpu.mem[0x5c0 + 14] ?? 64;
const entries = [];
for (let slot = 0; slot < 64; slot += 1) {
  const offset = slot * 4;
  const y = nes.ppu.spriteMem[offset] ?? 0xff;
  const tile = nes.ppu.spriteMem[offset + 1] ?? 0xff;
  const attr = nes.ppu.spriteMem[offset + 2] ?? 0;
  const x = nes.ppu.spriteMem[offset + 3] ?? 0xff;
  if (tile !== 0xff && y < 240 && x < 256 && Math.abs(x - bossX) < 80 && Math.abs(y - bossY) < 120) entries.push({ slot, x, y, tile, attr });
}
const remaining = new Set(entries);
const components = [];
while (remaining.size) {
  const first = remaining.values().next().value;
  remaining.delete(first);
  const component = [first];
  const queue = [first];
  while (queue.length) {
    const entry = queue.pop();
    for (const candidate of remaining) {
      if (Math.abs(candidate.x - entry.x) <= 8 && Math.abs(candidate.y - entry.y) <= 8) {
        remaining.delete(candidate);
        queue.push(candidate);
        component.push(candidate);
      }
    }
  }
  components.push(component);
}
const candidates = components.filter((component) => component.length >= 4);
if (!candidates.length) throw new Error(`No Boss OAM component found near (${bossX}, ${bossY}) at frame ${frameCount}`);
candidates.sort((left, right) => {
  const score = (component) => {
    const x = (Math.min(...component.map((entry) => entry.x)) + Math.max(...component.map((entry) => entry.x + 8))) / 2;
    const y = (Math.min(...component.map((entry) => entry.y)) + Math.max(...component.map((entry) => entry.y + 8))) / 2;
    return component.length * 1000 - Math.abs(x - bossX) - Math.abs(y - bossY);
  };
  return score(right) - score(left);
});
const component = candidates[0];
const left = Math.min(...component.map((entry) => entry.x));
const top = Math.min(...component.map((entry) => entry.y));
const right = Math.max(...component.map((entry) => entry.x + 8));
const bottom = Math.max(...component.map((entry) => entry.y + 8));
const width = Math.ceil((right - left) / 8) * 8;
const height = Math.ceil((bottom - top) / 8) * 8;
const scale = 2;
const png = new PNG({ width: width * 2 * scale, height: height * scale });
for (const entry of component) {
  for (let row = 0; row < 8; row += 1) {
    const sourceRow = entry.attr & 0x80 ? 7 - row : row;
    const address = (nes.ppu.f_spPatternTable ? 0x1000 : 0) + entry.tile * 16 + sourceRow;
    const low = nes.ppu.vramMem[address] ?? 0;
    const high = nes.ppu.vramMem[address + 8] ?? 0;
    for (let column = 0; column < 8; column += 1) {
      const sourceColumn = entry.attr & 0x40 ? column : 7 - column;
      const value = ((low >> sourceColumn) & 1) | (((high >> sourceColumn) & 1) << 1);
      if (!value) continue;
      const paletteIndex = nes.ppu.vramMem[0x3f10 + (entry.attr & 3) * 4 + value] & 0x3f;
      const color = NES_PALETTE[paletteIndex] ?? 0;
      for (let sy = 0; sy < scale; sy += 1) for (let sx = 0; sx < scale; sx += 1) {
        const offset = ((entry.y - top + row) * scale * png.width + (entry.x - left + column) * scale + sx) * 4 + sy * png.width * 4;
        png.data[offset] = color >>> 16 & 0xff;
        png.data[offset + 1] = color >>> 8 & 0xff;
        png.data[offset + 2] = color & 0xff;
        png.data[offset + 3] = 0xff;
      }
    }
  }
}
for (let y = 0; y < png.height; y += 1) {
  for (let x = 0; x < width * scale; x += 1) {
    const source = (y * png.width + x) * 4;
    const target = (y * png.width + x + width * scale) * 4;
    png.data[target] = png.data[source];
    png.data[target + 1] = png.data[source + 1];
    png.data[target + 2] = png.data[source + 2];
    png.data[target + 3] = png.data[source + 3];
  }
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, PNG.sync.write(png));
console.log(`Extracted round ${round} legacy Boss component (${component.length} OAM tiles, ${width}x${height}) to ${output}`);
