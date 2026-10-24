import Phaser from "phaser";

export default class Player {
  public sprite: Phaser.GameObjects.Rectangle;
  public body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.rectangle(x, y, 28, 28, 0x55ddaa);

    scene.physics.add.existing(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
  }
}