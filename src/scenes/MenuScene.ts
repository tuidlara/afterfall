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
    rect(615, 0, 130, 600, 0x41473e);
    rect(628, 0, 104, 600, 0x202c2e);
    rect(480, 413, 480, 90, 0x41473e);
    rect(480, 424, 480, 68, 0x202c2e);
    for (let y = 22; y < 600; y += 64) {
      if (y < 390 || y > 510) rect(678, y, 3, 26, 0x7d7756, 0.45);
    }
    for (const [x, y, w, h] of [[492, 72, 104, 148], [770, 42, 150, 190], [775, 280, 120, 108], [510, 280, 82, 94]]) {
      rect(x + 8, y + 10, w, h, 0x0c1416);
      rect(x, y, w, h, 0x51564b);
      rect(x + 5, y + 5, w - 10, h - 10, 0x2f3b37);
      rect(x + 6, y + 5, w - 12, 2, 0x6a705c);
      for (let col = x + 16; col < x + w - 8; col += 18) rect(col, y + 10, 2, h - 22, 0x24322e);
      rect(x + w - 32, y + 22, 18, 24, 0x4e5a4b);
      rect(x + 14, y + h - 7, 28, 4, 0x8b7853, 0.5);
    }
    rect(651, 290, 40, 78, 0x131d1d);
    rect(656, 294, 30, 68, 0x5b5a44);
    rect(660, 312, 22, 16, 0x344b4a);
    rect(660, 334, 22, 12, 0x293b39);
    rect(685, 351, 3, 8, 0x8c563d);
    for (let i = 0; i < 110; i++) {
      const x = 488 + (i * 73) % 462;
      const y = 10 + (i * 47) % 575;
      rect(x, y, 2 + i % 3, 2, i % 3 ? 0x57604a : 0x8b8165, 0.2);
    }
    rect(0, 0, 455, 600, 0x10191c, 0.96);
    for (let i = 0; i < 7; i++) rect(455 + i * 16, 0, 16, 600, 0x10191c, 0.85 - i * 0.12);
    rect(72, 122, 44, 3, 0x98634a);
    rect(72, 238, 300, 1, 0x535b48);

    const text = (x: number, y: number, value: string, size: number, color = "#c2b49a") =>
      this.add.text(x, y, value, { fontFamily: "monospace", fontSize: `${size}px`, color });
    text(70, 150, "AFTERFALL", 62).setFontStyle("bold");
    text(74, 215, "SOBREVIVA AO QUE RESTOU.", 14, "#a8b39c");
    text(74, 445, "Cada tentativa começa do zero.\nAté onde você consegue chegar?", 14, "#919f94")
      .setLineSpacing(10);
    text(72, 566, "EM DESENVOLVIMENTO", 11, "#6e7f74");
    text(930, 548, "Desenvolvido por\nArthur de Lara Zilli", 12, "#a8b39c")
      .setOrigin(1, 0).setAlign("right").setLineSpacing(5);

    const button = (x: number, y: number, width: number, label: string, action: () => void) => {
      const box = this.add.rectangle(x, y, width, 54, 0x26362d)
        .setStrokeStyle(1, 0x778060).setInteractive({ useHandCursor: true });
      const caption = text(x, y, label, 18, "#ddcfaa").setOrigin(0.5);
      box.on("pointerover", () => box.setFillStyle(0x394c38));
      box.on("pointerout", () => box.setFillStyle(0x26362d));
      box.on("pointerdown", (
        pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        if (pointer.button === 0) action();
      });
      return [box, caption];
    };
    const start = () => {
      if (starting || controlsOpen) return;
      starting = true;
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start("GameScene"));
      this.cameras.main.fadeOut(220, 0, 0, 0);
    };
    button(234, 318, 324, "COMEÇAR JOGO  [ENTER]", start);

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
      ...button(480, 458, 260, "VOLTAR  [ESC]", () => toggleControls(false)),
    );
    panel.forEach((object) => object.setDepth(10).setVisible(false));
    this.input.keyboard?.on("keydown-ENTER", (event: KeyboardEvent) => { if (!event.repeat) start(); });
    this.input.keyboard?.on("keydown-ESC", () => toggleControls(false));
  }
}
