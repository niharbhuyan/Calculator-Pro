import React, { useState } from 'react';
import { Search, X, Check, ArrowUpRight } from 'lucide-react';
import { SCIENTIFIC_CONSTANTS } from '../data/constants';
import { ScientificConstant } from '../types';

interface ConstantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConstant: (constant: ScientificConstant) => void;
}

export const ConstantsModal: React.FC<ConstantsModalProps> = ({
  isOpen,
  onClose,
  onSelectConstant,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Universal', 'Physics', 'Chemistry', 'Astronomy'];

  const filtered = SCIENTIFIC_CONSTANTS.filter((c) => {
    const matchesCat = selectedCat === 'All' || c.category === selectedCat;
    const matchesQuery =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleCopy = (c: ScientificConstant) => {
    navigator.clipboard?.writeText(c.value.toString());
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="w-full max-w-md bg-[#121212] border border-[#252525] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#202020] bg-[#161616] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Scientific Constants
            </h2>
            <p className="text-xs text-neutral-400">
              Tap any constant to insert into your calculation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-[#252525] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="p-3 bg-[#161616]/70 border-b border-[#202020] flex flex-col gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search constants (e.g. speed of light, h, gravity)..."
              className="w-full bg-[#202020] border border-[#2E2E2E] focus:border-orange-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCat === cat
                    ? 'bg-orange-500 text-black font-bold'
                    : 'bg-[#202020] text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Constants List */}
        <div className="p-3 overflow-y-auto flex flex-col gap-2 flex-1">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-[#181818] hover:bg-[#202020] border border-[#242424] rounded-2xl p-3 flex items-center justify-between gap-3 transition-colors group cursor-pointer"
              onClick={() => {
                onSelectConstant(c);
                onClose();
              }}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-[#242424] border border-[#333] flex items-center justify-center font-mono font-bold text-orange-400 text-sm flex-shrink-0 group-hover:border-orange-500/50 transition-colors">
                  {c.symbol}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-white truncate">
                    {c.name}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-neutral-400">
                    <span className="text-neutral-200">
                      {c.value.toExponential(4)}
                    </span>
                    <span className="text-neutral-500 truncate">{c.unit}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(c);
                  }}
                  title="Copy value"
                  className="p-1.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-neutral-400 hover:text-white transition-colors text-xs"
                >
                  {copiedId === c.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    'Copy'
                  )}
                </button>
                <button
                  className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 font-bold hover:bg-orange-500/30 transition-colors"
                  title="Insert to equation"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-500">
              No constants matching your filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
