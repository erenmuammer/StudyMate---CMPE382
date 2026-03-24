import { NavLink, useParams } from 'react-router-dom'
import { useState } from 'react'
import courseData from '../../data/course.json'
import { useProgress } from '../../hooks/useProgress'
import { STUDY_MODES } from '../../utils/constants'
import { CHAPTER_ICONS, MODE_ICONS, IconClipboard } from '../Icons'

export default function Sidebar() {
  const { chapterId } = useParams()
  const [collapsed, setCollapsed] = useState(false)
  const { getChapterProgress } = useProgress()

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-bg-deep border-r border-slate-800 flex flex-col transition-all duration-300 hidden md:flex`}>
      <NavLink to="/" className="flex items-center gap-3 p-4 border-b border-slate-800 hover:bg-surface/50 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
          S
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-slate-100">StudyMate</h1>
            <p className="text-xs text-slate-500">{courseData.courseCode}</p>
          </div>
        )}
      </NavLink>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-2 mx-2 mt-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-surface/50 transition-colors text-sm"
      >
        {collapsed ? '\u2192' : '\u2190'}
      </button>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {!collapsed && <p className="text-xs text-slate-500 uppercase tracking-wider px-3 py-2">Bolumler</p>}
        {courseData.chapters.map(ch => {
          const prog = getChapterProgress(ch.id)
          const completion = [prog.summaryRead, prog.flashcardsCompleted > 0, prog.quizScores?.length > 0, prog.fillBlankScores?.length > 0]
            .filter(Boolean).length * 25
          const ChIcon = CHAPTER_ICONS[ch.id]

          return (
            <div key={ch.id}>
              <NavLink
                to={`/chapter/${ch.id}/summary`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    chapterId === ch.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface/50'
                  }`
                }
              >
                {ChIcon && <ChIcon className="w-5 h-5 flex-shrink-0" />}
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      <span className="text-primary/50 font-mono text-xs mr-1">{ch.id.replace('ch', 'Ch')}</span>
                      {ch.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">Chapter {ch.id.replace('ch', '')}: {ch.titleEn}</p>
                  </div>
                )}
                {!collapsed && completion > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                    {completion}%
                  </span>
                )}
              </NavLink>

              {chapterId === ch.id && !collapsed && (
                <div className="ml-8 mt-1 space-y-0.5">
                  {STUDY_MODES.map(mode => {
                    const MIcon = MODE_ICONS[mode.iconKey]
                    return (
                      <NavLink
                        key={mode.id}
                        to={`/chapter/${ch.id}/${mode.id}`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                            isActive
                              ? 'bg-surface text-slate-100'
                              : 'text-slate-500 hover:text-slate-300'
                          }`
                        }
                      >
                        {MIcon && <MIcon className="w-3.5 h-3.5" />}
                        <span>{mode.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {/* Past Exams link */}
        {!collapsed && <p className="text-xs text-slate-500 uppercase tracking-wider px-3 py-2 mt-4">Diger</p>}
        <NavLink
          to="/past-exams"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-red-500/10 text-red-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface/50'
            }`
          }
        >
          <IconClipboard className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Cikmis Sorular</span>}
        </NavLink>
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 text-center">{courseData.semester}</p>
        </div>
      )}
    </aside>
  )
}
