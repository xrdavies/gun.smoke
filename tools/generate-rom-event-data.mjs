import fs from "node:fs";

const manifestFilename = process.argv[2] ?? ".rom-traces/round-events/manifest.json";
const outputFilename = process.argv[3] ?? "src/rom-event-data.ts";
if (!fs.existsSync(manifestFilename)) {
  console.log(`Round event manifest not found: ${manifestFilename}`);
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestFilename, "utf8"));
const entityHitPoints = Object.fromEntries(Object.entries(manifest.entityInitializers)
  .filter(([, initializer]) => Number.isInteger(initializer.values[3]))
  .map(([entityCode, initializer]) => [entityCode, initializer.values[3]]));
const routines = [...new Set(manifest.rounds.flatMap((round) => round.records
  .filter((record) => record.command === "spawn" && record.behaviorRoutine)
  .map((record) => record.behaviorRoutine)))].sort();
const routineIds = Object.fromEntries(routines.map((routine, index) => [routine, index]));
const fallingRockBehaviorIds = [routineIds["$b5bf"]].filter((value) => Number.isInteger(value));
const streams = manifest.rounds.map((round) => {
  const bytes = [];
  for (const record of round.records.filter((candidate) => candidate.command === "spawn" && candidate.behaviorRoutine)) {
    const at = record.nesScrollAt;
    bytes.push(at & 0xff, at >> 8, record.index & 0xff, record.index >> 8, record.x ?? 0, record.y ?? 0, routineIds[record.behaviorRoutine], record.entityCode ?? 0, record.entityFlags ?? 0, record.phase ?? 0, record.slotPool === "object" ? 1 : 0);
  }
  return Buffer.from(bytes).toString("base64");
});
const objectSemanticIds = { sceneObject: 0, supplyShop: 1, weaponShop: 2 };
const objectStreams = manifest.rounds.map((round) => {
  const bytes = [];
  for (const record of round.records.filter((candidate) => candidate.command === "spawn" && candidate.semantic !== "behaviorEntity")) {
    const at = record.nesScrollAt;
    const semantic = (objectSemanticIds[record.semantic] ?? 0) | (record.slotPool === "object" ? 0x80 : 0);
    bytes.push(at & 0xff, at >> 8, record.index & 0xff, record.index >> 8, record.x ?? 0, record.y ?? 0, record.entityCode ?? 0, record.dispatchType ?? 0, record.entityFlags ?? 0, semantic);
  }
  return Buffer.from(bytes).toString("base64");
});

const source = [
  "// Generated from .rom-traces/round-events/manifest.json. Runtime keeps data only, not ROM code/assets.",
  `export const ROM_BEHAVIOR_ROUTINES = ${JSON.stringify(routines)} as const;`,
  "",
  "export type RomEnemyEvent = { at: number; order: number; x: number; y: number; behavior: number; entityCode: number; flags: number; phase: number; pool: \"enemy\" | \"object\" };",
  "",
  `const ROUND_EVENT_STREAMS = ${JSON.stringify(streams, null, 2)} as const;`,
  `const ROUND_OBJECT_STREAMS = ${JSON.stringify(objectStreams, null, 2)} as const;`,
  "const WORLD_PER_NES_PIXEL = 540 / 240;",
  "",
  "const decodeStream = (encoded: string): readonly RomEnemyEvent[] => {",
  "  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));",
  "  const events: RomEnemyEvent[] = [];",
  "  for (let offset = 0; offset + 10 < bytes.length; offset += 11) {",
  "    events.push({",
  "      at: (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8),",
  "      order: (bytes[offset + 2] ?? 0) | ((bytes[offset + 3] ?? 0) << 8),",
  "      x: bytes[offset + 4] ?? 0,",
  "      y: bytes[offset + 5] ?? 0,",
  "      behavior: bytes[offset + 6] ?? 0,",
  "      entityCode: bytes[offset + 7] ?? 0,",
  "      flags: bytes[offset + 8] ?? 0,",
  "      phase: bytes[offset + 9] ?? 0,",
  "      pool: bytes[offset + 10] === 1 ? \"object\" : \"enemy\",",
  "    });",
  "  }",
  "  return events;",
  "};",
  "",
  "export const ROUND_ROM_ENEMY_EVENTS: readonly (readonly RomEnemyEvent[])[] = ROUND_EVENT_STREAMS.map(decodeStream);",
  "export const ROUND_ROM_ENEMY_EVENT_COUNTS = ROUND_ROM_ENEMY_EVENTS.map((events) => events.length);",
  "export type RomObjectEvent = { at: number; order: number; x: number; y: number; entityCode: number; dispatchType: number; flags: number; pool: \"enemy\" | \"object\"; semantic: \"sceneObject\" | \"supplyShop\" | \"weaponShop\"; shopIndex?: number };",
  "const decodeObjectStream = (encoded: string): readonly RomObjectEvent[] => {",
  "  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));",
  "  const events: RomObjectEvent[] = [];",
  "  let shopIndex = 0;",
  "  for (let offset = 0; offset + 9 < bytes.length; offset += 10) {",
  "    const semantic = ((bytes[offset + 9] ?? 0) & 0x7f) === 1 ? \"supplyShop\" : ((bytes[offset + 9] ?? 0) & 0x7f) === 2 ? \"weaponShop\" : \"sceneObject\";",
  "    events.push({",
  "      at: (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8),",
  "      order: (bytes[offset + 2] ?? 0) | ((bytes[offset + 3] ?? 0) << 8),",
  "      x: bytes[offset + 4] ?? 0,",
  "      y: bytes[offset + 5] ?? 0,",
  "      entityCode: bytes[offset + 6] ?? 0,",
  "      dispatchType: bytes[offset + 7] ?? 0,",
  "      flags: bytes[offset + 8] ?? 0,",
  "      pool: (bytes[offset + 9] ?? 0) & 0x80 ? \"object\" : \"enemy\",",
  "      semantic,",
  "      shopIndex: semantic === \"sceneObject\" ? undefined : ++shopIndex,",
  "    });",
  "  }",
  "  return events;",
  "};",
  "export const ROUND_ROM_OBJECT_EVENTS: readonly (readonly RomObjectEvent[])[] = ROUND_OBJECT_STREAMS.map(decodeObjectStream);",
  "export const ROUND_ROM_OBJECT_EVENT_COUNTS = ROUND_ROM_OBJECT_EVENTS.map((events) => events.length);",
  "export const compareRomEventOrder = (left: RomEnemyEvent | RomObjectEvent, right: RomEnemyEvent | RomObjectEvent): number => left.at - right.at || left.order - right.order;",
  "export const romObjectWorldAt = (event: RomObjectEvent): number => event.at * WORLD_PER_NES_PIXEL;",
  "export const romObjectWorldX = (event: RomObjectEvent): number => event.x * (960 / 256);",
  "export const romObjectWorldY = (event: RomObjectEvent): number => event.y * WORLD_PER_NES_PIXEL;",
  "export const ROM_ENEMY_SLOT_CAPACITY = 7;",
  "export const ROM_OBJECT_SLOT_CAPACITY = 6;",
  "export const ROM_BREAKABLE_CONTAINER_DISPATCH_TYPES = [7] as const;",
  "export const ROM_SCENE_PROP_DISPATCH_TYPES = [8] as const;",
  `export const ROM_FALLING_ROCK_BEHAVIORS = ${JSON.stringify(fallingRockBehaviorIds)} as const; // $B5BF is handled as a falling rock hazard.`,
  "export const ROM_OBJECT_PICKUPS = { 33: \"boots\", 34: \"rifle\", 35: \"pow\", 36: \"money\", 37: \"horse\", 38: \"redYashichi\", 39: \"skull\", 42: \"blueYashichi\" } as const;",
  "export const ROM_EMPTY_BARREL_ENTITY_CODES = [32, 41] as const;",
  "export const canSpawnRomPool = (pool: RomEnemyEvent[\"pool\"], active: number): boolean => active < (pool === \"object\" ? ROM_OBJECT_SLOT_CAPACITY : ROM_ENEMY_SLOT_CAPACITY);",
  "export const romEventWorldAt = (event: RomEnemyEvent): number => event.at * WORLD_PER_NES_PIXEL;",
  "export const romEventWorldX = (event: RomEnemyEvent): number => event.x * (960 / 256);",
  "export const romEventWorldY = (event: RomEnemyEvent): number => event.y * WORLD_PER_NES_PIXEL;",
  "",
  `export const ROM_ENTITY_HIT_POINTS: Readonly<Record<number, number>> = ${JSON.stringify(entityHitPoints)};`,
  "export const romEntityHitPoints = (entityCode: number): number => ROM_ENTITY_HIT_POINTS[entityCode] ?? 1;",
  "",
  "// Behavior routines are mechanically identified; only long-tail random branches remain approximate.",
  "export const ROM_BEHAVIOR_ENEMY_TYPES = [",
  '  "sniper", "shotgunner", "gunman", "backstabber", "bomber", undefined,',
  '  "ninja", "rifleman", "backstabber", "hatchet", "spear", "firebreather",',
  "] as const;",
  "",
].join("\n");

fs.writeFileSync(outputFilename, source);
console.log(`Generated ${outputFilename} from ${manifestFilename}`);
