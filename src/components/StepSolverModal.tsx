import React, { useState } from 'react';
import { X, Check, BookOpen, Calculator, Sparkles } from 'lucide-react';
import { playKeySound } from '../utils/audio';

interface StepSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExpression: string;
  currentResult: string;
}

type SolverTab = 'steps' | 'quadratic' | 'derivative' | 'integral';

export const StepSolverModal: React.FC<StepSolverModalProps> = ({
  isOpen,
  onClose,
  currentExpression,
  currentResult,
}) => {
  const [activeTab, setActiveTab] = useState<SolverTab>('steps');

  // Quadratic solver state
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-5);
  const [quadC, setQuadC] = useState<number>(6);

  // Calculus state
  const [calcFunc, setCalcFunc] = useState<string>('x^2 - 4*x + 3');
  const [calcX, setCalcX] = useState<number>(2);
  const [intA, setIntA] = useState<number>(0);
  const [intB, setIntB] = useState<number>(3);

  if (!isOpen) return null;

  // Evaluate numerical derivative via central difference
  const computeDerivative = (expr: string, xVal: number) => {
    try {
      const h = 0.0001;
      const fn = (x: number) => {
        const sanitized = expr
          .replace(/\^/g, '**')
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/sqrt/g, 'Math.sqrt')
          .replace(/ln/g, 'Math.log')
          .replace(/e/g, 'Math.E')
          .replace(/pi/g, 'Math.PI')
          .replace(/x/g, `(${x})`);
        return new Function(`return ${sanitized};`)();
      };
      const fPlus = fn(xVal + h);
      const fMinus = fn(xVal - h);
      const slope = (fPlus - fMinus) / (2 * h);
      return {
        slope: +slope.toFixed(4),
        fAtX: +fn(xVal).toFixed(4),
        tangentEq: `y = ${slope.toFixed(2)}x + ${(fn(xVal) - slope * xVal).toFixed(2)}`,
      };
    } catch {
      return null;
    }
  };

  // Evaluate definite integral via Simpson's 1/3 Rule
  const computeIntegral = (expr: string, a: number, b: number) => {
    try {
      const n = 100; // must be even
      const h = (b - a) / n;
      const fn = (x: number) => {
        const sanitized = expr
          .replace(/\^/g, '**')
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/sqrt/g, 'Math.sqrt')
          .replace(/ln/g, 'Math.log')
          .replace(/e/g, 'Math.E')
          .replace(/pi/g, 'Math.PI')
          .replace(/x/g, `(${x})`);
        return new Function(`return ${sanitized};`)();
      };

      let sum = fn(a) + fn(b);
      for (let i = 1; i < n; i++) {
        const x = a + i * h;
        sum += i % 2 === 0 ? 2 * fn(x) : 4 * fn(x);
      }
      const area = (h / 3) * sum;
      return +area.toFixed(4);
    } catch {
      return null;
    }
  };

  // Quadratic roots
  const solveQuadratic = () => {
    const disc = quadB * quadB - 4 * quadA * quadC;
    if (quadA === 0) return { error: 'Not a quadratic equation (a cannot be 0)' };
    if (disc > 0) {
      const r1 = (-quadB + Math.sqrt(disc)) / (2 * quadA);
      const r2 = (-quadB - Math.sqrt(disc)) / (2 * quadA);
      return {
        disc,
        roots: [`x₁ = ${+r1.toFixed(4)}`, `x₂ = ${+r2.toFixed(4)}`],
        vertex: { x: +(-quadB / (2 * quadA)).toFixed(4), y: +(-disc / (4 * quadA)).toFixed(4) },
      };
    } else if (disc === 0) {
      const r = -quadB / (2 * quadA);
      return {
        disc,
        roots: [`Single root: x = ${+r.toFixed(4)}`],
        vertex: { x: +r.toFixed(4), y: 0 },
      };
    } else {
      const real = +(-quadB / (2 * quadA)).toFixed(4);
      const imag = +(Math.sqrt(-disc) / (2 * quadA)).toFixed(4);
      return {
        disc,
        roots: [`x₁ = ${real} + ${imag}i`, `x₂ = ${real} − ${imag}i`],
        vertex: { x: real, y: +(-disc / (4 * quadA)).toFixed(4) },
      };
    }
  };

  const quadResult = solveQuadratic();
  const derivResult = computeDerivative(calcFunc, calcX);
  const integralResult = computeIntegral(calcFunc, intA, intB);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="w-full max-w-md bg-[#121212] border border-[#252525] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#202020] bg-[#161616] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Step-by-Step Solver & Calculus
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-[#252525] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Solver Tabs */}
        <div className="flex bg-[#161616] p-2 border-b border-[#202020] gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'steps' as SolverTab, label: 'Order of Ops' },
            { id: 'quadratic' as SolverTab, label: 'Quadratic' },
            { id: 'derivative' as SolverTab, label: 'd/dx Derivative' },
            { id: 'integral' as SolverTab, label: '∫ Definite Integral' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                playKeySound('func');
                setActiveTab(t.id);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-orange-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-[#202020]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4 flex-1">
          {activeTab === 'steps' && (
            <div className="flex flex-col gap-3">
              <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3">
                <span className="text-[10px] text-neutral-400 font-mono">
                  Expression Analyzed
                </span>
                <div className="text-lg font-mono font-bold text-white mt-0.5 break-all">
                  {currentExpression || 'No active expression'}
                </div>
                <div className="text-xs font-mono text-orange-400 mt-1">
                  Final Evaluated Result: {currentResult}
                </div>
              </div>

              {/* PEMDAS Methodology Breakdown */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-neutral-300">
                  Execution Pipeline (PEMDAS Hierarchy)
                </h4>
                <div className="flex flex-col gap-2 font-mono text-xs">
                  <div className="bg-[#161616] border border-[#222] rounded-xl p-2.5 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-neutral-200">
                        Parentheses & Functions:
                      </span>
                      <p className="text-neutral-400 text-[11px] mt-0.5">
                        Resolves inner brackets and transcendental functions (
                        <code className="text-orange-400">sin</code>,{' '}
                        <code className="text-orange-400">cos</code>,{' '}
                        <code className="text-orange-400">ln</code>,{' '}
                        <code className="text-orange-400">√</code>) from inside
                        out.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#161616] border border-[#222] rounded-xl p-2.5 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-neutral-200">
                        Exponents & Radicals:
                      </span>
                      <p className="text-neutral-400 text-[11px] mt-0.5">
                        Computes powers (<code className="text-orange-400">x^y</code>)
                        and factorials (<code className="text-orange-400">x!</code>).
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#161616] border border-[#222] rounded-xl p-2.5 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-neutral-200">
                        Multiplication & Division:
                      </span>
                      <p className="text-neutral-400 text-[11px] mt-0.5">
                        Evaluated with equal precedence from left to right.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#161616] border border-[#222] rounded-xl p-2.5 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      4
                    </span>
                    <div>
                      <span className="font-bold text-neutral-200">
                        Addition & Subtraction:
                      </span>
                      <p className="text-neutral-400 text-[11px] mt-0.5">
                        Final summation yielding {currentResult}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quadratic' && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono text-neutral-400">
                Formula: <span className="text-orange-400 font-bold">ax² + bx + c = 0</span>
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Coefficient a
                  </span>
                  <input
                    type="number"
                    value={quadA}
                    onChange={(e) => setQuadA(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl p-2 text-center font-mono text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Coefficient b
                  </span>
                  <input
                    type="number"
                    value={quadB}
                    onChange={(e) => setQuadB(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl p-2 text-center font-mono text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Coefficient c
                  </span>
                  <input
                    type="number"
                    value={quadC}
                    onChange={(e) => setQuadC(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl p-2 text-center font-mono text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Quadratic Output */}
              {'error' in quadResult ? (
                <div className="p-3 bg-red-950/40 border border-red-800 text-xs text-red-300 rounded-xl">
                  {quadResult.error}
                </div>
              ) : (
                <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3 flex flex-col gap-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-[#242424] pb-2">
                    <span className="text-neutral-400">
                      Discriminant (Δ = b² − 4ac)
                    </span>
                    <span className="font-bold text-orange-400">
                      {quadResult.disc}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-neutral-400">Roots (Solutions):</span>
                    {quadResult.roots.map((r, i) => (
                      <div
                        key={i}
                        className="text-base font-bold text-emerald-400"
                      >
                        {r}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#242424] pt-2 text-neutral-400 flex justify-between">
                    <span>Parabola Vertex (h, k):</span>
                    <span className="text-white">
                      ({quadResult.vertex.x}, {quadResult.vertex.y})
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'derivative' && (
            <div className="flex flex-col gap-3 font-mono">
              <div>
                <span className="text-xs text-neutral-400">
                  Function f(x):
                </span>
                <input
                  type="text"
                  value={calcFunc}
                  onChange={(e) => setCalcFunc(e.target.value)}
                  placeholder="e.g. x^2 - 4*x + 3"
                  className="w-full bg-[#1A1A1A] border border-[#333] focus:border-orange-500 rounded-xl p-2 text-xs text-white outline-none mt-1"
                />
              </div>

              <div>
                <span className="text-xs text-neutral-400">
                  Evaluation Point (x):
                </span>
                <input
                  type="number"
                  value={calcX}
                  onChange={(e) => setCalcX(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1A1A1A] border border-[#333] focus:border-orange-500 rounded-xl p-2 text-xs text-white outline-none mt-1"
                />
              </div>

              {derivResult && (
                <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between border-b border-[#242424] pb-2">
                    <span className="text-neutral-400">Derivative f'(x) at x = {calcX}:</span>
                    <span className="text-base font-bold text-orange-400">
                      {derivResult.slope}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Function Value f({calcX}):</span>
                    <span className="text-white font-bold">
                      {derivResult.fAtX}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#242424] pt-2">
                    <span className="text-neutral-400">Tangent Line:</span>
                    <span className="text-emerald-400 font-bold">
                      {derivResult.tangentEq}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'integral' && (
            <div className="flex flex-col gap-3 font-mono">
              <div>
                <span className="text-xs text-neutral-400">
                  Integrand f(x):
                </span>
                <input
                  type="text"
                  value={calcFunc}
                  onChange={(e) => setCalcFunc(e.target.value)}
                  placeholder="e.g. x^2 - 4*x + 3"
                  className="w-full bg-[#1A1A1A] border border-[#333] focus:border-orange-500 rounded-xl p-2 text-xs text-white outline-none mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-neutral-400">
                    Lower Bound a:
                  </span>
                  <input
                    type="number"
                    value={intA}
                    onChange={(e) => setIntA(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl p-2 text-xs text-white outline-none mt-1 text-center"
                  />
                </div>
                <div>
                  <span className="text-xs text-neutral-400">
                    Upper Bound b:
                  </span>
                  <input
                    type="number"
                    value={intB}
                    onChange={(e) => setIntB(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl p-2 text-xs text-white outline-none mt-1 text-center"
                  />
                </div>
              </div>

              {integralResult !== null && (
                <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3 flex flex-col gap-2 text-xs">
                  <span className="text-neutral-400">
                    ∫_{intA}^{intB} ({calcFunc}) dx:
                  </span>
                  <div className="text-2xl font-bold text-orange-400">
                    {integralResult}
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    Computed via Simpson's 1/3 Rule with 100 sub-intervals
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
