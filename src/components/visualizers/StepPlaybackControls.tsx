import React, { useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, FastForward } from 'lucide-react';

interface StepPlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepNext: () => void;
  onReset: () => void;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentTime: number;
}

export const StepPlaybackControls: React.FC<StepPlaybackControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onStepNext,
  onReset,
  currentStep,
  totalSteps,
  speed,
  onSpeedChange,
  currentTime,
}) => {
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep >= totalSteps - 1) {
      onTogglePlay(); // stop at end
      return;
    }

    const timer = setTimeout(() => {
      onStepNext();
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, speed, onStepNext, onTogglePlay]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-4">
      {/* Play / Step Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-teal-600 hover:bg-teal-500 text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Simulation</span>
            </>
          )}
        </button>

        <button
          onClick={onStepNext}
          disabled={isPlaying || currentStep >= totalSteps - 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors border border-slate-700/60"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span>Step Next</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors border border-slate-700/60"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* Progress & Time Counter */}
      <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
        <div>
          <span className="text-slate-400">Step:</span>{' '}
          <span className="text-white font-bold">{Math.min(currentStep + 1, totalSteps)}</span>
          <span className="text-slate-400">/{totalSteps}</span>
        </div>
        <div className="border-l border-slate-800 pl-4">
          <span className="text-slate-400">Simulation Time:</span>{' '}
          <span className="text-teal-400 font-bold">{currentTime} ms</span>
        </div>
      </div>

      {/* Speed Slider */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <FastForward className="w-3.5 h-3.5 text-slate-400" />
        <label htmlFor="playback-speed-slider">Speed:</label>
        <input
          id="playback-speed-slider"
          type="range"
          min="200"
          max="1500"
          step="100"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-24 accent-teal-500 cursor-pointer"
        />
        <span className="font-mono text-slate-300 text-[11px] w-12">{speed}ms</span>
      </div>
    </div>
  );
};
