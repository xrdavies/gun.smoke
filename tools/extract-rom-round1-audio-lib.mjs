import fs from "node:fs";
import path from "node:path";
import { Button, Nes } from "lib-jsnes";

const romPath = process.argv.slice(2).find((value) => !value.startsWith("--")) ?? "Gun.Smoke (USA).nes";
const output = process.argv.find((value) => value.startsWith("--out="))?.split("=")[1] ?? "public/assets/music/round-1.wav";
const stateFile = process.argv.find((value) => value.startsWith("--state="))?.split("=")[1];
const warmup = Number(process.argv.find((value) => value.startsWith("--warmup="))?.split("=")[1] ?? 0);
if (!fs.existsSync(romPath)) throw new Error(`Reference ROM not found: ${romPath}`);
if (stateFile && !fs.existsSync(stateFile)) throw new Error(`State file not found: ${stateFile}`);
if (!Number.isInteger(warmup) || warmup < 0) throw new Error("--warmup must be a non-negative integer");

const nes = new Nes(fs.readFileSync(romPath));
nes.reset();
const run = (count) => { for (let index = 0; index < count; index += 1) nes.runFrame(); };
if (stateFile) {
  const saved = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  if (saved.format !== "lib-jsnes" || typeof saved.state !== "string") throw new Error("State file is not a lib-jsnes export");
  nes.loadState(Buffer.from(saved.state, "base64"));
  run(warmup);
} else {
  run(180);
  nes.setController(1, Button.Start);
  run(5);
  nes.setController(1, 0);
  run(415 + 600);
}
nes.audioSamples();

const samples = [];
for (let frame = 0; frame < 60 * 8; frame += 1) {
  nes.runFrame();
  samples.push(...nes.audioSamples());
}
if (samples.length < nes.apu.sampleRate) throw new Error("ROM produced less than one second of Round 1 audio");

const pcm = Buffer.alloc(samples.length * 2);
for (const [index, sample] of samples.entries()) pcm.writeInt16LE(sample, index * 2);
const header = Buffer.alloc(44);
header.write("RIFF", 0); header.writeUInt32LE(36 + pcm.length, 4); header.write("WAVE", 8);
header.write("fmt ", 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
header.writeUInt32LE(nes.apu.sampleRate, 24); header.writeUInt32LE(nes.apu.sampleRate * 2, 28);
header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.concat([header, pcm]));
console.log(`Extracted ${samples.length} APU samples at ${nes.apu.sampleRate} Hz to ${output}`);
