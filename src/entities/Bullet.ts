import Phaser from "phaser";

export default class Bullet {
  public sprite: Phaser.GameObjects.Arc;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    this.sprite = scene.add.circle(x, y, 5, 0xffff66);

    scene.physics.add.existing(this.sprite);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);

    // Remove o projétil após 1,5 segundo para evitar acumular objetos desnecessários
    scene.time.delayedCall(1500, () => {
      if (this.sprite.active) {
        this.sprite.destroy();
      }
    });
  }

  setVelocity(angle: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    body.setVelocity(
      Math.cos(angle) * 600,
      Math.sin(angle) * 600,
    );
  }
}
