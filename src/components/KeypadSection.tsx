import React, { useState } from 'react';

interface KeypadSectionProps {
  onInput: (char: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onCalculate: () => void;
  onMemoryAction: (action: 'MC' | 'MR' | 'M+' | 'M-') => void;
  hasMemory: boolean;
}

export const KeypadSection: React.FC<KeypadSectionProps> = ({
  onInput,
  onClear,
  onDelete,
  onCalculate,
  onMemoryAction,
  hasMemory,
}) => {
  const [isSecond, setIsSecond] = useState(false);
  const [showFullSci, setShowFullSci] = useState(true);

  // Helper to trigger haptic if supported
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handlePress = (handler: () => void) => {
    triggerHaptic();
    handler();
  };

  return (
    <div className="w-full bg-[#0E0E0E] p-1 sm:p-2 flex flex-col gap-1 select-none flex-1 justify-between">
      {/* Memory & Quick Scientific Toggle Bar */}
      <div className="grid grid-cols-6 gap-1 px-0.5 pt-0.5">
        <button
          id="btn-mem-mc"
          disabled={!hasMemory}
          onClick={() => handlePress(() => onMemoryAction('MC'))}
          className={`h-7 rounded text-[11px] font-mono uppercase tracking-wider transition-colors ${
            hasMemory
              ? 'bg-[#181818] text-neutral-300 hover:bg-[#222222]'
              : 'bg-[#121212] text-neutral-600 cursor-not-allowed'
          }`}
        >
          MC
        </button>
        <button
          id="btn-mem-mr"
          disabled={!hasMemory}
          onClick={() => handlePress(() => onMemoryAction('MR'))}
          className={`h-7 rounded text-[11px] font-mono uppercase tracking-wider transition-colors ${
            hasMemory
              ? 'bg-[#181818] text-orange-400 font-bold hover:bg-[#222222]'
              : 'bg-[#121212] text-neutral-600 cursor-not-allowed'
          }`}
        >
          MR
        </button>
        <button
          id="btn-mem-mplus"
          onClick={() => handlePress(() => onMemoryAction('M+'))}
          className="h-7 rounded text-[11px] font-mono uppercase tracking-wider bg-[#181818] text-neutral-300 hover:bg-[#222222] transition-colors"
        >
          M+
        </button>
        <button
          id="btn-mem-mminus"
          onClick={() => handlePress(() => onMemoryAction('M-'))}
          className="h-7 rounded text-[11px] font-mono uppercase tracking-wider bg-[#181818] text-neutral-300 hover:bg-[#222222] transition-colors"
        >
          M-
        </button>
        <button
          id="btn-toggle-2nd"
          onClick={() => handlePress(() => setIsSecond(!isSecond))}
          className={`h-7 rounded text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
            isSecond
              ? 'bg-orange-500 text-black shadow-sm'
              : 'bg-[#181818] text-orange-400 hover:bg-[#222222]'
          }`}
        >
          2nd
        </button>
        <button
          id="btn-toggle-sci-view"
          onClick={() => handlePress(() => setShowFullSci(!showFullSci))}
          className="h-7 rounded text-[11px] font-mono uppercase tracking-wider bg-[#181818] text-neutral-400 hover:text-white transition-colors"
        >
          {showFullSci ? 'HYP' : 'SCI'}
        </button>
      </div>

      {/* Scientific Functions Grid */}
      {showFullSci && (
        <div className="grid grid-cols-5 gap-1 text-xs">
          {/* Row 1: Trig & Logs */}
          <button
            id="btn-fn-sin"
            onClick={() => handlePress(() => onInput(isSecond ? 'asin(' : 'sin('))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-300 font-mono tracking-wider transition-colors active:scale-95"
          >
            {isSecond ? 'sin⁻¹' : 'sin'}
          </button>
          <button
            id="btn-fn-cos"
            onClick={() => handlePress(() => onInput(isSecond ? 'acos(' : 'cos('))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-300 font-mono tracking-wider transition-colors active:scale-95"
          >
            {isSecond ? 'cos⁻¹' : 'cos'}
          </button>
          <button
            id="btn-fn-tan"
            onClick={() => handlePress(() => onInput(isSecond ? 'atan(' : 'tan('))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-300 font-mono tracking-wider transition-colors active:scale-95"
          >
            {isSecond ? 'tan⁻¹' : 'tan'}
          </button>
          <button
            id="btn-fn-ln"
            onClick={() => handlePress(() => onInput(isSecond ? 'exp(' : 'ln('))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-300 font-mono tracking-wider transition-colors active:scale-95"
          >
            {isSecond ? 'eˣ' : 'ln'}
          </button>
          <button
            id="btn-fn-log"
            onClick={() => handlePress(() => onInput(isSecond ? '10^' : 'log('))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-300 font-mono tracking-wider transition-colors active:scale-95"
          >
            {isSecond ? '10ˣ' : 'log'}
          </button>

          {/* Row 2: Powers, Roots, Hyperbolic */}
          <button
            id="btn-fn-pow2"
            onClick={() => handlePress(() => onInput(isSecond ? '^3' : '^2'))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-300 font-mono tracking-wider transition-colors active:scale-95"
          >
            {isSecond ? 'x³' : 'x²'}
          </button>
          <button
            id="btn-fn-pow"
            onClick={() => handlePress(() => onInput('^'))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-300 font-mono tracking-wider transition-colors active:scale-95"
          >
            xʸ
          </button>
          <button
            id="btn-fn-sqrt"
            onClick={() => handlePress(() => onInput(isSecond ? '∛(' : '√('))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-300 font-mono tracking-wider transition-colors active:scale-95"
          >
            {isSecond ? '∛' : '√'}
          </button>
          <button
            id="btn-fn-pi"
            onClick={() => handlePress(() => onInput('π'))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-300 font-mono tracking-wider transition-colors active:scale-95"
          >
            π
          </button>
          <button
            id="btn-fn-e"
            onClick={() => handlePress(() => onInput('e'))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-300 font-mono tracking-wider transition-colors active:scale-95"
          >
            e
          </button>

          {/* Row 3: Extended Math (Hyperbolic, factorial, abs, mod, etc.) */}
          <button
            id="btn-fn-sinh"
            onClick={() => handlePress(() => onInput(isSecond ? 'asinh(' : 'sinh('))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-400 font-mono text-[11px] tracking-wider transition-colors active:scale-95"
          >
            {isSecond ? 'asinh' : 'sinh'}
          </button>
          <button
            id="btn-fn-cosh"
            onClick={() => handlePress(() => onInput(isSecond ? 'acosh(' : 'cosh('))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-400 font-mono text-[11px] tracking-wider transition-colors active:scale-95"
          >
            {isSecond ? 'acosh' : 'cosh'}
          </button>
          <button
            id="btn-fn-tanh"
            onClick={() => handlePress(() => onInput(isSecond ? 'atanh(' : 'tanh('))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-400 font-mono text-[11px] tracking-wider transition-colors active:scale-95"
          >
            {isSecond ? 'atanh' : 'tanh'}
          </button>
          <button
            id="btn-fn-fact"
            onClick={() => handlePress(() => onInput('!'))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-400 font-mono text-[11px] tracking-wider transition-colors active:scale-95"
          >
            x!
          </button>
          <button
            id="btn-fn-abs"
            onClick={() => handlePress(() => onInput(isSecond ? 'rand()' : 'abs('))}
            className="h-9 rounded bg-[#131313] hover:bg-[#1C1C1C] text-neutral-400 font-mono text-[11px] tracking-wider transition-colors active:scale-95"
          >
            {isSecond ? 'Rand' : '|x|'}
          </button>
        </div>
      )}

      {/* Main Standard & Keypad Grid: 4 columns */}
      <div className="grid grid-cols-4 gap-1.5 pt-0.5">
        {/* Row 1: AC, (), %, ÷ */}
        <button
          id="btn-clear-ac"
          onClick={() => handlePress(onClear)}
          className="h-13 sm:h-14 rounded-xl bg-[#181818] hover:bg-[#242424] text-orange-500 font-bold text-xl sm:text-2xl transition-all active:scale-95 shadow-sm"
        >
          AC
        </button>
        <button
          id="btn-parentheses"
          onClick={() => handlePress(() => onInput('('))}
          className="h-13 sm:h-14 rounded-xl bg-[#161616] hover:bg-[#202020] text-neutral-300 font-bold text-xl sm:text-2xl transition-all active:scale-95"
        >
          (
        </button>
        <button
          id="btn-paren-close"
          onClick={() => handlePress(() => onInput(')'))}
          className="h-13 sm:h-14 rounded-xl bg-[#161616] hover:bg-[#202020] text-neutral-300 font-bold text-xl sm:text-2xl transition-all active:scale-95"
        >
          )
        </button>
        <button
          id="btn-op-div"
          onClick={() => handlePress(() => onInput('÷'))}
          className="h-13 sm:h-14 rounded-xl bg-[#181818] hover:bg-[#242424] text-orange-500 font-light text-2xl sm:text-3xl transition-all active:scale-95"
        >
          ÷
        </button>

        {/* Row 2: 7, 8, 9, × */}
        <button
          id="btn-num-7"
          onClick={() => handlePress(() => onInput('7'))}
          className="h-13 sm:h-14 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-black text-2xl sm:text-3xl transition-all active:scale-95"
        >
          7
        </button>
        <button
          id="btn-num-8"
          onClick={() => handlePress(() => onInput('8'))}
          className="h-13 sm:h-14 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-black text-2xl sm:text-3xl transition-all active:scale-95"
        >
          8
        </button>
        <button
          id="btn-num-9"
          onClick={() => handlePress(() => onInput('9'))}
          className="h-13 sm:h-14 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-black text-2xl sm:text-3xl transition-all active:scale-95"
        >
          9
        </button>
        <button
          id="btn-op-mul"
          onClick={() => handlePress(() => onInput('×'))}
          className="h-13 sm:h-14 rounded-xl bg-[#181818] hover:bg-[#242424] text-orange-500 font-light text-2xl sm:text-3xl transition-all active:scale-95"
        >
          ×
        </button>

        {/* Row 3: 4, 5, 6, − */}
        <button
          id="btn-num-4"
          onClick={() => handlePress(() => onInput('4'))}
          className="h-13 sm:h-14 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-black text-2xl sm:text-3xl transition-all active:scale-95"
        >
          4
        </button>
        <button
          id="btn-num-5"
          onClick={() => handlePress(() => onInput('5'))}
          className="h-13 sm:h-14 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-black text-2xl sm:text-3xl transition-all active:scale-95"
        >
          5
        </button>
        <button
          id="btn-num-6"
          onClick={() => handlePress(() => onInput('6'))}
          className="h-13 sm:h-14 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-black text-2xl sm:text-3xl transition-all active:scale-95"
        >
          6
        </button>
        <button
          id="btn-op-sub"
          onClick={() => handlePress(() => onInput('−'))}
          className="h-13 sm:h-14 rounded-xl bg-[#181818] hover:bg-[#242424] text-orange-500 font-light text-2xl sm:text-3xl transition-all active:scale-95"
        >
          −
        </button>

        {/* Row 4: 1, 2, 3, + */}
        <button
          id="btn-num-1"
          onClick={() => handlePress(() => onInput('1'))}
          className="h-13 sm:h-14 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-black text-2xl sm:text-3xl transition-all active:scale-95"
        >
          1
        </button>
        <button
          id="btn-num-2"
          onClick={() => handlePress(() => onInput('2'))}
          className="h-13 sm:h-14 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-black text-2xl sm:text-3xl transition-all active:scale-95"
        >
          2
        </button>
        <button
          id="btn-num-3"
          onClick={() => handlePress(() => onInput('3'))}
          className="h-13 sm:h-14 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-black text-2xl sm:text-3xl transition-all active:scale-95"
        >
          3
        </button>
        <button
          id="btn-op-add"
          onClick={() => handlePress(() => onInput('+'))}
          className="h-13 sm:h-14 rounded-xl bg-[#181818] hover:bg-[#242424] text-orange-500 font-light text-2xl sm:text-3xl transition-all active:scale-95"
        >
          +
        </button>

        {/* Row 5: DEL / 0, ., Ans, = */}
        <button
          id="btn-del"
          onClick={() => handlePress(onDelete)}
          className="h-13 sm:h-14 rounded-xl bg-[#161616] hover:bg-[#222222] text-orange-400 font-bold text-lg sm:text-xl transition-all active:scale-95"
        >
          DEL
        </button>
        <button
          id="btn-num-0"
          onClick={() => handlePress(() => onInput('0'))}
          className="h-13 sm:h-14 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-black text-2xl sm:text-3xl transition-all active:scale-95"
        >
          0
        </button>
        <button
          id="btn-num-dot"
          onClick={() => handlePress(() => onInput('.'))}
          className="h-13 sm:h-14 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-black text-2xl sm:text-3xl transition-all active:scale-95"
        >
          .
        </button>
        <button
          id="btn-op-equals"
          onClick={() => handlePress(onCalculate)}
          className="h-13 sm:h-14 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-2xl sm:text-3xl transition-all active:scale-95 shadow-md shadow-orange-500/20"
        >
          =
        </button>
      </div>
    </div>
  );
};
