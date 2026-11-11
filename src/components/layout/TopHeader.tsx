import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { PRESET_WORKLOADS } from '../../engine/presets';
import { Play, Sparkles } from 'lucide-react';

export const TopHeader: React.FC = () => {
  const { activePage, setActivePage, processes, loadPreset, results } = useSimulation();

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Project Overview & Dashboard';
      case 'process-manager':
        return 'Module 1: Process Management';
      case 'scheduling-engine':
        return 'Module 2: CPU Scheduling and Energy Engine';
      case 'performance-analysis':
        return 'Module 3: Performance Analysis & Gantt';
      case 'university-report':
        return 'University Report & GitHub Revisions';
      default:
        return 'EES Scheduler';
    }
  };

  const eaasSavings = results.eaas?.metrics.energySavingsPercent ?? 0;

  return (
    <header className="h-16 px-6 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between gap-6 shrink-0 no-print z-10 sticky top-0">
      {/* Zone 1: Current Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-white tracking-tight truncate">
          {getPageTitle()}
        </h1>
        {eaasSavings > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3" />
            EAAS: -{eaasSavings}% Energy
          </span>
        )}
      </div>

      {/* Zone 2: Preset Workload Selector & Simulation Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="workload-preset-select" className="text-xs text-slate-400 hidden md:inline">
            Workload Preset:
          </label>
          <select
            id="workload-preset-select"
            aria-label="Workload Preset"
            onChange={(e) => {
              if (e.target.value) loadPreset(e.target.value);
            }}
            defaultValue=""
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="" disabled>
              Select Mobile/Benchmark Preset...
            </option>
            {PRESET_WORKLOADS.map((pw) => (
              <option key={pw.id} value={pw.id}>
                {pw.name} ({pw.processes.length} tasks)
              </option>
            ))}
          </select>
        </div>

        {/* Zone 3: Primary Action */}
        <button
          onClick={() => setActivePage('scheduling-engine')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-md shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Simulate</span>
        </button>
      </div>
    </header>
  );
};
