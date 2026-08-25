import crypto from "node:crypto";
import fs from "node:fs";

const filename = process.argv[2] ?? "Gun.Smoke.ZH.NES";
if (!fs.existsSync(filename)) {
  console.log(`Reference ROM not found: ${filename}`);
  process.exit(0);
}

const data = fs.readFileSync(filename);
if (data.subarray(0, 4).toString("ascii") !== "NES\x1a") {
  throw new Error("Not an iNES ROM");
}
const flags6 = data[6] ?? 0;
const flags7 = data[7] ?? 0;
const mapper = (flags6 >> 4) | (flags7 & 0xf0);
const prgBanks = data[4] ?? 0;
const chrBanks = data[5] ?? 0;
console.log(JSON.stringify({
  filename,
  bytes: data.length,
  sha256: crypto.createHash("sha256").update(data).digest("hex"),
  format: "iNES",
  prgBytes: prgBanks * 16 * 1024,
  chrBytes: chrBanks * 8 * 1024,
  mapper,
  fourScreen: Boolean(flags6 & 0x08),
  battery: Boolean(flags6 & 0x02),
}, null, 2));
