export type FrequencyLevel = 0.5 | 0.75 | 1.0;

export interface Process {
  id: string;
  name?: string;
  arrivalTime: number;
  burstTime: number;
  priority: number; // 1 = highest priority
  deadline?: number; // Optional deadline time (ms or ticks)
  color?: string;
}

export interface ScheduleEvent {
  time: number;
  duration: number;
  processId: string | 'IDLE';
  frequency: number; // 0.5 | 0.75 | 1.0 (or 0 for IDLE)
  power: number; // Normalized power P(f) = k * f^3
  energy: number; // Dynamic energy E = P * duration
}

export interface ProcessMetric {
  processId: string;
  arrivalTime: number;
  burstTime: number;
  effectiveBurstTime: number;
  startTime: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
  deadline?: number;
  metDeadline?: boolean;
  averageFrequency: number;
  energyConsumed: number;
}

export interface SimulationMetrics {
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
  cpuUtilization: number; // Percentage 0 - 100%
  totalExecutionTime: number;
  totalEnergy: number; // Joules (normalized)
  energySavingsPercent: number; // Relative to baseline FCFS at f=1.0
  deadlineMissCount: number;
  deadlineMissRate: number; // Percentage 0 - 100%
  frequencyDistribution: {
    low: number; // seconds or ticks at f=0.5
    medium: number; // at f=0.75
    high: number; // at f=1.0
  };
}

export interface SimulationResult {
  algorithm: 'FCFS' | 'SJF' | 'RR' | 'EAAS';
  algorithmName: string;
  timeline: ScheduleEvent[];
  processMetrics: ProcessMetric[];
  metrics: SimulationMetrics;
}

export interface SimulationConfig {
  timeQuantum: number; // For Round Robin (default: 2)
  maxAcceptableSlowdown: number; // For EAAS (default: 0.20 i.e. 20%)
  powerConstant: number; // k in P(f) = k * f^3 (default: 1.0)
  idlePower: number; // Baseline standby power (default: 0.05)
}
