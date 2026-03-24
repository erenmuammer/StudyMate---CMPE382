import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { getLevel } from '../utils/xpCalculator'

const GameStateContext = createContext(null)

const initialState = {
  xp: 0,
  streak: { current: 0, lastDate: null },
  achievements: [],
}

export function GameStateProvider({ children }) {
  const [gameState, setGameState] = useLocalStorage('studymate-game', initialState)

  const addXp = useCallback((amount) => {
    setGameState(prev => {
      const oldLevel = getLevel(prev.xp)
      const newXp = prev.xp + amount
      const newLevel = getLevel(newXp)
      if (newLevel > oldLevel) {
        // Level up event - handled by XP notification
      }
      return { ...prev, xp: newXp }
    })
    return amount
  }, [setGameState])

  const updateStreak = useCallback(() => {
    setGameState(prev => {
      const today = new Date().toDateString()
      if (prev.streak.lastDate === today) return prev

      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const isConsecutive = prev.streak.lastDate === yesterday

      return {
        ...prev,
        streak: {
          current: isConsecutive ? prev.streak.current + 1 : 1,
          lastDate: today,
        },
      }
    })
  }, [setGameState])

  const addAchievement = useCallback((id) => {
    setGameState(prev => {
      if (prev.achievements.includes(id)) return prev
      return { ...prev, achievements: [...prev.achievements, id] }
    })
  }, [setGameState])

  return (
    <GameStateContext.Provider value={{ ...gameState, addXp, updateStreak, addAchievement }}>
      {children}
    </GameStateContext.Provider>
  )
}

export function useGameState() {
  const context = useContext(GameStateContext)
  if (!context) throw new Error('useGameState must be used within GameStateProvider')
  return context
}
