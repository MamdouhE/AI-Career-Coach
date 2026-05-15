import React, { useState } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Save, User, Briefcase, Target, Award, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const { profile, user } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    currentRole: profile?.currentRole || '',
    targetRole: profile?.targetRole || '',
    industry: profile?.industry || '',
    experienceYears: profile?.experienceYears || 0,
    focusAreas: profile?.focusAreas?.join(', ') || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccess(false);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...formData,
        experienceYears: Number(formData.experienceYears),
        focusAreas: formData.focusAreas.split(',').map(s => s.trim()).filter(Boolean),
        updatedAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 border-b border-slate-100 pb-4">Professional Profile</h1>
        <p className="text-slate-500 mt-4 leading-relaxed">Update your professional coordinates to ensure the AI Coach provides relevant strategic guidance.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 pb-24">
        {/* Identity Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
             <div className="p-2 bg-indigo-50 rounded-lg">
                <User className="w-5 h-5 text-indigo-600" />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Personal Context</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block px-1">Legal Name</label>
              <input 
                type="text" 
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block px-1">Years in Field</label>
              <input 
                type="number" 
                value={formData.experienceYears}
                onChange={e => setFormData({...formData, experienceYears: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Trajectory Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
             <div className="p-2 bg-indigo-50 rounded-lg">
                <Briefcase className="w-5 h-5 text-indigo-600" />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Career Trajectory</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block px-1">Current Designation</label>
              <input 
                type="text" 
                placeholder="Senior Operations Analyst"
                value={formData.currentRole}
                onChange={e => setFormData({...formData, currentRole: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block px-1">North Star Role</label>
              <input 
                type="text" 
                placeholder="VP of Operations"
                value={formData.targetRole}
                onChange={e => setFormData({...formData, targetRole: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block px-1">Industry Vertical</label>
              <input 
                type="text" 
                placeholder="Technology / SaaS"
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Development Areas */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
             <div className="p-2 bg-indigo-50 rounded-lg">
                <Target className="w-5 h-5 text-indigo-600" />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Focus Dimensions</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block px-1">Specialized Focus Areas</label>
            <textarea 
              rows={4}
              placeholder="Strategic Planning, Change Management, etc."
              value={formData.focusAreas}
              onChange={e => setFormData({...formData, focusAreas: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </section>

        <div className="fixed bottom-12 right-12 z-50">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-2xl shadow-2xl font-bold text-sm tracking-tight hover:bg-slate-800 transition-all group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-indigo-400" />}
              {success ? 'Strategic Data Preserved' : 'Update Profile'}
            </button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
