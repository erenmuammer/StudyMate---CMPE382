import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameStateProvider } from './hooks/useGameState'
import { ProgressProvider } from './hooks/useProgress'
import Layout from './components/layout/Layout'
import Dashboard from './components/dashboard/Dashboard'
import SummaryView from './components/summary/SummaryView'
import FlashcardView from './components/flashcards/FlashcardView'
import QuizView from './components/quiz/QuizView'
import FillBlankView from './components/fillblank/FillBlankView'
import ExamPracticeView from './components/exam/ExamPracticeView'
import PastExamsView from './components/pastexams/PastExamsView'

function App() {
  return (
    <GameStateProvider>
      <ProgressProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="chapter/:chapterId/summary" element={<SummaryView />} />
              <Route path="chapter/:chapterId/cards" element={<FlashcardView />} />
              <Route path="chapter/:chapterId/quiz" element={<QuizView />} />
              <Route path="chapter/:chapterId/fill" element={<FillBlankView />} />
              <Route path="chapter/:chapterId/exam" element={<ExamPracticeView />} />
              <Route path="past-exams" element={<PastExamsView />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </GameStateProvider>
  )
}

export default App
