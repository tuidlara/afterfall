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
    const camera = this.scene.cameras.main;
    const margin = 100;

    for (let i = 0; i < count; i++) {
      let x = this.player.x;
      let y = this.player.y;
      let attempts = 0;

      do {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        const halfWidth = camera.worldView.width / 2;
        const halfHeight = camera.worldView.height / 2;

        const distanceX = halfWidth / Math.max(Math.abs(dx), 0.001);
        const distanceY = halfHeight / Math.max(Math.abs(dy), 0.001);

        const distance = Math.min(distanceX, distanceY) + margin;

        x = this.player.x + dx * distance;
        y = this.player.y + dy * distance;

        attempts++;
      } while (
        (camera.worldView.contains(x, y) ||
          x < 20 ||
          x > 1980 ||
          y < 20 ||
          y > 1980) &&
        attempts < 30
      );

      if (
        camera.worldView.contains(x, y) ||
        x < 20 ||
        x > 1980 ||
        y < 20 ||
        y > 1980
      ) {
        continue;
      }

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
