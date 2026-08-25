# NES Gameplay Baseline

This is the current behavior target for the web recreation. The round and Boss
names are cross-checked against the public NES walkthrough on
[StrategyWiki](https://strategywiki.org/wiki/Gun.Smoke_(NES)/Rounds_1_-_6).

| Round | Terrain cue | Boss | Current web status |
| --- | --- | --- | --- |
| 1 | Hicksville / western road | Bandit Bill | round gate, wanted poster, shop, boss |
| 2 | Rocky pass / cliffs | Cutter | round gate, wanted poster, shop, boss |
| 3 | Native village | Devil Hawk | round gate, wanted poster, shop, boss |
| 4 | Cliff valley | Ninja | round gate, wanted poster, shop, boss |
| 5 | Forest / bridges | Fatman Joe | round gate, wanted poster, shop, boss |
| 6 | Wingate town / cemetery | Wingate (two encounters) | round gate, wanted poster, shop, two-phase boss |

The NES version's stage rule is important: the wanted poster for the round's
outlaw must be collected before the boss gate can resolve. The web build uses
an original procedural barrel prop at a round-specific horizontal position;
shooting the barrel reveals the poster,
and keeps that gate in the gameplay state machine. Later trading posts provide
the alternate purchase route described by the NES walkthrough.

The web build also models the resource loop with money pickups, round-specific
trading-post checkpoints, Shotgun, Machine Gun, Magnum, finite ammunition,
Wanted poster purchases and Horse upgrades. Weapon costs,
enemy placement, terrain art, audio and exact frame timing are intentionally
parameters rather than claims of byte-identical reproduction.

The runtime now exercises the engine's animation binding for player/enemy/Boss
sprites, WebGPU `Renderer2D` batches, `AudioManager` buses, `ActionMap` keyboard
and Gamepad input, deterministic seeded randomness, and per-round terrain/road
data.

Boss encounters include phase gating: Bandit Bill alternates a vulnerable
standing window, while Cutter, Devil Hawk and Fatman Joe become vulnerable only
after their opening attack; Cutter's boomerangs also curve in opposite
directions.

After the second Wingate encounter the web recreation enters a separate ending
and credits state instead of treating the win as Game Over.

## Known Approximation Boundary

- The repository does not contain extracted ROM graphics, music, or Capcom
  source code.
- Procedural textures stand in for the original sprite and terrain sets.
- Boss attack patterns are recognizable gameplay approximations, not a claim
  that every projectile trajectory matches the reference ROM.
- Exact parity work requires recording the same ROM revision at a fixed frame
  rate and comparing captured input/state traces.
