import Phaser from "phaser";
import "./style.css";

class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private zombie!: Phaser.GameObjects.Rectangle;
  private bullets!: Phaser.Physics.Arcade.Group;

  private health = 100;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  private uiObjects: Phaser.GameObjects.GameObject[] = [];
  private healthBar!: Phaser.GameObjects.Rectangle;
  private healthText!: Phaser.GameObjects.Text;
  private gameOver = false;
  private lastDamageTime = 0;

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
    // Mira acompanha o mouse
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

    // Grupo de projéteis
    this.bullets = this.physics.add.group({
      maxSize: 50,
      runChildUpdate: false,
    });

    // Disparar com o botão esquerdo do mouse
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.button !== 0 || this.gameOver) return;

      const bullet = this.add.circle(this.player.x, this.player.y, 5, 0xffff66);

      this.physics.add.existing(bullet);
      this.bullets.add(bullet);
      this.uiCamera.ignore(bullet);

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

      // Remover projétil após 1,5 segundo
      this.time.delayedCall(1500, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    });

    // Interface fixa na tela
    const title = this.add.text(16, 16, "AFTERFALL", {
      fontSize: "22px",
      color: "#55ddaa",
      fontStyle: "bold",
    });

    const vidaLabel = this.add.text(16, 50, "VIDA", {
      fontSize: "16px",
      color: "#ffffff",
    });

    const barBg = this.add
      .rectangle(16, 76, 160, 18, 0x444444)
      .setOrigin(0, 0.5);

    this.healthBar = this.add
      .rectangle(16, 76, 160, 18, 0x55dd66)
      .setOrigin(0, 0.5);

    this.healthText = this.add.text(16, 96, "100 / 100", {
      fontSize: "14px",
      color: "#ffffff",
    });

    this.uiObjects = [title, vidaLabel, barBg, this.healthBar, this.healthText];

    // Primeiro zumbi
    this.zombie = this.add.rectangle(1200, 1000, 28, 28, 0xe74c3c);

    this.physics.add.existing(this.zombie);

    const zombieBody = this.zombie.body as Phaser.Physics.Arcade.Body;

    zombieBody.setCollideWorldBounds(true);

    // Dano por contato entre jogador e zumbi
    this.physics.add.overlap(this.player, this.zombie, () => {
      const now = this.time.now;

      if (!this.gameOver && now - this.lastDamageTime >= 1000) {
        this.lastDamageTime = now;
        this.takeDamage(20);
      }
    });

    // Tiro acerta o zumbi
    this.physics.add.overlap(this.bullets, this.zombie, (bullet, zombie) => {
      bullet.destroy();
      zombie.destroy();
    });

    this.uiCamera = this.cameras.add(0, 0, 960, 600);
    this.uiCamera.setScroll(0, 0);
    this.uiCamera.setZoom(1);

    this.uiCamera.ignore([graphics, this.player, this.zombie]);

    this.cameras.main.ignore(this.uiObjects);
  }

  update() {
    if (this.gameOver) return;

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

  private takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);

    // Atualizar barra e texto de vida
    this.healthBar.setDisplaySize(160 * (this.health / 100), 18);

    this.healthBar.setFillStyle(this.health <= 40 ? 0xe74c3c : 0x55dd66);

    this.healthText.setText(`${this.health} / 100`);

    this.player.setFillStyle(0xff5555);

    this.time.delayedCall(150, () => {
      if (this.player.active && !this.gameOver) {
        this.player.setFillStyle(0x55ddaa);
      }
    });

    // Derrota
    if (this.health <= 0) {
      this.gameOver = true;

      const body = this.player.body as Phaser.Physics.Arcade.Body;

      body.setVelocity(0, 0);

      this.physics.pause();

      const overlay = this.add.rectangle(480, 300, 960, 600, 0x000000, 0.75);

      const deathText = this.add
        .text(480, 260, "VOCÊ MORREU", {
          fontSize: "48px",
          color: "#e74c3c",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      const endText = this.add
        .text(480, 320, "FIM DE JOGO", {
          fontSize: "22px",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      this.uiObjects.push(overlay, deathText, endText);
      this.cameras.main.ignore([overlay, deathText, endText]);
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
