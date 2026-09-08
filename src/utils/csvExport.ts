import { HistoryItem } from '../types';

/**
 * Escapes a single CSV cell value according to RFC 4180
 */
function escapeCSVCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Extracts a pure numeric string suitable for spreadsheets and data analysis
 */
function extractNumericValue(resultStr: string): string {
  if (!resultStr || resultStr === 'Error') return '';
  // Remove commas used in formatting (e.g. 1,000,000 -> 1000000)
  const sanitized = resultStr.replace(/,/g, '').trim();
  const num = Number(sanitized);
  return !isNaN(num) && isFinite(num) ? sanitized : '';
}

/**
 * Generates an RFC 4180 compliant CSV string from calculation history
 * with UTF-8 BOM (\uFEFF) for native Excel/Google Sheets compatibility
 */
export function generateHistoryCSV(history: HistoryItem[]): string {
  const headers = [
    'Index',
    'Timestamp_ISO',
    'Timestamp_Unix_ms',
    'Date_Local',
    'Time_Local',
    'Expression',
    'Result',
    'Numeric_Value',
  ];

  const headerLine = headers.join(',');

  const dataLines = history.map((item, index) => {
    const dateObj = new Date(item.timestamp);
    const isoString = dateObj.toISOString();
    const localDate = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const localTime = dateObj.toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS
    const numericVal = extractNumericValue(item.result);

    const row = [
      index + 1,
      escapeCSVCell(isoString),
      item.timestamp,
      escapeCSVCell(localDate),
      escapeCSVCell(localTime),
      escapeCSVCell(item.expression),
      escapeCSVCell(item.result),
      numericVal,
    ];

    return row.join(',');
  });

  // Prepend UTF-8 BOM so Excel opens Greek/math symbols (π, √, ×, ÷, −, etc.) correctly
  return '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
}

/**
 * Downloads the CSV string as a physical .csv file
 */
export function downloadCSVFile(csvContent: string, filename?: string): void {
  const defaultFilename = `calculator_history_${new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[:T]/g, '-')}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies the CSV data to clipboard
 */
export async function copyCSVToClipboard(csvContent: string): Promise<boolean> {
  try {
    // Strip BOM when copying text to clipboard
    const textToCopy = csvContent.startsWith('\uFEFF') ? csvContent.slice(1) : csvContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Parses an exported or external CSV file back into HistoryItem[]
 * Supports both standard 3-column (Timestamp,Expression,Result) and our 8-column format
 */
export function parseHistoryCSV(csvText: string): HistoryItem[] {
  // Strip UTF-8 BOM if present
  const cleanText = csvText.startsWith('\uFEFF') ? csvText.slice(1) : csvText;
  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headerLine = lines[0].toLowerCase();
  const isEightColumn = headerLine.includes('timestamp_iso') || headerLine.includes('numeric_value');

  const parsedItems: HistoryItem[] = [];

  // Parse CSV line taking quotes into account
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 2) continue;

    let timestamp = Date.now() - (lines.length - i) * 60000;
    let expression = '';
    let result = '';

    if (isEightColumn && cols.length >= 7) {
      // Index, Timestamp_ISO, Timestamp_Unix_ms, Date_Local, Time_Local, Expression, Result, Numeric_Value
      const unixParsed = parseInt(cols[2], 10);
      const isoParsed = Date.parse(cols[1]);
      if (!isNaN(unixParsed) && unixParsed > 0) {
        timestamp = unixParsed;
      } else if (!isNaN(isoParsed)) {
        timestamp = isoParsed;
      }
      expression = cols[5] || '';
      result = cols[6] || '';
    } else if (cols.length >= 3) {
      // Standard 3-column: Timestamp, Expression, Result
      const parsedDate = Date.parse(cols[0]);
      if (!isNaN(parsedDate)) {
        timestamp = parsedDate;
      }
      expression = cols[1] || '';
      result = cols[2] || '';
    } else if (cols.length === 2) {
      // 2-column: Expression, Result
      expression = cols[0] || '';
      result = cols[1] || '';
    }

    if (expression.trim() || result.trim()) {
      parsedItems.push({
        id: `imported-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        expression: expression.trim(),
        result: result.trim() || '0',
        timestamp,
      });
    }
  }

  return parsedItems;
}
