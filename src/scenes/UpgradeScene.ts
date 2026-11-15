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
    const text = (x: number, y: number, value: string, size = 14, color = "#dad6c7") =>
      this.add.text(x, y, value, {
        fontFamily: "monospace", fontSize: `${size}px`, color, align: "center",
        lineSpacing: 8, wordWrap: { width: size > 16 ? 850 : 700 },
      }).setOrigin(0.5);
    this.add.rectangle(480, 300, 960, 600, 0x080d10, 0.96);
    text(480, 60, "BANCADA DE MELHORIAS", 28, "#c2b49a");
    const balance = text(480, 105, "", 17, "#d1bf92");
    const progress = text(480, 141, "", 14, "#a5c3b5");
    const message = text(480, 428, "Selecione uma melhoria para conferir a compra.");

    const cards: {
      choice: UpgradeChoice;
      card: Phaser.GameObjects.Rectangle;
      description: Phaser.GameObjects.Text;
      status: Phaser.GameObjects.Text;
    }[] = [];

    const button = (x: number, y: number, width: number, action: () => void, height = 42) => {
      const background = this.add.rectangle(x, y, width, height, 0x303d32)
        .setStrokeStyle(1, 0x72795b).setInteractive({ useHandCursor: true });
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
    button(280, 485, 300, close);
    text(280, 485, "VOLTAR AO JOGO [ESC]");

    const refresh = () => {
      const state = data.getState();
      balance.setText(`NÍVEL ${state.level} · PONTOS: ${state.upgradePoints}`);
      progress.setText(state.xpToNextLevel > 0
        ? `Próximo ponto: faltam ${state.xpToNextLevel - state.xp} XP (${state.xp}/${state.xpToNextLevel}).`
        : "Nível máximo. Não há novos pontos para conquistar nesta partida.");
      for (const entry of cards) {
        const current = state.choices.find((choice) => choice.id === entry.choice.id)!;
        entry.description.setText(current.description);
        entry.status.setText(current.rank === current.maxRank
          ? `${current.rank}/${current.maxRank} · LIMITE ATINGIDO`
          : `${current.rank}/${current.maxRank} · CUSTO: 1 PONTO`);
        entry.card.setFillStyle(current.id === selected ? 0x394935 : 0x202a27);
      }
      const choice = state.choices.find((choice) => choice.id === selected);
      const canBuy = !!choice && choice.rank < choice.maxRank && state.upgradePoints > 0;
      confirm.setAlpha(canBuy ? 1 : 0.35);
      confirmLabel.setText(canBuy ? "CONFIRMAR COMPRA [ENTER]" : "COMPRA INDISPONÍVEL");
      if (!choice) message.setText("Selecione uma melhoria. Cada compra custa 1 ponto.");
      else if (choice.rank === choice.maxRank) message.setText("Essa melhoria já está no limite desta partida.");
      else if (state.upgradePoints === 0) message.setText(`Sem pontos. Faltam ${state.xpToNextLevel - state.xp} XP para ganhar 1 ponto.`);
      else message.setText(`Comprar ${choice.title} por 1 ponto?`);
    };
    const buy = () => {
      if (closed || !selected || !data.onBuy(selected)) return;
      selected = null;
      refresh();
      message.setText("Melhoria aplicada. Você pode continuar consultando ou voltar ao jogo.");
    };
    const confirm = button(655, 485, 310, buy);
    const confirmLabel = text(655, 485, "");

    data.getState().choices.forEach((choice, index) => {
      const x = 196 + index * 284;
      const select = () => {
        if (closed) return;
        selected = choice.id;
        refresh();
      };
      const card = button(x, 290, 264, select, 210);
      text(x, 215, `[${index + 1}] ${choice.title}`, 16, "#d1bf92");
      const description = text(x, 281, choice.description);
      description.setWordWrapWidth(238);
      const status = text(x, 366, "", 12, "#a5ad98");
      cards.push({ choice, card, description, status });
      this.input.keyboard?.on(`keydown-${["ONE", "TWO", "THREE"][index]}`, (event: KeyboardEvent) => {
        if (!event.repeat) select();
      });
    });
    this.input.keyboard?.on("keydown-ENTER", (event: KeyboardEvent) => { if (!event.repeat) buy(); });
    this.input.keyboard?.on("keydown-ESC", (event: KeyboardEvent) => { if (!event.repeat) close(); });
    text(480, 550, "Escolha com clique ou 1, 2, 3. Confirme a compra separadamente.\nSem cura ou munição grátis. Tudo zera ao reiniciar.", 13, "#9caa98");
    refresh();
  }
}
