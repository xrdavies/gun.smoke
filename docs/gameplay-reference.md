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

If the player reaches the end without the poster, the Round loops to its first
segment with shops and the hidden barrel available again. Once the poster is
owned, scrolling stops at the Boss arena.

The web build also models the resource loop with money pickups, round-specific
trading-post checkpoints, Shotgun, Machine Gun, Magnum, finite ammunition,
Smart Bomb inventory, Wanted poster purchases and Horse upgrades. Weapon costs,
enemy placement, terrain art, audio and exact frame timing are intentionally
parameters rather than claims of byte-identical reproduction.

The Horse is a three-hit shield rather than a speed bonus. Score awards an
extra life at 30,000, again at 100,000, and at each later 100,000-point
threshold.

Shop funds now use the NES point scale: Money Bags are 200 points and the
verified Wanted poster prices are 20,000 (Round 1), 24,000 (Round 2), and
50,000 from Round 3 onward. Weapon and utility prices remain explicit tuning
parameters until a reliable shop-table decode is confirmed.

Barrels can reveal the NES item set: stored Boots and Rifle power-ups, special
weapon ammo, money, POW, Cattle Skull, Horse, and Blue/Red Yashichi. Stored
Boots/Rifle are capped at five and each loses one stock on death; Blue Yashichi
grants contact damage and temporary invulnerability, while Magnum bullets can
destroy enemy projectiles.

Rifle range applies only to the unlimited pistols. Bullet pickups use
weapon-specific refill amounts, with Machine Gun receiving more rounds per
pickup than Magnum. Purchased special weapons and their ammo persist
independently; Select opens the inventory to equip any owned weapon, and a
Bullet pickup refills every owned special weapon by its own amount.

The runtime now exercises the engine's animation binding for player/enemy/Boss
sprites, WebGPU `Renderer2D` batches, `AudioManager` buses, `ActionMap` keyboard
and Gamepad input, deterministic seeded randomness, and per-round terrain/road
data.

Boss encounters include phase gating: Bandit Bill alternates a vulnerable
standing window, while Cutter, Devil Hawk and Fatman Joe become vulnerable only
after their opening attack; Cutter's boomerangs also curve in opposite
directions.

Devil Hawk uses a long jump arc, Fatman Joe uses short hops, Wingate rushes
forward, and the Ninja enters a smoke/invulnerability phase and teleports after
each lost health bar.

The procedural enemy roster is data-driven per Round: early town stages include
gunmen, bombers, snipers and back-stabbers; Rocky Pass adds riflemen; Native
Village adds spear throwers and firebreathers; Cliff Valley adds ninjas and
shotgunners; the final rounds return to gunmen, riflemen, bombers and snipers.
Snipers are edge-mounted static shooters that aim once and retreat into their
window/tee-pee cover instead of walking with field enemies. Riflemen advance,
fire a two-shot burst, and retreat toward the top of the playfield.

Round 1 Bomber dynamite has explicit flight, landed, defusable, and delayed
explosion phases. Boss and enemy projectiles are typed separately as bullets,
boomerangs, fireballs, shuriken, or dynamite.

Encounter timing is also represented as four deterministic segments per Round,
with explicit formation shape and interval data; this replaces the earlier
single random cadence and provides a stable target for ROM trace comparison.
Each segment also carries a landmark type (`town`, `rock`, `village`, `cliff`,
`forest`, `cemetery`, or `open`) so side geometry changes with the event script.

Rocky Pass, Cliff Valley, Forest, and Wingate Town also have authored gameplay
blockers rather than decoration-only scenery. Boulder, tree, and grave zones
are tested against the player's world-space position and support axis sliding,
so a diagonal input can follow a narrow path around an obstacle. The blocker
coordinates remain explicit approximation data until each stage has a matching
ROM trace.

Important barrel contents are represented as ordered world events per Round,
so the notable boots, rifle, POW, Yashichi, Skull and Horse sequence is stable;
enemy drops remain a separate randomized supplement.

After the second Wingate encounter the web recreation enters a separate ending
and credits state instead of treating the win as Game Over.

Each Round begins with a Wanted briefing for its named Boss. Later-Round
briefings pause the engine loop until the player rides out, matching the
separation between wanted screen and active gameplay in the verified ROM trace.

The programmatic mode also supports pausing through the engine's
`Engine.pause()`/`resume()` lifecycle, with `P`, `Escape`, and a visible Resume
control.

Controls follow the NES table: Z/B fires left, X/A fires right, holding both
fires straight ahead, Start pauses, and Select (Shift/Tab or Gamepad Select)
opens the inventory/ammo screen. Overlay exits restore focus to the engine
canvas so keyboard control continues after DOM interaction.

## Known Approximation Boundary

- The repository does not contain extracted ROM graphics, music, or Capcom
  source code.
- Procedural textures stand in for the original sprite and terrain sets.
- Boss attack patterns are recognizable gameplay approximations, not a claim
  that every projectile trajectory matches the reference ROM.
- Exact parity work requires recording the same ROM revision at a fixed frame
  rate and comparing captured input/state traces.
