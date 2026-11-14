import Phaser from "phaser";

export default class StreetLight {
  public visuals: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const texture = StreetLight.createGlowTexture(scene);
    const glow = scene.add.image(x + 23, y - 36, texture)
      .setDisplaySize(360, 300)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(1001);
    const core = scene.add.image(x + 23, y - 36, texture)
      .setDisplaySize(64, 48)
      .setAlpha(0.45)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(1001);

    const metal = scene.add.graphics().setDepth(2);
    metal.fillStyle(0x202725);
    metal.fillRect(x - 7, y + 31, 14, 10);
    metal.fillStyle(0x292e2c);
    metal.fillRect(x - 5, y - 39, 10, 77);
    metal.fillStyle(0x5b6055);
    metal.fillRect(x - 2, y - 36, 3, 70);
    metal.fillStyle(0x7b6246);
    metal.fillRect(x - 3, y + 17, 4, 6);
    metal.fillRect(x + 1, y - 16, 3, 4);
    metal.fillStyle(0x353e37);
    metal.fillRect(x, y - 39, 26, 6);
    metal.fillStyle(0x747968);
    metal.fillRect(x + 2, y - 39, 22, 2);
    metal.fillStyle(0x242c2a);
    metal.fillRect(x + 13, y - 43, 22, 14);

    const lamp = scene.add.graphics().setDepth(1002);
    lamp.fillStyle(0x9e7948);
    lamp.fillRect(x + 15, y - 40, 18, 8);
    lamp.fillStyle(0xe3b96e);
    lamp.fillRect(x + 17, y - 39, 14, 6);
    lamp.fillStyle(0xffe6a6);
    lamp.fillRect(x + 19, y - 38, 10, 3);

    this.visuals.push(glow, core, metal, lamp);
  }

  private static createGlowTexture(scene: Phaser.Scene) {
    const key = "streetlight-glow";
    if (scene.textures.exists(key)) return key;

    const texture = scene.textures.createCanvas(key, 384, 384);
    if (!texture) throw new Error("Não foi possível criar a textura de iluminação.");

    const context = texture.context;
    const gradient = context.createRadialGradient(192, 192, 0, 192, 192, 192);
    gradient.addColorStop(0, "rgba(255, 207, 130, 0.32)");
    gradient.addColorStop(0.18, "rgba(248, 194, 111, 0.24)");
    gradient.addColorStop(0.45, "rgba(235, 176, 95, 0.12)");
    gradient.addColorStop(0.75, "rgba(217, 160, 83, 0.035)");
    gradient.addColorStop(1, "rgba(217, 160, 83, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 384, 384);
    texture.refresh();
    texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    return key;
  }
}
