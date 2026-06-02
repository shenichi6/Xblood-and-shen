import { describe, it, expect, beforeEach } from "vitest";
import { Tank } from "./Tank";
import { Mage } from "./Mage";
import { Rogue } from "./Rogue";
import type { StatusEffect } from "@shared/gameTypes";

describe("Character System", () => {
  describe("Tank Character", () => {
    let tank: Tank;

    beforeEach(() => {
      tank = new Tank("tank_1", "Fire Tank", 100, 100);
    });

    it("should initialize with correct stats", () => {
      // Tank should have high HP and defense
      expect(tank.stats.maxHp).toBe(150);
      expect(tank.stats.hp).toBe(150);
      expect(tank.stats.speed).toBe(120);
      expect(tank.stats.defense).toBe(25);
    });

    it("should take damage and reduce HP", () => {
      tank.takeDamage(50);
      // Damage is mitigated by defense: 50 - 25 defense = 25 damage
      expect(tank.stats.hp).toBe(125);
    });

    it("should apply defense mitigation", () => {
      tank.takeDamage(30); // 30 - 25 defense = 5 damage
      expect(tank.stats.hp).toBe(150 - 5); // 145 HP
    });

    it("should die when HP reaches 0", () => {
      tank.takeDamage(200);
      // Damage mitigated: 200 - 25 = 175, which exceeds 150 HP
      expect(tank.stats.hp).toBe(0);
      expect(tank.isAlive).toBe(false);
    });

    it("should heal correctly", () => {
      tank.takeDamage(50);
      // After damage: 150 - 25 = 125 HP
      tank.heal(30);
      // After heal: 125 + 30 = 155, but capped at maxHp of 150
      expect(tank.stats.hp).toBe(150);
    });

    it("should not heal above max HP", () => {
      tank.heal(100);
      // Already at max HP of 150
      expect(tank.stats.hp).toBe(150);
    });

    it("should apply status effects", () => {
      const freezeEffect: StatusEffect = {
        type: "freeze",
        duration: 3000,
        remainingTime: 3000,
      };
      tank.applyEffect(freezeEffect);
      // Effect should be added to active effects
      expect(tank.activeEffects.length).toBe(1);
      expect(tank.activeEffects[0]?.type).toBe("freeze");
    });

    it("should remove status effects", () => {
      const freezeEffect: StatusEffect = {
        type: "freeze",
        duration: 3000,
        remainingTime: 3000,
      };
      tank.applyEffect(freezeEffect);
      tank.removeEffect("freeze");
      // Effect should be removed
      expect(tank.activeEffects.length).toBe(0);
    });

    it("should handle spell cooldowns", () => {
      tank.startSpellCooldown("fireball", 5000);
      expect(tank.isSpellOnCooldown("fireball")).toBe(true);
      const remaining = tank.getSpellCooldownRemaining("fireball");
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(5000);
    });

    it("should apply knockback", () => {
      tank.applyKnockback(100, 50);
      // Knockback sets velocity
      expect(tank.velocity.x).toBe(100);
      expect(tank.velocity.y).toBe(50);
    });

    it("should update position based on velocity", () => {
      const initialX = tank.position.x;
      const initialY = tank.position.y;
      tank.velocity.x = 100;
      tank.velocity.y = 50;
      tank.update(1000); // 1 second
      // Position should update based on velocity and deltaTime
      expect(tank.position.x).toBeGreaterThan(initialX);
      expect(tank.position.y).toBeGreaterThan(initialY);
    });
  });

  describe("Mage Character", () => {
    let mage: Mage;

    beforeEach(() => {
      mage = new Mage("mage_1", "Frost Mage", 200, 200);
    });

    it("should initialize with correct stats", () => {
      // Mage should have low HP but high spell power
      expect(mage.stats.maxHp).toBe(80);
      expect(mage.stats.hp).toBe(80);
      expect(mage.stats.spellPower).toBe(60);
      expect(mage.stats.cooldownReduction).toBe(0.15);
    });

    it("should have mana pool", () => {
      // Mage should start with full mana
      expect(mage.getMana()).toBe(100);
      expect(mage.getMaxMana()).toBe(100);
    });

    it("should consume mana for spells", () => {
      const success = mage.consumeMana(30);
      expect(success).toBe(true);
      // After consuming 30: 100 - 30 = 70 mana
      expect(mage.getMana()).toBe(70);
    });

    it("should not consume mana if insufficient", () => {
      const success = mage.consumeMana(150);
      expect(success).toBe(false);
      // Mana should remain unchanged
      expect(mage.getMana()).toBe(100);
    });

    it("should restore mana", () => {
      mage.consumeMana(50);
      // After consuming 50: 100 - 50 = 50 mana
      mage.restoreMana(30);
      // After restoring 30: 50 + 30 = 80 mana
      expect(mage.getMana()).toBe(80);
    });

    it("should regenerate mana over time", () => {
      mage.consumeMana(50);
      const manaBefore = mage.getMana();
      mage.update(1000); // 1 second
      const manaAfter = mage.getMana();
      // Mana should regenerate
      expect(manaAfter).toBeGreaterThanOrEqual(manaBefore);
    });

    it("should teleport to valid distance", () => {
      const success = mage.teleport(150, 150);
      expect(success).toBe(true);
      // Position should update to teleport target
      expect(mage.position.x).toBe(150);
      expect(mage.position.y).toBe(150);
    });

    it("should not teleport beyond range", () => {
      const success = mage.teleport(500, 500);
      // Teleport should fail if target is too far
      expect(success).toBe(false);
    });
  });

  describe("Rogue Character", () => {
    let rogue: Rogue;

    beforeEach(() => {
      rogue = new Rogue("rogue_1", "Shadow Rogue", 300, 300);
    });

    it("should initialize with correct stats", () => {
      // Rogue should have high speed and attack power
      expect(rogue.stats.maxHp).toBe(90);
      expect(rogue.stats.speed).toBe(180);
      expect(rogue.stats.attackPower).toBe(55);
    });

    it("should have energy pool", () => {
      // Rogue should start with full energy
      expect(rogue.getEnergy()).toBe(100);
      expect(rogue.getMaxEnergy()).toBe(100);
    });

    it("should consume energy for abilities", () => {
      const success = rogue.consumeEnergy(25);
      expect(success).toBe(true);
      // After consuming 25: 100 - 25 = 75 energy
      expect(rogue.getEnergy()).toBe(75);
    });

    it("should not consume energy if insufficient", () => {
      const success = rogue.consumeEnergy(150);
      expect(success).toBe(false);
      // Energy should remain unchanged
      expect(rogue.getEnergy()).toBe(100);
    });

    it("should restore energy", () => {
      rogue.consumeEnergy(50);
      // After consuming 50: 100 - 50 = 50 energy
      rogue.restoreEnergy(30);
      // After restoring 30: 50 + 30 = 80 energy
      expect(rogue.getEnergy()).toBe(80);
    });

    it("should regenerate energy over time", () => {
      rogue.consumeEnergy(50);
      const energyBefore = rogue.getEnergy();
      rogue.update(1000); // 1 second
      const energyAfter = rogue.getEnergy();
      // Energy should regenerate
      expect(energyAfter).toBeGreaterThanOrEqual(energyBefore);
    });

    it("should dash in direction", () => {
      const success = rogue.dash(1, 0);
      expect(success).toBe(true);
      // Velocity should be set in dash direction
      expect(rogue.velocity.x).toBeGreaterThan(0);
    });

    it("should not dash without energy", () => {
      rogue.consumeEnergy(100);
      const success = rogue.dash(1, 0);
      // Dash should fail without energy
      expect(success).toBe(false);
    });

    it("should activate evasion", () => {
      const defenseBeforeEvasion = rogue.stats.defense;
      const success = rogue.evasion();
      expect(success).toBe(true);
      // Defense should increase during evasion
      expect(rogue.stats.defense).toBeGreaterThan(defenseBeforeEvasion);
    });
  });

  describe("Shared Character Mechanics", () => {
    it("should serialize character state", () => {
      const tank = new Tank("tank_1", "Fire Tank", 100, 100);
      const serialized = tank.serialize();

      expect(serialized.id).toBe("tank_1");
      expect(serialized.type).toBe("tank");
      expect(serialized.stats).toBeDefined();
      expect(serialized.position).toBeDefined();
      expect(serialized.isAlive).toBe(true);
      expect(serialized.position.x).toBe(100);
      expect(serialized.position.y).toBe(100);
    });

    it("should handle multiple status effects", () => {
      const mage = new Mage("mage_1", "Frost Mage", 200, 200);

      const freezeEffect: StatusEffect = {
        type: "freeze",
        duration: 3000,
        remainingTime: 3000,
      };
      const burnEffect: StatusEffect = {
        type: "burn",
        duration: 2000,
        remainingTime: 2000,
        value: 10,
      };

      mage.applyEffect(freezeEffect);
      mage.applyEffect(burnEffect);

      // Both effects should be active
      expect(mage.activeEffects.length).toBe(2);
    });

    it("should decay status effects over time", () => {
      const rogue = new Rogue("rogue_1", "Shadow Rogue", 300, 300);

      const freezeEffect: StatusEffect = {
        type: "freeze",
        duration: 1000,
        remainingTime: 1000,
      };

      rogue.applyEffect(freezeEffect);
      rogue.update(600); // 600ms

      // Effect should still exist but with reduced time
      expect(rogue.activeEffects.length).toBeGreaterThan(0);
      expect(rogue.activeEffects[0]?.remainingTime).toBeLessThan(1000);
    });

    it("should remove expired status effects", () => {
      const tank = new Tank("tank_1", "Fire Tank", 100, 100);

      const freezeEffect: StatusEffect = {
        type: "freeze",
        duration: 500,
        remainingTime: 500,
      };

      tank.applyEffect(freezeEffect);
      tank.update(600); // 600ms (expires the effect)

      // Effect should be removed after expiration
      expect(tank.activeEffects.length).toBe(0);
    });
  });
});
