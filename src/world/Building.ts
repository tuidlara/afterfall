import Phaser from "phaser";
import { Obstacle } from "../entities/Obstacle";

export type BuildingStyle = "shop" | "house" | "medical" | "workshop" | "warehouse" | "laundry";

export default class Building {
  public readonly obstacle: Obstacle;
  public readonly visuals: Phaser.GameObjects.GameObject[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    signColor: number,
    style: BuildingStyle = "shop",
  ) {
    this.obstacle = new Obstacle(scene, x, y, width, height);
    this.obstacle.visuals.forEach((visual) => visual.setVisible(false));
    const surroundings = this.createSurroundings(scene, x, y, width, height, style);

    const shadow = scene.add.graphics().setDepth(-1);
    shadow.fillStyle(0x101718, 0.5);
    shadow.fillRect(x - width / 2 + 8, y - height / 2 + 10, width, height);
    const building = scene.add.graphics().setDepth(2);
    const left = x - width / 2;
    const top = y - height / 2;
    const rect = (px: number, py: number, w: number, h: number, color: number) => {
      building.fillStyle(color);
      building.fillRect(left + px, top + py, w, h);
    };

    rect(0, 0, width, height, 0x272f2d);
    rect(3, 3, width - 6, height - 6, style === "medical" ? 0x878777 : 0x6a6658);
    const houseVariant = Math.floor((x + y) / 10) % 3;
    const houseRoofs = [0x634b3b, 0x4f5850, 0x555049];
    const roofColor = style === "house" ? houseRoofs[houseVariant]!
      : style === "medical" ? 0x62685e : 0x414b46;
    rect(8, 8, width - 16, height - 48, roofColor);

    if (style === "house") {
      for (let row = 12; row < height - 46; row += 10) {
        rect(10, row, width - 20, 2, 0x423e32);
        for (let col = 14 + (Math.floor(row / 10) % 2) * 8; col < width - 18; col += 16) {
          rect(col, row + 2, 2, 6, houseVariant === 1 ? 0x74806b : houseVariant === 2 ? 0x747668 : 0x7b5c43);
        }
      }
      if (houseVariant === 1) {
        rect(8, (height - 40) / 2, width - 16, 5, 0x85806a);
      } else {
        rect(width / 2 - 3, 8, 6, height - 48, 0x8a795c);
      }
      rect(width - 48, 22, 22, 28, 0x302f28);
      rect(width - 50, 18, 22, 26, 0x85705a);
      rect(width - 46, 22, 14, 14, 0x292d29);
    } else if (style === "medical") {
      for (let i = 0; i < 190; i++) {
        rect(12 + (i * 37) % (width - 26), 12 + (i * 23) % (height - 66), 2, 1,
          i % 2 ? 0x747b6b : 0x505b51);
      }
    } else {
      for (let col = 14; col < width - 12; col += 12) {
        rect(col, 10, 2, height - 52, 0x303d39);
        rect(col + 2, 10, 1, height - 52, 0x5b6557);
      }
    }

    for (let i = 0; i < 16; i++) {
      const px = 16 + (i * 31 + Math.floor(x)) % (width - 50);
      const py = 16 + (i * 19 + Math.floor(y)) % (height - 84);
      rect(px, py, 5 + i % 5, 3, style === "house" ? 0x4d4936 : 0x505442);
      if (i % 3 === 0) rect(px + 2, py + 3, 3, 6, 0x373e32);
    }

    if (style === "shop" || style === "medical" || style === "laundry") {
      rect(24, 28, 44, 26, 0x252f2c);
      rect(22, 24, 44, 26, 0x777b6b);
      rect(26, 28, 36, 18, 0x414c44);
      for (let col = 30; col < 60; col += 6) rect(col, 29, 2, 16, 0x9a9b80);
      rect(42, 10, 6, 14, 0x676f60);
    }
    if (style === "medical") {
      rect(width - 70, 26, 44, 44, 0x504b40);
      rect(width - 52, 30, 8, 36, 0xa99b7d);
      rect(width - 66, 44, 36, 8, 0xa99b7d);
    }
    if (style === "workshop" || style === "warehouse") {
      for (const px of [width * 0.3, width * 0.65]) {
        rect(px, 28, 32, 44, 0x222f2d);
        rect(px + 3, 31, 26, 38, 0x607777);
        rect(px + 6, 34, 18, 2, 0x91a09a);
        rect(px + 14, 32, 2, 36, 0x303c37);
        rect(px + 4, 50, 24, 2, 0x303c37);
        rect(px + 5, 53, 8, 12, 0x263430);
      }
    }
    if (style === "laundry") {
      for (let i = 0; i < 3; i++) {
        rect(width - 84 + i * 20, 32, 12, 26, 0x293530);
        rect(width - 86 + i * 20, 28, 16, 6, 0x89917a);
      }
    }

    rect(6, 6, width - 12, 3, 0x9a9380);
    rect(5, 10, 3, height - 48, 0x777968);
    rect(width - 8, 10, 3, height - 18, 0x353f39);
    rect(8, height - 43, width - 16, 5, 0x242f2a);
    rect(10, height - 37, width - 20, 18, style === "house" ? 0x80745d : signColor);
    rect(12, height - 36, width - 24, 2, 0x8b8266);
    if (style === "house") {
      rect(20, height - 33, 30, 20, 0x223033);
      rect(22, height - 31, 11, 8, 0x60736a);
      rect(17, height - 26, 36, 4, 0x705b40);
      rect(width - 58, height - 32, 30, 18, 0x243235);
      rect(width - 55, height - 30, 24, 3, 0x819085);
      rect(width / 2 - 14, height - 35, 28, 28, 0x363b32);
      rect(width / 2 - 11, height - 32, 22, 22, 0x635641);
      rect(width / 2 + 5, height - 21, 2, 2, 0xb0a17a);
    }

    if (style === "shop") {
      for (let col = 14; col < width - 16; col += 16) {
        rect(col, height - 48, 12, 8, col % 32 < 16 ? 0x8c8868 : signColor);
      }
    }
    if (style === "workshop" || style === "warehouse") {
      rect(width / 2 - 30, height - 18, 60, 14, 0x3a423c);
      for (let row = height - 16; row < height - 4; row += 4) {
        rect(width / 2 - 28, row, 56, 1, 0x747565);
      }
    } else if (style !== "house") {
      for (const px of [22, width - 62]) {
        rect(px, height - 16, 40, 12, 0x233336);
        rect(px + 2, height - 14, 14, 3, 0x637a73);
        rect(px - 2, height - 11, 44, 4, 0x86704c);
        rect(px + 8, height - 15, 4, 11, 0x544633);
      }
      rect(width / 2 - 12, height - 17, 24, 14, 0x202b28);
      rect(width / 2 - 14, height - 10, 28, 4, 0x7c6547);
    }
    for (let i = 0; i < 6; i++) {
      rect(14 + (i * 37) % (width - 34), height - 5, 8, 2, 0x3b4735);
    }

    const sign = scene.add.text(style === "house" ? x + 27 : x, top + height - 28, label, {
      fontFamily: "monospace",
      fontSize: style === "house" ? "8px" : "12px",
      fontStyle: "bold",
      color: "#d0c5a3",
    }).setOrigin(0.5).setDepth(3);
    this.visuals.push(surroundings, shadow, building, sign);
  }

  private createSurroundings(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    style: BuildingStyle,
  ) {
    const ground = scene.add.graphics().setDepth(-1.5);
    const left = x - width / 2;
    const top = y - height / 2;
    const front = y + height / 2;
    const rect = (px: number, py: number, w: number, h: number, color: number, alpha = 1) => {
      ground.fillStyle(color, alpha);
      ground.fillRect(px, py, w, h);
    };

    for (let offset = 6; offset < width - 24; offset += 28) {
      rect(left + offset, front + 1, 24, 10, 0x626252, 0.5);
      rect(left + offset + 2, front + 2, 20, 1, 0x8c8770, 0.35);
      if (offset % 3 === 0) {
        rect(left + offset + 16, front + 8, 7, 3, 0x252f2c, 0.8);
      }
    }

    for (let i = 0; i < 18; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const px = x + side * (width / 2 + 3 + i % 4);
      const py = top + 12 + (i * 29 + Math.floor(x + y)) % (height - 30);
      rect(px - 3, py, 7, 12, 0x1c2925, 0.35);
      rect(px - 2, py + 4, 5, 3, 0x3b4931, 0.85);
      rect(px, py + 1, 1, 5, 0x6d7550, 0.7);
      rect(px + 2, py + 7, 2, 3, 0x555e3e, 0.75);
    }

    for (const offset of [12, width - 32]) {
      rect(left + offset, top - 8, 20, 8, 0x202b27, 0.45);
      rect(left + offset + 3, top - 5, 12, 3, 0x47513a, 0.75);
      rect(left + offset + 10, front + 10, 11, 5, 0x444635, 0.55);
    }

    const industrial = style === "workshop" || style === "warehouse";
    for (let i = 0; i < 8; i++) {
      const offset = 12 + (i * 23 + Math.floor(x)) % (width - 28);
      if (Math.abs(offset - width / 2) < 38) continue;
      const px = left + offset;
      const py = front + 3 + i % 10;
      if (industrial) {
        rect(px, py, 9, 3, 0x152021, 0.7);
        rect(px + 2, py - 1, 4, 2, 0x27322e, 0.6);
      } else if (style === "house") {
        rect(px, py, 3, 2, 0x817049, 0.8);
        rect(px + 4, py + 2, 2, 2, 0x5c633d, 0.75);
      } else {
        rect(px, py, 4, 3, 0xa29c80, 0.65);
        rect(px + 1, py, 2, 1, 0xc2b89b, 0.5);
      }
    }
    return ground;
  }
}
