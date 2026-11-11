import { FrequencyLevel } from './types';

/**
 * Normalized CPU Power Model based on CMOS dynamic switching power:
 * P(f) = k * f^3
 *
 * Where:
 * - f is the normalized CPU frequency (0.5, 0.75, 1.0)
 * - k is the normalized power coefficient (default: 1.0)
 */
export function calculatePower(frequency: number, k: number = 1.0): number {
  if (frequency <= 0) return 0;
  return k * Math.pow(frequency, 3);
}

/**
 * Execution time scaled by CPU operational frequency:
 * T = Burst / f
 */
export function calculateScaledExecutionTime(burst: number, frequency: number): number {
  if (frequency <= 0) return burst;
  return Number((burst / frequency).toFixed(3));
}

/**
 * Estimated Dynamic Energy Consumption:
 * E = P(f) * T = (k * f^3) * (Burst / f) = k * f^2 * Burst
 */
export function calculateDynamicEnergy(burst: number, frequency: number, k: number = 1.0): number {
  if (frequency <= 0) return 0;
  const power = calculatePower(frequency, k);
  const time = calculateScaledExecutionTime(burst, frequency);
  return Number((power * time).toFixed(4));
}

/**
 * Calculates theoretical energy saving percentage of frequency f compared to f=1.0:
 * Baseline: E(1.0) = k * 1^2 * Burst = k * Burst
 * Target:   E(f)   = k * f^2 * Burst
 * Savings % = (1 - f^2) * 100%
 */
export function calculateTheoreticalEnergySavings(frequency: number): number {
  if (frequency <= 0 || frequency >= 1.0) return 0;
  return Number(((1 - Math.pow(frequency, 2)) * 100).toFixed(1));
}

/**
 * Frequency Selection Logic for EAAS (Energy-Aware Adaptive Scheduling)
 *
 * Evaluates candidate frequencies [0.5, 0.75, 1.0] from lowest to highest.
 * Selects the lowest feasible frequency that respects:
 * 1. Process deadline constraints (Slack S >= 0)
 * 2. Maximum acceptable slowdown tolerance (T_scaled <= T_base * (1 + maxSlowdown))
 * 3. Priority weighting (urgent priority 1 processes prefer responsive frequencies if slack is narrow)
 */
export function selectAdaptiveFrequency(
  remainingBurst: number,
  currentTime: number,
  deadline: number | undefined,
  priority: number,
  maxSlowdown: number = 0.20
): FrequencyLevel {
  const candidates: FrequencyLevel[] = [0.5, 0.75, 1.0];

  for (const f of candidates) {
    const scaledTime = remainingBurst / f;
    const finishTime = currentTime + scaledTime;
    const slowdown = (1 / f) - 1; // e.g. f=0.75 -> 33.3%, f=0.5 -> 100%

    // 1. Deadline-based evaluation (if deadline is defined)
    if (deadline !== undefined && deadline > 0) {
      const slack = deadline - finishTime;
      if (slack >= 0) {
        // Can meet deadline! Check if slowdown is within tolerance,
        // or if high priority requires safety margin
        if (priority === 1 && slack < remainingBurst * 0.5 && f < 0.75) {
          // High-priority job with narrow slack: step up for safety margin
          continue;
        }
        if (slowdown <= maxSlowdown || slack >= remainingBurst * 1.5) {
          return f;
        }
      } else {
        // Frequency f misses deadline: must step up frequency
        continue;
      }
    } else {
      // 2. Non-deadline evaluation: purely bounded by max acceptable slowdown
      if (slowdown <= maxSlowdown) {
        return f;
      }
    }
  }

  // Default to maximum frequency (1.0) to preserve safety and timeliness
  return 1.0;
}
