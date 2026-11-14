import Phaser from "phaser";
import { Obstacle } from "../entities/Obstacle";

export type CarType = "sedan" | "suv" | "pickup";

export default class Car {
  public obstacle: Obstacle;
  public visuals: Phaser.GameObjects.GameObject[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: CarType = "sedan",
    color: number = 0x566b58,
  ) {
    const dimensions = {
      sedan: { width: 110, height: 54 },
      suv: { width: 120, height: 64 },
      pickup: { width: 130, height: 64 },
    };
    const { width, height } = dimensions[type];
    this.obstacle = new Obstacle(scene, x, y, width, height);
    this.obstacle.visuals.forEach((visual) => visual.setVisible(false));

    const shadow = scene.add.graphics().setDepth(-1);
    shadow.fillStyle(0x0c1416, 0.45);
    shadow.fillRect(x - width / 2 + 4, y - height / 2 + 6, width, height);

    const body = scene.add.graphics().setDepth(2);
    const left = -width / 2;
    const top = -height / 2;
    const paint = (amount: number) => {
      const channel = (shift: number) => Math.max(0, Math.min(255, ((color >> shift) & 255) + amount));
      return (channel(16) << 16) | (channel(8) << 8) | channel(0);
    };
    const rect = (px: number, py: number, w: number, h: number, tint: number) => {
      body.fillStyle(tint);
      body.fillRect(x + px, y + py, w, h);
    };

    for (const wheelX of [left + 18, width / 2 - 36]) {
      for (const wheelY of [top, height / 2 - 10]) {
        rect(wheelX, wheelY, 20, 10, 0x101718);
        rect(wheelX + 3, wheelY + 3, 14, 2, 0x39403b);
        for (let tread = 0; tread < 4; tread++) {
          rect(wheelX + 2 + tread * 4, wheelY + 1, 2, 2, 0x242c29);
        }
      }
    }

    rect(left + 2, top + 10, width - 4, height - 20, 0x172123);
    rect(left + 8, top + 4, width - 16, height - 8, 0x172123);
    rect(left + 4, top + 12, width - 8, height - 24, paint(-12));
    rect(left + 10, top + 6, width - 20, height - 12, color);
    rect(left + 14, top + 6, width - 30, 2, paint(25));
    rect(left + 12, height / 2 - 10, width - 24, 4, paint(-26));
    rect(left + 2, -height / 2 + 14, 4, height - 28, 0x5b5c50);
    rect(width / 2 - 6, -height / 2 + 12, 4, height - 24, 0x686959);

    const glass = (px: number, w: number, h: number, broken: boolean) => {
      rect(px - 2, -h / 2 - 2, w + 4, h + 4, 0x1b292b);
      rect(px, -h / 2, w, h, 0x435c5e);
      rect(px + 2, -h / 2 + 2, w - 4, 2, 0x728381);
      if (broken) {
        rect(px + w / 2 - 3, -4, 6, 8, 0x142023);
        rect(px + w / 2 + 1, -9, 2, 6, 0x91a19a);
        rect(px + w / 2 - 6, 2, 4, 2, 0x91a19a);
        rect(px + w / 2 + 3, 4, 4, 2, 0x91a19a);
      }
    };

    const damage = Math.abs(Math.floor(x + y)) % 3;
    if (type === "pickup") {
      rect(left + 12, top + 10, 45, height - 20, paint(-30));
      rect(left + 16, top + 14, 37, height - 28, 0x303a36);
      for (let rib = 0; rib < 4; rib++) {
        rect(left + 20 + rib * 8, top + 16, 2, height - 32, 0x50534a);
      }
      rect(8, top + 10, 18, height - 20, paint(9));
      glass(30, 12, height - 26, true);
      rect(left + 24, -9, 16, 5, 0x756044);
      rect(left + 28, 3, 20, 4, 0x645239);
    } else {
      const roofWidth = type === "suv" ? 32 : 24;
      const glassHeight = height - 26;
      glass(-roofWidth / 2 - 16, 12, glassHeight, damage === 1);
      glass(roofWidth / 2 + 4, 12, glassHeight, damage !== 1);
      rect(-roofWidth / 2, top + 10, roofWidth, height - 20, paint(-8));
      rect(-roofWidth / 2 + 2, top + 12, roofWidth - 4, 2, paint(18));
      if (type === "suv") {
        rect(-20, top + 8, 40, 3, 0x252f2d);
        rect(-20, height / 2 - 11, 40, 3, 0x252f2d);
      }
    }

    rect(width / 2 - 16, top + 10, 8, 5, 0xaca17b);
    rect(width / 2 - 16, height / 2 - 15, 8, 5, 0x70674f);
    rect(left + 9, top + 10, 4, 5, 0x733e32);
    rect(left + 9, height / 2 - 15, 4, 5, 0x4c2d29);
    rect(width / 2 - 24, -9, 2, 18, paint(-28));
    rect(-6, top + 7, 7, 2, 0x96917a);
    rect(-6, height / 2 - 9, 7, 2, 0x343d37);

    for (let i = 0; i < 8; i++) {
      const px = left + 16 + ((i * 17 + damage * 11) % (width - 36));
      const py = i % 2 === 0 ? top + 9 : height / 2 - 14;
      rect(px, py, 4 + i % 3, 3, 0x70503a);
      rect(px + 2, py + 2, 3, 2, 0x9a714b);
    }
    rect(width / 2 - 32, -5 + damage * 3, 12, 2, paint(30));
    rect(width / 2 - 28, -3 + damage * 3, 6, 2, paint(-24));
    this.visuals.push(shadow, body);
  }
}
