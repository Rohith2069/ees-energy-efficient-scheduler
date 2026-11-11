import { Process, ScheduleEvent, SimulationResult } from './types';
import { calculatePower, calculateDynamicEnergy } from './powerModel';
import { computeSimulationMetrics } from './calculateMetrics';

interface RRProcess {
  process: Process;
  remainingBurst: number;
}

export function simulateRoundRobin(
  processes: Process[],
  timeQuantum: number = 2,
  powerK: number = 1.0,
  baselineEnergy?: number
): SimulationResult {
  if (processes.length === 0) {
    return computeSimulationMetrics('RR', `Round Robin (q=${timeQuantum})`, [], []);
  }

  const quantum = Math.max(1, timeQuantum);
  const queue: RRProcess[] = [];
  const timeline: ScheduleEvent[] = [];

  // Track remaining processes not yet arrived
  const unarrived = processes
    .map((p) => ({ process: p, remainingBurst: p.burstTime }))
    .sort((a, b) => a.process.arrivalTime - b.process.arrivalTime);

  let currentTime = 0;

  // Initial processes arriving at or before currentTime
  while (unarrived.length > 0 && unarrived[0].process.arrivalTime <= currentTime) {
    queue.push(unarrived.shift()!);
  }

  while (queue.length > 0 || unarrived.length > 0) {
    if (queue.length === 0) {
      // Idle period until next arrival
      const nextArrival = unarrived[0].process.arrivalTime;
      timeline.push({
        time: currentTime,
        duration: nextArrival - currentTime,
        processId: 'IDLE',
        frequency: 0,
        power: 0,
        energy: 0,
      });
      currentTime = nextArrival;

      while (unarrived.length > 0 && unarrived[0].process.arrivalTime <= currentTime) {
        queue.push(unarrived.shift()!);
      }
      continue;
    }

    const currentItem = queue.shift()!;
    const executionSlice = Math.min(quantum, currentItem.remainingBurst);

    const frequency = 1.0;
    const duration = executionSlice;
    const power = calculatePower(frequency, powerK);
    const energy = calculateDynamicEnergy(executionSlice, frequency, powerK);

    // Merge adjacent slices if the same process runs consecutively
    if (
      timeline.length > 0 &&
      timeline[timeline.length - 1].processId === currentItem.process.id &&
      timeline[timeline.length - 1].frequency === frequency
    ) {
      timeline[timeline.length - 1].duration += duration;
      timeline[timeline.length - 1].energy += energy;
    } else {
      timeline.push({
        time: currentTime,
        duration,
        processId: currentItem.process.id,
        frequency,
        power,
        energy,
      });
    }

    currentTime += duration;
    currentItem.remainingBurst -= executionSlice;

    // Check for processes arriving during this slice
    while (unarrived.length > 0 && unarrived[0].process.arrivalTime <= currentTime) {
      queue.push(unarrived.shift()!);
    }

    // Re-queue the unfinished process
    if (currentItem.remainingBurst > 0) {
      queue.push(currentItem);
    }
  }

  return computeSimulationMetrics(
    'RR',
    `Round Robin (q=${quantum})`,
    processes,
    timeline,
    baselineEnergy
  );
}
