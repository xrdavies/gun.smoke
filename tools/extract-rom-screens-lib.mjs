import fs from "node:fs";
import path from "node:path";
import { Button, Nes } from "lib-jsnes";
import { PNG } from "pngjs";

const romPath = process.argv.slice(2).find((value) => !value.startsWith("--")) ?? "Gun.Smoke (USA).nes";
const output = path.resolve("public/assets/screens");
if (!fs.existsSync(romPath)) throw new Error(`Reference ROM not found: ${romPath}`);
fs.mkdirSync(output, { recursive: true });

const nes = new Nes(fs.readFileSync(romPath));
nes.reset();
function writeFrame(name) {
  const png = new PNG({ width: 256, height: 240 });
  for (let index = 0; index < nes.frame.length; index += 1) {
    const pixel = nes.frame[index] ?? 0;
    const offset = index * 4;
    png.data[offset] = pixel >>> 16 & 0xff;
    png.data[offset + 1] = pixel >>> 8 & 0xff;
    png.data[offset + 2] = pixel & 0xff;
    png.data[offset + 3] = 255;
  }
  fs.writeFileSync(path.join(output, name), PNG.sync.write(png));
}
function frames(count) { for (let index = 0; index < count; index += 1) nes.runFrame(); }

frames(180);
writeFrame("title.png");
nes.setController(1, Button.Start);
frames(5);
nes.setController(1, 0);
frames(195);
writeFrame("intro.png");
frames(225);
writeFrame("briefing.png");
