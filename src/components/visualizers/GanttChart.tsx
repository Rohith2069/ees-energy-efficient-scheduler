import React from 'react';
import { ScheduleEvent, Process } from '../../engine/types';

interface GanttChartProps {
  timeline: ScheduleEvent[];
  processes?: Process[];
  title?: string;
  totalTime?: number;
  highlightEventIndex?: number;
  showFrequency?: boolean;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  timeline,
  processes = [],
  title,
  totalTime,
  highlightEventIndex,
  showFrequency = true,
}) => {
  if (timeline.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
        No execution timeline available. Add processes or load a preset to run simulation.
      </div>
    );
  }

  const maxTime = totalTime ?? (timeline[timeline.length - 1].time + timeline[timeline.length - 1].duration);
  const safeMaxTime = Math.max(1, maxTime);

  // Helper to lookup process color
  const getProcessColor = (pid: string) => {
    if (pid === 'IDLE') return '#1e293b';
    const found = processes.find((p) => p.id === pid);
    return found?.color ?? '#0d9488';
  };

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>{title}</span>
          <span className="font-mono text-slate-400 text-[11px]">Total: {safeMaxTime} ms</span>
        </div>
      )}

      {/* Gantt Bar */}
      <div className="relative w-full h-12 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex shadow-inner">
        {timeline.map((event, idx) => {
          const widthPercent = (event.duration / safeMaxTime) * 100;
          const isIdle = event.processId === 'IDLE';
          const isHighlighted = highlightEventIndex !== undefined && highlightEventIndex === idx;
          const color = getProcessColor(event.processId);

          return (
            <div
              key={`${event.processId}-${event.time}-${idx}`}
              style={{
                width: `${widthPercent}%`,
                backgroundColor: isIdle ? '#1e293b' : color,
              }}
              className={`h-full relative flex flex-col items-center justify-center border-r border-slate-900/70 transition-all ${
                isHighlighted ? 'ring-2 ring-white z-10 brightness-110' : ''
              } ${isIdle ? 'bg-stripes-slate' : ''}`}
              title={`${event.processId} [${event.time} → ${Number((event.time + event.duration).toFixed(2))}]${
                !isIdle ? ` · ${event.frequency}x GHz` : ''
              }`}
            >
              <span
                className={`text-xs font-mono font-bold truncate px-1 ${
                  isIdle ? 'text-slate-400' : 'text-slate-950'
                }`}
              >
                {event.processId}
              </span>

              {showFrequency && !isIdle && (
                <span className="text-[10px] font-mono font-medium text-slate-900/90 leading-none">
                  {event.frequency}x
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Time Axis Ticks */}
      <div className="relative w-full h-5 text-[10px] font-mono text-slate-400 flex justify-between select-none px-0.5">
        <span>0</span>
        {timeline.map((event, idx) => {
          const endPoint = Number((event.time + event.duration).toFixed(1));
          const leftPercent = (endPoint / safeMaxTime) * 100;
          // Avoid clutter: only render every 1-2 ticks or key milestones
          if (idx === timeline.length - 1 || event.duration >= safeMaxTime * 0.08) {
            return (
              <span
                key={idx}
                style={{ left: `${leftPercent}%` }}
                className="absolute -translate-x-1/2 transform text-slate-400"
              >
                {endPoint}
              </span>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
