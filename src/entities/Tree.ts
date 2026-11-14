import Phaser from "phaser";
import { Obstacle } from "./Obstacle";

export default class Tree {
  public obstacle: Obstacle;
  public visuals: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, size: number = 1) {
    const trunkSize = 18 * size;

    this.obstacle = new Obstacle(scene, x, y + 8 * size, trunkSize, trunkSize);

    this.obstacle.sprite.setVisible(false);
    this.obstacle.visuals.forEach((visual) => visual.setVisible(false));

    const variant = Math.abs(Math.floor(x * 7 + y * 13)) % 3;
    const texture = Tree.createTexture(scene, variant);
    const shadow = scene.add.graphics().setDepth(-1);
    shadow.fillStyle(0x0b1312, 0.28);
    shadow.fillRect(x - 20 * size, y + 4 * size, 46 * size, 18 * size);
    shadow.fillRect(x - 12 * size, y, 32 * size, 28 * size);

    const crown = scene.add.image(x, y - 6 * size, texture)
      .setDisplaySize(56 * size, 56 * size)
      .setDepth(2);

    this.visuals.push(shadow, crown);
  }

  private static createTexture(scene: Phaser.Scene, variant: number) {
    const key = `tree-crown-${variant}`;
    if (scene.textures.exists(key)) return key;

    const graphics = scene.add.graphics();
    const palettes = [
      [0x1d2925, 0x2b3b2e, 0x3b5037, 0x506341, 0x71805a],
      [0x242b23, 0x36402b, 0x4b5335, 0x626c45, 0x858359],
      [0x1c2a28, 0x2b3d35, 0x3d5340, 0x536b4b, 0x738465],
    ];
    const palette = palettes[variant]!;
    const pixel = (x: number, y: number, color: number) => {
      graphics.fillStyle(color);
      graphics.fillRect(x * 2, y * 2, 2, 2);
    };

    graphics.fillStyle(0x29251e);
    graphics.fillRect(22, 30, 12, 20);
    graphics.fillRect(18, 46, 20, 4);
    graphics.fillStyle(0x63523a);
    graphics.fillRect(26, 32, 4, 16);
    graphics.fillStyle(0x89704a);
    graphics.fillRect(26, 38, 2, 6);

    const clusters = [
      [8, 10, 6, 6], [14, 6, 6, 5], [20, 10, 5, 6],
      [7, 16, 5, 5], [14, 14, 7, 7], [20, 17, 5, 5],
    ];
    // Mesmo desenho por variante, inclusive após reiniciar a partida.
    const noise = (x: number, y: number) => {
      const hash = Math.imul(x + 31 + variant * 43, 374761393)
        ^ Math.imul(y + 17, 668265263);
      return (hash ^ (hash >>> 13)) >>> 0;
    };
    const inside = (x: number, y: number) => clusters.some(([cx, cy, rx, ry], index) => {
      const shift = variant === 1 && index % 2 === 0 ? 1 : 0;
      const distance = ((x - cx - shift) / rx) ** 2 + ((y - cy) / ry) ** 2;
      return distance < 0.85 + (noise(x, y) % 5) * 0.05;
    });

    for (let y = 1; y < 24; y++) {
      for (let x = 1; x < 27; x++) {
        if (!inside(x, y)) continue;
        const edge = !inside(x - 1, y) || !inside(x + 1, y)
          || !inside(x, y - 1) || !inside(x, y + 1);
        const grain = noise(Math.floor(x / 2), Math.floor(y / 2));
        const shade = edge ? 0 : Math.min(4, 1 + (grain % 3) + (x < 14 && y < 12 ? 1 : 0));
        pixel(x, y, palette[shade]!);
      }
    }

    for (const [x, y] of [[13, 17], [14, 18], [14, 19], [15, 20], [11, 15]]) {
      pixel(x, y, 0x4e4632);
    }
    graphics.generateTexture(key, 56, 56);
    graphics.destroy();
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    return key;
  }
}
