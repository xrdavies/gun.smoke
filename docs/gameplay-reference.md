# NES Gameplay Baseline

This is the current behavior target for the web recreation. The round and Boss
names are cross-checked against the public NES walkthrough on
[StrategyWiki](https://strategywiki.org/wiki/Gun.Smoke_(NES)/Rounds_1_-_6).

| Round | Terrain cue | Boss | Current web status |
| --- | --- | --- | --- |
| 1 | Hicksville / western road | Bandit Bill | gate, poster, shop, measured entrance and volley |
| 2 | Rocky pass / cliffs | Cutter | gate, poster, shop, measured entrance and boomerang steering |
| 3 | Native village | Devil Hawk | gate, poster, shop, measured entrance and opening fan |
| 4 | Cliff valley | Ninja | gate, poster, shop, measured entrance and shuriken volley |
| 5 | Forest / bridges | Fatman Joe | gate, poster, shop, measured entrance and shell split |
| 6 | Wingate town / cemetery | Wingate (two encounters) | gate, poster, shop, measured entrances/X/Y movement and attack gates; later random routes remain approximate |

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
Entering either shop clears ordinary enemy projectiles before the menu freezes;
falling-rock actors and the separate Boss weapon pool are not part of that clear.

The Horse is a three-hit shield rather than a speed bonus. A blocked hit removes
the colliding low-dispatch projectile but leaves enemy actors and high-dispatch
hazards active, then grants 60 NES frames of protection. Horse health resets
when advancing to the next Round. The ROM stores five mutable score digits plus a fixed zero
ones digit, so the score caps at 999,990. Extra lives come from the Life pickup
and are capped at five.

An unshielded hit freezes scrolling and actors for a 152-frame death
animation, then deducts the life and clears ordinary enemies/projectiles. Billy
remains hidden for 100 frames and visible but frozen for another 40 before play
resumes. Barrels, scene objects, Boss actors and low-slot Boss weapons survive
the ordinary-enemy clear.
At zero lives, Game Over defaults to Continue. Continuing restarts the current
Round with three lives and retains score, stored Boots/Rifle, unlost special
weapons, ammunition and Smart Bomb stock; Horse, Wanted progress, actors and
map progress reset. Select switches between Continue and End, while Start
confirms; End returns to the title.

Shop funds now use the NES point scale: Money Bags are 200 points and the
Wanted poster prices are 20,000 (Round 1), 24,000 (Round 2), 50,000 (Round 3),
40,000 (Rounds 4 and 5), and 60,000 (Round 6).
The matching Boss rewards are 10,000, 12,000, 25,000, 20,000, 20,000, and
30,000 points respectively. Round 6 grants its 30,000 only after the real,
second Wingate; the decoy encounter does not duplicate the bounty. The reward
is added to the same capped score balance when the Boss defeat branch completes.
The defeated Boss remains as a short animated explosion while both projectile
pools are cleared and the Round transition delay runs.

Score and shop funds are the same NES value rather than separate counters.
Buying an item subtracts directly from the score shown in the HUD.

Barrels can reveal the NES item set: stored Boots and Rifle power-ups, special
weapon ammo, money, POW, Cattle Skull, Horse, and Blue/Red Yashichi. Stored
Boots/Rifle are capped at four and award 1,000 points at cap; Life awards
10,000 points at the five-life cap. Each stored power-up loses one stock on death; Blue Yashichi
grants contact damage and temporary invulnerability, while Magnum bullets can
destroy enemy projectiles. POW clears regular enemies, falling rocks and
ordinary projectiles but does not damage the low-slot Boss actor or clear its
separate projectile pool.
Smart Bomb is armed from the inventory and triggers
on a lethal hit, clearing regular enemies and enemy bullets without awarding
their ordinary defeat score or drops, while consuming one bomb; it does not
damage bosses or grant a follow-up invulnerability window. Arming it selects the unlimited Pistol,
and equipping another weapon disarms the bomb without consuming it. Only one
Smart Bomb can be owned at a time.

Rifle increases unlimited Pistol bullet speed without extending lifetime. Bullet pickups use
weapon-specific refill amounts, with Machine Gun receiving more rounds per
pickup than Magnum. Stored special weapons and their ammo persist
independently, while the equipped special weapon is lost on an unshielded
death; Select opens the inventory to equip any weapon with nonzero stock, and a
Bullet pickup refills every active special weapon by its own amount. A depleted
weapon can be bought again at a weapon shop to restore its full stock, but Bullet
pickups skip it until then.

Shotgun fire emits five projectiles and consumes one round per trigger. A
single-side shot spans straight ahead through horizontal fire on that side;
A+B emits a symmetric five-way forward fan. Pistol, Machine Gun and Magnum fire
two gun barrels for every single-side or A+B trigger; Machine Gun rounds use a
faster measured diagonal/straight velocity set. Magnum bullets use their own
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

Boss encounters include phase gating: after each lost health bar Bandit Bill
spends 8 NES frames in hit stun and 168 frames in an invulnerable crawl without
teleporting away from his current route, while Cutter and Devil
Hawk become vulnerable only after their opening attack. Fatman Joe is
vulnerable before each bomb-gun firing and briefly protected during the launch;
Cutter's boomerangs also curve in opposite directions.
Ninja remains invulnerable during its opening smoke and every teleport/re-entry
window; hidden Boss sprites cannot deal contact damage or be damaged by bullets.
Snipers are likewise non-colliding while inside cover. Bandit Bill and Fatman
Joe remain visible during their recovery/launch protection windows.
Most Boss weapons use a six-slot projectile pool separate from the eight slots
used by ordinary enemy gunfire, so field bullets cannot suppress those attacks;
Bandit Bill's traced `0x30` shots are the exception and use the ordinary pool;
his clean-trace X/Y movement path is replayed through the measured 3,472-frame
combat window.
Ordinary screen clears do not erase active low-slot Boss shots. ROM-tagged
Ninja, Hatchet, Spear, and Firebreather shots use the shared discrete second-tier
direction table; only procedural fallback formations use continuous aim.
Cutter enters from the top edge on one of the ROM's NES X lanes
(`x=88/112/144/168`), descends through a short overshoot, and curves 15 NES pixels
left to approximately `y=136` after 324 frames, holds that lane until frame 350,
then follows its recorded X/Y combat route with the first paired boomerangs
and repeat every 256 frames. Both turn through measured 32-direction headings,
hold their launch offsets for one frame, capture Billy's position at NES
`y=176`, and recalculate their return heading
once before leaving the arena.

The decoded enemy event stream runs until the Wanted gate; once the poster is
owned and the Boss arena locks, scrolling and regular enemy-event spawning
stop. Boss reinforcements can still drop money or ammunition when defeated,
but the locked arena does not create extra ambient barrels or loose pickups.

Devil Hawk enters from the top on one of the ROM's NES X lanes
(`x=88/128/168/208`) before using a long jump arc and firing a measured five-shot
or player-sector three-shot fireball fan. Its five-shot branch accepts aim
sectors `8..24`; an out-of-sector check can skip the projectile but still ends
the opening attack's invulnerability. The Ninja enters from one of four measured NES coordinate
pairs (`112,64`, `192,64`, `120,144`, or `176,128`) with an initial
smoke/invulnerability window,
Fatman Joe enters from NES `x=64/104/152/192` at the top edge before using short hops and
stationary grenade traps across the Round 5 road, while Wingate's two encounters use top-edge NES
lanes `x=64/104/152/192` before a 17-frame measured horizontal rush toward the
centerline after a
short hold, then replay their recorded X/Y routes; the Ninja enters a smoke/invulnerability phase and
teleports naturally during its route and after each lost health bar. The runtime
hides the Boss for the measured 90-frame teleport delay, then restarts its entry
smoke window and attack clock from the newly selected lane. Devil Hawk fireballs use the ROM's
discrete directional velocity table and their measured 45/36-frame lifetimes;
its recorded X/Y movement route is replayed through the available trace, while
only the post-trace random route remains an approximation.
Fatman Joe begins attack decisions after his measured entrance. A successful
downward-sector check launches one aimed shell; after 31 frames it stops and
splits into five stationary mines at four-frame intervals. The mines use the
measured symmetric offsets and last about 29 NES frames. His multi-hop X/Y
profile follows the controlled Boss trace through combat frame 3,418. The runtime
pauses the 76-frame attack counter during the measured 53-frame short or
122-frame long movement action; only later random movement direction remains
an approximation.
Ninja's measured first shuriken volley appears at frame 179 as a four-way
diagonal cross spawned just above Billy; each shot lasts about 40 frames and the
attack uses a common 60-frame repeat interval. A non-damaging low-slot smoke
proxy starts at frame 140, travels toward the captured player-relative launch
point for 40 frames, then remains as a hidden seven-frame controller while the
four shuriken slots are active.

The ROM event stream is data-driven per Round. Its behavior routines map to the
recognizable roster of gunmen, bombers, snipers, back-stabbers, riflemen,
ninjas, shotgunners, spear throwers, firebreathers and Hatchet Throwers; only
some long-tail random branches remain marked as approximations.
Snipers are edge-mounted static shooters that aim once using the ROM's
32-direction projectile table, enter their window/tee-pee cover for 90 NES
frames after each shot, and do not walk with field enemies. The code `2`
opposite-side variant also fires at the otherwise missed age-314 aiming window.
Ordinary Ninjas
hold their entry lane through a short pause, descend to the combat line, then
make a brief player-relative diagonal retreat after their frame-103 Shuriken
and release within the measured 303-frame route cap.
Gunmen use the same quantized table at the faster second tier, check their
movement-facing gate on an observed `40/52/58/62` first phase and every 64
frames after a miss, fire at most once, and replay the measured top-entry
movement through the center/left/right release paths (549/828/1196 frames).
Riflemen advance,
enter their attack state at 122 NES frames once they are at least 48 NES pixels
downscreen and within 96 NES Y pixels of Billy, then fire five shots at
138/154/170/186/202 through one quantized five-heading fan captured at attack
start and centered on the selected left, center, or right sector,
and retreat toward the top of the playfield. Entity code `15` instead enters
from either edge, fires three shots at 97/113/129 frames, and returns to its
edge before releasing at frame 259.
Top-entry Shotgunners fire two measured three-shot fans; entity code `4`
instead enters from either side, fires one fan at frame 114, and returns to its
edge before releasing at frame 232.
Hatchet Throwers descend to NES `y=40`, pause 20 frames, and patrol the authored
collision map. A blocked path starts a 34-frame curved turn; after crossing NES
`x=40/216`, a new aim-sector `15..17` check becomes eligible. A successful check
holds the actor through a 26-frame throw animation and captures the projectile
heading before that delay. Their route-dependent lifetimes release between 620
and 1,042 measured frames instead of using a fixed attack interval.
Top- and side-entry Firebreathers share one movement state machine: a 32-frame
entry, 40-frame captured-aim wait, approach until both player-axis distances are
under 96 NES pixels, and a 20-frame ready wait. Starting at frame 156, decisions
repeat every 52 frames. The ROM random-byte branch either checks aim sectors
`10..22` and starts a 39-frame fire animation, or selects a 24-frame movement
action; side fireballs quantize the captured heading to an even sector. Top-entry
and side-entry Spear Throwers use 24- and 40-frame entrances, then share a
72-frame cycle: 40 frames still, followed by a 32-count composite arc. The
eighth movement frame can throw only when the current random route points along
one of two eligible axes and Billy's aim sector is `10..23`; emitted headings are
masked to an even sector. Later arcs alternate between reversing the previous
route and selecting a new four-way random route, so neither form has a fixed
shot schedule or actor lifetime.

Round 1 Bombers descend into range and make their first throw on the measured
entry transition, then choose among eight measured movement directions and
durations with a half-probability throw decision between segments, releasing
when the measured retreat leaves the NES screen. Their dynamite has explicit flight, landed, defusable, and delayed
explosion phases. Boss and enemy projectiles are typed separately as bullets,
boomerangs, fireballs, shuriken, spears, hatchets, dynamite, or grenades. Spear and
hatchet projectiles also use distinct proportions and rotation behavior rather
than sharing the Ninja shuriken representation. Fatman Joe's shell is aimed and
mobile before it splits into stationary, short-lived mines; neither phase
shares Bomber dynamite's defusable delayed-explosion behavior.

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

Round entry places Billy at the measured first-collision coordinate `(136,188)`
NES pixels (world `(510,423)`), and each new Round or loop resets to that same
coordinate.

Enemy spawning now consumes decoded Round event records with a verified
behavior routine and preserves the NES enemy/object pool bit. Each runtime
unit retains its behavior, entity code and pool for trace comparison; the
visible type is selected from the identified behavior mapping. The pools are
capped independently at seven enemy slots and
six object slots, matching the ROM allocator. The `$B5BF` Round 4 records are
rendered as falling rock hazards with enemy-pool capacity and player collision,
rather than being misclassified as ordinary walking enemies.
Behavior and object records at the same trigger are merged by their decoded
script index, preserving the original spawn order before either pool-capacity
check is applied.
ROM behavior actors are anchored in world space at their event trigger, then
carry the camera scroll while their routine updates screen-relative movement.
Hatchet and Spear state machines own their full screen-relative Y path, including
the final offscreen retreat, and are exempt from the generic 160-NES-pixel clamp.
Non-ROM fallback formations limit that descent to 160 NES pixels so authored
fallback actors remain staged in the playable area instead of drifting through
the camera indefinitely.
Dispatch `0x07` records with verified pickup conversions render as breakable
barrels; codes 32 and 41 are also empty breakable barrels that enter a short
post-hit explosion state without yielding a pickup. The web runtime exposes the
breakable/no-pickup behavior; the brief explosion animation remains an explicit
visual approximation. Their original entity codes and pool selection remain
attached for comparison.

Important barrel contents now come directly from the decoded ROM object stream,
so every Boots, Rifle, POW, Money, Yashichi, Skull and Horse barrel uses its
original Round order and NES coordinate without a second authored barrel list.
Breakable objects enter at the top edge and descend with the measured ROM
object speed, keeping the barrel and pickup interaction in the playable area.
Breaking a barrel itself awards no points; only a collected Money Bag adds its
200-point value.
Enemy Money Bag and ammunition drops follow the decoded event flag: marked
enemies drop Bullet supplies while any special-gun ammunition remains, otherwise they
drop a Money Bag; unmarked enemies do not drop either pickup. Defeat score also
uses the ROM dispatch table: Gunmen, Snipers, Bombers and Firebreathers are 100;
Ninjas, Riflemen and Hatchet Throwers are 200; Shotgunners are 300; and
Backstabbers and Spear Throwers are 400.
Enemy durability also comes from each ROM entity initializer rather than the
Round number: ordinary shooters range from one to four hit points, while
breakable barrels take six points of projectile damage.

After a lethal shot, the enemy remains non-colliding for the ROM's five-frame
defeat animation while its slot is still occupied; any flagged drop is allocated
as a separate enemy-pool pickup. This preserves the original short-lived slot
pressure before the actor is released. Barrel contents use that same seven-slot
pickup pool rather than becoming capacity-free runtime objects.

After the second Wingate encounter the web recreation enters a separate ending
and credits state instead of treating the win as Game Over.
The first Wingate defeat clears both projectile pools and leaves a measured
264-frame pause before the real Wingate enters from its lower NES lane; the second encounter alone grants the
Round 6 bounty.
The decoy begins its first attack checks immediately; real Wingate waits until
frame 277. Both then check every 12 NES frames and fire only when Billy is in
the downward aiming sector and the ROM's three-of-four random gate passes.
Their bullets use quantized directional aim in the ROM's `12..20` downward
sector and a 64-frame lifetime rather than fixed-size simultaneous volleys.

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
