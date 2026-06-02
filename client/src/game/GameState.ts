/**
 * Game State Manager
 * Manages overall game state, player updates, and fire ring damage
 */

import type { CharacterBase } from "./characters/CharacterBase";
import { Arena } from "./arena/Arena";
import { PickupSpawner, type Pickup } from "./pickups/Pickup";
import { ParticleEffect } from "./effects/ParticleEffect";

export type GameStatus = "waiting" | "playing" | "paused" | "finished";

export class GameState {
  status: GameStatus = "waiting";
  players: CharacterBase[] = [];
  arena: Arena;
  pickupSpawner: PickupSpawner;
  particleEffect: ParticleEffect;
  elapsedTime: number = 0;
  maxGameDuration: number = 300000; // 5 minutes
  lastFireRingDamageTime: number = 0;

  constructor(arena: Arena) {
    this.arena = arena;
    this.pickupSpawner = new PickupSpawner({
      width: arena.width,
      height: arena.height,
    });
    this.particleEffect = new ParticleEffect();
  }

  /**
   * Add player to game
   */
  addPlayer(player: CharacterBase): void {
    this.players.push(player);
  }

  /**
   * Remove player from game
   */
  removePlayer(playerId: string): void {
    this.players = this.players.filter((p) => p.id !== playerId);
  }

  /**
   * Get player by ID
   */
  getPlayer(playerId: string): CharacterBase | undefined {
    return this.players.find((p) => p.id === playerId);
  }

  /**
   * Start game
   */
  startGame(): void {
    this.status = "playing";
    this.elapsedTime = 0;
  }

  /**
   * Pause game
   */
  pauseGame(): void {
    this.status = "paused";
  }

  /**
   * Resume game
   */
  resumeGame(): void {
    this.status = "playing";
  }

  /**
   * End game
   */
  endGame(): void {
    this.status = "finished";
  }

  /**
   * Update game state
   */
  update(deltaTime: number): void {
    if (this.status !== "playing") return;

    this.elapsedTime += deltaTime;

    // Update arena (fire ring shrinking)
    this.arena.updateFireRing(deltaTime);

    // Update all players
    for (const player of this.players) {
      player.update(deltaTime);

      // Check if player is outside safe zone
      if (!this.arena.isInSafeZone(player.position.x, player.position.y)) {
        // Apply fire ring damage
        if (this.arena.shouldTakeFireRingDamage()) {
          const damage = this.arena.getFireRingDamage();
          player.takeDamage(damage);

          // Create fire effect
          this.particleEffect.createFireEffect(player.position.x, player.position.y);
        }
      } else {
        // Reset fire ring damage timer if in safe zone
        this.arena.resetFireRingDamageTimer();
      }

      // Check collision with obstacles
      const obstacle = this.arena.checkObstacleCollision(
        player.position.x,
        player.position.y,
        20
      );
      if (obstacle) {
        // Push player away from obstacle
        const angle = Math.atan2(
          player.position.y - (obstacle.y + obstacle.height / 2),
          player.position.x - (obstacle.x + obstacle.width / 2)
        );
        player.position.x = obstacle.x + obstacle.width / 2 + Math.cos(angle) * 40;
        player.position.y = obstacle.y + obstacle.height / 2 + Math.sin(angle) * 40;
      }

      // Check pickup collisions
      const collectedPickups = this.pickupSpawner.checkCollisions(
        player.position.x,
        player.position.y,
        20
      );

      for (const pickup of collectedPickups) {
        this.applyPickupEffect(player, pickup);
      }
    }

    // Update pickups
    this.pickupSpawner.update(deltaTime);

    // Update particle effects
    this.particleEffect.update(deltaTime);

    // Check game end conditions
    if (this.elapsedTime >= this.maxGameDuration) {
      this.endGame();
    }

    // Check if only one player remains alive
    const alivePlayers = this.players.filter((p) => p.isAlive);
    if (alivePlayers.length <= 1) {
      this.endGame();
    }
  }

  /**
   * Apply pickup effect to player
   */
  private applyPickupEffect(player: CharacterBase, pickup: Pickup): void {
    switch (pickup.type) {
      case "health_potion":
        player.heal(pickup.value);
        this.particleEffect.createHealEffect(
          player.position.x,
          player.position.y,
          pickup.value
        );
        break;

      case "mana_potion":
        if ((player as any).restoreMana) {
          (player as any).restoreMana(pickup.value);
        }
        this.particleEffect.createHealEffect(
          player.position.x,
          player.position.y,
          pickup.value
        );
        break;

      case "spell_powerup":
        // Increase spell power temporarily
        const originalSpellPower = player.stats.spellPower;
        player.stats.spellPower *= pickup.value;
        this.particleEffect.createSpeedBoostEffect(
          player.position.x,
          player.position.y
        );

        // Restore after duration
        if (pickup.duration) {
          setTimeout(() => {
            player.stats.spellPower = originalSpellPower;
          }, pickup.duration);
        }
        break;

      case "speed_boost":
        // Increase speed temporarily
        const originalSpeed = player.stats.speed;
        player.stats.speed *= pickup.value;
        this.particleEffect.createSpeedBoostEffect(
          player.position.x,
          player.position.y
        );

        // Restore after duration
        if (pickup.duration) {
          setTimeout(() => {
            player.stats.speed = originalSpeed;
          }, pickup.duration);
        }
        break;
    }
  }

  /**
   * Get game progress (0-1)
   */
  getGameProgress(): number {
    return Math.min(1, this.elapsedTime / this.maxGameDuration);
  }

  /**
   * Get remaining time in seconds
   */
  getRemainingTime(): number {
    return Math.max(0, (this.maxGameDuration - this.elapsedTime) / 1000);
  }

  /**
   * Get alive players count
   */
  getAlivePlayersCount(): number {
    return this.players.filter((p) => p.isAlive).length;
  }

  /**
   * Get dead players count
   */
  getDeadPlayersCount(): number {
    return this.players.filter((p) => !p.isAlive).length;
  }

  /**
   * Serialize game state for transmission
   */
  serialize() {
    return {
      status: this.status,
      elapsedTime: this.elapsedTime,
      players: this.players.map((p) => p.serialize?.() || p),
      arena: this.arena.serialize(),
      pickups: this.pickupSpawner.serialize(),
      particles: this.particleEffect.serialize(),
      remainingTime: this.getRemainingTime(),
      alivePlayersCount: this.getAlivePlayersCount(),
    };
  }
}
