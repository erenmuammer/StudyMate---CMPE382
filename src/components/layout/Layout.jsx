import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import PomodoroTimer from '../pomodoro/PomodoroTimer'
import XPNotification from '../gamification/XPNotification'

export default function Layout() {
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <PomodoroTimer />
      <XPNotification />
    </div>
  )
}
