import Phaser from "phaser";
import { Obstacle } from "../entities/Obstacle";

export default class Car {
  public obstacle: Obstacle;
  public visuals: Phaser.GameObjects.Rectangle[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number = 0x566b58,
  ) {
    // O retângulo mantém as colisões e o pathfinding existentes
    this.obstacle = new Obstacle(scene, x, y, 110, 54);
    this.obstacle.sprite.setVisible(false);

    const body = scene.add.rectangle(x, y, 110, 54, color);
    body.setStrokeStyle(3, 0x202629);

    // Rodas
    const wheels = [
      [x - 32, y - 32],
      [x + 32, y - 32],
      [x - 32, y + 32],
      [x + 32, y + 32],
    ];

    for (const [wx, wy] of wheels) {
      const wheel = scene.add.rectangle(wx, wy, 22, 9, 0x151719);
      wheel.setStrokeStyle(1, 0x080909);
      this.visuals.push(wheel);
    }

    // Vidros
    const frontWindow = scene.add.rectangle(
      x + 20, y, 24, 38, 0x718b91
    );

    const rearWindow = scene.add.rectangle(
      x - 20, y, 24, 38, 0x718b91
    );

    frontWindow.setStrokeStyle(2, 0x26343a);
    rearWindow.setStrokeStyle(2, 0x26343a);

    // Detalhes da carroceria
    const hood = scene.add.rectangle(
      x + 43, y, 20, 42, 0x35483b
    );

    const trunk = scene.add.rectangle(
      x - 43, y, 12, 42, 0x35483b
    );

    this.visuals.push(body, frontWindow, rearWindow, hood, trunk);

    this.visuals.forEach((object) => object.setDepth(2));
  }
}
