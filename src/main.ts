
import Phaser from "phaser";
import "./style.css";
import GameScene from "./scenes/GameScene";

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
