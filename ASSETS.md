# Asset provenance

The current build uses deterministic, generated PNG pixel textures and PCM WAV
music/effect assets. `npm run generate:assets` recreates the complete set from
the checked-in generator using fixed visual patterns, palettes and synthesis
parameters. No ROM graphics, music, or Capcom source is bundled or
redistributed.

The generated assets are loaded through the same WebGPU textures, AudioManager
music bus and AudioManager SFX bus used by gameplay. The old procedural rows
and oscillator paths remain only as development fallbacks when a static asset
cannot be fetched.

DOM title, intro, briefing and ending screens use generated 256×240 pixel
backgrounds as well; their text and buttons remain HTML for keyboard, touch and
screen-reader access.
