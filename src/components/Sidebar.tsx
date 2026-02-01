import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

type AppView = 'dashboard' | 'portfolio' | 'competencies' | 'quizzes' | 'lessons' | 'labs' | 'languages' | 'community' | 'offline' | 'voice-notes' | 'settings';

const menuItems: { id: AppView; label: string; icon: string; color: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', color: 'from-green-500 to-emerald-600' },
  { id: 'portfolio', label: 'Portfolio & Evidence', icon: '📁', color: 'from-blue-500 to-indigo-600' },
  { id: 'competencies', label: 'Competency Radar', icon: '🎯', color: 'from-purple-500 to-violet-600' },
  { id: 'quizzes', label: 'Gamified Quizzes', icon: '🎮', color: 'from-orange-500 to-red-500' },
  { id: 'lessons', label: 'KICD Video Lessons', icon: '🎬', color: 'from-red-500 to-pink-600' },
  { id: 'labs', label: 'Virtual Labs (STEM)', icon: '🔬', color: 'from-cyan-500 to-blue-600' },
  { id: 'languages', label: 'Indigenous Languages', icon: '🗣️', color: 'from-amber-500 to-orange-600' },
  { id: 'community', label: 'Community Service', icon: '🤝', color: 'from-teal-500 to-green-600' },
  { id: 'offline', label: 'Offline Content', icon: '📥', color: 'from-gray-500 to-slate-600' },
  { id: 'voice-notes', label: 'Voice to Text', icon: '🎤', color: 'from-pink-500 to-rose-600' },
  { id: 'settings', label: 'Settings', icon: '⚙️', color: 'from-slate-500 to-slate-700' },
];

export function Sidebar() {
  const { 
    currentView, 
    setCurrentView, 
    student, 
    isOffline, 
    toggleOffline, 
    parentMode, 
    toggleParentMode,
    resetGradeSelection,
    grade 
  } = useApp();

  const getLevelName = () => {
    if (grade <= 6) return 'Upper Primary';
    if (grade <= 9) return 'Junior Secondary';
    return 'Senior School';
  };

  const getLevelColor = () => {
    if (grade <= 6) return 'from-green-500 to-emerald-600';
    if (grade <= 9) return 'from-blue-500 to-indigo-600';
    return 'from-purple-500 to-violet-600';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl z-40">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 via-yellow-500 to-red-500 flex items-center justify-center text-2xl shadow-lg">
            📚
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 bg-clip-text text-transparent">
              Elimu Plus
            </h1>
            <p className="text-xs text-slate-400">CBC Learning Companion</p>
          </div>
        </div>
      </div>

      {/* Grade Level Indicator */}
      <div className="px-4 pt-4">
        <button
          onClick={resetGradeSelection}
          className={cn(
            "w-full p-3 rounded-xl bg-gradient-to-r text-white text-left transition-all hover:shadow-lg group",
            getLevelColor()
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">Currently in</p>
              <p className="font-bold">Grade {grade} • {getLevelName()}</p>
            </div>
            <span className="text-white/70 group-hover:text-white transition-colors">
              ↻
            </span>
          </div>
        </button>
      </div>

      {/* Student Profile Mini */}
      <div className="p-4 mx-4 mt-4 rounded-xl bg-gradient-to-r from-slate-700/50 to-slate-600/30 border border-slate-600/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-lg font-bold">
            {student.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{student.name}</p>
            <p className="text-xs text-slate-400">Level {student.level} • {student.points} pts</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 bg-slate-600/50 rounded-full h-2">
            <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: '65%' }} />
          </div>
          <span className="text-xs text-orange-400">🔥 {student.streak}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 hide-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              currentView === item.id
                ? `bg-gradient-to-r ${item.color} shadow-lg shadow-slate-900/50`
                : "hover:bg-slate-700/50 text-slate-300 hover:text-white"
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
            {currentView === item.id && (
              <span className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-700/50 space-y-2">
        {/* Offline Toggle */}
        <button
          onClick={toggleOffline}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
            isOffline ? "bg-amber-500/20 text-amber-400" : "bg-slate-700/30 text-slate-400 hover:text-slate-300"
          )}
        >
          <span className="flex items-center gap-2 text-sm">
            {isOffline ? '📴' : '🌐'} {isOffline ? 'Offline Mode' : 'Online Mode'}
          </span>
          <div className={cn(
            "w-10 h-5 rounded-full transition-all",
            isOffline ? "bg-amber-500" : "bg-slate-600"
          )}>
            <div className={cn(
              "w-4 h-4 rounded-full bg-white mt-0.5 transition-all",
              isOffline ? "ml-5" : "ml-0.5"
            )} />
          </div>
        </button>

        {/* Parent/Teacher Mode */}
        <button
          onClick={toggleParentMode}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
            parentMode ? "bg-purple-500/20 text-purple-400" : "bg-slate-700/30 text-slate-400 hover:text-slate-300"
          )}
        >
          <span className="flex items-center gap-2 text-sm">
            👨‍👩‍👧 Parent/Teacher Portal
          </span>
          {parentMode && (
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          )}
        </button>

        {/* Change Grade Button */}
        <button
          onClick={resetGradeSelection}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-700/30 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 transition-all text-sm"
        >
          🏫 Change Grade/Level
        </button>
      </div>
    </aside>
  );
}
