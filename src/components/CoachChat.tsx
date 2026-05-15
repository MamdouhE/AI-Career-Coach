import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { useLocation } from 'react-router-dom';
import { Send, ArrowLeft, Loader2, Sparkles, User, Bot, Save, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, updateDoc, doc as firestoreDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export default function CoachChat() {
  const { profile, user } = useFirebase();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text }] };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setSaved(false); // Reset saved status on new activity

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            currentRole: profile?.currentRole,
            targetRole: profile?.targetRole,
            industry: profile?.industry,
            experienceYears: profile?.experienceYears,
            focusAreas: profile?.focusAreas,
            displayName: profile?.displayName
          },
          history: messages
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 429) {
          const timeout = data.retryAfter || 60;
          setMessages((prev) => [...prev, { 
            role: 'model', 
            parts: [{ text: `⚠️ **Quota Exceeded:** ${data.error}\n\n*Estimated cooldown: ${timeout} seconds. Please try again shortly.*` }] 
          }]);
          return;
        }
        throw new Error(data.error || "Internal Server Error");
      }

      setMessages((prev) => [...prev, { role: 'model', parts: [{ text: data.text }] }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'model', parts: [{ text: `❌ **Communication Error:** ${err.message}` }] }]);
    } finally {
      setLoading(false);
    }
  }, [profile, messages, loading]);

  const saveSession = async () => {
    if (!user || messages.length === 0 || saving || saved) return;
    setSaving(true);
    try {
      const title = location.state?.toolName || 
                    messages.find(m => m.role === 'user')?.parts[0].text.slice(0, 40) + '...' || 
                    'Elite Coaching Session';

      if (location.state?.sessionId) {
        const sessionRef = firestoreDoc(db, 'users', user.uid, 'sessions', location.state.sessionId);
        await updateDoc(sessionRef, {
          messages,
          updatedAt: serverTimestamp()
        });
      } else {
        const sessionRef = collection(db, 'users', user.uid, 'sessions');
        await addDoc(sessionRef, {
          userId: user.uid,
          title,
          messages,
          toolName: location.state?.toolName || null,
          createdAt: serverTimestamp()
        });
      }
      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (location.state?.loadedMessages && messages.length === 0) {
      setMessages(location.state.loadedMessages);
      setSaved(true); // Already saved since it's loaded from archives
    } else if (location.state?.initialMessage && messages.length === 0 && !loading) {
      sendMessage(location.state.initialMessage);
    }
  }, [location.state, messages.length, loading, sendMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto border border-slate-200 rounded-3xl bg-white shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {location.state?.toolName || 'AI Achievement Coach'}
            </h3>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">
              {location.state?.toolName ? 'Specialized Session' : 'Advanced Strategic Intelligence'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Session</span>
           </div>

           {messages.length > 0 && (
             <button
               onClick={saveSession}
               disabled={saving || saved}
               className={`
                 flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                 ${saved 
                   ? 'bg-green-50 text-green-600 border border-green-200 cursor-default' 
                   : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 shadow-sm'}
               `}
             >
               {saving ? (
                 <Loader2 className="w-3 h-3 animate-spin" />
               ) : saved ? (
                 <>
                   <Check className="w-3 h-3" />
                   Saved
                 </>
               ) : (
                 <>
                   <Save className="w-3 h-3" />
                   Save Session
                 </>
               )}
             </button>
           )}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
            <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm mb-12">
                <p className="text-slate-500 text-lg leading-relaxed italic">
                  "Good day, {profile?.displayName?.split(' ')[0] || 'Professional'}. I am ready to analyze your current trajectory towards becoming a {profile?.targetRole || 'Leader'}. Where shall we focus our focus today?"
                </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
               {[
                "Identify Skill Gaps", 
                "Negotiation Strategy", 
                "Role Transition", 
                "Network Building"
              ].map((suggestion, i) => (
                 <button 
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-tight text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md transition-all"
                 >
                   {suggestion}
                 </button>
               ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] p-5 rounded-2xl shadow-sm text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}
              `}>
                <div className="markdown-body prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
             <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
             </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100">
        <form 
          onSubmit={handleFormSubmit}
          className="relative flex items-center gap-3"
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your career goals or ask for coaching..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500 outline-none transition-all pr-16"
          />
          <button
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-4 uppercase tracking-[0.2em] font-bold">
           Encrypted Strategic Channel • Powered by Ascend AI
        </p>
      </div>
    </div>
  );
}
