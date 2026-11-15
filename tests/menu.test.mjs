import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(file, imports) {
  const exports = {};
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, esModuleInterop: false },
  });
  vm.runInNewContext(compiled.outputText, {
    exports, require: (name) => {
      if (!(name in imports)) throw new Error(`Unexpected import: ${name}`);
      return imports[name];
    },
  });
  return exports;
}

function menu() {
  const objects = [];
  const keys = {};
  const starts = [];
  let fadeComplete;
  let fades = 0;
  const MenuScene = load("../src/scenes/MenuScene.ts", { phaser: { default: {
    Scene: class {}, Cameras: { Scene2D: { Events: { FADE_OUT_COMPLETE: "fadecomplete" } } },
  } } }).default;
  function object(x, y, value) {
    const result = {
      x, y, value, visible: true, handlers: {}, depth: 0,
      fillStyle() { return this; }, fillRect() { return this; },
      setFontStyle() { return this; }, setLineSpacing() { return this; }, setAlign() { return this; },
      setOrigin(x, y) { this.origin = [x, y]; return this; },
      setVisible(value) { this.visible = value; return this; }, setDepth(value) { this.depth = value; return this; },
      setInteractive() { return this; }, setFillStyle() { return this; }, setStrokeStyle() { return this; },
      on(event, callback) { this.handlers[event] = callback; return this; },
    };
    objects.push(result);
    return result;
  }
  const scene = new MenuScene();
  scene.add = { graphics: object, rectangle: object, text: object };
  scene.input = { keyboard: { on: (key, callback) => { keys[key] = callback; } } };
  scene.scene = { start: (key) => starts.push(key) };
  scene.cameras = { main: {
    setBackgroundColor() {}, once(_event, callback) { fadeComplete = callback; },
    fadeOut(duration) { assert.equal(duration, 220); fades++; },
  } };
  scene.create();
  return {
    objects, keys, starts,
    get fades() { return fades; },
    completeFade() { const callback = fadeComplete; fadeComplete = undefined; callback?.(); },
    click(x, y, button = 0) {
      objects.find((o) => o.x === x && o.y === y && o.handlers.pointerdown)
        .handlers.pointerdown({ button }, 0, 0, { stopPropagation() {} });
    },
  };
}

test("menu waits for input and shows developer credit in the corner", () => {
  const ui = menu();
  assert.equal(ui.starts.length, 0);
  assert.equal(ui.fades, 0);
  assert(ui.objects.some((object) => object.value === "AFTERFALL"));
  const credit = ui.objects.find((object) => object.value === "Desenvolvido por\nArthur de Lara Zilli");
  assert.equal(credit.x, 930);
  assert.equal(credit.y, 548);
  assert.deepEqual(credit.origin, [1, 0]);
});

test("starting requires left click or Enter and only launches gameplay once", () => {
  const ui = menu();
  ui.click(234, 318, 2);
  ui.keys["keydown-ENTER"]({ repeat: true });
  assert.equal(ui.fades, 0);
  ui.click(234, 318);
  ui.keys["keydown-ENTER"]({ repeat: false });
  ui.click(234, 318);
  assert.equal(ui.fades, 1);
  assert.equal(ui.starts.length, 0);
  ui.completeFade();
  ui.completeFade();
  assert.deepEqual(ui.starts, ["GameScene"]);
});

test("controls can be read and closed without accidentally starting gameplay", () => {
  const ui = menu();
  ui.click(234, 386);
  assert(ui.objects.filter((object) => object.depth === 10).every((object) => object.visible));
  ui.keys["keydown-ENTER"]({ repeat: false });
  ui.click(234, 318);
  assert.equal(ui.fades, 0);
  ui.keys["keydown-ESC"]();
  assert(ui.objects.filter((object) => object.depth === 10).every((object) => !object.visible));
  ui.keys["keydown-ENTER"]({ repeat: false });
  assert.equal(ui.fades, 1);
});

test("application boots into menu and keeps gameplay and shop scenes registered", () => {
  class MenuScene {}
  class GameScene {}
  class UpgradeScene {}
  let config;
  load("../src/main.ts", {
    phaser: { default: { AUTO: 0, Game: class { constructor(value) { config = value; } } } },
    "./style.css": {},
    "./scenes/MenuScene": { default: MenuScene },
    "./scenes/GameScene": { default: GameScene },
    "./scenes/UpgradeScene": { default: UpgradeScene },
  });
  assert.equal(config.scene[0], MenuScene);
  assert.equal(config.scene[1], GameScene);
  assert.equal(config.scene[2], UpgradeScene);
});

test("game over offers return to menu while preserving direct restart", () => {
  const source = readFileSync(new URL("../src/scenes/GameScene.ts", import.meta.url), "utf8");
  const imports = {};
  for (const match of source.matchAll(/from "([^"]+)"/g)) imports[match[1]] = {};
  imports.phaser = { default: { Scene: class {} } };
  imports["../progression/RunProgression"] = load("../src/progression/RunProgression.ts", {});
  const GameScene = load("../src/scenes/GameScene.ts", imports).default;
  const game = new GameScene();
  const texts = [];
  let nextScene;
  let restarts = 0;
  let ignored = [];
  function object(_x, _y, value) {
    const result = {
      value, handlers: {},
      setOrigin() { return this; }, setInteractive() { return this; }, setTint() {},
      setStyle() {}, setColor() {}, setDisplaySize() {}, setFillStyle() {}, setText() {},
      on(event, callback) { this.handlers[event] = callback; return this; },
    };
    texts.push(result);
    return result;
  }
  game.add = { text: object, rectangle: object };
  game.healthBar = object();
  game.healthText = object();
  game.player = { sprite: object(), body: { setVelocity() {} } };
  game.time = { delayedCall() {} };
  game.physics = { pause() {} };
  game.zombieManager = { getCurrentWave: () => 5 };
  game.cameras = { main: { ignore: (objects) => { ignored = objects; } } };
  game.scene = { start: (key) => { nextScene = key; }, restart: () => { restarts++; } };
  game.takeDamage(100);
  const back = texts.find((text) => text.value === "VOLTAR AO MENU");
  assert(ignored.includes(back));
  back.handlers.pointerdown();
  assert.equal(nextScene, "MenuScene");
  texts.find((text) => text.value === "REINICIAR PARTIDA").handlers.pointerdown();
  assert.equal(restarts, 1);
});
