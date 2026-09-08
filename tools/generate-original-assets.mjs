import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const root = path.resolve("public/assets");
const spritesRoot = path.join(root, "sprites");
const backgroundsRoot = path.join(root, "backgrounds");
const musicRoot = path.join(root, "music");
const sfxRoot = path.join(root, "sfx");
for (const directory of [spritesRoot, backgroundsRoot, musicRoot, sfxRoot]) fs.mkdirSync(directory, { recursive: true });

const palette = {
  ".": [0, 0, 0, 0],
  k: [20, 22, 30, 255],
  i: [49, 53, 66, 255],
  s: [244, 183, 126, 255],
  w: [248, 226, 177, 255],
  r: [190, 52, 52, 255],
  o: [224, 124, 46, 255],
  g: [62, 146, 94, 255],
  b: [54, 102, 172, 255],
  p: [116, 74, 151, 255],
  c: [66, 164, 190, 255],
  t: [123, 76, 44, 255],
  y: [238, 194, 63, 255],
  d: [62, 76, 65, 255],
  q: [40, 86, 128, 255],
};

function writePng(filename, rows, scale = 1) {
  const width = Math.max(...rows.map((row) => row.length));
  const height = rows.length;
  const png = new PNG({ width: width * scale, height: height * scale });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = palette[rows[y]?.[x] ?? "."] ?? palette["."];
      for (let sy = 0; sy < scale; sy += 1) for (let sx = 0; sx < scale; sx += 1) {
        const offset = ((y * scale + sy) * png.width + x * scale + sx) * 4;
        png.data[offset] = color[0];
        png.data[offset + 1] = color[1];
        png.data[offset + 2] = color[2];
        png.data[offset + 3] = color[3];
      }
    }
  }
  fs.writeFileSync(filename, PNG.sync.write(png));
}

function sheet(left, right = left) {
  const width = Math.max(...left.map((row) => row.length), ...right.map((row) => row.length));
  const height = Math.max(left.length, right.length);
  return Array.from({ length: height }, (_, y) => `${left[y] ?? ""}`.padEnd(width, ".") + `${right[y] ?? ""}`.padEnd(width, "."));
}

const actor = (accent, weapon) => [
  `....${accent}......${accent}....`,
  `...${accent}${accent}${accent}${accent}${accent}${accent}${accent}...`,
  `..${accent}${accent}ssss${accent}${accent}..`,
  `..${accent}sksksk${accent}..`,
  `...${accent}${accent}${accent}${accent}${accent}${accent}...`,
  `....${accent}${accent}${accent}${accent}....`,
  `...${accent}${accent}${accent}${accent}${accent}${accent}...`,
  `..${accent}${accent}..${weapon}..${accent}${accent}..`,
  `.${accent}${accent}...${weapon}${weapon}...${accent}${accent}.`,
  `.${accent}${accent}..${accent}${accent}${accent}${accent}..${accent}${accent}.`,
  `..${accent}....${accent}....${accent}..`,
  `..${accent}....${accent}....${accent}..`,
];

const player = [
  "......wwww......", "....wwkkkkww....", "...wkksssskkw...", "..wkksssssskkw..",
  ".wkkkkkkkkkkkkw.", ".wkkwwwwwwwwkkw.", "..wkkkkkkkkkkw..", "...wkkkkkkkkw...",
  "....wkkkkkkw....", "...wwkkkkkkww...", "..wkkrrrrrrkkw..", ".wkkrrrrrrrrkkw.",
  ".wkkkkkkkkkkkkw.", "..wkkwwwwwwkkw..", "...wkkkkkkkkw...", "....wwwwwwww....",
];

const horse = [
  "........ttt.....", "......ttkktt....", ".....tssssst....", "...tttkkkkkttt..",
  "..ttkkkkkkkkktt.", ".ttkkttkkkkttktt", "ttkkttttttttkktt", "ttkkttkkkkttkktt",
  ".ttkkttkkkkttkk.", "..ttkkttttkktt..", "...tt......tt...", "..tt........tt..",
];

const shopkeeper = [
  "......oooo......", ".....oookoo.....", "....ookkkkkoo...", "...okkkkkkkko...",
  "..okkkwwwwkkko..", "..okkkkkkkkkko..", "...tttttttttt...", "..ttkkkkkkktt...",
  ".tttttt..ttttt..", ".tttt......tttt.", "..tt........tt..", "................",
];

const itemRows = {
  boots: ["..ww..", ".wkkw.", "wkkkkw", "wkkkkw", ".wwww.", "..ww.."],
  rifle: ["......", "wwwwww", ".wkkkk", "...wwk", "....wk", ".....w"],
  ammo: [".wwww.", "wkkkkw", "wkyykw", "wkkkkw", ".wwww."],
  money: ["..ww..", ".wyyw.", "wyyyyw", "wyyyyw", ".wwww."],
  pow: ["wwwwww", "wkykyw", "wwwwww", "wkykyw", "wwwwww"],
  skull: [".wwww.", "wkkkkw", "wkwkwk", "wkkkkw", ".wwww.", "..ww.."],
  horse: [".w..w.", "wwwww.", "wkkkkw", "wkkkkw", ".wwww.", "..ww.."],
  blueYashichi: ["w..w..", ".ww...", "wwwwww", "...ww.", "..w..w"],
  redYashichi: ["..w..w", "...ww.", "wwwwww", ".ww...", "w..w.."],
};

const enemies = {
  gunman: actor("r", "t"),
  rifleman: actor("b", "i"),
  bomber: actor("o", "t"),
  sniper: actor("g", "b"),
  backstabber: actor("p", "r"),
  ninja: actor("i", "r"),
  hatchet: actor("o", "y"),
  spear: actor("g", "w"),
  firebreather: actor("r", "o"),
  shotgunner: actor("r", "b"),
};

const bosses = [
  ["r", "t"], ["b", "i"], ["o", "r"], ["p", "r"], ["o", "t"], ["w", "y"],
].map(([accent, weapon]) => [
  `.....${accent}${accent}${accent}${accent}${accent}.....`,
  `...${accent}${accent}kkkkkkk${accent}${accent}...`,
  `..${accent}kk${accent}${accent}${accent}${accent}kk${accent}..`,
  `.${accent}kk${accent}ssssss${accent}kk${accent}.`,
  `.${accent}kkkkkkkkkkkk${accent}.`,
  `..${accent}kk${accent}${accent}${accent}${accent}kk${accent}..`,
  `...${accent}${accent}kkkkk${accent}${accent}...`,
  `....${accent}${accent}${accent}${accent}${accent}${accent}....`,
  `...${accent}${accent}..${weapon}${weapon}..${accent}${accent}...`,
  `..${accent}${accent}...${weapon}...${accent}${accent}..`,
  `..${accent}${accent}..${accent}${accent}${accent}${accent}..${accent}${accent}..`,
  `...${accent}....${accent}....${accent}...`,
  `...${accent}....${accent}....${accent}...`,
  `....${accent}........${accent}....`,
  `....${accent}........${accent}....`,
]);

writePng(path.join(spritesRoot, "player.png"), sheet(player), 2);
writePng(path.join(spritesRoot, "horse.png"), horse, 2);
writePng(path.join(spritesRoot, "shopkeeper.png"), sheet(shopkeeper, shopkeeper.map((row, y) => y < 4 ? ".".repeat(row.length) : row)), 2);
writePng(path.join(spritesRoot, "bullet.png"), [".y.", ".y.", ".w.", ".w.", ".y.", ".y."], 2);
writePng(path.join(spritesRoot, "moneyBag.png"), ["..yy..", ".yyyy.", "yykkyy", "ykkkky", "ykkkky", ".yyyy."], 2);
writePng(path.join(spritesRoot, "ammo.png"), [".bbbb.", "bkkkbb", "bkyybb", "bkkkbb", ".bbbb."], 2);
writePng(path.join(spritesRoot, "barrel.png"), [".oooo.", "okkkko", "okyyko", "okkkko", ".oooo."], 2);
for (const [name, rows] of Object.entries(itemRows)) writePng(path.join(spritesRoot, `${name}.png`), rows, 2);
for (const [name, rows] of Object.entries(enemies)) writePng(path.join(spritesRoot, `${name}.png`), sheet(rows), 2);
for (const [index, rows] of bosses.entries()) writePng(path.join(spritesRoot, `boss-${index + 1}.png`), sheet(rows), 2);

function backgroundRows(seed, road) {
  const width = 96;
  const height = 96;
  const values = road ? ["t", "t", "t", "q", "s", "q", "t"] : ["d", "d", "d", "d", "p", "g", "b"];
  return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
    if (road && (x < 15 || x >= width - 15)) return (x + y + seed) % 3 === 0 ? "t" : "d";
    return values[(x * 13 + y * 7 + seed * 11 + (x ^ y)) % values.length];
  }).join(""));
}
for (let stage = 1; stage <= 6; stage += 1) {
  writePng(path.join(backgroundsRoot, `terrain-${stage}.png`), backgroundRows(stage, false));
  writePng(path.join(backgroundsRoot, `road-${stage}.png`), backgroundRows(stage + 3, true));
}
writePng(path.join(backgroundsRoot, "landmark.png"), [
  "pppppppppppppppppppppppppppppppp", "pbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbp", "pbppppppppppppppppppppppppppppbp",
  "pbpwwwwwwwwwwwwwwwwwwwwwwwwwwpbp", "pbpwwwwwwwwwwwwwwwwwwwwwwwwwwpbp", "pbpkkkkkkkkkkkkkkkkkkkkkkkkkkpbp",
  "pbpkkkkkkkkkkkkkkkkkkkkkkkkkkpbp", "pbpddddddddddddddddddddddddddpbp", "pbpdddddddddpppppppppddddddddpbp",
  "pbpdddddddddpppppppppddddddddpbp", "pbpddddddddddddddddddddddddddpbp", "pppppppppppppppppppppppppppppppp",
]);

function writeWav(filename, samples, sampleRate = 22050) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((sample, index) => data.writeInt16LE(Math.max(-1, Math.min(1, sample)) * 32767, index * 2));
  const header = Buffer.alloc(44);
  header.write("RIFF", 0); header.writeUInt32LE(36 + data.length, 4); header.write("WAVE", 8);
  header.write("fmt ", 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write("data", 36); header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(filename, Buffer.concat([header, data]));
}

function square(phase) { return phase % 1 < 0.5 ? 1 : -1; }
function triangle(phase) { return 1 - 4 * Math.abs(Math.round(phase) - phase); }
function noise(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}
function tone(frequency, duration, type = "square", decay = 8) {
  const sampleRate = 22050;
  const length = Math.max(1, Math.round(duration * sampleRate));
  return Array.from({ length }, (_, index) => {
    const t = index / sampleRate;
    const envelope = Math.exp(-decay * t / duration);
    const phase = t * frequency;
    return (type === "triangle" ? triangle(phase) : square(phase)) * envelope * 0.45;
  });
}

const frequencies = [75, 95, 110, 120, 168, 170, 180, 186, 204, 222, 240, 258, 440, 620, 740, 980];
for (const frequency of frequencies) writeWav(path.join(sfxRoot, `tone-${frequency}.wav`), tone(frequency, frequency < 130 ? 0.3 : 0.12));

const melodies = [
  [262, 330, 392, 330, 294, 349, 440, 349],
  [196, 247, 294, 247, 220, 277, 330, 277],
  [220, 277, 330, 277, 247, 311, 370, 311],
  [175, 220, 262, 220, 196, 247, 294, 247],
  [233, 294, 349, 294, 262, 330, 392, 330],
  [147, 185, 220, 185, 165, 208, 247, 208],
  [262, 330, 392, 523, 392, 440, 523, 659, 523, 392, 349, 440, 523, 698, 659, 523],
];
for (let index = 0; index < melodies.length; index += 1) {
  const melody = melodies[index];
  const step = 0.18;
  const samples = [];
  for (const [noteIndex, frequency] of melody.entries()) {
    const bass = frequency / 2;
    const lead = tone(frequency, step, "square", 4);
    const low = tone(bass, step, "triangle", 3);
    for (let sample = 0; sample < lead.length; sample += 1) samples.push((lead[sample] ?? 0) * 0.55 + (low[sample] ?? 0) * 0.25 + (noteIndex % 2 === 0 ? noise(index * 100000 + noteIndex * lead.length + sample) * 0.0125 : 0));
  }
  writeWav(path.join(musicRoot, index === melodies.length - 1 ? "ending.wav" : `round-${index + 1}.wav`), samples);
}

fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify({
  generator: "tools/generate-original-assets.mjs",
  license: "Original generated assets; deterministic visual data and synthesized PCM.",
  spriteScale: 2,
  stages: 6,
  sfxFrequencies: frequencies,
  music: ["round-1", "round-2", "round-3", "round-4", "round-5", "round-6", "ending"],
}, null, 2));
console.log(`Generated original PNG/WAV assets in ${root}`);
