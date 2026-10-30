import Phaser from "phaser";

class GameMap {
  private scene: Phaser.Scene;
  private graphics!: Phaser.GameObjects.Graphics;
  private ground!: Phaser.GameObjects.Graphics;
  private cracks!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    this.scene.cameras.main.setBackgroundColor("#252a2e");

    this.ground = this.scene.add.graphics();

    const groundColors = [0x292e32, 0x2d3236, 0x272c30, 0x303438, 0x252a2e];

    // Varia o tom do asfalto para evitar um chão uniforme
    for (let x = 0; x < 2000; x += 64) {
      for (let y = 0; y < 2000; y += 64) {
        const color = Phaser.Utils.Array.GetRandom(groundColors);

        this.ground.fillStyle(color, 1);
        this.ground.fillRect(x, y, 64, 64);
      }
    }

    // Adiciona pequenas marcas e rachaduras no asfalto
    this.cracks = this.scene.add.graphics();

    this.cracks.lineStyle(2, 0x171c20, 0.55);

    for (let i = 0; i < 45; i++) {
      const x = Phaser.Math.Between(30, 1970);
      const y = Phaser.Math.Between(30, 1970);
      const length = Phaser.Math.Between(8, 24);

      this.cracks.beginPath();
      this.cracks.moveTo(x, y);
      this.cracks.lineTo(x + length, y + Phaser.Math.Between(-8, 8));
      this.cracks.lineTo(
        x + length + Phaser.Math.Between(4, 12),
        y + Phaser.Math.Between(8, 16),
      );
      this.cracks.strokePath();
    }

    this.graphics = this.scene.add.graphics();
    this.graphics.lineStyle(1, 0x1d2328, 0.35);

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

  getWorldObjects() {
    return [this.ground, this.cracks];
  }
}

export default GameMap;
