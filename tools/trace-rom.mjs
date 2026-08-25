import crypto from "node:crypto";
import fs from "node:fs";
import { Controller, NES } from "jsnes";

const filename = process.argv[2] ?? "Gun.Smoke.ZH.NES";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}

const rom = fs.readFileSync(filename).toString("binary");
let lastFrame;
const nes = new NES({ onFrame: (frame) => { lastFrame = frame; }, onAudioSample: () => {} });
nes.loadROM(rom);

const checkpoints = [];
const checkpoint = (label) => {
  const frameHash = lastFrame
    ? crypto.createHash("sha256").update(Buffer.from(lastFrame.buffer)).digest("hex").slice(0, 16)
    : undefined;
  checkpoints.push({
    label,
    pc: `$${nes.cpu.REG_PC.toString(16).padStart(4, "0")}`,
    state: nes.cpu.mem[0x68],
    substate: nes.cpu.mem[0x69],
    stage: nes.cpu.mem[0x62],
    scorePage: nes.cpu.mem[0x4c],
    scoreLow: nes.cpu.mem[0x4f],
    ppu: {
      vramAddress: nes.ppu.vramAddress,
      coarseX: nes.ppu.regHT,
      coarseY: nes.ppu.regVT,
      fineX: nes.ppu.regFH,
      fineY: nes.ppu.regFV,
      nametable: nes.ppu.curNt,
    },
    spriteOam: Array.from(nes.ppu.spriteMem.slice(0, 32)),
    frameHash,
  });
};

for (let frame = 0; frame < 180; frame += 1) nes.frame();
checkpoint("title");
nes.buttonDown(1, Controller.BUTTON_A);
for (let frame = 0; frame < 600; frame += 1) nes.frame();
nes.buttonUp(1, Controller.BUTTON_A);
checkpoint("intro-after-A");
for (let frame = 0; frame < 600; frame += 1) nes.frame();
checkpoint("intro-text");
nes.buttonDown(1, Controller.BUTTON_A);
for (let frame = 0; frame < 5; frame += 1) nes.frame();
nes.buttonUp(1, Controller.BUTTON_A);
for (let frame = 0; frame < 300; frame += 1) nes.frame();
checkpoint("round-1-entry");
console.log(JSON.stringify(checkpoints, null, 2));
