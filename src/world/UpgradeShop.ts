import Phaser from "phaser";
import { Obstacle } from "../entities/Obstacle";

export default class UpgradeShop {
  public readonly obstacle: Obstacle;
  public readonly visuals: Phaser.GameObjects.GameObject[];
  private prompt: Phaser.GameObjects.Text;
  public readonly x: number;
  public readonly y: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.obstacle = new Obstacle(scene, x, y, 64, 44);
    this.obstacle.visuals.forEach((visual) => visual.setVisible(false));
    const shadow = scene.add.graphics().setDepth(-1);
    shadow.fillStyle(0x423f30, 0.45);
    shadow.fillRect(x - 22, y + 12, 43, 18);
    shadow.fillRect(x - 29, y + 19, 38, 7);
    shadow.fillStyle(0x10191a, 0.5);
    shadow.fillRect(x - 27, y - 17, 60, 36);
    shadow.fillRect(x - 18, y + 12, 48, 14);
    shadow.fillStyle(0xaaa082, 0.65);
    shadow.fillRect(x - 25, y + 27, 5, 3);
    shadow.fillRect(x + 22, y + 24, 3, 5);
    shadow.fillStyle(0x4c583b, 0.7);
    shadow.fillRect(x - 34, y - 8, 5, 3);
    shadow.fillRect(x - 32, y - 13, 2, 7);
    const booth = scene.add.graphics().setDepth(2);
    const rect = (dx: number, dy: number, w: number, h: number, color: number) => {
      booth.fillStyle(color);
      booth.fillRect(x + dx, y + dy, w, h);
    };
    rect(-28, -20, 5, 42, 0x3c3427);
    rect(25, -16, 5, 36, 0x343d36);
    rect(-26, -19, 2, 39, 0x9c8357);
    rect(27, -12, 2, 29, 0x89927b);
    rect(-28, -22, 51, 4, 0x343e39);
    rect(-25, -19, 13, 23, 0x445e58);
    rect(-12, -20, 17, 26, 0x506a60);
    rect(5, -17, 15, 19, 0x3c5854);
    rect(20, -14, 7, 14, 0x304943);
    rect(-24, -17, 25, 2, 0x7b8a6b);
    rect(-9, -18, 2, 22, 0x2b443f);
    rect(-20, -9, 10, 8, 0x9a8d64);
    rect(-19, -8, 8, 1, 0xb3a479);
    rect(-18, -2, 1, 3, 0x514c36);
    rect(7, -13, 8, 6, 0x596f62);
    rect(17, -1, 3, 4, 0x141f1c);
    rect(23, -3, 3, 5, 0x141f1c);

    rect(-32, 4, 17, 17, 0x453d2c);
    rect(-30, 5, 14, 14, 0x7a6242);
    rect(-29, 7, 12, 2, 0x9c8157);
    rect(-28, 14, 10, 2, 0x4e4832);
    rect(-25, 5, 2, 14, 0x424535);
    rect(-29, -1, 12, 7, 0x67694e);
    rect(-27, 0, 8, 1, 0x9a9b75);

    rect(-13, 7, 44, 14, 0x342e24);
    rect(-12, 7, 21, 11, 0x89704c);
    rect(9, 9, 22, 11, 0x725d40);
    rect(-10, 8, 17, 2, 0xb39b6b);
    rect(11, 10, 18, 1, 0x9a8258);
    rect(-9, 16, 19, 2, 0x544834);
    rect(17, 17, 10, 2, 0x443d2c);
    rect(-7, 9, 12, 6, 0x513d32);
    rect(-5, 9, 8, 2, 0x9c6750);
    rect(-3, 12, 3, 2, 0xaaa58b);
    rect(12, 11, 3, 7, 0xa3afa0);
    rect(10, 10, 7, 3, 0x9aa593);
    rect(12, 10, 3, 2, 0x4a5145);
    rect(23, 12, 5, 3, 0x353f37);
    rect(24, 11, 3, 1, 0xabb18d);

    rect(21, -11, 8, 10, 0x302f24);
    rect(23, -9, 4, 6, 0xd4a45c);
    rect(24, -8, 2, 3, 0xffdc8f);
    rect(-20, -38, 2, 17, 0x69664b);
    rect(20, -35, 2, 20, 0x69664b);
    rect(-29, -43, 72, 17, 0x322d23);
    rect(-27, -43, 67, 14, 0x776145);
    rect(-24, -42, 58, 2, 0xa18b62);
    rect(28, -32, 10, 2, 0x4b4030);
    const label = scene.add.text(x + 6, y - 36, "MELHORIAS", {
      fontFamily: "monospace", fontSize: "10px", fontStyle: "bold", color: "#e2d0a1",
    }).setOrigin(0.5).setRotation(-0.035).setDepth(3);
    this.prompt = scene.add.text(x, y + 38, "[E] CONSULTAR LOJA", {
      fontFamily: "monospace", fontSize: "12px", color: "#efe3bd",
      backgroundColor: "#19251e", padding: { x: 4, y: 3 },
    }).setOrigin(0.5).setDepth(3).setVisible(false);
    this.visuals = [shadow, booth, label, this.prompt];
  }

  isInRange(player: { x: number; y: number }) {
    return Math.hypot(player.x - this.x, player.y - this.y) <= 96;
  }

  updatePrompt(player: { x: number; y: number }) {
    this.prompt.setVisible(this.isInRange(player));
  }
}
