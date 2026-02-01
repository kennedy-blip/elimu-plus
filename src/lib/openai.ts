// OpenAI API Integration for Elimu AI Tutor
// Supports API key from .env file (VITE_OPENAI_API_KEY) or from Settings

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ============================================
// ENVIRONMENT VARIABLE API KEY SUPPORT
// ============================================

// Get API key from environment variable (set in .env file as VITE_OPENAI_API_KEY)
const ENV_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

// Check if environment API key is available
export function hasEnvApiKey(): boolean {
  return !!ENV_API_KEY && ENV_API_KEY.startsWith('sk-');
}

// Get the API key (from env or provided parameter)
export function getApiKey(providedKey?: string): string | undefined {
  // Priority: 1. Provided key, 2. Environment key
  if (providedKey && providedKey.startsWith('sk-')) {
    return providedKey;
  }
  if (ENV_API_KEY && ENV_API_KEY.startsWith('sk-')) {
    return ENV_API_KEY;
  }
  return undefined;
}

// Get the source of the current API key
export function getApiKeySource(providedKey?: string): 'env' | 'settings' | 'none' {
  if (providedKey && providedKey.startsWith('sk-')) {
    return 'settings';
  }
  if (ENV_API_KEY && ENV_API_KEY.startsWith('sk-')) {
    return 'env';
  }
  return 'none';
}

// ============================================
// SYSTEM PROMPT
// ============================================

const SYSTEM_PROMPT = `You are Elimu, an intelligent AI tutor designed specifically for Kenyan students following the Competency-Based Curriculum (CBC). You are warm, encouraging, patient, and educational.

Key aspects of your role:
1. You help students from Grade 4 to Grade 12 with their studies
2. You explain concepts in simple, age-appropriate language
3. You are knowledgeable about Kenyan history, culture, geography, and the CBC curriculum
4. You support all CBC subjects: Mathematics, Science, English, Kiswahili, Social Studies, Creative Arts, Physical Education, Agriculture, Home Science, and more
5. You understand the 7 CBC Core Competencies: Communication & Collaboration, Critical Thinking & Problem Solving, Creativity & Imagination, Citizenship, Digital Literacy, Learning to Learn, and Self-Efficacy
6. You use the 4-level CBC assessment scale: Exceeding Expectations, Meeting Expectations, Approaching Expectations, and Below Expectations
7. You can help with homework, explain concepts, provide practice problems, quiz students, and encourage learning
8. You incorporate Kenyan examples and context when relevant (e.g., Lake Victoria, Mount Kenya, Kenyan history, local wildlife)
9. You support learning in both English and Kiswahili when needed
10. You are aligned with KICD (Kenya Institute of Curriculum Development) guidelines
11. You provide step-by-step solutions for math and science problems
12. You can help with essay writing, comprehension, and creative writing
13. You give constructive feedback and praise effort

Always be positive and encouraging. When students struggle, break down concepts into smaller steps. Use examples from everyday Kenyan life when possible. If asked about non-educational inappropriate topics, politely redirect to learning.

Start responses with relevant emojis to make learning fun. Use formatting like **bold** and bullet points for clarity. Ask follow-up questions to ensure understanding.`;

// ============================================
// MAIN API FUNCTION
// ============================================

export async function sendMessageToOpenAI(
  messages: ChatMessage[],
  apiKey: string,
  studentGrade: number
): Promise<OpenAIResponse> {
  // Get the active API key (from settings or environment)
  const activeApiKey = getApiKey(apiKey);
  
  if (!activeApiKey) {
    console.log('No API key available. Returning fallback response.');
    return {
      success: true,
      message: getFallbackResponse(messages[messages.length - 1]?.content || '', studentGrade),
    };
  }

  const gradeContext = `The student is currently in Grade ${studentGrade} in the Kenyan education system. Adjust your language and examples to be appropriate for this grade level.`;
  
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `${SYSTEM_PROMPT}\n\n${gradeContext}`,
  };

  try {
    console.log('Sending request to OpenAI API...');
    console.log('Using API key from:', getApiKeySource(apiKey));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Better quality and lower cost than gpt-3.5-turbo
        messages: [systemMessage, ...messages],
        max_tokens: 1500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', response.status, errorData);
      
      if (response.status === 401) {
        return {
          success: false,
          message: '',
          error: 'Invalid API key. Please check your OpenAI API key in Settings or .env file.',
        };
      }
      
      if (response.status === 429) {
        return {
          success: false,
          message: '',
          error: 'API rate limit exceeded. Please try again in a moment.',
        };
      }
      
      if (response.status === 503) {
        return {
          success: false,
          message: '',
          error: 'OpenAI service is temporarily unavailable. Please try again later.',
        };
      }
      
      if (response.status === 500) {
        return {
          success: false,
          message: '',
          error: 'OpenAI server error. Please try again later.',
        };
      }

      return {
        success: false,
        message: '',
        error: errorData.error?.message || 'Failed to get response from AI. Please try again.',
      };
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return {
        success: false,
        message: '',
        error: 'Received empty response from AI.',
      };
    }

    console.log('OpenAI response received successfully!');
    return {
      success: true,
      message: assistantMessage,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: '',
        error: 'Network error. Please check your internet connection.',
      };
    }

    return {
      success: false,
      message: '',
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

// ============================================
// API KEY VALIDATION
// ============================================

export function validateApiKey(apiKey: string): boolean {
  // Basic validation - OpenAI keys start with 'sk-' and are typically long
  return apiKey.startsWith('sk-') && apiKey.length > 20;
}

// Async validation that tests the API key with OpenAI
export async function validateApiKeyAsync(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!validateApiKey(apiKey)) {
    return { valid: false, error: 'Invalid API key format. Must start with sk-' };
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    });

    if (response.ok) {
      return { valid: true };
    }
    
    if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    }
    
    if (response.status === 429) {
      // Rate limited but key is valid
      return { valid: true };
    }
    
    return { valid: false, error: `API error: ${response.status}` };
  } catch (error) {
    return { valid: false, error: 'Network error. Please check your connection.' };
  }
}

// Check connection status
export async function checkApiConnection(settingsApiKey?: string): Promise<{
  connected: boolean;
  source: 'env' | 'settings' | 'none';
  error?: string;
}> {
  const activeKey = getApiKey(settingsApiKey);
  const source = getApiKeySource(settingsApiKey);
  
  if (!activeKey) {
    return { connected: false, source: 'none', error: 'No API key configured' };
  }
  
  const validation = await validateApiKeyAsync(activeKey);
  return {
    connected: validation.valid,
    source,
    error: validation.error,
  };
}

// ============================================
// FALLBACK RESPONSES (When API is unavailable)
// ============================================

export function getFallbackResponse(question: string, grade: number): string {
  const lowerQ = question.toLowerCase();
  
  // Greetings
  if (lowerQ.includes('hello') || lowerQ.includes('hi') || lowerQ.includes('jambo') || lowerQ.includes('hey')) {
    return `👋 **Jambo! Hello there!**

Karibu (Welcome) to Elimu AI! I'm your personal learning assistant for Grade ${grade}. 

I'm here to help you with:
- 📚 All your school subjects
- 🧮 Math problems step-by-step
- 📝 Essay writing and Kiswahili
- 🔬 Science explanations
- 🌍 History and Geography
- 💻 Digital literacy
- 🎯 Understanding CBC competencies

${!hasEnvApiKey() ? '\n⚠️ *I\'m running in limited mode. For full AI capabilities, add your OpenAI API key in Settings or .env file.*' : ''}

What would you like to learn today? Just ask me anything! 😊`;
  }
  
  // Photosynthesis
  if (lowerQ.includes('photosynthesis')) {
    return `🌱 **Photosynthesis Explained Simply**

Photosynthesis is how plants make their own food! Here's how it works:

**Ingredients needed:**
- ☀️ Sunlight (energy source)
- 💧 Water (from the roots)
- 🌬️ Carbon dioxide (from the air)

**The Recipe:**
Plants use their green leaves (which contain chlorophyll) to capture sunlight. This energy helps combine water and carbon dioxide to make glucose (sugar) - the plant's food!

**The Bonus:**
Plants release oxygen (O₂) as a by-product, which is what we breathe! 

**Simple Formula:**
\`6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂\`

**Kenyan Example:** 🇰🇪
The tea plants in Kericho and coffee plants in Central Kenya use photosynthesis to grow!

Would you like me to explain any part in more detail?`;
  }
  
  // Math
  if (lowerQ.includes('solve') || lowerQ.includes('equation') || lowerQ.includes('math') || lowerQ.includes('calculate')) {
    return `📐 **Let me help you with math!**

I'd love to help you solve this problem! To give you the best step-by-step solution, please:

1. Type out the complete equation or problem
2. Tell me what operation you're working on (addition, subtraction, algebra, etc.)

**Quick Math Tips for Grade ${grade}:**
- Always follow BODMAS/PEMDAS order of operations:
  - **B**rackets, **O**rders, **D**ivision, **M**ultiplication, **A**ddition, **S**ubtraction
- Check your work by substituting your answer back
- Draw diagrams for word problems

**Example:** To solve 2x + 5 = 13:
1. Subtract 5 from both sides: 2x = 8
2. Divide both sides by 2: x = 4

Share the specific problem, and I'll walk you through it step by step! 🧮`;
  }
  
  // CBC Competencies
  if (lowerQ.includes('competencies') || lowerQ.includes('cbc')) {
    return `🎯 **The 7 CBC Core Competencies**

The Kenya CBC focuses on developing these essential skills:

1. **💬 Communication & Collaboration**
   Working with others and expressing ideas clearly

2. **🧠 Critical Thinking & Problem Solving**
   Analyzing situations and finding solutions

3. **🎨 Creativity & Imagination**
   Coming up with new ideas and innovations

4. **🏛️ Citizenship**
   Being a responsible member of society

5. **💻 Digital Literacy**
   Using technology effectively and responsibly

6. **📚 Learning to Learn**
   Being a self-directed, lifelong learner

7. **⭐ Self-Efficacy**
   Believing in your ability to succeed

**Assessment Levels:**
- 🌟 Exceeding Expectations (4)
- ✅ Meeting Expectations (3)
- 📈 Approaching Expectations (2)
- 📊 Below Expectations (1)

Would you like to know more about any specific competency?`;
  }
  
  // Kenya Independence
  if (lowerQ.includes('kenya') && (lowerQ.includes('independence') || lowerQ.includes('history'))) {
    return `🇰🇪 **Kenya's Independence Story**

**The Journey to Uhuru (Freedom):**

📅 **Key Dates:**
- **1895:** Kenya becomes a British protectorate
- **1920:** Kenya becomes a British colony
- **1952-1960:** Mau Mau uprising for independence
- **December 12, 1963:** Kenya gains independence! 🎉
- **December 12, 1964:** Kenya becomes a Republic

**Key Figures:**
- 👤 **Jomo Kenyatta** - First President, "Father of the Nation"
- 👤 **Dedan Kimathi** - Mau Mau leader and freedom fighter
- 👤 **Oginga Odinga** - Independence leader
- 👤 **Tom Mboya** - Trade unionist and politician
- 👤 **Mekatilili wa Menza** - Giriama resistance leader

**Jamhuri Day:**
Every December 12th, we celebrate Jamhuri (Republic) Day!

**The Kenyan Flag Meaning:**
- ⬛ Black: The people of Kenya
- 🟥 Red: Blood shed for independence
- 🟩 Green: Natural wealth and agriculture
- ⬜ White: Peace and unity
- 🛡️ Maasai shield: Defense of freedom

Would you like to learn more about any specific period or person?`;
  }
  
  // Essay Writing
  if (lowerQ.includes('essay') || lowerQ.includes('writing') || lowerQ.includes('composition')) {
    return `✍️ **How to Write a Great Essay**

**Structure (The Hamburger Method 🍔):**

**1. Introduction (Top Bun)**
- Hook: Start with something interesting
- Background: Brief context
- Thesis: Your main argument/point

**2. Body Paragraphs (The Filling)**
- Topic sentence for each paragraph
- Supporting evidence/examples
- Explanation of how it supports your point
- Transition to next paragraph
- Aim for 2-3 body paragraphs

**3. Conclusion (Bottom Bun)**
- Restate your thesis differently
- Summarize main points
- End with a thought-provoking statement

**Pro Tips for Grade ${grade}:**
📝 Plan before writing (make an outline)
🎯 Stay focused on the topic
📖 Use varied vocabulary
✅ Proofread for spelling and grammar
🔤 Check punctuation and capitalization

**Example Structure:**
\`\`\`
Introduction → Body 1 → Body 2 → Body 3 → Conclusion
\`\`\`

Would you like me to help you with a specific essay topic?`;
  }
  
  // Science
  if (lowerQ.includes('science') || lowerQ.includes('experiment') || lowerQ.includes('biology') || lowerQ.includes('chemistry') || lowerQ.includes('physics')) {
    return `🔬 **Science Help for Grade ${grade}**

I can help you with various science topics:

**Biology 🧬**
- Cells, plants, animals
- Human body systems
- Ecosystems and environment
- Genetics and reproduction

**Chemistry ⚗️**
- Elements and compounds
- Chemical reactions
- States of matter
- Periodic table

**Physics ⚡**
- Forces and motion
- Energy and work
- Light and sound
- Electricity and magnetism

**Earth Science 🌍**
- Weather and climate
- Rocks and minerals
- Water cycle
- Environmental conservation

**Kenyan Examples:**
- 🦁 Wildlife in Maasai Mara (biology)
- 🏔️ Mount Kenya formation (earth science)
- 🌊 Lake Victoria ecosystem (biology/geography)

What science topic would you like to explore?`;
  }
  
  // Kiswahili
  if (lowerQ.includes('kiswahili') || lowerQ.includes('swahili') || lowerQ.includes('sarufi') || lowerQ.includes('insha')) {
    return `📖 **Kiswahili Help - Msaada wa Kiswahili**

Ninaweza kukusaidia na:

**Sarufi (Grammar)**
- Ngeli za nomino (Noun classes)
- Nyakati za vitenzi (Verb tenses)
- Vihusishi na vielezi (Prepositions and adverbs)

**Insha (Essays)**
- Insha za masimulizi (Narrative essays)
- Insha za maelezo (Descriptive essays)
- Barua rasmi na za kirafiki (Formal and informal letters)

**Fasihi (Literature)**
- Hadithi fupi (Short stories)
- Ushairi (Poetry)
- Tamthilia (Drama)

**Msamiati (Vocabulary)**
- Methali (Proverbs)
- Nahau (Idioms)
- Misemo (Sayings)

**Mfano wa Insha Structure:**
1. Utangulizi (Introduction)
2. Kiini (Body)
3. Hitimisho (Conclusion)

Unahitaji msaada gani leo? What help do you need today?`;
  }
  
  // Default response
  return `🤔 **Great question!**

I'd be happy to help you with this! For Grade ${grade} students, I can assist with:

📚 **Subjects I can help with:**
- **Mathematics** - arithmetic, algebra, geometry, word problems
- **Science** - biology, chemistry, physics, experiments
- **English** - grammar, comprehension, essays, vocabulary
- **Kiswahili** - sarufi, insha, fasihi
- **Social Studies** - history, geography, civics
- **Creative Arts** - music, art, drama
- And more!

**To give you the best answer:**
1. Tell me which subject this relates to
2. Explain what specific help you need
3. Share any work you've already done

I'm here to guide you step-by-step. What specific topic would you like to explore? 🎓

${!hasEnvApiKey() ? '\n💡 **Tip:** For unlimited AI responses on any topic, add your OpenAI API key in Settings or create a .env file with VITE_OPENAI_API_KEY=your-key-here' : ''}`;
}