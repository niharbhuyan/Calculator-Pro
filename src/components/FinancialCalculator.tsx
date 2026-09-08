import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Calendar, Percent, Copy, Check } from 'lucide-react';
import { playKeySound, triggerHapticVibration } from '../utils/audio';

type FinMode = 'loan' | 'compound';

export const FinancialCalculator: React.FC<{
  onInsertToCalculator?: (val: string) => void;
}> = ({ onInsertToCalculator }) => {
  const [finMode, setFinMode] = useState<FinMode>('loan');
  const [copied, setCopied] = useState<string | null>(null);

  // Loan inputs
  const [loanPrincipal, setLoanPrincipal] = useState<number>(250000);
  const [loanRate, setLoanRate] = useState<number>(6.5);
  const [loanYears, setLoanYears] = useState<number>(30);

  // Compound Interest inputs
  const [initPrincipal, setInitPrincipal] = useState<number>(10000);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(500);
  const [compoundRate, setCompoundRate] = useState<number>(8);
  const [compoundYears, setCompoundYears] = useState<number>(20);

  // Loan Calculations
  const loanSummary = useMemo(() => {
    const P = loanPrincipal;
    const annualRate = loanRate / 100;
    const monthlyRate = annualRate / 12;
    const totalMonths = loanYears * 12;

    if (P <= 0 || totalMonths <= 0) return null;

    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = P / totalMonths;
    } else {
      monthlyPayment =
        (P * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - P;
    const interestPercent = (totalInterest / totalPayment) * 100;

    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      interestPercent: Math.round(interestPercent * 10) / 10,
    };
  }, [loanPrincipal, loanRate, loanYears]);

  // Compound Interest Calculations
  const compoundSummary = useMemo(() => {
    const P = initPrincipal;
    const PMT = monthlyDeposit;
    const r = compoundRate / 100 / 12;
    const n = compoundYears * 12;

    if (n <= 0) return null;

    // Future value of lump sum + future value of series
    const fvPrincipal = P * Math.pow(1 + r, n);
    const fvSeries = r > 0 ? (PMT * (Math.pow(1 + r, n) - 1)) / r : PMT * n;
    const futureValue = fvPrincipal + fvSeries;
    const totalDeposited = P + PMT * n;
    const totalInterest = futureValue - totalDeposited;

    return {
      futureValue: Math.round(futureValue * 100) / 100,
      totalDeposited: Math.round(totalDeposited * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      interestPercent: Math.round((totalInterest / futureValue) * 1000) / 10,
    };
  }, [initPrincipal, monthlyDeposit, compoundRate, compoundYears]);

  const copyVal = (key: string, val: number) => {
    navigator.clipboard?.writeText(val.toString());
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-y-auto p-3.5 gap-3.5">
      {/* Top Segmented Tabs */}
      <div className="flex bg-[#161616] p-1 rounded-2xl border border-[#252525] self-start">
        <button
          onClick={() => {
            playKeySound('func');
            setFinMode('loan');
          }}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            finMode === 'loan'
              ? 'bg-orange-500 text-black shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Mortgage & Loan
        </button>
        <button
          onClick={() => {
            playKeySound('func');
            setFinMode('compound');
          }}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            finMode === 'compound'
              ? 'bg-orange-500 text-black shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Compound Growth
        </button>
      </div>

      {finMode === 'loan' ? (
        /* Loan Section */
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Principal */}
            <div className="bg-[#141414] border border-[#242424] rounded-2xl p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 font-mono">
                Loan Amount ($)
              </span>
              <input
                type="number"
                value={loanPrincipal}
                onChange={(e) => setLoanPrincipal(parseFloat(e.target.value) || 0)}
                className="bg-[#1F1F1F] border border-[#303030] focus:border-orange-500 rounded-xl px-2.5 py-1.5 font-mono text-sm text-white outline-none"
              />
            </div>

            {/* Interest Rate */}
            <div className="bg-[#141414] border border-[#242424] rounded-2xl p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 font-mono">
                Interest Rate (%/yr)
              </span>
              <input
                type="number"
                step="0.1"
                value={loanRate}
                onChange={(e) => setLoanRate(parseFloat(e.target.value) || 0)}
                className="bg-[#1F1F1F] border border-[#303030] focus:border-orange-500 rounded-xl px-2.5 py-1.5 font-mono text-sm text-white outline-none"
              />
            </div>

            {/* Loan Term */}
            <div className="bg-[#141414] border border-[#242424] rounded-2xl p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 font-mono">
                Term (Years)
              </span>
              <div className="flex gap-1">
                {[15, 30].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setLoanYears(yr)}
                    className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold ${
                      loanYears === yr
                        ? 'bg-orange-500 text-black'
                        : 'bg-[#202020] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {yr}y
                  </button>
                ))}
                <input
                  type="number"
                  value={loanYears}
                  onChange={(e) => setLoanYears(parseInt(e.target.value) || 1)}
                  className="w-14 bg-[#1F1F1F] border border-[#303030] focus:border-orange-500 rounded-lg text-center font-mono text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          {loanSummary && (
            <div className="bg-[#141414] border border-[#242424] rounded-3xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 font-mono">
                    Estimated Monthly Payment
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-orange-400">
                    ${loanSummary.monthlyPayment.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyVal('payment', loanSummary.monthlyPayment)}
                    className="p-1.5 bg-[#202020] hover:bg-[#282828] text-neutral-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-1"
                  >
                    {copied === 'payment' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy</span>
                  </button>
                  {onInsertToCalculator && (
                    <button
                      onClick={() =>
                        onInsertToCalculator(loanSummary.monthlyPayment.toString())
                      }
                      className="px-2.5 py-1.5 bg-orange-500/20 text-orange-400 font-bold hover:bg-orange-500/30 rounded-xl text-xs"
                    >
                      Use in Calc →
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar of Principal vs Interest */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">
                    Principal: ${(loanPrincipal).toLocaleString()} (
                    {(100 - loanSummary.interestPercent).toFixed(1)}%)
                  </span>
                  <span className="text-orange-400">
                    Interest: ${loanSummary.totalInterest.toLocaleString()} (
                    {loanSummary.interestPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-[#242424] rounded-full overflow-hidden flex">
                  <div
                    className="bg-neutral-400 h-full transition-all"
                    style={{
                      width: `${100 - loanSummary.interestPercent}%`,
                    }}
                  />
                  <div
                    className="bg-orange-500 h-full transition-all"
                    style={{
                      width: `${loanSummary.interestPercent}%`,
                    }}
                  />
                </div>
              </div>

              {/* Secondary details */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#181818] p-2.5 rounded-xl border border-[#222]">
                  <span className="text-neutral-500 text-[10px]">
                    Total Loan Cost
                  </span>
                  <div className="font-bold text-white mt-0.5">
                    ${loanSummary.totalPayment.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[#181818] p-2.5 rounded-xl border border-[#222]">
                  <span className="text-neutral-500 text-[10px]">
                    Total Payments
                  </span>
                  <div className="font-bold text-white mt-0.5">
                    {loanYears * 12} months
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Compound Growth Section */
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#141414] border border-[#242424] rounded-2xl p-2.5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 font-mono">
                Initial ($)
              </span>
              <input
                type="number"
                value={initPrincipal}
                onChange={(e) => setInitPrincipal(parseFloat(e.target.value) || 0)}
                className="bg-[#1F1F1F] border border-[#303030] focus:border-orange-500 rounded-xl px-2 py-1.5 font-mono text-xs text-white outline-none"
              />
            </div>

            <div className="bg-[#141414] border border-[#242424] rounded-2xl p-2.5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 font-mono">
                Monthly ($)
              </span>
              <input
                type="number"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(parseFloat(e.target.value) || 0)}
                className="bg-[#1F1F1F] border border-[#303030] focus:border-orange-500 rounded-xl px-2 py-1.5 font-mono text-xs text-white outline-none"
              />
            </div>

            <div className="bg-[#141414] border border-[#242424] rounded-2xl p-2.5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 font-mono">
                Rate (%/yr)
              </span>
              <input
                type="number"
                step="0.5"
                value={compoundRate}
                onChange={(e) => setCompoundRate(parseFloat(e.target.value) || 0)}
                className="bg-[#1F1F1F] border border-[#303030] focus:border-orange-500 rounded-xl px-2 py-1.5 font-mono text-xs text-white outline-none"
              />
            </div>

            <div className="bg-[#141414] border border-[#242424] rounded-2xl p-2.5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 font-mono">
                Horizon (Years)
              </span>
              <input
                type="number"
                value={compoundYears}
                onChange={(e) => setCompoundYears(parseInt(e.target.value) || 1)}
                className="bg-[#1F1F1F] border border-[#303030] focus:border-orange-500 rounded-xl px-2 py-1.5 font-mono text-xs text-white outline-none"
              />
            </div>
          </div>

          {compoundSummary && (
            <div className="bg-[#141414] border border-[#242424] rounded-3xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 font-mono">
                    Future Investment Balance
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
                    ${compoundSummary.futureValue.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => copyVal('compound', compoundSummary.futureValue)}
                  className="p-1.5 bg-[#202020] hover:bg-[#282828] text-neutral-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-1"
                >
                  {copied === 'compound' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy</span>
                </button>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#181818] p-2.5 rounded-xl border border-[#222]">
                  <span className="text-neutral-500 text-[10px]">
                    Your Total Deposits
                  </span>
                  <div className="font-bold text-neutral-200 mt-0.5">
                    ${compoundSummary.totalDeposited.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[#181818] p-2.5 rounded-xl border border-[#222]">
                  <span className="text-emerald-400 text-[10px]">
                    Compound Interest Earned
                  </span>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    +${compoundSummary.totalInterest.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
