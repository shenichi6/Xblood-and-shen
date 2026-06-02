import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============ CHARACTER APPEARANCE SCHEMA ============

/**
 * Character Appearance Table
 * Stores visual properties for each character type (Tank, Mage, Rogue)
 * Shared across all players in the game
 */
export const characterAppearances = mysqlTable("character_appearances", {
  id: int("id").autoincrement().primaryKey(),
  characterType: mysqlEnum("character_type", ["tank", "mage", "rogue"]).notNull(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Fire Tank", "Frost Mage"
  description: text("description"),
  
  // Visual Properties
  primaryColor: varchar("primary_color", { length: 7 }).notNull(), // Hex color
  secondaryColor: varchar("secondary_color", { length: 7 }).notNull(),
  accentColor: varchar("accent_color", { length: 7 }).notNull(),
  
  // Sprite/Model References
  spriteUrl: varchar("sprite_url", { length: 500 }),
  iconUrl: varchar("icon_url", { length: 500 }),
  
  // Animation Data
  animationFrames: int("animation_frames").default(4),
  animationSpeed: decimal("animation_speed", { precision: 3, scale: 2 }).default("1.0"),
  
  // Visual Effects
  particleEffectType: varchar("particle_effect_type", { length: 50 }), // e.g., "fire", "ice", "shadow"
  glowIntensity: decimal("glow_intensity", { precision: 3, scale: 2 }).default("1.0"),
  
  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CharacterAppearance = typeof characterAppearances.$inferSelect;
export type InsertCharacterAppearance = typeof characterAppearances.$inferInsert;

// ============ CHARACTER STATS SCHEMA ============

/**
 * Character Stats Table
 * Stores base stats for each character type
 * Used for game balance and character creation
 */
export const characterStats = mysqlTable("character_stats", {
  id: int("id").autoincrement().primaryKey(),
  characterType: mysqlEnum("character_type", ["tank", "mage", "rogue"]).notNull().unique(),
  
  // Base Stats
  maxHp: int("max_hp").notNull(),
  speed: int("speed").notNull(),
  attackPower: int("attack_power").notNull(),
  defense: int("defense").notNull(),
  spellPower: int("spell_power").notNull(),
  cooldownReduction: decimal("cooldown_reduction", { precision: 3, scale: 2 }).notNull(),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CharacterStats = typeof characterStats.$inferSelect;
export type InsertCharacterStats = typeof characterStats.$inferInsert;

// ============ SPELL SCHEMA ============

/**
 * Spells Table
 * Stores spell definitions used by characters
 * Can be shared across character types or specific to one type
 */
export const spells = mysqlTable("spells", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  
  // Spell Properties
  cooldown: decimal("cooldown", { precision: 5, scale: 2 }).notNull(), // in seconds
  castTime: decimal("cast_time", { precision: 5, scale: 2 }).notNull(), // in seconds
  range: int("range").notNull(), // in pixels
  manaCost: int("mana_cost").default(0),
  
  // Effects (stored as JSON array)
  effects: json("effects").$type<Array<{
    type: "damage" | "heal" | "knockback" | "freeze" | "burn" | "stun" | "speed_boost";
    value: number;
    duration?: number;
  }>>().notNull(),
  
  // Visual/Audio
  animationName: varchar("animation_name", { length: 100 }),
  soundEffectUrl: varchar("sound_effect_url", { length: 500 }),
  particleEffectType: varchar("particle_effect_type", { length: 50 }),
  
  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Spell = typeof spells.$inferSelect;
export type InsertSpell = typeof spells.$inferInsert;

// ============ CHARACTER SPELL MAPPING ============

/**
 * Character Spell Mapping
 * Links spells to specific character types
 * Allows different characters to have different spell sets
 */
export const characterSpellMappings = mysqlTable("character_spell_mappings", {
  id: int("id").autoincrement().primaryKey(),
  characterType: mysqlEnum("character_type", ["tank", "mage", "rogue"]).notNull(),
  spellId: int("spell_id").notNull(),
  slotIndex: int("slot_index").notNull(), // 0-5 for 6 spell slots
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CharacterSpellMapping = typeof characterSpellMappings.$inferSelect;
export type InsertCharacterSpellMapping = typeof characterSpellMappings.$inferInsert;

// ============ ARENA SCHEMA ============

/**
 * Arena Configurations
 * Stores arena layouts, obstacles, and hazard settings
 */
export const arenas = mysqlTable("arenas", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  
  // Arena Dimensions
  width: int("width").notNull(),
  height: int("height").notNull(),
  
  // Fire Ring Settings
  safeZoneRadius: int("safe_zone_radius").notNull(),
  fireRingDamage: int("fire_ring_damage").notNull(),
  fireRingShrinkSpeed: decimal("fire_ring_shrink_speed", { precision: 5, scale: 2 }).notNull(),
  
  // Obstacles (stored as JSON)
  obstacles: json("obstacles").$type<Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: "wall" | "pillar" | "destructible";
    health?: number;
  }>>().notNull().default([]),
  
  // Visual
  backgroundUrl: varchar("background_url", { length: 500 }),
  theme: varchar("theme", { length: 50 }), // e.g., "volcanic", "frozen", "dark_forest"
  
  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Arena = typeof arenas.$inferSelect;
export type InsertArena = typeof arenas.$inferInsert;

// ============ PICKUP SCHEMA ============

/**
 * Pickup Definitions
 * Stores properties for items that spawn in the arena
 */
export const pickupDefinitions = mysqlTable("pickup_definitions", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["health_potion", "mana_potion", "spell_powerup", "speed_boost"]).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  
  // Properties
  value: int("value").notNull(), // Amount healed/restored/boosted
  duration: int("duration"), // Duration in milliseconds (for temporary buffs)
  
  // Visual
  iconUrl: varchar("icon_url", { length: 500 }),
  particleColor: varchar("particle_color", { length: 7 }), // Hex color
  
  // Spawn Settings
  spawnWeight: decimal("spawn_weight", { precision: 3, scale: 2 }).default("1.0"), // Probability weight
  
  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PickupDefinition = typeof pickupDefinitions.$inferSelect;
export type InsertPickupDefinition = typeof pickupDefinitions.$inferInsert;

// ============ GAME SESSION SCHEMA ============

/**
 * Game Sessions
 * Tracks active and completed games
 * Useful for matchmaking, statistics, and replay data
 */
export const gameSessions = mysqlTable("game_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
  
  // Players
  player1Id: varchar("player1_id", { length: 64 }).notNull(),
  player2Id: varchar("player2_id", { length: 64 }),
  
  // Game State
  status: mysqlEnum("status", ["waiting", "active", "completed", "abandoned"]).default("waiting"),
  winnerId: varchar("winner_id", { length: 64 }),
  
  // Character Selection
  player1CharacterType: mysqlEnum("player1_character_type", ["tank", "mage", "rogue"]),
  player2CharacterType: mysqlEnum("player2_character_type", ["tank", "mage", "rogue"]),
  
  // Arena
  arenaId: int("arena_id"),
  
  // Game Data
  duration: int("duration"), // in milliseconds
  player1FinalHp: int("player1_final_hp"),
  player2FinalHp: int("player2_final_hp"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;