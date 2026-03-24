import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { useGameState } from '../../hooks/useGameState'
import { XP_VALUES } from '../../utils/constants'
import { shuffleArray } from '../../utils/xpCalculator'
import { IconQuiz, IconTrophy, IconStar, IconStarOutline, IconThumbsUp, IconBook } from '../Icons'

export default function QuizView() {
  const { chapterId } = useParams()
  const [chapter, setChapter] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [finished, setFinished] = useState(false)
  const { updateChapterProgress, getChapterProgress } = useProgress()
  const { addXp } = useGameState()

  useEffect(() => {
    const map = { ch1: 'ch1-introduction', ch2: 'ch2-os-structures', ch3: 'ch3-processes', ch4: 'ch4-threads', ch6: 'ch6-synchronization', sup1: 'supplement-linux-cli' }
    import(`../../data/chapters/${map[chapterId] || chapterId}.json`)
      .then(mod => {
        setChapter(mod.default)
        setQuestions(shuffleArray(mod.default.quiz || []))
      })
      .catch(() => setChapter(null))
  }, [chapterId])

  const currentQ = questions[currentIndex]

  const handleAnswer = (optionIndex) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(optionIndex)
    setShowExplanation(true)
    const isCorrect = optionIndex === currentQ.correctIndex
    if (isCorrect) {
      setScore(prev => prev + 1)
      addXp(XP_VALUES.QUIZ_CORRECT_FIRST)
    }
    setAnswers(prev => [...prev, { questionId: currentQ.id, selected: optionIndex, correct: currentQ.correctIndex, isCorrect }])
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setFinished(true)
      const finalScore = Math.round((score / questions.length) * 100)
      const progress = getChapterProgress(chapterId)
      updateChapterProgress(chapterId, {
        quizScores: [...(progress.quizScores || []), finalScore],
        quizBestScore: Math.max(progress.quizBestScore || 0, finalScore),
      })
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (selectedAnswer === null && currentQ) {
        if (e.key === '1') handleAnswer(0)
        if (e.key === '2') handleAnswer(1)
        if (e.key === '3') handleAnswer(2)
        if (e.key === '4') handleAnswer(3)
      }
      if (showExplanation && e.code === 'Enter') nextQuestion()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  if (!chapter || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <IconQuiz className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400">Bu bolumun quiz sorulari henuz hazir degil...</p>
        </div>
      </div>
    )
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100)
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0
    const ResultIcon = stars >= 3 ? IconTrophy : stars >= 2 ? IconStar : stars >= 1 ? IconThumbsUp : IconBook

    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <ResultIcon className={`w-16 h-16 mx-auto ${stars >= 2 ? 'text-xp-gold' : 'text-slate-400'}`} />
        <h2 className="text-2xl font-bold text-slate-100">Quiz Tamamlandi!</h2>

        <div className="text-5xl font-bold">
          <span className={percentage >= 70 ? 'text-green-400' : percentage >= 50 ? 'text-amber-400' : 'text-red-400'}>
            %{percentage}
          </span>
        </div>

        <p className="text-slate-400">
          {questions.length} sorudan {score} tanesini dogru cevapladin
        </p>

        <div className="flex justify-center gap-2">
          {[1, 2, 3].map(s => (
            <span key={s} className={`${s <= stars ? 'text-xp-gold' : 'text-slate-700'}`}>
              {s <= stars ? <IconStar className="w-8 h-8" /> : <IconStarOutline className="w-8 h-8" />}
            </span>
          ))}
        </div>

        {answers.filter(a => !a.isCorrect).length > 0 && (
          <div className="text-left bg-surface rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-red-400">Yanlis Cevapladigin Sorular:</h3>
            {answers.filter(a => !a.isCorrect).map((a, i) => {
              const q = questions.find(q => q.id === a.questionId)
              return (
                <div key={i} className="text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <p className="text-slate-300">{q?.question}</p>
                  <p className="text-green-400 mt-1">Dogru: {q?.options[a.correct]}</p>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={() => {
            setQuestions(shuffleArray(chapter.quiz || []))
            setCurrentIndex(0)
            setSelectedAnswer(null)
            setShowExplanation(false)
            setScore(0)
            setAnswers([])
            setFinished(false)
          }}
          className="px-6 py-2.5 rounded-xl bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Quiz</h2>
        <span className="text-sm text-slate-500">Soru {currentIndex + 1} / {questions.length}</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Skor:</span>
        <span className="text-sm font-bold text-green-400">{score}/{currentIndex + (selectedAnswer !== null ? 1 : 0)}</span>
      </div>

      <div className="bg-surface rounded-2xl border border-slate-800/50 p-6 space-y-5">
        <p className="text-base text-slate-200 leading-relaxed font-medium">{currentQ.question}</p>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let buttonClass = 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-primary hover:text-primary'
            if (selectedAnswer !== null) {
              if (idx === currentQ.correctIndex) {
                buttonClass = 'bg-green-500/10 border-green-500 text-green-400'
              } else if (idx === selectedAnswer && idx !== currentQ.correctIndex) {
                buttonClass = 'bg-red-500/10 border-red-500 text-red-400 animate-shake'
              } else {
                buttonClass = 'bg-slate-800/30 border-slate-800 text-slate-600'
              }
            }
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={selectedAnswer !== null}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 text-sm ${buttonClass}`}
              >
                <span className="font-mono text-xs mr-2 opacity-50">{idx + 1}</span>
                {option}
              </button>
            )
          })}
        </div>

        {showExplanation && (
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 animate-slide-in-right">
            <p className="text-xs font-semibold text-blue-400 mb-1">Aciklama (Explanation):</p>
            <p className="text-sm text-slate-300 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {showExplanation && (
          <button
            onClick={nextQuestion}
            className="w-full py-2.5 rounded-xl bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-colors text-sm"
          >
            {currentIndex < questions.length - 1 ? 'Sonraki Soru \u2192' : 'Sonuclari Gor'}
          </button>
        )}
      </div>

      <div className="text-center text-xs text-slate-600 space-x-4">
        <span>1-4: Cevap sec</span>
        <span>Enter: Sonraki</span>
      </div>
    </div>
  )
}
