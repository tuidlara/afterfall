import Phaser from "phaser";
import Building from "./Building";
import { WORLD_SIZE } from "./WorldConfig";
import AbandonedSites from "./AbandonedSites";

class GameMap {
  private scene: Phaser.Scene;
  private graphics!: Phaser.GameObjects.Graphics;
  private ground!: Phaser.GameObjects.Graphics;
  private cracks!: Phaser.GameObjects.Graphics;
  private debris!: Phaser.GameObjects.Graphics;
  private grass!: Phaser.GameObjects.Graphics;
  private streets!: Phaser.GameObjects.Graphics;
  private surfaceTexture!: Phaser.GameObjects.TileSprite;
  private buildings: Building[] = [];
  private abandonedSites!: AbandonedSites;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    this.scene.cameras.main.setBackgroundColor("#252a2e");

    this.ground = this.scene.add.graphics();
    this.ground.setDepth(-5);

    this.ground.fillStyle(0x252a2c);
    this.ground.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    for (let i = 0; i < 240; i++) {
      const x = Phaser.Math.Between(40, WORLD_SIZE - 120);
      const y = Phaser.Math.Between(40, WORLD_SIZE - 120);
      this.ground.fillStyle(i % 2 === 0 ? 0x11191c : 0x515044, 0.12);
      for (let patch = 0; patch < 5; patch++) {
        this.ground.fillRect(
          x + Phaser.Math.Between(-24, 24),
          y + Phaser.Math.Between(-16, 16),
          Phaser.Math.Between(16, 72),
          Phaser.Math.Between(8, 28),
        );
      }
    }

    this.createAbandonedBlock();
    this.abandonedSites = new AbandonedSites(this.scene);

    this.cracks = this.scene.add.graphics();
    this.cracks.setDepth(-2);
    this.cracks.fillStyle(0x101719, 0.65);

    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(30, WORLD_SIZE - 50);
      const y = Phaser.Math.Between(30, WORLD_SIZE - 50);
      let crackX = x;
      let crackY = y;
      const direction = i % 2 === 0 ? 1 : -1;
      for (let step = 0; step < 7; step++) {
        const length = Phaser.Math.Between(3, 8);
        this.cracks.fillRect(crackX, crackY, length, 1);
        crackX += length;
        const drop = Phaser.Math.Between(2, 5);
        this.cracks.fillRect(crackX, crackY - (direction < 0 ? drop : 0), 1, drop + 1);
        crackY += direction * drop;
        if (step === 3) this.cracks.fillRect(crackX - 2, crackY, 2, 8);
      }
    }

    this.debris = this.scene.add.graphics();
    this.debris.setDepth(-2);

    const debrisColors = [0x504c45, 0x625c51, 0x3d3e3a, 0x71695e, 0x303331];

    for (let i = 0; i < 155; i++) {
      const x = Phaser.Math.Between(30, WORLD_SIZE - 30);
      const y = Phaser.Math.Between(30, WORLD_SIZE - 30);
      const size = Phaser.Math.Between(2, 6);
      const color = Phaser.Utils.Array.GetRandom(debrisColors);

      this.debris.fillStyle(color, 0.6);
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

    this.grass = this.scene.add.graphics();
    this.grass.setDepth(-2);

    const grassColors = [0x303a27, 0x3b432d, 0x4b4a35, 0x292f23, 0x504d35];

    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(50, WORLD_SIZE - 50);
      const y = Phaser.Math.Between(50, WORLD_SIZE - 50);
      const width = Phaser.Math.Between(45, 90);
      const height = Phaser.Math.Between(30, 65);
      const color = Phaser.Utils.Array.GetRandom(grassColors);

      for (let tuft = 0; tuft < 28; tuft++) {
        const tuftX = x + Phaser.Math.Between(-width / 2, width / 2);
        const tuftY = y + Phaser.Math.Between(-height / 2, height / 2);
        this.grass.fillStyle(color, 0.65);
        this.grass.fillRect(tuftX, tuftY, Phaser.Math.Between(2, 7), 2);
        this.grass.fillStyle(0x626744, 0.5);
        this.grass.fillRect(tuftX + 1, tuftY - 3, 1, 4);
      }

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

    // Textura fina compartilhada: gerada uma vez, sem milhares de objetos.
    this.graphics = this.scene.add.graphics();
    const textureKey = "ground-grain";
    if (!this.scene.textures.exists(textureKey)) {
      for (let i = 0; i < 3600; i++) {
        this.graphics.fillStyle(i % 3 === 0 ? 0x9b9b87 : 0x090f12, 0.18);
        this.graphics.fillRect(
          Phaser.Math.Between(0, 510), Phaser.Math.Between(0, 510),
          i % 4 === 0 ? 2 : 1, 1,
        );
      }
      this.graphics.generateTexture(textureKey, 512, 512);
      this.graphics.clear();
    }
    this.surfaceTexture = this.scene.add
      .tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, textureKey)
      .setOrigin(0)
      .setDepth(-2.5);

    this.scene.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
  }

  getGraphics() {
    return this.graphics;
  }

  private createAbandonedBlock() {
    const streets = this.scene.add.graphics().setDepth(-3);
    this.streets = streets;

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

    streets.fillStyle(0x303c2b);
    streets.fillRect(1460, 2380, 460, 470);
    streets.fillStyle(0x62604e);
    streets.fillRect(1650, 2320, 64, 580);
    streets.fillRect(1460, 2590, 460, 56);

    streets.fillStyle(0x353a39);
    streets.fillRect(2340, 2320, 580, 540);
    streets.fillStyle(0x8a8165, 0.55);
    for (let x = 2360; x < 2880; x += 80) {
      streets.fillRect(x, 2780, 3, 64);
      streets.fillRect(x, 2841, 60, 3);
    }

    this.buildings = [
      new Building(this.scene, 740, 750, 240, 200, "MERCADO", 0x555d3d),
      new Building(this.scene, 1260, 750, 260, 200, "OFICINA", 0x68513b, "workshop"),
      new Building(this.scene, 740, 1210, 240, 180, "+ CLINICA", 0x68433d, "medical"),
      new Building(this.scene, 2440, 520, 200, 160, "CASA 01", 0x575d49, "house"),
      new Building(this.scene, 2780, 520, 200, 160, "CASA 02", 0x625748, "house"),
      new Building(this.scene, 2440, 780, 200, 160, "CASA 03", 0x625748, "house"),
      new Building(this.scene, 2780, 780, 200, 160, "CASA 04", 0x575d49, "house"),
      new Building(this.scene, 2510, 1390, 300, 200, "LAVANDERIA", 0x485b5a, "laundry"),
      new Building(this.scene, 2750, 1800, 260, 220, "MERCADINHO", 0x555d3d),
      new Building(this.scene, 650, 2530, 300, 240, "FARMACIA", 0x68433d, "medical"),
      new Building(this.scene, 1270, 2550, 240, 260, "FERRAGENS", 0x68513b, "workshop"),
      new Building(this.scene, 2460, 2550, 240, 300, "DEPOSITO A", 0x68513b, "warehouse"),
      new Building(this.scene, 2800, 2550, 240, 300, "DEPOSITO B", 0x515c60, "warehouse"),
    ];
  }

  getObstacles() {
    return [
      ...this.buildings.map((building) => building.obstacle),
      ...this.abandonedSites.obstacles,
    ];
  }

  getWorldObjects() {
    return [
      this.ground, this.cracks, this.debris, this.grass, this.streets, this.surfaceTexture,
      ...this.buildings.flatMap((building) => building.visuals),
      ...this.abandonedSites.visuals,
    ];
  }
}

export default GameMap;
