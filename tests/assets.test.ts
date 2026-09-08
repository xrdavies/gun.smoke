import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve("public/assets");

describe("generated Gun.Smoke assets", () => {
  it("contains every runtime sprite and stage background", () => {
    const sprites = ["player", "horse", "shopkeeper", "bullet", "moneyBag", "ammo", "barrel", "boots", "rifle", "pow", "money", "skull", "blueYashichi", "redYashichi", "gunman", "rifleman", "bomber", "sniper", "backstabber", "ninja", "hatchet", "spear", "firebreather", "shotgunner", ...Array.from({ length: 6 }, (_, index) => `boss-${index + 1}`)];
    for (const name of sprites) expect(fs.existsSync(path.join(root, "sprites", `${name}.png`))).toBe(true);
    for (let stage = 1; stage <= 6; stage += 1) {
      expect(fs.existsSync(path.join(root, "backgrounds", `terrain-${stage}.png`))).toBe(true);
      expect(fs.existsSync(path.join(root, "backgrounds", `road-${stage}.png`))).toBe(true);
    }
    const pngSize = (filename: string) => {
      const png = fs.readFileSync(filename);
      return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
    };
    expect(pngSize(path.join(root, "sprites/player.png"))).toEqual({ width: 64, height: 32 });
    expect(pngSize(path.join(root, "backgrounds/terrain-1.png"))).toEqual({ width: 96, height: 96 });
    for (const name of ["title", "intro", "briefing", "ending"]) {
      expect(pngSize(path.join(root, "screens", `${name}.png`))).toEqual({ width: 256, height: 240 });
    }
  });

  it("contains valid PCM music and tone assets", () => {
    const music = ["round-1", "round-2", "round-3", "round-4", "round-5", "round-6", "ending"];
    for (const name of music) {
      const wav = fs.readFileSync(path.join(root, "music", `${name}.wav`));
      expect(wav.subarray(0, 4).toString("ascii")).toBe("RIFF");
      expect(wav.subarray(8, 12).toString("ascii")).toBe("WAVE");
      expect(wav.readUInt16LE(22)).toBe(1);
      expect(wav.readUInt16LE(34)).toBe(16);
    }
    for (const frequency of [75, 95, 110, 120, 168, 170, 180, 186, 204, 222, 240, 258, 440, 620, 740, 980]) {
      expect(fs.existsSync(path.join(root, "sfx", `tone-${frequency}.wav`))).toBe(true);
    }
  });
});
