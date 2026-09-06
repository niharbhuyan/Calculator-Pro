import { UnitCategory, UnitDefinition } from '../types';

export interface CategoryData {
  id: UnitCategory;
  name: string;
  iconName: string;
  units: UnitDefinition[];
  defaultFrom: string;
  defaultTo: string;
}

export const UNIT_CATEGORIES: CategoryData[] = [
  {
    id: 'length',
    name: 'Length',
    iconName: 'Ruler',
    defaultFrom: 'km',
    defaultTo: 'mi',
    units: [
      { id: 'km', name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'm', name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: (v) => v * 0.01, fromBase: (v) => v / 0.01 },
      { id: 'mm', name: 'Millimeters', symbol: 'mm', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      { id: 'mi', name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { id: 'yd', name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: 'ft', name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'in', name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: 'nmi', name: 'Nautical Miles', symbol: 'nmi', toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    iconName: 'Thermometer',
    defaultFrom: 'c',
    defaultTo: 'f',
    units: [
      {
        id: 'c',
        name: 'Celsius',
        symbol: '°C',
        toBase: (c) => c + 273.15, // Base is Kelvin
        fromBase: (k) => k - 273.15,
      },
      {
        id: 'f',
        name: 'Fahrenheit',
        symbol: '°F',
        toBase: (f) => ((f - 32) * 5) / 9 + 273.15,
        fromBase: (k) => ((k - 273.15) * 9) / 5 + 32,
      },
      {
        id: 'k',
        name: 'Kelvin',
        symbol: 'K',
        toBase: (k) => k,
        fromBase: (k) => k,
      },
    ],
  },
  {
    id: 'weight',
    name: 'Weight & Mass',
    iconName: 'Scale',
    defaultFrom: 'kg',
    defaultTo: 'lb',
    units: [
      { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'g', name: 'Grams', symbol: 'g', toBase: (v) => v, fromBase: (v) => v }, // Base is Grams
      { id: 'mg', name: 'Milligrams', symbol: 'mg', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: (v) => v * 453.59237, fromBase: (v) => v / 453.59237 },
      { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: (v) => v * 28.3495231, fromBase: (v) => v / 28.3495231 },
      { id: 't', name: 'Metric Tons', symbol: 't', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
      { id: 'st', name: 'Stones', symbol: 'st', toBase: (v) => v * 6350.29318, fromBase: (v) => v / 6350.29318 },
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    iconName: 'Gauge',
    defaultFrom: 'kmh',
    defaultTo: 'mph',
    units: [
      { id: 'kmh', name: 'Kilometers per hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: 'mph', name: 'Miles per hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: 'ms', name: 'Meters per second', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kn', name: 'Knots', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    iconName: 'Square',
    defaultFrom: 'sqm',
    defaultTo: 'sqft',
    units: [
      { id: 'sqm', name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
      { id: 'sqkm', name: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'sqft', name: 'Square Feet', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: 'acre', name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      { id: 'hectare', name: 'Hectares', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    iconName: 'Beaker',
    defaultFrom: 'l',
    defaultTo: 'gal',
    units: [
      { id: 'l', name: 'Liters', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ml', name: 'Milliliters', symbol: 'mL', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      { id: 'gal', name: 'Gallons (US)', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { id: 'qt', name: 'Quarts', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
      { id: 'pt', name: 'Pints', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
      { id: 'cup', name: 'Cups', symbol: 'cup', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
      { id: 'floz', name: 'Fluid Ounces (US)', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
      { id: 'cum', name: 'Cubic Meters', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
  {
    id: 'data',
    name: 'Digital Data',
    iconName: 'HardDrive',
    defaultFrom: 'mb',
    defaultTo: 'gb',
    units: [
      { id: 'b', name: 'Bytes', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kb', name: 'Kilobytes', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'mb', name: 'Megabytes', symbol: 'MB', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      { id: 'gb', name: 'Gigabytes', symbol: 'GB', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
      { id: 'tb', name: 'Terabytes', symbol: 'TB', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
    ],
  },
];

export function convertValue(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  category: UnitCategory
): number {
  const cat = UNIT_CATEGORIES.find((c) => c.id === category);
  if (!cat) return value;

  const from = cat.units.find((u) => u.id === fromUnitId);
  const to = cat.units.find((u) => u.id === toUnitId);
  if (!from || !to) return value;

  const inBase = from.toBase(value);
  return to.fromBase(inBase);
}
