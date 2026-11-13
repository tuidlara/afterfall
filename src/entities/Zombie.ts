import Phaser from "phaser";
import ZombiePathfinding from "./ZombiePathfinding";
import { ZOMBIE_CONFIG, type ZombieType } from "./ZombieTypes";

type Point = { x: number; y: number };

export default class Zombie {
  public sprite: Phaser.GameObjects.Image;
  public body: Phaser.Physics.Arcade.Body;
  public readonly type: ZombieType;
  public readonly speed: number;
  public readonly damage: number;

  public health: number;
  public readonly maxHealth: number;

  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Rectangle;

  private static readonly LOS_PADDING = 12;

  // ---- Estado de cada zumbi ----
  private scene: Phaser.Scene;
  public uiCamera?: Phaser.Cameras.Scene2D.Camera;
  private path: Point[] = [];
  private pathTargetX = -9999;
  private pathTargetY = -9999;
  private nextRepathAt = 0;

  private lastCheckAt = 0;
  private lastCheckX = 0;
  private lastCheckY = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: ZombieType = "normal",
  ) {
    this.scene = scene;
    this.type = type;

    const config = ZOMBIE_CONFIG[type];

    this.speed = config.speed;
    this.maxHealth = config.health;
    this.health = config.health;
    this.damage = config.damage;

    const texture = type === "runner" ? "zombie-runner" : "zombie";

    this.sprite = scene.add.image(x, y, texture);
    this.sprite.setDisplaySize(72, 72);

    if (type === "tank") {
      this.sprite.setTint(config.tint);
    }

    scene.physics.add.existing(this.sprite);

    this.healthBarBg = scene.add
      .rectangle(this.sprite.x, this.sprite.y - 24, 34, 5, 0x222222)
      .setDepth(10);

    this.healthBar = scene.add
      .rectangle(this.sprite.x, this.sprite.y - 24, 34, 5, 0x55dd66)
      .setOrigin(0, 0.5)
      .setDepth(11);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setSize(32 / this.sprite.scaleX, 32 / this.sprite.scaleY);
    this.body.setMaxVelocity(this.speed, this.speed);

    this.lastCheckX = x;
    this.lastCheckY = y;

    // Desencontra o momento de recalcular caminho entre zumbis
    this.nextRepathAt = scene.time.now + Math.random() * 300;
  }

  takeDamage(amount: number) {
    if (!this.sprite.active) return;

    this.health -= amount;

    const ratio = Math.max(0, this.health) / this.maxHealth;

    this.healthBar.setDisplaySize(34 * ratio, 5);
    this.healthBar.setFillStyle(
      ratio <= 0.33 ? 0xe74c3c : ratio <= 0.66 ? 0xf1c40f : 0x55dd66,
    );

    this.sprite.setTint(0xff3333);

    this.scene.time.delayedCall(100, () => {
      if (this.sprite.active) {
        if (this.type === "tank") {
          this.sprite.setTint(ZOMBIE_CONFIG[this.type].tint);
        } else {
          this.sprite.clearTint();
        }
      }
    });

    if (this.health <= 0) {
      this.scene.sound.play("zombie-death");

      const particles = this.scene.add.particles(
        this.sprite.x,
        this.sprite.y,
        "__WHITE",
        {
          speed: { min: 40, max: 140 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.7, end: 0 },
          lifespan: 250,
          quantity: 12,
          tint: 0xc0392b,
          emitting: false,
        },
      );

      this.uiCamera?.ignore(particles);

      particles.explode();

      this.scene.time.delayedCall(300, () => {
        particles.destroy();
      });

      this.healthBarBg.destroy();
      this.healthBar.destroy();
      this.sprite.destroy();
    }
  }

  updateHealthBar() {
    this.healthBarBg.setPosition(this.sprite.x, this.sprite.y - 24);
    this.healthBar.setPosition(this.sprite.x - 17, this.sprite.y - 24);
  }

  getHealthBarObjects() {
    return [this.healthBarBg, this.healthBar];
  }

  /**
   * @param target    jogador
   * @param obstacles obstáculos (retângulos com origem no centro)
   * @param others    lista de todos os zumbis (para não se empilharem)
   */
  follow(
    target: Phaser.GameObjects.Image,
    obstacles: Phaser.GameObjects.Rectangle[] = [],
    others: Zombie[] = [],
  ) {
    const now = this.scene.time.now;
    const sx = this.sprite.x;
    const sy = this.sprite.y;

    ZombiePathfinding.updateGrid(obstacles);

    // 1) Define o destino: direto, se enxerga o jogador; senão, pelo caminho
    let destX = target.x;
    let destY = target.y;

    const hasLineOfSight = ZombiePathfinding.lineClear(
      sx,
      sy,
      target.x,
      target.y,
      obstacles,
      Zombie.LOS_PADDING,
    );

    if (hasLineOfSight) {
      this.path = [];
    } else {
      const targetMoved =
        Phaser.Math.Distance.Between(
          target.x,
          target.y,
          this.pathTargetX,
          this.pathTargetY,
        ) > 48;

      if (now >= this.nextRepathAt || (targetMoved && this.path.length > 0)) {
        this.repath(target, obstacles);
        this.nextRepathAt = now + 400 + Math.random() * 150;
      }

      // Descarta waypoints já alcançados
      while (
        this.path.length > 0 &&
        Phaser.Math.Distance.Between(sx, sy, this.path[0].x, this.path[0].y) <
        12
      ) {
        this.path.shift();
      }

      if (this.path.length > 0) {
        destX = this.path[0].x;
        destY = this.path[0].y;
      }
      // Sem waypoints (chegou ao fim do caminho ou não achou rota):
      // segue direto para o jogador, que é o destino padrão.
    }

    // 2) Detecta travamento (quase não saiu do lugar) e força novo caminho
    if (now - this.lastCheckAt > 500) {
      const moved = Phaser.Math.Distance.Between(
        sx,
        sy,
        this.lastCheckX,
        this.lastCheckY,
      );
      const distToTarget = Phaser.Math.Distance.Between(
        sx,
        sy,
        target.x,
        target.y,
      );

      if (moved < 8 && distToTarget > 40) {
        this.path = [];
        this.nextRepathAt = 0;
      }

      this.lastCheckAt = now;
      this.lastCheckX = sx;
      this.lastCheckY = sy;
    }

    // 3) Direção desejada
    let dirX = destX - sx;
    let dirY = destY - sy;
    const dirLen = Math.hypot(dirX, dirY);

    if (dirLen > 0.001) {
      dirX /= dirLen;
      dirY /= dirLen;
    } else {
      dirX = 0;
      dirY = 0;
    }

    // 4) Separação: empurra para longe de outros zumbis próximos
    const SEP_RADIUS = 36;
    let sepX = 0;
    let sepY = 0;

    for (const other of others) {
      if (other === this || !other.sprite.active) continue;

      let dx = sx - other.sprite.x;
      let dy = sy - other.sprite.y;
      let d = Math.hypot(dx, dy);

      if (d >= SEP_RADIUS) continue;

      if (d < 0.001) {
        // Exatamente um em cima do outro: sorteia uma direção
        const a = Math.random() * Math.PI * 2;
        dx = Math.cos(a);
        dy = Math.sin(a);
        d = 1;
      }

      const weight = (SEP_RADIUS - d) / SEP_RADIUS;
      sepX += (dx / d) * weight;
      sepY += (dy / d) * weight;
    }

    let finalX = dirX + sepX * 1.5;
    let finalY = dirY + sepY * 1.5;
    const finalLen = Math.hypot(finalX, finalY);

    if (finalLen > 0.001) {
      finalX /= finalLen;
      finalY /= finalLen;
    }

    // 5) Suaviza a velocidade para não tremer
    const desiredVX = finalX * this.speed;
    const desiredVY = finalY * this.speed;

    this.body.setVelocity(
      this.body.velocity.x + (desiredVX - this.body.velocity.x) * 0.2,
      this.body.velocity.y + (desiredVY - this.body.velocity.y) * 0.2,
    );
  }

  private repath(
    target: Phaser.GameObjects.Image,
    obstacles: Phaser.GameObjects.Rectangle[],
  ) {
    this.pathTargetX = target.x;
    this.pathTargetY = target.y;

    const raw = ZombiePathfinding.findPath(
      this.sprite.x,
      this.sprite.y,
      target.x,
      target.y,
    );

    this.path = ZombiePathfinding.smoothPath(
      this.sprite.x,
      this.sprite.y,
      raw,
      obstacles,
    );
  }
}
