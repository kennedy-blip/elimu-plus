import { useState } from 'react';
import { cn } from '../utils/cn';

const languages = [
  { id: 'kikuyu', name: 'Gĩkũyũ', region: 'Central Kenya', speakers: '8M', flag: '🏔️' },
  { id: 'luo', name: 'Dholuo', region: 'Western Kenya', speakers: '4.2M', flag: '🌊' },
  { id: 'kalenjin', name: 'Kalenjin', region: 'Rift Valley', speakers: '5M', flag: '🏃' },
  { id: 'kamba', name: 'Kĩkamba', region: 'Eastern Kenya', speakers: '4M', flag: '🌄' },
  { id: 'meru', name: 'Kimeru', region: 'Mt. Kenya Region', speakers: '2M', flag: '🌿' },
  { id: 'maasai', name: 'Maa', region: 'Rift Valley/Tanzania', speakers: '1.5M', flag: '🦁' },
  { id: 'luhya', name: 'Luhya', region: 'Western Kenya', speakers: '6.8M', flag: '🌾' },
  { id: 'swahili', name: 'Kiswahili', region: 'Coastal/National', speakers: '16M', flag: '🏖️' },
];

const lessons = {
  kikuyu: [
    { id: 1, title: 'Greetings & Introductions', words: ['Wĩmũhoro? - How are you?', 'Nĩ mwega - I am fine', 'Nĩ wĩtwa atĩa? - What is your name?'], level: 'beginner' },
    { id: 2, title: 'Numbers 1-10', words: ['Ĩmwe - One', 'Igĩrĩ - Two', 'Ithatũ - Three', 'Inya - Four', 'Ithano - Five'], level: 'beginner' },
    { id: 3, title: 'Family Members', words: ['Baba - Father', 'Maitu - Mother', 'Mũrũ - Son', 'Mwarĩ - Daughter'], level: 'intermediate' },
  ],
  luo: [
    { id: 1, title: 'Greetings', words: ['Misawa - Good morning', 'Idhi nade? - How are you?', 'Adhi maber - I am fine'], level: 'beginner' },
    { id: 2, title: 'Numbers', words: ['Achiel - One', 'Ariyo - Two', 'Adek - Three', 'Ang\'wen - Four', 'Abich - Five'], level: 'beginner' },
  ],
  maasai: [
    { id: 1, title: 'Basic Greetings', words: ['Sopa! - Hello!', 'Iko - Yes', 'Mme - No', 'Ashe oleng - Thank you very much'], level: 'beginner' },
    { id: 2, title: 'Animals', words: ['Enkishu - Cow', 'Endito - Girl', 'Engimatai - Children'], level: 'beginner' },
  ],
};

const culturalContent = [
  { id: 1, language: 'Kikuyu', type: 'Folktale', title: 'The Hare and the Elephant', description: 'Traditional story teaching wisdom' },
  { id: 2, language: 'Luo', type: 'Song', title: 'Benga Music Basics', description: 'Learn traditional Luo rhythms' },
  { id: 3, language: 'Maasai', type: 'Tradition', title: 'Cattle and Community', description: 'Understanding Maasai culture' },
  { id: 4, language: 'Kalenjin', type: 'Proverb', title: 'Wisdom of the Elders', description: 'Traditional sayings and meanings' },
];

export function IndigenousLanguages() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [activeLesson, setActiveLesson] = useState<typeof lessons.kikuyu[0] | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const currentLessons = lessons[selectedLanguage.id as keyof typeof lessons] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-10 text-6xl">🦁</div>
          <div className="absolute top-20 right-20 text-5xl">🏔️</div>
          <div className="absolute bottom-4 left-1/3 text-4xl">🌍</div>
          <div className="absolute bottom-10 right-10 text-5xl">🌾</div>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 text-amber-100 text-sm mb-2">
            <span className="px-3 py-1 bg-white/20 rounded-full">🇰🇪 Kenyan Heritage</span>
            <span className="px-3 py-1 bg-white/20 rounded-full">42+ Indigenous Languages</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">🗣️ Indigenous Languages Corner</h1>
          <p className="text-amber-100 max-w-xl">
            Preserve and celebrate Kenya's rich linguistic heritage. Learn greetings, proverbs, and cultural expressions.
          </p>
        </div>
      </div>

      {/* Language Selector */}
      <div className="grid grid-cols-4 gap-4">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => {
              setSelectedLanguage(lang);
              setActiveLesson(null);
            }}
            className={cn(
              "p-4 rounded-2xl text-left transition-all border",
              selectedLanguage.id === lang.id
                ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-400 shadow-lg"
                : "bg-white text-slate-700 border-slate-200 hover:border-amber-300"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{lang.flag}</span>
              <div>
                <p className="font-bold">{lang.name}</p>
                <p className={cn("text-xs", selectedLanguage.id === lang.id ? "text-amber-100" : "text-slate-500")}>
                  {lang.region}
                </p>
              </div>
            </div>
            <p className={cn("text-xs", selectedLanguage.id === lang.id ? "text-amber-100" : "text-slate-400")}>
              {lang.speakers} speakers
            </p>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Lessons */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {selectedLanguage.flag} {selectedLanguage.name} Lessons
          </h2>
          
          {currentLessons.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {currentLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      lesson.level === 'beginner' && "bg-green-100 text-green-700",
                      lesson.level === 'intermediate' && "bg-yellow-100 text-yellow-700",
                      lesson.level === 'advanced' && "bg-red-100 text-red-700"
                    )}>
                      {lesson.level}
                    </span>
                    <span className="text-slate-400 text-sm">{lesson.words.length} phrases</span>
                  </div>
                  <h3 className="font-bold text-slate-800">{lesson.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">Tap to start learning</p>
                  <button className="w-full mt-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-all">
                    Start Lesson →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="font-bold text-slate-800 mb-2">Lessons Coming Soon!</h3>
              <p className="text-slate-500">
                We're working on adding {selectedLanguage.name} lessons. Check back soon!
              </p>
            </div>
          )}

          {/* Cultural Content */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4">🎭 Cultural Stories & Songs</h2>
            <div className="grid grid-cols-2 gap-4">
              {culturalContent.map((content) => (
                <div key={content.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs">{content.language}</span>
                    <span className="px-2 py-1 bg-amber-500/30 rounded-full text-xs text-amber-300">{content.type}</span>
                  </div>
                  <h3 className="font-bold">{content.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{content.description}</p>
                  <button className="mt-4 text-amber-400 text-sm font-medium hover:text-amber-300">
                    Explore →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">📝 Quick Reference</h3>
            <div className="space-y-2">
              {(currentLessons[0]?.words || ['Select a language to see phrases']).map((word, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl text-sm">
                  {word}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
            <h3 className="font-bold mb-3">🎯 Learning Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Words Learned</span>
                  <span>24/50</span>
                </div>
                <div className="h-2 bg-white/30 rounded-full">
                  <div className="h-full w-1/2 bg-white rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Phrases Mastered</span>
                  <span>12/30</span>
                </div>
                <div className="h-2 bg-white/30 rounded-full">
                  <div className="h-full w-2/5 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">🔊 Audio Practice</h3>
            <button className="w-full py-4 bg-blue-100 text-blue-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-200 transition-all">
              🎤 Practice Pronunciation
            </button>
          </div>
        </div>
      </div>

      {/* Lesson Modal */}
      {activeLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">{selectedLanguage.name}</p>
                  <h2 className="text-xl font-bold">{activeLesson.title}</h2>
                </div>
                <button onClick={() => setActiveLesson(null)} className="text-white/80 hover:text-white">
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-amber-100">
                  Word {currentWordIndex + 1} of {activeLesson.words.length}
                </span>
              </div>
              <div className="h-1 bg-white/30 rounded-full mt-2">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${((currentWordIndex + 1) / activeLesson.words.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="p-8">
              <div className="text-center py-8 bg-slate-50 rounded-2xl mb-6">
                <p className="text-2xl font-bold text-slate-800 mb-4">
                  {activeLesson.words[currentWordIndex]}
                </p>
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2 mx-auto">
                  🔊 Listen
                </button>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setCurrentWordIndex(Math.max(0, currentWordIndex - 1))}
                  disabled={currentWordIndex === 0}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium disabled:opacity-50"
                >
                  ← Previous
                </button>
                {currentWordIndex < activeLesson.words.length - 1 ? (
                  <button 
                    onClick={() => setCurrentWordIndex(currentWordIndex + 1)}
                    className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-medium"
                  >
                    Next →
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setActiveLesson(null);
                      setCurrentWordIndex(0);
                    }}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium"
                  >
                    Complete ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
