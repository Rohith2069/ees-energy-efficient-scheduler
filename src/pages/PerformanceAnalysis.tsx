import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { GanttChart } from '../components/visualizers/GanttChart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Download, 
  Zap, 
  Clock, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  BarChart3,
  Scale
} from 'lucide-react';

export const PerformanceAnalysis: React.FC = () => {
  const { results, processes, config } = useSimulation();

  const algorithms = useMemo(() => {
    return [
      { key: 'fcfs', name: 'FCFS', res: results.fcfs, color: '#38bdf8' },
      { key: 'sjf', name: 'SJF', res: results.sjf, color: '#fbbf24' },
      { key: 'rr', name: `Round Robin (q=${config.timeQuantum})`, res: results.rr, color: '#a78bfa' },
      { key: 'eaas', name: 'EAAS (Proposed DVFS)', res: results.eaas, color: '#10b981' },
    ];
  }, [results, config.timeQuantum]);

  // Max total execution time among all algorithms to align Gantt charts
  const maxTotalTime = useMemo(() => {
    const times = algorithms
      .map((a) => a.res?.metrics.totalExecutionTime ?? 0)
      .filter((t) => t > 0);
    return times.length > 0 ? Math.max(...times) : 1;
  }, [algorithms]);

  // Data for Recharts Bar Chart: Energy Comparison
  const energyChartData = useMemo(() => {
    return algorithms.map((a) => ({
      name: a.key.toUpperCase(),
      fullName: a.name,
      Energy: a.res?.metrics.totalEnergy ?? 0,
      Savings: a.res?.metrics.energySavingsPercent ?? 0,
      fill: a.color,
    }));
  }, [algorithms]);

  // Data for Recharts Bar Chart: Waiting & Turnaround Time
  const timeMetricsData = useMemo(() => {
    return algorithms.map((a) => ({
      name: a.key.toUpperCase(),
      Waiting: a.res?.metrics.averageWaitingTime ?? 0,
      Turnaround: a.res?.metrics.averageTurnaroundTime ?? 0,
      Response: a.res?.metrics.averageResponseTime ?? 0,
    }));
  }, [algorithms]);

  // EAAS Frequency Distribution Data for Pie Chart
  const freqPieData = useMemo(() => {
    const dist = results.eaas?.metrics.frequencyDistribution;
    if (!dist) return [];
    return [
      { name: 'Low (0.5x)', value: dist.low, color: '#10b981' },
      { name: 'Medium (0.75x)', value: dist.medium, color: '#38bdf8' },
      { name: 'High (1.0x)', value: dist.high, color: '#f59e0b' },
    ].filter((item) => item.value > 0);
  }, [results.eaas]);

  // CSV Export Handler
  const downloadCSV = () => {
    let csv = 'Algorithm,Avg Waiting Time (ms),Avg Turnaround Time (ms),Avg Response Time (ms),CPU Util (%),Total Execution (ms),Total Energy (J),Energy Savings (%),Deadline Misses\n';

    algorithms.forEach((a) => {
      const m = a.res?.metrics;
      if (m) {
        csv += `"${a.name}",${m.averageWaitingTime},${m.averageTurnaroundTime},${m.averageResponseTime},${m.cpuUtilization},${m.totalExecutionTime},${m.totalEnergy},${m.energySavingsPercent},${m.deadlineMissCount}\n`;
      }
    });

    csv += '\nProcess-Level Metrics for Proposed EAAS Algorithm:\n';
    csv += 'Process ID,Arrival Time,Burst Time,Effective Scaled Burst,Start Time,Completion Time,Turnaround Time,Waiting Time,Response Time,Deadline,Met Deadline,Avg Frequency,Energy (J)\n';

    results.eaas?.processMetrics.forEach((pm) => {
      csv += `${pm.processId},${pm.arrivalTime},${pm.burstTime},${pm.effectiveBurstTime},${pm.startTime},${pm.completionTime},${pm.turnaroundTime},${pm.waitingTime},${pm.responseTime},${pm.deadline ?? 'None'},${pm.metDeadline !== undefined ? pm.metDeadline : 'N/A'},${pm.averageFrequency},${pm.energyConsumed}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EES_Simulation_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const eaasSavings = results.eaas?.metrics.energySavingsPercent ?? 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Page Title & CSV Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs font-mono font-medium text-teal-400 uppercase tracking-wider">
            Module 3 · Evaluation & Benchmarking
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Performance Analysis</h1>
          <p className="text-xs text-slate-400 mt-1">
            Comparative evaluation of traditional CPU schedulers against EAAS across energy, waiting, and turnaround metrics.
          </p>
        </div>

        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Dataset (CSV)</span>
        </button>
      </div>

      {/* Primary KPI Hero Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>EAAS Energy Savings</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {eaasSavings > 0 ? `-${eaasSavings}%` : '0%'}
          </div>
          <div className="text-[11px] text-slate-400">Relative to baseline high frequency (f=1.0)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>EAAS Total Energy</span>
            <Zap className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-teal-300">
            {results.eaas?.metrics.totalEnergy ?? 0} J
          </div>
          <div className="text-[11px] text-slate-400">
            vs {results.fcfs?.metrics.totalEnergy ?? 0} J (FCFS)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Average Turnaround Time</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {results.eaas?.metrics.averageTurnaroundTime ?? 0} ms
          </div>
          <div className="text-[11px] text-slate-400">
            FCFS: {results.fcfs?.metrics.averageTurnaroundTime ?? 0} ms | SJF: {results.sjf?.metrics.averageTurnaroundTime ?? 0} ms
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Deadline Adherence</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {100 - (results.eaas?.metrics.deadlineMissRate ?? 0)}%
          </div>
          <div className="text-[11px] text-slate-400">
            {results.eaas?.metrics.deadlineMissCount ?? 0} missed deadline(s)
          </div>
        </div>
      </div>

      {/* Comprehensive Comparative Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold text-white">Algorithm Benchmark Comparison Matrix</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Workload: {processes.length} Processes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Algorithm</th>
                <th className="py-3 px-3 text-right">Avg Waiting (ms)</th>
                <th className="py-3 px-3 text-right">Avg Turnaround (ms)</th>
                <th className="py-3 px-3 text-right">Avg Response (ms)</th>
                <th className="py-3 px-3 text-right">CPU Util (%)</th>
                <th className="py-3 px-3 text-right">Total Energy (J)</th>
                <th className="py-3 px-3 text-right">Energy Savings (%)</th>
                <th className="py-3 px-3 text-right">Deadline Misses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {algorithms.map((alg) => {
                const m = alg.res?.metrics;
                const isEAAS = alg.key === 'eaas';

                return (
                  <tr
                    key={alg.key}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      isEAAS ? 'bg-teal-500/10 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: alg.color }} />
                        <span className={isEAAS ? 'text-teal-300 font-bold' : 'text-white'}>
                          {alg.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">{m?.averageWaitingTime ?? 0}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{m?.averageTurnaroundTime ?? 0}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{m?.averageResponseTime ?? 0}</td>
                    <td className="py-3 px-3 text-right text-emerald-400">{m?.cpuUtilization ?? 0}%</td>
                    <td className="py-3 px-3 text-right font-bold text-teal-300">
                      {m?.totalEnergy ?? 0} J
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {m?.energySavingsPercent ? `-${m.energySavingsPercent}%` : '0% (Base)'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {m?.deadlineMissCount === 0 ? (
                        <span className="text-emerald-400">0</span>
                      ) : (
                        <span className="text-amber-400 font-bold">{m?.deadlineMissCount ?? 0}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Energy Consumption Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-400" />
              <span>Estimated Dynamic Energy Consumption (Joules)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">P(f) = k &times; f&sup3;</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" J" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar dataKey="Energy" name="Total Energy (J)" radius={[4, 4, 0, 0]}>
                  {energyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 text-center">
            Lower is better. Notice the significant drop in EAAS due to cubic frequency scaling.
          </div>
        </div>

        {/* Chart 2: Time Performance Metrics Comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Time Metrics Comparison (Waiting vs Turnaround)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Time (ms)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeMetricsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" ms" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Waiting" name="Avg Waiting Time" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Turnaround" name="Avg Turnaround Time" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 text-center">
            EAAS trades a modest, user-bounded execution delay (&le; {(config.maxAcceptableSlowdown * 100).toFixed(0)}%) for massive energy savings.
          </div>
        </div>
      </div>

      {/* Side-by-Side Gantt Charts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white">Comparative Execution Gantt Charts</h2>
            <div className="text-xs text-slate-400">
              Visual comparison showing timeline duration and operational frequency scaling across all algorithms.
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> 0.5x Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-sky-500"></span> 0.75x Med
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> 1.0x High
            </span>
          </div>
        </div>

        <div className="space-y-6 divide-y divide-slate-800/80">
          {algorithms.map((alg) => (
            <div key={alg.key} className="pt-4 first:pt-0">
              <GanttChart
                timeline={alg.res?.timeline ?? []}
                processes={processes}
                title={alg.name}
                totalTime={maxTotalTime}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Process-Level Breakdown for EAAS */}
      {results.eaas && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Detailed Process Execution Breakdown (EAAS)</h3>
            </div>
            <span className="text-xs font-mono text-teal-400">DVFS Adaptive Modulations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">PID</th>
                  <th className="py-2.5 px-3">Arrival</th>
                  <th className="py-2.5 px-3">Base Burst</th>
                  <th className="py-2.5 px-3">Scaled Burst</th>
                  <th className="py-2.5 px-3">Avg Freq</th>
                  <th className="py-2.5 px-3">Completion</th>
                  <th className="py-2.5 px-3">TAT</th>
                  <th className="py-2.5 px-3">Waiting</th>
                  <th className="py-2.5 px-3">Deadline</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Energy (J)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {results.eaas.processMetrics.map((pm) => {
                  return (
                    <tr key={pm.processId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">{pm.processId}</td>
                      <td className="py-2.5 px-3 text-slate-300">{pm.arrivalTime} ms</td>
                      <td className="py-2.5 px-3 text-slate-300">{pm.burstTime} ms</td>
                      <td className="py-2.5 px-3 text-teal-300">{pm.effectiveBurstTime} ms</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                          {pm.averageFrequency}x
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{pm.completionTime} ms</td>
                      <td className="py-2.5 px-3 text-slate-300">{pm.turnaroundTime} ms</td>
                      <td className="py-2.5 px-3 text-slate-300">{pm.waitingTime} ms</td>
                      <td className="py-2.5 px-3 text-slate-400">{pm.deadline ?? 'None'}</td>
                      <td className="py-2.5 px-3">
                        {pm.deadline === undefined ? (
                          <span className="text-slate-400">N/A</span>
                        ) : pm.metDeadline ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Met
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Missed
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-teal-300">
                        {pm.energyConsumed} J
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
