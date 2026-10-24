import Phaser from "phaser";

export default class Zombie {
  public sprite: Phaser.GameObjects.Rectangle;
  public body: Phaser.Physics.Arcade.Body;
  public speed = 80;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.rectangle(x, y, 28, 28, 0xe74c3c);

    scene.physics.add.existing(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
  }

  follow(target: Phaser.GameObjects.Rectangle) {
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      target.x,
      target.y
    );

    this.body.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }
}
