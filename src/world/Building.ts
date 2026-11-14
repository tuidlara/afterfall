import Phaser from "phaser";
import { Obstacle } from "../entities/Obstacle";

export default class Building {
  public readonly obstacle: Obstacle;
  public readonly visuals: Phaser.GameObjects.GameObject[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    signColor: number,
  ) {
    this.obstacle = new Obstacle(scene, x, y, width, height);
    // A fachada substitui os visuais genéricos do obstáculo.
    this.obstacle.visuals.forEach((visual) => visual.setVisible(false));

    const rect = (px: number, py: number, w: number, h: number, color: number) => {
      const part = scene.add.rectangle(px, py, w, h, color).setDepth(2);
      this.visuals.push(part);
      return part;
    };

    rect(x + 8, y + 10, width + 12, height + 12, 0x111719);
    rect(x, y, width, height, 0x696457).setStrokeStyle(4, 0x292e2c);
    rect(x, y - 6, width - 16, height - 28, 0x3b4240);
    rect(x, y - height / 2 + 12, width - 12, 8, 0x777361);

    for (let offset = -width / 2 + 24; offset < width / 2 - 12; offset += 32) {
      rect(x + offset, y - 8, 2, height - 46, 0x303735);
    }
    rect(x - width / 4, y - 22, 48, 32, 0x55594d);
    rect(x - width / 4, y - 22, 32, 16, 0x262f2e);
    rect(x + width / 4, y + 8, 44, 28, 0x49463d);

    const front = y + height / 2;
    rect(x, front - 20, width - 20, 26, signColor);
    const sign = scene.add.text(x, front - 20, label, {
      fontFamily: "monospace",
      fontSize: "14px",
      fontStyle: "bold",
      color: "#d0c5a3",
    }).setOrigin(0.5).setDepth(3);
    this.visuals.push(sign);

    for (const side of [-1, 1]) {
      const windowX = x + side * width * 0.32;
      rect(windowX, front - 3, 42, 12, 0x172527);
      rect(windowX, front - 3, 48, 4, 0x85704c);
    }
    rect(x, front - 3, 28, 12, 0x211e1b);
    rect(x, front - 3, 34, 4, 0x8b7350);
  }
}
