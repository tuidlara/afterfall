import Phaser from "phaser";

class GameMap {
  private scene: Phaser.Scene;
  private graphics!: Phaser.GameObjects.Graphics;
  private ground!: Phaser.GameObjects.Graphics;
  private cracks!: Phaser.GameObjects.Graphics;
  private debris!: Phaser.GameObjects.Graphics;
  private grass!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    this.scene.cameras.main.setBackgroundColor("#252a2e");

    this.ground = this.scene.add.graphics();

    const groundColors = [0x292e32, 0x2d3236, 0x272c30, 0x303438, 0x252a2e];

    for (let x = 0; x < 2000; x += 64) {
      for (let y = 0; y < 2000; y += 64) {
        const color = Phaser.Utils.Array.GetRandom(groundColors);
        this.ground.fillStyle(color, 1);
        this.ground.fillRect(x, y, 64, 64);
      }
    }

    // Desenha rachaduras no asfalto
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

    // Espalha pedaços de concreto pelo cenário
    this.debris = this.scene.add.graphics();

    const debrisColors = [0x625e56, 0x777064, 0x494943, 0x898174, 0x393b39];

    for (let i = 0; i < 70; i++) {
      const x = Phaser.Math.Between(30, 1970);
      const y = Phaser.Math.Between(30, 1970);
      const size = Phaser.Math.Between(4, 13);
      const color = Phaser.Utils.Array.GetRandom(debrisColors);

      this.debris.fillStyle(color, 0.85);
      this.debris.fillPoints(
        [
          new Phaser.Math.Vector2(x - size, y - size / 2),
          new Phaser.Math.Vector2(x + size / 2, y - size),
          new Phaser.Math.Vector2(x + size, y + size / 2),
          new Phaser.Math.Vector2(x - size / 2, y + size),
        ],
        true,
      );
    }

    // Cria manchas de vegetação que cresceram pelo asfalto
    this.grass = this.scene.add.graphics();

    const grassColors = [0x414b32, 0x50583a, 0x626044, 0x353f2d, 0x6b6746];

    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(40, 1960);
      const y = Phaser.Math.Between(40, 1960);
      const width = Phaser.Math.Between(45, 90);
      const height = Phaser.Math.Between(30, 65);
      const color = Phaser.Utils.Array.GetRandom(grassColors);

      this.grass.fillStyle(color, 0.8);

      this.grass.fillPoints(
        [
          new Phaser.Math.Vector2(x - width / 2, y - height / 4),
          new Phaser.Math.Vector2(x - width / 4, y - height / 2),
          new Phaser.Math.Vector2(x + width / 5, y - height / 2.5),
          new Phaser.Math.Vector2(x + width / 2, y - height / 5),
          new Phaser.Math.Vector2(x + width / 3, y + height / 3),
          new Phaser.Math.Vector2(x, y + height / 2),
          new Phaser.Math.Vector2(x - width / 3, y + height / 3),
        ],
        true,
      );

      // Adiciona pequenas folhas para quebrar o formato da mancha
      this.grass.lineStyle(2, 0x73704a, 0.65);

      for (let j = 0; j < 4; j++) {
        const leafX = x + Phaser.Math.Between(-width / 3, width / 3);
        const leafY = y + Phaser.Math.Between(-height / 3, height / 3);

        this.grass.beginPath();
        this.grass.moveTo(leafX, leafY);
        this.grass.lineTo(
          leafX + Phaser.Math.Between(-5, 5),
          leafY - Phaser.Math.Between(4, 9),
        );
        this.grass.strokePath();
      }
    }

    // Desenha uma grade discreta no chão
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
    return [this.ground, this.cracks, this.debris, this.grass];
  }
}

export default GameMap;
