/**
 * Shared Game Types for Arcane Clash
 * Used across all game systems: Characters, Spells, Arena, Pickups
 */

// ============ CHARACTER TYPES ============
export type CharacterType = "tank" | "mage" | "rogue";

export interface CharacterStats {
  maxHp: number;
  hp: number;
  speed: number;
  attackPower: number;
  defense: number;
  spellPower: number;
  cooldownReduction: number;
}

export interface Character {
  id: string;
  type: CharacterType;
  name: string;
  stats: CharacterStats;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  isAlive: boolean;
  activeEffects: StatusEffect[];
  spellCooldowns: Map<string, number>;
}

// ============ SPELL TYPES ============
export type SpellEffectType = "damage" | "heal" | "knockback" | "freeze" | "burn" | "stun" | "speed_boost";

export interface SpellEffect {
  type: SpellEffectType;
  value: number;
  duration?: number; // For status effects like freeze/burn
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  manaCost?: number;
  castTime: number;
  range: number;
  effects: SpellEffect[];
  animation?: string;
  soundEffect?: string;
}

export interface CastSpellPayload {
  spellId: string;
  casterId: string;
  targetPosition: { x: number; y: number };
  targetCharacterId?: string;
}

// ============ STATUS EFFECTS ============
export interface StatusEffect {
  type: SpellEffectType;
  duration: number;
  remainingTime: number;
  value?: number;
}

// ============ ARENA TYPES ============
export interface ArenaConfig {
  width: number;
  height: number;
  safeZoneRadius: number;
  fireRingDamage: number;
  fireRingShrinkSpeed: number;
  obstacles: Obstacle[];
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "wall" | "pillar" | "destructible";
  health?: number; // For destructible obstacles
}

export interface FireRing {
  centerX: number;
  centerY: number;
  currentRadius: number;
  minRadius: number;
  shrinkRate: number;
}

// ============ PICKUP TYPES ============
export type PickupType = "health_potion" | "mana_potion" | "spell_powerup" | "speed_boost";

export interface Pickup {
  id: string;
  type: PickupType;
  position: { x: number; y: number };
  value: number;
  duration?: number; // For temporary buffs
  isActive: boolean;
}

// ============ GAME STATE TYPES ============
export interface GameState {
  players: Character[];
  spells: Spell[];
  pickups: Pickup[];
  arena: ArenaConfig;
  fireRing: FireRing;
  gameTime: number;
  isGameActive: boolean;
  winner?: string;
}

export interface GameEvent {
  type: "spell_cast" | "damage_dealt" | "heal" | "pickup_collected" | "player_eliminated" | "game_end";
  timestamp: number;
  data: any;
}

// ============ ANIMATION TYPES ============
export interface AnimationConfig {
  duration: number;
  easing?: string;
  loop?: boolean;
  delay?: number;
}

export interface VisualEffect {
  id: string;
  type: "particle" | "sprite" | "text";
  position: { x: number; y: number };
  duration: number;
  config: AnimationConfig;
}

// ============ NETWORK/SYNC TYPES ============
export interface PlayerInput {
  playerId: string;
  movement: { x: number; y: number };
  spellCast?: CastSpellPayload;
  timestamp: number;
}

export interface GameStateUpdate {
  players: Character[];
  pickups: Pickup[];
  fireRing: FireRing;
  events: GameEvent[];
  timestamp: number;
}
