import { AngleMode } from '../types';

// Factorial calculation with memoization & gamma for non-integers
function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // JS Number max representation
  if (Math.floor(n) === n) {
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }
  // Stirling / Lanczos Gamma approximation for decimals: Gamma(n + 1) = n!
  const z = n + 1;
  const g = 7;
  const C = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  let x = C[0];
  for (let i = 1; i < g + 2; i++) {
    x += C[i] / (z + i - 1);
  }
  const t = z + g - 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z - 0.5) * Math.exp(-t) * x;
}

/**
 * Preprocess math expression string to make it evaluable.
 * Supports unicode symbols like ×, ÷, −, √, π, e, Ans.
 */
export function sanitizeExpression(
  expr: string,
  ansVal: number = 0,
  angleMode: AngleMode = 'RAD'
): string {
  if (!expr || expr.trim() === '') return '0';

  let s = expr;

  // Replace unicode operators
  s = s.replace(/×/g, '*');
  s = s.replace(/÷/g, '/');
  s = s.replace(/−/g, '-');
  s = s.replace(/–/g, '-');

  // Replace percentage: n% => (n/100)
  // Handle e.g. 50% => (50/100), 50% * 2
  s = s.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  // Replace Ans with value
  s = s.replace(/\bAns\b/gi, `(${ansVal})`);

  // Replace constants
  s = s.replace(/π/g, `(${Math.PI})`);
  s = s.replace(/\bpi\b/gi, `(${Math.PI})`);
  s = s.replace(/(?<=[0-9])e/g, `*(${Math.E})`); // 2e -> 2*e (unless sci notation like 1e5)
  // If it's isolated 'e' as Euler's number:
  s = s.replace(/(?<![0-9a-zA-Z_])e(?![0-9a-zA-Z_])/g, `(${Math.E})`);

  // Replace square root: √(expr) or √number -> sqrt(expr)
  s = s.replace(/√\s*(\d+(?:\.\d+)?)/g, 'sqrt($1)');
  s = s.replace(/√/g, 'sqrt');
  s = s.replace(/∛\s*(\d+(?:\.\d+)?)/g, 'cbrt($1)');
  s = s.replace(/∛/g, 'cbrt');

  // Replace mod
  s = s.replace(/\bmod\b/gi, '%');

  // Replace EE notation: 5EE2 -> 5e2
  s = s.replace(/EE/gi, 'e');

  // Factorial postfix: n! -> fact(n) or (expr)! -> fact(expr)
  // Handle (expr)!
  s = s.replace(/\(([^()]+)\)!/g, 'fact($1)');
  // Handle number!
  s = s.replace(/(\d+(?:\.\d+)?)!/g, 'fact($1)');

  // Implicit multiplication:
  // 1. Number followed by parenthesis: 2(3) -> 2*(3)
  s = s.replace(/(\d+(?:\.\d+)?)\s*\(/g, '$1*(');
  // 2. Closing parenthesis followed by opening: )( -> )*(
  s = s.replace(/\)\s*\(/g, ')*(');
  // 3. Closing parenthesis followed by number: )2 -> )*2
  s = s.replace(/\)\s*(\d+(?:\.\d+)?)/g, ')*$1');
  // 4. Number followed by function name: 2sin(x) -> 2*sin(x)
  s = s.replace(/(\d+(?:\.\d+)?)\s*([a-zA-Z_]\w*)\s*\(/g, '$1*$2(');
  // 5. Number followed by x (for graphing): 2x -> 2*x
  s = s.replace(/(\d+(?:\.\d+)?)\s*x\b/gi, '$1*x');
  // 6. x followed by (: x( -> x*(
  s = s.replace(/\bx\s*\(/gi, 'x*(');
  // 7. ) followed by x: )x -> )*x
  s = s.replace(/\)\s*x\b/gi, ')*x');

  // Power operator ^ to Math.pow representation or **
  // JavaScript supports ** natively, which is standard for power
  s = s.replace(/\^/g, '**');

  return s;
}

/**
 * Creates the evaluation scope with trigonometry adjusted for RAD/DEG.
 */
function createScope(angleMode: AngleMode) {
  const toRad = (val: number) => (angleMode === 'DEG' ? (val * Math.PI) / 180 : val);
  const fromRad = (val: number) => (angleMode === 'DEG' ? (val * 180) / Math.PI : val);

  return {
    sin: (x: number) => {
      const res = Math.sin(toRad(x));
      return Math.abs(res) < 1e-15 ? 0 : res;
    },
    cos: (x: number) => {
      const res = Math.cos(toRad(x));
      return Math.abs(res) < 1e-15 ? 0 : res;
    },
    tan: (x: number) => {
      const r = toRad(x);
      // Check for vertical asymptotes: cos(r) == 0
      if (Math.abs(Math.cos(r)) < 1e-15) return NaN;
      const res = Math.tan(r);
      return Math.abs(res) < 1e-15 ? 0 : res;
    },
    asin: (x: number) => fromRad(Math.asin(x)),
    acos: (x: number) => fromRad(Math.acos(x)),
    atan: (x: number) => fromRad(Math.atan(x)),
    sinh: (x: number) => Math.sinh(x),
    cosh: (x: number) => Math.cosh(x),
    tanh: (x: number) => Math.tanh(x),
    asinh: (x: number) => Math.asinh(x),
    acosh: (x: number) => Math.acosh(x),
    atanh: (x: number) => Math.atanh(x),
    log: (x: number) => Math.log10(x),
    ln: (x: number) => Math.log(x),
    log2: (x: number) => Math.log2(x),
    sqrt: (x: number) => Math.sqrt(x),
    cbrt: (x: number) => Math.cbrt(x),
    abs: (x: number) => Math.abs(x),
    exp: (x: number) => Math.exp(x),
    fact: (x: number) => factorial(x),
    rad: (x: number) => (x * Math.PI) / 180,
    deg: (x: number) => (x * 180) / Math.PI,
    round: (x: number) => Math.round(x),
    floor: (x: number) => Math.floor(x),
    ceil: (x: number) => Math.ceil(x),
    rand: () => Math.random(),
    PI: Math.PI,
    E: Math.E,
  };
}

/**
 * Safely evaluates a mathematical expression.
 */
export function evaluateExpression(
  expression: string,
  angleMode: AngleMode = 'RAD',
  ansVal: number = 0
): { result: number | null; formatted: string; error?: string } {
  try {
    const sanitized = sanitizeExpression(expression, ansVal, angleMode);
    const scope = createScope(angleMode);

    // Build safe evaluator
    const paramNames = Object.keys(scope);
    const paramValues = Object.values(scope);

    // Validate characters to prevent arbitrary code execution
    if (/[^0-9a-zA-Z_+\-*/%^().,\s*]/.test(sanitized)) {
      return { result: null, formatted: 'Error', error: 'Invalid characters' };
    }

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(...paramNames, `"use strict"; return (${sanitized});`);
    const rawResult = fn(...paramValues);

    if (typeof rawResult !== 'number' || isNaN(rawResult)) {
      return { result: null, formatted: 'Error', error: 'Invalid calculation' };
    }

    if (!isFinite(rawResult)) {
      return {
        result: rawResult,
        formatted: rawResult > 0 ? 'Infinity' : '-Infinity',
      };
    }

    // Clean floating point artifacts
    const rounded = Number(rawResult.toPrecision(12));
    const formatted = formatNumber(rounded);

    return { result: rounded, formatted };
  } catch (err: any) {
    return {
      result: null,
      formatted: 'Error',
      error: err?.message || 'Syntax Error',
    };
  }
}

/**
 * Compiles a mathematical expression into a fast function f(x) for graphing.
 */
export function compileGraphFunction(
  expression: string,
  angleMode: AngleMode = 'RAD'
): (x: number) => number {
  try {
    // Strip "y =" or "f(x) =" prefix if user entered it
    let clean = expression.replace(/^y\s*=\s*/i, '').replace(/^f\s*\(\s*x\s*\)\s*=\s*/i, '');
    clean = sanitizeExpression(clean, 0, angleMode);

    const scope = createScope(angleMode);
    const paramNames = ['x', ...Object.keys(scope)];
    const paramValues = Object.values(scope);

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(...paramNames, `"use strict"; return (${clean});`);

    return (x: number) => {
      try {
        const val = fn(x, ...paramValues);
        return typeof val === 'number' && isFinite(val) ? val : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return () => NaN;
  }
}

/**
 * Format number with appropriate precision and commas/scientific notation.
 */
export function formatNumber(num: number): string {
  if (isNaN(num)) return 'NaN';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // Handle clean integers
  if (Number.isInteger(num)) {
    if (Math.abs(num) >= 1e14) {
      return num.toExponential(6).replace(/\+/, '');
    }
    return num.toLocaleString('en-US');
  }

  // Very small or large numbers
  if (Math.abs(num) < 1e-6 && num !== 0) {
    return num.toExponential(6);
  }
  if (Math.abs(num) >= 1e12) {
    return num.toExponential(6).replace(/\+/, '');
  }

  // Regular floats: clean floating point noise
  const str = Number(num.toPrecision(10)).toString();
  const parts = str.split('.');
  parts[0] = Number(parts[0]).toLocaleString('en-US');
  return parts.join('.');
}
