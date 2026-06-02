/**
 * Rogue Character Class
 * High Speed and Attack Power, low HP
 * Role: Burst damage and mobility
 */

import { CharacterBase } from "./CharacterBase";
import type { CharacterStats } from "@shared/gameTypes";

export class Rogue extends CharacterBase {
  private energyPool: number = 100;
  private maxEnergy: number = 100;
  private energyRegenRate: number = 8; // Energy per second

  constructor(id: string, name: string, startX: number, startY: number) {
    super(id, "rogue", name, startX, startY);
  }

  protected initializeStats(): CharacterStats {
    return {
      maxHp: 90, // Low-moderate HP
      hp: 90,
      speed: 180, // Very fast movement
      attackPower: 55, // High attack power
      defense: 12, // Low defense
      spellPower: 35, // Moderate spell power
      cooldownReduction: 0.1, // 10% cooldown reduction
    };
  }

  /**
   * Get current energy
   */
  getEnergy(): number {
    return this.energyPool;
  }

  /**
   * Get max energy
   */
  getMaxEnergy(): number {
    return this.maxEnergy;
  }

  /**
   * Consume energy for ability
   */
  consumeEnergy(amount: number): boolean {
    if (this.energyPool >= amount) {
      this.energyPool -= amount;
      return true;
    }
    return false;
  }

  /**
   * Restore energy
   */
  restoreEnergy(amount: number): void {
    this.energyPool = Math.min(this.maxEnergy, this.energyPool + amount);
  }

  /**
   * Override update to include energy regeneration
   */
  override update(deltaTime: number): void {
    super.update(deltaTime);

    // Regenerate energy over time
    this.restoreEnergy((this.energyRegenRate * deltaTime) / 1000);
  }

  /**
   * Rogue-specific ability: Dash
   * Quick directional movement with increased speed
   */
  dash(directionX: number, directionY: number): boolean {
    if (!this.consumeEnergy(30)) {
      return false;
    }

    // Normalize direction
    const length = Math.hypot(directionX, directionY);
    if (length === 0) return false;

    const normalizedX = directionX / length;
    const normalizedY = directionY / length;

    // Apply dash velocity
    this.velocity.x = normalizedX * 400;
    this.velocity.y = normalizedY * 400;

    return true;
  }

  /**
   * Rogue-specific ability: Evasion
   * Temporarily increases defense and reduces incoming damage
   */
  evasion(): boolean {
    if (!this.consumeEnergy(25)) {
      return false;
    }

    const originalDefense = this.stats.defense;
    this.stats.defense += 20;

    // Remove evasion after 3 seconds
    setTimeout(() => {
      this.stats.defense = originalDefense;
    }, 3000);

    return true;
  }

  /**
   * Rogue-specific ability: Backstab
   * High damage attack with cooldown
   */
  backstab(): number {
    // Returns damage multiplier
    return 2.5; // 250% of attack power
  }
}
