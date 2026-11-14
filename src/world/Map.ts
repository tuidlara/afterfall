import Phaser from "phaser";
import Building from "./Building";
import { WORLD_SIZE } from "./WorldConfig";

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

    for (let x = 0; x < WORLD_SIZE; x += 64) {
      for (let y = 0; y < WORLD_SIZE; y += 64) {
        const color = Phaser.Utils.Array.GetRandom(groundColors);
        this.ground.fillStyle(color, 1);
        this.ground.fillRect(
          x, y,
          Math.min(64, WORLD_SIZE - x),
          Math.min(64, WORLD_SIZE - y),
        );
      }
    }

    this.createAbandonedBlock();

    // Desenha rachaduras no asfalto
    this.cracks = this.scene.add.graphics();
    this.cracks.setDepth(-2);
    this.cracks.lineStyle(2, 0x171c20, 0.55);

    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(30, WORLD_SIZE - 50);
      const y = Phaser.Math.Between(30, WORLD_SIZE - 50);
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

    for (let i = 0; i < 155; i++) {
      const x = Phaser.Math.Between(30, WORLD_SIZE - 30);
      const y = Phaser.Math.Between(30, WORLD_SIZE - 30);
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

    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(50, WORLD_SIZE - 50);
      const y = Phaser.Math.Between(50, WORLD_SIZE - 50);
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

    for (let x = 0; x <= WORLD_SIZE; x += 64) {
      this.graphics.lineBetween(x, 0, x, WORLD_SIZE);
    }

    for (let y = 0; y <= WORLD_SIZE; y += 64) {
      this.graphics.lineBetween(0, y, WORLD_SIZE, y);
    }

    this.scene.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
  }

  getGraphics() {
    return this.graphics;
  }

  private createAbandonedBlock() {
    const streets = this.scene.add.graphics().setDepth(-3);
    this.streets = streets;

    // Calçadas e avenidas cruzam o ponto inicial sem bloquear a fuga.
    streets.fillStyle(0x535349);
    streets.fillRect(0, 880, WORLD_SIZE, 220);
    streets.fillRect(880, 0, 240, WORLD_SIZE);
    streets.fillRect(0, 2080, WORLD_SIZE, 240);
    streets.fillRect(2080, 0, 240, WORLD_SIZE);
    streets.fillStyle(0x292e30);
    streets.fillRect(0, 900, WORLD_SIZE, 180);
    streets.fillRect(900, 0, 200, WORLD_SIZE);
    streets.fillRect(0, 2100, WORLD_SIZE, 200);
    streets.fillRect(2100, 0, 200, WORLD_SIZE);

    streets.fillStyle(0x8a8060, 0.6);
    for (let position = 20; position < WORLD_SIZE - 40; position += 80) {
      if (
        (position < 840 || position > 1120) &&
        (position < 2040 || position > 2320)
      ) {
        streets.fillRect(position, 986, 36, 4);
        streets.fillRect(998, position, 4, 36);
        streets.fillRect(position, 2198, 36, 4);
        streets.fillRect(2198, position, 4, 36);
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

    // Praça ao sul: duas trilhas abertas entre as árvores.
    streets.fillStyle(0x303c2b);
    streets.fillRect(1460, 2380, 460, 470);
    streets.fillStyle(0x62604e);
    streets.fillRect(1650, 2320, 64, 580);
    streets.fillRect(1460, 2590, 460, 56);

    // Pátio industrial com vagas, ligado à avenida e aos corredores dos galpões.
    streets.fillStyle(0x353a39);
    streets.fillRect(2340, 2320, 580, 540);
    streets.fillStyle(0x8a8165, 0.55);
    for (let x = 2360; x < 2880; x += 80) {
      streets.fillRect(x, 2780, 3, 64);
      streets.fillRect(x, 2841, 60, 3);
    }

    this.buildings = [
      new Building(this.scene, 740, 750, 240, 200, "MERCADO", 0x555d3d),
      new Building(this.scene, 1260, 750, 260, 200, "OFICINA", 0x68513b),
      new Building(this.scene, 740, 1210, 240, 180, "+ CLINICA", 0x68433d),
      // Residencial a leste: passagens entre as casas e pela parte de trás.
      new Building(this.scene, 2440, 520, 200, 160, "CASA 01", 0x575d49),
      new Building(this.scene, 2780, 520, 200, 160, "CASA 02", 0x625748),
      new Building(this.scene, 2440, 780, 200, 160, "CASA 03", 0x625748),
      new Building(this.scene, 2780, 780, 200, 160, "CASA 04", 0x575d49),
      new Building(this.scene, 2510, 1390, 300, 200, "LAVANDERIA", 0x485b5a),
      new Building(this.scene, 2750, 1800, 260, 220, "MERCADINHO", 0x555d3d),
      // Comércio ao sul e galpões separados por um corredor de serviço.
      new Building(this.scene, 650, 2530, 300, 240, "FARMACIA", 0x68433d),
      new Building(this.scene, 1270, 2550, 240, 260, "FERRAGENS", 0x68513b),
      new Building(this.scene, 2460, 2550, 240, 300, "DEPOSITO A", 0x68513b),
      new Building(this.scene, 2800, 2550, 240, 300, "DEPOSITO B", 0x515c60),
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
