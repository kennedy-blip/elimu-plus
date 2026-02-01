import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

export function CompetencyRadar() {
  const { competencies } = useApp();

  const levelColors = {
    exceeding: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', gradient: 'from-green-500 to-emerald-600' },
    meeting: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', gradient: 'from-blue-500 to-indigo-600' },
    approaching: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', gradient: 'from-yellow-500 to-orange-500' },
    below: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', gradient: 'from-red-500 to-rose-600' },
  };

  const levelDescriptions = {
    exceeding: 'Consistently demonstrates exceptional understanding and application',
    meeting: 'Demonstrates solid understanding and applies knowledge effectively',
    approaching: 'Shows developing understanding with some support needed',
    below: 'Requires additional support and practice to develop skills',
  };

  // Calculate radar chart points
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 120;
  const numCompetencies = competencies.length;

  const getPoint = (index: number, score: number) => {
    const angle = (Math.PI * 2 * index) / numCompetencies - Math.PI / 2;
    const radius = (score / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = (Math.PI * 2 * index) / numCompetencies - Math.PI / 2;
    const radius = maxRadius + 30;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const radarPoints = competencies.map((c, i) => getPoint(i, c.score));
  const pathD = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Competency Radar</h1>
          <p className="text-slate-500">Track your progress across the 7 CBC Core Competencies</p>
        </div>
        <div className="flex gap-2">
          {(['exceeding', 'meeting', 'approaching', 'below'] as const).map((level) => (
            <div key={level} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium", levelColors[level].bg, levelColors[level].text)}>
              <div className={cn("w-2 h-2 rounded-full bg-gradient-to-r", levelColors[level].gradient)} />
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-center">
            <svg width="400" height="350" className="overflow-visible">
              {/* Background circles */}
              {[25, 50, 75, 100].map((percent) => (
                <circle
                  key={percent}
                  cx={centerX}
                  cy={centerY}
                  r={(percent / 100) * maxRadius}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={percent === 100 ? "0" : "4 4"}
                />
              ))}
              
              {/* Axis lines */}
              {competencies.map((_, i) => {
                const point = getPoint(i, 100);
                return (
                  <line
                    key={i}
                    x1={centerX}
                    y1={centerY}
                    x2={point.x}
                    y2={point.y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Filled area */}
              <path
                d={pathD}
                fill="url(#radarGradient)"
                fillOpacity="0.3"
                stroke="url(#radarStroke)"
                strokeWidth="3"
              />

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>

              {/* Data points */}
              {radarPoints.map((point, i) => (
                <g key={i}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill="white"
                    stroke={competencies[i].level === 'exceeding' ? '#10b981' : 
                            competencies[i].level === 'meeting' ? '#3b82f6' : 
                            competencies[i].level === 'approaching' ? '#f59e0b' : '#ef4444'}
                    strokeWidth="3"
                  />
                  <text
                    x={point.x}
                    y={point.y}
                    dy="0.35em"
                    textAnchor="middle"
                    className="text-xs font-bold"
                    fill="#1e293b"
                  >
                    {competencies[i].score}
                  </text>
                </g>
              ))}

              {/* Labels */}
              {competencies.map((comp, i) => {
                const labelPoint = getLabelPoint(i);
                return (
                  <g key={i}>
                    <text
                      x={labelPoint.x}
                      y={labelPoint.y - 8}
                      textAnchor="middle"
                      className="text-lg"
                    >
                      {comp.icon}
                    </text>
                    <text
                      x={labelPoint.x}
                      y={labelPoint.y + 12}
                      textAnchor="middle"
                      className="text-xs font-medium"
                      fill="#475569"
                    >
                      {comp.shortName.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Center score */}
              <text x={centerX} y={centerY - 8} textAnchor="middle" className="text-2xl font-bold" fill="#1e293b">
                {Math.round(competencies.reduce((a, c) => a + c.score, 0) / competencies.length)}%
              </text>
              <text x={centerX} y={centerY + 10} textAnchor="middle" className="text-xs" fill="#64748b">
                Average
              </text>
            </svg>
          </div>
        </div>

        {/* Level Descriptions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">CBC Assessment Scale</h3>
            <div className="space-y-3">
              {(['exceeding', 'meeting', 'approaching', 'below'] as const).map((level) => (
                <div key={level} className={cn("p-3 rounded-xl border", levelColors[level].bg, levelColors[level].border)}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-3 h-3 rounded-full bg-gradient-to-r", levelColors[level].gradient)} />
                    <span className={cn("font-semibold text-sm", levelColors[level].text)}>
                      {level.charAt(0).toUpperCase() + level.slice(1)} Expectations
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{levelDescriptions[level]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
            <h3 className="font-bold mb-2">🎯 Your Strengths</h3>
            <div className="space-y-2">
              {competencies
                .filter(c => c.level === 'exceeding')
                .map(c => (
                  <div key={c.id} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                    <span>{c.icon}</span>
                    <span className="text-sm">{c.shortName}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Competency Cards */}
      <div className="grid grid-cols-2 gap-4">
        {competencies.map((comp) => (
          <div key={comp.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl", levelColors[comp.level].gradient)}>
                {comp.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800">{comp.name}</h3>
                  <span className={cn("text-xs font-medium px-2 py-1 rounded-full", levelColors[comp.level].bg, levelColors[comp.level].text)}>
                    {comp.level.charAt(0).toUpperCase() + comp.level.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all", levelColors[comp.level].gradient)}
                      style={{ width: `${comp.score}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-slate-700">{comp.score}%</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                    View Evidence
                  </button>
                  <button className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all">
                    Take Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
