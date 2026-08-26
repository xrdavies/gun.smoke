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
Smart Bomb inventory, Wanted poster purchases and Horse upgrades. NES shop
prices and capacities are applied: Shotgun 6,000/120 shots, Machine Gun
10,000/400 shots, Magnum 20,000/100 shots, four Bullet refills for 1,500,
Smart Bomb 8,000, and Horse 20,000. Enemy placement, terrain art, audio and
exact frame timing are intentionally parameters rather than claims of
byte-identical reproduction.

Weapon and supply shops are separate checkpoints: the first shop in each Round
is a weapon shop, later supply shops sell Horse, Bullet refills, Smart Bombs,
and Wanted posters, and Rounds 3 and 6 receive a later weapon-shop revisit.

The Horse is a three-hit shield rather than a speed bonus. Score awards an
extra life at 30,000, again at 100,000, and at each later 100,000-point
threshold.

Shop funds now use the NES point scale: Money Bags are 200 points and the
Wanted poster prices are 20,000 (Round 1), 24,000 (Round 2), 50,000 (Round 3),
40,000 (Rounds 4 and 5), and 60,000 (Round 6).
The matching Boss rewards are 10,000, 12,000, 25,000, 20,000, 20,000, and
30,000 points respectively. Round 6 grants its 30,000 only after the real,
second Wingate; the decoy encounter does not duplicate the bounty.

Barrels can reveal the NES item set: stored Boots and Rifle power-ups, special
weapon ammo, money, POW, Cattle Skull, Horse, and Blue/Red Yashichi. Stored
Boots/Rifle are capped at five and each loses one stock on death; Blue Yashichi
grants contact damage and temporary invulnerability, while Magnum bullets can
destroy enemy projectiles. Smart Bomb is armed from the inventory and triggers
on a lethal hit, clearing regular enemies and enemy bullets while consuming
one bomb; it does not damage bosses.

Rifle range applies only to the unlimited pistols. Bullet pickups use
weapon-specific refill amounts, with Machine Gun receiving more rounds per
pickup than Magnum. Stored special weapons and their ammo persist
independently, while the equipped special weapon is lost on an unshielded
death; Select opens the inventory to equip any owned weapon, and a Bullet
pickup refills every owned special weapon by its own amount.

Shotgun side fire emits one normal diagonal shot and one horizontal shot, and
consumes one round per trigger. Magnum bullets use their own projectile state,
travel at 75% of the base speed for 0.8 seconds with a larger collision body,
and can pierce multiple enemies without depending on which weapon is selected
after the shot was fired. The Magnum speed factor remains a calibration
parameter until a ROM projectile trace is captured.

The runtime now exercises the engine's animation binding for player/enemy/Boss
sprites, WebGPU `Renderer2D` batches, `AudioManager` buses, `ActionMap` keyboard
and Gamepad input, deterministic seeded randomness, and per-round terrain/road
data.

Boss encounters include phase gating: Bandit Bill becomes invulnerable and
crawls for a short interval after each lost health bar, while Cutter and Devil
Hawk become vulnerable only after their opening attack. Fatman Joe is
vulnerable before each bomb-gun firing and briefly protected during the launch;
Cutter's boomerangs also curve in opposite directions.

The final Round segment continues spawning regular enemy formations during
each Boss encounter. Boss reinforcements can still drop money or ammunition
when defeated, but the formation scheduler does not create extra ambient
barrels or loose pickups inside the locked arena.

Devil Hawk uses a long jump arc and fires a five-shot or side-aimed three-shot
fireball fan, Fatman Joe uses short hops and a delayed dynamite bomb gun,
Wingate rushes forward, and the Ninja enters a smoke/invulnerability phase and
teleports after each lost health bar.

The procedural enemy roster is data-driven per Round: early town stages include
gunmen, bombers, snipers, back-stabbers and later Shotgunners; Rocky Pass adds
riflemen; Native Village adds spear throwers, firebreathers and Hatchet
Throwers; Cliff Valley adds ninjas and shotgunners; the final rounds return to
gunmen, riflemen, bombers and snipers.
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
ROM trace. Forest segments additionally alternate blue water with brown bridge
crossings to match the Round 5 traversal cue; water remains passable in this
first approximation, while trees are the blocking geometry. Cemetery segments
also draw grouped center gravestones between the side buildings.

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

Automatic map scroll now carries Billy's world-space Y coordinate by the same
delta, keeping his screen position stable while idle. Eight-direction movement
then ranges across nearly the full visible height; horizontal bounds remain
terrain-specific so buildings and cliff edges retain their gameplay role.

## Known Approximation Boundary

- The repository does not contain extracted ROM graphics, music, or Capcom
  source code.
- Procedural textures stand in for the original sprite and terrain sets.
- Boss attack patterns are recognizable gameplay approximations, not a claim
  that every projectile trajectory matches the reference ROM.
- Exact parity work requires recording the same ROM revision at a fixed frame
  rate and comparing captured input/state traces.
