import { NavLink } from 'react-router-dom'
import courseData from '../../data/course.json'
import { useGameState } from '../../hooks/useGameState'
import { useProgress } from '../../hooks/useProgress'
import { getLevel, getXpProgress } from '../../utils/xpCalculator'
import { useEffect } from 'react'
import { IconStar, IconSparkles, IconFlame, IconBarChart, IconBook, IconCards, IconQuiz, IconPencil, IconClipboard, CHAPTER_ICONS } from '../Icons'

export default function Dashboard() {
  const { xp, streak, updateStreak } = useGameState()
  const { getChapterProgress, getOverallProgress } = useProgress()
  const level = getLevel(xp)
  const overall = getOverallProgress(courseData.chapters)

  useEffect(() => {
    updateStreak()
  }, [updateStreak])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-100">
          Hosgeldin!
        </h1>
        <p className="text-slate-400">
          {courseData.courseCode} - {courseData.courseName} calisma alanin
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<IconStar className="w-5 h-5" />} label="Level" value={level} color="text-xp-gold" />
        <StatCard icon={<IconSparkles className="w-5 h-5" />} label="Toplam XP" value={xp} color="text-amber-400" />
        <StatCard icon={<IconFlame className="w-5 h-5" />} label="Streak" value={`${streak.current} gun`} color="text-orange-400" />
        <StatCard icon={<IconBarChart className="w-5 h-5" />} label="Ilerleme" value={`%${overall}`} color="text-primary" />
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-surface rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Genel Ilerleme (Overall Progress)</span>
          <span className="text-sm font-semibold text-primary">%{overall}</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-dark to-primary-light rounded-full transition-all duration-1000"
            style={{ width: `${overall}%` }}
          />
        </div>
      </div>

      {/* Chapters Grid */}
      <div>
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Bolumler (Chapters)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseData.chapters.map(chapter => (
            <ChapterCard key={chapter.id} chapter={chapter} progress={getChapterProgress(chapter.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-slate-800/50 hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function ChapterCard({ chapter, progress }) {
  const completion = [
    progress.summaryRead,
    progress.flashcardsCompleted > 0,
    progress.quizScores?.length > 0,
    progress.fillBlankScores?.length > 0,
  ].filter(Boolean).length * 25

  const ChapterIcon = CHAPTER_ICONS[chapter.id]

  return (
    <div className="bg-surface rounded-xl border border-slate-800/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {ChapterIcon && (
              <span className="text-slate-400 group-hover:text-primary transition-colors">
                <ChapterIcon className="w-6 h-6" />
              </span>
            )}
            <div>
              <h3 className="font-semibold text-slate-200 group-hover:text-primary transition-colors">
                <span className="text-primary/60 font-mono text-xs mr-1.5">{chapter.id.replace('ch', 'Ch')}</span>
                {chapter.title}
              </h3>
              <p className="text-xs text-slate-500">Chapter {chapter.id.replace('ch', '')}: {chapter.titleEn}</p>
            </div>
          </div>
          <ProgressRing percentage={completion} />
        </div>

        <p className="text-sm text-slate-400 mb-4">{chapter.subtitle}</p>

        {/* Mode Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <NavLink
            to={`/chapter/${chapter.id}/summary`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-primary/10 text-slate-400 hover:text-primary text-xs transition-all"
          >
            <IconBook className="w-3.5 h-3.5" /> Konu Ozeti
          </NavLink>
          <NavLink
            to={`/chapter/${chapter.id}/cards`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-purple-500/10 text-slate-400 hover:text-purple-400 text-xs transition-all"
          >
            <IconCards className="w-3.5 h-3.5" /> Flashcard
          </NavLink>
          <NavLink
            to={`/chapter/${chapter.id}/quiz`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-green-500/10 text-slate-400 hover:text-green-400 text-xs transition-all"
          >
            <IconQuiz className="w-3.5 h-3.5" /> Quiz
          </NavLink>
          <NavLink
            to={`/chapter/${chapter.id}/fill`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 text-xs transition-all"
          >
            <IconPencil className="w-3.5 h-3.5" /> Bosluk Doldur
          </NavLink>
          <NavLink
            to={`/chapter/${chapter.id}/exam`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs transition-all col-span-2"
          >
            <IconClipboard className="w-3.5 h-3.5" /> Sinav Pratigi
          </NavLink>
        </div>
      </div>
    </div>
  )
}

function ProgressRing({ percentage }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="#1e293b" strokeWidth="3" />
        <circle
          cx="22" cy="22" r={radius} fill="none"
          stroke="#06B6D4" strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
        {percentage}%
      </span>
    </div>
  )
}
