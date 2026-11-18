import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));

function world() {
  let seed = 42;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const textures = new Set();
  const phaser = {
    Math: { Between: (min, max) => Math.floor(min + random() * (max - min + 1)),
      Clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
      Vector2: class { constructor(x, y) { this.x = x; this.y = y; } } },
    Utils: { Array: { GetRandom: (values) => values[Math.floor(random() * values.length)] } },
    Textures: { FilterMode: { NEAREST: 0 } },
  };
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    const source = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, esModuleInterop: false },
    }).outputText;
    cache.set(file, exports);
    vm.runInNewContext(source, { exports, Math, require: (name) => name === "phaser"
      ? { default: phaser } : load(resolve(dirname(file), `${name}.ts`)) });
    return exports;
  }
  function object(x = 0, y = 0, width = 0, height = 0) {
    return {
      x, y, width, height, active: true, visible: true,
      setDepth() { return this; }, setOrigin() { return this; }, setStrokeStyle() { return this; },
      setDisplaySize() { return this; }, setFilter() { return this; },
      setVisible(value) { this.visible = value; return this; },
      fillStyle() { return this; }, fillRect() {}, fillPoints() {}, lineStyle() {}, lineBetween() {},
      beginPath() {}, moveTo() {}, lineTo() {}, strokePath() {},
      generateTexture(key) { textures.add(key); }, clear() {}, destroy() { this.active = false; },
    };
  }
  const scene = {
    add: { graphics: object, rectangle: object, ellipse: object, text: object, image: object, tileSprite: object },
    physics: { add: { existing(sprite) { sprite.body = {}; } }, world: { setBounds() {} } },
    cameras: { main: { setBackgroundColor() {} } },
    textures: { exists: (key) => textures.has(key), get: object },
  };
  const GameMap = load(resolve(root, "src/world/Map.ts")).default;
  const map = new GameMap(scene);
  map.create();
  const fixed = [];
  const source = readFileSync(resolve(root, "src/scenes/GameScene.ts"), "utf8");
  const modules = { Car: "world/Car", Tree: "entities/Tree", UrbanDebris: "entities/UrbanDebris", Barricade: "entities/Barricade" };
  for (const match of source.matchAll(/new (Car|Tree|UrbanDebris|Barricade)\(this,\s*([^)]*)\)/g)) {
    const Prop = load(resolve(root, `src/${modules[match[1]]}.ts`)).default;
    const args = vm.runInNewContext(`[${match[2]}]`);
    fixed.push(new Prop(scene, ...args).obstacle.sprite);
  }
  fixed.push({ x: 1160, y: 1160, width: 64, height: 44, active: true });
  return { map, load, fixed };
}

const intersects = (a, b, padding = 0) => Math.abs(a.x - b.x) < (a.width + b.width) / 2 + padding
  && Math.abs(a.y - b.y) < (a.height + b.height) / 2 + padding;

test("district landmarks stay outside buildings and existing fixed props with all collisions inside the map", () => {
  const { map } = world();
  const buildings = map.buildings.map((building) => building.obstacle.sprite);
  const details = map.districtDetails.obstacles.map((obstacle) => obstacle.sprite);
  const fixed = [
    { x: 1000, y: 1000, width: 14, height: 14 },
    { x: 1160, y: 1160, width: 64, height: 44 },
    { x: 1500, y: 350, width: 120, height: 64 },
    { x: 1600, y: 1200, width: 130, height: 64 },
    ...[[1550, 2460], [1800, 2460], [1580, 2770], [1830, 2770], [2400, 300], [1820, 1820]]
      .map(([x, y]) => ({ x, y: y + 12, width: 26, height: 26 })),
  ];
  for (const detail of details) {
    for (const other of [...buildings, ...fixed]) assert(!intersects(detail, other),
      `prop at ${detail.x},${detail.y} overlaps ${other.x},${other.y}`);
  }
  for (const { sprite } of map.getObstacles()) {
    assert(sprite.x - sprite.width / 2 >= 0 && sprite.x + sprite.width / 2 <= 3000);
    assert(sprite.y - sprite.height / 2 >= 0 && sprite.y + sprite.height / 2 <= 3000);
  }
  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) assert(!intersects(buildings[i], buildings[j]));
  }
});

test("new districts preserve clear routes for the tank to streets and the player", () => {
  const { map, load, fixed } = world();
  const Pathfinding = load(resolve(root, "src/entities/ZombiePathfinding.ts")).default;
  Pathfinding.updateGrid([...map.getObstacles().map((obstacle) => obstacle.sprite), ...fixed]);
  for (const [x, y] of [[2460, 610], [2790, 749], [2760, 850], [1570, 2690], [1810, 2725], [1450, 1985], [1210, 365],
    [340, 680], [1654, 693], [398, 1420], [540, 1920], [1880, 1590], [1450, 1530], [2655, 1130], [290, 2780], [2480, 2020], [2530, 2900]]) {
    const path = Pathfinding.findPath(x, y, 1000, 1000);
    assert(path.length > 0, `no route from ${x},${y}`);
    const end = path.at(-1);
    assert(Math.hypot(end.x - 1000, end.y - 1000) < 48);
  }
});

test("city landmarks avoid existing structures, props and the starting position", () => {
  const { map, fixed } = world();
  const landmarks = map.cityLandmarks.obstacles.map((obstacle) => obstacle.sprite);
  const others = [
    ...map.buildings.map((building) => building.obstacle.sprite),
    ...map.abandonedSites.obstacles.map((obstacle) => obstacle.sprite),
    ...map.districtDetails.obstacles.map((obstacle) => obstacle.sprite),
    ...fixed, { x: 1000, y: 1000, width: 14, height: 14 },
  ];
  for (const landmark of landmarks) {
    for (const other of others) assert(!intersects(landmark, other),
      `landmark ${landmark.x},${landmark.y} overlaps existing prop ${other.x},${other.y}`);
  }
  const source = readFileSync(resolve(root, "src/scenes/GameScene.ts"), "utf8");
  assert(!/new Obstacle\(this,/.test(source), "temporary gray blocks should not return");
});
