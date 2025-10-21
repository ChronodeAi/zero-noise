// XP rewards for different actions
export const XP_REWARDS = {
  FILE_UPLOAD: 10,      // Per file uploaded
  LINK_SAVE: 5,         // Per link saved
  COLLECTION_CREATE: 15, // Per collection created
} as const

// Level tiers with XP thresholds
export const LEVELS = [
  { name: 'Researcher', minXP: 0, maxXP: 99, icon: '🔍' },
  { name: 'Collector', minXP: 100, maxXP: 249, icon: '📦' },
  { name: 'Curator', minXP: 250, maxXP: 499, icon: '🎨' },
  { name: 'Archivist', minXP: 500, maxXP: 999, icon: '📚' },
  { name: 'Master Archivist', minXP: 1000, maxXP: 2499, icon: '🏛️' },
  { name: 'Librarian', minXP: 2500, maxXP: 4999, icon: '📖' },
  { name: 'Grand Librarian', minXP: 5000, maxXP: 9999, icon: '👑' },
  { name: 'Keeper of Knowledge', minXP: 10000, maxXP: Infinity, icon: '✨' },
] as const

export interface LevelInfo {
  name: string
  minXP: number
  maxXP: number
  icon: string
  currentXP: number
  xpToNextLevel: number
  progressPercentage: number
  rank: number
}

/**
 * Calculate user's level and progress from their XP
 */
export function getLevelInfo(xp: number): Omit<LevelInfo, 'rank'> {
  const level = LEVELS.find(l => xp >= l.minXP && xp <= l.maxXP) || LEVELS[0]
  const currentXP = xp
  const xpToNextLevel = level.maxXP === Infinity ? 0 : level.maxXP - xp + 1
  const progressPercentage = 
    level.maxXP === Infinity 
      ? 100 
      : ((xp - level.minXP) / (level.maxXP - level.minXP + 1)) * 100

  return {
    name: level.name,
    minXP: level.minXP,
    maxXP: level.maxXP,
    icon: level.icon,
    currentXP,
    xpToNextLevel,
    progressPercentage,
  }
}

/**
 * Get level name and icon from XP value
 */
export function getLevelFromXP(xp: number): { name: string; icon: string } {
  const level = LEVELS.find(l => xp >= l.minXP && xp <= l.maxXP) || LEVELS[0]
  return { name: level.name, icon: level.icon }
}

/**
 * Calculate XP needed to reach a specific level
 */
export function getXPForLevel(levelName: string): number {
  const level = LEVELS.find(l => l.name === levelName)
  return level?.minXP || 0
}
