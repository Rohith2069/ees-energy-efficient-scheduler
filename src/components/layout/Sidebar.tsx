import React from 'react';
import { useSimulation, PageId } from '../../context/SimulationContext';
import { 
  LayoutDashboard, 
  ListPlus, 
  Cpu, 
  BarChart3, 
  GraduationCap, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    sublabel: 'Overview & Objectives',
    icon: LayoutDashboard,
  },
  {
    id: 'process-manager',
    label: 'Module 1: Processes',
    sublabel: 'Process Management',
    icon: ListPlus,
  },
  {
    id: 'scheduling-engine',
    label: 'Module 2: CPU Engine',
    sublabel: 'DVFS & Simulation',
    icon: Cpu,
  },
  {
    id: 'performance-analysis',
    label: 'Module 3: Analytics',
    sublabel: 'Gantt & Comparisons',
    icon: BarChart3,
  },
  {
    id: 'university-report',
    label: 'CSE316 Report',
    sublabel: 'Academic Paper & Git',
    icon: GraduationCap,
  },
];

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, processes, resetToDefault } = useSimulation();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none no-print min-h-screen">
      {/* Brand Zone */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Cpu className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              EES Scheduler
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                DVFS
              </span>
            </div>
            <div className="text-xs text-slate-400">CSE316 Operating Systems</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                isActive
                  ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="truncate leading-tight">{item.label}</div>
                <div className="text-[11px] text-slate-400 truncate">{item.sublabel}</div>
              </div>
              {item.id === 'process-manager' && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                  {processes.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Action Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Active Processes</span>
          <span className="font-mono text-white font-medium">{processes.length} tasks</span>
        </div>
        <button
          onClick={resetToDefault}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-md border border-slate-700/60 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>
        <div className="pt-1 text-[11px] text-slate-400 text-center">
          B.Tech CSE · Academic Simulator
        </div>
      </div>
    </aside>
  );
};
