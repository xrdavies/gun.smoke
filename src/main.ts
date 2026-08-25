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

type GameAction = "left" | "right" | "up" | "down" | "fireLeft" | "fireCenter" | "fireRight";
type GameMode = "title" | "playing" | "gameover";
type UnitKind = "enemy" | "boss" | "bullet" | "coin" | "powerup";

interface Unit {
  entity: number;
  kind: UnitKind;
  sprite: Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  radius: number;
  value: number;
  age: number;
}

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
const messageLabel = requireElement<HTMLElement>("#message-label");

const actions = new ActionMap<GameAction>();
actions
  .bind("left", { type: "key", code: "ArrowLeft" }, { type: "key", code: "KeyA" })
  .bind("right", { type: "key", code: "ArrowRight" }, { type: "key", code: "KeyD" })
  .bind("up", { type: "key", code: "ArrowUp" }, { type: "key", code: "KeyW" })
  .bind("down", { type: "key", code: "ArrowDown" }, { type: "key", code: "KeyS" })
  .bind("fireLeft", { type: "key", code: "KeyZ" })
  .bind("fireCenter", { type: "key", code: "KeyX" }, { type: "key", code: "Space" })
  .bind("fireRight", { type: "key", code: "KeyC" });

function colorTexture(engine: Engine, rgba: [number, number, number, number]): GPUTexture {
  const texture = engine.gpu.device.createTexture({
    label: "gun-smoke-procedural-pixel",
    size: { width: 1, height: 1, depthOrArrayLayers: 1 },
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  engine.gpu.device.queue.writeTexture(
    { texture },
    new Uint8Array(rgba),
    { bytesPerRow: 4 },
    { width: 1, height: 1, depthOrArrayLayers: 1 },
  );
  return texture;
}

class GunSmokeGame {
  readonly world = new World();
  readonly actions = actions;
  readonly units: Unit[] = [];
  readonly engine: Engine;
  readonly renderer: Renderer2D;
  readonly camera = new Camera2D({ position: { x: 480, y: 270 }, viewportWidth: 960, viewportHeight: 540 });
  readonly textures: Record<string, GPUTexture>;
  audio: AudioManager | undefined;
  mode: GameMode = "title";
  scroll = 0;
  stage = 1;
  score = 0;
  money = 0;
  lives = 3;
  spawnClock = 0;
  fireClock = 0;
  bossSpawned = false;
  player = { entity: 0, x: 480, y: 410, sprite: undefined as unknown as Sprite };

  private constructor(engine: Engine) {
    this.engine = engine;
    this.renderer = new Renderer2D(engine.gpu, { clearColor: { r: 0.04, g: 0.05, b: 0.08, a: 1 } });
    this.textures = {
      player: colorTexture(engine, [220, 226, 233, 255]),
      enemy: colorTexture(engine, [210, 78, 61, 255]),
      boss: colorTexture(engine, [239, 189, 88, 255]),
      bullet: colorTexture(engine, [255, 245, 184, 255]),
      coin: colorTexture(engine, [239, 189, 88, 255]),
      powerup: colorTexture(engine, [70, 189, 148, 255]),
      trail: colorTexture(engine, [20, 29, 43, 255]),
    };
    this.player.entity = this.world.createEntity();
    this.player.sprite = new Sprite({ texture: this.textures.player!, position: { x: 480, y: 410 }, size: { x: 34, y: 42 }, anchor: { x: 0.5, y: 0.5 }, color: [0.9, 0.92, 0.96, 1], layer: 20 });
    this.world.addTransform(this.player.entity);
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
    this.mode = "playing";
    titleScreen.hidden = true;
    gameOver.hidden = true;
    hud.hidden = false;
    this.showMessage("RIDE OUT");
    this.engine.start();
  }

  private update(delta: number): void {
    if (this.mode !== "playing") return;
    this.scroll += 76 * delta;
    this.camera.position.y = this.scroll + 270;
    const movement = 230;
    this.player.x = Math.max(70, Math.min(890, this.player.x + (this.actions.value("right") - this.actions.value("left")) * movement * delta));
    this.player.y = this.scroll + 410 + (this.actions.value("down") - this.actions.value("up")) * movement * delta;
    this.player.sprite.position = { x: this.player.x, y: this.player.y };
    this.fireClock -= delta;
    if (this.fireClock <= 0) {
      const directions = [
        this.actions.active("fireLeft") ? -1 : 0,
        this.actions.active("fireCenter") ? 0 : 0,
        this.actions.active("fireRight") ? 1 : 0,
      ];
      const fired = directions.filter((direction) => direction !== 0 || this.actions.active("fireCenter"));
      if (fired.length > 0) {
        for (const direction of fired) this.spawnBullet(direction);
        this.fireClock = 0.16;
      }
    }
    this.spawnClock -= delta;
    if (this.scroll > 1900 && !this.bossSpawned) this.spawnBoss();
    if (this.spawnClock <= 0 && !this.bossSpawned) {
      this.spawnFormation();
      this.spawnClock = 1.1;
    }
    for (const unit of this.units) this.updateUnit(unit, delta);
    this.resolveCollisions();
    this.units.splice(0, this.units.length, ...this.units.filter((unit) => unit.age < 20 && unit.hp > 0 && unit.y > this.scroll - 300));
    this.updateHud();
  }

  private render(): void {
    const renderItems = this.world.extractRenderItems((entity) => entity === this.player.entity ? this.player.sprite : undefined);
    renderItems.push(...this.units.map((unit) => unit.sprite));
    this.renderer.render(renderItems, this.camera, { staticItems: false });
  }

  private spawnFormation(): void {
    const center = 120 + Math.random() * 720;
    for (let index = -1; index <= 1; index += 1) {
      this.spawnUnit("enemy", center + index * 62, this.scroll - 60 - Math.abs(index) * 30, 1);
    }
  }

  private spawnBoss(): void {
    this.bossSpawned = true;
    this.spawnUnit("boss", 480, this.scroll + 80, 14);
    this.showMessage("WANTED: BOSS RIDER");
  }

  private spawnUnit(kind: UnitKind, x: number, y: number, hp: number): Unit {
    const entity = this.world.createEntity();
    const texture = this.textures[kind] ?? this.textures.enemy!;
    const sprite = new Sprite({ texture, position: { x, y }, size: { x: kind === "boss" ? 90 : 30, y: kind === "boss" ? 58 : 30 }, anchor: { x: 0.5, y: 0.5 }, layer: kind === "boss" ? 15 : 10 });
    this.world.addTransform(entity);
    const unit: Unit = { entity, kind, sprite, x, y, vx: kind === "boss" ? 34 : (Math.random() - 0.5) * 70, vy: kind === "boss" ? 0 : 50, hp, radius: kind === "boss" ? 40 : 18, value: kind === "boss" ? 5000 : 100, age: 0 };
    this.units.push(unit);
    return unit;
  }

  private spawnBullet(direction: number): void {
    const unit = this.spawnUnit("bullet", this.player.x, this.player.y - 30, 1);
    unit.vx = direction * 150;
    unit.vy = -500;
    unit.radius = 6;
    unit.sprite.size = { x: 6, y: 18 };
  }

  private updateUnit(unit: Unit, delta: number): void {
    unit.age += delta;
    unit.x += unit.vx * delta;
    unit.y += unit.vy * delta;
    if (unit.kind === "boss" && (unit.x < 380 || unit.x > 580)) unit.vx *= -1;
    unit.sprite.position = { x: unit.x, y: unit.y };
  }

  private resolveCollisions(): void {
    for (const bullet of this.units.filter((unit) => unit.kind === "bullet" && unit.hp > 0)) {
      for (const enemy of this.units.filter((unit) => (unit.kind === "enemy" || unit.kind === "boss") && unit.hp > 0)) {
        if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) > bullet.radius + enemy.radius) continue;
        bullet.hp = 0;
        enemy.hp -= 1;
        if (enemy.hp <= 0) {
          this.score += enemy.value;
          this.money += enemy.kind === "boss" ? 50 : 2;
          if (enemy.kind === "boss") {
            this.stage += 1;
            this.bossSpawned = false;
            this.showMessage("BOSS DOWN");
          }
        }
        break;
      }
    }
  }

  private updateHud(): void {
    stageLabel.textContent = `STAGE ${this.stage}`;
    scoreLabel.textContent = `SCORE ${String(this.score).padStart(6, "0")}`;
    moneyLabel.textContent = `$${String(this.money).padStart(3, "0")}`;
    livesLabel.textContent = `LIVES ${this.lives}`;
  }

  private showMessage(text: string): void {
    messageLabel.textContent = text;
    window.setTimeout(() => {
      if (messageLabel.textContent === text) messageLabel.textContent = "";
    }, 1200);
  }

  private createAudio(): AudioManager | undefined {
    try {
      return new AudioManager();
    } catch {
      return undefined;
    }
  }

  private dispose(): void {
    this.audio?.dispose();
    this.engine.resources.disposeAll();
    this.engine.destroy();
  }
}

let game: GunSmokeGame | undefined;

startButton.addEventListener("click", () => void game?.start());
restartButton.addEventListener("click", () => window.location.reload());

game = await GunSmokeGame.create();
