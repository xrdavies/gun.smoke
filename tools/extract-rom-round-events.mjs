import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const filename = process.argv[2] ?? "Gun.Smoke.ZH.NES";
const outputDirectory = process.argv[3] ?? ".rom-traces/round-events";
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
const hex = (value, width = 2) => `$${value.toString(16).padStart(width, "0")}`;
const scriptAddress = 0x8c00;
const scriptOffset = scriptAddress - 0x8000;
const initialMapRow = 8;
const columns = 8;
const positionXAddress = 0xfb09;
const positionYAddress = 0xfb71;
const positionCount = positionYAddress - positionXAddress;
const positionX = Array.from({ length: positionCount }, (_, index) => fixedByte(positionXAddress + index));
const positionY = Array.from({ length: positionCount }, (_, index) => fixedByte(positionYAddress + index));
const behaviorBank = prg.subarray(6 * 0x4000, 7 * 0x4000);
const initializerFor = (entityCode) => {
  // $FA94-$FAC1 normalizes item codes before calling $C796.
  const initializerCode = entityCode < 0x20 ? entityCode : entityCode >= 0x2c ? 0x39 : 0x31;
  const pointer = fixedByte(0xde83 + initializerCode * 2) | (fixedByte(0xde84 + initializerCode * 2) << 8);
  if (pointer < 0xc000 || pointer >= 0x10000) throw new Error(`Entity ${entityCode} has an invalid initializer pointer`);
  const count = fixedByte(pointer);
  const values = Array.from({ length: count }, (_, index) => fixedByte(pointer + index + 1));
  const dispatchType = values[1];
  if (dispatchType === undefined) throw new Error(`Entity ${entityCode} initializer has no dispatch type`);
  const behaviorOffset = 0x3000 + (dispatchType - 0x40) * 2;
  const behaviorRoutine = dispatchType >= 0x40
    ? behaviorBank[behaviorOffset] | ((behaviorBank[behaviorOffset + 1] ?? 0) << 8)
    : undefined;
  return {
    initializerCode,
    pointer: hex(pointer, 4),
    values,
    dispatchType,
    behaviorRoutine: behaviorRoutine === undefined ? undefined : hex(behaviorRoutine, 4),
  };
};

const rounds = Array.from({ length: 6 }, (_, roundIndex) => {
  const bank = prg.subarray(roundIndex * 0x4000, (roundIndex + 1) * 0x4000);
  const mapEnd = fixedByte(0xe875 + roundIndex * 2) | (fixedByte(0xe876 + roundIndex * 2) << 8);
  const mapRows = (mapEnd - 0x8400) / columns;
  if (!Number.isInteger(mapRows) || mapRows <= initialMapRow) throw new Error(`Round ${roundIndex + 1} has an invalid map range`);
  const records = [];
  let cycleHalfSteps = 0;
  let previousHalfStep = -1;
  for (let offset = scriptOffset; offset + 2 < bank.length; offset += 3) {
    const mapRow = bank[offset] ?? 0;
    const positionByte = bank[offset + 1] ?? 0;
    const typeByte = bank[offset + 2] ?? 0;
    const command = positionByte === 0 ? "bossGate" : positionByte === 0xff ? "loop" : "spawn";
    const phase = command === "spawn" ? positionByte >> 7 : 0;
    const positionIndex = positionByte & 0x7f;
    if (command === "spawn" && positionIndex >= positionCount) throw new Error(`Round ${roundIndex + 1} record ${records.length} has an invalid position index`);
    const rowDistance = (mapRow - initialMapRow + mapRows) % mapRows;
    const rawHalfStep = rowDistance * 2 + phase;
    if (command === "spawn" || records.at(-1)?.mapRow !== mapRow) {
      if (rawHalfStep + cycleHalfSteps < previousHalfStep) cycleHalfSteps += mapRows * 2;
    }
    const halfStep = command !== "spawn" && records.at(-1)?.mapRow === mapRow
      ? previousHalfStep
      : rawHalfStep + cycleHalfSteps;
    previousHalfStep = halfStep;
    records.push({
      index: records.length,
      address: hex(0x8000 + offset, 4),
      command,
      mapRow,
      phase: command === "spawn" ? phase : undefined,
      positionIndex: command === "spawn" ? positionIndex : undefined,
      x: command === "spawn" ? positionX[positionIndex] : undefined,
      y: command === "spawn" ? positionY[positionIndex] : undefined,
      entityCode: command === "spawn" ? typeByte & 0x3f : undefined,
      entityFlags: command === "spawn" ? typeByte & 0xc0 : undefined,
      nesScrollAt: halfStep * 16 + 15,
      raw: [mapRow, positionByte, typeByte],
    });
    if (command === "loop") break;
  }
  if (records.at(-1)?.command !== "loop") throw new Error(`Round ${roundIndex + 1} event script has no loop command`);
  if (records.filter((record) => record.command === "bossGate").length !== 1) throw new Error(`Round ${roundIndex + 1} must have exactly one Boss gate`);
  return {
    round: roundIndex + 1,
    bank: roundIndex,
    mapRows,
    loopNesPixels: mapRows * 32,
    loopWorldPixels: mapRows * 32 * (540 / 240),
    records,
  };
});
const entityCodes = [...new Set(rounds.flatMap((round) => round.records
  .filter((record) => record.command === "spawn")
  .map((record) => record.entityCode)))].sort((left, right) => left - right);

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "manifest.json"), JSON.stringify({
  source: filename,
  sourceSha256: crypto.createHash("sha256").update(data).digest("hex"),
  mapper,
  scriptAddress: hex(scriptAddress, 4),
  bossGateFlag: "$49",
  mapPointer: "$5a/$5b",
  mapPhase: "$5c",
  positionTables: { x: hex(positionXAddress, 4), y: hex(positionYAddress, 4), count: positionCount },
  initializerTable: "$de83",
  behaviorPointerTable: { bank: 6, address: "$b000" },
  entityInitializers: Object.fromEntries(entityCodes.map((entityCode) => [entityCode, initializerFor(entityCode)])),
  rounds,
}, null, 2));
console.log(`Extracted ${rounds.reduce((sum, round) => sum + round.records.length, 0)} Round event records to ${outputDirectory}`);
