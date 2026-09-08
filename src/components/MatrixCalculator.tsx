import React, { useState } from 'react';
import { Copy, Check, RefreshCw, ArrowRight } from 'lucide-react';
import { playKeySound, triggerHapticVibration } from '../utils/audio';

type MatrixMode = 'matrix' | 'vector';

export const MatrixCalculator: React.FC<{
  onInsertToCalculator?: (val: string) => void;
}> = ({ onInsertToCalculator }) => {
  const [subMode, setSubMode] = useState<MatrixMode>('matrix');
  const [dim, setDim] = useState<2 | 3>(3);
  const [copied, setCopied] = useState(false);

  // Matrix A and B
  const [matA, setMatA] = useState<number[][]>([
    [1, 2, 3],
    [0, 1, 4],
    [5, 6, 0],
  ]);

  const [matB, setMatB] = useState<number[][]>([
    [2, 0, -1],
    [1, 3, 2],
    [0, -2, 1],
  ]);

  // Vector u and v
  const [vecU, setVecU] = useState<number[]>([1, 2, 3]);
  const [vecV, setVecV] = useState<number[]>([4, -5, 6]);

  const [resultMatrix, setResultMatrix] = useState<number[][] | null>(null);
  const [resultScalar, setResultScalar] = useState<number | null>(null);
  const [resultVector, setResultVector] = useState<number[] | null>(null);
  const [opLabel, setOpLabel] = useState<string>('Select an operation');

  const updateMatCell = (
    which: 'A' | 'B',
    r: number,
    c: number,
    valStr: string
  ) => {
    const val = parseFloat(valStr) || 0;
    if (which === 'A') {
      const copy = matA.map((row) => [...row]);
      copy[r][c] = val;
      setMatA(copy);
    } else {
      const copy = matB.map((row) => [...row]);
      copy[r][c] = val;
      setMatB(copy);
    }
  };

  const handleSetDim = (newDim: 2 | 3) => {
    setDim(newDim);
    if (newDim === 2) {
      setMatA([
        [matA[0][0] || 1, matA[0][1] || 2],
        [matA[1][0] || 3, matA[1][1] || 4],
      ]);
      setMatB([
        [matB[0][0] || 2, matB[0][1] || 0],
        [matB[1][0] || 1, matB[1][1] || 3],
      ]);
    } else {
      setMatA([
        [matA[0]?.[0] || 1, matA[0]?.[1] || 2, 3],
        [matA[1]?.[0] || 0, matA[1]?.[1] || 1, 4],
        [5, 6, 0],
      ]);
      setMatB([
        [matB[0]?.[0] || 2, matB[0]?.[1] || 0, -1],
        [matB[1]?.[0] || 1, matB[1]?.[1] || 3, 2],
        [0, -2, 1],
      ]);
    }
    setResultMatrix(null);
    setResultScalar(null);
  };

  // Matrix math helpers
  const getDeterminant = (m: number[][]): number => {
    const n = m.length;
    if (n === 1) return m[0][0];
    if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    if (n === 3) {
      return (
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
      );
    }
    return 0;
  };

  const getTranspose = (m: number[][]): number[][] => {
    const n = m.length;
    const res: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        res[j][i] = m[i][j];
      }
    }
    return res;
  };

  const getInverse = (m: number[][]): number[][] | null => {
    const det = getDeterminant(m);
    if (Math.abs(det) < 1e-12) return null; // Singular

    const n = m.length;
    if (n === 2) {
      return [
        [+(m[1][1] / det).toFixed(4), +(-m[0][1] / det).toFixed(4)],
        [+(-m[1][0] / det).toFixed(4), +(m[0][0] / det).toFixed(4)],
      ];
    }
    if (n === 3) {
      const inv: number[][] = [];
      for (let i = 0; i < 3; i++) {
        inv[i] = [];
        for (let j = 0; j < 3; j++) {
          const sub = [
            [m[(j + 1) % 3][(i + 1) % 3], m[(j + 1) % 3][(i + 2) % 3]],
            [m[(j + 2) % 3][(i + 1) % 3], m[(j + 2) % 3][(i + 2) % 3]],
          ];
          const subDet = sub[0][0] * sub[1][1] - sub[0][1] * sub[1][0];
          inv[i][j] = +((subDet / det) * ((i + j) % 2 === 0 ? 1 : -1)).toFixed(
            4
          );
        }
      }
      return inv;
    }
    return null;
  };

  // Perform operations
  const doMatrixOp = (op: 'add' | 'sub' | 'mul' | 'detA' | 'invA' | 'transA' | 'traceA') => {
    playKeySound('op');
    triggerHapticVibration(10);
    setResultScalar(null);
    setResultMatrix(null);

    const n = dim;
    const A = matA.slice(0, n).map((r) => r.slice(0, n));
    const B = matB.slice(0, n).map((r) => r.slice(0, n));

    if (op === 'add') {
      const res = A.map((r, i) => r.map((c, j) => +(c + B[i][j]).toFixed(4)));
      setResultMatrix(res);
      setOpLabel('A + B');
    } else if (op === 'sub') {
      const res = A.map((r, i) => r.map((c, j) => +(c - B[i][j]).toFixed(4)));
      setResultMatrix(res);
      setOpLabel('A − B');
    } else if (op === 'mul') {
      const res: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          let sum = 0;
          for (let k = 0; k < n; k++) {
            sum += A[i][k] * B[k][j];
          }
          res[i][j] = +sum.toFixed(4);
        }
      }
      setResultMatrix(res);
      setOpLabel('A × B');
    } else if (op === 'detA') {
      const d = getDeterminant(A);
      setResultScalar(+d.toFixed(4));
      setOpLabel('det(A)');
    } else if (op === 'invA') {
      const inv = getInverse(A);
      if (inv) {
        setResultMatrix(inv);
        setOpLabel('Inverse A⁻¹');
      } else {
        setOpLabel('Matrix A is singular (no inverse)');
      }
    } else if (op === 'transA') {
      setResultMatrix(getTranspose(A));
      setOpLabel('Transpose Aᵀ');
    } else if (op === 'traceA') {
      let tr = 0;
      for (let i = 0; i < n; i++) tr += A[i][i];
      setResultScalar(+tr.toFixed(4));
      setOpLabel('Trace Tr(A)');
    }
  };

  // Vector math
  const doVectorOp = (op: 'dot' | 'cross' | 'magU' | 'angle') => {
    playKeySound('op');
    triggerHapticVibration(10);
    setResultScalar(null);
    setResultVector(null);

    const [u1, u2, u3] = vecU;
    const [v1, v2, v3] = vecV;

    if (op === 'dot') {
      const dot = u1 * v1 + u2 * v2 + u3 * v3;
      setResultScalar(+dot.toFixed(4));
      setOpLabel('u · v (Dot Product)');
    } else if (op === 'cross') {
      const cross = [
        +(u2 * v3 - u3 * v2).toFixed(4),
        +(u3 * v1 - u1 * v3).toFixed(4),
        +(u1 * v2 - u2 * v1).toFixed(4),
      ];
      setResultVector(cross);
      setOpLabel('u × v (Cross Product)');
    } else if (op === 'magU') {
      const mag = Math.sqrt(u1 * u1 + u2 * u2 + u3 * u3);
      setResultScalar(+mag.toFixed(4));
      setOpLabel('‖u‖ (Magnitude)');
    } else if (op === 'angle') {
      const dot = u1 * v1 + u2 * v2 + u3 * v3;
      const magU = Math.sqrt(u1 * u1 + u2 * u2 + u3 * u3);
      const magV = Math.sqrt(v1 * v1 + v2 * v2 + v3 * v3);
      if (magU === 0 || magV === 0) {
        setOpLabel('Cannot compute angle with zero vector');
        return;
      }
      const cosTheta = Math.max(-1, Math.min(1, dot / (magU * magV)));
      const deg = (Math.acos(cosTheta) * 180) / Math.PI;
      setResultScalar(+deg.toFixed(2));
      setOpLabel('Angle θ (degrees)');
    }
  };

  const copyResult = () => {
    let str = '';
    if (resultScalar !== null) str = resultScalar.toString();
    else if (resultVector) str = `[${resultVector.join(', ')}]`;
    else if (resultMatrix) {
      str = resultMatrix.map((r) => `[${r.join(', ')}]`).join('\n');
    }
    navigator.clipboard?.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-y-auto p-3.5 gap-3.5">
      {/* Top Segmented Switcher: Matrix vs Vector */}
      <div className="flex items-center justify-between">
        <div className="flex bg-[#161616] p-1 rounded-2xl border border-[#252525]">
          <button
            onClick={() => setSubMode('matrix')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              subMode === 'matrix'
                ? 'bg-orange-500 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Matrix Algebra
          </button>
          <button
            onClick={() => setSubMode('vector')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              subMode === 'vector'
                ? 'bg-orange-500 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            3D Vectors
          </button>
        </div>

        {subMode === 'matrix' && (
          <div className="flex items-center gap-1 bg-[#161616] p-1 rounded-xl border border-[#252525]">
            <button
              onClick={() => handleSetDim(2)}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                dim === 2
                  ? 'bg-orange-500 text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              2×2
            </button>
            <button
              onClick={() => handleSetDim(3)}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                dim === 3
                  ? 'bg-orange-500 text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              3×3
            </button>
          </div>
        )}
      </div>

      {subMode === 'matrix' ? (
        <>
          {/* Matrices Input Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Matrix A */}
            <div className="bg-[#141414] border border-[#242424] rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400 font-mono">
                  Matrix A ({dim}×{dim})
                </span>
                <button
                  onClick={() =>
                    setMatA([
                      [1, 0, 0],
                      [0, 1, 0],
                      [0, 0, 1],
                    ])
                  }
                  className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-[#202020]"
                >
                  Identity
                </button>
              </div>

              <div
                className={`grid gap-1.5 ${
                  dim === 2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}
              >
                {Array.from({ length: dim }).map((_, r) =>
                  Array.from({ length: dim }).map((__, c) => (
                    <input
                      key={`a-${r}-${c}`}
                      type="number"
                      step="any"
                      value={matA[r]?.[c] ?? 0}
                      onChange={(e) => updateMatCell('A', r, c, e.target.value)}
                      className="h-9 bg-[#1F1F1F] border border-[#303030] focus:border-orange-500 rounded-xl text-center font-mono text-xs text-white outline-none"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Matrix B */}
            <div className="bg-[#141414] border border-[#242424] rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 font-mono">
                  Matrix B ({dim}×{dim})
                </span>
                <button
                  onClick={() =>
                    setMatB([
                      [0, 0, 0],
                      [0, 0, 0],
                      [0, 0, 0],
                    ])
                  }
                  className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-[#202020]"
                >
                  Zero
                </button>
              </div>

              <div
                className={`grid gap-1.5 ${
                  dim === 2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}
              >
                {Array.from({ length: dim }).map((_, r) =>
                  Array.from({ length: dim }).map((__, c) => (
                    <input
                      key={`b-${r}-${c}`}
                      type="number"
                      step="any"
                      value={matB[r]?.[c] ?? 0}
                      onChange={(e) => updateMatCell('B', r, c, e.target.value)}
                      className="h-9 bg-[#1F1F1F] border border-[#303030] focus:border-orange-500 rounded-xl text-center font-mono text-xs text-white outline-none"
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Matrix Operations Toolbar */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            <button
              onClick={() => doMatrixOp('add')}
              className="py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl text-xs font-bold font-mono text-orange-400"
            >
              A + B
            </button>
            <button
              onClick={() => doMatrixOp('sub')}
              className="py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl text-xs font-bold font-mono text-orange-400"
            >
              A − B
            </button>
            <button
              onClick={() => doMatrixOp('mul')}
              className="py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl text-xs font-bold font-mono text-orange-400"
            >
              A × B
            </button>
            <button
              onClick={() => doMatrixOp('detA')}
              className="py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl text-xs font-bold font-mono text-neutral-200"
            >
              det(A)
            </button>
            <button
              onClick={() => doMatrixOp('invA')}
              className="py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl text-xs font-bold font-mono text-neutral-200"
            >
              A⁻¹
            </button>
            <button
              onClick={() => doMatrixOp('transA')}
              className="py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl text-xs font-bold font-mono text-neutral-200"
            >
              Aᵀ
            </button>
            <button
              onClick={() => doMatrixOp('traceA')}
              className="py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl text-xs font-bold font-mono text-neutral-200"
            >
              Tr(A)
            </button>
          </div>
        </>
      ) : (
        /* Vector Inputs and Controls */
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Vector u */}
            <div className="bg-[#141414] border border-[#242424] rounded-2xl p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-orange-400 font-mono">
                Vector u = [x, y, z]
              </span>
              <div className="grid grid-cols-3 gap-2">
                {['x', 'y', 'z'].map((axis, i) => (
                  <div key={`u-${axis}`} className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {axis}
                    </span>
                    <input
                      type="number"
                      value={vecU[i]}
                      onChange={(e) => {
                        const copy = [...vecU];
                        copy[i] = parseFloat(e.target.value) || 0;
                        setVecU(copy);
                      }}
                      className="h-9 bg-[#1F1F1F] border border-[#303030] focus:border-orange-500 rounded-xl text-center font-mono text-xs text-white outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Vector v */}
            <div className="bg-[#141414] border border-[#242424] rounded-2xl p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-neutral-300 font-mono">
                Vector v = [x, y, z]
              </span>
              <div className="grid grid-cols-3 gap-2">
                {['x', 'y', 'z'].map((axis, i) => (
                  <div key={`v-${axis}`} className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {axis}
                    </span>
                    <input
                      type="number"
                      value={vecV[i]}
                      onChange={(e) => {
                        const copy = [...vecV];
                        copy[i] = parseFloat(e.target.value) || 0;
                        setVecV(copy);
                      }}
                      className="h-9 bg-[#1F1F1F] border border-[#303030] focus:border-orange-500 rounded-xl text-center font-mono text-xs text-white outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => doVectorOp('dot')}
              className="py-2.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl text-xs font-bold font-mono text-orange-400"
            >
              u · v
            </button>
            <button
              onClick={() => doVectorOp('cross')}
              className="py-2.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl text-xs font-bold font-mono text-orange-400"
            >
              u × v
            </button>
            <button
              onClick={() => doVectorOp('magU')}
              className="py-2.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl text-xs font-bold font-mono text-neutral-200"
            >
              ‖u‖
            </button>
            <button
              onClick={() => doVectorOp('angle')}
              className="py-2.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl text-xs font-bold font-mono text-neutral-200"
            >
              Angle θ
            </button>
          </div>
        </div>
      )}

      {/* Result Display Box */}
      <div className="mt-auto bg-[#121212] border border-[#252525] rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span className="text-orange-400 font-bold">{opLabel}</span>
          {(resultScalar !== null || resultMatrix !== null || resultVector !== null) && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyResult}
                className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white px-2 py-0.5 rounded bg-[#202020]"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy</span>
              </button>
              {onInsertToCalculator && resultScalar !== null && (
                <button
                  onClick={() => onInsertToCalculator(resultScalar.toString())}
                  className="text-[11px] text-orange-400 font-bold hover:underline"
                >
                  Use in Calc →
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center p-3 bg-[#181818] border border-[#222] rounded-xl min-h-[70px]">
          {resultScalar !== null && (
            <span className="font-mono text-xl sm:text-2xl font-bold text-white">
              {resultScalar}
            </span>
          )}

          {resultVector !== null && (
            <span className="font-mono text-lg sm:text-xl font-bold text-emerald-400">
              [ {resultVector.join(', ')} ]
            </span>
          )}

          {resultMatrix !== null && (
            <div className="flex items-center gap-1 font-mono text-sm font-bold text-white">
              <span className="text-2xl text-neutral-500">[</span>
              <div className="flex flex-col gap-1 text-center">
                {resultMatrix.map((row, r) => (
                  <div key={r} className="flex gap-4 justify-center">
                    {row.map((val, c) => (
                      <span key={c} className="w-12 text-center text-orange-400">
                        {val}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <span className="text-2xl text-neutral-500">]</span>
            </div>
          )}

          {resultScalar === null &&
            resultVector === null &&
            resultMatrix === null && (
              <span className="text-xs text-neutral-600 font-mono">
                Click any calculation button above to evaluate
              </span>
            )}
        </div>
      </div>
    </div>
  );
};
