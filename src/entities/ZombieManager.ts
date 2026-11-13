import Phaser from "phaser";
import Zombie from "./Zombie";
import type { ZombieType } from "./ZombieTypes";

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
    const minDistance = 80;

    let runnerChance = 0;

    if (this.currentWave >= 7) {
      runnerChance = 0.25;
    } else if (this.currentWave >= 5) {
      runnerChance = 0.20;
    } else if (this.currentWave >= 3) {
      runnerChance = 0.15;
    }

    for (let i = 0; i < count; i++) {
      let x = this.player.x;
      let y = this.player.y;
      let attempts = 0;
      let validPosition = false;

      while (attempts < 30 && !validPosition) {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        const halfWidth = camera.width / (2 * camera.zoom);
        const halfHeight = camera.height / (2 * camera.zoom);

        const distanceX = halfWidth / Math.max(Math.abs(dx), 0.001);
        const distanceY = halfHeight / Math.max(Math.abs(dy), 0.001);

        const extraDistance = Phaser.Math.Between(0, 350);

        const distance =
          Math.min(distanceX, distanceY) + margin + extraDistance;

        x = this.player.x + dx * distance;
        y = this.player.y + dy * distance;

        const insideCamera = camera.worldView.contains(x, y);
        const outsideMap = x < 20 || x > 1980 || y < 20 || y > 1980;

        const tooClose = this.zombies.some((zombie) => {
          if (!zombie.sprite.active) return false;

          return (
            Phaser.Math.Distance.Between(
              x,
              y,
              zombie.sprite.x,
              zombie.sprite.y,
            ) < minDistance
          );
        });

        const insideObstacle = this.obstacles.some((obstacle) => {
          if (!obstacle.active) return false;

          const padding = 20;

          const left = obstacle.x - obstacle.width / 2 - padding;
          const right = obstacle.x + obstacle.width / 2 + padding;
          const top = obstacle.y - obstacle.height / 2 - padding;
          const bottom = obstacle.y + obstacle.height / 2 + padding;

          return x >= left && x <= right && y >= top && y <= bottom;
        });

        validPosition =
          !insideCamera && !outsideMap && !tooClose && !insideObstacle;

        attempts++;
      }

      if (!validPosition) continue;

      const type: ZombieType =
        Math.random() < runnerChance ? "runner" : "normal";

      const zombie = new Zombie(this.scene, x, y, type);
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
