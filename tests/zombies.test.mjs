import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(file, imports = {}, math = Math) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, esModuleInterop: false },
  }).outputText;
  vm.runInNewContext(code, {
    exports, Math: math,
    require(name) {
      if (!(name in imports)) throw new Error(`Unexpected import: ${name}`);
      return imports[name];
    },
  });
  return exports;
}

const config = load("../src/entities/ZombieTypes.ts");

function manager(obstacles = []) {
  let seed = 42;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const math = Object.create(Math);
  math.random = random;
  const phaser = { Math: {
    FloatBetween: (a, b) => a + random() * (b - a),
    Between: (a, b) => Math.floor(a + random() * (b - a + 1)),
    Distance: { Between: (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by) },
  } };
  class Zombie {
    constructor(_scene, x, y, type) { this.type = type; this.sprite = { active: true, x, y }; }
  }
  const Manager = load("../src/entities/ZombieManager.ts", {
    phaser: { default: phaser }, "./Zombie": { default: Zombie }, "../world/WorldConfig": { WORLD_SIZE: 3000 },
  }, math).default;
  return new Manager({ cameras: { main: {
    width: 960, height: 600, zoom: 1.5,
    worldView: { left: 1180, right: 1820, top: 1300, bottom: 1700 },
  } } }, { x: 1500, y: 1500 }, obstacles);
}

test("tank limits are zero before wave five, one through wave fourteen and three from wave fifteen", () => {
  const waves = manager();
  for (let wave = 1; wave <= 16; wave++) {
    waves.getAll().forEach((zombie) => { zombie.sprite.active = false; });
    const before = waves.getAll().length;
    waves.startWave();
    const spawned = waves.getAll().slice(before);
    assert.equal(spawned.length, 5 + (wave - 1) * 2);
    const limit = wave >= 15 ? 3 : wave >= 5 ? 1 : 0;
    assert.equal(spawned.filter((zombie) => zombie.type === "tank").length, limit);
    if (wave >= 5) {
      spawned.filter((zombie) => zombie.type === "tank").forEach((zombie) => { zombie.sprite.active = false; });
      waves.spawn(2);
      assert.equal(waves.getAll().slice(before).filter((zombie) => zombie.type === "tank").length, limit);
    }
    for (const zombie of spawned) {
      assert(zombie.sprite.x >= 20 && zombie.sprite.x <= 2980);
      assert(zombie.sprite.y >= 20 && zombie.sprite.y <= 2980);
      const distanceToCamera = Math.hypot(
        Math.max(1180 - zombie.sprite.x, 0, zombie.sprite.x - 1820),
        Math.max(1300 - zombie.sprite.y, 0, zombie.sprite.y - 1700),
      );
      assert(distanceToCamera >= 400);
    }
  }
});

test("failed spawn does not consume the wave's tank slot", () => {
  const blocked = { active: true, x: 1500, y: 1500, width: 3000, height: 3000 };
  const waves = manager([blocked]);
  for (let i = 0; i < 5; i++) waves.startWave();
  assert.equal(waves.getAll().length, 0);
  blocked.active = false;
  waves.spawn(1);
  assert.equal(waves.getAll()[0].type, "tank");
});

function zombieScene() {
  const timers = [];
  const sounds = [];
  function object(x, y, key) {
    return {
      x, y, key, active: true, tint: null, scaleX: 1, scaleY: 1,
      setDisplaySize(w, h) { this.scaleX = w / 1254; this.scaleY = h / 1254; return this; },
      setDepth() { return this; }, setOrigin() { return this; }, setFillStyle() { return this; },
      setPosition(x, y) { this.x = x; this.y = y; return this; },
      setTint(color) { this.tint = color; return this; }, clearTint() { this.tint = null; },
      destroy() { this.active = false; }, explode() {},
    };
  }
  const scene = {
    add: { image: object, rectangle: object, particles: object },
    physics: { add: { existing(sprite) {
      sprite.body = {
        setCollideWorldBounds() {},
        setSize(w, h) { this.width = w * sprite.scaleX; this.height = h * sprite.scaleY; },
        setMaxVelocity(x, y) { this.maxX = x; this.maxY = y; },
      };
    } } },
    time: { now: 0, delayedCall(delay, callback) { timers.push({ delay, callback }); } },
    sound: { play(key) { sounds.push(key); } },
  };
  const Zombie = load("../src/entities/Zombie.ts", {
    phaser: { default: {} },
    "./ZombiePathfinding": { default: {} }, "./ZombieTypes": config,
  }).default;
  return { scene, timers, sounds, Zombie };
}

test("tank uses its sprite, larger collision, existing stats and restores natural colors after hits", () => {
  const { scene, timers, Zombie } = zombieScene();
  const tank = new Zombie(scene, 100, 200, "tank");
  assert.equal(tank.sprite.key, "zombie-tank");
  assert.equal(tank.body.width, 36);
  assert.equal(tank.body.height, 36);
  assert.equal(tank.speed, 55);
  assert.equal(tank.damage, 30);
  assert.equal(tank.maxHealth, 7);
  assert.equal(tank.sprite.tint, null);
  tank.takeDamage(1);
  timers.find((timer) => timer.delay === 100).callback();
  assert.equal(tank.sprite.tint, null);
  tank.sprite.y = 250;
  tank.updateHealthBar();
  assert.equal(tank.getHealthBarObjects()[0].y, 214);
});

test("tank takes seven normal hits to die; common and runner keep their sizes", () => {
  const { scene, sounds, Zombie } = zombieScene();
  const tank = new Zombie(scene, 100, 200, "tank");
  for (let i = 0; i < 6; i++) tank.takeDamage(1);
  assert.equal(tank.sprite.active, true);
  tank.takeDamage(1);
  assert.equal(tank.sprite.active, false);
  assert.equal(sounds.length, 1);
  for (const [type, texture] of [["normal", "zombie"], ["runner", "zombie-runner"]]) {
    const zombie = new Zombie(scene, 100, 200, type);
    assert.equal(zombie.sprite.key, texture);
    assert.equal(zombie.body.width, 32);
    assert.equal(zombie.body.height, 32);
    assert.equal(zombie.getHealthBarObjects()[0].y, 176);
  }
});
