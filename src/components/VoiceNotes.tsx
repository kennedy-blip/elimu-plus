import { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

interface Recording {
  id: string;
  title: string;
  duration: string;
  transcript: string;
  date: string;
  subject: string;
}

const sampleRecordings: Recording[] = [
  {
    id: '1',
    title: 'My Village Essay',
    duration: '2:34',
    transcript: 'My village is a beautiful place located in the highlands of Central Kenya. The rolling green hills are covered with tea plantations that stretch as far as the eye can see...',
    date: '2024-01-15',
    subject: 'English',
  },
  {
    id: '2',
    title: 'Science Experiment Notes',
    duration: '1:45',
    transcript: 'Today we conducted an experiment on photosynthesis. We placed a water plant in sunlight and observed the oxygen bubbles forming on the leaves...',
    date: '2024-01-14',
    subject: 'Science',
  },
];

export function VoiceNotes() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>(sampleRecordings);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [editMode, setEditMode] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Simulated live transcription phrases
  const samplePhrases = [
    "The importance of education",
    " cannot be overstated.",
    " Education opens doors",
    " to new opportunities",
    " and helps us understand",
    " the world around us.",
    " In Kenya, the CBC curriculum",
    " focuses on developing",
    " practical skills",
    " and competencies.",
  ];

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Simulate live transcription
      let phraseIndex = 0;
      const transcriptInterval = setInterval(() => {
        if (phraseIndex < samplePhrases.length) {
          setLiveTranscript(prev => prev + samplePhrases[phraseIndex]);
          phraseIndex++;
        }
      }, 1500);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        clearInterval(transcriptInterval);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setLiveTranscript('');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (liveTranscript) {
      const newRecording: Recording = {
        id: Date.now().toString(),
        title: 'New Recording',
        duration: formatTime(recordingTime),
        transcript: liveTranscript,
        date: new Date().toISOString().split('T')[0],
        subject: 'General',
      };
      setRecordings(prev => [newRecording, ...prev]);
    }
    setLiveTranscript('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 text-pink-100 text-sm mb-2">
            <span className="px-3 py-1 bg-white/20 rounded-full">🎙️ Voice Recognition</span>
            <span className="px-3 py-1 bg-white/20 rounded-full">AI Transcription</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">🎤 Voice to Text</h1>
          <p className="text-pink-100 max-w-xl">
            Narrate your essays, stories, and notes - watch them transform into text in real-time!
          </p>
        </div>
      </div>

      {/* Recording Interface */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Recording Area */}
        <div className="col-span-2 space-y-4">
          {/* Recording Controls */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
            {/* Microphone Animation */}
            <div className={cn(
              "w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 transition-all",
              isRecording 
                ? "bg-red-100 animate-pulse ring-4 ring-red-200 ring-offset-4" 
                : "bg-slate-100"
            )}>
              <span className={cn("text-6xl", isRecording && "animate-bounce")}>
                {isRecording ? '🎙️' : '🎤'}
              </span>
            </div>

            {/* Timer */}
            {isRecording && (
              <div className="mb-6">
                <span className="text-4xl font-mono font-bold text-red-600">
                  {formatTime(recordingTime)}
                </span>
                <p className="text-sm text-slate-500 mt-1">Recording...</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  🎙️ Start Recording
                </button>
              ) : (
                <>
                  <button
                    onClick={handleStopRecording}
                    className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition-all flex items-center gap-2"
                  >
                    ⏹️ Stop
                  </button>
                  <button className="px-6 py-4 bg-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-300 transition-all">
                    ⏸️ Pause
                  </button>
                </>
              )}
            </div>

            {!isRecording && !liveTranscript && (
              <p className="text-slate-500 mt-6">
                Click the button above to start recording your voice. Your speech will be converted to text automatically.
              </p>
            )}
          </div>

          {/* Live Transcription */}
          {(isRecording || liveTranscript) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {isRecording && <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
                  Live Transcription
                </h3>
                <span className="text-sm text-slate-500">{liveTranscript.split(' ').length} words</span>
              </div>
              <div className="min-h-48 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-700 leading-relaxed">
                  {liveTranscript || <span className="text-slate-400 italic">Start speaking to see your words appear here...</span>}
                  {isRecording && <span className="inline-block w-0.5 h-5 bg-pink-500 ml-1 animate-pulse" />}
                </p>
              </div>
              {liveTranscript && !isRecording && (
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200">
                    📝 Edit Text
                  </button>
                  <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">
                    💾 Save as Essay
                  </button>
                  <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200">
                    📤 Add to Portfolio
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3">💡 Tips for Better Transcription</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🎯', text: 'Speak clearly and at a normal pace' },
                { icon: '🤫', text: 'Find a quiet environment' },
                { icon: '📱', text: 'Keep the microphone close' },
                { icon: '📝', text: 'Pause between sentences' },
              ].map((tip, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-blue-700">
                  <span>{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Saved Recordings Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">📁 Saved Recordings</h2>
          
          <div className="space-y-3">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                onClick={() => setSelectedRecording(recording)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800">{recording.title}</h3>
                  <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
                    {recording.subject}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{recording.transcript}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400">🎙️ {recording.duration}</span>
                  <span className="text-xs text-slate-400">{recording.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2 bg-white text-slate-700 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50">
                📚 Essay Templates
              </button>
              <button className="w-full py-2 bg-white text-slate-700 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50">
                🔤 Grammar Check
              </button>
              <button className="w-full py-2 bg-white text-slate-700 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50">
                📊 Word Count Tool
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Detail Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs px-2 py-1 bg-white/20 rounded-full">{selectedRecording.subject}</span>
                  <h2 className="text-xl font-bold mt-2">{selectedRecording.title}</h2>
                  <p className="text-pink-100 text-sm mt-1">🎙️ {selectedRecording.duration} • {selectedRecording.date}</p>
                </div>
                <button onClick={() => setSelectedRecording(null)} className="text-white/80 hover:text-white text-2xl">
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Audio Player Placeholder */}
              <div className="bg-slate-100 rounded-xl p-4 mb-4 flex items-center gap-4">
                <button className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center">
                  ▶️
                </button>
                <div className="flex-1">
                  <div className="h-2 bg-slate-200 rounded-full">
                    <div className="h-full w-1/3 bg-pink-500 rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0:45</span>
                    <span>{selectedRecording.duration}</span>
                  </div>
                </div>
              </div>

              {/* Transcript */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800">Transcript</h3>
                  <button 
                    onClick={() => setEditMode(!editMode)}
                    className="text-sm text-pink-600 font-medium"
                  >
                    {editMode ? '💾 Save' : '✏️ Edit'}
                  </button>
                </div>
                {editMode ? (
                  <textarea 
                    className="w-full h-48 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    defaultValue={selectedRecording.transcript}
                  />
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl max-h-48 overflow-y-auto">
                    <p className="text-slate-700 leading-relaxed">{selectedRecording.transcript}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200">
                  📋 Copy Text
                </button>
                <button className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200">
                  📤 Export PDF
                </button>
                <button className="flex-1 py-3 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200">
                  📁 Add to Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
