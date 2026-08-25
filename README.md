# Gun.Smoke Web

NES/FC-oriented Gun.Smoke recreation built on `@xrdavies/2d-engine`.

The engine dependency is pinned to a Git commit from the engine repository;
the engine package builds its `dist` output during `npm install`. This keeps a
fresh clone independent of a sibling `../engine` directory.

The repository contains a playable six-round loop: title screen, automatic
vertical scrolling, eight-way movement, three-direction shooting, enemy
formations and projectiles, coins, life pickups, stage bosses, score, money,
damage recovery, wanted-poster gates, two final Wingate encounters, game over
and a completion state.

The current assets are procedural development sprites. No commercial ROM,
copyrighted extracted assets, or original Capcom source code is included.
Exact ROM-level reproduction requires a legally obtained reference ROM and a
fixed revision/hash for comparison.

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
