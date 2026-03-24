export const XP_VALUES = {
  SUMMARY_SECTION: 5,
  FLASHCARD_EASY: 3,
  FLASHCARD_MEDIUM: 5,
  FLASHCARD_HARD: 10,
  QUIZ_CORRECT_FIRST: 10,
  QUIZ_CORRECT_SECOND: 5,
  FILL_BLANK_CORRECT: 8,
  CHAPTER_COMPLETE: 50,
}

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000,
]

export const POMODORO_DEFAULTS = {
  WORK: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
  CYCLES_BEFORE_LONG: 4,
}

export const XP_VALUES_EXAM = {
  EXAM_CORRECT: 12,
  EXAM_COMPLETE: 75,
}

export const STUDY_MODES = [
  { id: 'summary', label: 'Konu Ozeti', iconKey: 'summary', color: 'text-cyan-400' },
  { id: 'cards', label: 'Flashcard', iconKey: 'cards', color: 'text-purple-400' },
  { id: 'quiz', label: 'Quiz', iconKey: 'quiz', color: 'text-green-400' },
  { id: 'fill', label: 'Bosluk Doldurma', iconKey: 'fill', color: 'text-amber-400' },
  { id: 'exam', label: 'Sinav Pratigi', iconKey: 'exam', color: 'text-red-400' },
]
