import Phaser from "phaser";
import { Obstacle } from "../entities/Obstacle";
import UrbanDebris from "../entities/UrbanDebris";
import Tree from "../entities/Tree";

export default class AbandonedSites {
  public readonly obstacles: Obstacle[] = [];
  public readonly visuals: Phaser.GameObjects.GameObject[] = [];
  private ground: Phaser.GameObjects.Graphics;
  private details: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.ground = scene.add.graphics().setDepth(-1);
    this.details = scene.add.graphics().setDepth(2);
    this.visuals.push(this.ground, this.details);

    this.ruin(370, 400);
    this.camp(740, 1420);
    this.grove(650, 2800);
    this.grove(2730, 110);
  }

  private addProp(prop: {
    obstacle: Obstacle;
    visuals: Phaser.GameObjects.GameObject[];
  }) {
    this.obstacles.push(prop.obstacle);
    this.visuals.push(...prop.visuals);
  }

  private vegetation(x: number, y: number, width: number, height: number) {
    for (let i = 0; i < 100; i++) {
      const px = x + Phaser.Math.Between(-width / 2, width / 2);
      const py = y + Phaser.Math.Between(-height / 2, height / 2);
      this.ground.fillStyle(i % 3 === 0 ? 0x414b32 : 0x303e2c, 0.85);
      this.ground.fillRect(px, py, Phaser.Math.Between(4, 14), 4);
      this.ground.fillStyle(0x6b7050, 0.65);
      this.ground.fillRect(px + 2, py - 3, 2, 5);
    }
  }

  private wall(x: number, y: number, width: number, height: number) {
    const obstacle = new Obstacle(this.scene, x, y, width, height);
    obstacle.visuals.forEach((visual) => visual.setVisible(false));
    this.obstacles.push(obstacle);
    this.details.fillStyle(0x1a2020);
    this.details.fillRect(x - width / 2 + 5, y - height / 2 + 6, width, height);
    this.details.fillStyle(0x696355);
    this.details.fillRect(x - width / 2, y - height / 2, width, height);
    this.details.fillStyle(0x94846a);
    this.details.fillRect(x - width / 2, y - height / 2, width, 3);
    this.details.fillStyle(0x343a35);
    for (let offset = 12; offset < width; offset += 18) {
      this.details.fillRect(x - width / 2 + offset, y - height / 2, 2, height);
    }
  }

  private ruin(x: number, y: number) {
    this.ground.fillStyle(0x47483e);
    this.ground.fillRect(x - 100, y - 70, 200, 140);
    this.ground.lineStyle(1, 0x646252, 0.45);
    for (let offset = -80; offset < 100; offset += 20) {
      this.ground.lineBetween(x + offset, y - 70, x + offset, y + 70);
    }
    this.wall(x - 55, y - 70, 90, 16);
    this.wall(x + 75, y - 70, 50, 16);
    this.wall(x - 100, y, 16, 140);
    this.wall(x + 65, y + 70, 70, 16);
    this.ground.fillStyle(0x171e1e, 0.75);
    this.ground.fillRect(x - 30, y - 26, 66, 36);
    for (let i = 0; i < 45; i++) {
      this.ground.fillStyle(i % 2 ? 0x746c59 : 0x4d5148);
      this.ground.fillRect(
        x + Phaser.Math.Between(-125, 125),
        y + Phaser.Math.Between(-92, 92),
        Phaser.Math.Between(3, 9), Phaser.Math.Between(2, 5),
      );
    }
    this.vegetation(x + 85, y + 45, 110, 100);
    this.addProp(new UrbanDebris(this.scene, x + 45, y - 10, "concrete"));
  }

  private camp(x: number, y: number) {
    this.ground.fillStyle(0x454437, 0.65);
    this.ground.fillRect(x - 85, y - 55, 170, 110);
    this.ground.fillStyle(0x1b2020);
    this.ground.fillRect(x - 16, y - 12, 32, 24);
    for (const [dx, dy] of [[-16, -12], [12, -12], [-16, 10], [12, 10]]) {
      this.ground.fillStyle(0x777263);
      this.ground.fillRect(x + dx, y + dy, 6, 5);
    }
    this.ground.fillStyle(0x554330);
    this.ground.fillRect(x - 10, y - 2, 20, 4);
    this.ground.fillRect(x - 2, y - 9, 4, 18);
    this.ground.fillStyle(0x5d6654);
    this.ground.fillRect(x - 65, y - 38, 22, 44);
    this.ground.fillStyle(0x88816a);
    this.ground.fillRect(x - 63, y - 36, 18, 10);
    this.addProp(new UrbanDebris(this.scene, x + 64, y - 28, "crate"));
    this.addProp(new UrbanDebris(this.scene, x + 70, y + 30, "barrel"));
    this.vegetation(x - 80, y + 45, 95, 60);
    this.ground.fillStyle(0x774c3b, 0.8);
    this.ground.fillRect(x + 8, y + 40, 18, 5);
    this.ground.fillStyle(0xaca18a, 0.65);
    for (let i = 0; i < 12; i++) {
      this.ground.fillRect(x + Phaser.Math.Between(-90, 90), y + Phaser.Math.Between(-60, 60), 4, 3);
    }
  }

  private grove(x: number, y: number) {
    this.vegetation(x, y, 230, 130);
    for (const [dx, dy, size] of [[-75, -20, 1.2], [5, 28, 1], [85, -28, 1.4]]) {
      this.addProp(new Tree(this.scene, x + dx, y + dy, size));
    }
    this.ground.fillStyle(0x65563c);
    this.ground.fillRect(x - 44, y + 46, 58, 10);
    this.ground.fillStyle(0x958063);
    this.ground.fillRect(x - 44, y + 46, 5, 10);
  }
}
