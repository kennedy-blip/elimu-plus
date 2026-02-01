import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { getSettings, updateApiKey, saveUser, getCurrentUser } from '../lib/database';
import { validateApiKey } from '../lib/openai';

export function Settings() {
  const { student, grade, setCurrentView, updateStudent } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'preferences' | 'data'>('profile');
  
  // Profile state
  const [name, setName] = useState(student.name);
  const [school, setSchool] = useState(student.school);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  
  // API Key state
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaving, setApiKeySaving] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'none' | 'valid' | 'invalid' | 'saved'>('none');
  
  // Load existing settings
  useEffect(() => {
    async function loadSettings() {
      const settings = await getSettings(student.id);
      if (settings?.openaiApiKey) {
        setApiKey(settings.openaiApiKey);
        setApiKeyStatus('saved');
      }
    }
    loadSettings();
  }, [student.id]);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        await saveUser({
          ...currentUser,
          name: name.trim(),
          school: school.trim(),
        });
        updateStudent({ name: name.trim(), school: school.trim() });
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
    setProfileSaving(false);
  };

  const handleSaveApiKey = async () => {
    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey) {
      setApiKeyStatus('none');
      return;
    }

    if (!validateApiKey(trimmedKey)) {
      setApiKeyStatus('invalid');
      return;
    }

    setApiKeySaving(true);
    try {
      await updateApiKey(student.id, trimmedKey);
      setApiKeyStatus('saved');
    } catch (error) {
      console.error('Failed to save API key:', error);
      setApiKeyStatus('invalid');
    }
    setApiKeySaving(false);
  };

  const handleRemoveApiKey = async () => {
    try {
      await updateApiKey(student.id, '');
      setApiKey('');
      setApiKeyStatus('none');
    } catch (error) {
      console.error('Failed to remove API key:', error);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold">⚙️ Settings</h1>
            <p className="text-slate-400">Manage your profile, API keys, and preferences</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
        {[
          { id: 'profile', label: 'Profile', icon: '👤' },
          { id: 'api', label: 'AI Configuration', icon: '🤖' },
          { id: 'preferences', label: 'Preferences', icon: '🎨' },
          { id: 'data', label: 'Data & Privacy', icon: '🔒' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
              activeTab === tab.id
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">👤 Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">School Name</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your school"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Grade</label>
                <div className="px-4 py-3 bg-slate-100 rounded-xl text-slate-600">
                  Grade {grade} • {grade <= 6 ? 'Upper Primary' : grade <= 9 ? 'Junior Secondary' : 'Senior School'}
                </div>
                <p className="text-xs text-slate-500 mt-1">To change grade, go back to grade selection</p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className={cn(
                  "w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                  profileSaved
                    ? "bg-green-500 text-white"
                    : "bg-green-600 text-white hover:bg-green-700"
                )}
              >
                {profileSaving ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : profileSaved ? (
                  <>✓ Saved Successfully</>
                ) : (
                  <>💾 Save Changes</>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">📊 Your Stats</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <p className="text-3xl font-bold text-green-600">{student.points}</p>
                <p className="text-sm text-green-700">Total Points</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <p className="text-3xl font-bold text-orange-600">{student.streak}</p>
                <p className="text-sm text-orange-700">Day Streak</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-3xl font-bold text-blue-600">{student.level}</p>
                <p className="text-sm text-blue-700">Current Level</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                <p className="text-3xl font-bold text-purple-600">47</p>
                <p className="text-sm text-purple-700">Quizzes Done</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600 mb-2">Level Progress</p>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" />
              </div>
              <p className="text-xs text-slate-500 mt-1">750 / 1000 XP to Level {student.level + 1}</p>
            </div>
          </div>
        </div>
      )}

      {/* API Configuration Tab */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-2">🤖 OpenAI API Key</h2>
            <p className="text-sm text-slate-500 mb-6">
              Connect your OpenAI API key to enable advanced AI tutoring features
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={showApiKey ? apiKey : maskApiKey(apiKey)}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setApiKeyStatus('none');
                    }}
                    className={cn(
                      "w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all font-mono text-sm",
                      apiKeyStatus === 'invalid' 
                        ? "border-red-300 focus:ring-red-500" 
                        : apiKeyStatus === 'saved'
                          ? "border-green-300 focus:ring-green-500"
                          : "border-slate-200 focus:ring-blue-500"
                    )}
                    placeholder="sk-..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                
                {apiKeyStatus === 'invalid' && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    ⚠️ Invalid API key format. Keys should start with 'sk-'
                  </p>
                )}
                {apiKeyStatus === 'saved' && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    ✅ API key saved and ready to use
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveApiKey}
                  disabled={apiKeySaving || !apiKey.trim()}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                    apiKey.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                >
                  {apiKeySaving ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>🔑 Save API Key</>
                  )}
                </button>
                {apiKeyStatus === 'saved' && (
                  <button
                    onClick={handleRemoveApiKey}
                    className="px-4 py-3 rounded-xl font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">⚠️ Important</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Your API key is stored locally on your device</li>
                <li>• Never share your API key with others</li>
                <li>• API usage will be charged to your OpenAI account</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">🔗 How to Get an API Key</h2>
              
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <div>
                    <p className="font-medium text-slate-800">Visit OpenAI Platform</p>
                    <p className="text-sm text-slate-500">Go to platform.openai.com and create an account</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <div>
                    <p className="font-medium text-slate-800">Navigate to API Keys</p>
                    <p className="text-sm text-slate-500">Go to Settings → API Keys in your dashboard</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <div>
                    <p className="font-medium text-slate-800">Create New Key</p>
                    <p className="text-sm text-slate-500">Click "Create new secret key" and copy it</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                  <div>
                    <p className="font-medium text-slate-800">Add Billing</p>
                    <p className="text-sm text-slate-500">Add a payment method to enable API usage</p>
                  </div>
                </li>
              </ol>

              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-3 bg-slate-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-900 transition-all"
              >
                🔗 Open OpenAI Platform
              </a>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">🎓 Without API Key</h3>
              <p className="text-purple-200 text-sm">
                Elimu AI will still work with built-in responses for common topics. Adding your API key unlocks unlimited, personalized tutoring across all subjects!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">🎨 Appearance</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 rounded-xl border-2 border-green-500 bg-green-50 text-center">
                    <span className="text-2xl">☀️</span>
                    <p className="font-medium text-slate-800 mt-1">Light</p>
                    <span className="text-xs text-green-600">Active</span>
                  </button>
                  <button className="p-4 rounded-xl border border-slate-200 text-center hover:bg-slate-50">
                    <span className="text-2xl">🌙</span>
                    <p className="font-medium text-slate-800 mt-1">Dark</p>
                    <span className="text-xs text-slate-400">Coming Soon</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="language-select" className="block text-sm font-medium text-slate-700 mb-3">Language</label>
                <select
                  id="language-select"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>English</option>
                  <option>Kiswahili</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">🔔 Notifications</h2>
            
            <div className="space-y-4">
              {[
                { label: 'Daily Learning Reminders', enabled: true },
                { label: 'Quiz Due Alerts', enabled: true },
                { label: 'Achievement Unlocked', enabled: true },
                { label: 'Weekly Progress Report', enabled: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-700">{item.label}</span>
                  <button
                    type="button"
                    title={`Toggle ${item.label}`}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all",
                      item.enabled ? "bg-green-500" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white shadow-sm transition-all",
                      item.enabled ? "ml-6" : "ml-0.5"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data & Privacy Tab */}
      {activeTab === 'data' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">💾 Your Data</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700">Local Storage Used</span>
                  <span className="text-slate-600">2.4 MB</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full">
                  <div className="h-full w-1/4 bg-green-500 rounded-full" />
                </div>
              </div>

              <button className="w-full py-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 flex items-center justify-center gap-2">
                📥 Export My Data
              </button>
              
              <button className="w-full py-3 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 flex items-center justify-center gap-2">
                🔄 Sync to Cloud (Coming Soon)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">🔒 Privacy</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">✅ Your Privacy Matters</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• All data is stored locally on your device</li>
                  <li>• We don't track or sell your information</li>
                  <li>• API keys are encrypted and never shared</li>
                </ul>
              </div>

              <button className="w-full py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 flex items-center justify-center gap-2">
                🗑️ Clear All Local Data
              </button>
              
              <p className="text-xs text-slate-500 text-center">
                This will delete all your progress, portfolio items, and settings
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
