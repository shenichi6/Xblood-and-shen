import { describe, it, expect, beforeEach } from "vitest";
import { Spell, SpellFactory } from "./Spell.ts";
import { SpellCaster } from "./SpellCaster.ts";
import { Tank } from "../characters/Tank.ts";
import { Mage } from "../characters/Mage.ts";
import { Rogue } from "../characters/Rogue.ts";

describe("Spell System", () => {
  describe("Spell Class", () => {
    let fireball: Spell;

    beforeEach(() => {
      fireball = SpellFactory.createFireball();
    });

    it("should create a spell with correct properties", () => {
      expect(fireball.id).toBe("fireball");
      expect(fireball.name).toBe("Fireball");
      expect(fireball.cooldown).toBe(3000);
      expect(fireball.manaCost).toBe(50);
      expect(fireball.range).toBe(400);
    });

    it("should calculate total damage", () => {
      const damage = fireball.getTotalDamage();
      expect(damage).toBe(60);
    });

    it("should get knockback force", () => {
      const knockback = fireball.getKnockbackForce();
      expect(knockback).toBe(200);
    });

    it("should get status effects", () => {
      const effects = fireball.getStatusEffects();
      expect(effects.length).toBeGreaterThan(0);
      expect(effects[0]?.type).toBe("burn");
    });

    it("should serialize spell data", () => {
      const serialized = fireball.serialize();
      expect(serialized.id).toBe("fireball");
      expect(serialized.effects).toBeDefined();
      expect(serialized.manaCost).toBe(50);
    });
  });

  describe("Spell Factory", () => {
    it("should create Fireball spell", () => {
      const fireball = SpellFactory.createFireball();
      expect(fireball.name).toBe("Fireball");
      expect(fireball.getTotalDamage()).toBe(60);
    });

    it("should create Frost Bolt spell", () => {
      const frostBolt = SpellFactory.createFrostBolt();
      expect(frostBolt.name).toBe("Frost Bolt");
      expect(frostBolt.getTotalDamage()).toBe(45);
    });

    it("should create Heal spell", () => {
      const heal = SpellFactory.createHeal();
      expect(heal.name).toBe("Heal");
      expect(heal.getTotalHealing()).toBe(80);
    });

    it("should create Lightning Strike spell", () => {
      const lightning = SpellFactory.createLightningStrike();
      expect(lightning.name).toBe("Lightning Strike");
      expect(lightning.getTotalDamage()).toBe(75);
    });

    it("should create Dash spell", () => {
      const dash = SpellFactory.createDash();
      expect(dash.name).toBe("Dash");
      expect(dash.getKnockbackForce()).toBe(150);
    });

    it("should create Meteor spell", () => {
      const meteor = SpellFactory.createMeteor();
      expect(meteor.name).toBe("Meteor");
      expect(meteor.getTotalDamage()).toBe(120);
    });

    it("should get all spells", () => {
      const allSpells = SpellFactory.getAllSpells();
      expect(allSpells.length).toBe(6);
    });

    it("should get spells by character type - Mage", () => {
      const mageSpells = SpellFactory.getSpellsByCharacterType("mage");
      expect(mageSpells.length).toBe(4);
    });

    it("should get spells by character type - Tank", () => {
      const tankSpells = SpellFactory.getSpellsByCharacterType("tank");
      expect(tankSpells.length).toBe(3);
    });

    it("should get spells by character type - Rogue", () => {
      const rogueSpells = SpellFactory.getSpellsByCharacterType("rogue");
      expect(rogueSpells.length).toBe(3);
    });
  });

  describe("Spell Caster", () => {
    let mage: Mage;
    let tank: Tank;
    let fireball: Spell;
    let frostBolt: Spell;

    beforeEach(() => {
      mage = new Mage("mage_1", "Frost Mage", 200, 200);
      tank = new Tank("tank_1", "Fire Tank", 100, 100);
      fireball = SpellFactory.createFireball();
      frostBolt = SpellFactory.createFrostBolt();
    });

    it("should validate spell can be cast", () => {
      const result = SpellCaster.canCastSpell(mage, fireball);
      expect(result.canCast).toBe(true);
    });

    it("should prevent casting spell without mana", () => {
      // Consume all mana
      (mage as any).consumeMana(100);

      const result = SpellCaster.canCastSpell(mage, fireball);
      expect(result.canCast).toBe(false);
      expect(result.reason).toContain("Insufficient mana");
    });

    it("should prevent casting spell on cooldown", () => {
      // Cast spell once
      SpellCaster.castSpell(mage, fireball, 200, 200);

      // Try to cast again immediately
      const result = SpellCaster.canCastSpell(mage, fireball);
      expect(result.canCast).toBe(false);
      expect(result.reason).toContain("cooldown");
    });

    it("should prevent casting spell out of range", () => {
      const result = SpellCaster.castSpell(mage, fireball, 1000, 1000);
      expect(result.success).toBe(false);
      expect(result.message).toContain("out of range");
    });

    it("should successfully cast spell", () => {
      const result = SpellCaster.castSpell(mage, fireball, 200, 200);
      expect(result.success).toBe(true);
      expect(result.damage).toBe(60);
    });

    it("should consume mana when casting", () => {
      const manaBefore = (mage as any).getMana();
      SpellCaster.castSpell(mage, fireball, 200, 200);
      const manaAfter = (mage as any).getMana();

      expect(manaAfter).toBeLessThan(manaBefore);
      expect(manaBefore - manaAfter).toBe(50);
    });

    it("should apply damage to target", () => {
      const hpBefore = tank.stats.hp;
      SpellCaster.castSpellOnTarget(mage, fireball, tank);
      const hpAfter = tank.stats.hp;

      expect(hpAfter).toBeLessThan(hpBefore);
    });

    it("should apply status effects to target", () => {
      SpellCaster.castSpellOnTarget(mage, frostBolt, tank);

      expect(tank.activeEffects.length).toBeGreaterThan(0);
      expect(tank.activeEffects[0]?.type).toBe("freeze");
    });

    it("should apply knockback to target", () => {
      const velocityBefore = { x: tank.velocity.x, y: tank.velocity.y };
      SpellCaster.castSpellOnTarget(mage, fireball, tank);

      // Velocity should change due to knockback
      expect(tank.velocity.x !== velocityBefore.x || tank.velocity.y !== velocityBefore.y).toBe(
        true
      );
    });

    it("should get spell properties", () => {
      expect(SpellCaster.getSpellCastTime(fireball)).toBe(500);
      expect(SpellCaster.getSpellCooldown(fireball)).toBe(3000);
      expect(SpellCaster.getSpellRange(fireball)).toBe(400);
      expect(SpellCaster.getSpellManaCost(fireball)).toBe(50);
    });

    it("should handle heal spell", () => {
      const heal = SpellFactory.createHeal();
      tank.takeDamage(50);
      const hpBefore = tank.stats.hp;

      SpellCaster.castSpellOnTarget(mage, heal, tank);
      const hpAfter = tank.stats.hp;

      expect(hpAfter).toBeGreaterThan(hpBefore);
    });

    it("should handle multiple spell casts with cooldown", () => {
      // First cast
      const result1 = SpellCaster.castSpell(mage, fireball, 200, 200);
      expect(result1.success).toBe(true);

      // Second cast should fail (on cooldown)
      const result2 = SpellCaster.castSpell(mage, fireball, 200, 200);
      expect(result2.success).toBe(false);
    });

    it("should handle different spell types", () => {
      const spells = [
        SpellFactory.createFireball(),
        SpellFactory.createFrostBolt(),
        SpellFactory.createHeal(),
        SpellFactory.createLightningStrike(),
      ];

      for (const spell of spells) {
        const result = SpellCaster.canCastSpell(mage, spell);
        expect(result.canCast).toBe(true);
      }
    });
  });
});
