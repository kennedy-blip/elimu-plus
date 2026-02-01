import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Grade, Student, Competency, PortfolioItem, ServiceProject, DownloadableContent } from '../types';
import { initDatabase, getCurrentUser, saveUser, getSettings, generateId } from '../lib/database';

type AppView = 'dashboard' | 'portfolio' | 'competencies' | 'quizzes' | 'lessons' | 'labs' | 'languages' | 'community' | 'offline' | 'voice-notes' | 'settings';

interface AppState {
  currentView: AppView;
  viewHistory: AppView[];
  historyIndex: number;
  student: Student;
  grade: Grade;
  gradeSelected: boolean;
  userOnboarded: boolean;
  competencies: Competency[];
  portfolio: PortfolioItem[];
  serviceProjects: ServiceProject[];
  downloads: DownloadableContent[];
  isOffline: boolean;
  aiChatOpen: boolean;
  parentMode: boolean;
  apiKey: string;
  isLoading: boolean;
}

interface AppContextType extends AppState {
  setCurrentView: (view: AppView) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  setGrade: (grade: Grade) => void;
  selectGrade: (grade: Grade) => void;
  completeOnboarding: (name: string, school: string, grade: Grade) => Promise<void>;
  resetGradeSelection: () => void;
  toggleOffline: () => void;
  toggleAIChat: () => void;
  toggleParentMode: () => void;
  addPortfolioItem: (item: PortfolioItem) => void;
  updateCompetency: (id: string, score: number) => void;
  updateStudent: (updates: Partial<Student>) => void;
  setApiKey: (key: string) => void;
}

const defaultCompetencies: Competency[] = [
  { id: '1', name: 'Communication & Collaboration', shortName: 'Communication', level: 'meeting', score: 75, icon: '💬' },
  { id: '2', name: 'Critical Thinking & Problem Solving', shortName: 'Critical Thinking', level: 'exceeding', score: 90, icon: '🧠' },
  { id: '3', name: 'Creativity & Imagination', shortName: 'Creativity', level: 'meeting', score: 70, icon: '🎨' },
  { id: '4', name: 'Citizenship', shortName: 'Citizenship', level: 'approaching', score: 55, icon: '🏛️' },
  { id: '5', name: 'Digital Literacy', shortName: 'Digital Literacy', level: 'exceeding', score: 88, icon: '💻' },
  { id: '6', name: 'Learning to Learn', shortName: 'Self-Learning', level: 'meeting', score: 72, icon: '📚' },
  { id: '7', name: 'Self-Efficacy', shortName: 'Self-Efficacy', level: 'meeting', score: 68, icon: '⭐' },
];

const defaultStudent: Student = {
  id: '',
  name: '',
  grade: 7,
  school: '',
  points: 0,
  streak: 0,
  level: 1,
};

const defaultPortfolio: PortfolioItem[] = [];

const defaultServiceProjects: ServiceProject[] = [];

const defaultDownloads: DownloadableContent[] = [
  { id: '1', title: 'Grade 7 Mathematics Curriculum', type: 'curriculum', subject: 'Mathematics', grade: 7, size: '15 MB', downloaded: false },
  { id: '2', title: 'Integrated Science Notes - Term 1', type: 'notes', subject: 'Science', grade: 7, size: '8 MB', downloaded: false },
  { id: '3', title: 'English Grammar Worksheets', type: 'worksheet', subject: 'English', grade: 7, size: '3 MB', downloaded: false },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentView: 'dashboard',
    viewHistory: ['dashboard'],
    historyIndex: 0,
    student: defaultStudent,
    grade: 7,
    gradeSelected: false,
    userOnboarded: false,
    competencies: defaultCompetencies,
    portfolio: defaultPortfolio,
    serviceProjects: defaultServiceProjects,
    downloads: defaultDownloads,
    isOffline: false,
    aiChatOpen: false,
    parentMode: false,
    apiKey: '',
    isLoading: true,
  });

  // Initialize database and load user data on mount
  useEffect(() => {
    async function loadUserData() {
      try {
        await initDatabase();
        const existingUser = await getCurrentUser();
        
        if (existingUser) {
          // User exists, load their data
          const settings = await getSettings(existingUser.id);
          
          setState(prev => ({
            ...prev,
            student: {
              id: existingUser.id,
              name: existingUser.name,
              grade: existingUser.grade,
              school: existingUser.school,
              points: existingUser.points,
              streak: existingUser.streak,
              level: existingUser.level,
            },
            grade: existingUser.grade,
            gradeSelected: true,
            userOnboarded: true,
            apiKey: settings?.openaiApiKey || '',
            isLoading: false,
          }));
        } else {
          // New user
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }

    loadUserData();
  }, []);

  const setCurrentView = (view: AppView) => {
    setState(prev => {
      const newHistory = [...prev.viewHistory.slice(0, prev.historyIndex + 1), view];
      return {
        ...prev,
        currentView: view,
        viewHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  };

  const navigateBack = () => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          currentView: prev.viewHistory[newIndex],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  };

  const navigateForward = () => {
    setState(prev => {
      if (prev.historyIndex < prev.viewHistory.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          currentView: prev.viewHistory[newIndex],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  };

  const canGoBack = () => state.historyIndex > 0;
  const canGoForward = () => state.historyIndex < state.viewHistory.length - 1;

  const setGrade = (grade: Grade) => setState(prev => ({ ...prev, grade, student: { ...prev.student, grade } }));
  
  const selectGrade = (grade: Grade) => {
    setState(prev => ({
      ...prev,
      grade,
      student: { ...prev.student, grade },
    }));
  };

  const completeOnboarding = async (name: string, school: string, grade: Grade) => {
    const userId = generateId();
    const now = new Date().toISOString();
    
    const newUser = {
      id: userId,
      name,
      school,
      grade,
      points: 0,
      streak: 1,
      level: 1,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await saveUser(newUser);
      
      setState(prev => ({
        ...prev,
        student: {
          id: userId,
          name,
          school,
          grade,
          points: 0,
          streak: 1,
          level: 1,
        },
        grade,
        gradeSelected: true,
        userOnboarded: true,
        currentView: 'dashboard',
        viewHistory: ['dashboard'],
        historyIndex: 0,
      }));
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error;
    }
  };

  const resetGradeSelection = () => setState(prev => ({ 
    ...prev, 
    gradeSelected: false,
    userOnboarded: false,
  }));
  
  const toggleOffline = () => setState(prev => ({ ...prev, isOffline: !prev.isOffline }));
  const toggleAIChat = () => setState(prev => ({ ...prev, aiChatOpen: !prev.aiChatOpen }));
  const toggleParentMode = () => setState(prev => ({ ...prev, parentMode: !prev.parentMode }));
  
  const addPortfolioItem = (item: PortfolioItem) => 
    setState(prev => ({ ...prev, portfolio: [item, ...prev.portfolio] }));
  
  const updateCompetency = (id: string, score: number) =>
    setState(prev => ({
      ...prev,
      competencies: prev.competencies.map(c => 
        c.id === id ? { ...c, score, level: getLevel(score) } : c
      ),
    }));

  const updateStudent = (updates: Partial<Student>) => {
    setState(prev => ({
      ...prev,
      student: { ...prev.student, ...updates },
    }));
  };

  const setApiKey = (key: string) => {
    setState(prev => ({ ...prev, apiKey: key }));
  };

  // Show loading screen while initializing
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500 via-yellow-500 to-red-500 flex items-center justify-center text-4xl shadow-lg animate-pulse mb-4">
            📚
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Elimu Plus</h1>
          <p className="text-slate-400">Loading your learning companion...</p>
          <div className="mt-4 w-48 h-1 bg-slate-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      ...state,
      setCurrentView,
      navigateBack,
      navigateForward,
      canGoBack,
      canGoForward,
      setGrade,
      selectGrade,
      completeOnboarding,
      resetGradeSelection,
      toggleOffline,
      toggleAIChat,
      toggleParentMode,
      addPortfolioItem,
      updateCompetency,
      updateStudent,
      setApiKey,
    }}>
      {children}
    </AppContext.Provider>
  );
}

function getLevel(score: number): 'exceeding' | 'meeting' | 'approaching' | 'below' {
  if (score >= 85) return 'exceeding';
  if (score >= 65) return 'meeting';
  if (score >= 45) return 'approaching';
  return 'below';
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
