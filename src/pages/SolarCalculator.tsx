import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Calculator, Zap, ShieldCheck, Download, Printer } from 'lucide-react';

export default function SolarCalculator() {
  const [monthlyBill, setMonthlyBill] = useState<number>(5000);
  const [ratePerKwh, setRatePerKwh] = useState<number>(11.5); // Average Meralco rate
  const [sunHours, setSunHours] = useState<number>(4.5); // Philippines average peak sun hours
  const [systemSize, setSystemSize] = useState<number>(3.5);
  const [estimatedMonthlyKwh, setEstimatedMonthlyKwh] = useState<number>(0);
  const [estimatedSavings, setEstimatedSavings] = useState<number>(0);
  const [recommendedPanels, setRecommendedPanels] = useState<number>(6);
  const [recommendedBattery, setRecommendedBattery] = useState<number>(5);

  const calculate = () => {
    // Monthly kWh consumed = Monthly Bill / Rate
    const monthlyKwh = monthlyBill / ratePerKwh;
    // Daily kWh consumed = Monthly / 30
    const dailyKwh = monthlyKwh / 30;
    // Required system size (kWp) = Daily kWh / Sun Hours * 1.25 efficiency factor
    const reqSize = (dailyKwh / sunHours) * 1.25;
    const roundedSize = Math.max(2.0, Number(reqSize.toFixed(1)));
    
    setSystemSize(roundedSize);
    setEstimatedMonthlyKwh(Math.round(monthlyKwh));
    setEstimatedSavings(Math.round(monthlyBill * 0.85)); // 85% bill offset
    setRecommendedPanels(Math.round((roundedSize * 1000) / 550)); // Assuming 550W panels
    setRecommendedBattery(roundedSize > 4 ? 10 : 5); // 5kWh or 10kWh lithium battery
  };

  useEffect(() => {
    calculate();
  }, [monthlyBill, ratePerKwh, sunHours]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Solar PV Design & Sizing Calculator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Compute optimal inverter capacity, panel count, and estimated monthly savings for Philippine clients
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          Print Quotation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Client Load Parameters
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Average Monthly Electric Bill (₱)</label>
            <input
              type="number"
              step="500"
              value={monthlyBill}
              onChange={e => setMonthlyBill(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">e.g. Meralco, VECO, or electric cooperative bill</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Electricity Rate (₱ / kWh)</label>
            <input
              type="number"
              step="0.5"
              value={ratePerKwh}
              onChange={e => setRatePerKwh(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Standard residential composite rate (~₱11.50/kWh)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Peak Sun Hours (PH Average)</label>
            <input
              type="number"
              step="0.1"
              value={sunHours}
              onChange={e => setSunHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Philippines tropical peak sun hours (4.5 - 5.2 hrs)</span>
          </div>
        </div>

        {/* Calculated Results Showcase */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#0c192e] to-[#08203e] text-white rounded-xl shadow-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase tracking-wider text-teal-400 font-bold">Recommended System Architecture</span>
              <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded font-semibold">Net Metering Ready</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Recommended PV Size</span>
                <span className="text-3xl font-extrabold text-emerald-400 mt-1 block tabular-nums">{systemSize} kWp</span>
                <span className="text-[10px] text-slate-300 mt-1 block">{recommendedPanels} pcs 550W Monocrystalline Panels</span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Energy Storage (Hybrid)</span>
                <span className="text-3xl font-extrabold text-teal-400 mt-1 block tabular-nums">{recommendedBattery} kWh</span>
                <span className="text-[10px] text-slate-300 mt-1 block">LiFePO4 Rack Battery Bank</span>
              </div>
            </div>

            <div className="mt-6 space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Monthly Generation:</span>
                <span className="font-bold text-white tabular-nums">~{estimatedMonthlyKwh} kWh / month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Monthly Savings (85% Bill Offset):</span>
                <span className="font-bold text-emerald-400 tabular-nums">₱{estimatedSavings.toLocaleString()} / month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Annual Savings:</span>
                <span className="font-bold text-emerald-400 tabular-nums">₱{(estimatedSavings * 12).toLocaleString()} / year</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-6 text-[11px] text-slate-400 flex items-center justify-between">
            <span>SolarCare PH Engineering Suite</span>
            <span>Standard Philippine Grid Code Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
