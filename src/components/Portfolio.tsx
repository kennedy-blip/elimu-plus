import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { PortfolioItem } from '../types';

export function Portfolio() {
  const { portfolio, addPortfolioItem, competencies } = useApp();
  const [filter, setFilter] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const subjects = ['all', 'Science', 'Mathematics', 'English', 'Kiswahili', 'Creative Arts', 'Life Skills', 'Social Studies'];
  
  const filteredPortfolio = filter === 'all' 
    ? portfolio 
    : portfolio.filter(item => item.subject === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '🎬';
      case 'image': return '🖼️';
      default: return '📁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'from-red-500 to-rose-600';
      case 'video': return 'from-purple-500 to-violet-600';
      case 'image': return 'from-blue-500 to-indigo-600';
      default: return 'from-slate-500 to-gray-600';
    }
  };

  const handleUpload = () => {
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title: 'New Evidence Upload',
      type: 'document',
      uploadDate: new Date().toISOString().split('T')[0],
      subject: 'Science',
      competencies: ['Critical Thinking'],
      size: '1.2 MB',
    };
    addPortfolioItem(newItem);
    setShowUpload(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Digital Portfolio & Evidence Locker</h1>
          <p className="text-slate-500">Securely store and organize your learning evidence</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <span>📤</span> Upload Evidence
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: portfolio.length, icon: '📁', color: 'from-blue-500 to-indigo-600' },
          { label: 'Images', value: portfolio.filter(p => p.type === 'image').length, icon: '🖼️', color: 'from-green-500 to-emerald-600' },
          { label: 'Videos', value: portfolio.filter(p => p.type === 'video').length, icon: '🎬', color: 'from-purple-500 to-violet-600' },
          { label: 'Documents', value: portfolio.filter(p => p.type === 'pdf').length, icon: '📄', color: 'from-red-500 to-rose-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-xl", stat.color)}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setFilter(subject)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              filter === subject
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
            )}
          >
            {subject === 'all' ? '📚 All Subjects' : subject}
          </button>
        ))}
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredPortfolio.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
          >
            {/* Thumbnail */}
            <div className={cn("h-40 bg-gradient-to-br flex items-center justify-center", getTypeColor(item.type))}>
              <span className="text-6xl opacity-80 group-hover:scale-110 transition-transform">
                {getTypeIcon(item.type)}
              </span>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 truncate">{item.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{item.subject}</p>
              
              <div className="flex flex-wrap gap-1 mt-3">
                {item.competencies.slice(0, 2).map((comp, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {comp}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">{item.uploadDate}</span>
                <span className="text-xs text-slate-500">{item.size}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Upload Evidence</h2>
              <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center mb-6">
              <div className="text-5xl mb-3">📤</div>
              <p className="text-slate-600 mb-2">Drag & drop files here or click to browse</p>
              <p className="text-sm text-slate-400">Supports: Images, Videos, PDFs (Max 100MB)</p>
              <button className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                Browse Files
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter evidence title" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {subjects.slice(1).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link to Competencies</label>
                <div className="flex flex-wrap gap-2">
                  {competencies.map((comp) => (
                    <label key={comp.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full cursor-pointer hover:bg-slate-200">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{comp.shortName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUpload(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleUpload} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg">
                Upload Evidence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">{selectedItem.title}</h2>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <div className={cn("h-64 bg-gradient-to-br rounded-xl flex items-center justify-center mb-4", getTypeColor(selectedItem.type))}>
              <span className="text-8xl opacity-80">{getTypeIcon(selectedItem.type)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Subject</p>
                <p className="font-semibold text-slate-800">{selectedItem.subject}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Upload Date</p>
                <p className="font-semibold text-slate-800">{selectedItem.uploadDate}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">File Size</p>
                <p className="font-semibold text-slate-800">{selectedItem.size}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Linked Competencies</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedItem.competencies.map((c, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-2">
                📥 Download
              </button>
              <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                📤 Share with Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
