import React, { useEffect, useState } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  History, 
  Trash2, 
  ChevronRight, 
  Calendar,
  MessageSquare,
  Bot,
  User,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

import { useNavigate } from 'react-router-dom';

interface SavedSession {
  id: string;
  title: string;
  messages: any[];
  toolName?: string;
  createdAt: any;
}

export default function SavedSessions() {
  const { user } = useFirebase();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null);
  const [loading, setLoading] = useState(true);

  const resumeSession = (session: SavedSession) => {
    navigate('/coach', { 
      state: { 
        loadedMessages: session.messages, 
        toolName: session.toolName,
        sessionId: session.id 
      } 
    });
  };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'sessions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedSession[];
      setSessions(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'sessions', id));
      if (selectedSession?.id === id) setSelectedSession(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <History className="w-8 h-8 text-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Session Archives</h1>
          <p className="text-slate-500 mt-2">Access your previous strategic consults and audits.</p>
        </div>
        {selectedSession && (
          <button 
            onClick={() => setSelectedSession(null)}
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedSession ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedSession.title}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedSession.createdAt?.toDate().toLocaleDateString()}
                  </span>
                  {selectedSession.toolName && (
                    <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {selectedSession.toolName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                   onClick={() => resumeSession(selectedSession)}
                   className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                 >
                    <MessageSquare className="w-4 h-4" />
                    Resume Conversation
                 </button>
              </div>
            </div>

            <div className="p-8 space-y-8 bg-white max-h-[600px] overflow-y-auto">
              {selectedSession.messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div className={`max-w-[80%] p-6 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-slate-50 text-slate-700 rounded-tr-none' : 'bg-white border border-slate-100 shadow-sm rounded-tl-none'}`}>
                    <div className="markdown-body prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sessions.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white border border-slate-200 border-dashed rounded-[32px]">
                <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400">No sessions saved yet</h3>
                <p className="text-slate-400 text-sm mt-2">Start a conversation with the AI Coach to build your archive.</p>
              </div>
            ) : (
              sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedSession(session)}
                  className="group bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <button 
                        onClick={(e) => deleteSession(session.id, e)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {session.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">View Archive</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
