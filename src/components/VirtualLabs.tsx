import { useState } from 'react';
import { cn } from '../utils/cn';

const labs = [
  { id: '1', title: 'Virtual Microscope', subject: 'biology', description: 'Explore cell structures using a virtual microscope', difficulty: 'beginner', duration: '20 min', icon: '🔬' },
  { id: '2', title: 'Chemical Reactions Simulator', subject: 'chemistry', description: 'Mix chemicals safely and observe reactions', difficulty: 'intermediate', duration: '30 min', icon: '⚗️' },
  { id: '3', title: 'Physics Motion Lab', subject: 'physics', description: 'Experiment with forces, motion, and Newton\'s laws', difficulty: 'intermediate', duration: '25 min', icon: '🚀' },
  { id: '4', title: 'Geometry Explorer', subject: 'mathematics', description: 'Visualize and manipulate 3D shapes', difficulty: 'beginner', duration: '15 min', icon: '📐' },
  { id: '5', title: 'Electrical Circuits', subject: 'physics', description: 'Build and test virtual electrical circuits', difficulty: 'advanced', duration: '35 min', icon: '⚡' },
  { id: '6', title: 'DNA Structure Lab', subject: 'biology', description: 'Explore the double helix and genetic code', difficulty: 'advanced', duration: '40 min', icon: '🧬' },
  { id: '7', title: 'Periodic Table Explorer', subject: 'chemistry', description: 'Interactive periodic table with element details', difficulty: 'beginner', duration: '15 min', icon: '⚛️' },
  { id: '8', title: 'Algebra Visualizer', subject: 'mathematics', description: 'See equations come to life graphically', difficulty: 'intermediate', duration: '20 min', icon: '📊' },
];

const subjectColors = {
  biology: 'from-green-500 to-emerald-600',
  chemistry: 'from-purple-500 to-violet-600',
  physics: 'from-blue-500 to-indigo-600',
  mathematics: 'from-orange-500 to-red-500',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export function VirtualLabs() {
  const [selectedLab, setSelectedLab] = useState<typeof labs[0] | null>(null);
  const [activeExperiment, setActiveExperiment] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const filteredLabs = selectedSubject === 'all' 
    ? labs 
    : labs.filter(lab => lab.subject === selectedSubject);

  // Microscope simulation state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [slidePosition] = useState({ x: 50, y: 50 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-100 text-sm mb-2">
              <span className="px-3 py-1 bg-white/20 rounded-full">🧪 STEM Learning</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">🔬 Virtual STEM Labs</h1>
            <p className="text-cyan-100 max-w-xl">
              Conduct safe, interactive experiments in Physics, Chemistry, Biology, and Mathematics
            </p>
          </div>
          <div className="text-8xl opacity-80">🧬</div>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="flex gap-3">
        {['all', 'biology', 'chemistry', 'physics', 'mathematics'].map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={cn(
              "px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2",
              selectedSubject === subject
                ? subject === 'all' 
                  ? "bg-slate-800 text-white"
                  : `bg-gradient-to-r ${subjectColors[subject as keyof typeof subjectColors]} text-white`
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            )}
          >
            {subject === 'all' && '🔬 All Labs'}
            {subject === 'biology' && '🌱 Biology'}
            {subject === 'chemistry' && '⚗️ Chemistry'}
            {subject === 'physics' && '🚀 Physics'}
            {subject === 'mathematics' && '📐 Mathematics'}
          </button>
        ))}
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredLabs.map((lab) => (
          <div
            key={lab.id}
            onClick={() => setSelectedLab(lab)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className={cn("h-32 bg-gradient-to-br flex items-center justify-center relative", subjectColors[lab.subject as keyof typeof subjectColors])}>
              <span className="text-6xl group-hover:scale-110 transition-transform">{lab.icon}</span>
              <div className={cn("absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium", difficultyColors[lab.difficulty as keyof typeof difficultyColors])}>
                {lab.difficulty}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-800">{lab.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{lab.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  ⏱️ {lab.duration}
                </span>
                <button className={cn("px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r", subjectColors[lab.subject as keyof typeof subjectColors])}>
                  Start Lab →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lab Detail Modal */}
      {selectedLab && !activeExperiment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4">
            <div className={cn("w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center text-5xl mb-4", subjectColors[selectedLab.subject as keyof typeof subjectColors])}>
              {selectedLab.icon}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">{selectedLab.title}</h2>
            <p className="text-center text-slate-500 mb-6">{selectedLab.description}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-lg font-bold text-slate-800">{selectedLab.duration}</p>
                <p className="text-xs text-slate-500">Duration</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-lg font-bold text-slate-800 capitalize">{selectedLab.difficulty}</p>
                <p className="text-xs text-slate-500">Level</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-lg font-bold text-slate-800 capitalize">{selectedLab.subject}</p>
                <p className="text-xs text-slate-500">Subject</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">🎯 Learning Objectives</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Understand key concepts through hands-on experimentation</li>
                <li>• Develop critical thinking and observation skills</li>
                <li>• Apply theoretical knowledge to practical scenarios</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedLab(null)} 
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => setActiveExperiment(true)}
                className={cn("flex-1 py-3 text-white rounded-xl font-medium bg-gradient-to-r", subjectColors[selectedLab.subject as keyof typeof subjectColors])}
              >
                Start Experiment 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Experiment - Microscope Simulation */}
      {activeExperiment && selectedLab?.id === '1' && (
        <div className="fixed inset-0 bg-slate-900 flex flex-col z-50">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <span className="text-2xl">🔬</span>
              <div>
                <h2 className="text-white font-bold">Virtual Microscope</h2>
                <p className="text-slate-400 text-sm">Exploring Cell Structures</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <span>Zoom:</span>
                <button 
                  onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                  className="w-8 h-8 bg-slate-700 rounded-lg hover:bg-slate-600"
                >
                  -
                </button>
                <span className="w-12 text-center">{zoomLevel}x</span>
                <button 
                  onClick={() => setZoomLevel(Math.min(10, zoomLevel + 0.5))}
                  className="w-8 h-8 bg-slate-700 rounded-lg hover:bg-slate-600"
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => {
                  setActiveExperiment(false);
                  setSelectedLab(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Exit Lab
              </button>
            </div>
          </div>

          {/* Microscope View */}
          <div className="flex-1 flex">
            {/* Main View */}
            <div className="flex-1 flex items-center justify-center bg-slate-950 p-8">
              <div 
                className="w-96 h-96 rounded-full border-8 border-slate-700 bg-gradient-to-br from-green-200 to-green-100 relative overflow-hidden"
                style={{ transform: `scale(${0.8 + zoomLevel * 0.1})` }}
              >
                {/* Cell simulation */}
                <div 
                  className="absolute transition-all duration-300"
                  style={{ 
                    left: `${slidePosition.x}%`, 
                    top: `${slidePosition.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Cell membrane */}
                  <div className="w-48 h-48 rounded-full border-4 border-green-600 bg-green-300/50 relative">
                    {/* Nucleus */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-purple-400 border-2 border-purple-600">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-purple-600" />
                    </div>
                    {/* Mitochondria */}
                    <div className="absolute top-4 left-4 w-8 h-4 rounded-full bg-orange-400 border border-orange-600" />
                    <div className="absolute bottom-6 right-6 w-6 h-3 rounded-full bg-orange-400 border border-orange-600 rotate-45" />
                    {/* Chloroplasts (for plant cell) */}
                    <div className="absolute top-8 right-8 w-6 h-4 rounded-full bg-green-500 border border-green-700" />
                    <div className="absolute bottom-4 left-8 w-5 h-3 rounded-full bg-green-500 border border-green-700" />
                  </div>
                </div>
                
                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-0.5 bg-red-500/30" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-full w-0.5 bg-red-500/30" />
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="w-80 bg-slate-800 p-6 border-l border-slate-700 overflow-y-auto">
              <h3 className="text-white font-bold mb-4">🧫 Plant Cell Structure</h3>
              
              <div className="space-y-3">
                {[
                  { name: 'Cell Membrane', color: 'bg-green-600', desc: 'Controls what enters and exits the cell' },
                  { name: 'Nucleus', color: 'bg-purple-500', desc: 'Contains genetic material (DNA)' },
                  { name: 'Nucleolus', color: 'bg-purple-700', desc: 'Makes ribosomal RNA' },
                  { name: 'Mitochondria', color: 'bg-orange-500', desc: 'Powerhouse - produces energy (ATP)' },
                  { name: 'Chloroplast', color: 'bg-green-500', desc: 'Conducts photosynthesis' },
                ].map((part) => (
                  <div key={part.name} className="p-3 bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn("w-3 h-3 rounded-full", part.color)} />
                      <span className="text-white font-medium text-sm">{part.name}</span>
                    </div>
                    <p className="text-slate-400 text-xs">{part.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-500/20 rounded-xl">
                <h4 className="text-blue-300 font-medium mb-2">💡 Did You Know?</h4>
                <p className="text-blue-200 text-sm">
                  Plant cells have chloroplasts that animal cells don't have. This is why plants are green and can make their own food!
                </p>
              </div>

              <button className="w-full mt-4 py-3 bg-green-600 text-white rounded-xl font-medium">
                ✅ Complete & Take Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Lab Experience */}
      {activeExperiment && selectedLab && selectedLab.id !== '1' && (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="text-8xl mb-6">{selectedLab.icon}</div>
            <h2 className="text-3xl font-bold mb-2">{selectedLab.title}</h2>
            <p className="text-slate-400 mb-8">Interactive lab experience loading...</p>
            <div className="w-64 h-2 bg-slate-700 rounded-full mx-auto mb-8">
              <div className="w-3/4 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse" />
            </div>
            <button 
              onClick={() => {
                setActiveExperiment(false);
                setSelectedLab(null);
              }}
              className="px-6 py-3 bg-slate-700 text-white rounded-xl"
            >
              Exit Lab
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
