import Phaser from "phaser";
import { Obstacle } from "./Obstacle";

export type DebrisType = "barrel" | "tire" | "crate" | "concrete";

export default class UrbanDebris {
  public obstacle: Obstacle;
  public visuals: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Ellipse)[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: DebrisType
  ) {
    const sizes = {
      barrel: [30, 30],
      tire: [38, 38],
      crate: [42, 38],
      concrete: [65, 45],
    };

    const [width, height] = sizes[type];

    this.obstacle = new Obstacle(scene, x, y, width, height);
    this.obstacle.sprite.setVisible(false);

    const addRect = (
      px: number,
      py: number,
      w: number,
      h: number,
      color: number
    ) => {
      const object = scene.add.rectangle(px, py, w, h, color);
      object.setStrokeStyle(2, 0x292724);
      this.visuals.push(object);
    };

    const addEllipse = (
      px: number,
      py: number,
      w: number,
      h: number,
      color: number
    ) => {
      const object = scene.add.ellipse(px, py, w, h, color);
      object.setStrokeStyle(2, 0x292724);
      this.visuals.push(object);
    };

    if (type === "barrel") {
      addEllipse(x, y, 30, 30, 0x75513b);
      addRect(x, y - 7, 29, 4, 0x423b32);
      addRect(x, y + 7, 29, 4, 0x423b32);
    }

    if (type === "tire") {
      addEllipse(x, y, 38, 38, 0x202020);
      addEllipse(x, y, 17, 17, 0x55514a);
    }

    if (type === "crate") {
      addRect(x, y, 42, 38, 0x795735);
      addRect(x, y, 5, 35, 0x493723);
      addRect(x, y, 38, 5, 0x493723);
    }

    if (type === "concrete") {
      addRect(x, y, 65, 45, 0x69665d);
      addRect(x - 13, y - 8, 25, 12, 0x817c70);
      addRect(x + 15, y + 10, 24, 10, 0x4e4d48);
    }

    this.visuals.forEach((object) => object.setDepth(2));
  }
}
