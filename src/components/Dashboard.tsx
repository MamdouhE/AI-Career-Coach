import React, { useEffect, useState } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { db } from '../lib/firebase';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { 
  Target, 
  TrendingUp, 
  MessageSquare, 
  ChevronRight,
  Plus,
  Compass,
  Sparkles,
  Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Tooltip from './ui/Tooltip';

export default function Dashboard() {
  const { user, profile } = useFirebase();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [stats, setStats] = useState({
    completedGoals: 0,
    activeGoals: 0,
    skillsCount: 0
  });

  useEffect(() => {
    if (!user) return;

    const goalsQuery = query(
      collection(db, `users/${user.uid}/goals`),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(goalsQuery, (snapshot) => {
      const g = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGoals(g);
      
      const active = g.filter((goal: any) => goal.status !== 'Completed').length;
      const completed = g.filter((goal: any) => goal.status === 'Completed').length;
      setStats(prev => ({ ...prev, activeGoals: active, completedGoals: completed }));
    });

    const skillsQuery = query(collection(db, `users/${user.uid}/skills`));
    const unsubscribeSkills = onSnapshot(skillsQuery, (snapshot) => {
      const s = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSkills(s);
      setStats(prev => ({ ...prev, skillsCount: snapshot.size }));
    });

    return () => {
      unsubscribe();
      unsubscribeSkills();
    };
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main">Good morning, {profile?.displayName?.split(' ')[0]}.</h1>
          <p className="text-text-faded">You're on track to reach <span className="text-accent-main font-semibold underline decoration-accent-soft underline-offset-4">{profile?.targetRole || 'Project Lead'}</span> by Q4.</p>
        </div>
        <div className="flex space-x-3">
          <Tooltip content="Chat with your career partner">
            <Link to="/coach" className="px-4 py-2 bg-surface border border-border-theme rounded-lg text-sm font-medium hover:bg-surface-alt transition-all flex items-center gap-2 text-text-main shadow-sm">
              <MessageSquare className="w-4 h-4 text-accent-main" />
              AI Session
            </Link>
          </Tooltip>
          <Tooltip content="Diagnostic skills audit">
            <button 
              onClick={() => navigate('/coach', { state: { initialMessage: "I'm ready to begin a career assessment. What's the first step?" } })}
              className="px-4 py-2 bg-accent-main text-white rounded-lg text-sm font-medium hover:bg-accent-deep shadow-sm transition-all"
            >
              Take Assessment
            </button>
          </Tooltip>
        </div>
      </section>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Career Journey */}
        <section className="col-span-12 lg:col-span-8 flex flex-col space-y-6">
          <div className="bg-surface rounded-2xl p-8 shadow-sm border border-border-theme flex-1">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-text-main">
              <Tooltip content="Your developmental roadmap">
                <Compass className="w-5 h-5 text-accent-main" />
              </Tooltip>
              Career Path Visualization
            </h3>
            
            <div className="relative flex flex-col space-y-12 pl-8 border-l-2 border-accent-soft mt-8">
              {/* Current Step */}
              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-surface bg-accent-main shadow-sm"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-accent-main uppercase tracking-wider mb-1">Current Position</span>
                  <span className="text-lg font-bold text-text-main">{profile?.currentRole || 'Professional'}</span>
                  <p className="text-sm text-text-faded mt-1 max-w-lg">Focusing on standard operational procedures and delivery excellence.</p>
                </div>
              </div>

              {/* Next Major Goal */}
              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-surface bg-surface-alt"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-faded uppercase tracking-wider mb-1">Target Milestone</span>
                  <span className="text-lg font-bold text-text-main">{profile?.targetRole || 'Leadership Role'}</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-semibold rounded-full border border-green-500/20">
                      {stats.skillsCount}/10 Skills Mastered
                    </span>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-semibold rounded-full border border-amber-500/20">
                      Primary Gap: Strategic Influence
                    </span>
                  </div>
                </div>
              </div>

              {/* Long term */}
              <div className="relative opacity-40">
                <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-surface bg-border-theme"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-faded uppercase tracking-wider mb-1">Long-term Vision</span>
                  <span className="text-lg font-bold text-text-main">Industry Leader</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-accent-main rounded-2xl p-8 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <Sparkles className="w-24 h-24" />
            </div>
            <div className="flex items-center space-x-6 relative z-10">
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-md">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">Coach Insight</h4>
                <p className="text-indigo-100 text-sm leading-relaxed max-w-2xl italic">
                  "Based on your latest profiles, you have a strong technical foundation. To bridge the gap to {profile?.targetRole || 'Leadership'}, I recommend focusing on Stakeholder Communication."
                </p>
                <Tooltip content="Bridge identified development gaps" position="right">
                  <button 
                    onClick={() => navigate('/coach', { state: { initialMessage: `I'd like to do a deep dive session into bridging the gap to ${profile?.targetRole || 'leadership'}.` } })}
                    className="mt-4 inline-block text-xs font-bold bg-white text-accent-main px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                     Deep Dive Session
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Widgets */}
        <section className="col-span-12 lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-theme">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-text-main">
              <TrendingUp className="w-5 h-5 text-accent-main" />
              Skill Proficiency
            </h3>
            <div className="space-y-6">
              {(skills.length > 0 ? skills.slice(0, 4) : [
                { skillName: 'Data Analysis', level: 4.7 },
                { skillName: 'Project Mgmt', level: 3.4 },
                { skillName: 'Leadership', level: 2.2 },
              ]).map((skill, i) => {
                const percentage = Math.min(100, Math.round((skill.level / 5) * 100));
                const colors = ['bg-accent-main', 'bg-accent-soft', 'bg-amber-400', 'bg-emerald-400'];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-text-soft">{skill.skillName}</span>
                      <span className="text-text-main">{percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-alt rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-theme flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-text-main">Weekly Focus</h3>
                <Tooltip content="High-priority actions for this cycle">
                  <Info className="w-3.5 h-3.5 text-text-faded cursor-help" />
                </Tooltip>
              </div>
              <Tooltip content="Edit roadmap" position="left">
                <Link to="/goals" className="text-xs text-accent-main font-bold hover:underline">View All</Link>
              </Tooltip>
            </div>
            <ul className="space-y-5">
              {goals.length > 0 ? goals.slice(0, 3).map((goal) => (
                <li key={goal.id} className="flex items-start space-x-3">
                  <div className={`mt-1 w-4 h-4 rounded border-2 transition-colors flex items-center justify-center ${goal.status === 'Completed' ? 'border-accent-main bg-accent-main' : 'border-border-theme'}`}>
                    {goal.status === 'Completed' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${goal.status === 'Completed' ? 'text-text-faded line-through' : 'text-text-soft'}`}>{goal.title}</p>
                    <p className="text-[10px] text-text-faded uppercase tracking-widest mt-0.5">{goal.type} • {goal.status}</p>
                  </div>
                </li>
              )) : (
                <li className="text-center py-8">
                  <p className="text-xs text-text-faded italic">No milestones defined.</p>
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
