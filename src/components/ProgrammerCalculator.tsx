import React, { useState } from 'react';
import { Delete, RotateCcw, Copy, Check } from 'lucide-react';
import { WordSize, NumberBase } from '../types';
import { playKeySound, triggerHapticVibration } from '../utils/audio';

export const ProgrammerCalculator: React.FC = () => {
  const [base, setBase] = useState<NumberBase>('DEC');
  const [wordSize, setWordSize] = useState<WordSize>(64);
  const [currentVal, setCurrentVal] = useState<bigint>(0n);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [prevVal, setPrevVal] = useState<bigint | null>(null);
  const [copiedBase, setCopiedBase] = useState<string | null>(null);

  // Mask to enforce bit-width bounds
  const getMask = (bits: WordSize): bigint => {
    switch (bits) {
      case 8:
        return 0xffn;
      case 16:
        return 0xffffn;
      case 32:
        return 0xffffffffn;
      case 64:
      default:
        return 0xffffffffffffffffn;
    }
  };

  const maskValue = (val: bigint, bits: WordSize = wordSize): bigint => {
    const mask = getMask(bits);
    return val & mask;
  };

  // Conversions for displays
  const hexStr = (currentVal & getMask(wordSize)).toString(16).toUpperCase();
  const decStr = (currentVal & getMask(wordSize)).toString(10);
  const octStr = (currentVal & getMask(wordSize)).toString(8);
  const binRaw = (currentVal & getMask(wordSize)).toString(2);

  // Format binary into 4-bit nibbles padded to word size
  const binPadded = binRaw.padStart(wordSize, '0');
  const binChunks: string[] = [];
  for (let i = 0; i < binPadded.length; i += 4) {
    binChunks.push(binPadded.slice(i, i + 4));
  }

  const handleDigit = (digit: string) => {
    playKeySound('num');
    triggerHapticVibration(8);

    const charCode = digit.charCodeAt(0);
    let digitVal: bigint;
    if (charCode >= 48 && charCode <= 57) {
      digitVal = BigInt(charCode - 48);
    } else {
      digitVal = BigInt(charCode - 65 + 10);
    }

    const radix =
      base === 'HEX' ? 16n : base === 'DEC' ? 10n : base === 'OCT' ? 8n : 2n;

    const nextVal = maskValue(currentVal * radix + digitVal);
    setCurrentVal(nextVal);
  };

  const handleBackspace = () => {
    playKeySound('delete');
    triggerHapticVibration(10);
    const radix =
      base === 'HEX' ? 16n : base === 'DEC' ? 10n : base === 'OCT' ? 8n : 2n;
    setCurrentVal(currentVal / radix);
  };

  const handleClear = () => {
    playKeySound('func');
    triggerHapticVibration(12);
    setCurrentVal(0n);
    setPendingOp(null);
    setPrevVal(null);
  };

  const handleOperation = (op: string) => {
    playKeySound('op');
    triggerHapticVibration(10);

    if (op === 'NOT') {
      const inverted = maskValue(currentVal ^ getMask(wordSize));
      setCurrentVal(inverted);
      return;
    }

    if (op === '2sComp') {
      const twosComp = maskValue((currentVal ^ getMask(wordSize)) + 1n);
      setCurrentVal(twosComp);
      return;
    }

    if (op === 'Lsh') {
      setCurrentVal(maskValue(currentVal << 1n));
      return;
    }

    if (op === 'Rsh') {
      setCurrentVal(maskValue(currentVal >> 1n));
      return;
    }

    setPrevVal(currentVal);
    setPendingOp(op);
    setCurrentVal(0n);
  };

  const handleEquals = () => {
    playKeySound('equals');
    triggerHapticVibration(15);

    if (pendingOp && prevVal !== null) {
      const p: bigint = BigInt(prevVal);
      const c: bigint = BigInt(currentVal);
      const mask = getMask(wordSize);
      let res: bigint = 0n;

      if (pendingOp === 'AND') {
        res = p & c;
      } else if (pendingOp === 'OR') {
        res = p | c;
      } else if (pendingOp === 'XOR') {
        res = p ^ c;
      } else if (pendingOp === 'NAND') {
        res = (p & c) ^ mask;
      } else if (pendingOp === 'NOR') {
        res = (p | c) ^ mask;
      } else if (pendingOp === 'MOD') {
        res = c !== 0n ? p % c : 0n;
      } else if (pendingOp === '+') {
        res = p + c;
      } else if (pendingOp === '-') {
        res = p - c;
      } else if (pendingOp === '*') {
        res = p * c;
      } else if (pendingOp === '/') {
        res = c !== 0n ? p / c : 0n;
      }

      setCurrentVal(maskValue(res));
      setPendingOp(null);
      setPrevVal(null);
    }
  };

  // Toggle individual bit on the 64-bit matrix
  const handleToggleBit = (bitIndex: number) => {
    playKeySound('num');
    triggerHapticVibration(8);
    const bitMask = 1n << BigInt(bitIndex);
    const toggled = currentVal ^ bitMask;
    setCurrentVal(maskValue(toggled));
  };

  const copyValue = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedBase(label);
    setTimeout(() => setCopiedBase(null), 1200);
  };

  const isDigitValid = (digit: string): boolean => {
    const val = parseInt(digit, 16);
    if (base === 'BIN') return val < 2;
    if (base === 'OCT') return val < 8;
    if (base === 'DEC') return val < 10;
    return val < 16;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden">
      {/* Top Programmer Output Display */}
      <div className="p-3.5 bg-[#121212] border-b border-[#202020] flex flex-col gap-2">
        {/* Word Size & Word Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-xl border border-[#262626]">
            {([64, 32, 16, 8] as WordSize[]).map((size) => (
              <button
                key={size}
                onClick={() => {
                  setWordSize(size);
                  setCurrentVal((prev) => maskValue(prev, size));
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  wordSize === size
                    ? 'bg-orange-500 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {size === 64
                  ? 'QWORD'
                  : size === 32
                  ? 'DWORD'
                  : size === 16
                  ? 'WORD'
                  : 'BYTE'}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-neutral-400">
            {pendingOp ? `${prevVal?.toString(10)} ${pendingOp}` : 'Base-N Mode'}
          </span>
        </div>

        {/* Bases Rows (HEX, DEC, OCT, BIN) */}
        <div className="flex flex-col gap-1.5 font-mono text-xs mt-1">
          {[
            { id: 'HEX' as NumberBase, label: 'HEX', val: hexStr || '0' },
            { id: 'DEC' as NumberBase, label: 'DEC', val: decStr || '0' },
            { id: 'OCT' as NumberBase, label: 'OCT', val: octStr || '0' },
            {
              id: 'BIN' as NumberBase,
              label: 'BIN',
              val: binChunks.join(' ') || '0',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setBase(item.id)}
              className={`flex items-center justify-between px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                base === item.id
                  ? 'bg-orange-500/15 border-orange-500/50 text-white'
                  : 'bg-[#181818] border-[#222] text-neutral-300 hover:bg-[#1E1E1E]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 text-[10px] font-bold ${
                    base === item.id ? 'text-orange-400' : 'text-neutral-500'
                  }`}
                >
                  {item.label}
                </span>
                <span className="font-mono text-xs tracking-wider break-all max-w-[210px] sm:max-w-xs truncate">
                  {item.val}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyValue(item.val, item.id);
                }}
                className="p-1 rounded-md text-neutral-400 hover:text-white"
                title="Copy"
              >
                {copiedBase === item.id ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Interactive Bit Matrix (Visual 64-bit toggles) */}
        <div className="bg-[#181818] border border-[#242424] rounded-xl p-2 mt-1">
          <div className="flex items-center justify-between text-[9px] text-neutral-500 font-mono mb-1">
            <span>{wordSize - 1}</span>
            <span className="text-neutral-400 font-bold">Bit Grid (Tap to toggle)</span>
            <span>0</span>
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
            {Array.from({ length: wordSize }).map((_, idx) => {
              const bitIndex = wordSize - 1 - idx;
              const isSet = (currentVal & (1n << BigInt(bitIndex))) !== 0n;
              return (
                <button
                  key={bitIndex}
                  onClick={() => handleToggleBit(bitIndex)}
                  className={`h-5 rounded text-[9px] font-mono font-bold flex items-center justify-center transition-all ${
                    isSet
                      ? 'bg-orange-500 text-black shadow-sm'
                      : 'bg-[#222] text-neutral-400 hover:bg-[#2c2c2c]'
                  }`}
                  title={`Bit ${bitIndex}`}
                >
                  {isSet ? '1' : '0'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Programmer Keypad */}
      <div className="flex-1 p-2.5 grid grid-cols-5 gap-1.5 bg-[#0C0C0C] select-none overflow-y-auto">
        {/* Row 1: Bitwise */}
        <button
          onClick={() => handleOperation('AND')}
          className="h-10 rounded-xl bg-[#1D1D1D] hover:bg-[#252525] text-xs font-mono font-bold text-neutral-200 transition-colors"
        >
          AND
        </button>
        <button
          onClick={() => handleOperation('OR')}
          className="h-10 rounded-xl bg-[#1D1D1D] hover:bg-[#252525] text-xs font-mono font-bold text-neutral-200 transition-colors"
        >
          OR
        </button>
        <button
          onClick={() => handleOperation('XOR')}
          className="h-10 rounded-xl bg-[#1D1D1D] hover:bg-[#252525] text-xs font-mono font-bold text-neutral-200 transition-colors"
        >
          XOR
        </button>
        <button
          onClick={() => handleOperation('NOT')}
          className="h-10 rounded-xl bg-[#1D1D1D] hover:bg-[#252525] text-xs font-mono font-bold text-neutral-200 transition-colors"
        >
          NOT
        </button>
        <button
          onClick={handleClear}
          className="h-10 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-bold text-red-400 transition-colors"
        >
          CLR
        </button>

        {/* Row 2: Shifts and Special */}
        <button
          onClick={() => handleOperation('Lsh')}
          className="h-10 rounded-xl bg-[#1D1D1D] hover:bg-[#252525] text-xs font-mono font-bold text-neutral-200 transition-colors"
        >
          &lt;&lt;
        </button>
        <button
          onClick={() => handleOperation('Rsh')}
          className="h-10 rounded-xl bg-[#1D1D1D] hover:bg-[#252525] text-xs font-mono font-bold text-neutral-200 transition-colors"
        >
          &gt;&gt;
        </button>
        <button
          onClick={() => handleOperation('2sComp')}
          className="h-10 rounded-xl bg-[#1D1D1D] hover:bg-[#252525] text-[11px] font-mono font-bold text-neutral-200 transition-colors"
        >
          2's
        </button>
        <button
          onClick={() => handleOperation('MOD')}
          className="h-10 rounded-xl bg-[#1D1D1D] hover:bg-[#252525] text-xs font-mono font-bold text-neutral-200 transition-colors"
        >
          MOD
        </button>
        <button
          onClick={handleBackspace}
          className="h-10 rounded-xl bg-[#222] hover:bg-[#2a2a2a] text-neutral-300 flex items-center justify-center transition-colors"
        >
          <Delete className="w-4 h-4" />
        </button>

        {/* Row 3: Hex A-B and arithmetic */}
        {['A', 'B'].map((letter) => (
          <button
            key={letter}
            onClick={() => handleDigit(letter)}
            disabled={!isDigitValid(letter)}
            className={`h-10 rounded-xl text-xs font-mono font-bold transition-colors ${
              isDigitValid(letter)
                ? 'bg-[#222] hover:bg-[#2c2c2c] text-orange-400'
                : 'bg-[#151515] text-neutral-700 cursor-not-allowed'
            }`}
          >
            {letter}
          </button>
        ))}
        {['7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            disabled={!isDigitValid(digit)}
            className={`h-10 rounded-xl text-sm font-mono font-bold transition-colors ${
              isDigitValid(digit)
                ? 'bg-[#202020] hover:bg-[#2b2b2b] text-white'
                : 'bg-[#151515] text-neutral-700 cursor-not-allowed'
            }`}
          >
            {digit}
          </button>
        ))}

        {/* Row 4: Hex C-D and numbers */}
        {['C', 'D'].map((letter) => (
          <button
            key={letter}
            onClick={() => handleDigit(letter)}
            disabled={!isDigitValid(letter)}
            className={`h-10 rounded-xl text-xs font-mono font-bold transition-colors ${
              isDigitValid(letter)
                ? 'bg-[#222] hover:bg-[#2c2c2c] text-orange-400'
                : 'bg-[#151515] text-neutral-700 cursor-not-allowed'
            }`}
          >
            {letter}
          </button>
        ))}
        {['4', '5', '6'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            disabled={!isDigitValid(digit)}
            className={`h-10 rounded-xl text-sm font-mono font-bold transition-colors ${
              isDigitValid(digit)
                ? 'bg-[#202020] hover:bg-[#2b2b2b] text-white'
                : 'bg-[#151515] text-neutral-700 cursor-not-allowed'
            }`}
          >
            {digit}
          </button>
        ))}

        {/* Row 5: Hex E-F and numbers */}
        {['E', 'F'].map((letter) => (
          <button
            key={letter}
            onClick={() => handleDigit(letter)}
            disabled={!isDigitValid(letter)}
            className={`h-10 rounded-xl text-xs font-mono font-bold transition-colors ${
              isDigitValid(letter)
                ? 'bg-[#222] hover:bg-[#2c2c2c] text-orange-400'
                : 'bg-[#151515] text-neutral-700 cursor-not-allowed'
            }`}
          >
            {letter}
          </button>
        ))}
        {['1', '2', '3'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            disabled={!isDigitValid(digit)}
            className={`h-10 rounded-xl text-sm font-mono font-bold transition-colors ${
              isDigitValid(digit)
                ? 'bg-[#202020] hover:bg-[#2b2b2b] text-white'
                : 'bg-[#151515] text-neutral-700 cursor-not-allowed'
            }`}
          >
            {digit}
          </button>
        ))}

        {/* Row 6: Basic ops & 0 & = */}
        <button
          onClick={() => handleOperation('+')}
          className="h-10 rounded-xl bg-[#1D1D1D] hover:bg-[#282828] text-sm font-bold text-orange-400"
        >
          +
        </button>
        <button
          onClick={() => handleOperation('-')}
          className="h-10 rounded-xl bg-[#1D1D1D] hover:bg-[#282828] text-sm font-bold text-orange-400"
        >
          −
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="h-10 rounded-xl bg-[#202020] hover:bg-[#2b2b2b] text-sm font-mono font-bold text-white"
        >
          0
        </button>
        <button
          onClick={() => handleOperation('*')}
          className="h-10 rounded-xl bg-[#1D1D1D] hover:bg-[#282828] text-sm font-bold text-orange-400"
        >
          ×
        </button>
        <button
          onClick={handleEquals}
          className="h-10 rounded-xl bg-orange-500 hover:bg-orange-400 text-sm font-bold text-black shadow-lg shadow-orange-500/20"
        >
          =
        </button>
      </div>
    </div>
  );
};
