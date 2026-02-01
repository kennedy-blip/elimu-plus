import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

export function ParentPortal() {
  const { student, competencies, portfolio, serviceProjects, toggleParentMode } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'reports' | 'messages'>('overview');

  const attendanceData = [
    { day: 'Mon', present: true },
    { day: 'Tue', present: true },
    { day: 'Wed', present: true },
    { day: 'Thu', present: false },
    { day: 'Fri', present: true },
  ];

  const recentActivities = [
    { action: 'Completed Mathematics Quiz', score: '85%', time: '2 hours ago', icon: '🧮' },
    { action: 'Uploaded Science Project', subject: 'Science', time: '1 day ago', icon: '🔬' },
    { action: 'Watched KICD Lesson', subject: 'English', time: '2 days ago', icon: '🎬' },
    { action: 'Community Service Logged', hours: '3 hours', time: '3 days ago', icon: '🤝' },
  ];

  const messages = [
    { from: 'Mrs. Njeri (Math Teacher)', subject: 'Excellent Quiz Performance!', preview: 'Congratulations on the recent quiz...', time: '1 day ago', unread: true },
    { from: 'Mr. Ochieng (Science)', subject: 'Project Submission Confirmed', preview: 'The science project has been received...', time: '2 days ago', unread: false },
    { from: 'School Admin', subject: 'Term 2 Calendar', preview: 'Please find attached the school calendar...', time: '1 week ago', unread: false },
  ];

  const subjectPerformance = [
    { subject: 'Mathematics', grade: 'B+', score: 78, trend: 'up' },
    { subject: 'Science', grade: 'A-', score: 85, trend: 'up' },
    { subject: 'English', grade: 'B', score: 72, trend: 'stable' },
    { subject: 'Kiswahili', grade: 'B+', score: 76, trend: 'up' },
    { subject: 'Social Studies', grade: 'A', score: 88, trend: 'up' },
    { subject: 'Creative Arts', grade: 'A+', score: 95, trend: 'stable' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-100 text-sm mb-2">
              <span className="px-3 py-1 bg-white/20 rounded-full">👨‍👩‍👧 Parent/Teacher Portal</span>
              <span className="px-3 py-1 bg-green-500/30 text-green-200 rounded-full">✓ Verified Guardian</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome, Parent/Guardian</h1>
            <p className="text-purple-100">Monitor {student.name}'s learning progress and achievements</p>
          </div>
          <button
            onClick={toggleParentMode}
            className="px-4 py-2 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30"
          >
            ← Back to Student View
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'progress', label: 'Academic Progress', icon: '📈' },
          { id: 'reports', label: 'Reports', icon: '📋' },
          { id: 'messages', label: 'Messages', icon: '💬' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
              activeTab === tab.id
                ? "bg-purple-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Student Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl font-bold text-white">
                {student.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{student.name}</h2>
                <p className="text-slate-500">Grade {student.grade} • {student.school}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">{student.level}</p>
                <p className="text-xs text-slate-500">Level</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-orange-600">{student.streak}</p>
                <p className="text-xs text-slate-500">Streak</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{student.points}</p>
                <p className="text-xs text-slate-500">Points</p>
              </div>
            </div>
          </div>

          {/* Attendance This Week */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">📅 Attendance This Week</h3>
            <div className="flex justify-between gap-2">
              {attendanceData.map((day) => (
                <div key={day.day} className="text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-2",
                    day.present ? "bg-green-100" : "bg-red-100"
                  )}>
                    {day.present ? '✅' : '❌'}
                  </div>
                  <p className="text-sm text-slate-600">{day.day}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-xl text-center">
              <p className="text-green-700 font-semibold">80% Attendance Rate</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">📊 This Term</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">Quizzes Completed</span>
                <span className="font-bold text-slate-800">47</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">Average Score</span>
                <span className="font-bold text-green-600">82%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">Service Hours</span>
                <span className="font-bold text-blue-600">{serviceProjects.reduce((a, p) => a + p.hours, 0)}h</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">Portfolio Items</span>
                <span className="font-bold text-purple-600">{portfolio.length}</span>
              </div>
            </div>
          </div>

          {/* Competency Summary */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">🎯 Competency Assessment</h3>
            <div className="grid grid-cols-2 gap-4">
              {competencies.map((comp) => (
                <div key={comp.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-2xl">{comp.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{comp.shortName}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        comp.level === 'exceeding' && "bg-green-100 text-green-700",
                        comp.level === 'meeting' && "bg-blue-100 text-blue-700",
                        comp.level === 'approaching' && "bg-yellow-100 text-yellow-700",
                        comp.level === 'below' && "bg-red-100 text-red-700"
                      )}>
                        {comp.level}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          comp.level === 'exceeding' && "bg-green-500",
                          comp.level === 'meeting' && "bg-blue-500",
                          comp.level === 'approaching' && "bg-yellow-500",
                          comp.level === 'below' && "bg-red-500"
                        )}
                        style={{ width: `${comp.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">🕐 Recent Activities</h3>
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                  {activity.score && (
                    <span className="text-sm font-bold text-green-600">{activity.score}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Subject Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">📚 Subject Performance</h3>
            <div className="space-y-4">
              {subjectPerformance.map((subject) => (
                <div key={subject.subject} className="flex items-center gap-4">
                  <div className="w-16 text-center">
                    <span className={cn(
                      "text-xl font-bold",
                      subject.score >= 80 ? "text-green-600" : subject.score >= 60 ? "text-blue-600" : "text-yellow-600"
                    )}>
                      {subject.grade}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-700">{subject.subject}</span>
                      <span className="text-sm text-slate-500">{subject.score}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          subject.score >= 80 ? "bg-green-500" : subject.score >= 60 ? "bg-blue-500" : "bg-yellow-500"
                        )}
                        style={{ width: `${subject.score}%` }}
                      />
                    </div>
                  </div>
                  <span className={cn(
                    "text-lg",
                    subject.trend === 'up' ? "text-green-500" : subject.trend === 'down' ? "text-red-500" : "text-slate-400"
                  )}>
                    {subject.trend === 'up' ? '📈' : subject.trend === 'down' ? '📉' : '➡️'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Term Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">📊 Term Overview</h3>
            <div className="h-64 flex items-end justify-around gap-4 px-4">
              {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].map((week, idx) => {
                const heights = [65, 72, 68, 80, 85];
                return (
                  <div key={week} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-12 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all hover:from-purple-600 hover:to-pink-600"
                      style={{ height: `${heights[idx] * 2}px` }}
                    />
                    <span className="text-xs text-slate-500">{week}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-4 p-3 bg-purple-50 rounded-xl">
              <p className="text-purple-700 font-medium">Average Performance: 82% 📈</p>
            </div>
          </div>

          {/* Goals & Recommendations */}
          <div className="col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <h3 className="font-bold text-slate-800 mb-4">💡 Personalized Recommendations</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-indigo-100">
                <span className="text-2xl">🎯</span>
                <h4 className="font-semibold text-slate-800 mt-2">Focus Area</h4>
                <p className="text-sm text-slate-600 mt-1">Citizenship competency could use more attention. Consider community service activities.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-indigo-100">
                <span className="text-2xl">⭐</span>
                <h4 className="font-semibold text-slate-800 mt-2">Strength</h4>
                <p className="text-sm text-slate-600 mt-1">Excellent performance in Critical Thinking! Encourage participation in STEM activities.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-indigo-100">
                <span className="text-2xl">📚</span>
                <h4 className="font-semibold text-slate-800 mt-2">Suggested Resources</h4>
                <p className="text-sm text-slate-600 mt-1">Additional practice worksheets for Mathematics are available for download.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">📋 Available Reports</h3>
            <div className="space-y-3">
              {[
                { title: 'Term 1 Progress Report', date: '2024-04-15', status: 'ready' },
                { title: 'Competency Assessment Q1', date: '2024-03-20', status: 'ready' },
                { title: 'Community Service Certificate', date: '2024-03-01', status: 'ready' },
                { title: 'Term 2 Progress Report', date: 'Pending', status: 'pending' },
              ].map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-medium text-slate-800">{report.title}</p>
                      <p className="text-sm text-slate-500">{report.date}</p>
                    </div>
                  </div>
                  <button
                    disabled={report.status === 'pending'}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium",
                      report.status === 'ready'
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {report.status === 'ready' ? '📥 Download' : 'Pending'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">📊 Generate Custom Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                  <option>Progress Summary</option>
                  <option>Competency Analysis</option>
                  <option>Attendance Record</option>
                  <option>Portfolio Overview</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                </div>
              </div>
              <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">📬 Messages from Teachers</h3>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">
                + New Message
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("p-4 cursor-pointer hover:bg-slate-50", msg.unread && "bg-purple-50")}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-slate-800">{msg.from}</p>
                    <span className="text-xs text-slate-500">{msg.time}</span>
                  </div>
                  <p className="font-medium text-slate-700 text-sm">{msg.subject}</p>
                  <p className="text-sm text-slate-500 truncate">{msg.preview}</p>
                  {msg.unread && <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2" />}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3">📞 Contact School</h3>
              <div className="space-y-2">
                <button className="w-full py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center justify-center gap-2">
                  📧 Email Class Teacher
                </button>
                <button className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center justify-center gap-2">
                  📅 Book Appointment
                </button>
                <button className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 flex items-center justify-center gap-2">
                  📱 Call School Office
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-2">📢 School Announcements</h3>
              <div className="space-y-2">
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-sm font-medium">Parent-Teacher Meeting</p>
                  <p className="text-xs text-purple-200">Friday, 3:00 PM</p>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-sm font-medium">Science Fair Week</p>
                  <p className="text-xs text-purple-200">Starting Monday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
