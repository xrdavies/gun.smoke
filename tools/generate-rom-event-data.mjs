import fs from "node:fs";

const manifestFilename = process.argv[2] ?? ".rom-traces/round-events/manifest.json";
const outputFilename = process.argv[3] ?? "src/rom-event-data.ts";
if (!fs.existsSync(manifestFilename)) {
  console.log(`Round event manifest not found: ${manifestFilename}`);
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestFilename, "utf8"));
const routines = [...new Set(manifest.rounds.flatMap((round) => round.records
  .filter((record) => record.command === "spawn" && record.behaviorRoutine)
  .map((record) => record.behaviorRoutine)))].sort();
const routineIds = Object.fromEntries(routines.map((routine, index) => [routine, index]));
const streams = manifest.rounds.map((round) => {
  const bytes = [];
  for (const record of round.records.filter((candidate) => candidate.command === "spawn" && candidate.behaviorRoutine)) {
    const at = record.nesScrollAt;
    bytes.push(at & 0xff, at >> 8, record.x ?? 0, record.y ?? 0, routineIds[record.behaviorRoutine], record.entityCode ?? 0, record.entityFlags ?? 0);
  }
  return Buffer.from(bytes).toString("base64");
});
const source = `// Generated from .rom-traces/round-events/manifest.json. Runtime keeps data only, not ROM code/assets.\nexport const ROM_BEHAVIOR_ROUTINES = ${JSON.stringify(routines)} as const;\n\nexport type RomEnemyEvent = { at: number; x: number; y: number; behavior: number; entityCode: number; flags: number };\n\nconst ROUND_EVENT_STREAMS = ${JSON.stringify(streams, null, 2)} as const;\nconst WORLD_PER_NES_PIXEL = 540 / 240;\n\nconst decodeStream = (encoded: string): readonly RomEnemyEvent[] => {\n  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));\n  const events: RomEnemyEvent[] = [];\n  for (let offset = 0; offset + 6 < bytes.length; offset += 7) {\n    events.push({\n      at: (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8),\n      x: bytes[offset + 2] ?? 0,\n      y: bytes[offset + 3] ?? 0,\n      behavior: bytes[offset + 4] ?? 0,\n      entityCode: bytes[offset + 5] ?? 0,\n      flags: bytes[offset + 6] ?? 0,\n    });\n  }\n  return events;\n};\n\nexport const ROUND_ROM_ENEMY_EVENTS: readonly (readonly RomEnemyEvent[])[] = ROUND_EVENT_STREAMS.map(decodeStream);\nexport const ROUND_ROM_ENEMY_EVENT_COUNTS = ROUND_ROM_ENEMY_EVENTS.map((events) => events.length);\nexport const romEventWorldAt = (event: RomEnemyEvent): number => event.at * WORLD_PER_NES_PIXEL;\nexport const romEventWorldX = (event: RomEnemyEvent): number => event.x * (960 / 256);\nexport const romEventWorldY = (event: RomEnemyEvent): number => Math.max(55, event.y * WORLD_PER_NES_PIXEL);\n\n// Behavior routines are mechanically identified; these names are gameplay approximations until each routine is fully traced.\nexport const ROM_BEHAVIOR_ENEMY_TYPES = [\n  "sniper", "backstabber", "gunman", "shotgunner", "bomber", "rifleman",\n  "ninja", "rifleman", "backstabber", "hatchet", "spear", "firebreather",\n] as const;\n`;
fs.writeFileSync(outputFilename, source);
console.log(`Generated ${outputFilename} from ${manifestFilename}`);
