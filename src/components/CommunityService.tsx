import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

export function CommunityService() {
  const { serviceProjects } = useApp();
  const [showNewProject, setShowNewProject] = useState(false);

  const totalHours = serviceProjects.reduce((acc, p) => acc + p.hours, 0);
  const completedProjects = serviceProjects.filter(p => p.status === 'completed').length;

  const impactAreas = [
    { name: 'Environment', icon: '🌳', projects: 3, hours: 15 },
    { name: 'Education', icon: '📚', projects: 2, hours: 10 },
    { name: 'Health', icon: '🏥', projects: 1, hours: 5 },
    { name: 'Elder Care', icon: '👵', projects: 2, hours: 8 },
  ];

  const suggestedProjects = [
    { title: 'River Clean-up Day', organization: 'Nairobi River Basin', duration: '4 hours', category: 'Environment', spots: 20 },
    { title: 'Tutoring Primary Students', organization: 'Local Primary School', duration: '2 hours/week', category: 'Education', spots: 10 },
    { title: 'Tree Planting Initiative', organization: 'Green Kenya Movement', duration: '3 hours', category: 'Environment', spots: 50 },
    { title: 'Visit to Children\'s Home', organization: 'Hope Children\'s Home', duration: '5 hours', category: 'Social Welfare', spots: 15 },
  ];

  const reflectionPrompts = [
    "What did you learn from this experience?",
    "How did this service benefit the community?",
    "What challenges did you face and how did you overcome them?",
    "How will you apply what you learned in your daily life?",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-10 text-6xl">🤝</div>
          <div className="absolute bottom-4 left-10 text-5xl">🌍</div>
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-100 text-sm mb-2">
              <span className="px-3 py-1 bg-white/20 rounded-full">🎓 CBC Requirement</span>
              <span className="px-3 py-1 bg-white/20 rounded-full">Service Learning</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">🤝 Community Service Learning</h1>
            <p className="text-teal-100 max-w-xl">
              Make a difference in your community while developing citizenship competencies
            </p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="px-6 py-3 bg-white text-teal-700 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            + Log New Service
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center text-3xl mb-3">
            ⏱️
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalHours}</p>
          <p className="text-slate-500">Total Hours</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl mb-3">
            📋
          </div>
          <p className="text-3xl font-bold text-slate-800">{serviceProjects.length}</p>
          <p className="text-slate-500">Total Projects</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-3xl mb-3">
            ✅
          </div>
          <p className="text-3xl font-bold text-slate-800">{completedProjects}</p>
          <p className="text-slate-500">Completed</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-3xl mb-3">
            🏆
          </div>
          <p className="text-3xl font-bold text-slate-800">Silver</p>
          <p className="text-slate-500">Service Level</p>
        </div>
      </div>

      {/* Impact Areas */}
      <div className="grid grid-cols-4 gap-4">
        {impactAreas.map((area) => (
          <div key={area.name} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{area.icon}</span>
              <div>
                <p className="font-bold text-slate-800">{area.name}</p>
                <p className="text-sm text-slate-500">{area.projects} projects • {area.hours} hours</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* My Projects */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">📝 My Service Projects</h2>
          
          <div className="space-y-4">
            {serviceProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                      project.status === 'completed' && "bg-green-100",
                      project.status === 'in-progress' && "bg-blue-100",
                      project.status === 'planned' && "bg-slate-100"
                    )}>
                      {project.status === 'completed' ? '✅' : project.status === 'in-progress' ? '🔄' : '📅'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{project.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{project.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm text-slate-600 flex items-center gap-1">
                          ⏱️ {project.hours} hours
                        </span>
                        <span className="text-sm text-slate-600 flex items-center gap-1">
                          📅 {project.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    project.status === 'completed' && "bg-green-100 text-green-700",
                    project.status === 'in-progress' && "bg-blue-100 text-blue-700",
                    project.status === 'planned' && "bg-slate-100 text-slate-600"
                  )}>
                    {project.status}
                  </span>
                </div>
                
                {project.impact && (
                  <div className="mt-4 p-3 bg-teal-50 rounded-xl">
                    <p className="text-sm text-teal-700">
                      <span className="font-semibold">Impact:</span> {project.impact}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
                    📸 Add Evidence
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
                    ✍️ Write Reflection
                  </button>
                  {project.status !== 'completed' && (
                    <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">
                      ✓ Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Suggested Projects */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4">💡 Suggested Opportunities</h2>
            <div className="grid grid-cols-2 gap-4">
              {suggestedProjects.map((project, idx) => (
                <div key={idx} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-all">
                  <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full">{project.category}</span>
                  <h3 className="font-bold text-slate-800 mt-2">{project.title}</h3>
                  <p className="text-sm text-slate-500">{project.organization}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-400">⏱️ {project.duration}</span>
                    <span className="text-xs text-slate-400">👥 {project.spots} spots left</span>
                  </div>
                  <button className="w-full mt-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                    Sign Up →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Service Badge */}
          <div className="bg-gradient-to-br from-teal-600 to-green-700 rounded-2xl p-6 text-white text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center text-5xl mb-4">
              🥈
            </div>
            <h3 className="font-bold text-xl">Silver Service Badge</h3>
            <p className="text-teal-100 text-sm mt-1">{totalHours} / 40 hours to Gold</p>
            <div className="h-2 bg-white/30 rounded-full mt-4">
              <div className="h-full bg-white rounded-full" style={{ width: `${(totalHours / 40) * 100}%` }} />
            </div>
          </div>

          {/* Reflection Prompts */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">📝 Reflection Prompts</h3>
            <div className="space-y-2">
              {reflectionPrompts.map((prompt, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600">
                  {prompt}
                </div>
              ))}
            </div>
          </div>

          {/* Certificate */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <div className="text-center">
              <span className="text-4xl">📜</span>
              <h3 className="font-bold text-slate-800 mt-2">Service Certificate</h3>
              <p className="text-sm text-slate-500 mt-1">Complete 20+ hours to earn your certificate</p>
              <button className="w-full mt-4 py-2 bg-teal-600 text-white rounded-lg font-medium" disabled={totalHours < 20}>
                {totalHours >= 20 ? 'Download Certificate' : `${20 - totalHours} more hours needed`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Log Community Service</h2>
              <button onClick={() => setShowNewProject(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="e.g., Beach Clean-up" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg" rows={3} placeholder="Describe your service activity..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
                  <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Impact Area</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                  <option>Environment</option>
                  <option>Education</option>
                  <option>Health</option>
                  <option>Elder Care</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Add Evidence</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-slate-500 text-sm">Drop photos/documents or click to browse</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNewProject(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium">
                Cancel
              </button>
              <button onClick={() => setShowNewProject(false)} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-medium">
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
