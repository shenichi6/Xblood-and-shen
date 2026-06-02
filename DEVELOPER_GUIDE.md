# Arcane Clash - Developer 2 Integration Guide

Welcome! This guide explains the systems I've built for Arcane Clash and how Developer 1 should integrate them with the core Phaser engine.

## Project Structure

```
client/src/game/
├── characters/          # Character system
│   ├── CharacterBase.ts # Abstract base class
│   ├── Tank.ts          # Tank character
│   ├── Mage.ts          # Mage character
│   ├── Rogue.ts         # Rogue character
│   ├── CharacterFactory.ts
│   └── CharacterBase.test.ts (33 tests)
├── spells/              # Spell system
│   ├── Spell.ts         # Spell class
│   ├── SpellCaster.ts   # Spell casting logic
│   └── Spell.test.ts (28 tests)
├── arena/               # Arena system
│   ├── Arena.ts         # Arena with fire ring
│   └── Arena.test.ts (32 tests)
├── pickups/             # Pickup system
│   ├── Pickup.ts        # Pickups and spawner
│   └── Pickup.test.ts (33 tests)
├── effects/             # Visual effects
│   └── ParticleEffect.ts # Particles and animations
└── GameState.ts         # Game state manager

server/
├── gameDb.ts            # Database query helpers
├── gameRouter.ts        # tRPC API endpoints
└── routers.ts           # Main router (includes gameRouter)

drizzle/
├── schema.ts            # Database schema
└── migrations/          # Database migrations

shared/
└── gameTypes.ts         # Shared TypeScript types
```

## Key Systems

### 1. Character System

**Classes:**
- `CharacterBase` - Abstract base with core mechanics
- `Tank` - High HP, defense, low speed
- `Mage` - Low HP, high spell power, mana-based
- `Rogue` - High speed, attack power, energy-based

**Key Methods:**
```typescript
// Damage and healing
character.takeDamage(amount: number): void
character.heal(amount: number): void

// Status effects
character.applyEffect(effect: StatusEffect): void
character.removeEffect(effectType: string): void

// Spell cooldowns
character.startSpellCooldown(spellId: string, duration: number): void
character.isSpellOnCooldown(spellId: string): boolean
character.getSpellCooldownRemaining(spellId: string): number

// Movement
character.applyKnockback(vx: number, vy: number): void
character.update(deltaTime: number): void
```

**Integration Points:**
- Call `character.update(deltaTime)` every frame
- Update `character.position` based on input
- Check `character.isAlive` to determine if player is still in game

### 2. Spell System

**Classes:**
- `Spell` - Represents a spell with effects
- `SpellFactory` - Creates predefined spells
- `SpellCaster` - Handles spell casting and validation

**Available Spells:**
1. **Fireball** - 60 damage, 200 knockback, burn effect
2. **Frost Bolt** - 45 damage, freeze effect
3. **Heal** - 80 healing
4. **Lightning Strike** - 75 damage, stun effect
5. **Dash** - Speed boost, knockback
6. **Meteor** - 120 damage, 300 knockback, burn

**Usage:**
```typescript
import { SpellFactory, SpellCaster } from "./spells";

// Get spells for character type
const spells = SpellFactory.getSpellsByCharacterType("mage");

// Cast spell on target
const result = SpellCaster.castSpellOnTarget(caster, spell, target);
if (result.success) {
  console.log(`Damage: ${result.damage}, Healing: ${result.healing}`);
}

// Check if spell can be cast
const validation = SpellCaster.canCastSpell(caster, spell);
if (!validation.canCast) {
  console.log(validation.reason);
}
```

**Integration Points:**
- Listen for player input (mouse click, key press)
- Validate target is in range and spell can be cast
- Call `SpellCaster.castSpellOnTarget()` to execute
- Create visual effects via `ParticleEffect`

### 3. Arena System

**Classes:**
- `Arena` - Manages arena layout and hazards
- `ArenaFactory` - Creates predefined arenas

**Available Arenas:**
1. **Volcanic Arena** - 15 damage/sec, 0.5 shrink speed
2. **Frozen Arena** - 12 damage/sec, 0.4 shrink speed
3. **Dark Forest** - 10 damage/sec, 0.3 shrink speed

**Key Methods:**
```typescript
// Check safe zone
arena.isInSafeZone(x: number, y: number): boolean

// Fire ring damage
arena.updateFireRing(deltaTime: number): void
arena.shouldTakeFireRingDamage(): boolean
arena.getFireRingDamage(): number

// Obstacles
arena.checkObstacleCollision(x: number, y: number, radius: number): Obstacle | null
arena.damageObstacle(obstacleId: string, damage: number): boolean

// Bounds
arena.clampPosition(x: number, y: number, radius: number): {x, y}
```

**Integration Points:**
- Call `arena.updateFireRing(deltaTime)` every frame
- Check `arena.isInSafeZone()` for each player
- Apply fire ring damage if outside safe zone
- Handle obstacle collisions and push players away

### 4. Pickup System

**Classes:**
- `Pickup` - Individual pickup item
- `PickupFactory` - Creates pickups
- `PickupSpawner` - Manages spawning and collection

**Pickup Types:**
- **Health Potion** - Restores 50 HP
- **Mana Potion** - Restores 40 mana
- **Spell Powerup** - 25% spell power for 10 seconds
- **Speed Boost** - 50% speed for 8 seconds

**Usage:**
```typescript
import { PickupSpawner } from "./pickups";

const spawner = new PickupSpawner({ width: 900, height: 600 });

// Update spawner each frame
const newPickups = spawner.update(deltaTime);

// Check collisions
const collectedPickups = spawner.checkCollisions(playerX, playerY, 20);
for (const pickup of collectedPickups) {
  applyPickupEffect(player, pickup);
}

// Get active pickups for rendering
const activePickups = spawner.getActivePickups();
```

**Integration Points:**
- Call `spawner.update(deltaTime)` every frame
- Check collisions with `spawner.checkCollisions()`
- Apply effects based on pickup type
- Render pickups from `spawner.getActivePickups()`

### 5. Visual Effects System

**Classes:**
- `ParticleEffect` - Manages particle effects
- `Animation` - Individual animation
- `AnimationSystem` - Creates predefined animations

**Effect Types:**
- `createDamageEffect()` - Red particles
- `createHealEffect()` - Green particles
- `createFireEffect()` - Fire particles
- `createIceEffect()` - Ice particles
- `createLightningEffect()` - Yellow particles
- `createSpeedBoostEffect()` - Purple particles
- `createStunEffect()` - Orange particles

**Animation Types:**
- `createIdleAnimation()` - Character idle
- `createWalkAnimation()` - Character walking
- `createCastAnimation()` - Spell casting
- `createDamageAnimation()` - Taking damage

**Usage:**
```typescript
import { ParticleEffect, AnimationSystem } from "./effects";

const particles = new ParticleEffect();

// Create effects
particles.createDamageEffect(x, y, damage);
particles.createHealEffect(x, y, healing);

// Update particles
particles.update(deltaTime);

// Get particles for rendering
const activeParticles = particles.getActiveParticles();

// Create animations
const idleAnim = AnimationSystem.createIdleAnimation();
idleAnim.update(deltaTime);
const currentFrame = idleAnim.getCurrentFrame();
```

### 6. Game State Manager

**Class:**
- `GameState` - Manages overall game state

**Key Methods:**
```typescript
// Game control
gameState.startGame(): void
gameState.pauseGame(): void
gameState.resumeGame(): void
gameState.endGame(): void

// Player management
gameState.addPlayer(player: CharacterBase): void
gameState.removePlayer(playerId: string): void
gameState.getPlayer(playerId: string): CharacterBase | undefined

// Game loop
gameState.update(deltaTime: number): void

// Status
gameState.getAlivePlayersCount(): number
gameState.getRemainingTime(): number
gameState.getGameProgress(): number
```

**Integration Points:**
- Create `GameState` with arena
- Call `gameState.update(deltaTime)` every frame
- Add players with `gameState.addPlayer()`
- Check game status and remaining time

## Database Integration

### Schema Overview

**Tables:**
- `users` - Player accounts
- `characters` - Character definitions
- `character_appearances` - Visual customization
- `spells` - Spell definitions
- `character_spells` - Character-spell mappings
- `arenas` - Arena definitions
- `game_sessions` - Active game sessions
- `game_events` - Game events log

### API Endpoints

**tRPC Endpoints:**
```typescript
// Get all characters
trpc.game.characters.getAll.useQuery()

// Get character by ID
trpc.game.characters.getById.useQuery({ id })

// Get spells for character
trpc.game.spells.getByCharacter.useQuery({ characterId })

// Get arena by ID
trpc.game.arenas.getById.useQuery({ id })

// Create game session
trpc.game.sessions.create.useMutation()

// Update game session
trpc.game.sessions.update.useMutation()

// Log game event
trpc.game.events.log.useMutation()
```

## Testing

**Test Files:**
- `CharacterBase.test.ts` - 33 tests
- `Spell.test.ts` - 28 tests
- `Arena.test.ts` - 32 tests
- `Pickup.test.ts` - 33 tests

**Run Tests:**
```bash
pnpm test
```

**Test Coverage:**
- Character mechanics (damage, healing, effects)
- Spell casting and validation
- Arena hazards and obstacles
- Pickup spawning and collection

## Integration Checklist

- [ ] Import character classes in Phaser scene
- [ ] Create Phaser sprites for characters
- [ ] Implement WASD movement input
- [ ] Implement mouse click for spell targeting
- [ ] Create Phaser graphics for spells and effects
- [ ] Integrate particle effects with Phaser
- [ ] Create Phaser graphics for arena and obstacles
- [ ] Render pickups on screen
- [ ] Implement game loop with `gameState.update()`
- [ ] Handle fire ring damage and visual feedback
- [ ] Implement multiplayer state synchronization
- [ ] Test with 2+ players

## Performance Tips

1. **Reuse Objects** - Don't create new objects every frame
2. **Object Pooling** - Pool particles and effects
3. **Spatial Partitioning** - Use quadtree for collision detection
4. **Lazy Loading** - Load assets on demand
5. **Profile** - Use Phaser's built-in profiler

## Common Integration Patterns

### Player Input
```typescript
// WASD movement
if (input.isDown('W')) character.position.y -= character.stats.speed * dt;
if (input.isDown('A')) character.position.x -= character.stats.speed * dt;
if (input.isDown('S')) character.position.y += character.stats.speed * dt;
if (input.isDown('D')) character.position.x += character.stats.speed * dt;

// Spell casting
input.on('pointerdown', (pointer) => {
  const result = SpellCaster.castSpellOnTarget(player, spell, target);
  if (result.success) {
    particles.createDamageEffect(target.position.x, target.position.y, result.damage);
  }
});
```

### Game Loop
```typescript
scene.update = (time, delta) => {
  gameState.update(delta);
  particles.update(delta);
  
  // Render all entities
  for (const player of gameState.players) {
    sprite.x = player.position.x;
    sprite.y = player.position.y;
  }
};
```

### Collision Handling
```typescript
// Check arena bounds
const clamped = arena.clampPosition(player.position.x, player.position.y);
player.position.x = clamped.x;
player.position.y = clamped.y;

// Check obstacle collision
const obstacle = arena.checkObstacleCollision(player.position.x, player.position.y);
if (obstacle) {
  // Push player away
}

// Check pickup collision
const pickups = spawner.checkCollisions(player.position.x, player.position.y);
for (const pickup of pickups) {
  applyPickupEffect(player, pickup);
}
```

## Troubleshooting

**Issue: Character not taking damage**
- Ensure `character.takeDamage()` is called
- Check defense mitigation: `damage - defense`

**Issue: Spell not casting**
- Verify mana/energy cost
- Check cooldown status
- Validate target is in range

**Issue: Fire ring not damaging**
- Call `arena.updateFireRing(deltaTime)` every frame
- Check `arena.isInSafeZone()` before applying damage
- Verify `arena.shouldTakeFireRingDamage()` returns true

**Issue: Pickups not spawning**
- Call `spawner.update(deltaTime)` every frame
- Check `spawner.maxPickups` limit
- Verify spawn interval has elapsed

## Next Steps

1. Set up Phaser scene with game canvas
2. Create sprite graphics for characters, spells, and effects
3. Implement input handling (WASD, mouse)
4. Integrate game loop with `gameState.update()`
5. Test with 2 players in local multiplayer
6. Implement network synchronization for online play
7. Add UI for health, mana, cooldowns, and game status
8. Polish animations and visual effects

## Questions?

Refer to the test files for usage examples and expected behavior. All systems are fully tested and documented.

Good luck with the integration!
