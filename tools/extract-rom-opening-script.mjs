import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const filename = process.argv[2] ?? "Gun.Smoke.ZH.NES";
const output = process.argv[3] ?? ".rom-traces/bank1-opening-nametable.json";
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
const tileRuns = Array.from({ length: 22 }, (_, index) => {
  const address = (read(0xb79d + index) << 8) | read(0xb787 + index);
  const bytes = [];
  for (let offset = 0; offset < 0x100; offset += 1) {
    const value = read(address + offset);
    if (value === undefined) throw new Error(`Tile run ${index} leaves bank 1`);
    bytes.push(value);
    if (value === 0xff) break;
  }
  if (bytes.at(-1) !== 0xff) throw new Error(`Tile run ${index} has no terminator`);
  const tiles = bytes.slice(0, -1);
  return { index, address: `$${hex(address, 4)}`, tiles, paddedTiles: [...tiles, ...Array(Math.max(0, 25 - tiles.length)).fill(0xf4)].slice(0, 25) };
});
const ppuRowTargets = Array.from({ length: 3 }, (_, index) => {
  const address = (read(0xb7b6 + index) << 8) | read(0xb7b3 + index);
  return { index, address: `$${hex(address, 4)}`, row: Math.floor((address & 0x03ff) / 32), column: address & 31 };
});
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({
  source: filename,
  sourceSha256: crypto.createHash("sha256").update(data).digest("hex"),
  mapper,
  bank: 1,
  pointerTables: { low: "$b787", high: "$b79d" },
  ppuRowTargetTables: { low: "$b7b3", high: "$b7b6" },
  ppuRowTargets,
  tileRuns,
}, null, 2));
console.log(`Extracted ${tileRuns.length} bank 1 opening tile runs to ${output}`);
