import Phaser from "phaser";
import { Obstacle } from "./Obstacle";

export type DebrisType = "barrel" | "tire" | "crate" | "concrete";

export default class UrbanDebris {
  public obstacle: Obstacle;
  public visuals: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, type: DebrisType) {
    const sizes = { barrel: [30, 30], tire: [38, 38], crate: [42, 38], concrete: [65, 45] } as const;
    const [width, height] = sizes[type];
    this.obstacle = new Obstacle(scene, x, y, width, height);
    this.obstacle.visuals.forEach((visual) => visual.setVisible(false));

    const shadow = scene.add.graphics().setDepth(-1);
    const art = scene.add.graphics().setDepth(2);
    const rect = (px: number, py: number, w: number, h: number, color: number) => {
      art.fillStyle(color);
      art.fillRect(x + px, y + py, w, h);
    };
    const oval = (px: number, py: number, w: number, h: number, color: number) => {
      for (let row = -h / 2; row < h / 2; row += 2) {
        const half = Math.floor(w / 4 * Math.sqrt(Math.max(0, 1 - (row / (h / 2)) ** 2))) * 2;
        rect(px - half, py + row, half * 2, 2, color);
      }
    };
    const polygon = (points: number[][], color: number) => {
      art.fillStyle(color);
      art.fillPoints(points.map(([px, py]) => new Phaser.Math.Vector2(x + px!, y + py!)), true);
    };
    shadow.fillStyle(0x101c1b, 0.6);
    shadow.fillRect(x - width / 2 + 5, y - height / 2 + 6, width - 4, height - 3);

    if (type === "crate") {
      rect(-21, -19, 42, 38, 0x342d23);
      rect(-19, -17, 38, 32, 0x8b704c);
      for (let row = -15; row < 14; row += 7) {
        rect(-17, row, 34, 5, row % 2 ? 0xa0885d : 0x796445);
        rect(-16, row, 31, 1, 0xb6a074);
        rect(-11 + (row + 15) % 9, row + 3, 12, 1, 0x66533b);
      }
      rect(-20, -18, 6, 35, 0x69563b);
      rect(14, -18, 6, 35, 0x69563b);
      polygon([[-14, 10], [11, -17], [15, -13], [-10, 14]], 0xb09a6a);
      rect(-18, -17, 2, 30, 0xae9464);
      rect(15, -17, 2, 30, 0xae9464);
      for (const px of [-17, 16]) {
        for (const py of [-13, 10]) rect(px, py, 2, 2, 0xc8c09a);
      }
      rect(1, 8, 9, 5, 0x3b3628);
      rect(3, 7, 4, 2, 0x665537);
    } else if (type === "barrel") {
      oval(0, 2, 30, 28, 0x1f2e29);
      oval(0, 0, 30, 28, 0x788575);
      oval(0, -1, 26, 24, 0xa5a58a);
      oval(0, -1, 22, 20, 0x536e5f);
      rect(-7, -7, 8, 3, 0x7c947a);
      rect(-8, 0, 15, 2, 0x3e5848);
      oval(6, -6, 6, 6, 0xb2b39a);
      rect(5, -7, 2, 3, 0x334d3e);
      rect(-11, 5, 5, 5, 0x8b6945);
      rect(-8, 8, 6, 3, 0x604d35);
      rect(8, 2, 3, 6, 0x9b7750);
      rect(-2, -12, 6, 2, 0xd0c3a0);
    } else if (type === "tire") {
      oval(0, 1, 38, 36, 0x111b1b);
      oval(0, -2, 34, 30, 0x3c4741);
      oval(0, -2, 26, 24, 0x1c2c28);
      oval(0, -2, 16, 14, 0x101c1c);
      oval(1, -1, 10, 8, 0x4a5345);
      for (const [px, py] of [[-13, -11], [-16, -4], [-14, 5], [-8, 11], [3, 12], [12, 7], [14, -3], [8, -13]]) {
        rect(px!, py!, 4, 2, 0x677066);
      }
      rect(-5, -15, 6, 2, 0x73796c);
      rect(10, 7, 5, 5, 0x293b2e);
    } else {
      polygon([[-31, -11], [-15, -22], [6, -18], [17, -8], [30, 1], [30, 15], [9, 22], [-12, 17], [-30, 9]], 0x313b32);
      polygon([[-29, -11], [-13, -20], [5, -17], [8, -3], [-6, 8], [-26, 5]], 0x9a967e);
      polygon([[-29, -11], [-13, -20], [5, -17], [-4, -13], [-14, -8]], 0xc1b394);
      polygon([[-5, 9], [8, -6], [29, 0], [28, 13], [12, 20]], 0x737d68);
      polygon([[-5, 9], [8, -6], [29, 0], [12, 3], [5, 13]], 0xa1a087);
      rect(-18, -10, 8, 2, 0x5e6a57);
      rect(-11, -8, 2, 10, 0x5e6a57);
      rect(11, 5, 8, 3, 0x4a5b49);
      rect(-23, 12, 9, 5, 0x9c9679);
      rect(-23, 12, 8, 1, 0xb8ae8a);
      rect(20, -10, 8, 4, 0x8d9177);
      rect(24, 17, 5, 3, 0x767d63);
      rect(-5, -19, 18, 2, 0x795e41);
      rect(11, -18, 2, 10, 0x795e41);
      rect(12, -9, 8, 2, 0x795e41);
    }
    this.visuals.push(shadow, art);
  }
}
