import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { useGameState } from '../../hooks/useGameState'
import { XP_VALUES } from '../../utils/constants'
import { IconBook, IconLightbulb, IconTarget, IconWarning, IconCheck, IconCheckCircle } from '../Icons'

export default function SummaryView() {
  const { chapterId } = useParams()
  const [chapter, setChapter] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const { getChapterProgress, updateChapterProgress } = useProgress()
  const { addXp } = useGameState()
  const [readSections, setReadSections] = useState(new Set())
  const sectionRefs = useRef({})

  useEffect(() => {
    import(`../../data/chapters/${getDataFile(chapterId)}.json`)
      .then(mod => setChapter(mod.default))
      .catch(() => setChapter(null))
  }, [chapterId])

  function getDataFile(id) {
    const map = {
      ch1: 'ch1-introduction',
      ch2: 'ch2-os-structures',
      ch3: 'ch3-processes',
      ch4: 'ch4-threads',
      ch6: 'ch6-synchronization',
      sup1: 'supplement-linux-cli',
    }
    return map[id] || id
  }

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
    if (!readSections.has(sectionId)) {
      setReadSections(prev => new Set([...prev, sectionId]))
      addXp(XP_VALUES.SUMMARY_SECTION)
    }
  }

  const markComplete = () => {
    updateChapterProgress(chapterId, { summaryRead: true })
    addXp(XP_VALUES.CHAPTER_COMPLETE)
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <IconBook className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400">Bu bolumun icerigi henuz hazir degil...</p>
          <p className="text-sm text-slate-600">Icerik yaklasik olarak hazirlanmaktadir.</p>
        </div>
      </div>
    )
  }

  const progress = getChapterProgress(chapterId)
  const totalSections = chapter.sections?.length || 0
  const readCount = readSections.size

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">
          <span className="text-primary/60 font-mono text-lg mr-2">{chapterId.replace('ch', 'Ch')}</span>
          {chapter.title}
        </h1>
        {chapter.titleEn && (
          <p className="text-sm text-slate-500">Chapter {chapterId.replace('ch', '')}: {chapter.titleEn}</p>
        )}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${totalSections > 0 ? (readCount / totalSections) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{readCount}/{totalSections} bolum</span>
        </div>
      </div>

      <div className="space-y-3">
        {chapter.sections?.map((section, idx) => (
          <div
            key={section.id || idx}
            ref={el => sectionRefs.current[section.id] = el}
            className="bg-surface rounded-xl border border-slate-800/50 overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggleSection(section.id || `s${idx}`)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-light/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg transition-transform duration-200 ${openSections[section.id || `s${idx}`] ? 'rotate-90' : ''}`}>
                  {'\u25B6'}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm">{section.title}</h3>
                  {section.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">{section.subtitle}</p>
                  )}
                </div>
              </div>
              {readSections.has(section.id || `s${idx}`) && (
                <IconCheck className="w-4 h-4 text-green-400" />
              )}
            </button>

            {openSections[section.id || `s${idx}`] && (
              <div className="px-5 pb-5 space-y-4 animate-slide-in-right">
                {section.content?.map((block, bIdx) => (
                  <ContentBlock key={bIdx} block={block} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!progress.summaryRead && readCount === totalSections && totalSections > 0 && (
        <button
          onClick={markComplete}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-dark to-primary text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <IconCheckCircle className="w-5 h-5" /> Konu ozetini tamamla (+{XP_VALUES.CHAPTER_COMPLETE} XP)
        </button>
      )}
      {progress.summaryRead && (
        <div className="text-center py-3 text-green-400 text-sm flex items-center justify-center gap-2">
          <IconCheckCircle className="w-4 h-4" /> Bu bolumun konu ozetini tamamladin!
        </div>
      )}
    </div>
  )
}

function ContentBlock({ block }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-slate-300 text-sm leading-relaxed">{block.text}</p>

    case 'keypoint':
      return (
        <div className="flex gap-3 p-3 rounded-lg bg-primary/5 border-l-3 border-primary">
          <span className="text-primary mt-0.5"><IconLightbulb className="w-4 h-4" /></span>
          <p className="text-sm text-primary-light leading-relaxed">{block.text}</p>
        </div>
      )

    case 'analogy':
      return (
        <div className="flex gap-3 p-3 rounded-lg bg-purple-500/5 border-l-3 border-purple-500">
          <span className="text-purple-400 mt-0.5"><IconTarget className="w-4 h-4" /></span>
          <div>
            <p className="text-xs text-purple-400 font-semibold mb-1">Benzetme (Analogy)</p>
            <p className="text-sm text-slate-300 leading-relaxed">{block.text}</p>
          </div>
        </div>
      )

    case 'warning':
      return (
        <div className="flex gap-3 p-3 rounded-lg bg-red-500/5 border-l-3 border-red-500">
          <span className="text-red-400 mt-0.5"><IconWarning className="w-4 h-4" /></span>
          <p className="text-sm text-red-300 leading-relaxed">{block.text}</p>
        </div>
      )

    case 'diagram':
      return (
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          {block.src ? (
            <img src={block.src} alt={block.alt || ''} className="max-w-full mx-auto" />
          ) : block.ascii ? (
            <pre className="text-xs text-primary-light font-mono whitespace-pre overflow-x-auto">{block.ascii}</pre>
          ) : null}
          {block.caption && (
            <p className="text-xs text-slate-500 text-center mt-2">{block.caption}</p>
          )}
        </div>
      )

    case 'code':
      return (
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs text-slate-500">{block.language || 'code'}</span>
          </div>
          <pre className="p-4 text-xs font-mono text-green-300 bg-slate-900 overflow-x-auto leading-relaxed">
            <code>{block.code}</code>
          </pre>
          {block.caption && (
            <p className="px-3 py-2 text-xs text-slate-500 bg-slate-800/50">{block.caption}</p>
          )}
        </div>
      )

    case 'list':
      return (
        <ul className="space-y-1.5 pl-4">
          {block.items?.map((item, i) => (
            <li key={i} className="text-sm text-slate-300 leading-relaxed list-disc">
              {item}
            </li>
          ))}
        </ul>
      )

    case 'heading':
      return <h4 className="text-base font-semibold text-slate-200 mt-2">{block.text}</h4>

    default:
      return <p className="text-sm text-slate-400">{block.text || ''}</p>
  }
}
