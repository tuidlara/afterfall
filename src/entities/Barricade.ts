import Phaser from "phaser";
import { Obstacle } from "./Obstacle";

export default class Barricade {
  public obstacle: Obstacle;
  public visuals: Phaser.GameObjects.Rectangle[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number = 100,
    height: number = 30,
  ) {
    this.obstacle = new Obstacle(scene, x, y, width, height);
    this.obstacle.sprite.setVisible(false);

    // Base escura para representar a estrutura da barricada
    const base = scene.add.rectangle(
      x, y, width, height, 0x493626
    );

    base.setStrokeStyle(2, 0x241a12);
    this.visuals.push(base);

    // Tábuas de madeira sobrepostas
    const plankCount = Math.floor(width / 25);

    for (let i = 0; i < plankCount; i++) {
      const plankX = x - width / 2 + 12 + i * 25;

      const plank = scene.add.rectangle(
        plankX,
        y,
        23,
        height - 6,
        i % 2 === 0 ? 0x94643c : 0x76502f,
      );

      plank.setStrokeStyle(1, 0x392719);
      this.visuals.push(plank);
    }

    this.visuals.forEach((object) => object.setDepth(2));
  }
}
