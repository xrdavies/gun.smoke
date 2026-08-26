import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const filename = process.argv[2] ?? "Gun.Smoke.ZH.NES";
const output = process.argv[3] ?? ".rom-traces/bank1-scene-script.json";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
const data = fs.readFileSync(filename);
if (data.subarray(0, 4).toString("ascii") !== "NES\x1a") throw new Error("Not an iNES ROM");
const flags6 = data[6] ?? 0;
const mapper = (flags6 >> 4) | ((data[7] ?? 0) & 0xf0);
if (mapper !== 2) throw new Error(`Expected Mapper 2 / UxROM, received Mapper ${mapper}`);
const trainerBytes = flags6 & 0x04 ? 512 : 0;
const prgBytes = (data[4] ?? 0) * 0x4000;
if (data.length < 16 + trainerBytes + prgBytes) throw new Error("Truncated iNES PRG data");
const prg = data.subarray(16 + trainerBytes, 16 + trainerBytes + prgBytes);
const bank = prg.subarray(0x4000, 0x8000);
const read = (cpuAddress) => bank[cpuAddress - 0x8000];
const hex = (value, width = 2) => value.toString(16).padStart(width, "0");
const blocks = Array.from({ length: 22 }, (_, index) => {
  const address = (read(0xb79d + index) << 8) | read(0xb787 + index);
  const bytes = [];
  for (let offset = 0; offset < 0x100; offset += 1) {
    const value = read(address + offset);
    if (value === undefined) throw new Error(`Scene block ${index} leaves bank 1`);
    bytes.push(value);
    if (value === 0xff) break;
  }
  if (bytes.at(-1) !== 0xff) throw new Error(`Scene block ${index} has no terminator`);
  return { index, address: `$${hex(address, 4)}`, bytes, hex: bytes.map((value) => hex(value)).join(" ") };
});
const rowParameters = Array.from({ length: 3 }, (_, index) => ({
  index,
  high: read(0xb7b3 + index),
  low: read(0xb7b6 + index),
}));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({
  source: filename,
  sourceSha256: crypto.createHash("sha256").update(data).digest("hex"),
  mapper,
  bank: 1,
  pointerTables: { low: "$b787", high: "$b79d" },
  rowParameterTables: { high: "$b7b3", low: "$b7b6" },
  rowParameters,
  blocks,
}, null, 2));
console.log(`Extracted ${blocks.length} bank 1 scene blocks to ${output}`);
