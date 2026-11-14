import Phaser from "phaser";

export default class Bullet {
  public sprite: Phaser.GameObjects.Image;
  private static readonly HITBOX_SIZE = 10;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    const texture = Bullet.createTexture(scene);
    this.sprite = scene.add.image(x, y, texture).setDepth(3);

    scene.physics.add.existing(this.sprite);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    // Mantém a área de acerto anterior, independente do desenho e da rotação.
    body.setSize(Bullet.HITBOX_SIZE, Bullet.HITBOX_SIZE, true);

    scene.time.delayedCall(1500, () => {
      if (this.sprite.active) {
        this.sprite.destroy();
      }
    });
  }

  setVelocity(angle: number) {
    this.sprite.setRotation(angle);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    body.setVelocity(
      Math.cos(angle) * 600,
      Math.sin(angle) * 600,
    );
  }

  static isMuzzleBlocked(
    origin: { x: number; y: number },
    muzzle: { x: number; y: number },
    obstacles: Phaser.GameObjects.Rectangle[],
  ) {
    const line = new Phaser.Geom.Line(origin.x, origin.y, muzzle.x, muzzle.y);
    const padding = Bullet.HITBOX_SIZE / 2;

    return obstacles.some((obstacle) => {
      if (!obstacle.active) return false;

      // Inclui o volume do projétil para não nascer parcialmente dentro da parede.
      const bounds = new Phaser.Geom.Rectangle(
        obstacle.x - obstacle.width / 2 - padding,
        obstacle.y - obstacle.height / 2 - padding,
        obstacle.width + Bullet.HITBOX_SIZE,
        obstacle.height + Bullet.HITBOX_SIZE,
      );
      return Phaser.Geom.Intersects.LineToRectangle(line, bounds);
    });
  }

  private static createTexture(scene: Phaser.Scene) {
    const key = "bullet-tracer";
    if (scene.textures.exists(key)) return key;

    const graphics = scene.add.graphics();
    graphics.fillStyle(0x9c957c, 0.25);
    graphics.fillRect(0, 4, 8, 2);
    graphics.fillStyle(0xc2b89a, 0.6);
    graphics.fillRect(5, 4, 8, 2);
    graphics.fillStyle(0xeee4c6);
    graphics.fillRect(12, 4, 5, 2);
    graphics.generateTexture(key, 18, 10);
    graphics.destroy();
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    return key;
  }
}
