/**
 * Arena Class
 * Manages arena layout, obstacles, and hazards (fire ring)
 */

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "wall" | "pillar" | "destructible";
  health?: number;
  maxHealth?: number;
}

export class Arena {
  id: number;
  name: string;
  description: string;
  width: number;
  height: number;
  safeZoneRadius: number;
  fireRingDamage: number;
  fireRingShrinkSpeed: number;
  obstacles: Obstacle[];
  backgroundUrl?: string;
  theme: string;
  isActive: boolean;

  // Fire ring state
  currentRadius: number;
  fireRingDamageTimer: number = 0;
  fireRingDamageInterval: number = 1000; // Damage every 1 second

  // Center of arena
  centerX: number;
  centerY: number;

  constructor(
    id: number,
    name: string,
    description: string,
    width: number,
    height: number,
    safeZoneRadius: number,
    fireRingDamage: number,
    fireRingShrinkSpeed: number,
    obstacles: Obstacle[] = [],
    backgroundUrl?: string,
    theme: string = "default"
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.width = width;
    this.height = height;
    this.safeZoneRadius = safeZoneRadius;
    this.fireRingDamage = fireRingDamage;
    this.fireRingShrinkSpeed = fireRingShrinkSpeed;
    this.obstacles = obstacles;
    this.backgroundUrl = backgroundUrl;
    this.theme = theme;
    this.isActive = true;

    // Initialize arena center
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.currentRadius = safeZoneRadius;
  }

  /**
   * Check if a position is within the safe zone
   */
  isInSafeZone(x: number, y: number): boolean {
    const distance = Math.sqrt(
      Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2)
    );
    return distance <= this.currentRadius;
  }

  /**
   * Get distance from center
   */
  getDistanceFromCenter(x: number, y: number): number {
    return Math.sqrt(
      Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2)
    );
  }

  /**
   * Check collision with obstacles
   */
  checkObstacleCollision(x: number, y: number, radius: number = 20): Obstacle | null {
    for (const obstacle of this.obstacles) {
      if (
        x + radius > obstacle.x &&
        x - radius < obstacle.x + obstacle.width &&
        y + radius > obstacle.y &&
        y - radius < obstacle.y + obstacle.height
      ) {
        return obstacle;
      }
    }
    return null;
  }

  /**
   * Get all obstacles in a radius
   */
  getObstaclesInRadius(x: number, y: number, radius: number): Obstacle[] {
    return this.obstacles.filter((obstacle) => {
      const obstacleDistance = Math.sqrt(
        Math.pow(x - (obstacle.x + obstacle.width / 2), 2) +
          Math.pow(y - (obstacle.y + obstacle.height / 2), 2)
      );
      return obstacleDistance <= radius;
    });
  }

  /**
   * Damage a destructible obstacle
   */
  damageObstacle(obstacleId: string, damage: number): boolean {
    const obstacle = this.obstacles.find((o) => o.id === obstacleId);
    if (!obstacle || obstacle.type !== "destructible" || !obstacle.health) {
      return false;
    }

    obstacle.health -= damage;
    if (obstacle.health <= 0) {
      this.removeObstacle(obstacleId);
      return true; // Obstacle destroyed
    }
    return false;
  }

  /**
   * Remove an obstacle
   */
  removeObstacle(obstacleId: string): void {
    this.obstacles = this.obstacles.filter((o) => o.id !== obstacleId);
  }

  /**
   * Update fire ring (shrink over time)
   */
  updateFireRing(deltaTime: number): void {
    // Shrink the safe zone
    this.currentRadius = Math.max(
      50, // Minimum radius
      this.currentRadius - (this.fireRingShrinkSpeed * deltaTime) / 1000
    );

    // Update fire ring damage timer
    this.fireRingDamageTimer += deltaTime;
  }

  /**
   * Check if character should take fire ring damage
   */
  shouldTakeFireRingDamage(): boolean {
    if (this.fireRingDamageTimer >= this.fireRingDamageInterval) {
      this.fireRingDamageTimer = 0;
      return true;
    }
    return false;
  }

  /**
   * Get fire ring damage amount
   */
  getFireRingDamage(): number {
    return this.fireRingDamage;
  }

  /**
   * Reset fire ring damage timer
   */
  resetFireRingDamageTimer(): void {
    this.fireRingDamageTimer = 0;
  }

  /**
   * Get arena bounds
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Clamp position to arena bounds
   */
  clampPosition(x: number, y: number, radius: number = 20): { x: number; y: number } {
    return {
      x: Math.max(radius, Math.min(this.width - radius, x)),
      y: Math.max(radius, Math.min(this.height - radius, y)),
    };
  }

  /**
   * Serialize arena data
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      width: this.width,
      height: this.height,
      safeZoneRadius: this.safeZoneRadius,
      fireRingDamage: this.fireRingDamage,
      fireRingShrinkSpeed: this.fireRingShrinkSpeed,
      obstacles: this.obstacles,
      backgroundUrl: this.backgroundUrl,
      theme: this.theme,
      isActive: this.isActive,
      currentRadius: this.currentRadius,
      centerX: this.centerX,
      centerY: this.centerY,
    };
  }
}

/**
 * Arena Factory - Creates predefined arenas
 */
export class ArenaFactory {
  /**
   * Create Volcanic Arena
   */
  static createVolcanicArena(): Arena {
    const obstacles: Obstacle[] = [
      {
        id: "wall_1",
        x: 100,
        y: 100,
        width: 50,
        height: 200,
        type: "wall",
      },
      {
        id: "wall_2",
        x: 750,
        y: 100,
        width: 50,
        height: 200,
        type: "wall",
      },
      {
        id: "pillar_1",
        x: 400,
        y: 250,
        width: 40,
        height: 40,
        type: "pillar",
      },
      {
        id: "pillar_2",
        x: 450,
        y: 350,
        width: 40,
        height: 40,
        type: "pillar",
      },
      {
        id: "destructible_1",
        x: 300,
        y: 400,
        width: 60,
        height: 60,
        type: "destructible",
        health: 50,
        maxHealth: 50,
      },
    ];

    return new Arena(
      1,
      "Volcanic Arena",
      "A fiery volcanic battlefield with lava flows",
      900,
      600,
      200, // Safe zone radius
      15, // Fire ring damage
      0.5, // Fire ring shrink speed
      obstacles,
      undefined,
      "volcanic"
    );
  }

  /**
   * Create Frozen Arena
   */
  static createFrozenArena(): Arena {
    const obstacles: Obstacle[] = [
      {
        id: "ice_wall_1",
        x: 150,
        y: 200,
        width: 100,
        height: 30,
        type: "wall",
      },
      {
        id: "ice_wall_2",
        x: 650,
        y: 200,
        width: 100,
        height: 30,
        type: "wall",
      },
      {
        id: "ice_pillar_1",
        x: 420,
        y: 280,
        width: 60,
        height: 60,
        type: "pillar",
      },
      {
        id: "ice_destructible_1",
        x: 350,
        y: 450,
        width: 50,
        height: 50,
        type: "destructible",
        health: 40,
        maxHealth: 40,
      },
    ];

    return new Arena(
      2,
      "Frozen Arena",
      "A frozen tundra with icy obstacles",
      900,
      600,
      200,
      12,
      0.4,
      obstacles,
      undefined,
      "frozen"
    );
  }

  /**
   * Create Dark Forest Arena
   */
  static createDarkForestArena(): Arena {
    const obstacles: Obstacle[] = [
      {
        id: "tree_1",
        x: 200,
        y: 150,
        width: 40,
        height: 40,
        type: "pillar",
      },
      {
        id: "tree_2",
        x: 700,
        y: 150,
        width: 40,
        height: 40,
        type: "pillar",
      },
      {
        id: "tree_3",
        x: 300,
        y: 400,
        width: 40,
        height: 40,
        type: "pillar",
      },
      {
        id: "tree_4",
        x: 600,
        y: 400,
        width: 40,
        height: 40,
        type: "pillar",
      },
      {
        id: "log_1",
        x: 450,
        y: 280,
        width: 80,
        height: 30,
        type: "destructible",
        health: 60,
        maxHealth: 60,
      },
    ];

    return new Arena(
      3,
      "Dark Forest",
      "A mysterious dark forest with ancient trees",
      900,
      600,
      200,
      10,
      0.3,
      obstacles,
      undefined,
      "dark_forest"
    );
  }

  /**
   * Get all available arenas
   */
  static getAllArenas(): Arena[] {
    return [
      this.createVolcanicArena(),
      this.createFrozenArena(),
      this.createDarkForestArena(),
    ];
  }

  /**
   * Get arena by ID
   */
  static getArenaById(id: number): Arena | null {
    const arenas = this.getAllArenas();
    return arenas.find((a) => a.id === id) || null;
  }
}
