import { useGameState } from '../../hooks/useGameState'
import { getLevel, getXpProgress, getXpForNextLevel } from '../../utils/xpCalculator'
import { useLocation, NavLink } from 'react-router-dom'
import courseData from '../../data/course.json'
import { STUDY_MODES } from '../../utils/constants'
import { IconFlame, IconMenu, CHAPTER_ICONS, MODE_ICONS } from '../Icons'

export default function Header() {
  const { xp, streak } = useGameState()
  const level = getLevel(xp)
  const xpProgress = getXpProgress(xp)
  const nextLevelXp = getXpForNextLevel(xp)
  const location = useLocation()

  const pathParts = location.pathname.split('/')
  const chapterId = pathParts[2]
  const currentChapter = courseData.chapters.find(ch => ch.id === chapterId)
  const ChapterIcon = chapterId ? CHAPTER_ICONS[chapterId] : null

  return (
    <header className="bg-bg-deep/80 backdrop-blur-sm border-b border-slate-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="md:hidden text-slate-400 hover:text-slate-200">
            <IconMenu className="w-5 h-5" />
          </NavLink>

          {currentChapter ? (
            <div className="flex items-center gap-2">
              <NavLink to="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                Ana Sayfa
              </NavLink>
              <span className="text-slate-700">/</span>
              <span className="text-sm text-slate-300 flex items-center gap-1.5">
                {ChapterIcon && <ChapterIcon className="w-4 h-4" />}
                {currentChapter.id.replace('ch', 'Ch')} - {currentChapter.title} ({currentChapter.titleEn})
              </span>
            </div>
          ) : (
            <h2 className="text-lg font-semibold text-slate-200">
              {courseData.courseCode} - {courseData.courseName}
            </h2>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`text-orange-400 ${streak.current > 0 ? 'animate-fire' : ''}`}>
              <IconFlame className="w-5 h-5" />
            </span>
            <span className="text-sm font-semibold text-orange-400">
              {streak.current}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-xp-gold">Lv.{level}</span>
            </div>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-xp-gold to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">
              {xp}{nextLevelXp ? `/${nextLevelXp}` : ''} XP
            </span>
          </div>
        </div>
      </div>

      {currentChapter && (
        <div className="flex md:hidden gap-1 mt-3 overflow-x-auto">
          {STUDY_MODES.map(mode => {
            const ModeIcon = MODE_ICONS[mode.iconKey]
            return (
              <NavLink
                key={mode.id}
                to={`/chapter/${chapterId}/${mode.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'bg-surface text-slate-400'
                  }`
                }
              >
                {ModeIcon && <ModeIcon className="w-3.5 h-3.5" />}
                <span>{mode.label}</span>
              </NavLink>
            )
          })}
        </div>
      )}
    </header>
  )
}
