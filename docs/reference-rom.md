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

The web title page can also load the same local ROM into Reference ROM mode.
This provides a legal exact-runtime comparison path without distributing the
ROM; the regular web game remains the original procedural recreation. The
runtime validates the iNES header, reports Mapper/PRG metadata, maps keyboard
and Gamepad input to controller 1, advances at 60 Hz and forwards JSNES APU
samples to the engine `AudioManager` music PCM stream.
