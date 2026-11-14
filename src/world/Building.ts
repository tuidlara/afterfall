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
    const roofColor = style === "house" ? 0x634b3b
      : style === "medical" ? 0x62685e : 0x414b46;
    rect(8, 8, width - 16, height - 48, roofColor);

    if (style === "house") {
      for (let row = 12; row < height - 46; row += 10) {
        rect(10, row, width - 20, 2, 0x423e32);
        for (let col = 14 + (Math.floor(row / 10) % 2) * 8; col < width - 18; col += 16) {
          rect(col, row + 2, 2, 6, 0x7b5c43);
        }
      }
      rect(width / 2 - 3, 8, 6, height - 48, 0x8a6b4b);
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
    rect(10, height - 37, width - 20, 18, signColor);
    rect(12, height - 36, width - 24, 2, 0x8b8266);

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
    } else {
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

    const sign = scene.add.text(x, top + height - 28, label, {
      fontFamily: "monospace",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#d0c5a3",
    }).setOrigin(0.5).setDepth(3);
    this.visuals.push(shadow, building, sign);
  }
}
