import React, { useState, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { GanttChart } from '../components/visualizers/GanttChart';
import { StepPlaybackControls } from '../components/visualizers/StepPlaybackControls';
import { 
  Cpu, 
  Zap, 
  Clock, 
  Settings2, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Code2, 
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

export const SchedulingEngine: React.FC = () => {
  const { 
    processes, 
    config, 
    updateConfig, 
    results, 
    selectedAlgorithm, 
    setSelectedAlgorithm,
    setActivePage 
  } = useSimulation();

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(600);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'pseudocode' | 'formula'>('visualizer');

  const currentResult = results[selectedAlgorithm.toLowerCase() as keyof typeof results];
  const timeline = currentResult?.timeline ?? [];

  // Current active event in playback
  const currentEvent = timeline.length > 0 ? timeline[Math.min(currentStepIndex, timeline.length - 1)] : null;
  const currentSimTime = currentEvent ? Number((currentEvent.time + currentEvent.duration).toFixed(2)) : 0;

  // Active processes at this simulation tick
  const readyQueue = useMemo(() => {
    if (!currentEvent) return [];
    return processes.filter(
      (p) => p.arrivalTime <= currentEvent.time && p.id !== currentEvent.processId
    );
  }, [processes, currentEvent]);

  const handleStepNext = () => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, timeline.length - 1));
  };

  const handleResetPlayback = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const eaasSavings = results.eaas?.metrics.energySavingsPercent ?? 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs font-mono font-medium text-teal-400 uppercase tracking-wider">
            Module 2 · Execution & DVFS Engine
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CPU Scheduling and Energy Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate and contrast traditional CPU scheduling with proposed Energy-Aware Adaptive Scheduling (EAAS).
          </p>
        </div>

        <button
          onClick={() => setActivePage('performance-analysis')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <span>View Performance Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Algorithm Selector & DVFS Tuning Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Algorithm Switcher & Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 lg:col-span-1">
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>Target Algorithm</span>
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {(['FCFS', 'SJF', 'RR', 'EAAS'] as const).map((alg) => {
                const isSelected = selectedAlgorithm === alg;
                return (
                  <button
                    key={alg}
                    onClick={() => {
                      setSelectedAlgorithm(alg);
                      setCurrentStepIndex(0);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {alg === 'EAAS' ? 'EAAS (Proposed)' : alg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Configuration Controls */}
          <div className="pt-3 border-t border-slate-800/80 space-y-4 text-xs">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-teal-400" />
              <span>Simulation Parameters</span>
            </div>

            {/* Round Robin Time Quantum */}
            {selectedAlgorithm === 'RR' && (
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center">
                  <label htmlFor="time-quantum-slider" className="text-slate-300">Time Quantum (q):</label>
                  <span className="font-mono text-teal-400 font-bold">{config.timeQuantum} ms</span>
                </div>
                <input
                  id="time-quantum-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={config.timeQuantum}
                  onChange={(e) => updateConfig({ timeQuantum: Number(e.target.value) })}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <div className="text-[11px] text-slate-400">Controls time slice duration before preemption.</div>
              </div>
            )}

            {/* EAAS Max Slowdown Slider */}
            {selectedAlgorithm === 'EAAS' && (
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center">
                  <label htmlFor="max-slowdown-slider" className="text-slate-300">Max Acceptable Slowdown:</label>
                  <span className="font-mono text-teal-400 font-bold">
                    {(config.maxAcceptableSlowdown * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  id="max-slowdown-slider"
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={config.maxAcceptableSlowdown}
                  onChange={(e) => updateConfig({ maxAcceptableSlowdown: Number(e.target.value) })}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <div className="text-[11px] text-slate-400">
                  Selects lowest frequency that limits execution delay to &le; {(config.maxAcceptableSlowdown * 100).toFixed(0)}%.
                </div>
              </div>
            )}

            {/* Normalized Power Coefficient k */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="power-coefficient-select" className="text-slate-400">Power Constant (k):</label>
                <span className="font-mono text-slate-200">{config.powerConstant}.0</span>
              </div>
              <select
                id="power-coefficient-select"
                aria-label="Power Constant"
                value={config.powerConstant}
                onChange={(e) => updateConfig({ powerConstant: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-1 text-xs"
              >
                <option value={1.0}>1.0 (Standard CMOS Normalized)</option>
                <option value={1.5}>1.5 (High Capacitance Load)</option>
                <option value={0.8}>0.8 (Ultra-Low Leakage Silicon)</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics of Active Algorithm */}
          {currentResult && (
            <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="text-slate-400 font-medium">Active Algorithm Metrics:</div>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Energy</div>
                  <div className="text-teal-300 font-bold">{currentResult.metrics.totalEnergy} J</div>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Avg TAT</div>
                  <div className="text-slate-200 font-bold">{currentResult.metrics.averageTurnaroundTime} ms</div>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Avg WT</div>
                  <div className="text-slate-200 font-bold">{currentResult.metrics.averageWaitingTime} ms</div>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">CPU Util</div>
                  <div className="text-emerald-400 font-bold">{currentResult.metrics.cpuUtilization}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visualization, Stepper, and State Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 lg:col-span-3">
          {/* View Mode Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('visualizer')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'visualizer'
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Interactive Timeline & Stepper
              </button>
              <button
                onClick={() => setActiveTab('pseudocode')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'pseudocode'
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EAAS Pseudocode & Logic
              </button>
              <button
                onClick={() => setActiveTab('formula')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'formula'
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                DVFS Mathematical Model
              </button>
            </div>

            {selectedAlgorithm === 'EAAS' && eaasSavings > 0 && (
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Saving {eaasSavings}% Energy</span>
              </div>
            )}
          </div>

          {activeTab === 'visualizer' && (
            <div className="space-y-6">
              {/* Step Playback Controller */}
              <StepPlaybackControls
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((prev) => !prev)}
                onStepNext={handleStepNext}
                onReset={handleResetPlayback}
                currentStep={currentStepIndex}
                totalSteps={Math.max(1, timeline.length)}
                speed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
                currentTime={currentSimTime}
              />

              {/* Gantt Chart Display */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Execution Gantt Timeline: {currentResult?.algorithmName}</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Frequency tags: 0.5x, 0.75x, 1.0x
                  </span>
                </div>
                <GanttChart
                  timeline={timeline}
                  processes={processes}
                  highlightEventIndex={currentStepIndex}
                />
              </div>

              {/* Real-Time CPU Core & Ready Queue Inspector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Active CPU Core State */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>CPU Core State</span>
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  </div>
                  {currentEvent ? (
                    <div className="space-y-2 font-mono text-xs">
                      <div className="text-xl font-bold text-white flex items-center gap-2">
                        <span>Process:</span>
                        <span className="text-teal-300">{currentEvent.processId}</span>
                      </div>
                      <div className="text-slate-400">
                        Frequency:{' '}
                        <span className="text-white font-bold">{currentEvent.frequency}x GHz</span>
                      </div>
                      <div className="text-slate-400">
                        Power Draw:{' '}
                        <span className="text-amber-300">{currentEvent.power.toFixed(3)} W</span>
                      </div>
                      <div className="text-slate-400">
                        Energy (slice):{' '}
                        <span className="text-emerald-400">{currentEvent.energy.toFixed(3)} J</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">Core idle / not started</div>
                  )}
                </div>

                {/* Ready Queue Inspector */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Ready Queue at t = {currentSimTime} ms</span>
                    <span className="font-mono text-slate-400">{readyQueue.length} jobs waiting</span>
                  </div>

                  {readyQueue.length === 0 ? (
                    <div className="text-xs text-slate-400 py-3">Ready queue is currently empty.</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {readyQueue.map((p) => (
                        <div
                          key={p.id}
                          className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono space-y-0.5"
                        >
                          <div className="text-white font-bold">{p.id}</div>
                          <div className="text-[10px] text-slate-400">
                            Arr: {p.arrivalTime} | B: {p.burstTime} | Pri: {p.priority}
                          </div>
                          {p.deadline && (
                            <div className="text-[10px] text-teal-400">Dline: {p.deadline}ms</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Execution Events Table */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Timeline Dispatch Events Log</div>
                <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="py-2 px-3">Interval (ms)</th>
                        <th className="py-2 px-3">Process</th>
                        <th className="py-2 px-3">Frequency</th>
                        <th className="py-2 px-3">Power P(f)</th>
                        <th className="py-2 px-3">Energy (J)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      {timeline.map((event, idx) => (
                        <tr
                          key={idx}
                          className={`${
                            idx === currentStepIndex ? 'bg-teal-500/10 font-bold text-teal-300' : 'text-slate-300'
                          }`}
                        >
                          <td className="py-1.5 px-3">
                            [{event.time} &rarr; {Number((event.time + event.duration).toFixed(2))}]
                          </td>
                          <td className="py-1.5 px-3 text-white">{event.processId}</td>
                          <td className="py-1.5 px-3">
                            {event.processId === 'IDLE' ? '0.0x (Idle)' : `${event.frequency}x GHz`}
                          </td>
                          <td className="py-1.5 px-3">{event.power.toFixed(3)} W</td>
                          <td className="py-1.5 px-3">{event.energy.toFixed(3)} J</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pseudocode' && (
            <div className="space-y-4 text-xs font-mono text-slate-300">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto leading-relaxed">
                <div className="text-teal-400 font-bold mb-2">// Algorithm: EAAS (Energy-Aware Adaptive Scheduling) with DVFS</div>
                <div><span className="text-amber-400">Input:</span> Process set P = &#123;P1, P2, ... Pn&#125;, MaxSlowdown &sigma; = 0.20, Frequencies F = [0.5, 0.75, 1.0]</div>
                <div><span className="text-amber-400">Output:</span> Dynamic schedule S with modulated operational frequency and energy records</div>
                <br />
                <div>1.  Initialize currentTime &larr; 0, ReadyQueue &larr; []</div>
                <div>2.  <span className="text-sky-400">while</span> uncompleted processes remain <span className="text-sky-400">do:</span></div>
                <div>3.      ReadyQueue &larr; &#123; p &isin; P | p.arrival &le; currentTime and remainingBurst(p) &gt; 0 &#125;</div>
                <div>4.      <span className="text-sky-400">if</span> ReadyQueue is empty <span className="text-sky-400">then:</span></div>
                <div>5.          currentTime &larr; min(arrival of remaining uncompleted jobs)</div>
                <div>6.          <span className="text-sky-400">continue</span></div>
                <div>7.      Rank ReadyQueue by UrgencyScore:</div>
                <div>8.          Score(p) &larr; w1 &times; Priority(p) + w2 &times; Slack(p) + w3 &times; Burst(p)</div>
                <div>9.      Select candidate job P_selected &larr; argmin(Score)</div>
                <div>10.     // Frequency selection under DVFS constraints</div>
                <div>11.     <span className="text-sky-400">for</span> f &isin; [0.5, 0.75, 1.0] (in ascending order) <span className="text-sky-400">do:</span></div>
                <div>12.         T_scaled &larr; remainingBurst(P_selected) / f</div>
                <div>13.         Slowdown &larr; (1/f) - 1</div>
                <div>14.         <span className="text-sky-400">if</span> (p.deadline is defined and currentTime + T_scaled &le; p.deadline) OR</div>
                <div>15.            (p.deadline is undefined and Slowdown &le; &sigma;) <span className="text-sky-400">then:</span></div>
                <div>16.             chosen_f &larr; f</div>
                <div>17.             <span className="text-sky-400">break</span></div>
                <div>18.     <span className="text-sky-400">if</span> no f satisfies constraints <span className="text-sky-400">then</span> chosen_f &larr; 1.0 // fallback to maximum speed</div>
                <div>19.     Execute P_selected at chosen_f for duration T_scaled</div>
                <div>20.     EnergyConsumed &larr; (k &times; chosen_f&sup3;) &times; T_scaled</div>
                <div>21.     currentTime &larr; currentTime + T_scaled</div>
                <div>22.     Mark P_selected as completed</div>
              </div>
            </div>
          )}

          {activeTab === 'formula' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="font-bold text-white text-sm">Dynamic CMOS Power Model</div>
                  <div className="font-mono text-teal-300 bg-slate-900 p-2 rounded">
                    P(f) = k &times; f&sup3;
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    In CMOS VLSI digital circuits, dynamic switching power is proportional to capacitance, 
                    voltage squared, and clock frequency (<code className="text-slate-200">P &prop; C &times; V&sup2; &times; f</code>). 
                    Because supply voltage scales roughly linearly with operational frequency (<code className="text-slate-200">V &prop; f</code>), 
                    power dissipation exhibits cubic scaling with respect to operational frequency (<code className="text-slate-200">P &prop; f&sup3;</code>).
                  </p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="font-bold text-white text-sm">Dynamic Energy Formulation</div>
                  <div className="font-mono text-teal-300 bg-slate-900 p-2 rounded">
                    E = P(f) &times; T = k &times; f&sup2; &times; Burst
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Although running at half frequency (<code className="text-slate-200">f = 0.5</code>) doubles execution duration (<code className="text-slate-200">T = Burst / 0.5 = 2 &times; Burst</code>), 
                    the power drops eightfold (<code className="text-slate-200">0.5&sup3; = 0.125</code>). Consequently, the net energy consumed per computation 
                    drops to <code className="text-emerald-400">0.125 &times; 2 = 0.25</code> (a 75% energy reduction).
                  </p>
                </div>
              </div>

              {/* Viva Disclaimer */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300">Viva Examination Note:</div>
                  <div>
                    This simulator clearly distinguishes between estimated simulation energy (normalized algorithmic Joules) 
                    and physical hardware measurements. Transition latency between frequency states is assumed negligible 
                    in this high-level OS architectural model.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
