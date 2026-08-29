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
| 6 | Wingate town / cemetery | Wingate (two encounters) | gate, poster, shop, decoded random movement, boundary correction and attack gates |

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

The Horse is a three-hit shield and selects the ROM's `5/3` movement tier. A blocked hit removes
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
grants contact damage against ordinary enemies and falling rocks, temporary invulnerability,
and the same `5/3` movement tier as Horse, while Magnum bullets can
destroy enemy projectiles. POW clears regular enemies, falling rocks and
ordinary projectiles but does not damage the low-slot Boss actor or clear its
separate projectile pool.
Smart Bomb is armed from the inventory and triggers
on a lethal hit, awarding the same regular-enemy defeat score/drop conversion
before marking regular enemies for their short defeat animation and clearing
enemy bullets, while consuming one bomb; it
does not damage bosses or grant a follow-up invulnerability window. Arming it selects the unlimited Pistol,
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
with a larger collision body, and can pierce multiple enemies while applying
its full three-point damage to each target without depending on which weapon is
selected after the shot was fired. Pistol, Shotgun, and Magnum require
fresh button presses; only Machine Gun repeats while fire is held. Their traced
minimum trigger intervals are 4, 12, 5, and 4 NES frames respectively.

The runtime now exercises the engine's animation binding for player/enemy/Boss
sprites, WebGPU `Renderer2D` batches, `AudioManager` buses, `ActionMap` keyboard
and Gamepad input, deterministic seeded randomness, and per-round terrain/road
data. Destroying or replacing the procedural runtime also releases its raw
GPU textures, so switching into Reference ROM mode does not retain old round
assets.

Boss encounters use their measured per-bar durability: Bandit Bill has four
3-hit bars, Cutter four 2-hit bars, Devil Hawk five 6-hit bars, Ninja four
1-hit bars, Fatman Joe six 12-hit bars, and the Wingate decoy/real encounters
use one 6-hit bar followed by six 12-hit bars. After each lost health bar Bandit Bill
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
his clean-trace X/Y movement path is replayed for all 3,505 measured combat
frames, with absolute-age samples shifted onto the combat timeline through
frame 7,584 and held to the frame-7,680 random-state handoff. The handoff retains the recorded
NES subpixels (`fineX=64`, `fineY=200`) before the 24-frame route pause.
His 96-frame entrance holds for 9 frames, then repeats four 2-pixel downward
steps followed by eight idle frames until reaching NES `y=64`.
Ordinary screen clears do not erase active low-slot Boss shots. ROM-tagged
Ninja, Hatchet, Spear, and Firebreather shots use the shared discrete second-tier
direction table; all active formations are driven by decoded ROM event records.
Cutter enters from the top edge on one of the ROM's NES X lanes
(`x=88/112/144/168`), descends through a short overshoot, and curves 15 NES pixels
left to approximately `y=136` after 324 frames, using the captured discrete
entrance steps. It holds that lane until frame 350,
then follows its recorded X/Y combat route. The first paired boomerangs launch
at frame 350 and repeat every 256 frames. All 3,277 measured combat frames are
replayed directly before the existing sparse route continues through frame 12,000. The runtime then
continues Cutter with the ROM's random direction segments and four-active/eight-idle
movement gait rather than reflecting the sampled path. The same post-route
state keeps the 256-frame attack cycle: 26 frames still, a directed climb to
the upper arena boundary, and a short hold before random movement resumes.
Both turn through the NES three-pixel 32-direction velocity table,
hold their launch offsets for one frame, capture Billy's position at NES
`y=176`, and recalculate their return heading
once before leaving the arena.

The decoded enemy event stream runs until the Wanted gate; once the poster is
owned and the Boss arena locks, scrolling and regular enemy-event spawning
stop. Boss reinforcements can still drop money or ammunition when defeated,
but the locked arena does not create extra ambient barrels or loose pickups.

Devil Hawk enters from the top on one of the ROM's NES X lanes
(`x=88/128/168/208`) and follows the captured 143-frame stepped descent before
using a long jump arc and firing a measured five-shot
or player-sector three-shot fireball fan. Its five-shot branch accepts aim
sectors `8..24`; an out-of-sector check can skip the projectile but still ends
the opening attack's invulnerability. The Ninja enters from one of four measured NES coordinate
pairs (`112,64`, `192,64`, `120,144`, or `176,128`) with an initial
smoke/invulnerability window,
Fatman Joe enters from NES `x=64/104/152/192` at the top edge with the captured
170-frame stepped descent before using short hops and
stationary grenade traps across the Round 5 road, while Wingate's two encounters use top-edge NES
lanes `x=64/104/152/192`, four-active/eight-idle movement, random `24..96`-frame
direction segments and two-part boundary-correction arcs; the Ninja enters a smoke/invulnerability phase and
teleports naturally during its route and after each lost health bar. The runtime
hides the Boss for the measured 90-frame teleport delay, then restarts its entry
smoke window and attack clock from the newly selected lane. Devil Hawk fireballs use the ROM's
discrete directional velocity table and their measured 45/36-frame lifetimes;
its recorded X/Y movement route is replayed through all 3,458 available combat
frames, then
uses the ROM's random movement/action state and boundary correction for the
continued encounter. Long-tail fire is emitted from those action states:
the hold branch produces a three-shot fan, while the high-position vertical
bounce emits a five-shot fan six movement frames into its measured arc. The
low-position down action uses its separate 28-frame hold and 32-frame route
without emitting that five-shot fan;
the old fixed fire cadence is not used after the random-state handoff.
Fatman Joe begins attack decisions after his measured entrance. A successful
low-nibble attack gate and downward-sector check launches one aimed shell; after 31 frames it stops and
splits into five stationary mines at four-frame intervals. The mines use the
measured symmetric offsets and last about 29 NES frames. A mine overlapping
Billy at creation can deal contact damage and disappear in that same frame. His multi-hop X/Y
profile follows all 3,431 controlled combat frames, then uses sparse measured
samples through frame 12,000, then holds the final sample. The runtime
pauses the 76-frame attack counter during the measured 53-frame short or
122-frame long movement action, fires the follow-up shell at action end, and
then resumes the counter; its attack random gate and follow-up timing use the
decoded ROM state. The captured long-tail route is held at its final sampled
position rather than reflected, matching the ROM's post-route wait state.
Ninja's measured first shuriken volley appears at frame 179 as a four-way
diagonal cross spawned just above Billy; each shot lasts about 40 frames and the
attack uses a common 60-frame repeat interval. A non-damaging low-slot smoke
proxy starts at frame 140, travels toward the captured player-relative launch
point for 40 frames, then remains as a hidden seven-frame controller while the
four shuriken slots are active.
The initial visible route is sampled through the natural teleport at frame
339. Its first re-entry begins after the 90-frame hidden delay and uses the
separate measured step route. The initial route starts moving on frame 44,
and the re-entry path retains the corrected relative-frame `y=60` and `y=90`
samples at frames 80 and 216 instead of smoothing across those jumps.

The ROM event stream is data-driven per Round. Its behavior routines map to the
recognizable roster of gunmen, bombers, snipers, back-stabbers, riflemen,
ninjas, shotgunners, spear throwers, firebreathers and Hatchet Throwers; only
some long-tail random branches remain marked as approximations.
Snipers are edge-mounted static shooters that aim once using the ROM's
32-direction projectile table, enter their window/tee-pee cover for 90 NES
frames after each shot, and do not walk with field enemies. The code `2`
opposite-side variant also fires at the otherwise missed age-314 aiming window.
Ordinary Ninjas hold their entry lane through a short pause, descend to the
combat line, then make a brief player-relative diagonal retreat after their
frame-103 Shuriken and release within the measured 303-frame route cap. Round 4
events `at=47,x=152,phase=0` and `at=63,x=184,phase=1` use their measured
244-frame second movement and release traces. Event `at=351,x=208,phase=1`
fires at frame 103 and releases after 255 frames, while
`at=399,x=224,phase=0` follows a 221-frame no-throw route. Later event
`at=735,x=152,phase=1` has a 202-frame no-throw route for the captured slot
fractions `fineX=239,fineY=81`; the same event can take a different random
branch and is therefore left on the generic state path when those fractions do
not match. The observed `fineX=161,fineY=5` branch throws at frames
116/153/190/227; only those verified throws are scheduled because that capture
ends before natural release. Event `at=767,x=216,phase=1` similarly binds its captured
`fineX=51,fineY=66` state to a frame-116 throw and 258-frame release route.
`at=3215,x=208,phase=0`
holds its lane, fires at frame 116, and releases after 284 frames using a
fixed-point trace. Event `at=3407,x=224,phase=0` uses the same frame-116 throw gate from its own
lane and releases after 252 frames with a separate fixed-point route.
`at=383,x=184,phase=1` and `at=751/1583/3535,x=184,phase=0` events follow
separate 205/202/202/241-frame no-throw routes. Event `at=943,x=168,phase=0`
uses a 201-frame no-throw route. Event `at=1103,x=160,phase=0` fires at frame
116 and follows a 260-frame fixed-point route. Events
`at=1711,x=160,phase=0` fires at frames 116 and 153 and releases after 284
frames using a separate fixed-point route. Events
`at=815/1199/3727,x=184,phase=0` and `at=1727,x=184,phase=1`
delay their Shuriken until frame 116, while `at=1071` throws at frames 116 and
153. They follow separate
258/279/257/228/257-frame routes. Other entries execute the decoded `$B671`
state machine: a 20-frame handoff, `AD += AE` action choice, 16-frame movement
profile, repeated Shuriken checks, terrain probes, and natural screen release.
Gunmen use the same quantized table at the faster second tier. Their first
movement-facing check is derived from the spawn-time `$0540` seed (the first
natural Round 1 seeds yield `58/52/69` frames), then repeats every 64
frames. Runtime replays the measured top-entry
movement through the center/left/right release paths (549/828/1196 frames).
Those three paths use the complete isolated ROM frame samples, preserving their
discrete jumps and screen-release boundaries rather than interpolating between
sparse waypoints. Their complete per-frame heading samples also preserve the
later successful left-route shot at frame 314 and right-route shots at frames
570/1146. The samples are bound to the captured `x=88,y=0` entry;
other entry lanes retain the same branch selection with parameterized offsets.
The left-edge code-7 side route is likewise replayed from a complete 642-frame
integer trace relative to the event origin and mirrored for its right-edge
counterpart. Round 1's natural `at=687,x=4,y=32` event first fires at frame 58.
Round 2's lone
`code=7,x=56,y=0,phase=1` event uses a separate 369-frame top-entry trace and
fires at its second scheduler opportunity, frame 115. Round 3's lone
`code=7,x=80,y=0,phase=1` event uses its separate 324-frame top-entry trace and
enters its attack state at frame 160. Code 8 and code 9
retain their separate measured keyframe routes, while their attack windows use
the retained phase-driven 64-frame checks rather than fixed shot timestamps.
Round 1 event `at=847,x=248,y=32,code=7,phase=0` additionally uses its measured
590-frame right-edge route and first successful attack opportunity at frame 92.
Event `at=1423,x=4,y=48,code=7,phase=0` uses a separate 307-frame left-edge
route and fires at its first opportunity, frame 64.
Event `at=1743,x=248,y=80,code=7,phase=0` starts in dispatch `0x59`, fires at
frame 64, and uses a distinct 590-frame route that exits through the top edge.
Event `at=1791,x=4,y=128,code=7,phase=1` uses a 252-frame route, fires at
frame 64, and exits through the bottom edge.
Event `at=1983,x=248,y=48,code=7,phase=1` uses a 475-frame route, fires at
frame 95, and exits through the right screen boundary.
The following same-coordinate event at `at=2079` uses a different 675-frame
route and fires at frame 59; the routes are scoped by event index.
Event `at=2223,x=248,y=64,code=7,phase=0` uses a 464-frame route, fires at
frame 57, and exits through the top edge.
Event `at=2511,x=248,y=96,code=7,phase=0` uses a 426-frame route, fires at
frame 64, and later exits through the right screen boundary.
Event `at=2559,x=4,y=112,code=7,phase=1` uses a 557-frame route, first fires
at frame 238, and exits through the top edge.
Event `at=2671,x=248,y=48,code=7,phase=0` uses a 582-frame route, fires at
frame 73, and exits through the bottom edge.
Event `at=703,x=248,y=32,code=7,phase=1` uses a distinct 583-frame route,
fires at frame 67, and exits through the bottom edge.
Event `at=1071,x=4,y=32,code=8,phase=0` uses a 519-frame route, remains on the
left edge through frame 246, then exits diagonally through the bottom edge.
Event `at=1263,x=4,y=64,code=8,phase=0` uses a separate 411-frame route and
exits through the bottom edge without firing.
Event `at=1775,x=248,y=32,code=9,phase=0` uses a distinct 696-frame route;
its first traced projectile begins at frame 367 before the actor exits upward.
Event `at=511,x=248,y=96,code=9,phase=1` starts in the ROM's `0x5d` state,
transitions through its `0x57/0x59` movement states, and uses a complete
823-frame coordinate route to the final screen release.
Event `at=351,x=4,y=32,code=7,phase=1` uses a 312-frame route and exits through
the bottom edge.
Event `at=399,x=4,y=32,code=7,phase=0` uses a 618-frame route and exits through
the top edge.
Event `at=655,x=4,y=32,code=8,phase=0` uses a 570-frame route and exits through
the top edge.
Event `at=1135,x=4,y=48,code=7,phase=0` uses a 307-frame route and exits through
the bottom edge.
Event `at=1167,x=4,y=64,code=7,phase=0` uses a 299-frame route and exits through
the bottom edge.
Event `at=1231,x=248,y=48,code=7,phase=0` uses a 522-frame route and exits through
the top edge.
Event `at=1407,x=4,y=32,code=7,phase=1` uses a 774-frame route and exits through
the bottom edge.
Event `at=1599,x=4,y=32,code=8,phase=1` uses a 917-frame route and exits through
the left edge.
Event `at=1807,x=248,y=32,code=9,phase=0` uses a 981-frame route and exits through
the bottom edge.
Event `at=1903,x=4,y=64,code=7,phase=0` uses a 732-frame route and exits through
the bottom edge.
Event `at=1967,x=4,y=48,code=7,phase=0` uses a 678-frame route and exits through
the top edge.
The `at=911,x=248,y=32,code=9,phase=0` side of the simultaneous pair uses a
963-frame route and exits through the bottom edge.
The `at=943,x=248,y=48,code=9,phase=0` entry uses a separate 849-frame route;
its event-specific handoff is replayed directly rather than using the generic
side state.
Event `at=975,x=248,y=64,code=9,phase=0` uses a 676-frame route and exits through
the bottom edge.
Event `at=2671,x=248,y=64,code=7,phase=0` uses a 360-frame route and exits through
the left edge.
Complete scoped side traces are selected for matching entries: Round 2 uses
569 frames for the code-8 `at=623` entry at `y=32`. The at351 code-7 phase-1
entry uses a separate shorter trace and exits through the bottom edge. It uses
371 for code 8 at `y=64` (including at207) and 963 for code 9 at
`y=32`; Round 3 uses 581/384-frame code 7
`y=64`, phase-1 left/right traces and a 379-frame code 8 `y=64`, phase-0
trace. Round 6 also has controlled code 7 traces for left/right `y=32` and left
`y=64` entries (342/453/918 frames), plus 578/447-frame code 8 left `y=32`
phase-0/phase-1 traces and a 776-frame code 9 right `y=48`, phase-1 trace.
Other rounds,
phases and entry heights use the generic routes until their slot-state traces
are captured.
Round 2 side Gunmen without a verified complete event trace use the Gunman
movement states rather than a shared coordinate path. Code 7 enters for 48
frames, tracks Billy while either axis is at least 56 NES pixels away, then
selects a side state while close. One side state rotates every five frames after
leaving that range until roaming; the other preserves its heading. Terrain
collision returns it to tracking.

The state-machine fallback is verified against two additional complete Round 2
replays: the `at=911,x=4,y=32,code=7,phase=0` route matches all 643 recorded
frames with Billy held at NES `(136,216)`, and the
`at=1199,x=248,y=32,code=7,phase=0` route matches all 573 frames with Billy at
NES `(120,215)`. Both comparisons include coarse coordinates, slot fractions
and terrain probes; they are not visual-only matches.

Codes 8 and 9 advance from their side until their collision probe opens and
Billy is within 101 vertical pixels, run a 51-frame mirrored lunge, then join
the same tracking states. Terrain probes and screen exits are evaluated each
NES frame.
The `$B46E` side-raid Backstabber uses the same fixed-point movement primitives:
it captures Billy's heading at spawn, combines first-tier pursuit with a
four-frame second-tier arc, pauses in its 30-frame cover dispatch, and repeats
until the screen coordinate overflows. It does not fire.
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
durations with one shared random byte selecting both the half-probability throw
decision and the next direction between segments, releasing
when the measured retreat leaves the NES screen. Their dynamite has explicit flight, landed, defusable, and delayed
explosion phases. Boss and enemy projectiles are typed separately as bullets,
boomerangs, fireballs, shuriken, spears, hatchets, dynamite, or grenades. Spear and
hatchet projectiles also use distinct proportions and rotation behavior rather
than sharing the Ninja shuriken representation. Fatman Joe's shell is aimed and
mobile before it splits into stationary, short-lived mines; neither phase
shares Bomber dynamite's defusable delayed-explosion behavior.

Round 4 falling rocks replay their measured mirrored arc from the NES screen
edge and enter a 25-frame non-colliding impact effect when the decoded terrain
or the route's 96-frame cap is reached. A rock destroyed by player fire, POW,
or Smart Bomb enters that same impact state early.

Landmark timing remains represented as four deterministic segments per Round,
with explicit formation metadata and a landmark type (`town`, `rock`, `village`,
`cliff`, `forest`, `cemetery`, or `open`) so side geometry changes with the ROM
event script. Enemy timing itself comes from the decoded event stream.

The six decoded ROM collision rings now provide the base 16-pixel terrain mask
and the geometry for each Round's self-generated map texture.
The player lookup follows the verified `$5A-$5D` map pointer/page/fine-scroll
formula and keeps axis sliding, so diagonal input can follow a blocked edge.
Rocky Pass, Cliff Valley, Forest, and Wingate Town retain their authored
boulder, tree, and grave overlays as visual scenery, while both the visible
base geometry and movement collision come from the decoded ROM mask.
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
ROM enemy actors also retain each slot's fixed-point spawn fraction across
fixed-route and state-machine updates, so reusing a slot does not snap the
actor to an integer screen coordinate.
Behavior and object records at the same trigger are merged by their decoded
script index, preserving the original spawn order before either pool-capacity
check is applied.
ROM behavior actors are anchored in world space at their event trigger, then
carry the camera scroll while their routine updates screen-relative movement.
Hatchet and Spear state machines own their full screen-relative Y path, including
the final offscreen retreat, and use their own explicit cleanup boundaries.
The runtime has no non-ROM fallback formation path; all authored actors remain
bounded by their decoded state machine, screen cleanup, or route lifetime.
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
ROM-tagged pickups keep their source pool and fixed screen X while descending;
only non-ROM procedural drops use the cosmetic horizontal drift.
Enemy durability also comes from each ROM entity initializer rather than the
Round number: ordinary shooters range from one to four hit points, while
breakable barrels take six points of projectile damage. Falling rocks use the
same enemy pool with five hit points and can be damaged by every player weapon.

After a lethal shot, the enemy remains non-colliding for the ROM's five-frame
defeat animation while its slot is still occupied; any flagged drop is allocated
as a separate enemy-pool pickup with its own slot and fine coordinates. This
preserves the original short-lived slot pressure before the actor is released.
Barrel contents remain in the six-slot object pool rather than becoming
capacity-free runtime objects; enemy drops are skipped when all seven ordinary
enemy slots are occupied.

After the second Wingate encounter, a nine-frame defeat state and 752-frame
non-colliding controller delay lead into the separate ending and credits state
instead of treating the win as Game Over. Start/Ride again remains locked for
the measured 4,125-frame ending sequence while an original chiptune cue plays,
then returns to the title.
The first Wingate defeat clears both projectile pools and leaves a measured
264-frame pause before the real Wingate enters from its lower NES lane; the second encounter alone grants the
Round 6 bounty.
Both encounters begin attack checks on their movement gait; correction arcs
pause that cadence. They fire only when Billy is in
the downward aiming sector and the ROM's mutating low-two-bit gate passes.
Their bullets use quantized directional aim in the ROM's `12..20` downward
sector and a 64-frame lifetime rather than fixed-size simultaneous volleys.
Both encounters replay their respective 3,601 captured integer movement frames
before handing control back to the decoded gait state.

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
uses the measured NES center bounds `x=16..240,y=48..216`; buildings and cliff
edges retain their gameplay role through the decoded Round collision map. Eight
directions use the ROM's fixed-point vector table rather than equal X/Y diagonal
components, with normal speed alternating its first and second tiers each frame.
Terrain movement probes Billy's center and NES horizontal edges `-7/+6`, matching
the cardinal wall-stop routes instead of using one offset point. At the lower
screen edge, a newly scrolled collision row searches the nearest open 16-pixel
column before movement resumes.

## Known Approximation Boundary

- The repository does not contain extracted ROM graphics, music, or Capcom
  source code.
- Procedural textures stand in for the original sprite and terrain sets.
- Boss attack patterns are recognizable gameplay approximations, not a claim
  that every projectile trajectory matches the reference ROM.
- Exact parity work requires recording the same ROM revision at a fixed frame
  rate and comparing captured input/state traces.
