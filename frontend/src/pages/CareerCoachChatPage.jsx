import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronLeft,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { sendCareerCoachChat, getCareerCoachOverview } from '../services/careerCoachApi';

const CareerCoachChatPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your AI Placement Career Coach. I analyze your verified performance metrics across resumes, job matching, aptitude, technical MCQs, coding challenges, and mock interviews to provide data-driven preparation strategy. What would you like to ask today?",
      suggestedActions: [
        { label: "What should I study today?", prompt: "What should I study today?" },
        { label: "Why is my placement readiness score low?", prompt: "Why is my placement readiness score low?" },
        { label: "How can I improve DSA?", prompt: "How can I improve DSA?" },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchContext = async () => {
    try {
      const res = await getCareerCoachOverview();
      if (res.success) setOverview(res.data);
    } catch (err) {
      console.error('Failed to load overview context');
    }
  };

  useEffect(() => {
    fetchContext();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (userPrompt) => {
    const promptToSend = userPrompt || input.trim();
    if (!promptToSend || loading) return;

    const newMessages = [...messages, { sender: 'user', text: promptToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await sendCareerCoachChat(promptToSend);
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.answer,
            suggestedActions: res.suggestedActions || [],
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I experienced an error retrieving your coach analysis. Please check your network connection or try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-slate-850 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="flex items-center space-x-3">
            <Link to="/career-coach" className="text-slate-400 hover:text-white transition">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center space-x-2">
                <span>AI Career Coach Assistant</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold rounded border border-emerald-500/20 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Platform Data</span>
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Target Role: {overview?.targetRole || 'Software Developer'} &bull; Readiness: {overview?.readinessScore || 0}/100
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 bg-slate-850 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-inner">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-2 max-w-2xl ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Suggested Action Buttons */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(act.prompt || act.label)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-medium rounded-xl border border-indigo-500/20 transition flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>Analyzing your verified performance data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2 bg-slate-850 border border-slate-800 p-2.5 rounded-2xl shadow-lg"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI Career Coach (e.g., What should I study today?)"
            className="flex-1 bg-transparent px-3 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default CareerCoachChatPage;
