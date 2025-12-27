
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { sendMessage } from '../services/geminiService';
import { Message, Shipment } from '../types';

const ChatMessage = memo(({ msg }: { msg: Message }) => {
  const isModel = msg.role === 'model';
  return (
    <div className={`flex ${isModel ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg text-sm relative group ${isModel ? 'bg-white text-slate-800 rounded-bl-none border border-slate-200' : 'bg-blue-600 text-white rounded-br-none'}`}>
        <p className="leading-relaxed">{msg.text}</p>
        <div className={`text-[9px] mt-2 font-bold uppercase opacity-50 ${isModel ? 'text-slate-400 text-right' : 'text-blue-200 text-left'}`}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
});

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: 'مرحباً بكم في أمازون مارين. أنا مساعدكم الذكي للوجستيات. كيف يمكنني مساعدتكم اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const text = (overrideInput || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const shipments: Shipment[] = JSON.parse(localStorage.getItem('amz_shipments') || '[]');
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      
      const response = await sendMessage(text, history, shipments);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response || 'نعتذر، حدثت مشكلة تقنية.',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'عذراً، نظام الذكاء الاصطناعي منشغل حالياً. يرجى المحاولة بعد قليل.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[550px] bg-slate-50/50 rounded-3xl shadow-2xl overflow-hidden border border-white/50 backdrop-blur-xl" dir="rtl">
      <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <i className="fas fa-robot text-lg"></i>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-black uppercase tracking-widest">Amazon Intelligence</h3>
            <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Live Link Active
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => <ChatMessage key={msg.id} msg={msg} />)}
        {isLoading && (
          <div className="flex justify-end animate-pulse">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={(e) => handleSend(e)} className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="كيف يمكنني خدمتك اليوم؟"
          className="flex-1 px-6 py-4 rounded-2xl bg-slate-100/50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all text-right font-medium"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-95"
        >
          <i className="fas fa-paper-plane transform rotate-180"></i>
        </button>
      </form>
    </div>
  );
};

export default memo(ChatBot);
