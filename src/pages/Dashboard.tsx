import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Zap, 
  Cpu, 
  Clock, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Scale, 
  ShieldCheck,
  TrendingDown
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { setActivePage, processes, results, config } = useSimulation();

  const eaasRes = results.eaas;
  const fcfsRes = results.fcfs;
  const energySavings = eaasRes?.metrics.energySavingsPercent ?? 0;
  const eaasEnergy = eaasRes?.metrics.totalEnergy ?? 0;
  const fcfsEnergy = fcfsRes?.metrics.totalEnergy ?? 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-teal-400">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>CSE316 Operating Systems Academic Project · 2nd Year B.Tech CSE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Energy-Aware Adaptive Scheduling (EAAS) with Dynamic DVFS
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            A comprehensive CPU scheduling simulation platform exploring the trade-off between energy consumption 
            and operational delay in embedded and mobile processors. EAAS combines priority-slack scheduling with 
            Dynamic Voltage and Frequency Scaling (DVFS) under cubic dynamic power models.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActivePage('scheduling-engine')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-colors cursor-pointer shadow-md"
            >
              <span>Launch Scheduling Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActivePage('process-manager')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Manage Processes ({processes.length})</span>
            </button>
            <button
              onClick={() => setActivePage('university-report')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm border border-slate-700 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>CSE316 Report & Viva Guide</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Proposed Algorithm</span>
            <Zap className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-300">EAAS + DVFS</div>
          <div className="text-xs text-slate-400">Adaptive frequency: 0.5x, 0.75x, 1.0x</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Energy Savings (vs Baseline)</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {energySavings > 0 ? `-${energySavings}%` : '0%'}
          </div>
          <div className="text-xs text-slate-400">
            {eaasEnergy} J vs {fcfsEnergy} J (FCFS baseline)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Configured Slowdown Limit</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {(config.maxAcceptableSlowdown * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-400">Max acceptable execution delay</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Current Workload</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-300">{processes.length} Processes</div>
          <div className="text-xs text-slate-400">Configured in Module 1</div>
        </div>
      </div>

      {/* Module Navigation Overview (3 Distinct Modules) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">System Architecture: Three Core Modules</h2>
          <p className="text-xs text-slate-400">Each module operates independently while sharing reactive simulation state.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1 Card */}
          <div className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-xl p-6 flex flex-col justify-between space-y-4 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Module 1 – Process Management</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Add, edit, validate, and delete CPU tasks. Define Arrival Times, Burst Times, Priorities, 
                and optional Deadlines. Includes 5 pre-configured mobile and IoT workloads.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Strict input validation (A &ge; 0, B &gt; 0, unique PID)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Persistent HTML5 LocalStorage</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Mobile & IoT preset workload generator</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setActivePage('process-manager')}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
            >
              <span>Open Process Manager</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Module 2 Card */}
          <div className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-xl p-6 flex flex-col justify-between space-y-4 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Module 2 – CPU Scheduling & Energy Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Execute FCFS, SJF, Round Robin, and proposed EAAS. Tunable time quantum and max acceptable slowdown.
                Features interactive tick-by-tick animated simulation.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>DVFS cubic power model: P(f) = k · f³</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Tick-by-tick animated playback controls</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Real-time Ready Queue & CPU core inspector</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setActivePage('scheduling-engine')}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
            >
              <span>Open Simulation Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Module 3 Card */}
          <div className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-xl p-6 flex flex-col justify-between space-y-4 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Module 3 – Performance Analysis</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Side-by-side Gantt charts, Average Waiting Time, Turnaround Time, Energy Joules, and 
                Energy-Saving percentages with Recharts graphs and CSV data export.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Comparative Gantt charts with frequency tags</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Energy-Delay trade-off analysis</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>CSV export for university lab evaluation</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setActivePage('performance-analysis')}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
            >
              <span>Open Performance Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* University Course Objectives & Academic Context */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>CSE316 Course Problem Statement & Methodology</span>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            <strong className="text-white">Assigned Problem Statement:</strong> &ldquo;Energy-Efficient CPU Scheduling Algorithm – 
            Develop a CPU scheduling algorithm that minimizes energy consumption without compromising performance. 
            The algorithm should be suitable for mobile and embedded systems where power efficiency is critical.&rdquo;
          </p>
          <p>
            <strong className="text-white">Scientific Scope & Disclaimer:</strong> This simulator implements a verified mathematical 
            model of dynamic CMOS power dissipation (<code className="text-teal-300 font-mono">P = k · f³</code>) and discrete DVFS scaling 
            frequencies. Energy values are calculated algorithmic estimates in normalized Joules for comparative evaluation against traditional 
            textbook algorithms, rather than direct hardware silicon probe measurements.
          </p>
        </div>
      </div>
    </div>
  );
};
