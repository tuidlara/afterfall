import Phaser from "phaser";
import { Obstacle } from "./Obstacle";

export default class Tree {
  public obstacle: Obstacle;
  public visuals: (
    | Phaser.GameObjects.Rectangle
    | Phaser.GameObjects.Ellipse
  )[] = [];
  constructor(scene: Phaser.Scene, x: number, y: number, size: number = 1) {
    const trunkSize = 18 * size;

    this.obstacle = new Obstacle(scene, x, y + 8 * size, trunkSize, trunkSize);

    this.obstacle.sprite.setVisible(false);

    const trunk = scene.add.rectangle(
      x,
      y + 8 * size,
      18 * size,
      25 * size,
      0x493525,
    );

    trunk.setStrokeStyle(2, 0x30251c);

    const canopyColors = [0x303e2b, 0x3d492f, 0x4b5033];

    const canopy = scene.add.ellipse(
      x,
      y - 5 * size,
      48 * size,
      42 * size,
      canopyColors[0],
    );

    canopy.setStrokeStyle(2, 0x252e22);

    const left = scene.add.ellipse(
      x - 12 * size,
      y - 3 * size,
      29 * size,
      32 * size,
      canopyColors[1],
    );

    const right = scene.add.ellipse(
      x + 11 * size,
      y - 7 * size,
      28 * size,
      30 * size,
      canopyColors[2],
    );

    this.visuals.push(trunk, canopy, left, right);

    this.visuals.forEach((visual) => visual.setDepth(2));
  }
}
