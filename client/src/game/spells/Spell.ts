/**
 * Spell Class
 * Represents a spell that can be cast by characters
 * Handles spell effects, cooldowns, and damage calculations
 */

import type { SpellEffect } from "@shared/gameTypes";

export class Spell {
  id: string;
  name: string;
  description: string;
  cooldown: number; // in milliseconds
  castTime: number; // in milliseconds
  range: number; // in pixels
  manaCost: number;
  effects: SpellEffect[];
  animationName: string;
  soundEffectUrl?: string;
  particleEffectType?: string;
  isActive: boolean;

  constructor(
    id: string,
    name: string,
    description: string,
    cooldown: number,
    castTime: number,
    range: number,
    manaCost: number,
    effects: SpellEffect[],
    animationName: string,
    soundEffectUrl?: string,
    particleEffectType?: string
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.cooldown = cooldown;
    this.castTime = castTime;
    this.range = range;
    this.manaCost = manaCost;
    this.effects = effects;
    this.animationName = animationName;
    this.soundEffectUrl = soundEffectUrl;
    this.particleEffectType = particleEffectType;
    this.isActive = true;
  }

  /**
   * Get total damage from all damage effects
   */
  getTotalDamage(): number {
    return this.effects
      .filter((e) => e.type === "damage")
      .reduce((sum, e) => sum + (e.value || 0), 0);
  }

  /**
   * Get total healing from all heal effects
   */
  getTotalHealing(): number {
    return this.effects
      .filter((e) => e.type === "heal")
      .reduce((sum, e) => sum + (e.value || 0), 0);
  }

  /**
   * Get knockback force
   */
  getKnockbackForce(): number {
    const knockbackEffect = this.effects.find((e) => e.type === "knockback");
    return knockbackEffect?.value || 0;
  }

  /**
   * Get status effects applied by this spell
   */
  getStatusEffects(): SpellEffect[] {
    return this.effects.filter((e) =>
      ["freeze", "burn", "stun", "speed_boost"].includes(e.type)
    );
  }

  /**
   * Serialize spell data for transmission
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      cooldown: this.cooldown,
      castTime: this.castTime,
      range: this.range,
      manaCost: this.manaCost,
      effects: this.effects,
      animationName: this.animationName,
      soundEffectUrl: this.soundEffectUrl,
      particleEffectType: this.particleEffectType,
      isActive: this.isActive,
    };
  }
}

/**
 * Spell Factory - Creates predefined spells
 */
export class SpellFactory {
  /**
   * Create Fireball spell - High damage, knockback
   */
  static createFireball(): Spell {
    return new Spell(
      "fireball",
      "Fireball",
      "Launch a ball of fire dealing damage and knockback",
      3000, // 3 second cooldown
      500, // 0.5 second cast time
      400, // 400 pixel range
      50, // 50 mana cost
      [
        { type: "damage", value: 60 },
        { type: "knockback", value: 200 },
        { type: "burn", value: 10, duration: 3000 },
      ],
      "fireball_cast",
      undefined,
      "fire"
    );
  }

  /**
   * Create Frost Bolt spell - Damage and freeze
   */
  static createFrostBolt(): Spell {
    return new Spell(
      "frost_bolt",
      "Frost Bolt",
      "Cast a bolt of ice that freezes enemies",
      2500, // 2.5 second cooldown
      400, // 0.4 second cast time
      450, // 450 pixel range
      40, // 40 mana cost
      [
        { type: "damage", value: 45 },
        { type: "freeze", value: 0, duration: 2000 },
      ],
      "frost_bolt_cast",
      undefined,
      "ice"
    );
  }

  /**
   * Create Heal spell - Restore HP
   */
  static createHeal(): Spell {
    return new Spell(
      "heal",
      "Heal",
      "Restore health to yourself or an ally",
      4000, // 4 second cooldown
      600, // 0.6 second cast time
      300, // 300 pixel range
      60, // 60 mana cost
      [{ type: "heal", value: 80 }],
      "heal_cast",
      undefined,
      "healing"
    );
  }

  /**
   * Create Lightning Strike spell - High damage, stun
   */
  static createLightningStrike(): Spell {
    return new Spell(
      "lightning_strike",
      "Lightning Strike",
      "Strike with lightning dealing damage and stunning",
      3500, // 3.5 second cooldown
      700, // 0.7 second cast time
      350, // 350 pixel range
      70, // 70 mana cost
      [
        { type: "damage", value: 75 },
        { type: "stun", value: 0, duration: 1500 },
      ],
      "lightning_strike_cast",
      undefined,
      "lightning"
    );
  }

  /**
   * Create Dash spell - Movement and knockback
   */
  static createDash(): Spell {
    return new Spell(
      "dash",
      "Dash",
      "Dash forward with increased speed",
      2000, // 2 second cooldown
      200, // 0.2 second cast time
      500, // 500 pixel range
      30, // 30 mana cost
      [
        { type: "speed_boost", value: 1.5, duration: 1000 },
        { type: "knockback", value: 150 },
      ],
      "dash_cast",
      undefined,
      "speed"
    );
  }

  /**
   * Create Meteor spell - AoE damage
   */
  static createMeteor(): Spell {
    return new Spell(
      "meteor",
      "Meteor",
      "Call down meteors dealing massive damage",
      5000, // 5 second cooldown
      1000, // 1 second cast time
      600, // 600 pixel range
      100, // 100 mana cost
      [
        { type: "damage", value: 120 },
        { type: "knockback", value: 300 },
        { type: "burn", value: 15, duration: 4000 },
      ],
      "meteor_cast",
      undefined,
      "fire"
    );
  }

  /**
   * Get all available spells
   */
  static getAllSpells(): Spell[] {
    return [
      this.createFireball(),
      this.createFrostBolt(),
      this.createHeal(),
      this.createLightningStrike(),
      this.createDash(),
      this.createMeteor(),
    ];
  }

  /**
   * Get spells by character type
   */
  static getSpellsByCharacterType(characterType: "tank" | "mage" | "rogue"): Spell[] {
    const allSpells = this.getAllSpells();

    switch (characterType) {
      case "tank":
        return [allSpells[0], allSpells[2], allSpells[4]]; // Fireball, Heal, Dash
      case "mage":
        return [allSpells[1], allSpells[2], allSpells[3], allSpells[5]]; // Frost Bolt, Heal, Lightning, Meteor
      case "rogue":
        return [allSpells[0], allSpells[3], allSpells[4]]; // Fireball, Lightning, Dash
      default:
        return allSpells;
    }
  }
}
