/**
 * Game Database Helpers
 * Query functions for characters, spells, arenas, and pickups
 * Used by tRPC procedures to fetch and manipulate game data
 */

import { eq } from "drizzle-orm";
import {
  characterAppearances,
  characterStats,
  spells,
  characterSpellMappings,
  arenas,
  pickupDefinitions,
  gameSessions,
} from "../drizzle/schema";
import { getDb } from "./db";
import type { CharacterType } from "@shared/gameTypes";

// ============ CHARACTER QUERIES ============

export async function getCharacterAppearance(characterType: CharacterType) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(characterAppearances)
    .where(eq(characterAppearances.characterType, characterType))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllCharacterAppearances() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(characterAppearances);
}

export async function getCharacterStats(characterType: CharacterType) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(characterStats)
    .where(eq(characterStats.characterType, characterType))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllCharacterStats() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(characterStats);
}

// ============ SPELL QUERIES ============

export async function getSpell(spellId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(spells).where(eq(spells.id, spellId)).limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllSpells() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(spells);
}

export async function getSpellsByCharacterType(characterType: CharacterType) {
  const db = await getDb();
  if (!db) return [];

  const mappings = await db
    .select()
    .from(characterSpellMappings)
    .where(eq(characterSpellMappings.characterType, characterType));

  const spellIds = mappings.map((m) => m.spellId);
  if (spellIds.length === 0) return [];

  // Fetch all spells for this character type
  const allSpells = await db.select().from(spells);
  return allSpells.filter((s) => spellIds.includes(s.id));
}

// ============ ARENA QUERIES ============

export async function getArena(arenaId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(arenas).where(eq(arenas.id, arenaId)).limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllArenas() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(arenas);
}

export async function getDefaultArena() {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(arenas).limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============ PICKUP QUERIES ============

export async function getPickupDefinition(pickupType: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(pickupDefinitions)
    .where(eq(pickupDefinitions.type, pickupType as any))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllPickupDefinitions() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pickupDefinitions);
}

// ============ GAME SESSION QUERIES ============

export async function createGameSession(
  sessionId: string,
  player1Id: string,
  player1CharacterType: CharacterType,
  arenaId: number
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(gameSessions).values({
    sessionId,
    player1Id,
    player1CharacterType,
    arenaId,
    status: "waiting",
  });

  return result;
}

export async function getGameSession(sessionId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.sessionId, sessionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateGameSessionStatus(
  sessionId: string,
  status: "waiting" | "active" | "completed" | "abandoned"
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .update(gameSessions)
    .set({ status })
    .where(eq(gameSessions.sessionId, sessionId));

  return result;
}

export async function completeGameSession(
  sessionId: string,
  winnerId: string,
  player1FinalHp: number,
  player2FinalHp: number,
  duration: number
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .update(gameSessions)
    .set({
      status: "completed",
      winnerId,
      player1FinalHp,
      player2FinalHp,
      duration,
      completedAt: new Date(),
    })
    .where(eq(gameSessions.sessionId, sessionId));

  return result;
}

export async function getPlayerGameHistory(playerId: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  // Get games where player was player1 or player2
  const allSessions = await db.select().from(gameSessions);

  return allSessions
    .filter((s) => s.player1Id === playerId || s.player2Id === playerId)
    .slice(0, limit);
}
