'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  'Como entrego o IRS online?',
  'Como me inscrevo na Segurança Social?',
  'Como ativo a Chave Móvel Digital?',
  'Como me inscrevo no SNS sendo imigrante?',
];

const INITIAL_BOT_MESSAGE = 'Olá! Sou o assistente da NavegaGov. Como posso ajudar-te hoje com os serviços públicos?';

type Message = { role: 'user' | 'bot'; content: string };
type HistoryEntry = { role: 'user' | 'model'; content: string };

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: INITIAL_BOT_MESSAGE }
  ]);
  const [historico, setHistorico] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: historico }),
      });

      const data = await response.json();
      const replyText = data.reply || 'Desculpa, tive um problema ao processar a tua mensagem.';

      setMessages(prev => [...prev, { role: 'bot', content: replyText }]);
      setHistorico(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'model', content: replyText },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'bot', content: '❌ Erro de ligação. Verifica a tua internet e tenta novamente.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isEmptyChat = messages.length === 1;

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[540px] glass rounded-3xl overflow-hidden flex flex-col border border-primary/20"
          >
            {/* Header */}
            <div className="bg-primary p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-bold">Assistente NavegaGov</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-secondary' : 'bg-primary'}`}>
                      {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-accent text-foreground rounded-tl-none'}`}>
                      {msg.role === 'bot' ? (
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer"
                                 className="text-blue-500 underline hover:text-blue-400">
                                {children}
                              </a>
                            ),
                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                            p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Suggestion chips — only shown when chat is empty */}
              {isEmptyChat && !isLoading && (
                <div className="flex flex-col gap-2 mt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left text-xs px-4 py-2 rounded-2xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-accent p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="text-sm">A pensar...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background/50 shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escreve a tua dúvida..."
                  className="flex-grow bg-accent rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  className="bg-primary text-white p-2 rounded-full hover:scale-110 transition-transform disabled:opacity-50"
                  disabled={isLoading || !input.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group relative"
      >
        <MessageCircle size={28} />
        <span className="absolute -top-12 right-0 bg-white dark:bg-slate-800 text-xs px-3 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground font-medium border border-border">
          Precisas de ajuda?
        </span>
      </button>
    </div>
  );
}
