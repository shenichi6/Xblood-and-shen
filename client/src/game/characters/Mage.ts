/**
 * Mage Character Class
 * High Spell Power and Cooldown Reduction, low HP and defense
 * Role: Deal ranged magical damage from a distance
 */

import { CharacterBase } from "./CharacterBase";
import type { CharacterStats } from "@shared/gameTypes";

export class Mage extends CharacterBase {
  private mana: number = 100;
  private maxMana: number = 100;
  private manaRegenRate: number = 5; // Mana per second

  constructor(id: string, name: string, startX: number, startY: number) {
    super(id, "mage", name, startX, startY);
  }

  protected initializeStats(): CharacterStats {
    return {
      maxHp: 80, // Low HP pool
      hp: 80,
      speed: 140, // Moderate-fast movement
      attackPower: 25, // Low attack power
      defense: 8, // Low defense
      spellPower: 60, // Very high spell power
      cooldownReduction: 0.15, // 15% cooldown reduction
    };
  }

  /**
   * Get current mana
   */
  getMana(): number {
    return this.mana;
  }

  /**
   * Get max mana
   */
  getMaxMana(): number {
    return this.maxMana;
  }

  /**
   * Consume mana for spell casting
   */
  consumeMana(amount: number): boolean {
    if (this.mana >= amount) {
      this.mana -= amount;
      return true;
    }
    return false;
  }

  /**
   * Restore mana
   */
  restoreMana(amount: number): void {
    this.mana = Math.min(this.maxMana, this.mana + amount);
  }

  /**
   * Override update to include mana regeneration
   */
  override update(deltaTime: number): void {
    super.update(deltaTime);

    // Regenerate mana over time
    this.restoreMana((this.manaRegenRate * deltaTime) / 1000);
  }

  /**
   * Mage-specific ability: Teleport
   * Short-range instant movement
   */
  teleport(targetX: number, targetY: number): boolean {
    const distance = Math.hypot(targetX - this.position.x, targetY - this.position.y);

    // Can only teleport up to 200 pixels
    if (distance > 200) {
      return false;
    }

    this.position.x = targetX;
    this.position.y = targetY;
    this.velocity.x = 0;
    this.velocity.y = 0;
    return true;
  }

  /**
   * Mage-specific ability: Spell Amplification
   * Temporarily increases spell power
   */
  amplifySpells(): void {
    const originalPower = this.stats.spellPower;
    this.stats.spellPower *= 1.5;

    // Remove amplification after 4 seconds
    setTimeout(() => {
      this.stats.spellPower = originalPower;
    }, 4000);
  }
}
