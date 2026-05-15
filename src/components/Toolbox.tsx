import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Target, 
  ShieldAlert, 
  MessageSquare, 
  Compass, 
  TrendingUp,
  BarChart3,
  Presentation,
  Mail,
  FileText,
  Users,
  Search,
  FileSearch,
  ClipboardCheck,
  BadgeCheck,
  Briefcase,
  Crosshair
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Tooltip from './ui/Tooltip';

const strategicTools = [
  {
    id: 'swot',
    title: 'Professional SWOT Forge',
    summary: 'A deep audit of your Strengths, Weaknesses, Opportunities, and Threats in your current sector.',
    icon: ShieldAlert,
    color: 'text-blue-500',
    prompt: "I'd like to perform a comprehensive SWOT analysis of my current career position. Let's start with my core strengths."
  },
  {
    id: 'gap',
    title: 'Skill Gap Auditor',
    summary: 'Compare your current skill set against the requirements of your target leadership role.',
    icon: Target,
    color: 'text-indigo-500',
    prompt: "Please conduct a skill gap analysis for me. Compare my current role with my target role and tell me what's missing."
  },
  {
    id: 'blueprint',
    title: '90-Day Blueprint',
    summary: 'Create a tactical action plan for your first 90 days in a new role or project.',
    icon: Compass,
    color: 'text-amber-500',
    prompt: "Help me build a 90-day transition blueprint for my next career step. What are the key milestones for month one?"
  },
  {
    id: 'presence',
    title: 'Executive Presence Audit',
    summary: 'Analyze your communication style and leadership brand for higher organizational impact.',
    icon: Presentation,
    color: 'text-purple-500',
    prompt: "I'd like an audit of my executive presence. How can I refine my communication style to command more authority in meetings?"
  },
  {
    id: 'market',
    title: 'Market Value Pulse',
    summary: 'Evaluate your market positioning and leverage based on industry trends.',
    icon: BarChart3,
    color: 'text-rose-500',
    prompt: "What is my current market value pulse? Based on my industry and experience, what leverage do I have right now?"
  },
  {
    id: 'certification',
    title: 'Certification Strategist',
    summary: 'AI-driven recommendations for professional certifications that maximize your career ROI and prestige.',
    icon: BadgeCheck,
    color: 'text-orange-600',
    prompt: "I want to identify the best professional certifications for my career path. Please recommend the top 3 focus areas, explain why they matter, the specific benefits, and provide a roadmap to achieve them."
  }
];

const operationalTools = [
  {
    id: 'email',
    title: 'Email Strategist',
    summary: 'Draft high-impact professional correspondence for any scenario, from networking to conflict.',
    icon: Mail,
    color: 'text-sky-500',
    prompt: "I need to draft a high-impact professional email. What's the context, and what tone should we strike?"
  },
  {
    id: 'cv',
    title: 'CV Refiner',
    summary: 'Optimize your resume for both ATS systems and high-level executive recruiters.',
    icon: FileText,
    color: 'text-emerald-500',
    prompt: "I'd like to refine my CV. I'll paste my current summary or a specific section, and I want you to optimize it for a leadership role."
  },
  {
    id: 'meeting',
    title: 'Meeting Architect',
    summary: 'Prepare strategic agendas and anticipation responses for critical stakeholders meetings.',
    icon: Users,
    color: 'text-orange-500',
    prompt: "Help me prepare for an upcoming critical meeting. Who are the stakeholders, and what is our primary objective?"
  },
  {
    id: 'summarizer',
    title: 'Insight Distiller',
    summary: 'Extract core strategic takeaways and action items from long documents or transcripts.',
    icon: FileSearch,
    color: 'text-cyan-500',
    prompt: "I have a long document or transcript. I want you to distill the core strategic insights and define next steps."
  },
  {
    id: 'search',
    title: 'Market Intel Search',
    summary: 'Deep-dive research into company cultures, competitors, and emerging industry trends.',
    icon: Search,
    color: 'text-indigo-600',
    prompt: "Let's perform some market intelligence research. What company, industry trend, or competitor should we analyze today?"
  },
  {
    id: 'skill-assessment',
    title: 'Skill Assessment',
    summary: 'A guided diagnostic to evaluate your current technical and leadership capabilities.',
    icon: ClipboardCheck,
    color: 'text-violet-500',
    prompt: "I'd like to start a comprehensive skill assessment. Please guide me through a series of questions to evaluate my current technical and leadership strengths."
  }
];

const simulationTools = [
  {
    id: 'interview',
    title: 'Interview Simulator',
    summary: 'Practice high-stakes behavioral and technical interviews with AI-driven roleplay scenarios.',
    icon: Briefcase,
    color: 'text-fuchsia-500',
    prompt: "I have an upcoming interview for a leadership role. Let's do a mock interview. You play the hiring manager and ask me tough behavioral questions."
  },
  {
    id: 'negotiation',
    title: 'Negotiation Simulator',
    summary: 'Roleplay high-stakes salary discussions or promotion asks with real-time feedback.',
    icon: MessageSquare,
    color: 'text-green-500',
    prompt: "I want to roleplay a salary negotiation. You play my manager, and I'll advocate for a promotion. Start the scene."
  },
  {
    id: 'challenge',
    title: 'Daily Challenge Sandbox',
    summary: 'Test your decision-making skills with 5-minute daily situational leadership and management scenarios.',
    icon: Crosshair,
    color: 'text-rose-500',
    prompt: "Give me today's leadership challenge simulator. Present a difficult workplace scenario, and let me navigate the conversation or make the decision."
  }
];

export default function Toolbox() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filterTools = (toolList: typeof strategicTools) => {
    if (!searchQuery.trim()) return toolList;
    const query = searchQuery.toLowerCase();
    return toolList.filter(tool => 
      tool.title.toLowerCase().includes(query) || 
      tool.summary.toLowerCase().includes(query)
    );
  };

  const filteredStrategic = filterTools(strategicTools);
  const filteredOperational = filterTools(operationalTools);
  const filteredSimulation = filterTools(simulationTools);

  const renderToolGrid = (title: string, description: string, toolList: typeof strategicTools) => {
    if (toolList.length === 0) return null;
    
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-text-main">{title}</h2>
          <p className="text-text-faded mt-1">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolList.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate('/coach', { 
                state: { 
                  initialMessage: tool.prompt + "\n\nImportant: Please provide a brief initial piece of guidance, but then treat this as an interactive conversation or scenario. Do not give me the full plan or all the answers upfront. Instead, ask me sequential questions one at a time to gather necessary information or advance the roleplay/scenario. At the end, after gathering sufficient context, provide your final evaluations and recommendations.", 
                  toolName: tool.title 
                } 
              })}
              className="group bg-surface border border-border-theme p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:border-accent-soft transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-surface-alt rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-soft/10 transition-colors">
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-3 tracking-tight">{tool.title}</h3>
                <p className="text-sm text-text-faded leading-relaxed">
                  {tool.summary}
                </p>
              </div>
              
              <div className="mt-8 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-main">Initialize Module</span>
                <Tooltip content="Launch agent session" position="left">
                  <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center group-hover:bg-accent-main group-hover:text-white transition-all text-text-main">
                     <Zap className="w-4 h-4" />
                  </div>
                </Tooltip>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-20 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-text-main tracking-tight">Intelligence Center</h1>
          <p className="text-lg text-text-faded mt-3 max-w-2xl">
            A dual-layered suite of AI-powered modules designed for both long-term career planning and tactical excellence.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Tooltip content="Filter by name or keywords" position="bottom" className="w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faded" />
              <input 
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border-theme rounded-2xl py-3 pl-11 pr-4 text-sm focus:border-accent-main text-text-main outline-none shadow-sm transition-all"
              />
            </div>
          </Tooltip>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-20">
          {renderToolGrid(
            'Strategic Toolbox', 
            'High-level modules for career trajectory, positioning, and long-term planning.',
            filteredStrategic
          )}

          {renderToolGrid(
            'Operational Toolbox', 
            'Tactical tools for immediate professional impact, communication, and preparation.',
            filteredOperational
          )}

          {renderToolGrid(
            'Simulation & Roleplay', 
            'Immersive sandbox environments to practice high-stakes conversations and decisions safely.',
            filteredSimulation
          )}

          {filteredStrategic.length === 0 && filteredOperational.length === 0 && filteredSimulation.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="py-20 text-center"
            >
              <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mx-auto mb-4 text-text-faded">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-text-faded font-medium text-lg">No tools matched your search criteria.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-accent-main font-bold hover:underline"
              >
                Clear Search
              </button>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
      {/* Toolbox Guidance */}
      <div className="p-8 bg-slate-900 rounded-[32px] text-white flex flex-col md:flex-row items-center gap-8 overflow-hidden relative border border-white/5">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex-1">
          <h4 className="text-xl font-bold mb-2">Not sure where to start?</h4>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
            Most elite professionals start with the <span className="text-indigo-400 font-bold italic">Skill Gap Auditor</span> to identify their immediate leverage points before moving to SWOT analysis.
          </p>
        </div>
        <Tooltip content="Get a personalized recommendation">
          <button 
            onClick={() => navigate('/coach', { state: { initialMessage: "Help me decide which tool in the strategic toolbox I should use first based on my profile." } })}
            className="relative z-10 bg-accent-main px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-deep transition-all whitespace-nowrap"
          >
            Consult Coach
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
