/**
 * Character Base Class
 * Core character implementation with shared logic for all character types
 * 
 * Design: Modular character system where each type (Tank, Mage, Rogue) extends
 * this base class with unique stat distributions and ability modifiers.
 */

import type { Character, CharacterStats, CharacterType, StatusEffect } from "@shared/gameTypes";

export abstract class CharacterBase implements Character {
  id: string;
  type: CharacterType;
  name: string;
  stats: CharacterStats;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  isAlive: boolean;
  activeEffects: StatusEffect[];
  spellCooldowns: Map<string, number>;

  constructor(id: string, type: CharacterType, name: string, startX: number, startY: number) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.position = { x: startX, y: startY };
    this.velocity = { x: 0, y: 0 };
    this.isAlive = true;
    this.activeEffects = [];
    this.spellCooldowns = new Map();
    this.stats = this.initializeStats();
  }

  /**
   * Initialize character stats - overridden by subclasses
   */
  protected abstract initializeStats(): CharacterStats;

  /**
   * Apply damage to the character
   */
  takeDamage(amount: number): void {
    if (!this.isAlive) return;

    const mitigatedDamage = Math.max(1, amount - this.stats.defense);
    this.stats.hp = Math.max(0, this.stats.hp - mitigatedDamage);

    if (this.stats.hp <= 0) {
      this.isAlive = false;
    }
  }

  /**
   * Heal the character
   */
  heal(amount: number): void {
    if (!this.isAlive) return;
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
  }

  /**
   * Apply a status effect to the character
   */
  applyEffect(effect: StatusEffect): void {
    this.activeEffects.push(effect);
  }

  /**
   * Remove a status effect
   */
  removeEffect(effectType: string): void {
    this.activeEffects = this.activeEffects.filter((e) => e.type !== effectType);
  }

  /**
   * Update character state (cooldowns, effects, movement)
   */
  update(deltaTime: number): void {
    // Update spell cooldowns
    for (const [spellId, cooldown] of this.spellCooldowns.entries()) {
      const newCooldown = cooldown - deltaTime;
      if (newCooldown <= 0) {
        this.spellCooldowns.delete(spellId);
      } else {
        this.spellCooldowns.set(spellId, newCooldown);
      }
    }

    // Update active effects
    this.activeEffects = this.activeEffects
      .map((effect) => ({
        ...effect,
        remainingTime: effect.remainingTime - deltaTime,
      }))
      .filter((effect) => effect.remainingTime > 0);

    // Apply freeze effect (reduce movement speed)
    const freezeEffect = this.activeEffects.find((e) => e.type === "freeze");
    if (freezeEffect) {
      this.velocity.x *= 0.3;
      this.velocity.y *= 0.3;
    }

    // Update position based on velocity
    this.position.x += this.velocity.x * (deltaTime / 1000);
    this.position.y += this.velocity.y * (deltaTime / 1000);

    // Damping (natural deceleration)
    this.velocity.x *= 0.95;
    this.velocity.y *= 0.95;
  }

  /**
   * Set movement velocity
   */
  setVelocity(x: number, y: number): void {
    this.velocity.x = x;
    this.velocity.y = y;
  }

  /**
   * Apply knockback force
   */
  applyKnockback(forceX: number, forceY: number): void {
    this.velocity.x += forceX;
    this.velocity.y += forceY;
  }

  /**
   * Get the current effective speed (accounting for effects)
   */
  getEffectiveSpeed(): number {
    let speed = this.stats.speed;
    const speedBoost = this.activeEffects.find((e) => e.type === "speed_boost");
    if (speedBoost) {
      speed *= 1 + (speedBoost.value || 0.5);
    }
    return speed;
  }

  /**
   * Check if spell is on cooldown
   */
  isSpellOnCooldown(spellId: string): boolean {
    return this.spellCooldowns.has(spellId);
  }

  /**
   * Start spell cooldown
   */
  startSpellCooldown(spellId: string, cooldownDuration: number): void {
    const adjustedCooldown = cooldownDuration * (1 - this.stats.cooldownReduction);
    this.spellCooldowns.set(spellId, adjustedCooldown);
  }

  /**
   * Get remaining cooldown time for a spell
   */
  getSpellCooldownRemaining(spellId: string): number {
    return this.spellCooldowns.get(spellId) || 0;
  }

  /**
   * Serialize character state for network transmission
   */
  serialize() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      stats: this.stats,
      position: this.position,
      velocity: this.velocity,
      isAlive: this.isAlive,
      activeEffects: this.activeEffects,
      cooldowns: Array.from(this.spellCooldowns.entries()),
    };
  }
}
