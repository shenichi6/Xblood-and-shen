/**
 * Tank Character Class
 * High HP and Defense, slower movement, lower spell power
 * Role: Absorb damage and control the battlefield
 */

import { CharacterBase } from "./CharacterBase";
import type { CharacterStats } from "@shared/gameTypes";

export class Tank extends CharacterBase {
  constructor(id: string, name: string, startX: number, startY: number) {
    super(id, "tank", name, startX, startY);
  }

  protected initializeStats(): CharacterStats {
    return {
      maxHp: 150, // High HP pool
      hp: 150,
      speed: 120, // Slower movement
      attackPower: 45, // Moderate attack
      defense: 25, // High defense
      spellPower: 30, // Lower spell power
      cooldownReduction: 0.05, // 5% cooldown reduction
    };
  }

  /**
   * Tank-specific ability: Fortify
   * Temporarily increases defense at the cost of movement speed
   */
  fortify(): void {
    this.stats.defense += 15;
    this.stats.speed *= 0.6;

    // Remove fortify effect after 5 seconds
    setTimeout(() => {
      this.stats.defense -= 15;
      this.stats.speed /= 0.6;
    }, 5000);
  }

  /**
   * Tank-specific ability: Shield Bash
   * Knockback nearby enemies
   */
  shieldBash(): number {
    // Returns knockback force
    return 300;
  }
}
