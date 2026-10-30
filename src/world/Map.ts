import Phaser from "phaser";

class GameMap {
  private scene: Phaser.Scene;
  private graphics!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    this.scene.cameras.main.setBackgroundColor("#171b22");

    this.graphics = this.scene.add.graphics();
    this.graphics.lineStyle(1, 0x252c35, 0.8);

    for (let x = 0; x <= 2000; x += 64) {
      this.graphics.lineBetween(x, 0, x, 2000);
    }

    for (let y = 0; y <= 2000; y += 64) {
      this.graphics.lineBetween(0, y, 2000, y);
    }

    this.scene.physics.world.setBounds(0, 0, 2000, 2000);
  }

  getGraphics() {
    return this.graphics;
  }
}

export default GameMap;
