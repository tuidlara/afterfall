import Phaser from "phaser";
import { Obstacle } from "./Obstacle";

export default class Barricade {
  public obstacle: Obstacle;
  public visuals: Phaser.GameObjects.GameObject[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number = 100,
    height: number = 30,
  ) {
    this.obstacle = new Obstacle(scene, x, y, width, height);
    this.obstacle.sprite.setVisible(false);
    this.obstacle.visuals.forEach((visual) => visual.setVisible(false));

    const shadow = scene.add.graphics().setDepth(-1);
    shadow.fillStyle(0x14201b, 0.6);
    shadow.fillRect(x - width / 2 + 5, y - height / 2 + 6, width, height);
    const wood = scene.add.graphics().setDepth(2);
    const rect = (px: number, py: number, w: number, h: number, color: number) => {
      wood.fillStyle(color);
      wood.fillRect(x + px, y + py, w, h);
    };
    for (const px of [-width / 2 + 12, width / 2 - 20]) {
      rect(px, -height / 2 - 2, 8, height + 4, 0x3f4936);
      rect(px + 1, -height / 2 - 2, 2, height, 0x8b7d58);
      rect(px - 5, height / 2 - 2, 18, 4, 0x35402e);
    }
    rect(-width / 2, -height / 2 + 3, width, 9, 0x7c6948);
    rect(-width / 2 + 2, -height / 2 + 3, width - 5, 2, 0xb29a6b);
    rect(-width / 2 + 3, height / 2 - 11, width - 6, 8, 0x62593f);
    rect(-width / 2 + 5, height / 2 - 11, width - 10, 1, 0x9a895e);
    wood.fillStyle(0x887751);
    wood.fillPoints([
      new Phaser.Math.Vector2(x - width / 2 + 15, y + height / 2 - 4),
      new Phaser.Math.Vector2(x + width / 2 - 15, y - height / 2 + 1),
      new Phaser.Math.Vector2(x + width / 2 - 13, y - height / 2 + 6),
      new Phaser.Math.Vector2(x - width / 2 + 13, y + height / 2 + 1),
    ], true);
    for (const px of [-width / 2 + 14, width / 2 - 18]) {
      rect(px, -height / 2 + 6, 2, 2, 0xc3bb95);
      rect(px, height / 2 - 8, 2, 2, 0xaaa784);
    }
    rect(width / 2 - 9, -height / 2 + 5, 6, 3, 0x4a5038);
    rect(-width / 2 + 25, height / 2 - 6, 13, 1, 0x383e2b);
    this.visuals.push(shadow, wood);
  }
}
