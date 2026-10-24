import Phaser from "phaser";
import "./style.css";

class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private zombie!: Phaser.GameObjects.Rectangle;
  private bullets!: Phaser.Physics.Arcade.Group;

  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super("GameScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#171b22");

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x252c35, 0.8);

    for (let x = 0; x <= 2000; x += 64) {
      graphics.lineBetween(x, 0, x, 2000);
    }

    for (let y = 0; y <= 2000; y += 64) {
      graphics.lineBetween(0, y, 2000, y);
    }

    this.physics.world.setBounds(0, 0, 2000, 2000);

    this.player = this.add.rectangle(1000, 1000, 28, 28, 0x55ddaa);

    this.physics.add.existing(this.player);

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as typeof this.wasd;

    this.cameras.main.setBounds(0, 0, 2000, 2000);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5);

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const worldPoint = pointer.positionToCamera(
        this.cameras.main,
      ) as Phaser.Math.Vector2;

      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        worldPoint.x,
        worldPoint.y,
      );

      this.player.setRotation(angle);
    });

    this.bullets = this.physics.add.group({
      maxSize: 50,
      runChildUpdate: false,
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.button !== 0) return;

      const bullet = this.add.circle(this.player.x, this.player.y, 5, 0xffff66);

      this.physics.add.existing(bullet);
      this.bullets.add(bullet);

      const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;

      const worldPoint = pointer.positionToCamera(
        this.cameras.main,
      ) as Phaser.Math.Vector2;

      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        worldPoint.x,
        worldPoint.y,
      );

      bulletBody.setVelocity(Math.cos(angle) * 600, Math.sin(angle) * 600);

      // Destruir projétil após 1,5 segundo
      this.time.delayedCall(1500, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    });

    this.add
      .text(16, 16, "AFTERFALL", {
        fontSize: "22px",
        color: "#55ddaa",
        fontStyle: "bold",
      })
      .setScrollFactor(0);

    // Primeiro zumbi
    this.zombie = this.add.rectangle(1200, 1000, 28, 28, 0xe74c3c);

    this.physics.add.existing(this.zombie);

    const zombieBody = this.zombie.body as Phaser.Physics.Arcade.Body;
    zombieBody.setCollideWorldBounds(true);

    // Colisão entre projéteis e zumbi
    this.physics.add.overlap(this.bullets, this.zombie, (bullet, zombie) => {
      bullet.destroy();
      zombie.destroy();
    });
  }

  update() {
    // Movimentação do jogador
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const direction = new Phaser.Math.Vector2(0, 0);

    if (this.wasd.A.isDown || this.cursors.left.isDown) {
      direction.x -= 1;
    }

    if (this.wasd.D.isDown || this.cursors.right.isDown) {
      direction.x += 1;
    }

    if (this.wasd.W.isDown || this.cursors.up.isDown) {
      direction.y -= 1;
    }

    if (this.wasd.S.isDown || this.cursors.down.isDown) {
      direction.y += 1;
    }

    direction.normalize();
    body.setVelocity(direction.x * 220, direction.y * 220);

    // Zumbi persegue o jogador enquanto estiver vivo
    if (this.zombie.active) {
      const zombieBody = this.zombie.body as Phaser.Physics.Arcade.Body;

      const angle = Phaser.Math.Angle.Between(
        this.zombie.x,
        this.zombie.y,
        this.player.x,
        this.player.y,
      );

      zombieBody.setVelocity(Math.cos(angle) * 80, Math.sin(angle) * 80);
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 600,
  parent: "game",
  backgroundColor: "#171b22",
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scene: GameScene,
});
