import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { AI_SYSTEM_PROMPT } from '../src/data/aiPrompt';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

// DeepSeek API 配置
// 注意：API Key 会暴露在前端，请设置账户消费上限
const DEEPSEEK_API_KEY = 'sk-a0de18121c3446079f8180a073ed880b';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 预设的快捷问题
const QUICK_QUESTIONS = {
  zh: [
    '你是谁？',
    '你擅长什么？',
    '有什么代表作品？',
    '怎么联系你？',
  ],
  en: [
    'Who are you?',
    'What are your skills?',
    'Featured projects?',
    'How to contact?',
  ],
};

// 调用 DeepSeek API
const callDeepSeekAPI = async (
  messages: { role: string; content: string }[],
  language: Language
): Promise<string> => {
  // 如果没有配置 API Key，使用模拟回复
  if (!DEEPSEEK_API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return language === 'zh' 
      ? '你好！我是 Young 的 AI 助手。目前 API 尚未配置，请联系 Young 获取更多信息。邮箱：leeyoung0821@163.com'
      : "Hi! I'm Young's AI assistant. The API is not configured yet. Please contact Young for more info. Email: leeyoung0821@163.com";
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT[language] },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || (language === 'zh' ? '抱歉，我暂时无法回答。' : 'Sorry, I cannot answer right now.');
  } catch (error) {
    console.error('DeepSeek API error:', error);
    return language === 'zh' 
      ? '抱歉，网络出现问题，请稍后再试。'
      : 'Sorry, there was a network issue. Please try again later.';
  }
};

export const AiChat: React.FC<AiChatProps> = ({ isOpen, onClose, language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // 构建对话历史（只保留最近10条消息以节省 token）
      const chatHistory = newMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      const response = await callDeepSeekAPI(chatHistory, language);
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI response error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* 聊天窗口 */}
      <div className="relative w-full max-w-lg mx-4 bg-cream border-2 border-primary shadow-2xl animate-fade-in flex flex-col"
           style={{ maxHeight: 'calc(100vh - 80px)', height: '600px' }}>
        
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center">
              <Bot size={20} className="text-cream" />
            </div>
            <div>
              <h3 className="font-black text-primary text-sm uppercase tracking-wide">
                {language === 'zh' ? 'AI 助手' : 'AI Assistant'}
              </h3>
              <p className="text-[10px] text-primary/50 font-mono">
                {language === 'zh' ? '由 DeepSeek 驱动' : 'Powered by DeepSeek'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 欢迎消息 */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-primary/60" />
              </div>
              <h4 className="font-bold text-primary mb-2">
                {language === 'zh' ? '你好！有什么想问的？' : 'Hi! What would you like to know?'}
              </h4>
              <p className="text-xs text-primary/50 mb-6">
                {language === 'zh' 
                  ? '我可以回答关于 Young 的作品、技能和经历的问题'
                  : "I can answer questions about Young's work, skills, and experience"}
              </p>
              
              {/* 快捷问题 */}
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_QUESTIONS[language].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 text-xs border border-primary/20 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 消息列表 */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* 头像 */}
              <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-[#E63946]' 
                  : 'bg-primary'
              }`}>
                {msg.role === 'user' 
                  ? <User size={14} className="text-cream" />
                  : <Bot size={14} className="text-cream" />
                }
              </div>
              
              {/* 消息内容 */}
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#E63946] text-cream'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {msg.content}
                </div>
                <div className="text-[10px] text-primary/30 mt-1 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* 加载状态 */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <Bot size={14} className="text-cream" />
              </div>
              <div className="bg-primary/10 px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <form onSubmit={handleSubmit} className="border-t-2 border-primary p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'zh' ? '输入你的问题...' : 'Type your question...'}
              className="flex-1 px-4 py-3 bg-primary/5 border-2 border-transparent focus:border-primary text-sm text-primary placeholder:text-primary/40 outline-none transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-primary text-cream flex items-center justify-center hover:bg-[#E63946] disabled:opacity-40 disabled:hover:bg-primary transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-primary/30 mt-2 text-center font-mono">
            {language === 'zh' ? 'AI 回复仅供参考' : 'AI responses are for reference only'}
          </p>
        </form>
      </div>
    </div>,
    document.body
  );
};
