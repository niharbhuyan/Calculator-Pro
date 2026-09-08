import React, { useState, useEffect } from 'react';
import {
  Wifi,
  BatteryMedium,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CalculatorMode } from '../types';

interface AndroidStatusHeaderProps {
  currentMode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
  historyCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AndroidStatusHeader: React.FC<AndroidStatusHeaderProps> = ({
  currentMode,
  onSelectMode,
  isFrameMode,
  onToggleFrameMode,
  historyCount,
  soundEnabled,
  onToggleSound,
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

  const navItems: { id: CalculatorMode; label: string; badge?: string }[] = [
    { id: 'scientific', label: 'Scientific' },
    { id: 'graphing', label: 'Graphing', badge: '2D' },
    { id: 'matrix', label: 'Matrix' },
    { id: 'programmer', label: 'Base-N' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'financial', label: 'Financial' },
    { id: 'converter', label: 'Units' },
    {
      id: 'history',
      label: 'History',
      badge: historyCount > 0 ? `${historyCount}` : undefined,
    },
  ];

  return (
    <div className="w-full bg-[#0A0A0A] border-b border-[#1A1A1A] select-none flex-shrink-0">
      {/* Android Status Bar */}
      <div className="h-7 px-4 flex items-center justify-between text-[11px] font-medium text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="font-mono text-neutral-200 tracking-tight">
            {time || '09:41'}
          </span>
          <div
            className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"
            title="System Ready"
          />
        </div>

        {/* Center Punch-hole Camera Notch */}
        {isFrameMode && (
          <div className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-800 shadow-inner" />
        )}

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono tracking-wider text-neutral-400">
            5G
          </span>
          <Wifi className="w-3 h-3 text-neutral-300" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-neutral-300">98%</span>
            <BatteryMedium className="w-3.5 h-3.5 text-neutral-200" />
          </div>
        </div>
      </div>

      {/* App Bar / Navigation Tabs */}
      <div className="px-2.5 py-2 flex items-center justify-between gap-1.5 bg-[#0F0F0F]">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              onClick={() => onSelectMode(item.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center gap-1 whitespace-nowrap ${
                currentMode === item.id
                  ? 'bg-[#1F1F1F] text-orange-400 shadow-sm border border-[#2A2A2A]'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#161616]'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`px-1 rounded-full text-[9px] font-mono font-bold ${
                    item.id === 'history'
                      ? 'bg-orange-500 text-black'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Action Controls: Sound & Frame toggle */}
        <div className="flex items-center gap-1 flex-shrink-0 pl-1 border-l border-[#222]">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Mechanical Clicks' : 'Enable Mechanical Clicks'}
            className={`p-1.5 rounded-lg transition-colors ${
              soundEnabled
                ? 'text-orange-400 hover:bg-[#1F1F1F]'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-[#161616]'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            id="btn-toggle-frame"
            onClick={onToggleFrameMode}
            title={
              isFrameMode
                ? 'Switch to Expanded View'
                : 'Switch to Android Phone Frame'
            }
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-[#1A1A1A] transition-colors"
          >
            {isFrameMode ? (
              <Monitor className="w-3.5 h-3.5" />
            ) : (
              <Smartphone className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
