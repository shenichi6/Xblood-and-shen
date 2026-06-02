import { describe, it, expect, beforeEach } from "vitest";
import { Pickup, PickupFactory, PickupSpawner } from "./Pickup.ts";

describe("Pickup System", () => {
  describe("Pickup Class", () => {
    let healthPotion: Pickup;

    beforeEach(() => {
      healthPotion = PickupFactory.createHealthPotion(100, 100);
    });

    it("should create pickup with correct properties", () => {
      expect(healthPotion.type).toBe("health_potion");
      expect(healthPotion.name).toBe("Health Potion");
      expect(healthPotion.value).toBe(50);
      expect(healthPotion.x).toBe(100);
      expect(healthPotion.y).toBe(100);
    });

    it("should detect collision with character", () => {
      const collision = healthPotion.checkCollision(100, 100, 20);
      expect(collision).toBe(true);
    });

    it("should not detect collision far away", () => {
      const collision = healthPotion.checkCollision(500, 500, 20);
      expect(collision).toBe(false);
    });

    it("should not detect collision when collected", () => {
      healthPotion.collect();
      const collision = healthPotion.checkCollision(100, 100, 20);
      expect(collision).toBe(false);
    });

    it("should mark as collected", () => {
      expect(healthPotion.isCollected).toBe(false);
      healthPotion.collect();
      expect(healthPotion.isCollected).toBe(true);
    });

    it("should serialize pickup data", () => {
      const serialized = healthPotion.serialize();
      expect(serialized.type).toBe("health_potion");
      expect(serialized.value).toBe(50);
      expect(serialized.isCollected).toBe(false);
    });

    it("should have spawn time", () => {
      expect(healthPotion.spawnTime).toBeLessThanOrEqual(Date.now());
    });
  });

  describe("Pickup Factory", () => {
    it("should create health potion", () => {
      const potion = PickupFactory.createHealthPotion(100, 100);
      expect(potion.type).toBe("health_potion");
      expect(potion.value).toBe(50);
    });

    it("should create mana potion", () => {
      const potion = PickupFactory.createManaPotion(100, 100);
      expect(potion.type).toBe("mana_potion");
      expect(potion.value).toBe(40);
    });

    it("should create spell powerup", () => {
      const powerup = PickupFactory.createSpellPowerup(100, 100);
      expect(powerup.type).toBe("spell_powerup");
      expect(powerup.value).toBe(1.25);
      expect(powerup.duration).toBe(10000);
    });

    it("should create speed boost", () => {
      const boost = PickupFactory.createSpeedBoost(100, 100);
      expect(boost.type).toBe("speed_boost");
      expect(boost.value).toBe(1.5);
      expect(boost.duration).toBe(8000);
    });

    it("should create random pickup", () => {
      const pickup = PickupFactory.createRandomPickup(100, 100);
      expect(pickup).toBeDefined();
      expect(["health_potion", "mana_potion", "spell_powerup", "speed_boost"]).toContain(
        pickup.type
      );
    });

    it("should respect pickup weights", () => {
      const weights = {
        health_potion: 1,
        mana_potion: 0,
        spell_powerup: 0,
        speed_boost: 0,
      };

      const pickup = PickupFactory.createRandomPickup(100, 100, weights);
      expect(pickup.type).toBe("health_potion");
    });

    it("should generate unique IDs for pickups", () => {
      const potion1 = PickupFactory.createHealthPotion(100, 100);
      const potion2 = PickupFactory.createHealthPotion(100, 100);

      expect(potion1.id).not.toBe(potion2.id);
    });
  });

  describe("Pickup Spawner", () => {
    let spawner: PickupSpawner;

    beforeEach(() => {
      spawner = new PickupSpawner({ width: 900, height: 600 });
    });

    it("should initialize spawner", () => {
      expect(spawner.pickups.length).toBe(0);
      expect(spawner.spawnInterval).toBe(3000);
      expect(spawner.maxPickups).toBe(10);
    });

    it("should spawn pickups over time", () => {
      spawner.update(3000); // 3 seconds
      expect(spawner.pickups.length).toBeGreaterThan(0);
    });

    it("should not exceed max pickups", () => {
      // Spawn many times
      for (let i = 0; i < 100; i++) {
        spawner.update(3000);
      }

      expect(spawner.pickups.length).toBeLessThanOrEqual(spawner.maxPickups);
    });

    it("should remove collected pickups", () => {
      spawner.update(3000);
      const initialCount = spawner.pickups.length;

      if (spawner.pickups.length > 0) {
        spawner.pickups[0]!.collect();
        spawner.update(0);

        expect(spawner.pickups.length).toBeLessThan(initialCount);
      }
    });

    it("should detect pickup collisions", () => {
      spawner.update(3000);

      if (spawner.pickups.length > 0) {
        const pickup = spawner.pickups[0]!;
        const collisions = spawner.checkCollisions(pickup.x, pickup.y, 20);

        expect(collisions.length).toBeGreaterThan(0);
      }
    });

    it("should get active pickups", () => {
      spawner.update(3000);
      const active = spawner.getActivePickups();

      expect(active.length).toBeGreaterThan(0);
      expect(active.every((p) => !p.isCollected)).toBe(true);
    });

    it("should clear all pickups", () => {
      spawner.update(3000);
      expect(spawner.pickups.length).toBeGreaterThan(0);

      spawner.clear();
      expect(spawner.pickups.length).toBe(0);
    });

    it("should serialize spawner state", () => {
      spawner.update(3000);
      const serialized = spawner.serialize();

      expect(serialized.pickups).toBeDefined();
      expect(serialized.spawnInterval).toBe(3000);
      expect(serialized.maxPickups).toBe(10);
    });

    it("should spawn pickups within arena bounds", () => {
      spawner.update(3000);

      for (const pickup of spawner.pickups) {
        expect(pickup.x).toBeGreaterThan(50);
        expect(pickup.x).toBeLessThan(850);
        expect(pickup.y).toBeGreaterThan(50);
        expect(pickup.y).toBeLessThan(550);
      }
    });

    it("should handle multiple collision checks", () => {
      spawner.update(3000);

      const collisions1 = spawner.checkCollisions(100, 100, 20);
      const collisions2 = spawner.checkCollisions(200, 200, 20);

      expect(collisions1.length + collisions2.length).toBeLessThanOrEqual(
        spawner.pickups.length
      );
    });

    it("should continue spawning after collection", () => {
      spawner.update(3000);
      const firstSpawn = spawner.pickups.length;

      // Collect all pickups
      spawner.pickups.forEach((p) => p.collect());
      spawner.update(0);

      // Spawn more
      spawner.update(3000);
      expect(spawner.pickups.length).toBeGreaterThan(0);
    });

    it("should respect spawn interval", () => {
      spawner.update(1000); // Less than spawn interval
      expect(spawner.pickups.length).toBe(0);

      spawner.update(2000); // Now exceeds spawn interval
      expect(spawner.pickups.length).toBeGreaterThan(0);
    });

    it("should handle delta time accumulation", () => {
      spawner.update(1500);
      spawner.update(1500);
      expect(spawner.pickups.length).toBeGreaterThan(0);
    });
  });

  describe("Pickup Types", () => {
    it("should have health potion with positive value", () => {
      const potion = PickupFactory.createHealthPotion(100, 100);
      expect(potion.value).toBeGreaterThan(0);
    });

    it("should have mana potion with positive value", () => {
      const potion = PickupFactory.createManaPotion(100, 100);
      expect(potion.value).toBeGreaterThan(0);
    });

    it("should have spell powerup with multiplier", () => {
      const powerup = PickupFactory.createSpellPowerup(100, 100);
      expect(powerup.value).toBeGreaterThan(1);
    });

    it("should have speed boost with multiplier", () => {
      const boost = PickupFactory.createSpeedBoost(100, 100);
      expect(boost.value).toBeGreaterThan(1);
    });

    it("should have duration for temporary buffs", () => {
      const powerup = PickupFactory.createSpellPowerup(100, 100);
      const boost = PickupFactory.createSpeedBoost(100, 100);

      expect(powerup.duration).toBeGreaterThan(0);
      expect(boost.duration).toBeGreaterThan(0);
    });

    it("should not have duration for consumables", () => {
      const health = PickupFactory.createHealthPotion(100, 100);
      const mana = PickupFactory.createManaPotion(100, 100);

      expect(health.duration).toBeUndefined();
      expect(mana.duration).toBeUndefined();
    });
  });
});
