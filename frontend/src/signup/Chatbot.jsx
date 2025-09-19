import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const EnhancedChatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: 'Hello! I\'m your AutoParts Assistant. How can I help you find the perfect part today?' 
    }
  ]);
  const containerRef = useRef(null);

  const suggestions = [
    'Find brake pads',
    'Check order status',
    'Locate dealer',
    'Part compatibility'
  ];

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const quick = (suggestion) => {
    setInput(suggestion);
    handleSubmit(suggestion);
  };

  const handleSubmit = async (text = input) => {
    if (!text || !text.trim()) return;

    const newMessage = { role: 'user', text };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const url = `${base.replace(/\/$/, '')}/api/chatbot/ai-response`;
      console.log('Chatbot calling URL:', url, 'prompt:', text);

      const res = await axios.post(url, { prompt: text });
      const botText = res?.data?.response || res?.data || 'Sorry, no reply from server.';

      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (err) {
      console.error('Chatbot request failed', err);
      const serverMessage = err?.response?.data?.error || err?.response?.data || err.message;
      setMessages(prev => [...prev, { role: 'bot', text: `Error: ${serverMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderMessageAsHTML = (text) => {
    if (!text) return '';
    // escape HTML
    const esc = (s) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    const lines = text.split(/\r?\n/);
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (line === '') {
        // paragraph separator
        i++;
        continue;
      }

      // unordered list
      if (/^[-\*]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^[-\*]\s+/.test(lines[i].trim())) {
          const item = lines[i].trim().replace(/^[-\*]\s+/, '');
          items.push(item);
          i++;
        }
        const inner = items.map(it => `<li>${formatInline(esc(it))}</li>`).join('');
        blocks.push(`<ul>${inner}</ul>`);
        continue;
      }

      // ordered list
      if (/^\d+\.\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          const item = lines[i].trim().replace(/^\d+\.\s+/, '');
          items.push(item);
          i++;
        }
        const inner = items.map(it => `<li>${formatInline(esc(it))}</li>`).join('');
        blocks.push(`<ol>${inner}</ol>`);
        continue;
      }

      // normal paragraph (collect consecutive non-empty, non-list lines)
      const paraLines = [line];
      i++;
      while (i < lines.length && lines[i].trim() !== '' && !/^[-\*]\s+/.test(lines[i].trim()) && !/^\d+\.\s+/.test(lines[i].trim())) {
        paraLines.push(lines[i].trim());
        i++;
      }
      const paragraph = paraLines.join(' ');
      blocks.push(`<p>${formatInline(esc(paragraph))}</p>`);
    }

    return blocks.join('');

    // inline formatting: bold **text**, italics *text*
    function formatInline(s) {
      // bold
      s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // italics (avoid conflicting with bold)
      s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // preserve single newlines inside paragraph as <br>
      s = s.replace(/\\n/g, '<br>');
      return s;
    }
  };

  return (
    <div className="font-sans">
      {/* Backdrop blur when chat is open */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Floating button with pulse animation */}
      <div className="fixed inset-x-0 bottom-4 flex justify-center md:justify-end md:right-6 md:bottom-6 z-50 pointer-events-none">
        <div className="flex flex-col items-end space-y-3 pointer-events-auto">
          {/* Suggestions tooltip with smooth animation */}
          <div className={`transform transition-all duration-300 ${
            open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
          }`}>
            <div className="hidden sm:block mb-2 text-xs text-gray-600 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-gray-100 max-w-xs">
              <div className="font-medium text-gray-800 mb-2">Quick suggestions:</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => quick(s)}
                    className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 hover:scale-105 border border-blue-200/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main chat button with enhanced styling */}
          <button
            aria-label={open ? 'Close chat' : 'Open chat'}
            onClick={() => setOpen((o) => !o)}
            className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 ${
              open 
                ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                : 'bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
            } ${!open ? 'animate-pulse' : ''}`}
          >
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            
            {open ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white transform transition-transform duration-200"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.9L3 20l1.04-3.5A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {/* Notification dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-bounce"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Chat window */}
      <div className={`fixed z-50 inset-x-3 bottom-20 md:inset-x-auto md:right-6 md:bottom-24 flex justify-center md:block transition-all duration-300 transform ${
        open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
      }`}>
        <div className="w-full max-w-lg md:max-w-sm bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header with gradient */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center font-bold text-lg border border-white/30">
                  A
                </div>
                <div>
                  <div className="font-semibold text-lg">AutoParts Assistant</div>
                  <div className="text-blue-100 text-sm opacity-90">Online • Ready to help</div>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Quick suggestions for mobile */}
            <div className="sm:hidden p-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
              <div className="text-sm font-medium text-gray-700 mb-3">Quick actions:</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => quick(s)}
                    className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:scale-105 shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages container with custom scrollbar */}
            <div 
              ref={containerRef} 
              className="max-h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50/50"
              role="region" 
              aria-live="polite"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E1 transparent'
              }}
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'bot' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom duration-300`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                    m.role === 'bot'
                      ? 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md'
                  }`}>
                    {m.role === 'bot' ? (
                      <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMessageAsHTML(m.text) }} />
                    ) : (
                      <div className="text-sm leading-relaxed">{m.text}</div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start animate-in slide-in-from-bottom duration-300">
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced input area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-full bg-gray-50 focus-within:bg-white focus-within:border-blue-400 focus-within:shadow-md transition-all duration-200">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about parts, orders, or anything..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none placeholder-gray-500"
                  aria-label="Chat message"
                />
                <button
                  onClick={() => handleSubmit()}
                  disabled={loading || !input.trim()}
                  className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
        
        .slide-in-from-bottom {
          --tw-enter-translate-y: 0.5rem;
        }
        
        /* Custom scrollbar styles */
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        
        div::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 3px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8;
        }
      `}</style>
    </div>
  );
};

export default EnhancedChatbot;