import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, Copy, Check, ArrowRight } from 'lucide-react';
import { StatisticsResult } from '../types';
import { playKeySound, triggerHapticVibration } from '../utils/audio';

export const StatisticsCalculator: React.FC<{
  onInsertToCalculator?: (val: string) => void;
}> = ({ onInsertToCalculator }) => {
  const [inputText, setInputText] = useState<string>(
    '14, 18, 19, 21, 21, 24, 25, 27, 29, 31, 35, 42'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Parse numbers from input
  const numbers = useMemo(() => {
    return inputText
      .split(/[\s,;\n]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
  }, [inputText]);

  // Compute all statistics
  const stats = useMemo<StatisticsResult | null>(() => {
    if (numbers.length === 0) return null;

    const n = numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    // Median
    let median = 0;
    if (n % 2 === 1) {
      median = sorted[Math.floor(n / 2)];
    } else {
      median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    }

    // Modes
    const freqMap: Record<number, number> = {};
    let maxFreq = 0;
    for (const val of sorted) {
      freqMap[val] = (freqMap[val] || 0) + 1;
      if (freqMap[val] > maxFreq) maxFreq = freqMap[val];
    }
    const modes = maxFreq > 1
      ? Object.keys(freqMap)
          .filter((k) => freqMap[+k] === maxFreq)
          .map((k) => +k)
      : [];

    // Variance & StdDev
    const variance =
      n > 1
        ? sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1)
        : 0;
    const stdDevSample = Math.sqrt(variance);
    const stdDevPop = Math.sqrt(
      sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n
    );

    // Quartiles
    const getQuartile = (arr: number[], q: number) => {
      const pos = (arr.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (arr[base + 1] !== undefined) {
        return arr[base] + rest * (arr[base + 1] - arr[base]);
      }
      return arr[base];
    };

    const q1 = getQuartile(sorted, 0.25);
    const q3 = getQuartile(sorted, 0.75);
    const iqr = q3 - q1;

    return {
      count: n,
      sum: +sum.toFixed(4),
      mean: +mean.toFixed(4),
      median: +median.toFixed(4),
      modes,
      stdDevPop: +stdDevPop.toFixed(4),
      stdDevSample: +stdDevSample.toFixed(4),
      variance: +variance.toFixed(4),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      range: +(sorted[sorted.length - 1] - sorted[0]).toFixed(4),
      q1: +q1.toFixed(4),
      q3: +q3.toFixed(4),
      iqr: +iqr.toFixed(4),
    };
  }, [numbers]);

  const copyMetric = (label: string, val: number) => {
    navigator.clipboard?.writeText(val.toString());
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 1200);
  };

  const loadPreset = (preset: 'grades' | 'sensor' | 'uniform') => {
    playKeySound('func');
    triggerHapticVibration(10);
    if (preset === 'grades') {
      setInputText('68, 72, 75, 80, 82, 85, 88, 91, 94, 98, 100');
    } else if (preset === 'sensor') {
      setInputText('23.4, 23.6, 23.5, 24.1, 23.8, 23.9, 23.5, 23.7, 24.0');
    } else {
      setInputText('10, 20, 30, 40, 50, 60, 70, 80, 90, 100');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-y-auto p-3.5 gap-3">
      {/* Header & Sample Presets */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-neutral-300">
          Dataset ({numbers.length} values)
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => loadPreset('grades')}
            className="px-2 py-0.5 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] text-[10px] font-mono text-neutral-300"
          >
            Grades
          </button>
          <button
            onClick={() => loadPreset('sensor')}
            className="px-2 py-0.5 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] text-[10px] font-mono text-neutral-300"
          >
            Sensors
          </button>
          <button
            onClick={() => loadPreset('uniform')}
            className="px-2 py-0.5 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] text-[10px] font-mono text-neutral-300"
          >
            Deciles
          </button>
        </div>
      </div>

      {/* Input Field */}
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={2}
        placeholder="Enter numbers separated by spaces, commas, or newlines..."
        className="w-full bg-[#141414] border border-[#242424] focus:border-orange-500 rounded-2xl p-2.5 font-mono text-xs text-white outline-none resize-none transition-colors"
      />

      {/* SVG Box-and-Whisker Plot */}
      {stats && stats.count >= 2 && stats.range > 0 && (
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span>Box & Whisker Plot</span>
            <span className="text-orange-400">
              Min: {stats.min} | Median: {stats.median} | Max: {stats.max}
            </span>
          </div>

          <div className="w-full h-14 relative flex items-center justify-center">
            {(() => {
              const range = stats.range;
              const min = stats.min;
              const toPercent = (v: number) =>
                ((v - min) / range) * 80 + 10; // keep 10% padding

              const leftP = toPercent(stats.min);
              const q1P = toPercent(stats.q1);
              const medP = toPercent(stats.median);
              const q3P = toPercent(stats.q3);
              const rightP = toPercent(stats.max);

              return (
                <svg className="w-full h-full" viewBox="0 0 300 60">
                  {/* Whiskers line */}
                  <line
                    x1={`${leftP * 3}`}
                    y1="30"
                    x2={`${rightP * 3}`}
                    y2="30"
                    stroke="#555"
                    strokeWidth="2"
                  />
                  {/* Left Whisker Cap */}
                  <line
                    x1={`${leftP * 3}`}
                    y1="20"
                    x2={`${leftP * 3}`}
                    y2="40"
                    stroke="#FF7A00"
                    strokeWidth="2"
                  />
                  {/* Right Whisker Cap */}
                  <line
                    x1={`${rightP * 3}`}
                    y1="20"
                    x2={`${rightP * 3}`}
                    y2="40"
                    stroke="#FF7A00"
                    strokeWidth="2"
                  />
                  {/* IQR Box */}
                  <rect
                    x={`${q1P * 3}`}
                    y="15"
                    width={`${Math.max(2, (q3P - q1P) * 3)}`}
                    height="30"
                    fill="#FF7A00"
                    fillOpacity="0.25"
                    stroke="#FF7A00"
                    strokeWidth="2"
                    rx="3"
                  />
                  {/* Median Line */}
                  <line
                    x1={`${medP * 3}`}
                    y1="15"
                    x2={`${medP * 3}`}
                    y2="45"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                </svg>
              );
            })()}
          </div>
        </div>
      )}

      {/* Statistical Summary Cards */}
      {stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: 'Mean (μ / x̄)', val: stats.mean, note: 'Average' },
            { label: 'Median', val: stats.median, note: 'Middle value' },
            {
              label: 'Sample Std Dev (s)',
              val: stats.stdDevSample,
              note: 'Dispersion',
            },
            {
              label: 'Population Std (σ)',
              val: stats.stdDevPop,
              note: 'Full population',
            },
            { label: 'Variance (s²)', val: stats.variance, note: 'Spread' },
            { label: 'Sum (Σx)', val: stats.sum, note: 'Total' },
            { label: 'Min', val: stats.min, note: 'Lowest' },
            { label: 'Max', val: stats.max, note: 'Highest' },
            { label: 'Range', val: stats.range, note: 'Max − Min' },
            { label: 'Quartile 1 (Q₁)', val: stats.q1, note: '25th percentile' },
            { label: 'Quartile 3 (Q₃)', val: stats.q3, note: '75th percentile' },
            { label: 'IQR', val: stats.iqr, note: 'Q₃ − Q₁' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[#141414] border border-[#222] hover:border-[#333] rounded-2xl p-2.5 flex flex-col justify-between transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-400 font-mono">
                  {item.label}
                </span>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => copyMetric(item.label, item.val)}
                    className="p-1 text-neutral-500 hover:text-white"
                    title="Copy"
                  >
                    {copiedKey === item.label ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  {onInsertToCalculator && (
                    <button
                      onClick={() => onInsertToCalculator(item.val.toString())}
                      className="p-1 text-orange-400 hover:text-orange-300"
                      title="Insert into calculator"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-1">
                <span className="font-mono text-base font-bold text-white tracking-wide">
                  {item.val}
                </span>
                <p className="text-[9px] text-neutral-500">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-neutral-600 font-mono">
          Enter numbers to compute statistics
        </div>
      )}
    </div>
  );
};
