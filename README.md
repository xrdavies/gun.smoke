# Gun.Smoke Web

NES/FC-oriented Gun.Smoke recreation built on `@xrdavies/2d-engine`.

The engine dependency is pinned to the `v0.1.1` release tag from the engine repository;
the engine package builds its `dist` output during `npm install`. This keeps a
fresh clone independent of a sibling `../engine` directory.

The repository contains a playable six-round loop: title screen, automatic
vertical scrolling, eight-way movement, three-direction shooting, enemy
formations and projectiles, Money Bags, life pickups, stage bosses, spendable score,
damage recovery, wanted-poster gates, two final Wingate encounters, game over
and a completion state.

The current assets are procedural development sprites. No commercial ROM,
copyrighted extracted assets, or original Capcom source code is included.
Exact ROM-level reproduction requires a legally obtained reference ROM and a
fixed revision/hash for comparison.

For local verification, the title screen also accepts a legally obtained `.NES`
file. That Reference ROM mode runs the supplied ROM through JSNES while the
current engine owns the WebGPU frame texture, Sprite, camera, engine loop,
keyboard input bridge and PCM audio output. The ROM itself is never bundled.

Reference ROM provenance and verified header metadata are recorded in
[`docs/reference-rom.md`](docs/reference-rom.md).

The gameplay target and approximation boundary are recorded in
[`docs/gameplay-reference.md`](docs/gameplay-reference.md).

```sh
npm install
npm run dev
```

The WebGPU smoke test runs with Chromium and SwiftShader:

```sh
npm run test:browser
```

When the local reference ROM is present, the non-distributable analysis tools
can be run with:

```sh
npm run inspect:rom
npm run disassemble:rom -- --start=0xc180 --end=0xc220
npm run trace:rom
npm run trace:rom:timeline
npm run trace:rom:scenes -- --frames=12000 --every=60
npm run trace:rom:scenes -- --frames=600 --every=60 --pulse-fire
npm run extract:rom-assets
npm run extract:rom-scene-script
```

`trace:rom:scenes` writes structured state/OAM/PPU samples to the ignored
`.rom-traces/` directory. The extractor writes only to the ignored
`.rom-assets/` directory. Those files are for local inspection and comparison
and must not be committed or redistributed.
