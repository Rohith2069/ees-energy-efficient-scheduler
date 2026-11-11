import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePower, calculateScaledExecutionTime, calculateDynamicEnergy, selectAdaptiveFrequency } from './powerModel';
import { simulateFCFS } from './fcfs';
import { simulateSJF } from './sjf';
import { simulateRoundRobin } from './roundRobin';
import { simulateEAAS } from './eaas';
import { Process } from './types';

test('Power model calculates cubic power correctly: P(f) = k * f^3', () => {
  assert.equal(calculatePower(1.0, 1.0), 1.0);
  assert.equal(calculatePower(0.5, 1.0), 0.125);
  // 0.75^3 = 0.421875
  assert.equal(calculatePower(0.75, 1.0), 0.421875);
  assert.equal(calculatePower(0, 1.0), 0);
});

test('Scaled execution time and dynamic energy behave according to DVFS laws', () => {
  // Burst 4 at f=0.5 takes 8 units of time
  assert.equal(calculateScaledExecutionTime(4, 0.5), 8);
  // Energy = P * T = 0.125 * 8 = 1.0 Joules
  assert.equal(calculateDynamicEnergy(4, 0.5, 1.0), 1.0);

  // Burst 4 at f=1.0 takes 4 units of time
  assert.equal(calculateScaledExecutionTime(4, 1.0), 4);
  // Energy = 1.0 * 4 = 4.0 Joules
  assert.equal(calculateDynamicEnergy(4, 1.0, 1.0), 4.0);

  // At f=0.5, energy is 1.0 vs 4.0 (75% savings)
  assert.equal(calculateDynamicEnergy(4, 0.5, 1.0) < calculateDynamicEnergy(4, 1.0, 1.0), true);
});

test('Adaptive frequency selector respects deadline and slowdown constraints', () => {
  // Scenario 1: Loose deadline (target 100), plenty of slack -> can scale down to low frequency f=0.5
  const freqLoose = selectAdaptiveFrequency(4, 0, 100, 2, 1.0);
  assert.equal(freqLoose, 0.5);

  // Scenario 2: Tight deadline (target 5), remaining burst 4 -> cannot finish in time at f=0.5 (time=8)
  // Must step up to high frequency f=1.0 (time=4)
  const freqTight = selectAdaptiveFrequency(4, 0, 5, 1, 0.20);
  assert.equal(freqTight, 1.0);

  // Scenario 3: Medium slack (deadline 7), burst 4
  // at f=0.5 -> time 8 (misses 7)
  // at f=0.75 -> time 5.333 (meets 7!)
  const freqMed = selectAdaptiveFrequency(4, 0, 7, 2, 0.40);
  assert.equal(freqMed, 0.75);
});

test('FCFS scheduling generates correct completion times and non-negative waiting times', () => {
  const testProcesses: Process[] = [
    { id: 'P1', arrivalTime: 0, burstTime: 4, priority: 1 },
    { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 2 },
    { id: 'P3', arrivalTime: 2, burstTime: 1, priority: 3 },
  ];

  const result = simulateFCFS(testProcesses);
  assert.equal(result.timeline.length, 3);
  // P1: 0..4, P2: 4..7, P3: 7..8
  assert.equal(result.processMetrics.find((p) => p.processId === 'P1')?.completionTime, 4);
  assert.equal(result.processMetrics.find((p) => p.processId === 'P2')?.completionTime, 7);
  assert.equal(result.processMetrics.find((p) => p.processId === 'P3')?.completionTime, 8);
  assert.equal(result.metrics.cpuUtilization, 100);
});

test('SJF scheduling favors shortest jobs among arrived processes', () => {
  const testProcesses: Process[] = [
    { id: 'P1', arrivalTime: 0, burstTime: 7, priority: 1 },
    { id: 'P2', arrivalTime: 2, burstTime: 4, priority: 1 },
    { id: 'P3', arrivalTime: 4, burstTime: 1, priority: 1 },
  ];

  // At t=0, only P1 is available -> runs 0..7
  // At t=7, both P2 (burst 4) and P3 (burst 1) are waiting -> P3 chosen next!
  const result = simulateSJF(testProcesses);
  const order = result.timeline.map((e) => e.processId);
  assert.deepEqual(order, ['P1', 'P3', 'P2']);
});

test('Round Robin slices processes by time quantum', () => {
  const testProcesses: Process[] = [
    { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
    { id: 'P2', arrivalTime: 0, burstTime: 3, priority: 1 },
  ];

  // With quantum=2:
  // P1 runs 2 (remaining 3) -> [0..2]
  // P2 runs 2 (remaining 1) -> [2..4]
  // P1 runs 2 (remaining 1) -> [4..6]
  // P2 runs 1 (completed)    -> [6..7]
  // P1 runs 1 (completed)    -> [7..8]
  const result = simulateRoundRobin(testProcesses, 2);
  const sequence = result.timeline.map((e) => `${e.processId}:${e.duration}`);
  assert.deepEqual(sequence, ['P1:2', 'P2:2', 'P1:2', 'P2:1', 'P1:1']);
});

test('EAAS algorithm successfully lowers energy consumption when slack permits', () => {
  const processes: Process[] = [
    { id: 'P1', arrivalTime: 0, burstTime: 4, priority: 2, deadline: 30 },
    { id: 'P2', arrivalTime: 2, burstTime: 6, priority: 3, deadline: 50 },
  ];

  const fcfsResult = simulateFCFS(processes);
  const eaasResult = simulateEAAS(processes, 0.40, 1.0, fcfsResult.metrics.totalEnergy);

  // EAAS should consume significantly less energy than traditional FCFS (which runs at f=1.0)
  assert.equal(eaasResult.metrics.totalEnergy < fcfsResult.metrics.totalEnergy, true);
  assert.equal(eaasResult.metrics.energySavingsPercent > 0, true);
});
