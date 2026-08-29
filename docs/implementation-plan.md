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
| Engine integration | Complete | WebGPU renderer, animation bindings, audio buses, input actions, deterministic clock/randomness |
| Six-round game loop | Complete | Title, intro, briefing, scrolling rounds, shops, wanted gates, bosses, ending and continue flow |
| Collision and map data | Complete for decoded data | Six ROM collision rings drive movement and generated terrain; visual landmark art remains original |
| ROM event scheduler | Complete for extracted scripts | Per-round enemy/object streams, map phases, independent seven/six-slot pools and slot fine coordinates |
| Resources and combat | Complete for modeled rules | Weapons, ammo, score, drops, shops, Smart Bomb, Horse, damage and death state |
| Ordinary enemy routines | Mostly complete | All core behavior routines are mapped; every Round 4 Ninja script record has a state-qualified trace or decoded-state fallback, while other long-tail random branches stay explicit |
| Boss routines | Mostly complete | Measured entrances, attacks, health bars and long ROM X/Y traces are implemented for Bandit Bill, Cutter, Devil Hawk and Fatman Joe; remaining tails continue from ROM-shaped state |
| Original visual/audio assets | Intentional baseline | Procedural textures and Web Audio are used instead of redistributed commercial assets |

Recent evidence-backed parity passes closed the full Round 4 Ninja script set,
enemy/object slot attribution, discrete Backstabber and scripted-object descent,
all-or-nothing player volleys and final-ammo weapon fallback, Bandit/Fatman
entry vulnerability and first-shot timing, same-slot object conversion/pickup
descent, and browser coverage for every distinct Boss projectile chain and pool
owner. A further Round 2 Gunman pass fixed the shared 8-bit orbit-counter wrap
and now matches the full 483-frame code-8 and 873-frame mirrored code-9 routes
through natural release. Round 6 right-side code-7 `y=64` now uses that shared
state machine instead of the available left-only trace, and the verified Round
4 `at=1503/1695/1727/1743/2527` routes use their measured 356/360/345/360/630-frame state-machine paths.
Round 5 `at=1135` now uses its separate 1,107-frame fixed-point trace through
the observed slot-reuse boundary.
Round 5 `at=1711` now uses its separate 285-frame fixed-point trace.
Round 5 `at=1759` now uses the shared state machine through its 312-frame route.
Actor terrain probes now preserve `$C8F8`'s `0xC0` definition mask separately
from the player's bit-6 mask, including Round 5's actor-only blocking cells.
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
frames after that transition. Side-entry and generic fallback paths remain
separate.

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
