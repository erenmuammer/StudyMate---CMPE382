import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { useGameState } from '../../hooks/useGameState'
import { shuffleArray } from '../../utils/xpCalculator'
import { IconClipboard, IconCheckCircle, IconXCircle, IconLightbulb } from '../Icons'

export default function ExamPracticeView() {
  const { chapterId } = useParams()
  const [chapter, setChapter] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [selfScore, setSelfScore] = useState(null)
  const [scores, setScores] = useState([])
  const [finished, setFinished] = useState(false)
  const { addXp } = useGameState()
  const { updateChapterProgress, getChapterProgress } = useProgress()

  useEffect(() => {
    const map = {
      ch1: 'ch1-introduction', ch2: 'ch2-os-structures', ch3: 'ch3-processes',
      ch4: 'ch4-threads', ch6: 'ch6-synchronization',
      sup1: 'supplement-linux-cli'
    }
    import(`../../data/chapters/${map[chapterId] || chapterId}.json`)
      .then(mod => {
        setChapter(mod.default)
        const examQs = mod.default.examQuestions || []
        setQuestions(examQs.length > 0 ? shuffleArray(examQs) : [])
      })
      .catch(() => setChapter(null))
  }, [chapterId])

  const currentQ = questions[currentIndex]

  const handleSubmit = () => {
    if (submitted) return
    setSubmitted(true)
    setShowSolution(true)
  }

  const handleSelfScore = (correct) => {
    setSelfScore(correct)
    if (correct) addXp(12)
    setScores(prev => [...prev, correct])
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setUserAnswer('')
      setSubmitted(false)
      setShowSolution(false)
      setSelfScore(null)
    } else {
      setFinished(true)
      const correctCount = scores.filter(Boolean).length
      const percentage = Math.round((correctCount / questions.length) * 100)
      const progress = getChapterProgress(chapterId)
      updateChapterProgress(chapterId, {
        examScores: [...(progress.examScores || []), percentage],
        examBestScore: Math.max(progress.examBestScore || 0, percentage),
      })
    }
  }

  if (!chapter || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <IconClipboard className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400">Bu bolumun sinav pratigi sorulari henuz hazir degil...</p>
          <p className="text-sm text-slate-600">Diger calisma modlarini deneyin.</p>
        </div>
      </div>
    )
  }

  if (finished) {
    const correctCount = scores.filter(Boolean).length
    const percentage = Math.round((correctCount / questions.length) * 100)

    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <IconClipboard className={`w-16 h-16 mx-auto ${percentage >= 70 ? 'text-green-400' : 'text-red-400'}`} />
        <h2 className="text-2xl font-bold text-slate-100">Sinav Pratigi Tamamlandi!</h2>
        <div className="text-5xl font-bold">
          <span className={percentage >= 70 ? 'text-green-400' : percentage >= 50 ? 'text-amber-400' : 'text-red-400'}>
            %{percentage}
          </span>
        </div>
        <p className="text-slate-400">{questions.length} sorudan {correctCount} dogru</p>
        <button
          onClick={() => {
            setQuestions(shuffleArray(chapter.examQuestions || []))
            setCurrentIndex(0)
            setUserAnswer('')
            setSubmitted(false)
            setShowSolution(false)
            setSelfScore(null)
            setScores([])
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <IconClipboard className="w-5 h-5 text-red-400" />
          Sinav Pratigi
        </h2>
        <span className="text-sm text-slate-500">Soru {currentIndex + 1} / {questions.length}</span>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question type badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          currentQ.type === 'calculation' ? 'bg-blue-500/20 text-blue-400' :
          currentQ.type === 'truefalse' ? 'bg-purple-500/20 text-purple-400' :
          currentQ.type === 'algorithm' ? 'bg-green-500/20 text-green-400' :
          currentQ.type === 'table' ? 'bg-amber-500/20 text-amber-400' :
          'bg-slate-700 text-slate-400'
        }`}>
          {currentQ.type === 'calculation' ? 'Hesaplama' :
           currentQ.type === 'truefalse' ? 'Dogru/Yanlis' :
           currentQ.type === 'algorithm' ? 'Algoritma Tamamlama' :
           currentQ.type === 'table' ? 'Tablo Doldurma' :
           currentQ.type === 'shortanswer' ? 'Kisa Cevap' :
           'Soru'}
        </span>
        {currentQ.points && (
          <span className="text-xs text-slate-600">({currentQ.points} puan)</span>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-surface rounded-2xl border border-slate-800/50 p-6 space-y-5">
        {/* Question text */}
        <p className="text-base text-slate-200 leading-relaxed font-medium">
          {currentQ.question}
        </p>

        {/* Context/data if provided */}
        {currentQ.context && (
          <pre className="text-xs font-mono text-primary-light bg-slate-800/50 p-4 rounded-lg overflow-x-auto whitespace-pre">
            {currentQ.context}
          </pre>
        )}

        {/* True/False buttons */}
        {currentQ.type === 'truefalse' && !submitted && (
          <div className="flex gap-3">
            <button
              onClick={() => { setUserAnswer('true'); handleSubmit() }}
              className="flex-1 py-3 rounded-xl bg-green-500/10 text-green-400 font-semibold hover:bg-green-500/20 transition-colors"
            >
              Dogru (True)
            </button>
            <button
              onClick={() => { setUserAnswer('false'); handleSubmit() }}
              className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-colors"
            >
              Yanlis (False)
            </button>
          </div>
        )}

        {/* Text answer area for other types */}
        {currentQ.type !== 'truefalse' && !submitted && (
          <div className="space-y-3">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Cevabini buraya yaz... (hesaplama adimlarini goster)"
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-primary focus:outline-none text-sm font-mono resize-y"
            />
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="w-full py-2.5 rounded-xl bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-colors text-sm disabled:opacity-30"
            >
              Cevabimi Goster ve Kontrol Et
            </button>
          </div>
        )}

        {/* Solution */}
        {showSolution && (
          <div className="space-y-4 animate-slide-in-right">
            {/* Model answer */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1">
                <IconLightbulb className="w-3.5 h-3.5" /> Model Cevap (Solution):
              </p>
              <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                {currentQ.solution}
              </pre>
            </div>

            {/* Step-by-step if available */}
            {currentQ.steps && (
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <p className="text-xs font-semibold text-green-400 mb-2">Adim Adim Cozum:</p>
                <div className="space-y-2">
                  {currentQ.steps.map((step, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-green-500 font-mono text-xs mt-0.5">{i + 1}.</span>
                      <span className="text-slate-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Self-scoring */}
            {selfScore === null && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-sm text-slate-400 mb-3">Cevabini model cevapla karsilastir. Dogru mu?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSelfScore(true)}
                    className="flex-1 py-2 rounded-lg bg-green-500/10 text-green-400 font-semibold hover:bg-green-500/20 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <IconCheckCircle className="w-4 h-4" /> Dogru Bildim
                  </button>
                  <button
                    onClick={() => handleSelfScore(false)}
                    className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <IconXCircle className="w-4 h-4" /> Yanlis/Eksik
                  </button>
                </div>
              </div>
            )}

            {/* Next button */}
            {selfScore !== null && (
              <button
                onClick={nextQuestion}
                className="w-full py-2.5 rounded-xl bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-colors text-sm"
              >
                {currentIndex < questions.length - 1 ? 'Sonraki Soru \u2192' : 'Sonuclari Gor'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
