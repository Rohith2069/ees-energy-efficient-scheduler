import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Process } from '../engine/types';
import { PRESET_WORKLOADS } from '../engine/presets';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  AlertCircle, 
  Check, 
  X, 
  Sparkles, 
  Layers,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

export const ProcessManager: React.FC = () => {
  const { 
    processes, 
    addProcess, 
    updateProcess, 
    deleteProcess, 
    clearAllProcesses, 
    loadPreset,
    setActivePage 
  } = useSimulation();

  // Form states
  const [pid, setPid] = useState(`P${processes.length + 1}`);
  const [arrivalTime, setArrivalTime] = useState('0');
  const [burstTime, setBurstTime] = useState('4');
  const [priority, setPriority] = useState('2');
  const [deadline, setDeadline] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    arrivalTime: number;
    burstTime: number;
    priority: number;
    deadline?: number;
  }>({ arrivalTime: 0, burstTime: 1, priority: 1 });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const arr = parseInt(arrivalTime, 10);
    const burst = parseInt(burstTime, 10);
    const prio = parseInt(priority, 10);
    const dline = deadline.trim() !== '' ? parseInt(deadline, 10) : undefined;

    if (isNaN(arr) || arr < 0) {
      setFormError('Arrival Time must be a valid non-negative integer (>= 0).');
      return;
    }
    if (isNaN(burst) || burst <= 0) {
      setFormError('Burst Time must be a valid positive integer (> 0).');
      return;
    }
    if (isNaN(prio) || prio < 1) {
      setFormError('Priority must be 1 or higher (1 = highest priority).');
      return;
    }
    if (dline !== undefined && (isNaN(dline) || dline < arr + burst)) {
      setFormError(`Deadline (${dline}) must be at least Arrival (${arr}) + Burst (${burst}) = ${arr + burst}.`);
      return;
    }

    const res = addProcess({
      id: pid,
      arrivalTime: arr,
      burstTime: burst,
      priority: prio,
      deadline: dline,
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to add process.');
    } else {
      setFormSuccess(`Process ${pid.toUpperCase()} added successfully!`);
      // Prepare next sequential PID
      setPid(`P${processes.length + 2}`);
      setDeadline('');
      setTimeout(() => setFormSuccess(null), 3000);
    }
  };

  const startEditing = (p: Process) => {
    setEditingId(p.id);
    setEditValues({
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      deadline: p.deadline,
    });
  };

  const saveEdit = (id: string) => {
    if (editValues.arrivalTime < 0 || editValues.burstTime <= 0 || editValues.priority < 1) {
      return;
    }
    const res = updateProcess(id, editValues);
    if (res.success) {
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const generateRandomProcess = () => {
    const nextNum = processes.length + 1;
    const nextArr = Math.floor(Math.random() * 8);
    const nextBurst = Math.floor(Math.random() * 7) + 2;
    const nextPrio = Math.floor(Math.random() * 4) + 1;
    const hasDeadline = Math.random() > 0.3;
    const nextDeadline = hasDeadline ? nextArr + nextBurst + Math.floor(Math.random() * 12) + 4 : undefined;

    addProcess({
      id: `P${nextNum}`,
      arrivalTime: nextArr,
      burstTime: nextBurst,
      priority: nextPrio,
      deadline: nextDeadline,
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header and Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs font-mono font-medium text-teal-400 uppercase tracking-wider">
            Module 1 · Workload Configuration
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Process Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Define, validate, and maintain CPU tasks with arrival times, burst requirements, priorities, and deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('scheduling-engine')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
          >
            <span>Proceed to Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Workload Quick-Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Load Real-World Benchmark Scenarios</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Select a verified workload to instantly populate test cases for your presentation.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_WORKLOADS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset.id)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
            >
              {preset.name.split(' ')[0]} ({preset.processes.length}p)
            </button>
          ))}
          <button
            onClick={generateRandomProcess}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors cursor-pointer"
          >
            + Quick Random
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form: Add New Process */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 lg:col-span-1 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-400" />
              <span>Add New Process</span>
            </h2>
            <span className="text-[11px] text-slate-400">Strict Validation</span>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="process-id-input" className="block text-slate-300 font-medium mb-1">
                Process ID (PID) *
              </label>
              <input
                id="process-id-input"
                type="text"
                value={pid}
                onChange={(e) => setPid(e.target.value.toUpperCase())}
                placeholder="e.g. P1"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="arrival-time-input" className="block text-slate-300 font-medium mb-1">
                  Arrival Time (ms) *
                </label>
                <input
                  id="arrival-time-input"
                  type="number"
                  min="0"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label htmlFor="burst-time-input" className="block text-slate-300 font-medium mb-1">
                  Burst Time (ms) *
                </label>
                <input
                  id="burst-time-input"
                  type="number"
                  min="1"
                  value={burstTime}
                  onChange={(e) => setBurstTime(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="priority-input" className="block text-slate-300 font-medium mb-1">
                  Priority (1=High) *
                </label>
                <input
                  id="priority-input"
                  type="number"
                  min="1"
                  max="10"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label htmlFor="deadline-input" className="block text-slate-300 font-medium mb-1">
                  Deadline (Optional)
                </label>
                <input
                  id="deadline-input"
                  type="number"
                  min="0"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Insert Process</span>
            </button>
          </form>

          {/* Academic Note */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>Input Validation Rules:</span>
            </div>
            <div>• PID must be unique across all active jobs.</div>
            <div>• Burst Time must be strictly positive (&gt; 0).</div>
            <div>• If specified, Deadline must be &ge; Arrival + Burst.</div>
          </div>
        </div>

        {/* Table: Process List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-bold text-white">Active Process Pool</h2>
              <span className="text-xs font-mono text-slate-400">({processes.length} tasks registered)</span>
            </div>

            {processes.length > 0 && (
              <button
                onClick={clearAllProcesses}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {processes.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
              <div className="text-sm text-slate-400">No processes currently registered.</div>
              <div className="text-xs text-slate-400">
                Use the form on the left or click a preset to populate processes.
              </div>
              <button
                onClick={() => loadPreset('academic_os_benchmark')}
                className="px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium cursor-pointer"
              >
                Load Default CSE316 Workload
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">PID</th>
                    <th className="py-2.5 px-3">Arrival</th>
                    <th className="py-2.5 px-3">Burst</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Deadline</th>
                    <th className="py-2.5 px-3">Laxity (Slack)</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {processes.map((p) => {
                    const isEditing = editingId === p.id;
                    const slack = p.deadline !== undefined ? p.deadline - (p.arrivalTime + p.burstTime) : null;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <span
                            style={{ borderLeftColor: p.color || '#0d9488' }}
                            className="pl-2 border-l-2 font-bold text-white"
                          >
                            {p.id}
                          </span>
                        </td>

                        {/* Arrival Time */}
                        <td className="py-2.5 px-3">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editValues.arrivalTime}
                              onChange={(e) =>
                                setEditValues((prev) => ({ ...prev, arrivalTime: parseInt(e.target.value, 10) || 0 }))
                              }
                              className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-white"
                            />
                          ) : (
                            <span className="text-slate-300">{p.arrivalTime} ms</span>
                          )}
                        </td>

                        {/* Burst Time */}
                        <td className="py-2.5 px-3">
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              value={editValues.burstTime}
                              onChange={(e) =>
                                setEditValues((prev) => ({ ...prev, burstTime: parseInt(e.target.value, 10) || 1 }))
                              }
                              className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-white"
                            />
                          ) : (
                            <span className="text-slate-300">{p.burstTime} ms</span>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="py-2.5 px-3">
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              value={editValues.priority}
                              onChange={(e) =>
                                setEditValues((prev) => ({ ...prev, priority: parseInt(e.target.value, 10) || 1 }))
                              }
                              className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-white"
                            />
                          ) : (
                            <span className="text-amber-400 font-semibold">{p.priority}</span>
                          )}
                        </td>

                        {/* Deadline */}
                        <td className="py-2.5 px-3">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editValues.deadline ?? ''}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  deadline: e.target.value ? parseInt(e.target.value, 10) : undefined,
                                }))
                              }
                              placeholder="None"
                              className="w-20 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-white"
                            />
                          ) : p.deadline !== undefined ? (
                            <span className="text-teal-300">{p.deadline} ms</span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>

                        {/* Initial Slack */}
                        <td className="py-2.5 px-3">
                          {slack !== null ? (
                            <span
                              className={`text-xs ${
                                slack < 2 ? 'text-amber-400' : slack >= 5 ? 'text-emerald-400' : 'text-slate-300'
                              }`}
                            >
                              +{slack} ms
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => saveEdit(p.id)}
                                title="Save"
                                className="p-1 rounded bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                title="Cancel"
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startEditing(p)}
                                title="Edit process"
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteProcess(p.id)}
                                title="Delete process"
                                className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
