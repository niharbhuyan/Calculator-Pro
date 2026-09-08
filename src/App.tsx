import React, { useState, useEffect, useCallback } from 'react';
import {
  CalculatorMode,
  AngleMode,
  HistoryItem,
  ScientificConstant,
} from './types';
import { evaluateExpression } from './utils/evaluator';
import { playKeySound } from './utils/audio';
import { AndroidStatusHeader } from './components/AndroidStatusHeader';
import { DisplaySection } from './components/DisplaySection';
import { KeypadSection } from './components/KeypadSection';
import { GraphingCalculator } from './components/GraphingCalculator';
import { HistoryDrawer } from './components/HistoryDrawer';
import { UnitConverter } from './components/UnitConverter';
import { MatrixCalculator } from './components/MatrixCalculator';
import { ProgrammerCalculator } from './components/ProgrammerCalculator';
import { StatisticsCalculator } from './components/StatisticsCalculator';
import { FinancialCalculator } from './components/FinancialCalculator';
import { ConstantsModal } from './components/ConstantsModal';
import { StepSolverModal } from './components/StepSolverModal';

const HISTORY_STORAGE_KEY = 'android_calc_history_v1';
const MEMORY_STORAGE_KEY = 'android_calc_memory_v1';
const SOUND_STORAGE_KEY = 'android_calc_sound_v1';

export default function App() {
  const [mode, setMode] = useState<CalculatorMode>('scientific');
  const [angleMode, setAngleMode] = useState<AngleMode>('RAD');
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [lastAns, setLastAns] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isFrameMode, setIsFrameMode] = useState<boolean>(true);

  // Sound and Tactile Feedback Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Modals
  const [showConstantsModal, setShowConstantsModal] = useState<boolean>(false);
  const [showStepSolverModal, setShowStepSolverModal] = useState<boolean>(false);

  // History State with localStorage persistence
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'init-1',
        expression: 'sin(π / 4) + log(100)',
        result: '2.7071',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'init-2',
        expression: '12 × 45 - 280 ÷ 4',
        result: '470',
        timestamp: Date.now() - 1800000,
      },
    ];
  });

  // Save history on changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // storage unavailable
    }
  }, [history]);

  // Memory Register (M+, M-, MR, MC)
  const [memoryVal, setMemoryVal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (saved) return parseFloat(saved) || 0;
    } catch {
      // ignore
    }
    return 0;
  });

  const [hasMemory, setHasMemory] = useState<boolean>(memoryVal !== 0);

  useEffect(() => {
    setHasMemory(memoryVal !== 0);
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, memoryVal.toString());
    } catch {
      // ignore
    }
  }, [memoryVal]);

  // Handle Keypad Inputs
  const handleInput = useCallback(
    (char: string) => {
      setErrorMessage(undefined);
      setExpression((prev) => {
        // If we just got an evaluated result and user starts with an operator,
        // continue operating on the previous result
        if (
          prev === '' &&
          ['+', '−', '×', '÷', '^', '%'].includes(char) &&
          result !== '0' &&
          result !== 'Error'
        ) {
          return result + ' ' + char + ' ';
        }

        // Space padding around operators for readability
        if (['+', '−', '×', '÷'].includes(char)) {
          return prev + ' ' + char + ' ';
        }

        return prev + char;
      });
    },
    [result]
  );

  const handleClear = useCallback(() => {
    setExpression('');
    setResult('0');
    setErrorMessage(undefined);
  }, []);

  const handleDelete = useCallback(() => {
    setErrorMessage(undefined);
    setExpression((prev) => {
      if (!prev) return '';
      // If ends with trailing space from operator " + ", strip all 3 chars
      if (prev.endsWith(' ') && prev.length >= 3) {
        return prev.slice(0, -3);
      }
      return prev.slice(0, -1);
    });
  }, []);

  const handleCalculate = useCallback(() => {
    if (!expression || expression.trim() === '') return;

    const evalResult = evaluateExpression(expression, angleMode, lastAns);
    if (evalResult.result !== null) {
      const formatted = evalResult.formatted;
      setResult(formatted);
      setLastAns(evalResult.result);
      setErrorMessage(undefined);

      // Add to persistent calculation history
      const newItem: HistoryItem = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
        expression: expression.trim(),
        result: formatted,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 49)]); // Keep last 50
    } else {
      setResult('Error');
      setErrorMessage(evalResult.error || 'Syntax Error');
    }
  }, [expression, angleMode, lastAns]);

  // Memory Actions
  const handleMemoryAction = useCallback(
    (action: 'MC' | 'MR' | 'M+' | 'M-') => {
      const currentNumericResult =
        result !== 'Error' && result !== '0'
          ? parseFloat(result.replace(/,/g, ''))
          : parseFloat(expression) || 0;

      switch (action) {
        case 'MC':
          setMemoryVal(0);
          break;
        case 'MR':
          if (memoryVal !== 0) {
            handleInput(memoryVal.toString());
          }
          break;
        case 'M+':
          setMemoryVal((prev) => prev + currentNumericResult);
          break;
        case 'M-':
          setMemoryVal((prev) => prev - currentNumericResult);
          break;
      }
    },
    [result, expression, memoryVal, handleInput]
  );

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside an input/textarea element
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        if (soundEnabled) playKeySound('num');
        handleInput(e.key);
      } else if (e.key === '.') {
        if (soundEnabled) playKeySound('num');
        handleInput('.');
      } else if (e.key === '+') {
        if (soundEnabled) playKeySound('op');
        handleInput('+');
      } else if (e.key === '-') {
        if (soundEnabled) playKeySound('op');
        handleInput('−');
      } else if (e.key === '*') {
        if (soundEnabled) playKeySound('op');
        handleInput('×');
      } else if (e.key === '/') {
        if (soundEnabled) playKeySound('op');
        handleInput('÷');
      } else if (e.key === '(' || e.key === ')') {
        if (soundEnabled) playKeySound('func');
        handleInput(e.key);
      } else if (e.key === '^') {
        if (soundEnabled) playKeySound('func');
        handleInput('^');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        if (soundEnabled) playKeySound('equals');
        handleCalculate();
      } else if (e.key === 'Backspace') {
        if (soundEnabled) playKeySound('delete');
        handleDelete();
      } else if (e.key === 'Escape') {
        if (soundEnabled) playKeySound('func');
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleCalculate, handleDelete, handleClear, soundEnabled]);

  // History reuse callbacks
  const handleSelectHistoryExpression = (expr: string) => {
    setExpression(expr);
    setMode('scientific');
  };

  const handleSelectHistoryResult = (res: string) => {
    setExpression((prev) => prev + res);
    setMode('scientific');
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleImportHistory = (
    newItems: HistoryItem[],
    mergeMode: 'append' | 'replace' = 'append'
  ) => {
    if (mergeMode === 'replace') {
      setHistory(newItems);
    } else {
      const existingIds = new Set(history.map((h) => h.id));
      const filtered = newItems.filter((h) => !existingIds.has(h.id));
      setHistory((prev) => [...filtered, ...prev].slice(0, 100));
    }
  };

  // Reusable insert callback for external calculators
  const handleInsertFromConverter = (val: string) => {
    setExpression((prev) => prev + val);
    setMode('scientific');
  };

  const handleSelectConstant = (c: ScientificConstant) => {
    handleInput(c.value.toString());
    setMode('scientific');
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] flex items-center justify-center p-0 sm:p-4 text-white overflow-x-hidden font-sans">
      {/* Container: Responsive Android Device Frame or Full Screen */}
      <div
        className={`w-full bg-[#0A0A0A] flex flex-col overflow-hidden transition-all duration-300 ${
          isFrameMode
            ? 'max-w-md h-screen sm:h-[860px] sm:max-h-[96vh] sm:rounded-[42px] sm:border-[8px] sm:border-[#1F1F1F] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-[#333]'
            : 'max-w-4xl h-screen sm:h-[860px] sm:max-h-[96vh] sm:rounded-3xl border border-[#222] shadow-2xl'
        }`}
      >
        {/* Android Top Status Bar & Navigation Tabs */}
        <AndroidStatusHeader
          currentMode={mode}
          onSelectMode={setMode}
          isFrameMode={isFrameMode}
          onToggleFrameMode={() => setIsFrameMode(!isFrameMode)}
          historyCount={history.length}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />

        {/* View Mode Switching */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {mode === 'scientific' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* High-Contrast Display */}
              <DisplaySection
                expression={expression}
                result={result}
                angleMode={angleMode}
                onToggleAngleMode={() =>
                  setAngleMode((prev) => (prev === 'RAD' ? 'DEG' : 'RAD'))
                }
                hasMemory={hasMemory}
                onClear={handleClear}
                onBackspace={handleDelete}
                errorMessage={errorMessage}
                onOpenHistory={() => setMode('history')}
                historyCount={history.length}
              />

              {/* Keypad Section */}
              <KeypadSection
                onInput={handleInput}
                onClear={handleClear}
                onDelete={handleDelete}
                onCalculate={handleCalculate}
                onMemoryAction={handleMemoryAction}
                hasMemory={hasMemory}
                onOpenConstants={() => setShowConstantsModal(true)}
                onOpenStepSolver={() => setShowStepSolverModal(true)}
                soundEnabled={soundEnabled}
              />
            </div>
          )}

          {mode === 'graphing' && <GraphingCalculator angleMode={angleMode} />}

          {mode === 'matrix' && (
            <MatrixCalculator onInsertToCalculator={handleInsertFromConverter} />
          )}

          {mode === 'programmer' && <ProgrammerCalculator />}

          {mode === 'statistics' && (
            <StatisticsCalculator onInsertToCalculator={handleInsertFromConverter} />
          )}

          {mode === 'financial' && (
            <FinancialCalculator onInsertToCalculator={handleInsertFromConverter} />
          )}

          {mode === 'converter' && (
            <UnitConverter onInsertToCalculator={handleInsertFromConverter} />
          )}

          {mode === 'history' && (
            <HistoryDrawer
              history={history}
              onSelectResult={handleSelectHistoryResult}
              onSelectExpression={handleSelectHistoryExpression}
              onClearHistory={handleClearHistory}
              onDeleteItem={handleDeleteHistoryItem}
              onImportHistory={handleImportHistory}
            />
          )}
        </div>

        {/* Android System Navigation Bar (Bottom Gesture Bar) */}
        <div className="h-6 bg-[#080808] border-t border-[#141414] flex items-center justify-center flex-shrink-0">
          <div className="w-28 h-1 rounded-full bg-neutral-600/60 hover:bg-neutral-400 transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Physics & Scientific Constants Modal */}
      <ConstantsModal
        isOpen={showConstantsModal}
        onClose={() => setShowConstantsModal(false)}
        onSelectConstant={handleSelectConstant}
      />

      {/* Step-by-Step PEMDAS, Quadratic & Calculus Solver Modal */}
      <StepSolverModal
        isOpen={showStepSolverModal}
        onClose={() => setShowStepSolverModal(false)}
        currentExpression={expression}
        currentResult={result}
      />
    </div>
  );
}
