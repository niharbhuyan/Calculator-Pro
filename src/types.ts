export type CalculatorMode = 'scientific' | 'graphing' | 'converter' | 'history';

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

export type UnitCategory = 'length' | 'temperature' | 'weight' | 'speed' | 'area' | 'volume' | 'data';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}
