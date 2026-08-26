import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const filename = process.argv[2] ?? "Gun.Smoke.ZH.NES";
const outputDirectory = process.argv[3] ?? ".rom-traces/round-maps";
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
const fixedBank = prg.subarray(prg.length - 0x4000);
const fixedByte = (address) => fixedBank[address - 0xc000];
const hex = (value, width = 2) => value.toString(16).padStart(width, "0");
const mapStart = 0x8440;
const columns = 8;
const cellSize = 32;

const colorForCell = (cell) => {
  const red = 48 + ((cell * 73) % 176);
  const green = 48 + ((cell * 109) % 176);
  const blue = 48 + ((cell * 151) % 176);
  return [red, green, blue, 255];
};
const writePreview = (filename, rows) => {
  const scale = 8;
  const png = new PNG({ width: columns * scale, height: rows.length * scale });
  for (let row = 0; row < rows.length; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const color = colorForCell(rows[row]?.[column] ?? 0);
      for (let y = 0; y < scale; y += 1) {
        for (let x = 0; x < scale; x += 1) {
          const offset = ((row * scale + y) * png.width + column * scale + x) * 4;
          png.data.set(color, offset);
        }
      }
    }
  }
  fs.writeFileSync(filename, PNG.sync.write(png));
};

fs.mkdirSync(outputDirectory, { recursive: true });
const rounds = Array.from({ length: 6 }, (_, roundIndex) => {
  const mapEnd = fixedByte(0xe875 + roundIndex * 2) | (fixedByte(0xe876 + roundIndex * 2) << 8);
  const bank = prg.subarray(roundIndex * 0x4000, (roundIndex + 1) * 0x4000);
  const length = mapEnd - mapStart;
  if (length <= 0 || length % columns !== 0) throw new Error(`Round ${roundIndex + 1} map has invalid range $${hex(mapStart, 4)}-$${hex(mapEnd, 4)}`);
  const cells = Array.from(bank.slice(mapStart - 0x8000, mapEnd - 0x8000));
  const rows = Array.from({ length: length / columns }, (_, row) => cells.slice(row * columns, (row + 1) * columns));
  const uniqueCells = [...new Set(cells)].sort((left, right) => left - right);
  const definitions = Object.fromEntries(uniqueCells.map((cell) => {
    const offset = cell * 5;
    return [hex(cell), Array.from(bank.slice(offset, offset + 5))];
  }));
  writePreview(path.join(outputDirectory, `round-${roundIndex + 1}-cell-map.png`), rows);
  return {
    round: roundIndex + 1,
    bank: roundIndex,
    range: { start: `$${hex(mapStart, 4)}`, end: `$${hex(mapEnd, 4)}` },
    columns,
    rows: rows.length,
    cellSize,
    nesPixelSize: { width: columns * cellSize, height: rows.length * cellSize },
    uniqueCells,
    definitions,
    cells: rows,
  };
});
const manifest = {
  source: filename,
  sourceSha256: crypto.createHash("sha256").update(data).digest("hex"),
  mapper,
  pointerTable: "$e875",
  mapStart: `$${hex(mapStart, 4)}`,
  rounds,
};
fs.writeFileSync(path.join(outputDirectory, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Extracted ${rounds.length} Round cell maps to ${outputDirectory}`);
