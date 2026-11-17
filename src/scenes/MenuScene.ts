import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() { super("MenuScene"); }

  create() {
    let starting = false;
    let controlsOpen = false;
    this.cameras.main.setBackgroundColor("#10191c");
    const background = this.add.graphics();
    const rect = (x: number, y: number, w: number, h: number, color: number, alpha = 1) => {
      background.fillStyle(color, alpha);
      background.fillRect(x, y, w, h);
    };
    const polygon = (points: { x: number; y: number }[], color: number, alpha = 1) => {
      background.fillStyle(color, alpha);
      background.fillPoints(points.map((point) => new Phaser.Math.Vector2(point.x, point.y)), true);
    };
    rect(430, 0, 530, 280, 0x1b2527);
    rect(430, 168, 530, 105, 0x27302e, 0.4);
    for (const [x, y, w, h] of [[445, 130, 58, 150], [509, 87, 72, 190], [587, 151, 47, 125], [652, 107, 84, 164], [749, 169, 66, 106], [830, 124, 91, 158], [928, 69, 48, 210]]) {
      rect(x, y, w, h, 0x111c1f);
      rect(x + 8, y - 7, w - 18, 9, 0x111c1f);
      for (let row = y + 18; row < 250; row += 24) {
        for (let col = x + 12; col < x + w - 8; col += 16) {
          if ((col + row) % 5 !== 0) rect(col, row, 4, 7, 0x273333, 0.55);
        }
      }
    }
    rect(430, 264, 530, 336, 0x1c2421);
    polygon([{ x: 708, y: 264 }, { x: 798, y: 264 }, { x: 950, y: 600 }, { x: 487, y: 600 }], 0x11191c);
    polygon([{ x: 700, y: 264 }, { x: 708, y: 264 }, { x: 487, y: 600 }, { x: 470, y: 600 }], 0x3b4038);
    polygon([{ x: 798, y: 264 }, { x: 804, y: 264 }, { x: 960, y: 600 }, { x: 950, y: 600 }], 0x3b4038);
    for (const [x, y, w, h] of [[750, 292, 2, 9], [745, 326, 3, 14], [735, 379, 4, 22], [719, 462, 6, 35], [699, 568, 8, 32]]) rect(x, y, w, h, 0x706a50, 0.4);
    rect(847, 229, 87, 139, 0x0b1113);
    rect(853, 235, 75, 129, 0x3b4038);
    rect(860, 244, 61, 60, 0x131e21);
    rect(887, 245, 3, 58, 0x505449);
    rect(858, 262, 66, 8, 0x6c5d46);
    rect(865, 283, 55, 7, 0x514b3b);
    rect(858, 316, 65, 3, 0x525549);
    rect(843, 223, 94, 8, 0x686a56);
    for (const x of [484, 575, 665]) rect(x, 276, 5, 111, 0x444e42);
    rect(484, 289, 185, 3, 0x444e42);
    rect(484, 344, 185, 3, 0x3e493e);
    for (let x = 494; x < 665; x += 12) rect(x, 291, 1, 53, 0x505b4b, 0.5);
    rect(573, 302, 52, 27, 0x756f55);
    rect(581, 310, 35, 4, 0x393b31);
    rect(587, 319, 23, 3, 0x393b31);
    polygon([{ x: 809, y: 174 }, { x: 784, y: 174 }, { x: 664, y: 444 }, { x: 898, y: 444 }], 0xc3a46a, 0.025);
    polygon([{ x: 805, y: 174 }, { x: 788, y: 174 }, { x: 725, y: 367 }, { x: 848, y: 367 }], 0xc3a46a, 0.035);
    rect(819, 169, 6, 222, 0x080e10);
    rect(821, 167, 4, 221, 0x626454);
    rect(791, 164, 34, 5, 0x626454);
    rect(786, 168, 22, 7, 0x655f48);
    rect(789, 173, 16, 3, 0xd9bc7a);
    rect(610, 471, 122, 48, 0x080f12);
    rect(616, 460, 112, 45, 0x414b43);
    rect(623, 454, 88, 12, 0x303b37);
    rect(644, 461, 43, 30, 0x1b2a2b);
    rect(647, 465, 35, 20, 0x324141);
    rect(689, 463, 15, 30, 0x252f2d);
    rect(619, 477, 14, 17, 0x303b36);
    rect(706, 477, 16, 19, 0x303b36);
    rect(626, 498, 19, 5, 0x754d3b);
    rect(700, 498, 13, 4, 0x754d3b);
    rect(625, 503, 17, 8, 0x0a1012);
    rect(704, 503, 17, 8, 0x0a1012);
    rect(638, 459, 4, 29, 0x131e20);
    for (let i = 0; i < 95; i++) {
      const x = 445 + (i * 83) % 510;
      const y = 273 + (i * 47) % 320;
      rect(x, y, 2 + i % 4, 1, 0x7c7962, 0.12);
      if (x < 580 || x > 886) {
        rect(x, y - 6, 2, 8, 0x3b4935);
        rect(x + 4, y - 3, 2, 5, 0x53573b);
      }
    }
    for (let i = 0; i < 46; i++) rect(462 + (i * 107) % 494, (i * 73) % 600, 1, 5 + i % 5, 0x8eaaa5, 0.09);
    rect(0, 0, 430, 600, 0x10191c);
    for (let i = 0; i < 12; i++) rect(430 + i * 12, 0, 12, 600, 0x10191c, 0.94 - i * 0.075);
    for (let i = 0; i < 6; i++) rect(0, 600 - (i + 1) * 14, 960, 14, 0x0a1012, 0.62 - i * 0.09);

    const text = (x: number, y: number, value: string, size: number, color = "#c2b49a") =>
      this.add.text(x, y, value, { fontFamily: "monospace", fontSize: `${size}px`, color });
    this.add.text(68, 145, "AFTERFALL", {
      fontFamily: "Impact, 'Arial Black', sans-serif", fontSize: "88px", color: "#c6bea6",
      stroke: "#0b1113", strokeThickness: 2,
    });
    const wear = this.add.graphics();
    wear.fillStyle(0x10191c, 1);
    for (const [x, y, w, h] of [[78, 176, 66, 2], [168, 205, 44, 2], [245, 166, 29, 1], [317, 188, 76, 2], [407, 213, 28, 1]]) wear.fillRect(x, y, w, h);
    text(74, 255, "SOBREVIVÊNCIA CONTRA A HORDA", 11, "#738078");
    text(342, 317, "ENTER", 10, "#73796b");
    text(72, 566, "EM DESENVOLVIMENTO", 11, "#6e7f74");
    text(930, 548, "Desenvolvido por\nArthur de Lara Zilli", 12, "#a8b39c")
      .setOrigin(1, 0).setAlign("right").setLineSpacing(5);

    const button = (x: number, y: number, width: number, label: string, action: () => void, framed = false) => {
      const box = this.add.rectangle(x, y, width, 54, 0x586049, framed ? 0.2 : 0)
        .setInteractive({ useHandCursor: true });
      const caption = text(framed ? x : x - width / 2 + 2, y, label, framed ? 18 : 22, "#b8b8a2")
        .setOrigin(framed ? 0.5 : 0, 0.5);
      const marker = this.add.rectangle(x - width / 2 - 12, y, 3, 16, 0xba9b62).setVisible(false);
      box.on("pointerover", () => { caption.setColor("#e6d8b4"); marker.setVisible(true); });
      box.on("pointerout", () => { caption.setColor("#b8b8a2"); marker.setVisible(false); });
      box.on("pointerdown", (
        pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        if (pointer.button === 0) action();
      });
      return [box, caption, marker];
    };
    const start = () => {
      if (starting || controlsOpen) return;
      starting = true;
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start("GameScene"));
      this.cameras.main.fadeOut(220, 0, 0, 0);
    };
    button(234, 318, 324, "COMEÇAR JOGO", start);

    const panel: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];
    const toggleControls = (visible: boolean) => {
      if (starting) return;
      controlsOpen = visible;
      panel.forEach((object) => object.setVisible(visible));
    };
    button(234, 386, 324, "COMO JOGAR", () => toggleControls(true));
    panel.push(
      this.add.rectangle(480, 300, 960, 600, 0x080e11, 0.95),
      this.add.rectangle(480, 300, 650, 454, 0x19251f).setStrokeStyle(2, 0x626d51),
      text(480, 112, "COMO JOGAR", 26).setOrigin(0.5),
      text(220, 170,
        "WASD / SETAS   Mover\nMOUSE          Mirar\nCLIQUE ESQ.    Atirar\nR              Recarregar\nE              Consultar a loja, perto da bancada", 15, "#d0d1bd").setLineSpacing(14),
      text(480, 365,
        "Elimine os zumbis para avançar nas ondas e ganhar XP.\nGaste os pontos na loja. Melhorias zeram ao morrer.", 14, "#a5b49c")
        .setOrigin(0.5).setAlign("center").setLineSpacing(10),
      ...button(480, 458, 260, "VOLTAR  [ESC]", () => toggleControls(false), true),
    );
    panel.forEach((object) => object.setDepth(10).setVisible(false));
    this.input.keyboard?.on("keydown-ENTER", (event: KeyboardEvent) => { if (!event.repeat) start(); });
    this.input.keyboard?.on("keydown-ESC", () => toggleControls(false));
  }
}
