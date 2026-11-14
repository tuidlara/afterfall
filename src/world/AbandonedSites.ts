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
    this.shoppingCart(580, 815);
    this.stretcher(900, 1260);
    this.workbench(1430, 810);
  }

  private addProp(prop: {
    obstacle: Obstacle;
    visuals: Phaser.GameObjects.GameObject[];
  }) {
    this.obstacles.push(prop.obstacle);
    this.visuals.push(...prop.visuals);
  }

  private detailProp(x: number, y: number, width: number, height: number) {
    const obstacle = new Obstacle(this.scene, x, y, width, height);
    obstacle.visuals.forEach((visual) => visual.setVisible(false));
    this.obstacles.push(obstacle);
    this.ground.fillStyle(0x101a1b, 0.45);
    this.ground.fillRect(x - width / 2 + 3, y - height / 2 + 4, width, height);
    return (px: number, py: number, w: number, h: number, color: number) => {
      this.details.fillStyle(color);
      this.details.fillRect(x + px, y + py, w, h);
    };
  }

  private shoppingCart(x: number, y: number) {
    const rect = this.detailProp(x, y, 32, 24);
    rect(-16, -8, 28, 18, 0x303e3b);
    rect(-14, -6, 24, 14, 0x1a2929);
    for (let col = -12; col < 10; col += 6) {
      rect(col, -6, 2, 14, 0x7b8575);
    }
    rect(-14, -2, 24, 2, 0x606e65);
    rect(-14, 4, 24, 2, 0x606e65);
    rect(-16, -8, 28, 2, 0x9b9f86);
    rect(-16, 8, 28, 2, 0x62523c);
    rect(12, -12, 4, 18, 0x7e8776);
    rect(6, -12, 10, 3, 0x735842);
    rect(-12, 10, 6, 2, 0x121c1d);
    rect(6, 10, 6, 2, 0x121c1d);
    this.ground.fillStyle(0xa49872, 0.7);
    this.ground.fillRect(x - 28, y + 8, 5, 3);
    this.ground.fillRect(x - 22, y + 18, 7, 4);
  }

  private stretcher(x: number, y: number) {
    const rect = this.detailProp(x, y, 52, 24);
    for (const px of [-22, 16]) {
      rect(px, -12, 6, 4, 0x172123);
      rect(px, 8, 6, 4, 0x172123);
    }
    rect(-26, -8, 52, 16, 0x7d897e);
    rect(-22, -6, 44, 12, 0x606a5a);
    rect(-20, -5, 40, 10, 0xb0aa8c);
    rect(-19, -4, 10, 8, 0xd0c4a2);
    rect(-4, -5, 2, 10, 0x6c715e);
    rect(10, -5, 2, 10, 0x6c715e);
    rect(0, -1, 7, 4, 0x715444);
    rect(4, -3, 3, 2, 0x715444);
    rect(-24, -9, 48, 2, 0xa0ac98);
    rect(-24, 7, 48, 2, 0x444f47);
    this.ground.fillStyle(0x878c7a, 0.65);
    this.ground.fillRect(x + 18, y + 18, 4, 6);
  }

  private workbench(x: number, y: number) {
    const rect = this.detailProp(x, y, 48, 28);
    rect(-24, -14, 48, 28, 0x262f2b);
    rect(-22, -12, 44, 24, 0x66573f);
    rect(-20, -10, 40, 2, 0x938064);
    rect(-20, 4, 40, 2, 0x423e30);
    rect(-16, -5, 12, 10, 0x222e2d);
    rect(-14, -3, 8, 6, 0x4e5c51);
    rect(8, -8, 4, 14, 0x9a9e88);
    rect(6, -8, 8, 3, 0x9a9e88);
    rect(8, -8, 4, 2, 0x3d463c);
    rect(-2, 6, 17, 3, 0x302e25);
    rect(0, 6, 11, 2, 0x8a7451);
    this.ground.fillStyle(0x141f21, 0.65);
    this.ground.fillRect(x - 10, y + 18, 18, 5);
    this.ground.fillRect(x - 6, y + 22, 8, 3);
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
