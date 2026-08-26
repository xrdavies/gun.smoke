import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const filename = args.find((argument) => !argument.startsWith("--")) ?? "Gun.Smoke.ZH.NES";
const option = (name, fallback) => args.find((argument) => argument.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;
const address = (value) => {
  const parsed = Number.parseInt(value.replace(/^\$/, ""), 16);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 0xffff) throw new Error(`Invalid CPU address: ${value}`);
  return parsed;
};
const start = address(option("start", "$c000"));
const end = address(option("end", "$c300"));
const selectedBank = Number(option("bank", "0"));
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}
if (start < 0x8000 || end < 0x8000) throw new Error("CPU addresses must be in cartridge space ($8000-$FFFF)");
if (end < start) throw new Error("--end must be >= --start");
const data = fs.readFileSync(filename);
if (data.subarray(0, 4).toString("ascii") !== "NES\x1a") throw new Error("Not an iNES ROM");
const flags6 = data[6] ?? 0;
const mapper = (flags6 >> 4) | ((data[7] ?? 0) & 0xf0);
if (mapper !== 2) throw new Error(`Expected Mapper 2 / UxROM, received Mapper ${mapper}`);
const trainerBytes = flags6 & 0x04 ? 512 : 0;
const prgBytes = (data[4] ?? 0) * 16 * 1024;
if (data.length < 16 + trainerBytes + prgBytes) throw new Error("Truncated iNES PRG data");
const prg = data.subarray(16 + trainerBytes, 16 + trainerBytes + prgBytes);
const bankCount = Math.floor(prg.length / 0x4000);
if (bankCount === 0) throw new Error("ROM has no PRG data");
if (!Number.isInteger(selectedBank) || selectedBank < 0 || selectedBank >= bankCount) throw new Error(`Bank must be between 0 and ${bankCount - 1}`);

const cpuSource = fs.readFileSync(path.resolve(path.dirname(require.resolve("jsnes")), "../src/cpu.js"), "utf8");
const opcodes = new Map();
const opcodePattern = /^\s*0x([0-9a-f]+): \{ ins: (INS_[A-Z0-9_]+), mode: (ADDR_[A-Z0-9_]+),\s+size: (\d+)/gim;
for (const match of cpuSource.matchAll(opcodePattern)) opcodes.set(Number.parseInt(match[1], 16), { mnemonic: match[2].replace(/^INS_/, ""), mode: match[3].replace(/^ADDR_/, ""), size: Number(match[4]) });

const readByte = (cpuAddress) => {
  if (cpuAddress >= 0xc000) return prg[(bankCount - 1) * 0x4000 + cpuAddress - 0xc000] ?? 0;
  if (cpuAddress >= 0x8000) return prg[selectedBank * 0x4000 + cpuAddress - 0x8000] ?? 0;
  return undefined;
};
const hex = (value, width) => value.toString(16).padStart(width, "0");
const operand = (mode, cpuAddress, size, bytes) => {
  const value = bytes[1] ?? 0;
  const absolute = (bytes[1] ?? 0) | ((bytes[2] ?? 0) << 8);
  switch (mode) {
    case "IMP": return "";
    case "ACC": return "A";
    case "IMM": return `#$${hex(value, 2)}`;
    case "ZP": return `$${hex(value, 2)}`;
    case "ZPX": return `$${hex(value, 2)},X`;
    case "ZPY": return `$${hex(value, 2)},Y`;
    case "ABS": return `$${hex(absolute, 4)}`;
    case "ABSX": return `$${hex(absolute, 4)},X`;
    case "ABSY": return `$${hex(absolute, 4)},Y`;
    case "IND": return `($${hex(absolute, 4)})`;
    case "PREIDXIND": return `($${hex(value, 2)},X)`;
    case "POSTIDXIND": return `($${hex(value, 2)}),Y`;
    case "REL": {
      const offset = value < 0x80 ? value : value - 0x100;
      return `$${hex((cpuAddress + size + offset) & 0xffff, 4)}`;
    }
    default: return `$${hex(value, 2)}`;
  }
};

console.log(`; ${filename} / Mapper ${mapper} / PRG ${prgBytes} bytes`);
console.log(`; CPU range $${hex(start, 4)}-$${hex(end, 4)} / UxROM bank ${selectedBank} for $8000-$BFFF`);
let cpuAddress = start;
while (cpuAddress <= end) {
  const opcode = readByte(cpuAddress);
  const info = opcodes.get(opcode);
  if (!info) {
    console.log(`$${hex(cpuAddress, 4)}: ${hex(opcode, 2)}       .DB $${hex(opcode, 2)}`);
    cpuAddress += 1;
    continue;
  }
  const bytes = Array.from({ length: info.size }, (_, index) => readByte(cpuAddress + index) ?? 0);
  const byteText = bytes.map((byte) => hex(byte, 2)).join(" ").padEnd(8, " ");
  console.log(`$${hex(cpuAddress, 4)}: ${byteText} ${info.mnemonic.padEnd(4, " ")} ${operand(info.mode, cpuAddress, info.size, bytes)}`.trimEnd());
  cpuAddress += info.size;
}
