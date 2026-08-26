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

const source = [
  "// Generated from .rom-traces/round-events/manifest.json. Runtime keeps data only, not ROM code/assets.",
  `export const ROM_BEHAVIOR_ROUTINES = ${JSON.stringify(routines)} as const;`,
  "",
  "export type RomEnemyEvent = { at: number; x: number; y: number; behavior: number; entityCode: number; flags: number };",
  "",
  `const ROUND_EVENT_STREAMS = ${JSON.stringify(streams, null, 2)} as const;`,
  "const WORLD_PER_NES_PIXEL = 540 / 240;",
  "",
  "const decodeStream = (encoded: string): readonly RomEnemyEvent[] => {",
  "  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));",
  "  const events: RomEnemyEvent[] = [];",
  "  for (let offset = 0; offset + 6 < bytes.length; offset += 7) {",
  "    events.push({",
  "      at: (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8),",
  "      x: bytes[offset + 2] ?? 0,",
  "      y: bytes[offset + 3] ?? 0,",
  "      behavior: bytes[offset + 4] ?? 0,",
  "      entityCode: bytes[offset + 5] ?? 0,",
  "      flags: bytes[offset + 6] ?? 0,",
  "    });",
  "  }",
  "  return events;",
  "};",
  "",
  "export const ROUND_ROM_ENEMY_EVENTS: readonly (readonly RomEnemyEvent[])[] = ROUND_EVENT_STREAMS.map(decodeStream);",
  "export const ROUND_ROM_ENEMY_EVENT_COUNTS = ROUND_ROM_ENEMY_EVENTS.map((events) => events.length);",
  "export const romEventWorldAt = (event: RomEnemyEvent): number => event.at * WORLD_PER_NES_PIXEL;",
  "export const romEventWorldX = (event: RomEnemyEvent): number => event.x * (960 / 256);",
  "export const romEventWorldY = (event: RomEnemyEvent): number => event.y * WORLD_PER_NES_PIXEL;",
  "",
  "// Behavior routines are mechanically identified; these names are gameplay approximations until each routine is fully traced.",
  "export const ROM_BEHAVIOR_ENEMY_TYPES = [",
  '  "sniper", "backstabber", "gunman", "shotgunner", "bomber", "rifleman",',
  '  "ninja", "rifleman", "backstabber", "hatchet", "spear", "firebreather",',
  "] as const;",
  "",
].join("\n");

fs.writeFileSync(outputFilename, source);
console.log(`Generated ${outputFilename} from ${manifestFilename}`);
