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
The web game renders the same 16-pixel mask through self-generated stage colors,
so visible geometry and collision share one decoded source without copying tile
art.

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
records. The runtime consumes dispatch `30/31` weapon and supply-shop triggers,
renders dispatch `0x08` scene props, and preserves dispatch `0x07`
breakable-container variants. Decoded shop and `0x07` objects descend at the
measured one NES pixel every three frames.
Round 4's 44 `$B5BF` records all select the object pool. Isolated contact
verification identifies them as falling rock hazards: they travel toward the
road center for about 24 frames, remain at the impact point for another 25
frames, and touching one costs a life. The runtime renders a self-generated
rock proxy and preserves the separate six-slot object capacity.
Dispatch `0x07` records with a verified pickup conversion now render as
self-generated breakable barrels instead of enemy proxies. Codes `32` and `41`
are also breakable empty barrels: controlled pulse traces move them to dispatch
`0x09` for about 10 frames before release, with no pickup conversion. Dispatch
`0x08` records are static scene props and use the same original landmark texture
family. The web runtime models codes `32/41` as shootable empty barrels while
their short explosion animation remains a visual approximation.
Contact verification confirms object codes `33` and `34` drop Boots and Rifle
respectively after destruction. The same isolated contact trace shows code
`35` converting to dispatch `0x22` (the ROM's all-enemy effect), code `36`
converting to dispatch `0x23` and adding 200 points on contact, code `37`
creating the horse actor, code `38` converting to dispatch `0x25` and
increasing the life counter, code `39` converting to dispatch `0x27` (Skull),
and code `42` converting to dispatch `0x26` (the Blue Yashichi invulnerability
branch). The runtime therefore enables deterministic POW, Money, Horse, Life,
Skull, and Blue Yashichi drops for those codes. Code `40` does not occur in the
six decoded scripts. Code `41` remains dispatch `0x07` until hit, then enters
dispatch `0x09`'s short explosion state and is released without a pickup
conversion; it is not the Wanted poster.
These object conversions do not add score when the barrel is broken; the Money
pickup's later collection is the 200-point reward.
The Blue Yashichi branch writes `180` to `$7C`, so the runtime uses a
`180 / 60.098`-second invulnerability window. The Life branch stops incrementing
at `$7A == 5`; both item and score-awarded lives share that five-life cap.
Boots and Rifle compare `$78/$79` against `4` before incrementing. At that cap,
contact leaves the stock unchanged and awards 100 points; the runtime preserves
both the four-item cap and overflow reward.
Behavior routine `$B0E5` allocates three projectile slots at `$B24B-$B281`
and emits a fixed downward fan. An isolated instance fires at age 108 and 159
frames, then exits at age 228; the three shots begin at the actor coordinate,
move about one NES Y pixel per frame, and use approximately `-1/8, 0, +1/8`
NES X velocity. The runtime preserves both volleys and this ROM-tagged fan;
non-ROM fallback formations retain their procedural aim.
The shared allocator at `$E454-$E460` scans ordinary enemy projectile slots
`$0418-$041f`, giving field bullets and dynamite a common eight-slot limit.
`$B24B-$B25F` first requires three free slots before a Shotgunner volley; the
runtime keeps that all-or-nothing reservation. Bandit Bill's traced `0x30`
shots remain in this ordinary pool. Other isolated Boss snapshots place Cutter
boomerangs, Devil Hawk fireballs, Ninja shuriken, Fatman Joe grenades and
Wingate bullets in the separate six slots `$0402-$0407`; falling rocks continue
to use their object pool.
Projectile clear routine `$CDD4-$CDE0` only zeros those same eight slots. The
POW path at `$CDAB-$CDD3` also handles ordinary enemy slots `$0410-$0416`, but
neither path clears object-pool falling rocks; runtime screen clears preserve
that boundary and retain the low-slot Boss projectile pool.
On a Horse-protected collision, `$CABC-$CAC5` first removes only the colliding
ordinary projectile, then `$CAEF-$CB29` decrements Horse health and starts a
60-frame protection timer without calling the screen-clear routine. The runtime
does not erase unrelated projectiles on a Horse hit.
Round 1 uses exactly five behavior routines: `$B080`, `$B0E5`, `$B501`,
`$B284` and `$B46E`. After the first four are identified as Sniper,
Shotgunner, Bomber and Gunman, the remaining `$B46E` routine is the verified
Backstabber mapping for that Round.
Contact with dispatch `30/31` reaches `$CC51`, which stores the dispatch in
`$A7`, stores the entity flags plus one in `$A5`, clears projectiles, and enters
the `$BD4E` menu. `$A5=1` selects its four-item weapon branch; flag `0x40`
produces `$A5=0x41` and selects the three-item supply branch. The extractor
therefore labels them `weaponShop` and `supplyShop`; other no-behavior records
remain `sceneObject`. These labels are research semantics, not copied ROM code.
An isolated `$B501` actor first creates its `0x72`/dispatch `0x2F` dynamite
after 198 frames and repeats after 106 frames. The projectile remains airborne
for 212 frames, changes to landed dispatch `0x3E` for 53 frames, then clears;
the runtime uses these measured timings at 60.098 Hz.
An isolated `$B080` Sniper fires at ages 134, 224, 405, 495 and 585 frames,
then releases its slot at age 732. The routine's 90-frame base cooldown is
visible directly; the longer middle gap is a missed discrete aiming window.
Its ROM Y coordinate advances with the camera at the measured scroll rate while
the X lane stays fixed; the runtime carries ROM-tagged Snipers with that scroll.
An isolated `$B284` Gunman fires one dispatch `0x30` bullet at age 39 frames
and releases its slot at age 289. The projectile's measured 20-frame travel
maps to roughly 266 world pixels/s; ROM-tagged Gunmen use this per-actor timing
instead of the procedural global firing clock.
On defeat, `$CD4E-$CDAA` converts an event's `0x80` flag into dispatch `0x4e`.
If `$90/$94/$98/$9c` show no special stock, it increments that to `0x4f`;
the `$E192` conversion table then maps them to Bullet (`0x29`) and Money
(`0x24`) pickups respectively. Unflagged ROM enemies produce no random drop.
An isolated `$B775` Rifleman enters its attack state at age 80 frames, emits
five dispatch `0x30` shots at ages 96, 112, 128, 144 and 160, then returns to
its movement state. The runtime preserves the 80-frame state transition, the
five-shot vertical volley and its 16-frame cadence.
An isolated `$B671` Ninja emits one dispatch `0x31` Shuriken at age 103
frames. Its measured path is diagonal toward Billy; the runtime uses the
same one-shot timing and a 300-world-pixel/s self-generated projectile.
An isolated `$B8F4` Hatchet Thrower emits its dispatch `0x32` projectile at age
78 frames and aims it toward Billy at roughly 230 world pixels/s. The runtime
uses that measured delay and speed.
An isolated `$BB29` Firebreather entity emits one dispatch `0x34` fireball at
age 156 frames, aimed toward Billy at roughly 250 world pixels/s. ROM-tagged
Firebreathers use this single-shot timing; the procedural fallback remains a
three-way spread for non-ROM formations.
An isolated `$BA51` Spear Thrower creates its dispatch `0x33` spear at age 72
frames and aims it toward Billy at roughly 250 world pixels/s. ROM-tagged
Spear Throwers use this measured timing; the procedural fallback remains the
shorter generic throw delay.
The `$B82F` Round 5 Backstabber variant is an ambush actor rather than a
projectile shooter: its X remains fixed, it descends roughly 85 NES pixels, and
its slot is released after about 407 frames. The runtime keeps this state
separate from the `$B46E` movement variant.
The `$B46E` Backstabber variant is a mirrored side raid. Left/right traces both
live for 369 frames; during the first 160 frames the actor crosses 174 NES
pixels while following the same measured vertical bends. The runtime
interpolates seven mirrored checkpoints instead of sending it straight upward.
Neither isolated Backstabber routine creates a projectile, so only Gunmen
remain eligible for the runtime's generic field-enemy firing clock.
An early Boss-gate trace identifies Bandit Bill as dispatch `0x88`, variant
`0x56`. His first four-shot volley starts at age 107, repeats every 12 frames,
and the next volley starts 72 frames after the fourth shot. Dispatch `0x30`
projectiles travel at roughly 444 world pixels/s; Round 1 uses these measured
values instead of its former single slow shot.
The gate traces place his initial entity at the top edge (`y=0`) and observe
four horizontal entry lanes, NES `x=96/128/160/192`; after 96 frames the actor
reaches approximately `y=64`. The web runtime selects one of those measured
lanes and uses the corresponding downward entry speed. After the opening, the
runtime follows the measured lateral/vertical combat path while retaining the
separate damage-phase approximation.
The same controlled full-round trace identifies Round 2's Cutter as dispatch
`0x90`, variant `0x5b`, entering from the top edge (`y=0`). Controlled runs
observe NES horizontal entry lanes near `x=88/144/168`; one lane reaches about
`y=136` after 324 frames. The web runtime selects one measured lane and uses
the calibrated downward opening, then follows the measured 136-to-40/99 NES
vertical combat profile while resuming horizontal movement at about
1.72 NES X pixels per frame. At frame 350 it creates the paired `0x98/0x99`
boomerangs, repeating every 256 frames. Their first 29-frame path measures
about 63 NES X pixels and 40 NES Y pixels, converting to roughly 524 world
pixels/s; the runtime preserves the pair, timing, speed and opposite curves.
After clearing only ordinary slots at the next real gate, Round 3 produces
Devil Hawk as dispatch `0x9a`, variant `0x61`, entering from the top edge
(`y=0`). Controlled traces observe NES horizontal entry lanes near
`x=128/168/208`; the opening holds that lane and reaches approximately `y=96`
after 143 frames, then holds the lane for another 113 frames before the first
lateral jump; the measured path then moves through NES `x=157/137/155`. At frame
174 it creates five simultaneous `0xa2` fireballs with measured NES velocity
vectors `(-2,2),(-1,3),(0,3),(1,3),(2,2)` pixels per frame; later
position-dependent attacks use three. A common repeat interval is 125 frames.
The runtime preserves this fixed opening fan, 5/3 timing and speed. The first post-entry jump
profile is sampled from the Boss trace; later short jumps repeat as a measured
121-frame cycle approximation.
The same campaign reaches Round 4 and identifies its Ninja Boss as dispatch
`0xaa`, variant `0x6b`, with measured entry lanes near NES `x=176/192` and
`y=64/128`. The runtime selects one horizontal and one vertical lane; smoke,
teleport, and damage timing remain an approximation until the Boss slot can be
isolated without the research cleanup used to cross the earlier gates.
The isolated Ninja routine first creates a low-slot smoke/prepare entity at
frame 140, remains in its entry smoke state for about 44 frames, then emits
four `0x30` shuriken bullets at frame 179; subsequent volleys commonly recur
after 60 frames. Their diagonal path measures about 405 world pixels/s. The
runtime uses the entry invulnerability, the measured multi-height combat
profile, four-shot opening and interval while keeping the smoke and teleport
visuals procedural.
Round 5's gate identifies Fatman Joe as dispatch `0x80`, variant `0x51`. He
enters from the top at NES `(x=152, y=0)`, keeps that horizontal lane for the
first 170 frames and reaches about `y=112`. The first five `0x3f` grenade traps
start at frame 205 and are emitted one every four frames; each remains at its
launch coordinate for about 30 frames before the slot is released. The next
five-shot sequence begins about 131 frames later. The runtime preserves this
opening delay, sequential cadence, static lifetime and the measured post-entry
horizontal movement. The stored Boss trace now drives the measured multi-hop
vertical profile.
Round 6's first Wingate encounter is dispatch `0xa3`, variant `0x65`. It enters
from the top at NES `(x=152, y=0)`, holds that horizontal lane and reaches
approximately `y=98` after 151 frames. The runtime preserves this first-
encounter opening without reusing it for the second, real Wingate. After the
opening, both encounters use a short roughly 176 world-pixel/s horizontal rush,
then settle to about 123 world pixels/s; their later attack phases remain
approximations pending isolated traces.
The first encounter clears both ordinary and low-slot projectile actors before
entering a 264-frame empty interval. The real Wingate
then reuses dispatch `0xa3`, variant `0x65` and the same 151-frame vertical
opening, but enters on NES lane `x=192`; `$BA=1` distinguishes this second
encounter. The runtime preserves the delay, separate entry lane, and the
phase-specific vertical combat profile.
With ordinary enemy slots suppressed, the first encounter emits six low-slot
`0x30` bullets beginning at frame 4 and spaced 12 frames apart; each uses the
Boss X minus 8 NES pixels and stays on that launch lane. The next volley starts
24 frames after the sixth. Vertical bullets move 2 NES pixels per frame.
The real Wingate first fires at frame 277, emits three shots at the same
12-frame cadence, then leaves a measured 680-frame gap before the next attack
state. The runtime uses these phase-specific timings and sequential shots.

Current behavior map:

| Routine | Runtime mapping | Evidence |
| --- | --- | --- |
| `$B080` | Sniper | isolated slot/OAM timing trace |
| `$B0E5` | Shotgunner | three projectile slots and two measured volleys |
| `$B284` | Gunman | isolated dispatch/OAM timing trace |
| `$B46E` | Backstabber side raid | mirrored movement/lifetime trace |
| `$B501` | Bomber | isolated delayed dynamite state |
| `$B5BF` | falling rock hazard | isolated contact/state trace |
| `$B671` | Ninja | isolated dispatch/OAM timing trace |
| `$B775` | Rifleman | isolated state/OAM timing trace |
| `$B82F` | Backstabber ambush | isolated movement/lifetime trace |
| `$B8F4` | Hatchet Thrower | isolated dispatch/OAM timing trace |
| `$BA51` | Spear Thrower | isolated dispatch/OAM timing trace |
| `$BB29` | Firebreather | isolated dispatch/OAM timing trace |

The elimination entries remain behavior approximations until their complete
state machines are traced; the runtime stores the original routine and entity
codes alongside each spawned unit for comparison.

The one supply-shop record per Round carries entity flag `0x40`; its decoded
NES X positions are `[200,64,216,216,72,216]`. Unflagged weapon-shop counts are
`[1,1,2,1,1,2]`, matching the extra weapon visits in Rounds 3 and 6. The web
runtime preserves their exact script order, coordinates, flags, and enemy-pool
identity.

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

`npm run trace:rom:boss -- --frames=18000` runs the first Round with a controlled
poster-gate flag and temporary invulnerability, then records the real Bandit
Bill slot (`$0400/$0420/$0480`) and projectile-slot changes for 720 frames.
The output is an ignored observation artifact under `.rom-traces/`; it is not
runtime game data or copied ROM code.

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
slot state, dispatch type, variant, script flags and coordinates; `$05C0` is
NES Y and `$05E0` is NES X. It does not
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
with `$78` set to any nonzero Boots stock and `$45=2`, the same trace moves 100
pixels. The runtime therefore uses a non-stacking `4 / 3` Boots multiplier.

OAM projectile traces show straight A+B pistol shots moving 6 pixels per frame,
and single-button two-gun diagonal pairs moving about `(2,-5)` and `(3,-5)`
NES pixels per frame (mirrored on the left). Normal pistol shots persist for
roughly 15 frames. These map
to 811.323 straight, 338.05125/676.1025 diagonal world pixels per second and a
15/60.098-second base lifetime in the procedural world.
With `$79/$88` set for an active Rifle stock, the straight A+B projectile moves
8 pixels per frame but still persists for 15 frames. The runtime therefore
applies a non-stacking `4 / 3` speed multiplier to Pistol shots rather than
extending their lifetime.
Straight A+B fire occupies both player projectile slots at X offsets `-8/+8`;
the runtime emits two parallel bullets. A single A or B press also emits two
diagonal bullets from the corresponding side, one per gun barrel. The allocator scans six player
projectile slots at `$0408-$040d`; the runtime applies the same shared cap to
all four weapons and allows a multi-projectile shot to fill only the remaining
slots.

The weapon selector table at `$F1DD` stores codes `5/2/4/3/0` in `$88`. A fresh
game uses code `0` for Pistol; `$B821-$B825` changes that to code `1` when Rifle
stock is active. Isolated traces identify code `5` as Shotgun, code `2` as
Machine Gun and code `4` as Magnum. Code `3` is the armed Smart Bomb state:
`$EE1C-$EE29` selects the Pistol/Rifle firing template, `$EECF-$EED7` skips
special-ammo consumption, and `$CAE2-$CAEC` selects the lethal-hit bomb branch
only for that code before `$F294-$F2BB` clears it back to Pistol/Rifle. Shotgun
fire creates five dispatch `0x01` projectiles: a single-side shot uses NES velocity
pairs from `(0,-12)` through `(12,0)`, while A+B uses the symmetric
`(-8,-8)..(8,-8)` fan. Magnum shots use dispatch `0x37-$0x3a` for 34 frames and
the same measured movement speed as base Pistol shots; Magnum also emits the
same two-gun pair as Pistol for each trigger. Shotgun projectiles live for 11
frames. Projectile byte `$0540` is `1` for Pistol, Shotgun and Machine
Gun and `3` for Magnum, matching the runtime damage values. The web runtime
preserves those lifetimes while retaining its self-generated Magnum piercing
body.
Held-input traces fire Shotgun and Magnum once, while code `2` Machine Gun
continues to allocate projectile pairs at its measured cadence. Isolated
single-side traces measure base Pistol vectors near `(2,-5),(3,-5)` NES pixels
per frame and Machine Gun vectors near `(4,-9),(7,-7)`; Rapid pulse
traces measure Pistol/Shotgun/Machine Gun/Magnum trigger intervals of
`4/12/5/4` frames.

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
