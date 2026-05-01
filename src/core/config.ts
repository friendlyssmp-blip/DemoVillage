export const GAME_CONFIG = {
  VERSION: '1.0.0',
  TICK_RATE: 20, // Ticks per second
  STARTING_RESOURCES: {
    wood: 500,
    stone: 300,
    food: 500,
    gold: 1000,
  },
  COMBAT: {
    MAX_BATTLE_TIME: 180, // Seconds
    DEFAULT_UNIT_HEALTH: 100,
    DESTRUCTION_THRESHOLD: 50, // % for victory
  },
  ECONOMY: {
    COLLECTION_INTERVAL: 1000, // ms
    OFFLINE_PRODUCTION_CAP: 24 * 60 * 60 * 1000, // 24 hours
  },
  LIMITS: {
    MAX_BUILDINGS: 50,
    MAX_UNITS: 200,
    RATE_LIMIT_MS: 100, // Standard action throttle
  },
  LEVELS: {
    MAX_BUILDING_LEVEL: 10,
    UPGRADE_COST_MULTIPLIER: 1.5,
  }
};
