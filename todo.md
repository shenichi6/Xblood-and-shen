# Arcane Clash - Developer 2 TODO

## Phase 1: Project Setup & Database
- [x] Initialize Phaser 3 + TypeScript project
- [x] Install dependencies (Phaser, drizzle-orm, mysql2)
- [x] Upgrade project to web-db-user for database support
- [x] Create comprehensive game data types (@shared/gameTypes.ts)
- [x] Design database schema for characters, spells, arenas, pickups
- [x] Create database migration files

## Phase 2: Character System
- [x] Create CharacterBase abstract class with core logic
- [x] Implement Tank character class
- [x] Implement Mage character class
- [x] Implement Rogue character class
- [x] Create CharacterFactory for character instantiation
- [ ] Create character appearance database seeding script
- [ ] Create character stats database seeding script
- [x] Write unit tests for character classes (33 tests passing)

## Phase 3: Spell System
- [x] Create Spell class with effect handling
- [x] Implement 6 spell types (Damage, Heal, Knockback, Freeze, Burn, Stun)
- [x] Create spell casting system with cooldowns (SpellCaster.ts)
- [x] Implement spell effect application logic (SpellCaster.resolveSpellEffects)
- [ ] Create spell database seeding script
- [ ] Create character-spell mapping seeding script
- [x] Write unit tests for spell system (28 tests passing)

## Phase 4: Arena System
- [x] Create Arena class with obstacle management
- [x] Implement fire ring hazard with shrinking logic
- [x] Create obstacle collision detection
- [x] Implement fire ring damage system
- [ ] Create arena visual rendering
- [ ] Create arena database seeding script
- [x] Write unit tests for arena system (32 tests passing)

## Phase 5: Pickup System
- [x] Create Pickup class and spawning system
- [x] Implement health potion pickup
- [x] Implement mana potion pickup
- [x] Implement spell powerup pickup
- [x] Implement speed boost pickup
- [x] Create pickup collision detection
- [ ] Create pickup database seeding script
- [x] Write unit tests for pickup system (33 tests passing)

## Phase 6: Visual Effects & Animations
- [x] Create particle effect system (ParticleEffect.ts)
- [x] Implement character animations (idle, move, attack, cast)
- [x] Implement spell cast animations (AnimationSystem)
- [x] Implement damage/heal visual feedback (ParticleEffect)
- [x] Implement status effect indicators (ParticleEffect)
- [ ] Create visual polish (glow, shadows, transitions)
- [ ] Write animation tests

## Phase 7: Database & API Integration
- [x] Create database schema with all tables
- [x] Create gameDb.ts query helpers
- [x] Create gameRouter.ts tRPC endpoints
- [x] Create GAME_DATA_API.md documentation
- [ ] Seed database with initial game data
- [ ] Test all tRPC endpoints
- [ ] Create API integration tests

## Phase 8: Game Integration & Testing
- [ ] Integrate Phaser scene with database APIs
- [ ] Implement player input handling (WASD movement, spell casting)
- [x] Implement game state management (GameState.ts)
- [x] Create game loop and update system (GameState.update)
- [ ] Test character movement and collision
- [ ] Test spell casting and effects
- [x] Test arena hazards and pickups (fire ring, pickup collection)
- [ ] Performance optimization

## Phase 9: Multiplayer Foundation
- [ ] Design network synchronization protocol
- [ ] Implement player state serialization
- [ ] Create game session management
- [ ] Implement basic matchmaking
- [ ] Test two-player synchronization
- [ ] Create network error handling

## Phase 10: Polish & Delivery
- [x] Fix server runtime error (removed dotenv import from server/_core/index.ts)
- [x] Code review and cleanup (126/126 tests passing, all systems verified)
- [x] Create comprehensive documentation (GAME_DATA_API.md, DEVELOPER_GUIDE.md)
- [ ] Performance profiling and optimization
- [ ] Cross-browser testing
- [x] Create developer guide for teammate (DEVELOPER_GUIDE.md)
- [ ] Final integration testing
- [ ] Prepare for GitHub push

## Notes
- Database schema is ready in `drizzle/schema.ts`
- Character classes are implemented in `client/src/game/characters/`
- Game data API is documented in `GAME_DATA_API.md`
- Both developers can access game data through tRPC endpoints
- Coordinate with Developer 1 on core engine integration points
