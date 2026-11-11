import { Process } from './types';

export interface PresetWorkload {
  id: string;
  name: string;
  description: string;
  category: 'Mobile' | 'IoT / Embedded' | 'Interactive' | 'Academic Benchmark';
  processes: Process[];
}

export const PRESET_WORKLOADS: PresetWorkload[] = [
  {
    id: 'academic_os_benchmark',
    name: 'CSE316 Academic Benchmark',
    description: 'Standard textbook workload with mixed arrivals and known optimal schedules for classroom verification.',
    category: 'Academic Benchmark',
    processes: [
      { id: 'P1', name: 'Matrix Computation', arrivalTime: 0, burstTime: 8, priority: 2, deadline: 18, color: '#38bdf8' },
      { id: 'P2', name: 'Disk I/O Flush', arrivalTime: 1, burstTime: 4, priority: 1, deadline: 10, color: '#34d399' },
      { id: 'P3', name: 'Network Packet Parse', arrivalTime: 2, burstTime: 9, priority: 3, deadline: 28, color: '#fbbf24' },
      { id: 'P4', name: 'GUI Window Redraw', arrivalTime: 3, burstTime: 5, priority: 2, deadline: 16, color: '#f472b6' },
      { id: 'P5', name: 'Background Garbage Collect', arrivalTime: 4, burstTime: 2, priority: 4, deadline: 32, color: '#a78bfa' },
    ],
  },
  {
    id: 'mobile_video_streaming',
    name: 'Mobile Video Streaming Workload',
    description: 'H.265 frame decoder and audio buffer processes on a smartphone with frame interval deadlines.',
    category: 'Mobile',
    processes: [
      { id: 'P1', name: 'Audio Buffer Sync', arrivalTime: 0, burstTime: 2, priority: 1, deadline: 6, color: '#2dd4bf' },
      { id: 'P2', name: 'H.265 Frame Decode', arrivalTime: 1, burstTime: 6, priority: 2, deadline: 14, color: '#60a5fa' },
      { id: 'P3', name: 'DRM License Check', arrivalTime: 3, burstTime: 3, priority: 3, deadline: 20, color: '#f59e0b' },
      { id: 'P4', name: 'Subtitle Renderer', arrivalTime: 4, burstTime: 2, priority: 2, deadline: 16, color: '#c084fc' },
      { id: 'P5', name: 'Analytics Telemetry', arrivalTime: 6, burstTime: 4, priority: 4, deadline: 30, color: '#94a3b8' },
    ],
  },
  {
    id: 'iot_sensor_monitoring',
    name: 'IoT Sensor Node (Cortex-M / Low Power)',
    description: 'Embedded microcontroller collecting periodic temperature, accelerometer, and wireless LoRa packets.',
    category: 'IoT / Embedded',
    processes: [
      { id: 'P1', name: 'SPI Accelerometer Read', arrivalTime: 0, burstTime: 3, priority: 1, deadline: 8, color: '#10b981' },
      { id: 'P2', name: 'I2C Temp/Humidity Poll', arrivalTime: 2, burstTime: 2, priority: 2, deadline: 12, color: '#06b6d4' },
      { id: 'P3', name: 'Kalman Filter Compute', arrivalTime: 4, burstTime: 5, priority: 2, deadline: 18, color: '#818cf8' },
      { id: 'P4', name: 'LoRaWAN Packet Encrypt', arrivalTime: 6, burstTime: 4, priority: 3, deadline: 24, color: '#f43f5e' },
      { id: 'P5', name: 'Flash Memory Log', arrivalTime: 8, burstTime: 3, priority: 4, deadline: 35, color: '#64748b' },
    ],
  },
  {
    id: 'background_cloud_sync',
    name: 'Background Cloud Data Sync',
    description: 'Heavy compute with large laxity; prime candidate for significant DVFS energy reduction at 0.5x and 0.75x frequency.',
    category: 'Mobile',
    processes: [
      { id: 'P1', name: 'Photo Thumbnail Gen', arrivalTime: 0, burstTime: 6, priority: 3, deadline: 25, color: '#38bdf8' },
      { id: 'P2', name: 'Local SQLite Index', arrivalTime: 2, burstTime: 8, priority: 3, deadline: 30, color: '#4ade80' },
      { id: 'P3', name: 'Cloud Delta Upload', arrivalTime: 4, burstTime: 7, priority: 4, deadline: 40, color: '#fb923c' },
      { id: 'P4', name: 'Push Token Renewal', arrivalTime: 5, burstTime: 2, priority: 1, deadline: 12, color: '#f43f5e' },
    ],
  },
  {
    id: 'interactive_gaming',
    name: 'Interactive Mobile Gaming Engine',
    description: 'Physics update and touch input requiring prompt response, testing frequency boosting under tight frame limits.',
    category: 'Interactive',
    processes: [
      { id: 'P1', name: 'Touch Input Handler', arrivalTime: 0, burstTime: 2, priority: 1, deadline: 4, color: '#ec4899' },
      { id: 'P2', name: 'Physics Collision Step', arrivalTime: 0, burstTime: 5, priority: 2, deadline: 10, color: '#8b5cf6' },
      { id: 'P3', name: 'Spatial Audio Mix', arrivalTime: 1, burstTime: 3, priority: 2, deadline: 9, color: '#06b6d4' },
      { id: 'P4', name: 'AI Bot Pathfinding', arrivalTime: 2, burstTime: 6, priority: 3, deadline: 18, color: '#eab308' },
      { id: 'P5', name: 'Frame Buffer Swap', arrivalTime: 4, burstTime: 2, priority: 1, deadline: 8, color: '#10b981' },
    ],
  },
];
