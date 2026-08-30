# Implementation Plan

This project targets a playable NES/FC-oriented Gun.Smoke recreation on top of
`@xrdavies/2d-engine`. The reference ROM is a local, user-supplied research
input; ROM bytes, extracted artwork, and Capcom source are not distributed.

## Scope

- Keep the six-round 2D game and its WebGPU runtime as the current target.
- Treat DOM screens as the current shell; engine UI widgets are a later
  extension, not part of gameplay parity work.
- Keep 3D out of the current target. A future 3D renderer may be added behind
  the engine boundary after the 2D contract is stable.
- Prefer measured ROM behavior, then decoded ROM data, then explicitly labeled
  approximations when no trace or asset evidence exists.

## Status

| Area | Status | Evidence or boundary |
| --- | --- | --- |
| Engine integration | Complete | WebGPU renderer, animation bindings, audio buses, input actions, deterministic clock/randomness; Gun.Smoke pins engine `v0.1.3` |
| Six-round game loop | Complete | Title, intro, briefing, scrolling rounds, shops, wanted gates, bosses, ending and continue flow |
| Collision and map data | Complete for decoded data | Six ROM collision rings drive movement and generated terrain; visual landmark art remains original |
| ROM event scheduler | Complete for extracted scripts | Per-round enemy/object streams, Boss reinforcement tables, frame/random gates, map phases, independent seven/six-slot pools and slot fine coordinates |
| Resources and combat | Complete for modeled rules | Weapons, ammo, score, drops, shops, Smart Bomb, Horse, damage and death state |
| Ordinary enemy routines | Mostly complete | All core behavior routines are mapped; every Round 4 Ninja script record has a state-qualified trace or decoded-state fallback, while other long-tail random branches stay explicit |
| Boss routines | Mostly complete | Measured entrances, attacks, health bars and long ROM X/Y traces are implemented for Bandit Bill, Cutter, Devil Hawk and Fatman Joe; remaining tails continue from ROM-shaped state |
| Original visual/audio assets | Intentional baseline | Procedural textures and Web Audio are used instead of redistributed commercial assets |

Recent evidence-backed parity passes closed the full Round 4 Ninja script set,
enemy/object slot attribution, discrete Backstabber and scripted-object descent,
all-or-nothing player volleys and final-ammo weapon fallback, Bandit/Fatman
entry vulnerability and first-shot timing, same-slot object conversion/pickup
descent, and browser coverage for every distinct Boss projectile chain and pool
owner. Decoded edge-entry X coordinates are retained instead of clamping actors
into the playable center range. A further Round 2 Gunman pass fixed the shared 8-bit orbit-counter wrap
and now matches the full 483-frame code-8 and 873-frame mirrored code-9 routes
through natural release. Fatman Joe now remains protected after his 170-frame
entrance until the first shell launch succeeds, matching the ROM's attack-gated
vulnerability. Round 6 right-side code-7 `y=64` now uses that shared
state machine instead of the available left-only trace, and the verified Round
4 `at=1503/1695/1727/1743/2527` routes use their measured 356/360/345/360/630-frame state-machine paths.
All decoded bottom-entry Gunmen (entity code `5`) now use the shared B284
fixed-point state machine: the common `Y=249` to `Y=218` entry is preserved
before chase/orbit movement, while event-specific shot traces remain layered on
top when available.
Top-entry Gunmen (entity code `6`) now follow the same shared B284 state machine
across all decoded events. The only retained generic path is the isolated Round
6 `at=3263` candidate, which is never naturally allocated by the seven-slot
enemy pool and therefore has no lifecycle evidence.
Bottom Gunman contact now owns a measured 60-frame dispatch-`0x41` retreat
before slot release, so the enemy no longer continues its normal route after a
player collision; Horse protection uses the same state.
Round 5 `at=1135` now uses its separate 1,107-frame fixed-point trace through
the observed slot-reuse boundary.
Round 5 `at=1711` now uses its separate 285-frame fixed-point trace.
Round 5 `at=1759` now uses the shared state machine through its 312-frame route.
Actor terrain probes now preserve `$C8F8`'s `0xC0` definition mask separately
from the player's bit-6 mask, including Round 5's actor-only blocking cells.
Bomber movement now uses that same actor probe instead of the player's mask.
Collision scroll discretization also preserves exact event-row boundaries
despite binary floating-point conversion.
Gunman movement now releases on upward screen-Y underflow before scroll drift,
matching the ROM's top-edge slot cleanup.
That mask lets Round 5 `at=1903` use the shared Gunman state machine with exact
coarse/fine parity through all 1,488 frames and its natural release.
Round 5 `at=1999` now uses the shared state machine through its 393-frame
later-loop route and right-edge release.
Round 5 `at=2735` also uses the shared state machine through its complete
283-frame route.
Round 6 `at=2207` now replaces its generic code-8 coordinate path with the
shared state machine verified across all 648 controlled frames.
Round 6 `at=159` replaces its 447-frame integer trace with the exact 450-frame
state-machine route and preserved slot fractions.
Round 6 `at=2783` likewise replaces its generic code-9 path with the shared
state machine verified across all 960 controlled frames.
Round 6 `at=3919` preserves its event-specific allocation-frame X and then
uses the shared state machine across all 1,419 controlled frames.
Round 6 `at=4543` also uses the shared state machine through its complete
303-frame route.
Round 6 `at=2991` binds its separate 1,055-frame fixed-point code-8 route
through the observed slot-reuse boundary.
Round 6 `at=2943` now uses the shared state machine through its complete
1,350-frame route and event-specific frame-655 attack check.
Round 6 `at=3023` independently uses that state machine through its complete
1,215-frame no-shot route and left-edge release.
Round 6 `at=3055` now hands its bottom-entry code-5 actor to the shared state
machine after frame 48 and preserves the complete 1,429-frame route.
Round 6 `at=3295` now uses its downward top-entry state and shared chase/orbit
routine through the complete 745-frame left-boundary route.
Round 6 `at=3327` routes its naturally allocated bottom Gunman through the
shared state machine to its measured frame-273 contact boundary.
Round 6 `at=3487` now uses the shared top-entry state machine through its
complete 306-frame bottom-boundary route.
Round 6 `at=3551` independently uses that state machine through its complete
524-frame route and five measured attack checks.
Round 6 `at=3711` also uses the shared top-entry state machine through its
complete 287-frame left-boundary route.
Round 6 `at=3727` now uses the shared flank state machine through its complete
1,005-frame route and explicit paused attack opportunities.
Round 6 `at=4415` now preserves its spawned fine coordinates, uses the shared
top-entry chase/orbit state machine through its complete 603-frame route, and
keeps its measured 13/397 attack opportunities.
Round 6 `at=4479` likewise uses the shared top-entry route through its complete
315-frame bottom-boundary path and measured frame-29 attack opportunity.
Round 6 `at=4511` now distinguishes its same-frame `x=152` and `x=168` top
entries, preserving their fine coordinates and measured frame-63/frame-13
attack opportunities through the observed contact handoffs.
Round 6 `at=4623` now distinguishes its top `x=88` and bottom `x=168` entries,
preserving their shared routes and measured frame-69/no-shot opportunities.
Round 6 `at=4639` now distinguishes its top `x=144` and bottom `x=112` entries,
preserving their shared routes and measured frame-13/frame-193 opportunities.
Round 6 `at=4751` and `at=4783` now use their measured bottom/top shared routes,
release boundaries, and no-shot/frame-22 attack behavior.
Round 6 `at=815` now uses its complete bottom-entry and chase/orbit route,
including the measured frame-187 attack and NES `Y=255` release.
Round 6 `at=831` now uses its complete 150-frame no-shot bottom route and
measured `Y=252` release boundary.
Round 6 `at=1007` and `at=1023` now use their separate bottom routes, preserving
the frame-58 contact handoff and frame-65/150 shot/release behavior.
Round 6 `at=1167` now preserves its bottom-entry route through the measured
frame-34 player-contact dispatch.
Round 6 `at=1231` now preserves both same-time bottom allocations and their
frame-34/frame-68 player-contact boundaries with no successful shots.
Round 6 `at=1375` now uses the shared code-8 flank route through its 564-frame
upper-boundary release and measured 45/109/173/237 attack opportunities.
The same-time Round 6 `at=1375` bottom code-5 entry now preserves its frame-58
player-contact boundary and no-shot behavior.
Round 6 `at=1535` now preserves both bottom allocations, their frame-34/390
contact and release boundaries, and no-shot behavior.
Round 6 `at=1407` now uses its complete top-entry route through the left-boundary
release and measured frame-55/frame-443 attacks.
Round 6 `at=1391` now uses its complete 387-frame top-entry route and measured
frame-75 attack opportunity.
Round 6 `at=1455` now uses its complete 399-frame top-entry route and measured
frame-63 attack opportunity.
Round 6 `at=1279` now preserves its bottom contact route and top 1,146-frame
route with measured 19/403/659 attack opportunities.
Round 6 `at=1311` now preserves its bottom-entry player-contact boundary and
no-shot behavior.
Round 6 `at=863` now uses its complete 432-frame top-entry route, including the
measured frame-66 attack and bottom `Y=252` release.
Round 6 `at=943` now uses its shared top-entry route through the measured
frame-489 player-contact handoff and explicit frame-76/frame-268 attacks.
Round 6 `at=975` and `at=991` now use their complete top-entry routes with
measured `33/481` and `13` attack opportunities and `Y=253`/`Y=252` releases.
Round 6 `at=4911/4975/5087/5103` now use their complete shared top-entry routes,
release boundaries, and measured 47/21/13/32 attack opportunities.
Round 6 `at=5119` now preserves its allocation-frame X and follows the shared
code-8 state machine through its complete 776-frame no-shot route.
Round 6 `at=4319` now uses the shared bottom-entry and chase/orbit state machine
through its complete 392-frame no-shot route and NES `Y=255` release boundary.
Round 6 `at=4575`, `at=4623`, and `at=4639` now preserve their separate bottom
routes, release boundaries, and measured `158`/none/`193` attack opportunities.
Round 6 `at=47/63/239` now routes its naturally allocated opening top Gunmen
through the shared fixed-point state machine with measured frame-24/29/36
attacks and their observed dispatch or upper-boundary endings.
The isolated Round 6 `at=367,x=200` top route now covers 616 frames with
frame-51/371 attacks and a bottom-boundary release; its event binding is kept
separate because natural pool pressure normally skips the allocation.
Round 6 `at=1631/1871/1903` now preserves three later top-entry routes and their
measured frame-48, frame-57/313, and frame-57 attack opportunities through the
observed dispatch handoffs.
The two naturally allocated Round 6 `at=2015` top entries now remain distinct by
spawn X and use their frame-13/frame-37 attacks through separate contact
handoffs. The same-time `at=2207` bottom entries now use their complete
941/920-frame routes, measured 423/615 and 423 attacks, and upper releases.
Round 6 `at=2255/2623/2687/2735` now routes four additional top entries through
the shared state machine, preserving their frame-76/268, 13, 77, and 13 attack
windows through the observed dispatch or contact handoffs.
Event/X-qualified shot tables now preserve the traced windows for the isolated
Round 6 routes at `159`, `2207`, `2783`, `2943`, `2991`, `3295`, `3487`,
`3551`, `3711`, `3919`, and `4543`; no-shot routes at `3055` and `4319` stay
explicitly empty.
The opening bottom entries `at=175/191/447/479/559/847` now use the shared
state machine with their measured no-shot or frame-61/frame-191 attacks and
screen-boundary releases. `at=2287` and `at=2447` add top routes with
frame-39/487 and frame-13/397/717 attacks; `at=2751` and `at=2879` preserve
their five-shot and no-shot bottom-boundary paths. `at=3215` and `at=4335`
also preserve their left/bottom releases. The `at=4063` and `at=2959` center
bottom entries both enter player-contact dispatch before the 48-frame handoff,
so they remain on the explicit contact path.
Round 6 side Gunmen `at=207` and `at=607` now use the shared flank state up to
their measured lunge dispatches, with attacks at 79/143/207 and 75/139. The
`at=511` code-9 route preserves its allocation-frame `x+1` correction and
54/118/182 attacks. The paired `at=1135` code-7 entries now use shared
left/right flank state with 64 and 80/400 attack windows. The isolated
`at=2143,x=4` phase-one code-8 entry now uses the shared state through its
frame-247 dispatch handoff, including the frame-64 attack and allocation-frame
`x-1` correction. `at=4223` now uses the shared state through its frame-247
dispatch handoff with attacks at 66/130/194. The isolated `at=1679,x=4,y=64`
code-7 route is also bound to the shared state through its 918-frame
bottom-boundary release and frame-92 attack; no Round 6 scoped Gunman route
remains in this category.
The remaining naturally allocated Round 6 Gunman records are now classified:
`at=4063,x=128` and `at=2959,x=136` enter contact dispatch before handoff,
while the `at=479,x=136` entry does likewise; its same-time `x=168` allocation
uses the separate no-shot dynamic route. This keeps the runtime boundary
explicit instead of extending an unverified route.
Round 5 now also routes its naturally allocated top/bottom Gunmen at
`at=31/47/207/255/511/559/575/623/879/959` through the shared state machine,
preserving their measured attack windows and contact or screen-boundary exits.
The later Round 5 `at=1311` bottom entries now remain distinct by X: `x=32`
uses the shared route through its frame-264 contact dispatch with a frame-225
attack, while `x=88` follows 720 frames to the upper release with a frame-212
attack. The trace tool can persist a matching JSNES state with `--save-state`
so subsequent event captures start at a verified allocation boundary.
Round 5 `at=1535,x=216` and `at=1631,x=152` now use measured top-entry routes
with 13/333 and 33/161 attacks. These additions close the naturally allocated
Round 5 Gunman coverage available from the saved trace chain; only entries
without an isolated lifecycle trace remain candidates for the same
evidence-driven process.
The saved chain now covers the remaining Round 5 code-5/code-6 allocations
through `at=3023`, including the X-qualified `at=1871` pair and all same-time
top groups at `2095/2735/2895/2911/3023`. The only first-loop records left on
their entry path are `at=1871,x=96` and `at=1983,x=96`, both of which enter the
player-contact dispatch at frame 32 before the shared-state handoff.
Round 5's later first-loop top groups through `at=3023` now use the same
fixed-point state machine with event/X-qualified shot windows; same-trigger
groups at `2095/2735/2895/2911/3023` retain independent lifetimes. Round 4
coverage has started with exact shared-state routes for `at=95/127/159/191/207`.
Round 4 opening coverage now extends through `at=223/239/271/287`; each route
retains the ROM's slot fraction, player-input sequence, attack frames and
release/contact boundary rather than sharing the generic top lifetime.
Round 4 bottom coverage now includes `at=1791,x=80`, `at=1823,x=80`, and the
long `at=1855,x=48` route. The first two match 350 frames and release at the
screen boundary with attack frames 64 and 60; the latter matches 1300 frames
with captured player movement windows and attack frames 485/933/1253.
The later top entries `at=2335,x=104`, `at=2479,x=128`, and `at=2511,x=144`
now use state-qualified bindings, covering 486/974/1200 controlled frames
with attack windows 47, 73/137, and 13/77/829/1085 respectively.
Round 4 `at=1871` now distinguishes its same-trigger bottom entries: `x=24`
uses the shared state for 623 frames with a frame-399 attack, while `x=128`
matches through its frame-210 contact dispatch with a frame-164 attack.
The later Round 4 bottom records `at=1951/2111/2143/2319/2431/2591` are now
classified with event/X-qualified bindings and fixed-point tests. The dynamic
traces cover 1000/687/683/375/1080/375 frames respectively, preserving their
independent attack windows and screen-boundary releases; contact-dispatch
variants remain explicitly bounded instead of using the shared route.
The additional Round 4 tail entries `at=2095,x=88` and `at=2191,x=40` now use
the shared state machine through their frame-211/frame-200 contact handoffs,
with frame-154/frame-149 attacks.
The remaining Round 4 `at=1631,x=184` bottom candidate reaches contact
dispatch at frame 58 and is intentionally left on the bounded contact path.
Round 3 `at=1119` replaces its generic code-8 path with the shared state
machine verified across all 282 controlled frames.
Round 3 `at=687` replaces its generic phase-0 code-7 path with the shared state
machine verified across all 330 controlled frames.
Round 3 `at=1711` independently uses the shared state machine through its
complete 311-frame phase-0 route.
Round 3 `at=1647` independently uses the shared state machine through its
complete 312-frame phase-0 route.
Round 3's second-loop `at=319` event uses the shared state machine through its
complete 501-frame route.
Round 3 `at=959` also uses the shared state machine through its complete
302-frame route.
Round 3 `at=255` replaces its integer-only y=64 trace with the shared state
machine, preserving all 581 coarse/fine samples.
Round 3's flagged right-side `at=4255` event also replaces its integer trace
with the shared state machine across all 384 coarse/fine samples.
Round 3 `at=1071` replaces its integer code-8 y=64 trace with the shared state
machine across all 379 coarse/fine samples.
Sniper shots no longer create a false 90-frame hidden/invulnerable window; ROM
evidence shows that 90 is only the firing cooldown.
The Sniper lane/cooldown state machine now replaces fixed shot-frame tables,
including the 61-frame lane adjustment and screen-Y cooldown stop.
Round 3 `at=3775` also uses the shared state machine through its complete
426-frame route.
Round 3 `at=3823` independently uses the shared state machine through its
complete 282-frame phase-0 route.
Round 3's flagged `at=4239` route uses the shared state machine through all 301
frames while preserving its existing drop flag.
Round 3 `at=4831` also uses the shared state machine through its complete
582-frame map-wrap route.
Round 3's same-frame Boss-gate `at=4863` record uses the shared state machine
through its complete 381-frame route.
Top-entry Riflemen now capture their five-shot fan at the ROM attack-state
transition (the first frame meeting the Y/distance gate), rather than
recalculating the aim at the first shot; their first shot is scheduled 16 NES
frames after that transition, for a five-shot sequence. Side-entry and generic
fallback paths remain separate.
Side-entry Riflemen now use the traced `y=32..62` path, frame-80 aim lock and
five-shot 96/112/128/144/160 cadence before their frame-258 release.
Shotgunners now use the traced directional entry paths: top entries move toward
the road center with their 20-frame hold and two volleys, while side entries
preserve the 113-frame fan, correction holds, and frame-230 release.
Both Wingate encounters now preserve the measured frame-185 entry
invulnerability instead of accepting damage from their top-edge spawn.
Devil Hawk's pre-handoff fire now uses the same trace as his movement, including
all irregular action delays and five-/three-shot fan choices through frame 3,630.
Boss fights now keep the ROM's separate reinforcement scheduler: the global
8-bit frame gate and `$AC/$AD` random selection feed each Round's decoded
16-entry `$83BF` table into the existing seven-slot enemy initializer.
Round initialization, looping, and Continue now also clear the runtime's
equivalent frame/input state, reseed its random registers, and restore Billy's
entry state at the same boundary as ROM `$E817-$E85E`.
The Ninja Boss's first smoke controller and four-way shuriken volley now begin
at the refreshed natural trace's frames 124/163 instead of 140/179.
Its first post-teleport smoke/volley now uses the separate measured 196-frame
re-entry delay, producing the frame-625/664 controller and shuriken timing.
Fatman Joe's moving shell now converts in place to a non-colliding split
controller before its five timed four-frame mine releases. Cutter now keeps
frames 350-379 as one paired boomerang volley and schedules the next allocation
at the measured 256-frame cycle, replacing the previous fixed-slot pair instead
of accumulating extra boomerangs. Wingate defeat
animation duration is stored per encounter so the decoy keeps 30 frames while
the real encounter keeps its nine-frame ending animation.
Boss timer checks now run after the Boss movement update, preserving the ROM's
current-frame launch coordinate before the newly created projectile advances.
Regular Boss completion now holds the measured 765-frame interval from lethal
dispatch to Boss release and the next Round, replacing the former 1.5-second
placeholder.
Ordinary enemy-pool projectiles likewise retain their allocation-frame position
before the shared velocity update begins on the following frame.
Player weapon templates now preserve their per-barrel NES X/Y muzzle offsets
and apply their first velocity step without a second same-frame camera carry.
Player projectiles also use their measured visible lifetimes and NES coordinate
release, preventing offscreen Magnum shots from retaining scarce player slots.
Player projectile hits now use decoded animation and projectile axis half-sizes
for ordinary enemies, barrels, rocks, enemy shots and all six Bosses.
Hostile contact and airborne dynamite defusal now use the separate ROM player
contact bounds, including Horse's vertical eight-pixel expansion.
Animation-1 pickups and shopkeepers use that same decoded contact path.
Boss weapon contact uses animation-specific `(8,8)` or `(6,6)` bounds, with
controller actors explicitly non-colliding.
Bomber dynamite changes from airborne `(6,6)` to landed `(16,16)` contact and
releases without the former authored radial blast.

## Delivery Stages

### Stage 1: Runtime foundation

Keep the engine dependency pinned, render one stable WebGPU frame, bind
animation clips, route keyboard/gamepad input through `ActionMap`, and expose
an audio lifecycle that works in browsers without autoplay violations.

### Stage 2: Playable 2D shell

Implement the title and game modes, fixed-step timing, player movement and
shooting, camera scrolling, generated terrain, collision, HUD, pause, continue,
and deterministic reset behavior.

### Stage 3: ROM-derived world and encounters

Extract the six collision rings and `$8C00` event scripts. Preserve map phases,
event ordering, object semantics, pool limits, slot ownership, drops, shops,
wanted gates and round looping. Keep extracted files ignored and record hashes
and commands in `docs/reference-rom.md`.

### Stage 4: Enemy and projectile parity

Map each behavior routine to a typed state machine. Add measured route traces
only when the trace is tied to a specific round, event, phase, entry coordinate,
and slot state. Every approximation must remain bounded by a screen release,
decoded lifetime, or a documented route handoff.

### Stage 5: Boss parity

Trace entrances, vulnerability windows, health-bar transitions, projectile pool
ownership, attack gates, movement handoffs, and final-round encounter phases.
Use sparse continuation only after the measured state and random register
handoff are recorded.

### Stage 6: Verification and maintenance

For each coherent change, add the smallest deterministic unit assertion or
browser regression that would fail if the behavior regresses. Run unit tests,
type checking, production build, browser tests, `git diff --check`, then create
a focused Conventional Commit and push it to `origin/main`.

## Remaining Work

The remaining parity work is evidence-driven rather than a new subsystem:

1. Capture and bind remaining non-Ninja enemy and Boss tails where they affect
   gameplay decisions, release boundaries, or projectile timing.
2. Replace the remaining visual approximations only when legally usable,
   reproducible source assets or a measured procedural equivalent is available.
3. Keep generic fallback routines and authored landmark parameters documented;
   do not present them as byte-identical ROM behavior.
