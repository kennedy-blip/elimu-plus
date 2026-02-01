import { useState, useRef } from 'react';
import { cn } from '../utils/cn';
import { useApp } from '../context/AppContext';

interface VideoLesson {
  id: string;
  title: string;
  subject: string;
  duration: string;
  thumbnail: string;
  kicdAligned: boolean;
  grade: number;
  views: number;
  videoUrl: string;
  description: string;
}

const videoLessons: VideoLesson[] = [
  { 
    id: '1', 
    title: 'Introduction to Algebra', 
    subject: 'Mathematics', 
    duration: '15:30', 
    thumbnail: '🧮', 
    kicdAligned: true, 
    grade: 7, 
    views: 1234,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Learn the basics of algebra including variables, expressions, and simple equations.'
  },
  { 
    id: '2', 
    title: 'Plant Cell Structure', 
    subject: 'Biology', 
    duration: '20:15', 
    thumbnail: '🌱', 
    kicdAligned: true, 
    grade: 7, 
    views: 987,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Explore the fascinating world of plant cells and their unique structures.'
  },
  { 
    id: '3', 
    title: 'Kenya\'s Independence Story', 
    subject: 'History', 
    duration: '25:00', 
    thumbnail: '🇰🇪', 
    kicdAligned: true, 
    grade: 7, 
    views: 2341,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'The journey to Uhuru - Kenya\'s fight for independence from colonial rule.'
  },
  { 
    id: '4', 
    title: 'Essay Writing Basics', 
    subject: 'English', 
    duration: '18:45', 
    thumbnail: '✍️', 
    kicdAligned: true, 
    grade: 7, 
    views: 1567,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Master the art of essay writing with structure, flow, and compelling arguments.'
  },
  { 
    id: '5', 
    title: 'Insha ya Kiswahili', 
    subject: 'Kiswahili', 
    duration: '22:10', 
    thumbnail: '📝', 
    kicdAligned: true, 
    grade: 7, 
    views: 890,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Jifunze jinsi ya kuandika insha nzuri ya Kiswahili kwa ustadi.'
  },
  { 
    id: '6', 
    title: 'Introduction to Coding', 
    subject: 'Computer Science', 
    duration: '30:00', 
    thumbnail: '💻', 
    kicdAligned: true, 
    grade: 7, 
    views: 3456,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Start your coding journey with basic programming concepts and logic.'
  },
  { 
    id: '7', 
    title: 'Chemical Reactions', 
    subject: 'Chemistry', 
    duration: '19:30', 
    thumbnail: '⚗️', 
    kicdAligned: true, 
    grade: 8, 
    views: 1122,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Understanding different types of chemical reactions and how to balance equations.'
  },
  { 
    id: '8', 
    title: 'Newton\'s Laws of Motion', 
    subject: 'Physics', 
    duration: '24:00', 
    thumbnail: '🚀', 
    kicdAligned: true, 
    grade: 8, 
    views: 2890,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Discover the three fundamental laws that govern motion and forces.'
  },
];

const subjects = ['All', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'English', 'Kiswahili', 'History', 'Computer Science'];

export function VideoLessons() {
  const { setCurrentView, grade } = useApp();
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const filteredLessons = selectedSubject === 'All' 
    ? videoLessons.filter(v => v.grade <= grade + 1 && v.grade >= grade - 1)
    : videoLessons.filter(v => v.subject === selectedSubject && v.grade <= grade + 1 && v.grade >= grade - 1);

  const handleVideoSelect = (video: VideoLesson) => {
    setSelectedVideo(video);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && playerContainerRef.current) {
      playerContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClosePlayer = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setSelectedVideo(null);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 text-pink-100 text-sm mb-2">
            <span className="px-3 py-1 bg-white/20 rounded-full">🎓 KICD Aligned</span>
            <span className="px-3 py-1 bg-white/20 rounded-full">Kenya Education Cloud</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">📺 KICD Video Lessons</h1>
          <p className="text-pink-100 max-w-xl">
            Watch curriculum-aligned video lessons from Kenya Institute of Curriculum Development
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedSubject === subject
                ? "bg-red-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-red-300"
            )}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-xl">🎬</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{videoLessons.length}</p>
              <p className="text-xs text-slate-500">Total Lessons</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-xl">✅</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">12</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">⏱️</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">4.5h</p>
              <p className="text-xs text-slate-500">Watch Time</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-xl">📥</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">5</p>
              <p className="text-xs text-slate-500">Downloaded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Featured/Continue Watching */}
        <div className="col-span-2 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-8xl">🎓</div>
            <button 
              onClick={() => handleVideoSelect(videoLessons[0])}
              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-all cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform">
                <span className="text-4xl ml-1">▶️</span>
              </div>
            </button>
            <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-sm rounded-full flex items-center gap-1">
              🎓 KICD Verified
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-800">Featured: Understanding Algebra Basics</h2>
            <p className="text-slate-500 mt-1">Mathematics • Grade {grade} • 15:30</p>
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => handleVideoSelect(videoLessons[0])}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-colors"
              >
                ▶️ Watch Now
              </button>
              <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-200 transition-colors">
                📥 Download
              </button>
              <button 
                onClick={() => setCurrentView('quizzes')}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-200 transition-colors"
              >
                📝 Take Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Playlist */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 h-fit">
          <h3 className="font-bold text-slate-800 mb-3">📚 Continue Learning</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLessons.slice(0, 5).map((lesson, idx) => (
              <div 
                key={lesson.id}
                onClick={() => handleVideoSelect(lesson)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                  idx === 0 ? "bg-red-50 border border-red-200" : "hover:bg-slate-50"
                )}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl">
                  {lesson.thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">{lesson.title}</p>
                  <p className="text-xs text-slate-500">{lesson.subject} • {lesson.duration}</p>
                </div>
                <span className="text-red-600 hover:scale-110 transition-transform">▶️</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Videos */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">All Video Lessons</h2>
        <div className="grid grid-cols-4 gap-4">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => handleVideoSelect(lesson)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="relative aspect-video bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <span className="text-5xl group-hover:scale-110 transition-transform">{lesson.thumbnail}</span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl">▶️</span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                  {lesson.duration}
                </div>
                {lesson.kicdAligned && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                    ✓ KICD
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-800 text-sm truncate">{lesson.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{lesson.subject} • Grade {lesson.grade}</p>
                <p className="text-xs text-slate-400 mt-2">{lesson.views.toLocaleString()} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div ref={playerContainerRef} className="w-full max-w-5xl mx-4">
            {/* Close Button */}
            <button 
              onClick={handleClosePlayer}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              ✕
            </button>

            {/* Video Player */}
            <div className="bg-black rounded-2xl overflow-hidden">
              {/* Video Element */}
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  src={selectedVideo.videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  onClick={handlePlayPause}
                />
                
                {/* Play/Pause Overlay */}
                {!isPlaying && (
                  <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform">
                      <span className="text-4xl ml-1">▶️</span>
                    </div>
                  </button>
                )}

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #ef4444 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%)`
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Play/Pause Button */}
                      <button
                        onClick={handlePlayPause}
                        className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        {isPlaying ? '⏸️' : '▶️'}
                      </button>

                      {/* Time Display */}
                      <span className="text-white text-sm font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>

                      {/* Volume Control */}
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">🔊</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Speed */}
                      <button className="text-white text-sm hover:text-red-400 transition-colors">
                        1x
                      </button>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        {isFullscreen ? '⛶' : '⛶'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6 bg-slate-900">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">✓ KICD Verified</span>
                      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">{selectedVideo.subject}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedVideo.title}</h2>
                    <p className="text-slate-400 mt-1">Grade {selectedVideo.grade} • {selectedVideo.views.toLocaleString()} views</p>
                    <p className="text-slate-300 mt-3 max-w-2xl">{selectedVideo.description}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
                    📥 Download for Offline
                  </button>
                  <button 
                    onClick={() => {
                      handleClosePlayer();
                      setCurrentView('quizzes');
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    📝 Take Quiz
                  </button>
                  <button 
                    onClick={() => {
                      handleClosePlayer();
                      setCurrentView('voice-notes');
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-purple-700 transition-colors"
                  >
                    ✍️ Take Notes
                  </button>
                </div>
              </div>
            </div>

            {/* Related Videos */}
            <div className="mt-4">
              <h3 className="text-white font-bold mb-3">Up Next</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {filteredLessons.filter(l => l.id !== selectedVideo.id).slice(0, 4).map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleVideoSelect(lesson)}
                    className="flex-shrink-0 w-48 bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:bg-slate-700 transition-colors"
                  >
                    <div className="aspect-video bg-slate-700 flex items-center justify-center text-3xl">
                      {lesson.thumbnail}
                    </div>
                    <div className="p-3">
                      <p className="text-white text-sm font-medium truncate">{lesson.title}</p>
                      <p className="text-slate-400 text-xs">{lesson.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
