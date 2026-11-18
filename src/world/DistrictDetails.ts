import Phaser from "phaser";
import { Obstacle } from "../entities/Obstacle";

export default class DistrictDetails {
  public readonly obstacles: Obstacle[] = [];
  public readonly visuals: Phaser.GameObjects.GameObject[] = [];
  private scene: Phaser.Scene;
  private ground: Phaser.GameObjects.Graphics;
  private details: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.ground = scene.add.graphics().setDepth(-1.2);
    this.details = scene.add.graphics().setDepth(2);
    this.visuals.push(this.ground, this.details);
    this.residentialYards();
    this.park();
    this.reliefPoint(1450, 1840);
    this.busStop(1210, 290);
  }

  private rect(x: number, y: number, w: number, h: number, color: number, ground = false) {
    const graphics = ground ? this.ground : this.details;
    graphics.fillStyle(color);
    graphics.fillRect(x, y, w, h);
  }

  private solid(x: number, y: number, w: number, h: number) {
    const obstacle = new Obstacle(this.scene, x, y, w, h);
    obstacle.visuals.forEach((visual) => visual.setVisible(false));
    this.obstacles.push(obstacle);
    this.rect(x - w / 2 + 4, y - h / 2 + 5, w, h, 0x17201e, true);
  }

  private oval(x: number, y: number, w: number, h: number, color: number, ground = false) {
    for (let row = -h / 2; row < h / 2; row += 2) {
      const half = Math.floor(w / 4 * Math.sqrt(Math.max(0, 1 - (row / (h / 2)) ** 2))) * 2;
      this.rect(x - half, y + row, half * 2, 2, color, ground);
    }
  }

  private weeds(x: number, y: number, w: number, h: number, seed: number) {
    for (let i = 0; i < 54; i++) {
      const px = x - w / 2 + ((i * 43 + seed) % w);
      const py = y - h / 2 + ((i * 31 + seed * 3) % h);
      this.rect(px, py, 4 + i % 7, 3, i % 3 ? 0x3b4932 : 0x4e5738, true);
      if (i % 3 === 0) this.rect(px + 2, py - 4, 2, 5, 0x69714a, true);
    }
  }

  private fence(x: number, y: number, length: number, vertical = false) {
    this.solid(x, y, vertical ? 6 : length, vertical ? length : 6);
    const left = x - (vertical ? 3 : length / 2);
    const top = y - (vertical ? length / 2 : 3);
    this.rect(left, top, vertical ? 6 : length, vertical ? length : 6, 0x4c5142);
    for (let i = 0; i < length; i += 12) {
      this.rect(vertical ? left - 2 : left + i, vertical ? top + i : top - 2,
        vertical ? 10 : 4, vertical ? 4 : 10, 0x7e7b5e);
      this.rect(vertical ? left - 2 : left + i, vertical ? top + i : top - 2,
        vertical ? 2 : 4, 2, 0xa09b78);
    }
  }

  private bench(x: number, y: number, broken = false) {
    this.solid(x, y, 54, 16);
    this.rect(x - 22, y - 10, 5, 22, 0x242f2c);
    this.rect(x + 18, y - 10, 5, 22, 0x242f2c);
    for (let row = 0; row < 3; row++) {
      this.rect(x - 29, y - 9 + row * 6, broken && row === 1 ? 32 : 58, 4, 0x6b583f);
      this.rect(x - 28, y - 9 + row * 6, broken && row === 1 ? 30 : 54, 1, 0x9b8561);
    }
    if (broken) this.rect(x + 16, y + 19, 28, 4, 0x746043, true);
  }

  private residentialYards() {
    for (const [x, y, w, h] of [[2340, 330, 245, 255], [2652, 446, 288, 260], [2340, 674, 228, 193]]) {
      this.rect(x, y, w, h, 0x303a2b, true);
      this.weeds(x + w / 2, y + h / 2, w - 8, h - 8, x + y);
    }
    this.rect(2444, 526, 30, 68, 0x66604c, true);
    this.rect(2779, 666, 32, 67, 0x5e5b4b, true);
    this.rect(2350, 852, 100, 16, 0x625e4d, true);
    this.fence(2350, 564, 46);
    this.fence(2535, 564, 78);
    this.fence(2603, 431, 142, true);
    this.fence(2680, 722, 72);
    this.fence(2882, 722, 94);
    this.solid(2510, 605, 32, 20);
    this.rect(2494, 595, 32, 20, 0x424c42);
    this.rect(2496, 597, 28, 3, 0x899075);
    for (const x of [2498, 2507, 2516]) this.rect(x, 602, 2, 10, 0x252f29);
    this.rect(2501, 616, 18, 3, 0x4f392e, true);

    // A horta ocupa o antigo quarto lote; os canteiros continuam atravessáveis.
    this.rect(2680, 772, 228, 80, 0x3a382b, true);
    for (let row = 0; row < 3; row++) {
      const y = 780 + row * 24;
      this.rect(2692, y, 194 - row * 18, 14, 0x504430, true);
      this.rect(2692, y, 194 - row * 18, 2, 0x807052, true);
      for (let i = 0; i < 13 - row; i++) {
        this.rect(2700 + i * 13, y + 5, 7, 5, i % 4 ? 0x455236 : 0x6a6640, true);
        this.rect(2702 + i * 13, y + 2, 2, 6, 0x65724a, true);
      }
    }
    this.weeds(2890, 822, 70, 48, 17);
    this.solid(2643, 817, 22, 24);
    this.rect(2632, 805, 22, 24, 0x393f33);
    this.rect(2634, 807, 18, 5, 0x72775b);
    this.rect(2635, 815, 3, 10, 0x818369);
    this.rect(2642, 816, 10, 6, 0x50543e);
  }

  private park() {
    this.oval(1680, 2620, 460, 470, 0x303c2b, true);
    this.oval(1840, 2490, 138, 166, 0x303c2b, true);
    this.oval(1528, 2736, 140, 212, 0x303c2b, true);
    this.rect(1658, 2320, 48, 228, 0x62604e, true);
    this.rect(1626, 2524, 80, 44, 0x62604e, true);
    this.oval(1682, 2618, 182, 170, 0x62604e, true);
    this.rect(1448, 2600, 190, 32, 0x62604e, true);
    this.rect(1736, 2588, 202, 36, 0x62604e, true);
    this.rect(1664, 2680, 36, 128, 0x62604e, true);
    this.rect(1664, 2774, 112, 36, 0x62604e, true);
    this.rect(1740, 2774, 36, 126, 0x62604e, true);
    this.weeds(1508, 2406, 84, 78, 3);
    this.weeds(1894, 2526, 78, 146, 14);
    this.weeds(1696, 2824, 208, 66, 7);
    this.rect(1592, 2510, 175, 28, 0x5e5d48, true);
    this.rect(1510, 2680, 110, 84, 0x655c43, true);
    this.rect(1516, 2686, 98, 72, 0x857552, true);
    this.weeds(1520, 2740, 60, 36, 9);
    this.oval(1682, 2618, 126, 114, 0x202b27, true);
    this.solid(1682, 2618, 82, 76);
    this.oval(1682, 2618, 112, 100, 0x666a59);
    this.oval(1682, 2615, 98, 86, 0x99947a);
    this.oval(1682, 2615, 82, 72, 0x39423b);
    this.oval(1682, 2616, 72, 62, 0x4d4c3b);
    this.rect(1672, 2598, 20, 30, 0x747663);
    this.rect(1675, 2596, 14, 4, 0xb0a48a);
    this.rect(1682, 2608, 3, 20, 0x3b453b);
    this.rect(1725, 2633, 11, 9, 0x484d3e);
    this.rect(1726, 2648, 9, 5, 0x8b866e, true);
    this.weeds(1705, 2634, 35, 22, 1);
    this.bench(1588, 2536);
    this.bench(1776, 2560, true);
    this.bench(1744, 2742);
    this.solid(1528, 2566, 28, 44);
    this.rect(1512, 2542, 32, 48, 0x333e36);
    this.rect(1516, 2544, 24, 14, 0x715f42);
    this.rect(1518, 2544, 20, 2, 0x9b835c);
    this.rect(1518, 2558, 20, 30, 0x586e6b);
    this.rect(1520, 2561, 16, 24, 0x84958a);
    this.rect(1521, 2588, 24, 4, 0x3e4a40);
    for (const x of [1774, 1846]) {
      this.solid(x, 2686, 8, 12);
      this.rect(x - 4, 2662, 8, 30, 0x554c3b);
      this.rect(x - 2, 2662, 2, 28, 0x997855);
    }
    this.rect(1772, 2660, 80, 5, 0x7c6144);
    for (const x of [1791, 1818]) this.rect(x, 2665, 1, 30, 0x92917c);
    this.rect(1789, 2694, 34, 7, 0x5b4d39);
    this.rect(1829, 2709, 15, 5, 0x7c6543, true);
    this.weeds(1846, 2698, 48, 46, 23);
  }

  private reliefPoint(x: number, y: number) {
    this.rect(x - 160, y - 110, 292, 202, 0x393c32, true);
    this.rect(x - 142, y + 44, 310, 80, 0x393c32, true);
    this.rect(x + 105, y - 86, 64, 172, 0x393c32, true);
    this.weeds(x - 128, y + 76, 90, 110, 11);
    this.weeds(x + 140, y - 68, 64, 94, 19);
    for (const [dx, dy, w] of [[-68, -54, 112], [80, -34, 82]]) {
      const left = x + dx - w / 2;
      const top = y + dy - 42;
      this.solid(x + dx, y + dy, w, 78);
      this.rect(left - 3, top - 2, w + 6, 84, 0x202c29);
      this.rect(left, top, w, 78, 0x6e7358);
      this.rect(left + 5, top + 5, w / 2 - 8, 66, 0x929174);
      this.rect(left + w / 2, top + 4, w / 2 - 5, 68, 0x555f49);
      this.rect(left + w / 2 - 2, top, 4, 78, 0xb0a17b);
      for (let fold = 0; fold < 8; fold++) {
        this.rect(left + 5 + fold * 5, top + 6 + fold * 3, 6, 2, 0x7e8264);
        this.rect(left + 5 + fold * 5, top + 68 - fold * 3, 6, 2, 0x5c674d);
      }
      this.rect(left, top, 5, 4, 0x393c32);
      this.rect(left + w - 5, top, 5, 4, 0x393c32);
      this.rect(left + w - 7, top + 72, 7, 6, 0x393c32);
      for (let seam = 18; seam < w - 8; seam += 22) this.rect(left + seam, top + 8, 1, 54, 0x424e3d);
      this.rect(left + 7, top + 55, 16, 10, 0x424b39);
      this.rect(left + w / 2 - 15, top + 69, 30, 10, 0x24332d);
      this.rect(left + w - 17, top + 13, 9, 15, 0x3c493a);
    }
    this.solid(x + 10, y + 56, 98, 24);
    this.rect(x - 39, y + 44, 98, 24, 0x5f513c);
    for (let i = 0; i < 4; i++) this.rect(x - 36, y + 46 + i * 6, 92, 1, 0x938162);
    this.rect(x - 29, y + 47, 18, 14, 0x82917b);
    this.rect(x - 26, y + 49, 12, 4, 0xc0b89a);
    this.rect(x + 12, y + 48, 23, 12, 0x303d38);
    this.rect(x + 15, y + 50, 17, 7, 0x66796b);
    for (const [dx, length] of [[-106, 48], [10, 34], [126, 40]]) this.fence(x + dx, y + 109, length);
    this.rect(x - 44, y + 72, 100, 14, 0x554b37, true);
    this.rect(x - 42, y + 72, 94, 2, 0x8b7855, true);
    for (const [dx, dy] of [[118, 32], [131, 34], [126, 51]]) {
      this.rect(x + dx, y + dy, 9, 14, 0x3b5350);
      this.rect(x + dx + 2, y + dy - 2, 5, 3, 0x93a08a);
      this.rect(x + dx + 2, y + dy + 3, 2, 8, 0x687e6c);
    }
    const sign = this.scene.add.text(x + 6, y + 79, "DISTRIBUIÇÃO", {
      fontFamily: "monospace", fontSize: "9px", color: "#b9ac85",
    }).setOrigin(0.5).setDepth(-0.9);
    this.visuals.push(sign);
    for (let i = 0; i < 14; i++) {
      this.rect(x - 64 + (i * 31) % 160, y + 88 + (i * 17) % 32, 3, 2,
        i % 3 ? 0x9a9277 : 0x5a382d, true);
    }
  }

  private busStop(x: number, y: number) {
    this.rect(x - 64, y - 45, 128, 112, 0x53584c, true);
    this.rect(x - 59, y - 41, 118, 102, 0x454b41, true);
    this.solid(x, y - 16, 98, 30);
    this.rect(x - 52, y - 34, 104, 33, 0x25322f);
    this.rect(x - 49, y - 32, 98, 28, 0x69786c);
    for (let col = -44; col < 45; col += 8) this.rect(x + col, y - 31, 2, 27, 0x3f5147);
    this.rect(x - 52, y - 34, 104, 3, 0x9d9d7d);
    this.rect(x + 16, y - 28, 20, 17, 0x293b35);
    this.rect(x + 18, y - 24, 8, 12, 0x3c4c3e);
    this.bench(x - 6, y + 25, true);
    this.solid(x - 70, y + 20, 8, 10);
    this.rect(x - 73, y - 4, 5, 29, 0x59685a);
    this.rect(x - 80, y - 18, 20, 17, 0x41594e);
    this.rect(x - 77, y - 15, 14, 10, 0x9aab8c);
    this.rect(x - 74, y - 13, 8, 6, 0x344a40);
    this.rect(x + 31, y + 39, 14, 4, 0xa69979, true);
    this.rect(x + 35, y + 45, 6, 3, 0x777458, true);
    this.weeds(x + 60, y + 45, 46, 42, 21);
  }
}
