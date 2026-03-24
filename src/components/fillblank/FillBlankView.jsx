import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { useGameState } from '../../hooks/useGameState'
import { XP_VALUES } from '../../utils/constants'
import { shuffleArray } from '../../utils/xpCalculator'
import { IconPencil, IconParty, IconClap, IconMuscle, IconLightbulb, IconCheckCircle, IconXCircle } from '../Icons'

export default function FillBlankView() {
  const { chapterId } = useParams()
  const [chapter, setChapter] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef(null)
  const { updateChapterProgress, getChapterProgress } = useProgress()
  const { addXp } = useGameState()

  useEffect(() => {
    const map = { ch1: 'ch1-introduction', ch2: 'ch2-os-structures', ch3: 'ch3-processes', ch4: 'ch4-threads', ch6: 'ch6-synchronization', sup1: 'supplement-linux-cli' }
    import(`../../data/chapters/${map[chapterId] || chapterId}.json`)
      .then(mod => {
        setChapter(mod.default)
        setQuestions(shuffleArray(mod.default.fillBlanks || []))
      })
      .catch(() => setChapter(null))
  }, [chapterId])

  useEffect(() => {
    inputRef.current?.focus()
  }, [currentIndex])

  const currentQ = questions[currentIndex]

  const handleSubmit = () => {
    if (!userAnswer.trim() || submitted) return
    const answer = currentQ.answer || (currentQ.blanks && currentQ.blanks[0]) || ''
    const acceptable = currentQ.acceptableAnswers || [answer].filter(Boolean)
    const correct = acceptable.some(a => a && a.toLowerCase().trim() === userAnswer.toLowerCase().trim())
    setIsCorrect(correct)
    setSubmitted(true)
    if (correct) {
      setScore(prev => prev + 1)
      addXp(XP_VALUES.FILL_BLANK_CORRECT)
    }
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setUserAnswer('')
      setSubmitted(false)
      setIsCorrect(false)
      setShowHint(false)
    } else {
      setFinished(true)
      const finalScore = Math.round((score / questions.length) * 100)
      const progress = getChapterProgress(chapterId)
      updateChapterProgress(chapterId, {
        fillBlankScores: [...(progress.fillBlankScores || []), finalScore],
        fillBlankBestScore: Math.max(progress.fillBlankBestScore || 0, finalScore),
      })
    }
  }

  if (!chapter || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <IconPencil className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400">Bu bolumun bosluk doldurma sorulari henuz hazir degil...</p>
        </div>
      </div>
    )
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100)
    const ResultIcon = percentage >= 80 ? IconParty : percentage >= 50 ? IconClap : IconMuscle

    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <ResultIcon className="w-16 h-16 text-primary mx-auto" />
        <h2 className="text-2xl font-bold text-slate-100">Tamamlandi!</h2>
        <div className="text-5xl font-bold">
          <span className={percentage >= 70 ? 'text-green-400' : percentage >= 50 ? 'text-amber-400' : 'text-red-400'}>
            %{percentage}
          </span>
        </div>
        <p className="text-slate-400">{questions.length} sorudan {score} dogru</p>
        <button
          onClick={() => {
            setQuestions(shuffleArray(chapter.fillBlanks || []))
            setCurrentIndex(0)
            setUserAnswer('')
            setSubmitted(false)
            setIsCorrect(false)
            setShowHint(false)
            setScore(0)
            setFinished(false)
          }}
          className="px-6 py-2.5 rounded-xl bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  const sentenceText = currentQ.sentence || currentQ.text || currentQ.textWithBlanks || ''
  const answerText = currentQ.answer || (currentQ.blanks && currentQ.blanks[0]) || ''
  const parts = sentenceText.split('___')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Bosluk Doldurma (Fill in the Blank)</h2>
        <span className="text-sm text-slate-500">{currentIndex + 1} / {questions.length}</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-surface rounded-2xl border border-slate-800/50 p-6 space-y-5">
        <div className="text-base text-slate-200 leading-loose">
          {parts[0]}
          <span className={`inline-block min-w-[120px] mx-1 px-3 py-1 rounded-lg border-b-2 text-center font-mono ${
            submitted
              ? isCorrect
                ? 'border-green-500 bg-green-500/10 text-green-400'
                : 'border-red-500 bg-red-500/10 text-red-400'
              : 'border-primary bg-primary/5 text-primary'
          }`}>
            {submitted ? (isCorrect ? userAnswer : `${userAnswer} \u2192 ${answerText}`) : userAnswer || '???'}
          </span>
          {parts[1]}
        </div>

        {!submitted && (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Cevabini yaz..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-primary focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-colors text-sm disabled:opacity-30"
            >
              Kontrol Et
            </button>
          </form>
        )}

        {!submitted && currentQ.hint && (
          <button
            onClick={() => setShowHint(true)}
            className="text-xs text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <IconLightbulb className="w-3.5 h-3.5" />
            {showHint ? currentQ.hint : 'Ipucu goster'}
          </button>
        )}

        {submitted && (
          <div className={`p-4 rounded-xl animate-bounce-in flex items-start gap-2 ${isCorrect ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20'}`}>
            {isCorrect ? <IconCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" /> : <IconXCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
            <div>
              <p className={`text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? 'Dogru!' : 'Yanlis!'}
              </p>
              {!isCorrect && (
                <p className="text-sm text-slate-400 mt-1">
                  Dogru cevap: <span className="text-green-400 font-mono">{answerText}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {submitted && (
          <button
            onClick={nextQuestion}
            className="w-full py-2.5 rounded-xl bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-colors text-sm"
          >
            {currentIndex < questions.length - 1 ? 'Sonraki Soru \u2192' : 'Sonuclari Gor'}
          </button>
        )}
      </div>
    </div>
  )
}
