import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Crosshair,
} from 'lucide-react';
import { GraphFunction, GraphWindow, AngleMode } from '../types';
import { compileGraphFunction } from '../utils/evaluator';

interface GraphingCalculatorProps {
  angleMode: AngleMode;
}

const PRESET_FUNCTIONS = [
  { label: 'x² + 2x - 5', expr: 'x^2 + 2*x - 5' },
  { label: 'sin(x)', expr: 'sin(x)' },
  { label: 'cos(x) · x', expr: 'cos(x) * x' },
  { label: '1 / x', expr: '1 / x' },
  { label: 'x³ - 3x', expr: 'x^3 - 3*x' },
  { label: '√(abs(x))', expr: 'sqrt(abs(x))' },
  { label: '2^x', expr: '2^x' },
];

const FUNCTION_COLORS = ['#FF7A00', '#00E5FF', '#00E676', '#E040FB', '#FFD600'];

export const GraphingCalculator: React.FC<GraphingCalculatorProps> = ({ angleMode }) => {
  const [functions, setFunctions] = useState<GraphFunction[]>([
    {
      id: '1',
      expression: 'x^2 + 2*x - 5',
      color: '#FF7A00',
      visible: true,
      isValid: true,
    },
  ]);

  const [windowBounds, setWindowBounds] = useState<GraphWindow>({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
  });

  const [showWindowModal, setShowWindowModal] = useState(false);
  const [tempBounds, setTempBounds] = useState<GraphWindow>({ ...windowBounds });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isTracing, setIsTracing] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; bounds: GraphWindow }>({
    x: 0,
    y: 0,
    bounds: { ...windowBounds },
  });

  // Coordinate transformations
  const toScreenX = useCallback(
    (x: number, width: number, bounds: GraphWindow) => {
      return ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * width;
    },
    []
  );

  const toScreenY = useCallback(
    (y: number, height: number, bounds: GraphWindow) => {
      return height - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * height;
    },
    []
  );

  const toWorldX = useCallback(
    (screenX: number, width: number, bounds: GraphWindow) => {
      return bounds.xMin + (screenX / width) * (bounds.xMax - bounds.xMin);
    },
    []
  );

  const toWorldY = useCallback(
    (screenY: number, height: number, bounds: GraphWindow) => {
      return bounds.yMax - (screenY / height) * (bounds.yMax - bounds.yMin);
    },
    []
  );

  // Redraw Canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(0, 0, width, height);

    const { xMin, xMax, yMin, yMax } = windowBounds;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    // Grid spacing calculation
    const getGridStep = (range: number) => {
      const roughStep = range / 8;
      const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
      const norm = roughStep / mag;
      if (norm < 2) return 1 * mag;
      if (norm < 5) return 2 * mag;
      return 5 * mag;
    };

    const xStep = getGridStep(xRange);
    const yStep = getGridStep(yRange);

    // Draw Minor & Major Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#181818';

    const firstX = Math.floor(xMin / xStep) * xStep;
    for (let x = firstX; x <= xMax; x += xStep) {
      const sx = toScreenX(x, width, windowBounds);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();
    }

    const firstY = Math.floor(yMin / yStep) * yStep;
    for (let y = firstY; y <= yMax; y += yStep) {
      const sy = toScreenY(y, height, windowBounds);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
    }

    // Draw Axes (X and Y)
    const originX = toScreenX(0, width, windowBounds);
    const originY = toScreenY(0, height, windowBounds);

    ctx.strokeStyle = '#383838';
    ctx.lineWidth = 1.5;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Draw Labels on Axes
    ctx.fillStyle = '#737373';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = firstX; x <= xMax; x += xStep) {
      if (Math.abs(x) < 1e-9) continue; // skip 0
      const sx = toScreenX(x, width, windowBounds);
      const labelY = Math.max(10, Math.min(height - 18, originY + 4));
      ctx.fillText(Number(x.toPrecision(6)).toString(), sx, labelY);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = firstY; y <= yMax; y += yStep) {
      if (Math.abs(y) < 1e-9) continue;
      const sy = toScreenY(y, height, windowBounds);
      const labelX = Math.max(28, Math.min(width - 8, originX - 6));
      ctx.fillText(Number(y.toPrecision(6)).toString(), labelX, sy);
    }

    // Plot Functions
    functions.forEach((fnItem) => {
      if (!fnItem.visible || !fnItem.expression.trim()) return;

      const evalFn = compileGraphFunction(fnItem.expression, angleMode);
      ctx.strokeStyle = fnItem.color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      let isDrawing = false;
      let prevY: number | null = null;

      // Sample along width pixel by pixel
      const pixelStep = 1;
      for (let px = 0; px <= width; px += pixelStep) {
        const wx = toWorldX(px, width, windowBounds);
        const wy = evalFn(wx);

        if (isNaN(wy) || !isFinite(wy)) {
          isDrawing = false;
          prevY = null;
          continue;
        }

        const py = toScreenY(wy, height, windowBounds);

        // Discontinuity detection (e.g. tan(x), 1/x asymptotes)
        if (prevY !== null && Math.abs(py - prevY) > height * 0.8) {
          isDrawing = false;
        }

        if (!isDrawing) {
          ctx.moveTo(px, py);
          isDrawing = true;
        } else {
          ctx.lineTo(px, py);
        }
        prevY = py;
      }
      ctx.stroke();
    });

    // Draw Crosshair / Cursor trace if active
    if (cursorPos && isTracing) {
      const sx = toScreenX(cursorPos.x, width, windowBounds);
      const sy = toScreenY(cursorPos.y, height, windowBounds);

      ctx.strokeStyle = 'rgba(255, 122, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical guide
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      // Horizontal guide
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      ctx.setLineDash([]);

      // Point circle
      ctx.fillStyle = '#FF7A00';
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [
    functions,
    windowBounds,
    angleMode,
    cursorPos,
    isTracing,
    toScreenX,
    toScreenY,
    toWorldX,
    toWorldY,
  ]);

  // Handle Resize of canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      drawGraph();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawGraph]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Zoom controls
  const handleZoom = (factor: number) => {
    setWindowBounds((prev) => {
      const xMid = (prev.xMin + prev.xMax) / 2;
      const yMid = (prev.yMin + prev.yMax) / 2;
      const xSpan = (prev.xMax - prev.xMin) * factor;
      const ySpan = (prev.yMax - prev.yMin) * factor;
      return {
        xMin: xMid - xSpan / 2,
        xMax: xMid + xSpan / 2,
        yMin: yMid - ySpan / 2,
        yMax: yMid + ySpan / 2,
      };
    });
  };

  const handleResetView = () => {
    setWindowBounds({
      xMin: -10,
      xMax: 10,
      yMin: -10,
      yMax: 10,
    });
  };

  // Mouse & Touch Pan Handling
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      bounds: { ...windowBounds },
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const dx = currX - dragStartRef.current.x;
      const dy = currY - dragStartRef.current.y;
      const { bounds } = dragStartRef.current;
      const xSpan = bounds.xMax - bounds.xMin;
      const ySpan = bounds.yMax - bounds.yMin;

      const deltaWorldX = -(dx / rect.width) * xSpan;
      const deltaWorldY = (dy / rect.height) * ySpan;

      setWindowBounds({
        xMin: bounds.xMin + deltaWorldX,
        xMax: bounds.xMax + deltaWorldX,
        yMin: bounds.yMin + deltaWorldY,
        yMax: bounds.yMax + deltaWorldY,
      });
    } else if (isTracing) {
      const wx = toWorldX(currX, rect.width, windowBounds);
      // Snap to first visible function value if available
      const activeFn = functions.find((f) => f.visible && f.expression.trim());
      if (activeFn) {
        const evalFn = compileGraphFunction(activeFn.expression, angleMode);
        const wy = evalFn(wx);
        if (!isNaN(wy) && isFinite(wy)) {
          setCursorPos({ x: wx, y: wy });
          return;
        }
      }
      const wy = toWorldY(currY, rect.height, windowBounds);
      setCursorPos({ x: wx, y: wy });
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Function management
  const addFunction = () => {
    if (functions.length >= 4) return;
    const nextColor = FUNCTION_COLORS[functions.length % FUNCTION_COLORS.length];
    setFunctions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        expression: '',
        color: nextColor,
        visible: true,
        isValid: true,
      },
    ]);
  };

  const updateFunction = (id: string, newExpr: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, expression: newExpr } : f))
    );
  };

  const toggleFunctionVisibility = (id: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
  };

  const removeFunction = (id: string) => {
    if (functions.length <= 1) return;
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  const applyPreset = (presetExpr: string) => {
    setFunctions((prev) => [
      {
        ...prev[0],
        expression: presetExpr,
        visible: true,
      },
      ...prev.slice(1),
    ]);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden select-none">
      {/* Top Presets Toolbar */}
      <div className="px-3 py-2 bg-[#0E0E0E] border-b border-[#1A1A1A] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 mr-1 flex-shrink-0">
          Presets:
        </span>
        {PRESET_FUNCTIONS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.expr)}
            className="px-2.5 py-1 rounded-md bg-[#161616] hover:bg-[#222222] border border-[#222222] text-neutral-300 hover:text-orange-400 font-mono text-[11px] whitespace-nowrap transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Function Inputs List */}
      <div className="px-3 py-2 bg-[#121212] border-b border-[#1A1A1A] flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
        {functions.map((fnItem, index) => (
          <div key={fnItem.id} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: fnItem.color }}
            />
            <span className="font-mono text-xs text-neutral-400">
              y{index + 1} =
            </span>
            <input
              type="text"
              value={fnItem.expression}
              onChange={(e) => updateFunction(fnItem.id, e.target.value)}
              placeholder="e.g. x^2 + 2x - 5"
              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-orange-500 rounded-lg px-2.5 py-1 text-sm font-mono text-white placeholder-neutral-600 outline-none transition-colors"
            />
            <button
              onClick={() => toggleFunctionVisibility(fnItem.id)}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
              title={fnItem.visible ? 'Hide function' : 'Show function'}
            >
              {fnItem.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            {functions.length > 1 && (
              <button
                onClick={() => removeFunction(fnItem.id)}
                className="p-1 text-neutral-400 hover:text-rose-400 transition-colors"
                title="Remove function"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {functions.length < 3 && (
          <button
            onClick={addFunction}
            className="self-start text-xs font-medium text-orange-400 hover:text-orange-300 flex items-center gap-1 mt-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Function</span>
          </button>
        )}
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-[#0D0D0D] overflow-hidden cursor-crosshair min-h-[220px]"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* Live Trace Badge */}
        {cursorPos && isTracing && (
          <div className="absolute top-2 left-3 bg-[#1A1A1A]/90 backdrop-blur border border-[#2F2F2F] px-2.5 py-1 rounded-md text-[11px] font-mono text-neutral-200 pointer-events-none shadow-md">
            <span className="text-neutral-400">X:</span>{' '}
            <span className="text-orange-400 font-bold">
              {cursorPos.x.toFixed(3)}
            </span>
            <span className="mx-2 text-neutral-600">|</span>
            <span className="text-neutral-400">Y:</span>{' '}
            <span className="text-cyan-400 font-bold">
              {cursorPos.y.toFixed(3)}
            </span>
          </div>
        )}

        {/* Floating View Controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 bg-[#161616]/90 backdrop-blur border border-[#2A2A2A] p-1 rounded-xl shadow-lg">
          <button
            id="btn-graph-zoom-in"
            onClick={() => handleZoom(0.7)}
            title="Zoom In"
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-[#252525] transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-graph-zoom-out"
            onClick={() => handleZoom(1.4)}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-[#252525] transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="btn-graph-reset"
            onClick={handleResetView}
            title="Reset to [-10, 10]"
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-[#252525] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            id="btn-graph-window-settings"
            onClick={() => {
              setTempBounds({ ...windowBounds });
              setShowWindowModal(true);
            }}
            title="Window Bounds Settings"
            className="p-1.5 rounded-lg text-neutral-300 hover:text-orange-400 hover:bg-[#252525] transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            id="btn-graph-trace"
            onClick={() => setIsTracing(!isTracing)}
            title={isTracing ? 'Disable Tracing' : 'Enable Tracing'}
            className={`p-1.5 rounded-lg transition-colors ${
              isTracing
                ? 'text-orange-400 bg-orange-500/20'
                : 'text-neutral-400 hover:bg-[#252525]'
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Settings Modal */}
      {showWindowModal && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#161616] border border-[#2B2B2B] rounded-2xl p-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Viewing Window Bounds</span>
              <button
                onClick={() => setShowWindowModal(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
              <div>
                <label className="text-neutral-400 block mb-1">X Min</label>
                <input
                  type="number"
                  value={tempBounds.xMin}
                  onChange={(e) =>
                    setTempBounds({ ...tempBounds, xMin: Number(e.target.value) })
                  }
                  className="w-full bg-[#202020] border border-[#333] rounded px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">X Max</label>
                <input
                  type="number"
                  value={tempBounds.xMax}
                  onChange={(e) =>
                    setTempBounds({ ...tempBounds, xMax: Number(e.target.value) })
                  }
                  className="w-full bg-[#202020] border border-[#333] rounded px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Y Min</label>
                <input
                  type="number"
                  value={tempBounds.yMin}
                  onChange={(e) =>
                    setTempBounds({ ...tempBounds, yMin: Number(e.target.value) })
                  }
                  className="w-full bg-[#202020] border border-[#333] rounded px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Y Max</label>
                <input
                  type="number"
                  value={tempBounds.yMax}
                  onChange={(e) =>
                    setTempBounds({ ...tempBounds, yMax: Number(e.target.value) })
                  }
                  className="w-full bg-[#202020] border border-[#333] rounded px-2 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowWindowModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:bg-[#222]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (
                    tempBounds.xMin < tempBounds.xMax &&
                    tempBounds.yMin < tempBounds.yMax
                  ) {
                    setWindowBounds(tempBounds);
                    setShowWindowModal(false);
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-black hover:bg-orange-400"
              >
                Apply Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
