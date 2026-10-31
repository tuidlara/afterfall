import Phaser from "phaser";
import Zombie from "./Zombie";

export default class ZombieManager {
  private zombies: Zombie[] = [];
  private scene: Phaser.Scene;
  private player: Phaser.GameObjects.Image;
  private obstacles: Phaser.GameObjects.Rectangle[];
  private currentWave = 0;

  constructor(
    scene: Phaser.Scene,
    player: Phaser.GameObjects.Image,
    obstacles: Phaser.GameObjects.Rectangle[] = [],
  ) {
    this.scene = scene;
    this.player = player;
    this.obstacles = obstacles;
  }

  startWave() {
    this.currentWave++;

    const count = 5 + (this.currentWave - 1) * 2;
    this.spawn(count);
  }

  spawn(count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(250, 400);

      const x = Phaser.Math.Clamp(
        this.player.x + Math.cos(angle) * distance,
        20,
        1980,
      );

      const y = Phaser.Math.Clamp(
        this.player.y + Math.sin(angle) * distance,
        20,
        1980,
      );

      const zombie = new Zombie(this.scene, x, y);
      this.zombies.push(zombie);
    }
  }

  update() {
    for (const zombie of this.zombies) {
      if (zombie.sprite.active) {
        zombie.follow(this.player, this.obstacles);

        zombie.updateHealthBar();
      }
    }
  }

  getAll() {
    return this.zombies;
  }

  getAliveCount() {
    return this.zombies.filter((zombie) => zombie.sprite.active).length;
  }

  getCurrentWave() {
    return this.currentWave;
  }
}
