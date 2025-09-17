// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';

// const botWelcome = {
//   role: 'bot',
//   text: 'Hi — I can help you find auto parts, check order status, or suggest compatible parts. How can I help today?',
// };

// const suggestions = [
//   'Search for brake pads',
//   'Where is my order?',
//   'Suggest a battery for Toyota',
//   'How to become a dealer?',
// ];

// const Chatbot = () => {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([botWelcome]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     if (open && containerRef.current) {
//       containerRef.current.scrollTop = containerRef.current.scrollHeight;
//     }
//   }, [messages, open]);

//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.key === 'Escape') setOpen(false);
//     };
//     window.addEventListener('keydown', onKey);
//     return () => window.removeEventListener('keydown', onKey);
//   }, []);

//   const sendMessage = async (text) => {
//     if (!text || !text.trim()) return;
//     const userMsg = { role: 'user', text: text.trim(), ts: Date.now() };
//     setMessages((m) => [...m, userMsg]);
//     setInput('');
//     setLoading(true);
//     try {
//       const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
//       const url = `${base.replace(/\/$/, '')}/api/chatbot/ai-response`;
//       console.log('Chatbot calling URL:', url);

//   const res = await axios.post(url, { prompt: text.trim() });
//       const data = res.data;
//       console.log('Chatbot response data:', data);

//       const botText = data && data.response ? data.response : 'Sorry, no reply from server.';
//       const botReply = { role: 'bot', text: botText, ts: Date.now() };
//       setMessages((m) => [...m, botReply]);
//     } catch (err) {
//       console.error('Chatbot error:', err);
//       const serverMessage = err?.response?.data?.message || err?.response?.data || err.message;
//       setMessages((m) => [
//         ...m,
//         { role: 'bot', text: `Error: ${serverMessage}`, ts: Date.now() },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onSubmit = (e) => {
//     e.preventDefault();
//     sendMessage(input);
//   };

//   const quick = (s) => {
//     sendMessage(s);
//     setOpen(true);
//   };

//   // very small sanitizer + markdown-lite renderer
//   const escapeHtml = (unsafe) => {
//     return unsafe
//       .replace(/&/g, '&amp;')
//       .replace(/</g, '&lt;')
//       .replace(/>/g, '&gt;')
//       .replace(/"/g, '&quot;')
//       .replace(/'/g, '&#039;');
//   };

//   const renderMessageAsHTML = (text) => {
//     if (!text) return '';
//     // escape first
//     let out = escapeHtml(text);
//     // paragraphs / line breaks
//     out = out.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
//     // bold **text**
//     out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
//     // italics *text*
//     out = out.replace(/\*(.*?)\*/g, '<em>$1</em>');
//     // ordered lists starting with numbers
//     out = out.replace(/(?:<p>)?\s*\d+\.\s+(.*?)(?:<\/p>)?/g, '<ol><li>$1</li></ol>');
//     // unordered lists - lines starting with - or *
//     out = out.replace(/(?:<p>)?\s*[-\*]\s+(.*?)(?:<\/p>)?/g, '<ul><li>$1</li></ul>');
//     return out;
//   };

//   return (
//     <div>
//       {/* Floating button */}
//       <div className="fixed inset-x-0 bottom-4 flex justify-center md:justify-end md:right-4 md:bottom-6 z-50 pointer-events-none">
//         <div className="flex flex-col items-end space-y-2 pointer-events-auto">
//           {open && (
//             <div className="hidden sm:block mb-2 text-xs text-gray-500 bg-white px-3 py-2 rounded shadow max-w-xs">
//               Need help? Try:
//               <div className="mt-2 flex flex-wrap gap-2">
//                 {suggestions.map((s) => (
//                   <button
//                     key={s}
//                     onClick={() => quick(s)}
//                     className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
//                   >
//                     {s}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           <button
//             aria-label={open ? 'Close chat' : 'Open chat'}
//             onClick={() => setOpen((o) => !o)}
//             className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
//           >
//             {open ? (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6 text-white"
//                 viewBox="0 0 24 24"
//                 stroke="white"
//                 aria-hidden="true"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             ) : (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6 text-white"
//                 viewBox="0 0 24 24"
//                 fill="white"
//                 aria-hidden="true"
//               >
//                 <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.9L3 20l1.04-3.5A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//               </svg>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Chat window */}
//       {open && (
//         <div
//           role="dialog"
//           aria-label="AutoParts Assistant"
//           className="fixed z-50 inset-x-3 bottom-20 md:inset-x-auto md:right-4 md:bottom-20 flex justify-center md:block"
//         >
//           <div className="w-full max-w-lg md:max-w-sm bg-white rounded-t-lg md:rounded-lg shadow-lg border">
//             <div className="p-3 border-b flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
//                   A
//                 </div>
//                 <div>
//                   <div className="text-sm font-semibold">AutoParts Assistant</div>
//                   <div className="text-xs text-gray-500">Ask about parts, orders or dealers</div>
//                 </div>
//               </div>
//               <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
//                 Close
//               </button>
//             </div>

//             <div className="px-3 pt-2 pb-0 sm:px-3" role="region" aria-live="polite">
//               {/* Suggestions inside chat on small screens */}
//               <div className="sm:hidden mb-2 text-xs text-gray-600">
//                 Need help? Try:
//                 <div className="mt-2 flex flex-wrap gap-2">
//                   {suggestions.map((s) => (
//                     <button
//                       key={s}
//                       onClick={() => quick(s)}
//                       className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 mr-2 mb-2"
//                     >
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div ref={containerRef} className="max-h-72 overflow-y-auto p-1 sm:p-3 space-y-3">
//                 {messages.map((m, i) => (
//                   <div key={i} className={m.role === 'bot' ? 'flex justify-start' : 'flex justify-end'}>
//                     <div
//                       className={`${
//                         m.role === 'bot'
//                           ? 'bg-gray-100 text-gray-800'
//                           : 'bg-blue-600 text-white'
//                       } px-3 py-2 rounded-lg max-w-[80%]`}
//                     >
//                       {m.role === 'bot' ? (
//                         <div className="text-sm" dangerouslySetInnerHTML={{ __html: renderMessageAsHTML(m.text) }} />
//                       ) : (
//                         <div className="text-sm">{m.text}</div>
//                       )}
//                     </div>
//                   </div>
//                 ))}

//                 {loading && (
//                   <div className="flex justify-start">
//                     <div className="bg-gray-100 px-3 py-2 rounded-lg text-xs text-gray-500">...</div>
//                   </div>
//                 )}
//               </div>

//               <form onSubmit={onSubmit} className="p-3 border-t flex items-center gap-2">
//                 <input
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   placeholder="Ask me about parts or orders..."
//                   className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   aria-label="Chat message"
//                 />
//                 <button
//                   type="submit"
//                   disabled={loading || !input.trim()}
//                   className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
//                 >
//                   Send
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Chatbot;


import React, { useState, useRef, useEffect } from 'react';

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

  const handleSubmit = (text = input) => {
    if (!text.trim()) return;
    
    const newMessage = { role: 'user', text };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    // Simulate response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `Thanks for asking about "${text}". I'd be happy to help you with that! Here's what I found...`
      }]);
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderMessageAsHTML = (text) => {
    return text.replace(/\n/g, '<br>');
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
                  onClick={handleSubmit}
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