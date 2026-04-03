import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MessageSquare, AlertCircle } from 'lucide-react';

const MultilingualHealthChat = ({ 
  copy = {}, 
  language = 'en',
  onLanguageChange = () => {},
  userProfile = {}
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Quick action prompts based on language
  const quickPrompts = {
    en: [
      'What should I eat with fever?',
      'What should I do for cough?',
      'When should I take ORS?'
    ],
    hi: [
      'बुखार में क्या खाएं?',
      'खांसी के लिए क्या करें?',
      'ORS कब लेना चाहिए?'
    ]
  };

  const placeholders = {
    en: 'Ask your health question...',
    hi: 'अपना स्वास्थ्य प्रश्न पूछें...'
  };

  const welcomeMessages = {
    en: `Hello ${userProfile.name || 'there'}! I can help you with basic health guidance. Ask me anything about common health concerns.`,
    hi: `नमस्ते ${userProfile.name || 'there'}! मैं आपकी सामान्य स्वास्थ्य जानकारी में मदद कर सकता हूँ। मुझसे आम स्वास्थ्य समस्याओं के बारे में कुछ भी पूछें।`
  };

  const disclaimerMessages = {
    en: 'This chat is for basic guidance only. It does not replace a doctor.',
    hi: 'यह चैट केवल बुनियादी निर्देश के लिए है। यह डॉक्टर की जगह नहीं ले सकता।'
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        sender: 'bot',
        text: welcomeMessages[language] || welcomeMessages.en,
        timestamp: new Date()
      }]);
    }
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (globalThis.localStorage === undefined) {
      return;
    }

    const trimmed = messages.slice(-6).map((message) => ({
      sender: message.sender,
      text: message.text,
      timestamp: message.timestamp?.toISOString?.() ?? new Date().toISOString(),
    }));

    globalThis.localStorage.setItem('medvision-chat-history', JSON.stringify(trimmed));
  }, [messages]);

  const generateBotResponse = (userMessage) => {
    // Mock responses based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    const responses = {
      en: {
        fever: 'For fever, rest well, drink plenty of water, and take paracetamol if fever is above 101°F. Monitor your temperature regularly.',
        cough: 'For cough, stay hydrated, add honey to warm milk, and avoid irritants. If cough persists beyond 2 weeks, consult a doctor.',
        ors: 'ORS (Oral Rehydration Solution) should be taken when you have diarrhea or severe vomiting to replace lost fluids and electrolytes.',
        default: 'That\'s an important health question. For personalized advice, please consult with a healthcare professional.'
      },
      hi: {
        fever: 'बुखार के लिए, अच्छी तरह आराम करें, बहुत पानी पिएं, और तापमान 101°F से अधिक हो तो पैरासिटामोल लें। नियमित रूप से अपना तापमान मापें।',
        cough: 'खांसी के लिए, हाइड्रेटेड रहें, गर्म दूध में शहद मिलाएं, और जलन से बचें। अगर खांसी 2 हफ्ते से ज्यादा रहे तो डॉक्टर से परामर्श लें।',
        ors: 'ORS (मौखिक पुनर्जलीकरण समाधान) दस्त या गंभीर उल्टी होने पर लेना चाहिए ताकि खोए हुए तरल पदार्थ और इलेक्ट्रोलाइट्स की जगह हो सके।',
        default: 'यह एक महत्वपूर्ण स्वास्थ्य प्रश्न है। व्यक्तिगत सलाह के लिए, कृपया स्वास्थ्य पेशेवर से परामर्श लें।'
      }
    };

    const langResponses = responses[language] || responses.en;

    if (lowerMessage.includes('fever') || lowerMessage.includes('बुखार')) {
      return langResponses.fever;
    }
    if (lowerMessage.includes('cough') || lowerMessage.includes('खांसी')) {
      return langResponses.cough;
    }
    if (lowerMessage.includes('ors')) {
      return langResponses.ors;
    }
    return langResponses.default;
  };

  const handleSendMessage = (message = null) => {
    const messageText = message || input.trim();
    
    if (!messageText) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: generateBotResponse(messageText),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 p-6 text-white shadow-xl md:p-8 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex rounded-full bg-indigo-900/40 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                AI Health Assistant
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight">Multilingual Health Chat</h2>
              <p className="mt-2 max-w-3xl text-sm text-indigo-100 md:text-base">
                Use it for simple questions, preventive advice, and next-step guidance.
              </p>
            </div>
            <button
              onClick={() => {
                const nextLang = language === 'en' ? 'hi' : 'en';
                onLanguageChange(nextLang);
              }}
              className="rounded-2xl bg-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/30"
            >
              {language === 'en' ? 'HINDI' : 'ENGLISH'}
            </button>
          </div>
        </section>

        {/* Chat Container */}
        <div className="rounded-3xl border border-indigo-100 bg-white shadow-md overflow-hidden flex flex-col h-[600px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-slate-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto text-indigo-300 mb-3" />
                  <p className="text-gray-500">Loading chat...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-sm rounded-2xl p-4 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-br-none'
                          : 'bg-slate-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-teal-100' : 'text-gray-500'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-gray-800 rounded-2xl rounded-bl-none p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="border-t border-gray-100 p-4 bg-white">
              <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
                {language === 'en' ? 'Common Questions' : 'सामान्य प्रश्न'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {quickPrompts[language].map((prompt) => (
                  <button
                    key={`prompt-${prompt}`}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-60"
                    disabled={isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="border-t border-gray-100 bg-white p-4 flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholders[language] || placeholders.en}
              disabled={isLoading}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-bold text-white transition hover:from-amber-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>

          {/* Disclaimer */}
          <div className="border-t border-gray-100 bg-slate-50 px-4 py-3">
            <div className="flex gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-xs text-gray-600">
                {disclaimerMessages[language] || disclaimerMessages.en}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MultilingualHealthChat.propTypes = {
  copy: PropTypes.object,
  language: PropTypes.oneOf(['en', 'hi']),
  onLanguageChange: PropTypes.func,
  userProfile: PropTypes.shape({
    name: PropTypes.string,
  }),
};

MultilingualHealthChat.defaultProps = {
  copy: {},
  language: 'en',
  onLanguageChange: () => {},
  userProfile: {},
};

export default MultilingualHealthChat;
