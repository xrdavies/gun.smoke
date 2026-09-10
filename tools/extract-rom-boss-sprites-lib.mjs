import fs from "node:fs";
import path from "node:path";
import { Button, NES_PALETTE, Nes } from "lib-jsnes";
import { PNG } from "pngjs";

const romPath = process.argv.slice(2).find((value) => !value.startsWith("--")) ?? "Gun.Smoke (USA).nes";
const outputRoot = process.argv.find((value) => value.startsWith("--out="))?.split("=")[1] ?? "public/assets/sprites";
const maxRounds = Number(process.argv.find((value) => value.startsWith("--rounds="))?.split("=")[1] ?? 6);
const stateFile = process.argv.find((value) => value.startsWith("--state="))?.split("=")[1];
const warmup = Number(process.argv.find((value) => value.startsWith("--warmup="))?.split("=")[1] ?? 0);
if (!Number.isInteger(maxRounds) || maxRounds < 1 || maxRounds > 6) throw new Error("--rounds must be between 1 and 6");
if (!Number.isInteger(warmup) || warmup < 0) throw new Error("--warmup must be a non-negative integer");
if (!fs.existsSync(romPath)) throw new Error(`Reference ROM not found: ${romPath}`);
fs.mkdirSync(outputRoot, { recursive: true });

const nes = new Nes(fs.readFileSync(romPath));
nes.reset();
const read = (address) => nes.read(address);
const write = (address, value) => nes.write(address, value);
let controller = 0;
const setButton = (button, pressed) => {
  controller = pressed ? controller | button : controller & ~button;
  nes.setController(1, controller);
};
const frame = () => nes.runFrame();
const run = (count) => { for (let index = 0; index < count; index += 1) frame(); };
if (stateFile) {
  const saved = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  if (saved.format !== "lib-jsnes" || typeof saved.state !== "string") throw new Error("State file is not a lib-jsnes export");
  nes.loadState(Buffer.from(saved.state, "base64"));
  run(warmup);
  setButton(Button.A, true);
  setButton(Button.B, true);
}
const captureLimit = stateFile ? 1 : maxRounds;
const stateCapture = Boolean(stateFile);

function activeBoss() {
  return (read(0x400 + 14) & 0x80) && read(0x420 + 14) >= 0x80 && read(0x5c0 + 14) > 20
    ? { x: read(0x5e0 + 14), y: read(0x5c0 + 14) }
    : undefined;
}

function captureBoss(name, origin) {
  const captureFrame = () => {
    const entries = [];
    for (let slot = 0; slot < 64; slot += 1) {
      const offset = slot * 4;
      const y = nes.ppu.oam[offset] ?? 0xff;
      const tile = nes.ppu.oam[offset + 1] ?? 0xff;
      const attr = nes.ppu.oam[offset + 2] ?? 0;
      const x = nes.ppu.oam[offset + 3] ?? 0xff;
      if (x >= origin.x - 32 && x < origin.x + 32 && (stateCapture || (y >= origin.y - 40 && y < origin.y + 32)) && y < 240 && tile !== 0xff && tile !== 88 && tile !== 116) entries.push({ slot, x, y, tile, attr });
    }
    if (!entries.length) throw new Error(`No OAM entries found for ${name}`);
    {
      const remaining = new Set(entries);
      const components = [];
      while (remaining.size) {
        const component = [];
        const queue = [remaining.values().next().value];
        remaining.delete(queue[0]);
        while (queue.length) {
          const entry = queue.pop();
          component.push(entry);
          for (const candidate of remaining) {
            if (Math.abs(candidate.x - entry.x) <= 8 && Math.abs(candidate.y - entry.y) <= 8) {
              remaining.delete(candidate);
              queue.push(candidate);
            }
          }
        }
        components.push(component);
      }
      entries.length = 0;
      entries.push(...components.sort((left, right) => right.length - left.length)[0]);
    }
    const left = Math.min(...entries.map(({ x }) => x));
    const top = Math.min(...entries.map(({ y }) => y));
    const right = Math.max(...entries.map(({ x }) => x + 8));
    const bottom = Math.max(...entries.map(({ y }) => y + 8));
    const width = Math.ceil((right - left) / 8) * 8;
    const height = Math.ceil((bottom - top) / 8) * 8;
    const pixels = new Uint32Array(width * height);
    const patternBase = nes.ppu.ctrl & 8 ? 0x1000 : 0;
    for (const { x, y, tile, attr } of entries) {
      for (let row = 0; row < 8; row += 1) {
        const sourceRow = attr & 0x80 ? 7 - row : row;
        const address = patternBase + tile * 16 + sourceRow;
        const low = nes.cartridge.readChr(address);
        const high = nes.cartridge.readChr(address + 8);
        for (let column = 0; column < 8; column += 1) {
          const sourceColumn = attr & 0x40 ? column : 7 - column;
          const value = ((low >> sourceColumn) & 1) | (((high >> sourceColumn) & 1) << 1);
          if (!value) continue;
          const palette = nes.ppu.palette[16 + (attr & 3) * 4 + value] ?? 0;
          pixels[(y - top + row) * width + x - left + column] = 0xff000000 | (NES_PALETTE[palette & 0x3f] ?? 0);
        }
      }
    }
    return { pixels, width, height };
  };
  const first = captureFrame();
  const frames = [first, { pixels: first.pixels.slice(), width: first.width, height: first.height }];
  const width = Math.max(...frames.map((value) => value.width));
  const height = Math.max(...frames.map((value) => value.height));
  const scale = 2;
  const png = new PNG({ width: width * 2 * scale, height: height * scale });
  for (const [animation, value] of frames.entries()) {
    for (let y = 0; y < value.height; y += 1) for (let x = 0; x < value.width; x += 1) {
      const color = value.pixels[y * value.width + x] ?? 0;
      for (let sy = 0; sy < scale; sy += 1) for (let sx = 0; sx < scale; sx += 1) {
        const offset = ((y * scale + sy) * png.width + (animation * width + x) * scale + sx) * 4;
        png.data[offset] = color >>> 16 & 0xff;
        png.data[offset + 1] = color >>> 8 & 0xff;
        png.data[offset + 2] = color & 0xff;
        png.data[offset + 3] = color >>> 24 & 0xff;
      }
    }
  }
  const output = path.join(outputRoot, `${name}.png`);
  fs.writeFileSync(output, PNG.sync.write(png));
  console.log(`Extracted ${name} ${width}x${height} OAM sprite to ${output}`);
}

if (!stateFile) {
  run(180);
  setButton(Button.Start, true);
  run(5);
  setButton(Button.Start, false);
  run(650);
  setButton(Button.A, true);
  setButton(Button.B, true);
}

const seen = new Set();
let lastRound = read(0x41);
let startPulse = 0;
for (let current = 0; current < 120_000 && seen.size < captureLimit; current += 1) {
  const roundIndex = read(0x41);
  if (roundIndex !== lastRound) {
    lastRound = roundIndex;
    startPulse = 5;
  }
  setButton(Button.Start, startPulse > 0);
  if (startPulse > 0) startPulse -= 1;
  const mapPointer = read(0x5a) | (read(0x5b) << 8);
  const mapEnd = read(0x5e) | (read(0x5f) << 8);
  if (read(0x4b) === 0 && mapPointer >= mapEnd - 24) write(0x49, 1);
  write(0x7c, 255);
  const boss = activeBoss();
  if (boss) {
    const round = read(0x41) + 1;
    if (!seen.has(round)) {
      captureBoss(`boss-${round}`, boss);
      seen.add(round);
    }
    write(0x74, boss.x);
    write(0x71, Math.min(216, boss.y + 64));
    write(0x88, 4);
    write(0x9c, 255);
    if (current % 5 === 0) setButton(Button.A, true);
    else setButton(Button.A, false);
    if (current % 5 === 0) setButton(Button.B, true);
    else setButton(Button.B, false);
    for (let slot = 2; slot < 14; slot += 1) write(0x400 + slot, 0);
    for (let slot = 24; slot < 32; slot += 1) write(0x400 + slot, 0);
  }
  else if (startPulse === 0) {
    setButton(Button.A, true);
    setButton(Button.B, true);
  }
  frame();
}
setButton(Button.A, false);
setButton(Button.B, false);
if (seen.size !== captureLimit) throw new Error(`Captured ${seen.size}/${captureLimit} Boss sprites before the frame limit`);
