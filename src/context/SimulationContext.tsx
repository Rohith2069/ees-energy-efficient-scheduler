import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Process, SimulationConfig, SimulationResult } from '../engine/types';
import { PRESET_WORKLOADS } from '../engine/presets';
import { simulateFCFS } from '../engine/fcfs';
import { simulateSJF } from '../engine/sjf';
import { simulateRoundRobin } from '../engine/roundRobin';
import { simulateEAAS } from '../engine/eaas';

export type PageId =
  | 'dashboard'
  | 'process-manager'
  | 'scheduling-engine'
  | 'performance-analysis'
  | 'university-report';

interface SimulationContextType {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  processes: Process[];
  addProcess: (process: Omit<Process, 'color'>) => { success: boolean; error?: string };
  updateProcess: (id: string, updated: Partial<Process>) => { success: boolean; error?: string };
  deleteProcess: (id: string) => void;
  clearAllProcesses: () => void;
  loadPreset: (presetId: string) => void;
  resetToDefault: () => void;
  config: SimulationConfig;
  updateConfig: (newConfig: Partial<SimulationConfig>) => void;
  results: {
    fcfs: SimulationResult | null;
    sjf: SimulationResult | null;
    rr: SimulationResult | null;
    eaas: SimulationResult | null;
  };
  runAllSimulations: () => void;
  selectedAlgorithm: 'FCFS' | 'SJF' | 'RR' | 'EAAS';
  setSelectedAlgorithm: (alg: 'FCFS' | 'SJF' | 'RR' | 'EAAS') => void;
}

const COLOR_PALETTE = [
  '#38bdf8', // sky
  '#34d399', // emerald
  '#fbbf24', // amber
  '#f472b6', // pink
  '#a78bfa', // purple
  '#fb923c', // orange
  '#2dd4bf', // teal
  '#818cf8', // indigo
];

const DEFAULT_CONFIG: SimulationConfig = {
  timeQuantum: 2,
  maxAcceptableSlowdown: 0.20,
  powerConstant: 1.0,
  idlePower: 0.05,
};

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [config, setConfig] = useState<SimulationConfig>(() => {
    try {
      const saved = localStorage.getItem('ees_config');
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [processes, setProcesses] = useState<Process[]>(() => {
    try {
      const saved = localStorage.getItem('ees_processes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return PRESET_WORKLOADS[0].processes;
  });

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'FCFS' | 'SJF' | 'RR' | 'EAAS'>('EAAS');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ees_processes', JSON.stringify(processes));
    } catch {
      // ignore quota
    }
  }, [processes]);

  useEffect(() => {
    try {
      localStorage.setItem('ees_config', JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  const updateConfig = useCallback((newConfig: Partial<SimulationConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const addProcess = useCallback(
    (newP: Omit<Process, 'color'>) => {
      const trimmedId = newP.id.trim().toUpperCase();
      if (!trimmedId) {
        return { success: false, error: 'Process ID cannot be empty.' };
      }
      if (processes.some((p) => p.id === trimmedId)) {
        return { success: false, error: `Process ID "${trimmedId}" already exists. Each PID must be unique.` };
      }
      if (newP.arrivalTime < 0) {
        return { success: false, error: 'Arrival time must be 0 or greater.' };
      }
      if (newP.burstTime <= 0) {
        return { success: false, error: 'Burst time must be greater than 0.' };
      }
      if (newP.priority < 1) {
        return { success: false, error: 'Priority must be 1 or higher.' };
      }
      if (newP.deadline !== undefined && newP.deadline < newP.arrivalTime + newP.burstTime) {
        return {
          success: false,
          error: `Deadline (${newP.deadline}) cannot be less than Arrival (${newP.arrivalTime}) + Burst (${newP.burstTime}) = ${newP.arrivalTime + newP.burstTime}.`,
        };
      }

      const assignedColor = COLOR_PALETTE[processes.length % COLOR_PALETTE.length];
      const processToAdd: Process = {
        ...newP,
        id: trimmedId,
        color: assignedColor,
      };

      setProcesses((prev) => [...prev, processToAdd]);
      return { success: true };
    },
    [processes]
  );

  const updateProcess = useCallback(
    (id: string, updated: Partial<Process>) => {
      if (updated.arrivalTime !== undefined && updated.arrivalTime < 0) {
        return { success: false, error: 'Arrival time must be 0 or greater.' };
      }
      if (updated.burstTime !== undefined && updated.burstTime <= 0) {
        return { success: false, error: 'Burst time must be greater than 0.' };
      }
      if (updated.priority !== undefined && updated.priority < 1) {
        return { success: false, error: 'Priority must be 1 or higher.' };
      }

      setProcesses((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const merged = { ...p, ...updated };
          return merged;
        })
      );
      return { success: true };
    },
    []
  );

  const deleteProcess = useCallback((id: string) => {
    setProcesses((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearAllProcesses = useCallback(() => {
    setProcesses([]);
  }, []);

  const loadPreset = useCallback((presetId: string) => {
    const found = PRESET_WORKLOADS.find((pw) => pw.id === presetId);
    if (found) {
      setProcesses(found.processes);
    }
  }, []);

  const resetToDefault = useCallback(() => {
    setProcesses(PRESET_WORKLOADS[0].processes);
    setConfig(DEFAULT_CONFIG);
  }, []);

  // Compute simulation results whenever processes or config change
  const results = useMemo(() => {
    if (processes.length === 0) {
      return { fcfs: null, sjf: null, rr: null, eaas: null };
    }

    const fcfsRes = simulateFCFS(processes, config.powerConstant);
    const baselineEnergy = fcfsRes.metrics.totalEnergy;

    const sjfRes = simulateSJF(processes, config.powerConstant, baselineEnergy);
    const rrRes = simulateRoundRobin(processes, config.timeQuantum, config.powerConstant, baselineEnergy);
    const eaasRes = simulateEAAS(processes, config.maxAcceptableSlowdown, config.powerConstant, baselineEnergy);

    return {
      fcfs: fcfsRes,
      sjf: sjfRes,
      rr: rrRes,
      eaas: eaasRes,
    };
  }, [processes, config]);

  const runAllSimulations = useCallback(() => {
    // Force re-trigger if needed
    setProcesses((prev) => [...prev]);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        activePage,
        setActivePage,
        processes,
        addProcess,
        updateProcess,
        deleteProcess,
        clearAllProcesses,
        loadPreset,
        resetToDefault,
        config,
        updateConfig,
        results,
        runAllSimulations,
        selectedAlgorithm,
        setSelectedAlgorithm,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export function useSimulation(): SimulationContextType {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return ctx;
}
