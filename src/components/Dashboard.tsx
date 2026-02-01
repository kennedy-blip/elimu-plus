import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

export function Dashboard() {
  const { student, competencies, portfolio, serviceProjects, setCurrentView, grade } = useApp();

  const stats = [
    { label: 'Learning Streak', value: `${student.streak} days`, icon: '🔥', color: 'from-orange-500 to-red-500' },
    { label: 'Total Points', value: student.points.toLocaleString(), icon: '⭐', color: 'from-yellow-500 to-amber-500' },
    { label: 'Current Level', value: `Level ${student.level}`, icon: '🏆', color: 'from-purple-500 to-violet-600' },
    { label: 'Quizzes Done', value: '47', icon: '✅', color: 'from-green-500 to-emerald-600' },
  ];

  const upcomingTasks = [
    { title: 'Mathematics Quiz - Algebra', due: 'Today', type: 'quiz', urgent: true },
    { title: 'Science Project Submission', due: 'Tomorrow', type: 'project', urgent: false },
    { title: 'Kiswahili Essay', due: 'In 3 days', type: 'essay', urgent: false },
    { title: 'Community Service Report', due: 'This week', type: 'service', urgent: false },
  ];

  const recentAchievements = [
    { title: 'Critical Thinker Badge', icon: '🧠', date: 'Today' },
    { title: 'STEM Explorer', icon: '🔬', date: 'Yesterday' },
    { title: '10-Day Streak', icon: '🔥', date: '2 days ago' },
  ];

  type AppView = 'dashboard' | 'portfolio' | 'competencies' | 'quizzes' | 'lessons' | 'labs' | 'languages' | 'community' | 'offline' | 'voice-notes' | 'settings';
  
  const quickActions: { icon: string; label: string; view: AppView; color: string }[] = [
    { icon: '🎮', label: 'Take Quiz', view: 'quizzes', color: 'from-orange-500 to-red-500' },
    { icon: '🎬', label: 'Watch Lessons', view: 'lessons', color: 'from-red-500 to-pink-600' },
    { icon: '🔬', label: 'Virtual Labs', view: 'labs', color: 'from-cyan-500 to-blue-600' },
    { icon: '🗣️', label: 'Learn Language', view: 'languages', color: 'from-amber-500 to-orange-600' },
    { icon: '📁', label: 'My Portfolio', view: 'portfolio', color: 'from-blue-500 to-indigo-600' },
    { icon: '🤝', label: 'Community', view: 'community', color: 'from-teal-500 to-green-600' },
  ];

  const getLevelName = () => {
    if (grade <= 6) return 'Upper Primary';
    if (grade <= 9) return 'Junior Secondary';
    return 'Senior School';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 text-green-100 text-sm mb-2">
            <span>🇰🇪</span> Karibu, {student.name.split(' ')[0]}!
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              Grade {grade} • {getLevelName()}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Ready to Learn Today?</h1>
          <p className="text-green-100 max-w-xl">
            You're on a {student.streak}-day streak! Complete today's activities to keep it going and unlock new achievements.
          </p>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setCurrentView('quizzes')}
              className="px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-all shadow-lg hover:shadow-xl"
            >
              Start Quiz 🎮
            </button>
            <button 
              onClick={() => setCurrentView('lessons')}
              className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all backdrop-blur-sm"
            >
              Watch Lessons 🎬
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-6 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.view}
            onClick={() => setCurrentView(action.view)}
            className={cn(
              "p-4 rounded-2xl bg-gradient-to-br text-white text-center hover:scale-105 transition-all shadow-md hover:shadow-lg",
              action.color
            )}
          >
            <span className="text-3xl block mb-2">{action.icon}</span>
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl mb-3",
              stat.color
            )}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Competency Overview */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Competency Progress</h2>
            <button 
              onClick={() => setCurrentView('competencies')}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View Details <span>→</span>
            </button>
          </div>
          <div className="space-y-4">
            {competencies.slice(0, 5).map((comp) => (
              <div key={comp.id} className="flex items-center gap-4">
                <span className="text-2xl w-8">{comp.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{comp.shortName}</span>
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      comp.level === 'exceeding' && "bg-green-100 text-green-700",
                      comp.level === 'meeting' && "bg-blue-100 text-blue-700",
                      comp.level === 'approaching' && "bg-yellow-100 text-yellow-700",
                      comp.level === 'below' && "bg-red-100 text-red-700"
                    )}>
                      {comp.level.charAt(0).toUpperCase() + comp.level.slice(1)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        comp.level === 'exceeding' && "bg-gradient-to-r from-green-400 to-emerald-500",
                        comp.level === 'meeting' && "bg-gradient-to-r from-blue-400 to-indigo-500",
                        comp.level === 'approaching' && "bg-gradient-to-r from-yellow-400 to-orange-500",
                        comp.level === 'below' && "bg-gradient-to-r from-red-400 to-red-500"
                      )}
                      style={{ width: `${comp.score}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-600 w-10 text-right">{comp.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            {upcomingTasks.map((task, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  if (task.type === 'quiz') setCurrentView('quizzes');
                  if (task.type === 'essay') setCurrentView('voice-notes');
                  if (task.type === 'service') setCurrentView('community');
                }}
                className={cn(
                  "p-3 rounded-xl border transition-all hover:shadow-sm cursor-pointer",
                  task.urgent ? "border-red-200 bg-red-50 hover:border-red-300" : "border-slate-100 bg-slate-50 hover:border-slate-200"
                )}
              >
                <p className="font-medium text-slate-700 text-sm">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-xs font-medium",
                    task.urgent ? "text-red-600" : "text-slate-500"
                  )}>
                    {task.due}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                    {task.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Portfolio Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Recent Uploads</h2>
            <button 
              onClick={() => setCurrentView('portfolio')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <span>→</span>
            </button>
          </div>
          <div className="space-y-3">
            {portfolio.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                onClick={() => setCurrentView('portfolio')}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  {item.type === 'pdf' && '📄'}
                  {item.type === 'video' && '🎬'}
                  {item.type === 'image' && '🖼️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Service */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Community Service</h2>
            <button 
              onClick={() => setCurrentView('community')}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <span>→</span>
            </button>
          </div>
          <div 
            className="text-center py-4 cursor-pointer"
            onClick={() => setCurrentView('community')}
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-100 to-green-100 flex items-center justify-center text-4xl mb-3">
              🤝
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {serviceProjects.reduce((acc, p) => acc + p.hours, 0)}
            </p>
            <p className="text-sm text-slate-500">Service Hours</p>
          </div>
          <div className="mt-2 space-y-2">
            {serviceProjects.slice(0, 2).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700 truncate flex-1">{project.title}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  project.status === 'completed' && "bg-green-100 text-green-700",
                  project.status === 'in-progress' && "bg-blue-100 text-blue-700",
                  project.status === 'planned' && "bg-slate-200 text-slate-600"
                )}>
                  {project.hours}h
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-bold mb-4">Recent Achievements</h2>
          <div className="space-y-3">
            {recentAchievements.map((achievement, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <p className="font-medium text-sm">{achievement.title}</p>
                  <p className="text-xs text-purple-200">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setCurrentView('competencies')}
            className="w-full mt-4 py-2 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition-all"
          >
            View All Badges 🏅
          </button>
        </div>
      </div>
    </div>
  );
}
