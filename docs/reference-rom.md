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
coordinate and `$FB71` feeds the horizontal `$05E0` coordinate. The position
byte high bit is retained as the movement `phase` in generated enemy events,
so shared behavior routines keep their distinct initialization paths. Position byte
`0x00` is the Boss gate
guarded by `$49`, while `0xFF` resets the script to `$8C00` and increments the
loop counter. `npm run extract:rom-round-events` validates and extracts all six
scripts into ignored `.rom-traces/round-events/manifest.json`, retaining raw
entity codes until their behavior is individually identified. The manifest
also follows `$C796` through the initializer table at `$DE83` and, for enemy
slots, the bank 6 behavior-pointer table at `$B000`; this records mechanical
code-to-routine mappings without assigning speculative gameplay names.
With the local ROM present, `npm run generate:rom-event-data` regenerates the
committed compressed runtime event stream from that manifest. Entity type-byte
bit 5 selects the six-slot object pool at `$0402-$0407`; clear bit 5 selects
the seven-slot enemy pool at `$0410-$0416`. Both pools remain in the runtime
event stream with separate capacities. The compressed behavior and object
streams retain each record's original `$8C00` script index; runtime merges them
by trigger and script index so mixed enemy/object/shop groups preserve their
original order and compete for shared slots in the same sequence as the ROM.
The map-row transition releases a record at decoded scroll plus `2/3` of one
NES pixel; runtime retains that phase instead of spawning two frames early.
At `$FA89-$FA92`, a full selected pool skips the record and `$FAD8` advances
the script pointer; runtime applies the same one-shot capacity check to shops,
containers, props and behavior entities instead of retrying or exempting shops.
Each shop retains its original per-Round script ordinal, so a skipped earlier
shop does not cause a later supply/weapon visit to use the wrong inventory.
The generated `ROUND_ROM_OBJECT_EVENTS` stream retains no-behavior object
records. The runtime consumes dispatch `30/31` weapon and supply-shop triggers,
renders dispatch `0x08` scene props, and preserves dispatch `0x07`
breakable-container variants. Decoded shop and `0x07` objects descend at the
measured one NES pixel every three frames. The shared scrolling-actor update
releases shops, containers, props, and converted pickups when screen Y reaches
`252` (`$FC`); runtime uses that same boundary for slot cleanup.
Round 4's 44 `$B5BF` records all select the enemy pool. Isolated contact
verification identifies them as falling rock hazards. A locked lifecycle trace
follows dispatch `0x6C/0x6D` for 96 frames from NES `(4,48)` through a curved
route to `(169,214)`, then dispatch `0x3D` remains non-colliding for 25 frames
before release; right-edge records use the opposite heading and can reach the
terrain at an earlier frame. The runtime replays those measured keyframes,
tests each position against a decoded non-zero terrain quadrant, and keeps a
self-generated rock proxy in the same seven slots as ordinary enemies.
Routes that reach NES Y `252` (`$FC`) are released immediately without
entering the impact effect; runtime applies that bound before terrain checks.
Because rocks occupy the ordinary enemy slot range, the Blue Yashichi contact
branch at `$8ACC-$8AD8` also scores and converts them; runtime sends contacted
rocks into the same impact state rather than treating them as immune bullets.
Dispatch `0x07` records with a verified pickup conversion now render as
self-generated breakable barrels instead of enemy proxies. Codes `32` and `41`
are also breakable empty barrels: controlled pulse traces move them to dispatch
`0x09` for about 10 frames before release, with no pickup conversion. Dispatch
`0x08` records are non-interactive scene props, use the same original landmark
texture family, and advance one NES screen pixel every three frames. The web runtime models codes `32/41` as shootable empty barrels while
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
The Blue Yashichi branch writes `180` to `$7C`; `$EFDC-$EFE7` decrements that
counter only on every other gameplay frame, so the runtime uses a
`360 / 60.098`-second contact-damage window. When it expires, `$EFE9-$EFEB`
writes `60` to `$7B`, leaving 60 frames of ordinary protection without contact
damage. The Life branch stops incrementing
at `$7A == 5`; no ROM path increments `$7A` in response to score changes.
Round-entry snapshots store `3` in `$7A`, so the runtime starts a new game with
three lives and treats five only as the cap.
Boots and Rifle compare `$78/$79` against `4` before incrementing. At that cap,
contact leaves the stock unchanged and calls score-table entry `2` with carry
set, awarding 1,000 points. Life at the five-life cap calls entry `7` the same
way and awards 10,000 points. Runtime preserves both caps and overflow rewards.
Behavior routine `$B0E5` allocates three projectile slots at `$B24B-$B281`
and emits a fixed downward fan. An isolated instance fires at age 108 and 159
frames, then exits at age 228; the three shots begin at the actor coordinate,
move about one NES Y pixel per frame, and use approximately `-1/8, 0, +1/8`
NES X velocity. The runtime preserves both volleys and this ROM-tagged fan;
the actor follows the measured full path through its final top-edge retreat and
releases at frame 228. The runtime has no non-ROM fallback formation path.
Entity code `4` uses the same `$B0E5` routine but initializes at NES side lanes
`x=4/248`. A right-edge isolation moves inward to offset `(-72,-22)` by frame
114, emits one three-projectile fan, folds back toward the edge, and releases
at frame 232. Runtime mirrors this measured path for left-edge records instead
of applying code `3`'s top-entry path and two-volley schedule.
The shared allocator at `$E454-$E460` scans ordinary enemy projectile slots
`$0418-$041f`, giving field bullets and dynamite a common eight-slot limit.
`$B24B-$B25F` first requires three free slots before a Shotgunner volley; the
runtime keeps that all-or-nothing reservation. Bandit Bill's traced `0x30`
shots remain in this ordinary pool. Other isolated Boss snapshots place Cutter
boomerangs, Devil Hawk fireballs, Ninja shuriken, Fatman Joe grenades and
Wingate bullets in the separate six slots `$0402-$0407`; falling rocks use the
ordinary enemy actor slots instead.
Projectile clear routine `$CDD4-$CDE0` only zeros those same eight slots. The
POW path at `$CDAB-$CDD3` also handles ordinary enemy slots `$0410-$0416`, but
not the low-slot Boss projectile pool. Runtime projectile-only clears leave
falling rocks active, while POW, Smart Bomb and life-loss enemy clears remove
them with the other enemy-slot actors. Smart Bomb enters this same `$CDAB`
path, so ordinary enemy score and `$CD4E` drop conversion run before the slots
are released; the runtime preserves the short defeat state before releasing
those enemy actors. It is not a score-free direct erase.
Its `$F294-$F2BB` branch does not write the Horse/Blue invulnerability timers,
so runtime does not add a post-clear protection window.
The Round 1 life-loss trace also clears active ordinary enemy actors in the same
frame as the life decrement while leaving breakable barrels and scene objects.
The hit creates player death dispatch `0xB7` and freezes the map for 152 frames
before decrementing `$7A`; Billy stays hidden for 100 more frames, reappears for
a 40-frame ready hold, then scrolling resumes. The runtime applies the same
292-frame sequence and enemy-only clear while leaving Boss actors and low-slot
weapons intact.
At zero lives, `$F3F4-$F515` enters the Game Over selector. Select toggles
`$07`; Start with the default zero choice sets `$AB=-1`, calls `$E711`, restores
three lives, preserves `$78/$79/$88` and `$90-$9F`, and reinitializes the current
Round. The other choice clears `$41` and returns to the title path. Runtime
Continue preserves the corresponding score/power-up/weapon/ammo/bomb state and
resets Horse, Wanted, actor and map state.
On a Horse-protected collision, `$CABC-$CAC5` first removes only the colliding
ordinary projectile, then `$CAEF-$CB29` decrements Horse health and starts a
60-frame protection timer without calling the screen-clear routine. The runtime
uses the same 60 NES-frame window and does not erase enemy actors, high-dispatch
hazards, or unrelated projectiles on a Horse hit. Low-dispatch ordinary bullets
and airborne dynamite are cleared by the ROM contact branch; boomerangs, shells,
mines, rocks, and landed dynamite remain active. Boss-pool Wingate bullets and
Ninja shuriken use low dispatch values and are cleared on contact, while Devil
Hawk fireballs remain active. The same dispatch rule applies
to an unshielded contact; player invulnerability prevents repeated damage while
the source actor remains in its routine. Once the first unshielded contact sets
the death state in `$76`, the collision dispatcher stops processing additional
sources for that frame; runtime contact resolution now has the same boundary.
The Round transition path at `$B9BD-$B9DA` clears `$77` before incrementing the
Round, so Horse health does not carry into the next Round. Runtime stage changes
apply the same reset while preserving stored Boots/Rifle and weapon stocks.
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
The web shop entry now calls the same ordinary-projectile clear before pausing;
rocks remain enemy-slot actors and low Boss weapon slots remain separate.
Weapon shop code `$BE2F-$BE43` refuses a selected weapon only while its
`$90/$94/$98/$9C` stock is nonzero, so a depleted weapon can be purchased again.
The Bullet loop at `$BE64-$BE87` skips zero stocks and increments only active,
not-yet-capped weapons; runtime shop/refill checks use that current-stock
distinction.
An isolated `$B501` actor descends one NES pixel per frame until it enters the
player's 64-pixel vertical range; on the controlled entry trace it immediately
starts its first 90-frame throw, then chooses among eight movement headings.
Their durations are `64/38/32/14/16/14/32/38` frames and use the ROM's
discrete velocity table. At the end of a movement segment, a half-probability
decision either starts another segment or creates its `0x72`/dispatch `0x2F`
dynamite and holds the actor in a 90-frame throw state. The ROM sums its `$AD`
and `$AC` random bytes; the sum's sign bit selects throwing and bits `0x1c`
select the next direction, so runtime keeps the two decisions correlated. This makes throw times
deliberately variable; one clean natural trace throws at ages
`159/289/397/527/633`. The projectile remains airborne for 212 frames, changes
to landed dispatch `0x3E` for 53 frames, then clears; the runtime uses these
measured timings at 60.098 Hz. Across complete traces,
the airborne Y offset reaches about 18/32/89 NES pixels at frames 20/40/212;
horizontal correction ends after roughly 40 frames. The landed state then
moves with the measured scene-object scroll instead of freezing in world space.
Player-contact dispatch at `$CB3D-$CB4E` clears airborne `0x2F` dynamite and
returns without applying damage. Landed `0x3E` instead enters the normal hazard
branch without the pre-hit clear, so the runtime permits contact defusal only
during flight and treats the landed fuse as damaging.
The first in-range opportunity waits one frame before applying that same sum.
When a 90-frame throw ends, the ROM sums `AD+AC` again but uses the resulting
direction regardless of its sign, preventing consecutive throws. Screen Y
outside `48..191` forces straight up/down without mutating the random register.
Runtime now shares one decision path for initial, post-throw, and segment-end
transitions and preserves these three distinctions.
The same Round 1 traces show the Bomber actor reaching `y=126` at age 125 while
its X coordinate remains fixed. Runtime then uses the measured movement-state
durations and velocities for every later segment instead of interpolating one
captured random route, and releases the actor when its post-entry path leaves
the NES screen rather than applying the generic enemy age cap.
An isolated `$B080` Sniper fires at ages 134, 224, 405, 495 and 585 frames,
then releases its slot at age 732. The routine's 90-frame base cooldown is
visible directly; the longer middle gap is a missed discrete aiming window.
Its ordinary `0x30` bullet is allocated at the Sniper's exact actor coordinate,
with no projectile spawn offset.
Its ROM Y coordinate advances with the camera at the measured scroll rate while
the X lane stays fixed. Runtime world Y therefore advances by the camera delta
plus one equal screen-space delta, and releases Snipers at the observed NES
screen boundary `Y=252`.
Each shot enters a cover dispatch for 90 NES frames, disabling collision until
the actor returns to its firing state.
Their dispatch `0x2f` bullets use the ROM's quantized 32-direction speed table
at the first speed tier rather than continuous-angle velocity.
The opposite-side entity code `2` keeps the same lifetime but hits every middle
window, firing at ages 134, 224, 314, 404, 495 and 585. Runtime selects the
schedule by entity code rather than dropping code `2`'s third shot.
Natural `$B284` top-entry Gunmen begin with scheduler seeds `56`, `72`, and
`22`, producing first attack opportunities at ages 58, 52, and 69. `$0540`
advances by three until wrapping at 192, so an
attack opportunity repeats every 64 frames and only fires when the actor's
stored movement heading is within two sectors of its integer aim at Billy.
Isolated entry movement phases appear at frames `40/52/58/62`; the complete left route
fires again at frame 314, while the complete right route fires again at frames
570 and 1146. The runtime preserves those observed phases, the 64-frame retry,
and the captured per-frame headings instead of imposing a one-shot limit. The
center trace releases at age 549 after its retreat, and the left
trace releases at age 828 from the screen bottom, while the right trace remains
active through frame 1195 before its slot is reused. The runtime replays those
measured center/left/right paths and uses release caps of 549/828/1196 frames.
The projectile uses the ROM's quantized
32-direction speed table at the second tier (about 266 world pixels/s on its
diagonal), and ROM-tagged Gunmen use this per-actor timing
instead of the procedural global firing clock. A clean Round 1 isolation also
shows the actor rising from `y=0` to approximately `y=53` at frame 40 and
`y=128/132` at frames 100/104 before its horizontal combat state; the runtime
uses these entry checkpoints and keeps the later movement procedural. The
complete center, left, and right isolation traces are replayed at integer NES
frames for their 549-, 828-, and 1196-frame routes, respectively. Those exact
samples are used for the captured `x=88,y=0` entry; runtime keeps the original
branch-relative path for other entry coordinates instead of extrapolating a
single trace beyond its evidence.
Entity code `5` initializes the same routine with the opposite heading and
enters from the bottom edge. Its 56-NES-pixel proximity branch is visible in
two isolated routes: the near route fires at frame 219 and releases at frame
318, while the far route fires at frame 241 and releases at frame 479. Runtime
samples both player axes when the branch runs at frame 50, mirrors the matching
measured route, and does not apply the top-entry Gunman timing.
The same routine has distinct side-entry initializers. Entity code `7` enters
from either edge on a mirrored route, with successful attack windows observed
at frames 64/410, and releases at frame 642. The left-edge `x=4,y=32` event has a complete 642-frame integer
coordinate trace; its first visible sample is one pixel below the event origin.
The natural Round 1 `at=687` seed fires at frame 58. Runtime replays the trace
relative to the event origin and mirrors it for the right-edge initializer.
Entity code `8` holds the left edge while scrolling,
lunges inward at about frame 247, with a successful frame-309 window in one
trace, and releases at frame 508. Entity code `9` enters from the right, follows
a long mirrored loop, with successful windows at frames 399/463 in one trace,
and releases at frame 826. The generated `$0540` seed can move these windows:
the runtime checks every 64 frames, uses the fixed heading `16` during the
initial side state, and then switches to the stored movement heading. Because
the scheduler computes `$0540` from `$AC + $AD - $AE` for every successfully
allocated entity code below `0x20`, the runtime advances the same global RNG
and derives the initial opportunity directly from that byte. Top-edge flank
entries wait for the actor to reach the same `Y=16` threshold before counting;
side entries begin counting immediately. `$04E0` remains a reused slot field.
Round 2's single `code=7,x=56,y=0,phase=1` event is a distinct top-edge
initializer. Its first scheduler wrap at frame 51 misses the facing gate, the
second succeeds at frame 115, dispatch changes to `0x59` at frame 260, and the
actor releases at frame 369.
Round 3's single `code=7,x=80,y=0,phase=1` event is a distinct top-edge
initializer. It enters movement state at frame 48, reaches its attack state at
frame 160, changes to dispatch `0x5A` at frame 221, and releases at frame 324.
Runtime binds both complete coordinate traces to their Round/entry/phase
instead of applying the 642-frame left-edge route.
Round 1's `at=847,x=248,y=32,code=7,phase=0` event has a separate 590-frame
right-edge route. Its seed schedules checks at frames 28 and 92; the first
misses the facing gate and the second fires. It later changes to dispatch
`0x59` and releases at `Y=252`. Runtime scopes the full coordinate trace by
event index because other right-edge code-7 entries reuse different slot state.
Round 1's `at=1423,x=4,y=48,code=7,phase=0` event likewise has a distinct
307-frame left-edge route. Its seed reaches the first opportunity at frame 64,
which passes the facing gate; dispatch changes to `0x59` at frame 221 and the
actor releases at `Y=252`.
Round 1's `at=1743,x=248,y=80,code=7,phase=0` starts directly in dispatch
`0x59`, fires at its frame-64 opportunity, then follows a distinct 590-frame
route across the screen and exits through the top edge. It is not a mirror of
the other 590-frame right-edge route.
Round 1's `at=1791,x=4,y=128,code=7,phase=1` event uses a 252-frame route.
It starts in dispatch `0x59`, changes to `0x57` at frame 26, fires at frame 64,
and releases at `Y=252`.
Round 1's `at=1983,x=248,y=48,code=7,phase=1` event follows a 475-frame
route. Its first opportunity at frame 31 misses the facing gate, frame 95 fires,
and the actor later exits through the right screen boundary. The following
same-coordinate event does not share this route.
That following `at=2079,x=248,y=48,code=7,phase=1` event instead lives for
675 frames. Its seed schedules its successful shot at frame 59, and it exits
at `Y=252`; the two traces diverge by frame 22 despite identical entry data.
Round 1's `at=2223,x=248,y=64,code=7,phase=0` event uses a 464-frame route.
Its seed reaches a successful first opportunity at frame 57; the actor then
crosses the arena and exits through the top edge.
Round 1's `at=2511,x=248,y=96,code=7,phase=0` event uses a 426-frame route.
Its frame-64 first opportunity fires, followed by a leftward traversal and a
right-boundary release.
Round 1's `at=2559,x=4,y=112,code=7,phase=1` event uses a 557-frame route.
Its early scheduler opportunities miss until frame 238, when the facing gate
allows one shot; the actor later exits through the top edge.
Round 1's `at=2671,x=248,y=48,code=7,phase=0` event follows a distinct
582-frame route. Its first opportunity fires at frame 73, and the actor later
releases at `Y=252`.
Two complete Round 2 `y=32`
side traces are now used when their entry coordinate matches in Round 2: code 8
follows the 569-frame left-edge trace and code 9 follows the 963-frame right-edge
trace; a code 8 trace at `y=64` follows 371 measured frames, and a code 9 trace
at `y=64` follows 360 measured frames. Round 3's code 7 `y=64`, phase-1
entries use separate left/right traces of 581/384 frames; its code 8 left
`y=64`, phase-0 initializer has a separate 379-frame trace. Other rounds,
phases and entry heights retain the generic measured routes until their
slot-state traces are captured. Round 6 controlled traces additionally cover
code 7 left/right entries at `y=32` and a left entry at `y=64` for 342/453/918
frames respectively, plus true code 8 left `y=32` phase-0/phase-1 entries for
578/447 frames and a code 9 right `y=48`, phase-1 entry for 776 frames.
Those route samples remain scoped to Round 6 and their matching entry
coordinates.
On defeat, `$CD4E-$CDAA` converts an event's `0x80` flag into dispatch `0x4e`.
If `$90/$94/$98/$9c` show no special-gun ammunition, it increments that to `0x4f`;
the `$E192` conversion table then maps them to Bullet (`0x29`) and Money
(`0x24`) pickups respectively. Smart Bomb inventory is not part of this stock
test; unflagged ROM enemies produce no random drop.
After a lethal hit, the original enemy slot remains active in dispatch `0x41`
for five frames before release; a flagged drop is allocated in a separate enemy
slot during that death animation. The web runtime keeps the defeated enemy
non-colliding for the same five-frame window so pool pressure and slot reuse
match the ROM. Its measured screen-Y offsets are `0/-4/-7/-10/-12` NES pixels.
Barrel contents use the same `$CD70-$CD91` allocator, so both
barrel pickups and enemy drops continue to count against the seven-slot enemy
pool until collected or released. Their screen Y advances at one NES pixel
every three frames; world movement also includes the camera scroll, so runtime
uses the same doubled world speed as decoded barrels.
When all seven ordinary enemy slots are occupied, the allocator skips the
conversion; the runtime applies the same capacity check before creating either
kind of ROM-tagged drop.
The same defeat path calls `$E297`, which maps the initial dispatch through
`$E335` and the BCD increment table at `$E2E9`; the resulting ordinary enemy
score values are 100 (Gunman/Sniper/Bomber/Firebreather), 200
(Ninja/Rifleman/Hatchet), 300 (Shotgunner), and 400 (Backstabber/Spear).
The initializer at `$C796` writes its fourth value into enemy field `$0460`.
Player-projectile collision at `$CCCB-$CCCE` subtracts projectile damage from
that field, so it is the entity's hit-point value rather than a Round-wide
difficulty multiplier. The decoded values are 1 for Snipers, Gunmen and
Bombers; 2 for Ninjas and the lower Backstabber form; 3 for Shotgunners,
Riflemen, Hatchet Throwers, Spear Throwers and Firebreathers; 4 for the raid
Backstabber; and 6 for breakable barrels. The runtime now uses these generated
initializer values directly.
The routine updates five score tiles at `$06F2/$06F4/$06F6/$06F8/$06FA`;
`$06FC` remains the fixed zero ones digit, and overflow clamps those five
tiles to `9`, yielding a maximum displayed score of `999990`.
The player-projectile collision path at `$CCBE-$CCC3` skips dispatch `0x3F`, so
Magnum piercing shots cannot destroy Fatman Joe's stationary mines; other
eligible enemy projectiles remain destructible.
Falling-rock records use the ordinary enemy slot range despite rendering as a
moving hazard. Their initializer sets field `$0460` to `5`, and the same
player-projectile collision routine applies bullet damage before the normal
defeat/score path. The runtime therefore keeps rocks in the enemy pool, gives
them five hit points, and excludes them from the Magnum projectile-clearing
shortcut.
An isolated `$B775` Rifleman descends one NES pixel per frame through age 121,
enters its attack state at age 122 only when its screen Y is at least 48 NES
pixels and Billy is within 96 NES Y pixels, then emits five dispatch `0x30` shots at ages
138, 154, 170, 186 and 202. The integer aim selects one of three five-heading
fans centered on sectors `12`, `16`, or `20`, captured when the attack state
starts; each bullet uses the second-tier
direction table at about two NES pixels per frame. It returns to its movement state at age 212,
retreats toward the top edge, and releases after roughly 364 frames. The runtime
preserves this measured vertical path, volley cadence, actor-relative launch
coordinate and slot lifetime for ROM-tagged Riflemen.
Entity code `15` is a side-entry Rifleman. A right-edge isolation advances 65
NES pixels inward, fires three dispatch `0x30` shots at ages 97, 113 and 129,
then returns to the edge and releases at age 259. Runtime mirrors this path for
the left-edge records instead of applying code `14`'s top-entry five-shot
cycle.
An isolated `$B671` Ninja enters its attack state once Billy is within 64 NES
Y pixels, then emits one dispatch `0x31` Shuriken no earlier than age 103
frames. Its entrance holds the authored lane for 16 frames while descending
to 32 NES pixels, pauses through frame 36, then descends to 126 NES pixels by
frame 83. After the throw it moves diagonally for about 15 frames toward a
player-relative offset before holding position; clean routes release between
281 and 302 frames. Round 4 events `at=47,x=152,phase=0` and
`at=63,x=184,phase=1` have complete 244-frame coordinate traces, including
their second post-throw movement and release transitions. Event
`at=383,x=184,phase=1` and `at=751/1583/3535,x=184,phase=0` take random
no-throw branches and release after 205/202/202/241 frames. Events
`at=815/1071/1199/3727,x=184,phase=0` and `at=1727,x=184,phase=1`
reach the activation range later, throw at frame 116, and release after
258/279/257/228/257 frames. Runtime binds those routes and throw frames to their event indexes
and retains the 303-frame cap for other Ninja entries. ROM-tagged Ninja, Hatchet, Spear, and Firebreather
shots use the same second-tier 32-direction table as Gunmen; side Firebreathers
mask the selected heading to an even sector before allocation.
An isolated `$B8F4` Hatchet Thrower descends to NES `y=40` in 20 frames, pauses
for 20 frames, then patrols with the shared second-tier 32-heading movement
table. Collision probes follow its facing edge; a blocked path starts a 34-frame
curved turn, and turns above/below `y=121` use the routine's two measured heading
sequences. Crossing NES `x=40/216` clears the post-throw lock and permits another
aim-sector `15..17` check. A successful check captures that heading, waits through
the 26-frame throw animation, and emits dispatch `0x32` from the actor coordinate.
Three fixed-player traces released at frames 620, 651 and 713 and produced zero,
one and three Hatchets respectively; the earlier four-route maximum of 1,042
frames remains a safety cap, not a fixed lifetime or attack interval. The web
runtime now drives the same collision, turn, lock, aim and exit states against
the decoded Round collision map. Deterministic replays match all four observed
throw frames and the 713/651-frame releases; the no-throw route releases one
frame later because the web actor does not inherit the ROM slot's stale X
subpixel residue.
An isolated `$BB29` Firebreather spends 32 frames entering at the initializer's
first-tier heading, captures Billy's heading, waits 40 frames, then advances at
the second tier until both axis distances are below 96 NES pixels. A further
20-frame ready wait leads to decisions at frame 156 and every 52 frames after
that. One random-byte branch accepts aim sectors `10..22`, emits dispatch `0x34`
from the actor coordinate with a measured `-1` NES Y-pixel offset, and holds a
39-frame attack animation. The other selects a 24-frame movement action from
the same byte's low bits, player distance and relative X lane. Entity code `21`
enters downward; code `22` uses the mirrored side heading and masks emitted
fireballs to an even direction sector.
Fixed-player top-entry traces disprove the former fixed `156/364/416` schedule:
the center route fired at `260/312/520`, the left route at
`260/312/416/572/832/884`, and the right route at
`156/208/312/364/520/884`. The actor has no 644-frame lifetime; it remains until
collision, defeat, offscreen cleanup, or scene transition. The web runtime uses
the decoded collision probes and action state machine while retaining its own
random stream.
The `$BA51` Spear Thrower uses entity code `19` for a 24-frame top entrance and
code `20` for a 40-frame side entrance. Each combines a five-step movement
profile with the initializer heading; fixed-center traces reach NES `(144,77)`
at top frame 24 and `(184,83)` at side frame 40. Both then repeat a 40-frame
wait and 32-count composite movement action. The first action begins at frames
65/81, and its eighth movement frame is the first attack opportunity at
`72/88`. The current route must be encoded direction `4` or `28`; directions
`12/20` skip the opportunity. The player aim must then fall within `10..23`, is
masked to an even heading, and creates dispatch `0x33` at the actor coordinate.
At action boundaries the routine alternates reversing its route and selecting
a new route from `4/12/20/28`. The random branch writes
`(AC - AD - 1) & 0xff` back to `$AC` (the incoming carry is clear) and uses
bits `0x18` as the encoded direction, making each opportunity 72 frames apart without
making every opportunity a throw.
The fixed-center natural samples fired at top frames `144/216/360` and side
frames `160/232`; their initial random direction skipped frames `72/88`.
Deterministic runtime replays reproduce the entry checkpoints and eligible
`144/288` top and `160/304` side opportunities for a controlled direction
sequence. The former `656/813` lifetime and side shot table were trace-specific,
not ROM timers; actors now remain until defeat, contact, offscreen cleanup, or
scene transition.
The `$B82F` Round 5 Backstabber variant is an ambush actor rather than a
projectile shooter: its X remains fixed, it descends roughly 178 NES pixels, and
its slot is released after 532 frames. The runtime keeps this state
separate from the `$B46E` movement variant.
The `$B46E` Backstabber variant is a mirrored side raid. Left/right traces both
live for 369 frames; during the first 160 frames the actor crosses 174 NES
pixels while following the same measured vertical bends. The runtime
interpolates seven mirrored checkpoints instead of sending it straight upward.
Neither isolated Backstabber routine creates a projectile, so only Gunmen
remain eligible for the runtime's generic field-enemy firing clock.
An early Boss-gate trace identifies Bandit Bill as dispatch `0x88`, variant
`0x56`. His first four-shot volley starts at age 107, repeats every 12 frames,
and the next volley starts 72 frames after the fourth shot. Bandit Bill's
dispatch `0x30` projectiles use the ROM's quantized 32-direction speed table at
the third tier (about 444 world pixels/s on its diagonal) and launch at Boss
offset `(-4,+8)` NES pixels; Round 1 uses these measured
values instead of its former single slow shot.
The Boss initializers set each health bar in field `$0460`: Bandit Bill uses
3, Cutter 2, Devil Hawk 6, Ninja 1, Fatman Joe 12, and the Wingate decoy/real
encounters use 6/12. The web runtime multiplies those values by the measured
bar count instead of applying one global Boss health constant. Each Boss
initializer indexes its four-entry lane table with `AC & 3`. Ninja additionally
restricts that index to the upper, middle, or lower pair when Billy's screen Y
is below 176 or 104. Runtime uses the same byte and Y thresholds for entry and
Ninja re-entry instead of consuming a separate floating random value. The gate traces
place his initial entity at the top edge (`y=0`) and observe
four horizontal entry lanes, NES `x=96/128/160/192`; after 96 frames the actor
reaches approximately `y=64`. The web runtime selects one of those measured
lanes and uses the corresponding downward entry speed. After the opening, the
runtime follows the clean-trace X/Y combat path through frame 3,472. Controlled pulse
fire shows each depleted health bar changing dispatch to hit state `0x8D` for
8 frames and then invulnerable crawl state `0x8C` for 168 frames before
returning to `0x88`. The actor continues from its current coordinate throughout
that 176-frame recovery instead of moving to a fixed off-route position. After
the recorded 3,472-frame route, sparse unhurt samples extend the runtime route
to frame 7,680; the runtime then continues the decoded random direction
segments and four-active/eight-idle gait.
The same controlled full-round trace identifies Round 2's Cutter as dispatch
`0x90`, variant `0x5b`, entering from the top edge (`y=0`). Controlled runs
the four-value initializer table defines NES horizontal entry lanes
`x=88/112/144/168`; one captured lane reaches about
`y=136` after 324 frames. That entry first descends to about `y=142`, holds its
lane through frame 258, then curves 15 pixels left while returning to `y=136`.
The web runtime selects one measured lane and follows this two-axis opening,
then holds the final entry X until its first attack at frame 350 and follows
the recorded X/Y combat route through frame 3,264, including its 136-to-40/99 NES
vertical profile and later return loops. After the recorded 3,264-frame route,
the runtime follows sparse measured samples through frame 12,000, then continues
with the ROM's random direction segments and four-active/eight-idle gait. At frame 350 it creates the paired `0x98/0x99`
boomerangs from Boss-relative offsets `(-3,+3)` and `(+3,+2)` NES pixels,
holding those launch coordinates for the allocation frame and repeating every
256 frames. Both use a 32-direction steering state: initial
headings `14/18` turn toward fixed NES points `(224,176)/(32,176)` by one
heading step every two frames and use the shared third-tier discrete velocity
table. On reaching NES `y=176`, each captures Billy's
position, turns toward it, then recalculates that return heading once. The
runtime uses this measured state machine for every volley rather than a fixed
angular curve.
After clearing only ordinary slots at the next real gate, Round 3 produces
Devil Hawk as dispatch `0x9a`, variant `0x61`, entering from the top edge
(`y=0`). Its initializer table defines NES horizontal entry lanes
`x=88/128/168/208`; the opening holds that lane and reaches approximately `y=96`
after 143 frames, then holds the lane for another 113 frames before the first
lateral jump; the measured path then moves through NES `x=157/137/113/120/131/149/176`
and later returns through `x=136/143/130`. At frame
174 it creates five simultaneous `0xa2` fireballs from the Boss coordinate.
Their 32-direction headings are `12/14/16/18/20`, with the ROM's discrete
velocity table and a 45-frame lifetime. The Boss leaves its opening attack state
even when the aim-sector gate produces no projectile, so vulnerability is tied
to the attempted attack rather than slot allocation. Later position-dependent attacks select
three adjacent headings from Billy's integer aim sector, using a 36-frame
lifetime. The controlled unhurt trace attempts attacks at frames
`174/365/459/722/815`; after that recorded window the routine commonly returns
to a 125-frame interval. The runtime preserves these measured 5/3 fan geometries
and lifetimes. The five-shot branch accepts aim
sectors 8 through 24 (inclusive), as enforced by the ROM's `$C7E6` check. The
runtime uses compressed X/Y keyframes from the unhurt Boss trace through
combat frame 3,600; interpolation preserves the long recorded route while the
separate attack scheduler remains subject to aim and random gates. After that
window, the runtime uses the ROM's 48-frame action counter, `AE=(AE+AC)&0xff`
movement decisions, discrete `24/48/72/96`-frame segments, short action holds,
vertical action arcs, and screen-boundary correction rather than reflecting a
finite trace. Hold actions emit a three-shot fan after 13 frames and jump
actions emit a five-shot fan after 32 frames; aim-sector checks still gate the
individual fan choice.
The same campaign reaches Round 4 and identifies its Ninja Boss as dispatch
`0xaa`, variant `0x6b`. Bank 3's paired coordinate tables define NES entry lanes
`(112,64)`, `(192,64)`, `(120,144)`, and `(176,128)`. The runtime selects one
pair with a single random index; the low
slot is now isolated for its shuriken attack. The isolated damage trace shows a
90-frame teleport delay followed by a 44-frame entry-smoke window. An unhurt
record also shows natural teleports beginning at frame 339 and again 424 frames
after the subsequent re-entry start; the runtime schedules those transitions at
the same frame boundary in its fixed-step loop, including the re-entry age used
for the hidden window, in addition to health-loss teleports. It selects another valid pair and restarts
the movement path and attack clock on that measured cycle while retaining
procedural smoke visuals. Other Bosses stay
visible through their invulnerability/recovery timers; only Ninja's smoke and
teleport windows hide its sprite and disable actor collision. The runtime also
replays the measured X/Y routes for the initial and post-teleport cycles. Runtime target and
contact checks exclude hidden actors, including Snipers while they are in cover.
The initial route is sampled against the Round 4 record at absolute frames
43/44/95/170 (`x=176/175/163/102`, in NES pixels); frame 44 is the first
visible movement frame and the opening protection boundary. The first re-entry
route is kept as a separate age-zero step path. Its integer-frame samples match
the trace through relative frame 423, including corrected vertical samples
`y=60` at relative frame 80 and `y=90` at relative frame 216; long plateaus
remain flat until the recorded jump frame.
The Ninja remains in its initial smoke state for about 44 frames. Its isolated
attack routine creates a low-slot smoke/prepare entity at frame 140, then emits
four `0x30` shuriken bullets at frame 179; subsequent volleys commonly recur
after 60 frames. The four bullets begin together near Billy at NES offset
`(+6,-34)`, use the four diagonal velocity pairs `(±1.25,±1.5)`, and release
after about 40 frames. Bank 3 `$A093-$A0B2` initializes the prepare slot with a
40-frame timer; `$A23E-$A28F` converts it to a seven-frame controller and
initializes all four shuriken slots together. The runtime preserves that
low-slot lifecycle with a self-generated smoke proxy, plus the player-relative
cross, multi-height combat profile, opening timing and interval. Entry and
teleport smoke artwork remains procedural.
Round 5's gate identifies Fatman Joe as dispatch `0x80`, variant `0x51`. His
initializer selects NES `x=64/104/152/192` at `y=0` and keeps that lane for the
first 170 frames and reaches about `y=112`. A 2,400-frame Boss trace spans NES
`x=88..152`, beyond the runtime's former 54-pixel-wide center clamp; the web
 Boss now uses the full Round 5 road bounds. His attack decision starts at
frame 170 after the entry routine reaches its first 76-frame counter boundary,
then repeats every 76 active frames; each decision uses a
mutating `AC=(AC+AD)&0xff` random byte. Low nibbles `8..15` attempt an attack
inside the downward heading sector; `0..7` select a movement action and pause
the timer. A successful attack creates
one moving `0x86` shell at Boss offset `(-8,+6)` NES pixels. The shell uses the
shared integer direction quantizer, flies for 31 frames, and becomes a
stationary split controller. Beginning four frames later, it emits five `0x3f`
mines at 4-frame intervals with relative offsets
`(-16,+4),(-10,+12),(0,+16),(+10,+12),(+16,+4)`. Each mine remains for about
29 frames and the controller releases at age 61. Runtime preserves this full
shell-to-mine chain. During the random action branch, the ROM's `$B6` decision
counter stops while the short route lasts 53 frames (`b8=16`) or the long route
lasts 122 frames (`b8=40` followed by `b8=32`). Low nibbles `0..1`, or a Boss
screen Y above 72, select the long route; `2..7` select the short route. The
runtime fires the route's follow-up shell at the end of that measured window,
then restarts the 76-frame decision clock. The runtime replays the controlled
attack trace's multi-hop X/Y profile through combat frame 3,600, follows sparse
samples through frame 12,000, then holds the final sampled position in the ROM's
post-route wait state; the attack random gate and follow-up timing use the
decoded ROM state.
Round 6's first Wingate encounter is dispatch `0xa3`, variant `0x65`. Both
encounters select NES `x=64/104/152/192` at `y=0`, hold that lane and reach
approximately `y=98` after 151 frames. Movement uses a repeating four-active,
eight-idle gait. Crossing the NES arena bounds (`x=32..223`, `y=40..97`) starts
a 16-frame reversed-heading arc followed by a second 16-frame arc aimed toward
`(128,64)`; the opening correction completes at frame 185. Normal movement
updates `AE=(AE+AF)&0xff`: its low nibble selects one of 16 encoded headings and
its low two bits select a `24/48/72/96`-frame segment. The runtime executes this
state directly, including stationary headings and repeated boundary correction,
rather than replaying or reflecting a finite coordinate trace.
The initializer leaves slot 14's coordinate low bytes intact; the controlled
decoy/real snapshots retain X/Y fractions `252/157` and `66/189`, respectively.
Runtime seeds those measured fractions because they can change a correction
aim sector at an integer boundary.
The first encounter clears both ordinary and low-slot projectile actors before
entering a 264-frame empty interval. The real Wingate
then reuses dispatch `0xa3`, variant `0x65` and the same 151-frame vertical
opening and the same movement state. `$BA=1` distinguishes this second encounter
rather than selecting a fixed X lane. The runtime preserves the delay and a
fresh lane selection.
Both encounters begin attack checks with the same gait; the first decoy check
is frame 4, and boundary correction pauses the cadence. Each active check
updates `AC=(AC+AD)&0xff` and requires its low two bits to be nonzero, plus
Billy inside the downward heading
sector `12..20` before allocating a projectile. This explains skipped checks and the
non-fixed volley lengths and why the first successful real-Wingate trace shot
can occur much later than its first check. Each `0x30` bullet begins at Boss
offset `(-8,+6)` NES pixels, uses the routine's quantized 32-direction aim, and
releases after about 64 frames. Runtime applies this shared state rule instead
of the former fixed six-shot/three-shot sequences.

Regular Boss defeats keep a brief 30-frame explosion state for visual feedback.
The real Wingate instead enters dispatch `0xa6` for nine frames and then the
non-colliding `0xa7` controller for 752 frames; it releases and advances the
Round index 761 frames after the lethal transition. Runtime holds the ending
screen for that measured sequence, and neither state adds another reward. The
ending script ignores Start through frame 4,124 after Boss release; frame 4,125
is the first accepted Start and resets the Round to the title path, so the web
ending action uses the same lockout. APU output remains active through that
sequence and settles with the final screen; the recreation uses an original
square-wave ending cue for the same interval rather than extracting ROM music.

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

All core behavior entries in the table above have an identified runtime
mapping. The runtime still stores each original routine and entity code so
long-tail random branches can be compared without changing the mapped types.
The web runtime advances a ROM-shaped `$AC-$AF` random register once per NES
frame. `$FF08` derives one initial carry from the bit-1 XOR of `$AC/$AD`, ripples
that carry through four chained rotates, then increments `$AC`. Same-frame AI
branches mutate individual bytes in place. The runtime seeds the register at
new-game initialization and keeps it across Round transitions, loops, and
Continue.

The one supply-shop record per Round carries entity flag `0x40`; its decoded
NES X positions are `[200,64,216,216,72,216]`. Unflagged weapon-shop counts are
`[1,1,2,1,1,2]`, matching the extra weapon visits in Rounds 3 and 6. The web
runtime preserves their exact script order, coordinates, flags, and enemy-pool
identity.

Round 2's free Horse near the left cactus is a loop-only branch rather than a
record in the first-pass `$8c00` object stream. The runtime emits that
self-generated breakable barrel only when the Wanted gate has caused a Round
loop, at the authored world position `(310,300)`.

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
Adding `--attack` pulses A+B, follows the Boss's X coordinate and records raw
zero-page observations through a 2,400-frame Boss window; `--boss-frames=N`
overrides either window.
Adding `--clear-field --boss-frames=420` clears field actors and records each
retained Boss projectile position for velocity comparison.
Passing an ignored JSNES save with `--state=.rom-traces/round3-boss-state.json`
starts directly at that Boss entrance. In snapshot mode the tracer also records
the six low Boss-weapon slots, whose dispatch values can be outside the ordinary
projectile range; for example Devil Hawk's five `0xA2` fireballs appear there.
`--record` captures every Boss frame without injecting fire input or Boss damage,
including the CPU PC and complete Boss parallel-array fields;
`--attack` remains the controlled player-fire variant.
`--follow-y` keeps Billy 64 NES pixels below the Boss during `--attack`, which
allows repeatable hit-point traces for large vertical routes such as Fatman
Joe. `--clear-field` preserves player projectile slots while clearing unrelated
actors and enemy weapons, so controlled shots can still reach the Boss.
`--weapon=magnum` selects the ROM Magnum weapon code and supplies stock for a
controlled three-point damage trace; the default is Pistol.
The output is an ignored observation artifact under `.rom-traces/`; it is not
runtime game data or copied ROM code.

`npm run trace:rom:entity -- --dispatch=0x57 --trace-frames=600` locks onto the
first naturally initialized ordinary enemy with that dispatch, clears the other
seven-slot actors, and records every parallel-array field plus the ordinary
projectile pool. `--variant=0x43`, `--state=...`, and fixed `--player-x/--player-y`
values narrow later-Round comparisons without synthesizing an entity state.
`--round=3` accelerates earlier Boss gates with automated player fire and Boss
health clamped to one before searching that Round, so the target actor still
comes from its authored event and initializer state.
`--skip=1` ignores the first matching initialization, which separates authored
forms that share one dispatch and variant without mutating either entity.
`--follow=0x59,0x5b,0x5e` keeps explicitly named non-adjacent continuation
states in the same locked slot; all other dispatch changes still terminate the
trace as slot reuse. The output records the final active-state snapshot when a
trace stops, so an omitted continuation is distinguishable from slot release.

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
Entity and recorded Boss traces also include the sampled `$AC-$AF` random bytes
on every frame. Entity frames retain the shared `$B0/$B4/$B5/$BA/$BC` state;
Boss frames additionally retain `$B1` and `$B6-$B9`, so random movement, attack
and correction branches can be replayed without exposing ROM code.
`trace:rom:entity` accepts optional `--match-state`, `--match-heading`,
`--match-x`, and `--match-y` filters. They are applied to the first candidate
slot after the dispatch/variant match, allowing a side-entry signature to be
selected without relying on a global `--skip` count.
With `--list-candidates --isolate-candidates`, the tool clears ordinary enemy
slots before each frame and records every dispatch activation, which is useful
for enumerating side-entry signatures under the ROM's seven-slot limit.
`--start-frame=<frame>` then clears those slots at a chosen absolute frame so a
candidate can be replayed from its actual initializer instead of matching a
later state in the same slot.
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
Round-entry position `(136, 188)`. The web runtime uses that post-collision
coordinate for each Round and loop reset.
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
The additional boulder, tree, and grave rectangles used by the web renderer
are decorative overlays only; their coordinates are not used for movement
collision because they are not decoded ROM collision data.

The movement tables alternate `0.828125/1.65625` NES pixels per frame in the
normal tier, use constant `1.65625` with nonzero Boots stock, and alternate
`1.65625/2.484375` while Horse or Blue Yashichi is active. These average to the
runtime's `1x`, non-stacking `4/3`, and `5/3` movement multipliers respectively.
Diagonal input uses the same 32-direction table: for example right/down moves
`(0.578125,0.703125)` in the first tier and `(1.15625,1.40625)` in the second.
The movement routine clamps Billy's center to NES `x=16..240` and `y=48..216`
before terrain probes. Runtime uses those fixed screen bounds and leaves
Round-specific road, building, and cliff restrictions to the decoded collision
map rather than applying an additional authored road-width clamp.
The player collision pass checks the candidate center plus horizontal edges at
`x-7` and `x+6`; blocked axes retain the updated subpixel byte while keeping
their coarse coordinate. If scrolling advances the map by one NES pixel, the
fallback pass advances the previous coarse Y before its horizontal probe.
Replaying the first 180 Round 1 frames now matches all eight held directions
on every frame, including the upper-right terrain slide.
When the map advances while Billy is at the lower bound, `$C733-$C795` aligns
his X probe and searches outward in 16-pixel columns for the nearest open cell.
The Round 1 right/down replay therefore recovers `(240,216)` to `(216,215)` on
frame 122 before regular input resumes.

OAM projectile traces show straight A+B pistol shots moving 6 pixels per frame,
and single-button two-gun diagonal pairs moving about `(2,-5)` and `(3,-5)`
NES pixels per frame (mirrored on the left). Normal pistol shots persist for
roughly 15 frames. These map
to 811.323 straight, 450.735/676.1025 diagonal world pixels per second and a
15/60.098-second base lifetime in the procedural world.
Enemy projectiles use their ROM movement and screen bounds for cleanup in
addition to any typed fuse or lifetime. Moving projectiles release as soon as
either NES coordinate leaves `0..255`; stationary controllers and hazards keep
their explicit lifecycle. The web runtime first carries projectiles by the
camera delta so their visible velocity remains the ROM velocity in world
coordinates.
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
Gun and `3` for Magnum, matching the runtime damage values. The collision path
subtracts the bullet's `$0460` damage from each target's `$0540` durability;
the bullet damage is not reduced after a hit. A three-point Magnum shot therefore
deals three points to every eligible target it pierces, including ordinary
enemy projectile actors. Boss targets still expose only their current bar's
durability to the runtime so damage cannot spill into the next protected bar.
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
