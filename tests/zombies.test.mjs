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
  const animations = new Map();
  const handlers = [];
  const events = {
    on(event, callback, context) { handlers.push({ event, callback, context }); },
    off(event, callback, context) {
      const index = handlers.findIndex((h) => h.event === event && h.callback === callback && h.context === context);
      if (index >= 0) handlers.splice(index, 1);
    },
    emit(event, ...args) {
      for (const h of [...handlers].filter((h) => h.event === event)) h.callback.apply(h.context, args);
    },
  };
  function object(x, y, key) {
    return {
      x, y, key, active: true, tint: null, scaleX: 1, scaleY: 1,
      setDisplaySize(w, h) { this.scaleX = w / 512; this.scaleY = h / 512; return this; },
      setDepth() { return this; }, setOrigin() { return this; }, setFillStyle() { return this; },
      setRotation(angle) { this.rotation = angle; return this; },
      setPosition(x, y) { this.x = x; this.y = y; return this; },
      setTint(color) { this.tint = color; return this; }, clearTint() { this.tint = null; },
      setFrame(frame) { this.frame = frame; return this; },
      anims: { isPlaying: false, timeScale: 1, stop() { this.isPlaying = false; } },
      play(animation) { this.animation = animation; this.anims.isPlaying = true; return this; },
      once(_event, callback) { this.onDestroy = callback; return this; },
      destroy() { this.active = false; this.onDestroy?.(); }, explode() {},
    };
  }
  const scene = {
    events,
    textures: { get: () => ({ setFilter() {} }) },
    anims: {
      exists: (key) => animations.has(key),
      create: (animation) => animations.set(animation.key, animation),
      generateFrameNumbers: (_key, { start, end }) => Array.from({ length: end - start + 1 }, (_, i) => start + i),
    },
    add: { sprite: object, rectangle: object, particles: object },
    physics: { add: { existing(sprite) {
      sprite.body = {
        velocity: { x: 0, y: 0 },
        setVelocity(x, y) { this.velocity = { x, y }; },
        setCollideWorldBounds() {},
        setSize(w, h) { this.width = w * sprite.scaleX; this.height = h * sprite.scaleY; },
        setMaxVelocity(x, y) { this.maxX = x; this.maxY = y; },
      };
    } } },
    time: { now: 0, delayedCall(delay, callback) { timers.push({ delay, callback }); } },
    sound: { play(key) { sounds.push(key); } },
  };
  const Zombie = load("../src/entities/Zombie.ts", {
    phaser: { default: {
      Textures: { FilterMode: { NEAREST: 0 } },
      Scenes: { Events: { POST_UPDATE: "postupdate" } },
      GameObjects: { Events: { DESTROY: "destroy" } },
      Math: { Clamp: (value, min, max) => Math.max(min, Math.min(max, value)), Distance: {
      Between: (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by),
    } } } },
    "./ZombiePathfinding": { default: { updateGrid() {}, lineClear() { return true; } } },
    "./ZombieTypes": config,
  }).default;
  return { scene, timers, sounds, Zombie, animations, handlers };
}

test("common zombie walk uses six frames, preserves collision and only runs during real movement", () => {
  const { scene, Zombie, animations } = zombieScene();
  const png = readFileSync(new URL("../public/assets/zombie-walk.png", import.meta.url));
  assert.equal(png.readUInt32BE(16), Zombie.FRAME_SIZE * 3);
  assert.equal(png.readUInt32BE(20), Zombie.FRAME_SIZE * 2);
  const zombie = new Zombie(scene, 100, 200);
  new Zombie(scene, 400, 200);
  assert.equal(animations.size, 1);
  assert.deepEqual(Array.from(animations.get("zombie-walk").frames), [0, 1, 2, 3, 4, 5]);
  assert.equal(zombie.body.width, 32);
  assert.equal(zombie.body.height, 32);
  zombie.follow({ x: 100, y: 500 });
  const rotation = zombie.sprite.rotation;
  zombie.sprite.y += 80 / 60;
  scene.events.emit("postupdate", 0, 1000 / 60);
  assert.equal(zombie.sprite.anims.isPlaying, true);
  assert.equal(zombie.sprite.animation.key, "zombie-walk");
  assert(Math.abs(zombie.sprite.anims.timeScale - 1) < 1e-10);
  assert.equal(zombie.sprite.rotation, rotation);
  scene.events.emit("postupdate", 16, 1000 / 60);
  assert.equal(zombie.sprite.anims.isPlaying, false);
  assert.equal(zombie.sprite.frame, 0);
  zombie.sprite.x += 2;
  zombie.body.setVelocity(0, 0);
  scene.events.emit("postupdate", 32, 1000 / 60);
  assert.equal(zombie.sprite.anims.isPlaying, false);
});

test("walk listeners for every type disappear on death and scene teardown", () => {
  const { scene, Zombie, handlers } = zombieScene();
  const zombie = new Zombie(scene, 100, 200);
  const second = new Zombie(scene, 300, 200);
  const runner = new Zombie(scene, 400, 200, "runner");
  const tank = new Zombie(scene, 500, 200, "tank");
  assert.equal(handlers.length, 4);
  zombie.takeDamage(3);
  assert.equal(handlers.length, 3);
  runner.takeDamage(2);
  assert.equal(handlers.length, 2);
  tank.takeDamage(7);
  assert.equal(handlers.length, 1);
  second.sprite.destroy();
  assert.equal(handlers.length, 0);
});

test("runner has its own faster cycle, keeps its stats and stops animating at walls", () => {
  const { scene, Zombie, animations } = zombieScene();
  const png = readFileSync(new URL("../public/assets/zombie-runner-walk.png", import.meta.url));
  assert.equal(png.readUInt32BE(16), Zombie.FRAME_SIZE * 3);
  assert.equal(png.readUInt32BE(20), Zombie.FRAME_SIZE * 2);
  const runner = new Zombie(scene, 100, 200, "runner");
  new Zombie(scene, 400, 200, "runner");
  new Zombie(scene, 500, 200, "normal");
  assert.equal(animations.size, 2);
  assert.equal(animations.get("zombie-runner-walk").frameRate, 10);
  assert.equal(animations.get("zombie-walk").frameRate, 6);
  assert.deepEqual(Array.from(animations.get("zombie-runner-walk").frames), [0, 1, 2, 3, 4, 5]);
  assert.equal(runner.body.width, 32);
  assert.equal(runner.body.height, 32);
  assert.equal(runner.speed, 120);
  assert.equal(runner.damage, 15);
  assert.equal(runner.maxHealth, 2);
  const diagonal = 120 / Math.sqrt(2);
  runner.body.setVelocity(diagonal, diagonal);
  runner.sprite.x += diagonal / 60;
  runner.sprite.y += diagonal / 60;
  scene.events.emit("postupdate", 0, 1000 / 60);
  assert.equal(runner.sprite.animation.key, "zombie-runner-walk");
  assert(Math.abs(runner.sprite.anims.timeScale - 1) < 1e-10);
  runner.sprite.x += diagonal / 120;
  runner.sprite.y += diagonal / 120;
  scene.events.emit("postupdate", 16, 1000 / 60);
  assert(Math.abs(runner.sprite.anims.timeScale - 0.5) < 1e-10);
  scene.events.emit("postupdate", 32, 1000 / 60);
  assert.equal(runner.sprite.anims.isPlaying, false);
  assert.equal(runner.sprite.frame, 0);
});

test("all zombie types face the player from every direction without rotating health bars", () => {
  const { scene, Zombie } = zombieScene();
  for (const type of ["normal", "runner", "tank"]) {
    const zombie = new Zombie(scene, 100, 200, type);
    for (const [dx, dy] of [[0, 100], [0, -100], [100, 0], [-100, 0],
      [100, 100], [-100, 100], [100, -100], [-100, -100]]) {
      zombie.follow({ x: 100 + dx, y: 200 + dy });
      const facing = zombie.sprite.rotation + Math.PI / 2;
      assert(Math.abs(Math.cos(facing) - dx / Math.hypot(dx, dy)) < 1e-10);
      assert(Math.abs(Math.sin(facing) - dy / Math.hypot(dx, dy)) < 1e-10);
      assert(zombie.body.velocity.x * dx + zombie.body.velocity.y * dy > 0);
      assert.equal(zombie.body.width, type === "tank" ? 36 : 32);
      zombie.updateHealthBar();
      for (const bar of zombie.getHealthBarObjects()) {
        assert.equal(bar.rotation, undefined);
        assert.equal(bar.y, 200 - (type === "tank" ? 36 : 24));
      }
    }
    const rotation = zombie.sprite.rotation;
    zombie.follow({ x: 100, y: 200 });
    assert.equal(zombie.sprite.rotation, rotation);
  }
});

test("all zombies settle in contact instead of crossing a stationary player and resume chasing on escape", () => {
  const { scene, Zombie } = zombieScene();
  for (const type of ["normal", "runner", "tank"]) {
    for (const [dx, dy] of [[100, 0], [-100, 0], [0, 100], [0, -100], [100, 100]]) {
      const zombie = new Zombie(scene, 500 + dx, 500 + dy, type);
      const target = { x: 500, y: 500 };
      for (let frame = 0; frame < 600; frame++) {
        zombie.follow(target);
        zombie.sprite.x += zombie.body.velocity.x / 60;
        zombie.sprite.y += zombie.body.velocity.y / 60;
        scene.events.emit("postupdate", frame * 1000 / 60, 1000 / 60);
      }
      const { x, y, rotation } = zombie.sprite;
      const distance = Math.hypot(x - target.x, y - target.y);
      assert(distance > 0);
      assert(distance <= zombie.body.width / 2);
      assert.equal(zombie.body.velocity.x, 0);
      assert.equal(zombie.body.velocity.y, 0);
      assert.equal(zombie.sprite.anims.isPlaying, false);
      for (let frame = 0; frame < 120; frame++) zombie.follow(target);
      assert.equal(zombie.sprite.x, x);
      assert.equal(zombie.sprite.y, y);
      assert.equal(zombie.sprite.rotation, rotation);
      target.x += 100;
      zombie.follow(target);
      assert(zombie.body.velocity.x > 0);
      zombie.sprite.destroy();
    }
    const overlapping = new Zombie(scene, 500, 500, type);
    overlapping.body.setVelocity(50, -50);
    overlapping.follow({ x: 500, y: 500 });
    assert.equal(overlapping.body.velocity.x, 0);
    assert.equal(overlapping.body.velocity.y, 0);
    overlapping.sprite.destroy();
  }
});

test("tank walks with a separate slow cycle and stops at walls or contact without changing its facing", () => {
  const { scene, Zombie, animations } = zombieScene();
  const png = readFileSync(new URL("../public/assets/zombie-tank-walk.png", import.meta.url));
  assert.equal(png.readUInt32BE(16), Zombie.FRAME_SIZE * 3);
  assert.equal(png.readUInt32BE(20), Zombie.FRAME_SIZE * 2);
  const tank = new Zombie(scene, 100, 200, "tank");
  new Zombie(scene, 400, 200, "tank");
  assert.equal(animations.size, 1);
  const cycle = animations.get("zombie-tank-walk");
  assert.equal(cycle.frameRate, 4);
  assert.equal(cycle.repeat, -1);
  assert.deepEqual(Array.from(cycle.frames), [0, 1, 2, 3, 4, 5]);
  tank.follow({ x: 400, y: 500 });
  const rotation = tank.sprite.rotation;
  const diagonal = 70 / Math.sqrt(2);
  tank.body.setVelocity(diagonal, diagonal);
  tank.sprite.x += diagonal / 60;
  tank.sprite.y += diagonal / 60;
  scene.events.emit("postupdate", 0, 1000 / 60);
  assert.equal(tank.sprite.animation.key, "zombie-tank-walk");
  assert.equal(tank.sprite.anims.isPlaying, true);
  assert(Math.abs(tank.sprite.anims.timeScale - 1) < 1e-10);
  assert.equal(tank.sprite.rotation, rotation);
  scene.events.emit("postupdate", 16, 1000 / 60);
  assert.equal(tank.sprite.anims.isPlaying, false);
  assert.equal(tank.sprite.frame, 0);
  tank.sprite.x += 1;
  tank.body.setVelocity(0, 0);
  scene.events.emit("postupdate", 32, 1000 / 60);
  assert.equal(tank.sprite.anims.isPlaying, false);
});

test("tank uses its sprite, larger collision, existing stats and restores natural colors after hits", () => {
  const { scene, timers, Zombie } = zombieScene();
  const tank = new Zombie(scene, 100, 200, "tank");
  assert.equal(tank.sprite.key, "zombie-tank");
  assert.equal(tank.body.width, 36);
  assert.equal(tank.body.height, 36);
  assert.equal(tank.speed, 70);
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
