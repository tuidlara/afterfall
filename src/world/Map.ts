import Phaser from "phaser";
import Building from "./Building";

class GameMap {
  private scene: Phaser.Scene;
  private graphics!: Phaser.GameObjects.Graphics;
  private ground!: Phaser.GameObjects.Graphics;
  private cracks!: Phaser.GameObjects.Graphics;
  private debris!: Phaser.GameObjects.Graphics;
  private grass!: Phaser.GameObjects.Graphics;
  private streets!: Phaser.GameObjects.Graphics;
  private buildings: Building[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    this.scene.cameras.main.setBackgroundColor("#252a2e");

    this.ground = this.scene.add.graphics();
    this.ground.setDepth(-5);

    const groundColors = [0x1d2226, 0x22272b, 0x1b2024, 0x252a2e, 0x1a1f23];

    for (let x = 0; x < 2000; x += 64) {
      for (let y = 0; y < 2000; y += 64) {
        const color = Phaser.Utils.Array.GetRandom(groundColors);
        this.ground.fillStyle(color, 1);
        this.ground.fillRect(x, y, 64, 64);
      }
    }

    this.createAbandonedBlock();

    // Desenha rachaduras no asfalto
    this.cracks = this.scene.add.graphics();
    this.cracks.setDepth(-2);
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
    this.debris.setDepth(-2);

    const debrisColors = [0x504c45, 0x625c51, 0x3d3e3a, 0x71695e, 0x303331];

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
    this.grass.setDepth(-2);

    const grassColors = [0x303a27, 0x3b432d, 0x4b4a35, 0x292f23, 0x504d35];

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
    this.graphics.setDepth(-4);
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

  private createAbandonedBlock() {
    const streets = this.scene.add.graphics().setDepth(-3);
    this.streets = streets;

    // Calçadas e avenidas cruzam o ponto inicial sem bloquear a fuga.
    streets.fillStyle(0x535349);
    streets.fillRect(0, 880, 2000, 220);
    streets.fillRect(880, 0, 240, 2000);
    streets.fillStyle(0x292e30);
    streets.fillRect(0, 900, 2000, 180);
    streets.fillRect(900, 0, 200, 2000);

    streets.fillStyle(0x8a8060, 0.6);
    for (let position = 20; position < 1980; position += 80) {
      if (position < 860 || position > 1120) {
        streets.fillRect(position, 986, 36, 4);
        streets.fillRect(998, position, 4, 36);
      }
    }
    streets.fillStyle(0xa29c80, 0.55);
    for (let offset = 0; offset < 6; offset++) {
      streets.fillRect(910 + offset * 32, 850, 18, 36);
      streets.fillRect(910 + offset * 32, 1114, 18, 36);
    }

    // Marcas de abandono decorativas: não criam colisões invisíveis.
    streets.fillStyle(0x562e2a, 0.8);
    streets.fillRect(760, 878, 28, 12);
    streets.fillRect(780, 884, 16, 8);
    for (let i = 0; i < 7; i++) {
      streets.fillRect(792 + i * 10, 888 + i * 6, 4, 4);
    }
    streets.fillStyle(0x8e8873, 0.65);
    for (let i = 0; i < 12; i++) {
      streets.fillRect(1140 + (i * 37) % 200, 872 + (i * 13) % 24, 6, 4);
    }
    streets.fillStyle(0x3e4932);
    for (let i = 0; i < 18; i++) {
      streets.fillRect(590 + i * 16, 866 + (i % 3) * 4, 12, 6);
    }

    this.buildings = [
      new Building(this.scene, 740, 750, 240, 200, "MERCADO", 0x555d3d),
      new Building(this.scene, 1260, 750, 260, 200, "OFICINA", 0x68513b),
      new Building(this.scene, 740, 1210, 240, 180, "+ CLINICA", 0x68433d),
    ];
  }

  getObstacles() {
    return this.buildings.map((building) => building.obstacle);
  }

  getWorldObjects() {
    return [
      this.ground, this.cracks, this.debris, this.grass, this.streets,
      ...this.buildings.flatMap((building) => building.visuals),
    ];
  }
}

export default GameMap;
