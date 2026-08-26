import crypto from "node:crypto";
import fs from "node:fs";
import { Controller, NES } from "jsnes";

const timeline = process.argv.includes("--timeline");
const filename = process.argv.slice(2).find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke.ZH.NES";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}

const rom = fs.readFileSync(filename).toString("binary");
let lastFrame;
const nes = new NES({ onFrame: (frame) => { lastFrame = frame; }, onAudioSample: () => {} });
nes.loadROM(rom);

const checkpoints = [];
const activeSprites = () => {
  let count = 0;
  for (let index = 0; index < nes.ppu.spriteMem.length; index += 4) {
    const y = nes.ppu.spriteMem[index] ?? 0xff;
    if (y !== 0xf8 && y !== 0xff) count += 1;
  }
  return count;
};
const checkpoint = (label, gameFrame) => {
  const frameHash = lastFrame
    ? crypto.createHash("sha256").update(Buffer.from(lastFrame.buffer)).digest("hex").slice(0, 16)
    : undefined;
  checkpoints.push({
    label,
    gameFrame,
    pc: `$${nes.cpu.REG_PC.toString(16).padStart(4, "0")}`,
    ram: {
      "0x4c": nes.cpu.mem[0x4c],
      "0x4f": nes.cpu.mem[0x4f],
      "0x62": nes.cpu.mem[0x62],
      "0x68": nes.cpu.mem[0x68],
      "0x69": nes.cpu.mem[0x69],
      "0x7a": nes.cpu.mem[0x7a],
    },
    ppu: {
      vramAddress: nes.ppu.vramAddress,
      coarseX: nes.ppu.regHT,
      coarseY: nes.ppu.regVT,
      fineX: nes.ppu.regFH,
      fineY: nes.ppu.regFV,
      nametable: nes.ppu.curNt,
    },
    spriteOam: Array.from(nes.ppu.spriteMem.slice(0, 32)),
    activeSprites: activeSprites(),
    frameHash,
  });
};

if (timeline) {
  for (let frame = 0; frame < 2_880; frame += 1) {
    if (frame === 180) nes.buttonDown(1, Controller.BUTTON_START);
    if (frame === 185) nes.buttonUp(1, Controller.BUTTON_START);
    nes.frame();
    if (frame % 60 === 59) checkpoint(`timeline-${frame + 1}`, Math.max(0, frame + 1 - 825));
  }
  console.log(JSON.stringify(checkpoints, null, 2));
  process.exit(0);
}

for (let frame = 0; frame < 180; frame += 1) nes.frame();
checkpoint("title", 0);
nes.buttonDown(1, Controller.BUTTON_START);
for (let frame = 0; frame < 5; frame += 1) nes.frame();
nes.buttonUp(1, Controller.BUTTON_START);
for (let frame = 0; frame < 415; frame += 1) nes.frame();
checkpoint("wanted-screen", 0);
for (let frame = 0; frame < 240; frame += 1) nes.frame();
checkpoint("round-1-entry", 15);
for (let frame = 0; frame < 360; frame += 1) nes.frame();
checkpoint("round-1-active", 375);
console.log(JSON.stringify(checkpoints, null, 2));
