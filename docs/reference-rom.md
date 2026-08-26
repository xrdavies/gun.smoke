# Reference ROM

The local development workspace contains a user-supplied reference file named
`Gun.Smoke.ZH.NES`. It is intentionally excluded from Git by the repository
ignore rules and is not redistributed by this project.

Verified metadata:

- SHA-256: `f110936c8781eb978f73403c0499e9ea3b99cf5af3cd31a282d4fab737c1b45d`
- Format: iNES header
- PRG: 8 x 16 KiB (128 KiB)
- CHR ROM: 0 KiB (the cartridge uses CHR RAM)
- Mapper: 2 / UxROM
- Header flags: Mapper 2 bits set; four-screen mirroring flag clear

The ROM is used only as a local behavioral and technical reference. The game
repository contains original procedural development textures and code, not
ROM bytes, extracted tiles, extracted audio, or Capcom source code.

## Confidence Levels

Facts above are byte-level observations and are safe to reproduce. Gameplay
rules, stage layouts, enemy timing, and asset identity require frame-by-frame
comparison against the same ROM revision. Until that comparison is complete,
the web build labels its stages and assets as an original approximation rather
than an exact ROM conversion.

`npm run extract:rom-assets` can locally dump both runtime CHR-RAM pattern
tables,
all four nametable/attribute buffers and rendered nametable previews, VRAM,
sprite OAM and selected 256x240 frames. `nametable-summary.json` records hashes,
dominant tiles and occupied bounds without bundling the raw assets. The output is ignored by Git and
is intended only for private inspection against the supplied reference file.

`npm run disassemble:rom -- --start=0xc180 --end=0xc220` uses the opcode table
from the pinned JSNES dependency to emit a linear 6502 disassembly. Mapper 2
PRG banking is handled explicitly: `$C000-$FFFF` maps to the fixed final PRG
bank and `$8000-$BFFF` maps to the selected `--bank`. The tool rejects
non-Mapper-2 files, truncated PRG payloads and addresses outside cartridge
space. The output is a local
analysis aid and is not committed as reconstructed Capcom source.

Bank 1 opening code at `$B312-$B3F8` reads 22 tile-run pointers from
`$B787/$B79D` and three PPU row targets from `$B7B3/$B7B6`. Running
`npm run extract:rom-opening-script` follows those pointers, validates each
`0xFF`-terminated run, and writes the nametable script to the ignored
`.rom-traces/bank1-opening-nametable.json`. Bank 1 is observed during the
title/opening flow; this data is not labeled as a Round gameplay script.

The verified Round initializer stores a per-Round map-end pointer from
`$E875` in `$5E/$5F`; collision lookup at `$C6C4` indexes the current Round
bank in eight 32-pixel columns. `$8400` is the ring base and `$8440` is the
initial row pointer; normal forward scrolling increments the pointer by one
eight-byte row and wraps from the per-Round end to the base. Running
`npm run extract:rom-round-maps` extracts the six cell grids, their five-byte
cell definitions, and self-generated ID-color/collision previews into the ignored
`.rom-traces/round-maps/` directory. The previews visualize structure without
reusing the original tile artwork. Collision is decoded from bit 6 of each
definition quadrant, matching the player collision test at `$C733-$C77F`.

The fixed-bank scheduler at `$FA30-$FAE5` reads three-byte records from `$8C00`
in the current Round bank. Each record contains a map-row trigger, a position
index/map-phase byte, and an entity code/flags byte. Position indexes resolve
through the Y/X tables at `$FB09/$FB71`; `$FB09` feeds the vertical `$05C0`
coordinate and `$FB71` feeds the horizontal `$05E0` coordinate. Position byte
`0x00` is the Boss gate
guarded by `$49`, while `0xFF` resets the script to `$8C00` and increments the
loop counter. `npm run extract:rom-round-events` validates and extracts all six
scripts into ignored `.rom-traces/round-events/manifest.json`, retaining raw
entity codes until their behavior is individually identified. The manifest
also follows `$C796` through the initializer table at `$DE83` and, for enemy
slots, the bank 6 behavior-pointer table at `$B000`; this records mechanical
code-to-routine mappings without assigning speculative gameplay names.
With the local ROM present, `npm run generate:rom-event-data` regenerates the
committed compressed runtime event stream from that manifest. Position-byte
bit 5 selects the six-slot object pool at `$0402-$0407`; clear bit 5 selects
the seven-slot enemy pool at `$0410-$0416`. Both pools remain in the runtime
event stream with separate capacities.
The generated `ROUND_ROM_OBJECT_EVENTS` stream retains no-behavior object
records. The runtime consumes the single `wantedTrigger` per Round to place
the poster barrel; `sceneObject` and `stateControl` records remain available
for later scene-system work.
Round 4's 44 `$B5BF` records all select the object pool and remain unclassified
scene objects; they are deliberately not rendered as enemy proxies until their
visual and interaction state is decoded.
In contrast, `sceneObject` records with dispatch type `0x07` render as generic
field enemies in the ROM. The runtime now preserves those events as object-pool
gunmen, while dispatch `0x08` and state-control records remain deferred.
Contact verification confirms object codes `33` and `34` drop Boots and Rifle
respectively after destruction; the runtime uses those deterministic drops.
Behavior routine `$B0E5` allocates three projectile slots at `$B24B-$B281`
and emits adjacent direction values, identifying it as the Shotgunner spread
attack used by the runtime behavior map. An isolated instance fires at age 108
and 159 frames, then exits at age 228; the runtime preserves both volleys.
Round 1 uses exactly five behavior routines: `$B080`, `$B0E5`, `$B501`,
`$B284` and `$B46E`. After the first four are identified as Sniper,
Shotgunner, Bomber and Gunman, the remaining `$B46E` routine is the verified
Backstabber mapping for that Round.
The extractor labels no-behavior `dispatch 30/31` records as `stateControl`,
the flag `0x40` record as `wantedTrigger`, and other no-behavior records as
`sceneObject`; these labels are research semantics, not copied ROM code.
An isolated `$B501` actor first creates its `0x72`/dispatch `0x2F` dynamite
after 198 frames and repeats after 106 frames. The projectile remains airborne
for 212 frames, changes to landed dispatch `0x3E` for 53 frames, then clears;
the runtime uses these measured timings at 60.098 Hz.
An isolated `$B080` Sniper fires at ages 134, 224, 405, 495 and 585 frames,
then releases its slot at age 732. The routine's 90-frame base cooldown is
visible directly; the longer middle gap is a missed discrete aiming window.

Current behavior map:

| Routine | Runtime mapping | Evidence |
| --- | --- | --- |
| `$B080` | Sniper | isolated slot/OAM timing trace |
| `$B0E5` | Shotgunner | three projectile slots and two measured volleys |
| `$B284` | Gunman | Round 1 roster elimination after the measured routines |
| `$B46E` | Backstabber | Round 1 roster elimination |
| `$B501` | Bomber | isolated delayed dynamite state |
| `$B5BF` | object-only scene behavior | 44 Round 4 records all select object pool |
| `$B671` | Ninja | Round 4 roster elimination after Gunman/Shotgunner |
| `$B775` | Rifleman | Round 2/Round 5 roster elimination |
| `$B82F` | Backstabber | Round 5 roster elimination |
| `$B8F4` | Hatchet Thrower | Native Village roster elimination |
| `$BA51` | Spear Thrower | Native Village roster elimination |
| `$BB29` | Firebreather | Native Village roster elimination |

The elimination entries remain behavior approximations until their complete
state machines are traced; the runtime stores the original routine and entity
codes alongside each spawned unit for comparison.

The one record per Round carrying entity flag `0x40` occurs before the Boss
gate and feeds the `$CBDA-$CBDF` interaction path that sets `$49`; its decoded
NES X positions are `[200,64,216,216,72,216]`, and these are the current
byte-level Wanted-trigger positions used by the web runtime.

Pattern-table previews remain grayscale for bitplane inspection; nametable
previews apply each tile's expanded attribute and the live NES background
palette so terrain colors match the captured scene.

`npm run trace:rom:timeline` presses Start before the attract timer begins,
starts a real game,
samples title, opening, and the first Round at 60-frame intervals until the
first-life trace ends. It records frame hashes, PPU scroll state and active OAM
sprite counts for encounter-timing comparisons.
Each sample also includes `gameFrame`, measured from the verified Round 1 entry
at ROM frame 825, so timeline samples can be mapped directly onto procedural
world coordinates.

`npm run trace:rom:scenes -- --frames=12000 --every=60` writes a longer,
machine-readable trace to `.rom-traces/scenes.json`. In addition to the state
candidate bytes it records raw PPU coarse/fine scroll, nametable hashes, an OAM
activity hash, and frame hashes. Zero-page values are keyed by their literal
addresses (`0x4c`, `0x4f`, `0x62`, `0x68`, `0x69`, and `0x7a`) rather than
unverified semantic names. In particular, `0x62` changes inside a single Round
and must not be treated as a stable stage number. `$6A/$6B` and
`$0780-$07BF` are input-replay state instead of gameplay events: when `$68` is
nonzero, `$C1A2-$C1BE` plays input/duration pairs into `$F7`; during a normal
Round 1, `$C1D3-$C208` records the same run-length format. Add `--hold-ab` when a
deterministic continuous-fire comparison is needed. The trace contains
observations only; it does not include ROM bytes or extracted graphics.
Detailed scene samples also list active entity slots from the parallel arrays
at `$0400/$0420/$0480/$0560/$05C0/$05E0`. The trace labels only the verified
slot state, dispatch type, variant, script flags and X/Y values; it does not
assign gameplay names before a dispatch routine is identified.
Both trace modes include the verified zero-based Round index at `$41`, the
`$5A/$5B` map-ring pointer, `$5E/$5F` map end, raw `$5C/$5D` map page/scroll
state, and Billy's `$74/$71` X/Y coordinates. The initializer at `$E7E5` and
collision lookup at `$C6C4` provide the map-field evidence; `$E85E` seeds
`$74/$71` at `(128, 188)`, and the first collision pass produces the observed
Round-entry position `(136, 188)`.
Both trace formats also decode `hudScore` from the six visible OAM digit tiles
at `y=16`: runtime tiles 88 through 97 map directly to digits 0 through 9.
This gives a verified score observation without assigning semantics to an
unknown RAM address.
They also record the input-replay cursor (`$6A/$6B`), raw `$A3`, the live
`$0780-$07BF` input/duration pairs, and the actual Mapper 2 bank selected through
writes at `$8000+`. Each sample also reports every bank seen and the number of
bank writes during that interval, because the game can switch several times
inside one video frame. This keeps observed mapper state separate from unknown
RAM semantics while locating the switchable-bank script data.
The `ppuUpdate` sample decodes the live `$036A+` command consumed by
`$C0DF-$C133`: `$036A/$036B` are the big-endian PPU address, `$036C` contains
vertical/repeat/length flags, and `$036D+` is the tile payload. A zero six-bit
length means 64 writes.
`--pulse-fire` alternates short A/B presses every four frames, producing a
repeatable diagonal-fire trace for score and hit timing. Unlike `--hold-ab`, it
continues to trigger the semi-automatic Pistol after the first shot.
For the verified ROM, a 600-frame pulse trace reports HUD score 100 at gameplay
frame 240 and 200 at frame 360; these are stable calibration checkpoints for
early Round 1 reward timing.

The corrected Round 1 trace shows the PPU vertical position advancing 20 pixels
per 60 frames. At 60.098 Hz, the 540-high procedural world therefore uses
45.0735 world pixels per second (`20 * 60.098 / 60 * 540 / 240`) for its
automatic scroll.
The collision lookup also preserves the PPU page rule: when `$5C == 0`,
`$C6C4` adds an extra 8-byte map-row offset; the runtime collision helper has
been checked against the original lookup for 28,800 sampled screen cells.

Holding Left for 60 real frames moves Billy about 75 NES pixels. The procedural
world therefore uses 169.025625 world pixels per second;
the Boots speed increase remains an explicit multiplier pending a verified ROM
measurement.

OAM projectile traces show straight A+B pistol shots moving 6 pixels per frame,
and single-button diagonal shots moving about 2.5 horizontal / 5 vertical
pixels per frame. Normal pistol shots persist for roughly 15 frames. These map
to 811.323 straight, 338.05125/676.1025 diagonal world pixels per second and a
15/60.098-second base lifetime in the procedural world.

The first active enemy wave appears around gameplay frame 195 in the verified
Round 1 trace, which maps to roughly 146 world pixels at the calibrated 45
world-pixel/second scroll speed. OAM activity changes at approximately gameplay
frames 555, 735 and 975, mapping to world segment boundaries 416, 551 and 731;
Round 1 uses those measured boundaries. Other Round boundaries remain explicit
approximation parameters until each has an equivalent trace.

The web title page can also load the same local ROM into Reference ROM mode.
This provides a legal exact-runtime comparison path without distributing the
ROM; the regular web game remains the original procedural recreation. The
runtime validates the iNES header, reports Mapper/PRG metadata, maps keyboard
and Gamepad input to controller 1, advances at the JSNES NTSC rate of 60.098 Hz and forwards JSNES APU
samples to the engine `AudioManager` music PCM stream. JSNES uses the actual
`AudioContext.sampleRate`, avoiding pitch and timing drift on non-48-kHz audio
devices.
