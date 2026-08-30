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
  "const ROM_EVENT_SCROLL_PHASE_NES = 2 / 3;",
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
  "export const romObjectWorldAt = (event: RomObjectEvent): number => (event.at + ROM_EVENT_SCROLL_PHASE_NES) * WORLD_PER_NES_PIXEL;",
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
  "export const romEventWorldAt = (event: RomEnemyEvent): number => (event.at + ROM_EVENT_SCROLL_PHASE_NES) * WORLD_PER_NES_PIXEL;",
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
  "// Derived from each Round bank's $83BF + (AD & $1E) table and the $FB71/$FB09",
  "// position tables. Tuples are [NES x, NES y, behavior, entity code].",
  "export const ROUND_ROM_BOSS_REINFORCEMENTS = [",
  "  [[88, 0, 2, 6], [104, 0, 1, 3], [120, 0, 4, 11], [136, 0, 2, 6], [168, 0, 4, 11], [184, 0, 2, 6], [248, 112, 3, 10], [248, 144, 2, 7], [128, 0, 3, 10], [128, 0, 3, 10], [152, 0, 2, 6], [72, 0, 4, 11], [128, 0, 3, 10], [152, 0, 2, 6], [128, 0, 3, 10], [4, 64, 3, 10]],",
  "  [[64, 0, 7, 14], [96, 0, 4, 11], [128, 0, 7, 14], [168, 0, 7, 14], [200, 0, 4, 11], [248, 48, 7, 15], [112, 0, 2, 6], [248, 160, 2, 7], [128, 0, 3, 10], [128, 0, 3, 10], [112, 0, 2, 7], [128, 0, 3, 10], [4, 176, 2, 7], [184, 0, 2, 6], [4, 96, 3, 10], [128, 0, 3, 10]],",
  "  [[96, 0, 10, 19], [128, 0, 9, 17], [160, 0, 9, 17], [192, 0, 11, 21], [248, 64, 11, 22], [248, 80, 10, 20], [248, 112, 11, 22], [248, 128, 2, 7], [248, 192, 2, 7], [128, 0, 3, 10], [128, 0, 3, 10], [128, 0, 3, 10], [128, 0, 3, 10], [4, 176, 2, 7], [4, 112, 10, 20], [4, 64, 2, 8]],",
  "  [[120, 0, 6, 13], [160, 0, 6, 13], [192, 0, 6, 13], [208, 0, 1, 3], [224, 0, 6, 13], [248, 48, 2, 7], [248, 112, 2, 7], [248, 144, 1, 4], [248, 176, 2, 7], [208, 0, 2, 5], [160, 0, 2, 5], [128, 0, 2, 5], [96, 0, 2, 5], [4, 192, 2, 7], [4, 80, 5, 12], [4, 32, 5, 12]],",
  "  [[48, 0, 2, 6], [96, 0, 2, 6], [112, 0, 7, 14], [160, 0, 7, 14], [176, 0, 2, 6], [192, 0, 2, 6], [208, 0, 7, 14], [248, 80, 7, 15], [248, 112, 2, 7], [248, 128, 7, 15], [248, 160, 2, 7], [128, 0, 2, 5], [4, 192, 2, 7], [4, 128, 2, 7], [4, 96, 7, 15], [4, 64, 2, 7]],",
  "  [[56, 0, 1, 3], [104, 0, 4, 11], [144, 0, 2, 6], [168, 0, 4, 11], [200, 0, 1, 3], [248, 64, 2, 7], [248, 80, 3, 10], [248, 112, 1, 4], [248, 160, 2, 7], [248, 208, 2, 7], [208, 0, 2, 5], [64, 0, 2, 5], [4, 176, 2, 7], [4, 144, 2, 7], [4, 112, 3, 10], [4, 96, 1, 4]],",
  "] as const;",
].join("\n");

fs.writeFileSync(outputFilename, `${source}\n`);
console.log(`Generated ${outputFilename} from ${manifestFilename}`);
