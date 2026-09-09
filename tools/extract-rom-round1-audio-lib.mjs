import fs from "node:fs";
import path from "node:path";
import { Button, Nes } from "lib-jsnes";

const romPath = process.argv.slice(2).find((value) => !value.startsWith("--")) ?? "Gun.Smoke (USA).nes";
const output = process.argv.find((value) => value.startsWith("--out="))?.split("=")[1] ?? "public/assets/music/round-1.wav";
if (!fs.existsSync(romPath)) throw new Error(`Reference ROM not found: ${romPath}`);

const nes = new Nes(fs.readFileSync(romPath));
nes.reset();
const run = (count) => { for (let index = 0; index < count; index += 1) nes.runFrame(); };
run(180);
nes.setController(1, Button.Start);
run(5);
nes.setController(1, 0);
run(415 + 600);
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
console.log(`Extracted ${samples.length} Round 1 APU samples at ${nes.apu.sampleRate} Hz to ${output}`);
