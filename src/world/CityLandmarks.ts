import Phaser from "phaser";
import { Obstacle } from "../entities/Obstacle";

export default class CityLandmarks {
  public readonly obstacles: Obstacle[] = [];
  public readonly visuals: Phaser.GameObjects.GameObject[] = [];
  private scene: Phaser.Scene;
  private ground: Phaser.GameObjects.Graphics;
  private details: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.ground = scene.add.graphics().setDepth(-1.1);
    this.details = scene.add.graphics().setDepth(2);
    this.visuals.push(this.ground, this.details);
    this.court();
    this.fuelStation();
    this.evacuation();
    this.substation();
    this.waterWorks();
    this.diner();
    this.drainage();
    this.chapelYard();
    this.delivery();
    this.loadingYard();
    this.checkpoints();
    this.connections();
  }

  private rect(x: number, y: number, w: number, h: number, color: number, ground = false) {
    const graphics = ground ? this.ground : this.details;
    graphics.fillStyle(color);
    graphics.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  private line(x1: number, y1: number, x2: number, y2: number, color: number, ground = false, width = 2) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= steps; i += 2) {
      const t = steps ? i / steps : 0;
      this.rect(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, width, width, color, ground);
    }
  }

  private oval(x: number, y: number, w: number, h: number, color: number, ground = false) {
    for (let row = -h / 2; row < h / 2; row += 2) {
      const half = Math.floor(w / 4 * Math.sqrt(Math.max(0, 1 - (row / (h / 2)) ** 2))) * 2;
      this.rect(x - half, y + row, half * 2, 2, color, ground);
    }
  }

  private solid(x: number, y: number, w: number, h: number, shadow = true) {
    const obstacle = new Obstacle(this.scene, x, y, w, h);
    obstacle.visuals.forEach((visual) => visual.setVisible(false));
    this.obstacles.push(obstacle);
    if (shadow) this.rect(x - w / 2 + 5, y - h / 2 + 6, w, h, 0x172021, true);
  }

  private label(x: number, y: number, value: string, color = "#b8ae8d", ground = false) {
    const label = this.scene.add.text(x, y, value, {
      fontFamily: "monospace", fontSize: "9px", fontStyle: "bold", color,
    }).setOrigin(0.5).setDepth(ground ? -0.9 : 3);
    this.visuals.push(label);
  }

  private growth(x: number, y: number, w: number, h: number, seed: number) {
    for (let i = 0; i < 65; i++) {
      const px = x - w / 2 + (i * 47 + seed) % w;
      const py = y - h / 2 + (i * 29 + seed * 3) % h;
      this.rect(px, py, 5 + i % 8, 3, i % 4 ? 0x3b4a31 : 0x58613e, true);
      if (i % 3 === 0) this.rect(px + 2, py - 4, 2, 6, 0x72734b, true);
    }
  }

  private mesh(x: number, y: number, length: number, vertical = false) {
    this.solid(x, y, vertical ? 5 : length, vertical ? length : 5);
    for (let offset = -length / 2; offset < length / 2; offset += 8) {
      this.rect(vertical ? x - 3 : x + offset, vertical ? y + offset : y - 5,
        vertical ? 6 : 1, vertical ? 1 : 11, 0x656e5c);
      if (offset % 24 === 0) this.rect(vertical ? x - 5 : x + offset, vertical ? y + offset : y - 7, 5, 16, 0x959782);
    }
    this.rect(x - (vertical ? 1 : length / 2), y - (vertical ? length / 2 : 4),
      vertical ? 2 : length, vertical ? length : 2, 0x89917b);
  }

  private rubble(x: number, y: number, w: number, h: number, seed: number) {
    const count = Math.max(10, Math.min(45, Math.floor(w * h / 220)));
    for (let i = 0; i < count; i++) {
      const hash = Math.imul(i + seed * 97, 374761393);
      const noise = (hash ^ (hash >>> 13)) >>> 0;
      const px = x - w / 2 + (noise & 0xffff) % w;
      const py = y - h / 2 + (noise >>> 16) % h;
      this.rect(px + 1, py + 2, 3 + noise % 5, 3, 0x1a2524, true);
      this.rect(px, py, 2 + noise % 5, 1 + noise % 3, i % 3 ? 0x686450 : 0x969078, true);
    }
  }

  private court() {
    this.rect(143, 565, 394, 230, 0x4b5041, true);
    this.rect(156, 578, 368, 204, 0x525641, true);
    this.rect(164, 586, 352, 188, 0x494e40, true);
    this.rect(170, 590, 340, 2, 0x9a9576, true);
    this.rect(170, 768, 340, 2, 0x9a9576, true);
    this.rect(170, 590, 2, 180, 0x9a9576, true);
    this.rect(508, 590, 2, 180, 0x9a9576, true);
    this.rect(170, 679, 340, 2, 0x9a9576, true);
    this.oval(340, 680, 66, 66, 0x9a9576, true);
    this.oval(340, 680, 62, 62, 0x494e40, true);
    for (const y of [592, 718]) {
      this.rect(297, y, 2, 51, 0x9a9576, true);
      this.rect(381, y, 2, 51, 0x9a9576, true);
      this.rect(297, y === 592 ? 642 : 718, 86, 2, 0x9a9576, true);
    }
    this.line(390, 580, 367, 636, 0x202e28, true);
    this.line(367, 636, 407, 664, 0x202e28, true);
    this.line(407, 664, 394, 711, 0x202e28, true);
    this.growth(492, 747, 86, 88, 6);
    this.growth(180, 611, 64, 76, 5);
    this.solid(340, 566, 36, 8);
    this.rect(321, 560, 38, 9, 0x72786b);
    this.rect(324, 561, 32, 3, 0xc0b89b);
    this.oval(340, 574, 12, 8, 0xa16642);
    this.oval(340, 574, 8, 4, 0x25352b);
    this.solid(340, 795, 28, 8);
    this.rect(327, 792, 28, 7, 0x6b6b55);
    this.rect(329, 790, 18, 3, 0xb1a888);
    this.rect(350, 806, 14, 3, 0x8b6545, true);
    this.mesh(142, 643, 146, true);
    this.mesh(414, 808, 140);
    this.solid(111, 717, 18, 62);
    for (let col = 0; col < 3; col++) this.rect(103 + col * 6, 686, 4, 62, col === 0 ? 0x9b835e : 0x695840);
    this.rubble(462, 807, 110, 35, 8);
  }

  private fuelStation() {
    this.rect(1560, 366, 426, 410, 0x484d43, true);
    this.rect(1540, 566, 70, 190, 0x484d43, true);
    this.rect(1580, 384, 384, 372, 0x3c4540, true);
    for (const x of [1585, 1946]) this.rect(x, 390, 3, 350, 0x7d7c60, true);
    this.solid(1840, 430, 220, 120);
    this.rect(1730, 370, 220, 120, 0x2a3531);
    this.rect(1736, 376, 208, 79, 0x6a7162);
    for (let col = 1744; col < 1940; col += 12) {
      this.rect(col, 378, 2, 73, 0x4a584d);
      this.rect(col + 3, 378, 1, 73, 0x8c9177);
    }
    this.rect(1735, 458, 210, 16, 0x68785b);
    this.rect(1735, 474, 210, 12, 0x343e33);
    this.rect(1762, 476, 54, 7, 0x263839);
    this.rect(1874, 476, 42, 7, 0x263839);
    this.rect(1830, 474, 26, 13, 0x192a27);
    this.label(1840, 465, "POSTO · ÚLTIMA PARADA");
    this.rect(1882, 391, 28, 24, 0x303e37);
    this.rect(1885, 394, 22, 3, 0xb0ad90);
    for (const x of [1654, 1772]) {
      this.rect(x - 31, 510, 62, 60, 0x777761, true);
      this.solid(x, 535, 24, 34);
      this.rect(x - 13, 517, 26, 37, 0x2b3631);
      this.rect(x - 10, 519, 20, 31, 0x895845);
      this.rect(x - 8, 521, 16, 11, 0xc1b897);
      this.rect(x - 6, 523, 12, 5, 0x283a35);
      this.rect(x - 3, 537, 6, 10, 0x604b36);
      this.line(x + 13, 524, x + 23, 531, 0x152522);
      this.line(x + 23, 531, x + 20, 551, 0x152522);
      this.line(x + 20, 551, x + 9, 549, 0x152522);
    }
    this.solid(1716, 608, 156, 30);
    this.rect(1638, 591, 156, 30, 0x263b35);
    this.rect(1641, 593, 150, 26, 0x63755b);
    this.rect(1640, 593, 152, 3, 0xaaa78a);
    for (let col = 1647; col < 1785; col += 10) this.rect(col, 595, 2, 22, 0x425347);
    this.line(1634, 587, 1671, 565, 0x777e6b);
    this.line(1793, 622, 1821, 643, 0x777e6b);
    this.oval(1820, 688, 116, 49, 0x263630, true);
    this.oval(1838, 694, 62, 23, 0x1d2a29, true);
    this.rubble(1828, 624, 95, 68, 13);
    this.growth(1940, 729, 82, 114, 2);
    this.label(1626, 735, "ENTRADA", "#9a9778", true);
  }

  private evacuation() {
    this.rect(285, 1318, 360, 64, 0x50594e, true);
    this.rect(285, 1250, 56, 232, 0x50594e, true);
    for (let x = 355; x < 610; x += 35) this.rect(x, 1326, 18, 2, 0x9d9c7a, true);
    this.solid(398, 1350, 122, 54);
    this.rect(337, 1323, 122, 54, 0x283530);
    this.rect(341, 1326, 80, 46, 0x8e9680);
    this.rect(422, 1326, 32, 46, 0x707f6e);
    this.rect(430, 1330, 20, 32, 0x2c4543);
    this.rect(433, 1332, 16, 3, 0x8baba0);
    this.rect(340, 1364, 113, 5, 0x874c3c);
    this.rect(372, 1333, 8, 25, 0x915340);
    this.rect(364, 1341, 24, 8, 0x915340);
    this.rect(408, 1327, 4, 42, 0x526451);
    for (const x of [349, 431]) {
      this.rect(x, 1320, 18, 6, 0x152320);
      this.rect(x, 1372, 18, 6, 0x152320);
    }
    this.rect(426, 1328, 4, 8, 0x9b4638);
    this.rect(426, 1354, 4, 8, 0x72899a);
    this.rect(349, 1332, 11, 30, 0x4c5f4e);
    this.rect(438, 1375, 12, 4, 0x8b5e3d, true);
    this.solid(513, 1395, 26, 30);
    this.rect(501, 1380, 22, 21, 0x8e9681);
    this.rect(503, 1382, 17, 15, 0x4a655b);
    this.rect(498, 1401, 29, 4, 0x6f7e6b);
    this.rect(497, 1390, 3, 22, 0x293e35);
    this.rect(525, 1390, 3, 22, 0x293e35);
    this.rect(505, 1406, 18, 3, 0x929b84);
    this.mesh(207, 1330, 116, true);
    this.mesh(256, 1220, 98);
    this.rect(220, 1227, 71, 20, 0x58543f, true);
    this.label(256, 1237, "ISOLAMENTO", "#b8ae8d", true);
    this.growth(206, 1410, 90, 68, 20);
    this.rubble(454, 1427, 110, 56, 4);
  }

  private substation() {
    this.rect(314, 1690, 492, 316, 0x454d40, true);
    this.rect(328, 1704, 464, 286, 0x323e36, true);
    this.mesh(318, 1820, 260, true);
    this.mesh(800, 1820, 260, true);
    this.mesh(559, 1692, 482);
    this.mesh(384, 1993, 132);
    this.mesh(711, 1993, 178);
    this.rect(459, 1948, 151, 60, 0x50594a, true);
    this.rect(649, 1695, 81, 19, 0x7c7151);
    this.label(689, 1704, "ALTA TENSÃO", "#d3ba7d");
    for (const [x, y, w, h] of [[435, 1800, 72, 94], [633, 1790, 100, 110]]) {
      this.solid(x, y, w, h);
      this.rect(x - w / 2, y - h / 2, w, h, 0x25362f);
      this.rect(x - w / 2 + 5, y - h / 2 + 5, w - 10, h - 10, 0x657663);
      for (let fin = -w / 2 + 9; fin < w / 2 - 4; fin += 8) {
        this.rect(x + fin, y - h / 2 + 9, 3, h - 19, 0x354e40);
        this.rect(x + fin + 3, y - h / 2 + 9, 1, h - 19, 0x8e9b80);
      }
      for (const dx of [-16, 16]) {
        this.oval(x + dx, y - h / 2 - 3, 12, 12, 0xa8ab8a);
        this.oval(x + dx, y - h / 2 - 3, 6, 6, 0x4c614e);
      }
      this.rect(x - 16, y + 4, 32, 18, 0x8e8058);
      this.rect(x - 3, y + 6, 6, 12, 0x343f31);
    }
    for (const x of [374, 748]) {
      this.solid(x, 1874, 16, 16);
      this.rect(x - 7, 1852, 14, 29, 0x5c6d5b);
      this.rect(x - 19, 1850, 38, 4, 0x8e9580);
      for (const dx of [-14, 0, 14]) this.rect(x + dx, 1845, 4, 10, 0xb6b799);
    }
    this.line(374, 1850, 498, 1881, 0x152820);
    this.line(498, 1881, 748, 1850, 0x152820);
    this.line(720, 1734, 750, 1766, 0x293a31, true, 3);
    this.line(750, 1766, 732, 1810, 0x293a31, true, 3);
    this.growth(757, 1936, 86, 83, 26);
    this.growth(352, 1726, 58, 65, 10);
    this.rubble(562, 1899, 160, 70, 12);
  }

  private waterWorks() {
    this.rect(1720, 1354, 320, 248, 0x4b5447, true);
    this.rect(1740, 1370, 280, 211, 0x39483c, true);
    for (const [x, y, size] of [[1810, 1445, 106], [1955, 1485, 78]]) {
      this.solid(x, y, size - 12, size - 12, false);
      this.oval(x + 5, y + 7, size + 6, size, 0x1d302a, true);
      this.oval(x, y, size, size, 0x354f48);
      this.oval(x, y - 3, size - 8, size - 8, 0x8d9b85);
      this.oval(x, y - 4, size - 17, size - 17, 0x5b7869);
      this.oval(x - 6, y - 12, size - 37, size - 37, 0x6e8c76);
      this.oval(x + 9, y - 10, 22, 20, 0x263e35);
      this.oval(x + 9, y - 12, 16, 14, 0xa2ab8e);
      for (let i = -28; i < 29; i += 8) this.rect(x + i, y + size / 2 - 9, 3, 2, 0xc0bba0);
    }
    this.rect(1812, 1504, 10, 63, 0x81907b, true);
    this.rect(1814, 1504, 3, 63, 0xaeb59b, true);
    this.rect(1812, 1557, 146, 10, 0x81907b, true);
    this.rect(1814, 1559, 142, 3, 0xaeb59b, true);
    this.rect(1950, 1525, 10, 42, 0x81907b, true);
    this.oval(1905, 1561, 18, 18, 0x8b5945, true);
    this.oval(1905, 1561, 10, 10, 0x394c3b, true);
    this.rect(1740, 1355, 118, 19, 0x3c5044, true);
    this.label(1799, 1364, "RESERVA DE ÁGUA", "#b8ae8d", true);
    this.growth(2008, 1400, 66, 82, 11);
    this.oval(1945, 1582, 92, 26, 0x253d36, true);
    this.rect(1890, 1592, 62, 4, 0x3d5845, true);
  }

  private drainage() {
    for (const [x, w] of [[2390, 212], [2710, 208]]) {
      this.solid(x + w / 2, 1130, w, 48);
      this.rect(x - 7, 1098, w + 14, 64, 0x525c4b);
      this.rect(x, 1105, w, 50, 0x1d302d);
      this.rect(x + 3, 1113, w - 6, 34, 0x304d40);
      for (let i = 0; i < w - 12; i += 19) {
        this.rect(x + i + 4, 1121 + i % 9, 12, 2, 0x5c7960);
      }
      this.rect(x, 1102, w, 3, 0x98987a);
      this.rect(x, 1155, w, 4, 0x363f32);
    }
    this.rect(2602, 1097, 108, 65, 0x7f7b60, true);
    for (let x = 2606; x < 2708; x += 10) this.rect(x, 1101, 2, 56, 0x3f4e40, true);
    this.rect(2603, 1092, 105, 5, 0x919078);
    this.rect(2603, 1162, 105, 5, 0x5c6853);
    this.growth(2414, 1177, 95, 25, 32);
    this.growth(2880, 1082, 85, 34, 7);
  }

  private diner() {
    this.rect(1280, 1276, 300, 280, 0x505646, true);
    for (let x = 1288; x < 1575; x += 24) {
      this.rect(x, 1282, 1, 267, 0x414b3c, true);
      for (let y = 1288; y < 1550; y += 24) this.rect(x + 2, y, 21, 1, 0x686c55, true);
    }
    this.solid(1405, 1340, 210, 90);
    this.solid(1330, 1440, 60, 110);
    this.rect(1300, 1295, 210, 90, 0x283c31);
    this.rect(1300, 1385, 60, 110, 0x283c31);
    this.rect(1305, 1300, 200, 60, 0x7b8067);
    this.rect(1305, 1360, 50, 130, 0x7b8067);
    for (let row = 1308; row < 1360; row += 8) this.rect(1311, row, 188, 2, 0x58684f);
    for (let row = 1368; row < 1490; row += 8) this.rect(1311, row, 38, 2, 0x58684f);
    this.rect(1304, 1300, 202, 3, 0xb2aa88);
    this.rect(1305, 1364, 200, 17, 0x64795c);
    this.label(1405, 1372, "LANCHONETE");
    for (let col = 1364; col < 1507; col += 16) {
      this.rect(col, 1381, 12, 9, col % 32 ? 0xa1a180 : 0x48674e);
    }
    this.rect(1378, 1383, 15, 9, 0x283c31);
    this.rect(1474, 1310, 24, 30, 0x3a5143);
    for (let row = 1314; row < 1338; row += 4) this.rect(1477, row, 18, 1, 0xa2ad8c);
    this.rect(1454, 1305, 8, 30, 0x9ba98a);
    this.rect(1451, 1304, 14, 5, 0x4a6652);
    this.rect(1301, 1432, 4, 32, 0x2c483c);
    this.rect(1305, 1440, 47, 5, 0x9b8460);
    for (const [x, y] of [[1440, 1465], [1530, 1428]]) {
      this.solid(x, y, 24, 24, false);
      this.oval(x + 3, y + 5, 34, 28, 0x24392c, true);
      this.oval(x, y, 30, 30, 0x6a6748);
      this.oval(x, y - 2, 26, 26, 0xaaa180);
      this.rect(x - 6, y - 3, 11, 2, 0x7a7959);
      for (const dy of [-26, 22]) {
        this.rect(x - 8, y + dy, 16, 6, 0x4a684e, true);
        this.rect(x - 9, y + dy - 2, 18, 3, 0x7e926f, true);
      }
    }
    this.rect(1393, 1526, 40, 5, 0x4f6d52, true);
    this.line(1393, 1526, 1415, 1548, 0x879879, true);
    this.line(1433, 1531, 1423, 1543, 0x879879, true);
    this.growth(1539, 1520, 70, 57, 51);
    this.rubble(1388, 1435, 44, 48, 9);
    this.rect(1578, 1464, 144, 28, 0x505646, true);
    this.rect(1194, 1387, 88, 28, 0x505646, true);
    this.rect(1194, 1222, 28, 193, 0x505646, true);
  }

  private chapelYard() {
    this.rect(128, 2326, 198, 180, 0x4c5545, true);
    this.solid(220, 2390, 118, 140);
    this.rect(159, 2318, 122, 145, 0x28382f);
    this.rect(165, 2324, 110, 110, 0x706c54);
    for (let row = 2329; row < 2433; row += 8) {
      this.rect(168, row, 104, 2, 0x434d3e);
      this.rect(172, row + 2, 96, 1, 0x8b8164);
    }
    this.rect(217, 2324, 6, 110, 0x9a9578);
    this.rect(215, 2350, 10, 38, 0xb7ac87);
    this.rect(203, 2360, 34, 9, 0xb7ac87);
    this.rect(163, 2435, 114, 24, 0x85866e);
    this.rect(206, 2437, 28, 22, 0x354737);
    this.rect(209, 2440, 22, 19, 0x5e5740);
    for (const x of [176, 252]) {
      this.rect(x, 2439, 12, 16, 0x2a4540);
      this.rect(x + 5, 2440, 2, 14, 0x9a9c7d);
    }
    this.rect(191, 2460, 58, 12, 0x6e745d, true);
    this.rect(195, 2472, 50, 8, 0x7f8066, true);
    this.rect(204, 2480, 32, 416, 0x4b503c, true);
    this.rect(108, 2734, 299, 24, 0x4b503c, true);
    for (const [x, y, crooked] of [[142, 2550, 0], [230, 2572, 1], [358, 2544, 0], [130, 2690, 1], [215, 2714, 0], [364, 2690, 0], [172, 2844, 0], [330, 2860, 1]]) {
      this.oval(x, y + 12, 39, 54, 0x3d3e2e, true);
      this.solid(x, y - 13, 20, 18);
      this.rect(x - 11, y - 26, 22, 26, 0x384b3c);
      this.rect(x - 8, y - 29 + crooked * 4, 16, 26, 0x7d8970);
      this.rect(x - 5, y - 27 + crooked * 4, 10, 2, 0xa1a58a);
      this.rect(x - 1, y - 21, 2, 9, 0x4d5b45);
      this.rect(x - 4, y - 18, 8, 2, 0x4d5b45);
      this.rect(x - 7, y + 2, 14, 2, 0x647052, true);
    }
    this.mesh(93, 2648, 244, true);
    this.mesh(95, 2860, 116, true);
    this.mesh(175, 2938, 164);
    this.mesh(365, 2938, 64);
    this.growth(354, 2880, 102, 83, 9);
    this.growth(121, 2590, 48, 68, 4);
    this.label(220, 2498, "CAPELA SANTA LUZIA", "#9ba48a", true);
  }

  private delivery() {
    this.rect(2370, 1926, 291, 65, 0x4b4d3c, true);
    this.solid(2482, 1938, 154, 66);
    this.rect(2405, 1905, 154, 66, 0x273932);
    this.rect(2410, 1909, 112, 57, 0x7e8064);
    for (let col = 2420; col < 2520; col += 12) this.rect(col, 1912, 2, 49, 0x515f49);
    this.rect(2522, 1912, 32, 51, 0x5c6c59);
    this.rect(2534, 1918, 16, 35, 0x2c4b43);
    this.rect(2538, 1920, 10, 3, 0x8ba38c);
    this.rect(2412, 1927, 28, 24, 0x374736);
    this.rect(2408, 1932, 18, 18, 0x374736);
    for (const x of [2420, 2530]) {
      this.rect(x, 1902, 19, 7, 0x172721);
      this.rect(x, 1966, 19, 7, 0x172721);
    }
    for (const [x, y] of [[2387, 1966], [2364, 2001], [2432, 1985]]) {
      this.rect(x, y, 16, 13, 0x96805a, true);
      this.rect(x + 2, y + 2, 12, 2, 0xb19b70, true);
      this.rect(x + 6, y + 2, 3, 10, 0x6a6246, true);
    }
    this.rubble(2480, 2005, 193, 49, 3);
    this.label(2461, 1940, "MANTIMENTOS", "#c1b48a");
    this.growth(2624, 1996, 76, 68, 22);
  }

  private loadingYard() {
    this.rect(2380, 2702, 268, 241, 0x3c4840, true);
    for (let x = 2400; x < 2610; x += 47) {
      this.rect(x, 2716, 24, 2, 0x90886a, true);
      this.rect(x, 2899, 24, 2, 0x90886a, true);
    }
    this.solid(2478, 2824, 64, 50);
    this.rect(2446, 2799, 64, 50, 0x354336);
    this.rect(2449, 2802, 29, 44, 0xa38c4d);
    this.rect(2480, 2802, 26, 44, 0x4a5140);
    this.rect(2483, 2805, 18, 37, 0x273d34);
    this.rect(2487, 2811, 10, 23, 0x776a49);
    this.rect(2477, 2794, 4, 61, 0x9a9e7e);
    this.rect(2506, 2796, 5, 58, 0x9a9e7e);
    this.rect(2511, 2808, 36, 5, 0x9caa8e, true);
    this.rect(2511, 2836, 36, 5, 0x9caa8e, true);
    for (const x of [2452, 2490]) {
      this.rect(x, 2796, 15, 6, 0x172720);
      this.rect(x, 2846, 15, 6, 0x172720);
    }
    this.solid(2587, 2828, 42, 42);
    for (let row = 0; row < 5; row++) this.rect(2566, 2808 + row * 8, 42, 5, row % 2 ? 0x6a5e40 : 0x92815a);
    this.rect(2571, 2812, 29, 27, 0x4d6253);
    this.rect(2574, 2815, 23, 3, 0x89977c);
    this.rect(2583, 2812, 4, 27, 0x9c9b79);
    this.oval(2420, 2881, 71, 28, 0x25392f, true);
    this.rubble(2585, 2918, 102, 45, 16);
    this.growth(2630, 2890, 56, 94, 21);
  }

  private checkpoints() {
    for (const [x, y, label] of [[300, 1500, "ÁREA ISOLADA"], [2190, 2050, "EVACUAÇÃO"], [2640, 2360, "CARGA / ACESSO"]] as const) {
      this.rect(x - 97, y - 30, 45, 8, 0x2c3c30, true);
      for (let i = 0; i < 6; i++) this.rect(x - 96 + i * 6, y - 30, 3, 8, 0x9a8b5e, true);
      this.rect(x + 62, y + 25, 40, 8, 0x2c3c30, true);
      for (const [dx, dy] of [[-82, 10], [83, -12], [63, 52]]) {
        this.rect(x + dx - 6, y + dy - 4, 12, 10, 0x27392c);
        this.rect(x + dx - 3, y + dy - 9, 6, 12, 0x9c6b43);
        this.rect(x + dx - 2, y + dy - 6, 4, 3, 0xc4b48b);
      }
      this.solid(x + 97, y - 48, 42, 10);
      this.rect(x + 76, y - 57, 42, 19, 0x4d5844);
      this.rect(x + 78, y - 55, 38, 3, 0x99916b);
      this.label(x + 97, y - 46, label, "#c5b993");
      this.rubble(x - 61, y + 40, 58, 36, x);
    }
  }

  private connections() {
    this.rect(1944, 652, 158, 68, 0x484d43, true);
    this.rect(1974, 658, 122, 2, 0x8d8968, true);
    this.rect(1974, 713, 122, 2, 0x8d8968, true);
    this.rect(2020, 1494, 82, 40, 0x525b4b, true);
    this.rect(781, 1924, 121, 48, 0x4a5646, true);
    this.rect(642, 1318, 260, 46, 0x50594e, true);
    for (let x = 660; x < 880; x += 36) this.rect(x, 1340, 15, 2, 0xa09d79, true);
    this.rect(501, 786, 32, 100, 0x4e5541, true);
    this.rect(501, 854, 382, 32, 0x4e5541, true);
    this.rect(2302, 1940, 103, 44, 0x4b4d3c, true);
    this.rect(2560, 1941, 200, 20, 0x444b38, true);
    this.rect(2738, 1911, 22, 50, 0x444b38, true);
    for (let i = 0; i < 18; i++) {
      this.rect(2580 + i * 9, 1947 + (i % 3) * 3, 3, 2, 0x8d8263, true);
    }
  }
}
