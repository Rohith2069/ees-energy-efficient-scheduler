import { Process, ScheduleEvent, SimulationResult } from './types';
import { calculatePower, calculateDynamicEnergy } from './powerModel';
import { computeSimulationMetrics } from './calculateMetrics';

export function simulateFCFS(processes: Process[], powerK: number = 1.0, baselineEnergy?: number): SimulationResult {
  if (processes.length === 0) {
    return computeSimulationMetrics('FCFS', 'First-Come, First-Served', [], []);
  }

  // Sort by arrival time ascending; tie breaker by ID
  const sorted = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.id.localeCompare(b.id);
  });

  const timeline: ScheduleEvent[] = [];
  let currentTime = 0;

  for (const p of sorted) {
    if (currentTime < p.arrivalTime) {
      // CPU Idle gap
      const idleDuration = p.arrivalTime - currentTime;
      timeline.push({
        time: currentTime,
        duration: idleDuration,
        processId: 'IDLE',
        frequency: 0,
        power: 0,
        energy: 0,
      });
      currentTime = p.arrivalTime;
    }

    // Traditional FCFS runs at standard high frequency f = 1.0
    const frequency = 1.0;
    const duration = p.burstTime; // at f=1.0, time = burst / 1.0
    const power = calculatePower(frequency, powerK);
    const energy = calculateDynamicEnergy(p.burstTime, frequency, powerK);

    timeline.push({
      time: currentTime,
      duration,
      processId: p.id,
      frequency,
      power,
      energy,
    });

    currentTime += duration;
  }

  return computeSimulationMetrics('FCFS', 'First-Come, First-Served (FCFS)', processes, timeline, baselineEnergy);
}
