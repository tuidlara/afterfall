import Phaser from "phaser";

export default class Player {
  public sprite: Phaser.GameObjects.Image;
  public body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.image(x, y, "player");

    this.sprite.setDisplaySize(36, 36);

    scene.physics.add.existing(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setSize(24, 24);
    this.body.setCollideWorldBounds(true);
  }
}
