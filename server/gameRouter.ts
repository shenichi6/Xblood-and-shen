/**
 * Game Router
 * tRPC procedures for accessing game data
 * Used by both players to fetch character appearances, spells, arenas, and pickups
 */

import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getCharacterAppearance,
  getAllCharacterAppearances,
  getCharacterStats,
  getAllCharacterStats,
  getSpell,
  getAllSpells,
  getSpellsByCharacterType,
  getArena,
  getAllArenas,
  getDefaultArena,
  getPickupDefinition,
  getAllPickupDefinitions,
  createGameSession,
  getGameSession,
  updateGameSessionStatus,
  completeGameSession,
  getPlayerGameHistory,
} from "./gameDb";

export const gameRouter = router({
  // ============ CHARACTER QUERIES ============

  /**
   * Get appearance data for a specific character type
   */
  getCharacterAppearance: publicProcedure
    .input(z.enum(["tank", "mage", "rogue"]))
    .query(async ({ input }) => {
      return await getCharacterAppearance(input);
    }),

  /**
   * Get all character appearances
   */
  getAllCharacterAppearances: publicProcedure.query(async () => {
    return await getAllCharacterAppearances();
  }),

  /**
   * Get stats for a specific character type
   */
  getCharacterStats: publicProcedure
    .input(z.enum(["tank", "mage", "rogue"]))
    .query(async ({ input }) => {
      return await getCharacterStats(input);
    }),

  /**
   * Get all character stats
   */
  getAllCharacterStats: publicProcedure.query(async () => {
    return await getAllCharacterStats();
  }),

  // ============ SPELL QUERIES ============

  /**
   * Get a specific spell by ID
   */
  getSpell: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await getSpell(input);
  }),

  /**
   * Get all spells
   */
  getAllSpells: publicProcedure.query(async () => {
    return await getAllSpells();
  }),

  /**
   * Get spells for a specific character type
   */
  getSpellsByCharacterType: publicProcedure
    .input(z.enum(["tank", "mage", "rogue"]))
    .query(async ({ input }) => {
      return await getSpellsByCharacterType(input);
    }),

  // ============ ARENA QUERIES ============

  /**
   * Get a specific arena by ID
   */
  getArena: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await getArena(input);
  }),

  /**
   * Get all arenas
   */
  getAllArenas: publicProcedure.query(async () => {
    return await getAllArenas();
  }),

  /**
   * Get the default arena (first one)
   */
  getDefaultArena: publicProcedure.query(async () => {
    return await getDefaultArena();
  }),

  // ============ PICKUP QUERIES ============

  /**
   * Get a specific pickup definition
   */
  getPickupDefinition: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await getPickupDefinition(input);
    }),

  /**
   * Get all pickup definitions
   */
  getAllPickupDefinitions: publicProcedure.query(async () => {
    return await getAllPickupDefinitions();
  }),

  // ============ GAME SESSION QUERIES ============

  /**
   * Create a new game session
   */
  createGameSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        player1Id: z.string(),
        player1CharacterType: z.enum(["tank", "mage", "rogue"]),
        arenaId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await createGameSession(
        input.sessionId,
        input.player1Id,
        input.player1CharacterType,
        input.arenaId
      );
    }),

  /**
   * Get a game session by ID
   */
  getGameSession: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await getGameSession(input);
  }),

  /**
   * Update game session status
   */
  updateGameSessionStatus: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        status: z.enum(["waiting", "active", "completed", "abandoned"]),
      })
    )
    .mutation(async ({ input }) => {
      return await updateGameSessionStatus(input.sessionId, input.status);
    }),

  /**
   * Complete a game session with results
   */
  completeGameSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        winnerId: z.string(),
        player1FinalHp: z.number(),
        player2FinalHp: z.number(),
        duration: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await completeGameSession(
        input.sessionId,
        input.winnerId,
        input.player1FinalHp,
        input.player2FinalHp,
        input.duration
      );
    }),

  /**
   * Get game history for a player
   */
  getPlayerGameHistory: publicProcedure
    .input(
      z.object({
        playerId: z.string(),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }) => {
      return await getPlayerGameHistory(input.playerId, input.limit);
    }),
});
