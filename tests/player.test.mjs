import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const exports = {};
const code = ts.transpileModule(readFileSync(new URL("../src/entities/Player.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, esModuleInterop: false },
}).outputText;
vm.runInNewContext(code, {
  exports,
  require: () => ({ default: {
    Math: { Clamp: (value, min, max) => Math.max(min, Math.min(max, value)) },
    Textures: { FilterMode: { NEAREST: 0 } },
    Scenes: { Events: { POST_UPDATE: "postupdate", SHUTDOWN: "shutdown" } },
  } }),
});
const Player = exports.default;

function harness() {
  const animations = new Map();
  const events = {
    handlers: [],
    on(event, callback, context) { this.handlers.push({ event, callback, context }); },
    once(event, callback) { this.handlers.push({ event, callback, once: true }); },
    off(event, callback, context) {
      this.handlers = this.handlers.filter((h) => !(h.event === event && h.callback === callback && h.context === context));
    },
    emit(event, ...args) {
      for (const handler of this.handlers.filter((h) => h.event === event)) {
        if (handler.once) this.handlers = this.handlers.filter((h) => h !== handler);
        handler.callback.apply(handler.context, args);
      }
    },
  };
  const scene = {
    events,
    textures: { get: () => ({ setFilter(value) { assert.equal(value, 0); } }) },
    anims: {
      exists: (key) => animations.has(key),
      generateFrameNumbers: (_key, { frames }) => Array.from(frames),
      create: (animation) => { animations.set(animation.key, animation); },
    },
    add: { sprite(x, y, texture, frame) {
      return {
        x, y, texture, frame, rotation: 0,
        setOrigin(x, y) { this.displayOriginX = x * 512; this.displayOriginY = y * 512; return this; },
        setDisplaySize(w, h) { this.scaleX = w / 512; this.scaleY = h / 512; return this; },
        setFrame(value) { this.frame = value; return this; },
        anims: { isPlaying: false, timeScale: 1, stop() { this.isPlaying = false; } },
        play(key) { this.anims.isPlaying = true; this.animationKey = key; },
      };
    } },
    physics: { add: { existing(sprite) {
      sprite.body = {
        velocity: { x: 0, y: 0 },
        setSize(w, h) {
          this.sourceWidth = w; this.sourceHeight = h;
          this.width = w * sprite.scaleX; this.height = h * sprite.scaleY;
        },
        setOffset(x, y) { this.offset = { x, y }; },
        setCollideWorldBounds(value) { this.collideWorldBounds = value; },
      };
    } } },
  };
  const player = new Player(scene, 100, 200);
  return { player, scene, animations };
}

test("walking sheet has six square cells and a reusable animation definition", () => {
  const png = readFileSync(new URL("../public/assets/player-walk-v2.png", import.meta.url));
  assert.equal(png.readUInt32BE(16), Player.FRAME_SIZE * 3);
  assert.equal(png.readUInt32BE(20), Player.FRAME_SIZE * 2);
  const { scene, animations } = harness();
  new Player(scene, 300, 400);
  assert.equal(animations.size, 1);
  assert.deepEqual(Array.from(animations.get("player-walk").frames), [1, 2, 0, 4, 5, 3]);
  assert.equal(animations.get("player-walk").repeat, -1);
});

test("new frame resolution preserves the old centered world collision", () => {
  const { player } = harness();
  const { sprite, body } = player;
  assert.equal(body.width, 13.5);
  assert.equal(body.height, 13.5);
  assert.equal((body.offset.x + body.sourceWidth / 2 - sprite.displayOriginX) * sprite.scaleX, 0);
  assert.equal((body.offset.y + body.sourceHeight / 2 - sprite.displayOriginY) * sprite.scaleY, 0);
  assert.equal(body.collideWorldBounds, true);
});

test("real movement starts walking and stops at a wall even if movement is still requested", () => {
  const { player, scene } = harness();
  player.body.velocity.x = 140;
  player.sprite.x += 140 / 60;
  player.sprite.rotation = 1.4;
  scene.events.emit("postupdate", 0, 1000 / 60);
  assert.equal(player.sprite.anims.isPlaying, true);
  assert.equal(player.sprite.animationKey, "player-walk");
  assert(Math.abs(player.sprite.anims.timeScale - 1) < 1e-10);
  assert.equal(player.sprite.rotation, 1.4);
  scene.events.emit("postupdate", 1000 / 60, 1000 / 60);
  assert.equal(player.sprite.anims.isPlaying, false);
  assert.equal(player.sprite.frame, 0);
});

test("walking follows actual speed on diagonals and returns to idle on release", () => {
  const { player, scene } = harness();
  const diagonal = 161 / Math.sqrt(2);
  player.body.velocity = { x: diagonal, y: diagonal };
  player.sprite.x += diagonal / 60;
  player.sprite.y += diagonal / 60;
  scene.events.emit("postupdate", 0, 1000 / 60);
  assert(Math.abs(player.sprite.anims.timeScale - 1.15) < 1e-10);
  player.body.velocity = { x: 0, y: 0 };
  player.sprite.x += 1;
  scene.events.emit("postupdate", 1000 / 60, 1000 / 60);
  assert.equal(player.sprite.anims.isPlaying, false);
  assert.equal(player.sprite.frame, 0);
});

test("muzzle stays anchored across all frames in the four aiming directions", () => {
  const { player } = harness();
  for (const [angle, dx, dy] of [
    [0, 8.34375, 8.8125], [Math.PI / 2, -8.8125, 8.34375],
    [Math.PI, -8.34375, -8.8125], [-Math.PI / 2, 8.8125, -8.34375],
  ]) {
    player.sprite.rotation = angle + Math.PI / 2;
    for (let frame = 0; frame < 6; frame++) {
      player.sprite.setFrame(frame);
      const muzzle = player.getMuzzlePosition();
      assert(Math.abs(muzzle.x - (100 + dx)) < 1e-10);
      assert(Math.abs(muzzle.y - (200 + dy)) < 1e-10);
    }
  }
});

test("restarting removes old animation listeners", () => {
  const { scene } = harness();
  assert.equal(scene.events.handlers.filter((h) => h.event === "postupdate").length, 1);
  scene.events.emit("shutdown");
  assert.equal(scene.events.handlers.length, 0);
  new Player(scene, 100, 200);
  assert.equal(scene.events.handlers.filter((h) => h.event === "postupdate").length, 1);
});
