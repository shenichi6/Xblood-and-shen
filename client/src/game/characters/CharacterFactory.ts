/**
 * Character Factory
 * Creates character instances based on type
 * Centralizes character creation logic
 */

import type { CharacterType } from "@shared/gameTypes";
import { CharacterBase } from "./CharacterBase";
import { Tank } from "./Tank";
import { Mage } from "./Mage";
import { Rogue } from "./Rogue";

export class CharacterFactory {
  /**
   * Create a character of the specified type
   */
  static createCharacter(
    type: CharacterType,
    id: string,
    name: string,
    startX: number,
    startY: number
  ): CharacterBase {
    switch (type) {
      case "tank":
        return new Tank(id, name, startX, startY);
      case "mage":
        return new Mage(id, name, startX, startY);
      case "rogue":
        return new Rogue(id, name, startX, startY);
      default:
        throw new Error(`Unknown character type: ${type}`);
    }
  }

  /**
   * Get character type descriptions
   */
  static getCharacterDescription(type: CharacterType): string {
    const descriptions: Record<CharacterType, string> = {
      tank: "High HP and Defense. Absorb damage and control the battlefield.",
      mage: "High Spell Power and Cooldown Reduction. Deal ranged magical damage.",
      rogue: "High Speed and Attack Power. Burst damage and mobility.",
    };
    return descriptions[type];
  }

  /**
   * Get all available character types
   */
  static getAvailableTypes(): CharacterType[] {
    return ["tank", "mage", "rogue"];
  }
}
