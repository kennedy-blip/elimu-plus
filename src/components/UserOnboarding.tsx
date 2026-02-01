import { useState } from 'react';
import { cn } from '../utils/cn';
import { Grade } from '../types';

interface UserOnboardingProps {
  grade: Grade;
  onComplete: (name: string, school: string) => void;
  onBack: () => void;
}

const kenyanSchools = [
  "Alliance High School",
  "Kenya High School",
  "Starehe Boys Centre",
  "Moi Girls School",
  "Nairobi School",
  "Mangu High School",
  "Loreto Convent Msongari",
  "St. Mary's School",
  "Riara Group of Schools",
  "Brookhouse School",
  "Aga Khan Academy",
  "Rusinga School",
  "Hillcrest International School",
  "Banda School",
  "Other"
];

export function UserOnboarding({ grade, onComplete, onBack }: UserOnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [customSchool, setCustomSchool] = useState('');
  const [errors, setErrors] = useState<{ name?: string; school?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLevelName = () => {
    if (grade <= 6) return 'Upper Primary';
    if (grade <= 9) return 'Junior Secondary';
    return 'Senior School';
  };

  const getLevelColor = () => {
    if (grade <= 6) return 'from-green-500 to-emerald-600';
    if (grade <= 9) return 'from-blue-500 to-indigo-600';
    return 'from-purple-500 to-violet-600';
  };

  const validateStep1 = () => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      newErrors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { school?: string } = {};
    const selectedSchool = school === 'Other' ? customSchool : school;
    
    if (!selectedSchool.trim()) {
      newErrors.school = 'Please select or enter your school name';
    } else if (selectedSchool.trim().length < 3) {
      newErrors.school = 'School name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    const finalSchool = school === 'Other' ? customSchool : school;
    
    // Simulate a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onComplete(name.trim(), finalSchool.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">←</span>
          <span>Back to Grade Selection</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-8 pb-8">
        <div className="w-full max-w-xl">
          {/* Grade Badge */}
          <div className="text-center mb-8">
            <div className={cn(
              "inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r text-white",
              getLevelColor()
            )}>
              <span className="text-2xl">📚</span>
              <div className="text-left">
                <p className="text-sm text-white/80">Selected Grade</p>
                <p className="font-bold">Grade {grade} • {getLevelName()}</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
              step >= 1 ? "bg-white text-slate-800" : "bg-white/10 text-slate-400"
            )}>
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold",
                step >= 1 ? "bg-green-500 text-white" : "bg-white/20"
              )}>1</span>
              <span className="font-medium text-sm">Your Name</span>
            </div>
            <div className="w-8 h-0.5 bg-white/20" />
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
              step >= 2 ? "bg-white text-slate-800" : "bg-white/10 text-slate-400"
            )}>
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold",
                step >= 2 ? "bg-green-500 text-white" : "bg-white/20"
              )}>2</span>
              <span className="font-medium text-sm">Your School</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-4xl mb-4">
                    👋
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">What's your name?</h2>
                  <p className="text-slate-400">Let's personalize your learning experience</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({});
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    placeholder="e.g., Amani Wanjiku"
                    className={cn(
                      "w-full px-4 py-4 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all",
                      errors.name 
                        ? "border-red-500 focus:ring-red-500" 
                        : "border-white/20 focus:ring-green-500"
                    )}
                    autoFocus
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <span>⚠️</span> {errors.name}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2",
                    "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30"
                  )}
                >
                  Continue <span>→</span>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-4xl mb-4">
                    🏫
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Which school do you attend?</h2>
                  <p className="text-slate-400">This helps us tailor content to your curriculum</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    School Name
                  </label>
                  <select
                    value={school}
                    onChange={(e) => {
                      setSchool(e.target.value);
                      if (errors.school) setErrors({});
                    }}
                    className={cn(
                      "w-full px-4 py-4 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer",
                      errors.school && school !== 'Other'
                        ? "border-red-500 focus:ring-red-500" 
                        : "border-white/20 focus:ring-blue-500"
                    )}
                  >
                    <option value="" className="bg-slate-800">Select your school...</option>
                    {kenyanSchools.map(s => (
                      <option key={s} value={s} className="bg-slate-800">{s}</option>
                    ))}
                  </select>
                </div>

                {school === 'Other' && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Enter your school name
                    </label>
                    <input
                      type="text"
                      value={customSchool}
                      onChange={(e) => {
                        setCustomSchool(e.target.value);
                        if (errors.school) setErrors({});
                      }}
                      placeholder="e.g., Nairobi Primary School"
                      className={cn(
                        "w-full px-4 py-4 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all",
                        errors.school 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-white/20 focus:ring-blue-500"
                      )}
                      autoFocus
                    />
                  </div>
                )}

                {errors.school && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span> {errors.school}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 rounded-xl font-bold text-lg border border-white/20 text-white hover:bg-white/10 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={cn(
                      "flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2",
                      isSubmitting
                        ? "bg-slate-600 text-slate-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <>Start Learning 🚀</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <p className="text-center text-slate-500 text-sm mt-6">
            🔒 Your information is stored locally on your device and is never shared.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center border-t border-white/10">
        <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
          <span>🇰🇪 Republic of Kenya</span>
          <span>•</span>
          <span>Aligned with KICD Curriculum</span>
        </div>
      </footer>
    </div>
  );
}
