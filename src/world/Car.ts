import Phaser from "phaser";
import { Obstacle } from "../entities/Obstacle";

export type CarType = "sedan" | "suv" | "pickup";

export default class Car {
  public obstacle: Obstacle;
  public visuals: Phaser.GameObjects.Rectangle[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: CarType = "sedan",
    color: number = 0x566b58,
  ) {
    const dimensions = {
      sedan: { width: 110, height: 54 },
      suv: { width: 120, height: 64 },
      pickup: { width: 130, height: 64 },
    };

    const { width, height } = dimensions[type];

    this.obstacle = new Obstacle(scene, x, y, width, height);
    this.obstacle.sprite.setVisible(false);

    const body = scene.add.rectangle(x, y, width, height, color);
    body.setStrokeStyle(3, 0x202629);
    this.visuals.push(body);

    // Posiciona as rodas nas laterais da carroceria
    const wheelPositions = [
      [x - width * 0.3, y - height / 2 + 3],
      [x + width * 0.3, y - height / 2 + 3],
      [x - width * 0.3, y + height / 2 - 3],
      [x + width * 0.3, y + height / 2 - 3],
    ];

    for (const [wx, wy] of wheelPositions) {
      const wheel = scene.add.rectangle(wx, wy, 22, 10, 0x151719);
      wheel.setStrokeStyle(1, 0x080909);
      this.visuals.push(wheel);
    }

    if (type === "sedan") {
      this.createSedan(scene, x, y);
    }

    if (type === "suv") {
      this.createSUV(scene, x, y);
    }

    if (type === "pickup") {
      this.createPickup(scene, x, y);
    }

    this.visuals.forEach((object) => object.setDepth(2));
  }

  private createSedan(scene: Phaser.Scene, x: number, y: number) {
    this.addPart(scene, x, y, 62, 38, 0x35483b);
    this.addPart(scene, x + 20, y, 22, 32, 0x718b91);
    this.addPart(scene, x - 20, y, 22, 32, 0x718b91);
    this.addPart(scene, x + 44, y, 18, 42, 0x35483b);
    this.addPart(scene, x - 44, y, 12, 42, 0x35483b);
  }

  private createSUV(scene: Phaser.Scene, x: number, y: number) {
    this.addPart(scene, x, y, 76, 48, 0x35483b);
    this.addPart(scene, x + 24, y, 22, 40, 0x718b91);
    this.addPart(scene, x - 24, y, 22, 40, 0x718b91);
    this.addPart(scene, x + 50, y, 12, 48, 0x35483b);
    this.addPart(scene, x - 50, y, 12, 48, 0x35483b);
  }

  private createPickup(scene: Phaser.Scene, x: number, y: number) {
    // Caçamba na parte traseira
    this.addPart(scene, x - 35, y, 48, 48, 0x414b43);

    // Cabine e vidros
    this.addPart(scene, x + 24, y, 42, 48, 0x35483b);
    this.addPart(scene, x + 34, y, 20, 38, 0x718b91);
    this.addPart(scene, x + 59, y, 10, 44, 0x35483b);
  }

  private addPart(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
  ) {
    const part = scene.add.rectangle(x, y, width, height, color);
    part.setStrokeStyle(2, 0x26343a);
    this.visuals.push(part);
  }
}
