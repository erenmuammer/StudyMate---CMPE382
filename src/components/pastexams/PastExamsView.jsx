import { useState } from 'react'
import pastExamsData from '../../data/past-exams.json'
import { IconClipboard, IconCheck } from '../Icons'

export default function PastExamsView() {
  const [openExam, setOpenExam] = useState(pastExamsData.exams[0]?.id || null)
  const [openAnswers, setOpenAnswers] = useState({})

  const toggleAnswer = (questionId) => {
    setOpenAnswers(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <IconClipboard className="w-7 h-7 text-red-400" />
          Cikmis Sinav Sorulari
        </h1>
        <p className="text-sm text-slate-500">Gercek sinav sorulari ve cozumleri. Soruya tiklayarak cevabi gorebilirsin.</p>
      </div>

      {pastExamsData.exams.map(exam => (
        <div key={exam.id} className="bg-surface rounded-xl border border-slate-800/50 overflow-hidden">
          {/* Exam header */}
          <button
            onClick={() => setOpenExam(openExam === exam.id ? null : exam.id)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-light/30 transition-colors"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-200">{exam.title}</h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span>{exam.date}</span>
                <span>{exam.duration}</span>
                <span>{exam.totalMarks} puan</span>
              </div>
            </div>
            <span className={`text-slate-500 transition-transform duration-200 ${openExam === exam.id ? 'rotate-90' : ''}`}>
              {'\u25B6'}
            </span>
          </button>

          {/* Exam content */}
          {openExam === exam.id && (
            <div className="border-t border-slate-800">
              {exam.note && (
                <div className="px-6 py-2 bg-amber-500/5 border-b border-slate-800">
                  <p className="text-xs text-amber-400">{exam.note}</p>
                </div>
              )}

              {exam.sections.map((section, sIdx) => (
                <div key={sIdx} className="border-b border-slate-800 last:border-b-0">
                  {/* Section header */}
                  <div className="px-6 py-3 bg-slate-800/30">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-primary">{section.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{section.chapter}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{section.points} puan</span>
                      </div>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="divide-y divide-slate-800/50">
                    {section.questions.map((q, qIdx) => (
                      <div key={q.id} className="group">
                        {/* Question */}
                        <button
                          onClick={() => toggleAnswer(q.id)}
                          className="w-full text-left px-6 py-4 hover:bg-slate-800/20 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-mono text-slate-600 mt-1 flex-shrink-0">
                              {sIdx + 1}.{qIdx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                                {q.question}
                              </p>
                              {q.code && (
                                <pre className="mt-2 p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-green-300 overflow-x-auto">
                                  {q.code}
                                </pre>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  q.type === 'calculation' ? 'bg-blue-500/10 text-blue-400' :
                                  q.type === 'truefalse' ? 'bg-purple-500/10 text-purple-400' :
                                  q.type === 'algorithm' ? 'bg-green-500/10 text-green-400' :
                                  'bg-slate-700 text-slate-400'
                                }`}>
                                  {q.type === 'calculation' ? 'Hesaplama' :
                                   q.type === 'truefalse' ? 'Dogru/Yanlis' :
                                   q.type === 'algorithm' ? 'Algoritma' :
                                   'Kisa Cevap'}
                                </span>
                                <span className="text-xs text-slate-600">{q.points} puan</span>
                                <span className="text-xs text-primary/50 ml-auto">
                                  {openAnswers[q.id] ? 'Cevabi gizle' : 'Cevabi goster'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Answer */}
                        {openAnswers[q.id] && (
                          <div className="px-6 pb-4 animate-slide-in-right">
                            <div className="ml-7 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                              <div className="flex items-center gap-1.5 mb-2">
                                <IconCheck className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-semibold text-green-400">Model Cevap:</span>
                              </div>
                              <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                                {q.answer}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
