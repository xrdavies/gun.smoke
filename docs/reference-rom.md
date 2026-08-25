# Reference ROM

The local development workspace contains a user-supplied reference file named
`Gun.Smoke.ZH.NES`. It is intentionally excluded from Git by the repository
ignore rules and is not redistributed by this project.

Verified metadata:

- SHA-256: `f110936c8781eb978f73403c0499e9ea3b99cf5af3cd31a282d4fab737c1b45d`
- Format: iNES header
- PRG: 8 x 16 KiB (128 KiB)
- CHR ROM: 0 KiB (the cartridge uses CHR RAM)
- Mapper: 2 / UxROM
- Header flags: Mapper 2 bits set; four-screen mirroring flag clear

The ROM is used only as a local behavioral and technical reference. The game
repository contains original procedural development textures and code, not
ROM bytes, extracted tiles, extracted audio, or Capcom source code.

## Confidence Levels

Facts above are byte-level observations and are safe to reproduce. Gameplay
rules, stage layouts, enemy timing, and asset identity require frame-by-frame
comparison against the same ROM revision. Until that comparison is complete,
the web build labels its stages and assets as an original approximation rather
than an exact ROM conversion.

`npm run extract:rom-assets` can locally dump both runtime CHR-RAM pattern
tables,
VRAM, sprite OAM and selected 256x240 frames. The output is ignored by Git and
is intended only for private inspection against the supplied reference file.

`npm run trace:rom:timeline` presses Start before the attract timer begins,
starts a real game,
samples title, opening, and the first Round at 60-frame intervals until the
first-life trace ends. It records frame hashes, PPU scroll state and active OAM
sprite counts for encounter-timing comparisons.
Each sample also includes `gameFrame`, measured from the verified Round 1 entry
at ROM frame 825, so timeline samples can be mapped directly onto procedural
world coordinates.

The corrected Round 1 trace shows the PPU vertical position advancing 20 pixels
per 60 frames. The 540-high procedural world therefore uses 45 world pixels per
second (`20 * 540 / 240`) for its automatic scroll.

Holding Left in the real player state moves Billy about 75 NES pixels per
second. The procedural world therefore uses 168.75 world pixels per second;
the Boots speed increase remains an explicit multiplier pending a verified ROM
measurement.

OAM projectile traces show straight A+B pistol shots moving 6 pixels per frame,
and single-button diagonal shots moving about 2.5 horizontal / 5 vertical
pixels per frame. Normal pistol shots persist for roughly 15 frames. These map
to 810 straight, 337.5/675 diagonal world pixels per second and a 0.25-second
base lifetime in the procedural world.

The web title page can also load the same local ROM into Reference ROM mode.
This provides a legal exact-runtime comparison path without distributing the
ROM; the regular web game remains the original procedural recreation. The
runtime validates the iNES header, reports Mapper/PRG metadata, maps keyboard
and Gamepad input to controller 1, advances at 60 Hz and forwards JSNES APU
samples to the engine `AudioManager` music PCM stream.
