import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { IconSparkles } from '../Icons'

const XPNotifContext = createContext(null)

export function XPNotifProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const showXP = useCallback((amount) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, amount }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 1500)
  }, [])

  return (
    <XPNotifContext.Provider value={showXP}>
      {children}
      <div className="fixed bottom-24 right-8 space-y-2 z-50 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="animate-float-up text-xp-gold font-bold text-xl flex items-center gap-1">
            +{n.amount} XP <IconSparkles className="w-5 h-5" />
          </div>
        ))}
      </div>
    </XPNotifContext.Provider>
  )
}

export function useXPNotification() {
  return useContext(XPNotifContext)
}

export default function XPNotification() {
  return null
}
