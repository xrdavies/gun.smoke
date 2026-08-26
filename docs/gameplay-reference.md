# NES Gameplay Baseline

This is the current behavior target for the web recreation. The round and Boss
names are cross-checked against the public NES walkthrough on
[StrategyWiki](https://strategywiki.org/wiki/Gun.Smoke_(NES)/Rounds_1_-_6).

| Round | Terrain cue | Boss | Current web status |
| --- | --- | --- | --- |
| 1 | Hicksville / western road | Bandit Bill | gate, poster, shop, measured entrance and volley |
| 2 | Rocky pass / cliffs | Cutter | gate, poster, shop, measured entrance, attack approximation |
| 3 | Native village | Devil Hawk | gate, poster, shop, measured entrance and opening fan |
| 4 | Cliff valley | Ninja | gate, poster, shop, measured entrance and shuriken volley |
| 5 | Forest / bridges | Fatman Joe | gate, poster, shop, measured entrance, attack approximation |
| 6 | Wingate town / cemetery | Wingate (two encounters) | gate, poster, shop, measured first entrance, two-phase approximation |

The NES version's stage rule is important: the wanted poster for the round's
outlaw must be collected before the boss gate can resolve. The web build keeps
that gate in the gameplay state machine and sells the poster through the
Round's decoded supply-shop encounter.

If the player reaches the end without the poster, the Round loops to its first
segment with its shop encounters available again. Once the poster is
owned, scrolling stops at the Boss arena.
Boss gates, shop-trigger records, and loop points now use the six values
decoded from the ROM's `$8C00` Round scripts rather than one shared stage
length; positions are scaled from NES pixels into the procedural world's
540-pixel viewport.
Round 2 also adds its free Horse barrel near the left cactus only after such a
loop; it is not present on the first pass.
On the first pass, its right Skull, hidden Blue Yashichi, right Red Yashichi,
left Skull/Wanted area, and final POW remain ordered after the first weapon
shop as described by the NES walkthrough.
Round 3 similarly orders the left POW, right Red Yashichi/Skull pair and left
Blue Yashichi after its first shop; its lone left Skull marks the later hidden
Wanted area before the closing Skull/Red/Skull barrels.
Round 4 places its first Blue Yashichi after the first shop, the crevice Blue
after the second shop, then two Red Yashichi barrels and the final
Skull/POW/Skull group immediately before the left-side Wanted spot.
Round 5 places its tree-side Blue and dock-side Red between the two shops, then
the left POW and closing Skull group before the Wanted spot to their right.
Round 6 orders its lone POW after the first weapon shop, the grave-group Blue
before the supply shop, the later weapon revisit, then the left Red barrel and
final grave-group Wanted area.

The web build also models the resource loop with Money Bag pickups, ROM-driven
trading-post encounters, Shotgun, Machine Gun, Magnum, finite ammunition,
Smart Bomb inventory, Wanted poster purchases and Horse upgrades. NES shop
prices and capacities are applied: Shotgun 6,000/120 shots, Machine Gun
10,000/400 shots, Magnum 20,000/100 shots, four Bullet refills for 1,500,
Smart Bomb 8,000, and Horse 20,000. Enemy placement, terrain art, audio and
exact frame timing are intentionally parameters rather than claims of
byte-identical reproduction.

Weapon and supply shops are separate roadside encounters rather than automatic
dialogs. A shopkeeper descends at each decoded dispatch `30/31` event and
freezes the action only when Billy walks up; riding past skips that shop. The
first shop in each Round sells the three special guns and Smart Bomb, the
flagged supply shop sells Horse, Bullet refills, and Wanted posters, and Rounds
3 and 6 receive a later weapon-shop revisit.

The Horse is a three-hit shield rather than a speed bonus. Score awards an
extra life at 30,000, again at 100,000, and at each later 100,000-point
threshold.

Shop funds now use the NES point scale: Money Bags are 200 points and the
Wanted poster prices are 20,000 (Round 1), 24,000 (Round 2), 50,000 (Round 3),
40,000 (Rounds 4 and 5), and 60,000 (Round 6).
The matching Boss rewards are 10,000, 12,000, 25,000, 20,000, 20,000, and
30,000 points respectively. Round 6 grants its 30,000 only after the real,
second Wingate; the decoy encounter does not duplicate the bounty.

Score and shop funds are the same NES value rather than separate counters.
Buying an item subtracts directly from the score shown in the HUD; the next
extra-life threshold remains monotonic, so spending cannot award a threshold
twice.

Barrels can reveal the NES item set: stored Boots and Rifle power-ups, special
weapon ammo, money, POW, Cattle Skull, Horse, and Blue/Red Yashichi. Stored
Boots/Rifle are capped at four and each loses one stock on death; Blue Yashichi
grants contact damage and temporary invulnerability, while Magnum bullets can
destroy enemy projectiles. POW clears regular enemies and their projectiles but
does not damage the low-slot Boss actor or clear object-pool falling rocks.
Smart Bomb is armed from the inventory and triggers
on a lethal hit, clearing regular enemies and enemy bullets while consuming
one bomb; it does not damage bosses. Arming it selects the unlimited Pistol,
and equipping another weapon disarms the bomb without consuming it. Only one
Smart Bomb can be owned at a time.

Rifle increases unlimited Pistol bullet speed without extending lifetime. Bullet pickups use
weapon-specific refill amounts, with Machine Gun receiving more rounds per
pickup than Magnum. Stored special weapons and their ammo persist
independently, while the equipped special weapon is lost on an unshielded
death; Select opens the inventory to equip any owned weapon, and a Bullet
pickup refills every owned special weapon by its own amount.

Shotgun fire emits five projectiles and consumes one round per trigger. A
single-side shot spans straight ahead through horizontal fire on that side;
A+B emits a symmetric five-way forward fan. Magnum bullets use their own
projectile state, travel at the measured base Pistol speed for 34 NES frames
with a larger
collision body, and can pierce multiple enemies without depending on which
weapon is selected after the shot was fired. Pistol, Shotgun, and Magnum require
fresh button presses; only Machine Gun repeats while fire is held. Their traced
minimum trigger intervals are 4, 12, 5, and 4 NES frames respectively.

The runtime now exercises the engine's animation binding for player/enemy/Boss
sprites, WebGPU `Renderer2D` batches, `AudioManager` buses, `ActionMap` keyboard
and Gamepad input, deterministic seeded randomness, and per-round terrain/road
data. Destroying or replacing the procedural runtime also releases its raw
GPU textures, so switching into Reference ROM mode does not retain old round
assets.

Boss encounters include phase gating: Bandit Bill becomes invulnerable and
crawls for a short interval after each lost health bar, while Cutter and Devil
Hawk become vulnerable only after their opening attack. Fatman Joe is
vulnerable before each bomb-gun firing and briefly protected during the launch;
Cutter's boomerangs also curve in opposite directions.
Cutter enters from the top edge on one of the measured NES X lanes
(`x=88/144/168`) and reaches approximately `y=136` after 324 frames, then
resumes horizontal movement. Its first paired boomerangs appear at frame 350
and repeat every 256 frames at the measured roughly 524 world-pixel/s
projectile speed.

The decoded enemy event stream runs until the Wanted gate; once the poster is
owned and the Boss arena locks, scrolling and regular enemy-event spawning
stop. Boss reinforcements can still drop money or ammunition when defeated,
but the locked arena does not create extra ambient barrels or loose pickups.

Devil Hawk enters from the top on one of the measured NES X lanes
(`x=128/168/208`) before using a long jump arc and firing a five-shot or side-aimed three-shot
fireball fan, while the Ninja enters from measured NES lanes near `x=176/192`
with an initial smoke/invulnerability window,
Fatman Joe enters from NES `x=152` at the top edge before using short hops and a
delayed dynamite bomb gun, while Wingate's two encounters use top-edge NES
lanes `x=152` and `x=192` before a short horizontal rush and slower cruise; the Ninja enters a smoke/invulnerability phase and
teleports after each lost health bar.
Fatman Joe's measured opening volley begins at frame 205, emits five projectiles
and repeats after roughly 131 frames; his multi-hop vertical profile follows
the measured Boss trace while projectile arcs remain procedural.
Ninja's measured first shuriken volley appears at frame 179 with four diagonal
shots and a common 60-frame repeat interval; smoke preparation remains
procedural.

The ROM event stream is data-driven per Round. Its behavior routines currently
map to the recognizable roster of gunmen, bombers, snipers, back-stabbers,
riflemen, ninjas, shotgunners, spear throwers, firebreathers and Hatchet
Throwers; individual routine names remain explicit approximations until their
full state machines are traced.
Snipers are edge-mounted static shooters that aim once and retreat into their
window/tee-pee cover instead of walking with field enemies. Riflemen advance,
enter their attack state at 80 NES frames, fire a five-shot vertical volley,
and retreat toward the top of the playfield.

Round 1 Bomber dynamite has explicit flight, landed, defusable, and delayed
explosion phases. Boss and enemy projectiles are typed separately as bullets,
boomerangs, fireballs, shuriken, spears, hatchets, dynamite, or grenades. Spear and
hatchet projectiles also use distinct proportions and rotation behavior rather
than sharing the Ninja shuriken representation. Fatman Joe's grenades share the
delayed explosion physics but cannot be defused like Bomber dynamite.

Landmark timing remains represented as four deterministic segments per Round,
with explicit formation metadata and a landmark type (`town`, `rock`, `village`,
`cliff`, `forest`, `cemetery`, or `open`) so side geometry changes with the ROM
event script. Enemy timing itself comes from the decoded event stream.

The six decoded ROM collision rings now provide the base 16-pixel terrain mask
and the geometry for each Round's self-generated map texture.
The player lookup follows the verified `$5A-$5D` map pointer/page/fine-scroll
formula and keeps axis sliding, so diagonal input can follow a blocked edge.
Rocky Pass, Cliff Valley, Forest, and Wingate Town retain their authored
boulder, tree, and grave overlays, while both the visible base geometry and
movement collision come from the decoded ROM mask.
Forest segments additionally overlay blue water and brown bridge crossings to
match the Round 5 traversal cue; traversal remains governed by the decoded ROM
mask. Cemetery segments also draw grouped center gravestones between the side
buildings.

Enemy spawning now consumes decoded Round event records with a verified
behavior routine and preserves the NES enemy/object pool bit. Each runtime
unit retains its behavior, entity code and pool for trace comparison; the
visible type is an explicit procedural approximation until its state machine
is identified. The pools are capped independently at seven enemy slots and
six object slots, matching the ROM allocator. The all-object `$B5BF` Round 4
records are rendered as falling rock hazards with their own object-pool
capacity and player collision, rather than being misclassified as enemies.
Dispatch `0x07` records with verified pickup conversions render as breakable
barrels while unresolved variants remain non-interactive scene proxies. Their
original entity codes and pool selection remain attached for comparison.

Important barrel contents now come directly from the decoded ROM object stream,
so every Boots, Rifle, POW, Money, Yashichi, Skull and Horse barrel uses its
original Round order and NES coordinate without a second authored barrel list.
Breakable objects enter at the top edge and descend with the measured ROM
object speed, keeping the barrel and pickup interaction in the playable area.
Enemy Money Bag and ammunition drops remain randomized.

After the second Wingate encounter the web recreation enters a separate ending
and credits state instead of treating the win as Game Over.
The first Wingate defeat leaves a measured 264-frame pause before the real
Wingate enters from its lower NES lane; the second encounter alone grants the
Round 6 bounty.
The decoy fires six-shot sequential volleys; the real Wingate opens with a
three-shot sequence after a longer delay. Neither phase emits its volley as one
simultaneous fan.

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
