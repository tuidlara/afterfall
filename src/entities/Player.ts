import Phaser from "phaser";

export default class Player {
  public static readonly FRAME_SIZE = 512;
  public sprite: Phaser.GameObjects.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  private lastX: number;
  private lastY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.sprite(x, y, "player-walk", 0);
    this.sprite.setOrigin(0.5, 11 / 32).setDisplaySize(48, 48);
    scene.textures.get("player-walk").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.lastX = x;
    this.lastY = y;

    if (!scene.anims.exists("player-walk")) {
      scene.anims.create({
        key: "player-walk",
        frames: scene.anims.generateFrameNumbers("player-walk", { frames: [1, 2, 0, 4, 5, 3] }),
        frameRate: 10,
        repeat: -1,
      });
    }

    scene.physics.add.existing(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    // Preserva a colisão de 13,5 px do sprite anterior, apesar da nova resolução.
    const bodyWidth = 13.5 / this.sprite.scaleX;
    const bodyHeight = 13.5 / this.sprite.scaleY;
    this.body.setSize(bodyWidth, bodyHeight);
    this.body.setOffset(
      this.sprite.displayOriginX - bodyWidth / 2,
      this.sprite.displayOriginY - bodyHeight / 2,
    );
    this.body.setCollideWorldBounds(true);

    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.updateWalkAnimation, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.updateWalkAnimation, this);
    });
  }

  private updateWalkAnimation(_time: number, delta: number) {
    const distance = Math.hypot(this.sprite.x - this.lastX, this.sprite.y - this.lastY);
    this.lastX = this.sprite.x;
    this.lastY = this.sprite.y;
    const speed = delta > 0 ? distance * 1000 / delta : 0;

    if (speed < 1 || Math.hypot(this.body.velocity.x, this.body.velocity.y) < 1) {
      if (this.sprite.anims.isPlaying) this.sprite.anims.stop();
      this.sprite.setFrame(0);
      return;
    }

    this.sprite.anims.timeScale = Phaser.Math.Clamp(speed / 140, 0.6, 1.3);
    this.sprite.play("player-walk", true);
  }

  getMuzzlePosition() {
    // O cano ocupa a mesma posição nos seis frames da spritesheet.
    const localX = (350 - this.sprite.displayOriginX) * this.sprite.scaleX;
    const localY = (87 - this.sprite.displayOriginY) * this.sprite.scaleY;
    const cos = Math.cos(this.sprite.rotation);
    const sin = Math.sin(this.sprite.rotation);

    return {
      x: this.sprite.x + localX * cos - localY * sin,
      y: this.sprite.y + localX * sin + localY * cos,
    };
  }
}
