import { useState } from 'react';
import { cn } from '../utils/cn';
import { useApp } from '../context/AppContext';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const sampleQuizzes = [
  { id: '1', title: 'Algebra Basics', subject: 'Mathematics', grade: 7, questions: 10, duration: 15, points: 100, completed: true, score: 85 },
  { id: '2', title: 'Plant Cells & Tissues', subject: 'Science', grade: 7, questions: 15, duration: 20, points: 150, completed: false },
  { id: '3', title: 'Kiswahili Grammar', subject: 'Kiswahili', grade: 7, questions: 12, duration: 18, points: 120, completed: true, score: 92 },
  { id: '4', title: 'Kenya History', subject: 'Social Studies', grade: 7, questions: 10, duration: 15, points: 100, completed: false },
  { id: '5', title: 'English Comprehension', subject: 'English', grade: 7, questions: 8, duration: 25, points: 80, completed: true, score: 78 },
  { id: '6', title: 'Digital Skills', subject: 'Computer Science', grade: 7, questions: 12, duration: 20, points: 120, completed: false },
];

const mathQuizQuestions: QuizQuestion[] = [
  {
    question: "What is 15 + 27?",
    options: ["40", "42", "44", "38"],
    correct: 1,
    explanation: "15 + 27 = 42. Add the ones (5+7=12, carry 1) then add tens (1+2+1=4)."
  },
  {
    question: "Solve: 3x = 15. What is x?",
    options: ["3", "5", "12", "18"],
    correct: 1,
    explanation: "Divide both sides by 3: x = 15 ÷ 3 = 5"
  },
  {
    question: "What is the area of a rectangle with length 8cm and width 5cm?",
    options: ["13 cm²", "26 cm²", "40 cm²", "45 cm²"],
    correct: 2,
    explanation: "Area = length × width = 8 × 5 = 40 cm²"
  },
];

export function Quizzes() {
  const { student } = useApp();
  const [selectedQuiz, setSelectedQuiz] = useState<typeof sampleQuizzes[0] | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);
      
      if (selectedAnswer === mathQuizQuestions[currentQuestion].correct) {
        setScore(score + 1);
      }

      if (currentQuestion < mathQuizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }
  };

  const handleClose = () => {
    setSelectedQuiz(null);
    setQuizStarted(false);
    setShowResult(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🎮 Gamified Quizzes</h1>
          <p className="text-slate-500">Test your knowledge and earn points!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl">
            <span className="text-xl">⭐</span>
            <span className="font-bold">{student.points} pts</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl">
            <span className="text-xl">🔥</span>
            <span className="font-bold">{student.streak} day streak</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <p className="text-3xl font-bold">23</p>
          <p className="text-green-100">Quizzes Completed</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
          <p className="text-3xl font-bold">87%</p>
          <p className="text-blue-100">Average Score</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-5 text-white">
          <p className="text-3xl font-bold">12</p>
          <p className="text-purple-100">Badges Earned</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white">
          <p className="text-3xl font-bold">#5</p>
          <p className="text-orange-100">Class Rank</p>
        </div>
      </div>

      {/* Leaderboard & Quizzes */}
      <div className="grid grid-cols-3 gap-6">
        {/* Quizzes List */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Available Quizzes</h2>
          <div className="grid grid-cols-2 gap-4">
            {sampleQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => setSelectedQuiz(quiz)}
                className={cn(
                  "bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer",
                  quiz.completed && "border-green-200 bg-green-50/50"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                      quiz.completed ? "bg-green-100" : "bg-blue-100"
                    )}>
                      {quiz.subject === 'Mathematics' && '🧮'}
                      {quiz.subject === 'Science' && '🔬'}
                      {quiz.subject === 'Kiswahili' && '🗣️'}
                      {quiz.subject === 'Social Studies' && '🌍'}
                      {quiz.subject === 'English' && '📖'}
                      {quiz.subject === 'Computer Science' && '💻'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{quiz.title}</h3>
                      <p className="text-sm text-slate-500">{quiz.subject}</p>
                    </div>
                  </div>
                  {quiz.completed && (
                    <span className="text-green-600 text-xl">✓</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>📝 {quiz.questions} Q</span>
                  <span>⏱️ {quiz.duration} min</span>
                  <span>⭐ {quiz.points} pts</span>
                </div>
                
                {quiz.completed && quiz.score && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Your Score</span>
                      <span className={cn(
                        "font-bold",
                        quiz.score >= 80 ? "text-green-600" : quiz.score >= 60 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {quiz.score}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4">🏆 Class Leaderboard</h2>
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Wanjiku Njeri', score: 2890, avatar: 'W' },
              { rank: 2, name: 'Brian Ochieng', score: 2750, avatar: 'B' },
              { rank: 3, name: 'Faith Muthoni', score: 2680, avatar: 'F' },
              { rank: 4, name: 'Kevin Kimani', score: 2550, avatar: 'K' },
              { rank: 5, name: 'Amani Wanjiku', score: 2450, avatar: 'A', isYou: true },
            ].map((player) => (
              <div 
                key={player.rank}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl",
                  player.isYou ? "bg-green-100 border border-green-200" : "bg-slate-50"
                )}
              >
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  player.rank === 1 && "bg-yellow-400 text-yellow-900",
                  player.rank === 2 && "bg-slate-300 text-slate-700",
                  player.rank === 3 && "bg-orange-400 text-orange-900",
                  player.rank > 3 && "bg-slate-200 text-slate-600"
                )}>
                  {player.rank}
                </span>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                  player.isYou ? "bg-green-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
                )}>
                  {player.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm">
                    {player.name} {player.isYou && <span className="text-green-600">(You)</span>}
                  </p>
                  <p className="text-xs text-slate-500">{player.score.toLocaleString()} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {selectedQuiz && !quizStarted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl mb-4">
              🧮
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedQuiz.title}</h2>
            <p className="text-slate-500 mb-6">{selectedQuiz.subject} • Grade {selectedQuiz.grade}</p>
            
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{selectedQuiz.questions}</p>
                <p className="text-sm text-slate-500">Questions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{selectedQuiz.duration}</p>
                <p className="text-sm text-slate-500">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{selectedQuiz.points}</p>
                <p className="text-sm text-slate-500">Points</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={handleClose} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium">
                Cancel
              </button>
              <button onClick={handleStartQuiz} className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium">
                Start Quiz 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Quiz */}
      {selectedQuiz && quizStarted && !showResult && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl mx-4">
            {/* Progress */}
            <div className="flex items-center justify-between mb-6 text-white">
              <span>Question {currentQuestion + 1} of {mathQuizQuestions.length}</span>
              <div className="flex items-center gap-2">
                <span>⭐ {score * 10} pts</span>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full mb-8">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / mathQuizQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                {mathQuizQuestions[currentQuestion].question}
              </h2>
              
              <div className="space-y-3">
                {mathQuizQuestions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={cn(
                      "w-full p-4 rounded-xl text-left font-medium transition-all flex items-center gap-3",
                      selectedAnswer === idx
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    <span className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      selectedAnswer === idx ? "bg-white text-blue-600" : "bg-slate-200"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className={cn(
                  "w-full py-4 rounded-xl font-bold mt-6 transition-all",
                  selectedAnswer !== null
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                {currentQuestion === mathQuizQuestions.length - 1 ? "Finish Quiz" : "Next Question"} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {showResult && (
        <div className="fixed inset-0 bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="text-8xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
            <p className="text-green-100 mb-8">Great job on finishing the quiz!</p>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <p className="text-6xl font-bold mb-2">{Math.round((score / mathQuizQuestions.length) * 100)}%</p>
              <p className="text-green-100">You got {score} out of {mathQuizQuestions.length} correct</p>
              <p className="text-yellow-300 text-xl mt-4">+{score * 10} points earned! ⭐</p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button onClick={handleClose} className="px-8 py-3 bg-white text-green-700 rounded-xl font-bold">
                Back to Quizzes
              </button>
              <button onClick={handleStartQuiz} className="px-8 py-3 bg-white/20 text-white rounded-xl font-bold">
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
