/**
 * Spell Caster System
 * Handles spell casting, validation, and effect resolution
 */

import { Spell } from "./Spell";
import type { CharacterBase } from "../characters/CharacterBase";
import type { SpellEffect } from "@shared/gameTypes";

export interface CastResult {
  success: boolean;
  message: string;
  damage?: number;
  healing?: number;
  effects?: SpellEffect[];
}

export class SpellCaster {
  /**
   * Validate if a spell can be cast
   */
  static canCastSpell(caster: CharacterBase, spell: Spell): { canCast: boolean; reason?: string } {
    // Check if spell is on cooldown
    if (caster.isSpellOnCooldown(spell.id)) {
      const remaining = caster.getSpellCooldownRemaining(spell.id);
      return {
        canCast: false,
        reason: `Spell on cooldown for ${Math.ceil(remaining / 1000)}s`,
      };
    }

    // Check mana cost (for mages)
    if (caster.type === "mage") {
      const mana = (caster as any).getMana?.() || 0;
      if (mana < spell.manaCost) {
        return {
          canCast: false,
          reason: `Insufficient mana. Need ${spell.manaCost}, have ${mana}`,
        };
      }
    }

    // Check energy cost (for rogues)
    if (caster.type === "rogue") {
      const energy = (caster as any).getEnergy?.() || 0;
      if (energy < spell.manaCost) {
        return {
          canCast: false,
          reason: `Insufficient energy. Need ${spell.manaCost}, have ${energy}`,
        };
      }
    }

    return { canCast: true };
  }

  /**
   * Cast a spell at a target location
   */
  static castSpell(
    caster: CharacterBase,
    spell: Spell,
    targetX: number,
    targetY: number
  ): CastResult {
    // Validate spell can be cast
    const validation = this.canCastSpell(caster, spell);
    if (!validation.canCast) {
      return {
        success: false,
        message: validation.reason || "Cannot cast spell",
      };
    }

    // Check range
    const distance = Math.sqrt(
      Math.pow(targetX - caster.position.x, 2) +
        Math.pow(targetY - caster.position.y, 2)
    );
    if (distance > spell.range) {
      return {
        success: false,
        message: `Target out of range. Max range: ${spell.range}px, distance: ${Math.ceil(distance)}px`,
      };
    }

    // Consume mana/energy
    if (caster.type === "mage") {
      (caster as any).consumeMana?.(spell.manaCost);
    } else if (caster.type === "rogue") {
      (caster as any).consumeEnergy?.(spell.manaCost);
    }

    // Start cooldown
    caster.startSpellCooldown(spell.id, spell.cooldown);

    // Resolve spell effects
    return this.resolveSpellEffects(caster, spell, targetX, targetY);
  }

  /**
   * Resolve spell effects on target
   */
  static resolveSpellEffects(
    caster: CharacterBase,
    spell: Spell,
    targetX: number,
    targetY: number
  ): CastResult {
    let totalDamage = 0;
    let totalHealing = 0;
    const appliedEffects: SpellEffect[] = [];

    // Process each effect
    for (const effect of spell.effects) {
      switch (effect.type) {
        case "damage":
          totalDamage += effect.value || 0;
          break;

        case "heal":
          totalHealing += effect.value || 0;
          // Apply healing to caster
          caster.heal(totalHealing);
          break;

        case "knockback":
          // Calculate knockback direction
          const angle = Math.atan2(
            targetY - caster.position.y,
            targetX - caster.position.x
          );
          const knockbackForce = effect.value || 0;
          caster.applyKnockback(
            Math.cos(angle) * knockbackForce,
            Math.sin(angle) * knockbackForce
          );
          break;

        case "freeze":
        case "burn":
        case "stun":
        case "speed_boost":
          // Apply status effect
          caster.applyEffect({
            type: effect.type,
            duration: effect.duration || 0,
            remainingTime: effect.duration || 0,
            value: effect.value,
          });
          appliedEffects.push(effect);
          break;
      }
    }

    return {
      success: true,
      message: `${spell.name} cast successfully`,
      damage: totalDamage,
      healing: totalHealing,
      effects: appliedEffects,
    };
  }

  /**
   * Cast spell on a target character
   */
  static castSpellOnTarget(
    caster: CharacterBase,
    spell: Spell,
    target: CharacterBase
  ): CastResult {
    // Validate spell can be cast
    const validation = this.canCastSpell(caster, spell);
    if (!validation.canCast) {
      return {
        success: false,
        message: validation.reason || "Cannot cast spell",
      };
    }

    // Check range
    const distance = Math.sqrt(
      Math.pow(target.position.x - caster.position.x, 2) +
        Math.pow(target.position.y - caster.position.y, 2)
    );
    if (distance > spell.range) {
      return {
        success: false,
        message: `Target out of range. Max range: ${spell.range}px, distance: ${Math.ceil(distance)}px`,
      };
    }

    // Consume mana/energy
    if (caster.type === "mage") {
      (caster as any).consumeMana?.(spell.manaCost);
    } else if (caster.type === "rogue") {
      (caster as any).consumeEnergy?.(spell.manaCost);
    }

    // Start cooldown
    caster.startSpellCooldown(spell.id, spell.cooldown);

    // Apply effects to target
    let totalDamage = 0;
    let totalHealing = 0;
    const appliedEffects: SpellEffect[] = [];

    for (const effect of spell.effects) {
      switch (effect.type) {
        case "damage":
          totalDamage += effect.value || 0;
          target.takeDamage(totalDamage);
          break;

        case "heal":
          totalHealing += effect.value || 0;
          target.heal(totalHealing);
          break;

        case "knockback":
          // Calculate knockback direction from caster to target
          const angle = Math.atan2(
            target.position.y - caster.position.y,
            target.position.x - caster.position.x
          );
          const knockbackForce = effect.value || 0;
          target.applyKnockback(
            Math.cos(angle) * knockbackForce,
            Math.sin(angle) * knockbackForce
          );
          break;

        case "freeze":
        case "burn":
        case "stun":
        case "speed_boost":
          // Apply status effect to target
          target.applyEffect({
            type: effect.type,
            duration: effect.duration || 0,
            remainingTime: effect.duration || 0,
            value: effect.value,
          });
          appliedEffects.push(effect);
          break;
      }
    }

    return {
      success: true,
      message: `${spell.name} cast on ${target.name}`,
      damage: totalDamage,
      healing: totalHealing,
      effects: appliedEffects,
    };
  }

  /**
   * Get spell cast time in milliseconds
   */
  static getSpellCastTime(spell: Spell): number {
    return spell.castTime;
  }

  /**
   * Get spell cooldown in milliseconds
   */
  static getSpellCooldown(spell: Spell): number {
    return spell.cooldown;
  }

  /**
   * Get spell range
   */
  static getSpellRange(spell: Spell): number {
    return spell.range;
  }

  /**
   * Get spell mana cost
   */
  static getSpellManaCost(spell: Spell): number {
    return spell.manaCost;
  }
}
