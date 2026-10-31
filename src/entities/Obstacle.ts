export class Obstacle {
  public sprite: Phaser.GameObjects.Rectangle;
  public body: Phaser.Physics.Arcade.StaticBody;
  public visuals: Phaser.GameObjects.Rectangle[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this.sprite = scene.add.rectangle(x, y, width, height, 0x686868);

    scene.physics.add.existing(this.sprite, true);

    this.body = this.sprite.body as Phaser.Physics.Arcade.StaticBody;

    this.sprite.setVisible(false);

    const base = scene.add.rectangle(x, y, width, height, 0x77736a);
    base.setStrokeStyle(3, 0x403e39);

    const detail = scene.add.rectangle(x, y, width - 12, height - 12, 0x928b7d);
    detail.setStrokeStyle(1, 0x625d53);

    this.visuals.push(base, detail);

    this.visuals.forEach((visual) => visual.setDepth(2));
  }
}
