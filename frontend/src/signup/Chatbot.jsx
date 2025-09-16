import React, { useState, useRef, useEffect } from 'react';

const botWelcome = {
  role: 'bot',
  text: 'Hi — I can help you find auto parts, check order status, or suggest compatible parts. How can I help today?',
};

const suggestions = [
  'Search for brake pads',
  'Where is my order?',
  'Suggest a battery for Toyota',
  'How to become a dealer?',
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([botWelcome]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (open && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;
    const userMsg = { role: 'user', text: text.trim(), ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 700));
      const botReply = {
        role: 'bot',
        text: `I looked that up for you: "${text.trim()}" — this is a demo reply.`,
        ts: Date.now(),
      };
      setMessages((m) => [...m, botReply]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'bot', text: 'Sorry, something went wrong.', ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const quick = (s) => {
    sendMessage(s);
    setOpen(true);
  };

  return (
    <div>
      {/* Floating button */}
      <div className="fixed inset-x-0 bottom-4 flex justify-center md:justify-end md:right-4 md:bottom-6 z-50 pointer-events-none">
        <div className="flex flex-col items-end space-y-2 pointer-events-auto">
          {open && (
            <div className="hidden sm:block mb-2 text-xs text-gray-500 bg-white px-3 py-2 rounded shadow max-w-xs">
              Need help? Try:
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => quick(s)}
                    className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            aria-label={open ? 'Close chat' : 'Open chat'}
            onClick={() => setOpen((o) => !o)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
          >
            {open ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                stroke="white"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="white"
                aria-hidden="true"
              >
                <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.9L3 20l1.04-3.5A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Chat window */}
      {open && (
        <div
          role="dialog"
          aria-label="AutoParts Assistant"
          className="fixed z-50 inset-x-3 bottom-20 md:inset-x-auto md:right-4 md:bottom-20 flex justify-center md:block"
        >
          <div className="w-full max-w-lg md:max-w-sm bg-white rounded-t-lg md:rounded-lg shadow-lg border">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  A
                </div>
                <div>
                  <div className="text-sm font-semibold">AutoParts Assistant</div>
                  <div className="text-xs text-gray-500">Ask about parts, orders or dealers</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
                Close
              </button>
            </div>

            <div className="px-3 pt-2 pb-0 sm:px-3" role="region" aria-live="polite">
              {/* Suggestions inside chat on small screens */}
              <div className="sm:hidden mb-2 text-xs text-gray-600">
                Need help? Try:
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => quick(s)}
                      className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 mr-2 mb-2"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div ref={containerRef} className="max-h-72 overflow-y-auto p-1 sm:p-3 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === 'bot' ? 'flex justify-start' : 'flex justify-end'}>
                    <div
                      className={`${
                        m.role === 'bot'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-600 text-white'
                      } px-3 py-2 rounded-lg max-w-[80%]`}
                    >
                      <div className="text-sm">{m.text}</div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-3 py-2 rounded-lg text-xs text-gray-500">...</div>
                  </div>
                )}
              </div>

              <form onSubmit={onSubmit} className="p-3 border-t flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about parts or orders..."
                  className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Chat message"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
