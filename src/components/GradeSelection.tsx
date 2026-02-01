import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { Grade } from '../types';

interface GradeLevel {
  id: string;
  name: string;
  subtitle: string;
  grades: Grade[];
  icon: string;
  color: string;
  bgGradient: string;
  description: string;
  features: string[];
}

const gradeLevels: GradeLevel[] = [
  {
    id: 'upper-primary',
    name: 'Upper Primary',
    subtitle: 'Grades 4-6',
    grades: [4, 5, 6],
    icon: '🌱',
    color: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50',
    description: 'Building strong foundations in literacy, numeracy, and core competencies',
    features: ['Interactive Learning Games', 'Picture-Based Lessons', 'Basic STEM Activities', 'Indigenous Languages']
  },
  {
    id: 'junior-secondary',
    name: 'Junior Secondary',
    subtitle: 'Grades 7-9',
    grades: [7, 8, 9],
    icon: '📚',
    color: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    description: 'Exploring subjects deeply and developing critical thinking skills',
    features: ['Virtual STEM Labs', 'Essay Writing Tools', 'Community Service Projects', 'Career Exploration']
  },
  {
    id: 'senior-school',
    name: 'Senior School',
    subtitle: 'Grades 10-12',
    grades: [10, 11, 12],
    icon: '🎓',
    color: 'from-purple-500 to-violet-600',
    bgGradient: 'from-purple-50 to-violet-50',
    description: 'Preparing for higher education and professional pathways',
    features: ['Advanced STEM Labs', 'Research Projects', 'University Prep', 'Internship Tracking']
  }
];

export function GradeSelection() {
  const { selectGrade } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<GradeLevel | null>(null);
  const [hoveredGrade, setHoveredGrade] = useState<Grade | null>(null);

  const handleGradeSelect = (grade: Grade) => {
    selectGrade(grade);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 via-yellow-500 to-red-500 flex items-center justify-center text-3xl shadow-lg">
            📚
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 bg-clip-text text-transparent">
              Elimu Plus
            </h1>
            <p className="text-slate-400 text-sm">CBC Learning Companion</p>
          </div>
        </div>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Kenya's Premier Competency-Based Curriculum Learning Platform
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">🇰🇪 Made for Kenya</span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">📚 KICD Aligned</span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">🎓 All Grades</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {!selectedLevel ? (
          <>
            <h2 className="text-3xl font-bold text-white mb-2">Choose Your Level</h2>
            <p className="text-slate-400 mb-8">Select your education level to get started</p>

            <div className="grid grid-cols-3 gap-6 max-w-5xl w-full">
              {gradeLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level)}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-left hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                  {/* Gradient overlay on hover */}
                  <div className={cn(
                    "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br",
                    level.color
                  )} style={{ opacity: 0.05 }} />
                  
                  <div className="relative">
                    {/* Icon */}
                    <div className={cn(
                      "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform",
                      level.color
                    )}>
                      {level.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-1">{level.name}</h3>
                    <p className={cn("text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent mb-3", level.color)}>
                      {level.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-slate-400 text-sm mb-4">{level.description}</p>

                    {/* Features */}
                    <div className="space-y-2">
                      {level.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                          <span className="text-green-400">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Back button */}
            <button
              onClick={() => setSelectedLevel(null)}
              className="absolute top-4 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">←</span>
              <span>Back to Levels</span>
            </button>

            {/* Selected Level Header */}
            <div className="text-center mb-8">
              <div className={cn(
                "w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center text-5xl mb-4 mx-auto shadow-2xl",
                selectedLevel.color
              )}>
                {selectedLevel.icon}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{selectedLevel.name}</h2>
              <p className="text-slate-400">Select your grade to continue</p>
            </div>

            {/* Grade Selection */}
            <div className="flex gap-6">
              {selectedLevel.grades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeSelect(grade)}
                  onMouseEnter={() => setHoveredGrade(grade)}
                  onMouseLeave={() => setHoveredGrade(null)}
                  className={cn(
                    "relative w-40 h-48 rounded-3xl border-2 transition-all duration-300 overflow-hidden group",
                    hoveredGrade === grade
                      ? "border-white scale-105 shadow-2xl"
                      : "border-white/20 hover:border-white/40"
                  )}
                >
                  {/* Background gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity",
                    selectedLevel.color
                  )} />
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-4">
                    <span className="text-6xl font-bold text-white mb-2">{grade}</span>
                    <span className="text-slate-300 text-lg">Grade</span>
                    
                    {/* Hover effect */}
                    <div className={cn(
                      "absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium text-white transition-all",
                      hoveredGrade === grade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                      `bg-gradient-to-r ${selectedLevel.color}`
                    )}>
                      Start Learning →
                    </div>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Level Features */}
            <div className={cn("mt-12 p-6 rounded-2xl max-w-2xl border border-white/10", `bg-gradient-to-r ${selectedLevel.bgGradient}`)}>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span>✨</span> What you'll get in {selectedLevel.name}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedLevel.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-green-600 text-xs">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center border-t border-white/10">
        <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
          <span>🇰🇪 Republic of Kenya</span>
          <span>•</span>
          <span>Aligned with KICD Curriculum</span>
          <span>•</span>
          <span>Kenya Education Cloud Partner</span>
        </div>
      </footer>
    </div>
  );
}
