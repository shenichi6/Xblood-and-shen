import { describe, it, expect, beforeEach } from "vitest";
import { Arena, ArenaFactory, type Obstacle } from "./Arena.ts";

describe("Arena System", () => {
  describe("Arena Class", () => {
    let arena: Arena;

    beforeEach(() => {
      arena = ArenaFactory.createVolcanicArena();
    });

    it("should initialize arena with correct properties", () => {
      expect(arena.id).toBe(1);
      expect(arena.name).toBe("Volcanic Arena");
      expect(arena.width).toBe(900);
      expect(arena.height).toBe(600);
      expect(arena.centerX).toBe(450);
      expect(arena.centerY).toBe(300);
    });

    it("should check if position is in safe zone", () => {
      // Center should be in safe zone
      expect(arena.isInSafeZone(450, 300)).toBe(true);

      // Far corner should not be in safe zone
      expect(arena.isInSafeZone(0, 0)).toBe(false);
    });

    it("should calculate distance from center", () => {
      const distance = arena.getDistanceFromCenter(450, 300);
      expect(distance).toBe(0);
    });

    it("should detect obstacle collision", () => {
      const obstacle = arena.checkObstacleCollision(100, 100, 20);
      expect(obstacle).not.toBeNull();
    });

    it("should not detect collision outside obstacles", () => {
      const obstacle = arena.checkObstacleCollision(500, 500, 20);
      expect(obstacle).toBeNull();
    });

    it("should get obstacles in radius", () => {
      const obstacles = arena.getObstaclesInRadius(450, 300, 200);
      expect(obstacles.length).toBeGreaterThan(0);
    });

    it("should damage destructible obstacle", () => {
      const destructible = arena.obstacles.find((o) => o.type === "destructible");
      if (destructible) {
        const healthBefore = destructible.health || 0;
        arena.damageObstacle(destructible.id, 10);
        const healthAfter = destructible.health || 0;

        expect(healthAfter).toBeLessThan(healthBefore);
      }
    });

    it("should destroy obstacle when health reaches 0", () => {
      const destructible = arena.obstacles.find((o) => o.type === "destructible");
      if (destructible) {
        const obstacleCount = arena.obstacles.length;
        arena.damageObstacle(destructible.id, destructible.maxHealth || 100);

        expect(arena.obstacles.length).toBeLessThan(obstacleCount);
      }
    });

    it("should remove obstacle", () => {
      const initialCount = arena.obstacles.length;
      if (arena.obstacles.length > 0) {
        arena.removeObstacle(arena.obstacles[0]!.id);
        expect(arena.obstacles.length).toBe(initialCount - 1);
      }
    });

    it("should update fire ring shrinking", () => {
      const radiusBefore = arena.currentRadius;
      arena.updateFireRing(1000); // 1 second
      const radiusAfter = arena.currentRadius;

      expect(radiusAfter).toBeLessThan(radiusBefore);
    });

    it("should apply fire ring damage periodically", () => {
      arena.updateFireRing(1000);
      const shouldDamage = arena.shouldTakeFireRingDamage();
      expect(shouldDamage).toBe(true);
    });

    it("should get fire ring damage amount", () => {
      const damage = arena.getFireRingDamage();
      expect(damage).toBeGreaterThan(0);
    });

    it("should reset fire ring damage timer", () => {
      arena.fireRingDamageTimer = 500;
      arena.resetFireRingDamageTimer();
      expect(arena.fireRingDamageTimer).toBe(0);
    });

    it("should get arena bounds", () => {
      const bounds = arena.getBounds();
      expect(bounds.width).toBe(900);
      expect(bounds.height).toBe(600);
    });

    it("should clamp position to arena bounds", () => {
      const clamped = arena.clampPosition(-100, -100, 20);
      expect(clamped.x).toBeGreaterThanOrEqual(20);
      expect(clamped.y).toBeGreaterThanOrEqual(20);
    });

    it("should clamp position within bounds", () => {
      const clamped = arena.clampPosition(1000, 1000, 20);
      expect(clamped.x).toBeLessThanOrEqual(880);
      expect(clamped.y).toBeLessThanOrEqual(580);
    });

    it("should serialize arena data", () => {
      const serialized = arena.serialize();
      expect(serialized.id).toBe(1);
      expect(serialized.width).toBe(900);
      expect(serialized.obstacles).toBeDefined();
      expect(serialized.currentRadius).toBeDefined();
    });

    it("should maintain minimum fire ring radius", () => {
      // Shrink fire ring many times
      for (let i = 0; i < 1000; i++) {
        arena.updateFireRing(100);
      }

      expect(arena.currentRadius).toBeGreaterThanOrEqual(50);
    });
  });

  describe("Arena Factory", () => {
    it("should create Volcanic Arena", () => {
      const arena = ArenaFactory.createVolcanicArena();
      expect(arena.name).toBe("Volcanic Arena");
      expect(arena.theme).toBe("volcanic");
      expect(arena.obstacles.length).toBeGreaterThan(0);
    });

    it("should create Frozen Arena", () => {
      const arena = ArenaFactory.createFrozenArena();
      expect(arena.name).toBe("Frozen Arena");
      expect(arena.theme).toBe("frozen");
      expect(arena.obstacles.length).toBeGreaterThan(0);
    });

    it("should create Dark Forest Arena", () => {
      const arena = ArenaFactory.createDarkForestArena();
      expect(arena.name).toBe("Dark Forest");
      expect(arena.theme).toBe("dark_forest");
      expect(arena.obstacles.length).toBeGreaterThan(0);
    });

    it("should get all arenas", () => {
      const arenas = ArenaFactory.getAllArenas();
      expect(arenas.length).toBe(3);
    });

    it("should get arena by ID", () => {
      const arena = ArenaFactory.getArenaById(1);
      expect(arena).not.toBeNull();
      expect(arena?.id).toBe(1);
    });

    it("should return null for invalid arena ID", () => {
      const arena = ArenaFactory.getArenaById(999);
      expect(arena).toBeNull();
    });

    it("should have different fire ring damage values", () => {
      const volcanic = ArenaFactory.createVolcanicArena();
      const frozen = ArenaFactory.createFrozenArena();

      expect(volcanic.fireRingDamage).not.toBe(frozen.fireRingDamage);
    });

    it("should have different shrink speeds", () => {
      const volcanic = ArenaFactory.createVolcanicArena();
      const frozen = ArenaFactory.createFrozenArena();

      expect(volcanic.fireRingShrinkSpeed).not.toBe(frozen.fireRingShrinkSpeed);
    });
  });

  describe("Fire Ring Mechanics", () => {
    let arena: Arena;

    beforeEach(() => {
      arena = ArenaFactory.createVolcanicArena();
    });

    it("should shrink fire ring over time", () => {
      const initialRadius = arena.currentRadius;

      // Simulate 10 seconds of gameplay
      for (let i = 0; i < 10; i++) {
        arena.updateFireRing(1000);
      }

      expect(arena.currentRadius).toBeLessThan(initialRadius);
    });

    it("should apply damage outside safe zone", () => {
      arena.currentRadius = 100; // Make safe zone very small

      // Position far from center (outside safe zone)
      const isInSafeZone = arena.isInSafeZone(0, 0);
      expect(isInSafeZone).toBe(false);

      // Should take damage
      arena.updateFireRing(1000);
      const shouldDamage = arena.shouldTakeFireRingDamage();
      expect(shouldDamage).toBe(true);
    });

    it("should not apply damage in safe zone", () => {
      // Position at center (in safe zone)
      const isInSafeZone = arena.isInSafeZone(450, 300);
      expect(isInSafeZone).toBe(true);

      arena.resetFireRingDamageTimer();
      arena.updateFireRing(500);
      const shouldDamage = arena.shouldTakeFireRingDamage();
      expect(shouldDamage).toBe(false);
    });
  });

  describe("Obstacle Mechanics", () => {
    let arena: Arena;

    beforeEach(() => {
      arena = ArenaFactory.createVolcanicArena();
    });

    it("should have different obstacle types", () => {
      const types = new Set(arena.obstacles.map((o) => o.type));
      expect(types.size).toBeGreaterThan(1);
    });

    it("should only damage destructible obstacles", () => {
      const wall = arena.obstacles.find((o) => o.type === "wall");
      if (wall) {
        const result = arena.damageObstacle(wall.id, 100);
        expect(result).toBe(false);
      }
    });

    it("should track obstacle health", () => {
      const destructible = arena.obstacles.find((o) => o.type === "destructible");
      if (destructible && destructible.health) {
        expect(destructible.health).toBeGreaterThan(0);
        expect(destructible.health).toBeLessThanOrEqual(destructible.maxHealth || 0);
      }
    });
  });
});
