import Phaser from "phaser";

export default class StreetLight {
  public visuals: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // A luz fica acima do filtro noturno
    const lightSteps = 18;

    for (let i = 0; i < lightSteps; i++) {
      const radius = 160 - i * 8;
      const alpha = 0.012 + (i / lightSteps) * 0.025;

      const glow = scene.add.circle(
        x,
        y - 35,
        radius,
        0xffc66b,
        alpha
      );

      glow.setBlendMode(Phaser.BlendModes.ADD);
      glow.setDepth(1001);

      this.visuals.push(glow);
    }

    // Poste de metal envelhecido
    const pole = scene.add.rectangle(
      x,
      y,
      9,
      75,
      0x454541
    );

    pole.setStrokeStyle(2, 0x252522);
    pole.setDepth(1002);

    // Braço que sustenta a luminária
    const arm = scene.add.rectangle(
      x + 12,
      y - 36,
      25,
      5,
      0x454541
    );

    arm.setDepth(1002);

    // Luminária amarelada
    const lamp = scene.add.ellipse(
      x + 23,
      y - 36,
      19,
      11,
      0xffd27a
    );

    lamp.setStrokeStyle(2, 0x665333);
    lamp.setDepth(1003);

    this.visuals.push(pole, arm, lamp);
  }
}