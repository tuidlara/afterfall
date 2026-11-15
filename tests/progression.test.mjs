import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(file, imports = {}) {
  const exports = {};
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, esModuleInterop: false },
  });
  vm.runInNewContext(compiled.outputText, {
    exports,
    require: (name) => {
      if (!(name in imports)) throw new Error(`Unexpected import: ${name}`);
      return imports[name];
    },
  });
  return exports;
}

const progressionModule = load("../src/progression/RunProgression.ts");
const RunProgression = progressionModule.default;
const zombieConfig = load("../src/entities/ZombieTypes.ts").ZOMBIE_CONFIG;

test("first level requires 30 normal kills and preserves subsequent XP", () => {
  const run = new RunProgression();
  for (let i = 0; i < 29; i++) run.addXp(zombieConfig.normal.xp);
  assert.equal(run.level, 1);
  assert.equal(run.upgradePoints, 0);
  run.addXp(zombieConfig.normal.xp);
  assert.equal(run.level, 2);
  assert.equal(run.xp, 0);
  run.addXp(zombieConfig.runner.xp);
  assert.equal(run.xp, 8);
  assert.equal(run.xpToNextLevel, 250);
  assert.equal(run.upgradePoints, 1);
});

test("XP costs increase and multiple levels preserve pending choices", () => {
  const run = new RunProgression();
  run.addXp(410);
  assert.equal(run.level, 3);
  assert.equal(run.xp, 10);
  assert.equal(run.xpToNextLevel, 350);
  assert.equal(run.upgradePoints, 2);
  assert.equal(run.buyUpgrade("movement"), true);
  assert.equal(run.upgradePoints, 1);
});

test("an earned choice applies exactly one improvement", () => {
  const run = new RunProgression();
  assert.equal(run.buyUpgrade("magazine"), false);
  run.addXp(150);
  assert.equal(run.buyUpgrade("magazine"), true);
  assert.equal(run.magazineSize, 14);
  assert.equal(run.buyUpgrade("reload"), false);
  assert.equal(run.reloadDuration, 1500);
});

test("each improvement stops at rank three and capped choices disappear", () => {
  const run = new RunProgression();
  run.addXp(100000);
  assert.equal(run.level, 10);
  assert.equal(run.upgradePoints, 9);
  for (const id of ["magazine", "reload", "movement"]) {
    for (let i = 0; i < 3; i++) assert.equal(run.buyUpgrade(id), true);
    const pending = run.upgradePoints;
    assert.equal(run.buyUpgrade(id), false);
    assert.equal(run.upgradePoints, pending);
    assert.equal(run.getChoices().some((choice) => choice.id === id), false);
  }
  assert.equal(run.magazineSize, 18);
  assert.equal(run.reloadDuration, 1200);
  assert.equal(run.movementSpeed, 161);
  assert.equal(run.upgradePoints, 0);
  assert.equal(run.getChoices().length, 0);
  run.addXp(50000);
  assert.equal(run.level, 10);
  assert.equal(run.xp, 0);
  assert.equal(run.upgradePoints, 0);
});

test("invalid XP and upgrade IDs cannot change progression", () => {
  const run = new RunProgression();
  for (const xp of [NaN, Infinity, -10, 0]) run.addXp(xp);
  assert.equal(run.xp, 0);
  assert.equal(run.level, 1);
  run.addXp(150);
  assert.equal(run.buyUpgrade("__proto__"), false);
  assert.equal(run.buyUpgrade("unknown"), false);
  assert.equal(run.upgradePoints, 1);
});

test("a fresh run restores XP, level, pending choices and all base attributes", () => {
  const old = new RunProgression();
  old.addXp(10000);
  old.buyUpgrade("magazine");
  old.buyUpgrade("reload");
  old.buyUpgrade("movement");
  const fresh = new RunProgression();
  assert.equal(fresh.level, 1);
  assert.equal(fresh.xp, 0);
  assert.equal(fresh.upgradePoints, 0);
  assert.equal(fresh.magazineSize, 12);
  assert.equal(fresh.reloadDuration, 1500);
  assert.equal(fresh.movementSpeed, 140);
});

test("XP rewards follow zombie types", () => {
  assert.equal(zombieConfig.normal.xp, 5);
  assert.equal(zombieConfig.runner.xp, 8);
  assert.equal(zombieConfig.tank.xp, 12);
});

test("movement starts above runner speed and increases by 5% of base per rank", () => {
  const run = new RunProgression();
  assert.equal(run.movementSpeed, 140);
  assert(run.movementSpeed > zombieConfig.runner.speed);
  run.addXp(10000);
  for (const speed of [147, 154, 161]) {
    assert.equal(run.buyUpgrade("movement"), true);
    assert.equal(run.movementSpeed, speed);
  }
  assert.equal(run.buyUpgrade("movement"), false);
  assert.equal(run.movementSpeed, 161);
});

function gameScene() {
  const imports = { phaser: { default: {
    Scene: class {},
    Input: { Keyboard: { JustDown: () => false } },
    Math: { Vector2: class {
      constructor(x, y) { this.x = x; this.y = y; }
      normalize() { return this; }
    } },
  } } };
  const source = readFileSync(new URL("../src/scenes/GameScene.ts", import.meta.url), "utf8");
  for (const match of source.matchAll(/from "([^"]+)"/g)) {
    if (!(match[1] in imports)) imports[match[1]] = {};
  }
  imports["../progression/RunProgression"] = progressionModule;
  const GameScene = load("../src/scenes/GameScene.ts", imports).default;
  const game = new GameScene();
  game.input = { setDefaultCursor(cursor) { game.currentCursor = cursor; } };
  let data;
  let paused = false;
  game.player = { sprite: { x: 1160, y: 1210 }, body: { setVelocity(x, y) { assert.equal(x, 0); assert.equal(y, 0); } } };
  game.shop = { x: 1160, y: 1160, updatePrompt() {}, isInRange(player) { return Math.hypot(player.x - this.x, player.y - this.y) <= 96; } };
  game.wasd = Object.fromEntries(["W", "A", "S", "D"].map((key) => [key, { isDown: false }]));
  game.cursors = Object.fromEntries(["left", "right", "up", "down"].map((key) => [key, { isDown: false }]));
  game.zombieManager = { update() {}, getAll() { return []; }, getAliveCount() { return 1; } };
  game.scene = {
    launch(name, options) { assert.equal(name, "UpgradeScene"); data = options; },
    pause() { paused = true; },
  };
  game.ammoText = { setText(value) { this.value = value; } };
  game.xpText = { setText() {} };
  game.xpBar = { setDisplaySize() {} };
  game.shopText = { setText() {}, setColor() {} };
  return { game, get data() { return data; }, get paused() { return paused; } };
}

test("shop can be inspected without points and reports XP needed", () => {
  const harness = gameScene();
  harness.game.progression.addXp(25);
  harness.game.openShop();
  assert.equal(harness.paused, true);
  const state = harness.data.getState();
  assert.equal(state.upgradePoints, 0);
  assert.equal(state.choices.length, 3);
  assert.equal(state.xpToNextLevel - state.xp, 125);
  assert.equal(harness.data.onBuy("magazine"), false);
  harness.data.onClose();
  assert.equal(harness.game.choosingUpgrade, false);
});

test("shop only opens nearby and never opens just from gaining a level", () => {
  const harness = gameScene();
  harness.game.progression.addXp(150);
  harness.game.update();
  assert.equal(harness.game.choosingUpgrade, false);
  assert.equal(harness.paused, false);
  harness.game.player.sprite = { x: 1000, y: 1000 };
  harness.game.openShop();
  assert.equal(harness.data, undefined);
  assert.equal(harness.paused, false);
  assert.equal(harness.game.progression.upgradePoints, 1);
});

test("shop range and prompt follow the player's distance", () => {
  const obstacleModule = load("../src/entities/Obstacle.ts");
  const UpgradeShop = load("../src/world/UpgradeShop.ts", {
    "../entities/Obstacle": obstacleModule,
  }).default;
  function object(x, y, width, height) {
    return {
      x, y, width, height, visible: true,
      setDepth() { return this; }, setOrigin() { return this; }, setStrokeStyle() { return this; },
      setRotation() { return this; },
      setVisible(visible) { this.visible = visible; return this; },
      fillStyle() { return this; }, fillRect() { return this; },
    };
  }
  let bodies = 0;
  const scene = {
    add: { graphics: object, rectangle: object, text: object },
    physics: { add: { existing() { bodies++; } } },
  };
  const shop = new UpgradeShop(scene, 1160, 1160);
  assert.equal(bodies, 1);
  assert.equal(shop.obstacle.sprite.width, 64);
  assert.equal(shop.obstacle.sprite.height, 44);
  assert.equal(shop.isInRange({ x: 1160, y: 1256 }), true);
  assert.equal(shop.isInRange({ x: 1160, y: 1257 }), false);
  shop.updatePrompt({ x: 1000, y: 1000 });
  assert.equal(shop.visuals.at(-1).visible, false);
  shop.updatePrompt({ x: 1160, y: 1210 });
  assert.equal(shop.visuals.at(-1).visible, true);
});

test("purchase changes capacity without healing or refilling, and close keeps unused points", () => {
  const harness = gameScene();
  const { game } = harness;
  game.health = 35;
  game.ammo = 3;
  game.progression.addXp(400);
  game.openShop();
  assert.equal(harness.data.onBuy("magazine"), true);
  assert.equal(game.health, 35);
  assert.equal(game.ammo, 3);
  assert.equal(game.magazineSize, 14);
  assert.equal(game.ammoText.value, "MUNIÇÃO: 3 / 14");
  assert.equal(game.choosingUpgrade, true);
  assert.equal(harness.data.getState().upgradePoints, 1);
  harness.data.onClose();
  assert.equal(game.choosingUpgrade, false);
  assert.equal(game.progression.upgradePoints, 1);
  assert.equal(harness.data.onBuy("reload"), false);
});

test("purchase while reloading does not overwrite status or grant ammo", () => {
  const harness = gameScene();
  harness.game.ammo = 0;
  harness.game.reloading = true;
  harness.game.ammoText.value = "RECARREGANDO...";
  harness.game.progression.addXp(150);
  harness.game.openShop();
  harness.data.onBuy("reload");
  assert.equal(harness.game.ammo, 0);
  assert.equal(harness.game.reloading, true);
  assert.equal(harness.game.ammoText.value, "RECARREGANDO...");
  assert.equal(harness.game.progression.reloadDuration, 1400);
});

test("shop shows capped upgrades without offering values beyond their limits", () => {
  const run = new RunProgression();
  run.addXp(10000);
  for (let i = 0; i < 3; i++) run.buyUpgrade("magazine");
  assert.equal(run.getChoices().some((choice) => choice.id === "magazine"), false);
  const capped = run.getChoices(true).find((choice) => choice.id === "magazine");
  assert.equal(capped.rank, 3);
  assert.equal(capped.description, "Pente máximo: 18 balas.");
  const points = run.upgradePoints;
  assert.equal(run.buyUpgrade("magazine"), false);
  assert.equal(run.upgradePoints, points);
});

function shopMenu(run) {
  const objects = [];
  const keys = {};
  let stopped = 0;
  let resumed = 0;
  let closed = 0;
  const UpgradeScene = load("../src/scenes/UpgradeScene.ts", {
    phaser: { default: { Scene: class {} } },
  }).default;
  const menu = new UpgradeScene();
  function object(x, y, value) {
    const result = {
      x, y, value, handlers: {}, setOrigin() { return this; }, setStrokeStyle() { return this; },
      setFillStyle() { return this; }, setInteractive() { return this; },
      setText(value) { this.value = value; return this; }, setAlpha(value) { this.alpha = value; return this; },
      setWordWrapWidth() { return this; },
      on(name, callback) { this.handlers[name] = callback; return this; },
    };
    objects.push(result);
    return result;
  }
  menu.add = { text: object, rectangle: object };
  menu.input = { keyboard: { on(key, callback) { keys[key] = callback; } } };
  menu.scene = { stop() { stopped++; }, resume(name) { assert.equal(name, "GameScene"); resumed++; } };
  menu.create({
    getState: () => ({ level: run.level, xp: run.xp, xpToNextLevel: run.xpToNextLevel,
      upgradePoints: run.upgradePoints, choices: run.getChoices(true) }),
    onBuy: (id) => run.buyUpgrade(id), onClose: () => { closed++; },
  });
  const click = (x, y, button = 0) => objects.find((o) => o.x === x && o.y === y && o.handlers.pointerdown)
    .handlers.pointerdown({ button }, 0, 0, { stopPropagation() {} });
  return { keys, objects, click, get stopped() { return stopped; }, get resumed() { return resumed; }, get closed() { return closed; } };
}

test("shop requires selection plus confirmation and prevents repeated purchase from the same click", () => {
  const run = new RunProgression();
  run.addXp(400);
  const ui = shopMenu(run);
  ui.keys["keydown-ONE"]({ repeat: true });
  ui.keys["keydown-ENTER"]({ repeat: false });
  assert.equal(run.magazineSize, 12);
  ui.click(196, 290, 2);
  ui.click(655, 485);
  assert.equal(run.magazineSize, 12);
  ui.click(196, 290);
  assert.equal(run.magazineSize, 12);
  ui.click(655, 485);
  assert.equal(run.magazineSize, 14);
  assert.equal(run.upgradePoints, 1);
  ui.click(655, 485);
  assert.equal(run.magazineSize, 14);
  assert.equal(run.upgradePoints, 1);
  assert.equal(ui.resumed, 0);
  ui.keys["keydown-ESC"]({ repeat: false });
  ui.keys["keydown-ESC"]({ repeat: false });
  assert.equal(ui.closed, 1);
  assert.equal(ui.stopped, 1);
  assert.equal(ui.resumed, 1);
});

test("preview without points never grants an upgrade and displays missing XP", () => {
  const run = new RunProgression();
  run.addXp(25);
  const ui = shopMenu(run);
  ui.keys["keydown-ONE"]({ repeat: false });
  ui.click(655, 485);
  assert.equal(run.magazineSize, 12);
  assert.equal(run.upgradePoints, 0);
  assert(ui.objects.some((object) => String(object.value).includes("Faltam 125 XP")));
  ui.click(280, 485);
  assert.equal(ui.closed, 1);
});
