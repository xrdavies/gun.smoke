# Asset provenance

The current build uses deterministic, runtime-generated pixel textures and
Web Audio oscillator patterns. These are self-generated game assets; no ROM
graphics, music, or Capcom source is bundled or redistributed.

The game logic is intentionally isolated from the texture source so later art
passes can replace the generated sprites, tiles, and audio without changing
the gameplay systems.
