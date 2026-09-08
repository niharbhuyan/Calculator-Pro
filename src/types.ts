export type CalculatorMode =
  | 'scientific'
  | 'graphing'
  | 'programmer'
  | 'matrix'
  | 'statistics'
  | 'financial'
  | 'converter'
  | 'history';

export type AngleMode = 'RAD' | 'DEG';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface GraphFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  isValid: boolean;
  errorMessage?: string;
}

export interface GraphWindow {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export type UnitCategory =
  | 'length'
  | 'temperature'
  | 'weight'
  | 'speed'
  | 'area'
  | 'volume'
  | 'data';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

export interface ScientificConstant {
  id: string;
  symbol: string;
  name: string;
  category: 'Physics' | 'Chemistry' | 'Universal' | 'Astronomy';
  value: number;
  unit: string;
}

export type WordSize = 64 | 32 | 16 | 8;
export type NumberBase = 'HEX' | 'DEC' | 'OCT' | 'BIN';

export interface StatisticsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  stdDevPop: number;
  stdDevSample: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
}

