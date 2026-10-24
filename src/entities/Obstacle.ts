export class Obstacle {
  public sprite: Phaser.GameObjects.Rectangle;
  public body: Phaser.Physics.Arcade.StaticBody;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.sprite = scene.add.rectangle(
      x,
      y,
      width,
      height,
      0x686868
    );

    scene.physics.add.existing(this.sprite, true);

    this.body = this.sprite.body as Phaser.Physics.Arcade.StaticBody;
  }
}
