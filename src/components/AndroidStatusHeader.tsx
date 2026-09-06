import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { CalculatorMode } from '../types';

interface AndroidStatusHeaderProps {
  currentMode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
  historyCount: number;
}

export const AndroidStatusHeader: React.FC<AndroidStatusHeaderProps> = ({
  currentMode,
  onSelectMode,
  isFrameMode,
  onToggleFrameMode,
  historyCount,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#0A0A0A] border-b border-[#1A1A1A] select-none flex-shrink-0">
      {/* Android Status Bar */}
      <div className="h-7 px-4 flex items-center justify-between text-[11px] font-medium text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="font-mono text-neutral-200 tracking-tight">{time || '09:41'}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" title="System Ready" />
        </div>

        {/* Center Punch-hole Camera Notch */}
        {isFrameMode && (
          <div className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-800 shadow-inner" />
        )}

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono tracking-wider text-neutral-400">5G</span>
          <Wifi className="w-3 h-3 text-neutral-300" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-neutral-300">98%</span>
            <BatteryMedium className="w-3.5 h-3.5 text-neutral-200" />
          </div>
        </div>
      </div>

      {/* App Bar / Navigation Tabs */}
      <div className="px-3 py-2 flex items-center justify-between gap-2 bg-[#0F0F0F]">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            id="tab-calculator"
            onClick={() => onSelectMode('scientific')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentMode === 'scientific'
                ? 'bg-[#1F1F1F] text-orange-400 shadow-sm border border-[#2A2A2A]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#161616]'
            }`}
          >
            <span>Calculator</span>
          </button>

          <button
            id="tab-graphing"
            onClick={() => onSelectMode('graphing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentMode === 'graphing'
                ? 'bg-[#1F1F1F] text-orange-400 shadow-sm border border-[#2A2A2A]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#161616]'
            }`}
          >
            <span>Graphing</span>
            <span className="px-1 py-0.2 rounded text-[9px] bg-orange-500/20 text-orange-400 font-mono">2D</span>
          </button>

          <button
            id="tab-converter"
            onClick={() => onSelectMode('converter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentMode === 'converter'
                ? 'bg-[#1F1F1F] text-orange-400 shadow-sm border border-[#2A2A2A]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#161616]'
            }`}
          >
            <span>Unit Converter</span>
          </button>

          <button
            id="tab-history"
            onClick={() => onSelectMode('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentMode === 'history'
                ? 'bg-[#1F1F1F] text-orange-400 shadow-sm border border-[#2A2A2A]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#161616]'
            }`}
          >
            <span>History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-orange-500 text-black font-mono text-[10px] font-black flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>
        </div>

        {/* View toggle (Phone frame vs full width) */}
        <button
          id="btn-toggle-frame"
          onClick={onToggleFrameMode}
          title={isFrameMode ? "Switch to Expanded View" : "Switch to Android Device Frame"}
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-[#1A1A1A] transition-colors flex-shrink-0"
        >
          {isFrameMode ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
