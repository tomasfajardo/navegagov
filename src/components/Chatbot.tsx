'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'bot'; text: string; error?: boolean }[]>([
    { role: 'bot', text: 'Olá! Sou o assistente NavegaGov. Como posso ajudar com os serviços públicos hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setMessage('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();
      
      if (data.error) {
        setChat(prev => [...prev, { 
          role: 'bot', 
          text: data.reply || 'Ocorreu um erro no servidor.', 
          error: true 
        }]);
      } else {
        setChat(prev => [...prev, { role: 'bot', text: data.reply }]);
      }
    } catch (err) {
      setChat(prev => [...prev, { 
        role: 'bot', 
        text: 'Não consegui ligar ao servidor. Verifica a tua ligação.', 
        error: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] glass rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">Assistente NavegaGov</p>
                  <p className="text-[10px] opacity-80">Inteligência Artificial Gemini</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-md transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : msg.error 
                        ? 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/30 dark:border-red-900 rounded-bl-none flex items-start gap-2'
                        : 'bg-accent text-foreground rounded-bl-none'
                  }`}>
                    {msg.error && <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-accent p-3 rounded-2xl rounded-bl-none">
                    <Loader2 size={16} className="animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escreve a tua dúvida..."
                  className="flex-grow bg-accent border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !message.trim()}
                  className="bg-primary text-white p-2 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
