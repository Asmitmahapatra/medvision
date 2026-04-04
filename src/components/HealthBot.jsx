import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Send, User, Bot } from 'lucide-react';
import BackButton from './BackButton';

const HealthBot = ({ copy }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: copy.healthBot.welcome
    }
  ]);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: copy.healthBot.welcome
      }
    ]);
  }, [copy.healthBot.welcome]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { id: Date.now(), sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simulate API Response for MVP Demo
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1,
        sender: 'bot', 
        text: copy.healthBot.followUp
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto bg-white border-x border-gray-100">
      
      {/* Back Button Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <BackButton to="/" label={copy.backButton || 'Back to Home'} copy={copy} />
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={msg.id ?? idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-brand-teal text-white'}`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={copy.healthBot.placeholder}
          className="flex-1 bg-gray-100 text-gray-800 text-sm rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-brand-teal transition-all"
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="bg-brand-teal text-white p-3 rounded-full hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

HealthBot.propTypes = {
  copy: PropTypes.shape({
    healthBot: PropTypes.shape({
      welcome: PropTypes.string.isRequired,
      followUp: PropTypes.string.isRequired,
      placeholder: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default HealthBot;