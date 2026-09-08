import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Upload,
  Table,
  Code,
  CheckCircle2,
  Info,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { HistoryItem } from '../types';
import {
  generateHistoryCSV,
  downloadCSVFile,
  copyCSVToClipboard,
  parseHistoryCSV,
} from '../utils/csvExport';

interface ExportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onImportHistory?: (items: HistoryItem[], mode: 'append' | 'replace') => void;
}

export const ExportHistoryModal: React.FC<ExportHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onImportHistory,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState<'table' | 'raw'>('table');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importCount, setImportCount] = useState<number>(0);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const csvContent = generateHistoryCSV(history);
  const rawTextWithoutBOM = csvContent.startsWith('\uFEFF')
    ? csvContent.slice(1)
    : csvContent;

  const handleDownload = () => {
    downloadCSVFile(csvContent);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleCopy = async () => {
    const success = await copyCSVToClipboard(csvContent);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const parsed = parseHistoryCSV(text);
        if (parsed.length > 0) {
          if (onImportHistory) {
            onImportHistory(parsed, importMode);
          }
          setImportCount(parsed.length);
          setImportStatus('success');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('error');
          setTimeout(() => setImportStatus(null), 3000);
        }
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Date span calculation
  let dateSpan = 'No records';
  if (history.length > 0) {
    const timestamps = history.map((h) => h.timestamp).sort((a, b) => a - b);
    const earliest = new Date(timestamps[0]).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    const latest = new Date(timestamps[timestamps.length - 1]).toLocaleDateString(
      undefined,
      {
        month: 'short',
        day: 'numeric',
      }
    );
    dateSpan = earliest === latest ? earliest : `${earliest} – ${latest}`;
  }

  // Parse first 5 preview rows for table
  const previewLines = rawTextWithoutBOM
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  const previewHeaders = previewLines[0]?.split(',') || [];
  const previewData = previewLines.slice(1, 6).map((line) => {
    // Basic CSV cell split
    const cells: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQ = !inQ;
      } else if (line[i] === ',' && !inQ) {
        cells.push(cur.replace(/^"|"$/g, ''));
        cur = '';
      } else {
        cur += line[i];
      }
    }
    cells.push(cur.replace(/^"|"$/g, ''));
    return cells;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#111111] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#161616] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Export History (CSV)
              </h3>
              <p className="text-xs text-neutral-400">
                Backup calculation records & export for external analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#242424] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs select-none">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[11px] font-medium uppercase tracking-wider">
                  Entries
                </span>
              </div>
              <div className="text-2xl font-black text-white font-sans">
                {history.length}
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                calculations saved
              </span>
            </div>

            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[11px] font-medium uppercase tracking-wider">
                  Span
                </span>
              </div>
              <div className="text-sm font-bold text-white font-mono truncate">
                {dateSpan}
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                time range
              </span>
            </div>

            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 col-span-2 sm:col-span-1 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium uppercase tracking-wider">
                  Encoding
                </span>
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                UTF-8 + BOM
              </div>
              <span className="text-[10px] text-neutral-500">
                Excel & Sheets ready
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              id="btn-download-csv-file"
              disabled={history.length === 0}
              onClick={handleDownload}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                history.length === 0
                  ? 'bg-[#1C1C1C] text-neutral-500 cursor-not-allowed border border-[#262626]'
                  : downloadSuccess
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-orange-500 hover:bg-orange-400 text-black font-black shadow-lg shadow-orange-500/20'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>File Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download .CSV File</span>
                </>
              )}
            </button>

            <button
              id="btn-copy-csv-clipboard"
              disabled={history.length === 0}
              onClick={handleCopy}
              className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] border ${
                history.length === 0
                  ? 'bg-[#1C1C1C] text-neutral-500 border-[#262626] cursor-not-allowed'
                  : copySuccess
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#1C1C1C] hover:bg-[#252525] border-[#2C2C2C] text-neutral-200'
              }`}
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>

          {/* Format & Compatibility Notice */}
          <div className="bg-[#141414] border border-[#222222] rounded-xl p-3 text-neutral-300">
            <div className="flex items-start gap-2 mb-2">
              <Info className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">
                  Designed for External Analysis & Tooling
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Exported CSV includes dedicated columns: <code className="text-orange-400">Timestamp_ISO</code>,{' '}
                  <code className="text-orange-400">Timestamp_Unix_ms</code>,{' '}
                  <code className="text-orange-400">Expression</code>, <code className="text-orange-400">Result</code>, and a dedicated{' '}
                  <code className="text-orange-400">Numeric_Value</code> column stripped of formatting for instant calculations (SUM, AVERAGE, regressions) in:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Microsoft Excel', 'Google Sheets', 'Python (pandas)', 'R / RStudio', 'Jupyter', 'Apple Numbers'].map(
                (tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 rounded-md bg-[#1E1E1E] border border-[#2B2B2B] text-[10px] font-mono text-neutral-300"
                  >
                    {tool}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Interactive Preview Section */}
          <div className="border border-[#222222] rounded-xl overflow-hidden bg-[#141414]">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full px-4 py-2.5 bg-[#181818] flex items-center justify-between text-neutral-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2 font-medium">
                <Table className="w-3.5 h-3.5 text-orange-400" />
                <span>Data Preview {history.length > 0 && `(First 5 of ${history.length} rows)`}</span>
              </div>
              <span className="text-[11px] text-orange-400 hover:underline">
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </span>
            </button>

            {showPreview && (
              <div className="p-3 border-t border-[#222222] space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setPreviewTab('table')}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
                      previewTab === 'table'
                        ? 'bg-orange-500 text-black font-bold'
                        : 'bg-[#1C1C1C] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Table className="w-3 h-3" />
                    <span>Table View</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('raw')}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
                      previewTab === 'raw'
                        ? 'bg-orange-500 text-black font-bold'
                        : 'bg-[#1C1C1C] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    <span>Raw CSV Text</span>
                  </button>
                </div>

                {previewTab === 'table' ? (
                  <div className="overflow-x-auto max-h-48 border border-[#262626] rounded-lg">
                    <table className="w-full text-left font-mono text-[10px]">
                      <thead className="bg-[#1C1C1C] text-neutral-400 border-b border-[#262626]">
                        <tr>
                          {previewHeaders.map((header, idx) => (
                            <th key={idx} className="px-2.5 py-1.5 whitespace-nowrap">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222] text-neutral-300">
                        {previewData.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-[#1A1A1A]">
                            {row.map((val, colIdx) => (
                              <td
                                key={colIdx}
                                className={`px-2.5 py-1.5 whitespace-nowrap ${
                                  colIdx === 6
                                    ? 'text-orange-400 font-bold'
                                    : colIdx === 7
                                    ? 'text-emerald-400'
                                    : ''
                                }`}
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="relative">
                    <pre className="p-2.5 rounded-lg bg-[#0C0C0C] border border-[#222222] text-[10px] font-mono text-neutral-300 overflow-x-auto max-h-40 whitespace-pre">
                      {rawTextWithoutBOM}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Backup Restore Section */}
          <div className="bg-[#141414] border border-[#222222] rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-white">Restore History from Backup</span>
              </div>

              {/* Mode switch: append or replace */}
              <div className="flex items-center bg-[#1A1A1A] rounded-lg p-0.5 text-[10px] font-mono">
                <button
                  onClick={() => setImportMode('append')}
                  className={`px-2 py-0.5 rounded ${
                    importMode === 'append'
                      ? 'bg-orange-500 text-black font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Add imported items to existing history"
                >
                  Merge
                </button>
                <button
                  onClick={() => setImportMode('replace')}
                  className={`px-2 py-0.5 rounded ${
                    importMode === 'replace'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Replace existing history with backup file"
                >
                  Replace
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 mb-3">
              Upload a previously exported calculation history CSV file to restore saved equations.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-importer"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-lg bg-[#1D1D1D] hover:bg-[#252525] border border-[#2E2E2E] text-neutral-200 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-neutral-400" />
              <span>Select CSV File to Restore</span>
            </button>

            {importStatus === 'success' && (
              <div className="mt-2.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Successfully restored {importCount} calculation records!</span>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="mt-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
                <X className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Could not parse valid calculations from the uploaded CSV file.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#161616] border-t border-[#222222] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#252525] hover:bg-[#303030] text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
