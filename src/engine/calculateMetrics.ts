import { Process, ScheduleEvent, ProcessMetric, SimulationMetrics, SimulationResult } from './types';

export function computeSimulationMetrics(
  algorithm: 'FCFS' | 'SJF' | 'RR' | 'EAAS',
  algorithmName: string,
  processes: Process[],
  timeline: ScheduleEvent[],
  baselineEnergy?: number
): SimulationResult {
  if (processes.length === 0 || timeline.length === 0) {
    return {
      algorithm,
      algorithmName,
      timeline: [],
      processMetrics: [],
      metrics: {
        averageWaitingTime: 0,
        averageTurnaroundTime: 0,
        averageResponseTime: 0,
        cpuUtilization: 0,
        totalExecutionTime: 0,
        totalEnergy: 0,
        energySavingsPercent: 0,
        deadlineMissCount: 0,
        deadlineMissRate: 0,
        frequencyDistribution: { low: 0, medium: 0, high: 0 },
      },
    };
  }

  const processMetrics: ProcessMetric[] = processes.map((p) => {
    // Find all events for this process
    const events = timeline.filter((e) => e.processId === p.id);

    if (events.length === 0) {
      return {
        processId: p.id,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        effectiveBurstTime: 0,
        startTime: 0,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        responseTime: 0,
        deadline: p.deadline,
        metDeadline: false,
        averageFrequency: 1.0,
        energyConsumed: 0,
      };
    }

    const startTime = events[0].time;
    const lastEvent = events[events.length - 1];
    const completionTime = Number((lastEvent.time + lastEvent.duration).toFixed(3));
    const effectiveBurstTime = Number(
      events.reduce((sum, e) => sum + e.duration, 0).toFixed(3)
    );
    const turnaroundTime = Number((completionTime - p.arrivalTime).toFixed(3));
    const waitingTime = Number(Math.max(0, turnaroundTime - effectiveBurstTime).toFixed(3));
    const responseTime = Number((startTime - p.arrivalTime).toFixed(3));

    const totalEnergy = events.reduce((sum, e) => sum + e.energy, 0);
    const weightedFreq = events.reduce((sum, e) => sum + e.frequency * e.duration, 0) / (effectiveBurstTime || 1);

    const metDeadline = p.deadline !== undefined ? completionTime <= p.deadline : undefined;

    return {
      processId: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      effectiveBurstTime,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
      deadline: p.deadline,
      metDeadline,
      averageFrequency: Number(weightedFreq.toFixed(2)),
      energyConsumed: Number(totalEnergy.toFixed(4)),
    };
  });

  const totalExecutionTime = timeline.length > 0
    ? Number((timeline[timeline.length - 1].time + timeline[timeline.length - 1].duration).toFixed(3))
    : 0;

  const busyDuration = timeline
    .filter((e) => e.processId !== 'IDLE')
    .reduce((sum, e) => sum + e.duration, 0);

  const cpuUtilization = totalExecutionTime > 0
    ? Number(((busyDuration / totalExecutionTime) * 100).toFixed(1))
    : 0;

  const totalEnergy = Number(
    timeline.reduce((sum, e) => sum + e.energy, 0).toFixed(4)
  );

  const avgWT = Number(
    (processMetrics.reduce((sum, p) => sum + p.waitingTime, 0) / processMetrics.length).toFixed(2)
  );
  const avgTAT = Number(
    (processMetrics.reduce((sum, p) => sum + p.turnaroundTime, 0) / processMetrics.length).toFixed(2)
  );
  const avgRT = Number(
    (processMetrics.reduce((sum, p) => sum + p.responseTime, 0) / processMetrics.length).toFixed(2)
  );

  const processesWithDeadlines = processMetrics.filter((p) => p.deadline !== undefined);
  const deadlineMissCount = processesWithDeadlines.filter((p) => p.metDeadline === false).length;
  const deadlineMissRate = processesWithDeadlines.length > 0
    ? Number(((deadlineMissCount / processesWithDeadlines.length) * 100).toFixed(1))
    : 0;

  // Energy savings relative to baseline
  let energySavingsPercent = 0;
  if (baselineEnergy && baselineEnergy > 0) {
    energySavingsPercent = Number(
      Math.max(0, ((baselineEnergy - totalEnergy) / baselineEnergy) * 100).toFixed(1)
    );
  }

  // Frequency distribution
  const freqDist = { low: 0, medium: 0, high: 0 };
  timeline
    .filter((e) => e.processId !== 'IDLE')
    .forEach((e) => {
      if (e.frequency <= 0.6) freqDist.low += e.duration;
      else if (e.frequency <= 0.85) freqDist.medium += e.duration;
      else freqDist.high += e.duration;
    });

  const metrics: SimulationMetrics = {
    averageWaitingTime: avgWT,
    averageTurnaroundTime: avgTAT,
    averageResponseTime: avgRT,
    cpuUtilization,
    totalExecutionTime,
    totalEnergy,
    energySavingsPercent,
    deadlineMissCount,
    deadlineMissRate,
    frequencyDistribution: {
      low: Number(freqDist.low.toFixed(2)),
      medium: Number(freqDist.medium.toFixed(2)),
      high: Number(freqDist.high.toFixed(2)),
    },
  };

  return {
    algorithm,
    algorithmName,
    timeline,
    processMetrics,
    metrics,
  };
}
