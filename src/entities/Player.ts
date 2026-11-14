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

  getMuzzlePosition() {
    // Ponta do cano no sprite original de 64×64.
    const localX = (46 - this.sprite.displayOriginX) * this.sprite.scaleX;
    const localY = (17 - this.sprite.displayOriginY) * this.sprite.scaleY;
    const cos = Math.cos(this.sprite.rotation);
    const sin = Math.sin(this.sprite.rotation);

    return {
      x: this.sprite.x + localX * cos - localY * sin,
      y: this.sprite.y + localX * sin + localY * cos,
    };
  }
}
