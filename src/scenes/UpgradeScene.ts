import Phaser from "phaser";
import type { UpgradeChoice, UpgradeId } from "../progression/RunProgression";

interface ShopState {
  level: number;
  xp: number;
  xpToNextLevel: number;
  upgradePoints: number;
  choices: UpgradeChoice[];
}

interface ShopData {
  getState: () => ShopState;
  onBuy: (id: UpgradeId) => boolean;
  onClose: () => void;
}

export default class UpgradeScene extends Phaser.Scene {
  constructor() { super("UpgradeScene"); }

  create(data: ShopData) {
    let closed = false;
    let selected: UpgradeId | null = null;
    const text = (x: number, y: number, value: string, size = 14, color = "#c6bea6") =>
      this.add.text(x, y, value, {
        fontFamily: "monospace", fontSize: `${size}px`, color,
        lineSpacing: 10, wordWrap: { width: 290 },
      }).setOrigin(0, 0.5);

    this.add.rectangle(480, 300, 960, 600, 0x0b1315, 1);
    this.add.text(78, 62, "BANCADA", {
      fontFamily: "Impact, 'Arial Black', sans-serif", fontSize: "48px", color: "#c6bea6",
    });
    const balance = text(880, 92, "", 22).setOrigin(1, 0.5);
    const progress = text(80, 141, "", 12, "#87917e").setWordWrapWidth(800);
    this.add.rectangle(480, 172, 800, 1, 0x59604e, 0.35);
    this.add.rectangle(533, 303, 1, 204, 0x59604e, 0.25);

    const detailTitle = text(575, 224, "Escolha uma melhoria", 20);
    const description = text(575, 293, "", 15, "#b1b5a0");
    const cost = text(575, 361, "", 12, "#939b86");
    const message = text(80, 438, "", 12, "#9da58c").setWordWrapWidth(800);
    const rows: {
      id: UpgradeId;
      background: Phaser.GameObjects.Rectangle;
      marker: Phaser.GameObjects.Rectangle;
      title: Phaser.GameObjects.Text;
      rank: Phaser.GameObjects.Text;
    }[] = [];

    const button = (x: number, y: number, width: number, action: () => void, height = 46) => {
      const background = this.add.rectangle(x, y, width, height, 0x536047, 0)
        .setInteractive({ useHandCursor: true });
      background.on("pointerdown", (
        pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        if (pointer.button === 0) action();
      });
      return background;
    };
    const close = () => {
      if (closed) return;
      closed = true;
      data.onClose();
      this.scene.stop();
      this.scene.resume("GameScene");
    };
    const back = button(230, 493, 300, close);
    const backLabel = text(80, 493, "VOLTAR AO JOGO", 15, "#9da58c");
    back.on("pointerover", () => backLabel.setColor("#e6d8b4"));
    back.on("pointerout", () => backLabel.setColor("#9da58c"));
    text(80, 549, "1–3 escolher   ·   ENTER comprar   ·   ESC voltar", 11, "#69766c")
      .setWordWrapWidth(800);

    const refresh = () => {
      const state = data.getState();
      balance.setText(`${state.upgradePoints} ${state.upgradePoints === 1 ? "PONTO" : "PONTOS"}`);
      progress.setText(state.xpToNextLevel > 0
        ? `Nível ${state.level}  ·  Faltam ${state.xpToNextLevel - state.xp} XP para +1 ponto`
        : `Nível ${state.level}  ·  Limite de XP atingido`);
      for (const row of rows) {
        const choice = state.choices.find((entry) => entry.id === row.id)!;
        const active = row.id === selected;
        row.background.setFillStyle(0x536047, active ? 0.12 : 0);
        row.marker.setVisible(active);
        row.title.setColor(active ? "#e6d8b4" : "#b1b5a0");
        row.rank.setText(choice.rank === choice.maxRank ? "MÁX." : `${choice.rank}/${choice.maxRank}`);
      }
      const choice = state.choices.find((entry) => entry.id === selected);
      const maxed = !!choice && choice.rank === choice.maxRank;
      const canBuy = !!choice && !maxed && state.upgradePoints > 0;
      detailTitle.setText(choice ? choice.title : "Escolha uma melhoria");
      description.setText(choice ? choice.description : "");
      cost.setText(choice ? maxed ? "Limite atingido" : "Custo: 1 ponto" : "");
      confirm.setAlpha(canBuy ? 1 : 0.35);
      confirmLabel.setAlpha(canBuy ? 1 : 0.35);
      confirmLabel.setText(maxed ? "NO LIMITE" : choice && state.upgradePoints === 0 ? "SEM PONTOS" : "COMPRAR");
      message.setText(choice && !maxed && state.upgradePoints === 0
        ? state.xpToNextLevel > 0 ? `Faltam ${state.xpToNextLevel - state.xp} XP para ganhar 1 ponto.` : "Todos os pontos desta partida já foram conquistados."
        : "");
    };
    const buy = () => {
      if (closed || !selected || !data.onBuy(selected)) return;
      selected = null;
      refresh();
      message.setText("Melhoria aplicada.");
    };
    const confirm = button(730, 493, 300, buy);
    const confirmLabel = text(880, 493, "COMPRAR", 18, "#c6bea6").setOrigin(1, 0.5);
    confirm.on("pointerover", () => confirmLabel.setColor("#e6d8b4"));
    confirm.on("pointerout", () => confirmLabel.setColor("#c6bea6"));

    data.getState().choices.forEach((choice, index) => {
      const y = 228 + index * 76;
      const select = () => {
        if (closed) return;
        selected = choice.id;
        refresh();
      };
      const background = button(285, y, 410, select, 62);
      const marker = this.add.rectangle(80, y, 3, 24, 0xba9b62).setVisible(false);
      text(98, y, String(index + 1), 12, "#69766c");
      const title = text(125, y, choice.title, 16, "#b1b5a0");
      const rank = text(488, y, "", 12, "#87917e").setOrigin(1, 0.5);
      background.on("pointerover", () => title.setColor("#e6d8b4"));
      background.on("pointerout", () => title.setColor(choice.id === selected ? "#e6d8b4" : "#b1b5a0"));
      rows.push({ id: choice.id, background, marker, title, rank });
      this.input.keyboard?.on(`keydown-${["ONE", "TWO", "THREE"][index]}`, (event: KeyboardEvent) => {
        if (!event.repeat) select();
      });
    });
    this.input.keyboard?.on("keydown-ENTER", (event: KeyboardEvent) => { if (!event.repeat) buy(); });
    this.input.keyboard?.on("keydown-ESC", (event: KeyboardEvent) => { if (!event.repeat) close(); });
    refresh();
  }
}
