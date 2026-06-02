# Arcane Clash Game Data API Documentation

This document describes the database schema and tRPC API endpoints for managing game data in Arcane Clash. Both developers can use these endpoints to access character appearances, spells, arenas, and pickups.

## Database Schema Overview

### Character Appearances (`character_appearances`)
Stores visual properties for each character type. Shared across all players.

**Fields:**
- `id` (int): Primary key
- `characterType` (enum): "tank" | "mage" | "rogue"
- `name` (varchar): Display name (e.g., "Fire Tank", "Frost Mage")
- `description` (text): Character description
- `primaryColor` (varchar): Hex color code
- `secondaryColor` (varchar): Hex color code
- `accentColor` (varchar): Hex color code
- `spriteUrl` (varchar): URL to sprite image
- `iconUrl` (varchar): URL to character icon
- `animationFrames` (int): Number of animation frames
- `animationSpeed` (decimal): Animation speed multiplier
- `particleEffectType` (varchar): e.g., "fire", "ice", "shadow"
- `glowIntensity` (decimal): Visual glow effect intensity
- `isActive` (boolean): Whether this appearance is active
- `createdAt` (timestamp): Creation timestamp
- `updatedAt` (timestamp): Last update timestamp

### Character Stats (`character_stats`)
Stores base stats for each character type. Used for game balance.

**Fields:**
- `id` (int): Primary key
- `characterType` (enum): "tank" | "mage" | "rogue" (unique)
- `maxHp` (int): Maximum health points
- `speed` (int): Movement speed
- `attackPower` (int): Physical attack damage
- `defense` (int): Damage reduction
- `spellPower` (int): Magical damage multiplier
- `cooldownReduction` (decimal): Cooldown reduction percentage
- `createdAt` (timestamp): Creation timestamp
- `updatedAt` (timestamp): Last update timestamp

### Spells (`spells`)
Stores spell definitions used by characters.

**Fields:**
- `id` (int): Primary key
- `name` (varchar): Spell name
- `description` (text): Spell description
- `cooldown` (decimal): Cooldown in seconds
- `castTime` (decimal): Cast time in seconds
- `range` (int): Range in pixels
- `manaCost` (int): Mana cost (optional)
- `effects` (json): Array of spell effects
  ```json
  [
    {
      "type": "damage|heal|knockback|freeze|burn|stun|speed_boost",
      "value": 50,
      "duration": 3000
    }
  ]
  ```
- `animationName` (varchar): Animation identifier
- `soundEffectUrl` (varchar): URL to sound effect
- `particleEffectType` (varchar): Particle effect type
- `isActive` (boolean): Whether spell is active
- `createdAt` (timestamp): Creation timestamp
- `updatedAt` (timestamp): Last update timestamp

### Character Spell Mappings (`character_spell_mappings`)
Links spells to specific character types.

**Fields:**
- `id` (int): Primary key
- `characterType` (enum): "tank" | "mage" | "rogue"
- `spellId` (int): Reference to spells table
- `slotIndex` (int): Spell slot (0-5 for 6 slots)
- `createdAt` (timestamp): Creation timestamp

### Arenas (`arenas`)
Stores arena configurations and layouts.

**Fields:**
- `id` (int): Primary key
- `name` (varchar): Arena name
- `description` (text): Arena description
- `width` (int): Arena width in pixels
- `height` (int): Arena height in pixels
- `safeZoneRadius` (int): Fire ring safe zone radius
- `fireRingDamage` (int): Damage per tick from fire ring
- `fireRingShrinkSpeed` (decimal): How fast fire ring shrinks
- `obstacles` (json): Array of obstacles
  ```json
  [
    {
      "id": "obstacle_1",
      "x": 100,
      "y": 200,
      "width": 50,
      "height": 50,
      "type": "wall|pillar|destructible",
      "health": 100
    }
  ]
  ```
- `backgroundUrl` (varchar): URL to background image
- `theme` (varchar): Theme name (e.g., "volcanic", "frozen", "dark_forest")
- `isActive` (boolean): Whether arena is active
- `createdAt` (timestamp): Creation timestamp
- `updatedAt` (timestamp): Last update timestamp

### Pickup Definitions (`pickup_definitions`)
Stores properties for items that spawn in the arena.

**Fields:**
- `id` (int): Primary key
- `type` (enum): "health_potion" | "mana_potion" | "spell_powerup" | "speed_boost"
- `name` (varchar): Display name
- `description` (text): Description
- `value` (int): Amount healed/restored/boosted
- `duration` (int): Duration in milliseconds (for temporary buffs)
- `iconUrl` (varchar): URL to pickup icon
- `particleColor` (varchar): Hex color for particles
- `spawnWeight` (decimal): Probability weight for spawning
- `isActive` (boolean): Whether pickup is active
- `createdAt` (timestamp): Creation timestamp
- `updatedAt` (timestamp): Last update timestamp

### Game Sessions (`game_sessions`)
Tracks active and completed games.

**Fields:**
- `id` (int): Primary key
- `sessionId` (varchar): Unique session identifier
- `player1Id` (varchar): Player 1 ID
- `player2Id` (varchar): Player 2 ID (optional)
- `status` (enum): "waiting" | "active" | "completed" | "abandoned"
- `winnerId` (varchar): ID of winning player
- `player1CharacterType` (enum): Character type chosen
- `player2CharacterType` (enum): Character type chosen
- `arenaId` (int): Arena used in game
- `duration` (int): Game duration in milliseconds
- `player1FinalHp` (int): Final HP of player 1
- `player2FinalHp` (int): Final HP of player 2
- `createdAt` (timestamp): Game creation timestamp
- `completedAt` (timestamp): Game completion timestamp

## tRPC API Endpoints

All endpoints are accessible via `trpc.game.*` in the frontend.

### Character Queries

#### `getCharacterAppearance(characterType)`
Get appearance data for a specific character type.

**Input:** `"tank" | "mage" | "rogue"`

**Output:** `CharacterAppearance | null`

**Example:**
```typescript
const appearance = await trpc.game.getCharacterAppearance.query("tank");
```

#### `getAllCharacterAppearances()`
Get all character appearances.

**Output:** `CharacterAppearance[]`

#### `getCharacterStats(characterType)`
Get stats for a specific character type.

**Input:** `"tank" | "mage" | "rogue"`

**Output:** `CharacterStats | null`

#### `getAllCharacterStats()`
Get all character stats.

**Output:** `CharacterStats[]`

### Spell Queries

#### `getSpell(spellId)`
Get a specific spell by ID.

**Input:** `number`

**Output:** `Spell | null`

#### `getAllSpells()`
Get all spells.

**Output:** `Spell[]`

#### `getSpellsByCharacterType(characterType)`
Get spells for a specific character type.

**Input:** `"tank" | "mage" | "rogue"`

**Output:** `Spell[]`

### Arena Queries

#### `getArena(arenaId)`
Get a specific arena by ID.

**Input:** `number`

**Output:** `Arena | null`

#### `getAllArenas()`
Get all arenas.

**Output:** `Arena[]`

#### `getDefaultArena()`
Get the default arena (first one).

**Output:** `Arena | null`

### Pickup Queries

#### `getPickupDefinition(pickupType)`
Get a specific pickup definition.

**Input:** `string` (e.g., "health_potion")

**Output:** `PickupDefinition | null`

#### `getAllPickupDefinitions()`
Get all pickup definitions.

**Output:** `PickupDefinition[]`

### Game Session Mutations

#### `createGameSession(input)`
Create a new game session.

**Input:**
```typescript
{
  sessionId: string;
  player1Id: string;
  player1CharacterType: "tank" | "mage" | "rogue";
  arenaId: number;
}
```

**Output:** Mutation result

#### `getGameSession(sessionId)`
Get a game session by ID.

**Input:** `string`

**Output:** `GameSession | null`

#### `updateGameSessionStatus(input)`
Update game session status.

**Input:**
```typescript
{
  sessionId: string;
  status: "waiting" | "active" | "completed" | "abandoned";
}
```

#### `completeGameSession(input)`
Complete a game session with results.

**Input:**
```typescript
{
  sessionId: string;
  winnerId: string;
  player1FinalHp: number;
  player2FinalHp: number;
  duration: number;
}
```

#### `getPlayerGameHistory(input)`
Get game history for a player.

**Input:**
```typescript
{
  playerId: string;
  limit?: number; // default 10
}
```

**Output:** `GameSession[]`

## Usage Examples

### Frontend Usage (React)

```typescript
import { trpc } from "@/lib/trpc";

// Get all character appearances
const { data: appearances } = trpc.game.getAllCharacterAppearances.useQuery();

// Get spells for a character
const { data: spells } = trpc.game.getSpellsByCharacterType.useQuery("tank");

// Create a game session
const createSession = trpc.game.createGameSession.useMutation();
await createSession.mutateAsync({
  sessionId: "session_123",
  player1Id: "player_1",
  player1CharacterType: "mage",
  arenaId: 1,
});

// Complete a game
const completeGame = trpc.game.completeGameSession.useMutation();
await completeGame.mutateAsync({
  sessionId: "session_123",
  winnerId: "player_1",
  player1FinalHp: 45,
  player2FinalHp: 0,
  duration: 180000,
});
```

### Backend Usage (Server)

```typescript
import { getCharacterStats, getAllSpells } from "./gameDb";

// Get character stats
const tankStats = await getCharacterStats("tank");

// Get all spells
const allSpells = await getAllSpells();
```

## Shared Types

All types are defined in `@shared/gameTypes.ts` and are automatically typed in tRPC queries.

## Notes for Both Developers

1. **Database Migrations:** Run `pnpm db:push` after schema changes to apply migrations.
2. **Type Safety:** All queries are fully typed. TypeScript will catch errors at compile time.
3. **Shared Access:** Both developers can access the same data through these APIs.
4. **Real-time Sync:** For multiplayer synchronization, consider implementing WebSocket connections or polling.
5. **Performance:** Use query caching and limit results when fetching large datasets.

## Next Steps

1. Seed the database with initial character appearances, stats, spells, and arenas.
2. Implement the Phaser 3 game scene to consume these APIs.
3. Add WebSocket support for real-time multiplayer synchronization.
4. Implement matchmaking and player session management.
