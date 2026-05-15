import React, { useState, useEffect } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Target, 
  Trash2, 
  Plus, 
  Calendar,
  CheckCircle2,
  BrainCircuit,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function GoalsPage() {
  const { user } = useFirebase();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'Skill',
    status: 'Not Started',
    targetDate: ''
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/goals`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGoal.title) return;

    try {
      await addDoc(collection(db, `users/${user.uid}/goals`), {
        ...newGoal,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewGoal({ title: '', description: '', type: 'Skill', status: 'Not Started', targetDate: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (goal: any) => {
    const statuses = ['Not Started', 'In Progress', 'Completed'];
    const nextStatus = statuses[(statuses.indexOf(goal.status) + 1) % statuses.length];
    
    try {
      await updateDoc(doc(db, `users/${user?.uid}/goals`, goal.id), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await deleteDoc(doc(db, `users/${user?.uid}/goals`, id));
    } catch (err) {
      console.error(err);
    }
  };

  const columns = ['Not Started', 'In Progress', 'Completed'];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-text-main">Development Plan</h1>
          <p className="text-text-faded mt-2">Track your roadmap to leadership. Define key milestones and visualize your growth journey.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => navigate('/coach', { state: { initialMessage: "Please analyze my skills and goals, and generate a structured 6-month development plan. Provide initial guidance, then ask sequential questions one at a time to gather more context before presenting the final, specific plan with 3 tangible milestones." } })}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface text-text-main px-4 py-2.5 rounded-xl font-bold text-sm border border-border-theme hover:border-accent-main transition-all group"
          >
            <BrainCircuit className="w-4 h-4 text-accent-main group-hover:scale-110 transition-transform" />
            AI Generator
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent-main text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-accent-deep transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="overflow-hidden relative z-0"
          >
            <div className="p-8 bg-surface border border-border-theme rounded-3xl shadow-xl space-y-8 mb-8 relative">
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setIsAdding(false)} className="w-8 h-8 flex items-center justify-center bg-surface-alt rounded-full hover:bg-border-theme transition-colors text-text-faded">
                    <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-main">Define Milestone</h3>
                <p className="text-sm text-text-faded mt-1">What's the next big step in your career?</p>
              </div>
              
              <form onSubmit={handleAddGoal} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-text-faded mb-2 block px-1">Goal Title</label>
                    <input 
                      autoFocus
                      placeholder="e.g. Lead Cross-Functional Strategy for Q3"
                      className="w-full text-xl font-bold border-b-2 border-border-theme focus:border-accent-main outline-none pb-2 bg-transparent text-text-main placeholder:text-text-faded/50 transition-colors"
                      value={newGoal.title}
                      onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-5">
                      <div>
                          <label className="text-[10px] uppercase tracking-widest font-bold text-text-faded block px-1 mb-1.5">Classification</label>
                          <select 
                              className="w-full bg-surface-alt border border-border-theme rounded-xl p-3 text-sm focus:border-accent-main outline-none text-text-main font-medium"
                              value={newGoal.type}
                              onChange={e => setNewGoal({...newGoal, type: e.target.value})}
                          >
                              {['Skill', 'Network', 'Project', 'Promotion'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="text-[10px] uppercase tracking-widest font-bold text-text-faded block px-1 mb-1.5">Target Date</label>
                          <input 
                              type="date"
                              className="w-full bg-surface-alt border border-border-theme rounded-xl p-3 text-sm focus:border-accent-main outline-none text-text-main font-medium cursor-text"
                              value={newGoal.targetDate}
                              onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})}
                          />
                      </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-text-faded block px-1 mb-1.5">Description & Success Criteria</label>
                    <textarea 
                      rows={5}
                      placeholder="What does success look like for this milestone? How will you measure it?"
                      className="w-full bg-surface-alt border border-border-theme rounded-xl p-3 text-sm focus:border-accent-main outline-none text-text-main resize-none"
                      value={newGoal.description}
                      onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex pt-4">
                  <button type="submit" className="bg-text-main text-surface px-8 py-3 rounded-xl font-bold text-sm hover:bg-text-soft transition-all shadow-md">
                    Commit to Plan
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-24">
        {columns.map(status => (
          <div key={status} className="bg-surface-alt/50 rounded-[32px] p-6 border border-border-theme/50 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="font-bold text-text-main flex items-center gap-2">
                {status === 'Not Started' && <Target className="w-4 h-4 text-rose-500" />}
                {status === 'In Progress' && <Activity className="w-4 h-4 text-amber-500" />}
                {status === 'Completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {status}
              </h3>
              <span className="bg-surface text-text-faded text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-border-theme">
                {goals.filter(g => g.status === status).length}
              </span>
            </div>

            <div className="space-y-4 min-h-[150px]">
              <AnimatePresence mode="popLayout">
                {goals.filter(g => g.status === status).map((goal) => (
                  <motion.div 
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`
                      p-5 border rounded-2xl shadow-sm hover:shadow-md transition-all group relative
                      ${goal.status === 'Completed' ? 'border-emerald-100 bg-emerald-50/10' : 'bg-surface border-border-theme hover:border-accent-soft/50'}
                    `}
                  >
                    <div className="flex gap-4">
                      <div 
                        onClick={() => toggleStatus(goal)}
                        className={`
                          w-5 h-5 rounded border-2 shrink-0 cursor-pointer transition-all mt-0.5 flex items-center justify-center
                          ${goal.status === 'Completed' ? 'bg-emerald-500 border-emerald-500' : 'border-border-theme hover:border-accent-main'}
                        `}
                      >
                        {goal.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1 pr-6">
                        <span className="text-[9px] font-bold text-accent-main uppercase tracking-widest mb-1.5 block">
                          {goal.type}
                        </span>
                        <h4 className={`text-sm font-bold text-text-main mb-2 leading-tight ${goal.status === 'Completed' ? 'line-through text-text-faded' : ''}`}>
                          {goal.title}
                        </h4>
                        {goal.description && (
                          <p className="text-xs text-text-faded leading-relaxed line-clamp-3">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-theme/50">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-faded uppercase tracking-widest">
                         <Calendar className="w-3.5 h-3.5" />
                         {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No Target Date'}
                      </div>
                      <button 
                        onClick={() => deleteGoal(goal.id)}
                        className="text-text-faded hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {goals.filter(g => g.status === status).length === 0 && (
                <div className="h-24 border-2 border-dashed border-border-theme rounded-2xl flex items-center justify-center text-text-faded/50 text-xs font-bold uppercase tracking-widest">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
