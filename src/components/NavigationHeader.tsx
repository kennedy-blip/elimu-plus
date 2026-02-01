import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

const viewLabels: Record<string, { label: string; icon: string }> = {
  dashboard: { label: 'Dashboard', icon: '🏠' },
  portfolio: { label: 'Portfolio & Evidence', icon: '📁' },
  competencies: { label: 'Competency Radar', icon: '🎯' },
  quizzes: { label: 'Gamified Quizzes', icon: '🎮' },
  lessons: { label: 'KICD Video Lessons', icon: '🎬' },
  labs: { label: 'Virtual Labs (STEM)', icon: '🔬' },
  languages: { label: 'Indigenous Languages', icon: '🗣️' },
  community: { label: 'Community Service', icon: '🤝' },
  offline: { label: 'Offline Content', icon: '📥' },
  'voice-notes': { label: 'Voice to Text', icon: '🎤' },
  settings: { label: 'Settings', icon: '⚙️' },
};

export function NavigationHeader() {
  const { 
    currentView, 
    navigateBack, 
    navigateForward, 
    canGoBack, 
    canGoForward,
    student,
    isOffline,
    parentMode,
    resetGradeSelection,
    grade
  } = useApp();

  const currentViewInfo = viewLabels[currentView] || { label: 'Dashboard', icon: '🏠' };
  
  const getLevelName = () => {
    if (grade <= 6) return 'Upper Primary';
    if (grade <= 9) return 'Junior Secondary';
    return 'Senior School';
  };

  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={navigateBack}
            disabled={!canGoBack()}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              canGoBack()
                ? "bg-white shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            )}
            title="Go Back"
          >
            ←
          </button>
          <button
            onClick={navigateForward}
            disabled={!canGoForward()}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              canGoForward()
                ? "bg-white shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            )}
            title="Go Forward"
          >
            →
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetGradeSelection}
            className="text-sm text-slate-500 hover:text-green-600 transition-colors flex items-center gap-1"
          >
            🏫 Change Grade
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-600">
            Grade {student.grade} - {getLevelName()}
          </span>
          <span className="text-slate-300">/</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span>{currentViewInfo.icon}</span>
            {currentViewInfo.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Display */}
        <div className="hidden lg:block text-right mr-4">
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Offline Indicator */}
        {isOffline && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl">
            <span>📴</span>
            <span className="font-medium text-sm">Offline Mode</span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all">
          🔔
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search lessons, quizzes..."
            className="w-56 pl-10 pr-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>

        {/* Profile */}
        {!parentMode && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="text-right">
              <p className="font-medium text-slate-800 text-sm">{student.name}</p>
              <p className="text-xs text-slate-500">Level {student.level} • {student.points} pts</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
              {student.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
