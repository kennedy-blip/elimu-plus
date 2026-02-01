import { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';
import { useApp } from '../context/AppContext';
import { sendMessageToOpenAI, getFallbackResponse, hasEnvApiKey, checkApiConnection } from '../lib/openai';
import { getSettings } from '../lib/database';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQuestions = [
  "Explain photosynthesis simply",
  "Help me with algebra",
  "What are CBC competencies?",
  "Kenya's independence story",
  "How to write an essay?",
  "Teach me Kiswahili grammar",
];

const quickTopics: { subject: string; icon: string; color: string }[] = [
  { subject: 'Mathematics', icon: '🧮', color: 'from-blue-500 to-indigo-600' },
  { subject: 'Science', icon: '🔬', color: 'from-green-500 to-emerald-600' },
  { subject: 'English', icon: '📖', color: 'from-purple-500 to-violet-600' },
  { subject: 'Kiswahili', icon: '🗣️', color: 'from-orange-500 to-red-500' },
  { subject: 'History', icon: '🏛️', color: 'from-amber-500 to-orange-600' },
  { subject: 'Geography', icon: '🌍', color: 'from-teal-500 to-cyan-600' },
];

type ConnectionStatus = 'checking' | 'connected' | 'disconnected' | 'limited';

export function AITutor() {
  const { student, grade, setCurrentView } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [apiSource, setApiSource] = useState<'env' | 'settings' | 'none'>('none');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Jambo ${student.name}! 👋 I'm Elimu, your AI learning assistant for Grade ${grade}.\n\nI'm here to help you with your studies across all subjects. You can ask me anything - from solving math problems to explaining science concepts to helping you write essays.\n\n**I can help you with:**\n- 📐 Mathematics and problem solving\n- 🔬 Science (Biology, Chemistry, Physics)\n- 📖 English and Kiswahili\n- 🌍 Geography and History\n- ✍️ Essay writing and compositions\n- 🎯 CBC competencies\n\nWhat would you like to learn today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [student.name, grade]);

  // Load API key and check connection on mount
  useEffect(() => {
    async function initializeAI() {
      setConnectionStatus('checking');
      
      // First check if we have env API key
      const hasEnvKey = hasEnvApiKey();
      
      // Then load settings API key
      const settings = await getSettings(student.id);
      const settingsKey = settings?.openaiApiKey || null;
      setApiKey(settingsKey);
      
      // Check connection
      const connectionResult = await checkApiConnection(settingsKey || undefined);
      
      setApiSource(connectionResult.source);
      
      if (connectionResult.connected) {
        setConnectionStatus('connected');
        console.log(`AI connected via ${connectionResult.source}`);
      } else if (hasEnvKey || settingsKey) {
        setConnectionStatus('limited');
        console.log('AI key found but connection failed:', connectionResult.error);
      } else {
        setConnectionStatus('disconnected');
        setShowApiKeyPrompt(true);
      }
    }
    
    initializeAI();
  }, [student.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Build chat history for context (last 10 messages)
      const chatHistory: ChatMessage[] = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));
      chatHistory.push({ role: 'user', content: text });

      // Call OpenAI API (it will automatically use env key or settings key)
      const response = await sendMessageToOpenAI(chatHistory, apiKey || '', grade);
      
      let responseContent: string;
      let isError = false;

      if (response.success) {
        responseContent = response.message;
        // Update connection status if we got a successful response
        if (connectionStatus !== 'connected') {
          setConnectionStatus('connected');
        }
      } else {
        // Show error but also provide fallback
        responseContent = `⚠️ ${response.error}\n\n---\n\n${getFallbackResponse(text, grade)}`;
        isError = true;
        setConnectionStatus('limited');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        isError,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `😔 I encountered an error. Let me try to help with what I know:\n\n${getFallbackResponse(text, grade)}`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
      setConnectionStatus('limited');
    }

    setIsTyping(false);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowWithSpeech = window as any;
    
    if (windowWithSpeech.webkitSpeechRecognition || windowWithSpeech.SpeechRecognition) {
      const SpeechRecognitionClass = windowWithSpeech.webkitSpeechRecognition || windowWithSpeech.SpeechRecognition;
      
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-KE';
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        if (!isListening) {
          recognition.start();
        }
      }
    } else {
      // Fallback simulation
      setTimeout(() => {
        setInput('Explain photosynthesis in simple terms');
        setIsListening(false);
      }, 2000);
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line) => {
        // Code blocks (simple)
        if (line.startsWith('```')) {
          return '<div class="bg-slate-100 p-2 rounded font-mono text-xs my-2">';
        }
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Inline code
        line = line.replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 rounded text-purple-600">$1</code>');
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return `<div class="flex gap-2"><span>•</span><span>${line.slice(2)}</span></div>`;
        }
        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s+/);
        if (numberedMatch) {
          return `<div class="flex gap-2"><span class="font-bold">${numberedMatch[1]}.</span><span>${line.slice(numberedMatch[0].length)}</span></div>`;
        }
        return line;
      })
      .join('<br/>');
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'limited': return 'bg-amber-500';
      case 'disconnected': return 'bg-red-500';
      case 'checking': return 'bg-blue-500 animate-pulse';
      default: return 'bg-slate-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': 
        return apiSource === 'env' 
          ? 'Connected via .env file' 
          : 'Connected via Settings';
      case 'limited': return 'Limited mode - Using fallback responses';
      case 'disconnected': return 'Offline - Add API key for full features';
      case 'checking': return 'Checking connection...';
      default: return 'Unknown status';
    }
  };

  const clearChat = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Chat cleared! 🔄 How can I help you, ${student.name}?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h1 className="font-bold text-lg">Elimu AI Tutor</h1>
            <p className="text-sm text-purple-200">Your personal learning assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
            title="Clear chat"
          >
            🗑️ Clear
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className="px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* API Key Prompt Banner */}
      {showApiKeyPrompt && connectionStatus === 'disconnected' && (
        <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700 text-sm">
            <span>💡</span>
            <span>
              <strong>Tip:</strong> Add your OpenAI API key to get unlimited AI tutoring!
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('settings')}
              className="px-3 py-1 bg-amber-200 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-300"
            >
              Add in Settings
            </button>
            <button
              onClick={() => setShowApiKeyPrompt(false)}
              className="text-amber-600 hover:text-amber-800 px-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Env Key Success Banner */}
      {connectionStatus === 'connected' && apiSource === 'env' && messages.length <= 1 && (
        <div className="bg-green-50 border-b border-green-200 p-3 flex items-center gap-2 text-green-700 text-sm">
          <span>✅</span>
          <span>
            <strong>Great!</strong> Your API key from the <code className="bg-green-100 px-1 rounded">.env</code> file is working!
          </span>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl p-4",
                message.role === 'user'
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-tr-none"
                  : message.isError
                    ? "bg-amber-50 text-slate-800 border border-amber-200 rounded-tl-none"
                    : "bg-white text-slate-800 shadow-sm border border-slate-200 rounded-tl-none"
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                  <span className="text-lg">🤖</span>
                  <span className="text-sm font-semibold text-purple-600">Elimu AI</span>
                  {connectionStatus === 'connected' && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">AI Mode</span>
                  )}
                  {connectionStatus !== 'connected' && (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">Basic Mode</span>
                  )}
                </div>
              )}
              <div 
                className="text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
              <p className={cn(
                "text-xs mt-2",
                message.role === 'user' ? "text-purple-200" : "text-slate-400"
              )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-slate-500 ml-2">
                  {connectionStatus === 'connected' ? 'Thinking with AI...' : 'Generating response...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Topics */}
      <div className="border-t border-slate-200 px-4 py-2 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {quickTopics.map((topic) => (
            <button
              key={topic.subject}
              onClick={() => handleSend(`Help me with ${topic.subject}`)}
              disabled={isTyping}
              className={cn(
                "px-3 py-1.5 rounded-full text-white text-xs font-medium whitespace-nowrap bg-gradient-to-r hover:opacity-90 transition-opacity",
                topic.color,
                isTyping && "opacity-50 cursor-not-allowed"
              )}
            >
              {topic.icon} {topic.subject}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200">
        <div className="flex gap-2 overflow-x-auto">
          {suggestedQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(question)}
              disabled={isTyping}
              className={cn(
                "px-3 py-1.5 bg-white text-slate-600 rounded-full text-xs border border-slate-200 whitespace-nowrap hover:border-purple-300 hover:text-purple-600 transition-all",
                isTyping && "opacity-50 cursor-not-allowed"
              )}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={handleVoiceInput}
            disabled={isTyping}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0",
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              isTyping && "opacity-50 cursor-not-allowed"
            )}
            title={isListening ? "Listening..." : "Voice input"}
          >
            🎤
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSend()}
            placeholder={isListening ? "Listening..." : "Ask me anything..."}
            className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            disabled={isTyping}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0",
              input.trim() && !isTyping
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg"
                : "bg-slate-100 text-slate-400"
            )}
          >
            ➤
          </button>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-400">
          <span className={cn("w-2 h-2 rounded-full", getStatusColor())} />
          <span>{getStatusText()}</span>
        </div>
      </div>
    </div>
  );
}