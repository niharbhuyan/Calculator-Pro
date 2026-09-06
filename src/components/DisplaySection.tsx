import React, { useState } from 'react';
import { Copy, Check, Delete, RotateCcw } from 'lucide-react';
import { AngleMode } from '../types';

interface DisplaySectionProps {
  expression: string;
  result: string;
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  hasMemory: boolean;
  onClear: () => void;
  onBackspace: () => void;
  errorMessage?: string;
}

export const DisplaySection: React.FC<DisplaySectionProps> = ({
  expression,
  result,
  angleMode,
  onToggleAngleMode,
  hasMemory,
  onClear,
  onBackspace,
  errorMessage,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = result && result !== '0' ? result : expression || '0';
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Determine dynamic font size based on length of result
  const getResultFontSize = (text: string) => {
    const len = text.length;
    if (len <= 8) return 'text-5xl sm:text-6xl';
    if (len <= 12) return 'text-4xl sm:text-5xl';
    if (len <= 16) return 'text-3xl sm:text-4xl';
    return 'text-2xl sm:text-3xl';
  };

  return (
    <div className="w-full px-5 py-4 bg-gradient-to-b from-[#0A0A0A] to-[#121212] border-b border-[#1A1A1A] flex flex-col justify-end min-h-[160px] sm:min-h-[190px] relative select-none">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          {/* RAD/DEG Switch Button */}
          <button
            id="btn-angle-toggle"
            onClick={onToggleAngleMode}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#161616] border border-[#262626] text-[11px] font-mono hover:border-orange-500/50 transition-colors"
          >
            <span className={angleMode === 'RAD' ? 'font-bold text-orange-400' : 'text-neutral-500'}>
              RAD
            </span>
            <span className="text-neutral-600">|</span>
            <span className={angleMode === 'DEG' ? 'font-bold text-orange-400' : 'text-neutral-500'}>
              DEG
            </span>
          </button>

          {/* Memory Tag */}
          {hasMemory && (
            <span className="px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-mono font-bold">
              MEM
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Result */}
          <button
            id="btn-copy-result"
            onClick={handleCopy}
            title="Copy Result"
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Backspace */}
          <button
            id="btn-backspace"
            onClick={onBackspace}
            title="Delete last character"
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Math Expression Tape */}
      <div className="w-full text-right overflow-x-auto no-scrollbar scroll-smooth mb-2">
        <div className="text-neutral-400 text-lg sm:text-xl font-light font-mono tracking-tight whitespace-nowrap min-h-[28px]">
          {expression ? (
            <span>{expression}</span>
          ) : (
            <span className="text-neutral-600 italic">0</span>
          )}
        </div>
      </div>

      {/* Main Bold Result */}
      <div className="flex items-baseline justify-end gap-2.5 overflow-hidden">
        <span className="text-orange-500 text-2xl sm:text-3xl font-mono select-none font-bold pb-1">
          =
        </span>
        <div
          id="calculator-display-result"
          className={`${getResultFontSize(
            result || '0'
          )} font-black leading-none tracking-tighter text-white font-sans truncate text-right drop-shadow-sm`}
        >
          {result || '0'}
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="text-right text-[11px] font-mono text-rose-400 mt-1">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
