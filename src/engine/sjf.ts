import { Process, ScheduleEvent, SimulationResult } from './types';
import { calculatePower, calculateDynamicEnergy } from './powerModel';
import { computeSimulationMetrics } from './calculateMetrics';

export function simulateSJF(processes: Process[], powerK: number = 1.0, baselineEnergy?: number): SimulationResult {
  if (processes.length === 0) {
    return computeSimulationMetrics('SJF', 'Shortest Job First', [], []);
  }

  const uncompleted = processes.map((p) => ({ ...p }));
  const timeline: ScheduleEvent[] = [];
  let currentTime = 0;

  while (uncompleted.length > 0) {
    // Find processes that have arrived at or before currentTime
    const available = uncompleted.filter((p) => p.arrivalTime <= currentTime);

    if (available.length === 0) {
      // Find the next closest arrival time
      const nextArrival = Math.min(...uncompleted.map((p) => p.arrivalTime));
      timeline.push({
        time: currentTime,
        duration: nextArrival - currentTime,
        processId: 'IDLE',
        frequency: 0,
        power: 0,
        energy: 0,
      });
      currentTime = nextArrival;
      continue;
    }

    // Select process with shortest burst time; tie breaker by arrival time then ID
    available.sort((a, b) => {
      if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id);
    });

    const chosen = available[0];
    const index = uncompleted.findIndex((p) => p.id === chosen.id);
    uncompleted.splice(index, 1);

    // Traditional SJF runs at standard high frequency f = 1.0
    const frequency = 1.0;
    const duration = chosen.burstTime;
    const power = calculatePower(frequency, powerK);
    const energy = calculateDynamicEnergy(chosen.burstTime, frequency, powerK);

    timeline.push({
      time: currentTime,
      duration,
      processId: chosen.id,
      frequency,
      power,
      energy,
    });

    currentTime += duration;
  }

  return computeSimulationMetrics('SJF', 'Shortest Job First (SJF)', processes, timeline, baselineEnergy);
}
