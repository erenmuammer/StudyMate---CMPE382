import { useParams } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { useGameState } from '../../hooks/useGameState'
import { XP_VALUES } from '../../utils/constants'
import { shuffleArray } from '../../utils/xpCalculator'
import { IconCards, IconParty, IconSmile, IconMeh, IconFrown } from '../Icons'

export default function FlashcardView() {
  const { chapterId } = useParams()
  const [chapter, setChapter] = useState(null)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [completed, setCompleted] = useState(new Set())
  const [ratings, setRatings] = useState({})
  const { updateChapterProgress } = useProgress()
  const { addXp } = useGameState()

  useEffect(() => {
    const map = { ch1: 'ch1-introduction', ch2: 'ch2-os-structures', ch3: 'ch3-processes', ch4: 'ch4-threads', ch5: 'ch5-scheduling', ch6: 'ch6-synchronization', ch7: 'ch7-deadlock', ch8: 'ch8-memory' }
    import(`../../data/chapters/${map[chapterId] || chapterId}.json`)
      .then(mod => {
        setChapter(mod.default)
        setCards(shuffleArray(mod.default.flashcards || []))
      })
      .catch(() => setChapter(null))
  }, [chapterId])

  const currentCard = cards[currentIndex]

  const handleRate = useCallback((difficulty) => {
    if (!currentCard) return
    const xpMap = { easy: XP_VALUES.FLASHCARD_EASY, medium: XP_VALUES.FLASHCARD_MEDIUM, hard: XP_VALUES.FLASHCARD_HARD }
    addXp(xpMap[difficulty] || 5)
    setRatings(prev => ({ ...prev, [currentCard.id]: difficulty }))
    setCompleted(prev => new Set([...prev, currentCard.id]))

    setFlipped(false)
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1)
      }
    }, 200)
  }, [currentCard, currentIndex, cards.length, addXp])

  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f) }
      if (e.code === 'ArrowRight' && currentIndex < cards.length - 1) { setFlipped(false); setCurrentIndex(i => i + 1) }
      if (e.code === 'ArrowLeft' && currentIndex > 0) { setFlipped(false); setCurrentIndex(i => i - 1) }
      if (flipped && e.key === '1') handleRate('easy')
      if (flipped && e.key === '2') handleRate('medium')
      if (flipped && e.key === '3') handleRate('hard')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentIndex, cards.length, flipped, handleRate])

  useEffect(() => {
    if (completed.size > 0) {
      updateChapterProgress(chapterId, { flashcardsCompleted: completed.size, flashcardsDifficulty: ratings })
    }
  }, [completed.size, chapterId, ratings, updateChapterProgress])

  if (!chapter || cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <IconCards className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400">Bu bolumun flashcard'lari henuz hazir degil...</p>
        </div>
      </div>
    )
  }

  if (completed.size === cards.length) {
    const easyCount = Object.values(ratings).filter(r => r === 'easy').length
    const mediumCount = Object.values(ratings).filter(r => r === 'medium').length
    const hardCount = Object.values(ratings).filter(r => r === 'hard').length

    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <IconParty className="w-16 h-16 text-primary mx-auto" />
        <h2 className="text-2xl font-bold text-slate-100">Tebrikler!</h2>
        <p className="text-slate-400">{cards.length} kart tamamlandi</p>
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{easyCount}</p>
            <p className="text-xs text-slate-500">Kolay</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{mediumCount}</p>
            <p className="text-xs text-slate-500">Orta</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{hardCount}</p>
            <p className="text-xs text-slate-500">Zor</p>
          </div>
        </div>
        <button
          onClick={() => {
            setCards(shuffleArray(chapter.flashcards || []))
            setCurrentIndex(0)
            setFlipped(false)
            setCompleted(new Set())
            setRatings({})
          }}
          className="px-6 py-2.5 rounded-xl bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-colors"
        >
          Tekrar Calis
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Flashcard'lar</h2>
        <span className="text-sm text-slate-500">{currentIndex + 1} / {cards.length}</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      <div className="perspective-1000 cursor-pointer" onClick={() => setFlipped(!flipped)}>
        <div className={`relative w-full h-72 preserve-3d transition-transform duration-500 ${flipped ? 'rotate-y-180' : ''}`}>
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-surface to-surface-light rounded-2xl border border-slate-700 p-8 flex flex-col items-center justify-center">
            <p className="text-xs text-slate-500 mb-4">Soru (Question)</p>
            <p className="text-lg text-slate-200 text-center leading-relaxed font-medium">
              {currentCard.front}
            </p>
            <p className="text-xs text-slate-600 mt-6">Cevirmek icin tikla veya Space bas</p>
          </div>
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl border border-primary/30 p-8 flex flex-col items-center justify-center">
            <p className="text-xs text-primary mb-4">Cevap (Answer)</p>
            <p className="text-sm text-slate-200 text-center leading-relaxed">
              {currentCard.back}
            </p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex justify-center gap-3 animate-bounce-in">
          <button
            onClick={() => handleRate('easy')}
            className="px-5 py-2.5 rounded-xl bg-green-500/10 text-green-400 font-semibold hover:bg-green-500/20 transition-colors text-sm flex items-center gap-1.5"
          >
            <IconSmile className="w-4 h-4" /> Kolay (1)
          </button>
          <button
            onClick={() => handleRate('medium')}
            className="px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 font-semibold hover:bg-amber-500/20 transition-colors text-sm flex items-center gap-1.5"
          >
            <IconMeh className="w-4 h-4" /> Orta (2)
          </button>
          <button
            onClick={() => handleRate('hard')}
            className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-colors text-sm flex items-center gap-1.5"
          >
            <IconFrown className="w-4 h-4" /> Zor (3)
          </button>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => { setFlipped(false); setCurrentIndex(Math.max(0, currentIndex - 1)) }}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-lg bg-surface text-slate-400 hover:text-slate-200 text-sm disabled:opacity-30 transition-colors"
        >
          {'\u2190'} Onceki
        </button>
        <button
          onClick={() => { setFlipped(false); setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1)) }}
          disabled={currentIndex === cards.length - 1}
          className="px-4 py-2 rounded-lg bg-surface text-slate-400 hover:text-slate-200 text-sm disabled:opacity-30 transition-colors"
        >
          Sonraki {'\u2192'}
        </button>
      </div>

      <div className="text-center text-xs text-slate-600 space-x-4">
        <span>Space: Cevir</span>
        <span>{'\u2190\u2192'}: Gecis</span>
        <span>1/2/3: Derecelendir</span>
      </div>
    </div>
  )
}
