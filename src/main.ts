import {
  ActionMap,
  AudioManager,
  Camera2D,
  Engine,
  Renderer2D,
  Sprite,
  World,
} from "@xrdavies/2d-engine";
import "./style.css";
import { BOSS_TRIGGER, clamp, distance, MAX_STAGE, STAGE_LENGTH, STAGES, WEAPONS, type WeaponName } from "./game-constants";

type GameAction =
  | "left"
  | "right"
  | "up"
  | "down"
  | "fireLeft"
  | "fireCenter"
  | "fireRight";
type GameMode = "title" | "playing" | "gameover";
type UnitKind = "enemy" | "boss" | "bullet" | "enemyBullet" | "coin" | "powerup" | "wanted";
type EnemyType = "gunman" | "rifleman" | "bomber" | "sniper" | "backstabber" | "ninja" | "hatchet" | "firebreather";
type TextureName = "player" | "enemy" | "boss" | "bullet" | "coin" | "powerup" | "wanted" | "terrain" | "road";
type Rgba = [number, number, number, number];

interface Unit {
  kind: UnitKind;
  enemyType?: EnemyType;
  sprite: Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  radius: number;
  value: number;
  age: number;
  phase: number;
  damage: number;
  fired: boolean;
}

const actions = new ActionMap<GameAction>();
actions
  .bind("left", { type: "key", code: "ArrowLeft" }, { type: "key", code: "KeyA" })
  .bind("right", { type: "key", code: "ArrowRight" }, { type: "key", code: "KeyD" })
  .bind("up", { type: "key", code: "ArrowUp" }, { type: "key", code: "KeyW" })
  .bind("down", { type: "key", code: "ArrowDown" }, { type: "key", code: "KeyS" })
  .bind("fireLeft", { type: "key", code: "KeyZ" })
  .bind("fireCenter", { type: "key", code: "KeyX" }, { type: "key", code: "Space" })
  .bind("fireRight", { type: "key", code: "KeyC" });

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Gun.Smoke markup is incomplete: ${selector}`);
  return element;
}

const canvas = requireElement<HTMLCanvasElement>("#game-canvas");
const titleScreen = requireElement<HTMLElement>("#title-screen");
const gameOver = requireElement<HTMLElement>("#game-over");
const hud = requireElement<HTMLElement>("#hud");
const startButton = requireElement<HTMLButtonElement>("#start-button");
const restartButton = requireElement<HTMLButtonElement>("#restart-button");
const finalScore = requireElement<HTMLElement>("#final-score");
const stageLabel = requireElement<HTMLElement>("#stage-label");
const scoreLabel = requireElement<HTMLElement>("#score-label");
const moneyLabel = requireElement<HTMLElement>("#money-label");
const livesLabel = requireElement<HTMLElement>("#lives-label");
const weaponLabel = requireElement<HTMLElement>("#weapon-label");
const messageLabel = requireElement<HTMLElement>("#message-label");
const shop = requireElement<HTMLElement>("#shop");
const shopTitle = requireElement<HTMLElement>("#shop-title");
const shopMessage = requireElement<HTMLElement>("#shop-message");
const shopClose = requireElement<HTMLButtonElement>("#shop-close");
const shopItems = [...shop.querySelectorAll<HTMLButtonElement>("[data-shop-item]")];
canvas.tabIndex = 0;

const transparent: Rgba = [0, 0, 0, 0];

function pixelTexture(engine: Engine, rows: readonly string[], palette: Record<string, Rgba>): GPUTexture {
  const width = Math.max(1, ...rows.map((row) => row.length));
  const height = Math.max(1, rows.length);
  const pixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const row = rows[y] ?? "";
    for (let x = 0; x < width; x += 1) {
      const color = palette[row[x] ?? "."] ?? transparent;
      pixels.set(color, (y * width + x) * 4);
    }
  }
  const texture = engine.gpu.device.createTexture({
    label: "gun-smoke-pixel-art",
    size: { width, height, depthOrArrayLayers: 1 },
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  engine.gpu.device.queue.writeTexture(
    { texture },
    pixels,
    { bytesPerRow: width * 4 },
    { width, height, depthOrArrayLayers: 1 },
  );
  return texture;
}

function proceduralRows(width: number, height: number, seed: number, values: readonly string[]): string[] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => values[(x * 17 + y * 31 + seed + (x ^ y)) % values.length] ?? values[0] ?? ".").join(""),
  );
}

class GunSmokeGame {
  readonly world = new World();
  readonly actions = actions;
  readonly units: Unit[] = [];
  readonly backgrounds: Sprite[] = [];
  readonly engine: Engine;
  readonly renderer: Renderer2D;
  readonly sampler: GPUSampler;
  readonly camera = new Camera2D({ position: { x: 480, y: 270 }, viewportWidth: 960, viewportHeight: 540 });
  readonly textures: Record<TextureName, GPUTexture>;
  audio: AudioManager | undefined;
  mode: GameMode = "title";
  scroll = 0;
  stage = 1;
  score = 0;
  money = 0;
  lives = 3;
  time = 0;
  spawnClock = 0.6;
  fireClock = 0;
  enemyFireClock = 1.2;
  bossFireClock = 1;
  invulnerable = 0;
  bossSpawned = false;
  stageClearClock = 0;
  hasWanted = false;
  wingatePhase = 0;
  weapon: WeaponName = "pistol";
  hasHorse = false;
  shopOpen = false;
  shopIndex = 0;
  musicTimer: number | undefined;
  musicStep = 0;
  player = { entity: 0, x: 480, y: 410, sprite: undefined as unknown as Sprite };

  private constructor(engine: Engine) {
    this.engine = engine;
    this.renderer = new Renderer2D(engine.gpu, { clearColor: { r: 0.03, g: 0.04, b: 0.06, a: 1 } });
    this.sampler = engine.gpu.device.createSampler({ magFilter: "nearest", minFilter: "nearest" });
    const palette = {
      k: [25, 30, 43, 255] as Rgba,
      w: [220, 226, 233, 255] as Rgba,
      r: [203, 67, 55, 255] as Rgba,
      o: [239, 189, 88, 255] as Rgba,
      g: [70, 189, 148, 255] as Rgba,
      b: [71, 101, 144, 255] as Rgba,
      t: [118, 78, 48, 255] as Rgba,
      s: [196, 158, 98, 255] as Rgba,
      d: [44, 57, 50, 255] as Rgba,
      p: [121, 76, 47, 255] as Rgba,
      ".": transparent,
    };
    this.textures = {
      player: pixelTexture(engine, [
        ".....wwww.....", "...wwkkkkww...", "..wkkwwkkkwk..", ".wkkkkkkkkkkw.",
        ".wkkkwwwwkkkw.", "..wkkkkkkkkw..", "...wkkkkkkw...", "....wkkkkw....",
        "...wwkkkkww...", "..wkkrrrrkkw..", ".wkkrrrrrrkkw.", ".wkkkkkkkkkkw.",
        "..wkkwwwwkkw..", "..wkkwwwwkkw..", "...wkkkkkkw...", "....wwwwww....",
      ], palette),
      enemy: pixelTexture(engine, [
        "....rrrr....", "..rrkkkkrr..", ".rrkkkkkkrr.", "rrkkrrrrkkrr", "rrkrrrrrrkrr",
        "rrkkkkkkkkrr", ".rrkkkkkkrr.", "..rrkkkkrr..", "...rrrrrr...", "...rkkkkr...",
        "..rrkkkkrr..", ".rrkkkkkkrr.", "rrkkkkkkkkrr", "..rrkkkkrr..", "...rrrrrr...",
      ], palette),
      boss: pixelTexture(engine, [
        "....oooooo....", "..oookkkkkkooo..", ".ookkkkkkkkkkoo.", "ookkrrrrrrrrkkoo",
        "okkrrrrrrrrrrkko", "okkrrrwwwwrrrkko", "okrrrrrrrrrrrrrko", "okkkkkkkkkkkkkko",
        "okkrrrrrrrrrrkko", "okkrrrrrrrrrrkko", ".okkkkkkkkkkkko.", "..ookkkkkkkkoo..",
        "...oooooooooo...", "....oooooooo....",
      ], palette),
      bullet: pixelTexture(engine, [".o.", ".o.", ".o.", ".o.", ".o.", ".o."], palette),
      coin: pixelTexture(engine, [".ooo.", "ookoo", "okkoo", "ookoo", ".ooo."], palette),
      powerup: pixelTexture(engine, [".gggg.", "gkkkkg", "gkookg", "gkkkkg", ".gggg.", "..gg.."], palette),
      wanted: pixelTexture(engine, ["wwwwww", "wkkkkw", "wkrrkw", "wkkkkw", "wkookw", "wwwwww"], palette),
      terrain: pixelTexture(engine, proceduralRows(64, 64, this.stage, ["d", "d", "d", "p", "d", "p"]), palette),
      road: pixelTexture(engine, proceduralRows(64, 64, this.stage + 3, ["t", "t", "s", "t", "s", "t"]), palette),
    };
    this.player.entity = this.world.createEntity();
    this.player.sprite = new Sprite({ texture: this.textures.player, sampler: this.sampler, position: { x: 480, y: 410 }, size: { x: 45, y: 54 }, anchor: { x: 0.5, y: 0.5 }, layer: 20 });
    this.world.addTransform(this.player.entity);
    this.buildBackground();
    this.engine.input?.onInput((event) => this.actions.handle(event));
    this.audio = this.createAudio();
    this.engine.addSystem({ update: (delta) => this.update(delta), render: () => this.render(), dispose: () => this.dispose() });
    this.engine.on("resize", ({ width, height }) => this.camera.setViewport(width, height));
  }

  static async create(): Promise<GunSmokeGame> {
    const engine = await Engine.create({ canvas, autoStart: false });
    return new GunSmokeGame(engine);
  }

  start(): void {
    if (this.mode === "playing") return;
    this.mode = "playing";
    titleScreen.hidden = true;
    gameOver.hidden = true;
    hud.hidden = false;
    canvas.focus();
    void this.audio?.unlock();
    this.startMusic();
    this.beep(440, 0.08);
    this.showMessage("RIDE OUT");
    this.engine.start();
  }

  private update(delta: number): void {
    if (this.mode !== "playing") return;
    if (this.shopOpen) return;
    this.time += delta;
    if (this.stageClearClock > 0) {
      this.stageClearClock -= delta;
      if (this.stageClearClock <= 0) this.beginNextStage();
      this.updateHud();
      return;
    }
    this.scroll += 76 * delta;
    this.maybeOpenShop();
    if (this.shopOpen) return;
    this.camera.position.y = this.scroll + 270;
    this.invulnerable = Math.max(0, this.invulnerable - delta);
    const movement = this.hasHorse ? 300 : 235;
    this.player.x = clamp(this.player.x + (this.actions.value("right") - this.actions.value("left")) * movement * delta, 70, 890);
    this.player.y = clamp(this.player.y + (this.actions.value("down") - this.actions.value("up")) * movement * delta, this.scroll + 285, this.scroll + 500);
    this.player.sprite.position = { x: this.player.x, y: this.player.y };
    this.player.sprite.visible = this.invulnerable <= 0 || Math.floor(this.time * 14) % 2 === 0;
    this.updatePlayerFire(delta);
    this.updateSpawns(delta);
    this.updateEnemyFire(delta);
    for (const unit of this.units) this.updateUnit(unit, delta);
    this.resolveCollisions();
    this.units.splice(0, this.units.length, ...this.units.filter((unit) => unit.age < 18 && unit.hp > 0 && unit.y > this.scroll - 340 && unit.y < this.scroll + 760));
    this.updateHud();
  }

  private updatePlayerFire(delta: number): void {
    const weapon = WEAPONS[this.weapon];
    this.fireClock -= delta;
    if (this.fireClock > 0) return;
    const directions: number[] = [];
    if (this.actions.active("fireLeft")) directions.push(-1);
    if (this.actions.active("fireCenter")) directions.push(0);
    if (this.actions.active("fireRight")) directions.push(1);
    if (directions.length === 0) return;
    for (const direction of directions) {
      if (weapon.spread === 0) this.spawnBullet(direction, weapon.damage);
      else for (const spread of [-weapon.spread, 0, weapon.spread]) this.spawnBullet(direction + spread, weapon.damage);
    }
    this.fireClock = weapon.interval;
    this.beep(740, 0.025);
  }

  private updateSpawns(delta: number): void {
    this.spawnClock -= delta;
    if (this.scroll >= BOSS_TRIGGER && !this.hasWanted && !this.units.some((unit) => unit.kind === "wanted")) {
      this.spawnUnit("wanted", 480, this.scroll + 170, 1);
      this.showMessage("GET THE WANTED POSTER");
    }
    if (this.scroll >= BOSS_TRIGGER && this.hasWanted && !this.bossSpawned) this.spawnBoss();
    if (this.spawnClock <= 0 && !this.bossSpawned) {
      this.spawnFormation();
      this.spawnClock = Math.max(0.58, 1.15 - this.stage * 0.08);
    }
  }

  private updateEnemyFire(delta: number): void {
    const boss = this.units.find((unit) => unit.kind === "boss" && unit.hp > 0);
    if (boss) {
      this.bossFireClock -= delta;
      if (this.bossFireClock <= 0) this.fireBoss(boss);
      return;
    }
    this.enemyFireClock -= delta;
    if (this.enemyFireClock > 0) return;
    const shooters = this.units.filter((unit) => unit.kind === "enemy" && unit.hp > 0 && unit.y < this.player.y);
    const shooter = shooters[Math.floor(Math.random() * shooters.length)];
    if (shooter) {
      const angle = Math.atan2(this.player.y - shooter.y, this.player.x - shooter.x);
      const projectile = this.spawnUnit("enemyBullet", shooter.x, shooter.y + 12, 1);
      projectile.vx = Math.cos(angle) * (90 + this.stage * 7);
      projectile.vy = Math.sin(angle) * (90 + this.stage * 7);
      projectile.radius = 7;
    }
    this.enemyFireClock = Math.max(0.6, 1.75 - this.stage * 0.18);
  }

  private fireBoss(boss: Unit): void {
    const angle = Math.atan2(this.player.y - boss.y, this.player.x - boss.x);
    const patterns: Record<number, { count: number; spread: number; speed: number; cooldown: number }> = {
      1: { count: 1, spread: 0, speed: 125, cooldown: 1.1 },
      2: { count: 2, spread: 0.24, speed: 150, cooldown: 1.25 },
      3: { count: 5, spread: 0.18, speed: 118, cooldown: 1.4 },
      4: { count: 3, spread: 0.3, speed: 168, cooldown: 0.95 },
      5: { count: 1, spread: 0, speed: 100, cooldown: 0.8 },
      6: { count: this.wingatePhase ? 5 : 3, spread: 0.1, speed: 190, cooldown: this.wingatePhase ? 0.42 : 0.7 },
    };
    const pattern = patterns[this.stage] ?? patterns[1]!;
    const center = (pattern.count - 1) / 2;
    for (let index = 0; index < pattern.count; index += 1) {
      const projectile = this.spawnUnit("enemyBullet", boss.x, boss.y + 24, 1);
      const shotAngle = angle + (index - center) * pattern.spread;
      projectile.vx = Math.cos(shotAngle) * pattern.speed;
      projectile.vy = Math.sin(shotAngle) * pattern.speed;
      projectile.radius = 7;
    }
    this.bossFireClock = pattern.cooldown;
    this.beep(150 + this.stage * 18, 0.045);
  }

  private render(): void {
    const renderItems = [this.player.sprite, ...this.backgrounds, ...this.units.map((unit) => unit.sprite)];
    this.renderer.render(renderItems, this.camera, { staticItems: false });
  }

  private buildBackground(): void {
    this.backgrounds.length = 0;
    const themes: Rgba[] = [[1, 1, 1, 1], [0.92, 0.98, 1, 1], [1, 0.93, 0.84, 1], [0.9, 0.96, 0.9, 1], [1, 0.86, 0.75, 1]];
    const tint = themes[(this.stage - 1) % themes.length] ?? [1, 1, 1, 1];
    for (let y = -360; y < STAGE_LENGTH + 650; y += 180) {
      this.backgrounds.push(new Sprite({ texture: this.textures.terrain, sampler: this.sampler, position: { x: 480, y: y + 90 }, size: { x: 960, y: 180 }, anchor: { x: 0.5, y: 0.5 }, color: tint, layer: -20 }));
      this.backgrounds.push(new Sprite({ texture: this.textures.road, sampler: this.sampler, position: { x: 480, y: y + 90 }, size: { x: 520, y: 180 }, anchor: { x: 0.5, y: 0.5 }, color: tint, layer: -19 }));
    }
  }

  private spawnFormation(): void {
    const center = 140 + Math.random() * 680;
    const y = this.scroll + 55;
    const pattern = (this.stage + Math.floor(this.scroll / 420)) % 3;
    const offsets = pattern === 0 ? [-1, 0, 1] : pattern === 1 ? [-2, -1, 1, 2] : [-2, 0, 2];
    const types: readonly EnemyType[] = this.stage === 1
      ? ["gunman", "bomber"]
      : this.stage === 2
        ? ["rifleman", "backstabber"]
        : this.stage === 3
          ? ["sniper", "hatchet", "firebreather"]
          : this.stage === 4
            ? ["ninja", "gunman", "sniper"]
            : this.stage === 5
              ? ["rifleman", "bomber", "backstabber"]
              : ["sniper", "ninja", "backstabber"];
    for (const offset of offsets) {
      const enemyType = types[Math.floor(Math.random() * types.length)] ?? "gunman";
      const entryY = enemyType === "backstabber" ? this.scroll + 520 : y - Math.abs(offset) * 22;
      const enemy = this.spawnUnit("enemy", clamp(center + offset * 66, 54, 906), entryY, 1 + Number(this.stage >= 4), enemyType);
      enemy.vx = pattern === 2 ? offset * 32 : (Math.random() - 0.5) * (55 + this.stage * 8);
      enemy.vy = enemyType === "backstabber" ? -100 : 24 + this.stage * 6;
    }
    if (Math.random() < 0.28) this.spawnUnit("coin", clamp(center + (Math.random() - 0.5) * 260, 60, 900), y + 55, 1);
    if (Math.random() < 0.1) this.spawnUnit("powerup", clamp(center + (Math.random() - 0.5) * 300, 60, 900), y + 90, 1);
  }

  private maybeOpenShop(): void {
    const checkpoint = this.scroll >= 560 ? 1 : this.scroll >= 1_180 ? 2 : 0;
    if (checkpoint === 0 || checkpoint <= this.shopIndex) return;
    this.shopIndex = checkpoint;
    this.shopOpen = true;
    shop.hidden = false;
    shopTitle.textContent = `TRADING POST / ROUND ${this.stage}`;
    shopMessage.textContent = `MONEY $${String(this.money).padStart(3, "0")}`;
    this.refreshShopButtons();
  }

  private refreshShopButtons(): void {
    for (const item of shopItems) {
      const key = item.dataset.shopItem as WeaponName | "horse" | undefined;
      const cost = key === "horse" ? 60 : key ? WEAPONS[key].cost : 0;
      item.disabled = key === "horse" ? this.hasHorse || this.money < cost : key === this.weapon || this.money < cost;
    }
  }

  buyShopItem(item: string): void {
    const key = item as WeaponName | "horse";
    const cost = key === "horse" ? 60 : WEAPONS[key]?.cost;
    if (cost === undefined || (key === "horse" && this.hasHorse) || this.money < cost) {
      shopMessage.textContent = "NOT ENOUGH MONEY";
      return;
    }
    this.money -= cost;
    if (key === "horse") this.hasHorse = true;
    else this.weapon = key;
    shopMessage.textContent = `${key.toUpperCase()} READY`;
    this.updateHud();
    this.refreshShopButtons();
  }

  closeShop(): void {
    this.shopOpen = false;
    shop.hidden = true;
    this.showMessage("RIDE ON");
  }

  private spawnBoss(): void {
    this.bossSpawned = true;
    this.bossFireClock = 0.6;
    const definition = STAGES[this.stage - 1] ?? STAGES[0]!;
    this.spawnUnit("boss", 480, this.scroll + 90, definition.bossHp * 4);
    this.showMessage(`WANTED: ${definition.boss}`);
    this.beep(180, 0.18);
  }

  private spawnUnit(kind: UnitKind, x: number, y: number, hp: number, enemyType?: EnemyType): Unit {
    const textureName: TextureName = kind === "enemyBullet" ? "bullet" : kind === "boss" || kind === "enemy" || kind === "bullet" || kind === "coin" || kind === "powerup" || kind === "wanted" ? kind : "enemy";
    const isBoss = kind === "boss";
    const isPickup = kind === "coin" || kind === "powerup" || kind === "wanted";
    const small = kind === "bullet" || kind === "enemyBullet";
    const colors: Record<EnemyType, [number, number, number, number]> = {
      gunman: [1, 0.82, 0.82, 1], rifleman: [0.82, 0.9, 1, 1], bomber: [1, 0.9, 0.65, 1], sniper: [0.78, 1, 0.88, 1],
      backstabber: [1, 0.72, 0.88, 1], ninja: [0.82, 0.78, 1, 1], hatchet: [1, 0.82, 0.68, 1], firebreather: [1, 0.62, 0.42, 1],
    };
    const sprite = new Sprite({ texture: this.textures[textureName], sampler: this.sampler, position: { x, y }, size: { x: isBoss ? 110 : isPickup ? 28 : small ? 9 : 34, y: isBoss ? 68 : isPickup ? 28 : small ? 25 : 34 }, anchor: { x: 0.5, y: 0.5 }, color: kind === "enemy" && enemyType ? colors[enemyType] : [1, 1, 1, 1], layer: isBoss ? 15 : small ? 12 : isPickup ? 11 : 10 });
    const unit: Unit = {
      kind, enemyType, sprite, x, y,
      vx: isBoss ? 42 : (Math.random() - 0.5) * 70,
      vy: isBoss || isPickup ? 0 : kind === "enemyBullet" ? 0 : 45,
      hp, radius: isBoss ? 48 : isPickup ? 17 : small ? 7 : 19,
      value: isBoss ? 5_000 : kind === "coin" ? 50 : kind === "powerup" ? 250 : kind === "wanted" ? 1_000 : 100,
      age: 0, phase: Math.random() * Math.PI * 2, damage: 1, fired: false,
    };
    this.units.push(unit);
    return unit;
  }

  private spawnBullet(direction: number, damage: number): void {
    const unit = this.spawnUnit("bullet", this.player.x + direction * 10, this.player.y - 32, 1);
    unit.vx = direction * 170;
    unit.vy = -520;
    unit.damage = damage;
  }

  private updateUnit(unit: Unit, delta: number): void {
    unit.age += delta;
    if (unit.kind === "enemy") {
      if (unit.enemyType === "backstabber") {
        unit.y += unit.vy * delta;
        unit.x += Math.sin(unit.age * 7 + unit.phase) * 35 * delta;
      } else if (unit.enemyType === "ninja") {
        unit.x += (unit.vx + Math.sin(unit.age * 6 + unit.phase) * 90) * delta;
        unit.y += unit.vy * 1.8 * delta;
      } else if (unit.enemyType === "rifleman") {
        unit.x += unit.vx * delta;
        unit.y += (unit.age < 1.2 ? unit.vy : -unit.vy * 0.75) * delta;
      } else if (unit.enemyType === "sniper") {
        unit.y += unit.vy * 0.45 * delta;
      } else if (unit.enemyType === "bomber") {
        unit.x += unit.vx * delta;
        unit.y += unit.vy * 0.7 * delta;
        if (!unit.fired && unit.age > 0.9) {
          unit.fired = true;
          const projectile = this.spawnUnit("enemyBullet", unit.x, unit.y + 12, 1);
          projectile.vx = (this.player.x - unit.x) * 0.35;
          projectile.vy = 115;
        }
      } else if (unit.enemyType === "firebreather") {
        unit.x += Math.sin(unit.age * 4 + unit.phase) * 55 * delta;
        unit.y += unit.vy * delta;
        if (!unit.fired && unit.age > 0.7) {
          unit.fired = true;
          const angle = Math.atan2(this.player.y - unit.y, this.player.x - unit.x);
          for (const spread of [-0.22, 0, 0.22]) {
            const projectile = this.spawnUnit("enemyBullet", unit.x, unit.y + 12, 1);
            projectile.vx = Math.cos(angle + spread) * 115;
            projectile.vy = Math.sin(angle + spread) * 115;
          }
        }
      } else {
        unit.x += unit.vx * delta;
        unit.y += unit.vy * delta;
        unit.x += Math.sin(unit.age * 3 + unit.phase) * 18 * delta;
      }
      if (unit.x < 32 || unit.x > 928) unit.vx *= -1;
    } else if (unit.kind === "boss") {
      unit.x += unit.vx * delta;
      if (unit.x < 380 || unit.x > 580) unit.vx *= -1;
      unit.y = this.scroll + 92 + Math.sin(unit.age * 2) * 18;
    } else if (unit.kind === "coin" || unit.kind === "powerup" || unit.kind === "wanted") {
      unit.y += 40 * delta;
      unit.x += Math.sin(unit.age * 4 + unit.phase) * 14 * delta;
    } else {
      unit.x += unit.vx * delta;
      unit.y += unit.vy * delta;
    }
    unit.sprite.position = { x: unit.x, y: unit.y };
  }

  private resolveCollisions(): void {
    const bullets = this.units.filter((unit) => unit.kind === "bullet" && unit.hp > 0);
    const targets = this.units.filter((unit) => (unit.kind === "enemy" || unit.kind === "boss") && unit.hp > 0);
    for (const bullet of bullets) {
      const target = targets.find((candidate) => distance(bullet, candidate) <= bullet.radius + candidate.radius);
      if (!target) continue;
      bullet.hp = 0;
      target.hp -= bullet.damage;
      if (target.hp > 0) continue;
      this.score += target.value;
      this.money += target.kind === "boss" ? 50 : 2;
      if (target.kind === "enemy" && Math.random() < 0.3) this.spawnUnit(Math.random() < 0.72 ? "coin" : "powerup", target.x, target.y, 1);
      if (target.kind === "boss") {
        if (this.stage === MAX_STAGE && this.wingatePhase === 0) {
          this.wingatePhase = 1;
          this.bossFireClock = 0.35;
          this.spawnUnit("boss", 480, this.scroll + 90, (STAGES[MAX_STAGE - 1]?.bossHp ?? 6) * 4);
          this.showMessage("THE REAL WINGATE");
          continue;
        }
        this.bossSpawned = false;
        this.stageClearClock = 1.5;
        this.showMessage(this.stage === MAX_STAGE ? "TRAIL COMPLETE" : "BOSS DOWN");
        this.beep(110, 0.3);
      }
    }
    for (const unit of this.units.filter((candidate) => candidate.hp > 0)) {
      if (unit.kind === "coin" || unit.kind === "powerup" || unit.kind === "wanted") {
        if (distance(unit, this.player) <= unit.radius + 22) {
          unit.hp = 0;
          this.score += unit.value;
          if (unit.kind === "coin") this.money += 10;
          else if (unit.kind === "powerup") this.lives = Math.min(5, this.lives + 1);
          else {
            this.hasWanted = true;
            this.showMessage("WANTED POSTER FOUND");
          }
          this.beep(unit.kind === "coin" ? 980 : unit.kind === "wanted" ? 520 : 620, 0.08);
        }
      } else if ((unit.kind === "enemy" || unit.kind === "boss" || unit.kind === "enemyBullet") && this.invulnerable <= 0 && distance(unit, this.player) <= unit.radius + 20) {
        this.takeHit();
        if (unit.kind !== "boss") unit.hp = 0;
      }
    }
  }

  private takeHit(): void {
    this.lives -= 1;
    this.invulnerable = 2;
    this.beep(120, 0.16);
    this.showMessage(this.lives > 0 ? "HIT!" : "OUT OF LIVES");
    for (const unit of this.units) if (unit.kind === "enemyBullet") unit.hp = 0;
    if (this.lives <= 0) this.finish(false);
  }

  private beginNextStage(): void {
    if (this.stage >= MAX_STAGE) {
      this.finish(true);
      return;
    }
    this.stage += 1;
    this.scroll = 0;
    this.spawnClock = 0.8;
    this.enemyFireClock = 1.2;
    this.bossFireClock = 1;
    this.bossSpawned = false;
    this.hasWanted = false;
    this.wingatePhase = 0;
    this.shopIndex = 0;
    this.units.length = 0;
    this.buildBackground();
    this.player.x = 480;
    this.player.y = 410;
    this.showMessage(`STAGE ${this.stage}`);
  }

  private finish(won: boolean): void {
    this.mode = "gameover";
    this.stopMusic();
    this.engine.stop();
    hud.hidden = true;
    gameOver.hidden = false;
    gameOver.querySelector("h2")!.textContent = won ? "TRAIL COMPLETE" : "WANTED: ALIVE";
    finalScore.textContent = `SCORE ${String(this.score).padStart(6, "0")}  MONEY $${String(this.money).padStart(3, "0")}`;
  }

  private updateHud(): void {
    const definition = STAGES[this.stage - 1] ?? STAGES[0]!;
    stageLabel.textContent = `ROUND ${this.stage} ${definition.name}`;
    scoreLabel.textContent = `SCORE ${String(this.score).padStart(6, "0")}`;
    moneyLabel.textContent = `$${String(this.money).padStart(3, "0")}`;
    livesLabel.textContent = `LIVES ${this.lives}`;
    weaponLabel.textContent = `${this.weapon.toUpperCase()}${this.hasHorse ? " + HORSE" : ""} / WANTED ${this.hasWanted ? "YES" : "NO"}`;
  }

  private showMessage(text: string): void {
    messageLabel.textContent = text;
    window.setTimeout(() => {
      if (messageLabel.textContent === text) messageLabel.textContent = "";
    }, 1_200);
  }

  private beep(frequency: number, duration: number): void {
    if (!this.audio) return;
    const oscillator = this.audio.context.createOscillator();
    const gain = this.audio.context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, this.audio.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audio.context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(this.audio.getBus("sfx")?.gain ?? this.audio.context.destination);
    oscillator.start();
    oscillator.stop(this.audio.context.currentTime + duration);
  }

  private startMusic(): void {
    if (this.musicTimer !== undefined || !this.audio) return;
    this.musicTimer = window.setInterval(() => this.playMusicStep(), 180);
  }

  private playMusicStep(): void {
    if (!this.audio || this.audio.context.state !== "running") return;
    const roundPatterns: readonly number[][] = [
      [262, 330, 392, 330, 294, 349, 440, 349],
      [196, 247, 294, 247, 220, 277, 330, 277],
      [220, 277, 330, 277, 247, 311, 370, 311],
      [175, 220, 262, 220, 196, 247, 294, 247],
      [233, 294, 349, 294, 262, 330, 392, 330],
      [147, 185, 220, 185, 165, 208, 247, 208],
    ];
    const pattern = roundPatterns[(this.stage - 1) % roundPatterns.length] ?? roundPatterns[0]!;
    const oscillator = this.audio.context.createOscillator();
    const gain = this.audio.context.createGain();
    oscillator.type = this.bossSpawned ? "sawtooth" : "square";
    oscillator.frequency.value = pattern[this.musicStep % pattern.length] ?? 220;
    const now = this.audio.context.currentTime;
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    oscillator.connect(gain);
    gain.connect(this.audio.getBus("music")?.gain ?? this.audio.context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
    this.musicStep += 1;
  }

  private stopMusic(): void {
    if (this.musicTimer !== undefined) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = undefined;
    }
  }

  private dispose(): void {
    this.stopMusic();
    this.audio?.dispose();
  }

  private createAudio(): AudioManager | undefined {
    try {
      return new AudioManager();
    } catch {
      return undefined;
    }
  }
}

let game: GunSmokeGame | undefined;
startButton.addEventListener("click", () => void game?.start());
restartButton.addEventListener("click", () => window.location.reload());
shopClose.addEventListener("click", () => game?.closeShop());
for (const item of shopItems) item.addEventListener("click", () => game?.buyShopItem(item.dataset.shopItem ?? ""));
game = await GunSmokeGame.create();
