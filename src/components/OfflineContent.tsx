import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

const downloadableContent = [
  { id: '1', title: 'Grade 7 Mathematics Curriculum', type: 'curriculum', subject: 'Mathematics', grade: 7, size: '15 MB', downloaded: true },
  { id: '2', title: 'Integrated Science Notes - Term 1', type: 'notes', subject: 'Science', grade: 7, size: '8 MB', downloaded: false },
  { id: '3', title: 'English Grammar Worksheets', type: 'worksheet', subject: 'English', grade: 7, size: '3 MB', downloaded: true },
  { id: '4', title: 'Kiswahili Literature Guide', type: 'notes', subject: 'Kiswahili', grade: 7, size: '5 MB', downloaded: false },
  { id: '5', title: 'Social Studies - Kenya Geography', type: 'curriculum', subject: 'Social Studies', grade: 7, size: '12 MB', downloaded: false },
  { id: '6', title: 'Creative Arts Project Ideas', type: 'worksheet', subject: 'Creative Arts', grade: 7, size: '20 MB', downloaded: true },
  { id: '7', title: 'Computer Science Basics', type: 'notes', subject: 'Computer Science', grade: 7, size: '6 MB', downloaded: false },
  { id: '8', title: 'Physical Education Guide', type: 'curriculum', subject: 'PE', grade: 7, size: '4 MB', downloaded: false },
];

export function OfflineContent() {
  const { isOffline, toggleOffline } = useApp();
  const [downloads, setDownloads] = useState(downloadableContent);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('all');

  const handleDownload = async (id: string) => {
    setDownloading(id);
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDownloads(prev => prev.map(d => d.id === id ? { ...d, downloaded: true } : d));
    setDownloading(null);
  };

  const handleDelete = (id: string) => {
    setDownloads(prev => prev.map(d => d.id === id ? { ...d, downloaded: false } : d));
  };

  const downloadedItems = downloads.filter(d => d.downloaded);
  const availableItems = downloads.filter(d => !d.downloaded);
  const totalDownloadedSize = downloadedItems.reduce((acc, item) => acc + parseInt(item.size), 0);

  const filteredDownloads = selectedType === 'all' 
    ? downloads 
    : downloads.filter(d => d.type === selectedType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'curriculum': return '📚';
      case 'notes': return '📝';
      case 'worksheet': return '📋';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'curriculum': return 'from-blue-500 to-indigo-600';
      case 'notes': return 'from-green-500 to-emerald-600';
      case 'worksheet': return 'from-orange-500 to-red-500';
      default: return 'from-slate-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
              <span className={cn(
                "px-3 py-1 rounded-full",
                isOffline ? "bg-amber-500/30 text-amber-300" : "bg-green-500/30 text-green-300"
              )}>
                {isOffline ? '📴 Offline Mode' : '🌐 Online Mode'}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">📥 Offline Content Manager</h1>
            <p className="text-slate-400 max-w-xl">
              Download curriculum designs, notes, and worksheets for offline study
            </p>
          </div>
          <button
            onClick={toggleOffline}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
              isOffline ? "bg-green-600 text-white hover:bg-green-700" : "bg-amber-500 text-white hover:bg-amber-600"
            )}
          >
            {isOffline ? '🌐 Go Online' : '📴 Go Offline'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">📥</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{downloadedItems.length}</p>
              <p className="text-sm text-slate-500">Downloaded</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">💾</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalDownloadedSize} MB</p>
              <p className="text-sm text-slate-500">Storage Used</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">📚</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{availableItems.length}</p>
              <p className="text-sm text-slate-500">Available</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">📶</div>
            <div>
              <p className={cn("text-2xl font-bold", isOffline ? "text-amber-600" : "text-green-600")}>
                {isOffline ? 'Offline' : 'Online'}
              </p>
              <p className="text-sm text-slate-500">Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">📴</div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-800">You're in Offline Mode</h3>
            <p className="text-sm text-amber-700">Only downloaded content is available. Connect to internet to download more.</p>
          </div>
          <button onClick={toggleOffline} className="px-4 py-2 bg-amber-200 text-amber-800 rounded-lg font-medium hover:bg-amber-300">
            Go Online
          </button>
        </div>
      )}

      {/* Type Filter */}
      <div className="flex gap-2">
        {['all', 'curriculum', 'notes', 'worksheet'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedType === type
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            )}
          >
            {type === 'all' && '📚 All Content'}
            {type === 'curriculum' && '📖 Curriculum'}
            {type === 'notes' && '📝 Notes'}
            {type === 'worksheet' && '📋 Worksheets'}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Downloaded Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-lg">✅</span>
            Downloaded ({downloadedItems.length})
          </h2>
          
          <div className="space-y-3">
            {filteredDownloads.filter(d => d.downloaded).map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-green-200 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl", getTypeColor(item.type))}>
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.subject} • {item.size}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200">
                    📖 Open
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            
            {filteredDownloads.filter(d => d.downloaded).length === 0 && (
              <div className="bg-slate-50 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">📥</div>
                <p className="text-slate-600">No downloaded content yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-lg">📥</span>
            Available to Download ({availableItems.length})
          </h2>
          
          <div className="space-y-3">
            {filteredDownloads.filter(d => !d.downloaded).map((item) => (
              <div key={item.id} className={cn(
                "bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4",
                isOffline && "opacity-50"
              )}>
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl opacity-70", getTypeColor(item.type))}>
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.subject} • {item.size}</p>
                </div>
                <button
                  onClick={() => !isOffline && handleDownload(item.id)}
                  disabled={isOffline || downloading === item.id}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    downloading === item.id
                      ? "bg-blue-100 text-blue-700"
                      : isOffline
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  {downloading === item.id ? (
                    <>
                      <span className="animate-spin">⏳</span> Downloading...
                    </>
                  ) : (
                    <>📥 Download</>
                  )}
                </button>
              </div>
            ))}
            
            {filteredDownloads.filter(d => !d.downloaded).length === 0 && (
              <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-200">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-green-700 font-medium">All content downloaded!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">💾 Storage Usage</h3>
          <span className="text-sm text-slate-500">{totalDownloadedSize} MB / 500 MB</span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
            style={{ width: `${(totalDownloadedSize / 500) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600">Curriculum: {downloads.filter(d => d.downloaded && d.type === 'curriculum').length} files</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-600">Notes: {downloads.filter(d => d.downloaded && d.type === 'notes').length} files</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-slate-600">Worksheets: {downloads.filter(d => d.downloaded && d.type === 'worksheet').length} files</span>
          </div>
        </div>
      </div>
    </div>
  );
}
