export type ZombieType = "normal" | "runner" | "tank";

export const ZOMBIE_CONFIG = {
  normal: {
    health: 3,
    speed: 80,
    damage: 20,
    xp: 5,
    tint: 0xffffff,
  },
  runner: {
    health: 2,
    speed: 120,
    damage: 15,
    xp: 8,
    tint: 0xc7a66b,
  },
  tank: {
    health: 7,
    speed: 55,
    damage: 30,
    xp: 12,
    tint: 0x7a8b68,
  },
} as const;
