"use client";
import { useState } from "react";

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function InvestmentCalculator({ price, noi, capRate }: { price: number; noi: number; capRate?: number | null }) {
  const [downPct, setDownPct] = useState(25);
  const [interestRate, setInterestRate] = useState(5.5);
  const [amort, setAmort] = useState(25);

  const downPayment = (price * downPct) / 100;
  const loanAmt = price - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = amort * 12;
  const monthlyMortgage = loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const annualDebtService = monthlyMortgage * 12;
  const cashFlow = noi - annualDebtService;
  const cashOnCash = (cashFlow / downPayment) * 100;
  const dscr = noi / annualDebtService;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4 text-sm">Investment Calculator</h3>
      <div className="space-y-4 mb-5">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Down Payment</span>
            <span className="font-semibold text-slate-900">{downPct}% — {fmt(downPayment)}</span>
          </div>
          <input type="range" min={10} max={100} step={5} value={downPct} onChange={(e) => setDownPct(Number(e.target.value))} className="w-full accent-blue-600" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Interest Rate</span>
            <span className="font-semibold text-slate-900">{interestRate}%</span>
          </div>
          <input type="range" min={3} max={9} step={0.25} value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full accent-blue-600" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Amortization</span>
            <span className="font-semibold text-slate-900">{amort} years</span>
          </div>
          <input type="range" min={15} max={30} step={5} value={amort} onChange={(e) => setAmort(Number(e.target.value))} className="w-full accent-blue-600" />
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
        {[
          { label: "Annual Debt Service", value: fmt(annualDebtService), sub: `${fmt(monthlyMortgage)}/mo` },
          { label: "Annual Cash Flow", value: fmt(cashFlow), pos: cashFlow > 0, neg: cashFlow < 0 },
          { label: "Cash-on-Cash Return", value: `${cashOnCash.toFixed(1)}%`, pos: cashOnCash > 6, neg: cashOnCash < 3 },
          { label: "DSCR", value: dscr.toFixed(2), pos: dscr > 1.25, neg: dscr < 1.0, sub: dscr >= 1 ? "✓ Above 1.0" : "⚠ Below 1.0" },
          { label: "Cap Rate", value: capRate ? `${(capRate * 100).toFixed(2)}%` : "—" },
        ].map((r) => (
          <div key={r.label} className="flex justify-between items-center text-sm">
            <span className="text-slate-500 text-xs">{r.label}</span>
            <div className="text-right">
              <span className={`font-bold text-sm ${r.pos ? "text-green-600" : r.neg ? "text-red-600" : "text-slate-900"}`}>{r.value}</span>
              {r.sub && <div className="text-xs text-slate-400">{r.sub}</div>}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3">Illustrative only. Consult a licensed mortgage broker.</p>
    </div>
  );
}
