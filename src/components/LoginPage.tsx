import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion } from 'motion/react';
import { LogIn, Sparkles, Target, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-24 bg-white border-r border-slate-200">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="flex items-center gap-3 mb-12 text-indigo-600 font-bold text-2xl">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs shadow-lg">AC</div>
            <span className="tracking-tight text-slate-900">Ascend</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Elite Career Mastery <span className="text-indigo-600">Democratized.</span>
          </h1>
          
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            Personalized AI coaching, skill assessments, and professional development plans for the ambitious.
          </p>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-xl font-bold text-sm tracking-tight hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <LogIn className="w-5 h-5 text-indigo-400" />
            Sign in with Google
          </button>
          
          {error && (
            <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>
          )}

          <div className="mt-24 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">AI Driven</p>
              <p className="text-[10px] text-slate-400">Contextual advice unique to your industry.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">SMART Goals</p>
              <p className="text-[10px] text-slate-400">Tactical roadmaps for rapid advancement.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 hidden lg:flex flex-col justify-center items-center bg-slate-900 p-24 overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 text-center">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl max-w-lg mx-auto">
               <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
               <p className="text-white text-2xl font-light italic leading-relaxed mb-8">
                 "Ascend has transformed how our leads approach high-stakes professional transitions."
               </p>
               <div className="flex items-center justify-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700"></div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">Marcus Chen</p>
                    <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Director of Strategy</p>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
