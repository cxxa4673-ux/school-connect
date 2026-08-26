import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerBubbleProps {
  duration?: string;
  isMine?: boolean;
}

export const AudioPlayerBubble: React.FC<AudioPlayerBubbleProps> = ({ duration = '0:35', isMine = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<any>(null);

  // Parse duration in seconds
  const totalSeconds = duration.includes(':')
    ? parseInt(duration.split(':')[0], 10) * 60 + parseInt(duration.split(':')[1], 10)
    : parseInt(duration, 10) || 30;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + (100 / totalSeconds) * 0.2;
        });
      }, 200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, totalSeconds]);

  const togglePlay = () => {
    if (progress >= 100) setProgress(0);
    setIsPlaying(!isPlaying);
  };

  // Pseudo waveform bars
  const waveHeights = [24, 40, 16, 60, 80, 45, 90, 70, 40, 60, 85, 95, 60, 40, 75, 50, 30, 65, 80, 45, 25];

  return (
    <div
      className={`p-3 rounded-2xl flex items-center gap-3 w-full max-w-xs ${
        isMine
          ? 'bg-emerald-700/60 border border-emerald-500/40 text-white'
          : 'bg-slate-800 border border-slate-700 text-slate-100'
      }`}
    >
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md transition transform active:scale-95 ${
          isMine
            ? 'bg-white text-emerald-800 hover:bg-emerald-50'
            : 'bg-emerald-500 text-white hover:bg-emerald-400'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Waveform & Scrubber */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-0.5 h-6">
          {waveHeights.map((h, idx) => {
            const barProgress = (idx / waveHeights.length) * 100;
            const isPlayed = barProgress <= progress;
            return (
              <div
                key={idx}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlayed
                    ? isMine
                      ? 'bg-white'
                      : 'bg-emerald-400'
                    : isMine
                    ? 'bg-emerald-300/40'
                    : 'bg-slate-600'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] opacity-80 font-mono">
          <span className="flex items-center gap-1">
            <Volume2 className="w-2.5 h-2.5" />
            <span>Voice Note</span>
          </span>
          <span>{isPlaying ? `${Math.floor((progress / 100) * totalSeconds)}s` : duration}</span>
        </div>
      </div>
    </div>
  );
};
