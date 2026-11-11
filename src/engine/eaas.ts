import { Process, ScheduleEvent, SimulationResult } from './types';
import { calculatePower, calculateDynamicEnergy, selectAdaptiveFrequency } from './powerModel';
import { computeSimulationMetrics } from './calculateMetrics';

interface ActiveJob {
  process: Process;
  remainingBurst: number;
}

/**
 * EAAS – Energy-Aware Adaptive Scheduling
 *
 * Combines priority/laxity-aware dispatching with Dynamic Voltage & Frequency Scaling (DVFS).
 * For each dispatch cycle:
 * 1. Readies arrived processes.
 * 2. Ranks candidate processes by effective urgency (priority + deadline laxity + burst).
 * 3. Applies DVFS frequency selector to determine optimal operational frequency:
 *    f in {0.5, 0.75, 1.0} minimizing energy E = k * f^3 * (B / f) while respecting
 *    the deadline and max acceptable slowdown limit.
 * 4. Executes process chunk and records energy, timeline, and frequency state.
 */
export function simulateEAAS(
  processes: Process[],
  maxSlowdown: number = 0.20,
  powerK: number = 1.0,
  baselineEnergy?: number
): SimulationResult {
  if (processes.length === 0) {
    return computeSimulationMetrics('EAAS', 'Energy-Aware Adaptive Scheduling (EAAS)', [], []);
  }

  const uncompleted: ActiveJob[] = processes.map((p) => ({
    process: p,
    remainingBurst: p.burstTime,
  }));

  const timeline: ScheduleEvent[] = [];
  let currentTime = 0;

  while (uncompleted.length > 0) {
    // Find all arrived processes
    const available = uncompleted.filter((job) => job.process.arrivalTime <= currentTime);

    if (available.length === 0) {
      // CPU Idle period until next arrival
      const nextArrival = Math.min(...uncompleted.map((job) => job.process.arrivalTime));
      const idleDuration = nextArrival - currentTime;
      timeline.push({
        time: currentTime,
        duration: idleDuration,
        processId: 'IDLE',
        frequency: 0,
        power: 0,
        energy: 0,
      });
      currentTime = nextArrival;
      continue;
    }

    // Rank available processes by Adaptive Urgency Score:
    // Urgency considers Priority (1 is highest), Laxity (deadline slack), and Burst (SJF bias)
    available.sort((a, b) => {
      // 1. Strict Priority first
      if (a.process.priority !== b.process.priority) {
        return a.process.priority - b.process.priority;
      }

      // 2. Deadline Laxity if present (earlier deadline or tighter slack wins)
      const aDeadline = a.process.deadline ?? Number.MAX_SAFE_INTEGER;
      const bDeadline = b.process.deadline ?? Number.MAX_SAFE_INTEGER;
      if (aDeadline !== bDeadline) {
        return aDeadline - bDeadline;
      }

      // 3. Shortest Remaining Burst tie-breaker
      if (a.remainingBurst !== b.remainingBurst) {
        return a.remainingBurst - b.remainingBurst;
      }

      return a.process.id.localeCompare(b.process.id);
    });

    const chosenJob = available[0];

    // Select optimal DVFS frequency for this process slice
    const selectedFreq = selectAdaptiveFrequency(
      chosenJob.remainingBurst,
      currentTime,
      chosenJob.process.deadline,
      chosenJob.process.priority,
      maxSlowdown
    );

    // Compute execution duration at chosen frequency:
    // T = B / f
    const duration = Number((chosenJob.remainingBurst / selectedFreq).toFixed(3));
    const power = calculatePower(selectedFreq, powerK);
    const energy = calculateDynamicEnergy(chosenJob.remainingBurst, selectedFreq, powerK);

    timeline.push({
      time: Number(currentTime.toFixed(3)),
      duration,
      processId: chosenJob.process.id,
      frequency: selectedFreq,
      power,
      energy,
    });

    currentTime = Number((currentTime + duration).toFixed(3));
    chosenJob.remainingBurst = 0;

    // Remove completed job
    const index = uncompleted.findIndex((j) => j.process.id === chosenJob.process.id);
    if (index !== -1) {
      uncompleted.splice(index, 1);
    }
  }

  return computeSimulationMetrics(
    'EAAS',
    `EAAS (DVFS Adaptive, Slowdown ≤ ${(maxSlowdown * 100).toFixed(0)}%)`,
    processes,
    timeline,
    baselineEnergy
  );
}
