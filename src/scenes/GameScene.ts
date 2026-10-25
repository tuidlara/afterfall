import Phaser from "phaser";
import Player from "../entities/Player";
import Bullet from "../entities/Bullet";
import ZombieManager from "../entities/ZombieManager";
import Zombie from "../entities/Zombie";
import { Obstacle } from "../entities/Obstacle";

class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private zombieManager!: ZombieManager;
  private bullets!: Phaser.Physics.Arcade.Group;
  private waitingForNextWave = false;
  private registeredZombies = new Set<Zombie>();
  private obstacles: Obstacle[] = [];

  private health = 100;
  private ammo = 12;
  private readonly magazineSize = 12;
  private reloading = false;
  private reloadKey!: Phaser.Input.Keyboard.Key;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  private uiObjects: Phaser.GameObjects.GameObject[] = [];
  private healthBar!: Phaser.GameObjects.Rectangle;
  private healthText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
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

  preload() {
    this.load.audio("shot", "/audio/shot.mp3");
    this.load.audio("reload", "/audio/reload.mp3");
    this.load.audio("zombie-death", "/audio/zombie-death.mp3");
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

    this.player = new Player(this, 1000, 1000);

    this.obstacles = [
      new Obstacle(this, 800, 800, 100, 100),
      new Obstacle(this, 1200, 800, 100, 100),
      new Obstacle(this, 800, 1200, 100, 100),
      new Obstacle(this, 1200, 1200, 100, 100),
      new Obstacle(this, 1000, 700, 140, 60),
      new Obstacle(this, 700, 1000, 60, 140),
      new Obstacle(this, 1300, 1000, 60, 140),
    ];

    for (const obstacle of this.obstacles) {
      this.physics.add.collider(this.player.sprite, obstacle.sprite);
    }

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as typeof this.wasd;

    this.reloadKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.R,
    );

    this.cameras.main.setBounds(0, 0, 2000, 2000);
    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setZoom(1.5);

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const worldPoint = pointer.positionToCamera(
        this.cameras.main,
      ) as Phaser.Math.Vector2;

      const angle = Phaser.Math.Angle.Between(
        this.player.sprite.x,
        this.player.sprite.y,
        worldPoint.x,
        worldPoint.y,
      );

      this.player.sprite.setRotation(angle);
    });

    this.bullets = this.physics.add.group({
      maxSize: 50,
      runChildUpdate: false,
    });

    for (const obstacle of this.obstacles) {
      this.physics.add.collider(this.bullets, obstacle.sprite, (obj1, obj2) => {
        const bulletSprite = this.bullets.contains(
          obj1 as Phaser.GameObjects.GameObject,
        )
          ? (obj1 as Phaser.GameObjects.Arc)
          : (obj2 as Phaser.GameObjects.Arc);

        if (bulletSprite.active) {
          bulletSprite.destroy();
        }
      });
    }

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

    this.waveText = this.add.text(16, 120, "ONDA 1", {
      fontSize: "16px",
      color: "#55ddaa",
      fontStyle: "bold",
    });

    this.ammoText = this.add.text(16, 146, "MUNIÇÃO: 12 / 12", {
      fontSize: "16px",
      color: "#ffffff",
    });

    this.uiObjects = [
      title,
      vidaLabel,
      barBg,
      this.healthBar,
      this.healthText,
      this.waveText,
      this.ammoText,
    ];

    this.zombieManager = new ZombieManager(
      this,
      this.player.sprite,
      this.obstacles.map((obstacle) => obstacle.sprite),
    );
    this.zombieManager.startWave();

    this.uiCamera = this.cameras.add(0, 0, 960, 600);
    this.uiCamera.setScroll(0, 0);
    this.uiCamera.setZoom(1);

    this.uiCamera.ignore([
      graphics,
      this.player.sprite,
      ...this.obstacles.map((obstacle) => obstacle.sprite),
      ...this.zombieManager.getAll().map((zombie) => zombie.sprite),
    ]);

    this.cameras.main.ignore(this.uiObjects);

    this.registerNewZombies();

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.button !== 0 || this.gameOver) return;

      if (this.reloading || this.ammo <= 0) return;

      this.sound.play("shot");
      this.ammo--;

      this.ammoText.setText(`MUNIÇÃO: ${this.ammo} / ${this.magazineSize}`);

      const worldPoint = pointer.positionToCamera(
        this.cameras.main,
      ) as Phaser.Math.Vector2;

      const angle = Phaser.Math.Angle.Between(
        this.player.sprite.x,
        this.player.sprite.y,
        worldPoint.x,
        worldPoint.y,
      );

      const bullet = new Bullet(
        this,
        this.player.sprite.x,
        this.player.sprite.y,
      );

      this.bullets.add(bullet.sprite);
      this.uiCamera.ignore(bullet.sprite);
      bullet.setVelocity(angle);
    });
  }

  update() {
    if (this.gameOver) return;

    if (Phaser.Input.Keyboard.JustDown(this.reloadKey)) {
      this.reload();
    }

    const body = this.player.body;
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

    this.zombieManager.update();
    this.registerNewZombies();

    if (this.zombieManager.getAliveCount() === 0 && !this.waitingForNextWave) {
      this.waitingForNextWave = true;

      this.time.delayedCall(2000, () => {
        if (this.gameOver) return;

        const nextWave = this.zombieManager.getCurrentWave() + 1;

        this.showWaveAnnouncement(nextWave, () => {
          if (this.gameOver) return;

          this.zombieManager.startWave();
          this.waveText.setText(`ONDA ${this.zombieManager.getCurrentWave()}`);
          this.registerNewZombies();

          this.waitingForNextWave = false;
        });
      });
    }
  }

  private registerNewZombies() {
    for (const zombie of this.zombieManager.getAll()) {
      if (this.registeredZombies.has(zombie)) continue;

      this.registeredZombies.add(zombie);

      for (const obstacle of this.obstacles) {
        this.physics.add.collider(zombie.sprite, obstacle.sprite);
      }

      this.physics.add.overlap(this.player.sprite, zombie.sprite, () => {
        const now = this.time.now;

        if (!this.gameOver && now - this.lastDamageTime >= 1000) {
          this.lastDamageTime = now;
          this.takeDamage(20);
        }
      });

      this.physics.add.overlap(this.bullets, zombie.sprite, (obj1, obj2) => {
        const bulletSprite = this.bullets.contains(
          obj1 as Phaser.GameObjects.GameObject,
        )
          ? (obj1 as Phaser.GameObjects.Arc)
          : (obj2 as Phaser.GameObjects.Arc);

        if (!zombie.sprite.active || !bulletSprite.active) return;

        bulletSprite.destroy();
        zombie.takeDamage(1);
      });

      this.uiCamera.ignore([zombie.sprite, ...zombie.getHealthBarObjects()]);
    }
  }

  private showWaveAnnouncement(wave: number, onComplete: () => void) {
    const announcement = this.add
      .text(480, 300, `ONDA ${wave}`, {
        fontSize: "56px",
        color: "#55ddaa",
        fontStyle: "bold",
        stroke: "#101418",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.7);

    this.uiObjects.push(announcement);
    this.cameras.main.ignore(announcement);

    this.tweens.add({
      targets: announcement,
      alpha: 1,
      scale: 1,
      duration: 400,
      ease: "Back.Out",
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.tweens.add({
            targets: announcement,
            alpha: 0,
            scale: 1.15,
            duration: 300,
            onComplete: () => {
              announcement.destroy();
              onComplete();
            },
          });
        });
      },
    });
  }

  private takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);

    this.healthBar.setDisplaySize(160 * (this.health / 100), 18);

    this.healthBar.setFillStyle(this.health <= 40 ? 0xe74c3c : 0x55dd66);

    this.healthText.setText(`${this.health} / 100`);

    this.player.sprite.setFillStyle(0xff5555);

    this.time.delayedCall(150, () => {
      if (this.player.sprite.active && !this.gameOver) {
        this.player.sprite.setFillStyle(0x55ddaa);
      }
    });

    if (this.health <= 0) {
      this.gameOver = true;
      this.player.body.setVelocity(0, 0);
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

  private reload() {
    if (this.reloading || this.ammo === this.magazineSize) return;

    this.reloading = true;
    this.sound.play("reload");
    this.ammoText.setText("RECARREGANDO...");

    this.time.delayedCall(1500, () => {
      if (this.gameOver) {
        this.reloading = false;
        return;
      }

      this.ammo = this.magazineSize;
      this.reloading = false;

      this.ammoText.setText(`MUNIÇÃO: ${this.ammo} / ${this.magazineSize}`);
    });
  }
}

export default GameScene;
