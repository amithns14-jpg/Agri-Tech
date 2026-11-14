import React, { useState, useEffect, useRef } from 'react';
import { Api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  MessageSquareCode,
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  Plus,
  HelpCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button, Badge } from '../components/common/Components';

export const ChatbotPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Namaste! I am AgroGuide AI, your agricultural advisory assistant. How can I help you today with your crops, soil, water management, or pest challenges?'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'What crops grow best in Black Soil during Kharif season?',
    'How do I treat yellow leaf curls organically on Tomato plants?',
    'When should I apply Neem-coated urea to Cotton?',
    'How can I save water using drip irrigation in sugarcane?'
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function loadConversations() {
    try {
      const res: any = await Api.getChatConversations();
      if (res.data) setConversations(res.data);
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  }

  async function selectConversation(convId: string) {
    setActiveConversationId(convId);
    try {
      const res: any = await Api.getChatMessages(convId);
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Namaste! I am AgroGuide AI. Ask me any farming or crop question in your preferred language.'
      }
    ]);
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await Api.deleteChatConversation(convId);
      setConversations(conversations.filter(c => c.id !== convId));
      if (activeConversationId === convId) handleNewChat();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSendMessage = async (msgToSend?: string) => {
    const text = msgToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res: any = await Api.sendChatMessage({
        conversation_id: activeConversationId || undefined,
        message: text,
        language
      });

      if (res.data) {
        if (!activeConversationId && res.data.conversationId) {
          setActiveConversationId(res.data.conversationId);
          loadConversations();
        }

        const botMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: res.data.response.answer
        };
        setMessages(prev => [...prev, botMsg]);

        if (res.data.response.suggested_questions?.length > 0) {
          setSuggestedQuestions(res.data.response.suggested_questions);
        }
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I apologize, but I encountered an issue processing your agricultural question. Please try again or verify server configuration.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col md:flex-row gap-6">
      {/* Conversations Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
        <Button
          onClick={handleNewChat}
          size="sm"
          className="w-full mb-3"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          New Conversation
        </Button>

        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
          Saved Conversations
        </span>

        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                activeConversationId === conv.id
                  ? 'bg-brand-50 text-brand-800 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate pr-2">{conv.title}</span>
              <button
                type="button"
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                className="text-slate-400 hover:text-red-500 p-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-slate-400 px-2 py-4 text-center">No previous chats</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Top Banner */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>AgroGuide Farm Assistant</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </h2>
              <p className="text-xs text-slate-400">Context-Aware Agricultural Intelligence</p>
            </div>
          </div>
          <Badge variant="brand">Multilingual</Badge>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                <span>AgroGuide is formulating farmer-friendly advice...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions Pills */}
        {suggestedQuestions.length > 0 && (
          <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              Suggested:
            </span>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="text-[11px] bg-white border border-slate-200 hover:border-brand-400 text-slate-700 px-2.5 py-1 rounded-full shadow-2xs hover:bg-brand-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask an agricultural question in English, Hindi, Kannada, Telugu, Tamil, Malayalam..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <Button
              type="submit"
              isLoading={loading}
              disabled={!inputMessage.trim()}
              className="px-5 py-3 rounded-2xl"
              rightIcon={<Send className="h-4 w-4" />}
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
