import fs from "node:fs";
import path from "node:path";
import { Button, Nes } from "lib-jsnes";
import { PNG } from "pngjs";

const args = process.argv.slice(2);
const option = (name, fallback) => args.find((value) => value.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;
const romPath = args.find((value) => !value.startsWith("--")) ?? "Gun.Smoke (USA).nes";
const statePath = option("state");
const screenOutput = option("screen-out", "public/assets/screens/ending.png");
const audioOutput = option("audio-out", "public/assets/music/ending.wav");
const captureDelay = Number(option("capture-delay", "761"));
const audioFrames = Number(option("audio-frames", "480"));
if (!fs.existsSync(romPath)) throw new Error(`Reference ROM not found: ${romPath}`);
if (!statePath || !fs.existsSync(statePath)) throw new Error("--state must point to the first Wingate lib-jsnes state");
if (![captureDelay, audioFrames].every((value) => Number.isInteger(value) && value >= 0)) throw new Error("frame counts must be non-negative integers");

const nes = new Nes(fs.readFileSync(romPath));
const saved = JSON.parse(fs.readFileSync(statePath, "utf8"));
if (saved.format !== "lib-jsnes" || typeof saved.state !== "string") throw new Error("State file is not a lib-jsnes export");
nes.loadState(Buffer.from(saved.state, "base64"));
let controller = 0;
const setButton = (button, pressed) => {
  controller = pressed ? controller | button : controller & ~button;
  nes.setController(1, controller);
};
const bossActive = () => Boolean(nes.read(0x40e) & 0x80) && nes.read(0x42e) >= 0x80;
let wasBoss = false;
let releases = 0;
for (let frame = 0; frame < 16_000 && releases < 2; frame += 1) {
  const active = bossActive();
  if (!active && wasBoss) releases += 1;
  wasBoss = active;
  nes.write(0x7c, 255);
  if (active) {
    nes.write(0x88, 4);
    nes.write(0x9c, 255);
    nes.write(0x74, nes.read(0x5ee));
    nes.write(0x71, Math.min(216, nes.read(0x5ce) + 64));
    const fire = frame % 5 === 0;
    setButton(Button.A, fire);
    setButton(Button.B, fire);
  } else {
    setButton(Button.A, false);
    setButton(Button.B, false);
  }
  for (let slot = 2; slot < 8; slot += 1) nes.write(0x400 + slot, 0);
  for (let slot = 24; slot < 32; slot += 1) nes.write(0x400 + slot, 0);
  nes.runFrame();
}
if (releases !== 2) throw new Error("Both Wingate encounters were not completed before the frame limit");
setButton(Button.A, false);
setButton(Button.B, false);
for (let frame = 0; frame < captureDelay; frame += 1) nes.runFrame();

const png = new PNG({ width: 256, height: 240 });
for (let index = 0; index < nes.frame.length; index += 1) {
  const color = nes.frame[index] ?? 0;
  const offset = index * 4;
  png.data[offset] = color >>> 16 & 0xff;
  png.data[offset + 1] = color >>> 8 & 0xff;
  png.data[offset + 2] = color & 0xff;
  png.data[offset + 3] = 0xff;
}
fs.mkdirSync(path.dirname(screenOutput), { recursive: true });
fs.writeFileSync(screenOutput, PNG.sync.write(png));

nes.audioSamples();
const samples = [];
for (let frame = 0; frame < audioFrames; frame += 1) {
  nes.runFrame();
  samples.push(...nes.audioSamples());
}
const pcm = Buffer.alloc(samples.length * 2);
for (const [index, sample] of samples.entries()) pcm.writeInt16LE(sample, index * 2);
const header = Buffer.alloc(44);
header.write("RIFF", 0); header.writeUInt32LE(36 + pcm.length, 4); header.write("WAVE", 8);
header.write("fmt ", 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
header.writeUInt32LE(nes.apu.sampleRate, 24); header.writeUInt32LE(nes.apu.sampleRate * 2, 28);
header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
fs.mkdirSync(path.dirname(audioOutput), { recursive: true });
fs.writeFileSync(audioOutput, Buffer.concat([header, pcm]));
console.log(`Extracted ending frame and ${samples.length} APU samples through lib-jsnes`);
