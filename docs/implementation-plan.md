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
| Ordinary enemy routines | Mostly complete | All core behavior routines are mapped; Ninja and other decoded random paths run typed states, while remaining long-tail branches stay explicit |
| Boss routines | Mostly complete | Measured entrances, attacks, health bars and traced routes are implemented; sparse tails continue from ROM-shaped state |
| Original visual/audio assets | Intentional baseline | Procedural textures and Web Audio are used instead of redistributed commercial assets |

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

1. Capture and bind missing long-tail enemy and Boss traces where they affect
   gameplay decisions, release boundaries, or projectile timing.
2. Replace the remaining visual approximations only when legally usable,
   reproducible source assets or a measured procedural equivalent is available.
3. Keep generic fallback routines and authored landmark parameters documented;
   do not present them as byte-identical ROM behavior.
