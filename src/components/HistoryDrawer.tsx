import React, { useState } from 'react';
import { Trash2, Clock, Search, ArrowUpRight, Copy, Check } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  history: HistoryItem[];
  onSelectResult: (result: string) => void;
  onSelectExpression: (expression: string) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectResult,
  onSelectExpression,
  onClearHistory,
  onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = history.filter(
    (item) =>
      item.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#0A0A0A] select-none overflow-hidden">
      {/* Search & Actions Header */}
      <div className="px-4 py-3 bg-[#0F0F0F] border-b border-[#1A1A1A] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Calculation History
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#1F1F1F] text-neutral-400 font-mono text-xs">
              {history.length}
            </span>
          </div>

          {history.length > 0 && !showClearConfirm && (
            <button
              id="btn-clear-history-prompt"
              onClick={() => setShowClearConfirm(true)}
              className="text-xs font-semibold text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          {showClearConfirm && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400">Clear all?</span>
              <button
                id="btn-confirm-clear-history"
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-0.5 rounded bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
              >
                Yes
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 rounded bg-[#202020] text-neutral-300 text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Search Input */}
        {history.length > 2 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past equations or numbers..."
              className="w-full bg-[#161616] border border-[#262626] focus:border-orange-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
            />
          </div>
        )}
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {filteredHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
            <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#222222] flex items-center justify-center text-neutral-600 mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-neutral-400">
              {searchQuery ? 'No matching calculations' : 'No history yet'}
            </p>
            <p className="text-xs text-neutral-600 mt-1 max-w-[240px]">
              {searchQuery
                ? 'Try a different search term.'
                : 'Perform calculations and press = to see them saved here permanently.'}
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-[#121212] hover:bg-[#161616] border border-[#1F1F1F] hover:border-[#2C2C2C] rounded-xl p-3 transition-all group"
            >
              {/* Header: timestamp and quick delete */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mb-1">
                <span>{formatTime(item.timestamp)}</span>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => handleCopy(item.id, item.result)}
                    title="Copy Result"
                    className="p-1 hover:text-white rounded"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    title="Delete item"
                    className="p-1 hover:text-rose-400 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Expression */}
              <div
                onClick={() => onSelectExpression(item.expression)}
                className="font-mono text-neutral-300 text-sm cursor-pointer hover:text-orange-400 transition-colors truncate"
                title="Tap to reuse expression"
              >
                {item.expression}
              </div>

              {/* Bold Result */}
              <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-[#1C1C1C]">
                <div
                  onClick={() => onSelectResult(item.result)}
                  className="font-sans font-black text-2xl tracking-tighter text-white cursor-pointer hover:text-orange-400 transition-colors truncate"
                  title="Tap to reuse result"
                >
                  <span className="text-orange-500 font-mono text-lg mr-1.5">=</span>
                  {item.result}
                </div>

                {/* Quick Reuse Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onSelectExpression(item.expression)}
                    className="px-2 py-1 rounded bg-[#1C1C1C] hover:bg-[#282828] text-[10px] font-mono font-medium text-neutral-300 hover:text-orange-400 flex items-center gap-0.5"
                    title="Load equation into calculator"
                  >
                    <span>Expr</span>
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => onSelectResult(item.result)}
                    className="px-2 py-1 rounded bg-orange-500/10 hover:bg-orange-500/20 text-[10px] font-mono font-bold text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
                    title="Insert result into calculator"
                  >
                    <span>Ans</span>
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
