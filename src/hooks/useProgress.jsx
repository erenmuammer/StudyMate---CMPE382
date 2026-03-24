import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

const ProgressContext = createContext(null)

const initialProgress = {}

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useLocalStorage('studymate-progress', initialProgress)

  const getChapterProgress = useCallback((chapterId) => {
    return progress[chapterId] || {
      summaryRead: false,
      summaryProgress: 0,
      flashcardsCompleted: 0,
      flashcardsDifficulty: {},
      quizScores: [],
      quizBestScore: 0,
      fillBlankScores: [],
      fillBlankBestScore: 0,
    }
  }, [progress])

  const updateChapterProgress = useCallback((chapterId, updates) => {
    setProgress(prev => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        ...updates,
      },
    }))
  }, [setProgress])

  const getOverallProgress = useCallback((chapters) => {
    if (!chapters || chapters.length === 0) return 0
    let total = 0
    chapters.forEach(ch => {
      const p = getChapterProgress(ch.id)
      let chProgress = 0
      if (p.summaryRead) chProgress += 25
      if (p.flashcardsCompleted > 0) chProgress += 25
      if (p.quizScores?.length > 0) chProgress += 25
      if (p.fillBlankScores?.length > 0) chProgress += 25
      total += chProgress
    })
    return Math.round(total / chapters.length)
  }, [getChapterProgress])

  return (
    <ProgressContext.Provider value={{ progress, getChapterProgress, updateChapterProgress, getOverallProgress }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used within ProgressProvider')
  return context
}
