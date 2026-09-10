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
    expect(pngSize(path.join(root, "sprites/boss-3.png"))).toEqual({ width: 128, height: 64 });
    expect(pngSize(path.join(root, "sprites/boss-4.png"))).toEqual({ width: 96, height: 64 });
    expect(pngSize(path.join(root, "sprites/boss-5.png"))).toEqual({ width: 96, height: 64 });
    expect(pngSize(path.join(root, "sprites/boss-6.png"))).toEqual({ width: 128, height: 80 });
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
    expect(hash("sprites/gunman.png")).toBe("3301a2fb6ce86a015897a617e54fbc9a669af00ffce0d99c113f4940ff1bfd0d");
    expect(hash("sprites/sniper.png")).toBe("880f1f3ab7f11f08b43d229ddec9bf8b5259527ed7a9d0a04e9af60196d33007");
    expect(hash("sprites/rifleman.png")).toBe("f2cfc194a48181058f9595e946e2504538742439330af7eb23779845463102de");
    expect(hash("sprites/bomber.png")).toBe("f0c3b68967297e6750908e495382e089535aeccfb706917822031dcf8780aace");
    expect(hash("sprites/backstabber.png")).toBe("8e8a8bc6e35885d45188f1a1a1ce1bc8d1838dfd195cc6e6429e76a202ee30a0");
    expect(hash("sprites/ninja.png")).toBe("fab8d432278b7e2de32422ad1adfe5fd6e39294649526c680f0973fe757bf9c7");
    expect(hash("sprites/hatchet.png")).toBe("5c67c3f00600bca6b66d8e8bfd287ebf313162b76bf71b9b2bb0aa1aea946923");
    expect(hash("sprites/spear.png")).toBe("52f7b45cf8018a3c6cb0f9c15a11e0facbdd51564ef50562eccae9efa22bf7b8");
    expect(hash("sprites/firebreather.png")).toBe("f15c2154fe6e448387d7e953bf2bbf9fa59c1f9f32f17f72a3a66d0b7b1d79bb");
    expect(hash("sprites/shotgunner.png")).toBe("67f8e9e0f7b2b4db36e783617655bfaeabf787318b92badb8c47563e0760443d");
    expect(hash("sprites/boss-1.png")).toBe("1928bf03f9f15989345b3d4d714ff9b52386c58f45cda908902f466328ae696d");
    expect(hash("sprites/boss-2.png")).toBe("e4e0ee2dda86c13a6a324739b38cef5779f22d97706d0a9246f43a1d26b29936");
    expect(hash("sprites/boss-3.png")).toBe("2503d584c09b2e897ecc589d3369a7f6323cbe912ff1a65b1cebf1ceb6ec9d32");
    expect(hash("sprites/boss-4.png")).toBe("4e6bfa331740c4723393fa3b9ab3188c3a5f1dfa11c8ff4838de18996ec1e21b");
    expect(hash("sprites/boss-5.png")).toBe("df288a8f0fce9bfebe4cb138240d9b67c07f8348128b27696d4733f5f3f0bf6d");
    expect(hash("sprites/boss-6.png")).toBe("f8c0e7cedaf86f54df589e3c319a4e06026d006d2544c89eeb1bff59a39fbd94");
    expect(hash("music/round-1.wav")).toBe("b3c24fa423bf73d1ab94022ad2a0ff0c6660807e7cf1b39aaa900e2cf64b5bb2");
    expect(hash("music/round-2.wav")).toBe("ab2c64b5c1a127ebd56ca6ca6b4a06cbd1a01c7945e888a16f89c643de722aa6");
    expect(hash("music/round-3.wav")).toBe("4b95dd7a009b6f21b6320f8484e26d5769c8aa9a3e0c58fe07cc40ae6824b2ae");
    expect(hash("music/round-4.wav")).toBe("0d13734146dc05c6ab8841a3c47424941ba823984ca302a357925378e78f8c5c");
    expect(hash("music/round-5.wav")).toBe("5c21d3de326ececef527d00b810f71a40c694cd113163a93158ade01a3985a9e");
    expect(hash("music/round-6.wav")).toBe("533b5bebfbb1c57a028982ac4394219993ec73c19a87b3f884401d866f94384a");
    expect(hash("screens/title.png")).toBe("8b60beae8602178e310d0a86581a487e172523bb7bc018ce70d30dce08a8770e");
    expect(hash("screens/intro.png")).toBe("e383c82aaea1f6b2da457c4441ff48afe2f94715f745e74b1b57054267aee1ef");
    expect(hash("screens/briefing.png")).toBe("103c50cf163bf7889cf094bb747ea75c16456d2720ee1e56741bb3c949089aff");
    expect(hash("screens/ending.png")).toBe("ebcfb5b9e9992c459f7ac83b6ac6e6b62307f600b459eadde8a9583fed8faacd");
    expect(hash("music/ending.wav")).toBe("f117e20b61e3cb00139d978dd4bf18deeb3a5f4353bc80991798acd250cf1a01");
  });
});
