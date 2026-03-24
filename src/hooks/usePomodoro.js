import { useState, useEffect, useCallback, useRef } from 'react'
import { POMODORO_DEFAULTS } from '../utils/constants'

export function usePomodoro() {
  const [timeLeft, setTimeLeft] = useState(POMODORO_DEFAULTS.WORK)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [cycle, setCycle] = useState(1)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current)
      if (!isBreak) {
        // Work session ended
        const isLongBreak = cycle % POMODORO_DEFAULTS.CYCLES_BEFORE_LONG === 0
        setTimeLeft(isLongBreak ? POMODORO_DEFAULTS.LONG_BREAK : POMODORO_DEFAULTS.SHORT_BREAK)
        setIsBreak(true)
        setIsRunning(false)
        // Try to notify
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('StudyMate', { body: 'Mola zamani! Biraz dinlen 🎉' })
        }
      } else {
        // Break ended
        setCycle(prev => prev + 1)
        setTimeLeft(POMODORO_DEFAULTS.WORK)
        setIsBreak(false)
        setIsRunning(false)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('StudyMate', { body: 'Mola bitti! Calisma zamani 💪' })
        }
      }
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft, isBreak, cycle])

  const toggle = useCallback(() => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setIsRunning(prev => !prev)
  }, [isRunning])

  const reset = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(isBreak ? POMODORO_DEFAULTS.SHORT_BREAK : POMODORO_DEFAULTS.WORK)
  }, [isBreak])

  const skip = useCallback(() => {
    setTimeLeft(0)
  }, [])

  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, [])

  return {
    timeLeft,
    isRunning,
    isBreak,
    cycle,
    toggle,
    reset,
    skip,
    displayTime: formatTime(timeLeft),
    progress: isBreak
      ? ((isBreak && cycle % POMODORO_DEFAULTS.CYCLES_BEFORE_LONG === 0
          ? POMODORO_DEFAULTS.LONG_BREAK : POMODORO_DEFAULTS.SHORT_BREAK) - timeLeft)
        / (cycle % POMODORO_DEFAULTS.CYCLES_BEFORE_LONG === 0
          ? POMODORO_DEFAULTS.LONG_BREAK : POMODORO_DEFAULTS.SHORT_BREAK) * 100
      : (POMODORO_DEFAULTS.WORK - timeLeft) / POMODORO_DEFAULTS.WORK * 100,
  }
}
