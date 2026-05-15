import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useFirebase } from '../FirebaseProvider';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Target, 
  UserCircle, 
  LogOut,
  ChevronRight,
  Zap,
  History,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { signOut, user, profile } = useFirebase();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/toolbox', icon: Zap, label: 'Toolbox' },
    { to: '/coach', icon: MessageSquare, label: 'Coach Session' },
    { to: '/archive', icon: History, label: 'Archives' },
    { to: '/goals', icon: Target, label: 'Dev Plan' },
    { to: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-page text-text-main overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col h-full z-20">
        <div className="p-6 flex items-center gap-3 text-indigo-400 font-bold text-xl">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xs">AC</div>
          <span className="tracking-tight">Ascend</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                ${isActive ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Aesthetic Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', icon: Sun, label: 'Light' },
              { id: 'dark', icon: Moon, label: 'Dark' },
              { id: 'professional-blue', icon: Palette, label: 'Pro' }
            ].map((t) => {
              const { theme, setTheme } = useTheme();
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  title={t.label}
                  className={`
                    flex items-center justify-center p-2 rounded-lg transition-all
                    ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}
                  `}
                >
                  <t.icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 p-3 rounded-lg flex items-center space-x-3 mb-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full bg-slate-600" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">
                {user?.displayName?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0]}</p>
              <p className="text-xs text-slate-500 truncate">{profile?.currentRole || 'User'}</p>
            </div>
          </div>
          
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-page">
        {/* Top Bar */}
        <header className="h-16 border-b border-border-theme flex justify-between items-center px-8 bg-surface/80 backdrop-blur-md z-20 sticky top-0">
          <div className="flex items-center gap-2">
             <h2 className="text-lg font-bold text-text-main capitalize">
              {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
             <button 
               onClick={() => navigate('/coach', { state: { initialMessage: "I'd like to schedule a deep-dive coaching session to discuss my career trajectory." } })}
               className="px-4 py-2 bg-surface border border-border-theme rounded-lg text-xs font-medium hover:bg-surface-alt text-text-main shadow-sm transition-all"
             >
                Schedule Session
             </button>
             <button 
               onClick={() => navigate('/coach', { state: { initialMessage: "I'd like to take a professional skills assessment to identify my current gaps." } })}
               className="px-4 py-2 bg-accent-main text-white rounded-lg text-xs font-medium hover:bg-accent-deep shadow-sm transition-all"
             >
                Take Assessment
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
