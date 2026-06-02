/**
 * Pickup Class
 * Represents items that spawn in the arena and provide benefits
 */

export type PickupType = "health_potion" | "mana_potion" | "spell_powerup" | "speed_boost";

export class Pickup {
  id: string;
  type: PickupType;
  name: string;
  description: string;
  value: number;
  duration?: number; // For temporary buffs
  x: number;
  y: number;
  radius: number = 15;
  iconUrl?: string;
  particleColor?: string;
  isCollected: boolean = false;
  spawnTime: number;

  constructor(
    id: string,
    type: PickupType,
    name: string,
    description: string,
    value: number,
    x: number,
    y: number,
    duration?: number,
    iconUrl?: string,
    particleColor?: string
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.description = description;
    this.value = value;
    this.x = x;
    this.y = y;
    this.duration = duration;
    this.iconUrl = iconUrl;
    this.particleColor = particleColor;
    this.spawnTime = Date.now();
  }

  /**
   * Check if pickup collides with character
   */
  checkCollision(charX: number, charY: number, charRadius: number = 20): boolean {
    if (this.isCollected) return false;

    const distance = Math.sqrt(
      Math.pow(charX - this.x, 2) + Math.pow(charY - this.y, 2)
    );
    return distance <= this.radius + charRadius;
  }

  /**
   * Collect the pickup
   */
  collect(): void {
    this.isCollected = true;
  }

  /**
   * Serialize pickup data
   */
  serialize() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      value: this.value,
      duration: this.duration,
      x: this.x,
      y: this.y,
      radius: this.radius,
      iconUrl: this.iconUrl,
      particleColor: this.particleColor,
      isCollected: this.isCollected,
      spawnTime: this.spawnTime,
    };
  }
}

/**
 * Pickup Factory - Creates predefined pickups
 */
export class PickupFactory {
  /**
   * Create Health Potion
   */
  static createHealthPotion(x: number, y: number): Pickup {
    return new Pickup(
      `health_${Date.now()}_${Math.random()}`,
      "health_potion",
      "Health Potion",
      "Restore 50 HP",
      50,
      x,
      y,
      undefined,
      undefined,
      "#FF0000"
    );
  }

  /**
   * Create Mana Potion
   */
  static createManaPotion(x: number, y: number): Pickup {
    return new Pickup(
      `mana_${Date.now()}_${Math.random()}`,
      "mana_potion",
      "Mana Potion",
      "Restore 40 Mana",
      40,
      x,
      y,
      undefined,
      undefined,
      "#0000FF"
    );
  }

  /**
   * Create Spell Powerup
   */
  static createSpellPowerup(x: number, y: number): Pickup {
    return new Pickup(
      `spell_${Date.now()}_${Math.random()}`,
      "spell_powerup",
      "Spell Powerup",
      "Increase spell power by 25% for 10 seconds",
      1.25, // 25% multiplier
      x,
      y,
      10000, // 10 second duration
      undefined,
      "#FFFF00"
    );
  }

  /**
   * Create Speed Boost
   */
  static createSpeedBoost(x: number, y: number): Pickup {
    return new Pickup(
      `speed_${Date.now()}_${Math.random()}`,
      "speed_boost",
      "Speed Boost",
      "Increase movement speed by 50% for 8 seconds",
      1.5, // 50% multiplier
      x,
      y,
      8000, // 8 second duration
      undefined,
      "#00FF00"
    );
  }

  /**
   * Create random pickup at position
   */
  static createRandomPickup(x: number, y: number, weights?: Record<PickupType, number>): Pickup {
    const defaultWeights: Record<PickupType, number> = {
      health_potion: 0.4,
      mana_potion: 0.3,
      spell_powerup: 0.2,
      speed_boost: 0.1,
    };

    const finalWeights = weights || defaultWeights;
    const random = Math.random();
    let cumulative = 0;

    for (const [type, weight] of Object.entries(finalWeights)) {
      cumulative += weight;
      if (random <= cumulative) {
        switch (type as PickupType) {
          case "health_potion":
            return this.createHealthPotion(x, y);
          case "mana_potion":
            return this.createManaPotion(x, y);
          case "spell_powerup":
            return this.createSpellPowerup(x, y);
          case "speed_boost":
            return this.createSpeedBoost(x, y);
        }
      }
    }

    // Default to health potion
    return this.createHealthPotion(x, y);
  }
}

/**
 * Pickup Spawner - Manages pickup spawning in arena
 */
export class PickupSpawner {
  pickups: Pickup[] = [];
  spawnInterval: number = 3000; // Spawn every 3 seconds
  lastSpawnTime: number = 0;
  maxPickups: number = 10;
  arenaBounds: { width: number; height: number };

  constructor(arenaBounds: { width: number; height: number }) {
    this.arenaBounds = arenaBounds;
  }

  /**
   * Update spawner and spawn new pickups if needed
   */
  update(deltaTime: number): Pickup[] {
    this.lastSpawnTime += deltaTime;

    const newPickups: Pickup[] = [];

    if (this.lastSpawnTime >= this.spawnInterval && this.pickups.length < this.maxPickups) {
      const x = Math.random() * (this.arenaBounds.width - 100) + 50;
      const y = Math.random() * (this.arenaBounds.height - 100) + 50;

      const newPickup = PickupFactory.createRandomPickup(x, y);
      this.pickups.push(newPickup);
      newPickups.push(newPickup);

      this.lastSpawnTime = 0;
    }

    // Remove collected pickups
    this.pickups = this.pickups.filter((p) => !p.isCollected);

    return newPickups;
  }

  /**
   * Check collisions with character
   */
  checkCollisions(charX: number, charY: number, charRadius: number = 20): Pickup[] {
    const collectedPickups: Pickup[] = [];

    for (const pickup of this.pickups) {
      if (pickup.checkCollision(charX, charY, charRadius)) {
        pickup.collect();
        collectedPickups.push(pickup);
      }
    }

    return collectedPickups;
  }

  /**
   * Get all active pickups
   */
  getActivePickups(): Pickup[] {
    return this.pickups.filter((p) => !p.isCollected);
  }

  /**
   * Clear all pickups
   */
  clear(): void {
    this.pickups = [];
  }

  /**
   * Serialize spawner state
   */
  serialize() {
    return {
      pickups: this.pickups.map((p) => p.serialize()),
      spawnInterval: this.spawnInterval,
      maxPickups: this.maxPickups,
      arenaBounds: this.arenaBounds,
    };
  }
}
