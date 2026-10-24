import Phaser from 'phaser';
import './style.css';

class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super('GameScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#171b22');

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x252c35, 0.8);

    for (let x = 0; x <= 2000; x += 64) {
      graphics.lineBetween(x, 0, x, 2000);
    }

    for (let y = 0; y <= 2000; y += 64) {
      graphics.lineBetween(0, y, 2000, y);
    }

    this.player = this.add.rectangle(1000, 1000, 28, 28, 0x55ddaa);
    this.physics.world.setBounds(0, 0, 2000, 2000);
    this.physics.add.existing(this.player);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd;

    this.cameras.main.setBounds(0, 0, 2000, 2000);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        worldPoint.x,
        worldPoint.y
      );

      this.player.setRotation(angle);
    });

    this.add.text(16, 16, 'AFTERFALL', {
      fontSize: '22px',
      color: '#55ddaa',
      fontStyle: 'bold',
    }).setScrollFactor(0);
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const direction = new Phaser.Math.Vector2(0, 0);

    if (this.wasd.A.isDown || this.cursors.left.isDown) direction.x -= 1;
    if (this.wasd.D.isDown || this.cursors.right.isDown) direction.x += 1;
    if (this.wasd.W.isDown || this.cursors.up.isDown) direction.y -= 1;
    if (this.wasd.S.isDown || this.cursors.down.isDown) direction.y += 1;

    direction.normalize();
    body.setVelocity(direction.x * 220, direction.y * 220);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 600,
  parent: 'game',
  backgroundColor: '#171b22',
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: GameScene,
});
