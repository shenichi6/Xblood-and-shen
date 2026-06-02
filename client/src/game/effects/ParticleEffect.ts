/**
 * Particle Effect System
 * Handles visual effects and animations
 */

export type ParticleType = "damage" | "heal" | "fire" | "ice" | "lightning" | "speed" | "stun";

export interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  life: number; // remaining lifetime in ms
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}

export class ParticleEffect {
  particles: Particle[] = [];
  nextId: number = 0;

  /**
   * Create damage effect
   */
  createDamageEffect(x: number, y: number, damage: number): void {
    const particleCount = Math.min(damage / 10, 15);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 100 + Math.random() * 150;

      this.particles.push({
        id: `particle_${this.nextId++}`,
        type: "damage",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 800,
        maxLife: 800,
        size: 8 + Math.random() * 4,
        color: "#FF4444",
        opacity: 1,
      });
    }
  }

  /**
   * Create heal effect
   */
  createHealEffect(x: number, y: number, healing: number): void {
    const particleCount = Math.min(healing / 15, 12);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 80 + Math.random() * 120;

      this.particles.push({
        id: `particle_${this.nextId++}`,
        type: "heal",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1000,
        maxLife: 1000,
        size: 6 + Math.random() * 3,
        color: "#44FF44",
        opacity: 1,
      });
    }
  }

  /**
   * Create fire effect
   */
  createFireEffect(x: number, y: number, intensity: number = 1): void {
    const particleCount = Math.ceil(5 * intensity);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;

      this.particles.push({
        id: `particle_${this.nextId++}`,
        type: "fire",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        life: 600,
        maxLife: 600,
        size: 10 + Math.random() * 8,
        color: `hsl(${20 + Math.random() * 20}, 100%, 50%)`,
        opacity: 1,
      });
    }
  }

  /**
   * Create ice effect
   */
  createIceEffect(x: number, y: number): void {
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 120 + Math.random() * 80;

      this.particles.push({
        id: `particle_${this.nextId++}`,
        type: "ice",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 700,
        maxLife: 700,
        size: 6 + Math.random() * 4,
        color: "#44CCFF",
        opacity: 0.9,
      });
    }
  }

  /**
   * Create lightning effect
   */
  createLightningEffect(x: number, y: number): void {
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 200 + Math.random() * 100;

      this.particles.push({
        id: `particle_${this.nextId++}`,
        type: "lightning",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 500,
        maxLife: 500,
        size: 4 + Math.random() * 2,
        color: "#FFFF44",
        opacity: 1,
      });
    }
  }

  /**
   * Create speed boost effect
   */
  createSpeedBoostEffect(x: number, y: number): void {
    const particleCount = 10;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 150 + Math.random() * 100;

      this.particles.push({
        id: `particle_${this.nextId++}`,
        type: "speed",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 600,
        maxLife: 600,
        size: 5 + Math.random() * 3,
        color: "#FF44FF",
        opacity: 0.8,
      });
    }
  }

  /**
   * Create stun effect
   */
  createStunEffect(x: number, y: number): void {
    const particleCount = 6;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 100 + Math.random() * 80;

      this.particles.push({
        id: `particle_${this.nextId++}`,
        type: "stun",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 800,
        maxLife: 800,
        size: 7 + Math.random() * 3,
        color: "#FFAA00",
        opacity: 1,
      });
    }
  }

  /**
   * Update all particles
   */
  update(deltaTime: number): void {
    this.particles = this.particles
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx * (deltaTime / 1000),
        y: particle.y + particle.vy * (deltaTime / 1000),
        vy: particle.vy + 100 * (deltaTime / 1000), // gravity
        life: particle.life - deltaTime,
        opacity: (particle.life / particle.maxLife) * 0.8, // fade out
      }))
      .filter((particle) => particle.life > 0);
  }

  /**
   * Get all active particles
   */
  getActiveParticles(): Particle[] {
    return this.particles;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Serialize particles for transmission
   */
  serialize() {
    return {
      particles: this.particles.map((p) => ({
        id: p.id,
        type: p.type,
        x: p.x,
        y: p.y,
        size: p.size,
        color: p.color,
        opacity: p.opacity,
      })),
    };
  }
}

/**
 * Animation system for character and spell animations
 */
export class AnimationSystem {
  animations: Map<string, Animation> = new Map();

  /**
   * Create character idle animation
   */
  static createIdleAnimation(): Animation {
    return new Animation("idle", 600, true, [
      { frame: 0, duration: 150 },
      { frame: 1, duration: 150 },
      { frame: 2, duration: 150 },
      { frame: 3, duration: 150 },
    ]);
  }

  /**
   * Create character walk animation
   */
  static createWalkAnimation(): Animation {
    return new Animation("walk", 400, true, [
      { frame: 0, duration: 100 },
      { frame: 1, duration: 100 },
      { frame: 2, duration: 100 },
      { frame: 3, duration: 100 },
    ]);
  }

  /**
   * Create spell cast animation
   */
  static createCastAnimation(): Animation {
    return new Animation("cast", 500, false, [
      { frame: 0, duration: 100 },
      { frame: 1, duration: 150 },
      { frame: 2, duration: 150 },
      { frame: 3, duration: 100 },
    ]);
  }

  /**
   * Create damage animation
   */
  static createDamageAnimation(): Animation {
    return new Animation("damage", 200, false, [
      { frame: 0, duration: 100 },
      { frame: 1, duration: 100 },
    ]);
  }
}

export interface AnimationFrame {
  frame: number;
  duration: number;
}

export class Animation {
  name: string;
  duration: number;
  isLooping: boolean;
  frames: AnimationFrame[];
  currentFrameIndex: number = 0;
  elapsedTime: number = 0;
  isPlaying: boolean = true;

  constructor(
    name: string,
    duration: number,
    isLooping: boolean,
    frames: AnimationFrame[]
  ) {
    this.name = name;
    this.duration = duration;
    this.isLooping = isLooping;
    this.frames = frames;
  }

  /**
   * Update animation
   */
  update(deltaTime: number): void {
    if (!this.isPlaying) return;

    this.elapsedTime += deltaTime;

    // Get current frame
    let timeAccumulated = 0;
    for (let i = 0; i < this.frames.length; i++) {
      timeAccumulated += this.frames[i]!.duration;
      if (this.elapsedTime <= timeAccumulated) {
        this.currentFrameIndex = i;
        return;
      }
    }

    // Animation finished
    if (this.isLooping) {
      this.elapsedTime = 0;
      this.currentFrameIndex = 0;
    } else {
      this.isPlaying = false;
    }
  }

  /**
   * Get current frame
   */
  getCurrentFrame(): number {
    return this.frames[this.currentFrameIndex]?.frame || 0;
  }

  /**
   * Reset animation
   */
  reset(): void {
    this.currentFrameIndex = 0;
    this.elapsedTime = 0;
    this.isPlaying = true;
  }

  /**
   * Stop animation
   */
  stop(): void {
    this.isPlaying = false;
  }
}
