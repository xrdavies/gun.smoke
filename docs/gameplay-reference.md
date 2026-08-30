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
When the six player projectile slots cannot fit the complete two- or five-shot
template, the trigger creates no partial volley and consumes no special ammo.
Creating the final special-weapon volley immediately returns the equipped
weapon to Pistol; holding Machine Gun does not synthesize a follow-up Pistol
trigger.

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
teleporting away from his current route. His 96-frame entrance is also protected,
while Cutter and Devil
Hawk become vulnerable only after their opening attack. Fatman Joe is
protected during his 170-frame entrance and vulnerable when the first shell launches;
Cutter's boomerangs also curve in opposite directions.
Ninja remains invulnerable during its opening smoke and every teleport/re-entry
window; hidden Boss sprites cannot deal contact damage or be damaged by bullets.
Snipers are likewise non-colliding while inside cover. Bandit Bill and Fatman
Joe remain visible during their damage recovery windows.
Most Boss weapons use a six-slot projectile pool separate from the eight slots
used by ordinary enemy gunfire, so field bullets cannot suppress those attacks;
Bandit Bill's traced `0x30` shots are the exception and use the ordinary pool;
his clean-trace X/Y movement path is replayed for 3,505 measured combat
frames, and a second controlled trace extends the available samples to frame
7,991 on the combat timeline. Runtime consumes the route through the measured
frame-7,584 random-state handoff, which retains the recorded
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
at frame 350, a second pair follows about 29 NES frames later, and the cycle
then repeats every 256 frames. The available traces cover 14,677
measured combat frames through frame 14,676; runtime consumes the route through
the frame-12,000 handoff and then
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
stop. The separate Boss scheduler checks two points in each 128-frame cycle,
applies the ROM random gate, and selects from the current Round's 16-entry
reinforcement table. Reinforcements share the ordinary seven-slot pool and
behavior routines, but their compact records contain no scripted drop flag.
The locked arena does not create extra ambient barrels or loose pickups.

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
its available recorded X/Y movement route covers 11,858 combat frames, while
runtime consumes it through the frame-3,600 handoff and then
uses the ROM's random movement/action state and boundary correction for the
continued encounter. Before that handoff, fire uses the same trace's irregular
five-/three-shot action events instead of a generic 125-frame cadence. Long-tail fire is emitted from those action states:
the hold branch produces a three-shot fan, while the high-position vertical
bounce emits a five-shot fan six movement frames into its measured arc. The
low-position down action uses its separate 28-frame hold and 32-frame route
without emitting that five-shot fan;
the old fixed fire cadence is not used after the random-state handoff.
Fatman Joe begins attack decisions after his measured entrance. A successful
low-nibble attack gate and downward-sector check launches one aimed shell; after 31 frames it stops and
becomes a non-colliding controller, then splits into five stationary mines at
four-frame intervals. The controller and mines fill the six-slot Boss pool. The mines use the
measured symmetric offsets and last about 29 NES frames. A mine overlapping
Billy at creation can deal contact damage and disappear in that same frame. His multi-hop X/Y
profile follows all 12,397 controlled combat frames, then holds the final
sampled wait-state position. The runtime
pauses the 76-frame attack counter during the measured 53-frame short or
122-frame long movement action, fires the follow-up shell at action end, and
then resumes the counter; its attack random gate and follow-up timing use the
decoded ROM state. The captured long-tail route is held at its final sampled
position rather than reflected, matching the ROM's post-route wait state.
Ninja's measured first shuriken volley appears at frame 163 as a four-way
diagonal cross spawned just above Billy; each shot lasts about 40 frames and the
attack uses a common 60-frame repeat interval. A non-damaging low-slot smoke
proxy starts at frame 124, travels toward the captured player-relative launch
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
Snipers are edge-mounted static shooters that adjust among six discrete lane
headings toward Billy, keep an 8-bit 90-frame firing cooldown, and do not walk
with field enemies. The actor remains visible and collidable while that
countdown runs. The code `2` opposite-side variant uses the same lane/cooldown
state with its opposite initial lane; its six-shot ages in the reference are
one seeded route, not a separate fixed schedule.
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
not match. The `fineX=161,fineY=5` branch throws at frames 116/153/190/227 and
releases at frame 266; its complete fixed-point route is bound separately.
Event `at=767,x=216,phase=1` similarly binds its captured
`fineX=51,fineY=66` state to a frame-116 throw and 258-frame release route.
Event `at=1247,x=200,phase=1` with `fineX=203,fineY=212` throws at frames
116/153/190/227/264 and releases after 266 frames on its fixed-point route.
Event `at=1279,x=168,phase=1` with `fineX=184,fineY=212` throws at frames
116/153, returns to its entry lane, and releases after 311 frames.
Event `at=1375,x=168,phase=1` with `fineX=61,fineY=154` takes a random movement
branch between attacks, throws at 116/204/241/278/315, and releases at frame 430.
Event `at=1391,x=200,phase=0` with `fineX=184,fineY=28` throws at frame 116,
settles on its post-attack lane, and releases after 256 frames.
Event `at=1407,x=144,phase=1` with `fineX=100,fineY=182` throws at frames
116/227, crosses a movement branch, and releases after 334 frames.
The `at=1519,x=104,phase=0` and `at=1535,x=144,phase=1` records have
state-qualified captures when their enemy slots are available; the later
`x=240` half of the same-frame `at=1551` pair is skipped by pool pressure.
The allocated `at=1551,x=128,phase=0` route
with `fineX=246,fineY=23` throws at 116/153/190 and releases after 383 frames.
An isolated `at=1551,x=240` allocation with `fineX=176,fineY=0` throws at 116
and releases after 207 frames. The following `at=1567,x=152` route with
`fineX=81,fineY=204` throws at frame 116 and releases after 228 frames; its
isolated `x=216,fineX=176,fineY=0` partner releases after 198 frames with the
same single throw.
Event `at=1743,x=144,phase=0` with `fineX=88,fineY=46` follows another
228-frame single-throw route and releases through the 8-bit Y boundary.
The `at=1775` record is skipped by natural pool pressure; its isolated neutral
slot route throws at frame 116 and releases after 200 frames. Event
`at=1855,x=112,phase=1` with `fineX=204,fineY=205` throws at frame 116 and
releases after 224 frames through the same screen boundary.
Event `at=1887,x=96,phase=1` with `fineX=88,fineY=246` throws at
116/153/190/248/285 and releases after a 436-frame random branch route.
At `at=1919` the natural pool allocates only the earlier `x=64` record; its
`fineX=251,fineY=236` route throws at 116/153/190/357 and releases at frame 366.
The isolated `x=112,fineX=176,fineY=0` partner throws at 116 and releases after
224 frames.
Event `at=2223,x=80,phase=0` (the record previously captured at the shared
map-pointer window) with `fineX=210,fineY=133` throws at frame 116,
returns along its lower lane, and releases after 257 frames.
The earlier `at=2015` record is skipped by natural pool pressure; its isolated
`x=80,fineX=176,fineY=0` route throws at 116 and releases after 664 frames.
Event
`at=2207,x=56,phase=1` is a 212-frame no-throw route in the captured neutral
slot state. Event `at=2543,x=56,phase=0` with `fineX=36,fineY=132` is a
256-frame single-throw route and releases after settling near its left lane.
Event `at=2559,x=128,phase=1` in the captured neutral slot state is a
210-frame no-throw route and releases after its lower-edge retreat.
Event `at=2607,x=80,phase=0` in the captured neutral slot state throws at
frame 116 and releases after 258 frames from its return lane.
Event `at=2623,x=112,phase=1` in the captured neutral slot state throws at
116/153, follows its return branch, and releases after 313 frames.
Event `at=2639,x=40,phase=0` in the captured neutral slot state throws at
frame 116 and releases after 258 frames from its rightward return lane.
Event `at=2751,x=24,phase=1` in the captured neutral slot state throws at
frame 116 and releases after 224 frames through its lower screen boundary.
Event `at=2767,x=80,phase=0` (the Ninja record in the four-record group)
with `fineX=44,fineY=0` throws at 116/153/190 and releases after 332 frames.
Event `at=2815,x=72,phase=1` with the neutral captured slot fraction
`fineX=240,fineY=0` throws at frame 116 and releases after 258 frames.
Event `at=2879,x=88,phase=1` with the same neutral fraction is a 201-frame
no-throw route and releases after descending in place.
Event `at=2911,x=72,phase=1` with the neutral fraction throws at 116/153 and
releases after 277 frames.
Event `at=2943,x=48,phase=1` with the neutral fraction is a 209-frame
no-throw route and releases at the lower screen boundary.
Event `at=2959,x=80,phase=0` with the neutral fraction throws at
116/174/211/248 and releases after 349 frames.
Event `at=3103,x=72,phase=1` with the neutral fraction throws at 116/153 and
releases after 280 frames.
Event `at=3119,x=56,phase=0` with the neutral fraction throws at frame 116
and releases after 256 frames.
The same trigger also allocates `x=120`; its `fineX=176,fineY=0` route throws
at frame 116 and releases after 271 frames.
The Round 4 `at=3215,x=160` record is a separate 268-frame single-throw route
with the neutral slot fraction.
The same trigger's `x=192` record uses a 332-frame route with throws at
116/153/190 and a separate neutral slot fraction.
Event `at=3327,x=56,phase=1` in the neutral captured state throws at frame
116 and releases after 256 frames.
The same trigger's `x=96` record uses a 335-frame route with throws at
116/153/190 and a separate neutral slot fraction.
Its isolated `x=128,fineX=44,fineY=0` partner throws at 116/153 and releases
after 332 frames.
Event `at=3391,x=152,phase=1` with the neutral fraction throws at frame 116
and releases after 224 frames.
The same trigger's `x=200` record uses a 237-frame single-throw route with
the separate neutral slot fraction.
The `at=3535,x=184,phase=0` record has two captured slot states: fine
`x=135/256,y=35/256` is a 241-frame no-throw branch, while neutral
fine `x=176/256,y=0` throws on frame 117 and releases after 277 frames.
Event `at=3535,x=120,phase=0` with the neutral fraction prepares on frame 116,
throws on frame 117, and releases after 272 frames.
Event `at=3407,x=120,phase=0` with the neutral fraction throws at frame 116
and releases after 271 frames; its `x=224` partner retains its separate route.
The first Ninja in the `at=3519` group (`x=152,phase=1`) takes a 225-frame
no-throw route in the neutral slot state; the other same-frame Ninja is checked
separately. The `x=216` partner takes a 255-frame no-throw route and releases
after its mirrored return.
The `at=3647,x=136/176/216,phase=1` group fires at frames 116 and 153, but
uses three separate fixed-point routes that release after 364, 335, and 261
frames respectively.
The later `at=3743,x=120,phase=1` route fires once at frame 116 and releases
after 228 frames; `at=3759,x=152,phase=0` also fires once at frame 116 and
releases after 198 frames.
State-qualified captures cover `at=1519,x=104,phase=0` (one throw at 116,
224 frames) and `at=1535,x=144,phase=1` (143-frame no-throw) branches. The
allocated `at=2031,x=56,phase=0` route throws at
116/153 and releases after 266 frames; `at=2239,x=104,phase=1` throws once
at 116 and releases after 228 frames. The `at=3055,x=56,phase=0` route
throws at 116/153 and releases after 335 frames.
The isolated `at=3055,x=88,phase=0` partner throws once at frame 116 and
releases after 270 frames.
`at=3215,x=208,phase=0`
holds its lane, fires at frame 116, and releases after 284 frames using a
fixed-point trace. Event `at=3407,x=224,phase=0` uses the same frame-116 throw gate from its own
lane and releases after 252 frames with a separate fixed-point route.
`at=383,x=184,phase=1` and `at=751/1583,x=184,phase=0` events follow
separate 205/202/202-frame no-throw routes. Event `at=943,x=168,phase=0`
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
Spear, Hatchet and Firebreather states are initialized once from each event's
coarse coordinate and inherited slot fractions, so their first update does not
double-apply the subpixel offset.
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
Round 3 `at=255,x=4,y=64,code=7,phase=1` now uses the shared state machine
instead of its former integer-only fixed trace, preserving all 581 coarse and
subpixel samples through its top-edge release.
The flagged right-side `at=4255,x=248,y=64,code=7,phase=1` event likewise uses
the state machine for all 384 coarse/fine samples through its left-edge release.
Round 3 `at=1071,x=4,y=64,code=8,phase=0` also replaces its integer fixed trace
with the state machine, preserving all 379 coarse/fine samples through release.
Round 3 `at=1119,x=4,y=96,code=8,phase=1` instead uses the shared state
machine and matches all 282 controlled frames through its bottom-edge release.
Round 3 `at=687,x=4,y=64,code=7,phase=0` also uses the shared state machine for
all 330 controlled frames rather than the phase-1 y=64 fixed trace.
Its later phase-0 `at=1711,x=4,y=64,code=7` counterpart independently matches
311 controlled state-machine frames through release.
The earlier phase-0 `at=1647,x=4,y=64,code=7` event independently matches 312
controlled state-machine frames through release.
The second-loop `at=319,x=4,y=48,code=7,phase=1` event matches 501 controlled
state-machine frames through its right-edge release.
The `at=959,x=4,y=80,code=7,phase=1` event matches 302 controlled state-machine
frames through its bottom-edge release.
Round 3 `at=3775,x=4,y=48,code=8,phase=1` matches another 426 controlled
state-machine frames through its bottom-edge release.
The phase-0 `at=3823,x=4,y=96,code=8` event independently matches 282
controlled frames through the same release boundary.
The flagged `at=4239,x=4,y=80,code=7,phase=0` event uses the shared state
machine for all 301 controlled frames; its flag remains a drop concern and does
not change movement.
The late `at=4831,x=248,y=48,code=7,phase=1` event matches 582 controlled
state-machine frames across the map wrap and releases at the bottom edge.
The same-frame Boss-gate event `at=4863,x=248,y=80,code=7,phase=1` matches 381
controlled state-machine frames through its left-edge release.
The Round 6 right-side code-7 `y=64` event does not reuse the left-only trace;
it runs the shared player- and terrain-driven Gunman state machine.
Round 6 `at=2207,x=4,y=96,code=8,phase=1` also uses that state machine and
matches all 648 controlled fixed-point frames through its left-edge release.
The opening `at=159,x=4,y=32,code=8,phase=1` event replaces its former
447-frame integer trace with a 450-frame exact state-machine route through the
top edge.
Its `at=2783,x=248,y=32,code=9,phase=1` counterpart matches all 960 controlled
frames through its bottom-edge release.
The later `at=3919,x=248,y=32,code=9,phase=0` event holds its allocation-frame
X coordinate instead of taking the usual immediate side step, then uses the
same state machine for all 1,419 controlled frames through release.
Round 6 `at=4543,x=4,y=48,code=7,phase=1` matches another 303 controlled
state-machine frames through its bottom-edge release.
Round 6 `at=2991,x=4,y=48,code=8,phase=0` uses its captured 1,055-frame
fixed-point route through the observed slot-reuse boundary instead of the
generic 508-frame code-8 lifetime.
The earlier `at=2943,x=4,y=32,code=8,phase=1` event runs the shared state
machine for 1,350 verified fixed-point frames, fires once at frame 655, and
releases at the left edge rather than ending on the 447-frame shared trace.
The adjacent `at=3023,x=4,y=32,code=8,phase=0` event uses another complete
1,215-frame state-machine route with no successful shot and the same left-edge
release.
Round 6 `at=3055,x=112,y=0,code=5` uses a separate 48-frame bottom entrance,
then follows the shared chase/orbit state machine through a complete 1,429-frame
no-shot route and right-edge release instead of the generic near branch.
Round 6 `at=3295,x=64,y=0,code=6` likewise uses a 48-frame top entrance before
the shared state machine. Its 745-frame route fires at 62/126/574 and exits left;
it is not a horizontal offset of the captured `x=88` top route.
The naturally allocated `at=3327,x=88,y=0,code=5` entry follows the same
bottom-to-shared-state handoff, fires at frame 232, and matches through its
frame-273 Blue Yashichi contact. Its same-frame partner is dropped by pool
pressure.
Round 6 `at=3487,x=168,y=0,code=6` uses the shared top-entry state machine for
306 frames, fires at 13/77, and exits through the bottom boundary.
Round 6 `at=3551,x=88,y=0,code=6` uses a separate 524-frame shared-state route,
fires at 60/124/188/252/316, and also exits through the bottom boundary.
Round 6 `at=3711,x=136,y=0,code=6` uses a 287-frame shared-state route, fires
at frame 66, and exits through the left boundary.
Round 6 `at=3727,x=4,y=32,code=8,phase=0` uses a complete 1,005-frame shared
state route with shots at 68/132/196/719/847/911 and a right-boundary release.
The later `at=4415,x=216,y=0,code=6,phase=1` entry preserves its spawned fine
coordinates, follows the shared top-entry chase/orbit states for 603 frames,
fires at frames 13 and 397, and releases at the bottom boundary.
The two same-frame `at=4511` top entries are distinct: `x=152` follows a
483-frame route with a frame-63 shot, while `x=168` follows a 506-frame route
with a frame-13 shot. Both preserve their spawned fine coordinates and end in
the observed player-contact handoff.
At `at=4623`, the top `x=88` entry is distinct from the bottom `x=168` entry:
it follows a 324-frame shared route, fires at frame 69, and exits at `Y=252`.
At `at=4639`, the top `x=144` entry is distinct from the bottom `x=112` entry:
it follows a 295-frame shared route, fires at frame 13, and exits through the
left boundary.
The following `at=4479,x=96,y=0,code=6,phase=1` entry also preserves its fine
coordinates, follows the shared route for 315 frames, fires at frame 29, and
releases at the bottom boundary.
The later `at=4319,x=200,y=0,code=5,phase=1` entry uses the same 48-frame
bottom entrance as the earlier Round 6 code-5 routes, then follows the shared
chase/orbit states to complete its 392-frame no-shot route at the NES `Y=255`
release boundary.
The later bottom entries preserve their event-specific routes as well:
`at=4575,x=120` runs 419 frames and fires at 158 before the `Y=252` release;
`at=4623,x=168` runs 150 frames with no successful shot before the same release;
and `at=4639,x=112` fires at 193 before its frame-222 player-contact handoff.
Round 4's `at=1503,x=248,y=80,code=7,phase=1` event uses the same state machine
and matches all 356 fixed-point frames through its right-boundary release.
Its `at=1727,x=248,y=96,code=7,phase=1` counterpart matches all 345 frames
through the same boundary.
The left-side `at=2527,x=4,y=80,code=7,phase=1` route matches 630 frames
through its top-edge release.
The left-side `at=1743,x=4,y=48,code=7,phase=0` route matches 360 frames
through its bottom-edge release.
The left-side `at=1695,x=4,y=64,code=7,phase=1` route independently matches
360 frames through the same release.
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
The `at=703,x=4,y=32,code=8,phase=1` route likewise matches all 483 frames
through natural release with Billy at NES `(152,216)`. Its orbit counter uses
8-bit overflow (`0xff -> 0`) without rotating; only the normal `4 -> 0` wrap
advances the heading.
An isolated-slot replay of `at=1839,x=248,y=32,code=9,phase=0` also matches all
873 frames and the final fixed-point `Y=252` release. In an unmodified crowded
pass this event can be dropped when all seven enemy slots are occupied, which
the runtime preserves instead of queuing it for a later frame.

Codes 8 and 9 advance from their side until their collision probe opens and
Billy is within 101 vertical pixels, run a 51-frame mirrored lunge, then join
the same tracking states. Terrain probes and screen exits are evaluated each
NES frame.
The Round 5 `at=1135,x=4,y=48,code=7,phase=0` event is bound to its 1,107-frame
fixed-point trace, including the delayed transition into its orbit state; it
then releases when the slot is reused at the ROM boundary.
The `at=1711,x=4,y=64,code=7,phase=0` event uses a separate 285-frame trace
through its bottom-edge release.
The following `at=1759,x=4,y=64,code=7,phase=1` event uses the shared state
machine and matches 312 frames through its bottom-edge release.
The `at=1903,x=4,y=32,code=7,phase=0` event also uses that state machine. With
Round 5's actor-only terrain bits applied, all 1,488 fixed-point frames match
through its bottom-edge release.
The later-loop `at=1999,x=4,y=112,code=7,phase=0` event matches 393 controlled
state-machine frames and releases at the right edge.
The naturally allocated `at=2735,x=4,y=64,code=7,phase=0` event also matches
the shared state machine for 283 frames through its bottom-edge release.
The `$B46E` side-raid Backstabber uses the same fixed-point movement primitives:
it captures Billy's heading at spawn, combines first-tier pursuit with a
four-frame second-tier arc, pauses in its 30-frame cover dispatch, and repeats
until the screen coordinate overflows. It does not fire.
The `$B82F` ambush variant instead fixes X, begins at screen `y=1`, advances one
NES pixel every three frames while retaining its slot fraction, reaches `y=178`
on frame 531, and releases on the following frame without firing.
Riflemen advance,
enter their attack state on the first frame when they are at least 48 NES pixels
downscreen and within 96 NES Y pixels of Billy, capture the aim sector at that
transition, then fire five shots starting 16 frames later and repeating every
16 frames through one quantized five-heading fan captured at attack
start and centered on the selected left, center, or right sector,
and retreat toward the top of the playfield. Entity code `15` instead enters
from either edge, descends from screen `y=32` to `y=62`, locks aim at frame 80,
fires five shots at frames 96/112/128/144/160, and returns to its edge before
releasing at frame 258.
Top-entry Shotgunners move toward the road center and fire two measured
three-shot fans; entity code `4`
instead enters from either side, fires one fan at frame 113, and returns to its
edge before releasing at frame 230.
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
when the measured retreat leaves the NES screen. Their movement uses the actor
terrain mask rather than Billy's narrower collision mask. Their dynamite has explicit flight, landed, defusable, and delayed
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
Object pickups replace their destroyed barrel's slot and restart the discrete
three-frame descent phase at the conversion coordinate.
Scripted barrels, shops and scene props begin at screen `y=1`, advance one NES
pixel every three frames, and release when the next step reaches `y=252`.

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
Both are invulnerable through their frame-185 opening correction.
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
