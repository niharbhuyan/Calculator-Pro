import React, { useState, useMemo } from 'react';
import {
  ArrowDownUp,
  Ruler,
  Thermometer,
  Scale,
  Gauge,
  Square,
  Beaker,
  HardDrive,
  Copy,
  Check,
  Calculator,
} from 'lucide-react';
import { UnitCategory } from '../types';
import { UNIT_CATEGORIES, convertValue } from '../utils/units';

interface UnitConverterProps {
  onInsertToCalculator: (value: string) => void;
}

export const UnitConverter: React.FC<UnitConverterProps> = ({
  onInsertToCalculator,
}) => {
  const [activeCategory, setActiveCategory] = useState<UnitCategory>('length');

  const currentCategoryData = useMemo(() => {
    return UNIT_CATEGORIES.find((c) => c.id === activeCategory)!;
  }, [activeCategory]);

  const [fromUnitId, setFromUnitId] = useState<string>(
    currentCategoryData.defaultFrom
  );
  const [toUnitId, setToUnitId] = useState<string>(
    currentCategoryData.defaultTo
  );
  const [inputValue, setInputValue] = useState<string>('1');
  const [copied, setCopied] = useState(false);

  // Switch category
  const handleSelectCategory = (cat: UnitCategory) => {
    setActiveCategory(cat);
    const catData = UNIT_CATEGORIES.find((c) => c.id === cat)!;
    setFromUnitId(catData.defaultFrom);
    setToUnitId(catData.defaultTo);
  };

  // Swap units
  const handleSwapUnits = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  // Numeric input handling
  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setInputValue('0');
    } else if (val === 'DEL') {
      setInputValue((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
    } else if (val === '.') {
      if (!inputValue.includes('.')) {
        setInputValue((prev) => prev + '.');
      }
    } else if (val === '±') {
      if (inputValue.startsWith('-')) {
        setInputValue(inputValue.slice(1));
      } else if (inputValue !== '0') {
        setInputValue('-' + inputValue);
      }
    } else {
      setInputValue((prev) => (prev === '0' ? val : prev + val));
    }
  };

  // Compute conversion result
  const numericInput = parseFloat(inputValue) || 0;
  const convertedResult = useMemo(() => {
    const res = convertValue(numericInput, fromUnitId, toUnitId, activeCategory);
    if (isNaN(res)) return '0';
    // Format nicely
    if (Math.abs(res) >= 1e9 || (Math.abs(res) < 1e-4 && res !== 0)) {
      return res.toExponential(4);
    }
    return Number(res.toPrecision(8)).toString();
  }, [numericInput, fromUnitId, toUnitId, activeCategory]);

  // Compute base rate (1 from = ? to)
  const unitRate = useMemo(() => {
    const rate = convertValue(1, fromUnitId, toUnitId, activeCategory);
    return Number(rate.toPrecision(6)).toString();
  }, [fromUnitId, toUnitId, activeCategory]);

  const fromUnitObj = currentCategoryData.units.find((u) => u.id === fromUnitId);
  const toUnitObj = currentCategoryData.units.find((u) => u.id === toUnitId);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Ruler':
        return <Ruler className="w-3.5 h-3.5" />;
      case 'Thermometer':
        return <Thermometer className="w-3.5 h-3.5" />;
      case 'Scale':
        return <Scale className="w-3.5 h-3.5" />;
      case 'Gauge':
        return <Gauge className="w-3.5 h-3.5" />;
      case 'Square':
        return <Square className="w-3.5 h-3.5" />;
      case 'Beaker':
        return <Beaker className="w-3.5 h-3.5" />;
      case 'HardDrive':
        return <HardDrive className="w-3.5 h-3.5" />;
      default:
        return <Ruler className="w-3.5 h-3.5" />;
    }
  };

  const handleCopyResult = () => {
    navigator.clipboard?.writeText(convertedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#0A0A0A] select-none overflow-hidden">
      {/* Category Pills Header */}
      <div className="px-3 py-2.5 bg-[#0F0F0F] border-b border-[#1A1A1A] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {UNIT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            id={`btn-unit-cat-${cat.id}`}
            onClick={() => handleSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-orange-500 text-black font-bold shadow-sm'
                : 'bg-[#181818] text-neutral-400 hover:text-white hover:bg-[#222222]'
            }`}
          >
            {getCategoryIcon(cat.iconName)}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Conversion Dual Input Cards */}
      <div className="p-3 bg-[#121212] border-b border-[#1A1A1A] flex flex-col gap-2.5">
        {/* FROM Unit Box */}
        <div className="bg-[#181818] border border-[#242424] rounded-2xl p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
              From
            </span>
            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="bg-[#242424] text-white border border-[#333] rounded-lg px-2 py-1 text-xs outline-none focus:border-orange-500 cursor-pointer"
            >
              {currentCategoryData.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <input
              type="text"
              readOnly
              value={inputValue}
              className="w-full bg-transparent text-white font-mono font-bold text-2xl sm:text-3xl outline-none"
            />
            <span className="text-orange-400 font-mono font-bold text-sm ml-2">
              {fromUnitObj?.symbol}
            </span>
          </div>
        </div>

        {/* Swap Button Bar */}
        <div className="flex items-center justify-center -my-1 relative z-10">
          <button
            id="btn-swap-units"
            onClick={handleSwapUnits}
            title="Swap Units"
            className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#2C2C2C] border border-[#333] flex items-center justify-center text-orange-400 hover:text-orange-300 transition-transform active:rotate-180 shadow-md"
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* TO Unit Box */}
        <div className="bg-[#181818] border border-[#242424] rounded-2xl p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
              To
            </span>
            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="bg-[#242424] text-white border border-[#333] rounded-lg px-2 py-1 text-xs outline-none focus:border-orange-500 cursor-pointer"
            >
              {currentCategoryData.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-white font-sans font-black text-2xl sm:text-3xl tracking-tight truncate">
              {convertedResult}
            </div>
            <span className="text-cyan-400 font-mono font-bold text-sm ml-2">
              {toUnitObj?.symbol}
            </span>
          </div>
        </div>

        {/* Formula breakdown & quick actions */}
        <div className="flex items-center justify-between px-1 text-[11px] font-mono text-neutral-400">
          <div>
            1 {fromUnitObj?.symbol} = {unitRate} {toUnitObj?.symbol}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyResult}
              className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => onInsertToCalculator(convertedResult)}
              className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold transition-colors ml-2"
              title="Insert result into calculator"
            >
              <Calculator className="w-3 h-3" />
              <span>Use in Calc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Converter Keypad */}
      <div className="flex-1 bg-[#0E0E0E] p-2 grid grid-cols-4 gap-1.5 content-center">
        {['7', '8', '9', 'C', '4', '5', '6', 'DEL', '1', '2', '3', '±', '0', '.', '00'].map(
          (key) => (
            <button
              key={key}
              onClick={() => handleKeypadPress(key)}
              className={`h-11 sm:h-12 rounded-xl text-lg font-bold transition-all active:scale-95 flex items-center justify-center ${
                key === 'C' || key === 'DEL'
                  ? 'bg-[#1A1A1A] hover:bg-[#252525] text-orange-500'
                  : key === '±' || key === '00'
                  ? 'bg-[#161616] hover:bg-[#202020] text-neutral-300 font-mono'
                  : 'bg-[#202020] hover:bg-[#2A2A2A] text-white'
              }`}
            >
              {key}
            </button>
          )
        )}
        <button
          onClick={() => onInsertToCalculator(convertedResult)}
          className="h-11 sm:h-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-sm flex items-center justify-center tracking-wider transition-all active:scale-95"
        >
          DONE
        </button>
      </div>
    </div>
  );
};
