export type UpgradeId = "magazine" | "reload" | "movement";

export interface UpgradeChoice {
  id: UpgradeId;
  title: string;
  description: string;
  rank: number;
  maxRank: number;
}

export default class RunProgression {
  public static readonly MAX_LEVEL = 10;
  public static readonly MAX_RANK = 3;
  private currentLevel = 1;
  private currentXp = 0;
  private points = 0;
  private ranks: Record<UpgradeId, number> = { magazine: 0, reload: 0, movement: 0 };

  get level() { return this.currentLevel; }
  get xp() { return this.currentXp; }
  get upgradePoints() { return this.points; }
  get isMaxLevel() { return this.level === RunProgression.MAX_LEVEL; }
  get xpToNextLevel() { return this.isMaxLevel ? 0 : 150 + (this.level - 1) * 100; }
  get magazineSize() { return 12 + this.ranks.magazine * 2; }
  get reloadDuration() { return 1500 - this.ranks.reload * 100; }
  get movementSpeed() { return 140 + this.ranks.movement * 7; }

  addXp(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0 || this.isMaxLevel) return;
    this.currentXp += amount;
    while (!this.isMaxLevel && this.currentXp >= this.xpToNextLevel) {
      this.currentXp -= this.xpToNextLevel;
      this.currentLevel++;
      this.points++;
    }
    if (this.isMaxLevel) this.currentXp = 0;
  }

  buyUpgrade(id: UpgradeId) {
    if (this.points === 0 || !Object.hasOwn(this.ranks, id)) return false;
    if (this.ranks[id] >= RunProgression.MAX_RANK) return false;
    this.ranks[id]++;
    this.points--;
    return true;
  }

  getChoices(includeMaxed = false): UpgradeChoice[] {
    const choices: Omit<UpgradeChoice, "rank" | "maxRank">[] = [
      {
        id: "magazine",
        title: "PENTE AMPLIADO",
        description: `${this.magazineSize} → ${this.magazineSize + 2} balas\nNão repõe munição.`,
      },
      {
        id: "reload",
        title: "RECARGA RÁPIDA",
        description: `${(this.reloadDuration / 1000).toFixed(1)}s → ${((this.reloadDuration - 100) / 1000).toFixed(1)}s\nMenos tempo vulnerável.`,
      },
      {
        id: "movement",
        title: "MOBILIDADE",
        description: `Velocidade: ${this.movementSpeed} → ${this.movementSpeed + 7}\n+5% da velocidade inicial.`,
      },
    ];
    const limits: Record<UpgradeId, string> = {
      magazine: `Pente máximo: ${this.magazineSize} balas.`,
      reload: `Recarga mínima: ${(this.reloadDuration / 1000).toFixed(1)}s.`,
      movement: `Velocidade máxima: ${this.movementSpeed}.`,
    };
    return choices.filter((choice) => includeMaxed || this.ranks[choice.id] < RunProgression.MAX_RANK)
      .map((choice) => ({
        ...choice,
        description: this.ranks[choice.id] === RunProgression.MAX_RANK
          ? limits[choice.id] : choice.description,
        rank: this.ranks[choice.id],
        maxRank: RunProgression.MAX_RANK,
      }));
  }
}
