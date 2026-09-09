import fs from "node:fs";
import crypto from "node:crypto";
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
    expect(pngSize(path.join(root, "sprites/player.png"))).toEqual({ width: 64, height: 48 });
    expect(pngSize(path.join(root, "sprites/boss-1.png"))).toEqual({ width: 64, height: 64 });
    expect(pngSize(path.join(root, "sprites/boss-2.png"))).toEqual({ width: 128, height: 48 });
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
    expect(music.map((name) => fs.readFileSync(path.join(root, "music", `${name}.wav`)).readUInt32LE(24))).toContain(44_100);
    for (const frequency of [75, 95, 110, 120, 168, 170, 180, 186, 204, 222, 240, 258, 440, 620, 740, 980]) {
      expect(fs.existsSync(path.join(root, "sfx", `tone-${frequency}.wav`))).toBe(true);
    }
  });

  it("keeps ROM-derived assets on the lib-jsnes USA baseline", () => {
    const hash = (name: string) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, name))).digest("hex");
    expect(hash("sprites/player.png")).toBe("c39e0a638386090a2ea022826d0e78af14c449d2127491f4768a70ebfd87c3bb");
    expect(hash("sprites/gunman.png")).toBe("242af688b0a10400cd342811f768d0016d816dd9cd9513459370f282cb9d7a9e");
    expect(hash("sprites/boss-1.png")).toBe("1928bf03f9f15989345b3d4d714ff9b52386c58f45cda908902f466328ae696d");
    expect(hash("sprites/boss-2.png")).toBe("a58b0a6d2f1d3e5abee7a112c762a87455428a6db7dbb13bd851ca693496086a");
    expect(hash("music/round-1.wav")).toBe("b3c24fa423bf73d1ab94022ad2a0ff0c6660807e7cf1b39aaa900e2cf64b5bb2");
    expect(hash("screens/title.png")).toBe("8b60beae8602178e310d0a86581a487e172523bb7bc018ce70d30dce08a8770e");
    expect(hash("screens/intro.png")).toBe("e383c82aaea1f6b2da457c4441ff48afe2f94715f745e74b1b57054267aee1ef");
    expect(hash("screens/briefing.png")).toBe("103c50cf163bf7889cf094bb747ea75c16456d2720ee1e56741bb3c949089aff");
  });
});
