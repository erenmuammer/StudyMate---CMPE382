import { LEVEL_THRESHOLDS } from './constants'

export function getLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export function getXpForNextLevel(xp) {
  const level = getLevel(xp)
  if (level >= LEVEL_THRESHOLDS.length) return null
  return LEVEL_THRESHOLDS[level]
}

export function getXpProgress(xp) {
  const level = getLevel(xp)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 100
  return ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
}

export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
